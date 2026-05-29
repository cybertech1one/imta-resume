// Partner Portal E2E Test - Full Feature Walkthrough
// Tests: Dashboard, Jobs, Post Job, Applications, Sidebar Navigation
import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const browser = await chromium.launch({ headless: false, slowMo: 120 });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

async function dismissOverlay() {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function screenshot(path, label) {
  await dismissOverlay();
  await page.screenshot({ path, fullPage: false });
  console.log(`[SCREENSHOT] ${label} -> ${path}`);
}

async function waitForLoad(timeout = 5000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // networkidle can be flaky, continue anyway
  }
  await sleep(1500);
  await dismissOverlay();
}

// ============================================================
// STEP 0: Login as partner via API
// ============================================================
console.log("\n=== STEP 0: Login as partner@test.com ===");
await page.goto(`${BASE}/auth/login`, { timeout: 60000, waitUntil: "domcontentloaded" });
await sleep(3000);
await dismissOverlay();

const loginResult = await page.evaluate(async () => {
  const res = await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "partner@test.com", password: "TestAccount123!" }),
  });
  return { status: res.status, ok: res.ok };
});
console.log(`Login response: ${JSON.stringify(loginResult)}`);

await page.goto(`${BASE}/dashboard`, { timeout: 60000, waitUntil: "domcontentloaded" });
await sleep(4000);
await dismissOverlay();
console.log(`After login, URL: ${page.url()}`);

// ============================================================
// STEP 1: Partner Dashboard - /dashboard/partner
// ============================================================
console.log("\n=== STEP 1: Partner Dashboard ===");
await page.goto(`${BASE}/dashboard/partner`, { timeout: 60000, waitUntil: "domcontentloaded" });
await waitForLoad(8000);
await screenshot("C:/tmp/e2e-partner-01.png", "Partner Dashboard");

// Check for stats cards
const statsCheck = await page.evaluate(() => {
  const cards = document.querySelectorAll("[class*='card']");
  const headings = Array.from(document.querySelectorAll("h1, h2, h3, [class*='title']"))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .slice(0, 10);
  const statValues = Array.from(document.querySelectorAll("[class*='text-3xl'], [class*='font-bold']"))
    .map(el => el.textContent?.trim())
    .filter(Boolean)
    .slice(0, 10);
  return { cardCount: cards.length, headings, statValues };
});
console.log(`Dashboard cards: ${statsCheck.cardCount}`);
console.log(`Headings: ${JSON.stringify(statsCheck.headings)}`);
console.log(`Stat values: ${JSON.stringify(statsCheck.statValues)}`);

// ============================================================
// STEP 2: Check partner stats detail
// ============================================================
console.log("\n=== STEP 2: Check partner stats ===");
const statsDetail = await page.evaluate(() => {
  const body = document.body.innerText;
  const hasJobs = /total.*jobs|offres|job.*post/i.test(body);
  const hasApplications = /application|candidatur/i.test(body);
  const hasEvents = /event|evenement/i.test(body);
  const hasRegistrations = /registration|inscription/i.test(body);
  return { hasJobs, hasApplications, hasEvents, hasRegistrations, bodyPreview: body.substring(0, 500) };
});
console.log(`Stats found - Jobs: ${statsDetail.hasJobs}, Applications: ${statsDetail.hasApplications}, Events: ${statsDetail.hasEvents}, Registrations: ${statsDetail.hasRegistrations}`);

// ============================================================
// STEP 3: Job Listings - /dashboard/partner/jobs
// ============================================================
console.log("\n=== STEP 3: Partner Jobs ===");
await page.goto(`${BASE}/dashboard/partner/jobs`, { timeout: 60000, waitUntil: "domcontentloaded" });
await waitForLoad(8000);
await screenshot("C:/tmp/e2e-partner-02.png", "Partner Job Listings");

