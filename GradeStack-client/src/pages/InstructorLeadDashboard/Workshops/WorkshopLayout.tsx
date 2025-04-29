import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Title } from '@mantine/core';

/**
 * Component layout cho quản lý Workshop
 */
const WorkshopLayout: React.FC = () => {
  return (
    <Box className='mt-10'>
      <Title order={2} mb="md" className='text-4xl font-bold text-white'>Workshop Management</Title>
      <Outlet />
    </Box>
  );
};

export default WorkshopLayout;
