import api from './api';

export interface CourseInstructor {
    id?: string;
    userId?: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    };
    organization?: string;
    avatar?: string;
    bio?: string;
    socials?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseDetail {
    id: string;
    title: string;
    description: string;
    price: string;
    duration: number;
    thumbnail: string;
    isPublished: boolean;
    instructor: CourseInstructor;
    createdAt: string;
    updatedAt: string;
    totalLessons: number;
    averageRating: number;
    totalRatings: number;
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

const DEFAULT_COURSE_FIELDS = 'id,title,description,price,duration,thumbnail';
const DEFAULT_INSTRUCTOR_FIELDS = 'instructor.user.firstName,instructor.user.lastName';

export const courseService = {

    async getCourses(params: GetCoursesParams = {}): Promise<CourseResponse> {
        try {
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

    async getCourseById(id: string): Promise<CourseDetail> {
        try {
            const response = await api.get(`/courses/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching course with ID ${id}:`, error);
            throw error;
        }
    }
};

export default courseService; 