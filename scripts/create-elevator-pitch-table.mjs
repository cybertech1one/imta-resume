import pg from "pg";

const client = new pg.Client({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/postgres",
});

async function main() {
	await client.connect();

	await client.query(`
		CREATE TABLE IF NOT EXISTS elevator_pitch (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			name TEXT NOT NULL,
			content TEXT NOT NULL,
			length TEXT NOT NULL DEFAULT '60s',
			context TEXT NOT NULL DEFAULT 'interview',
			industry TEXT NOT NULL DEFAULT 'general',
			word_count INTEGER DEFAULT 0,
			estimated_time INTEGER DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE INDEX IF NOT EXISTS idx_elevator_pitch_user_id ON elevator_pitch(user_id);
		CREATE INDEX IF NOT EXISTS idx_elevator_pitch_user_created ON elevator_pitch(user_id, created_at DESC);
	`);

	console.log("elevator_pitch table created successfully");
	await client.end();
}

main().catch(console.error);
