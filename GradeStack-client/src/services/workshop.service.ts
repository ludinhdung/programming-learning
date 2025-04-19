import apiClient from './apiClient';
import { 
  Workshop, 
  PaginatedWorkshopResponse, 
  RegisterWorkshopDto, 
  WorkshopPreviewResponse, 
  CreateWorkshopDto, 
  UpdateWorkshopDto 
} from '../types/workshop.types';

/**
 * Service xử lý các thao tác liên quan đến Workshop
 */
export const workshopService = {
  /**
   * Lấy danh sách workshop với phân trang
   */
  getWorkshops: async (
    page = 1,
    limit = 10,
    type?: string,
    search?: string,
    instructorId?: string
  ): Promise<PaginatedWorkshopResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (type) {
        params.append('type', type);
      }
      
      if (search) {
        params.append('search', search);
      }
      
      if (instructorId) {
        params.append('instructorId', instructorId);
      }
      
      const response = await apiClient.get<PaginatedWorkshopResponse>(`/workshops?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách workshop của một giảng viên
   */
  getWorkshopsByInstructor: async (instructorId: string): Promise<Workshop[]> => {
    try {
      const response = await apiClient.get<Workshop[]>(`/instructors/${instructorId}/workshops`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workshops for instructor ${instructorId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo workshop mới
   */
  createWorkshop: async (instructorId: string, workshopData: CreateWorkshopDto): Promise<Workshop> => {
    try {
      const response = await apiClient.post<Workshop>(`/instructors/${instructorId}/workshops`, workshopData);
      return response.data;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  },

  /**
   * Cập nhật workshop
   */
  updateWorkshop: async (workshopId: string, workshopData: UpdateWorkshopDto): Promise<Workshop> => {
    try {
      const response = await apiClient.put<Workshop>(`/workshops/${workshopId}`, workshopData);
      return response.data;
    } catch (error) {
      console.error(`Error updating workshop ${workshopId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một workshop
   */
  getWorkshopById: async (workshopId: string): Promise<Workshop> => {
    try {
      const response = await apiClient.get<Workshop>(`/workshops/${workshopId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workshop ${workshopId}:`, error);
      throw error;
    }
  },

  /**
   * Đăng ký tham gia workshop
   */
  registerWorkshop: async (userId: string, data: RegisterWorkshopDto): Promise<any> => {
    try {
      const response = await apiClient.post(`/users/${userId}/workshops/register`, data);
      return response.data;
    } catch (error) {
      console.error('Error registering for workshop:', error);
      throw error;
    }
  },

  /**
   * Hủy đăng ký tham gia workshop
   */
  unregisterWorkshop: async (userId: string, workshopId: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/users/${userId}/workshops/${workshopId}/register`);
      return response.data;
    } catch (error) {
      console.error('Error unregistering from workshop:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra trạng thái đăng ký workshop của người dùng
   */
  checkRegistrationStatus: async (userId: string, workshopId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/users/${userId}/workshops/${workshopId}/registration-status`);
      return response.data;
    } catch (error) {
      console.error('Error checking workshop registration status:', error);
      throw error;
    }
  },

  /**
   * Xóa workshop
   */
  deleteWorkshop: async (workshopId: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/workshops/${workshopId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting workshop ${workshopId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách workshop đã đăng ký của người dùng
   */
  getUserRegisteredWorkshops: async (userId: string): Promise<Workshop[]> => {
    try {
      const response = await apiClient.get<Workshop[]>(`/users/${userId}/workshops/registered`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user registered workshops:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin preview của workshop
   */
  async getWorkshopPreview(workshopId: string): Promise<WorkshopPreviewResponse> {
    const response = await apiClient.get<WorkshopPreviewResponse>(
      `/workshops/${workshopId}/preview`
    );
    return response.data;
  },
};
