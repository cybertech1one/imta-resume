import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS message_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'email',
    subject TEXT,
    body TEXT NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    is_custom BOOLEAN NOT NULL DEFAULT true,
    personalization_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

await client.query(
  "CREATE INDEX IF NOT EXISTS idx_message_template_user_id ON message_template(user_id)"
);

console.log("Table message_template created successfully");
await client.end();
