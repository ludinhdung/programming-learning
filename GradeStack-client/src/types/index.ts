export type LessonType = "VIDEO" | "CODING" | "FINAL_TEST";
export type SupportedLanguage = "PYTHON" | "C" | "JAVA";

export interface VideoLesson {
  url: string;
  duration: number;
}

export interface CodingExercise {
  language: SupportedLanguage | null;
  problem: string;
  hint?: string;
  solution: string;
  codeSnippet?: string;
}

export interface FinalTestLesson {
  estimatedDuration?: number;
  questions: {
    content: string;
    order: number;
    answers: {
      content: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface Lesson {
  title: string;
  description: string;
  lessonType: LessonType;
  duration?: number;
  isPreview: boolean;
  content: {
    video?: VideoLesson;
    coding?: CodingExercise;
    finalTest?: FinalTestLesson;
  };
  createdAt: Date;
}

export interface CourseCreateData {
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  duration: number;
  isPublished: boolean;
  CourseTopic: {
    topicId: string;
    topic: {
      id: string;
      name: string;
      thumbnail: string;
      description: string;
    };
  }[];
  modules: {
    title: string;
    description: string;
    order: number;
    videoUrl: string | null;
    thumbnailUrl: string | null;
    videoDuration: number | null;
    lessons: {
      title: string;
      description: string;
      lessonType: LessonType;
      duration: number;
      isPreview: boolean;
      content: {
        video?: {
          url: string;
          thumbnailUrl: string | null;
          duration: number;
        };
        coding?: {
          language: string;
          problem: string;
          hint?: string;
          solution: string;
          codeSnippet?: string;
        };
        finalTest?: {
          estimatedDuration?: number;
          questions: {
            content: string;
            order: number;
            answers: {
              content: string;
              isCorrect: boolean;
            }[];
          }[];
        };
      };
    }[];
  }[];
}
