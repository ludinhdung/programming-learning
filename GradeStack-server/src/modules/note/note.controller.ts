import { Request, Response, NextFunction } from 'express';
import { NoteService } from './note.service';
// No need to import AuthenticatedRequest, use standard Request

export class NoteController {
    private noteService: NoteService;

    constructor() {
        this.noteService = new NoteService();
    }

    /**
     * Handles request to create a new note.
     */
    async createNote(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id; // Get user ID from authenticated request (added by middleware)
            const { lessonId } = req.params; // Or from body, depending on route design
            const { content, timestamp } = req.body;

            const note = await this.noteService.createNote(userId!, lessonId, { content, timestamp }); // Use non-null assertion userId! as authenticate middleware ensures it exists
            res.status(201).json({
                success: true,
                data: note
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to get all notes for a specific lesson by the authenticated user.
     */
    async getNotesByLesson(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { lessonId } = req.params;

            if (!lessonId) {
                // Send response but don't return it
                res.status(400).json({ success: false, message: 'Missing required field: lessonId' });
                return; // Exit the function after sending the error response
            }

            const notes = await this.noteService.getNotesByLesson(userId!, lessonId); // Use non-null assertion
            res.json({
                success: true,
                data: notes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to get a specific note by ID.
     */
    async getNoteById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            // Removed duplicate: const userId = req.user?.id;
            const { noteId } = req.params;

            // Middleware handles !userId
            // Service layer handles !noteId
            // if (!noteId) {
            //     return res.status(400).json({ success: false, message: 'Missing required field: noteId' });
            // }

            const note = await this.noteService.getNoteById(noteId, userId!); // Use non-null assertion
            res.json({
                success: true,
                data: note
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to update a note.
     */
    async updateNote(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { noteId } = req.params;
            // Removed duplicate: const userId = req.user?.id;
            // Removed duplicate: const { noteId } = req.params;
            const { content, timestamp } = req.body;

            // Middleware handles !userId
            // Service layer handles !noteId and missing body data
            // if (!noteId) {
            //    return res.status(400).json({ success: false, message: 'Missing required field: noteId' });
            // }
            // if (content === undefined && timestamp === undefined) {
            //     return res.status(400).json({ success: false, message: 'No update data provided (content or timestamp)' });
            // }

            const updatedNote = await this.noteService.updateNote(noteId, userId!, { content, timestamp }); // Use non-null assertion
            res.json({
                success: true,
                data: updatedNote
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to delete a note.
     */
    async deleteNote(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            // Removed duplicate: const userId = req.user?.id;
            const { noteId } = req.params;

            // Middleware handles !userId
            // Service layer handles !noteId
            // if (!noteId) {
            //    return res.status(400).json({ success: false, message: 'Missing required field: noteId' });
            // }

            await this.noteService.deleteNote(noteId, userId!); // Use non-null assertion
            res.status(200).json({
                success: true,
                message: 'Note deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to get all notes for a specific course by the authenticated user.
     */
    async getNoteByCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id; // Get user ID from authenticated request (added by middleware)
            const { courseId } = req.params; // Or from body, depending on route design

            if (!courseId) {
                res.status(400).json({ success: false, message: 'Missing required field: courseId' });
                return; // Exit the function after sending the error response
            }

            const notes = await this.noteService.getNotesByCourse(userId!, courseId); // Use non-null assertion userId!
            res.json({
                success: true,
                data: notes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles request to get all courses the authenticated user has noted.
     */
    async getMyNotedCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            const courses = await this.noteService.findNotedCoursesByUserId(userId!);

            res.json({
                success: true,
                data: courses
            });
        } catch (error) {
            next(error);
        }
    }
}
