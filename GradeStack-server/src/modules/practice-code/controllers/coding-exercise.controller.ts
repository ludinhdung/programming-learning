import { Request, Response } from 'express';
import { CodingExerciseService } from '../services/coding-exercise.service';
import { CodingSubmissionService } from '../services/coding-submission.service';

export class CodingExerciseController {
    private codingExerciseService: CodingExerciseService;
    private codingSubmissionService: CodingSubmissionService;

    constructor() {
        this.codingExerciseService = new CodingExerciseService();
        this.codingSubmissionService = new CodingSubmissionService();
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

    async submitCode(req: Request, res: Response): Promise<void> {
        try {
            const { lessonId, submittedCode } = req.body;
            const learnerId = req.user?.id; // Assuming user ID is available in the request

            if (!learnerId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!lessonId || !submittedCode) {
                res.status(400).json({ error: 'Lesson ID and submitted code are required' });
                return;
            }

            const submission = await this.codingSubmissionService.submitCode(
                learnerId,
                lessonId,
                submittedCode
            );

            res.json({
                success: true,
                data: submission
            });
        } catch (error) {
            console.error('Error in submitCode controller:', error);
            res.status(500).json({
                success: false,
                error: `Server error: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async getSubmission(req: Request, res: Response): Promise<void> {
        try {
            const { lessonId } = req.params;
            const learnerId = req.user?.id;

            if (!learnerId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            if (!lessonId) {
                res.status(400).json({ error: 'Lesson ID is required' });
                return;
            }

            const submission = await this.codingSubmissionService.getSubmission(
                learnerId,
                lessonId
            );

            if (!submission) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }

            res.json({
                success: true,
                data: submission
            });
        } catch (error) {
            console.error('Error in getSubmission controller:', error);
            res.status(500).json({
                success: false,
                error: `Server error: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }

    async getAllSubmissionsByExercise(req: Request, res: Response): Promise<void> {
        try {
            const { lessonId } = req.params;

            if (!lessonId) {
                res.status(400).json({ error: 'Lesson ID is required' });
                return;
            }

            const submissions = await this.codingSubmissionService.getAllSubmissionsByExercise(
                lessonId
            );

            res.json({
                success: true,
                data: submissions
            });
        } catch (error) {
            console.error('Error in getAllSubmissionsByExercise controller:', error);
            res.status(500).json({
                success: false,
                error: `Server error: ${error instanceof Error ? error.message : String(error)}`
            });
        }
    }
} 