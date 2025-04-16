import React from 'react';
import { Outlet } from 'react-router-dom';
import InstructorManagementBoard from '../InstructorDashboard/InstructorDashboard';

const TopicLayout: React.FC = () => {
  return (
    <InstructorManagementBoard>
      <Outlet />
    </InstructorManagementBoard>
  );
};

export default TopicLayout;
