/**
 * Trang tạo chứng chỉ mới cho INSTRUCTOR_LEAD
 * Cho phép chọn học viên, khóa học và tải lên URL chứng chỉ
 */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Typography, message, Spin, Upload } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createCertificate, CreateCertificateDto } from '../../../services/certificate-api';
import { instructorService } from '../../../services/api';

const { Title } = Typography;
const { Option } = Select;

interface Learner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
}

const CreateCertificate: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  // Lấy danh sách học viên và khóa học khi component được tải
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Mô phỏng lấy danh sách học viên
        // Trong thực tế, cần thêm API này vào service
        // Hiện tại chỉ dùng dữ liệu mẫu
        const mockLearners: Learner[] = [
          { id: '1', firstName: 'Nguyễn', lastName: 'Văn A', email: 'nguyenvana@example.com' },
          { id: '2', firstName: 'Trần', lastName: 'Thị B', email: 'tranthib@example.com' },
          { id: '3', firstName: 'Lê', lastName: 'Văn C', email: 'levanc@example.com' },
        ];
        setLearners(mockLearners);
        
        // Lấy danh sách khóa học
        const instructorId = localStorage.getItem('user') 
          ? JSON.parse(localStorage.getItem('user') || '{}').id 
          : '';
        
        if (instructorId) {
          const coursesResponse = await instructorService.getCourses(instructorId);
          setCourses(coursesResponse);
        }
      } catch (error) {
        message.error('Không thể tải dữ liệu');
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý khi form được gửi
  const handleSubmit = async (values: CreateCertificateDto): Promise<void> => {
    try {
      setSubmitting(true);
      await createCertificate(values);
      message.success('Tạo chứng chỉ thành công');
      navigate('/instructor-lead/certificates');
    } catch (error) {
      message.error('Không thể tạo chứng chỉ');
      console.error('Lỗi khi tạo chứng chỉ:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý tải lên hình ảnh chứng chỉ (giả định)
  const handleUpload = (info: any): void => {
    if (info.file.status === 'done') {
      const certificateUrl = info.file.response.url;
      form.setFieldsValue({ certificateUrl });
      message.success('Tải lên chứng chỉ thành công');
    } else if (info.file.status === 'error') {
      message.error('Tải lên chứng chỉ thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/instructor-lead/certificates')}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Title level={3}>Tạo chứng chỉ mới</Title>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl"
        >
          <Form.Item
            name="learnerId"
            label="Học viên"
            rules={[{ required: true, message: 'Vui lòng chọn học viên' }]}
          >
            <Select
              placeholder="Chọn học viên"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {learners.map((learner) => (
                <Option key={learner.id} value={learner.id}>
                  {`${learner.firstName} ${learner.lastName} (${learner.email})`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="courseId"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
          >
            <Select
              placeholder="Chọn khóa học"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {courses.map((course) => (
                <Option key={course.id} value={course.id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="certificateUrl"
            label="URL chứng chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập URL chứng chỉ' }]}
          >
            <Input placeholder="Nhập URL chứng chỉ" />
          </Form.Item>

          <Form.Item label="Hoặc tải lên chứng chỉ">
            <Upload
              name="certificate"
              action="/api/upload-certificate" // Thay thế bằng API thực tế
              onChange={handleUpload}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên chứng chỉ</Button>
            </Upload>
            <div className="text-gray-500 text-sm mt-1">
              Hỗ trợ: JPG, PNG, PDF. Kích thước tối đa: 5MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="mt-4"
            >
              Tạo chứng chỉ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCertificate;
