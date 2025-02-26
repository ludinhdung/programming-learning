import { Router } from 'express';
import {
    createModule,
    getModuleById,
    updateModule,
    deleteModule
} from '../controllers/module.controller';
import { authMiddleware, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), createModule);
router.get('/:id', getModuleById);
router.put('/:id', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), updateModule);
router.delete('/:id', authMiddleware, authorizeRoles('INSTRUCTOR', 'ADMIN'), deleteModule);

export default router; 