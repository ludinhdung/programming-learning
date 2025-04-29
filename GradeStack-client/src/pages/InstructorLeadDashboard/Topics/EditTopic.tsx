import React, { useState, useEffect } from 'react';
import { Card, Group, Text, Image, Loader, TextInput, Textarea, FileInput, Button, Box, Stack, Title, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPhoto, IconDeviceFloppy, IconArrowLeft, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Topic, TopicUpdateData } from '../../../services/topicService';

/**
 * Props for EditTopic component
 */
interface EditTopicProps {
  topicId?: string;
  isDrawer?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Component for editing topics for Instructor Lead
 */
const EditTopic: React.FC<EditTopicProps> = ({ topicId, isDrawer = false, onSuccess, onCancel }) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id: string }>();
  const id = topicId || paramId;

  // Check access permissions if not in drawer
  React.useEffect(() => {
    if (isDrawer) return;
    
    const userData: string | null = localStorage.getItem('user');
    if (!userData) {
      notifications.show({
        title: 'Error',
        message: 'You need to log in to use this feature!',
        color: 'red'
      });
      navigate('/');
      return;
    }
    const user: { role?: string } = JSON.parse(userData);
    if (user.role !== 'INSTRUCTOR_LEAD') {
      notifications.show({
        title: 'Error',
        message: 'Only Instructor Lead can edit topics!',
        color: 'red'
      });
      navigate('/');
    }
  }, [isDrawer, navigate]);

  /**
   * Form for managing topic data
   */
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      thumbnail: ''
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Topic name cannot be empty' : null),
      description: (value) => (value.trim().length === 0 ? 'Description cannot be empty' : null),
      thumbnail: (value) => (value.trim().length === 0 ? 'Image cannot be empty' : null)
    }
  });
  
  // Log form values when changed for debugging
  useEffect(() => {
    console.log('Form values changed:', form.values);
  }, [form.values]);

  /**
   * Get topic information when component is mounted
   */
  // Use useRef to track API calls
  const fetchingRef = React.useRef<boolean>(false);
  const fetchedIdRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    // Variable to track if component is mounted
    let isMounted = true;
    console.log('useEffect fetchTopic called with id:', id);
    
    // Check if already fetching or already fetched for this id
    if (fetchingRef.current || (id && fetchedIdRef.current === id)) {
      console.log('Skipping fetchTopic because already fetching or already fetched for this id:', id);
      return;
    }
    
    // Reset state when component mounts
    setLoading(true);
    setTopic(null);
    setThumbnailPreview(null);
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    
    const fetchTopic = async (): Promise<void> => {
      if (!id) {
        console.log('No ID, skipping fetchTopic');
        if (isMounted) setLoading(false);
        return;
      }
      
      // Mark as fetching
      fetchingRef.current = true;
      
      try {
        console.log('Starting to fetch topic with id:', id);
        
        // Call API directly instead of using service
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/instructor-lead/topics/${id}?action=get`;
        console.log('API URL:', apiUrl);
        
        const token = localStorage.getItem('token');
        console.log('Token available:', !!token);
        
        const controller = new AbortController();
        const signal = controller.signal;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal // Add signal to be able to cancel request if needed
        });
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Topic information result:', result);
        
        // Check again if component is still mounted
        if (!isMounted) return;
        
        if (!result) {
          throw new Error('No response received from server');
        }
        
        // Get topic data from response
        const topicData = result.data || result;
        
        if (!topicData) {
          throw new Error('No topic data received from server');
        }
        
        // Create valid Topic object
        const validTopic: Topic = {
          id: topicData.id || id,
          name: topicData.name || '',
          description: topicData.description || '',
          thumbnail: topicData.thumbnail || '',
          createdAt: topicData.createdAt,
          updatedAt: topicData.updatedAt,
          _count: topicData._count,
          instructor: topicData.instructor,
          courses: topicData.courses
        };
        
        console.log('Valid topic:', validTopic);
        
        // Update state if component is still mounted
        if (isMounted) {
          setTopic(validTopic);
          setThumbnailPreview(validTopic.thumbnail);
          
          // Update form
          form.setValues({
            name: validTopic.name,
            description: validTopic.description,
            thumbnail: validTopic.thumbnail || '',
          });
          
          console.log('Form values after set:', {
            name: validTopic.name,
            description: validTopic.description,
            thumbnail: validTopic.thumbnail,
          });
          
          // Mark as successfully fetched for this id
          fetchedIdRef.current = id;
        }
      } catch (error) {
        // Check if component is still mounted
        if (!isMounted) return;
        
        console.error('Error fetching topic information:', error);
        notifications.show({
          title: 'Error',
          message: `Unable to fetch topic information: ${error instanceof Error ? error.message : 'Unknown error'}`,
          color: 'red'
        });
        if (!isDrawer) {
          navigate('/instructor-lead/topics');
        }
      } finally {
        // Update loading state if component is still mounted
        if (isMounted) {
          setLoading(false);
          fetchingRef.current = false; // Mark fetching as completed
        }
      }
    };

    // Use setTimeout to avoid calling API repeatedly
    const timer = setTimeout(() => {
      fetchTopic();
    }, 300); // Increase wait time to avoid too many API calls
    
    // Cleanup function
    return () => {
      console.log('useEffect cleanup - component unmount');
      isMounted = false; // Mark component as unmounted
      clearTimeout(timer); // Cancel timer to avoid API calls when component unmounts
    };
  }, [id, navigate, form, isDrawer]);

  /**
   * Validate before upload
   */
  const validateFile = (file: File): boolean => {
    // Log file information for debugging
    console.log('File information:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notifications.show({
        title: 'Error',
        message: 'You can only upload JPG/PNG files!',
        color: 'red'
      });
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notifications.show({
        title: 'Error',
        message: 'Image must be smaller than 2MB!',
        color: 'red'
      });
      return false;
    }
    return true; // Allow upload to continue
  };

  /**
   * Handle image upload to server
   */
  const handleUpload = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(0);
      console.log('Starting image upload:', file.name, file.type, file.size);
      
      // Ensure file is valid
      if (!file) {
        throw new Error('Invalid file');
      }
      
      // Simulate upload progress
      const simulateProgress = () => {
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(interval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      try {
        // Create FormData to send file
        const formData = new FormData();
        formData.append('image', file);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        console.log('Upload token available:', !!token);
        
        // Create URL for API endpoint
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/images/upload`;
        console.log('Upload API URL:', apiUrl);
        
        // Call API directly instead of using service
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error response:', errorText);
          throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Image upload result:', result);
        
        if (!result) {
          throw new Error('No response received from server');
        }
        
        // Get image URL from response
        const imageUrl = result.imageUrl || (result.data && result.data.imageUrl);
        if (!imageUrl) {
          throw new Error('Image URL not found in response');
        }
        
        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Update preview with real URL from server
        setThumbnailPreview(imageUrl);
        
        // Update form with real URL from server
        form.setFieldValue('thumbnail', imageUrl);
        console.log('Updated thumbnail in form:', imageUrl);
        
        console.log('Uploaded image URL:', imageUrl);
        return imageUrl;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      notifications.show({
        title: 'Error',
        message: `Unable to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red'
      });
      throw error;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  /**
   * Handle when user selects an image file
   */
  const handleFileChange = async (file: File | null): Promise<void> => {
    // Remove selected file if no new file
    if (!file) {
      setSelectedFile(null);
      // Keep old thumbnail if available
      if (topic?.thumbnail) {
        setThumbnailPreview(topic.thumbnail);
        form.setFieldValue('thumbnail', topic.thumbnail);
      } else {
        setThumbnailPreview(null);
        form.setFieldValue('thumbnail', '');
      }
      console.log('File removed, current thumbnail:', form.values.thumbnail);
      return;
    }
    
    // Save selected file to state
    setSelectedFile(file);
    console.log('File selected:', file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);
    
    try {
      // Validate file before upload
      if (!validateFile(file)) {
        setSelectedFile(null);
        return;
      }
      
      // Show preview before upload
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      // Show uploading notification
      notifications.show({
        title: 'Processing',
        message: 'Uploading image...',
        color: 'blue',
        loading: true,
        autoClose: false,
        id: 'upload-image'
      });
      
      // Upload file to server
      const imageUrl = await handleUpload(file);
      console.log('Image URL after upload:', imageUrl);
      
      // Close uploading notification and show success notification
      notifications.hide('upload-image');
      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
      
      // Ensure image URL is updated in form
      form.setFieldValue('thumbnail', imageUrl);
      console.log('Updated thumbnail in form after successful upload:', imageUrl);
    } catch (error) {
      console.error('Error processing image file:', error);
      
      // Close uploading notification
      notifications.hide('upload-image');
      
      // Show error notification
      notifications.show({
        title: 'Error',
        message: 'Unable to upload image',
        color: 'red'
      });
      
      // If there's an error and there's an old thumbnail, use it again
      if (topic?.thumbnail) {
        setThumbnailPreview(topic.thumbnail);
        form.setFieldValue('thumbnail', topic.thumbnail);
      } else {
        // Use placeholder URL if no old thumbnail
        const fallbackUrl = 'https://placehold.co/600x400?text=No+Image';
        setThumbnailPreview(fallbackUrl);
        form.setFieldValue('thumbnail', fallbackUrl);
      }
      
      // Reset selected file so user can select again
      setSelectedFile(null);
    }
  };

  /**
   * Handle topic update
   */
  const handleSubmit = async (values: TopicUpdateData): Promise<void> => {
    if (!id) return;
    
    // Log form data before sending
    console.log('Form data before sending:', values);
    
    setSubmitting(true);
    try {
      // Ensure thumbnail is sent
      const dataToSubmit: TopicUpdateData = {
        ...values,
        thumbnail: values.thumbnail || ''
      };
      
      // Check if no new thumbnail and no old thumbnail
      if (!dataToSubmit.thumbnail && topic?.thumbnail) {
        dataToSubmit.thumbnail = topic.thumbnail;
      }
      
      // Ensure thumbnail is never an empty string
      if (!dataToSubmit.thumbnail) {
        notifications.show({
          title: 'Error',
          message: 'Image cannot be empty',
          color: 'red'
        });
        setSubmitting(false);
        return;
      }
      
      console.log('Data to submit:', dataToSubmit);
      
      // Create URL for API endpoint
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/instructor-lead/topics/${id}?action=update`;
      console.log('API URL:', apiUrl);
      
      // Prepare data to send
      const requestData = {
        name: dataToSubmit.name,
        description: dataToSubmit.description,
        thumbnail: dataToSubmit.thumbnail
      };
      console.log('Request data:', requestData);
      
      // Get authentication token
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // Call API directly instead of using service
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Topic update result:', result);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      // Get updated topic data from response
      const updatedTopicData = result.data || result;
      
      if (updatedTopicData) {
        // Update state with new data
        const topicResult: Topic = {
          id: updatedTopicData.id || id,
          name: updatedTopicData.name || dataToSubmit.name,
          description: updatedTopicData.description || dataToSubmit.description,
          thumbnail: updatedTopicData.thumbnail || dataToSubmit.thumbnail,
          createdAt: updatedTopicData.createdAt || topic?.createdAt,
          updatedAt: updatedTopicData.updatedAt || new Date().toISOString(),
          _count: updatedTopicData._count || topic?._count,
          instructor: updatedTopicData.instructor || topic?.instructor,
          courses: updatedTopicData.courses || topic?.courses
        };
        
        console.log('Updated topic:', topicResult);
        
        // Update state
        setTopic(topicResult);
        setThumbnailPreview(topicResult.thumbnail);
        
        // Update form
        form.setValues({
          name: topicResult.name,
          description: topicResult.description,
          thumbnail: topicResult.thumbnail
        });
        
        notifications.show({
          title: 'Success',
          message: 'Topic updated successfully',
          color: 'green'
        });
        
        // Call onSuccess callback if provided (for drawer mode)
        if (onSuccess) {
          console.log('Calling onSuccess callback');
          onSuccess();
        } else if (!isDrawer) {
          // If not drawer mode and no callback, navigate to list page
          navigate('/instructor-lead/topics');
        }
      } else {
        throw new Error('No topic data received from server');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      notifications.show({
        title: 'Error',
        message: `Unable to update topic: ${error instanceof Error ? error.message : 'Unknown error'}`,
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state when loading data
  if (loading) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="center" py={50}>
          <Loader size="md" />
          <Text>{isDrawer ? 'Loading information...' : 'Loading topic information...'}</Text>
        </Group>
      </Card>
    );
  }
  
  // Check if no topic data after loading is complete
  if (!loading && !topic) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="center" py={50}>
          <Text c="red">Topic information not found or an error occurred!</Text>
        </Group>
        {!isDrawer ? (
          <Group justify="center" mt="md">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/instructor-lead/topics')}
            >
              Back to list
            </Button>
          </Group>
        ) : (
          <Group justify="center" mt="md">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Close
            </Button>
          </Group>
        )}
      </Card>
    );
  }

  // Log component state before rendering
  console.log('EditTopic render state:', {
    id,
    isDrawer,
    loading,
    submitting,
    uploading,
    hasTopicData: !!topic,
    formValues: form.values,
    thumbnailPreview,
    formErrors: form.errors
  });

return (
  <Card shadow="sm" padding="md" radius="md" withBorder>
    {!isDrawer && (
      <Group justify="space-between" mb="md">
        <Title order={3}>Edit Topic</Title>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/instructor-lead/topics')}
        >
          Back
        </Button>
      </Group>
    )}

    <form onSubmit={form.onSubmit((values) => {
      console.log('Form submitted with values:', values);
      handleSubmit(values);
    })}>
      <Stack gap="md">
        <TextInput
          label="Topic Name"
          placeholder="Enter topic name"
          withAsterisk
          {...form.getInputProps('name')}
          onChange={(event) => {
            form.setFieldValue('name', event.currentTarget.value);
            console.log('Topic name updated:', event.currentTarget.value);
          }}
        />

        <Textarea
          label="Description"
          placeholder="Enter topic description"
          minRows={4}
          withAsterisk
          {...form.getInputProps('description')}
          onChange={(event) => {
            form.setFieldValue('description', event.currentTarget.value);
            console.log('Description updated:', event.currentTarget.value);
          }}
        />

        <Box>
          <Text size="sm" fw={500} mb={5}>Image {uploading && '(Uploading...)'}</Text>
          <FileInput
            placeholder="Select image"
            accept="image/png,image/jpeg"
            leftSection={uploading ? <Loader size="xs" /> : <IconPhoto size={16} stroke={1.5} />}
            rightSection={uploading && <IconUpload size={16} stroke={1.5} />}
            value={selectedFile}
            onChange={handleFileChange}
            clearable
            disabled={uploading}
            description="Select JPG/PNG file, maximum 2MB"
            error={form.errors.thumbnail}
          />

          {uploading && (
            <Box mt="xs">
              <Text size="xs" c="dimmed" mb={5}>Uploading: {uploadProgress}%</Text>
              <Progress value={uploadProgress} size="xs" />
            </Box>
          )}

          {thumbnailPreview && (
            <Box mt="md">
              <Text size="sm" fw={500} mb={5}>Preview</Text>
              <Image
                src={thumbnailPreview}
                alt="Thumbnail preview"
                height={200}
                fit="contain"
                radius="md"
                // withPlaceholder
                // placeholder={<IconPhoto size={32} stroke={1.5} />}
              />
            </Box>
          )}
        </Box>

        <Group justify="flex-end" mt="md">
          {isDrawer && (
            <Button
              variant="outline"
              onClick={() => {
                console.log('Cancel button clicked');
                if (onCancel) onCancel();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={submitting}
            disabled={uploading}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </form>
  </Card>
);
};

export default EditTopic;