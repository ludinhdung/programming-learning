import { Router } from "express";
import { NoteController } from "./note.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();
const noteController = new NoteController();

router.post('/lessons/:lessonId/notes',
    authenticate, 
    noteController.createNote.bind(noteController)
);

router.get('/lessons/:lessonId/notes',
    authenticate, 
    noteController.getNotesByLesson.bind(noteController)
);

router.get('/notes/:noteId',
    authenticate, 
    noteController.getNoteById.bind(noteController)
);

router.patch('/notes/:noteId',
    authenticate, 
    noteController.updateNote.bind(noteController)
);

router.delete('/notes/:noteId',
    authenticate, 
    noteController.deleteNote.bind(noteController)
);

router.get('/courses/:courseId/notes',
    authenticate, noteController.getNoteByCourse.bind(noteController)
);

router.get('/my-noted-courses',
    authenticate,
    noteController.getMyNotedCourses.bind(noteController)
);


export default router;
