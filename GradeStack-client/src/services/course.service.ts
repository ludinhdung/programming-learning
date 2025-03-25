import api from './api';

export interface CourseInstructor {
    id?: string;
    userId?: string;
    user?: {
        firstName: string;
        lastName: string;
    };
    organization?: string;
    avatar?: string;
    bio?: string;
    socials?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseTopic {
    id?: string;
    topic?: {
        id?: string;
        name: string;
    };
}

export interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    duration?: number;
    thumbnail?: string;
    isPublished?: boolean;
    instructorId?: string;
    instructor?: CourseInstructor;
    CourseTopic?: CourseTopic[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseResponse {
    data: Course[];
    meta: {
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface GetCoursesParams {
    topicId?: string;
    instructorId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    select?: string;
    search?: string;
}

// Default fields to select for optimized API responses
const DEFAULT_COURSE_FIELDS = 'id,title,description,price,duration,thumbnail';
const DEFAULT_INSTRUCTOR_FIELDS = 'instructor.user.firstName,instructor.user.lastName';

export const courseService = {
    /**
     * Fetches courses with optional filtering and pagination
     * @param params - Optional parameters for filtering, pagination, and field selection
     */
    async getCourses(params: GetCoursesParams = {}): Promise<CourseResponse> {
        try {
            // Only select necessary fields to optimize API response
            if (!params.select) {
                params.select = [
                    DEFAULT_COURSE_FIELDS,
                    DEFAULT_INSTRUCTOR_FIELDS
                ].join(',');
            }

            const response = await api.get('/courses', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    },

    /**
     * Fetches a single course by ID
     * @param id - Course ID
     * @param select - Optional comma-separated fields to select
     */
    async getCourseById(id: string, select?: string): Promise<Course> {
        try {
            // Only select necessary fields for course details
            const params = {
                select: select || [
                    DEFAULT_COURSE_FIELDS,
                    DEFAULT_INSTRUCTOR_FIELDS
                ].join(',')
            };

            const response = await api.get(`/courses/${id}`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching course with ID ${id}:`, error);
            throw error;
        }
    }
};

export default courseService; 