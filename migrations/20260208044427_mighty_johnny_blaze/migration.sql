CREATE TYPE "ai_mentor_message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "ai_mentor_personality" AS ENUM('supportive', 'challenging', 'balanced', 'motivational', 'analytical');--> statement-breakpoint
CREATE TYPE "ai_mentor_session_type" AS ENUM('daily_pulse', 'weekly_review', 'monthly_strategy', 'skill_coaching', 'interview_prep', 'goal_setting', 'career_planning', 'on_demand');--> statement-breakpoint
CREATE TYPE "ai_mentor_specialization" AS ENUM('healthcare', 'industrial', 'hse', 'interview', 'career_strategy', 'skills_development', 'job_search', 'networking', 'general');--> statement-breakpoint
CREATE TYPE "ai_mentor_style" AS ENUM('formal', 'casual', 'professional', 'friendly');--> statement-breakpoint
CREATE TYPE "job_listing_status" AS ENUM('active', 'expired', 'filled', 'draft');--> statement-breakpoint
CREATE TYPE "quiz_category" AS ENUM('personality', 'interests', 'skills', 'work_preferences', 'values', 'moroccan_market', 'environment', 'stress', 'work_style', 'goals');--> statement-breakpoint
CREATE TYPE "quiz_question_type" AS ENUM('multiple_choice', 'scale', 'ranking');--> statement-breakpoint
CREATE TABLE "ai_mentor_conversation" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"mentor_id" uuid NOT NULL,
	"title" text,
	"topic" text,
	"messages" jsonb NOT NULL,
	"context" jsonb,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_mentor_session" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"mentor_id" uuid NOT NULL,
	"conversation_id" uuid,
	"session_type" "ai_mentor_session_type" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"duration" integer,
	"topics" jsonb,
	"outcomes" jsonb,
	"action_items" jsonb,
	"rating" integer,
	"feedback" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"recurrence_pattern" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_mentor_template" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"name_fr" text NOT NULL,
	"avatar" text,
	"title" text NOT NULL,
	"title_fr" text NOT NULL,
	"specialization" "ai_mentor_specialization" NOT NULL,
	"personality" "ai_mentor_personality" DEFAULT 'balanced'::"ai_mentor_personality" NOT NULL,
	"style" "ai_mentor_style" DEFAULT 'professional'::"ai_mentor_style" NOT NULL,
	"description" text NOT NULL,
	"description_fr" text NOT NULL,
	"expertise" jsonb NOT NULL,
	"languages" jsonb NOT NULL,
	"system_prompt" text NOT NULL,
	"welcome_message" text NOT NULL,
	"welcome_message_fr" text NOT NULL,
	"sample_questions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employer_database" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"name_fr" text,
	"logo" text,
	"website" text,
	"linkedin_url" text,
	"industry" text NOT NULL,
	"industry_fr" text,
	"size" text,
	"employee_count" text,
	"headquarters" text,
	"locations" jsonb,
	"founded" integer,
	"description" text,
	"description_fr" text,
	"culture" jsonb,
	"fields" jsonb,
	"open_positions" integer DEFAULT 0 NOT NULL,
	"average_salary" integer,
	"rating" real,
	"review_count" integer DEFAULT 0 NOT NULL,
	"hiring_trend" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listing" (
	"id" uuid PRIMARY KEY,
	"external_id" text,
	"source" text NOT NULL,
	"title" text NOT NULL,
	"title_fr" text,
	"company" text NOT NULL,
	"company_logo" text,
	"location" text NOT NULL,
	"region" text,
	"job_type" text,
	"experience_level" text,
	"field" text,
	"description" text,
	"requirements" jsonb,
	"skills" jsonb,
	"salary_min" integer,
	"salary_max" integer,
	"salary_period" text DEFAULT 'monthly',
	"benefits" jsonb,
	"application_url" text,
	"contact_email" text,
	"posted_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"status" "job_listing_status" DEFAULT 'active'::"job_listing_status" NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"application_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_salary_data" (
	"id" uuid PRIMARY KEY,
	"role" text NOT NULL,
	"role_fr" text NOT NULL,
	"field" text NOT NULL,
	"region" text,
	"experience_level" text NOT NULL,
	"salary_min" integer NOT NULL,
	"salary_median" integer NOT NULL,
	"salary_max" integer NOT NULL,
	"sample_size" integer,
	"last_updated" timestamp with time zone,
	"growth_rate" real,
	"demand_score" integer,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_question" (
	"id" uuid PRIMARY KEY,
	"quiz_type" text NOT NULL,
	"question" text NOT NULL,
	"question_fr" text NOT NULL,
	"description" text,
	"description_fr" text,
	"category" "quiz_category" NOT NULL,
	"question_type" "quiz_question_type" DEFAULT 'multiple_choice'::"quiz_question_type" NOT NULL,
	"options" jsonb NOT NULL,
	"trait" text,
	"field" text,
	"weight" real DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regional_job_stats" (
	"id" uuid PRIMARY KEY,
	"region" text NOT NULL UNIQUE,
	"region_fr" text NOT NULL,
	"total_jobs" integer DEFAULT 0 NOT NULL,
	"job_growth" real,
	"average_salary" integer,
	"top_industries" jsonb,
	"top_employers" jsonb,
	"skills_in_demand" jsonb,
	"unemployment_rate" real,
	"cost_of_living" text,
	"quality_of_life" integer,
	"last_updated" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_demand" (
	"id" uuid PRIMARY KEY,
	"skill" text NOT NULL,
	"skill_fr" text NOT NULL,
	"field" text,
	"category" text NOT NULL,
	"demand_score" integer NOT NULL,
	"growth_trend" text NOT NULL,
	"growth_percent" real,
	"job_count" integer,
	"average_salary_boost" integer,
	"competition_level" text,
	"time_to_learn" text,
	"resources" jsonb,
	"related_skills" jsonb,
	"last_updated" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_ai_mentor" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"is_custom" boolean DEFAULT false NOT NULL,
	"custom_name" text,
	"custom_avatar" text,
	"custom_personality" "ai_mentor_personality",
	"custom_style" "ai_mentor_style",
	"custom_specializations" jsonb,
	"custom_languages" jsonb,
	"custom_system_prompt" text,
	"custom_focus_areas" jsonb,
	"session_frequency" text DEFAULT 'on_demand',
	"preferred_time" text,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"total_conversations" integer DEFAULT 0 NOT NULL,
	"total_messages" integer DEFAULT 0 NOT NULL,
	"last_interaction" timestamp with time zone,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_mentor_onboarding" (
	"id" uuid PRIMARY KEY,
	"user_id" uuid NOT NULL UNIQUE,
	"field" text,
	"current_level" text,
	"biggest_challenge" text,
	"learning_style" text,
	"preferred_language" text DEFAULT 'fr',
	"career_goal" text,
	"target_role" text,
	"timeline_months" integer,
	"availability_hours" integer,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ai_mentor_conversation_user_id_index" ON "ai_mentor_conversation" ("user_id");--> statement-breakpoint
