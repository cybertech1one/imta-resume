// Test all settings and profile pages end-to-end
// Uses curl subprocess for reliable HTTP requests

import { execSync } from "node:child_process";

const BASE = "http://localhost:3040";

// Helper: make HTTP request via curl, returns { status, body, headers }
function request(url, options = {}) {
  const method = options.method || "GET";
  const headers = options.headers || {};
  const body = options.body || null;

  let cmd = `curl -s -w "\\n---HTTP_STATUS:%{http_code}---" -X ${method}`;

  // Add headers
  for (const [k, v] of Object.entries(headers)) {
    cmd += ` -H "${k}: ${v}"`;
  }

  // Add body
  if (body) {
    // Escape for shell
    const escaped = body.replace(/"/g, '\\"');
    cmd += ` -d "${escaped}"`;
  }

  // Include response headers
  cmd += ` -D -`;

  cmd += ` "${url}"`;

  try {
    const output = execSync(cmd, { timeout: 15000, encoding: "utf-8", maxBuffer: 1024 * 1024 });

    // Split headers and body (separated by blank line)
    const parts = output.split("\r\n\r\n");
    const rawHeaders = parts[0] || "";
    const bodyAndStatus = parts.slice(1).join("\r\n\r\n");

    // Extract status from our marker
    const statusMatch = bodyAndStatus.match(/---HTTP_STATUS:(\d+)---/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 0;
    const responseBody = bodyAndStatus.replace(/\n?---HTTP_STATUS:\d+---$/, "");

    // Extract cookies
    const cookieLines = rawHeaders.split("\r\n").filter(l => l.toLowerCase().startsWith("set-cookie:"));
    const cookies = cookieLines.map(l => l.replace(/^set-cookie:\s*/i, "").split(";")[0]).join("; ");

    return { status, body: responseBody, cookies, rawHeaders };
  } catch (err) {
    return { status: 0, body: err.message.substring(0, 200), cookies: "", rawHeaders: "" };
  }
}

// Simpler request without header dump (just body + status)
function simpleRequest(url, options = {}) {
  const method = options.method || "GET";
  const headers = options.headers || {};
  const body = options.body || null;

  let cmd = `curl -s -o - -w "\\n---HTTP_STATUS:%{http_code}---" -X ${method}`;

  for (const [k, v] of Object.entries(headers)) {
    cmd += ` -H "${k}: ${v}"`;
  }

  if (body) {
    const escaped = body.replace(/"/g, '\\"');
    cmd += ` -d "${escaped}"`;
  }

  cmd += ` "${url}"`;

  try {
    const output = execSync(cmd, { timeout: 15000, encoding: "utf-8", maxBuffer: 1024 * 1024 });
    const statusMatch = output.match(/---HTTP_STATUS:(\d+)---/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 0;
    const responseBody = output.replace(/\n?---HTTP_STATUS:\d+---$/, "");
    return { status, body: responseBody };
  } catch (err) {
    return { status: 0, body: err.message.substring(0, 200) };
  }
}

async function main() {
  console.log("=== Step 1: Login ===\n");

  const loginRes = request(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,
      "Referer": `${BASE}/`,
    },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
  });

  console.log(`Login status: ${loginRes.status}`);
  console.log(`Login body: ${loginRes.body.substring(0, 200)}`);
  console.log(`Session cookie: ${loginRes.cookies.substring(0, 80)}`);

  if (loginRes.status !== 200 || !loginRes.cookies) {
    console.error("LOGIN FAILED - cannot proceed");
    process.exit(1);
  }

  const sessionCookie = loginRes.cookies;
  console.log("\n=== Step 2: Verify Session ===\n");

  const sessionRes = simpleRequest(`${BASE}/api/auth/get-session`, {
    headers: { Cookie: sessionCookie },
  });
  console.log(`Session check: ${sessionRes.status}`);
  console.log(`Session body: ${sessionRes.body.substring(0, 200)}`);

  // ============================================
  // Test definitions
  // ============================================
  const tests = [
    {
      num: 1,
      page: "/dashboard/profile",
      pageLabel: "Profile Page",
      apis: [
        { path: "/api/rpc/userProfile/get", label: "userProfile.get", method: "GET" },
      ],
    },
    {
      num: 2,
      page: "/dashboard/profile/achievements",
      pageLabel: "Achievements Page",
      apis: [
        { path: "/api/rpc/achievements/getUserAchievements", label: "achievements.getUserAchievements", method: "GET" },
      ],
    },
    {
      num: 3,
      page: "/dashboard/progress",
      pageLabel: "Progress Page",
      apis: [
        { path: "/api/rpc/progress/getOverview", label: "progress.getOverview", method: "GET" },
      ],
    },
    {
      num: 4,
      page: "/dashboard/settings/profile",
      pageLabel: "Settings Profile",
      apis: [
        { path: "/api/auth/get-session", label: "auth/get-session", method: "GET" },
      ],
    },
    {
      num: 5,
      page: "/dashboard/settings/preferences",
      pageLabel: "Settings Preferences",
      apis: [
        { path: "/api/rpc/userProfile/getAiLanguage", label: "userProfile.getAiLanguage", method: "GET" },
        { path: "/api/rpc/settings/getPreferences", label: "settings.getPreferences", method: "GET" },
      ],
    },
    {
      num: 6,
      page: "/dashboard/settings/authentication",
      pageLabel: "Settings Auth",
      apis: [
        { path: "/api/auth/get-session", label: "auth/get-session (passkeys)", method: "GET" },
      ],
    },
    {
      num: 7,
      page: "/dashboard/settings/data",
      pageLabel: "Settings Data",
      apis: [
        { path: "/api/rpc/resume/list", label: "resume.list", method: "GET" },
      ],
    },
    {
      num: 8,
      page: "/dashboard/settings/danger-zone",
      pageLabel: "Settings Danger Zone",
      apis: [], // Static page
    },
    {
      num: 9,
      page: "/dashboard/settings/api-keys",
      pageLabel: "Settings API Keys",
      apis: [
        { path: "/api/auth/api-key/list", label: "auth/api-key/list", method: "GET" },
      ],
    },
    {
      num: 10,
      page: "/dashboard/settings/ai",
      pageLabel: "Settings AI",
      apis: [
        { path: "/api/rpc/aiConfig/status/check", label: "aiConfig.status.check", method: "GET" },
      ],
    },
  ];

  console.log("\n=== Step 3: Test API Endpoints ===\n");

  const apiResults = {};
  for (const t of tests) {
    for (const api of t.apis) {
      const res = simpleRequest(`${BASE}${api.path}`, {
        method: api.method,
        headers: {
          Cookie: sessionCookie,
          Origin: BASE,
          Referer: `${BASE}/`,
        },
      });
      apiResults[api.label] = res;
      const bodyPreview = res.body.substring(0, 150).replace(/\n/g, " ");
      console.log(`[${res.status}] ${api.label}: ${bodyPreview}`);
    }
  }

  console.log("\n=== Step 4: Test Page Rendering ===\n");

  const pageResults = {};
  for (const t of tests) {
    const res = simpleRequest(`${BASE}${t.page}`, {
      headers: {
        Cookie: sessionCookie,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const isHTML = res.body.includes("<!DOCTYPE") || res.body.includes("<html") || res.body.includes("<div");
    pageResults[t.page] = { ...res, isHTML };
    console.log(`[${res.status}] ${t.pageLabel} (${t.page}): HTML=${isHTML}`);
  }

  // ============================================
  // FINAL TABLE
  // ============================================
  console.log("\n" + "=".repeat(140));
  console.log("FINAL REPORT: Settings & Profile Pages End-to-End Test");
  console.log("=".repeat(140));
  console.log("");

  // Header
  console.log("| #  | Page                              | API Endpoint                        | API Status | Page Status | Issue                              |");
  console.log("|----|-----------------------------------|-------------------------------------|------------|-------------|------------------------------------|");

  for (const t of tests) {
    const pg = pageResults[t.page];
    const pageStatusStr = pg ? `${pg.status}${pg.isHTML ? " (HTML)" : " (no HTML)"}` : "N/A";

    if (t.apis.length === 0) {
      // Static page
      const issue = pg && pg.status === 200 && pg.isHTML ? "OK" : `Page issue: ${pg?.status}`;
      console.log(
        `| ${String(t.num).padEnd(2)} | ${t.page.padEnd(33)} | ${"N/A (static page)".padEnd(35)} | ${"N/A".padEnd(10)} | ${String(pageStatusStr).padEnd(11)} | ${issue.padEnd(34)} |`
      );
    } else {
      for (let j = 0; j < t.apis.length; j++) {
        const api = t.apis[j];
        const apiRes = apiResults[api.label];
        const apiStatus = apiRes ? apiRes.status : "N/A";

        let issue = "";
        if (apiRes && apiRes.status >= 400) {
          // Extract error message
          try {
            const parsed = JSON.parse(apiRes.body);
            issue = parsed.message || parsed.error || `HTTP ${apiRes.status}`;
          } catch {
            issue = `HTTP ${apiRes.status}`;
          }
          issue = issue.substring(0, 34);
        }
        if (pg && pg.status !== 200) {
          issue += (issue ? " | " : "") + `Page ${pg.status}`;
          issue = issue.substring(0, 34);
        }
        if (pg && pg.status === 200 && !pg.isHTML) {
          issue += (issue ? " | " : "") + "Not HTML";
          issue = issue.substring(0, 34);
        }
        if (!issue) issue = "OK";

        const numStr = j === 0 ? String(t.num) : "";
        const pageStr = j === 0 ? t.page : "";
        const pgStatusStr2 = j === 0 ? pageStatusStr : "";

        console.log(
          `| ${numStr.padEnd(2)} | ${pageStr.padEnd(33)} | ${api.label.padEnd(35)} | ${String(apiStatus).padEnd(10)} | ${pgStatusStr2.padEnd(11)} | ${issue.padEnd(34)} |`
        );
      }
    }
  }

  // Summary
  console.log("");
  const totalAPIs = Object.keys(apiResults).length;
  const passingAPIs = Object.values(apiResults).filter(r => r.status === 200).length;
  const failingAPIs = totalAPIs - passingAPIs;
  const totalPages = Object.keys(pageResults).length;
  const passingPages = Object.values(pageResults).filter(r => r.status === 200 && r.isHTML).length;
  const failingPages = totalPages - passingPages;

  console.log(`APIs: ${passingAPIs}/${totalAPIs} passing, ${failingAPIs} failing`);
  console.log(`Pages: ${passingPages}/${totalPages} passing (200 + HTML), ${failingPages} failing`);

  // Detail on failures
  if (failingAPIs > 0) {
    console.log("\n--- API Failures Detail ---");
    for (const [label, res] of Object.entries(apiResults)) {
      if (res.status !== 200) {
        console.log(`  ${label}: HTTP ${res.status}`);
        console.log(`    Response: ${res.body.substring(0, 200)}`);
      }
    }
  }

  if (failingPages > 0) {
    console.log("\n--- Page Failures Detail ---");
    for (const [path, res] of Object.entries(pageResults)) {
      if (res.status !== 200 || !res.isHTML) {
        console.log(`  ${path}: HTTP ${res.status}, HTML=${res.isHTML}`);
        console.log(`    Response: ${res.body.substring(0, 200)}`);
      }
    }
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
