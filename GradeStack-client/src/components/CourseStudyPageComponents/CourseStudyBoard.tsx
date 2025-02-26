import React from "react";
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import Content from "./Content";
import CourseDescription from "./CourseDescription";
const course: Course = {
  id: "course-001",
  title: "Fullstack Web Development",
  topic: "JavaScript",
  author: "Jeffrey Way",
  authorImage:
    "https://ik.imagekit.io/laracasts/instructors/1770.jpeg?w=260&q=50",
  description: "Learn fullstack development with React, Node.js, and MongoDB.",
  thumbnailUrl:
    "https://ik.imagekit.io/laracasts/series/thumbnails/svg/php-for-beginners.svg?tr=w-200",
  chapters: [
    {
      chapterNumber: 1,
      chapterTitle: "Introduction to Web Development",
      content: [
        {
          type: "video",
          episodeNumber: 1,
          title: "What is Web Development?",
          runTime: "10:45",
          published: "Oct 26th, 2022",
          description:
            "The next step on our journey is to figure out how to connect to MySQL from PHP and execute a simple SELECT query. We'll of course reach for PHP Data Objects, or PDO, to orchestrate this task securely.",
        },
        {
          type: "exam",
          examTitle: "Intro Code",
          totalQuestions: 5,
          passingScore: 70,
        },
      ],
    },
    {
      chapterNumber: 2,
      chapterTitle: "HTML & CSS Basics",
      content: [
        {
          type: "video",
          episodeNumber: 2,
          title: "HTML Basics",
          runTime: "15:30",
          topic: "HTML",
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
        },
      ],
    },
    {
      chapterNumber: 3,
      chapterTitle: "Introduction to Web Development",
      content: [
        {
          type: "video",
          episodeNumber: 1,
          title: "What is Web Development?",
          runTime: "10:45",
          published: "Oct 26th, 2022",
          description:
            "An overview of web development and its career opportunities.",
        },
        {
          type: "exam",
          examTitle: "Intro Code",
          totalQuestions: 5,
          passingScore: 70,
        },
      ],
    },
    {
      chapterNumber: 4,
      chapterTitle: "HTML & CSS Basics",
      content: [
        {
          type: "video",
          episodeNumber: 2,
          title: "HTML Basics",
          runTime: "15:30",
          topic: "HTML",
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
        },
      ],
    },
    {
      chapterNumber: 5,
      chapterTitle: "Introduction to Web Development",
      content: [
        {
          type: "video",
          episodeNumber: 1,
          title: "What is Web Development?",
          runTime: "10:45",
          published: "Oct 26th, 2022",
          description:
            "An overview of web development and its career opportunities.",
        },
        {
          type: "exam",
          examTitle: "Intro Code",
          totalQuestions: 5,
          passingScore: 70,
        },
      ],
    },
    {
      chapterNumber: 6,
      chapterTitle: "HTML & CSS Basics",
      content: [
        {
          type: "video",
          episodeNumber: 2,
          title: "HTML Basics",
          runTime: "15:30",
          topic: "HTML",
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
        },
      ],
    },
    {
      chapterNumber: 7,
      chapterTitle: "Introduction to Web Development",
      content: [
        {
          type: "video",
          episodeNumber: 1,
          title: "What is Web Development?",
          runTime: "10:45",
          published: "Oct 26th, 2022",
          description:
            "An overview of web development and its career opportunities.",
        },
        {
          type: "exam",
          examTitle: "Intro Code",
          totalQuestions: 5,
          passingScore: 70,
        },
      ],
    },
    {
      chapterNumber: 8,
      chapterTitle: "HTML & CSS Basics",
      content: [
        {
          type: "video",
          episodeNumber: 2,
          title: "HTML Basics",
          runTime: "15:30",
          topic: "HTML",
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
        },
      ],
    },
  ],
};
const CourseStudyBoard: React.FC = () => {
  return (
    <div className="flex flex-col">
      <div className="fixed left-0 top-0 w-1/4 h-[calc(100vh)] bg-[#14202e] overflow-y-auto ">
        <SideBar course={course} />
      </div>
      <div className="ml-[25%] w-3/4 min-h-[calc(100vh-64px)] bg-[#0a1119]">
        <div className="p-4">
          <div className="mb-4">
            <TopBar />
          </div>
          <div className="bg-[#0e1721] rounded-lg mb-4">
            <Content />
          </div>
          <div>
            <CourseDescription course={course} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseStudyBoard;
