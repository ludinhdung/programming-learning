import { Request, Response } from 'express';
import { imageUploadService } from '../services/image-upload.service';
import { UploadedFile } from '../services/r2-storage.service';

export class ImageUploadController {
  /**
   * Handle error responses
   */
  private handleError(res: Response, error: any): void {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({ message });
  }

  /**
   * Upload a single image
   */
  public uploadSingleImage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if file exists in the request
      if (!req.file) {
        res.status(400).json({ message: 'No image file uploaded' });
        return;
      }

      const file = req.file as unknown as UploadedFile;
      const folder = req.query.folder as string || 'images';
      
      // Upload the image
      const result = await imageUploadService.uploadImage(file, folder);
      
      res.status(201).json({
        success: true,
        imageUrl: result.imageUrl
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Upload multiple images
   */
  public uploadMultipleImages = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if files exist in the request
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({ message: 'No image files uploaded' });
        return;
      }

      const files = req.files as unknown as UploadedFile[];
      const folder = req.query.folder as string || 'images';
      
      // Upload the images
      const results = await imageUploadService.uploadMultipleImages(files, folder);
      
      res.status(201).json({
        success: true,
        images: results.map(result => ({ imageUrl: result.imageUrl }))
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };
}

// Export a singleton instance
export const imageUploadController = new ImageUploadController();
