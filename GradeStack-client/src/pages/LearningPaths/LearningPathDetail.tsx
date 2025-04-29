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
  
  // Format time from seconds to hh:mm:ss format
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
  
  // Calculate total duration of a course
  const calculateCourseDuration = (modules: Module[]): number => {
    return modules.reduce((total, module) => total + (module.videoDuration || 0), 0);
  };
  
  // Calculate total duration of the entire learning path
  const calculateTotalDuration = (): number => {
    if (!learningPath || !learningPath.courses || !Array.isArray(learningPath.courses)) return 0;
    
    return learningPath.courses.reduce((total, pathCourse) => {
      if (!pathCourse.course || !pathCourse.course.modules || !Array.isArray(pathCourse.course.modules)) {
        return total;
      }
      return total + calculateCourseDuration(pathCourse.course.modules);
    }, 0);
  };
  
  // Calculate total number of modules in the learning path
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
        setError('Invalid learning path ID');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching data for learning path with ID:', pathId);
        const data = await learningPathService.getLearningPath(pathId);
        console.log('Data received from API:', data);
        
        if (!data) {
          setError('Learning path not found');
          setLoading(false);
          return;
        }
        
        setLearningPath(data);
      } catch (err: any) {
        console.error('Error fetching learning path details:', err);
        setError(err.response?.data?.message || 'Unable to load learning path information. Please try again later.');
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
            description={<span className="text-gray-400">{error || 'Learning path not found'}</span>} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
          <div className="mt-4 text-center">
            <Link to="/learning-paths" className="text-blue-500 hover:text-blue-400">
              <ArrowLeftOutlined /> Back to learning paths
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
            <ArrowLeftOutlined /> Back to learning paths
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
                  <span>{learningPath.courses.length} courses</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <PlayCircleOutlined className="mr-2" />
                  <span>{calculateTotalModules()} lessons</span>
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-md border border-gray-700 mt-4">
                <h3 className="text-white text-lg font-semibold mb-2">Author Information</h3>
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
                        <span>No information available</span>
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
          <h2 className="text-2xl font-bold text-white mb-4">Path Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Courses</h3>
              <div className="text-3xl text-white font-bold mb-1">{learningPath.courses.length}</div>
              <p className="text-gray-400 text-sm">Courses in this path</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Lessons</h3>
              <div className="text-3xl text-white font-bold mb-1">{calculateTotalModules()}</div>
              <p className="text-gray-400 text-sm">Total lessons</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <h3 className="text-white text-lg font-semibold mb-2">Duration</h3>
              <div className="text-3xl text-white font-bold mb-1">{formatDuration(calculateTotalDuration())}</div>
              <p className="text-gray-400 text-sm">Total learning time</p>
            </div>
          </div>
        </div>
        
        {/* Learning Path Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Path Content</h2>
          
          {learningPath.courses.length === 0 ? (
            <Empty 
              description={<span className="text-gray-400">This learning path has no courses yet</span>} 
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
                        <Tag color="blue">Course {pathCourse.order + 1}</Tag>
                        <span className="text-white ml-2 font-bold">{pathCourse.course.title}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <div className="mr-4">
                          <BookOutlined className="mr-2" />
                          <span>{pathCourse.course.modules.length} lessons</span>
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
                    <></>
                  }
                >
                  <div className="mb-4">
                    <div className="text-gray-300 mb-2">
                      <span className="font-semibold">Instructor:</span>{' '}
                      {pathCourse.course.instructor?.user ? (
                        <span>
                          {pathCourse.course.instructor.user.firstName} {pathCourse.course.instructor.user.lastName}
                        </span>
                      ) : (
                        <span>No information available</span>
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
                          <span className="font-semibold">Lessons</span>
                          <span className="ml-2 text-gray-400">({pathCourse.course.modules.length} lessons)</span>
                        </div>
                      }
                      className="bg-gray-700 border-gray-600"
                    >
                      {pathCourse.course.modules.length === 0 ? (
                        <Empty 
                          description={<span className="text-gray-400">This course has no lessons yet</span>} 
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
                                      View Lesson
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
                      View Course Details
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Enroll in learning path */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-white mb-2">Enroll in the Complete Learning Path</h2>
              <p className="text-gray-400">
                Access all {learningPath.courses.length} courses and {calculateTotalModules()} lessons in this learning path.
              </p>
            </div>
          </div>
        </div>
        
        {/* Feedback */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Student Feedback</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <p className="text-gray-400 mb-4">No feedback yet for this learning path.</p>
            <button className="text-blue-500 hover:text-blue-400">
              Write the first review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathDetail;