"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user || !user.isActive) {
                return next(new Error('User not found or inactive'));
            }
            socket.userId = user.id;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);
        // Join user to their personal room
        socket.join(`user_${socket.userId}`);
        // Update user's online status
        prisma_1.prisma.user.update({
            where: { id: socket.userId },
            data: { isActive: true, lastSeen: new Date() }
        });
        // Handle joining conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });
        // Handle leaving conversation room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });
        // Handle sending message
        socket.on('send_message', async (data) => {
            try {
                const { recipientId, content, messageType = 'TEXT' } = data;
                const senderId = socket.userId;
                const message = await prisma_1.prisma.message.create({
                    data: {
                        senderId,
                        recipientId,
                        content,
                        messageType: messageType
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
            }
            catch (error) {
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });
        // Handle typing indicators
        socket.on('typing_start', (data) => {
            socket.to(`user_${data.recipientId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping: true
            });
        });
        socket.on('typing_stop', (data) => {
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
                await prisma_1.prisma.user.update({
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
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketHandlers.js.map