"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatePIN = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
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
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Invalid token or user not found' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};
exports.authenticateToken = authenticateToken;
const authenticatePIN = async (req, res, next) => {
    const { pin } = req.body;
    const userId = req.user?.id;
    if (!userId || !pin) {
        return res.status(400).json({ message: 'PIN required' });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user || user.pin !== pin) {
            return res.status(401).json({ message: 'Invalid PIN' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.authenticatePIN = authenticatePIN;
//# sourceMappingURL=auth.js.map