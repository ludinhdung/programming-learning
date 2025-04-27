import { Request, Response, NextFunction } from "express";
import { SupporterService } from "../services/supporter.service";

export class SupporterController {
  private supporterService: SupporterService;

  constructor() {
    this.supporterService = new SupporterService();
  }

  async getAllInstructors(req: Request, res: Response, next: NextFunction) {
    try {
      const instructors = await this.supporterService.getAllInstructors();
      res.json({
        success: true,
        data: instructors,
      });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorById(req: Request, res: Response, next: NextFunction) {
    try {
      const instructor = await this.supporterService.getInstructorById(
        req.params.userId
      );
      res.json({
        success: true,
        data: instructor,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.supporterService.createInstructor(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { isBlocked } = req.body;
    try {
      const result = await this.supporterService.updateUserStatus(
        id,
        isBlocked
      );
      console.log(result);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.supporterService.deleteInstructor(
        req.params.id
      );
      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLearner(req: Request, res: Response, next: NextFunction) {
    try {
      const learners = await this.supporterService.getAllLearners();
      res.json({
        success: true,
        data: learners,
      });
    } catch (error) {
      next(error);
    }
  }

  async warningLearner(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const { warningContent } = req.body

      const learner = await this.supporterService.warningLearner(id, warningContent);
      res.status(201).json({
        success: true,
        data: {
          learnerId: id,
          warningContent,
          email: learner.email,
          warningCount: learner.warningCount,
          isBlocked: learner.isBlocked,
        },
        message: `Warning sent successfully to ${learner.email}`,
      });
    } catch (error) {
      next(error)
    }
  }

  async deleteLearner(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.supporterService.deleteLearners(req.params.id);
      res.status(201).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSupporterById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.supporterService.getSupporterById(req.params.id);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
