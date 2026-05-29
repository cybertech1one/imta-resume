import { toORPCError } from "@orpc/client";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { onError } from "@orpc/server";
import { RequestHeadersPlugin, SimpleCsrfProtectionHandlerPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";
import router from "@/integrations/orpc/router";
import { env } from "@/utils/env";
import { getLocale } from "@/utils/locale";

const openAPIHandler = new OpenAPIHandler(router, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
	plugins: [
		new RequestHeadersPlugin(),
		new SmartCoercionPlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
		/**
		 * CSRF Protection: Requires `x-csrf-token: orpc` header on OpenAPI requests.
		 * API key users (external integrations) must include this header in their requests.
		 * This prevents cross-origin form submissions from triggering authenticated mutations.
		 */
		new SimpleCsrfProtectionHandlerPlugin(),
	],
});

const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Builds a clean OpenAPI error response from an arbitrary thrown error.
 *
 * Like the RPC handler, the OpenAPI handler encodes errors thrown inside a
 * procedure call, but errors that escape `openAPIHandler.handle()` (CSRF
 * mismatch, malformed requests, adapter-level failures) would otherwise
 * propagate unhandled and crash the process. `toORPCError` preserves known
 * `ORPCError`s (CSRF → 403) and maps unknown errors to a 500. The OpenAPI
 * transport uses plain JSON (no `{ json: ... }` envelope), so we serialize the
 * error's JSON form directly.
 */
function buildErrorResponse(error: unknown): Response {
	const orpcError = toORPCError(error);
	return Response.json(orpcError.toJSON(), { status: orpcError.status });
}

async function handler({ request }: { request: Request }) {
	try {
		return await handleRequest(request);
	} catch (error) {
		// Global error boundary: prevent any escaped error from crashing the server.
		// CSRF protection still rejects bad requests — now cleanly with a 403.
		console.error("[api/openapi] Unhandled handler error:", error);
		return buildErrorResponse(error);
	}
}

async function handleRequest(request: Request) {
	const locale = await getLocale();

	if (request.method === "GET" && request.url.endsWith("/spec.json")) {
		const spec = await openAPIGenerator.generate(router, {
			info: {
				title: "IMTA Resume",
				version: "5.0.0",
				description: "IMTA Resume API",
				license: { name: "MIT", url: "https://github.com/YOUR_ORG/imta-resume/blob/main/LICENSE" },
				contact: { name: "IMTA", email: "contact@imta.ma", url: "https://imta.ma" },
			},
			servers: [{ url: `${env.APP_URL}/api/openapi` }],
			externalDocs: { url: "https://imta.ma", description: "IMTA Resume Documentation" },
			components: {
				securitySchemes: {
					apiKey: {
						type: "apiKey",
						name: "x-api-key",
						in: "header",
						description: "The API key to authenticate requests.",
					},
				},
			},
			security: [{ apiKey: [] }],
			filter: ({ contract }) => !contract["~orpc"].route.tags?.includes("Internal"),
		});

		return Response.json(spec);
	}

	const { response } = await openAPIHandler.handle(request, {
		prefix: "/api/openapi",
		context: { locale, reqHeaders: request.headers },
	});

	if (!response) {
		return new Response("NOT_FOUND", { status: 404 });
	}

	return response;
}

export const Route = createFileRoute("/api/openapi/$")({
	server: {
		handlers: {
			ANY: handler,
		},
	},
});
