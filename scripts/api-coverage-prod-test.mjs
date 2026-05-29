/**
 * Full API Coverage Test - Production
 * Tests all major ORPC router endpoints against live production
 * URL: https://imta-resume-app-production.up.railway.app
 *
 * Uses Node.js https module (NOT native fetch) to avoid hanging.
 * Protocol: POST /api/auth/sign-in/email for login, then ORPC calls with cookie + x-csrf-token: orpc
 */

import http from "http";
import https from "https";

const BASE_URL = process.env.BASE_URL || "https://imta-resume-app-production.up.railway.app";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@test.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TestAccount123!";

// Results tracking
const results = [];
let cookies = "";

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function request(urlStr, options = {}) {
	return new Promise((resolve, reject) => {
		const url = new URL(urlStr);
		const mod = url.protocol === "https:" ? https : http;

		const reqOptions = {
			hostname: url.hostname,
			port: url.port || (url.protocol === "https:" ? 443 : 80),
			path: url.pathname + url.search,
			method: options.method || "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...(options.headers || {}),
			},
			timeout: 20000,
		};

		const req = mod.request(reqOptions, (res) => {
			let body = "";
			res.on("data", (chunk) => {
				body += chunk;
			});
			res.on("end", () => {
				resolve({
					status: res.statusCode,
					headers: res.headers,
					body,
					json() {
						try {
							return JSON.parse(body);
						} catch {
							return null;
						}
					},
				});
			});
		});

		req.on("error", reject);
		req.on("timeout", () => {
			req.destroy();
			reject(new Error("Timeout"));
		});

		if (options.body) {
			req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
		}
		req.end();
	});
}

// Extract Set-Cookie headers and build cookie string
function extractCookies(headers) {
	const setCookie = headers["set-cookie"];
	if (!setCookie) return "";
	const parsed = Array.isArray(setCookie) ? setCookie : [setCookie];
	return parsed
		.map((c) => c.split(";")[0].trim())
		.filter(Boolean)
		.join("; ");
}

// ─── Auth ────────────────────────────────────────────────────────────────────

async function login() {
	console.log("\n[AUTH] Logging in as admin@test.com...");
	const res = await request(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
		},
		body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
	});

	if (res.status !== 200) {
		console.error(`[AUTH] Login failed: ${res.status} ${res.body.substring(0, 200)}`);
		process.exit(1);
	}

	cookies = extractCookies(res.headers);
	console.log(`[AUTH] Login OK. Cookies: ${cookies.substring(0, 80)}...`);
	return cookies;
}

// ─── ORPC call helpers ───────────────────────────────────────────────────────

async function orpcGet(path, input = {}) {
	const query = encodeURIComponent(JSON.stringify({ json: input }));
	const url = `${BASE_URL}/api/rpc/${path}?data=${query}`;
	try {
		const res = await request(url, {
			method: "GET",
			headers: {
				"x-csrf-token": "orpc",
				Cookie: cookies,
				Origin: BASE_URL,
			},
		});
		// Most ORPC query procedures are POST-only (GET is only enabled for endpoints
		// with an explicit GET route). A 404/405 on GET does NOT mean the endpoint is
		// missing — retry as POST, which is the canonical ORPC transport.
		if (res.status === 404 || res.status === 405) {
			return orpcPost(path, input);
		}
		return { status: res.status, data: res.json(), raw: res.body.substring(0, 300) };
	} catch (err) {
		return { status: 0, error: err.message };
	}
}

async function orpcPost(path, input = {}) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	try {
		const res = await request(url, {
			method: "POST",
			headers: {
				"x-csrf-token": "orpc",
				Cookie: cookies,
				Origin: BASE_URL,
			},
			body: JSON.stringify({ json: input }),
		});
		return { status: res.status, data: res.json(), raw: res.body.substring(0, 300) };
	} catch (err) {
		return { status: 0, error: err.message };
	}
}

