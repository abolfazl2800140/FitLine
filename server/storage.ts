import { db } from "./db";
import { eq, desc, and, or, sql, like, ilike } from "drizzle-orm";
import {
  users, coachProfiles, programs, workoutDays, exercises, userPrograms, workoutLogs,
  posts, comments, likes, follows, conversations, messages,
  supplements, cartItems, orders, challenges, challengeParticipants,
  leagues, leagueMembers, badges, userBadges, progressPhotos, progressMetrics,
  reviews, supplementReviews, questions, answers,
  type User, type InsertUser, type CoachProfile, type InsertCoachProfile,
  type Program, type InsertProgram, type Post, type InsertPost,
  type Supplement, type InsertSupplement, type Challenge, type InsertChallenge,
  type Question, type InsertQuestion, type Message, type InsertMessage,
  type Conversation, type InsertConversation, type CartItem, type InsertCartItem,
  type ChallengeParticipant, type InsertChallengeParticipant,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Coaches
  getCoaches(filters?: { specialty?: string; gender?: string }): Promise<any[]>;
  getCoach(id: string): Promise<any | undefined>;
  createCoachProfile(profile: InsertCoachProfile): Promise<CoachProfile>;

  // Programs
  getPrograms(filters?: { difficulty?: string; coachId?: string }): Promise<any[]>;
  getProgram(id: string): Promise<any | undefined>;
  getUserPrograms(userId: string): Promise<any[]>;
  enrollInProgram(userId: string, programId: string): Promise<any>;

  // Posts
  getPosts(limit?: number, offset?: number): Promise<any[]>;
  getPost(id: string): Promise<any | undefined>;
  getUserPosts(userId: string): Promise<any[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;

  // Supplements
  getSupplements(filters?: { category?: string; search?: string }): Promise<Supplement[]>;
  getSupplement(id: string): Promise<Supplement | undefined>;

  // Cart
  getCartItems(userId: string): Promise<any[]>;
  addToCart(userId: string, supplementId: string, quantity: number): Promise<CartItem>;
  updateCartItem(itemId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(itemId: string): Promise<void>;

  // Challenges
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  getUserChallenges(userId: string): Promise<any[]>;
  joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipant>;

  // Leagues
  getLeague(tier: string): Promise<any | undefined>;
  getLeagueMembers(leagueId: string): Promise<any[]>;
  getUserLeagueStats(userId: string): Promise<any | undefined>;

  // Messages
  getConversations(userId: string): Promise<any[]>;
  getMessages(conversationId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  createConversation(data: InsertConversation): Promise<Conversation>;

  // Questions
  getQuestions(filters?: { category?: string }): Promise<any[]>;
  getQuestion(id: string): Promise<any | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Progress
  getProgressPhotos(userId: string): Promise<any[]>;
  getUserBadges(userId: string): Promise<any[]>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  // Coaches
  async getCoaches(filters?: { specialty?: string; gender?: string }): Promise<any[]> {
    const result = await db
      .select({
        id: coachProfiles.id,
        userId: coachProfiles.userId,
        specialty: coachProfiles.specialty,
        experience: coachProfiles.experience,
        pricePerSession: coachProfiles.pricePerSession,
        credentials: coachProfiles.credentials,
        about: coachProfiles.about,
        clientCount: coachProfiles.clientCount,
        rating: coachProfiles.rating,
        reviewCount: coachProfiles.reviewCount,
        coverImage: coachProfiles.coverImage,
        isVerified: coachProfiles.isVerified,
        gallery: coachProfiles.gallery,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
          gender: users.gender,
        },
      })
      .from(coachProfiles)
      .innerJoin(users, eq(coachProfiles.userId, users.id));
    
    return result;
  }

  async getCoach(id: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        id: coachProfiles.id,
        userId: coachProfiles.userId,
        specialty: coachProfiles.specialty,
        experience: coachProfiles.experience,
        pricePerSession: coachProfiles.pricePerSession,
        credentials: coachProfiles.credentials,
        about: coachProfiles.about,
        clientCount: coachProfiles.clientCount,
        rating: coachProfiles.rating,
        reviewCount: coachProfiles.reviewCount,
        coverImage: coachProfiles.coverImage,
        isVerified: coachProfiles.isVerified,
        gallery: coachProfiles.gallery,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
          bio: users.bio,
        },
      })
      .from(coachProfiles)
      .innerJoin(users, eq(coachProfiles.userId, users.id))
      .where(eq(coachProfiles.id, id))
      .limit(1);
    
    return result;
  }

  async createCoachProfile(profile: InsertCoachProfile): Promise<CoachProfile> {
    const [result] = await db.insert(coachProfiles).values(profile).returning();
    return result;
  }

  // Programs
  async getPrograms(filters?: { difficulty?: string; coachId?: string }): Promise<any[]> {
    const result = await db
      .select({
        id: programs.id,
        coachId: programs.coachId,
        title: programs.title,
        description: programs.description,
        coverImage: programs.coverImage,
        difficulty: programs.difficulty,
        durationWeeks: programs.durationWeeks,
        price: programs.price,
        isPublic: programs.isPublic,
        createdAt: programs.createdAt,
        coach: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(programs)
      .innerJoin(users, eq(programs.coachId, users.id))
      .where(eq(programs.isPublic, true))
      .orderBy(desc(programs.createdAt));
    
    return result;
  }

  async getProgram(id: string): Promise<any | undefined> {
    const [result] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id))
      .limit(1);
    
    return result;
  }

  async getUserPrograms(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: userPrograms.id,
        userId: userPrograms.userId,
        programId: userPrograms.programId,
        startDate: userPrograms.startDate,
        progress: userPrograms.progress,
        completedWorkouts: userPrograms.completedWorkouts,
        program: {
          id: programs.id,
          title: programs.title,
          coverImage: programs.coverImage,
          difficulty: programs.difficulty,
          durationWeeks: programs.durationWeeks,
        },
      })
      .from(userPrograms)
      .innerJoin(programs, eq(userPrograms.programId, programs.id))
      .where(eq(userPrograms.userId, userId));
    
    return result;
  }

  async enrollInProgram(userId: string, programId: string): Promise<any> {
    const [enrollment] = await db.insert(userPrograms).values({ userId, programId }).returning();
    return enrollment;
  }

  // Posts
  async getPosts(limit = 20, offset = 0): Promise<any[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        images: posts.images,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
    
    return result;
  }

  async getPost(id: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        images: posts.images,
        likeCount: posts.likeCount,
        commentCount: posts.commentCount,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .where(eq(posts.id, id))
      .limit(1);
    
    return result;
  }

  async getUserPosts(userId: string): Promise<any[]> {
    return this.getPosts(100, 0);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [result] = await db.insert(posts).values(post).returning();
    return result;
  }

  async likePost(userId: string, postId: string): Promise<void> {
    await db.insert(likes).values({ userId, postId });
    await db.update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, postId));
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.postId, postId)));
    await db.update(posts)
      .set({ likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)` })
      .where(eq(posts.id, postId));
  }

  // Supplements
  async getSupplements(filters?: { category?: string; search?: string }): Promise<Supplement[]> {
    let query = db.select().from(supplements);
    const result = await query.orderBy(desc(supplements.rating));
    return result;
  }

  async getSupplement(id: string): Promise<Supplement | undefined> {
    const [result] = await db.select().from(supplements).where(eq(supplements.id, id)).limit(1);
    return result;
  }

  // Cart
  async getCartItems(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        supplementId: cartItems.supplementId,
        quantity: cartItems.quantity,
        supplement: {
          id: supplements.id,
          name: supplements.name,
          brand: supplements.brand,
          price: supplements.price,
          image: supplements.image,
        },
      })
      .from(cartItems)
      .innerJoin(supplements, eq(cartItems.supplementId, supplements.id))
      .where(eq(cartItems.userId, userId));
    
    return result;
  }

  async addToCart(userId: string, supplementId: string, quantity: number): Promise<CartItem> {
    const [result] = await db.insert(cartItems).values({ userId, supplementId, quantity }).returning();
    return result;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem | undefined> {
    const [result] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId)).returning();
    return result;
  }

  async removeFromCart(itemId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    const result = await db.select().from(challenges).orderBy(desc(challenges.startDate));
    return result;
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [result] = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    return result;
  }

  async getUserChallenges(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: challengeParticipants.id,
        challengeId: challengeParticipants.challengeId,
        userId: challengeParticipants.userId,
        progress: challengeParticipants.progress,
        joinedAt: challengeParticipants.joinedAt,
        challenge: {
          id: challenges.id,
          title: challenges.title,
          type: challenges.type,
          goal: challenges.goal,
          endDate: challenges.endDate,
        },
      })
      .from(challengeParticipants)
      .innerJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
      .where(eq(challengeParticipants.userId, userId));
    
    return result;
  }

  async joinChallenge(userId: string, challengeId: string): Promise<ChallengeParticipant> {
    const [result] = await db.insert(challengeParticipants).values({ userId, challengeId }).returning();
    await db.update(challenges)
      .set({ participantCount: sql`${challenges.participantCount} + 1` })
      .where(eq(challenges.id, challengeId));
    return result;
  }

  // Leagues
  async getLeague(tier: string): Promise<any | undefined> {
    const now = new Date();
    const [result] = await db
      .select()
      .from(leagues)
      .where(
        and(
          eq(leagues.tier, tier as any),
          eq(leagues.month, now.getMonth() + 1),
          eq(leagues.year, now.getFullYear()),
          eq(leagues.isActive, true)
        )
      )
      .limit(1);
    
    return result;
  }

  async getLeagueMembers(leagueId: string): Promise<any[]> {
    const result = await db
      .select({
        id: leagueMembers.id,
        userId: leagueMembers.userId,
        score: leagueMembers.score,
        rank: leagueMembers.rank,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .where(eq(leagueMembers.leagueId, leagueId))
      .orderBy(desc(leagueMembers.score))
      .limit(100);
    
    return result;
  }

  async getUserLeagueStats(userId: string): Promise<any | undefined> {
    const now = new Date();
    const [league] = await db
      .select()
      .from(leagues)
      .where(
        and(
          eq(leagues.month, now.getMonth() + 1),
          eq(leagues.year, now.getFullYear()),
          eq(leagues.isActive, true)
        )
      )
      .limit(1);
    
    if (!league) return undefined;

    const [member] = await db
      .select()
      .from(leagueMembers)
      .where(and(eq(leagueMembers.leagueId, league.id), eq(leagueMembers.userId, userId)))
      .limit(1);
    
    return member;
  }

  // Messages
  async getConversations(userId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));
    
    const enriched = await Promise.all(result.map(async (conv) => {
      const otherId = conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;
      const [other] = await db.select().from(users).where(eq(users.id, otherId)).limit(1);
      return {
        ...conv,
        participant: other ? { id: other.id, fullName: other.fullName, avatar: other.avatar } : null,
      };
    }));
    
    return enriched;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    
    return result;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    await db.update(conversations)
      .set({ lastMessage: message.content, lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    return result;
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(data).returning();
    return result;
  }

  // Questions
  async getQuestions(filters?: { category?: string }): Promise<any[]> {
    const result = await db
      .select({
        id: questions.id,
        userId: questions.userId,
        title: questions.title,
        content: questions.content,
        category: questions.category,
        voteCount: questions.voteCount,
        answerCount: questions.answerCount,
        createdAt: questions.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(questions)
      .innerJoin(users, eq(questions.userId, users.id))
      .orderBy(desc(questions.createdAt));
    
    return result;
  }

  async getQuestion(id: string): Promise<any | undefined> {
    const [result] = await db
      .select({
        id: questions.id,
        userId: questions.userId,
        title: questions.title,
        content: questions.content,
        category: questions.category,
        voteCount: questions.voteCount,
        answerCount: questions.answerCount,
        createdAt: questions.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(questions)
      .innerJoin(users, eq(questions.userId, users.id))
      .where(eq(questions.id, id))
      .limit(1);
    
    return result;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [result] = await db.insert(questions).values(question).returning();
    return result;
  }

  // Progress
  async getProgressPhotos(userId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.createdAt));
    
    return result;
  }

  async getUserBadges(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: userBadges.id,
        earnedAt: userBadges.earnedAt,
        badge: {
          id: badges.id,
          name: badges.name,
          description: badges.description,
          icon: badges.icon,
          category: badges.category,
        },
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId));
    
    return result;
  }
}

export const storage = new DbStorage();
