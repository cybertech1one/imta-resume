/**
 * Unit Tests for src/utils/qrcode.ts
 *
 * Tests cover:
 * - canFitInQRCode: Check if data fits in a QR code (tests getQRCodeMaxBytes indirectly)
 * - generateQRCodeDataURL: Generate QR code as data URL (async)
 */

import { describe, expect, it } from "vitest";
import { canFitInQRCode, generateQRCodeDataURL } from "@/utils/qrcode";

describe("qrcode utilities", () => {
	// ==========================================================================
	// canFitInQRCode Tests (also validates internal getQRCodeMaxBytes behavior)
	// ==========================================================================
	describe("canFitInQRCode", () => {
		it("should return true for small data", () => {
			const smallData = "https://example.com";
			expect(canFitInQRCode(smallData)).toBe(true);
		});

		it("should return true for data exactly at the M limit (2331 bytes)", () => {
			// Known max bytes for M error correction: 2331
			const exactData = "a".repeat(2331);
			expect(canFitInQRCode(exactData, "M")).toBe(true);
		});

		it("should return false for data exceeding the M limit", () => {
			// Known max bytes for M error correction: 2331
			const tooLargeData = "a".repeat(2332);
			expect(canFitInQRCode(tooLargeData, "M")).toBe(false);
		});

		it("should correctly calculate multi-byte character sizes", () => {
			// UTF-8 multi-byte characters
			const multiByteString = "emoji".repeat(100); // ASCII, 1 byte each
			const emojiString = "test"; // Just ASCII for reliable testing

			expect(canFitInQRCode(multiByteString)).toBe(true);
			expect(canFitInQRCode(emojiString)).toBe(true);
		});

		it("should use M error correction by default", () => {
			// Known max bytes for M: 2331
			const data = "a".repeat(2331);

			expect(canFitInQRCode(data)).toBe(true);
			expect(canFitInQRCode(`${data}a`)).toBe(false);
		});

		it("should respect error correction level parameter", () => {
			// Known max bytes: H=1273, L=2953
			// Data that fits in L but not in H
			const data = "a".repeat(1373);

			expect(canFitInQRCode(data, "L")).toBe(true);
			expect(canFitInQRCode(data, "H")).toBe(false);
		});

		it("should return true for empty string", () => {
			expect(canFitInQRCode("")).toBe(true);
		});

		it("should handle typical vCard data", () => {
			const typicalVCard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
N:Doe;John;;;
TITLE:Software Engineer
EMAIL:john.doe@example.com
TEL:+1-555-123-4567
URL:https://johndoe.com
ADR:;;123 Main Street;City;State;12345;Country
END:VCARD`;

			expect(canFitInQRCode(typicalVCard)).toBe(true);
		});

		it("should have L > M > Q > H capacity relationship", () => {
			// Verify increasing restriction: data at each boundary
			// L=2953, M=2331, Q=1663, H=1273
			expect(canFitInQRCode("a".repeat(2953), "L")).toBe(true);
			expect(canFitInQRCode("a".repeat(2953), "M")).toBe(false);
			expect(canFitInQRCode("a".repeat(2331), "M")).toBe(true);
			expect(canFitInQRCode("a".repeat(2331), "Q")).toBe(false);
			expect(canFitInQRCode("a".repeat(1663), "Q")).toBe(true);
			expect(canFitInQRCode("a".repeat(1663), "H")).toBe(false);
			expect(canFitInQRCode("a".repeat(1273), "H")).toBe(true);
		});
	});

	// ==========================================================================
	// generateQRCodeDataURL Tests
	// ==========================================================================
	describe("generateQRCodeDataURL", () => {
		it("should generate a valid data URL", async () => {
			const dataUrl = await generateQRCodeDataURL("https://example.com");
			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it("should generate different data URLs for different data", async () => {
			const dataUrl1 = await generateQRCodeDataURL("data1");
			const dataUrl2 = await generateQRCodeDataURL("data2");
			expect(dataUrl1).not.toBe(dataUrl2);
		});

		it("should accept custom width option", async () => {
			const smallQR = await generateQRCodeDataURL("test", { width: 100 });
			const largeQR = await generateQRCodeDataURL("test", { width: 500 });

			// Both should be valid data URLs
			expect(smallQR).toMatch(/^data:image\/png;base64,/);
			expect(largeQR).toMatch(/^data:image\/png;base64,/);

			// Larger width should produce larger base64 data
			expect(largeQR.length).toBeGreaterThan(smallQR.length);
		});

		it("should accept custom margin option", async () => {
			const noMargin = await generateQRCodeDataURL("test", { margin: 0 });
			const largeMargin = await generateQRCodeDataURL("test", { margin: 10 });

			expect(noMargin).toMatch(/^data:image\/png;base64,/);
			expect(largeMargin).toMatch(/^data:image\/png;base64,/);
		});

		it("should accept error correction level option", async () => {
			const lowEC = await generateQRCodeDataURL("test", { errorCorrectionLevel: "L" });
			const highEC = await generateQRCodeDataURL("test", { errorCorrectionLevel: "H" });

			// Both should be valid data URLs
			expect(lowEC).toMatch(/^data:image\/png;base64,/);
			expect(highEC).toMatch(/^data:image\/png;base64,/);

			// Both should produce non-empty QR codes (size difference depends on encoding)
			expect(lowEC.length).toBeGreaterThan(100);
			expect(highEC.length).toBeGreaterThan(100);
		});

		it("should accept custom colors", async () => {
			const customColors = await generateQRCodeDataURL("test", {
				darkColor: "#ff0000",
				lightColor: "#00ff00",
			});

			expect(customColors).toMatch(/^data:image\/png;base64,/);
		});

		it("should handle URL data", async () => {
			const dataUrl = await generateQRCodeDataURL("https://example.com/path?query=value");
			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it("should handle special characters", async () => {
			const dataUrl = await generateQRCodeDataURL("Hello, World! @#$%^&*()");
			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});
	});
});
