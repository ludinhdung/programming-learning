import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { verifyUserOwnership } from '../../../shared/middleware/verifyOwnerShip.middlware';
import { Role } from '@prisma/client';

const router = Router();
const userController = new UserController();

router.get('/', authenticate, authorize(Role.ADMIN), userController.getAllUsers.bind(userController));
router.get('/:id', authenticate, verifyUserOwnership, userController.getUserById.bind(userController));
router.patch('/:id/status', authenticate, authorize(Role.ADMIN), userController.changeUserStatus.bind(userController));
router.patch('/change-password', authenticate, userController.changePassword.bind(userController));

router.get('/:id/purchases', authenticate, authorize(Role.LEARNER), verifyUserOwnership, userController.getUserPurchaseHistory.bind(userController));
router.get('/:id/enrollments', authenticate, authorize(Role.LEARNER), verifyUserOwnership, userController.getUserEnrolledCourses.bind(userController));

router.get('/:id/bookmarks', authenticate, authorize(Role.LEARNER), verifyUserOwnership, userController.getUserBookmarkCourses.bind(userController));
router.post('/:id/bookmarks/:courseId', authenticate, authorize(Role.LEARNER), verifyUserOwnership, userController.addBookmark.bind(userController));
router.delete('/:id/bookmarks/:courseId', authenticate, authorize(Role.LEARNER), verifyUserOwnership, userController.removeBookmark.bind(userController));


export default router;
