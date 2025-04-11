import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { body, param, validationResult } from 'express-validator';
import { AppError } from '../../../shared/middleware/error.middleware';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  validateCommentCreation = [
    body('content').notEmpty().withMessage('Comment content is required'),
    body('lessonId').notEmpty().withMessage('Lesson ID is required'),
    body('parentCommentId').optional(),
  ];

  validateCommentUpdate = [
    param('id').notEmpty().withMessage('Comment ID is required'),
    body('content').notEmpty().withMessage('Comment content is required'),
  ];

  // Get all comments for a lesson
  getCommentsByLesson = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lessonId = req.params.lessonId;
      const comments = await this.commentService.getCommentsByLesson(lessonId);
      res.status(200).json(comments);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  };

  // Create a new comment
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400));
      }

      const { content, lessonId, parentCommentId } = req.body;
      const userId = req.user.id; // User ID from auth middleware

      const comment = await this.commentService.createComment({
        content,
        lessonId,
        userId,
        parentCommentId,
      });

      res.status(201).json(comment);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  };

  // Update a comment
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError('Validation failed', 400));
      }

      const commentId = req.params.id;
      const { content } = req.body;
      const userId = req.user.id; // User ID from auth middleware

      const comment = await this.commentService.updateComment(commentId, content, userId);
      res.status(200).json(comment);
    } catch (error: any) {
      if (error.message === 'Comment not found') {
        next(new AppError('Comment not found', 404));
      } else if (error.message === 'Unauthorized') {
        throw new AppError('You are not authorized to update this comment', 403);
      } else {
        next(new AppError(error.message, 500));
      }
    }
  };

  // Delete a comment
  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id;
      const userId = req.user.id; // User ID from auth middleware

      await this.commentService.deleteComment(commentId, userId);
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Comment not found') {
        next(new AppError('Comment not found', 404));
      } else if (error.message === 'Unauthorized') {
        next(new AppError('You are not authorized to delete this comment', 403));
      } else {
        next(new AppError(error.message, 500));
      }
    }
  };

  // Get replies for a comment
  getReplies = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id;
      const replies = await this.commentService.getReplies(commentId);
      res.status(200).json(replies);
    } catch (error: any) {
      next(new AppError(error.message, 500));
    }
  };
}
