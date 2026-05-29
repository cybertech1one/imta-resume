/**
 * Tools API Endpoint Test Script
 * Tests all tool-related ORPC endpoints: resumeGallery, jobResources,
 * interviewTips, interviewQuestions, employers, marketInsights,
 * skillLibrary, resume, and atsChecker.
 *
 * ORPC wire protocol:
 *   POST body: {"json": <input>}
 *   GET query: ?data={"json": <input>}
 *   Response:  {"json": <output>, "meta": [...]}
 *   URL paths: use `/` not `.`
 *
 * Usage: node scripts/test-tools-api.mjs
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const STUDENT_CREDS = { email: "student1@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
const results = [];

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(status, name, detail = "") {
	const icon =
		status === "PASS"
			? "\x1b[32mPASS\x1b[0m"
			: "\x1b[31mFAIL\x1b[0m";
	const line = `  ${icon}  ${name.padEnd(48)} ${detail}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else failed++;
}

/** GET an ORPC endpoint with ?data={"json": <input>} query param */
async function rpcGet(path, input = undefined) {
	const data = input !== undefined ? { json: input } : { json: undefined };
	const qs = encodeURIComponent(JSON.stringify(data));
	const url = `${BASE_URL}/api/rpc/${path}?data=${qs}`;
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

/** POST an ORPC endpoint with {"json": <input>} envelope */
async function rpcPost(path, input = undefined) {
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
	return { status: res.status, json, text, ok: res.ok };
}

function describeResult(json) {
	if (Array.isArray(json)) return `${json.length} items`;
	if (json && typeof json === "object") {
		// Handle paginated: {items: [], total: n}
		if (Array.isArray(json.items)) return `${json.items.length} items (total: ${json.total ?? "?"})`;
		// Handle object with data array
		if (Array.isArray(json.data)) return `${json.data.length} items`;
		const keys = Object.keys(json);
		return `object with ${keys.length} keys [${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}]`;
	}
	if (json === null || json === undefined) return "null/empty";
	return String(json).slice(0, 60);
}

// ─── Auth ───────────────────────────────────────────────────────────────────

async function authenticate() {
	console.log("\n\x1b[1;36m" + "=".repeat(72) + "\x1b[0m");
	console.log("\x1b[1;36m  AUTHENTICATION\x1b[0m");
	console.log("\x1b[1;36m" + "=".repeat(72) + "\x1b[0m\n");

	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Origin: BASE_URL,
			},
			body: JSON.stringify(STUDENT_CREDS),
			redirect: "manual",
		});

		const cookies = res.headers.getSetCookie?.() || [];
		sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");

		if ((res.ok || res.status === 302) && sessionCookie) {
			log("PASS", "Sign in (student1@test.com)", `status=${res.status}, cookies=${cookies.length}`);
		} else {
			const body = await res.text();
			log("FAIL", "Sign in (student1@test.com)", `status=${res.status} ${body.slice(0, 120)}`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Sign in (student1@test.com)", e.message);
		return false;
	}

	// Verify session
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.email) {
			log("PASS", "Session verification", `user=${body.user.email}, role=${body.user.role}`);
			return true;
		} else {
			log("FAIL", "Session verification", `status=${res.status}, no user in session`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Session verification", e.message);
		return false;
	}
}

// ─── Public endpoints ───────────────────────────────────────────────────────

