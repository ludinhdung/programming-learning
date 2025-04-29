import { Router } from "express";
import { WorkshopController } from "../controllers/workshop.controller";
import { authenticate, authorize } from "../../../shared/middleware/auth.middleware";
import { Role } from "@prisma/client";
import { validateRequest } from "../validation/workshop.validation";

/**
 * Router xử lý các route liên quan đến Workshop
 */
export class WorkshopRouter {
  public router: Router;
  private workshopController: WorkshopController;

  constructor() {
    this.router = Router();
    this.workshopController = new WorkshopController();
    this.initializeRoutes();
  }

  /**
   * Khởi tạo các routes
   */
  private initializeRoutes(): void {
    // Route quản lý Workshop
    this.router.post(
      "/",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD, Role.INSTRUCTOR),
      validateRequest("createWorkshop"),
      this.workshopController.createWorkshop
    );

    this.router.put(
      "/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD, Role.INSTRUCTOR),
      validateRequest("updateWorkshop"),
      this.workshopController.updateWorkshop
    );

    this.router.delete(
      "/:id",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD, Role.INSTRUCTOR),
      this.workshopController.deleteWorkshop
    );

    // Route lấy danh sách Workshop công khai có phân trang
    this.router.get(
      "/public",
      this.workshopController.getPublicWorkshops
    );
    
    // Route lấy danh sách Workshop đã đăng ký của người dùng
    this.router.get(
      "/user/registered",
      authenticate,
      this.workshopController.getUserRegisteredWorkshops
    );
    
    // Route lấy danh sách Workshop của một Instructor
    this.router.get(
      "/instructor/:instructorId",
      authenticate,
      this.workshopController.getInstructorWorkshops
    );

    this.router.get(
      "/:id",
      authenticate,
      this.workshopController.getWorkshopById
    );

    this.router.get(
      "/",
      authenticate,
      this.workshopController.getAllWorkshops
    );

    // Route đăng ký tham gia Workshop
    this.router.post(
      "/:id/register",
      authenticate,
      validateRequest("registerWorkshop"),
      this.workshopController.registerForWorkshop
    );

    this.router.delete(
      "/:id/register",
      authenticate,
      validateRequest("cancelWorkshopRegistration"),
      this.workshopController.cancelWorkshopRegistration
    );

    // Route lấy danh sách người tham gia Workshop
    this.router.get(
      "/:id/attendees",
      authenticate,
      this.workshopController.getWorkshopAttendees
    );
    
    // Route gửi email thông báo với link Google Meet đến người tham gia Workshop
    this.router.post(
      "/:id/send-email",
      authenticate,
      authorize(Role.ADMIN, Role.INSTRUCTOR_LEAD, Role.INSTRUCTOR),
      this.workshopController.sendWorkshopEmailToAttendees
    );
  }
}
