/**
 * Discover full IMTA program coverage gaps in prod.
 * - All active imta_program (id, name, name_fr, field)
 * - interview_common_question coverage per program
 * - resume_gallery coverage per program (sub_field)
 * Run: source resume-maker-sdlc/.deploy-vars && node scripts/discover-coverage.mjs
 */
import pg from "pg";

const { Client } = pg;
const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set");
	process.exit(1);
}
const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
	await c.connect();

	// 1. all active programs
	const progs = await c.query(
		`SELECT id, name, name_fr, field, is_active FROM imta_program WHERE is_active = true ORDER BY field, id`,
	);
	console.log(`\n=== ACTIVE PROGRAMS (${progs.rowCount}) ===`);
	const byField = {};
	for (const r of progs.rows) {
		byField[r.field] = byField[r.field] || [];
		byField[r.field].push(r);
	}
	for (const [f, rows] of Object.entries(byField)) {
		console.log(`\n  FIELD: ${f} (${rows.length})`);
		for (const r of rows) console.log(`    ${r.id}  |  ${r.name_fr || r.name}`);
	}

	// 2. interview question coverage by program
	const iq = await c.query(
		`SELECT program, count(*)::int n FROM interview_common_question WHERE program IS NOT NULL GROUP BY program ORDER BY program`,
	);
	const iqMap = Object.fromEntries(iq.rows.map((r) => [r.program, r.n]));

	// 3. gallery coverage by sub_field (programId)
	const gcolsRes = await c.query(
		`SELECT column_name FROM information_schema.columns WHERE table_name='resume_gallery' AND table_schema='public' ORDER BY ordinal_position`,
	);
	const gcols = gcolsRes.rows.map((x) => x.column_name);
	console.log(`\n=== resume_gallery columns: ${gcols.join(", ")}`);
	const subCol = gcols.includes("sub_field") ? "sub_field" : gcols.includes("program") ? "program" : null;
	let galMap = {};
	if (subCol) {
		const g = await c.query(
			`SELECT ${subCol} AS pid, count(*)::int n FROM resume_gallery WHERE ${subCol} IS NOT NULL GROUP BY ${subCol} ORDER BY ${subCol}`,
		);
		galMap = Object.fromEntries(g.rows.map((r) => [r.pid, r.n]));
	}
	const totGal = await c.query(`SELECT count(*)::int n FROM resume_gallery`);
	console.log(`resume_gallery total rows: ${totGal.rows[0].n}`);

	// 4. combined coverage table
	console.log(`\n=== COVERAGE MATRIX (program | field | interviewQ | galleryEx) ===`);
	const uncoveredIQ = [];
	const uncoveredGal = [];
	for (const r of progs.rows) {
		const q = iqMap[r.id] || 0;
		const g = galMap[r.id] || 0;
		console.log(
			`  ${r.id.padEnd(34)} ${String(r.field).padEnd(12)} Q=${String(q).padStart(3)}  G=${String(g).padStart(3)}`,
		);
		if (q === 0) uncoveredIQ.push(r.id);
		if (g === 0) uncoveredGal.push(r.id);
	}

	console.log(`\n=== UNCOVERED interview questions (${uncoveredIQ.length}): ${uncoveredIQ.join(",")}`);
	console.log(`=== UNCOVERED gallery (${uncoveredGal.length}): ${uncoveredGal.join(",")}`);

	// 5. fields present
	console.log(`\n=== FIELDS: ${Object.keys(byField).join(", ")}`);

	// 6. exemples demo user check
	const exUser = await c.query(
		`SELECT id, email FROM "user" WHERE email ILIKE '%exemple%' OR email ILIKE '%exemples%' LIMIT 5`,
	);
	console.log(`\n=== exemples-like users: ${JSON.stringify(exUser.rows)}`);

	await c.end();
	console.log("\nDONE");
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
