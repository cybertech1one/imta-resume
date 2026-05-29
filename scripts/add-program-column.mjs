/**
 * Idempotently add a `program` column to interview_common_question so questions
 * can be scoped to a specific IMTA vocational program (not just a broad field).
 * Run: source resume-maker-sdlc/.deploy-vars && node scripts/add-program-column.mjs
 */
import pg from "pg";
const { Client } = pg;
const c = new Client({ connectionString: process.env.PG_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query("ALTER TABLE interview_common_question ADD COLUMN IF NOT EXISTS program text");
await c.query("CREATE INDEX IF NOT EXISTS interview_common_question_program_idx ON interview_common_question (program)");
const cols = await c.query(
	"SELECT column_name FROM information_schema.columns WHERE table_name='interview_common_question' AND column_name='program'",
);
console.log("program column present:", cols.rows.length > 0);
await c.end();
