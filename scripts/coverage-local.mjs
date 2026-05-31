/**
 * Local DB content-coverage matrix for all active IMTA programs.
 * Reads DATABASE_URL from .env (the app's local Postgres on 5432).
 * Run: node scripts/coverage-local.mjs
 */
import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

// Load DATABASE_URL from .env without extra deps
let url = process.env.DATABASE_URL;
if (!url) {
	const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
	const m = env.match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
	url = m && m[1];
}
if (!url) {
	console.error("DATABASE_URL not found");
	process.exit(1);
}

const c = new Client({ connectionString: url });

async function tableExists(name) {
	const r = await c.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
		[name],
	);
	return r.rowCount > 0;
}

async function safeCountBy(table, col) {
	if (!(await tableExists(table))) return { missing: true, map: {} };
	const colsRes = await c.query(
		`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
		[table],
	);
	const cols = colsRes.rows.map((x) => x.column_name);
	if (!cols.includes(col)) return { missingCol: col, cols, map: {} };
	const r = await c.query(
		`SELECT ${col} AS k, count(*)::int n FROM ${table} WHERE ${col} IS NOT NULL GROUP BY ${col}`,
	);
	return { map: Object.fromEntries(r.rows.map((x) => [x.k, x.n])) };
}

async function main() {
	await c.connect();

	const progs = await c.query(
		`SELECT id, name, name_fr, field, is_active FROM imta_program WHERE is_active = true ORDER BY field, id`,
	);
	console.log(`\n=== ACTIVE PROGRAMS: ${progs.rowCount} ===`);
	const byField = {};
	for (const r of progs.rows) (byField[r.field] ||= []).push(r);
	for (const [f, rows] of Object.entries(byField)) console.log(`  ${f}: ${rows.length}`);

	const iqByProgram = await safeCountBy("interview_common_question", "program");
	const iqByField = await safeCountBy("interview_common_question", "field");
	const galByProgram = await safeCountBy("resume_gallery", "sub_field");
	const galByField = await safeCountBy("resume_gallery", "field");

	console.log(`\n=== COVERAGE MATRIX ===`);
	console.log(`  ${"program".padEnd(36)} ${"field".padEnd(12)} iQ(prog) gal(prog)`);
	const gaps = { iq: [], gal: [] };
	for (const r of progs.rows) {
		const q = iqByProgram.map[r.id] || 0;
		const g = galByProgram.map[r.id] || 0;
		console.log(`  ${r.id.padEnd(36)} ${String(r.field).padEnd(12)} ${String(q).padStart(5)} ${String(g).padStart(8)}`);
		if (q === 0) gaps.iq.push(r.id);
		if (g === 0) gaps.gal.push(r.id);
	}

	console.log(`\n=== interview_common_question by FIELD ===`);
	console.log(JSON.stringify(iqByField.map, null, 0));
	console.log(`=== resume_gallery by FIELD ===`);
	console.log(JSON.stringify(galByField.map, null, 0));

	console.log(`\n=== UNCOVERED interview Q (${gaps.iq.length}) ===\n  ${gaps.iq.join(", ")}`);
	console.log(`=== UNCOVERED gallery (${gaps.gal.length}) ===\n  ${gaps.gal.join(", ")}`);

	// totals
	for (const t of ["interview_common_question", "resume_gallery", "career_employer", "career_market_insight", "skill_library", "imta_program"]) {
		if (await tableExists(t)) {
			const r = await c.query(`SELECT count(*)::int n FROM ${t}`);
			console.log(`  total ${t}: ${r.rows[0].n}`);
		} else {
			console.log(`  total ${t}: (table missing)`);
		}
	}

	await c.end();
	console.log("\nDONE");
}
main().catch((e) => {
	console.error(e.message);
	process.exit(1);
});
