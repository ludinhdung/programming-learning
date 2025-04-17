import apiClient from './apiClient';
import { 
  Workshop, 
  CreateWorkshopDto, 
  UpdateWorkshopDto, 
  PaginatedWorkshopResponse, 
  RegisterWorkshopDto 
} from '../types/workshop.types';

/**
 * Service xử lý các API liên quan đến workshop
 */
export const workshopService = {
  /**
   * Lấy danh sách workshop với phân trang và lọc
   */
  async getWorkshops(
    page = 1, 
    limit = 10, 
    type?: string, 
    search?: string
  ): Promise<PaginatedWorkshopResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get<PaginatedWorkshopResponse>(
      `/workshops?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết của một workshop
   */
  async getWorkshopById(workshopId: string): Promise<Workshop> {
    const response = await apiClient.get<Workshop>(
      `/workshops/${workshopId}`
    );
    return response.data;
  },

  /**
   * Lấy danh sách workshop của một instructor
   */
  async getInstructorWorkshops(
    instructorId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedWorkshopResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      instructorId,
    });

    const response = await apiClient.get<PaginatedWorkshopResponse>(
      `/workshops?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Tạo workshop mới (dành cho instructor)
   */
  async createWorkshop(
    instructorId: string,
    workshopData: CreateWorkshopDto
  ): Promise<Workshop> {
    const response = await apiClient.post<Workshop>(
      `/instructors/${instructorId}/workshops`,
      workshopData
    );
    return response.data;
  },

  /**
   * Cập nhật thông tin workshop (dành cho instructor)
   */
  async updateWorkshop(
    instructorId: string,
    workshopId: string,
    workshopData: UpdateWorkshopDto
  ): Promise<Workshop> {
    const response = await apiClient.put<Workshop>(
      `/instructors/${instructorId}/workshops/${workshopId}`,
      workshopData
    );
    return response.data;
  },

  /**
   * Xóa workshop (dành cho instructor)
   */
  async deleteWorkshop(
    instructorId: string,
    workshopId: string
  ): Promise<void> {
    await apiClient.delete(
      `/instructors/${instructorId}/workshops/${workshopId}`
    );
  },

  /**
   * Đăng ký tham dự workshop (dành cho learner)
   */
  async registerWorkshop(
    learnerId: string,
    registerData: RegisterWorkshopDto
  ): Promise<any> {
    const response = await apiClient.post(
      `/learners/${learnerId}/workshops/register`,
      registerData
    );
    return response.data;
  },

  /**
   * Hủy đăng ký tham dự workshop (dành cho learner)
   */
  async cancelRegistration(
    learnerId: string,
    workshopId: string
  ): Promise<any> {
    const response = await apiClient.delete(
      `/learners/${learnerId}/workshops/${workshopId}/register`
    );
    return response.data;
  },

  /**
   * Lấy danh sách workshop đã đăng ký (dành cho learner)
   */
  async getRegisteredWorkshops(learnerId: string): Promise<Workshop[]> {
    const response = await apiClient.get<Workshop[]>(
      `/learners/${learnerId}/workshops`
    );
    return response.data;
  },
};
