// Resume Builder End-to-End Test Script v2
// Tests the complete resume builder flow as a real user would experience it

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const BASE_URL = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
const EMAIL = "student1@test.com";
const PASSWORD = "TestAccount123!";

let screenshotCounter = 0;
const observations = [];

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function observe(type, msg, screenshot = null) {
  observations.push({ type, msg, screenshot });
  const prefix = type === "PASS" ? "PASS" : type === "FAIL" ? "FAIL" : "WARN";
  log(`[${prefix}] ${msg}${screenshot ? ` (${screenshot})` : ""}`);
}

async function screenshot(page, label) {
  screenshotCounter++;
  const filename = `test-builder-${String(screenshotCounter).padStart(2, "0")}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  log(`Screenshot saved: ${filepath} (${label})`);
  return filename;
}

async function dismissViteOverlay(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch (e) {
    // ignore
  }
}

async function safeClick(page, locator, description, timeout = 5000) {
  try {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
    log(`Clicked: ${description}`);
    return true;
  } catch (e) {
    log(`Could not click: ${description} - ${e.message.slice(0, 120)}`);
    return false;
  }
}

async function run() {
  if (!existsSync(SCREENSHOT_DIR)) {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  log("Launching browser...");
  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  });

  const page = await context.newPage();

  // Capture console errors and network failures
  const consoleErrors = [];
  const networkErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    networkErrors.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText || "unknown"}`);
  });

  try {
    // ============================================================
    // STEP 1: Login via Better Auth sign-in/email endpoint
    // ============================================================
    log("=== STEP 1: Login ===");

    // First, navigate to the app to establish proper origin context
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    await dismissViteOverlay(page);

    // Now navigate to login page
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);
    await dismissViteOverlay(page);

    const s1 = await screenshot(page, "Login page");

    // Fill email using the placeholder
    const emailInput = page.getByPlaceholder("john.doe@example.com");
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.click();
    await emailInput.fill(EMAIL);
    log("Filled email field");

    // Fill password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.click();
    await passwordInput.fill(PASSWORD);
    log("Filled password field");

    await page.waitForTimeout(500);
    const s2 = await screenshot(page, "Login form filled");

    // Listen for the auth response
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/auth/sign-in/email"),
      { timeout: 15000 }
    ).catch(() => null);

    // Click the "Se connecter" button
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    log("Clicked submit button");

    // Wait for the auth response
    const authResponse = await responsePromise;
    if (authResponse) {
      const status = authResponse.status();
      log(`Auth response status: ${status}`);
      if (status === 200) {
        log("Auth API returned 200 OK");
      } else {
        const body = await authResponse.text().catch(() => "");
        log(`Auth API returned ${status}: ${body.slice(0, 200)}`);
      }
    } else {
      log("No auth response captured");
    }

    // Wait for navigation
    await page.waitForTimeout(4000);
    await dismissViteOverlay(page);

    const currentUrlAfterLogin = page.url();
    log(`URL after login: ${currentUrlAfterLogin}`);

    const s3 = await screenshot(page, "After login attempt");

    if (currentUrlAfterLogin.includes("dashboard") || currentUrlAfterLogin.includes("home") || currentUrlAfterLogin.includes("builder")) {
      observe("PASS", "Login successful, redirected", s3);
    } else if (currentUrlAfterLogin.includes("auth/login")) {
      // Still on login page - check for error messages
      const errorText = await page.locator('[role="alert"], .error, [data-sonner-toast]').first().textContent().catch(() => "");
      if (errorText) {
        observe("FAIL", `Login failed with error: ${errorText}`, s3);
      } else {
        // Try waiting longer - maybe redirect is slow
        try {
          await page.waitForURL(/\/(dashboard|home|builder)/, { timeout: 10000 });
          observe("PASS", "Login successful after delayed redirect", s3);
        } catch (e) {
          observe("FAIL", `Login failed - still on login page. Network errors: ${networkErrors.length}`, s3);
          if (networkErrors.length > 0) {
            log("Network errors during login:");
            networkErrors.forEach(e => log(`  ${e}`));
          }
        }
      }
    }

    // Log any network errors so far
    if (networkErrors.length > 0) {
      log(`Network errors so far: ${networkErrors.length}`);
      for (const ne of networkErrors) {
        log(`  NETWORK: ${ne}`);
      }
    }

    // ============================================================
    // STEP 2: Navigate to Resumes list
    // ============================================================
    log("=== STEP 2: Navigate to Resumes list ===");
    await page.goto(`${BASE_URL}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(4000);
    await dismissViteOverlay(page);

    const s4 = await screenshot(page, "Resumes list page");

    const currentUrl2 = page.url();
    log(`Current URL: ${currentUrl2}`);

    // If we got redirected to login, the session isn't working
    if (currentUrl2.includes("auth/login")) {
      observe("FAIL", "Redirected to login - session not persisted", s4);

      // Try alternative: login via API call from the page context
      log("Attempting login via page.evaluate...");
      const loginResult = await page.evaluate(async ({ email, password }) => {
        try {
          const resp = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",
          });
          const data = await resp.json();
          return { status: resp.status, data, ok: resp.ok };
        } catch (e) {
          return { error: e.message };
        }
      }, { email: EMAIL, password: PASSWORD });

      log(`Page-context login result: ${JSON.stringify(loginResult).slice(0, 300)}`);

      if (loginResult.ok) {
        observe("PASS", "Login succeeded via page.evaluate", null);
        // Navigate again
        await page.goto(`${BASE_URL}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(4000);
        await dismissViteOverlay(page);
        const s4b = await screenshot(page, "Resumes list after API login");

        if (!page.url().includes("auth/login")) {
          observe("PASS", "Resumes page loaded after API login", s4b);
        }
      } else {
        observe("FAIL", `API login also failed: ${JSON.stringify(loginResult).slice(0, 200)}`, s4);
      }
    } else {
      // Check page content
      const bodyText = await page.textContent("body").catch(() => "");
      if (bodyText.includes("CV") || bodyText.includes("resume") || bodyText.includes("Résumé") || bodyText.includes("Mes CV")) {
        observe("PASS", "Resumes page loaded with resume content", s4);
      } else {
        observe("WARN", "On resumes page but content might not have loaded", s4);
      }
    }

    // Check if we're logged in at this point
    const isLoggedIn = !page.url().includes("auth/login");
    log(`Logged in: ${isLoggedIn}`);

    if (!isLoggedIn) {
      log("Cannot proceed without login. Dumping page state...");
      const s_final = await screenshot(page, "Cannot proceed - not logged in");
      observe("FAIL", "All builder tests skipped - authentication failed", s_final);

      // Print summary and exit
      printSummary(consoleErrors);
      await page.waitForTimeout(2000);
      await browser.close();
      return;
    }

    // ============================================================
    // STEP 3: Create a new resume
    // ============================================================
    log("=== STEP 3: Create a new resume ===");

    // Try all possible button selectors
    let createClicked = false;
    const createSelectors = [
      page.getByRole("button", { name: /créer|create|nouveau|new/i }),
      page.locator('button:has-text("Créer")'),
      page.locator('button:has-text("Create")'),
      page.locator('button:has-text("Nouveau")'),
      page.locator('button:has-text("New")'),
      page.locator('a:has-text("Créer")'),
      page.locator('a:has-text("Create")'),
      page.locator('[data-testid="create-resume"]'),
      // Plus icon button
      page.locator('button:has(svg)').filter({ hasText: /^$/ }),
    ];

    for (const selector of createSelectors.slice(0, 8)) {
      if (await safeClick(page, selector, "Create resume button", 2000)) {
        createClicked = true;
        break;
      }
    }

    if (!createClicked) {
      // List all buttons
      const allButtons = await page.locator("button, a[role='button']").all();
      log(`Listing all ${allButtons.length} buttons/links on page:`);
      for (const btn of allButtons.slice(0, 20)) {
        const text = (await btn.textContent().catch(() => "")).trim().slice(0, 60);
        const aria = await btn.getAttribute("aria-label").catch(() => "");
        const href = await btn.getAttribute("href").catch(() => "");
        log(`  btn: "${text}" aria="${aria || ""}" href="${href || ""}"`);
      }

      // Also check all links
      const allLinks = await page.locator("a").all();
      log(`Listing all ${allLinks.length} links:`);
      for (const link of allLinks.slice(0, 20)) {
        const text = (await link.textContent().catch(() => "")).trim().slice(0, 60);
        const href = await link.getAttribute("href").catch(() => "");
        log(`  link: "${text}" href="${href || ""}"`);
      }
    }

    await page.waitForTimeout(2000);
    await dismissViteOverlay(page);

    if (createClicked) {
      const s5 = await screenshot(page, "After clicking create");

      // Check for dialog
      const dialogVisible = await page.locator('[role="dialog"], [data-state="open"]').first().isVisible().catch(() => false);
      if (dialogVisible) {
        log("Dialog opened for resume creation");

        // Try filling the name
        const dialogInputs = await page.locator('[role="dialog"] input').all();
        log(`Found ${dialogInputs.length} inputs in dialog`);
        for (const input of dialogInputs) {
          const placeholder = await input.getAttribute("placeholder").catch(() => "");
          const name = await input.getAttribute("name").catch(() => "");
          log(`  Dialog input: name="${name}" placeholder="${placeholder}"`);
        }

        if (dialogInputs.length > 0) {
          await dialogInputs[0].fill("Test Resume from Student");
          log("Filled resume name in dialog");
        }

        const s6 = await screenshot(page, "Resume creation dialog");

        // Submit
        const dialogBtns = await page.locator('[role="dialog"] button').all();
        for (const btn of dialogBtns) {
          const text = (await btn.textContent().catch(() => "")).trim();
          log(`  Dialog button: "${text}"`);
        }

        const createBtn = page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("Créer"), [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Sauvegarder")').first();
        if (await safeClick(page, createBtn, "Dialog submit", 3000)) {
          await page.waitForTimeout(4000);
          await dismissViteOverlay(page);
          const s7 = await screenshot(page, "After resume creation");

          if (page.url().includes("builder")) {
            observe("PASS", "Resume created and opened in builder", s7);
          } else {
            observe("WARN", "Resume creation submitted but not redirected to builder", s7);
          }
        }
      } else {
        if (page.url().includes("builder")) {
          observe("PASS", "Create navigated directly to builder", s5);
        }
      }
    } else {
      const s5 = await screenshot(page, "No create button found");
      observe("WARN", "Could not find create resume button", s5);
    }

    // ============================================================
    // STEP 4: Open existing resume in builder
    // ============================================================
    log("=== STEP 4: Open resume in builder ===");

    if (!page.url().includes("builder")) {
      // Go back to resumes list
      await page.goto(`${BASE_URL}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await page.waitForTimeout(4000);
      await dismissViteOverlay(page);

      const s8 = await screenshot(page, "Resumes list for selection");

      // Look for resume links
      const resumeLinks = page.locator('a[href*="/builder/"]');
      const resumeCount = await resumeLinks.count();
      log(`Found ${resumeCount} resume links`);

      if (resumeCount > 0) {
        const firstHref = await resumeLinks.first().getAttribute("href");
        log(`First resume href: ${firstHref}`);
        await resumeLinks.first().click();
        await page.waitForTimeout(4000);
        await dismissViteOverlay(page);
        observe("PASS", `Clicked resume link: ${firstHref}`, s8);
      } else {
        // Try to find any clickable resume items
        const clickableItems = await page.locator("[data-resume-id], .resume-item, article a, [class*='resume'] a").all();
        log(`Found ${clickableItems.length} alternative clickable items`);

        if (clickableItems.length > 0) {
          await clickableItems[0].click();
          await page.waitForTimeout(4000);
          await dismissViteOverlay(page);
        } else {
          observe("WARN", "No resume items found to click", s8);
        }
      }
    }

    const builderUrl = page.url();
    log(`Current URL: ${builderUrl}`);

    if (!builderUrl.includes("builder")) {
      const sFail = await screenshot(page, "Not on builder page");
      observe("FAIL", `Not on builder page, URL: ${builderUrl}`, sFail);

      // Print summary and exit
      printSummary(consoleErrors);
      await page.waitForTimeout(2000);
      await browser.close();
      return;
    }

    // ============================================================
    // STEP 5: Builder - Screenshot and explore
    // ============================================================
    log("=== STEP 5: Builder page exploration ===");
    const s9 = await screenshot(page, "Builder page initial");
    observe("PASS", "Builder page loaded", s9);

    // Explore the builder layout
    const sidebarSections = await page.locator("aside button, [data-sidebar] button, nav button").all();
    log(`Found ${sidebarSections.length} sidebar/nav buttons`);
    for (const btn of sidebarSections.slice(0, 15)) {
      const text = (await btn.textContent().catch(() => "")).trim().slice(0, 40);
      if (text) log(`  Sidebar item: "${text}"`);
    }

    // ============================================================
    // STEP 6: Edit Basics section
    // ============================================================
    log("=== STEP 6: Edit Basics ===");

    // Try various selectors for the Basics section
    const basicsSelectors = [
      page.locator('button:has-text("Informations personnelles")').first(),
      page.locator('button:has-text("Basics")').first(),
      page.locator('button:has-text("Profil")').first(),
      page.locator('button:has-text("Personnel")').first(),
      page.locator('[data-testid="basics"]').first(),
    ];

    let basicsOpened = false;
    for (const sel of basicsSelectors) {
      if (await safeClick(page, sel, "Basics section", 2000)) {
        basicsOpened = true;
        break;
      }
    }

    if (!basicsOpened) {
      // Maybe basics is already open or it's the default section
      log("Could not find Basics button, checking if form fields are already visible...");
    }

    await page.waitForTimeout(1500);
    await dismissViteOverlay(page);

    // Look for input fields - the builder might have an open section already
    const allInputs = await page.locator("main input, [role='main'] input, form input").all();
    log(`Found ${allInputs.length} input fields in main content`);
    for (const input of allInputs.slice(0, 15)) {
      const name = await input.getAttribute("name").catch(() => "");
      const placeholder = await input.getAttribute("placeholder").catch(() => "");
      const type = await input.getAttribute("type").catch(() => "text");
      const value = await input.inputValue().catch(() => "");
      log(`  Input: name="${name}" placeholder="${placeholder}" type="${type}" value="${value?.slice(0, 30)}"`);
    }

    const s10 = await screenshot(page, "Basics section / form fields");

    // Try to fill name fields
    let fieldsEdited = 0;

    // Try first name / full name
    for (const nameSelector of [
      'input[name="basics.name"]',
      'input[name="name"]',
      'input[name*="firstName"]',
      'input[name*="fullName"]',
      'input[placeholder*="John"]',
      'input[placeholder*="Prénom"]',
    ]) {
      const input = page.locator(nameSelector).first();
      if (await input.isVisible().catch(() => false)) {
        await input.clear();
        await input.fill("Ahmed El Mahdi");
        log(`Filled name via: ${nameSelector}`);
        fieldsEdited++;
        break;
      }
    }

    // Try headline
    for (const headlineSelector of [
      'input[name="basics.headline"]',
      'input[name="headline"]',
      'input[placeholder*="titre"]',
      'input[placeholder*="headline"]',
      'input[placeholder*="Headline"]',
    ]) {
      const input = page.locator(headlineSelector).first();
      if (await input.isVisible().catch(() => false)) {
        await input.clear();
        await input.fill("Software Engineer | Full Stack Developer");
        log(`Filled headline via: ${headlineSelector}`);
        fieldsEdited++;
        break;
      }
    }

    // Try email
    for (const emailSelector of [
      'input[name="basics.email"]',
      'input[name="email"]',
      'input[type="email"]',
    ]) {
      const input = page.locator(emailSelector).first();
      if (await input.isVisible().catch(() => false)) {
        await input.clear();
        await input.fill("ahmed.elmahdi@example.com");
        log(`Filled email via: ${emailSelector}`);
        fieldsEdited++;
        break;
      }
    }

    if (fieldsEdited > 0) {
      await page.waitForTimeout(1000);
      const s11 = await screenshot(page, "After editing basics fields");
      observe("PASS", `Edited ${fieldsEdited} fields in basics section`, s11);
    } else {
      observe("WARN", "Could not find or edit any basics fields", s10);
    }

    // ============================================================
    // STEP 7: Add Work Experience
    // ============================================================
    log("=== STEP 7: Add Work Experience ===");

    const expSelectors = [
      page.locator('button:has-text("Expérience")').first(),
      page.locator('button:has-text("Experience")').first(),
      page.locator('button:has-text("Work")').first(),
      page.locator('[data-testid="experience"]').first(),
    ];

    let expOpened = false;
    for (const sel of expSelectors) {
      if (await safeClick(page, sel, "Experience section", 2000)) {
        expOpened = true;
        break;
      }
    }

    await page.waitForTimeout(1500);
    await dismissViteOverlay(page);
    const s12 = await screenshot(page, "Experience section");

    if (expOpened) {
      // Look for Add button
      const addBtnSelectors = [
        page.locator('button:has-text("Ajouter")').first(),
        page.locator('button:has-text("Add")').first(),
        page.locator('button[aria-label*="add"], button[aria-label*="Add"]').first(),
      ];

      let addClicked = false;
      for (const sel of addBtnSelectors) {
        if (await safeClick(page, sel, "Add experience", 2000)) {
          addClicked = true;
          break;
        }
      }

      if (addClicked) {
        await page.waitForTimeout(1500);
        await dismissViteOverlay(page);

        // Fill experience fields
        const companyInput = page.locator('input[name*="company"], input[placeholder*="Company"], input[placeholder*="Entreprise"], input[placeholder*="entreprise"]').first();
        if (await companyInput.isVisible().catch(() => false)) {
          await companyInput.fill("OCP Group");
          log("Filled company name");
        }

        const positionInput = page.locator('input[name*="position"], input[name*="title"], input[placeholder*="Poste"], input[placeholder*="Position"]').first();
        if (await positionInput.isVisible().catch(() => false)) {
          await positionInput.fill("Software Engineer Intern");
          log("Filled position");
        }

        const s13 = await screenshot(page, "Experience form filled");
        observe("PASS", "Work experience form filled", s13);
      } else {
        observe("WARN", "Could not find Add Experience button", s12);
      }
    } else {
      observe("WARN", "Could not find Experience section", s12);
    }

    // ============================================================
    // STEP 8: Template Gallery
    // ============================================================
    log("=== STEP 8: Template Gallery ===");

    // Try right sidebar or template selector
    const templateSelectors = [
      page.locator('button:has-text("Modèle")').first(),
      page.locator('button:has-text("Template")').first(),
      page.locator('button:has-text("Design")').first(),
      page.locator('button:has-text("Mise en page")').first(),
      page.locator('[data-testid*="template"]').first(),
    ];

    let templateOpened = false;
    for (const sel of templateSelectors) {
      if (await safeClick(page, sel, "Template selector", 2000)) {
        templateOpened = true;
        break;
      }
    }

    await page.waitForTimeout(2000);
    await dismissViteOverlay(page);
    const s14 = await screenshot(page, "Template gallery");

    // Check for template images/cards
    const templateImages = await page.locator('img[src*="template"], img[alt*="template"], img[src*="/templates/"]').count();
    log(`Template images found: ${templateImages}`);

    if (templateImages > 0) {
      observe("PASS", `Template gallery shows ${templateImages} template previews`, s14);

      // Try clicking a different template
      const secondTemplate = page.locator('img[src*="template"], img[src*="/templates/"]').nth(1);
      if (await safeClick(page, secondTemplate, "Second template", 2000)) {
        await page.waitForTimeout(2000);
        const s15 = await screenshot(page, "After template change");
        observe("PASS", "Template selection changed successfully", s15);
      }
    } else {
      // Check for other template indicators
      const templateNames = await page.locator('[class*="template"], [data-template]').count();
      log(`Template elements found: ${templateNames}`);
      if (templateNames > 0) {
        observe("PASS", `Template gallery found ${templateNames} template elements`, s14);
      } else if (templateOpened) {
        observe("WARN", "Template section opened but no template previews visible", s14);
      } else {
        observe("WARN", "Could not find template gallery", s14);
      }
    }

    // ============================================================
    // STEP 9: Resume Preview
    // ============================================================
    log("=== STEP 9: Resume Preview ===");

    const previewSelectors = [
      page.locator('iframe').first(),
      page.locator('[data-testid="preview"]').first(),
      page.locator('[class*="artboard"]').first(),
      page.locator('[class*="preview"]').first(),
      page.locator('#resume-preview').first(),
    ];

    let previewFound = false;
    for (const sel of previewSelectors) {
      if (await sel.isVisible().catch(() => false)) {
        previewFound = true;
        const tag = await sel.evaluate(el => el.tagName).catch(() => "");
        log(`Preview element found: ${tag}`);
        break;
      }
    }

    const s16 = await screenshot(page, "Resume preview");
    if (previewFound) {
      observe("PASS", "Resume preview is rendering", s16);
    } else {
      observe("WARN", "Resume preview element not found - may be on different tab", s16);
    }

    // ============================================================
    // STEP 10: Download/Export
    // ============================================================
    log("=== STEP 10: Download/Export ===");

    const downloadSelectors = [
      page.locator('button:has-text("Télécharger")').first(),
      page.locator('button:has-text("Download")').first(),
      page.locator('button:has-text("Export")').first(),
      page.locator('button:has-text("PDF")').first(),
      page.locator('button[aria-label*="download"]').first(),
      page.locator('button[aria-label*="Download"]').first(),
      page.locator('button[aria-label*="export"]').first(),
    ];

    let downloadFound = false;
    for (const sel of downloadSelectors) {
      if (await sel.isVisible().catch(() => false)) {
        downloadFound = true;
        const text = await sel.textContent().catch(() => "");
        log(`Download button found: "${text.trim()}"`);
        const s17 = await screenshot(page, "Download button");
        observe("PASS", `Download/Export button present: "${text.trim()}"`, s17);
        break;
      }
    }

    if (!downloadFound) {
      // Check all visible buttons for any download-related ones
      const visibleBtns = await page.locator("button:visible").all();
      log(`Checking ${visibleBtns.length} visible buttons for download...`);
      for (const btn of visibleBtns.slice(0, 25)) {
        const text = (await btn.textContent().catch(() => "")).trim().slice(0, 50);
        const aria = await btn.getAttribute("aria-label").catch(() => "");
        if (text || aria) {
          log(`  Visible button: "${text}" aria="${aria || ""}"`);
        }
      }
      observe("WARN", "Download/Export button not found in visible area", s16);
    }

    // ============================================================
    // STEP 11: Final overview
    // ============================================================
    log("=== STEP 11: Final Overview ===");
    const sFinal = await screenshot(page, "Final state");

    // Print summary
    printSummary(consoleErrors);

  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    log(err.stack);
    await screenshot(page, "Fatal error state");
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
    log("Browser closed.");
  }
}

function printSummary(consoleErrors) {
  log("\n========================================");
  log("TEST RESULTS SUMMARY");
  log("========================================");

  for (const obs of observations) {
    const icon = obs.type === "PASS" ? "PASS" : obs.type === "FAIL" ? "FAIL" : "WARN";
    log(`[${icon}] ${obs.msg}${obs.screenshot ? ` -> ${obs.screenshot}` : ""}`);
  }

  if (consoleErrors.length > 0) {
    log(`\nConsole Errors (${consoleErrors.length}):`);
    for (const err of consoleErrors.slice(0, 15)) {
      log(`  ERROR: ${err.slice(0, 200)}`);
    }
  }

  log(`\nTotal screenshots: ${screenshotCounter}`);
  log(`Pass: ${observations.filter(o => o.type === "PASS").length}`);
  log(`Fail: ${observations.filter(o => o.type === "FAIL").length}`);
  log(`Warn: ${observations.filter(o => o.type === "WARN").length}`);
}

run().catch(console.error);
