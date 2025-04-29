import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import multer from 'multer';

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
router.post('/instructors/:id/courses', courseController.createCourse);
router.get('/instructors/:id/courses', courseController.getCourses);
router.get('/instructors/:id/courses/full', courseController.getCoursesFullrelation);
router.get('/instructors/:id/courses/:courseId', courseController.getCourse);
router.get('/courses/:courseId/full', courseController.getCourseFullRelation);
router.put('/instructors/:id/courses/:courseId', courseController.updateCourse);
router.delete('/instructors/:id/courses/:courseId', courseController.deleteCourse);

// Route lấy tất cả các khóa học cho learning path
router.get('/courses/learning-path/all', courseController.getAllCoursesForLearningPath);


// Route upload video
router.post('/upload/video', upload.single('video'), courseController.uploadVideo);
export default router;
