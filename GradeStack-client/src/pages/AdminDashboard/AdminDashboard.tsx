import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-zinc-800">
      <div className="w-64 flex-shrink-0">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;