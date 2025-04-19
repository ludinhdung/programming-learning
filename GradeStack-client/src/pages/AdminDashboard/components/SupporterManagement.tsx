import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

interface Supporter {
    id: string;
    name: string;
    email: string;
    role: 'senior' | 'junior';
    status: 'active' | 'inactive';
    assignedTickets: number;
    resolvedTickets: number;
}

const SupporterManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const columns: ColumnsType<Supporter> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name) => <span className="text-white">{name}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => <span className="text-gray-300">{email}</span>,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: Supporter['role']) => (
                <Tag color={role === 'senior' ? 'blue' : 'cyan'} className="text-sm">
                    {role === 'senior' ? 'Senior Supporter' : 'Junior Supporter'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: Supporter['status']) => (
                <Tag color={status === 'active' ? 'green' : 'red'} className="text-sm">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Assigned Tickets',
            dataIndex: 'assignedTickets',
            key: 'assignedTickets',
            render: (tickets) => <span className="text-gray-300">{tickets}</span>,
        },
        {
            title: 'Resolved Tickets',
            dataIndex: 'resolvedTickets',
            key: 'resolvedTickets',
            render: (tickets) => <span className="text-gray-300">{tickets}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        type="text"
                        icon={<MdEdit className="text-blue-400" />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        icon={<MdDelete className="text-red-400" />}
                        onClick={() => handleDelete(record)}
                    />
                </div>
            ),
        },
    ];

    const data: Supporter[] = [
        {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@gradestack.com',
            role: 'senior',
            status: 'active',
            assignedTickets: 15,
            resolvedTickets: 12,
        },
        {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@gradestack.com',
            role: 'junior',
            status: 'active',
            assignedTickets: 8,
            resolvedTickets: 5,
        },
    ];

    const handleAdd = () => {
        setIsModalVisible(true);
    };

    const handleEdit = (record: Supporter) => {
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record: Supporter) => {
        // Implement delete functionality
        console.log('Delete:', record);
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            console.log('Form values:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Supporter Management</h1>
                <Button
                    type="primary"
                    icon={<MdAdd />}
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    Add Supporter
                </Button>
            </div>

            <div className="bg-zinc-800 rounded-lg p-6">
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 10 }}
                    className="bg-zinc-800"
                />
            </div>

            <Modal
                title={form.getFieldValue('id') ? 'Edit Supporter' : 'Add Supporter'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-600' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input the email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select the role!' }]}
                    >
                        <Select>
                            <Select.Option value="senior">Senior Supporter</Select.Option>
                            <Select.Option value="junior">Junior Supporter</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select the status!' }]}
                    >
                        <Select>
                            <Select.Option value="active">Active</Select.Option>
                            <Select.Option value="inactive">Inactive</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SupporterManagement; 