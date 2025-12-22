import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";

const router = Router();

// Get all coaches
router.get('/', async (req, res) => {
  try {
    const coaches = await storage.getCoaches();
    res.json(coaches);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single coach
router.get('/:id', async (req, res) => {
  try {
    const coach = await storage.getCoach(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    const likeCount = await storage.getCoachLikeCount(req.params.id);
    let isLiked = false;
    if (req.isAuthenticated() && req.user) {
      isLiked = await storage.isCoachLiked(req.user.id, req.params.id);
    }

    res.json({ ...coach, likeCount, isLiked });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create coach profile
router.post('/profiles', requireAuth, async (req, res) => {
  try {
    const { specialty, experience, pricePerSession, about } = req.body;

    const profile = await storage.createCoachProfile({
      userId: req.user!.id,
      specialty,
      experience: parseInt(experience),
      pricePerSession: pricePerSession.toString(),
      about: about || null,
      isVerified: false,
    });

    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to create coach profile' });
  }
});

// Like coach
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    await storage.likeCoach(req.user!.id, req.params.id);
    const likeCount = await storage.getCoachLikeCount(req.params.id);
    res.json({ success: true, isLiked: true, likeCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Unlike coach
router.delete('/:id/like', requireAuth, async (req, res) => {
  try {
    await storage.unlikeCoach(req.user!.id, req.params.id);
    const likeCount = await storage.getCoachLikeCount(req.params.id);
    res.json({ success: true, isLiked: false, likeCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Coach stats
router.get('/dashboard/stats', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can access this' });
    }
    const stats = await storage.getCoachStats(req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Coach students
router.get('/dashboard/students', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can access this' });
    }
    const students = await storage.getCoachStudents(req.user!.id);
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
