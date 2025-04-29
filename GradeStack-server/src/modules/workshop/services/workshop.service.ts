import { Attendance, PrismaClient, Workshop } from "@prisma/client";
import { AppError } from "../../../shared/middleware/error.middleware";
import { CreateWorkshopDTO, UpdateWorkshopDTO } from "../dto/WorkshopDTO";
import { GoogleCalendarService } from "../../../shared/services/google-calendar.service";

/**
 * Service xử lý logic nghiệp vụ cho Workshop
 */
export class WorkshopService {
  private prisma: PrismaClient;
  private googleCalendarService: GoogleCalendarService;

  constructor() {
    // Khởi tạo các thuộc tính
    this.prisma = new PrismaClient();
    this.googleCalendarService = new GoogleCalendarService();
    
    // Gọi hàm khởi tạo GoogleCalendarService
    this.initGoogleCalendarService();
  }
  
  /**
   * Khởi tạo GoogleCalendarService
   * @private
   */
  private initGoogleCalendarService(): void {
    // Sử dụng IIFE để gọi phương thức bất đồng bộ
    (async () => {
      try {
        console.log('Đang khởi tạo GoogleCalendarService trong WorkshopService...');
        const initialized = await this.googleCalendarService.init();
        if (initialized) {
          console.log('GoogleCalendarService đã được khởi tạo thành công trong WorkshopService');
        } else {
          console.warn('Không thể khởi tạo GoogleCalendarService. Các tính năng liên quan đến Google Calendar có thể không hoạt động.');
        }
      } catch (error) {
        console.error('Lỗi khi khởi tạo GoogleCalendarService:', error);
        if (error instanceof Error) {
          console.error('Chi tiết lỗi:', error.message);
        }
      }
    })();
  }