async function testPublicEndpoints() {
	console.log("\n\x1b[1;36m" + "=".repeat(72) + "\x1b[0m");
	console.log("\x1b[1;36m  PUBLIC ENDPOINTS (no auth required)\x1b[0m");
	console.log("\x1b[1;36m" + "=".repeat(72) + "\x1b[0m\n");

	const publicEndpoints = [
		// Resume Gallery
		["resumeGallery/list", "Resume Gallery - list"],
		["resumeGallery/getFeatured", "Resume Gallery - getFeatured"],
		["resumeGallery/getFields", "Resume Gallery - getFields"],

		// Job Resources
		["jobResources/list", "Job Resources - list"],
		["jobResources/getCategories", "Job Resources - getCategories"],

		// Interview Tips
		["interviewTips/list", "Interview Tips - list"],

		// Interview Questions
		["interviewQuestions/list", "Interview Questions - list"],

		// Employers
		["employers/list", "Employers - list"],

		// Market Insights
		["marketInsights/list", "Market Insights - list"],

		// Skill Library
		["skillLibrary/list", "Skill Library - list"],
	];

	// Save original cookie and clear it for public test
	const savedCookie = sessionCookie;
	sessionCookie = "";

	for (const [path, label] of publicEndpoints) {
		try {
			// Try GET first (most list endpoints are GET)
			let r = await rpcGet(path);

			// If GET 405 or failed, try POST
			if (!r.ok && (r.status === 405 || r.status === 404)) {
				r = await rpcPost(path);
			}

			if (r.ok) {
				log("PASS", label, describeResult(r.json));
			} else {
				// Try with auth in case "public" needs auth
				sessionCookie = savedCookie;
				r = await rpcGet(path);
				if (!r.ok) r = await rpcPost(path);
				sessionCookie = "";

				if (r.ok) {
					log("PASS", `${label} (needs auth)`, describeResult(r.json));
				} else {
					const errMsg = r.json?.message || r.text?.slice(0, 120) || `status=${r.status}`;
					log("FAIL", label, `status=${r.status} ${errMsg}`);
				}
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}

	// Restore cookie
	sessionCookie = savedCookie;
}

// ─── Protected endpoints ────────────────────────────────────────────────────

async function testProtectedEndpoints() {
	console.log("\n\x1b[1;36m" + "=".repeat(72) + "\x1b[0m");
	console.log("\x1b[1;36m  PROTECTED ENDPOINTS (auth required)\x1b[0m");
	console.log("\x1b[1;36m" + "=".repeat(72) + "\x1b[0m\n");

	// Test resume/list
	let resumeData = null;
	try {
		let r = await rpcPost("resume/list");
		if (!r.ok) r = await rpcGet("resume/list");

		if (r.ok) {
			const items = Array.isArray(r.json) ? r.json : r.json?.items || r.json?.data || [];
			log("PASS", "Resume - list", describeResult(r.json));

			// Grab first resume for ATS checker test
			if (items.length > 0) {
				resumeData = items[0];
			}
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 120) || `status=${r.status}`;
			log("FAIL", "Resume - list", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "Resume - list", e.message);
	}

	// If we got a resume, fetch its full data for ATS checker
	// The route is GET /resume/{id} — ORPC maps `id` input to path param
	if (resumeData?.id) {
		try {
			let r = await rpcGet("resume/getById", { id: resumeData.id });
			if (!r.ok) r = await rpcPost("resume/getById", { id: resumeData.id });

			if (r.ok && r.json) {
				resumeData = r.json;
				log("PASS", "Resume - getById", `id=${resumeData.id}, name=${resumeData.name || "untitled"}`);
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 120) || `status=${r.status}`;
				log("FAIL", "Resume - getById", `status=${r.status} ${errMsg}`);
			}
		} catch (e) {
			log("FAIL", "Resume - getById", e.message);
		}
	}

	// Test ATS Checker — needs a full resumeDataSchema object
	// (picture, basics, summary, sections, customSections, metadata)
	try {
		// Use real resume data if available, otherwise build a valid default
		const fullResumeData = resumeData?.data || {
			picture: {
				hidden: false, url: "", size: 80, rotation: 0,
				aspectRatio: 1, borderRadius: 0,
				borderColor: "rgba(0,0,0,0.5)", borderWidth: 0,
				shadowColor: "rgba(0,0,0,0.5)", shadowWidth: 0,
			},
			basics: {
				name: "Test User", headline: "Software Engineer",
				email: "test@example.com", phone: "+1234567890",
				location: "New York, NY",
				website: { url: "https://example.com", label: "Portfolio" },
				customFields: [],
				cin: "", militaryServiceStatus: "not-applicable",
				dateOfBirth: "", nationality: "", maritalStatus: "",
			},
			summary: {
				title: "Summary", columns: 1, hidden: false,
				content: "Experienced software engineer with 5 years in web development.",
			},
			sections: {
				profiles: { title: "Profiles", columns: 1, hidden: false, items: [] },
				experience: {
					title: "Experience", columns: 1, hidden: false,
					items: [{
						id: "exp1", visible: true, company: "Tech Corp",
						position: "Senior Developer", date: "2020 - Present",
						location: "NYC", summary: "Led web application development using React and Node.js.",
						url: { url: "", label: "" },
					}],
				},
				education: {
					title: "Education", columns: 1, hidden: false,
					items: [{
						id: "edu1", visible: true, institution: "MIT",
						studyType: "BS Computer Science", date: "2015 - 2019",
						area: "Computer Science", score: "3.8",
						summary: "", url: { url: "", label: "" },
					}],
				},
				projects: { title: "Projects", columns: 1, hidden: false, items: [] },
				skills: {
					title: "Skills", columns: 1, hidden: false,
					items: [
						{ id: "sk1", visible: true, name: "React", description: "", level: 5, keywords: [] },
						{ id: "sk2", visible: true, name: "TypeScript", description: "", level: 4, keywords: [] },
						{ id: "sk3", visible: true, name: "Node.js", description: "", level: 4, keywords: [] },
					],
				},
				languages: { title: "Languages", columns: 1, hidden: false, items: [] },
				interests: { title: "Interests", columns: 1, hidden: false, items: [] },
				awards: { title: "Awards", columns: 1, hidden: false, items: [] },
				certifications: { title: "Certifications", columns: 1, hidden: false, items: [] },
				publications: { title: "Publications", columns: 1, hidden: false, items: [] },
				volunteer: { title: "Volunteer", columns: 1, hidden: false, items: [] },
				references: { title: "References", columns: 1, hidden: false, items: [] },
				internships: { title: "Internships", columns: 1, hidden: false, items: [] },
			},
			customSections: [],
			metadata: {
				template: "onyx",
				layout: {
					sidebarWidth: 35,
					pages: [{
						fullWidth: false,
						main: ["profiles", "summary", "education", "experience"],
						sidebar: ["skills", "languages"],
					}],
				},
				css: { enabled: false, value: "" },
				page: {
					gapX: 4, gapY: 6, marginX: 14, marginY: 12,
					format: "a4", locale: "en-US", hideIcons: false,
				},
				design: {
					colors: {
						primary: "rgba(220,38,38,1)",
						text: "rgba(0,0,0,1)",
						background: "rgba(255,255,255,1)",
					},
					level: { icon: "star", type: "circle" },
				},
				typography: {
					body: { fontFamily: "IBM Plex Serif", fontWeights: ["400","500"], fontSize: 10, lineHeight: 1.5 },
					heading: { fontFamily: "IBM Plex Serif", fontWeights: ["600"], fontSize: 14, lineHeight: 1.5 },
				},
				notes: "",
				businessCard: {
					enabled: false, showPhoto: true, showHeadline: true,
					showEmail: true, showPhone: false, showLocation: true,
					showSocialLinks: true, showWebsite: true, theme: "professional",
					accentColor: "#3b82f6", qrCodeMode: "url", showSummary: false,
				},
			},
		};

		const atsInput = { resumeData: fullResumeData };

		let r = await rpcPost("atsChecker/checkAtsScore", atsInput);

		if (r.ok) {
			const score = r.json?.score ?? r.json?.overallScore ?? "?";
			log("PASS", "ATS Checker - checkAtsScore", `score=${score}, ${describeResult(r.json)}`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200) || `status=${r.status}`;
			log("FAIL", "ATS Checker - checkAtsScore", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "ATS Checker - checkAtsScore", e.message);
	}
}

// ─── Summary ────────────────────────────────────────────────────────────────

function printSummary() {
	console.log("\n\x1b[1;36m" + "=".repeat(72) + "\x1b[0m");
	console.log("\x1b[1;36m  SUMMARY\x1b[0m");
	console.log("\x1b[1;36m" + "=".repeat(72) + "\x1b[0m\n");

	const total = passed + failed;
	const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";

	console.log(`  Total:   ${total}`);
	console.log(`  \x1b[32mPassed:  ${passed}\x1b[0m`);
	console.log(`  \x1b[31mFailed:  ${failed}\x1b[0m`);
	console.log(`  Rate:    ${passRate}%`);

	const failures = results.filter((r) => r.status === "FAIL");
	if (failures.length > 0) {
		console.log("\n  \x1b[1;31mFailures:\x1b[0m");
		for (const f of failures) {
			console.log(`    \x1b[31m- ${f.name}\x1b[0m  ${f.detail}`);
		}
	}

	console.log("\n" + "=".repeat(72));
	console.log(
		total === passed
			? "\x1b[1;32m  ALL TESTS PASSED\x1b[0m"
			: `\x1b[1;31m  ${failed} TEST(S) FAILED\x1b[0m`,
	);
	console.log("=".repeat(72) + "\n");
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
	console.log("\n\x1b[1m  Tools API Test Suite\x1b[0m");
	console.log(`  Target: ${BASE_URL}`);
	console.log(`  Date:   ${new Date().toISOString()}\n`);

	// Check server is reachable
	try {
		const res = await fetch(BASE_URL, { method: "HEAD", signal: AbortSignal.timeout(5000) });
		console.log(`  Server: \x1b[32mreachable\x1b[0m (status ${res.status})\n`);
	} catch (e) {
		console.error(`  \x1b[31mServer unreachable at ${BASE_URL}: ${e.message}\x1b[0m`);
		console.error("  Make sure the dev server is running (pnpm dev).\n");
		process.exit(1);
	}

	const authOk = await authenticate();

	await testPublicEndpoints();

	if (authOk) {
		await testProtectedEndpoints();
	} else {
		console.log("\n  \x1b[33mSkipping protected endpoints - auth failed\x1b[0m\n");
	}

	printSummary();
	process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
	console.error("\x1b[31mFatal error:\x1b[0m", e);
	process.exit(1);
});
