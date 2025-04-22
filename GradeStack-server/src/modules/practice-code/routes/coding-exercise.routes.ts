import { Router } from 'express';
import { CodingExerciseController } from '../controllers/coding-exercise.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const codingExerciseController = new CodingExerciseController();

// Existing routes
router.get('/exercises', codingExerciseController.getAllCodingExercises.bind(codingExerciseController));
router.get('/exercises/:lessonId', codingExerciseController.getCodingExerciseById.bind(codingExerciseController));

// New submission routes
router.post('/submit', authenticate, codingExerciseController.submitCode.bind(codingExerciseController));
router.get('/submissions/:lessonId', authenticate, codingExerciseController.getSubmission.bind(codingExerciseController));
router.get('/submissions/exercise/:lessonId', authenticate, codingExerciseController.getAllSubmissionsByExercise.bind(codingExerciseController));

export default router; 