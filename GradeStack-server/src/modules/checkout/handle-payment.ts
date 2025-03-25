import dotenv from "dotenv";
import PayOS from "@payos/node";
import { WebhookType } from "@payos/node/lib/type";

dotenv.config();
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_KEY = process.env.PAYOS_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

if (!PAYOS_KEY || !PAYOS_CHECKSUM_KEY || !PAYOS_CLIENT_ID) {
    console.error("Missing Variable For PayOS!");
    process.exit(1);
}

const payOS = new PayOS(
    PAYOS_CLIENT_ID,
    PAYOS_KEY,
    PAYOS_CHECKSUM_KEY
);

export const createPayment = async (orderId: number | string) => {
    try {
        console.log("Tiến hành tạo link thanh toán");
        const now = Math.floor(Date.now() / 1000);
        const validExpiredAt = now + 3600;

        const data = {
            orderCode: Number(orderId),
            amount: 10000,
            description: 'Order',//max 25 ky tu
            buyerName: "Mr.Tea",
            buyerPhone: "012345678",
            buyerAddress: "123 str, California, USA",
            cancelUrl: "http://localhost:3000",
            returnUrl: "http://localhost:7000/api/checkResultPayOS",
        };

        console.log("Description: ", data.description);


        const payOSResponse = await payOS.createPaymentLink(data);

        console.log("Payment Link created:", payOSResponse);
        return payOSResponse;
    } catch (error) {
        console.error(" Error creating payment link:", error);
        throw error;
    }
};


export const getPaymentInfo = async (orderId: number | string) => {
    try {
        const result = await payOS.getPaymentLinkInformation(orderId);
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error fetching payment info:", error);
        throw new Error("Failed to retrieve payment information");
    }
}

export const cancelPayment = async (orderId: number | string, reason?: string) => {
    try {
        const cancelledPaymentLink = await payOS.cancelPaymentLink(orderId, reason);
        console.log(cancelledPaymentLink);
    } catch (error) {
        console.error("Error cancel payment: ", error);
        throw new Error("Failed to cancel payment!");
    }
}

export const handleWebhookPayOS = async (request: WebhookType) => {
    console.log("✅ Webhook Data Received:", request);

    try {
        const webhookData = payOS.verifyPaymentWebhookData(request);
        console.log("Verified Webhook Data:", webhookData);
    } catch (error) {
        console.error("Error verifying PayOS webhook:", error);
    }
}


export const verifyAPI = async (apiurl: string) => {
    try {
        console.log("🔍 Verifying webhook API:", apiurl);

        await payOS.confirmWebhook(apiurl);

    } catch (error) {
        console.error("❌ Error confirming webhook:", error);
    }
}

// createPayment(112233);
getPaymentInfo(112233);
verifyAPI("https://3013-14-185-58-56.ngrok-free.app/api/users/confirmWebhook");
// cancelPayment(123);