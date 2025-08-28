'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from 'react';
import { Comment, Application } from '@/types';
import { StorageService } from '@/lib/data/storage';
import { AuthService } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  X,
  Clock,
  Reply,
  Edit3,
  Trash2,
  Flag,
} from 'lucide-react';

interface CommentThreadProps {
  comments: Comment[];
  application: Application;
  onNewComment: (comment: Comment) => void;
  onClose: () => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  application,
  onNewComment,
  onClose,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const currentUser = AuthService.getCurrentUser();

  const handleSubmitComment = async (parentId?: string) => {
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const comment: Comment = {
        id: StorageService.generateId('COMMENT'),
        applicationId: application.id,
        stage: application.currentStage,
        author: currentUser.name,
        authorRole: currentUser.role as 'admin' | 'partner',
        content: newComment.trim(),
        isInternal: false,
        createdAt: new Date().toISOString(),
        parentId,
      };

      StorageService.addComment(comment);
      onNewComment(comment);
      setNewComment('');
      setReplyingTo(null);

      // Add audit log entry
      StorageService.addAuditEntry(
        application.id,
        'comment.added',
        parentId ? 'Reply added' : 'Comment added',
        currentUser.name,
        currentUser.role as 'admin' | 'partner' | 'university' | 'immigration',
        application.currentStatus,
        application.currentStatus,
        { comment: comment.content, parentId }
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim() || !currentUser) return;

    try {
      // In a real implementation, you'd update the comment in storage
      console.log('Edit comment:', commentId, editText);
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || !confirm('Are you sure you want to delete this comment?')) return;

    try {
      StorageService.deleteComment(commentId);
      // You'd need to refresh the comments in the parent component
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Group comments by parent/child relationship
  const threadedComments = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  const getCommentReplies = (commentId: string) => {
    return replies.filter(r => r.parentId === commentId);
  };

  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAuthorColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-500 text-white';
      case 'partner':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
            <p className="text-sm text-gray-600">{comments.length} comment{comments.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {threadedComments.length > 0 ? (
          threadedComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              {/* Main Comment */}
              <CommentItem
                comment={comment}
                currentUser={currentUser}
                onReply={() => setReplyingTo(comment.id)}
                onEdit={() => {
                  setEditingComment(comment.id);
                  setEditText(comment.content);
                }}
                onDelete={() => handleDeleteComment(comment.id)}
                isEditing={editingComment === comment.id}
                editText={editText}
                setEditText={setEditText}
                onSaveEdit={() => handleEditComment(comment.id)}
                onCancelEdit={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
              />

              {/* Replies */}
              {getCommentReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-12 pl-4 border-l-2 border-gray-200">
                  <CommentItem
                    comment={reply}
                    currentUser={currentUser}
                    isReply={true}
                    onEdit={() => {
                      setEditingComment(reply.id);
                      setEditText(reply.content);
                    }}
                    onDelete={() => handleDeleteComment(reply.id)}
                    isEditing={editingComment === reply.id}
                    editText={editText}
                    setEditText={setEditText}
                    onSaveEdit={() => handleEditComment(reply.id)}
                    onCancelEdit={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                  />
                </div>
              ))}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-12 pl-4 border-l-2 border-gray-200">
                  <CommentForm
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={() => handleSubmitComment(comment.id)}
                    onCancel={() => setReplyingTo(null)}
                    isSubmitting={isSubmitting}
                    placeholder="Write a reply..."
                    isReply={true}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-500">Start the conversation by adding the first comment.</p>
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <div className="border-t border-gray-200/50 p-6">
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={() => handleSubmitComment()}
          isSubmitting={isSubmitting}
          placeholder="Add a comment..."
        />
      </div>
    </div>
  );
};

// Comment Item Component
interface CommentItemProps {
  comment: Comment;
  currentUser: { name: string; role: string } | null;
  isReply?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  editText?: string;
  setEditText?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  isEditing = false,
  editText = '',
  setEditText,
  onSaveEdit,
  onCancelEdit,
}) => {
  const [, ] = useState(false);
  const canEdit = currentUser?.name === comment.author;
  const canDelete = currentUser?.role === 'admin' || currentUser?.name === comment.author;

  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAuthorColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-500 text-white';
      case 'partner':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={editText}
          onChange={(e) => setEditText?.(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        <div className="flex items-center space-x-3">
          <button
            onClick={onSaveEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-3 group">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAuthorColor(comment.authorRole)}`}>
        {getAuthorInitials(comment.author)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-medium text-gray-900">{comment.author}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            comment.authorRole === 'admin' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {comment.authorRole}
          </span>
          <span className="text-xs text-gray-500 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatDateTime(comment.createdAt)}</span>
          </span>
        </div>

        <div className="text-gray-700 text-sm leading-relaxed mb-3">
          {comment.content}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {!isReply && onReply && (
            <button
              onClick={onReply}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={onDelete}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          )}

          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <Flag className="w-3 h-3" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Comment Form Component
interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
  isReply?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  placeholder = "Add a comment...",
  isReply = false,
}) => {
  const currentUser = AuthService.getCurrentUser();

  const getAuthorInitials = (authorName: string) => {
    return authorName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAuthorColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-500 text-white';
      case 'partner':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="flex space-x-3">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAuthorColor(currentUser?.role || 'user')}`}>
        {currentUser ? getAuthorInitials(currentUser.name) : 'U'}
      </div>

      {/* Form */}
      <div className="flex-1">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={isReply ? 2 : 3}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Ctrl</kbd> + 
            <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs ml-1">Enter</kbd> to send
          </div>
          <div className="flex items-center space-x-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onSubmit}
              disabled={!value.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending...' : isReply ? 'Reply' : 'Comment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentThread;