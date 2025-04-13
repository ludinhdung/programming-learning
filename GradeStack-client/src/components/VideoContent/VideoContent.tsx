import React, { useEffect, RefObject } from 'react'; // Removed useState, useRef, useCallback. Added RefObject
import { Player, PlayerReference, PlayerState } from 'video-react'; // Added PlayerState type
import 'video-react/dist/video-react.css';
import styled from 'styled-components';
// Removed NoteComponent import
import type { Note } from '../NoteComponent/NoteComponent'; // Keep Note type import for props

const VideoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  .video-react {
    font-family: inherit;
    
    .video-react-progress-control {
      position: relative;
    }

    .video-react-progress-holder {
      height: 8px;
      transition: height 0.2s;

      &:hover {
        height: 12px;
      }
    }

    .video-react-play-progress {
      background: #3b82f6;
    }

    .note-marker {
      position: absolute;
      width: 4px;
      height: 100%;
      background: #ffd60a;
      transform: translateX(-50%);
      z-index: 2;
      cursor: pointer;

      &:hover .note-tooltip {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .note-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateY(10px) translateX(-50%);
      background: #1c2936;
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      transition: all 0.2s;
      margin-bottom: 8px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;

      &:after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 6px solid transparent;
        border-top-color: #1c2936;
      }
    }
  }
`;

// Removed styled components that were moved or are no longer needed

// Define props passed down from CourseStudyBoard
interface VideoContentProps {
  video?: string;
  playerRef: RefObject<PlayerReference | null>; // Accept the ref from parent
  notes: Note[]; // Accept notes from parent
  playerState: PlayerState | undefined; // Accept playerState from parent
  formatTime: (seconds: number) => string; // Accept formatTime from parent
  handleJumpToTimestamp: (timestamp: number) => void; // Accept jump function from parent
  onPlayerStateChange: (state: PlayerState) => void; // Accept state change handler from parent
}

const VideoContent: React.FC<VideoContentProps> = ({
  video,
  playerRef, // Use the passed ref
  notes,
  playerState,
  formatTime,
  handleJumpToTimestamp,
  onPlayerStateChange,
}) => {
  // Removed internal state management (currentTime, playerState, notes)
  // Removed internal callbacks (formatTime, handleJumpToTimestamp, handleNotesChange, handlePauseVideo)

  // Subscribe to player state changes using the passed callback
  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      // Subscribe using the passed handler
      player.subscribeToStateChange(onPlayerStateChange);

      // Optional: Unsubscribe on cleanup, though video-react might handle this
      // return () => {
      //   player.unsubscribeFromStateChange(onPlayerStateChange);
      // };
    }
  }, [playerRef, onPlayerStateChange]); // Depend on the ref and the callback function

  // --- Marker Rendering Logic ---
  // Uses props passed down: notes, playerState, formatTime, handleJumpToTimestamp
  useEffect(() => {
    const progressBar = document.querySelector('.video-react-progress-holder');
    // Check if playerState and its duration are valid
    if (!progressBar || !playerState || !playerState.duration || playerState.duration <= 0) return;

    // Clear existing markers
    const existingMarkers = progressBar.querySelectorAll('.note-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Get or create markers container
    let markersContainer = progressBar.querySelector('.markers-container');
    if (!markersContainer) {
      markersContainer = document.createElement('div');
      markersContainer.className = 'markers-container';
      // Apply necessary styles for positioning - Check if HTMLElement first
      if (markersContainer instanceof HTMLElement) {
        Object.assign(markersContainer.style, {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: '1' // Ensure it's above the progress bar but below controls if needed
        });
      }
      progressBar.appendChild(markersContainer);
    } else if (!(markersContainer instanceof HTMLElement)) {
      // If it exists but is not an HTMLElement, we can't proceed with styling
      console.error("Markers container found but is not an HTMLElement.");
      return;
    }

    // Add new markers based on the current 'notes' state
    notes.forEach(note => {
      // Calculate percentage first
      const percentage = (note.timestamp / playerState.duration) * 100;

      // Only proceed if the percentage is valid
      if (percentage >= 0 && percentage <= 100) {
        // Create marker element
        const marker = document.createElement('div');
        marker.className = 'note-marker'; // Use the class defined in VideoContainer styled component

        // Style the marker (already guaranteed to be HTMLElement)
        marker.style.left = `${percentage}%`;
        marker.style.pointerEvents = 'auto'; // Allow clicks on the marker

        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'note-tooltip'; // Use the class defined in VideoContainer
        tooltip.textContent = `${formatTime(note.timestamp)}: ${note.text}`;
        marker.appendChild(tooltip);

        // Add click listener to jump to timestamp
        marker.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling if necessary
            handleJumpToTimestamp(note.timestamp);
        });

        markersContainer.appendChild(marker);
      }
    });

    // Cleanup function remains the same
    return () => {
        const currentMarkersContainer = progressBar.querySelector('.markers-container');
        if (currentMarkersContainer) {
            currentMarkersContainer.innerHTML = ''; // Clear markers more efficiently
        }
    };
    // Dependencies updated to use props
  }, [notes, playerState, handleJumpToTimestamp, formatTime]);


  return (
    <VideoContainer>
      <Player
        ref={playerRef} // Use the passed ref
        fluid={true}
        playsInline
      >
        <source src={video} />
      </Player>
      {/* NoteComponent is no longer rendered here */}
    </VideoContainer>
  );
};

export default VideoContent;
