import { Outlet } from 'react-router-dom';

/**
 * Layout chung cho các trang quản lý workshop trong InstructorDashboard
 */
const WorkshopLayout = () => {
  return (
    <div className="workshop-management">
      <Outlet />
    </div>
  );
};

export default WorkshopLayout;
