import { Router } from 'express';
import { VideoLessonController } from '../controllers/videoLesson.controller';

const router = Router();
const videoLessonController = new VideoLessonController();

// Các route liên quan đến bài học video
router.get('/lessons/:lessonId/video',  videoLessonController.getVideoLessonByLessonId);
router.post('/lessons/:lessonId/video',  videoLessonController.createVideoLesson);
router.put('/lessons/:lessonId/video',  videoLessonController.updateVideoLesson);
router.delete('/lessons/:lessonId/video',  videoLessonController.deleteVideoLesson);

// Route để cập nhật thông tin video cho module
router.put('/modules/:moduleId/video',  videoLessonController.updateModuleVideoInfo);

export default router;
