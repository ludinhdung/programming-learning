import { Router } from "express";
import { FinalTestController } from "../controllers/final_test.controller";
import {
  authenticate,
  authorize,
} from "../../../shared/middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();
const finalTestController = new FinalTestController();

router.get(
  "/learner/:learnerId/lesson/:lessonId/check-submission",
//   authenticate,
//   authorize(Role.LEARNER),
  finalTestController.checkFinalTestSubmission.bind(finalTestController)
);

router.post(
  "/:finalTestId/learner/:learnerId/submit",
  authenticate,
  authorize(Role.LEARNER),
  finalTestController.submitFinalTest.bind(finalTestController)
);
router.get(
  "/learner/:learnerId",
  finalTestController.getFinalTestsByLearnerId.bind(finalTestController)
);

export default router;
