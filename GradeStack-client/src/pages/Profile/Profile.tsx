import { FC, useState } from 'react';
import { Layout, Menu, Input, Button, message } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  CreditCardOutlined,
  StarOutlined,
  CheckCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import Header from '../../components/Header/Header';

const { Sider, Content } = Layout;

const Profile: FC = () => {
  const [selectedKey, setSelectedKey] = useState('settings');
  const [email, setEmail] = useState('dungldde160423@fpt.edu.vn');
  const [firstName, setFirstName] = useState('dung');
  const [lastName, setLastName] = useState('lud');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const menuItems = [
    {
      key: 'library',
      label: 'LIBRARY',
      type: 'group',
      children: [
        { key: 'overview', icon: <AppstoreOutlined />, label: 'Overview' },
        { key: 'started', icon: <BookOutlined />, label: 'Started' },
        { key: 'bookmarked', icon: <StarOutlined />, label: 'Bookmarked' },
        { key: 'completed', icon: <CheckCircleOutlined />, label: 'Completed' },
        { key: 'workshops', icon: <BookOutlined />, label: 'Workshops' },
      ]
    },
    {
      key: 'account',
      label: 'ACCOUNT',
      type: 'group',
      children: [
        { key: 'profile', icon: <UserOutlined />, label: 'Public Profile' },
        { key: 'apps', icon: <AppstoreOutlined />, label: 'Apps' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
        { key: 'notifications', icon: <BellOutlined />, label: 'Notifications' },
      ]
    },
    {
      key: 'billing',
      label: 'BILLING',
      type: 'group',
      children: [
        { key: 'subscription', icon: <CreditCardOutlined />, label: 'Subscription' },
        { key: 'payment-method', icon: <CreditCardOutlined />, label: 'Payment Method' },
        { key: 'payment-history', icon: <CreditCardOutlined />, label: 'Payment History' },
      ]
    }
  ];

  const handleUpdateProfile = () => {
    message.success('Profile updated successfully');
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      message.error('Passwords do not match');
      return;
    }
    message.success('Password updated successfully');
  };

  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      
      <Layout className="bg-transparent">
        <Sider
          width={250}
          className="bg-slate-800/50 p-4"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            className="bg-transparent border-none"
            onSelect={({ key }) => setSelectedKey(key)}
            style={{
              color: '#fff'
            }}
            theme="dark"
            styles={{
              item: {
                color: '#fff',
                '&:hover': {
                  color: '#3b82f6'
                }
              },
              itemSelected: {
                backgroundColor: '#1e293b !important',
                color: '#3b82f6 !important'
              },
              group: {
                color: '#94a3b8',
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }
            }}
          />
        </Sider>
        
        <Content className="p-8">
          <div className="max-w-3xl">
            {selectedKey === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Update User</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Email</label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500"
                        styles={{
                          input: {
                            backgroundColor: 'rgb(51 65 85)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgb(51 65 85)',
                            },
                            '&:focus': {
                              backgroundColor: 'rgb(51 65 85)',
                            }
                          }
                        }}
                      />
                      <div className="mt-2">
                        <span className="text-red-500">This email has not been confirmed. </span>
                        <Button type="link" className="text-blue-400 p-0">
                          Click to resend confirmation email
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 mb-2">First Name</label>
                        <Input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500"
                          styles={{
                            input: {
                              backgroundColor: 'rgb(51 65 85)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgb(51 65 85)',
                              },
                              '&:focus': {
                                backgroundColor: 'rgb(51 65 85)',
                              }
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-2">Last Name</label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500"
                          styles={{
                            input: {
                              backgroundColor: 'rgb(51 65 85)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgb(51 65 85)',
                              },
                              '&:focus': {
                                backgroundColor: 'rgb(51 65 85)',
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="primary"
                      onClick={handleUpdateProfile}
                      className="bg-blue-600 hover:bg-blue-500 border-none"
                    >
                      Update
                    </Button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">New Password</label>
                      <Input.Password
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500"
                        styles={{
                          input: {
                            backgroundColor: 'rgb(51 65 85)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgb(51 65 85)',
                            },
                            '&:focus': {
                              backgroundColor: 'rgb(51 65 85)',
                            }
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Confirm New Password</label>
                      <Input.Password
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white hover:border-blue-500 focus:border-blue-500"
                        styles={{
                          input: {
                            backgroundColor: 'rgb(51 65 85)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgb(51 65 85)',
                            },
                            '&:focus': {
                              backgroundColor: 'rgb(51 65 85)',
                            }
                          }
                        }}
                      />
                    </div>
                    <Button
                      type="primary"
                      onClick={handleUpdatePassword}
                      className="bg-blue-600 hover:bg-blue-500 border-none"
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default Profile; 