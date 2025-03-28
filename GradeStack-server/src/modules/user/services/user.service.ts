import { PrismaClient } from '@prisma/client';

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
      throw new Error('User not found');
    }

    return user;
  }

  async changeUserStatus(id: string, status: { isBlocked?: boolean; isVerified?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error('User not found');
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
}