import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Tạo tài khoản Admin
 * Tên đăng nhập: admin123
 * Mật khẩu: 123123
 */
async function createAdminAccount(): Promise<void> {
  try {
    // Kiểm tra xem tài khoản admin đã tồn tại chưa
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin123@gradestack.com',
        role: Role.ADMIN
      }
    });

    if (existingAdmin) {
      console.log('⚠️ Tài khoản admin đã tồn tại:');
      console.log({
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role
      });

      // Tạo token cho admin
      const token = jwt.sign(
        { userId: existingAdmin.id, role: existingAdmin.role },
        process.env.JWT_SECRET || 'my_secret',
        { expiresIn: '7d' }
      );

      console.log('\n🔑 Token cho admin:');
      console.log(token);
      return;
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash('123123', 10);

    // Tạo tài khoản admin mới
    const admin = await prisma.user.create({
      data: {
        email: 'admin123@gradestack.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Admin123',
        role: Role.ADMIN
      }
    });

    console.log('✅ Đã tạo tài khoản admin thành công:');
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    // Tạo token cho admin
    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'my_secret',
      { expiresIn: '7d' }
    );

    console.log('\n🔑 Token cho admin:');
    console.log(token);
    console.log('\n📝 Thông tin đăng nhập:');
    console.log('- Email: admin123@gradestack.com');
    console.log('- Mật khẩu: 123123');
    console.log('\n🌐 URL đăng nhập: http://localhost:5173/admin/');

  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Thực thi hàm
createAdminAccount();
