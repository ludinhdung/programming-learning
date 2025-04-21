import { Request, Response, NextFunction } from "express";
import { FinalTestService } from "../services/final_test.service";

export class FinalTestController {
  private finalTestService: FinalTestService;

  constructor() {
    this.finalTestService = new FinalTestService();
  }

  async checkFinalTestSubmission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { learnerId, lessonId } = req.params;
      const result = await this.finalTestService.checkFinalTestSubmission(
        learnerId,
        lessonId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinalTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { learnerId, finalTestId } = req.params;
      const { score } = req.body;

      const result = await this.finalTestService.submitFinalTest(
        learnerId,
        finalTestId,
        score
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFinalTestsByLearnerId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { learnerId } = req.params;
      const submissions = await this.finalTestService.getFinalTestsByLearnerId(
        learnerId
      );

      res.status(200).json({
        success: true,
        data: submissions,
      });
    } catch (error) {
      next(error);
    }
  }
}
