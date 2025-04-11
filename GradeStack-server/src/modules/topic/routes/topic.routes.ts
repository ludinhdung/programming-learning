import { Router } from 'express';
import { TopicController } from '../controllers/topic.controller';
import { Role } from '@prisma/client';

const router = Router();
const topicController = new TopicController();

// Các route liên quan đến chủ đề
router.get('/topics', topicController.getAllTopics);
router.get('/topics/with-courses', topicController.getTopicsWithCourses);
router.get('/topics/:topicId', topicController.getTopicById);
router.get('/instructors/:id/topics', topicController.getTopicsByInstructor);
router.post('/instructors/:id/topics', topicController.createTopic);
router.put('/topics/:topicId', topicController.updateTopic);
router.delete('/topics/:topicId', topicController.deleteTopic);

export default router;
