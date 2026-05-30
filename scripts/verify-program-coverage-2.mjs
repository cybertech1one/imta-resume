// Round 2: employer fields[] array, market_insight nulls, gallery program col, skill_library field rollup matched to imta_program.field
import pg from "pg";

const { Client } = pg;
const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set");
	process.exit(1);
}
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
	await client.connect();

	console.log("=== career_employer.fields (array) distribution ===");
	const emp = await client.query(`SELECT id, name, fields, is_active FROM career_employer ORDER BY id`);
	console.log(`total employers=${emp.rowCount}`);
	const fieldCount = {};
	for (const r of emp.rows) {
		const fs = Array.isArray(r.fields) ? r.fields : [];
		for (const f of fs) fieldCount[f] = (fieldCount[f] || 0) + 1;
		if (fs.length === 0) fieldCount["(empty)"] = (fieldCount["(empty)"] || 0) + 1;
	}
	console.log("employer fields[]:", JSON.stringify(fieldCount));

	console.log("\n=== career_market_insight detail (incl null field) ===");
	const mi = await client.query(
		`SELECT COALESCE(field,'(null)') f, COUNT(*)::int c FROM career_market_insight GROUP BY 1 ORDER BY 1`,
	);
	for (const r of mi.rows) console.log(`  ${r.f}: ${r.c}`);
	// sample of null-field insights to see if structural
	const mcols0 = await client.query(
		`SELECT column_name FROM information_schema.columns WHERE table_name='career_market_insight' AND table_schema='public' ORDER BY ordinal_position`,
	);
	console.log("  market_insight cols:", mcols0.rows.map((x) => x.column_name).join(", "));
	const miNull = await client.query(`SELECT * FROM career_market_insight WHERE field IS NULL LIMIT 3`);
	console.log("  sample null-field insights:", JSON.stringify(miNull.rows));

	console.log("\n=== resume_gallery columns + program coverage ===");
	const gcols = await client.query(
		`SELECT column_name FROM information_schema.columns WHERE table_name='resume_gallery' AND table_schema='public'`,
	);
	console.log("gallery cols:", gcols.rows.map((x) => x.column_name).join(", "));

	console.log("\n=== skill_library field rollup matched to imta_program.field set {healthcare,hse,industrial,management,technology} ===");
	const wanted = ["healthcare", "hse", "industrial", "management", "technology", "general"];
	for (const f of wanted) {
		const r = await client.query(`SELECT COUNT(*)::int c FROM skill_library WHERE field=$1`, [f]);
		console.log(`  skill_library field='${f}': ${r.rows[0].c}`);
	}

	console.log("\n=== interview_tip rollup matched to imta_program.field set ===");
	for (const f of wanted) {
		const r = await client.query(`SELECT COUNT(*)::int c FROM interview_tip WHERE field=$1`, [f]);
		console.log(`  interview_tip field='${f}': ${r.rows[0].c}`);
	}

	console.log("\n=== career_market_insight rollup matched to imta_program.field set ===");
	for (const f of wanted) {
		const r = await client.query(`SELECT COUNT(*)::int c FROM career_market_insight WHERE field=$1`, [f]);
		console.log(`  career_market_insight field='${f}': ${r.rows[0].c}`);
	}

	console.log("\n=== career_market_insight columns ===");
	const mcols = await client.query(
		`SELECT column_name FROM information_schema.columns WHERE table_name='career_market_insight' AND table_schema='public' ORDER BY ordinal_position`,
	);
	console.log(mcols.rows.map((x) => x.column_name).join(", "));

	console.log("\n=== skill_library columns ===");
	const scols = await client.query(
		`SELECT column_name FROM information_schema.columns WHERE table_name='skill_library' AND table_schema='public' ORDER BY ordinal_position`,
	);
	console.log(scols.rows.map((x) => x.column_name).join(", "));

	console.log("\n=== sample skill_library row (industrial) ===");
	const ss = await client.query(`SELECT * FROM skill_library WHERE field='industrial' LIMIT 2`);
	console.log(JSON.stringify(ss.rows, null, 2));

	console.log("\n=== sample career_market_insight row (industrial) ===");
	const ms = await client.query(`SELECT * FROM career_market_insight WHERE field='industrial' LIMIT 2`);
	console.log(JSON.stringify(ms.rows, null, 2));

	await client.end();
	console.log("\nDONE");
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
