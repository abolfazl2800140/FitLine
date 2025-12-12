import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { insertUserSchema, insertPostSchema, insertQuestionSchema, insertMessageSchema, insertCoachingRequestSchema } from "@shared/schema";
import { pool } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getUserPoints, getLeaderboard, POINT_VALUES } from "./points";

// Setup multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      username: string;
      fullName: string;
      avatar?: string | null;
      role: string;
    }
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // PostgreSQL session store
  const PgSession = connectPgSimple(session);

  // Session setup with PostgreSQL store
  app.use(session({
    store: new PgSession({
      pool: pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'fitline-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: 'lax',
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config - support both email and phone login
  passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
  }, async (phone, password, done) => {
    try {
      // Try to find user by phone first, then by email
      let user = await storage.getUserByPhone(phone);
      if (!user) {
        user = await storage.getUserByEmail(phone);
      }
      if (!user) {
        return done(null, false, { message: 'Invalid phone/email or password' });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid phone/email or password' });
      }
      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      });
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
        });
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { phone, fullName, username, password, role } = req.body;

      if (!phone || !fullName || !username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Check if phone already exists
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

  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Upload progress photo
  app.post('/api/progress-photos', requireAuth, upload.single('image'), async (req, res) => {
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

  // Get user profile by ID
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUserProfile(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get follow counts
      const followCounts = await storage.getFollowCounts(req.params.id);

      // Check if current user is following this user
      let isFollowing = false;
      if (req.isAuthenticated() && req.user) {
        isFollowing = await storage.isFollowing(req.user.id, req.params.id);
      }

      res.json({ ...user, ...followCounts, isFollowing });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Follow user
  app.post('/api/users/:id/follow', requireAuth, async (req, res) => {
    try {
      if (req.user!.id === req.params.id) {
        return res.status(400).json({ message: 'Cannot follow yourself' });
      }
      await storage.followUser(req.user!.id, req.params.id);
      res.json({ message: 'Followed successfully' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Unfollow user
  app.delete('/api/users/:id/follow', requireAuth, async (req, res) => {
    try {
      await storage.unfollowUser(req.user!.id, req.params.id);
      res.json({ message: 'Unfollowed successfully' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Coach stats (for coach dashboard)
  app.get('/api/coach/stats', requireAuth, async (req, res) => {
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

  // Coach students list
  app.get('/api/coach/students', requireAuth, async (req, res) => {
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

  // Coach profile creation (for coach registration)
  app.post('/api/coach-profiles', requireAuth, async (req, res) => {
    try {
      const { specialty, experience, pricePerSession, about } = req.body;

      const profile = await storage.createCoachProfile({
        userId: req.user!.id,
        specialty,
        experience: parseInt(experience),
        pricePerSession: pricePerSession.toString(),
        about: about || null,
        isVerified: false, // Needs admin approval
      });

      res.json(profile);
    } catch (err: any) {
      res.status(400).json({ message: err.message || 'Failed to create coach profile' });
    }
  });

  // Coaches
  app.get('/api/coaches', async (req, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/coaches/:id', async (req, res) => {
    try {
      const coach = await storage.getCoach(req.params.id);
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }

      // Get like count
      const likeCount = await storage.getCoachLikeCount(req.params.id);

      // Check if current user liked this coach
      let isLiked = false;
      if (req.isAuthenticated() && req.user) {
        isLiked = await storage.isCoachLiked(req.user.id, req.params.id);
      }

      res.json({ ...coach, likeCount, isLiked });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Like/Unlike coach
  app.post('/api/coaches/:id/like', requireAuth, async (req, res) => {
    try {
      await storage.likeCoach(req.user!.id, req.params.id);
      const likeCount = await storage.getCoachLikeCount(req.params.id);
      res.json({ success: true, isLiked: true, likeCount });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete('/api/coaches/:id/like', requireAuth, async (req, res) => {
    try {
      await storage.unlikeCoach(req.user!.id, req.params.id);
      const likeCount = await storage.getCoachLikeCount(req.params.id);
      res.json({ success: true, isLiked: false, likeCount });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Programs
  app.get('/api/programs', async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/programs/:id', async (req, res) => {
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

  app.get('/api/user/programs', requireAuth, async (req, res) => {
    try {
      const programs = await storage.getUserPrograms(req.user!.id);
      res.json(programs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/programs/:id/enroll', requireAuth, async (req, res) => {
    try {
      const enrollment = await storage.enrollInProgram(req.user!.id, req.params.id);
      res.json(enrollment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Posts
  app.get('/api/posts', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const userId = req.user?.id;
      const posts = await storage.getPosts(limit, offset, userId);
      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json(post);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/user/posts', requireAuth, async (req, res) => {
    try {
      const posts = await storage.getUserPosts(req.user!.id);
      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/posts', requireAuth, async (req, res) => {
    try {
      const data = insertPostSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const post = await storage.createPost(data);
      res.json(post);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post('/api/posts/:id/like', requireAuth, async (req, res) => {
    try {
      await storage.likePost(req.user!.id, req.params.id);

      // Notify post owner
      const post = await storage.getPost(req.params.id);
      if (post && post.userId !== req.user!.id) {
        const sendToUser = (global as any).wsSendToUser;
        if (sendToUser) {
          sendToUser(post.userId, {
            type: 'post_liked',
            postId: req.params.id,
            user: { id: req.user!.id, fullName: req.user!.fullName },
          });
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete('/api/posts/:id/like', requireAuth, async (req, res) => {
    try {
      await storage.unlikePost(req.user!.id, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Comments
  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/posts/:id/comments', requireAuth, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ message: 'Content is required' });
      }
      const comment = await storage.createComment(req.user!.id, req.params.id, content);

      // Notify post owner
      const post = await storage.getPost(req.params.id);
      if (post && post.userId !== req.user!.id) {
        const sendToUser = (global as any).wsSendToUser;
        if (sendToUser) {
          sendToUser(post.userId, {
            type: 'new_comment',
            postId: req.params.id,
            comment,
            user: { id: req.user!.id, fullName: req.user!.fullName },
          });
        }
      }

      res.json(comment);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Supplements
  app.get('/api/supplements', async (req, res) => {
    try {
      const supplements = await storage.getSupplements();
      res.json(supplements);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/supplements/:id', async (req, res) => {
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

  // Cart
  app.get('/api/cart', requireAuth, async (req, res) => {
    try {
      const items = await storage.getCartItems(req.user!.id);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/cart', requireAuth, async (req, res) => {
    try {
      const { supplementId, quantity = 1 } = req.body;
      const item = await storage.addToCart(req.user!.id, supplementId, quantity);
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch('/api/cart/:id', requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      const item = await storage.updateCartItem(req.params.id, quantity);
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete('/api/cart/:id', requireAuth, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const challenges = await storage.getChallenges();
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/challenges/:id', async (req, res) => {
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

  app.get('/api/user/challenges', requireAuth, async (req, res) => {
    try {
      const challenges = await storage.getUserChallenges(req.user!.id);
      res.json(challenges);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/challenges/:id/join', requireAuth, async (req, res) => {
    try {
      const participation = await storage.joinChallenge(req.user!.id, req.params.id);
      res.json(participation);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Leagues
  app.get('/api/leagues/current', async (req, res) => {
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

  app.get('/api/leagues/my-stats', requireAuth, async (req, res) => {
    try {
      const stats = await storage.getUserLeagueStats(req.user!.id);
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Conversations & Messages
  app.get('/api/conversations', requireAuth, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user!.id);
      res.json(conversations);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/conversations/:id/messages', requireAuth, async (req, res) => {
    try {
      const data = insertMessageSchema.parse({
        conversationId: req.params.id,
        senderId: req.user!.id,
        content: req.body.content,
      });
      const message = await storage.sendMessage(data);

      // Get conversation to find recipient
      const conversations = await storage.getConversations(req.user!.id);
      const conv = conversations.find(c => c.id === req.params.id);
      if (conv?.participant?.id) {
        const sendToUser = (global as any).wsSendToUser;
        if (sendToUser) {
          sendToUser(conv.participant.id, {
            type: 'new_message',
            message,
            conversationId: req.params.id,
          });
        }
      }

      res.json(message);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Questions
  app.get('/api/questions', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const questions = await storage.getQuestions({ category });
      res.json(questions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/questions/:id', async (req, res) => {
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

  app.post('/api/questions', requireAuth, async (req, res) => {
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

  // Answers
  app.get('/api/questions/:id/answers', async (req, res) => {
    try {
      const answers = await storage.getAnswers(req.params.id);
      res.json(answers);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post('/api/questions/:id/answers', requireAuth, async (req, res) => {
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

  // Vote on answers
  app.post('/api/answers/:id/vote', requireAuth, async (req, res) => {
    try {
      const { value } = req.body; // 1 for upvote, -1 for downvote
      if (value !== 1 && value !== -1) {
        return res.status(400).json({ message: 'Invalid vote value' });
      }
      await storage.voteAnswer(req.user!.id, req.params.id, value);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Mark answer as best answer (only question owner can do this)
  app.post('/api/answers/:id/best', requireAuth, async (req, res) => {
    try {
      const result = await storage.markBestAnswer(req.user!.id, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(err.message.includes('Only') ? 403 : 500).json({ message: err.message });
    }
  });

  // Vote on questions
  app.post('/api/questions/:id/vote', requireAuth, async (req, res) => {
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

  // Progress & Badges
  app.get('/api/user/progress-photos', requireAuth, async (req, res) => {
    try {
      const photos = await storage.getProgressPhotos(req.user!.id);
      res.json(photos);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/user/badges', requireAuth, async (req, res) => {
    try {
      const badges = await storage.getUserBadges(req.user!.id);
      res.json(badges);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Points & Leaderboard
  app.get('/api/user/points', requireAuth, async (req, res) => {
    try {
      const points = await getUserPoints(req.user!.id);
      res.json({ points });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await getLeaderboard(limit);
      res.json(leaderboard);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get('/api/points/values', (req, res) => {
    res.json(POINT_VALUES);
  });

  // Coaching Requests
  app.post('/api/coaching-requests', requireAuth, async (req, res) => {
    try {
      const data = insertCoachingRequestSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      // Check if user already has a pending request to this coach
      const existingRequests = await storage.getCoachingRequestsForUser(req.user!.id);
      const hasPending = existingRequests.some(
        r => r.coach.id === data.coachId && r.status === 'pending'
      );

      if (hasPending) {
        return res.status(400).json({ message: 'شما قبلاً یک درخواست در انتظار برای این مربی دارید' });
      }

      const request = await storage.createCoachingRequest(data);

      // Notify coach about new request
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

  // Get coaching requests for current user (as student)
  app.get('/api/coaching-requests/my', requireAuth, async (req, res) => {
    try {
      const requests = await storage.getCoachingRequestsForUser(req.user!.id);
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get coaching requests for coach
  app.get('/api/coach/requests', requireAuth, async (req, res) => {
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

  // Get pending requests count for coach
  app.get('/api/coach/requests/pending-count', requireAuth, async (req, res) => {
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

  // Accept coaching request
  app.post('/api/coaching-requests/:id/accept', requireAuth, async (req, res) => {
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

      // Create or get conversation
      const conversation = await storage.getOrCreateConversation(request.userId, request.coachId);

      // Update request status
      await storage.updateCoachingRequestStatus(req.params.id, 'accepted');

      // Update request with conversation ID
      const { db } = await import('./db');
      const { coachingRequests } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      await db.update(coachingRequests)
        .set({ conversationId: conversation.id })
        .where(eq(coachingRequests.id, req.params.id));

      // Send welcome message
      const welcomeMsg = await storage.sendMessage({
        conversationId: conversation.id,
        senderId: req.user!.id,
        content: `سلام! درخواست شما برای دریافت برنامه قبول شد. من آماده‌ام تا به شما کمک کنم به اهدافتان برسید. لطفاً اطلاعات بیشتری درباره وضعیت فعلی و اهدافتان بفرستید.`,
      });

      // Notify user that request was accepted
      const sendToUser = (global as any).wsSendToUser;
      if (sendToUser) {
        sendToUser(request.userId, {
          type: 'request_accepted',
          requestId: req.params.id,
          conversationId: conversation.id,
          coach: { id: req.user!.id, fullName: req.user!.fullName },
        });
        // Also send the welcome message
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

  // Reject coaching request
  app.post('/api/coaching-requests/:id/reject', requireAuth, async (req, res) => {
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
      await storage.updateCoachingRequestStatus(req.params.id, 'rejected', reason);

      // Notify user that request was rejected
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

  // Create program and assign to student
  app.post('/api/programs/create-for-student', requireAuth, async (req, res) => {
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

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get user's programs with details
  app.get('/api/user/programs/details', requireAuth, async (req, res) => {
    try {
      const programs = await storage.getUserProgramsWithDetails(req.user!.id);
      res.json(programs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get program with all workouts
  app.get('/api/programs/:id/full', async (req, res) => {
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

  // ==================== NUTRITION PLAN APIs ====================

  // Get VAPID public key for push notifications
  app.get('/api/push/vapid-key', (req, res) => {
    const { VAPID_PUBLIC_KEY } = require('./push-notifications');
    res.json({ publicKey: VAPID_PUBLIC_KEY });
  });

  // Subscribe to push notifications
  app.post('/api/push/subscribe', requireAuth, async (req, res) => {
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

  // Unsubscribe from push notifications
  app.delete('/api/push/subscribe', requireAuth, async (req, res) => {
    try {
      const { endpoint } = req.body;
      await storage.removePushSubscription(req.user!.id, endpoint);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Create nutrition plan (coach only)
  app.post('/api/nutrition-plans', requireAuth, async (req, res) => {
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

      // ارسال نوتیفیکیشن Push به کاربر
      const { sendPushNotification } = require('./push-notifications');
      await sendPushNotification(userId, {
        title: '🎉 برنامه تغذیه جدید!',
        body: `مربی شما برنامه "${title}" را برای شما ارسال کرد`,
        data: { type: 'new_nutrition_plan', planId: plan.id, url: '/nutrition' },
      });

      // ارسال نوتیفیکیشن WebSocket به کاربر
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

  // Get user's active nutrition plan
  app.get('/api/nutrition-plans/active', requireAuth, async (req, res) => {
    try {
      const plan = await storage.getActiveNutritionPlan(req.user!.id);
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get all nutrition plans for user
  app.get('/api/nutrition-plans', requireAuth, async (req, res) => {
    try {
      const plans = await storage.getUserNutritionPlans(req.user!.id);
      res.json(plans);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get nutrition plan by ID
  app.get('/api/nutrition-plans/:id', requireAuth, async (req, res) => {
    try {
      const plan = await storage.getNutritionPlanWithMeals(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: 'برنامه تغذیه یافت نشد' });
      }

      // Check access
      if (plan.userId !== req.user!.id && plan.coachId !== req.user!.id) {
        return res.status(403).json({ message: 'شما دسترسی به این برنامه ندارید' });
      }

      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Log meal completion
  app.post('/api/meals/:id/log', requireAuth, async (req, res) => {
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
  app.get('/api/meal-logs/today', requireAuth, async (req, res) => {
    try {
      const logs = await storage.getTodayMealLogs(req.user!.id);
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Set meal reminder
  app.post('/api/meals/:id/reminder', requireAuth, async (req, res) => {
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
  app.get('/api/meal-reminders', requireAuth, async (req, res) => {
    try {
      const reminders = await storage.getUserMealReminders(req.user!.id);
      res.json(reminders);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Toggle reminder
  app.patch('/api/meal-reminders/:id', requireAuth, async (req, res) => {
    try {
      const { isEnabled } = req.body;
      const reminder = await storage.toggleMealReminder(req.params.id, isEnabled);
      res.json(reminder);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get nutrition plans created by coach for their students
  app.get('/api/coach/nutrition-plans', requireAuth, async (req, res) => {
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

  // Test push notification (for development)
  app.post('/api/push/test', requireAuth, async (req, res) => {
    try {
      const { sendPushNotification } = require('./push-notifications');
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

  // ==================== END NUTRITION PLAN APIs ====================

  // WebSocket for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, WebSocket>();

  // Helper function to send to specific user
  const sendToUser = (userId: string, message: any) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  // Helper function to broadcast to multiple users
  const broadcastToUsers = (userIds: string[], message: any) => {
    userIds.forEach(userId => sendToUser(userId, message));
  };

  // Make these available globally for use in routes
  (global as any).wsSendToUser = sendToUser;
  (global as any).wsBroadcastToUsers = broadcastToUsers;
  (global as any).wsClients = clients;

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          userId = message.userId;
          if (userId) {
            clients.set(userId, ws);
            console.log(`User ${userId} connected via WebSocket`);

            // Notify user's contacts that they're online
            ws.send(JSON.stringify({ type: 'connected', userId }));
          }
        }

        if (message.type === 'message' && userId) {
          const { conversationId, content, recipientId } = message;

          const newMessage = await storage.sendMessage({
            conversationId,
            senderId: userId,
            content,
          });

          // Send to recipient if online
          sendToUser(recipientId, {
            type: 'new_message',
            message: newMessage,
            conversationId,
          });

          // Confirm to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: newMessage,
            conversationId,
          }));
        }

        // Typing indicator
        if (message.type === 'typing' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, {
            type: 'user_typing',
            conversationId,
            userId,
          });
        }

        // Stop typing
        if (message.type === 'stop_typing' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, {
            type: 'user_stop_typing',
            conversationId,
            userId,
          });
        }

        // Mark messages as read
        if (message.type === 'mark_read' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, {
            type: 'messages_read',
            conversationId,
            readBy: userId,
          });
        }

      } catch (err) {
        console.error('WebSocket error:', err);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });
  });

  return httpServer;
}
