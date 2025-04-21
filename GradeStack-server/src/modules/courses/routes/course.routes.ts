import { Router } from "express";
import { CourseController } from "../controllers/course.controller";

const router = Router();
const courseController = new CourseController();

router.get("/", courseController.getCourses.bind(courseController));

router.get("/:courseId", courseController.getCourseById);

router.get("/course/:courseId", courseController.getCoursebyCourseId);

router.get("/all", courseController.getAllCourses);

// New routes for course verification
router.get("/verify/unpublished", courseController.getUnpublishedCourses.bind(courseController));
router.patch("/verify/:courseId/publish", courseController.toggleCoursePublishStatus.bind(courseController));

// Get student enrolled courses
router.get("/course/:courseId/students", courseController.getStudentEnrolledCourses.bind(courseController));
export default router;
