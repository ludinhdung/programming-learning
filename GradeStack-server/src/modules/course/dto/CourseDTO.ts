import { Course, Module, Topic, Instructor } from '@prisma/client';

export interface CourseBaseDTO {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string | null;
  isPublished?: boolean;
}

export interface CourseDTO extends CourseBaseDTO {
  id: string;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseWithRelationsDTO extends CourseDTO {
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      avatarUrl: string | null;
    };
  };
  topics?: Topic[];
  modules?: Module[];
  _count?: {
    enrollments: number;
  };
}

export interface CreateCourseDTO extends CourseBaseDTO {
  topics?: string[]; // Topic IDs
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  price?: number;
  thumbnailUrl?: string | null;
  topics?: string[]; // Topic IDs
  isPublished?: boolean;
}

export interface CourseIdParamDTO {
  courseId: string;
}
