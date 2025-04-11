import { Request, Response } from 'express';
import { LearningPathService } from '../services/learningPath.service';
import { createLearningPathSchema, learningPathIdSchema, updateLearningPathCoursesSchema, updateLearningPathSchema } from '../validation/learningPath.validation';

export class LearningPathController {
    private learningPathService: LearningPathService;

    constructor() {
        this.learningPathService = new LearningPathService();
    }

    /**
     * Helper method to handle errors
     */
    private handleError(res: Response, error: any): void {
        console.error('Error:', error);
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ message });
    }

    /**
     * Create a new learning path
     */
    public createLearningPath = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Instructor ID
            const learningPathData = req.body;

            // Validate using Zod schema
            const validationResult = createLearningPathSchema.safeParse(learningPathData);
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            // Create learning path
            const learningPath = await this.learningPathService.createLearningPath(id, validationResult.data);
            res.status(201).json(learningPath);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get all learning paths for an instructor
     */
    public getLearningPaths = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Instructor ID
            const learningPaths = await this.learningPathService.getLearningPathsByInstructor(id);
            res.status(200).json(learningPaths);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get all learning paths (for public access)
     */
    public getAllLearningPaths = async (_req: Request, res: Response): Promise<void> => {
        try {
            const learningPaths = await this.learningPathService.getAllLearningPaths();
            res.status(200).json(learningPaths);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get a learning path by ID
     */
    public getLearningPath = async (req: Request, res: Response): Promise<void> => {
        try {
            const { learningPathId } = req.params;
            
            // Validate learning path ID
            const validationResult = learningPathIdSchema.safeParse({ learningPathId });
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            const learningPath = await this.learningPathService.getLearningPathById(learningPathId);
            res.status(200).json(learningPath);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a learning path
     */
    public updateLearningPath = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, learningPathId } = req.params;
            const learningPathData = req.body;
            
            // Validate learning path ID
            const idValidationResult = learningPathIdSchema.safeParse({ learningPathId });
            if (!idValidationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: idValidationResult.error.format() 
                });
                return;
            }
            
            // Validate update data
            const dataValidationResult = updateLearningPathSchema.safeParse(learningPathData);
            if (!dataValidationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: dataValidationResult.error.format() 
                });
                return;
            }

            const learningPath = await this.learningPathService.updateLearningPath(
                id, 
                learningPathId, 
                dataValidationResult.data
            );
            res.status(200).json(learningPath);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update the order of courses in a learning path
     */
    public updateCoursesOrder = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, learningPathId } = req.params;
            const coursesOrderData = req.body;
            
            // Validate learning path ID
            const idValidationResult = learningPathIdSchema.safeParse({ learningPathId });
            if (!idValidationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: idValidationResult.error.format() 
                });
                return;
            }
            
            // Validate courses order data
            const dataValidationResult = updateLearningPathCoursesSchema.safeParse(coursesOrderData);
            if (!dataValidationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: dataValidationResult.error.format() 
                });
                return;
            }

            const learningPath = await this.learningPathService.updateCoursesOrder(
                id, 
                learningPathId, 
                dataValidationResult.data.courses
            );
            res.status(200).json(learningPath);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Delete a learning path
     */
    public deleteLearningPath = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, learningPathId } = req.params;
            
            // Validate learning path ID
            const validationResult = learningPathIdSchema.safeParse({ learningPathId });
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            await this.learningPathService.deleteLearningPath(id, learningPathId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };
}
