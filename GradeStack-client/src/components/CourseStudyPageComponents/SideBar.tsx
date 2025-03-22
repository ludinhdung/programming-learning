import React from "react";
import {
  PlayCircleOutlined,
  FileOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import "../../styles/SideBarCourse.css";
import { Course, Module, LessonType, Lesson } from "./CourseStudyBoard";

interface SideBarProps {
  course: Course;
  setCurrentLesson: (lesson: Lesson | null, index: number) => void;
  currentLesson: Lesson | null;
  isSidebarVisible: boolean;
  setIsSidebarVisible: (isSidebarVisible: boolean) => void;
}

const SideBar: React.FC<SideBarProps> = ({ course, currentLesson, setCurrentLesson, isSidebarVisible, setIsSidebarVisible }) => {
  
  const getMenuItems = (modules: Module[]): MenuProps["items"] => {
    return modules.map((module, moduleIndex) => ({
      key: `module-${moduleIndex}`,
      label: `${module.order}. ${module.title}`,
      children: module.lessons.map((lesson, lessonIndex) => ({
        key: `lesson-${moduleIndex}-${lessonIndex}`,
        icon:
          lesson.lessonType === LessonType.VIDEO ? (
            <PlayCircleOutlined />
          ) : lesson.lessonType === LessonType.CODING ? (
            <CodeOutlined />
          ) : (
            <FileOutlined />
          ),
        label: (
          <div
            className="flex flex-col py-2"
            onClick={() => setCurrentLesson(lesson, lessonIndex)}
          >
            <div className="text-sm ">
              {lesson.lessonType === LessonType.VIDEO
                ? module.lessons[lessonIndex].title
                : lesson.lessonType === LessonType.CODING
                ? module.lessons[lessonIndex].title
                : module.lessons[lessonIndex].title}
            </div>
            <div className="text-xs text-gray-400 font-semibold flex items-center gap-4">
              {lesson.lessonType === LessonType.VIDEO ? (
                <>
                  Lesson: {lessonIndex + 1}
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block ml-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 12h3.5" />
                      <path d="M12 7v5" />
                    </svg>
                    {` ${lesson.duration}m`}
                  </div>
                </>
              ) : lesson.lessonType === LessonType.CODING ? (
                <>
                  <div className="flex items-center gap-1">
                    <span>Duration:</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block ml-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 12h3.5" />
                      <path d="M12 7v5" />
                    </svg>
                    {`${lesson.duration}m`}
                  </div>
                </>
              ) : (
                <>
                  Total questions:{" "}
                  {`${module.lessons[lessonIndex].content.finalTest?.questions.length}`}
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="inline-block ml-1"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                      <path d="M12 12h3.5" />
                      <path d="M12 7v5" />
                    </svg>
                    {`${module.lessons[lessonIndex].content.finalTest?.estimatedDuration}m`}
                  </div>
                </>
              )}
            </div>
          </div>
        ),
      })),
    }));
  };

  return (
    <div className="flex flex-col h-full font-bold">
      <div className="flex justify-between py-4 px-2">
        <div>
          <button className="flex items-center opacity-90 bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-narrow-left mr-1"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M5 12l14 0" />
              <path d="M5 12l4 4" />
              <path d="M5 12l4 -4" />
            </svg>
            Series Overview
          </button>
        </div>
        <div className="flex md:justify-end items-center space-x-2">
          <button className="flex items-center justify-center opacity-90 bg-gray-700 p-2 text-white hover:bg-gray-600">
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
              className="h-5 w-5"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
          </button>
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="flex items-center justify-center opacity-90 bg-gray-700 p-2 text-white hover:bg-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className=""
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div
        className="flex shrink-0 cursor-pointer items-center overflow-hidden px-0 py-0 mb-[5px] border border-blue-400/25 bg-transparent transition-colors duration-300"
        style={{ height: "5.7rem" }}
      >
        <img
          src={course.thumbnail}
          alt={`${course.title} thumbnail`}
          className="mr-7 scale-125 ml-[-1.56rem]"
          width="75"
          height="75"
          style={{ width: "4.68rem", height: "4.68rem" }}
          loading="lazy"
        />
        <div className="w-full pr-4">
          <h2
            className="line-clamp-2 text-lg font-bold leading-tight text-balance text-gray-300"
            title={course.title}
          >
            {course.title}
          </h2>
          <div className="mt-2">
            <div
              className="bg-[#141924] flex-1 flex p-[3px]"
              style={{ height: "0.9rem" }}
            >
              <div
                className="bg-[#0033FF] transition-all duration-500"
                style={{ width: "30%" }}
              >
                <div className="bg-white/25 w-[90%] h-1 mx-auto mt-px"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className=" custom-scrollbar overflow-auto"
        style={{ height: "calc(100% - 70px)" }}
      >
        <Menu
          style={{
            width: "100%",
            backgroundColor: "transparent",
          }}
          mode="inline"
          items={getMenuItems(course.modules)}
          theme="dark"
          className="custom-sidebar-menu"
        />
      </div>
    </div>
  );
};
export default SideBar;
