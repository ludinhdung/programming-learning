// src/components/SupporterManagement/Contents/LearnerManagement/SupporterManageLearnerComments.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { List } from "antd";

interface CommentType {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string };
  lessonId: string;
  content: string;
  createdAt: string;
}

const LearnerComment: React.FC = () => {
  const { learnerId } = useParams<{ learnerId: string }>(); // Extract learnerId
  const [comments, setComments] = useState<CommentType[]>([]);

  const fetchComments = async () => {
    // Mock data for comments
    const mockComments: CommentType[] = [
      {
        id: "1",
        userId: learnerId!,
        user: { firstName: "John", lastName: "Doe" },
        lessonId: "lesson1",
        content: "This is a comment from the learner.",
        createdAt: "2023-10-01T12:00:00Z",
      },
      {
        id: "2",
        userId: learnerId!,
        user: { firstName: "John", lastName: "Doe" },
        lessonId: "lesson1",
        content: "Another comment from the learner.",
        createdAt: "2023-10-02T12:00:00Z",
      },
    ];
    setComments(mockComments);
  };

  useEffect(() => {
    if (learnerId) {
      fetchComments();
    }
  }, [learnerId]);

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-400 p-8">
      <h2>Comments for Learner ID: {learnerId}</h2>
      <List
        className="comment-list"
        header={`${comments.length} comments`}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={(item) => <li></li>}
      />
    </div>
  );
};

export default LearnerComment;
