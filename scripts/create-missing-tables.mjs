// create-missing-tables.mjs
// Creates 63 missing PostgreSQL tables for the IMTA Resume Builder
// Run: node scripts/create-missing-tables.mjs

import pg from "pg";
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

// ============================================================================
// ENUM DEFINITIONS (idempotent - only creates if not exists)
// ============================================================================
const ENUM_SQL = `
-- Job listing status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_listing_status') THEN CREATE TYPE job_listing_status AS ENUM ('active', 'expired', 'filled', 'draft'); END IF; END $$;

-- Quiz question type (separate from existing question_type)
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_question_type') THEN CREATE TYPE quiz_question_type AS ENUM ('multiple_choice', 'scale', 'ranking'); END IF; END $$;

-- Quiz category
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quiz_category') THEN CREATE TYPE quiz_category AS ENUM ('personality', 'interests', 'skills', 'work_preferences', 'values', 'moroccan_market', 'environment', 'stress', 'work_style', 'goals'); END IF; END $$;

-- Partner enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status') THEN CREATE TYPE partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type') THEN CREATE TYPE partner_type AS ENUM ('employer', 'recruiter', 'training_center', 'government', 'ngo'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_job_status') THEN CREATE TYPE partner_job_status AS ENUM ('draft', 'pending_review', 'published', 'expired', 'closed', 'rejected'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_event_status') THEN CREATE TYPE partner_event_status AS ENUM ('draft', 'pending_review', 'published', 'cancelled', 'completed', 'rejected'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_event_type') THEN CREATE TYPE partner_event_type AS ENUM ('job_fair', 'workshop', 'webinar', 'networking', 'training', 'open_day', 'recruitment', 'conference', 'other'); END IF; END $$;

-- Interview goal enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_goal_prep_status') THEN CREATE TYPE interview_goal_prep_status AS ENUM ('not_started', 'preparing', 'practicing', 'ready', 'completed'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_goal_outcome') THEN CREATE TYPE interview_goal_outcome AS ENUM ('offered', 'rejected', 'pending', 'withdrawn'); END IF; END $$;

-- Job recommendation status
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_recommendation_status') THEN CREATE TYPE job_recommendation_status AS ENUM ('new', 'viewed', 'applied', 'saved', 'dismissed'); END IF; END $$;

-- Coaching enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coaching_session_status') THEN CREATE TYPE coaching_session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coaching_topic') THEN CREATE TYPE coaching_topic AS ENUM ('resume_review', 'interview_prep', 'career_transition', 'skill_development', 'networking', 'negotiation', 'leadership', 'work_life_balance', 'job_search', 'personal_branding'); END IF; END $$;

-- Confidence/weekly goal enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confidence_level') THEN CREATE TYPE confidence_level AS ENUM ('very_low', 'low', 'moderate', 'high', 'very_high'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weekly_goal_category') THEN CREATE TYPE weekly_goal_category AS ENUM ('applications', 'networking', 'skills', 'interview_prep', 'personal_branding', 'research', 'other'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weekly_goal_status') THEN CREATE TYPE weekly_goal_status AS ENUM ('pending', 'in_progress', 'completed', 'missed'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'confidence_entry_type') THEN CREATE TYPE confidence_entry_type AS ENUM ('win', 'challenge', 'learning', 'affirmation', 'reflection'); END IF; END $$;

-- Progress/badge enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_activity_action') THEN CREATE TYPE progress_activity_action AS ENUM ('lesson_started', 'lesson_completed', 'quiz_taken', 'skill_practiced', 'resume_edited', 'interview_practiced', 'goal_set', 'goal_achieved', 'badge_earned', 'module_completed', 'resource_viewed', 'feedback_received', 'peer_review_given', 'mentor_session', 'certification_earned'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'badge_type') THEN CREATE TYPE badge_type AS ENUM ('first_resume', 'resume_master', 'interview_ready', 'interview_champion', 'skill_seeker', 'skill_expert', 'consistency_streak', 'early_bird', 'night_owl', 'fast_learner', 'perfectionist', 'team_player', 'mentor_helper', 'goal_crusher', 'certificate_collector'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_level') THEN CREATE TYPE skill_level AS ENUM ('beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert'); END IF; END $$;

-- Interview weakness/improvement enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weakness_type') THEN CREATE TYPE weakness_type AS ENUM ('communication', 'technical', 'behavioral', 'confidence', 'structure', 'time_management', 'stress_handling', 'knowledge_gap'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'weakness_severity') THEN CREATE TYPE weakness_severity AS ENUM ('critical', 'major', 'minor'); END IF; END $$;

-- Mock interview template enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'template_industry') THEN CREATE TYPE template_industry AS ENUM ('healthcare', 'industrial', 'hse', 'general', 'technology', 'finance', 'retail', 'hospitality'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'template_difficulty') THEN CREATE TYPE template_difficulty AS ENUM ('entry_level', 'mid_level', 'senior_level'); END IF; END $$;

-- AI feedback enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_feedback_rating') THEN CREATE TYPE ai_feedback_rating AS ENUM ('positive', 'negative', 'neutral'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_content_feature') THEN CREATE TYPE ai_content_feature AS ENUM ('improve_content', 'generate_summary', 'fix_grammar', 'suggest_skills', 'generate_headline', 'analyze_resume', 'interview_questions', 'interview_evaluation', 'interview_chat', 'cover_letter', 'linkedin_summary', 'bullet_point', 'achievement', 'skill_extraction'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'training_sample_tier') THEN CREATE TYPE training_sample_tier AS ENUM ('gold', 'silver', 'bronze', 'rejected'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quality_dimension') THEN CREATE TYPE quality_dimension AS ENUM ('relevance', 'accuracy', 'fluency', 'tone', 'helpfulness', 'formatting', 'completeness'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'model_comparison_status') THEN CREATE TYPE model_comparison_status AS ENUM ('pending', 'in_progress', 'completed', 'failed'); END IF; END $$;

-- Career prediction
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'career_prediction_status') THEN CREATE TYPE career_prediction_status AS ENUM ('pending', 'processing', 'completed', 'failed'); END IF; END $$;

-- Adaptive learning enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_style') THEN CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading_writing', 'kinesthetic', 'mixed'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_pace') THEN CREATE TYPE learning_pace AS ENUM ('slow', 'moderate', 'fast', 'self_paced'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'skill_assessment_level') THEN CREATE TYPE skill_assessment_level AS ENUM ('novice', 'beginner', 'intermediate', 'advanced', 'expert'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'adaptive_learning_path_status') THEN CREATE TYPE adaptive_learning_path_status AS ENUM ('not_started', 'in_progress', 'paused', 'completed', 'abandoned'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_milestone_status') THEN CREATE TYPE learning_milestone_status AS ENUM ('locked', 'unlocked', 'in_progress', 'completed', 'skipped'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_recommendation_type') THEN CREATE TYPE learning_recommendation_type AS ENUM ('next_skill', 'review_topic', 'practice_exercise', 'take_assessment', 'adjust_pace', 'try_resource', 'milestone_goal'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_recommendation_priority') THEN CREATE TYPE learning_recommendation_priority AS ENUM ('low', 'medium', 'high', 'critical'); END IF; END $$;

-- AI performance enums
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_error_severity') THEN CREATE TYPE ai_error_severity AS ENUM ('low', 'medium', 'high', 'critical'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_error_category') THEN CREATE TYPE ai_error_category AS ENUM ('rate_limit', 'timeout', 'invalid_request', 'authentication', 'model_error', 'content_filter', 'quota_exceeded', 'network_error', 'parsing_error', 'unknown'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_alert_status') THEN CREATE TYPE ai_alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'ignored'); END IF; END $$;

-- Learning recommendation system enums (already created above: learning_resource_type, learning_difficulty exist)
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_cost_type') THEN CREATE TYPE learning_cost_type AS ENUM ('free', 'paid', 'subscription', 'freemium'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'completion_status') THEN CREATE TYPE completion_status AS ENUM ('not_started', 'in_progress', 'completed', 'paused', 'dropped'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_reason') THEN CREATE TYPE recommendation_reason AS ENUM ('skill_gap', 'career_goal', 'trending', 'peer_popularity', 'mentor_suggested', 'completion_pattern', 'personalized_ai', 'curated', 'new_release'); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recommendation_feedback_type') THEN CREATE TYPE recommendation_feedback_type AS ENUM ('helpful', 'not_helpful', 'too_easy', 'too_hard', 'not_relevant', 'already_know', 'will_try_later', 'enrolled', 'completed', 'dismissed'); END IF; END $$;
`;

