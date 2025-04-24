import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();
const certificateController = new CertificateController();

// Certificate routes
router.post('/certificates', certificateController.createCertificate);
router.get('/certificates', certificateController.getAllCertificates);
router.get('/certificates/:certificateId', certificateController.getCertificateById);
router.put('/certificates/:certificateId', certificateController.updateCertificate);
router.delete('/certificates/:certificateId', certificateController.deleteCertificate);

// Get certificates by learner
router.get('/learners/:learnerId/certificates', certificateController.getCertificatesByLearnerId);

// Get certificates by course
router.get('/courses/:courseId/certificates', certificateController.getCertificatesByCourseId);

// Get certificate by learner and course
router.get('/learners/:learnerId/courses/:courseId/certificate', certificateController.getCertificateByLearnerAndCourse);

router.post("/certificates/hook", certificateController.handleWebhook);

export default router;
