import { BaseService } from '../base.service';
import { Topic, Prisma, Course } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type TopicWithRelations = Topic & {
    Instructor?: any;
    courses?: Course[];
};

export abstract class TopicBaseService<
    T = TopicWithRelations, 
    C = Prisma.TopicCreateInput, 
    U = Prisma.TopicUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // Topic-specific common methods
    async findByInstructorId(instructorId: string): Promise<T[]> {
        return this.model.findMany({
            where: { instructorUserId: instructorId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findWithInstructor(topicId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: topicId },
            include: { 
                Instructor: {
                    include: { user: true }
                }
            }
        });
    }

    async findWithCourses(topicId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: topicId },
            include: { 
                courses: {
                    include: {
                        Instructor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findTopicsWithCourses(): Promise<T[]> {
        return this.model.findMany({
            include: {
                courses: {
                    include: {
                        Instructor: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                enrollments: true
                            }
                        }
                    }
                }
            }
        });
    }

    async findComplete(topicId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: topicId },
            include: { 
                Instructor: {
                    include: { user: true }
                },
                courses: {
                    include: {
                        Instructor: {
                            include: {
                                user: true
                            }
                        },
                        modules: true
                    }
                }
            }
        });
    }
}
