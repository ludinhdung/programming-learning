import { Router, Request, Response, NextFunction } from 'express';
import { InstructorController } from '../controllers/instructor.controller';
import { Role } from '@prisma/client';

const router = Router();
const instructorController = new InstructorController();

/**
 * Simple authentication middleware
 * Note: Replace with actual auth logic once available
 */
const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Placeholder for real authentication logic
    const user = (req as any).user;
    
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    next();
};

/**
 * Simple authorization middleware
 * Note: Replace with actual role-based auth logic once available
 */
const authorize = (allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Placeholder for real authorization logic
        const user = (req as any).user;
        
        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        next();
    };
};

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

export default router;