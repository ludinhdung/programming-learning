import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Tạo JWT token cho người dùng
 */
async function generateToken(): Promise<void> {
  try {
    // Tìm người dùng INSTRUCTOR_LEAD
    const instructorLead = await prisma.user.findFirst({
      where: {
        email: 'instructorlead@example.com',
        role: Role.INSTRUCTOR_LEAD
      }
    });

    if (!instructorLead) {
      console.error('Không tìm thấy người dùng INSTRUCTOR_LEAD');
      return;
    }

    // Tạo token
    const token = jwt.sign(
      { userId: instructorLead.id, role: instructorLead.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    console.log('Token đã được tạo:');
    console.log(token);
    console.log('\nCập nhật biến @token trong file instructorlead.rest với token này.');

    // Tìm người dùng LEARNER
    const learner = await prisma.user.findFirst({
      where: {
        email: 'learner@example.com',
        role: Role.LEARNER
      }
    });

    if (learner) {
      // Tạo token cho LEARNER
      const learnerToken = jwt.sign(
        { userId: learner.id, role: learner.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      console.log('\nToken cho LEARNER:');
      console.log(learnerToken);
    }

  } catch (error) {
    console.error('Lỗi khi tạo token:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Thực thi hàm
generateToken();
