import React, { useEffect, useState } from "react";
import { Collapse, CollapseProps, Button, message } from "antd";
import { formatVND } from "../../../../utils/formatCurrency";
import { useParams, useNavigate } from "react-router-dom";
import { courseVerificationService } from "../../../../services/api";
import courseVerification from "../../../../services/courseVerification.service";

interface Answer {
  content: string;
  isCorrect: boolean;
}

interface Question {
  content: string;
  order: number;
  answers: Answer[];
}

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
    questions: Question[];
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
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

const CourseVerificationDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        if (!courseId) {
          throw new Error("Course ID is required");
        }
        const response = await courseVerificationService.getCoursebyCourseId(
          courseId
        );
        setCourse(response);
      } catch (error) {
        console.error("Error fetching course:", error);
        message.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  const handlePublishCourse = async () => {
    try {
      setPublishing(true);
      if (!courseId) {
        throw new Error("Course ID is required");
      }
      await courseVerification.toggleCoursePublishStatus(courseId);
      message.success("Course published successfully!");
      setTimeout(() => {
        navigate("/instructor-management/verify-courses");
      }, 2000);
    } catch (error) {
      console.error("Error publishing course:", error);
      message.error("Failed to publish course");
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-800">
        <div className="text-white">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-800">
        <div className="text-white">Course not found</div>
      </div>
    );
  }

  const items: CollapseProps["items"] = course.modules.map((module, index) => ({
    key: `${index + 1}`,
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                    src={lesson.video?.url}
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
                      {lesson.coding?.language || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Problem
                      </span>
                    </div>
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{
                          __html:
                            lesson.coding?.problem || "No problem description",
                        }}
                      />
                    </div>
                  </div>

                  {lesson.coding?.hint && (
                    <div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Hint
                        </span>
                      </div>
                      <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="text-gray-700">{lesson.coding.hint}</p>
                      </div>
                    </div>
                  )}

                  {lesson.coding?.codeSnippet && (
                    <div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Code Snippet
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded p-3 font-mono text-sm">
                        <pre className="text-gray-100 whitespace-pre-wrap">
                          {lesson.coding.codeSnippet}
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
                  {lesson.finalTest?.questions?.map((question, index) => (
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
                              <p className="text-gray-700">{answer.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
    ),
  }));

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-white text-2xl font-bold">Course Verification</h1>
        <Button
          type="primary"
          onClick={handlePublishCourse}
          loading={publishing}
          className="bg-green-500 hover:bg-green-600"
        >
          Publish Course
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-gray-100">
            Course Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-300">
            Course details and structure
          </p>
        </div>
        <div className="mt-6 border-t border-gray-700">
          <dl className="divide-y divide-gray-700">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course topic
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {course.CourseTopic?.[0]?.topic.name || "No topic"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course title
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {course.title}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course thumbnail
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                <img
                  className="w-16 h-16 rounded-full"
                  src={course.thumbnail}
                  alt="Course Thumbnail"
                />
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-100">
                Course price
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {formatVND(course.price)}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-200">
                Course description
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-300 sm:col-span-2 sm:mt-0">
                {course.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <Collapse items={items} className="bg-indigo-500" />
      </div>
    </div>
  );
};

export default CourseVerificationDetail;
