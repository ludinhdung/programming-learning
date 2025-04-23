import  { useState, useEffect, useRef } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { useParams } from "react-router-dom";
import { instructorService } from "../../services/api";
import { Rate } from "antd";
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
  language: 'JAVA' | 'PYTHON' | 'C';
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
  lessonType: 'VIDEO' | 'CODING' | 'FINAL_TEST';
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
   
   const featuredCourse = Course && Course.length > 0
      ? Course.reduce((highgestRatedCourse, currentCourse) => {
         const highgestRating = highgestRatedCourse.averageRating || 0;
         const currentRating = currentCourse.averageRating || 0;

         return currentRating > highgestRating ? currentCourse : highgestRatedCourse;
      }, Course[0]) : null;



   const totalStudentEnrolled = Course.reduce((total, course) => {
      return total + (course._count?.EnrolledCourse || 0)
   }, 0)

  return (
    <>
      <Header />
      <div>
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
                    GradeStack Academy
                  </span>
                  <span className="border-2 border-white/10 px-3 py-1">
                    {organization}
                  </span>
                  <span className="border-2 border-white/10 px-3 py-1">
                    Courses: {Course?.length || 0}
                  </span>
                  <span className="border-2 border-white/10 px-3 py-1">
                    Student Enrolled: {totalStudentEnrolled}
                  </span>
                  <a
                    href="https://github.com/GradeStack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-white/10 px-3 py-1 hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 22 22"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className=""
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
                    </svg>
                  </a>
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
