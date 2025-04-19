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
  progressController.getProgress
);

export default router;
