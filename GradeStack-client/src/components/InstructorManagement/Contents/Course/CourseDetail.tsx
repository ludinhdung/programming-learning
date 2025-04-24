import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { instructorService, feedbackService } from "../../../../services/api";
import { formatDuration } from "../../../../utils/formatDuration";
import { formatVND } from "../../../../utils/formatCurrency";
import { message, Rate, Spin, Empty } from "antd";
import EditModuleDrawer from "./EditModuleDrawer";
import CreateModuleDrawer from "./CreateModuleDrawer";
import { formatTimeAgo } from "../../../../utils/formatTimeAgo";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  videoDuration: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
  isPreview: boolean;
  video?: {
    id: string;
    lessonId: string;
    url: string;
    thumbnailUrl: string | null;
    duration: number;
  };
  coding?: {
    id: string;
    lessonId: string;
    language: string;
    problem: string;
    hint: string;
    solution: string;
    codeSnippet: string;
  };
  finalTest?: {
    estimatedDuration: number;
    questions: Array<{
      content: string;
      order: number;
      answers: Array<{
        content: string;
        isCorrect: boolean;
      }>;
    }>;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  averageRating: number;
  price: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  CourseTopic: {
    topic: {
      id: string;
      name: string;
      thumbnail: string;
      description: string;
    };
  }[];
  modules: Module[];
  _count: {
    EnrolledCourse: number;
  };
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

interface EnrolledStudent {
  id: string;
  progress: number;
  enrolledAt: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [studentsEnrolledCourse, setStudentsEnrolledCourse] = useState<
    EnrolledStudent[]
  >([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("User not found. Please login again.");
          return;
        }

        const user = JSON.parse(userData);

        const data = await instructorService.getCourse(user.id, courseId!);
        console.log("data", data);

        // Transform the data to match the Module type
        const transformedData = {
          ...data,
          modules: data.modules.map((module: Module) => ({
            ...module,
            lessons: module.lessons.map((lesson: Lesson) => ({
              ...lesson,
              content: {
                ...(lesson.lessonType === "VIDEO" && {
                  video: {
                    url: lesson.video?.url || "",
                  },
                }),
                ...(lesson.lessonType === "CODING" && {
                  coding: {
                    language: lesson.coding?.language,
                    problem: lesson.coding?.problem || "",
                    solution: lesson.coding?.solution || "",
                    hint: lesson.coding?.hint || "",
                    codeSnippet: lesson.coding?.codeSnippet || "",
                  },
                }),
                ...(lesson.lessonType === "FINAL_TEST" && {
                  finalTest: {
                    estimatedDuration: lesson.finalTest?.estimatedDuration || 0,
                    questions:
                      lesson.finalTest?.questions?.map((q) => ({
                        content: q.content,
                        order: q.order,
                        answers:
                          q.answers?.map((a) => ({
                            content: a.content,
                            isCorrect: a.isCorrect,
                          })) || [],
                      })) || [],
                  },
                }),
              },
            })),
            // Tính toán lại tổng duration cho module
            videoDuration: module.lessons.reduce((total, lesson) => {
              if (lesson.lessonType === "VIDEO") {
                return total + (lesson.video?.duration || 0);
              } else if (lesson.lessonType === "FINAL_TEST") {
                // Chuyển từ phút sang giây
                return total + (lesson.finalTest?.estimatedDuration || 0) * 60;
              }
              return total;
            }, 0),
          })),
        };
        console.log("transformedData", transformedData);
        setCourse(transformedData);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Failed to fetch course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchStudentsEnrolledCourse = async () => {
      try {
        const response = await instructorService.getStudentEnrolledCourses(
          courseId!
        );
        console.log("response", response);
        setStudentsEnrolledCourse(response.data);
      } catch (error) {
        console.error("Error fetching students enrolled course:", error);
      }
    };
    fetchStudentsEnrolledCourse();
  }, [courseId]);

  useEffect(() => {
    // Load feedbacks when feedback tab is active
    if (activeTab === "feedback" && courseId) {
      const fetchFeedbacks = async () => {
        try {
          setFeedbackLoading(true);
          const response = await feedbackService.getCourseFeedback(courseId);
          setFeedbacks(response.data || response);
          setFeedbackError(null);
        } catch (error) {
          console.error("Error fetching feedbacks:", error);
          setFeedbackError("Failed to load feedbacks");
        } finally {
          setFeedbackLoading(false);
        }
      };

      fetchFeedbacks();
    }
  }, [activeTab, courseId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <h2 className="text-xl font-bold">Loading course details...</h2>
          <p className="text-gray-500">
            Please wait while we fetch the course information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <p className="text-gray-500">
            The course you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsEditDrawerOpen(true);
  };
  //Update module theo state local
  const handleSaveModule = async (updatedModule: Module) => {
    try {
      // Tính toán videoDuration từ tất cả lessons
      const totalDuration = updatedModule.lessons.reduce((total, lesson) => {
        if (lesson.lessonType === "VIDEO") {
          return total + (lesson.video?.duration || 0);
        } else if (lesson.lessonType === "FINAL_TEST") {
          // Chuyển từ phút sang giây
          return total + (lesson.finalTest?.estimatedDuration || 0) * 60;
        }
        return total;
      }, 0);
      await instructorService.updateModule(updatedModule.id, {
        title: updatedModule.title,
        description: updatedModule.description,
        videoDuration: totalDuration,
      });

      // Fetch lại toàn bộ dữ liệu course để có thông tin mới nhất
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);
      const updatedCourse = await instructorService.getCourse(
        user.id,
        courseId!
      );

      const transformedCourse = {
        ...updatedCourse,
        modules: updatedCourse.modules.map((module: Module) => ({
          ...module,
          lessons: module.lessons.map((lesson: Lesson) => ({
            ...lesson,
            content: {
              ...(lesson.lessonType === "VIDEO" && {
                video: {
                  url: lesson.video?.url || "",
                  duration: lesson.video?.duration || 0,
                },
              }),
            },
          })),
        })),
      };

      setCourse(transformedCourse);
    } catch (error) {
      message.error("Failed to update module");
      console.error("Failed to update module:", error);
    }
  };
  // Create module
  const handleCreateModule = async (values: {
    title: string;
    description: string;
  }) => {
    try {
      const newModule = await instructorService.createModule(courseId!, values);

      // Transform module data giống như trong useEffect
      const transformedModule = {
        ...newModule,
        lessons: (newModule.lessons || []).map((lesson: Lesson) => ({
          ...lesson,
          content: {
            ...(lesson.lessonType === "VIDEO" && {
              video: {
                url: lesson.video?.url || "",
              },
            }),
            ...(lesson.lessonType === "CODING" && {
              coding: {
                language: lesson.coding?.language,
                problem: lesson.coding?.problem || "",
                solution: lesson.coding?.solution || "",
                hint: lesson.coding?.hint || "",
                codeSnippet: lesson.coding?.codeSnippet || "",
              },
            }),
            ...(lesson.lessonType === "FINAL_TEST" && {
              finalTest: {
                estimatedDuration: lesson.finalTest?.estimatedDuration || 0,
                questions:
                  lesson.finalTest?.questions?.map((q) => ({
                    content: q.content,
                    order: q.order,
                    answers:
                      q.answers?.map((a) => ({
                        content: a.content,
                        isCorrect: a.isCorrect,
                      })) || [],
                  })) || [],
              },
            }),
          },
        })),
      };

      setCourse((prevCourse) => {
        if (!prevCourse) return null;
        return {
          ...prevCourse,
          modules: [...prevCourse.modules, transformedModule],
        };
      });
      setIsCreateDrawerOpen(false);
      message.success("Module created successfully");
    } catch (error) {
      console.log("Failed to create new module:", error);
      message.error("Failed to create new module");
    }
  };

  const handleConfirmDelete = async () => {
    if (moduleToDelete?.id) {
      try {
        await instructorService.deleteModule(moduleToDelete.id);

        // Refresh course data after deletion
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const updatedCourse = await instructorService.getCourse(
          user.id,
          courseId!
        );
        setCourse(updatedCourse);

        message.success("Module deleted successfully");
      } catch (error) {
        message.error("Failed to delete module");
        console.error("Failed to delete module:", error);
      } finally {
        setShowDeleteConfirm(false);
        setModuleToDelete(null);
      }
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="grid gap-6">
          {/* Course Header */}
          <div className="col-span-12">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-200 shadow">
              <img
                src={
                  course.thumbnail ||
                  "https://images.laracasts.com/series/thumbnails/svg/livewire-uncovered.svg?tr=w-200"
                }
                alt={course.title}
                className="h-64 w-full object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{course.title}</h2>
                      <Rate
                        disabled
                        allowHalf
                        defaultValue={course.averageRating}
                      />
                    </div>
                    <div className="mt-2 flex gap-2 items-center">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          course.isPublished
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {course.isPublished ? "Published" : "Pending Approval"}
                      </span>
                      <span className="h-10 w-10">
                        <img
                          className="rounded-md"
                          src={course.CourseTopic[0]?.topic.thumbnail}
                          alt={course.CourseTopic[0]?.topic.name}
                        />
                      </span>
                    </div>
                    <p className="mt-4 text-gray-600">{course.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatVND(course.price)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Stats */}
          <div className="col-span-12">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-gray-200 bg-gray-200 p-4 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-200 p-2">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-medium">
                      {formatDuration(
                        course.modules.reduce(
                          (total, module) =>
                            total + (module.videoDuration || 0),
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-200 p-4 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-200 p-2">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500">Students enrolled</p>
                    <p className="text-lg font-medium">
                      {course?._count?.EnrolledCourse || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-200 p-4 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-200 p-2">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500">Modules</p>
                    <p className="text-lg font-medium">
                      {course.modules.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-200 p-4 shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-200 p-2">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-lg font-medium">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="col-span-12">
            <div className="rounded-lg border border-gray-200 bg-gray-200 shadow">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "modules"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("modules")}
                  >
                    Modules
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "students"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("students")}
                  >
                    Students
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "feedback"
                        ? "border-b-2 border-blue-500 text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab("feedback")}
                  >
                    Feedback
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "modules" && (
                  <>
                    <ul className="space-y-4">
                      {course.modules.map((module) => (
                        <li
                          key={module.id}
                          className="rounded-lg border border-indigo-400 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-blue-600">
                                {module.order}
                              </div>
                              <div className="flex flex-col">
                                <h3 className="font-medium">{module.title}</h3>
                                <p className="mt-1 text-sm text-gray-600 max-w-[850px]">
                                  {module.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatDuration(module.videoDuration || 0)}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditModule(module)}
                                  className="rounded-full bg-blue-200 p-2 font-medium text-blue-800 hover:bg-blue-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                    <path d="M13.5 6.5l4 4" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setModuleToDelete(module);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="rounded-full bg-red-200 p-2 font-medium text-red-800 hover:bg-red-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M4 7h16" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                    <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          <ul className="mt-4 space-y-3 pl-12">
                            {module.lessons.map((lesson) => (
                              <li
                                key={lesson.id}
                                className="flex items-start justify-between rounded-lg border border-gray-300 p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                      lesson.lessonType === "VIDEO"
                                        ? "bg-red-100 text-red-600"
                                        : lesson.lessonType === "CODING"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {lesson.lessonType === "VIDEO" ? (
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                      </svg>
                                    ) : lesson.lessonType === "CODING" ? (
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      {lesson.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-600">
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {lesson.isPreview && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                      Preview
                                    </span>
                                  )}
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {lesson.lessonType === "VIDEO"
                                      ? formatDuration(
                                          lesson.video?.duration || 0
                                        )
                                      : lesson.lessonType === "FINAL_TEST"
                                      ? formatDuration(
                                          (lesson.finalTest
                                            ?.estimatedDuration || 0) * 60
                                        )
                                      : "N/A"}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 font-semibold"
                      >
                        + Add Module
                      </button>
                    </div>
                  </>
                )}

                {activeTab === "students" && (
                  <>
                    {studentsEnrolledCourse.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enrolled Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {studentsEnrolledCourse.map((student) => (
                              <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.learner.firstName}{" "}
                                    {student.learner.lastName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {student.learner.email}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                          width: `${student.progress}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <span className="ml-2 text-sm text-gray-500">
                                      {student.progress}%
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {new Date(
                                      student.enrolledAt
                                    ).toLocaleString()}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <h3 className="text-xl font-bold">
                          No students enrolled
                        </h3>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "feedback" && (
                  <div>
                    {feedbackLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <Spin tip="Loading feedback..." />
                      </div>
                    ) : feedbackError ? (
                      <div className="text-red-500 text-center py-5">
                        {feedbackError}
                      </div>
                    ) : feedbacks.length === 0 ? (
                      <div className="text-center py-8">
                        <Empty description="No feedback available for this course" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {feedbacks.map((feedback) => (
                          <div
                            key={feedback.id}
                            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm bg-gradient-to-r from-blue-200 to-indigo-200 flex items-center justify-center text-indigo-600 font-medium">
                                  {feedback.learner.firstName[0]}
                                  {feedback.learner.lastName[0]}
                                </div>
                                <div className="ml-3">
                                  <h3 className="font-medium text-gray-800">
                                    {feedback.learner.firstName}{" "}
                                    {feedback.learner.lastName}
                                  </h3>
                                  <div className="flex items-center mt-1">
                                    <Rate
                                      disabled
                                      value={feedback.rating}
                                      style={{ fontSize: 14 }}
                                    />
                                    <span className="ml-2 text-xs text-gray-500">
                                      {formatTimeAgo(feedback.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm">
                              {feedback.comment || "No comment provided"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteConfirm && moduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Module</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete module{" "}
              <span className="text-gray-900 font-semibold">
                "{moduleToDelete.title}".
              </span>{" "}
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setModuleToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EditModuleDrawer */}
      {selectedModule && (
        <EditModuleDrawer
          open={isEditDrawerOpen}
          onClose={() => {
            setIsEditDrawerOpen(false);
            setTimeout(() => {
              setSelectedModule(null);
            }, 500);
          }}
          module={selectedModule}
          onSave={handleSaveModule}
        />
      )}
      <CreateModuleDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSubmit={handleCreateModule}
        currentModulesCount={course?.modules.length || 0}
      />
    </>
  );
};

export default CourseDetail;
