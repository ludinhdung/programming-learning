import { Router } from 'express';
import { InstructorController } from '../controllers/instructor.controller';
import { uploadVideo } from '../../../shared/middlewares/upload.middleware';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const instructorController = new InstructorController();

/**
 * Instructor routes
 */

// Instructor management
router.post('/', instructorController.createInstructor);
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructor);
router.get('/:id/wallet', instructorController.getInstructorWallet);
router.put('/:id/profile', instructorController.updateProfile);
router.put('/:id/avatar', instructorController.updateAvatar);
router.post('/upload-video', uploadVideo, instructorController.uploadVideo);
router.get('/:instructorId/transactions', authenticate, instructorController.getTransactions);

export default router;