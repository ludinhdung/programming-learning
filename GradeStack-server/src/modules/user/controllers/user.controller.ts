import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAllUsers();
            res.json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.getUserById(req.params.id);
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async changeUserStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.changeUserStatus(
                req.params.id,
                req.body
            );
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }
}

