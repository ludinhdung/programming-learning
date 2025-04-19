import React from 'react';
import { Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface WithdrawalRequest {
    id: string;
    date: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    user: string;
    accountInfo: string;
}

const WithdrawalRequests: React.FC = () => {
    const columns: ColumnsType<WithdrawalRequest> = [
        {
            title: 'Request ID',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <span className="text-blue-400">{id}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => <span className="text-gray-300">{date}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className="text-white">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: WithdrawalRequest['status']) => {
                const colors: Record<WithdrawalRequest['status'], string> = {
                    pending: 'gold',
                    approved: 'green',
                    rejected: 'red',
                };
                return (
                    <Tag color={colors[status]} className="text-sm">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Tag>
                );
            },
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (user) => <span className="text-gray-300">{user}</span>,
        },
        {
            title: 'Account Info',
            dataIndex: 'accountInfo',
            key: 'accountInfo',
            render: (info) => <span className="text-gray-300">{info}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    {record.status === 'pending' && (
                        <>
                            <Button
                                type="primary"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleApprove(record)}
                            >
                                Approve
                            </Button>
                            <Button
                                danger
                                onClick={() => handleReject(record)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    const data: WithdrawalRequest[] = [
        {
            id: 'WD-001',
            date: '2024-03-15 14:30',
            amount: 500.00,
            status: 'pending',
            user: 'John Doe',
            accountInfo: '**** **** **** 1234',
        },
        {
            id: 'WD-002',
            date: '2024-03-15 15:45',
            amount: 1200.00,
            status: 'approved',
            user: 'Jane Smith',
            accountInfo: '**** **** **** 5678',
        },
        {
            id: 'WD-003',
            date: '2024-03-14 09:15',
            amount: 800.00,
            status: 'rejected',
            user: 'Mike Johnson',
            accountInfo: '**** **** **** 9012',
        },
    ];

    const handleApprove = (record: WithdrawalRequest) => {
        console.log('Approve withdrawal:', record);
    };

    const handleReject = (record: WithdrawalRequest) => {
        console.log('Reject withdrawal:', record);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Withdrawal Requests</h1>

            <div className="bg-zinc-800 rounded-lg p-6">
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 10 }}
                    className="bg-zinc-800"
                />
            </div>
        </div>
    );
};

export default WithdrawalRequests; 