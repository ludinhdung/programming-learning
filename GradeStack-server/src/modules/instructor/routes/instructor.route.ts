import { Router, Request, Response, NextFunction } from 'express';
import { InstructorController } from '../controllers/instructor.controller';
import { Role } from '@prisma/client';
import { uploadVideo } from '../../../shared/middlewares/upload.middleware';

const router = Router();
const instructorController = new InstructorController();


/**
 * Instructor routes
 */

// Admin-only route to create instructors
// router.post(
//     '/',
//     authenticate,
//     authorize([Role.ADMIN]),
//     instructorController.createInstructor
// );
  router.post(
    '/',  
    instructorController.createInstructor
  );

// Get all instructors
  router.get('/', instructorController.getAllInstructors);

// Get instructor by ID
  router.get('/:id', instructorController.getInstructor);

// Update instructor profile (protected route)
  router.put(
    '/:id/profile',
    instructorController.updateProfile
  );

// Update instructor avatar (protected route)
router.put(
  '/:id/avatar',
  instructorController.updateAvatar
);

// Create a course (instructor-only route)
router.post(
  '/:id/courses',
  instructorController.createCourse
);

// Create a workshop (instructor-only route)
router.post(
  '/:id/workshops',
  instructorController.createWorkshop
);

// Create a topic (instructor-only route)
router.post(
  '/:id/topics',
  instructorController.createTopic
);

// Upload video to Cloudflare R2 (instructor-only route)
router.post(
  '/:id/upload-video',
  uploadVideo,
  instructorController.uploadVideo
);

// ===============================
// COURSE CRUD OPERATIONS
// ===============================

// Get all courses for an instructor
router.get(
  '/:id/courses',
  instructorController.getCourses
);

// Get all courses full relation for an instructor
router.get(
  '/:id/courses-full-relation',
  instructorController.getCoursesFullrelation
);

// Get a single course by ID
router.get(
  '/:id/courses/:courseId',
  instructorController.getCourse
);

// Update a course
router.put(
  '/:id/courses/:courseId',
  instructorController.updateCourse
);

// Delete a course
router.delete(
  '/:id/courses/:courseId',
  instructorController.deleteCourse
);

// ===============================
// MODULE CRUD OPERATIONS
// ===============================

// Get all modules for a course
router.get(
  '/courses/:courseId/modules',
  instructorController.getModules
);

// Get a single module by ID
router.get(
  '/modules/:moduleId',
  instructorController.getModule
);

// Create a new module for a course
router.post(
  '/courses/:courseId/modules',
  instructorController.createModule
);

// Update a module
router.put(
  '/modules/:moduleId',
  instructorController.updateModule
);

// Delete a module
router.delete(
  '/modules/:moduleId',
  instructorController.deleteModule
);

// ===============================
// LESSON CRUD OPERATIONS
// ===============================

// Get all lessons for a module
router.get(
  '/modules/:moduleId/lessons',
  instructorController.getLessons
);

// Get a single lesson by ID
router.get(
  '/lessons/:lessonId',
  instructorController.getLesson
);

// Update a lesson
router.put(
  '/lessons/:lessonId',
  instructorController.updateLesson
);

// Delete a lesson
router.delete(
  '/lessons/:lessonId',
  instructorController.deleteLesson
);

export default router;