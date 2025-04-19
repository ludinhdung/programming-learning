import { Layout, Table, Tag, Menu, Button, Switch, Modal, Form, Input, Tooltip, Popconfirm, Space, Card, Statistic, Spin, Alert } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  BookOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  TransactionOutlined,
  LineChartOutlined,
  StarOutlined,
  StarFilled,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import { useState, useEffect } from 'react';
import React from 'react';
import { getDashboardOverview, DashboardOverview } from '../../services/admin-api';

const { Content, Sider } = Layout;

interface Supporter {
  key: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
}

interface CreateSupporterForm {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface Instructor {
  key: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  specialization: string;
  courses: number;
  students: number;
  rating: number;
}

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateSupporterForm>();
  
  // State cho dữ liệu dashboard
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  
  // Lấy dữ liệu dashboard khi component được mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError(null);
        const data = await getDashboardOverview();
        setDashboard(data);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
        setDashboardError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoadingDashboard(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Mock data
  const supporters: Supporter[] = [
    {
      key: '1',
      name: 'John Smith',
      email: 'john.smith@gradestack.com',
      status: 'active',
      role: 'Senior Supporter',
      createdAt: '2024-01-01',
    },
    {
      key: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@gradestack.com',
      status: 'inactive',
      role: 'Supporter',
      createdAt: '2024-02-01',
    },
  ];

  const instructors: Instructor[] = [
    {
      key: '1',
      name: 'Jane Doe',
      email: 'jane.doe@gradestack.com',
      status: 'active',
      specialization: 'Mathematics',
      courses: 10,
      students: 200,
      rating: 4.7,
    },
    {
      key: '2',
      name: 'Michael Brown',
      email: 'michael.brown@gradestack.com',
      status: 'inactive',
      specialization: 'Computer Science',
      courses: 8,
      students: 150,
      rating: 4.5,
    },
  ];

  const handleStatusChange = (checked: boolean, record: Supporter) => {
    console.log(`Changing status for ${record.name} to ${checked ? 'active' : 'inactive'}`);
  };

  const handleEdit = (record: Supporter) => {
    console.log('Edit supporter:', record);
  };

  const handleDelete = (record: Supporter) => {
    console.log('Delete supporter:', record);
  };

  const handleInstructorStatusChange = (checked: boolean, record: Instructor) => {
    console.log(`Changing status for ${record.name} to ${checked ? 'active' : 'inactive'}`);
  };

  const handleEditInstructor = (record: Instructor) => {
    console.log('Edit instructor:', record);
  };

  const handleDeleteInstructor = (record: Instructor) => {
    console.log('Delete instructor:', record);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Supporter) => (
        <Button 
          type="link" 
          onClick={() => console.log('View details:', record)}
          className="p-0 text-blue-600 hover:text-blue-700 font-medium"
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-gray-700',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color="blue">{role}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Supporter) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          className="bg-gray-300"
        />
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      className: 'text-gray-700',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Supporter) => (
        <div className="flex space-x-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              className="text-gray-600 hover:text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Delete supporter"
            description="Are you sure you want to delete this supporter?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-gray-600 hover:text-red-600"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const instructorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Instructor) => (
        <Button 
          type="link" 
          onClick={() => console.log('View details:', record)}
          className="p-0 text-blue-600 hover:text-blue-700 font-medium"
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-gray-700',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specialization: string) => (
        <Tag color="blue">{specialization}</Tag>
      ),
    },
    {
      title: 'Courses',
      dataIndex: 'courses',
      key: 'courses',
      className: 'text-gray-700',
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      className: 'text-gray-700',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="flex items-center text-gray-700">
          <StarFilled className="text-yellow-400 mr-1" />
          {rating.toFixed(1)}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Instructor) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleInstructorStatusChange(checked, record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          className="bg-gray-300"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Instructor) => (
        <div className="flex space-x-2">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditInstructor(record)}
              className="text-gray-600 hover:text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Delete instructor"
            description="Are you sure you want to delete this instructor?"
            onConfirm={() => handleDeleteInstructor(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ className: 'bg-red-500 hover:bg-red-600' }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-gray-600 hover:text-red-600"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleCreateSupporter = async (values: CreateSupporterForm) => {
    console.log('Creating supporter:', values);
    setIsModalOpen(false);
    form.resetFields();
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <LineChartOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'instructors',
      icon: <BookOutlined />,
      label: 'Instructors',
      children: [
        {
          key: 'instructors-list',
          label: 'All Instructors',
        },
        {
          key: 'instructors-performance',
          label: 'Performance',
        },
        {
          key: 'instructors-courses',
          label: 'Courses',
        },
        {
          key: 'instructors-assignments',
          label: 'Assignments',
        },
      ],
    },
    {
      key: 'supporters',
      icon: <TeamOutlined />,
      label: 'Supporters',
      children: [
        {
          key: 'supporters-list',
          label: 'All Supporters',
        },
        {
          key: 'supporters-performance',
          label: 'Performance',
        },
        {
          key: 'supporters-tasks',
          label: 'Tasks',
        },
      ],
    },
    {
      key: 'learners',
      icon: <UserOutlined />,
      label: 'Learners',
      children: [
        {
          key: 'learners-list',
          label: 'All Learners',
        },
        {
          key: 'learners-progress',
          label: 'Learning Progress',
        },
        {
          key: 'learners-reports',
          label: 'Reports',
        },
      ],
    },
    {
      key: 'transactions',
      icon: <TransactionOutlined />,
      label: 'Transactions',
      children: [
        {
          key: 'transactions-all',
          label: 'All Transactions',
        },
        {
          key: 'transactions-pending',
          label: 'Pending',
        },
        {
          key: 'transactions-completed',
          label: 'Completed',
        },
        {
          key: 'transactions-failed',
          label: 'Failed',
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
            </div>

            {loadingDashboard ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" tip="Đang tải dữ liệu..." />
              </div>
            ) : dashboardError ? (
              <Alert
                message="Lỗi tải dữ liệu"
                description={dashboardError}
                type="error"
                showIcon
                className="my-4"
              />
            ) : dashboard ? (
              <>
                {/* Revenue Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Tổng doanh thu</span>}
                      value={dashboard.totalRevenue || 0}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                      formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Doanh thu tháng</span>}
                      value={dashboard.monthlyRevenue || 0}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#2196F3' }}
                      formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Thanh toán chờ xử lý</span>}
                      value={dashboard.pendingPayments || 0}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#FF9800' }}
                      formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Giao dịch trung bình</span>}
                      value={dashboard.averageTransaction || 0}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#607D8B' }}
                      formatter={value => `$${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Card>
                </div>

                {/* User Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Tổng giảng viên</span>}
                      value={dashboard.totalInstructors || 0}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#2196F3' }}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Tổng học viên</span>}
                      value={dashboard.totalLearners || 0}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Khóa học đang hoạt động</span>}
                      value={dashboard.totalCourses || 0}
                      prefix={<BookOutlined />}
                      valueStyle={{ color: '#FF9800' }}
                    />
                  </Card>
                </div>

                {/* Học viên và đánh giá */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Học viên hoạt động</span>}
                      value={dashboard.activeStudents || 0}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#4CAF50' }}
                    />
                  </Card>
                  <Card className="bg-white border border-gray-200">
                    <Statistic
                      title={<span className="text-gray-700">Đánh giá trung bình</span>}
                      value={dashboard.averageRating || 0}
                      prefix={<StarFilled />}
                      valueStyle={{ color: '#FF9800' }}
                      suffix="/5"
                      precision={1}
                    />
                  </Card>
                </div>
              </>
            ) : null}
          </div>
        );
      case 'instructors-list':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Instructors Management</h1>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Instructor
              </Button>
            </div>
            
            {/* Instructors Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Instructors List</h2>
                <Table 
                  columns={instructorColumns} 
                  dataSource={instructors}
                  pagination={{ pageSize: 10 }}
                  className="border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      case 'instructors-performance':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Instructor Performance</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Total Courses</span>}
                  value={156}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#2196F3' }}
                />
              </Card>
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Active Students</span>}
                  value={1234}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#4CAF50' }}
                />
              </Card>
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Average Rating</span>}
                  value={4.8}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#FF9800' }}
                  suffix="/5"
                />
              </Card>
            </div>
          </div>
        );
      case 'instructors-courses':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Instructor Courses</h1>
            {/* Add courses content */}
          </div>
        );
      case 'instructors-assignments':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Instructor Assignments</h1>
            {/* Add assignments content */}
          </div>
        );
      case 'supporters-list':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Supporters Management</h1>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Supporter
              </Button>
            </div>
            
            {/* Supporters Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Supporters List</h2>
                <Table 
                  columns={columns} 
                  dataSource={supporters}
                  pagination={{ pageSize: 10 }}
                  className="border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>
        );
      case 'supporters-performance':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Supporter Performance</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Total Tasks</span>}
                  value={324}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#2196F3' }}
                />
              </Card>
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Resolved Issues</span>}
                  value={289}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#4CAF50' }}
                />
              </Card>
              <Card className="bg-white border border-gray-200">
                <Statistic
                  title={<span className="text-gray-700">Response Time</span>}
                  value={15}
                  suffix="min"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#FF9800' }}
                />
              </Card>
            </div>
          </div>
        );
      case 'supporters-tasks':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Supporter Tasks</h1>
            {/* Add tasks content */}
          </div>
        );
      case 'learners-list':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Learners Management</h1>
            {/* Add learners list content */}
          </div>
        );
      case 'transactions-all':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Transactions History</h1>
            {/* Add transactions content */}
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
            {/* Add settings content */}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              {selectedKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h1>
          </div>
        );
    }
  };

  return (
    <Layout className="min-h-screen bg-white">
      <DashboardHeader />
      <Layout>
        <Sider
          width={200}
          collapsed={collapsed}
          className="bg-white mt-[1px] border-r border-gray-200"
          trigger={null}
          collapsible
          onCollapse={setCollapsed}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={['instructors', 'supporters', 'learners', 'transactions']}
            className="h-full border-r-0"
            onClick={({ key }) => setSelectedKey(key)}
            items={menuItems}
            theme="light"
          />
        </Sider>
        <Layout className="p-6 bg-gray-50">
          <Content className="p-6 m-0 min-h-[280px] bg-white rounded-lg shadow-sm">
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
