import { BaseService } from '../base.service';
import { Module, Prisma } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ModuleWithRelations = Module & {
    course?: any;
    lessons?: any[];
};

export abstract class ModuleBaseService<
    T = ModuleWithRelations, 
    C = Prisma.ModuleCreateInput, 
    U = Prisma.ModuleUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // Module-specific common methods
    async findByCourseId(courseId: string): Promise<T[]> {
        return this.model.findMany({
            where: { courseId },
            orderBy: { order: 'asc' }
        });
    }

    async findWithCourse(moduleId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: moduleId },
            include: { 
                course: true
            }
        });
    }

    async findWithLessons(moduleId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
    }

    async findWithFullRelations(moduleId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: moduleId },
            include: {
                course: true,
                lessons: {
                    orderBy: { createdAt: 'asc' },
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
                }
            }
        });
    }

    // Module-specific operations
    async updateModuleOrder(moduleId: string, newOrder: number): Promise<T> {
        return this.update(moduleId, { order: newOrder } as unknown as U);
    }

    async updateModuleVideo(moduleId: string, videoData: {
        videoUrl: string;
        thumbnailUrl?: string | null;
        videoDuration?: number | null;
    }): Promise<T> {
        return this.update(moduleId, {
            videoUrl: videoData.videoUrl,
            thumbnailUrl: videoData.thumbnailUrl,
            videoDuration: videoData.videoDuration
        } as unknown as U);
    }

    // Override base methods if needed
    protected override beforeCreate(data: C): C {
        // Any pre-processing logic before creating a module
        return data;
    }

    protected override afterCreate(result: T): T {
        // Any post-processing logic after creating a module
        return result;
    }

    protected override beforeUpdate(id: string, data: U): U {
        // Any pre-processing logic before updating a module
        return data;
    }

    protected override afterUpdate(result: T): T {
        // Any post-processing logic after updating a module
        return result;
    }
}
