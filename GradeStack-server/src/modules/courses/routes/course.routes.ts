import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';

const router = Router();
const courseController = new CourseController();

router.get('/', courseController.getCourses.bind(courseController));

router.get('/:courseId', courseController.getCourseById);

export default router; 