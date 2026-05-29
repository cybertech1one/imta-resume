/**
 * recreate-tables-fix.mjs
 *
 * Fixes the 8 tables that failed in the initial run:
 * 1. career_path - "current_role" is a PostgreSQL reserved keyword, needs quoting
 * 2. skill_gap_analysis - depends on career_path
 * 3. career_prediction - "current_role" and "current_field" are reserved keywords
 * 4. job_match_score - depends on career_prediction
 * 5. career_trajectory - depends on career_prediction
 * 6. learning_resource - NOT in original 63 list but has wrong columns (TEXT id vs UUID),
 *    which blocks resource_completion and recommendation_history FKs
 * 7. resource_completion - FK to learning_resource
 * 8. recommendation_history - FK to learning_resource
 * 9. recommendation_feedback - depends on recommendation_history
 */

import pg from "pg";
const { Client } = pg;

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

async function main() {
	const client = new Client({ connectionString: DATABASE_URL });
	await client.connect();
	console.log("Connected to PostgreSQL");

	const beforeCount = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log(`Tables BEFORE: ${beforeCount.rows[0].cnt}`);

	// Drop all tables that need fixing (in dependency order)
	const toDrop = [
		"recommendation_feedback",
		"recommendation_history",
		"resource_completion",
		"learning_resource",
		"skill_gap_analysis",
		"career_path",
		"career_trajectory",
		"job_match_score",
		"career_prediction",
	];

	console.log("\n=== DROPPING TABLES ===");
	for (const t of toDrop) {
		try {
			await client.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
			console.log(`  Dropped: ${t}`);
		} catch (err) {
			console.error(`  Error dropping ${t}: ${err.message}`);
		}
	}

	// Create enums needed
	const enums = [
		`DO $$ BEGIN CREATE TYPE learning_resource_type AS ENUM ('course','tutorial','certification','video','article','book','workshop','webinar','practice','mentorship'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE learning_difficulty AS ENUM ('beginner','intermediate','advanced','expert'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE learning_cost_type AS ENUM ('free','paid','subscription','freemium'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE completion_status AS ENUM ('not_started','in_progress','completed','paused','dropped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE recommendation_reason AS ENUM ('skill_gap','career_goal','trending','peer_popularity','mentor_suggested','completion_pattern','personalized_ai','curated','new_release'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE recommendation_feedback_type AS ENUM ('helpful','not_helpful','too_easy','too_hard','not_relevant','already_know','will_try_later','enrolled','completed','dismissed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
		`DO $$ BEGIN CREATE TYPE career_prediction_status AS ENUM ('pending','processing','completed','failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
	];

	for (const sql of enums) {
		try { await client.query(sql); } catch (err) { /* ignore */ }
	}
	console.log("  Enums verified");

	// Create tables in correct order with reserved word quoting
	console.log("\n=== CREATING TABLES ===");

	const creates = [
		// career_path - quote current_role and current_field (reserved words)
		{
			name: "career_path",
			sql: `CREATE TABLE career_path (
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
		},
		// skill_gap_analysis
		{
			name: "skill_gap_analysis",
			sql: `CREATE TABLE skill_gap_analysis (
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
		},
		// career_prediction - quote reserved words
		{
			name: "career_prediction",
			sql: `CREATE TABLE career_prediction (
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
		},
		// job_match_score
		{
			name: "job_match_score",
			sql: `CREATE TABLE job_match_score (
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
		},
		// career_trajectory
		{
			name: "career_trajectory",
			sql: `CREATE TABLE career_trajectory (
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
		},
		// learning_resource - recreated with correct schema (UUID id, correct columns)
		{
			name: "learning_resource",
			sql: `CREATE TABLE learning_resource (
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
		},
		// resource_completion
		{
			name: "resource_completion",
			sql: `CREATE TABLE resource_completion (
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
		},
		// recommendation_history
		{
			name: "recommendation_history",
			sql: `CREATE TABLE recommendation_history (
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
		},
		// recommendation_feedback
		{
			name: "recommendation_feedback",
			sql: `CREATE TABLE recommendation_feedback (
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
		},
	];

	let successCount = 0;
	let failCount = 0;

	for (const { name, sql } of creates) {
		try {
			await client.query(sql);
			console.log(`  Created: ${name}`);
			successCount++;
		} catch (err) {
			console.error(`  ERROR creating ${name}: ${err.message}`);
			failCount++;
		}
	}

	// Final count
	const afterCount = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log(`\n=== SUMMARY ===`);
	console.log(`Tables BEFORE fix: ${beforeCount.rows[0].cnt}`);
	console.log(`Tables AFTER fix:  ${afterCount.rows[0].cnt}`);
	console.log(`Created: ${successCount}, Failed: ${failCount}`);

	if (parseInt(afterCount.rows[0].cnt) !== 252) {
		console.error(`WARNING: Expected 252 but got ${afterCount.rows[0].cnt}`);
		// Check which of our target tables exist
		const all64 = [...toDrop];
		const check = await client.query(
			"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])",
			[all64]
		);
		const existing = new Set(check.rows.map((r) => r.table_name));
		const missing = all64.filter((t) => !existing.has(t));
		if (missing.length > 0) {
			console.log("Missing tables:", missing);
		}
	} else {
		console.log("SUCCESS: Table count is exactly 252!");
	}

	// Verify career_path columns
	console.log("\n=== VERIFYING career_path COLUMNS ===");
	const cols = await client.query(
		"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'career_path' ORDER BY ordinal_position"
	);
	for (const col of cols.rows) {
		console.log(`  ${col.column_name}: ${col.data_type}`);
	}

	// Verify career_prediction columns
	console.log("\n=== VERIFYING career_prediction COLUMNS ===");
	const cols2 = await client.query(
		"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'career_prediction' ORDER BY ordinal_position"
	);
	for (const col of cols2.rows) {
		console.log(`  ${col.column_name}: ${col.data_type}`);
	}

	// Verify learning_resource columns
	console.log("\n=== VERIFYING learning_resource COLUMNS ===");
	const cols3 = await client.query(
		"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'learning_resource' ORDER BY ordinal_position"
	);
	for (const col of cols3.rows) {
		console.log(`  ${col.column_name}: ${col.data_type}`);
	}

	await client.end();
	console.log("\nDone!");
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