const jobsCheck = await page.evaluate(() => {
  const body = document.body.innerText;
  const cards = document.querySelectorAll("[class*='card']");
  const hasNoJobs = /no job.*post|aucune offre/i.test(body);
  const hasPostButton = !!document.querySelector("button");
  const tabs = Array.from(document.querySelectorAll("[role='tab']"))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  return { cardCount: cards.length, hasNoJobs, hasPostButton, tabs, bodyPreview: body.substring(0, 300) };
});
console.log(`Jobs page - Cards: ${jobsCheck.cardCount}, No jobs: ${jobsCheck.hasNoJobs}, Tabs: ${JSON.stringify(jobsCheck.tabs)}`);

// ============================================================
// STEP 4: Post a New Job - /dashboard/partner/post-job
// ============================================================
console.log("\n=== STEP 4: Post a Job ===");
await page.goto(`${BASE}/dashboard/partner/post-job`, { timeout: 60000, waitUntil: "domcontentloaded" });
await waitForLoad(8000);

// Fill in the job form
console.log("Filling job form...");

// Title (French) - required
const titleFrInput = page.locator("#titleFr");
await titleFrInput.waitFor({ state: "visible", timeout: 5000 });
await titleFrInput.fill("Developpeur Full Stack");
console.log("  Filled: Title (French)");

// Title (English)
const titleInput = page.locator("#title");
await titleInput.fill("Full Stack Developer");
console.log("  Filled: Title (English)");

// Description (French) - required
const descFrInput = page.locator("#descriptionFr");
await descFrInput.fill("Recherche developpeur React/Node.js avec experience en PostgreSQL. Poste base a Casablanca, equipe dynamique, projets innovants. Salaire competitif et avantages sociaux.");
console.log("  Filled: Description (French)");

// Description (English)
const descInput = page.locator("#description");
await descInput.fill("Looking for a React/Node.js developer with PostgreSQL experience. Based in Casablanca, dynamic team, innovative projects.");
console.log("  Filled: Description (English)");

// Location (City) - required
const locationInput = page.locator("#location");
await locationInput.fill("Casablanca");
console.log("  Filled: Location");

// Region - select dropdown
try {
  const regionTrigger = page.locator("#region");
  await regionTrigger.click();
  await sleep(500);
  const casaOption = page.getByText("Casablanca-Settat", { exact: true }).first();
  await casaOption.click();
  await sleep(300);
  console.log("  Selected: Region = Casablanca-Settat");
} catch (e) {
  console.log("  WARN: Could not select region:", e.message);
}

// Job Type - required select
try {
  const jobTypeTrigger = page.locator("#jobType");
  await jobTypeTrigger.click();
  await sleep(500);
  const cdiOption = page.getByText("CDI (Contrat a Duree Indeterminee)", { exact: true }).first();
  await cdiOption.click();
  await sleep(300);
  console.log("  Selected: Job Type = CDI");
} catch (e) {
  console.log("  WARN: Could not select job type:", e.message);
}

// Experience Level
try {
  const expTrigger = page.locator("#experienceLevel");
  await expTrigger.click();
  await sleep(500);
  const midOption = page.getByText("Intermediaire (2-5 ans)", { exact: true }).first();
  await midOption.click();
  await sleep(300);
  console.log("  Selected: Experience = Intermediaire");
} catch (e) {
  console.log("  WARN: Could not select experience level:", e.message);
}

// Field - required select
try {
  const fieldTrigger = page.locator("#field");
  await fieldTrigger.click();
  await sleep(500);
  const itOption = page.getByText("Informatique / IT", { exact: true }).first();
  await itOption.click();
  await sleep(300);
  console.log("  Selected: Field = IT");
} catch (e) {
  console.log("  WARN: Could not select field:", e.message);
}

// Skills
const skillsInput = page.locator("#skills");
await skillsInput.fill("React, Node.js, PostgreSQL, TypeScript, Docker");
console.log("  Filled: Skills");

