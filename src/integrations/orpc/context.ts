/**
 * @fileoverview ORPC Context and Procedure Definitions
 *
 * This module defines the authentication and authorization middleware for all ORPC endpoints.
 * It provides different procedure types with varying access levels:
 *
 * - `publicProcedure`: No authentication required, but user info is available if authenticated
 * - `protectedProcedure`: Requires authenticated user (session cookie or API key)
 * - `adminProcedure`: Requires authenticated user with admin role
 * - `serverOnlyProcedure`: Can only be called from server-side code
 * - `aiRateLimitedProcedure`: Protected + AI-specific rate limits (20 req/min)
 * - `uploadRateLimitedProcedure`: Protected + upload-specific rate limits (10 req/min)
 *
 * @module integrations/orpc/context
 */

import { randomBytes } from "node:crypto";
import { ORPCError, os } from "@orpc/server";
import type { User } from "better-auth";
import { eq } from "drizzle-orm";
import { env } from "@/utils/env";
import type { Locale } from "@/utils/locale";
import {
	AI_MAX_CONCURRENT_PER_USER,
	aiConcurrencyLimiter,
	aiRateLimiter,
	getClientIdentifier,
	type RateLimitResult,
	uploadRateLimiter,
} from "@/utils/rate-limit";
import { auth } from "../auth/config";
import { db } from "../drizzle/client";
import { user } from "../drizzle/schema";

/**
 * Trusted origins for CSRF Origin header validation (defense-in-depth).
 * Computed once at module load from APP_URL.
 */
const trustedOrigins: string[] = (() => {
	const appOrigin = new URL(env.APP_URL).origin;
	const origins = [appOrigin];
	// In local dev, allow both localhost and 127.0.0.1
	if (appOrigin.includes("localhost")) {
		origins.push(appOrigin.replace("localhost", "127.0.0.1"));
	} else if (appOrigin.includes("127.0.0.1")) {
		origins.push(appOrigin.replace("127.0.0.1", "localhost"));
	}
	return origins;
})();

/**
 * Validates the Origin/Referer header against trusted origins.
 * Returns true if the request origin is trusted or if no origin is present
 * (same-origin requests from browsers omit the Origin header on same-origin GETs).
 *
 * This is a defense-in-depth check. The primary CSRF protection is the
 * SimpleCsrfProtectionHandlerPlugin which requires an x-csrf-token header.
 *
 * @param headers - The request headers
 * @returns true if the origin is trusted
 */
function isOriginTrusted(headers: Headers): boolean {
	const origin = headers.get("origin");
	const referer = headers.get("referer");

	// If neither Origin nor Referer is present, this is likely a same-origin
	// request or a server-side call (SSR loaders). Allow it — the CSRF token
	// check is the primary gate.
	if (!origin && !referer) return true;

	const requestOrigin = origin || (referer ? new URL(referer).origin : null);
	if (!requestOrigin) return true;

	return trustedOrigins.includes(requestOrigin);
}

export const SERVER_ONLY_TOKEN = randomBytes(32).toString("hex");

/**
 * Extended user type that includes the custom role field from the database.
 * Combines Better Auth's User type with our application-specific role.
 */
export type UserWithRole = User & {
	role: "user" | "admin" | "partner";
	imtaProgram: string | null;
	onboardingCompleted: boolean;
};

/**
 * Base context interface for all ORPC procedures.
 * Contains locale information and optional request headers.
 */
interface ORPCContext {
	/** The user's locale/language preference */
	locale: Locale;
	/** Original HTTP request headers, used for session/API key extraction */
	reqHeaders?: Headers;
}

/**
 * Extracts and validates user information from session cookies in request headers.
 * Fetches the user's role from the database to build the complete UserWithRole object.
 *
 * @param headers - HTTP request headers containing session cookies
 * @returns The authenticated user with role, or null if not authenticated
 * @internal
 */
async function getUserFromHeaders(headers: Headers): Promise<UserWithRole | null> {
	try {
		const result = await auth.api.getSession({ headers });
		if (!result || !result.user) return null;

		// Fetch user with role from database
		const [userWithRole] = await db.select().from(user).where(eq(user.id, result.user.id)).limit(1);
		if (!userWithRole) return null;

		return {
			...result.user,
			role: userWithRole.role,
			imtaProgram: userWithRole.imtaProgram ?? null,
			onboardingCompleted: userWithRole.onboardingCompleted,
		};
	} catch {
		return null;
	}
}

/**
 * Validates an API key and retrieves the associated user with their role.
 * API keys provide programmatic access to the API without session cookies.
 *
 * @param apiKey - The API key from the x-api-key header
 * @returns The authenticated user with role, or null if API key is invalid
 * @internal
 */
async function getUserFromApiKey(apiKey: string): Promise<UserWithRole | null> {
	try {
		const result = await auth.api.verifyApiKey({ body: { key: apiKey } });
		if (!result.key || !result.valid) return null;

		const [userResult] = await db.select().from(user).where(eq(user.id, result.key.userId)).limit(1);
		if (!userResult) return null;

		return {
			...userResult,
			imtaProgram: userResult.imtaProgram ?? null,
			onboardingCompleted: userResult.onboardingCompleted,
		} as UserWithRole;
	} catch {
		return null;
	}
}

