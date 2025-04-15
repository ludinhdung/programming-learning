import React, { useState, useEffect } from "react";
import SideBar from "./SideBar";
import CourseDescription from "./CourseDescription";
import VideoContent from "./Contents/VideoContent";
// import CodingContent from "./Contents/CodingContent";
import FinalQuizContent from "./Contents/FinalQuizContent";
import { useParams } from "react-router-dom";
import { learnerService } from "../../services/api";
import { Spin } from "antd";
import PracticeCode from "../../pages/PracticeCode/PracticeCode";
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  thumbnail: string;

  isPublished: boolean;
  instructorId: string;
  instructor?: {
    id?: string;
    userId?: string;
    user?: {
      firstName: string;
      lastName: string;
      email?: string;
      avatarUrl?: string;
    };
    organization?: string;
    avatar?: string;
    bio?: string;
    socials?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  modules: Module[];
  CourseTopic?: Topic[];
}
export interface Topic {
  id: string;
  name: string;
  thumbnail: string;
}

export interface Module {
  order: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  lessonType: LessonType;
  duration?: number;
  isPreview: boolean;
  content: {
    video?: VideoLesson | null;
    coding?: CodingExercise | null;
    finalTest?: FinalTestLesson | null;
  };
  createdAt: Date;
}
export enum LessonType {
  VIDEO,
  CODING,
  FINAL_TEST,
}
export interface VideoLesson {
  url: string;
  duration: number;
}

export interface CodingExercise {
  language: SupportedLanguage;
  problem: string;
  hint?: string;
  solution: string;
  codeSnippet?: string;
}
export enum SupportedLanguage {
  PYTHON = "PYTHON",
  C = "C",
  JAVA = "JAVA",
}
export interface FinalTestLesson {
  estimatedDuration?: number;
  passingScore?: number;
  questions: {
    content: string;
    order: number;
    answers: {
      content: string;
      isCorrect: boolean;
    }[];
  }[];
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  replies: Reply[];
}

