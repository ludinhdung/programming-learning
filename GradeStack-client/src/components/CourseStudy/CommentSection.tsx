import React, { useEffect, useState } from 'react';
import { Comment, commentService } from '../../services/comment.service';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
    lessonId: string;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ lessonId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentsData = await commentService.getCommentsByLesson(lessonId);
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (lessonId) {
            fetchComments();
        }
    }, [lessonId]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;

        try {
            const comment = await commentService.createComment({
                content: newComment,
                lessonId: lessonId,
            });
            setComments(prev => [comment, ...prev]);
            setNewComment('');
            setIsCommentModalOpen(false);
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handlePostReply = async (commentId: string) => {
        if (!replyContent.trim() || !user) return;

        try {
            const reply = await commentService.createComment({
                content: replyContent,
                lessonId: lessonId,
                parentCommentId: commentId
            });

            setComments(prev => prev.map(comment => {
                if (comment.id === commentId) {
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), reply]
                    };
                }
                return comment;
            }));

            setReplyContent('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };


    return (
        <div className="bg-[#0e1721] rounded-md border border-blue-400/15 pt-6 pb-2 text-white">
            <div className="px-6">
                <div className="space-y-6">
                    <div className="p-6 rounded-lg">
                        <div className="flex items-center space-x-4">
                            <img
                                src={user?.avatarUrl || "https://laracasts.nyc3.digitaloceanspaces.com/members/avatars/409891.jpg?v=353"}
                                className="w-24 h-24"
                                alt="User"
                            />
                            <div className="flex-1">
                                <div
                                    className="w-full h-20 px-4 py-3 font-medium text-white bg-[#1A1F2C] rounded-none cursor-pointer flex items-center border border-blue-400/10 hover:border hover:border-blue-400/30  box-border"
                                    onClick={() => setIsCommentModalOpen(true)}
                                >
                                    <span className="text-sm uppercase">Write a comment.</span>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mx-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="text-white font-medium bg-[#19202C] rounded-none group min-h-24">
                                <div className="p-4 pb-2">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            className="w-20 h-20 "
                                            src={`https://unavatar.io/github/${comment.userId}`}
                                            alt={comment.user.firstName}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base font-bold uppercase text-white">
                                                        {`${comment.user.firstName} ${comment.user.lastName}`}
                                                    </h3>
                                                    <span className="text-xs text-gray-400">
                                                        Posted {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                {user?.id === comment.userId && (
                                                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="mt-4 text-sm text-gray-300">
                                                {comment.content}
                                            </p>

                                            <div className="flex items-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="py-2 px-6 bg-[#29324a] text-[#fff] text-sm font-medium rounded-none border border-blue-400/10 hover:border hover:border-blue-400/30 box-border"
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="pl-20 pr-6 pb-6">
                                        {comment.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="bg-[#2a3441] mt-4 p-4 rounded-none border border-blue-400/20"
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <img
                                                        className="w-20 h-20"
                                                        src={`https://unavatar.io/github/${reply.userId}`}
                                                        alt={reply.user.firstName}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-200">
                                                                    {`${reply.user.firstName} ${reply.user.lastName}`}
                                                                </h4>
                                                                <span className="text-xs text-gray-400">
                                                                    Posted {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                            {user?.id === reply.userId && (
                                                                <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-300">
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comment Modal */}
            {isCommentModalOpen && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center font-medium">
                    <div className="w-[800px] h-[280px] bg-[#1a1f2c] p-4 rounded-none border-blue-400/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Write a comment</h3>
                        </div>
                        <textarea
                            className="w-full h-40 px-4 py-3 text-sm text-white bg-[#1a1f2c] rounded-none resize-none"
                            placeholder="So here what I think..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                className="rounded-none bg-[#334159] border-none text-white hover:bg-[#243447] p-2 px-20 w-auto"
                                onClick={() => {
                                    setIsCommentModalOpen(false);
                                    setNewComment('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-none  border-none text-white bg-[#4796F2] hover:bg-[#4796F2]/80 p-2 px-20 w-auto"
                                onClick={handlePostComment}
                            >
                                Post
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Reply Modal */}
            {replyingTo && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center font-medium">
                    <div className="w-[800px] bg-[#1a1f2c] p-4 rounded-none border-t border-blue-400/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Reply to comment</h3>
                        </div>

                        <textarea
                            className="w-full h-32 px-4 py-3 text-sm text-white bg-[#1a1f2c] rounded-none resize-none"
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            autoFocus
                        />

                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                className="rounded-none bg-[#334159] border-none text-white hover:bg-[#243447] p-2 px-20 w-auto"
                                onClick={() => {
                                    setReplyingTo(null);
                                    setReplyContent('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-none border-none text-white bg-[#4796F2] hover:bg-[#4796F2]/80 p-2 px-20 w-auto"
                                onClick={() => handlePostReply(replyingTo)}
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;