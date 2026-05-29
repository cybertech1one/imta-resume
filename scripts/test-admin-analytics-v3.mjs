// Definitive test: all analytics & admin pages + API endpoints + database
// ORPC uses KEY-BASED paths: /api/rpc/{routerKey}/{procedureKey}
// For nested routers: /api/rpc/{topKey}/{subKey}/{procedureKey}
import http from "node:http";
import pkg from "pg";
const { Client } = pkg;

const BASE = "http://localhost:3040";
const HOST = "localhost";
const PORT = 3040;

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: HOST,
      port: PORT,
      path,
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
    if (body) req.write(typeof body === "string" ? body : JSON.stringify(body));
    req.end();
  });
}

async function login() {
  console.log("=== AUTHENTICATION ===");
  const res = await request("POST", "/api/auth/sign-in/email",
    { email: "admin@test.com", password: "TestAccount123!" });
  const allCookies = res.cookies.map(c => c.split(";")[0]).join("; ");
  let d; try { d = JSON.parse(res.body); } catch {}
  console.log(`Status: ${res.status} | User: ${d?.user?.email} | Role: ${d?.user?.role}`);
  if (res.status !== 200) { console.log("Body:", res.body.substring(0, 300)); }
  return allCookies;
}

// Try multiple path patterns for an API and return the first success
async function tryAPI(label, paths, cookie) {
  for (const { method, path, body } of paths) {
    try {
      const headers = { Cookie: cookie };
      const res = await request(method, path, body || null, headers);
      const preview = res.body.substring(0, 120).replace(/[\n\r]/g, " ");
      const ok = res.status >= 200 && res.status < 400;
      if (ok) return { label, status: res.status, ok: true, preview, method, path };
    } catch {}
  }
  // All failed, return last attempt info
  const last = paths[paths.length - 1];
  try {
    const res = await request(last.method, last.path, last.body || null, { Cookie: cookie });
    const preview = res.body.substring(0, 120).replace(/[\n\r]/g, " ");
    return { label, status: res.status, ok: false, preview, method: last.method, path: last.path };
  } catch (e) {
    return { label, status: "ERR", ok: false, preview: e.message, method: last.method, path: last.path };
  }
}

async function testPage(label, path, cookie) {
  try {
    const res = await request("GET", path, null, { Cookie: cookie, Accept: "text/html" });
    const location = res.headers.location || "";
    if (res.status === 307 || res.status === 302) {
      // Follow the redirect
      const res2 = await request("GET", location, null, { Cookie: cookie, Accept: "text/html" });
      const preview2 = res2.body.substring(0, 80).replace(/[\n\r]/g, " ");
      return { label, path, status: `${res.status}->${res2.status}`, bodyLen: res2.body.length,
        ok: res2.status >= 200 && res2.status < 400 && res2.body.length > 100,
        preview: `Redirect ${path} -> ${location} (${res2.status}, ${res2.body.length}b)` };
    }
    const preview = res.body.substring(0, 80).replace(/[\n\r]/g, " ");
    return { label, path, status: res.status, bodyLen: res.body.length,
      ok: res.status >= 200 && res.status < 400 && res.body.length > 100, preview };
  } catch (e) {
    return { label, path, status: "ERR", bodyLen: 0, ok: false, preview: e.message };
  }
}

