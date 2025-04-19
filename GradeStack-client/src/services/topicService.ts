import apiClient from './apiClient';

export interface TopicCreateData {
  name: string;
  description: string;
  thumbnail: string;
}

export interface TopicUpdateData {
  name?: string;
  description?: string;
  thumbnail?: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    courses: number;
  };
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
  courses?: any[];
}

const topicService = {
  async getTopics() {
    const response = await apiClient.get(`/topics`);
    return response.data;
  },

  async getTopicsByInstructor(instructorId: string) {
    const response = await apiClient.get(`/instructors/${instructorId}/topics`);
    return response.data;
  },

  async getTopicById(topicId: string) {
    const response = await apiClient.get(`/topics/${topicId}`);
    return response.data;
  },

  async createTopic(instructorId: string, topicData: TopicCreateData) {
    const response = await apiClient.post(`/instructors/${instructorId}/topics`, topicData);
    return response.data;
  },

  async updateTopic(instructorId: string, topicId: string, topicData: TopicUpdateData) {
    const response = await apiClient.put(`/instructors/${instructorId}/topics/${topicId}`, topicData);
    return response.data;
  },

  async deleteTopic(instructorId: string, topicId: string) {
    const response = await apiClient.delete(`/instructors/${instructorId}/topics/${topicId}`);
    return response.data;
  },

  async getTopicsWithCourses() {
    const response = await apiClient.get(`/topics/with-courses`);
    return response.data;
  },
};

export default topicService;