  /**
   * Tạo mới Workshop
   * @param workshopData - Dữ liệu workshop
   * @returns Workshop đã tạo
   */
  public async createWorkshop(workshopData: CreateWorkshopDTO): Promise<Workshop & { instructor: { user: { id: string; firstName: string; lastName: string; email: string; } } }> {
    // Kiểm tra instructor có tồn tại không
    const instructor = await this.prisma.instructor.findUnique({
      where: { userId: workshopData.instructorId },
    });

    if (!instructor) {
      throw new AppError("Instructor không tồn tại", 404);
    }

    // Tạo Google Meet URL nếu được yêu cầu
    let meetUrl: string | null = workshopData.meetUrl || null;
    
    // GIỮ NGUYÊN giá trị autoGenerateMeet từ client gửi lên
    const autoGenerateMeet: boolean = !!workshopData.autoGenerateMeet;
    
    // Lưu trạng thái đã cố gắng tạo Meet URL hay chưa
    let meetUrlGenerationAttempted: boolean = false;
    
    if (workshopData.autoGenerateMeet) {
      meetUrlGenerationAttempted = true;
      try {
        // Khởi tạo GoogleCalendarService nếu cần
        await this.googleCalendarService.init();
        
        // Kiểm tra xem token có hợp lệ không trước khi tạo meeting
        const isTokenValid = await this.googleCalendarService.isTokenValid();
        if (!isTokenValid) {
          console.warn('Google Calendar token không hợp lệ. Không thể tạo Google Meet URL tự động.');
          console.log('Hướng dẫn lấy refresh token mới:', this.googleCalendarService.getAuthInstructions());
          
          // KHÔNG đặt lại autoGenerateMeet, chỉ ghi log
          console.log('Không thể tạo Google Meet URL do token không hợp lệ, nhưng vẫn giữ nguyên cấu hình autoGenerateMeet =', autoGenerateMeet);
        } else {
          const startTime = new Date(workshopData.scheduledAt);
          const endTime = new Date(startTime.getTime() + workshopData.duration * 60000);
          
          console.log('Đang tạo Google Meet URL với thông tin:', {
            title: workshopData.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          });
          
          meetUrl = await this.googleCalendarService.createMeeting(
            workshopData.title,
            workshopData.description,
            startTime,
            endTime
          );
          
          if (meetUrl) {
            console.log(`Đã tạo Google Meet URL thành công: ${meetUrl}`);
          } else {
            console.warn('Google Meet URL là null hoặc rỗng sau khi gọi API.');
            // KHÔNG đặt lại autoGenerateMeet, chỉ ghi log
            console.log('Không tạo được URL nhưng vẫn giữ autoGenerateMeet =', autoGenerateMeet);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tạo Google Meet URL:', error);
        // Không ném lỗi, chỉ log và tiếp tục tạo workshop mà không có meetUrl
        // Ghi log chi tiết hơn để dễ dàng debug
        if (error instanceof Error) {
          console.error('Chi tiết lỗi:', error.message);
          console.error('Stack trace:', error.stack);
        }
        
        // KHÔNG đặt lại autoGenerateMeet, chỉ ghi log
        console.log('Gặp lỗi khi tạo Meet URL nhưng vẫn giữ autoGenerateMeet =', autoGenerateMeet);
      }
    }

    // Log thông tin cuối cùng trước khi tạo workshop
    console.log('Tạo Workshop với thông tin:', {
      ...workshopData,
      meetUrl,
      autoGenerateMeet
    });
    
    // Tạo dữ liệu workshop với giá trị autoGenerateMeet rõ ràng
    const workshopCreateData = {
      title: workshopData.title,
      description: workshopData.description,
      scheduledAt: workshopData.scheduledAt,
      duration: workshopData.duration,
      instructorId: workshopData.instructorId,
      meetUrl: meetUrl,
      thumbnail: workshopData.thumbnail || null,
      autoGenerateMeet: autoGenerateMeet, // Sử dụng biến đã xác định ở trên
    };
    
    // Log lại một lần nữa để kiểm tra chắc chắn
    console.log('Dữ liệu chính xác sẽ được lưu vào database:', workshopCreateData);
    console.log('Giá trị autoGenerateMeet:',
      'Từ client:', !!workshopData.autoGenerateMeet,
      'Biến đã xử lý:', autoGenerateMeet,
      'Sẽ lưu vào DB:', workshopCreateData.autoGenerateMeet
    );
    
    // Tạo workshop và lưu vào database
    const createdWorkshop = await this.prisma.workshop.create({
      data: workshopCreateData,
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
    
    // Log kết quả sau khi tạo để kiểm tra
    console.log('Workshop đã tạo:', {
      id: createdWorkshop.id,
      title: createdWorkshop.title,
      autoGenerateMeet: createdWorkshop.autoGenerateMeet,
      meetUrl: createdWorkshop.meetUrl
    });
    
    return createdWorkshop;
  }

  /**
   * Cập nhật Workshop
   * @param workshopId - ID của workshop
   * @param workshopData - Dữ liệu cập nhật
   * @returns Workshop đã cập nhật
   */
  public async updateWorkshop(
    workshopId: string,
    workshopData: UpdateWorkshopDTO
  ): Promise<Workshop & { instructor: { user: { id: string; firstName: string; lastName: string; email: string; } } }> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    // Kiểm tra instructor có tồn tại không nếu có thay đổi
    if (workshopData.instructorId) {
      const instructor = await this.prisma.instructor.findUnique({
        where: { userId: workshopData.instructorId },
      });

      if (!instructor) {
        throw new AppError("Instructor không tồn tại", 404);
      }
    }

    // Tạo Google Meet URL nếu được yêu cầu và chưa có
    type WorkshopUpdateData = {
      title?: string;
      description?: string;
      scheduledAt?: Date;
      duration?: number;
      instructorId?: string;
      meetUrl?: string | null;
      thumbnail?: string | null;
      autoGenerateMeet?: boolean;
    };
    
    const updateData: WorkshopUpdateData = {};
    
    // Chỉ cập nhật các trường có giá trị
    if (workshopData.title !== undefined) updateData.title = workshopData.title;
    if (workshopData.description !== undefined) updateData.description = workshopData.description;
    if (workshopData.scheduledAt !== undefined) updateData.scheduledAt = workshopData.scheduledAt;
    if (workshopData.duration !== undefined) updateData.duration = workshopData.duration;
    if (workshopData.thumbnail !== undefined) updateData.thumbnail = workshopData.thumbnail;
    if (workshopData.autoGenerateMeet !== undefined) updateData.autoGenerateMeet = workshopData.autoGenerateMeet;
    
    // Tạo Google Meet URL nếu được yêu cầu và chưa có
    if (workshopData.autoGenerateMeet && !workshop.meetUrl) {
      try {
        // Khởi tạo GoogleCalendarService nếu cần
        await this.googleCalendarService.init();
        
        // Kiểm tra xem token có hợp lệ không trước khi tạo meeting
        const isTokenValid = await this.googleCalendarService.isTokenValid();
        if (!isTokenValid) {
          console.warn('Google Calendar token không hợp lệ. Không thể tạo Google Meet URL tự động.');
          console.log('Hướng dẫn lấy refresh token mới:', this.googleCalendarService.getAuthInstructions());
          
          // Đặt lại cờ autoGenerateMeet để lưu vào DB
          updateData.autoGenerateMeet = false;
          console.log('Đã tắt tính năng tự động tạo Google Meet do token không hợp lệ.');
        } else {
          const startTime = new Date(workshopData.scheduledAt || workshop.scheduledAt);
          const duration = workshopData.duration || workshop.duration;
          const endTime = new Date(startTime.getTime() + duration * 60000);
          
          console.log('Đang tạo Google Meet URL với thông tin:', {
            title: workshopData.title || workshop.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          });
          
          const meetUrl = await this.googleCalendarService.createMeeting(
            workshopData.title || workshop.title,
            workshopData.description || workshop.description,
            startTime,
            endTime
          );
          
          if (meetUrl) {
            updateData.meetUrl = meetUrl;
            console.log(`Đã tạo Google Meet URL thành công khi cập nhật workshop: ${meetUrl}`);
          } else {
            console.warn('Google Meet URL là null hoặc rỗng sau khi gọi API.');
            updateData.autoGenerateMeet = false;
          }
        }
      } catch (error) {
        console.error('Lỗi khi tạo Google Meet URL:', error);
        // Không ném lỗi, chỉ log và tiếp tục cập nhật workshop mà không có meetUrl
        // Ghi log chi tiết hơn để dễ dàng debug
        if (error instanceof Error) {
          console.error('Chi tiết lỗi:', error.message);
          console.error('Stack trace:', error.stack);
        }
        
        // Đặt lại cờ autoGenerateMeet do lỗi
        updateData.autoGenerateMeet = false;
        console.log('Đã tắt tính năng tự động tạo Google Meet do gặp lỗi.');
      }
    } else if (workshopData.meetUrl !== undefined) {
      // Chỉ cập nhật meetUrl nếu không tự động tạo và có giá trị mới
      updateData.meetUrl = workshopData.meetUrl;
    }

    // Log thông tin cuối cùng trước khi cập nhật workshop
    console.log('Cập nhật Workshop với thông tin:', {
      id: workshopId,
      ...updateData
    });
    
    return await this.prisma.workshop.update({
      where: { id: workshopId },
      data: updateData,
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Xóa Workshop
   * @param workshopId - ID của workshop
   */
  public async deleteWorkshop(workshopId: string): Promise<void> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    await this.prisma.$transaction(async (tx) => {
      // Xóa tất cả các attendance liên quan
      await tx.attendance.deleteMany({
        where: { workshopId },
      });

      // Xóa workshop
      await tx.workshop.delete({
        where: { id: workshopId },
      });
    });
  }

  /**
   * Lấy Workshop theo ID
   * @param workshopId - ID của workshop
   * @returns Thông tin workshop
   */
  public async getWorkshopById(workshopId: string): Promise<Workshop & { 
    instructor: { 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
      } 
    };
    attendees: Array<Attendance & { 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
      } 
    }>;
  }> {
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    return workshop;
  }

  /**
   * Lấy tất cả Workshops
   * @returns Danh sách workshops
   */
  public async getAllWorkshops(): Promise<Array<Workshop & { 
    instructor: { 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
      } 
    };
    attendees: Array<{ 
      userId: string; 
      attendedAt: Date; 
    }>;
  }>> {
    return await this.prisma.workshop.findMany({
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendees: {
          select: {
            userId: true,
            attendedAt: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  /**
   * Đăng ký tham gia Workshop
   * @param workshopId - ID của workshop
   * @param userId - ID của người dùng
   * @returns Thông tin đăng ký
   */
  public async registerForWorkshop(
    workshopId: string,
    userId: string
  ): Promise<Attendance & { 
    user: { 
      id: string; 
      firstName: string; 
      lastName: string; 
      email: string; 
    };
    workshop: Workshop;
  }> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    // Kiểm tra người dùng có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404);
    }

    // Kiểm tra người dùng đã đăng ký workshop này chưa
    const existingAttendance = await this.prisma.attendance.findUnique({
      where: {
        userId_workshopId: {
          userId,
          workshopId,
        },
      },
    });

    if (existingAttendance) {
      throw new AppError("Bạn đã đăng ký tham gia workshop này rồi", 400);
    }

    return await this.prisma.attendance.create({
      data: {
        userId,
        workshopId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        workshop: true,
      },
    });
  }

  /**
   * Hủy đăng ký tham gia Workshop
   * @param workshopId - ID của workshop
   * @param userId - ID của người dùng
   */
  public async cancelWorkshopRegistration(
    workshopId: string,
    userId: string
  ): Promise<void> {
    // Kiểm tra đăng ký có tồn tại không
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_workshopId: {
          userId,
          workshopId,
        },
      },
    });

    if (!attendance) {
      throw new AppError("Bạn chưa đăng ký tham gia workshop này", 404);
    }

    await this.prisma.attendance.delete({
      where: {
        userId_workshopId: {
          userId,
          workshopId,
        },
      },
    });
  }

  /**
   * Lấy danh sách người tham gia Workshop
   * @param workshopId - ID của workshop
   * @returns Danh sách người tham gia
   */
  public async getWorkshopAttendees(workshopId: string): Promise<Array<Attendance & { 
    user: { 
      id: string; 
      firstName: string; 
      lastName: string; 
      email: string; 
    } 
  }>> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    return await this.prisma.attendance.findMany({
      where: { workshopId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        attendedAt: "asc",
      },
    });
  }

  /**
   * Lấy danh sách Workshop của một Instructor
   * @param instructorId - ID của instructor
   * @returns Danh sách workshop
   */
  public async getInstructorWorkshops(instructorId: string): Promise<Array<Workshop & { 
    instructor: { 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
      } 
    };
    attendees: Array<{ 
      userId: string; 
      attendedAt: Date; 
    }>;
  }>> {
    // Kiểm tra instructor có tồn tại không
    const instructor = await this.prisma.instructor.findUnique({
      where: { userId: instructorId },
    });

    if (!instructor) {
      throw new AppError("Instructor không tồn tại", 404);
    }

    return await this.prisma.workshop.findMany({
      where: { instructorId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendees: {
          select: {
            userId: true,
            attendedAt: true,
          },
        },
      },
      orderBy: {
        scheduledAt: "asc",
      },
    });
  }

