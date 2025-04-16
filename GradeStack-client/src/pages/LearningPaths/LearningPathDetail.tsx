import { FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spin, Empty, Card, Collapse, Tag } from 'antd';
import { ClockCircleOutlined, BookOutlined, PlayCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import learningPathService from '../../services/learningPathService';

interface Instructor {
  id?: string;
  userId?: string;
  user?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  videoDuration: number | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  instructor?: {
    id?: string;
    userId?: string;
    user?: {
      id?: string;
      firstName: string;
      lastName: string;
    };
  };
  modules: Module[];
}

interface LearningPathCourse {
  id: string;
  order: number;
  course: Course;
  courseId?: string;
  learningPathId?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime?: number | null;
  instructor?: Instructor;
  Instructor?: Instructor;
  courses: LearningPathCourse[];
}

const LearningPathDetail: FC = () => {
  const { pathId } = useParams<{ pathId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Format thời gian từ giây sang định dạng hh:mm:ss
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
    
    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  };
  
  // Tính tổng thời gian của một khóa học
  const calculateCourseDuration = (modules: Module[]): number => {
    return modules.reduce((total, module) => total + (module.videoDuration || 0), 0);
  };
  
  // Tính tổng thời gian của toàn bộ learning path
  const calculateTotalDuration = (): number => {
    if (!learningPath || !learningPath.courses || !Array.isArray(learningPath.courses)) return 0;
    
    return learningPath.courses.reduce((total, pathCourse) => {
      if (!pathCourse.course || !pathCourse.course.modules || !Array.isArray(pathCourse.course.modules)) {
        return total;
      }
      return total + calculateCourseDuration(pathCourse.course.modules);
    }, 0);
  };
  
  // Tính tổng số module trong learning path
  const calculateTotalModules = (): number => {
    if (!learningPath || !learningPath.courses || !Array.isArray(learningPath.courses)) return 0;
    
    return learningPath.courses.reduce((total, pathCourse) => {
      if (!pathCourse.course || !pathCourse.course.modules || !Array.isArray(pathCourse.course.modules)) {
        return total;
      }
      return total + pathCourse.course.modules.length;
    }, 0);
  };

  useEffect(() => {
    const fetchLearningPathDetail = async (): Promise<void> => {
      if (!pathId) {
        setError('ID của learning path không hợp lệ');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Đang lấy dữ liệu cho learning path với ID:', pathId);
        const data = await learningPathService.getLearningPath(pathId);
        console.log('Dữ liệu nhận được từ API:', data);
        
        if (!data) {
          setError('Không tìm thấy learning path');
          setLoading(false);
          return;
        }
        
        setLearningPath(data);
      } catch (err: any) {
        console.error('Lỗi khi lấy thông tin learning path:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin learning path. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPathDetail();
  }, [pathId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1118] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-[#0d1118]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Empty 
            description={<span className="text-gray-400">{error || 'Không tìm thấy learning path'}</span>} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
          <div className="mt-4 text-center">
            <Link to="/learning-paths" className="text-blue-500 hover:text-blue-400">
              <ArrowLeftOutlined /> Quay lại danh sách learning path
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link to="/learning-paths" className="text-blue-500 hover:text-blue-400">
            <ArrowLeftOutlined /> Quay lại danh sách learning path
          </Link>
        </div>
        
        {/* Learning Path Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="rounded-lg overflow-hidden bg-gray-800">
                {learningPath.thumbnail ? (
                  <img 
                    src={learningPath.thumbnail} 
                    alt={learningPath.title} 
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <BookOutlined style={{ fontSize: '48px', color: '#aaa' }} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Learning Path Info */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{learningPath.title}</h1>
              
              {learningPath.description && (
                <p className="text-gray-300 mb-4">{learningPath.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center text-gray-300">
                  <ClockCircleOutlined className="mr-2" />
                  <span>{formatDuration(calculateTotalDuration())}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <BookOutlined className="mr-2" />
                  <span>{learningPath.courses.length} khóa học</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <PlayCircleOutlined className="mr-2" />
                  <span>{calculateTotalModules()} bài học</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700 mt-4">
                <h3 className="text-white text-lg font-semibold mb-2">Thông tin tác giả</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {learningPath.Instructor?.user ? (
                      `${learningPath.Instructor.user.firstName.charAt(0)}${learningPath.Instructor.user.lastName.charAt(0)}`
                    ) : ('?')}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {learningPath.Instructor?.user ? (
                        <span>
                          {learningPath.Instructor.user.firstName} {learningPath.Instructor.user.lastName}
                        </span>
                      ) : (
                        <span>Không có thông tin</span>
                      )}
                    </div>
                    {learningPath.Instructor?.user?.email && (
                      <div className="text-gray-400 text-sm">{learningPath.Instructor.user.email}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Learning Path Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Tổng quan lộ trình</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Khóa học</h3>
              <div className="text-3xl text-white font-bold mb-1">{learningPath.courses.length}</div>
              <p className="text-gray-400 text-sm">Khóa học trong lộ trình</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Bài học</h3>
              <div className="text-3xl text-white font-bold mb-1">{calculateTotalModules()}</div>
              <p className="text-gray-400 text-sm">Tổng số bài học</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Thời lượng</h3>
              <div className="text-3xl text-white font-bold mb-1">{formatDuration(calculateTotalDuration())}</div>
              <p className="text-gray-400 text-sm">Tổng thời gian học</p>
            </div>
          </div>
        </div>
        
        {/* Learning Path Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Nội dung lộ trình</h2>
          
          {learningPath.courses.length === 0 ? (
            <Empty 
              description={<span className="text-gray-400">Lộ trình này chưa có khóa học nào</span>} 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          ) : (
            <div className="space-y-6">
              {learningPath.courses.map((pathCourse) => (
                <Card 
                  key={pathCourse.id}
                  className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors"
                  title={
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div className="mb-2 sm:mb-0">
                        <Tag color="blue">Khóa học {pathCourse.order + 1}</Tag>
                        <span className="text-white ml-2 font-bold">{pathCourse.course.title}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <div className="mr-4">
                          <BookOutlined className="mr-2" />
                          <span>{pathCourse.course.modules.length} bài học</span>
                        </div>
                        <div>
                          <ClockCircleOutlined className="mr-2" />
                          {formatDuration(calculateCourseDuration(pathCourse.course.modules))}
                        </div>
                      </div>
                    </div>
                  }
                  headStyle={{ backgroundColor: '#1f2937', borderBottom: '1px solid #374151' }}
                  bodyStyle={{ backgroundColor: '#1f2937' }}
                  extra={
                    <Link 
                      to={`/courses/${pathCourse.course.id}`} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
                    >
                      Đăng ký khóa học
                    </Link>
                  }
                >
                  <div className="mb-4">
                    <div className="text-gray-300 mb-2">
                      <span className="font-semibold">Giảng viên:</span>{' '}
                      {pathCourse.course.instructor?.user ? (
                        <span>
                          {pathCourse.course.instructor.user.firstName} {pathCourse.course.instructor.user.lastName}
                        </span>
                      ) : (
                        <span>Không có thông tin</span>
                      )}
                    </div>
                    
                    {pathCourse.course.description && (
                      <p className="text-gray-300">{pathCourse.course.description}</p>
                    )}
                  </div>
                  
                  <Collapse 
                    className="bg-gray-700 border-gray-600"
                    bordered={false}
                    defaultActiveKey={['modules']}
                    expandIconPosition="end"
                  >
                    <Collapse.Panel 
                      key="modules" 
                      header={
                        <div className="text-white">
                          <span className="font-semibold">Các bài học</span>
                          <span className="ml-2 text-gray-400">({pathCourse.course.modules.length} bài)</span>
                        </div>
                      }
                      className="bg-gray-700 border-gray-600"
                    >
                      {pathCourse.course.modules.length === 0 ? (
                        <Empty 
                          description={<span className="text-gray-400">Khóa học này chưa có bài học nào</span>} 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        />
                      ) : (
                        <div className="space-y-4">
                          {pathCourse.course.modules.map((module, index) => (
                            <div key={module.id} className="p-4 rounded-md bg-gray-800 border border-gray-700 hover:border-blue-500 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                    {index + 1}
                                  </div>
                                  <h4 className="text-white font-medium">{module.title}</h4>
                                </div>
                                <div className="flex items-center">
                                  {module.videoDuration && (
                                    <div className="text-gray-400 whitespace-nowrap mr-4">
                                      <ClockCircleOutlined className="mr-1" />
                                      {formatDuration(module.videoDuration)}
                                    </div>
                                  )}
                                  {module.videoUrl && (
                                    <Link 
                                      to={`/courses/${pathCourse.course.id}/modules/${module.id}`}
                                      className="text-blue-500 hover:text-blue-400 text-sm"
                                    >
                                      Xem bài học
                                    </Link>
                                  )}
                                </div>
                              </div>
                              {module.description && (
                                <p className="text-gray-400 text-sm ml-11">{module.description}</p>
                              )}
                              {module.videoUrl && (
                                <div className="mt-2 ml-11">
                                  <Tag color="blue">Video</Tag>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Collapse.Panel>
                  </Collapse>
                  
                  <div className="mt-4 text-right">
                    <Link 
                      to={`/courses/${pathCourse.course.id}`} 
                      className="text-blue-500 hover:text-blue-400"
                    >
                      Xem chi tiết khóa học
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Đăng ký lộ trình */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Đăng ký toàn bộ lộ trình học</h2>
              <p className="text-gray-400">
                Tiếp cận toàn bộ {learningPath.courses.length} khóa học và {calculateTotalModules()} bài học trong lộ trình này.
              </p>
            </div>
            <Link 
              to={`/learning-paths/${learningPath.id}/enroll`} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
        
        {/* Đánh giá */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Đánh giá từ học viên</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">Chưa có đánh giá nào cho lộ trình học này.</p>
            <button className="text-blue-500 hover:text-blue-400">
              Viết đánh giá đầu tiên
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;