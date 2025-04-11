import api from './api';

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    createdAt: string;
}

export interface PurchaseRecord {
    id: string;
    price: number;
    purchasedAt: string;
    status: 'completed' | 'pending' | 'failed';
    course: {
        id: string;
        title: string;
        thumbnail?: string;
    };
}

export interface EnrollmentRecord {
    enrolledAt: string;
    course: {
        id: string;
        title: string;
        thumbnail?: string;
        instructor: {
            avatar?: string;
            user: {
                firstName: string;
                lastName: string;
            };
        };
    };
    progress: number;
}

export interface BookmarkRecord {
    id: string;
    course: {
        id: string;
        title: string;
        thumbnail?: string;
        instructor: {
            avatar?: string;
            user: {
                firstName: string;
                lastName: string;
            };
        };
    };
    createdAt: string;
}

interface ChangePasswordData {
    oldPassword: string;
    newPassword: string;
}

const userService = {
    async getMyProfile(userId: string): Promise<UserProfile> {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching user profile for ${userId}:`, error);
            throw error;
        }
    },

    async getMyEnrolledCourses(userId: string): Promise<EnrollmentRecord[]> {
        try {
            const response = await api.get(`/users/${userId}/enrollments`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching enrolled courses for user ${userId}:`, error);
            throw error;
        }
    },

    async getMyBookmarks(userId: string): Promise<BookmarkRecord[]> {
        try {
            const response = await api.get(`/users/${userId}/bookmarks`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching bookmarks for user ${userId}:`, error);
            throw error;
        }
    },

    async getMyPurchaseHistory(userId: string): Promise<PurchaseRecord[]> {
        try {
            const response = await api.get(`/users/${userId}/purchases`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching purchase history for user ${userId}:`, error);
            throw error;
        }
    },

    async removeBookmark(userId: string, courseId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.delete(`/users/${userId}/bookmarks/${courseId}`);
            return response.data;
        } catch (error) {
            console.error(`Error removing bookmark for course ${courseId}:`, error);
            throw error;
        }
    },

    async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
        try {
            const response = await api.patch('/users/change-password', data);
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }
};

export default userService;
