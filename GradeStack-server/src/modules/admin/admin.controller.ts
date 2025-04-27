import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';
import { AppError } from '../../shared/middleware/error.middleware';

const adminService = new AdminService();

export class AdminController {
  async getAllTransactions(req: Request, res: Response) {
    try {
      const transactions = await adminService.getAllTransactions();
      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const transaction = await adminService.getTransactionById(id);
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }

  async updateTransactionStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        throw new AppError("Invalid status", 400);
      }

      const transaction = await adminService.updateTransactionStatus(
        id,
        status
      );
      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }

  async createSupporterAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await adminService.createSupporterAccount(req.body);
      res.status(201).json({
        success: true,
        data: result,
        message: "Supporter account created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSupporters(req: Request, res: Response, next: NextFunction) {
    try {
      const supporters = await adminService.getAllSupporters();
      res.json({
        success: true,
        data: supporters,
      });
    } catch (error) {
      next(error);
    }
  }
    
  async getSupporterById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supporter = await adminService.getSupporterById(id);
      res.json({
        success: true,
        data: supporter,
      });
    } catch (error) {
      next(error);
    }
  }
  
  async updateSupporterStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isBlocked } = req.body;
      const updatedSupporter = await adminService.updateSupporterStatus(id, isBlocked);
      res.json({
        success: true,
        data: updatedSupporter,
        message: "Supporter status updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupporter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await adminService.deleteSupporter(id); 
      res.json({
        success: true,
        message: "Supporter deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
