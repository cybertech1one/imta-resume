// Comprehensive test of all analytics & admin pages + API endpoints
// Uses correct ORPC URL paths from route definitions
import http from "node:http";
import { Client } from "pg";

const BASE = "http://localhost:3040";
const HOST = "localhost";
const PORT = 3040;

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const opts = {
      hostname: HOST,
      port: PORT,
      path: url.pathname + url.search,
      method,
      headers: {
        "Origin": BASE,
        "Referer": `${BASE}/`,
        "User-Agent": "TestRunner/1.0",
        ...headers,
      },
    };
    if (body) {
      const data = typeof body === "string" ? body : JSON.stringify(body);
      opts.headers["Content-Type"] = "application/json";
      opts.headers["Content-Length"] = Buffer.byteLength(data);
    }

    const req = http.request(opts, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        const cookies = res.headers["set-cookie"] || [];
        resolve({ status: res.statusCode, body: raw, cookies, headers: res.headers });
      });
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("timeout")); });
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function login() {
  console.log("=== STEP 1: AUTHENTICATION ===");
  const res = await request("POST", "/api/auth/sign-in/email", {
    email: "admin@test.com",
    password: "TestAccount123!",
  });
  const allCookies = res.cookies.map(c => c.split(";")[0]).join("; ");
  let loginData;
  try {
    loginData = JSON.parse(res.body);
  } catch {}
  console.log(`Status: ${res.status} | User: ${loginData?.user?.email || "?"} | Role: ${loginData?.user?.role || "?"} | Cookies: ${res.cookies.length}`);
  return allCookies;
}

async function testEndpoint(label, method, path, cookie, postBody) {
  try {
    const headers = { Cookie: cookie };
    const res = await request(method, path, postBody || null, headers);
    const preview = res.body.substring(0, 150).replace(/[\n\r]/g, " ");
    return { label, method, path, status: res.status, preview, ok: res.status >= 200 && res.status < 400 };
  } catch (e) {
    return { label, method, path, status: "ERR", preview: e.message, ok: false };
  }
}

async function testPage(label, path, cookie) {
  try {
    const headers = { Cookie: cookie, Accept: "text/html" };
    const res = await request("GET", path, null, headers);
    const bodyLen = res.body.length;
    // Check for redirect
    const location = res.headers.location || "";
    const preview = res.status === 307 || res.status === 302
      ? `REDIRECT -> ${location}`
      : res.body.substring(0, 100).replace(/[\n\r]/g, " ");
    return {
      label, path, status: res.status, preview, bodyLen,
      ok: res.status >= 200 && res.status < 400 && bodyLen > 100 && res.status !== 307 && res.status !== 302,
    };
  } catch (e) {
    return { label, path, status: "ERR", preview: e.message, bodyLen: 0, ok: false };
  }
}

