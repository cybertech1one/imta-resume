/**
 * Unit Tests for src/utils/color.ts
 *
 * Tests cover:
 * - rgbToHsv: RGB to HSV color conversion
 * - hsvToRgb: HSV to RGB color conversion
 * - parseRgbString: Parse RGB/RGBA/Hex strings
 * - rgbToString: Convert RGB to string
 * - hexToRgb: Convert hex to RGB
 */

import { describe, expect, it } from "vitest";
import {
	type ColorValue,
	type HSVColorValue,
	hexToRgb,
	hsvToRgb,
	parseRgbString,
	rgbToHsv,
	rgbToString,
} from "@/utils/color";

describe("color utilities", () => {
	// ==========================================================================
	// rgbToHsv Tests
	// ==========================================================================
	describe("rgbToHsv", () => {
		it("should convert pure red to HSV", () => {
			const rgb: ColorValue = { r: 255, g: 0, b: 0, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv).toEqual({ h: 0, s: 100, v: 100, a: 1 });
		});

		it("should convert pure green to HSV", () => {
			const rgb: ColorValue = { r: 0, g: 255, b: 0, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv).toEqual({ h: 120, s: 100, v: 100, a: 1 });
		});

		it("should convert pure blue to HSV", () => {
			const rgb: ColorValue = { r: 0, g: 0, b: 255, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv).toEqual({ h: 240, s: 100, v: 100, a: 1 });
		});

		it("should convert white to HSV", () => {
			const rgb: ColorValue = { r: 255, g: 255, b: 255, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv).toEqual({ h: 0, s: 0, v: 100, a: 1 });
		});

		it("should convert black to HSV", () => {
			const rgb: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv).toEqual({ h: 0, s: 0, v: 0, a: 1 });
		});

		it("should preserve alpha value", () => {
			const rgb: ColorValue = { r: 255, g: 0, b: 0, a: 0.5 };
			const hsv = rgbToHsv(rgb);
			expect(hsv.a).toBe(0.5);
		});

		it("should convert gray correctly", () => {
			const rgb: ColorValue = { r: 128, g: 128, b: 128, a: 1 };
			const hsv = rgbToHsv(rgb);
			expect(hsv.h).toBe(0);
			expect(hsv.s).toBe(0);
			expect(hsv.v).toBe(50);
		});
	});

	// ==========================================================================
	// hsvToRgb Tests
	// ==========================================================================
	describe("hsvToRgb", () => {
		it("should convert pure red HSV to RGB", () => {
			const hsv: HSVColorValue = { h: 0, s: 100, v: 100, a: 1 };
			const rgb = hsvToRgb(hsv);
			expect(rgb).toEqual({ r: 255, g: 0, b: 0, a: 1 });
		});

		it("should convert pure green HSV to RGB", () => {
			const hsv: HSVColorValue = { h: 120, s: 100, v: 100, a: 1 };
			const rgb = hsvToRgb(hsv);
			expect(rgb).toEqual({ r: 0, g: 255, b: 0, a: 1 });
		});

		it("should convert pure blue HSV to RGB", () => {
			const hsv: HSVColorValue = { h: 240, s: 100, v: 100, a: 1 };
			const rgb = hsvToRgb(hsv);
			expect(rgb).toEqual({ r: 0, g: 0, b: 255, a: 1 });
		});

		it("should preserve alpha value", () => {
			const hsv: HSVColorValue = { h: 0, s: 100, v: 100, a: 0.5 };
			const rgb = hsvToRgb(hsv);
			expect(rgb.a).toBe(0.5);
		});

		it("should be reversible with rgbToHsv", () => {
			const originalRgb: ColorValue = { r: 128, g: 64, b: 192, a: 0.8 };
			const hsv = rgbToHsv(originalRgb);
			const backToRgb = hsvToRgb(hsv);
			// Allow tolerance of 3 for rounding in RGB<->HSV conversion
			// HSV uses integer percentages (0-100) causing precision loss
			expect(backToRgb.r).toBeGreaterThanOrEqual(originalRgb.r - 3);
			expect(backToRgb.r).toBeLessThanOrEqual(originalRgb.r + 3);
			expect(backToRgb.g).toBeGreaterThanOrEqual(originalRgb.g - 3);
			expect(backToRgb.g).toBeLessThanOrEqual(originalRgb.g + 3);
			expect(backToRgb.b).toBeGreaterThanOrEqual(originalRgb.b - 3);
			expect(backToRgb.b).toBeLessThanOrEqual(originalRgb.b + 3);
			expect(backToRgb.a).toBe(originalRgb.a);
		});
	});

	// ==========================================================================
	// parseRgbString Tests
	// ==========================================================================
	describe("parseRgbString", () => {
		it("should parse rgb() string", () => {
			const result = parseRgbString("rgb(255, 128, 64)");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should parse rgba() string", () => {
			const result = parseRgbString("rgba(255, 128, 64, 0.5)");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 0.5 });
		});

		it("should parse 6-digit hex color", () => {
			const result = parseRgbString("#ff8040");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should parse 3-digit hex color", () => {
			const result = parseRgbString("#f80");
			expect(result).toEqual({ r: 255, g: 136, b: 0, a: 1 });
		});

		it("should handle uppercase hex", () => {
			const result = parseRgbString("#FF8040");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should return null for invalid input", () => {
			expect(parseRgbString("invalid")).toBeNull();
		});

		it("should return null for empty string", () => {
			expect(parseRgbString("")).toBeNull();
		});

		it("should handle whitespace", () => {
			const result = parseRgbString("  rgb(255, 128, 64)  ");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should parse rgb without alpha as 1", () => {
			const result = parseRgbString("rgb(0, 0, 0)");
			expect(result?.a).toBe(1);
		});
	});

	// ==========================================================================
	// rgbToString Tests
	// ==========================================================================
	describe("rgbToString", () => {
		it("should convert RGB with alpha 1 to rgb() string", () => {
			const color: ColorValue = { r: 255, g: 128, b: 64, a: 1 };
			expect(rgbToString(color)).toBe("rgb(255, 128, 64)");
		});

		it("should convert RGB with alpha < 1 to rgba() string", () => {
			const color: ColorValue = { r: 255, g: 128, b: 64, a: 0.5 };
			expect(rgbToString(color)).toBe("rgba(255, 128, 64, 0.5)");
		});

		it("should handle black color", () => {
			const color: ColorValue = { r: 0, g: 0, b: 0, a: 1 };
			expect(rgbToString(color)).toBe("rgb(0, 0, 0)");
		});

		it("should handle white color", () => {
			const color: ColorValue = { r: 255, g: 255, b: 255, a: 1 };
			expect(rgbToString(color)).toBe("rgb(255, 255, 255)");
		});
	});

	// ==========================================================================
	// hexToRgb Tests
	// ==========================================================================
	describe("hexToRgb", () => {
		it("should convert 6-digit hex to RGB", () => {
			const result = hexToRgb("#ff8040");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should convert hex without # prefix", () => {
			const result = hexToRgb("ff8040");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});

		it("should use custom alpha value", () => {
			const result = hexToRgb("#ff8040", 0.5);
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 0.5 });
		});

		it("should return black for invalid hex", () => {
			const result = hexToRgb("invalid");
			expect(result).toEqual({ r: 0, g: 0, b: 0, a: 1 });
		});

		it("should handle uppercase hex", () => {
			const result = hexToRgb("#FF8040");
			expect(result).toEqual({ r: 255, g: 128, b: 64, a: 1 });
		});
	});
});
