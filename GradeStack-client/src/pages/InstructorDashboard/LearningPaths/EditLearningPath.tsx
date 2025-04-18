import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography, InputNumber, Select, Space, List, Avatar, Spin } from 'antd';
import { ArrowLeftOutlined, LoadingOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import mediaService from '../../../services/mediaService';
import courseService from '../../../services/courseService';
import learningPathService from '../../../services/learningPathService';

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

// Interface cho Course
interface Course {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration?: number;
}

// Interface cho Learning Path
interface LearningPath {
  id: string;
  title: string; // title tương ứng với name trong UI
  description: string | null;
  thumbnail: string | null;
  estimatedCompletionTime: number | null; // thời gian hoàn thành dự kiến (phút)
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

// Sử dụng các service đã import

const EditLearningPath: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    // Tải thông tin learning path và danh sách khóa học khi component được mount
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        if (!id) {
          message.error('Không tìm thấy ID của Learning Path');
          navigate('/instructor/learning-paths');
          return;
        }

        // Lấy thông tin người dùng
        const userData = localStorage.getItem('user');
        if (!userData) {
          message.error('Vui lòng đăng nhập để thực hiện chức năng này');
          navigate('/login');
          return;
        }

        const user = JSON.parse(userData);
        
        // Xác định instructorId từ dữ liệu người dùng
        let instructorId;
        if (user.instructor && user.instructor.userId) {
          instructorId = user.instructor.userId;
        } else if (user.instructorId) {
          instructorId = user.instructorId;
        } else if (user.id && user.role === 'INSTRUCTOR') {
          instructorId = user.id;
        }

        if (!instructorId) {
          message.error('Không tìm thấy thông tin instructor');
          return;
        }

        // Tải thông tin learning path
        const learningPath = await learningPathService.getInstructorLearningPath(instructorId, id);
        console.log('API Response - Learning Path:', learningPath);
        console.log('Courses in Learning Path:', learningPath.courses);
        
        // Cập nhật form với dữ liệu từ learning path
        form.setFieldsValue({
          name: learningPath.title,
          description: learningPath.description,
          estimatedTime: learningPath.estimatedCompletionTime ? Math.floor(learningPath.estimatedCompletionTime / 60) : null,
          thumbnail: learningPath.thumbnail
        });
        
        // Cập nhật state cho hình ảnh
        if (learningPath.thumbnail) {
          setImageUrl(learningPath.thumbnail);
          setFileList([
            {
              uid: '-1',
              name: 'thumbnail.png',
              status: 'done',
              url: learningPath.thumbnail,
            },
          ]);
        }
        
        // Cập nhật danh sách khóa học đã chọn
        if (learningPath.courses && learningPath.courses.length > 0) {
          console.log('Preparing to sort courses:', learningPath.courses);
          const selectedCoursesData = learningPath.courses
            .sort((a: {order: number}, b: {order: number}) => a.order - b.order)
            .map((item: {course: Course}) => {
              console.log('Course item:', item);
              return item.course;
            });
          console.log('Selected courses after mapping:', selectedCoursesData);
          setSelectedCourses(selectedCoursesData);
        } else {
          console.log('No courses found in learning path');
          setSelectedCourses([]);
        }
        
        // Tải danh sách tất cả khóa học của instructor
        const allCourses = await courseService.getFullCourses(instructorId);
        console.log('All available courses:', allCourses);
        setAvailableCourses(allCourses);
      } catch (error: any) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Không thể tải thông tin Learning Path');
        navigate('/instructor/learning-paths');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, form]);

  const beforeUpload = (file: RcFile) => {
    // Log file details for debugging
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Hình ảnh phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    return true; // Allow the upload to proceed
  };

  const handleUpload = async (file: RcFile): Promise<string> => {
    try {
      setUploading(true);
      console.log('Bắt đầu tải lên hình ảnh:', file.name);
      
      // Ensure we're working with a valid file
      if (!file) {
        throw new Error('File không hợp lệ');
      }
      
      // Use mediaService to upload the image
      const result = await mediaService.uploadImage(file);
      console.log('Kết quả tải lên hình ảnh:', result);
      
      if (!result) {
        throw new Error('Không nhận được phản hồi từ server');
      }
      
      // Check for imageUrl in the response
      const imageUrl = result.imageUrl || result.url;
      if (!imageUrl) {
        throw new Error('URL hình ảnh không có trong phản hồi');
      }
      
      setImageUrl(imageUrl);
      console.log('URL hình ảnh đã được cập nhật:', imageUrl);
      message.success('Tải lên hình ảnh thành công');
      return imageUrl;
    } catch (error: any) {
      console.error('Lỗi khi tải lên hình ảnh:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Server response:', error.response.data);
        console.error('Status code:', error.response.status);
      }
      message.error('Không thể tải lên hình ảnh: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // Only update fileList if it's not during upload
    // This prevents the list from being cleared during upload
    if (!uploading) {
      setFileList(newFileList);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (course && !selectedCourses.some(c => c.id === courseId)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(course => course.id !== courseId));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedCourses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedCourses(items);
  };

  const onFinish = async (values: any) => {
    try {
      if (!id) {
        message.error('Không tìm thấy ID của Learning Path');
        return;
      }

      setLoading(true);
      console.log('Form values:', values);
      
      // Lấy ID người dùng hiện tại từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        message.error('Vui lòng đăng nhập để thực hiện chức năng này');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      
      // Xác định instructorId từ dữ liệu người dùng
      let instructorId;
      if (user.instructor && user.instructor.id) {
        instructorId = user.instructor.id;
      } else if (user.instructorId) {
        instructorId = user.instructorId;
      } else if (user.id && user.role === 'INSTRUCTOR') {
        instructorId = user.id;
      }

      if (!instructorId) {
        message.error('Không tìm thấy thông tin instructor');
        return;
      }

      // Chuẩn bị dữ liệu để gửi đi
      const learningPathData = {
        title: values.name,
        description: values.description,
        thumbnail: values.thumbnail,
        estimatedCompletionTime: Math.floor(values.estimatedTime * 60), // Chuyển đổi từ giờ sang phút
        courseIds: selectedCourses.map(course => course.id)
      };

      // Gọi API cập nhật learning path
      await learningPathService.updateLearningPath(instructorId, id, learningPathData);
      
      message.success('Cập nhật Learning Path thành công');
      navigate('/instructor/learning-paths');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật Learning Path:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật Learning Path');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/instructor/learning-paths')}
              style={{ marginRight: 16 }}
              type="text"
            />
            <Title level={4} style={{ margin: 0 }}>
              Chỉnh Sửa Learning Path
            </Title>
          </div>
        }
        className="w-full shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="Tên Learning Path"
            rules={[
              { required: true, message: 'Vui lòng nhập tên Learning Path' },
              { max: 100, message: 'Tên không được vượt quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên Learning Path" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
            ]}
          >
            <TextArea
              placeholder="Nhập mô tả về Learning Path này"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            name="estimatedTime"
            label="Thời gian hoàn thành dự kiến (giờ)"
            rules={[
              { required: true, message: 'Vui lòng nhập thời gian dự kiến' },
              { type: 'number', min: 1, message: 'Thời gian phải lớn hơn 0' }
            ]}
            tooltip="Thời gian dự kiến để hoàn thành tất cả các khóa học trong learning path này"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Hình ảnh đại diện"
            required
            tooltip="Hình ảnh đại diện cho Learning Path"
          >
            <div className="flex flex-col items-center">
              <Upload
                name="thumbnail"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                fileList={fileList}
                maxCount={1}
                style={{ width: '100%', height: 200 }}
                customRequest={async ({ file, onSuccess, onError }) => {
                  try {
                    console.log('Bắt đầu tải lên hình ảnh từ customRequest', file);
                    
                    // Validate file is a RcFile
                    if (!file || !(file instanceof File)) {
                      throw new Error('File không hợp lệ');
                    }
                    
                    // Sử dụng hàm handleUpload để xử lý việc tải lên hình ảnh một cách nhất quán
                    const url = await handleUpload(file as RcFile);
                    
                    // Update form value với đường dẫn hình ảnh nhận được
                    form.setFieldsValue({ thumbnail: url });
                    
                    // Mark as done and update file list
                    const fileWithUrl = { ...file, status: 'done', url } as UploadFile;
                    setFileList([fileWithUrl]);
                    
                    // Thành công
                    onSuccess?.(url);
                  } catch (error: any) {
                    console.error('Lỗi khi tải lên hình ảnh trong customRequest:', error);
                    
                    // Log detailed error information
                    if (error.response) {
                      console.error('Server response:', error.response.data);
                      console.error('Status code:', error.response.status);
                    }
                    
                    message.error('Lỗi khi tải lên hình ảnh: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
                    onError?.(error as Error);
                    
                    // Reset file list on error
                    setFileList([]);
                  }
                }}
              >
                {imageUrl ? (
                  <div className="relative group">
                    <img src={imageUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <span className="text-white">Thay đổi</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
              
              {/* Hidden input to store the image URL */}
              <Form.Item 
                name="thumbnail" 
                hidden={true}
                rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh đại diện' }]}
              >
                <Input />
              </Form.Item>
              
              {/* Clear button if image exists */}
              {imageUrl && (
                <Button 
                  type="text" 
                  danger 
                  onClick={() => {
                    setImageUrl('');
                    setFileList([]);
                    form.setFieldsValue({ thumbnail: '' });
                  }}
                  style={{ marginTop: 8 }}
                >
                  Xóa hình
                </Button>
              )}
            </div>
          </Form.Item>

          <Title level={5} className="mt-4">Khóa học trong Learning Path</Title>
          <div className="mb-4">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                placeholder="Chọn khóa học để thêm vào Learning Path"
                style={{ width: '100%' }}
                onChange={handleCourseSelect}
                optionFilterProp="children"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {availableCourses
                  .filter(course => !selectedCourses.some(selected => selected.id === course.id))
                  .map(course => (
                    <Option key={course.id} value={course.id}>
                      {course.title}
                    </Option>
                  ))}
              </Select>
              
              <div className="mt-4 mb-2">
                <Title level={5}>Danh sách khóa học đã chọn</Title>
                <div className="text-gray-500 text-sm mb-2">
                  Kéo và thả để sắp xếp thứ tự khóa học trong Learning Path
                </div>
              </div>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="courses">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="border rounded-md p-2"
                      style={{ minHeight: '100px' }}
                    >
                      {selectedCourses.length === 0 ? (
                        <div className="text-center py-4 text-gray-400">
                          Chưa có khóa học nào được chọn
                        </div>
                      ) : (
                        <List
                          dataSource={selectedCourses}
                          renderItem={(course, index) => (
                            <Draggable key={course.id} draggableId={course.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="mb-2"
                                >
                                  <List.Item
                                    className="border rounded-md p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    actions={[
                                      <Button
                                        key="remove"
                                        type="text"
                                        danger
                                        onClick={() => handleRemoveCourse(course.id)}
                                      >
                                        Xóa
                                      </Button>
                                    ]}
                                  >
                                    <List.Item.Meta
                                      avatar={
                                        <Avatar 
                                          src={course.thumbnail} 
                                          shape="square" 
                                          size={48}
                                        />
                                      }
                                      title={
                                        <div className="flex items-center">
                                          <DragOutlined className="mr-2 text-gray-400" />
                                          <span>{course.title}</span>
                                        </div>
                                      }
                                      description={course.description}
                                    />
                                  </List.Item>
                                </div>
                              )}
                            </Draggable>
                          )}
                        />
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Space>
          </div>

          <Form.Item className="mt-6">
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={uploading || !imageUrl || selectedCourses.length === 0}
              >
                Cập nhật Learning Path
              </Button>
              <Button 
                onClick={() => navigate('/instructor/learning-paths')}
                disabled={loading || uploading}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditLearningPath;
