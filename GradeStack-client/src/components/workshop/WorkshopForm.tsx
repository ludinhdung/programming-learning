import { useState, useEffect, use } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Alert,
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Space,
  message
} from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../../hooks/useAuth';
import { workshopService } from '../../services/workshop.service';
import { CreateWorkshopDto, UpdateWorkshopDto, Workshop } from '../../types/workshop.types';

/**
 * Component form tạo và chỉnh sửa workshop
 */
const WorkshopForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const isEditMode = Boolean(id);


  
  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState<Date | null>(new Date());
  const [duration, setDuration] = useState<string>('60');
  const [type, setType] = useState<'FRONTEND' | 'BACKEND'>('FRONTEND');
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form instance
  const [form] = Form.useForm();

  // Thêm một trạng thái mới để theo dõi quá trình khởi tạo
  const [initializing, setInitializing] = useState(true);

  /**
   * Tải thông tin workshop khi ở chế độ chỉnh sửa
   */

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      message.error('Vui lòng đăng nhập để xem danh sách workshop');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setInitializing(false); // Đánh dấu đã khởi tạo xong
  }, []);

  useEffect(() => {
    const loadWorkshop = async () => {
      console.log('id', id);
      if (!isEditMode || !id) return;

      console.log('isEditMode', isEditMode);
      
      
      try {
        setFormLoading(true);
        const workshop: Workshop = await workshopService.getWorkshopById(id);
        
        // Điền thông tin workshop vào form
        form.setFieldsValue({
          title: workshop.title,
          description: workshop.description,
          scheduledAt: dayjs(workshop.scheduledAt),
          duration: workshop.duration,
          type: workshop.type
        });
        
        // Cập nhật state
        setTitle(workshop.title);
        setDescription(workshop.description);
        setScheduledAt(new Date(workshop.scheduledAt));
        setDuration(workshop.duration.toString());
        setType(workshop.type as 'FRONTEND' | 'BACKEND');
      } catch (err) {
        console.error('Lỗi khi tải thông tin workshop:', err);
        setError('Không thể tải thông tin workshop. Vui lòng thử lại sau.');
      } finally {
        setFormLoading(false);
      }
    };
    
    loadWorkshop();
  }, [isEditMode, id, form]);

  /**
   * Xác thực form - sử dụng Ant Design Form validation
   */
  const validateScheduledAt = (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error('Thời gian không được để trống'));
    }
    const now = dayjs();
    if (value.isBefore(now)) {
      return Promise.reject(new Error('Thời gian phải là thời điểm trong tương lai'));
    }
    return Promise.resolve();
  };


  /**
   * Xử lý submit form
   */
  const handleSubmit = async (values: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode && id) {
        // Cập nhật workshop
        const updateData: UpdateWorkshopDto = {
          title: values.title,
          description: values.description,
          scheduledAt: values.scheduledAt.toISOString(),
          duration: values.duration,
          type: values.type
        };
        
        await workshopService.updateWorkshop(user.id, id, updateData);
        setSuccessMessage('Cập nhật workshop thành công!');
      } else {
        // Tạo workshop mới
        const createData: CreateWorkshopDto = {
          title: values.title,
          description: values.description,
          scheduledAt: values.scheduledAt.toISOString(),
          duration: values.duration,
          type: values.type
        };
        
        await workshopService.createWorkshop(user.id, createData);
        setSuccessMessage('Tạo workshop thành công!');
        
        // Reset form sau khi tạo thành công
        if (!isEditMode) {
          form.resetFields();
          form.setFieldsValue({
            scheduledAt: dayjs(),
            duration: 60,
            type: 'FRONTEND'
          });
          
          // Cập nhật state
          setTitle('');
          setDescription('');
          setScheduledAt(new Date());
          setDuration('60');
          setType('FRONTEND');
        }
      }
      
      // Chuyển hướng sau 1.5 giây
      setTimeout(() => {
        navigate('/instructor-lead-management/workshops');
      }, 1500);
    } catch (err: any) {
      console.error('Lỗi khi lưu workshop:', err);
      setError(err.response?.data?.message || 'Không thể lưu workshop. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinishFailed = (errorInfo: any) => {
    console.log('Form validation failed:', errorInfo);
  };

  // Thêm điều kiện kiểm tra initializing
  if (initializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user || user.role !== 'INSTRUCTOR_LEAD') {
    return (
      <div style={{ padding: '24px 0' }}>
        <Alert
          message="Cảnh báo"
          description="Bạn không có quyền truy cập trang này."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (formLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>
      <Typography.Title level={2}>
        {isEditMode ? 'Chỉnh sửa Workshop' : 'Tạo Workshop mới'}
      </Typography.Title>

      {successMessage && (
        <Alert
          message="Thành công"
          description={successMessage}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: title,
            description: description,
            scheduledAt: scheduledAt ? dayjs(scheduledAt) : dayjs(),
            duration: parseInt(duration),
            type: type
          }}
          onFinish={handleSubmit}
          onFinishFailed={handleFinishFailed}
          requiredMark
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề Workshop"
                rules={[
                  { required: true, message: 'Tiêu đề không được để trống' },
                  { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input 
                  placeholder="Nhập tiêu đề workshop"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { required: true, message: 'Mô tả không được để trống' },
                  { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
                ]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Nhập mô tả chi tiết về workshop"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="scheduledAt"
                label="Thời gian diễn ra"
                rules={[{ validator: validateScheduledAt }]}
              >
                <DatePicker 
                  showTime 
                  format="DD/MM/YYYY HH:mm" 
                  style={{ width: '100%' }}
                  placeholder="Chọn thời gian"
                  onChange={(date) => date && setScheduledAt(date.toDate())}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                name="duration"
                label="Thời lượng (phút)"
                rules={[
                  { required: true, message: 'Thời lượng không được để trống' },
                  { type: 'number', min: 1, message: 'Thời lượng phải là số nguyên dương' }
                ]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }}
                  placeholder="Nhập thời lượng"
                  onChange={(value) => value && setDuration(value.toString())}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={6}>
              <Form.Item
                name="type"
                label="Loại Workshop"
                rules={[{ required: true, message: 'Vui lòng chọn loại workshop' }]}
              >
                <Select
                  placeholder="Chọn loại workshop"
                  onChange={(value) => setType(value)}
                  options={[
                    { value: 'FRONTEND', label: 'Frontend' },
                    { value: 'BACKEND', label: 'Backend' }
                  ]}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button 
                    onClick={() => navigate('/instructor-lead-management/workshops')}
                    disabled={loading}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={loading}
                  >
                    {isEditMode ? 'Cập nhật Workshop' : 'Tạo Workshop'}
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default WorkshopForm;
