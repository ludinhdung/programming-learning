import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  TextInput, Textarea, Button, Card, Title, NumberInput, Select, 
  Group, Stack, Avatar, Loader, Text, Container, Paper, Box,
  Image, rem, ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { 
  IconArrowLeft, IconUpload, IconGripVertical, 
  IconTrash, IconPhoto, IconX, IconDeviceFloppy
} from '@tabler/icons-react';
import mediaService from '../../../services/mediaService';
import courseService from '../../../services/courseService';
import learningPathService from '../../../services/learningPathService';
import { Role } from '../../../types/role';

// Interface for Course
interface Course {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration?: number;
}

// Interface for Learning Path
interface LearningPath {
  id: string;
  title: string; // title corresponds to name in the UI
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime: number | null; // estimated completion time (minutes)
  courses: {
    id: string;
    courseId: string;
    learningPathId: string;
    order: number;
    course: Course;
  }[];
  instructorUserId: string | null;
  Instructor?: any;
}

// Props for EditLearningPath component
interface EditLearningPathProps {
  learningPathId?: string; // ID of learning path when passed directly (used in drawer)
  isDrawer?: boolean; // Whether it's displayed in a drawer
  onSuccess?: () => void; // Callback on successful update
  onCancel?: () => void; // Callback on cancel
}

