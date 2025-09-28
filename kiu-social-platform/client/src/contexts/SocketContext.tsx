import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { Message } from '../types'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (data: { recipientId: string; content: string; messageType?: string }) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  startTyping: (recipientId: string) => void
  stopTyping: (recipientId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token')
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const sendMessage = (data: { recipientId: string; content: string; messageType?: string }) => {
    if (socket) {
      socket.emit('send_message', data)
    }
  }

  const joinConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('join_conversation', conversationId)
    }
  }

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId)
    }
  }

  const startTyping = (recipientId: string) => {
    if (socket) {
      socket.emit('typing_start', { recipientId })
    }
  }

  const stopTyping = (recipientId: string) => {
    if (socket) {
      socket.emit('typing_stop', { recipientId })
    }
  }

  const value = {
    socket,
    isConnected,
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
