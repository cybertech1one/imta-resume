// Test all settings and profile pages end-to-end (v2 - corrected API paths)
import { execSync } from "node:child_process";

const BASE = "http://localhost:3040";

function curl(url, options = {}) {
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

function curlWithCookies(url, options = {}) {
  const method = options.method || "GET";
  const headers = options.headers || {};
  const body = options.body || null;

  let cmd = `curl -s -w "\\n---HTTP_STATUS:%{http_code}---" -X ${method} -D -`;
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
    const parts = output.split("\r\n\r\n");
    const rawHeaders = parts[0] || "";
    const bodyAndStatus = parts.slice(1).join("\r\n\r\n");
    const statusMatch = bodyAndStatus.match(/---HTTP_STATUS:(\d+)---/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 0;
    const responseBody = bodyAndStatus.replace(/\n?---HTTP_STATUS:\d+---$/, "");
    const cookieLines = rawHeaders.split("\r\n").filter(l => l.toLowerCase().startsWith("set-cookie:"));
    const cookies = cookieLines.map(l => l.replace(/^set-cookie:\s*/i, "").split(";")[0]).join("; ");
    return { status, body: responseBody, cookies };
  } catch (err) {
    return { status: 0, body: err.message.substring(0, 200), cookies: "" };
  }
}

async function main() {
  // Step 1: Login
  console.log("=== STEP 1: LOGIN ===\n");
  const loginRes = curlWithCookies(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE,
      "Referer": `${BASE}/`,
    },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
  });
  console.log(`Login: ${loginRes.status} | Cookie: ${loginRes.cookies.substring(0, 60)}...`);
  if (loginRes.status !== 200 || !loginRes.cookies) {
    console.error("LOGIN FAILED");
    process.exit(1);
  }
  const cookie = loginRes.cookies;

  // Step 2: Session check
  const sessionRes = curl(`${BASE}/api/auth/get-session`, { headers: { Cookie: cookie } });
  console.log(`Session: ${sessionRes.status} OK\n`);

  // ============================================
  // CORRECTED API PATHS based on actual code
  // ============================================
  // Page 1: /dashboard/profile -> orpc.resume.list, orpc.interview.getSessions, orpc.training.getTrainingStats
  // Page 2: /dashboard/profile/achievements -> orpc.achievements.getUserAchievements
  // Page 3: /dashboard/progress -> orpc.studentProgress.getProgress, getActivityStats, getUserBadges, compareToCohort, getWeakAreas, getWeeklySnapshots
  // Page 4: /dashboard/settings/profile -> auth session only
  // Page 5: /dashboard/settings/preferences -> orpc.userSettings.getPreferredAiLanguage
  // Page 6: /dashboard/settings/authentication -> auth session only
  // Page 7: /dashboard/settings/data -> orpc.resume.list
  // Page 8: /dashboard/settings/danger-zone -> static
  // Page 9: /dashboard/settings/api-keys -> authClient.apiKey.list (/api/auth/api-key/list)
  // Page 10: /dashboard/settings/ai -> orpc.aiConfig.status.check

  const apiHeaders = { Cookie: cookie, Origin: BASE, Referer: `${BASE}/` };

  const tests = [
    {
      num: 1,
      page: "/dashboard/profile",
      pageLabel: "Profile",
      apis: [
        { path: "/api/rpc/resume/list", label: "resume.list", note: "needs input: {json:{tags:[],sort:'lastUpdatedAt'}}" },
        { path: "/api/rpc/interview/getSessions", label: "interview.getSessions" },
        { path: "/api/rpc/training/getTrainingStats", label: "training.getTrainingStats" },
      ],
    },
    {
      num: 2,
      page: "/dashboard/profile/achievements",
      pageLabel: "Achievements",
      apis: [
        { path: "/api/rpc/achievements/getUserAchievements", label: "achievements.getUserAchievements" },
      ],
    },
    {
      num: 3,
      page: "/dashboard/progress",
      pageLabel: "Progress",
      apis: [
        { path: "/api/rpc/studentProgress/getProgress", label: "studentProgress.getProgress" },
        { path: "/api/rpc/studentProgress/getActivityStats", label: "studentProgress.getActivityStats" },
        { path: "/api/rpc/studentProgress/getUserBadges", label: "studentProgress.getUserBadges" },
        { path: "/api/rpc/studentProgress/compareToCohort", label: "studentProgress.compareToCohort" },
        { path: "/api/rpc/studentProgress/getWeakAreas", label: "studentProgress.getWeakAreas" },
      ],
    },
    {
      num: 4,
      page: "/dashboard/settings/profile",
      pageLabel: "Settings/Profile",
      apis: [
        { path: "/api/auth/get-session", label: "auth/get-session" },
      ],
    },
    {
      num: 5,
      page: "/dashboard/settings/preferences",
      pageLabel: "Settings/Preferences",
      apis: [
        { path: "/api/rpc/userSettings/getPreferredAiLanguage", label: "userSettings.getPreferredAiLanguage" },
      ],
    },
    {
      num: 6,
      page: "/dashboard/settings/authentication",
      pageLabel: "Settings/Auth",
      apis: [
        { path: "/api/auth/get-session", label: "auth/get-session (auth page)" },
      ],
    },
    {
      num: 7,
      page: "/dashboard/settings/data",
      pageLabel: "Settings/Data",
      apis: [
        { path: "/api/rpc/resume/list", label: "resume.list (data page)" },
      ],
    },
    {
      num: 8,
      page: "/dashboard/settings/danger-zone",
      pageLabel: "Settings/DangerZone",
      apis: [],
    },
    {
      num: 9,
      page: "/dashboard/settings/api-keys",
      pageLabel: "Settings/APIKeys",
      apis: [
        { path: "/api/auth/api-key/list", label: "auth/api-key/list" },
      ],
    },
    {
      num: 10,
      page: "/dashboard/settings/ai",
      pageLabel: "Settings/AI",
      apis: [
        { path: "/api/rpc/aiConfig/status/check", label: "aiConfig.status.check" },
      ],
    },
  ];

  // ============================================
  // TEST ALL API ENDPOINTS
  // ============================================
  console.log("=== STEP 2: API ENDPOINT TESTS ===\n");

  const apiResults = {};
  for (const t of tests) {
    for (const api of t.apis) {
      // For ORPC GET endpoints, try with ?data= param for those that need input
      let url = `${BASE}${api.path}`;

      // Some endpoints require input parameters
      if (api.path.includes("resume/list")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: { tags: [], sort: "lastUpdatedAt" } }))}`;
      } else if (api.path.includes("getSessions")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: { limit: 5, offset: 0 } }))}`;
      } else if (api.path.includes("getActivityStats")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: { days: 30 } }))}`;
      } else if (api.path.includes("getWeeklySnapshots")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: { limit: 8 } }))}`;
      } else if (api.path.includes("getActivityLog")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: { limit: 10 } }))}`;
      } else if (api.path.includes("getProgress") || api.path.includes("getUserBadges") || api.path.includes("compareToCohort") || api.path.includes("getWeakAreas")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: {} }))}`;
      } else if (api.path.includes("getPreferredAiLanguage")) {
        url += `?data=${encodeURIComponent(JSON.stringify({ json: {} }))}`;
      }

      const res = curl(url, { headers: apiHeaders });
      apiResults[api.label] = res;
      const preview = res.body.substring(0, 120).replace(/\n/g, " ").replace(/\s+/g, " ");
      const statusIcon = res.status === 200 ? "PASS" : "FAIL";
      console.log(`[${res.status}] ${statusIcon} ${api.label}: ${preview}`);
    }
  }

  // ============================================
  // TEST ALL PAGE LOADS
  // ============================================
  console.log("\n=== STEP 3: PAGE RENDERING TESTS ===\n");

  const pageResults = {};
  for (const t of tests) {
    const res = curl(`${BASE}${t.page}`, {
      headers: { Cookie: cookie, Accept: "text/html" },
    });
    const isHTML = res.body.includes("<!DOCTYPE") || res.body.includes("<html");
    pageResults[t.page] = { ...res, isHTML };
    const statusIcon = res.status === 200 && isHTML ? "PASS" : "FAIL";
    console.log(`[${res.status}] ${statusIcon} ${t.pageLabel} (${t.page}): HTML=${isHTML}`);
  }

  // ============================================
  // FINAL SUMMARY TABLE
  // ============================================
  console.log("\n" + "=".repeat(160));
  console.log("FINAL REPORT: Settings & Profile Pages End-to-End Test");
  console.log("=".repeat(160));
  console.log("");

  console.log("| #  | Page                               | API Endpoint(s)                          | API Status | Page Status  | Issue                                |");
  console.log("|----|------------------------------------|-----------------------------------------|------------|--------------|--------------------------------------|");

  for (const t of tests) {
    const pg = pageResults[t.page];
    const pageStatusStr = pg ? (pg.status === 200 && pg.isHTML ? "200 OK" : `${pg.status} ${pg.isHTML ? "(HTML)" : "(no HTML)"}`) : "N/A";

    if (t.apis.length === 0) {
      const issue = pg && pg.status === 200 && pg.isHTML ? "OK" : `Page ${pg?.status}`;
      console.log(`| ${String(t.num).padEnd(2)} | ${t.page.padEnd(34)} | ${"N/A (static page)".padEnd(39)} | ${"N/A".padEnd(10)} | ${pageStatusStr.padEnd(12)} | ${issue.padEnd(36)} |`);
    } else {
      for (let j = 0; j < t.apis.length; j++) {
        const api = t.apis[j];
        const apiRes = apiResults[api.label];
        const apiStatus = apiRes ? apiRes.status : "???";

        let issue = "";
        if (apiRes && apiRes.status !== 200) {
          try {
            const parsed = JSON.parse(apiRes.body);
            issue = parsed.message || parsed.error || parsed.code || `HTTP ${apiRes.status}`;
          } catch {
            const textErr = apiRes.body.substring(0, 40).replace(/\n/g, " ");
            issue = `HTTP ${apiRes.status}: ${textErr}`;
          }
          issue = issue.substring(0, 36);
        }
        if (j === 0 && pg && (pg.status !== 200 || !pg.isHTML)) {
          issue += (issue ? " + " : "") + `Page ${pg.status}`;
          issue = issue.substring(0, 36);
        }
        if (!issue) issue = "OK";

        const numStr = j === 0 ? String(t.num) : "";
        const pageStr = j === 0 ? t.page : "  (continued)";
        const pgStatusStr2 = j === 0 ? pageStatusStr : "";

        console.log(`| ${numStr.padEnd(2)} | ${pageStr.padEnd(34)} | ${api.label.padEnd(39)} | ${String(apiStatus).padEnd(10)} | ${pgStatusStr2.padEnd(12)} | ${issue.padEnd(36)} |`);
      }
    }
  }

  // ============================================
  // SUMMARY STATS
  // ============================================
  console.log("");
  const allApiEntries = Object.entries(apiResults);
  const uniqueApis = allApiEntries.filter(([label]) => !label.includes("(data page)") && !label.includes("(auth page)"));
  const totalAPIs = uniqueApis.length;
  const passingAPIs = uniqueApis.filter(([, r]) => r.status === 200).length;
  const failingAPIs = totalAPIs - passingAPIs;
  const totalPages = Object.keys(pageResults).length;
  const passingPages = Object.values(pageResults).filter(r => r.status === 200 && r.isHTML).length;

  console.log(`APIs:  ${passingAPIs}/${totalAPIs} passing, ${failingAPIs} failing`);
  console.log(`Pages: ${passingPages}/${totalPages} passing (200 + HTML)`);

  // Show failing details
  if (failingAPIs > 0) {
    console.log("\n--- Failed API Details ---");
    for (const [label, res] of uniqueApis) {
      if (res.status !== 200) {
        console.log(`\n  [${res.status}] ${label}`);
        console.log(`  Response: ${res.body.substring(0, 300)}`);
      }
    }
  }

  const failingPageEntries = Object.entries(pageResults).filter(([, r]) => r.status !== 200 || !r.isHTML);
  if (failingPageEntries.length > 0) {
    console.log("\n--- Failed Page Details ---");
    for (const [path, res] of failingPageEntries) {
      console.log(`\n  [${res.status}] ${path} (HTML=${res.isHTML})`);
      console.log(`  Response: ${res.body.substring(0, 300)}`);
    }
  }

  // Success response previews
  console.log("\n--- Successful API Response Previews ---");
  for (const [label, res] of allApiEntries) {
    if (res.status === 200) {
      console.log(`\n  ${label}: ${res.body.substring(0, 200)}`);
    }
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
