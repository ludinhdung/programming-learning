import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Spin, Empty, Divider } from 'antd';
import Header from '../../components/Header/Header';
import learningPathService from '../../services/learningPathService';

interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime: number | null;
  courses: Array<{
    id: string;
    title: string;
    order: number;
  }>;
}

const LearningPaths: FC = () => {
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const data = await learningPathService.getAllLearningPaths();
        setPaths(data);
      } catch (error) {
        console.error('Error fetching learning paths:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningPaths();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1118] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1118]">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Empty 
            description={<span className="text-gray-400">No learning paths found</span>} 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Learning Path Header */}
        <div>
          <h1 className='text-4xl font-bold text-white mb-4'>Learning Paths</h1>
          <p className="text-gray-400 mb-4 text-white">Well-structured and strategically planned roadmaps, designed to guide you in your learning journey. Making consistent progress on your learning path every day will significantly enhance your chances of becoming a great developer</p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white uppercase">All Learning Paths</h2>
          <Divider className='bg-white'/>
          <div className='mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {paths.map((path) => (
              <div key={path.id} className='border border-gray-700 rounded-md overflow-hidden flex flex-col h-full'>
                <div className='flex-grow'>
                  {/* Thumbnail */}
                  {path.thumbnail && (
                    <div className='w-full h-40 overflow-hidden'>
                      <img 
                        src={path.thumbnail} 
                        alt={path.title} 
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className='p-5'>
                    <h3 className="text-xl font-bold text-white mb-3">{path.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{path.description || 'No description available'}</p>
                    
                    {/* Additional information */}
                    <div className='flex justify-between text-gray-400 text-sm mb-2'>
                      <span>{path.courses.length} courses</span>
                      {path.estimatedCompletionTime && (
                        <span>{path.estimatedCompletionTime} hours</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className='py-4 px-6 bg-gray-700 mt-auto'>
                  <Link to={`/learning-paths/${path.id}`} className="text-white">
                    <span className="text-blue-500">View details →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='mb-4'>
          <h2 className="text-3xl font-bold text-white ">Frequently asked questions</h2>
          <Divider className='bg-white' />
          <div className='py-3 flex justify-between items-center'>
            <h3 className="text-2xl font-bold text-white mb-2 w-1/3">What is a learning path?</h3>
            <p className="text-gray-400 mb-4 text-white w-2/3">A learning path is a structured roadmap that guides you through a specific skill set or technology. It typically includes a series of courses, projects, and exercises designed to help you build the necessary skills and knowledge.</p>
          </div>
          <Divider className='bg-white' />
          <div className='py-3 flex justify-between items-center'>
            <h3 className="text-2xl font-bold text-white mb-2 w-1/3">Why should I use a learning path?</h3>
            <p className="text-gray-400 mb-4 text-white w-2/3">When you start programming, it could be a little daunting. There are so many courses you can do, so many projects you can build. How do you find relevant courses? Projects? Problems? When do you stop and move to next course? What is the next course anyway? A learning path includes answers to all of them</p>
          </div>
          <Divider className='bg-white' />
          <div className='py-3 flex justify-between items-center'>
            <h3 className="text-2xl font-bold text-white mb-2 w-1/3">What is included in a learning path?</h3>
            <p className="text-gray-400 mb-4 text-white w-2/3">Every learning path includes coding courses, practice problems and projects</p>
          </div>
          <Divider className='bg-white' />
          <div className='py-3 flex justify-between items-center'>
            <h3 className="text-2xl font-bold text-white mb-2 w-1/3">Are learning paths free?</h3>
            <p className="text-gray-400 mb-4 text-white w-2/3">Yes. All learning paths on codedamn are free to browse and build. You can use these roadmaps to learn from anywhere (including codedamn).</p>
          </div>
          <Divider className='bg-white' />
          <div className='py-3 flex justify-between items-center'>
            <h3 className="text-2xl font-bold text-white mb-2 w-1/3">Where are the coding courses?</h3>
            <p className="text-gray-400 mb-4 text-white w-2/3">Learning paths include links to relevant coding courses. You can find courses when you browse learning paths and click on modules. Alternatively, you can browse all interactive codedamn courses here</p>
          </div>
          <Divider className='bg-white' />
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;