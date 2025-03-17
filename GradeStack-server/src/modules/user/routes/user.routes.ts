import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, authorize(Role.ADMIN), userController.getAllUsers.bind(userController));
router.get('/:id', authenticate, userController.getUserById.bind(userController));
router.patch('/:id/status', authenticate, authorize(Role.ADMIN), userController.changeUserStatus.bind(userController));

export default router;