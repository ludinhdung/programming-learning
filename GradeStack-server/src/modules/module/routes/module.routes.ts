import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller';
// import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const moduleController = new ModuleController();

// Routes for module management
router.get('/courses/:courseId/modules', moduleController.getModules);
router.get('/modules/:moduleId', moduleController.getModule);
router.post('/courses/:courseId/modules', moduleController.createModule);
router.put('/modules/:moduleId', moduleController.updateModule);
router.delete('/modules/:moduleId', moduleController.deleteModule);
router.put('/modules/:moduleId/video', moduleController.updateModuleVideo);

export default router;