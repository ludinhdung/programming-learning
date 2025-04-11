import { Course } from '@prisma/client';

export interface TopicCreateDTO {
  name: string;
  description: string;
  thumbnail: string;
}

export interface TopicUpdateDTO {
  name?: string;
  description?: string;
  thumbnail?: string;
}

export interface TopicWithCoursesDTO {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
  courses?: CourseInTopicDTO[];
}

export interface CourseInTopicDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  instructor: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
    }
  };
  _count: {
    enrollments: number;
  };
}
