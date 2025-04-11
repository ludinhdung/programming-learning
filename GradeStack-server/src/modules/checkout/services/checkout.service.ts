import { Decimal } from '@prisma/client/runtime/library';
import { AppError } from '../../../shared/middleware/error.middleware';
import { PaymentService } from './payment.service';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CheckoutService {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    async createPayment(courseId: string, userId: string, instructorId: string, price: number, courseName: string) {
        try {
            console.log('Creating payment with data:', { courseId, userId, instructorId, price });

            if (!courseId || !userId || !instructorId || !price) {
                throw new AppError('Missing required parameters', 400);
            }

            if (price <= 0) {
                throw new AppError('Price must be greater than 0', 400);
            }

            let orderCode = Math.floor(Date.now() / 1000);
            console.log('Generated order code:', orderCode);

            const existingOrder = await prisma.order.findUnique({
                where: { orderCode }
            });

            if (existingOrder) {
                console.log('Order code already exists, generating new one');
                orderCode = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
                console.log('New order code:', orderCode);
            }

            const order = await prisma.order.create({
                data: {
                    orderCode,
                    courseId,
                    userId,
                    instructorId,
                    amount: new Decimal(price),
                    status: "PENDING"
                }
            });

            console.log('Created order:', order);


            const paymentResponse = await this.paymentService.createPayment(
                order.orderCode,
                order.courseId,
                order.userId,
                order.instructorId,
                Number(order.amount),
                courseName
            );

            console.log('Payment response:', paymentResponse);

            return paymentResponse;
        } catch (error) {
            throw new AppError('Failed to create payment', 500);
        }
    }

    async getPaymentInfo(orderId: string) {
        try {
            return await this.paymentService.getPaymentInfo(orderId);
        } catch (error) {
            throw new AppError('Failed to get payment information', 500);
        }
    }

    async cancelPayment(orderId: string, reason?: string) {
        try {
            return await this.paymentService.cancelPayment(orderId, reason);
        } catch (error) {
            throw new AppError('Failed to cancel payment', 500);
        }
    }

    async handleWebhook(payload: any) {
        try {
            const isValid = await this.paymentService.verifyWebhook(payload);
            if (!isValid) {
                throw new AppError('Invalid webhook payload', 400);
            }
            return true;
        } catch (error) {
            throw new AppError('Failed to process webhook', 500);
        }
    }
} 