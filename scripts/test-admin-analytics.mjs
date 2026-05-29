// Comprehensive test of all analytics & admin pages + API endpoints
import http from "node:http";

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

// Step 1: Authenticate
async function login() {
  console.log("=== AUTHENTICATION ===");
  const res = await request("POST", "/api/auth/sign-in/email", {
    email: "admin@test.com",
    password: "TestAccount123!",
  });
  console.log(`Login status: ${res.status}`);

  // Extract session cookie
  const allCookies = res.cookies.map(c => c.split(";")[0]).join("; ");
  console.log(`Cookies received: ${res.cookies.length}`);

  // Parse body
  let loginData;
  try {
    loginData = JSON.parse(res.body);
    console.log(`User: ${loginData?.user?.email || "unknown"}, Role: ${loginData?.user?.role || "unknown"}`);
  } catch {
    console.log(`Body (first 200): ${res.body.substring(0, 200)}`);
  }

  return allCookies;
}

// Step 2: Test API endpoint
async function testAPI(name, method, path, cookie, postBody) {
  try {
    const headers = { Cookie: cookie };
    const res = await request(method, path, postBody || null, headers);
    const preview = res.body.substring(0, 200).replace(/\n/g, " ");
    return { name, status: res.status, preview, ok: res.status >= 200 && res.status < 400 };
  } catch (e) {
    return { name, status: "ERR", preview: e.message, ok: false };
  }
}

// Step 3: Test page render
async function testPage(name, path, cookie) {
  try {
    const headers = { Cookie: cookie, Accept: "text/html" };
    const res = await request("GET", path, null, headers);
    const preview = res.body.substring(0, 200).replace(/\n/g, " ");
    const hasContent = res.body.length > 100;
    return { name, status: res.status, preview, ok: res.status >= 200 && res.status < 400 && hasContent };
  } catch (e) {
    return { name, status: "ERR", preview: e.message, ok: false };
  }
}

// Step 4: Test database tables
async function testDB(cookie) {
  console.log("\n=== DATABASE TABLE COUNTS ===");
  const tables = ["user", "resume", "ai_provider_config", "ai_usage_quota", "audit_log"];

  // We'll use the admin overview which typically returns counts
  // But first let's try direct SQL via a simple approach
  // Since we can't run psql directly, we'll infer from API responses

  // Try admin overview for user/resume counts
  const adminRes = await testAPI("admin-overview", "GET", "/api/rpc/admin/getOverview", cookie);
  console.log(`Admin overview response: ${adminRes.preview}`);

  return adminRes;
}

