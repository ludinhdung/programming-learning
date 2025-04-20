import { useVideoStore } from '../../store/videoStore';
import { useState, useEffect } from 'react';
import { noteService } from '../../services/note.service';
import { message } from 'antd';
import useNoteStore from '../../store/noteStore';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NoteComponentProps {
    lessonId: string;
}

interface VideoState {
    currentTime: number;
}

const NoteComponent: React.FC<NoteComponentProps> = ({ lessonId }) => {
    const navigate = useNavigate();
    const currentTime = useVideoStore((state: VideoState) => state.currentTime);
    const { notes, setNotes, addNote, removeNote, updateNote } = useNoteStore();
    const { isAuthenticated, user } = useAuthStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [noteText, setNoteText] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteContent, setEditingNoteContent] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        const fetchNotes = async () => {
            try {
                setIsLoading(true);
                const notesData = await noteService.getNotesByLesson(lessonId);
                setNotes(notesData);
            } catch (error) {
                if (error.response?.status === 401) {
                    message.error('Session expired. Please login again');
                    navigate('/login');
                } else {
                    message.error('Failed to fetch notes');
                }
                console.error('Error fetching notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [lessonId, setNotes, navigate]);

    const handleAuthCheck = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.warning('Please login to continue');
            navigate('/login');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!handleAuthCheck()) return;

        if (!noteText.trim()) {
            message.warning('Please enter a note');
            return;
        }

        try {
            setIsSaving(true);
            const existingNote = notes.find(note => note.timestamp === currentTime);

            if (existingNote) {
                await noteService.updateNote(existingNote.id, {
                    content: noteText,
                });
                updateNote(existingNote.id, noteText);
                setNoteText('');
                setIsEditing(false);
                message.success('Note updated successfully');
            } else {
                const newNote = await noteService.createNote(lessonId, {
                    content: noteText,
                    timestamp: currentTime,
                });
                addNote(newNote);
                setNoteText('');
                setIsEditing(false);
                message.success('Note saved successfully');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again');
                navigate('/login');
            } else {
                message.error('Failed to save note');
            }
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateNote = async () => {
        if (!handleAuthCheck()) return;

        if (!editingNoteId || !editingNoteContent.trim()) {
            message.warning('Please enter a note');
            return;
        }

        try {
            setIsSaving(true);
            await noteService.updateNote(editingNoteId, {
                content: editingNoteContent,
            });
            updateNote(editingNoteId, editingNoteContent);
            setEditingNoteId(null);
            setEditingNoteContent('');
            message.success('Note updated successfully');
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again');
                navigate('/login');
            } else {
                message.error('Failed to update note');
            }
            console.error('Error updating note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!handleAuthCheck()) return;

        try {
            await noteService.deleteNote(noteId);
            removeNote(noteId);
            message.success('Note deleted successfully');
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again');
                navigate('/login');
            } else {
                message.error('Failed to delete note');
            }
            console.error('Error deleting note:', error);
        }
    };

    const handleAddNote = () => {
        if (!handleAuthCheck()) return;

        const existingNote = notes.find(note => note.timestamp === currentTime);

        if (existingNote) {
            setEditingNoteId(existingNote.id);
            setEditingNoteContent(existingNote.content);
        } else {
            setIsEditing(true);
        }
    };

    const handleNoteClick = (note: { id: string; content: string }) => {
        if (!handleAuthCheck()) return;

        setEditingNoteId(note.id);
        setEditingNoteContent(note.content);
    };

    const handleCancel = () => {
        setNoteText('');
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditingNoteId(null);
        setEditingNoteContent('');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-[#0e1721] rounded-md border border-blue-400/15 py-6 text-white">
            <div className="px-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-400">
                            Current Time: {formatTime(currentTime)}
                        </span>
                    </div>
                    {!isEditing && !editingNoteId ? (
                        <button
                            onClick={handleAddNote}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Add Note
                        </button>
                    ) : null}
                </div>

                {isEditing && (
                    <div className="mb-6 space-y-4">
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Enter your note..."
                            className="w-full px-4 py-3 text-sm text-white bg-[#1c2432] border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#1c2432] border border-blue-400/30 rounded-lg hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-300">Your Notes</h3>
                        <span className="px-2 py-1 text-xs font-medium text-gray-400 bg-[#1c2432] rounded-full">
                            {notes.length} notes
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 mb-4 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-400">No notes yet. Add your first note!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notes.map((note: { id: string; content: string; timestamp: number }) => (
                                <div
                                    key={note.id}
                                    className={`group relative p-4 bg-[#1c2432] border border-blue-400/20 rounded-lg hover:border-blue-400/40 transition-colors cursor-pointer ${editingNoteId === note.id ? 'border-blue-400' : ''}`}
                                    onClick={() => handleNoteClick(note)}
                                >
                                    {editingNoteId === note.id ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                                    {formatTime(note.timestamp)}
                                                </span>
                                            </div>
                                            <textarea
                                                value={editingNoteContent}
                                                onChange={(e) => setEditingNoteContent(e.target.value)}
                                                className="w-full px-3 py-2 text-sm text-white bg-[#2a3441] border border-blue-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                rows={3}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelEdit();
                                                    }}
                                                    className="px-3 py-1 text-sm font-medium text-gray-300 bg-[#2a3441] border border-blue-400/30 rounded hover:bg-[#3a4451] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateNote();
                                                    }}
                                                    disabled={isSaving}
                                                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                                                >
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                                        {formatTime(note.timestamp)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteNote(note.id);
                                                }}
                                                className="ml-4 p-1 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteComponent;
