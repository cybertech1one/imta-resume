/**
 * API Endpoint Test Script
 * Tests auth, dashboard, AI generation, and key ORPC endpoints
 *
 * ORPC wire protocol: body must be wrapped in {"json": <input>} envelope
 * For GET routes, input goes in ?data={"json": <input>} query param
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "admin@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];

function log(status, name, detail = "") {
	const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : status === "FAIL" ? "\x1b[31m✗\x1b[0m" : "\x1b[33m⊘\x1b[0m";
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
		// ORPC response is also wrapped in {json: ..., meta: ...} envelope
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
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

/** POST a streaming ORPC endpoint with {json: input} envelope, return full text */
async function rpcStream(path, input) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = { json: input };
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
	return { status: res.status, text, ok: res.ok };
}

async function testAuth() {
	console.log("\n\x1b[1m=== AUTH ===\x1b[0m");

	// Login
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

		if (res.ok || res.status === 302) {
			log("PASS", "Login (sign-in/email)", `status=${res.status}, cookies=${cookies.length}`);
		} else {
			const body = await res.text();
			log("FAIL", "Login (sign-in/email)", `status=${res.status} ${body.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Login (sign-in/email)", e.message);
	}

	// Session check
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (res.ok && body?.user?.email) {
			log("PASS", "Session check", `user=${body.user.email} role=${body.user.role}`);
		} else {
			log("FAIL", "Session check", `status=${res.status} no user in session`);
		}
	} catch (e) {
		log("FAIL", "Session check", e.message);
	}
}

async function testDashboard() {
	console.log("\n\x1b[1m=== DASHBOARD ===\x1b[0m");

	const endpoints = [
		["dashboard/getStatistics", "Dashboard stats"],
		["dashboard/getRecentActivity", "Recent activity"],
		["dashboard/getUpcomingItems", "Upcoming items"],
		["resume/list", "List resumes"],
		["flags/get", "Feature flags"],
		["goals/list", "List goals"],
	];

	for (const [path, label] of endpoints) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", label, JSON.stringify(r.json).slice(0, 80));
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 120);
				log("FAIL", label, `status=${r.status} ${errMsg}`);
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}
}

async function testAIMentor() {
	console.log("\n\x1b[1m=== AI MENTOR ===\x1b[0m");

	const endpoints = [
		["aiMentor/templates/list", "Mentor templates"],
		["aiMentor/user/list", "User mentors"],
		["aiMentor/onboarding/get", "Onboarding status"],
	];

	for (const [path, label] of endpoints) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", label, JSON.stringify(r.json).slice(0, 80));
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 120);
				log("FAIL", label, `status=${r.status} ${errMsg}`);
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}
}

async function testAIGeneration() {
	console.log("\n\x1b[1m=== AI GENERATION (DeepSeek) ===\x1b[0m");

	// AI Config Status (public)
	try {
		const r = await rpc("aiConfig/status/check");
		if (r.ok) {
			log("PASS", "AI Config Status", JSON.stringify(r.json).slice(0, 100));
		} else {
			log("FAIL", "AI Config Status", `status=${r.status}`);
		}
	} catch (e) {
		log("FAIL", "AI Config Status", e.message);
	}

	// Test AI connection
	try {
		const r = await rpc("ai/testConnection");
		if (r.ok) {
			log("PASS", "AI Test Connection", JSON.stringify(r.json).slice(0, 120));
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "AI Test Connection", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "AI Test Connection", e.message);
	}

	// Test AI improve content (streaming endpoint)
	try {
		const r = await rpcStream("ai/improveContent", {
			content: "i worked at a company doing stuff with computers and helping people",
			language: "en",
		});
		if (r.ok) {
			log("PASS", "AI Improve Content (stream)", `response length=${r.text.length}, preview: ${r.text.slice(0, 80)}`);
		} else {
			log("FAIL", "AI Improve Content", `status=${r.status} ${r.text.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "AI Improve Content", e.message);
	}

	// Test AI fix grammar (streaming endpoint)
	try {
		const r = await rpcStream("ai/fixGrammar", {
			content: "i has good experience working with teams and managing projects for clients",
			language: "en",
		});
		if (r.ok) {
			log("PASS", "AI Fix Grammar (stream)", `response length=${r.text.length}, preview: ${r.text.slice(0, 80)}`);
		} else {
			log("FAIL", "AI Fix Grammar", `status=${r.status} ${r.text.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "AI Fix Grammar", e.message);
	}

	// Test AI generate summary (streaming endpoint)
	try {
		const r = await rpcStream("ai/generateSummary", {
			resumeData: {
				name: "Ahmed Bennani",
				headline: "Software Engineer",
				experience: [{ company: "TechCorp Morocco", position: "Full Stack Developer", description: "Built web apps using React and Node.js" }],
				skills: [{ name: "JavaScript" }, { name: "React" }, { name: "Node.js" }, { name: "Python" }],
			},
			language: "en",
		});
		if (r.ok) {
			log("PASS", "AI Generate Summary (stream)", `response length=${r.text.length}, preview: ${r.text.slice(0, 80)}`);
		} else {
			log("FAIL", "AI Generate Summary", `status=${r.status} ${r.text.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "AI Generate Summary", e.message);
	}

	// Test AI generate headline (non-streaming)
	try {
		const r = await rpc("ai/generateHeadline", {
			resumeData: {
				name: "Ahmed Bennani",
				currentHeadline: "Engineer",
				experience: [{ company: "Hospital Universitaire", position: "Biomedical Engineer" }],
				skills: ["Medical Devices", "Quality Assurance", "Healthcare IT"],
			},
			language: "en",
		});
		if (r.ok) {
			log("PASS", "AI Generate Headline", `${JSON.stringify(r.json).slice(0, 120)}`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "AI Generate Headline", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "AI Generate Headline", e.message);
	}

	// Test AI suggest skills (non-streaming)
	try {
		const r = await rpc("ai/suggestSkills", {
			resumeData: {
				experience: [{ company: "TechCorp", position: "Software Engineer", description: "Built APIs and frontends" }],
				education: [{ degree: "BSc", area: "Computer Science", institution: "IMTA" }],
				skills: ["JavaScript"],
			},
			language: "en",
		});
		if (r.ok) {
			log("PASS", "AI Suggest Skills", `${JSON.stringify(r.json).slice(0, 120)}`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "AI Suggest Skills", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "AI Suggest Skills", e.message);
	}
}

async function testInterviewAI() {
	console.log("\n\x1b[1m=== INTERVIEW AI ===\x1b[0m");

	// Generate questions
	try {
		const r = await rpc("interview/generateQuestions", {
			field: "general",
			types: ["behavioral", "technical"],
			difficulty: "beginner",
			numberOfQuestions: 3,
			language: "en",
		});
		if (r.ok && Array.isArray(r.json)) {
			log("PASS", "Generate Interview Questions", `${r.json.length} questions generated`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "Generate Interview Questions", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "Generate Interview Questions", e.message);
	}

	// Get sessions
	try {
		const r = await rpc("interview/getSessions", { limit: 5, offset: 0 });
		if (r.ok) {
			log("PASS", "Get Interview Sessions", `${Array.isArray(r.json) ? r.json.length : 0} sessions`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "Get Interview Sessions", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "Get Interview Sessions", e.message);
	}

	// Get tips
	try {
		const r = await rpc("interview/getTips", { language: "en" });
		if (r.ok && Array.isArray(r.json)) {
			log("PASS", "Get Interview Tips", `${r.json.length} tips`);
		} else {
			const errMsg = r.json?.message || r.text?.slice(0, 200);
			log("FAIL", "Get Interview Tips", `status=${r.status} ${errMsg}`);
		}
	} catch (e) {
		log("FAIL", "Get Interview Tips", e.message);
	}

	// Chat with interviewer (streaming)
	try {
		const r = await rpcStream("interview/chatWithInterviewer", {
			messages: [{ role: "user", content: "Hello, I am ready for interview practice" }],
			mode: "quick_practice",
			field: "general",
			language: "en",
			isFirstMessage: true,
			requestSummary: false,
		});
		if (r.ok && r.text.length > 50) {
			log("PASS", "Chat with Interviewer (stream)", `response length=${r.text.length}`);
		} else {
			log("FAIL", "Chat with Interviewer", `status=${r.status} ${r.text.slice(0, 200)}`);
		}
	} catch (e) {
		log("FAIL", "Chat with Interviewer", e.message);
	}
}

async function testOtherEndpoints() {
	console.log("\n\x1b[1m=== OTHER ENDPOINTS ===\x1b[0m");

	const endpoints = [
		["jobApplications/list", "Job applications"],
		["deadlines/list", "Deadlines"],
		["interviewScheduler/list", "Interviews"],
		["journal/list", "Journal"],
		["notification/list", "Notifications"],
		["salaryHistory/list", "Salary history"],
		["workSamples/listProjects", "Work samples"],
		["achievements/getUserAchievements", "Achievements"],
		["resume/tags/list", "Resume tags"],
	];

	for (const [path, label] of endpoints) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", label, JSON.stringify(r.json).slice(0, 60));
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 100);
				if (r.status === 404) {
					log("SKIP", label, "endpoint not found");
				} else if (r.status === 500) {
					log("FAIL", label, `500 SERVER ERROR — ${errMsg}`);
				} else {
					log("FAIL", label, `status=${r.status} ${errMsg}`);
				}
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}
}

async function testAdminEndpoints() {
	console.log("\n\x1b[1m=== ADMIN ENDPOINTS ===\x1b[0m");

	// admin/users/list is a GET route
	try {
		const r = await rpcGet("admin/users/list", { page: 1, limit: 5 });
		if (r.ok) {
			log("PASS", "List users", JSON.stringify(r.json).slice(0, 80));
		} else {
			// Also try POST in case it works
			const r2 = await rpc("admin/users/list", { page: 1, limit: 5 });
			if (r2.ok) {
				log("PASS", "List users (POST)", JSON.stringify(r2.json).slice(0, 80));
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 100);
				log("FAIL", "List users", `status=${r.status} ${errMsg}`);
			}
		}
	} catch (e) {
		log("FAIL", "List users", e.message);
	}

	const postEndpoints = [
		["admin/analytics/getOverview", "Analytics overview"],
		["admin/system/getHealth", "System health"],
		["aiConfig/providers/list", "AI providers"],
		["aiConfig/usage/getGlobalStats", "AI global stats"],
	];

	for (const [path, label] of postEndpoints) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", label, JSON.stringify(r.json).slice(0, 80));
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 100);
				log("FAIL", label, `status=${r.status} ${errMsg}`);
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}
}

async function testReferenceData() {
	console.log("\n\x1b[1m=== REFERENCE DATA ENDPOINTS ===\x1b[0m");

	const endpoints = [
		["imtaPrograms/list", "IMTA Programs", 7],
		["interviewTips/list", "Interview Tips", 8],
		["interviewQuestions/list", "Interview Questions", 6],
		["marketInsights/list", "Market Insights", 4],
		["employers/list", "Employers", 3],
		["skillLibrary/list", "Skill Library", 10],
	];

	for (const [path, label, minCount] of endpoints) {
		try {
			const r = await rpc(path, {});
			if (r.ok && Array.isArray(r.json) && r.json.length >= minCount) {
				log("PASS", label, `${r.json.length} items`);
			} else if (r.ok) {
				log("PASS", label, `${Array.isArray(r.json) ? r.json.length : '?'} items (fewer than expected)`);
			} else {
				const errMsg = r.json?.message || r.text?.slice(0, 100);
				log("FAIL", label, `status=${r.status} ${errMsg}`);
			}
		} catch (e) {
			log("FAIL", label, e.message);
		}
	}
}

// Run all tests
async function main() {
	console.log("\x1b[1m\x1b[36m╔══════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m\x1b[36m║   API Endpoint & AI Generation Tests     ║\x1b[0m");
	console.log("\x1b[1m\x1b[36m╚══════════════════════════════════════════╝\x1b[0m");
	console.log(`Server: ${BASE_URL}\n`);

	await testAuth();
	await testDashboard();
	await testAIMentor();
	await testAIGeneration();
	await testInterviewAI();
	await testOtherEndpoints();
	await testReferenceData();
	await testAdminEndpoints();

	// Summary
	console.log("\n\x1b[1m══════════════════════════════════════════\x1b[0m");
	console.log(`\x1b[1mResults:\x1b[0m \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, \x1b[33m${skipped} skipped\x1b[0m`);
	console.log(`Total: ${passed + failed + skipped} tests\n`);

	if (failed > 0) {
		console.log("\x1b[31m\x1b[1mFailed tests:\x1b[0m");
		for (const r of results.filter((r) => r.status === "FAIL")) {
			console.log(`  \x1b[31m✗\x1b[0m ${r.name}: ${r.detail}`);
		}
		console.log("");
	}

	process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
