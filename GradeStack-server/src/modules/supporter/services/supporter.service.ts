import { PrismaClient, Role, Wallet, Prisma } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";
import bcrypt from "bcrypt";
import { sendEmail } from "../../../shared/utils/email.service";

const prisma = new PrismaClient();

export class SupporterService {
  async getAllInstructors() {
    const instructors = await prisma.instructor.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isBlocked: true,
          },
        },
        Wallet: {
          select: {
            balance: true,
          },
        },
      },
    });
    return instructors;
  }

  async getInstructorById(instructorId: string) {
    const instructor = await prisma.instructor.findFirst({
      where: { userId: instructorId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isBlocked: true,
          },
        },
        Wallet: {
          select: {
            balance: true,
          },
        },
      },
    });
    return instructor;
  }

  async createInstructor(instructorData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    organization: string;
    avatar: string;
    Wallet: Wallet;
  }) {
    const existingInstructor = await prisma.user.findUnique({
      where: { email: instructorData.email },
    });
    if (existingInstructor) {
      throw new AppError("Email aready exist", 400);
    }
    const hashedPassword = await bcrypt.hash(instructorData.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: instructorData.firstName,
        lastName: instructorData.lastName,
        email: instructorData.email,
        password: hashedPassword,
        role: instructorData.role,
        requirePasswordChange: true,
      },
    });

    // Generate avatar using DiceBear
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      instructorData.firstName + instructorData.lastName
    )}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc&backgroundType=gradientLinear`;

    const instructor = await prisma.instructor.create({
      data: {
        userId: user.id,
        organization: instructorData.organization,
        avatar: avatar,
      },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        organization: true,
        avatar: true,
        Wallet: true,
      },
    });

    await prisma.wallet.create({
      data: {
        instructorId: user.id,
        balance: new Prisma.Decimal(0),
      },
    });

    await sendEmail(
      instructorData.email,
      "Welcome to GradeStack",
      `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: auto;">
      <h2 style="color: #2C3E50; text-align: center;">Welcome to <span style="color: #3498DB;">GradeStack</span>! 🎉</h2>
      <p style="font-size: 16px; color: #555;">Hello <strong>${instructorData.firstName}</strong>,</p>
      <p style="font-size: 16px; color: #555;">Your account has been successfully created.</p>
      
      <div style="background: #ECF0F1; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
        <p style="font-size: 18px; color: #333;">Your temporary password:</p>
        <h3 style="color: #E74C3C; margin: 0;">${instructorData.password}</h3>
      </div>

      <p style="font-size: 16px; color: #555;">Please log in and change your password immediately.</p>
      <a href="http://localhost:5173/" style="display: block; width: 200px; text-align: center; background: #3498DB; color: #fff; padding: 12px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px auto;">Go to Login</a>

      <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Best regards,</p>
      <p style="font-size: 14px; color: #777; text-align: center;"><strong>GradeStack Education Team</strong></p>
    </div>
  </div>
  `
    );

    return instructor;
  }

  async updateUserStatus(userId: string, isBlocked: boolean) {
    const user = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
    return updatedUser;
  }

  async deleteInstructor(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId },
    });
    if (!instructor) {
      throw new AppError("Instructor not found", 404);
    }
    await prisma.wallet.delete({
      where: { instructorId: instructor.userId },
    });
    await prisma.instructor.delete({
      where: { userId: instructorId },
    });
    await prisma.user.delete({
      where: { id: instructor.userId },
    });
  }

  async getAllLearners() {
    const learners = await prisma.user.findMany({
      where: { role: "LEARNER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isBlocked: true,
        warningCount: true,
        Comment: true,
      },
    });
    return learners;
  }

  async warningLearner(learnerId: string, warningContent: string) {
    console.log(learnerId);

    const learner = await prisma.user.findUnique({
      where: { id: learnerId },
    });

    if (!learner || learner.role !== "LEARNER") {
      throw new AppError("Learner not found", 404);
    }

    const updatedLearner = await prisma.user.update({
      where: { id: learnerId },
      data: {
        warningCount: { increment: 1 },
      },
    });

    await sendEmail(
      learner.email,
      "Important Notice from GradeStack",
      `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
    <h2 style="color: #d9534f; text-align: center;">⚠️ Account Warning Notification</h2>
    <p>Dear <strong>${learner.firstName}</strong>,</p>
    <p>We have detected some unusual activity on your account that violates our policies. Please review the details below:</p>

    <div style="background: #ffe6e6; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <strong>Warning Details:</strong>
      <p style="margin: 5px 0;">${warningContent}</p>
    </div>

    <p>If you believe this is a mistake, please contact our support team immediately.</p>

    <p>Continued violation may result in further action, including account suspension.</p>

    <hr style="border: none; height: 1px; background: #ddd; margin: 20px 0;">

    <p style="color: #777;">Best regards,</p>
    <p style="color: #777;"><strong>GradeStack Education Team</strong></p>
  </div>
  `
    );

    //updatedLearner.warningCount là null hoặc undefined -> warningCount = 0 (nullish coalescing)
    if ((updatedLearner.warningCount ?? 0) >= 3) {
      await prisma.user.update({
        where: { id: learnerId },
        data: {
          isBlocked: true,
        },
      });
    }

    return updatedLearner;
  }

  async deleteLearners(learnerId: string) {
    const learner = await prisma.user.findUnique({
      where: { id: learnerId },
    });
    if (!learner || learner.role !== "LEARNER") {
      throw new AppError("Learner not found", 404);
    }
    await prisma.user.delete({
      where: { id: learnerId },
    });
  }
  async getSupporterById(supporterId: string) {
    const supporter = await prisma.user.findUnique({
      where: { id: supporterId, role: "SUPPORTER" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isBlocked: true,
        requirePasswordChange: true,
      },
    });
    return supporter;
  }
  
}
