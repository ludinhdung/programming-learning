import { useState, useEffect } from "react";
import { feedbackService } from "../../services/api";
import { Spin, Dropdown, Modal, Rate, Input, Button, message } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { formatTimeAgo } from "../../utils/formatTimeAgo";
interface CourseFeedbackProps {
  courseId: string;
}

interface FeedbackItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
  };
}


const CourseFeedback: React.FC<CourseFeedbackProps> = ({ courseId }) => {
  const [visibleFeedbacks, setVisibleFeedbacks] = useState(4);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editFeedback, setEditFeedback] = useState<FeedbackItem | null>(null);
  const [editRating, setEditRating] = useState<number>(0);
  const [editComment, setEditComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Lấy thông tin user hiện tại từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser.id;

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await feedbackService.getCourseFeedback(courseId);
        setFeedbacks(response.data || response);

        setError(null);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setError("Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [courseId]);

  const showMoreFeedbacks = () => {
    setVisibleFeedbacks((prev) => prev + 4);
  };

  const handleEditFeedback = (feedback: FeedbackItem) => {
    setEditFeedback(feedback);
    setEditRating(feedback.rating);
    setEditComment(feedback.comment || "");
    setIsEditModalVisible(true);
  };

  const handleSubmitEdit = async () => {
    if (!editFeedback) return;

    setSubmitting(true);
    try {
      await feedbackService.updateFeedback(courseId, currentUserId, {
        rating: editRating,
        comment: editComment,
      });

      const updatedFeedbacks = feedbacks.map((feedback) =>
        feedback.id === editFeedback.id
          ? { ...feedback, rating: editRating, comment: editComment }
          : feedback
      );

      setFeedbacks(updatedFeedbacks);
      setIsEditModalVisible(false);
      message.success("Feedback updated successfully");
    } catch (error) {
      console.error("Error updating feedback:", error);
      message.error("Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedback: FeedbackItem) => {
    try {
      await feedbackService.deleteFeedback(courseId, currentUserId);
      setFeedbacks(feedbacks.filter((f) => f.id !== feedback.id));
    } catch (error) {
      console.error("Error deleting feedback:", error);
      message.error("Failed to delete feedback");
    }
  };

  if (loading) {
    return (
      <div className="mt-8 flex justify-center items-center min-h-[200px]">
        <Spin tip="Loading feedbacks..." />
      </div>
    );
  }

  if (error) {
    return <div className="mt-8 text-red-500 text-center">{error}</div>;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-extrabold text-white mb-6 uppercase">
          <span className="text-[#3b82f6] mr-2">//</span>
          Student Feedbacks
        </h2>
        <span className="flex justify-center items-center text-white text-center">
          Course has no feedbacks yet
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-extrabold text-white mb-6 uppercase">
        <span className="text-[#3b82f6] mr-2">//</span>
        Student Feedbacks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/*Slide từ 0 - visibleFeedbacks*/}
        {feedbacks.slice(0, visibleFeedbacks).map((feedback, index) => (
          <div
            key={feedback.id || index}
            className="bg-[#14202e] p-4 border border-[#1c2432] rounded-md hover:border-[#3b82f6] transition-all duration-200 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#482c95] flex items-center justify-center text-white font-medium">
                    {feedback.learner.firstName[0]}
                    {feedback.learner.lastName[0]}
                  </div>
                </div>
                <div className="ml-4">
                  <cite className="text-sm font-semibold uppercase text-gray-100">
                    {feedback.learner?.firstName || "Anonymous"}{" "}
                    {feedback.learner?.lastName || ""}
                  </cite>
                  {/*Star rating*/}
                  <div className="flex items-center mt-1">
                    {/*tạo array mới với 5 index là undefined*/}
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 ${
                          index < feedback.rating
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-400 line-clamp-1">
                      {formatTimeAgo(feedback.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hiển thị nút "..." chỉ khi feedback là của user hiện tại */}
              {feedback.learner.id === currentUserId && (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "1",
                        label: (
                          <span className="flex items-center gap-2 text-blue-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 20 20"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="icon icon-tabler icons-tabler-outline icon-tabler-highlight"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M3 19h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                              <path d="M12.5 5.5l4 4" />
                              <path d="M4.5 13.5l4 4" />
                              <path d="M21 15v4h-8l4 -4z" />
                            </svg>
                            <span className="text-xs font-medium">Edit</span>
                          </span>
                        ),
                        onClick: () => handleEditFeedback(feedback),
                      },
                      {
                        key: "2",
                        label: (
                          <span className="flex items-center gap-2 text-red-600">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 20 22"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M4 7l16 0" />
                              <path d="M10 11l0 6" />
                              <path d="M14 11l0 6" />
                              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                            <span className="text-xs font-medium">Delete</span>
                          </span>
                        ),
                        onClick: () => handleDeleteFeedback(feedback),
                      },
                    ],
                  }}
                  placement="bottomRight"
                  trigger={["click"]}
                  dropdownRender={(menu) => (
                    <div className="bg-[#14202e] border border-[#1c2432] rounded-md shadow-lg py-1">
                      {menu}
                    </div>
                  )}
                >
                  <button className="text-gray-400 hover:text-[#3b82f6] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1c2e48]">
                    <EllipsisOutlined style={{ fontSize: "16px" }} />
                  </button>
                </Dropdown>
              )}
            </div>
            <p className="mt-4 text-gray-300 line-clamp-3 text-sm">
              {feedback.comment || "No comment provided"}
            </p>
          </div>
        ))}
      </div>

      {visibleFeedbacks < feedbacks.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={showMoreFeedbacks}
            className="px-6 py-3 bg-[#1b55ac] text-white font-medium rounded-md hover:bg-[#3b82f6] transition-colors shadow-md"
          >
            See More Feedback
          </button>
        </div>
      )}

      {/* Modal chỉnh sửa feedback */}
      <Modal
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        centered
        styles={{
          content: {
            backgroundColor: "#14202e",
            borderRadius: "8px",
            border: "1px solid #1c2432",
          },
          header: {
            backgroundColor: "#14202e",
            borderBottom: "1px solid #1c2432",
          },
          body: {
            padding: "20px",
          },
          mask: {
            backdropFilter: "blur(4px)",
          },
        }}
        closeIcon={<span className="text-white hover:text-[#3b82f6]">×</span>}
      >
        <div style={{ marginBottom: 16 }}>
          <p className="text-white mb-2">Your rating:</p>
          <Rate
            value={editRating}
            onChange={setEditRating}
            style={{ fontSize: 24 }}
            // character={<span className="text-yellow-400">★</span>}
          />
        </div>
        <div className="mb-6">
          <p className="text-white mb-2">Your comment:</p>
          <Input.TextArea
            rows={4}
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            placeholder="Write your comment here..."
            style={{
              backgroundColor: "#1c2e49",
              border: "1px solid #1c2432",
              color: "white",
            }}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button
            onClick={() => setIsEditModalVisible(false)}
            style={{
              backgroundColor: "transparent",
              borderColor: "#1c2432",
              color: "white",
            }}
            className="hover:bg-[#1c2e48] hover:border-[#3b82f6]"
          >
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={handleSubmitEdit}
            className="bg-[#1b55ac] hover:bg-[#3b82f6] border-none text-white"
          >
            Update
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseFeedback;
