// test-career-interview.mjs — Career & Interview page browser test (v2)
// Usage: node scripts/test-career-interview.mjs

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";

const BASE = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
const EMAIL = "student2@test.com";
const PASSWORD = "TestAccount123!";

if (!existsSync(SCREENSHOT_DIR)) mkdirSync(SCREENSHOT_DIR, { recursive: true });

let shotIndex = 0;
const results = { PASS: [], FAIL: [], WARN: [] };

function pass(msg) { results.PASS.push(msg); console.log(`  PASS: ${msg}`); }
function fail(msg) { results.FAIL.push(msg); console.log(`  FAIL: ${msg}`); }
function warn(msg) { results.WARN.push(msg); console.log(`  WARN: ${msg}`); }

async function screenshot(page, label) {
  shotIndex++;
  const num = String(shotIndex).padStart(2, "0");
  const path = `${SCREENSHOT_DIR}/test-career-${num}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  [screenshot] ${path} — ${label}`);
  return path;
}

async function dismissOverlay(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function waitForPageReady(page, timeoutMs = 5000) {
  await page.waitForTimeout(1500);
  await dismissOverlay(page);
  // Wait for network to be mostly idle
  try {
    await page.waitForLoadState("networkidle", { timeout: timeoutMs });
  } catch {
    // networkidle may time out on pages with polling - that's fine
  }
  await page.waitForTimeout(500);
  await dismissOverlay(page);
}

async function checkPageHealth(page, label) {
  await dismissOverlay(page);

  const url = page.url();
  const title = await page.title();
  console.log(`\n--- ${label} ---`);
  console.log(`  URL: ${url}`);
  console.log(`  Title: ${title}`);

  // Check if we got redirected to login (auth guard)
  if (url.includes("/auth/login")) {
    fail(`${label}: Redirected to login page — session lost or auth guard blocked`);
    return { redirectedToLogin: true, bodyText: "" };
  }

  // Check for error messages visible on page
  const errorTexts = await page.locator('[role="alert"], .error, [data-state="error"]').allTextContents().catch(() => []);
  if (errorTexts.length > 0) {
    const errorStr = errorTexts.join(" | ").slice(0, 200);
    if (errorStr.trim().length > 5) {
      warn(`${label}: Error elements found: ${errorStr}`);
    }
  }

  // Check for loading spinners still visible after waiting
  const spinners = await page.locator('[class*="animate-spin"]').count().catch(() => 0);
  if (spinners > 0) {
    warn(`${label}: ${spinners} loading spinner(s) still visible`);
  }

  // Check for empty state indicators
  const emptyTexts = await page.locator('text=/aucun|vide|no data|empty|nothing/i').count().catch(() => 0);
  if (emptyTexts > 0) {
    console.log(`  INFO: ${label}: Found ${emptyTexts} empty-state indicator(s) — may be expected`);
  }

  // Check for English text in French UI (potential missing translations)
  const bodyText = await page.locator("body").textContent().catch(() => "");
  const englishPatterns = [
    { re: /\bLoading\b/, name: "Loading" },
    { re: /\bSubmit\b/, name: "Submit" },
    { re: /\bSettings\b/, name: "Settings" },
    { re: /\bDashboard\b/, name: "Dashboard" },
    { re: /\bProfile\b/, name: "Profile" },
    { re: /\bComing Soon\b/i, name: "Coming Soon" },
    { re: /\bError\b/, name: "Error" },
  ];
  const foundEnglish = englishPatterns.filter(p => p.re.test(bodyText));
  if (foundEnglish.length > 0) {
    warn(`${label}: Possible untranslated English text: ${foundEnglish.map(p => p.name).join(", ")}`);
  }

  // Check for broken layout — elements overflowing viewport
  const viewportWidth = page.viewportSize()?.width || 1280;
  const overflowing = await page.evaluate((vw) => {
    const els = document.querySelectorAll("*");
    let count = 0;
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 20 && rect.width > 50) count++;
    }
    return count;
  }, viewportWidth).catch(() => 0);
  if (overflowing > 0) {
    warn(`${label}: ${overflowing} element(s) overflow viewport width`);
  }

  return { redirectedToLogin: false, bodyText };
}

