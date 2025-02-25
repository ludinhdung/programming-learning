import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpException } from './error.middleware';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; 

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new HttpException(401, 'No token provided');
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new HttpException(401, 'Invalid token'));
        } else {
            next(error);
        }
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new HttpException(401, 'Not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            throw new HttpException(403, 'Not authorized to access this resource');
        }

        next();
    };
}; 