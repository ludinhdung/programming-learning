import { useState, useEffect, useCallback, useMemo } from 'react';
import { Input, Checkbox, Button, message } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import { Course } from '../../services/course.service'; // Updated import
import courseService, { GetCoursesParams } from '../../services/course.service'; // Import course service
import { debounce } from 'lodash';


const CustomCheckbox = styled(Checkbox)`
    .ant-checkbox-inner {
      width: 14px;
      height: 14px;
      border: none;
      border-radius: 0;
    }
`;

const StyledInput = styled(Input)`
  .ant-input::placeholder {
    color: #717780 !important;
    font-weight: 500;
  }
`;

const LoadingBar = styled.div`
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


const CourseList = () => {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const pageSize = 20; // Set page size to 20

  const topics = [
    { id: '3f6caba7-681d-4660-a7e0-4643f8ffe45f', name: 'JavaScript', count: 25 },
    { id: 'php', name: 'PHP', count: 32 },
    { id: 'laravel', name: 'Laravel', count: 45 },
    { id: 'vue', name: 'Vue', count: 18 },
    { id: 'react', name: 'React', count: 20 },
    { id: 'testing', name: 'Testing', count: 15 },
  ];

  const instructors = [
    { id: '050c6223-9027-4d64-8f57-9e41afbb3908', name: 'Jon Josh', count: 42 },
    { id: 'jeremy-mcpeak', name: 'Jeremy McPeak', count: 28 },
    { id: 'simon-wardley', name: 'Simon Wardley', count: 15 },
    { id: 'luke-downing', name: 'Luke Downing', count: 23 },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setShowLoading(true);
      try {
        const params: GetCoursesParams = {
          page: currentPage,
          limit: pageSize,
          sortBy: 'createdAt',
          order: 'desc',
        };

        if (selectedTopics.length > 0) {
          params.topicId = selectedTopics[0];
        }

        if (selectedInstructors.length > 0) {
          params.instructorId = selectedInstructors[0];
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await courseService.getCourses(params);
        setCourses(response.data);
        setTotalCourses(response.meta.totalCount);
        setTotalPages(response.meta.totalPages);
        setIsLoading(false);

        setTimeout(() => {
          setShowLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        message.error("Failed to load courses. Please try again later.");
        setCourses([]);
        setIsLoading(false);
        setShowLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, selectedTopics, selectedInstructors, searchQuery]);

  const handleTopicChange = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleInstructorChange = (instructorId: string) => {
    setSelectedInstructors(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const showPreviousButton = currentPage > 1;
  const showNextButton = currentPage < totalPages;
  const hasFilters = selectedTopics.length > 0 || selectedInstructors.length > 0 || searchQuery.trim() !== '';

  const debouncedSetSearchQuery = useCallback(() => {
    const handler = debounce((searchValue: string) => {
      setSearchQuery(searchValue);
      setCurrentPage(1);
    }, 500);

    return handler;
  }, []);

  const debouncedHandler = useMemo(() => debouncedSetSearchQuery(), [debouncedSetSearchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);
    debouncedHandler(value);
  };

  // Handle search when user presses Enter
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInputValue);
      setCurrentPage(1); // Reset to first page when searching
    }
  };

  // Reset filters
  const handleResetSearch = () => {
    setSelectedTopics([]);
    setSelectedInstructors([]);
    setSearchInputValue('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopics, selectedInstructors]);

  const selectedFilters = [
    searchQuery.trim() ? `"${searchQuery}"` : null,
    ...selectedTopics.map(topicId => topics.find(topic => topic.id === topicId)?.name),
    ...selectedInstructors.map(instructorId => instructors.find(instructor => instructor.id === instructorId)?.name)
  ].filter(Boolean).join(', ');

  const formatCourseForDisplay = (course: Course) => {
    const instructorName = course.instructor?.user
      ? `${course.instructor.user.firstName} ${course.instructor.user.lastName}`
      : 'Unknown Instructor';

    return {
      ...course,
      instructor: {
        name: instructorName,
        avatar: 'https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/253739.jpg?v=352', // Default avatar
      },
      thumbnail: course.thumbnail || 'https://s3-sgn09.fptcloud.com/codelearnstorage/files/thumbnails/csharp-fullstack_8_63694c3f5e9d48d2b826de8ccb411b82.png', // Default thumbnail
    };
  };

  // Get the start and end indices for display
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCourses);

  return (
    <div className="min-h-screen bg-[#0a1321]">
      {showLoading && <LoadingBar />}
      <Header />

      <div className="flex">
        <div className="w-72 min-h-[calc(100vh-64px)] bg-[#0a1321] p-6 fixed left-0 overflow-y-auto">
          <div className="mb-8 mt-10">
            <div className="flex">
              <StyledInput
                size="large"
                variant='borderless'
                placeholder="Search for courses..."
                prefix={<svg className='ml-2 mr-4' width="18" viewBox="0 0 27 27" fill="none"><rect x="2.92578" y="2.92603" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="5.85205" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="8.77783" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="11.7041" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="14.6289" y="2.92603" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="14.6289" y="14.6301" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="20.4824" y="20.4819" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="23.4082" y="23.408" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="2.92578" y="14.6301" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="5.85156" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="8.7793" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="11.7051" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="5.85156" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="8.7793" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="11.7051" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="5.85205" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="8.77783" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="11.7041" width="2.92599" height="2.92599" className="fill-current"></rect></svg>}
                className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2 mb-4 w-full"
                value={searchInputValue}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Topics</h3>
            <div className="space-y-2 border border-blue-500 border-opacity-15 p-4">
              {topics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between ">
                  <CustomCheckbox
                    checked={selectedTopics.includes(topic.id)}
                    onChange={() => handleTopicChange(topic.id)}
                  >
                    <span className="ml-2 text-white text-[13.5px] font-medium">
                      {topic.name} ({topic.count})
                    </span>
                  </CustomCheckbox>;
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">Instructors</h3>
            <div className="space-y-2 border border-blue-500 border-opacity-15 p-4">
              {instructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center justify-between">
                  <CustomCheckbox
                    checked={selectedInstructors.includes(instructor.id)}
                    onChange={() => handleInstructorChange(instructor.id)}
                    className="text-gray-400 hover:text-white [&>.ant-checkbox-inner]:rounded-none [&>.ant-checkbox-inner]:border-gray-500"
                  >
                    <span className="ml-2 text-white text-[13.5px] font-medium">{instructor.name} ({instructor.count})</span>
                  </CustomCheckbox>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-64 flex-1 p-8 mt-4">
          <div className="mt-4 mb-12 border border-blue-500 border-opacity-15 p-2 flex justify-between items-center">
            <p className="text-[#bad9fc] text-base font-semibold">
              Showing {startIndex + 1}-{endIndex} of {totalCourses} results
              {selectedFilters && ` — filtered by ${selectedFilters}`}
            </p>
            {hasFilters && (
              <Button
                type="text"
                onClick={handleResetSearch}
                className="bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                Reset Search
              </Button>
            )}
          </div>

          {isLoading ? (
            <div></div>
          ) : courses.length === 0 ? (
            <div className="text-center text-white py-12">
              <h3 className="text-2xl font-bold mb-4">No courses found</h3>
              <p>Try adjusting your search filters or check back later for new courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const displayCourse = formatCourseForDisplay(course);
                return (
                  <div
                    key={course.id}
                    className="group cursor-pointer"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className="bg-[#14202e] rounded-none overflow-hidden transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-blue-400">
                        <img
                          src={displayCourse.thumbnail}
                          alt={course.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6 min-h-[13rem] flex flex-col justify-between">
                        <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                          {course.title}
                        </h3>
                        <div>
                          <div className="flex items-center space-x-3 mb-4 mt-2">
                            <img
                              src={displayCourse.instructor.avatar}
                              alt={displayCourse.instructor.name}
                              className="w-6 h-6 rounded-none "
                            />
                            <span className="text-[#bad9fc] text-sm font-semibold">
                              with {displayCourse.instructor.name}
                            </span>
                          </div>
                          <p className="text-white font-medium text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <p className="text-[#3b82f6] text-lg font-bold">
                            {course.price.toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Button */}
          <div className="mt-8 flex justify-end">
            {showPreviousButton && (
              <Button
                type="text"
                onClick={handlePreviousPage}
                className="bg-[#29324a] text-[#fff] text-base font-medium py-5 px-4 rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                <div className="flex items-center">
                  <ArrowLeftOutlined className="mr-2" />
                  Previous
                </div>
              </Button>
            )}

            {showPreviousButton && showNextButton && <div className="w-4" />}

            {showNextButton && (
              <Button
                type="text"
                onClick={handleNextPage}
                className="bg-[#29324a] text-[#fff] text-base font-medium py-5 px-4 rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                <div className="flex items-center">
                  Next
                  <ArrowRightOutlined className="ml-2" />
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;