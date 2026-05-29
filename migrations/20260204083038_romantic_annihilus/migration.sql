CREATE TYPE "confidence_exercise_category" AS ENUM('breathing', 'affirmations', 'power_poses', 'visualization', 'anxiety_management');--> statement-breakpoint
CREATE TABLE "confidence_completed_exercise" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"exercise_id" text NOT NULL,
	"completed_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "confidence_completed_exercise_user_id_exercise_id_completed_date_unique" UNIQUE("user_id","exercise_id","completed_date")
);
--> statement-breakpoint
CREATE TABLE "confidence_daily_routine_item" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"exercise_id" text NOT NULL,
	"scheduled_time" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "confidence_daily_routine_item_user_id_exercise_id_unique" UNIQUE("user_id","exercise_id")
);
--> statement-breakpoint
CREATE TABLE "confidence_exercise_stats" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"total_completed" integer DEFAULT 0 NOT NULL,
	"streak" integer DEFAULT 0 NOT NULL,
	"last_completed_date" date,
	"category_progress" jsonb DEFAULT '{"breathing":0,"affirmations":0,"power_poses":0,"visualization":0,"anxiety_management":0}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_tip_favorite" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"tip_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_tip_favorite_user_id_tip_id_unique" UNIQUE("user_id","tip_id")
);
--> statement-breakpoint
CREATE TABLE "outfit_checklist_item" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"is_checked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "outfit_checklist_item_user_id_item_id_unique" UNIQUE("user_id","item_id")
);
--> statement-breakpoint
CREATE TABLE "quick_interview_checklist" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"checked_items" text[] DEFAULT '{}'::text[] NOT NULL,
	"reminder_date" date,
	"reminder_time" text,
	"reminder_company" text,
	"reminder_notification_scheduled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "confidence_completed_exercise_user_id_index" ON "confidence_completed_exercise" ("user_id");--> statement-breakpoint
CREATE INDEX "confidence_completed_exercise_user_id_completed_date_index" ON "confidence_completed_exercise" ("user_id","completed_date");--> statement-breakpoint
CREATE INDEX "confidence_daily_routine_item_user_id_index" ON "confidence_daily_routine_item" ("user_id");--> statement-breakpoint
CREATE INDEX "confidence_daily_routine_item_user_id_order_index" ON "confidence_daily_routine_item" ("user_id","order");--> statement-breakpoint
CREATE INDEX "confidence_exercise_stats_user_id_index" ON "confidence_exercise_stats" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_tip_favorite_user_id_index" ON "interview_tip_favorite" ("user_id");--> statement-breakpoint
CREATE INDEX "outfit_checklist_item_user_id_index" ON "outfit_checklist_item" ("user_id");--> statement-breakpoint
CREATE INDEX "quick_interview_checklist_user_id_index" ON "quick_interview_checklist" ("user_id");--> statement-breakpoint
ALTER TABLE "confidence_completed_exercise" ADD CONSTRAINT "confidence_completed_exercise_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "confidence_daily_routine_item" ADD CONSTRAINT "confidence_daily_routine_item_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "confidence_exercise_stats" ADD CONSTRAINT "confidence_exercise_stats_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_tip_favorite" ADD CONSTRAINT "interview_tip_favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "outfit_checklist_item" ADD CONSTRAINT "outfit_checklist_item_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quick_interview_checklist" ADD CONSTRAINT "quick_interview_checklist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;