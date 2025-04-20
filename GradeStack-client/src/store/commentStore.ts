import { create } from 'zustand';
import { Comment } from '../services/comment.service';

interface CommentState {
    comments: Comment[];
    setComments: (comments: Comment[]) => void;
    addComment: (comment: Comment) => void;
    updateComment: (commentId: string, content: string) => void;
    deleteComment: (commentId: string) => void;
}

export const useCommentStore = create<CommentState>((set) => ({
    comments: [],
    setComments: (comments) => set({ comments }),
    addComment: (comment) =>
        set((state) => ({ comments: [...state.comments, comment] })),
    updateComment: (commentId, content) =>
        set((state) => ({
            comments: state.comments.map((comment) =>
                comment.id === commentId ? { ...comment, content } : comment
            ),
        })),
    deleteComment: (commentId) =>
        set((state) => ({
            comments: state.comments.filter((comment) => comment.id !== commentId),
        })),
})); 