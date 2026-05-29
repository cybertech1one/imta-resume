import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for E2E Tests
 *
 * Run tests with: pnpm test:e2e
 * Run in headed mode: pnpm test:e2e --headed
 * Run specific test: pnpm test:e2e tests/e2e/resume-workflow.spec.ts
 */

export default defineConfig({
	// Test directory
	testDir: "./tests/e2e",

	// Test file patterns
	testMatch: "**/*.spec.ts",

	// Run tests in parallel
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code
	forbidOnly: !!process.env.CI,

	// Retry failed tests on CI
	retries: process.env.CI ? 2 : 0,

	// Limit parallel workers on CI
	workers: process.env.CI ? 1 : undefined,

	// Reporter configuration
	reporter: [
		["list"],
		["html", { outputFolder: "playwright-report" }],
		["json", { outputFile: "playwright-report/test-results.json" }],
	],

	// Shared settings for all projects
	use: {
		// Base URL for tests
		baseURL: process.env.APP_URL || "http://localhost:3000",

		// Collect trace when retrying failed tests
		trace: "on-first-retry",

		// Take screenshot on failure
		screenshot: "only-on-failure",

		// Record video on failure
		video: "on-first-retry",

		// Viewport size
		viewport: { width: 1280, height: 720 },

		// Ignore HTTPS errors
		ignoreHTTPSErrors: true,

		// Timeout for actions (clicks, fills, etc.)
		actionTimeout: 10000,

		// Timeout for navigations
		navigationTimeout: 30000,
	},

	// Global timeout for each test
	timeout: 60000,

	// Expect timeout
	expect: {
		timeout: 10000,
	},

	// Configure projects for different browsers
	projects: [
		// Desktop browsers
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},

		// Mobile browsers (optional - uncomment to enable)
		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 12"] },
		// },
	],

	// Run local dev server before tests
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		stdout: "pipe",
		stderr: "pipe",
		env: {
			NODE_ENV: "test",
			DATABASE_URL: process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test_db",
			AUTH_SECRET: process.env.AUTH_SECRET || "test-secret",
		},
	},

	// Output directory for test artifacts
	outputDir: "test-results",
});
