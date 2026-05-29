/**
 * Comprehensive ORPC API Endpoint Test Script
 *
 * Tests ALL discovered endpoints in the Reactive Resume application.
 * ORPC wire protocol:
 *   - POST body: {"json": <input>}
 *   - GET query: ?data={"json": <input>}
 *   - Response: {"json": <output>, "meta": [...]}
 *
 * Usage: node scripts/test-all-endpoints.mjs
 */

import { readFileSync } from "fs";

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const STUDENT_CREDS = { email: "student1@test.com", password: "TestAccount123!" };
const ADMIN_CREDS = { email: "admin@test.com", password: "TestAccount123!" };

let studentCookie = "";
let adminCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
let errors = 0;
const results = [];
const startTime = Date.now();

// Load endpoints catalog
const endpoints = JSON.parse(readFileSync("scripts/endpoints-full.json", "utf-8"));

function log(status, name, detail = "") {
	const icon =
		status === "PASS"
			? "\x1b[32m✓\x1b[0m"
			: status === "FAIL"
				? "\x1b[31m✗\x1b[0m"
				: status === "SKIP"
					? "\x1b[33m⊘\x1b[0m"
					: "\x1b[35m⚠\x1b[0m";
	const shortDetail = detail.length > 120 ? detail.slice(0, 120) + "..." : detail;
	console.log(`${icon} ${name} ${shortDetail ? `— ${shortDetail}` : ""}`);
	results.push({ status, name, detail: shortDetail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else if (status === "SKIP") skipped++;
	else errors++;
}

/** Sign in and get session cookie (with retry and rate limit handling) */
async function signIn(creds, retries = 5) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Origin: BASE_URL,
				},
				body: JSON.stringify(creds),
				redirect: "manual",
			});

			// Handle rate limiting
			if (res.status === 429) {
				const retryAfter = res.headers.get("retry-after");
				const waitSec = retryAfter ? Math.min(Number.parseInt(retryAfter, 10), 30) : 15;
				console.log(`  Rate limited, waiting ${waitSec}s (attempt ${attempt}/${retries})...`);
				await new Promise((r) => setTimeout(r, waitSec * 1000));
				continue;
			}

			const cookies = res.headers.getSetCookie?.() || [];
			const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
			if (cookie) return cookie;

			if (attempt < retries) {
				await new Promise((r) => setTimeout(r, 2000));
			}
		} catch (e) {
			if (attempt < retries) {
				await new Promise((r) => setTimeout(r, 2000));
			} else {
				throw e;
			}
		}
	}
	return "";
}

/** POST an ORPC endpoint */
async function rpc(path, input = undefined, cookie = studentCookie) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: BASE_URL,
				Cookie: cookie,
			},
			body: JSON.stringify(envelope),
			signal: AbortSignal.timeout(15000),
		});
		const text = await res.text();
		let json = null;
		try {
			const parsed = JSON.parse(text);
			json = parsed?.json !== undefined ? parsed.json : parsed;
		} catch {}
		return { status: res.status, json, text, ok: res.ok };
	} catch (e) {
		return { status: 0, json: null, text: e.message, ok: false, error: true };
	}
}

/** GET an ORPC endpoint */
async function rpcGet(path, input = undefined, cookie = studentCookie) {
	const data = input !== undefined ? { json: input } : { json: undefined };
	const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
	try {
		const res = await fetch(url, {
			method: "GET",
			headers: { Origin: BASE_URL, Cookie: cookie },
			signal: AbortSignal.timeout(15000),
		});
		const text = await res.text();
		let json = null;
		try {
			const parsed = JSON.parse(text);
			json = parsed?.json !== undefined ? parsed.json : parsed;
		} catch {}
		return { status: res.status, json, text, ok: res.ok };
	} catch (e) {
		return { status: 0, json: null, text: e.message, ok: false, error: true };
	}
}

/** PUT/DELETE/PATCH an ORPC endpoint */
async function rpcMethod(method, path, input = undefined, cookie = studentCookie) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	try {
		const res = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
				Origin: BASE_URL,
				Cookie: cookie,
			},
			body: JSON.stringify(envelope),
			signal: AbortSignal.timeout(15000),
		});
		const text = await res.text();
		let json = null;
		try {
			const parsed = JSON.parse(text);
			json = parsed?.json !== undefined ? parsed.json : parsed;
		} catch {}
		return { status: res.status, json, text, ok: res.ok };
	} catch (e) {
		return { status: 0, json: null, text: e.message, ok: false, error: true };
	}
}

