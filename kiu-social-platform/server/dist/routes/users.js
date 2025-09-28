"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                major: true,
                startYear: true,
                profilePicture: true,
                bio: true,
                isActive: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Update profile
router.put('/profile', async (req, res) => {
    try {
        const { firstName, lastName, bio, profilePicture } = req.body;
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, bio, profilePicture },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                username: true,
                major: true,
                startYear: true,
                profilePicture: true,
                bio: true,
                isActive: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Search users
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Search query required' });
        }
        const users = await prisma_1.prisma.user.findMany({
            where: {
                AND: [
                    { id: { not: req.user.id } },
                    { isActive: true },
                    {
                        OR: [
                            { firstName: { contains: q, mode: 'insensitive' } },
                            { lastName: { contains: q, mode: 'insensitive' } },
                            { username: { contains: q, mode: 'insensitive' } },
                            { major: { contains: q, mode: 'insensitive' } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                major: true,
                startYear: true,
                profilePicture: true,
                bio: true,
                isActive: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true
            },
            take: 20
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                major: true,
                startYear: true,
                profilePicture: true,
                bio: true,
                isActive: true,
                lastSeen: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user || !user.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Add friend
router.post('/:id/friend', async (req, res) => {
    try {
        const friendId = req.params.id;
        const userId = req.user.id;
        if (friendId === userId) {
            return res.status(400).json({ message: 'Cannot add yourself as friend' });
        }
        const friend = await prisma_1.prisma.user.findUnique({
            where: { id: friendId }
        });
        if (!friend || !friend.isActive) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if already friends
        const existingFriendship = await prisma_1.prisma.userFriend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });
        if (existingFriendship) {
            return res.status(400).json({ message: 'Already friends' });
        }
        // Create friendship (bidirectional)
        await prisma_1.prisma.userFriend.createMany({
            data: [
                { userId, friendId },
                { userId: friendId, friendId: userId }
            ]
        });
        res.json({ message: 'Friend added successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Remove friend
router.delete('/:id/friend', async (req, res) => {
    try {
        const friendId = req.params.id;
        const userId = req.user.id;
        const friend = await prisma_1.prisma.user.findUnique({
            where: { id: friendId }
        });
        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Remove friendship (bidirectional)
        await prisma_1.prisma.userFriend.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });
        res.json({ message: 'Friend removed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Block user
router.post('/:id/block', async (req, res) => {
    try {
        const userId = req.user.id;
        const blockUserId = req.params.id;
        const blockUser = await prisma_1.prisma.user.findUnique({
            where: { id: blockUserId }
        });
        if (!blockUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Remove from friends if they were friends
        await prisma_1.prisma.userFriend.deleteMany({
            where: {
                OR: [
                    { userId, friendId: blockUserId },
                    { userId: blockUserId, friendId: userId }
                ]
            }
        });
        // Add to blocked users
        await prisma_1.prisma.userBlock.upsert({
            where: {
                userId_blockedId: {
                    userId,
                    blockedId: blockUserId
                }
            },
            update: {},
            create: {
                userId,
                blockedId: blockUserId
            }
        });
        res.json({ message: 'User blocked successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
// Get friends
router.get('/friends/list', async (req, res) => {
    try {
        const friends = await prisma_1.prisma.userFriend.findMany({
            where: { userId: req.user.id },
            include: {
                friend: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                        profilePicture: true,
                        major: true,
                        startYear: true
                    }
                }
            }
        });
        const friendList = friends.map(friendship => friendship.friend);
        res.json(friendList);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map