// ============================================================================
// TABLE DEFINITIONS (63 tables)
// ============================================================================
// For FKs referencing tables in THIS list (missing tables), we skip the FK
// constraint and create the column as base type only.
// For FKs referencing existing tables (user, resume, etc.), we include the FK.
// ============================================================================

const TABLE_SQL = `
-- ============================================================================
-- 1. ai_global_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_global_settings (
  id TEXT PRIMARY KEY,
  max_requests_per_user_per_day INTEGER NOT NULL DEFAULT 50,
  max_requests_per_user_per_month INTEGER NOT NULL DEFAULT 500,
  max_tokens_per_request INTEGER NOT NULL DEFAULT 4096,
  max_concurrent_requests INTEGER NOT NULL DEFAULT 5,
  rate_limit_window_seconds INTEGER NOT NULL DEFAULT 60,
  rate_limit_max_requests INTEGER NOT NULL DEFAULT 10,
  enable_content_filtering BOOLEAN NOT NULL DEFAULT true,
  enable_usage_tracking BOOLEAN NOT NULL DEFAULT true,
  enable_cost_tracking BOOLEAN NOT NULL DEFAULT true,
  default_temperature REAL NOT NULL DEFAULT 0.7,
  default_max_tokens INTEGER NOT NULL DEFAULT 2048,
  supported_languages TEXT[] NOT NULL DEFAULT '{en,fr,ar}',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. job_listing
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_listing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'manual',
  external_id TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'MAD',
  employment_type TEXT DEFAULT 'full_time',
  experience_level TEXT,
  field TEXT,
  skills TEXT[] DEFAULT '{}',
  url TEXT,
  status job_listing_status NOT NULL DEFAULT 'active',
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_listing_status ON job_listing(status);
CREATE INDEX IF NOT EXISTS idx_job_listing_field ON job_listing(field);
CREATE INDEX IF NOT EXISTS idx_job_listing_company ON job_listing(company);
CREATE INDEX IF NOT EXISTS idx_job_listing_posted ON job_listing(posted_at DESC);

-- ============================================================================
-- 3. quiz_question
-- ============================================================================
CREATE TABLE IF NOT EXISTS quiz_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_type TEXT NOT NULL,
  category quiz_category,
  question_type quiz_question_type NOT NULL DEFAULT 'multiple_choice',
  question TEXT NOT NULL,
  question_fr TEXT,
  description TEXT,
  description_fr TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT,
  weight REAL NOT NULL DEFAULT 1.0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_question_quiz_type ON quiz_question(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_question_category ON quiz_question(category);
CREATE INDEX IF NOT EXISTS idx_quiz_question_active ON quiz_question(is_active);

-- ============================================================================
-- 4. partner_profile
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_name_fr TEXT,
  company_description TEXT,
  company_description_fr TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  city TEXT,
  country TEXT DEFAULT 'Morocco',
  partner_type partner_type NOT NULL DEFAULT 'employer',
  status partner_status NOT NULL DEFAULT 'pending',
  contact_email TEXT,
  contact_phone TEXT,
  contact_person TEXT,
  employee_count TEXT,
  founded_year INTEGER,
  social_links JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_profile_user ON partner_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_profile_status ON partner_profile(status);
CREATE INDEX IF NOT EXISTS idx_partner_profile_type ON partner_profile(partner_type);

-- ============================================================================
-- 5. partner_job_posting
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_job_posting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT NOT NULL,
  description_fr TEXT,
  requirements TEXT,
  requirements_fr TEXT,
  location TEXT,
  city TEXT,
  employment_type TEXT DEFAULT 'full_time',
  experience_level TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'MAD',
  field TEXT,
  skills TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  application_url TEXT,
  application_email TEXT,
  status partner_job_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  views_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_job_posting_partner ON partner_job_posting(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_job_posting_status ON partner_job_posting(status);
CREATE INDEX IF NOT EXISTS idx_partner_job_posting_field ON partner_job_posting(field);
CREATE INDEX IF NOT EXISTS idx_partner_job_posting_published ON partner_job_posting(published_at DESC);

-- ============================================================================
-- 6. partner_job_application
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_job_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  match_score INTEGER,
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_job_app_job ON partner_job_application(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_partner_job_app_user ON partner_job_application(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_job_app_status ON partner_job_application(status);

-- ============================================================================
-- 7. partner_event
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT NOT NULL,
  description_fr TEXT,
  event_type partner_event_type NOT NULL DEFAULT 'other',
  status partner_event_status NOT NULL DEFAULT 'draft',
  location TEXT,
  city TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  virtual_link TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  max_attendees INTEGER,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  speakers JSONB DEFAULT '[]',
  agenda JSONB DEFAULT '[]',
  target_fields TEXT[] DEFAULT '{}',
  target_levels TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_partner_event_partner ON partner_event(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_event_status ON partner_event(status);
CREATE INDEX IF NOT EXISTS idx_partner_event_type ON partner_event(event_type);
CREATE INDEX IF NOT EXISTS idx_partner_event_start ON partner_event(start_date);

-- ============================================================================
-- 8. partner_event_registration
-- ============================================================================
CREATE TABLE IF NOT EXISTS partner_event_registration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered',
  attended BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  rating INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_event_reg_unique ON partner_event_registration(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_partner_event_reg_event ON partner_event_registration(event_id);
CREATE INDEX IF NOT EXISTS idx_partner_event_reg_user ON partner_event_registration(user_id);

-- ============================================================================
-- 9. saved_job
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_posting_id UUID NOT NULL,
  notes TEXT,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_job_unique ON saved_job(user_id, job_posting_id);
CREATE INDEX IF NOT EXISTS idx_saved_job_user ON saved_job(user_id);

-- ============================================================================
-- 10. interview_checklist_reference
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_checklist_reference (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  tip TEXT,
  tip_fr TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_checklist_ref_cat ON interview_checklist_reference(category);
CREATE INDEX IF NOT EXISTS idx_interview_checklist_ref_active ON interview_checklist_reference(is_active);

-- ============================================================================
-- 11. mentor_message
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_message (
  id TEXT PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  session_id UUID REFERENCES mentorship_session(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  message_type TEXT NOT NULL DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentor_message_sender ON mentor_message(sender_id);
CREATE INDEX IF NOT EXISTS idx_mentor_message_receiver ON mentor_message(receiver_id);
CREATE INDEX IF NOT EXISTS idx_mentor_message_session ON mentor_message(session_id);
CREATE INDEX IF NOT EXISTS idx_mentor_message_unread ON mentor_message(receiver_id, is_read);

-- ============================================================================
-- 12. certification_library
-- ============================================================================
CREATE TABLE IF NOT EXISTS certification_library (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_fr TEXT,
  provider TEXT NOT NULL,
  provider_fr TEXT,
  description TEXT,
  description_fr TEXT,
  field TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'intermediate',
  url TEXT,
  duration_hours INTEGER,
  cost TEXT,
  currency TEXT DEFAULT 'MAD',
  skills TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cert_library_field ON certification_library(field);
CREATE INDEX IF NOT EXISTS idx_cert_library_level ON certification_library(level);
CREATE INDEX IF NOT EXISTS idx_cert_library_active ON certification_library(is_active);

-- ============================================================================
-- 13. branding_example
-- ============================================================================
CREATE TABLE IF NOT EXISTS branding_example (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT,
  value TEXT NOT NULL,
  value_fr TEXT,
  description TEXT,
  description_fr TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_branding_example_cat ON branding_example(category);
CREATE INDEX IF NOT EXISTS idx_branding_example_active ON branding_example(is_active);

-- ============================================================================
-- 14. interview_performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_performance (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
  overall_score INTEGER NOT NULL DEFAULT 0,
  communication_score INTEGER NOT NULL DEFAULT 0,
  technical_score INTEGER NOT NULL DEFAULT 0,
  behavioral_score INTEGER NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  structure_score INTEGER NOT NULL DEFAULT 0,
  strengths JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  ai_feedback TEXT,
  ai_feedback_fr TEXT,
  duration_minutes INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_perf_user ON interview_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_perf_session ON interview_performance(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_perf_created ON interview_performance(created_at DESC);

-- ============================================================================
-- 15. interview_goal
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_goal (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  target_company TEXT,
  target_field TEXT,
  prep_status interview_goal_prep_status NOT NULL DEFAULT 'not_started',
  outcome interview_goal_outcome,
  target_date DATE,
  interview_date DATE,
  notes TEXT,
  notes_fr TEXT,
  practice_sessions INTEGER NOT NULL DEFAULT 0,
  target_practice_sessions INTEGER NOT NULL DEFAULT 5,
  skills_to_prepare TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_goal_user ON interview_goal(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_goal_status ON interview_goal(prep_status);
CREATE INDEX IF NOT EXISTS idx_interview_goal_outcome ON interview_goal(outcome);

-- ============================================================================
-- 16. job_recommendation
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_recommendation (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_listing_id UUID,
  partner_job_posting_id UUID,
  match_score INTEGER NOT NULL DEFAULT 0,
  skill_match_score INTEGER NOT NULL DEFAULT 0,
  experience_match_score INTEGER NOT NULL DEFAULT 0,
  location_match_score INTEGER NOT NULL DEFAULT 0,
  salary_match_score INTEGER NOT NULL DEFAULT 0,
  status job_recommendation_status NOT NULL DEFAULT 'new',
  match_reasons JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_rec_user ON job_recommendation(user_id);
CREATE INDEX IF NOT EXISTS idx_job_rec_status ON job_recommendation(status);
CREATE INDEX IF NOT EXISTS idx_job_rec_score ON job_recommendation(match_score DESC);

-- ============================================================================
-- 17. user_job_preference
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_job_preference (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  preferred_fields TEXT[] DEFAULT '{}',
  preferred_locations TEXT[] DEFAULT '{}',
  preferred_employment_types TEXT[] DEFAULT '{}',
  min_salary INTEGER,
  max_salary INTEGER,
  currency TEXT DEFAULT 'MAD',
  remote_preference TEXT DEFAULT 'no_preference',
  experience_level TEXT,
  willing_to_relocate BOOLEAN DEFAULT false,
  preferred_company_sizes TEXT[] DEFAULT '{}',
  preferred_industries TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_job_pref_user ON user_job_preference(user_id);

-- ============================================================================
-- 18. skill_progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_name_fr TEXT,
  category TEXT,
  current_level INTEGER NOT NULL DEFAULT 0,
  target_level INTEGER NOT NULL DEFAULT 100,
  progress INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  practice_count INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  learning_path_id UUID,
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skill_progress_user ON skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progress_skill ON skill_progress(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_progress_user_skill ON skill_progress(user_id, skill_name);

-- ============================================================================
-- 19. coaching_session
-- ============================================================================
CREATE TABLE IF NOT EXISTS coaching_session (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  topic coaching_topic NOT NULL,
  status coaching_session_status NOT NULL DEFAULT 'scheduled',
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  ai_coach_persona TEXT DEFAULT 'professional',
  conversation JSONB DEFAULT '[]',
  summary TEXT,
  summary_fr TEXT,
  action_items TEXT[] DEFAULT '{}',
  resources TEXT[] DEFAULT '{}',
  user_rating INTEGER,
  user_feedback TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coaching_session_user ON coaching_session(user_id);
CREATE INDEX IF NOT EXISTS idx_coaching_session_topic ON coaching_session(topic);
CREATE INDEX IF NOT EXISTS idx_coaching_session_status ON coaching_session(status);
CREATE INDEX IF NOT EXISTS idx_coaching_session_scheduled ON coaching_session(scheduled_at);

-- ============================================================================
-- 20. career_path
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_path (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "current_role" TEXT,
  target_role TEXT NOT NULL,
  target_role_fr TEXT,
  field TEXT,
  description TEXT,
  description_fr TEXT,
  milestones JSONB DEFAULT '[]',
  current_milestone_index INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  estimated_months INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_path_user ON career_path(user_id);
CREATE INDEX IF NOT EXISTS idx_career_path_active ON career_path(is_active);
CREATE INDEX IF NOT EXISTS idx_career_path_field ON career_path(field);

-- ============================================================================
-- 21. skill_gap_analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_gap_analysis (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  career_path_id TEXT,
  target_role TEXT NOT NULL,
  current_skills JSONB DEFAULT '[]',
  required_skills JSONB DEFAULT '[]',
  gaps JSONB DEFAULT '[]',
  recommendations TEXT[] DEFAULT '{}',
  recommendations_fr TEXT[] DEFAULT '{}',
  gap_score INTEGER NOT NULL DEFAULT 0,
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ai_analysis TEXT,
  ai_analysis_fr TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skill_gap_user ON skill_gap_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_career ON skill_gap_analysis(career_path_id);

-- ============================================================================
-- 22. weekly_goal
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_goal (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  category weekly_goal_category NOT NULL DEFAULT 'other',
  status weekly_goal_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  target_value INTEGER NOT NULL DEFAULT 1,
  current_value INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_weekly_goal_user ON weekly_goal(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goal_week ON weekly_goal(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_goal_status ON weekly_goal(status);
CREATE INDEX IF NOT EXISTS idx_weekly_goal_user_week ON weekly_goal(user_id, week_start);

-- ============================================================================
-- 23. confidence_journal
-- ============================================================================
CREATE TABLE IF NOT EXISTS confidence_journal (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  entry_type confidence_entry_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  title_fr TEXT,
  content TEXT NOT NULL,
  content_fr TEXT,
  mood INTEGER NOT NULL DEFAULT 3,
  confidence_before confidence_level,
  confidence_after confidence_level,
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conf_journal_user ON confidence_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_conf_journal_date ON confidence_journal(date);
CREATE INDEX IF NOT EXISTS idx_conf_journal_type ON confidence_journal(entry_type);
CREATE INDEX IF NOT EXISTS idx_conf_journal_user_date ON confidence_journal(user_id, date DESC);

-- ============================================================================
-- 24. daily_affirmation
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_affirmation (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  content_fr TEXT,
  author TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_daily_affirmation_cat ON daily_affirmation(category);
CREATE INDEX IF NOT EXISTS idx_daily_affirmation_active ON daily_affirmation(is_active);

-- ============================================================================
-- 25. user_affirmation_progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_affirmation_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  affirmation_id TEXT NOT NULL,
  is_liked BOOLEAN NOT NULL DEFAULT false,
  is_saved BOOLEAN NOT NULL DEFAULT false,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reflection TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_affirm_user ON user_affirmation_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_affirm_affirm ON user_affirmation_progress(affirmation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_affirm_unique ON user_affirmation_progress(user_id, affirmation_id);

-- ============================================================================
-- 26. student_cohort (must come before student_progress, cohort_membership)
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_cohort (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  description_fr TEXT,
  cohort_type TEXT NOT NULL DEFAULT 'general',
  program TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_members INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_cohort_type ON student_cohort(cohort_type);
CREATE INDEX IF NOT EXISTS idx_student_cohort_active ON student_cohort(is_active);

-- ============================================================================
-- 27. student_progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES student_cohort(id) ON DELETE SET NULL,
  overall_progress INTEGER NOT NULL DEFAULT 0,
  resume_progress INTEGER NOT NULL DEFAULT 0,
  skills_progress INTEGER NOT NULL DEFAULT 0,
  interview_progress INTEGER NOT NULL DEFAULT 0,
  career_progress INTEGER NOT NULL DEFAULT 0,
  networking_progress INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_practice_minutes INTEGER NOT NULL DEFAULT 0,
  resumes_created INTEGER NOT NULL DEFAULT 0,
  interviews_completed INTEGER NOT NULL DEFAULT 0,
  skills_learned INTEGER NOT NULL DEFAULT 0,
  goals_achieved INTEGER NOT NULL DEFAULT 0,
  badges_earned INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_progress_user ON student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_cohort ON student_progress(cohort_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_level ON student_progress(level DESC);

-- ============================================================================
-- 28. skill_progression
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_progression (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_name_fr TEXT,
  category TEXT,
  level skill_level NOT NULL DEFAULT 'beginner',
  score INTEGER NOT NULL DEFAULT 0,
  previous_score INTEGER,
  source TEXT,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_skill_progression_user ON skill_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_progression_skill ON skill_progression(skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_progression_user_skill ON skill_progression(user_id, skill_name);
CREATE INDEX IF NOT EXISTS idx_skill_progression_created ON skill_progression(created_at DESC);

-- ============================================================================
-- 29. progress_activity_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS progress_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  action progress_activity_action NOT NULL,
  description TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  related_id TEXT,
  related_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_progress_activity_user ON progress_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_activity_action ON progress_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_progress_activity_created ON progress_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_activity_user_created ON progress_activity_log(user_id, created_at DESC);

-- ============================================================================
-- 30. achievement_badge
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievement_badge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  badge badge_type NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  name TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  description_fr TEXT,
  icon TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 100,
  target INTEGER NOT NULL DEFAULT 100,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_achievement_badge_user ON achievement_badge(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_badge_badge ON achievement_badge(badge);
CREATE INDEX IF NOT EXISTS idx_achievement_badge_earned ON achievement_badge(earned_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_achievement_badge_unique ON achievement_badge(user_id, badge, tier);

-- ============================================================================
-- 31. cohort_membership
-- ============================================================================
CREATE TABLE IF NOT EXISTS cohort_membership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES student_cohort(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cohort_membership_unique ON cohort_membership(user_id, cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_membership_user ON cohort_membership(user_id);
CREATE INDEX IF NOT EXISTS idx_cohort_membership_cohort ON cohort_membership(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_membership_active ON cohort_membership(is_active);

-- ============================================================================
-- 32. weekly_progress_snapshot
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_progress_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  overall_progress INTEGER NOT NULL DEFAULT 0,
  resume_progress INTEGER NOT NULL DEFAULT 0,
  skills_progress INTEGER NOT NULL DEFAULT 0,
  interview_progress INTEGER NOT NULL DEFAULT 0,
  career_progress INTEGER NOT NULL DEFAULT 0,
  sessions_completed INTEGER NOT NULL DEFAULT 0,
  practice_minutes INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  goals_completed INTEGER NOT NULL DEFAULT 0,
  goals_total INTEGER NOT NULL DEFAULT 0,
  streak_maintained BOOLEAN NOT NULL DEFAULT false,
  highlights JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_snapshot_unique ON weekly_progress_snapshot(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_snapshot_user ON weekly_progress_snapshot(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_snapshot_week ON weekly_progress_snapshot(week_start DESC);

-- ============================================================================
-- 33. interview_weakness
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_weakness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
  weakness_type weakness_type NOT NULL,
  severity weakness_severity NOT NULL DEFAULT 'minor',
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT NOT NULL,
  description_fr TEXT,
  examples JSONB DEFAULT '[]',
  improvement_suggestions JSONB DEFAULT '[]',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  practice_count INTEGER NOT NULL DEFAULT 0,
  last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_weakness_user ON interview_weakness(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_weakness_type ON interview_weakness(weakness_type);
CREATE INDEX IF NOT EXISTS idx_interview_weakness_severity ON interview_weakness(severity);
CREATE INDEX IF NOT EXISTS idx_interview_weakness_resolved ON interview_weakness(is_resolved);
CREATE INDEX IF NOT EXISTS idx_interview_weakness_session ON interview_weakness(session_id);

-- ============================================================================
-- 34. interview_improvement
-- ============================================================================
CREATE TABLE IF NOT EXISTS interview_improvement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  weakness_id UUID,
  session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
  score_before INTEGER NOT NULL DEFAULT 0,
  score_after INTEGER NOT NULL DEFAULT 0,
  improvement_percent INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  notes_fr TEXT,
  evidence JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_improvement_user ON interview_improvement(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_improvement_weakness ON interview_improvement(weakness_id);
CREATE INDEX IF NOT EXISTS idx_interview_improvement_session ON interview_improvement(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_improvement_created ON interview_improvement(created_at DESC);

-- ============================================================================
-- 35. mock_interview_template
-- ============================================================================
CREATE TABLE IF NOT EXISTS mock_interview_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_fr TEXT,
  description TEXT,
  description_fr TEXT,
  industry template_industry NOT NULL DEFAULT 'general',
  difficulty template_difficulty NOT NULL DEFAULT 'entry_level',
  role TEXT,
  field TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  questions JSONB NOT NULL DEFAULT '[]',
  evaluation_criteria JSONB DEFAULT '[]',
  instructions TEXT,
  instructions_fr TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  avg_score REAL,
  created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mock_template_industry ON mock_interview_template(industry);
CREATE INDEX IF NOT EXISTS idx_mock_template_difficulty ON mock_interview_template(difficulty);
CREATE INDEX IF NOT EXISTS idx_mock_template_active ON mock_interview_template(is_active);
CREATE INDEX IF NOT EXISTS idx_mock_template_public ON mock_interview_template(is_public);
CREATE INDEX IF NOT EXISTS idx_mock_template_created_by ON mock_interview_template(created_by);

-- ============================================================================
-- 36. template_usage
-- ============================================================================
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  template_id UUID,
  session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
  score INTEGER,
  duration_minutes INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_session ON template_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_created ON template_usage(created_at DESC);

-- ============================================================================
-- 37. ai_feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  feature ai_content_feature NOT NULL,
  rating ai_feedback_rating NOT NULL,
  comment TEXT,
  context JSONB DEFAULT '{}',
  input_text TEXT,
  output_text TEXT,
  model_used TEXT,
  provider_used TEXT,
  session_id TEXT,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_feature ON ai_feedback(feature);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating ON ai_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_reviewed ON ai_feedback(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created ON ai_feedback(created_at DESC);

-- ============================================================================
-- 38. ai_training_sample
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_training_sample (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID,
  feature ai_content_feature NOT NULL,
  tier training_sample_tier NOT NULL DEFAULT 'bronze',
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  improved_output TEXT,
  model_used TEXT,
  provider_used TEXT,
  quality_score REAL,
  is_validated BOOLEAN NOT NULL DEFAULT false,
  validated_by UUID,
  validated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_training_feature ON ai_training_sample(feature);
CREATE INDEX IF NOT EXISTS idx_ai_training_tier ON ai_training_sample(tier);
CREATE INDEX IF NOT EXISTS idx_ai_training_validated ON ai_training_sample(is_validated);
CREATE INDEX IF NOT EXISTS idx_ai_training_feedback ON ai_training_sample(feedback_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_created ON ai_training_sample(created_at DESC);

-- ============================================================================
-- 39. content_quality_rating
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_quality_rating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID,
  dimension quality_dimension NOT NULL,
  score INTEGER NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  comments TEXT,
  rated_by UUID,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_quality_feedback ON content_quality_rating(feedback_id);
CREATE INDEX IF NOT EXISTS idx_content_quality_dimension ON content_quality_rating(dimension);
CREATE INDEX IF NOT EXISTS idx_content_quality_score ON content_quality_rating(score);

-- ============================================================================
-- 40. model_comparison
-- ============================================================================
CREATE TABLE IF NOT EXISTS model_comparison (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature ai_content_feature NOT NULL,
  status model_comparison_status NOT NULL DEFAULT 'pending',
  input_text TEXT NOT NULL,
  input_context JSONB DEFAULT '{}',
  models_tested TEXT[] NOT NULL DEFAULT '{}',
  results JSONB DEFAULT '{}',
  winner_model TEXT,
  winner_score REAL,
  comparison_criteria JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_comparison_feature ON model_comparison(feature);
CREATE INDEX IF NOT EXISTS idx_model_comparison_status ON model_comparison(status);
CREATE INDEX IF NOT EXISTS idx_model_comparison_winner ON model_comparison(winner_model);
CREATE INDEX IF NOT EXISTS idx_model_comparison_created ON model_comparison(created_at DESC);

-- ============================================================================
-- 41. model_comparison_result
-- ============================================================================
CREATE TABLE IF NOT EXISTS model_comparison_result (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id UUID NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  output_text TEXT NOT NULL,
  latency_ms INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  overall_score INTEGER,
  dimension_scores JSONB DEFAULT '{}',
  human_rating INTEGER,
  human_feedback TEXT,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_model_comp_result_comparison ON model_comparison_result(comparison_id);
CREATE INDEX IF NOT EXISTS idx_model_comp_result_model ON model_comparison_result(model);
CREATE INDEX IF NOT EXISTS idx_model_comp_result_score ON model_comparison_result(overall_score DESC);

-- ============================================================================
-- 42. career_prediction
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_prediction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
  status career_prediction_status NOT NULL DEFAULT 'pending',
  predicted_paths JSONB DEFAULT '[]',
  current_skills JSONB DEFAULT '[]',
  market_analysis JSONB DEFAULT '{}',
  confidence_score INTEGER,
  ai_model_used TEXT,
  processing_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_prediction_user ON career_prediction(user_id);
CREATE INDEX IF NOT EXISTS idx_career_prediction_status ON career_prediction(status);
CREATE INDEX IF NOT EXISTS idx_career_prediction_resume ON career_prediction(resume_id);
CREATE INDEX IF NOT EXISTS idx_career_prediction_created ON career_prediction(created_at DESC);

-- ============================================================================
-- 43. job_match_score
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_match_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  prediction_id UUID,
  job_title TEXT NOT NULL,
  company TEXT,
  overall_score INTEGER NOT NULL DEFAULT 0,
  skill_score INTEGER NOT NULL DEFAULT 0,
  experience_score INTEGER NOT NULL DEFAULT 0,
  education_score INTEGER NOT NULL DEFAULT 0,
  culture_score INTEGER NOT NULL DEFAULT 0,
  location_score INTEGER NOT NULL DEFAULT 0,
  matching_skills JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_job_match_user ON job_match_score(user_id);
CREATE INDEX IF NOT EXISTS idx_job_match_prediction ON job_match_score(prediction_id);
CREATE INDEX IF NOT EXISTS idx_job_match_overall ON job_match_score(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_match_created ON job_match_score(created_at DESC);

-- ============================================================================
-- 44. career_trajectory
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_trajectory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  prediction_id UUID,
  trajectory_type TEXT NOT NULL DEFAULT 'linear',
  current_position TEXT,
  projected_positions JSONB DEFAULT '[]',
  growth_rate NUMERIC,
  salary_projections JSONB DEFAULT '[]',
  skill_requirements JSONB DEFAULT '[]',
  timeline_years INTEGER NOT NULL DEFAULT 5,
  confidence_score INTEGER,
  market_factors JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_career_trajectory_user ON career_trajectory(user_id);
CREATE INDEX IF NOT EXISTS idx_career_trajectory_prediction ON career_trajectory(prediction_id);
CREATE INDEX IF NOT EXISTS idx_career_trajectory_created ON career_trajectory(created_at DESC);

-- ============================================================================
-- 45. student_learning_profile
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_learning_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  learning_style learning_style NOT NULL DEFAULT 'mixed',
  learning_pace learning_pace NOT NULL DEFAULT 'moderate',
  current_level skill_assessment_level NOT NULL DEFAULT 'beginner',
  preferred_content_types TEXT[] DEFAULT '{}',
  preferred_session_duration INTEGER DEFAULT 30,
  preferred_times TEXT[] DEFAULT '{}',
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  interests TEXT[] DEFAULT '{}',
  target_skills TEXT[] DEFAULT '{}',
  completed_assessments INTEGER NOT NULL DEFAULT 0,
  total_learning_hours INTEGER NOT NULL DEFAULT 0,
  avg_assessment_score INTEGER,
  last_assessment_at TIMESTAMPTZ,
  ai_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_learning_profile_user ON student_learning_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_student_learning_profile_style ON student_learning_profile(learning_style);
CREATE INDEX IF NOT EXISTS idx_student_learning_profile_level ON student_learning_profile(current_level);

-- ============================================================================
-- 46. adaptive_learning_path
-- ============================================================================
CREATE TABLE IF NOT EXISTS adaptive_learning_path (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  profile_id UUID,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  target_skill TEXT NOT NULL,
  target_level skill_assessment_level NOT NULL DEFAULT 'intermediate',
  current_level skill_assessment_level NOT NULL DEFAULT 'beginner',
  status adaptive_learning_path_status NOT NULL DEFAULT 'not_started',
  modules JSONB NOT NULL DEFAULT '[]',
  current_module_index INTEGER NOT NULL DEFAULT 0,
  total_modules INTEGER NOT NULL DEFAULT 0,
  completed_modules INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER,
  actual_hours INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  ai_model_used TEXT,
  difficulty_adjustment REAL NOT NULL DEFAULT 1.0,
  last_adjusted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adaptive_path_user ON adaptive_learning_path(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_path_profile ON adaptive_learning_path(profile_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_path_status ON adaptive_learning_path(status);
CREATE INDEX IF NOT EXISTS idx_adaptive_path_skill ON adaptive_learning_path(target_skill);
CREATE INDEX IF NOT EXISTS idx_adaptive_path_user_status ON adaptive_learning_path(user_id, status);

-- ============================================================================
-- 47. adaptive_learning_milestone
-- ============================================================================
CREATE TABLE IF NOT EXISTS adaptive_learning_milestone (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  milestone_index INTEGER NOT NULL DEFAULT 0,
  status learning_milestone_status NOT NULL DEFAULT 'locked',
  required_score INTEGER NOT NULL DEFAULT 70,
  achieved_score INTEGER,
  skills_assessed TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  prerequisites JSONB DEFAULT '[]',
  unlock_conditions JSONB DEFAULT '{}',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adaptive_milestone_path ON adaptive_learning_milestone(path_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_milestone_user ON adaptive_learning_milestone(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_milestone_status ON adaptive_learning_milestone(status);
CREATE INDEX IF NOT EXISTS idx_adaptive_milestone_user_path ON adaptive_learning_milestone(user_id, path_id);

-- ============================================================================
-- 48. adaptive_skill_assessment
-- ============================================================================
CREATE TABLE IF NOT EXISTS adaptive_skill_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  profile_id UUID,
  path_id UUID,
  milestone_id UUID,
  skill_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_name_fr TEXT,
  category TEXT NOT NULL,
  field TEXT,
  assessment_type TEXT NOT NULL DEFAULT 'quiz',
  previous_level skill_assessment_level,
  current_level skill_assessment_level NOT NULL,
  score INTEGER NOT NULL,
  confidence_score INTEGER,
  questions_total INTEGER,
  questions_correct INTEGER,
  time_spent INTEGER,
  detailed_results JSONB,
  ai_evaluation TEXT,
  ai_suggestions JSONB,
  trend TEXT DEFAULT 'stable',
  improvement_percent REAL,
  is_valid BOOLEAN DEFAULT true,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_user ON adaptive_skill_assessment(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_user_skill ON adaptive_skill_assessment(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_profile ON adaptive_skill_assessment(profile_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_path ON adaptive_skill_assessment(path_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_milestone ON adaptive_skill_assessment(milestone_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_category ON adaptive_skill_assessment(category);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_field ON adaptive_skill_assessment(field);
CREATE INDEX IF NOT EXISTS idx_adaptive_skill_user_created ON adaptive_skill_assessment(user_id, created_at DESC);

-- ============================================================================
-- 49. adaptive_learning_recommendation
-- ============================================================================
CREATE TABLE IF NOT EXISTS adaptive_learning_recommendation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  profile_id UUID,
  path_id UUID,
  type learning_recommendation_type NOT NULL,
  priority learning_recommendation_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT NOT NULL,
  description_fr TEXT,
  target_skill_id TEXT,
  target_skill_name TEXT,
  target_topic_id TEXT,
  reason TEXT NOT NULL,
  reason_fr TEXT,
  based_on_assessment UUID,
  action_type TEXT,
  action_url TEXT,
  estimated_time INTEGER,
  difficulty TEXT DEFAULT 'medium',
  is_viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  dismiss_reason TEXT,
  ai_confidence INTEGER,
  ai_model TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user ON adaptive_learning_recommendation(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user_active ON adaptive_learning_recommendation(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user_type ON adaptive_learning_recommendation(user_id, type);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user_priority ON adaptive_learning_recommendation(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_profile ON adaptive_learning_recommendation(profile_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_path ON adaptive_learning_recommendation(path_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_assessment ON adaptive_learning_recommendation(based_on_assessment);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user_completed ON adaptive_learning_recommendation(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_adaptive_rec_user_created ON adaptive_learning_recommendation(user_id, created_at DESC);

-- ============================================================================
-- 50. ai_model_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES ai_provider_config(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  date DATE NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  avg_latency INTEGER,
  min_latency INTEGER,
  max_latency INTEGER,
  p50_latency INTEGER,
  p90_latency INTEGER,
  p99_latency INTEGER,
  total_input_tokens INTEGER NOT NULL DEFAULT 0,
  total_output_tokens INTEGER NOT NULL DEFAULT 0,
  avg_input_tokens INTEGER,
  avg_output_tokens INTEGER,
  estimated_cost INTEGER,
  cost_per_request INTEGER,
  avg_quality_score REAL,
  acceptance_rate REAL,
  success_rate REAL,
  tokens_per_second REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, model, date)
);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_provider ON ai_model_metrics(provider);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_model ON ai_model_metrics(model);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_date ON ai_model_metrics(date);
CREATE INDEX IF NOT EXISTS idx_ai_model_metrics_provider_id ON ai_model_metrics(provider_id);

-- ============================================================================
-- 51. ai_feature_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_feature_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature TEXT NOT NULL,
  date DATE NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  avg_latency INTEGER,
  p90_latency INTEGER,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  avg_tokens_per_request INTEGER,
  avg_quality_score REAL,
  acceptance_count INTEGER NOT NULL DEFAULT 0,
  rejection_count INTEGER NOT NULL DEFAULT 0,
  modification_count INTEGER NOT NULL DEFAULT 0,
  best_model TEXT,
  best_model_score REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(feature, date)
);
CREATE INDEX IF NOT EXISTS idx_ai_feature_metrics_feature ON ai_feature_metrics(feature);
CREATE INDEX IF NOT EXISTS idx_ai_feature_metrics_date ON ai_feature_metrics(date);

-- ============================================================================
-- 52. ai_latency_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_latency_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_log_id UUID REFERENCES ai_usage_log(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  total_latency INTEGER NOT NULL,
  time_to_first_token INTEGER,
  processing_time INTEGER,
  network_latency INTEGER,
  input_tokens INTEGER,
  output_tokens INTEGER,
  is_streaming BOOLEAN NOT NULL DEFAULT false,
  prompt_length INTEGER,
  response_length INTEGER,
  tokens_per_second REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_latency_user ON ai_latency_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_latency_feature ON ai_latency_log(feature);
CREATE INDEX IF NOT EXISTS idx_ai_latency_provider_model ON ai_latency_log(provider, model);
CREATE INDEX IF NOT EXISTS idx_ai_latency_created ON ai_latency_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_latency_total ON ai_latency_log(total_latency);

-- ============================================================================
-- 53. ai_error_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_log_id UUID REFERENCES ai_usage_log(id) ON DELETE CASCADE,
  user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
  feature TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  error_category ai_error_category NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity ai_error_severity NOT NULL DEFAULT 'medium',
  request_payload JSONB,
  response_payload JSONB,
  retry_count INTEGER NOT NULL DEFAULT 0,
  was_retried BOOLEAN NOT NULL DEFAULT false,
  retry_succeeded BOOLEAN,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_error_user ON ai_error_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_error_feature ON ai_error_log(feature);
CREATE INDEX IF NOT EXISTS idx_ai_error_provider_model ON ai_error_log(provider, model);
CREATE INDEX IF NOT EXISTS idx_ai_error_category ON ai_error_log(error_category);
CREATE INDEX IF NOT EXISTS idx_ai_error_severity ON ai_error_log(severity);
CREATE INDEX IF NOT EXISTS idx_ai_error_created ON ai_error_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_error_resolved ON ai_error_log(is_resolved);

-- ============================================================================
-- 54. ai_content_quality
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_content_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usage_log_id UUID REFERENCES ai_usage_log(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_hash TEXT,
  was_accepted BOOLEAN,
  was_modified BOOLEAN,
  modification_percent INTEGER,
  user_rating INTEGER,
  resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
  section_type TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  feedback_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_ai_content_quality_user ON ai_content_quality(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_quality_feature ON ai_content_quality(feature);
CREATE INDEX IF NOT EXISTS idx_ai_content_quality_provider ON ai_content_quality(provider, model);
CREATE INDEX IF NOT EXISTS idx_ai_content_quality_accepted ON ai_content_quality(was_accepted);
CREATE INDEX IF NOT EXISTS idx_ai_content_quality_generated ON ai_content_quality(generated_at DESC);

-- ============================================================================
-- 55. ai_performance_alert
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_performance_alert (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT,
  model TEXT,
  feature TEXT,
  alert_type TEXT NOT NULL,
  severity ai_error_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric TEXT NOT NULL,
  threshold REAL NOT NULL,
  current_value REAL NOT NULL,
  status ai_alert_status NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_provider ON ai_performance_alert(provider, model);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_feature ON ai_performance_alert(feature);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_type ON ai_performance_alert(alert_type);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_severity ON ai_performance_alert(severity);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_status ON ai_performance_alert(status);
CREATE INDEX IF NOT EXISTS idx_ai_perf_alert_created ON ai_performance_alert(created_at DESC);

-- ============================================================================
-- 56. cohort_analytics_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS cohort_analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES student_cohort(id) ON DELETE CASCADE,
  total_members INTEGER NOT NULL DEFAULT 0,
  avg_resume_progress INTEGER NOT NULL DEFAULT 0,
  avg_skills_score INTEGER NOT NULL DEFAULT 0,
  avg_interview_score INTEGER NOT NULL DEFAULT 0,
  placement_rate INTEGER NOT NULL DEFAULT 0,
  active_members INTEGER NOT NULL DEFAULT 0,
  completed_training INTEGER NOT NULL DEFAULT 0,
  at_risk_count INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cohort_metrics_cohort ON cohort_analytics_metrics(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_metrics_cohort_recorded ON cohort_analytics_metrics(cohort_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_cohort_metrics_recorded ON cohort_analytics_metrics(recorded_at DESC);

-- ============================================================================
-- 57. cohort_analytics_benchmark
-- ============================================================================
CREATE TABLE IF NOT EXISTS cohort_analytics_benchmark (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES student_cohort(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_placement_rate INTEGER,
  target_skills_score INTEGER,
  target_interview_score INTEGER,
  target_completion_rate INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cohort_benchmark_cohort ON cohort_analytics_benchmark(cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohort_benchmark_active ON cohort_analytics_benchmark(cohort_id, is_active);

-- ============================================================================
-- 58. resource_completion
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_completion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES learning_resource(id) ON DELETE CASCADE,
  status completion_status NOT NULL DEFAULT 'not_started',
  progress INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  rating INTEGER,
  review TEXT,
  notes TEXT,
  certificate_url TEXT,
  certificate_earned_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT false,
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_frequency TEXT,
  next_reminder_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);
CREATE INDEX IF NOT EXISTS idx_resource_completion_user ON resource_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_completion_user_status ON resource_completion(user_id, status);
CREATE INDEX IF NOT EXISTS idx_resource_completion_user_fav ON resource_completion(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_resource_completion_user_progress ON resource_completion(user_id, progress DESC);
CREATE INDEX IF NOT EXISTS idx_resource_completion_user_accessed ON resource_completion(user_id, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_completion_resource ON resource_completion(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_completion_reminder ON resource_completion(reminder_enabled, next_reminder_at);

-- ============================================================================
-- 59. recommendation_history
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES learning_resource(id) ON DELETE CASCADE,
  reason recommendation_reason NOT NULL,
  reason_details TEXT,
  score REAL NOT NULL,
  rank INTEGER,
  skills_addressed TEXT[] DEFAULT '{}',
  ai_model_used TEXT,
  context_data JSONB DEFAULT '{}',
  was_viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMPTZ,
  was_clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  was_enrolled BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ,
  was_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rec_history_user ON recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_user_active ON recommendation_history(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rec_history_user_score ON recommendation_history(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_rec_history_user_created ON recommendation_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_history_resource ON recommendation_history(resource_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_reason ON recommendation_history(reason);
CREATE INDEX IF NOT EXISTS idx_rec_history_viewed ON recommendation_history(was_viewed);
CREATE INDEX IF NOT EXISTS idx_rec_history_enrolled ON recommendation_history(was_enrolled);

-- ============================================================================
-- 60. recommendation_feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  recommendation_id UUID NOT NULL,
  feedback_type recommendation_feedback_type NOT NULL,
  rating INTEGER,
  comment TEXT,
  time_to_feedback INTEGER,
  engagement_duration INTEGER,
  was_useful BOOLEAN,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recommendation_id)
);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_rec ON recommendation_feedback(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_type ON recommendation_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_useful ON recommendation_feedback(was_useful);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_created ON recommendation_feedback(created_at DESC);

-- ============================================================================
-- 61. learning_goal
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_goal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  metric_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  skill_focus TEXT[] DEFAULT '{}',
  resource_ids UUID[] DEFAULT '{}',
  streak_days INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_goal_user ON learning_goal(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_goal_user_status ON learning_goal(user_id, status);
CREATE INDEX IF NOT EXISTS idx_learning_goal_user_type ON learning_goal(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_learning_goal_user_dates ON learning_goal(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_learning_goal_status_end ON learning_goal(status, end_date);

-- ============================================================================
-- 62. mentor_skill_match
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_skill_match (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES mentor_profile(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_name_fr TEXT,
  proficiency_level INTEGER NOT NULL,
  years_experience INTEGER,
  can_teach BOOLEAN DEFAULT true,
  teaching_rating REAL,
  total_sessions_on_skill INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, skill_name)
);
CREATE INDEX IF NOT EXISTS idx_mentor_skill_mentor ON mentor_skill_match(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_skill_name ON mentor_skill_match(skill_name);
CREATE INDEX IF NOT EXISTS idx_mentor_skill_proficiency ON mentor_skill_match(proficiency_level DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_skill_teach ON mentor_skill_match(can_teach);
CREATE INDEX IF NOT EXISTS idx_mentor_skill_rating ON mentor_skill_match(teaching_rating DESC);

-- ============================================================================
-- 63. learning_sequence
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_sequence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  target_role TEXT,
  target_field TEXT,
  resources JSONB NOT NULL DEFAULT '[]',
  total_resources INTEGER NOT NULL DEFAULT 0,
  completed_resources INTEGER NOT NULL DEFAULT 0,
  estimated_weeks INTEGER,
  current_resource_index INTEGER DEFAULT 0,
  ai_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_user ON learning_sequence(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_user_status ON learning_sequence(user_id, status);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_role ON learning_sequence(target_role);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_field ON learning_sequence(target_field);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_ai ON learning_sequence(ai_generated);
CREATE INDEX IF NOT EXISTS idx_learning_sequence_created ON learning_sequence(created_at DESC);
`;

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  console.log("Connecting to PostgreSQL...");
  await client.connect();

  // Count tables before
  const beforeRes = await client.query(
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'"
  );
  const beforeCount = parseInt(beforeRes.rows[0].count);
  console.log(`Tables before: ${beforeCount}`);

  // Count enums before
  const enumBeforeRes = await client.query(
    "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e'"
  );
  console.log(`Enums before: ${enumBeforeRes.rows[0].count}`);

  // Create enums
  console.log("\n--- Creating enums ---");
  try {
    await client.query(ENUM_SQL);
    console.log("Enums created successfully.");
  } catch (err) {
    console.error("Enum creation error:", err.message);
  }

  // Count enums after
  const enumRes = await client.query(
    "SELECT COUNT(*) FROM pg_type WHERE typtype = 'e'"
  );
  console.log(`Enums after: ${enumRes.rows[0].count}`);

  // Create tables - execute entire SQL as one query
  console.log("\n--- Creating tables ---");
  try {
    await client.query(TABLE_SQL);
    console.log("All tables created successfully.");
  } catch (err) {
    console.error("Table creation error:", err.message);
    // If bulk fails, show which specific statement failed
    console.error("Detail:", err.detail || "none");
    console.error("Position:", err.position || "none");
  }

  // Count tables after
  const afterRes = await client.query(
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'"
  );
  const afterCount = parseInt(afterRes.rows[0].count);

  // List new tables
  const newTablesRes = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  );
  const allTables = newTablesRes.rows.map((r) => r.tablename);

  console.log("\n============================================");
  console.log(`Tables before: ${beforeCount}`);
  console.log(`Tables after:  ${afterCount}`);
  console.log(`New tables:    ${afterCount - beforeCount}`);
  console.log("============================================");

  // Verify all 63 expected tables exist
  const expected = [
    'ai_global_settings', 'job_listing', 'quiz_question', 'partner_profile',
    'partner_job_posting', 'partner_job_application', 'partner_event',
    'partner_event_registration', 'saved_job', 'interview_checklist_reference',
    'mentor_message', 'certification_library', 'branding_example',
    'interview_performance', 'interview_goal', 'job_recommendation',
    'user_job_preference', 'skill_progress', 'coaching_session', 'career_path',
    'skill_gap_analysis', 'weekly_goal', 'confidence_journal', 'daily_affirmation',
    'user_affirmation_progress', 'student_progress', 'skill_progression',
    'progress_activity_log', 'achievement_badge', 'student_cohort',
    'cohort_membership', 'weekly_progress_snapshot', 'interview_weakness',
    'interview_improvement', 'mock_interview_template', 'template_usage',
    'ai_feedback', 'ai_training_sample', 'content_quality_rating',
    'model_comparison', 'model_comparison_result', 'career_prediction',
    'job_match_score', 'career_trajectory', 'student_learning_profile',
    'adaptive_learning_path', 'adaptive_learning_milestone',
    'adaptive_skill_assessment', 'adaptive_learning_recommendation',
    'ai_model_metrics', 'ai_feature_metrics', 'ai_latency_log', 'ai_error_log',
    'ai_content_quality', 'ai_performance_alert', 'cohort_analytics_metrics',
    'cohort_analytics_benchmark', 'resource_completion', 'recommendation_history',
    'recommendation_feedback', 'learning_goal', 'mentor_skill_match',
    'learning_sequence'
  ];

  const tableSet = new Set(allTables);
  const missing = expected.filter((t) => !tableSet.has(t));
  const found = expected.filter((t) => tableSet.has(t));

  console.log(`\nVerification: ${found.length}/63 expected tables exist`);
  if (missing.length > 0) {
    console.log("Still missing:", missing.join(", "));
  } else {
    console.log("ALL 63 TABLES CREATED SUCCESSFULLY!");
  }

  await client.end();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
