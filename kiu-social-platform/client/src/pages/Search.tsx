import React, { useState, useEffect } from 'react'
import { userAPI } from '../utils/api'
import { User } from '../types'
import { Search as SearchIcon, UserPlus, UserMinus, UserX } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Search: React.FC = () => {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [friends, setFriends] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const response = await userAPI.getFriends()
      const friendIds = response.data.map(friend => friend._id)
      setFriends(new Set(friendIds))
    } catch (error) {
      console.error('Failed to load friends:', error)
    }
  }

  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([])
      return
    }

    try {
      setLoading(true)
      const response = await userAPI.searchUsers(searchQuery)
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchUsers(query)
  }

  const handleAddFriend = async (userId: string) => {
    try {
      await userAPI.addFriend(userId)
      setFriends(prev => new Set([...prev, userId]))
      toast.success('Friend added successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add friend')
    }
  }

  const handleRemoveFriend = async (userId: string) => {
    try {
      await userAPI.removeFriend(userId)
      setFriends(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
      toast.success('Friend removed successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove friend')
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await userAPI.blockUser(userId)
      setUsers(prev => prev.filter(user => user._id !== userId))
      toast.success('User blocked successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to block user')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Users</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent"
              placeholder="Search by name, username, or major..."
            />
          </div>
        </form>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : users.length === 0 && query ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <SearchIcon className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try searching with different keywords.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const isFriend = friends.has(user._id)
            
            return (
              <div key={user._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0ea5e9&color=fff`}
                      alt={user.firstName}
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                      <p className="text-sm text-gray-500">
                        {user.major} • Class of {user.startYear}
                      </p>
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isFriend ? (
                      <button
                        onClick={() => handleRemoveFriend(user._id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <UserMinus className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(user._id)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm bg-kiu-600 text-white hover:bg-kiu-700 rounded-lg transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Add Friend</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleBlockUser(user._id)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <UserX className="h-4 w-4" />
                      <span>Block</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Search
