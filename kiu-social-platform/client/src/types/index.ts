export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  major: string;
  startYear: number;
  profilePicture?: string;
  bio?: string;
  friends: string[];
  blockedUsers: string[];
  isActive: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  images?: string[];
  likes: string[];
  comments: Comment[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment?: string;
  replies: Comment[];
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  pin: string;
  major: string;
  dateOfBirth: string;
  startYear: number;
}

export interface QuickLoginData {
  pin: string;
}
