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
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { message, Drawer } from "antd";

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

interface InstructorLeadHeaderProps {
  onToggleSidebar?: () => void;
  // isSidebarCollapsed sẽ được sử dụng khi thêm chức năng thu gọn sidebar
  isSidebarCollapsed?: boolean;
}

/**
 * Header component cho Instructor Lead Dashboard
 * Hiển thị thông tin người dùng, tìm kiếm và thông báo
 */
const InstructorLeadHeader: React.FC<InstructorLeadHeaderProps> = ({
  onToggleSidebar,
}) => {
  const [instructorLead, setInstructorLead] = useState<InstructorLeadData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; content: string; isRead: boolean }>>([
    { id: "1", content: "Có học viên mới đăng ký khóa học", isRead: false },
    { id: "2", content: "Bạn có lịch dạy mới", isRead: false },
  ]);

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

  const handleNotificationClick = (id: string) => {
    // Đánh dấu thông báo đã đọc
    setNotifications(
      notifications.map((notification) => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

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
    <header className="bg-[#1a1f2e] shadow-md w-full py-3 px-4 md:px-6 border-b border-gray-800">
      <div className="flex items-center justify-between">
        {/* Nút toggle sidebar cho mobile */}
        <div className="flex items-center">
          <button 
            onClick={onToggleSidebar}
            className="p-2 mr-2 text-gray-300 hover:text-white focus:outline-none"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="hidden md:block text-xl font-semibold text-white">
            Instructor Lead Dashboard
          </div>
        </div>

        {/* Phần tìm kiếm */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
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
          <Menu>
            <MenuButton className="relative p-2 text-gray-300 hover:text-white focus:outline-none">
              <BellIcon className="h-6 w-6" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="w-72 origin-top-right rounded-xl border border-white/5 bg-zinc-800 p-1 text-sm text-white transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50"
            >
              <div className="px-3 py-2 border-b border-zinc-700">
                <h3 className="font-semibold">Thông báo</h3>
              </div>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <MenuItem key={notification.id}>
                    <button
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`group flex w-full items-center gap-2 rounded-lg py-2 px-3 hover:bg-zinc-700 ${
                        notification.isRead ? "text-gray-400" : "text-white"
                      }`}
                    >
                      <div className="flex-1">
                        <p>{notification.content}</p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full absolute right-3"></div>
                        )}
                      </div>
                    </button>
                  </MenuItem>
                ))
              ) : (
                <div className="py-4 text-center text-gray-400">
                  Không có thông báo
                </div>
              )}
              <div className="px-3 py-2 border-t border-zinc-700">
                <a href="#" className="text-indigo-400 text-center block hover:text-indigo-300">
                  Xem tất cả
                </a>
              </div>
            </MenuItems>
          </Menu>

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
              className="w-52 origin-top-right rounded-xl border border-gray-800 bg-[#1a1f2e] p-1 text-sm text-white transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-50"
            >
              {profileMenu.map((item) => (
                <MenuItem key={item.name}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-blue-600"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <a
                      href={item.href}
                      className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 hover:bg-blue-600"
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

      {/* Thanh tìm kiếm cho mobile */}
      <div className="mt-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Mobile menu drawer */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        width={250}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ borderBottom: '1px solid #374151', background: '#1a1f2e', color: 'white' }}
      >
        <div className="flex flex-col h-full bg-[#151922]">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  {instructorLead?.user?.firstName?.[0]?.toUpperCase() || "IL"}
                </div>
              )}
              <div>
                <div className="text-sm text-gray-400">Instructor Lead</div>
                <div className="font-medium text-white">{fullName}</div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              <a href="/instructor-lead-management" className="block px-4 py-2 text-gray-300 hover:bg-[#1a1f2e] rounded-md">
                Tổng quan
              </a>
              <a href="/instructor-lead-management/course" className="block px-4 py-2 text-gray-300 hover:bg-[#1a1f2e] rounded-md">
                Khóa học
              </a>
              <a href="/instructor-lead-management/topics" className="block px-4 py-2 text-gray-300 hover:bg-[#1a1f2e] rounded-md">
                Chủ đề
              </a>
              <a href="/instructor-lead-management/learning-paths" className="block px-4 py-2 text-gray-300 hover:bg-[#1a1f2e] rounded-md">
                Lộ trình học
              </a>
              <a href="/instructor-lead-management/workshops" className="block px-4 py-2 text-gray-300 hover:bg-[#1a1f2e] rounded-md">
                Hội thảo
              </a>
            </nav>
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default InstructorLeadHeader;
