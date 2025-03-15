import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();

router.get('/:id', UserController.getById);


export default router;