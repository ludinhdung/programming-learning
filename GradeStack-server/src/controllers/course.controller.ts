import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const createCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, description, thumbnail, duration, price, topics } = req.body;
        const userId = req.user.id;

        const instructor = await prisma.instructor.findUnique({
            where: { userId }
        });

        if (!instructor) {
            throw new HttpException(400, 'Instructor profile not found');
        }

        let courseData: any = {
            title,
            description,
            thumbnail,
            duration,
            price,
            instructor: {
                connect: { id: instructor.id }
            }
        };

        if (topics && topics.length > 0) {
            const existingTopics = await prisma.topic.findMany({
                where: {
                    title: {
                        in: topics
                    }
                }
            });


            if (existingTopics.length > 0) {
                courseData.topics = {
                    connect: existingTopics.map(topic => ({ id: topic.id }))
                };
            }
        }

        const course = await prisma.course.create({
            data: courseData,
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                duration: true,
                price: true,
                isPublished: true,
                createdAt: true,
                topics: {
                    select: {
                        // id: true,
                        title: true
                    }
                }
            }
        });

        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

export const getAllCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                instructor: true,
                topics: true,
                modules: true
            }
        });
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

export const getCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: true,
                topics: true,
                modules: true
            }
        });

        if (!course) {
            throw new HttpException(404, 'Course not found');
        }

        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { title, description, thumbnail, duration, price, topics } = req.body;

        const course = await prisma.course.update({
            where: { id },
            data: {
                title,
                description,
                thumbnail,
                duration,
                price,
                topics: {
                    set: topics?.map((id: string) => ({ id })) || []
                }
            },
            include: {
                instructor: true,
                topics: true,
                modules: true
            }
        });

        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 