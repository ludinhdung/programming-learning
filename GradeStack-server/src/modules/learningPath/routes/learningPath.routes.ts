import { Router } from 'express';
import { LearningPathController } from '../controllers/learningPath.controller';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const learningPathController = new LearningPathController();

// Public routes - không cần xác thực
router.get('/learning-paths', learningPathController.getAllLearningPaths);
router.get('/learning-paths/:learningPathId', learningPathController.getLearningPath);

// Instructor routes - cần xác thực là instructor
router.get('/instructors/:id/learning-paths', authenticate, learningPathController.getLearningPaths);
router.get('/instructors/:id/learning-paths/:learningPathId', authenticate, learningPathController.getLearningPath);

// Instructor-lead routes - chỉ instructor-lead mới được tạo, sửa, xóa learning path
router.post('/instructors/:id/learning-paths', authenticate, authorize(Role.INSTRUCTOR_LEAD), learningPathController.createLearningPath);
router.put('/instructors/:id/learning-paths/:learningPathId', authenticate, authorize(Role.INSTRUCTOR_LEAD), learningPathController.updateLearningPath);
router.put('/instructors/:id/learning-paths/:learningPathId/courses-order', authenticate, authorize(Role.INSTRUCTOR_LEAD), learningPathController.updateCoursesOrder);
router.delete('/instructors/:id/learning-paths/:learningPathId', authenticate, authorize(Role.INSTRUCTOR_LEAD), learningPathController.deleteLearningPath);

export default router;
