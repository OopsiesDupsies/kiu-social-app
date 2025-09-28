import express from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create post
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { content, images, isPublic } = req.body;
    const authorId = req.user!.id;

    const post = await prisma.post.create({
      data: {
        authorId,
        content,
        images: images || [],
        isPublic: isPublic !== false
      },
      include: {
        author: {
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

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed)
router.get('/feed', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
            major: true,
            startYear: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        likes: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId, 
        isPublic: true 
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true,
            major: true,
            startYear: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        likes: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', async (req: AuthRequest, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    if (existingLike) {
      // Unlike the post
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId
          }
        }
      });
      
      const likesCount = await prisma.postLike.count({
        where: { postId }
      });
      
      res.json({ isLiked: false, likesCount });
    } else {
      // Like the post
      await prisma.postLike.create({
        data: {
          userId,
          postId
        }
      });
      
      const likesCount = await prisma.postLike.count({
        where: { postId }
      });
      
      res.json({ isLiked: true, likesCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment
router.post('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const postId = req.params.id;
    const authorId = req.user!.id;

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        content,
        parentCommentId: parentCommentId || null
      },
      include: {
        author: {
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

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get post comments
router.get('/:id/comments', async (req: AuthRequest, res) => {
  try {
    const postId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { 
        postId, 
        parentCommentId: null 
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            profilePicture: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profilePicture: true
              }
            }
          }
        },
        likes: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike comment
router.post('/comments/:id/like', async (req: AuthRequest, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user!.id;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already liked the comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId
        }
      }
    });

    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId
          }
        }
      });
      
      const likesCount = await prisma.commentLike.count({
        where: { commentId }
      });
      
      res.json({ isLiked: false, likesCount });
    } else {
      // Like the comment
      await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      });
      
      const likesCount = await prisma.commentLike.count({
        where: { commentId }
      });
      
      res.json({ isLiked: true, likesCount });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
