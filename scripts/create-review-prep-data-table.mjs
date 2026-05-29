import pg from "pg";

const client = new pg.Client({
	connectionString:
		process.env.DATABASE_URL ||
		"postgresql://postgres:postgres@localhost:5432/postgres",
});

async function main() {
	await client.connect();

	await client.query(`
		CREATE TABLE IF NOT EXISTS review_prep_user_data (
			id UUID PRIMARY KEY,
			user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			data_type TEXT NOT NULL,
			data JSONB NOT NULL DEFAULT '{}',
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);

		CREATE UNIQUE INDEX IF NOT EXISTS idx_review_prep_user_data_user_type
			ON review_prep_user_data(user_id, data_type);
	`);

	console.log("review_prep_user_data table created successfully");
	await client.end();
}

main().catch(console.error);
