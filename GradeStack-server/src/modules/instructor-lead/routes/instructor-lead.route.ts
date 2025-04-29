import { Router } from "express";
import { InstructorLeadController } from "../controllers/instructor-lead.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { Role } from "@prisma/client";
import { validateRequest } from "../validation/instructor-lead.validation";

/**
 * Router xử lý các route liên quan đến Instructor Lead
 */
export class InstructorLeadRouter {
  public router: Router;
  private instructorLeadController: InstructorLeadController;

  constructor() {
    this.router = Router();
    this.instructorLeadController = new InstructorLeadController();
    this.initializeRoutes();
  }

  /**
   * Khởi tạo các routes
   */
  private initializeRoutes(): void {
    // Đăng nhập Instructor Lead
    this.router.post(
      "/login",
      validateRequest("loginInstructorLead"),
      this.instructorLeadController.loginInstructorLead
    );
    
    // Route đăng ký Instructor Lead không cần xác thực (chỉ dùng cho mục đích test)
    this.router.post(
      "/register-test",
      validateRequest("createInstructorLead"),
      this.instructorLeadController.createInstructorLead
    );
    
    // Route quản lý Instructor Lead
    this.router.post(
      "/",
      authenticate,
      authorize(Role.ADMIN),
      validateRequest("createInstructorLead"),
      this.instructorLeadController.createInstructorLead
    );

    // Đặt tất cả route cụ thể trước các route có tham số
    // Route quản lý Instructor
    this.router.get(
      "/instructors/all",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      this.instructorLeadController.getAllInstructors
    );
    
    // Route quản lý Topic
    this.router.get(
      "/topics",
      authenticate,
      (req, res) => {
        req.query.action = "list";
        this.instructorLeadController.manageTopic(req, res);
      }
    );
    
    this.router.post(
      "/topics",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("createTopic"),
      (req, res) => {
        req.query.action = "create";
        this.instructorLeadController.manageTopic(req, res);
      }
    );
    
    // Route quản lý Topic với tham số id
    this.router.get(
      "/topics/:id",
      authenticate,
      (req, res) => {
        req.query.action = "get";
        this.instructorLeadController.manageTopic(req, res);
      }
    );
    
    this.router.put(
      "/topics/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("updateTopic"),
      (req, res) => {
        req.query.action = "update";
        this.instructorLeadController.manageTopic(req, res);
      }
    );

    this.router.delete(
      "/topics/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      (req, res) => {
        req.query.action = "delete";
        this.instructorLeadController.manageTopic(req, res);
      }
    );
    
    // Route quản lý Instructor Lead với tham số id
    this.router.get(
      "/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      this.instructorLeadController.getInstructorLead
    );

    this.router.put(
      "/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("updateProfile"),
      this.instructorLeadController.updateProfile
    );

    // Route quản lý Learning Path

    // Route quản lý Learning Path
    this.router.post(
      "/learning-paths",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("createLearningPath"),
      (req, res) => {
        req.query.action = "create";
        this.instructorLeadController.manageLearningPath(req, res);
      }
    );

    this.router.put(
      "/learning-paths/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("updateLearningPath"),
      (req, res) => {
        req.query.action = "update";
        this.instructorLeadController.manageLearningPath(req, res);
      }
    );

    this.router.delete(
      "/learning-paths/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      (req, res) => {
        req.query.action = "delete";
        this.instructorLeadController.manageLearningPath(req, res);
      }
    );

    this.router.get(
      "/learning-paths/:id",
      authenticate,
      (req, res) => {
        req.query.action = "get";
        this.instructorLeadController.manageLearningPath(req, res);
      }
    );

    this.router.get(
      "/learning-paths",
      authenticate,
      (req, res) => {
        req.query.action = "list";
        this.instructorLeadController.manageLearningPath(req, res);
      }
    );

    // Route quản lý Workshop
    this.router.post(
      "/workshops",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("createWorkshop"),
      (req, res) => {
        req.query.action = "create";
        this.instructorLeadController.manageWorkshop(req, res);
      }
    );

    this.router.put(
      "/workshops/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("updateWorkshop"),
      (req, res) => {
        req.query.action = "update";
        this.instructorLeadController.manageWorkshop(req, res);
      }
    );

    this.router.delete(
      "/workshops/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      (req, res) => {
        req.query.action = "delete";
        this.instructorLeadController.manageWorkshop(req, res);
      }
    );

    this.router.get(
      "/workshops/:id",
      authenticate,
      (req, res) => {
        req.query.action = "get";
        this.instructorLeadController.manageWorkshop(req, res);
      }
    );

    this.router.get(
      "/workshops",
      authenticate,
      (req, res) => {
        req.query.action = "list";
        this.instructorLeadController.manageWorkshop(req, res);
      }
    );

    // Route phê duyệt khóa học
    this.router.put(
      "/courses/:courseId/approve",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      this.instructorLeadController.approveCourse
    );

    this.router.put(
      "/courses/:courseId/reject",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD),
      validateRequest("rejectCourse"),
      this.instructorLeadController.rejectCourse
    );
  }
}
