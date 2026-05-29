DO $$ BEGIN
    CREATE TYPE "achievement_category" AS ENUM('resume', 'interview', 'job_search', 'learning', 'engagement', 'networking', 'career');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "achievement_notification_type" AS ENUM('achievement', 'level_up', 'streak', 'challenge', 'reward');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "achievement_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "challenge_type" AS ENUM('daily', 'weekly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "feedback_score_category" AS ENUM('excellent', 'good', 'average', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "networking_event_rsvp" AS ENUM('going', 'maybe', 'not_going');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "networking_event_type" AS ENUM('conference', 'meetup', 'webinar', 'networking');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "reward_type" AS ENUM('theme', 'badge', 'feature', 'template');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "search_result_type" AS ENUM('route', 'resume', 'job_application', 'contact', 'skill');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "user_activity_type" AS ENUM('resume_created', 'resume_updated', 'resume_deleted', 'job_application_created', 'job_application_updated', 'job_application_status_changed', 'interview_scheduled', 'interview_completed', 'interview_practice_started', 'interview_practice_completed', 'skill_added', 'skill_updated', 'goal_created', 'goal_completed', 'contact_added', 'training_started', 'training_completed', 'deadline_created', 'deadline_completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievement_definition" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"category" "achievement_category" NOT NULL,
	"unit" text NOT NULL,
	"bronze_target" integer NOT NULL,
	"bronze_xp" integer NOT NULL,
	"silver_target" integer NOT NULL,
	"silver_xp" integer NOT NULL,
	"gold_target" integer NOT NULL,
	"gold_xp" integer NOT NULL,
	"platinum_target" integer NOT NULL,
	"platinum_xp" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievement_notification" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "achievement_notification_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "achievement_notification_preferences" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"achievements" boolean DEFAULT true NOT NULL,
	"level_ups" boolean DEFAULT true NOT NULL,
	"streaks" boolean DEFAULT true NOT NULL,
	"challenges" boolean DEFAULT false NOT NULL,
	"leaderboard" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenge" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"type" "challenge_type" NOT NULL,
	"target" integer NOT NULL,
	"current" integer DEFAULT 0 NOT NULL,
	"xp_reward" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_difficulty_config" (
	"id" uuid PRIMARY KEY,
	"difficulty" "mock_ai_difficulty" NOT NULL UNIQUE,
	"label" text NOT NULL,
	"color" text DEFAULT 'text-gray-600' NOT NULL,
	"questions_count" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_feedback_template" (
	"id" uuid PRIMARY KEY,
	"category" "feedback_score_category" NOT NULL,
	"min_score" integer NOT NULL,
	"max_score" integer NOT NULL,
	"strengths" text[] DEFAULT '{}'::text[] NOT NULL,
	"improvements" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_field_config" (
	"id" uuid PRIMARY KEY,
	"field" "mock_ai_field" NOT NULL UNIQUE,
	"label" text NOT NULL,
	"icon" text DEFAULT 'TargetIcon' NOT NULL,
	"color" text DEFAULT 'text-gray-600' NOT NULL,
	"bg_color" text DEFAULT 'bg-gray-100 dark:bg-gray-900/30' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_interview_tip" (
	"id" uuid PRIMARY KEY,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_program" (
	"id" uuid PRIMARY KEY,
	"field" "mock_ai_field" NOT NULL,
	"program_id" text NOT NULL,
	"program_name" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mock_ai_question" (
	"id" uuid PRIMARY KEY,
	"field" "mock_ai_field" NOT NULL,
	"program" text NOT NULL,
	"difficulty" "mock_ai_difficulty" NOT NULL,
	"question_text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "networking_event" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"location" text NOT NULL,
	"type" "networking_event_type" DEFAULT 'networking'::"networking_event_type" NOT NULL,
	"description" text,
	"rsvp_status" "networking_event_rsvp" DEFAULT 'maybe'::"networking_event_rsvp" NOT NULL,
	"notes" text,
	"link" text,
	"outcome_contacts_made" integer,
	"outcome_follow_ups_scheduled" integer,
	"outcome_opportunities_identified" integer,
	"outcome_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "networking_event_contact" (
	"id" uuid PRIMARY KEY,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "networking_event_reminder" (
	"id" uuid PRIMARY KEY,
	"event_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "progress_milestone" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"xp_required" integer NOT NULL,
	"reward" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recent_search" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"query" text NOT NULL,
	"result_type" "search_result_type" NOT NULL,
	"result_id" text,
	"result_title" text NOT NULL,
	"result_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "unlockable_reward" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"type" "reward_type" NOT NULL,
	"required_level" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_achievement" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"achievement_id" text NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"unlocked_tiers" text[] DEFAULT '{}'::text[] NOT NULL,
	"last_unlocked_at" timestamp with time zone,
	"is_new" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievement_user_id_achievement_id_unique" UNIQUE("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activity" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"type" "user_activity_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"entity_id" text,
	"entity_type" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_gamification_profile" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_login_date" date,
	"show_on_leaderboard" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_milestone" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"milestone_id" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_milestone_user_id_milestone_id_unique" UNIQUE("user_id","milestone_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_reward" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"reward_id" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_reward_user_id_reward_id_unique" UNIQUE("user_id","reward_id")
);
--> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "achievement_definition_category_index" ON "achievement_definition" ("category"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "achievement_notification_user_id_index" ON "achievement_notification" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "achievement_notification_user_id_is_read_index" ON "achievement_notification" ("user_id","is_read"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "achievement_notification_user_id_created_at_index" ON "achievement_notification" ("user_id","created_at" DESC NULLS LAST); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "achievement_notification_preferences_user_id_index" ON "achievement_notification_preferences" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "challenge_user_id_index" ON "challenge" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "challenge_user_id_expires_at_index" ON "challenge" ("user_id","expires_at"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "challenge_user_id_type_index" ON "challenge" ("user_id","type"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_difficulty_config_is_active_index" ON "mock_ai_difficulty_config" ("is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_feedback_template_category_index" ON "mock_ai_feedback_template" ("category"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_feedback_template_is_active_index" ON "mock_ai_feedback_template" ("is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_feedback_template_min_score_max_score_index" ON "mock_ai_feedback_template" ("min_score","max_score"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_field_config_is_active_index" ON "mock_ai_field_config" ("is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_interview_tip_is_active_index" ON "mock_ai_interview_tip" ("is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_interview_tip_order_index" ON "mock_ai_interview_tip" ("order"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_program_field_index" ON "mock_ai_program" ("field"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_program_field_is_active_index" ON "mock_ai_program" ("field","is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS "mock_ai_program_field_program_id_index" ON "mock_ai_program" ("field","program_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_question_field_program_difficulty_index" ON "mock_ai_question" ("field","program","difficulty"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_question_field_program_difficulty_is_active_index" ON "mock_ai_question" ("field","program","difficulty","is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "mock_ai_question_is_active_index" ON "mock_ai_question" ("is_active"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_user_id_index" ON "networking_event" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_user_id_date_index" ON "networking_event" ("user_id","date"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_user_id_type_index" ON "networking_event" ("user_id","type"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_user_id_rsvp_status_index" ON "networking_event" ("user_id","rsvp_status"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_contact_event_id_index" ON "networking_event_contact" ("event_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_reminder_event_id_index" ON "networking_event_reminder" ("event_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_reminder_event_id_completed_index" ON "networking_event_reminder" ("event_id","completed"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "networking_event_reminder_due_date_index" ON "networking_event_reminder" ("due_date"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "progress_milestone_xp_required_index" ON "progress_milestone" ("xp_required"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "recent_search_user_id_index" ON "recent_search" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "recent_search_user_id_created_at_index" ON "recent_search" ("user_id","created_at" DESC NULLS LAST); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "recent_search_user_id_result_type_index" ON "recent_search" ("user_id","result_type"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "unlockable_reward_required_level_index" ON "unlockable_reward" ("required_level"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_achievement_user_id_index" ON "user_achievement" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_achievement_user_id_last_unlocked_at_index" ON "user_achievement" ("user_id","last_unlocked_at" DESC NULLS LAST); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_activity_user_id_index" ON "user_activity" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_activity_user_id_created_at_index" ON "user_activity" ("user_id","created_at" DESC NULLS LAST); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_activity_user_id_type_index" ON "user_activity" ("user_id","type"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_gamification_profile_user_id_index" ON "user_gamification_profile" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_gamification_profile_total_xp_index" ON "user_gamification_profile" ("total_xp" DESC NULLS LAST); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_milestone_user_id_index" ON "user_milestone" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$; --> statement-breakpoint
DO $$ BEGIN CREATE INDEX IF NOT EXISTS "user_reward_user_id_index" ON "user_reward" ("user_id"); EXCEPTION WHEN duplicate_table THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "achievement_notification" ADD CONSTRAINT "achievement_notification_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "achievement_notification_preferences" ADD CONSTRAINT "achievement_notification_preferences_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "challenge" ADD CONSTRAINT "challenge_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "networking_event" ADD CONSTRAINT "networking_event_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "networking_event_contact" ADD CONSTRAINT "networking_event_contact_event_id_networking_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "networking_event"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "networking_event_reminder" ADD CONSTRAINT "networking_event_reminder_event_id_networking_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "networking_event"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "recent_search" ADD CONSTRAINT "recent_search_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievement_id_achievement_definition_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievement_definition"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_gamification_profile" ADD CONSTRAINT "user_gamification_profile_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_milestone" ADD CONSTRAINT "user_milestone_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_milestone" ADD CONSTRAINT "user_milestone_milestone_id_progress_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "progress_milestone"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_reward" ADD CONSTRAINT "user_reward_reward_id_unlockable_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "unlockable_reward"("id") ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;