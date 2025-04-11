import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";

export const verifyUserOwnership = (req: Request, res: Response, next: NextFunction) => {
    const loggedInUserId = req.user?.id;

    const targetUserId = req.params.id;

    if (loggedInUserId !== targetUserId) {
        throw new AppError('Unauthorized', 403);
    }

    next();
};