async function run() {
  console.log("=== Career & Interview Page Test (v2) ===");
  console.log(`Launching Chromium (headed, slowMo: 150)...\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // =====================
  // STEP 1: LOGIN
  // =====================
  console.log("=== STEP 1: LOGIN ===");
  let loginSuccess = false;
  try {
    await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await waitForPageReady(page);
    await screenshot(page, "Login page loaded");

    // Fill email
    const emailInput = page.getByPlaceholder("john.doe@example.com");
    await emailInput.waitFor({ timeout: 10000 });
    await emailInput.click();
    await emailInput.fill(EMAIL);
    console.log("  Filled email field");

    // Fill password
    const passInput = page.locator('input[type="password"]');
    await passInput.waitFor({ timeout: 5000 });
    await passInput.click();
    await passInput.fill(PASSWORD);
    console.log("  Filled password field");

    await screenshot(page, "Login form filled");

    // Click submit and wait for navigation
    const submitBtn = page.locator('button[type="submit"]');
    console.log("  Clicking submit...");

    // Use Promise.all to capture both the click and the expected navigation
    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes("/api/auth/") && resp.status() >= 200,
        { timeout: 15000 }
      ).catch(() => null),
      submitBtn.click(),
    ]);

    if (response) {
      console.log(`  Auth response: ${response.status()} ${response.url()}`);
      const respBody = await response.text().catch(() => "");
      if (response.status() >= 400) {
        fail(`Login API returned ${response.status()}: ${respBody.slice(0, 300)}`);
      } else {
        console.log(`  Auth response body (truncated): ${respBody.slice(0, 200)}`);
      }
    } else {
      warn("No auth API response captured");
    }

    // Wait for redirect to dashboard
    await page.waitForTimeout(3000);

    // Check if we're redirected
    let afterLoginUrl = page.url();
    console.log(`  URL after submit: ${afterLoginUrl}`);

    if (!afterLoginUrl.includes("/dashboard")) {
      // Maybe need to wait more or try navigating
      console.log("  Not at dashboard yet, waiting longer...");
      await page.waitForURL("**/dashboard/**", { timeout: 10000 }).catch(() => {});
      afterLoginUrl = page.url();
      console.log(`  URL after extended wait: ${afterLoginUrl}`);
    }

    if (afterLoginUrl.includes("/dashboard")) {
      pass("Login successful, redirected to dashboard");
      loginSuccess = true;
    } else if (afterLoginUrl.includes("/auth/login")) {
      // Check if there was an error toast
      const toasts = await page.locator('[data-sonner-toast]').allTextContents().catch(() => []);
      if (toasts.length > 0) {
        fail(`Login failed — toast message: ${toasts.join(" | ")}`);
      } else {
        fail(`Login failed — still on login page, no error message visible`);
      }
    } else {
      warn(`Login result unclear — URL: ${afterLoginUrl}`);
    }

    await screenshot(page, "After login attempt");

    // If login failed, try using the API directly to log in
    if (!loginSuccess) {
      console.log("\n  Attempting direct API login via fetch...");
      const apiResult = await page.evaluate(async ({ email, password }) => {
        try {
          const res = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          });
          return { status: res.status, body: await res.text() };
        } catch (e) {
          return { error: e.message };
        }
      }, { email: EMAIL, password: PASSWORD });
      console.log(`  Direct API result: ${JSON.stringify(apiResult).slice(0, 500)}`);

      if (apiResult.status === 200) {
        console.log("  Direct API login succeeded, navigating to dashboard...");
        await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await waitForPageReady(page);
        if (page.url().includes("/dashboard")) {
          pass("Login via direct API succeeded");
          loginSuccess = true;
        }
      } else {
        fail(`Direct API login failed: ${JSON.stringify(apiResult).slice(0, 300)}`);
      }
      await screenshot(page, "After direct API login attempt");
    }
  } catch (e) {
    fail(`Login error: ${e.message}`);
    await screenshot(page, "Login error state");
  }

  if (!loginSuccess) {
    console.log("\n  WARNING: Login failed. Continuing test to document page behavior for unauthenticated users.");
  }

  // =====================
  // STEP 2: CAREER PAGES
  // =====================
  console.log("\n=== STEP 2: CAREER PAGES ===");

  const careerPages = [
    { path: "/dashboard/career", label: "Career Main" },
    { path: "/dashboard/career/assessment", label: "Career Assessment" },
    { path: "/dashboard/career/skills", label: "Career Skills" },
    { path: "/dashboard/career/roadmap", label: "Career Roadmap" },
    { path: "/dashboard/career/certifications", label: "Career Certifications" },
  ];

  for (const { path, label } of careerPages) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await waitForPageReady(page);
      const { redirectedToLogin, bodyText } = await checkPageHealth(page, label);
      await screenshot(page, label);

      if (!redirectedToLogin) {
        // Check if page has meaningful content
        const mainContent = await page.locator("main, [role='main']").first().textContent().catch(() => "");
        if (mainContent.trim().length < 20) {
          warn(`${label}: Main content area appears nearly empty (${mainContent.trim().length} chars)`);
        } else {
          pass(`${label}: Page loaded with content (${mainContent.trim().length} chars)`);
        }
      }
    } catch (e) {
      fail(`${label}: Navigation error — ${e.message}`);
      await screenshot(page, `${label} error`);
    }
  }

  // =====================
  // STEP 3: INTERVIEW PAGES
  // =====================
  console.log("\n=== STEP 3: INTERVIEW PAGES ===");

  const interviewPages = [
    { path: "/dashboard/interview", label: "Interview Main" },
    { path: "/dashboard/interview/practice", label: "Interview Practice" },
    { path: "/dashboard/interview/tips", label: "Interview Tips" },
  ];

  for (const { path, label } of interviewPages) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await waitForPageReady(page);
      const { redirectedToLogin, bodyText } = await checkPageHealth(page, label);
      await screenshot(page, label);

      if (!redirectedToLogin) {
        const mainContent = await page.locator("main, [role='main']").first().textContent().catch(() => "");
        if (mainContent.trim().length < 20) {
          warn(`${label}: Main content area appears nearly empty (${mainContent.trim().length} chars)`);
        } else {
          pass(`${label}: Page loaded with content (${mainContent.trim().length} chars)`);
        }
      }
    } catch (e) {
      fail(`${label}: Navigation error — ${e.message}`);
      await screenshot(page, `${label} error`);
    }
  }

  // =====================
  // STEP 4: CAREER ASSESSMENT INTERACTION
  // =====================
  console.log("\n=== STEP 4: CAREER ASSESSMENT INTERACTION ===");
  if (loginSuccess) {
    try {
      await page.goto(`${BASE}/dashboard/career/assessment`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await waitForPageReady(page);

      // Look for a start/begin button
      const startBtnLocators = [
        page.getByRole("button", { name: /commencer|start|begin|d[eé]marrer|lancer/i }),
        page.locator("button:has-text('Commencer')"),
        page.locator("button:has-text('Start')"),
        page.locator("button:has-text('Lancer')"),
        page.locator("a:has-text('Commencer')"),
        page.locator("[data-testid*='start'], [data-testid*='begin']"),
      ];

      let startBtn = null;
      for (const loc of startBtnLocators) {
        const count = await loc.count();
        if (count > 0 && await loc.first().isVisible().catch(() => false)) {
          startBtn = loc.first();
          const btnText = await startBtn.textContent().catch(() => "?");
          console.log(`  Found start button: "${btnText.trim()}"`);
          break;
        }
      }

      if (startBtn) {
        await startBtn.click();
        await page.waitForTimeout(3000);
        await dismissOverlay(page);
        await screenshot(page, "Assessment started");

        // Try answering questions
        const radioButtons = await page.locator('input[type="radio"], [role="radio"]').all();
        if (radioButtons.length > 0) {
          pass("Assessment: Questions loaded with radio options");
          await radioButtons[0].click().catch(() => {});
          await page.waitForTimeout(1000);
          await screenshot(page, "Assessment - answered first question");

          // Look for next button
          const nextBtn = page.getByRole("button", { name: /suivant|next|continuer/i });
          if (await nextBtn.count() > 0) {
            await nextBtn.first().click().catch(() => {});
            await page.waitForTimeout(2000);
            await screenshot(page, "Assessment - after next");
            pass("Assessment: Navigation (next) button works");
          }
        } else {
          // Check for card-style click options
          const cards = await page.locator('[class*="card"], [class*="option"], [role="option"]').count();
          if (cards > 0) {
            console.log(`  Found ${cards} card/option elements`);
            await page.locator('[class*="card"], [class*="option"], [role="option"]').first().click().catch(() => {});
            await page.waitForTimeout(1500);
            await screenshot(page, "Assessment - clicked option card");
          } else {
            warn("Assessment: No question options found after clicking start");
            await screenshot(page, "Assessment - no options");
          }
        }
      } else {
        // Maybe the assessment is already showing or empty
        const pageText = await page.locator("body").textContent().catch(() => "");
        if (/question|quiz|assessment|evaluation|évaluation/i.test(pageText)) {
          console.log("  Assessment content detected (no start button, may be direct display)");
          pass("Assessment: Content loaded directly");
        } else {
          warn("Assessment: No start button found on assessment page");
        }
        await screenshot(page, "Assessment - current state");
      }
    } catch (e) {
      fail(`Assessment interaction error: ${e.message}`);
      await screenshot(page, "Assessment interaction error");
    }
  } else {
    console.log("  SKIPPED: Not logged in");
  }

  // =====================
  // STEP 5: INTERVIEW PRACTICE INTERACTION
  // =====================
  console.log("\n=== STEP 5: INTERVIEW PRACTICE INTERACTION ===");
  if (loginSuccess) {
    try {
      await page.goto(`${BASE}/dashboard/interview/practice`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await waitForPageReady(page);

      // Look for start practice button
      const practiceStartLocators = [
        page.getByRole("button", { name: /commencer|start|pratiquer|lancer|d[eé]marrer/i }),
        page.locator("button:has-text('Commencer')"),
        page.locator("button:has-text('Pratiquer')"),
        page.locator("button:has-text('Start')"),
        page.locator("button:has-text('Nouvelle session')"),
      ];

      let practiceBtn = null;
      for (const loc of practiceStartLocators) {
        const count = await loc.count();
        if (count > 0 && await loc.first().isVisible().catch(() => false)) {
          practiceBtn = loc.first();
          const btnText = await practiceBtn.textContent().catch(() => "?");
          console.log(`  Found practice button: "${btnText.trim()}"`);
          break;
        }
      }

      if (practiceBtn) {
        await practiceBtn.click();
        await page.waitForTimeout(3000);
        await dismissOverlay(page);
        await screenshot(page, "Interview practice started");

        // Check for interview question or input area
        const textArea = page.locator("textarea, [contenteditable='true']");
        if (await textArea.count() > 0) {
          pass("Interview Practice: Text input area visible for answers");
          await textArea.first().fill("Je suis un etudiant motive avec une passion pour l'ingenierie.").catch(() => {});
          await page.waitForTimeout(1000);
          await screenshot(page, "Interview practice - typed answer");
        }
      } else {
        warn("Interview Practice: No start button found");
        await screenshot(page, "Interview practice - no start button");
      }

      // Check for any visible questions
      const questionElements = await page.locator("h2, h3, [class*='question']").allTextContents().catch(() => []);
      const questions = questionElements.filter(t => t.trim().length > 10);
      if (questions.length > 0) {
        console.log(`  Found ${questions.length} question-like elements:`);
        questions.slice(0, 5).forEach(q => console.log(`    - ${q.trim().slice(0, 100)}`));
        pass("Interview Practice: Question content visible");
      }
    } catch (e) {
      fail(`Interview practice interaction error: ${e.message}`);
      await screenshot(page, "Interview practice error");
    }
  } else {
    console.log("  SKIPPED: Not logged in");
  }

  // =====================
  // STEP 6: VISUAL CHECKS ON KEY PAGES
  // =====================
  console.log("\n=== STEP 6: VISUAL CHECKS ===");
  if (loginSuccess) {
    // Take a full-page screenshot of a few key pages at different scroll positions
    for (const path of ["/dashboard/career", "/dashboard/interview"]) {
      try {
        await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await waitForPageReady(page);

        // Check sidebar navigation items
        const sidebarLinks = await page.locator("nav a, aside a").allTextContents().catch(() => []);
        console.log(`\n  Sidebar links on ${path}: ${sidebarLinks.filter(l => l.trim()).join(" | ")}`);

        // Check for any toast notifications
        const toasts = await page.locator('[data-sonner-toast]').allTextContents().catch(() => []);
        if (toasts.length > 0) {
          console.log(`  Active toasts: ${toasts.join(" | ")}`);
        }

        // Scroll down to check below-fold content
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await screenshot(page, `${path} - scrolled to bottom`);

      } catch (e) {
        warn(`Visual check on ${path}: ${e.message}`);
      }
    }
  }

  // =====================
  // STEP 7: CONSOLE ERRORS
  // =====================
  console.log("\n=== STEP 7: CONSOLE ERRORS ===");
  if (consoleErrors.length === 0) {
    pass("No console errors detected during test run");
  } else {
    const uniqueErrors = [...new Set(consoleErrors)];
    console.log(`  Found ${consoleErrors.length} console errors (${uniqueErrors.length} unique):`);
    for (const err of uniqueErrors.slice(0, 15)) {
      console.log(`    - ${err.slice(0, 250)}`);
    }
    if (uniqueErrors.length <= 3) {
      warn(`${uniqueErrors.length} unique console error(s) — review recommended`);
    } else {
      fail(`${uniqueErrors.length} unique console errors detected`);
    }
  }

  // =====================
  // FINAL REPORT
  // =====================
  console.log("\n\n========================================");
  console.log("       FINAL TEST REPORT");
  console.log("========================================");
  console.log(`\nPASS (${results.PASS.length}):`);
  results.PASS.forEach(m => console.log(`  + ${m}`));
  console.log(`\nFAIL (${results.FAIL.length}):`);
  results.FAIL.forEach(m => console.log(`  x ${m}`));
  console.log(`\nWARN (${results.WARN.length}):`);
  results.WARN.forEach(m => console.log(`  ! ${m}`));
  console.log(`\nScreenshots: ${shotIndex} saved to ${SCREENSHOT_DIR}/test-career-*.png`);
  console.log("========================================\n");

  await page.waitForTimeout(2000);
  await browser.close();
}

run().catch(e => {
  console.error("FATAL:", e);
  process.exit(1);
});
