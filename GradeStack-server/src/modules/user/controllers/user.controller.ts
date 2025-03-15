import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export const UserController = {
    getAllUser: async (req: Request, res: Response) => {
        try {
            const users = await userService.getAllUsers();
            res.json({
                success: true,
                data: users
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            });
        }
    },
    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
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
    },
    create: async (req: Request, res: Response) => {
        try {
            const user = await userService.createUser({
                email: "phuduong200@gmail.com",
                password: "123123",
                firstName: "Phu",
                lastName: "Duong"
            });
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

