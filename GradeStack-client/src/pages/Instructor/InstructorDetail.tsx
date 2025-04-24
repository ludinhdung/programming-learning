import { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useParams } from "react-router-dom";
import { instructorService } from "../../services/api";
import { Rate, Tooltip } from "antd";
import { formatDuration } from "../../utils/formatDuration";


interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Topic {
  id: string;
  name: string;
  thumbnail?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseTopic {
  id: string;
  courseId: string;
  topicId: string;
  topic: Topic;
}

interface CourseCount {
  EnrolledCourse: number;
}

interface VideoLesson {
  id: string;
  lessonId: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number;
}

interface CodingExercise {
  id: string;
  lessonId: string;
  language: "JAVA" | "PYTHON" | "C";
  problem: string;
  hint: string | null;
  solution: string;
  codeSnippet: string | null;
}

interface FinalTest {
  id: string;
  lessonId: string;
  estimatedDuration: number | null;
  passingScore: number;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  lessonType: "VIDEO" | "CODING" | "FINAL_TEST";
  duration: number | null;
  isPreview: boolean;
  order: number;
  createdAt: string;
  video: VideoLesson | null;
  coding: CodingExercise | null;
  finalTest: FinalTest | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  videoDuration: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: string | number;
  duration: number;
  isPublished: boolean;
  thumbnail?: string;
  averageRating?: number;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
  CourseTopic?: CourseTopic[];
  _count?: CourseCount;
  modules?: Module[];
  instructor?: {
    userId: string;
    organization: string;
    avatar?: string;
    bio?: string | null;
    socials: string[];
    createdAt: string;
    updatedAt: string;
    user: User;
  };
}

interface Instructor {
  userId: string;
  organization: string;
  avatar?: string;
  bio?: string | "";
  socials: string[];
  createdAt: string;
  updatedAt: string;
  user: User;
  Course: Course[];
}

const getSocialIcon = (url: string) => {
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return (
      <svg
        className="h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    );
  } else if (url.includes("facebook.com")) {
    return (
      <svg
        className="h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  } else if (url.includes("linkedin.com")) {
    return (
      <svg
        className="h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  } else if (url.includes("github.com")) {
    return (
      <svg
        className="h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  } else if (url.includes("youtube.com")) {
    return (
      <svg
        className="h-4 w-4 text-white"
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
        className="h-4 w-4 text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7h2v2h-2v-2zm0-8h2v6h-2V7z" />
      </svg>
    );
  }
};

const InstructorDetail = () => {
  const { instructorId } = useParams();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const coursesRef = useRef<HTMLDivElement>(null);

  const calculateCourseDuration = (course: Course) => {
    let totalDurationInSeconds = 0;

    if (course.modules && course.modules.length > 0) {
      totalDurationInSeconds += course.modules.reduce(
        (sum: number, module: Module) => {
          return sum + (module.videoDuration || 0);
        },
        0
      );
    }

    course.modules?.forEach((module: Module) => {
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach((lesson: Lesson) => {
          if (lesson.lessonType === "FINAL_TEST" && lesson.finalTest) {
            totalDurationInSeconds +=
              (lesson.finalTest.estimatedDuration || 0) * 60;
          }
        });
      }
    });
    return totalDurationInSeconds;
  };

  useEffect(() => {
    const fetchInstructorData = async () => {
      if (!instructorId) return;

      try {
        setLoading(true);
        const courses = await instructorService.getFullCourses(instructorId);

        // If there are courses, extract instructor data from the first course
        if (courses && courses.length > 0) {
          const instructorData = courses[0].instructor;
          console.log(instructorData);
          setInstructor({
            ...instructorData,
            Course: courses.map((course: Course) => ({
              ...course,
              duration: calculateCourseDuration(course),
              instructorId: course.instructorId || instructorData.userId,
              price: course.price || 0,
              isPublished: course.isPublished || false,
              createdAt: course.createdAt || new Date().toDateString(),
              updatedAt: course.updatedAt || new Date().toDateString(),
            })),
          });
        } else {
          console.error("No courses found for this instructor");
        }
      } catch (error) {
        console.error("Error fetching instructor data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorData();
  }, [instructorId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[85vh] bg-[#0a1321] text-white flex items-center justify-center">
          <p>Loading instructor details...</p>
        </div>
      </>
    );
  }

  if (!instructor) {
    return (
      <>
        <Header />
        <div className="min-h-[85vh] bg-[#0a1321] text-white flex items-center justify-center">
          <p>Instructor not found</p>
        </div>
      </>
    );
  }

  // Function to scroll to courses section
  const scrollToCourses = () => {
    coursesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const { user, organization, avatar, bio, Course } = instructor;

  const featuredCourse =
    Course && Course.length > 0
      ? Course.reduce((highgestRatedCourse, currentCourse) => {
          const highgestRating = highgestRatedCourse.averageRating || 0;
          const currentRating = currentCourse.averageRating || 0;

          return currentRating > highgestRating
            ? currentCourse
            : highgestRatedCourse;
        }, Course[0])
      : null;

  const totalStudentEnrolled = Course.reduce((total, course) => {
    return total + (course._count?.EnrolledCourse || 0);
  }, 0);

  return (
    <>
      <Header />
      <div>
        { loading&& <LoadingBar />}
        <div className="relative px-20 bg-[#0a1321] text-white overflow-hidden min-h-[85vh]">
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 left-0 overflow-hidden mix-blend-luminosity opacity-5">
              <img
                src={featuredCourse?.thumbnail || "https://placeholder.co/1300"}
                alt="Background"
                className="w-full max-w-[60vw] object-contain translate-x-[15%] translate-y-[-10%]"
                style={{
                  maskImage: "linear-gradient(black, transparent 80%)",
                }}
              />
            </div>
            <div
              className="absolute top-[-6rem] right-0 w-screen h-[956px] opacity-20"
              style={{
                background:
                  "radial-gradient(circle at 100% 0%, rgb(236, 69, 79) 0%, rgba(154, 103, 220, 0) 50%)",
                maskImage: "linear-gradient(black 40%, transparent 80%)",
              }}
            ></div>
          </div>

          <div className="relative top-10 grid grid-cols-12 p-6 md:p-12">
            <div className="col-span-12 lg:col-span-9 xl:col-span-7 flex flex-col justify-between">
              <div className="flex justify-between items-start gap-4">
                <div className="hidden md:flex space-x-2 text-xs font-semibold text-gray-400">
                  <span className="border-2 border-white/10 px-3 py-1">
                    {organization}
                  </span>
                  <span className="border-2 border-white/10 px-3 py-1">
                    Courses: {Course?.length || 0}
                  </span>
                  <span className="border-2 border-white/10 px-3 py-1">
                    Student Enrolled: {totalStudentEnrolled}
                  </span>

                  {/* Social links */}
                  {instructor.socials &&
                    instructor.socials.length > 0 &&
                    instructor.socials.map((social, index) => (
                      <Tooltip key={index} title={social}>
                        <a
                          href={social}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-2 border-white/10 px-3 py-1 hover:bg-white/5 transition-colors flex items-center justify-center"
                        >
                          {getSocialIcon(social)}
                        </a>
                      </Tooltip>
                    ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h1 className="text-5xl md:text-7xl font-extrabold uppercase font-sans leading-tight text-gray-300">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="mt-6 text-gray-400 md:text-lg max-w-3xl leading-relaxed">
                      {bio ||
                        `Hi, im ${user.firstName} ${user.lastName}. I'm the creator of GradeStacks and spend most of my days building the site and thinking of new ways to teach confusing concepts. I live in Orlando, Florida with my wife and two kids.`}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-4 md:absolute right-10 md:right-32 mt-40">
                    <span className="hidden lg:block text-xs font-semibold text-gray-400">
                      Instructor at GradeStack: {user.firstName} {user.lastName}
                    </span>
                    <div className="hidden lg:block w-40 h-72 xl:w-48 rounded overflow-hidden">
                      <img
                        src={avatar || "https://placeholder.co/400"}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover object-center w-full h-full"
                      />
                    </div>
                  </div>
                </div>

                {featuredCourse && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-semibold text-blue-500 mb-4">
                      Featured Course
                    </h2>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-300">
                        {featuredCourse.title}
                      </h3>
                      <p className="mt-2 text-gray-400">
                        {featuredCourse.description}
                      </p>
                      <div className="mt-4 flex items-center space-x-4">
                        {featuredCourse.averageRating && (
                          <span>
                            <Rate
                              disabled
                              allowHalf
                              defaultValue={featuredCourse.averageRating}
                            />
                          </span>
                        )}
                        <span className="text-gray-400">
                          {formatDuration(featuredCourse.duration)}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                        <a
                          href={`/courses/${featuredCourse.id}`}
                          className="btn btn-primary bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
                        >
                          View Course
                        </a>
                        <button
                          onClick={scrollToCourses}
                          className="btn btn-secondary bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center"
                        >
                          View All Courses
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/*Courses*/}
          <div className="mt-20 mb-16" ref={coursesRef}>
            <div className="flex items-center justify-between">
              <div className="flex text-2xl justify-start uppercase font-extrabold mb-6">
                <span className="text-blue-600 mr-2">//</span>
                <span className="text-white">Courses by {user.firstName}</span>
              </div>
              <div className="flex text-[80px] text-slate-800 justify-end uppercase font-extrabold">
                <p>expert knowledge</p>
              </div>
            </div>

            <div className="-mt-8">
              <div
                className="cards grid overflow-auto gap-2 xl:gap-4 w-auto justify-start grid-flow-col auto-cols-[380px] pr-24 scrolling-container hide-scrollbar"
                style={{
                  maskImage:
                    "linear-gradient(to right, black calc(100% - 10rem), transparent)",
                }}
              >
                {Course.map((course, index) => (
                  <a
                    key={index}
                    className="group flex h-[min-content] aspect-[1/.7] lg:h-auto lg:aspect-auto lg:max-w-none series-card"
                  >
                    <a
                      href={`/courses/${course.id}`}
                      className="panel relative transition-colors duration-300 px-4 lg:px-5 py-4 flex-1 overflow-hidden text-center aspect-square bg-slate-800 rounded-lg hover:bg-blue-800"
                    >
                      <header className="flex flex-col items-center justify-center text-center h-[9.38rem]">
                        <h2 className="text-white mb-3 inline-flex items-center text-balance font-semibold leading-tight text-2xl">
                          {course.title}
                        </h2>
                        <div className="flex text-gray-400 text-sm items-center">
                          <img
                            src={avatar}
                            alt={`${user.firstName} ${user.lastName}'s avatar`}
                            className="w-[22px] h-[22px] rounded-full mr-2"
                          />
                          <span className="font-bold">
                            with {user.firstName}
                          </span>
                        </div>
                      </header>
                      <img
                        loading="lazy"
                        className="bottom-0 left-0 right-0 w-full translate-y-[55%] scale-[200%] group-hover:scale-[205%] transition-transform duration-300"
                        src={course.thumbnail}
                        alt={`${course.title} thumbnail`}
                        style={{ width: "15.3rem" }}
                      />
                    </a>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InstructorDetail;
