import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  // Get all users
  async getAllUsers() {  
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        Role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return users;
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        Role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }



}