async function main() {
  let cookie;
  try {
    cookie = await login();
  } catch (e) {
    console.error("Login failed:", e.message);
    process.exit(1);
  }

  if (!cookie) {
    console.error("No session cookie received");
    process.exit(1);
  }

  // Define all tests
  const apiTests = [
    // Analytics
    { name: "analytics/getOverview", method: "GET", path: "/api/rpc/analytics/getOverview" },
    { name: "analytics/getOverview (POST)", method: "POST", path: "/api/rpc/analytics/getOverview", body: { json: {} } },

    // AI Usage stats
    { name: "aiConfig/usage/getDetailedStats", method: "GET", path: "/api/rpc/aiConfig/usage/getDetailedStats" },
    { name: "aiConfig/usage/getDetailedStats (POST)", method: "POST", path: "/api/rpc/aiConfig/usage/getDetailedStats", body: { json: {} } },

    // Activity & Goals (reports page)
    { name: "activity/list", method: "GET", path: "/api/rpc/activity/list" },
    { name: "activity/list (POST)", method: "POST", path: "/api/rpc/activity/list", body: { json: {} } },
    { name: "goals/list", method: "GET", path: "/api/rpc/goals/list" },
    { name: "goals/list (POST)", method: "POST", path: "/api/rpc/goals/list", body: { json: {} } },

    // Admin
    { name: "admin/getOverview", method: "GET", path: "/api/rpc/admin/getOverview" },
    { name: "admin/getOverview (POST)", method: "POST", path: "/api/rpc/admin/getOverview", body: { json: {} } },

    // Admin advanced
    { name: "admin/getAdvancedOverview", method: "GET", path: "/api/rpc/admin/getAdvancedOverview" },
    { name: "admin/getAdvancedOverview (POST)", method: "POST", path: "/api/rpc/admin/getAdvancedOverview", body: { json: {} } },

    // Admin users
    { name: "admin/users/list", method: "GET", path: "/api/rpc/admin/users/list" },
    { name: "admin/users/list (POST)", method: "POST", path: "/api/rpc/admin/users/list", body: { json: {} } },

    // Admin resumes
    { name: "admin/resumes/list", method: "GET", path: "/api/rpc/admin/resumes/list" },
    { name: "admin/resumes/list (POST)", method: "POST", path: "/api/rpc/admin/resumes/list", body: { json: {} } },

    // Audit log
    { name: "admin/auditLog/list", method: "GET", path: "/api/rpc/admin/auditLog/list" },
    { name: "admin/auditLog/list (POST)", method: "POST", path: "/api/rpc/admin/auditLog/list", body: { json: {} } },

    // AI providers
    { name: "aiConfig/providers/list", method: "GET", path: "/api/rpc/aiConfig/providers/list" },
    { name: "aiConfig/providers/list (POST)", method: "POST", path: "/api/rpc/aiConfig/providers/list", body: { json: {} } },

    // AI quotas
    { name: "aiConfig/quota/list", method: "GET", path: "/api/rpc/aiConfig/quota/list" },
    { name: "aiConfig/quota/list (POST)", method: "POST", path: "/api/rpc/aiConfig/quota/list", body: { json: {} } },

    // AI settings
    { name: "aiConfig/settings/get", method: "GET", path: "/api/rpc/aiConfig/settings/get" },
    { name: "aiConfig/settings/get (POST)", method: "POST", path: "/api/rpc/aiConfig/settings/get", body: { json: {} } },

    // Reference data
    { name: "admin/referenceData/list", method: "GET", path: "/api/rpc/admin/referenceData/list" },

    // Cohorts
    { name: "admin/cohorts/list", method: "GET", path: "/api/rpc/admin/cohorts/list" },
    { name: "admin/cohorts/list (POST)", method: "POST", path: "/api/rpc/admin/cohorts/list", body: { json: {} } },
  ];

  const pageTests = [
    { name: "Analytics Overview", path: "/dashboard/analytics" },
    { name: "AI Usage Analytics", path: "/dashboard/analytics/ai-usage" },
    { name: "Reports", path: "/dashboard/analytics/reports" },
    { name: "Admin Dashboard", path: "/dashboard/admin" },
    { name: "Admin Users", path: "/dashboard/admin/users" },
    { name: "Admin Resumes", path: "/dashboard/admin/resumes" },
    { name: "Admin System", path: "/dashboard/admin/system" },
    { name: "Admin Audit Log", path: "/dashboard/admin/audit-log" },
    { name: "Admin AI Providers", path: "/dashboard/admin/ai-providers" },
    { name: "Admin AI Quotas", path: "/dashboard/admin/ai-quotas" },
    { name: "Admin AI Settings", path: "/dashboard/admin/ai-settings" },
    { name: "Admin Reference Data", path: "/dashboard/admin/reference-data" },
    { name: "Admin Cohorts", path: "/dashboard/admin/cohorts" },
  ];

  // Run API tests
  console.log("\n=== API ENDPOINT TESTS ===");
  console.log("-".repeat(120));
  console.log(`${"Endpoint".padEnd(45)} | ${"Method".padEnd(6)} | ${"Status".padEnd(6)} | Response Preview`);
  console.log("-".repeat(120));

  for (const t of apiTests) {
    const result = await testAPI(t.name, t.method, t.path, cookie, t.body);
    const statusStr = String(result.status).padEnd(6);
    const icon = result.ok ? "OK" : "FAIL";
    console.log(`${t.name.padEnd(45)} | ${t.method.padEnd(6)} | ${statusStr} | [${icon}] ${result.preview.substring(0, 60)}`);
  }

  // Run page tests
  console.log("\n=== PAGE RENDER TESTS ===");
  console.log("-".repeat(120));
  console.log(`${"Page".padEnd(30)} | ${"Path".padEnd(40)} | ${"Status".padEnd(6)} | Response Preview`);
  console.log("-".repeat(120));

  for (const t of pageTests) {
    const result = await testPage(t.name, t.path, cookie);
    const statusStr = String(result.status).padEnd(6);
    const icon = result.ok ? "OK" : "FAIL";
    console.log(`${t.name.padEnd(30)} | ${t.path.padEnd(40)} | ${statusStr} | [${icon}] ${result.preview.substring(0, 40)}`);
  }

  // Database tests via admin API
  await testDB(cookie);

  // Summary table
  console.log("\n\n=== SUMMARY TABLE ===");
  console.log("| Page | API Status | Page Status | Issue |");
  console.log("|------|-----------|-------------|-------|");

  // Re-run concise tests for the summary
  const summaryTests = [
    { page: "/dashboard/analytics", api: "/api/rpc/analytics/getOverview", name: "Analytics Overview" },
    { page: "/dashboard/analytics/ai-usage", api: "/api/rpc/aiConfig/usage/getDetailedStats", name: "AI Usage" },
    { page: "/dashboard/analytics/reports", api: "/api/rpc/activity/list", name: "Reports" },
    { page: "/dashboard/admin", api: "/api/rpc/admin/getOverview", name: "Admin Dashboard" },
    { page: "/dashboard/admin/users", api: "/api/rpc/admin/users/list", name: "Admin Users" },
    { page: "/dashboard/admin/resumes", api: "/api/rpc/admin/resumes/list", name: "Admin Resumes" },
    { page: "/dashboard/admin/system", api: "/api/rpc/admin/getAdvancedOverview", name: "Admin System" },
    { page: "/dashboard/admin/audit-log", api: "/api/rpc/admin/auditLog/list", name: "Admin Audit Log" },
    { page: "/dashboard/admin/ai-providers", api: "/api/rpc/aiConfig/providers/list", name: "Admin AI Providers" },
    { page: "/dashboard/admin/ai-quotas", api: "/api/rpc/aiConfig/quota/list", name: "Admin AI Quotas" },
    { page: "/dashboard/admin/ai-settings", api: "/api/rpc/aiConfig/settings/get", name: "Admin AI Settings" },
    { page: "/dashboard/admin/reference-data", api: "/api/rpc/admin/referenceData/list", name: "Admin Ref Data" },
    { page: "/dashboard/admin/cohorts", api: "/api/rpc/admin/cohorts/list", name: "Admin Cohorts" },
  ];

  for (const t of summaryTests) {
    // Try GET first, then POST for API
    let apiResult = await testAPI(t.name, "GET", t.api, cookie);
    if (!apiResult.ok) {
      apiResult = await testAPI(t.name, "POST", t.api, cookie, { json: {} });
    }
    const pageResult = await testPage(t.name, t.page, cookie);

    const apiStatus = apiResult.ok ? `${apiResult.status} OK` : `${apiResult.status} FAIL`;
    const pageStatus = pageResult.ok ? `${pageResult.status} OK` : `${pageResult.status} FAIL`;

    let issue = "None";
    if (!apiResult.ok && !pageResult.ok) issue = "Both API and page failed";
    else if (!apiResult.ok) issue = `API: ${apiResult.preview.substring(0, 60)}`;
    else if (!pageResult.ok) issue = `Page: ${pageResult.preview.substring(0, 60)}`;

    console.log(`| ${t.name.padEnd(20)} | ${apiStatus.padEnd(10)} | ${pageStatus.padEnd(12)} | ${issue} |`);
  }
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
