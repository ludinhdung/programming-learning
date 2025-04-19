import React from 'react';
import { Outlet } from 'react-router-dom';

const TopicLayout: React.FC = () => {
  return (
    <div className="instructor-lead-bg min-h-screen">
      <Outlet />
    </div>
  );
};

export default TopicLayout;
