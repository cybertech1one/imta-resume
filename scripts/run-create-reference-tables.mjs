import { readFileSync } from "fs";
import { Client } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sqlFile = join(__dirname, "create-reference-tables.sql");
const sql = readFileSync(sqlFile, "utf-8");

const client = new Client({
	connectionString: "postgresql://postgres:postgres@localhost:5432/postgres",
});

async function main() {
	try {
		await client.connect();
		console.log("Connected to PostgreSQL.");

		console.log("Executing SQL to create 6 reference data tables...\n");
		await client.query(sql);

		// Verify tables were created
		const result = await client.query(`
			SELECT table_name
			FROM information_schema.tables
			WHERE table_schema = 'public'
			  AND table_name IN (
			    'imta_program',
			    'interview_tip',
			    'interview_common_question',
			    'career_market_insight',
			    'career_employer',
			    'skill_library'
			  )
			ORDER BY table_name;
		`);

		console.log(`Verified ${result.rows.length}/6 tables exist:`);
		for (const row of result.rows) {
			console.log(`  - ${row.table_name}`);
		}

		// Count rows in each table
		for (const row of result.rows) {
			const countResult = await client.query(
				`SELECT COUNT(*) as count FROM ${row.table_name}`,
			);
			console.log(`  ${row.table_name}: ${countResult.rows[0].count} rows`);
		}

		// Verify indexes
		const indexResult = await client.query(`
			SELECT indexname, tablename
			FROM pg_indexes
			WHERE tablename IN (
			    'imta_program',
			    'interview_tip',
			    'interview_common_question',
			    'career_market_insight',
			    'career_employer',
			    'skill_library'
			)
			AND indexname NOT LIKE '%_pkey'
			ORDER BY tablename, indexname;
		`);

		console.log(`\nVerified ${indexResult.rows.length} indexes:`);
		for (const row of indexResult.rows) {
			console.log(`  - ${row.tablename}: ${row.indexname}`);
		}

		console.log("\nAll 6 reference data tables created successfully.");
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	} finally {
		await client.end();
	}
}

main();
