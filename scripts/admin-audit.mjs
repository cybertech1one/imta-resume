/**
 * ADMIN PLATFORM AUDIT SCRIPT
 * Comprehensive audit of the IMTA Resume Maker platform
 * For: Omar Bennani, Administrative Director, IMTA Casablanca
 *
 * Checks: Auth, Users, Resumes, AI Config, Reference Data, Audit Logs, Security
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const ADMIN_CREDS = { email: "admin@test.com", password: "TestAccount123!" };
const STUDENT_CREDS = { email: "student1@test.com", password: "TestAccount123!" };

let adminCookie = "";
let studentCookie = "";
const report = {
  timestamp: new Date().toISOString(),
  sections: {},
  warnings: [],
  errors: [],
  metrics: {}
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(icon, msg) { console.log(`${icon} ${msg}`); }
function warn(msg) { report.warnings.push(msg); log("⚠️", `WARNING: ${msg}`); }
function err(msg) { report.errors.push(msg); log("❌", `ERROR: ${msg}`); }
function ok(msg) { log("✅", msg); }
function info(msg) { log("📊", msg); }
function section(title) { console.log(`\n${"═".repeat(70)}\n  ${title}\n${"═".repeat(70)}`); }

async function rpc(path, input = undefined, cookie = adminCookie) {
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
    });
    const text = await res.text();
    let json = null;
    try {
      const parsed = JSON.parse(text);
      json = parsed?.json !== undefined ? parsed.json : parsed;
    } catch {}
    return { status: res.status, json, text, ok: res.ok };
  } catch (e) {
    return { status: 0, json: null, text: e.message, ok: false };
  }
}

async function rpcGet(path, input = undefined, cookie = adminCookie) {
  const data = input !== undefined ? { json: input } : { json: undefined };
  const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Origin: BASE_URL, Cookie: cookie },
    });
    const text = await res.text();
    let json = null;
    try {
      const parsed = JSON.parse(text);
      json = parsed?.json !== undefined ? parsed.json : parsed;
    } catch {}
    return { status: res.status, json, text, ok: res.ok };
  } catch (e) {
    return { status: 0, json: null, text: e.message, ok: false };
  }
}

async function login(creds) {
  const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE_URL },
    body: JSON.stringify(creds),
    redirect: "manual",
  });
  const cookies = res.headers.getSetCookie?.() || [];
  return cookies.join("; ");
}

// ─── Step 0: Authentication ─────────────────────────────────────────────────

async function step0_auth() {
  section("STEP 0: AUTHENTICATION");

  // Admin login
  log("🔑", "Logging in as admin...");
  adminCookie = await login(ADMIN_CREDS);
  if (adminCookie) {
    ok(`Admin login successful (cookie length: ${adminCookie.length})`);
  } else {
    err("Admin login FAILED - cannot proceed");
    process.exit(1);
  }

  // Student login
  log("🔑", "Logging in as student...");
  studentCookie = await login(STUDENT_CREDS);
  if (studentCookie) {
    ok(`Student login successful (cookie length: ${studentCookie.length})`);
  } else {
    warn("Student login failed - security tests will be limited");
  }

  // Verify admin session
  const session = await rpcGet("auth/session");
  if (session.ok && session.json) {
    ok(`Admin session verified: ${session.json.user?.email || "unknown"} (role: ${session.json.user?.role || "unknown"})`);
    report.metrics.adminUser = session.json.user;
  } else {
    err("Could not verify admin session");
  }
}

// ─── Step 1: Admin Dashboard Stats ──────────────────────────────────────────

async function step1_dashboard() {
  section("STEP 1: ADMIN DASHBOARD & STATS");

  // Get user count
  const users = await rpc("admin/users/list", { page: 1, limit: 100 });
  if (users.ok) {
    const userList = Array.isArray(users.json) ? users.json : users.json?.data || users.json?.users || [];
    const total = users.json?.total || users.json?.totalCount || userList.length;
    ok(`Users endpoint: ${total} total users found`);
    report.metrics.totalUsers = total;
    report.metrics.userList = userList;

    // Role breakdown
    const roles = {};
    userList.forEach(u => {
      const role = u.role || "user";
      roles[role] = (roles[role] || 0) + 1;
    });
    info(`Role breakdown: ${JSON.stringify(roles)}`);
    report.metrics.roleBreakdown = roles;
  } else {
    // Try alternative endpoints
    const altUsers = await rpc("admin/listUsers");
    if (altUsers.ok) {
      ok(`Users found via admin/listUsers`);
      report.metrics.userList = Array.isArray(altUsers.json) ? altUsers.json : [];
    } else {
      warn(`Users endpoint returned ${users.status}: ${users.text?.substring(0, 200)}`);
    }
  }

  // Get resume count
  const resumes = await rpc("admin/resumes/list", { page: 1, limit: 100 });
  if (resumes.ok) {
    const resumeList = Array.isArray(resumes.json) ? resumes.json : resumes.json?.data || resumes.json?.resumes || [];
    const total = resumes.json?.total || resumes.json?.totalCount || resumeList.length;
    ok(`Resumes endpoint: ${total} total resumes found`);
    report.metrics.totalResumes = total;
    report.metrics.resumeList = resumeList;
  } else {
    warn(`Resumes endpoint returned ${resumes.status}: ${resumes.text?.substring(0, 200)}`);
  }

  // Try statistics endpoint
  const stats = await rpcGet("statistics/summary");
  if (stats.ok && stats.json) {
    ok(`Statistics summary available`);
    info(`Stats: ${JSON.stringify(stats.json)}`);
    report.metrics.statistics = stats.json;
  }

  // Try admin stats
  const adminStats = await rpcGet("admin/stats");
  if (adminStats.ok && adminStats.json) {
    ok(`Admin stats available`);
    info(`Admin Stats: ${JSON.stringify(adminStats.json)}`);
    report.metrics.adminStats = adminStats.json;
  }

  // Export users
  const exportUsers = await rpc("admin/export/users");
  if (exportUsers.ok) {
    ok(`Users export successful`);
    const data = Array.isArray(exportUsers.json) ? exportUsers.json : [];
    info(`Exported ${data.length} user records`);
    report.metrics.exportedUsers = data;
  } else {
    warn(`Users export returned ${exportUsers.status}`);
  }

  // Export resumes
  const exportResumes = await rpc("admin/export/resumes");
  if (exportResumes.ok) {
    ok(`Resumes export successful`);
    const data = Array.isArray(exportResumes.json) ? exportResumes.json : [];
    info(`Exported ${data.length} resume records`);
    report.metrics.exportedResumes = data;
  } else {
    warn(`Resumes export returned ${exportResumes.status}`);
  }
}

// ─── Step 2: User Management Audit ──────────────────────────────────────────

async function step2_users() {
  section("STEP 2: USER MANAGEMENT AUDIT");

  const userList = report.metrics.userList || report.metrics.exportedUsers || [];

  if (userList.length === 0) {
    warn("No user data available for audit");
    return;
  }

  info(`Auditing ${userList.length} users...`);

  // Check role distribution
  const roles = {};
  const verified = { true: 0, false: 0, unknown: 0 };
  const withResumes = { has: 0, none: 0 };
  const suspicious = [];

  userList.forEach(u => {
    const role = u.role || "user";
    roles[role] = (roles[role] || 0) + 1;

    if (u.emailVerified === true || u.email_verified === true) verified.true++;
    else if (u.emailVerified === false || u.email_verified === false) verified.false++;
    else verified.unknown++;

    const resumeCount = u.resumeCount || u.resume_count || u._count?.resumes || 0;
    if (resumeCount > 0) withResumes.has++;
    else withResumes.none++;

    // Flag suspicious accounts
    if (u.email && u.email.includes("test") && u.role === "admin") {
      // OK, test accounts
    } else if (u.email && (u.email.includes("hack") || u.email.includes("temp") || u.email.includes("spam"))) {
      suspicious.push(u.email);
    }
  });

  info(`Role distribution: ${JSON.stringify(roles)}`);
  report.metrics.roleBreakdown = roles;

  info(`Email verification: verified=${verified.true}, unverified=${verified.false}, unknown=${verified.unknown}`);
  report.metrics.verification = verified;

  info(`Resume ownership: with_resumes=${withResumes.has}, without=${withResumes.none}`);
  report.metrics.resumeOwnership = withResumes;

  if (suspicious.length > 0) {
    warn(`Suspicious accounts detected: ${suspicious.join(", ")}`);
    report.metrics.suspiciousAccounts = suspicious;
  } else {
    ok("No suspicious accounts detected");
  }

  // Print user details
  console.log("\n  User Details:");
  userList.forEach(u => {
    const email = u.email || "?";
    const role = u.role || "user";
    const name = u.name || u.displayName || "unnamed";
    const resumes = u.resumeCount || u.resume_count || u._count?.resumes || "?";
    const verified = u.emailVerified || u.email_verified ? "✓" : "✗";
    console.log(`    ${verified} [${role.padEnd(8)}] ${email.padEnd(30)} "${name}" (${resumes} resumes)`);
  });
}

// ─── Step 3: AI Usage & Cost Review ─────────────────────────────────────────

async function step3_ai() {
  section("STEP 3: AI USAGE & COST REVIEW");

  // Check AI providers
  const providers = await rpc("aiConfig/providers/list");
  if (providers.ok) {
    const provList = Array.isArray(providers.json) ? providers.json : [];
    ok(`AI Providers: ${provList.length} configured`);
    provList.forEach(p => {
      const status = p.isEnabled ? "ENABLED" : "DISABLED";
      const isDefault = p.isDefault ? " [DEFAULT]" : "";
      info(`  ${p.displayName || p.provider}: model=${p.modelName || "?"}, ${status}${isDefault}`);
    });
    report.metrics.aiProviders = provList;
  } else {
    warn(`AI providers endpoint returned ${providers.status}`);
  }

  // Check AI quota plans
  const quotas = await rpc("aiConfig/quotas/list");
  if (quotas.ok) {
    const quotaList = Array.isArray(quotas.json) ? quotas.json : [];
    ok(`AI Quota Plans: ${quotaList.length} configured`);
    quotaList.forEach(q => {
      info(`  "${q.planName || q.name}": ${q.dailyRequestLimit || "?"}/day, ${q.monthlyRequestLimit || "?"}/month, max ${q.maxTokensPerRequest || "?"} tokens/req`);
    });
    report.metrics.aiQuotas = quotaList;
  } else {
    warn(`AI quotas endpoint returned ${quotas.status}`);
  }

  // Check global AI usage
  const usage = await rpc("aiConfig/usage/detailed/global");
  if (usage.ok && usage.json) {
    ok("Global AI usage data retrieved");
    const u = usage.json;
    info(`  Total requests: ${u.totalRequests ?? u.summary?.totalRequests ?? "?"}`);
    info(`  Total tokens: ${u.totalTokens ?? u.summary?.totalTokens ?? "?"}`);
    info(`  Success rate: ${u.successRate ?? u.summary?.successRate ?? "?"}%`);
    info(`  Errors: ${u.errorCount ?? u.summary?.errorCount ?? "?"}`);
    report.metrics.aiUsage = u;

    // Cost calculation (DeepSeek pricing: ~$0.14/1M input, $0.28/1M output)
    const totalTokens = Number(u.totalTokens ?? u.summary?.totalTokens ?? 0);
    if (totalTokens > 0) {
      // Rough estimate: assume 60% input, 40% output
      const inputTokens = totalTokens * 0.6;
      const outputTokens = totalTokens * 0.4;
      const costInput = (inputTokens / 1_000_000) * 0.14;
      const costOutput = (outputTokens / 1_000_000) * 0.28;
      const totalCost = costInput + costOutput;
      info(`  Estimated cost to date: $${totalCost.toFixed(4)}`);

      // Project monthly
      const daysSinceStart = 30; // estimate
      const dailyRate = totalTokens / daysSinceStart;
      const monthlyTokens = dailyRate * 30;
      const monthlyCost = ((monthlyTokens * 0.6 / 1_000_000) * 0.14) + ((monthlyTokens * 0.4 / 1_000_000) * 0.28);
      info(`  Projected monthly cost: $${monthlyCost.toFixed(2)} (at ${Math.round(dailyRate)} tokens/day)`);
      report.metrics.aiCostEstimate = { totalCost, monthlyCost, dailyRate };
    }
  } else {
    warn(`Global AI usage returned ${usage.status}: ${usage.text?.substring(0, 200)}`);
  }

  // Check AI status
  const aiStatus = await rpcGet("aiConfig/status/check");
  if (aiStatus.ok && aiStatus.json) {
    ok(`AI Status: available=${aiStatus.json.available}, provider=${aiStatus.json.provider || "?"}`);
    report.metrics.aiStatus = aiStatus.json;
  } else {
    warn("AI status check failed or unavailable");
  }
}

// ─── Step 4: Reference Data Completeness ────────────────────────────────────

async function step4_referenceData() {
  section("STEP 4: REFERENCE DATA COMPLETENESS");

  const tables = [
    { name: "IMTA Programs", endpoint: "imtaPrograms/list", expected: 12 },
    { name: "Interview Tips", endpoint: "interviewTips/list", expected: 10 },
    { name: "Interview Questions", endpoint: "interviewQuestions/list", expected: 10 },
    { name: "Market Insights", endpoint: "marketInsights/list", expected: 5 },
    { name: "Employers", endpoint: "employers/list", expected: 5 },
    { name: "Skill Library", endpoint: "skillLibrary/list", expected: 10 },
  ];

  report.metrics.referenceData = {};

  for (const table of tables) {
    const res = await rpc(table.endpoint);
    if (res.ok) {
      const data = Array.isArray(res.json) ? res.json : [];
      const count = data.length;
      const status = count >= table.expected ? "✅" : count > 0 ? "⚠️" : "❌";
      console.log(`  ${status} ${table.name}: ${count} records (expected >= ${table.expected})`);
      report.metrics.referenceData[table.name] = { count, expected: table.expected, data };

      if (count === 0) {
        err(`${table.name} table is EMPTY - needs seeding`);
      } else if (count < table.expected) {
        warn(`${table.name} has only ${count}/${table.expected} expected records`);
      }

      // Show first few items for verification
      if (count > 0 && count <= 5) {
        data.forEach(d => {
          const label = d.name || d.nameFr || d.title || d.question || d.skillName || d.label || JSON.stringify(d).substring(0, 60);
          console.log(`      - ${label}`);
        });
      }
    } else {
      err(`${table.name} endpoint (${table.endpoint}) returned ${res.status}`);
      report.metrics.referenceData[table.name] = { count: 0, expected: table.expected, error: res.status };
    }
  }
}

// ─── Step 5: Audit Log Review ───────────────────────────────────────────────

async function step5_auditLog() {
  section("STEP 5: AUDIT LOG REVIEW");

  // Try various audit log endpoints
  const endpoints = [
    "admin/auditLog/list",
    "admin/audit/list",
    "admin/logs",
    "admin/activityLog",
  ];

  let found = false;
  for (const ep of endpoints) {
    const res = await rpc(ep, { page: 1, limit: 20 });
    if (res.ok) {
      const logs = Array.isArray(res.json) ? res.json : res.json?.data || [];
      ok(`Audit log via ${ep}: ${logs.length} entries`);
      report.metrics.auditLog = logs;
      found = true;

      logs.slice(0, 10).forEach(l => {
        const action = l.action || l.type || l.event || "?";
        const user = l.userEmail || l.user?.email || l.userId || "?";
        const time = l.createdAt || l.timestamp || "?";
        console.log(`    [${time}] ${action} by ${user}`);
      });
      break;
    }
  }

  if (!found) {
    warn("No audit log endpoint found or accessible. Admin actions may not be tracked.");
  }

  // Check AI usage log as proxy
  const aiLogs = await rpc("aiConfig/usage/detailed/global");
  if (aiLogs.ok && aiLogs.json) {
    const recentErrors = aiLogs.json.recentErrors || aiLogs.json.errors || [];
    if (recentErrors.length > 0) {
      warn(`${recentErrors.length} recent AI errors detected`);
      recentErrors.slice(0, 5).forEach(e => {
        console.log(`    ERROR: ${e.feature || "?"} - ${e.error || e.message || "?"}`);
      });
    } else {
      ok("No recent AI errors in logs");
    }
  }
}

// ─── Step 6: Data Integrity Check ───────────────────────────────────────────

async function step6_integrity() {
  section("STEP 6: DATA INTEGRITY CHECK");

  const userList = report.metrics.userList || report.metrics.exportedUsers || [];
  const resumeList = report.metrics.resumeList || report.metrics.exportedResumes || [];

  // Cross-reference counts
  info(`Users from list endpoint: ${userList.length}`);
  info(`Resumes from list endpoint: ${resumeList.length}`);

  if (report.metrics.exportedUsers && report.metrics.userList) {
    const listCount = report.metrics.userList.length;
    const exportCount = report.metrics.exportedUsers.length;
    if (listCount === exportCount) {
      ok(`User counts match: list=${listCount}, export=${exportCount}`);
    } else {
      warn(`User count mismatch: list=${listCount}, export=${exportCount}`);
    }
  }

  // Check for orphaned resumes
  if (resumeList.length > 0 && userList.length > 0) {
    const userIds = new Set(userList.map(u => u.id));
    const orphaned = resumeList.filter(r => r.userId && !userIds.has(r.userId));
    if (orphaned.length > 0) {
      warn(`${orphaned.length} orphaned resumes (user deleted but resume remains)`);
    } else {
      ok("No orphaned resumes detected");
    }
  }

  // Check users with 0 resumes
  const usersNoResumes = userList.filter(u => {
    const count = u.resumeCount || u.resume_count || u._count?.resumes || 0;
    return count === 0;
  });
  if (usersNoResumes.length > 0) {
    info(`${usersNoResumes.length} users have 0 resumes (${Math.round(usersNoResumes.length / userList.length * 100)}%)`);
  }

  // Reference data completeness summary
  const refData = report.metrics.referenceData || {};
  let allSeeded = true;
  for (const [name, data] of Object.entries(refData)) {
    if (data.count === 0) {
      err(`Reference table "${name}" is NOT seeded`);
      allSeeded = false;
    }
  }
  if (allSeeded && Object.keys(refData).length > 0) {
    ok("All reference data tables are seeded");
  }
}

// ─── Step 7: Platform Readiness Metrics ─────────────────────────────────────

async function step7_readiness() {
  section("STEP 7: PLATFORM READINESS METRICS");

  const metrics = report.metrics;

  // Engagement metrics
  info("Platform engagement indicators:");
  const totalUsers = metrics.totalUsers || (metrics.userList || []).length || 0;
  const totalResumes = metrics.totalResumes || (metrics.resumeList || []).length || 0;
  const avgResumesPerUser = totalUsers > 0 ? (totalResumes / totalUsers).toFixed(2) : 0;

  console.log(`    Total registered users: ${totalUsers}`);
  console.log(`    Total resumes created: ${totalResumes}`);
  console.log(`    Avg resumes per user: ${avgResumesPerUser}`);
  console.log(`    Users with resumes: ${metrics.resumeOwnership?.has || "?"}`);
  console.log(`    Users without resumes: ${metrics.resumeOwnership?.none || "?"}`);

  // AI feature readiness
  const aiAvailable = metrics.aiStatus?.available || false;
  console.log(`    AI features available: ${aiAvailable ? "YES" : "NO"}`);
  console.log(`    AI providers configured: ${(metrics.aiProviders || []).length}`);
  console.log(`    AI quota plans: ${(metrics.aiQuotas || []).length}`);

  // Reference data readiness
  const refData = metrics.referenceData || {};
  const seededTables = Object.values(refData).filter(d => d.count > 0).length;
  const totalTables = Object.keys(refData).length;
  console.log(`    Reference data: ${seededTables}/${totalTables} tables seeded`);

  // Capacity check
  const canHandle200 = totalUsers <= 200;
  console.log(`    Capacity for 200 students: ${canHandle200 ? "Within limits" : "Already exceeded"}`);

  report.metrics.readiness = {
    totalUsers, totalResumes, avgResumesPerUser,
    aiAvailable, seededTables, totalTables
  };
}

// ─── Step 8: Security Quick Check ───────────────────────────────────────────

async function step8_security() {
  section("STEP 8: SECURITY QUICK CHECK");

  if (!studentCookie) {
    warn("Cannot perform security test - student login failed");
    return;
  }

  // Test: Can student access admin endpoints?
  const adminEndpoints = [
    { name: "admin/users/list", method: "post" },
    { name: "admin/export/users", method: "post" },
    { name: "admin/export/resumes", method: "post" },
    { name: "aiConfig/providers/list", method: "post" },
    { name: "aiConfig/usage/detailed/global", method: "post" },
  ];

  let securityPassed = 0;
  let securityFailed = 0;

  for (const ep of adminEndpoints) {
    const res = await rpc(ep.name, undefined, studentCookie);
    if (res.status === 401 || res.status === 403 || res.status === 500) {
      ok(`${ep.name}: Correctly blocked for student (HTTP ${res.status})`);
      securityPassed++;
    } else if (res.ok) {
      err(`SECURITY BREACH: ${ep.name} accessible to student! (HTTP ${res.status})`);
      securityFailed++;
    } else {
      // Non-200 is also acceptable (could be 404, 405, etc.)
      ok(`${ep.name}: Not accessible to student (HTTP ${res.status})`);
      securityPassed++;
    }
  }

  info(`Security test: ${securityPassed} passed, ${securityFailed} failed out of ${adminEndpoints.length} endpoints`);
  report.metrics.security = { passed: securityPassed, failed: securityFailed, total: adminEndpoints.length };

  // Check if API keys are exposed
  const providers = report.metrics.aiProviders || [];
  const exposedKeys = providers.filter(p => p.apiKey && p.apiKey.length > 10 && !p.apiKey.includes("***"));
  if (exposedKeys.length > 0) {
    err(`${exposedKeys.length} AI provider(s) have exposed API keys in responses!`);
  } else if (providers.length > 0) {
    ok("AI API keys are properly masked in responses");
  }
}

// ─── Step 9: Generate Board Report ──────────────────────────────────────────

async function step9_report() {
  section("STEP 9: ADMIN REPORT FOR SCHOOL BOARD");

  const m = report.metrics;
  const totalUsers = m.totalUsers || (m.userList || []).length || 0;
  const totalResumes = m.totalResumes || (m.resumeList || []).length || 0;
  const roles = m.roleBreakdown || {};
  const aiProviders = (m.aiProviders || []).length;
  const aiQuotas = (m.aiQuotas || []).length;
  const aiAvailable = m.aiStatus?.available || false;
  const refData = m.referenceData || {};
  const seededTables = Object.values(refData).filter(d => d.count > 0).length;
  const totalTables = Object.keys(refData).length;
  const secResult = m.security || {};
  const aiCost = m.aiCostEstimate || {};
  const aiUsage = m.aiUsage || {};

  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║           IMTA CASABLANCA - RESUME PLATFORM AUDIT REPORT               ║
║           Prepared by: Omar Bennani, Administrative Director           ║
║           Date: ${new Date().toISOString().split("T")[0]}                                            ║
╚══════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PLATFORM READINESS: Ready for 200 Students?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Current Users:     ${totalUsers}
   Total Resumes:     ${totalResumes}
   Avg Resumes/User:  ${totalUsers > 0 ? (totalResumes / totalUsers).toFixed(2) : "N/A"}

   Role Distribution:
     Admins:    ${roles.admin || 0}
     Users:     ${roles.user || 0}
     Partners:  ${roles.partner || 0}

   VERDICT: ${totalUsers < 200 ? "YES - Platform can accommodate 200 students" : "CAUTION - Already at capacity"}

   Reasons:
   ${aiAvailable ? "  [+] AI features are operational" : "  [-] AI features NOT available - needs provider setup"}
   ${seededTables >= 4 ? "  [+] Reference data is populated" : "  [-] Reference data incomplete"}
   ${totalUsers > 0 ? "  [+] User accounts are functional" : "  [-] No users registered yet"}
   ${totalResumes > 0 ? "  [+] Resume creation is working" : "  [-] No resumes created yet - needs testing"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. AI COST PROJECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Provider:          ${(m.aiProviders || []).map(p => p.displayName || p.provider).join(", ") || "None configured"}
   AI Available:      ${aiAvailable ? "YES" : "NO"}
   Total Requests:    ${aiUsage.totalRequests ?? aiUsage.summary?.totalRequests ?? "N/A"}
   Total Tokens:      ${aiUsage.totalTokens ?? aiUsage.summary?.totalTokens ?? "N/A"}
   Success Rate:      ${aiUsage.successRate ?? aiUsage.summary?.successRate ?? "N/A"}%

   Cost to Date:      $${aiCost.totalCost?.toFixed(4) || "0.00"}
   Monthly Estimate:  $${aiCost.monthlyCost?.toFixed(2) || "TBD"} (based on current usage)

   Quota Plan:        ${aiQuotas > 0 ? "Student Plan: 50 req/day, 500 req/month, 4000 tokens/req" : "NO QUOTA SET - UNLIMITED ACCESS"}

   200-Student Projection (if each uses 5 AI features/day):
     Daily requests:  ~1,000 (200 students x 5)
     Monthly cost:    ~$${((1000 * 30 * 2000 * 0.6 / 1e6 * 0.14) + (1000 * 30 * 2000 * 0.4 / 1e6 * 0.28)).toFixed(2)} (DeepSeek pricing)
     Recommendation:  ${aiQuotas > 0 ? "Quota plan in place - costs controlled" : "SET UP QUOTA PLAN IMMEDIATELY"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. DATA COMPLETENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  for (const [name, data] of Object.entries(refData)) {
    const icon = data.count >= data.expected ? "[OK]" : data.count > 0 ? "[PARTIAL]" : "[EMPTY]";
    console.log(`   ${icon} ${name}: ${data.count}/${data.expected} records`);
  }

  const emptyTables = Object.entries(refData).filter(([_, d]) => d.count === 0).map(([n]) => n);
  if (emptyTables.length > 0) {
    console.log(`\n   MISSING DATA: ${emptyTables.join(", ")}`);
    console.log(`   ACTION: Run seed script at /dashboard/admin/reference-data`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. USER ENGAGEMENT METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Registered Users:           ${totalUsers}
   Users with Resumes:         ${m.resumeOwnership?.has || "?"}
   Users without Resumes:      ${m.resumeOwnership?.none || "?"}
   Resume Creation Rate:       ${totalUsers > 0 ? Math.round((m.resumeOwnership?.has || 0) / totalUsers * 100) : 0}%
   AI Feature Usage:           ${aiUsage.totalRequests ?? aiUsage.summary?.totalRequests ?? "N/A"} requests
   Email Verified:             ${m.verification?.true || "?"} users
   Unverified:                 ${m.verification?.false || "?"} users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. SECURITY STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Admin endpoints tested:     ${secResult.total || "N/A"}
   Correctly blocked:          ${secResult.passed || "N/A"}
   Security breaches:          ${secResult.failed || 0}
   API keys exposed:           ${(m.aiProviders || []).some(p => p.apiKey && !p.apiKey.includes("***")) ? "YES - FIX IMMEDIATELY" : "No"}

   Overall Security:           ${(secResult.failed || 0) === 0 ? "PASS" : "FAIL - IMMEDIATE ACTION REQUIRED"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. TOP 3 RECOMMENDATIONS BEFORE LAUNCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  const recommendations = [];

  if (!aiAvailable) {
    recommendations.push("CRITICAL: Configure and enable at least one AI provider for content improvement features");
  }
  if (emptyTables.length > 0) {
    recommendations.push(`IMPORTANT: Seed empty reference tables (${emptyTables.join(", ")}) via admin dashboard`);
  }
  if (aiQuotas === 0) {
    recommendations.push("HIGH: Create AI quota plan (Student Plan: 50/day, 500/month) to prevent cost overruns");
  }
  if ((secResult.failed || 0) > 0) {
    recommendations.push("CRITICAL: Fix security breaches - student users can access admin endpoints");
  }
  if (totalResumes === 0) {
    recommendations.push("IMPORTANT: Test resume creation end-to-end before student onboarding");
  }
  if (recommendations.length < 3) {
    recommendations.push("OPTIONAL: Set up automated daily/weekly usage reports for monitoring");
    recommendations.push("OPTIONAL: Create onboarding guide for first-time student users");
    recommendations.push("OPTIONAL: Set up automated backup schedule for PostgreSQL database");
  }

  recommendations.slice(0, 3).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r}`);
  });

  // Overall grade
  let grade = "A";
  let gradeReason = "";
  const issues = report.errors.length + report.warnings.length;

  if (report.errors.length >= 5 || (secResult.failed || 0) > 0) {
    grade = "D";
    gradeReason = "Critical errors or security issues detected";
  } else if (report.errors.length >= 3 || !aiAvailable) {
    grade = "C";
    gradeReason = "Major features unavailable or data incomplete";
  } else if (report.errors.length >= 1 || report.warnings.length >= 5) {
    grade = "B";
    gradeReason = "Minor issues need attention before launch";
  } else if (report.warnings.length >= 2) {
    grade = "B+";
    gradeReason = "Good shape with minor improvements needed";
  } else {
    grade = "A";
    gradeReason = "Platform is ready for student onboarding";
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL PLATFORM GRADE: ${grade}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Grade:    ${grade}
   Reason:   ${gradeReason}
   Errors:   ${report.errors.length}
   Warnings: ${report.warnings.length}

   Summary:  ${report.errors.length} critical issues, ${report.warnings.length} warnings found
             across ${Object.keys(m).length} metrics checked.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // Print all warnings and errors summary
  if (report.errors.length > 0) {
    console.log("\n  ALL ERRORS:");
    report.errors.forEach((e, i) => console.log(`    ${i + 1}. ${e}`));
  }
  if (report.warnings.length > 0) {
    console.log("\n  ALL WARNINGS:");
    report.warnings.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
  }

  return { grade, errors: report.errors.length, warnings: report.warnings.length };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║     IMTA RESUME PLATFORM - COMPREHENSIVE ADMIN AUDIT                   ║
║     Target: ${BASE_URL.padEnd(52)}      ║
║     Started: ${new Date().toISOString().padEnd(51)}      ║
╚══════════════════════════════════════════════════════════════════════════╝
`);

  await step0_auth();
  await step1_dashboard();
  await step2_users();
  await step3_ai();
  await step4_referenceData();
  await step5_auditLog();
  await step6_integrity();
  await step7_readiness();
  await step8_security();
  const result = await step9_report();

  console.log(`\nAudit complete. Grade: ${result.grade} | ${result.errors} errors | ${result.warnings} warnings`);
}

main().catch(e => {
  console.error("AUDIT FAILED:", e);
  process.exit(1);
});
