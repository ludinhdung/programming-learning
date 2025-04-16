import { Course, Instructor, LearningPath } from '@prisma/client';

export interface LearningPathBaseDTO {
  title: string;
  description?: string | null;
  thumbnail?: string | null;
}

export interface LearningPathDTO extends LearningPathBaseDTO {
  id: string;
  instructorUserId?: string | null;
}

export interface LearningPathWithRelationsDTO extends LearningPathDTO {
  instructor?: Instructor;
  courses?: {
    id: string;
    courseId: string;
    learningPathId: string;
    order: number;
    course: Course;
  }[];
}

export interface CreateLearningPathDTO extends LearningPathBaseDTO {
  courseIds: string[]; // Course IDs
}

export interface UpdateLearningPathDTO {
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  courseIds?: string[]; // Course IDs
}

export interface LearningPathIdParamDTO {
  learningPathId: string;
}

export interface LearningPathCourseOrderDTO {
  courseId: string;
  order: number;
}

export interface UpdateLearningPathCoursesDTO {
  courses: LearningPathCourseOrderDTO[];
}
