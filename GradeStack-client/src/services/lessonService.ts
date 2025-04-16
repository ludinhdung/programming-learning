import apiClient from './apiClient';

export interface LessonData {
  title: string;
  description: string;
  isPreview: boolean;
}

export interface VideoData {
  url: string;
  thumbnailUrl?: string;
  duration: number;
}

export interface CodingData {
  language: string;
  problem: string;
  hint: string;
  solution: string;
  codeSnippet: string;
}

export interface TestData {
  passingScore?: number;
  estimatedDuration: number;
  questions: Array<{
    content: string;
    order: number;
    answers: Array<{
      content: string;
      isCorrect: boolean;
    }>;
  }>;
}

const lessonService = {
  async deleteLesson(lessonId: string) {
    const response = await apiClient.delete(`/lessons/${lessonId}`);
    return response.data;
  },

  async createVideoLesson(lessonId: string, videoData: {
    url: string;
    thumbnailUrl?: string | null;
    duration?: number | null;
  }) {
    const response = await apiClient.post(`/lessons/${lessonId}/video`, videoData);
    return response.data;
  },

  async createNewVideoLesson(
    moduleId: string,
    lessonData: LessonData,
    videoData: VideoData
  ) {
    const response = await apiClient.post(`/modules/${moduleId}/video-lessons`, {
      lessonData,
      videoData,
    });
    return response.data;
  },

  async createNewCodingLesson(
    moduleId: string,
    lessonData: LessonData,
    codingData: CodingData
  ) {
    const response = await apiClient.post(`/modules/${moduleId}/coding-exercises`, {
      lessonData,
      codingData,
    });
    return response.data;
  },

  async createNewFinalTestLesson(
    moduleId: string,
    lessonData: LessonData,
    testData: TestData
  ) {
    const response = await apiClient.post(`/modules/${moduleId}/final-tests`, {
      lessonData,
      testData,
    });
    return response.data;
  },
};

export default lessonService;
