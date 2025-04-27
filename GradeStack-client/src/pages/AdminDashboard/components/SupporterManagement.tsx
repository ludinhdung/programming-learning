import React, { useState, useEffect } from "react";
import {
  Table,
  Switch,
  Button,
  Drawer,
  Form,
  Input,
  Popconfirm,
  message,
  Space,
  Row,
  Col,
} from "antd";
import {
  DeleteOutlined,
  CopyOutlined,
  ReloadOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { adminService } from "../../../services/api";

const { Column } = Table;

interface Supporter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isBlocked: boolean;
  password?: string;
}

const SupporterManagement = () => {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Fetch supporters from API
  const fetchSupporters = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllSupporters();
      setSupporters(response.data);
    } catch (error) {
      console.error("Error fetching supporters:", error);
      message.error("Failed to fetch supporters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupporters();
  }, []);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    try {
      await adminService.updateSupporterStatus(userId, !checked);
      setSupporters((prev) =>
        prev.map((supporter) =>
          supporter.id === userId
            ? { ...supporter, isBlocked: !checked }
            : supporter
        )
      );
      message.success(
        `Supporter status updated to ${checked ? "Active" : "Inactive"}`
      );
    } catch (error) {
      console.error("Error updating supporter status:", error);
      message.error("Failed to update supporter status");
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPassword(password);
    form.setFieldValue("password", password);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success("Password copied");
    } catch (err) {
      console.error("Failed to copy password", err);
    }
  };

  const showDrawer = () => {
    form.resetFields();
    generatePassword(); // Generate a password automatically when opening the drawer
    setDrawerOpen(true);
  };

  const onClose = () => {
    setDrawerOpen(false);
    setGeneratedPassword("");
    setIsPasswordVisible(false);
  };

  // Delete supporter
  const handleDelete = async () => {
    setConfirmLoading(true);
    try {
      if (deletingId) {
        await adminService.deleteSupporter(deletingId);
        message.success("Supporter deleted successfully");
        fetchSupporters();
      }
    } catch {
      message.error("Failed to delete supporter");
    } finally {
      setConfirmLoading(false);
      setDeletingId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setConfirmLoading(true);

      await adminService.createSupporter({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: generatedPassword,
      });

      message.success("Supporter account created successfully");
      setDrawerOpen(false);
      form.resetFields();
      setGeneratedPassword("");
      setIsPasswordVisible(false);
      fetchSupporters();
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Failed to create supporter account");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen p-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-white text-2xl font-bold">Supporter Management</h1>
        <Button
          type="primary"
          onClick={showDrawer}
          className="bg-blue-600 hover:bg-blue-600"
        >
          Create Supporter Account
        </Button>
      </div>

      <Table<Supporter>
        dataSource={supporters}
        rowKey="id"
        loading={loading}
        className="bg-white rounded-xl shadow-lg mt-4"
      >
        <Column
          title="Supporter"
          key="name"
          render={(_, record: Supporter) => (
            <span>
              {record.firstName} {record.lastName}
            </span>
          )}
        />
        <Column title="Email" dataIndex="email" key="email" />
        <Column
          title="Status"
          key="status"
          render={(_, record: Supporter) => (
            <Switch
              checked={!record.isBlocked}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              onChange={(checked) => handleStatusChange(record.id, checked)}
            />
          )}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record: Supporter) => (
            <div className="flex gap-2">
              <Popconfirm
                title="Delete supporter"
                description="Are you sure you want to delete this supporter? This action cannot be reversed."
                open={deletingId === record.id}
                onConfirm={handleDelete}
                okButtonProps={{ loading: confirmLoading }}
                onCancel={() => setDeletingId(null)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeletingId(record.id)}
                />
              </Popconfirm>
            </div>
          )}
        />
      </Table>

      <Drawer
        title="Create Supporter Account"
        width={520}
        onClose={onClose}
        open={drawerOpen}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button
              onClick={handleSubmit}
              type="primary"
              loading={confirmLoading}
              className="bg-blue-500 hover:bg-blue-600"
              disabled={!generatedPassword}
            >
              Create
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please input the first name!" },
                ]}
              >
                <Input placeholder="First name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please input the last name!" },
                ]}
              >
                <Input placeholder="Last name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input the email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <div className="flex items-center">
                    <span>Password</span>
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={generatePassword}
                      className="ml-2 p-0 h-auto text-blue-500 hover:text-blue-600"
                    >
                      Generate
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
                      onVisibleChange: setIsPasswordVisible,
                    }}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    className="rounded-l-md"
                  />
                  {generatedPassword && (
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="rounded-r-md"
                    />
                  )}
                </Space.Compact>
                <div className="mt-1 text-sm text-gray-500">
                  This password will be required for the supporter's first login
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </div>
  );
};

export default SupporterManagement;
