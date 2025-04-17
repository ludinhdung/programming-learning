import { FC, useState, useEffect } from 'react';
import {  Spin } from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header';
import topicService from '../../services/topicService';

// Interface cho mối quan hệ Course-Topic trong API
interface CourseRelation {
  id: string;
  topicId: string;
  courseId: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructor: {
      userId: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
      }
    }
  };
}

// Interface cho Course đã được xử lý
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price?: number;
  duration?: number;
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
}

// Interface cho Topic từ API
interface ApiTopic {
  id: string;
  name?: string;
  description?: string;
  thumbnail?: string;
  courses?: CourseRelation[];
  Instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
}

// Interface cho Topic đã được xử lý
interface Topic {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  courses: Course[];
  instructor?: {
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
}

const Topics: FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Các màu chủ đề khác nhau
  const topicColors = [
    '#61DAFB', '#F7DF1E', '#DD0031', '#339933', 
    '#FF4500', '#FF69B4', '#00CED1', '#563D7C', 
    '#3178C6', '#FFA500', '#4169E1'
  ];
  
  // Format duration from seconds to hours and minutes
  const formatDuration = (durationInSeconds: number): string => {
    if (!durationInSeconds) return 'N/A';
    
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  }

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy danh sách topics kèm theo courses
        const data = await topicService.getTopicsWithCourses();
        console.log('API Response:', data);
        // Extract data from response - handle both 'value' wrapper and direct array
        const apiData = data.value || data;
        
        // In dữ liệu chi tiết để gỡ lỗi
        console.log('API Response (processed):', apiData);
        
        if (Array.isArray(apiData)) {
          console.log('Số lượng chủ đề:', apiData.length);
          if (apiData.length > 0) {
            console.log('Cấu trúc chủ đề đầu tiên:', JSON.stringify(apiData[0], null, 2));
          }
        }
        
        // Cập nhật cách xử lý dữ liệu để phù hợp với cấu trúc API mới
        const processedTopics = Array.isArray(apiData) 
          ? apiData.map((topic: ApiTopic) => {
              console.log(`Processing topic: ${topic.name}, courses:`, topic.courses);
                            return {
                id: topic.id || '', // Đảm bảo luôn có giá trị
                name: topic.name || 'Chủ đề không tên', // Giá trị mặc định nếu null
                description: topic.description || 'Không có mô tả', // Giá trị mặc định nếu null
                thumbnail: topic.thumbnail || '', // Giá trị mặc định nếu null
                instructor: topic.Instructor ? {
                  userId: topic.Instructor.userId,
                  user: {
                    firstName: topic.Instructor.user.firstName,
                    lastName: topic.Instructor.user.lastName,
                    email: topic.Instructor.user.email
                  }
                } : undefined,
                courses: Array.isArray(topic.courses) 
                  ? topic.courses.map(relation => ({
                      id: relation.course.id,
                      title: relation.course.title,
                      description: relation.course.description,
                      thumbnail: relation.course.thumbnail,
                      instructor: {
                        userId: relation.course.instructor.userId,
                        user: {
                          firstName: relation.course.instructor.user.firstName,
                          lastName: relation.course.instructor.user.lastName,
                          email: relation.course.instructor.user.email
                        }
                      }
                    }))
                  : []
              };
            })
          : [];
          
        console.log('Dữ liệu đã xử lý:', processedTopics);
        setTopics(processedTopics);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách chủ đề:', err);
        setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1118] ">
      <Header />
      <div className="container mx-[25px] px-4 py-8 ">
        {/* Topics Header */}
        <div className="mb-12">
          <div className="flex text-3xl justify-start uppercase font-extrabold">
            <span className="text-blue-600 mr-2">//</span>
            <span className="text-white">Chủ Đề</span>
          </div>
          <p className="text-sm mt-4 relative z-10 text-white text-wrap text-left wrap-break-word w-1/3">
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
          when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải chủ đề..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-lg">
            {error}
          </div>
        ) : (
          /* Topics Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {topics.map((topic, index) => {
              const topicColor = topicColors[index % topicColors.length];
              const isSelected = selectedTopicId === topic.id;
              return (
                <div key={topic.id} className="block">
                  <div 
                    onClick={() => setSelectedTopicId(isSelected ? null : topic.id)}
                    className={`cursor-pointer transform ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.02]'} transition-all duration-300 mb-7`}
                  >
                    <div 
                      className={`${isSelected ? 'bg-slate-700' : 'bg-slate-800'} border-none h-full hover:bg-slate-700/80 py-4 px-4`}
                    >
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center bg-cover bg-center"
                        style={{ 
                          backgroundImage: topic.thumbnail ? `url(${topic.thumbnail})` : 'none',
                        }}
                      >
                        
                        {!topic.thumbnail && (
                          <span className="text-2xl font-bold" style={{ color: topicColor }}>
                            {topic.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex ">
                          <h3 className="text-xl font-semibold text-white">
                            {topic.name}
                          </h3>
                        </div>
                        <div className="mt-4 flex items-center text-gray-400 text-sm">
                          <span>{topic.courses?.length || 0} khóa học</span>
                          <span className="mx-2">•</span>
                        </div>
                      </div>
                    </div>
                    </div>
                    
                  </div>
                  
                  {/* Display courses when topic is selected */}
                  
                  {isSelected && topic.courses && topic.courses.length > 0 && (
                    <div className="text-white">
                      <div className="mb-7">
                          <div className="flex text-3xl justify-start uppercase font-extrabold">
                            <span className="text-blue-600 mr-2">//</span>
                            <span className="text-white">Khóa học</span>
                          </div>
                      </div>
                      {topic.courses.map((course) => (
                          <Link to={`/courses/${course.id}`} key={course.id}>
                            <div className="relative w-full h-[280px] bg-gradient-to-b from-[#1a2030] to-[#1a2535] rounded-lg overflow-hidden">
                          {/* Course Header */}
                          <div className="w-full px-6 py-6 text-center">
                              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                                  {course.title.split(' ').slice(0, 4).join(' ') + '...'}
                              </h1>
                              <div className="flex items-center justify-center mt-4">
                                  <div className="w-10 h-10 rounded-full overflow-hidden mr-2 ring-2 ring-blue-400 ring-opacity-50">
                                      <img
                                          src={course.thumbnail || ''}
                                          alt={course.title || 'Khóa học không tên'}
                                          className="w-full h-full object-cover overflow-hidden"
                                      />
                                  </div>
                                  <p className="text-gray-300 font-medium">{course.instructor?.user?.firstName || 'Tác giả không tên'}</p>
                              </div>
                          </div>

                          {/* Blue Wave Background */}
                          <div className="absolute  left-0 w-full">
                              <img src="https://images.laracasts.com/series/thumbnails/png//how-to-read-code-season-2.png?tr=w-490" alt="Jeffrey Way" className="w-full h-full object-cover" />
                          </div>
                        </div>
                          </Link>
                        ))}
                       
                    </div>
                    )}
                    </div>
                  );
                })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics; 