import { Router } from 'express';
import { LearningPathController } from '../controllers/learningPath.controller';

const router = Router();
const learningPathController = new LearningPathController();

// Public routes
router.get('/learning-paths', learningPathController.getAllLearningPaths);
router.get('/learning-paths/:learningPathId', learningPathController.getLearningPath);

// Instructor routes
router.post('/instructors/:id/learning-paths', learningPathController.createLearningPath);
router.get('/instructors/:id/learning-paths', learningPathController.getLearningPaths);
router.put('/instructors/:id/learning-paths/:learningPathId', learningPathController.updateLearningPath);
router.put('/instructors/:id/learning-paths/:learningPathId/courses-order', learningPathController.updateCoursesOrder);
router.delete('/instructors/:id/learning-paths/:learningPathId', learningPathController.deleteLearningPath);

export default router;
