/**
 * Database Integrity Check Script
 * Connects to PostgreSQL and validates data integrity
 * NOTE: PostgreSQL uses snake_case columns, not camelCase
 */

import pg from "pg";
const { Client } = pg;

const client = new Client({
	connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

const results = [];
let passed = 0;
let failed = 0;
let warnings = 0;

function log(status, name, detail = "") {
	const icon =
		status === "PASS"
			? "\x1b[32m✓\x1b[0m"
			: status === "FAIL"
				? "\x1b[31m✗\x1b[0m"
				: "\x1b[33m⚠\x1b[0m";
	const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else warnings++;
}

async function query(sql, params = []) {
	const res = await client.query(sql, params);
	return res.rows;
}

async function queryOne(sql, params = []) {
	const rows = await query(sql, params);
	return rows[0];
}

async function main() {
	await client.connect();
	console.log(
		"\x1b[1m\x1b[36m╔══════════════════════════════════════════╗\x1b[0m",
	);
	console.log(
		"\x1b[1m\x1b[36m║   Database Integrity & Health Checks     ║\x1b[0m",
	);
	console.log(
		"\x1b[1m\x1b[36m╚══════════════════════════════════════════╝\x1b[0m",
	);

	// ============================================================
	// 1. TABLE ROW COUNTS
	// ============================================================
	console.log("\n\x1b[1m=== TABLE ROW COUNTS ===\x1b[0m");

	const keyTables = [
		["user", 1, "Core users"],
		["resume", 1, "Resumes"],
		["session", 1, "Active sessions"],
		["account", 1, "Auth accounts"],
		["verification", 0, "Verification tokens"],
		["ai_provider_config", 1, "AI provider configs"],
		["ai_usage_log", 0, "AI usage logs"],
		["ai_usage_quota", 0, "AI quota plans"],
		["user_ai_quota", 0, "User quota assignments"],
		["notification", 0, "Notifications"],
		["interview_session", 0, "Interview sessions"],
		["interview_analysis", 0, "Interview analyses"],
		["interview_tip_favorite", 0, "Interview tip favorites"],
		["question_bank_favorite", 0, "Question bank favorites"],
		["resume_statistics", 0, "Resume view/download stats"],
		["imta_program", 1, "IMTA programs"],
		["interview_tip", 1, "Interview tips"],
		["interview_common_question", 1, "Common interview questions"],
		["career_market_insight", 1, "Market insights"],
		["career_employer", 1, "Employers"],
		["skill_library", 1, "Skills library"],
		["job_application", 0, "Job applications"],
		["job_deadline", 0, "Job deadlines"],
		["scheduled_interview", 0, "Scheduled interviews"],
		["journal_entry", 0, "Journal entries"],
		["salary_record", 0, "Salary records"],
		["work_sample_project", 0, "Work sample projects"],
		["user_achievement", 0, "User achievements"],
		["achievement_definition", 0, "Achievement definitions"],
		["career_goal", 0, "Career goals"],
		["user_activity", 0, "User activities"],
		["networking_contact", 0, "Networking contacts"],
		["ai_mentor_template", 1, "AI mentor templates"],
		["user_ai_mentor", 0, "User AI mentors"],
		["user_mentor_onboarding", 0, "Mentor onboarding"],
		["career_quiz_question", 0, "Quiz questions"],
		["user_quiz_result", 0, "Quiz results"],
	];

	const tableCounts = {};
	for (const [table, minExpected, label] of keyTables) {
		try {
			const row = await queryOne(`SELECT count(*)::int as cnt FROM "${table}"`);
			tableCounts[table] = row.cnt;
			if (row.cnt >= minExpected) {
				log("PASS", `${label} (${table})`, `${row.cnt} rows`);
			} else if (minExpected > 0 && row.cnt === 0) {
				log("FAIL", `${label} (${table})`, `0 rows (expected >= ${minExpected})`);
			} else {
				log("PASS", `${label} (${table})`, `${row.cnt} rows`);
			}
		} catch (e) {
			log("FAIL", `${label} (${table})`, `TABLE NOT FOUND: ${e.message.split("\n")[0]}`);
		}
	}

	// ============================================================
	// 2. ALL TABLES WITH 0 ROWS
	// ============================================================
	console.log("\n\x1b[1m=== TABLES WITH 0 ROWS ===\x1b[0m");

	const allTables = await query(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

	const emptyTables = [];
	const nonEmptyTables = [];
	for (const { tablename } of allTables) {
		try {
			const row = await queryOne(
				`SELECT count(*)::int as cnt FROM "${tablename}"`,
			);
			if (row.cnt === 0) {
				emptyTables.push(tablename);
			} else {
				nonEmptyTables.push({ name: tablename, count: row.cnt });
			}
		} catch (e) {
			// skip
		}
	}

	console.log(`  Total tables: ${allTables.length}`);
	console.log(`  Non-empty tables: ${nonEmptyTables.length}`);
	console.log(`  Empty tables: ${emptyTables.length}`);

	console.log("\n  Non-empty tables with row counts:");
	for (const { name, count } of nonEmptyTables.sort((a, b) => b.count - a.count)) {
		console.log(`    ${name}: ${count} rows`);
	}

	if (emptyTables.length > 0) {
		console.log(`\n  \x1b[33mEmpty tables (${emptyTables.length}):\x1b[0m`);
		// Group by prefix for readability
		const grouped = {};
		for (const t of emptyTables) {
			const prefix = t.split("_")[0];
			if (!grouped[prefix]) grouped[prefix] = [];
			grouped[prefix].push(t);
		}
		for (const [prefix, tables] of Object.entries(grouped).sort()) {
			console.log(`    [${prefix}] ${tables.join(", ")}`);
		}
	}

	// ============================================================
	// 3. ORPHAN CHECKS
	// ============================================================
	console.log("\n\x1b[1m=== ORPHAN RECORD CHECKS ===\x1b[0m");

	// Resumes with no matching user
	try {
		const orphanResumes = await query(`
      SELECT r.id, r.user_id
      FROM resume r
      LEFT JOIN "user" u ON r.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanResumes.length === 0) {
			log("PASS", "Resumes orphan check", "No orphaned resumes");
		} else {
			log(
				"FAIL",
				"Resumes orphan check",
				`${orphanResumes.length} orphaned resumes: ${orphanResumes.map((r) => r.id).join(", ")}`,
			);
		}
	} catch (e) {
		log("FAIL", "Resumes orphan check", e.message.split("\n")[0]);
	}

	// Sessions with no matching user
	try {
		const orphanSessions = await query(`
      SELECT s.id, s.user_id
      FROM session s
      LEFT JOIN "user" u ON s.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanSessions.length === 0) {
			log("PASS", "Sessions orphan check", "No orphaned sessions");
		} else {
			log(
				"FAIL",
				"Sessions orphan check",
				`${orphanSessions.length} orphaned sessions`,
			);
		}
	} catch (e) {
		log("FAIL", "Sessions orphan check", e.message.split("\n")[0]);
	}

	// Accounts with no matching user
	try {
		const orphanAccounts = await query(`
      SELECT a.id, a.user_id
      FROM account a
      LEFT JOIN "user" u ON a.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanAccounts.length === 0) {
			log("PASS", "Accounts orphan check", "No orphaned accounts");
		} else {
			log(
				"FAIL",
				"Accounts orphan check",
				`${orphanAccounts.length} orphaned accounts`,
			);
		}
	} catch (e) {
		log("FAIL", "Accounts orphan check", e.message.split("\n")[0]);
	}

	// AI usage logs with no matching user
	try {
		const orphanLogs = await query(`
      SELECT l.id, l.user_id
      FROM ai_usage_log l
      LEFT JOIN "user" u ON l.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanLogs.length === 0) {
			log("PASS", "AI usage logs orphan check", "No orphaned AI usage logs");
		} else {
			log(
				"FAIL",
				"AI usage logs orphan check",
				`${orphanLogs.length} orphaned logs`,
			);
		}
	} catch (e) {
		log("FAIL", "AI usage logs orphan check", e.message.split("\n")[0]);
	}

	// Notifications with no matching user
	try {
		const orphanNotifs = await query(`
      SELECT n.id, n.user_id
      FROM notification n
      LEFT JOIN "user" u ON n.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanNotifs.length === 0) {
			log("PASS", "Notifications orphan check", "No orphaned notifications");
		} else {
			log(
				"FAIL",
				"Notifications orphan check",
				`${orphanNotifs.length} orphaned notifications`,
			);
		}
	} catch (e) {
		log("FAIL", "Notifications orphan check", e.message.split("\n")[0]);
	}

	// Interview sessions with no matching user
	try {
		const orphanInterviews = await query(`
      SELECT i.id, i.user_id
      FROM interview_session i
      LEFT JOIN "user" u ON i.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanInterviews.length === 0) {
			log(
				"PASS",
				"Interview sessions orphan check",
				"No orphaned interview sessions",
			);
		} else {
			log(
				"FAIL",
				"Interview sessions orphan check",
				`${orphanInterviews.length} orphaned sessions`,
			);
		}
	} catch (e) {
		log("FAIL", "Interview sessions orphan check", e.message.split("\n")[0]);
	}

	// User AI mentors with no matching user
	try {
		const orphanMentors = await query(`
      SELECT m.id, m.user_id
      FROM user_ai_mentor m
      LEFT JOIN "user" u ON m.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanMentors.length === 0) {
			log("PASS", "User AI mentors orphan check", "No orphaned user mentors");
		} else {
			log(
				"FAIL",
				"User AI mentors orphan check",
				`${orphanMentors.length} orphaned mentors`,
			);
		}
	} catch (e) {
		log("FAIL", "User AI mentors orphan check", e.message.split("\n")[0]);
	}

	// Job applications with no matching user
	try {
		const orphanApps = await query(`
      SELECT j.id, j.user_id
      FROM job_application j
      LEFT JOIN "user" u ON j.user_id = u.id
      WHERE u.id IS NULL
    `);
		if (orphanApps.length === 0) {
			log("PASS", "Job applications orphan check", "No orphaned job applications");
		} else {
			log(
				"FAIL",
				"Job applications orphan check",
				`${orphanApps.length} orphaned applications`,
			);
		}
	} catch (e) {
		log("FAIL", "Job applications orphan check", e.message.split("\n")[0]);
	}

	// ============================================================
	// 4. AI PROVIDER CONFIG VALIDATION
	// ============================================================
	console.log("\n\x1b[1m=== AI PROVIDER CONFIG VALIDATION ===\x1b[0m");

	try {
		const providers = await query(
			`SELECT id, provider, display_name, model, is_default, is_enabled, base_url FROM ai_provider_config ORDER BY is_default DESC`,
		);

		if (providers.length === 0) {
			log("FAIL", "AI providers exist", "No AI providers configured");
		} else {
			log("PASS", "AI providers exist", `${providers.length} providers found`);

			// Check for default provider
			const defaults = providers.filter((p) => p.is_default);
			if (defaults.length === 1) {
				log(
					"PASS",
					"Single default provider",
					`${defaults[0].display_name} (${defaults[0].provider}/${defaults[0].model})`,
				);
			} else if (defaults.length === 0) {
				log("FAIL", "Default provider", "No default provider set!");
			} else {
				log(
					"WARN",
					"Default provider",
					`${defaults.length} defaults found (should be 1)`,
				);
			}

			// Check all providers have API keys
			const providersWithKeys = await query(
				`SELECT id, provider, display_name, api_key IS NOT NULL AND api_key != '' as has_key FROM ai_provider_config`,
			);
			for (const p of providersWithKeys) {
				if (p.has_key) {
					log(
						"PASS",
						`Provider ${p.display_name} has API key`,
						"Key present",
					);
				} else {
					log(
						"FAIL",
						`Provider ${p.display_name} has API key`,
						"MISSING API KEY",
					);
				}
			}

			// Check enabled status
			const enabledProviders = providers.filter((p) => p.is_enabled);
			log(
				"PASS",
				"Enabled providers",
				`${enabledProviders.length}/${providers.length} enabled`,
			);

			// Log each provider
			console.log("\n  Provider details:");
			for (const p of providers) {
				console.log(
					`    ${p.is_default ? "★" : "○"} ${p.display_name} — provider=${p.provider}, model=${p.model}, enabled=${p.is_enabled}${p.base_url ? `, baseUrl=${p.base_url}` : ""}`,
				);
			}
		}
	} catch (e) {
		log("FAIL", "AI provider config", e.message.split("\n")[0]);
	}

	// DeepSeek default check
	try {
		const deepseek = await queryOne(
			`SELECT * FROM ai_provider_config WHERE provider = 'deepseek' AND is_default = true`,
		);
		if (deepseek) {
			log(
				"PASS",
				"DeepSeek is default",
				`model=${deepseek.model}, enabled=${deepseek.is_enabled}`,
			);
		} else {
			log("WARN", "DeepSeek is default", "DeepSeek is NOT the default provider");
		}
	} catch (e) {
		log("FAIL", "DeepSeek default check", e.message.split("\n")[0]);
	}

	// Gemini for file parsing check
	try {
		const gemini = await queryOne(
			`SELECT * FROM ai_provider_config WHERE provider = 'gemini' OR display_name ILIKE '%gemini%' OR display_name ILIKE '%google%'`,
		);
		if (gemini) {
			log(
				"PASS",
				"Gemini/Google configured",
				`provider=${gemini.provider}, model=${gemini.model}, enabled=${gemini.is_enabled}`,
			);
		} else {
			log(
				"WARN",
				"Gemini/Google configured",
				"No Google/Gemini provider found (needed for file parsing)",
			);
		}
	} catch (e) {
		log("FAIL", "Gemini check", e.message.split("\n")[0]);
	}

	// ============================================================
	// 5. USER INTEGRITY
	// ============================================================
	console.log("\n\x1b[1m=== USER INTEGRITY ===\x1b[0m");

	try {
		const users = await query(
			`SELECT id, name, email, role, created_at FROM "user" ORDER BY created_at`,
		);
		log("PASS", "Users table", `${users.length} users`);

		// Check for required test accounts
		const testAccounts = [
			"admin@test.com",
			"student1@test.com",
			"student2@test.com",
			"partner@test.com",
		];
		for (const email of testAccounts) {
			const user = users.find((u) => u.email === email);
			if (user) {
				log("PASS", `Test account ${email}`, `role=${user.role}, id=${user.id}`);
			} else {
				log("FAIL", `Test account ${email}`, "NOT FOUND");
			}
		}

		// Check for users without emails
		const noEmail = users.filter((u) => !u.email);
		if (noEmail.length === 0) {
			log("PASS", "All users have email", "No null emails");
		} else {
			log(
				"FAIL",
				"Users without email",
				`${noEmail.length} users: ${noEmail.map((u) => u.id).join(", ")}`,
			);
		}

		// Check admin exists
		const admins = users.filter((u) => u.role === "admin");
		log("PASS", "Admin users", `${admins.length} admins: ${admins.map((u) => u.email).join(", ")}`);

		// List all users
		console.log("\n  All users:");
		for (const u of users) {
			console.log(`    ${u.email} — role=${u.role}, name=${u.name}, created=${u.created_at}`);
		}
	} catch (e) {
		log("FAIL", "User integrity", e.message.split("\n")[0]);
	}

	// ============================================================
	// 6. NULL VALUE CHECKS IN REQUIRED COLUMNS
	// ============================================================
	console.log("\n\x1b[1m=== NULL VALUE CHECKS (REQUIRED COLUMNS) ===\x1b[0m");

	const nullChecks = [
		["user", "email", "Users without email"],
		["user", "name", "Users without name"],
		["resume", "user_id", "Resumes without user_id"],
		["resume", "name", "Resumes without name"],
		["resume", "slug", "Resumes without slug"],
		["session", "user_id", "Sessions without user_id"],
		["session", "token", "Sessions without token"],
		["account", "user_id", "Accounts without user_id"],
		["ai_provider_config", "provider", "AI configs without provider"],
		["ai_provider_config", "api_key", "AI configs without API key"],
		["ai_provider_config", "model", "AI configs without model"],
		["notification", "user_id", "Notifications without user_id"],
		["notification", "type", "Notifications without type"],
		["imta_program", "name", "Programs without name"],
		["interview_tip", "title", "Tips without title"],
		["skill_library", "name", "Skills without name"],
		["ai_usage_log", "user_id", "AI logs without user_id"],
		["ai_usage_log", "feature", "AI logs without feature"],
		["ai_usage_log", "status", "AI logs without status"],
	];

	for (const [table, column, label] of nullChecks) {
		try {
			const row = await queryOne(
				`SELECT count(*)::int as cnt FROM "${table}" WHERE "${column}" IS NULL`,
			);
			if (row.cnt === 0) {
				log("PASS", label, "0 nulls");
			} else {
				log("FAIL", label, `${row.cnt} null values found`);
			}
		} catch (e) {
			log("WARN", label, `Could not check: ${e.message.split("\n")[0]}`);
		}
	}

	// ============================================================
	// 7. RESUME DATA INTEGRITY
	// ============================================================
	console.log("\n\x1b[1m=== RESUME DATA INTEGRITY ===\x1b[0m");

	try {
		const resumeCount = await queryOne(
			`SELECT count(*)::int as cnt FROM resume`,
		);
		log("PASS", "Total resumes", `${resumeCount.cnt} resumes`);

		// Check for resumes with empty/null data
		const emptyDataResumes = await query(
			`SELECT id, name FROM resume WHERE data IS NULL OR data::text = '{}'`,
		);
		if (emptyDataResumes.length === 0) {
			log("PASS", "Resume data check", "All resumes have data");
		} else {
			log(
				"WARN",
				"Resumes with empty data",
				`${emptyDataResumes.length}: ${emptyDataResumes.map((r) => r.name).join(", ")}`,
			);
		}

		// Check duplicate slugs per user
		const dupSlugs = await query(`
      SELECT user_id, slug, count(*)::int as cnt
      FROM resume
      GROUP BY user_id, slug
      HAVING count(*) > 1
    `);
		if (dupSlugs.length === 0) {
			log("PASS", "Unique slugs per user", "No duplicate slugs");
		} else {
			log(
				"FAIL",
				"Duplicate slugs",
				`${dupSlugs.length} duplicate slug groups: ${dupSlugs.map(d => `${d.slug}(${d.cnt})`).join(", ")}`,
			);
		}

		// Check resumes per user distribution
		const resumesPerUser = await query(`
      SELECT u.email, count(r.id)::int as cnt
      FROM "user" u
      LEFT JOIN resume r ON u.id = r.user_id
      GROUP BY u.email
      ORDER BY cnt DESC
    `);
		console.log("\n  Resumes per user:");
		for (const { email, cnt } of resumesPerUser) {
			console.log(`    ${email}: ${cnt} resumes`);
		}
	} catch (e) {
		log("FAIL", "Resume data integrity", e.message.split("\n")[0]);
	}

	// ============================================================
	// 8. SESSION HEALTH
	// ============================================================
	console.log("\n\x1b[1m=== SESSION HEALTH ===\x1b[0m");

	try {
		const totalSessions = await queryOne(
			`SELECT count(*)::int as cnt FROM session`,
		);
		log("PASS", "Total sessions", `${totalSessions.cnt} sessions`);

		// Expired sessions
		const expiredSessions = await queryOne(
			`SELECT count(*)::int as cnt FROM session WHERE expires_at < NOW()`,
		);
		if (expiredSessions.cnt === 0) {
			log("PASS", "Expired sessions", "None");
		} else {
			log(
				"WARN",
				"Expired sessions",
				`${expiredSessions.cnt} expired sessions still in DB (should be cleaned up)`,
			);
		}

		// Sessions per user
		const sessionsPerUser = await query(`
      SELECT u.email, count(s.id)::int as cnt
      FROM session s
      JOIN "user" u ON s.user_id = u.id
      GROUP BY u.email
      ORDER BY cnt DESC
      LIMIT 10
    `);
		console.log("  Sessions per user:");
		for (const { email, cnt } of sessionsPerUser) {
			console.log(`    ${email}: ${cnt} sessions`);
		}
	} catch (e) {
		log("FAIL", "Session health", e.message.split("\n")[0]);
	}

	// ============================================================
	// 9. AI USAGE STATISTICS
	// ============================================================
	console.log("\n\x1b[1m=== AI USAGE STATISTICS ===\x1b[0m");

	try {
		const totalLogs = await queryOne(
			`SELECT count(*)::int as cnt FROM ai_usage_log`,
		);
		log("PASS", "Total AI usage logs", `${totalLogs.cnt} logs`);

		if (totalLogs.cnt > 0) {
			// By status
			const byStatus = await query(`
        SELECT status, count(*)::int as cnt
        FROM ai_usage_log
        GROUP BY status
        ORDER BY cnt DESC
      `);
			console.log("  By status:");
			for (const { status, cnt } of byStatus) {
				console.log(`    ${status}: ${cnt}`);
			}

			// By feature
			const byFeature = await query(`
        SELECT feature, count(*)::int as cnt,
               COALESCE(sum(total_tokens), 0)::bigint as tokens
        FROM ai_usage_log
        GROUP BY feature
        ORDER BY cnt DESC
      `);
			console.log("  By feature:");
			for (const { feature, cnt, tokens } of byFeature) {
				console.log(`    ${feature}: ${cnt} calls, ${tokens} tokens`);
			}

			// Token statistics
			const tokenStats = await queryOne(`
        SELECT
          sum(input_tokens)::bigint as total_input,
          sum(output_tokens)::bigint as total_output,
          sum(total_tokens)::bigint as grand_total,
          avg(duration_ms)::int as avg_duration
        FROM ai_usage_log
        WHERE status = 'success'
      `);
			if (tokenStats) {
				console.log(`  Token totals: input=${tokenStats.total_input}, output=${tokenStats.total_output}, total=${tokenStats.grand_total}`);
				console.log(`  Average duration: ${tokenStats.avg_duration}ms`);
			}

			// Error logs
			const errors = await query(`
        SELECT feature, error_message, created_at
        FROM ai_usage_log
        WHERE status = 'error'
        ORDER BY created_at DESC
        LIMIT 5
      `);
			if (errors.length > 0) {
				console.log("  Recent errors:");
				for (const { feature, error_message, created_at } of errors) {
					console.log(
						`    ${created_at}: ${feature} — ${(error_message || "").slice(0, 120)}`,
					);
				}
			}

			// Quota exceeded logs
			const quotaExceeded = await query(`
        SELECT feature, user_id, created_at
        FROM ai_usage_log
        WHERE status = 'quota_exceeded'
        ORDER BY created_at DESC
        LIMIT 5
      `);
			if (quotaExceeded.length > 0) {
				console.log("  Recent quota exceeded:");
				for (const { feature, user_id, created_at } of quotaExceeded) {
					console.log(`    ${created_at}: ${feature} by user ${user_id}`);
				}
			}
		}
	} catch (e) {
		log("FAIL", "AI usage statistics", e.message.split("\n")[0]);
	}

	// ============================================================
	// 10. REFERENCE DATA COMPLETENESS
	// ============================================================
	console.log("\n\x1b[1m=== REFERENCE DATA COMPLETENESS ===\x1b[0m");

	const refTables = [
		["imta_program", 7, "IMTA programs"],
		["interview_tip", 8, "Interview tips"],
		["interview_common_question", 6, "Common interview questions"],
		["career_market_insight", 4, "Market insights"],
		["career_employer", 3, "Employers"],
		["skill_library", 10, "Skill library entries"],
	];

	for (const [table, minExpected, label] of refTables) {
		try {
			const row = await queryOne(
				`SELECT count(*)::int as cnt FROM "${table}"`,
			);
			if (row.cnt >= minExpected) {
				log("PASS", label, `${row.cnt} rows (expected >= ${minExpected})`);
			} else {
				log(
					"WARN",
					label,
					`Only ${row.cnt} rows (expected >= ${minExpected})`,
				);
			}

			// Check active vs inactive
			try {
				const active = await queryOne(
					`SELECT count(*)::int as cnt FROM "${table}" WHERE is_active = true`,
				);
				const inactive = row.cnt - active.cnt;
				if (inactive > 0) {
					console.log(`    Active: ${active.cnt}, Inactive: ${inactive}`);
				}
			} catch {
				// is_active column might not exist
			}
		} catch (e) {
			log("FAIL", label, e.message.split("\n")[0]);
		}
	}

	// ============================================================
	// 11. INDEX CHECK
	// ============================================================
	console.log("\n\x1b[1m=== INDEX HEALTH ===\x1b[0m");

	try {
		const indexes = await query(`
      SELECT
        schemaname, tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
		log("PASS", "Total indexes", `${indexes.length} indexes in public schema`);

		// Check for tables without indexes (only non-empty tables)
		const tablesWithoutIdx = await query(`
      SELECT t.tablename
      FROM pg_tables t
      LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND i.schemaname = 'public'
      WHERE t.schemaname = 'public'
      AND i.indexname IS NULL
      ORDER BY t.tablename
    `);
		if (tablesWithoutIdx.length === 0) {
			log("PASS", "All tables have indexes", "No unindexed tables");
		} else {
			log(
				"WARN",
				"Tables without indexes",
				`${tablesWithoutIdx.length}: ${tablesWithoutIdx.map((t) => t.tablename).join(", ")}`,
			);
		}
	} catch (e) {
		log("FAIL", "Index check", e.message.split("\n")[0]);
	}

	// ============================================================
	// 12. DATA CONSISTENCY CHECKS
	// ============================================================
	console.log("\n\x1b[1m=== DATA CONSISTENCY ===\x1b[0m");

	// Check AI quota plan exists
	try {
		const quotas = await query(`SELECT * FROM ai_usage_quota`);
		if (quotas.length > 0) {
			log("PASS", "AI quota plans", `${quotas.length} plans defined`);
			for (const q of quotas) {
				console.log(`    Plan: ${q.name || q.id} — daily_request_limit=${q.daily_request_limit}, monthly_request_limit=${q.monthly_request_limit}`);
			}
		} else {
			log("WARN", "AI quota plans", "No quota plans defined (unlimited access for all)");
		}
	} catch (e) {
		log("FAIL", "AI quota plans", e.message.split("\n")[0]);
	}

	// Check notification counts per user
	try {
		const notifCounts = await query(`
      SELECT u.email, count(n.id)::int as total,
             count(CASE WHEN n.read = false THEN 1 END)::int as unread
      FROM notification n
      JOIN "user" u ON n.user_id = u.id
      GROUP BY u.email
      ORDER BY total DESC
    `);
		console.log("\n  Notifications per user:");
		for (const { email, total, unread } of notifCounts) {
			console.log(`    ${email}: ${total} total, ${unread} unread`);
		}
	} catch (e) {
		log("WARN", "Notification counts", e.message.split("\n")[0]);
	}

	// ============================================================
	// 13. DATABASE SUMMARY
	// ============================================================
	console.log("\n\x1b[1m=== DATABASE SUMMARY ===\x1b[0m");

	try {
		const tableCount = await queryOne(`
      SELECT count(*)::int as cnt FROM pg_tables WHERE schemaname = 'public'
    `);
		console.log(`  Total tables: ${tableCount.cnt}`);

		const enumCount = await query(`
      SELECT t.typname, count(e.enumlabel)::int as val_count
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.typname
      ORDER BY t.typname
    `);
		console.log(`  Custom enums: ${enumCount.length}`);
		for (const { typname, val_count } of enumCount) {
			console.log(`    ${typname}: ${val_count} values`);
		}

		const totalRows = await queryOne(`
      SELECT sum(n_live_tup)::bigint as total
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
    `);
		console.log(`  Total rows (approximate): ${totalRows.total}`);

		// Database size
		const dbSize = await queryOne(`SELECT pg_size_pretty(pg_database_size('postgres')) as size`);
		console.log(`  Database size: ${dbSize.size}`);
	} catch (e) {
		log("FAIL", "Database summary", e.message.split("\n")[0]);
	}

	// ============================================================
	// SUMMARY
	// ============================================================
	console.log(
		"\n\x1b[1m══════════════════════════════════════════\x1b[0m",
	);
	console.log(
		`\x1b[1mResults:\x1b[0m \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, \x1b[33m${warnings} warnings\x1b[0m`,
	);
	console.log(`Total: ${passed + failed + warnings} checks\n`);

	if (failed > 0) {
		console.log("\x1b[31m\x1b[1mFailed checks:\x1b[0m");
		for (const r of results.filter((r) => r.status === "FAIL")) {
			console.log(`  \x1b[31m✗\x1b[0m ${r.name}: ${r.detail}`);
		}
		console.log("");
	}

	if (warnings > 0) {
		console.log("\x1b[33m\x1b[1mWarnings:\x1b[0m");
		for (const r of results.filter((r) => r.status === "WARN")) {
			console.log(`  \x1b[33m⚠\x1b[0m ${r.name}: ${r.detail}`);
		}
		console.log("");
	}

	await client.end();
	process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
