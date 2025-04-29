import { Request, Response } from 'express';
import { ModuleService } from '../services/module.service';
import { createModuleSchema, updateModuleSchema } from '../validation/module.validation';

export class ModuleController {
    private moduleService: ModuleService;

    constructor() {
        this.moduleService = new ModuleService();
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
     * Get all modules for a course
     */
    public getModules = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params;
            const modules = await this.moduleService.getModulesByCourse(courseId);
            res.status(200).json(modules);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get a module by ID
     */
    public getModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const module = await this.moduleService.getModuleById(moduleId);
            res.status(200).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a new module
     */
    public createModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { courseId } = req.params;
            const moduleData = req.body;
            
            // Validate using Zod schema
            const validationResult = createModuleSchema.safeParse(moduleData);
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            const module = await this.moduleService.createModule(courseId, validationResult.data);
            res.status(201).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a module
     */
    public updateModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const moduleData = req.body;
            
            // Validate using Zod schema
            const validationResult = updateModuleSchema.safeParse(moduleData);
            if (!validationResult.success) {
                res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationResult.error.format() 
                });
                return;
            }

            const module = await this.moduleService.updateModule(moduleId, validationResult.data);
            res.status(200).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Delete a module
     */
    public deleteModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            await this.moduleService.deleteModule(moduleId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update module video information
     */
    public updateModuleVideo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const videoData = req.body;
            
            // Validate required fields
            if (!videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }

            const module = await this.moduleService.updateModuleVideo(moduleId, videoData);
            res.status(200).json(module);
        } catch (error) {
            this.handleError(res, error);
        }
    };
}