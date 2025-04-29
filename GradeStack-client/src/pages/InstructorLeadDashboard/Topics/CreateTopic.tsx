import React, { useState } from 'react';
import { Card, Group, Text, Image } from '@mantine/core';
import { Form, Input, Button, Upload, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import instructorLeadService from '../../../services/instructorLeadService';
import { TopicCreateData } from '../../../services/topicService';
import mediaService from '../../../services/mediaService';
import type { RcFile } from 'antd/es/upload';

/**
 * Component for creating a new topic for Instructor Lead
 */
const CreateTopic: React.FC = () => {
  // Check access permissions
  React.useEffect(() => {
    const userData: string | null = localStorage.getItem('user');
    if (!userData) {
      message.error('You need to log in to use this feature!');
      navigate('/');
      return;
    }
    const user: { role?: string } = JSON.parse(userData);
    if (user.role !== 'INSTRUCTOR_LEAD') {
      message.error('Only Instructor Lead can create topics!');
      navigate('/');
    }
  }, []);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const navigate = useNavigate();

  /**
   * Form to manage topic data
   */
  const [form] = Form.useForm();

  /**
   * Check before upload
   */
  const beforeUpload = (file: RcFile) => {
    // Log file information for debugging
    console.log('File information:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    const isValidFormat = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml';
    if (!isValidFormat) {
      message.error('You can only upload JPG/PNG/SVG files!');
      return Upload.LIST_IGNORE;
    }
    
    return true; // Allow upload to continue
  };

  /**
   * Handle image upload to server
   */
  const handleUpload = async (file: RcFile): Promise<string> => {
    try {
      setUploading(true);
      console.log('Starting image upload:', file.name);
      
      // Ensure file is valid
      if (!file) {
        throw new Error('Invalid file');
      }
      
      // Use mediaService to upload image
      const result = await mediaService.uploadImage(file);
      console.log('Image upload result:', result);
      
      if (!result) {
        throw new Error('No response received from server');
      }
      
      // Check imageUrl in response
      const imageUrl = result.imageUrl || result.url;
      if (!imageUrl) {
        throw new Error('Image URL not found in response');
      }
      
      setThumbnailPreview(imageUrl);
      form.setFieldsValue({ thumbnail: imageUrl });
      console.log('Image URL has been updated:', imageUrl);
      message.success('Image uploaded successfully');
      return imageUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      // Log detailed error
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      message.error('Cannot upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle when user selects an image file
   */
  const handleFileChange = async (info: any): Promise<void> => {
    const { file } = info;
    
    if (file.status === 'removed') {
      setThumbnailPreview(null);
      form.setFieldsValue({ thumbnail: '' });
      return;
    }
    
    if (file.originFileObj) {
      try {
        // Create temporary preview while uploading
        const previewUrl = URL.createObjectURL(file.originFileObj);
        setThumbnailPreview(previewUrl);
        
        // Upload file to server
        const imageUrl = await handleUpload(file.originFileObj);
        
        // Update form with real URL from server
        form.setFieldsValue({ thumbnail: imageUrl });
      } catch (error) {
        console.error('Error processing image file:', error);
        // Use placeholder URL if there's an error
        const fallbackUrl = 'https://placehold.co/600x400?text=No+Image';
        setThumbnailPreview(fallbackUrl);
        form.setFieldsValue({ thumbnail: fallbackUrl });
      }
    }
  };

  /**
   * Handle creating a new topic
   */
  const handleSubmit = async (values: TopicCreateData): Promise<void> => {
    setLoading(true);
    try {
      // Get user information to add to topic data
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        values.instructorUserId = user.id;
      }
      
      console.log('Topic data before sending:', values);
      
      // Ensure there is a valid thumbnail URL
      if (!values.thumbnail || values.thumbnail === '') {
        values.thumbnail = 'https://placehold.co/600x400?text=No+Image';
      }
      
      await instructorLeadService.createTopic(values);
      message.success('New topic created successfully');
      navigate('/instructor-lead/topics');
    } catch (error: any) {
      console.error('Error creating topic:', error.response?.status, error.response?.data);
      message.error(error.response?.data?.message || 'Cannot create new topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text size="xl" fw={700} mb={20}>Create New Topic</Text>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Topic Name"
          rules={[{ required: true, message: 'Topic name cannot be empty' }]}
        >
          <Input placeholder="Enter topic name" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description cannot be empty' }]}
        >
          <Input.TextArea 
            placeholder="Enter description about the topic" 
            rows={4} 
          />
        </Form.Item>
        
        <Form.Item
          name="thumbnail"
          label="Image"
          rules={[{ required: true, message: 'Image cannot be empty' }]}
        >
          <Upload
            accept="image/jpeg,image/png,image/svg+xml"
            listType="picture"
            maxCount={1}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            customRequest={({ file, onSuccess }) => {
              // Simulate success for Antd to display file in list
              // Actual upload is handled in handleFileChange
              setTimeout(() => {
                onSuccess && onSuccess('ok');
              }, 0);
            }}
          >
            <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Select Image'}
            </Button>
          </Upload>
        </Form.Item>
        
        {thumbnailPreview && (
          <Image
            src={thumbnailPreview}
            alt="Thumbnail preview"
            width={200}
            height={120}
            radius="md"
            mb={15}
          />
        )}
        
        <Form.Item>
          <Group justify="flex-end" mt={20}>
            <Button 
              onClick={() => navigate('/instructor-lead/topics')}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>Create Topic</Button>
          </Group>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateTopic;