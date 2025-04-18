import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import multer from 'multer';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';


// Cấu hình multer để xử lý upload file
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // Giới hạn kích thước file 100MB
    }
});

const router = Router();
const courseController = new CourseController();

// Các route liên quan đến khóa học
router.post('/instructors/:id/courses',  courseController.createCourse);
router.get('/instructors/:id/courses',  courseController.getCourses);
router.get('/instructors/:id/courses/full',  courseController.getCoursesFullrelation);
router.get('/instructors/:id/courses/:courseId',  courseController.getCourse);
router.get('/courses/:courseId/full',  courseController.getCourseFullRelation);
router.put('/instructors/:id/courses/:courseId',  courseController.updateCourse);
router.delete('/instructors/:id/courses/:courseId',  courseController.deleteCourse);


// Route upload video
router.post('/upload/video',  upload.single('video'), courseController.uploadVideo);

// Route cập nhật trạng thái xuất bản khóa học
router.patch(
    '/instructors/:id/courses/:courseId/publish-status',
    authenticate,
    authorize(Role.INSTRUCTOR),
    courseController.toggleCoursePublishStatus
);

export default router;
