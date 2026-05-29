/**
 * Auth Flow Test Script
 * Tests login, session, and role-based access for all test accounts
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";

let passed = 0;
let failed = 0;
const results = [];

function log(status, name, detail = "") {
	const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m";
	const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else failed++;
}

async function login(email, password) {
	const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
		},
		body: JSON.stringify({ email, password }),
		redirect: "manual",
	});
	const cookies = res.headers.getSetCookie?.() || [];
	const sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");
	return { status: res.status, ok: res.ok || res.status === 302, sessionCookie, cookies };
}

async function getSession(cookie) {
	const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
		headers: { Cookie: cookie, Origin: BASE_URL },
	});
	const body = await res.json();
	return { status: res.status, ok: res.ok, body };
}

async function rpc(path, cookie, input = undefined) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: cookie,
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

async function rpcGet(path, cookie, input = undefined) {
	const data = input !== undefined ? { json: input } : { json: undefined };
	const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
	const res = await fetch(url, {
		method: "GET",
		headers: {
			Origin: BASE_URL,
			Cookie: cookie,
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

async function main() {
	console.log("\x1b[1m\x1b[36m╔══════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m\x1b[36m║   Auth Flow & Role-Based Access Tests    ║\x1b[0m");
	console.log("\x1b[1m\x1b[36m╚══════════════════════════════════════════╝\x1b[0m");
	console.log(`Server: ${BASE_URL}\n`);

	const testAccounts = [
		{ email: "admin@test.com", password: "TestAccount123!", expectedRole: "admin" },
		{ email: "student1@test.com", password: "TestAccount123!", expectedRole: "user" },
		{ email: "student2@test.com", password: "TestAccount123!", expectedRole: "user" },
		{ email: "partner@test.com", password: "TestAccount123!", expectedRole: "partner" },
	];

	const sessions = {};

	// ============================================================
	// 1. LOGIN EACH ACCOUNT
	// ============================================================
	console.log("\x1b[1m=== LOGIN TESTS ===\x1b[0m");

	for (const account of testAccounts) {
		try {
			const result = await login(account.email, account.password);
			if (result.ok && result.sessionCookie) {
				log("PASS", `Login ${account.email}`, `status=${result.status}, cookies=${result.cookies.length}`);
				sessions[account.email] = result.sessionCookie;
			} else {
				log("FAIL", `Login ${account.email}`, `status=${result.status}, no session cookie`);
			}
		} catch (e) {
			log("FAIL", `Login ${account.email}`, e.message);
		}
	}

	// ============================================================
	// 2. SESSION VERIFICATION
	// ============================================================
	console.log("\n\x1b[1m=== SESSION VERIFICATION ===\x1b[0m");

	for (const account of testAccounts) {
		const cookie = sessions[account.email];
		if (!cookie) {
			log("FAIL", `Session ${account.email}`, "No cookie from login");
			continue;
		}
		try {
			const session = await getSession(cookie);
			if (session.ok && session.body?.user?.email === account.email) {
				const actualRole = session.body.user.role;
				if (actualRole === account.expectedRole) {
					log("PASS", `Session ${account.email}`, `role=${actualRole} (expected ${account.expectedRole})`);
				} else {
					log("FAIL", `Session ${account.email}`, `role=${actualRole} but expected ${account.expectedRole}`);
				}
			} else {
				log("FAIL", `Session ${account.email}`, `status=${session.status}, user=${session.body?.user?.email || "null"}`);
			}
		} catch (e) {
			log("FAIL", `Session ${account.email}`, e.message);
		}
	}

	// ============================================================
	// 3. ROLE-BASED ACCESS CONTROL
	// ============================================================
	console.log("\n\x1b[1m=== ROLE-BASED ACCESS CONTROL ===\x1b[0m");

	// Admin endpoints should ONLY work for admin
	const adminEndpoints = [
		["admin/analytics/getOverview", "Admin analytics"],
		["admin/system/getHealth", "Admin system health"],
		["aiConfig/providers/list", "AI providers list"],
		["aiConfig/usage/getGlobalStats", "AI global stats"],
	];

	const adminGetEndpoints = [
		["admin/users/list", "Admin user list", { page: 1, limit: 5 }],
	];

	// Test admin access with admin account
	console.log("\n  Admin endpoints with admin account:");
	const adminCookie = sessions["admin@test.com"];
	if (adminCookie) {
		for (const [path, label] of adminEndpoints) {
			try {
				const r = await rpc(path, adminCookie);
				if (r.ok) {
					log("PASS", `${label} (admin)`, `status=${r.status}`);
				} else {
					log("FAIL", `${label} (admin)`, `status=${r.status} — ${(r.json?.message || r.text || "").slice(0, 100)}`);
				}
			} catch (e) {
				log("FAIL", `${label} (admin)`, e.message);
			}
		}
		for (const [path, label, input] of adminGetEndpoints) {
			try {
				const r = await rpcGet(path, adminCookie, input);
				if (r.ok) {
					log("PASS", `${label} (admin)`, `status=${r.status}`);
				} else {
					const r2 = await rpc(path, adminCookie, input);
					if (r2.ok) {
						log("PASS", `${label} (admin, POST)`, `status=${r2.status}`);
					} else {
						log("FAIL", `${label} (admin)`, `status=${r.status}`);
					}
				}
			} catch (e) {
				log("FAIL", `${label} (admin)`, e.message);
			}
		}
	}

	// Test admin access with student account (should be REJECTED)
	console.log("\n  Admin endpoints with student account (should be rejected):");
	const studentCookie = sessions["student1@test.com"];
	if (studentCookie) {
		for (const [path, label] of adminEndpoints) {
			try {
				const r = await rpc(path, studentCookie);
				if (r.ok) {
					log("FAIL", `${label} (student)`, `SECURITY ISSUE: student got access! status=${r.status}`);
				} else if (r.status === 401 || r.status === 403) {
					log("PASS", `${label} (student) rejected`, `status=${r.status}`);
				} else {
					log("WARN", `${label} (student)`, `status=${r.status} — unexpected`);
				}
			} catch (e) {
				log("FAIL", `${label} (student)`, e.message);
			}
		}
	}

	// Test admin access with NO auth (should be REJECTED)
	console.log("\n  Admin endpoints with no auth (should be rejected):");
	for (const [path, label] of adminEndpoints) {
		try {
			const r = await rpc(path, "");
			if (r.ok) {
				log("FAIL", `${label} (no auth)`, `SECURITY ISSUE: unauthenticated access! status=${r.status}`);
			} else if (r.status === 401 || r.status === 403) {
				log("PASS", `${label} (no auth) rejected`, `status=${r.status}`);
			} else {
				log("PASS", `${label} (no auth) rejected`, `status=${r.status}`);
			}
		} catch (e) {
			log("FAIL", `${label} (no auth)`, e.message);
		}
	}

	// ============================================================
	// 4. PROTECTED ENDPOINTS WITH EACH ROLE
	// ============================================================
	console.log("\n\x1b[1m=== PROTECTED ENDPOINTS PER ROLE ===\x1b[0m");

	const protectedEndpoints = [
		["resume/list", "Resume list"],
		["dashboard/getStatistics", "Dashboard stats"],
		["notification/list", "Notifications"],
		["aiConfig/status/check", "AI status (public)"],
	];

	for (const account of testAccounts) {
		const cookie = sessions[account.email];
		if (!cookie) continue;
		console.log(`\n  ${account.email} (${account.expectedRole}):`);
		for (const [path, label] of protectedEndpoints) {
			try {
				const r = await rpc(path, cookie);
				if (r.ok) {
					log("PASS", `${label} (${account.expectedRole})`, `status=${r.status}`);
				} else {
					log("FAIL", `${label} (${account.expectedRole})`, `status=${r.status} — ${(r.json?.message || "").slice(0, 80)}`);
				}
			} catch (e) {
				log("FAIL", `${label} (${account.expectedRole})`, e.message);
			}
		}
	}

	// ============================================================
	// 5. UNAUTHENTICATED ACCESS TO PROTECTED ENDPOINTS
	// ============================================================
	console.log("\n\x1b[1m=== UNAUTHENTICATED ACCESS (should fail) ===\x1b[0m");

	const protectedOnlyEndpoints = [
		["resume/list", "Resume list"],
		["dashboard/getStatistics", "Dashboard stats"],
		["notification/list", "Notifications"],
	];

	for (const [path, label] of protectedOnlyEndpoints) {
		try {
			const r = await rpc(path, "");
			if (r.ok) {
				log("FAIL", `${label} (no auth)`, `SECURITY ISSUE: unauthenticated access!`);
			} else {
				log("PASS", `${label} (no auth) rejected`, `status=${r.status}`);
			}
		} catch (e) {
			log("FAIL", `${label} (no auth)`, e.message);
		}
	}

	// ============================================================
	// 6. PUBLIC ENDPOINTS (should work without auth)
	// ============================================================
	console.log("\n\x1b[1m=== PUBLIC ENDPOINTS (should work without auth) ===\x1b[0m");

	const publicEndpoints = [
		["aiConfig/status/check", "AI status check"],
		["flags/get", "Feature flags"],
	];

	for (const [path, label] of publicEndpoints) {
		try {
			const r = await rpc(path, "");
			if (r.ok) {
				log("PASS", `${label} (no auth)`, `status=${r.status}`);
			} else {
				log("FAIL", `${label} (no auth)`, `status=${r.status} — public endpoint should work`);
			}
		} catch (e) {
			log("FAIL", `${label} (no auth)`, e.message);
		}
	}

	// ============================================================
	// SUMMARY
	// ============================================================
	console.log("\n\x1b[1m══════════════════════════════════════════\x1b[0m");
	console.log(`\x1b[1mResults:\x1b[0m \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`);
	console.log(`Total: ${passed + failed} tests\n`);

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
