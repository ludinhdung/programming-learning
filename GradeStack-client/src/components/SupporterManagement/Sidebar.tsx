import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import { MdDashboard, MdPeople, MdPerson } from "react-icons/md";
import { Divider, Skeleton } from "antd";
import SupporterAvatar from "../../assets/images/supporter_image.webp";
import { supporterService } from "../../services/api";

interface NavItemProps {
  icon: IconType;
  text: string;
  href: string;
}

interface SupporterInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
  const [supporter, setSupporter] = useState<SupporterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporterInfo = async () => {
      try {
        // Lấy ID của supporter hiện tại từ localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (user && user.id) {
          // Gọi API để lấy thông tin supporter
          const response = await supporterService.getSupporterById(user.id);
          setSupporter(response.data);
        }
      } catch (error) {
        console.error("Error fetching supporter info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporterInfo();
  }, []);

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
  ];

  return (
    <nav className="flex flex-col relative w-64 h-screen bg-zinc-900 text-white transition-all duration-300">
      {/* Profile Section */}
      <div className="px-4 pt-4">
        <div className="flex items-center space-x-3">
          <img
            src={SupporterAvatar}
            alt="Supporter Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div className="flex flex-col">
            <div className="text-sm text-gray-400">Supporter</div>
            {loading ? (
              <Skeleton.Input active size="small" className="bg-gray-700" />
            ) : (
              <div className="font-medium">
                {supporter
                  ? `${supporter.firstName} ${supporter.lastName}`
                  : "Loading..."}
              </div>
            )}
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
