import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Card, Tag, Image, Row, Col, Select, Empty, Spin, Typography, Divider, Pagination } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import learningPathService from '../../../services/learningPathService';

const { Title } = Typography;
const { Option } = Select;

// Định nghĩa interface cho Learning Path
interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime: number | null; // Thời gian hoàn thành dự kiến (phút)
  courses: {
    id: string;
    courseId: string;
    learningPathId: string;
    order: number;
    course: any;
  }[];
  instructorUserId: string | null;
  Instructor?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Sử dụng learningPathService đã import

const LearningPathList: React.FC = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [courseCountFilter, setCourseCountFilter] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      // Lấy ID người dùng hiện tại từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }
      
      const user = JSON.parse(userData);
      
      // Kiểm tra cấu trúc dữ liệu user
      let instructorId;
      if (user.instructor && user.instructor.userId) {
        instructorId = user.instructor.userId;
      } else if (user.id) {
        instructorId = user.id;
      } else {
        message.error('Không tìm thấy ID của instructor');
        console.error('Cấu trúc dữ liệu user không chứa instructorId:', user);
        return;
      }
      
      const response = await learningPathService.getLearningPaths(instructorId);
      setLearningPaths(response);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách learning path:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách learning path');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (learningPathId: string) => {
    try {
      setDeleteLoading(learningPathId);
      
      // Lấy ID người dùng hiện tại từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }
      
      const user = JSON.parse(userData);
      
      // Xác định instructorId từ dữ liệu người dùng
      let instructorId;
      if (user.instructor && user.instructor.userId) {
        instructorId = user.instructor.userId;
      } else if (user.instructorId) {
        instructorId = user.instructorId;
      } else if (user.id && user.role === 'INSTRUCTOR_LEAD') {
        instructorId = user.id;
      }

      // Gọi API xóa learning path
      await learningPathService.deleteLearningPath(instructorId, learningPathId);
      
      message.success('Xóa learning path thành công');
      
      // Làm mới danh sách learning path sau khi xóa
      await fetchLearningPaths();
      
      // Chuyển về trang 1 nếu đang ở trang cuối và trang đó không còn dữ liệu
      const maxPage = Math.ceil((filteredAndSortedLearningPaths.length - 1) / pageSize);
      if (currentPage > maxPage && currentPage > 1) {
        setCurrentPage(maxPage || 1);
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa learning path:', error);
      message.error(error.response?.data?.message || 'Không thể xóa learning path');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Hàm debounce cho tìm kiếm
  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
  };

  const handleCourseCountFilterChange = (value: string) => {
    setCourseCountFilter(value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field && sorter.order) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField('updatedAt');
      setSortOrder('descend');
    }
  };

  // Lọc và sắp xếp danh sách learning path
  const filteredAndSortedLearningPaths = learningPaths
    .filter(learningPath => {
      // Lọc theo từ khóa tìm kiếm
      const searchMatch = searchText
        ? learningPath.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (learningPath.description ? learningPath.description.toLowerCase().includes(searchText.toLowerCase()) : false)
        : true;

      // Lọc theo số lượng khóa học
      let courseCountMatch = true;
      const courseCount = learningPath.courses?.length || 0;
      
      if (courseCountFilter === 'none') {
        courseCountMatch = courseCount === 0;
      } else if (courseCountFilter === 'few') {
        courseCountMatch = courseCount >= 1 && courseCount <= 3;
      } else if (courseCountFilter === 'many') {
        courseCountMatch = courseCount > 3;
      }

      return searchMatch && courseCountMatch;
    })
    .sort((a, b) => {
      // Sắp xếp theo trường được chọn
      if (sortField === 'title') {
        return sortOrder === 'ascend'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortField === 'courseCount') {
        const countA = a.courses?.length || 0;
        const countB = b.courses?.length || 0;
        return sortOrder === 'ascend' ? countA - countB : countB - countA;
      } else if (sortField === 'estimatedTime') {
        const timeA = a.estimatedCompletionTime || 0;
        const timeB = b.estimatedCompletionTime || 0;
        return sortOrder === 'ascend'
          ? timeA - timeB
          : timeB - timeA;
      } else {
        // Mặc định sắp xếp theo updatedAt
        return sortOrder === 'ascend'
          ? new Date(a.updatedAt || '').getTime() - new Date(b.updatedAt || '').getTime()
          : new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime();
      }
    });

  // Xử lý sự kiện thay đổi trang
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // Phân trang dữ liệu
  const paginatedLearningPaths = filteredAndSortedLearningPaths.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (thumbnail: string) => (
        <Image
          src={thumbnail || '/placeholder-image.jpg'}
          alt="Thumbnail"
          style={{ width: 60, height: 40, objectFit: 'cover' }}
          fallback="/placeholder-image.jpg"
        />
      ),
    },
    {
      title: 'Tên Learning Path',
      dataIndex: 'title',
      key: 'title',
      sorter: (a: LearningPath, b: LearningPath) => a.title.localeCompare(b.title),
      sortOrder: sortField === 'title' ? sortOrder : null,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thời gian dự kiến',
      dataIndex: 'estimatedCompletionTime',
      key: 'estimatedTime',
      render: (estimatedCompletionTime: number | null) => {
        if (!estimatedCompletionTime) return 'Chưa xác định';
        // Chuyển từ phút sang giờ
        const hours = Math.floor(estimatedCompletionTime / 60);
        const minutes = estimatedCompletionTime % 60;
        return hours > 0 
          ? minutes > 0 
            ? `${hours} giờ ${minutes} phút` 
            : `${hours} giờ`
          : `${minutes} phút`;
      },
      sorter: (a: LearningPath, b: LearningPath) => (a.estimatedCompletionTime || 0) - (b.estimatedCompletionTime || 0),
      sortOrder: sortField === 'estimatedTime' ? sortOrder : null,
    },
    {
      title: 'Số khóa học',
      dataIndex: 'courses',
      key: 'courseCount',
      render: (courses: any[]) => courses?.length || 0,
      sorter: (a: LearningPath, b: LearningPath) => (a.courses?.length || 0) - (b.courses?.length || 0),
      sortOrder: sortField === 'courseCount' ? sortOrder : null,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: LearningPath) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/instructor/learning-paths/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa learning path này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            okButtonProps={{ loading: deleteLoading === record.id }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.id}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render danh sách dạng grid
  const renderGridView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Spin size="large" />
        </div>
      );
    }

    if (filteredAndSortedLearningPaths.length === 0) {
      return (
        <Empty
          description={
            <span>
              {searchText
                ? 'No learning paths found matching your search'
                : 'No learning paths created yet. Create your first learning path!'}
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            onClick={() => navigate('/instructor-lead-management/learning-paths/create')}
            icon={<PlusOutlined />}
          >
            Create New Learning Path
          </Button>
        </Empty>
      );
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          {paginatedLearningPaths.map(learningPath => (
            <Col key={learningPath.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 140, overflow: 'hidden' }}>
                    <img
                      alt={learningPath.title}
                      src={learningPath.thumbnail || '/placeholder-image.jpg'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                }
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/instructor-lead-management/learning-paths/${learningPath.id}/edit`)}
                  >
                    Edit
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="Are you sure you want to delete this learning path?"
                    onConfirm={() => handleDelete(learningPath.id)}
                    okText="Yes"
                    cancelText="Không"
                    okButtonProps={{ loading: deleteLoading === learningPath.id }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={deleteLoading === learningPath.id}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={learningPath.title}
                  description={
                    <>
                      <div className="truncate mb-2">{learningPath.description || ''}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Tag color="blue">{learningPath.courses?.length || 0} khóa học</Tag>
                        <Tag color="green" icon={<ClockCircleOutlined />}>
                          {learningPath.estimatedCompletionTime 
                            ? `${Math.floor(learningPath.estimatedCompletionTime / 60)} giờ ${learningPath.estimatedCompletionTime % 60 > 0 ? `${learningPath.estimatedCompletionTime % 60} phút` : ''}` 
                            : 'Chưa xác định'}
                        </Tag>
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        {filteredAndSortedLearningPaths.length > pageSize && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredAndSortedLearningPaths.length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['8', '16', '24', '32']}
              onShowSizeChange={(_: number, size: number) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <Title level={4} className="m-0">Learning Path Management</Title>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/instructor-lead-management/learning-paths/create')}
              >
                Create New Learning Path
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchLearningPaths()}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>
        }
        className="w-full shadow-md"
        extra={
          <Space>
            <Button 
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => handleViewModeChange('grid')}
            >
              Grid
            </Button>
            <Button 
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => handleViewModeChange('table')}
            >
              Table
            </Button>
          </Space>
        }
      >
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Search learning path..."
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            style={{ width: 250 }}
            allowClear
          />
          
          <Select
            placeholder="Filter by course count"
            style={{ width: 200 }}
            onChange={handleCourseCountFilterChange}
            value={courseCountFilter}
          >
            <Option value="all">All learning paths</Option>
            <Option value="none">No courses</Option>
            <Option value="few">1-3 courses</Option>
            <Option value="many">Over 3 courses</Option>
          </Select>
        </div>
        
        <Divider />
        
        {viewMode === 'grid' ? (
          renderGridView()
        ) : (
          <Table
            columns={columns}
            dataSource={filteredAndSortedLearningPaths}
            rowKey="id"
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredAndSortedLearningPaths.length,
              onChange: handlePageChange,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '24', '32'],
              showTotal: (total) => `Total ${total} learning paths`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default LearningPathList;
