/**
 * Rate Limiting Utility
 *
 * Provides configurable rate limiting for API endpoints to prevent abuse.
 * Uses in-memory store for development and can be extended to use Redis for production.
 *
 * Security Benefits:
 * - Prevents brute-force attacks on authentication endpoints
 * - Mitigates denial-of-service (DoS) attacks
 * - Protects against credential stuffing
 * - Controls API resource consumption
 *
 * Usage:
 *   import { authRateLimiter, apiRateLimiter, createRateLimiter } from '@/utils/rate-limit';
 *
 *   // Check if request is allowed
 *   const { allowed, remaining, resetTime } = await authRateLimiter.check(clientId);
 */

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: number;
	retryAfter?: number;
}

interface RateLimitConfig {
	/** Maximum number of requests allowed within the window */
	maxRequests: number;
	/** Time window in milliseconds */
	windowMs: number;
	/** Optional key prefix for namespacing */
	keyPrefix?: string;
}

/**
 * In-memory rate limit store
 *
 * SECURITY: All operations are synchronous on the Map to prevent TOCTOU
 * race conditions. The async interface is retained for future Redis migration.
 *
 * For production with multiple instances, use Redis with atomic INCR instead.
 */
class InMemoryStore {
	private store: Map<string, RateLimitEntry> = new Map();
	private cleanupInterval: ReturnType<typeof setInterval> | null = null;

	constructor() {
		// Clean up expired entries every 5 minutes
		this.cleanupInterval = setInterval(
			() => {
				this.cleanup();
			},
			5 * 60 * 1000,
		);
	}

	async get(key: string): Promise<RateLimitEntry | null> {
		const entry = this.store.get(key);
		if (!entry) return null;

		// Check if entry has expired
		if (Date.now() > entry.resetTime) {
			this.store.delete(key);
			return null;
		}

		return entry;
	}

	async set(key: string, entry: RateLimitEntry): Promise<void> {
		this.store.set(key, entry);
	}

	/**
	 * Atomically check and increment the counter for a key.
	 * Returns the entry AFTER incrementing. Because Node.js is single-threaded
	 * and this method performs no awaits between the read and write, there is
	 * no race condition window.
	 */
	async checkAndIncrement(
		key: string,
		windowMs: number,
		maxRequests: number,
	): Promise<{ entry: RateLimitEntry; allowed: boolean }> {
		const now = Date.now();
		let entry = this.store.get(key);

		// Expire stale entry
		if (entry && now > entry.resetTime) {
			this.store.delete(key);
			entry = undefined;
		}

		if (entry) {
			entry.count += 1;
			// No need to re-set — we mutate the same object reference
			return { entry, allowed: entry.count <= maxRequests };
		}

		const newEntry: RateLimitEntry = {
			count: 1,
			resetTime: now + windowMs,
		};
		this.store.set(key, newEntry);
		return { entry: newEntry, allowed: 1 <= maxRequests };
	}

	/** @deprecated Use checkAndIncrement for atomic operations */
	async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
		const now = Date.now();
		const existing = await this.get(key);

		if (existing) {
			existing.count += 1;
			this.store.set(key, existing);
			return existing;
		}

		const newEntry: RateLimitEntry = {
			count: 1,
			resetTime: now + windowMs,
		};
		this.store.set(key, newEntry);
		return newEntry;
	}

	private cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (now > entry.resetTime) {
				this.store.delete(key);
			}
		}
	}

	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.store.clear();
	}
}

// Singleton store instance
const store = new InMemoryStore();

/**
 * Creates a rate limiter with the specified configuration
 */
export function createRateLimiter(config: RateLimitConfig) {
	const { maxRequests, windowMs, keyPrefix = "" } = config;

	return {
		/**
		 * Check if a request from the given identifier is allowed.
		 * Uses atomic check-and-increment to prevent TOCTOU race conditions
		 * where concurrent requests could slip through before the count is updated.
		 *
		 * @param identifier - Unique identifier (e.g., IP address, user ID, API key)
		 * @returns Rate limit result with allowed status and metadata
		 */
		async check(identifier: string): Promise<RateLimitResult> {
			const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
			const { entry, allowed } = await store.checkAndIncrement(key, windowMs, maxRequests);

			const remaining = Math.max(0, maxRequests - entry.count);
			const resetTime = entry.resetTime;

			return {
				allowed,
				remaining,
				resetTime,
				retryAfter: allowed ? undefined : Math.ceil((resetTime - Date.now()) / 1000),
			};
		},

		/**
		 * Reset the rate limit for a specific identifier
		 * Useful for successful authentication or administrative actions
		 */
		async reset(identifier: string): Promise<void> {
			const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
			await store.set(key, { count: 0, resetTime: Date.now() + windowMs });
		},

		/**
		 * Get current status without incrementing the counter
		 */
		async status(identifier: string): Promise<RateLimitResult> {
			const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
			const entry = await store.get(key);

			if (!entry) {
				return {
					allowed: true,
					remaining: maxRequests,
					resetTime: Date.now() + windowMs,
				};
			}

			const allowed = entry.count < maxRequests;
			const remaining = Math.max(0, maxRequests - entry.count);

			return {
				allowed,
				remaining,
				resetTime: entry.resetTime,
				retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - Date.now()) / 1000),
			};
		},
	};
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Authentication rate limiter
 * Strict limits to prevent brute-force attacks
 * 5 requests per minute per IP/identifier
 */
