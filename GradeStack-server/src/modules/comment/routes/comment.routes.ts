import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { authenticate } from "../../../shared/middleware/auth.middleware";

const router = Router();
const commentController = new CommentController();

// Get all comments for a lesson
router.get(
  "/lesson/:lessonId",
  commentController.getCommentsByLesson.bind(commentController)
);

// Get all comments by learner ID
router.get(
  "/learner/:learnerId",
  commentController.getCommentsByLearner.bind(commentController)
);

// Create a new comment
router.post(
  "/",
  authenticate,
  commentController.validateCommentCreation,
  commentController.createComment.bind(commentController)
);

// Update a comment
router.put(
  "/:id",
  authenticate,
  commentController.validateCommentUpdate,
  commentController.updateComment.bind(commentController)
);

// Delete a comment
router.delete(
  "/:id",
  authenticate,
  commentController.deleteComment.bind(commentController)
);

// Get replies for a comment
router.get(
  "/:id/replies",
  commentController.getReplies.bind(commentController)
);

export default router;
