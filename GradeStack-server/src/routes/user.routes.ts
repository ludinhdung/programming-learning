import { Router } from 'express';
import { getAllUsers, getUserById } from '../controllers/user.controller';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllUsers);
router.get('/:id', authMiddleware, getUserById);

export default router; 