import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/middleware/error.middleware";

const prisma = new PrismaClient();

export class AdminService {
    async getAllTransactions() {
        try {
            const transactions = await prisma.transaction.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    wallet: {
                        include: {
                            instructor: {
                                include: {
                                    user: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return transactions.map(transaction => ({
                id: transaction.id,
                amount: transaction.amount,
                type: transaction.type,
                status: transaction.status,
                createdAt: transaction.createdAt,
                instructor: transaction.wallet.instructor ? {
                    firstName: transaction.wallet.instructor.user.firstName,
                    lastName: transaction.wallet.instructor.user.lastName,
                    email: transaction.wallet.instructor.user.email
                } : null
            }));
        } catch (error) {
            throw new AppError('Error fetching transactions', 500);
        }
    }

    async getTransactionById(transactionId: string) {
        try {
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    wallet: {
                        include: {
                            instructor: {
                                include: {
                                    user: {
                                        select: {
                                            firstName: true,
                                            lastName: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!transaction) {
                throw new AppError('Transaction not found', 404);
            }

            return {
                id: transaction.id,
                amount: transaction.amount,
                type: transaction.type,
                status: transaction.status,
                createdAt: transaction.createdAt,
                instructor: transaction.wallet.instructor ? {
                    firstName: transaction.wallet.instructor.user.firstName,
                    lastName: transaction.wallet.instructor.user.lastName,
                    email: transaction.wallet.instructor.user.email
                } : null
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error fetching transaction', 500);
        }
    }

    async updateTransactionStatus(transactionId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
        try {
            const transaction = await prisma.transaction.update({
                where: { id: transactionId },
                data: { status },
                include: {
                    wallet: true
                }
            });

            // If transaction is approved and it's a withdrawal, update wallet balance
            if (status === 'APPROVED' && transaction.type === 'WITHDRAWAL') {
                await prisma.wallet.update({
                    where: { id: transaction.wallet.id },
                    data: {
                        balance: {
                            decrement: transaction.amount
                        }
                    }
                });
            }

            return transaction;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Error updating transaction status', 500);
        }
    }
}
