CREATE TYPE "alert_frequency" AS ENUM('instant', 'daily', 'weekly');--> statement-breakpoint
CREATE TYPE "alert_status" AS ENUM('active', 'paused');--> statement-breakpoint
CREATE TYPE "alert_work_preference" AS ENUM('remote', 'hybrid', 'onsite', 'any');--> statement-breakpoint
CREATE TYPE "assessment_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "match_quality" AS ENUM('excellent', 'good', 'fair');--> statement-breakpoint
CREATE TYPE "recurrence_type" AS ENUM('none', 'daily', 'weekly', 'biweekly', 'monthly');--> statement-breakpoint
CREATE TYPE "reminder_type" AS ENUM('preparation', 'followup');--> statement-breakpoint
CREATE TYPE "roadmap_step_type" AS ENUM('skill', 'experience', 'certification', 'networking', 'education', 'project');--> statement-breakpoint
CREATE TYPE "scheduled_interview_outcome" AS ENUM('pending', 'passed', 'failed', 'on_hold', 'offer_received');--> statement-breakpoint
CREATE TYPE "scheduled_interview_status" AS ENUM('scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show');--> statement-breakpoint
CREATE TYPE "scheduled_interview_type" AS ENUM('phone', 'video', 'in_person');--> statement-breakpoint
CREATE TYPE "skills_quiz_category" AS ENUM('technical', 'soft_skills', 'leadership');--> statement-breakpoint
CREATE TYPE "skills_quiz_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TABLE "availability_slot" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_recurring" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_assessment" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"status" "assessment_status" DEFAULT 'in_progress'::"assessment_status" NOT NULL,
	"current_question" integer DEFAULT 0 NOT NULL,
	"answers" jsonb DEFAULT '[]' NOT NULL,
	"personality_profile" jsonb,
	"career_matches" jsonb,
	"version" text DEFAULT 'v2' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_roadmap" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"goal" jsonb NOT NULL,
	"selected_path" jsonb NOT NULL,
	"progress" jsonb NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"share_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_reminder" (
	"id" uuid PRIMARY KEY,
	"interview_id" uuid NOT NULL,
	"type" "reminder_type" DEFAULT 'preparation'::"reminder_type" NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"message" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_alert" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"locations" text[] DEFAULT '{}'::text[] NOT NULL,
	"salary_min" integer DEFAULT 0 NOT NULL,
	"salary_max" integer DEFAULT 0 NOT NULL,
	"industries" text[] DEFAULT '{}'::text[] NOT NULL,
	"company_sizes" text[] DEFAULT '{}'::text[] NOT NULL,
	"work_preference" "alert_work_preference" DEFAULT 'any'::"alert_work_preference" NOT NULL,
	"frequency" "alert_frequency" DEFAULT 'daily'::"alert_frequency" NOT NULL,
	"status" "alert_status" DEFAULT 'active'::"alert_status" NOT NULL,
	"last_triggered" timestamp with time zone,
	"match_count" integer DEFAULT 0 NOT NULL,
	"viewed_count" integer DEFAULT 0 NOT NULL,
	"applied_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_alert_match" (
	"id" uuid PRIMARY KEY,
	"alert_id" uuid NOT NULL,
	"job_id" text NOT NULL,
	"job_title" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"salary" text,
	"match_score" integer DEFAULT 0 NOT NULL,
	"match_quality" "match_quality" DEFAULT 'fair'::"match_quality" NOT NULL,
	"matched_keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"posted_date" date,
	"matched_date" date NOT NULL,
	"is_viewed" boolean DEFAULT false NOT NULL,
	"is_applied" boolean DEFAULT false NOT NULL,
	"is_duplicate" boolean DEFAULT false NOT NULL,
	"duplicate_of" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_interview" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"type" "scheduled_interview_type" DEFAULT 'video'::"scheduled_interview_type" NOT NULL,
	"status" "scheduled_interview_status" DEFAULT 'scheduled'::"scheduled_interview_status" NOT NULL,
	"outcome" "scheduled_interview_outcome" DEFAULT 'pending'::"scheduled_interview_outcome" NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"timezone" text DEFAULT 'Africa/Casablanca' NOT NULL,
	"location" text,
	"meeting_link" text,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"notes" text,
	"preparation_materials" text,
	"interviewer_names" text[] DEFAULT '{}'::text[],
	"round" integer DEFAULT 1 NOT NULL,
	"recurrence" "recurrence_type" DEFAULT 'none'::"recurrence_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills_quiz_result" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"category" "skills_quiz_category" NOT NULL,
	"total_questions" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"score" integer NOT NULL,
	"level" "skills_quiz_level" NOT NULL,
	"time_spent" integer NOT NULL,
	"skill_breakdown" jsonb DEFAULT '{}' NOT NULL,
	"badges" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "availability_slot_user_id_index" ON "availability_slot" ("user_id");--> statement-breakpoint
CREATE INDEX "availability_slot_user_id_day_of_week_index" ON "availability_slot" ("user_id","day_of_week");--> statement-breakpoint
CREATE INDEX "career_assessment_user_id_index" ON "career_assessment" ("user_id");--> statement-breakpoint
CREATE INDEX "career_assessment_user_id_status_index" ON "career_assessment" ("user_id","status");--> statement-breakpoint
CREATE INDEX "career_assessment_user_id_updated_at_index" ON "career_assessment" ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "career_roadmap_user_id_index" ON "career_roadmap" ("user_id");--> statement-breakpoint
CREATE INDEX "career_roadmap_user_id_updated_at_index" ON "career_roadmap" ("user_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "career_roadmap_share_code_index" ON "career_roadmap" ("share_code");--> statement-breakpoint
CREATE INDEX "interview_reminder_interview_id_index" ON "interview_reminder" ("interview_id");--> statement-breakpoint
CREATE INDEX "interview_reminder_interview_id_completed_index" ON "interview_reminder" ("interview_id","completed");--> statement-breakpoint
CREATE INDEX "job_alert_user_id_index" ON "job_alert" ("user_id");--> statement-breakpoint
CREATE INDEX "job_alert_user_id_status_index" ON "job_alert" ("user_id","status");--> statement-breakpoint
CREATE INDEX "job_alert_user_id_created_at_index" ON "job_alert" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "job_alert_match_alert_id_index" ON "job_alert_match" ("alert_id");--> statement-breakpoint
CREATE INDEX "job_alert_match_alert_id_matched_date_index" ON "job_alert_match" ("alert_id","matched_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "job_alert_match_alert_id_is_viewed_index" ON "job_alert_match" ("alert_id","is_viewed");--> statement-breakpoint
CREATE INDEX "job_alert_match_alert_id_match_quality_index" ON "job_alert_match" ("alert_id","match_quality");--> statement-breakpoint
CREATE INDEX "scheduled_interview_user_id_index" ON "scheduled_interview" ("user_id");--> statement-breakpoint
CREATE INDEX "scheduled_interview_user_id_date_index" ON "scheduled_interview" ("user_id","date");--> statement-breakpoint
CREATE INDEX "scheduled_interview_user_id_status_index" ON "scheduled_interview" ("user_id","status");--> statement-breakpoint
CREATE INDEX "scheduled_interview_user_id_company_index" ON "scheduled_interview" ("user_id","company");--> statement-breakpoint
CREATE INDEX "scheduled_interview_application_id_index" ON "scheduled_interview" ("application_id");--> statement-breakpoint
CREATE INDEX "skills_quiz_result_user_id_index" ON "skills_quiz_result" ("user_id");--> statement-breakpoint
CREATE INDEX "skills_quiz_result_user_id_category_index" ON "skills_quiz_result" ("user_id","category");--> statement-breakpoint
CREATE INDEX "skills_quiz_result_user_id_created_at_index" ON "skills_quiz_result" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "availability_slot" ADD CONSTRAINT "availability_slot_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "career_assessment" ADD CONSTRAINT "career_assessment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "career_roadmap" ADD CONSTRAINT "career_roadmap_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_reminder" ADD CONSTRAINT "interview_reminder_interview_id_scheduled_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "scheduled_interview"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_alert" ADD CONSTRAINT "job_alert_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_alert_match" ADD CONSTRAINT "job_alert_match_alert_id_job_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "job_alert"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_interview" ADD CONSTRAINT "scheduled_interview_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "scheduled_interview" ADD CONSTRAINT "scheduled_interview_application_id_job_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "skills_quiz_result" ADD CONSTRAINT "skills_quiz_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;