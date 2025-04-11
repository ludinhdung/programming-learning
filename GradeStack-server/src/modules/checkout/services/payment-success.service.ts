import { PrismaClient } from '@prisma/client';
import { AppError } from '../../../shared/middleware/error.middleware';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export class PaymentSuccessService {
    async createEnrolledCourse(learnerId: string, courseId: string) {
        try {
            console.log('Creating enrolled course for:', { learnerId, courseId });

            const existingEnrollment = await prisma.enrolledCourse.findUnique({
                where: {
                    learnerId_courseId: {
                        learnerId,
                        courseId
                    }
                }
            });

            if (existingEnrollment) {
                console.log('Enrollment already exists:', existingEnrollment);
                throw new AppError('User is already enrolled in this course', 400);
            }

            const enrollment = await prisma.enrolledCourse.create({
                data: {
                    learnerId,
                    courseId,
                    progress: 0,
                }
            });
            console.log('Created enrollment:', enrollment);
            return enrollment;
        } catch (error) {
            console.error('Error in createEnrolledCourse:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Failed to create enrolled course', 500);
        }
    }

    async createTransaction(instructorId: string, amount: number) {
        try {
            console.log('Creating transaction for instructor:', { instructorId, amount });

            const wallet = await prisma.wallet.findUnique({
                where: { instructorId }
            });

            if (!wallet) {
                console.log('Wallet not found for instructor:', instructorId);
                throw new AppError('Instructor wallet not found', 404);
            }

            const instructorShare = amount * 0.85;
            console.log('Calculated instructor share:', instructorShare);

            const transaction = await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: instructorShare,
                    type: 'REVENUE',
                    status: 'APPROVED'
                }
            });
            console.log('Created transaction:', transaction);

            const updatedWallet = await prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: instructorShare
                    }
                }
            });
            console.log('Updated wallet balance:', updatedWallet);

            return transaction;
        } catch (error) {
            throw new AppError('Failed to create transaction', 500);
        }
    }

    async createPurchaseHistory(learnerId: string, courseId: string, amount: number) {
        try {
            console.log('Creating purchase history:', { learnerId, courseId, amount });

            const existingPurchase = await prisma.purchaseHistory.findFirst({
                where: {
                    learnerId,
                    courseId
                }
            });

            if (existingPurchase) {
                console.log('Purchase history already exists:', existingPurchase);
                throw new AppError('Purchase history already exists for this course', 400);
            }

            const purchase = await prisma.purchaseHistory.create({
                data: {
                    learnerId,
                    courseId,
                    price: amount,
                }
            });
            console.log('Created purchase history:', purchase);
            return purchase;
        } catch (error) {
            throw new AppError('Failed to create purchase history', 500);
        }
    }

    async handlePaymentSuccess(webhookData: any) {
        console.log('Received webhook data:', webhookData);

        const { orderCode } = webhookData;

        const order = await prisma.order.findUnique({
            where: { orderCode }
        });

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        const { courseId, userId, instructorId, amount } = order;

        console.log('Extracted data:', { courseId, userId, instructorId, amount });

        try {
            await prisma.$transaction(async (tx) => {
                console.log('Starting transaction...');

                console.log('Step 1: Creating enrolled course');
                await this.createEnrolledCourse(userId, courseId);

                console.log('Step 2: Creating transaction');
                await this.createTransaction(instructorId, Number(amount));

                console.log('Step 3: Creating purchase history');
                await this.createPurchaseHistory(userId, courseId, Number(amount));

                console.log('Step 4: Updating order status');
                const updatedOrder = await prisma.order.update({
                    where: { orderCode },
                    data: { status: "SUCCESS" }
                });
                console.log('Updated order status:', updatedOrder);

                console.log('Transaction completed successfully');
            });

            return true;
        } catch (error) {
            throw new AppError('Failed to process payment success', 500);
        }
    }
} 