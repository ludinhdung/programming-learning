import { Outlet } from 'react-router-dom';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { CalendarOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const { Content, Sider } = Layout;

/**
 * Layout cho module Workshop
 */
const WorkshopLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isInstructor = user?.role === 'INSTRUCTOR';

  // Xác định item menu nào đang được chọn
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/workshops') return ['list'];
    if (path === '/instructor/workshops') return ['instructor-list'];
    if (path === '/instructor/workshops/create') return ['create'];
    return ['list'];
  };

  return (
    <Layout className="min-h-screen">
      <Breadcrumb className="p-4">
        <Breadcrumb.Item>
          <Link to="/">Trang chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Workshop</Breadcrumb.Item>
      </Breadcrumb>

      <Layout className="bg-white">
        <Sider width={250} className="bg-white">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKey()}
            style={{ height: '100%', borderRight: 0 }}
          >
            <Menu.Item key="list" icon={<CalendarOutlined />}>
              <Link to="/workshops">Danh sách Workshop</Link>
            </Menu.Item>
            
            {isInstructor && (
              <>
                <Menu.Item key="instructor-list" icon={<UnorderedListOutlined />}>
                  <Link to="/instructor/workshops">Quản lý Workshop</Link>
                </Menu.Item>
                <Menu.Item key="create" icon={<PlusOutlined />}>
                  <Link to="/instructor/workshops/create">Tạo Workshop mới</Link>
                </Menu.Item>
              </>
            )}
          </Menu>
        </Sider>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default WorkshopLayout;