async function testDatabase() {
  console.log("\n=== STEP 4: DATABASE TABLE COUNTS ===");
  const client = new Client({ connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres" });
  try {
    await client.connect();
    const tables = [
      { name: "user", query: 'SELECT count(*) as cnt FROM "user"' },
      { name: "resume", query: 'SELECT count(*) as cnt FROM "resume"' },
      { name: "ai_provider_config", query: "SELECT count(*) as cnt FROM ai_provider_config" },
      { name: "ai_usage_quota", query: "SELECT count(*) as cnt FROM ai_usage_quota" },
      { name: "audit_log", query: "SELECT count(*) as cnt FROM audit_log" },
    ];
    console.log(`${"Table".padEnd(25)} | Count`);
    console.log("-".repeat(40));
    for (const t of tables) {
      try {
        const result = await client.query(t.query);
        console.log(`${t.name.padEnd(25)} | ${result.rows[0].cnt}`);
      } catch (e) {
        console.log(`${t.name.padEnd(25)} | ERROR: ${e.message.split("\n")[0]}`);
      }
    }
  } catch (e) {
    console.log(`Database connection failed: ${e.message}`);
    console.log("(This is expected if DATABASE_URL is not set or PostgreSQL uses different credentials)");
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  let cookie;
  try {
    cookie = await login();
  } catch (e) {
    console.error("Login failed:", e.message);
    process.exit(1);
  }

  // =========================================================================
  // STEP 2: API ENDPOINT TESTS
  // =========================================================================
  console.log("\n=== STEP 2: API ENDPOINT TESTS ===");

  // ORPC uses explicit .route({ path }) when defined, otherwise key-based paths
  // With prefix "/api/rpc", the full URL is /api/rpc{path}
  // For routers WITHOUT explicit path, ORPC uses: /api/rpc/{routerKey}/{procedureKey}

  const apiTests = [
    // 1. Analytics Overview - has explicit path: /analytics/overview
    { label: "analytics.getOverview", method: "GET", path: "/api/rpc/analytics/overview" },

    // 2. AI Usage detailed stats - explicit path: /ai-config/usage/detailed
    { label: "aiConfig.usage.getDetailedStats", method: "GET", path: "/api/rpc/ai-config/usage/detailed" },

    // 3. Activity list - check router
    { label: "activity.list (key-based)", method: "GET", path: "/api/rpc/activity/list" },
    { label: "activity.list (POST key-based)", method: "POST", path: "/api/rpc/activity/list", body: { json: {} } },

    // 4. Goals list
    { label: "goals.list (key-based)", method: "GET", path: "/api/rpc/goals/list" },
    { label: "goals.list (POST key-based)", method: "POST", path: "/api/rpc/goals/list", body: { json: {} } },

    // 5. Admin analytics overview - explicit path: /admin/analytics/overview
    { label: "admin.analytics.getOverview", method: "GET", path: "/api/rpc/admin/analytics/overview" },

    // 6. Admin users list - explicit path: /admin/users
    { label: "admin.users.list (GET)", method: "GET", path: "/api/rpc/admin/users" },
    { label: "admin.users.list (GET+params)", method: "GET", path: '/api/rpc/admin/users?data={"json":{"page":1,"limit":20}}' },

    // 7. Admin resumes list - explicit path: /admin/resumes
    { label: "admin.resumes.list (GET)", method: "GET", path: "/api/rpc/admin/resumes" },
    { label: "admin.resumes.list (GET+params)", method: "GET", path: '/api/rpc/admin/resumes?data={"json":{"page":1,"limit":20}}' },

    // 8. Admin advanced overview - explicit path: /admin/analytics/advanced-overview
    { label: "admin.analytics.getAdvancedOverview", method: "GET", path: "/api/rpc/admin/analytics/advanced-overview" },

    // 9. Admin audit log list - explicit path: /admin/audit-log
    { label: "admin.audit.list (GET)", method: "GET", path: "/api/rpc/admin/audit-log" },
    { label: "admin.audit.list (GET+params)", method: "GET", path: '/api/rpc/admin/audit-log?data={"json":{"page":1,"limit":20}}' },

    // 10. AI Providers list - explicit path: /ai-config/providers
    { label: "aiConfig.providers.list", method: "GET", path: "/api/rpc/ai-config/providers" },

    // 11. AI Quotas list - explicit path: /ai-config/quotas
    { label: "aiConfig.quotas.list", method: "GET", path: "/api/rpc/ai-config/quotas" },

    // 12. AI Global Settings - explicit path: /ai-config/global-settings
    { label: "aiConfig.globalSettings.get", method: "GET", path: "/api/rpc/ai-config/global-settings" },

    // 13. System health - explicit path: /admin/system/health
    { label: "admin.system.getHealth", method: "GET", path: "/api/rpc/admin/system/health" },

    // 14. Cohort analytics - no explicit path, key-based
    { label: "cohortAnalytics.list (key-based)", method: "GET", path: "/api/rpc/cohortAnalytics/list" },
    { label: "cohortAnalytics.list (POST)", method: "POST", path: "/api/rpc/cohortAnalytics/list", body: { json: {} } },

    // 15. Reference data - check routers
    { label: "imtaPrograms.list", method: "GET", path: "/api/rpc/imtaPrograms/list" },
    { label: "seed.all", method: "GET", path: "/api/rpc/seed/all" },
  ];

  console.log("-".repeat(130));
  console.log(`${"Label".padEnd(48)} | ${"Method".padEnd(6)} | ${"Status".padEnd(6)} | Response`);
  console.log("-".repeat(130));

  const apiResults = {};
  for (const t of apiTests) {
    const result = await testEndpoint(t.label, t.method, t.path, cookie, t.body);
    apiResults[t.label] = result;
    const icon = result.ok ? "OK  " : "FAIL";
    console.log(`${t.label.padEnd(48)} | ${t.method.padEnd(6)} | ${String(result.status).padEnd(6)} | [${icon}] ${result.preview.substring(0, 65)}`);
  }

  // =========================================================================
  // STEP 3: PAGE RENDER TESTS
  // =========================================================================
  console.log("\n=== STEP 3: PAGE RENDER TESTS ===");

  const pageTests = [
    { label: "Analytics Overview", path: "/dashboard/analytics" },
    { label: "AI Usage Analytics", path: "/dashboard/analytics/ai-usage" },
    { label: "Reports", path: "/dashboard/analytics/reports" },
    { label: "Admin Dashboard", path: "/dashboard/admin" },
    { label: "Admin Users", path: "/dashboard/admin/users" },
    { label: "Admin Resumes", path: "/dashboard/admin/resumes" },
    { label: "Admin System", path: "/dashboard/admin/system" },
    { label: "Admin Audit Log", path: "/dashboard/admin/audit-log" },
    { label: "Admin AI Providers", path: "/dashboard/admin/ai-providers" },
    { label: "Admin AI Quotas", path: "/dashboard/admin/ai-quotas" },
    { label: "Admin AI Settings", path: "/dashboard/admin/ai-settings" },
    { label: "Admin Reference Data", path: "/dashboard/admin/reference-data" },
    { label: "Admin Cohorts", path: "/dashboard/admin/cohorts" },
  ];

  console.log("-".repeat(110));
  console.log(`${"Page".padEnd(25)} | ${"Path".padEnd(40)} | ${"Status".padEnd(6)} | ${"Bytes".padEnd(8)} | Preview`);
  console.log("-".repeat(110));

  const pageResults = {};
  for (const t of pageTests) {
    const result = await testPage(t.label, t.path, cookie);
    pageResults[t.label] = result;
    const icon = result.ok ? "OK  " : "FAIL";
    console.log(`${t.label.padEnd(25)} | ${t.path.padEnd(40)} | ${String(result.status).padEnd(6)} | ${String(result.bodyLen).padEnd(8)} | [${icon}] ${result.preview.substring(0, 30)}`);
  }

  // =========================================================================
  // STEP 4: DATABASE
  // =========================================================================
  await testDatabase();

  // =========================================================================
  // STEP 5: FINAL SUMMARY TABLE
  // =========================================================================
  console.log("\n=== FINAL SUMMARY TABLE ===");
  console.log("| # | Page | Path | API Endpoint | API Status | Page Status | Issue |");
  console.log("|---|------|------|-------------|-----------|-------------|-------|");

  const summary = [
    { n: 1, page: "Analytics Overview", path: "/dashboard/analytics", apiKey: "analytics.getOverview" },
    { n: 2, page: "AI Usage Analytics", path: "/dashboard/analytics/ai-usage", apiKey: "aiConfig.usage.getDetailedStats" },
    { n: 3, page: "Reports", path: "/dashboard/analytics/reports", apiKey: "activity.list (key-based)" },
    { n: 4, page: "Admin Dashboard", path: "/dashboard/admin", apiKey: "admin.analytics.getOverview" },
    { n: 5, page: "Admin Users", path: "/dashboard/admin/users", apiKey: "admin.users.list (GET+params)" },
    { n: 6, page: "Admin Resumes", path: "/dashboard/admin/resumes", apiKey: "admin.resumes.list (GET+params)" },
    { n: 7, page: "Admin System", path: "/dashboard/admin/system", apiKey: "admin.analytics.getAdvancedOverview" },
    { n: 8, page: "Admin Audit Log", path: "/dashboard/admin/audit-log", apiKey: "admin.audit.list (GET+params)" },
    { n: 9, page: "Admin AI Providers", path: "/dashboard/admin/ai-providers", apiKey: "aiConfig.providers.list" },
    { n: 10, page: "Admin AI Quotas", path: "/dashboard/admin/ai-quotas", apiKey: "aiConfig.quotas.list" },
    { n: 11, page: "Admin AI Settings", path: "/dashboard/admin/ai-settings", apiKey: "aiConfig.globalSettings.get" },
    { n: 12, page: "Admin Reference Data", path: "/dashboard/admin/reference-data", apiKey: "imtaPrograms.list" },
    { n: 13, page: "Admin Cohorts", path: "/dashboard/admin/cohorts", apiKey: "cohortAnalytics.list (key-based)" },
  ];

  for (const s of summary) {
    const api = apiResults[s.apiKey];
    const page = pageResults[s.page];

    const apiOk = api?.ok;
    const pageOk = page?.ok;
    const apiStatus = api ? `${api.status} ${apiOk ? "OK" : "FAIL"}` : "N/A";
    const pageStatus = page ? `${page.status} ${pageOk ? "OK" : "FAIL"}` : "N/A";

    let issue = "None";
    if (!apiOk && !pageOk) {
      issue = "Both failed";
      if (api) issue += ` - API: ${api.preview.substring(0, 40)}`;
      if (page?.status === 307) issue += " | Page: 307 redirect";
    } else if (!apiOk) {
      issue = `API: ${api?.preview?.substring(0, 50) || "unknown"}`;
    } else if (!pageOk) {
      issue = `Page: ${page?.preview?.substring(0, 50) || "unknown"}`;
    }

    console.log(`| ${s.n} | ${s.page.padEnd(22)} | ${s.path.padEnd(40)} | ${s.apiKey.padEnd(45)} | ${apiStatus.padEnd(10)} | ${pageStatus.padEnd(12)} | ${issue} |`);
  }

  // Count summary
  const apiOks = summary.filter(s => apiResults[s.apiKey]?.ok).length;
  const pageFails = summary.filter(s => !pageResults[s.page]?.ok).length;
  console.log(`\n--- TOTALS: ${apiOks}/${summary.length} APIs OK | ${summary.length - pageFails}/${summary.length} Pages OK ---`);
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
