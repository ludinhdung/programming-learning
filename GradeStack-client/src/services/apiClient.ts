import axios, { AxiosInstance } from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

/**
 * Interface cho kết quả xác thực
 */
interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      isVerified: boolean;
      createdAt: string;
    };
  };
}

/**
 * Interface mở rộng cho AxiosInstance để bổ sung chức năng xác thực
 */
interface ApiClientInstance extends AxiosInstance {
  auth: {
    verify: () => Promise<AuthResponse>;
    logout: () => void;
  };
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
}) as ApiClientInstance;

// Thêm token vào request nếu tồn tại
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Đang thêm token vào request:', config.url);
    console.log('Token được sử dụng:', token);
    console.log('Header Authorization:', config.headers.Authorization);
  } else {
    console.log('Không tìm thấy token cho request:', config.url);
  }
  return config;
});

// Thêm interceptor xử lý response để quản lý lỗi tốt hơn
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Lỗi API:', error.response?.status, error.response?.data, error.config?.url);
    
    // Nếu lỗi 401 Unauthorized, xóa token và thông tin người dùng
    if (error.response?.status === 401) {
      console.log('Lỗi xác thực 401, đang đăng xuất...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Nếu không phải ở trang đăng nhập, chuyển hướng về trang đăng nhập
      if (window.location.pathname !== '/login' && window.location.pathname !== '/instructor-lead/login') {
        window.location.href = '/instructor-lead/login';
      }
    }
    
    // Nếu lỗi 403 Forbidden, hiển thị thông báo quyền truy cập
    if (error.response?.status === 403) {
      console.log('Lỗi quyền truy cập 403:', error.response?.data);
      // Kiểm tra vai trò người dùng
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log('Vai trò người dùng hiện tại:', user.role);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Các hàm API liên quan đến xác thực
 */
apiClient.auth = {
  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa
   * @returns Promise với thông tin người dùng nếu đã đăng nhập
   */
  verify: async (): Promise<AuthResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token');
      }
      
      const userString = localStorage.getItem('user');
      if (!userString) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      
      const user = JSON.parse(userString);
      
      // Tạo response giống với kết quả trả về từ API
      const response: AuthResponse = {
        success: true,
        data: {
          user: user
        }
      };
      
      return response;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  /**
   * Đăng xuất người dùng
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default apiClient;
