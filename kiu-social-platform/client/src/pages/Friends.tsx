import React, { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'
import { User } from '../types'
import { Users, UserMinus, MessageCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Friends: React.FC = () => {
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getFriends()
      setFriends(response.data)
    } catch (error) {
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await userAPI.removeFriend(friendId)
      setFriends(prev => prev.filter(friend => friend._id !== friendId))
      toast.success('Friend removed successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove friend')
    }
  }

  const handleMessageFriend = (friendId: string) => {
    navigate(`/messages?user=${friendId}`)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Friends</h1>
        <p className="text-gray-600">
          {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
        </p>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
          <p className="text-gray-600 mb-4">
            Start connecting with your fellow KIU students!
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            Find Friends
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend._id} className="card p-4">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  className="h-12 w-12 rounded-full"
                  src={friend.profilePicture || `https://ui-avatars.com/api/?name=${friend.firstName}+${friend.lastName}&background=0ea5e9&color=fff`}
                  alt={friend.firstName}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {friend.firstName} {friend.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  {friend.major} • Class of {friend.startYear}
                </p>
                {friend.bio && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {friend.bio}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMessageFriend(friend._id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-kiu-600 text-white hover:bg-kiu-700 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => handleRemoveFriend(friend._id)}
                  className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Friends
