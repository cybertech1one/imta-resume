/**
 * Add onboarding_completed column to user table.
 *
 * This migrates the onboarding completion state from localStorage
 * to the database so it persists across browsers and devices.
 *
 * Run: node scripts/add-onboarding-column.mjs
 */

import pg from "pg";

const DATABASE_URL =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

async function main() {
	await client.connect();
	console.log("Connected to database");

	// Check if column already exists
	const checkResult = await client.query(`
		SELECT column_name
		FROM information_schema.columns
		WHERE table_name = 'user' AND column_name = 'onboarding_completed'
	`);

	if (checkResult.rows.length > 0) {
		console.log("Column onboarding_completed already exists on user table. Nothing to do.");
		await client.end();
		return;
	}

	// Add the column with a default of false
	await client.query(`
		ALTER TABLE "user"
		ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false
	`);

	console.log("Added onboarding_completed column to user table (default: false)");

	// Verify
	const verifyResult = await client.query(`
		SELECT column_name, data_type, column_default
		FROM information_schema.columns
		WHERE table_name = 'user' AND column_name = 'onboarding_completed'
	`);

	console.log("Verification:", verifyResult.rows[0]);

	await client.end();
	console.log("Done. All existing users will see the onboarding wizard once, then it persists in DB.");
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
