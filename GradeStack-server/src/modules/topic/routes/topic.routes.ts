import { Router } from 'express';
import { TopicController } from '../controllers/topic.controller';
import { Role } from '@prisma/client';
import { authenticate, authorize, checkResourceOwnership } from '../../../shared/middleware/auth.middleware';

const router = Router();
const topicController = new TopicController();

// Public routes - không cần xác thực
router.get('/topics', topicController.getAllTopics);
router.get('/topics/with-courses', topicController.getTopicsWithCourses);
router.get('/topics/:topicId', topicController.getTopicById);
router.get('/instructors/:id/topics', topicController.getTopicsByInstructor);

// Protected routes - chỉ INSTRUCTOR_LEAD mới có quyền
router.post(
    '/instructors/:id/topics',
    authenticate,
    authorize(Role.INSTRUCTOR_LEAD),
    checkResourceOwnership(),
    topicController.createTopic
);

router.put(
    '/instructors/:id/topics/:topicId',
    authenticate,
    authorize(Role.INSTRUCTOR_LEAD),
    checkResourceOwnership(),
    topicController.updateTopic
);

router.delete(
    '/instructors/:id/topics/:topicId',
    authenticate,
    authorize(Role.INSTRUCTOR_LEAD),
    checkResourceOwnership(),
    topicController.deleteTopic
);

export default router;
