/**
 * Vitest Global Setup File
 *
 * This file runs once before all test files.
 * Use it for one-time setup like:
 * - Starting test database containers
 * - Creating test fixtures
 * - Setting up external services
 */

export async function setup() {
	console.log("\n[Test Setup] Starting global test setup...");

	// You can add database container setup here using testcontainers
	// Example:
	// const pgContainer = await new PostgreSqlContainer().start();
	// process.env.TEST_DATABASE_URL = pgContainer.getConnectionUri();

	console.log("[Test Setup] Global setup complete.\n");
}

export async function teardown() {
	console.log("\n[Test Teardown] Starting global teardown...");

	// Clean up any resources created in setup
	// Example: await pgContainer.stop();

	console.log("[Test Teardown] Global teardown complete.\n");
}

export default async function globalSetup() {
	await setup();

	return async () => {
		await teardown();
	};
}
