import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { storage } from "../storage";

const router = Router();

// Middleware
export function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { phone, fullName, username, password, role } = req.body;

    if (!phone || !fullName || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingPhone = await storage.getUserByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await storage.createUser({
      phone,
      fullName,
      username,
      password: hashedPassword,
      role: role || 'user',
    });

    req.login({
      id: user.id,
      email: user.email || '',
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      role: user.role,
    }, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed after registration' });
      }
      res.json({ id: user.id, phone: user.phone, username: user.username, fullName: user.fullName });
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json(req.user);
});

// Logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logged out' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;
