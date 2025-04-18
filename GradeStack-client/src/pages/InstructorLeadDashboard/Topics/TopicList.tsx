import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Popconfirm, message, Card, Tag, Image, Row, Col, Select, Empty, Spin, Typography, Divider, Pagination } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import topicService, { Topic } from '../../../services/topicService';
import { debounce } from 'lodash';

const { Title } = Typography;
const { Option } = Select;
type Breakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';

const TopicList: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [courseCountFilter, setCourseCountFilter] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [instructorId, setInstructorId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      // Lấy ID người dùng hiện tại từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }
      
      const user = JSON.parse(userData);
      console.log('User data:', user);
      
      // Kiểm tra cấu trúc dữ liệu user
      let id;
      if (user.instructor && user.instructor.id) {
        id = user.instructor.id;
      } else if (user.id) {
        id = user.id;
      } else {
        message.error('Không tìm thấy ID của instructor');
        console.error('Cấu trúc dữ liệu user không chứa id:', user);
        return;
      }
      
      console.log('Instructor ID being used:', id);
      setInstructorId(id);
      const response = await topicService.getTopicsByInstructor(id);
      console.log('Topics response:', response);
      setTopics(response);
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách chủ đề:', error);
      message.error(error.response?.data?.message || 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (topicId: string) => {
    try {
      setDeleteLoading(topicId);
      console.log('Đang xóa chủ đề với ID:', topicId);
      
      // Kiểm tra xem chủ đề có khóa học liên kết không
      const topic = topics.find(t => t.id === topicId);
      const courseCount = topic?._count?.courses || 0;
      
      if (courseCount > 0) {
        message.error(`Không thể xóa chủ đề này vì có ${courseCount} khóa học liên kết`);
        return;
      }
      
      // Gọi API xóa chủ đề
      const response = await topicService.deleteTopic(instructorId, topicId);
      console.log('Kết quả xóa:', response);
      
      message.success('Xóa chủ đề thành công');
      
      // Làm mới danh sách chủ đề sau khi xóa
      await fetchTopics();
      
      // Chuyển về trang 1 nếu đang ở trang cuối và trang đó không còn dữ liệu
      const maxPage = Math.ceil((filteredAndSortedTopics.length - 1) / pageSize);
      if (currentPage > maxPage && currentPage > 1) {
        setCurrentPage(maxPage || 1);
      }
    } catch (error: any) {
      console.error('Lỗi khi xóa chủ đề:', error);
      message.error(error.response?.data?.message || 'Không thể xóa chủ đề');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Hàm debounce cho tìm kiếm
  const debouncedSearch = debounce((value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    console.log('Đang tìm kiếm với từ khóa:', value);
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
    console.log('Đang lọc theo số khóa học:', value);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    console.log('Table params:', { pagination, filters, sorter });
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    }
  };

  // Lọc và sắp xếp dữ liệu
  const filteredAndSortedTopics = topics
    .filter(topic => {
      // Lọc theo text tìm kiếm
      const matchesSearch = 
        topic.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (topic.description && topic.description.toLowerCase().includes(searchText.toLowerCase()));
      
      // Lọc theo số lượng khóa học
      const courseCount = topic._count?.courses || 0;
      if (courseCountFilter === 'all') return matchesSearch;
      if (courseCountFilter === 'none' && courseCount === 0) return matchesSearch;
      if (courseCountFilter === 'few' && courseCount > 0 && courseCount <= 3) return matchesSearch;
      if (courseCountFilter === 'many' && courseCount > 3) return matchesSearch;
      
      return false;
    })
    .sort((a, b) => {
      // Sắp xếp theo trường đã chọn
      if (sortField === 'name') {
        return sortOrder === 'ascend' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'courses') {
        const aCount = a._count?.courses || 0;
        const bCount = b._count?.courses || 0;
        return sortOrder === 'ascend' ? aCount - bCount : bCount - aCount;
      } else if (sortField === 'updatedAt') {
        const aDate = new Date(a.updatedAt || a.createdAt || '').getTime();
        const bDate = new Date(b.updatedAt || b.createdAt || '').getTime();
        return sortOrder === 'ascend' ? aDate - bDate : bDate - aDate;
      }
      return 0;
    });
    
  // Tính toán dữ liệu phân trang
  const paginatedTopics = filteredAndSortedTopics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Xử lý sự kiện thay đổi trang
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 120,
      render: (thumbnail: string) => (
        <Image 
          src={thumbnail} 
          alt="Hình ảnh chủ đề" 
          style={{ width: 80, height: 45, objectFit: 'cover' }}
          fallback="data:image/png;base64,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"
        />
      ),
    },
    {
      title: 'Tên chủ đề',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Topic, b: Topic) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      responsive: ['md' as Breakpoint],
    },
    {
      title: 'Số khóa học',
      key: 'courses',
      width: 120,
      render: (_: any, record: Topic) => (
        <Tag color="blue">{record._count?.courses || 0} khóa học</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_: any, record: Topic) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/instructor-lead-management/topics/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa chủ đề này?"
            description="Chủ đề chỉ có thể xóa khi không có khóa học nào liên kết."
            onConfirm={() => handleDelete(record.id)}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <Button 
              type="primary" 
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
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      );
    }

    if (filteredAndSortedTopics.length === 0) {
      return (
        <Empty
          description="Không tìm thấy chủ đề nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <>
        <Row gutter={[16, 16]}>
          {paginatedTopics.map(topic => (
            <Col xs={24} sm={12} md={8} lg={6} key={topic.id}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 160, overflow: 'hidden' }}>
                    <Image
                      alt={topic.name}
                      src={topic.thumbnail}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      fallback="data:image/png;base64,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"
                    />
                  </div>
                }
                actions={[
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => navigate(`/instructor-lead-management/topics/${topic.id}/edit`)}
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa chủ đề này?"
                    description="Chủ đề chỉ có thể xóa khi không có khóa học nào liên kết."
                    onConfirm={() => handleDelete(topic.id)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      loading={deleteLoading === topic.id}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                ]}
              >
                <Card.Meta
                  title={topic.name}
                  description={
                    <>
                      <div className="truncate mb-2">{topic.description}</div>
                      <Tag color="blue">{topic._count?.courses || 0} khóa học</Tag>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
        
        {filteredAndSortedTopics.length > pageSize && (
          <div className="flex justify-center mt-4">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredAndSortedTopics.length}
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
            <Title level={4} className="m-0">Quản lý chủ đề</Title>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => navigate('/instructor-lead-management/topics/create')}
              >
                Tạo chủ đề mới
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => fetchTopics()}
                loading={loading}
              >
                Làm mới
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
              Lưới
            </Button>
            <Button 
              type={viewMode === 'table' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => handleViewModeChange('table')}
            >
              Bảng
            </Button>
          </Space>
        }
      >
        <div className="flex flex-wrap gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm chủ đề..."
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            style={{ width: 250 }}
            allowClear
          />
          
          <Select
            placeholder="Lọc theo số khóa học"
            style={{ width: 200 }}
            onChange={handleCourseCountFilterChange}
            value={courseCountFilter}
          >
            <Option value="all">Tất cả chủ đề</Option>
            <Option value="none">Chưa có khóa học</Option>
            <Option value="few">1-3 khóa học</Option>
            <Option value="many">Trên 3 khóa học</Option>
          </Select>
        </div>
        
        <Divider />
        
        {viewMode === 'grid' ? (
          renderGridView()
        ) : (
          <Table
            columns={columns}
            dataSource={filteredAndSortedTopics}
            rowKey="id"
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredAndSortedTopics.length,
              onChange: handlePageChange,
              showSizeChanger: true,
              pageSizeOptions: ['8', '16', '24', '32'],
              showTotal: (total) => `Tổng cộng ${total} chủ đề`,
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default TopicList;
