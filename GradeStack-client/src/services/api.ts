import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    async login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password });
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

export default api; 