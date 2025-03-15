import React from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  MdDashboard,
  MdVideoLibrary,
  MdAnalytics,
  MdPeople,
  MdSubtitles,
  MdCopyright,
  MdAttachMoney,
  MdBrush,
} from "react-icons/md";

interface NavItemProps {
  icon: IconType;
  text: string;
  href: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  text,
  href,
}) => {
  return (
    <li>
      <NavLink
        to={href}
        end
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
    { icon: MdDashboard, text: "Overview", href: "/instructor-management" },
    {
      icon: MdVideoLibrary,
      text: "Course",
      href: "/instructor-management/course",
    },
    {
      icon: MdAnalytics,
      text: "Analytics",
      href: "/instructor-management/analytics",
    },
    {
      icon: MdPeople,
      text: "Community",
      href: "/instructor-management/community",
    },
    {
      icon: MdSubtitles,
      text: "Transcription",
      href: "/instructor-management/transcription",
    },
    {
      icon: MdCopyright,
      text: "Copyright",
      href: "/instructor-management/copyright",
    },
    {
      icon: MdAttachMoney,
      text: "Monetization",
      href: "/instructor-management/monetization",
    },
    {
      icon: MdBrush,
      text: "Customization",
      href: "/instructor-management/customization",
    },
  ];

  return (
    <nav className="flex flex-col relative w-full h-screen bg-zinc-900 text-white transition-all duration-300">
      {/* Profile Section */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          <img
            src="https://scontent.fdad3-4.fna.fbcdn.net/v/t39.30808-6/449388699_2104096819991775_7469780370398069440_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=iM5ATPx-jCQQ7kNvgFCE6DY&_nc_oc=AdgxA8rEmLnqdYBA6peQuPq2J2UanBvtTG8DZ0PPV-70wvVp0_3UBNXK3NIl5cUDbBc&_nc_zt=23&_nc_ht=scontent.fdad3-4.fna&_nc_gid=AaMzoSkQDsr70Qd6th-s9Lw&oh=00_AYAbh_9m_K4zzvvkL3HWKIbEkAtrWhaY385DQnM0im3-mA&oe=67C60E18"
            alt="Channel Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <div className="text-sm text-gray-400">Instructor</div>
            <div className="font-medium">Ngoc Nhan Huynh</div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
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

export default Sidebar;
