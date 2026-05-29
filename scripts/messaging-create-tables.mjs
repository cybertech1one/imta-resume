// Idempotent creation of the direct-messaging tables on the production DB.
// Usage: source resume-maker-sdlc/.deploy-vars  then  node scripts/messaging-create-tables.mjs
import { Client } from "pg";

const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set. Run: source resume-maker-sdlc/.deploy-vars");
	process.exit(1);
}

const DDL = `
CREATE TABLE IF NOT EXISTS conversation (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	subject text,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversation_last_message_idx ON conversation (last_message_at DESC);

CREATE TABLE IF NOT EXISTS conversation_participant (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id uuid NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
	user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	last_read_at timestamptz,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS conversation_participant_unique_idx
	ON conversation_participant (conversation_id, user_id);
CREATE INDEX IF NOT EXISTS conversation_participant_user_idx
	ON conversation_participant (user_id);

CREATE TABLE IF NOT EXISTS message (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	conversation_id uuid NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
	sender_user_id uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	body text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS message_conversation_created_idx
	ON message (conversation_id, created_at);
`;

const client = new Client({ connectionString: url });
await client.connect();
try {
	await client.query(DDL);
	const { rows } = await client.query(`
		SELECT table_name FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name IN ('conversation','conversation_participant','message')
		ORDER BY table_name;
	`);
	console.log("Tables present:", rows.map((r) => r.table_name).join(", "));
} finally {
	await client.end();
}
