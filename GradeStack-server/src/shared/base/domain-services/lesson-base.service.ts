import { BaseService } from '../base.service';
import { Lesson, Prisma, LessonType, VideoLesson, CodingExercise, FinalTestLesson } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type LessonWithRelations = Lesson & {
    module?: any;
    videoLesson?: VideoLesson;
    codingExercise?: CodingExercise;
    finalTestLesson?: FinalTestLesson & {
        questions?: any[];
    };
    notes?: any[];
    comments?: any[];
};

export abstract class LessonBaseService<
    T = LessonWithRelations, 
    C = Prisma.LessonCreateInput, 
    U = Prisma.LessonUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // Lesson-specific common methods
    async findByModuleId(moduleId: string): Promise<T[]> {
        return this.model.findMany({
            where: { moduleId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async findWithModule(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: lessonId },
            include: { 
                module: true
            }
        });
    }

    async findWithRelatedContent(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: lessonId },
            include: {
                videoLesson: true,
                codingExercise: true,
                finalTestLesson: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                answers: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findWithNotes(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: lessonId },
            include: { 
                notes: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
    }

    async findWithComments(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: lessonId },
            include: { 
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: true,
                        replies: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findComplete(lessonId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: lessonId },
            include: { 
                module: {
                    include: {
                        course: {
                            include: {
                                instructor: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                },
                videoLesson: true,
                codingExercise: true,
                finalTestLesson: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                answers: true
                            }
                        }
                    }
                },
                notes: true,
                comments: {
                    include: {
                        user: true,
                        replies: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
    }
}
