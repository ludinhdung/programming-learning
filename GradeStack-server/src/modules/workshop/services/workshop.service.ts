import { PrismaClient, Workshop, Attendance } from '@prisma/client';
import { withTransaction } from '../../../shared/utils/transaction.utils';

const prisma = new PrismaClient();

/**
 * Interface cho tham số tìm kiếm workshop
 */
interface FindWorkshopsParams {
  instructorId?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Service xử lý logic nghiệp vụ liên quan đến workshop
 */
export class WorkshopService {
  /**
   * Tìm kiếm danh sách workshop với các bộ lọc
   */
  async findWorkshops({
    instructorId,
    type,
    search,
    page = 1,
    limit = 10,
    sortBy = 'scheduledAt',
    order = 'asc',
  }: FindWorkshopsParams) {
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: any = {};

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (type) {
      where.type = type;
    }

    // Xử lý tìm kiếm theo tiêu đề
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive' // Tìm kiếm không phân biệt chữ hoa/thường
      };
    }

    // Đếm tổng số workshop thỏa mãn điều kiện
    const totalCount = await prisma.workshop.count({ where });

    // Lấy danh sách workshop
    const workshops = await prisma.workshop.findMany({
      where,
      include: {
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order
      }
    });

    return {
      data: workshops,
      meta: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  /**
   * Lấy thông tin chi tiết của một workshop
   */
  async getWorkshopById(workshopId: string): Promise<Workshop | null> {
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      include: {
        instructor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            attendees: true
          }
        }
      }
    });

    if (!workshop) {
      throw { status: 404, message: `Không tìm thấy workshop với id ${workshopId}` };
    }

    return workshop;
  }

  /**
   * Tạo workshop mới
   */
  async createWorkshop(instructorId: string, workshopData: any): Promise<Workshop> {
    // Kiểm tra instructor tồn tại
    const instructor = await prisma.instructor.findUnique({
      where: { userId: instructorId }
    });

    if (!instructor) {
      throw { status: 404, message: 'Không tìm thấy instructor' };
    }

    // Tạo workshop mới
    const workshop = await prisma.workshop.create({
      data: {
        title: workshopData.title,
        description: workshopData.description,
        scheduledAt: new Date(workshopData.scheduledAt),
        duration: workshopData.duration,
        type: workshopData.type || 'FRONTEND', // Mặc định là FRONTEND nếu không được chỉ định
        instructorId: instructorId
      }
    });

    return workshop;
  }

  /**
   * Cập nhật thông tin workshop
   */
  async updateWorkshop(instructorId: string, workshopId: string, workshopData: any): Promise<Workshop> {
    // Kiểm tra workshop tồn tại và thuộc về instructor
    const existingWorkshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        instructorId: instructorId
      }
    });

    if (!existingWorkshop) {
      throw { status: 404, message: 'Không tìm thấy workshop hoặc bạn không có quyền chỉnh sửa' };
    }

    // Cập nhật workshop
    const updatedWorkshop = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        ...(workshopData.title && { title: workshopData.title }),
        ...(workshopData.description && { description: workshopData.description }),
        ...(workshopData.scheduledAt && { scheduledAt: new Date(workshopData.scheduledAt) }),
        ...(workshopData.duration && { duration: workshopData.duration }),
        ...(workshopData.type && { type: workshopData.type })
      }
    });

    return updatedWorkshop;
  }

  /**
   * Xóa workshop
   */
  async deleteWorkshop(instructorId: string, workshopId: string): Promise<void> {
    // Kiểm tra workshop tồn tại và thuộc về instructor
    const existingWorkshop = await prisma.workshop.findFirst({
      where: {
        id: workshopId,
        instructorId: instructorId
      }
    });

    if (!existingWorkshop) {
      throw { status: 404, message: 'Không tìm thấy workshop hoặc bạn không có quyền xóa' };
    }

    // Xóa workshop và các bản ghi tham dự liên quan
    await withTransaction(async (tx) => {
      // Xóa tất cả bản ghi tham dự
      await tx.attendance.deleteMany({
        where: { workshopId }
      });

      // Xóa workshop
      await tx.workshop.delete({
        where: { id: workshopId }
      });
    });
  }

  /**
   * Đăng ký tham dự workshop
   */
  async registerWorkshop(userId: string, workshopId: string): Promise<Attendance> {
    // Kiểm tra workshop tồn tại
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });

    if (!workshop) {
      throw { status: 404, message: 'Không tìm thấy workshop' };
    }

    // Kiểm tra người dùng đã đăng ký chưa
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        workshopId
      }
    });

    if (existingAttendance) {
      throw { status: 400, message: 'Bạn đã đăng ký tham dự workshop này rồi' };
    }

    // Tạo bản ghi tham dự mới
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        workshopId
      }
    });

    return attendance;
  }

  /**
   * Hủy đăng ký tham dự workshop
   */
  async cancelRegistration(userId: string, workshopId: string): Promise<void> {
    // Kiểm tra bản ghi tham dự tồn tại
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        workshopId
      }
    });

    if (!attendance) {
      throw { status: 404, message: 'Bạn chưa đăng ký tham dự workshop này' };
    }

    // Xóa bản ghi tham dự
    await prisma.attendance.delete({
      where: {
        id: attendance.id
      }
    });
  }

  /**
   * Lấy danh sách workshop mà người dùng đã đăng ký
   */
  async getRegisteredWorkshops(userId: string) {
    const attendances = await prisma.attendance.findMany({
      where: { userId },
      include: {
        workshop: {
          include: {
            instructor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    return attendances.map(attendance => attendance.workshop);
  }
}
