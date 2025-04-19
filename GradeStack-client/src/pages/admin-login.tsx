/**
 * Giao diện đăng nhập dành riêng cho admin
 * Chỉ cho phép truy cập nếu role là ADMIN
 * Tác giả: AI hỗ trợ
 */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { getDashboardOverview } from '../services/admin-api';

interface AdminLoginForm {
  email: string;
  password: string;
}

/**
 * Trang đăng nhập admin
 */
const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const navigate = useNavigate();
  
  // Kiểm tra nếu người dùng đã đăng nhập và có quyền admin
  useEffect(() => {
    const checkAdminAuth = async (): Promise<void> => {
      console.log('Kiểm tra xem người dùng đã đăng nhập chưa...');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('Token tồn tại:', !!token);
      console.log('Thông tin người dùng tồn tại:', !!userStr);
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('Thông tin người dùng:', user);
          console.log('Vai trò người dùng:', user.role);
          
          // Kiểm tra cả chữ hoa và chữ thường
          if (user.role === 'ADMIN' || user.role === 'admin') {
            console.log('Người dùng có quyền admin, đang gọi API để kiểm tra token...');
            try {
              // Kiểm tra token hợp lệ bằng cách gọi API admin
              const dashboardData = await getDashboardOverview();
              console.log('Gọi API thành công, dữ liệu dashboard:', dashboardData);
              message.success('Đã đăng nhập với quyền Admin');
              navigate('/admin-dashboard');
              return;
            } catch (apiError) {
              console.error('Lỗi khi gọi API dashboard:', apiError);
              message.error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } else {
            console.log('Người dùng không có quyền admin');
          }
        } catch (error) {
          console.error('Lỗi khi xử lý thông tin người dùng:', error);
          // Token không hợp lệ hoặc API không trả về kết quả
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setInitializing(false);
    };
    
    checkAdminAuth();
  }, [navigate]);

  /**
   * Xử lý đăng nhập admin
   * @param values Thông tin form
   */
  const handleLogin = async (values: AdminLoginForm) => {
    setLoading(true);
    try {
      console.log('Đang đăng nhập với:', values.email);
      const response = await authService.login(values.email, values.password);
      console.log('Kết quả đăng nhập:', response);
      
      // Xử lý cấu trúc phản hồi từ server { success: true, data: { user, token } }
      const result = response.data || response;
      const user = result.user;
      const token = result.token;
      
      console.log('Thông tin người dùng:', user);
      console.log('Token:', token);
      
      if (!user || !token) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      
      // Kiểm tra role trả về là ADMIN (kiểm tra cả chữ hoa và chữ thường)
      const userRole = user.role;
      console.log('Role người dùng:', userRole);
      
      if (userRole === 'ADMIN' || userRole === 'admin') {
        // Lưu token và thông tin người dùng
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        message.success('Đăng nhập thành công!');
        navigate('/admin-dashboard');
      } else {
        message.error('Chỉ admin mới được truy cập dashboard này!');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spin tip="Đang kiểm tra phiên đăng nhập..." size="large" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <Typography.Title level={3} className="text-center mb-6">Đăng nhập Admin</Typography.Title>
        <Form<AdminLoginForm> layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}> 
            <Input type="email" autoComplete="username" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}> 
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;
