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
  List, 
  Spin, 
  Alert, 
  Modal, 
  Space, 
  Descriptions
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Workshop } from '../../types/workshop.types';
import { workshopService } from '../../services/workshop.service';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component hiển thị chi tiết workshop và cho phép đăng ký tham dự
 */
const WorkshopDetail = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Tải thông tin chi tiết workshop
   */
  const loadWorkshopDetail = async () => {
    if (!workshopId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await workshopService.getWorkshopById(workshopId);
      setWorkshop(data);
      
      // Kiểm tra xem người dùng đã đăng ký chưa
      if (user && user.role === 'LEARNER') {
        const registeredWorkshops = await workshopService.getRegisteredWorkshops(user.id);
        setIsRegistered(registeredWorkshops.some(w => w.id === workshopId));
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin workshop:', err);
      setError('Không thể tải thông tin workshop. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshopDetail();
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
   * Xử lý đăng ký tham dự workshop
   */
  const handleRegister = async () => {
    if (!user || !workshopId) return;
    
    try {
      setRegisterLoading(true);
      setError(null);
      
      await workshopService.registerWorkshop(user.id, { workshopId });
      setIsRegistered(true);
      setSuccessMessage('Đăng ký tham dự workshop thành công!');
      
      // Tải lại thông tin workshop
      loadWorkshopDetail();
    } catch (err: any) {
      console.error('Lỗi khi đăng ký workshop:', err);
      setError(err.response?.data?.message || 'Không thể đăng ký tham dự workshop. Vui lòng thử lại sau.');
    } finally {
      setRegisterLoading(false);
    }
  };

  /**
   * Xử lý hủy đăng ký tham dự workshop
   */
  const handleCancelRegistration = async () => {
    if (!user || !workshopId) return;
    
    try {
      setRegisterLoading(true);
      setError(null);
      
      await workshopService.cancelRegistration(user.id, workshopId);
      setIsRegistered(false);
      setSuccessMessage('Hủy đăng ký tham dự workshop thành công!');
      setOpenDialog(false);
      
      // Tải lại thông tin workshop
      loadWorkshopDetail();
    } catch (err: any) {
      console.error('Lỗi khi hủy đăng ký workshop:', err);
      setError(err.response?.data?.message || 'Không thể hủy đăng ký tham dự workshop. Vui lòng thử lại sau.');
    } finally {
      setRegisterLoading(false);
    }
  };

  /**
   * Xử lý xóa workshop (dành cho instructor)
   */
  const handleDeleteWorkshop = async () => {
    if (!user || !workshopId || !workshop) return;
    
    try {
      setRegisterLoading(true);
      setError(null);
      
      await workshopService.deleteWorkshop(user.id, workshopId);
      setSuccessMessage('Xóa workshop thành công!');
      
      // Chuyển hướng về trang danh sách workshop
      setTimeout(() => {
        navigate('/instructor/workshops');
      }, 1500);
    } catch (err: any) {
      console.error('Lỗi khi xóa workshop:', err);
      setError(err.response?.data?.message || 'Không thể xóa workshop. Vui lòng thử lại sau.');
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Alert
          message="Thông báo"
          description="Không tìm thấy thông tin workshop."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Button onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const isInstructor = user?.role === 'INSTRUCTOR' && user?.id === workshop.instructorId;
  const isLearner = user?.role === 'LEARNER';

  return (
    <div style={{ padding: '24px 0' }}>
      {successMessage && (
        <Alert
          message="Thành công"
          description={successMessage}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Typography.Title level={2} style={{ margin: 0 }}>
                {workshop.title}
              </Typography.Title>
              <Tag color={workshop.type === 'FRONTEND' ? 'blue' : 'purple'}>
                {workshop.type === 'FRONTEND' ? 'Frontend' : 'Backend'}
              </Tag>
            </div>
            
            <Typography.Text type="secondary">
              Tạo bởi {workshop.instructor?.user.firstName} {workshop.instructor?.user.lastName}
            </Typography.Text>
          </div>
          
          <div>
            {isInstructor ? (
              <Space>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/instructor/workshops/edit/${workshop.id}`)}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setOpenDialog(true)}
                >
                  Xóa
                </Button>
              </Space>
            ) : isLearner ? (
              isRegistered ? (
                <Button 
                  danger
                  onClick={() => setOpenDialog(true)}
                  loading={registerLoading}
                >
                  Hủy đăng ký
                </Button>
              ) : (
                <Button 
                  type="primary"
                  onClick={handleRegister}
                  loading={registerLoading}
                >
                  Đăng ký tham dự
                </Button>
              )
            ) : null}
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />
        
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Typography.Title level={4}>
              Mô tả
            </Typography.Title>
            <Typography.Paragraph>
              {workshop.description}
            </Typography.Paragraph>
            
            <div style={{ marginTop: 24 }}>
              <Typography.Title level={4}>
                Thông tin chi tiết
              </Typography.Title>
              <Descriptions column={1}>
                <Descriptions.Item 
                  label="Thời gian"
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  <Space>
                    <CalendarOutlined />
                    {formatDateTime(workshop.scheduledAt)}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item 
                  label="Thời lượng"
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  <Space>
                    <ClockCircleOutlined />
                    {workshop.duration} phút
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item 
                  label="Số người đăng ký"
                  labelStyle={{ fontWeight: 'bold' }}
                >
                  <Space>
                    <UserOutlined />
                    {workshop._count?.attendees || 0}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
          
          <Col xs={24} md={8}>
            <Card title="Giảng viên" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar size={64}>
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
            
            {workshop.attendees && workshop.attendees.length > 0 && (
              <Card title={`Người tham dự (${workshop._count?.attendees || 0})`}>
                <List
                  itemLayout="horizontal"
                  dataSource={workshop.attendees.slice(0, 5)}
                  renderItem={(attendance) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar>{attendance.user.firstName.charAt(0)}</Avatar>}
                        title={`${attendance.user.firstName} ${attendance.user.lastName}`}
                        description={attendance.user.email}
                      />
                    </List.Item>
                  )}
                />
                {workshop._count?.attendees > 5 && (
                  <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                    Và {workshop._count.attendees - 5} người khác...
                  </Typography.Text>
                )}
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      <div>
        <Button onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

      {/* Modal xác nhận hủy đăng ký hoặc xóa workshop */}
      <Modal
        title={isInstructor ? 'Xác nhận xóa workshop' : 'Xác nhận hủy đăng ký'}
        open={openDialog}
        onCancel={() => setOpenDialog(false)}
        footer={[
          <Button key="cancel" onClick={() => setOpenDialog(false)}>
            Hủy
          </Button>,
          <Button 
            key="confirm"
            danger
            onClick={isInstructor ? handleDeleteWorkshop : handleCancelRegistration} 
            loading={registerLoading}
          >
            {isInstructor ? 'Xóa' : 'Hủy đăng ký'}
          </Button>
        ]}
      >
        {isInstructor 
          ? 'Bạn có chắc chắn muốn xóa workshop này? Hành động này không thể hoàn tác.'
          : 'Bạn có chắc chắn muốn hủy đăng ký tham dự workshop này?'
        }
      </Modal>
    </div>
  );
};

export default WorkshopDetail;
