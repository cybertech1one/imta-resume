/**
 * Unit Tests for src/utils/string.ts
 *
 * Tests cover:
 * - generateId: UUID v7 generation
 * - slugify: String slugification
 * - getInitials: Name to initials conversion
 * - toUsername: Username sanitization
 * - generateRandomName: Random name generation
 * - stripHtml: HTML tag removal
 */

import { describe, expect, it } from "vitest";
import { generateId, generateRandomName, getInitials, slugify, stripHtml, toUsername } from "@/utils/string";

describe("string utilities", () => {
	// ==========================================================================
	// generateId Tests
	// ==========================================================================
	describe("generateId", () => {
		it("should return a string", () => {
			const id = generateId();
			expect(typeof id).toBe("string");
		});

		it("should return a non-empty string", () => {
			const id = generateId();
			expect(id.length).toBeGreaterThan(0);
		});

		it("should generate unique IDs on subsequent calls", () => {
			const ids = new Set<string>();
			for (let i = 0; i < 100; i++) {
				ids.add(generateId());
			}
			expect(ids.size).toBe(100);
		});
	});

	// ==========================================================================
	// slugify Tests
	// ==========================================================================
	describe("slugify", () => {
		it("should convert spaces to hyphens", () => {
			expect(slugify("hello world")).toBe("hello-world");
		});

		it("should convert to lowercase", () => {
			expect(slugify("HELLO WORLD")).toBe("hello-world");
		});

		it("should handle special characters", () => {
			expect(slugify("Hello! World?")).toBe("hello-world");
		});

		it("should preserve camelCase (decamelize: false)", () => {
			// Based on the implementation: _slugify(value, { decamelize: false })
			expect(slugify("myResumeName")).toBe("myresumename");
		});

		it("should handle empty string", () => {
			expect(slugify("")).toBe("");
		});

		it("should handle accented characters", () => {
			expect(slugify("cafe")).toBe("cafe");
		});

		it("should handle multiple spaces", () => {
			expect(slugify("hello   world")).toBe("hello-world");
		});
	});

	// ==========================================================================
	// getInitials Tests
	// ==========================================================================
	describe("getInitials", () => {
		it("should return two initials for a full name", () => {
			expect(getInitials("John Doe")).toBe("JD");
		});

		it("should return one initial for a single name", () => {
			expect(getInitials("John")).toBe("J");
		});

		it("should return uppercase initials", () => {
			expect(getInitials("john doe")).toBe("JD");
		});

		it("should handle names with more than two parts", () => {
			expect(getInitials("John Michael Doe")).toBe("JM");
		});

		it("should handle hyphenated names", () => {
			expect(getInitials("Mary-Jane Watson")).toBe("MW");
		});

		it("should handle empty string", () => {
			expect(getInitials("")).toBe("");
		});
	});

	// ==========================================================================
	// toUsername Tests
	// ==========================================================================
	describe("toUsername", () => {
		it("should convert to lowercase", () => {
			expect(toUsername("JohnDoe")).toBe("johndoe");
		});

		it("should remove special characters except dots, hyphens, underscores", () => {
			expect(toUsername("john@doe!")).toBe("johndoe");
		});

		it("should preserve dots", () => {
			expect(toUsername("john.doe")).toBe("john.doe");
		});

		it("should preserve hyphens", () => {
			expect(toUsername("john-doe")).toBe("john-doe");
		});

		it("should preserve underscores", () => {
			expect(toUsername("john_doe")).toBe("john_doe");
		});

		it("should trim whitespace", () => {
			expect(toUsername("  johndoe  ")).toBe("johndoe");
		});

		it("should remove spaces", () => {
			expect(toUsername("john doe")).toBe("johndoe");
		});

		it("should truncate to 64 characters", () => {
			const longName = "a".repeat(100);
			expect(toUsername(longName).length).toBe(64);
		});
	});

	// ==========================================================================
	// generateRandomName Tests
	// ==========================================================================
	describe("generateRandomName", () => {
		it("should return a string", () => {
			const name = generateRandomName();
			expect(typeof name).toBe("string");
		});

		it("should return a non-empty string", () => {
			const name = generateRandomName();
			expect(name.length).toBeGreaterThan(0);
		});

		it("should contain three words separated by spaces", () => {
			const name = generateRandomName();
			const parts = name.split(" ");
			expect(parts.length).toBe(3);
		});

		it("should have capitalized words", () => {
			const name = generateRandomName();
			const parts = name.split(" ");
			for (const part of parts) {
				expect(part[0]).toBe(part[0].toUpperCase());
			}
		});
	});

	// ==========================================================================
	// stripHtml Tests
	// ==========================================================================
	describe("stripHtml", () => {
		it("should remove simple HTML tags", () => {
			expect(stripHtml("<p>Hello</p>")).toBe("Hello");
		});

		it("should remove nested HTML tags", () => {
			expect(stripHtml("<div><p>Hello</p></div>")).toBe("Hello");
		});

		it("should remove tags with attributes", () => {
			expect(stripHtml('<a href="https://example.com">Link</a>')).toBe("Link");
		});

		it("should handle multiple tags", () => {
			expect(stripHtml("<p>Hello</p><p>World</p>")).toBe("HelloWorld");
		});

		it("should handle self-closing tags", () => {
			expect(stripHtml("Hello<br/>World")).toBe("HelloWorld");
		});

		it("should trim the result", () => {
			expect(stripHtml("  <p>Hello</p>  ")).toBe("Hello");
		});

		it("should handle empty string", () => {
			expect(stripHtml("")).toBe("");
		});

		it("should return plain text unchanged", () => {
			expect(stripHtml("Hello World")).toBe("Hello World");
		});
	});
});
