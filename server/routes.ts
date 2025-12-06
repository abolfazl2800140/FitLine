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
import { insertUserSchema, insertPostSchema, insertQuestionSchema, insertMessageSchema } from "@shared/schema";
import { pool } from "./db";

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

  // Passport config
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
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
      const data = insertUserSchema.parse(req.body);

      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.login({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
      }, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration' });
        }
        res.json({ id: user.id, email: user.email, username: user.username, fullName: user.fullName });
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

  // WebSocket for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          userId = message.userId;
          if (userId) {
            clients.set(userId, ws);
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
          const recipientWs = clients.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: newMessage,
            }));
          }

          // Confirm to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: newMessage,
          }));
        }
      } catch (err) {
        console.error('WebSocket error:', err);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return httpServer;
}
