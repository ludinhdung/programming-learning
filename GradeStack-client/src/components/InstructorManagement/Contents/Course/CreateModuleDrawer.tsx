import React, { useEffect } from "react";
import { Drawer, Input, Button, Form } from "antd";

interface CreateModuleDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; description: string }) => void;
  currentModulesCount: number;
}

const CreateModuleDrawer: React.FC<CreateModuleDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  currentModulesCount,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: "",
        description: "",
        order: currentModulesCount + 1,
      });
    }
  }, [open, currentModulesCount, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Drawer
      title="Create New Module"
      placement="right"
      onClose={onClose}
      open={open}
      width={720}
      extra={
        <Button type="primary" onClick={handleSubmit} className="font-semibold">
          Create Module
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          order: currentModulesCount + 1,
        }}
      >
        <Form.Item
          name="title"
          label="Module Title"
          rules={[
            {
              required: true,
              message: "Please enter module title",
            },
          ]}
        >
          <Input placeholder="Enter module title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: true,
              message: "Please enter module description",
            },
          ]}
        >
          <Input.TextArea placeholder="Enter module description" rows={4} />
        </Form.Item>

        <Form.Item
          name="order"
          label="Module Order"
          tooltip="This will be the position of the module in the course"
        >
          <Input type="number" min={1} disabled className="w-24" />
        </Form.Item>

        <div className="mt-8 rounded-md bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-700">Note</h4>
          <p className="text-sm text-blue-600">
            After creating the module, you can add lessons by clicking the edit
            button on the module card. You can add different types of lessons
            like videos, coding exercises, or final tests.
          </p>
        </div>
      </Form>
    </Drawer>
  );
};

export default CreateModuleDrawer;