// Salary
const salaryMinInput = page.locator("#salaryMin");
await salaryMinInput.fill("12000");
const salaryMaxInput = page.locator("#salaryMax");
await salaryMaxInput.fill("20000");
console.log("  Filled: Salary range 12000-20000 MAD");

// Benefits
const benefitsInput = page.locator("#benefits");
await benefitsInput.fill("Assurance maladie, Transport, Restaurant d'entreprise, Formation continue");
console.log("  Filled: Benefits");

// Deadline
const deadlineInput = page.locator("#deadline");
await deadlineInput.fill("2026-07-30");
console.log("  Filled: Deadline");

// Start date
const startDateInput = page.locator("#startDate");
await startDateInput.fill("2026-09-01");
console.log("  Filled: Start date");

// Positions
const positionsInput = page.locator("#positions");
await positionsInput.fill("3");
console.log("  Filled: Positions = 3");

await sleep(500);

// Screenshot the filled form
await screenshot("C:/tmp/e2e-partner-03.png", "Job Form Filled");

// Scroll down to see the bottom of the form
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await sleep(500);

// Check form validity
const formState = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button"));
  const submitBtn = buttons.find(b => b.textContent?.includes("Submit") || b.textContent?.includes("Soumettre"));
  const draftBtn = buttons.find(b => b.textContent?.includes("Draft") || b.textContent?.includes("Brouillon") || b.textContent?.includes("Save"));
  const requiredBadge = document.body.innerText.includes("Required fields missing") || document.body.innerText.includes("Champs requis");
  return {
    submitDisabled: submitBtn?.disabled ?? null,
    draftDisabled: draftBtn?.disabled ?? null,
    requiredBadge,
    submitText: submitBtn?.textContent?.trim(),
    draftText: draftBtn?.textContent?.trim(),
  };
});
console.log(`Form state - Submit disabled: ${formState.submitDisabled}, Draft disabled: ${formState.draftDisabled}, Required missing: ${formState.requiredBadge}`);

// Try to submit the job
console.log("Attempting to submit job...");
try {
  // Click "Submit for Review" button
  const submitButton = page.locator("button").filter({ hasText: /submit|soumettre/i }).first();
  const isDisabled = await submitButton.isDisabled();
  if (!isDisabled) {
    await submitButton.click();
    await sleep(3000);
    await dismissOverlay();
    console.log(`After submit, URL: ${page.url()}`);
    // Check for success toast
    const toastCheck = await page.evaluate(() => {
      const toasts = document.querySelectorAll("[data-sonner-toast]");
      return Array.from(toasts).map(t => t.textContent?.trim()).filter(Boolean);
    });
    console.log(`Toasts: ${JSON.stringify(toastCheck)}`);
  } else {
    console.log("Submit button is disabled - trying Save as Draft instead");
    const draftButton = page.locator("button").filter({ hasText: /draft|brouillon|save/i }).first();
    const draftDisabled = await draftButton.isDisabled();
    if (!draftDisabled) {
      await draftButton.click();
      await sleep(3000);
      await dismissOverlay();
      console.log("Draft saved");
    } else {
      console.log("WARN: Both submit and draft buttons are disabled");
    }
  }
} catch (e) {
  console.log(`WARN: Submit failed: ${e.message}`);
}

await screenshot("C:/tmp/e2e-partner-04.png", "After Job Submission");

// ============================================================
// STEP 5: Applications - /dashboard/partner/applications
// ============================================================
console.log("\n=== STEP 5: Applications ===");
await page.goto(`${BASE}/dashboard/partner/applications`, { timeout: 60000, waitUntil: "domcontentloaded" });
await waitForLoad(8000);
await screenshot("C:/tmp/e2e-partner-05.png", "Partner Applications");

