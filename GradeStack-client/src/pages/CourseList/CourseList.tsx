import { useState, useEffect } from 'react'; // Thêm useEffect
import { Input, Checkbox, Button } from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import styled from "styled-components";
import { mockCourses, Course } from './mockCourses'; // Import mockCourses

const StyledInput = styled(Input)`
  .ant-input::placeholder {
    color: #717780 !important;
    font-weight: 500;
  }
`;

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // Set page size to 20

  const topics = [
    { id: 'javascript', name: 'JavaScript', count: 25 },
    { id: 'php', name: 'PHP', count: 32 },
    { id: 'laravel', name: 'Laravel', count: 45 },
    { id: 'vue', name: 'Vue', count: 18 },
    { id: 'react', name: 'React', count: 20 },
    { id: 'testing', name: 'Testing', count: 15 },
  ];

  const instructors = [
    { id: 'jeffrey-way', name: 'Jeffrey Way', count: 42 },
    { id: 'jeremy-mcpeak', name: 'Jeremy McPeak', count: 28 },
    { id: 'simon-wardley', name: 'Simon Wardley', count: 15 },
    { id: 'luke-downing', name: 'Luke Downing', count: 23 },
  ];

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

  const CustomCheckbox = styled(Checkbox)`
    .ant-checkbox-inner {
      width: 14px;
      height: 14px;
      border: none;
      border-radius: 0;
    }
  `;

  // Filter courses based on selected topics and instructors
  const filteredCourses = mockCourses.filter(course =>
    (selectedTopics.length === 0 || selectedTopics.includes(course.category.toLowerCase())) &&
    (selectedInstructors.length === 0 || selectedInstructors.includes(course.instructor.name.toLowerCase()))
  );

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedCourses = filteredCourses.slice(startIndex, endIndex);

  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < filteredCourses.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isLastPage = currentPage * pageSize >= filteredCourses.length;

  const totalPages = Math.ceil(filteredCourses.length / pageSize);

  // Chỉ hiển thị nút "Previous" nếu không phải là trang đầu tiên
  const showPreviousButton = currentPage > 1;

  // Chỉ hiển thị nút "Next" nếu không phải là trang cuối cùng
  const showNextButton = currentPage < totalPages;

  // Kiểm tra xem có bộ lọc nào được áp dụng không
  const hasFilters = selectedTopics.length > 0 || selectedInstructors.length > 0;

  // Hàm reset bộ lọc
  const handleResetSearch = () => {
    setSelectedTopics([]);
    setSelectedInstructors([]);
    setSearchQuery('');
    setCurrentPage(1); // Reset về trang đầu tiên
  };

  // Reset currentPage về 1 khi selectedTopics hoặc selectedInstructors thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopics, selectedInstructors]);

  // Create a string of selected filters
  const selectedFilters = [
    ...selectedTopics.map(topicId => topics.find(topic => topic.id === topicId)?.name),
    ...selectedInstructors.map(instructorId => instructors.find(instructor => instructor.id === instructorId)?.name)
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-[#0a1321]">
      <Header />

      <div className="flex">
        {/* Left Sidebar - update className for checkboxes */}
        <div className="w-72 min-h-[calc(100vh-64px)] bg-[#0a1321] p-6 fixed left-0 overflow-y-auto">
          {/* Search Input */}
          <div className="mb-8 mt-10">
            <StyledInput
              size="large"
              variant='borderless'
              placeholder="Search..."
              prefix={<svg className='ml-2 mr-4' width="18" viewBox="0 0 27 27" fill="none"><rect x="2.92578" y="2.92603" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="5.85205" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="8.77783" width="2.92599" height="2.92599" className="fill-current"></rect><rect y="11.7041" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="14.6289" y="2.92603" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="14.6289" y="14.6301" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="20.4824" y="20.4819" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="23.4082" y="23.408" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="2.92578" y="14.6301" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="5.85156" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="8.7793" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="11.7051" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="5.85156" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="8.7793" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="11.7051" y="17.5562" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="5.85205" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="8.77783" width="2.92599" height="2.92599" className="fill-current"></rect><rect x="17.5547" y="11.7041" width="2.92599" height="2.92599" className="fill-current"></rect></svg>}
              className="rounded-none bg-[#1c2936] border-none text-white hover:bg-[#243447] p-2 mb-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Topics Filter - update Checkbox styles */}
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

          {/* Instructors Filter - update Checkbox styles */}
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

        {/* Main Content - update card styles and add pagination */}
        <div className="ml-64 flex-1 p-8 mt-4">
          <div className="mt-4 mb-12 border border-blue-500 border-opacity-15 p-2 flex justify-between items-center">
            <p className="text-[#bad9fc] text-base font-semibold">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} results
              {selectedFilters && ` — filtered by ${selectedFilters}`}
            </p>
            {hasFilters && (
              <Button
                type='none'
                onClick={handleResetSearch}
                className="bg-[#29324a] text-[#fff] text-xs font-medium rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                Reset Search
              </Button>
            )}
          </div>

          {/* Course Grid - update card styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCourses.map((course) => (
              <div
                key={course.id}
                className="group cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="bg-[#14202e] rounded-none overflow-hidden transition-all duration-300 group-hover:transform group-hover:-translate-y-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-blue-400">
                    <img
                      src={course.thumbnail}
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
                          src={course.instructor.avatar}
                          alt={course.instructor.name}
                          className="w-6 h-6 rounded-none "
                        />
                        <span className="text-[#bad9fc] text-sm font-semibold">
                          with {course.instructor.name}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <p className="text-[#3b82f6] text-lg font-bold">
                        {course.price.toLocaleString()} đ
                      </p>

                      <p className="text-lg line-through text-gray-400">
                        {course.price.toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Button */}
          <div className="mt-8 flex justify-end">
            {showPreviousButton && (
              <Button
                type='none'
                onClick={handlePreviousPage}
                className="bg-[#29324a] text-[#fff] text-base font-medium py-5 px-4 rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                <ArrowLeftOutlined /> Previous
              </Button>
            )}
            {showNextButton && (
              <Button
                type='none'
                onClick={handleNextPage}
                className="bg-[#29324a] text-[#fff] text-base font-medium py-5 px-4 rounded-none hover:border-[#1b55ac] hover:bg-[#1c2e48]"
              >
                Next <ArrowRightOutlined />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseList;