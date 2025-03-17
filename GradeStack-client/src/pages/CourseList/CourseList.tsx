import { useState } from 'react';
import { Input, Checkbox, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
  };
  thumbnailUrl: string;
  category: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const topics = [
    { id: 'javascript', name: 'JavaScript', count: 25 },
    { id: 'php', name: 'PHP', count: 32 },
    { id: 'laravel', name: 'Laravel', count: 45 },
    { id: 'vue', name: 'Vue', count: 18 },
    { id: 'react', name: 'React', count: 20 },
    { id: 'testing', name: 'Testing', count: 15 },
  ];

  const instructors = [
    { id: 'jeffrey-way', name: 'Jeffrey Way', count: 42 },
    { id: 'jeremy-mcpeak', name: 'Jeremy McPeak', count: 28 },
    { id: 'simon-wardley', name: 'Simon Wardley', count: 15 },
    { id: 'luke-downing', name: 'Luke Downing', count: 23 },
  ];

  const handleTopicChange = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleInstructorChange = (instructorId: string) => {
    setSelectedInstructors(prev => 
      prev.includes(instructorId) 
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const courses: Course[] = [
    {
      id: '1',
      title: "Jeffrey's Larabits",
      description: 'Quick tips and tricks about Laravel and web development',
      instructor: {
        name: 'Jeffrey Way',
        avatar: 'https://ik.imagekit.io/laracasts/instructors/1770.jpeg?w=260&q=50'
      },
      thumbnailUrl: 'https://ik.imagekit.io/laracasts/series/thumbnails/svg/larabits.svg',
      category: 'Laravel',
      duration: '3h 27m',
      level: 'Intermediate'
    },
    {
      id: '2',
      title: "JavaScript Essentials",
      description: 'Master the fundamentals of JavaScript programming',
      instructor: {
        name: 'Jeremy McPeak',
        avatar: 'https://ik.imagekit.io/laracasts/instructors/27.jpeg?w=260&q=50'
      },
      thumbnailUrl: 'https://ik.imagekit.io/laracasts/series/thumbnails/svg/javascript-essentials.svg',
      category: 'JavaScript',
      duration: '4h 15m',
      level: 'Beginner'
    },
    {
      id: '3',
      title: "Vue 3 Mastery",
      description: 'Comprehensive guide to Vue 3 and its ecosystem',
      instructor: {
        name: 'Luke Downing',
        avatar: 'https://ik.imagekit.io/laracasts/instructors/35.jpeg?w=260&q=50'
      },
      thumbnailUrl: 'https://ik.imagekit.io/laracasts/series/thumbnails/svg/vue-3.svg',
      category: 'Vue',
      duration: '5h 30m',
      level: 'Advanced'
    },
    // Add 6 more course objects with similar structure but different content
  ];

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedCourses = courses.slice(startIndex, endIndex);

  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />
      
      <div className="flex">
        {/* Left Sidebar - update className for checkboxes */}
        <div className="w-64 min-h-[calc(100vh-64px)] bg-[#14202e] p-6 fixed left-0 overflow-y-auto">
          {/* Search Input */}
          <div className="mb-8">
            <Input
              size="large"
              placeholder="Search..."
              prefix={<SearchOutlined className="text-gray-500" />}
              className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] focus:bg-[#243447] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Topics Filter - update Checkbox styles */}
          <div className="mb-8">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-4">Topics</h3>
            <div className="space-y-2">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between">
                  <Checkbox
                    checked={selectedTopics.includes(topic.id)}
                    onChange={() => handleTopicChange(topic.id)}
                    className="text-gray-400 hover:text-white [&>.ant-checkbox-inner]:rounded-none [&>.ant-checkbox-inner]:border-gray-500"
                  >
                    <span className="text-sm">{topic.name}</span>
                  </Checkbox>
                  <span className="text-gray-500 text-sm">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructors Filter - update Checkbox styles */}
          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-4">Instructors</h3>
            <div className="space-y-2">
              {instructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center justify-between">
                  <Checkbox
                    checked={selectedInstructors.includes(instructor.id)}
                    onChange={() => handleInstructorChange(instructor.id)}
                    className="text-gray-400 hover:text-white [&>.ant-checkbox-inner]:rounded-none [&>.ant-checkbox-inner]:border-gray-500"
                  >
                    <span className="text-sm">{instructor.name}</span>
                  </Checkbox>
                  <span className="text-gray-500 text-sm">{instructor.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - update card styles and add pagination */}
        <div className="ml-64 flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">All Series</h2>
            <p className="text-gray-400">Showing {startIndex + 1}-{Math.min(endIndex, courses.length)} of {courses.length} results</p>
          </div>

          {/* Course Grid - update card styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <div 
                key={course.id} 
                className="group cursor-pointer" 
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="bg-[#14202e] rounded-none overflow-hidden transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-blue-400">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <img 
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-gray-400 text-sm">
                        with {course.instructor.name}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {course.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <Pagination
              current={currentPage}
              total={courses.length}
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
              className="[&_.ant-pagination-item]:rounded-none [&_.ant-pagination-prev>button]:rounded-none [&_.ant-pagination-next>button]:rounded-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;