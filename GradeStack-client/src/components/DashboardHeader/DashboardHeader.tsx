import { Layout, Avatar, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header } = Layout;

const DashboardHeader = () => {
  // This would come from your auth context/state in a real app
  const user = {
    name: "John Doe",
    avatar: null // URL to avatar image if exists
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'logout') {
      // Handle logout
      console.log('Logout clicked');
    }
  };

  return (
    <Header 
      style={{ 
        background: '#ffffff', 
        padding: '0 24px',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* Logo and Brand Name */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div 
          style={{ 
            color: '#1890ff',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>GradeStack</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Dropdown 
          menu={{ items: dropdownItems, onClick: handleMenuClick }} 
          trigger={['click']}
        >
          <Space style={{ cursor: 'pointer', color: '#262626' }}>
            <span 
              style={{ 
                marginRight: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {user.name}
            </span>
            <Avatar 
              size={36} 
              src={user.avatar}
              icon={!user.avatar && <UserOutlined />}
              style={{ 
                backgroundColor: !user.avatar ? '#1890ff' : undefined,
                cursor: 'pointer',
              }}
            />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default DashboardHeader;