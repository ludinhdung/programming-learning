import { Router } from 'express';
import {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic
} from '../controllers/topic.controller';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Admin-only routes for creating, updating, and deleting topics
router.post('/', authMiddleware, authorizeRoles('ADMIN'), createTopic);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), updateTopic);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), deleteTopic);

// Public routes for getting topics
router.get('/', getAllTopics);
router.get('/:id', getTopicById);

export default router; 