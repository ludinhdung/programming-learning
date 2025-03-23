import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';

export class CourseController {
    private courseService: CourseService;

    constructor() {
        this.courseService = new CourseService();
    }

    async getCourses(req: Request, res: Response): Promise<void> {
        try {
            const {
                topicId,
                instructorId,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                order = 'desc'
            } = req.query;

            const courses = await this.courseService.findCourses({
                topicId: topicId as string,
                instructorId: instructorId as string,
                page: Number(page),
                limit: Number(limit),
                sortBy: sortBy as string,
                order: order as 'asc' | 'desc'
            });

            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({
                message: 'Failed to retrieve courses',
                error: (error as Error).message
            });
        }
    }
} 