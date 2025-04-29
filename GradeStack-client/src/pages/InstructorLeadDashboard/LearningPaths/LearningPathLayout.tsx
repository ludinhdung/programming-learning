import React from 'react';
import { Container, Title } from '@mantine/core';
import { Outlet } from 'react-router-dom';

/**
 * Layout cho trang quản lý Learning Path của Instructor Lead
 */
const LearningPathLayout: React.FC = () => {
  return (
    <Container className='mt-10' size="xl" py="md">
      <Title order={2} className='text-4xl font-bold text-white mb-4'>Learning Path Management</Title>
      <Outlet />
    </Container>
  );
};

export default LearningPathLayout;
