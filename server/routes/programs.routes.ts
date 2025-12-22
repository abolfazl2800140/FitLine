import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { sendPushNotification } from "../push-notifications";

const router = Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const programs = await storage.getPrograms();
    res.json(programs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single program
router.get('/:id', async (req, res) => {
  try {
    const program = await storage.getProgram(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    res.json(program);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get program with workouts
router.get('/:id/full', async (req, res) => {
  try {
    const program = await storage.getProgramWithWorkouts(req.params.id);
    if (!program) {
      return res.status(404).json({ message: 'برنامه یافت نشد' });
    }
    res.json(program);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll in program
router.post('/:id/enroll', requireAuth, async (req, res) => {
  try {
    const enrollment = await storage.enrollInProgram(req.user!.id, req.params.id);
    res.json(enrollment);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get user programs
router.get('/user/list', requireAuth, async (req, res) => {
  try {
    const programs = await storage.getUserPrograms(req.user!.id);
    res.json(programs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get user programs with details
router.get('/user/details', requireAuth, async (req, res) => {
  try {
    const programs = await storage.getUserProgramsWithDetails(req.user!.id);
    res.json(programs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create program for student (coach only)
router.post('/create-for-student', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: 'فقط مربیان می‌توانند برنامه بسازند' });
    }

    const { studentId, title, durationWeeks, days } = req.body;

    if (!studentId || !days || days.length === 0) {
      return res.status(400).json({ message: 'اطلاعات برنامه ناقص است' });
    }

    const result = await storage.createProgramWithWorkouts({
      coachId: req.user!.id,
      studentId,
      title: title || 'برنامه تمرینی',
      durationWeeks: durationWeeks || 4,
      days,
    });

    try {
      await sendPushNotification(studentId, {
        title: '🎉 برنامه جدید!',
        body: `مربی ${req.user!.fullName} برنامه "${title || 'برنامه تمرینی'}" رو برات فرستاد`,
        tag: 'new-program',
        data: { type: 'new_program', programId: result.program.id, url: '/programs' },
        actions: [{ action: 'view', title: 'مشاهده برنامه' }],
      });
    } catch (notifError) {
      console.error('Failed to send program notification:', notifError);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
