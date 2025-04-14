import React, { useState } from "react";
import { Lesson } from "../CourseStudyBoard";
import { Button, Progress } from "antd";

interface FinalQuizContentProps {
  lesson: Lesson;
}

const FinalQuizContent: React.FC<FinalQuizContentProps> = ({ lesson }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    lesson.content.finalTest?.estimatedDuration || 30
  );

  const questions = lesson.content.finalTest?.questions || [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  //lấy ra dc câu trả lời đã chọn tại cái question
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-[#1c2936] rounded-xl p-6 mb-6 shadow-lg border border-[#29334a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-200">{lesson.title}</h1>
            <p className="text-gray-400 text-sm mt-1">Final Assessment</p>
          </div>
          <div className="flex flex-wrap gap-3">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex flex-col">
                  <div className="text-xs text-gray-400">Time Left</div>
                  <div className="text-blue-400 font-semibold">{timeLeft}m</div>
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
          percent={progress}
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
      <div className="bg-[#1c2936] rounded-xl p-6 shadow-lg border border-[#29334a]">
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
                      className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? "bg-[#0d1117] border-blue-500"
                          : "bg-[#0d1117] border-[#29334a] hover:border-blue-500/30"
                      } ${
                        isSubmitted
                          ? answer.isCorrect
                            ? "bg-green-500/10 border-green-500"
                            : selectedAnswers[currentQuestionIndex] === index
                            ? "bg-red-500/10 border-red-500/50"
                            : ""
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            selectedAnswers[currentQuestionIndex] === index
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
      <div className="bg-[#1c2936] rounded-xl mt-6 p-6 shadow-lg border border-[#29334a]">
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
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                  currentQuestionIndex === index
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
              disabled={isSubmitted}
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
      {isSubmitted && (
        <div className="mt-6 bg-[#1c2936] rounded-xl p-6 shadow-lg border border-[#29334a]">
          <h2 className="text-xl font-bold text-gray-200 mb-6">Quiz Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a]">
              <div className="text-sm text-gray-400 mb-1">Total Questions</div>
              <div className="text-2xl font-bold text-gray-200">
                {questions.length}
              </div>
            </div>
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#29334a]">
              <div className="text-sm text-gray-400 mb-1">Correct Answers</div>
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
        </div>
      )}
    </div>
  );
};

export default FinalQuizContent;
