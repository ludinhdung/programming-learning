import { FC } from 'react';
import { Progress, Button } from 'antd';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { RocketOutlined } from '@ant-design/icons';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: string;
  progress: number;
  totalTime: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

const LearningPaths: FC = () => {
  const paths: LearningPath[] = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Your Path to Becoming a Career-Ready Web Developer!',
      level: 'Beginner',
      progress: 0,
      totalTime: '39 hours, 30 minutes',
      status: 'not-started'
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Your Path to Becoming a Senior Web Developer!',
      level: 'Professional',
      progress: 0,
      totalTime: '61 hours, 13 minutes',
      status: 'not-started'
    },
    {
      id: 'expert',
      title: 'Expert',
      description: 'Your Path to Becoming a Lead / Staff Developer!',
      level: 'Expert',
      progress: 0,
      totalTime: '59 hours, 58 minutes',
      status: 'not-started'
    },
    {
      id: 'computer-science',
      title: 'Computer Science',
      description: 'Learn Data Structures & Algorithms with JavaScript',
      level: 'Advanced',
      progress: 0,
      totalTime: '27 hours, 34 minutes',
      status: 'not-started'
    },
    {
      id: 'fullstack',
      title: 'Fullstack to Backend',
      description: 'Expand Your Abilities to the Server and Master the Fullstack',
      level: 'Intermediate',
      progress: 2,
      totalTime: '58 hours, 14 minutes',
      status: 'in-progress'
    },
    {
      id: 'design',
      title: 'Design to Code',
      description: 'Make Your Designs Come to Life Through Code!',
      level: 'Intermediate',
      progress: 0,
      totalTime: '40 hours, 16 minutes',
      status: 'not-started'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Learning Paths Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-2">
            <RocketOutlined className="text-4xl text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Learning Paths</h1>
          <p className="text-gray-400 text-lg">
            Guided paths to expand your abilities as a well-rounded engineer!
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div 
              key={path.id}
              className="bg-slate-800/50 rounded-lg p-8 flex flex-col items-center text-center hover:bg-slate-800 transition-all duration-300"
            >
              {/* Progress Circle */}
              <div className="mb-6">
                <Progress
                  type="circle"
                  percent={path.progress}
                  size={120}
                  strokeColor="#e11d48"
                  trailColor="#1e293b"
                  strokeWidth={4}
                  format={(percent) => `${percent}%`}
                />
              </div>

              {/* Path Info */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {path.title}
              </h3>
              <p className="text-gray-400 mb-6 h-12">
                {path.description}
              </p>

              {/* Total Time */}
              <div className="text-gray-500 text-sm mb-6">
                Total time: {path.totalTime}
              </div>

              {/* Action Button */}
              <Link to={`/learning-paths/${path.id}`}>
                <Button
                  type="primary"
                  size="large"
                  className={`min-w-[120px] ${
                    path.status === 'in-progress'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-red-600 hover:bg-red-500'
                  } border-none`}
                >
                  {path.status === 'in-progress' ? 'Continue' : 'Start'}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths; 