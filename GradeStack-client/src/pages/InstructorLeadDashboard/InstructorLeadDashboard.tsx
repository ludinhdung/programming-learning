// InstructorLeadDashboard.tsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import InstructorLeadSidebar from "./InstructorLeadSidebar";
import HeaderDashboard from "../../components/DashboardHeader/DashboardHeader";
import apiClient from "../../services/apiClient";
import { Role } from "../../types/role";

const InstructorLeadDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const response = await apiClient.auth.verify();
        const userData = response.data.user;

        // Check if the user is an Instructor Lead
        if (userData.role !== Role.INSTRUCTOR_LEAD) {
          setError('You do not have permission to access this page');
          apiClient.auth.logout();
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/instructor-lead/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  // Display loading screen while verifying authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-white">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Display error message if any
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl font-bold mb-4">{error}</div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={() => navigate('/instructor-lead/login')}
          >
            Back to login page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-900">
      <HeaderDashboard />
      <div className="flex w-full max-w-[2000px] mx-auto mt-16">
        <div className="hidden md:block fixed top-20 h-[calc(100vh-4rem)]">
          <InstructorLeadSidebar />
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

export default InstructorLeadDashboard;