/**
 * Trang chỉnh sửa chứng chỉ cho INSTRUCTOR_LEAD
 * Cho phép cập nhật URL chứng chỉ
 */
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin, Upload } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getCertificateById, updateCertificate, UpdateCertificateDto, Certificate } from '../../../services/certificate-api';

const { Title } = Typography;

const EditCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [form] = Form.useForm();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  // Lấy thông tin chứng chỉ khi component được tải
  useEffect(() => {
    if (certificateId) {
      fetchCertificateDetail(certificateId);
    }
  }, [certificateId]);

  // Hàm lấy thông tin chi tiết chứng chỉ
  const fetchCertificateDetail = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const data = await getCertificateById(id);
      setCertificate(data);
      
      // Đặt giá trị ban đầu cho form
      form.setFieldsValue({
        certificateUrl: data.certificateUrl
      });
    } catch (error) {
      message.error('Không thể tải thông tin chứng chỉ');
      console.error('Lỗi khi tải thông tin chứng chỉ:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi form được gửi
  const handleSubmit = async (values: UpdateCertificateDto): Promise<void> => {
    if (!certificateId) return;

    try {
      setSubmitting(true);
      await updateCertificate(certificateId, values);
      message.success('Cập nhật chứng chỉ thành công');
      navigate(`/instructor-lead/certificates/${certificateId}`);
    } catch (error) {
      message.error('Không thể cập nhật chứng chỉ');
      console.error('Lỗi khi cập nhật chứng chỉ:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý tải lên hình ảnh chứng chỉ (giả định)
  const handleUpload = (info: any): void => {
    if (info.file.status === 'done') {
      const certificateUrl = info.file.response.url;
      form.setFieldsValue({ certificateUrl });
      message.success('Tải lên chứng chỉ thành công');
    } else if (info.file.status === 'error') {
      message.error('Tải lên chứng chỉ thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large" tip="Đang tải thông tin chứng chỉ..." />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-6">
        <Card className="shadow-md text-center py-8">
          <Title level={4}>Không tìm thấy thông tin chứng chỉ</Title>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/instructor-lead/certificates')}
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/instructor-lead/certificates/${certificateId}`)}
            className="mr-4"
          >
            Quay lại
          </Button>
          <Title level={3}>Chỉnh sửa chứng chỉ</Title>
        </div>

        <div className="mb-6">
          <div className="text-gray-700 mb-2">Học viên:</div>
          <div className="font-medium">
            {certificate.learner 
              ? `${certificate.learner.firstName} ${certificate.learner.lastName} (${certificate.learner.email})` 
              : 'N/A'}
          </div>
        </div>

        <div className="mb-6">
          <div className="text-gray-700 mb-2">Khóa học:</div>
          <div className="font-medium">
            {certificate.course ? certificate.course.title : 'N/A'}
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-2xl"
        >
          <Form.Item
            name="certificateUrl"
            label="URL chứng chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập URL chứng chỉ' }]}
          >
            <Input placeholder="Nhập URL chứng chỉ" />
          </Form.Item>

          <Form.Item label="Hoặc tải lên chứng chỉ mới">
            <Upload
              name="certificate"
              action="/api/upload-certificate" // Thay thế bằng API thực tế
              onChange={handleUpload}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải lên chứng chỉ</Button>
            </Upload>
            <div className="text-gray-500 text-sm mt-1">
              Hỗ trợ: JPG, PNG, PDF. Kích thước tối đa: 5MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
              className="mt-4"
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditCertificate;
