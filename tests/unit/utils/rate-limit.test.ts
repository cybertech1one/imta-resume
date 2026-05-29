/**
 * Unit Tests for src/utils/rate-limit.ts
 *
 * Tests cover:
 * - createRateLimiter: Factory function for rate limiters
 * - Rate limit checking and enforcement
 * - Pre-configured rate limiters (auth, api, etc.)
 * - getClientIdentifier: Client identification helper
 * - RateLimitExceededError: Error class
 *
 * These are CRITICAL security tests for preventing:
 * - Brute-force attacks
 * - Denial of service
 * - API abuse
 */

import { describe, expect, it, vi } from "vitest";
import {
	apiRateLimiter,
	authRateLimiter,
	createRateLimiter,
	getClientIdentifier,
	RateLimitExceededError,
} from "@/utils/rate-limit";

// Helper to generate unique user IDs to avoid state collision in singleton store
let testCounter = 0;
const getUniqueId = (prefix = "user") => `${prefix}-${++testCounter}-${Date.now()}`;

describe("rate-limit utilities", () => {
	// Note: Fake timers are set up globally in tests/setup.ts

	// ==========================================================================
	// createRateLimiter Tests
	// ==========================================================================
	describe("createRateLimiter", () => {
		it("should create a rate limiter with check, reset, and status methods", () => {
			const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });
			expect(typeof limiter.check).toBe("function");
			expect(typeof limiter.reset).toBe("function");
			expect(typeof limiter.status).toBe("function");
		});

		describe("check method", () => {
			it("should allow requests within the limit", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 3, windowMs: 1000 });
				const result1 = await limiter.check(userId);
				const result2 = await limiter.check(userId);
				const result3 = await limiter.check(userId);

				expect(result1.allowed).toBe(true);
				expect(result2.allowed).toBe(true);
				expect(result3.allowed).toBe(true);
			});

			it("should block requests that exceed the limit", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 2, windowMs: 1000 });

				await limiter.check(userId); // 1st
				await limiter.check(userId); // 2nd
				const result = await limiter.check(userId); // 3rd - should be blocked

				expect(result.allowed).toBe(false);
			});

			it("should track remaining requests correctly", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 3, windowMs: 1000 });

				const result1 = await limiter.check(userId);
				expect(result1.remaining).toBe(2);

				const result2 = await limiter.check(userId);
				expect(result2.remaining).toBe(1);

				const result3 = await limiter.check(userId);
				expect(result3.remaining).toBe(0);

				const result4 = await limiter.check(userId);
				expect(result4.remaining).toBe(0);
			});

			it("should provide retryAfter when blocked", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 5000 });

				await limiter.check(userId);
				const result = await limiter.check(userId);

				expect(result.allowed).toBe(false);
				expect(result.retryAfter).toBeDefined();
				expect(result.retryAfter).toBeGreaterThan(0);
				expect(result.retryAfter).toBeLessThanOrEqual(5);
			});

			it("should isolate different identifiers", async () => {
				const userId1 = getUniqueId();
				const userId2 = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });

				const result1 = await limiter.check(userId1);
				const result2 = await limiter.check(userId2);

				expect(result1.allowed).toBe(true);
				expect(result2.allowed).toBe(true);
			});

			it("should reset after the window expires", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 1000 });

				await limiter.check(userId); // First request
				const blocked = await limiter.check(userId); // Should be blocked
				expect(blocked.allowed).toBe(false);

				// Advance time past the window
				vi.advanceTimersByTime(1100);

				const result = await limiter.check(userId);
				expect(result.allowed).toBe(true);
			});
		});

		describe("reset method", () => {
			it("should reset the rate limit for an identifier", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });

				await limiter.check(userId);
				const blocked = await limiter.check(userId);
				expect(blocked.allowed).toBe(false);

				await limiter.reset(userId);

				const result = await limiter.check(userId);
				expect(result.allowed).toBe(true);
			});

			it("should not affect other identifiers", async () => {
				const userId1 = getUniqueId();
				const userId2 = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60000 });

				await limiter.check(userId1);
				await limiter.check(userId2);

				await limiter.reset(userId1);

				const status2 = await limiter.status(userId2);
				expect(status2.remaining).toBe(0);
			});
		});

		describe("status method", () => {
			it("should return full limit for new identifiers", async () => {
				const userId = getUniqueId("new-user");
				const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });
				const status = await limiter.status(userId);

				expect(status.allowed).toBe(true);
				expect(status.remaining).toBe(5);
			});

			it("should return current status without incrementing", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 5, windowMs: 1000 });

				await limiter.check(userId);
				const status1 = await limiter.status(userId);
				const status2 = await limiter.status(userId);

				expect(status1.remaining).toBe(4);
				expect(status2.remaining).toBe(4); // Should not have decremented
			});

			it("should provide retryAfter when at limit", async () => {
				const userId = getUniqueId();
				const limiter = createRateLimiter({ maxRequests: 1, windowMs: 5000 });

				await limiter.check(userId);
				const status = await limiter.status(userId);

				expect(status.allowed).toBe(false);
				expect(status.retryAfter).toBeDefined();
			});
		});

		describe("key prefix", () => {
			it("should namespace keys with prefix", async () => {
				const userId = getUniqueId();
				const limiter1 = createRateLimiter({ maxRequests: 1, windowMs: 1000, keyPrefix: "auth" });
				const limiter2 = createRateLimiter({ maxRequests: 1, windowMs: 1000, keyPrefix: "api" });

				await limiter1.check(userId);
				const result = await limiter2.check(userId);

				// Different prefixes should not share limits
				expect(result.allowed).toBe(true);
			});
		});
	});

	// ==========================================================================
	// Pre-configured Rate Limiters
	// ==========================================================================
	describe("pre-configured rate limiters", () => {
		describe("authRateLimiter", () => {
			it("should allow 5 requests per minute", async () => {
				for (let i = 0; i < 5; i++) {
					const result = await authRateLimiter.check(`auth-test-${Date.now()}-${i}`);
					expect(result.allowed).toBe(true);
				}
			});
		});

		describe("apiRateLimiter", () => {
			it("should allow 100 requests per minute", async () => {
				// Just verify it exists and works
				const result = await apiRateLimiter.check("api-test-user");
				expect(result.allowed).toBe(true);
				expect(result.remaining).toBe(99);
			});
		});
	});

	// ==========================================================================
	// getClientIdentifier Tests
	// ==========================================================================
	describe("getClientIdentifier", () => {
		it("should prioritize API key if provided", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "1.2.3.4");

			const result = getClientIdentifier(headers, "user123", "api-key-abc");
			expect(result).toBe("apikey:api-key-abc");
		});

		it("should prioritize user ID over IP if no API key", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "1.2.3.4");

			const result = getClientIdentifier(headers, "user123");
			expect(result).toBe("user:user123");
		});

		it("should use x-forwarded-for IP if no user or API key", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "1.2.3.4, 5.6.7.8");

			const result = getClientIdentifier(headers);
			expect(result).toBe("ip:1.2.3.4");
		});

		it("should use x-real-ip if no x-forwarded-for", () => {
			const headers = new Headers();
			headers.set("x-real-ip", "9.10.11.12");

			const result = getClientIdentifier(headers);
			expect(result).toBe("ip:9.10.11.12");
		});

		it("should fallback to unknown if no headers", () => {
			const headers = new Headers();
			const result = getClientIdentifier(headers);
			expect(result).toMatch(/^ip:unknown-\d+$/);
		});

		it("should work with Request object", () => {
			const headers = new Headers();
			headers.set("x-forwarded-for", "1.2.3.4");
			const request = new Request("http://example.com", { headers });

			const result = getClientIdentifier(request);
			expect(result).toBe("ip:1.2.3.4");
		});
	});

	// ==========================================================================
	// RateLimitExceededError Tests
	// ==========================================================================
	describe("RateLimitExceededError", () => {
		it("should create error with correct properties", () => {
			const error = new RateLimitExceededError(30, Date.now() + 30000);

			expect(error.name).toBe("RateLimitExceededError");
			expect(error.retryAfter).toBe(30);
			expect(error.message).toContain("30 seconds");
		});

		it("should be instanceof Error", () => {
			const error = new RateLimitExceededError(60, Date.now() + 60000);
			expect(error instanceof Error).toBe(true);
		});

		it("should have resetTime property", () => {
			const resetTime = Date.now() + 60000;
			const error = new RateLimitExceededError(60, resetTime);
			expect(error.resetTime).toBe(resetTime);
		});
	});
});
