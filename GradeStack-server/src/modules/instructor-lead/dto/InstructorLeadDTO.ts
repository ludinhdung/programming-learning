import { Role } from "@prisma/client";

/**
 * DTO cho việc tạo mới Instructor Lead
 */
export interface CreateInstructorLeadDTO {
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  instructorData: {
    organization: string;
    avatar?: string;
    bio?: string;
    socials?: string[];
  };
}

/**
 * DTO cho việc cập nhật thông tin Instructor Lead
 */
export interface UpdateInstructorLeadDTO {
  firstName?: string;
  lastName?: string;
  organization?: string;
  avatar?: string;
  bio?: string;
  socials?: string[];
}

/**
 * DTO cho việc tạo mới Topic
 */
export interface CreateTopicDTO {
  name: string;
  thumbnail?: string;
  description?: string;
  instructorUserId?: string;
}

/**
 * DTO cho việc cập nhật Topic
 */
export interface UpdateTopicDTO {
  name?: string;
  thumbnail?: string;
  description?: string;
  instructorUserId?: string;
}

/**
 * DTO cho việc tạo mới Learning Path
 */
export interface CreateLearningPathDTO {
  title: string;
  description?: string;
  thumbnail?: string;
  instructorUserId?: string;
  courses?: LearningPathCourseDTO[];
}

/**
 * DTO cho khóa học trong Learning Path
 */
export interface LearningPathCourseDTO {
  courseId: string;
  order: number;
}

/**
 * DTO cho việc cập nhật Learning Path
 */
export interface UpdateLearningPathDTO {
  title?: string;
  description?: string;
  thumbnail?: string;
  instructorUserId?: string;
  courses?: LearningPathCourseDTO[];
}

/**
 * DTO cho việc tạo mới Workshop
 */
export interface CreateWorkshopDTO {
  title: string;
  description: string;
  scheduledAt: Date;
  duration: number;
  instructorId: string;
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
}

/**
 * DTO cho việc từ chối khóa học
 */
export interface RejectCourseDTO {
  reason: string;
}
