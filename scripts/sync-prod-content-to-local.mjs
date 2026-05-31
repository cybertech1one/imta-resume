/**
 * Make the LOCAL dev DB mirror PROD for the content tables so local user-testing
 * is faithful. Prod is the source of truth (fully normalized + program-scoped);
 * the local DB was stale (missing the `program` column, messy legacy field tags).
 *
 * Copies: interview_common_question, resume_gallery (full replace).
 * Requires prod creds: source resume-maker-sdlc/.deploy-vars (PG_PUBLIC_URL).
 * Local conn read from .env DATABASE_URL.
 * Run: source resume-maker-sdlc/.deploy-vars && node scripts/sync-prod-content-to-local.mjs
 */
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

const prodUrl = process.env.PG_PUBLIC_URL;
if (!prodUrl) throw new Error("Source resume-maker-sdlc/.deploy-vars first (PG_PUBLIC_URL missing)");
const localUrl = fs.readFileSync(new URL("../.env", import.meta.url), "utf8").match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/m)[1];

const prod = new Client({ connectionString: prodUrl, ssl: { rejectUnauthorized: false } });
const local = new Client({ connectionString: localUrl });

async function ensureLocalSchema() {
	// Local drift fix: add the program column the schema/queries expect.
	await local.query(`ALTER TABLE interview_common_question ADD COLUMN IF NOT EXISTS program text`);
	await local.query(`CREATE INDEX IF NOT EXISTS idx_icq_program ON interview_common_question(program)`);
}

async function copyTable(table) {
	// Column intersection (+ data types) so we only copy columns in BOTH DBs and
	// serialize each correctly: jsonb -> JSON string, ARRAY (text[]) -> JS array
	// (node-pg builds the array literal), scalars as-is.
	const colQ = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`;
	const pColRows = (await prod.query(colQ, [table])).rows;
	const lCols = new Set((await local.query(colQ, [table])).rows.map((r) => r.column_name));
	const colDefs = pColRows.filter((r) => lCols.has(r.column_name));
	if (colDefs.length === 0) throw new Error(`No shared columns for ${table}`);
	const cols = colDefs.map((c) => c.column_name);
	const typeOf = Object.fromEntries(colDefs.map((c) => [c.column_name, c.data_type]));

	const rows = (await prod.query(`SELECT ${cols.map((c) => `"${c}"`).join(", ")} FROM ${table}`)).rows;
	await local.query(`TRUNCATE ${table}`);

	const colList = cols.map((c) => `"${c}"`).join(", ");
	const ph = cols.map((_, i) => `$${i + 1}`).join(", ");
	let inserted = 0;
	for (const row of rows) {
		const vals = cols.map((c) => {
			const v = row[c];
			if (v === null) return null;
			if (typeOf[c] === "ARRAY") return v; // node-pg serializes JS arrays to array literals
			if (typeOf[c] === "jsonb" || typeOf[c] === "json") return JSON.stringify(v);
			return v;
		});
		await local.query(`INSERT INTO ${table} (${colList}) VALUES (${ph})`, vals);
		inserted += 1;
	}
	console.log(`[${table}] copied ${inserted} rows (${cols.length} cols: ${cols.join(",")})`);
}

async function main() {
	await prod.connect();
	await local.connect();
	console.log("Syncing PROD -> LOCAL content tables...");
	await ensureLocalSchema();
	await copyTable("interview_common_question");
	await copyTable("resume_gallery");
	await prod.end();
	await local.end();
	console.log("DONE");
}
main().catch((e) => {
	console.error(e.message);
	process.exit(1);
});
