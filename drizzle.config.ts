import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

export default defineConfig({
	out: "./migrations",
	dialect: "postgresql",
	schema: "./src/integrations/drizzle/schema.ts",
	dbCredentials: {
		url: databaseUrl,
	},
});
