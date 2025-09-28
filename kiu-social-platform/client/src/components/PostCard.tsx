import React, { useState } from 'react'
import { Post } from '../types'
import { postAPI } from '../utils/api'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share, MoreHorizontal, User } from 'lucide-react'
import toast from 'react-hot-toast'
import CommentSection from './CommentSection'

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes.length)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])

  const handleLike = async () => {
    try {
      const response = await postAPI.likePost(post._id)
      setIsLiked(response.data.isLiked)
      setLikesCount(response.data.likesCount)
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleCommentAdded = (newComment: any) => {
    setComments(prev => [newComment, ...prev])
  }

  return (
    <div className="card p-6">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full"
            src={post.author.profilePicture || `https://ui-avatars.com/api/?name=${post.author.firstName}+${post.author.lastName}&background=0ea5e9&color=fff`}
            alt={post.author.firstName}
          />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {post.author.firstName} {post.author.lastName}
            </h3>
            <p className="text-xs text-gray-500">
              @{post.author.username} • {post.author.major} • {post.author.startYear}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
        {post.images && post.images.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg max-w-full h-auto"
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 text-sm font-medium ${
              isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-700">
            <Share className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <CommentSection
            postId={post._id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  )
}

export default PostCard
