import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import InstructorLeadHeader from "./InstructorLeadHeader";
import React, { ReactNode, useState } from "react";

interface InstructorLeadManagementBoardProps {
  children?: ReactNode;
}

/**
 * Component chính cho dashboard của Instructor Lead
 * Hiển thị header, sidebar và nội dung chính
 */
const InstructorLeadManagementBoard: React.FC<InstructorLeadManagementBoardProps> = ({ children }) => {
  // Trạng thái thu gọn sidebar, sẽ được sử dụng khi thêm chức năng thu gọn sidebar
  const [isSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Hàm này sẽ được sử dụng khi thêm nút thu gọn sidebar trong header

  const toggleMobileSidebar = (): void => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#151922]">
      
      <div className="fixed top-0 left-0 right-0 z-40">
        <InstructorLeadHeader 
          onToggleSidebar={toggleMobileSidebar} 
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>

      <div className="flex w-full max-w-[2000px] mx-auto mt-16 pt-2">
        {/* Sidebar - Desktop */}
        <div className={`hidden md:block fixed top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <Sidebar />
        </div>
        Main content
        <div className={`w-full transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-2 px-4`}>
          <div className="min-h-[calc(100vh-5rem)]">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLeadManagementBoard;
