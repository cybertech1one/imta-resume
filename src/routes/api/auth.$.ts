import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/integrations/auth/config";
import { applySecurityHeaders, getSecurityHeaders, validateOrigin } from "@/middleware/security";
import { authRateLimiter, getClientIdentifier, passwordResetRateLimiter } from "@/utils/rate-limit";

// Auth endpoints that require strict rate limiting
const RATE_LIMITED_PATHS = [
	"/api/auth/sign-in",
	"/api/auth/sign-up",
	"/api/auth/forget-password",
	"/api/auth/reset-password",
	"/api/auth/verify-email",
	"/api/auth/two-factor",
];

// Password reset endpoints need extra strict limits
const PASSWORD_RESET_PATHS = ["/api/auth/forget-password", "/api/auth/reset-password"];

// Endpoints that modify state and need origin validation
const STATE_CHANGING_ENDPOINTS = [
	"/api/auth/sign-in",
	"/api/auth/sign-up",
	"/api/auth/sign-out",
	"/api/auth/reset-password",
	"/api/auth/change-password",
	"/api/auth/delete-account",
	"/api/auth/two-factor",
];

async function handler({ request }: { request: Request }) {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const securityHeaders = getSecurityHeaders();

	// Validate origin for state-changing POST requests
	// This provides an additional layer of CSRF protection on top of Better Auth's built-in CSRF handling
	if (request.method === "POST" && STATE_CHANGING_ENDPOINTS.some((path) => pathname.startsWith(path))) {
		if (!validateOrigin(request)) {
			return new Response(
				JSON.stringify({
					error: "Forbidden",
					message: "Invalid request origin",
				}),
				{
					status: 403,
					headers: {
						"Content-Type": "application/json",
						...Object.fromEntries(Object.entries(securityHeaders).filter(([, v]) => v !== undefined)),
					},
				},
			);
		}
	}

	// Apply rate limiting to sensitive auth endpoints
	if (RATE_LIMITED_PATHS.some((path) => pathname.startsWith(path))) {
		const clientId = getClientIdentifier(request);

		// Use stricter limits for password reset endpoints
		const limiter = PASSWORD_RESET_PATHS.some((path) => pathname.startsWith(path))
			? passwordResetRateLimiter
			: authRateLimiter;

		const result = await limiter.check(clientId);

		if (!result.allowed) {
			return new Response(
				JSON.stringify({
					error: "Too many requests",
					message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
					retryAfter: result.retryAfter,
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": String(result.retryAfter),
						"X-RateLimit-Remaining": String(result.remaining),
						"X-RateLimit-Reset": String(result.resetTime),
						...Object.fromEntries(Object.entries(securityHeaders).filter(([, v]) => v !== undefined)),
					},
				},
			);
		}
	}

	// Handle auth request and apply security headers to response
	const response = await auth.handler(request);
	return applySecurityHeaders(response);
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		},
	},
});
