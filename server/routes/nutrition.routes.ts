import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { sendPushNotification } from "../push-notifications";

const router = Router();

// Create nutrition plan (coach only)
router.post('/', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند برنامه تغذیه بسازند' });
    }

    const { userId, title, description, dailyCalories, dailyProtein, dailyCarbs, dailyFat, startDate, endDate, meals } = req.body;

    if (!userId || !title || !meals || meals.length === 0) {
      return res.status(400).json({ message: 'اطلاعات برنامه ناقص است' });
    }

    const plan = await storage.createNutritionPlanWithMeals({
      coachId: req.user!.id,
      userId,
      title,
      description,
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      meals,
    });

    await sendPushNotification(userId, {
      title: '🎉 برنامه تغذیه جدید!',
      body: `مربی شما برنامه "${title}" را برای شما ارسال کرد`,
      data: { type: 'new_nutrition_plan', planId: plan.id, url: '/nutrition' },
    });

    const sendToUser = (global as any).wsSendToUser;
    if (sendToUser) {
      sendToUser(userId, {
        type: 'new_nutrition_plan',
        plan,
        coach: { id: req.user!.id, fullName: req.user!.fullName },
      });
    }

    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get active nutrition plan
router.get('/active', requireAuth, async (req, res) => {
  try {
    const plan = await storage.getActiveNutritionPlan(req.user!.id);
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get all nutrition plans
router.get('/', requireAuth, async (req, res) => {
  try {
    const plans = await storage.getUserNutritionPlans(req.user!.id);
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get nutrition plan by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const plan = await storage.getNutritionPlanWithMeals(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'برنامه تغذیه یافت نشد' });
    }

    if (plan.userId !== req.user!.id && plan.coachId !== req.user!.id) {
      return res.status(403).json({ message: 'شما دسترسی به این برنامه ندارید' });
    }

    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get coach nutrition plans
router.get('/coach/list', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان دسترسی دارند' });
    }
    const plans = await storage.getCoachNutritionPlans(req.user!.id);
    res.json(plans);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Log meal completion
router.post('/meals/:id/log', requireAuth, async (req, res) => {
  try {
    const { notes, rating } = req.body;
    const log = await storage.logMealCompletion({
      userId: req.user!.id,
      mealId: req.params.id,
      notes,
      rating,
    });
    res.json(log);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get today's meal logs
router.get('/meal-logs/today', requireAuth, async (req, res) => {
  try {
    const logs = await storage.getTodayMealLogs(req.user!.id);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Set meal reminder
router.post('/meals/:id/reminder', requireAuth, async (req, res) => {
  try {
    const { reminderTime, isEnabled } = req.body;
    const reminder = await storage.setMealReminder({
      userId: req.user!.id,
      mealId: req.params.id,
      reminderTime,
      isEnabled: isEnabled !== false,
    });
    res.json(reminder);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's meal reminders
router.get('/meal-reminders', requireAuth, async (req, res) => {
  try {
    const reminders = await storage.getUserMealReminders(req.user!.id);
    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle reminder
router.patch('/meal-reminders/:id', requireAuth, async (req, res) => {
  try {
    const { isEnabled } = req.body;
    const reminder = await storage.toggleMealReminder(req.params.id, isEnabled);
    res.json(reminder);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
