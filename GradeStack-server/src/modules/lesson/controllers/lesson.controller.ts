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

            // Ensure estimatedDuration is included if provided
            if (testData.estimatedDuration !== undefined && 
                (isNaN(testData.estimatedDuration) || testData.estimatedDuration <= 0)) {
                res.status(400).json({ message: 'Estimated duration must be a positive number' });
                return;
            }

            // Validate questions array if provided
            if (testData.questions && !Array.isArray(testData.questions)) {
                res.status(400).json({ message: 'Questions must be an array' });
                return;
            }

            // Validate each question in the array
            if (testData.questions && testData.questions.length > 0) {
                for (let i = 0; i < testData.questions.length; i++) {
                    const question = testData.questions[i];
                    
                    if (!question.content) {
                        res.status(400).json({ message: `Question at index ${i} is missing content` });
                        return;
                    }
                    
                    if (!question.answers || !Array.isArray(question.answers) || question.answers.length === 0) {
                        res.status(400).json({ message: `Question at index ${i} must have at least one answer` });
                        return;
                    }
                    
                    // Check if at least one answer is marked as correct
                    const hasCorrectAnswer = question.answers.some((answer: { isCorrect: boolean }) => answer.isCorrect);
                    if (!hasCorrectAnswer) {
                        res.status(400).json({ message: `Question at index ${i} must have at least one correct answer` });
                        return;
                    }
                }
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

            // Ensure estimatedDuration is included if provided
            if (testData.estimatedDuration !== undefined && 
                (isNaN(testData.estimatedDuration) || testData.estimatedDuration <= 0)) {
                res.status(400).json({ message: 'Estimated duration must be a positive number' });
                return;
            }

            // Validate questions array if provided
            if (testData.questions && !Array.isArray(testData.questions)) {
                res.status(400).json({ message: 'Questions must be an array' });
                return;
            }

            // Validate each question in the array
            if (testData.questions && testData.questions.length > 0) {
                for (let i = 0; i < testData.questions.length; i++) {
                    const question = testData.questions[i];
                    
                    if (!question.content) {
                        res.status(400).json({ message: `Question at index ${i} is missing content` });
                        return;
                    }
                    
                    if (!question.answers || !Array.isArray(question.answers) || question.answers.length === 0) {
                        res.status(400).json({ message: `Question at index ${i} must have at least one answer` });
                        return;
                    }
                    
                    // Check if at least one answer is marked as correct
                    const hasCorrectAnswer = question.answers.some((answer: { isCorrect: boolean }) => answer.isCorrect);
                    if (!hasCorrectAnswer) {
                        res.status(400).json({ message: `Question at index ${i} must have at least one correct answer` });
                        return;
                    }
                }
            }
            
            const lesson = await this.lessonService.updateFinalTest(lessonId, lessonData, testData);
            res.status(200).json(lesson);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get a final test by lesson ID
     */
    public getFinalTest = async (req: Request, res: Response): Promise<void> => {
        try {
            const { lessonId } = req.params;
            
            console.log(`Getting final test for lesson ID: ${lessonId}`);
            
            // First check if the lesson exists
            const lessonExists = await this.lessonService.findOne(lessonId);
            
            if (!lessonExists) {
                console.log(`Lesson with ID ${lessonId} not found`);
                res.status(404).json({ message: `Lesson with id ${lessonId} not found` });
                return;
            }
            
            console.log(`Lesson found with type: ${lessonExists.lessonType}`);
            
            // Check if it's a final test
            if (lessonExists.lessonType !== 'FINAL_TEST') {
                console.log(`Lesson with ID ${lessonId} is not a final test (type: ${lessonExists.lessonType})`);
                res.status(400).json({ message: `Lesson with id ${lessonId} is not a final test` });
                return;
            }
            
            // Get the lesson with final test data using findWithRelatedContent instead
            const lesson = await this.lessonService.findWithRelatedContent(lessonId);
            
            if (!lesson) {
                console.log(`Lesson with ID ${lessonId} not found in second query`);
                res.status(404).json({ message: `Lesson with id ${lessonId} not found` });
                return;
            }
            
            console.log(`Final test data: ${lesson.finalTest ? 'Found' : 'Not found'}`);
            
            if (!lesson.finalTest) {
                console.log(`Final test for lesson ${lessonId} not found`);
                res.status(404).json({ message: `Final test for lesson ${lessonId} not found` });
                return;
            }
            
            res.status(200).json(lesson);
        } catch (error) {
            console.error('Error in getFinalTest:', error);
            this.handleError(res, error);
        }
    };
}
