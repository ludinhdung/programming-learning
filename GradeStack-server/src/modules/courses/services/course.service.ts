import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";
import { sendEmail } from "../../../shared/utils/email.service";

interface FindCoursesParams {
  topicId?: string;
  instructorId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  select?: string;
}

const prisma = new PrismaClient();

export class CourseService {
  async findCourses({
    topicId,
    instructorId,
    search,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    select,
  }: FindCoursesParams) {
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (topicId) {
      where.CourseTopic = {
        some: {
          topicId,
        },
      };
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const totalCount = await prisma.course.count({ where });

    let includeInstructor = true;
    let includeCourseTopic = true;

    if (select) {
      const fields = select.split(",");
      includeInstructor = fields.some((field) =>
        field.startsWith("instructor")
      );
      includeCourseTopic = fields.some((field) =>
        field.startsWith("CourseTopic")
      );
    }

    const include: any = {};

    if (includeInstructor) {
      include.instructor = {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      };
    }

    if (includeCourseTopic) {
      include.CourseTopic = {
        include: {
          topic: true,
        },
      };
    }

    const courses = await prisma.course.findMany({
      where,
      include: Object.keys(include).length > 0 ? include : undefined,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    });

    return {
      data: courses,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getCourseById(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        thumbnail: true,
        isPublished: true,
        instructor: {
          select: {
            userId: true,
          },
        },
        CourseFeedback: {
          select: {
            rating: true,
          },
        },
        modules: {
          select: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const totalLessons = course.modules.reduce(
      (total, module) => total + module.lessons.length,
      0
    );

    const averageRating =
      course.CourseFeedback.length > 0
        ? course.CourseFeedback.reduce(
          (sum, feedback) => sum + feedback.rating,
          0
        ) / course.CourseFeedback.length
        : 0;

    const { modules, CourseFeedback, ...courseWithoutModules } = course;
    return {
      ...courseWithoutModules,
      totalLessons,
      averageRating: Number(averageRating.toFixed(1)),
      totalRatings: course.CourseFeedback.length,
    };
  }

  async getCoursebyCourseId(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        CourseTopic: {
          include: {
            topic: true,
          },
        },
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        CourseFeedback: true,
        modules: {
          include: {
            lessons: {
              include: {
                video: true,
                coding: true,
                finalTest: {
                  include: {
                    questions: {
                      include: {
                        answers: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course;
  }

  async getAllCourses() {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        CourseTopic: true,
        CourseFeedback: true,
        modules: true,
      },
    });
    return courses;
  }

  async getUnpublishedCourses() {
    return await prisma.course.findMany({
      where: {
        isPublished: false,
      },
      include: {
        instructor: {
          include: {
            user: true,
          },
        },
        modules: {
          include: {
            lessons: true,
          },
        },
        CourseTopic: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async toggleCoursePublishStatus(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error("Course not found");
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: !course.isPublished,
        updatedAt: new Date(),
      },
    });


    // If course was just published (not unpublished), send email notification
    if (!course.isPublished && updatedCourse.isPublished) {
      try {
        const instructorEmail = course.instructor.user.email;
        const instructorName = `${course.instructor.user.firstName} ${course.instructor.user.lastName}`;

        const emailSubject = "Congratulations! Your course has been published";
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #1b55ac;">Course Verification Successful!</h2>
            <p>Hello ${instructorName},</p>
            <p>We're pleased to inform you that your course <strong>${course.title}</strong> has been verified and is now published on our platform.</p>
            <p>Your course is now available for students to enroll and begin learning.</p>
            <p style="margin-top: 30px;">Thank you for contributing to our learning community!</p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
              <p>GradeStacks Team</p>
            </div>
          </div>
        `;

        await sendEmail(instructorEmail, emailSubject, emailContent);
      } catch (error) {
        console.error("Failed to send email notification:", error);
        // Don't throw - we still want to return the updated course even if email fails
      }
    }

    return updatedCourse;
  }

  async getStudentEnrolledCourses(courseId: string) {
    const enrolledStudents = await prisma.enrolledCourse.findMany({
      where: {
        courseId: courseId,
      },
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return enrolledStudents;
  }
}
