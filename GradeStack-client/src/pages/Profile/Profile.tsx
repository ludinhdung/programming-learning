import { FC, useState, useEffect } from 'react';
import { Layout, Menu, Button, message, Spin, Alert, Form, Input, Tabs, Card, Tag, Avatar } from 'antd';
import { UserOutlined, CreditCardOutlined, StarOutlined, BookOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import userService from '../../services/user.service';
import type {
  UserProfile,
  EnrollmentRecord,
  BookmarkRecord,
  PurchaseRecord
} from '../../services/user.service';
import { formatVND } from '../../utils/formatCurrency';
const { Sider, Content } = Layout;

const Profile: FC = () => {
  const [selectedKey, setSelectedKey] = useState('profile');
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [editableProfile, setEditableProfile] = useState<Partial<UserProfile>>({});
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentRecord[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [errorEnrolled, setErrorEnrolled] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [errorBookmarks, setErrorBookmarks] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [errorPurchases, setErrorPurchases] = useState<string | null>(null);
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        setErrorProfile("User data not found in local storage.");
        setLoadingProfile(false);
        return;
      }

      try {
        const userData = JSON.parse(userDataStr);
        if (!userData?.id) {
          setErrorProfile("Invalid user data format in local storage.");
          setLoadingProfile(false);
          return;
        }

        setLoadingProfile(true);
        const data = await userService.getMyProfile(userData.id);
        setProfileData(data);
        setEditableProfile({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } catch (err) {
        message.error('Failed to load profile data.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch enrolled courses when selected
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (selectedKey === 'enrolled' && profileData?.id) {
        setLoadingEnrolled(true);
        try {
          const data = await userService.getMyEnrolledCourses(profileData.id);
          setEnrolledCourses(data);
        } catch (err) {
          message.error('Failed to load enrolled courses.');
        } finally {
          setLoadingEnrolled(false);
        }
      }
    };
    fetchEnrolledCourses();
  }, [selectedKey, profileData]);

  // Fetch bookmarks when selected
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (selectedKey === 'bookmarks' && profileData?.id) {
        setLoadingBookmarks(true);
        try {
          const data = await userService.getMyBookmarks(profileData.id);
          setBookmarks(data);
        } catch (err) {
          message.error('Failed to load bookmarks.');
        } finally {
          setLoadingBookmarks(false);
        }
      }
    };
    fetchBookmarks();
  }, [selectedKey, profileData]);

  // Fetch purchases when selected
  useEffect(() => {
    const fetchPurchases = async () => {
      if (selectedKey === 'purchases' && profileData?.id) {
        setLoadingPurchases(true);
        try {
          const data = await userService.getMyPurchaseHistory(profileData.id);
          setPurchases(data);
        } catch (err) {
          message.error('Failed to load purchase history.');
        } finally {
          setLoadingPurchases(false);
        }
      }
    };
    fetchPurchases();
  }, [selectedKey, profileData]);

  const handleChangePassword = async () => {
    setLoadingChangePassword(true);
    setChangePasswordError(null);
    try {
      const response = await userService.changePassword({ oldPassword, newPassword });
      message.success(response.message);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      message.error('Failed to change password.');
    } finally {
      setLoadingChangePassword(false);
    }
  };

  // Section title component
  const SectionTitle = ({ title }: { title: string }) => (
    <div className="flex items-center mb-6">
      <div className="text-[#3b82f6] mr-2 text-xl">//</div>
      <h2 className="text-lg uppercase tracking-wider text-white font-mono">{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Layout className="bg-transparent">
            <Sider width={250} className="bg-[#0a1321] p-6 border-r border-[#1e2736]">
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                items={[
                  {
                    key: 'learning',
                    label: 'MY LEARNING',
                    type: 'group',
                    children: [
                      { key: 'enrolled', icon: <BookOutlined />, label: 'Enrolled Courses' },
                      { key: 'bookmarks', icon: <StarOutlined />, label: 'My Bookmarks' },
                    ]
                  },
                  {
                    key: 'account',
                    label: 'ACCOUNT',
                    type: 'group',
                    children: [
                      { key: 'profile', icon: <UserOutlined />, label: 'Account Profile' },
                    ]
                  },
                  {
                    key: 'billing',
                    label: 'BILLING',
                    type: 'group',
                    children: [
                      { key: 'purchases', icon: <CreditCardOutlined />, label: 'Purchase History' },
                    ]
                  },
                ]}
                onSelect={({ key }) => setSelectedKey(key)}
                theme="dark"
                className="border-0"
              />
            </Sider>

            <Content>
              <div className="px-6 py-4">
                {selectedKey === 'profile' && (
                  <>
                    <SectionTitle title="ACCOUNT PROFILE" />
                    <Tabs
                      defaultActiveKey="profile"
                      items={[
                        {
                          key: 'profile',
                          label: <span className="text-[#bad9fc]">Profile Information</span>,
                          children: (
                            <Card className="bg-[#13151f] border-0 shadow-md mb-6 rounded-lg overflow-hidden">
                              <Form layout="vertical">
                                <Form.Item 
                                  label={<span className="text-[#bad9fc]">First Name</span>}
                                  className="mb-6"
                                >
                                  <Input
                                    value={editableProfile.firstName}
                                    onChange={(e) => setEditableProfile({ ...editableProfile, firstName: e.target.value })}
                                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-1 mb-4 w-full"
                                  />
                                </Form.Item>
                                <Form.Item 
                                  label={<span className="text-[#bad9fc]">Last Name</span>}
                                  className="mb-6"
                                >
                                  <Input
                                    value={editableProfile.lastName}
                                    onChange={(e) => setEditableProfile({ ...editableProfile, lastName: e.target.value })}
                                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-1 mb-4 w-full"
                                  />
                                </Form.Item>
                                <div className="flex justify-end">
                                  <Button 
                                    type="primary"
                                    className="mr-2 bg-[#3b82f6] hover:bg-[#2563eb] border-0"
                                  >
                                    Update Profile
                                  </Button>
                                  <Button 
                                    onClick={() => setEditableProfile({})}
                                    className="border-[#3b4452] text-[#bad9fc] hover:text-white hover:border-[#5e7597] bg-transparent"
                                  >
                                    Reset
                                  </Button>
                                </div>
                              </Form>
                            </Card>
                          ),
                        },
                        {
                          key: 'password',
                          label: <span className="text-[#bad9fc]">Change Password</span>,
                          children: (
                            <Card className="bg-[#13151f] border-0 shadow-md rounded-lg overflow-hidden">
                              <Form layout="vertical" onFinish={handleChangePassword}>
                                <Form.Item 
                                  label={<span className="text-[#bad9fc]">Current Password</span>}
                                  required
                                  name="oldPassword"
                                  rules={[{ required: true, message: 'Please input your current password!' }]}
                                  className="mb-6"
                                >
                                  <Input.Password
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-1 mb-4 w-full"
                                  />
                                </Form.Item>
                                <Form.Item 
                                  label={<span className="text-[#bad9fc]">New Password</span>}
                                  required
                                  name="newPassword"
                                  rules={[{ required: true, message: 'Please input your new password!' }]}
                                  className="mb-6"
                                >
                                  <Input.Password
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-1 mb-4 w-full"
                                  />
                                </Form.Item>
                                <Form.Item>
                                  <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loadingChangePassword}
                                    className="bg-[#3b82f6] hover:bg-[#2563eb] border-0"
                                  >
                                    Change Password
                                  </Button>
                                </Form.Item>
                                {changePasswordError && (
                                  <Alert message={changePasswordError} type="error" showIcon className="mt-4" />
                                )}
                              </Form>
                            </Card>
                          ),
                        },
                      ]}
                      className="profile-tabs"
                    />
                  </>
                )}

                {selectedKey === 'enrolled' && (
                  <>
                    <SectionTitle title="ENROLLED COURSES" />
                    {loadingEnrolled && <div className="text-center py-8"><Spin size="large" /></div>}
                    {errorEnrolled && <Alert message="Error" description={errorEnrolled} type="error" showIcon className="mb-4" />}
                    {!loadingEnrolled && !errorEnrolled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrolledCourses.length === 0 ? (
                          <p className="text-[#94a3b8] text-center py-4 col-span-full">You haven't enrolled in any courses yet.</p>
                        ) : (
                          enrolledCourses.map((enrollment) => (
                            <div key={enrollment.enrolledAt} className="bg-[#13151f] rounded-lg hover:bg-[#1a1f2e] transition-colors overflow-hidden shadow-md">
                              <div className="flex gap-4 p-4">
                                <div className="w-20 h-20 bg-[#1e2736] rounded-lg flex items-center justify-center shrink-0">
                                  <BookOutlined className="text-2xl text-[#3b82f6]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white text-lg font-semibold mb-1">{enrollment.course.title}</h3>
                                  <div className="flex items-center text-[#94a3b8] mb-3">
                                    <Avatar size="small" className="mr-2 bg-[#3b82f6]">
                                      {enrollment.course.instructor.user.firstName.charAt(0)}
                                    </Avatar>
                                    <span>
                                      {enrollment.course.instructor.user.firstName} {enrollment.course.instructor.user.lastName}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mt-2">
                                    <div className="text-[#94a3b8] text-sm w-full">
                                      <div className="flex items-center gap-2 w-full">
                                        <span>Progress:</span>
                                        <div className="w-full bg-[#1e2736] h-2 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-[#3b82f6] h-full rounded-full" 
                                            style={{ width: `${Number(enrollment.progress)}%` }}
                                          />
                                        </div>
                                        <span className="text-[#bad9fc]">{Number(enrollment.progress)}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-[#1e2736] py-2 px-4 flex justify-end">
                                <Button 
                                  type="text" 
                                  className="text-[#3b82f6] hover:text-[#60a5fa] hover:bg-[#1a1f2e]"
                                  href={`/courses/${enrollment.course.id}`}
                                >
                                  Continue Learning
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedKey === 'bookmarks' && (
                  <>
                    <SectionTitle title="MY BOOKMARKS" />
                    {loadingBookmarks && <div className="text-center py-8"><Spin size="large" /></div>}
                    {errorBookmarks && <Alert message="Error" description={errorBookmarks} type="error" showIcon className="mb-4" />}
                    {!loadingBookmarks && !errorBookmarks && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookmarks.length === 0 ? (
                          <p className="text-[#94a3b8] text-center py-4 col-span-full">You haven't bookmarked any courses yet.</p>
                        ) : (
                          bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="bg-[#13151f] rounded-lg hover:bg-[#1a1f2e] transition-colors overflow-hidden shadow-md">
                              <div className="flex gap-4 p-4">
                                <div className="w-20 h-20 bg-[#1e2736] rounded-lg flex items-center justify-center shrink-0">
                                  <StarOutlined className="text-2xl text-[#f59e0b]" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white text-lg font-semibold mb-1">{bookmark.course.title}</h3>
                                  <div className="flex items-center text-[#94a3b8] mb-2">
                                    <Avatar size="small" className="mr-2 bg-[#f59e0b]">
                                      {bookmark.course.instructor.user.firstName.charAt(0)}
                                    </Avatar>
                                    <span>
                                      {bookmark.course.instructor.user.firstName} {bookmark.course.instructor.user.lastName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-[#1e2736] py-2 px-4 flex justify-end">
                                <Button 
                                  type="text" 
                                  className="text-[#f59e0b] hover:text-[#fbbf4c] hover:bg-[#1a1f2e]"
                                  href={`/course/${bookmark.course.id}`}
                                >
                                  View Course
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedKey === 'purchases' && (
                  <>
                    <SectionTitle title="PURCHASE HISTORY" />
                    {loadingPurchases && <div className="text-center py-8"><Spin size="large" /></div>}
                    {errorPurchases && <Alert message="Error" description={errorPurchases} type="error" showIcon className="mb-4" />}
                    {!loadingPurchases && !errorPurchases && (
                      <div className="grid grid-cols-1 gap-6">
                        {purchases.length === 0 ? (
                          <p className="text-[#94a3b8] text-center py-4">You haven't made any purchases yet.</p>
                        ) : (
                          purchases.map((purchase) => (
                            <div 
                              key={purchase.id}
                              className="bg-[#13151f] rounded-lg overflow-hidden shadow-md border border-[#1e2736]"
                            >
                              <div className="p-5">
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                  <div className="flex gap-4 mb-4 md:mb-0">
                                    <div className="w-16 h-16 bg-[#1e2736] rounded-lg flex items-center justify-center shrink-0">
                                      <CreditCardOutlined className="text-2xl text-[#3b82f6]" />
                                    </div>
                                    <div>
                                      <h3 className="text-white text-lg font-semibold mb-2">{purchase.course.title}</h3>
                                      <div className="flex flex-wrap gap-2">
                                        <Tag className="rounded-full px-3 py-1 border-0 bg-[#1e293f] text-[#3b82f6] font-medium">
                                          {formatVND(purchase.price)}
                                        </Tag>
                                        {purchase.status && (
                                          <Tag 
                                            className={`rounded-full px-3 py-1 border-0 font-medium
                                              ${purchase.status === 'completed' 
                                                ? 'bg-[#0f2d1e] text-[#10b981]' 
                                                : purchase.status === 'pending'
                                                  ? 'bg-[#3f2f10] text-[#f59e0b]'
                                                  : 'bg-[#2c1216] text-[#ef4444]'
                                              }`}
                                          >
                                            <div className="flex items-center gap-1">
                                              {purchase.status === 'completed' && <CheckCircleOutlined />}
                                              {purchase.status === 'pending' && <SyncOutlined spin />}
                                              {purchase.status}
                                            </div>
                                          </Tag>
                                        )}
                                        <Tag className="rounded-full px-3 py-1 border-0 bg-[#1e2736] text-[#94a3b8]">
                                          {new Date(purchase.purchasedAt || Date.now()).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </Tag>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-[#1e2736] py-3 px-5 flex flex-wrap gap-3 justify-end">
                                <Button 
                                  type="primary" 
                                  size="middle"
                                  href={`/courses/${purchase.course.id}`}
                                  className="bg-[#3b82f6] hover:bg-[#2563eb] border-0 shadow-sm"
                                  icon={<BookOutlined />}
                                >
                                  Go to Course
                                </Button>
                                <Button 
                                  size="middle"
                                  href={`/receipts/${purchase.course.id}`}
                                  className="border-[#3b4452] text-[#bad9fc] hover:text-white hover:border-[#5e7597] bg-transparent"
                                  icon={<CreditCardOutlined />}
                                >
                                  View Receipt
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
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
