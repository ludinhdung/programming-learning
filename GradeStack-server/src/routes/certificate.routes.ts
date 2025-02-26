import { Router } from 'express';
import {
    createCertificate,
    getUserCertificates,
    deleteCertificate
} from '../controllers/certificate.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, createCertificate);
router.get('/my-certificates', authMiddleware, getUserCertificates);
router.delete('/:id', authMiddleware, deleteCertificate);

export default router; 