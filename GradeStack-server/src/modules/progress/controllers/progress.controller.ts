import { Request, Response } from "express";
import { ProgressService } from "../services/progress.service";
import { AppError } from "../../../shared/middleware/error.middleware";

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  public updateProgress = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { learnerId, courseId } = req.params;
      const { progress } = req.body;

      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        res
          .status(400)
          .json({
            message:
              "Invalid progress value. Must be a number between 0 and 100",
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

  public getProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { learnerId, courseId } = req.params;
      const enrollment = await this.progressService.getCurrentProgress(
        learnerId,
        courseId
      );

      res.status(200).json(enrollment);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}