export const authRateLimiter = createRateLimiter({
	maxRequests: 5,
	windowMs: 60 * 1000, // 1 minute
	keyPrefix: "auth",
});

/**
 * General API rate limiter
 * More permissive for normal API operations
 * 100 requests per minute per IP/identifier
 */
export const apiRateLimiter = createRateLimiter({
	maxRequests: 100,
	windowMs: 60 * 1000, // 1 minute
	keyPrefix: "api",
});

/**
 * Password reset rate limiter
 * Very strict to prevent email bombing
 * 3 requests per 15 minutes per IP/identifier
 */
export const passwordResetRateLimiter = createRateLimiter({
	maxRequests: 3,
	windowMs: 15 * 60 * 1000, // 15 minutes
	keyPrefix: "password-reset",
});

/**
 * AI feature rate limiter
 * Protects expensive AI API calls
 * 20 requests per minute per user
 */
export const aiRateLimiter = createRateLimiter({
	maxRequests: 20,
	windowMs: 60 * 1000, // 1 minute
	keyPrefix: "ai",
});

/**
 * File upload rate limiter
 * Prevents storage abuse
 * 10 uploads per minute per user
 */
export const uploadRateLimiter = createRateLimiter({
	maxRequests: 10,
	windowMs: 60 * 1000, // 1 minute
	keyPrefix: "upload",
});

/**
 * Helper function to get client identifier from request or headers
 * Prioritizes: API key > User ID > X-Forwarded-For > X-Real-IP > Connection IP
 */
export function getClientIdentifier(requestOrHeaders: Request | Headers, userId?: string, apiKey?: string): string {
	if (apiKey) return `apikey:${apiKey}`;
	if (userId) return `user:${userId}`;

	// Extract headers from either Request or Headers object
	const headers = requestOrHeaders instanceof Headers ? requestOrHeaders : requestOrHeaders.headers;

	// Try to get real IP from proxy headers
	const forwardedFor = headers.get("x-forwarded-for");
	if (forwardedFor) {
		// Take the first IP in the chain (original client)
		return `ip:${forwardedFor.split(",")[0].trim()}`;
	}

	const realIp = headers.get("x-real-ip");
	if (realIp) return `ip:${realIp}`;

	// Fallback: use a stable identifier so rate limiting still works.
	// Using a fixed key means all unidentifiable clients share a single bucket,
	// which is safer than per-request unique keys that bypass rate limiting entirely.
	return "ip:unknown";
}

/**
 * Concurrent request limiter for AI endpoints.
 * Prevents a single user from holding open many simultaneous AI calls,
 * which could exhaust server connections or cause Denial-of-Wallet.
 *
 * Not a replacement for rate limiting — this guards against parallelism,
 * while rate limiting guards against total volume over time.
 */
class ConcurrencyLimiter {
	private activeCounts: Map<string, number> = new Map();

	/**
	 * Try to acquire a slot. Returns true if allowed.
	 */
	acquire(identifier: string, maxConcurrent: number): boolean {
		const current = this.activeCounts.get(identifier) ?? 0;
		if (current >= maxConcurrent) {
			return false;
		}
		this.activeCounts.set(identifier, current + 1);
		return true;
	}

	/**
	 * Release a slot after the AI call completes (success or error).
	 * MUST be called in a finally block.
	 */
	release(identifier: string): void {
		const current = this.activeCounts.get(identifier) ?? 0;
		if (current <= 1) {
			this.activeCounts.delete(identifier);
		} else {
			this.activeCounts.set(identifier, current - 1);
		}
	}
}

/**
 * Singleton concurrency limiter for AI requests.
 * Limits each user to 3 concurrent AI calls to prevent resource exhaustion.
 */
export const aiConcurrencyLimiter = new ConcurrencyLimiter();
export const AI_MAX_CONCURRENT_PER_USER = 3;

/**
 * Rate limit error class for consistent error handling
 */
export class RateLimitExceededError extends Error {
	public readonly retryAfter: number;
	public readonly resetTime: number;

	constructor(retryAfter: number, resetTime: number) {
		super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
		this.name = "RateLimitExceededError";
		this.retryAfter = retryAfter;
		this.resetTime = resetTime;
	}
}