const users: User[] = [
  {
    id: "user1",
    firstName: "John",
    lastName: "Doe",
  },
  {
    id: "user2",
    firstName: "Jane",
    lastName: "Smith",
  },
  {
    id: "user3",
    firstName: "Alice",
    lastName: "Johnson",
  },
  {
    id: "user4",
    firstName: "Bob",
    lastName: "Brown",
  },
];
const comments: Comment[] = [
  {
    id: "1",
    userId: "user1",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    createdAt: new Date("2022-01-01T12:00:00Z"),
    replies: [
      {
        id: "2",
        userId: "user2",
        content:
          "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        createdAt: new Date("2022-01-02T12:00:00Z"),
      },
      {
        id: "3",
        userId: "user3",
        content:
          "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        createdAt: new Date("2022-01-03T12:00:00Z"),
      },
    ],
  },
  {
    id: "4",
    userId: "user4",
    content:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    createdAt: new Date("2022-01-04T12:00:00Z"),
    replies: [],
  },
];
const CourseStudyBoard: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(
    null
  );
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        if (!courseId) {
          throw new Error("Course ID is required");
        }

        const response = await learnerService.getCoursebyCourseId(courseId);
        console.log("Course data:", response);

        // Transform API data to match Course interface
        const courseData: Course = {
          id: response.id,
          title: response.title,
          description: response.description,
          price: parseFloat(response.price) || 0,
          duration: response.duration || 0,
          thumbnail: response.thumbnail || "",
          isPublished: response.isPublished,
          instructorId: response.instructorId || response.instructor?.userId,
          instructor: response.instructor
            ? {
                id: response.instructor.id,
                userId: response.instructor.userId,
                user: response.instructor.user,
                organization: response.instructor.organization,
                avatar: response.instructor.avatar,
                bio: response.instructor.bio,
                socials: response.instructor.socials,
              }
            : undefined,
          createdAt: new Date(response.createdAt),
          updatedAt: new Date(response.updatedAt),
          modules: response.modules
            .map((module: Module) => {
              // Check if the module has lessons array
              const moduleLessons = Array.isArray(module.lessons)
                ? module.lessons
                : []; // Use empty array if no lessons available

              return {
                order: module.order || 1,
                title: module.title,
                description: module.description || "",
                lessons: moduleLessons
                  .map((lesson: any) => {
                    // Determine lesson type first
                    const lessonType =
                      typeof lesson.lessonType === "number"
                        ? lesson.lessonType
                        : getLessonType(lesson);

                    // Determine appropriate duration based on lesson type
                    let duration = lesson?.duration || 0;
                    if (
                      lessonType === LessonType.VIDEO &&
                      lesson?.video?.duration
                    ) {
                      duration = lesson.video.duration;
                    } else if (
                      lessonType === LessonType.FINAL_TEST &&
                      lesson?.finalTest?.estimatedDuration
                    ) {
                      duration = lesson.finalTest.estimatedDuration;
                    }

                    return {
                      id: lesson?.id || "",
                      title: lesson?.title || "Untitled Lesson",
                      description: lesson?.description || "",
                      lessonType,
                      duration,
                      isPreview: lesson?.isPreview || false,
                      order: lesson?.order || 1,
                      createdAt: new Date(lesson?.createdAt || new Date()),
                      content: {
                        video: lesson?.video || lesson?.content?.video || null,
                        coding:
                          lesson?.coding || lesson?.content?.coding || null,
                        finalTest:
                          lesson?.finalTest ||
                          lesson?.content?.finalTest ||
                          null,
                      },
                    };
                  })
                  // Sort lessons by order
                  .sort((a, b) => (a.order || 0) - (b.order || 0)),
              };
            })
            // Sort modules by order
            .sort((a, b) => (a.order || 0) - (b.order || 0)),
          CourseTopic: Array.isArray(response.CourseTopic)
            ? response.CourseTopic.map((topic: any) => ({
                id: topic.topicId || topic.id || "",
                name: topic.topic?.name || "",
                thumbnail: topic.topic?.thumbnail || "",
              }))
            : [],
        };

        // Log the transformed course data
        console.log("Transformed course data:", courseData);
        setCourse(courseData);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Helper function to determine lesson type from API response
  const getLessonType = (lesson: any): LessonType => {
    // Handle string-based lessonType from API
    if (lesson.lessonType === "VIDEO") return LessonType.VIDEO;
    if (lesson.lessonType === "CODING") return LessonType.CODING;
    if (lesson.lessonType === "FINAL_TEST") return LessonType.FINAL_TEST;

    // Fall back to content-based detection if lessonType is not a string
    if (lesson.video) return LessonType.VIDEO;
    if (lesson.coding) return LessonType.CODING;
    if (lesson.finalTest) return LessonType.FINAL_TEST;

    return LessonType.VIDEO;
  };

  const renderLessonContent = () => {
    if (loading) {
      return (
        <div className="h-screen w-full flex items-center justify-center">
          <Spin size="large" tip="Loading course content..." />
        </div>
      );
    }
    if (error) {
      return (
        <div className="h-screen w-full flex items-center justify-center text-red-500 text-xl">
          {error}
        </div>
      );
    }
    if (!currentLesson) {
      return (
        <div className="h-screen w-full flex items-center justify-center text-gray-300 text-2xl">
          Choose your lesson to play!
        </div>
      );
    }
    switch (currentLesson.lessonType) {
      case LessonType.VIDEO:
        return (
          <VideoContent
            video={currentLesson.content.video?.url || ""}
            lectureTitle={`${currentLessonIndex! + 1}. ${currentLesson.title}`}
          />
        );
      case LessonType.CODING: {
        console.log("Current lesson:", currentLesson);
        // Nếu currentLesson.id không tồn tại, sử dụng id từ trường content.coding.lessonId
        const codingLessonId =
          currentLesson.id || currentLesson.content?.coding?.lessonId || "";
        console.log("Coding lesson ID:", codingLessonId);
        return <PracticeCode lessonId={codingLessonId} />;
      }
      case LessonType.FINAL_TEST:
        return <FinalQuizContent lesson={currentLesson} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0d0d0e]">
        <Spin size="large" tip="Loading course..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0d0d0e] text-white text-xl">
        Course not found
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {isSidebarVisible && (
        <div className="fixed left-0 top-0 w-1/5 h-[100vh] bg-[#111111] overflow-y-auto z-50">
          <SideBar
            course={course}
            setCurrentLesson={(lesson, index) => {
              setCurrentLesson(lesson);
              setCurrentLessonIndex(index);
            }}
            isSidebarVisible={isSidebarVisible}
            setIsSidebarVisible={setIsSidebarVisible}
            currentLesson={currentLesson}
          />
        </div>
      )}

      {!isSidebarVisible && (
        <button
          className="fixed left-0 bottom-10 bg-gray-600 px-3 py-3 rounded-r-md items-center font-semibold text-white hover:bg-gray-500 transition-all duration-500 z-50"
          onClick={() => setIsSidebarVisible(true)}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon mr-1 icon-tabler icons-tabler-outline icon-tabler-list"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M9 6l11 0" />
              <path d="M9 12l11 0" />
              <path d="M9 18l11 0" />
              <path d="M5 6l0 .01" />
              <path d="M5 12l0 .01" />
              <path d="M5 18l0 .01" />
            </svg>
            <span>Lesson List</span>
          </div>
        </button>
      )}

      <div
        className={`${
          isSidebarVisible
            ? "ml-[20%] w-4/5 duration-500 transition-all"
            : "w-full duration-200 transition-transform"
        } min-h-[calc(100vh-64px)] bg-[#0d0d0e]  `}
      >
        <div className="p-4">
          <div className="bg-[#0e1721] rounded-lg mb-4">
            {renderLessonContent()}
          </div>
          <div className="px-10">
            <CourseDescription
              course={course}
              comments={comments}
              users={users}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseStudyBoard;
