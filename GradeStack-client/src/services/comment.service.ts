import api from './api';

export interface Comment {
    id: string;
    content: string;
    userId: string;
    lessonId: string;
    parentCommentId?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    _count?: {
        replies: number;
    };
    replies?: Comment[];
}

export const commentService = {
    // Lấy tất cả comment của một lesson (chỉ lấy comment cấp cao nhất)
    getCommentsByLesson: async (lessonId: string): Promise<Comment[]> => {
        const response = await api.get(`/comments/lesson/${lessonId}`);
        return response.data;
    },

    // Lấy các reply của một comment
    getReplies: async (commentId: string): Promise<Comment[]> => {
        const response = await api.get(`/comments/${commentId}/replies`);
        return response.data;
    },

    // Tạo comment mới
    createComment: async (data: {
        content: string;
        lessonId: string;
        parentCommentId?: string;
    }): Promise<Comment> => {
        const response = await api.post('/comments', data);
        return response.data;
    },

    // Cập nhật comment
    updateComment: async (
        commentId: string,
        data: { content: string }
    ): Promise<Comment> => {
        const response = await api.put(`/comments/${commentId}`, data);
        return response.data;
    },

    // Xóa comment
    deleteComment: async (commentId: string): Promise<boolean> => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },
}; 