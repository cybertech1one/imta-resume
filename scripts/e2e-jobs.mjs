import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const browser = await chromium.launch({ headless: false, slowMo: 120 });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.setDefaultTimeout(60000);
page.setDefaultNavigationTimeout(60000);

async function safeGoto(url) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch (e) {
    console.log(`[WARN] Navigation slow for ${url}: ${e.message.split('\n')[0]}`);
  }
}

async function dismissOverlay() {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function screenshotFull(path, label) {
  await dismissOverlay();
  await page.screenshot({ path, fullPage: false });
  console.log(`[SCREENSHOT] ${label} -> ${path}`);
}

// ─── Login via API ───────────────────────────────────────────────
console.log("=== Step 0: Login ===");
await safeGoto(`${BASE}/auth/login`);
await sleep(2000);
await dismissOverlay();

await page.evaluate(async () => {
  await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
  });
});

await safeGoto(`${BASE}/dashboard`);
await sleep(3000);
await dismissOverlay();
console.log("[OK] Logged in as student1@test.com");

// ─── Test 1: Jobs Hub (index) ────────────────────────────────────
console.log("\n=== Test 1: Jobs Hub /dashboard/jobs ===");
await safeGoto(`${BASE}/dashboard/jobs`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-01.png", "Jobs Hub");

// Check what's on the page
const jobsHubTitle = await page.textContent("body").catch(() => "");
console.log("[INFO] Jobs hub has content:", jobsHubTitle.length > 100 ? "YES" : "MINIMAL");

// ─── Test 2: Job Board ──────────────────────────────────────────
console.log("\n=== Test 2: Job Board /dashboard/jobs/board ===");
await safeGoto(`${BASE}/dashboard/jobs/board`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-02.png", "Job Board");

// Try filtering by field
try {
  // Find the field filter select
  const fieldSelect = page.locator("button[role='combobox']").first();
  if (await fieldSelect.isVisible({ timeout: 3000 })) {
    await fieldSelect.click();
    await sleep(500);
    // Try to select "Informatique / IT"
    const itOption = page.locator('[role="option"]').filter({ hasText: /IT|Informatique/ });
    if (await itOption.count() > 0) {
      await itOption.first().click();
      await sleep(1000);
      console.log("[OK] Field filter applied: IT");
    } else {
      // Close the dropdown by pressing Escape
      await page.keyboard.press("Escape");
      console.log("[WARN] No IT option in field filter");
    }
  }
} catch (e) {
  console.log("[WARN] Field filter interaction failed:", e.message);
}

// Try filtering by location
try {
  const selects = page.locator("button[role='combobox']");
  const count = await selects.count();
  if (count >= 2) {
    const locationSelect = selects.nth(1);
    await locationSelect.click();
    await sleep(500);
    const casaOption = page.locator('[role="option"]').filter({ hasText: /Casablanca/ });
    if (await casaOption.count() > 0) {
      await casaOption.first().click();
      await sleep(1000);
      console.log("[OK] Location filter applied: Casablanca");
    } else {
      await page.keyboard.press("Escape");
      console.log("[WARN] No Casablanca option");
    }
  }
} catch (e) {
  console.log("[WARN] Location filter interaction failed:", e.message);
}

// Try filtering by job type
try {
  const selects = page.locator("button[role='combobox']");
  const count = await selects.count();
  if (count >= 3) {
    const typeSelect = selects.nth(2);
    await typeSelect.click();
    await sleep(500);
    const stageOption = page.locator('[role="option"]').filter({ hasText: /Stage/ });
    if (await stageOption.count() > 0) {
      await stageOption.first().click();
      await sleep(1000);
      console.log("[OK] Job type filter applied: Stage");
    } else {
      await page.keyboard.press("Escape");
      console.log("[WARN] No Stage option");
    }
  }
} catch (e) {
  console.log("[WARN] Job type filter interaction failed:", e.message);
}

await sleep(1500);
await screenshotFull("C:/tmp/e2e-jobs-03.png", "Filtered Results");

// ─── Test 3: Click on a Job for Details ─────────────────────────
console.log("\n=== Test 3: Job Details ===");
try {
  // Look for job cards on the board page - try various selectors
  const jobCards = page.locator('[class*="card"]').filter({ hasText: /CDI|CDD|Stage|Alternance|Freelance|MAD/ });
  const cardCount = await jobCards.count();
  console.log(`[INFO] Found ${cardCount} job cards`);

  if (cardCount > 0) {
    // Try clicking a "Voir" or "Apply" or "Details" button, or just the card
    const detailBtn = jobCards.first().locator('button').filter({ hasText: /Voir|Details|Postuler|Apply|Candidater/ });
    if (await detailBtn.count() > 0) {
      await detailBtn.first().click();
    } else {
      await jobCards.first().click();
    }
    await sleep(2000);
    await dismissOverlay();
    await screenshotFull("C:/tmp/e2e-jobs-04.png", "Job Details");
    console.log("[OK] Job detail view captured");

    // Close dialog if open
    const closeBtn = page.locator('[role="dialog"] button').filter({ hasText: /Close|Fermer|X/ });
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await sleep(500);
    } else {
      await page.keyboard.press("Escape");
      await sleep(500);
    }
  } else {
    console.log("[WARN] No job cards found - board may be empty");
    await screenshotFull("C:/tmp/e2e-jobs-04.png", "Job Details (no jobs)");
  }
} catch (e) {
  console.log("[WARN] Job details interaction failed:", e.message);
  await screenshotFull("C:/tmp/e2e-jobs-04.png", "Job Details (error)");
}

// ─── Test 4: Applications Tracker ───────────────────────────────
console.log("\n=== Test 4: Applications /dashboard/jobs/applications ===");
await safeGoto(`${BASE}/dashboard/jobs/applications`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-05.png", "Applications Tracker");

// ─── Test 5: Job Alerts ─────────────────────────────────────────
console.log("\n=== Test 5: Alerts /dashboard/jobs/alerts ===");
await safeGoto(`${BASE}/dashboard/jobs/alerts`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-06.png", "Job Alerts");

// Try creating an alert
try {
  console.log("[INFO] Attempting to create a job alert...");

  // Look for "New alert" or "Create" or "+" button
  const createBtn = page.locator("button").filter({ hasText: /New|Nouvelle|Creer|Créer|\+|alert/i });
  if (await createBtn.count() > 0) {
    await createBtn.first().click();
    await sleep(1500);
    await dismissOverlay();

    // Fill in the alert name
    const nameInput = page.locator('input[placeholder*="E.g"]').or(page.locator('[role="dialog"] input').first());
    if (await nameInput.count() > 0) {
      await nameInput.first().fill("Developpeur Casablanca");
      console.log("[OK] Alert name filled");
    }

    // Fill in keywords
    const keywordTextarea = page.locator('[role="dialog"] textarea').first();
    if (await keywordTextarea.count() > 0) {
      await keywordTextarea.fill("Developpeur, Full Stack, React, Node.js");
      console.log("[OK] Keywords filled");
    }

    // Select Casablanca location (it's a badge you click)
    const casaBadge = page.locator('[role="dialog"]').locator("span, div").filter({ hasText: /^Casablanca$/ });
    if (await casaBadge.count() > 0) {
      await casaBadge.first().click();
      await sleep(300);
      console.log("[OK] Casablanca selected");
    }

    await sleep(500);
    await screenshotFull("C:/tmp/e2e-jobs-06b.png", "Alert Form Filled");

    // Click create/save button
    const saveBtn = page.locator('[role="dialog"] button').filter({ hasText: /Create|Créer|Save|Sauvegarder|Enregistrer/i });
    if (await saveBtn.count() > 0) {
      await saveBtn.first().click();
      await sleep(2000);
      await dismissOverlay();
      console.log("[OK] Alert creation submitted");
    } else {
      console.log("[WARN] No save button found in dialog");
      await page.keyboard.press("Escape");
    }
  } else {
    console.log("[WARN] No create alert button found");
  }
} catch (e) {
  console.log("[WARN] Alert creation failed:", e.message);
}

await screenshotFull("C:/tmp/e2e-jobs-06c.png", "After Alert Creation");

// ─── Test 6: Job Market Insights ────────────────────────────────
console.log("\n=== Test 6: Insights /dashboard/jobs/insights ===");
await safeGoto(`${BASE}/dashboard/jobs/insights`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-07.png", "Job Market Insights");

// ─── Test 7: Recommendations ────────────────────────────────────
console.log("\n=== Test 7: Recommendations /dashboard/jobs/recommendations ===");
await safeGoto(`${BASE}/dashboard/jobs/recommendations`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-08.png", "Recommendations");

// ─── Test 8: Saved Jobs (or Search page) ────────────────────────
console.log("\n=== Test 8: Search /dashboard/jobs/search ===");
await safeGoto(`${BASE}/dashboard/jobs/search`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-09.png", "Job Search");

// Try searching for something
try {
  const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  if (await searchInput.isVisible({ timeout: 2000 })) {
    await searchInput.fill("Developpeur");
    await sleep(2000);
    await dismissOverlay();
    console.log("[OK] Search query entered: Developpeur");
    await screenshotFull("C:/tmp/e2e-jobs-09b.png", "Search Results");
  }
} catch (e) {
  console.log("[WARN] Search input not found:", e.message);
}

// ─── Test 9: Additional Pages ───────────────────────────────────
// Check other available jobs sub-pages: trends, deadlines, follow-up, culture-match, research, aggregator, employers

console.log("\n=== Test 9a: Trends /dashboard/jobs/trends ===");
await safeGoto(`${BASE}/dashboard/jobs/trends`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-10.png", "Job Trends");

console.log("\n=== Test 9b: Deadlines /dashboard/jobs/deadlines ===");
await safeGoto(`${BASE}/dashboard/jobs/deadlines`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-11.png", "Deadlines");

console.log("\n=== Test 9c: Follow-up /dashboard/jobs/follow-up ===");
await safeGoto(`${BASE}/dashboard/jobs/follow-up`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-12.png", "Follow-up");

console.log("\n=== Test 9d: Culture Match /dashboard/jobs/culture-match ===");
await safeGoto(`${BASE}/dashboard/jobs/culture-match`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-13.png", "Culture Match");

console.log("\n=== Test 9e: Employers /dashboard/jobs/employers ===");
await safeGoto(`${BASE}/dashboard/jobs/employers`);
await sleep(3000);
await dismissOverlay();
await screenshotFull("C:/tmp/e2e-jobs-14.png", "Employers");

// ─── Summary ────────────────────────────────────────────────────
console.log("\n========================================");
console.log("  E2E Jobs Workflow Test Complete");
console.log("  Screenshots saved to C:/tmp/e2e-jobs-*.png");
console.log("========================================\n");

await sleep(2000);
await browser.close();
console.log("[DONE] Browser closed.");
