import { Router } from "express";
import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";

const router = Router();

// Get user settings
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }
    res.json({
      notifications: {
        workout: user.notifyWorkout ?? true,
        messages: user.notifyMessages ?? true,
        social: user.notifySocial ?? true,
      },
      privacy: {
        publicProfile: user.publicProfile ?? true,
        showProgress: user.showProgress ?? true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت تنظیمات' });
  }
});

// Update user settings
router.patch('/', requireAuth, async (req, res) => {
  try {
    const { notifications, privacy } = req.body;
    const updateData: any = {};

    if (notifications) {
      if (typeof notifications.workout === 'boolean') updateData.notifyWorkout = notifications.workout;
      if (typeof notifications.messages === 'boolean') updateData.notifyMessages = notifications.messages;
      if (typeof notifications.social === 'boolean') updateData.notifySocial = notifications.social;
    }

    if (privacy) {
      if (typeof privacy.publicProfile === 'boolean') updateData.publicProfile = privacy.publicProfile;
      if (typeof privacy.showProgress === 'boolean') updateData.showProgress = privacy.showProgress;
    }

    const user = await storage.updateUser(req.user!.id, updateData);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    res.json({
      notifications: {
        workout: user.notifyWorkout ?? true,
        messages: user.notifyMessages ?? true,
        social: user.notifySocial ?? true,
      },
      privacy: {
        publicProfile: user.publicProfile ?? true,
        showProgress: user.showProgress ?? true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در ذخیره تنظیمات' });
  }
});

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'رمز عبور فعلی و جدید الزامی است' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد' });
    }

    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'رمز عبور فعلی اشتباه است' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUser(req.user!.id, { password: hashedPassword });

    res.json({ message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در تغییر رمز عبور' });
  }
});

// Delete account
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'رمز عبور الزامی است' });
    }

    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'رمز عبور اشتباه است' });
    }

    await storage.deleteUser(req.user!.id);

    req.logout(() => {
      res.json({ message: 'حساب کاربری با موفقیت حذف شد' });
    });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف حساب کاربری' });
  }
});

// Dashboard stats
router.get('/dashboard-stats', requireAuth, async (req, res) => {
  try {
    const stats = await storage.getUserDashboardStats(req.user!.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Progress photos
router.get('/progress-photos', requireAuth, async (req, res) => {
  try {
    const photos = await storage.getProgressPhotos(req.user!.id);
    res.json(photos);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Badges
router.get('/badges', requireAuth, async (req, res) => {
  try {
    const badges = await storage.getUserBadges(req.user!.id);
    res.json(badges);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
