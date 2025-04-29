import React, { useState, useEffect } from 'react';
import { Table, Group, Text, Image, Card, ActionIcon, Loader, Badge, Box, Drawer, ScrollArea, Button, Pagination, Center, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import learningPathService from '../../../services/learningPathService';
import { Role } from '../../../types/role';
import EditLearningPath from './EditLearningPath';

/**
 * Interface definition for Learning Path
 */
interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime: number | null;
  courses: {
    id: string;
    courseId: string;
    learningPathId: string;
    order: number;
    course: any;
  }[];
  instructorUserId: string | null;
  Instructor?: any;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    courses?: number;
  };
}

/**
 * Component to display Learning Path list
 */
const LearningPathList: React.FC = () => {
  // Component state
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false);
  const [selectedLearningPathId, setSelectedLearningPathId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalLearningPaths, setTotalLearningPaths] = useState<number>(0);
  const [itemsPerPage] = useState<number>(5);
  const [isInstructorLead, setIsInstructorLead] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Fetch learning path list
   */
  const fetchLearningPaths = async (): Promise<void> => {
    try {
      console.log('fetchLearningPaths - Calling API');
      setIsLoading(true);

      // Get current user ID from localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        notifications.show({
          title: 'Error',
          message: 'User information not found',
          color: 'red'
        });
        return;
      }

      const user = JSON.parse(userData);

      // Check user data structure
      let instructorId;
      if (user.instructor && user.instructor.id) {
        instructorId = user.instructor.id;
      } else if (user.instructor && user.instructor.userId) {
        instructorId = user.instructor.userId;
      } else if (user.id) {
        instructorId = user.id;
      } else {
        notifications.show({
          title: 'Error',
          message: 'Instructor ID not found',
          color: 'red'
        });
        console.error('User data structure does not contain instructorId:', user);
        return;
      }

      console.log('InstructorId used to fetch learning paths:', instructorId);

      // Use service to fetch learning path list
      const learningPathsData = await learningPathService.getLearningPaths(instructorId);
      console.log('Learning path list result:', learningPathsData);

      // Process returned data
      const paths = Array.isArray(learningPathsData) ? learningPathsData : [];
      const total = paths.length;

      console.log('Processed learning paths data:', { paths, total });

      // Update state
      setLearningPaths(paths);
      setTotalLearningPaths(total);
    } catch (error) {
      console.error('Error fetching learning path list:', error);
      notifications.show({
        title: 'Error',
        message: 'Unable to fetch learning path list',
        color: 'red'
      });
      // When error occurs, set learningPaths to empty array
      setLearningPaths([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is an instructor lead
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsInstructorLead(user.role === Role.INSTRUCTOR_LEAD);
    }

    fetchLearningPaths();
  }, [currentPage]); // Add currentPage to dependencies to fetch again when page changes

  /**
   * Handle learning path deletion
   */
  const handleDeleteLearningPath = (learningPathId: string): void => {
    // Check if learning path has courses
    const learningPath = learningPaths.find(lp => lp.id === learningPathId);
    const courseCount = learningPath?.courses?.length || 0;

    if (courseCount > 0) {
      notifications.show({
        title: 'Cannot Delete',
        message: `Cannot delete this learning path because it has ${courseCount} linked courses`,
        color: 'red'
      });
      return;
    }

    modals.openConfirmModal({
      title: 'Confirm Delete Learning Path',
      children: (
        <Text size="sm">
          Are you sure you want to delete this learning path? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          console.log('Deleting learning path with ID:', learningPathId);

          // Get user information
          const userData = localStorage.getItem('user');
          if (!userData) {
            notifications.show({
              title: 'Error',
              message: 'Please log in to use this feature',
              color: 'red'
            });
            return;
          }

          const user = JSON.parse(userData);

          // Determine instructorId from user data
          let instructorId;
          if (user.instructor && user.instructor.id) {
            instructorId = user.instructor.id;
          } else if (user.instructor && user.instructor.userId) {
            instructorId = user.instructor.userId;
          } else if (user.id) {
            instructorId = user.id;
          } else {
            notifications.show({
              title: 'Error',
              message: 'Instructor ID not found',
              color: 'red'
            });
            console.error('User data structure does not contain instructorId:', user);
            return;
          }

          // Use service to delete learning path
          await learningPathService.deleteLearningPath(instructorId, learningPathId);

          // Update state
          setLearningPaths(learningPaths.filter(path => path.id !== learningPathId));

          notifications.show({
            title: 'Success',
            message: 'Learning path deleted successfully',
            color: 'green'
          });
        } catch (error) {
          console.error('Error deleting learning path:', error);
          notifications.show({
            title: 'Error',
            message: 'Unable to delete learning path',
            color: 'red'
          });
        }
      },
    });
  };

  /**
   * Handle opening edit learning path drawer
   */
  const handleEditLearningPath = (learningPathId: string): void => {
    // Set selectedLearningPathId first, then open drawer
    setSelectedLearningPathId(learningPathId);
    // Use setTimeout to avoid multiple renders
    setTimeout(() => {
      setIsEditDrawerOpen(true);
    }, 50);
  };

  /**
   * Handle after successful learning path update
   */
  const handleLearningPathUpdated = async (): Promise<void> => {
    console.log('handleLearningPathUpdated called');
    // Close drawer first
    setIsEditDrawerOpen(false);

    // Show success notification
    notifications.show({
      title: 'Success',
      message: 'Learning path updated successfully',
      color: 'green'
    });

    // Wait for drawer to close completely, then reset selectedLearningPathId and fetch list again
    setTimeout(async () => {
      setSelectedLearningPathId(null);
      await fetchLearningPaths();
    }, 300);
  };

  if (isLoading) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="center" py={50}>
          <Title order={2} className='text-4xl font-bold text-white'>Manage Topics</Title>
          <Loader size="md" />
          <Text size="sm">Loading learning path list...</Text>
        </Group>
      </Card>
    );
  }

  return (
    <>
      <Card shadow="sm" padding="md" radius="md" withBorder mb="md">
        <Group justify="space-between" mb="md">
          <Text fw={700} size="lg">Learning Path List</Text>
          {isInstructorLead && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate('/instructor-lead/learning-paths/create')}
              radius="md"
            >
              Create New Learning Path
            </Button>
          )}
        </Group>

        {learningPaths.length === 0 ? (
          <Text ta="center" py={30} c="dimmed">No learning paths found. Please create a new learning path!</Text>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Image</Table.Th>
                  <Table.Th>Learning Path Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Courses</Table.Th>
                  <Table.Th>Completion Time</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {learningPaths.map((learningPath) => (
                  <Table.Tr key={learningPath.id}>
                    <Table.Td>
                      <Box style={{ width: '100px', height: '56px', overflow: 'hidden', borderRadius: '4px' }}>
                        <Image
                          src={learningPath.thumbnail}
                          alt={learningPath.title}
                          height={56}
                          fit="cover"
                          fallbackSrc="https://placehold.co/100x56?text=No+Image"
                        />
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{learningPath.title}</Text>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: '300px' }}>
                      <Text lineClamp={2} size="sm" c="dimmed">{learningPath.description}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" radius="sm">{learningPath._count?.courses || learningPath.courses?.length || 0}</Badge>
                    </Table.Td>
                    <Table.Td>
                      {learningPath.estimatedCompletionTime ? (
                        <Badge color="blue" variant="light" radius="sm">
                          {learningPath.estimatedCompletionTime} minutes
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light" radius="sm">Not set</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditLearningPath(learningPath.id)}
                          aria-label="Edit"
                        >
                          <IconEdit size={16} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteLearningPath(learningPath.id)}
                          aria-label="Delete"
                        >
                          <IconTrash size={16} stroke={1.5} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Pagination */}
            {!isLoading && learningPaths.length > 0 && (
              <Center mt="xl">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={Math.ceil(totalLearningPaths / itemsPerPage)}
                  withEdges
                />
              </Center>
            )}

            {!isLoading && learningPaths.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No learning path data found. Create a new one to get started.
              </Text>
            )}
          </Box>
        )}
      </Card>

      <Drawer
        opened={isEditDrawerOpen}
        onClose={() => {
          console.log('Drawer onClose');
          setIsEditDrawerOpen(false);
          // Wait for drawer to close completely before removing selectedLearningPathId
          setTimeout(() => setSelectedLearningPathId(null), 300);
        }}
        title="Edit Learning Path"
        position="right"
        size="lg"
        padding="md"
        offset={8}
        radius="md"
        transitionProps={{ transition: 'rotate-left', duration: 150, timingFunction: 'linear' }}
        scrollAreaComponent={ScrollArea.Autosize}
        keepMounted={false} // Don't keep component in DOM when closed
      >
        {/* Only render EditLearningPathDrawer when both selectedLearningPathId and drawer are open */}
        {selectedLearningPathId && isEditDrawerOpen && (
          <EditLearningPathDrawer
            key={`edit-learning-path-${selectedLearningPathId}`}
            learningPathId={selectedLearningPathId}
            onSuccess={handleLearningPathUpdated}
            onCancel={() => {
              console.log('EditLearningPathDrawer onCancel');
              setIsEditDrawerOpen(false);
              // Wait for drawer to close completely before removing selectedLearningPathId
              setTimeout(() => setSelectedLearningPathId(null), 300);
            }}
          />
        )}
      </Drawer>
    </>
  );
};

