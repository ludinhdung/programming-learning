import apiClient from './apiClient';

/**
 * Interface cho dữ liệu Workshop
 */
export interface Workshop {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  meetUrl?: string; // URL Google Meet
  thumbnail?: string; // Hình ảnh thumbnail
  autoGenerateMeet?: boolean; // Tự động tạo Google Meet URL
  instructor?: {
    userId: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  attendees?: {
    userId: string;
    attendedAt: string;
    notified?: boolean; // Đã gửi email thông báo chưa
  }[];
}

/**
 * Interface cho dữ liệu tạo mới Workshop
 */
export interface CreateWorkshopDto {
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  instructorId: string;
  meetUrl?: string;
  thumbnail?: string;
  autoGenerateMeet?: boolean;
}

/**
 * Interface cho dữ liệu cập nhật Workshop
 */
export interface UpdateWorkshopDto {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  instructorId?: string;
  meetUrl?: string;
  thumbnail?: string;
  autoGenerateMeet?: boolean;
}

/**
 * Interface cho dữ liệu đăng ký tham gia Workshop
 */
export interface RegisterWorkshopDto {
  userId: string;
}

/**
 * Interface cho response chứa phân trang
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Service xử lý các API liên quan đến Workshop
 */
const workshopService = {
  /**
   * Lấy danh sách tất cả Workshop
   * @returns Promise với danh sách Workshop
   */
  getAllWorkshops: async (): Promise<Workshop[]> => {
    const response = await apiClient.get('/workshops');
    return response.data.data;
  },

  /**
   * Lấy thông tin Workshop theo ID
   * @param id - ID của Workshop
   * @returns Promise với thông tin Workshop
   */
  getWorkshopById: async (id: string): Promise<Workshop> => {
    const response = await apiClient.get(`/workshops/${id}`);
    return response.data.data;
  },

  /**
   * Lấy danh sách Workshop của một Instructor
   * @param instructorId - ID của Instructor
   * @returns Promise với danh sách Workshop
   */
  getInstructorWorkshops: async (instructorId: string): Promise<Workshop[]> => {
    const response = await apiClient.get(`/workshops/instructor/${instructorId}`);
    return response.data.data;
  },

  /**
   * Tạo mới Workshop
   * @param workshopData - Dữ liệu Workshop cần tạo
   * @returns Promise với thông tin Workshop đã tạo
   */
  createWorkshop: async (workshopData: CreateWorkshopDto): Promise<Workshop> => {
    // Đảm bảo autoGenerateMeet là kiểu boolean rõ ràng
    const dataToSend = {
      ...workshopData,
      autoGenerateMeet: workshopData.autoGenerateMeet === true
    };
    
    // Log dữ liệu trước khi gửi để kiểm tra
    console.log('WorkshopService - dữ liệu gửi đến server:', dataToSend);
    console.log('autoGenerateMeet type:', typeof dataToSend.autoGenerateMeet);
    
    const response = await apiClient.post('/workshops', dataToSend);
    return response.data.data;
  },

  /**
   * Cập nhật thông tin Workshop
   * @param id - ID của Workshop
   * @param workshopData - Dữ liệu cập nhật
   * @returns Promise với thông tin Workshop đã cập nhật
   */
  updateWorkshop: async (id: string, workshopData: UpdateWorkshopDto): Promise<Workshop> => {
    const response = await apiClient.put(`/workshops/${id}`, workshopData);
    return response.data.data;
  },

  /**
   * Xóa Workshop
   * @param id - ID của Workshop
   * @returns Promise với kết quả xóa
   */
  deleteWorkshop: async (id: string): Promise<void> => {
    await apiClient.delete(`/workshops/${id}`);
  },

  /**
   * Đăng ký tham gia Workshop
   * @param workshopId - ID của Workshop
   * @param userId - ID của người dùng
   * @returns Promise với thông tin đăng ký
   */
  registerForWorkshop: async (workshopId: string, userId: string): Promise<any> => {
    const response = await apiClient.post(`/workshops/${workshopId}/register`, { userId });
    return response.data.data;
  },
  
  /**
   * Đăng ký tham gia Workshop (cho người dùng đã đăng nhập)
   * @param workshopId - ID của Workshop
   * @returns Promise với thông tin đăng ký
   */
  registerWorkshop: async (workshopId: string): Promise<any> => {
    const response = await apiClient.post(`/workshops/${workshopId}/register`);
    return response.data.data;
  },

  /**
   * Hủy đăng ký tham gia Workshop
   * @param workshopId - ID của Workshop
   * @returns Promise với kết quả hủy đăng ký
   */
  cancelWorkshopRegistration: async (workshopId: string): Promise<void> => {
    await apiClient.delete(`/workshops/${workshopId}/register`);
  },

  /**
   * Lấy danh sách người tham gia Workshop
   * @param workshopId - ID của Workshop
   * @returns Promise với danh sách người tham gia
   */
  getWorkshopAttendees: async (workshopId: string): Promise<any[]> => {
    const response = await apiClient.get(`/workshops/${workshopId}/attendees`);
    return response.data.data;
  },
  
  /**
   * Lấy danh sách Workshop công khai có phân trang
   * @param page - Số trang
   * @param limit - Số lượng item trên một trang
   * @returns Promise với danh sách Workshop và thông tin phân trang
   */
  getPublicWorkshops: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Workshop>> => {
    const response = await apiClient.get(`/workshops/public?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  /**
   * Lấy danh sách Workshop mà người dùng đã đăng ký
   * @returns Promise với danh sách Workshop
   */
  getUserRegisteredWorkshops: async (): Promise<Workshop[]> => {
    const response = await apiClient.get('/workshops/user/registered');
    return response.data.data;
  },
  
  /**
   * Gửi email thông báo với link Google Meet đến người tham gia Workshop
   * @param workshopId - ID của Workshop
   * @returns Promise với kết quả gửi email
   */
  sendEmailToAttendees: async (workshopId: string): Promise<{success: boolean; message: string}> => {
    const response = await apiClient.post(`/workshops/${workshopId}/send-email`);
    return response.data;
  }
};

export default workshopService;