CREATE INDEX "ai_mentor_conversation_mentor_id_index" ON "ai_mentor_conversation" ("mentor_id");--> statement-breakpoint
CREATE INDEX "ai_mentor_conversation_user_id_created_at_index" ON "ai_mentor_conversation" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_mentor_conversation_is_archived_index" ON "ai_mentor_conversation" ("is_archived");--> statement-breakpoint
CREATE INDEX "ai_mentor_session_user_id_index" ON "ai_mentor_session" ("user_id");--> statement-breakpoint
CREATE INDEX "ai_mentor_session_mentor_id_index" ON "ai_mentor_session" ("mentor_id");--> statement-breakpoint
CREATE INDEX "ai_mentor_session_scheduled_at_index" ON "ai_mentor_session" ("scheduled_at");--> statement-breakpoint
CREATE INDEX "ai_mentor_session_status_index" ON "ai_mentor_session" ("status");--> statement-breakpoint
CREATE INDEX "ai_mentor_template_specialization_index" ON "ai_mentor_template" ("specialization");--> statement-breakpoint
CREATE INDEX "ai_mentor_template_is_active_index" ON "ai_mentor_template" ("is_active");--> statement-breakpoint
CREATE INDEX "employer_database_industry_index" ON "employer_database" ("industry");--> statement-breakpoint
CREATE INDEX "employer_database_headquarters_index" ON "employer_database" ("headquarters");--> statement-breakpoint
CREATE INDEX "employer_database_rating_index" ON "employer_database" ("rating");--> statement-breakpoint
CREATE INDEX "employer_database_is_active_index" ON "employer_database" ("is_active");--> statement-breakpoint
CREATE INDEX "job_listing_source_index" ON "job_listing" ("source");--> statement-breakpoint
CREATE INDEX "job_listing_location_index" ON "job_listing" ("location");--> statement-breakpoint
CREATE INDEX "job_listing_region_index" ON "job_listing" ("region");--> statement-breakpoint
CREATE INDEX "job_listing_field_index" ON "job_listing" ("field");--> statement-breakpoint
CREATE INDEX "job_listing_experience_level_index" ON "job_listing" ("experience_level");--> statement-breakpoint
CREATE INDEX "job_listing_status_index" ON "job_listing" ("status");--> statement-breakpoint
CREATE INDEX "job_listing_posted_at_index" ON "job_listing" ("posted_at");--> statement-breakpoint
CREATE INDEX "market_salary_data_field_index" ON "market_salary_data" ("field");--> statement-breakpoint
CREATE INDEX "market_salary_data_region_index" ON "market_salary_data" ("region");--> statement-breakpoint
CREATE INDEX "market_salary_data_experience_level_index" ON "market_salary_data" ("experience_level");--> statement-breakpoint
CREATE UNIQUE INDEX "market_salary_data_role_region_experience_level_index" ON "market_salary_data" ("role","region","experience_level");--> statement-breakpoint
CREATE INDEX "quiz_question_quiz_type_index" ON "quiz_question" ("quiz_type");--> statement-breakpoint
CREATE INDEX "quiz_question_category_index" ON "quiz_question" ("category");--> statement-breakpoint
CREATE INDEX "quiz_question_is_active_index" ON "quiz_question" ("is_active");--> statement-breakpoint
CREATE INDEX "regional_job_stats_region_index" ON "regional_job_stats" ("region");--> statement-breakpoint
CREATE INDEX "skill_demand_field_index" ON "skill_demand" ("field");--> statement-breakpoint
CREATE INDEX "skill_demand_category_index" ON "skill_demand" ("category");--> statement-breakpoint
CREATE INDEX "skill_demand_demand_score_index" ON "skill_demand" ("demand_score");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_demand_skill_field_index" ON "skill_demand" ("skill","field");--> statement-breakpoint
CREATE INDEX "user_ai_mentor_user_id_index" ON "user_ai_mentor" ("user_id");--> statement-breakpoint
CREATE INDEX "user_ai_mentor_template_id_index" ON "user_ai_mentor" ("template_id");--> statement-breakpoint
CREATE INDEX "user_ai_mentor_user_id_is_primary_index" ON "user_ai_mentor" ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX "user_mentor_onboarding_user_id_index" ON "user_mentor_onboarding" ("user_id");--> statement-breakpoint
ALTER TABLE "ai_mentor_conversation" ADD CONSTRAINT "ai_mentor_conversation_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_mentor_conversation" ADD CONSTRAINT "ai_mentor_conversation_mentor_id_user_ai_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "user_ai_mentor"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_mentor_session" ADD CONSTRAINT "ai_mentor_session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_mentor_session" ADD CONSTRAINT "ai_mentor_session_mentor_id_user_ai_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "user_ai_mentor"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_mentor_session" ADD CONSTRAINT "ai_mentor_session_oEYARVuBY6E8_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_mentor_conversation"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_ai_mentor" ADD CONSTRAINT "user_ai_mentor_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_ai_mentor" ADD CONSTRAINT "user_ai_mentor_template_id_ai_mentor_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "ai_mentor_template"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "user_mentor_onboarding" ADD CONSTRAINT "user_mentor_onboarding_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;