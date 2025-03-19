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
        end={text !== "Course"}
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
            src="https://scontent.fhan5-3.fna.fbcdn.net/v/t39.30808-6/449388699_2104096819991775_7469780370398069440_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=EWbkPzkg7V0Q7kNvgGraLcP&_nc_oc=Adinrs0kN3es660Ugjd3tV_6HJzmsgmybGldXv7mU2yU2z5HaEzrP0VewuM3NBrO3MiQWJ3fOvwm0GOqT4BfyA_U&_nc_zt=23&_nc_ht=scontent.fhan5-3.fna&_nc_gid=if9aZi9I-W1QpHYOpb5pSQ&oh=00_AYEKqJfcV9-f2-pPnFbfjIj03np3teTf277MoAX5dey-uw&oe=67DAEDD8"
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
