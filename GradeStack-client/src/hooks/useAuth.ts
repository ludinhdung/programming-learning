import { useState, useEffect } from 'react';

/**
 * Interface cho thông tin người dùng
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'LEARNER' | 'INSTRUCTOR' | 'INSTRUCTOR_LEAD' | 'ADMIN' | 'SUPPORTER';
}

/**
 * Hook quản lý xác thực người dùng
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Trong môi trường thực tế, bạn sẽ lấy thông tin người dùng từ API hoặc localStorage
    // Đây là dữ liệu mẫu cho mục đích demo
    const fetchUser = async () => {
      try {
        // Giả lập việc lấy thông tin người dùng
        setTimeout(() => {
          // Kiểm tra xem có token trong localStorage không
          const token = localStorage.getItem('authToken');
          
          if (token) {
            // Trong thực tế, bạn sẽ giải mã token hoặc gọi API để lấy thông tin người dùng
            // Đây là dữ liệu mẫu
            const demoUser: User = {
              id: '1',
              email: 'user@example.com',
              firstName: 'Người',
              lastName: 'Dùng',
              role: 'INSTRUCTOR'
            };
            
            setUser(demoUser);
          } else {
            setUser(null);
          }
          
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Không thể lấy thông tin người dùng');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Đăng nhập
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Trong thực tế, bạn sẽ gọi API để xác thực
      // Đây là mã giả
      if (email && password) {
        // Giả lập đăng nhập thành công
        const demoUser: User = {
          id: '1',
          email,
          firstName: 'Người',
          lastName: 'Dùng',
          role: 'INSTRUCTOR'
        };
        
        // Lưu token vào localStorage
        localStorage.setItem('authToken', 'demo-token');
        
        setUser(demoUser);
      } else {
        throw new Error('Email và mật khẩu không được để trống');
      }
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Đăng xuất
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};
