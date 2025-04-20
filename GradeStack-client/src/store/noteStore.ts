import { create } from 'zustand';

interface Note {
    id: string;
    content: string;
    timestamp: number;
}

interface NoteState {
    notes: Note[];
    setNotes: (notes: Note[]) => void;
    addNote: (note: Note) => void;
    removeNote: (id: string) => void;
    updateNote: (id: string, content: string) => void;
}

const useNoteStore = create<NoteState>((set) => ({
    notes: [],
    setNotes: (notes) => set({ notes }),
    addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
    removeNote: (id) => set((state) => ({ notes: state.notes.filter(note => note.id !== id) })),
    updateNote: (id, content) => set((state) => ({
        notes: state.notes.map(note =>
            note.id === id ? { ...note, content } : note
        )
    })),
}));

export default useNoteStore; 