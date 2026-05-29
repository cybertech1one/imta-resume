import { toORPCError } from "@orpc/client";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { BatchHandlerPlugin, RequestHeadersPlugin, SimpleCsrfProtectionHandlerPlugin } from "@orpc/server/plugins";
import { createFileRoute } from "@tanstack/react-router";
import router from "@/integrations/orpc/router";
import { applySecurityHeaders } from "@/middleware/security";
import { getLocale } from "@/utils/locale";

const rpcHandler = new RPCHandler(router, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
	plugins: [
		new BatchHandlerPlugin(),
		new RequestHeadersPlugin(),
		/**
		 * CSRF Protection: Requires all RPC requests to include an `x-csrf-token: orpc` header.
		 * The ORPC browser client sends this header automatically via SimpleCsrfProtectionLinkPlugin.
		 * This blocks cross-origin form submissions and direct browser navigations from
		 * triggering authenticated mutations, because custom headers cannot be set by
		 * HTML forms or simple cross-origin requests without CORS preflight approval.
		 */
		new SimpleCsrfProtectionHandlerPlugin(),
	],
});

/**
 * Builds a clean RPC-protocol error response from an arbitrary thrown error.
 *
 * ORPC's `RPCHandler` encodes errors thrown *inside* a procedure call into a
 * proper HTTP error response on its own. However, errors thrown *outside* that
 * inner try/catch — e.g. from root interceptors, the fetch adapter's body
 * reading, batch envelope parsing, or response serialization — escape
 * `rpcHandler.handle()` entirely. With no try/catch at the route level, such an
 * escaped rejection becomes an unhandled promise rejection that can crash the
 * dev server.
 *
 * `toORPCError` maps any value to an `ORPCError` (known `ORPCError`s, such as the
 * CSRF `CSRF_TOKEN_MISMATCH` → 403, are preserved with their status/code; unknown
 * errors become a generic 500 `INTERNAL_SERVER_ERROR`). We then serialize it in
 * the RPC wire envelope (`{ json: <ORPCError JSON> }`) so the client decodes it
 * exactly as it would a handler-thrown error.
 */
function buildErrorResponse(error: unknown): Response {
	const orpcError = toORPCError(error);
	const body = JSON.stringify({ json: orpcError.toJSON() });
	return new Response(body, {
		status: orpcError.status,
		headers: { "content-type": "application/json" },
	});
}

async function handler({ request }: { request: Request }) {
	try {
		const { response } = await rpcHandler.handle(request, {
			prefix: "/api/rpc",
			context: { locale: await getLocale() },
		});

		if (!response) {
			return applySecurityHeaders(new Response("NOT_FOUND", { status: 404 }));
		}

		// Apply security headers to all RPC responses
		return applySecurityHeaders(response);
	} catch (error) {
		// Global error boundary: any error that escapes ORPC's own encoding (CSRF
		// mismatch, malformed batch, adapter-level failures, etc.) is mapped to a
		// clean HTTP error response here instead of crashing the process or leaving
		// the request hanging. CSRF protection is unaffected — a missing/invalid
		// x-csrf-token still rejects, now cleanly with a 403.
		console.error("[api/rpc] Unhandled handler error:", error);
		return applySecurityHeaders(buildErrorResponse(error));
	}
}

export const Route = createFileRoute("/api/rpc/$")({
	server: {
		handlers: {
			ANY: handler,
		},
	},
});
