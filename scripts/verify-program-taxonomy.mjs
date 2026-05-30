// Verify IMTA program taxonomy + data coverage against production DB.
// Usage: PG_PUBLIC_URL=... node scripts/verify-program-taxonomy.mjs
import pg from "pg";

const { Client } = pg;
const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set");
	process.exit(1);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function tableExists(name) {
	const r = await client.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
		[name],
	);
	return r.rowCount > 0;
}

async function columns(name) {
	const r = await client.query(
		`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
		[name],
	);
	return r.rows.map((x) => x.column_name);
}

async function safe(label, fn) {
	try {
		return await fn();
	} catch (e) {
		console.log(`  [ERR ${label}] ${e.message}`);
		return null;
	}
}

async function main() {
	await client.connect();

	console.log("=== 1. imta_program rows ===");
	if (await tableExists("imta_program")) {
		const cols = await columns("imta_program");
		console.log("columns:", cols.join(", "));
		const r = await client.query(
			`SELECT id, name, COALESCE(name_fr,'') AS name_fr, field, COALESCE(is_active::text,'?') AS is_active FROM imta_program ORDER BY field, id`,
		);
		console.log(`count=${r.rowCount}`);
		for (const row of r.rows) {
			console.log(`  ${row.field.padEnd(12)} | ${String(row.id).padEnd(28)} | active=${row.is_active} | ${row.name_fr || row.name}`);
		}
	} else {
		console.log("imta_program table MISSING");
	}

	console.log("\n=== 2. distinct field values per table ===");
	const fieldSources = [
		["imta_program", "field"],
		["resume_gallery", "field"],
		["resume_gallery", "sub_field"],
		["interview_common_question", "field"],
		["interview_common_question", "program"],
		["partner_job_posting", "field"],
		["skill_library", "field"],
		["career_market_insight", "field"],
		["career_employer", "field"],
		["interview_tip", "field"],
	];
	for (const [tbl, col] of fieldSources) {
		if (!(await tableExists(tbl))) {
			console.log(`  ${tbl}.${col}: TABLE MISSING`);
			continue;
		}
		const cols = await columns(tbl);
		if (!cols.includes(col)) {
			console.log(`  ${tbl}.${col}: COLUMN MISSING (cols: ${cols.join(",")})`);
			continue;
		}
		const r = await safe(`${tbl}.${col}`, () =>
			client.query(
				`SELECT COALESCE(${col}::text,'(null)') AS v, COUNT(*)::int AS c FROM ${tbl} GROUP BY 1 ORDER BY 1`,
			),
		);
		if (r) {
			const parts = r.rows.map((x) => `${x.v}=${x.c}`).join(", ");
			console.log(`  ${tbl}.${col}: ${parts}`);
		}
	}

	console.log("\n=== 3. coverage matrix (per active program) ===");
	if (await tableExists("imta_program")) {
		const progs = await client.query(
			`SELECT id, field, COALESCE(is_active,true) AS is_active FROM imta_program ORDER BY field, id`,
		);
		// helper counts
		const hasTbl = {
			gallery: await tableExists("resume_gallery"),
			icq: await tableExists("interview_common_question"),
			skill: await tableExists("skill_library"),
			insight: await tableExists("career_market_insight"),
			employer: await tableExists("career_employer"),
		};
		const galleryCols = hasTbl.gallery ? await columns("resume_gallery") : [];
		const icqCols = hasTbl.icq ? await columns("interview_common_question") : [];

		console.log("program | field | active | gallery(prog/field) | icq(prog/field) | skills(field) | insights(field) | employers(field)");
		for (const p of progs.rows) {
			const f = p.field;
			const id = p.id;
			const cnt = async (q, params) => {
				const r = await safe("cnt", () => client.query(q, params));
				return r ? Number(r.rows[0].c) : -1;
			};
			let galleryProg = 0;
			let galleryField = 0;
			if (hasTbl.gallery) {
				if (galleryCols.includes("program")) galleryProg = await cnt(`SELECT COUNT(*)::int c FROM resume_gallery WHERE program=$1`, [id]);
				if (galleryCols.includes("sub_field")) galleryField = await cnt(`SELECT COUNT(*)::int c FROM resume_gallery WHERE sub_field=$1 OR field=$1`, [f]);
				else if (galleryCols.includes("field")) galleryField = await cnt(`SELECT COUNT(*)::int c FROM resume_gallery WHERE field=$1`, [f]);
			}
			let icqProg = 0;
			let icqField = 0;
			if (hasTbl.icq) {
				if (icqCols.includes("program")) icqProg = await cnt(`SELECT COUNT(*)::int c FROM interview_common_question WHERE program=$1`, [id]);
				if (icqCols.includes("field")) icqField = await cnt(`SELECT COUNT(*)::int c FROM interview_common_question WHERE field=$1`, [f]);
			}
			const skills = hasTbl.skill ? await cnt(`SELECT COUNT(*)::int c FROM skill_library WHERE field=$1`, [f]) : -1;
			const insights = hasTbl.insight ? await cnt(`SELECT COUNT(*)::int c FROM career_market_insight WHERE field=$1`, [f]) : -1;
			const employers = hasTbl.employer ? await cnt(`SELECT COUNT(*)::int c FROM career_employer WHERE field=$1`, [f]) : -1;
			console.log(
				`  ${String(id).padEnd(26)} | ${f.padEnd(11)} | ${String(p.is_active).padEnd(5)} | ${galleryProg}/${galleryField} | ${icqProg}/${icqField} | ${skills} | ${insights} | ${employers}`,
			);
		}
	}

	console.log("\n=== 4. coverage by FIELD (rollup) ===");
	const fields = await safe("fields", () =>
		client.query(`SELECT DISTINCT field FROM imta_program ORDER BY field`),
	);
	if (fields) {
		for (const { field: f } of fields.rows) {
			const cnt = async (tbl, col, val) => {
				if (!(await tableExists(tbl))) return "n/a";
				const cols = await columns(tbl);
				if (!cols.includes(col)) return "nocol";
				const r = await safe(tbl, () => client.query(`SELECT COUNT(*)::int c FROM ${tbl} WHERE ${col}=$1`, [val]));
				return r ? r.rows[0].c : "err";
			};
			const skills = await cnt("skill_library", "field", f);
			const insights = await cnt("career_market_insight", "field", f);
			const employers = await cnt("career_employer", "field", f);
			const icq = await cnt("interview_common_question", "field", f);
			const tips = await cnt("interview_tip", "field", f);
			console.log(`  field=${f.padEnd(12)} skills=${skills} insights=${insights} employers=${employers} interviewQ=${icq} tips=${tips}`);
		}
	}

	console.log("\n=== 5. user.imta_program distribution (which programs students picked) ===");
	if (await tableExists("user")) {
		const cols = await columns("user");
		if (cols.includes("imta_program")) {
			const r = await client.query(
				`SELECT COALESCE(imta_program,'(null)') v, COUNT(*)::int c FROM "user" GROUP BY 1 ORDER BY 2 DESC`,
			);
			for (const row of r.rows) console.log(`  ${row.v}: ${row.c}`);
		} else {
			console.log("  user.imta_program column MISSING");
		}
	}

	console.log("\n=== 6. orphan/quality checks ===");
	// programs referenced in user but not in imta_program
	if ((await tableExists("user")) && (await tableExists("imta_program"))) {
		const ucols = await columns("user");
		if (ucols.includes("imta_program")) {
			const r = await safe("orphan-user-prog", () =>
				client.query(
					`SELECT DISTINCT u.imta_program FROM "user" u LEFT JOIN imta_program p ON p.id=u.imta_program WHERE u.imta_program IS NOT NULL AND p.id IS NULL`,
				),
			);
			if (r) console.log(`  user.imta_program values NOT in imta_program: ${r.rows.map((x) => x.imta_program).join(", ") || "(none)"}`);
		}
	}
	// interview_common_question.field values not in imta_program.field
	if ((await tableExists("interview_common_question")) && (await tableExists("imta_program"))) {
		const r = await safe("orphan-icq-field", () =>
			client.query(
				`SELECT DISTINCT q.field FROM interview_common_question q WHERE q.field IS NOT NULL AND q.field NOT IN (SELECT field FROM imta_program) AND q.field <> 'general'`,
			),
		);
		if (r) console.log(`  interview_common_question.field NOT in imta_program.field: ${r.rows.map((x) => x.field).join(", ") || "(none)"}`);
	}

	await client.end();
	console.log("\nDONE");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
