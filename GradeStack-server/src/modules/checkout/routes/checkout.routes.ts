import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { authenticate, authorize } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const checkoutController = new CheckoutController();

router.post('/create-payment', authenticate, checkoutController.createPayment);
router.get('/payment-info/:orderId', authenticate, authorize(Role.ADMIN), checkoutController.getPaymentInfo);
router.post('/cancel-payment/:orderId', checkoutController.cancelPayment);

router.post('/webhook', checkoutController.handleWebhook);

export default router; 