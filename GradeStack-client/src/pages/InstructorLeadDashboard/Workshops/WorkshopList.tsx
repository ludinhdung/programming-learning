import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Group,
  Text,
  Title,
  Badge,
  ActionIcon,
  Menu,
  Loader,
  Center,
  Stack,
  Modal,
  Flex
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconCalendarEvent,
  IconUsers,
  IconClock
} from '@tabler/icons-react';
import workshopService, { Workshop } from '../../../services/workshopService';
// Format date function
const formatDate = (dateString: string, format: string = 'dd/MM/yyyy'): string => {
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes);
};

/**
 * Component that displays Workshop list
 */
const WorkshopList: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteWorkshopId, setDeleteWorkshopId] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  /**
   * Get workshop list when component loads
   */
  useEffect(() => {
    const fetchWorkshops = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const data = await workshopService.getInstructorWorkshops(user.id);
        setWorkshops(data);
      } catch (error) {
        console.error('Error fetching workshop list:', error);
        setError('Unable to load workshop list. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  /**
   * Handle workshop deletion
   */
  const handleDeleteWorkshop = async (): Promise<void> => {
    if (!deleteWorkshopId) return;

    try {
      await workshopService.deleteWorkshop(deleteWorkshopId);
      setWorkshops(workshops.filter(workshop => workshop.id !== deleteWorkshopId));
      notifications.show({
        title: 'Success',
        message: 'Workshop deleted successfully',
        color: 'green',
      });
      close();
    } catch (error) {
      console.error('Error deleting workshop:', error);
      notifications.show({
        title: 'Error',
        message: 'Unable to delete workshop. Please try again later.',
        color: 'red',
      });
    }
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = (id: string): void => {
    setDeleteWorkshopId(id);
    open();
  };

  /**
   * Format workshop time
   */
  const formatWorkshopTime = (date: string): string => {
    return formatDate(date, 'HH:mm - dd/MM/yyyy');
  };

  /**
   * Format workshop duration
   */
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
    }

    return `${mins} minute${mins > 1 ? 's' : ''}`;
  };

  // Display loading screen while fetching data
  if (isLoading) {
    return (
      <Center style={{ width: '100%', height: '50vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading workshop list...</Text>
        </Stack>
      </Center>
    );
  }

  // Display error message if there is one
  if (error) {
    return (
      <Center style={{ width: '100%', height: '50vh' }}>
        <Stack align="center" gap="md">
          <Text color="red" size="lg">{error}</Text>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Button
          leftSection={<IconPlus size={16} />}
          component={Link}
          to="/instructor-lead/workshops/create"
        >
          Create New Workshop
        </Button>
      </Group>

      {workshops.length === 0 ? (
        <Card withBorder p="xl" radius="md">
          <Center style={{ minHeight: '200px' }}>
            <Stack align="center" gap="md">
              <IconCalendarEvent size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
              <Text size="lg" fw={500} ta="center">No workshops yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                You haven't created any workshops yet. Create your first workshop to get started.
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                component={Link}
                to="/instructor-lead/workshops/create"
              >
                Create New Workshop
              </Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <Stack gap="md">
          {workshops.map((workshop) => (
            <Card key={workshop.id} withBorder shadow="sm" radius="md" p="md">
              <Group justify="space-between" mb="md">
                <Title order={4}>{workshop.title}</Title>
                <Menu position="bottom-end" withArrow>
                  <Menu.Target>
                    <ActionIcon>
                      <IconDotsVertical size={18} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={16} />}
                      onClick={() => navigate(`/instructor-lead/workshops/${workshop.id}/edit`)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconUsers size={16} />}
                      onClick={() => navigate(`/instructor-lead/workshops/${workshop.id}/attendees`)}
                    >
                      View Attendees
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => openDeleteModal(workshop.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Text lineClamp={2} mb="md">{workshop.description}</Text>

              <Flex gap="md" wrap="wrap">
                <Badge leftSection={<IconCalendarEvent size={14} />}>
                  {formatWorkshopTime(workshop.scheduledAt)}
                </Badge>
                <Badge leftSection={<IconClock size={14} />}>
                  {formatDuration(workshop.duration)}
                </Badge>
                <Badge leftSection={<IconUsers size={14} />}>
                  {workshop.attendees?.length || 0} attendees
                </Badge>
              </Flex>
            </Card>
          ))}
        </Stack>
      )}

      {/* Delete confirmation modal */}
      <Modal opened={opened} onClose={close} title="Confirm Deletion" centered>
        <Text mb="md">Are you sure you want to delete this workshop? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button color="red" onClick={handleDeleteWorkshop}>Delete</Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default WorkshopList;