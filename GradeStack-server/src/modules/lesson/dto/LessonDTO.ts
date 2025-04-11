import { LessonType, SupportedLanguage } from '@prisma/client';

export interface LessonBaseDTO {
  title: string;
  description: string;
  duration?: number;
  isPreview?: boolean;
  order?: number;
}

export interface VideoDataDTO {
  url?: string;
  videoUrl?: string;
  thumbnailUrl?: string | null;
  duration?: number;
}

export interface CodingDataDTO {
  language: SupportedLanguage;
  problem: string;
  solution: string;
  hint?: string;
  codeSnippet?: string;
}

export interface AnswerDTO {
  content: string;
  isCorrect: boolean;
}

export interface QuestionDTO {
  content: string;
  order?: number;
  answers: AnswerDTO[];
}

export interface FinalTestDataDTO {
  passingScore: number;
  estimatedDuration?: number;
  questions: QuestionDTO[];
}

export interface VideoLessonCreateDTO {
  lessonData: LessonBaseDTO & {
    lessonType: LessonType.VIDEO;
  };
  videoData: VideoDataDTO;
}

export interface CodingExerciseCreateDTO {
  lessonData: LessonBaseDTO & {
    lessonType: LessonType.CODING;
  };
  codingData: CodingDataDTO;
}

export interface FinalTestCreateDTO {
  lessonData: LessonBaseDTO & {
    lessonType: LessonType.FINAL_TEST;
  };
  testData: FinalTestDataDTO;
}

export interface LessonUpdateDTO {
  title?: string;
  description?: string;
  duration?: number;
  isPreview?: boolean;
  order?: number;
}

export interface VideoLessonUpdateDTO {
  lessonData?: LessonUpdateDTO;
  videoData?: Partial<VideoDataDTO>;
}

export interface CodingExerciseUpdateDTO {
  lessonData?: LessonUpdateDTO;
  codingData?: Partial<CodingDataDTO>;
}

export interface FinalTestUpdateDTO {
  lessonData?: LessonUpdateDTO;
  testData?: Partial<FinalTestDataDTO>;
}