const appsCheck = await page.evaluate(() => {
  const body = document.body.innerText;
  const hasNoApps = /no application|aucune candidature/i.test(body);
  const filters = Array.from(document.querySelectorAll("[role='combobox'], select"))
    .map(el => el.textContent?.trim())
    .filter(Boolean);
  const cards = document.querySelectorAll("[class*='card']");
  return { cardCount: cards.length, hasNoApps, filters, bodyPreview: body.substring(0, 300) };
});
console.log(`Applications - Cards: ${appsCheck.cardCount}, No apps: ${appsCheck.hasNoApps}, Filters: ${JSON.stringify(appsCheck.filters)}`);

// ============================================================
// STEP 6: Check back on jobs page for the newly created job
// ============================================================
console.log("\n=== STEP 6: Jobs page (after posting) ===");
await page.goto(`${BASE}/dashboard/partner/jobs`, { timeout: 60000, waitUntil: "domcontentloaded" });
await waitForLoad(8000);
await screenshot("C:/tmp/e2e-partner-06.png", "Jobs After Posting");

const jobsAfterPost = await page.evaluate(() => {
  const body = document.body.innerText;
  const hasNewJob = body.includes("Developpeur Full Stack") || body.includes("Full Stack Developer");
  const cards = document.querySelectorAll("[class*='card']");
  const jobTitles = Array.from(document.querySelectorAll("[class*='title']"))
    .map(el => el.textContent?.trim())
    .filter(t => t && t.length > 3)
    .slice(0, 10);
  return { cardCount: cards.length, hasNewJob, jobTitles };
});
console.log(`Jobs after posting - Cards: ${jobsAfterPost.cardCount}, Has new job: ${jobsAfterPost.hasNewJob}`);
console.log(`Job titles found: ${JSON.stringify(jobsAfterPost.jobTitles)}`);

// ============================================================
// STEP 7: Sidebar navigation - Check all partner sections
// ============================================================
console.log("\n=== STEP 7: Partner Sidebar Navigation ===");

// Open sidebar if collapsed (mobile) or just inspect
const sidebarCheck = await page.evaluate(() => {
  const sidebar = document.querySelector("[data-sidebar]") || document.querySelector("aside") || document.querySelector("nav");
  const links = sidebar
    ? Array.from(sidebar.querySelectorAll("a"))
        .map(a => ({ href: a.getAttribute("href"), text: a.textContent?.trim() }))
        .filter(l => l.href && l.text)
    : [];
  const partnerLinks = links.filter(l => l.href?.includes("partner"));
  const allNavLinks = links.slice(0, 30);
  return { partnerLinks, allNavLinks, hasSidebar: !!sidebar };
});

console.log(`Sidebar found: ${sidebarCheck.hasSidebar}`);
console.log(`Partner nav links: ${JSON.stringify(sidebarCheck.partnerLinks)}`);
console.log(`All nav links (first 30): ${JSON.stringify(sidebarCheck.allNavLinks.map(l => l.text))}`);

// Try clicking the sidebar Partner section to expand it
try {
  const partnerBtn = page.locator("aside a, nav a, [data-sidebar] a").filter({ hasText: /partner/i }).first();
  if (await partnerBtn.isVisible()) {
    await partnerBtn.click();
    await sleep(500);
  }
} catch {}

await screenshot("C:/tmp/e2e-partner-07.png", "Sidebar Partner Navigation");

// ============================================================
// SUMMARY
// ============================================================
console.log("\n=== E2E PARTNER TEST COMPLETE ===");
console.log("Screenshots saved:");
console.log("  01: Partner Dashboard      -> C:/tmp/e2e-partner-01.png");
console.log("  02: Job Listings           -> C:/tmp/e2e-partner-02.png");
console.log("  03: Job Form Filled        -> C:/tmp/e2e-partner-03.png");
console.log("  04: After Job Submission   -> C:/tmp/e2e-partner-04.png");
console.log("  05: Applications           -> C:/tmp/e2e-partner-05.png");
console.log("  06: Jobs After Posting     -> C:/tmp/e2e-partner-06.png");
console.log("  07: Sidebar Navigation     -> C:/tmp/e2e-partner-07.png");

await browser.close();
console.log("\nBrowser closed. Test complete.");
