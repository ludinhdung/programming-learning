/**
 * Trang quản lý danh sách chứng chỉ cho INSTRUCTOR_LEAD
 * Hiển thị danh sách chứng chỉ và cho phép tìm kiếm, lọc
 */
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Card, Typography, message, Tooltip, Modal, Spin } from 'antd';
import { SearchOutlined, FileAddOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllCertificates, deleteCertificate, Certificate } from '../../../services/certificate-api';

const { Title } = Typography;

const CertificateList: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const navigate = useNavigate();

  // Lấy danh sách chứng chỉ khi component được tải
  useEffect(() => {
    fetchCertificates();
  }, []);

  // Hàm lấy danh sách chứng chỉ từ API
  const fetchCertificates = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await getAllCertificates();
      setCertificates(data);
    } catch (error) {
      message.error('Không thể tải danh sách chứng chỉ');
      console.error('Lỗi khi tải danh sách chứng chỉ:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xóa chứng chỉ
  const handleDelete = (certificateId: string): void => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chứng chỉ này không?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteCertificate(certificateId);
          message.success('Xóa chứng chỉ thành công');
          fetchCertificates(); // Tải lại danh sách sau khi xóa
        } catch (error) {
          message.error('Không thể xóa chứng chỉ');
          console.error('Lỗi khi xóa chứng chỉ:', error);
        }
      },
    });
  };

  // Hàm lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = certificates.filter((certificate) => {
    const searchContent = searchText.toLowerCase();
    return (
      certificate.learner?.firstName?.toLowerCase().includes(searchContent) ||
      certificate.learner?.lastName?.toLowerCase().includes(searchContent) ||
      certificate.learner?.email?.toLowerCase().includes(searchContent) ||
      certificate.course?.title?.toLowerCase().includes(searchContent) ||
      certificate.id.toLowerCase().includes(searchContent)
    );
  });

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'learner',
      key: 'learner',
      render: (learner: Certificate['learner']) => 
        learner ? `${learner.firstName} ${learner.lastName}` : 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'learner',
      key: 'email',
      render: (learner: Certificate['learner']) => learner?.email || 'N/A',
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (course: Certificate['course']) => course?.title || 'N/A',
    },
    {
      title: 'Ngày cấp',
      dataIndex: 'issuedAt',
      key: 'issuedAt',
      render: (issuedAt: string) => new Date(issuedAt).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Certificate) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/instructor-lead/certificates/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/instructor-lead/certificates/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <div className="flex justify-between items-center mb-6">
          <Title level={3}>Quản lý chứng chỉ</Title>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={() => navigate('/instructor-lead/certificates/create')}
          >
            Tạo chứng chỉ mới
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo tên học viên, email hoặc khóa học..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full max-w-md"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="border rounded-lg"
          />
        )}
      </Card>
    </div>
  );
};

export default CertificateList;
