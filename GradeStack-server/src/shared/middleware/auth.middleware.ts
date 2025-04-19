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
            resourceOwnerId?: string;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

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
            throw new AppError('User not found', 401);
        }

        if (user.isBlocked) {
            throw new AppError('Account is blocked', 403);
        }

        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Authentication failed', 401));
    }
};

/**
 * Middleware để xác thực quyền truy cập dựa trên vai trò
 * @param roles - Danh sách các vai trò được phép truy cập
 */
export const authorize = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Not authorized', 403));
        }

        next();
    };
};

/**
 * Middleware để kiểm tra người dùng chỉ được thao tác trên dữ liệu của chính họ
 * Sử dụng cho INSTRUCTOR_LEAD
 */
export const checkResourceOwnership = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('Not authenticated', 401));
            }

            // Lấy ID từ tham số URL (thường là ID của instructor)
            const resourceOwnerId = req.params.id;
            
            // Nếu người dùng là ADMIN hoặc SUPPORTER, cho phép truy cập
            if (req.user.role === Role.ADMIN || req.user.role === Role.SUPPORTER) {
                return next();
            }
            
            // Kiểm tra xem người dùng có phải là chủ sở hữu của tài nguyên không
            if (req.user.id !== resourceOwnerId) {
                return next(new AppError('You are not authorized to access this resource', 403));
            }
            
            // Lưu ID của chủ sở hữu tài nguyên vào request để sử dụng sau này
            req.resourceOwnerId = resourceOwnerId;
            next();
        } catch (error) {
            next(new AppError('Authorization check failed', 500));
        }
    };
};

/**
 * Middleware để kiểm tra quyền sở hữu của một tài nguyên cụ thể (learning path, workshop)
 */
export const checkSpecificResourceOwnership = (resourceType: 'learningPath' | 'workshop') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return next(new AppError('Not authenticated', 401));
            }

            // Nếu người dùng là ADMIN hoặc SUPPORTER, cho phép truy cập
            if (req.user.role === Role.ADMIN || req.user.role === Role.SUPPORTER) {
                return next();
            }

            const userId = req.user.id;
            const resourceId = req.params.learningPathId || req.params.workshopId;

            if (!resourceId) {
                return next(new AppError('Resource ID not provided', 400));
            }

            let isOwner = false;

            if (resourceType === 'learningPath') {
                // Kiểm tra quyền sở hữu learning path
                const learningPath = await prisma.learningPath.findUnique({
                    where: { id: resourceId },
                    select: { instructorUserId: true }
                });

                isOwner = learningPath?.instructorUserId === userId;
            } else if (resourceType === 'workshop') {
                // Kiểm tra quyền sở hữu workshop
                const workshop = await prisma.workshop.findUnique({
                    where: { id: resourceId },
                    select: { instructorId: true }
                });

                const instructor = await prisma.instructor.findUnique({
                    where: { userId: userId },
                    select: { userId: true }
                });

                isOwner = workshop?.instructorId === instructor?.userId;
            }

            if (!isOwner) {
                return next(new AppError('You do not have permission to access this resource', 403));
            }

            next();
        } catch (error) {
            next(new AppError('Resource ownership check failed', 500));
        }
    };
};