// src/components/SupporterManagement/Contents/LearnerManagement/SupporterManageLearnerComments.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { List, Card, Spin, message, Tag } from "antd";
import { supporterService } from "../../../../services/api";
import dayjs from "dayjs";
import { WarningOutlined } from "@ant-design/icons";

interface CommentType {
  id: string;
  content: string;
  createdAt: string;
  lesson: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    replies: number;
  };
  isInappropriate?: boolean;
  inappropriateReason?: string;
}

const LearnerComment: React.FC = () => {
  const { learnerId } = useParams<{ learnerId: string }>();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);

  // List of inappropriate words to check for
  const inappropriateWords = [
    "fuck",
    "shit",
    "damn",
    "bitch",
    "asshole",
    "bastard",
    "cunt",
    "dick",
    "pussy",
    "piss",
    "cock",
    "whore",
    "slut",
    "đụ",
    "địt",
    "lồn",
    "cặc",
    "đéo",
    "đm",
    "đcm",
    "vl",
    "vcl",
    "clm",
  ];

  // Function to check if a comment contains inappropriate content
  const checkForInappropriateContent = (
    content: string
  ): { isInappropriate: boolean; reason: string } => {
    const lowerContent = content.toLowerCase();

    // Check for inappropriate words
    for (const word of inappropriateWords) {
      if (lowerContent.includes(word)) {
        return {
          isInappropriate: true,
          reason: `Contains inappropriate language: "${word}"`,
        };
      }
    }

    // Check for excessive symbols that might indicate spam
    const symbolPattern = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{5,}/;
    if (symbolPattern.test(content)) {
      return {
        isInappropriate: true,
        reason: "Contains excessive symbols (possible spam)",
      };
    }

    return { isInappropriate: false, reason: "" };
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await supporterService.getCommentsByLearnerId(
        learnerId!
      );

      // Process comments to check for inappropriate content
      const processedComments = response.map((comment: CommentType) => {
        const { isInappropriate, reason } = checkForInappropriateContent(
          comment.content
        );
        return {
          ...comment,
          isInappropriate,
          inappropriateReason: reason,
        };
      });

      setComments(processedComments);

      // Save inappropriate comments count to localStorage
      if (learnerId) {
        const inappropriateCount = processedComments.filter(
          (comment: CommentType) => comment.isInappropriate
        ).length;

        // Save to localStorage with learnerId as key
        localStorage.setItem(
          `inappropriateComments_${learnerId}`,
          inappropriateCount.toString()
        );
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      message.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (learnerId) {
      fetchComments();
    }
  }, [learnerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Count inappropriate comments
  const inappropriateCount = comments.filter(
    (comment) => comment.isInappropriate
  ).length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-400 p-8">
      <div className="flex justify-between items-center mb-8">
        <p className="text-3xl font-bold">
          {comments.length > 0
            ? (<>
            <span className="text-blue-600 mr-1">
              {comments[0].user.firstName} {comments[0].user.lastName}
            </span>
            <span >
              Comments
            </span>
            </>)
            : "Learner Comments"}
        </p>
        {inappropriateCount > 0 && (
          <Tag
            color="red"
            icon={<WarningOutlined />}
            className="text-base px-3 py-1"
          >
            {inappropriateCount} inappropriate{" "}
            {inappropriateCount === 1 ? "comment" : "comments"} detected
          </Tag>
        )}
      </div>

      <List
        className="comment-list"
        itemLayout="vertical"
        dataSource={comments}
        renderItem={(comment) => (
          <Card
            className="mb-4"
            bordered={true}
            style={{
              borderLeft: comment.isInappropriate
                ? "5px solid #ff4d4f"
                : "none",
              background: comment.isInappropriate ? "#fff2f0" : "white",
            }}
          >
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <span className="text-lg font-bold block">
                  {comment.lesson.title}
                </span>
                <div className="mt-2">
                  <p>{comment.content}</p>
                </div>
                {comment.isInappropriate && (
                  <div className="mt-2">
                    <Tag color="red" icon={<WarningOutlined />}>
                      {comment.inappropriateReason}
                    </Tag>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-gray-500 text-sm">
                  {dayjs(comment.createdAt).format("MMM D, YYYY h:mm A")}
                </span>
                {comment._count.replies > 0 && (
                  <div className="mt-1">
                    <span className="text-gray-500 text-sm">
                      {comment._count.replies}{" "}
                      {comment._count.replies === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default LearnerComment;
