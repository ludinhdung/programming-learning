import { LearningPath, LearningPathCourse, Prisma, PrismaClient } from '@prisma/client';
import { withTransaction } from '../../../shared/utils/transaction.utils';
import { CreateLearningPathDTO, LearningPathCourseOrderDTO, UpdateLearningPathDTO } from '../dto/LearningPathDTO';
import { log } from 'console';

const prisma = new PrismaClient();

export class LearningPathService {
    /**
     * Create a new learning path
     */
    async createLearningPath(instructorId: string, data: CreateLearningPathDTO): Promise<LearningPath> {
        // Verify instructor exists
        await this.verifyInstructorExists(instructorId);
        
        // Verify courses exist
        await this.validateCourses(data.courseIds);
        
        // Extract course IDs
        const { courseIds, ...learningPathData } = data;
        
        // Create learning path and course connections in a transaction
        return withTransaction(async (tx) => {
            // Create the learning path
            const learningPath = await tx.learningPath.create({
                data: {
                    ...learningPathData,
                    instructorUserId: instructorId
                }
            });

            console.log("Learning Path created:", learningPath);
            
            // Create course connections with order
            if (courseIds?.length > 0) {
                await this.createCourseConnections(tx, learningPath.id, courseIds);
            }
            
            return learningPath;
        });
    }
    
