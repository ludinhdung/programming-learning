import { Decimal } from '@prisma/client/runtime/library';
import { LessonType, SupportedLanguage } from '@prisma/client';

export interface CourseCreateDTO {
  title: string;
  description: string;
  price: Decimal | number;
  duration?: number;
  isPublished?: boolean;
  thumbnail?: string;
  topicIds?: string[] | undefined;
  modules?: ModuleCreateDTO[];
}

export interface ModuleCreateDTO {
  title: string;
  description: string;
  order?: number;
  lessons?: LessonCreateDTO[];
}

export interface LessonCreateDTO {
  title: string;
  description: string;
  lessonType: LessonType;
  duration?: number;
  isPreview?: boolean;
  order?: number;
  videoData?: {
    url?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration: number;
  };
  codingData?: {
    language: SupportedLanguage;
    problem: string;
    hint?: string;
    solution: string;
    codeSnippet?: string;
  };
  finalTestData?: {
    estimatedDuration?: number;
    questions?: QuestionCreateDTO[];
  };
}

export interface QuestionCreateDTO {
  content: string;
  order?: number;
  answers?: AnswerCreateDTO[];
}

export interface AnswerCreateDTO {
  content: string;
  isCorrect: boolean;
}