import { Router } from "express";
import { SupporterController } from "../controllers/supporter.controller";
import {
  authenticate,
  authorize,
} from "../../../shared/middleware/auth.middleware";
import { Role } from "@prisma/client";

const router = Router();
const supporterController = new SupporterController();

router.get('/instructors', supporterController.getAllInstructors.bind(supporterController));
router.get(
  "/learners",
  supporterController.getAllLearner.bind(supporterController)
);
router.get('/instructor/:id', supporterController.getInstructorById.bind(supporterController));
router.post('/create/instructor', supporterController.createInstructor.bind(supporterController))
router.patch(
  "/update-status/user/:id",
  supporterController.updateUserStatus.bind(supporterController)
);
router.patch(
  "/warning/learner/:id",
  supporterController.warningLearner.bind(supporterController)
);
router.delete(
  "/delete/instructor/:id",
  supporterController.deleteInstructor.bind(supporterController)
);
router.delete(
  "/delete/learner/:id",
  supporterController.deleteLearner.bind(supporterController)
);

export default router;