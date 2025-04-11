import React, { useState, useRef, useEffect } from "react";
import { Player, PlayerReference } from "video-react";
import "video-react/dist/video-react.css";
import { Input, Select, Button, Tooltip } from "antd";
import styled from "styled-components";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
} from "@ant-design/icons";

const { Option } = Select;

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
        content: "";
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

const NotesContainer = styled.div`
  margin-top: 20px;
`;

const CreateNoteInput = styled.div`
  position: relative;
  margin-bottom: 20px;

  .ant-input {
    padding: 12px 40px 12px 16px;
    border-radius: 8px;
    background: #1c2936;
    border: 1px solid #29334a;
    font-size: 15px;
    color: #e5e7eb;

    &::placeholder {
      color: #6b7280;
    }

    &:hover,
    &:focus {
      border-color: #3b82f6;
      box-shadow: none;
    }
  }

  .action-button {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #3b82f6;
    cursor: pointer;
    font-size: 18px;
  }
`;

const EditorContainer = styled.div`
  margin-bottom: 20px;
  background: #1c2936;
  border-radius: 8px;
  border: 1px solid #29334a;
  overflow: hidden;
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid #374151;
  background: #29334a;
  justify-content: space-between;

  .toolbar-left {
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }

  .toolbar-btn {
    padding: 6px;
    border-radius: 4px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;

    &:hover {
      background: #1c2936;
      color: #e5e7eb;
    }
  }
`;

const EditorContent = styled.div`
  padding: 16px;
  min-height: 120px;
  background: #1c2936;

  textarea {
    width: 100%;
    min-height: 100px;
    border: none;
    resize: none;
    outline: none;
    font-size: 15px;
    line-height: 1.5;
    color: #e5e7eb;
    background: transparent;

    &::placeholder {
      color: #6b7280;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .ant-select {
    min-width: 150px;

    .ant-select-selector {
      background: #1c2936 !important;
      border-color: #29334a !important;
      color: #e5e7eb !important;
    }

    .ant-select-arrow {
      color: #6b7280;
    }
  }
`;

const NoteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #1c2936;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #29334a;

  .timestamp {
    color: #ffd60a;
    font-weight: 500;
    font-size: 14px;
    min-width: 50px;
    cursor: pointer;
  }

  .lecture-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;

    .lecture-title {
      font-weight: 600;
      color: #e5e7eb;
    }

    .note-text {
      color: #9ca3af;
    }
  }

  .actions {
    display: flex;
    gap: 12px;

    .action-btn {
      color: #6b7280;
      cursor: pointer;
      font-size: 16px;

      &:hover {
        color: #3b82f6;
      }

      &.delete:hover {
        color: #ef4444;
      }
    }
  }
