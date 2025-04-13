import apiClient from './apiClient';

export interface ModuleCreateData {
  title: string;
  description: string;
}

export interface ModuleUpdateData {
  title: string;
  description: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  videoDuration?: number;
}

const moduleService = {
  async createModule(courseId: string, moduleData: ModuleCreateData) {
    const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },
  
  async updateModule(moduleId: string, moduleData: ModuleUpdateData) {
    const response = await apiClient.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },

  async deleteModule(moduleId: string) {
    const response = await apiClient.delete(`/modules/${moduleId}`);
    return response.data;
  },
};

export default moduleService;
