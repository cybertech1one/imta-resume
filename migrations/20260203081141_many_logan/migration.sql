CREATE TYPE "interview_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "interview_field" AS ENUM('healthcare', 'industrial', 'hse', 'general');--> statement-breakpoint
CREATE TYPE "interview_session_status" AS ENUM('pending', 'in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "interview_analysis" (
	"id" uuid PRIMARY KEY,
	"session_id" uuid NOT NULL UNIQUE,
	"overall_score" integer NOT NULL,
	"score_breakdown" jsonb DEFAULT '{}' NOT NULL,
	"top_strengths" jsonb DEFAULT '[]' NOT NULL,
	"top_weaknesses" jsonb DEFAULT '[]' NOT NULL,
	"recommendations" jsonb DEFAULT '[]' NOT NULL,
	"readiness_level" text DEFAULT 'needs_practice' NOT NULL,
	"summary" text NOT NULL,
	"next_steps" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_session" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"resume_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"field" "interview_field" DEFAULT 'general'::"interview_field" NOT NULL,
	"types" jsonb DEFAULT '["behavioral","technical"]' NOT NULL,
	"difficulty" "interview_difficulty" DEFAULT 'intermediate'::"interview_difficulty" NOT NULL,
	"language" text DEFAULT 'fr' NOT NULL,
	"status" "interview_session_status" DEFAULT 'pending'::"interview_session_status" NOT NULL,
	"questions" jsonb DEFAULT '[]' NOT NULL,
	"responses" jsonb DEFAULT '[]' NOT NULL,
	"evaluations" jsonb DEFAULT '[]' NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"completed_questions" integer DEFAULT 0 NOT NULL,
	"overall_score" integer,
	"job_position" text,
	"company_name" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "interview_analysis_session_id_index" ON "interview_analysis" ("session_id");--> statement-breakpoint
CREATE INDEX "interview_session_user_id_index" ON "interview_session" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_session_user_id_status_index" ON "interview_session" ("user_id","status");--> statement-breakpoint
CREATE INDEX "interview_session_user_id_created_at_index" ON "interview_session" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_session_resume_id_index" ON "interview_session" ("resume_id");--> statement-breakpoint
ALTER TABLE "interview_analysis" ADD CONSTRAINT "interview_analysis_session_id_interview_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "interview_session"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_session" ADD CONSTRAINT "interview_session_resume_id_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resume"("id") ON DELETE SET NULL;