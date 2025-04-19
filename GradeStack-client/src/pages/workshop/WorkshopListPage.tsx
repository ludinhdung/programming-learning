import { useState, useEffect } from 'react';
import { Spin, Input, Select, Tag, Pagination, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  SearchOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  EnvironmentOutlined 
} from '@ant-design/icons';

import Header from '../../components/Header/Header';
import { workshopService } from '../../services/workshop.service';
import { Workshop } from '../../types/workshop.types';

const { Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

/**
 * Trang hiển thị danh sách workshop cho tất cả người dùng
 */
const WorkshopListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [total, setTotal] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [level, setLevel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);

  // Các màu chủ đề khác nhau
  const topicColors = [
    '#61DAFB', '#F7DF1E', '#DD0031', '#339933', 
    '#FF4500', '#FF69B4', '#00CED1', '#563D7C', 
    '#3178C6', '#FFA500', '#4169E1'
  ];

  /**
   * Tải danh sách workshop
   */
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await workshopService.getWorkshops(
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
  }, [page, type, level]);

  /**
   * Xử lý khi người dùng tìm kiếm
   */
  const handleSearch = () => {
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm
    loadWorkshops();
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
   * Kiểm tra xem workshop đã đầy chỗ chưa
   */
  const isWorkshopFull = (workshop: Workshop) => {
    if (!workshop.capacity) return false;
    return (workshop._count?.attendees || 0) >= workshop.capacity;
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
    } else if (isWorkshopFull(workshop)) {
      return { text: 'Hết chỗ', color: 'red' };
    } else {
      return { text: 'Sắp diễn ra', color: 'blue' };
    }
  };

  return (
    <div className="min-h-screen bg-[#151922]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tiêu đề trang */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex text-3xl justify-start uppercase font-extrabold">
              <span className="text-blue-600 mr-2">//</span>
              <span className="text-white">Workshop</span>
            </div>
            <div className="absolute -bottom-2 left-0 w-20 h-1 bg-blue-600"></div>
          </div>
          <p className="text-gray-400 mt-6 max-w-3xl">
            Tham gia các workshop chuyên sâu, học hỏi từ các chuyên gia và xây dựng kỹ năng lập trình của bạn trong môi trường tương tác
          </p>
        </div>
        
        {/* Bộ lọc và tìm kiếm */}
        <div className="mb-8 p-6 bg-[#1a1f2e] rounded-lg shadow-md border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Search
              placeholder="Tìm kiếm workshop"
              allowClear
              enterButton={
                <Button 
                  type="primary" 
                  icon={<SearchOutlined />}
                  className="bg-blue-600 hover:bg-blue-500 border-0"
                >
                  Tìm kiếm
                </Button>
              }
              size="large"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
              className="md:col-span-2"
              style={{ background: '#242a38', borderColor: '#374151' }}
            />
            
            <div className="flex gap-2">
              <Select
                placeholder="Loại"
                style={{ flex: 1, background: '#242a38', color: 'white', borderColor: '#374151' }}
                value={type || undefined}
                onChange={(value) => {
                  setType(value);
                  setPage(1);
                  loadWorkshops();
                }}
                allowClear
                size="large"
                className="text-white"
                dropdownStyle={{ background: '#242a38', color: 'white' }}
              >
                <Option value="FRONTEND">Frontend</Option>
                <Option value="BACKEND">Backend</Option>
              </Select>
              
              <Select
                placeholder="Cấp độ"
                style={{ flex: 1, background: '#242a38', color: 'white', borderColor: '#374151' }}
                value={level || undefined}
                onChange={(value) => {
                  setLevel(value);
                  setPage(1);
                  loadWorkshops();
                }}
                allowClear
                size="large"
                className="text-white"
                dropdownStyle={{ background: '#242a38', color: 'white' }}
              >
                <Option value="BEGINNER">Cơ bản</Option>
                <Option value="INTERMEDIATE">Trung cấp</Option>
                <Option value="ADVANCED">Nâng cao</Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <Text className="text-red-400">{error}</Text>
          </div>
        )}

        {/* Hiển thị loading */}
        {loading ? (
          <div className="flex justify-center my-12">
            <Spin size="large" className="text-blue-500" />
          </div>
        ) : (
          <div>
            {/* Danh sách workshop */}
            {workshops.length === 0 ? (
              <div className="text-center py-12 bg-[#1a1f2e] rounded-lg border border-gray-800 shadow-md">
                <Text className="text-white text-lg">Không tìm thấy workshop nào.</Text>
                <p className="text-gray-400 mt-2">Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bộ lọc.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {workshops.map((workshop) => {
                  // Tạo màu ngẫu nhiên cho workshop
                  const topicColor = topicColors[Math.floor(Math.random() * topicColors.length)];
                  const status = getWorkshopStatus(workshop);
                  const isSelected = selectedWorkshopId === workshop.id;
                  
                  return (
                    <div key={workshop.id} className="mb-8">
                      <div 
                        className={`relative w-full bg-gradient-to-b from-[#1a2030] to-[#1a2535] rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-800 ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-blue-500'}`}
                        onClick={() => setSelectedWorkshopId(isSelected ? null : workshop.id)}
                      >
                        <div className="p-6 flex">
                          {/* Workshop Icon/Image */}
                          <div 
                            className="w-16 h-16 rounded-lg flex items-center justify-center bg-cover bg-center"
                            style={{ 
                              backgroundImage: workshop.thumbnail ? `url(${workshop.thumbnail})` : 'none',
                              backgroundColor: !workshop.thumbnail ? topicColor : 'transparent'
                            }}
                          >
                            {!workshop.thumbnail && (
                              <span className="text-2xl font-bold text-white">
                                {workshop.title.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          {/* Workshop Content */}
                          <div className="flex-1 ml-4">
                            <div className="flex items-center">
                              <h3 className="text-xl font-semibold text-white">
                                {workshop.title}
                              </h3>
                              <Tag color={status.color} className="ml-2">
                                {status.text}
                              </Tag>
                              {workshop.level && (
                                <Tag 
                                  color={workshop.level === 'BEGINNER' ? 'green' : workshop.level === 'INTERMEDIATE' ? 'blue' : 'purple'}
                                  className="ml-2"
                                >
                                  {workshop.level === 'BEGINNER' ? 'Cơ bản' : 
                                   workshop.level === 'INTERMEDIATE' ? 'Trung cấp' : 
                                   workshop.level === 'ADVANCED' ? 'Nâng cao' : 'Không xác định'}
                                </Tag>
                              )}
                            </div>
                            
                            <Paragraph 
                              ellipsis={{ rows: 2 }}
                              className="text-gray-400 mt-2"
                            >
                              {workshop.description}
                            </Paragraph>
                            
                            <div className="mt-4 flex flex-wrap gap-4 text-gray-400 text-sm">
                              <div className="flex items-center">
                                <CalendarOutlined className="mr-1" />
                                {formatDateTime(workshop.scheduledAt)}
                              </div>
                              <div className="flex items-center">
                                <ClockCircleOutlined className="mr-1" />
                                {workshop.duration} phút
                              </div>
                              <div className="flex items-center">
                                <TeamOutlined className="mr-1" />
                                {workshop._count?.attendees || 0}{workshop.capacity ? `/${workshop.capacity}` : ''} học viên
                              </div>
                              {workshop.location && (
                                <div className="flex items-center">
                                  <EnvironmentOutlined className="mr-1" />
                                  {workshop.isOnline ? 'Online' : workshop.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chi tiết workshop khi được chọn */}
                      {isSelected && (
                        <div className="mt-4 p-6 bg-gradient-to-b from-[#1a2030] to-[#1a2535] rounded-lg border border-gray-800 shadow-md">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                          <div className="mb-6">
                            <div className="flex text-2xl justify-start font-bold">
                              <span className="text-blue-600 mr-2">//</span>
                              <span className="text-white">Thông tin chi tiết</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Mô tả</h4>
                              <p className="text-gray-400">{workshop.description}</p>
                              
                              {workshop.prerequisites && (
                                <div className="mt-4">
                                  <h4 className="text-lg font-semibold text-white mb-2">Yêu cầu tiên quyết</h4>
                                  <p className="text-gray-400">{workshop.prerequisites}</p>
                                </div>
                              )}
                              
                              {workshop.materials && workshop.materials.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-lg font-semibold text-white mb-2">Tài liệu</h4>
                                  <ul className="list-disc pl-5 text-gray-400">
                                    {workshop.materials.map((material, index) => (
                                      <li key={index}>{material}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-2">Giảng viên</h4>
                              {workshop.instructor ? (
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                    <span className="text-white font-bold">
                                      {workshop.instructor.user.firstName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">
                                      {workshop.instructor.user.firstName} {workshop.instructor.user.lastName}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-400">Không có thông tin giảng viên</p>
                              )}
                              
                              <div className="mt-8 flex gap-4">
                                <Button 
                                  type="primary" 
                                  size="large"
                                  onClick={() => navigate(`/workshops/${workshop.id}`)}
                                  className="bg-blue-600 hover:bg-blue-500 border-0"
                                >
                                  Xem chi tiết
                                </Button>
                                {!isWorkshopFull(workshop) && status.color !== 'default' && (
                                  <Button 
                                    size="large"
                                    onClick={() => navigate(`/workshops/${workshop.id}/register`)}
                                    className="bg-green-600 hover:bg-green-500 text-white border-0"
                                  >
                                    Đăng ký tham dự
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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
                  onChange={(page, pageSize) => {
                    setPage(page);
                    if (pageSize) setPageSize(pageSize);
                  }}
                  showSizeChanger
                  showTotal={(total) => `Tổng cộng ${total} workshop`}
                  className="text-white custom-pagination"
                  itemRender={(current, type, originalElement) => {
                    if (type === 'page') {
                      return (
                        <button className={`px-3 py-1 rounded-md ${current === page ? 'bg-blue-600 text-white' : 'bg-[#242a38] text-gray-300 hover:bg-gray-700'}`}>
                          {current}
                        </button>
                      );
                    }
                    return originalElement;
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopListPage;
