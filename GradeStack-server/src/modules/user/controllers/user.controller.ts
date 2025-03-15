import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const UserController = {
    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await userService.getById(id);
            res.json({
                success: true,
                data: user
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    }
};