/** Base ORPC server instance with typed context */
const base = os.$context<ORPCContext>();

/**
 * Public procedure that does not require authentication.
 * Attempts to extract user information from headers if available,
 * making it accessible in handlers via `context.user` (may be null).
 *
 * Use this for:
 * - Public endpoints like checking auth providers
 * - Endpoints that behave differently for authenticated vs anonymous users
 * - Read-only public data access
 *
 * @example
 * ```typescript
 * const myPublicEndpoint = publicProcedure
 *   .route({ method: "GET", path: "/public-data" })
 *   .handler(async ({ context }) => {
 *     const isAuthenticated = !!context.user;
 *     return { isAuthenticated };
 *   });
 * ```
 */
export const publicProcedure = base.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();
	const apiKey = headers.get("x-api-key");

	const user = apiKey ? await getUserFromApiKey(apiKey) : await getUserFromHeaders(headers);

	return next({
		context: {
			...context,
			user: user ?? null,
		},
	});
});

/**
 * Protected procedure that requires an authenticated user.
 * Throws UNAUTHORIZED error if no valid session or API key is provided.
 * Guarantees that `context.user` is non-null in the handler.
 *
 * Authentication methods:
 * - Session cookie (from browser login)
 * - API key via `x-api-key` header
 *
 * Use this for:
 * - User-specific data access (resumes, goals, applications)
 * - User profile management
 * - Any endpoint requiring a logged-in user
 *
 * @throws {ORPCError} UNAUTHORIZED - When no valid authentication is provided
 *
 * @example
 * ```typescript
 * const myProtectedEndpoint = protectedProcedure
 *   .route({ method: "GET", path: "/my-data" })
 *   .handler(async ({ context }) => {
 *     // context.user is guaranteed to be non-null
 *     return { userId: context.user.id };
 *   });
 * ```
 */
export const protectedProcedure = publicProcedure.use(async ({ context, next }) => {
	if (!context.user) throw new ORPCError("UNAUTHORIZED");

	// Defense-in-depth: Validate Origin header on all protected requests.
	// The primary CSRF protection is the SimpleCsrfProtectionHandlerPlugin
	// (x-csrf-token header check) at the RPC handler level. This Origin
	// check provides an additional layer of protection.
	const headers = context.reqHeaders ?? new Headers();
	if (!isOriginTrusted(headers)) {
		throw new ORPCError("FORBIDDEN", {
			message: "Request origin is not trusted",
		});
	}

	return next({
		context: {
			...context,
			user: context.user,
		},
	});
});

/**
 * Server-only procedure that can only be called from server-side code (e.g., loaders).
 * Rejects requests from the browser with a 401 UNAUTHORIZED error.
 */
export const serverOnlyProcedure = publicProcedure.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();

	const token = headers.get("x-server-only-token");
	if (token !== SERVER_ONLY_TOKEN) {
		throw new ORPCError("UNAUTHORIZED", {
			message: "This endpoint can only be called from server-side code",
		});
	}

	return next({ context });
});

/**
 * Admin-only procedure that requires the user to have the "admin" role.
 * Rejects requests from non-admin users with a 403 FORBIDDEN error.
 */
export const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	if (context.user.role !== "admin") {
		throw new ORPCError("FORBIDDEN", {
			message: "This endpoint requires admin privileges",
		});
	}

	return next({
		context: {
			...context,
			user: context.user as UserWithRole,
		},
	});
});

/**
 * Helper function to enforce rate limits on ORPC procedures.
 * Throws TOO_MANY_REQUESTS error if rate limit is exceeded.
 */
async function enforceRateLimit(
	headers: Headers,
	userId: string | undefined,
	limiter: { check: (identifier: string) => Promise<RateLimitResult> },
): Promise<void> {
	const clientId = getClientIdentifier(headers, userId);
	const result = await limiter.check(clientId);

	if (!result.allowed) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
		});
	}
}

/**
 * Rate-limited procedure for AI endpoints.
 * Applies AI-specific rate limits (20 requests/minute per user)
 * AND concurrency limits (max 3 simultaneous AI calls per user)
 * to prevent Denial-of-Wallet attacks.
 */
export const aiRateLimitedProcedure = protectedProcedure.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();
	await enforceRateLimit(headers, context.user.id, aiRateLimiter);

	// Enforce per-user concurrency limit
	const userId = context.user.id;
	if (!aiConcurrencyLimiter.acquire(userId, AI_MAX_CONCURRENT_PER_USER)) {
		throw new ORPCError("TOO_MANY_REQUESTS", {
			message: "Too many concurrent AI requests. Please wait for current requests to complete.",
		});
	}

	try {
		return await next({ context });
	} finally {
		aiConcurrencyLimiter.release(userId);
	}
});

/**
 * Rate-limited procedure for file upload endpoints.
 * Applies upload-specific rate limits (10 uploads/minute per user).
 */
export const uploadRateLimitedProcedure = protectedProcedure.use(async ({ context, next }) => {
	const headers = context.reqHeaders ?? new Headers();
	await enforceRateLimit(headers, context.user.id, uploadRateLimiter);
	return next({ context });
});
