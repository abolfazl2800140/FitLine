import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";
import { insertExerciseTutorialSchema, insertArticleSchema } from "@shared/schema";

const router = Router();

// ==================== TUTORIALS ====================

router.get('/tutorials', async (req, res) => {
  try {
    const { muscleGroup, difficulty } = req.query;
    const tutorials = await storage.getExerciseTutorials(
      muscleGroup as string | undefined,
      difficulty as string | undefined
    );
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tutorials" });
  }
});

router.get('/tutorials/:id', requireAuth, async (req, res) => {
  try {
    const tutorial = await storage.getExerciseTutorial(req.params.id);
    if (!tutorial) {
      return res.status(404).json({ message: "Tutorial not found" });
    }
    await storage.incrementTutorialViews(req.params.id);
    
    const isLiked = await storage.isTutorialLiked(req.params.id, req.user!.id);
    const isBookmarked = await storage.isBookmarked(req.user!.id, req.params.id, 'tutorial');
    
    res.json({ ...tutorial, viewCount: tutorial.viewCount + 1, isLiked, isBookmarked });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tutorial" });
  }
});

router.post('/tutorials', requireAuth, async (req, res) => {
  try {
    const coachProfile = await storage.getCoachProfile(req.user!.id);
    if (!coachProfile || !coachProfile.isVerified) {
      return res.status(403).json({ message: "Only verified coaches can create tutorials" });
    }
    const data = insertExerciseTutorialSchema.parse({ ...req.body, coachId: req.user!.id });
    const tutorial = await storage.createExerciseTutorial(data);
    res.status(201).json(tutorial);
  } catch (error) {
    res.status(400).json({ message: "Invalid tutorial data" });
  }
});

router.post('/tutorials/:id/like', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleTutorialLike(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

router.post('/tutorials/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleBookmark(req.user!.id, req.params.id, 'tutorial');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

// ==================== ARTICLES ====================

router.get('/articles', async (req, res) => {
  try {
    const { category } = req.query;
    const articles = await storage.getArticles(category as string | undefined);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch articles" });
  }
});

router.get('/articles/:id', requireAuth, async (req, res) => {
  try {
    const article = await storage.getArticle(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    await storage.incrementArticleViews(req.params.id);
    
    const isLiked = await storage.isArticleLiked(req.params.id, req.user!.id);
    const isBookmarked = await storage.isBookmarked(req.user!.id, req.params.id, 'article');
    
    res.json({ ...article, viewCount: article.viewCount + 1, isLiked, isBookmarked });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch article" });
  }
});

router.post('/articles', requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== 'coach') {
      return res.status(403).json({ message: "Only coaches can create articles" });
    }
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100) + '-' + Date.now();
    const data = insertArticleSchema.parse({ ...req.body, authorId: req.user!.id, slug });
    const article = await storage.createArticle(data);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: "Invalid article data" });
  }
});

router.post('/articles/:id/like', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleArticleLike(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

router.post('/articles/:id/bookmark', requireAuth, async (req, res) => {
  try {
    const result = await storage.toggleBookmark(req.user!.id, req.params.id, 'article');
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle bookmark" });
  }
});

// ==================== BOOKMARKS ====================

router.get('/bookmarks', requireAuth, async (req, res) => {
  try {
    const bookmarks = await storage.getUserBookmarks(req.user!.id);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookmarks" });
  }
});

export default router;
