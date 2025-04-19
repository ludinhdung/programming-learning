import WorkshopPreview from '../../components/workshop/WorkshopPreview';
import { Layout } from 'antd';
import Header from '../../components/Header/Header';

/**
 * Trang hiển thị preview của workshop
 */
const WorkshopPreviewPage = () => {
  const { Content } = Layout;
  
  return (
    <div className="min-h-screen bg-[#151922]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-7">
          <div className="flex text-3xl justify-start uppercase font-extrabold">
            <span className="text-blue-600 mr-2">//</span>
            <span className="text-white">Workshop Preview</span>
          </div>
        </div>
        <Content className="bg-transparent">
          <WorkshopPreview />
        </Content>
      </div>
    </div>
  );
};

export default WorkshopPreviewPage;
