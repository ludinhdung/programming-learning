import InstructorWorkshopList from '../../../components/workshop/InstructorWorkshopList';
import { Layout } from 'antd';

/**
 * Trang quản lý danh sách workshop dành cho Instructor
 */
const InstructorWorkshopListPage = () => {
  const { Content } = Layout;
  
  return (
    <Content className="p-6">
      <InstructorWorkshopList />
    </Content>
  );
};

export default InstructorWorkshopListPage;
