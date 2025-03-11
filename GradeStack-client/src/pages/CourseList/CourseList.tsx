import { useState } from 'react';
import { Input, Card, Tag, Button, Radio, Select } from 'antd';
import { SearchOutlined, BookOutlined, SortAscendingOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Functional JavaScript First Steps',
      description: 'A friendly, practical introduction to functional programming fundamentals in JavaScript.',
      instructor: 'Anjana Vakil',
      duration: '3h 27m',
      level: 'Beginner',
      category: 'JavaScript'
    },
    {
      id: '2',
      title: 'My Dev Setup Is Better Than Yours',
      description: 'Maximize your productivity with the best developer setup. Hand-craft an environment with bash scripts.',
      instructor: 'ThePrimeagen',
      duration: '3h 28m',
      level: 'Intermediate',
      category: 'Development Tools'
    },
    {
      id: '3',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including render props, HOCs, compound components, and more.',
      instructor: 'Kent C. Dodds',
      duration: '4h 15m',
      level: 'Advanced',
      category: 'React'
    },
    {
      id: '4',
      title: 'Building Modern APIs with Node.js',
      description: 'Learn to build scalable and secure REST APIs using Node.js, Express, and modern best practices.',
      instructor: 'Max Schwarzmüller',
      duration: '5h 45m',
      level: 'Intermediate',
      category: 'Node.js'
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'green';
      case 'Intermediate':
        return 'blue';
      case 'Advanced':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      {/* Header Section */}
      <div className="px-10 pt-8">
        <div className="flex text-2xl justify-start uppercase font-extrabold">
          <span className="text-blue-600 mr-2">//</span>
          <span className="text-white">Frontend & Fullstack Engineering Courses</span>
        </div>
        <div className="flex text-[80px] text-slate-800 justify-end uppercase font-extrabold -mt-16">
          <p>endless training</p>
        </div>

        <div className="relative z-10 -mt-8 mb-6">
          <p className="text-gray-400 mb-6">
            Not sure where to start?{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">
              Check out our Learning Paths!
            </a>
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start md:items-center">
            <Input
              size="large"
              placeholder="Search for a course, language, framework, or teacher..."
              prefix={<SearchOutlined className="text-gray-500" />}
              className="max-w-xl rounded-lg bg-slate-800 border-slate-700 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <div className="flex space-x-4 items-center">
              <Radio.Group 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-800 p-1 rounded-lg"
              >
                <Radio.Button value="all" className="text-gray-300 border-none bg-transparent hover:text-blue-400">
                  All
                </Radio.Button>
                <Radio.Button value="bookmarked" className="text-gray-300 border-none bg-transparent hover:text-blue-400">
                  Bookmarked
                </Radio.Button>
                <Radio.Button value="watched" className="text-gray-300 border-none bg-transparent hover:text-blue-400">
                  Watched
                </Radio.Button>
              </Radio.Group>

              <Select
                defaultValue="newest"
                onChange={(value) => setSortBy(value)}
                className="w-40 bg-slate-800 text-white"
                dropdownStyle={{ backgroundColor: '#1e293b' }}
                suffixIcon={<SortAscendingOutlined className="text-gray-400" />}
              >
                <Select.Option value="newest">Newest First</Select.Option>
                <Select.Option value="oldest">Oldest First</Select.Option>
                <Select.Option value="title">Title A-Z</Select.Option>
                <Select.Option value="duration">Duration</Select.Option>
              </Select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
          {courses.map((course) => (
            <Card
              key={course.id}
              hoverable
              className="bg-slate-800 border-none rounded-lg overflow-hidden hover:bg-slate-700 transition-all duration-300"
              cover={
                <div className="h-36 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                  <BookOutlined className="text-5xl text-white opacity-50" />
                </div>
              }
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-1 line-clamp-1">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      with {course.instructor}
                    </p>
                  </div>
                  <Tag color={getLevelColor(course.level)} className="ml-2 text-xs">
                    {course.level}
                  </Tag>
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Tag className="bg-blue-500/20 text-blue-400 border-none text-xs">
                      {course.category}
                    </Tag>
                    <span className="text-gray-400 text-xs">{course.duration}</span>
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    className="bg-blue-600 hover:bg-blue-500 border-none text-white"
                  >
                    Start
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseList; 