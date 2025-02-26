import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpException } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export const createCertificate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { title, thumbnail, url } = req.body;
        const userId = req.user.id;

        const certificate = await prisma.courseCertificate.create({
            data: {
                title,
                thumbnail,
                url,
                userId
            }
        });

        res.status(201).json(certificate);
    } catch (error) {
        next(error);
    }
};

export const getUserCertificates = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user.id;

        const certificates = await prisma.courseCertificate.findMany({
            where: { userId }
        });

        res.status(200).json(certificates);
    } catch (error) {
        next(error);
    }
};

export const deleteCertificate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Check if certificate exists and belongs to the user
        const certificate = await prisma.courseCertificate.findUnique({
            where: { id }
        });

        if (!certificate) {
            throw new HttpException(404, 'Certificate not found');
        }

        if (certificate.userId !== userId && req.user.role !== 'ADMIN') {
            throw new HttpException(403, 'Not authorized to delete this certificate');
        }

        await prisma.courseCertificate.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 