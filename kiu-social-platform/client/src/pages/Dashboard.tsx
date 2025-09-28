import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { postAPI } from '../utils/api'
import { Post } from '../types'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, RefreshCw } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true)
      const response = await postAPI.getFeed(pageNum, 10)
      const newPosts = response.data
      
      if (reset) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      setHasMore(newPosts.length === 10)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts(1, true)
  }, [])

  const handleCreatePost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev])
    setShowCreatePost(false)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadPosts(nextPage, false)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    loadPosts(1, true)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
            <p className="text-gray-600">Here's what's happening in the KIU community</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreatePost
              onPostCreated={handleCreatePost}
              onCancel={() => setShowCreatePost(false)}
            />
          </div>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary"
            >
              Create your first post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {hasMore && !loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              className="btn-secondary"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
