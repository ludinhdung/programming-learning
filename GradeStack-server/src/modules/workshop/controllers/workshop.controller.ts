import { Request, Response } from 'express';
import { WorkshopService } from '../services/workshop.service';
import { createWorkshopSchema, updateWorkshopSchema, workshopIdSchema, registerWorkshopSchema } from '../validation/workshop.validation';

/**
 * Controller xử lý các yêu cầu HTTP liên quan đến workshop
 */
export class WorkshopController {
  private workshopService: WorkshopService;

  constructor() {
    this.workshopService = new WorkshopService();
  }

  /**
   * Xử lý lỗi và trả về phản hồi lỗi
   */
  private handleError(res: Response, error: any): void {
    console.error('Error:', error);
    const status = error.status || 500;
    const message = error.message || 'Lỗi máy chủ nội bộ';
    res.status(status).json({ message });
  }

  /**
   * Lấy danh sách workshop với phân trang và lọc
   */
  public getWorkshops = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        instructorId,
        type,
        search,
        page = 1,
        limit = 10,
        sortBy = 'scheduledAt',
        order = 'asc'
      } = req.query;

      const workshops = await this.workshopService.findWorkshops({
        instructorId: instructorId as string,
        type: type as string,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc'
      });

      res.status(200).json(workshops);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lấy thông tin chi tiết của một workshop
   */
  public getWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workshopId } = req.params;
      
      // Xác thực ID workshop
      const validationResult = workshopIdSchema.safeParse({ workshopId });
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      const workshop = await this.workshopService.getWorkshopById(workshopId);
      res.status(200).json(workshop);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Tạo workshop mới (chỉ dành cho instructor)
   */
  public createWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ID của instructor
      const workshopData = req.body;

      // Xác thực dữ liệu workshop
      const validationResult = createWorkshopSchema.safeParse(workshopData);
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      const workshop = await this.workshopService.createWorkshop(id, validationResult.data);
      res.status(201).json(workshop);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Cập nhật thông tin workshop (chỉ dành cho instructor)
   */
  public updateWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, workshopId } = req.params; // ID của instructor và workshop
      const workshopData = req.body;

      // Xác thực ID workshop
      const idValidationResult = workshopIdSchema.safeParse({ workshopId });
      if (!idValidationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: idValidationResult.error.format() 
        });
        return;
      }

      // Xác thực dữ liệu cập nhật
      const dataValidationResult = updateWorkshopSchema.safeParse(workshopData);
      if (!dataValidationResult.success) {
        res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ', 
          errors: dataValidationResult.error.format() 
        });
        return;
      }

      const workshop = await this.workshopService.updateWorkshop(id, workshopId, dataValidationResult.data);
      res.status(200).json(workshop);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Xóa workshop (chỉ dành cho instructor)
   */
  public deleteWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, workshopId } = req.params; // ID của instructor và workshop

      // Xác thực ID workshop
      const validationResult = workshopIdSchema.safeParse({ workshopId });
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      await this.workshopService.deleteWorkshop(id, workshopId);
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Đăng ký tham dự workshop (dành cho learner)
   */
  public registerWorkshop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ID của learner
      const { workshopId } = req.body;

      // Xác thực ID workshop
      const validationResult = registerWorkshopSchema.safeParse({ workshopId });
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      const attendance = await this.workshopService.registerWorkshop(id, workshopId);
      res.status(201).json({
        message: 'Đăng ký tham dự workshop thành công',
        attendance
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Hủy đăng ký tham dự workshop (dành cho learner)
   */
  public cancelRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, workshopId } = req.params; // ID của learner và workshop

      // Xác thực ID workshop
      const validationResult = workshopIdSchema.safeParse({ workshopId });
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      await this.workshopService.cancelRegistration(id, workshopId);
      res.status(200).json({
        message: 'Hủy đăng ký tham dự workshop thành công'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lấy danh sách workshop đã đăng ký (dành cho learner)
   */
  public getRegisteredWorkshops = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // ID của learner
      const workshops = await this.workshopService.getRegisteredWorkshops(id);
      res.status(200).json(workshops);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lấy thông tin preview của workshop
   */
  public getWorkshopPreview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { workshopId } = req.params;
      
      // Xác thực ID workshop
      const validationResult = workshopIdSchema.safeParse({ workshopId });
      if (!validationResult.success) {
        res.status(400).json({ 
          message: 'ID workshop không hợp lệ', 
          errors: validationResult.error.format() 
        });
        return;
      }

      const previewData = await this.workshopService.getWorkshopPreview(workshopId);
      res.status(200).json(previewData);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
