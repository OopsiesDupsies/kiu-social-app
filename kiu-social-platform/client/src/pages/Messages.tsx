import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSocket } from '../contexts/SocketContext'
import { messageAPI } from '../utils/api'
import { Message, Conversation, User } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { Send, Search, Users, MessageCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket, sendMessage, joinConversation, leaveConversation } = useSocket()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    loadConversations()
    
    // Check if there's a user parameter in URL
    const userId = searchParams.get('user')
    if (userId) {
      setSelectedConversation(userId)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation)
      joinConversation(selectedConversation)
    }

    return () => {
      if (selectedConversation) {
        leaveConversation(selectedConversation)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (message: Message) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      })

      return () => {
        socket.off('new_message')
      }
    }
  }, [socket])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      setLoading(true)
      const response = await messageAPI.getConversations()
      setConversations(response.data)
    } catch (error) {
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      setMessagesLoading(true)
      const response = await messageAPI.getConversation(userId)
      setMessages(response.data)
      scrollToBottom()
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      sendMessage({
        recipientId: selectedConversation,
        content: newMessage.trim(),
        messageType: 'text'
      })
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleConversationSelect = (userId: string) => {
    setSelectedConversation(userId)
    setSearchQuery('')
  }

  const filteredConversations = conversations.filter(conv =>
    conv.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(conv => conv.user._id === selectedConversation)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-gray-400 mb-2">
                <MessageCircle className="mx-auto h-8 w-8" />
              </div>
              <p className="text-sm text-gray-600">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.user._id}
                  onClick={() => handleConversationSelect(conversation.user._id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${
                    selectedConversation === conversation.user._id ? 'bg-kiu-50 border-r-2 border-kiu-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={conversation.user.profilePicture || `https://ui-avatars.com/api/?name=${conversation.user.firstName}+${conversation.user.lastName}&background=0ea5e9&color=fff`}
                      alt={conversation.user.firstName}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.user.firstName} {conversation.user.lastName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-kiu-600 text-white text-xs rounded-full px-2 py-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={selectedConv?.user.profilePicture || `https://ui-avatars.com/api/?name=${selectedConv?.user.firstName}+${selectedConv?.user.lastName}&background=0ea5e9&color=fff`}
                  alt={selectedConv?.user.firstName}
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {selectedConv?.user.firstName} {selectedConv?.user.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">@{selectedConv?.user.username}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <MessageCircle className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Start a conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender._id === selectedConversation ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === selectedConversation
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-kiu-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender._id === selectedConversation
                          ? 'text-gray-500'
                          : 'text-kiu-100'
                      }`}>
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kiu-500 focus:border-transparent"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-kiu-600 text-white rounded-lg hover:bg-kiu-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <Users className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
