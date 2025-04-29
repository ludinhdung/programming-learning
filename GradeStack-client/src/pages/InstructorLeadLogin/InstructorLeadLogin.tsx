import React, { useState, useEffect } from 'react';
import { Card, Container, Text, Group, Image, Loader, Center } from '@mantine/core';
import { Form, Input, Button, message, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import apiClient from '../../services/apiClient';
import { Role } from '../../types/role';

/**
 * Interface cho dữ liệu đăng nhập
 */
interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface cho kết quả đăng nhập
 */
interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isVerified: boolean;
    createdAt: string;
  };
  token: string;
  requirePasswordChange: boolean;
}

/**
 * Component trang đăng nhập dành riêng cho Instructor Lead
 */
const InstructorLeadLogin: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const navigate = useNavigate();

  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa khi trang được tải
   */
  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        // Kiểm tra xác thực
        const response = await apiClient.auth.verify();
        const userData = response.data.user;

        // Nếu đã đăng nhập và là Instructor Lead, chuyển hướng đến trang dashboard
        if (userData.role === Role.INSTRUCTOR_LEAD) {
          navigate('/instructor-management');
          return;
        }

        // Nếu đã đăng nhập nhưng không phải Instructor Lead
        setError('Tài khoản này không có quyền Instructor Lead');
        apiClient.auth.logout();
      } catch (error) {
        // Không làm gì nếu chưa đăng nhập, đây là trường hợp bình thường
        console.log('Chưa đăng nhập, hiển thị form đăng nhập');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  /**
   * Xử lý đăng nhập
   */
  const handleLogin = async (values: LoginCredentials): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ success: boolean; data: LoginResponse }>('/auth/login', values);
      const { data } = response.data;

      // Kiểm tra xem người dùng có phải là Instructor Lead không
      if (data.user.role !== Role.INSTRUCTOR_LEAD) {
        setError('Tài khoản này không có quyền Instructor Lead');
        setLoading(false);
        return;
      }

      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // In ra token và thông tin người dùng để kiểm tra
      console.log('Token sau khi đăng nhập:', data.token);
      console.log('Thông tin người dùng sau khi đăng nhập:', data.user);

      message.success('Đăng nhập thành công');

      // Chuyển hướng đến trang dashboard của Instructor Lead
      navigate('/instructor-management');
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị màn hình loading khi đang kiểm tra xác thực
  if (isCheckingAuth) {
    return (
      <Center style={{ width: '100%', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size="lg" />
          <Text mt={20}>Đang kiểm tra trạng thái đăng nhập...</Text>
        </div>
      </Center>
    );
  }

  return (
    <Container size="xs" py={50}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center" mb={20}>
          <Image
            src="/logo.png"
            alt="GradeStack Logo"
            width={200}
            height={60}
            fallbackSrc="https://placehold.co/200x60?text=GradeStack"
          />
        </Group>

        <Text size="xl" fw={700} ta="center" mb={30}>
          Đăng nhập Instructor Lead
        </Text>

        {error && (
          <Alert
            message="Lỗi đăng nhập"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          name="instructorLeadLogin"
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Text size="sm" c="dimmed" ta="center" mt={20}>
          Chỉ tài khoản có quyền Instructor Lead mới có thể đăng nhập vào hệ thống này.
        </Text>
      </Card>
    </Container>
  );
};

export default InstructorLeadLogin;
