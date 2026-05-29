CREATE TYPE "body_language_category" AS ENUM('posture', 'eye_contact', 'gestures', 'facial', 'movement');--> statement-breakpoint
CREATE TYPE "body_language_severity" AS ENUM('minor', 'moderate', 'major');--> statement-breakpoint
CREATE TYPE "recording_status" AS ENUM('pending', 'processing', 'analyzed', 'failed');--> statement-breakpoint
CREATE TYPE "remote_readiness_category" AS ENUM('communication', 'time_management', 'tech_proficiency', 'self_discipline', 'home_office');--> statement-breakpoint
CREATE TYPE "remote_readiness_level" AS ENUM('beginner', 'developing', 'competent', 'proficient', 'expert');--> statement-breakpoint
CREATE TABLE "interview_recording" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"duration" integer NOT NULL,
	"status" "recording_status" DEFAULT 'pending'::"recording_status" NOT NULL,
	"thumbnail_url" text,
	"video_url" text,
	"field" "interview_field" DEFAULT 'general'::"interview_field" NOT NULL,
	"program" "imta_program",
	"overall_score" integer DEFAULT 0 NOT NULL,
	"speaking_pace_score" integer DEFAULT 0 NOT NULL,
	"clarity_score" integer DEFAULT 0 NOT NULL,
	"content_quality_score" integer DEFAULT 0 NOT NULL,
	"body_language_score" integer DEFAULT 0 NOT NULL,
	"answer_structure_score" integer DEFAULT 0 NOT NULL,
	"filler_word_count" integer DEFAULT 0 NOT NULL,
	"segments" jsonb DEFAULT '[]' NOT NULL,
	"body_language_tips" jsonb DEFAULT '[]' NOT NULL,
	"improvement_suggestions" text[] DEFAULT '{}'::text[] NOT NULL,
	"strengths" text[] DEFAULT '{}'::text[] NOT NULL,
	"areas_to_improve" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_recording_progress" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"speaking_pace" integer DEFAULT 0 NOT NULL,
	"clarity" integer DEFAULT 0 NOT NULL,
	"content_quality" integer DEFAULT 0 NOT NULL,
	"body_language" integer DEFAULT 0 NOT NULL,
	"filler_words" integer DEFAULT 0 NOT NULL,
	"recording_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "interview_recording_progress_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "job_match_analysis" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"saved_job_id" uuid,
	"resume_id" uuid NOT NULL,
	"resume_name" text NOT NULL,
	"job_title" text NOT NULL,
	"company" text NOT NULL,
	"job_description" text NOT NULL,
	"score" integer NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remote_readiness_checklist" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"checked_items" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remote_readiness_improvement" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"category" "remote_readiness_category" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remote_readiness_office" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"checked_items" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "remote_readiness_result" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"total_score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"percentage" integer NOT NULL,
	"level" "remote_readiness_level" NOT NULL,
	"category_scores" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_job_description" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"description" text NOT NULL,
	"last_score" integer,
	"last_analyzed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "interview_recording_user_id_index" ON "interview_recording" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_recording_user_id_status_index" ON "interview_recording" ("user_id","status");--> statement-breakpoint
CREATE INDEX "interview_recording_user_id_field_index" ON "interview_recording" ("user_id","field");--> statement-breakpoint
CREATE INDEX "interview_recording_user_id_date_index" ON "interview_recording" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_recording_user_id_created_at_index" ON "interview_recording" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_recording_progress_user_id_index" ON "interview_recording_progress" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_recording_progress_user_id_date_index" ON "interview_recording_progress" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_recording_progress_recording_id_index" ON "interview_recording_progress" ("recording_id");--> statement-breakpoint
CREATE INDEX "job_match_analysis_user_id_index" ON "job_match_analysis" ("user_id");--> statement-breakpoint
CREATE INDEX "job_match_analysis_user_id_created_at_index" ON "job_match_analysis" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "job_match_analysis_resume_id_index" ON "job_match_analysis" ("resume_id");--> statement-breakpoint
CREATE INDEX "job_match_analysis_saved_job_id_index" ON "job_match_analysis" ("saved_job_id");--> statement-breakpoint
CREATE INDEX "remote_readiness_checklist_user_id_index" ON "remote_readiness_checklist" ("user_id");--> statement-breakpoint
CREATE INDEX "remote_readiness_improvement_user_id_index" ON "remote_readiness_improvement" ("user_id");--> statement-breakpoint
CREATE INDEX "remote_readiness_improvement_user_id_completed_index" ON "remote_readiness_improvement" ("user_id","completed");--> statement-breakpoint
CREATE INDEX "remote_readiness_office_user_id_index" ON "remote_readiness_office" ("user_id");--> statement-breakpoint
CREATE INDEX "remote_readiness_result_user_id_index" ON "remote_readiness_result" ("user_id");--> statement-breakpoint
CREATE INDEX "remote_readiness_result_user_id_created_at_index" ON "remote_readiness_result" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "saved_job_description_user_id_index" ON "saved_job_description" ("user_id");--> statement-breakpoint
CREATE INDEX "saved_job_description_user_id_created_at_index" ON "saved_job_description" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "interview_recording" ADD CONSTRAINT "interview_recording_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_recording_progress" ADD CONSTRAINT "interview_recording_progress_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_recording_progress" ADD CONSTRAINT "interview_recording_progress_sRhSdZY6j9PJ_fkey" FOREIGN KEY ("recording_id") REFERENCES "interview_recording"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "job_match_analysis" ADD CONSTRAINT "job_match_analysis_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "job_match_analysis" ADD CONSTRAINT "job_match_analysis_saved_job_id_saved_job_description_id_fkey" FOREIGN KEY ("saved_job_id") REFERENCES "saved_job_description"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "job_match_analysis" ADD CONSTRAINT "job_match_analysis_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "remote_readiness_checklist" ADD CONSTRAINT "remote_readiness_checklist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "remote_readiness_improvement" ADD CONSTRAINT "remote_readiness_improvement_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "remote_readiness_office" ADD CONSTRAINT "remote_readiness_office_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "remote_readiness_result" ADD CONSTRAINT "remote_readiness_result_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "saved_job_description" ADD CONSTRAINT "saved_job_description_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;