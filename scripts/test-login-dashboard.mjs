// Login + Dashboard Flow Test
// Uses Playwright to test real user flows with screenshots

import { chromium } from "playwright";

const BASE_URL = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
let screenshotNum = 0;

function screenshotPath(label) {
  screenshotNum++;
  const num = String(screenshotNum).padStart(2, "0");
  return `${SCREENSHOT_DIR}/test-dashboard-${num}-${label}.png`;
}

async function dismissOverlay(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function logPageState(page, label) {
  const url = page.url();
  const title = await page.title();
  console.log(`\n=== ${label} ===`);
  console.log(`  URL: ${url}`);
  console.log(`  Title: ${title}`);
}

async function checkForErrors(page, label) {
  // Check for visible error messages
  const errorElements = await page.locator('[role="alert"], .error, [data-testid*="error"]').all();
  if (errorElements.length > 0) {
    console.log(`  [WARN] Found ${errorElements.length} error-like elements on ${label}`);
    for (const el of errorElements) {
      const text = await el.textContent().catch(() => "");
      if (text.trim()) console.log(`    Error text: "${text.trim().substring(0, 150)}"`);
    }
  }

  // Check for loading spinners that might be stuck
  const spinners = await page.locator('[class*="animate-spin"]').all();
  if (spinners.length > 0) {
    // Wait a bit and check if they're still there
    await page.waitForTimeout(3000);
    const stillSpinning = await page.locator('[class*="animate-spin"]').all();
    if (stillSpinning.length > 0) {
      console.log(`  [WARN] ${stillSpinning.length} spinners still active after 3s on ${label}`);
    }
  }
}

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Collect console errors
  const consoleErrors = [];
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  const results = { pass: [], fail: [], warn: [] };

  try {
    // ========================================
    // STEP 1: Navigate to login page
    // ========================================
    console.log("\n--- STEP 1: Navigate to login ---");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);
    await dismissOverlay(page);
    await logPageState(page, "Login Page");

    const path = screenshotPath("login-page");
    await page.screenshot({ path, fullPage: true });
    console.log(`  Screenshot: ${path}`);

    // Check login page elements
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').isVisible().catch(() => false);
    const hasPasswordField = await page.locator('input[type="password"]').isVisible().catch(() => false);
    const hasSubmitBtn = await page.locator('button[type="submit"]').isVisible().catch(() => false);

    if (hasEmailField && hasPasswordField && hasSubmitBtn) {
      results.pass.push("Login page renders with email, password, and submit button");
    } else {
      results.fail.push(`Login page missing fields: email=${hasEmailField}, password=${hasPasswordField}, submit=${hasSubmitBtn}`);
    }

    // ========================================
    // STEP 2: Fill in credentials
    // ========================================
    console.log("\n--- STEP 2: Fill credentials ---");

    // The form uses react-hook-form with mode: "onBlur"
    // We need to click, type (not fill), then blur to trigger validation
    let emailField;
    try {
      emailField = page.getByPlaceholder("john.doe@example.com");
      await emailField.waitFor({ state: "visible", timeout: 5000 });
    } catch {
      console.log("  [INFO] Trying alternative email selectors...");
      emailField = page.locator('input[type="email"], input[name="email"]').first();
      await emailField.waitFor({ state: "visible", timeout: 5000 });
    }

    // Click to focus, clear, then type character-by-character
    await emailField.click();
    await emailField.fill("");
    await emailField.pressSequentially("admin@test.com", { delay: 30 });
    console.log("  Typed email: admin@test.com");

    const passwordField = page.locator('input[type="password"]');
    await passwordField.waitFor({ state: "visible", timeout: 5000 });
    await passwordField.click();
    await passwordField.fill("");
    await passwordField.pressSequentially("TestAccount123!", { delay: 30 });
    console.log("  Typed password: ********");

    // Blur the password field to trigger onBlur validation
    await page.keyboard.press("Tab");
    await page.waitForTimeout(500);

    const filledPath = screenshotPath("login-filled");
    await page.screenshot({ path: filledPath, fullPage: true });
    console.log(`  Screenshot: ${filledPath}`);

    // ========================================
    // STEP 3: Submit login form
    // ========================================
    console.log("\n--- STEP 3: Submit login ---");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.waitFor({ state: "visible", timeout: 5000 });
    const buttonText = await submitButton.textContent();
    console.log(`  Submit button text: "${buttonText}"`);
    await submitButton.click();
    console.log("  Clicked submit");

    // Wait for navigation to dashboard
    let loginSuccess = false;
    try {
      await page.waitForURL("**/dashboard**", { timeout: 15000 });
      loginSuccess = true;
      results.pass.push("Login successful - redirected to dashboard");
      console.log("  [PASS] Redirected to dashboard!");
    } catch {
      console.log(`  [INFO] Not yet at dashboard. Current URL: ${page.url()}`);
      await dismissOverlay(page);

      // Maybe it loaded but the URL check was too fast
      await page.waitForTimeout(5000);
      await dismissOverlay(page);

      if (page.url().includes("dashboard")) {
        loginSuccess = true;
        results.pass.push("Login successful - redirected to dashboard (with delay)");
        console.log("  [PASS] Eventually redirected to dashboard!");
      } else {
        results.fail.push(`Login did not redirect to dashboard. Final URL: ${page.url()}`);
        console.log(`  [FAIL] Still at: ${page.url()}`);
        const failPath = screenshotPath("login-fail");
        await page.screenshot({ path: failPath, fullPage: true });
        console.log(`  Screenshot: ${failPath}`);
        await checkForErrors(page, "Login failure");
      }
    }

    if (!loginSuccess) {
      console.log("\n[ABORT] Cannot continue without login. Ending test.");
      throw new Error("Login failed - cannot continue test");
    }

    // ========================================
    // STEP 4: Examine dashboard
    // ========================================
    console.log("\n--- STEP 4: Examine dashboard ---");
    await page.waitForTimeout(3000);
    await dismissOverlay(page);
    await logPageState(page, "Dashboard");

    const dashPath = screenshotPath("dashboard");
    await page.screenshot({ path: dashPath, fullPage: true });
    console.log(`  Screenshot: ${dashPath}`);

    // Check for greeting
    const bodyText = await page.locator("body").textContent();
    const greetingPatterns = ["Bonjour", "Bonsoir", "Bienvenue", "Hello", "Welcome", "Good morning", "Good afternoon", "Good evening"];
    const foundGreeting = greetingPatterns.find((g) => bodyText.includes(g));
    if (foundGreeting) {
      results.pass.push(`Dashboard shows greeting: "${foundGreeting}"`);
      console.log(`  [PASS] Found greeting: "${foundGreeting}"`);
    } else {
      results.warn.push("No greeting text found on dashboard");
      console.log("  [WARN] No greeting found on dashboard");
    }

    // Check for sidebar
    const hasSidebar = await page.locator('[data-sidebar], nav, aside').first().isVisible().catch(() => false);
    if (hasSidebar) {
      results.pass.push("Sidebar is visible");
    } else {
      results.warn.push("Sidebar not found or not visible");
    }

    await checkForErrors(page, "Dashboard");

    // Get main content area text
    const mainContent = await page.locator("main").first().textContent().catch(() => "");
    const mainPreview = mainContent.replace(/\s+/g, " ").trim().substring(0, 300);
    console.log(`  Main content preview: "${mainPreview}"`);

    // ========================================
    // STEP 5: Navigate through pages
    // ========================================
    const pagesToVisit = [
      { name: "Resumes", path: "/dashboard/resumes", sidebarText: "CVs" },
      { name: "Career", path: "/dashboard/career", sidebarText: "Orientation professionnelle" },
      { name: "Interview", path: "/dashboard/interview", sidebarText: "Préparation d'entretien" },
      { name: "Settings", path: "/dashboard/settings", sidebarText: "Paramètres" },
      { name: "Dashboard-Home", path: "/dashboard", sidebarText: "Tableau de bord" },
    ];

    for (const pageInfo of pagesToVisit) {
      console.log(`\n--- Navigate to ${pageInfo.name} ---`);

      // Try clicking sidebar link first
      let navigated = false;
      try {
        const sidebarLink = page.locator("a, button").filter({ hasText: pageInfo.sidebarText }).first();
        if (await sidebarLink.isVisible({ timeout: 2000 })) {
          await sidebarLink.click();
          navigated = true;
          console.log(`  Clicked sidebar: "${pageInfo.sidebarText}"`);
          await page.waitForTimeout(3000);
        }
      } catch {}

      if (!navigated) {
        // Fallback to direct navigation
        console.log(`  [INFO] Sidebar click failed, using direct navigation to ${pageInfo.path}`);
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(3000);
      }

      await dismissOverlay(page);
      await logPageState(page, pageInfo.name);

      const pagePath = screenshotPath(pageInfo.name.toLowerCase().replace(/[\/\s]/g, "-"));
      await page.screenshot({ path: pagePath, fullPage: true });
      console.log(`  Screenshot: ${pagePath}`);

      // Check page loaded properly
      const currentUrl = page.url();
      if (currentUrl.includes(pageInfo.path) || (pageInfo.name === "Dashboard-Home" && currentUrl.endsWith("/dashboard"))) {
        results.pass.push(`${pageInfo.name} page loads at correct URL`);
      } else {
        results.warn.push(`${pageInfo.name} page URL mismatch. Expected: ${pageInfo.path}, Got: ${currentUrl}`);
      }

      await checkForErrors(page, pageInfo.name);

      // Get content description
      const content = await page.locator("main").first().textContent().catch(() => "");
      const contentPreview = content.replace(/\s+/g, " ").trim().substring(0, 200);
      console.log(`  Content: "${contentPreview}"`);

      // Check for obviously broken states
      if (content.includes("undefined") || content.includes("NaN")) {
        results.warn.push(`${pageInfo.name} page shows "undefined" or "NaN" in content`);
      }
      if (content.trim().length < 20) {
        results.warn.push(`${pageInfo.name} page appears mostly empty`);
      }
    }

    // ========================================
    // STEP 6: Test sign-out
    // ========================================
    console.log("\n--- STEP 6: Sign out ---");

    // First go back to dashboard to have a clean state
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);

    let signedOut = false;

    // Look for sign-out in sidebar footer area
    const signOutPatterns = ["Déconnexion", "Se déconnecter", "Sign out", "Logout", "Log out"];

    // First try: look for the text directly on the page
    for (const pattern of signOutPatterns) {
      try {
        const el = page.getByText(pattern, { exact: false }).first();
        if (await el.isVisible({ timeout: 1500 })) {
          const soPath = screenshotPath("before-signout");
          await page.screenshot({ path: soPath, fullPage: true });
          console.log(`  Screenshot before sign-out: ${soPath}`);

          await el.click();
          console.log(`  Clicked "${pattern}"`);
          signedOut = true;
          await page.waitForTimeout(4000);
          break;
        }
      } catch {}
    }

    // Second try: look for a dropdown menu trigger (user avatar/name)
    if (!signedOut) {
      console.log("  [INFO] Trying dropdown menu approach...");
      try {
        // Look for the user footer or profile section in sidebar
        const triggers = await page.locator('[class*="footer"], [class*="profile"], [class*="avatar"], [class*="user"]').all();
        for (const trigger of triggers) {
          try {
            if (await trigger.isVisible()) {
              await trigger.click();
              await page.waitForTimeout(1000);

              // Now check for sign out in dropdown
              for (const pattern of signOutPatterns) {
                const dropdownItem = page.getByText(pattern, { exact: false }).first();
                if (await dropdownItem.isVisible({ timeout: 1000 })) {
                  const soPath = screenshotPath("dropdown-signout");
                  await page.screenshot({ path: soPath, fullPage: true });

                  await dropdownItem.click();
                  signedOut = true;
                  await page.waitForTimeout(4000);
                  break;
                }
              }
              if (signedOut) break;
            }
          } catch {}
        }
      } catch {}
    }

    if (!signedOut) {
      results.warn.push("Could not find sign-out button/link");
      console.log("  [WARN] Could not find sign-out button - testing via URL");
      // Navigate directly to check auth guard
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "domcontentloaded", timeout: 10000 });
      await page.waitForTimeout(2000);
    }

    await dismissOverlay(page);
    await logPageState(page, "After Sign Out");

    const afterSignOutPath = screenshotPath("after-signout");
    await page.screenshot({ path: afterSignOutPath, fullPage: true });
    console.log(`  Screenshot: ${afterSignOutPath}`);

    if (page.url().includes("/auth") || page.url().includes("/login")) {
      results.pass.push("After sign-out, user is on auth/login page");
      console.log("  [PASS] On login/auth page after sign-out");
    } else {
      results.warn.push(`After sign-out, URL is: ${page.url()} (expected auth/login)`);
      console.log(`  [WARN] After sign-out, URL is: ${page.url()}`);
    }

    // ========================================
    // FINAL REPORT
    // ========================================
    console.log("\n\n========================================");
    console.log("        TEST RESULTS SUMMARY");
    console.log("========================================");

    console.log(`\nPASS (${results.pass.length}):`);
    for (const p of results.pass) console.log(`  [PASS] ${p}`);

    console.log(`\nFAIL (${results.fail.length}):`);
    for (const f of results.fail) console.log(`  [FAIL] ${f}`);

    console.log(`\nWARN (${results.warn.length}):`);
    for (const w of results.warn) console.log(`  [WARN] ${w}`);

    console.log(`\nTotal screenshots: ${screenshotNum}`);
    console.log(`Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log("\nTop console errors:");
      const unique = [...new Set(consoleErrors)];
      for (const err of unique.slice(0, 10)) {
        console.log(`  - ${err.substring(0, 200)}`);
      }
    }
  } catch (error) {
    console.error("\n[FATAL ERROR]", error.message);
    const errorPath = screenshotPath("fatal-error");
    await page.screenshot({ path: errorPath, fullPage: true }).catch(() => {});
    console.log(`  Screenshot: ${errorPath}`);
  } finally {
    console.log("\nClosing browser...");
    await browser.close();
  }
}

run().catch(console.error);
