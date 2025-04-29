import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Group, 
  TextInput, 
  Textarea, 
  NumberInput, 
  Stack,
  Title,
  Paper,
  LoadingOverlay,
  Text,
  Center,
  Loader,
  Checkbox,
  Anchor
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate, useParams } from 'react-router-dom';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import workshopService, { UpdateWorkshopDto, Workshop } from '../../../services/workshopService';

/**
 * Component for editing Workshop
 */
const EditWorkshop: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Store workshop information for display and editing
  const [, setWorkshop] = useState<Workshop | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  /**
   * Form for managing Workshop edit data
   */
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      scheduledAt: new Date(),
      duration: 60,
      meetUrl: '',
      thumbnail: '',
      autoGenerateMeet: false,
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Title must have at least 3 characters' : null),
      description: (value) => (value.trim().length < 10 ? 'Description must have at least 10 characters' : null),
      scheduledAt: (value) => (!value ? 'Please select a time' : null),
      duration: (value) => (value < 15 ? 'Duration must be at least 15 minutes' : null),
      meetUrl: (value) => (value && !value.startsWith('http') ? 'Invalid URL' : null),
    },
  });

  /**
   * Get Workshop information when component loads
   */
  useEffect(() => {
    const fetchWorkshop = async (): Promise<void> => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await workshopService.getWorkshopById(id);
        setWorkshop(data);
        
        // Update form values
        form.setValues({
          title: data.title,
          description: data.description,
          scheduledAt: new Date(data.scheduledAt),
          duration: data.duration,
          meetUrl: data.meetUrl || '',
          thumbnail: data.thumbnail || '',
          autoGenerateMeet: data.autoGenerateMeet || false,
        });
      } catch (error) {
        console.error('Error fetching workshop information:', error);
        setError('Unable to load workshop information. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: typeof form.values): Promise<void> => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare data to send to API
      const workshopData: UpdateWorkshopDto = {
        title: values.title,
        description: values.description,
        scheduledAt: values.scheduledAt.toISOString(),
        duration: values.duration,
        meetUrl: values.meetUrl,
        thumbnail: values.thumbnail,
        autoGenerateMeet: values.autoGenerateMeet,
      };
      
      // Call API to update workshop
      await workshopService.updateWorkshop(id, workshopData);
      
      // Display success notification
      notifications.show({
        title: 'Success',
        message: 'Workshop updated successfully',
        color: 'green',
      });
      
      // Navigate to workshop list page
      navigate('/instructor-lead/workshops');
    } catch (error) {
      console.error('Error updating workshop:', error);
      
      // Display error notification
      notifications.show({
        title: 'Error',
        message: 'Unable to update workshop. Please try again later.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display loading screen while fetching data
  if (isLoading) {
    return (
      <Center style={{ width: '100%', height: '50vh' }}>
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading workshop information...</Text>
        </Stack>
      </Center>
    );
  }

  // Display error message if there is one
  if (error) {
    return (
      <Center style={{ width: '100%', height: '50vh' }}>
        <Stack align="center">
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
      <Title order={3} mb="md">Edit Workshop</Title>
      
      <Paper withBorder p="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isSubmitting} />
          
          <Stack gap="md">
            <TextInput
              label="Title"
              placeholder="Enter workshop title"
              required
              {...form.getInputProps('title')}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter detailed description about the workshop"
              minRows={4}
              required
              {...form.getInputProps('description')}
            />
            
            <DateTimePicker
              label="Scheduled Time"
              placeholder="Select time"
              required
              minDate={new Date()}
              leftSection={<IconCalendar size={16} />}
              {...form.getInputProps('scheduledAt')}
            />
            
            <NumberInput
              label="Duration (minutes)"
              placeholder="Enter duration"
              required
              min={15}
              max={480}
              leftSection={<IconClock size={16} />}
              {...form.getInputProps('duration')}
            />
            
            <TextInput
              label="Thumbnail image URL (optional)"
              placeholder="Enter thumbnail image URL"
              {...form.getInputProps('thumbnail')}
            />
            
            <Checkbox
              label="Automatically generate Google Meet URL"
              description="The system will automatically generate a Google Meet URL for this workshop"
              checked={form.values.autoGenerateMeet}
              onChange={(event) => form.setFieldValue('autoGenerateMeet', event.currentTarget.checked)}
            />
            
            {form.values.meetUrl && (
              <Box mb="md">
                <Text size="sm" fw={500}>Current Google Meet link:</Text>
                <Anchor href={form.values.meetUrl} target="_blank" rel="noopener noreferrer">
                  {form.values.meetUrl}
                </Anchor>
              </Box>
            )}
            
            {!form.values.autoGenerateMeet && (
              <TextInput
                label="Meeting URL (optional)"
                placeholder="Enter meeting URL (Google Meet, Zoom, ...)"
                {...form.getInputProps('meetUrl')}
              />
            )}
            
            <Text size="sm" c="dimmed">
              * All fields marked with (*) are required
            </Text>
            
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => navigate('/instructor-lead/workshops')}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Update
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default EditWorkshop;