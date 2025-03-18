import { Request, Response } from 'express';
import { InstructorService } from './../services/instructor.service';
import { Role, Prisma, LessonType, SupportedLanguage } from '@prisma/client';
import { CourseCreateDTO } from '../dto/CourseCreateDTO';
export class InstructorController {
    private instructorService: InstructorService;

    constructor() {
        this.instructorService = new InstructorService();
    }

    /**
     *    Helper method to handle errors
     */
    private handleError(res: Response, error: any): void {
        console.error('Error:', error);
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ message });
    }

    /**
     * Create a new instructor
     */
    public createInstructor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userData, instructorData } = req.body;
            // Validate required fields
            if (    
                    !userData?.email        || 
                    !userData?.password     || 
                    !userData?.firstName    ||
                    !userData?.lastName
            ) {
                res.status(400).json({ message: 'Missing required user fields' });
                return;
            }
            const instructor = await this.instructorService.createInstructor(userData, instructorData);
            res.status(201).json(instructor);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Get instructor by ID
     */
    public getInstructor = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const instructor = await this.instructorService.findByUserId(id);
            res.status(200).json(instructor);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update instructor profile
     */
    public updateProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const data = req.body;
            const instructor = await this.instructorService.updateProfile(id, data);
            res.status(200).json(instructor);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     * Update instructor avatar
     */
    public updateAvatar = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { avatarUrl } = req.body;

            if (!avatarUrl) {
                res.status(400).json({ message: 'Avatar URL is required' });
                return;
            }

            const instructor = await this.instructorService.updateAvatar(id, avatarUrl);
            res.status(200).json(instructor);
        } catch (error) {
        this.handleError(res, error);
        }
    };

    /**
     * Create a new course
     */
    public createCourse = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Instructor ID
            const courseData: CourseCreateDTO = req.body;

            // Validate required fields
            if (!courseData?.title || !courseData?.description) {
                res.status(400).json({ message: 'Missing required course fields' });
                return;
            }

            // Validate modules if provided
            if (courseData.modules && courseData.modules.length > 0) {
                for (const module of courseData.modules) {
                    if (!module.title || !module.description) {
                        res.status(400).json({ message: 'Missing required module fields' });
                        return;
                    }

                    // Validate lessons if provided
                    if (module.lessons && module.lessons.length > 0) {
                        for (const lesson of module.lessons) {
                            if (!lesson.title || !lesson.description || !lesson.lessonType) {
                                res.status(400).json({ message: 'Missing required lesson fields' });
                                return;
                            }

                            // Validate specific lesson types
                            switch (lesson.lessonType) {
                                case LessonType.VIDEO:
                                    if (
                                        !lesson.videoData?.url || 
                                        !lesson.videoData?.duration
                                    ) {
                                        res.status(400).json({ message: 'Missing required video lesson fields' });
                                        return;
                                    }
                                    break;
                                case LessonType.CODING:
                                    if (!lesson.codingData?.language    || 
                                        !lesson.codingData?.problem     || 
                                        !lesson.codingData?.solution
                                    ) {
                                        res.status(400).json({ message: 'Missing required coding exercise fields' });
                                        return;
                                    }
                                    break;
                                case LessonType.FINAL_TEST:
                                    if (!lesson.finalTestData?.questions || lesson.finalTestData.questions.length === 0) {
                                        res.status(400).json({ message: 'Final test must have at least one question' });
                                        return;
                                    }
                                    
                                    // Validate questions and answers
                                    for (const question of lesson.finalTestData.questions) {
                                        if (!question.content) {
                                            res.status(400).json({ message: 'Missing question content' });
                                            return;
                                        }
                                        
                                        if (!question.answers || question.answers.length === 0) {
                                            res.status(400).json({ message: 'Each question must have at least one answer' });
                                            return;
                                        }
                                        
                                        // Check if at least one answer is correct
                                        const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
                                        if (!hasCorrectAnswer) {
                                            res.status(400).json({ message: 'Each question must have at least one correct answer' });
                                            return;
                                        }
                                    }
                                    break;
                            }
                        }
                    }
                }
            }

            const course = await this.instructorService.createCourse(id, courseData);
            res.status(201).json(course);
        } catch (error) {
            this.handleError(res, error);
        }
    };
    
    /**
     * Create a new workshop
     */
    public createWorkshop = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const workshopData = req.body;

            // Validate required fields
            if (!workshopData?.title || !workshopData?.description || !workshopData?.scheduledAt || !workshopData?.duration) { 
                res.status(400).json({ message: 'Missing required workshop fields' });
                return;
            }

            const workshop = await this.instructorService.createWorkshop(id, workshopData);
            res.status(201).json(workshop);
        } catch (error) {
        this.handleError(res, error);
        }
    };

    // /**
    //  * Get all instructors (with optional filtering)
    //  */
    public getAllInstructors = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            
            // Calculate skip based on page and limit
            const skip = (page - 1) * limit;
            
            // Extract filters from query params (excluding page and limit)
            const { page: _, limit: __, ...filters } = req.query;
            
            const instructors = await this.instructorService.findAll({
                skip,
                take: limit,
                where: filters
            });
        
            res.status(200).json(instructors);
        } catch (error) {
            this.handleError(res, error);
        }
    };

    /**
     *  Get all all topic by instructor ID
     */
    public createTopic = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const topicData = req.body;
            // Validate required fields
            if (
                !topicData?.name || 
                !topicData?.thumbnail ||
                !topicData?.description
            ) {
                res.status(400).json({ 
                    message: 'Missing required topic fields' 
                });
                return;
            }
            
            const topic = await this.instructorService.createTopic(id, topicData);
            res.status(201).json(topic);
        } catch (error) {
            this.handleError(res, error);
        }
    }
}