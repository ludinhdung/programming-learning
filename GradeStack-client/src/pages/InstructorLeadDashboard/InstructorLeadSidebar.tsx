// InstructorLeadSidebar.tsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  RiDashboardLine,
  RiBookmarkLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { BiCategoryAlt } from "react-icons/bi";
import apiClient from "../../services/apiClient";
import { message } from "antd";
import { Role } from "../../types/role";
import { useNavigate } from "react-router-dom";
import { RiArrowLeftLine } from "react-icons/ri";

interface InstructorLeadData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

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
        end={href === "/instructor-lead"}
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

const InstructorLeadSidebar = () => {
  const [instructorLead, setInstructorLead] = useState<InstructorLeadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorLeadData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.auth.verify();
        const userData = response.data.user;

        // Check if user is INSTRUCTOR_LEAD
        if (userData.role !== Role.INSTRUCTOR_LEAD) {
          message.error("You do not have permission to access this page");
          return;
        }

        setInstructorLead({
          id: userData.id || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          avatarUrl: userData.avatarUrl || "",
          role: userData.role
        });
      } catch (error) {
        console.error("Failed to fetch instructor lead data:", error);
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            setInstructorLead({
              id: user.id || "",
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              role: user.role
            });
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorLeadData();
  }, []);

  const navItems = [
    { icon: BiCategoryAlt, text: "Manage Topics", href: "/instructor-lead/topics" },
    { icon: RiBookmarkLine, text: "Manage Learning Paths", href: "/instructor-lead/learning-paths" },
    { icon: RiCalendarEventLine, text: "Manage Workshops", href: "/instructor-lead/workshops" },
  ];

  const avatarUrl = instructorLead?.avatarUrl;
  const fullName = instructorLead
    ? `${instructorLead.firstName || ""} ${instructorLead.lastName || ""}`
    : "Instructor Lead";

  return (
    <nav className="flex flex-col relative w-64 h-screen bg-zinc-900 text-white transition-all duration-300">
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse"></div>
          ) : (
            <img
              src={avatarUrl}
              alt="Instructor Lead Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <div className="text-sm text-gray-400">Instructor Lead</div>
            {loading ? (
              <div className="w-24 h-5 bg-slate-700 rounded animate-pulse mt-1"></div>
            ) : (
              <div className="font-medium">{fullName}</div>
            )}
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

export default InstructorLeadSidebar;