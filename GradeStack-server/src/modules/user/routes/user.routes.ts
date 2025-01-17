import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/profile', authMiddleware, (req, res) => userController.getProfile(req, res));
router.put('/profile', authMiddleware, (req, res) => userController.updateProfile(req, res));

export default router;
