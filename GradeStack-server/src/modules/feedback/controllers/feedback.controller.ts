// src/modules/feedback/controllers/feedback.controller.ts
import { Request, Response } from "express";
import FeedbackService from "../services/feedback.service";
import { AppError } from "../../../shared/middleware/error.middleware";

export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor() {
    this.feedbackService = new FeedbackService();
  }

  // Submit feedback
  submitFeedback = async (req: Request, res: Response) => {
    try {
      const { courseId, learnerId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        throw new AppError("Rating is required", 400);
      }

      if (rating < 1 || rating > 5) {
        throw new AppError("Rating must be between 1 and 5", 400);
      }

      const feedback = await this.feedbackService.submitCourseFeedback(
        learnerId,
        courseId,
        rating,
        comment
      );

      res.status(200).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to submit feedback", 500);
    }
  };

  // Update feedback
  updateFeedback = async (req: Request, res: Response) => {
    try {
      const { courseId, learnerId } = req.params;
      const { rating, comment } = req.body;

      if (!rating) {
        throw new AppError("Rating is required", 400);
      }

      if (rating < 1 || rating > 5) {
        throw new AppError("Rating must be between 1 and 5", 400);
      }

      const feedback = await this.feedbackService.updateCourseFeedback(
        learnerId,
        courseId,
        rating,
        comment
      );

      res.status(200).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to update feedback", 500);
    }
  };

  // Get all feedback của một course
  getCourseFeedback = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const feedbacks = await this.feedbackService.getCourseFeedback(courseId);

      res.status(200).json({
        success: true,
        data: feedbacks,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get course feedback", 500);
    }
  };

  // Get feedback của một learner cho một course
  getLearnerFeedback = async (req: Request, res: Response) => {
    try {
      const { courseId, learnerId } = req.params;
      const feedback = await this.feedbackService.getLearnerCourseFeedback(
        learnerId,
        courseId
      );

      res.status(200).json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get learner feedback", 500);
    }
  };

  // Get thống kê rating của course
  getCourseRatingStats = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const stats = await this.feedbackService.getCourseRatingStats(courseId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to get course rating statistics", 500);
    }
  };

  // Delete feedback
  deleteFeedback = async (req: Request, res: Response) => {
    try {
      const { courseId, learnerId } = req.params;
      const result = await this.feedbackService.deleteFeedback(
        learnerId,
        courseId
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete feedback", 500);
    }
  };
}

export default FeedbackController;
