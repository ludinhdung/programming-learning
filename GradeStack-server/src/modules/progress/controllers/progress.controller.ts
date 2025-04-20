import { Request, Response, NextFunction } from "express";
import { ProgressService } from "../services/progress.service";
import { AppError } from "../../../shared/middleware/error.middleware";

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  // Cập nhật progress
  updateProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { learnerId, courseId } = req.params;
      const { progress } = req.body;

      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        res.status(400).json({
          message: "Invalid progress value. Must be a number between 0 and 100",
        });
        return;
      }

      const updatedEnrollment = await this.progressService.updateProgress(
        learnerId,
        courseId,
        progress
      );

      res.status(200).json(updatedEnrollment);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  // Lấy progress hiện tại
  async getProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { learnerId, courseId } = req.params;
      const enrollment = await this.progressService.getCurrentProgress(
        learnerId,
        courseId
      );

      res.status(200).json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      next(error);
    }
  }

  // Đánh dấu bài học đã hoàn thành
  async markLessonAsComplete(req: Request, res: Response, next: NextFunction) {
    try {
      const { learnerId, courseId, lessonId } = req.params;

      const completedLesson = await this.progressService.markLessonAsComplete(
        learnerId,
        courseId,
        lessonId
      );

      res.status(200).json({
        success: true,
        data: completedLesson,
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy danh sách bài học đã hoàn thành
  async getCompletedLessons(req: Request, res: Response, next: NextFunction) {
    try {
      const { learnerId, courseId } = req.params;

      const completedLessons = await this.progressService.getCompletedLessons(
        learnerId,
        courseId
      );

      res.status(200).json({
        success: true,
        data: completedLessons,
      });
    } catch (error) {
      next(error);
    }
  }
}
