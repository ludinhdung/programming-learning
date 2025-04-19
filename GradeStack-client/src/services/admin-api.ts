/**
 * API cho dashboard admin
 * Tác giả: AI hỗ trợ
 */
import api from './api';

/**
 * Kiểu dữ liệu tổng quan dashboard trả về từ backend
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
  activeStudents: number;
  averageRating: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  userDistribution: Array<{ name: string; value: number }>;
}

/**
 * Lấy tổng quan dashboard admin
 * @returns Promise<DashboardOverview>
 */
export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  try {
    console.log('Gọi API lấy dữ liệu dashboard admin...');
    const res = await api.get('/admin/dashboard-overview');
    console.log('Phản hồi API dashboard:', res);
    
    // Kiểm tra cấu trúc phản hồi
    if (res.data.data) {
      return res.data.data;
    }
    return res.data;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    throw error;
  }
};
