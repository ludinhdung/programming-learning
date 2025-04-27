import { PrismaClient, Role } from "@prisma/client";
import { AppError } from "../../shared/middleware/error.middleware";
import { sendEmail } from "../../shared/utils/email.service";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export class AdminService {
  async getAllTransactions() {
    try {
      const transactions = await prisma.transaction.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          wallet: {
            include: {
              instructor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return transactions.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        qrUrl: transaction.qrCodeUrl,
        createdAt: transaction.createdAt,
        instructor: transaction.wallet.instructor
          ? {
              firstName: transaction.wallet.instructor.user.firstName,
              lastName: transaction.wallet.instructor.user.lastName,
              email: transaction.wallet.instructor.user.email,
            }
          : null,
      }));
    } catch (error) {
      throw new AppError("Error fetching transactions", 500);
    }
  }

  async getTransactionById(transactionId: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          wallet: {
            include: {
              instructor: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      return {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
        instructor: transaction.wallet.instructor
          ? {
              firstName: transaction.wallet.instructor.user.firstName,
              lastName: transaction.wallet.instructor.user.lastName,
              email: transaction.wallet.instructor.user.email,
            }
          : null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error fetching transaction", 500);
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) {
    try {
      const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status },
        include: {
          wallet: true,
        },
      });

      // If transaction is approved and it's a withdrawal, update wallet balance
      if (transaction.type === "WITHDRAWAL") {
        if (status === "APPROVED") {
          await prisma.wallet.update({
            where: { id: transaction.wallet.id },
            data: {
              balance: {
                decrement: transaction.amount,
              },
            },
          });
        } else if (status === "REJECTED") {
          // Refund the wallet when transaction is rejected
          await prisma.wallet.update({
            where: { id: transaction.wallet.id },
            data: {
              balance: {
                increment: transaction.amount,
              },
            },
          });
        }
      }

      return transaction;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error updating transaction status", 500);
    }
  }

  async createSupporterAccount(supporterData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: supporterData.email },
    });

    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(supporterData.password, 10);

    const supporter = await prisma.user.create({
      data: {
        firstName: supporterData.firstName,
        lastName: supporterData.lastName,
        email: supporterData.email,
        password: hashedPassword,
        role: Role.SUPPORTER,
      },
    });

    await sendEmail(
      supporterData.email,
      "Welcome to GradeStack Support Team",
      `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: auto;">
    <h2 style="color: #2C3E50; text-align: center;">Welcome to <span style="color: #3498DB;">GradeStack</span> Support Team! 🎉</h2>
    <p style="font-size: 16px; color: #555;">Hello <strong>${supporterData.firstName}</strong>,</p>
    <p style="font-size: 16px; color: #555;">Your supporter account has been successfully created.</p>
    
    <div style="background: #ECF0F1; padding: 15px; border-radius: 5px; text-align: center; margin: 15px 0;">
      <p style="font-size: 18px; color: #333;">Your temporary password:</p>
      <h3 style="color: #E74C3C; margin: 0;">${supporterData.password}</h3>
    </div>

    <p style="font-size: 16px; color: #555;">Please log in and change your password immediately.</p>
    <a href="http://localhost:5173/" style="display: block; width: 200px; text-align: center; background: #3498DB; color: #fff; padding: 12px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px auto;">Go to Login</a>

    <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">Best regards,</p>
    <p style="font-size: 14px; color: #777; text-align: center;"><strong>GradeStack Education Team</strong></p>
  </div>
</div>
`
    );

    return supporter;
  }

  async getAllSupporters() {
    try {
      const supporters = await prisma.user.findMany({
        where: { role: Role.SUPPORTER },
      });

      return supporters;
    } catch (error) {
      throw new AppError("Error fetching supporters", 500);
    }
  }

  async getSupporterById(supporterId: string) {
    try {
      const supporter = await prisma.user.findUnique({
        where: { id: supporterId, role: Role.SUPPORTER },
      });

      if (!supporter) {
        throw new AppError("Supporter not found", 404);
      }

      return supporter;
    } catch (error) {
      throw new AppError("Error fetching supporter", 500);
    }
  }
    
    async updateSupporterStatus(supporterId: string, isBlocked: boolean) {
    try {
        const supporter = await prisma.user.findUnique({
          where: { id: supporterId, role: Role.SUPPORTER },
      })
      if (!supporter) {
        throw new AppError("Supporter not found", 404);
      }
      const updatedSupporter = await prisma.user.update({
        where: { id: supporterId },
        data: { isBlocked },
      });
      return updatedSupporter;
    } catch (error) {
      throw new AppError("Error updating supporter status", 500);
    }
  }

  async deleteSupporter(supporterId: string) {
    try {
      const supporter = await prisma.user.delete({
        where: { id: supporterId, role: Role.SUPPORTER },
      });
      return supporter;
    } catch (error) {
      throw new AppError("Error deleting supporter", 500);
    }
  }
}
