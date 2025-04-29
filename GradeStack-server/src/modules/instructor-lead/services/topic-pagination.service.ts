import { PrismaClient } from '@prisma/client';

/**
 * Service xử lý phân trang cho Topics
 */
export class TopicPaginationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Lấy danh sách topics với phân trang
   * @param page Trang hiện tại
   * @param limit Số lượng items trên mỗi trang
   * @returns Danh sách topics và thông tin phân trang
   */
  public async getTopicsWithPagination(page: number = 1, limit: number = 5): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      console.log(`getTopicsWithPagination - Đang lấy topics với page=${page}, limit=${limit}`);
      
      // Tính toán số lượng bản ghi cần bỏ qua
      const skip = (page - 1) * limit;
      
      // Đếm tổng số topics
      const totalTopics = await this.prisma.topic.count();
      
      // Lấy danh sách topics với phân trang
      const topics = await this.prisma.topic.findMany({
        skip,
        take: limit,
        include: {
          Instructor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              courses: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc' // Sắp xếp theo thời gian tạo mới nhất
        }
      });

      console.log(`getTopicsWithPagination - Đã tìm thấy ${topics.length}/${totalTopics} topics (trang ${page}/${Math.ceil(totalTopics/limit)})`);
      
      // Nếu không có topics, trả về mảng rỗng thay vì null
      if (!topics || topics.length === 0) {
        console.log('getTopicsWithPagination - Không tìm thấy topics, trả về mảng rỗng');
        return {
          data: [],
          total: totalTopics,
          page,
          limit
        };
      }
      
      return {
        data: topics,
        total: totalTopics,
        page,
        limit
      };
    } catch (error) {
      console.error('getTopicsWithPagination - Lỗi:', error);
      // Trả về mảng rỗng thay vì ném lỗi
      return {
        data: [],
        total: 0,
        page,
        limit
      };
    }
  }
}
