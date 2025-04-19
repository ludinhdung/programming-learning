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
  attendees?: Array<{
    id: string;
    userId: string;
    workshopId: string;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    }
  }>;
  createdAt: string;
  updatedAt: string;
  
  // Các trường mở rộng
  thumbnail?: string;
  capacity?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  location?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  materials?: string[];
  tags?: string[];
  prerequisites?: string;
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
  
  // Các trường mở rộng
  thumbnail?: string;
  capacity?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  location?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  materials?: string[];
  tags?: string[];
  prerequisites?: string;
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
  
  // Các trường mở rộng
  thumbnail?: string;
  capacity?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  location?: string;
  isOnline?: boolean;
  meetingUrl?: string;
  materials?: string[];
  tags?: string[];
  prerequisites?: string;
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

/**
 * Kiểu dữ liệu cho preview của Workshop
 */
export interface WorkshopPreviewResponse {
  workshop: Workshop;
  preview: {
    timeUntilWorkshop: {
      days: number;
      hours: number;
    };
    status: 'upcoming' | 'ongoing' | 'completed';
    attendeesCount: number;
  };
}
