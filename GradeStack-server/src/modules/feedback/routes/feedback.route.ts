// src/modules/feedback/routes/feedback.routes.ts
import express from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import {
  authenticate,
  authorize,
} from "../../../shared/middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = express.Router();
const feedbackController = new FeedbackController();

// Submit feedback
router.post(
  "/course/:courseId/learner/:learnerId",
  // authenticate,
  // authorize(Role.LEARNER),
  feedbackController.submitFeedback
);

// Update existing feedback
router.put(
  "/course/:courseId/learner/:learnerId",
  // authenticate,
  // authorize(Role.LEARNER),
  feedbackController.updateFeedback
);

// Get all feedback của một course
router.get(
  "/course/:courseId",
  feedbackController.getCourseFeedback
);

// Get feedback của một learner cho một course
router.get(
  "/course/:courseId/learner/:learnerId",
  feedbackController.getLearnerFeedback
);

// Get thống kê rating của course
router.get(
  "/course/:courseId/stats",
  feedbackController.getCourseRatingStats
);

// Delete feedback
router.delete(
  "/course/:courseId/learner/:learnerId",
  // authenticate,
  // authorize(Role.LEARNER),
  feedbackController.deleteFeedback
);

export default router;
