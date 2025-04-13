import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../shared/middleware/error.middleware';

const prisma = new PrismaClient();

export class AuthService {
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new AppError('Email already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: Role.LEARNER
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isVerified: true,
                createdAt: true
            }
        });

        const token = this.generateToken(user.id, user.role);

        return { user, token };
    }

    async login(credentials: { email: string; password: string }) {
        const user = await prisma.user.findUnique({
            where: { email: credentials.email }
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        if (user.isBlocked) {
            throw new AppError('Account is blocked', 403);
        }

        const token = this.generateToken(user.id, user.role);
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    private generateToken(userId: string, role: Role) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new AppError('JWT_SECRET is not configured', 500);
        }
        return jwt.sign({ userId, role }, secret, { expiresIn: '1d' });
    }
}