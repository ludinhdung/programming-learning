import { Link } from "react-router-dom";
import { Badge } from "@mantine/core";
import { MdPeople, MdAccessTime, MdFolder } from "react-icons/md";
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  duration: number;
  isPublished: boolean;
  createdAt: Date;
  _count: {
    modules: number;
    EnrolledCourse: number;
  };
}

const CourseList = () => {
const courses: Course[] = [
  {
    id: "1",
    title: "Complete JavaScript Course 2024",
    thumbnail:
      "https://images.laracasts.com/series/thumbnails/svg/definition-series.svg?tr=w-244",
    description:
      "Master JavaScript with modern ES6+ features, async programming, and real-world projects. Perfect for beginners and intermediate developers.and real-world projects. Perfect for beginners and intermediate developers.and real-world projects. Perfect for beginners and intermediate developers.",
    price: 89.99,
    duration: 2160, // 36 hours in minutes
    isPublished: true,
    createdAt: new Date("2024-01-15"),
    _count: {
      modules: 12,
      EnrolledCourse: 156,
    },
  },
  {
    id: "2",
    title: "Python for Data Science",
    thumbnail:
      "https://images.laracasts.com/series/thumbnails/svg/javascript-for-php-devs.svg?tr=w-244",
    description:
      "Learn Python programming with focus on data analysis, visualization, and machine learning fundamentals.and real-world projects. Perfect for beginners and intermediate developers.and real-world projects. Perfect for beginners and intermediate developers.",
    price: 79.99,
    duration: 1800, // 30 hours in minutes
    isPublished: false,
    createdAt: new Date("2024-02-01"),
    _count: {
      modules: 8,
      EnrolledCourse: 0,
    },
  },
  {
    id: "3",
    title: "React & Next.js Full Stack",
    thumbnail:
      "https://images.laracasts.com/series/thumbnails/svg/definition-series.svg?tr=w-244",
    description:
      "Build modern web applications with React 18, Next.js 14, TypeScript, and Tailwind CSS. Includes authentication and database integration.",
    price: 99.99,
    duration: 2400, // 40 hours in minutes
    isPublished: true,
    createdAt: new Date("2024-01-20"),
    _count: {
      modules: 15,
      EnrolledCourse: 89,
    },
  },
  {
    id: "4",
    title: "DevOps Essentials",
    thumbnail:
      "https://images.laracasts.com/series/thumbnails/svg/javascript-for-php-devs.svg?tr=w-244",
    description:
      "Master Docker, Kubernetes, CI/CD pipelines, and cloud deployment strategies. Hands-on with AWS and GitHub Actions.",
    price: 129.99,
    duration: 1920, // 32 hours in minutes
    isPublished: false,
    createdAt: new Date("2024-02-10"),
    _count: {
      modules: 10,
      EnrolledCourse: 0,
    },
  },
];

  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-800 p-8">
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
              <div className="flex-shrink-0 mr-6">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-xl font-semibold text-white">
                      {course.title}
                    </h2>
                    <Badge
                      color={course.isPublished ? "green" : "yellow"}
                      variant="light"
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4" />
                      <span>
                        {Math.floor(course.duration / 60)}h{" "}
                        {course.duration % 60}m
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdFolder className="w-4 h-4" />
                      <span>{course._count.modules} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdPeople className="w-4 h-4" />
                      <span>{course._count.EnrolledCourse} Students</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 ml-4">
                  <span className="text-xl font-bold text-white">
                    ${course.price}
                  </span>
                  {!course.isPublished && (
                    <button className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-500">
                      Publish
                    </button>
                  )}
                  <div className="flex">
                    <Link
                      to={`edit/${course.id}`}
                      className="text-indigo-500 hover:text-indigo-400 text-sm font-medium"
                    >
                      Edit Course
                    </Link>
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
