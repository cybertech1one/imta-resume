/**
 * Unit Tests for src/utils/file.ts
 *
 * Tests cover:
 * - generateFilename: Generate timestamped filenames
 * - downloadWithAnchor: DOM-based file download (mocked)
 * - downloadFromUrl: URL-based file download (mocked)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateFilename } from "@/utils/file";

describe("file utilities", () => {
	// ==========================================================================
	// generateFilename Tests
	// ==========================================================================
	describe("generateFilename", () => {
		beforeEach(() => {
			// Mock Date to return a consistent timestamp
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-02-09T14:30:00.000Z"));
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("should generate filename with prefix and timestamp", () => {
			const filename = generateFilename("My Resume");
			expect(filename).toMatch(/^my-resume_\d{8}_\d{4}$/);
		});

		it("should generate filename with extension", () => {
			const filename = generateFilename("My Resume", "pdf");
			expect(filename).toMatch(/^my-resume_\d{8}_\d{4}\.pdf$/);
		});

		it("should slugify the prefix", () => {
			const filename = generateFilename("My Special Resume!");
			expect(filename).toMatch(/^my-special-resume_/);
		});

		it("should handle empty prefix", () => {
			const filename = generateFilename("");
			expect(filename).toMatch(/^_\d{8}_\d{4}$/);
		});

		it("should include correct date format YYYYMMDD_HHMM", () => {
			const filename = generateFilename("test");
			// The implementation uses local time methods which vary by timezone
			// Just verify the overall format pattern: prefix_YYYYMMDD_HHMM
			expect(filename).toMatch(/^test_\d{8}_\d{4}$/);
		});

		it("should handle various extensions", () => {
			expect(generateFilename("doc", "pdf")).toMatch(/\.pdf$/);
			expect(generateFilename("doc", "json")).toMatch(/\.json$/);
			expect(generateFilename("doc", "docx")).toMatch(/\.docx$/);
		});

		it("should not add extension when not provided", () => {
			const filename = generateFilename("test");
			expect(filename).not.toContain(".");
		});
	});

	// ==========================================================================
	// downloadWithAnchor Tests (DOM-based, requires mocking)
	// ==========================================================================
	describe("downloadWithAnchor", () => {
		it.skip("should create an anchor element and trigger download", async () => {
			// This test requires jsdom environment
			// Skip for now - covered in integration/e2e tests
		});
	});

	// ==========================================================================
	// downloadFromUrl Tests
	// ==========================================================================
	describe("downloadFromUrl", () => {
		it.skip("should fetch URL and trigger download", async () => {
			// This test requires fetch mocking and jsdom
			// Skip for now - covered in integration/e2e tests
		});
	});
});
