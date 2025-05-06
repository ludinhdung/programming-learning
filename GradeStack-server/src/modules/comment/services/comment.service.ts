import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CreateCommentDTO {
  content: string;
  lessonId: string;
  userId: string;
  parentCommentId?: string;
}

export class CommentService {
  // Get all comments for a lesson (only top-level comments)
  async getCommentsByLesson(lessonId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          lessonId,
          parentCommentId: null, // Only get top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    } catch (error) {
      throw error;
    }
  }

  // Create a new comment
  async createComment(data: CreateCommentDTO) {
    try {
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          lesson: {
            connect: { id: data.lessonId },
          },
          user: {
            connect: { id: data.userId },
          },
          ...(data.parentCommentId && {
            parentComment: {
              connect: { id: data.parentCommentId },
            },
          }),
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Update a comment
  async updateComment(commentId: string, content: string, userId: string) {
    try {
      // First check if the comment exists and belongs to the user
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.userId !== userId) {
        throw new Error("Unauthorized");
      }

      // Update the comment
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return updatedComment;
    } catch (error) {
      throw error;
    }
  }

  // Delete a comment
  async deleteComment(commentId: string, userId: string) {
    try {
      // First check if the comment exists and belongs to the user
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
          replies: true,
        },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.userId !== userId) {
        throw new Error("Unauthorized");
      }

      if (existingComment.replies.length > 0) {
        await prisma.comment.deleteMany({
          where: {
            parentCommentId: commentId,
          },
        });
      }

      // Delete the parent comment
      await prisma.comment.delete({
        where: { id: commentId },
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get replies for a comment
  async getReplies(commentId: string) {
    try {
      const replies = await prisma.comment.findMany({
        where: {
          parentCommentId: commentId,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return replies;
    } catch (error) {
      throw error;
    }
  }

  // Get all comments by learner ID
  async getCommentsByLearner(learnerId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          userId: learnerId,
        },
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    } catch (error) {
      throw error;
    }
  }
}
