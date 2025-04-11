import { Module, Prisma, PrismaClient, Lesson } from '@prisma/client';
import { ModuleBaseService, ModuleWithRelations } from '../../../shared/base/domain-services/module-base.service';
import { withTransaction } from '../../../shared/utils/transaction.utils';

const prisma = new PrismaClient();

export class ModuleService extends ModuleBaseService {
    protected get model() {
        return prisma.module;
    }

    protected getModelName(): string {
        return 'Module';
    }

    /**
     * Get all modules for a course
     */
    async getModulesByCourse(courseId: string): Promise<ModuleWithRelations[]> {
        return prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: {
                lessons: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        video: true,
                        coding: true,
                        finalTest: true
                    }
                }
            }
        });
    }

    /**
     * Get a module by ID
     */
    async getModuleById(moduleId: string): Promise<ModuleWithRelations | null> {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        video: true,
                        coding: true,
                        finalTest: {
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
        
        if (!module) {
            throw { status: 404, message: `Module with id ${moduleId} not found` };
        }
        
        return module;
    }

    /**
     * Create a new module
     */
    async createModule(courseId: string, moduleData: any): Promise<Module> {
        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });
        
        if (!course) {
            throw { status: 404, message: `Course with id ${courseId} not found` };
        }
        
        // Get the current highest order value
        const highestOrderModule = await prisma.module.findFirst({
            where: { courseId },
            orderBy: { order: 'desc' }
        });
        
        const newOrder = highestOrderModule ? highestOrderModule.order + 1 : 1;
        
        // Create the module with video information if provided
        return withTransaction(async (tx) => {
            return tx.module.create({
                data: {
                    title: moduleData.title,
                    description: moduleData.description,
                    order: moduleData.order || newOrder,
                    videoUrl: moduleData.videoUrl || null,
                    thumbnailUrl: moduleData.thumbnailUrl || null,
                    videoDuration: moduleData.videoDuration || null,
                    course: {
                        connect: { id: courseId }
                    }
                }
            });
        });
    }

    /**
     * Update a module
     */
    async updateModule(moduleId: string, moduleData: Omit<Prisma.ModuleUpdateInput, 'course'>): Promise<Module> {
        // Verify module exists
        await this.findOneOrFail(moduleId);
        
        // Update the module
        return withTransaction(async (tx) => {
            return tx.module.update({
                where: { id: moduleId },
                data: moduleData
            });
        });
    }

    /**
     * Delete a module and all associated lessons
     */
    async deleteModule(moduleId: string): Promise<void> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: { 
                lessons: {
                    include: {
                        video: true,
                        coding: true,
                        finalTest: {
                            include: {
                                questions: {
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
        
        if (!module) {
            throw { status: 404, message: `Module with id ${moduleId} not found` };
        }
        
        // Delete all lessons associated with this module
        if (module.lessons && module.lessons.length > 0) {
            return withTransaction(async (tx) => {
                for (const lesson of module.lessons) {
                    // Delete related records based on lesson type
                    await this.deleteLessonRelatedRecords(tx, lesson);
                    
                    // Delete the lesson itself
                    await tx.lesson.delete({
                        where: { id: lesson.id }
                    });
                }
                
                // Delete the module
                await tx.module.delete({
                    where: { id: moduleId }
                });
            });
        } else {
            // If no lessons, just delete the module
            return withTransaction(async (tx) => {
                await tx.module.delete({
                    where: { id: moduleId }
                });
            });
        }
    }
    
    /**
     * Helper method to delete records related to a lesson
     * This is used during module deletion
     */
    private async deleteLessonRelatedRecords(tx: any, lesson: Lesson & { 
        video?: any; 
        coding?: any; 
        finalTest?: any 
    }): Promise<void> {
        // Delete related records based on lesson type
        switch (lesson.lessonType) {
            case 'VIDEO':
                if (lesson.video) {
                    await tx.videoLesson.delete({
                        where: { id: lesson.video.id }
                    });
                }
                break;
                
            case 'CODING':
                if (lesson.coding) {
                    // Delete submitted exercises
                    await tx.submittedCodingExercise.deleteMany({
                        where: { codingExerciseId: lesson.coding.id }
                    });
                    
                    // Delete coding exercise
                    await tx.codingExercise.delete({
                        where: { id: lesson.coding.id }
                    });
                }
                break;
                
            case 'FINAL_TEST':
                if (lesson.finalTest) {
                    // Delete submitted tests
                    await tx.submittedFinalTest.deleteMany({
                        where: { finalTestId: lesson.finalTest.id }
                    });
                    
                    // Delete answers for all questions
                    for (const question of lesson.finalTest.questions) {
                        await tx.answer.deleteMany({
                            where: { questionId: question.id }
                        });
                    }
                    
                    // Delete questions
                    await tx.question.deleteMany({
                        where: { testId: lesson.finalTest.id }
                    });
                    
                    // Delete final test
                    await tx.finalTestLesson.delete({
                        where: { lessonId: lesson.id }
                    });
                }
                break;
        }
        
        // Delete notes and comments
        await tx.note.deleteMany({
            where: { lessonId: lesson.id }
        });
        
        await tx.comment.deleteMany({
            where: { lessonId: lesson.id }
        });
    }

    /**
     * Reorder modules within a course
     */
    async reorderModules(courseId: string, moduleOrders: { id: string, order: number }[]): Promise<Module[]> {
        // Verify course exists
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });
        
        if (!course) {
            throw { status: 404, message: `Course with id ${courseId} not found` };
        }
        
        // Update each module order in a transaction
        const updates = moduleOrders.map(({ id, order }) => 
            prisma.module.update({
                where: { id },
                data: { order }
            })
        );
        
        return withTransaction(async (tx) => {
            return Promise.all(updates);
        });
    }

    /**
     * Update module video information
     */
    async updateModuleVideo(moduleId: string, videoData: {
        videoUrl: string;
        thumbnailUrl?: string | null;
        videoDuration?: number | null;
    }): Promise<Module> {
        // Verify module exists
        const module = await prisma.module.findUnique({
            where: { id: moduleId }
        });
        
        if (!module) {
            throw { status: 404, message: `Module with id ${moduleId} not found` };
        }
        
        // Update the module with video information
        return withTransaction(async (tx) => {
            return tx.module.update({
                where: { id: moduleId },
                data: {
                    videoUrl: videoData.videoUrl,
                    thumbnailUrl: videoData.thumbnailUrl || null,
                    videoDuration: videoData.videoDuration !== null && videoData.videoDuration !== undefined 
                        ? videoData.videoDuration 
                        : module.videoDuration
                }
            });
        });
    }
}
