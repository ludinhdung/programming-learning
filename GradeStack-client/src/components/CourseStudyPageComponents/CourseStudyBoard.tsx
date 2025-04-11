import React, { useState, useRef, useCallback, useEffect } from "react"; // Added hooks
import { Tabs } from 'antd'; 
import TopBar from "./TopBar";
import SideBar from "./SideBar";
import CourseDescription from "./CourseDescription";
import VideoContent from "../VideoContent/VideoContent";
import NoteComponent from "../NoteComponent/NoteComponent"; 
import type { Note } from "../NoteComponent/NoteComponent"; 
import type { PlayerReference, PlayerState } from 'video-react'; 

type Episol = {
  type: "video";
  episodeNumber: number;
  title: string;
  runTime: string;
  published: string;
  description: string;
};

type Exam = {
  type: "exam";
  examTitle: string;
  totalQuestions: number;
  passingScore: number;
};

type Chapter = {
  chapterNumber: number;
  chapterTitle: string;
  content: (Episol | Exam)[];
};

type Course = {
  id: string;
  title: string;
  topic: string;
  description: string;
  author: string;
  authorImage: string;
  chapters: Chapter[];
  thumbnailUrl: string;
};


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
          // topic: "HTML", // Removed redundant topic
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
          // topic: "HTML", // Removed redundant topic
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
          // topic: "HTML", // Removed redundant topic
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
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
          // topic: "HTML", // topic seems to be at course level
          published: "Oct 26th, 2022",
          description:
            "Learn the basics of HTML and how to structure web pages.",
        },
      ],
    },
  ],
};

const CourseStudyBoard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playerState, setPlayerState] = useState<PlayerState | undefined>(undefined); // Initialize as undefined
  const [notes, setNotes] = useState<Note[]>([]);
  const playerRef = useRef<PlayerReference>(null);

  const currentLectureTitle = course.chapters[0]?.content[0]?.type === 'video' ? course.chapters[0].content[0].title : "Lecture Title";
  const currentVideoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Example URL

  const handlePlayerStateChange = useCallback((state: PlayerState) => {
    setCurrentTime(state.currentTime);
    setPlayerState(state);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleJumpToTimestamp = useCallback((timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seek(timestamp);
    }
  }, []);

  const handleNotesChange = useCallback((updatedNotes: Note[]) => {
    setNotes(updatedNotes);
  }, []);

  const handlePauseVideo = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
  }, []);

  const tabItems = [
    {
      key: '1',
      label: 'Overview',
      children: <CourseDescription course={course} />,
    },
    {
      key: '2',
      label: 'Notes',
      children: (
        <NoteComponent
          currentTime={currentTime}
          lectureTitle={currentLectureTitle}
          onJumpToTimestamp={handleJumpToTimestamp}
          onPauseVideo={handlePauseVideo}
          initialNotes={notes} 
          onNotesChange={handleNotesChange}
          formatTime={formatTime} 
        />
      ),
    },
  ];


  return (
    <div className="flex flex-col">
      <div className="fixed left-0 top-0 w-1/4 h-[calc(100vh)] bg-[#14202e] overflow-y-auto ">
        <SideBar course={course} />
      </div>

      <div className="ml-[25%] w-3/4 min-h-[calc(100vh)] bg-[#0a1119]"> {/* Adjusted min-height */}
        <div className="p-4">
          <div className="mb-4">
            <TopBar />
          </div>

          <div className="mb-4"> 
            <VideoContent
              video={currentVideoUrl} 
              playerRef={playerRef}
              notes={notes}
              playerState={playerState} 
              formatTime={formatTime}
              handleJumpToTimestamp={handleJumpToTimestamp} 
              onPlayerStateChange={handlePlayerStateChange} 
            />
          </div>

 
          <div className="bg-[#0e1721] rounded-lg p-4"> 
            <Tabs defaultActiveKey="1" items={tabItems} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseStudyBoard;
