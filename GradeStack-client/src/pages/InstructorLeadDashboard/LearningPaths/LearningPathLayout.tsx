import React from 'react';
import { Outlet } from 'react-router-dom';
import InstructorManagementBoard from '../../../components/InstructorManagement/InstructorManagementBoard';

const LearningPathLayout: React.FC = () => {
  return (
    <InstructorManagementBoard>
      <Outlet />
    </InstructorManagementBoard>
  );
};

export default LearningPathLayout;
