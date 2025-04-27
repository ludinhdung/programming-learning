import express from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { authorize } from '../../shared/middleware/auth.middleware';

const router = express.Router();
const adminController = new AdminController();

// Transaction routes
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/:id', authenticate, authorize('ADMIN'), adminController.getTransactionById);
router.patch('/transactions/:id/status', authenticate, authorize('ADMIN'), adminController.updateTransactionStatus);

// Supporter routes
router.post('/create/supporter', authenticate, authorize('ADMIN'), adminController.createSupporterAccount);
router.get('/supporters', authenticate, authorize('ADMIN'), adminController.getAllSupporters);
router.get('/supporters/:id', authenticate, authorize('ADMIN'), adminController.getSupporterById);
router.patch('/supporters/:id/status', authenticate, authorize('ADMIN'), adminController.updateSupporterStatus);
router.delete('/supporters/:id', authenticate, authorize('ADMIN'), adminController.deleteSupporter);

export default router;