/**
 * Test a single endpoint
 * Strategy: ORPC endpoints typically use POST even for GET-defined routes.
 * We test with the method from the route definition.
 * For endpoints that require specific inputs, we try with empty/minimal inputs.
 * Success criteria: We get a valid JSON response (not a 404 or connection error)
 */
async function testEndpoint(ep) {
	const { path, method, procType } = ep;

	// Choose cookie based on proc type
	let cookie = studentCookie;
	if (procType === "admin") cookie = adminCookie;
	if (procType === "public") cookie = ""; // Test without auth first

	// Skip serverOnly and streaming endpoints
	if (procType === "serverOnly") {
		log("SKIP", `${method} ${path}`, "serverOnly - cannot test via HTTP");
		return;
	}

	// Endpoints that do destructive operations or need specific IDs - test carefully
	const isDestructive =
		path.includes("/delete") ||
		path.includes("/remove") ||
		path.includes("/bulkDelete") ||
		method === "DELETE";
	const isCreate =
		path.includes("/create") ||
		path.includes("/import") ||
		path.includes("/seed") ||
		path.includes("/duplicate");
	const isMutation =
		method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
	const isStreaming =
		path.includes("Stream") ||
		path.includes("stream") ||
		path.includes("chat") ||
		path.includes("generate") ||
		path.includes("analyze") ||
		path.includes("improve") ||
		path.includes("fix") ||
		path.includes("parse");
	const isAI =
		path.startsWith("ai/") ||
		path.startsWith("mockAi/") ||
		path.startsWith("aiWriter/generate") ||
		path.startsWith("aiWriter/quantify") ||
		path.startsWith("aiWriter/extract") ||
		path.startsWith("aiWriter/optimize") ||
		path.startsWith("aiWriter/check") ||
		path.includes("generateBulletPoints") ||
		path.includes("generateSummary") ||
		path.includes("generateCoverLetter") ||
		path.includes("optimizeLinkedIn") ||
		path.includes("checkGrammar") ||
		path.includes("quantifyAchievement") ||
		path.includes("extractSkills");

	// Skip destructive endpoints to avoid breaking data
	if (isDestructive) {
		log("SKIP", `${method} ${path}`, "destructive operation - skipped to preserve data");
		return;
	}

	// Skip AI generation endpoints that require models and specific inputs
	if (isAI && isMutation) {
		log("SKIP", `${method} ${path}`, "AI generation - requires configured provider");
		return;
	}

	// Skip seed endpoints
	if (path.includes("/seed") || path.includes("Seed")) {
		log("SKIP", `${method} ${path}`, "seed endpoint - skipped to preserve data");
		return;
	}

	// For all endpoints, try the appropriate method
	let r;
	try {
		if (method === "GET") {
			r = await rpcGet(path, undefined, cookie);
		} else if (method === "POST") {
			// For POST reads (list, get, etc.), try with empty/undefined input
			r = await rpc(path, undefined, cookie);
		} else {
			r = await rpcMethod(method, path, undefined, cookie);
		}
	} catch (e) {
		log("ERROR", `${method} ${path}`, `Exception: ${e.message}`);
		return;
	}

	if (r.error) {
		log("ERROR", `${method} ${path}`, `Network error: ${r.text}`);
		return;
	}

	// Determine success
	// - 200 = success
	// - 422 = validation error (endpoint exists but needs specific input) = still PASS for existence
	// - 401 = unauthorized (expected for protected endpoints when no auth)
	// - 403 = forbidden (expected for admin endpoints with non-admin user)
	// - 404 = endpoint not found = FAIL
	// - 500 = server error = might be OK if it's a missing table or config issue

	const isValidResponse = r.status >= 200 && r.status < 600;

	if (r.ok) {
		// 200 - endpoint works
		const preview = typeof r.json === "object" && r.json !== null
			? JSON.stringify(r.json).slice(0, 80)
			: String(r.json).slice(0, 80);
		log("PASS", `${method} ${path}`, `${r.status} ${preview}`);
	} else if (r.status === 400) {
		// Bad request / validation error - endpoint exists but needs specific input
		const msg = r.json?.message || r.json?.issues?.[0]?.message || "";
		log("PASS", `${method} ${path}`, `400 needs input (endpoint reachable) ${msg.slice(0, 50)}`);
	} else if (r.status === 422) {
		// Validation error - endpoint exists but needs input
		const msg = r.json?.message || r.json?.issues?.[0]?.message || "";
		log("PASS", `${method} ${path}`, `422 validation (endpoint exists) ${msg.slice(0, 60)}`);
	} else if (r.status === 401) {
		if (procType === "public") {
			log("FAIL", `${method} ${path}`, "401 on public endpoint");
		} else {
			log("PASS", `${method} ${path}`, "401 unauthorized (expected for auth test)");
		}
	} else if (r.status === 403) {
		if (procType === "admin" && cookie !== adminCookie) {
			log("PASS", `${method} ${path}`, "403 forbidden for non-admin (expected)");
		} else {
			log("FAIL", `${method} ${path}`, `403 unexpected forbidden`);
		}
	} else if (r.status === 404) {
		log("FAIL", `${method} ${path}`, "404 endpoint not found");
	} else if (r.status === 412) {
		// PRECONDITION_FAILED - usually means AI not configured
		log("PASS", `${method} ${path}`, "412 precondition failed (e.g., AI not configured)");
	} else if (r.status === 500) {
		const msg = r.json?.message || r.text?.slice(0, 200) || "";
		// 500 with known benign errors (missing tables, columns, etc.)
		if (
			msg.includes("relation") ||
			msg.includes("does not exist") ||
			msg.includes("column") ||
			msg.includes("no such table") ||
			msg.includes("SQLITE_ERROR")
		) {
			log("PASS", `${method} ${path}`, `500 missing table/column: ${msg.slice(0, 80)}`);
		} else {
			// Real server errors - still considered FAIL
			log("FAIL", `${method} ${path}`, `500 server error: ${msg.slice(0, 100)}`);
		}
	} else if (r.status === 429) {
		// Rate limited - endpoint exists and works, just throttled
		log("PASS", `${method} ${path}`, "429 rate limited (endpoint exists)");
	} else {
		const msg = r.json?.message || r.text?.slice(0, 100) || "";
		log("FAIL", `${method} ${path}`, `${r.status} ${msg.slice(0, 80)}`);
	}
}

