import { Router } from 'express';
import { WorkshopController } from '../controllers/workshop.controller';
import { authenticate, authorize, checkResourceOwnership, checkSpecificResourceOwnership } from '../../../shared/middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const workshopController = new WorkshopController();

/**
 * Routes công khai - không yêu cầu xác thực
 */
// Lấy danh sách workshop
router.get('/workshops', workshopController.getWorkshops);

// Lấy thông tin chi tiết workshop
router.get('/workshops/:workshopId', workshopController.getWorkshop);

// Lấy thông tin preview của workshop
router.get('/workshops/:workshopId/preview', workshopController.getWorkshopPreview);

/**
 * Routes cho INSTRUCTOR và INSTRUCTOR_LEAD
 * - Yêu cầu xác thực (authenticate)
 * - Yêu cầu quyền INSTRUCTOR hoặc INSTRUCTOR_LEAD (authorize)
 * - Kiểm tra quyền sở hữu tài nguyên (checkResourceOwnership)
 * - Kiểm tra quyền sở hữu workshop cụ thể (checkSpecificResourceOwnership)
 */
// Tạo workshop mới
router.post(
    '/instructors/:id/workshops', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    workshopController.createWorkshop
);

// Cập nhật workshop
router.put(
    '/instructors/:id/workshops/:workshopId', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('workshop'),
    workshopController.updateWorkshop
);

// Xóa workshop
router.delete(
    '/instructors/:id/workshops/:workshopId', 
    authenticate, 
    authorize(Role.INSTRUCTOR, Role.INSTRUCTOR_LEAD, Role.ADMIN),
    checkResourceOwnership(),
    checkSpecificResourceOwnership('workshop'),
    workshopController.deleteWorkshop
);

/**
 * Routes cho LEARNER
 * - Yêu cầu xác thực (authenticate)
 * - Yêu cầu quyền LEARNER (authorize)
 * - Kiểm tra quyền sở hữu tài nguyên (checkResourceOwnership)
 */
// Đăng ký tham dự workshop
router.post(
    '/learners/:id/workshops/register', 
    authenticate, 
    authorize(Role.LEARNER, Role.ADMIN),
    checkResourceOwnership(),
    workshopController.registerWorkshop
);

// Hủy đăng ký tham dự workshop
router.delete(
    '/learners/:id/workshops/:workshopId/register', 
    authenticate, 
    authorize(Role.LEARNER, Role.ADMIN),
    checkResourceOwnership(),
    workshopController.cancelRegistration
);

// Lấy danh sách workshop đã đăng ký
router.get(
    '/learners/:id/workshops', 
    authenticate, 
    authorize(Role.LEARNER, Role.ADMIN),
    checkResourceOwnership(),
    workshopController.getRegisteredWorkshops
);

export default router;
