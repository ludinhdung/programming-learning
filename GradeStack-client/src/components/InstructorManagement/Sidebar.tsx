import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  MdDashboard,
  MdVideoLibrary,
  MdAnalytics,
  MdAttachMoney,
  MdCategory,
  MdTimeline,
} from "react-icons/md";
import { instructorService } from "../../services/api";
import { message } from "antd";

interface InstructorData {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role?: string;
  };
  organization?: string;
  avatar?: string;
  bio?: string;
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
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInstructorLead, setIsInstructorLead] = useState(false);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        if (!userData) {
          message.error("User not found. Please login again.");
          return;
        }
        const user = JSON.parse(userData);

        // Check if user is INSTRUCTOR_LEAD
        setIsInstructorLead(user.role === 'INSTRUCTOR_LEAD');

        if (user) {
          const response = await instructorService.getInstructorById(user.id);
          console.log("Instructor API response:", response);

          let instructorData: InstructorData;

          if (response && typeof response === "object") {
            if (response.data) {
              instructorData = response.data;
            } else {
              instructorData = {
                id: response.id || user.id || "",
                userId: response.userId || user.id || "",
                user: {
                  firstName: response.firstName || response.user?.firstName || user.firstName || "",
                  lastName: response.lastName || response.user?.lastName || user.lastName || "",
                  email: response.email || response.user?.email || user.email || "",
                  avatarUrl: response.avatarUrl || response.user?.avatarUrl || "",
                  role: user.role // Add role from localStorage
                },
                avatar: response.avatar || response.avatarUrl || "",
                bio: response.bio || "",
              };
            }
            setInstructor(instructorData);
          } else {
            setInstructor({
              id: user.id || "",
              userId: user.id || "",
              user: {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                role: user.role // Add role from localStorage
              },
              avatar: user.avatarUrl || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch instructor data:", error);
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            setInstructor({
              id: user.id || "",
              userId: user.id || "",
              user: {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                role: user.role // Add role from localStorage
              },
            });
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, []);

  // Base navigation items (available to all instructors)
  const baseNavItems = [
    { icon: MdDashboard, text: "Overview", href: "/instructor-management" },
    {
      icon: MdVideoLibrary,
      text: "Course",
      href: "/instructor-management/course",
    },
    {
      icon: MdAttachMoney,
      text: "Monetization",
      href: "/instructor-management/monetization",
    },
  ];

  // Additional items only for INSTRUCTOR_LEAD
  const leadOnlyItems = [
    {
      icon: MdCategory,
      text: "Topics",
      href: "/instructor/topics",
    },
    {
      icon: MdTimeline,
      text: "Learning Paths",
      href: "/instructor/learning-paths",
    },
    {
      icon: MdAnalytics,
      text: "Course Verification",
      href: "/instructor-management/verify-courses",
    },
  ];

  // Combine navigation items based on role
  const navItems = isInstructorLead ? [...baseNavItems, ...leadOnlyItems] : baseNavItems;

  const avatarUrl = instructor?.avatar;
  const fullName = instructor?.user
    ? `${instructor.user.firstName || ""} ${instructor.user.lastName || ""}`
    : "Instructor";

  return (
    <nav className="flex flex-col relative w-full h-screen bg-zinc-900 text-white transition-all duration-300">
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse"></div>
          ) : (
            <img
              src={avatarUrl}
              alt="Instructor Avatar"
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <div className="text-sm text-gray-400">
              {isInstructorLead ? 'Instructor Lead' : 'Instructor'}
            </div>
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

export default Sidebar;
