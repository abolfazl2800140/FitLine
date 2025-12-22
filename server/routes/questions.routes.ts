import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { insertQuestionSchema } from "@shared/schema";

const router = Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const questions = await storage.getQuestions({ category });
    res.json(questions);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single question
router.get('/:id', async (req, res) => {
  try {
    const question = await storage.getQuestion(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create question
router.post('/', requireAuth, async (req, res) => {
  try {
    const data = insertQuestionSchema.parse({
      ...req.body,
      userId: req.user!.id,
    });
    const question = await storage.createQuestion(data);
    res.json(question);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Vote on question
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }
    await storage.voteQuestion(req.user!.id, req.params.id, value);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Bookmark question
router.post('/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleBookmark(req.user!.id, req.params.id, 'question');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

// Get answers
router.get('/:id/answers', async (req, res) => {
  try {
    const answers = await storage.getAnswers(req.params.id);
    res.json(answers);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create answer
router.post('/:id/answers', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    const answer = await storage.createAnswer(req.user!.id, req.params.id, content);
    res.json(answer);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Vote on answer
router.post('/answers/:id/vote', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    if (value !== 1 && value !== -1) {
      return res.status(400).json({ message: 'Invalid vote value' });
    }
    await storage.voteAnswer(req.user!.id, req.params.id, value);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Mark best answer
router.post('/answers/:id/best', requireAuth, async (req, res) => {
  try {
    const result = await storage.markBestAnswer(req.user!.id, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(err.message.includes('Only') ? 403 : 500).json({ message: err.message });
  }
});

export default router;
