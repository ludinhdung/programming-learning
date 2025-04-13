import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';

const router = Router();
const commentController = new CommentController();

router.get('/lesson/:lessonId', commentController.getCommentsByLesson.bind(commentController));

router.get('/:id/replies', commentController.getReplies.bind(commentController));

router.post(
  '/',
  authenticate,
  commentController.validateCommentCreation,
  commentController.createComment.bind(commentController)
);

router.put(
  '/:id',
  authenticate,
  commentController.validateCommentUpdate,
  commentController.updateComment.bind(commentController)
);

router.delete('/:id', authenticate, commentController.deleteComment.bind(commentController));

export default router;
