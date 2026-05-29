CREATE TYPE "mentor_expertise_level" AS ENUM('beginner', 'intermediate', 'advanced', 'expert');--> statement-breakpoint
CREATE TYPE "mentor_status" AS ENUM('available', 'busy', 'on_vacation');--> statement-breakpoint
CREATE TYPE "mentorship_goal_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "mentorship_request_status" AS ENUM('pending', 'accepted', 'declined', 'completed');--> statement-breakpoint
CREATE TYPE "mentorship_session_status" AS ENUM('scheduled', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "mentorship_session_type" AS ENUM('video_call', 'phone_call', 'in_person', 'chat');--> statement-breakpoint
CREATE TYPE "recommendation_request_status" AS ENUM('pending', 'received', 'sent');--> statement-breakpoint
CREATE TYPE "recommender_type" AS ENUM('supervisor', 'colleague', 'professor', 'mentor', 'client');--> statement-breakpoint
CREATE TYPE "reminder_frequency" AS ENUM('none', 'daily', 'weekly', 'biweekly');--> statement-breakpoint
CREATE TABLE "mentor_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"avatar" text,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text NOT NULL,
	"bio" text NOT NULL,
	"expertise" text[] DEFAULT '{}'::text[] NOT NULL,
	"skills" jsonb DEFAULT '[]' NOT NULL,
	"years_of_experience" integer DEFAULT 0 NOT NULL,
	"industries" text[] DEFAULT '{}'::text[] NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "mentor_status" DEFAULT 'available'::"mentor_status" NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"total_mentees" integer DEFAULT 0 NOT NULL,
	"hourly_rate" integer,
	"is_free" boolean DEFAULT true NOT NULL,
	"linkedin_url" text,
	"availability" jsonb DEFAULT '[]' NOT NULL,
	"career_path" text[] DEFAULT '{}'::text[] NOT NULL,
	"achievements" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_review" (
	"id" uuid PRIMARY KEY,
	"mentor_id" uuid NOT NULL,
	"mentee_id" text NOT NULL,
	"mentee_name" text NOT NULL,
	"mentee_avatar" text,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_goal" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"mentorship_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"target_date" date NOT NULL,
	"status" "mentorship_goal_status" DEFAULT 'not_started'::"mentorship_goal_status" NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"milestones" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_request" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"mentor_id" uuid NOT NULL,
	"mentor_name" text NOT NULL,
	"mentee_id" text NOT NULL,
	"mentee_name" text NOT NULL,
	"message" text NOT NULL,
	"goals" text[] DEFAULT '{}'::text[] NOT NULL,
	"status" "mentorship_request_status" DEFAULT 'pending'::"mentorship_request_status" NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_session" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"mentor_id" uuid NOT NULL,
	"mentor_name" text NOT NULL,
	"mentor_avatar" text,
	"mentee_id" text NOT NULL,
	"mentee_name" text NOT NULL,
	"type" "mentorship_session_type" DEFAULT 'video_call'::"mentorship_session_type" NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"topic" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"status" "mentorship_session_status" DEFAULT 'scheduled'::"mentorship_session_status" NOT NULL,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_request" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"recommender_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"deadline" date NOT NULL,
	"status" "recommendation_request_status" DEFAULT 'pending'::"recommendation_request_status" NOT NULL,
	"request_date" date NOT NULL,
	"received_date" date,
	"sent_to_date" date,
	"talking_points" text[] DEFAULT '{}'::text[] NOT NULL,
	"follow_up_reminder" "reminder_frequency" DEFAULT 'weekly'::"reminder_frequency" NOT NULL,
	"last_reminder_sent" date,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommender" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"company" text DEFAULT '' NOT NULL,
	"relationship" "recommender_type" DEFAULT 'supervisor'::"recommender_type" NOT NULL,
	"years_known" integer DEFAULT 1 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mentorship_goals" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"target_role" text DEFAULT '' NOT NULL,
	"skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"industries" text[] DEFAULT '{}'::text[] NOT NULL,
	"timeline" text DEFAULT '6 months' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mentor_profile_user_id_index" ON "mentor_profile" ("user_id");--> statement-breakpoint
CREATE INDEX "mentor_profile_status_index" ON "mentor_profile" ("status");--> statement-breakpoint
CREATE INDEX "mentor_profile_rating_index" ON "mentor_profile" ("rating" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mentor_profile_created_at_index" ON "mentor_profile" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mentor_review_mentor_id_index" ON "mentor_review" ("mentor_id");--> statement-breakpoint
CREATE INDEX "mentor_review_mentor_id_created_at_index" ON "mentor_review" ("mentor_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mentorship_goal_user_id_index" ON "mentorship_goal" ("user_id");--> statement-breakpoint
CREATE INDEX "mentorship_goal_user_id_status_index" ON "mentorship_goal" ("user_id","status");--> statement-breakpoint
CREATE INDEX "mentorship_goal_user_id_mentorship_id_index" ON "mentorship_goal" ("user_id","mentorship_id");--> statement-breakpoint
CREATE INDEX "mentorship_goal_user_id_target_date_index" ON "mentorship_goal" ("user_id","target_date");--> statement-breakpoint
CREATE INDEX "mentorship_request_user_id_index" ON "mentorship_request" ("user_id");--> statement-breakpoint
CREATE INDEX "mentorship_request_mentor_id_index" ON "mentorship_request" ("mentor_id");--> statement-breakpoint
CREATE INDEX "mentorship_request_user_id_status_index" ON "mentorship_request" ("user_id","status");--> statement-breakpoint
CREATE INDEX "mentorship_request_user_id_created_at_index" ON "mentorship_request" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "mentorship_session_user_id_index" ON "mentorship_session" ("user_id");--> statement-breakpoint
CREATE INDEX "mentorship_session_mentor_id_index" ON "mentorship_session" ("mentor_id");--> statement-breakpoint
CREATE INDEX "mentorship_session_user_id_status_index" ON "mentorship_session" ("user_id","status");--> statement-breakpoint
CREATE INDEX "mentorship_session_user_id_scheduled_at_index" ON "mentorship_session" ("user_id","scheduled_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recommendation_request_user_id_index" ON "recommendation_request" ("user_id");--> statement-breakpoint
CREATE INDEX "recommendation_request_user_id_status_index" ON "recommendation_request" ("user_id","status");--> statement-breakpoint
CREATE INDEX "recommendation_request_user_id_deadline_index" ON "recommendation_request" ("user_id","deadline");--> statement-breakpoint
CREATE INDEX "recommendation_request_user_id_created_at_index" ON "recommendation_request" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recommendation_request_recommender_id_index" ON "recommendation_request" ("recommender_id");--> statement-breakpoint
CREATE INDEX "recommender_user_id_index" ON "recommender" ("user_id");--> statement-breakpoint
CREATE INDEX "recommender_user_id_relationship_index" ON "recommender" ("user_id","relationship");--> statement-breakpoint
CREATE INDEX "recommender_user_id_created_at_index" ON "recommender" ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_mentorship_goals_user_id_index" ON "user_mentorship_goals" ("user_id");--> statement-breakpoint
ALTER TABLE "mentor_profile" ADD CONSTRAINT "mentor_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentor_review" ADD CONSTRAINT "mentor_review_mentor_id_mentor_profile_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentorship_goal" ADD CONSTRAINT "mentorship_goal_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentorship_request" ADD CONSTRAINT "mentorship_request_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentorship_request" ADD CONSTRAINT "mentorship_request_mentor_id_mentor_profile_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentorship_session" ADD CONSTRAINT "mentorship_session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "mentorship_session" ADD CONSTRAINT "mentorship_session_mentor_id_mentor_profile_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profile"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recommendation_request" ADD CONSTRAINT "recommendation_request_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recommendation_request" ADD CONSTRAINT "recommendation_request_recommender_id_recommender_id_fkey" FOREIGN KEY ("recommender_id") REFERENCES "recommender"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "recommender" ADD CONSTRAINT "recommender_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_mentorship_goals" ADD CONSTRAINT "user_mentorship_goals_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;