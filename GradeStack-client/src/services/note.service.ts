import api from './api';

export interface Note {
  id: string;
  content: string;
  timestamp: number; // Timestamp in seconds within the video
  userId: string;
  lessonId: string;
  createdAt: string;
  lesson: {
    title: string;
  }
}

// Interface for the actual data structure returned by /notes/my-noted-courses API
export interface NotedCourseInfo {
  id: string; // Course ID
  title: string; // Course Title
  thumbnail?: string;
  // Note: The API response sample doesn't include notes here
  // It might include instructor info if needed, based on sample:
  instructor?: {
    user?: {
      firstName?: string;
      lastName?: string;
    };
    avatar?: string;
  };
}

// Interface for the structure we want to use in the UI (combining course info and notes)
export interface NotedCourseData {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  notes: Note[];
}


export interface CreateNoteData {
  content: string;
  timestamp: number;
}

export interface UpdateNoteData {
  content?: string;
  timestamp?: number;
}

class NoteService {
  /**
   * Creates a new note for a specific lesson.
   * @param lessonId - The ID of the lesson the note belongs to.
   * @param data - The note data (content and timestamp).
   * @returns The created note.
   */
  async createNote(lessonId: string, data: CreateNoteData): Promise<Note> {
    try {
      const response = await api.post(`notes/lessons/${lessonId}/notes`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating note for lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all notes for a specific lesson.
   * @param lessonId - The ID of the lesson.
   * @returns An array of notes.
   */
  async getNotesByLesson(lessonId: string): Promise<Note[]> {
    try {
      const response = await api.get(`notes/lessons/${lessonId}/notes`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching notes for lesson ${lessonId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all notes for a specific course.
   * @param courseId - The ID of the course.
   * @returns An array of notes.
   */
  async getNotesByCourse(courseId: string): Promise<Note[]> {
    try {
      const response = await api.get(`notes/courses/${courseId}/notes`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching notes for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves the list of courses for which the current user has created notes.
   * @returns An array of course information objects.
   */
  async getMyNotedCoursesInfo(): Promise<NotedCourseInfo[]> {
    try {
      const response = await api.get('notes/my-noted-courses');
      // Ensure the response structure matches NotedCourseInfo[] based on the sample
      if (response.data && Array.isArray(response.data.data)) {
        // Validate if the structure matches NotedCourseInfo if necessary
        return response.data.data as NotedCourseInfo[];
      } else {
        console.error('Invalid data structure received from /notes/my-noted-courses:', response.data);
        return []; // Return empty array or throw error
      }
    } catch (error) {
      console.error('Error fetching my noted courses:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  /**
   * Retrieves a specific note by its ID.
   * @param noteId - The ID of the note to retrieve.
   * @returns The requested note.
   */
  async getNoteById(noteId: string): Promise<Note> {
    try {
      const response = await api.get(`notes/notes/${noteId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching note ${noteId}:`, error);
      throw error;
    }
  }

  /**
   * Updates a note's content or timestamp.
   * @param noteId - The ID of the note to update.
   * @param data - The data to update (content or timestamp).
   * @returns The updated note.
   */
  async updateNote(noteId: string, data: UpdateNoteData): Promise<Note> {
    try {
      const response = await api.patch(`notes/notes/${noteId}`, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating note ${noteId}:`, error);
      throw error;
    }
  }

  /**
   * Deletes a note.
   * @param noteId - The ID of the note to delete.
   * @returns A success message.
   */
  async deleteNote(noteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`notes/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting note ${noteId}:`, error);
      throw error;
    }
  }
}

export const noteService = new NoteService();
export default noteService;
