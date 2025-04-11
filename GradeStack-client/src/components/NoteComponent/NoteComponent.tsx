import React, { useState, useEffect } from 'react';
import { Input, Select, Button, Tooltip } from 'antd';
import styled from 'styled-components';
import { EditOutlined, DeleteOutlined, PlusOutlined, BoldOutlined, ItalicOutlined, OrderedListOutlined, UnorderedListOutlined, CodeOutlined } from '@ant-design/icons';

const { Option } = Select;

// --- Styled Components (Moved from VideoContent.tsx) ---

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

    &:hover, &:focus {
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

// --- Interfaces (Moved/Defined) ---
export interface Note { // Added export
  id: string;
  timestamp: number;
  lectureTitle: string;
  text: string;
}

interface NoteComponentProps {
  currentTime: number;
  lectureTitle: string;
  onJumpToTimestamp: (timestamp: number) => void;
  onPauseVideo: () => void;
  initialNotes?: Note[]; // Optional initial notes
  onNotesChange: (notes: Note[]) => void; // Callback for parent
  formatTime: (seconds: number) => string; // Pass formatTime function
}

// --- Component Logic ---
const NoteComponent: React.FC<NoteComponentProps> = ({
  currentTime,
  lectureTitle,
  onJumpToTimestamp,
  onPauseVideo,
  initialNotes = [],
  onNotesChange,
  formatTime,
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Effect to update parent when notes change
  useEffect(() => {
    onNotesChange(notes);
  }, [notes, onNotesChange]);

  // Effect to sync notes if initialNotes prop changes externally (optional)
  useEffect(() => {
      setNotes(initialNotes);
  }, [initialNotes]);


  const getExistingNoteAtTime = (time: number) => {
    // Check against the component's internal 'notes' state
    return notes.find(note => Math.abs(note.timestamp - time) < 1);
  };

  const handleStartEditing = () => {
    const existingNote = getExistingNoteAtTime(currentTime);
    if (existingNote) {
      setEditingNoteId(existingNote.id);
      setNoteText(existingNote.text);
      // Optionally jump to the note's timestamp when editing
      // onJumpToTimestamp(existingNote.timestamp); 
    } else {
      setEditingNoteId(null);
      setNoteText('');
    }
    onPauseVideo(); // Pause video when starting to edit/add note
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setNoteText('');
    setEditingNoteId(null);
  };

  const handleSaveNote = () => {
    if (noteText.trim()) {
      let updatedNotes;
      if (editingNoteId) {
        updatedNotes = notes.map(note =>
          note.id === editingNoteId
            ? { ...note, text: noteText.trim() }
            : note
        );
      } else {
        const newNote: Note = {
          id: Date.now().toString(),
          timestamp: currentTime,
          lectureTitle,
          text: noteText.trim()
        };
        updatedNotes = [...notes, newNote];
      }
      setNotes(updatedNotes); // Update local state, triggers onNotesChange effect
      setIsEditing(false);
      setNoteText('');
      setEditingNoteId(null);
    }
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes); // Update local state, triggers onNotesChange effect
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteText(note.text);
    setIsEditing(true);
    onPauseVideo();
    onJumpToTimestamp(note.timestamp); // Jump to timestamp when editing
  };

  return (
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
                style={{ color: '#6b7280' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handleSaveNote}
                style={{ background: '#3b82f6', marginRight: '8px' }}
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
          <Tooltip title={getExistingNoteAtTime(currentTime) ? "Edit note" : "Add note"}>
            <div 
              className="action-button"
              onClick={handleStartEditing}
              style={{
                color: getExistingNoteAtTime(currentTime) ? '#ffd60a' : '#3b82f6'
              }}
            >
              {getExistingNoteAtTime(currentTime) ? <EditOutlined /> : <PlusOutlined />}
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
            case 'oldest':
              return parseInt(a.id) - parseInt(b.id);
            case 'timestamp':
              return a.timestamp - b.timestamp;
            default: // 'recent'
              return parseInt(b.id) - parseInt(a.id);
          }
        })
        .filter(note => filter === 'all' || note.lectureTitle === lectureTitle)
        .map(note => (
          <NoteItem key={note.id}>
            <div
              className="timestamp"
              onClick={() => onJumpToTimestamp(note.timestamp)}
            >
              {formatTime(note.timestamp)}
            </div>
            <div className="lecture-info">
              <div className="lecture-title">{note.lectureTitle}</div>
              <div className="note-text">{note.text}</div>
            </div>
            <div className="actions">
              <Tooltip title="Edit Note">
                <EditOutlined
                  className="action-btn"
                  onClick={() => handleEditClick(note)}
                />
              </Tooltip>
              <Tooltip title="Delete Note">
                <DeleteOutlined
                  className="action-btn delete"
                  onClick={() => handleDeleteNote(note.id)}
                />
              </Tooltip>
            </div>
          </NoteItem>
        ))}
    </NotesContainer>
  );
};

export default NoteComponent;
