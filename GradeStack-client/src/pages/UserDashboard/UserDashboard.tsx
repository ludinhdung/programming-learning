import { FC, useEffect, useState } from "react";
// Import Collapse
import {
  Spin,
  message,
  Button,
  Avatar,
  Typography,
  Divider,
  Collapse,
} from "antd";
import {
  BookOutlined,
  StarOutlined,
  HistoryOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import userService from "../../services/user.service";
import noteService from "../../services/note.service";
import type {
  EnrollmentRecord,
  BookmarkRecord,
} from "../../services/user.service";
// Import both interfaces
import type {
  Note,
  NotedCourseInfo,
  NotedCourseData,
} from "../../services/note.service";
import Header from "../../components/Header/Header";

const { Text } = Typography;
const { Panel } = Collapse; // Destructure Panel

const CourseCard: FC<{
  title: string;
  instructorName?: string;
  avatar?: string;
  progress?: number;
  thumbnail?: string;
}> = ({ title, instructorName, progress, thumbnail, avatar }) => {
  return (
    <div className="flex mb-6 bg-[#13151f] overflow-hidden">
      <div className="w-70 h-40 relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-between p-4 flex-grow">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          {instructorName && (
            <div className="flex items-center text-[#94a3b8] mb-2">
              <Avatar src={avatar} size="small" className="mr-3" />
              <span>{instructorName}</span>
            </div>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <div className="text-[#94a3b8] text-sm mb-1">
                Progress: {progress}%
              </div>
              <div className="w-full bg-[#1e2736] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-[#3b82f6] h-full rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionHeader: FC<{
  title: string;
  onClear?: () => void;
}> = ({ title, onClear }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <div className="text-[#3b82f6] mr-2 text-xl">//</div>
        <h2 className="text-lg uppercase tracking-wider text-white font-mono">
          {title}
        </h2>
      </div>
    </div>
  );
};

// Helper function to format seconds into MM:SS
const formatTimestamp = (seconds: number): string => {
  if (typeof seconds !== "number" || isNaN(seconds) || seconds < 0) {
    return "00:00"; // Return default or handle error appropriately
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

const NoteItem: FC<{
  note: Note;
  courseTitle: string; // Changed from lessonTitle
  timestamp: number; // Added timestamp prop
  onDelete: (id: string) => void;
}> = ({ note, timestamp, courseTitle, onDelete }) => {
  // Added timestamp to destructuring
  return (
    <div className="flex items-center gap-4 p-4 bg-[#13151f] rounded-lg mb-4 hover:bg-[#1a1f2e] transition-colors">
      <div className="w-12 h-12 bg-[#1e2736] rounded-lg flex items-center justify-center shrink-0">
        <FileTextOutlined className="text-xl text-[#3b82f6]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-row justify-between items-center mb-1">
          <div className="text-white">{note.lesson.title}</div>
          {/* Display timestamp first */}
          <div className="text-xs text-[#3b82f6] mb-1 font-mono">
            {formatTimestamp(timestamp)} {/* Display formatted timestamp */}
          </div>
        </div>

        {/* Note content and creation date */}
        <div className="flex items-center text-[#94a3b8] text-sm">
          <span className="truncate text-white flex-1">
            {" "}
            {/* Made note content white and flexible */}
            {note.content.length > 80
              ? `${note.content.substring(0, 80)}...`
              : note.content}
          </span>
          {/* Keep date on the right */}
          <span className="ml-2 whitespace-nowrap">
            {new Date(note.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              // year: 'numeric' // Optionally remove year for brevity
            })}
          </span>
        </div>
      </div>
      {/* Removed Delete Button Section */}
    </div>
  );
};

const UserDashboard: FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentRecord[]>(
    []
  );
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // State for the initial list of courses with notes
  const [notedCoursesInfo, setNotedCoursesInfo] = useState<NotedCourseInfo[]>(
    []
  );
  const [loadingNotedCourses, setLoadingNotedCourses] = useState(false); // Loading state for the initial list

  // State for the notes of the currently expanded course
  const [activeCourseNotes, setActiveCourseNotes] = useState<Note[] | null>(
    null
  );
  const [loadingActiveNotes, setLoadingActiveNotes] = useState(false); // Loading state for notes within a panel
  // Initialize with undefined for Collapse activeKey compatibility
  const [activePanelKey, setActivePanelKey] = useState<
    string | string[] | undefined
  >(undefined);

  const clearWatchlist = async () => {
    try {
      message.success("Watchlist cleared");
      setBookmarks([]);
    } catch (error) {
      message.error("Failed to clear watchlist");
    }
  };

  const clearHistory = async () => {
    try {
      message.success("Viewing history cleared");
      setEnrolledCourses([]);
    } catch (error) {
      message.error("Failed to clear history");
    }
  };

  // Updated deleteNote to work with notedCourses state
  const deleteNote = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      message.success("Note deleted successfully");

      // If the deleted note was in the currently active panel, update that state
      if (activeCourseNotes && typeof activePanelKey === "string") {
        // Check if a single panel is active
        const currentCourseId = activePanelKey;
        // Find the course info to check if it's the active one
        const activeCourseInfo = notedCoursesInfo.find(
          (info) => info.id === currentCourseId
        );
        if (activeCourseInfo) {
          setActiveCourseNotes((prevNotes) =>
            prevNotes ? prevNotes.filter((note) => note.id !== noteId) : null
          );
          // If last note was deleted, maybe close the panel or show empty message
          if (activeCourseNotes.length === 1) {
            // Optionally refetch notedCoursesInfo or handle UI change
          }
        }
      }

      // Optional: Consider refetching notedCoursesInfo if a course might now have 0 notes
      // and you want to remove it from the list immediately. For now, we'll leave it.
    } catch (error) {
      message.error("Failed to delete note");
    }
  };

  // Get user data from localStorage
  const getUserData = () => {
    const userDataStr = localStorage.getItem("user");
    if (!userDataStr) return null;
    return JSON.parse(userDataStr);
  };

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      const userData = getUserData();
      if (!userData) return;

      setLoadingEnrolled(true);
      try {
        const data = await userService.getMyEnrolledCourses(userData.id);
        setEnrolledCourses(data);

        // If we have courses and they have at least one lesson, set the current lesson
        if (data.length > 0) {
          // Here we'd want to get the first lesson ID from the first course
          // For now we'll assume it exists in a real implementation
          // setCurrentLessonId(data[0].course.modules[0].lessons[0].id);
        }
      } catch (err) {
        message.error("Failed to load enrolled courses.");
      } finally {
        setLoadingEnrolled(false);
      }
    };
    fetchEnrolledCourses();
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      const userData = getUserData();
      if (!userData) return;

      setLoadingBookmarks(true);
      try {
        const data = await userService.getMyBookmarks(userData.id);
        setBookmarks(data);
      } catch (err) {
        message.error("Failed to load bookmarks.");
      } finally {
        setLoadingBookmarks(false);
      }
    };
    fetchBookmarks();
  }, []);

  // Fetch only the list of courses the user has notes for initially
  useEffect(() => {
    const fetchNotedCoursesInfoList = async () => {
      setLoadingNotedCourses(true);
      try {
        const courseInfos = await noteService.getMyNotedCoursesInfo();
        setNotedCoursesInfo(courseInfos);
      } catch (err) {
        message.error("Failed to load the list of your noted courses.");
        console.error("Error fetching noted courses info:", err);
      } finally {
        setLoadingNotedCourses(false);
      }
    };
    fetchNotedCoursesInfoList();
  }, []); // Runs once on component mount

  const handlePanelChange = async (key: string | string[] | undefined) => {
    // In accordion mode, key is expected to be string | undefined.
    // We update the state regardless.
    setActivePanelKey(key);

    // Check if key is a string (meaning a panel was opened)
    if (typeof key === "object" && key.length > 0) {
      const courseId = key; // Assign the string key to courseId
      setLoadingActiveNotes(true);
      setActiveCourseNotes(null); // Clear previous notes while loading

      console.log("Fetching notes for course ID:", courseId); // Debugging log
      try {
        // Fetch notes using the string courseId
        const notes = await noteService.getNotesByCourse(
          courseId.at(0) as string
        );
        setActiveCourseNotes(notes);
      } catch (error) {
        // Use the correct courseId in the error message
        message.error(`Failed to load notes for this course.`);
        console.error(`Error fetching notes for course ${courseId}:`, error);
        setActiveCourseNotes([]);
      } finally {
        setLoadingActiveNotes(false);
      }
    } else {
      // key is undefined (panel closed in accordion mode)
      setActiveCourseNotes(null); // Clear notes when panel is closed
    }
  };

  const getInstructorName = (course: any): string => {
    if (course?.instructor?.user) {
      return `${course.instructor.user.firstName} ${course.instructor.user.lastName}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-12">
          <SectionHeader title="MY BOOKMARKS" onClear={clearWatchlist} />
          {loadingBookmarks && (
            <div className="flex justify-center">
              <Spin size="large" />
            </div>
          )}
          {!loadingBookmarks && bookmarks.length === 0 && (
            <p className="text-[#94a3b8] text-center py-6">
              You haven't bookmarked any courses yet.
            </p>
          )}
          {!loadingBookmarks &&
            bookmarks.map((bookmark) => (
              <CourseCard
                key={bookmark.id}
                title={bookmark.course.title}
                instructorName={getInstructorName(bookmark.course)}
                avatar={bookmark.course.instructor?.avatar}
                thumbnail={bookmark.course.thumbnail}
              />
            ))}
        </div>

        <div className="mb-12">
          <SectionHeader title="ENROLLED COURSES" onClear={clearHistory} />
          {loadingEnrolled && (
            <div className="flex justify-center">
              <Spin size="large" />
            </div>
          )}
          {!loadingEnrolled && enrolledCourses.length === 0 && (
            <p className="text-[#94a3b8] text-center py-6">
              You haven't viewed any courses yet.
            </p>
          )}
          {!loadingEnrolled &&
            enrolledCourses.map((enrollment) => (
              <CourseCard
                key={enrollment.enrolledAt}
                title={enrollment.course.title}
                instructorName={getInstructorName(enrollment.course)}
                avatar={enrollment.course.instructor?.avatar}
                progress={enrollment.progress}
                thumbnail={enrollment.course.thumbnail}
              />
            ))}
        </div>
        {/* Updated "YOUR NOTES" Section */}
        <div>
          <SectionHeader title="YOUR NOTES" />
          {loadingNotedCourses && (
            <div className="flex justify-center py-6">
              <Spin size="large" />
            </div>
          )}
          {/* Check notedCoursesInfo length */}
          {!loadingNotedCourses && notedCoursesInfo.length === 0 && (
            <p className="text-[#94a3b8] text-center py-6">
              You haven't made any notes yet.
            </p>
          )}
          {/* Use Collapse component */}
          {!loadingNotedCourses && notedCoursesInfo.length > 0 && (
            <Collapse
              accordion // Only one panel open at a time
              onChange={handlePanelChange}
              activeKey={activePanelKey}
              className="border-none" // Remove default Collapse border
              expandIconPosition="end"
              ghost // Use ghost for cleaner integration
            >
              {notedCoursesInfo.map((courseInfo) => (
                <Panel
                  header={
                    <span className="text-white font-medium">
                      {courseInfo.title}
                    </span>
                  }
                  key={courseInfo.id}
                  // Apply styling directly to the Panel using className
                  className="bg-[#13151f] mb-4 rounded-lg border border-[#1e2736] overflow-hidden hover:bg-[#1a1f2e] transition-colors"
                >
                  {/* Content inside the panel - Panel content already has padding via AntD default */}
                  {loadingActiveNotes && (
                    <div className="flex justify-center py-4">
                      <Spin />
                    </div>
                  )}
                  {!loadingActiveNotes &&
                    activeCourseNotes &&
                    activeCourseNotes.length > 0 && (
                      <div>
                        {activeCourseNotes.map((note: Note) => (
                          <NoteItem
                            key={note.id}
                            note={note}
                            courseTitle={courseInfo.title} // Pass course title from courseInfo
                            timestamp={note.timestamp}
                            onDelete={deleteNote}
                          />
                        ))}
                      </div>
                    )}
                  {!loadingActiveNotes &&
                    activeCourseNotes &&
                    activeCourseNotes.length === 0 && (
                      <p className="text-[#94a3b8] text-center py-4">
                        No notes found for this course.
                      </p>
                    )}
                </Panel>
              ))}
            </Collapse>
          )}
          {/* Previous rendering logic removed */}
          {/* {!loadingNotedCourses && notedCoursesData.length > 0 && (
                        <div className="space-y-6">
                            {notedCoursesData.map((courseData) => (
                                <div key={courseData.courseId}>

                                </div>
                            ))}
                        </div>
                    )} */}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
