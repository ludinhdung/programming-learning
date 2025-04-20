import { useVideoStore } from '../../store/videoStore';
import { useState, useEffect } from 'react';
import { noteService } from '../../services/note.service';
import { message } from 'antd';

interface Note {
    id: string;
    content: string;
    timestamp: number;
}

interface NoteComponentProps {
    lessonId: string;
}

const NoteComponent: React.FC<NoteComponentProps> = ({ lessonId }) => {
    const currentTime = useVideoStore((state) => state.currentTime);
    const [noteText, setNoteText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const notesData = await noteService.getNotesByLesson(lessonId);
                setNotes(notesData);
            } catch (error) {
                console.error('Error fetching notes:', error);
                message.error('Failed to load notes. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, [lessonId]);

    const handleSave = async () => {
        if (!noteText.trim()) {
            message.warning('Please enter note content');
            return;
        }

        setIsSaving(true);
        try {
            const newNote = await noteService.createNote(lessonId, {
                content: noteText,
                timestamp: currentTime
            });
            setNotes([...notes, newNote]);
            setIsEditing(false);
            setNoteText('');
            message.success('Note saved successfully');
        } catch (error) {
            console.error('Error creating note:', error);
            message.error('Failed to save note. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setNoteText('');
    };

    const handleDeleteNote = async (id: string) => {
        try {
            await noteService.deleteNote(id);
            setNotes(notes.filter(note => note.id !== id));
            message.success('Note deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            message.error('Failed to delete note. Please try again.');
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 bg-[#0e1721] rounded-md border border-blue-400/15 py-6 text-white p-4">
            <div className="mb-4">
                <span className="text-gray-400">Current Time: </span>
                <span className="text-white">{formatTime(currentTime)}</span>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Type your note here..."
                        className="w-full h-32 p-2 bg-[#1c2432] border border-blue-400/30 rounded-md text-white focus:outline-none focus:border-blue-500"
                        disabled={isSaving}
                    />
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className={`bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex-1 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
                >
                    Add Note
                </button>
            )}

            {/* Notes List */}
            <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-300">Your Notes</h3>
                {isLoading ? (
                    <p className="text-gray-400 text-sm">Loading notes...</p>
                ) : notes.length === 0 ? (
                    <p className="text-gray-400 text-sm">No notes yet. Add your first note!</p>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="bg-[#1c2432] p-3 rounded-md border border-blue-400/20 hover:border-blue-400/40 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-400 mb-1">
                                            {formatTime(note.timestamp)}
                                        </div>
                                        <div className="text-white">
                                            {note.content}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="text-gray-400 hover:text-red-500 ml-2 transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteComponent;
