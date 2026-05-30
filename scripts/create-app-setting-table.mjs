/**
 * Idempotent creation of the `app_setting` table used for admin-controllable
 * runtime settings (e.g. registration_mode).
 *
 * Usage (prod): source resume-maker-sdlc/.deploy-vars first so $PG_PUBLIC_URL is set.
 *   node scripts/create-app-setting-table.mjs
 *
 * Falls back to DATABASE_URL when PG_PUBLIC_URL is not set (local dev).
 */
import pg from "pg";

const connectionString = process.env.PG_PUBLIC_URL || process.env.DATABASE_URL;
if (!connectionString) {
	console.error("ERROR: set PG_PUBLIC_URL (prod) or DATABASE_URL (local).");
	process.exit(1);
}

const client = new pg.Client({
	connectionString,
	ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false },
});

const SQL = `
CREATE TABLE IF NOT EXISTS app_setting (
	key text PRIMARY KEY,
	value jsonb NOT NULL,
	updated_at timestamptz NOT NULL DEFAULT now(),
	updated_by text
);
`;

async function main() {
	await client.connect();
	await client.query(SQL);
	const { rows } = await client.query("SELECT key FROM app_setting ORDER BY key");
	console.log(
		"app_setting table ready. Existing keys:",
		rows.map((r) => r.key),
	);
	await client.end();
}

main().catch((err) => {
	console.error("Failed:", err.message);
	process.exit(1);
});
