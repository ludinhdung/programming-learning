import { FC, useState, useEffect } from 'react';
import {  Spin } from 'antd';
import { Link } from 'react-router-dom';

import Header from '../../components/Header/Header';
import topicService from '../../services/topicService';

// Interface for Course-Topic relationship in API
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

// Interface for processed Course
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

// Interface for Topic from API
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

// Interface for processed Topic
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
  
  // Different topic colors
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
        // Call API to get topics list with courses
        const data = await topicService.getTopicsWithCourses();
        console.log('API Response:', data);
        // Extract data from response - handle both 'value' wrapper and direct array
        const apiData = data.value || data;
        
        // Print detailed data for debugging
        console.log('API Response (processed):', apiData);
        
        if (Array.isArray(apiData)) {
          console.log('Number of topics:', apiData.length);
          if (apiData.length > 0) {
            console.log('First topic structure:', JSON.stringify(apiData[0], null, 2));
          }
        }
        
        // Update data processing to match new API structure
        const processedTopics = Array.isArray(apiData) 
          ? apiData.map((topic: ApiTopic) => {
              console.log(`Processing topic: ${topic.name}, courses:`, topic.courses);
                            return {
                id: topic.id || '', // Ensure always has value
                name: topic.name || 'Unnamed Topic', // Default value if null
                description: topic.description || 'No description', // Default value if null
                thumbnail: topic.thumbnail || '', // Default value if null
                instructor: topic.Instructor ? {
                  userId: topic.Instructor.userId,
                  user: {
                    firstName: topic.Instructor.user.firstName,
                    lastName: topic.Instructor.user.lastName,
                    email: topic.Instructor.user.email
                  }
                } : undefined,
                courses: Array.isArray(topic.courses) 
                  ? topic.courses
                    .filter(relation => relation && relation.course) // Filter out invalid relations first
                    .map(relation => {
                      // Create course object with null safety checks
                      // Already filtered so relation and relation.course exist
                      return {
                        id: relation.course.id || '',
                        title: relation.course.title || 'Unnamed Course',
                        description: relation.course.description || 'No description',
                        thumbnail: relation.course.thumbnail || '',
                        instructor: relation.course.instructor ? {
                          userId: relation.course.instructor.userId || '',
                          user: relation.course.instructor.user ? {
                            firstName: relation.course.instructor.user.firstName || '',
                            lastName: relation.course.instructor.user.lastName || '',
                            email: relation.course.instructor.user.email || ''
                          } : {
                            firstName: '',
                            lastName: '',
                            email: ''
                          }
                        } : undefined
                      };
                    })
                  : []
              };
            })
          : [];
          
        console.log('Processed data:', processedTopics);
        setTopics(processedTopics);
      } catch (err) {
        console.error('Error fetching topics list:', err);
        setError('Unable to load topics list. Please try again later.');
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
            <span className="text-white">TOPICS</span>
          </div>
          <p className="text-sm mt-4 relative z-10 text-white text-wrap text-left wrap-break-word w-1/3">
          Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
          when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading topics..." />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4 bg-red-100/10 rounded-lg">
            {error}
          </div>
        ) : (
          /* Topics Grid - Structure based on template */
          <div>
            {/* Display topics list horizontally */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-12">
              {topics.map((topic, index) => {
                const topicColor = topicColors[index % topicColors.length];
                const isSelected = selectedTopicId === topic.id;
                return (
                  <div 
                    key={topic.id}
                    onClick={() => setSelectedTopicId(isSelected ? null : topic.id)}
                    className={`cursor-pointer transform ${isSelected ? 'scale-[1.02] ring-2 ring-blue-500' : 'hover:scale-[1.02]'} transition-all duration-300`}
                  >
                    <div className="bg-slate-800 rounded-lg border-none hover:bg-slate-700/80 overflow-hidden">
                      {/* Topic Thumbnail */}
                      <div 
                        className="w-full h-32 bg-cover bg-center"
                        style={{ 
                          backgroundImage: topic.thumbnail ? `url(${topic.thumbnail})` : 'none',
                          backgroundColor: !topic.thumbnail ? '#1e293b' : 'transparent'
                        }}
                      >
                        {!topic.thumbnail && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-4xl font-bold" style={{ color: topicColor }}>
                              {topic.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Topic Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {topic.name}
                        </h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <span>{topic.courses?.length || 0} courses</span>
                          <span className="mx-2">•</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Display courses when a topic is selected */}
            {selectedTopicId && (
              <div>
                {/* Courses section title */}
                <div className="mb-10">
                  <div className="flex text-3xl justify-start uppercase font-extrabold">
                    <span className="text-blue-600 mr-2">//</span>
                    <span className="text-white">COURSES</span>
                  </div>
                </div>
                
                {/* Courses list - Similar to template */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                  {topics.find(t => t.id === selectedTopicId)?.courses.map((course) => (
                    <Link to={`/courses/${course.id}`} key={course.id} className="block">
                      <div className="bg-slate-800 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
                        {/* Course Thumbnail */}
                        <div className="relative w-full h-[140px] overflow-hidden">
                          <img 
                            src={course.thumbnail || "https://via.placeholder.com/200x140/1e293b/ffffff?text=No+Image"} 
                            alt={course.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/200x140/1e293b/ffffff?text=No+Image";
                            }}
                          />
                        </div>
                        
                        {/* Course Info */}
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                            {course.title || 'Unnamed Course'}
                          </h3>
                          <div className="flex items-center text-gray-400 text-sm">
                            <span>{course.instructor?.user?.firstName || 'Unnamed Author'}</span>
                            <span className="mx-2">•</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics; 