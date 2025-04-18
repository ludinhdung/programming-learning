import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IconType } from "react-icons";
import {
  MdDashboard,
  MdSchool,
  MdGroups,
  MdWorkspaces,
} from "react-icons/md";
import { instructorService } from "../../services/api";
import { message } from "antd";

interface InstructorLeadData {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
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
  const [instructorLead, setInstructorLead] = useState<InstructorLeadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorLeadData = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        if (!userData) {
          message.error("User not found. Please login again.");
          return;
        }
        const user = JSON.parse(userData);
        if (user) {
          const response = await instructorService.getInstructorById(user.id);
          console.log("Instructor Lead API response:", response);

          // Kiểm tra và định dạng lại dữ liệu nếu cần
          let instructorLeadData: InstructorLeadData;

          // Nếu response có cấu trúc dữ liệu khác với InstructorData
          if (response && typeof response === "object") {
            // Xử lý tùy thuộc vào cấu trúc của API response
            if (response.data) {
              // Nếu API trả về dữ liệu trong trường data
              instructorLeadData = response.data;
            } else {
              // Thử lấy các trường cần thiết từ response
              instructorLeadData = {
                id: response.id || user.id || "",
                userId: response.userId || user.id || "",
                user: {
                  firstName:
                    response.firstName ||
                    response.user?.firstName ||
                    user.firstName ||
                    "",
                  lastName:
                    response.lastName ||
                    response.user?.lastName ||
                    user.lastName ||
                    "",
                  email:
                    response.email || response.user?.email || user.email || "",
                  avatarUrl:
                    response.avatarUrl || response.user?.avatarUrl || "",
                },
                avatar: response.avatar || response.avatarUrl || "",
                bio: response.bio || "",
              };
            }
            setInstructorLead(instructorLeadData);
          } else {
            // Nếu không có dữ liệu hợp lệ từ API
            setInstructorLead({
              id: user.id || "",
              userId: user.id || "",
              user: {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
              },
              avatar: user.avatarUrl || "",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch instructor data:", error);
        // Fallback khi có lỗi
        try {
          const userData = localStorage.getItem("user");
          if (userData) {
            const user = JSON.parse(userData);
            setInstructorLead({
              id: user.id || "",
              userId: user.id || "",
              user: {
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
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

    fetchInstructorLeadData();
  }, []);

  /**
   * Các mục điều hướng dành riêng cho Instructor Lead
   * Mỗi mục có icon, text và đường dẫn tương ứng
   */
  const navItems = [
    { 
      icon: MdDashboard, 
      text: "Overview", 
      href: "/instructor-lead-management" 
    },
    {
      icon: MdSchool,
      text: "Learning Paths",
      href: "/instructor-lead-management/learning-paths",
    },
    {
      icon: MdWorkspaces,
      text: "Workshops",
      href: "/instructor-lead-management/workshops",
    },
    {
      icon: MdGroups,
      text: "Topic",
      href: "/instructor-lead-management/topics",
    },
    {
      icon: MdGroups,
      text: "Community",
      href: "/instructor-lead-management/community",
    }
  ];

  // Tạo đường dẫn avatar
  const avatarUrl =
    instructorLead?.avatar ;

  // Cải thiện xử lý tên đầy đủ
  const fullName = instructorLead?.user
    ? `${instructorLead.user.firstName || ""} ${instructorLead.user.lastName || ""}`
    : "Instructor Lead";

  // Thêm console.log để debug
  console.log("Current instructor lead state:", instructorLead);
  console.log("Avatar URL:", avatarUrl);
  console.log("Full name:", fullName);

  return (
    <nav className="flex flex-col relative w-full h-screen bg-zinc-900 text-white transition-all duration-300">
      {/* Profile Section */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse"></div>
          ) : (
            <img
              src={avatarUrl || "/default-avatar.png"}
              alt="Instructor Lead Avatar"
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-avatar.png";
              }}
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

      {/* Navigation Items - Chỉ hiển thị các mục liên quan đến Instructor Lead */}
      <ul className="py-4 space-y-2 text-sm">
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
