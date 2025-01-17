import prisma from '../../../shared/config/prisma';
import { RegisterDTO, LoginDTO, AuthResponse } from '../types/auth.types';
import { hashPassword, comparePassword } from '../../../shared/utils/password.util';
import { generateToken, verifyToken } from '../../../shared/utils/jwt.util';
import { EmailService } from '../../../shared/services/email.service';

// Lưu blacklisted tokens trong memory (trong production nên dùng Redis)
const blacklistedTokens: Set<string> = new Set();

export class AuthService {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword
      }
    });

    const token = generateToken({ userId: user.id });

    // Send verification email (choose one method)
    if (process.env.VERIFICATION_METHOD === 'LINK') {
      await EmailService.sendVerificationLink(user.email, token);
    } else {
      const verificationCode = await EmailService.sendVerificationCode(user.email);
      // Save verification code to database with expiration
      console.log("verificationCode: ",verificationCode);
    }

    return { token, message: 'Please check your email to verify your account' };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ userId: user.id });
    return { token, message: 'Login successful' };
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      // Verify token trước khi blacklist
      const decoded = verifyToken(token);
      
      // Thêm token vào blacklist
      blacklistedTokens.add(token);

      // Cleanup expired tokens (optional)
      this.cleanupBlacklistedTokens();

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private cleanupBlacklistedTokens(): void {
    // Xóa tokens hết hạn sau 24h
    const now = new Date();
    blacklistedTokens.forEach(token => {
      try {
        verifyToken(token);
      } catch (error) {
        blacklistedTokens.delete(token);
      }
    });
  }

  // Method để check token có bị blacklist không
  static isTokenBlacklisted(token: string): boolean {
    return blacklistedTokens.has(token);
  }
}
