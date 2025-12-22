import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { insertPostSchema } from "@shared/schema";

const router = Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = req.user?.id;
    const posts = await storage.getPosts(limit, offset, userId);
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user?.id;
    const post = await storage.getPost(req.params.id, userId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = insertPostSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });
    const post = await storage.createPost(data);
    res.json(post);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Like post
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    await storage.likePost(req.user!.id, req.params.id);

    const post = await storage.getPost(req.params.id);
    if (post && post.userId !== req.user!.id) {
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(post.userId, {
          type: 'post_liked',
          postId: req.params.id,
          user: { id: req.user!.id, fullName: req.user!.fullName },
        });
      }
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Unlike post
router.delete('/:id/like', requireAuth, async (req, res) => {
  try {
    await storage.unlikePost(req.user!.id, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Bookmark post
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleBookmark(req.user!.id, req.params.id, 'post');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await storage.getComments(req.params.id);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create comment
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const comment = await storage.createComment(req.user!.id, req.params.id, content, parentId);

    const post = await storage.getPost(req.params.id);
    if (post && post.userId !== req.user!.id) {
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(post.userId, {
          type: 'new_comment',
          postId: req.params.id,
          comment,
          user: { id: req.user!.id, fullName: req.user!.fullName },
        });
      }
    }

    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get comment replies
router.get('/comments/:id/replies', async (req, res) => {
  try {
    const replies = await storage.getCommentReplies(req.params.id);
    res.json(replies);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get user posts
router.get('/user/posts', requireAuth, async (req, res) => {
  try {
    const posts = await storage.getUserPosts(req.user!.id);
    res.json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
