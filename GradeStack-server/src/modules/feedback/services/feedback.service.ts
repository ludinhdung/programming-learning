import { PrismaClient } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";

const prisma = new PrismaClient();

export class FeedbackService {
  async submitCourseFeedback(
    learnerId: string,
    courseId: string,
    rating: number,
    comment?: string
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Kiểm tra đã enrolled chưa
        const enrollment = await tx.enrolledCourse.findUnique({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
        });

        if (!enrollment) {
          throw new AppError(
            "You must be enrolled in the course to submit feedback",
            400
          );
        }

        // Kiểm tra đã có feedback chưa
        const existingFeedback = await tx.courseFeedback.findUnique({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
        });

        if (existingFeedback) {
          throw new AppError(
            "You have already submitted feedback for this course. Use update instead.",
            400
          );
        }

        // Tạo feedback mới
        const feedback = await tx.courseFeedback.create({
          data: {
            learnerId,
            courseId,
            rating,
            comment,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        });

        // Cập nhật average rating
        const averageRating = await tx.courseFeedback.aggregate({
          where: {
            courseId,
          },
          _avg: {
            rating: true,
          },
        });

        await tx.course.update({
          where: {
            id: courseId,
          },
          data: {
            averageRating: averageRating._avg.rating || 0,
          },
        });

        return feedback;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to create course feedback", 500);
    }
  }

  async updateCourseFeedback(
    learnerId: string,
    courseId: string,
    rating: number,
    comment?: string
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Kiểm tra feedback có tồn tại không
        const existingFeedback = await tx.courseFeedback.findUnique({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
        });

        if (!existingFeedback) {
          throw new AppError(
            "Feedback not found. Create new feedback instead.",
            404
          );
        }

        // Update feedback
        const feedback = await tx.courseFeedback.update({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
          data: {
            rating,
            comment,
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        });

        // Cập nhật average rating
        const averageRating = await tx.courseFeedback.aggregate({
          where: {
            courseId,
          },
          _avg: {
            rating: true,
          },
        });

        await tx.course.update({
          where: {
            id: courseId,
          },
          data: {
            averageRating: averageRating._avg.rating || 0,
          },
        });

        return feedback;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update course feedback", 500);
    }
  }

  // Get all feedback for a course
  async getCourseFeedback(courseId: string) {
    try {
      return await prisma.courseFeedback.findMany({
        where: {
          courseId,
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          learner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new AppError("Failed to get course feedback", 500);
    }
  }

  // Get feedback by learner
  async getLearnerCourseFeedback(learnerId: string, courseId: string) {
    try {
      return await prisma.courseFeedback.findUnique({
        where: {
          learnerId_courseId: {
            learnerId,
            courseId,
          },
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError("Failed to get learner's course feedback", 500);
    }
  }

  // lấy thống kê rating của course
  async getCourseRatingStats(courseId: string) {
    try {
      const stats = await prisma.courseFeedback.groupBy({
        by: ["rating"],
        where: {
          courseId,
        },
        _count: {
          rating: true,
        },
      });

      const totalFeedback = await prisma.courseFeedback.count({
        where: {
          courseId,
        },
      });

      const course = await prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          averageRating: true,
        },
      });

      return {
        averageRating: course?.averageRating || 0,
        totalFeedback,
        ratingDistribution: stats.map((s) => ({
          rating: s.rating,
          count: s._count.rating,
          percentage: (s._count.rating / totalFeedback) * 100,
        })),
      };
    } catch (error) {
      throw new AppError("Failed to get course rating statistics", 500);
    }
  }

  async updateCourseAverageRating(courseId: string) {
    try {
      const averageRating = await prisma.courseFeedback.aggregate({
        where: {
          courseId,
        },
        _avg: {
          rating: true,
        },
      });

      // Cập nhật average rating cho course
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          averageRating: averageRating._avg.rating || 0,
        },
      });
    } catch (error) {
      throw new AppError("Failed to update course average rating", 500);
    }
  }

  async deleteFeedback(learnerId: string, courseId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Kiểm tra feedback có tồn tại không
        const feedback = await tx.courseFeedback.findUnique({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
        });

        if (!feedback) {
          throw new AppError("Feedback not found", 404);
        }

        // Xóa feedback
        await tx.courseFeedback.delete({
          where: {
            learnerId_courseId: {
              learnerId,
              courseId,
            },
          },
        });

        // Tính lại average rating sau khi xóa
        const averageRating = await tx.courseFeedback.aggregate({
          where: {
            courseId,
          },
          _avg: {
            rating: true,
          },
        });

        // Cập nhật average rating cho course
        await tx.course.update({
          where: {
            id: courseId,
          },
          data: {
            averageRating: averageRating._avg.rating || 0,
          },
        });

        return { message: "Feedback deleted successfully" };
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete feedback", 500);
    }
  }
}
export default FeedbackService;
