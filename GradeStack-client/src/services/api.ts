import axios from "axios";
import { RcFile } from "antd/es/upload";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
};

export const supporterService = {
  async getAllInstructor() {
    const respone = await api.get("/supporter/instructors");
    return respone.data;
  },

  async createInstructor(instructorData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    organization: string;
    role: string;
  }) {
    const respone = await api.post(
      "/supporter/create/instructor",
      instructorData
    );
    return respone.data;
  },

  async updateUserStatus(id: string, status: { isBlocked: boolean }) {
    const respone = await api.patch(
      `/supporter/update-status/user/${id}`,
      status
    );
    return respone.data;
  },

  async deleteInstructor(instructorId: string) {
    const respone = await api.delete(
      `/supporter/delete/instructor/${instructorId}`
    );
    return respone.data;
  },

  async getAllLearner() {
    const respone = await api.get("/supporter/learners");
    return respone.data;
  },
  
  async warningLearner(learnerId: string, warningContent: string) {
    console.log(learnerId);
    
    const respone = await api.patch(`/supporter/warning/learner/${learnerId}`, { warningContent });
    return respone.data
  },

  async deleteLearner(learnerId: string) {
    const respone = await api.delete(`/supporter/delete/learner/${learnerId}`);
    return respone.data;
  },
};

export default api;
