import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UpdateProfileDTO } from '../types/user.types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const profile = await this.userService.getProfile(userId);
      res.json(profile);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data: UpdateProfileDTO = req.body;
      const profile = await this.userService.updateProfile(userId, data);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
