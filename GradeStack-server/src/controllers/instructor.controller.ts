import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const createInstructorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { bio, certifications, thumbnail } = req.body;
        const userId = req.user.id;

        // Check if user already has an instructor profile
        const existingProfile = await prisma.instructor.findUnique({
            where: { userId }
        });

        if (existingProfile) {
            throw new HttpException(409, 'Instructor profile already exists');
        }

        // Create instructor profile
        // Note: certifications should be a string (URL) according to the schema
        const instructorProfile = await prisma.instructor.create({
            data: {
                bio,
                certifications: typeof certifications === 'string' ? certifications : null,
                thumbnail,
                userId
            }
        });

        res.status(201).json(instructorProfile);
    } catch (error) {
        next(error);
    }
};

export const getAllInstructors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const instructors = await prisma.instructor.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isBlocked: true
                    }
                },
                Course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true
                    }
                }
            }
        });

        res.status(200).json(instructors);
    } catch (error) {
        next(error);
    }
};

export const getInstructorById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const instructor = await prisma.instructor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isBlocked: true
                    }
                },
                Course: {
                    include: {
                        topics: true,
                        modules: {
                            select: {
                                id: true,
                                title: true
                            }
                        }
                    }
                }
            }
        });

        if (!instructor) {
            throw new HttpException(404, 'Instructor not found');
        }

        res.status(200).json(instructor);
    } catch (error) {
        next(error);
    }
};

export const getInstructorByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const instructor = await prisma.instructor.findUnique({
            where: { userId },
            include: {
                Course: true
            }
        });

        if (!instructor) {
            throw new HttpException(404, 'Instructor profile not found');
        }

        res.status(200).json(instructor);
    } catch (error) {
        next(error);
    }
};

export const approveInstructor = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // First, find the instructor to get the userId
        const instructor = await prisma.instructor.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!instructor) {
            throw new HttpException(404, 'Instructor not found');
        }

        // Update the user's role to INSTRUCTOR
        const updatedUser = await prisma.user.update({
            where: { id: instructor.userId },
            data: { role: 'INSTRUCTOR' }
        });

        res.status(200).json({
            message: 'Instructor approved successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateInstructorProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { bio, certifications, thumbnail } = req.body;
        const userId = req.user.id;

        // Find the instructor profile
        const instructorProfile = await prisma.instructor.findUnique({
            where: { userId }
        });

        if (!instructorProfile) {
            throw new HttpException(404, 'Instructor profile not found');
        }

        // Update the profile
        // Note: certifications should be a string (URL) according to the schema
        const updatedProfile = await prisma.instructor.update({
            where: { id: instructorProfile.id },
            data: {
                bio,
                certifications: typeof certifications === 'string' ? certifications : null,
                thumbnail
            }
        });

        res.status(200).json(updatedProfile);
    } catch (error) {
        next(error);
    }
};

export const getPendingInstructors = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Find instructors whose users have role USER (not yet approved)
        const pendingInstructors = await prisma.instructor.findMany({
            where: {
                user: {
                    role: 'USER'
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isBlocked: true,
                        createdAt: true
                    }
                }
            }
        });

        res.status(200).json(pendingInstructors);
    } catch (error) {
        next(error);
    }
}; 