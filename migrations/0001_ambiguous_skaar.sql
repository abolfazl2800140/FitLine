CREATE TYPE "public"."coaching_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."coaching_request_type" AS ENUM('workout', 'nutrition', 'both', 'consultation');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack');--> statement-breakpoint
CREATE TABLE "coaching_requests" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"coach_id" varchar(36) NOT NULL,
	"type" "coaching_request_type" NOT NULL,
	"goal" text NOT NULL,
	"description" text,
	"status" "coaching_request_status" DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"conversation_id" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_items" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meal_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"quantity" text NOT NULL,
	"calories" integer,
	"protein" integer,
	"carbs" integer,
	"fat" integer,
	"notes" text,
	"order_index" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "meal_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"meal_id" varchar(36) NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"rating" integer
);
--> statement-breakpoint
CREATE TABLE "meal_reminders" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"meal_id" varchar(36) NOT NULL,
	"reminder_time" text NOT NULL,
	"is_enabled" boolean DEFAULT true,
	"last_sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nutrition_plan_id" varchar(36) NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_time" text NOT NULL,
	"calories" integer,
	"protein" integer,
	"carbs" integer,
	"fat" integer,
	"order_index" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "nutrition_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"daily_calories" integer,
	"daily_protein" integer,
	"daily_carbs" integer,
	"daily_fat" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "parent_id" varchar(36);--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "reply_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reply_to_id" varchar(36);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "coaching_requests" ADD CONSTRAINT "coaching_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_requests" ADD CONSTRAINT "coaching_requests_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_requests" ADD CONSTRAINT "coaching_requests_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_reminders" ADD CONSTRAINT "meal_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_reminders" ADD CONSTRAINT "meal_reminders_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_nutrition_plan_id_nutrition_plans_id_fk" FOREIGN KEY ("nutrition_plan_id") REFERENCES "public"."nutrition_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_messages_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;