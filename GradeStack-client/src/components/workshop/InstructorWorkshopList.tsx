import { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  Table, 
  Tag, 
  Input, 
  Select, 
  Pagination, 
  Spin, 
  Alert, 
  Modal, 
  Space, 
  Row, 
  Col,
  Empty,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Workshop, PaginatedWorkshopResponse } from '../../types/workshop.types';
import { workshopService } from '../../services/workshop.service';
import { useAuth } from '../../hooks/useAuth';

/**
 * Component quản lý danh sách workshop dành cho Instructor
 */
const InstructorWorkshopList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [type, setType] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [deleteWorkshopId, setDeleteWorkshopId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Tải danh sách workshop của instructor
   */

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        message.error('Vui lòng đăng nhập để xem danh sách workshop');
        navigate('/login');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu user:', error);
      message.error('Không thể đọc thông tin người dùng');
      navigate('/login');
    }
  }, []);

  // useEffect cho loadWorkshops cần phụ thuộc vào user state mới
  useEffect(() => {
    if (user && user.role === 'INSTRUCTOR_LEAD') {
      loadWorkshops();
    }
  }, [user, page]);


  const loadWorkshops = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedWorkshopResponse = await workshopService.getInstructorWorkshops(
        user.id,
        page,
        10,
      );
      
      setWorkshops(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      console.error('Lỗi khi tải danh sách workshop:', err);
      setError('Không thể tải danh sách workshop. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };



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
   * Xử lý tìm kiếm
   */
  const handleSearch = () => {
    setPage(1);
    loadWorkshops();
  };

  /**
   * Xử lý chuyển trang
   */
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  /**
   * Xử lý xóa workshop
   */
  const handleDeleteWorkshop = async () => {
    if (!user || !deleteWorkshopId) return;
    
    try {
      setDeleteLoading(true);
      
      await workshopService.deleteWorkshop(user.id, deleteWorkshopId);
      setSuccessMessage('Xóa workshop thành công!');
      
      // Tải lại danh sách workshop
      loadWorkshops();
    } catch (err: any) {
      console.error('Lỗi khi xóa workshop:', err);
      setError(err.response?.data?.message || 'Không thể xóa workshop. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
      setDeleteWorkshopId(null);
    }
  };

  /**
   * Mở dialog xác nhận xóa
   */
  const openDeleteDialog = (workshopId: string) => {
    setDeleteWorkshopId(workshopId);
  };

  /**
   * Đóng dialog xác nhận xóa
   */
  const closeDeleteDialog = () => {
    setDeleteWorkshopId(null);
  };

  const handleEditWorkshop = (workshopId: string) => {
    navigate(`/instructor-lead-management/workshops/${workshopId}/edit`);
  };


  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, 'color': 'white' }}>
        <Typography.Title level={2}>
          Quản lý Workshop
        </Typography.Title>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/instructor-lead-management/workshops/create')}
        >
          Tạo Workshop mới
        </Button>
      </div>

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

      {/* Bộ lọc và tìm kiếm */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined />}
          />
        </Col>
        
        <Col>
          <Select
            placeholder="Loại Workshop"
            value={type || undefined}
            onChange={(value) => setType(value)}
            style={{ width: 150 }}
            allowClear
            options={[
              { value: '', label: 'Tất cả' },
              { value: 'FRONTEND', label: 'Frontend' },
              { value: 'BACKEND', label: 'Backend' }
            ]}
          />
        </Col>
        
        <Col>
          <Button 
            type="primary" 
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </Col>
      </Row>

      {/* Bảng danh sách workshop */}
      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <Spin size="large" />
          </div>
        ) : workshops.length === 0 ? (
          <Empty
            description="Bạn chưa tạo workshop nào."
            style={{ padding: '32px 0' }}
          />
        ) : (
          <Table
            dataSource={workshops}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Tiêu đề',
                dataIndex: 'title',
                key: 'title'
              },
              {
                title: 'Loại',
                dataIndex: 'type',
                key: 'type',
                render: (type) => (
                  <Tag color={type === 'FRONTEND' ? 'blue' : 'purple'}>
                    {type === 'FRONTEND' ? 'Frontend' : 'Backend'}
                  </Tag>
                )
              },
              {
                title: 'Thời gian',
                dataIndex: 'scheduledAt',
                key: 'scheduledAt',
                render: (scheduledAt) => formatDateTime(scheduledAt)
              },
              {
                title: 'Thời lượng',
                dataIndex: 'duration',
                key: 'duration',
                render: (duration) => `${duration} phút`
              },
              {
                title: 'Số người đăng ký',
                dataIndex: '_count',
                key: 'attendees',
                render: (_count) => _count?.attendees || 0
              },
              {
                title: 'Thao tác',
                key: 'actions',
                align: 'center',
                render: (_, workshop) => (
                  <Space>
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/instructor-lead-management/workshops/${workshop.id}`)}
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEditWorkshop(workshop.id)}
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => openDeleteDialog(workshop.id)}
                    />
                  </Space>
                )
              }
            ]}
          />
        )}
      </Card>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Pagination 
            total={totalPages * 10} 
            current={page} 
            onChange={handlePageChange} 
            showSizeChanger={false}
          />
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa workshop"
        open={Boolean(deleteWorkshopId)}
        onCancel={closeDeleteDialog}
        footer={[
          <Button key="cancel" onClick={closeDeleteDialog}>
            Hủy
          </Button>,
          <Button 
            key="delete"
            danger
            onClick={handleDeleteWorkshop} 
            loading={deleteLoading}
          >
            Xóa
          </Button>
        ]}
      >
        Bạn có chắc chắn muốn xóa workshop này? Hành động này không thể hoàn tác.
      </Modal>
    </div>
  );
};

export default InstructorWorkshopList;
