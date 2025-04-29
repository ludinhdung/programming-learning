import React from 'react';
import { Container, Title } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';

/**
 * Layout component for Learning Path pages
 * Provides consistent layout and navigation for learning path related pages
 */
const LearningPathLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1118]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default LearningPathLayout;
