import dotenv from "dotenv";
import PayOS from "@payos/node";
import { WebhookType } from "@payos/node/lib/type";
import { AppError } from "../../../shared/middleware/error.middleware";

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

export class PaymentService {
    async createPayment(orderId: number, courseId: string, userId: string, instructorId: string, price: number, courseName: string) {
        try {
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 10);

            const data = {
                orderCode: orderId,
                amount: price,
                description: "Payment for course",
                cancelUrl: `${process.env.CLIENT_URL}/checkout/${courseId}`,
                returnUrl: `${process.env.CLIENT_URL}/courses/${courseId}`,
                expiryDate: expiryTime.toISOString(),
                items: [
                    {
                        name: `Payment for course ${courseName}`,
                        quantity: 1,
                        price: price,
                    }
                ]
            };

            const response = await paymentClient.createPaymentLink(data);
            return response;
        } catch (error) {
            throw new AppError("Failed to create payment link", 500);
        }
    }

    async getPaymentInfo(orderId: string) {
        try {
            return await paymentClient.getPaymentLinkInformation(orderId);
        } catch (error) {
            throw new AppError("Failed to retrieve payment information", 500);
        }
    }

    async cancelPayment(orderId: string, reason?: string) {
        try {
            return await paymentClient.cancelPaymentLink(orderId, reason);
        } catch (error) {
            throw new AppError("Failed to cancel payment", 500);
        }
    }

    async verifyWebhook(payload: WebhookType) {
        try {
            return await paymentClient.verifyPaymentWebhookData(payload);
        } catch (error) {
            throw new AppError("Invalid webhook payload", 400);
        }
    }

    async verifyWebhookUrl(apiUrl: string) {
        try {
            await paymentClient.confirmWebhook(apiUrl);
            return true;
        } catch (error) {
            throw new AppError("Failed to verify webhook URL", 500);
        }
    }
} 