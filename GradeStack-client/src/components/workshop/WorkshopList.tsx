import { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Tag, 
  Input, 
  Select, 
  Pagination, 
  Spin, 
  Typography, 
  Space 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
// Thay thế format từ date-fns bằng hàm tự định nghĩa
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
import { Workshop, PaginatedWorkshopResponse } from '../../types/workshop.types';
import { workshopService } from '../../services/workshop.service';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

/**
 * Component hiển thị danh sách workshop
 */
const WorkshopList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9); // Hiển thị 9 workshop mỗi trang
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  /**
   * Tải danh sách workshop
   */
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedWorkshopResponse = await workshopService.getWorkshops(
        page, 
        pageSize,
        type, 
        search
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
    loadWorkshops();
  }, [page, type]);

  /**
   * Xử lý khi người dùng tìm kiếm
   */
  const handleSearch = () => {
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    loadWorkshops();
  };

  /**
   * Xử lý khi người dùng chuyển trang
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  /**
   * Định dạng ngày giờ
   */
  const formatDateTime = (dateString: string) => {
    try {
      return formatDate(dateString);
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  /**
   * Chuyển đến trang chi tiết workshop
   */
  const handleViewDetails = (workshopId: string) => {
    navigate(`/workshops/${workshopId}`);
  };

  return (
    <div className="py-8">
      <Title level={2}>Danh sách Workshop</Title>

      {/* Bộ lọc và tìm kiếm */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Search
          placeholder="Tìm kiếm theo tiêu đề"
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
          size="large"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 400 }}
        />
        
        <Select
          placeholder="Loại Workshop"
          style={{ width: 180 }}
          value={type || undefined}
          onChange={(value) => setType(value)}
          allowClear
        >
          <Option value="FRONTEND">Frontend</Option>
          <Option value="BACKEND">Backend</Option>
        </Select>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="mb-4">
          <Text type="danger">{error}</Text>
        </div>
      )}

      {/* Hiển thị loading */}
      {loading ? (
        <div className="flex justify-center my-8">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Danh sách workshop */}
          {workshops.length === 0 ? (
            <Text>Không tìm thấy workshop nào.</Text>
          ) : (
            <Row gutter={[24, 24]}>
              {workshops.map((workshop) => (
                <Col xs={24} sm={12} md={8} key={workshop.id}>
                  <Card
                    hoverable
                    className="h-full flex flex-col"
                    actions={[
                      <Button type="primary" onClick={() => handleViewDetails(workshop.id)}>Xem chi tiết</Button>
                    ]}
                  >
                    <div className="mb-2 flex justify-between items-center">
                      <Title level={5} ellipsis={{ tooltip: workshop.title }}>
                        {workshop.title}
                      </Title>
                      <Tag color={workshop.type === 'FRONTEND' ? 'blue' : 'purple'}>
                        {workshop.type === 'FRONTEND' ? 'Frontend' : 'Backend'}
                      </Tag>
                    </div>
                    
                    <Paragraph 
                      ellipsis={{ rows: 3 }}
                      className="text-gray-500 mb-4"
                    >
                      {workshop.description}
                    </Paragraph>
                    
                    <Space direction="vertical" size="small" className="mt-auto">
                      <Text><strong>Thời gian:</strong> {formatDateTime(workshop.scheduledAt)}</Text>
                      <Text><strong>Thời lượng:</strong> {workshop.duration} phút</Text>
                      <Text>
                        <strong>Giảng viên:</strong> {workshop.instructor?.user.firstName} {workshop.instructor?.user.lastName}
                      </Text>
                      <Text>
                        <strong>Số người đăng ký:</strong> {workshop._count?.attendees || 0}
                      </Text>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Phân trang */}
          {total > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination 
                current={page} 
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `Tổng cộng ${total} workshop`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkshopList;
