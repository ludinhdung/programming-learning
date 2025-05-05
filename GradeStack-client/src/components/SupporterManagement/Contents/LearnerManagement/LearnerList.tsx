// src/components/SupporterManagement/Contents/LearnerManagement/LearnerList.tsx
import React, { useEffect, useState } from "react";
import { Table, Switch, Button, Popconfirm, message, Input, Badge } from "antd";
import { Link } from "react-router-dom";
import { DeleteOutlined, WarningOutlined } from "@ant-design/icons";
import { supporterService } from "../../../../services/api";
import type { DrawerProps } from "antd";
import { Drawer } from "antd";
const { Column } = Table;
const { TextArea } = Input;
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  warningCount: number;
  isBlocked: boolean;
}

const LearnerList: React.FC = () => {
  const [learners, setLearners] = useState<User[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLearnerId, setSelectedLearnerId] = useState<string | null>(
    null
  );
  const [warningContent, setWarningContent] = useState("");

  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<DrawerProps["placement"]>("left");

  const fetchLearners = async () => {
    try {
      const respone = await supporterService.getAllLearner();
      setLearners(respone.data);
    } catch (error) {
      console.error("Error fetching learners:", error);
      message.error("Failed to fetch Learners");
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handleStatusChange = async (userId: string, checked: boolean) => {
    try {
      await supporterService.updateUserStatus(userId, { isBlocked: !checked });
      setLearners((prev) =>
        prev.map((learner) =>
          learner.id === userId ? { ...learner, isBlocked: !checked } : learner
        )
      );
      message.success(
        `Learner status updated to ${checked ? "Active" : "Inactive"}`
      );
    } catch (error) {
      console.error("Error updating learner status:", error);
      message.error("Failed to update learner status");
    }
  };

  const handleDelete = async (learnerId: string) => {
    setConfirmLoading(true);
    try {
      await supporterService.deleteLearner(learnerId);
      message.success("Learner deleted successfully");
      fetchLearners();
    } catch (error) {
      message.error("Failed to delete learner");
    } finally {
      setConfirmLoading(false);
      setDeletingId(null);
    }
  };

  const showDrawer = (learner: User) => {
    setSelectedLearnerId(learner.id);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const handleWarning = async (learnerId: string, warningContent: string) => {
    console.log(learnerId);
    console.log(selectedLearnerId);

    if (!selectedLearnerId) return;
    try {
      await supporterService.warningLearner(selectedLearnerId, warningContent);
      // Cập nhật UI ngay lập tức
      setLearners((prev) =>
        prev.map((learner) =>
          learner.id === learnerId
            ? {
                ...learner,
                warningCount: (learner.warningCount || 0) + 1, // Tăng số lần warning
                isBlocked: (learner.warningCount || 0) + 1 >= 3, // Block nếu đủ 3 lần
              }
            : learner
        )
      );
      setOpen(false);
      setWarningContent("");
      message.success("Wanring Notice sent successful!");
    } catch (error) {
      message.error("Wanring Notice sent failed!");
      console.log("Wanring Notice sent failed!", error);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-400 p-10">
      <h1 className="text-black text-3xl font-bold mb-4">Learner Management</h1>
      <Table<User>
        dataSource={learners}
        className="bg-white rounded-xl shadow-lg mt-4"
      >
        <Column
          title="Learner"
          key="learner"
          render={(_, record: User) => (
            <span>
              {record.firstName} {record.lastName}
            </span>
          )}
        />
        <Column
          title="Email"
          key="email"
          render={(_, record: User) => record.email}
        />
        <Column
          title="Status"
          key="status"
          render={(_, record: User) => (
            <Switch
              checked={!record.isBlocked}
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              onChange={(checked) => handleStatusChange(record.id, checked)}
            />
          )}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record: User) => (
            <div className="flex gap-2">
              <Button
                icon={<WarningOutlined className="text-yellow-500" />}
                onClick={() => showDrawer(record)}
                className="ml-2 border border-yellow-400"
              />
              <Popconfirm
                title="Delete learner"
                description="Are you sure you want to delete this learner? This action cannot be reversed."
                open={deletingId === record.id}
                onConfirm={() => handleDelete(record.id)}
                okButtonProps={{ loading: confirmLoading }}
                onCancel={() => setDeletingId(null)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setDeletingId(record.id)}
                />
              </Popconfirm>
            </div>
          )}
        />
        <Column
          title="Comment"
          key="comment"
          render={(_, record: User) => {
            const inappropriateCount =
              localStorage.getItem(`inappropriateComments_${record.id}`) || "0";
            const count = parseInt(inappropriateCount, 10);

            return (
              <div className="-ml-2">
                <Link
                  to={`comment/${record.id}`}
                  className="relative inline-block"
                >
                  <Badge count={count} color="red">

                  <Button className="">View Comments</Button>
                  </Badge>
  
                </Link>
              </div>
            );
          }}
        ></Column>
      </Table>

      <Drawer
        title={
          <div className="text-center font-semibold text-lg">
            Send warning message to{" "}
            <span className="text-lg text-blue-600">
              {
                learners.find((learner) => learner.id === selectedLearnerId)
                  ?.firstName
              }
            </span>
          </div>
        }
        placement={placement}
        closable={false}
        onClose={onClose}
        open={open}
        key={placement}
      >
        <TextArea
          rows={4}
          value={warningContent}
          onChange={(e) => setWarningContent(e.target.value)}
          placeholder="Enter message content..."
        />
        <Button
          type="primary"
          onClick={() => handleWarning(selectedLearnerId!, warningContent)}
          className="mt-4"
          disabled={!warningContent.trim()}
        >
          Send message
        </Button>
      </Drawer>
    </div>
  );
};

export default LearnerList;
