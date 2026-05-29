import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},

	test: {
		// Test environment
		environment: "node",

		// Include patterns
		include: ["src/**/*.{test,spec}.{ts,tsx}", "tests/**/*.{test,spec}.{ts,tsx}"],

		// Exclude patterns
		exclude: ["node_modules", ".output", "dist", "**/*.d.ts"],

		// Global test timeout
		testTimeout: 30000,

		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			reportsDirectory: "./coverage",
			exclude: [
				"node_modules/**",
				"**/*.d.ts",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/types.ts",
				"**/__mocks__/**",
				"**/__tests__/**",
				".output/**",
				"dist/**",
				"vite.config.ts",
				"vitest.config.ts",
				"drizzle.config.ts",
				"lingui.config.ts",
				"biome.json",
				"tailwind.config.ts",
			],
			thresholds: {
				// Initial thresholds - increase as coverage improves
				statements: 20,
				branches: 20,
				functions: 20,
				lines: 20,
			},
		},

		// Setup files (run before each test file)
		setupFiles: ["./tests/setup.ts"],

		// Global setup (run once before all tests)
		globalSetup: "./tests/global-setup.ts",

		// Reporter configuration
		reporters: ["default", "html"],

		// Pool configuration for parallelization
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: false,
			},
		},

		// Retry failed tests
		retry: 1,

		// Watch mode configuration
		watch: false,

		// Type checking
		typecheck: {
			enabled: true,
			checker: "tsc",
			include: ["src/**/*.{test,spec}.ts"],
		},
	},
});
