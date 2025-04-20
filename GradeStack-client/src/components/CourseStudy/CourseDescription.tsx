import React, { useState } from "react";
import { Course, Comment, User, Lesson } from "./CourseStudyBoard";
import { message, Tabs } from "antd";
import type { TabsProps } from "antd";
import { Input, Select, Button, Tooltip } from "antd";
import styled from "styled-components";
import "../../styles/TabStudyCourseStyles.css";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { Note } from "./Contents/VideoContent";
import { formatDuration } from "../../utils/formatDuration";
import NoteComponent from "./NoteComponet";
const NotesContainer = styled.div`
  margin-top: 20px;
`;

const CreateNoteInput = styled.div`
  position: relative;
  margin-bottom: 20px;

  .ant-input {
    padding: 12px 40px 12px 16px;
    border-radius: 8px;
    background: #1c2936;
    border: 1px solid #29334a;
    font-size: 15px;
    color: #e5e7eb;

    &::placeholder {
      color: #6b7280;
    }

    &:hover,
    &:focus {
      border-color: #3b82f6;
      box-shadow: none;
    }
  }

  .action-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #3b82f6;
    cursor: pointer;
    font-size: 18px;
  }
`;

const EditorContainer = styled.div`
  margin-bottom: 20px;
  background: #1c2936;
  border-radius: 8px;
  border: 1px solid #29334a;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #374151;
  background: #29334a;
  justify-content: space-between;

  .toolbar-left {
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }

  .toolbar-btn {
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;

    &:hover {
      background: #1c2936;
      color: #e5e7eb;
    }
  }
`;

const EditorContent = styled.div`
  padding: 16px;
  min-height: 120px;
  background: #1c2936;

  textarea {
    width: 100%;
    min-height: 100px;
    border: none;
    resize: none;
    outline: none;
    font-size: 15px;
    line-height: 1.5;
    color: #e5e7eb;
    background: transparent;

    &::placeholder {
      color: #6b7280;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .ant-select {
    min-width: 150px;

    .ant-select-selector {
      background: #1c2936 !important;
      border-color: #29334a !important;
      color: #e5e7eb !important;
    }

    .ant-select-arrow {
      color: #6b7280;
    }
  }
`;

const NoteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1c2936;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #29334a;

  .timestamp {
    color: #ffd60a;
    font-weight: 500;
    font-size: 14px;
    min-width: 50px;
    cursor: pointer;
  }

  .lecture-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;

    .lecture-title {
      font-weight: 600;
      color: #e5e7eb;
    }

    .note-text {
      color: #9ca3af;
    }
  }

  .actions {
    display: flex;
    gap: 12px;

    .action-btn {
      color: #6b7280;
      cursor: pointer;
      font-size: 16px;

      &:hover {
        color: #3b82f6;
      }

      &.delete:hover {
        color: #ef4444;
      }
    }
  }
