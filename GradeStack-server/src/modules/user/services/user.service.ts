import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AppError } from "../../../shared/middleware/error.middleware";
import { sendEmail } from "../../../shared/utils/email.service";

const prisma = new PrismaClient();
const resetCodes = new Map();
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
        createdAt: true,
      },
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
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async changeUserStatus(
    id: string,
    status: { isBlocked?: boolean; isVerified?: boolean }
  ) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError("User not found", 404);
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
        createdAt: true,
      },
    });

    return updatedUser;
  }

  async getUserPurchaseHistory(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return prisma.purchaseHistory.findMany({
      where: { learnerId: userId },
      select: {
        price: true,
        purchasedAt: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async getUserEnrolledCourses(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return prisma.enrolledCourse.findMany({
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
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        progress: true,
      },
    });
  }

  async getUserBookmarks(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return prisma.bookmark.findMany({
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
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async addBookmark(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        learnerId: userId,
        courseId,
      },
    });

    return bookmark;
  }

  async removeBookmark(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    await prisma.bookmark.delete({
      where: {
        learnerId_courseId: {
          learnerId: userId,
          courseId,
        },
      },
    });

    return { success: true };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.password) {
      throw new AppError("User does not have a password set", 400); // Handle cases like OAuth users
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid old password", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { success: true, message: "Password changed successfully" };
  }

  // forgot password
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    resetCodes.set(email, {
      code: verificationCode,
      expiresAt,
    });

    const emailContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: auto;">
        <h2 style="color: #2C3E50; text-align: center;"><span style="color: #3498DB;">GradeStack</span> Password Reset 🔑</h2>
        <p style="font-size: 16px; color: #555;">Hello <strong>${user.firstName}</strong>,</p>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password.</p>
        
        <div style="background: #ECF0F1; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
          <p style="font-size: 18px; color: #333;">Your verification code:</p>
          <h3 style="color: #E74C3C; margin: 0;">${verificationCode}</h3>
        </div>

        <p style="font-size: 16px; color: #555;">This code will expire in 1 hour.</p>
        <p style="font-size: 16px; color: #555;">If you didn't request this, please ignore this email.</p>

        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Best regards,</p>
        <p style="font-size: 14px; color: #777; text-align: center;"><strong>GradeStack Education Team</strong></p>
      </div>
    </div>
    `;

    await sendEmail(email, "Password Reset Request", emailContent);

    return { success: true, message: "Verification code sent to email" };
  }

  async verifyResetCode(email: string, code: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const resetCode = resetCodes.get(email);

    if (!resetCode || resetCode.expiresAt < new Date()) {
      throw new AppError("Invalid or expired verification code", 400);
    }

    if (code !== resetCode.code) {
      throw new AppError("Invalid verification code", 400);
    }
    return { success: true, message: "Verification code verified" };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    resetCodes.delete(email);

    return { success: true, message: "Password reset successfully" };
  }

  async checkBookmarkStatus(userId: string, courseId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }, // Select only what's needed
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        learnerId_courseId: {
          learnerId: userId,
          courseId: courseId,
        },
      },
    });

    return bookmark !== null;
  }
}
