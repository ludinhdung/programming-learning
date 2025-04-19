/**
 * Service quản trị viên hệ thống.
 * Xử lý logic lấy số liệu dashboard cho admin.
 * @module AdminService
 */
import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = new PrismaClient();

export class AdminService {
  /**
   * Lấy tổng quan dashboard cho admin
   * @returns Thông tin tổng quan: tổng doanh thu, số lượng người dùng, số lượng khoá học, ...
   */
  static async getDashboardOverview(): Promise<DashboardOverview> {
    // Đếm số lượng người dùng
    const totalUsers: number = await prisma.user.count();
    // Đếm số lượng instructor
    const totalInstructors: number = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });
    // Đếm số lượng supporter
    const totalSupporters: number = await prisma.user.count({ where: { role: 'SUPPORTER' } });
    // Đếm số lượng learner
    const totalLearners: number = await prisma.user.count({ where: { role: 'LEARNER' } });
    // Đếm số lượng khoá học
    const totalCourses: number = await prisma.course.count();
    // Tổng doanh thu (giả định có bảng transaction)
    // Lấy tổng doanh thu, chuyển Decimal về number nếu có
    const totalRevenueRaw = await prisma.transaction.aggregate({ _sum: { amount: true } });
    const totalRevenue: number = totalRevenueRaw._sum.amount ? (typeof totalRevenueRaw._sum.amount === 'object' && 'toNumber' in totalRevenueRaw._sum.amount ? totalRevenueRaw._sum.amount.toNumber() : totalRevenueRaw._sum.amount) : 0;
    // Doanh thu tháng này
    const now: Date = new Date();
    const startOfMonth: Date = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenueRaw = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: startOfMonth } }
    });
    const monthlyRevenue: number = monthlyRevenueRaw._sum.amount ? (typeof monthlyRevenueRaw._sum.amount === 'object' && 'toNumber' in monthlyRevenueRaw._sum.amount ? monthlyRevenueRaw._sum.amount.toNumber() : monthlyRevenueRaw._sum.amount) : 0;
    // Thanh toán chờ xử lý
    const pendingPayments: number = await prisma.transaction.count({ where: { status: 'PENDING' } });
    // Giao dịch trung bình
    const totalTransactions: number = await prisma.transaction.count();
    const averageTransaction: number = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
    return {
      totalUsers,
      totalInstructors,
      totalSupporters,
      totalLearners,
      totalCourses,
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      averageTransaction
    };
  }
}

/**
 * Kiểu dữ liệu tổng quan dashboard
 */
export interface DashboardOverview {
  totalUsers: number;
  totalInstructors: number;
  totalSupporters: number;
  totalLearners: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  averageTransaction: number;
}
