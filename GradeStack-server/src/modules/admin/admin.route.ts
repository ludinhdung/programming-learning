/**
 * Định tuyến API cho module admin
 * @module AdminRoute
 */
import { Router } from 'express';
import { getDashboardOverview } from './admin.controller';
import { authenticate, authorize } from '../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @route GET /api/admin/dashboard-overview
 * @desc Lấy tổng quan dashboard cho admin
 * @access Private (Admin only)
 */
router.get('/dashboard-overview', authenticate, authorize(Role.ADMIN), getDashboardOverview);

export default router;
