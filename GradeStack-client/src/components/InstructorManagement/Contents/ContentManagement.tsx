import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCategory, MdTimeline, MdWorkspaces } from 'react-icons/md';

const ContentManagement: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('topics');

    const tabs = [
        {
            id: 'topics',
            label: 'Topics',
            icon: MdCategory,
            title: 'Topics Management',
            description: 'Create and manage course topics',
            action: 'Manage Topics',
            path: '/instructor-lead/topics'
        },
        {
            id: 'learning-paths',
            label: 'Learning Paths',
            icon: MdTimeline,
            title: 'Learning Paths Management',
            description: 'Create and organize learning paths',
            action: 'Manage Learning Paths',
            path: '/instructor-lead/learning-paths'
        },
        {
            id: 'workshops',
            label: 'Workshops',
            icon: MdWorkspaces,
            title: 'Workshops Management',
            description: 'Organize and manage workshops',
            action: 'Manage Workshops',
            path: '/instructor-lead/workshops'
        }
    ];

    return (
        <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
            <h1 className="text-2xl font-bold text-white mb-8">Content Management</h1>

            {/* Tabs Navigation */}
            <div className="border-b border-zinc-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-400'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-neutral-700 rounded-lg shadow-lg">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`p-6 ${activeTab === tab.id ? 'block' : 'hidden'}`}
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">{tab.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-zinc-600 rounded-lg p-6 hover:shadow-lg transition-shadow bg-neutral-700">
                                <div className="flex items-center mb-4">
                                    <tab.icon className="text-4xl text-indigo-400 mr-4" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
                                        <p className="text-zinc-400">{tab.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(tab.path)}
                                    className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-700 transition-colors duration-200"
                                >
                                    {tab.action}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContentManagement; 