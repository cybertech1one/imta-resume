import pg from "pg";

const { Client } = pg;
const c = new Client({ connectionString: process.env.PG_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
async function main() {
	await c.connect();
	const u = await c.query(`SELECT id FROM "user" WHERE lower(email)='exemples@imta.ma'`);
	const demoId = u.rows[0]?.id;
	console.log("demo user id:", demoId);
	if (demoId) {
		const r = await c.query(`SELECT count(*)::int n FROM resume WHERE user_id=$1`, [demoId]);
		console.log("existing demo public resumes:", r.rows[0].n);
		// tags include program names; check if resume rows reference program ids via slug
		const sample = await c.query(`SELECT name, slug, tags FROM resume WHERE user_id=$1 LIMIT 5`, [demoId]);
		console.log("sample:", JSON.stringify(sample.rows, null, 2));
	}
	await c.end();
}
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
