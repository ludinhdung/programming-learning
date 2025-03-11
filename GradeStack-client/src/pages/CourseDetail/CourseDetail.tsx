import { FC } from 'react';
import { Button, Tag, Avatar, Progress, Collapse } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, BookOutlined, StarOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';

interface CourseDetailProps {
  course?: Course;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
  };
  duration: string;
  totalLessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  students: number;
  progress?: number;
  sections: Section[]; // added sections field to course
  price: number;
}

interface Section {
  title: string;
  content: Content[]; // content for each section
}

interface Content {
  type: 'video' | 'code';
  title: string;
  duration?: string;
  description?: string;
}

const CourseDetail: FC<CourseDetailProps> = () => {
  // Mock data - will be replaced with actual API call later
  const course: Course = {
    id: '1',
    title: 'Functional JavaScript First Steps, v2',
    description: 'A friendly, practical introduction to functional programming fundamentals in JavaScript.',
    instructor: {
      name: 'Anjana Vakil',
      title: 'Software Engineer & Educator',
      avatar: '/avatars/instructor1.jpg'
    },
    duration: '3h 27m',
    totalLessons: 12,
    level: 'Beginner',
    category: 'JavaScript',
    rating: 4.8,
    students: 1234,
    progress: 0,
    price: 100000,
    sections: [
      {
        title: 'Introduction to Functional Programming',
        content: [
          { type: 'video', title: 'What is Functional Programming?', duration: '10:00' },
          { type: 'code', title: 'Functional Programming Basics', description: 'Introduction to functional programming concepts in JavaScript.' },
          { type: 'video', title: 'Higher-Order Functions', duration: '15:00' },
        ]
      },
      {
        title: 'Advanced Functional Concepts',
        content: [
          { type: 'code', title: 'Monads in JavaScript', description: 'Learn about monads and their usage in functional programming.' },
          { type: 'video', title: 'Immutability in JavaScript', duration: '12:00' },
        ]
      }
    ]
  };

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

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Tag color="blue" className="bg-blue-500/20 text-blue-400 border-none">
                  {course.category}
                </Tag>
                <Tag color={getLevelColor(course.level)} className="border-none">
                  {course.level}
                </Tag>
              </div>

              <h1 className="text-4xl font-bold text-white">{course.title}</h1>

              <p className="text-gray-400 text-lg">
                {course.description}
              </p>

              <div className="flex items-center space-x-4">
                <Avatar src={course.instructor.avatar} size={48} />
                <div>
                  <div className="text-white font-medium">{course.instructor.name}</div>
                  <div className="text-gray-400">{course.instructor.title}</div>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <ClockCircleOutlined className="text-blue-400 text-xl mb-2" />
                <div className="text-white font-medium">{course.duration}</div>
                <div className="text-gray-400 text-sm">Duration</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <BookOutlined className="text-blue-400 text-xl mb-2" />
                <div className="text-white font-medium">{course.totalLessons}</div>
                <div className="text-gray-400 text-sm">Lessons</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <StarOutlined className="text-blue-400 text-xl mb-2" />
                <div className="text-white font-medium">{course.rating}</div>
                <div className="text-gray-400 text-sm">Rating</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <PlayCircleOutlined className="text-blue-400 text-xl mb-2" />
                <div className="text-white font-medium">{course.students}</div>
                <div className="text-gray-400 text-sm">Students</div>
              </div>
            </div>
          </div>

          {/* Right Content - Course Preview */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                <PlayCircleOutlined className="text-6xl text-white opacity-80 hover:opacity-100 cursor-pointer transition-opacity" />
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress 
                    percent={course.progress} 
                    showInfo={false}
                    strokeColor="#3b82f6"
                    trailColor="#1e293b"
                  />
                </div>
                <Button 
                  type="primary" 
                  size="large"
                  block
                  className="bg-blue-600 hover:bg-blue-500 border-none h-12 text-lg"
                  onClick={() => navigate(`/checkout/${course.id}`)}
                >
                  Buy Course - {course.price.toLocaleString()}đ
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content Preview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Course Content</h2>
          <div className="bg-slate-800 rounded-lg p-4 space-y-4">
            {course.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-b border-slate-700 last:border-none pb-4 last:pb-0">
                <h3 className="text-white font-medium mb-4">{section.title}</h3>
                {section.content.map((content, contentIndex) => (
                  <div key={contentIndex} className="flex items-center space-x-2 mb-4">
                    {content.type === 'video' ? (
                      <VideoCameraOutlined className="text-blue-400 text-xl" />
                    ) : (
                      <FileTextOutlined className="text-blue-400 text-xl" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{content.title}</span>
                      {content.duration && <span className="text-gray-400 text-sm">{content.duration}</span>}
                      {content.description && <span className="text-gray-400 text-sm">{content.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
