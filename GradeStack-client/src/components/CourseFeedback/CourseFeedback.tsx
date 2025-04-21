import { useState } from "react";
const courseFeedbackMockData = [
  {
    id: "fb1",
    learner: {
      id: "user1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    },
    courseId: "course1",
    rating: 5,
    comment:
      "Great course! The instructor explains complex concepts in a very clear and understandable way. Highly recommended for beginners.",
    createdAt: "2024-03-15T08:30:00Z",
  },
  {
    id: "fb2",
    learner: {
      id: "user2",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
    },
    courseId: "course1",
    rating: 4,
    comment:
      "Very practical course with good examples. Would love to see more advanced topics covered.",
    createdAt: "2024-03-14T15:20:00Z",
  },
  {
    id: "fb3",
    learner: {
      id: "user3",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
    },
    courseId: "course1",
    rating: 5,
    comment:
      "The coding exercises were particularly helpful. I learned a lot by practicing.",
    createdAt: "2024-03-13T10:45:00Z",
  },
  {
    id: "fb3",
    learner: {
      id: "user3",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
    },
    courseId: "course1",
    rating: 5,
    comment:
      "The coding exercises were particularly helpful. I learned a lot by practicing.",
    createdAt: "2024-03-13T10:45:00Z",
  },
  {
    id: "fb3",
    learner: {
      id: "user3",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
    },
    courseId: "course1",
    rating: 5,
    comment:
      "The coding exercises were particularly helpful. I learned a lot by practicing.",
    createdAt: "2024-03-13T10:45:00Z",
  },
  {
    id: "fb3",
    learner: {
      id: "user3",
      firstName: "Bob",
      lastName: "Wilson",
      email: "bob@example.com",
    },
    courseId: "course1",
    rating: 5,
    comment:
      "The coding exercises were particularly helpful. I learned a lot by practicing.",
    createdAt: "2024-03-13T10:45:00Z",
  },
];

const CourseFeedback = () => {
  const [visibleFeedbacks, setVisibleFeedbacks] = useState(4);

  const showMoreFeedbacks = () => {
    setVisibleFeedbacks((prev) => prev + 4);
  };
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-extrabold text-white mb-6 uppercase">
        <span className="text-[#3b82f6] mr-2">//</span>
        Student Feedbacks
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {/*Slide từ 0 - visibleFeedbacks*/}
        {courseFeedbackMockData.slice(0, visibleFeedbacks).map((feedback) => (
          <div
            key={feedback.id}
            className="bg-[#14202e] p-6 border border-[#1c2432]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-[#1b55ac] flex items-center justify-center text-white font-medium">
                  {feedback.learner.firstName[0]}
                  {feedback.learner.lastName[0]}
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-medium">
                    {feedback.learner.firstName} {feedback.learner.lastName}
                  </h3>
                  {/*Star rating*/}
                  <div className="flex items-center mt-1">
                    {/*tạo array mới với 5 index là undefined*/}
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 ${
                          index < feedback.rating
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-300 line-clamp-3">
              {feedback.comment}
            </p>
          </div>
        ))}
      </div>

      {visibleFeedbacks < courseFeedbackMockData.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={showMoreFeedbacks}
            className="px-6 py-3 bg-[#1b55ac] text-white font-medium rounded-none hover:bg-[#1c2e48] transition-colors"
          >
            See More Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseFeedback;
