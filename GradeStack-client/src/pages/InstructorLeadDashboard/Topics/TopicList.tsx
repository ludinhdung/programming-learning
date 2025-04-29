import React, { useState, useEffect } from 'react';
import { Table, Group, Text, Image, Card, ActionIcon, Loader, Badge, Box, Drawer, ScrollArea, Button, Pagination, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { Topic } from '../../../services/topicService';
import EditTopic from './EditTopic';

/**
 * Component that displays topic list for Instructor Lead
 */
const TopicList: React.FC = () => {
  // Component state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editDrawerOpened, setEditDrawerOpened] = useState<boolean>(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalTopics, setTotalTopics] = useState<number>(0);
  const [itemsPerPage] = useState<number>(5);
  const navigate = useNavigate();
  
  /**
   * Fetch topic list
   */
  const fetchTopics = async (): Promise<void> => {
    try {
      console.log('fetchTopics - Calling getAllTopics');
      setLoading(true);
      
      // Calculate pagination
      const page = currentPage || 1;
      const limit = itemsPerPage;
      const offset = (page - 1) * limit;
      
      // Call API directly instead of using service
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/instructor-lead/topics?action=list&page=${page}&limit=${limit}`;
      console.log('API URL:', apiUrl);
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Topic list result:', responseData);
      
      // Process data structure returned from API
      let topicsData = [];
      let total = 0;
      
      if (responseData.success && responseData.data) {
        // Case: API returns structure { success: true, data: { data: [...], total, page, limit } }
        if (responseData.data.data && Array.isArray(responseData.data.data)) {
          topicsData = responseData.data.data;
          total = responseData.data.total || topicsData.length;
        } 
        // Case: API returns structure { success: true, data: [...] }
        else if (Array.isArray(responseData.data)) {
          topicsData = responseData.data;
          total = topicsData.length;
        }
      } else if (Array.isArray(responseData)) {
        // Case: API returns array directly
        topicsData = responseData;
        total = topicsData.length;
      }
      
      console.log('Processed topics data:', { topicsData, total });
      
      // Ensure topicsData is always an array
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setTotalTopics(total);
    } catch (error) {
      console.error('Error fetching topic list:', error);
      notifications.show({
        title: 'Error',
        message: 'Unable to fetch topic list',
        color: 'red'
      });
      // When error occurs, set topics to empty array
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [currentPage]); // Add currentPage to dependencies to fetch again when page changes

  /**
   * Handle topic deletion
   */
  const handleDeleteTopic = (topicId: string): void => {
    modals.openConfirmModal({
      title: 'Confirm Delete Topic',
      children: (
        <Text size="sm">
          Are you sure you want to delete this topic? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          console.log('Deleting topic with ID:', topicId);
          
          // Call API directly instead of using service
          const apiUrl = `${import.meta.env.VITE_API_URL}/api/instructor-lead/topics/${topicId}?action=delete`;
          console.log('API URL:', apiUrl);
          
          const token = localStorage.getItem('token');
          console.log('Token available:', !!token);
          
          const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }
          
          // Update state
          setTopics(topics.filter(topic => topic.id !== topicId));
          
          notifications.show({
            title: 'Success',
            message: 'Topic deleted successfully',
            color: 'green'
          });
        } catch (error) {
          console.error('Error deleting topic:', error);
          notifications.show({
            title: 'Error',
            message: 'Unable to delete topic',
            color: 'red'
          });
        }
      },
    });
  };
  
  /**
   * Handle opening edit topic drawer
   */
  const handleEditTopic = (topicId: string): void => {
    // Set selectedTopicId first, then open drawer
    // This ensures that EditTopicDrawer will have topicId when rendered
    setSelectedTopicId(topicId);
    // Use setTimeout to avoid multiple renders
    setTimeout(() => {
      setEditDrawerOpened(true);
    }, 50);
  };
  
  /**
   * Handle after successful topic update
   */
  const handleTopicUpdated = async (): Promise<void> => {
    console.log('handleTopicUpdated called');
    // Close drawer first
    setEditDrawerOpened(false);
    
    // Show success notification
    notifications.show({
      title: 'Success',
      message: 'Topic updated successfully',
      color: 'green'
    });
    
    // Wait for drawer to close completely, then reset selectedTopicId and fetch list again
    setTimeout(async () => {
      setSelectedTopicId(null);
      await fetchTopics();
    }, 300);
  };

  if (loading) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="center" py={50}>
          <Loader size="md" />
          <Text size="sm">Loading topic list...</Text>
        </Group>
      </Card>
    );
  }

  return (
    <>
      <Card shadow="sm" padding="md" radius="md" withBorder mb="md">
        {topics.length === 0 ? (
          <Text ta="center" py={30} c="dimmed">No topics found. Please create a new topic!</Text>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <Table striped highlightOnHover verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Image</Table.Th>
                  <Table.Th>Topic Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Courses</Table.Th>
                  <Table.Th>Created By</Table.Th>
                  <Table.Th style={{ width: '120px' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topics.map((topic) => (
                  <Table.Tr key={topic.id}>
                    <Table.Td>
                      <Box style={{ width: '100px', height: '56px', overflow: 'hidden', borderRadius: '4px' }}>
                        <Image
                          src={topic.thumbnail}
                          alt={topic.name}
                          height={56}
                          fit="cover"
                          fallbackSrc="https://placehold.co/100x56?text=No+Image"
                        />
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{topic.name}</Text>
                    </Table.Td>
                    <Table.Td style={{ maxWidth: '300px' }}>
                      <Text lineClamp={2} size="sm" c="dimmed">{topic.description}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" radius="sm">{topic._count?.courses || 0}</Badge>
                    </Table.Td>
                    <Table.Td>
                      {topic.Instructor?.user ? (
                        <Badge color="blue" variant="light" radius="sm">
                          {topic.Instructor.user.firstName} {topic.Instructor.user.lastName}
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light" radius="sm">Not assigned</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="center">
                        <ActionIcon 
                          variant="light" 
                          color="blue" 
                          onClick={() => handleEditTopic(topic.id)}
                          aria-label="Edit"
                        >
                          <IconEdit size={16} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon 
                          variant="light" 
                          color="red" 
                          onClick={() => handleDeleteTopic(topic.id)}
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
            {!loading && topics.length > 0 && (
              <Center mt="xl">
                <Pagination 
                  value={currentPage} 
                  onChange={setCurrentPage} 
                  total={Math.ceil(totalTopics / itemsPerPage)} 
                  withEdges
                  position="center"
                />
              </Center>
            )}
            
            {!loading && topics.length === 0 && (
              <Text c="dimmed" ta="center" py="xl">
                No topic data found. Create a new one to get started.
              </Text>
            )}
          </Box>
        )}
      </Card>
      
      <Drawer
        opened={editDrawerOpened}
        onClose={() => {
          console.log('Drawer onClose');
          setEditDrawerOpened(false);
          // Wait for drawer to close completely before removing selectedTopicId
          setTimeout(() => setSelectedTopicId(null), 300);
        }}
        title="Edit Topic"
        position="right"
        size="lg"
        padding="md"
        offset={8}
        radius="md"
        transitionProps={{ transition: 'rotate-left', duration: 150, timingFunction: 'linear' }}
        scrollAreaComponent={ScrollArea.Autosize}
        keepMounted={false} // Don't keep component in DOM when closed
      >
        {/* Only render EditTopicDrawer when both selectedTopicId and drawer are open */}
        {selectedTopicId && editDrawerOpened && (
          <EditTopicDrawer 
            key={`edit-topic-${selectedTopicId}`} 
            topicId={selectedTopicId} 
            onSuccess={handleTopicUpdated} 
            onCancel={() => {
              console.log('EditTopicDrawer onCancel');
              setEditDrawerOpened(false);
              // Wait for drawer to close completely before removing selectedTopicId
              setTimeout(() => setSelectedTopicId(null), 300);
            }} 
          />
        )}
      </Drawer>
    </>
  );
};

/**
 * Component for editing topic in Drawer
 */
interface EditTopicDrawerProps {
  topicId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditTopicDrawer: React.FC<EditTopicDrawerProps> = ({ topicId, onSuccess, onCancel }) => {
  console.log('Render EditTopicDrawer with topicId:', topicId);
  // Use state to control EditTopic rendering
  const [isReady, setIsReady] = useState<boolean>(false);
  
  // Use useEffect to log when component mounts/unmounts
  React.useEffect(() => {
    console.log('EditTopicDrawer mounted with topicId:', topicId);
    let mounted = true;
    
    // Set a short timeout to ensure drawer is displayed before rendering EditTopic
    // Don't call API here to avoid multiple API calls
    const timer = setTimeout(() => {
      if (mounted) setIsReady(true);
    }, 300);
    
    return () => {
      console.log('EditTopicDrawer unmounted');
      mounted = false;
      clearTimeout(timer);
    };
  }, [topicId]);
  
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
  
  // Only render EditTopic when ready
  return (
    <EditTopic 
      topicId={topicId} 
      isDrawer={true} 
      onSuccess={onSuccess} 
      onCancel={onCancel} 
    />
  );
};

export default TopicList;