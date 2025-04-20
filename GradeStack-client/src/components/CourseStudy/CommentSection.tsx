import React, { useEffect, useState } from 'react';
import { Comment, commentService } from '../../services/comment.service';
import { formatDistanceToNow } from 'date-fns';
import { Modal, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

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
    const [editingComment, setEditingComment] = useState<Comment | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenDropdownId(null);
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

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

    const handleEditComment = (comment: Comment) => {
        setEditingComment(comment);
        setEditContent(comment.content);
        setIsEditModalOpen(true);
    };

    const handleUpdateComment = async () => {
        if (!editingComment || !editContent.trim()) return;

        try {
            const updatedComment = await commentService.updateComment(
                editingComment.id,
                { content: editContent }
            );

            if (editingComment.parentCommentId) {
                // It's a reply
                setComments(prev => prev.map(comment => {
                    if (comment.id === editingComment.parentCommentId && comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => 
                                reply.id === editingComment.id 
                                    ? { ...reply, content: updatedComment.content, updatedAt: updatedComment.updatedAt }
                                    : reply
                            )
                        };
                    }
                    return comment;
                }));
            } else {
                // It's a main comment
                setComments(prev => prev.map(comment => 
                    comment.id === editingComment.id 
                        ? { ...comment, content: updatedComment.content, updatedAt: updatedComment.updatedAt }
                        : comment
                ));
            }

            setIsEditModalOpen(false);
            setEditingComment(null);
            setEditContent('');
            message.success('Comment updated successfully');
        } catch (error) {
            console.error('Error updating comment:', error);
            message.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async () => {
        if (!commentToDelete) return;

        try {
            const success = await commentService.deleteComment(commentToDelete.id);
            
            if (success) {
                if (commentToDelete.parentCommentId) {
                    // It's a reply
                    setComments(prev => prev.map(comment => {
                        if (comment.id === commentToDelete.parentCommentId && comment.replies) {
                            return {
                                ...comment,
                                replies: comment.replies.filter(reply => reply.id !== commentToDelete.id)
                            };
                        }
                        return comment;
                    }));
                } else {
                    // It's a main comment
                    setComments(prev => prev.filter(comment => comment.id !== commentToDelete.id));
                }
                
                message.success('Comment deleted successfully');
            } else {
                message.error('Failed to delete comment');
            }
            
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
        } catch (error) {
            console.error('Error deleting comment:', error);
            message.error('Failed to delete comment');
            setIsDeleteModalOpen(false);
            setCommentToDelete(null);
        }
    };

    const toggleDropdown = (event: React.MouseEvent, commentId: string) => {
        event.stopPropagation();
        setOpenDropdownId(openDropdownId === commentId ? null : commentId);
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
                                            </div>
                                            <p className="mt-4 text-sm text-gray-300">
                                                {comment.content}
                                            </p>

                                            <div className="flex items-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                                                <button
                                                    className="py-2 px-6 bg-[#29324a] text-[#fff] text-sm font-medium rounded-none border border-blue-400/10 hover:border hover:border-blue-400/30 box-border"
                                                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                >
                                                    Reply
                                                </button>
                                                
                                                {user?.id === comment.userId && (
                                                    <div className="relative">
                                                        <button
                                                            className="py-2 px-4 bg-[#29324a] text-[#fff] text-sm font-medium rounded-none border border-blue-400/10 hover:border hover:border-blue-400/30 box-border"
                                                            onClick={(e) => toggleDropdown(e, comment.id)}
                                                        >
                                                        ...
                                                        </button>
                                                        
                                                        {openDropdownId === comment.id && (
                                                            <div className="absolute right-0 mt-1 w-36 bg-[#2a3441] shadow-lg z-10 border border-blue-400/20">
                                                                <button 
                                                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#334159] flex items-center"
                                                                    onClick={() => handleEditComment(comment)}
                                                                >
                                                                    <EditOutlined className="mr-2" /> Edit
                                                                </button>
                                                                <button 
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#334159] flex items-center"
                                                                    onClick={() => {
                                                                        setCommentToDelete(comment);
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                >
                                                                    <DeleteOutlined className="mr-2" /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="pl-20 pr-6 pb-6">
                                        {comment.replies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="bg-[#2a3441] mt-4 p-4 rounded-none border border-blue-400/20 group"
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
                                                        </div>
                                                        <p className="mt-2 text-sm text-gray-300">
                                                            {reply.content}
                                                        </p>
                                                        
                                                        {user?.id === reply.userId && (
                                                            <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                                                                <div className="relative">
                                                                    <button
                                                                        className="py-2 px-4 bg-[#334159] text-[#fff] text-xs font-medium rounded-none border border-blue-400/10 hover:border hover:border-blue-400/30 box-border"
                                                                        onClick={(e) => toggleDropdown(e, reply.id)}
                                                                    >
                                                                     ...
                                                                    </button>
                                                                
                                                                    {openDropdownId === reply.id && (
                                                                        <div className="absolute right-0 mt-1 w-36 bg-[#2a3441] shadow-lg z-10 border border-blue-400/20">
                                                                            <button 
                                                                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#334159] flex items-center"
                                                                                onClick={() => handleEditComment(reply)}
                                                                            >
                                                                                <EditOutlined className="mr-2" /> Edit
                                                                            </button>
                                                                            <button 
                                                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#334159] flex items-center"
                                                                                onClick={() => {
                                                                                    setCommentToDelete(reply);
                                                                                    setIsDeleteModalOpen(true);
                                                                                }}
                                                                            >
                                                                                <DeleteOutlined className="mr-2" /> Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
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

            {/* Edit Comment Modal */}
            {isEditModalOpen && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center font-medium">
                    <div className="w-[800px] bg-[#1a1f2c] p-4 rounded-none border-t border-blue-400/20 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-white">Edit comment</h3>
                        </div>

                        <textarea
                            className="w-full h-32 px-4 py-3 text-sm text-white bg-[#1a1f2c] rounded-none resize-none"
                            placeholder="Edit your comment..."
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            autoFocus
                        />

                        <div className="flex justify-end mt-4 space-x-2">
                            <button
                                className="rounded-none bg-[#334159] border-none text-white hover:bg-[#243447] p-2 px-20 w-auto"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setEditingComment(null);
                                    setEditContent('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="rounded-none border-none text-white bg-[#4796F2] hover:bg-[#4796F2]/80 p-2 px-20 w-auto"
                                onClick={handleUpdateComment}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#1c202d] w-[350px] rounded-md shadow-lg ">
                        <div className="px-6 py-4 flex flex-col justify-between items-center">
                            <img src="https://laracasts.com/images/icons/flash/info.svg" alt="" />
                            <h3 className="text-[#bad9fc] text-xl font-bold uppercase">Are you sure?</h3>

                        </div>
                        <div className="px-6 py-4">
                            <p className="text-white font-medium">If you proceed, your comment (and any replies to it) will be deleted.</p>
                        </div>
                        <div className="px-6 py-4 flex flex-col justify-end space-y-2 ">
                            <button
                                className="py-2 px-4 bg-[#334159] text-white text-sm font-medium rounded-none border border-blue-400/10 hover:border-blue-400/30"
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setCommentToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="py-2 px-4 bg-red-500 text-white text-sm font-medium rounded-none border border-red-400/10 hover:bg-red-600"
                                onClick={handleDeleteComment}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentSection;