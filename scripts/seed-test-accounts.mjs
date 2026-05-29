import bcrypt from "bcrypt";
import { v7 as uuidv7 } from "uuid";
import pg from "pg";

const { Client } = pg;

async function seed() {
	const client = new Client({
		connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
	});
	await client.connect();

	// Ensure partner role exists in enum
	try {
		await client.query("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner'");
		console.log("Ensured 'partner' role exists in enum");
	} catch (err) {
		console.log("Partner role already exists or could not be added:", err.message);
	}

	const password = "TestAccount123!";
	const hash = await bcrypt.hash(password, 10);
	const now = new Date();

	const accounts = [
		{ name: "Admin User", email: "admin@test.com", username: "admin", role: "admin" },
		{ name: "Student One", email: "student1@test.com", username: "student1", role: "user" },
		{ name: "Student Two", email: "student2@test.com", username: "student2", role: "user" },
		{ name: "Partner Company", email: "partner@test.com", username: "partner", role: "partner" },
	];

	for (const acc of accounts) {
		const userId = uuidv7();
		const accountId = uuidv7();

		try {
			const existing = await client.query('SELECT id FROM "user" WHERE email = $1', [acc.email]);
			if (existing.rows.length > 0) {
				console.log(`SKIP (exists): ${acc.email} - role: ${acc.role}`);
				continue;
			}

			await client.query(
				`INSERT INTO "user" (id, name, email, username, display_username, role, email_verified, two_factor_enabled, preferred_ai_language, created_at, updated_at)
				 VALUES ($1, $2, $3, $4, $5, $6, true, false, $7, $8, $9)`,
				[userId, acc.name, acc.email, acc.username, acc.username, acc.role, "fr", now, now],
			);

			await client.query(
				`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
				 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
				[accountId, userId, "credential", userId, hash, now, now],
			);

			console.log(`CREATED: ${acc.email} - role: ${acc.role}`);
		} catch (err) {
			console.error(`ERROR for ${acc.email}: ${err.message}`);
		}
	}

	// Verify
	const result = await client.query(
		`SELECT email, role FROM "user" WHERE email LIKE $1 ORDER BY role, email`,
		["%@test.com"],
	);
	console.log("\n=== Test Accounts in DB ===");
	for (const row of result.rows) {
		console.log(`${row.role.padEnd(10)} | ${row.email}`);
	}

	await client.end();
}

seed().catch(console.error);
