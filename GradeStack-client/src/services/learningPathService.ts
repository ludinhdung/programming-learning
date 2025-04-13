import apiClient from './apiClient';

export interface LearningPathCourseOrder {
  courseId: string;
  order: number;
}

export interface LearningPathCreateData {
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  estimatedCompletionTime?: number | null;
  courseIds: string[];
}

export interface LearningPathUpdateData {
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  estimatedCompletionTime?: number | null;
  courseIds?: string[];
}

export interface LearningPathCourseOrderUpdateData {
  courses: LearningPathCourseOrder[];
}

const learningPathService = {
  // Tạo mới learning path
  async createLearningPath(instructorId: string, learningPathData: LearningPathCreateData) {
    const response = await apiClient.post(
      `/instructors/${instructorId}/learning-paths`,
      learningPathData
    );
    return response.data;
  },

  // Lấy danh sách learning path của instructor
  async getLearningPaths(instructorId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/learning-paths`);
    return response.data;
  },

  // Lấy tất cả learning path (cho người dùng xem)
  async getAllLearningPaths() {
    const response = await apiClient.get('/learning-paths');
    return response.data;
  },

  // Lấy thông tin chi tiết của một learning path
  async getLearningPath(learningPathId: string) {
    const response = await apiClient.get(`/learning-paths/${learningPathId}`);
    return response.data;
  },

  // Lấy thông tin chi tiết của một learning path (cho instructor)
  async getInstructorLearningPath(instructorId: string, learningPathId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/learning-paths/${learningPathId}`);
    return response.data;
  },

  // Cập nhật thông tin learning path
  async updateLearningPath(instructorId: string, learningPathId: string, updateData: LearningPathUpdateData) {
    const response = await apiClient.put(
      `/instructors/${instructorId}/learning-paths/${learningPathId}`,
      updateData
    );
    return response.data;
  },

  // Cập nhật thứ tự các khóa học trong learning path
  async updateCoursesOrder(
    instructorId: string,
    learningPathId: string,
    orderData: LearningPathCourseOrderUpdateData
  ) {
    const response = await apiClient.put(
      `/instructors/${instructorId}/learning-paths/${learningPathId}/courses-order`,
      orderData
    );
    return response.data;
  },

  // Xóa learning path
  async deleteLearningPath(instructorId: string, learningPathId: string) {
    const response = await apiClient.delete(`/instructors/${instructorId}/learning-paths/${learningPathId}`);
    return response.data;
  },
};

export default learningPathService;
