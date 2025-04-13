import { Request, Response } from 'express';
import { CodingExerciseService } from '../services/coding-exercise.service';

export class CodingExerciseController {
    private codingExerciseService: CodingExerciseService;

    constructor() {
        this.codingExerciseService = new CodingExerciseService();
    }

    async getCodingExerciseById(req: Request, res: Response): Promise<void> {
        try {
            const { lessonId } = req.params;

            if (!lessonId) {
                res.status(400).json({ error: 'Lesson ID is required' });
                return;
            }

            const exercise = await this.codingExerciseService.getCodingExerciseByLessonId(lessonId);

            if (!exercise) {
                res.status(404).json({ error: 'Coding exercise not found' });
                return;
            }

            res.json({
                success: true,
                data: exercise
            });
        } catch (error) {
            console.error('Error in getCodingExerciseById controller:', error);
            res.status(500).json({
                success: false,
                error: `Server error: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async getAllCodingExercises(req: Request, res: Response): Promise<void> {
        try {
            const exercises = await this.codingExerciseService.getAllCodingExercises();

            res.json({
                success: true,
                data: exercises
            });
        } catch (error) {
            console.error('Error in getAllCodingExercises controller:', error);
            res.status(500).json({
                success: false,
                error: `Server error: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
} 