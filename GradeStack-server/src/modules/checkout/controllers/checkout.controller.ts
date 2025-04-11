import { NextFunction, Request, Response } from 'express';
import { CheckoutService } from '../services/checkout.service';
import { PaymentSuccessService } from '../services/payment-success.service';
import { PaymentValidationService } from '../services/payment-validation.service';
import { AppError } from '../../../shared/middleware/error.middleware';
import dotenv from "dotenv";
import PayOS from "@payos/node";

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const KEY = process.env.KEY;
const CHECKSUM_KEY = process.env.CHECKSUM_KEY;

if (!KEY || !CHECKSUM_KEY || !CLIENT_ID) {
    throw new Error("Missing payment configuration variables");
}

const paymentClient = new PayOS(
    CLIENT_ID,
    KEY,
    CHECKSUM_KEY
);


export class CheckoutController {
    private checkoutService: CheckoutService;
    private paymentSuccessService: PaymentSuccessService;
    private paymentValidationService: PaymentValidationService;

    constructor() {
        this.checkoutService = new CheckoutService();
        this.paymentSuccessService = new PaymentSuccessService();
        this.paymentValidationService = new PaymentValidationService();
    }

    createPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { courseId, price, instructorId, courseName } = req.body;
            const userId = req.user.id;

            console.log('Payment request:', { courseId, price, instructorId, userId });

            if (!courseId || !price || !instructorId) {
                throw new AppError('Course ID, price, and instructor ID are required', 400);
            }

            await this.paymentValidationService.validatePaymentData(
                courseId,
                instructorId,
                price,
                userId
            );


            const paymentResponse = await this.checkoutService.createPayment(
                courseId,
                userId,
                instructorId,
                price,
                courseName
            );

            res.status(200).json(paymentResponse);
        } catch (error) {
            next(error);
        }
    };

    getPaymentInfo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId } = req.params;
            const paymentInfo = await this.checkoutService.getPaymentInfo(orderId);
            res.status(200).json(paymentInfo);
        } catch (error) {
            next(error);
        }
    };

    cancelPayment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;
            const result = await this.checkoutService.cancelPayment(orderId, reason);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = paymentClient.verifyPaymentWebhookData(req.body);

            await this.paymentSuccessService.handlePaymentSuccess(data);

            res.status(200).json({ message: 'Webhook processed successfully' });
        } catch (error) {
            next(error);
        }
    };
} 