/**
 * fix-missing-columns.mjs
 *
 * Adds missing columns to LinkedIn tables (and other checked tables) so
 * the Drizzle schema matches the actual PostgreSQL database.
 *
 * Safe to run multiple times — every ALTER TABLE uses IF NOT EXISTS.
 *
 * Usage:
 *   node scripts/fix-missing-columns.mjs
 *
 * Targets LOCAL Windows PostgreSQL on port 5432 via DATABASE_URL in .env
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { Client } = require("pg");

// ── Load DATABASE_URL from .env ────────────────────────────────────────────
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf8");
const match = envContent.match(/^DATABASE_URL="?([^"\n]+)"?/m);
if (!match) {
	console.error("DATABASE_URL not found in .env");
	process.exit(1);
}
const connectionString = match[1];
console.log(`Connecting to: ${connectionString.replace(/:([^:@]+)@/, ":***@")}`);

const client = new Client({ connectionString });
await client.connect();

// ── Helper ─────────────────────────────────────────────────────────────────
async function runSQL(label, sql) {
	try {
		await client.query(sql);
		console.log(`  ✓ ${label}`);
	} catch (e) {
		console.error(`  ✗ ${label}: ${e.message}`);
		throw e;
	}
}

async function getColumns(tableName) {
	const res = await client.query(
		`SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
		[tableName],
	);
	return new Set(res.rows.map((r) => r.column_name));
}

// ── Main ───────────────────────────────────────────────────────────────────
console.log("\n=== Fixing linkedin_message ===");
{
	const cols = await getColumns("linkedin_message");

	// language: text NOT NULL DEFAULT 'fr'
	if (!cols.has("language")) {
		await runSQL(
			"ADD language column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr'`,
		);
	} else {
		console.log("  ─ language already exists");
	}

	// recipient_role: text NULL (schema has recipientRole, DB had recipient_title which is different)
	if (!cols.has("recipient_role")) {
		await runSQL(
			"ADD recipient_role column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS recipient_role text`,
		);
	} else {
		console.log("  ─ recipient_role already exists");
	}

	// subject: text NULL
	if (!cols.has("subject")) {
		await runSQL("ADD subject column", `ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS subject text`);
	} else {
		console.log("  ─ subject already exists");
	}

	// ai_prompt: text NULL
	if (!cols.has("ai_prompt")) {
		await runSQL("ADD ai_prompt column", `ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS ai_prompt text`);
	} else {
		console.log("  ─ ai_prompt already exists");
	}

	// is_sent: boolean DEFAULT false
	if (!cols.has("is_sent")) {
		await runSQL(
			"ADD is_sent column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS is_sent boolean DEFAULT false`,
		);
	} else {
		console.log("  ─ is_sent already exists");
	}

	// sent_at: timestamptz NULL
	if (!cols.has("sent_at")) {
		await runSQL(
			"ADD sent_at column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone`,
		);
	} else {
		console.log("  ─ sent_at already exists");
	}

	// response_received: boolean DEFAULT false
	if (!cols.has("response_received")) {
		await runSQL(
			"ADD response_received column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS response_received boolean DEFAULT false`,
		);
	} else {
		console.log("  ─ response_received already exists");
	}

	// response_received_at: timestamptz NULL
	if (!cols.has("response_received_at")) {
		await runSQL(
			"ADD response_received_at column",
			`ALTER TABLE linkedin_message ADD COLUMN IF NOT EXISTS response_received_at timestamp with time zone`,
		);
	} else {
		console.log("  ─ response_received_at already exists");
	}
}

console.log("\n=== Fixing linkedin_post ===");
{
	const cols = await getColumns("linkedin_post");

	// language: text NOT NULL DEFAULT 'fr'
	if (!cols.has("language")) {
		await runSQL(
			"ADD language column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'fr'`,
		);
	} else {
		console.log("  ─ language already exists");
	}

	// title: text NULL
	if (!cols.has("title")) {
		await runSQL("ADD title column", `ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS title text`);
	} else {
		console.log("  ─ title already exists");
	}

	// ai_prompt: text NULL
	if (!cols.has("ai_prompt")) {
		await runSQL("ADD ai_prompt column", `ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS ai_prompt text`);
	} else {
		console.log("  ─ ai_prompt already exists");
	}

	// scheduled_at: timestamptz NULL  (DB has scheduled_for — add new canonical name)
	if (!cols.has("scheduled_at")) {
		await runSQL(
			"ADD scheduled_at column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone`,
		);
	} else {
		console.log("  ─ scheduled_at already exists");
	}

	// engagement_likes: integer DEFAULT 0
	if (!cols.has("engagement_likes")) {
		await runSQL(
			"ADD engagement_likes column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS engagement_likes integer DEFAULT 0`,
		);
	} else {
		console.log("  ─ engagement_likes already exists");
	}

	// engagement_comments: integer DEFAULT 0
	if (!cols.has("engagement_comments")) {
		await runSQL(
			"ADD engagement_comments column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS engagement_comments integer DEFAULT 0`,
		);
	} else {
		console.log("  ─ engagement_comments already exists");
	}

	// engagement_shares: integer DEFAULT 0
	if (!cols.has("engagement_shares")) {
		await runSQL(
			"ADD engagement_shares column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS engagement_shares integer DEFAULT 0`,
		);
	} else {
		console.log("  ─ engagement_shares already exists");
	}

	// is_favorite: boolean DEFAULT false
	if (!cols.has("is_favorite")) {
		await runSQL(
			"ADD is_favorite column",
			`ALTER TABLE linkedin_post ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false`,
		);
	} else {
		console.log("  ─ is_favorite already exists");
	}
}

console.log("\n=== Fixing linkedin_profile_analysis ===");
{
	const cols = await getColumns("linkedin_profile_analysis");

	// headline: text NULL
	if (!cols.has("headline")) {
		await runSQL("ADD headline column", `ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS headline text`);
	} else {
		console.log("  ─ headline already exists");
	}

	// summary: text NULL
	if (!cols.has("summary")) {
		await runSQL("ADD summary column", `ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS summary text`);
	} else {
		console.log("  ─ summary already exists");
	}

	// experience: text NULL  (DB has experience_score integer — these are different columns)
	if (!cols.has("experience")) {
		await runSQL("ADD experience column", `ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS experience text`);
	} else {
		console.log("  ─ experience already exists");
	}

	// keyword_score: integer NULL
	if (!cols.has("keyword_score")) {
		await runSQL(
			"ADD keyword_score column",
			`ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS keyword_score integer`,
		);
	} else {
		console.log("  ─ keyword_score already exists");
	}

	// readability_score: integer NULL
	if (!cols.has("readability_score")) {
		await runSQL(
			"ADD readability_score column",
			`ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS readability_score integer`,
		);
	} else {
		console.log("  ─ readability_score already exists");
	}

	// suggestions: jsonb NULL
	if (!cols.has("suggestions")) {
		await runSQL(
			"ADD suggestions column",
			`ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS suggestions jsonb`,
		);
	} else {
		console.log("  ─ suggestions already exists");
	}

	// missing_keywords: text[] DEFAULT '{}'
	if (!cols.has("missing_keywords")) {
		await runSQL(
			"ADD missing_keywords column",
			`ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS missing_keywords text[] DEFAULT '{}'`,
		);
	} else {
		console.log("  ─ missing_keywords already exists");
	}

	// strong_points: text[] DEFAULT '{}'
	if (!cols.has("strong_points")) {
		await runSQL(
			"ADD strong_points column",
			`ALTER TABLE linkedin_profile_analysis ADD COLUMN IF NOT EXISTS strong_points text[] DEFAULT '{}'`,
		);
	} else {
		console.log("  ─ strong_points already exists");
	}

	// user_id in this table is text in DB but schema references user.id (uuid).
	// The column exists, just wrong type — can't ALTER type safely on live table with data.
	// Log a warning only.
	console.log("  ℹ user_id is text in DB (schema expects uuid-compatible) — no data yet, leaving as-is");
}

// ── Verify final state ─────────────────────────────────────────────────────
console.log("\n=== Verification ===");
for (const table of ["linkedin_message", "linkedin_post", "linkedin_profile_analysis"]) {
	const res = await client.query(
		`SELECT column_name, data_type, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
		[table],
	);
	console.log(`\n${table} (${res.rows.length} columns):`);
	res.rows.forEach((r) => console.log(`  ${r.column_name.padEnd(30)} ${r.data_type.padEnd(28)} default: ${r.column_default || "NULL"}`));
}

await client.end();
console.log("\n✓ Done — all missing columns added successfully.");
