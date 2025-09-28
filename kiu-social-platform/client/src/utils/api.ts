import axios from 'axios'
import { LoginCredentials, RegisterData, QuickLoginData, User, Post, Comment, Message, Conversation } from '../types'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials: LoginCredentials) => api.post<{ message: string; token: string; user: User }>('/auth/login', credentials),
  register: (data: RegisterData) => api.post<{ message: string; token: string; user: User }>('/auth/register', data),
  quickLogin: (data: QuickLoginData) => api.post<{ message: string; user: User }>('/auth/quick-login', data),
  verify: () => api.get<{ user: User }>('/auth/verify'),
}

export const userAPI = {
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/users/profile', data),
  searchUsers: (query: string) => api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  addFriend: (id: string) => api.post<{ message: string }>(`/users/${id}/friend`),
  removeFriend: (id: string) => api.delete<{ message: string }>(`/users/${id}/friend`),
  blockUser: (id: string) => api.post<{ message: string }>(`/users/${id}/block`),
  getFriends: () => api.get<User[]>('/users/friends/list'),
}

export const postAPI = {
  createPost: (data: { content: string; images?: string[]; isPublic?: boolean }) => 
    api.post<Post>('/posts', data),
  getFeed: (page = 1, limit = 10) => 
    api.get<Post[]>(`/posts/feed?page=${page}&limit=${limit}`),
  getUserPosts: (userId: string, page = 1, limit = 10) => 
    api.get<Post[]>(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  likePost: (id: string) => api.post<{ isLiked: boolean; likesCount: number }>(`/posts/${id}/like`),
  addComment: (postId: string, data: { content: string; parentCommentId?: string }) => 
    api.post<Comment>(`/posts/${postId}/comments`, data),
  getComments: (postId: string, page = 1, limit = 20) => 
    api.get<Comment[]>(`/posts/${postId}/comments?page=${page}&limit=${limit}`),
  likeComment: (id: string) => api.post<{ isLiked: boolean; likesCount: number }>(`/posts/comments/${id}/like`),
}

export const messageAPI = {
  sendMessage: (data: { recipientId: string; content: string; messageType?: string }) => 
    api.post<Message>('/messages', data),
  getConversation: (userId: string, page = 1, limit = 50) => 
    api.get<Message[]>(`/messages/conversation/${userId}?page=${page}&limit=${limit}`),
  getConversations: () => api.get<Conversation[]>('/messages/conversations'),
  markAsRead: (userId: string) => api.put<{ message: string }>(`/messages/read/${userId}`),
}

export default api
