/**
 * recreate-tables.mjs
 *
 * Drops and recreates 63 tables that were created with wrong column definitions.
 * Column definitions are taken directly from the Drizzle schema at
 * src/integrations/drizzle/schema.ts
 *
 * All tables are empty so DROP CASCADE is safe.
 * Foreign keys to tables OUTSIDE the 63-table set reference existing stable tables.
 * Foreign keys BETWEEN tables in the 63-table set are skipped (just use the correct type).
 */

import pg from "pg";
const { Client } = pg;

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

// ============================================================================
// All 63 tables to drop (order matters for CASCADE but we use CASCADE anyway)
// ============================================================================
const TABLES_TO_DROP = [
	// Tables with FK deps on other tables in this list (drop first)
	"user_affirmation_progress",
	"recommendation_feedback",
	"resource_completion",
	"cohort_analytics_benchmark",
	"cohort_analytics_metrics",
	"ai_performance_alert",
	"ai_content_quality",
	"ai_error_log",
	"ai_latency_log",
	"ai_feature_metrics",
	"ai_model_metrics",
	"adaptive_learning_recommendation",
	"adaptive_skill_assessment",
	"adaptive_learning_milestone",
	"adaptive_learning_path",
	"student_learning_profile",
	"career_trajectory",
	"job_match_score",
	"career_prediction",
	"model_comparison_result",
	"model_comparison",
	"content_quality_rating",
	"ai_training_sample",
	"ai_feedback",
	"template_usage",
	"mock_interview_template",
	"interview_improvement",
	"interview_weakness",
	"weekly_progress_snapshot",
	"cohort_membership",
	"student_cohort",
	"achievement_badge",
	"progress_activity_log",
	"skill_progression",
	"student_progress",
	"skill_gap_analysis",
	"confidence_journal",
	"weekly_goal",
	"career_path",
	"coaching_session",
	"user_affirmation_progress",
	"daily_affirmation",
	"skill_progress",
	"user_job_preference",
	"job_recommendation",
	"interview_goal",
	"interview_performance",
	"branding_example",
	"certification_library",
	"mentor_message",
	"interview_checklist_reference",
	"saved_job",
	"partner_event_registration",
	"partner_event",
	"partner_job_application",
	"partner_job_posting",
	"partner_profile",
	"quiz_question",
	"job_listing",
	"ai_global_settings",
	"recommendation_history",
	"learning_resource",
	"learning_goal",
	"mentor_skill_match",
	"learning_sequence",
];

