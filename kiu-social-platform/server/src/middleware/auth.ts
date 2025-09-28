import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await prisma.user.findUnique({
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

    req.user = user as User;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authenticatePIN = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { pin } = req.body;
  const userId = req.user?.id;

  if (!userId || !pin) {
    return res.status(400).json({ message: 'PIN required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.pin !== pin) {
      return res.status(401).json({ message: 'Invalid PIN' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
