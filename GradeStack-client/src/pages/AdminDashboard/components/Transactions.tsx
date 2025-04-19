import React, { useState, useEffect } from 'react';
import { MdAccessTime, MdPayment, MdAccountBalance } from "react-icons/md";
import { formatVND } from "../../../utils/formatCurrency";
import adminService, { AdminTransaction } from '../../../services/adminService';
import { message } from 'antd';

type FilterType = 'REVENUE' | 'WITHDRAWAL';

const COMMISSION_RATE = 0.15;

const Transactions = () => {
    const [activeTab, setActiveTab] = useState<FilterType>('REVENUE');
    const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllTransactions();
            setTransactions(data);
        } catch {
            message.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            await adminService.updateTransactionStatus(id, newStatus);
            message.success('Transaction status updated successfully');
            fetchTransactions();
        } catch {
            message.error('Failed to update transaction status');
        }
    };

    const calculateTotals = () => {
        const totals = transactions.reduce((acc, transaction) => {
            if (transaction.status === 'APPROVED') {
                if (transaction.type === 'REVENUE') {
                    acc.actualRevenue += Math.round(transaction.amount / (1 - COMMISSION_RATE));
                    acc.commission += Math.round((transaction.amount / (1 - COMMISSION_RATE)) * COMMISSION_RATE);
                } else {
                    acc.withdrawal += transaction.amount;
                }
            }
            return acc;
        }, { actualRevenue: 0, commission: 0, withdrawal: 0 });

        return totals;
    };

    const { actualRevenue, commission, withdrawal } = calculateTotals();
    const revenueTransactions = transactions.filter(t => t.type === 'REVENUE');
    const withdrawalTransactions = transactions.filter(t => t.type === 'WITHDRAWAL');

    const filterButtons = [
        {
            type: 'REVENUE' as FilterType,
            label: 'Revenue',
            icon: <MdAccountBalance className="w-4 h-4" />,
            count: revenueTransactions.length
        },
        {
            type: 'WITHDRAWAL' as FilterType,
            label: 'Withdrawals',
            icon: <MdPayment className="w-4 h-4" />,
            count: withdrawalTransactions.length
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-6">
                <div className="flex justify-center items-center h-full">
                    <div className="text-white">Loading transactions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-6 gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
                    <p className="text-gray-400">Monitor all platform transactions</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-neutral-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-xl font-bold text-green-500">{formatVND(actualRevenue)}</p>
                        <p className="text-xs text-gray-400">Before Commission</p>
                    </div>
                    <div className="bg-neutral-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Platform Commission</p>
                        <p className="text-xl font-bold text-yellow-500">{formatVND(commission)}</p>
                        <p className="text-xs text-gray-400">15% of Revenue</p>
                    </div>
                    <div className="bg-neutral-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Withdrawals</p>
                        <p className="text-xl font-bold text-blue-500">{formatVND(withdrawal)}</p>
                    </div>

                </div>
            </div>

            <div className="flex gap-2 mb-4">
                {filterButtons.map(button => (
                    <button
                        key={button.type}
                        onClick={() => setActiveTab(button.type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                            ${activeTab === button.type
                                ? 'bg-neutral-600 text-white'
                                : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                            }
                        `}
                    >
                        {button.icon}
                        <span>{button.label}</span>
                        <span className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            ${activeTab === button.type
                                ? 'bg-neutral-500 text-white'
                                : 'bg-neutral-700 text-gray-400'
                            }
                        `}>
                            {button.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-neutral-700 rounded-lg overflow-hidden">
                {activeTab === 'REVENUE' ? (
                    <>
                        <div className="p-4 bg-neutral-800">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MdAccountBalance className="w-5 h-5 text-green-500" />
                                Revenue Transactions
                            </h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-800">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Instructor</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-600">
                                {revenueTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                            <MdAccountBalance className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                            <p className="text-lg font-medium text-white mb-1">No revenue transactions found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    revenueTransactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-neutral-600 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <MdAccessTime className="w-4 h-4" />
                                                    <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {transaction.instructor ? (
                                                    <div className="text-gray-300">
                                                        <div>{`${transaction.instructor.firstName} ${transaction.instructor.lastName}`}</div>
                                                        <div className="text-sm text-gray-400">{transaction.instructor.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                                                    transaction.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-right">
                                                    <div className="font-medium text-green-500">
                                                        +{formatVND(Math.round(transaction.amount / (1 - COMMISSION_RATE)))}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        Instructor receives: {formatVND(transaction.amount)}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <div className="p-4 bg-neutral-800">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MdPayment className="w-5 h-5 text-blue-500" />
                                Withdrawal Requests
                            </h2>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="bg-neutral-800">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Instructor</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Amount</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-600">
                                {withdrawalTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            <MdPayment className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                                            <p className="text-lg font-medium text-white mb-1">No withdrawal requests found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    withdrawalTransactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-neutral-600 transition-colors duration-150"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <MdAccessTime className="w-4 h-4" />
                                                    <span>{new Date(transaction.createdAt).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {transaction.instructor ? (
                                                    <div className="text-gray-300">
                                                        <div>{`${transaction.instructor.firstName} ${transaction.instructor.lastName}`}</div>
                                                        <div className="text-sm text-gray-400">{transaction.instructor.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' :
                                                    transaction.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                                                        'bg-red-500/20 text-red-500'
                                                    }`}>
                                                    {transaction.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-right block font-medium text-blue-500">
                                                    -{formatVND(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {transaction.status === 'PENDING' && (
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(transaction.id, 'APPROVED')}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(transaction.id, 'REJECTED')}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
};

export default Transactions; 