import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userClient = new PrismaClient().user;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userData = req.body;
        const requiredFields = ['email', 'password', 'firstName', 'lastName'];

        const missingFields = requiredFields.filter(field => !userData[field]);

        if (missingFields.length > 0) {
            throw new HttpException(
                400,
                `Missing required fields: ${missingFields.join(', ')}`
            );
        }

        const existingUser = await userClient.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new HttpException(409, 'User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const user = await userClient.create({
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new HttpException(400, 'Email and password are required');
        }

        const user = await userClient.findUnique({
            where: { email },
        });

        if (!user) {
            throw new HttpException(401, 'Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new HttpException(401, 'Invalid credentials');
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}; 