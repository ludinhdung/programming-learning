import apiClient from './apiClient';

export interface CourseCreateData {
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  duration: number;
  isPublished: boolean;
  topicIds: string[];
  modules: {
    title: string;
    description: string;
    order: number;
    videoUrl?: string | null;
    thumbnailUrl?: string | null;
    videoDuration?: number | null;
    lessons: {
      title: string;
      description: string;
      lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
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

const courseService = {
  async createCourse(instructorId: string, courseData: CourseCreateData) {
    const response = await apiClient.post(
      `/instructors/${instructorId}/courses`,
      courseData
    );
    return response.data;
  },

  async getCourse(instructorId: string, courseId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/courses/${courseId}`);
    return response.data;
  },

  async getCourses(instructorId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/courses`);
    return response.data;
  },

  async getFullCourses(instructorId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/courses/full`);
    return response.data;
  },

  async getAllCoursesForLearningPath() {
    const response = await apiClient.get(`/courses/learning-path/all`);
    return response.data;
  },

  async deleteCourse(instructorId: string, courseId: string) {
    const response = await apiClient.delete(`/instructors/${instructorId}/courses/${courseId}`);
    return response.data;
  },
};

export default courseService;
