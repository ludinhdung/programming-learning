import React, { useEffect, useState } from "react";
import {
  Space,
  Table,
  Tag,
  Switch,
  Button,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Radio,
} from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { supporterService } from "../../../services/api";

const { Column } = Table;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "INSTRUCTOR" | "INSTRUCTOR_LEAD";
  isBlocked: boolean;
}

interface Instructor {
  user: User;
  organization: string;
  avatar: string;
}

const InstructorList: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const fetchInstructors = async () => {
    try {
      const respone = await supporterService.getAllInstructor();
      setInstructors(respone.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      message.error("Failed to fetch Instructors");
    }
  };
  useEffect(() => {
    try {
      fetchInstructors();
    } catch (error) {
      console.error("Error in useEffect:", error);
    }
  }, []);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    try {
      await supporterService.updateUserStatus(userId, { isBlocked: !checked });
      console.log(checked);
      // checked => active => isBlocked = false
      setInstructors((prev) =>
        prev.map((instructor) =>
          instructor.user.id === userId
            ? {
                ...instructor,
                user: {
                  ...instructor.user,
                  isBlocked: !checked, // cập nhật local data
                },
              }
            : instructor
        )
      );
      message.success(
        `Instructor status updated to ${checked ? "Active" : "Inactive"}`
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      message.error("Failed to update user status");
    }
  };

  const handleCreateInstructor = async (values: any) => {
    try {
      console.log("Instructor data to be sent:", values);
      const response = await supporterService.createInstructor({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: generatedPassword,
        organization: values.organization,
        role: values.role,
      });

      message.success("Instructor account created successfully");
      setIsModalOpen(false);
      form.resetFields();
      fetchInstructors();
    } catch (error: any) {
      console.log("Error to create instructor: ", error);
      message.error(
        error.response?.data.message || "Failed to create instructor account"
      );
    }
  };

  const handleDelete = async (instructorId: string) => {
    setConfirmLoading(true);
    try {
      await supporterService.deleteInstructor(instructorId);
      message.success("Instructor deleted successfully");
      fetchInstructors();
    } catch (error) {
      message.error("Failed to delete instructor");
    } finally {
      setConfirmLoading(false);
      setDeletingId(null);
    }
  };
  const renderCreateInstructorForm = () => {
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
        message.success("Passowrd copied");
      } catch (err) {
        console.error("Failed to copy password", err);
      }
    };

    return (
      <Modal
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setGeneratedPassword("");
          setIsPasswordVisible(false);
        }}
        footer={null}
        className="bg-white rounded-lg"
        bodyStyle={{ padding: "24px" }} // Cách 1: Chỉnh padding cho body
        style={{ padding: 0 }} // Cách 2: Chỉnh padding cho toàn bộ modal
      >
        <span className="text-lg font-semibold">
          Generate Instructor Account
        </span>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateInstructor}
          // initialValues={{ password: generatedPassword }}
          initialValues={{
            role: "INSTRUCTOR",
          }}
          autoComplete="off"
        >
          <Form.Item
            name="firstName"
            className="mt-4"
            label={
              <span className="text-gray-700 font-medium">First Name</span>
            }
            rules={[
              {
                required: true,
                message: "Please input instructor first name!",
              },
            ]}
          >
            <Input
              placeholder="Enter first name"
              className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={<span className="text-gray-700 font-medium">Last Name</span>}
            rules={[
              { required: true, message: "Please input instructor last name!" },
            ]}
          >
            <Input
              placeholder="Enter last name"
              className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span className="text-gray-700 font-medium">Email</span>}
            rules={[
              { required: true, message: "Please input instructor email!" },
              { type: "email", message: "Please input a valid email!" },
            ]}
          >
            <Input
              placeholder="Enter email address"
              className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="organization"
            label={
              <span className="text-gray-700 font-medium">Organization</span>
            }
            rules={[{ required: true, message: "Please input organization!" }]}
          >
            <Input
              placeholder="Enter organization"
              className="h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </Form.Item>

          <Form.Item
            label={
              <div className="items-center w-full">
                <span className="text-gray-700 font-medium">Password</span>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={generatePassword}
                  className="ml-3 p-0 h-auto text-blue-500 hover:text-blue-600"
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
                className="h-10 rounded-l-md border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {generatedPassword && (
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(generatedPassword)}
                  className="h-10 rounded-r-md border-gray-300 hover:bg-gray-50 hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </Space.Compact>
            <div className="mt-1 text-sm text-gray-500">
              This password will be required for the instructor's first login
            </div>
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="INSTRUCTOR" defaultChecked>
                Instructor
              </Radio>
              <Radio value="INSTRUCTOR_LEAD">Instructor Lead</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item className="mb-0 pt-4">
            <Space className="w-full">
              <Button
                htmlType="submit"
                type="primary"
                disabled={!generatedPassword}
                className="h-10 rounded-md"
              >
                Create Account
              </Button>
              <Button
                htmlType="reset"
                block
                className="h-10 rounded-md border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500"
                onClick={() => {
                  form.resetFields();
                  setGeneratedPassword("");
                }}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-400 p-8">
      <div className="flex justify-between">
        <h1 className="flex justify-start text-black text-3xl font-bold mb-4">
          Instructor Management
        </h1>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-lg"
        >
          Create New Instructor
        </button>
      </div>
      <div className="mt-4">
        <Table<Instructor>
          dataSource={instructors}
          className="bg-white rounded-xl shadow-lg"
        >
          <Column
            title="Instructor"
            key="instructor"
            render={(_, record: Instructor) => (
              <div className="flex justify-start items-center gap-2">
                <img
                  src={record.avatar}
                  className="h-10 w-10 rounded-full"
                ></img>
                <span>
                  {record.user.firstName} {record.user.lastName}
                </span>
              </div>
            )}
          />
          <Column
            title="Email"
            key="email"
            render={(_, record: Instructor) => `${record.user.email}`}
          />
          <Column
            title="Organization"
            key="organization"
            render={(_, record: Instructor) => (
              <Tag className="bg-indigo-400">{record.organization}</Tag>
            )}
          />
          <Column
            title="Role"
            key="role"
            render={(_, record: Instructor) =>
              record.user.role === "INSTRUCTOR" ? (
                <Tag className="bg-green-400">{record.user.role}</Tag>
              ) : record.user.role === "INSTRUCTOR_LEAD" ? (
                <Tag className="bg-red-400">{record.user.role}</Tag>
              ) : null
            }
          />
          <Column
            title="Status"
            key="status"
            render={(_, record: Instructor) => (
              <Switch
                checked={!record.user.isBlocked}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                onChange={(checked) =>
                  handleStatusChange(record.user.id, checked)
                }
              />
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record: Instructor) => (
              <Popconfirm
                title="Delete instructor"
                description="Are you sure you want to delete this instructor? This action can not be reversed"
                open={deletingId === record.user.id}
                onConfirm={() => handleDelete(record.user.id)}
                okButtonProps={{ loading: confirmLoading }}
                onCancel={() => setDeletingId(null)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeletingId(record.user.id)}
                />
              </Popconfirm>
            )}
          />
        </Table>
      </div>
      {renderCreateInstructorForm()}
    </div>
  );
};

export default InstructorList;
