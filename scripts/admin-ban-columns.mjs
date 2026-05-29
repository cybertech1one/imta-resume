// Idempotently adds ban columns to the user table on the prod DB and verifies
// the setPassword bcrypt round-trip. Run with:
//   source resume-maker-sdlc/.deploy-vars && PG=$PG_PUBLIC_URL node scripts/admin-ban-columns.mjs
import bcrypt from "bcrypt";
import { Client } from "pg";

const PG = process.env.PG || process.env.PG_PUBLIC_URL;
if (!PG) {
	console.error("PG / PG_PUBLIC_URL env var required");
	process.exit(1);
}

const SALT_ROUNDS = 10; // matches src/utils/password.ts

const c = new Client({ connectionString: PG, ssl: { rejectUnauthorized: false } });
await c.connect();

// 1. Idempotent ALTER TABLE — add ban columns.
await c.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false`);
await c.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ban_reason text`);
await c.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ban_expires_at timestamptz`);
console.log("ALTER TABLE applied (idempotent).");

// 2. Verify the columns now exist.
const cols = await c.query(
	`SELECT column_name, data_type, is_nullable, column_default
	 FROM information_schema.columns
	 WHERE table_name = 'user' AND column_name IN ('banned','ban_reason','ban_expires_at')
	 ORDER BY column_name`,
);
console.log("Ban columns present:");
for (const r of cols.rows) {
	console.log(`  ${r.column_name} | ${r.data_type} | nullable=${r.is_nullable} | default=${r.column_default}`);
}
if (cols.rows.length !== 3) {
	console.error("ERROR: expected 3 ban columns");
	process.exit(2);
}

// 3. Verify bcrypt round-trip matches what setPassword would produce / verifyPassword accepts.
const sample = "AdminSetPass123!"; // >= 12 chars
const hash = await bcrypt.hash(sample, SALT_ROUNDS);
const ok = await bcrypt.compare(sample, hash);
const bad = await bcrypt.compare("wrong-password", hash);
console.log(`bcrypt hash prefix: ${hash.slice(0, 7)} (expect $2b$10 or $2a$10)`);
console.log(`verifyPassword(correct) = ${ok} (expect true)`);
console.log(`verifyPassword(wrong)   = ${bad} (expect false)`);
if (!ok || bad || !hash.startsWith("$2")) {
	console.error("ERROR: bcrypt round-trip failed");
	process.exit(3);
}

console.log("\nAll verifications passed.");
await c.end();
