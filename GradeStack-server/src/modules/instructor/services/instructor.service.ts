import {
  InstructorBaseService,
  InstructorWithRelations,
} from "../../../shared/base/domain-services/instructor-base.service";
import {
  Instructor,
  Prisma,
  Course,
  Workshop,
  Role,
  Topic,
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaErrorHandler } from "../../../shared/errors/prisma-error-handler";
import { ApiError } from "../../../shared/errors/api-error";
import {
  createInstructorSchema,
  instructorUpdateSchema,
  avatarUpdateSchema,
  courseCreateSchema,
  workshopCreateSchema,
  videoLessonUpdateSchema,
  topicCreateSchema,
  topicUpdateSchema,
} from "../validation/instructor.validation";
import { z } from "zod";
import bcrypt from "bcrypt";
import { AppError } from '../../../shared/middleware/error.middleware';
const prisma = new PrismaClient();

export class InstructorService extends InstructorBaseService<
  InstructorWithRelations,
  Prisma.InstructorCreateInput,
  Prisma.InstructorUpdateInput
> {
  protected get model() {
    return prisma.instructor;
  }

  protected getModelName(): string {
    return Role.INSTRUCTOR;
  }

  // Instructor-specific business logic
  async createInstructor(
    userData: Prisma.UserCreateInput,
    instructorData: Omit<Prisma.InstructorCreateInput, "user">
  ): Promise<InstructorWithRelations> {
    try {
      // Validate input data using Zod
      const validatedData = createInstructorSchema.parse({
        userData,
        instructorData,
      });
      const hashedPassword = await bcrypt.hash(
        validatedData.userData.password,
        10
      );
      // First, create the user with INSTRUCTOR role
      const user = await prisma.user
        .create({
          data: {
            ...validatedData.userData,
            password: hashedPassword,
            role: Role.INSTRUCTOR,
          },
        })
        .catch((error) => {
          throw PrismaErrorHandler.handle(error, "User");
        });

      // Then create the instructor profile linked to the user
      const instructor = await this.create({
        user: {
          connect: { id: user.id },
        },
        organization: validatedData.instructorData.organization,
        avatar: validatedData.instructorData.avatar || "",
        bio: validatedData.instructorData.bio || "",
        socials: validatedData.instructorData.socials || [],
      }).catch((error) => {
        throw PrismaErrorHandler.handle(error, "Instructor");
      });

      return {
        ...instructor,
        user,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }
      throw error;
    }
  }

  async findByUserId(
    userId: string,
    include?: any
  ): Promise<InstructorWithRelations | null> {
    try {
      const instructor = await super.findByUserId(userId, include);
      if (!instructor) {
        throw ApiError.notFound(`Không tìm thấy giảng viên với ID ${userId}`);
      }
      return instructor;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Instructor");
    }
  }

  async updateProfile(
    userId: string,
    data: Prisma.InstructorUncheckedCreateInput
  ): Promise<Instructor> {
    try {
      // Validate input data using Zod
      const validatedData = instructorUpdateSchema.parse(data);

      // Check if instructor exists
      const instructor = await this.model.findUnique({ where: { userId } });
      if (!instructor) {
        throw ApiError.notFound(`Không tìm thấy giảng viên với ID ${userId}`);
      }

      // Update instructor profile
      return this.model
        .update({
          where: { userId },
          data: validatedData,
        })
        .catch((error) => {
          throw PrismaErrorHandler.handle(error, "Instructor");
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }
      throw error;
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<Instructor> {
    try {
      // Validate avatar URL
      const validatedData = avatarUpdateSchema.parse({ avatarUrl });

      // Check if instructor exists
      const instructor = await this.model.findUnique({ where: { userId } });
      if (!instructor) {
        throw ApiError.notFound(`Không tìm thấy giảng viên với ID ${userId}`);
      }

      // Update avatar
      return this.update(userId, { avatar: validatedData.avatarUrl }).catch(
        (error) => {
          throw PrismaErrorHandler.handle(error, "Instructor");
        }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(`Dữ liệu không hợp lệ: ${errorMessage}`);
      }
      throw error;
    }
  }

  async createCourse(instructorId: string, courseData: any): Promise<any> {
    try {
      // Validate course data
      const validatedData = courseCreateSchema.parse(courseData);

      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Bắt đầu giao dịch để đảm bảo tính nhất quán của dữ liệu
      return prisma.$transaction(async (tx) => {
        try {
          // 2. Tạo khóa học
          const course = await this._createCourseBase(
            tx,
            {
              ...validatedData,
              price: validatedData.price || 0,
            },
            instructor.userId
          );

          // 3. Kết nối khóa học với các chủ đề nếu có
          if (validatedData.topicIds && validatedData.topicIds.length > 0) {
            await this._connectCourseTopics(
              tx,
              course.id,
              validatedData.topicIds
            );
          }

          // 4. Tạo các module nếu được cung cấp
          if (validatedData.modules && validatedData.modules.length > 0) {
            await this._createCourseModules(
              tx,
              course.id,
              validatedData.modules
            );
          }

          // Trả về khóa học đã tạo với tất cả các mối quan hệ
          return this._getCourseWithRelations(tx, course.id);
        } catch (error) {
          throw PrismaErrorHandler.handle(error, "Course");
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(
          `Dữ liệu khóa học không hợp lệ: ${errorMessage}`
        );
      }
      throw error;
    }
  }

  async createWorkshop(
    instructorId: string,
    workshopData: any
  ): Promise<Workshop> {
    try {
      // Validate workshop data
      const validatedData = workshopCreateSchema.parse(workshopData);

      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Create workshop
      return prisma.workshop
        .create({
          data: {
            ...validatedData,
            instructor: {
              connect: { userId: instructorId },
            },
          },
        })
        .catch((error) => {
          throw PrismaErrorHandler.handle(error, "Workshop");
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(
          `Dữ liệu workshop không hợp lệ: ${errorMessage}`
        );
      }
      throw error;
    }
  }

  // Tạo khoá học cơ bản
  private async _createCourseBase(
    tx: any,
    courseData: any,
    instructorUserId: string
  ) {
    return tx.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        duration: courseData.duration || 0, // Cung cấp giá trị mặc định nếu undefined
        isPublished: courseData.isPublished || false,
        thumbnail: courseData.thumbnail || null,
        instructor: {
          connect: { userId: instructorUserId },
        },
      },
    });
  }

  // Phương thức private để kết nối khóa học với các chủ đề
  private async _connectCourseTopics(
    tx: any,
    courseId: string,
    topicIds: string[]
  ) {
    const topicConnections = topicIds.map((topicId) => {
      return tx.courseTopic.create({
        data: {
          course: { connect: { id: courseId } },
          topic: { connect: { id: topicId } },
        },
      });
    });

    await Promise.all(topicConnections);
  }

  // Tạo module cho khoá học
  private async _createCourseModules(
    tx: any,
    courseId: string,
    modules: any[]
  ) {
    for (let i = 0; i < modules.length; i++) {
      const moduleData = modules[i];

      // Create module
      const module = await tx.module.create({
        data: {
          title: moduleData.title,
          description: moduleData.description,
          order: moduleData.order || i + 1,
          course: {
            connect: { id: courseId },
          },
          videoUrl: moduleData.videoUrl || null,
          thumbnailUrl: moduleData.thumbnailUrl || null,
          videoDuration: moduleData.videoDuration || null,
        },
      });

      // Create lessons if provided
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        await this._createModuleLessons(tx, module.id, moduleData.lessons);
      }
    }
  }

  // Tạo bài học cho module
  private async _createModuleLessons(
    tx: any,
    moduleId: string,
    lessons: any[]
  ) {
    for (let i = 0; i < lessons.length; i++) {
      const lessonData = lessons[i];

      // Create base lesson
      const lesson = await tx.lesson.create({
        data: {
          title: lessonData.title,
          description: lessonData.description,
          lessonType: lessonData.lessonType,
          duration: lessonData.duration || 0,
          isPreview: lessonData.isPreview || false,
          order: lessonData.order || i + 1,
          module: {
            connect: { id: moduleId },
          },
        },
      });

      // Create lesson content based on type
      switch (lessonData.lessonType) {
        case "VIDEO":
          if (lessonData.videoData) {
            await tx.videoLesson.create({
              data: {
                url: lessonData.videoData.videoUrl || lessonData.videoData.url,
                duration: lessonData.videoData.duration || 0,
                thumbnailUrl: lessonData.videoData.thumbnailUrl || null,
                lesson: {
                  connect: { id: lesson.id },
                },
              },
            });
          }
          break;
        case "CODING":
          if (lessonData.codingData) {
            await tx.codingExercise.create({
              data: {
                language: lessonData.codingData.language,
                problem: lessonData.codingData.problem,
                hint: lessonData.codingData.hint || null,
                solution: lessonData.codingData.solution,
                codeSnippet: lessonData.codingData.codeSnippet || null,
                lesson: {
                  connect: { id: lesson.id },
                },
              },
            });
          }
          break;
        case "FINAL_TEST":
          if (lessonData.finalTestData) {
            const finalTest = await tx.finalTestLesson.create({
              data: {
                estimatedDuration:
                  lessonData.finalTestData.estimatedDuration || 30,
                lesson: {
                  connect: { id: lesson.id },
                },
              },
            });

            // Create questions and answers
            if (
              lessonData.finalTestData.questions &&
              lessonData.finalTestData.questions.length > 0
            ) {
              for (
                let j = 0;
                j < lessonData.finalTestData.questions.length;
                j++
              ) {
                const questionData = lessonData.finalTestData.questions[j];

                const question = await tx.question.create({
                  data: {
                    content: questionData.content,
                    order: questionData.order || j + 1,
                    finalTestLesson: {
                      connect: { id: finalTest.id },
                    },
                  },
                });

                // Create answers
                if (questionData.answers && questionData.answers.length > 0) {
                  for (const answerData of questionData.answers) {
                    await tx.answer.create({
                      data: {
                        content: answerData.content,
                        isCorrect: answerData.isCorrect || false,
                        question: {
                          connect: { id: question.id },
                        },
                      },
                    });
                  }
                }
              }
            }
          }
          break;
      }
    }
  }

  // Lấy khoá học với quan hệ liên quan
  private async _getCourseWithRelations(tx: any, courseId: string) {
    return tx.course.findUnique({
      where: { id: courseId },
      include: {
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
          orderBy: {
            order: "asc",
          },
        },
        CourseTopic: {
          include: {
            topic: true,
          },
        },
        instructor: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Lấy module theo khoá học
  async getModulesByCourse(courseId: string): Promise<any[]> {
    return prisma.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
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
    });
  }

  // Lấy module theo id
  async getModuleById(moduleId: string): Promise<any> {
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
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
        course: true,
      },
    });

    if (!module) {
      throw new Error(`Module with id ${moduleId} not found`);
    }

    return module;
  }

  // Tạo module cho khoá học
  async createModule(courseId: string, moduleData: any): Promise<any> {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error(`Course with id ${courseId} not found`);
    }

    // Get the highest order value
    const highestOrderModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: "desc" },
    });

    const order =
      moduleData.order ||
      (highestOrderModule ? highestOrderModule.order + 1 : 1);

    // Create module
    return prisma.module.create({
      data: {
        title: moduleData.title,
        description: moduleData.description,
        order,
        course: {
          connect: { id: courseId },
        },
      },
      include: {
        lessons: true,
      },
    });
  }

  // Cập nhật module
  async updateModule(moduleId: string, moduleData: any): Promise<any> {
    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error(`Module with id ${moduleId} not found`);
    }

    // Update module
    return prisma.module.update({
      where: { id: moduleId },
      data: {
        title: moduleData.title,
        description: moduleData.description,
        order: moduleData.order || module.order,
      },
      include: {
        lessons: {
          include: {
            video: true,
            coding: true,
            finalTest: true,
          },
        },
      },
    });
  }

  // Xóa module
  async deleteModule(moduleId: string): Promise<void> {
    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { lessons: true },
    });

    if (!module) {
      throw new Error(`Module with id ${moduleId} not found`);
    }

    // Delete module and all related data
    await prisma.$transaction(async (tx) => {
      // Delete all lessons and their related content
      for (const lesson of module.lessons) {
        await this._deleteLesson(tx, lesson.id);
      }

      // Delete module
      await tx.module.delete({
        where: { id: moduleId },
      });
    });
  }

  // Lấy bài học theo module
  async getLessonsByModule(moduleId: string): Promise<any[]> {
    return prisma.lesson.findMany({
      where: { moduleId },
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
    });
  }

  // Lấy bài học theo id
  async getLessonById(lessonId: string): Promise<any> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
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
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error(`Lesson with id ${lessonId} not found`);
    }

    return lesson;
  }

  // Cập nhật bài học
  async updateLesson(lessonId: string, lessonData: any): Promise<any> {
    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson with id ${lessonId} not found`);
    }

    // Update lesson
    return prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: lessonData.title,
        description: lessonData.description,
        duration: lessonData.duration || lesson.duration,
        isPreview:
          lessonData.isPreview !== undefined
            ? lessonData.isPreview
            : lesson.isPreview,
        order: lessonData.order || lesson.order,
      },
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
    });
  }

  // Xóa bài học
  async deleteLesson(lessonId: string): Promise<void> {
    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error(`Lesson with id ${lessonId} not found`);
    }

    // Delete lesson and all related data
    await prisma.$transaction(async (tx) => {
      await this._deleteLesson(tx, lessonId);
    });
  }

  // Phương thức trợ giúp để xóa một bài học và nội dung liên quan
  private async _deleteLesson(tx: any, lessonId: string): Promise<void> {
    const lesson = await tx.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) return;

    // Delete related content based on lesson type
    if (lesson.lessonType === "VIDEO") {
      await tx.videoLesson.deleteMany({
        where: { lessonId },
      });
    } else if (lesson.lessonType === "CODING") {
      await tx.codingExercise.deleteMany({
        where: { lessonId },
      });
    } else if (lesson.lessonType === "FINAL_TEST") {
      // Delete questions and answers
      const finalTest = await tx.finalTestLesson.findUnique({
        where: { lessonId },
        include: { questions: true },
      });

      if (finalTest) {
        for (const question of finalTest.questions) {
          await tx.answer.deleteMany({
            where: { questionId: question.id },
          });
        }

        await tx.question.deleteMany({
          where: { finalTestLessonId: finalTest.id },
        });

        await tx.finalTestLesson.delete({
          where: { id: finalTest.id },
        });
      }
    }

    // Delete comments and notes
    await tx.comment.deleteMany({
      where: { lessonId },
    });

    await tx.note.deleteMany({
      where: { lessonId },
    });

    // Delete lesson
    await tx.lesson.delete({
      where: { id: lessonId },
    });
  }

  // Tạo chủ đề mới
  async createTopic(instructorId: string, topicData: any): Promise<Topic> {
    try {
      // Validate topic data
      const validatedData = topicCreateSchema.parse(topicData);

      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Create topic
      return prisma.topic
        .create({
          data: {
            name: validatedData.name,
            description: validatedData.description,
            thumbnail: validatedData.thumbnail,
            Instructor: {
              connect: { userId: instructorId },
            },
          },
        })
        .catch((error) => {
          throw PrismaErrorHandler.handle(error, "Topic");
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(
          `Dữ liệu chủ đề không hợp lệ: ${errorMessage}`
        );
      }
      throw error;
    }
  }

  // Lấy tất cả khoá học của một giảng viên
  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Get all courses
      return prisma.course.findMany({
        where: {
          instructor: {
            userId: instructorId,
          },
        },
        include: {
          modules: true,
          instructor: true,
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "Course");
    }
  }

  // Lấy khoá học theo ID
  async getCourseById(courseId: string, instructorId: string): Promise<any> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Get course
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructor: {
            userId: instructorId,
          },
        },
        include: {
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
            orderBy: {
              order: "asc",
            },
          },
          instructor: true,
        },
      });

      if (!course) {
        throw ApiError.notFound(`Không tìm thấy khóa học với ID ${courseId}`);
      }

      return course;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Course");
    }
  }

  // Cập nhật khoá học
  async updateCourse(
    instructorId: string,
    courseId: string,
    courseData: any
  ): Promise<any> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Check if course exists and belongs to instructor
      const existingCourse = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructor: {
            userId: instructorId,
          },
        },
      });

      if (!existingCourse) {
        throw ApiError.notFound(
          `Không tìm thấy khóa học với ID ${courseId} hoặc bạn không có quyền cập nhật khóa học này`
        );
      }

      // Update course
      const updatedCourse = await prisma.course.update({
        where: {
          id: courseId,
        },
        data: {
          title: courseData.title,
          description: courseData.description,
          price:
            courseData.price !== undefined
              ? courseData.price
              : existingCourse.price,
          duration:
            courseData.duration !== undefined
              ? courseData.duration
              : existingCourse.duration,
          isPublished:
            courseData.isPublished !== undefined
              ? courseData.isPublished
              : existingCourse.isPublished,
          thumbnail: courseData.thumbnail || existingCourse.thumbnail,
        },
        include: {
          modules: {
            include: {
              lessons: true,
            },
            orderBy: {
              order: "asc",
            },
          },
          instructor: true,
        },
      });

      // Update topics if provided
      if (courseData.topicIds && Array.isArray(courseData.topicIds)) {
        // Delete existing topic connections
        await prisma.courseTopic.deleteMany({
          where: {
            courseId,
          },
        });

        // Create new topic connections
        if (courseData.topicIds.length > 0) {
          await this._connectCourseTopics(
            prisma,
            courseId,
            courseData.topicIds
          );
        }

        // Fetch updated course with new topic connections
        return this.getCourseById(courseId, instructorId);
      }

      return updatedCourse;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Course");
    }
  }

  // Xóa khoá học
  async deleteCourse(instructorId: string, courseId: string): Promise<void> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Check if course exists and belongs to instructor
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructor: {
            userId: instructorId,
          },
        },
        include: {
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      });

      if (!course) {
        throw ApiError.notFound(
          `Không tìm thấy khóa học với ID ${courseId} hoặc bạn không có quyền xóa khóa học này`
        );
      }

      // Delete course and all related data
      await prisma.$transaction(async (tx) => {
        // Delete all modules and their lessons
        for (const module of course.modules) {
          // Delete all lessons in the module
          for (const lesson of module.lessons) {
            await this._deleteLesson(tx, lesson.id);
          }

          // Delete module
          await tx.module.delete({
            where: { id: module.id },
          });
        }

        // Delete course topics
        await tx.courseTopic.deleteMany({
          where: { courseId },
        });

        // Try to delete enrollments if the model exists
        try {
          // Since we're not sure if the enrollment model exists in the transaction
          // Use a safer approach by checking the schema first
          const enrollmentTableExists = await tx.$queryRaw`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public' 
                            AND table_name = 'Enrollment'
                        );
                    `;

          if (enrollmentTableExists) {
            await tx.$executeRaw`DELETE FROM "Enrollment" WHERE "courseId" = ${courseId}`;
          }
        } catch (error) {
          console.error("Error deleting enrollments:", error);
          // Continue with course deletion even if enrollment deletion fails
        }

        // Delete course
        await tx.course.delete({
          where: { id: courseId },
        });
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Course");
    }
  }

  // Lấy khoá học với quan hệ liên quan theo giảng viên
  async getFullRelationCourses(instructorId: string): Promise<any[]> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      // Get all courses with full relations
      return prisma.course.findMany({
        where: {
          instructor: {
            userId: instructorId,
          },
        },
        include: {
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
            orderBy: {
              order: "asc",
            },
          },
          instructor: {
            include: {
              user: true,
            },
          },
          _count: {
            select: {
              EnrolledCourse: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Course");
    }
  }

  // Update video lesson
  async updateVideoLesson(lessonId: string, videoData: any): Promise<any> {
    try {
      // Validate video data
      const validatedData = videoLessonUpdateSchema.parse(videoData);

      // Verify lesson exists and is a video lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { video: true },
      });

      if (!lesson) {
        throw ApiError.notFound(`Không tìm thấy bài học với ID ${lessonId}`);
      }

      if (lesson.lessonType !== "VIDEO" || !lesson.video) {
        throw ApiError.badRequest(
          `Bài học với ID ${lessonId} không phải là bài học video`
        );
      }

      // Update video lesson
      return prisma.videoLesson.update({
        where: { lessonId },
        data: {
          url: validatedData.url || validatedData.videoUrl || lesson.video.url,
          thumbnailUrl:
            validatedData.thumbnailUrl !== undefined
              ? validatedData.thumbnailUrl
              : lesson.video.thumbnailUrl,
          duration: validatedData.duration || lesson.video.duration,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(
          `Dữ liệu video không hợp lệ: ${errorMessage}`
        );
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "VideoLesson");
    }
  }

  // Get all topics
  async getAllTopics(): Promise<Topic[]> {
    try {
      return prisma.topic.findMany();
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "Topic");
    }
  }

  // Get topic by ID
  async getTopicById(topicId: string): Promise<Topic | null> {
    try {
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        throw ApiError.notFound(`Không tìm thấy chủ đề với ID ${topicId}`);
      }

      return topic;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Topic");
    }
  }

  // Get topics by instructor ID
  async getTopicsByInstructor(instructorId: string): Promise<Topic[]> {
    try {
      // Check if instructor exists
      const instructor = await this.findByUserId(instructorId);

      if (!instructor) {
        throw ApiError.notFound(
          `Không tìm thấy giảng viên với ID ${instructorId}`
        );
      }

      return prisma.topic.findMany({
        where: {
          instructorUserId: instructorId,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Topic");
    }
  }

  // Get topics with courses
  async getTopicsWithCourses(): Promise<any[]> {
    try {
      return prisma.topic.findMany({
        include: {
          courses: {
            include: {
              course: true,
            },
          },
        },
      });
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "Topic");
    }
  }

  // Update topic
  async updateTopic(topicId: string, topicData: any): Promise<Topic> {
    try {
      // Validate topic data
      const validatedData = topicUpdateSchema.parse(topicData);

      // Check if topic exists
      const topic = await prisma.topic.findUnique({
        where: { id: topicId },
      });

      if (!topic) {
        throw ApiError.notFound(`Không tìm thấy chủ đề với ID ${topicId}`);
      }

      // Update topic
      return prisma.topic.update({
        where: { id: topicId },
        data: {
          name: validatedData.name || topic.name,
          description: validatedData.description || topic.description,
          thumbnail:
            validatedData.thumbnail !== undefined
              ? validatedData.thumbnail
              : topic.thumbnail,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        throw ApiError.validationError(
          `Dữ liệu chủ đề không hợp lệ: ${errorMessage}`
        );
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw PrismaErrorHandler.handle(error, "Topic");
    }
  }

  // get instructor wallet
  async getInstructorWallet(instructorId: string): Promise<any> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: {
          instructorId: instructorId,
        },
      });

      if (!wallet) {
        throw ApiError.notFound(
          `Không tìm thấy ví của giảng viên với ID ${instructorId}`
        );
      }

      return wallet;
    } catch (error) {
      throw PrismaErrorHandler.handle(error, "Instructor");
    }
  }

  async getTransactionsByInstructorId(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
      include: {
        Wallet: {
          include: {
            transactions: {
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    if (!instructor || !instructor.Wallet) {
      throw new AppError('Instructor wallet not found', 404);
    }

    return instructor.Wallet.transactions;
  }
}