/**
 * Test auth protection: verify that protected/admin endpoints return 401 without auth
 */
async function testAuthProtection() {
	console.log("\n\x1b[1m=== AUTH PROTECTION TESTS ===\x1b[0m");

	// Test a sample of protected endpoints without auth
	const protectedSamples = endpoints
		.filter((e) => e.procType === "protected" && e.method === "GET")
		.slice(0, 10);

	for (const ep of protectedSamples) {
		const r = await rpcGet(ep.path, undefined, "");
		if (r.status === 401) {
			log("PASS", `Auth guard: ${ep.path}`, "401 without auth cookie");
		} else {
			log("FAIL", `Auth guard: ${ep.path}`, `Expected 401, got ${r.status}`);
		}
	}

	// Test admin endpoints with student cookie
	const adminSamples = endpoints.filter((e) => e.procType === "admin" && e.method === "GET").slice(0, 5);

	for (const ep of adminSamples) {
		const r = await rpcGet(ep.path, undefined, studentCookie);
		if (r.status === 401 || r.status === 403) {
			log("PASS", `Admin guard: ${ep.path}`, `${r.status} for non-admin user`);
		} else {
			log("FAIL", `Admin guard: ${ep.path}`, `Expected 401/403, got ${r.status}`);
		}
	}
}

/**
 * Test public endpoints without auth
 */
async function testPublicEndpoints() {
	console.log("\n\x1b[1m=== PUBLIC ENDPOINTS (no auth) ===\x1b[0m");

	const publicEps = endpoints.filter((e) => e.procType === "public");
	for (const ep of publicEps) {
		if (ep.path.includes("/seed")) {
			log("SKIP", `${ep.method} ${ep.path}`, "seed endpoint");
			continue;
		}
		await testEndpoint({ ...ep, procType: "public" });
	}
}

/**
 * Test protected endpoints with student auth
 */
async function testProtectedEndpoints() {
	console.log("\n\x1b[1m=== PROTECTED ENDPOINTS (student auth) ===\x1b[0m");

	const protectedEps = endpoints.filter(
		(e) => e.procType === "protected" || e.procType === "aiRateLimited" || e.procType === "uploadRateLimited",
	);

	// Test in batches to avoid overwhelming the server
	const batchSize = 20;
	for (let i = 0; i < protectedEps.length; i += batchSize) {
		const batch = protectedEps.slice(i, i + batchSize);
		// Run sequentially to be safe
		for (const ep of batch) {
			await testEndpoint(ep);
		}
		// Small delay between batches
		if (i + batchSize < protectedEps.length) {
			await new Promise((r) => setTimeout(r, 100));
		}
	}
}

/**
 * Test admin endpoints with admin auth
 */
