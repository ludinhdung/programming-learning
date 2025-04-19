/**
 * Controller quản trị viên hệ thống.
 * Cung cấp các API cho dashboard admin: tổng doanh thu, số lượng người dùng, khoá học, v.v.
 * @module AdminController
 */
import { Request, Response } from 'express';
import { AdminService } from './admin.service';

/**
 * Lấy tổng quan dashboard cho admin
 * @param req Request
 * @param res Response
 */
export const getDashboardOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const overview = await AdminService.getDashboardOverview();
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy dữ liệu dashboard', error: err });
  }
};
