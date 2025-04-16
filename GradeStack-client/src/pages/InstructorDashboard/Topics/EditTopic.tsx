import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, message, Card, Typography, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import topicService from '../../../services/topicService';
import mediaService from '../../../services/mediaService';

const { TextArea } = Input;
const { Title } = Typography;

const EditTopic: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingTopic, setFetchingTopic] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      fetchTopic(id);
    }
  }, [id]);

  const fetchTopic = async (topicId: string) => {
    try {
      setFetchingTopic(true);
      const topic = await topicService.getTopicById(topicId);
      
      form.setFieldsValue({
        name: topic.name,
        description: topic.description,
      });
      
      setImageUrl(topic.thumbnail);
      
      if (topic.thumbnail) {
        setFileList([
          {
            uid: '-1',
            name: 'thumbnail.png',
            status: 'done',
            url: topic.thumbnail,
          },
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin chủ đề:', error);
      message.error('Không thể tải thông tin chi tiết của chủ đề');
    } finally {
      setFetchingTopic(false);
    }
  };

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
    if (!id) {
      message.error('ID chủ đề không tồn tại');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Form values:', values);
      
      // Sử dụng imageUrl đã được cập nhật trực tiếp từ handleUpload hoặc từ dữ liệu ban đầu
      const thumbnailUrl = imageUrl;
      
      // Kiểm tra xem có URL hình ảnh chưa
      if (!thumbnailUrl) {
        message.error('Vui lòng tải lên hình ảnh đại diện cho chủ đề');
        setLoading(false);
        return;
      }
      
      // Kiểm tra lại một lần nữa để đảm bảo có URL hình ảnh
      if (!thumbnailUrl) {
        message.error('Vui lòng tải lên hình ảnh đại diện');
        setLoading(false);
        return;
      }
      
      // Đảm bảo URL hình ảnh hợp lệ
      if (typeof thumbnailUrl !== 'string' || thumbnailUrl.trim() === '') {
        console.error('URL hình ảnh không hợp lệ:', thumbnailUrl);
        message.error('URL hình ảnh không hợp lệ. Vui lòng tải lại hình ảnh.');
        setLoading(false);
        return;
      }
      
      console.log('Cập nhật chủ đề với dữ liệu:', {
        id,
        name: values.name,
        description: values.description,
        thumbnail: thumbnailUrl
      });
      
      const response = await topicService.updateTopic(id, {
        name: values.name,
        description: values.description,
        thumbnail: thumbnailUrl
      });
      
      console.log('Chủ đề đã được cập nhật:', response);
      message.success('Cập nhật chủ đề thành công');
      
      // Chuyển hướng về trang danh sách chủ đề
      navigate('/instructor/topics');
    } catch (error: any) {
      console.error('Lỗi khi cập nhật chủ đề:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật chủ đề');
    } finally {
      setLoading(false);
    }
  };

  const customUploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Tải lên</div>
    </div>
  );

  if (fetchingTopic) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin chủ đề..." />
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
              type="text"
              onClick={() => navigate('/instructor/topics')}
              className="mr-2"
            />
            <Title level={4} className="m-0">Chỉnh sửa chủ đề</Title>
          </div>
        }
        className="w-full"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
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
            rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh đại diện' }]}
            extra="Hỗ trợ định dạng JPG, PNG. Kích thước tối đa 2MB."
          >
            <div>
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                maxCount={1}
                onRemove={() => {
                  setImageUrl('');
                  setFileList([]);
                  form.setFieldsValue({ thumbnail: '' });
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
              Cập nhật chủ đề
            </Button>
            <Button 
              onClick={() => navigate('/instructor/topics')}
              disabled={loading || uploading}
            >
              Hủy bỏ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditTopic;