`;

export interface Note {
  id: string;
  timestamp: number;
  lectureTitle: string;
  text: string;
}

interface PlayerState {
  currentTime: number;
  duration: number;
  [key: string]: any;
}

interface VideoContentProps {
  video?: string;
  lectureTitle?: string;
}

const VideoContent: React.FC<VideoContentProps> = ({
  video,
  lectureTitle = "1. Introduction",
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
  });
  const [noteText, setNoteText] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const playerRef = useRef<PlayerReference>(null);
  const markersRef = useRef<{ [key: string]: HTMLDivElement }>({});

  // Added: Use a key state to force remount of the Player component when video changes
  const [playerKey, setPlayerKey] = useState<string>(video || "default-key");

  // Update the player key when video URL changes
  useEffect(() => {
    if (video) {
      setPlayerKey(video);
      // Reset player state when video changes
      setCurrentTime(0);
      setPlayerState({
        currentTime: 0,
        duration: 0,
      });
    }
  }, [video]);

  const getExistingNoteAtTime = (time: number) => {
    return notes.find((note) => Math.abs(note.timestamp - time) < 1);
  };

  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      player.subscribeToStateChange((state: PlayerState) => {
        setCurrentTime(state.currentTime);
        setPlayerState(state);
      });
    }
  }, [playerKey]); // Re-subscribe when player key changes

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartEditing = () => {
    const existingNote = getExistingNoteAtTime(currentTime);
    if (existingNote) {
      setEditingNoteId(existingNote.id);
      setNoteText(existingNote.text);
    } else {
      setEditingNoteId(null);
      setNoteText("");
    }
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setNoteText("");
    setEditingNoteId(null);
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      if (editingNoteId) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === editingNoteId
              ? { ...note, text: noteText.trim() }
              : note
          )
        );
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          timestamp: currentTime,
          lectureTitle,
          text: noteText.trim(),
        };
        setNotes((prev) => [...prev, newNote]);
      }
      setIsEditing(false);
      setNoteText("");
      setEditingNoteId(null);
    }
  };

  const handlePlayVideo = () => {
    if (playerRef.current) {
      playerRef.current.play();
    }
  };

  const handleSaveAndPlay = () => {
    handleSaveNote();
    handlePlayVideo();
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const handleJumpToTimestamp = (timestamp: number) => {
    if (playerRef.current) {
      playerRef.current.seek(timestamp);
    }
  };

  const clearMarkers = () => {
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};
  };

  const renderNoteMarkers = () => {
    const progressBar = document.querySelector(".video-react-progress-holder");
    if (!progressBar || !playerState.duration) return;

    // Remove all existing markers first
    const existingMarkers = progressBar.querySelectorAll(".note-marker");
    existingMarkers.forEach((marker) => marker.remove());

    // Create markers container if it doesn't exist
    let markersContainer = progressBar.querySelector(".markers-container");
    if (!markersContainer) {
      markersContainer = document.createElement("div");
      markersContainer.className = "markers-container";
      markersContainer.style.position = "absolute";
      markersContainer.style.top = "0";
      markersContainer.style.left = "0";
      markersContainer.style.width = "100%";
      markersContainer.style.height = "100%";
      markersContainer.style.pointerEvents = "none";
      progressBar.appendChild(markersContainer);
    }

    // Add new markers
    notes.forEach((note) => {
      const percentage = (note.timestamp / playerState.duration) * 100;

      if (percentage >= 0 && percentage <= 100) {
        const marker = document.createElement("div");
        marker.className = "note-marker";
        marker.style.left = `${percentage}%`;
        marker.style.pointerEvents = "auto";

        const tooltip = document.createElement("div");
        tooltip.className = "note-tooltip";
        tooltip.textContent = `${formatTime(note.timestamp)}: ${note.text}`;

        marker.appendChild(tooltip);
        markersContainer.appendChild(marker);

        marker.addEventListener("click", () =>
          handleJumpToTimestamp(note.timestamp)
        );
      }
    });
  };

  // Clean up markers on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, []);

  // Render markers when notes or duration changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (playerState.duration > 0) {
        renderNoteMarkers();
      }
    }, 100); // Add small delay to ensure progress bar is ready

    return () => {
      clearTimeout(timer);
    };
  }, [notes, playerState.duration]);

  // Re-render markers when progress bar becomes available
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const progressBar = document.querySelector(
            ".video-react-progress-holder"
          );
          if (progressBar && playerState.duration > 0) {
            renderNoteMarkers();
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <VideoContainer>
      <Player
        ref={playerRef}
        fluid={true}
        playsInline
        key={playerKey} // Use the key to force remount
      >
        <source src={video} />
      </Player>

      <NotesContainer>
        {isEditing ? (
          <EditorContainer>
            <EditorToolbar>
              <div className="toolbar-left">
                <Tooltip title="Bold">
                  <BoldOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Italic">
                  <ItalicOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Ordered List">
                  <OrderedListOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Unordered List">
                  <UnorderedListOutlined className="toolbar-btn" />
                </Tooltip>
                <Tooltip title="Code">
                  <CodeOutlined className="toolbar-btn" />
                </Tooltip>
              </div>
              <div className="toolbar-right">
                <Button
                  type="text"
                  onClick={handleCancelEditing}
                  style={{ color: "#6b7280" }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSaveNote}
                  style={{ background: "#3b82f6", marginRight: "8px" }}
                >
                  Save
                </Button>
              </div>
            </EditorToolbar>
            <EditorContent>
              <textarea
                placeholder="Type your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
            </EditorContent>
          </EditorContainer>
        ) : (
          <CreateNoteInput>
            <Input
              placeholder={
                getExistingNoteAtTime(currentTime)
                  ? `Edit note at ${formatTime(currentTime)}`
                  : `Create a new note at ${formatTime(currentTime)}`
              }
              onClick={handleStartEditing}
              readOnly
            />
            <Tooltip
              title={
                getExistingNoteAtTime(currentTime) ? "Edit note" : "Add note"
              }
            >
              <div
                className="action-button"
                onClick={handleStartEditing}
                style={{
                  color: getExistingNoteAtTime(currentTime)
                    ? "#ffd60a"
                    : "#3b82f6",
                }}
              >
                {getExistingNoteAtTime(currentTime) ? (
                  <EditOutlined />
                ) : (
                  <PlusOutlined />
                )}
              </div>
            </Tooltip>
          </CreateNoteInput>
        )}

        <FilterContainer>
          <Select defaultValue="all" onChange={setFilter}>
            <Option value="all">All lectures</Option>
            <Option value="current">Current lecture</Option>
          </Select>
          <Select defaultValue="recent" onChange={setSortBy}>
            <Option value="recent">Sort by most recent</Option>
            <Option value="oldest">Sort by oldest</Option>
            <Option value="timestamp">Sort by timestamp</Option>
          </Select>
        </FilterContainer>

        {notes
          .sort((a, b) => {
            switch (sortBy) {
              case "oldest":
                return parseInt(a.id) - parseInt(b.id);
              case "timestamp":
                return a.timestamp - b.timestamp;
              default:
                return parseInt(b.id) - parseInt(a.id);
            }
          })
          .filter(
            (note) => filter === "all" || note.lectureTitle === lectureTitle
          )
          .map((note) => (
            <NoteItem key={note.id}>
              <div
                className="timestamp"
                onClick={() => handleJumpToTimestamp(note.timestamp)}
              >
                {formatTime(note.timestamp)}
              </div>
              <div className="lecture-info">
                <div className="lecture-title">{note.lectureTitle}</div>
                <div className="note-text">{note.text}</div>
              </div>
              <div className="actions">
                <EditOutlined
                  className="action-btn"
                  onClick={() => {
                    setEditingNoteId(note.id);
                    setNoteText(note.text);
                    setIsEditing(true);
                    if (playerRef.current) {
                      playerRef.current.pause();
                      playerRef.current.seek(note.timestamp);
                    }
                  }}
                />
                <DeleteOutlined
                  className="action-btn delete"
                  onClick={() => handleDeleteNote(note.id)}
                />
              </div>
            </NoteItem>
          ))}
      </NotesContainer>
    </VideoContainer>
  );
};

export default VideoContent;
