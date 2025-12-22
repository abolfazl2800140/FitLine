import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { insertCoachingRequestSchema, coachingRequests } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

// Create coaching request
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = insertCoachingRequestSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });

    const existingRequests = await storage.getCoachingRequestsForUser(req.user!.id);
    const hasPending = existingRequests.some(
      r => r.coach.id === data.coachId && r.status === 'pending'
    );

    if (hasPending) {
      return res.status(400).json({ message: 'شما قبلاً یک درخواست در انتظار برای این مربی دارید' });
    }

    const requestType = data.type as string;

    if (requestType === 'workout' || requestType === 'both') {
      const workoutCount = await storage.getUserMonthlyRequestCount(req.user!.id, 'workout');
      if (workoutCount >= 1) {
        return res.status(400).json({
          message: 'شما در این ماه قبلاً یک برنامه تمرینی دریافت کرده‌اید.',
          code: 'MONTHLY_WORKOUT_LIMIT'
        });
      }
    }

    if (requestType === 'nutrition' || requestType === 'both') {
      const nutritionCount = await storage.getUserMonthlyRequestCount(req.user!.id, 'nutrition');
      if (nutritionCount >= 1) {
        return res.status(400).json({
          message: 'شما در این ماه قبلاً یک برنامه تغذیه دریافت کرده‌اید.',
          code: 'MONTHLY_NUTRITION_LIMIT'
        });
      }
    }

    const request = await storage.createCoachingRequest(data);

    const sendToUser = (global as any).wsSendToUser;
    if (sendToUser) {
      sendToUser(data.coachId, {
        type: 'new_request',
        request,
        user: { id: req.user!.id, fullName: req.user!.fullName },
      });
    }

    res.json(request);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'خطا در ثبت درخواست' });
  }
});

// Get my requests (as student)
router.get('/my', requireAuth, async (req, res) => {
  try {
    const requests = await storage.getCoachingRequestsForUser(req.user!.id);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly status
router.get('/monthly-status', requireAuth, async (req, res) => {
  try {
    const workoutCount = await storage.getUserMonthlyRequestCount(req.user!.id, 'workout');
    const nutritionCount = await storage.getUserMonthlyRequestCount(req.user!.id, 'nutrition');

    res.json({
      workout: { used: workoutCount >= 1, count: workoutCount, limit: 1 },
      nutrition: { used: nutritionCount >= 1, count: nutritionCount, limit: 1 }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get requests for coach
router.get('/coach', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند به این بخش دسترسی داشته باشند' });
    }
    const requests = await storage.getCoachingRequestsForCoach(req.user!.id);
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get pending count for coach
router.get('/coach/pending-count', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند به این بخش دسترسی داشته باشند' });
    }
    const requests = await storage.getCoachingRequestsForCoach(req.user!.id);
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    res.json({ count: pendingCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Accept request
router.post('/:id/accept', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند درخواست‌ها را قبول کنند' });
    }

    const request = await storage.getCoachingRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'درخواست یافت نشد' });
    }

    if (request.coachId !== req.user!.id) {
      return res.status(403).json({ message: 'شما اجازه دسترسی به این درخواست را ندارید' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'این درخواست قبلاً پردازش شده است' });
    }

    const updatedRequest = await storage.updateCoachingRequestStatus(req.params.id, 'accepted');
    if (!updatedRequest) {
      return res.status(400).json({ message: 'این درخواست قبلاً پردازش شده است' });
    }

    const conversation = await storage.getOrCreateConversation(request.userId, request.coachId);

    await db.update(coachingRequests)
      .set({ conversationId: conversation.id })
      .where(eq(coachingRequests.id, req.params.id));

    const welcomeMsg = await storage.sendMessage({
      conversationId: conversation.id,
      senderId: req.user!.id,
      content: `سلام! درخواست شما برای دریافت برنامه قبول شد. من آماده‌ام تا به شما کمک کنم به اهدافتان برسید.`,
    });

    const sendToUser = (global as any).wsSendToUser;
    if (sendToUser) {
      sendToUser(request.userId, {
        type: 'request_accepted',
        requestId: req.params.id,
        conversationId: conversation.id,
        coach: { id: req.user!.id, fullName: req.user!.fullName },
      });
      sendToUser(request.userId, {
        type: 'new_message',
        message: welcomeMsg,
        conversationId: conversation.id,
      });
    }

    res.json({ success: true, conversationId: conversation.id });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Reject request
router.post('/:id/reject', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند درخواست‌ها را رد کنند' });
    }

    const request = await storage.getCoachingRequest(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'درخواست یافت نشد' });
    }

    if (request.coachId !== req.user!.id) {
      return res.status(403).json({ message: 'شما اجازه دسترسی به این درخواست را ندارید' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'این درخواست قبلاً پردازش شده است' });
    }

    const { reason } = req.body;
    const updatedRequest = await storage.updateCoachingRequestStatus(req.params.id, 'rejected', reason);
    if (!updatedRequest) {
      return res.status(400).json({ message: 'این درخواست قبلاً پردازش شده است' });
    }

    const sendToUser = (global as any).wsSendToUser;
    if (sendToUser) {
      sendToUser(request.userId, {
        type: 'request_rejected',
        requestId: req.params.id,
        reason,
        coach: { id: req.user!.id, fullName: req.user!.fullName },
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