// Main component
const EditLearningPath: React.FC<EditLearningPathProps> = ({
  learningPathId,
  isDrawer = false,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  // Use ID from props if available, otherwise from params
  const id = learningPathId || params.id;

  // Initialize form with Mantine
  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      estimatedTime: 0,
      thumbnail: '',
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? 'Name must be at least 3 characters' : null),
      description: (value) => (value.trim().length < 10 ? 'Description must be at least 10 characters' : null),
    },
  });

  useEffect(() => {
    // Load learning path information and course list when component mounts
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        if (!id) {
          notifications.show({
            title: 'Error',
            message: 'Learning Path ID not found',
            color: 'red'
          });
          navigate('/instructor-lead/learning-paths');
          return;
        }

        // Get user information
        const userData = localStorage.getItem('user');
        if (!userData) {
          notifications.show({
            title: 'Error',
            message: 'Please log in to use this feature',
            color: 'red'
          });
          navigate('/instructor-lead/login');
          return;
        }

        const user = JSON.parse(userData);
        
        // Check if user is an instructor lead
        if (user.role !== Role.INSTRUCTOR_LEAD) {
          notifications.show({
            title: 'Access Denied',
            message: 'Only Instructor Lead can edit Learning Paths',
            color: 'orange'
          });
          navigate('/instructor-lead');
          return;
        }
        
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
        
        console.log('InstructorId being used:', instructorId);
        console.log('LearningPath ID being used:', id);
        
        // Get all courses in the system for learning path
        const courses = await courseService.getAllCoursesForLearningPath();
        setAvailableCourses(courses);
        console.log('Loaded', courses.length, 'courses for learning path');
        
        // Get detailed information about learning path
        const learningPath: LearningPath = await learningPathService.getInstructorLearningPath(instructorId, id);
        console.log('Learning path information:', learningPath);
        
        if (learningPath) {
          // Update form with current information
          form.setValues({
            name: learningPath.title || '',
            description: learningPath.description || '',
            estimatedTime: learningPath.estimatedCompletionTime || 0,
            thumbnail: learningPath.thumbnail || ''
          });
          
          // Update image URL
          setImageUrl(learningPath.thumbnail || '');
          
          // Update selected courses list
          if (learningPath.courses && Array.isArray(learningPath.courses)) {
            const sortedCourses = [...learningPath.courses].sort((a, b) => a.order - b.order);
            
            // Get detailed information for each course
            const selectedCoursesData = sortedCourses.map(item => item.course);
            setSelectedCourses(selectedCoursesData);
          }
        }
        
        setInitialLoading(false);
      } catch (error: any) {
        console.error('Error loading data:', error);
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Unable to load learning path information',
          color: 'red'
        });
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handle image upload
  const handleUpload = async (files: File[]) => {
    try {
      if (files.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'Please select at least one image file',
          color: 'red'
        });
        return;
      }

      const file = files[0];
      setFile(file);
      setUploading(true);
      setUploadError(null);

      // Check file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        setUploadError('File size too large. Please select a file smaller than 2MB');
        setUploading(false);
        return;
      }

      // Check file type (only accept jpg/jpeg and png)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Only JPG or PNG image files are accepted');
        setUploading(false);
        return;
      }

      // Use mediaService to upload image
      const result = await mediaService.uploadImage(file);
      console.log('Image upload result:', result);

      // Process returned result - ensure image URL is obtained
      // Result can be string or object depending on API response structure
      const imageUrlResult = typeof result === 'string' ? result : 
                           (result.url || result.imageUrl || 
                           (typeof result === 'object' && Object.values(result)[0]));
      
      if (!imageUrlResult || typeof imageUrlResult !== 'string') {
        throw new Error('No image URL received from server');
      }

      // Update image URL
      setImageUrl(imageUrlResult);
      form.setFieldValue('thumbnail', imageUrlResult);

      notifications.show({
        title: 'Success',
        message: 'Image uploaded successfully',
        color: 'green'
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Unable to upload image');
      notifications.show({
        title: 'Error',
        message: error.message || 'Unable to upload image',
        color: 'red'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseId: string | null) => {
    if (!courseId) return;
    
    const course = availableCourses.find(c => c.id === courseId);
    if (course && !selectedCourses.some(c => c.id === courseId)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  // Handle course removal
  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(course => course.id !== courseId));
  };

  // Handle drag and drop to reorder courses
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedCourses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedCourses(items);
  };

  // Handle form submission
  const onSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      if (!id) {
        notifications.show({
          title: 'Error',
          message: 'Learning Path ID not found',
          color: 'red'
        });
        return;
      }
      
      if (selectedCourses.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'Please select at least one course for the learning path',
          color: 'red'
        });
        return;
      }
      
      if (!imageUrl) {
        notifications.show({
          title: 'Error',
          message: 'Please upload a thumbnail image for the learning path',
          color: 'red'
        });
        return;
      }
      
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
      
      console.log('InstructorId being used:', instructorId);
      console.log('LearningPath ID being used:', id);
      
      // Prepare data to send to server
      const courseIds = selectedCourses.map(course => course.id);
      
      // Create LearningPathUpdateData object according to defined interface
      const learningPathData = {
        title: values.name.trim(),
        description: values.description.trim(),
        thumbnail: imageUrl,
        estimatedCompletionTime: values.estimatedTime || 0,
        courseIds: courseIds
      };
      
      console.log('Learning path data to be sent:', learningPathData);
      
      // Use service to update learning path
      await learningPathService.updateLearningPath(instructorId, id, learningPathData);
      
      notifications.show({
        title: 'Success',
        message: 'Learning path updated successfully',
        color: 'green'
      });
      
      // If in drawer and onSuccess callback exists, call it
      if (isDrawer && onSuccess) {
        onSuccess();
      } else {
        // Otherwise, navigate to learning path list
        navigate('/instructor-lead/learning-paths');
      }
    } catch (error: any) {
      console.error('Error updating learning path:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Unable to update learning path',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Container size="md" py="xl">
        <Card shadow="sm" p="lg" withBorder>
          <Stack align="center" p="xl">
            <Loader size="lg" />
            <Text>Loading learning path information...</Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" py="md">
      <Paper shadow="xs" p="md" withBorder>
        <Group mb="md">
          <Button 
            variant="subtle" 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/instructor-lead/learning-paths')}
          >
            Back
          </Button>
          <Title order={2} style={{ margin: 0 }}>Edit Learning Path</Title>
        </Group>
        
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Learning Path Name"
              placeholder="Enter learning path name"
              required
              {...form.getInputProps('name')}
            />
            
            <Textarea
              label="Description"
              placeholder="Enter detailed description about the learning path"
              minRows={4}
              {...form.getInputProps('description')}
            />
            
            <NumberInput
              label="Estimated Completion Time (hours)"
              placeholder="Enter estimated time to complete the learning path (hours)"
              min={0}
              allowDecimal={false}
              {...form.getInputProps('estimatedTime')}
            />
            
            <Box>
              <Text fw={500} mb="xs">Thumbnail Image</Text>
              {imageUrl ? (
                <Box mb="md">
                  <Group mb="xs">
                    <Text size="sm" c="dimmed">Uploaded image:</Text>
                    <Button 
                      variant="subtle" 
                      color="red" 
                      size="xs"
                      leftSection={<IconX size={14} />}
                      onClick={() => {
                        setImageUrl('');
                        form.setFieldValue('thumbnail', '');
                      }}
                    >
                      Remove
                    </Button>
                  </Group>
                  <Image
                    src={imageUrl}
                    alt="Thumbnail"
                    height={200}
                    fit="contain"
                  />
                </Box>
              ) : (
                <Dropzone
                  onDrop={handleUpload}
                  accept={IMAGE_MIME_TYPE}
                  loading={uploading}
                  maxSize={2 * 1024 * 1024} // 2MB
                  mb="md"
                >
                  <Group justify="center" gap="xl" style={{ minHeight: 140, pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <IconUpload
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto
                        style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                        stroke={1.5}
                      />
                    </Dropzone.Idle>

                    <div>
                      <Text size="xl" inline>
                        Drag images here or click to select files
                      </Text>
                      <Text size="sm" c="dimmed" inline mt={7}>
                        Only JPG, PNG image files less than 2MB are accepted
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              )}
              {uploadError && <Text c="red" size="sm">{uploadError}</Text>}
            </Box>
            
            <Box>
              <Text fw={500} mb="xs">Courses in Learning Path</Text>
              <Select
                label="Select courses to add to the learning path"
                placeholder="Select course"
                data={availableCourses
                  .filter(course => !selectedCourses.some(sc => sc.id === course.id))
                  .map(course => ({ value: course.id, label: course.title }))}
                onChange={handleCourseSelect}
                searchable
                clearable
                mb="md"
              />
              
              <Text size="sm" mb="xs">Selected courses list (drag and drop to reorder):</Text>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="courses">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ 
                        minHeight: '100px',
                        border: '1px solid var(--mantine-color-gray-3)',
                        borderRadius: 'var(--mantine-radius-sm)',
                        padding: 'var(--mantine-spacing-xs)'
                      }}
                    >
                      {selectedCourses.length === 0 ? (
                        <Text c="dimmed" ta="center" py="md">
                          No courses selected yet
                        </Text>
                      ) : (
                        <Stack>
                          {selectedCourses.map((course, index) => (
                            <Draggable key={course.id} draggableId={course.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Paper p="xs" withBorder>
                                    <Group>
                                      <Group>
                                        <IconGripVertical 
                                          size={18} 
                                          style={{ color: 'var(--mantine-color-gray-5)' }}
                                        />
                                        <Avatar src={course.thumbnail} size="md" radius="sm" />
                                        <div>
                                          <Text fw={500}>{course.title}</Text>
                                          <Text size="xs" c="dimmed" lineClamp={1}>
                                            {course.description}
                                          </Text>
                                        </div>
                                      </Group>
                                      <ActionIcon 
                                        color="red" 
                                        onClick={() => handleRemoveCourse(course.id)}
                                        variant="light"
                                      >
                                        <IconTrash size={16} />
                                      </ActionIcon>
                                    </Group>
                                  </Paper>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </Stack>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>

            <Group mt="xl" justify="flex-end">
              {/* Show Cancel button when in drawer */}
              {isDrawer && onCancel && (
                <Button
                  variant="outline"
                  color="gray"
                  onClick={onCancel}
                  leftSection={<IconX size={16} />}
                >
                  Cancel
                </Button>
              )}
              {/* If not in drawer, show Back button */}
              {!isDrawer && (
                <Button
                  variant="outline"
                  color="gray"
                  onClick={() => navigate('/instructor-lead/learning-paths')}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back
                </Button>
              )}
              <Button 
                type="submit"
                loading={loading}
                leftSection={<IconDeviceFloppy size={16} />}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default EditLearningPath;