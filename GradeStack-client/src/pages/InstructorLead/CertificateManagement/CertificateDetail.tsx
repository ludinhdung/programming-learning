/**
 * Trang xem chi tiết chứng chỉ cho INSTRUCTOR_LEAD
 * Hiển thị thông tin chi tiết về chứng chỉ và cho phép tải xuống
 */
import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Button, Spin, message, Image, Divider } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getCertificateById, deleteCertificate, Certificate } from '../../../services/certificate-api';

const { Title } = Typography;

const CertificateDetail: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    } catch (error) {
      message.error('Không thể tải thông tin chứng chỉ');
      console.error('Lỗi khi tải thông tin chứng chỉ:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xóa chứng chỉ
  const handleDelete = async (): Promise<void> => {
    if (!certificateId) return;

    try {
      await deleteCertificate(certificateId);
      message.success('Xóa chứng chỉ thành công');
      navigate('/instructor-lead/certificates');
    } catch (error) {
      message.error('Không thể xóa chứng chỉ');
      console.error('Lỗi khi xóa chứng chỉ:', error);
    }
  };

  // Hàm xử lý tải xuống chứng chỉ
  const handleDownload = (): void => {
    if (!certificate?.certificateUrl) return;

    // Tạo thẻ a ẩn để tải xuống
    const link = document.createElement('a');
    link.href = certificate.certificateUrl;
    link.target = '_blank';
    link.download = `certificate-${certificate.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/instructor-lead/certificates')}
              className="mr-4"
            >
              Quay lại
            </Button>
            <Title level={3}>Chi tiết chứng chỉ</Title>
          </div>
          <div>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/instructor-lead/certificates/edit/${certificate.id}`)}
              className="mr-2"
            >
              Chỉnh sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              Xóa
            </Button>
          </div>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          className="mb-6"
        >
          <Descriptions.Item label="ID chứng chỉ">{certificate.id}</Descriptions.Item>
          <Descriptions.Item label="Ngày cấp">
            {new Date(certificate.issuedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Học viên">
            {certificate.learner ? (
              <div>
                <div>{`${certificate.learner.firstName} ${certificate.learner.lastName}`}</div>
                <div className="text-gray-500">{certificate.learner.email}</div>
              </div>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Khóa học">
            {certificate.course ? (
              <div>
                <div>{certificate.course.title}</div>
                <div className="text-gray-500 text-sm">{certificate.course.description}</div>
              </div>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Chứng chỉ</Divider>
        
        <div className="flex flex-col items-center mb-6">
          {certificate.certificateUrl && (
            <div className="mb-4 border p-2 rounded">
              {certificate.certificateUrl.toLowerCase().endsWith('.pdf') ? (
                <div className="flex items-center justify-center bg-gray-100 p-8 rounded">
                  <p className="text-center">
                    Tệp PDF không thể hiển thị trực tiếp. Vui lòng tải xuống để xem.
                  </p>
                </div>
              ) : (
                <Image
                  src={certificate.certificateUrl}
                  alt="Chứng chỉ"
                  className="max-w-full"
                  style={{ maxHeight: '400px' }}
                />
              )}
            </div>
          )}
          
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            disabled={!certificate.certificateUrl}
          >
            Tải xuống chứng chỉ
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CertificateDetail;
