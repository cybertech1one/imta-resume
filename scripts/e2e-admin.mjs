import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const browser = await chromium.launch({ headless: false, slowMo: 120 });
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
context.setDefaultTimeout(60000);
context.setDefaultNavigationTimeout(60000);
const page = await context.newPage();

async function dismissOverlay() {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function safeScreenshot(path, label) {
  try {
    await dismissOverlay();
    await page.screenshot({ path, fullPage: false });
    console.log(`[SCREENSHOT] ${label} -> ${path}`);
  } catch (err) {
    console.log(`[SCREENSHOT ERROR] ${label}: ${err.message}`);
  }
}

async function waitForPageLoad(timeout = 8000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {
    // fallback: just wait a bit
    await sleep(3000);
  }
  await dismissOverlay();
}

// =====================================================================
// LOGIN
// =====================================================================
console.log("\n=== STEP 0: Login as admin ===");
await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
await sleep(2000);
await dismissOverlay();

await page.evaluate(async () => {
  await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@test.com", password: "TestAccount123!" }),
  });
});

await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
await sleep(3000);
await dismissOverlay();
console.log("[OK] Logged in as admin@test.com");

// =====================================================================
// 1. Admin Dashboard - /dashboard/admin
// =====================================================================
console.log("\n=== STEP 1: Admin Dashboard ===");
await page.goto(`${BASE}/dashboard/admin`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

// Check for stats cards or dashboard content
const adminDashContent = await page.textContent("body").catch(() => "");
const hasStats = adminDashContent.includes("User") || adminDashContent.includes("Resume") || adminDashContent.includes("Admin");
console.log(`  Dashboard loaded: ${hasStats ? "YES - content found" : "NO stats visible"}`);
console.log(`  Page title area: ${(await page.title()).substring(0, 60)}`);

await safeScreenshot("C:/tmp/e2e-admin-01.png", "Admin Dashboard");

// =====================================================================
// 2. User Management - /dashboard/admin/users
// =====================================================================
console.log("\n=== STEP 2: User Management ===");
await page.goto(`${BASE}/dashboard/admin/users`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

// Look for student1@test.com in the table
const userTableContent = await page.textContent("body").catch(() => "");
const hasStudent1 = userTableContent.includes("student1@test.com");
console.log(`  student1@test.com found: ${hasStudent1 ? "YES" : "NO"}`);

// Check for role controls (Select, dropdown, or badge)
const roleControls = await page.locator("select, [role='combobox'], [data-slot='select-trigger']").count();
const roleBadges = await page.locator("text=user, text=admin").first().isVisible().catch(() => false);
console.log(`  Role controls/selects: ${roleControls} | Role badges visible: ${roleBadges}`);

// Try to find a role dropdown or select near the student row
try {
  const studentRow = page.locator("tr", { hasText: "student1@test.com" });
  const rowExists = await studentRow.count();
  if (rowExists > 0) {
    console.log("  Student1 row found in table - checking for role controls...");
    // Look for any interactive element in the row
    const rowButtons = await studentRow.locator("button, a, [role='combobox']").count();
    console.log(`  Interactive elements in student1 row: ${rowButtons}`);
  }
} catch (e) {
  console.log(`  Could not inspect student row: ${e.message}`);
}

await safeScreenshot("C:/tmp/e2e-admin-02.png", "User Management");

// =====================================================================
// 3. AI Provider Management - /dashboard/admin/ai-providers
// =====================================================================
console.log("\n=== STEP 3: AI Provider Management ===");
await page.goto(`${BASE}/dashboard/admin/ai-providers`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

const aiProviderContent = await page.textContent("body").catch(() => "");
const hasDeepSeek = aiProviderContent.toLowerCase().includes("deepseek");
const hasActiveProvider = aiProviderContent.toLowerCase().includes("active") || aiProviderContent.toLowerCase().includes("actif");
console.log(`  DeepSeek found: ${hasDeepSeek ? "YES" : "NO"}`);
console.log(`  Active provider indicator: ${hasActiveProvider ? "YES" : "NO"}`);

// Look for Test button
const testButton = page.locator("button", { hasText: /test/i });
const testBtnCount = await testButton.count();
console.log(`  Test buttons found: ${testBtnCount}`);
if (testBtnCount > 0) {
  console.log("  Test button exists - NOT clicking to avoid side effects");
}

await safeScreenshot("C:/tmp/e2e-admin-03.png", "AI Providers");

// =====================================================================
// 4. AI Quotas - /dashboard/admin/ai-quotas
// =====================================================================
console.log("\n=== STEP 4: AI Quotas ===");
await page.goto(`${BASE}/dashboard/admin/ai-quotas`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

const quotaContent = await page.textContent("body").catch(() => "");
const hasStudentPlan = quotaContent.toLowerCase().includes("student");
const hasQuotaPlan = quotaContent.toLowerCase().includes("plan") || quotaContent.toLowerCase().includes("quota");
console.log(`  Student Plan found: ${hasStudentPlan ? "YES" : "NO"}`);
console.log(`  Quota/Plan references: ${hasQuotaPlan ? "YES" : "NO"}`);

await safeScreenshot("C:/tmp/e2e-admin-04.png", "AI Quotas");

// =====================================================================
// 5. AI Settings - /dashboard/admin/ai-settings
// =====================================================================
console.log("\n=== STEP 5: AI Settings ===");
await page.goto(`${BASE}/dashboard/admin/ai-settings`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

const settingsContent = await page.textContent("body").catch(() => "");
const hasDailyLimit = settingsContent.toLowerCase().includes("daily") || settingsContent.toLowerCase().includes("quotidien");
const hasMonthlyLimit = settingsContent.toLowerCase().includes("monthly") || settingsContent.toLowerCase().includes("mensuel");
console.log(`  Daily limits visible: ${hasDailyLimit ? "YES" : "NO"}`);
console.log(`  Monthly limits visible: ${hasMonthlyLimit ? "YES" : "NO"}`);

await safeScreenshot("C:/tmp/e2e-admin-05.png", "AI Settings");

// =====================================================================
// 6. Reference Data - /dashboard/admin/reference-data
// =====================================================================
console.log("\n=== STEP 6: Reference Data ===");
await page.goto(`${BASE}/dashboard/admin/reference-data`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

// Default tab should be "programs"
const refDataContent = await page.textContent("body").catch(() => "");
const hasTabs = refDataContent.includes("Programme") || refDataContent.includes("programs") || refDataContent.includes("Programmes");
console.log(`  Reference data tabs visible: ${hasTabs ? "YES" : "NO"}`);

await safeScreenshot("C:/tmp/e2e-admin-06.png", "Reference Data - Programs tab");

// Click Tips tab
const tabNames = [
  { value: "tips", label: "Tips/Conseils", screenshot: "C:/tmp/e2e-admin-07.png" },
  { value: "questions", label: "Questions", screenshot: "C:/tmp/e2e-admin-08.png" },
];

for (const tab of tabNames) {
  try {
    // Try clicking the tab trigger by value attribute
    const tabTrigger = page.locator(`[role="tab"][data-value="${tab.value}"], button[value="${tab.value}"]`);
    let clicked = false;
    if (await tabTrigger.count() > 0) {
      await tabTrigger.first().click();
      clicked = true;
    } else {
      // Try by text content
      const tabByText = page.locator("button[role='tab']", { hasText: new RegExp(tab.label, "i") });
      if (await tabByText.count() > 0) {
        await tabByText.first().click();
        clicked = true;
      }
    }
    if (clicked) {
      await sleep(1500);
      console.log(`  Clicked ${tab.label} tab`);
    } else {
      console.log(`  Could not find ${tab.label} tab trigger`);
    }
  } catch (e) {
    console.log(`  Error clicking ${tab.label} tab: ${e.message}`);
  }
  await safeScreenshot(tab.screenshot, `Reference Data - ${tab.label}`);
}

// =====================================================================
// 7. Analytics Dashboard - /dashboard/analytics
// =====================================================================
console.log("\n=== STEP 7: Analytics Dashboard ===");
await page.goto(`${BASE}/dashboard/analytics`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

const analyticsContent = await page.textContent("body").catch(() => "");
const hasAnalytics = analyticsContent.includes("Analyt") || analyticsContent.includes("Views") || analyticsContent.includes("Download") || analyticsContent.includes("vue");
console.log(`  Analytics content loaded: ${hasAnalytics ? "YES" : "NO"}`);

await safeScreenshot("C:/tmp/e2e-admin-09.png", "Analytics Dashboard");

// =====================================================================
// 8. AI Usage Analytics - /dashboard/analytics/ai-usage
// =====================================================================
console.log("\n=== STEP 8: AI Usage Analytics ===");
await page.goto(`${BASE}/dashboard/analytics/ai-usage`, { waitUntil: "domcontentloaded" });
await waitForPageLoad();
await sleep(2000);

const aiUsageContent = await page.textContent("body").catch(() => "");
const hasCharts = aiUsageContent.includes("Request") || aiUsageContent.includes("Token") || aiUsageContent.includes("Usage") || aiUsageContent.includes("utilisation");
const hasAIUsageData = aiUsageContent.includes("Success") || aiUsageContent.includes("Error") || aiUsageContent.includes("success");
console.log(`  AI Usage charts/data: ${hasCharts ? "YES" : "NO"}`);
console.log(`  Status data visible: ${hasAIUsageData ? "YES" : "NO"}`);

await safeScreenshot("C:/tmp/e2e-admin-10.png", "AI Usage Analytics");

// =====================================================================
// SUMMARY
// =====================================================================
console.log("\n========================================");
console.log("  E2E ADMIN TEST COMPLETE");
console.log("  Screenshots saved to C:/tmp/e2e-admin-*.png");
console.log("========================================\n");

await browser.close();
