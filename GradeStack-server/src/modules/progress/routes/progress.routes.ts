import { Router } from "express";
import { ProgressController } from "../controllers/progress.controller";

const router = Router();
const progressController = new ProgressController();

// Update progress
router.put(
  "/learner/:learnerId/courses/:courseId/progress",
  progressController.updateProgress
);

// Get current progress
router.get(
  "/learner/:learnerId/courses/:courseId/progress",
  progressController.getProgress.bind(progressController)
);

// Add new routes for completed lessons
router.post(
  "/learner/:learnerId/courses/:courseId/lessons/:lessonId/complete",
  progressController.markLessonAsComplete.bind(progressController)
);

router.get(
  "/learner/:learnerId/courses/:courseId/completed-lessons",
  progressController.getCompletedLessons.bind(progressController)
);

export default router;
