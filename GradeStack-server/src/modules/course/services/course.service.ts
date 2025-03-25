import { PrismaClient } from '@prisma/client';

interface FindCoursesParams {
    topicId?: string;
    instructorId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    select?: string;
}

export class CourseService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async findCourses({
        topicId,
        instructorId,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        order = 'desc',
        select
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

        // Handle search parameter for course title
        if (search) {
            where.title = {
                contains: search,
                mode: 'insensitive' // Case insensitive search
            };
        }

        // Get total count for pagination metadata
        const totalCount = await this.prisma.course.count({ where });

        // Determine what to include based on select parameter
        let includeInstructor = true;
        let includeCourseTopic = true;

        // If select parameter exists, check what fields are requested
        if (select) {
            const fields = select.split(',');
            includeInstructor = fields.some(field => field.startsWith('instructor'));
            includeCourseTopic = fields.some(field => field.startsWith('CourseTopic'));
        }

        // Build include object dynamically
        const include: any = {};

        if (includeInstructor) {
            include.instructor = {
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            };
        }

        if (includeCourseTopic) {
            include.CourseTopic = {
                include: {
                    topic: true
                }
            };
        }

        // Fetch courses with filtering and pagination
        const courses = await this.prisma.course.findMany({
            where,
            include: Object.keys(include).length > 0 ? include : undefined,
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