/**
 * DTO cho việc tạo mới Workshop
 */
export interface CreateWorkshopDTO {
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  instructorId: string;
  meetUrl?: string;
  thumbnail?: string;
  autoGenerateMeet?: boolean;
}

/**
 * DTO cho việc cập nhật Workshop
 */
export interface UpdateWorkshopDTO {
  title?: string;
  description?: string;
  scheduledAt?: Date;
  duration?: number;
  instructorId?: string;
  meetUrl?: string;
  thumbnail?: string;
  autoGenerateMeet?: boolean;
}

/**
 * DTO cho việc đăng ký tham gia Workshop
 */
export interface RegisterWorkshopDTO {
  userId: string;
}

/**
 * DTO cho việc hủy đăng ký tham gia Workshop
 */
export interface CancelWorkshopRegistrationDTO {
  userId: string;
}
