import WorkshopList from '../../components/workshop/WorkshopList';
import { Layout } from 'antd';

/**
 * Trang hiển thị danh sách workshop cho tất cả người dùng
 */
const WorkshopListPage = () => {
  const { Content } = Layout;
  
  return (
    <Layout>
      <Content className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WorkshopList />
      </Content>
    </Layout>
  );
};

export default WorkshopListPage;
