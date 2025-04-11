import { Link } from "react-router-dom";
import { Badge, Modal } from "@mantine/core";
import { MdPeople, MdAccessTime, MdFolder } from "react-icons/md";
import { useState, useEffect } from "react";
import { instructorService } from "../../../../services/api";
import { formatDuration } from "../../../../utils/formatDuration";
import { formatVND } from "../../../../utils/formatCurrency";
import { message } from "antd";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  duration: number;
  CourseTopic: {
    topic: {
      id: string;
      name: string;
      thumbnail: string;
      description: string;
    };
  }[];
  isPublished: boolean;
  createdAt: Date;
  modules: {
    id: string;
    title: string;
    description: string;
    order: number;
    videoDuration: number;
    lessons: {
      id: string;
      title: string;
      description: string;
      lessonType: string;
      duration: number;
      isPreview: boolean;
    }[];
  }[];
  _count: {
    EnrolledCourse: number;
  };
}

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (courseToDelete) {
      await handleDeleteCourse(courseToDelete);
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        setError("User not found. Please login again.");
        return;
      }
      const user = JSON.parse(userData);

      await instructorService.deleteCourse(user.id, courseId);
      setCourses(courses.filter((course) => course.id !== courseId));
      message.success("Course deleted successfully!");
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("Failed to delete course. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("User not found. Please login again.");
          return;
        }

        const user = JSON.parse(userData);
        const data = await instructorService.getFullCourses(user.id);
        console.log(data);
        setCourses(data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch courses. Please try again later.");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
        <div className="flex justify-center items-center h-full">
          <div className="text-white">Loading courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
        <div className="flex justify-center items-center h-full">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Delete"
        centered
      >
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete this course? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Course Management</h1>
        <Link to="create">
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            Create New Course
          </button>
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-neutral-700 rounded-lg overflow-hidden shadow-lg"
          >
            <div className="flex p-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0 mr-6 w-32 h-32">
                <img
                  src={
                    course.thumbnail ||
                    "https://images.laracasts.com/series/thumbnails/svg/livewire-uncovered.svg?tr=w-200"
                  }
                  alt={course.title}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2 max-w-5xl">
                    <h2 className="line-clamp-1 overflow-hidden text-xl font-semibold text-white">
                      {course.title}
                    </h2>
                    <span>
                      <Badge
                        color={course.isPublished ? "green" : "yellow"}
                        variant="light"
                      >
                        {course.isPublished ? "Published" : "Pending Approval"}
                      </Badge>
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4" />
                      <span>
                        {formatDuration(
                          course.modules.reduce(
                            (total, module) =>
                              total + (module.videoDuration || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdFolder className="w-4 h-4" />
                      <span>{course.modules?.length || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdPeople className="w-4 h-4" />
                      <span>{course._count?.EnrolledCourse || 0} Students</span>
                    </div>
                    <div>
                      <img
                        src={course.CourseTopic[0]?.topic.thumbnail}
                        className="w-7 h-7 rounded"
                      ></img>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 ml-4">
                  <span className="text-xl font-bold text-white">
                    {formatVND(course.price)}
                  </span>
                  {course.isPublished && (
                    <Link to={`detail/${course.id}`}>
                      <button className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500">
                        Details
                      </button>
                    </Link>
                  )}
                  <div className="flex">
                    <button
                      onClick={() => handleDeleteClick(course.id)}
                      className="text-white bg-red-500 hover:bg-red-700 p-1 rounded text-sm font-medium"
                    >
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
