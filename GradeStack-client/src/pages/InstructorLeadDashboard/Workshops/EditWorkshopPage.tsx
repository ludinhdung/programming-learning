import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Switch,
  message,
  Typography,
  Card,
  Space,
  Divider,
  Spin
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { workshopService } from '../../../services/workshop.service';
import { Workshop, UpdateWorkshopDto } from '../../../types/workshop.types';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * Trang chỉnh sửa workshop dành cho giảng viên
 */
const EditWorkshopPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  /**
   * Kiểm tra xác thực và quyền truy cập
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          message.error('Vui lòng đăng nhập để thực hiện chức năng này');
          navigate('/login');
          return false;
        }

        const user = JSON.parse(userData);
        
        // Kiểm tra role
        if (user.role !== 'INSTRUCTOR_LEAD') {
          message.error('Chỉ Instructor Lead mới có quyền thực hiện chức năng này');
          navigate('/dashboard');
          return false;
        }
        
        // Xác định instructorId từ dữ liệu người dùng
        if (user.id && user.role === 'INSTRUCTOR_LEAD') {
          setInstructorId(user.id);
          return true;
        }

        message.error('Không tìm thấy thông tin instructor');
        return false;
      } catch (error) {
        console.error('Lỗi khi xác thực:', error);
        message.error('Đã xảy ra lỗi khi xác thực người dùng');
        navigate('/login');
        return false;
      }
    };

    checkAuth();
  }, [navigate]);

  /**
   * Lấy thông tin workshop
   */
  const fetchWorkshop = async () => {
    try {
      if (!id) {
        message.error('Không tìm thấy workshop');
        navigate('/instructor-lead-management/workshops');
        return;
      }

      setLoading(true);
      const data = await workshopService.getWorkshopById(id);
      setWorkshop(data);
      setIsOnline(data.isOnline || true);

      // Cập nhật form với dữ liệu hiện tại
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt ? dayjs(data.scheduledAt) : undefined,
        duration: data.duration,
        type: data.type,
        level: data.level || 'BEGINNER',
        capacity: data.capacity,
        isOnline: data.isOnline,
        location: data.location,
        meetingUrl: data.meetingUrl,
        prerequisites: data.prerequisites,
        materials: data.materials && data.materials.length > 0 ? data.materials : [''],
        tags: data.tags && data.tags.length > 0 ? data.tags : ['']
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin workshop:', error);
      message.error('Không thể tải thông tin workshop');
      navigate('/instructor/workshops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId && id) {
      fetchWorkshop();
    }
  }, [instructorId, id]);

  /**
   * Xử lý khi form được gửi
   */
  const handleSubmit = async (values: any) => {
    try {
      if (!id || !workshop) {
        message.error('Không tìm thấy workshop');
        return;
      }

      setSubmitting(true);
      console.log('Form values:', values);

      // Xử lý và kiểm tra dữ liệu trước khi gửi
      // Đảm bảo materials và tags là mảng và loại bỏ các giá trị trống
      const filteredMaterials = values.materials
        ? values.materials.filter((item: string) => item && item.trim() !== '')
        : [];
      
      const filteredTags = values.tags
        ? values.tags.filter((item: string) => item && item.trim() !== '')
        : [];

      // Kiểm tra và định dạng meetingUrl nếu là Google Meet
      let meetingUrl = values.meetingUrl;
      if (meetingUrl && !meetingUrl.startsWith('http')) {
        // Nếu người dùng chỉ nhập mã Google Meet mà không nhập URL đầy đủ
        if (meetingUrl.includes('-') || meetingUrl.length > 10) {
          meetingUrl = `https://meet.google.com/${meetingUrl}`;
        } else {
          meetingUrl = `https://meet.google.com/${meetingUrl.replace(/\s+/g, '-')}`;
        }
      }

      // Chuẩn bị dữ liệu
      const workshopData: UpdateWorkshopDto = {
        title: values.title,
        description: values.description,
        scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
        duration: values.duration,
        type: values.type,
        level: values.level || 'BEGINNER',
        capacity: values.capacity,
        isOnline: values.isOnline,
        location: values.isOnline ? null : values.location,
        meetingUrl: values.isOnline ? meetingUrl : null,
        prerequisites: values.prerequisites,
        materials: filteredMaterials,
        tags: filteredTags
      };

      console.log('Workshop data to be sent:', workshopData);

      // Gọi API cập nhật workshop
      const response = await workshopService.updateWorkshop(id, workshopData);
      console.log('Workshop updated successfully:', response);
      
      message.success('Cập nhật workshop thành công');
      navigate('/instructor-lead-management/workshops');
    } catch (error) {
      console.error('Lỗi khi cập nhật workshop:', error);
      message.error('Không thể cập nhật workshop. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-[#151922] min-h-screen flex justify-center items-center">
        <Spin size="large" tip="Đang tải thông tin workshop..." className="text-white" />
      </div>
    );
  }

  return (
    <div className="p-6 instructor-lead-bg min-h-screen">
      <div className="mb-6">
        <div className="flex text-3xl justify-start uppercase font-extrabold">
          <span className="text-blue-600 mr-2">//</span>
          <span className="text-white">Chỉnh sửa Workshop</span>
        </div>
      </div>

      <Card className="instructor-lead-card overflow-hidden">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <Title level={4} className="instructor-lead-title m-0">Cập nhật thông tin Workshop</Title>
          <p className="instructor-lead-text-secondary mt-1">Cập nhật thông tin workshop của bạn</p>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="text-white"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="border-l-4 border-green-500 pl-4 mb-6">
                <Title level={4} className="instructor-lead-title m-0">Thông tin cơ bản</Title>
                <p className="instructor-lead-text-secondary mt-1">Thông tin chung về workshop</p>
              </div>
              
              <Form.Item
                name="title"
                label={<span className="text-white">Tiêu đề</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề workshop' }]}
              >
                <Input 
                  placeholder="Nhập tiêu đề workshop" 
                  size="large" 
                  className="instructor-lead-input"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-white">Mô tả</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mô tả workshop' }]}
              >
                <TextArea 
                  placeholder="Mô tả chi tiết về workshop" 
                  rows={5} 
                  showCount 
                  maxLength={1000} 
                  className="instructor-lead-input"
                  style={{ color: 'white' }}
                />
              </Form.Item>

              <Form.Item
                name="prerequisites"
                label={<span className="text-white">Yêu cầu tiên quyết</span>}
              >
                <TextArea 
                  placeholder="Các kiến thức hoặc kỹ năng cần có trước khi tham gia workshop" 
                  rows={3} 
                  showCount 
                  maxLength={500} 
                  className="instructor-lead-input"
                  style={{ color: 'white' }}
                />
              </Form.Item>

              <Form.Item
                name="thumbnail"
                label={<span className="text-white">Ảnh bìa</span>}
              >
                <Input 
                  placeholder="URL ảnh bìa" 
                  className="instructor-lead-input"
                />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="type"
                  label={<span className="text-white">Loại</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn loại workshop' }]}
                >
                  <Select 
                    size="large"
                    className="instructor-lead-input"
                    dropdownStyle={{ background: '#242a38', color: 'white' }}
                  >
                    <Option value="FRONTEND">Frontend</Option>
                    <Option value="BACKEND">Backend</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="level"
                  label={<span className="text-white">Cấp độ</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn cấp độ workshop' }]}
                >
                  <Select 
                    size="large"
                    className="instructor-lead-input"
                    dropdownStyle={{ background: '#242a38', color: 'white' }}
                  >
                    <Option value="BEGINNER">Cơ bản</Option>
                    <Option value="INTERMEDIATE">Trung cấp</Option>
                    <Option value="ADVANCED">Nâng cao</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div>
              <div className="border-l-4 border-yellow-500 pl-4 mb-6">
                <Title level={4} className="instructor-lead-title m-0">Thời gian và địa điểm</Title>
                <p className="instructor-lead-text-secondary mt-1">Thông tin về lịch học và địa điểm</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="scheduledAt"
                  label={<span className="text-white">Thời gian bắt đầu</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu' }]}
                >
                  <DatePicker 
                    showTime 
                    format="DD/MM/YYYY HH:mm" 
                    placeholder="Chọn ngày và giờ"
                    size="large"
                    className="w-full bg-[#242a38] text-white border-gray-700"
                    style={{ color: 'white', background: '#242a38' }}
                  />
                </Form.Item>

                <Form.Item
                  name="duration"
                  label={<span className="text-white">Thời lượng (phút)</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
                >
                  <InputNumber 
                    min={15} 
                    max={480} 
                    placeholder="Ví dụ: 60" 
                    size="large"
                    className="w-full bg-[#242a38] text-white border-gray-700"
                    style={{ color: 'white', background: '#242a38' }}
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="capacity"
                label={<span className="text-white">Số lượng học viên tối đa</span>}
              >
                <InputNumber 
                  min={1} 
                  max={100} 
                  placeholder="Để trống nếu không giới hạn" 
                  size="large"
                  className="w-full bg-[#242a38] text-white border-gray-700"
                  style={{ color: 'white', background: '#242a38' }}
                />
              </Form.Item>

              <Form.Item
                name="isOnline"
                label={<span className="text-white">Hình thức</span>}
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Online" 
                  unCheckedChildren="Offline"
                  onChange={(checked: boolean) => setIsOnline(checked)}
                />
              </Form.Item>

              {isOnline ? (
                <Form.Item
                  name="meetingUrl"
                  label={<span className="text-white">Link phòng học</span>}
                  rules={[{ required: isOnline, message: 'Vui lòng nhập link phòng học' }]}
                >
                  <Input 
                    placeholder="Ví dụ: https://meet.google.com/xxx-xxxx-xxx" 
                    className="instructor-lead-input"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="location"
                  label={<span className="text-white">Địa điểm</span>}
                  rules={[{ required: !isOnline, message: 'Vui lòng nhập địa điểm' }]}
                >
                  <Input 
                    placeholder="Ví dụ: Phòng học A1-101" 
                    className="instructor-lead-input"
                  />
                </Form.Item>
              )}
            </div>
          </div>

          <Divider className="instructor-lead-border" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="border-l-4 border-purple-500 pl-4 mb-6">
                <Title level={4} className="instructor-lead-title m-0">Tài liệu</Title>
                <p className="instructor-lead-text-secondary mt-1">Tài liệu hỗ trợ cho workshop</p>
              </div>
              
              <Form.List name="materials">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={name}
                          className="w-full"
                        >
                          <Input 
                            placeholder="Tên tài liệu hoặc URL" 
                            className="instructor-lead-input"
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
                        )}
                      </Space>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                        className="instructor-lead-btn-secondary"
                      >
                        Thêm tài liệu
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>

            <div>
              <div className="border-l-4 border-pink-500 pl-4 mb-6">
                <Title level={4} className="instructor-lead-title m-0">Tags</Title>
                <p className="instructor-lead-text-secondary mt-1">Từ khóa giúp phân loại workshop</p>
              </div>
              
              <Form.List name="tags">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={name}
                          className="w-full"
                        >
                          <Input 
                            placeholder="Tag" 
                            className="instructor-lead-input"
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
                        )}
                      </Space>
                    ))}
                    <Form.Item>
                      <Button 
                        type="dashed" 
                        onClick={() => add()} 
                        block 
                        icon={<PlusOutlined />}
                        className="instructor-lead-btn-secondary"
                      >
                        Thêm tag
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <Divider className="instructor-lead-border" />

          <Form.Item className="flex justify-end">
            <Space>
              <Button 
                onClick={() => navigate('/instructor-lead-management/workshops')} 
                size="large"
                className="instructor-lead-btn-secondary"
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                size="large"
                className="instructor-lead-btn-primary"
              >
                Cập nhật Workshop
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditWorkshopPage;
