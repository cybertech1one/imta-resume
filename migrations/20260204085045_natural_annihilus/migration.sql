CREATE TYPE "follow_up_priority" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "interview_note_impression" AS ENUM('positive', 'neutral', 'negative');--> statement-breakpoint
CREATE TYPE "interview_note_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "interview_note_type" AS ENUM('phone', 'video', 'in_person', 'technical', 'panel');--> statement-breakpoint
CREATE TYPE "mock_ai_difficulty" AS ENUM('debutant', 'intermediaire', 'avance');--> statement-breakpoint
CREATE TYPE "mock_ai_field" AS ENUM('healthcare', 'industrial', 'hse');--> statement-breakpoint
CREATE TABLE "interview_note" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"application_id" uuid,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text,
	"location" text,
	"type" "interview_note_type" DEFAULT 'in_person'::"interview_note_type" NOT NULL,
	"status" "interview_note_status" DEFAULT 'scheduled'::"interview_note_status" NOT NULL,
	"interviewers" jsonb DEFAULT '[]' NOT NULL,
	"key_points" jsonb DEFAULT '[]' NOT NULL,
	"follow_up_actions" jsonb DEFAULT '[]' NOT NULL,
	"question_responses" jsonb DEFAULT '[]' NOT NULL,
	"general_notes" text DEFAULT '' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"overall_impression" "interview_note_impression",
	"next_steps" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_ai_session" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"field" "mock_ai_field" NOT NULL,
	"program" text NOT NULL,
	"difficulty" "mock_ai_difficulty" NOT NULL,
	"messages" jsonb DEFAULT '[]' NOT NULL,
	"current_question_index" integer DEFAULT 0 NOT NULL,
	"total_questions" integer NOT NULL,
	"scores" jsonb DEFAULT '[]' NOT NULL,
	"overall_score" integer,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_bank_favorite" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_bank_favorite_user_id_question_id_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
CREATE INDEX "interview_note_user_id_index" ON "interview_note" ("user_id");--> statement-breakpoint
CREATE INDEX "interview_note_user_id_status_index" ON "interview_note" ("user_id","status");--> statement-breakpoint
CREATE INDEX "interview_note_user_id_company_index" ON "interview_note" ("user_id","company");--> statement-breakpoint
CREATE INDEX "interview_note_user_id_date_index" ON "interview_note" ("user_id","date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "interview_note_application_id_index" ON "interview_note" ("application_id");--> statement-breakpoint
CREATE INDEX "mock_ai_session_user_id_index" ON "mock_ai_session" ("user_id");--> statement-breakpoint
CREATE INDEX "mock_ai_session_user_id_completed_at_index" ON "mock_ai_session" ("user_id","completed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mock_ai_session_user_id_created_at_index" ON "mock_ai_session" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "question_bank_favorite_user_id_index" ON "question_bank_favorite" ("user_id");--> statement-breakpoint
ALTER TABLE "interview_note" ADD CONSTRAINT "interview_note_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "interview_note" ADD CONSTRAINT "interview_note_application_id_job_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "job_application"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "mock_ai_session" ADD CONSTRAINT "mock_ai_session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "question_bank_favorite" ADD CONSTRAINT "question_bank_favorite_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;