import { Request, Response, NextFunction } from "express";
import { WorkshopService } from "../services/workshop.service";
import { EmailService } from "../../../shared/services/email.service";

/**
 * Controller xử lý các chức năng liên quan đến Workshop
 */
export class WorkshopController {
  private workshopService: WorkshopService;
  private emailService: EmailService;

  constructor() {
    this.workshopService = new WorkshopService();
    this.emailService = new EmailService();
  }

  /**
   * Xử lý lỗi chung
   */
  private handleError(res: Response, error: any): void {
    console.error("Lỗi:", error);
    const status = error.status || 500;
    const message = error.message || "Lỗi server";
    res.status(status).json({ message });
  }

  /**
   * Tạo mới Workshop
   */
  public createWorkshop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Lấy dữ liệu từ request body
      const workshopData = req.body;
      
      // Ghi log dữ liệu nhận được để debug
      console.log('Controller nhận được dữ liệu:', {
        ...workshopData,
        autoGenerateMeet: workshopData.autoGenerateMeet,
        autoGenerateMeetType: typeof workshopData.autoGenerateMeet,
        autoGenerateMeetJSON: JSON.stringify(workshopData.autoGenerateMeet)
      });
      
      // Ép buộc autoGenerateMeet luôn là true, bất kể giá trị gửi lên là gì
      const autoGenerateMeetValue = true;
      
      console.log('Ghi đè giá trị autoGenerateMeet thành:', autoGenerateMeetValue);
      
      // Đảm bảo trường autoGenerateMeet là kiểu boolean và luôn là true
      const modifiedData = {
        ...workshopData,
        autoGenerateMeet: autoGenerateMeetValue
      };
      
      // Ghi log dữ liệu sau khi chuyển đổi
      console.log('Dữ liệu sau khi chuyển đổi:', {
        autoGenerateMeet: modifiedData.autoGenerateMeet,
        autoGenerateMeetType: typeof modifiedData.autoGenerateMeet,
        autoGenerateMeetOriginal: workshopData.autoGenerateMeet,
        autoGenerateMeetOriginalType: typeof workshopData.autoGenerateMeet
      });
      
      // Gọi service với dữ liệu đã chuyển đổi
      const workshop = await this.workshopService.createWorkshop(modifiedData);
      console.log('Workshop đã tạo:', workshop);
      res.status(201).json({
        success: true,
        data: workshop,
      });
    } catch (error) {
      console.error('Lỗi khi tạo workshop:', error);
      next(error);
    }
  };

  /**
   * Cập nhật Workshop
   */
  public updateWorkshop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const workshopData = req.body;
      
      const workshop = await this.workshopService.updateWorkshop(id, workshopData);
      
      res.status(200).json({
        success: true,
        data: workshop,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xóa Workshop
   */
  public deleteWorkshop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.workshopService.deleteWorkshop(id);
      
      res.status(200).json({
        success: true,
        message: "Workshop đã được xóa thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy thông tin Workshop theo ID
   */
  public getWorkshopById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      const workshop = await this.workshopService.getWorkshopById(id);
      
      res.status(200).json({
        success: true,
        data: workshop,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách tất cả Workshop
   */
  public getAllWorkshops = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const workshops = await this.workshopService.getAllWorkshops();
      
      res.status(200).json({
        success: true,
        data: workshops,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Đăng ký tham gia Workshop
   */
  public registerForWorkshop = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id: workshopId } = req.params;
      // Lấy userId từ req.user (người dùng đã đăng nhập)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Bạn cần đăng nhập để đăng ký tham gia workshop",
        });
        return;
      }
      
      const attendance = await this.workshopService.registerForWorkshop(workshopId, userId);
      
      res.status(201).json({
        success: true,
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Hủy đăng ký tham gia Workshop
   */
  public cancelWorkshopRegistration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id: workshopId } = req.params;
      // Lấy userId từ req.user (người dùng đã đăng nhập)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Bạn cần đăng nhập để hủy đăng ký tham gia workshop",
        });
        return;
      }
      
      await this.workshopService.cancelWorkshopRegistration(workshopId, userId);
      
      res.status(200).json({
        success: true,
        message: "Đã hủy đăng ký tham gia workshop thành công",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách người tham gia Workshop
   */
  public getWorkshopAttendees = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id: workshopId } = req.params;
      
      const attendees = await this.workshopService.getWorkshopAttendees(workshopId);
      
      res.status(200).json({
        success: true,
        data: attendees,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách Workshop của một Instructor
   */
  public getInstructorWorkshops = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { instructorId } = req.params;
      
      const workshops = await this.workshopService.getInstructorWorkshops(instructorId);
      
      res.status(200).json({
        success: true,
        data: workshops,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách Workshop công khai có phân trang
   */
  public getPublicWorkshops = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.workshopService.getPublicWorkshops(page, limit);
      
      res.status(200).json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách Workshop mà người dùng đã đăng ký
   */
  public getUserRegisteredWorkshops = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Lấy userId từ req.user (người dùng đã đăng nhập)
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Bạn cần đăng nhập để xem danh sách workshop đã đăng ký",
        });
        return;
      }
      
      const workshops = await this.workshopService.getUserRegisteredWorkshops(userId);
      
      res.status(200).json({
        success: true,
        data: workshops,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gửi email thông báo với link Google Meet đến người tham gia Workshop
   */
  public sendWorkshopEmailToAttendees = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id: workshopId } = req.params;
      
      // Lấy thông tin workshop
      const workshop = await this.workshopService.getWorkshopById(workshopId);
      
      if (!workshop) {
        res.status(404).json({
          success: false,
          message: "Workshop không tồn tại",
        });
        return;
      }
      
      // Lấy danh sách người tham gia
      const attendees = await this.workshopService.getWorkshopAttendees(workshopId);
      
      if (attendees.length === 0) {
        res.status(404).json({
          success: false,
          message: "Không có người tham gia nào đăng ký workshop này",
        });
        return;
      }
      
      // Gửi email cho từng người tham gia
      const instructorName = `${workshop.instructor?.user?.firstName || ''} ${workshop.instructor?.user?.lastName || ''}`;
      const startTime = new Date(workshop.scheduledAt);
      
      const emailPromises = attendees.map(attendee => {
        if (!attendee.user?.email) {
          console.warn(`Người tham gia với ID ${attendee.user?.id || 'không xác định'} không có email.`);
          return Promise.resolve();
        }
        
        return this.emailService.sendWorkshopReminderEmail(
          attendee.user.email,
          workshop.title,
          instructorName,
          startTime,
          workshop.duration,
          workshop.meetUrl || undefined
        );
      });
      
      await Promise.all(emailPromises.filter(Boolean));
      
      // Cập nhật trạng thái đã gửi email cho người tham gia
      await this.workshopService.markAttendeesAsNotified(workshopId);
      
      res.status(200).json({
        success: true,
        message: `Đã gửi email thành công đến ${attendees.length} người tham gia`,
      });
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      next(error);
    }
  };
}
