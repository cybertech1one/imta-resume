/**
 * Unit Tests for src/utils/locale.ts
 *
 * Tests cover:
 * - isLocale: Locale string validation
 * - isRTL: Right-to-left language detection
 *
 * Note: getLocale and setLocaleServerFn are isomorphic functions that require
 * server/client environments and are tested in integration tests.
 */

import { describe, expect, it } from "vitest";
import { isLocale, isRTL } from "@/utils/locale";

describe("locale utilities", () => {
	// ==========================================================================
	// isLocale Tests
	// ==========================================================================
	describe("isLocale", () => {
		describe("valid locales", () => {
			it("should accept en-US", () => {
				expect(isLocale("en-US")).toBe(true);
			});

			it("should accept fr-FR", () => {
				expect(isLocale("fr-FR")).toBe(true);
			});

			it("should accept ar-SA", () => {
				expect(isLocale("ar-SA")).toBe(true);
			});

			it("should accept zh-CN", () => {
				expect(isLocale("zh-CN")).toBe(true);
			});

			it("should accept zh-TW", () => {
				expect(isLocale("zh-TW")).toBe(true);
			});

			it("should accept de-DE", () => {
				expect(isLocale("de-DE")).toBe(true);
			});

			it("should accept ja-JP", () => {
				expect(isLocale("ja-JP")).toBe(true);
			});

			it("should accept pt-BR", () => {
				expect(isLocale("pt-BR")).toBe(true);
			});

			it("should accept pt-PT", () => {
				expect(isLocale("pt-PT")).toBe(true);
			});

			it("should accept es-ES", () => {
				expect(isLocale("es-ES")).toBe(true);
			});

			it("should accept he-IL (Hebrew)", () => {
				expect(isLocale("he-IL")).toBe(true);
			});

			it("should accept fa-IR (Persian)", () => {
				expect(isLocale("fa-IR")).toBe(true);
			});
		});

		describe("invalid locales", () => {
			it("should reject plain language code", () => {
				expect(isLocale("en")).toBe(false);
			});

			it("should reject invalid format", () => {
				expect(isLocale("english")).toBe(false);
			});

			it("should reject empty string", () => {
				expect(isLocale("")).toBe(false);
			});

			it("should reject unsupported locale", () => {
				expect(isLocale("xx-XX")).toBe(false);
			});

			it("should reject wrong case", () => {
				expect(isLocale("en-us")).toBe(false);
				expect(isLocale("EN-US")).toBe(false);
			});

			it("should reject malformed locale", () => {
				expect(isLocale("en_US")).toBe(false);
				expect(isLocale("enUS")).toBe(false);
			});
		});
	});

	// ==========================================================================
	// isRTL Tests
	// ==========================================================================
	describe("isRTL", () => {
		describe("RTL languages", () => {
			it("should return true for Arabic (ar-SA)", () => {
				expect(isRTL("ar-SA")).toBe(true);
			});

			it("should return true for Hebrew (he-IL)", () => {
				expect(isRTL("he-IL")).toBe(true);
			});

			it("should return true for Persian/Farsi (fa-IR)", () => {
				expect(isRTL("fa-IR")).toBe(true);
			});

			it("should return true for Urdu (ur-PK)", () => {
				expect(isRTL("ur-PK")).toBe(true);
			});

			it("should return true for Yiddish (yi)", () => {
				expect(isRTL("yi")).toBe(true);
			});

			it("should return true for Pashto (ps)", () => {
				expect(isRTL("ps")).toBe(true);
			});

			it("should return true for Kurdish Sorani (ckb)", () => {
				expect(isRTL("ckb")).toBe(true);
			});

			it("should return true for Dhivehi (dv)", () => {
				expect(isRTL("dv")).toBe(true);
			});

			it("should return true for Sindhi (sd)", () => {
				expect(isRTL("sd")).toBe(true);
			});

			it("should return true for Uyghur (ug)", () => {
				expect(isRTL("ug")).toBe(true);
			});
		});

		describe("LTR languages", () => {
			it("should return false for English (en-US)", () => {
				expect(isRTL("en-US")).toBe(false);
			});

			it("should return false for French (fr-FR)", () => {
				expect(isRTL("fr-FR")).toBe(false);
			});

			it("should return false for German (de-DE)", () => {
				expect(isRTL("de-DE")).toBe(false);
			});

			it("should return false for Chinese (zh-CN)", () => {
				expect(isRTL("zh-CN")).toBe(false);
			});

			it("should return false for Japanese (ja-JP)", () => {
				expect(isRTL("ja-JP")).toBe(false);
			});

			it("should return false for Korean (ko-KR)", () => {
				expect(isRTL("ko-KR")).toBe(false);
			});

			it("should return false for Russian (ru-RU)", () => {
				expect(isRTL("ru-RU")).toBe(false);
			});

			it("should return false for Hindi (hi-IN)", () => {
				// Hindi uses Devanagari script which is LTR
				expect(isRTL("hi-IN")).toBe(false);
			});
		});

		describe("edge cases", () => {
			it("should handle language code without region", () => {
				expect(isRTL("ar")).toBe(true);
				expect(isRTL("en")).toBe(false);
			});

			it("should be case-insensitive for language code", () => {
				expect(isRTL("AR-SA")).toBe(true);
				expect(isRTL("Ar-Sa")).toBe(true);
			});

			it("should handle unknown language codes", () => {
				expect(isRTL("xx-XX")).toBe(false);
			});
		});
	});
});
