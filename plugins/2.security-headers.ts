import { definePlugin } from "nitro";
import { getSecurityHeaders } from "@/middleware/security";

/**
 * Global Security Headers (Nitro response hook)
 *
 * Applies the centralized security headers from `src/middleware/security.ts`
 * (CSP, HSTS, X-Frame-Options, X-Content-Type-Options=nosniff, Referrer-Policy,
 * Permissions-Policy, COOP/COEP/CORP) to EVERY response — including rendered
 * HTML pages, which previously only received these headers on /api/auth and
 * /api/rpc.
 *
 * The `response` runtime hook fires for every outgoing Response and exposes the
 * mutable web `Response` object, so we can set headers without re-wrapping the
 * body stream.
 *
 * Conservative behavior:
 * - We only SET a header if it is not already present. This means routes that
 *   already apply their own security headers (e.g. the auth/rpc handlers via
 *   `applySecurityHeaders`) keep their values and are never double-set, and any
 *   per-route `Cache-Control` (e.g. from Nitro routeRules on static assets) is
 *   preserved rather than clobbered.
 */
export default definePlugin((nitro) => {
	nitro.hooks.hook("response", (res: Response) => {
		// Some upstream errors can produce a response without a usable headers map.
		if (!res?.headers || typeof res.headers.set !== "function") return;

		const headers = getSecurityHeaders();

		for (const [key, value] of Object.entries(headers)) {
			if (value === undefined) continue;
			// Do not override headers a route already set explicitly.
			if (res.headers.has(key)) continue;
			res.headers.set(key, value);
		}
	});
});