// ─── Result recording ────────────────────────────────────────────────────────

function record(endpoint, res, note = "") {
	const isOk = res.status >= 200 && res.status < 300;
	const hasData = res.data && res.data.json !== undefined;
	const isEmpty = hasData && ((Array.isArray(res.data.json) && res.data.json.length === 0) || res.data.json === null);

	let statusLabel = "OK";
	if (!isOk) statusLabel = `BROKEN(${res.status})`;
	else if (res.error) statusLabel = "ERROR";
	else if (isEmpty) statusLabel = "OK(empty)";

	const row = {
		endpoint,
		status: res.error ? 0 : res.status,
		result: statusLabel,
		note: note || (res.error ? res.error : ""),
	};
	results.push(row);

	const icon = statusLabel.startsWith("BROKEN") || statusLabel === "ERROR" ? "FAIL" : "PASS";
	console.log(`  [${icon}] ${endpoint} → ${res.status || "ERR"} ${statusLabel} ${note || ""}`);
	return row;
}

// ─── Test suites ─────────────────────────────────────────────────────────────

async function testResume() {
	console.log("\n=== RESUME ===");
	const list = await orpcGet("resume/list");
	record("resume/list", list);

	let resumeId = null;
	if (list.data?.json?.length > 0) {
		resumeId = list.data.json[0].id;
	}

	const tags = await orpcGet("resume/tags/list");
	record("resume/tags/list", tags);

	if (resumeId) {
		const byId = await orpcGet("resume/getById", { id: resumeId });
		record(`resume/getById`, byId, `id=${resumeId.substring(0, 8)}`);

		const stats = await orpcGet("resume/statistics/getById", { id: resumeId });
		record("resume/statistics/getById", stats);
	} else {
		console.log("  [SKIP] No resumes found for getById tests");
		results.push({ endpoint: "resume/getById", status: null, result: "SKIP", note: "no resumes" });
		results.push({ endpoint: "resume/statistics/getById", status: null, result: "SKIP", note: "no resumes" });
	}

	return resumeId;
}

async function testAiConfig() {
	console.log("\n=== AI CONFIG ===");
	const status = await orpcGet("aiConfig/status/check");
	record("aiConfig/status/check", status, "(public)");

	const providers = await orpcGet("aiConfig/providers/list");
	record("aiConfig/providers/list", providers, "(admin)");

	const quotas = await orpcGet("aiConfig/quotas/list");
	record("aiConfig/quotas/list", quotas, "(admin)");

	const usage = await orpcGet("aiConfig/usage/getMyUsage");
	record("aiConfig/usage/getMyUsage", usage);

	const myQuota = await orpcGet("aiConfig/usage/getMyQuota");
	record("aiConfig/usage/getMyQuota", myQuota);

	const globalStats = await orpcGet("aiConfig/usage/getGlobalStats");
	record("aiConfig/usage/getGlobalStats", globalStats, "(admin)");

	const detailedStats = await orpcGet("aiConfig/usage/getDetailedStats");
	record("aiConfig/usage/getDetailedStats", detailedStats);

	const globalDetailedStats = await orpcGet("aiConfig/usage/getGlobalDetailedStats");
	record("aiConfig/usage/getGlobalDetailedStats", globalDetailedStats, "(admin)");

	const globalSettings = await orpcGet("aiConfig/globalSettings/get");
	record("aiConfig/globalSettings/get", globalSettings, "(admin)");

	const checkGlobalQuota = await orpcGet("aiConfig/globalSettings/checkGlobalQuota");
	record("aiConfig/globalSettings/checkGlobalQuota", checkGlobalQuota, "(admin)");
}

async function testAiHistory() {
	console.log("\n=== AI HISTORY ===");
	const list = await orpcGet("aiHistory/list");
	record("aiHistory/list", list);

	const stats = await orpcGet("aiHistory/getStats");
	record("aiHistory/getStats", stats);
}

