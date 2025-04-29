import React, { useState } from 'react';
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
  Grid,
  Checkbox
} from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import workshopService, { CreateWorkshopDto } from '../../../services/workshopService';

/**
 * Component for creating a new Workshop
 */
const CreateWorkshop: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Form for managing Workshop creation data
   */
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default is tomorrow
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Event date
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Event time
      duration: 60, // Default is 60 minutes
      meetUrl: '',
      thumbnail: '',
      autoGenerateMeet: true, // Default to automatically generate Google Meet URL
    },
    validate: {
      title: (value) => (value.trim().length < 3 ? 'Title must have at least 3 characters' : null),
      description: (value) => (value.trim().length < 10 ? 'Description must have at least 10 characters' : null),
      scheduledDate: (value) => (!value ? 'Please select a date' : null),
      scheduledTime: (value) => (!value ? 'Please select a time' : null),
      duration: (value) => (value < 15 ? 'Duration must be at least 15 minutes' : null),
      meetUrl: (value, values) => (value && !value.startsWith('http') ? 'Invalid URL' : null),
    },
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: typeof form.values): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Get user information from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user.id) {
        throw new Error('User information not found');
      }
      
      // Combine date and time to create a complete timestamp
      const scheduledDate = new Date(values.scheduledDate);
      let hours = 0;
      let minutes = 0;
      
      // Process time safely
      if (values.scheduledTime instanceof Date && !isNaN(values.scheduledTime.getTime())) {
        hours = values.scheduledTime.getHours();
        minutes = values.scheduledTime.getMinutes();
      } else if (typeof values.scheduledTime === 'string') {
        // If it's a time string, try to parse it (example: "14:30")
        const timeString = values.scheduledTime as string;
        const timeParts = timeString.split(':');
        if (timeParts.length >= 2) {
          hours = parseInt(timeParts[0], 10) || 0;
          minutes = parseInt(timeParts[1], 10) || 0;
        }
      }
      
      // Create a new Date object with the combined date and time
      const combinedDateTime = new Date(scheduledDate);
      combinedDateTime.setHours(hours);
      combinedDateTime.setMinutes(minutes);
      combinedDateTime.setSeconds(0);
      combinedDateTime.setMilliseconds(0);
      
      // Check the validity of the Date object
      if (isNaN(combinedDateTime.getTime())) {
        throw new Error('Invalid time');
      }
      
      // In ra giá trị của form để kiểm tra
      console.log('Form values trước khi gửi:', values);
      console.log('autoGenerateMeet value:', values.autoGenerateMeet, typeof values.autoGenerateMeet);
      
      // Đảm bảo autoGenerateMeet là boolean (true hoặc false, không phải undefined)
      const autoGenerateMeet = values.autoGenerateMeet === true;
      console.log('autoGenerateMeet sau khi chuyển đổi:', autoGenerateMeet, typeof autoGenerateMeet);
      
      // Prepare data to send to API
      const workshopData: CreateWorkshopDto = {
        title: values.title,
        description: values.description,
        scheduledAt: combinedDateTime.toISOString(),
        duration: values.duration,
        instructorId: user.instructorId || user.id,
        meetUrl: values.meetUrl,
        thumbnail: values.thumbnail,
        autoGenerateMeet: autoGenerateMeet, // Gán giá trị đã chuyển đổi
      };
      
      // In ra dữ liệu trước khi gửi lên server
      console.log('Workshop data gửi lên server:', workshopData);
      
      // Call API to create workshop
      await workshopService.createWorkshop(workshopData);
      
      // Display success notification
      notifications.show({
        title: 'Success',
        message: 'New workshop created successfully',
        color: 'green',
      });
      
      // Redirect to workshop list page
      navigate('/instructor-lead/workshops');
    } catch (error) {
      console.error('Error creating workshop:', error);
      
      // Display error notification
      notifications.show({
        title: 'Error',
        message: 'Cannot create workshop. Please try again later.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Title order={3} mb="md">Create New Workshop</Title>
      
      <Paper withBorder p="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <LoadingOverlay visible={isSubmitting} />
          
          <Stack gap="md">
            <TextInput
              label="Workshop Title"
              placeholder="Enter workshop title"
              required
              {...form.getInputProps('title')}
            />
            
            <Textarea
              label="Description"
              placeholder="Detailed description about the workshop"
              minRows={4}
              required
              {...form.getInputProps('description')}
            />
            
            <Group grow>
              <DatePickerInput
                label="Event Date"
                placeholder="Select date"
                required
                minDate={new Date()}
                leftSection={<IconCalendar size={16} />}
                {...form.getInputProps('scheduledDate')}
              />
              
              <TimeInput
                label="Event Time"
                placeholder="Select time"
                required
                leftSection={<IconClock size={16} />}
                {...form.getInputProps('scheduledTime')}
              />
            </Group>
            
            <NumberInput
              label="Duration (minutes)"
              placeholder="Enter duration"
              required
              min={15}
              max={480}
              {...form.getInputProps('duration')}
            />
            
            <TextInput
              label="Thumbnail image URL (optional)"
              placeholder="Enter thumbnail image URL"
              {...form.getInputProps('thumbnail')}
            />
            
            <Checkbox
              label="Automatically generate Google Meet URL"
              description="The system will automatically generate a Google Meet URL for this workshop. The URL will be created after saving the workshop."
              checked={form.values.autoGenerateMeet}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const isChecked = event.currentTarget.checked;
                console.log('Checkbox thay đổi:', isChecked);
                // Đặt giá trị và đảm bảo đó là boolean
                form.setFieldValue('autoGenerateMeet', Boolean(isChecked));
                // Kiểm tra giá trị sau khi set
                setTimeout(() => {
                  console.log('autoGenerateMeet sau khi thay đổi:', form.values.autoGenerateMeet, typeof form.values.autoGenerateMeet);
                }, 0);
              }}
            />
            
            {!form.values.autoGenerateMeet && (
              <TextInput
                label="Meeting URL (optional)"
                placeholder="Enter meeting URL (Google Meet, Zoom, ...)"
                {...form.getInputProps('meetUrl')}
              />
            )}
            
            {form.values.autoGenerateMeet && (
              <Text size="sm" color="dimmed" mt="xs">
                <strong>Note:</strong> The Google Meet link will be automatically generated after you create the workshop. 
                You can view this link in the workshop details page after successful creation.
              </Text>
            )}
            
            <Text size="sm" c="dimmed">
              * All fields marked with (*) are required
            </Text>
            
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => navigate('/instructor-lead/workshops')}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Create Workshop
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateWorkshop;
