import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
const AdminDashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-800">
      <DashboardHeader />
      <div className="flex flex-1 mt-20">
        <div className=" w-64 flex-shrink-0">
          <AdminSidebar />
        </div>
        <div className="flex-1 top-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;