async function testInterview() {
	console.log("\n=== INTERVIEW ===");
	const readiness = await orpcGet("interview/getReadinessScore");
	record("interview/getReadinessScore", readiness);

	const sessions = await orpcGet("interview/sessions/list");
	record("interview/sessions/list", sessions);

	const tips = await orpcGet("interview/getTips", { field: "healthcare", language: "fr" });
	record("interview/getTips", tips);

	const commonQ = await orpcGet("interview/getCommonQuestions", { field: "healthcare" });
	record("interview/getCommonQuestions", commonQ);

	const favorites = await orpcGet("interview/favorites/listTipFavorites");
	record("interview/favorites/listTipFavorites", favorites);
}

async function testCareer() {
	console.log("\n=== CAREER ===");
	const paths = await orpcGet("career/getCareerPaths", { language: "fr" });
	record("career/getCareerPaths", paths, "(public)");

	const program = await orpcGet("career/getCareerProgram", { programId: "infirmier_polyvalent", language: "fr" });
	record("career/getCareerProgram", program, "(public)");

	const marketInsights = await orpcGet("career/getMarketInsights");
	record("career/getMarketInsights", marketInsights);

	const topEmployers = await orpcGet("career/getTopEmployers");
	record("career/getTopEmployers", topEmployers);

	const assessmentQ = await orpcGet("career/getAssessmentQuestions", { language: "fr" });
	record("career/getAssessmentQuestions", assessmentQ);

	const userSkills = await orpcGet("career/userSkills/list");
	record("career/userSkills/list", userSkills);

	const timelines = await orpcGet("career/timelines/list");
	record("career/timelines/list", timelines);

	const roadmaps = await orpcGet("career/roadmaps/list");
	record("career/roadmaps/list", roadmaps);

	const studyPlans = await orpcGet("career/studyPlans/list");
	record("career/studyPlans/list", studyPlans);

	const certifications = await orpcGet("career/certifications/list");
	record("career/certifications/list", certifications);

	const gapAnalyses = await orpcGet("career/gapAnalysis/list");
	record("career/gapAnalysis/list", gapAnalyses);
}

async function testReferenceData() {
	console.log("\n=== REFERENCE DATA ===");
	const programs = await orpcGet("imtaPrograms/list");
	record("imtaPrograms/list", programs);

	const tips = await orpcGet("interviewTips/list");
	record("interviewTips/list", tips);

	const questions = await orpcGet("interviewQuestions/list");
	record("interviewQuestions/list", questions);

	const insights = await orpcGet("marketInsights/list");
	record("marketInsights/list", insights);

	const employers = await orpcGet("employers/list");
	record("employers/list", employers);

	const skills = await orpcGet("skillLibrary/list");
	record("skillLibrary/list", skills);
}

async function testGoals() {
	console.log("\n=== GOALS ===");
	const list = await orpcGet("goals/list");
	record("goals/list", list);

	const stats = await orpcGet("goals/getStatistics");
	record("goals/getStatistics", stats);
}

async function testNotifications() {
	console.log("\n=== NOTIFICATIONS ===");
	const list = await orpcGet("notification/list");
	record("notification/list", list);

	const count = await orpcGet("notification/getUnreadCount");
	record("notification/getUnreadCount", count);

	const prefs = await orpcGet("notification/preferences/get");
	record("notification/preferences/get", prefs);
}

async function testStatistics() {
	console.log("\n=== STATISTICS ===");
	const userCount = await orpcGet("statistics/user/getCount");
	record("statistics/user/getCount", userCount, "(public)");

	const resumeCount = await orpcGet("statistics/resume/getCount");
	record("statistics/resume/getCount", resumeCount, "(public)");
}

