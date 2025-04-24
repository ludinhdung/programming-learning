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

    async getUserPurchaseHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const purchaseHistory = await this.userService.getUserPurchaseHistory(req.params.id);
            res.json({ success: true, data: purchaseHistory });
        } catch (error) {
            next(error);
        }
    }

    async getUserEnrolledCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const enrolledCourses = await this.userService.getUserEnrolledCourses(req.params.id);
            res.json({ success: true, data: enrolledCourses });
        } catch (error) {
            next(error);
        }
    }

    async getUserBookmarkCourses(req: Request, res: Response, next: NextFunction) {
        try {
            const bookmarkedCourses = await this.userService.getUserBookmarks(req.params.id);
            res.json({ success: true, data: bookmarkedCourses });
        } catch (error) {
            next(error);
        }
    }

    async addBookmark(req: Request, res: Response, next: NextFunction) {
        try {
            await this.userService.addBookmark(req.params.id, req.params.courseId);
            res.json({ success: true, message: 'Bookmark added successfully' });
        } catch (error) {
            next(error);
        }
    }

    async removeBookmark(req: Request, res: Response, next: NextFunction) {
        try {
            await this.userService.removeBookmark(req.params.id, req.params.courseId);
            res.json({ success: true, message: 'Bookmark removed successfully' });
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {
        try {
            // Assuming userId is available from auth middleware (e.g., req.user.id)
            // If not, adjust where userId comes from (e.g., req.params.id if it's an admin changing another user's password)
            const userId = (req as any).user?.id; // Adjust this based on your auth setup
            if (!userId) {
                 res.status(401).json({ success: false, message: 'Unauthorized' });
                 return; // Exit after sending response
            }

            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                 res.status(400).json({ success: false, message: 'Old password and new password are required' });
                 return; // Exit after sending response
            }

            const result = await this.userService.changePassword(userId, oldPassword, newPassword);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // forgot password
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                })
            }
            const result = await this.userService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: "Verification code sent to email"
            });

        } catch (error) {
            next(error);
        }
    }

    async verifyResetCode(req: Request, res: Response, next: NextFunction) { 
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({
                    success: false,
                    message: "Email and code are required"
                })
            }

            const result = await this.userService.verifyResetCode(email, code);
            res.status(200).json({
                success: true,
                message: "Verification code verified successfully"
            });

        } catch (error) {
            next(error)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, newPassword } = req.body;
            if (!email || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Email and new password are required"
                })
            }

            const result = await this.userService.resetPassword(email, newPassword);
            res.status(200).json({
                success: true,
                message: "Password reset successfully"
            });

        } catch (error) {
            next(error);
        }
    }
}
