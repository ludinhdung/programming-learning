import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userClient = prisma.user;

export class UserService {
  // Get user by ID
  async getById(id: string) {
    const user = await userClient.findUnique({
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