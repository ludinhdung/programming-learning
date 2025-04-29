import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from './error.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
    userId: string;
    role: Role;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError('Không tìm thấy token xác thực', 401);
        }
        
        if (!authHeader.startsWith('Bearer ')) {
            throw new AppError('Định dạng token không hợp lệ', 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError('Token không được cung cấp', 401);
        }
        
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        } catch (jwtError: any) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                throw new AppError('Token đã hết hạn', 401);
            } else if (jwtError instanceof jwt.JsonWebTokenError) {
                throw new AppError('Token không hợp lệ', 401);
            } else {
                throw new AppError('Lỗi xác thực token', 401);
            }
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isBlocked: true
            }
        });

        if (!user) {
            throw new AppError('Người dùng không tồn tại', 401);
        }

        if (user.isBlocked) {
            throw new AppError('Tài khoản đã bị khóa', 403);
        }

        req.user = user;
        next();
    } catch (error: any) {
        if (error instanceof AppError) {
            next(error);
        } else {
            console.error('Lỗi xác thực:', error.message);
            next(new AppError('Xác thực thất bại', 401));
        }
    }
};

/**
 * Middleware kiểm tra quyền truy cập dựa trên vai trò người dùng
 * @param roles - Danh sách các vai trò được phép truy cập
 * @returns Middleware Express
 */
export const authorize = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Chưa được xác thực', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Không có quyền truy cập', 403));
        }

        next();
    };
};