async function main() {
  const cookie = await login();

  // ========================= API TESTS =========================
  console.log("\n=== API ENDPOINT TESTS ===");
  console.log("(Testing key-based ORPC paths: /api/rpc/{routerKey}/{procedureKey})");
  console.log("-".repeat(140));

  // Define all APIs with multiple path attempts (key-based primary, explicit path fallback)
  const apis = [
    {
      label: "1. analytics.getOverview",
      paths: [
        { method: "GET", path: "/api/rpc/analytics/getOverview" },
        { method: "POST", path: "/api/rpc/analytics/getOverview", body: { json: {} } },
      ]
    },
    {
      label: "2. aiConfig.usage.getDetailedStats",
      paths: [
        { method: "GET", path: "/api/rpc/aiConfig/usage/getDetailedStats" },
        { method: "POST", path: "/api/rpc/aiConfig/usage/getDetailedStats", body: { json: {} } },
      ]
    },
    {
      label: "3. activity.list",
      paths: [
        { method: "GET", path: "/api/rpc/activity/list" },
        { method: "POST", path: "/api/rpc/activity/list", body: { json: {} } },
      ]
    },
    {
      label: "4. goals.list",
      paths: [
        { method: "GET", path: "/api/rpc/goals/list" },
        { method: "POST", path: "/api/rpc/goals/list", body: { json: {} } },
      ]
    },
    {
      label: "5. admin.analytics.getOverview",
      paths: [
        { method: "GET", path: "/api/rpc/admin/analytics/getOverview" },
        { method: "POST", path: "/api/rpc/admin/analytics/getOverview", body: { json: {} } },
      ]
    },
    {
      label: "6. admin.users.list",
      paths: [
        { method: "POST", path: "/api/rpc/admin/users/list", body: { json: { page: 1, limit: 20 } } },
        { method: "GET", path: "/api/rpc/admin/users/list" },
      ]
    },
    {
      label: "7. admin.resumes.list",
      paths: [
        { method: "POST", path: "/api/rpc/admin/resumes/list", body: { json: { page: 1, limit: 20 } } },
        { method: "GET", path: "/api/rpc/admin/resumes/list" },
      ]
    },
    {
      label: "8. admin.analytics.getAdvancedOverview",
      paths: [
        { method: "GET", path: "/api/rpc/admin/analytics/getAdvancedOverview" },
        { method: "POST", path: "/api/rpc/admin/analytics/getAdvancedOverview", body: { json: {} } },
      ]
    },
    {
      label: "9. admin.audit.list",
      paths: [
        { method: "POST", path: "/api/rpc/admin/audit/list", body: { json: { page: 1, limit: 20 } } },
        { method: "GET", path: "/api/rpc/admin/audit/list" },
      ]
    },
    {
      label: "10. aiConfig.providers.list",
      paths: [
        { method: "GET", path: "/api/rpc/aiConfig/providers/list" },
        { method: "POST", path: "/api/rpc/aiConfig/providers/list", body: { json: {} } },
      ]
    },
    {
      label: "11. aiConfig.quotas.list",
      paths: [
        { method: "GET", path: "/api/rpc/aiConfig/quotas/list" },
        { method: "POST", path: "/api/rpc/aiConfig/quotas/list", body: { json: {} } },
      ]
    },
    {
      label: "12. aiConfig.globalSettings.get",
      paths: [
        { method: "GET", path: "/api/rpc/aiConfig/globalSettings/get" },
        { method: "POST", path: "/api/rpc/aiConfig/globalSettings/get", body: { json: {} } },
      ]
    },
    {
      label: "13. admin.system.getHealth",
      paths: [
        { method: "GET", path: "/api/rpc/admin/system/getHealth" },
        { method: "POST", path: "/api/rpc/admin/system/getHealth", body: { json: {} } },
      ]
    },
    {
      label: "14. cohortAnalytics.list",
      paths: [
        { method: "POST", path: "/api/rpc/cohortAnalytics/list", body: { json: {} } },
        { method: "GET", path: "/api/rpc/cohortAnalytics/list" },
      ]
    },
    {
      label: "15. reference: imtaPrograms.list",
      paths: [
        { method: "POST", path: "/api/rpc/imtaPrograms/list", body: { json: {} } },
        { method: "GET", path: "/api/rpc/imtaPrograms/list" },
      ]
    },
  ];

  const apiResults = [];
  for (const api of apis) {
    const r = await tryAPI(api.label, api.paths, cookie);
    apiResults.push(r);
    const icon = r.ok ? "OK  " : "FAIL";
    console.log(`${r.label.padEnd(45)} | ${r.method.padEnd(4)} ${r.path.padEnd(55)} | ${String(r.status).padEnd(4)} [${icon}] ${r.preview.substring(0, 60)}`);
  }

  // ========================= PAGE TESTS =========================
  console.log("\n=== PAGE RENDER TESTS ===");
  console.log("-".repeat(130));

  const pages = [
    { label: "1. Analytics Overview", path: "/dashboard/analytics" },
    { label: "2. AI Usage Analytics", path: "/dashboard/analytics/ai-usage" },
    { label: "3. Reports", path: "/dashboard/analytics/reports" },
    { label: "4. Admin Dashboard", path: "/dashboard/admin" },
    { label: "5. Admin Users", path: "/dashboard/admin/users" },
    { label: "6. Admin Resumes", path: "/dashboard/admin/resumes" },
    { label: "7. Admin System", path: "/dashboard/admin/system" },
    { label: "8. Admin Audit Log", path: "/dashboard/admin/audit-log" },
    { label: "9. Admin AI Providers", path: "/dashboard/admin/ai-providers" },
    { label: "10. Admin AI Quotas", path: "/dashboard/admin/ai-quotas" },
    { label: "11. Admin AI Settings", path: "/dashboard/admin/ai-settings" },
    { label: "12. Admin Ref Data", path: "/dashboard/admin/reference-data" },
    { label: "13. Admin Cohorts", path: "/dashboard/admin/cohorts" },
  ];

  const pageResults = [];
  for (const p of pages) {
    const r = await testPage(p.label, p.path, cookie);
    pageResults.push(r);
    const icon = r.ok ? "OK  " : "FAIL";
    console.log(`${r.label.padEnd(28)} | ${r.path.padEnd(42)} | ${String(r.status).padEnd(10)} | ${String(r.bodyLen).padEnd(7)}b | [${icon}] ${r.preview.substring(0, 40)}`);
  }

  // ========================= DATABASE TESTS =========================
  console.log("\n=== DATABASE TABLE COUNTS ===");
  const client = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" });
  try {
    await client.connect();
    const tables = [
      { name: "user", q: 'SELECT count(*) as cnt FROM "user"' },
      { name: "resume", q: 'SELECT count(*) as cnt FROM "resume"' },
      { name: "ai_provider_config", q: "SELECT count(*) as cnt FROM ai_provider_config" },
      { name: "ai_usage_quota", q: "SELECT count(*) as cnt FROM ai_usage_quota" },
      { name: "audit_log", q: "SELECT count(*) as cnt FROM audit_log" },
      { name: "session", q: 'SELECT count(*) as cnt FROM "session"' },
      { name: "ai_usage_log", q: "SELECT count(*) as cnt FROM ai_usage_log" },
    ];
    console.log(`${"Table".padEnd(25)} | Count`);
    console.log("-".repeat(40));
    const dbResults = {};
    for (const t of tables) {
      try {
        const result = await client.query(t.q);
        const cnt = result.rows[0].cnt;
        dbResults[t.name] = cnt;
        console.log(`${t.name.padEnd(25)} | ${cnt}`);
      } catch (e) {
        dbResults[t.name] = `ERROR: ${e.message.split("\n")[0]}`;
        console.log(`${t.name.padEnd(25)} | ERROR: ${e.message.split("\n")[0]}`);
      }
    }
  } catch (e) {
    console.log(`Connection failed: ${e.message}`);
  } finally {
    await client.end().catch(() => {});
  }

  // ========================= FINAL SUMMARY =========================
  console.log("\n");
  console.log("=".repeat(140));
  console.log("FINAL SUMMARY TABLE");
  console.log("=".repeat(140));
  console.log(`| ${"#".padEnd(3)} | ${"Page".padEnd(22)} | ${"API Status".padEnd(12)} | ${"Page Status".padEnd(14)} | Issue |`);
  console.log(`|${"-".repeat(5)}|${"-".repeat(24)}|${"-".repeat(14)}|${"-".repeat(16)}|${"-".repeat(60)}|`);

  for (let i = 0; i < pages.length; i++) {
    const api = apiResults[i];
    const page = pageResults[i];

    const apiStr = api.ok ? `${api.status} OK` : `${api.status} FAIL`;
    const pageStr = page.ok ? `${page.status} OK` : `${page.status} FAIL`;

    let issue = "None";
    if (!api.ok && !page.ok) {
      issue = "BOTH FAILED";
    } else if (!api.ok) {
      issue = `API 404/error: check endpoint path`;
    } else if (!page.ok) {
      issue = `Page redirect/error`;
    }

    const num = String(i + 1).padEnd(3);
    console.log(`| ${num} | ${pages[i].label.padEnd(22)} | ${apiStr.padEnd(12)} | ${pageStr.padEnd(14)} | ${issue.padEnd(58)} |`);
  }
  console.log("=".repeat(140));
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
