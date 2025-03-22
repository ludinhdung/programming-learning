import React, { useState } from "react";
import SideBar from "./SideBar";
import CourseDescription from "./CourseDescription";
import VideoContent from "./Contents/VideoContent";
import CodingContent from "./Contents/CodingContent";
import FinalQuizContent from "./Contents/FinalQuizContent";
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  thumbnail: string;

  isPublished: boolean;
  instructorId: string;
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
const course: Course = {
  id: "39766ee6-47c3-4f06-8c08-ddd6860e625d",
  title: "Advanced TypeScript Programming",
  description:
    "Master TypeScript with advanced concepts, design patterns, and real-world applications",
  price: 99.99,
  duration: 1900,
  thumbnail:
    "https://images.laracasts.com/series/thumbnails/svg/eloquent-performance-patterns.svg?tr=w-244",
  isPublished: false,
  instructorId: "ff6a31d4-5012-4399-98e3-601f715305f2",
  createdAt: new Date("2025-03-17T16:22:34.532Z"),
  updatedAt: new Date("2025-03-17T16:22:34.532Z"),
  modules: [
    {
      order: 1,
      title: "TypeScript Fundamentals",
      description: "Learn the core concepts of TypeScript",
      lessons: [
        {
          title: "Introduction to TypeScript",
          description: "Overview of TypeScript and its benefits",
          lessonType: LessonType.VIDEO,
          duration: 15,
          isPreview: true,
          createdAt: new Date("2025-03-17T16:22:34.539Z"),
          content: {
            video: {
              url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              duration: 900,
            },
            coding: null,
            finalTest: null,
          },
        },
        {
          title: "TypeScript Types and Interfaces",
          description: "Understanding TypeScript's type system",
          lessonType: LessonType.VIDEO,
          duration: 20,
          isPreview: false,
          createdAt: new Date("2025-03-17T16:22:34.544Z"),
          content: {
            video: {
              url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              duration: 1200,
            },
            coding: null,
            finalTest: null,
          },
        },
        {
          title: "Type Challenge",
          description: "Test your knowledge of TypeScript types",
          lessonType: LessonType.CODING,
          duration: 30,
          isPreview: false,
          createdAt: new Date("2025-03-17T16:22:34.549Z"),
          content: {
            video: null,
            coding: {
              language: SupportedLanguage.JAVA,
              problem:
                "Create an interface for a User object with strongly typed properties",
              hint: "Remember to use correct TypeScript syntax for optional properties",
              solution:
                "interface User {\n  id: string;\n  name: string;\n  email: string;\n  age?: number;\n  roles: string[];\n}",
              codeSnippet: "interface User {\n ",
            },
            finalTest: null,
          },
        },
      ],
    },
    {
      order: 2,
      title: "Advanced Concepts",
      description: "Deep dive into advanced TypeScript patterns and practices",
      lessons: [
        {
          title: "Generic Utility Practice",
          description: "Solve coding problems with generics and utility types",
          lessonType: LessonType.CODING,
          duration: 25,
          isPreview: false,
          createdAt: new Date("2025-03-17T16:30:00.000Z"),
          content: {
            video: null,
            coding: {
              language: SupportedLanguage.PYTHON,
              problem:
                "Write a generic function that can swap elements in a tuple",
              hint: "Use TypeScript's tuple and generics",
              solution:
                "function swap<T, U>(tuple: [T, U]): [U, T] {\n  return [tuple[1], tuple[0]];\n}",
              codeSnippet: "function swap<T, U>(tuple: [T, U]): [U, T] {",
            },
            finalTest: null,
          },
        },
        {
          title: "Final Test - Advanced Section",
          description: "Test your advanced TypeScript knowledge",
          lessonType: LessonType.FINAL_TEST,
          duration: 40,
          isPreview: false,
          createdAt: new Date("2025-03-17T16:40:00.000Z"),
          content: {
            video: null,
            coding: null,
            finalTest: {
              estimatedDuration: 30,
              questions: [
                {
                  content: "What is the use of keyof in TypeScript?",
                  order: 1,
                  answers: [
                    {
                      content: "To get keys of an object type",
                      isCorrect: true,
                    },
                    { content: "To iterate arrays", isCorrect: false },
                    {
                      content: "To import modules dynamically",
                      isCorrect: false,
                    },
                  ],
                },
                {
                  content: "Which keyword allows defining conditional types?",
                  order: 2,
                  answers: [
                    { content: "infer", isCorrect: false },
                    { content: "extends", isCorrect: true },
                    { content: "typeof", isCorrect: false },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ],
  CourseTopic: [
    {
      id: "4c89e09b-30ab-47ca-b272-8c7f5bb37b6c",
      name: "PHP",
      thumbnail: "https://example.com/thumbnail.jpg",
    },
  ],
};
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
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(
    null
  );

  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);

  const renderLessonContent = () => {
    if (!currentLesson) {
      return (
        <div className="h-screen w-full flex items-center justify-center text-gray-300 text-2xl">
          Choose your lesson to play !
        </div>
      );
    }

    switch (currentLesson.lessonType) {
      case LessonType.VIDEO:
        return (
          <VideoContent
            lesson={currentLesson}
            lessonIndex={currentLessonIndex!}
          />
        );
      case LessonType.CODING:
        return <CodingContent lesson={currentLesson} />;
      case LessonType.FINAL_TEST:
        return <FinalQuizContent lesson={currentLesson} />;
      default:
        return null;
    }
  };
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
            <CourseDescription course={course} comments={comments} users={ users} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseStudyBoard;