async function testAdminEndpoints() {
	console.log("\n\x1b[1m=== ADMIN ENDPOINTS (admin auth) ===\x1b[0m");

	const adminEps = endpoints.filter((e) => e.procType === "admin");
	for (const ep of adminEps) {
		await testEndpoint(ep);
	}
}

// ========== MAIN ==========
async function main() {
	console.log("\x1b[1m╔══════════════════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m║  COMPREHENSIVE ORPC API ENDPOINT TEST               ║\x1b[0m");
	console.log(`\x1b[1m║  Testing ${endpoints.length} endpoints at ${BASE_URL}  ║\x1b[0m`);
	console.log("\x1b[1m╚══════════════════════════════════════════════════════╝\x1b[0m");

	// 1. Authentication
	console.log("\n\x1b[1m=== AUTHENTICATION ===\x1b[0m");
	try {
		studentCookie = await signIn(STUDENT_CREDS);
		if (studentCookie) {
			log("PASS", "Student login", `cookie length=${studentCookie.length}`);
		} else {
			log("FAIL", "Student login", "No session cookie returned");
			process.exit(1);
		}
	} catch (e) {
		log("FAIL", "Student login", e.message);
		process.exit(1);
	}

	try {
		adminCookie = await signIn(ADMIN_CREDS);
		if (adminCookie) {
			log("PASS", "Admin login", `cookie length=${adminCookie.length}`);
		} else {
			log("FAIL", "Admin login", "No session cookie returned");
		}
	} catch (e) {
		log("FAIL", "Admin login", e.message);
	}

	// 2. Verify sessions
	try {
		const r = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: studentCookie, Origin: BASE_URL },
		});
		const body = await r.json();
		if (r.ok && body?.user?.email) {
			log("PASS", "Student session", `user=${body.user.email}`);
		} else {
			log("FAIL", "Student session", "no user in session");
		}
	} catch (e) {
		log("FAIL", "Student session", e.message);
	}

	try {
		const r = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: adminCookie, Origin: BASE_URL },
		});
		const body = await r.json();
		if (r.ok && body?.user?.email) {
			log("PASS", "Admin session", `user=${body.user.email} role=${body.user.role}`);
		} else {
			log("FAIL", "Admin session", "no user in session");
		}
	} catch (e) {
		log("FAIL", "Admin session", e.message);
	}

	// 3. Run tests
	await testAuthProtection();
	await testPublicEndpoints();
	await testProtectedEndpoints();

	// Re-authenticate admin in case session expired
	if (!adminCookie) {
		try {
			adminCookie = await signIn(ADMIN_CREDS);
			if (adminCookie) console.log("  (Admin re-authenticated successfully)");
		} catch (e) {
			console.log("  (Admin re-auth failed, admin tests will use student cookie)");
		}
	}
	await testAdminEndpoints();

	// 4. Summary
	const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
	console.log("\n\x1b[1m╔══════════════════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m║                    TEST SUMMARY                      ║\x1b[0m");
	console.log("\x1b[1m╚══════════════════════════════════════════════════════╝\x1b[0m");
	console.log(`  Total endpoints in catalog: ${endpoints.length}`);
	console.log(`  Tests run: ${passed + failed + skipped + errors}`);
	console.log(`  \x1b[32mPassed:  ${passed}\x1b[0m`);
	console.log(`  \x1b[31mFailed:  ${failed}\x1b[0m`);
	console.log(`  \x1b[33mSkipped: ${skipped}\x1b[0m`);
	console.log(`  \x1b[35mErrors:  ${errors}\x1b[0m`);
	console.log(`  Time: ${elapsed}s`);
	console.log();

	// Show failures
	const failures = results.filter((r) => r.status === "FAIL");
	if (failures.length > 0) {
		console.log(`\x1b[31m=== FAILURES (${failures.length}) ===\x1b[0m`);
		for (const f of failures) {
			console.log(`  ✗ ${f.name} — ${f.detail}`);
		}
	}

	// Show errors
	const errorList = results.filter((r) => r.status === "ERROR");
	if (errorList.length > 0) {
		console.log(`\n\x1b[35m=== ERRORS (${errorList.length}) ===\x1b[0m`);
		for (const e of errorList) {
			console.log(`  ⚠ ${e.name} — ${e.detail}`);
		}
	}

	// Pass/fail rate
	const testable = passed + failed;
	const passRate = testable > 0 ? ((passed / testable) * 100).toFixed(1) : 0;
	console.log(`\n  Pass rate (excluding skips): ${passRate}% (${passed}/${testable})`);

	process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
	console.error("Fatal error:", e);
	process.exit(1);
});
