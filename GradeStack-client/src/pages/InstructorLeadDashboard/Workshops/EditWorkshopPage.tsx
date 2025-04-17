import WorkshopForm from '../../../components/workshop/WorkshopForm';
import { Layout } from 'antd';

/**
 * Trang chỉnh sửa workshop dành cho Instructor
 */
const EditWorkshopPage = () => {
  const { Content } = Layout;
  
  return (
    <Content className="p-6">
      <WorkshopForm />
    </Content>
  );
};

export default EditWorkshopPage;
