import React from 'react';
import { Container, Title, Group, Button } from '@mantine/core';
import { Outlet, useNavigate } from 'react-router-dom';
import { AiOutlinePlus } from 'react-icons/ai';

/**
 * Layout cho trang quản lý chủ đề của Instructor Lead
 */
const TopicLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className='mt-10' size="xl">
      <Group justify="space-between" mb={20}>
        <Title order={2} className='text-4xl font-bold text-white'>Manage Topics</Title>
        <Button
          leftSection={<AiOutlinePlus size={16} />}
          onClick={() => navigate('/instructor-lead/topics/create')}
        >
          Create New Topic
        </Button>
      </Group>
      <Outlet />
    </Container>
  );
};

export default TopicLayout;
