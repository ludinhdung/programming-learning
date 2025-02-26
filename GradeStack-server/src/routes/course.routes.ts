import { Router } from 'express';
import {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} from '../controllers/course.controller';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), createCourse);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), updateCourse);
router.delete('/:id', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), deleteCourse);

export default router; 