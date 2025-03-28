import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { Role } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.patch('/:id/status', userController.changeUserStatus.bind(userController));

export default router;