`;

interface NotesSectionProps {
  currentTime: number;
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  lectureTitle: string;
  onJumpToTimestamp: (timestamp: number) => void;
  onPlayVideo: () => void;
  onPauseVideo: () => void;
  formatTime: (seconds: number) => string;
}

const { Option } = Select;

interface CourseDescriptionProps {
  lesson: Lesson | null;
  course: Course;
  comments: Comment[];
  users: User[];
  onUpdateProgress: (progress: number) => Promise<void>;
  progress: number;
  isEnrolled: boolean;
  // đánh dấu hoàn thành
  onMarkComplete: (lessonId: string) => Promise<void>;
  // hiển thị trạng thái hoàn thành
  completedLessons: string[];
}

const onChange = (key: string) => {
  console.log(key);
};

const CourseDescription: React.FC<CourseDescriptionProps> = ({
  lesson,
  course,
  comments,
  users,
  isEnrolled,
  onMarkComplete,
  completedLessons,
}) => {
  const handleMarkAsComplete = async () => {
    if (!isEnrolled || !lesson) {
      message.warning("Please enroll in the course first!");
      return;
    }

    await onMarkComplete(lesson.id);
  };

  const renderTab1Content = () => {
    if (!lesson) return null;

    return (
      <div className="bg-[#0e1721] rounded-md border border-blue-400/15 py-6 text-white">
        <div className="px-6">
          <div className="flex flex-col items-center space-y-6">
            <p className="text-gray-300 text-center text-3xl font-extrabold pt-2">
              {lesson.title}
            </p>
            <div>
              <dl className="flex mx-auto space-x-6 divide-x divide-blue-400/20">
                <div>
                  <dt className="text-xs text-gray-400">Lesson</dt>
                  <dd className="text-base font-semibold text-gray-300">
                    {lesson.order}
                  </dd>
                </div>
                <div className="pl-6">
                  <dt className="text-xs text-gray-400">Published</dt>
                  <dd className="text-base font-semibold text-gray-300">
                    {course.createdAt.toLocaleDateString()}
                  </dd>
                </div>
                <div className="pl-6">
                  <dt className="text-xs text-gray-400">Duration</dt>
                  <dd className="text-base font-semibold text-gray-300">
                    {lesson.content.video
                      ? formatDuration(lesson.content.video.duration)
                      : lesson.content.finalTest
                        ? `${lesson.duration}m`
                        : "N/A"}
                  </dd>
                </div>
                <div className="pl-6">
                  <dt className="text-xs text-gray-400">Topic</dt>
                  {course.CourseTopic &&
                    course.CourseTopic.map((topic) => (
                      <dd className="text-base font-semibold text-gray-300">
                        {topic.name}
                      </dd>
                    ))}
                </div>
              </dl>
            </div>
            <div className="flex justify-between items-center space-x-6">
              <div className="flex">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
                  </svg>
                  Bookmark
                </button>
              </div>

              <div className="flex items-center justify-center w-1.5 h-1.5 bg-blue-400/20 rounded-full"></div>

              <div className="flex space-x-4">
                <button
                  onClick={handleMarkAsComplete}
                  disabled={!isEnrolled || completedLessons.includes(lesson?.id || "")}
                  className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${!isEnrolled
                    ? "bg-gray-700 cursor-not-allowed"
                    : completedLessons.includes(lesson?.id || "")
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {completedLessons.includes(lesson?.id || "") ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-[#1c2432] py-4 px-8 rounded-lg border border-blue-400/20">
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">//</span>
                <span className="text-blue-400/90 text-lg font-semibold">About This Lesson</span>
              </div>
              <p className="text-gray-300 mt-4 text-base">
                "{lesson.description}"
              </p>
            </div>

            <div className="flex items-stretch mt-8">
              <div className="flex-shrink-0 w-40 h-full">
                <img
                  src={course.instructor?.avatar || course.instructor?.user?.avatarUrl}
                  className="w-full h-[200px] object-cover rounded-lg"
                  alt="Author"
                />
              </div>
              <div className="flex flex-col bg-[#1c2432] px-6 py-6 ml-4 w-full rounded-lg border border-blue-400/20">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl text-gray-200 font-bold">Author</p>
                    <span className="text-blue-400/90 font-medium">
                      {course.instructor?.user
                        ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
                        : "Your Instructor"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                      <svg
                        viewBox="0 0 30 29"
                        className="mr-2"
                        width="20"
                      >
                        <path
                          className="fill-current"
                          fillRule="nonzero"
                          d="M27.959 7.434a14.866 14.866 0 0 0-5.453-5.414C20.21.69 17.703.025 14.984.025c-2.718 0-5.226.665-7.521 1.995A14.864 14.864 0 0 0 2.01 7.434C.67 9.714 0 12.202 0 14.901c0 3.242.953 6.156 2.858 8.746 1.906 2.589 4.367 4.38 7.385 5.375.351.064.611.019.78-.136a.755.755 0 0 0 .254-.58l-.01-1.047c-.007-.658-.01-1.233-.01-1.723l-.448.077a5.765 5.765 0 0 1-1.083.068 8.308 8.308 0 0 1-1.356-.136 3.04 3.04 0 0 1-1.308-.58c-.403-.304-.689-.701-.858-1.192l-.195-.445a4.834 4.834 0 0 0-.614-.988c-.28-.362-.563-.607-.85-.736l-.136-.097a1.428 1.428 0 0 1-.253-.233 1.062 1.062 0 0 1-.176-.271c-.039-.09-.007-.165.098-.223.104-.059.292-.087.566-.087l.39.058c.26.052.582.206.965.465.384.258.7.594.947 1.007.299.53.66.933 1.082 1.21.423.278.85.417 1.278.417.43 0 .8-.032 1.112-.097a3.9 3.9 0 0 0 .878-.29c.117-.866.436-1.53.956-1.996a13.447 13.447 0 0 1-2-.348 7.995 7.995 0 0 1-1.833-.756 5.244 5.244 0 0 1-1.571-1.298c-.416-.516-.758-1.195-1.024-2.034-.267-.84-.4-1.808-.4-2.905 0-1.563.514-2.893 1.541-3.99-.481-1.176-.436-2.493.137-3.952.377-.116.936-.03 1.678.261.741.291 1.284.54 1.629.746.345.207.621.381.83.523a13.948 13.948 0 0 1 3.745-.503c1.288 0 2.537.168 3.747.503l.741-.464c.507-.31 1.106-.595 1.795-.853.69-.258 1.216-.33 1.58-.213.586 1.46.638 2.777.156 3.951 1.028 1.098 1.542 2.428 1.542 3.99 0 1.099-.134 2.07-.4 2.916-.267.846-.611 1.524-1.034 2.034-.423.51-.95.94-1.58 1.288a8.01 8.01 0 0 1-1.834.756c-.592.155-1.259.271-2 .349.676.58 1.014 1.498 1.014 2.75v4.087c0 .232.081.426.244.58.163.155.42.2.77.136 3.019-.994 5.48-2.786 7.386-5.375 1.905-2.59 2.858-5.504 2.858-8.746 0-2.698-.671-5.187-2.01-7.466z"
                        ></path>
                      </svg>
                      Follow
                    </button>
                  </div>
                </div>
                <p className="mt-6 text-gray-300 text-base">
                  {course.instructor?.bio ||
                    `Hi, ${course.instructor?.user?.firstName || "Instructor"}. I'm the creator of GradeStacks and spend most of my days building the site and thinking of new ways to teach confusing concepts. I live in Orlando, Florida with my wife and two kids.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTab2Content = () => (
    <div className="bg-[#0e1721] rounded-md border border-blue-400/15 py-6 text-white">
      <div className="px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-200">Discussion</h2>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
            New Discussion
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1c2432] p-6 rounded-lg border border-blue-400/20">
            <div className="flex items-start space-x-4">
              <img
                src="https://www.gravatar.com/avatar/0d21dcc25204fa226e115bbdfe2aa4af742ec76c2a8093bbfe9722a181327ea9?s=100&d=https%3A%2F%2Flaracasts.nyc3.digitaloceanspaces.com%2Fmembers%2Favatars%2Fdefault%2F24.png"
                className="w-12 h-12 rounded-full"
                alt="User"
              />
              <div className="flex-1">
                <textarea
                  className="w-full h-32 px-4 py-3 text-sm text-white bg-[#2a3441] border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write a reply..."
                />
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => {
              const user = users.find((user) => user.id === comment.userId);
              const fullName = user
                ? `${user.firstName} ${user.lastName}`
                : "Unknown User";
              return (
                <div key={comment.id} className="bg-[#1c2432] rounded-lg border border-blue-400/20">
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        className="w-12 h-12 rounded-full"
                        src={`https://unavatar.io/github/${comment.userId}`}
                        alt={comment.userId}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-200">
                              {fullName}
                            </h3>
                            <span className="text-xs text-gray-400">
                              Posted {comment.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          <button className="text-gray-400 hover:text-blue-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">
                          {comment.content}
                        </p>
                        <div className="flex items-center mt-4 space-x-4">
                          <button className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            Like
                          </button>
                          <button className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {comment.replies.length > 0 && (
                    <div className="pl-20 pr-6 pb-6">
                      {comment.replies.map((reply) => {
                        const replyUser = users.find(
                          (user) => user.id === reply.userId
                        );
                        const replyFullName = replyUser
                          ? `${replyUser.firstName} ${replyUser.lastName}`
                          : "Unknown User";
                        return (
                          <div
                            key={reply.id}
                            className="bg-[#2a3441] p-4 rounded-lg border border-blue-400/20"
                          >
                            <div className="flex items-start space-x-4">
                              <img
                                className="w-10 h-10 rounded-full"
                                src={`https://unavatar.io/github/${reply.userId}`}
                                alt={reply.userId}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-200">
                                      {replyFullName}
                                    </h4>
                                    <span className="text-xs text-gray-400">
                                      Posted {reply.createdAt.toLocaleDateString()}
                                    </span>
                                  </div>
                                  <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-300">
                                  {reply.content}
                                </p>
                                <div className="flex items-center mt-4 space-x-4">
                                  <button className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                    Like
                                  </button>
                                  <button className="flex items-center text-sm text-gray-400 hover:text-blue-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                    </svg>
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const NotesSection: React.FC<NotesSectionProps> = ({
    currentTime,
    notes,
    setNotes,
    lectureTitle,
    onJumpToTimestamp,
    onPlayVideo,
    onPauseVideo,
    formatTime,
  }) => {
    const [noteText, setNoteText] = useState<string>("");
    const [filter, setFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("recent");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    const getExistingNoteAtTime = (time: number) => {
      return notes.find((note) => Math.abs(note.timestamp - time) < 1);
    };

    const handleStartEditing = () => {
      const existingNote = getExistingNoteAtTime(currentTime);
      if (existingNote) {
        setEditingNoteId(existingNote.id);
        setNoteText(existingNote.text);
      } else {
        setEditingNoteId(null);
        setNoteText("");
      }
      onPauseVideo();
      setIsEditing(true);
    };

    const handleCancelEditing = () => {
      setIsEditing(false);
      setNoteText("");
      setEditingNoteId(null);
    };

    const handleSaveNote = () => {
      if (noteText.trim()) {
        if (editingNoteId) {
          setNotes((prev) =>
            prev.map((note) =>
              note.id === editingNoteId
                ? { ...note, text: noteText.trim() }
                : note
            )
          );
        } else {
          const newNote: Note = {
            id: Date.now().toString(),
            timestamp: currentTime,
            lectureTitle,
            text: noteText.trim(),
          };
          setNotes((prev) => [...prev, newNote]);
        }
        setIsEditing(false);
        setNoteText("");
        setEditingNoteId(null);
      }
    };

    const handleSaveAndPlay = () => {
      handleSaveNote();
      onPlayVideo();
    };

    const handleDeleteNote = (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    };

    return (
      <NotesContainer>
        {isEditing ? (
          <EditorContainer>
            <EditorToolbar>
              <div className="toolbar-left">
                <Tooltip title="Bold">
                  <BoldOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Italic">
                  <ItalicOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Ordered List">
                  <OrderedListOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Unordered List">
                  <UnorderedListOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Code">
                  <CodeOutlined className="toolbar-btn" />
                </Tooltip>
              </div>
              <div className="toolbar-right">
                <Button
                  type="text"
                  onClick={handleCancelEditing}
                  style={{ color: "#6b7280" }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSaveNote}
                  style={{ background: "#3b82f6", marginRight: "8px" }}
                >
                  Save
                </Button>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleSaveAndPlay}
                  style={{ background: "#10b981" }}
                >
                  Save & Play
                </Button>
              </div>
            </EditorToolbar>
            <EditorContent>
              <textarea
                placeholder="Type your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
            </EditorContent>
          </EditorContainer>
        ) : (
          <CreateNoteInput>
            <Input
              placeholder={
                getExistingNoteAtTime(currentTime)
                  ? `Edit note at ${formatTime(currentTime)}`
                  : `Create a new note at ${formatTime(currentTime)}`
              }
              onClick={handleStartEditing}
              readOnly
            />
            <Tooltip
              title={
                getExistingNoteAtTime(currentTime) ? "Edit note" : "Add note"
              }
            >
              <div
                className="action-button"
                onClick={handleStartEditing}
                style={{
                  color: getExistingNoteAtTime(currentTime)
                    ? "#ffd60a"
                    : "#3b82f6",
                }}
              >
                {getExistingNoteAtTime(currentTime) ? (
                  <EditOutlined />
                ) : (
                  <PlusOutlined />
                )}
              </div>
            </Tooltip>
          </CreateNoteInput>
        )}

        <FilterContainer>
          <Select defaultValue="all" onChange={setFilter}>
            <Option value="all">All lectures</Option>
            <Option value="current">Current lecture</Option>
          </Select>
          <Select defaultValue="recent" onChange={setSortBy}>
            <Option value="recent">Sort by most recent</Option>
            <Option value="oldest">Sort by oldest</Option>
            <Option value="timestamp">Sort by timestamp</Option>
          </Select>
        </FilterContainer>

        {notes
          .sort((a, b) => {
            switch (sortBy) {
              case "oldest":
                return parseInt(a.id) - parseInt(b.id);
              case "timestamp":
                return a.timestamp - b.timestamp;
              default:
                return parseInt(b.id) - parseInt(a.id);
            }
          })
          .filter(
            (note) => filter === "all" || note.lectureTitle === lectureTitle
          )
          .map((note) => (
            <NoteItem key={note.id}>
              <div
                className="timestamp"
                onClick={() => onJumpToTimestamp(note.timestamp)}
              >
                {formatTime(note.timestamp)}
              </div>
              <div className="lecture-info">
                <div className="lecture-title">{note.lectureTitle}</div>
                <div className="note-text">{note.text}</div>
              </div>
              <div className="actions">
                <EditOutlined
                  className="action-btn"
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setNoteText(note.text);
                    setIsEditing(true);
                    onPauseVideo();
                    onJumpToTimestamp(note.timestamp);
                  }}
                />
                <DeleteOutlined
                  className="action-btn delete"
                  onClick={() => handleDeleteNote(note.id)}
                />
              </div>
            </NoteItem>
          ))}
      </NotesContainer>
    );
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: (
        <span className="text-gray-200 text-lg font-semibold">Overview</span>
      ),
      children: renderTab1Content(),
    },
    {
      key: "2",
      label: (
        <span className="text-gray-200 text-lg font-semibold">Discuss</span>
      ),
      children: renderTab2Content(),
    },
    {
      key: "3",
      label: (
        <span className="text-gray-200 text-lg font-semibold">Notes</span>
      ),
      children: (
        <NoteComponent lessonId={lesson?.id} />
      )
    }
    // {
    //   key: "3",
    //   label: <span className="text-gray-200 text-lg font-semibold">Notes</span>,
    //   children: (
    //     <NotesSection
    //       currentTime={currentTime} // Replace with actual current time value
    //       notes={notes} // Replace with actual notes array
    //       setNotes={setNotes} // Replace with actual setNotes function
    //       lectureTitle={lectureTitle} // Replace with actual lecture title
    //       onJumpToTimestamp={onJumpToTimestamp} // Replace with actual function
    //       onPlayVideo={onPlayVideo} // Replace with actual function
    //       onPauseVideo={onPauseVideo} // Replace with actual function
    //       formatTime={formatTime} // Replace with actual function
    //     />
    //   ),
    // },
  ];

  return (
    <div>
      <div>
        <Tabs
          className="!border-none"
          defaultActiveKey="1"
          items={items}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
export default CourseDescription;