import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum('user_role', ['user', 'coach', 'admin']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const difficultyEnum = pgEnum('difficulty', ['beginner', 'intermediate', 'advanced', 'expert']);
export const leagueTierEnum = pgEnum('league_tier', ['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export const challengeTypeEnum = pgEnum('challenge_type', ['weekly', 'monthly']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  role: userRoleEnum("role").default('user').notNull(),
  gender: genderEnum("gender"),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 4, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coachProfiles = pgTable("coach_profiles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  experience: integer("experience").notNull(),
  pricePerSession: decimal("price_per_session", { precision: 10, scale: 0 }).notNull(),
  credentials: text("credentials"),
  about: text("about"),
  clientCount: integer("client_count").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  coverImage: text("cover_image"),
  isVerified: boolean("is_verified").default(false),
  gallery: jsonb("gallery").$type<string[]>().default([]),
});

export const programs = pgTable("programs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id", { length: 36 }).notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  difficulty: difficultyEnum("difficulty").default('beginner'),
  durationWeeks: integer("duration_weeks").notNull(),
  price: decimal("price", { precision: 10, scale: 0 }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutDays = pgTable("workout_days", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id", { length: 36 }).notNull().references(() => programs.id),
  weekNumber: integer("week_number").notNull(),
  dayNumber: integer("day_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
});

export const exercises = pgTable("exercises", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  workoutDayId: varchar("workout_day_id", { length: 36 }).notNull().references(() => workoutDays.id),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  restSeconds: integer("rest_seconds"),
  videoUrl: text("video_url"),
  notes: text("notes"),
  orderIndex: integer("order_index").default(0),
});

export const userPrograms = pgTable("user_programs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  programId: varchar("program_id", { length: 36 }).notNull().references(() => programs.id),
  startDate: timestamp("start_date").defaultNow().notNull(),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"),
  completedWorkouts: integer("completed_workouts").default(0),
});

export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  workoutDayId: varchar("workout_day_id", { length: 36 }).notNull().references(() => workoutDays.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  notes: text("notes"),
  exerciseLogs: jsonb("exercise_logs").$type<{ exerciseId: string; weight: number; reps: number[] }[]>(),
});

export const posts = pgTable("posts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id", { length: 36 }).notNull().references(() => posts.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id", { length: 36 }).notNull().references(() => users.id),
  followingId: varchar("following_id", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id", { length: 36 }).notNull().references(() => users.id),
  participant2Id: varchar("participant2_id", { length: 36 }).notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessage: text("last_message"),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id", { length: 36 }).notNull().references(() => conversations.id),
  senderId: varchar("sender_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplements = pgTable("supplements", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 0 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 0 }),
  image: text("image"),
  category: text("category").notNull(),
  nutritionFacts: jsonb("nutrition_facts"),
  stock: integer("stock").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  supplementId: varchar("supplement_id", { length: 36 }).notNull().references(() => supplements.id),
  quantity: integer("quantity").default(1),
});

export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 0 }).notNull(),
  status: orderStatusEnum("status").default('pending'),
  items: jsonb("items").$type<{ supplementId: string; quantity: number; price: number }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: challengeTypeEnum("type").default('weekly'),
  goal: text("goal").notNull(),
  targetValue: integer("target_value"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participantCount: integer("participant_count").default(0),
  coverImage: text("cover_image"),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id", { length: 36 }).notNull().references(() => challenges.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  progress: integer("progress").default(0),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const leagues = pgTable("leagues", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  tier: leagueTierEnum("tier").default('bronze'),
  isActive: boolean("is_active").default(true),
});

export const leagueMembers = pgTable("league_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id", { length: 36 }).notNull().references(() => leagues.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  score: integer("score").default(0),
  rank: integer("rank"),
  socialScore: integer("social_score").default(0),
  workoutScore: integer("workout_score").default(0),
  coachScore: integer("coach_score").default(0),
});

