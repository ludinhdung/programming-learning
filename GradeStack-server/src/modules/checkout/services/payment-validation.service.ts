import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/middleware/error.middleware';

const prisma = new PrismaClient();

export class PaymentValidationService {
    async validatePaymentData(courseId: string, instructorId: string, price: number, learnerId: string) {
        if (!courseId || !instructorId || !learnerId || price === undefined) {
            throw new AppError('Missing required parameters', 400);
        }

        if (price <= 0) {
            throw new AppError('Price must be greater than 0', 400);
        }

        const instructor = await prisma.instructor.findUnique({
            where: { userId: instructorId },
            include: {
                Wallet: true,
                Course: {
                    where: { id: courseId },
                    select: { id: true }
                }
            }
        });

        if (!instructor) {
            throw new AppError('Instructor not found', 404);
        }

        if (!instructor.Wallet) {
            throw new AppError('Instructor wallet not found', 404);
        }

        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                instructorId: instructor.userId
            },
            select: {
                id: true,
                title: true,
                price: true,
                instructorId: true,
                isPublished: true,
                duration: true,
                thumbnail: true,
                description: true
            }
        });

        if (!course) {
            throw new AppError('Course not found or does not belong to the instructor', 404);
        }

        if (!course.isPublished) {
            throw new AppError('Course is not published', 400);
        }

        const coursePrice = Number(course.price);
        if (coursePrice !== price) {
            throw new AppError(`Invalid course price. Expected: ${coursePrice}, Received: ${price}`, 400);
        }

        const existingEnrollment = await prisma.enrolledCourse.findUnique({
            where: {
                learnerId_courseId: {
                    learnerId: learnerId,
                    courseId: courseId
                }
            }
        });

        if (existingEnrollment) {
            throw new AppError('User is already enrolled in this course', 400);
        }

        return {
            course: {
                ...course,
                price: coursePrice
            },
            instructor: {
                userId: instructor.userId,
                organization: instructor.organization,
                walletId: instructor.Wallet.id
            },
            isValid: true
        };
    }
} 