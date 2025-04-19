import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Button, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Avatar, 
  Spin, 
  Alert, 
  Space, 
  Descriptions,
  Statistic,
  Progress,
  List,
  Tooltip
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  TeamOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  FileOutlined,
  TagOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { workshopService } from '../../services/workshop.service';
import { WorkshopPreviewResponse } from '../../types/workshop.types';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component hiển thị preview của workshop
 */
const WorkshopPreview = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [previewData, setPreviewData] = useState<WorkshopPreviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  /**
   * Tải thông tin preview của workshop
   */
  const loadWorkshopPreview = async () => {
    if (!workshopId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await workshopService.getWorkshopPreview(workshopId);
      setPreviewData(data);

      // Kiểm tra xem người dùng đã đăng ký chưa
      if (user && user.role === 'LEARNER') {
        const registeredWorkshops = await workshopService.getUserRegisteredWorkshops(user.id);
        setIsRegistered(registeredWorkshops.some((w) => w.id === workshopId));
      }
    } catch (err: any) {
      console.error('Lỗi khi tải thông tin preview workshop:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin preview workshop. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshopPreview();
  }, [workshopId, user]);

  /**
   * Định dạng ngày giờ
   */
  const formatDateTime = (dateString: string) => {
    try {
      return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  /**
   * Lấy màu cho trạng thái workshop
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'blue';
      case 'ongoing':
        return 'green';
      case 'completed':
        return 'gray';
      default:
        return 'default';
    }
  };

  /**
   * Lấy tên hiển thị cho trạng thái workshop
   */
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Sắp diễn ra';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'completed':
        return 'Đã kết thúc';
      default:
        return 'Không xác định';
    }
  };

  /**
   * Tính phần trăm thời gian đã trôi qua của workshop
   */
  const calculateProgress = () => {
    if (!previewData) return 0;
    
    const workshop = previewData.workshop;
    const now = new Date();
    const scheduledAt = new Date(workshop.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + workshop.duration * 60000);
    
    // Workshop chưa bắt đầu
    if (now < scheduledAt) return 0;
    
    // Workshop đã kết thúc
    if (now > endTime) return 100;
    
    // Workshop đang diễn ra
    const totalDuration = workshop.duration * 60000; // Tổng thời gian (ms)
    const elapsedTime = now.getTime() - scheduledAt.getTime(); // Thời gian đã trôi qua (ms)
    return Math.floor((elapsedTime / totalDuration) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin workshop..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button onClick={() => loadWorkshopPreview()} type="primary">
            Thử lại
          </Button>
        }
      />
    );
  }

  if (!previewData || !previewData.workshop) {
    return (
      <Alert
        message="Không tìm thấy thông tin"
        description="Không thể tìm thấy thông tin workshop. Vui lòng thử lại sau."
        type="warning"
        showIcon
        action={
          <Button onClick={() => navigate('/workshops')} type="primary">
            Quay lại danh sách
          </Button>
        }
      />
    );
  }

  const { workshop, preview } = previewData;
  const progress = calculateProgress();

  return (
    <div className="workshop-preview">
      <Card bordered={false} className="mb-6">
        <div className="mb-4">
          <Tag color={getStatusColor(preview.status)} className="mb-2">
            {getStatusDisplay(preview.status)}
          </Tag>
          <Typography.Title level={2} className="mb-2">
            {workshop.title}
          </Typography.Title>
          <Typography.Paragraph className="text-gray-500">
            <Tag color="blue">{workshop.type}</Tag>
          </Typography.Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card title="Thông tin workshop" bordered={false}>
              <Typography.Paragraph>
                {workshop.description}
              </Typography.Paragraph>
              
              <Divider />
              
              <Descriptions column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Thời gian">
                  <Space>
                    <CalendarOutlined />
                    {formatDateTime(workshop.scheduledAt)}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Thời lượng">
                  <Space>
                    <ClockCircleOutlined />
                    {workshop.duration} phút
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Số người đăng ký">
                  <Space>
                    <TeamOutlined />
                    {preview.attendeesCount}
                  </Space>
                </Descriptions.Item>
                {workshop.level && (
                  <Descriptions.Item label="Cấp độ">
                    <Tag color={workshop.level === 'BEGINNER' ? 'green' : workshop.level === 'INTERMEDIATE' ? 'blue' : 'purple'}>
                      {workshop.level === 'BEGINNER' ? 'Cơ bản' : workshop.level === 'INTERMEDIATE' ? 'Trung cấp' : 'Nâng cao'}
                    </Tag>
                  </Descriptions.Item>
                )}
                {workshop.isOnline ? (
                  <Descriptions.Item label="Hình thức">
                    <Space>
                      <VideoCameraOutlined />
                      <span>Trực tuyến</span>
                    </Space>
                  </Descriptions.Item>
                ) : workshop.location ? (
                  <Descriptions.Item label="Địa điểm">
                    <Space>
                      <EnvironmentOutlined />
                      {workshop.location}
                    </Space>
                  </Descriptions.Item>
                ) : null}
                {workshop.isOnline && workshop.meetingUrl && isRegistered && (
                  <Descriptions.Item label="Link phòng học">
                    <Space>
                      <LinkOutlined />
                      <a href={workshop.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Tham gia Google Meet
                      </a>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
              
              {preview.status === 'upcoming' && (
                <div className="mt-4">
                  <Typography.Title level={4}>
                    Thời gian còn lại
                  </Typography.Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="Ngày" 
                        value={preview.timeUntilWorkshop.days} 
                        suffix="ngày"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="Giờ" 
                        value={preview.timeUntilWorkshop.hours} 
                        suffix="giờ"
                      />
                    </Col>
                  </Row>
                </div>
              )}
              
              {preview.status === 'ongoing' && (
                <div className="mt-4">
                  <Typography.Title level={4}>
                    Tiến độ
                  </Typography.Title>
                  <Progress 
                    percent={progress} 
                    status="active" 
                    format={percent => `${percent}%`}
                  />
                </div>
              )}
              
              {/* Hiển thị tài liệu nếu có và người dùng đã đăng ký */}
              {workshop.materials && workshop.materials.length > 0 && isRegistered && (
                <div className="mt-4">
                  <Typography.Title level={4}>
                    Tài liệu
                  </Typography.Title>
                  <List
                    size="small"
                    bordered
                    dataSource={workshop.materials}
                    renderItem={(material) => {
                      const isUrl = material.startsWith('http');
                      return (
                        <List.Item>
                          <Space>
                            <FileOutlined />
                            {isUrl ? (
                              <a href={material} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {material}
                              </a>
                            ) : (
                              <span>{material}</span>
                            )}
                          </Space>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              )}
              
              {/* Hiển thị tags nếu có */}
              {workshop.tags && workshop.tags.length > 0 && (
                <div className="mt-4">
                  <Typography.Title level={4}>
                    Tags
                  </Typography.Title>
                  <div className="flex flex-wrap gap-2">
                    {workshop.tags.map((tag, index) => (
                      <Tag key={index} color="blue">
                        <Space>
                          <TagOutlined />
                          {tag}
                        </Space>
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card title="Giảng viên" bordered={false}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={64} icon={<UserOutlined />}>
                  {workshop.instructor?.user.firstName.charAt(0)}
                </Avatar>
                <div>
                  <Typography.Text strong style={{ display: 'block' }}>
                    {workshop.instructor?.user.firstName} {workshop.instructor?.user.lastName}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Giảng viên
                  </Typography.Text>
                </div>
              </div>
            </Card>
            
            <div className="mt-4">
              <Button 
                type="primary" 
                block 
                size="large"
                onClick={() => navigate(`/workshops/${workshopId}`)}
              >
                Xem chi tiết workshop
              </Button>
              
              {isRegistered && workshop.isOnline && workshop.meetingUrl && (
                <Tooltip title="Tham gia phòng học trực tuyến">
                  <Button 
                    type="primary" 
                    block
                    icon={<VideoCameraOutlined />}
                    href={workshop.meetingUrl}
                    target="_blank"
                    className="mt-2 bg-green-600 hover:bg-green-700"
                  >
                    Vào lớp học
                  </Button>
                </Tooltip>
              )}
              
              <Button 
                block 
                className="mt-2"
                onClick={() => navigate('/workshops')}
              >
                Quay lại danh sách
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default WorkshopPreview;