async function testAnalytics() {
	console.log("\n=== ANALYTICS ===");
	const overview = await orpcGet("analytics/getOverview");
	record("analytics/getOverview", overview);

	const aiAnalyticsStudent = await orpcGet("aiAnalyticsStudent/getSummary");
	record("aiAnalyticsStudent/getSummary", aiAnalyticsStudent);

	const aiAnalyticsAdmin = await orpcGet("aiAnalyticsAdmin/getOverview");
	record("aiAnalyticsAdmin/getOverview", aiAnalyticsAdmin, "(admin)");
}

async function testAdmin() {
	console.log("\n=== ADMIN ===");
	const users = await orpcGet("admin/users/list");
	record("admin/users/list", users, "(admin)");

	const auditLogs = await orpcGet("admin/audit/list");
	record("admin/audit/list", auditLogs, "(admin)");

	const cohortAnalytics = await orpcGet("cohortAnalytics/getOverview");
	record("cohortAnalytics/getOverview", cohortAnalytics, "(admin)");

	const aiMetrics = await orpcGet("aiMetrics/getSummary");
	record("aiMetrics/getSummary", aiMetrics, "(admin)");
}

async function testPartner() {
	console.log("\n=== PARTNER ===");
	const profile = await orpcGet("partner/profile/get");
	record("partner/profile/get", profile);

	const jobPostings = await orpcGet("partner/jobPostings/list");
	record("partner/jobPostings/list", jobPostings);

	const events = await orpcGet("partner/events/list");
	record("partner/events/list", events);

	const publicProfiles = await orpcGet("partner/public/listProfiles");
	record("partner/public/listProfiles", publicProfiles, "(public)");

	const publicJobs = await orpcGet("partner/public/listJobs");
	record("partner/public/listJobs", publicJobs, "(public)");
}

async function testJobApplications() {
	console.log("\n=== JOB APPLICATIONS ===");
	const list = await orpcGet("jobApplications/list");
	record("jobApplications/list", list);

	const stats = await orpcGet("jobApplications/getStats");
	record("jobApplications/getStats", stats);
}

async function testNetworking() {
	console.log("\n=== NETWORKING ===");
	const contacts = await orpcGet("networking/list");
	record("networking/list", contacts);

	const events = await orpcGet("networkingEvents/list");
	record("networkingEvents/list", events);

	const mentors = await orpcGet("mentors/list");
	record("mentors/list", mentors);
}

async function testLearningPath() {
	console.log("\n=== LEARNING PATH ===");
	const paths = await orpcGet("learningPath/list");
	record("learningPath/list", paths);

	const progress = await orpcGet("skillProgress/list");
	record("skillProgress/list", progress);
}

async function testAiMentor() {
	console.log("\n=== AI MENTOR ===");
	const onboarding = await orpcGet("aiMentor/getOnboarding");
	record("aiMentor/getOnboarding", onboarding);

	const sessions = await orpcGet("aiMentor/getSessions");
	record("aiMentor/getSessions", sessions);
}

async function testCareerMatcher() {
	console.log("\n=== CAREER MATCHER ===");
	const results_data = await orpcGet("careerMatcher/getResults");
	record("careerMatcher/getResults", results_data);
}

async function testMockAi() {
	console.log("\n=== MOCK AI (MOCK INTERVIEW) ===");
	const sessions = await orpcGet("mockAi/sessions/list");
	record("mockAi/sessions/list", sessions);
}

async function testVoiceInterview() {
	console.log("\n=== VOICE INTERVIEW ===");
	const sessions = await orpcGet("voiceInterview/sessions/list");
	record("voiceInterview/sessions/list", sessions);
}

async function testSkillGap() {
	console.log("\n=== SKILL GAP ===");
	const analyses = await orpcGet("skillGap/list");
	record("skillGap/list", analyses);
}

async function testResources() {
	console.log("\n=== RESOURCES ===");
	const list = await orpcGet("resources/list");
	record("resources/list", list);
}

