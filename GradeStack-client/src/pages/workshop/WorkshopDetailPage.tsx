import WorkshopDetail from '../../components/workshop/WorkshopDetail';
import { Layout } from 'antd';

/**
 * Trang hiển thị chi tiết workshop
 */
const WorkshopDetailPage = () => {
  const { Content } = Layout;
  
  return (
    <Layout>
      <Content className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WorkshopDetail />
      </Content>
    </Layout>
  );
};

export default WorkshopDetailPage;
