import React from 'react';
import { MdAttachMoney, MdSupervisorAccount, MdAccountBalance } from 'react-icons/md';

const Overview = () => {
    const stats = [
        {
            title: 'Total Transactions',
            value: '$124,592.00',
            icon: MdAttachMoney,
            change: '+14%',
            changeType: 'increase'
        },
        {
            title: 'Active Supporters',
            value: '24',
            icon: MdSupervisorAccount,
            change: '+2',
            changeType: 'increase'
        },
        {
            title: 'Pending Withdrawals',
            value: '$23,592.00',
            icon: MdAccountBalance,
            change: '8',
            changeType: 'neutral'
        },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-zinc-800 p-6 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                                </div>
                                <div className="bg-zinc-700 p-3 rounded-lg">
                                    <Icon className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className={`text-sm ${stat.changeType === 'increase' ? 'text-green-400' :
                                        stat.changeType === 'decrease' ? 'text-red-400' : 'text-gray-400'
                                    }`}>
                                    {stat.change}
                                </span>
                                <span className="text-gray-400 text-sm ml-2">vs last month</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Overview; 