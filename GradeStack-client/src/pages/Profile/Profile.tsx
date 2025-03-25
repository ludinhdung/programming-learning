import { FC, useState } from 'react';
import { Layout, Menu, Input, Button, message } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  CreditCardOutlined,
  StarOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  BookOutlined
} from '@ant-design/icons';
import Header from '../../components/Header/Header';
import styled from 'styled-components';

const { Sider, Content } = Layout;

const StyledInput = styled(Input)`
  .ant-input {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
  .ant-input::placeholder {
    color: #717780 !important;
    font-weight: 500;
  }
`;

const Profile: FC = () => {
  const [selectedKey, setSelectedKey] = useState('profile');
  const [fullName, setFullName] = useState('John Doe');
  const [website, setWebsite] = useState('http://example.com');
  const [shortBio, setShortBio] = useState("I'm a software developer who loves to build things with Laravel.");
  const [twitterUsername, setTwitterUsername] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [placeOfEmployment, setPlaceOfEmployment] = useState('Laracasts Inc.');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [hometown, setHometown] = useState('Springfield, Illinois');

  // Mock enrolled courses data
  const enrolledCourses = [
    {
      id: '1',
      title: 'Laravel Fundamentals',
      progress: 60,
      lastAccessed: '2024-03-15'
    },
    {
      id: '2',
      title: 'Vue.js 3 Mastery',
      progress: 30,
      lastAccessed: '2024-03-14'
    },
    {
      id: '3',
      title: 'React Complete Guide',
      progress: 85,
      lastAccessed: '2024-03-13'
    }
  ];

  const menuItems = [
    {
      key: 'learning',
      label: 'MY LEARNING',
      type: 'group' as const,
      children: [
        { key: 'enrolled', icon: <BookOutlined />, label: 'Enrolled Courses' },
        { key: 'completed', icon: <CheckCircleOutlined />, label: 'Completed Courses' },
      ]
    },
    {
      key: 'account',
      label: 'ACCOUNT',
      type: 'group' as const,
      children: [
        { key: 'credentials', icon: <UserOutlined />, label: 'Account Credentials' },
        { key: 'profile', icon: <UserOutlined />, label: 'Account Profile' },
        { key: 'preferences', icon: <SettingOutlined />, label: 'Site Preferences' },
        { key: 'notifications', icon: <BellOutlined />, label: 'Notifications' },
      ]
    },
    {
      key: 'billing',
      label: 'BILLING',
      type: 'group' as const,
      children: [
        { key: 'subscription', icon: <CreditCardOutlined />, label: 'Manage Subscription' },
        { key: 'lifetime', icon: <StarOutlined />, label: 'Get Lifetime Access' },
        { key: 'invoices', icon: <CheckCircleOutlined />, label: 'Invoices' },
      ]
    },

  ];

  const handleUpdateProfile = () => {
    message.success('Profile updated successfully');
  };

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Layout className="bg-transparent">
            <Sider
              width={250}
              className="bg-[#0a1321] p-6"
              style={{ minHeight: 'calc(100vh - 64px)', overflowY: 'auto' }}
            >
              <div className="mt-10">
                <Menu
                  mode="inline"
                  selectedKeys={[selectedKey]}
                  items={menuItems}
                  className="bg-transparent border-none [&_.ant-menu-item]:text-[#94a3b8] [&_.ant-menu-item:hover]:text-[#3b82f6] [&_.ant-menu-item-selected]:bg-[#1e293b] [&_.ant-menu-item-selected]:text-[#3b82f6] [&_.ant-menu-item-group-title]:text-[#94a3b8] [&_.ant-menu-item-group-title]:text-xs [&_.ant-menu-item-group-title]:tracking-wider [&_.ant-menu-item-group]:mt-5 [&_.ant-menu-item]:rounded-none [&_.ant-menu-item-selected]:rounded-none"
                  onSelect={({ key }) => setSelectedKey(key)}
                  style={{
                    color: '#fff',
                    backgroundColor: 'transparent'
                  }}
                  theme="dark"
                />
              </div>
            </Sider>

            <Content>
              <div className="px-4">
                {selectedKey === 'enrolled' ? (
                  <>
                    <div className="flex justify-between items-center mb-8 border border-blue-500 border-opacity-15 p-4">
                      <h1 className="text-[#bad9fc] text-xl font-semibold">My Enrolled Courses</h1>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {enrolledCourses.map(course => (
                        <div key={course.id} className="bg-[#14202e] p-6 cursor-pointer hover:bg-[#1c2936] transition-colors">
                          <h3 className="text-[#bad9fc] text-lg font-semibold mb-4">{course.title}</h3>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-full bg-[#1c2936] h-1 mr-4">
                              <div
                                className="bg-[#3b82f6] h-1"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                            <span className="text-[#94a3b8] text-sm whitespace-nowrap">{course.progress}% Complete</span>
                          </div>
                          <p className="text-[#94a3b8] text-sm">
                            Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : selectedKey === 'profile' && (
                  <>
                    <div className="flex justify-between items-center mb-8 border border-blue-500 border-opacity-15 p-4">
                      <h1 className="text-[#bad9fc] text-xl font-semibold">Account Profile</h1>
                      <Button
                        type="text"
                        className="bg-[#29324a] text-[#fff] text-base font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                      >
                        View My Profile
                      </Button>
                    </div>

                    <div className="mb-8">
                      <div className="grid grid-cols-12 gap-8">
                        {/* Profile Image */}
                        <div className="col-span-3">
                          <div className="bg-[#14202e] p-4">
                            <img
                              src="/path-to-your-avatar.png"
                              alt="Profile"
                              className="w-full aspect-square object-cover mb-4"
                            />
                            <Button
                              type="text"
                              className="text-[#3b82f6] hover:text-[#60a5fa] w-full flex items-center justify-center"
                            >
                              Need to Edit Your Avatar?
                            </Button>
                          </div>
                        </div>

                        {/* Profile Form */}
                        <div className="col-span-9">
                          <div className="space-y-6 bg-[#14202e] p-6">
                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Full Name</label>
                              <StyledInput
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Website</label>
                              <StyledInput
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Short Bio</label>
                              <Input.TextArea
                                value={shortBio}
                                onChange={(e) => setShortBio(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                rows={4}
                                size="large"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Twitter Username</label>
                              <StyledInput
                                value={twitterUsername}
                                onChange={(e) => setTwitterUsername(e.target.value)}
                                placeholder="Enter Twitter Username"
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">GitHub Username</label>
                              <StyledInput
                                value={githubUsername}
                                onChange={(e) => setGithubUsername(e.target.value)}
                                placeholder="Enter GitHub Username"
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Place of Employment</label>
                              <StyledInput
                                value={placeOfEmployment}
                                onChange={(e) => setPlaceOfEmployment(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Job Title</label>
                              <StyledInput
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <div>
                              <label className="block text-[#bad9fc] mb-2 text-sm font-semibold">Hometown</label>
                              <StyledInput
                                value={hometown}
                                onChange={(e) => setHometown(e.target.value)}
                                className="bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2"
                                size="large"
                                variant="borderless"
                              />
                            </div>

                            <Button
                              type="text"
                              onClick={handleUpdateProfile}
                              className="bg-[#29324a] text-[#fff] text-base font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
                            >
                              Update Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Content>
          </Layout>
        </div>
      </div>
    </div>
  );
};

export default Profile; 