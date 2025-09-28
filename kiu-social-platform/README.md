# KIU Social Platform

A comprehensive social platform designed specifically for Kutaisi International University (KIU) students. This platform enables students to connect, share posts, communicate, and build a vibrant academic community.

## Features

### 🔐 Authentication
- **KIU Email Validation**: Only students with @kiu.edu.ge email addresses can register
- **Secure Registration**: First name, last name, username, password, and PIN required
- **Quick Login**: PIN-based quick login for convenience
- **JWT Authentication**: Secure token-based authentication

### 👥 User Management
- **Profile Management**: Complete user profiles with bio, major, and academic year
- **Friend System**: Add, remove, and manage friends
- **User Search**: Search by name, username, or major
- **Blocking System**: Block unwanted users

### 📱 Social Features
- **Posts**: Create and share posts with text and images
- **Comments**: Comment on posts with nested replies
- **Likes**: Like posts and comments
- **Feed**: View posts from the community

### 💬 Messaging
- **Real-time Chat**: Instant messaging with Socket.io
- **Conversation Management**: Organized conversation list
- **Message History**: Persistent message storage
- **Typing Indicators**: Real-time typing status

### 🎨 Modern UI
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Tailwind CSS**: Beautiful, modern styling
- **Dark/Light Mode**: User preference support
- **Intuitive Navigation**: Easy-to-use interface

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** with **Prisma** ORM (recommended)
- **MongoDB** with **Mongoose** ODM (legacy support)
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **React Router** for navigation
- **React Hook Form** for form management
- **Socket.io Client** for real-time features
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher) or **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

> **Note**: This application now supports both PostgreSQL and MongoDB. PostgreSQL is recommended for better performance and data integrity.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kiu-social-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp server/env.example server/.env
   
   # Edit the .env file with your configuration
   # For PostgreSQL (recommended):
   # DATABASE_URL="postgresql://username:password@localhost:5432/kiu_social?schema=public"
   # For MongoDB:
   # MONGODB_URI=mongodb://localhost:27017/kiu-social
   # JWT_SECRET=your-super-secret-jwt-key
   # PORT=5000
   # CLIENT_URL=http://localhost:5173
   ```

4. **Set up Database**
   - **PostgreSQL (Recommended)**: Follow the [PostgreSQL Setup Guide](POSTGRESQL_SETUP.md)
   - **MongoDB**: Make sure MongoDB is running on your system

5. **Run the application**
   ```bash
   # For PostgreSQL setup
   node setup-postgres.js
   
   # For MongoDB setup
   node setup.js
   
   # Start both frontend and backend in development mode
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server:dev
   
   # Frontend only
   npm run client:dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Project Structure

```
kiu-social-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── socket/        # Socket.io handlers
│   └── dist/              # Compiled JavaScript
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/quick-login` - Quick login with PIN
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/friend` - Add friend
- `DELETE /api/users/:id/friend` - Remove friend
- `POST /api/users/:id/block` - Block user
- `GET /api/users/friends/list` - Get friends list

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get posts feed
- `GET /api/posts/user/:userId` - Get user posts
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/comments/:id/like` - Like/unlike comment

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get conversations list
- `PUT /api/messages/read/:userId` - Mark messages as read

## Database Schema

### PostgreSQL Schema (Recommended)

The application uses Prisma ORM with PostgreSQL. The schema includes:

- **users** - User accounts and profiles
- **posts** - Social media posts
- **comments** - Comments on posts (with nested replies)
- **messages** - Direct messages between users
- **user_friends** - Friend relationships (many-to-many)
- **user_blocks** - Blocked user relationships
- **post_likes** - Post likes (many-to-many)
- **comment_likes** - Comment likes (many-to-many)

### MongoDB Schema (Legacy)

### User Model
```typescript
{
  email: string (unique, @kiu.edu.ge validation)
  firstName: string
  lastName: string
  username: string (unique)
  password: string (hashed)
  pin: string (4 digits)
  major: string
  dateOfBirth: Date
  startYear: number
  profilePicture?: string
  bio?: string
  friends: ObjectId[]
  blockedUsers: ObjectId[]
  isActive: boolean
  lastSeen: Date
}
```

### Post Model
```typescript
{
  author: ObjectId (ref: User)
  content: string
  images?: string[]
  likes: ObjectId[]
  comments: ObjectId[]
  isPublic: boolean
}
```

### Comment Model
```typescript
{
  post: ObjectId (ref: Post)
  author: ObjectId (ref: User)
  content: string
  parentComment?: ObjectId (ref: Comment)
  replies: ObjectId[]
  likes: ObjectId[]
}
```

### Message Model
```typescript
{
  sender: ObjectId (ref: User)
  recipient: ObjectId (ref: User)
  content: string
  messageType: 'text' | 'image' | 'file'
  isRead: boolean
  readAt?: Date
}
```

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm run dev
```

### Building for Production
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- **Email Validation**: Only KIU email addresses allowed
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: Express validator for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet**: Security headers middleware

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@kiu.edu.ge or create an issue in the repository.

## Acknowledgments

- Kutaisi International University for providing the platform requirements
- The open-source community for the amazing tools and libraries
- All contributors who help make this project better
