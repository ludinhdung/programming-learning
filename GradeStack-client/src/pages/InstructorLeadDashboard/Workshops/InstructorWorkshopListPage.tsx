import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Input,
  Select,
  Typography,
  Card,
  Spin,
  Tooltip,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { workshopService } from '../../../services/workshop.service';
import { Workshop } from '../../../types/workshop.types';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Trang quản lý danh sách workshop dành cho Instructor
 */
const InstructorWorkshopListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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
   * Tải danh sách workshop của giảng viên
   */
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!instructorId) {
        setError('Không thể xác định giảng viên');
        return;
      }
      
      const response = await workshopService.getWorkshops(
        page,
        pageSize,
        type,
        search,
        instructorId
      );
      
      setWorkshops(response.data);
      setTotal(response.meta.totalCount);
    } catch (err) {
      console.error('Lỗi khi tải danh sách workshop:', err);
      setError('Không thể tải danh sách workshop. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải lại danh sách khi các tham số thay đổi
   */
  useEffect(() => {
    if (instructorId) {
      loadWorkshops();
    }
  }, [page, pageSize, type, instructorId]);

  /**
   * Xử lý khi người dùng tìm kiếm
   */
  const handleSearch = () => {
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    loadWorkshops();
  };

  /**
   * Xử lý khi người dùng xóa workshop
   */
  const handleDelete = async (workshopId: string) => {
    try {
      await workshopService.deleteWorkshop(workshopId);
      message.success('Xóa workshop thành công');
      loadWorkshops();
    } catch (err) {
      console.error('Lỗi khi xóa workshop:', err);
      message.error('Không thể xóa workshop. Vui lòng thử lại sau.');
    }
  };

  /**
   * Định dạng ngày giờ
   */
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  /**
   * Hiển thị trạng thái của workshop
   */
  const getWorkshopStatus = (workshop: Workshop) => {
    const now = new Date();
    const scheduledAt = new Date(workshop.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + workshop.duration * 60000);
    
    if (now > endTime) {
      return { text: 'Đã kết thúc', color: 'default' };
    } else if (now > scheduledAt) {
      return { text: 'Đang diễn ra', color: 'green' };
    } else if ((workshop._count?.attendees || 0) >= (workshop.capacity || Infinity)) {
      return { text: 'Hết chỗ', color: 'red' };
    } else {
      return { text: 'Sắp diễn ra', color: 'blue' };
    }
  };

  /**
   * Hiển thị cấp độ của workshop
   */
  const getLevelTag = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return <Tag color="green">Cơ bản</Tag>;
      case 'INTERMEDIATE':
        return <Tag color="blue">Trung cấp</Tag>;
      case 'ADVANCED':
        return <Tag color="purple">Nâng cao</Tag>;
      default:
        return <Tag color="green">Cơ bản</Tag>;
    }
  };

  // Định nghĩa các cột cho bảng
  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Workshop) => (
        <div>
          <Text strong>{text}</Text>
          <div className="mt-1">
            {getLevelTag(record.level || 'BEGINNER')}
            <Tag color={record.type === 'FRONTEND' ? 'blue' : 'purple'} className="ml-1">
              {record.type === 'FRONTEND' ? 'Frontend' : 'Backend'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'scheduledAt',
      render: (_: any, record: Workshop) => (
        <div>
          <div className="flex items-center">
            <CalendarOutlined className="mr-1" />
            {formatDateTime(record.scheduledAt)}
          </div>
          <div className="flex items-center mt-1">
            <ClockCircleOutlined className="mr-1" />
            {record.duration} phút
          </div>
        </div>
      ),
    },
    {
      title: 'Học viên',
      key: 'attendees',
      render: (_: any, record: Workshop) => (
        <div className="flex items-center">
          <TeamOutlined className="mr-1" />
          {record._count?.attendees || 0}{record.capacity ? `/${record.capacity}` : ''}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: Workshop) => {
        const status = getWorkshopStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Workshop) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/workshops/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/instructor-lead-management/workshops/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa workshop này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 instructor-lead-bg min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex text-3xl justify-start uppercase font-extrabold">
          <span className="text-blue-600 mr-2">//</span>
          <span className="text-white">Quản lý Workshop</span>
        </div>
        
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={() => navigate('/instructor-lead-management/workshops/create')}
          className="instructor-lead-btn-primary"
        >
          Tạo Workshop mới
        </Button>
      </div>

      <Card className="mb-6 instructor-lead-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Tìm kiếm theo tiêu đề"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            suffix={<SearchOutlined onClick={handleSearch} className="cursor-pointer text-blue-500" />}
            className="md:col-span-2 instructor-lead-input"
          />
          
          <Select
            placeholder="Loại workshop"
            value={type || undefined}
            onChange={(value) => {
              setType(value);
              setPage(1);
              loadWorkshops();
            }}
            allowClear
            style={{ width: '100%' }}
            className="instructor-lead-input"
            dropdownStyle={{ background: '#242a38', color: 'white' }}
          >
            <Option value="FRONTEND">Frontend</Option>
            <Option value="BACKEND">Backend</Option>
          </Select>
        </div>
      </Card>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <Text className="text-red-400 instructor-lead-text">{error}</Text>
        </div>
      )}

      <Card className="instructor-lead-card overflow-hidden">
        <Table
          columns={columns}
          dataSource={workshops.map(workshop => ({ ...workshop, key: workshop.id }))}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (page, pageSize) => {
              setPage(page);
              if (pageSize) setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} workshop`,
          }}
          className="custom-table dark-theme-table instructor-lead-table"
        />
      </Card>
    </div>
  );
};

export default InstructorWorkshopListPage;