// ============================================================================
// Enum creation SQL - create enums that may not exist yet
// ============================================================================
const ENUM_CREATES = [
	`DO $$ BEGIN CREATE TYPE job_listing_status AS ENUM ('active','expired','filled','draft'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE quiz_question_type AS ENUM ('multiple_choice','scale','ranking'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE quiz_category AS ENUM ('personality','interests','skills','work_preferences','values','moroccan_market','environment','stress','work_style','goals'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE partner_status AS ENUM ('pending','approved','rejected','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE partner_type AS ENUM ('employer','recruiter','training_center','government','ngo'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE partner_job_status AS ENUM ('draft','pending_review','published','expired','closed','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE partner_event_status AS ENUM ('draft','pending_review','published','cancelled','completed','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE partner_event_type AS ENUM ('job_fair','workshop','webinar','networking','training','open_day','recruitment','conference','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE interview_goal_prep_status AS ENUM ('not_started','preparing','practicing','ready','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE interview_goal_outcome AS ENUM ('offered','rejected','pending','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE job_recommendation_status AS ENUM ('new','viewed','applied','saved','dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_path_status AS ENUM ('not_started','in_progress','completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_path_priority AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE coaching_session_status AS ENUM ('scheduled','in_progress','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE coaching_topic AS ENUM ('resume_review','interview_prep','career_transition','skill_development','networking','negotiation','leadership','work_life_balance','job_search','personal_branding'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE confidence_level AS ENUM ('very_low','low','moderate','high','very_high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE weekly_goal_category AS ENUM ('applications','networking','skills','interview_prep','personal_branding','research','other'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE weekly_goal_status AS ENUM ('pending','in_progress','completed','missed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE confidence_entry_type AS ENUM ('win','challenge','learning','affirmation','reflection'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE progress_activity_action AS ENUM ('lesson_started','lesson_completed','quiz_taken','skill_practiced','resume_edited','interview_practiced','goal_set','goal_achieved','badge_earned','module_completed','resource_viewed','feedback_received','peer_review_given','mentor_session','certification_earned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE badge_type AS ENUM ('first_resume','resume_master','interview_ready','interview_champion','skill_seeker','skill_expert','consistency_streak','early_bird','night_owl','fast_learner','perfectionist','team_player','mentor_helper','goal_crusher','certificate_collector'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE skill_level AS ENUM ('beginner','elementary','intermediate','upper_intermediate','advanced','expert'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE weakness_type AS ENUM ('communication','technical','behavioral','confidence','structure','time_management','stress_handling','knowledge_gap'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE weakness_severity AS ENUM ('critical','major','minor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE template_industry AS ENUM ('healthcare','industrial','hse','general','technology','finance','retail','hospitality'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE template_difficulty AS ENUM ('entry_level','mid_level','senior_level'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE ai_feedback_rating AS ENUM ('positive','negative','neutral'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE ai_content_feature AS ENUM ('improve_content','generate_summary','fix_grammar','suggest_skills','generate_headline','analyze_resume','interview_questions','interview_evaluation','interview_chat','cover_letter','linkedin_summary','bullet_point','achievement','skill_extraction'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE training_sample_tier AS ENUM ('gold','silver','bronze','rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE quality_dimension AS ENUM ('relevance','accuracy','fluency','tone','helpfulness','formatting','completeness'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE model_comparison_status AS ENUM ('pending','in_progress','completed','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE career_prediction_status AS ENUM ('pending','processing','completed','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_style AS ENUM ('visual','auditory','reading_writing','kinesthetic','mixed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_pace AS ENUM ('slow','moderate','fast','self_paced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE skill_assessment_level AS ENUM ('novice','beginner','intermediate','advanced','expert'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE adaptive_learning_path_status AS ENUM ('not_started','in_progress','paused','completed','abandoned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_milestone_status AS ENUM ('locked','unlocked','in_progress','completed','skipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_recommendation_type AS ENUM ('next_skill','review_topic','practice_exercise','take_assessment','adjust_pace','try_resource','milestone_goal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_recommendation_priority AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE ai_error_severity AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE ai_error_category AS ENUM ('rate_limit','timeout','invalid_request','authentication','model_error','content_filter','quota_exceeded','network_error','parsing_error','unknown'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE ai_alert_status AS ENUM ('active','acknowledged','resolved','ignored'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE interview_field AS ENUM ('healthcare','industrial','hse','general'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE completion_status AS ENUM ('not_started','in_progress','completed','paused','dropped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE recommendation_reason AS ENUM ('skill_gap','career_goal','trending','peer_popularity','mentor_suggested','completion_pattern','personalized_ai','curated','new_release'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE recommendation_feedback_type AS ENUM ('helpful','not_helpful','too_easy','too_hard','not_relevant','already_know','will_try_later','enrolled','completed','dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_resource_type AS ENUM ('course','tutorial','certification','video','article','book','workshop','webinar','practice','mentorship'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_difficulty AS ENUM ('beginner','intermediate','advanced','expert'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	`DO $$ BEGIN CREATE TYPE learning_cost_type AS ENUM ('free','paid','subscription','freemium'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

// ============================================================================
// Table CREATE statements - exact column definitions from Drizzle schema
// ============================================================================
const TABLE_CREATES = [
	// ---- ai_global_settings ----
	`CREATE TABLE ai_global_settings (
		id TEXT PRIMARY KEY,
		max_daily_requests INTEGER DEFAULT 10000,
		max_monthly_requests INTEGER DEFAULT 100000,
		max_daily_tokens INTEGER DEFAULT 10000000,
		max_monthly_tokens INTEGER DEFAULT 100000000,
		alert_threshold_percent INTEGER DEFAULT 80,
		suspend_on_exceed BOOLEAN DEFAULT false,
		default_language TEXT DEFAULT 'fr',
		allowed_languages TEXT[] DEFAULT ARRAY['fr','ar','en','darija'],
		is_active BOOLEAN NOT NULL DEFAULT true,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- job_listing ----
	`CREATE TABLE job_listing (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		external_id TEXT,
		source TEXT NOT NULL,
		title TEXT NOT NULL,
		title_fr TEXT,
		company TEXT NOT NULL,
		company_logo TEXT,
		location TEXT NOT NULL,
		region TEXT,
		job_type TEXT,
		experience_level TEXT,
		field TEXT,
		description TEXT,
		requirements JSONB,
		skills JSONB,
		salary_min INTEGER,
		salary_max INTEGER,
		salary_period TEXT DEFAULT 'monthly',
		benefits JSONB,
		application_url TEXT,
		contact_email TEXT,
		posted_at TIMESTAMPTZ,
		expires_at TIMESTAMPTZ,
		status job_listing_status NOT NULL DEFAULT 'active',
		view_count INTEGER NOT NULL DEFAULT 0,
		application_count INTEGER NOT NULL DEFAULT 0,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- quiz_question ----
	`CREATE TABLE quiz_question (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		quiz_type TEXT NOT NULL,
		question TEXT NOT NULL,
		question_fr TEXT NOT NULL,
		description TEXT,
		description_fr TEXT,
		category quiz_category NOT NULL,
		question_type quiz_question_type NOT NULL DEFAULT 'multiple_choice',
		options JSONB NOT NULL,
		trait TEXT,
		field TEXT,
		weight REAL DEFAULT 1,
		is_active BOOLEAN NOT NULL DEFAULT true,
		sort_order INTEGER DEFAULT 0,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- partner_profile ----
	`CREATE TABLE partner_profile (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
		company_name TEXT NOT NULL,
		company_name_fr TEXT,
		logo TEXT,
		website TEXT,
		linkedin_url TEXT,
		partner_type partner_type NOT NULL,
		industry TEXT NOT NULL,
		industry_fr TEXT,
		description TEXT NOT NULL,
		description_fr TEXT,
		size TEXT,
		employee_count TEXT,
		headquarters TEXT NOT NULL,
		locations JSONB,
		founded INTEGER,
		contact_email TEXT NOT NULL,
		contact_phone TEXT,
		contact_person TEXT,
		fields JSONB,
		status partner_status NOT NULL DEFAULT 'pending',
		approved_at TIMESTAMPTZ,
		approved_by UUID REFERENCES "user"(id),
		rejection_reason TEXT,
		total_jobs_posted INTEGER NOT NULL DEFAULT 0,
		total_events_posted INTEGER NOT NULL DEFAULT 0,
		total_applications INTEGER NOT NULL DEFAULT 0,
		rating REAL,
		review_count INTEGER NOT NULL DEFAULT 0,
		is_verified BOOLEAN NOT NULL DEFAULT false,
		is_premium BOOLEAN NOT NULL DEFAULT false,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- partner_job_posting ----
	`CREATE TABLE partner_job_posting (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		partner_id UUID NOT NULL REFERENCES partner_profile(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT NOT NULL,
		description_fr TEXT,
		location TEXT NOT NULL,
		region TEXT,
		job_type TEXT NOT NULL,
		experience_level TEXT NOT NULL,
		field TEXT,
		requirements JSONB,
		skills JSONB,
		education TEXT,
		certifications JSONB,
		salary_min INTEGER,
		salary_max INTEGER,
		salary_period TEXT DEFAULT 'monthly',
		salary_currency TEXT DEFAULT 'MAD',
		benefits JSONB,
		application_deadline TIMESTAMPTZ,
		start_date TIMESTAMPTZ,
		positions INTEGER DEFAULT 1,
		application_url TEXT,
		application_email TEXT,
		application_instructions TEXT,
		status partner_job_status NOT NULL DEFAULT 'draft',
		published_at TIMESTAMPTZ,
		expires_at TIMESTAMPTZ,
		reviewed_at TIMESTAMPTZ,
		reviewed_by UUID REFERENCES "user"(id),
		rejection_reason TEXT,
		view_count INTEGER NOT NULL DEFAULT 0,
		application_count INTEGER NOT NULL DEFAULT 0,
		save_count INTEGER NOT NULL DEFAULT 0,
		is_featured BOOLEAN NOT NULL DEFAULT false,
		is_urgent BOOLEAN NOT NULL DEFAULT false,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- partner_job_application ----
	`CREATE TABLE partner_job_application (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		job_id UUID NOT NULL REFERENCES partner_job_posting(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
		cover_letter TEXT,
		status TEXT NOT NULL DEFAULT 'submitted',
		notes TEXT,
		match_score INTEGER,
		reviewed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- partner_event ----
	`CREATE TABLE partner_event (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		partner_id UUID NOT NULL REFERENCES partner_profile(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT NOT NULL,
		description_fr TEXT,
		event_type partner_event_type NOT NULL,
		format TEXT NOT NULL,
		location TEXT,
		address TEXT,
		city TEXT,
		online_url TEXT,
		start_date TIMESTAMPTZ NOT NULL,
		end_date TIMESTAMPTZ NOT NULL,
		registration_deadline TIMESTAMPTZ,
		capacity INTEGER,
		is_free BOOLEAN NOT NULL DEFAULT true,
		price INTEGER,
		target_audience JSONB,
		fields JSONB,
		speakers JSONB,
		agenda JSONB,
		requirements JSONB,
		image TEXT,
		status partner_event_status NOT NULL DEFAULT 'draft',
		published_at TIMESTAMPTZ,
		reviewed_at TIMESTAMPTZ,
		reviewed_by UUID REFERENCES "user"(id),
		rejection_reason TEXT,
		view_count INTEGER NOT NULL DEFAULT 0,
		registration_count INTEGER NOT NULL DEFAULT 0,
		attendee_count INTEGER NOT NULL DEFAULT 0,
		is_featured BOOLEAN NOT NULL DEFAULT false,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- partner_event_registration ----
	`CREATE TABLE partner_event_registration (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		event_id UUID NOT NULL REFERENCES partner_event(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		status TEXT NOT NULL DEFAULT 'registered',
		notes TEXT,
		attended_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- saved_job ----
	`CREATE TABLE saved_job (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		job_id UUID NOT NULL REFERENCES partner_job_posting(id) ON DELETE CASCADE,
		notes TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- interview_checklist_reference ----
	`CREATE TABLE interview_checklist_reference (
		id TEXT PRIMARY KEY,
		category TEXT NOT NULL,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT,
		description_fr TEXT,
		tip TEXT,
		tip_fr TEXT,
		link TEXT,
		link_label TEXT,
		icon TEXT,
		sort_order INTEGER,
		is_active BOOLEAN NOT NULL DEFAULT true,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- mentor_message ----
	`CREATE TABLE mentor_message (
		id TEXT PRIMARY KEY,
		sender_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		receiver_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		mentor_connection_id TEXT,
		subject TEXT,
		content TEXT NOT NULL,
		is_read BOOLEAN NOT NULL DEFAULT false,
		read_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- certification_library ----
	`CREATE TABLE certification_library (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		name_fr TEXT,
		provider TEXT NOT NULL,
		field TEXT NOT NULL,
		level TEXT DEFAULT 'intermediate',
		duration TEXT,
		cost TEXT,
		description TEXT,
		description_fr TEXT,
		skills TEXT[],
		prerequisites TEXT[],
		url TEXT,
		is_recommended BOOLEAN DEFAULT false,
		is_active BOOLEAN NOT NULL DEFAULT true,
		sort_order INTEGER,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- branding_example ----
	`CREATE TABLE branding_example (
		id TEXT PRIMARY KEY,
		category TEXT NOT NULL,
		value TEXT NOT NULL,
		value_fr TEXT,
		field TEXT,
		is_active BOOLEAN NOT NULL DEFAULT true,
		sort_order INTEGER,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- interview_performance ----
	`CREATE TABLE interview_performance (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		session_id TEXT,
		overall_score INTEGER,
		confidence_score INTEGER,
		clarity_score INTEGER,
		relevance_score INTEGER,
		technical_score INTEGER,
		communication_score INTEGER,
		strengths JSONB DEFAULT '[]',
		improvements JSONB DEFAULT '[]',
		ai_analysis TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- interview_goal ----
	`CREATE TABLE interview_goal (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		target_role TEXT,
		target_company TEXT,
		interview_date TIMESTAMPTZ,
		preparation_status interview_goal_prep_status DEFAULT 'not_started',
		practice_count INTEGER DEFAULT 0,
		target_practice_count INTEGER DEFAULT 10,
		notes TEXT,
		completed BOOLEAN DEFAULT false,
		outcome interview_goal_outcome,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- job_recommendation ----
	`CREATE TABLE job_recommendation (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		job_id TEXT NOT NULL,
		job_source TEXT DEFAULT 'partner',
		match_score INTEGER NOT NULL,
		skill_match_score INTEGER,
		experience_match_score INTEGER,
		location_match_score INTEGER,
		salary_match_score INTEGER,
		reasons JSONB,
		status job_recommendation_status NOT NULL DEFAULT 'new',
		viewed_at TIMESTAMPTZ,
		applied_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- user_job_preference ----
	`CREATE TABLE user_job_preference (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
		preferred_fields TEXT[],
		preferred_locations TEXT[],
		preferred_regions TEXT[],
		min_salary INTEGER,
		max_salary INTEGER,
		job_types TEXT[],
		experience_level TEXT,
		willing_to_relocate BOOLEAN DEFAULT false,
		remote_preference TEXT DEFAULT 'hybrid',
		keywords TEXT[],
		excluded_companies TEXT[],
		priority_skills TEXT[],
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- skill_progress ----
	`CREATE TABLE skill_progress (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		skill_name TEXT NOT NULL,
		skill_name_fr TEXT,
		category TEXT DEFAULT 'technical',
		current_level INTEGER DEFAULT 1,
		target_level INTEGER DEFAULT 3,
		progress INTEGER DEFAULT 0,
		hours_invested INTEGER DEFAULT 0,
		last_practiced TIMESTAMPTZ,
		practice_streak INTEGER DEFAULT 0,
		notes TEXT,
		learning_path_id TEXT REFERENCES learning_path(id) ON DELETE SET NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(user_id, skill_name)
	)`,

	// ---- coaching_session ----
	`CREATE TABLE coaching_session (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		topic coaching_topic NOT NULL,
		status coaching_session_status NOT NULL DEFAULT 'scheduled',
		scheduled_at TIMESTAMPTZ,
		started_at TIMESTAMPTZ,
		completed_at TIMESTAMPTZ,
		duration INTEGER,
		notes TEXT,
		ai_summary TEXT,
		action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
		next_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
		confidence_before confidence_level,
		confidence_after confidence_level,
		rating INTEGER,
		feedback TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- career_path ----
	`CREATE TABLE career_path (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		"current_role" TEXT,
		current_role_fr TEXT,
		target_role TEXT NOT NULL,
		target_role_fr TEXT,
		target_industry TEXT,
		target_company TEXT,
		target_salary INTEGER,
		target_date TIMESTAMPTZ,
		milestones JSONB DEFAULT '[]',
		overall_progress INTEGER DEFAULT 0,
		is_active BOOLEAN DEFAULT true,
		notes TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- skill_gap_analysis ----
	`CREATE TABLE skill_gap_analysis (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		career_path_id TEXT REFERENCES career_path(id) ON DELETE CASCADE,
		target_role TEXT NOT NULL,
		gaps JSONB DEFAULT '[]',
		strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
		recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
		overall_readiness INTEGER DEFAULT 0,
		ai_analysis TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- weekly_goal ----
	`CREATE TABLE weekly_goal (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		week_start_date DATE NOT NULL,
		category weekly_goal_category NOT NULL,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT,
		target_value INTEGER DEFAULT 1,
		current_value INTEGER DEFAULT 0,
		status weekly_goal_status NOT NULL DEFAULT 'pending',
		priority TEXT DEFAULT 'medium',
		completed_at TIMESTAMPTZ,
		notes TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- confidence_journal ----
	`CREATE TABLE confidence_journal (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		entry_type confidence_entry_type NOT NULL,
		entry_date DATE NOT NULL,
		title TEXT NOT NULL,
		content TEXT NOT NULL,
		mood INTEGER,
		tags TEXT[] DEFAULT ARRAY[]::TEXT[],
		is_private BOOLEAN DEFAULT true,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- daily_affirmation ----
	`CREATE TABLE daily_affirmation (
		id TEXT PRIMARY KEY,
		category TEXT NOT NULL,
		content TEXT NOT NULL,
		content_fr TEXT,
		content_ar TEXT,
		author TEXT,
		is_active BOOLEAN DEFAULT true,
		sort_order INTEGER DEFAULT 0,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- user_affirmation_progress ----
	`CREATE TABLE user_affirmation_progress (
		id TEXT PRIMARY KEY,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		affirmation_id TEXT NOT NULL REFERENCES daily_affirmation(id) ON DELETE CASCADE,
		seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		is_liked BOOLEAN DEFAULT false,
		is_saved BOOLEAN DEFAULT false,
		UNIQUE(user_id, affirmation_id)
	)`,

	// ---- student_progress ----
	`CREATE TABLE student_progress (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
		overall_score INTEGER NOT NULL DEFAULT 0,
		total_lessons_completed INTEGER NOT NULL DEFAULT 0,
		total_quizzes_taken INTEGER NOT NULL DEFAULT 0,
		total_practice_time INTEGER NOT NULL DEFAULT 0,
		current_streak INTEGER NOT NULL DEFAULT 0,
		longest_streak INTEGER NOT NULL DEFAULT 0,
		last_activity_date DATE,
		resume_completeness INTEGER NOT NULL DEFAULT 0,
		interview_readiness INTEGER NOT NULL DEFAULT 0,
		job_search_readiness INTEGER NOT NULL DEFAULT 0,
		weekly_goal_progress INTEGER NOT NULL DEFAULT 0,
		weekly_goal_target INTEGER NOT NULL DEFAULT 5,
		cohort_id UUID,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- skill_progression ----
	`CREATE TABLE skill_progression (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		skill_id TEXT NOT NULL,
		skill_name TEXT NOT NULL,
		skill_name_fr TEXT,
		previous_level skill_level,
		current_level skill_level NOT NULL,
		score INTEGER NOT NULL DEFAULT 0,
		assessment_type TEXT NOT NULL,
		notes TEXT,
		recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- progress_activity_log ----
	`CREATE TABLE progress_activity_log (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		action progress_activity_action NOT NULL,
		entity_type TEXT,
		entity_id TEXT,
		entity_name TEXT,
		duration_minutes INTEGER,
		score_achieved INTEGER,
		metadata JSONB DEFAULT '{}',
		session_id TEXT,
		device_type TEXT,
		completed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- achievement_badge ----
	`CREATE TABLE achievement_badge (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		badge_type badge_type NOT NULL,
		badge_name TEXT NOT NULL,
		badge_name_fr TEXT,
		badge_description TEXT NOT NULL,
		badge_description_fr TEXT,
		badge_icon TEXT NOT NULL,
		tier TEXT NOT NULL DEFAULT 'bronze',
		xp_awarded INTEGER NOT NULL DEFAULT 0,
		criteria_value INTEGER,
		is_new BOOLEAN NOT NULL DEFAULT true,
		earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(user_id, badge_type, tier)
	)`,

	// ---- student_cohort ----
	`CREATE TABLE student_cohort (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT NOT NULL,
		name_fr TEXT,
		description TEXT,
		description_fr TEXT,
		cohort_type TEXT NOT NULL,
		program_id TEXT,
		start_date DATE,
		end_date DATE,
		is_active BOOLEAN NOT NULL DEFAULT true,
		member_count INTEGER NOT NULL DEFAULT 0,
		avg_progress INTEGER NOT NULL DEFAULT 0,
		metadata JSONB DEFAULT '{}',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- cohort_membership ----
	`CREATE TABLE cohort_membership (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		cohort_id UUID NOT NULL REFERENCES student_cohort(id) ON DELETE CASCADE,
		role TEXT NOT NULL DEFAULT 'member',
		joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		left_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(user_id, cohort_id)
	)`,

	// ---- weekly_progress_snapshot ----
	`CREATE TABLE weekly_progress_snapshot (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		week_start_date DATE NOT NULL,
		week_end_date DATE NOT NULL,
		overall_score INTEGER NOT NULL,
		lessons_completed INTEGER NOT NULL DEFAULT 0,
		practice_minutes INTEGER NOT NULL DEFAULT 0,
		quizzes_taken INTEGER NOT NULL DEFAULT 0,
		avg_quiz_score INTEGER,
		badges_earned INTEGER NOT NULL DEFAULT 0,
		streak_days INTEGER NOT NULL DEFAULT 0,
		top_skill_improved TEXT,
		cohort_rank INTEGER,
		cohort_percentile INTEGER,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(user_id, week_start_date)
	)`,

	// ---- interview_weakness ----
	`CREATE TABLE interview_weakness (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
		weakness_type weakness_type NOT NULL,
		severity weakness_severity NOT NULL DEFAULT 'minor',
		field interview_field,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT NOT NULL,
		description_fr TEXT,
		occurrence_count INTEGER NOT NULL DEFAULT 1,
		example_questions JSONB DEFAULT '[]',
		suggested_resources JSONB DEFAULT '[]',
		practice_exercises JSONB DEFAULT '[]',
		is_resolved BOOLEAN NOT NULL DEFAULT false,
		resolved_at TIMESTAMPTZ,
		last_seen_at TIMESTAMPTZ DEFAULT NOW(),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- interview_improvement ----
	`CREATE TABLE interview_improvement (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		weakness_id UUID REFERENCES interview_weakness(id) ON DELETE SET NULL,
		field interview_field,
		skill_area TEXT NOT NULL,
		skill_area_fr TEXT,
		previous_score INTEGER NOT NULL,
		current_score INTEGER NOT NULL,
		improvement_percentage INTEGER NOT NULL,
		measurement_period TEXT NOT NULL DEFAULT 'weekly',
		notes TEXT,
		milestones_achieved JSONB DEFAULT '[]',
		sessions_completed INTEGER NOT NULL DEFAULT 0,
		recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- mock_interview_template ----
	`CREATE TABLE mock_interview_template (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT NOT NULL,
		name_fr TEXT,
		description TEXT,
		description_fr TEXT,
		industry template_industry NOT NULL,
		target_role TEXT,
		target_role_fr TEXT,
		difficulty template_difficulty NOT NULL DEFAULT 'entry_level',
		estimated_duration INTEGER NOT NULL DEFAULT 30,
		questions JSONB DEFAULT '[]',
		total_questions INTEGER NOT NULL DEFAULT 0,
		tags TEXT[] DEFAULT ARRAY[]::TEXT[],
		success_metrics JSONB DEFAULT '[]',
		preparation_tips JSONB DEFAULT '[]',
		preparation_tips_fr JSONB DEFAULT '[]',
		is_active BOOLEAN NOT NULL DEFAULT true,
		usage_count INTEGER NOT NULL DEFAULT 0,
		avg_score INTEGER,
		created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- template_usage ----
	`CREATE TABLE template_usage (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		template_id UUID NOT NULL REFERENCES mock_interview_template(id) ON DELETE CASCADE,
		session_id UUID REFERENCES interview_session(id) ON DELETE SET NULL,
		score INTEGER,
		completed_at TIMESTAMPTZ,
		feedback TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- ai_feedback ----
	`CREATE TABLE ai_feedback (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		feature ai_content_feature NOT NULL,
		rating ai_feedback_rating NOT NULL,
		original_input TEXT,
		original_output TEXT NOT NULL,
		edited_output TEXT,
		has_edits BOOLEAN NOT NULL DEFAULT false,
		edit_distance INTEGER,
		comment TEXT,
		context JSONB,
		response_time_ms INTEGER,
		token_count INTEGER,
		was_accepted BOOLEAN NOT NULL DEFAULT false,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- ai_training_sample ----
	`CREATE TABLE ai_training_sample (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		feedback_id UUID REFERENCES ai_feedback(id) ON DELETE SET NULL,
		feature ai_content_feature NOT NULL,
		input TEXT NOT NULL,
		output TEXT NOT NULL,
		tier training_sample_tier NOT NULL DEFAULT 'bronze',
		quality_score INTEGER,
		curated_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
		curated_at TIMESTAMPTZ,
		context JSONB,
		tags TEXT[] DEFAULT ARRAY[]::TEXT[],
		exported_at TIMESTAMPTZ,
		export_format TEXT,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- content_quality_rating ----
	`CREATE TABLE content_quality_rating (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		feedback_id UUID NOT NULL REFERENCES ai_feedback(id) ON DELETE CASCADE,
		dimension quality_dimension NOT NULL,
		score INTEGER NOT NULL,
		weight REAL NOT NULL DEFAULT 1.0,
		notes TEXT,
		reviewed_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(feedback_id, dimension)
	)`,

	// ---- model_comparison ----
	`CREATE TABLE model_comparison (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name TEXT NOT NULL,
		description TEXT,
		feature ai_content_feature NOT NULL,
		model_a TEXT NOT NULL,
		model_a_provider TEXT NOT NULL,
		model_b TEXT NOT NULL,
		model_b_provider TEXT NOT NULL,
		test_inputs JSONB DEFAULT '[]',
		status model_comparison_status NOT NULL DEFAULT 'pending',
		results JSONB,
		winner TEXT,
		win_margin REAL,
		confidence REAL,
		started_at TIMESTAMPTZ,
		completed_at TIMESTAMPTZ,
		created_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- model_comparison_result ----
	`CREATE TABLE model_comparison_result (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		comparison_id UUID NOT NULL REFERENCES model_comparison(id) ON DELETE CASCADE,
		input TEXT NOT NULL,
		model_a_output TEXT NOT NULL,
		model_a_latency_ms INTEGER,
		model_a_tokens INTEGER,
		model_a_score INTEGER,
		model_b_output TEXT NOT NULL,
		model_b_latency_ms INTEGER,
		model_b_tokens INTEGER,
		model_b_score INTEGER,
		winner TEXT,
		score_difference INTEGER,
		evaluator_notes TEXT,
		evaluated_by UUID REFERENCES "user"(id) ON DELETE SET NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- career_prediction ----
	`CREATE TABLE career_prediction (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		resume_id UUID REFERENCES resume(id) ON DELETE SET NULL,
		status career_prediction_status NOT NULL DEFAULT 'pending',
		"current_role" TEXT,
		"current_field" TEXT,
		years_experience INTEGER DEFAULT 0,
		current_skills JSONB DEFAULT '[]',
		education_level TEXT,
		predicted_paths JSONB DEFAULT '[]',
		top_recommendation TEXT,
		ai_analysis TEXT,
		confidence_score INTEGER,
		model_version TEXT DEFAULT 'v1',
		processing_time INTEGER,
		error_message TEXT,
		expires_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- job_match_score ----
	`CREATE TABLE job_match_score (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		prediction_id UUID REFERENCES career_prediction(id) ON DELETE CASCADE,
		job_title TEXT NOT NULL,
		job_title_fr TEXT,
		company TEXT,
		industry TEXT,
		location TEXT,
		salary_min INTEGER,
		salary_max INTEGER,
		salary_currency TEXT DEFAULT 'MAD',
		job_description TEXT,
		required_skills JSONB DEFAULT '[]',
		overall_score INTEGER NOT NULL,
		skill_match_score INTEGER,
		experience_match_score INTEGER,
		education_match_score INTEGER,
		culture_fit_score INTEGER,
		salary_fit_score INTEGER,
		location_fit_score INTEGER,
		matched_skills JSONB DEFAULT '[]',
		missing_skills JSONB DEFAULT '[]',
		transferable_skills JSONB DEFAULT '[]',
		recommendations JSONB DEFAULT '[]',
		confidence_level TEXT DEFAULT 'medium',
		ai_explanation TEXT,
		improvement_suggestions JSONB DEFAULT '[]',
		is_bookmarked BOOLEAN DEFAULT false,
		is_applied BOOLEAN DEFAULT false,
		is_dismissed BOOLEAN DEFAULT false,
		applied_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- career_trajectory ----
	`CREATE TABLE career_trajectory (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		prediction_id UUID REFERENCES career_prediction(id) ON DELETE CASCADE,
		path_name TEXT NOT NULL,
		path_name_fr TEXT,
		target_role TEXT NOT NULL,
		target_role_fr TEXT,
		target_field TEXT,
		estimated_years_to_target INTEGER,
		starting_salary INTEGER,
		projected_salary_year1 INTEGER,
		projected_salary_year3 INTEGER,
		projected_salary_year5 INTEGER,
		salary_currency TEXT DEFAULT 'MAD',
		growth_rate NUMERIC(5,2),
		success_probability INTEGER,
		market_demand TEXT DEFAULT 'medium',
		competition_level TEXT DEFAULT 'medium',
		trajectory_points JSONB DEFAULT '[]',
		required_skill_upgrades JSONB DEFAULT '[]',
		required_certifications JSONB DEFAULT '[]',
		required_experience JSONB DEFAULT '[]',
		success_factors JSONB DEFAULT '[]',
		potential_challenges JSONB DEFAULT '[]',
		mitigation_strategies JSONB DEFAULT '[]',
		ai_insights TEXT,
		alternative_path_suggestions JSONB DEFAULT '[]',
		is_selected BOOLEAN DEFAULT false,
		is_active BOOLEAN DEFAULT true,
		last_simulated_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- student_learning_profile ----
	`CREATE TABLE student_learning_profile (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
		learning_style learning_style DEFAULT 'mixed',
		preferred_pace learning_pace DEFAULT 'moderate',
		daily_time_commitment INTEGER DEFAULT 30,
		weekly_goal_hours INTEGER DEFAULT 5,
		preferred_session_length INTEGER DEFAULT 30,
		current_field TEXT,
		current_level skill_assessment_level DEFAULT 'beginner',
		target_level skill_assessment_level DEFAULT 'intermediate',
		strengths JSONB DEFAULT '[]',
		weaknesses JSONB DEFAULT '[]',
		total_learning_hours INTEGER DEFAULT 0,
		total_assessments INTEGER DEFAULT 0,
		average_assessment_score INTEGER,
		current_streak INTEGER DEFAULT 0,
		longest_streak INTEGER DEFAULT 0,
		last_activity_date DATE,
		difficulty_multiplier REAL DEFAULT 1.0,
		content_preferences JSONB,
		onboarding_completed BOOLEAN DEFAULT false,
		onboarding_completed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- adaptive_learning_path ----
	`CREATE TABLE adaptive_learning_path (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		profile_id UUID REFERENCES student_learning_profile(id) ON DELETE SET NULL,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT,
		description_fr TEXT,
		field TEXT NOT NULL,
		target_role TEXT,
		target_role_fr TEXT,
		target_skills JSONB DEFAULT '[]',
		target_level skill_assessment_level DEFAULT 'intermediate',
		estimated_duration TEXT,
		estimated_hours INTEGER,
		modules JSONB DEFAULT '[]',
		status adaptive_learning_path_status DEFAULT 'not_started',
		progress INTEGER DEFAULT 0,
		current_module_index INTEGER DEFAULT 0,
		completed_modules INTEGER DEFAULT 0,
		total_modules INTEGER DEFAULT 0,
		started_at TIMESTAMPTZ,
		target_completion_date TIMESTAMPTZ,
		completed_at TIMESTAMPTZ,
		last_accessed_at TIMESTAMPTZ,
		ai_generated BOOLEAN DEFAULT false,
		ai_analysis TEXT,
		generated_from_assessment UUID,
		is_primary BOOLEAN DEFAULT false,
		is_active BOOLEAN DEFAULT true,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- adaptive_learning_milestone ----
	`CREATE TABLE adaptive_learning_milestone (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		path_id UUID NOT NULL REFERENCES adaptive_learning_path(id) ON DELETE CASCADE,
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT,
		description_fr TEXT,
		"order" INTEGER NOT NULL DEFAULT 0,
		status learning_milestone_status DEFAULT 'locked',
		progress INTEGER DEFAULT 0,
		required_skills JSONB DEFAULT '[]',
		required_assessment_score INTEGER,
		assessment_id UUID,
		assessment_score INTEGER,
		xp_reward INTEGER DEFAULT 100,
		badge_reward TEXT,
		certificate_reward BOOLEAN DEFAULT false,
		target_date TIMESTAMPTZ,
		unlocked_at TIMESTAMPTZ,
		started_at TIMESTAMPTZ,
		completed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- adaptive_skill_assessment ----
	`CREATE TABLE adaptive_skill_assessment (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		profile_id UUID REFERENCES student_learning_profile(id) ON DELETE SET NULL,
		path_id UUID REFERENCES adaptive_learning_path(id) ON DELETE SET NULL,
		milestone_id UUID REFERENCES adaptive_learning_milestone(id) ON DELETE SET NULL,
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
	)`,

	// ---- adaptive_learning_recommendation ----
	`CREATE TABLE adaptive_learning_recommendation (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		profile_id UUID REFERENCES student_learning_profile(id) ON DELETE SET NULL,
		path_id UUID REFERENCES adaptive_learning_path(id) ON DELETE SET NULL,
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
		based_on_assessment UUID REFERENCES adaptive_skill_assessment(id) ON DELETE SET NULL,
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
	)`,

	// ---- ai_model_metrics ----
	`CREATE TABLE ai_model_metrics (
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
	)`,

	// ---- ai_feature_metrics ----
	`CREATE TABLE ai_feature_metrics (
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
	)`,

	// ---- ai_latency_log ----
	`CREATE TABLE ai_latency_log (
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
	)`,

	// ---- ai_error_log ----
	`CREATE TABLE ai_error_log (
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
	)`,

	// ---- ai_content_quality ----
	`CREATE TABLE ai_content_quality (
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
	)`,

	// ---- ai_performance_alert ----
	`CREATE TABLE ai_performance_alert (
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
	)`,

	// ---- cohort_analytics_metrics ----
	`CREATE TABLE cohort_analytics_metrics (
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
	)`,

	// ---- cohort_analytics_benchmark ----
	`CREATE TABLE cohort_analytics_benchmark (
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
	)`,

	// ---- learning_resource ---- (also recreated - had wrong columns TEXT id vs UUID)
	`CREATE TABLE learning_resource (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		title TEXT NOT NULL,
		title_fr TEXT,
		description TEXT NOT NULL,
		description_fr TEXT,
		resource_type learning_resource_type NOT NULL,
		difficulty learning_difficulty NOT NULL DEFAULT 'beginner',
		cost_type learning_cost_type NOT NULL DEFAULT 'free',
		price INTEGER,
		currency TEXT DEFAULT 'USD',
		platform TEXT,
		provider TEXT,
		url TEXT,
		thumbnail_url TEXT,
		duration_minutes INTEGER,
		duration_weeks INTEGER,
		skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
		prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
		target_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
		languages TEXT[] DEFAULT ARRAY['en'],
		rating REAL,
		total_ratings INTEGER DEFAULT 0,
		total_enrollments INTEGER DEFAULT 0,
		total_completions INTEGER DEFAULT 0,
		certification_awarded BOOLEAN DEFAULT false,
		certification_name TEXT,
		is_recommended BOOLEAN DEFAULT false,
		is_featured BOOLEAN DEFAULT false,
		is_active BOOLEAN DEFAULT true,
		tags TEXT[] DEFAULT ARRAY[]::TEXT[],
		metadata JSONB DEFAULT '{}',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- resource_completion ----
	`CREATE TABLE resource_completion (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		resource_id UUID NOT NULL REFERENCES learning_resource(id) ON DELETE CASCADE,
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
	)`,

	// ---- recommendation_history ----
	`CREATE TABLE recommendation_history (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		resource_id UUID NOT NULL REFERENCES learning_resource(id) ON DELETE CASCADE,
		reason recommendation_reason NOT NULL,
		reason_details TEXT,
		score REAL NOT NULL,
		rank INTEGER,
		skills_addressed TEXT[] DEFAULT ARRAY[]::TEXT[],
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
	)`,

	// ---- recommendation_feedback ----
	`CREATE TABLE recommendation_feedback (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
		recommendation_id UUID NOT NULL REFERENCES recommendation_history(id) ON DELETE CASCADE,
		feedback_type recommendation_feedback_type NOT NULL,
		rating INTEGER,
		comment TEXT,
		time_to_feedback INTEGER,
		engagement_duration INTEGER,
		was_useful BOOLEAN,
		metadata JSONB DEFAULT '{}',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE(user_id, recommendation_id)
	)`,

	// ---- learning_goal ----
	`CREATE TABLE learning_goal (
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
		skill_focus TEXT[] DEFAULT ARRAY[]::TEXT[],
		resource_ids UUID[] DEFAULT ARRAY[]::UUID[],
		streak_days INTEGER NOT NULL DEFAULT 0,
		best_streak INTEGER NOT NULL DEFAULT 0,
		completed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`,

	// ---- mentor_skill_match ----
	`CREATE TABLE mentor_skill_match (
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
	)`,

	// ---- learning_sequence ----
	`CREATE TABLE learning_sequence (
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
	)`,
];

// ============================================================================
// Main execution
// ============================================================================
async function main() {
	const client = new Client({ connectionString: DATABASE_URL });
	await client.connect();
	console.log("Connected to PostgreSQL");

	// Step 0: Count tables before
	const beforeCount = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log(`\nTables BEFORE: ${beforeCount.rows[0].cnt}`);

	// Step 1: Drop all 63 tables with CASCADE
	console.log("\n=== DROPPING 63 TABLES ===");
	const uniqueDrops = [...new Set(TABLES_TO_DROP)];
	for (const table of uniqueDrops) {
		try {
			await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
			console.log(`  Dropped: ${table}`);
		} catch (err) {
			console.error(`  ERROR dropping ${table}: ${err.message}`);
		}
	}

	// Step 1b: Count after drop
	const afterDropCount = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log(`\nTables after DROP: ${afterDropCount.rows[0].cnt}`);

	// Step 2: Create enums (if not exists)
	console.log("\n=== CREATING ENUMS ===");
	for (const sql of ENUM_CREATES) {
		try {
			await client.query(sql);
		} catch (err) {
			// Ignore duplicate enum errors
			if (!err.message.includes("already exists")) {
				console.error(`  Enum error: ${err.message}`);
			}
		}
	}
	console.log(`  Created/verified ${ENUM_CREATES.length} enums`);

	// Step 3: Create all 63 tables
	console.log("\n=== CREATING 63 TABLES ===");
	let successCount = 0;
	let failCount = 0;
	for (let i = 0; i < TABLE_CREATES.length; i++) {
		const sql = TABLE_CREATES[i];
		// Extract table name from CREATE TABLE statement
		const match = sql.match(/CREATE TABLE (\w+)/);
		const tableName = match ? match[1] : `table_${i}`;
		try {
			await client.query(sql);
			console.log(`  Created: ${tableName}`);
			successCount++;
		} catch (err) {
			console.error(`  ERROR creating ${tableName}: ${err.message}`);
			failCount++;
		}
	}

	// Step 4: Verify final count
	const afterCount = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log(`\n=== SUMMARY ===`);
	console.log(`Tables BEFORE: ${beforeCount.rows[0].cnt}`);
	console.log(`Tables AFTER:  ${afterCount.rows[0].cnt}`);
	console.log(`Created: ${successCount}, Failed: ${failCount}`);

	if (parseInt(afterCount.rows[0].cnt) !== 252) {
		console.error(`\nWARNING: Expected 252 tables but got ${afterCount.rows[0].cnt}`);
	} else {
		console.log(`\nSUCCESS: Table count is exactly 252 as expected!`);
	}

	// Step 5: Verify columns for a sample table (career_path)
	console.log("\n=== VERIFYING career_path COLUMNS ===");
	const cols = await client.query(
		"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'career_path' ORDER BY ordinal_position"
	);
	for (const col of cols.rows) {
		console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
	}

	await client.end();
	console.log("\nDone!");
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
