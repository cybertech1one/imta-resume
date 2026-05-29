CREATE TYPE "gap_analysis_skill_category" AS ENUM('technical', 'soft', 'languages', 'certifications', 'tools');--> statement-breakpoint
CREATE TYPE "timeline_event_type" AS ENUM('job', 'promotion', 'education', 'certification', 'achievement', 'skill', 'goal');--> statement-breakpoint
CREATE TYPE "timeline_goal_category" AS ENUM('position', 'salary', 'skill', 'certification', 'other');--> statement-breakpoint
CREATE TYPE "timeline_skill_category" AS ENUM('technical', 'soft', 'language', 'tool');--> statement-breakpoint
CREATE TYPE "user_skill_category" AS ENUM('technical', 'soft', 'languages', 'certifications');--> statement-breakpoint
CREATE TABLE "career_timeline_event" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "timeline_event_type" NOT NULL,
	"title" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"salary" integer,
	"skills" text[] DEFAULT '{}'::text[],
	"achievements" text[] DEFAULT '{}'::text[],
	"is_goal" boolean DEFAULT false NOT NULL,
	"target_date" date,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_timeline_goal" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"target_date" date NOT NULL,
	"category" "timeline_goal_category" DEFAULT 'other'::"timeline_goal_category" NOT NULL,
	"target_value" integer,
	"current_value" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_timeline_skill" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer DEFAULT 3 NOT NULL,
	"acquired_date" date NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"category" "timeline_skill_category" DEFAULT 'technical'::"timeline_skill_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gap_analysis" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"current_skills" jsonb DEFAULT '[]' NOT NULL,
	"selected_role_id" text,
	"progress_records" jsonb DEFAULT '[]' NOT NULL,
	"weekly_goal_hours" integer DEFAULT 10 NOT NULL,
	"last_analysis_date" timestamp with time zone DEFAULT now() NOT NULL,
	"export_history" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_plan" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skill" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_fr" text NOT NULL,
	"category" "user_skill_category" NOT NULL,
	"rating" integer DEFAULT 1 NOT NULL,
	"target_rating" integer DEFAULT 5 NOT NULL,
	"progress" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skills_data" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"selected_career_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "career_timeline_event_user_id_index" ON "career_timeline_event" ("user_id");--> statement-breakpoint
CREATE INDEX "career_timeline_event_user_id_type_index" ON "career_timeline_event" ("user_id","type");--> statement-breakpoint
CREATE INDEX "career_timeline_event_user_id_start_date_index" ON "career_timeline_event" ("user_id","start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "career_timeline_goal_user_id_index" ON "career_timeline_goal" ("user_id");--> statement-breakpoint
CREATE INDEX "career_timeline_goal_user_id_category_index" ON "career_timeline_goal" ("user_id","category");--> statement-breakpoint
CREATE INDEX "career_timeline_goal_user_id_completed_index" ON "career_timeline_goal" ("user_id","completed");--> statement-breakpoint
CREATE INDEX "career_timeline_goal_user_id_target_date_index" ON "career_timeline_goal" ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "career_timeline_skill_user_id_index" ON "career_timeline_skill" ("user_id");--> statement-breakpoint
CREATE INDEX "career_timeline_skill_user_id_category_index" ON "career_timeline_skill" ("user_id","category");--> statement-breakpoint
CREATE INDEX "career_timeline_skill_user_id_acquired_date_index" ON "career_timeline_skill" ("user_id","acquired_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "gap_analysis_user_id_index" ON "gap_analysis" ("user_id");--> statement-breakpoint
CREATE INDEX "study_plan_user_id_index" ON "study_plan" ("user_id");--> statement-breakpoint
CREATE INDEX "user_skill_user_id_index" ON "user_skill" ("user_id");--> statement-breakpoint
CREATE INDEX "user_skill_user_id_category_index" ON "user_skill" ("user_id","category");--> statement-breakpoint
CREATE INDEX "user_skill_user_id_updated_at_index" ON "user_skill" ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_skills_data_user_id_index" ON "user_skills_data" ("user_id");--> statement-breakpoint
ALTER TABLE "career_timeline_event" ADD CONSTRAINT "career_timeline_event_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "career_timeline_goal" ADD CONSTRAINT "career_timeline_goal_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "career_timeline_skill" ADD CONSTRAINT "career_timeline_skill_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "gap_analysis" ADD CONSTRAINT "gap_analysis_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "study_plan" ADD CONSTRAINT "study_plan_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_skill" ADD CONSTRAINT "user_skill_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_skills_data" ADD CONSTRAINT "user_skills_data_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;