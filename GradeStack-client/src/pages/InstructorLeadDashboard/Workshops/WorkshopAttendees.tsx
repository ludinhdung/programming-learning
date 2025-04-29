import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Group, 
  Title, 
  Paper, 
  Text, 
  Center, 
  Loader, 
  Stack,
  Table,
  Avatar,
  Badge,
  ActionIcon
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconDownload, IconMail } from '@tabler/icons-react';
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
 * Interface for attendee data
 */
interface Attendee {
  userId: string;
  attendedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Component that displays Workshop attendee list
 */
const WorkshopAttendees: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /**
   * Get Workshop info and attendee list when component loads
   */
  const fetchData = async (): Promise<void> => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Get workshop information
        const workshopData = await workshopService.getWorkshopById(id);
        setWorkshop(workshopData);
        
        // Get attendee list
        const attendeesData = await workshopService.getWorkshopAttendees(id);
        setAttendees(attendeesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Unable to load information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [id]);

  /**
   * Export attendee list to CSV
   */
  const exportToCSV = (): void => {
    if (!workshop || !attendees.length) return;
    
    // Create CSV header
    const headers = ['Full Name', 'Email', 'Registration Time'];
    
    // Create CSV data
    const data = attendees.map((attendee) => [
      `${attendee.user.firstName} ${attendee.user.lastName}`,
      attendee.user.email,
      formatDate(attendee.attendedAt, 'HH:mm - dd/MM/yyyy')
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendee-list-${workshop.title}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notifications.show({
      title: 'Success',
      message: 'Attendee list exported successfully',
      color: 'green',
    });
  };

  /**
   * Gửi email với thông tin workshop đến người tham gia
   */
  const sendEmailToAttendees = async (): Promise<void> => {
    if (!id || !workshop) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tìm thấy thông tin workshop',
        color: 'red',
      });
      return;
    }
    
    // Hiển thị cảnh báo nếu không có link Google Meet nhưng vẫn cho phép gửi email
    if (!workshop.meetUrl) {
      notifications.show({
        title: 'Cảnh báo',
        message: 'Workshop này không có link Google Meet. Email sẽ được gửi mà không có link tham gia.',
        color: 'yellow',
      });
    }

    if (!attendees.length) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không có người tham gia nào đăng ký workshop này',
        color: 'red',
      });
      return;
    }

    try {
      // Hiển thị thông báo đang gửi email
      const notificationId = notifications.show({
        loading: true,
        title: 'Đang gửi email',
        message: 'Đang gửi email thông báo với link Google Meet đến người tham gia...',
        autoClose: false,
        withCloseButton: false,
      });

      // Gọi API để gửi email
      const response = await workshopService.sendEmailToAttendees(id);

      // Cập nhật thông báo
      notifications.update({
        id: notificationId,
        title: 'Thành công',
        message: response.message || `Đã gửi email thành công đến ${attendees.length} người tham gia`,
        color: 'green',
        loading: false,
        autoClose: 5000,
      });

      // Cập nhật lại danh sách người tham gia
      fetchData();
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể gửi email. Vui lòng thử lại sau.',
        color: 'red',
      });
    }
  };

  // Display loading screen while fetching data
  if (isLoading) {
    return (
      <Center style={{ width: '100%', height: '50vh' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text>Loading information...</Text>
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
          <Button onClick={() => navigate('/instructor-lead/workshops')}>
            Back to list
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Group>
          <ActionIcon 
            variant="subtle" 
            onClick={() => navigate('/instructor-lead/workshops')}
          >
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={3}>Attendee List</Title>
        </Group>
        
        <Group>
          <Button 
            variant="outline" 
            leftSection={<IconMail size={16} />}
            onClick={sendEmailToAttendees}
            disabled={!attendees.length}
            title={!workshop?.meetUrl ? 'Email sẽ được gửi mà không có link Google Meet' : 'Gửi email thông báo với link Google Meet'}
          >
            {workshop?.meetUrl ? 'Gửi Email với Link Google Meet' : 'Gửi Email Thông Báo'}
          </Button>
          <Button 
            leftSection={<IconDownload size={16} />}
            onClick={exportToCSV}
            disabled={!attendees.length}
          >
            Export List
          </Button>
        </Group>
      </Group>
      
      {workshop && (
        <Paper withBorder p="md" radius="md" mb="md">
          <Title order={4} mb="xs">{workshop.title}</Title>
          <Text size="sm" mb="xs">{workshop.description}</Text>
          <Group>
            <Badge>
              Time: {formatDate(workshop.scheduledAt, 'HH:mm - dd/MM/yyyy')}
            </Badge>
            <Badge>
              Duration: {workshop.duration} minutes
            </Badge>
            <Badge>
              Attendees: {attendees.length}
            </Badge>
          </Group>
        </Paper>
      )}
      
      {attendees.length === 0 ? (
        <Paper withBorder p="xl" radius="md">
          <Center style={{ minHeight: '200px' }}>
            <Stack align="center" gap="md">
              <Text size="lg" fw={500} ta="center">No attendees yet</Text>
              <Text size="sm" c="dimmed" ta="center">
                This workshop doesn't have any registered attendees yet.
              </Text>
            </Stack>
          </Center>
        </Paper>
      ) : (
        <Paper withBorder radius="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No.</Table.Th>
                <Table.Th>Student</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Registration Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {attendees.map((attendee, index) => (
                <Table.Tr key={attendee.userId}>
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <Group>
                      <Avatar 
                        size="sm" 
                        color="blue" 
                        radius="xl"
                      >
                        {attendee.user.firstName.charAt(0)}{attendee.user.lastName.charAt(0)}
                      </Avatar>
                      <Text>
                        {attendee.user.firstName} {attendee.user.lastName}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{attendee.user.email}</Table.Td>
                  <Table.Td>{formatDate(attendee.attendedAt, 'HH:mm - dd/MM/yyyy')}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default WorkshopAttendees;