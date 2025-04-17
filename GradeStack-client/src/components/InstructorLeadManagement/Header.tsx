import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
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

/**
 * Header component cho Instructor Lead Dashboard
 * Hiển thị thông tin người dùng, tìm kiếm và thông báo
 */
const Header: React.FC = () => {
  const [instructorLead, setInstructorLead] = useState<InstructorLeadData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage khi component được mount
    const fetchInstructorLeadData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
          return;
        }
        
        const user = JSON.parse(userData);
        if (user) {
          setInstructorLead({
            id: user.id || "",
            userId: user.id || "",
            user: {
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              email: user.email || "",
              avatarUrl: user.avatarUrl || "",
            },
            avatar: user.avatarUrl || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin Instructor Lead:", error);
      }
    };

    fetchInstructorLeadData();
  }, []);

  const handleLogout = () => {
    // Xóa thông tin người dùng và token từ localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Chuyển hướng về trang chủ
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý tìm kiếm
    console.log("Tìm kiếm:", searchQuery);
  };

  const profileMenu = [
    { name: "Hồ sơ", href: "/instructor-lead-management/profile" },
    { name: "Cài đặt", href: "/instructor-lead-management/settings" },
    { name: "Đăng xuất", onClick: handleLogout },
  ];

  // Tạo đường dẫn avatar
  const avatarUrl = instructorLead?.avatar;

  // Xử lý tên đầy đủ
  const fullName = instructorLead?.user
    ? `${instructorLead.user.firstName || ""} ${instructorLead.user.lastName || ""}`
    : "Instructor Lead";

  return (
    <header className="bg-zinc-800 shadow-md w-full py-3 px-6">
      <div className="flex items-center justify-between">
        {/* Phần tìm kiếm */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Tìm kiếm khóa học, học viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Phần thông báo và profile */}
        <div className="flex items-center space-x-4">
          {/* Nút thông báo */}
          <button className="relative p-2 text-gray-300 hover:text-white focus:outline-none">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Menu profile */}
          <Menu>
            <MenuButton className="flex items-center gap-2 rounded-md py-1.5 px-3 text-sm font-semibold text-white focus:outline-none hover:bg-zinc-700">
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm">
                    {instructorLead?.user?.firstName?.[0]?.toUpperCase() || "IL"}
                  </div>
                )}
                <span className="hidden md:inline">{fullName}</span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </div>
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="w-52 origin-top-right rounded-xl border border-white/5 bg-zinc-800 p-1 text-sm text-white transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50"
            >
              {profileMenu.map((item) => (
                <MenuItem key={item.name}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-zinc-700"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-zinc-700"
                    >
                      {item.name}
                    </a>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