async function testDashboard() {
	console.log("\n=== DASHBOARD ===");
	const overview = await orpcGet("dashboard/getOverview");
	record("dashboard/getOverview", overview);

	const activity = await orpcGet("dashboard/getRecentActivity");
	record("dashboard/getRecentActivity", activity);
}

async function testAchievements() {
	console.log("\n=== ACHIEVEMENTS ===");
	const list = await orpcGet("achievements/list");
	record("achievements/list", list);

	const stats = await orpcGet("achievements/getStats");
	record("achievements/getStats", stats);
}

async function testStudentProgress() {
	console.log("\n=== STUDENT PROGRESS ===");
	const overview = await orpcGet("studentProgress/getOverview");
	record("studentProgress/getOverview", overview);
}

async function testUserSettings() {
	console.log("\n=== USER SETTINGS ===");
	const settings = await orpcGet("userSettings/get");
	record("userSettings/get", settings);
}

async function testFlags() {
	console.log("\n=== FLAGS ===");
	const all = await orpcGet("flags/all");
	record("flags/all", all, "(public)");
}

async function testInterviewAnalytics() {
	console.log("\n=== INTERVIEW ANALYTICS ===");
	const summary = await orpcGet("interviewAnalytics/getSummary");
	record("interviewAnalytics/getSummary", summary);
}

async function testCareerCoaching() {
	console.log("\n=== CAREER COACHING ===");
	const sessions = await orpcGet("careerCoaching/getSessions");
	record("careerCoaching/getSessions", sessions);
}

async function testInsights() {
	console.log("\n=== INSIGHTS ===");
	const list = await orpcGet("insights/list");
	record("insights/list", list);
}

async function testJournal() {
	console.log("\n=== JOURNAL ===");
	const list = await orpcGet("journal/list");
	record("journal/list", list);
}

async function testActivity() {
	console.log("\n=== ACTIVITY ===");
	const list = await orpcGet("activity/list");
	record("activity/list", list);
}

async function testUserActivity() {
	console.log("\n=== USER ACTIVITY ===");
	const list = await orpcGet("userActivity/list");
	record("userActivity/list", list);
}

async function testResumeGallery() {
	console.log("\n=== RESUME GALLERY ===");
	const list = await orpcGet("resumeGallery/list");
	record("resumeGallery/list", list, "(public)");
}

async function testSearch() {
	console.log("\n=== SEARCH ===");
	const results_data = await orpcGet("search/query", { q: "test" });
	record("search/query", results_data);
}

async function testBranding() {
	console.log("\n=== BRANDING ===");
	const get = await orpcGet("branding/get");
	record("branding/get", get);
}

async function testCareerQuiz() {
	console.log("\n=== CAREER QUIZ ===");
	const questions = await orpcGet("careerQuizQuestions/list");
	record("careerQuizQuestions/list", questions);

	const results_data = await orpcGet("careerQuizResults/list");
	record("careerQuizResults/list", results_data);
}

async function testSupportRouter() {
	console.log("\n=== SUPPORT ===");
	const list = await orpcGet("support/list");
	record("support/list", list);
}

async function testInterviewChecklist() {
	console.log("\n=== INTERVIEW CHECKLIST ===");
	const list = await orpcGet("interviewChecklist/list");
	record("interviewChecklist/list", list);
}

async function testDeadlines() {
	console.log("\n=== DEADLINES ===");
	const list = await orpcGet("deadlines/list");
	record("deadlines/list", list);
}

async function testJobAlerts() {
	console.log("\n=== JOB ALERTS ===");
	const list = await orpcGet("jobAlerts/list");
	record("jobAlerts/list", list);
}

async function testShortcuts() {
	console.log("\n=== SHORTCUTS ===");
	const list = await orpcGet("shortcuts/list");
	record("shortcuts/list", list);
}

