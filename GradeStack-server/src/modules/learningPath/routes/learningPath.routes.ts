import { Router } from 'express';
import { LearningPathController } from '../controllers/learningPath.controller';
import { authenticate, authorize, checkResourceOwnership, checkSpecificResourceOwnership } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const learningPathController = new LearningPathController();

/**
 * Routes công khai - không yêu cầu xác thực
 */
router.get('/learning-paths', learningPathController.getAllLearningPaths);
router.get('/learning-paths/:learningPathId', learningPathController.getLearningPath);

/**
 * Routes cho INSTRUCTOR và INSTRUCTOR_LEAD
 * - Yêu cầu xác thực (authenticate)
 * - Yêu cầu quyền INSTRUCTOR hoặc INSTRUCTOR_LEAD (authorize)
 * - Kiểm tra quyền sở hữu tài nguyên (checkResourceOwnership)
 * - Kiểm tra quyền sở hữu learning path cụ thể (checkSpecificResourceOwnership)
 */

// Tạo learning path mới
router.post(
    '/instructors/:id/learning-paths', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    learningPathController.createLearningPath
);

// Lấy danh sách learning path của instructor
router.get(
    '/instructors/:id/learning-paths', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    learningPathController.getLearningPaths
);

// Lấy thông tin chi tiết learning path của instructor
router.get(
    '/instructors/:id/learning-paths/:learningPathId', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('learningPath'),
    learningPathController.getLearningPath
);

// Cập nhật learning path
router.put(
    '/instructors/:id/learning-paths/:learningPathId', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('learningPath'),
    learningPathController.updateLearningPath
);

// Cập nhật thứ tự khóa học trong learning path
router.put(
    '/instructors/:id/learning-paths/:learningPathId/courses-order', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('learningPath'),
    learningPathController.updateCoursesOrder
);

// Xóa learning path
router.delete(
    '/instructors/:id/learning-paths/:learningPathId', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('learningPath'),
    learningPathController.deleteLearningPath
);

export default router;
