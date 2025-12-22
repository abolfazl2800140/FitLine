import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { sendPushNotification } from "../push-notifications";

const router = Router();

// Multer setup
const uploadsDir = path.join(process.cwd(), "uploads");
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await storage.getUserProfile(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserId = req.isAuthenticated() ? req.user?.id : null;
    const isOwnProfile = currentUserId === req.params.id;

    let isFollowing = false;
    if (currentUserId && !isOwnProfile) {
      isFollowing = await storage.isFollowing(currentUserId, req.params.id);
    }

    const followCounts = await storage.getFollowCounts(req.params.id);
    let responseData = { ...user, ...followCounts, isFollowing };
    
    if (!user.showProgress && !isOwnProfile) {
      responseData = { ...responseData, progressPhotos: [], progressMetrics: [] };
    }

    res.json(responseData);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Follow user
router.post('/:id/follow', requireAuth, async (req, res) => {
  try {
    if (req.user!.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    await storage.followUser(req.user!.id, req.params.id);
    
    const followCounts = await storage.getFollowCounts(req.params.id);
    const sendToUser = (global as any).wsSendToUser;
    if (sendToUser) {
      sendToUser(req.params.id, {
        type: 'new_follower',
        follower: { id: req.user!.id, fullName: req.user!.fullName, username: req.user!.username, avatar: req.user!.avatar },
        followCounts,
      });
    }
    
    sendPushNotification(req.params.id, {
      title: '👤 دنبال‌کننده جدید',
      body: `${req.user!.fullName} شما را دنبال کرد`,
      tag: 'new-follower',
      data: { type: 'new_follower', url: `/profile/${req.user!.id}` },
    });
    
    res.json({ message: 'Followed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Unfollow user
router.delete('/:id/follow', requireAuth, async (req, res) => {
  try {
    await storage.unfollowUser(req.user!.id, req.params.id);
    res.json({ message: 'Unfollowed successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Upload avatar
router.post('/avatar', requireAuth, (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'حجم فایل نباید بیشتر از ۵ مگابایت باشد' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لطفاً یک تصویر انتخاب کنید' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await storage.updateUser(req.user!.id, { avatar: avatarUrl });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    req.user!.avatar = avatarUrl;
    res.json({ avatar: avatarUrl });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
