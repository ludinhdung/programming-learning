// src/pages/Home.tsx
import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { feedbackService, learnerService } from "../../services/api";

//React-bits components
import BlurText from "../../components/React-bitsComponents/BlurText";
import Squares from "../../components/React-bitsComponents/Squares";
import RotatingText from "../../components/React-bitsComponents/RotatingText";

import CodeEditorImage from "../../assets/CodeEditor.svg";

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  href: string;
  instructor: Instructor;
}

interface Instructor {
  userId: string;
  organization: string;
  avatar: string;
  bio: string | null;
  socials: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isBlocked: boolean;
  };
  Wallet: {
    balance: string;
  };
  Course: {
    id: string;
    title: string;
    thumbnail: string;
  }[];
}

interface Feedback {
  id: string;
  learnerId: string;
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
  };
  learner: {
    id: string;
    firstName: string;
    lastName: string;
  };
}
interface Topic {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

const handleAnimationComplete = () => {
  console.log("Animation completed!");
};

const topicsMockup = [
  {
    id: "1",
    name: "AlpineJS",
    thumbnail: "/images/topics/icons/alpine-logo.svg?v=4",
    description: "9 Series • 140 Videos",
    link: "https://laracasts.com/topics/alpine-js",
  },
  {
    id: "2",
    name: "APIs",
    thumbnail: "/images/topics/icons/api-logo.svg?v=4",
    description: "1 Series • 24 Videos",
    link: "https://laracasts.com/topics/api",
  },
  {
    id: "3",
    name: "Authentication",
    thumbnail: "/images/topics/icons/authentication-logo.svg?v=4",
    description: "4 Series • 37 Videos",
    link: "https://laracasts.com/topics/authentication",
  },
  {
    id: "4",
    name: "Authorization",
    thumbnail: "/images/topics/icons/authorization-logo.svg?v=4",
    description: "1 Series • 17 Videos",
    link: "https://laracasts.com/topics/authorization",
  },
  {
    id: "5",
    name: "AWS",
    thumbnail: "/images/topics/icons/aws-logo.svg?v=4",
    description: "3 Series • 29 Videos",
    link: "https://laracasts.com/topics/aws",
  },
  {
    id: "6",
    name: "Billing",
    thumbnail: "/images/topics/icons/billing-logo.svg?v=4",
    description: "2 Series • 41 Videos",
    link: "https://laracasts.com/topics/billing",
  },
  {
    id: "7",
    name: "Blade",
    thumbnail: "/images/topics/icons/blade-logo.svg?v=4",
    description: "2 Series • 20 Videos",
    link: "https://laracasts.com/topics/blade",
  },
  {
    id: "8",
    name: "Clean Code",
    thumbnail: "/images/topics/icons/clean-code-logo.svg?v=4",
    description: "11 Series • 95 Videos",
    link: "https://laracasts.com/topics/clean-code",
  },
  {
    id: "9",
    name: "CLI",
    thumbnail: "/images/topics/icons/command-line-logo.svg?v=4",
    description: "1 Series • 12 Videos",
    link: "https://laracasts.com/topics/cli",
  },
  {
    id: "10",
    name: "Continuous Integration",
    thumbnail: "/images/topics/icons/continuous-integration.svg?v=4",
    description: "1 Series • 9 Videos",
    link: "https://laracasts.com/topics/continuous-integration",
  },
  {
    id: "11",
    name: "CSS",
    thumbnail: "/images/topics/icons/css-logo.svg?v=4",
    description: "7 Series • 62 Videos",
    link: "https://laracasts.com/topics/css",
  },
  {
    id: "12",
    name: "Cypress",
    thumbnail: "/images/topics/icons/cypress-logo.svg?v=4",
    description: "2 Series • 14 Videos",
    link: "https://laracasts.com/topics/cypress",
  },
  {
    id: "13",
    name: "Debugging",
    thumbnail: "/images/topics/icons/debugging-logo.svg?v=4",
    description: "1 Series • 6 Videos",
    link: "https://laracasts.com/topics/debugging",
  },
  {
    id: "14",
    name: "Docker",
    thumbnail: "/images/topics/icons/docker-logo.svg?v=4",
    description: "1 Series • 8 Videos",
    link: "https://laracasts.com/topics/docker",
  },
  {
    id: "15",
    name: "Eloquent",
    thumbnail: "/images/topics/icons/eloquent-logo.svg?v=4",
    description: "2 Series • 34 Videos",
    link: "https://laracasts.com/topics/eloquent",
  },
  {
    id: "16",
    name: "Envoyer",
    thumbnail: "/images/topics/icons/envoyer-logo.svg?v=4",
    description: "1 Series • 10 Videos",
    link: "https://laracasts.com/topics/envoyer",
  },
  {
    id: "17",
    name: "Filament",
    thumbnail: "/images/topics/icons/filament-logo.svg?v=4",
    description: "2 Series • 36 Videos",
    link: "https://laracasts.com/topics/filament",
  },
  {
    id: "18",
    name: "Git",
    thumbnail: "/images/topics/icons/git-logo.svg?v=4",
    description: "3 Series • 44 Videos",
    link: "https://laracasts.com/topics/git",
  },
  {
    id: "19",
    name: "GraphQL",
    thumbnail: "/images/topics/icons/graphql-logo.svg?v=4",
    description: "1 Series • 16 Videos",
    link: "https://laracasts.com/topics/graphql",
  },
  {
    id: "20",
    name: "Inertia",
    thumbnail: "/images/topics/icons/inertia-logo.svg?v=4",
    description: "5 Series • 53 Videos",
    link: "https://laracasts.com/topics/inertia",
  },
  {
    id: "21",
    name: "JavaScript",
    thumbnail: "/images/topics/icons/js-logo.svg?v=4",
    description: "26 Series • 282 Videos",
    link: "https://laracasts.com/topics/javascript",
  },
  {
    id: "22",
    name: "Laravel",
    thumbnail: "/images/topics/icons/laravel-logo.svg?v=4",
    description: "77 Series • 1034 Videos",
    link: "https://laracasts.com/topics/laravel",
  },
  {
    id: "23",
    name: "Laravel Cashier",
    thumbnail: "/images/topics/icons/cashier-logo.svg?v=4",
    description: "2 Series • 14 Videos",
    link: "https://laracasts.com/topics/laravel-cashier",
  },
  {
    id: "24",
    name: "Laravel Forge",
    thumbnail: "/images/topics/icons/laravel-forge-logo.svg?v=4",
    description: "2 Series • 30 Videos",
    link: "https://laracasts.com/topics/laravel-forge",
  },
  {
    id: "25",
    name: "Laravel Livewire",
    thumbnail: "/images/topics/icons/livewire-logo.svg?v=4",
    description: "11 Series • 241 Videos",
    link: "https://laracasts.com/topics/laravel-livewire",
  },
  {
    id: "26",
    name: "MySQL",
    thumbnail: "/images/topics/icons/mysql-logo.svg?v=4",
    description: "2 Series • 45 Videos",
    link: "https://laracasts.com/topics/mysql",
  },
  {
    id: "27",
    name: "PHP",
    thumbnail: "/images/topics/icons/php-logo.svg?v=4",
    description: "25 Series • 280 Videos",
    link: "https://laracasts.com/topics/php",
  },
  {
    id: "28",
    name: "React",
    thumbnail: "/images/topics/icons/react-logo.svg?v=4",
    description: "3 Series • 56 Videos",
    link: "https://laracasts.com/topics/react",
  },
  {
    id: "29",
    name: "Vue",
    thumbnail: "/images/topics/icons/vue-logo.svg?v=4",
    description: "13 Series • 201 Videos",
    link: "https://laracasts.com/topics/vue",
  },
  {
    id: "30",
    name: "Tailwind CSS",
    thumbnail: "/images/topics/icons/tailwind-logo.svg?v=4",
    description: "7 Series • 117 Videos",
    link: "https://laracasts.com/topics/tailwind",
  },
];

const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await learnerService.getAllTopics();
        console.log("topics", response);
        setTopics(response);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await learnerService.getCourses();

        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchInstructors = async () => {
      try {
        const response = await learnerService.getAllInstructor();
        setInstructors(response.data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const response = await feedbackService.getAllFeedback();
        console.log("feedback", response.data);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchCourses();
    fetchInstructors();
    fetchFeedbacks();
    fetchTopics();
  }, []);

  return (
    <>
      <Header />
      <div className="relative w-full min-w-full h-[830px]">
        <Squares
          speed={0.4}
          squareSize={40}
          direction="diagonal"
          borderColor="#414141"
          hoverFillColor="#FF0099"
        />

        <div className="absolute mt-20 md:-ml-32 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl">
          <div className="flex w-fit items-center space-x-1">
            <p className="text-3xl font-extrabold justify-start">Creative</p>
            <div>
              <RotatingText
                texts={["Thinking.", "Coding.", "Knowledge."]}
                mainClassName="sm:px-2 md:px-3 bg-blue-600 text-light font-extrabold overflow-hidden sm:py-1 md:py-0.5 justify-center rounded-lg"
                staggerFrom={"last"}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-120%", opacity: 0 }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-0.5"
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                rotationInterval={2000}
              />
            </div>
          </div>
          <BlurText
            text="It's Dangerous to Code Alone."
            delay={150}
            animateBy="words"
            direction="top"
            onAnimationComplete={handleAnimationComplete}
            className="text-7xl font-extrabold"
          />
          <BlurText
            text="Follow Us. 👌"
            delay={150}
            animateBy="words"
            direction="bottom"
            onAnimationComplete={handleAnimationComplete}
            className="text-7xl font-extrabold mb-4"
          />

          <p className="text-base font-semibold mb-4">
            With GradeStack, you're never on your own in the coding wilderness.
            Arm yourself with our endless collection of coding courses,
            interactive exams, and a community that's second to none.
          </p>
          <p className="text-base font-semibold mb-12">
            Up your Laravel game and learn from{" "}
            <a href="abc">
              <span className="text-blue-600">
                the coding wizards who know it best. 👇
              </span>
            </a>
          </p>
          <div className="flex space-x-8">
            <a
              href="$"
              className="flex items-center w-fit bg-gray-700 bg-opacity-70 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 icon icon-tabler icons-tabler-filled icon-tabler-player-play"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" />
              </svg>
              Start Watching
            </a>
            <a
              href="$"
              className="flex items-center w-fit bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-2 icon icon-tabler icons-tabler-filled icon-tabler-home"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
              </svg>
              Get Started
            </a>
          </div>
        </div>
      </div>

      {/*Instructor list*/}
      <div className="w-full h-fit bg-[#0d1118]">
        <div className="-mt-20">
          <div className="grid auto-cols-max grid-flow-col gap-4 overflow-auto hide-scrollbar z-10 relative scrolling-container">
            {instructors.map(
              (instructor, index) =>
                instructor.Course.length > 0 && (
                  <a
                    key={index}
                    className="block"
                    href={`/instructor/${instructor.userId}`}
                  >
                    <figure className="relative group overflow-hidden h-full flex rounded-lg">
                      <img
                        loading="lazy"
                        className="transition-all duration-300 w-full h-full"
                        src={instructor.avatar}
                        alt={`Photo of ${instructor.user.firstName} ${instructor.user.lastName}`}
                      />
                      <figcaption className="absolute bottom-0 w-full py-6 bg-black/40">
                        <div className="flex flex-col font-semibold text-center">
                          <span className="text-2xl text-gray-100">
                            {instructor.user.firstName}{" "}
                            {instructor.user.lastName}
                          </span>
                          <span className="text-gray-300 text-sm mt-1">
                            {instructor.organization} • {instructor.user.role}
                          </span>
                        </div>
                      </figcaption>
                    </figure>
                  </a>
                )
            )}
          </div>
        </div>
      </div>
      {/*Feedback section - replaced testimonials with real feedback*/}
      <div className="relative w-full h-[350px] bg-[#0d1118] overflow-hidden">
        <div className="absolute w-fit top-[50px]">
          <div
            className="hide-scrollbar flex items-start gap-2 px-4 animate-scroll"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {feedbacks.length > 0 ? (
              [
                ...feedbacks,
                ...feedbacks,
                ...feedbacks,
                ...feedbacks,
                ...feedbacks,
              ].map((feedback, index) => (
                <div
                  key={index}
                  className="bg-gray-800 bg-opacity-50 shadow-lg rounded-lg p-6 flex-shrink-0 w-72 max-h-[220px] transition-transform"
                >
                  <p className="text-sm font-semibold text-gray-200 line-clamp-6 whitespace-normal">
                    "{feedback.comment}"
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <cite className="text-xs font-semibold uppercase text-gray-500">
                        {feedback.learner.firstName} {feedback.learner.lastName}
                      </cite>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#482c95] flex items-center justify-center text-white font-medium">
                        {feedback.learner.firstName[0]}
                        {feedback.learner.lastName[0]}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center w-full text-white">
                Loading feedback...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stream of Courses Container */}
      <div className="relative bg-[#0d1118] left-0 right-0 top-0 w-full ">
        <div className="px-10 pt-5">
          <div className="flex text-2xl justify-start uppercase font-extrabold">
            <span className="text-blue-600 mr-2">//</span>
            <span className="text-white">A Stream of Courses</span>
          </div>
          <div className="flex text-[100px] text-slate-800 justify-end uppercase font-extrabold -mt-20">
            <p>endless training</p>
          </div>
          <div className="-mt-12">
            <div
              className="cards grid overflow-auto gap-2 xl:gap-4 w-auto justify-start grid-flow-col auto-cols-[380px] pr-24 scrolling-container hide-scrollbar"
              style={{
                maskImage:
                  "linear-gradient(to right, black calc(100% - 10rem), transparent)",
              }}
            >
              {courses.map((course, index) => (
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
                          src={course.instructor.avatar}
                          alt={`${course.instructor.user.firstName} ${course.instructor.user.lastName}'s avatar`}
                          className="w-[22px] h-[22px] rounded-full mr-2"
                        />
                        <span className="font-bold">
                          with {course.instructor.user.firstName}
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

      <div className="relative bg-[#0d1118] w-full">
        <div className="px-32">
          <div className="flex text-4xl justify-center items-center uppercase font-extrabold pt-40">
            <span className="text-blue-600 font-black mr-3 -mt-1">//</span>
            <span className="text-white">
              Watch. Learn. Test Your Knowledge.
            </span>
          </div>

          <div className="text-center px-10 pb-8">
            <img
              loading="lazy"
              className="w-full mt-8"
              src={CodeEditorImage}
              alt="Example of interactive GradeStack code exams."
            ></img>
            <div className="grid lg:grid-cols-4 gap-4 mt-3">
              <div className="bg-slate-800 rounded-sm font-bold text-gray-300 text-lg py-6">
                Interactive Challenges
              </div>
              <div className="bg-slate-800 rounded-sm font-bold text-gray-300 text-lg py-6">
                Tailored to Lesson Content
              </div>
              <div className="bg-slate-800 rounded-sm font-bold text-gray-300 text-lg py-6">
                Code Evaluation
              </div>
              <div className="bg-slate-800 rounded-sm font-bold text-gray-300 text-lg py-6">
                Immediate Feedback
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Pick a Topic Container */}
      <div className="relative bg-[#0d1118] w-full">
        <div className="px-10">
          <div className="flex text-2xl pt-24 justify-start uppercase font-extrabold">
            <span className="text-blue-600 mr-2">//</span>
            <span className="text-white">Pick a Topic</span>
          </div>
          <div className="flex text-[100px] text-slate-800 justify-end uppercase font-extrabold -mt-20">
            <p>any topic</p>
          </div>
        </div>
        <div>
          <div
            className={`grid auto-cols-max grid-flow-col gap-4 pl-10 overflow-auto hide-scrollbar scrolling-container overflow-y-auto ${
              topics.length <= 10 ? "grid-rows-1" : "grid-rows-2"
            }`}
          >
            {topics.map((topic) => (
              <a
                key={topic.id}
                href={`/topics`}
                className="flex justify-center items-center bg-slate-800 w-40 px-2 py-3"
              >
                <div className="flex justify-center items-center space-x-2">
                  <img src={topic.thumbnail} className="w-10 h-10"></img>
                  <span className="text-xs font-semibold text-white">
                    {topic.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
