import WorkshopForm from '../../../components/workshop/WorkshopForm';
import { Layout } from 'antd';

/**
 * Trang tạo workshop mới dành cho Instructor
 */
const CreateWorkshopPage = () => {
  const { Content } = Layout;
  
  return (
    <Content className="p-6">
      <WorkshopForm />
    </Content>
  );
};

export default CreateWorkshopPage;
