import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { definePlugin } from "nitro";
import { Pool } from "pg";

async function migrateDatabase() {
	console.log("⌛ Running database migrations...");

	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	const pool = new Pool({ connectionString });
	const db = drizzle({ client: pool });

	try {
		await migrate(db, { migrationsFolder: "./migrations" });
		console.log("✅ Database migrations completed");
	} catch (error: unknown) {
		// Check if the error is "already exists" which means tables were created outside migrations
		const errorMessage = error instanceof Error ? error.message : String(error);
		const errorCause = (error as { cause?: { code?: string } })?.cause;

		if (errorCause?.code === "42710" || errorCause?.code === "42P07" || errorMessage.includes("already exists")) {
			console.log(
				"⚠️ Some database objects already exist - this is expected if migrations were applied outside Drizzle",
			);
			console.log("✅ Continuing with existing database schema...");
		} else {
			console.error("🚨 Database migrations failed:", error);
		}
	} finally {
		await pool.end();
	}
}

export default definePlugin(async () => {
	await migrateDatabase();
});
