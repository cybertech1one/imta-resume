/**
 * Vitest Setup File
 *
 * This file runs before each test file. Use it to:
 * - Set up global test utilities
 * - Configure mocks that should be available in all tests
 * - Set up test environment variables
 */

import { afterAll, afterEach, beforeAll, vi } from "vitest";

// ============================================================================
// Environment Setup
// ============================================================================

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.APP_URL = "http://localhost:3000";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test_db";
process.env.AUTH_SECRET = "test-secret-key-for-testing-only";

// ============================================================================
// Global Mocks
// ============================================================================

// Mock crypto.randomUUID for consistent test IDs
vi.mock("uuid", () => ({
	v7: vi.fn(() => "test-uuid-" + Math.random().toString(36).substring(7)),
}));

// Mock Lingui's t function for translations in tests
// The t function is used as a tagged template literal: t`text`
// It must handle both tagged template usage and function call usage
const mockT = (strings: TemplateStringsArray | string, ...values: unknown[]): string => {
	if (typeof strings === "string") {
		return strings;
	}
	// Tagged template literal usage
	return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
};

// Mock msg function (returns the message descriptor)
const mockMsg = (strings: TemplateStringsArray | string, ...values: unknown[]) => {
	if (typeof strings === "string") {
		return { id: strings, message: strings };
	}
	const message = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
	return { id: message, message };
};

vi.mock("@lingui/core/macro", () => ({
	t: mockT,
	msg: mockMsg,
	// Also export as default in case it's imported differently
	default: { t: mockT, msg: mockMsg },
}));

vi.mock("@lingui/react/macro", () => ({
	Trans: ({ children }: { children: React.ReactNode }) => children,
	t: mockT,
}));

// Also mock @lingui/macro which is sometimes used
vi.mock("@lingui/macro", () => ({
	t: mockT,
	msg: mockMsg,
	Trans: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock DOMPurify for Node.js environment (tests run in happy-dom but some mocking helps)
vi.mock("dompurify", () => {
	const sanitize = (
		html: string,
		config?: {
			ALLOWED_TAGS?: string[];
			ALLOWED_ATTR?: string[];
			KEEP_CONTENT?: boolean;
			RETURN_TRUSTED_TYPE?: boolean;
		},
	) => {
		if (!html) return "";
		// If no tags allowed, strip all HTML
		if (config?.ALLOWED_TAGS?.length === 0) {
			return html.replace(/<[^>]*>/g, "");
		}
		// Basic implementation that preserves safe tags
		return html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
			.replace(/javascript:/gi, "");
	};

	return {
		default: {
			sanitize,
			addHook: vi.fn(),
		},
		sanitize,
	};
});

// Mock date for consistent timestamps in tests
const MOCK_DATE = new Date("2026-02-09T12:00:00.000Z");

beforeAll(() => {
	vi.useFakeTimers();
	vi.setSystemTime(MOCK_DATE);
});

afterAll(() => {
	vi.useRealTimers();
});

// ============================================================================
// Cleanup
// ============================================================================

afterEach(() => {
	// Clear all mocks after each test
	vi.clearAllMocks();
});

// ============================================================================
// Global Test Utilities
// ============================================================================

/**
 * Helper to create a mock database response
 */
export function createMockDbResult<T>(data: T[]) {
	return data;
}

/**
 * Helper to wait for async operations
 */
export function flushPromises(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Helper to create mock request context
 */
export function createMockContext(overrides: Record<string, unknown> = {}) {
	return {
		user: {
			id: "test-user-id",
			email: "test@example.com",
			name: "Test User",
		},
		session: {
			id: "test-session-id",
		},
		...overrides,
	};
}
