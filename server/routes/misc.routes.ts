import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { getUserPoints, getLeaderboard, POINT_VALUES } from "../points";
import { VAPID_PUBLIC_KEY, sendPushNotification } from "../push-notifications";

const router = Router();

// Multer setup
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// ==================== CHALLENGES ====================

router.get('/challenges', async (req, res) => {
  try {
    const challenges = await storage.getChallenges();
    res.json(challenges);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/challenges/:id', async (req, res) => {
  try {
    const challenge = await storage.getChallenge(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/challenges/user/list', requireAuth, async (req, res) => {
  try {
    const challenges = await storage.getUserChallenges(req.user!.id);
    res.json(challenges);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/challenges/:id/join', requireAuth, async (req, res) => {
  try {
    const participation = await storage.joinChallenge(req.user!.id, req.params.id);
    res.json(participation);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== LEAGUES ====================

router.get('/leagues/current', async (req, res) => {
  try {
    const tier = (req.query.tier as string) || 'gold';
    const league = await storage.getLeague(tier);
    if (league) {
      const members = await storage.getLeagueMembers(league.id);
      res.json({ ...league, members });
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leagues/my-stats', requireAuth, async (req, res) => {
  try {
    const stats = await storage.getUserLeagueStats(req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== POINTS & LEADERBOARD ====================

router.get('/points', requireAuth, async (req, res) => {
  try {
    const points = await getUserPoints(req.user!.id);
    res.json({ points });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await getLeaderboard(limit);
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/points/values', (req, res) => {
  res.json(POINT_VALUES);
});

// ==================== REPORTS ====================

router.post('/reports', requireAuth, async (req, res) => {
  try {
    const { itemId, itemType, reason, description } = req.body;
    if (!itemId || !itemType || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const report = await storage.createReport({
      reporterId: req.user!.id,
      itemId,
      itemType,
      reason,
      description,
    });
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== PUSH NOTIFICATIONS ====================

router.get('/push/vapid-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post('/push/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'اطلاعات subscription ناقص است' });
    }

    await storage.savePushSubscription({
      userId: req.user!.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/push/subscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await storage.removePushSubscription(req.user!.id, endpoint);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/push/test', requireAuth, async (req, res) => {
  try {
    const sent = await sendPushNotification(req.user!.id, {
      title: '🔔 تست نوتیفیکیشن',
      body: 'این یک نوتیفیکیشن تست است!',
      data: { type: 'test' },
    });
    res.json({ success: sent });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== PROGRESS PHOTOS ====================

router.post('/progress-photos', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const { weight, bodyFat, notes } = req.body;

    const photo = await storage.createProgressPhoto({
      userId: req.user!.id,
      imageUrl,
      weight: weight || null,
      bodyFat: bodyFat || null,
      notes: notes || null,
    });

    res.json(photo);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
