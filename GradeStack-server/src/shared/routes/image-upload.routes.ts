import { Router } from 'express';
import { imageUploadController } from '../controllers/image-upload.controller';
import { uploadImage, uploadImages } from '../middlewares/upload.middleware';

const router = Router();

// Image upload routes
router.post('/upload', uploadImage, imageUploadController.uploadSingleImage);
router.post('/upload-multiple', uploadImages, imageUploadController.uploadMultipleImages);

export default router;
