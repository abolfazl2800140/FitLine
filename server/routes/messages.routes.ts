import { Router } from "express";
import multer from "multer";
import path from "path";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { insertMessageSchema } from "@shared/schema";
import { db } from "../db";
import { messages } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Multer for voice messages
const uploadsDir = path.join(process.cwd(), "uploads");
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: uploadStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get conversations
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const conversations = await storage.getConversations(req.user!.id);
    res.json(conversations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages in conversation
router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const msgs = await storage.getMessages(req.params.id);
    res.json(msgs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/conversations/:id/messages', requireAuth, async (req, res) => {
  try {
    const data = insertMessageSchema.parse({
      conversationId: req.params.id,
      senderId: req.user!.id,
      content: req.body.content,
      replyToId: req.body.replyToId || null,
    });
    const message = await storage.sendMessage(data);

    const conversations = await storage.getConversations(req.user!.id);
    const conv = conversations.find(c => c.id === req.params.id);
    if (conv?.participant?.id) {
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(conv.participant.id, {
          type: 'new_message',
          message,
          conversationId: req.params.id,
        });
      }
    }

    res.json(message);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Mark messages as read
router.post('/conversations/:id/read', requireAuth, async (req, res) => {
  try {
    await storage.markMessagesAsRead(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Edit message
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'محتوای پیام نمی‌تواند خالی باشد' });
    }
    const message = await storage.editMessage(req.params.id, req.user!.id, content);
    if (!message) {
      return res.status(404).json({ message: 'پیام یافت نشد یا شما اجازه ویرایش ندارید' });
    }
    res.json(message);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Delete message
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteMessage(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({ message: 'پیام یافت نشد یا شما اجازه حذف ندارید' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Add reaction
router.post('/:id/reactions', requireAuth, async (req, res) => {
  try {
    const { emoji } = req.body;
    if (!emoji) {
      return res.status(400).json({ message: 'ایموجی الزامی است' });
    }
    const reaction = await storage.addReaction(req.params.id, req.user!.id, emoji);
    
    const [message] = await db.select().from(messages).where(eq(messages.id, req.params.id)).limit(1);
    if (message && message.senderId !== req.user!.id) {
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(message.senderId, {
          type: 'reaction_added',
          messageId: req.params.id,
          conversationId: message.conversationId,
          reaction: { ...reaction, userName: req.user!.fullName },
        });
      }
    }
    
    res.json(reaction);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Remove reaction
router.delete('/:id/reactions/:emoji', requireAuth, async (req, res) => {
  try {
    await storage.removeReaction(req.params.id, req.user!.id, req.params.emoji);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get reactions
router.get('/:id/reactions', async (req, res) => {
  try {
    const reactions = await storage.getMessageReactions(req.params.id);
    res.json(reactions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Upload voice message
router.post('/voice', requireAuth, upload.single('voice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'فایل صوتی یافت نشد' });
    }
    const voiceUrl = `/uploads/${req.file.filename}`;
    const { conversationId, duration, replyToId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: 'شناسه مکالمه الزامی است' });
    }

    const message = await storage.sendMessage({
      conversationId,
      senderId: req.user!.id,
      content: '🎤 پیام صوتی',
      messageType: 'voice',
      voiceUrl,
      voiceDuration: parseInt(duration) || 0,
      replyToId: replyToId || null,
    });

    const conversations = await storage.getConversations(req.user!.id);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv?.participant?.id) {
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(conv.participant.id, {
          type: 'new_message',
          message,
          conversationId,
        });
      }
    }

    res.json(message);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
