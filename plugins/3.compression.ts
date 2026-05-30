import { Readable } from "node:stream";
import { createBrotliCompress, createGzip, constants as zlibConstants } from "node:zlib";
import { definePlugin } from "nitro";

/**
 * Dynamic response compression (gzip / brotli) for SSR + API responses.
 *
 * WHY: Nitro's `compressPublicAssets` only pre-compresses STATIC files at build
 * time (the hashed client bundles and /public assets). Dynamically generated
 * responses — the server-rendered HTML document, ORPC/RPC JSON, and any other
 * runtime output — were being sent UNCOMPRESSED (the home document was ~123KB of
 * raw HTML over the wire). This plugin closes that gap by compressing compressible
 * dynamic responses on the fly.
 *
 * HOW: We wrap `nitro.fetch` (the Nitro app entry the Node server calls). After
 * the app produces its final web `Response`, we decide whether to compress it and,
 * if so, return a NEW `Response` whose body is the original stream piped through a
 * Node zlib compressor. We wrap `fetch` rather than using the `response` runtime
 * hook because the hook cannot swap the (read-only) body of a native `Response`;
 * wrapping `fetch` lets us return a brand-new `Response` with a fresh body stream.
 *
 * Streaming is preserved: we convert the body `ReadableStream` to a Node
 * `Readable`, pipe it through `createBrotliCompress()` / `createGzip()` (Transform
 * streams that respect backpressure), and convert back to a web `ReadableStream`.
 * Nothing is buffered, so SSR shell streaming still works.
 *
 * SAFETY — we DO NOT compress when:
 *  - the client did not advertise support (`Accept-Encoding`),
 *  - the response already has a `Content-Encoding` (e.g. pre-compressed static
 *    assets served with `.br`/`.gz` — this is what prevents double-compression),
 *  - the content type is not compressible (images, video, fonts, pdf are already
 *    compressed; binary blobs gain nothing),
 *  - the content type is `text/event-stream` (SSE — compression would break the
 *    per-event flush semantics the AI streaming endpoints rely on),
 *  - the status is 204/304 or the response has no body / is a Range response,
 *  - the request method is HEAD.
 *
 * Brotli is preferred over gzip when the client supports it (better ratio for
 * text). Brotli quality is tuned to 5 — a good size/CPU balance for on-the-fly
 * compression of dynamic responses.
 */

// Content types worth compressing. Everything here is text-like and benefits
// substantially; anything not matched (images, fonts, video, pdf, octet-stream)
// is left untouched because it is already compressed or gains nothing.
const COMPRESSIBLE = [
	"text/html",
	"text/plain",
	"text/css",
	"text/xml",
	"text/javascript",
	"application/json",
	"application/javascript",
	"application/xml",
	"application/rss+xml",
	"application/manifest+json",
	"application/ld+json",
	"application/wasm",
	"image/svg+xml",
];

// Only compress bodies likely to be larger than ~1 packet. Tiny responses cost
// more in CPU + header overhead than they save. We can only check this when a
// Content-Length is present; streamed bodies (no length) are always eligible.
const MIN_LENGTH = 1024;

function isCompressibleType(contentType: string | null): boolean {
	if (!contentType) return false;
	const type = contentType.split(";", 1)[0].trim().toLowerCase();
	// Explicitly never compress Server-Sent Events.
	if (type === "text/event-stream") return false;
	return COMPRESSIBLE.includes(type);
}

/** Pick the best encoding the client accepts. Brotli > gzip > none. */
function negotiateEncoding(acceptEncoding: string | null): "br" | "gzip" | null {
	if (!acceptEncoding) return null;
	const accepted = acceptEncoding.toLowerCase();
	if (accepted.includes("br")) return "br";
	if (accepted.includes("gzip")) return "gzip";
	return null;
}

/**
 * Wrap a web ReadableStream body with a Node zlib compressor, returning a new
 * web ReadableStream. Backpressure and streaming are preserved end-to-end.
 */
function compressStream(body: ReadableStream<Uint8Array>, encoding: "br" | "gzip"): ReadableStream<Uint8Array> {
	const transform =
		encoding === "br"
			? createBrotliCompress({
					params: {
						// Quality 5 balances ratio vs CPU for per-request compression.
						[zlibConstants.BROTLI_PARAM_QUALITY]: 5,
						[zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
					},
				})
			: createGzip({ level: 6 });

	const nodeReadable = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);
	// `pipe` propagates backpressure; errors are forwarded so the consumer aborts.
	const compressed = nodeReadable.pipe(transform);
	return Readable.toWeb(compressed) as ReadableStream<Uint8Array>;
}

export default definePlugin((nitro) => {
	const originalFetch = nitro.fetch;

	nitro.fetch = async (req: Request): Promise<Response> => {
		const res = await originalFetch(req);

		// --- Fast bail-outs -----------------------------------------------------
		if (req.method === "HEAD") return res;
		if (!res?.body) return res;
		if (res.status === 204 || res.status === 304 || res.status === 206) return res;

		const headers = res.headers;
		// Already encoded (e.g. pre-compressed static .br/.gz assets) — never re-encode.
		if (headers.has("content-encoding")) return res;
		// Range responses must not be transformed.
		if (headers.has("content-range")) return res;

		if (!isCompressibleType(headers.get("content-type"))) return res;

		const encoding = negotiateEncoding(req.headers.get("accept-encoding"));
		if (!encoding) return res;

		// Skip tiny responses when we know the size up front.
		const contentLength = headers.get("content-length");
		if (contentLength && Number(contentLength) < MIN_LENGTH) return res;

		// --- Compress -----------------------------------------------------------
		const newHeaders = new Headers(headers);
		newHeaders.set("content-encoding", encoding);
		// Length changes after compression and is unknown for streams — drop it so
		// the server uses chunked transfer encoding.
		newHeaders.delete("content-length");
		// Caches must key on Accept-Encoding so a gzip client never gets a br body.
		const existingVary = newHeaders.get("vary");
		if (!existingVary) {
			newHeaders.set("vary", "Accept-Encoding");
		} else if (
			!existingVary
				.toLowerCase()
				.split(",")
				.map((v) => v.trim())
				.includes("accept-encoding")
		) {
			newHeaders.set("vary", `${existingVary}, Accept-Encoding`);
		}

		const compressedBody = compressStream(res.body as ReadableStream<Uint8Array>, encoding);

		return new Response(compressedBody, {
			status: res.status,
			statusText: res.statusText,
			headers: newHeaders,
		});
	};
});
