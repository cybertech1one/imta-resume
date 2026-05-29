/**
 * Resume & Dashboard ORPC Endpoint Test Script
 *
 * Tests the following endpoint groups with REAL data:
 * 1. Resume CRUD (create, read, update, delete with verification)
 * 2. Dashboard (statistics, upcoming items, recent activity)
 * 3. Template Gallery (check if endpoint exists)
 * 4. User Activity (log, list, stats, daily, counts, delete)
 *
 * ORPC wire protocol:
 * - POST body: { json: <input> }
 * - GET query: ?data={"json": <input>}
 * - Response: { json: <output>, meta: [...] }
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "student1@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

// ============================================
// Helpers
// ============================================

function log(status, name, detail = "") {
	const icon =
		status === "PASS" ? "\x1b[32m✓\x1b[0m" : status === "FAIL" ? "\x1b[31m✗\x1b[0m" : "\x1b[33m⊘\x1b[0m";
	const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else skipped++;
}

/** POST an ORPC endpoint with {json: input} envelope */
async function rpc(path, input = undefined) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify(envelope),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok, headers: res.headers };
}

/** GET an ORPC endpoint with ?data={json: input} query param */
async function rpcGet(path, input = undefined) {
	const data = input !== undefined ? { json: input } : { json: undefined };
	const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
	const res = await fetch(url, {
		method: "GET",
		headers: {
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

function truncate(str, len = 120) {
	if (!str) return "";
	const s = typeof str === "string" ? str : JSON.stringify(str);
	return s.length > len ? s.slice(0, len) + "..." : s;
}

// ============================================
// Auth
// ============================================

async function testAuth() {
	console.log("\n\x1b[1m═══════════════════════════════════════\x1b[0m");
	console.log("\x1b[1m  AUTH — Sign in as student1\x1b[0m");
	console.log("\x1b[1m═══════════════════════════════════════\x1b[0m");

	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: BASE_URL,
			},
			body: JSON.stringify(CREDENTIALS),
			redirect: "manual",
		});
		const cookies = res.headers.getSetCookie?.() || [];
		sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");

		if ((res.ok || res.status === 302) && cookies.length > 0) {
			log("PASS", "Login (student1@test.com)", `status=${res.status}, cookies=${cookies.length}`);
		} else {
			const body = await res.text();
			log("FAIL", "Login (student1@test.com)", `status=${res.status} ${truncate(body)}`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Login (student1@test.com)", e.message);
		return false;
	}

	// Verify session
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.email) {
			log("PASS", "Session check", `user=${body.user.email} role=${body.user.role}`);
		} else {
			log("FAIL", "Session check", `status=${res.status}`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Session check", e.message);
		return false;
	}

	return true;
}

// ============================================
// 1. Resume CRUD
// ============================================

async function testResumeCrud() {
	console.log("\n\x1b[1m═══════════════════════════════════════\x1b[0m");
	console.log("\x1b[1m  1. RESUME CRUD\x1b[0m");
	console.log("\x1b[1m═══════════════════════════════════════\x1b[0m");

	let createdResumeId = null;

	// --- 1a. List existing resumes (GET route, using both GET and POST) ---
	let initialResumeCount = 0;
	try {
		const r = await rpcGet("resume/list");
		if (r.ok && Array.isArray(r.json)) {
			initialResumeCount = r.json.length;
			const names = r.json.map((r) => r.name).slice(0, 5);
			log("PASS", "resume/list (GET)", `count=${initialResumeCount}, names=[${names.join(", ")}]`);
		} else {
			log("FAIL", "resume/list (GET)", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "resume/list (GET)", e.message);
	}

	// Also test via POST (ORPC accepts both)
	try {
		const r = await rpc("resume/list");
		if (r.ok && Array.isArray(r.json)) {
			log("PASS", "resume/list (POST)", `count=${r.json.length}`);
		} else {
			log("FAIL", "resume/list (POST)", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "resume/list (POST)", e.message);
	}

	// --- 1b. Create a new resume ---
	const timestamp = Date.now();
	const testSlug = `test-resume-${timestamp}`;
	const testName = "Test Resume";

	try {
		const r = await rpc("resume/create", {
			name: testName,
			slug: testSlug,
			tags: ["test", "automated"],
			withSampleData: false,
		});
		if (r.ok && r.json) {
			createdResumeId = r.json;
			log("PASS", "resume/create", `id=${createdResumeId}, slug=${testSlug}`);
		} else {
			log("FAIL", "resume/create", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "resume/create", e.message);
	}

	// --- 1c. Get the created resume by ID ---
	if (createdResumeId) {
		try {
			const r = await rpcGet("resume/getById", { id: createdResumeId });
			if (r.ok && r.json) {
				const match = r.json.name === testName && r.json.slug === testSlug;
				log(
					match ? "PASS" : "FAIL",
					"resume/getById (GET)",
					`name=${r.json.name}, slug=${r.json.slug}, tags=${JSON.stringify(r.json.tags)}, isPublic=${r.json.isPublic}`,
				);
			} else {
				log("FAIL", "resume/getById (GET)", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/getById (GET)", e.message);
		}

		// Also via POST
		try {
			const r = await rpc("resume/getById", { id: createdResumeId });
			if (r.ok && r.json) {
				log("PASS", "resume/getById (POST)", `name=${r.json.name}`);
			} else {
				log("FAIL", "resume/getById (POST)", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/getById (POST)", e.message);
		}
	} else {
		log("SKIP", "resume/getById", "No resume ID — create failed");
	}

	// --- 1d. Update the resume ---
	if (createdResumeId) {
		try {
			const r = await rpc("resume/update", {
				id: createdResumeId,
				name: "Updated Test Resume",
				tags: ["test", "automated", "updated"],
			});
			if (r.ok) {
				log("PASS", "resume/update", "name changed to 'Updated Test Resume', tag added");
			} else {
				log("FAIL", "resume/update", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/update", e.message);
		}

		// Verify the update
		try {
			const r = await rpcGet("resume/getById", { id: createdResumeId });
			if (r.ok && r.json) {
				const nameOk = r.json.name === "Updated Test Resume";
				const tagsOk = r.json.tags.includes("updated");
				log(
					nameOk && tagsOk ? "PASS" : "FAIL",
					"resume/update verification",
					`name=${r.json.name}, tags=${JSON.stringify(r.json.tags)}`,
				);
			} else {
				log("FAIL", "resume/update verification", `status=${r.status}`);
			}
		} catch (e) {
			log("FAIL", "resume/update verification", e.message);
		}
	} else {
		log("SKIP", "resume/update", "No resume ID");
		log("SKIP", "resume/update verification", "No resume ID");
	}

	// --- 1e. Resume tags list ---
	try {
		const r = await rpcGet("resume/tags/list");
		if (r.ok && Array.isArray(r.json)) {
			log("PASS", "resume/tags/list", `tags=[${r.json.join(", ")}]`);
		} else {
			log("FAIL", "resume/tags/list", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "resume/tags/list", e.message);
	}

	// --- 1f. Resume statistics ---
	if (createdResumeId) {
		try {
			const r = await rpcGet("resume/statistics/getById", { id: createdResumeId });
			if (r.ok && r.json) {
				log(
					"PASS",
					"resume/statistics/getById",
					`views=${r.json.views}, downloads=${r.json.downloads}, isPublic=${r.json.isPublic}`,
				);
			} else {
				log("FAIL", "resume/statistics/getById", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/statistics/getById", e.message);
		}
	} else {
		log("SKIP", "resume/statistics/getById", "No resume ID");
	}

	// --- 1g. Lock/unlock resume ---
	if (createdResumeId) {
		try {
			const r = await rpc("resume/setLocked", { id: createdResumeId, isLocked: true });
			if (r.ok) {
				log("PASS", "resume/setLocked (lock)", "isLocked=true");
			} else {
				log("FAIL", "resume/setLocked (lock)", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/setLocked (lock)", e.message);
		}

		// Verify locked
		try {
			const r = await rpcGet("resume/getById", { id: createdResumeId });
			if (r.ok && r.json?.isLocked === true) {
				log("PASS", "resume/setLocked verification", `isLocked=${r.json.isLocked}`);
			} else {
				log("FAIL", "resume/setLocked verification", `isLocked=${r.json?.isLocked}`);
			}
		} catch (e) {
			log("FAIL", "resume/setLocked verification", e.message);
		}

		// Unlock for cleanup
		try {
			await rpc("resume/setLocked", { id: createdResumeId, isLocked: false });
		} catch {}
	}

	// --- 1h. Duplicate resume ---
	let duplicatedId = null;
	if (createdResumeId) {
		try {
			const dupSlug = `dup-${timestamp}`;
			const r = await rpc("resume/duplicate", {
				id: createdResumeId,
				name: "Duplicated Resume",
				slug: dupSlug,
			});
			if (r.ok && r.json) {
				duplicatedId = r.json;
				log("PASS", "resume/duplicate", `newId=${duplicatedId}, slug=${dupSlug}`);
			} else {
				log("FAIL", "resume/duplicate", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/duplicate", e.message);
		}
	} else {
		log("SKIP", "resume/duplicate", "No resume ID");
	}

	// --- 1i. Delete the duplicated resume ---
	if (duplicatedId) {
		try {
			const r = await rpc("resume/delete", { id: duplicatedId });
			if (r.ok) {
				log("PASS", "resume/delete (duplicate)", `deleted id=${duplicatedId}`);
			} else {
				log("FAIL", "resume/delete (duplicate)", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/delete (duplicate)", e.message);
		}
	}

	// --- 1j. Delete the original test resume ---
	if (createdResumeId) {
		try {
			const r = await rpc("resume/delete", { id: createdResumeId });
			if (r.ok) {
				log("PASS", "resume/delete (original)", `deleted id=${createdResumeId}`);
			} else {
				log("FAIL", "resume/delete (original)", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "resume/delete (original)", e.message);
		}

		// --- 1k. Verify deletion ---
		try {
			const r = await rpcGet("resume/list");
			if (r.ok && Array.isArray(r.json)) {
				const stillExists = r.json.some((r) => r.id === createdResumeId);
				const countAfter = r.json.length;
				if (!stillExists && countAfter === initialResumeCount) {
					log("PASS", "resume/delete verification", `count restored to ${countAfter}, test resume gone`);
				} else if (!stillExists) {
					log("PASS", "resume/delete verification", `test resume gone, count=${countAfter}`);
				} else {
					log("FAIL", "resume/delete verification", `resume id=${createdResumeId} still in list`);
				}
			} else {
				log("FAIL", "resume/delete verification", `status=${r.status}`);
			}
		} catch (e) {
			log("FAIL", "resume/delete verification", e.message);
		}
	} else {
		log("SKIP", "resume/delete (original)", "No resume ID");
		log("SKIP", "resume/delete verification", "No resume ID");
	}
}

// ============================================
// 2. Dashboard
// ============================================

async function testDashboard() {
	console.log("\n\x1b[1m═══════════════════════════════════════\x1b[0m");
	console.log("\x1b[1m  2. DASHBOARD\x1b[0m");
	console.log("\x1b[1m═══════════════════════════════════════\x1b[0m");

	// --- 2a. getStatistics ---
	try {
		const r = await rpcGet("dashboard/getStatistics");
		if (r.ok && r.json && typeof r.json.resumeCount === "number") {
			log(
				"PASS",
				"dashboard/getStatistics",
				`resumes=${r.json.resumeCount}, apps=${r.json.activeApplicationsCount}, interviews=${r.json.upcomingInterviewsCount}, contacts=${r.json.networkContactsCount}, skills=${r.json.skillsTrackedCount}, goalsProgress=${r.json.goalsProgress}`,
			);
		} else {
			log("FAIL", "dashboard/getStatistics", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "dashboard/getStatistics", e.message);
	}

	// Also test via POST
	try {
		const r = await rpc("dashboard/getStatistics");
		if (r.ok && r.json) {
			log("PASS", "dashboard/getStatistics (POST)", `resumeCount=${r.json.resumeCount}`);
		} else {
			log("FAIL", "dashboard/getStatistics (POST)", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "dashboard/getStatistics (POST)", e.message);
	}

	// --- 2b. getUpcomingItems ---
	try {
		const r = await rpcGet("dashboard/getUpcomingItems", { limit: 5 });
		if (r.ok && Array.isArray(r.json)) {
			const items = r.json.map((i) => `${i.type}: ${i.title}`).slice(0, 3);
			log("PASS", "dashboard/getUpcomingItems", `count=${r.json.length}${items.length ? `, items=[${items.join("; ")}]` : ""}`);
		} else {
			log("FAIL", "dashboard/getUpcomingItems", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "dashboard/getUpcomingItems", e.message);
	}

	// --- 2c. getRecentActivity ---
	try {
		const r = await rpcGet("dashboard/getRecentActivity", { limit: 5 });
		if (r.ok && Array.isArray(r.json)) {
			const activities = r.json.map((a) => `${a.category}/${a.activityType}`).slice(0, 3);
			log(
				"PASS",
				"dashboard/getRecentActivity",
				`count=${r.json.length}${activities.length ? `, types=[${activities.join("; ")}]` : ""}`,
			);
		} else {
			log("FAIL", "dashboard/getRecentActivity", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "dashboard/getRecentActivity", e.message);
	}
}

// ============================================
// 3. Template Gallery
// ============================================

async function testTemplateGallery() {
	console.log("\n\x1b[1m═══════════════════════════════════════\x1b[0m");
	console.log("\x1b[1m  3. TEMPLATE GALLERY\x1b[0m");
	console.log("\x1b[1m═══════════════════════════════════════\x1b[0m");

	// Check if any template-related ORPC endpoint exists
	const templatePaths = [
		"templates/list",
		"template/list",
		"templates/getAll",
		"template/getAll",
	];

	let foundEndpoint = false;
	for (const path of templatePaths) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", `Template endpoint: ${path}`, truncate(r.json));
				foundEndpoint = true;
				break;
			}
		} catch {}
	}

	if (!foundEndpoint) {
		log("SKIP", "Template gallery ORPC endpoint", "No server endpoint found — templates are client-side only");
	}

	// Check that template images are accessible
	const templateNames = ["azurill", "bronzor", "chikorita", "ditto", "gengar"];
	for (const name of templateNames) {
		try {
			const res = await fetch(`${BASE_URL}/templates/jpg/${name}.jpg`, {
				method: "HEAD",
			});
			if (res.ok) {
				log("PASS", `Template image: ${name}.jpg`, `status=${res.status}, type=${res.headers.get("content-type")}`);
			} else {
				log("FAIL", `Template image: ${name}.jpg`, `status=${res.status}`);
			}
		} catch (e) {
			log("FAIL", `Template image: ${name}.jpg`, e.message);
		}
	}
}

// ============================================
// 4. User Activity
// ============================================

async function testUserActivity() {
	console.log("\n\x1b[1m═══════════════════════════════════════\x1b[0m");
	console.log("\x1b[1m  4. USER ACTIVITY\x1b[0m");
	console.log("\x1b[1m═══════════════════════════════════════\x1b[0m");

	let loggedActivityId = null;

	// --- 4a. Log a new activity ---
	try {
		const r = await rpc("userActivity/log", {
			type: "page_view",
			category: "general",
			resourceType: "test",
			metadata: { source: "automated-test", timestamp: Date.now() },
		});
		if (r.ok && r.json) {
			loggedActivityId = r.json;
			log("PASS", "userActivity/log", `id=${loggedActivityId}`);
		} else {
			log("FAIL", "userActivity/log", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/log", e.message);
	}

	// Log a second activity with different type
	try {
		const r = await rpc("userActivity/log", {
			type: "feature_used",
			category: "resume",
			resourceType: "test",
			metadata: { feature: "test-script", action: "verify" },
		});
		if (r.ok && r.json) {
			log("PASS", "userActivity/log (2nd)", `id=${r.json}`);
		} else {
			log("FAIL", "userActivity/log (2nd)", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/log (2nd)", e.message);
	}

	// --- 4b. Get recent activities ---
	try {
		const r = await rpcGet("userActivity/getRecent", { limit: 10 });
		if (r.ok && Array.isArray(r.json)) {
			const recent = r.json.slice(0, 3).map((a) => `${a.category}/${a.activityType}`);
			log("PASS", "userActivity/getRecent", `count=${r.json.length}, recent=[${recent.join("; ")}]`);
		} else {
			log("FAIL", "userActivity/getRecent", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getRecent", e.message);
	}

	// --- 4c. Get activities by category ---
	try {
		const r = await rpcGet("userActivity/getByCategory", {
			category: "general",
			limit: 5,
		});
		if (r.ok && Array.isArray(r.json)) {
			log("PASS", "userActivity/getByCategory (general)", `count=${r.json.length}`);
		} else {
			log("FAIL", "userActivity/getByCategory (general)", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getByCategory (general)", e.message);
	}

	// --- 4d. Get activity stats ---
	try {
		const r = await rpcGet("userActivity/getStats");
		if (r.ok && r.json && typeof r.json.totalActivities === "number") {
			log(
				"PASS",
				"userActivity/getStats",
				`total=${r.json.totalActivities}, avgPerDay=${r.json.averagePerDay}, mostActiveDay=${r.json.mostActiveDay}`,
			);
		} else {
			log("FAIL", "userActivity/getStats", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getStats", e.message);
	}

	// --- 4e. Get daily activity ---
	try {
		const r = await rpcGet("userActivity/getDailyActivity", { days: 7 });
		if (r.ok && Array.isArray(r.json)) {
			const nonZero = r.json.filter((d) => d.count > 0);
			log("PASS", "userActivity/getDailyActivity", `days=${r.json.length}, daysWithActivity=${nonZero.length}`);
		} else {
			log("FAIL", "userActivity/getDailyActivity", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getDailyActivity", e.message);
	}

	// --- 4f. Today's count ---
	try {
		const r = await rpcGet("userActivity/getTodayCount");
		if (r.ok && typeof r.json === "number") {
			log("PASS", "userActivity/getTodayCount", `count=${r.json}`);
		} else {
			log("FAIL", "userActivity/getTodayCount", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getTodayCount", e.message);
	}

	// --- 4g. Week count ---
	try {
		const r = await rpcGet("userActivity/getWeekCount");
		if (r.ok && typeof r.json === "number") {
			log("PASS", "userActivity/getWeekCount", `count=${r.json}`);
		} else {
			log("FAIL", "userActivity/getWeekCount", `status=${r.status} ${truncate(r.text)}`);
		}
	} catch (e) {
		log("FAIL", "userActivity/getWeekCount", e.message);
	}

	// --- 4h. Delete the logged activity ---
	if (loggedActivityId) {
		try {
			const r = await rpc("userActivity/delete", { id: loggedActivityId });
			if (r.ok) {
				log("PASS", "userActivity/delete", `deleted id=${loggedActivityId}`);
			} else {
				log("FAIL", "userActivity/delete", `status=${r.status} ${truncate(r.text)}`);
			}
		} catch (e) {
			log("FAIL", "userActivity/delete", e.message);
		}
	} else {
		log("SKIP", "userActivity/delete", "No activity ID — log failed");
	}
}

// ============================================
// Main
// ============================================

async function main() {
	console.log("╔═══════════════════════════════════════════════════╗");
	console.log("║  Resume & Dashboard ORPC Endpoint Test Suite     ║");
	console.log("║  Target: " + BASE_URL.padEnd(41) + "║");
	console.log("║  User:   " + CREDENTIALS.email.padEnd(41) + "║");
	console.log("╚═══════════════════════════════════════════════════╝");

	// Check server is up
	try {
		const res = await fetch(BASE_URL, { redirect: "manual" });
		console.log(`\nServer status: ${res.status}`);
	} catch (e) {
		console.error(`\n\x1b[31mERROR: Cannot reach ${BASE_URL}\x1b[0m`);
		console.error("Make sure the dev server is running: pnpm dev");
		process.exit(1);
	}

	const authOk = await testAuth();
	if (!authOk) {
		console.error("\n\x1b[31mAuth failed — cannot proceed with tests\x1b[0m");
		process.exit(1);
	}

	await testResumeCrud();
	await testDashboard();
	await testTemplateGallery();
	await testUserActivity();

	// Summary
	console.log("\n╔═══════════════════════════════════════════════════╗");
	console.log("║                  TEST SUMMARY                    ║");
	console.log("╠═══════════════════════════════════════════════════╣");
	console.log(`║  \x1b[32mPASSED:  ${String(passed).padEnd(4)}\x1b[0m                                   ║`);
	console.log(`║  \x1b[31mFAILED:  ${String(failed).padEnd(4)}\x1b[0m                                   ║`);
	console.log(`║  \x1b[33mSKIPPED: ${String(skipped).padEnd(4)}\x1b[0m                                   ║`);
	console.log(`║  TOTAL:   ${String(passed + failed + skipped).padEnd(4)}                                  ║`);
	console.log("╚═══════════════════════════════════════════════════╝");

	if (failed > 0) {
		console.log("\n\x1b[31mFailed tests:\x1b[0m");
		for (const r of results) {
			if (r.status === "FAIL") {
				console.log(`  \x1b[31m✗\x1b[0m ${r.name} — ${r.detail}`);
			}
		}
	}

	process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
	console.error("Unhandled error:", e);
	process.exit(1);
});
