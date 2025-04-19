import { Badge } from "@mantine/core";
import { useState, useEffect } from "react";
import { formatVND } from "../../../../utils/formatCurrency";
import { MdAccessTime, MdPayment, MdAccountBalance, MdFilterList } from "react-icons/md";
import { instructorService } from "../../../../services/api";
import { message } from "antd";

interface Transaction {
    id: string;
    amount: number;
    type: 'REVENUE' | 'WITHDRAWAL';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

type FilterType = 'ALL' | 'REVENUE' | 'WITHDRAWAL';

const TransactionList = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const user = localStorage.getItem("user");
                if (!user) {
                    throw new Error("User not found");
                }
                const userData = JSON.parse(user);
                const instructorId = userData.id;

                const data = await instructorService.getInstructorTransactions(instructorId);
                setTransactions(data);
            } catch (error) {
                console.error("Error fetching transactions:", error);
                message.error("Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'green';
            case 'PENDING':
                return 'yellow';
            case 'REJECTED':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'REVENUE':
                return <MdAccountBalance className="w-5 h-5 text-green-500" />;
            case 'WITHDRAWAL':
                return <MdPayment className="w-5 h-5 text-blue-500" />;
            default:
                return null;
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'ALL') return true;
        return transaction.type === filter;
    });

    const calculateTotals = () => {
        const totals = transactions.reduce((acc, transaction) => {
            if (transaction.status === 'APPROVED') {
                if (transaction.type === 'REVENUE') {
                    acc.revenue += Number(transaction.amount);
                } else {
                    acc.withdrawal += Number(transaction.amount);
                }
            }
            return acc;
        }, { revenue: 0, withdrawal: 0 });

        return totals;
    };

    const { revenue, withdrawal } = calculateTotals();

    const filterButtons: { type: FilterType; label: string; icon?: React.ReactNode; count: number }[] = [
        {
            type: 'ALL',
            label: 'All',
            count: transactions.length
        },
        {
            type: 'REVENUE',
            label: 'Revenue',
            icon: <MdAccountBalance className="w-4 h-4" />,
            count: transactions.filter(t => t.type === 'REVENUE').length
        },
        {
            type: 'WITHDRAWAL',
            label: 'Withdrawals',
            icon: <MdPayment className="w-4 h-4" />,
            count: transactions.filter(t => t.type === 'WITHDRAWAL').length
        }
    ];

    if (loading) {
        return (
            <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
                <div className="flex justify-center items-center h-full">
                    <div className="text-white">Loading transactions...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Transaction History</h1>
                    <p className="text-gray-400">Manage your revenue and withdrawals</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-neutral-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-xl font-bold text-green-500">{formatVND(revenue)}</p>
                    </div>
                    <div className="bg-neutral-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Total Withdrawal</p>
                        <p className="text-xl font-bold text-blue-500">{formatVND(withdrawal)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-700 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdFilterList className="text-gray-400" />
                        <span className="text-gray-400">Filter by:</span>
                    </div>
                    <div className="flex gap-2">
                        {filterButtons.map(button => (
                            <button
                                key={button.type}
                                onClick={() => setFilter(button.type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                                    ${filter === button.type
                                        ? 'bg-neutral-600 text-white'
                                        : 'bg-neutral-800 text-gray-400 hover:bg-neutral-700 hover:text-white'
                                    }
                                `}
                            >
                                {button.icon}
                                <span>{button.label}</span>
                                <span className={`
                                    px-2 py-0.5 rounded text-xs font-medium
                                    ${filter === button.type
                                        ? 'bg-neutral-500 text-white'
                                        : 'bg-neutral-700 text-gray-400'
                                    }
                                `}>
                                    {button.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {filteredTransactions.length === 0 ? (
                    <div className="bg-neutral-700 rounded-lg p-8 text-center">
                        <MdPayment className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <h3 className="text-white text-lg font-medium mb-2">No transactions found</h3>
                        <p className="text-gray-400">There are no transactions matching your filter criteria</p>
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="bg-neutral-700 rounded-lg overflow-hidden shadow-lg hover:bg-neutral-600 transition-colors duration-200"
                        >
                            <div className="flex p-6">
                                <div className="flex-shrink-0 mr-6">
                                    {getTypeIcon(transaction.type)}
                                </div>

                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h2 className="text-xl font-semibold text-white">
                                                {transaction.type === 'REVENUE' ? 'Course Revenue' : 'Withdrawal Request'}
                                            </h2>
                                            <Badge
                                                color={getStatusColor(transaction.status)}
                                                variant="light"
                                                size="lg"
                                            >
                                                {transaction.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MdAccessTime className="w-4 h-4" />
                                                <span>
                                                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-4">
                                        <span className={`text-xl font-bold ${transaction.type === 'REVENUE' ? 'text-green-500' : 'text-blue-500'}`}>
                                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}{formatVND(transaction.amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionList; 