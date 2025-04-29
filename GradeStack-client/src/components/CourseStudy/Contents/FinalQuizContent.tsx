import React, { useCallback, useEffect, useState } from "react";
import { Lesson } from "../CourseStudyBoard";
import { Button, message, Progress, Drawer, Rate, Input } from "antd";
import confetti from "canvas-confetti";
import AOS from "aos";
import "aos/dist/aos.css";
import { learnerService } from "../../../services/api";
import { feedbackService } from "../../../services/api";
import CertificateModal from './CertificateModal';

interface FinalQuizContentProps {
  lesson: Lesson;
  onMarkComplete: (lessonId: string) => Promise<void>;
  courseId: string;
}

interface SubmissionStatus {
  submitted: boolean;
  score: number;
  submittedAt: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

const FinalQuizContent: React.FC<FinalQuizContentProps> = ({
  lesson,
  onMarkComplete,
  courseId,
}) => {
  // State for quiz progress and answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus | null>(null);

  // Quiz configuration
  const passingScore = lesson.content.finalTest?.passingScore || 70;
  const initialTimeInSeconds = (lesson.content.finalTest?.estimatedDuration || 30) * 60;
  const [remainingTime, setRemainingTime] = useState(initialTimeInSeconds);
  const questions = lesson.content.finalTest?.questions || [];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Certificate and user state
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check submission status when component mounts
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const response = await learnerService.checkFinalTestSubmission(
          user.id,
          lesson.id
        );
        console.log(response.data);

        if (response.data) {
          setSubmissionStatus(response.data);
        }
      } catch (error) {
        console.error("Error checking submission status:", error);
      }
    };

    checkSubmissionStatus();
  }, [lesson.id]);

  //fade
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      offset: 50,
    });
  }, []);

  // useEffect mới để handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showFeedback) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [showFeedback]);

  // useEffect để handle các phím tắt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) {
        // Prevent F5
        if (e.key === "F5") {
          e.preventDefault();
          message.warning(
            "Please complete the feedback before refreshing the page"
          );
        }
        // Prevent Ctrl + R
        if (e.key === "r" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          message.warning(
            "Please complete the feedback before refreshing the page"
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFeedback]);

  // Format thời gian từ giây sang định dạng mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  //start quiz
  const handleStartQuiz = () => {
    if (submissionStatus?.submitted) {
      message.warning(
        "You have already completed this test. You cannot retake it."
      );
      return;
    }
    setIsQuizStarted(true);
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  };

  // Add this useEffect to get user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleSubmitFeedback = async () => {
    if (feedbackRating === 0 || feedbackComment.trim() === "") {
      message.error("Please provide a rating and comment");
      return;
    }

    try {
      setIsSubmittingFeedback(true);

      if (!currentUser) {
        message.error("User not found. Please login again.");
        return;
      }

      await feedbackService.createFeedback(courseId, currentUser.id, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });

      message.success("Thank you for your feedback!");
      setShowFeedback(false);
      // Show certificate modal after feedback submission
      setShowCertificateModal(true);
    } catch (error: unknown) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Submit test
  const handleSubmit = useCallback(async () => {
    setIsQuizSubmitted(true);

    const score = Math.round(
      (Object.entries(selectedAnswers).filter(
        ([qIndex, aIndex]) =>
          questions[Number(qIndex)].answers[aIndex].isCorrect
      ).length /
        questions.length) *
      100
    );

    if (score >= passingScore) {
      fireConfetti();
      try {
        const userData = localStorage.getItem("user");
        if (!userData) {
          message.error("User not found. Please login again.");
          return;
        }
        const user = JSON.parse(userData);
        await learnerService.submitFinalTest(user.id, lesson.id, score);
        message.success("You have successfully completed this test");
        await onMarkComplete(lesson.id);
        setTimeout(() => {
          setShowFeedback(true);
        }, 2000);
      } catch (error) {
        console.error("Failed to submit final test:", error);
      }
    }
  }, [selectedAnswers, questions, passingScore, lesson.id, onMarkComplete]);

  // Xử lý countdown timer
  useEffect(() => {
    if (isQuizStarted && !isQuizSubmitted && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizStarted, isQuizSubmitted, handleSubmit, remainingTime]);

  // Thêm warning khi thời gian sắp hết
  const getTimeColor = () => {
    if (remainingTime <= 60) return "text-red-400";
    if (remainingTime <= 180) return "text-yellow-400";
    return "text-blue-400";
  };

  //lấy ra dc câu trả lời đã chọn tại question
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isQuizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleRetry = () => {
    setIsQuizSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setRemainingTime(initialTimeInSeconds);
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 500,
      spread: 150,
      origin: { x: 0.6, y: 0.5 },
      colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
    });
  };

  if (submissionStatus?.submitted) {
    return (
      <div className="max-w-5xl mx-auto p-6 min-h-[600px]">
        <div className="bg-[#17212c] rounded-xl p-8 shadow-lg border border-[#171c29] text-center">
          <h1 className="text-3xl font-bold text-gray-200 mb-4">
            {lesson.title}
          </h1>
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-none max-w-lg mx-auto">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-lg mb-2">Your Score</p>
                  <p className="text-4xl font-bold text-green-400">
                    {submissionStatus.score}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Submitted On</p>
                  <p className="text-lg text-gray-200">
                    {new Date(submissionStatus.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
                  <p className="text-green-400">
                    You have successfully completed this test. Your progress has
                    been saved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-6">
        {!isQuizStarted ? (
          <div
            data-aos="fade-left"
            data-aos-duration="800"
            className="bg-[#1c2936] rounded-xl p-8 shadow-lg border border-[#29334a] text-center"
          >
            <h1 className="text-3xl font-bold text-gray-200 mb-4">
              {lesson.title}
            </h1>
            <div className="space-y-6 mb-8">
              <p className="text-gray-400">Final Assessment</p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-400">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatTime(initialTimeInSeconds)}
                  </div>
                  <div className="text-sm text-gray-400">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {passingScore}%
                  </div>
                  <div className="text-sm text-gray-400">Passing Score</div>
                </div>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a] max-w-lg mx-auto">
                <h3 className="text-gray-200 font-medium mb-2">
                  Instructions:
                </h3>
                <ul className="text-gray-400 text-sm text-left space-y-2">
                  <li>
                    • You have {formatTime(initialTimeInSeconds)} to complete the quiz
                  </li>
                  <li>• You need {passingScore}% to pass the quiz</li>
                  <li>• You cannot pause the timer once started</li>
                  <li>• Make sure you have a stable internet connection</li>
                </ul>
              </div>
            </div>
            <Button
              type="primary"
              onClick={handleStartQuiz}
              className="bg-blue-500 border-none hover:bg-blue-600 h-12 px-8 text-lg"
            >
              Start Quiz
            </Button>
          </div>
        ) : (
          <div data-aos="fade-left" data-aos-duration="800">
            {/* Header Section */}
            <div
              data-aos="fade-down"
              data-aos-delay="200"
              className="bg-[#1c2936] rounded-xl p-6 mb-6 shadow-lg border border-[#29334a]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-200">
                    {lesson.title}
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">Final Assessment</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-[#0d1117] px-4 py-2 rounded-lg border border-[#29334a]">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${getTimeColor()}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-400">Time Left</div>
                        <div
                          className={`font-semibold ${getTimeColor()} ${remainingTime <= 60 ? "animate-pulse" : ""
                            }`}
                        >
                          {formatTime(remainingTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0d1117] px-4 py-2 rounded-lg border border-[#29334a]">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <div className="flex flex-col">
                        <div className="text-xs text-gray-400">Question</div>
                        <div className="text-blue-400 font-semibold">
                          {currentQuestionIndex + 1}/{questions.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Progress
                percent={progressPercentage}
                showInfo={false}
                strokeColor={{
                  "0%": "#3b82f6",
                  "100%": "#00FF00",
                }}
                trailColor="#1e293b"
                className="mb-2"
              />
            </div>

            {/* Question Section */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="bg-[#1c2936] rounded-xl p-6 shadow-lg border border-[#29334a]"
            >
              {questions[currentQuestionIndex] && (
                <div className="space-y-6">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#0d1117] text-blue-400 text-sm font-medium px-3 py-1 rounded-full border border-[#29334a]">
                        Question {currentQuestionIndex + 1}
                      </div>
                      <div className="h-[1px] flex-grow bg-[#29334a]"></div>
                    </div>
                    <h2 className="text-xl text-gray-200 font-medium">
                      {questions[currentQuestionIndex].content}
                    </h2>
                    <div className="space-y-3 mt-8">
                      {questions[currentQuestionIndex].answers.map(
                        (answer, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              handleAnswerSelect(currentQuestionIndex, index)
                            }
                            className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border ${selectedAnswers[currentQuestionIndex] === index
                              ? "bg-[#0d1117] border-blue-500"
                              : "bg-[#0d1117] border-[#29334a] hover:border-blue-500/30"
                              } ${isQuizSubmitted
                                ? answer.isCorrect
                                  ? "bg-green-500/10 border-green-500"
                                  : selectedAnswers[currentQuestionIndex] ===
                                    index
                                    ? "bg-red-500/10 border-red-500/50"
                                    : ""
                                : ""
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${selectedAnswers[currentQuestionIndex] ===
                                  index
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500"
                                  : "bg-[#1c2936] text-gray-400 border border-[#29334a] group-hover:border-blue-500/30"
                                  }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span className="text-gray-300 group-hover:text-gray-200 transition-colors">
                                {answer.content}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Section */}
            <div
              data-aos="fade-up"
              data-aos-delay="600"
              className="bg-[#1c2936] rounded-xl mt-6 p-6 shadow-lg border border-[#29334a]"
            >
              <div className="flex items-center justify-between">
                <Button
                  type="default"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="bg-[#0d1117] text-gray-300 border-[#29334a] hover:text-white hover:border-blue-500/30"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${currentQuestionIndex === index
                        ? "bg-blue-500 w-4"
                        : selectedAnswers[index] !== undefined
                          ? "bg-green-500"
                          : "bg-[#29334a]"
                        }`}
                    />
                  ))}
                </div>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={
                      isQuizSubmitted ||
                      Object.keys(selectedAnswers).length < questions.length
                    }
                    className="bg-blue-500 border-none hover:bg-blue-600"
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    type="default"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="bg-[#0d1117] text-gray-300 border-[#29334a] hover:text-white hover:border-blue-500/30"
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>

            {/* Results Section */}
            {isQuizSubmitted && (
              <div
                data-aos="zoom-in"
                data-aos-duration="1000"
                className="mt-6 bg-[#1c2936] rounded-xl p-6 shadow-lg border border-[#29334a]"
              >
                <h2 className="text-xl font-bold text-gray-200 mb-6">
                  Quiz Results
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a]">
                    <div className="text-sm text-gray-400 mb-1">
                      Total Questions
                    </div>
                    <div className="text-2xl font-bold text-gray-200">
                      {questions.length}
                    </div>
                  </div>
                  <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a]">
                    <div className="text-sm text-gray-400 mb-1">
                      Correct Answers
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {
                        Object.entries(selectedAnswers).filter(
                          ([qIndex, aIndex]) =>
                            questions[Number(qIndex)].answers[aIndex].isCorrect
                        ).length
                      }
                    </div>
                  </div>
                  <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a]">
                    <div className="text-sm text-gray-400 mb-1">Score</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.round(
                        (Object.entries(selectedAnswers).filter(
                          ([qIndex, aIndex]) =>
                            questions[Number(qIndex)].answers[aIndex].isCorrect
                        ).length /
                          questions.length) *
                        100
                      )}
                      %
                    </div>
                  </div>
                </div>

                {/* Add Result Message and Retry Button */}
                <div className="mt-6 text-center">
                  {Math.round(
                    (Object.entries(selectedAnswers).filter(
                      ([qIndex, aIndex]) =>
                        questions[Number(qIndex)].answers[aIndex].isCorrect
                    ).length /
                      questions.length) *
                    100
                  ) >= passingScore ? (
                    <div className="text-green-400 text-xl font-bold mb-4">
                      🎉 Congratulations! You passed the quiz! 🎉
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-red-400 text-xl font-bold">
                        Sorry, you didn't reach the passing score of{" "}
                        {passingScore}%.
                      </div>
                      <Button
                        type="primary"
                        onClick={handleRetry}
                        className="bg-blue-500 border-none hover:bg-blue-600"
                      >
                        Retry Test
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Drawer
        title={<span className="text-gray-200">Course Feedback</span>}
        placement="right"
        onClose={() => { }}
        open={showFeedback}
        width={400}
        maskClosable={false}
        keyboard={false}
        closable={false}
        styles={{
          header: {
            background: "#1c2936",
            borderBottom: "1px solid #29334a",
            padding: "16px 24px",
          },
          body: {
            background: "#17212c",
            padding: "24px",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
          wrapper: {
            backgroundColor: "#17212c",
          },
          content: {
            backgroundColor: "#17212c",
          },
        }}
      >
        <div className="space-y-6">
          <div>
            <p className="text-gray-400 mb-2">
              How would you rate this course?{" "}
              <span className="text-red-500">*</span>
            </p>
            <Rate
              value={feedbackRating}
              onChange={setFeedbackRating}
              style={{
                fontSize: "24px",
                color: "#3b82f6", // Màu của sao khi được chọn
              }}
              className="[&_.ant-rate-star-second]:text-gray-600" // Màu của sao chưa chọn
            />
            {feedbackRating === 0 && (
              <p className="text-red-500 text-sm mt-1">Rating is required</p>
            )}
          </div>
          <div>
            <p className="text-gray-400 mb-2">Additional comments</p>
            <Input.TextArea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Share your thoughts about the course..."
              rows={4}
              style={{
                backgroundColor: "#0d1117",
                borderColor: "#29334a",
                color: "#e5e7eb",
              }}
              className="placeholder:text-gray-500 hover:border-blue-500/50 focus:border-blue-500 transition-colors resize-none"
            />
          </div>
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              Please provide your feedback to complete the course. Your feedback
              helps us improve the course quality.
            </p>
          </div>
          <Button
            type="primary"
            onClick={handleSubmitFeedback}
            loading={isSubmittingFeedback}
            className="w-full bg-blue-500 border-none hover:bg-blue-600 transition-colors"
            disabled={feedbackRating === 0 || feedbackComment.trim() === ""}
          >
            Submit Feedback
          </Button>
        </div>
      </Drawer>

      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseId={courseId}
        learnerId={currentUser?.id || ''}
      />
    </>
  );
};

export default FinalQuizContent;
