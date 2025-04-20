import { PrismaClient, Role, Wallet, Prisma } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";

const prisma = new PrismaClient();

export class ProgressService {
  async updateProgress(learnerId: string, courseId: string, progress: number) {
    try {
      // Kiểm tra xem enrollment có tồn tại không
      const existingEnrollment = await prisma.enrolledCourse.findUnique({
        where: {
          learnerId_courseId: {
            learnerId,
            courseId,
          },
        },
      });

      if (!existingEnrollment) {
        throw new AppError("Enrollment not found", 404);
      }

      // Update progress
      const updatedEnrollment = await prisma.enrolledCourse.update({
        where: {
          learnerId_courseId: {
            learnerId,
            courseId,
          },
        },
        data: {
          progress: progress,
        },
      });

      return updatedEnrollment;
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update enrollment progress", 500);
    }
  }

  async getCurrentProgress(learnerId: string, courseId: string) {
    try {
      const enrollment = await prisma.enrolledCourse.findUnique({
        where: {
          learnerId_courseId: {
            learnerId,
            courseId,
          },
        },
      });

      if (!enrollment) {
        throw new AppError("Enrollment not found", 404);
      }

      return enrollment;
    } catch (error) {
      console.error("Error getting enrollment progress:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get enrollment progress", 500);
    }
  }

  //đánh dấu bài học đã hoàn thành
  async markLessonAsComplete(
    learnerId: string,
    courseId: string,
    lessonId: string
  ) {
    try {
      // Kiểm tra xem bài học đã được đánh dấu completed chưa
      const existingCompletion = await prisma.completedLesson.findUnique({
        where: {
          learnerId_lessonId: {
            learnerId: learnerId,
            lessonId: lessonId,
          },
        },
      });

      if (existingCompletion) {
        return existingCompletion;
      }

      // Tạo completed lesson mới
      const completedLesson = await prisma.completedLesson.create({
        data: {
          learnerId: learnerId,
          courseId: courseId,
          lessonId: lessonId,
        },
      });

      // Tính toán và cập nhật progress trong EnrolledCourse
      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId: courseId,
          },
        },
      });

      const completedLessons = await prisma.completedLesson.count({
        where: {
          learnerId: learnerId,
          courseId: courseId,
        },
      });

      const progress = Math.round((completedLessons / totalLessons) * 100);

      // Cập nhật progress trong EnrolledCourse
      await prisma.enrolledCourse.update({
        where: {
          learnerId_courseId: {
            learnerId: learnerId,
            courseId: courseId,
          },
        },
        data: {
          progress: progress,
        },
      });

      return completedLesson;
    } catch (error) {
      throw new Error(`Failed to mark lesson as complete: ${error}`);
    }
  }

  // Lấy danh sách bài học đã hoàn thành trong một khóa học
  async getCompletedLessons(learnerId: string, courseId: string) {
    try {
      return await prisma.completedLesson.findMany({
        where: {
          learnerId: learnerId,
          courseId: courseId,
        },
        include: {
          lesson: true,
        },
      });
    } catch (error) {
      throw new Error(`Failed to get completed lessons: ${error}`);
    }
  }
}
