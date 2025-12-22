import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { pool } from "../db";
import { storage } from "../storage";

// Import route modules
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import postsRoutes from "./posts.routes";
import coachesRoutes from "./coaches.routes";
import messagesRoutes from "./messages.routes";
import programsRoutes from "./programs.routes";
import questionsRoutes from "./questions.routes";
import coachingRoutes from "./coaching.routes";
import supplementsRoutes from "./supplements.routes";
import educationRoutes from "./education.routes";
import settingsRoutes from "./settings.routes";
import nutritionRoutes from "./nutrition.routes";
import miscRoutes from "./misc.routes";

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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // PostgreSQL session store
  const PgSession = connectPgSimple(session);

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
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  passport.use(new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
  }, async (phone, password, done) => {
    try {
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

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Register all routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/user', settingsRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/comments', postsRoutes); // For /api/comments/:id/replies
  app.use('/api/coaches', coachesRoutes);
  app.use('/api/coach-profiles', coachesRoutes);
  app.use('/api/coach', coachesRoutes);
  app.use('/api', messagesRoutes); // For /api/conversations and /api/messages
  app.use('/api/programs', programsRoutes);
  app.use('/api/questions', questionsRoutes);
  app.use('/api/answers', questionsRoutes);
  app.use('/api/coaching-requests', coachingRoutes);
  app.use('/api/supplements', supplementsRoutes);
  app.use('/api/cart', supplementsRoutes);
  app.use('/api', educationRoutes); // For /api/tutorials, /api/articles, /api/bookmarks
  app.use('/api/nutrition-plans', nutritionRoutes);
  app.use('/api', miscRoutes); // For challenges, leagues, points, reports, push, progress-photos

  // Setup WebSocket
  setupWebSocket(httpServer);

  return httpServer;
}

function setupWebSocket(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  const sendToUser = (userId: string, message: any) => {
    const ws = clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  };

  const broadcastToUsers = (userIds: string[], message: any) => {
    userIds.forEach(userId => sendToUser(userId, message));
  };

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

          sendToUser(recipientId, {
            type: 'new_message',
            message: newMessage,
            conversationId,
          });

          ws.send(JSON.stringify({
            type: 'message_sent',
            message: newMessage,
            conversationId,
          }));
        }

        if (message.type === 'typing' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, { type: 'user_typing', conversationId, userId });
        }

        if (message.type === 'stop_typing' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, { type: 'user_stop_typing', conversationId, userId });
        }

        if (message.type === 'mark_read' && userId) {
          const { conversationId, recipientId } = message;
          sendToUser(recipientId, { type: 'messages_read', conversationId, readBy: userId });
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
}
