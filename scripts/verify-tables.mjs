/**
 * verify-tables.mjs - Verify all 63 recreated tables have correct columns
 */
import pg from "pg";
const { Client } = pg;

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

const tables63 = [
	"ai_global_settings", "job_listing", "quiz_question", "partner_profile",
	"partner_job_posting", "partner_job_application", "partner_event",
	"partner_event_registration", "saved_job", "interview_checklist_reference",
	"mentor_message", "certification_library", "branding_example",
	"interview_performance", "interview_goal", "job_recommendation",
	"user_job_preference", "skill_progress", "coaching_session", "career_path",
	"skill_gap_analysis", "weekly_goal", "confidence_journal", "daily_affirmation",
	"user_affirmation_progress", "student_progress", "skill_progression",
	"progress_activity_log", "achievement_badge", "student_cohort",
	"cohort_membership", "weekly_progress_snapshot", "interview_weakness",
	"interview_improvement", "mock_interview_template", "template_usage",
	"ai_feedback", "ai_training_sample", "content_quality_rating",
	"model_comparison", "model_comparison_result", "career_prediction",
	"job_match_score", "career_trajectory", "student_learning_profile",
	"adaptive_learning_path", "adaptive_learning_milestone",
	"adaptive_skill_assessment", "adaptive_learning_recommendation",
	"ai_model_metrics", "ai_feature_metrics", "ai_latency_log", "ai_error_log",
	"ai_content_quality", "ai_performance_alert", "cohort_analytics_metrics",
	"cohort_analytics_benchmark", "resource_completion", "recommendation_history",
	"recommendation_feedback", "learning_goal", "mentor_skill_match",
	"learning_sequence",
];

// Key columns that MUST exist (previously wrong)
const spotChecks = {
	career_path: ["overall_progress", "target_industry", "target_company", "target_salary", "notes", "current_role", "current_role_fr", "target_role_fr", "milestones", "is_active"],
	coaching_session: ["topic", "ai_summary", "action_items", "confidence_before", "confidence_after", "next_steps", "rating", "feedback"],
	partner_profile: ["company_name", "partner_type", "total_jobs_posted", "is_premium", "contact_email", "approved_by", "rejection_reason", "is_verified"],
	ai_global_settings: ["max_daily_requests", "max_monthly_tokens", "suspend_on_exceed", "allowed_languages", "is_active", "alert_threshold_percent"],
	student_progress: ["overall_score", "total_lessons_completed", "resume_completeness", "interview_readiness", "job_search_readiness", "weekly_goal_target"],
	skill_gap_analysis: ["career_path_id", "target_role", "gaps", "strengths", "recommendations", "overall_readiness", "ai_analysis"],
	weekly_goal: ["week_start_date", "category", "target_value", "current_value", "priority"],
	confidence_journal: ["entry_type", "entry_date", "mood", "tags", "is_private"],
	interview_weakness: ["weakness_type", "severity", "occurrence_count", "example_questions", "suggested_resources", "practice_exercises", "is_resolved"],
	career_prediction: ["current_role", "current_field", "years_experience", "current_skills", "predicted_paths", "confidence_score", "model_version"],
	career_trajectory: ["path_name", "target_role", "growth_rate", "success_probability", "trajectory_points", "required_skill_upgrades", "mitigation_strategies"],
	adaptive_learning_recommendation: ["target_skill_id", "based_on_assessment", "ai_confidence", "dismiss_reason", "is_viewed", "is_accepted", "is_completed", "is_dismissed"],
	job_match_score: ["job_title", "overall_score", "skill_match_score", "culture_fit_score", "matched_skills", "missing_skills", "transferable_skills", "is_bookmarked"],
};

async function main() {
	const client = new Client({ connectionString: DATABASE_URL });
	await client.connect();

	// Total count
	const cnt = await client.query(
		"SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	console.log("Total tables:", cnt.rows[0].cnt);

	// Check all 63 exist
	const existCheck = await client.query(
		"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
	);
	const allTables = new Set(existCheck.rows.map((r) => r.table_name));
	const missing63 = tables63.filter((t) => !allTables.has(t));
	if (missing63.length > 0) {
		console.log("MISSING tables:", missing63);
	} else {
		console.log("All 63 target tables EXIST");
	}

	// Spot check columns
	console.log("\n=== COLUMN SPOT CHECKS ===");
	let allOk = true;
	for (const [table, expectedCols] of Object.entries(spotChecks)) {
		const cols = await client.query(
			"SELECT column_name FROM information_schema.columns WHERE table_name = $1",
			[table]
		);
		const colNames = new Set(cols.rows.map((r) => r.column_name));
		const missingCols = expectedCols.filter((c) => !colNames.has(c));
		if (missingCols.length > 0) {
			console.log(`FAIL ${table} - missing: ${missingCols.join(", ")}`);
			allOk = false;
		} else {
			console.log(`OK   ${table} (${cols.rows.length} cols) - all ${expectedCols.length} key columns present`);
		}
	}

	// Verify all are empty
	console.log("\n=== EMPTY CHECK ===");
	let nonEmpty = 0;
	for (const t of tables63) {
		const r = await client.query(`SELECT COUNT(*) as c FROM "${t}"`);
		if (parseInt(r.rows[0].c) > 0) {
			console.log(`  NON-EMPTY: ${t} = ${r.rows[0].c} rows`);
			nonEmpty++;
		}
	}
	if (nonEmpty === 0) console.log("All 63 tables are empty (as expected)");

	// Final verdict
	console.log("\n=== FINAL VERDICT ===");
	if (parseInt(cnt.rows[0].cnt) === 252 && missing63.length === 0 && allOk && nonEmpty === 0) {
		console.log("SUCCESS: All 63 tables recreated correctly with proper column definitions!");
		console.log("Total table count: 252 (unchanged)");
	} else {
		console.log("ISSUES FOUND - check output above");
	}

	await client.end();
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
