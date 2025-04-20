import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { useVideoStore } from '../../../store/videoStore';
import { useEffect, useRef, useState } from 'react';
import { noteService } from '../../../services/note.service';

interface VideoContentProps {
  video: string;
  lectureTitle?: string;
  lessonId: string;
}

interface Note {
  id: string;
  content: string;
  timestamp: number;
}

const VideoContent: React.FC<VideoContentProps> = ({
  video,
  lectureTitle,
  lessonId,
}) => {
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number>(100);
  const [currentTime, setCurrentTimeState] = useState<number>(0);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [isLayoutVisible, setIsLayoutVisible] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await noteService.getNotesByLesson(lessonId);
        setNotes(notesData);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, [lessonId]);

  useEffect(() => {
    const videoElement = document.querySelector('video');
    if (!videoElement) return;

    videoRef.current = videoElement;

    const updateTime = () => {
      const time = videoElement.currentTime;
      setCurrentTime(time);
      setCurrentTimeState(time);
    };

    const updateDuration = () => {
      setDuration(videoElement.duration || 100);
    };

    const handleMouseMove = () => {
      setIsLayoutVisible(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };

    const handleMouseLeave = () => {
      if (!isPaused) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsLayoutVisible(false);
          setHoveredMarker(null);
        }, 2000);
      }
    };

    const handlePlay = () => {
      setIsPaused(false);
      if (!videoElement.matches(':hover')) {
        hideTimeoutRef.current = setTimeout(() => {
          setIsLayoutVisible(false);
          setHoveredMarker(null);
        }, 2000);
      }
    };

    const handlePause = () => {
      setIsPaused(true);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      setIsLayoutVisible(true);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('mousemove', handleMouseMove);
    videoElement.addEventListener('mouseleave', handleMouseLeave);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('mousemove', handleMouseMove);
      videoElement.removeEventListener('mouseleave', handleMouseLeave);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [setCurrentTime]);

  const handleMarkerClick = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full aspect-video relative">
      <MediaPlayer
        title={lectureTitle}
        src={video}
        aspectRatio="16/9"
        className="w-full h-full"
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt"
        />
      </MediaPlayer>

      {/* Custom Marker Bar */}
      <div
        className={`absolute bottom-[68px] left-[20px] right-[20px] bg-gray-600 z-10 transition-opacity duration-300 ${isLayoutVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute h-full bg-white/50"
          style={{
            width: `${(currentTime / duration) * 100}%`,
          }}
        />

        {/* Markers */}
        {notes.map((note) => {
          const leftPercent = (note.timestamp / duration) * 100;

          return (
            <div
              key={note.id}
              className="absolute w-2 h-2 bg-yellow-500 rounded-none -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{
                left: `${leftPercent}%`,
              }}
              onClick={() => handleMarkerClick(note.timestamp)}
              onMouseEnter={() => isLayoutVisible && setHoveredMarker(note.timestamp)}
              onMouseLeave={() => setHoveredMarker(null)}
            >
              {hoveredMarker === note.timestamp && isLayoutVisible && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white p-2 rounded text-sm whitespace-nowrap z-30">
                  <div className="font-bold">{formatTime(note.timestamp)}</div>
                  <div>{note.content}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoContent;