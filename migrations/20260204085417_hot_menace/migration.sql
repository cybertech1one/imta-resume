CREATE TYPE "feedback_category" AS ENUM('technical', 'behavioral', 'communication', 'problem_solving', 'leadership', 'cultural_fit');--> statement-breakpoint
CREATE TYPE "feedback_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "feedback_type" AS ENUM('strength', 'improvement');--> statement-breakpoint
CREATE TYPE "interview_goal_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "pattern_type" AS ENUM('recurring_strength', 'recurring_weakness', 'improvement_trend', 'decline_trend');--> statement-breakpoint
CREATE TABLE "interview_feedback_goal" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "feedback_category" NOT NULL,
	"target_date" date NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" "interview_goal_status" DEFAULT 'not_started'::"interview_goal_status" NOT NULL,
	"related_feedback_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"milestones" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_feedback_item" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"session_id" uuid,
	"session_title" text,
	"date" date NOT NULL,
	"category" "feedback_category" NOT NULL,
	"type" "feedback_type" NOT NULL,
	"content" text NOT NULL,
	"source" text NOT NULL,
	"action_items" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"priority" "feedback_priority" DEFAULT 'medium'::"feedback_priority" NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_feedback_pattern" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "pattern_type" NOT NULL,
	"category" "feedback_category" NOT NULL,
	"description" text NOT NULL,
	"frequency" integer DEFAULT 1 NOT NULL,
	"confidence" integer DEFAULT 50 NOT NULL,
	"recommendations" text[] DEFAULT '{}'::text[] NOT NULL,
	"related_feedback_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_feedback_trend" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"technical" integer DEFAULT 0 NOT NULL,
	"behavioral" integer DEFAULT 0 NOT NULL,
	"communication" integer DEFAULT 0 NOT NULL,
	"problem_solving" integer DEFAULT 0 NOT NULL,
	"leadership" integer DEFAULT 0 NOT NULL,
	"cultural_fit" integer DEFAULT 0 NOT NULL,
	"overall" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_feedback_trend_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE INDEX "interview_feedback_goal_user_id_index" ON "interview_feedback_goal" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_goal_user_id_status_index" ON "interview_feedback_goal" ("user_id","status");--> statement-breakpoint
CREATE INDEX "interview_feedback_goal_user_id_category_index" ON "interview_feedback_goal" ("user_id","category");--> statement-breakpoint
CREATE INDEX "interview_feedback_goal_user_id_target_date_index" ON "interview_feedback_goal" ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "interview_feedback_item_user_id_index" ON "interview_feedback_item" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_item_user_id_category_index" ON "interview_feedback_item" ("user_id","category");--> statement-breakpoint
CREATE INDEX "interview_feedback_item_user_id_type_index" ON "interview_feedback_item" ("user_id","type");--> statement-breakpoint
CREATE INDEX "interview_feedback_item_user_id_is_resolved_index" ON "interview_feedback_item" ("user_id","is_resolved");--> statement-breakpoint
CREATE INDEX "interview_feedback_item_user_id_date_index" ON "interview_feedback_item" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_feedback_item_session_id_index" ON "interview_feedback_item" ("session_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_pattern_user_id_index" ON "interview_feedback_pattern" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_pattern_user_id_type_index" ON "interview_feedback_pattern" ("user_id","type");--> statement-breakpoint
CREATE INDEX "interview_feedback_pattern_user_id_category_index" ON "interview_feedback_pattern" ("user_id","category");--> statement-breakpoint
CREATE INDEX "interview_feedback_trend_user_id_index" ON "interview_feedback_trend" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_feedback_trend_user_id_date_index" ON "interview_feedback_trend" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "interview_feedback_goal" ADD CONSTRAINT "interview_feedback_goal_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_feedback_item" ADD CONSTRAINT "interview_feedback_item_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_feedback_item" ADD CONSTRAINT "interview_feedback_item_session_id_interview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "interview_feedback_pattern" ADD CONSTRAINT "interview_feedback_pattern_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_feedback_trend" ADD CONSTRAINT "interview_feedback_trend_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;