  /**
   * Lấy danh sách Workshop công khai có phân trang
   * @param page - Số trang
   * @param limit - Số lượng item trên một trang
   * @returns Danh sách workshop và thông tin phân trang
   */
  public async getPublicWorkshops(page: number, limit: number): Promise<{
    data: Array<Workshop & { 
      instructor: { 
        user: { 
          id: string; 
          firstName: string; 
          lastName: string; 
          email: string; 
        } 
      };
      attendees: Array<{ 
        userId: string; 
        attendedAt: Date; 
      }>;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [workshops, total] = await Promise.all([
      this.prisma.workshop.findMany({
        skip,
        take: limit,
        include: {
          instructor: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          attendees: {
            select: {
              userId: true,
              attendedAt: true,
            },
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
      }),
      this.prisma.workshop.count(),
    ]);

    return {
      data: workshops,
      total,
      page,
      limit,
    };
  }

  /**
   * Lấy danh sách Workshop mà người dùng đã đăng ký
   * @param userId - ID của người dùng
   * @returns Danh sách workshop đã đăng ký
   */
  public async getUserRegisteredWorkshops(userId: string): Promise<Array<Workshop & { 
    instructor: { 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
      } 
    };
    attendees: Array<{ 
      userId: string; 
      attendedAt: Date; 
    }>;
  }>> {
    // Kiểm tra user có tồn tại không
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("Người dùng không tồn tại", 404);
    }

    // Lấy danh sách workshop mà người dùng đã đăng ký
    const attendances = await this.prisma.attendance.findMany({
      where: { userId },
      include: {
        workshop: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
            attendees: {
              select: {
                userId: true,
                attendedAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        workshop: {
          scheduledAt: 'asc',
        },
      },
    });

    // Chuyển đổi kết quả để trả về danh sách workshop
    return attendances.map(attendance => attendance.workshop);
  }

  /**
   * Đánh dấu người tham gia đã nhận được email thông báo
   * @param workshopId - ID của workshop
   * @returns Kết quả cập nhật
   */
  public async markAttendeesAsNotified(workshopId: string): Promise<void> {
    // Kiểm tra workshop có tồn tại không
    const workshop = await this.prisma.workshop.findUnique({
      where: { id: workshopId },
    });

    if (!workshop) {
      throw new AppError("Workshop không tồn tại", 404);
    }

    // Cập nhật trạng thái đã gửi email cho tất cả người tham gia
    await this.prisma.attendance.updateMany({
      where: { workshopId },
      data: { notified: true },
    });
  }
}
