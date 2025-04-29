import { Request, Response, NextFunction } from "express";
import { InstructorLeadService } from "../services/instructor-lead.service";
import { TopicPaginationService } from "../services/topic-pagination.service";
import { PrismaClient, Role } from "@prisma/client";

/**
 * Controller xử lý các chức năng của Instructor Lead
 */
export class InstructorLeadController {
  private instructorLeadService: InstructorLeadService;
  private topicPaginationService: TopicPaginationService;

  constructor() {
    this.instructorLeadService = new InstructorLeadService();
    this.topicPaginationService = new TopicPaginationService();
  }

  /**
   * Đăng nhập Instructor Lead
   * @param req Request chứa email và password
   * @param res Response trả về user và token
   */
  public loginInstructorLead = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { email, password }: { email: string; password: string } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });
        return;
      }
      const result = await this.instructorLeadService.loginInstructorLead({ email, password });
      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };


  /**
   * Xử lý lỗi chung
   */
  private handleError(res: Response, error: any): void {
    console.error("Lỗi:", error);
    const status = error.statusCode || 500;
    const message = error.message || "Lỗi server";
    res.status(status).json({
      success: false,
      message: message
    });
  }

  /**
   * Tạo mới Instructor Lead
   */
  public createInstructorLead = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userData, instructorData } = req.body;
      
      // Kiểm tra các trường bắt buộc
      if (
        !userData?.email ||
        !userData?.password ||
        !userData?.firstName ||
        !userData?.lastName
      ) {
        res.status(400).json({ message: "Thiếu thông tin người dùng bắt buộc" });
        return;
      }
      
      const instructorLead = await this.instructorLeadService.createInstructorLead(
        userData,
        instructorData
      );
      
      res.status(201).json(instructorLead);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lấy thông tin Instructor Lead theo ID
   */
  public getInstructorLead = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const instructorLead = await this.instructorLeadService.findByUserId(id);
      res.status(200).json(instructorLead);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Cập nhật thông tin Instructor Lead
   */
  public updateProfile = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const instructorLead = await this.instructorLeadService.updateProfile(id, data);
      res.status(200).json(instructorLead);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lấy danh sách các Instructor
   */
  public getAllInstructors = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const instructors = await this.instructorLeadService.getAllInstructors();
      res.status(200).json(instructors);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Quản lý Topic
   */
  public manageTopic = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const actionStr = req.query.action as string;
      const { id } = req.params;
      const topicData = req.body;
      
      console.log('manageTopic - Action:', actionStr);
      console.log('manageTopic - ID:', id);
      console.log('manageTopic - Topic data:', topicData);
      console.log('manageTopic - User:', req.user);
      
      // Kiểm tra xác thực
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Bạn cần đăng nhập để sử dụng chức năng này"
        });
        return;
      }
      
      let result;
      
      switch (actionStr) {
        case 'create':
          try {
            // Kiểm tra dữ liệu đầu vào
            if (!topicData.name) {
              res.status(400).json({
                success: false,
                message: "Tên topic là bắt buộc"
              });
              return;
            }
            
            // Thêm instructorUserId nếu chưa có
            if (!topicData.instructorUserId && req.user) {
              topicData.instructorUserId = req.user.id;
            }
            
            // Đảm bảo có thumbnail URL hợp lệ
            if (!topicData.thumbnail || topicData.thumbnail === '') {
              topicData.thumbnail = 'https://placehold.co/600x400?text=No+Image';
            }
            
            // Đảm bảo có mô tả
            if (!topicData.description) {
              topicData.description = '';
            }
            
            console.log('manageTopic - Final topic data:', topicData);
            result = await this.instructorLeadService.createTopic(topicData);
            console.log('manageTopic - Topic created successfully:', result);
          } catch (error: any) {
            console.error('Lỗi khi tạo topic:', error);
            res.status(error.statusCode || 500).json({
              success: false,
              message: error.message || "Lỗi khi tạo topic"
            });
            return;
          }
          break;
        case 'update':
          try {
            // Kiểm tra xem có ID hợp lệ không
            if (!id || id === 'undefined') {
              res.status(400).json({
                success: false,
                message: "ID topic không hợp lệ"
              });
              return;
            }
            
            console.log('manageTopic - Updating topic with ID:', id, 'and data:', topicData);
            result = await this.instructorLeadService.updateTopic(id, topicData);
          } catch (error: any) {
            console.error('Lỗi khi cập nhật topic:', error);
            res.status(error.statusCode || 500).json({
              success: false,
              message: error.message || "Lỗi khi cập nhật topic"
            });
            return;
          }
          break;
        case 'delete':
          try {
            // Kiểm tra xem có ID hợp lệ không
            if (!id || id === 'undefined') {
              res.status(400).json({
                success: false,
                message: "ID topic không hợp lệ"
              });
              return;
            }
            
            console.log('manageTopic - Deleting topic with ID:', id);
            result = await this.instructorLeadService.deleteTopic(id);
          } catch (error: any) {
            console.error('Lỗi khi xóa topic:', error);
            res.status(error.statusCode || 500).json({
              success: false,
              message: error.message || "Lỗi khi xóa topic"
            });
            return;
          }
          break;
        case 'get':
          try {
            // Kiểm tra xem có ID hợp lệ không
            if (!id || id === 'undefined') {
              res.status(400).json({
                success: false,
                message: "ID topic không hợp lệ"
              });
              return;
            }
            
            console.log('manageTopic - Getting topic with ID:', id);
            result = await this.instructorLeadService.getTopicById(id);
          } catch (error: any) {
            console.error('Lỗi khi lấy thông tin topic:', error);
            res.status(error.statusCode || 500).json({
              success: false,
              message: error.message || "Lỗi khi lấy thông tin topic"
            });
            return;
          }
          break;
        case 'list':
          try {
            console.log('manageTopic - Đang gọi getAllTopics với phân trang');
            
            // Lấy tham số phân trang từ query string
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            
            console.log(`manageTopic - Tham số phân trang: page=${page}, limit=${limit}`);
            
            // Lấy danh sách topics với phân trang
            result = await this.topicPaginationService.getTopicsWithPagination(page, limit);
            console.log('manageTopic - Kết quả getAllTopics với phân trang:', {
              total: result.total,
              page: result.page,
              limit: result.limit,
              dataCount: result.data?.length || 0
            });
            
            // Nếu không có kết quả, đảm bảo trả về đối tượng hợp lệ
            if (!result) {
              result = {
                data: [],
                total: 0,
                page,
                limit
              };
            }
          } catch (error: any) {
            console.error('Lỗi khi lấy danh sách topic:', error);
            res.status(error.statusCode || 500).json({
              success: false,
              message: error.message || "Lỗi khi lấy danh sách topic"
            });
            return;
          }
          break;
        default:
          console.error('manageTopic - Invalid action:', actionStr);
          res.status(400).json({ 
            success: false,
            message: "Hành động không hợp lệ" 
          });
          return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Lỗi chi tiết trong manageTopic:', error);
      this.handleError(res, error);
    }
  };

  /**
   * Quản lý Learning Path
   */
  public manageLearningPath = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { action } = req.query;
      const { id } = req.params;
      const learningPathData = req.body;

      let result;
      
      switch (action) {
        case 'create':
          result = await this.instructorLeadService.createLearningPath(learningPathData);
          break;
        case 'update':
          result = await this.instructorLeadService.updateLearningPath(id, learningPathData);
          break;
        case 'delete':
          result = await this.instructorLeadService.deleteLearningPath(id);
          break;
        case 'get':
          result = await this.instructorLeadService.getLearningPathById(id);
          break;
        case 'list':
          result = await this.instructorLeadService.getAllLearningPaths();
          break;
        default:
          res.status(400).json({ message: "Hành động không hợp lệ" });
          return;
      }

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Quản lý Workshop
   */
  public manageWorkshop = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { action } = req.query;
      const { id } = req.params;
      const workshopData = req.body;

      let result;
      
      switch (action) {
        case 'create':
          result = await this.instructorLeadService.createWorkshop(workshopData);
          break;
        case 'update':
          result = await this.instructorLeadService.updateWorkshop(id, workshopData);
          break;
        case 'delete':
          result = await this.instructorLeadService.deleteWorkshop(id);
          break;
        case 'get':
          result = await this.instructorLeadService.getWorkshopById(id);
          break;
        case 'list':
          result = await this.instructorLeadService.getAllWorkshops();
          break;
        default:
          res.status(400).json({ message: "Hành động không hợp lệ" });
          return;
      }

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Phê duyệt khóa học
   */
  public approveCourse = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { courseId } = req.params;
      const result = await this.instructorLeadService.approveCourse(courseId);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Từ chối khóa học
   */
  public rejectCourse = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { courseId } = req.params;
      const { reason } = req.body;
      const result = await this.instructorLeadService.rejectCourse(courseId, reason);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
