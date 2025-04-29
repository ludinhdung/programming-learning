import React from 'react';
import { Container } from '@mantine/core';
import { Outlet } from 'react-router-dom';

/**
 * Layout cho trang quản lý Learning Path của Instructor Lead
 */
const LearningPathLayout: React.FC = () => {
  return (
    <Container className='mt-10' size="xl" py="md">
      <Outlet />
    </Container>
  );
};

export default LearningPathLayout;
