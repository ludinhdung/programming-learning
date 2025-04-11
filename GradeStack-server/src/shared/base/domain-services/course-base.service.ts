import { BaseService } from '../base.service';
import { Course, Prisma, Module, Lesson } from '@prisma/client';
import { ICrudService } from '../../interfaces/service.interface';

export type CourseWithRelations = Course & {
    instructor?: any;
    modules?: (Module & {
        lessons?: Lesson[];
    })[];
    enrolledCourses?: any[];
    courseFeedbacks?: any[];
    certificates?: any[];
    topics?: any[];
};

export abstract class CourseBaseService<
    T = CourseWithRelations,
    C = Prisma.CourseCreateInput,
    U = Prisma.CourseUpdateInput
> extends BaseService<T, C, U> implements ICrudService<T, C, U> {
    
    // Course-specific common methods
    async findByInstructorId(instructorId: string): Promise<T[]> {
        return this.model.findMany({
            where: { instructorId },
            orderBy: { createdAt: 'desc' }
        });
    }
    
    async findWithModules(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                modules: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    
    async findWithInstructor(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                instructor: {
                    include: { user: true }
                }
            }
        });
    }
    
    async findWithLessons(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: true
                    }
                }
            }
        });
    }
    
    async findWithEnrollments(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                EnrolledCourse: {
                    include: {
                        learner: true
                    }
                }
            }
        });
    }
    
    async findWithFeedbacks(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                CourseFeedback: {
                    include: {
                        learner: true
                    }
                }
            }
        });
    }
    
    async findWithTopics(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            }
        });
    }
    
    async findComplete(courseId: string): Promise<T | null> {
        return this.model.findUnique({
            where: { id: courseId },
            include: { 
                instructor: {
                    include: { user: true }
                },
                modules: {
                    orderBy: { order: 'asc' },
                    include: {
                        lessons: true
                    }
                },
                EnrolledCourse: true,
                CourseFeedback: true,
                CourseTopic: {
                    include: { topic: true }
                },
                LearningPathCourse: {
                    include: { learningPath: true }
                }
            }
        });
    }
}