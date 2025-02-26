import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const createTopic = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            throw new HttpException(400, 'Title and description are required');
        }

        const topic = await prisma.topic.create({
            data: {
                title,
                description
            }
        });

        res.status(201).json(topic);
    } catch (error) {
        next(error);
    }
};

export const getAllTopics = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const topics = await prisma.topic.findMany();
        res.status(200).json(topics);
    } catch (error) {
        next(error);
    }
};

export const getTopicById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const topic = await prisma.topic.findUnique({
            where: { id }
        });

        if (!topic) {
            throw new HttpException(404, 'Topic not found');
        }

        res.status(200).json(topic);
    } catch (error) {
        next(error);
    }
};

export const updateTopic = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const topic = await prisma.topic.update({
            where: { id },
            data: {
                title,
                description
            }
        });

        res.status(200).json(topic);
    } catch (error) {
        next(error);
    }
};

export const deleteTopic = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await prisma.topic.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 