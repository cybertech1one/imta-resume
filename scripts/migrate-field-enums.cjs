// Adds 'management' and 'technology' to the interview_field and mock_ai_field
// Postgres enums so the widened canonical taxonomy (healthcare, industrial, hse,
// management, technology, general) can be persisted without "invalid input value
// for enum" runtime errors. ADD VALUE is additive and backward-compatible:
// existing rows and the currently-deployed code are unaffected.
const { Client } = require("pg");

const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set");
	process.exit(1);
}

// ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so each runs
// standalone (node-pg auto-commits individual queries when no BEGIN is issued).
const statements = [
	`ALTER TYPE interview_field ADD VALUE IF NOT EXISTS 'management'`,
	`ALTER TYPE interview_field ADD VALUE IF NOT EXISTS 'technology'`,
	`ALTER TYPE mock_ai_field ADD VALUE IF NOT EXISTS 'technology'`,
	`ALTER TYPE mock_ai_field ADD VALUE IF NOT EXISTS 'management'`,
];

(async () => {
	const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
	await client.connect();
	try {
		for (const sql of statements) {
			try {
				await client.query(sql);
				console.log("OK:", sql);
			} catch (e) {
				console.error("FAIL:", sql, "->", e.message);
				throw e;
			}
		}
		// Verify
		for (const enumName of ["interview_field", "mock_ai_field"]) {
			const { rows } = await client.query(
				`SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = $1 ORDER BY e.enumsortorder`,
				[enumName],
			);
			console.log(`${enumName}:`, rows.map((r) => r.enumlabel).join(", "));
		}
	} finally {
		await client.end();
	}
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