export const badges = pgTable("badges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  category: text("category"),
  requirement: text("requirement"),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  badgeId: varchar("badge_id", { length: 36 }).notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const progressPhotos = pgTable("progress_photos", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  imageUrl: text("image_url").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  bodyFat: decimal("body_fat", { precision: 4, scale: 1 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const progressMetrics = pgTable("progress_metrics", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  metricType: text("metric_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id", { length: 36 }).notNull().references(() => users.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplementReviews = pgTable("supplement_reviews", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  supplementId: varchar("supplement_id", { length: 36 }).notNull().references(() => supplements.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  voteCount: integer("vote_count").default(0),
  answerCount: integer("answer_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const answers = pgTable("answers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id", { length: 36 }).notNull().references(() => questions.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  content: text("content").notNull(),
  isBestAnswer: boolean("is_best_answer").default(false),
  voteCount: integer("vote_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  coachProfile: one(coachProfiles, { fields: [users.id], references: [coachProfiles.userId] }),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  followers: many(follows, { relationName: "following" }),
  following: many(follows, { relationName: "follower" }),
  sentMessages: many(messages),
  userPrograms: many(userPrograms),
  workoutLogs: many(workoutLogs),
  badges: many(userBadges),
  progressPhotos: many(progressPhotos),
  progressMetrics: many(progressMetrics),
  reviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "coach" }),
  questions: many(questions),
  answers: many(answers),
  cartItems: many(cartItems),
  orders: many(orders),
  challengeParticipations: many(challengeParticipants),
  leagueMemberships: many(leagueMembers),
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one }) => ({
  user: one(users, { fields: [coachProfiles.userId], references: [users.id] }),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  coach: one(users, { fields: [programs.coachId], references: [users.id] }),
  workoutDays: many(workoutDays),
  enrollments: many(userPrograms),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  program: one(programs, { fields: [workoutDays.programId], references: [programs.id] }),
  exercises: many(exercises),
  logs: many(workoutLogs),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workoutDay: one(workoutDays, { fields: [exercises.workoutDayId], references: [workoutDays.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  likes: many(likes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, { fields: [likes.postId], references: [posts.id] }),
  user: one(users, { fields: [likes.userId], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id], relationName: "follower" }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: "following" }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, { fields: [conversations.participant1Id], references: [users.id], relationName: "participant1" }),
  participant2: one(users, { fields: [conversations.participant2Id], references: [users.id], relationName: "participant2" }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const supplementsRelations = relations(supplements, ({ many }) => ({
  reviews: many(supplementReviews),
  cartItems: many(cartItems),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  participants: many(challengeParticipants),
}));

export const leaguesRelations = relations(leagues, ({ many }) => ({
  members: many(leagueMembers),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  user: one(users, { fields: [questions.userId], references: [users.id] }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, { fields: [answers.questionId], references: [questions.id] }),
  user: one(users, { fields: [answers.userId], references: [users.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  coach: one(users, { fields: [reviews.coachId], references: [users.id], relationName: "coach" }),
  reviewer: one(users, { fields: [reviews.userId], references: [users.id], relationName: "reviewer" }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({ id: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true, createdAt: true });
export const insertWorkoutDaySchema = createInsertSchema(workoutDays).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, likeCount: true, commentCount: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, lastMessageAt: true, lastMessage: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, isRead: true });
export const insertSupplementSchema = createInsertSchema(supplements).omit({ id: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, participantCount: true });
export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({ id: true, joinedAt: true });
export const insertLeagueSchema = createInsertSchema(leagues).omit({ id: true });
export const insertLeagueMemberSchema = createInsertSchema(leagueMembers).omit({ id: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, earnedAt: true });
export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true, createdAt: true });
export const insertProgressMetricSchema = createInsertSchema(progressMetrics).omit({ id: true, recordedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertSupplementReviewSchema = createInsertSchema(supplementReviews).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true, createdAt: true, voteCount: true, answerCount: true });
export const insertAnswerSchema = createInsertSchema(answers).omit({ id: true, createdAt: true, isBestAnswer: true, voteCount: true });
export const insertUserProgramSchema = createInsertSchema(userPrograms).omit({ id: true, startDate: true, progress: true, completedWorkouts: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true, completedAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;
export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;
export type InsertWorkoutDay = z.infer<typeof insertWorkoutDaySchema>;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertSupplement = z.infer<typeof insertSupplementSchema>;
export type Supplement = typeof supplements.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leagues.$inferSelect;
export type InsertLeagueMember = z.infer<typeof insertLeagueMemberSchema>;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressMetric = z.infer<typeof insertProgressMetricSchema>;
export type ProgressMetric = typeof progressMetrics.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertSupplementReview = z.infer<typeof insertSupplementReviewSchema>;
export type SupplementReview = typeof supplementReviews.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;
export type InsertUserProgram = z.infer<typeof insertUserProgramSchema>;
export type UserProgram = typeof userPrograms.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
