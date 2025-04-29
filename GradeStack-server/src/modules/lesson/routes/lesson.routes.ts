import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';

const router = Router();
const lessonController = new LessonController();

// Các route liên quan đến bài học
router.get('/modules/:moduleId/lessons', lessonController.getLessons);
router.get('/lessons/:lessonId', lessonController.getLesson);
router.put('/lessons/:lessonId', lessonController.updateLesson);
router.delete('/lessons/:lessonId', lessonController.deleteLesson);
router.patch('/modules/:moduleId/lessons/reorder', lessonController.reorderLessons);
router.patch('/lessons/:lessonId/toggle-preview', lessonController.toggleLessonPreview);
router.get('/lessons/:lessonId/comments', lessonController.getLessonComments);
router.post('/lessons/:lessonId/comments', lessonController.addCommentToLesson);
router.post('/lessons/:lessonId/notes', lessonController.addNoteToLesson);

// Các route liên quan đến bài học video
router.post('/modules/:moduleId/video-lessons', lessonController.createVideoLesson);
router.put('/lessons/:lessonId/video', lessonController.updateVideoLesson);

// Các route liên quan đến bài tập lập trình
router.post('/modules/:moduleId/coding-exercises', lessonController.createCodingExercise);
router.put('/lessons/:lessonId/coding', lessonController.updateCodingExercise);

// Các route liên quan đến bài kiểm tra cuối cùng
router.post('/modules/:moduleId/final-tests', lessonController.createFinalTest);
router.get('/lessons/:lessonId/final-test', lessonController.getFinalTest);
router.put('/lessons/:lessonId/final-test', lessonController.updateFinalTest);

export default router;