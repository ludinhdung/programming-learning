import apiClient from './apiClient';
import { RcFile } from 'antd/es/upload';

const mediaService = {
  async uploadVideo(file: RcFile) {
    const formData = new FormData();
    formData.append("video", file);
    const response = await apiClient.post(`/instructors/upload-video`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async uploadImage(file: File | RcFile) {
    try {
      console.log('Uploading image file:', file.name, file.type, file.size);
      const formData = new FormData();
      formData.append("image", file);
      
      // Log request details
      console.log('Sending image upload request to /images/upload');
      
      const response = await apiClient.post("/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log('Image upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in uploadImage:', error.message);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },
};

export default mediaService;
