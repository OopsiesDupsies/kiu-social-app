import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Update user's online status
    prisma.user.update({
      where: { id: socket.userId },
      data: { isActive: true, lastSeen: new Date() }
    });

    // Handle joining conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Handle leaving conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle sending message
    socket.on('send_message', async (data: { recipientId: string; content: string; messageType?: string }) => {
      try {
        const { recipientId, content, messageType = 'TEXT' } = data;
        const senderId = socket.userId!;

        const message = await prisma.message.create({
          data: {
            senderId,
            recipientId,
            content,
            messageType: messageType as 'TEXT' | 'IMAGE' | 'FILE'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true
              }
            },
            recipient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true
              }
            }
          }
        });

        // Send to recipient
        io.to(`user_${recipientId}`).emit('new_message', message);
        
        // Send to conversation room
        io.to(`conversation_${recipientId}`).emit('new_message', message);
        io.to(`conversation_${senderId}`).emit('new_message', message);

        // Send confirmation to sender
        socket.emit('message_sent', message);
      } catch (error) {
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { recipientId: string }) => {
      socket.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: { recipientId: string }) => {
      socket.to(`user_${data.recipientId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.userId} disconnected`);
      
      // Update user's offline status
      if (socket.userId) {
        await prisma.user.update({
          where: { id: socket.userId },
          data: { 
            isActive: false, 
            lastSeen: new Date() 
          }
        });
      }
    });
  });
};
