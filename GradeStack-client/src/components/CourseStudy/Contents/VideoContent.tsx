import React from "react";

import { Lesson } from "../CourseStudyBoard";
import "../../../../node_modules/video.js/dist/video-js.css"
interface VideoContentProps {
  lesson: Lesson;
  lessonIndex: number;
}

const VideoContent: React.FC<VideoContentProps> = ({ lesson }) => {
  const videoUrl = lesson.content.video?.url;

  return (
    <div className="bg-slate-600 rounded-md h-[700px]">
      {videoUrl ? (
        <iframe
          className="h-full w-full rounded-md"
          src={videoUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          Không có video để hiển thị.
        </div>
      )}

    </div>
  );
};

export default VideoContent;
