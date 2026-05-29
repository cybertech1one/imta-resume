/**
 * Unit Tests for src/utils/theme.ts
 *
 * Tests cover:
 * - isTheme: Theme string validation
 *
 * Note: getTheme and setThemeServerFn are isomorphic functions that require
 * server/client environments and are tested in integration tests.
 */

import { describe, expect, it } from "vitest";
import { isTheme } from "@/utils/theme";

describe("theme utilities", () => {
	// ==========================================================================
	// isTheme Tests
	// ==========================================================================
	describe("isTheme", () => {
		describe("valid themes", () => {
			it("should accept 'light'", () => {
				expect(isTheme("light")).toBe(true);
			});

			it("should accept 'dark'", () => {
				expect(isTheme("dark")).toBe(true);
			});
		});

		describe("invalid themes", () => {
			it("should reject empty string", () => {
				expect(isTheme("")).toBe(false);
			});

			it("should reject 'system'", () => {
				expect(isTheme("system")).toBe(false);
			});

			it("should reject 'auto'", () => {
				expect(isTheme("auto")).toBe(false);
			});

			it("should reject uppercase 'LIGHT'", () => {
				expect(isTheme("LIGHT")).toBe(false);
			});

			it("should reject uppercase 'DARK'", () => {
				expect(isTheme("DARK")).toBe(false);
			});

			it("should reject mixed case 'Light'", () => {
				expect(isTheme("Light")).toBe(false);
			});

			it("should reject mixed case 'Dark'", () => {
				expect(isTheme("Dark")).toBe(false);
			});

			it("should reject random strings", () => {
				expect(isTheme("random")).toBe(false);
				expect(isTheme("blue")).toBe(false);
				expect(isTheme("night")).toBe(false);
			});

			it("should reject numbers as strings", () => {
				expect(isTheme("0")).toBe(false);
				expect(isTheme("1")).toBe(false);
			});

			it("should reject whitespace", () => {
				expect(isTheme(" light")).toBe(false);
				expect(isTheme("dark ")).toBe(false);
				expect(isTheme(" ")).toBe(false);
			});
		});

		describe("type guard behavior", () => {
			it("should narrow type to Theme for valid values", () => {
				const value = "light";
				if (isTheme(value)) {
					// TypeScript should recognize value as Theme here
					const theme: "light" | "dark" = value;
					expect(theme).toBe("light");
				}
			});
		});
	});
});
