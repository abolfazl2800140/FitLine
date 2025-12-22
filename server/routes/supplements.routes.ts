import { Router } from "express";
import { storage } from "../storage";
import { requireAuth } from "./auth.routes";

const router = Router();

// Get all supplements
router.get('/', async (req, res) => {
  try {
    const supplements = await storage.getSupplements();
    res.json(supplements);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get single supplement
router.get('/:id', async (req, res) => {
  try {
    const supplement = await storage.getSupplement(req.params.id);
    if (!supplement) {
      return res.status(404).json({ message: 'Supplement not found' });
    }
    res.json(supplement);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await storage.getSupplementReviews(req.params.id);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Create review
router.post('/:id/reviews', requireAuth, async (req, res) => {
  try {
    const hasPurchased = await storage.hasUserPurchasedSupplement(req.user!.id, req.params.id);
    if (!hasPurchased) {
      return res.status(403).json({ message: 'فقط خریداران این محصول می‌توانند نظر ثبت کنند' });
    }

    const { rating, comment } = req.body;
    const review = await storage.createSupplementReview({
      supplementId: req.params.id,
      userId: req.user!.id,
      rating,
      comment,
    });
    res.json(review);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Check if can review
router.get('/:id/can-review', requireAuth, async (req, res) => {
  try {
    const hasPurchased = await storage.hasUserPurchasedSupplement(req.user!.id, req.params.id);
    res.json({ canReview: hasPurchased });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Cart routes
router.get('/cart/items', requireAuth, async (req, res) => {
  try {
    const items = await storage.getCartItems(req.user!.id);
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/cart/items', requireAuth, async (req, res) => {
  try {
    const { supplementId, quantity = 1 } = req.body;
    const item = await storage.addToCart(req.user!.id, supplementId, quantity);
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/cart/items/:id', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await storage.updateCartItem(req.params.id, quantity);
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/cart/items/:id', requireAuth, async (req, res) => {
  try {
    await storage.removeFromCart(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
