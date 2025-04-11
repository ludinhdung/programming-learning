import React from "react";
import { Lesson } from "../CourseStudyBoard";

interface CodingContentProps {
  lesson: Lesson; 
}

const CodingContent: React.FC<CodingContentProps> = ({ lesson }) => {
  return (
    <div className="h-screen w-full flex items-center justify-center text-white">
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>
    </div>
  );
};

export default CodingContent;
