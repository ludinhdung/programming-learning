import { useState } from "react";
import { Stepper, Button, Group } from "@mantine/core";
import React from "react";
import { Breadcrumb, Collapse, CollapseProps } from "antd";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import ReactQill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Editor from "@monaco-editor/react";
//React-Quill
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link"],

  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],

  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ font: [] }],
  [{ align: [] }],

  ["clean"], 
];
const QuillModuleConfig = {
  toolbar: toolbarOptions,
};
interface Topic {
  id: string;
  name: string;
  thumbnail: string;
}

interface CourseTopicProps {
  topics: Topic[];
}
interface CourseInformationProps {
  courseInfo: {
    title: string;
    description: string;
    thumbnail: string;
    price: number;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
interface CourseStructureProps {
  modules: {
    title: string;
    lessons: Lesson[];
  }[];
  setModules: React.Dispatch<
    React.SetStateAction<
      {
        title: string;
        lessons: Lesson[];
      }[]
    >
  >;
}
interface CourseReviewProps {
  selectedTopic: {
    name: string;
    thumbnail: string;
  };
  courseInfo: {
    title: string;
    description: string;
    thumbnail: string;
    price: number;
  };
  modules: {
    title: string;
    lessons: Lesson[];
  }[];
}
enum LessonType {
  VIDEO = "VIDEO",
  CODING = "CODING",
  FINAL_TEST = "FINAL_TEST",
}



interface VideoLesson {
  url: string;
  duration: number;
}

interface CodingExercise {
  language: SupportedLanguage;
  problem: string;
  hint?: string;
  solution: string;
  codeSnippet?: string;
}
enum SupportedLanguage {
  PYTHON = "PYTHON",
  C = "C",
  JAVA = "JAVA",
}
interface FinalTestLesson {
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

interface Lesson {
  title: string;
  description: string;
  lessonType: LessonType | "";
  duration?: number;
  isPreview: boolean;
  content: {
    video?: VideoLesson;
    coding?: CodingExercise;
    finalTest?: FinalTestLesson;
  };
  createdAt: Date;
}


//Step 1
const CourseTopic: React.FC<CourseTopicProps> = ({ topics }) => {
  const [selected, setSelected] = useState(topics[0]);
  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-1/3">
        <Listbox value={selected} onChange={setSelected}>
          <Label className="block text-sm/6 font-medium text-gray-300">
            My topic is
          </Label>
          <div className="relative mt-1">
            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
              <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                <img
                  alt=""
                  src={selected.thumbnail}
                  className="size-5 shrink-0 rounded-full"
                />
                <span className="block truncate">{selected.name}</span>
              </span>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>

            <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:opacity-0">
              {topics.map((topic) => (
                <ListboxOption
                  key={topic.id}
                  value={topic}
                  className="group relative cursor-default py-1 pr-9 pl-3 text-gray-900 select-none data-[active]:bg-indigo-600 data-[active]:text-white"
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center">
                        <img
                          alt=""
                          src={topic.thumbnail}
                          className="size-5 shrink-0 rounded-full"
                        />
                        <span
                          className={`ml-3 block truncate ${
                            selected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>

                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 
              ${active ? "text-white" : "text-indigo-600"}`}
                        >
                          <CheckIcon className="size-5" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </div>
  );
};

//Step 2
const CourseInformation: React.FC<CourseInformationProps> = ({
  courseInfo,
  onInputChange,
  onFileChange,
}) => {
  return (
    <div className="flex justify-center items-center">
      <form>
        <div className="space-y-4">
          <div className="sm:col-span-3">
            <label
              htmlFor="course-title"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Title
            </label>
            <div className="mt-2">
              <input
                id="course-title"
                name="title"
                type="text"
                required
                autoComplete="given-name"
                value={courseInfo.title}
                onChange={onInputChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="col-span-full">
            <label
              htmlFor="course-description"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Description
            </label>
            <div className="mt-2">
              <textarea
                id="course-description"
                name="description"
                required
                autoComplete="course-description"
                value={courseInfo.description}
                onChange={onInputChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="course-thumbnail"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Thumbnail
            </label>
            <div className="mt-2">
              <input
                id="course-thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                required
                onChange={onFileChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="mt-2">
            <label
              htmlFor="course-price"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Price(VND)
            </label>
            <div className="mt-2">
              <input
                id="course-price"
                name="price"
                type="number"
                min={1}
                required
                autoComplete="given-name"
                value={courseInfo.price}
                onChange={onInputChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

//Step 3
const CourseStructure: React.FC<CourseStructureProps> = ({
  modules,
  setModules,
}) => {

  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(
    null
  );
  const [showSelectContentType, setShowSelectContentType] = useState<{
    [key: string]: boolean;
  }>({});

  // Hàm helper để tạo key duy nhất cho mỗi lesson
  const getLessonKey = (moduleIndex: number, lessonIndex: number) =>
    `${moduleIndex}-${lessonIndex}`;

  // Cập nhật hàm xử lý click để hiện type selector
const handleShowContentType = (moduleIndex: number, lessonIndex: number) => {
  setShowSelectContentType((prev) => ({
    ...prev,
    [getLessonKey(moduleIndex, lessonIndex)]: true,
  }));
};

  const addModule = () => {
    setModules([...modules, { title: "", lessons: [] }]);
  };

  const handleModuleTitleChange = (index: number, title: string) => {
    const newModules = [...modules];
    newModules[index].title = title;
    setModules(newModules);
  };

  const handleModuleClick = (index: number) => {
    setEditingModuleIndex(index);
  };

  const handleInputBlur = () => {
    setEditingModuleIndex(null);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      title: "",
      description: "",
      lessonType: "", // hoặc giá trị mặc định khác từ enum
      isPreview: false,
      content: {},
      createdAt: new Date(),
    });
    setModules(newModules);
  };

  const handleLessonTitleChange = (
    moduleIndex: number,
    lessonIndex: number,
    title: string
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].title = title;
    setModules(newModules);
  };

  const handleLessonTypeChange = (
    moduleIndex: number,
    lessonIndex: number,
    type: LessonType
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].lessonType = type;
    newModules[moduleIndex].lessons[lessonIndex].content = {
      [type.toLowerCase()]:
        type === LessonType.CODING
          ? { language: null, problem: "", solution: "" }
          : {},
    };
    setModules(newModules);
    // Chỉ ẩn type selector của lesson hiện tại
    setShowSelectContentType((prev) => ({
      ...prev,
      [getLessonKey(moduleIndex, lessonIndex)]: false,
    }));
  };

  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, index) => index !== lessonIndex
    );
    setModules(newModules);
    // setShowSelectContentType(null);
  };

  return (
    <div className="pt-4 space-y-6">
      {modules.map((module, moduleIndex) => (
        <div
          key={moduleIndex}
          className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-800"
        >
          <div className="flex items-center mb-2">
            <p className="text-lg font-semibold text-gray-900 mr-2">
              Module {moduleIndex + 1}:
            </p>
            {editingModuleIndex === moduleIndex ? (
              <input
                type="text"
                placeholder="module title.."
                value={module.title}
                onChange={(e) =>
                  handleModuleTitleChange(moduleIndex, e.target.value)
                }
                onBlur={handleInputBlur}
                className="w-1/3 mb-0 p-1 rounded-md font-medium bg-neutral-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            ) : (
              <span
                onClick={() => handleModuleClick(moduleIndex)}
                className="flex items-center cursor-pointer text-gray-900"
              >
                {module.title ? (
                  <>
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
                      className="icon -ml-1 mr-1 icon-tabler icons-tabler-outline icon-tabler-folder"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                    </svg>
                    {module.title}
                  </>
                ) : (
                  "Click to edit title..."
                )}
              </span>
            )}
          </div>
          <button
            onClick={() => addLesson(moduleIndex)}
            className="flex bg-gray-500 text-white px-2 py-1 items-center rounded hover:bg-indigo-700 transition duration-200"
          >
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
              className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 5l0 14" />
              <path d="M5 12l14 0" />
            </svg>
            Lesson
          </button>

          {module.lessons.map((lesson, lessonIndex) => (
            <div
              key={lessonIndex}
              className="mt-4 p-2 text-gray-900 rounded-md border-indigo-600 border-2"
            >
              <div className="flex justify-start items-center mb-4 space-x-2 w-full">
                <p className="font-medium m-0 p-0">Lesson title:</p>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) =>
                    handleLessonTitleChange(
                      moduleIndex,
                      lessonIndex,
                      e.target.value
                    )
                  }
                  className="w-2/3 p-2 rounded-md ml-2 bg-neutral-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500"
                />

                <button
                  onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete lesson"
                >
                  <span className="flex items-center p-1 font-medium border border-red-400 rounded-md">
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
                      className="icon icon-tabler icons-tabler-outline icon-tabler-trash"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 7l16 0" />
                      <path d="M10 11l0 6" />
                      <path d="M14 11l0 6" />
                      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                    Delete lesson
                  </span>
                </button>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSelectContentType((prev) => ({
                    ...prev,
                    [getLessonKey(moduleIndex, lessonIndex)]: true,
                  }));
                }}
              >
                {showSelectContentType[
                  getLessonKey(moduleIndex, lessonIndex)
                ] ? (
                  <div className="">
                    <div className="flex w-fit p-2 border-t border-l border-r border-black items-center justify-end">
                      <span className="font-semibold text-sm">
                        Select Content Type
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[
                            lessonIndex
                          ].lessonType = "";
                          setModules(newModules);
                          setShowSelectContentType((prev) => ({
                            ...prev,
                            [getLessonKey(moduleIndex, lessonIndex)]: false,
                          }));
                        }}
                        className="text-red-500 font-bold ml-2"
                      >
                        X
                      </button>
                    </div>
                    <div className="border-black border p-2">
                      <p className="text-sm text-gray-600">
                        Select the main type of content. Files and links can be
                        added as resources.
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        {/* Video Button */}
                        <button
                          onClick={() =>
                            handleLessonTypeChange(
                              moduleIndex,
                              lessonIndex,
                              LessonType.VIDEO
                            )
                          }
                          className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                              ${
                                lesson.lessonType === LessonType.VIDEO
                                  ? "bg-indigo-100 border border-indigo-500 shadow-md"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={
                              lesson.lessonType === LessonType.VIDEO
                                ? "#6366f1"
                                : "currentColor"
                            }
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-play"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M5 4l14 8-14 8z" />
                          </svg>
                          <span
                            className={`mt-2 font-semibold ${
                              lesson.lessonType === LessonType.VIDEO
                                ? "text-indigo-600"
                                : "text-gray-800"
                            }`}
                          >
                            Video
                          </span>
                        </button>

                        {/* Coding Button */}
                        <button
                          onClick={() =>
                            handleLessonTypeChange(
                              moduleIndex,
                              lessonIndex,
                              LessonType.CODING
                            )
                          }
                          className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                                ${
                                  lesson.lessonType === LessonType.CODING
                                    ? "bg-indigo-100 border border-indigo-500 shadow-md"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={
                              lesson.lessonType === LessonType.CODING
                                ? "#6366f1"
                                : "currentColor"
                            }
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-code"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M7 8l-4 4l4 4" />
                            <path d="M17 8l4 4l-4 4" />
                          </svg>
                          <span
                            className={`mt-2 font-semibold ${
                              lesson.lessonType === LessonType.CODING
                                ? "text-indigo-600"
                                : "text-gray-800"
                            }`}
                          >
                            Coding
                          </span>
                        </button>

                        {/* Final Test Button */}
                        <button
                          onClick={() =>
                            handleLessonTypeChange(
                              moduleIndex,
                              lessonIndex,
                              LessonType.FINAL_TEST
                            )
                          }
                          className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                              ${
                                lesson.lessonType === LessonType.FINAL_TEST
                                  ? "bg-indigo-100 border border-indigo-500 shadow-md"
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={
                              lesson.lessonType === LessonType.FINAL_TEST
                                ? "#6366f1"
                                : "currentColor"
                            }
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="icon icon-tabler icons-tabler-outline icon-tabler-file-dots"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                            <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                            <path d="M9 14v.01" />
                            <path d="M12 14v.01" />
                            <path d="M15 14v.01" />
                          </svg>
                          <span
                            className={`mt-2 font-semibold ${
                              lesson.lessonType === LessonType.FINAL_TEST
                                ? "text-indigo-600"
                                : "text-gray-800"
                            }`}
                          >
                            Final Test
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      handleShowContentType(moduleIndex, lessonIndex)
                    }
                    className="flex items-center w-fit bg-gray-200 text-indigo-800 px-2 py-1 border border-indigo-600 rounded-md hover:bg-gray-500 transition duration-200"
                  >
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
                      className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 5l0 14" />
                      <path d="M5 12l14 0" />
                    </svg>
                    Contents
                  </button>
                )}
              </div>

              {lesson.lessonType === LessonType.VIDEO && (
                <div className="py-4 space-y-3 border-l border-b border-r border-black">
                  <h4 className="flex justify-center text-lg font-semibold text-gray-800">
                    Video Content
                  </h4>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-1/2 h-30 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          MP4, AVI, MKV (MAX. 2GB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*"
                        required
                        // value={lesson.content}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              video: {
                                url: e.target.value,
                                duration: lesson.content.video?.duration || 0,
                              },
                            };
                          setModules(newModules);
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}
              {lesson.lessonType === LessonType.CODING && (
                <div className="p-4 space-y-4 border-black border-l border-b border-r ">
                  <div className="flex justify-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Coding Exercise
                    </h4>
                  </div>
                  <div className="space-y-6">
                    {/* Language Selection */}
                    <div className="space-y-1">
                      <label className="block text-sm font-bold text-gray-700">
                        Programming Language
                      </label>
                      <select
                        value={lesson.content.coding?.language || ""}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  problem: "",
                                  solution: "",
                                  language: SupportedLanguage.PYTHON,
                                }),
                                language: e.target.value as SupportedLanguage,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="rounded-md bg-orange-500"
                      >
                        <option value="PYTHON">Python</option>
                        <option value="C">C</option>
                        <option value="JAVA">Java</option>
                      </select>
                    </div>

                    {/* Problem Description */}
                    <div className="space-y-1">
                      <label className="block text-sm font-bold text-gray-700">
                        Problem Description
                      </label>
                      <ReactQill
                        modules={QuillModuleConfig}
                        theme="snow"
                        value={lesson.content.coding?.problem || ""}
                        onChange={(value) => {
                          console.log(value);

                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: SupportedLanguage.PYTHON,
                                  solution: "",
                                }),
                                problem: value, // Cập nhật problem với giá trị từ ReactQuill
                              },
                            };
                          setModules(newModules);
                        }}
                      />
                    </div>

                    {/* Hint (Optional) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Hint (Optional)
                      </label>
                      <textarea
                        placeholder="Add a hint for students..."
                        value={lesson.content.coding?.hint || ""}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: SupportedLanguage.PYTHON,
                                  problem: "",
                                  solution: "",
                                }),
                                hint: e.target.value,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 text-sm"
                      />
                    </div>

                    {/* Solution */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Solution
                      </label>
                      <Editor
                        className="h-52"
                        defaultLanguage={lesson.content.coding?.language || SupportedLanguage.PYTHON}
                        defaultValue={lesson.content.coding?.solution || "// write solution"}
                        onChange={(value) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content = {
                            coding: {
                              ...(lesson.content.coding || {
                                language: SupportedLanguage.PYTHON,
                                problem: "",
                                hint: "",
                              }),
                              solution: value || "",
                            },
                          };
                          setModules(newModules)
                        }}
                        
                      />
                      {/* <textarea
                        placeholder="Provide the solution code..."
                        value={lesson.content.coding?.solution || ""}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: SupportedLanguage.PYTHON,
                                  problem: "",
                                }),
                                solution: e.target.value,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 font-mono text-sm"
                      /> */}
                    </div>

                    {/* Code Snippet (Optional) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Code Snippet
                      </label>
                      <textarea
                        placeholder="Add initial code for students..."
                        value={lesson.content.coding?.codeSnippet || ""}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: SupportedLanguage.PYTHON,
                                  problem: "",
                                  solution: "",
                                }),
                                codeSnippet: e.target.value,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              {lesson.lessonType === LessonType.FINAL_TEST && (
                <div className="p-4 space-y-4 border-l border-r border-b border-black">
                  <div className="flex justify-center">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Final Test Content
                    </h4>
                  </div>
                  <div>
                    {/* Duration */}
                    <div className="space-y-2 mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Estimated Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={
                          lesson.content.finalTest?.estimatedDuration || ""
                        }
                        min={1}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              finalTest: {
                                ...(lesson.content.finalTest || {
                                  questions: [],
                                }),
                                estimatedDuration: parseInt(e.target.value),
                              },
                            };
                          setModules(newModules);
                        }}
                        className="w-32 p-2 bg-gray-50 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                      {lesson.content.finalTest?.questions?.map(
                        (question, qIndex) => (
                          <div
                            key={qIndex}
                            className="p-4 bg-white rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1 mr-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Question {qIndex + 1}
                                </label>
                                <textarea
                                  value={question.content}
                                  onChange={(e) => {
                                    const newModules = [...modules];
                                    const questions = [
                                      ...(lesson.content.finalTest?.questions ||
                                        []),
                                    ];
                                    questions[qIndex] = {
                                      ...questions[qIndex],
                                      content: e.target.value,
                                    };
                                    newModules[moduleIndex].lessons[
                                      lessonIndex
                                    ].content = {
                                      finalTest: {
                                        ...(lesson.content.finalTest || {}),
                                        questions,
                                      },
                                    };
                                    setModules(newModules);
                                  }}
                                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
                                  placeholder="Enter question..."
                                />
                              </div>
                              <button
                                onClick={() => {
                                  const newModules = [...modules];
                                  const questions =
                                    lesson.content.finalTest?.questions.filter(
                                      (_, i) => i !== qIndex
                                    ) || [];
                                  newModules[moduleIndex].lessons[
                                    lessonIndex
                                  ].content = {
                                    finalTest: {
                                      ...(lesson.content.finalTest || {}),
                                      questions,
                                    },
                                  };
                                  setModules(newModules);
                                }}
                                className="text-red-500 hover:text-red-700"
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
                              </button>
                            </div>

                            {/* Answers */}
                            <div className="ml-4 space-y-2">
                              {question.answers?.map((answer, aIndex) => (
                                <div
                                  key={aIndex}
                                  className="flex items-center space-x-4"
                                >
                                  <input
                                    type="radio"
                                    checked={answer.isCorrect}
                                    onChange={() => {
                                      const newModules = [...modules];
                                      const questions = [
                                        ...(lesson.content.finalTest
                                          ?.questions || []),
                                      ];
                                      const answers = questions[
                                        qIndex
                                      ].answers.map((a, i) => ({
                                        ...a,
                                        isCorrect: i === aIndex,
                                      }));
                                      questions[qIndex] = {
                                        ...questions[qIndex],
                                        answers,
                                      };
                                      newModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].content = {
                                        finalTest: {
                                          ...(lesson.content.finalTest || {}),
                                          questions,
                                        },
                                      };
                                      setModules(newModules);
                                    }}
                                    className="text-indigo-600"
                                  />
                                  <input
                                    type="text"
                                    value={answer.content}
                                    onChange={(e) => {
                                      const newModules = [...modules];
                                      const questions = [
                                        ...(lesson.content.finalTest
                                          ?.questions || []),
                                      ];
                                      const answers = [
                                        ...questions[qIndex].answers,
                                      ];
                                      answers[aIndex] = {
                                        ...answers[aIndex],
                                        content: e.target.value,
                                      };
                                      questions[qIndex] = {
                                        ...questions[qIndex],
                                        answers,
                                      };
                                      newModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].content = {
                                        finalTest: {
                                          ...(lesson.content.finalTest || {}),
                                          questions,
                                        },
                                      };
                                      setModules(newModules);
                                    }}
                                    placeholder={`Answer ${aIndex + 1}`}
                                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-md"
                                  />
                                  <button
                                    onClick={() => {
                                      const newModules = [...modules];
                                      const questions = [
                                        ...(lesson.content.finalTest
                                          ?.questions || []),
                                      ];
                                      const answers = questions[
                                        qIndex
                                      ].answers.filter((_, i) => i !== aIndex);
                                      questions[qIndex] = {
                                        ...questions[qIndex],
                                        answers,
                                      };
                                      newModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].content = {
                                        finalTest: {
                                          ...(lesson.content.finalTest || {}),
                                          questions,
                                        },
                                      };
                                      setModules(newModules);
                                    }}
                                    className="text-sm font-bold text-red-500 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}

                              {/* Add Answer Button */}
                              <button
                                onClick={() => {
                                  const newModules = [...modules];
                                  const questions = [
                                    ...(lesson.content.finalTest?.questions ||
                                      []),
                                  ];
                                  const answers = [
                                    ...(questions[qIndex].answers || []),
                                  ];
                                  answers.push({
                                    content: "",
                                    isCorrect: answers.length === 0,
                                  });
                                  questions[qIndex] = {
                                    ...questions[qIndex],
                                    answers,
                                  };
                                  newModules[moduleIndex].lessons[
                                    lessonIndex
                                  ].content = {
                                    finalTest: {
                                      ...(lesson.content.finalTest || {}),
                                      questions,
                                    },
                                  };
                                  setModules(newModules);
                                }}
                                className="p-1 font-bold border border-indigo-400 rounded-md ml-7 text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                + Answer
                              </button>
                            </div>
                          </div>
                        )
                      )}

                      {/* Add Question Button */}
                      <button
                        onClick={() => {
                          const newModules = [...modules];
                          const questions = [
                            ...(lesson.content.finalTest?.questions || []),
                          ];
                          questions.push({
                            content: "",
                            order: questions.length,
                            answers: [],
                          });
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              finalTest: {
                                ...(lesson.content.finalTest || {}),
                                questions,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="p-1 text-sm font-semibold text-indigo-600 bg-indigo-200 hover:bg-indigo-300 rounded-md"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      <button
        onClick={addModule}
        className="flex items-center bg-gray-200 text-indigo-800 px-2 py-1 border border-indigo-500 rounded-md hover:bg-gray-500 transition duration-200"
      >
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
          className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 5l0 14" />
          <path d="M5 12l14 0" />
        </svg>
        Module
      </button>
    </div>
  );
};

//Step 4
const CourseReview: React.FC<CourseReviewProps> = ({
  courseInfo,
  modules,
  selectedTopic,
}) => {
  const items: CollapseProps["items"] = modules.map((module, index) => ({
    key: `${index + 1}`, // Unique key for each module
    label: (
      <span className="flex items-center bg-indigo-500 text-white p-2 rounded-md">
        Module {index + 1}:
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="icon icon-tabler mx-1 icons-tabler-outline icon-tabler-folder"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
          </svg>
          {module.title}
        </span>
      </span>
    ),
    children: (
      <Collapse>
        {module.lessons.map((lesson, lessonIndex) => (
          <Collapse.Panel
            key={lessonIndex}
            header={
              <span className="flex items-center">
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
                  className="icon icon-tabler mr-1 icons-tabler-outline icon-tabler-file-dots"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  <path d="M9 14v.01" />
                  <path d="M12 14v.01" />
                  <path d="M15 14v.01" />
                </svg>
                {lesson.title}
              </span>
            }
            className="bg-gray-400"
          >
            <p>Type: {lesson.lessonType}</p>
            {/* Hiển thị thêm thông tin chi tiết cho lesson nếu cần */}
            {lesson.lessonType === LessonType.VIDEO && (
              <p>Video URL: {lesson.content.video?.url}</p>
            )}
            {lesson.lessonType === LessonType.CODING && (
              <p>Coding Problem: {lesson.content.coding?.problem}</p>
            )}
            {lesson.lessonType === LessonType.FINAL_TEST && (
              <p>
                Final Test Questions:{" "}
                {lesson.content.finalTest?.questions.length}
              </p>
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
    ),
  }));
  return (
    <div className="px-10">
      <div className="mt-8 p-6">
        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-gray-100">
            Course Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-300">
            Course details and structor
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course topic
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {selectedTopic.name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course title
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {courseInfo.title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course thumbnail
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                <img
                  className="w-16 h-16 rounded-full"
                  src={courseInfo.thumbnail}
                  alt="Course Thumbnail"
                />
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course price
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {courseInfo.price}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-200">
                Course description
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {courseInfo.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div>
        <Collapse items={items} className="bg-indigo-500"/>
      </div>
    </div>
  );
};

const CreateCourse: React.FC = () => {
  const [active, setActive] = useState(0);

  const topicsMockup = [
    {
      id: "1",
      name: "JavaScript",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png",
      description:
        "A high-level, dynamic, untyped, and interpreted programming language.",
    },
    {
      id: "2",
      name: "Python",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
      description:
        "A high-level programming language known for its readability and simplicity.",
    },
    {
      id: "3",
      name: "Java",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
      description:
        "A high-level, class-based, object-oriented programming language.",
    },
    {
      id: "4",
      name: "C++",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg",
      description:
        "A general-purpose programming language created as an extension of the C programming language.",
    },
    {
      id: "5",
      name: "C#",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png",
      description:
        "A modern, object-oriented programming language developed by Microsoft.",
    },
    {
      id: "6",
      name: "PHP",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/2/27/PHP-logo.svg",
      description:
        "A popular general-purpose scripting language that is especially suited to web development.",
    },
    {
      id: "7",
      name: "Ruby",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/7/73/Ruby_logo.svg",
      description:
        "A dynamic, open source programming language with a focus on simplicity and productivity.",
    },
    {
      id: "8",
      name: "Swift",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/9/9d/Swift_logo.svg",
      description:
        "A powerful and intuitive programming language for iOS, macOS, watchOS, and tvOS.",
    },
    {
      id: "9",
      name: "Go",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg",
      description:
        "An open-source programming language that makes it easy to build simple, reliable, and efficient software.",
    },
    {
      id: "10",
      name: "Kotlin",
      thumbnail:
        "https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png",
      description:
        "A modern programming language that makes developers happier.",
    },
  ];
  const [selectedTopic, setSelectedTopic] = useState(topicsMockup[0]);
  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
  }
  // State để lưu Course Information
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
  });


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: reader.result as string, // Lưu đường dẫn hình ảnh
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // State to hold modules and lessons
  const [modules, setModules] = useState<
    {
      title: string;
      lessons: Lesson[];
    }[]
    >([]);
  console.log("Course",modules);
  
  const renderStepContent = () => {
    switch (active) {
      case 0:
        return <CourseTopic topics={topicsMockup} />;
      case 1:
        return (
          <CourseInformation
            courseInfo={courseInfo}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
          />
        );
      case 2:
        return <CourseStructure modules={modules} setModules={setModules} />;
      case 3:
        return (
          <CourseReview
            selectedTopic={selectedTopic}
            courseInfo={courseInfo}
            modules={modules}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8 pt-12">
      <Breadcrumb
        className="text-gray-400 hover:[&_a]:text-gray-200"
        separator={<span className="text-gray-400">/</span>}
        items={[
          {
            href: "/instructor-management/course",
            title: (
              <>
                <div className="flex items-center text-gray-400">
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
                    className="icon icon-tabler ml-2"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12h6m3 0h1.5m3 0h.5" />
                    <path d="M5 12l4 4" />
                    <path d="M5 12l4 -4" />
                  </svg>
                  <span className="text-gray-400 hover:text-gray-200">
                    Course List
                  </span>
                </div>
              </>
            ),
          },
          {
            title: <span className="text-gray-200">Create Course</span>,
          },
        ]}
      />
      <h1 className="text-center text-white text-2xl font-bold mb-8">
        Create Your Course
      </h1>
      <div>
        <Stepper
          active={active}
          onStepClick={setActive}
          styles={{
            stepLabel: { color: "white" },
            stepDescription: { color: "gray" },
            separator: { backgroundColor: "#4F46E5" },
            stepIcon: {
              color: "black",
              borderColor: "#222222",
              backgroundColor: "#4F46E5",
              "&[data-completed]": { backgroundColor: "#6600FF" },
            },
            content: {
              color: "#9CA3AF", // Màu gray-400 cho nội dung text bên trong step
            },
          }}
        >
          <Stepper.Step label="Course Topic" description="Choose a topic">
            Step 1: Select your course's topic below...
          </Stepper.Step>
          <Stepper.Step
            label="Course Information"
            description="Fill Course Information"
          >
            Step 2: Add Course Information and Modules
          </Stepper.Step>
          <Stepper.Step label="Course Structure" description="Organize content">
            Step 3: Organize your content
          </Stepper.Step>
          <Stepper.Step label="Review & Publish" description="Final check">
            Step 4: Preview Your Course and Public
          </Stepper.Step>
          <Stepper.Completed>
            Course creation completed! You can now manage your course.
          </Stepper.Completed>
        </Stepper>

        {/* Render current step content */}
        {renderStepContent()}

        <Group justify="center" mt="xl">
          <Button
            variant="default"
            onClick={() =>
              setActive((current) => (current > 0 ? current - 1 : current))
            }
          >
            Back
          </Button>
          <Button
            onClick={() =>
              setActive((current) => (current < 4 ? current + 1 : current))
            }
            variant="filled"
            style={{ backgroundColor: "#4F46E5" }}
          >
            Next step
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default CreateCourse;

import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stepper, Button, Group } from "@mantine/core";
import { Breadcrumb, Collapse, CollapseProps, message, Popover } from "antd";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";

import { Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

import { instructorService } from "../../../../services/api";
import ReactQill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  LessonType,
  SupportedLanguage,
  LessonData,
  CourseCreateData,
} from "../../../../types/course";
import { formatVND } from "../../../../utils/formatCurrency";

//React-Quill
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

const QuillModuleConfig = {
  toolbar: toolbarOptions,
};

interface Topic {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

interface CourseTopicProps {
  topics: Topic[];
  isLoading: boolean;
  selected: Topic | null;
  onSelect: (topic: Topic) => void;
}

interface CourseInformationProps {
  courseInfo: {
    title: string;
    description: string;
    thumbnail: string | "";
    price: number;
  };
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadThumbnail: () => Promise<void>;
  isUploading: boolean;
}

interface CourseStructureProps {
  modules: {
    title: string;
    description: string;
    lessons: LessonData[];
  }[];
  setModules: React.Dispatch<
    React.SetStateAction<
      {
        title: string;
        description: string;
        lessons: LessonData[];
      }[]
    >
  >;
  uploadProps: UploadProps;
  handleUpload: (moduleIndex: number, lessonIndex: number) => void;
  uploading: boolean;
  fileList: UploadFile[];
  setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
}

interface CourseReviewProps {
  selectedTopic: {
    name: string;
    thumbnail: string;
  };
  courseInfo: {
    title: string;
    description: string;
    thumbnail: string;
    price: number;
  };
  modules: {
    title: string;
    lessons: LessonData[];
  }[];
}

//Step 1
const CourseTopic: React.FC<CourseTopicProps> = ({
  topics,
  isLoading,
  selected,
  onSelect,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="text-gray-300">Loading topics...</div>
      </div>
    );
  }

  if (!topics.length) {
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="text-gray-300">No topics available</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="w-1/3">
        <Listbox value={selected || topics[0]} onChange={onSelect}>
          <Label className="block text-sm/6 font-medium text-gray-300">
            My topic is
          </Label>
          <div className="relative mt-1">
            <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
              <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                <img
                  alt=""
                  src={(selected || topics[0]).thumbnail}
                  className="size-5 shrink-0 rounded-full"
                />
                <span className="block truncate">
                  {(selected || topics[0]).name}
                </span>
              </span>
              <ChevronUpDownIcon
                aria-hidden="true"
                className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
              />
            </ListboxButton>

            <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:opacity-0">
              {topics.map((topic) => (
                <ListboxOption
                  key={topic.id}
                  value={topic}
                  className="group relative cursor-default py-1 pr-9 pl-3 text-gray-900 select-none data-[active]:bg-indigo-600 data-[active]:text-white"
                >
                  {({ selected: isSelected, active }) => (
                    <>
                      <div className="flex items-center">
                        <img
                          alt=""
                          src={topic.thumbnail}
                          className="size-5 shrink-0 rounded-full"
                        />
                        <span
                          className={`ml-3 block truncate ${
                            isSelected ? "font-semibold" : "font-normal"
                          }`}
                        >
                          {topic.name}
                        </span>
                      </div>

                      {isSelected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 
                          ${active ? "text-white" : "text-indigo-600"}`}
                        >
                          <CheckIcon className="size-5" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </div>
  );
};

//Step 2
const CourseInformation: React.FC<CourseInformationProps> = ({
  courseInfo,
  onInputChange,
  onFileChange,
  onUploadThumbnail,
  isUploading,
}) => {
  const formatCurrency = (value: string) => {
    // Bỏ hết ký tự không phải số
    const number = value.replace(/\D/g, "");
    // Thêm dấu ,
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    // Create a synthetic event with the formatted value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: "price",
        value: formattedValue.replace(/,/g, ""), // Remove commas for the actual value
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onInputChange(syntheticEvent);
  };

  const content = (
    <div className="p-2">
      <p className="text-sm text-gray-700">Platform Fee Information:</p>
      <ul className="list-disc pl-4 mt-1 text-sm text-gray-600">
        <li>Platform fee: 20% of course price</li>
        <li>Your earnings: 80% of course price</li>
        <li>Example: If price is 1,000,000 VND</li>
        <li>- Platform fee: 200,000 VND</li>
        <li>- Your earnings: 800,000 VND</li>
      </ul>
    </div>
  );

  return (
    <div className="flex justify-center items-center">
      <form>
        <div className="space-y-4">
          <div className="sm:col-span-3">
            <label
              htmlFor="course-title"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Title
            </label>
            <div className="mt-2">
              <input
                id="course-title"
                name="title"
                type="text"
                required
                autoComplete="given-name"
                value={courseInfo.title}
                onChange={onInputChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="col-span-full">
            <label
              htmlFor="course-description"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Description
            </label>
            <div className="mt-2">
              <textarea
                id="course-description"
                name="description"
                required
                rows={4}
                autoComplete="course-description"
                value={courseInfo.description}
                onChange={onInputChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="course-thumbnail"
              className="block text-sm/6 font-medium text-gray-200"
            >
              Course Thumbnail
            </label>
            <div className="mt-2 flex items-center gap-1">
              <input
                id="course-thumbnail"
                name="thumbnail"
                type="file"
                accept="image/*"
                required
                onChange={onFileChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <button
                type="button"
                onClick={onUploadThumbnail}
                disabled={isUploading}
                className="bg-blue-500 p-1 rounded text-white font-semibold text-sm disabled:bg-gray-400"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center">
              <label
                htmlFor="course-price"
                className="block text-sm/6 font-medium text-gray-200"
              >
                Course Price (VND)
              </label>
              <Popover content={content} trigger="hover">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 22 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="icon text-white icon-tabler icons-tabler-outline icon-tabler-info-circle"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M12 9h.01" />
                  <path d="M11 12h1v4h1" />
                </svg>
              </Popover>
            </div>
            <div className="mt-2">
              <input
                id="course-price"
                name="price"
                type="text"
                required
                value={formatCurrency(courseInfo.price.toString())}
                onChange={handlePriceChange}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

//Step 3
const CourseStructure: React.FC<CourseStructureProps> = ({
  modules,
  setModules,
  uploadProps,
  handleUpload,
  uploading,
  fileList,
  setFileList,
}) => {
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(
    null
  );
  const [editingDescriptionModuleIndex, setEditingDescriptionModuleIndex] =
    useState<number | null>(null);
  const [showSelectContentType, setShowSelectContentType] = useState<{
    [key: string]: boolean;
  }>({});
  const [collapsedLessons, setCollapsedLessons] = useState<{
    [key: string]: boolean;
  }>({});

  // Thêm hàm để toggle trạng thái collapse
  const toggleLessonCollapse = (moduleIndex: number, lessonIndex: number) => {
    const lessonKey = `${moduleIndex}-${lessonIndex}`;
    setCollapsedLessons((prev) => ({
      ...prev,
      [lessonKey]: !prev[lessonKey],
    }));
  };

  // Hàm helper để tạo key duy nhất cho mỗi lesson
  const getLessonKey = (moduleIndex: number, lessonIndex: number) =>
    `${moduleIndex}-${lessonIndex}`;
  // Cập nhật hàm xử lý click để hiện type selector
  const handleShowContentType = (moduleIndex: number, lessonIndex: number) => {
    setShowSelectContentType((prev) => ({
      ...prev,
      [getLessonKey(moduleIndex, lessonIndex)]: true,
    }));
  };

  const addModule = () => {
    setModules([...modules, { title: "", description: "", lessons: [] }]);
  };

  const handleModuleTitleChange = (index: number, title: string) => {
    const newModules = [...modules];
    newModules[index].title = title;
    setModules(newModules);
  };
  const handleModuleDescriptionChange = (
    index: number,
    description: string
  ) => {
    const newModules = [...modules];
    newModules[index].description = description;
    setModules(newModules);
  };
  //For module title
  const handleModuleClick = (index: number) => {
    setEditingModuleIndex(index);
  };
  //For module description
  const handleDescriptionClick = (index: number) => {
    setEditingDescriptionModuleIndex(index);
  };

  const handleInputBlur = () => {
    setEditingModuleIndex(null);
    setEditingDescriptionModuleIndex(null);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Add temporary unique ID
      title: "",
      description: "",
      lessonType: "" as LessonType,
      isPreview: false,
      content: {},
      duration: 0,
      createdAt: new Date(),
    });
    setModules(newModules);
  };

  const handleLessonTitleChange = (
    moduleIndex: number,
    lessonIndex: number,
    title: string
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].title = title;
    setModules(newModules);
  };
  const handleLessonDescriptionChange = (
    moduleIndex: number,
    lessonIndex: number,
    description: string
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].description = description;
    setModules(newModules);
  };
  const handleLessonTypeChange = (
    moduleIndex: number,
    lessonIndex: number,
    type: LessonType
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex].lessonType = type;
    newModules[moduleIndex].lessons[lessonIndex].content = {
      [type.toLowerCase()]:
        type === "CODING"
          ? { language: "PYTHON", problem: "", solution: "" }
          : {},
    };
    setModules(newModules);
    setShowSelectContentType((prev) => ({
      ...prev,
      [getLessonKey(moduleIndex, lessonIndex)]: false,
    }));
  };

  const handleDeleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter(
      (_, index) => index !== lessonIndex
    );
    setModules(newModules);
    // setShowSelectContentType(null);
  };

  const handleDeleteModule = (moduleIndex: number) => {
    const newModules = modules.filter((_, index) => index !== moduleIndex);
    setModules(newModules);
  };

  return (
    <div className="pt-4 space-y-6">
      {modules.map((module, moduleIndex) => (
        <div
          key={moduleIndex}
          className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-800"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <p className="text-lg font-semibold text-gray-900 mr-2">
                Module {moduleIndex + 1}:
              </p>
              {editingModuleIndex === moduleIndex ? (
                <input
                  type="text"
                  placeholder="module title.."
                  value={module.title}
                  onChange={(e) =>
                    handleModuleTitleChange(moduleIndex, e.target.value)
                  }
                  onBlur={handleInputBlur}
                  className="mb-0 p-1 rounded-md font-medium bg-neutral-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              ) : (
                <span
                  onClick={() => handleModuleClick(moduleIndex)}
                  className="flex items-center cursor-pointer text-gray-900"
                >
                  {module.title ? (
                    <>
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
                        className="icon -ml-1 mr-1 icon-tabler icons-tabler-outline icon-tabler-folder"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                      </svg>
                      {module.title}
                    </>
                  ) : (
                    "Click to edit title..."
                  )}
                </span>
              )}
            </div>
            <div>
              <button onClick={() => handleDeleteModule(moduleIndex)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 22 22"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="icon text-red-600 icon-tabler icons-tabler-outline icon-tabler-trash"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mb-2 mt-2 flex items-center">
            {editingDescriptionModuleIndex === moduleIndex ? (
              <input
                type="text"
                placeholder="module description.."
                value={module.description}
                onChange={(e) =>
                  handleModuleDescriptionChange(moduleIndex, e.target.value)
                }
                onBlur={handleInputBlur}
                className="w-1/2 mb-0 p-1 rounded-md font-medium bg-neutral-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            ) : (
              <span
                onClick={() => handleDescriptionClick(moduleIndex)}
                className="flex items-center cursor-pointer text-gray-900"
              >
                {module.description ? (
                  <>
                    <span>"{module.description}"</span>
                  </>
                ) : (
                  "Click to edit description..."
                )}
              </span>
            )}
          </div>

          {module.lessons.length === 0 && (
            <button
              onClick={() => addLesson(moduleIndex)}
              className="flex bg-gray-500 text-white px-2 py-1 items-center rounded hover:bg-indigo-700 transition duration-200"
            >
              + Lesson
            </button>
          )}

          {module.lessons.map((lesson, lessonIndex) => (
            <div
              key={lessonIndex}
              className="mt-4 p-2 text-gray-900 rounded-md border-indigo-600 border-[1.5px]"
            >
              <div className="flex justify-start items-center mb-3 space-x-2 w-full">
                <p className="text-base m-0 p-0">Lesson title:</p>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) =>
                    handleLessonTitleChange(
                      moduleIndex,
                      lessonIndex,
                      e.target.value
                    )
                  }
                  className="w-2/3 p-2 rounded-md ml-2 bg-neutral-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                <button
                  onClick={() => handleDeleteLesson(moduleIndex, lessonIndex)}
                  className="bg-red-500 text-white hover:bg-red-600 rounded-md p-1"
                  title="Delete lesson"
                >
                  <span className="flex items-center p-1 text-sm">
                    Delete lesson
                  </span>
                </button>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`preview-${moduleIndex}-${lessonIndex}`}
                    checked={lesson.isPreview}
                    onChange={(e) => {
                      const newModules = [...modules];
                      newModules[moduleIndex].lessons[lessonIndex].isPreview =
                        e.target.checked;
                      setModules(newModules);
                    }}
                    className="h-4 w-4 ml-4 mr-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`preview-${moduleIndex}-${lessonIndex}`}
                    className="text-sm font-medium text-gray-700 flex items-center space-x-1"
                  >
                    <span>Preview</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center">
                <p className="text-base m-0 p-0">Description:</p>
                <input
                  value={lesson.description}
                  onChange={(e) =>
                    handleLessonDescriptionChange(
                      moduleIndex,
                      lessonIndex,
                      e.target.value
                    )
                  }
                  className="w-2/3 ml-2 p-2 rounded-md bg-neutral-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              <button
                onClick={() => toggleLessonCollapse(moduleIndex, lessonIndex)}
                className="p-1 mb-1 rounded-md hover:bg-gray-200"
              >
                {collapsedLessons[`${moduleIndex}-${lessonIndex}`] ? (
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
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                ) : (
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
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                )}
              </button>

              {/* Nội dung lesson - chỉ hiển thị khi không collapse */}
              {!collapsedLessons[`${moduleIndex}-${lessonIndex}`] && (
                <>
                  <div>
                    {/* Hiển thị nút Contents nếu chưa có lessonType */}
                    {!lesson.lessonType &&
                      !showSelectContentType[
                        getLessonKey(moduleIndex, lessonIndex)
                      ] && (
                        <button
                          onClick={() =>
                            handleShowContentType(moduleIndex, lessonIndex)
                          }
                          className="flex items-center w-fit bg-gray-200 text-indigo-800 px-2 py-1 border border-indigo-600 rounded-md hover:bg-gray-500 transition duration-200"
                        >
                          + Contents
                        </button>
                      )}

                    {/* Hiển thị menu chọn type khi click vào Contents hoặc đã có lessonType */}
                    {(showSelectContentType[
                      getLessonKey(moduleIndex, lessonIndex)
                    ] ||
                      lesson.lessonType) && (
                      <div className="">
                        <div className="flex w-fit p-2 border-t border-l border-r border-black items-center justify-end">
                          <span className="font-semibold text-sm">
                            Select Content Type
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].lessonType = "";
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {};
                              setModules(newModules);
                              setShowSelectContentType((prev) => ({
                                ...prev,
                                [getLessonKey(moduleIndex, lessonIndex)]: false,
                              }));
                            }}
                            className="text-red-500 font-bold ml-2"
                          >
                            X
                          </button>
                        </div>
                        <div className="border-black border p-2">
                          <p className="text-sm text-gray-600">
                            Select the main type of content. Files and links can
                            be added as resources.
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-4">
                            {/* Video Button */}
                            <button
                              onClick={() =>
                                handleLessonTypeChange(
                                  moduleIndex,
                                  lessonIndex,
                                  "VIDEO"
                                )
                              }
                              className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                ${
                  lesson.lessonType === "VIDEO"
                    ? "bg-indigo-100 border border-indigo-500 shadow-md"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={
                                  lesson.lessonType === "VIDEO"
                                    ? "#6366f1"
                                    : "currentColor"
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-play"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M5 4l14 8-14 8z" />
                              </svg>
                              <span
                                className={`mt-2 font-semibold ${
                                  lesson.lessonType === "VIDEO"
                                    ? "text-indigo-600"
                                    : "text-gray-800"
                                }`}
                              >
                                Video
                              </span>
                            </button>

                            {/* Coding Button */}
                            <button
                              onClick={() =>
                                handleLessonTypeChange(
                                  moduleIndex,
                                  lessonIndex,
                                  "CODING"
                                )
                              }
                              className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                ${
                  lesson.lessonType === "CODING"
                    ? "bg-indigo-100 border border-indigo-500 shadow-md"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={
                                  lesson.lessonType === "CODING"
                                    ? "#6366f1"
                                    : "currentColor"
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-code"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M7 8l-4 4l4 4" />
                                <path d="M17 8l4 4l-4 4" />
                              </svg>
                              <span
                                className={`mt-2 font-semibold ${
                                  lesson.lessonType === "CODING"
                                    ? "text-indigo-600"
                                    : "text-gray-800"
                                }`}
                              >
                                Coding
                              </span>
                            </button>

                            {/* Final Test Button */}
                            <button
                              onClick={() =>
                                handleLessonTypeChange(
                                  moduleIndex,
                                  lessonIndex,
                                  "FINAL_TEST"
                                )
                              }
                              className={`flex flex-col items-center p-4 rounded-md transition duration-200 
                ${
                  lesson.lessonType === "FINAL_TEST"
                    ? "bg-indigo-100 border border-indigo-500 shadow-md"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="30"
                                height="30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={
                                  lesson.lessonType === "FINAL_TEST"
                                    ? "#6366f1"
                                    : "currentColor"
                                }
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="icon icon-tabler icons-tabler-outline icon-tabler-file-dots"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                                <path d="M9 14v.01" />
                                <path d="M12 14v.01" />
                                <path d="M15 14v.01" />
                              </svg>
                              <span
                                className={`mt-2 font-semibold ${
                                  lesson.lessonType === "FINAL_TEST"
                                    ? "text-indigo-600"
                                    : "text-gray-800"
                                }`}
                              >
                                Final Test
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {lesson.lessonType === "VIDEO" && (
                    <div className="py-4 space-y-3 border-l border-b border-r border-black">
                      <h4 className="flex justify-center text-lg font-semibold text-gray-800">
                        Video Content
                      </h4>

                      {/* Nếu đã có video URL thì hiển thị video info và nút xóa */}
                      {lesson.content.video?.url ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-100 mb-3 flex items-center">
                            <iframe
                              src={lesson.content.video.url}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            ></iframe>
                          </div>

                          <Button
                            onClick={() => {
                              // Reset video content
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                video: { url: "", duration: 0 },
                              };
                              setModules(newModules);
                              setFileList([]);
                            }}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            Remove Video
                          </Button>
                        </div>
                      ) : (
                        /* Nếu chưa có video URL thì hiển thị phần upload */
                        <div className="flex flex-col items-center w-full">
                          <Upload
                            {...uploadProps}
                            accept="video/*"
                            maxCount={1}
                            className="flex flex-col items-center w-full"
                            beforeUpload={(file) => {
                              setFileList([file]);
                              return false; // Prevent auto upload
                            }}
                            onRemove={() => {
                              setFileList([]);
                            }}
                            onChange={({ fileList: newFileList }) => {
                              setFileList(newFileList);
                            }}
                          >
                            {fileList.length < 1 && (
                              <Button className="w-32 bg-blue-500">
                                Select File
                              </Button>
                            )}
                          </Upload>

                          {fileList.length > 0 && (
                            <Button
                              onClick={() =>
                                handleUpload(moduleIndex, lessonIndex)
                              }
                              loading={uploading}
                              className="mt-4 w-32 bg-blue-500"
                            >
                              {uploading ? "Uploading" : "Start Upload"}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {lesson.lessonType === "CODING" && (
                    <div className="p-4 space-y-4 border-black border-l border-b border-r ">
                      <div className="flex justify-center">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Coding Exercise
                        </h4>
                      </div>
                      <div className="">
                        {/* Language Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Programming Language
                          </label>
                          <select
                            value={lesson.content.coding?.language || "PYTHON"}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                coding: {
                                  ...(lesson.content.coding || {
                                    problem: "",
                                    solution: "",
                                  }),
                                  language: e.target.value as SupportedLanguage,
                                },
                              };
                              setModules(newModules);
                            }}
                            className="rounded-md bg-orange-500"
                          >
                            <option value="PYTHON">Python</option>
                            <option value="C">C</option>
                            <option value="JAVA">Java</option>
                          </select>
                        </div>

                        {/* Problem Description */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Problem Description
                          </label>
                          <ReactQill
                            modules={QuillModuleConfig}
                            theme="snow"
                            value={lesson.content.coding?.problem || ""}
                            onChange={(value) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                coding: {
                                  ...(lesson.content.coding || {
                                    language: "PYTHON",
                                    solution: "",
                                  }),
                                  problem: value,
                                },
                              };
                              setModules(newModules);
                            }}
                          />
                          {/* <textarea
                        id="problem-description"
                        placeholder="Describe the coding problem..."
                        value={lesson.content.coding?.problem || ""}
                        onChange={(e) => {
                          const newModules = [...modules];
                          newModules[moduleIndex].lessons[lessonIndex].content =
                            {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: SupportedLanguage.PYTHON,
                                  solution: "",
                                }),
                                problem: e.target.value,
                              },
                            };
                          setModules(newModules);
                        }}
                        className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 font-mono text-sm"
                      /> */}
                        </div>

                        {/* Hint (Optional) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Hint (Optional)
                          </label>
                          <textarea
                            placeholder="Add a hint for students..."
                            value={lesson.content.coding?.hint || ""}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                coding: {
                                  ...(lesson.content.coding || {
                                    language: "PYTHON",
                                    problem: "",
                                    solution: "",
                                  }),
                                  hint: e.target.value,
                                },
                              };
                              setModules(newModules);
                            }}
                            className="w-full min-h-[100px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 text-sm"
                          />
                        </div>

                        {/* Solution */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Solution
                          </label>
                          <textarea
                            placeholder="Provide the solution code..."
                            value={lesson.content.coding?.solution || ""}
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                coding: {
                                  ...(lesson.content.coding || {
                                    language: "PYTHON",
                                    problem: "",
                                  }),
                                  solution: e.target.value,
                                },
                              };
                              setModules(newModules);
                            }}
                            className="w-full min-h-[200px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 font-mono text-sm"
                          />
                        </div>

                        {/* Code Snippet (Optional) */}
                        <textarea
                          placeholder="Add initial code for students..."
                          value={lesson.content.coding?.codeSnippet || ""}
                          onChange={(e) => {
                            const newModules = [...modules];
                            newModules[moduleIndex].lessons[
                              lessonIndex
                            ].content = {
                              coding: {
                                ...(lesson.content.coding || {
                                  language: "PYTHON",
                                  problem: "",
                                  solution: "",
                                }),
                                codeSnippet: e.target.value,
                              },
                            };
                            setModules(newModules);
                          }}
                          className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-y text-gray-900 font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}
                  {lesson.lessonType === "FINAL_TEST" && (
                    <div className="p-4 space-y-4 border-l border-r border-b border-black">
                      <div className="flex justify-center">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Final Test Content
                        </h4>
                      </div>
                      <div>
                        {/* Duration */}
                        <div className="space-y-2 mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Estimated Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={
                              lesson.content.finalTest?.estimatedDuration || ""
                            }
                            onChange={(e) => {
                              const newModules = [...modules];
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                finalTest: {
                                  ...(lesson.content.finalTest || {
                                    questions: [],
                                  }),
                                  estimatedDuration: parseInt(e.target.value),
                                },
                              };
                              setModules(newModules);
                            }}
                            className="w-32 p-2 bg-gray-50 border border-gray-300 rounded-md"
                          />
                        </div>

                        {/* Questions List */}
                        <div className="space-y-6">
                          {lesson.content.finalTest?.questions?.map(
                            (question, qIndex) => (
                              <div
                                key={qIndex}
                                className="p-4 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1 mr-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Question {qIndex + 1}
                                    </label>
                                    <textarea
                                      value={question.content}
                                      onChange={(e) => {
                                        const newModules = [...modules];
                                        const questions = [
                                          ...(lesson.content.finalTest
                                            ?.questions || []),
                                        ];
                                        questions[qIndex] = {
                                          ...questions[qIndex],
                                          content: e.target.value,
                                        };
                                        newModules[moduleIndex].lessons[
                                          lessonIndex
                                        ].content = {
                                          finalTest: {
                                            ...(lesson.content.finalTest || {}),
                                            questions,
                                          },
                                        };
                                        setModules(newModules);
                                      }}
                                      className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md"
                                      placeholder="Enter question..."
                                    />
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newModules = [...modules];
                                      const questions =
                                        lesson.content.finalTest?.questions.filter(
                                          (_, i) => i !== qIndex
                                        ) || [];
                                      newModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].content = {
                                        finalTest: {
                                          ...(lesson.content.finalTest || {}),
                                          questions,
                                        },
                                      };
                                      setModules(newModules);
                                    }}
                                    className="text-red-500 hover:text-red-700"
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
                                  </button>
                                </div>

                                {/* Answers */}
                                <div className="ml-4 space-y-2">
                                  {question.answers?.map((answer, aIndex) => (
                                    <div
                                      key={aIndex}
                                      className="flex items-center space-x-4"
                                    >
                                      <input
                                        type="radio"
                                        checked={answer.isCorrect}
                                        onChange={() => {
                                          const newModules = [...modules];
                                          const questions = [
                                            ...(lesson.content.finalTest
                                              ?.questions || []),
                                          ];
                                          const answers = questions[
                                            qIndex
                                          ].answers.map((a, i) => ({
                                            ...a,
                                            isCorrect: i === aIndex,
                                          }));
                                          questions[qIndex] = {
                                            ...questions[qIndex],
                                            answers,
                                          };
                                          newModules[moduleIndex].lessons[
                                            lessonIndex
                                          ].content = {
                                            finalTest: {
                                              ...(lesson.content.finalTest ||
                                                {}),
                                              questions,
                                            },
                                          };
                                          setModules(newModules);
                                        }}
                                        className="text-indigo-600"
                                      />
                                      <input
                                        type="text"
                                        value={answer.content}
                                        onChange={(e) => {
                                          const newModules = [...modules];
                                          const questions = [
                                            ...(lesson.content.finalTest
                                              ?.questions || []),
                                          ];
                                          const answers = [
                                            ...questions[qIndex].answers,
                                          ];
                                          answers[aIndex] = {
                                            ...answers[aIndex],
                                            content: e.target.value,
                                          };
                                          questions[qIndex] = {
                                            ...questions[qIndex],
                                            answers,
                                          };
                                          newModules[moduleIndex].lessons[
                                            lessonIndex
                                          ].content = {
                                            finalTest: {
                                              ...(lesson.content.finalTest ||
                                                {}),
                                              questions,
                                            },
                                          };
                                          setModules(newModules);
                                        }}
                                        placeholder={`Answer ${aIndex + 1}`}
                                        className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-md"
                                      />
                                      <button
                                        onClick={() => {
                                          const newModules = [...modules];
                                          const questions = [
                                            ...(lesson.content.finalTest
                                              ?.questions || []),
                                          ];
                                          const answers = questions[
                                            qIndex
                                          ].answers.filter(
                                            (_, i) => i !== aIndex
                                          );
                                          questions[qIndex] = {
                                            ...questions[qIndex],
                                            answers,
                                          };
                                          newModules[moduleIndex].lessons[
                                            lessonIndex
                                          ].content = {
                                            finalTest: {
                                              ...(lesson.content.finalTest ||
                                                {}),
                                              questions,
                                            },
                                          };
                                          setModules(newModules);
                                        }}
                                        className="text-sm font-bold text-red-500 hover:text-red-700"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}

                                  {/* Add Answer Button */}
                                  <button
                                    onClick={() => {
                                      const newModules = [...modules];
                                      const questions = [
                                        ...(lesson.content.finalTest
                                          ?.questions || []),
                                      ];
                                      const answers = [
                                        ...(questions[qIndex].answers || []),
                                      ];
                                      answers.push({
                                        content: "",
                                        isCorrect: answers.length === 0,
                                      });
                                      questions[qIndex] = {
                                        ...questions[qIndex],
                                        answers,
                                      };
                                      newModules[moduleIndex].lessons[
                                        lessonIndex
                                      ].content = {
                                        finalTest: {
                                          ...(lesson.content.finalTest || {}),
                                          questions,
                                        },
                                      };
                                      setModules(newModules);
                                    }}
                                    className="p-1 font-bold border border-indigo-400 rounded-md ml-7 text-sm text-indigo-600 hover:text-indigo-800"
                                  >
                                    + Answer
                                  </button>
                                </div>
                              </div>
                            )
                          )}

                          {/* Add Question Button */}
                          <button
                            onClick={() => {
                              const newModules = [...modules];
                              const questions = [
                                ...(lesson.content.finalTest?.questions || []),
                              ];
                              questions.push({
                                content: "",
                                order: questions.length,
                                answers: [],
                              });
                              newModules[moduleIndex].lessons[
                                lessonIndex
                              ].content = {
                                finalTest: {
                                  ...(lesson.content.finalTest || {}),
                                  questions,
                                },
                              };
                              setModules(newModules);
                            }}
                            className="p-2 font-semibold text-indigo-600 bg-indigo-200 hover:bg-indigo-300 rounded-md"
                          >
                            + Add Question
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {module.lessons.length > 0 && (
            <button
              onClick={() => addLesson(moduleIndex)}
              className="flex bg-gray-500 text-white px-2 py-1 items-center rounded hover:bg-indigo-700 transition duration-200 mt-4"
            >
              + Lesson
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addModule}
        className="flex items-center bg-gray-200 text-indigo-800 px-2 py-1 border border-indigo-500 rounded-md hover:bg-gray-500 transition duration-200"
      >
        + Module
      </button>
    </div>
  );
};

//Step 4
const CourseReview: React.FC<CourseReviewProps> = ({
  courseInfo,
  modules,
  selectedTopic,
}) => {
  const items: CollapseProps["items"] = modules.map((module, index) => ({
    key: `${index + 1}`, // Unique key for each module
    label: (
      <span className="flex items-center bg-indigo-500 text-white p-2 rounded-md">
        Module {index + 1}:
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="icon icon-tabler mx-1 icons-tabler-outline icon-tabler-folder"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
          </svg>
          {module.title}
        </span>
      </span>
    ),
    children: (
      <Collapse>
        {module.lessons.map((lesson, lessonIndex) => (
          <Collapse.Panel
            key={lessonIndex}
            header={
              <span className="flex items-center">
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
                  className="icon icon-tabler mr-1 icons-tabler-outline icon-tabler-file-dots"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                  <path d="M9 14v.01" />
                  <path d="M12 14v.01" />
                  <path d="M15 14v.01" />
                </svg>
                {lesson.title}
              </span>
            }
            className="bg-gray-400"
          >
            {lesson.lessonType === "VIDEO" && (
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Video Preview
                </h3>
                <div className="aspect-video w-1/2 rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={lesson.content.video?.url}
                    className="w-full h-full"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {lesson.lessonType === "CODING" && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="flex justify-center text-lg font-semibold mb-3 text-gray-700">
                  Coding Exercise
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="min-w-[120px]">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Language
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {lesson.content.coding?.language || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Problem
                      </span>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {lesson.content.coding?.problem ||
                          "No problem description"}
                      </p>
                    </div>
                  </div>

                  {lesson.content.coding?.hint && (
                    <div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Hint
                        </span>
                      </div>
                      <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="text-gray-700">
                          {lesson.content.coding.hint}
                        </p>
                      </div>
                    </div>
                  )}

                  {lesson.content.coding?.codeSnippet && (
                    <div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Code Snippet
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded p-3 font-mono text-sm">
                        <pre className="text-gray-100 whitespace-pre-wrap">
                          {lesson.content.coding.codeSnippet}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {lesson.lessonType === "FINAL_TEST" && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  Final Test
                </h3>
                <div className="space-y-4">
                  {lesson.content.finalTest?.questions?.map(
                    (question, index) => (
                      <div
                        key={index}
                        className="bg-white rounded p-4 border border-gray-200"
                      >
                        <p className="font-medium text-gray-900 mb-2">
                          Question {index + 1}: {question.content}
                        </p>
                        {question.answers && (
                          <div className="ml-4 space-y-2">
                            {question.answers.map((answer, ansIndex) => (
                              <div key={ansIndex} className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 ${
                                    answer.isCorrect
                                      ? "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                />
                                <p className="text-gray-700">
                                  {answer.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
    ),
  }));
  return (
    <div className="px-10">
      <div className="mt-8 p-6">
        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-gray-100">
            Course Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-300">
            Course details and structor
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course topic
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {selectedTopic.name}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course title
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {courseInfo.title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course thumbnail
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                <img
                  className="w-16 h-16 rounded-full"
                  src={courseInfo.thumbnail}
                  alt="Course Thumbnail"
                />
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course price
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {formatVND(courseInfo.price)}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-200">
                Course description
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {courseInfo.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div>
        <Collapse items={items} className="bg-indigo-500" />
      </div>
    </div>
  );
};

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);

  // State to hold modules and lessons
  const [modules, setModules] = useState<
    {
      title: string;
      description: string;
      lessons: LessonData[];
    }[]
  >([]);
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    thumbnail: "",
    price: 0,
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoadingTopics(true);
        const topics = await instructorService.getTopics();
        setTopics(topics);
        if (topics.length > 0) {
          setSelectedTopic(topics[0]);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        message.error("Failed to fetch topics");
      } finally {
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview image locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseInfo((prev) => ({
          ...prev,
          thumbnail: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadThumbnail = async () => {
    const fileInput = document.getElementById(
      "course-thumbnail"
    ) as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      message.error("Please select an image first");
      return;
    }

    try {
      setThumbnailUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await instructorService.uploadImage(formData);

      setCourseInfo((prev) => ({
        ...prev,
        thumbnail: response.imageUrl,
      }));

      message.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      message.error("Failed to upload thumbnail");
    } finally {
      setThumbnailUploading(false);
    }
  };

  const formatCourseData = (): CourseCreateData => {
    if (!selectedTopic) {
      throw new Error("Please select a topic before creating a course");
    }

    const calculateTotalDuration = () => {
      let totalDuration = 0;
      for (const module of modules) {
        let moduleDuration = 0;
        for (const lesson of module.lessons) {
          if (lesson.lessonType === "VIDEO" && lesson.content?.video) {
            moduleDuration += lesson.content.video.duration || 0;
          }
        }
        totalDuration += moduleDuration;
      }
      console.log("Total duration calculated:", totalDuration);
      return totalDuration;
    };

    const totalDuration = calculateTotalDuration();
    console.log("Total duration before creating courseData:", totalDuration);

    const courseData = {
      title: courseInfo.title,
      description: courseInfo.description,
      price: Number(courseInfo.price),
      duration: totalDuration,
      isPublished: false,
      thumbnailUrl: courseInfo.thumbnail,
      topicIds: [selectedTopic.id],
      modules: modules.map((module, moduleIndex) => {
        let moduleDuration = 0;
        for (const lesson of module.lessons) {
          if (lesson.lessonType === "VIDEO" && lesson.content?.video) {
            moduleDuration += lesson.content.video.duration || 0;
          }
        }
        return {
          title: module.title,
          description: module.description,
          order: moduleIndex + 1,
          duration: moduleDuration,
          videoDuration: moduleDuration,
          lessons: module.lessons.map((lesson, lessonIndex) => {
            const lessonDuration =
              lesson.lessonType === "VIDEO" && lesson.content?.video
                ? lesson.content.video.duration || 0
                : 0;
            return {
              title: lesson.title,
              description: lesson.description || lesson.title,
              lessonType: lesson.lessonType,
              duration: lessonDuration,
              isPreview: lesson.isPreview,
              order: lessonIndex + 1,

              // Cho VIDEO lesson
              ...(lesson.lessonType === "VIDEO" &&
                lesson.content?.video && {
                  videoUrl: lesson.content.video.url || "",
                  thumbnailUrl: null,
                  videoDuration: lesson.content.video.duration || 0,
                }),

              // Cho CODING lesson
              ...(lesson.lessonType === "CODING" &&
                lesson.content?.coding && {
                  language: lesson.content.coding.language,
                  exerciseContent: lesson.content.coding.problem,
                  solution: lesson.content.coding.solution,
                  hint: lesson.content.coding.hint,
                  codeSnippet: lesson.content.coding.codeSnippet,
                }),

              // Cho FINAL_TEST lesson
              ...(lesson.lessonType === "FINAL_TEST" &&
                lesson.content.finalTest && {
                  estimatedDuration: lesson.content.finalTest.estimatedDuration,
                  questions: lesson.content.finalTest.questions.map(
                    (q, qIndex) => ({
                      content: q.content,
                      order: qIndex + 1,
                      answers: q.answers.map((answer) => ({
                        content: answer.content,
                        isCorrect: answer.isCorrect,
                      })),
                    })
                  ),
                }),
            };
          }),
        };
      }),
    };

    console.log("Course data being sent:", JSON.stringify(courseData, null, 2));

    return courseData;
  };

  //Upload video component Antd
  const props: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      console.log("Before upload:", file);
      setFileList([file]);
      return false;
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
  };
  //Upload video
  const handleUpload = async (moduleIndex: number, lessonIndex: number) => {
    if (fileList.length === 0) {
      message.error("No file selected");
      return;
    }

    const file = fileList[0];
    if (!file || !file.originFileObj) {
      message.error("Invalid file");
      return;
    }

    setUploading(true);
    try {
      // Upload video directly
      const uploadResponse = await instructorService.uploadVideo(
        file.originFileObj
      );
      console.log("Upload response:", uploadResponse);

      // Update lesson with new video URL
      const newModules = [...modules];
      const updatedLesson = newModules[moduleIndex].lessons[lessonIndex];

      updatedLesson.content = {
        video: {
          url: uploadResponse.videoUrl,
          duration: uploadResponse.duration || 0,
        },
      };

      setModules(newModules);
      setFileList([]);
      message.success("Video uploaded successfully");
    } catch (error) {
      message.error("Failed to upload video");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.id || userData.role !== "INSTRUCTOR") {
        throw new Error(
          "You must be logged in as an instructor to create a course"
        );
      }

      const courseData = formatCourseData();
      console.log("Sending course data:", courseData);
      console.log("Thumbnail URL being sent:", courseData.thumbnail);
      const response = await instructorService.createCourse(
        userData.id,
        courseData
      );
      console.log("Course created:", response);

      message.success(
        "Course created successfully. Please wait while we review it!"
      );
      // Có thể thêm navigation sau khi tạo thành công
      setTimeout(() => {
        navigate("/instructor-management/course");
      }, 4000);
    } catch (err) {
      console.error("Error creating course:", err);
      setError(err instanceof Error ? err.message : "Failed to create course");
      message.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (active === 1) {
      if (!courseInfo?.title?.trim()) {
        message.error("Please enter course title");
        return;
      }
      if (!courseInfo?.description?.trim()) {
        message.error("Please enter course description");
        return;
      }
      if (!courseInfo?.thumbnail) {
        message.error("Please upload course thumbnail");
        return;
      }
      if (!courseInfo?.price || courseInfo.price <= 0) {
        message.error("Please enter a valid course price");
        return;
      }
    }

    if (active === 2) {
      // Kiểm tra số lượng module
      if (modules.length < 3) {
        message.error("You need at least 3 modules");
        return;
      }

      // Đếm tổng số lesson và kiểm tra final test
      let totalLessons = 0;
      let hasFinalTest = false;

      modules.forEach((module) => {
        totalLessons += module.lessons.length;
        module.lessons.forEach((lesson) => {
          if (lesson.lessonType === "FINAL_TEST") {
            hasFinalTest = true;
          }
        });
      });

      if (totalLessons < 4) {
        message.error("You need at least 4 lessons in total");
        return;
      }

      if (!hasFinalTest) {
        message.error("You need at least 1 final test");
        return;
      }
    }

    if (active === 3) {
      handleCreateCourse();
    } else {
      setActive((current) => current + 1);
    }
  };

  const renderStepContent = () => {
    switch (active) {
      case 0:
        return (
          <CourseTopic
            topics={topics}
            isLoading={isLoadingTopics}
            selected={selectedTopic}
            onSelect={setSelectedTopic}
          />
        );
      case 1:
        return (
          <CourseInformation
            courseInfo={courseInfo}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onUploadThumbnail={handleUploadThumbnail}
            isUploading={thumbnailUploading}
          />
        );
      case 2:
        return (
          <CourseStructure
            modules={modules}
            setModules={setModules}
            uploadProps={props}
            handleUpload={handleUpload}
            uploading={uploading}
            fileList={fileList}
            setFileList={setFileList}
          />
        );
      case 3: {
        if (!selectedTopic) {
          return <div>Please select a topic first</div>;
        }

        const fullCourseData = formatCourseData();
        console.log("Full course data:", fullCourseData);
        return (
          <CourseReview
            selectedTopic={selectedTopic}
            courseInfo={courseInfo}
            modules={modules}
          />
        );
      }
      default:
        return null;
    }
  };
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8 pt-12">
      <Breadcrumb
        className="text-gray-400 hover:[&_a]:text-gray-200"
        separator={<span className="text-gray-400">/</span>}
        items={[
          {
            href: "/instructor-management/course",
            title: (
              <>
                <div className="flex items-center text-gray-400">
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
                    className="icon icon-tabler ml-2"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 12h6m3 0h1.5m3 0h.5" />
                    <path d="M5 12l4 4" />
                    <path d="M5 12l4 -4" />
                  </svg>
                  <span className="text-gray-400 hover:text-gray-200">
                    Course List
                  </span>
                </div>
              </>
            ),
          },
          {
            title: <span className="text-gray-200">Create Course</span>,
          },
        ]}
      />
      <h1 className="text-center text-white text-2xl font-bold mb-8">
        Create Your Course
      </h1>
      <div>
        <Stepper
          active={active}
          onStepClick={setActive}
          styles={{
            stepLabel: { color: "white" },
            stepDescription: { color: "gray" },
            separator: { backgroundColor: "#4F46E5" },
            stepIcon: {
              color: "black",
              borderColor: "#222222",
              backgroundColor: "#4F46E5",
              "&[data-completed]": { backgroundColor: "#6600FF" },
            },
            content: {
              color: "#9CA3AF", // Màu gray-400 cho nội dung text bên trong step
            },
          }}
        >
          <Stepper.Step label="Course Topic" description="Choose a topic">
            Step 1: Select your course's topic below...
          </Stepper.Step>
          <Stepper.Step
            label="Course Information"
            description="Fill Course Information"
          >
            Step 2: Add Course Information and Modules
          </Stepper.Step>
          <Stepper.Step label="Course Structure" description="Organize content">
            Step 3: Organize your content
          </Stepper.Step>
          <Stepper.Step label="Review & Publish" description="Final check">
            Step 4: Preview Your Course and Public
          </Stepper.Step>
          <Stepper.Completed>
            Course creation completed! You can now manage your course.
          </Stepper.Completed>
        </Stepper>

        {/* Render current step content */}
        {renderStepContent()}

        <Group justify="center" mt="xl">
          <Button
            variant="default"
            onClick={() =>
              setActive((current) => (current > 0 ? current - 1 : current))
            }
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            onClick={handleNextStep}
            variant="filled"
            style={{ backgroundColor: "#4F46E5" }}
            loading={isSubmitting}
          >
            {active === 3 ? "Create Course" : "Next step"}
          </Button>
        </Group>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
};

export default CreateCourse;
