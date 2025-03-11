import { FC } from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';

interface Topic {
  id: string;
  title: string;
  count: number;
  icon: string;
  color: string;
}

const Topics: FC = () => {
  const topics: Topic[] = [
    {
      id: 'javascript',
      title: 'JavaScript',
      count: 51,
      icon: '/icons/javascript.svg',
      color: '#F7DF1E'
    },
    {
      id: 'react',
      title: 'React',
      count: 49,
      icon: '/icons/react.svg',
      color: '#61DAFB'
    },
    {
      id: 'frameworks',
      title: 'Frameworks',
      count: 40,
      icon: '/icons/frameworks.svg',
      color: '#FF69B4'
    },
    {
      id: 'fullstack',
      title: 'Full Stack',
      count: 38,
      icon: '/icons/fullstack.svg',
      color: '#00CED1'
    },
    {
      id: 'css',
      title: 'CSS',
      count: 24,
      icon: '/icons/css.svg',
      color: '#563D7C'
    },
    {
      id: 'typescript',
      title: 'TypeScript',
      count: 20,
      icon: '/icons/typescript.svg',
      color: '#3178C6'
    },
    {
      id: 'programming',
      title: 'Programming Language',
      count: 19,
      icon: '/icons/programming.svg',
      color: '#FFA500'
    },
    {
      id: 'server-side-js',
      title: 'Server-Side JavaScript',
      count: 19,
      icon: '/icons/server.svg',
      color: '#4169E1'
    },
    {
      id: 'nodejs',
      title: 'Node.js',
      count: 15,
      icon: '/icons/nodejs.svg',
      color: '#339933'
    },
    {
      id: 'state-management',
      title: 'State Management',
      count: 15,
      icon: '/icons/state.svg',
      color: '#FF4500'
    },
    {
      id: 'angular',
      title: 'Angular',
      count: 14,
      icon: '/icons/angular.svg',
      color: '#DD0031'
    },
    {
      id: 'design',
      title: 'Design',
      count: 13,
      icon: '/icons/design.svg',
      color: '#FF69B4'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Topics Header */}
        <div className="mb-12">
          <div className="flex text-4xl justify-start uppercase font-extrabold">
            <span className="text-blue-600 mr-2">//</span>
            <span className="text-white">Topics</span>
          </div>
          <div className="flex text-[100px] text-slate-800 justify-end uppercase font-extrabold -mt-20 overflow-hidden">
            <p className="opacity-20">endless learning</p>
          </div>
          
          <p className="text-gray-400 text-lg mt-4 relative z-10">
            Explore our comprehensive collection of courses across various programming topics
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link 
              key={topic.id} 
              to={`/topics/${topic.id}`}
              className="block transform hover:scale-[1.02] transition-all duration-300"
            >
              <Card
                className="bg-slate-800 border-none h-full hover:bg-slate-700/80"
                bodyStyle={{ padding: '1.5rem' }}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${topic.color}20` }}
                  >
                    <img 
                      src={topic.icon} 
                      alt={topic.title} 
                      className="w-10 h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        {topic.title}
                      </h3>
                      <span 
                        className="text-sm px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: `${topic.color}20`,
                          color: topic.color 
                        }}
                      >
                        {topic.count}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-gray-400 text-sm">
                      <span>{topic.count} courses</span>
                      <span className="mx-2">•</span>
                      <span>Updated regularly</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics; 