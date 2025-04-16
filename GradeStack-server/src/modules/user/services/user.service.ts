import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { AppError } from '../../../shared/middleware/error.middleware';

const prisma = new PrismaClient();

export class UserService {
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true
      }
    });
    return users;
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async changeUserStatus(id: string, status: { isBlocked?: boolean; isVerified?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: status,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isBlocked: true,
        createdAt: true
      }
    });

    return updatedUser;
  }

  async getUserPurchaseHistory(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.purchaseHistory.findMany(
      {
        where: { learnerId: userId },
        select: {
          price: true,
          purchasedAt: true,
          course: {
            select: {
              title: true,
            }
          }
        }
      });
  }

  async getUserEnrolledCourses(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.enrolledCourse.findMany(
      {
        where: { learnerId: userId },
        select: {
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              instructor: {
                select: {
                  avatar: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          },
          progress: true
        }
      });
  }

  async getUserBookmarks(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return prisma.bookmark.findMany(
      {
        where: { learnerId: userId },
        select: {
          course: {
            select: {
              title: true,
              thumbnail: true,
              instructor: {
                select: {
                  avatar: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      });
  }

  async addBookmark(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        learnerId: userId,
        courseId
      }
    });

    return bookmark;
  }

  async removeBookmark(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    await prisma.bookmark.delete({
      where: {
        learnerId_courseId: {
          learnerId: userId,
          courseId
        }
      }
    });

    return { success: true };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.password) {
      throw new AppError('User does not have a password set', 400); // Handle cases like OAuth users
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid old password', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true, message: 'Password changed successfully' };
  }
}
