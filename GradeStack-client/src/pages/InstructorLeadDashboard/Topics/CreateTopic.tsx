import React, { useState } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography,} from 'antd';
import { ArrowLeftOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import topicService from '../../../services/topicService';
import mediaService from '../../../services/mediaService';

const { TextArea } = Input;
const { Title } = Typography;

const CreateTopic: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const navigate = useNavigate();

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

  const onFinish = async (values: any) => {
    try {
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
      } else if (user.id && user.role === 'INSTRUCTOR_LEAD') {
        instructorId = user.id;
      }

      if (!instructorId) {
        message.error('Bạn không có quyền tạo chủ đề');
        return;
      }
      
      console.log('Thumbnail URL to be used for topic creation:', imageUrl);
      
      // Đảm bảo có URL hình ảnh trước khi gửi form
      if (!imageUrl) {
        message.error('Vui lòng tải lên hình ảnh đại diện cho chủ đề');
        return;
      }
      
      const topicData = {
        name: values.name,
        description: values.description,
        thumbnail: imageUrl,
      };
      
      console.log('Creating topic with data:', topicData);
      
      const response = await topicService.createTopic(instructorId, topicData);
      
      console.log('Topic created successfully:', response);
      message.success('Tạo chủ đề thành công');
      form.resetFields();
      setFileList([]);
      setImageUrl('');
      navigate('/instructor-lead-management/topics');
    } catch (error: any) {
      console.error('Lỗi khi tạo chủ đề:', error);
      message.error(error.response?.data?.message || 'Không thể tạo chủ đề');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="text"
              onClick={() => navigate('/instructor-lead-management/topics')}
              className="mr-2"
            />
            <Title level={4} className="m-0">Tạo Chủ Đề Mới</Title>
          </div>
        }
        className="w-full shadow-md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark="optional"
        >
          <Form.Item
            name="name"
            label="Tên chủ đề"
            rules={[
              { required: true, message: 'Vui lòng nhập tên chủ đề' },
              { min: 3, message: 'Tên chủ đề phải có ít nhất 3 ký tự' },
              { max: 100, message: 'Tên chủ đề không được vượt quá 100 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên chủ đề" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả chủ đề' },
              { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' }
            ]}
          >
            <TextArea 
              placeholder="Nhập mô tả chi tiết về chủ đề" 
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="thumbnail"
            label="Hình ảnh đại diện"
            rules={[{ required: imageUrl ? false : true, message: 'Vui lòng tải lên hình ảnh đại diện' }]}
            extra="Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 2MB."
          >
            <div>
              <Upload
                name="thumbnail"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={(info) => {
                  if (info.file.status === 'uploading') {
                    return;
                  }
                  if (info.file.status === 'done') {
                    // File was uploaded successfully by customRequest
                    setFileList([info.file]);
                  }
                }}
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
                initialValue={imageUrl}
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

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="mr-2"
              disabled={uploading}
            >
              Tạo Chủ Đề
            </Button>
            <Button 
              onClick={() => navigate('/instructor-lead-management/topics')}
              disabled={loading || uploading}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTopic;
