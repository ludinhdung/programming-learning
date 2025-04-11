import { r2StorageService, UploadedFile, ImageUploadResult } from './r2-storage.service';

export class ImageUploadService {
  /**
   * Upload an image to storage
   * @param file The image file to upload
   * @param folder Optional folder path
   * @returns The upload result with image URL
   */
  async uploadImage(file: UploadedFile, folder: string = 'images'): Promise<ImageUploadResult> {
    try {
      if (!file || !file.buffer) {
        throw new Error('Invalid file provided');
      }

      // Validate file is an image
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Upload the image to Cloudflare R2
      const uploadResult = await r2StorageService.uploadImage(file, folder);
      
      return uploadResult;
    } catch (error) {
      console.error('Error in image upload service:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to storage
   * @param files Array of image files to upload
   * @param folder Optional folder path
   * @returns Array of upload results with image URLs
   */
  async uploadMultipleImages(files: UploadedFile[], folder: string = 'images'): Promise<ImageUploadResult[]> {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      // Upload each image and collect results
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return results;
    } catch (error) {
      console.error('Error in multiple image upload service:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const imageUploadService = new ImageUploadService();
