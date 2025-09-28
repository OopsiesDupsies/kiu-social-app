import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI, postAPI } from '../utils/api'
import { User, Post } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { Edit3, User as UserIcon, Calendar, GraduationCap, Mail } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import PostCard from '../components/PostCard'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getProfile()
      const userData = response.data
      setUser(userData)
      setEditData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio || ''
      })
      loadUserPosts(userData._id)
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadUserPosts = async (userId: string) => {
    try {
      setPostsLoading(true)
      const response = await postAPI.getUserPosts(userId, 1, 10)
      setPosts(response.data)
    } catch (error) {
      toast.error('Failed to load posts')
    } finally {
      setPostsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const response = await userAPI.updateProfile(editData)
      setUser(response.data)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleCancelEdit = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || ''
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              className="h-20 w-20 rounded-full"
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0ea5e9&color=fff`}
              alt={user.firstName}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-sm text-gray-500">
                {user.major} • Class of {user.startYear}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Profile Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Born {new Date(user.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              Started {user.startYear}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {user.friends.length} friends
            </span>
          </div>
        </div>

        {/* Bio */}
        {isEditing ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={editData.bio}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          user.bio && (
            <div className="mt-4">
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            </div>
          )
        )}
      </div>

      {/* Posts Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Posts</h2>
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">This user hasn't shared anything yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