    /**
     * Get all learning paths for an instructor
     */
    async getLearningPathsByInstructor(instructorId: string): Promise<LearningPath[]> {
        return prisma.learningPath.findMany({
            where: {
                instructorUserId: instructorId
            },
            include: {
                courses: {
                    include: {
                        course: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
    }
    
    /**
     * Get all learning paths (for public access)
     */
    async getAllLearningPaths(): Promise<LearningPath[]> {
        return prisma.learningPath.findMany({
            include: {
                Instructor: {
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
                courses: {
                    include: {
                        course: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
    }
    
    /**
     * Get a learning path by ID
     */
    async getLearningPathById(learningPathId: string): Promise<LearningPath | null> {
        const learningPath = await prisma.learningPath.findUnique({
            where: {
                id: learningPathId
            },
            include: {
                Instructor: {
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
                courses: {
                    include: {
                        course: {
                            include: {
                                instructor: {
                                    include: {
                                        user: {
                                            select: {
                                                firstName: true,
                                                lastName: true
                                            }
                                        }
                                    }
                                },
                                modules: {
                                    orderBy: {
                                        order: 'asc'
                                    }
                                },
                                CourseTopic: {
                                    include: {
                                        topic: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });
        
        if (!learningPath) {
            throw { status: 404, message: `Lộ trình học với id ${learningPathId} không tồn tại` };
        }
        
        return learningPath;
    }
    
    /**
     * Update a learning path
     */
    async updateLearningPath(instructorId: string, learningPathId: string, data: UpdateLearningPathDTO): Promise<LearningPath> {
        // Verify learning path exists and belongs to instructor
        await this.verifyLearningPathOwnership(instructorId, learningPathId);
        
        // Extract course IDs
        const { courseIds, ...learningPathData } = data;
        
        // Update learning path and course connections in a transaction
        return withTransaction(async (tx) => {
            // Update the learning path
            const learningPath = await tx.learningPath.update({
                where: {
                    id: learningPathId
                },
                data: learningPathData
            });
            
            // Update course connections if provided
            if (courseIds) {
                // Verify courses exist
                await this.validateCourses(courseIds);
                
                // Delete existing connections
                await tx.learningPathCourse.deleteMany({
                    where: {
                        learningPathId
                    }
                });
                
                // Create new connections
                await this.createCourseConnections(tx, learningPathId, courseIds);
            }
            
            return learningPath;
        });
    }
    
    /**
     * Update the order of courses in a learning path
     */
    async updateCoursesOrder(instructorId: string, learningPathId: string, coursesOrder: LearningPathCourseOrderDTO[]): Promise<LearningPath> {
        // Verify learning path exists and belongs to instructor
        await this.verifyLearningPathOwnership(instructorId, learningPathId);
        
        // Get existing course connections
        const existingConnections = await prisma.learningPathCourse.findMany({
            where: {
                learningPathId
            }
        });
        
        // Verify all courses in the order list exist in the learning path
        const existingCourseIds = existingConnections.map(conn => conn.courseId);
        const orderCourseIds = coursesOrder.map(order => order.courseId);
        
        if (!orderCourseIds.every(id => existingCourseIds.includes(id))) {
            throw { status: 400, message: 'Một hoặc nhiều khóa học không thuộc lộ trình học này' };
        }
        
        // Update course orders in a transaction
        return withTransaction(async (tx) => {
            // Update each course order
            for (const courseOrder of coursesOrder) {
                await tx.learningPathCourse.updateMany({
                    where: {
                        learningPathId,
                        courseId: courseOrder.courseId
                    },
                    data: {
                        order: courseOrder.order
                    }
                });
            }
            
            // Return updated learning path
            return tx.learningPath.findUnique({
                where: {
                    id: learningPathId
                },
                include: {
                    courses: {
                        include: {
                            course: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }) as Promise<LearningPath>;
        });
    }
    
    /**
     * Delete a learning path
     */
    async deleteLearningPath(instructorId: string, learningPathId: string): Promise<void> {
        // Verify learning path exists and belongs to instructor
        console.log("Vào tới đây");
        await this.verifyLearningPathOwnership(instructorId, learningPathId);
        
        // Delete learning path and all its connections in a transaction
        await withTransaction(async (tx) => {
            // Delete course connections
            await tx.learningPathCourse.deleteMany({
                where: {
                    learningPathId
                }
            });
            
            // Delete learning path
            await tx.learningPath.delete({
                where: {
                    id: learningPathId
                }
            });
        });
    }
    
    // Helper methods
    
    /**
     * Verify instructor exists
     */
    private async verifyInstructorExists(instructorId: string): Promise<void> {
        const instructor = await prisma.instructor.findUnique({
            where: {
                userId: instructorId
            }
        });
        
        if (!instructor) {
            throw { status: 404, message: `Giảng viên với id ${instructorId} không tồn tại` };
        }
    }
    
    /**
     * Validate courses exist
     */
    private async validateCourses(courseIds: string[]): Promise<void> {
        if (!courseIds || courseIds.length === 0) {
            throw { status: 400, message: 'Lộ trình học phải có ít nhất một khóa học' };
        }
        
        const coursesCount = await prisma.course.count({
            where: {
                id: {
                    in: courseIds
                }
            }
        });
        
        if (coursesCount !== courseIds.length) {
            throw { status: 400, message: 'Một hoặc nhiều khóa học không tồn tại' };
        }
    }
    
    /**
     * Create course connections with order
     */
    private async createCourseConnections(tx: any, learningPathId: string, courseIds: string[]): Promise<void> {
        for (let i = 0; i < courseIds.length; i++) {
            await tx.learningPathCourse.create({
                data: {
                    learningPath: {
                        connect: {
                            id: learningPathId
                        }
                    },
                    course: {
                        connect: {
                            id: courseIds[i]
                        }
                    },
                    order: i
                }
            });
        }
    }
    
    /**
     * Verify learning path ownership
     */
    private async verifyLearningPathOwnership(instructorId: string, learningPathId: string): Promise<void> {
        const learningPath = await prisma.learningPath.findUnique({
            where: {
                id: learningPathId
            }
        });
        
        if (!learningPath) {
            throw { status: 404, message: `Lộ trình học với id ${learningPathId} không tồn tại` };
        }
        
        if (learningPath.instructorUserId !== instructorId) {
            throw { status: 403, message: 'Bạn không có quyền truy cập lộ trình học này' };
        }
    }
}
