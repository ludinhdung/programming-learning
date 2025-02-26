import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const createModule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description, courseId } = req.body;

        const module = await prisma.module.create({
            data: {
                title,
                description,
                courseId
            },
            include: {
                contents: true
            }
        });

        res.status(201).json(module);
    } catch (error) {
        next(error);
    }
};

export const getModuleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const module = await prisma.module.findUnique({
            where: { id },
            include: {
                contents: true
            }
        });

        if (!module) {
            throw new HttpException(404, 'Module not found');
        }

        res.status(200).json(module);
    } catch (error) {
        next(error);
    }
};

export const updateModule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const module = await prisma.module.update({
            where: { id },
            data: {
                title,
                description
            },
            include: {
                contents: true
            }
        });

        res.status(200).json(module);
    } catch (error) {
        next(error);
    }
};

export const deleteModule = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await prisma.module.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 