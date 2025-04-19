import { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  Input, 
  Select, 
  Pagination, 
  Spin, 
  Typography 
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

const { Text } = Typography;
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
    <div className="py-4">
      {/* Tiêu đề đã được chuyển lên WorkshopLayout */}

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
            <Text className="text-white">Không tìm thấy workshop nào.</Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workshops.map((workshop) => {
                // Tạo màu ngẫu nhiên cho workshop
                const topicColors = [
                  '#61DAFB', '#F7DF1E', '#DD0031', '#339933', 
                  '#FF4500', '#FF69B4', '#00CED1', '#563D7C', 
                  '#3178C6', '#FFA500', '#4169E1'
                ];
                const topicColor = topicColors[Math.floor(Math.random() * topicColors.length)];
                
                return (
                  <div key={workshop.id} className="mb-8">
                    <div 
                      className="relative w-full bg-gradient-to-b from-[#1a2030] to-[#1a2535] rounded-lg overflow-hidden p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => handleViewDetails(workshop.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="w-16 h-16 rounded-lg flex items-center justify-center bg-cover bg-center"
                          style={{ 
                            backgroundColor: topicColor,
                          }}
                        >
                          <span className="text-2xl font-bold text-white">
                            {workshop.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                              {workshop.title}
                            </h3>
                            <Tag color={workshop.type === 'FRONTEND' ? 'blue' : 'purple'}>
                              {workshop.type === 'FRONTEND' ? 'Frontend' : 'Backend'}
                            </Tag>
                          </div>
                          <div className="mt-4 flex items-center text-gray-400 text-sm">
                            <span><strong>Thời gian:</strong> {formatDateTime(workshop.scheduledAt)}</span>
                            <span className="mx-2">•</span>
                            <span><strong>Thời lượng:</strong> {workshop.duration} phút</span>
                          </div>
                          <div className="mt-2 flex items-center text-gray-400 text-sm">
                            <span><strong>Giảng viên:</strong> {workshop.instructor?.user.firstName} {workshop.instructor?.user.lastName}</span>
                            <span className="mx-2">•</span>
                            <span><strong>Số người đăng ký:</strong> {workshop._count?.attendees || 0}</span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(workshop.id);
                            }}>Xem chi tiết</Button>
                            <Button type="primary" onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/workshops/${workshop.id}/preview`);
                            }}>Xem preview</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                className="text-white"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkshopList;
