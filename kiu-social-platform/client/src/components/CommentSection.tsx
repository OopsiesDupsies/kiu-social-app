import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { postAPI } from '../utils/api'
import { Comment } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { Heart, Reply, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface CommentSectionProps {
  postId: string
  comments: Comment[]
  onCommentAdded: (comment: Comment) => void
}

interface CommentFormData {
  content: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  postId, 
  comments, 
  onCommentAdded 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CommentFormData>()

  const onSubmit = async (data: CommentFormData) => {
    try {
      setIsSubmitting(true)
      const response = await postAPI.addComment(postId, {
        content: data.content,
        parentCommentId: replyingTo || undefined
      })
      
      onCommentAdded(response.data)
      reset()
      setReplyingTo(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {
    try {
      await postAPI.likeComment(commentId)
      // In a real app, you'd update the comment's like count
    } catch (error) {
      toast.error('Failed to like comment')
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment._id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <div className="flex items-start space-x-3">
        <img
          className="h-8 w-8 rounded-full"
          src={comment.author.profilePicture || `https://ui-avatars.com/api/?name=${comment.author.firstName}+${comment.author.lastName}&background=0ea5e9&color=fff`}
          alt={comment.author.firstName}
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900">
                {comment.author.firstName} {comment.author.lastName}
              </h4>
              <span className="text-xs text-gray-500">
                @{comment.author.username}
              </span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => handleLikeComment(comment._id)}
              className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600"
            >
              <Heart className="h-4 w-4" />
              <span>{comment.likes.length}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <Reply className="h-4 w-4" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
              <div className="flex space-x-2">
                <input
                  {...register('content', {
                    required: 'Reply content is required',
                    maxLength: {
                      value: 1000,
                      message: 'Reply must be less than 1000 characters'
                    }
                  })}
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-2 text-sm bg-kiu-600 text-white rounded-lg hover:bg-kiu-700 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
              {errors.content && (
                <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
              )}
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      {/* Comment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-kiu-100 flex items-center justify-center">
              <User className="h-5 w-5 text-kiu-600" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              {...register('content', {
                required: 'Comment content is required',
                maxLength: {
                  value: 1000,
                  message: 'Comment must be less than 1000 characters'
                }
              })}
              rows={2}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>
            )}
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1 text-sm bg-kiu-600 text-white rounded-lg hover:bg-kiu-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  )
}

export default CommentSection
