import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';

const router = Router();
const courseController = new CourseController();

// GET /api/courses
router.get('/', courseController.getCourses.bind(courseController));

export default router; 