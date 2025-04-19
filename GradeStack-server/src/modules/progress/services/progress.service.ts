import { PrismaClient, Role, Wallet, Prisma } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";

const prisma = new PrismaClient();

export class ProgressService {
    async updateProgress(learnerId: string, courseId: string, progress: number) {
        try {
            // Kiểm tra xem enrollment có tồn tại không
            const existingEnrollment = await prisma.enrolledCourse.findUnique({
                where: {
                    learnerId_courseId: {
                        learnerId,
                        courseId
                    }
                }
            });

            if (!existingEnrollment) {
                throw new AppError('Enrollment not found', 404);
            }

            // Update progress
            const updatedEnrollment = await prisma.enrolledCourse.update({
                where: {
                    learnerId_courseId: {
                        learnerId,
                        courseId
                    }
                },
                data: {
                    progress: progress,
                }
            });

            return updatedEnrollment;
        } catch (error) {
            console.error('Error updating enrollment progress:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to update enrollment progress', 500);
        }
    }

    async getCurrentProgress(learnerId: string, courseId: string) {
        try {
            const enrollment = await prisma.enrolledCourse.findUnique({
                where: {
                    learnerId_courseId: {
                        learnerId,
                        courseId
                    }
                }
            });

            if (!enrollment) {
                throw new AppError('Enrollment not found', 404);
            }

            return enrollment;
        } catch (error) {
            console.error('Error getting enrollment progress:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to get enrollment progress', 500);
        }
    }
}
