import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "../Header/Header";

const InstructorManagementBoard = () => {
  return (
    <div className="flex min-h-screen bg-zinc-900">
      <Header />
      <div className="flex w-full max-w-[2000px] mx-auto mt-16">
        <div className="hidden md:block fixed top-20 h-[calc(100vh-4rem)]">
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="w-full md:ml-[17%] top-20 transition-all duration-300">
          <div className="min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
export default InstructorManagementBoard;
