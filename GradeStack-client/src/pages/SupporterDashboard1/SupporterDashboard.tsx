import { Layout, Table, Tag, Menu, Button, Switch, Modal, Form, Input, Tooltip, Popconfirm, Space } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import { useState } from 'react';
import React from 'react';
import type { FormInstance } from 'antd';
import styles from './SupporterDashboard.module.css';

const { Content, Sider } = Layout;

interface Instructor {
  key: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  specialization: string;
}

interface CreateInstructorForm {
  name: string;
  email: string;
  specialization: string;
  password: string;
}

interface CurrentUser {
  isInstructorLead: boolean;
}

interface SubmitButtonProps {
  form: FormInstance;
  disabled?: boolean;
}

const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({ 
  form, 
  children,
  disabled 
}) => {
  const [submittable, setSubmittable] = React.useState<boolean>(false);

  // Watch all values
  const values = Form.useWatch([], form);

  React.useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  return (
    <Button 
      type="primary" 
      htmlType="submit" 
      disabled={disabled || !submittable}
      block
      className="bg-blue-500 hover:bg-blue-600 h-10 rounded-md"
    >
      {children}
    </Button>
  );
};

const modalStyles = {
  header: {
    padding: '16px 24px',
    marginBottom: 0,
    backgroundColor: '#ffffff',
  },
  body: {
    padding: '24px',
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 0,
    backgroundColor: '#ffffff',
  },
};

const SupporterDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateInstructorForm>();
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const instructors: Instructor[] = [
    { 
      key: '1', 
      name: 'Dr. John Smith', 
      email: 'john.smith@gradestack.com', 
      status: 'active', 
      specialization: 'Computer Science',
    },
    { 
      key: '2', 
      name: 'Prof. Sarah Johnson', 
      email: 'sarah.j@gradestack.com', 
      status: 'inactive',
      specialization: 'Mathematics',
    },
  ];

  const currentUser: CurrentUser = {
    isInstructorLead: true
  };

  const handleStatusChange = (checked: boolean, record: Instructor) => {
    console.log(`Changing status for ${record.name} to ${checked ? 'active' : 'inactive'}`);
  };

  const handleEdit = (record: Instructor) => {
    console.log('Edit instructor:', record);
  };

  const handleDelete = (record: Instructor) => {
    console.log('Delete instructor:', record);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Instructor) => (
        <Button 
          type="link" 
          onClick={() => console.log('View details:', record)}
          className="p-0 text-blue-600 hover:text-blue-800 font-medium"
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Instructor) => (
        <Switch
          checked={status === 'active'}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          className="bg-gray-200"
          disabled={!currentUser.isInstructorLead}
        />
      ),
    },
    ...(currentUser.isInstructorLead ? [{
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Instructor) => (
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
            title="Delete instructor"
            description="Are you sure you want to delete this instructor?"
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
    }] : []),
  ];

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    form.setFieldValue('password', password);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add a notification here to show success
      console.log('Password copied to clipboard');
    } catch (err) {
      console.error('Failed to copy password', err);
    }
  };

  const handleCreateInstructor = async (values: CreateInstructorForm) => {
    console.log('Creating instructor:', {
      ...values,
      password: generatedPassword,
    });
    setIsModalOpen(false);
    form.resetFields();
    setGeneratedPassword('');
    setIsPasswordVisible(false);
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
  return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-800">Supporter Dashboard</h1>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 "
              >
                Generate Account
              </Button>
            </div>

            {/* Instructors Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Instructors List</h2>
                <Table 
                  columns={columns} 
                  dataSource={instructors}
                  pagination={{ pageSize: 10 }}
                  className="border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Create Instructor Modal */}
            <Modal
              title={<span className="text-lg font-medium">Generate Instructor Account</span>}
              open={isModalOpen}
              onCancel={() => {
                setIsModalOpen(false);
                form.resetFields();
                setGeneratedPassword('');
                setIsPasswordVisible(false);
              }}
              footer={null}
              className={`rounded-lg ${styles.modalOverride}`}
              styles={modalStyles}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateInstructor}
                className="mt-4"
                initialValues={{ password: generatedPassword }}
                autoComplete="off"
              >
                <Form.Item
                  name="name"
                  label={<span className="text-gray-700 font-medium">Full Name</span>}
                  rules={[{ required: true, message: 'Please input instructor name!' }]}
                >
                  <Input 
                    placeholder="Enter full name"
                    className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={<span className="text-gray-700 font-medium">Email</span>}
                  rules={[
                    { required: true, message: 'Please input instructor email!' },
                    { type: 'email', message: 'Please input a valid email!' }
                  ]}
                >
                  <Input 
                    placeholder="Enter email address"
                    className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>

                <Form.Item
                  name="specialization"
                  label={<span className="text-gray-700 font-medium">Specialization</span>}
                  rules={[{ required: true, message: 'Please input specialization!' }]}
                >
                  <Input 
                    placeholder="Enter specialization"
                    className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex justify-between items-center w-full">
                      <span className="text-gray-700 font-medium">Password</span>
                      <Button
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={generatePassword}
                        className="ml-2 p-0 h-auto text-blue-500 hover:text-blue-600"
                      >
                        Generate New
                      </Button>
                    </div>
                  }
                >
                  <Space.Compact className="w-full">
                    <Input.Password
                      value={generatedPassword}
                      readOnly
                      visibilityToggle={{ 
                        visible: isPasswordVisible, 
                        onVisibleChange: setIsPasswordVisible 
                      }}
                      iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                      className="h-10 rounded-l-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="h-10 rounded-r-md border-gray-300 hover:bg-gray-50 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </Space.Compact>
                  <div className="mt-1 text-sm text-gray-500">
                    This password will be required for the instructor's first login
                  </div>
                </Form.Item>

                <Form.Item className="mb-0 pt-4">
                  <Space className="w-full">
                    <SubmitButton 
                      form={form}
                      disabled={!generatedPassword}
                    >
                      Create Account
                    </SubmitButton>
                    <Button 
                      htmlType="reset"
                      block
                      className="h-10 rounded-md border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500"
                      onClick={() => {
                        form.resetFields();
                        setGeneratedPassword('');
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Modal>
    </div>
  );
      case 'instructor':
        return <h1 className="text-2xl font-semibold text-gray-800">Instructor Management</h1>;
      case 'settings':
        return <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>;
      default:
        return null;
    }
  };

  return (
    <Layout className="min-h-screen">
      <DashboardHeader />
      <Layout>
        <Sider
          width={200}
          collapsed={collapsed}
          className="bg-white mt-[1px]"
          trigger={null}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            className="h-full border-r-0"
            onClick={({ key }) => setSelectedKey(key)}
            items={[
              {
                key: 'dashboard',
                icon: <UserOutlined />,
                label: 'Dashboard',
              },
              {
                key: 'instructor',
                icon: <BookOutlined />,
                label: 'Instructor',
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Settings',
              },
            ]}
          />
        </Sider>
        <Layout className="p-6">
          <Content className="p-6 m-0 min-h-[280px] bg-white rounded-lg">
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default SupporterDashboard;