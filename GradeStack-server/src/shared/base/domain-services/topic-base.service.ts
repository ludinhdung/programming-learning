import { BaseService } from '../base.service';
import { Topic, Prisma, Course } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type TopicWithRelations = Topic & {
    instructor?: any;
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
        try {
            console.log('Finding topic with courses for ID:', topicId);
            const result = await this.model.findUnique({
                where: { id: topicId },
                include: { 
                    courses: {
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
                    }
                }
            });
            console.log('Found topic with courses:', result ? 'Yes' : 'No');
            return result;
        } catch (error) {
            console.error('Error in findWithCourses:', error);
            throw error;
        }
    }

    async findTopicsWithCourses(): Promise<T[]> {
        try {
            console.log('Finding all topics with courses');
            // Use correct field names matching the Prisma schema
            const result = await this.model.findMany({
                include: {
                    Instructor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            },
                            
                        }
                    },
                    courses: {
                        include: {
                            course: {
                                include: {
                                    instructor: {
                                        include: {
                                            user: {
                                                select: {
                                                    firstName: true,
                                                    lastName: true,
                                                    email: true
                                                }
                                            }
                                        }
                                    },
                                    modules: true
                                }
                            }
                        }
                    }
                }
            });
            
            console.log(`Found ${result.length} topics with courses`);
            // Log the first topic's structure to help with debugging
            if (result.length > 0) {
                console.log('First topic course count:', result[0].courses?.length || 0);
                if (result[0].courses && result[0].courses.length > 0) {
                    console.log('First course data example:', JSON.stringify(result[0].courses[0].course, null, 2));
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error in findTopicsWithCourses:', error);
            throw error;
        }
    }

    async findComplete(topicId: string): Promise<T | null> {
        try {
            console.log('Finding complete topic for ID:', topicId);
            const result = await this.model.findUnique({
                where: { id: topicId },
                include: { 
                    Instructor: {
                        include: { user: true }
                    },
                    courses: {
                        include: {
                            course: {
                                include: {
                                    modules: true,
                                    instructor: {
                                        include: {
                                            user: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            console.log('Found complete topic:', result ? 'Yes' : 'No');
            return result;
        } catch (error) {
            console.error('Error in findComplete:', error);
            throw error;
        }
    }
}
