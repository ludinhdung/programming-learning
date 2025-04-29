import apiClient from './apiClient';
import { Topic, TopicCreateData, TopicUpdateData } from './topicService';

/**
 * Interface cho dữ liệu Instructor
 */
export interface Instructor {
  userId: string;
  organization: string;
  avatar?: string;
  bio?: string;
  socials?: string[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Service xử lý các API liên quan đến Instructor Lead
 */
const instructorLeadService = {
  /**
   * Lấy tất cả các topics
   */
  async getAllTopics(): Promise<Topic[]> {
    console.log('Token trước khi gọi getAllTopics:', localStorage.getItem('token'));
    try {
      // Lấy thông tin người dùng để kiểm tra vai trò
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log('Vai trò người dùng khi gọi getAllTopics:', user.role);
      }
      
      const response = await apiClient.get('/instructor-lead/topics?action=list');
      console.log('Kết quả getAllTopics:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Lỗi khi gọi getAllTopics:', error.response?.status, error.response?.data);
      // Trả về mảng rỗng thay vì ném lỗi để tránh làm hỏng UI
      return [];
    }
  },

  /**
   * Lấy thông tin topic theo ID
   */
  async getTopicById(topicId: string): Promise<Topic> {
    try {
      const response = await apiClient.get(`/instructor-lead/topics/${topicId}?action=get`);
      return response.data.data || {};
    } catch (error) {
      console.error('Lỗi khi gọi getTopicById:', error);
      throw error;
    }
  },

  /**
   * Tạo mới topic
   */
  async createTopic(topicData: TopicCreateData): Promise<Topic> {
    console.log('Đang tạo topic mới với dữ liệu:', topicData);
    try {
      // Lấy thông tin người dùng để thêm vào dữ liệu topic
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Thêm ID người dùng vào dữ liệu topic nếu chưa có
        if (!topicData.instructorUserId) {
          topicData.instructorUserId = user.id;
        }
      }
      
      const response = await apiClient.post('/instructor-lead/topics?action=create', topicData);
      console.log('Kết quả createTopic:', response.data);
      return response.data.data || {};
    } catch (error: any) {
      console.error('Lỗi khi gọi createTopic:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin topic
   */
  async updateTopic(topicId: string, topicData: TopicUpdateData): Promise<Topic> {
    try {
      const response = await apiClient.put(`/instructor-lead/topics/${topicId}?action=update`, topicData);
      return response.data.data || {};
    } catch (error) {
      console.error('Lỗi khi gọi updateTopic:', error);
      throw error;
    }
  },

  /**
   * Xóa topic
   */
  async deleteTopic(topicId: string): Promise<void> {
    try {
      await apiClient.delete(`/instructor-lead/topics/${topicId}?action=delete`);
    } catch (error) {
      console.error('Lỗi khi gọi deleteTopic:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả các instructor
   */
  async getAllInstructors(): Promise<Instructor[]> {
    console.log('Token trước khi gọi getAllInstructors:', localStorage.getItem('token'));
    try {
      // Sửa đường dẫn API để phù hợp với định nghĩa trong server
      const response = await apiClient.get('/instructor-lead/instructors/all');
      console.log('Kết quả getAllInstructors:', response.data);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Lỗi khi gọi getAllInstructors:', error.response?.status, error.response?.data);
      // Trả về mảng rỗng thay vì ném lỗi để tránh làm hỏng UI
      return [];
    }
  }
};

export default instructorLeadService;
