import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthResponse, LoginCredentials, RegisterData, QuickLoginData } from '../types'
import { authAPI } from '../utils/api'

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  quickLogin: (data: QuickLoginData) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const response = await authAPI.verify()
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const quickLogin = async (data: QuickLoginData) => {
    try {
      const response = await authAPI.quickLogin(data)
      setUser(response.data.user)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    quickLogin,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
