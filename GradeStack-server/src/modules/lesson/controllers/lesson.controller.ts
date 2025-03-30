import { Request, Response } from 'express';
import { LessonService } from '../services/lesson.service';
import { VideoLessonService } from '../../videoLesson/services/videoLesson.service';
import { LessonType } from '@prisma/client';

export class LessonController {
    private lessonService: LessonService;
    private videoLessonService: VideoLessonService;

    constructor() {
        this.lessonService = new LessonService();
        this.videoLessonService = new VideoLessonService();
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
     * Get all lessons for a module
     */
    public getLessons = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const lessons = await this.lessonService.getLessonsByModule(moduleId);
            res.status(200).json(lessons);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get a lesson by ID
     */
    public getLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const lesson = await this.lessonService.getLessonById(lessonId);
            res.status(200).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a lesson
     */
    public updateLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const lessonData = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }

            const lesson = await this.lessonService.updateLesson(lessonId, lessonData);
            res.status(200).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Delete a lesson
     */
    public deleteLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            await this.lessonService.deleteLesson(lessonId);
            res.status(204).send();
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a video lesson
     */
    public createVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const { lessonData, videoData } = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }
            
            if (!videoData?.url && !videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }
            
            // Normalize video data
            const normalizedVideoData = {
                url: videoData.url || videoData.videoUrl,
                thumbnailUrl: videoData.thumbnailUrl || null,
                duration: videoData.duration || null
            };
            
            const lesson = await this.lessonService.createVideoLesson(moduleId, lessonData, normalizedVideoData);
            res.status(201).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a video lesson
     */
    public updateVideoLesson = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const videoData = req.body;
            
            // Validate required fields
            if (!videoData?.url && !videoData?.videoUrl) {
                res.status(400).json({ message: 'Missing required video URL' });
                return;
            }

            // Normalize video data
            const normalizedVideoData = {
                url: videoData.url || videoData.videoUrl,
                thumbnailUrl: videoData.thumbnailUrl,
                duration: videoData.duration
            };
            
            const videoLesson = await this.videoLessonService.updateVideoLesson(lessonId, normalizedVideoData);
            res.status(200).json(videoLesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a coding exercise
     */
    public createCodingExercise = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const { lessonData, codingData } = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }
            
            if (!codingData?.language || !codingData?.problem || !codingData?.solution) {
                res.status(400).json({ message: 'Missing required coding exercise fields' });
                return;
            }
            
            const lesson = await this.lessonService.createCodingExercise(moduleId, lessonData, codingData);
            res.status(201).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a coding exercise
     */
    public updateCodingExercise = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const { lessonData, codingData } = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }
            
            if (!codingData?.language || !codingData?.problem || !codingData?.solution) {
                res.status(400).json({ message: 'Missing required coding exercise fields' });
                return;
            }
            
            const lesson = await this.lessonService.updateCodingExercise(lessonId, lessonData, codingData);
            res.status(200).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Create a final test
     */
    public createFinalTest = async (req: Request, res: Response): Promise<void> => {
        try {
            const { moduleId } = req.params;
            const { lessonData, testData } = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }
            
            if (!testData?.passingScore) {
                res.status(400).json({ message: 'Missing required final test fields' });
                return;
            }
            
            const lesson = await this.lessonService.createFinalTest(moduleId, lessonData, testData);
            res.status(201).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update a final test
     */
    public updateFinalTest = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            const { lessonData, testData } = req.body;
            
            // Validate required fields
            if (!lessonData?.title || !lessonData?.description) {
                res.status(400).json({ message: 'Missing required lesson fields' });
                return;
            }
            
            if (!testData?.passingScore) {
                res.status(400).json({ message: 'Missing required final test fields' });
                return;
            }
            
            const lesson = await this.lessonService.updateFinalTest(lessonId, lessonData, testData);
            res.status(200).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };
}
