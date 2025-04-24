import { Router } from "express";
import { InstructorController } from "../controllers/instructor.controller";
import { uploadVideo } from "../../../shared/middlewares/upload.middleware";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();
const instructorController = new InstructorController();

/**
 * Instructor routes
 */

// Instructor management
router.post("/", instructorController.createInstructor);
router.get("/", instructorController.getAllInstructors);
router.get("/:id", instructorController.getInstructor);
router.get(
  "/instructor/:id/profile",
  instructorController.getInstructorProfile
);
router.put(
  "/instructor/:id/profile",
  instructorController.updateInstructorProfile
);
router.get("/:id/wallet", instructorController.getInstructorWallet);
router.put("/:id/profile", instructorController.updateProfile);
router.post(
  "/instructor/:id/change-password",
  instructorController.changePassword
);
router.get('/:id/statistics', instructorController.getInstructorStatistics);
router.put("/:id/avatar", instructorController.updateAvatar);
router.post("/upload-video", uploadVideo, instructorController.uploadVideo);
router.get("/:instructorId/transactions", instructorController.getTransactions);

router.post(
  "/:id/wallet/withdraw",
  authenticate,
  instructorController.requestWithdrawal
);
router.post("/:id/bank-info", instructorController.createBankInfoByInstructor);
router.get("/:id/bank-info", instructorController.getBankInfoByInstructor);
router.put("/:id/bank-info", instructorController.updateBankInfoByInstructor);
router.delete(
  "/:id/bank-info",
  instructorController.deleteBankInfoByInstructor
);
router.post("/hook/vietqr", instructorController.handleVietQRHook);

export default router;
