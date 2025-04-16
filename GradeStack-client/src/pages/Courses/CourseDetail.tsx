import { FC, useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { message, Spin, Button } from "antd";
import axios from "axios";
import Header from "../../components/Header/Header";
import {
  CaretRightOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import useColorThief from "use-color-thief";
// Import Font Awesome
import "@fortawesome/fontawesome-free/css/all.min.css";

// Interfaces for the course detail page
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Instructor {
  id: string;
  userId: string;
  bio: string;
  avatar: string;
  user: User;
}

interface Video {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number;
}

interface Coding {
  id: string;
  language: string;
  code: string;
  lessonId: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  type: "video" | "text" | "coding" | "test";
  moduleId: string;
  createdAt: string;
  updatedAt: string;
  video?: Video;
  coding?: Coding;
}

interface Module {
  id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: "beginner" | "intermediate" | "advanced";
  tags: string[];
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  instructor: Instructor;
  modules: Module[];
  _count?: {
    EnrolledCourse: number;
  };
  CourseTopic?: {
    topic: {
      id: string;
      name: string;
    };
  }[];
}

const CourseDetail: FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(
    null
  ) as React.MutableRefObject<HTMLImageElement>;
  const color = useColorThief(imgRef, {
    format: "rgb",
    quality: 10,
  });

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        if (!courseId) {
          throw new Error("Course ID not found");
        }

        const response = await axios.get(
          `http://localhost:4000/api/courses/${courseId}/full`
        );
        console.log("Course data:", response.data);
        setCourse(response.data);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Unable to load course information. Please try again later.");
        message.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // Format duration from seconds to hours and minutes
  const formatDuration = (durationInSeconds: number): string => {
    if (!durationInSeconds) return "N/A";

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  // Format creation date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600">{error || "Course not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden "
      style={{
        background:
          color && Array.isArray(color)
            ? `linear-gradient(to bottom, rgb(${color.join(
                ","
              )}),rgb(34, 78, 175))`
            : "#141924",
      }}
    >
      <Header />
      <div className=" flex flex-col lg:flex-row bg-[#141924] text-white lg:min-w-[1000px] mx-[100px] mt-[80px] ">
        {/* Left sidebar with instructor */}
        <div className="bg-[#1C2432] p-8 w-[400px] h-[850px] lg:min-h-[750px] min-w-[400px]  relative">
          <div className="space-y-6 w-full h-full flex flex-col justify-end">
            <img
              src={course.instructor.avatar}
              alt="Instructor"
              className="mx-auto w-full lg:object-cover shadow-lg hover:shadow-primary-500/50 transition-all duration-300 absolute top-[-15px] left-[45px] lg:left-[60px] lg:top-[-20px]"
            />
            {course.instructor.user.email && (
              <div className="px-[22px] lg:px-[40px]">
                <h2 className="text-3xl text-[#314667] font-bold  lg:text-4xl py-2">
                  {`${course.instructor.user.firstName}\n${course.instructor.user.lastName}`.toUpperCase()}
                </h2>
                <p className="text-gray-300 leading-relaxed text-xs lg:text-base py-4">
                  {course.instructor.bio}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Right sidebar with course details */}
        <div className="flex-1 bg-[#141924] px-32 ">
          {/* Top navigation */}
          <div className="flex items-center mb-6">
            <button
              className="flex items-center text-xs bg-[#2a2e35] px-3 py-1.5  hover:bg-[#3a3e45] transition-all duration-300"
              onClick={() => navigate("/courses")}
            >
              <span className="material-symbols-outlined text-sm mr-1"></span>
              Browse All Series
            </button>
          </div>

          <div>
            {/* Course header */}
            <div className=" flex flex-col lg:flex-row lg:items-center justify-between mb-10">
              <div className="lg:w-3/5">
                <h1 className="text-5xl font-bold mb-6 text-primary-200 font-extrabold">
                  {course.title.toUpperCase()}
                </h1>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {course.description}
                </p>
                <div className="flex items-center space-x-3 mb-6">
                  <button className="flex rounded-lg items-center text-md font-semibold bg-[#2a2e35] px-3 py-1.5  hover:bg-blue-700 transition-all duration-300 bg-blue-600 px-12 py-3">
                    <span className="">
                      <CaretRightOutlined className="text-sm mr-1" />
                    </span>
                    Enroll Now
                  </button>
                  <button className="flex rounded-lg items-center text-md font-semibold bg-[#2a2e35] px-3 py-1.5  hover:bg-[#3a3e45] transition-all duration-300 px-12 py-3">
                    <span className="">
                      <PlusCircleOutlined className="text-sm mr-1 w-full" />
                    </span>
                    Bookmark Course
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="text-xs text-gray-400 flex items-center space-x-3 mb-6">
                    <span>Last Updated: {formatDate(course.updatedAt)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {course.CourseTopic?.map((topic) => (
                      <button
                        key={topic.topic.id}
                        className="px-3 py-1 bg-[#2a2e35]  text-xs hover:bg-primary-800 transition-all duration-300"
                      >
                        {topic.topic.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Danh sách module và bài học */}
            {course.modules.map((module, index) => (
              <div key={module.id} className="mb-6">
                <div className="relative z-10 flex items-center gap-2 border border-gray-600 py-4 px-4 font-extrabold text-xl">
                  <p className="text-gray-400 text-white">//</p>
                  <p className="uppercase">{module.title}</p>
                </div>

                {/* Nếu module có video */}
                {module.videoUrl && (
                  <div className="relative z-10 bg-[#1C2432] flex my-2 py-5 px-4 hover:bg-blue-800 transition-all duration-300 cursor-pointer">
                    <div className="my-2 w-[7%] max-w-[71px] max-h-[71px] rounded-full bg-[#191f29] text-2xl font-medium tracking-tight text-white transition-colors duration-300 border-6 border-[#13171c]">
                      <p className="text-center font-semibold text-2xl p-4">
                        {index + 1}
                      </p>
                    </div>
                    <div className="module-item flex-1 px-5">
                      <p className="text-xl font-semibold text-gray-400 text-white mb-2">
                        {module.title}
                      </p>
                      <p className="text-xs text-gray-400 text-white font-medium">
                        {module.description}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex gap-2">
                          <ClockCircleOutlined />
                          <p className="text-xs text-gray-400 text-white font-medium">
                            {module.videoDuration
                              ? formatDuration(module.videoDuration)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 text-white font-medium bg-[#1C2432] text-[#ef4444]">
                            Video bài giảng
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danh sách các bài học trong module */}
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="relative z-10 bg-[#1C2432] flex my-2 py-5 px-4 hover:bg-red-800 transition-all duration-300 cursor-pointer"
                  >
                    <div className="my-2 w-[7%] max-w-[71px] max-h-[71px] rounded-full bg-[#191f29] text-2xl font-medium tracking-tight text-white transition-colors duration-300 border-6 border-[#13171c]">
                      <p className="text-center font-semibold text-2xl p-4">
                        {lessonIndex + 1}
                      </p>
                    </div>
                    <div className="module-item flex-1 px-5">
                      <p className="text-xl font-semibold text-gray-400 text-white mb-2">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-400 text-white font-medium">
                        {lesson.description}
                      </p>
                      {lesson.type === "video" && lesson.video && (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex gap-2">
                            <ClockCircleOutlined />
                            <p className="text-xs text-gray-400 text-white font-medium">
                              {formatDuration(lesson.video.duration)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 text-white font-medium bg-[#1C2432] text-[#ef4444]">
                              Free to watch
                            </p>
                          </div>
                        </div>
                      )}
                      {lesson.type === "text" && (
                        <div className="flex items-center gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 text-white font-medium bg-[#1C2432] text-[#ef4444]">
                              Bài đọc
                            </p>
                          </div>
                        </div>
                      )}
                      {lesson.type === "coding" && lesson.coding && (
                        <div className="flex items-center gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 text-white font-medium bg-[#1C2432] text-[#3b82f6]">
                              {lesson.coding.language}
                            </p>
                          </div>
                        </div>
                      )}
                      {lesson.type === "test" && (
                        <div className="flex items-center gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 text-white font-medium bg-[#1C2432] text-[#10b981]">
                              Bài kiểm tra
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute top-[160px] right-[90px] w-[250px] z-20"
          />
        </div>
      </div>
      <img
        ref={imgRef}
        crossOrigin="anonymous"
        src={course.thumbnail}
        alt={course.title}
        className="absolute z-0 h-[80%] top-[-250px] right-[-200px]  blur-md opacity-30 overflow-hidden"
      />

      <div className="flex justify-center items-center text-center mx-[100px] bg-[#242C3A] py-[200px] px-[400px] my-10 text-white">
        <div className="w-1/2">
          <p className="text-3xl font-bold mb-6 uppercase">grade stack</p>
        </div>
        <div className="w-1/2">
          <div>
            <h3 className="mb-6 text-4xl font-medium leading-tighter text-left">
              A massive community of programmers just like you.
            </h3>
            <p className="font-medium text-left">
              {" "}
              Think of Laracasts sort of like Netflix, but for developers. You
              could spend weeks binging, and still not get through all the
              content we have to offer.{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
