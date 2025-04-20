import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import { Button, Modal } from "antd";
import styled from "styled-components";
import axios from "axios";
import { useParams } from "react-router-dom";
import userService from "../../services/user.service";
import { formatVND } from "../../utils/formatCurrency";
import SigninForm from "../../components/SigninForm/SigninForm";
import { learnerService } from "../../services/api";

// Styled components
export const LoadingBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, #1b55ac, #3b82f6);
  z-index: 9999;
  animation: loading 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;

  @keyframes loading {
    0% {
      transform: translateX(-100%);
      opacity: 0.7;
    }
    40% {
      transform: translateX(10%);
      opacity: 1;
    }
    70% {
      transform: translateX(50%);
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const StyledButton = styled(Button)`
  &.ant-btn {
    background-color: #29324a;
    color: #fff;
    font-weight: 500;
    border-radius: 0;
    border: none;
    transition: all 0.3s;

    &:hover {
      background-color: #1c2e48;
      border-color: #1b55ac;
    }
  }
`;

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: number;
  thumbnail: string;
  updatedAt: string;
  instructor: {
    userId: string;
    organization: string;
    avatar: string;
    bio: string;
    socials: string[];
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  CourseTopic: Array<{
    topic: {
      name: string;
    };
  }>;
  modules: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      lessonType: string;
      duration: number;
      isPreview: boolean;
      order: number;
      video?: {
        url: string;
        thumbnailUrl: string;
        duration: number;
      };
      coding?: {
        language: string;
        problem: string;
        hint: string;
      };
    }>;
  }>;
}

