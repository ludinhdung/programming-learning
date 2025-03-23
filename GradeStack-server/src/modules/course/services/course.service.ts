import { PrismaClient } from '@prisma/client';

interface FindCoursesParams {
    topicId?: string;
    instructorId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}

export class CourseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findCourses({
        topicId,
        instructorId,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc'
    }: FindCoursesParams) {
        const skip = (page - 1) * limit;

        // Build filter criteria
        const where: any = {
            isPublished: true, // Only return published courses
        };

        if (instructorId) {
            where.instructorId = instructorId;
        }

        if (topicId) {
            where.CourseTopic = {
                some: {
                    topicId
                }
            };
        }

        // Get total count for pagination metadata
        const totalCount = await this.prisma.course.count({ where });

        // Fetch courses with filtering and pagination
        const courses = await this.prisma.course.findMany({
            where,
            include: {
                instructor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                },
                CourseTopic: {
                    include: {
                        topic: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                [sortBy]: order
            }
        });

        return {
            data: courses,
            meta: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    }
} 