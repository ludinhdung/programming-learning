import { Router } from 'express';
import { InstructorController } from '../controllers/instructor.controller';
import { uploadVideo } from '../../../shared/middlewares/upload.middleware';

const router = Router();
const instructorController = new InstructorController();

/**
 * Instructor routes
 */

// Instructor management
router.post('/', instructorController.createInstructor);
router.get('/', instructorController.getAllInstructors);
router.get('/:id', instructorController.getInstructor);
router.put('/:id/profile', instructorController.updateProfile);
router.put('/:id/avatar', instructorController.updateAvatar);
router.post('/upload-video', uploadVideo, instructorController.uploadVideo);


export default router;