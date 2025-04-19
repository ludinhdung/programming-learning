import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IconType } from 'react-icons';
import {
    MdDashboard,
    MdAttachMoney,
    MdSupervisorAccount,
} from 'react-icons/md';

interface NavItemProps {
    icon: IconType;
    text: string;
    href: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, text, href }) => {
    return (
        <li>
            <NavLink
                to={href}
                end={text !== "Transactions"}
                className={({ isActive }) => `
          flex items-center px-4 lg:px-6 xl:px-8 py-3 text-gray-200 
          hover:bg-indigo-600 rounded-lg
          ${isActive ? "bg-zinc-700" : ""}
        `}
            >
                <Icon className="w-5 h-5 mr-4" />
                <span>{text}</span>
            </NavLink>
        </li>
    );
};

const AdminSidebar = () => {
    const [admin] = useState({
        firstName: 'Admin',
        lastName: '',
        email: 'admin@gradestack.com',
        avatar: 'https://png.pngtree.com/png-clipart/20190629/original/pngtree-vector-administration-icon-png-image_4090499.jpg',
    });

    // Navigation items for admin
    const navItems = [
        {
            icon: MdDashboard,
            text: 'Overview',
            href: '/admin',
        },
        {
            icon: MdAttachMoney,
            text: 'Transactions',
            href: '/admin/transactions',
        },
        {
            icon: MdSupervisorAccount,
            text: 'Supporter Management',
            href: '/admin/supporters',
        },
    ];

    return (
        <nav className="flex flex-col relative w-full h-screen bg-zinc-900 text-white transition-all duration-300">
            <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center space-x-3">
                    <img
                        src={admin.avatar}
                        alt="Admin Avatar"
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                        <div className="text-sm text-gray-400">Administrator</div>
                        <div className="font-medium">{`${admin.firstName} ${admin.lastName}`}</div>
                    </div>
                </div>
            </div>

            <ul className="py-4 space-y-4 text-sm">
                {navItems.map((item, index) => (
                    <NavItem
                        key={index}
                        icon={item.icon}
                        text={item.text}
                        href={item.href}
                    />
                ))}
            </ul>
        </nav>
    );
};

export default AdminSidebar; 