import { Router } from 'express';
import {
    createInstructorProfile,
    getAllInstructors,
    getInstructorById,
    getInstructorByUserId,
    approveInstructor,
    updateInstructorProfile,
    getPendingInstructors
} from '../controllers/instructor.controller';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// Create instructor profile (any authenticated user can apply)
router.post('/apply', authMiddleware, createInstructorProfile);

// Get own instructor profile
router.get('/profile', authMiddleware, getInstructorByUserId);

// Update own instructor profile
router.put('/profile', authMiddleware, authorizeRoles('INSTRUCTOR'), updateInstructorProfile);

// Admin routes for managing instructors
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getAllInstructors);
router.get('/pending', authMiddleware, authorizeRoles('ADMIN'), getPendingInstructors);
router.get('/:id', authMiddleware, getInstructorById);
router.put('/:id/approve', authMiddleware, authorizeRoles('ADMIN'), approveInstructor);

export default router; 