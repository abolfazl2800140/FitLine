import { db } from "./db";
import { eq, desc, and, or, sql, like, ilike, gte, lte, isNull, not } from "drizzle-orm";
import {
  users, coachProfiles, programs, workoutDays, exercises, userPrograms, workoutLogs,
  posts, comments, likes, follows, conversations, messages, messageReactions,
  supplements, cartItems, orders, challenges, challengeParticipants,
  leagues, leagueMembers, badges, userBadges, progressPhotos, progressMetrics,
  reviews, supplementReviews, questions, answers, coachLikes,
  questionVotes, answerVotes, coachingRequests,
  // Nutrition tables
  nutritionPlans, meals, mealItems, mealLogs, pushSubscriptions, mealReminders,
  // Education tables
  exerciseTutorials, articles, exerciseTutorialLikes, articleLikes,
  type User, type InsertUser, type CoachProfile, type InsertCoachProfile,
  type Program, type InsertProgram, type Post, type InsertPost,
  type Supplement, type InsertSupplement, type Challenge, type InsertChallenge,
  type Question, type InsertQuestion, type Message, type InsertMessage,
  type Conversation, type InsertConversation, type CartItem, type InsertCartItem,
  type ChallengeParticipant, type InsertChallengeParticipant,
  type CoachLike, type CoachingRequest, type InsertCoachingRequest,
  type NutritionPlan, type Meal, type MealItem, type MealLog, type PushSubscription, type MealReminder,
  type ExerciseTutorial, type InsertExerciseTutorial, type Article, type InsertArticle,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { awardPoints } from "./points";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserProfile(id: string): Promise<any | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowCounts(userId: string): Promise<{ followers: number; following: number }>;
  createProgressPhoto(data: { userId: string; imageUrl: string; weight?: string | null; bodyFat?: string | null; notes?: string | null }): Promise<any>;

  // Coaches
  getCoaches(filters?: { specialty?: string; gender?: string }): Promise<any[]>;
  getCoach(id: string): Promise<any | undefined>;
  createCoachProfile(profile: InsertCoachProfile): Promise<CoachProfile>;
  likeCoach(userId: string, coachId: string): Promise<void>;
  unlikeCoach(userId: string, coachId: string): Promise<void>;
  isCoachLiked(userId: string, coachId: string): Promise<boolean>;
  getCoachLikeCount(coachId: string): Promise<number>;

  // Programs
  getPrograms(filters?: { difficulty?: string; coachId?: string }): Promise<any[]>;
  getProgram(id: string): Promise<any | undefined>;
  getUserPrograms(userId: string): Promise<any[]>;
  enrollInProgram(userId: string, programId: string): Promise<any>;

  // Posts
  getPosts(limit?: number, offset?: number, userId?: string): Promise<any[]>;
  getPost(id: string, userId?: string): Promise<any | undefined>;
  getUserPosts(userId: string): Promise<any[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;
  isPostLiked(userId: string, postId: string): Promise<boolean>;

  // Comments
  getComments(postId: string): Promise<any[]>;
  createComment(userId: string, postId: string, content: string): Promise<any>;

  // Supplements
  getSupplements(filters?: { category?: string; search?: string }): Promise<Supplement[]>;
  getSupplement(id: string): Promise<Supplement | undefined>;
  getSupplementReviews(supplementId: string): Promise<any[]>;
  createSupplementReview(review: { supplementId: string; userId: string; rating: number; comment: string }): Promise<any>;
  hasUserPurchasedSupplement(userId: string, supplementId: string): Promise<boolean>;

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
  editMessage(messageId: string, userId: string, newContent: string): Promise<Message | null>;
  deleteMessage(messageId: string, userId: string): Promise<boolean>;
  addReaction(messageId: string, userId: string, emoji: string): Promise<any>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean>;
  getMessageReactions(messageId: string): Promise<any[]>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;

  // Questions
  getQuestions(filters?: { category?: string }): Promise<any[]>;
  getQuestion(id: string): Promise<any | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Answers
  getAnswers(questionId: string): Promise<any[]>;
  createAnswer(userId: string, questionId: string, content: string): Promise<any>;
  voteAnswer(userId: string, answerId: string, value: number): Promise<void>;
  voteQuestion(userId: string, questionId: string, value: number): Promise<void>;

  // Progress
  getProgressPhotos(userId: string): Promise<any[]>;
  getUserBadges(userId: string): Promise<any[]>;
  getUserDashboardStats(userId: string): Promise<{
    points: number;
    calories: number;
    rank: number | null;
    progress: number;
    streak: number;
  }>;

  // Coaching Requests
  createCoachingRequest(request: InsertCoachingRequest): Promise<CoachingRequest>;
  getCoachingRequestsForCoach(coachId: string): Promise<any[]>;
  getCoachingRequestsForUser(userId: string): Promise<any[]>;
  getCoachingRequest(id: string): Promise<any | undefined>;
  updateCoachingRequestStatus(id: string, status: 'accepted' | 'rejected', rejectionReason?: string): Promise<CoachingRequest | undefined>;
  getOrCreateConversation(participant1Id: string, participant2Id: string): Promise<Conversation>;
  getUserMonthlyRequestCount(userId: string, type: 'workout' | 'nutrition'): Promise<number>;

  // Programs
  createProgramWithWorkouts(data: {
    coachId: string;
    studentId: string;
    title: string;
    durationWeeks: number;
    days: { title: string; exercises: { name: string; sets: number; reps: string; }[] }[];
  }): Promise<any>;
  getUserProgramsWithDetails(userId: string): Promise<any[]>;
  getProgramWithWorkouts(programId: string): Promise<any | undefined>;

  // Education - Tutorials
  getExerciseTutorials(muscleGroup?: string, difficulty?: string): Promise<any[]>;
  getExerciseTutorial(id: string): Promise<any | undefined>;
  createExerciseTutorial(data: any): Promise<any>;
  incrementTutorialViews(id: string): Promise<void>;
  toggleTutorialLike(tutorialId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;

  // Education - Articles
  getArticles(category?: string): Promise<any[]>;
  getArticle(id: string): Promise<any | undefined>;
  createArticle(data: any): Promise<any>;
  incrementArticleViews(id: string): Promise<void>;
  toggleArticleLike(articleId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;
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

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserProfile(id: string): Promise<any | undefined> {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        avatar: users.avatar,
        bio: users.bio,
        role: users.role,
        gender: users.gender,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return undefined;

    // Get user's questions
    const userQuestions = await db
      .select({
        id: questions.id,
        title: questions.title,
        voteCount: questions.voteCount,
        answerCount: questions.answerCount,
      })
      .from(questions)
      .where(eq(questions.userId, id))
      .orderBy(desc(questions.createdAt))
      .limit(10);

    // Get user's answers
    const userAnswers = await db
      .select({
        id: answers.id,
        content: answers.content,
        questionId: answers.questionId,
        voteCount: answers.voteCount,
        isBestAnswer: answers.isBestAnswer,
      })
      .from(answers)
      .where(eq(answers.userId, id))
      .orderBy(desc(answers.createdAt))
      .limit(10);

    // Get counts
    const [questionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(eq(questions.userId, id));

    const [answerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(answers)
      .where(eq(answers.userId, id));

    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.userId, id));

    // Get progress photos
    const userProgressPhotos = await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, id))
      .orderBy(desc(progressPhotos.createdAt));

    // Get progress metrics
    const userProgressMetrics = await db
      .select()
      .from(progressMetrics)
      .where(eq(progressMetrics.userId, id))
      .orderBy(progressMetrics.recordedAt);

    return {
      ...user,
      questions: userQuestions,
      answers: userAnswers,
      questionCount: questionCount?.count || 0,
      answerCount: answerCount?.count || 0,
      postCount: postCount?.count || 0,
      progressPhotos: userProgressPhotos,
      progressMetrics: userProgressMetrics,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    const existing = await this.isFollowing(followerId, followingId);
    if (!existing) {
      await db.insert(follows).values({ followerId, followingId });
    }
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);
    return !!result;
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    const [followersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return {
      followers: followersResult?.count || 0,
      following: followingResult?.count || 0,
    };
  }

  async createProgressPhoto(data: { userId: string; imageUrl: string; weight?: string | null; bodyFat?: string | null; notes?: string | null }): Promise<any> {
    const [photo] = await db.insert(progressPhotos).values({
      userId: data.userId,
      imageUrl: data.imageUrl,
      weight: data.weight || null,
      bodyFat: data.bodyFat || null,
      notes: data.notes || null,
    }).returning();
    return photo;
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

    if (!result) return undefined;

    // Get coach programs
    const coachPrograms = await db
      .select()
      .from(programs)
      .where(eq(programs.coachId, result.userId));

    // Get coach reviews
    const coachReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.coachId, result.userId));

    return {
      ...result,
      programs: coachPrograms,
      reviews: coachReviews,
    };
  }

  async createCoachProfile(profile: InsertCoachProfile): Promise<CoachProfile> {
    const [result] = await db.insert(coachProfiles).values(profile).returning();
    return result;
  }

  async likeCoach(userId: string, coachId: string): Promise<void> {
    // Check if already liked
    const existing = await this.isCoachLiked(userId, coachId);
    if (!existing) {
      await db.insert(coachLikes).values({ userId, coachId });
    }
  }

  async unlikeCoach(userId: string, coachId: string): Promise<void> {
    await db.delete(coachLikes).where(
      and(eq(coachLikes.userId, userId), eq(coachLikes.coachId, coachId))
    );
  }

  async isCoachLiked(userId: string, coachId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(coachLikes)
      .where(and(eq(coachLikes.userId, userId), eq(coachLikes.coachId, coachId)))
      .limit(1);
    return !!result;
  }

  async getCoachLikeCount(coachId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachLikes)
      .where(eq(coachLikes.coachId, coachId));
    return result[0]?.count || 0;
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
  async getPosts(limit = 20, offset = 0, currentUserId?: string): Promise<any[]> {
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

    // Add isLiked for each post if user is logged in
    if (currentUserId) {
      const postsWithLikes = await Promise.all(
        result.map(async (post) => ({
          ...post,
          isLiked: await this.isPostLiked(currentUserId, post.id),
        }))
      );
      return postsWithLikes;
    }

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

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))
      .limit(1);
    return !!result;
  }

  // Comments
  async getComments(postId: string): Promise<any[]> {
    // فقط کامنت‌های اصلی (بدون parent)
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        parentId: comments.parentId,
        content: comments.content,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
      .orderBy(desc(comments.createdAt));
    return result;
  }

  async getCommentReplies(commentId: string): Promise<any[]> {
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        parentId: comments.parentId,
        content: comments.content,
        replyCount: comments.replyCount,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.parentId, commentId))
      .orderBy(comments.createdAt);
    return result;
  }

  async createComment(userId: string, postId: string, content: string, parentId?: string): Promise<any> {
    const [result] = await db
      .insert(comments)
      .values({ userId, postId, content, parentId: parentId || null })
      .returning();

    // آپدیت تعداد کامنت پست
    await db.update(posts)
      .set({ commentCount: sql`${posts.commentCount} + 1` })
      .where(eq(posts.id, postId));

    // اگر ریپلای هست، تعداد ریپلای کامنت والد رو آپدیت کن
    if (parentId) {
      await db.update(comments)
        .set({ replyCount: sql`${comments.replyCount} + 1` })
        .where(eq(comments.id, parentId));
    }

    // گرفتن اطلاعات کاربر برای برگرداندن
    const [user] = await db.select({
      id: users.id,
      fullName: users.fullName,
      avatar: users.avatar,
    }).from(users).where(eq(users.id, userId));

    return { ...result, user };
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

  async getSupplementReviews(supplementId: string): Promise<any[]> {
    const result = await db
      .select({
        id: supplementReviews.id,
        rating: supplementReviews.rating,
        comment: supplementReviews.comment,
        createdAt: supplementReviews.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(supplementReviews)
      .innerJoin(users, eq(supplementReviews.userId, users.id))
      .where(eq(supplementReviews.supplementId, supplementId))
      .orderBy(desc(supplementReviews.createdAt));
    return result;
  }

  async createSupplementReview(review: { supplementId: string; userId: string; rating: number; comment: string }): Promise<any> {
    const [result] = await db.insert(supplementReviews).values({
      id: randomUUID(),
      supplementId: review.supplementId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
    }).returning();

    // Update supplement rating
    const reviews = await this.getSupplementReviews(review.supplementId);
    const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;
    await db.update(supplements)
      .set({ rating: avgRating.toFixed(1), reviewCount: reviews.length })
      .where(eq(supplements.id, review.supplementId));

    return result;
  }

  async hasUserPurchasedSupplement(userId: string, supplementId: string): Promise<boolean> {
    // Check if user has any completed order containing this supplement
    const userOrders = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        eq(orders.status, 'completed')
      ));

    for (const order of userOrders) {
      const items = order.items as { supplementId: string }[] | null;
      if (items && items.some(item => item.supplementId === supplementId)) {
        return true;
      }
    }
    return false;
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
    // Award points for joining challenge
    await awardPoints(userId, 'JOIN_CHALLENGE');
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

  async getMessages(conversationId: string): Promise<any[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    // Enrich messages with reply info
    const enrichedMessages = await Promise.all(result.map(async (msg) => {
      let replyTo = null;
      if (msg.replyToId) {
        const [replyMsg] = await db
          .select({
            id: messages.id,
            content: messages.content,
            senderId: messages.senderId,
            senderName: users.fullName,
          })
          .from(messages)
          .leftJoin(users, eq(messages.senderId, users.id))
          .where(eq(messages.id, msg.replyToId))
          .limit(1);
        replyTo = replyMsg || null;
      }
      return { ...msg, replyTo };
    }));

    return enrichedMessages;
  }

  async sendMessage(message: InsertMessage): Promise<any> {
    const [result] = await db.insert(messages).values(message).returning();
    await db.update(conversations)
      .set({ lastMessage: message.content, lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    // If this is a reply, fetch the reply info
    let replyTo = null;
    if (message.replyToId) {
      const [replyMsg] = await db
        .select({
          id: messages.id,
          content: messages.content,
          senderId: messages.senderId,
          senderName: users.fullName,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.id, message.replyToId))
        .limit(1);
      replyTo = replyMsg || null;
    }

    return { ...result, replyTo };
  }

  async createConversation(data: InsertConversation): Promise<Conversation> {
    const [result] = await db.insert(conversations).values(data).returning();
    return result;
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<any> {
    const [message] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId)))
      .limit(1);

    if (!message) return null;

    const [updated] = await db
      .update(messages)
      .set({ content: newContent, isEdited: true, editedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return updated;
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const [message] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId)))
      .limit(1);

    if (!message) return false;

    // Delete reactions first
    await db.delete(messageReactions).where(eq(messageReactions.messageId, messageId));
    
    // Delete the message completely (like Telegram)
    await db.delete(messages).where(eq(messages.id, messageId));

    return true;
  }

  async addReaction(messageId: string, userId: string, emoji: string): Promise<any> {
    const [existing] = await db
      .select()
      .from(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji)
      ))
      .limit(1);

    if (existing) return existing;

    const [result] = await db
      .insert(messageReactions)
      .values({ messageId, userId, emoji })
      .returning();

    return result;
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
    const result = await db
      .delete(messageReactions)
      .where(and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
        eq(messageReactions.emoji, emoji)
      ));

    return true;
  }

  async getMessageReactions(messageId: string): Promise<any[]> {
    const result = await db
      .select({
        id: messageReactions.id,
        emoji: messageReactions.emoji,
        userId: messageReactions.userId,
        userName: users.fullName,
      })
      .from(messageReactions)
      .leftJoin(users, eq(messageReactions.userId, users.id))
      .where(eq(messageReactions.messageId, messageId));

    return result;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(
        eq(messages.conversationId, conversationId),
        not(eq(messages.senderId, userId)),
        eq(messages.isRead, false)
      ));
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
    // Award points for asking a question
    await awardPoints(question.userId, 'ASK_QUESTION');
    return result;
  }

  // Answers
  async getAnswers(questionId: string, currentUserId?: string): Promise<any[]> {
    const result = await db
      .select({
        id: answers.id,
        questionId: answers.questionId,
        userId: answers.userId,
        content: answers.content,
        isBestAnswer: answers.isBestAnswer,
        voteCount: answers.voteCount,
        createdAt: answers.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(answers)
      .innerJoin(users, eq(answers.userId, users.id))
      .where(eq(answers.questionId, questionId))
      .orderBy(desc(answers.isBestAnswer), desc(answers.voteCount), desc(answers.createdAt));

    // Add userVote for each answer
    if (currentUserId) {
      const answersWithVotes = await Promise.all(
        result.map(async (answer) => {
          const [vote] = await db
            .select()
            .from(answerVotes)
            .where(and(eq(answerVotes.userId, currentUserId), eq(answerVotes.answerId, answer.id)))
            .limit(1);
          return { ...answer, userVote: vote?.value || 0 };
        })
      );
      return answersWithVotes;
    }

    return result;
  }

  async getUserQuestionVote(userId: string, questionId: string): Promise<number> {
    const [vote] = await db
      .select()
      .from(questionVotes)
      .where(and(eq(questionVotes.userId, userId), eq(questionVotes.questionId, questionId)))
      .limit(1);
    return vote?.value || 0;
  }

  async createAnswer(userId: string, questionId: string, content: string): Promise<any> {
    const [result] = await db
      .insert(answers)
      .values({ userId, questionId, content })
      .returning();

    await db.update(questions)
      .set({ answerCount: sql`${questions.answerCount} + 1` })
      .where(eq(questions.id, questionId));

    // Award points for answering - check if user is coach
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
    if (user?.role === 'coach') {
      await awardPoints(userId, 'COACH_ANSWER_QUESTION');
    } else {
      await awardPoints(userId, 'ANSWER_QUESTION');
    }

    return result;
  }

  async voteAnswer(userId: string, answerId: string, value: number): Promise<void> {
    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(answerVotes)
      .where(and(eq(answerVotes.userId, userId), eq(answerVotes.answerId, answerId)))
      .limit(1);

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it
        await db.delete(answerVotes).where(eq(answerVotes.id, existingVote.id));
        await db.update(answers)
          .set({ voteCount: sql`${answers.voteCount} - ${value}` })
          .where(eq(answers.id, answerId));
      } else {
        // Different vote - update it
        await db.update(answerVotes)
          .set({ value })
          .where(eq(answerVotes.id, existingVote.id));
        await db.update(answers)
          .set({ voteCount: sql`${answers.voteCount} + ${value * 2}` })
          .where(eq(answers.id, answerId));
      }
    } else {
      // New vote
      await db.insert(answerVotes).values({ userId, answerId, value });
      await db.update(answers)
        .set({ voteCount: sql`${answers.voteCount} + ${value}` })
        .where(eq(answers.id, answerId));
    }
  }

  async markBestAnswer(userId: string, answerId: string): Promise<{ success: boolean; points: number }> {
    // Get the answer and its question
    const [answer] = await db
      .select({
        id: answers.id,
        questionId: answers.questionId,
        userId: answers.userId,
        isBestAnswer: answers.isBestAnswer,
      })
      .from(answers)
      .where(eq(answers.id, answerId))
      .limit(1);

    if (!answer) {
      throw new Error('Answer not found');
    }

    // Get the question to check ownership
    const [question] = await db
      .select({ userId: questions.userId })
      .from(questions)
      .where(eq(questions.id, answer.questionId))
      .limit(1);

    if (!question) {
      throw new Error('Question not found');
    }

    // Only question owner can mark best answer
    if (question.userId !== userId) {
      throw new Error('Only the question owner can mark best answer');
    }

    // Remove previous best answer for this question (if any)
    await db.update(answers)
      .set({ isBestAnswer: false })
      .where(eq(answers.questionId, answer.questionId));

    // Mark this answer as best
    await db.update(answers)
      .set({ isBestAnswer: true })
      .where(eq(answers.id, answerId));

    // Award points to the answer author - check if coach
    const [answerUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, answer.userId)).limit(1);
    const pointsAwarded = answerUser?.role === 'coach' ? 15 : 10;
    await awardPoints(answer.userId, answerUser?.role === 'coach' ? 'COACH_BEST_ANSWER' : 'BEST_ANSWER_USER');

    return { success: true, points: pointsAwarded };
  }

  async voteQuestion(userId: string, questionId: string, value: number): Promise<void> {
    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(questionVotes)
      .where(and(eq(questionVotes.userId, userId), eq(questionVotes.questionId, questionId)))
      .limit(1);

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it
        await db.delete(questionVotes).where(eq(questionVotes.id, existingVote.id));
        await db.update(questions)
          .set({ voteCount: sql`${questions.voteCount} - ${value}` })
          .where(eq(questions.id, questionId));
      } else {
        // Different vote - update it
        await db.update(questionVotes)
          .set({ value })
          .where(eq(questionVotes.id, existingVote.id));
        await db.update(questions)
          .set({ voteCount: sql`${questions.voteCount} + ${value * 2}` })
          .where(eq(questions.id, questionId));
      }
    } else {
      // New vote
      await db.insert(questionVotes).values({ userId, questionId, value });
      await db.update(questions)
        .set({ voteCount: sql`${questions.voteCount} + ${value}` })
        .where(eq(questions.id, questionId));
    }
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

  // Coach Stats
  async getCoachStats(userId: string): Promise<{
    activeStudents: number;
    pendingRequests: number;
    monthlyIncome: number;
    completionRate: number;
    rating: string;
    reviewCount: number;
    newStudentsThisMonth: number;
    programsCreatedThisMonth: number;
    messagesReceivedThisMonth: number;
  }> {
    // Get coach profile
    const [coachProfile] = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId))
      .limit(1);

    if (!coachProfile) {
      return {
        activeStudents: 0,
        pendingRequests: 0,
        monthlyIncome: 0,
        completionRate: 0,
        rating: "0.0",
        reviewCount: 0,
      };
    }

    // Count active students (users enrolled in coach's programs)
    const [activeStudentsResult] = await db
      .select({ count: sql<number>`count(DISTINCT ${userPrograms.userId})` })
      .from(userPrograms)
      .innerJoin(programs, eq(userPrograms.programId, programs.id))
      .where(eq(programs.coachId, userId));

    // Count pending coaching requests
    const [pendingRequestsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachingRequests)
      .where(
        and(
          eq(coachingRequests.coachId, userId),
          eq(coachingRequests.status, 'pending')
        )
      );

    // Calculate monthly income from program enrollments this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyIncomeResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(CAST(${programs.price} AS DECIMAL)), 0)`
      })
      .from(userPrograms)
      .innerJoin(programs, eq(userPrograms.programId, programs.id))
      .where(
        and(
          eq(programs.coachId, userId),
          sql`${userPrograms.startDate} >= ${startOfMonth}`
        )
      );

    // Calculate completion rate
    const [completionResult] = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(CASE WHEN ${userPrograms.progress} >= 100 THEN 1 END)`,
      })
      .from(userPrograms)
      .innerJoin(programs, eq(userPrograms.programId, programs.id))
      .where(eq(programs.coachId, userId));

    const completionRate = completionResult?.total > 0
      ? Math.round((completionResult.completed / completionResult.total) * 100)
      : 0;

    // Count new students this month (from coaching requests accepted this month)
    const [newStudentsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachingRequests)
      .where(
        and(
          eq(coachingRequests.coachId, userId),
          eq(coachingRequests.status, 'accepted'),
          sql`${coachingRequests.updatedAt} >= ${startOfMonth}`
        )
      );

    // Count programs created this month
    const [programsCreatedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(programs)
      .where(
        and(
          eq(programs.coachId, userId),
          sql`${programs.createdAt} >= ${startOfMonth}`
        )
      );

    // Count messages received this month
    const [messagesReceivedResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          sql`(${conversations.participant1Id} = ${userId} OR ${conversations.participant2Id} = ${userId})`,
          sql`${messages.senderId} != ${userId}`,
          sql`${messages.createdAt} >= ${startOfMonth}`
        )
      );

    return {
      activeStudents: activeStudentsResult?.count || 0,
      pendingRequests: pendingRequestsResult?.count || 0,
      monthlyIncome: monthlyIncomeResult[0]?.total || 0,
      completionRate,
      rating: coachProfile.rating || "0.0",
      reviewCount: coachProfile.reviewCount || 0,
      newStudentsThisMonth: newStudentsResult?.count || 0,
      programsCreatedThisMonth: programsCreatedResult?.count || 0,
      messagesReceivedThisMonth: messagesReceivedResult?.count || 0,
    };
  }

  // Get coach's students (from accepted coaching requests + enrolled programs)
  async getCoachStudents(coachId: string): Promise<any[]> {
    // Get students from accepted coaching requests
    const acceptedRequests = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatar: users.avatar,
        requestType: coachingRequests.type,
        createdAt: coachingRequests.createdAt,
      })
      .from(coachingRequests)
      .innerJoin(users, eq(coachingRequests.userId, users.id))
      .where(
        and(
          eq(coachingRequests.coachId, coachId),
          eq(coachingRequests.status, 'accepted')
        )
      );

    // Get unique student IDs
    const studentIds = [...new Set(acceptedRequests.map(r => r.id))];

    if (studentIds.length === 0) {
      return [];
    }

    // For each student, get their program and nutrition plan info
    const studentsWithDetails = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = acceptedRequests.find(r => r.id === studentId)!;

        // Get workout program
        const [workoutProgram] = await db
          .select({
            title: programs.title,
            progress: userPrograms.progress,
            startDate: userPrograms.startDate,
          })
          .from(userPrograms)
          .innerJoin(programs, eq(userPrograms.programId, programs.id))
          .where(
            and(
              eq(userPrograms.userId, studentId),
              eq(programs.coachId, coachId)
            )
          )
          .orderBy(desc(userPrograms.startDate))
          .limit(1);

        // Get nutrition plan
        const [nutritionPlan] = await db
          .select({
            title: nutritionPlans.title,
            isActive: nutritionPlans.isActive,
            startDate: nutritionPlans.startDate,
          })
          .from(nutritionPlans)
          .where(
            and(
              eq(nutritionPlans.userId, studentId),
              eq(nutritionPlans.coachId, coachId)
            )
          )
          .orderBy(desc(nutritionPlans.createdAt))
          .limit(1);

        // Determine status
        const hasWorkoutProgram = !!workoutProgram;
        const hasNutritionPlan = !!nutritionPlan;
        const progress = workoutProgram?.progress || "0";

        return {
          id: student.id,
          fullName: student.fullName,
          avatar: student.avatar,
          programTitle: workoutProgram?.title || null,
          nutritionPlanTitle: nutritionPlan?.title || null,
          hasWorkoutProgram,
          hasNutritionPlan,
          progress,
          startDate: workoutProgram?.startDate || nutritionPlan?.startDate || student.createdAt,
        };
      })
    );

    return studentsWithDetails;
  }

  async getUserDashboardStats(userId: string): Promise<{
    points: number;
    calories: number;
    rank: number | null;
    progress: number;
    streak: number;
  }> {
    // Get user points
    const [user] = await db
      .select({ points: users.points })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get user's rank in current league
    const now = new Date();
    const [currentLeague] = await db
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

    let rank: number | null = null;
    if (currentLeague) {
      const [memberRank] = await db
        .select({ rank: leagueMembers.rank })
        .from(leagueMembers)
        .where(
          and(
            eq(leagueMembers.leagueId, currentLeague.id),
            eq(leagueMembers.userId, userId)
          )
        )
        .limit(1);
      rank = memberRank?.rank || null;
    }

    // Get workout logs count for this month (as calories estimate)
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [workoutCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          gte(workoutLogs.completedAt, firstDayOfMonth)
        )
      );
    // Estimate 300 calories per workout
    const calories = (Number(workoutCount?.count) || 0) * 300;

    // Get user's program progress
    const [userProgram] = await db
      .select({ progress: userPrograms.progress })
      .from(userPrograms)
      .where(eq(userPrograms.userId, userId))
      .orderBy(desc(userPrograms.startDate))
      .limit(1);
    const progress = Number(userProgram?.progress) || 0;

    // Calculate streak (consecutive days with workout)
    const workoutDates = await db
      .select({ date: sql<string>`DATE(${workoutLogs.completedAt})` })
      .from(workoutLogs)
      .where(eq(workoutLogs.userId, userId))
      .orderBy(desc(workoutLogs.completedAt))
      .limit(30);

    let streak = 0;
    if (workoutDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < workoutDates.length; i++) {
        const workoutDate = new Date(workoutDates[i].date);
        workoutDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (workoutDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else if (i === 0 && workoutDate.getTime() === new Date(today.getTime() - 86400000).getTime()) {
          // If no workout today but yesterday, still count
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      points: user?.points || 0,
      calories,
      rank,
      progress: Math.round(progress),
      streak,
    };
  }

  // Coaching Requests
  async createCoachingRequest(request: InsertCoachingRequest): Promise<CoachingRequest> {
    const [result] = await db.insert(coachingRequests).values(request).returning();
    return result;
  }

  async getCoachingRequestsForCoach(coachId: string): Promise<any[]> {
    const result = await db
      .select({
        id: coachingRequests.id,
        type: coachingRequests.type,
        goal: coachingRequests.goal,
        description: coachingRequests.description,
        status: coachingRequests.status,
        createdAt: coachingRequests.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(coachingRequests)
      .innerJoin(users, eq(coachingRequests.userId, users.id))
      .where(eq(coachingRequests.coachId, coachId))
      .orderBy(desc(coachingRequests.createdAt));

    return result;
  }

  async getCoachingRequestsForUser(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: coachingRequests.id,
        type: coachingRequests.type,
        goal: coachingRequests.goal,
        description: coachingRequests.description,
        status: coachingRequests.status,
        rejectionReason: coachingRequests.rejectionReason,
        conversationId: coachingRequests.conversationId,
        createdAt: coachingRequests.createdAt,
        coach: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(coachingRequests)
      .innerJoin(users, eq(coachingRequests.coachId, users.id))
      .where(eq(coachingRequests.userId, userId))
      .orderBy(desc(coachingRequests.createdAt));

    return result;
  }

  async getCoachingRequest(id: string): Promise<any | undefined> {
    const [result] = await db
      .select()
      .from(coachingRequests)
      .where(eq(coachingRequests.id, id))
      .limit(1);

    return result;
  }

  async updateCoachingRequestStatus(
    id: string,
    status: 'accepted' | 'rejected',
    rejectionReason?: string
  ): Promise<CoachingRequest | undefined> {
    // Only update if status is currently 'pending' to prevent race conditions
    const [result] = await db
      .update(coachingRequests)
      .set({
        status,
        rejectionReason: rejectionReason || null,
        updatedAt: new Date(),
      })
      .where(and(eq(coachingRequests.id, id), eq(coachingRequests.status, 'pending')))
      .returning();

    return result;
  }

  async getUserMonthlyRequestCount(userId: string, type: 'workout' | 'nutrition'): Promise<number> {
    // Get first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all requests for this user this month
    const requests = await db
      .select({
        type: coachingRequests.type,
        status: coachingRequests.status,
      })
      .from(coachingRequests)
      .where(
        and(
          eq(coachingRequests.userId, userId),
          gte(coachingRequests.createdAt, firstDayOfMonth)
        )
      );

    // Filter by type and status manually
    const count = requests.filter(r => {
      // Only count pending or accepted
      if (r.status !== 'pending' && r.status !== 'accepted') return false;

      // Check type
      if (type === 'workout') {
        return r.type === 'workout' || r.type === 'both';
      } else {
        return r.type === 'nutrition' || r.type === 'both';
      }
    }).length;

    console.log(`Monthly request count for user ${userId}, type ${type}:`, count, 'from', requests.length, 'total requests');
    return count;
  }

  async getOrCreateConversation(participant1Id: string, participant2Id: string): Promise<Conversation> {
    // Check if conversation already exists
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, participant1Id),
            eq(conversations.participant2Id, participant2Id)
          ),
          and(
            eq(conversations.participant1Id, participant2Id),
            eq(conversations.participant2Id, participant1Id)
          )
        )
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    // Create new conversation
    const [newConv] = await db
      .insert(conversations)
      .values({
        participant1Id,
        participant2Id,
      })
      .returning();

    return newConv;
  }

  // Create program with workouts and assign to student
  async createProgramWithWorkouts(data: {
    coachId: string;
    studentId: string;
    title: string;
    durationWeeks: number;
    days: { title: string; exercises: { name: string; sets: number; reps: string; }[] }[];
  }): Promise<any> {
    // Create program
    const [program] = await db.insert(programs).values({
      coachId: data.coachId,
      title: data.title || "برنامه تمرینی",
      durationWeeks: data.durationWeeks,
      isPublic: false,
    }).returning();

    // Create workout days and exercises
    for (let i = 0; i < data.days.length; i++) {
      const day = data.days[i];
      const [workoutDay] = await db.insert(workoutDays).values({
        programId: program.id,
        weekNumber: 1,
        dayNumber: i + 1,
        title: day.title,
      }).returning();

      // Create exercises for this day
      for (let j = 0; j < day.exercises.length; j++) {
        const exercise = day.exercises[j];
        await db.insert(exercises).values({
          workoutDayId: workoutDay.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          orderIndex: j,
        });
      }
    }

    // Assign program to student
    const [enrollment] = await db.insert(userPrograms).values({
      userId: data.studentId,
      programId: program.id,
    }).returning();

    return { program, enrollment };
  }

  // Get user programs with full details
  async getUserProgramsWithDetails(userId: string): Promise<any[]> {
    const enrollments = await db
      .select({
        id: userPrograms.id,
        startDate: userPrograms.startDate,
        progress: userPrograms.progress,
        completedWorkouts: userPrograms.completedWorkouts,
        program: {
          id: programs.id,
          title: programs.title,
          durationWeeks: programs.durationWeeks,
          coachId: programs.coachId,
        },
      })
      .from(userPrograms)
      .innerJoin(programs, eq(userPrograms.programId, programs.id))
      .where(eq(userPrograms.userId, userId))
      .orderBy(desc(userPrograms.startDate));

    // Get coach info and workout days for each program
    const result = await Promise.all(enrollments.map(async (enrollment) => {
      const [coach] = await db
        .select({ id: users.id, fullName: users.fullName, avatar: users.avatar })
        .from(users)
        .where(eq(users.id, enrollment.program.coachId))
        .limit(1);

      const days = await db
        .select()
        .from(workoutDays)
        .where(eq(workoutDays.programId, enrollment.program.id))
        .orderBy(workoutDays.dayNumber);

      const totalDays = days.length;

      return {
        ...enrollment,
        program: {
          ...enrollment.program,
          coach,
          totalDays,
        },
      };
    }));

    return result;
  }

  // Get program with all workouts and exercises
  async getProgramWithWorkouts(programId: string): Promise<any | undefined> {
    const [program] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, programId))
      .limit(1);

    if (!program) return undefined;

    const [coach] = await db
      .select({ id: users.id, fullName: users.fullName, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, program.coachId))
      .limit(1);

    const days = await db
      .select()
      .from(workoutDays)
      .where(eq(workoutDays.programId, programId))
      .orderBy(workoutDays.dayNumber);

    const daysWithExercises = await Promise.all(days.map(async (day) => {
      const dayExercises = await db
        .select()
        .from(exercises)
        .where(eq(exercises.workoutDayId, day.id))
        .orderBy(exercises.orderIndex);

      return { ...day, exercises: dayExercises };
    }));

    return { ...program, coach, days: daysWithExercises };
  }

  // ==================== NUTRITION PLAN METHODS ====================

  // Save push subscription
  async savePushSubscription(data: { userId: string; endpoint: string; p256dh: string; auth: string }): Promise<any> {
    // Check if subscription already exists
    const [existing] = await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, data.userId),
        eq(pushSubscriptions.endpoint, data.endpoint)
      ))
      .limit(1);

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(pushSubscriptions)
        .set({ p256dh: data.p256dh, auth: data.auth })
        .where(eq(pushSubscriptions.id, existing.id))
        .returning();
      return updated;
    }

    // Create new
    const [subscription] = await db.insert(pushSubscriptions).values(data).returning();
    return subscription;
  }

  // Remove push subscription
  async removePushSubscription(userId: string, endpoint: string): Promise<void> {
    await db.delete(pushSubscriptions).where(
      and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint))
    );
  }

  // Create nutrition plan with meals
  async createNutritionPlanWithMeals(data: {
    coachId: string;
    userId: string;
    title: string;
    description?: string;
    dailyCalories?: number;
    dailyProtein?: number;
    dailyCarbs?: number;
    dailyFat?: number;
    startDate: Date;
    endDate?: Date | null;
    meals: {
      mealType: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
      title: string;
      description?: string;
      scheduledTime: string;
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      items: {
        name: string;
        quantity: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        notes?: string;
      }[];
    }[];
  }): Promise<any> {
    // Deactivate previous active plans for this user
    await db
      .update(nutritionPlans)
      .set({ isActive: false })
      .where(and(eq(nutritionPlans.userId, data.userId), eq(nutritionPlans.isActive, true)));

    // Create the plan
    const [plan] = await db.insert(nutritionPlans).values({
      coachId: data.coachId,
      userId: data.userId,
      title: data.title,
      description: data.description,
      dailyCalories: data.dailyCalories,
      dailyProtein: data.dailyProtein,
      dailyCarbs: data.dailyCarbs,
      dailyFat: data.dailyFat,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
    }).returning();

    // Create meals and items
    for (let i = 0; i < data.meals.length; i++) {
      const mealData = data.meals[i];
      const [meal] = await db.insert(meals).values({
        nutritionPlanId: plan.id,
        mealType: mealData.mealType,
        title: mealData.title,
        description: mealData.description,
        scheduledTime: mealData.scheduledTime,
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        orderIndex: i,
      }).returning();

      // Create meal items
      for (let j = 0; j < mealData.items.length; j++) {
        const item = mealData.items[j];
        await db.insert(mealItems).values({
          mealId: meal.id,
          name: item.name,
          quantity: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          notes: item.notes,
          orderIndex: j,
        });
      }

      // Create default reminder for this meal
      await db.insert(mealReminders).values({
        userId: data.userId,
        mealId: meal.id,
        reminderTime: mealData.scheduledTime,
        isEnabled: true,
      });
    }

    return plan;
  }

  // Get active nutrition plan for user
  async getActiveNutritionPlan(userId: string): Promise<any | null> {
    const [plan] = await db
      .select()
      .from(nutritionPlans)
      .where(and(eq(nutritionPlans.userId, userId), eq(nutritionPlans.isActive, true)))
      .limit(1);

    if (!plan) return null;

    return this.getNutritionPlanWithMeals(plan.id);
  }

  // Get nutrition plan with all meals and items
  async getNutritionPlanWithMeals(planId: string): Promise<any | null> {
    const [plan] = await db
      .select()
      .from(nutritionPlans)
      .where(eq(nutritionPlans.id, planId))
      .limit(1);

    if (!plan) return null;

    // Get coach info
    const [coach] = await db
      .select({ id: users.id, fullName: users.fullName, avatar: users.avatar })
      .from(users)
      .where(eq(users.id, plan.coachId))
      .limit(1);

    // Get meals
    const planMeals = await db
      .select()
      .from(meals)
      .where(eq(meals.nutritionPlanId, planId))
      .orderBy(meals.orderIndex);

    // Get items for each meal
    const mealsWithItems = await Promise.all(planMeals.map(async (meal) => {
      const items = await db
        .select()
        .from(mealItems)
        .where(eq(mealItems.mealId, meal.id))
        .orderBy(mealItems.orderIndex);

      return { ...meal, items };
    }));

    return { ...plan, coach, meals: mealsWithItems };
  }

  // Get all nutrition plans for user
  async getUserNutritionPlans(userId: string): Promise<any[]> {
    const plans = await db
      .select({
        id: nutritionPlans.id,
        title: nutritionPlans.title,
        description: nutritionPlans.description,
        dailyCalories: nutritionPlans.dailyCalories,
        startDate: nutritionPlans.startDate,
        endDate: nutritionPlans.endDate,
        isActive: nutritionPlans.isActive,
        createdAt: nutritionPlans.createdAt,
        coach: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(nutritionPlans)
      .innerJoin(users, eq(nutritionPlans.coachId, users.id))
      .where(eq(nutritionPlans.userId, userId))
      .orderBy(desc(nutritionPlans.createdAt));

    return plans;
  }

  // Log meal completion
  async logMealCompletion(data: { userId: string; mealId: string; notes?: string; rating?: number }): Promise<any> {
    const [log] = await db.insert(mealLogs).values({
      userId: data.userId,
      mealId: data.mealId,
      notes: data.notes,
      rating: data.rating,
    }).returning();
    return log;
  }

  // Get today's meal logs
  async getTodayMealLogs(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await db
      .select({
        id: mealLogs.id,
        mealId: mealLogs.mealId,
        completedAt: mealLogs.completedAt,
        notes: mealLogs.notes,
        rating: mealLogs.rating,
      })
      .from(mealLogs)
      .where(
        and(
          eq(mealLogs.userId, userId),
          gte(mealLogs.completedAt, today),
          lte(mealLogs.completedAt, tomorrow)
        )
      );

    return logs;
  }

  // Set meal reminder
  async setMealReminder(data: { userId: string; mealId: string; reminderTime: string; isEnabled: boolean }): Promise<any> {
    // Check if reminder exists
    const [existing] = await db
      .select()
      .from(mealReminders)
      .where(and(eq(mealReminders.userId, data.userId), eq(mealReminders.mealId, data.mealId)))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(mealReminders)
        .set({ reminderTime: data.reminderTime, isEnabled: data.isEnabled })
        .where(eq(mealReminders.id, existing.id))
        .returning();
      return updated;
    }

    const [reminder] = await db.insert(mealReminders).values(data).returning();
    return reminder;
  }

  // Get user's meal reminders
  async getUserMealReminders(userId: string): Promise<any[]> {
    const reminders = await db
      .select({
        id: mealReminders.id,
        mealId: mealReminders.mealId,
        reminderTime: mealReminders.reminderTime,
        isEnabled: mealReminders.isEnabled,
        meal: {
          id: meals.id,
          title: meals.title,
          mealType: meals.mealType,
          scheduledTime: meals.scheduledTime,
        },
      })
      .from(mealReminders)
      .innerJoin(meals, eq(mealReminders.mealId, meals.id))
      .where(eq(mealReminders.userId, userId));

    return reminders;
  }

  // Toggle meal reminder
  async toggleMealReminder(reminderId: string, isEnabled: boolean): Promise<any> {
    const [updated] = await db
      .update(mealReminders)
      .set({ isEnabled })
      .where(eq(mealReminders.id, reminderId))
      .returning();
    return updated;
  }

  // Get nutrition plans created by coach
  async getCoachNutritionPlans(coachId: string): Promise<any[]> {
    const plans = await db
      .select({
        id: nutritionPlans.id,
        title: nutritionPlans.title,
        dailyCalories: nutritionPlans.dailyCalories,
        startDate: nutritionPlans.startDate,
        isActive: nutritionPlans.isActive,
        createdAt: nutritionPlans.createdAt,
        user: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(nutritionPlans)
      .innerJoin(users, eq(nutritionPlans.userId, users.id))
      .where(eq(nutritionPlans.coachId, coachId))
      .orderBy(desc(nutritionPlans.createdAt));

    return plans;
  }

  // ==================== EDUCATION - TUTORIALS ====================

  async getExerciseTutorials(muscleGroup?: string, difficulty?: string): Promise<any[]> {
    let query = db
      .select({
        id: exerciseTutorials.id,
        name: exerciseTutorials.name,
        description: exerciseTutorials.description,
        muscleGroup: exerciseTutorials.muscleGroup,
        difficulty: exerciseTutorials.difficulty,
        thumbnailUrl: exerciseTutorials.thumbnailUrl,
        likeCount: exerciseTutorials.likeCount,
        viewCount: exerciseTutorials.viewCount,
        createdAt: exerciseTutorials.createdAt,
        coach: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(exerciseTutorials)
      .innerJoin(users, eq(exerciseTutorials.coachId, users.id));

    const conditions = [];
    if (muscleGroup) {
      conditions.push(eq(exerciseTutorials.muscleGroup, muscleGroup as any));
    }
    if (difficulty) {
      conditions.push(eq(exerciseTutorials.difficulty, difficulty as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query.orderBy(desc(exerciseTutorials.createdAt));
  }

  async getExerciseTutorial(id: string): Promise<any | undefined> {
    const [tutorial] = await db
      .select({
        id: exerciseTutorials.id,
        name: exerciseTutorials.name,
        description: exerciseTutorials.description,
        muscleGroup: exerciseTutorials.muscleGroup,
        secondaryMuscles: exerciseTutorials.secondaryMuscles,
        difficulty: exerciseTutorials.difficulty,
        videoUrl: exerciseTutorials.videoUrl,
        thumbnailUrl: exerciseTutorials.thumbnailUrl,
        instructions: exerciseTutorials.instructions,
        tips: exerciseTutorials.tips,
        commonMistakes: exerciseTutorials.commonMistakes,
        likeCount: exerciseTutorials.likeCount,
        viewCount: exerciseTutorials.viewCount,
        createdAt: exerciseTutorials.createdAt,
        coach: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(exerciseTutorials)
      .innerJoin(users, eq(exerciseTutorials.coachId, users.id))
      .where(eq(exerciseTutorials.id, id))
      .limit(1);

    return tutorial;
  }

  async createExerciseTutorial(data: InsertExerciseTutorial): Promise<ExerciseTutorial> {
    const [tutorial] = await db.insert(exerciseTutorials).values(data).returning();
    return tutorial;
  }

  async incrementTutorialViews(id: string): Promise<void> {
    await db
      .update(exerciseTutorials)
      .set({ viewCount: sql`${exerciseTutorials.viewCount} + 1` })
      .where(eq(exerciseTutorials.id, id));
  }

  async toggleTutorialLike(tutorialId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db
      .select()
      .from(exerciseTutorialLikes)
      .where(and(
        eq(exerciseTutorialLikes.tutorialId, tutorialId),
        eq(exerciseTutorialLikes.userId, userId)
      ))
      .limit(1);

    if (existing) {
      await db.delete(exerciseTutorialLikes).where(eq(exerciseTutorialLikes.id, existing.id));
      await db
        .update(exerciseTutorials)
        .set({ likeCount: sql`${exerciseTutorials.likeCount} - 1` })
        .where(eq(exerciseTutorials.id, tutorialId));
    } else {
      await db.insert(exerciseTutorialLikes).values({ tutorialId, userId });
      await db
        .update(exerciseTutorials)
        .set({ likeCount: sql`${exerciseTutorials.likeCount} + 1` })
        .where(eq(exerciseTutorials.id, tutorialId));
    }

    const [tutorial] = await db
      .select({ likeCount: exerciseTutorials.likeCount })
      .from(exerciseTutorials)
      .where(eq(exerciseTutorials.id, tutorialId))
      .limit(1);

    return { liked: !existing, likeCount: tutorial?.likeCount || 0 };
  }

  // ==================== EDUCATION - ARTICLES ====================

  async getArticles(category?: string): Promise<any[]> {
    let query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        readingTime: articles.readingTime,
        likeCount: articles.likeCount,
        viewCount: articles.viewCount,
        createdAt: articles.createdAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(articles)
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.isPublished, true));

    if (category) {
      query = query.where(and(
        eq(articles.isPublished, true),
        eq(articles.category, category as any)
      )) as any;
    }

    return await query.orderBy(desc(articles.createdAt));
  }

  async getArticle(id: string): Promise<any | undefined> {
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        category: articles.category,
        readingTime: articles.readingTime,
        likeCount: articles.likeCount,
        viewCount: articles.viewCount,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        author: {
          id: users.id,
          fullName: users.fullName,
          avatar: users.avatar,
        },
      })
      .from(articles)
      .innerJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id))
      .limit(1);

    return article;
  }

  async createArticle(data: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(data).returning();
    return article;
  }

  async incrementArticleViews(id: string): Promise<void> {
    await db
      .update(articles)
      .set({ viewCount: sql`${articles.viewCount} + 1` })
      .where(eq(articles.id, id));
  }

  async toggleArticleLike(articleId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db
      .select()
      .from(articleLikes)
      .where(and(
        eq(articleLikes.articleId, articleId),
        eq(articleLikes.userId, userId)
      ))
      .limit(1);

    if (existing) {
      await db.delete(articleLikes).where(eq(articleLikes.id, existing.id));
      await db
        .update(articles)
        .set({ likeCount: sql`${articles.likeCount} - 1` })
        .where(eq(articles.id, articleId));
    } else {
      await db.insert(articleLikes).values({ articleId, userId });
      await db
        .update(articles)
        .set({ likeCount: sql`${articles.likeCount} + 1` })
        .where(eq(articles.id, articleId));
    }

    const [article] = await db
      .select({ likeCount: articles.likeCount })
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1);

    return { liked: !existing, likeCount: article?.likeCount || 0 };
  }

  async getCoachProfile(userId: string): Promise<CoachProfile | undefined> {
    const [profile] = await db
      .select()
      .from(coachProfiles)
      .where(eq(coachProfiles.userId, userId))
      .limit(1);
    return profile;
  }
}

export const storage = new DbStorage();
