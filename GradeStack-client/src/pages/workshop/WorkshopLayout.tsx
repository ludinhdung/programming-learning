import { Outlet } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { CalendarOutlined, AppstoreOutlined, TeamOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';

const { Content, Sider } = Layout;

/**
 * Layout cho các trang liên quan đến workshop
 */
const WorkshopLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Xác định key được chọn dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    if (currentPath.includes('/calendar')) return '2';
    if (currentPath.includes('/registered')) return '3';
    return '1';
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      <Layout className="bg-[#151922]">
        <Layout className="bg-[#151922] p-0 sm:p-6">
          <Content className="min-h-[280px]">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default WorkshopLayout;
