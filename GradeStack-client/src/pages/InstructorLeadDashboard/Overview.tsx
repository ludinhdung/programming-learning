import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, Text, Group, RingProgress, SimpleGrid, Title, Button, Stack } from '@mantine/core';
import { BiCategoryAlt } from 'react-icons/bi';
import { RiBookmarkLine, RiCalendarEventLine, RiUserLine, RiArrowRightLine } from 'react-icons/ri';
import instructorLeadService from '../../services/instructorLeadService';
import { Link } from 'react-router-dom';

/**
 * Component displaying overview for Instructor Lead
 */
const Overview: React.FC = () => {
  const [stats, setStats] = useState({
    totalTopics: 0,
    totalInstructors: 0,
    totalLearningPaths: 0,
    totalWorkshops: 0
  });

  /**
   * Fetch statistics data when component is mounted
   */
  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        // In reality, you would call an API to get statistical data
        // Here we simulate by getting the number of topics and instructors
        const topics = await instructorLeadService.getAllTopics();
        const instructors = await instructorLeadService.getAllInstructors();
        
        setStats({
          totalTopics: topics.length,
          totalInstructors: instructors.length,
          totalLearningPaths: 5, // Giả lập dữ liệu
          totalWorkshops: 3 // Giả lập dữ liệu
        });
      } catch (error) {
        console.error('Error fetching statistics data:', error);
      }
    };

    fetchStats();
  }, []);

  /**
   * Statistic cards
   */
  const statCards = [
    {
      title: 'Total Topics',
      value: stats.totalTopics,
      icon: <BiCategoryAlt size={30} />,
      color: 'blue'
    },
    {
      title: 'Total Instructors',
      value: stats.totalInstructors,
      icon: <RiUserLine size={30} />,
      color: 'green'
    },
    {
      title: 'Total Learning Paths',
      value: stats.totalLearningPaths,
      icon: <RiBookmarkLine size={30} />,
      color: 'orange'
    },
    {
      title: 'Total Workshops',
      value: stats.totalWorkshops,
      icon: <RiCalendarEventLine size={30} />,
      color: 'grape'
    }
  ];

  return (
    <Container size="xl">
      <Title order={2} mb={30}>Overview</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb={30}>
        {statCards.map((stat, index) => (
          <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <RingProgress
                size={80}
                thickness={8}
                roundCaps
                sections={[{ value: 100, color: stat.color }]}
                label={
                  <Group justify="center">
                    {stat.icon}
                  </Group>
                }
              />
              <div>
                <Text fw={700} size="xl">{stat.value}</Text>
                <Text size="sm" c="dimmed">{stat.title}</Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
      
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb={15}>Learning Path Management</Title>
            <Text c="dimmed" mb={15}>
              Only Instructor Lead has the permission to create and edit learning paths. Manage learning paths and arrange courses within the path.
            </Text>
            <Stack align="flex-start">
              <Button fullWidth component={Link} to="/instructor-lead/learning-paths" rightSection={<RiArrowRightLine />}>
                Manage Learning Paths
              </Button>
              <Button fullWidth component={Link} to="/instructor-lead/learning-paths/create" variant="light" rightSection={<RiArrowRightLine />}>
                Create New Learning Path
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Title order={3} mb={15}>Topic Management</Title>
            <Text c="dimmed" mb={15}>
              Manage topics for courses on the platform. Create, edit, and delete topics.
            </Text>
            <Stack align="flex-start">
              <Button fullWidth component={Link} to="/instructor-lead/topics" rightSection={<RiArrowRightLine />}>
                Manage Topics
              </Button>
              <Button fullWidth component={Link} to="/instructor-lead/topics/create" variant="light" rightSection={<RiArrowRightLine />}>
                Create New Topic
              </Button>
            </Stack>
            
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Overview;
