// Idempotent creation of partner_invite table on prod.
// Usage: source resume-maker-sdlc/.deploy-vars && node scripts/partner-invite-create-table.cjs
const { Client } = require("pg");

const SQL = `
CREATE TABLE IF NOT EXISTS partner_invite (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  company_name text NOT NULL,
  company_name_fr text,
  partner_type text NOT NULL DEFAULT 'employer',
  token text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  accepted_user_id uuid REFERENCES "user"(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_invite_email_idx ON partner_invite (email);
CREATE INDEX IF NOT EXISTS partner_invite_token_idx ON partner_invite (token);
CREATE INDEX IF NOT EXISTS partner_invite_status_idx ON partner_invite (status);
`;

(async () => {
	const url = process.env.PG_PUBLIC_URL;
	if (!url) {
		console.error("PG_PUBLIC_URL not set. Run: source resume-maker-sdlc/.deploy-vars");
		process.exit(1);
	}
	const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
	await client.connect();
	try {
		await client.query(SQL);
		const { rows } = await client.query(
			"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'partner_invite' ORDER BY ordinal_position",
		);
		console.log("partner_invite columns:");
		for (const r of rows) console.log(`  - ${r.column_name} (${r.data_type})`);
		console.log("OK: partner_invite table is present.");
	} finally {
		await client.end();
	}
})().catch((e) => {
	console.error(e);
	process.exit(1);
});