interface EnrollmentRecord {
  course: {
    id: string;
  };
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastAttemptedAction, setLastAttemptedAction] = useState<
    "buy" | "bookmark" | null
  >(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const checkAuth = () => {
    const userData = localStorage.getItem("user");
    return !!userData;
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkAuth()) {
      setLastAttemptedAction("buy");
      setShowLoginModal(true);
      return;
    }
    window.location.href = `/checkout/${courseId}`;
  };

  const handleBookmarkClick = () => {
    if (!checkAuth()) {
      setLastAttemptedAction("bookmark");
      setShowLoginModal(true);
      return;
    }
    // Add your bookmark logic here
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (lastAttemptedAction === "buy") {
      window.location.href = `/courses/${courseId}`;
    } else if (lastAttemptedAction === "bookmark") {
      handleBookmarkClick();
    }
  };

  const getSocialIcon = (url: string) => {
    if (url.includes("twitter.com") || url.includes("x.com")) {
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      );
    } else if (url.includes("facebook.com")) {
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    } else if (url.includes("linkedin.com")) {
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    } else if (url.includes("github.com")) {
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    } else if (url.includes("youtube.com")) {
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    } else {
      // Default icon for other social media
      return (
        <svg
          className="h-5 w-5 text-[#bad9fc]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2v2h-2v-2zm0-8h2v6h-2V7z" />
        </svg>
      );
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      setShowLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/courses/${courseId}/full`
        );
        console.log(response.data);
        setCourseData(response.data);
        setExpandedSections(
          response.data.modules.map((module: { id: string }) => module.id)
        );
        setLoading(false);

        setTimeout(() => {
          setShowLoading(false);
        }, 2000);
      } catch (err) {
        setError("Failed to load course data. Please try again later.");
        console.error("Error fetching course data:", err);
        setLoading(false);
        setShowLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const enrolledCourses = await userService.getMyEnrolledCourses(user.id);

        const isEnrolled = enrolledCourses.some(
          (enrollment: EnrollmentRecord) => enrollment.course.id === courseId
        );

        setIsEnrolled(isEnrolled);
      } catch (error) {
        console.error("Error checking enrollment status:", error);
      }
    };

    checkEnrollmentStatus();
  }, [courseId]);

  const fetchCompletedLessons = async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData || !courseId) return;

      const user = JSON.parse(userData);
      const response = await learnerService.getCompletedLessons(
        user.id,
        courseId
      );

      if (response.data?.data) {
        setCompletedLessons(
          response.data.data.map((lesson: any) => lesson.lessonId)
        );
      }
    } catch (error) {
      console.error("Error fetching completed lessons:", error);
    }
  };

  useEffect(() => {
    if (isEnrolled && courseId) {
      fetchCompletedLessons();
    }
  }, [isEnrolled, courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1321] flex items-center justify-center">
        <div className="text-white text-xl">Loading course data...</div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#0a1321] flex items-center justify-center">
        <div className="text-white text-xl">{error || "Course not found"}</div>
      </div>
    );
  }

  return (
    <>
      {showLoading && <LoadingBar />}
      <Header />
      <main className=" mx-auto px-20 pb-20 p-16 bg-[#0a1321]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Instructor Profile - Left Column */}
          <div className="md:col-span-1 w-[390px]">
            <div className="bg-[#1c2432] overflow-hidden">
              <div className="flex flex-col-reverse">
                <div className="p-8">
                  <h2 className="text-[#354b6d] text-3xl font-extrabold uppercase tracking-wide mb-4">
                    {`${courseData.instructor.user.firstName} ${courseData.instructor.user.lastName}`}
                  </h2>
                  <p className="text-white text-sm font-medium leading-relaxed mb-6">
                    {courseData.instructor.bio ||
                      `Hi, I'm ${courseData.instructor.user.firstName}. I'm the creator of GradeStacks and spend most of my days building the site and thinking of new ways to teach confusing concepts. I live in Orlando, Florida with my wife and two kids.`}
                  </p>
                  <div className="flex space-x-4">
                    {courseData.instructor.socials.map(
                      (social: string, index: number) => (
                        <a
                          key={index}
                          href={social}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-10 h-10 bg-[#29334a] hover:bg-[#29324a] transition-colors"
                        >
                          {getSocialIcon(social)}
                        </a>
                      )
                    )}
                    <a
                      href={`/instructor/${courseData.instructor.userId}`}
                      className="flex items-center justify-center px-6 h-10 bg-[#29334a] hover:bg-[#29324a] transition-colors"
                    >
                      <span className="text-white font-medium text-sm">
                        Website
                      </span>
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={courseData.instructor.avatar}
                    alt={`${courseData.instructor.user.firstName} ${courseData.instructor.user.lastName}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Course Info - Middle and Right Columns */}
          <div className="md:col-span-2">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <h1 className="mt-2 font-bold leading-tight text-5xl text-[#BAD9FC]">
                  {courseData.title}
                </h1>
                <p className="mt-4 text-white text-sm font-medium">
                  {courseData.description}
                </p>
                <div className="mt-6 flex space-x-4">
                  {isEnrolled ? (
                    <StyledButton
                      type="primary"
                      className="bg-[#3b8ff2] flex items-center space-x-2 py-5 px-4"
                      onClick={() =>
                        (window.location.href = `/course-study/${courseId}`)
                      }
                    >
                      <svg
                        width="14"
                        viewBox="0 0 14 15"
                        fill="none"
                        className="shrink-0"
                      >
                        <rect
                          x="0.928711"
                          y="4.10059"
                          width="10.2"
                          height="6.8"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="0.928467"
                          y="0.700195"
                          width="3.4"
                          height="13.6"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="0.928711"
                          y="10.9004"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="4.28223"
                          y="2.40039"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="4.28223"
                          y="9.2002"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="7.68066"
                          y="7.5"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="7.68066"
                          y="4.10059"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="9.66895"
                          y="5.80078"
                          width="3.4"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="0.928711"
                          y="2.40039"
                          width="6.8"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                        <rect
                          x="0.928711"
                          y="9.2002"
                          width="6.8"
                          height="3.4"
                          className="fill-current"
                        ></rect>
                      </svg>
                      <span>Play Course</span>
                    </StyledButton>
                  ) : (
                    <StyledButton
                      type="primary"
                      className="bg-[#3b8ff2] flex items-center space-x-2 py-5 px-4"
                      onClick={handleBuyClick}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Buy Now - {formatVND(courseData.price)}</span>
                    </StyledButton>
                  )}
                  <StyledButton
                    type="primary"
                    className="flex items-center space-x-2 py-5 px-4"
                    onClick={handleBookmarkClick}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      className="relative inline-block shrink-0"
                    >
                      <rect
                        y="10"
                        width="5"
                        height="5"
                        className="fill-current"
                      ></rect>
                      <rect
                        x="9.99902"
                        y="10"
                        width="5"
                        height="5"
                        className="fill-current"
                      ></rect>
                      <rect
                        y="6.99902"
                        width="5"
                        height="5"
                        className="fill-current"
                      ></rect>
                      <rect
                        x="9.99951"
                        y="6.99902"
                        width="5"
                        height="5"
                        className="fill-current"
                      ></rect>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.00049 2H2.22271V4.22222H0.000488281V7H5.00049V2Z"
                        className="fill-current"
                      ></path>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.7774 2H9.99951V7H14.9995V4.22222H12.7774V2Z"
                        className="fill-current"
                      ></path>
                      <rect
                        x="5"
                        width="5"
                        height="7"
                        className="fill-current"
                      ></rect>
                      <rect
                        x="5"
                        y="5"
                        width="5"
                        height="5"
                        className="fill-current"
                      ></rect>
                    </svg>
                    <span>Add to Bookmark</span>
                  </StyledButton>
                </div>
                <div className="flex flex-wrap items-center mt-4">
                  <span className="text-white text-[9px] font-medium mr-2 mb-2 inline-block border-2 border-[#14202e] px-4 py-1">
                    Last Updated:{" "}
                    {new Date(courseData.updatedAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                  {courseData.CourseTopic.map((courseTopic) => (
                    <span
                      key={courseTopic.topic.name}
                      className="text-white text-[9px] font-medium mr-2 mb-2 inline-block border-2 border-[#14202e] px-4 py-1"
                    >
                      {courseTopic.topic.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/3">
                <img
                  src={courseData.thumbnail}
                  alt={courseData.title}
                  className="w-full rounded-none"
                />
              </div>
            </div>

            <div className="mb-4 border border-[#14202e] p-4 bg-[#14202e] flex flex-wrap items-center justify-start space-x-6 text-xs text-white font-medium">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {courseData.modules.reduce(
                  (total: number, module) => total + module.lessons.length,
                  0
                )}{" "}
                lessons
              </span>
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {formatDuration(courseData.duration)}
              </span>
            </div>

            {/* Lessons Section */}
            <div className="mt-8">
              {courseData.modules.map((module) => (
                <div key={module.id}>
                  <div className="flex flex-row justify-between mb-4 border border-[#14202e] p-4">
                    <h2 className="text-xl font-bold text-white">
                      <span className="text-[#3b82f6] mr-2">//</span>{" "}
                      {module.title}
                    </h2>
                    <button
                      onClick={() => toggleSection(module.id)}
                      className="text-white hover:text-[#3b82f6] transition-colors duration-300"
                    >
                      {expandedSections.includes(module.id) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedSections.includes(module.id)
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`mb-4 rounded-none bg-[#14202e] p-4 border border-transparent ${!lesson.isPreview && !isEnrolled ? "opacity-60" : ""
                          } cursor-pointer transition-all duration-500 ease-in-out hover:border-[#1b55ac]`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`mr-4 flex-shrink-0 rounded-full  ${completedLessons.includes(lesson.id)
                              ? "border-blue-500 border-2"
                              : "border-[#0a1321] border-4"
                              } p-4 text-center w-16 h-16 flex items-center justify-center`}
                          >
                            {lesson.isPreview || isEnrolled ? (
                              <span
                                className={`text-2xl font-bold ${completedLessons.includes(lesson.id)
                                  ? "text-blue-500"
                                  : "text-white"
                                  }`}
                              >
                                {lesson.order}
                              </span>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="text-xl mb-2 font-medium text-white">
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="mt-1 text-sm font-medium text-white">
                              {lesson.description}
                            </p>
                            <div className="mt-4 flex items-center text-xs font-medium text-[#8ba2bd]">
                              <svg
                                width="12"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                className="mr-2 text-grey-600/75"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M15.1534 0.09375H6.73483V1.77746H6.30548H3.36741V3.46116H1.68371V6.82858H0V15.2471H1.68371V18.6145H2.0878H3.36741V20.2982H6.73483V21.9819H15.1534V20.2982H16.8371H18.5208V18.6145H20.2045V15.2471H20.4907H21.8882V6.82858H20.4907H20.2045V3.46116H18.5208V1.77746H15.1534V0.09375ZM11.6808 11.4585V5.1444H9.57609V11.4585V13.5632H15.8902V11.4585H11.6808Z"
                                  className="fill-current"
                                />
                              </svg>
                              {formatDuration(lesson.duration)}
                              {(isEnrolled ||
                                (!isEnrolled && lesson.isPreview)) && (
                                  <span className="ml-4 p-1 text-[#3b82f6] bg-[#1c2432]">
                                    {isEnrolled ? "" : "Free to Learn!"}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Modal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        footer={null}
        width={500}
        className="auth-modal"
      >
        <SigninForm
          onSwitchForm={() => { }}
          onForgotPassword={() => { }}
          onLoginSuccess={handleLoginSuccess}
        />
      </Modal>
    </>
  );
};

export default CourseDetail;
