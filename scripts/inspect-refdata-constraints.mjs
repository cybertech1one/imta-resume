import pg from "pg";
const { Client } = pg;
const url = process.env.PG_PUBLIC_URL;
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
async function cols(t) {
	const r = await client.query(
		`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
		[t],
	);
	console.log(`\n--- ${t} ---`);
	for (const c of r.rows) console.log(`  ${c.column_name} ${c.data_type} null=${c.is_nullable} default=${c.column_default || ""}`);
}
async function main() {
	await client.connect();
	for (const t of ["skill_library", "career_market_insight", "interview_tip"]) await cols(t);
	// sample tip + skill row full
	console.log("\nSAMPLE interview_tip (management):");
	const tr = await client.query(`SELECT * FROM interview_tip WHERE field='management' LIMIT 1`);
	console.log(JSON.stringify(tr.rows[0], null, 2));
	console.log("\nSAMPLE skill_library (management):");
	const sr = await client.query(`SELECT * FROM skill_library WHERE field='management' LIMIT 1`);
	console.log(JSON.stringify(sr.rows[0], null, 2));
	await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
