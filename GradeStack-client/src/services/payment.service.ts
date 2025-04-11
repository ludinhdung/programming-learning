import api from './api';

export interface CreatePaymentRequest {
    courseId: string;
    price: number;
    instructorId: string;
    courseName: string;
}

export interface PaymentResponse {
    id: string;
    status: string;
    checkoutUrl?: string;
    message?: string;
}

export interface PaymentDetail {
    id: string;
    courseId: string;
    amount: number;
    status: string;
    paymentMethod: string;
    checkoutUrl?: string;
    message?: string;
    createdAt: string;
    updatedAt: string;
}

class PaymentService {
    async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await api.post('/checkout/create-payment', data);
            return response.data;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    }

    async getPaymentInfo(orderId: string): Promise<PaymentDetail> {
        try {
            const response = await api.get(`/checkout/payment-info/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching payment info for order ${orderId}:`, error);
            throw error;
        }
    }

    async cancelPayment(orderId: string, reason: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.post(`/checkout/cancel-payment/${orderId}`, { reason });
            return response.data;
        } catch (error) {
            console.error(`Error canceling payment for order ${orderId}:`, error);
            throw error;
        }
    }
}

export const paymentService = new PaymentService(); 