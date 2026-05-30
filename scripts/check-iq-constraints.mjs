import pg from "pg";

const { Client } = pg;
const c = new Client({ connectionString: process.env.PG_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
async function main() {
	await c.connect();
	const cols = await c.query(
		`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='interview_common_question' AND table_schema='public' ORDER BY ordinal_position`,
	);
	console.log("interview_common_question columns:");
	for (const r of cols.rows) console.log(`  ${r.column_name}: ${r.data_type} (${r.udt_name})`);

	// distinct field/program values currently present
	const f = await c.query(`SELECT DISTINCT field FROM interview_common_question ORDER BY 1`);
	console.log("\nexisting distinct field values:", f.rows.map((x) => x.field).join(", "));

	// any check constraints / enum types?
	const con = await c.query(
		`SELECT conname, pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='interview_common_question'::regclass`,
	);
	console.log("\nconstraints:");
	for (const r of con.rows) console.log(`  ${r.conname}: ${r.def}`);

	// resume_gallery field type
	const gf = await c.query(
		`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='resume_gallery' AND table_schema='public' AND column_name IN ('field','sub_field')`,
	);
	console.log("\nresume_gallery field/sub_field:");
	for (const r of gf.rows) console.log(`  ${r.column_name}: ${r.data_type} (${r.udt_name})`);
	const gcon = await c.query(
		`SELECT conname, pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='resume_gallery'::regclass`,
	);
	console.log("\nresume_gallery constraints:");
	for (const r of gcon.rows) console.log(`  ${r.conname}: ${r.def}`);

	await c.end();
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
