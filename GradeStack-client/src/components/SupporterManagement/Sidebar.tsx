import React from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import { MdDashboard, MdPeople, MdPerson, MdForum } from "react-icons/md";
import { Divider } from "antd";
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
        end={text !== "Learners"}
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

const Sidebar = () => {
  const navItems = [
    { icon: MdDashboard, text: "Overview", href: "/supporter-management" },
    {
      icon: MdPerson,
      text: "Instructors",
      href: "/supporter-management/instructor",
    },
    {
      icon: MdPeople,
      text: "Learners",
      href: "/supporter-management/learner",
    },
    {
      icon: MdForum,
      text: "Community",
      href: "/supporter-management/community",
    },
  ];

  return (
    <nav className="flex flex-col relative w-full h-screen bg-zinc-900 text-white transition-all duration-300">
      {/* Profile Section */}
      <div className="px-4 pt-4">
        <div className="flex items-center space-x-3">
          <img
            src="https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/485886292_2316536695414452_3735739565780887893_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ooA0bi5ptPUQ7kNvgGIf4ju&_nc_oc=Adkbbfr5mYFV-xvpy_HbKY8WXrBDatkgJOXgXdL3LLzNaaBRxelzBoNR08h9ZRQCSD-6rhhl2UV2axLqGUYUpr2A&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=1vTgyhHIMqyFDtb2yZTVgQ&oh=00_AYGMCZoG8k6iFBHBdgdw5BhQ9YeyI2MWYiOEPrfEFRyOcw&oe=67E4892B"
            alt="Channel Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div className="flex flex-col">
            <div className="text-sm text-gray-400">Supporter</div>
            <div className="font-medium">Ngoc Nhan Huynh</div>
          </div>
        </div>
      </div>
      <Divider className="bg-gray-300"></Divider>
      {/* Navigation Items */}
      <ul className="space-y-4 text-sm">
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

export default Sidebar;