/**
 * Component for editing learning path in Drawer
 */
interface EditLearningPathDrawerProps {
  learningPathId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditLearningPathDrawer: React.FC<EditLearningPathDrawerProps> = ({ learningPathId, onSuccess, onCancel }) => {
  console.log('Render EditLearningPathDrawer with learningPathId:', learningPathId);
  // Use state to control EditLearningPath rendering
  const [isReady, setIsReady] = useState<boolean>(false);

  // Use useEffect to log when component mounts/unmounts
  React.useEffect(() => {
    console.log('EditLearningPathDrawer mounted with learningPathId:', learningPathId);
    let mounted = true;

    // Set a short timeout to ensure drawer is displayed before rendering EditLearningPath
    // Don't call API here to avoid multiple API calls
    const timer = setTimeout(() => {
      if (mounted) setIsReady(true);
    }, 300);

    return () => {
      console.log('EditLearningPathDrawer unmounted');
      mounted = false;
      clearTimeout(timer);
    };
  }, [learningPathId]);

  // Show loading while preparing
  if (!isReady) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="center" py={50}>
          <Loader size="md" />
          <Text>Preparing...</Text>
        </Group>
      </Card>
    );
  }

  // Only render EditLearningPath when ready
  return (
    <EditLearningPath
      learningPathId={learningPathId}
      isDrawer={true}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default LearningPathList;