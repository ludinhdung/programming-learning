/**
 * Kiểu dữ liệu cho Workshop
 */
export interface Workshop {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  type: 'FRONTEND' | 'BACKEND';
  instructorId: string;
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    }
  };
  _count?: {
    attendees: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Kiểu dữ liệu cho việc tạo Workshop mới
 */
export interface CreateWorkshopDto {
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  type: 'FRONTEND' | 'BACKEND';
}

/**
 * Kiểu dữ liệu cho việc cập nhật Workshop
 */
export interface UpdateWorkshopDto {
  title?: string;
  description?: string;
  scheduledAt?: string;
  duration?: number;
  type?: 'FRONTEND' | 'BACKEND';
}

/**
 * Kiểu dữ liệu cho việc đăng ký tham dự Workshop
 */
export interface RegisterWorkshopDto {
  workshopId: string;
}

/**
 * Kiểu dữ liệu cho phản hồi phân trang
 */
export interface PaginatedWorkshopResponse {
  data: Workshop[];
  meta: {
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
