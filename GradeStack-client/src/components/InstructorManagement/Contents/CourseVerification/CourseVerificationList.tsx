import { useState, useEffect } from "react";
import { Badge, Button, Loader } from "@mantine/core";
import { MdAccessTime, MdVideoLibrary, MdCheck, MdClose } from "react-icons/md";
import { formatVND } from "../../../../utils/formatCurrency";
import { message } from "antd";
import courseVerificationService from "../../../../services/courseVerification.service";
import { formatDuration } from "../../../../utils/formatDuration";
interface Lesson {
  id: string;
  title: string;
  lessonType?: string;
  duration?: number;
  video?: {
    duration: number;
  };
  finalTest?: {
    estimatedDuration: number;
  };
}

interface Module {
  id: string;
  title: string;
  videoDuration?: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  isPublished: boolean;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  _count: {
    students: number;
    modules: number;
    lessons: number;
  };
}

const calculateCourseDuration = (course: Course) => {
  let totalDurationInSeconds = 0;

  if (course.modules && course.modules.length > 0) {
    course.modules.forEach((module) => {
      // Add module videoDuration if available
      if (module.videoDuration) {
        totalDurationInSeconds += module.videoDuration;
      }

      // Add durations from lessons
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach((lesson) => {
          if (lesson.lessonType === "VIDEO" && lesson.video) {
            totalDurationInSeconds += lesson.video.duration || 0;
          } else if (lesson.lessonType === "FINAL_TEST" && lesson.finalTest) {
            totalDurationInSeconds +=
              (lesson.finalTest.estimatedDuration || 0) * 60;
          } else {
            totalDurationInSeconds += lesson.duration || 0;
          }
        });
      }
    });
  }

  return totalDurationInSeconds;
};

const CourseVerificationList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseVerificationService.getUnpublishedCourses();
      console.log(data, "data");
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handlePublishToggle = async (
    courseId: string,
    isCurrentlyPublished: boolean
  ) => {
    try {
      // Show different loading message depending on current state
      const loadingMessage = isCurrentlyPublished
        ? "Unpublishing course..."
        : "Publishing course and sending email notification...";

      const loadingKey = "publishToggle";
      message.loading({
        content: loadingMessage,
        key: loadingKey,
        duration: 0,
      });

      await courseVerificationService.toggleCoursePublishStatus(courseId);

      // Show appropriate success message
      const successMessage = isCurrentlyPublished
        ? "Course unpublished successfully"
        : "Course published successfully and notification email sent to instructor";

      message.success({
        content: successMessage,
        key: loadingKey,
        duration: 3,
      });

      fetchCourses();
    } catch (error) {
      console.error("Error toggling course status:", error);
      message.error("Failed to update course status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-zinc-800 mt-2">
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader color="blue" size="xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 mt-2">
      <div className="flex justify-between items-center mb-8 px-6">
        <div>
          <h1 className="text-3xl font-bold text-white mt-8">
            Course Verification
          </h1>
          <p className="text-gray-400 text-sm">
            Manage and verify course publication status
          </p>
        </div>
        <div className="bg-neutral-700 px-4 py-2 rounded-lg">
          <span className="text-white font-medium">
            {courses.length} Courses Pending
          </span>
        </div>
      </div>

      <div className="space-y-4 px-6">
        {courses.map((course) => (
          <a
            href={`/instructor-management/verify-courses/${course.id}`}
            key={course.id}
          >
            <div className="mt-4 bg-neutral-600 rounded-lg overflow-hidden shadow-lg hover:bg-neutral-600 transition-colors duration-200">
              <div className="flex p-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0 mr-6 w-48 h-32">
                  <img
                    src={
                      course.thumbnail || "https://via.placeholder.com/192x128"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-xl font-semibold text-white">
                        {course.title}
                      </h2>
                      <Badge
                        color={course.isPublished ? "green" : "yellow"}
                        variant="light"
                        size="lg"
                      >
                        {course.isPublished ? "Published" : "Pending Approval"}
                      </Badge>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-full">
                        <MdAccessTime className="w-4 h-4" />
                        <span>
                          {formatDuration(calculateCourseDuration(course))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-full">
                        <MdVideoLibrary className="w-4 h-4" />
                        <span>
                          {course.modules?.reduce(
                            (total, module) => total + module.lessons.length,
                            0
                          ) || 0}{" "}
                          Lessons
                        </span>
                      </div>

                      <div className="bg-neutral-800 px-3 py-1 rounded-full">
                        <span className="text-blue-400 font-medium">
                          {formatVND(course.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 ml-4">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePublishToggle(course.id, course.isPublished);
                      }}
                      variant="light"
                      color={course.isPublished ? "red" : "green"}
                      leftSection={
                        course.isPublished ? (
                          <MdClose size={16} />
                        ) : (
                          <MdCheck size={16} />
                        )
                      }
                      size="md"
                      className="w-32"
                    >
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <span className="text-xs text-gray-400">
                      Last updated:{" "}
                      {new Date(course.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}

        {courses.length === 0 && (
          <div className="text-center py-16 bg-neutral-700 rounded-lg">
            <MdVideoLibrary className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No Pending Courses
            </h3>
            <p className="text-gray-400">
              All courses have been reviewed and verified
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseVerificationList;
