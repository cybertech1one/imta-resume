/**
 * Idempotently creates the support / helpdesk ticket tables on the production DB.
 * Usage: source resume-maker-sdlc/.deploy-vars && node scripts/create-support-tables.mjs
 */
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.PG_PUBLIC_URL;
if (!connectionString) {
	console.error("PG_PUBLIC_URL is not set. Run: source resume-maker-sdlc/.deploy-vars");
	process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const SQL = `
CREATE TABLE IF NOT EXISTS support_ticket (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	subject text NOT NULL,
	category text NOT NULL DEFAULT 'other',
	status text NOT NULL DEFAULT 'open',
	priority text NOT NULL DEFAULT 'normal',
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_ticket_user_idx ON support_ticket (user_id);
CREATE INDEX IF NOT EXISTS support_ticket_status_idx ON support_ticket (status);
CREATE INDEX IF NOT EXISTS support_ticket_last_message_idx ON support_ticket (last_message_at);

CREATE TABLE IF NOT EXISTS support_message (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	ticket_id uuid NOT NULL REFERENCES support_ticket(id) ON DELETE CASCADE,
	sender_user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	is_admin boolean NOT NULL DEFAULT false,
	body text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_message_ticket_idx ON support_message (ticket_id);
CREATE INDEX IF NOT EXISTS support_message_created_idx ON support_message (created_at);
`;

async function main() {
	const client = await pool.connect();
	try {
		await client.query(SQL);
		const { rows } = await client.query(
			`SELECT table_name FROM information_schema.tables
			 WHERE table_name IN ('support_ticket','support_message') ORDER BY table_name;`,
		);
		console.log("Tables present:", rows.map((r) => r.table_name).join(", "));
	} finally {
		client.release();
		await pool.end();
	}
}

main().catch((err) => {
	console.error("Failed:", err);
	process.exit(1);
});
