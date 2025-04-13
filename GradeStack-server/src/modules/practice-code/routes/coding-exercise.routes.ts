import { Router } from 'express';
import { CodingExerciseController } from '../controllers/coding-exercise.controller';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const codingExerciseController = new CodingExerciseController();

router.get('/exercises', codingExerciseController.getAllCodingExercises.bind(codingExerciseController));
router.get('/exercises/:lessonId', codingExerciseController.getCodingExerciseById.bind(codingExerciseController));
export default router; 