// Test 2-3 actual AI endpoints (cost real DeepSeek tokens)
async function testAiEndpoints() {
	console.log("\n=== AI ENDPOINTS (limited - 2 calls) ===");

	// Test 1: AI status (no cost, public endpoint)
	const status = await orpcGet("aiConfig/status/check");
	record("ai/status/check", status, "(pre-req for AI tests)");

	if (!status.data?.json?.available) {
		console.log("  [SKIP] AI not configured - skipping AI content endpoints");
		results.push({ endpoint: "ai/improveContent", status: null, result: "SKIP", note: "AI not available" });
		results.push({ endpoint: "ai/fixGrammar", status: null, result: "SKIP", note: "AI not available" });
		return;
	}

	// Test 2: Simple grammar fix (cheapest AI call)
	const grammarFix = await orpcPost("ai/fixGrammar", {
		content: "I has worked at hospital for 2 years.",
	});
	record("ai/fixGrammar", grammarFix, "(AI call 1/2)");

	// Test 3: Improve content
	const improve = await orpcPost("ai/improveContent", {
		content: "Did nursing tasks at clinic.",
		type: "experience",
	});
	record("ai/improveContent", improve, "(AI call 2/2)");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
	console.log("=================================================================");
	console.log("IMTA Resume - Full API Coverage Test (Production)");
	console.log(`URL: ${BASE_URL}`);
	console.log(`Date: ${new Date().toISOString()}`);
	console.log("=================================================================");

	await login();

	// Run all test suites
	await testFlags();
	await testStatistics();
	await testResume();
	await testAiConfig();
	await testAiHistory();
	await testInterview();
	await testInterviewAnalytics();
	await testInterviewChecklist();
	await testCareer();
	await testCareerQuiz();
	await testCareerCoaching();
	await testCareerMatcher();
	await testReferenceData();
	await testGoals();
	await testNotifications();
	await testAnalytics();
	await testAdmin();
	await testPartner();
	await testJobApplications();
	await testJobAlerts();
	await testNetworking();
	await testLearningPath();
	await testAiMentor();
	await testMockAi();
	await testVoiceInterview();
	await testSkillGap();
	await testResources();
	await testDashboard();
	await testAchievements();
	await testStudentProgress();
	await testUserSettings();
	await testResumeGallery();
	await testSearch();
	await testBranding();
	await testSupportRouter();
	await testDeadlines();
	await testShortcuts();
	await testActivity();
	await testUserActivity();
	await testInsights();
	await testJournal();
	await testAiEndpoints();

	// ─── Summary ────────────────────────────────────────────────────────────────
	console.log("\n\n=================================================================");
	console.log("RESULTS SUMMARY");
	console.log("=================================================================");

	const ok = results.filter((r) => r.result === "OK" || r.result === "OK(empty)");
	const broken = results.filter((r) => r.result.startsWith("BROKEN") || r.result === "ERROR");
	const skipped = results.filter((r) => r.result === "SKIP");

	console.log(`Total endpoints tested: ${results.length}`);
	console.log(`  OK:      ${ok.length}`);
	console.log(`  BROKEN:  ${broken.length}`);
	console.log(`  SKIPPED: ${skipped.length}`);

	if (broken.length > 0) {
		console.log("\n--- BROKEN ENDPOINTS ---");
		for (const r of broken) {
			console.log(`  ${r.endpoint} → ${r.status} ${r.result} ${r.note}`);
		}
	}

	// Return structured data for report generation
	return { results, ok, broken, skipped };
}

main()
	.then(({ results, ok, broken, skipped }) => {
		// Output JSON for the report writer
		process.stdout.write("\n\n___JSON_START___\n");
		process.stdout.write(
			JSON.stringify(
				{ results, summary: { total: results.length, ok: ok.length, broken: broken.length, skipped: skipped.length } },
				null,
				2,
			),
		);
		process.stdout.write("\n___JSON_END___\n");
		process.exit(0);
	})
	.catch((err) => {
		console.error("[FATAL]", err);
		process.exit(1);
	});
