-- Voice Interview Panel System Migration
-- Created: 2026-02-08

-- Create enums for voice interview
DO $$ BEGIN
    CREATE TYPE "voice_interview_type" AS ENUM('single', 'panel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "voice_interview_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "voice_interview_difficulty" AS ENUM('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "voice_interview_language" AS ENUM('fr', 'en', 'ar', 'darija');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "interviewer_personality" AS ENUM('friendly', 'serious', 'challenging', 'supportive', 'analytical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "interviewer_speaking_style" AS ENUM('formal', 'casual', 'technical', 'conversational');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create voice_interview_session table
CREATE TABLE IF NOT EXISTS "voice_interview_session" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "type" "voice_interview_type" NOT NULL DEFAULT 'single',
    "target_role" text,
    "target_company" text,
    "difficulty" "voice_interview_difficulty" DEFAULT 'medium',
    "language" "voice_interview_language" DEFAULT 'fr',
    "panel_size" integer DEFAULT 1,
    "status" "voice_interview_status" DEFAULT 'pending',
    "duration" integer,
    "overall_score" integer,
    "transcript" jsonb DEFAULT '[]'::jsonb,
    "feedback" jsonb,
    "recording_url" text,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create interviewer_persona table
CREATE TABLE IF NOT EXISTS "interviewer_persona" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "name_fr" text,
    "role" text NOT NULL,
    "role_fr" text,
    "personality" "interviewer_personality" NOT NULL DEFAULT 'friendly',
    "voice_id" text NOT NULL,
    "avatar" text,
    "speaking_style" "interviewer_speaking_style" DEFAULT 'formal',
    "focus_areas" text[] DEFAULT '{}',
    "sample_questions" jsonb DEFAULT '[]'::jsonb,
    "system_prompt" text,
    "bio" text,
    "bio_fr" text,
    "years_experience" integer,
    "industry" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create voice_interview_panelist table
CREATE TABLE IF NOT EXISTS "voice_interview_panelist" (
    "id" text PRIMARY KEY NOT NULL,
    "session_id" text NOT NULL REFERENCES "voice_interview_session"("id") ON DELETE CASCADE,
    "persona_id" text NOT NULL REFERENCES "interviewer_persona"("id") ON DELETE RESTRICT,
    "is_lead" boolean NOT NULL DEFAULT false,
    "questions_asked" integer NOT NULL DEFAULT 0,
    "speaking_time" integer NOT NULL DEFAULT 0,
    "score" integer,
    "notes" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE("session_id", "persona_id")
);

-- Create indexes for voice_interview_session
CREATE INDEX IF NOT EXISTS "voice_interview_session_user_id_idx" ON "voice_interview_session" ("user_id");
CREATE INDEX IF NOT EXISTS "voice_interview_session_user_status_idx" ON "voice_interview_session" ("user_id", "status");
CREATE INDEX IF NOT EXISTS "voice_interview_session_user_type_idx" ON "voice_interview_session" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "voice_interview_session_user_created_idx" ON "voice_interview_session" ("user_id", "created_at" DESC);

-- Create indexes for interviewer_persona
CREATE INDEX IF NOT EXISTS "interviewer_persona_is_active_idx" ON "interviewer_persona" ("is_active");
CREATE INDEX IF NOT EXISTS "interviewer_persona_personality_idx" ON "interviewer_persona" ("personality");
CREATE INDEX IF NOT EXISTS "interviewer_persona_role_idx" ON "interviewer_persona" ("role");

-- Create indexes for voice_interview_panelist
CREATE INDEX IF NOT EXISTS "voice_interview_panelist_session_idx" ON "voice_interview_panelist" ("session_id");
CREATE INDEX IF NOT EXISTS "voice_interview_panelist_persona_idx" ON "voice_interview_panelist" ("persona_id");
