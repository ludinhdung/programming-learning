import apiClient from './apiClient';

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  async register(userData: RegisterUserData) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
};

export default authService;
