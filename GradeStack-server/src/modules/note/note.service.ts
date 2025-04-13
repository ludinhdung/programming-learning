import { PrismaClient } from '@prisma/client';
import { AppError } from '../../shared/middleware/error.middleware';
import { title } from 'process';

const prisma = new PrismaClient();

export class NoteService {
  /**
   * Creates a new note for a specific user and lesson.
   * @param userId - The ID of the user creating the note.
   * @param lessonId - The ID of the lesson the note belongs to.
   * @param data - The note data (content and timestamp).
   * @returns The created note.
   */
  async createNote(userId: string, lessonId: string, data: { content: string; timestamp: number }) {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    if (lesson.duration && data.timestamp > lesson.duration) {
      throw new AppError('Timestamp exceeds lesson duration', 400);
    }

    const note = await prisma.note.create({
      data: {
        ...data,
        userId,
        lessonId,
      },
    });
    return note;
  }

  /**
   * Retrieves all notes for a specific lesson belonging to a user.
   * @param userId - The ID of the user whose notes are being retrieved.
   * @param lessonId - The ID of the lesson.
   * @returns An array of notes.
   */
  async getNotesByLesson(userId: string, lessonId: string) {
    // Optional: Check if lesson exists
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Optional: Check if user is enrolled

    const notes = await prisma.note.findMany({
      where: {
        userId,
        lessonId,
      },
      orderBy: {
        timestamp: 'asc', // Or createdAt, depending on desired order
      },
    });
    return notes;
  }

  /**
   * Retrieves a specific note by its ID, ensuring it belongs to the user.
   * @param noteId - The ID of the note to retrieve.
   * @param userId - The ID of the user requesting the note.
   * @returns The requested note.
   */
  async getNoteById(noteId: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (note.userId !== userId) {
      // Prevent users from accessing notes they don't own
      throw new AppError('Forbidden: You do not own this note', 403);
    }

    return note;
  }

  /**
   * Updates a note's content or timestamp, verifying ownership.
   * @param noteId - The ID of the note to update.
   * @param userId - The ID of the user attempting the update.
   * @param data - The data to update (content or timestamp).
   * @returns The updated note.
   */
  async updateNote(noteId: string, userId: string, data: { content?: string; timestamp?: number }) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (note.userId !== userId) {
      throw new AppError('Forbidden: You cannot update this note', 403);
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data,
    });

    return updatedNote;
  }

  /**
   * Deletes a note, verifying ownership.
   * @param noteId - The ID of the note to delete.
   * @param userId - The ID of the user attempting the deletion.
   */
  async deleteNote(noteId: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError('Note not found', 404);
    }

    if (note.userId !== userId) {
      throw new AppError('Forbidden: You cannot delete this note', 403);
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    // No return value needed for successful deletion, or return { success: true }
  }

  /**
   * Retrieves all notes created by a specific user for a given course.
   * @param userId - The ID of the user.
   * @param courseId - The ID of the course.
   * @returns An array of notes belonging to the user for that course.
   */
  async getNotesByCourse(userId: string, courseId: string) {
    // Optional: Check if the course exists first
    const courseExists = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true } // Select minimal field
    });
    if (!courseExists) {
      throw new AppError('Course not found', 404);
    }

    // Optional: Check if the user is enrolled (depending on requirements)
    // const enrollment = await prisma.enrolledCourse.findUnique({
    //   where: {
    //     learnerId_courseId: {
    //       learnerId: userId,
    //       courseId: courseId,
    //     },
    //   },
    // });
    // if (!enrollment) {
    //   throw new AppError('User is not enrolled in this course', 403);
    // }

    // Find all lessons belonging to the course
    const lessonsInCourse = await prisma.lesson.findMany({
      where: {
        module: {
          courseId: courseId,
        },
      },
      select: { id: true }, // Only need lesson IDs
    });

    if (lessonsInCourse.length === 0) {
      return []; // No lessons in the course, so no notes
    }

    const lessonIds = lessonsInCourse.map(lesson => lesson.id);

    // Find all notes for these lessons belonging to the specific user
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        lessonId: {
          in: lessonIds,
        },
      },
      select: {
        id: true,
        content: true,
        timestamp: true,
        createdAt: true,
        lessonId: true, // Include lessonId if needed
        lesson: { select: { title: true } } // Example, if you want to include lesson details
      }
      // Include related data if needed by the Note interface on the client
      // include: { lesson: { select: { title: true } } } // Example
    });

    // Return the flat array of notes. If none found, this will be []
    return notes;
  }
  /* Previous implementation:
    async getNotesByCourse(userId: string, courseId: string) {
      // Check if the user is enrolled in the course
      const enrollment = await prisma.enrolledCourse.findUnique({
        where: {
          learnerId_courseId: {
            learnerId: userId,
            courseId: courseId,
          },
    }
  */

  /**
   * Retrieves all courses for which a specific user has created at least one note.
   * @param userId - The ID of the user.
   * @returns An array of courses with basic details.
   */
  async findNotedCoursesByUserId(userId: string) {
    const notedLessons = await prisma.note.findMany({
      where: { userId },
      distinct: ['lessonId'],
      select: { lessonId: true },
    });

    if (notedLessons.length === 0) {
      return [];
    }

    const lessonIds = notedLessons.map(note => note.lessonId);

    const modules = await prisma.lesson.findMany({
      where: {
        id: { in: lessonIds }
      },
      distinct: ['moduleId'],
      select: { moduleId: true }
    });

    const moduleIds = modules.map(lesson => lesson.moduleId);


    const courses = await prisma.module.findMany({
      where: {
        id: { in: moduleIds }
      },
      distinct: ['courseId'],
      select: { courseId: true }
    });

    const courseIds = courses.map(module => module.courseId);


    // 4. Fetch the details of these unique courses
    const notedCourses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        instructor: { // Include instructor details
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            },
            avatar: true,
          }
        },
        // Optionally include note count per course if needed (more complex query)
        // _count: { select: { notes: { where: { userId } } } } // Example, needs relation adjustment
      },
      orderBy: {
        createdAt: 'desc', // Or title: 'asc'
      },
    });

    return notedCourses;
  }

}
