/**
 * Settings & Profile Pages - Real User Test
 * Tests all settings sub-pages and profile pages for visual/functional correctness.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
let screenshotIndex = 1;

function ssPath(label) {
  const idx = String(screenshotIndex++).padStart(2, "0");
  return `${SCREENSHOT_DIR}/test-settings-${idx}.png`;
}

async function screenshot(page, label) {
  const path = ssPath(label);
  await page.screenshot({ path, fullPage: true });
  console.log(`[SCREENSHOT ${screenshotIndex - 1}] ${label} -> ${path}`);
}

async function dismissViteOverlay(page) {
  await page.evaluate(() => {
    const el = document.querySelector("vite-error-overlay");
    if (el) el.remove();
  });
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  return errors;
}

async function waitForPageReady(page, timeout = 10000) {
  await page.waitForLoadState("networkidle", { timeout }).catch(() => {});
  await page.waitForTimeout(1500);
  await dismissViteOverlay(page);
}

async function safeGoto(page, url, label) {
  console.log(`  Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await waitForPageReady(page);
    return true;
  } catch (err) {
    console.log(`  [WARN] Navigation to ${label} slow/timed out: ${err.message}`);
    await page.waitForTimeout(3000);
    await dismissViteOverlay(page);
    return true;
  }
}

async function run() {
  console.log("=== Settings & Profile Pages Test ===\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const consoleErrors = await collectConsoleErrors(page);

  // ──────────────────────────────────────────
  // STEP 1: LOGIN
  // ──────────────────────────────────────────
  console.log("\n[STEP 1] Logging in...");
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await dismissViteOverlay(page);

  // Approach: focus field, select all with Ctrl+A, then type character by character
  // The slowMo setting adds 150ms between EVERY Playwright action, which may interfere
  // with pressSequentially. Use keyboard approach with explicit focus.

  const emailInput = page.locator('input[name="identifier"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });

  // Click into the email field
  await emailInput.focus();
  await page.waitForTimeout(400);
  // Select all existing content and delete it
  await page.keyboard.press("Control+a");
  await page.waitForTimeout(200);
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(200);
  // Type character by character
  await page.keyboard.type("admin@test.com", { delay: 80 });
  await page.waitForTimeout(600);

  // Verify email
  const emailVal = await emailInput.inputValue();
  console.log(`  Email value set: "${emailVal}"`);

  // Now password
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.focus();
  await page.waitForTimeout(400);
  await page.keyboard.press("Control+a");
  await page.waitForTimeout(200);
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(200);
  await page.keyboard.type("TestAccount123!", { delay: 80 });
  await page.waitForTimeout(600);

  const passVal = await passwordInput.inputValue();
  console.log(`  Password value set: ${passVal.length > 0 ? `YES (${passVal.length} chars)` : "NO"}`);

  await screenshot(page, "login-form-filled");

  // Submit the form
  const submitBtn = page.locator('button[type="submit"]');
  await submitBtn.click();

  // Wait for redirect to dashboard
  try {
    await page.waitForURL("**/dashboard**", { timeout: 15000 });
    console.log("[PASS] Logged in, redirected to dashboard");
  } catch {
    console.log("[WARN] Did not redirect to dashboard URL, checking current URL...");
    console.log(`  Current URL: ${page.url()}`);
    // Try waiting more
    await page.waitForTimeout(5000);
    console.log(`  URL after extra wait: ${page.url()}`);
  }
  await waitForPageReady(page);
  await screenshot(page, "after-login-dashboard");

  // Verify we're logged in
  const isOnDashboard = page.url().includes("/dashboard");
  if (!isOnDashboard) {
    console.log("[FAIL] Login failed - not on dashboard. Aborting test.");
    await browser.close();
    return;
  }

  // ──────────────────────────────────────────
  // STEP 2: SETTINGS - PROFILE (General)
  // ──────────────────────────────────────────
  console.log("\n[STEP 2] Settings > Profile...");
  await safeGoto(page, `${BASE}/dashboard/settings/profile`, "Settings Profile");

  // Check if form fields are populated
  const nameField = page.locator('input[name="name"]');
  const usernameField = page.locator('input[name="username"]');
  const emailField = page.locator('input[name="email"]');

  let nameValue = "", usernameValue = "", emailValue = "";
  try {
    nameValue = await nameField.inputValue({ timeout: 5000 });
    usernameValue = await usernameField.inputValue({ timeout: 5000 });
    emailValue = await emailField.inputValue({ timeout: 5000 });
    console.log(`  Name field: "${nameValue}"`);
    console.log(`  Username field: "${usernameValue}"`);
    console.log(`  Email field: "${emailValue}"`);

    if (!nameValue && !usernameValue && !emailValue) {
      console.log("  [FAIL] Profile form fields are empty - not loading current values");
    } else {
      console.log("  [PASS] Profile form fields have values");
    }
  } catch (err) {
    console.log(`  [WARN] Could not read profile form fields: ${err.message}`);
  }

  // Check for save button
  const saveBtn = page.locator("button:has-text('Save'), button:has-text('Enregistrer'), button:has-text('Sauvegarder')").first();
  const hasSaveBtn = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Save button visible: ${hasSaveBtn}`);

  // Check for role/badge info
  const adminBadge = page.locator("text=/admin/i").first();
  const hasAdminBadge = await adminBadge.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Admin badge/label visible: ${hasAdminBadge}`);

  await screenshot(page, "settings-profile");

  // Scroll down to see full page
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "settings-profile-scrolled");

  // ──────────────────────────────────────────
  // STEP 3: SETTINGS - PREFERENCES
  // ──────────────────────────────────────────
  console.log("\n[STEP 3] Settings > Preferences...");
  await safeGoto(page, `${BASE}/dashboard/settings/preferences`, "Settings Preferences");

  // Check for theme selector
  const themeSection = page.locator("text=/Theme|Thème/i").first();
  const hasTheme = await themeSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Theme section visible: ${hasTheme}`);

  // Check for language selector
  const languageSection = page.locator("text=/Language|Langue/i").first();
  const hasLanguage = await languageSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Language section visible: ${hasLanguage}`);

  // Check for AI language selector
  const aiLanguageSection = page.locator("text=/AI.*Language|Langue.*IA|intelligence artificielle/i").first();
  const hasAiLanguage = await aiLanguageSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  AI Language section visible: ${hasAiLanguage}`);

  // Check for keyboard shortcuts section
  const keyboardSection = page.locator("text=/Keyboard|Clavier|Raccourcis/i").first();
  const hasKeyboard = await keyboardSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Keyboard shortcuts section visible: ${hasKeyboard}`);

  await screenshot(page, "settings-preferences");

  // Scroll for more content
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "settings-preferences-scrolled");

  // Try interacting with comboboxes (theme/language)
  console.log("  Attempting to open a combobox...");
  const comboboxes = page.locator('[role="combobox"], button[aria-haspopup="listbox"]');
  const comboCount = await comboboxes.count();
  console.log(`  Combobox elements found: ${comboCount}`);

  if (comboCount > 0) {
    try {
      await comboboxes.first().click();
      await page.waitForTimeout(1000);
      await screenshot(page, "settings-preferences-combobox-open");
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    } catch (err) {
      console.log(`  [WARN] Could not interact with combobox: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────
  // STEP 4: SETTINGS - AI
  // ──────────────────────────────────────────
  console.log("\n[STEP 4] Settings > AI...");
  await safeGoto(page, `${BASE}/dashboard/settings/ai`, "Settings AI");

  // Check AI status
  const aiAvailable = page.locator("text=/available|disponible|activé|enabled|connecté/i").first();
  const aiUnavailable = page.locator("text=/not available|non disponible|désactivé|disabled|not configured|indisponible/i").first();
  const hasAiAvailable = await aiAvailable.isVisible({ timeout: 3000 }).catch(() => false);
  const hasAiUnavailable = await aiUnavailable.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  AI available indicator: ${hasAiAvailable}`);
  console.log(`  AI unavailable indicator: ${hasAiUnavailable}`);

  // Check quota info
  const quotaSection = page.locator("text=/quota|Quota|usage|utilisation|restant/i").first();
  const hasQuota = await quotaSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Quota/usage section visible: ${hasQuota}`);

  // Check for feature list
  const featureSection = page.locator("text=/Resume Improvement|Amélioration|Grammar|Grammaire|PDF|Parsing/i").first();
  const hasFeatures = await featureSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  AI features list visible: ${hasFeatures}`);

  // Check for loading spinners
  const spinners = page.locator('[class*="animate-spin"], [class*="spinner"]');
  const spinnerCount = await spinners.count();
  console.log(`  Loading spinners on AI page: ${spinnerCount}`);

  await screenshot(page, "settings-ai");

  // Scroll to see quota details
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "settings-ai-scrolled");

  // ──────────────────────────────────────────
  // STEP 5: SETTINGS - AUTHENTICATION / SECURITY
  // ──────────────────────────────────────────
  console.log("\n[STEP 5] Settings > Authentication (Security)...");
  await safeGoto(page, `${BASE}/dashboard/settings/authentication`, "Settings Auth");

  // Check for password section
  const passwordSection = page.locator("text=/Password|Mot de passe/i").first();
  const hasPassword = await passwordSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Password section visible: ${hasPassword}`);

  // Check for 2FA section
  const twoFactorSection = page.locator("text=/Two.Factor|2FA|Double authentification|Authentification.*facteur/i").first();
  const hasTwoFactor = await twoFactorSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Two-factor section visible: ${hasTwoFactor}`);

  // Check for passkeys section
  const passkeysSection = page.locator("text=/Passkey/i").first();
  const hasPasskeys = await passkeysSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Passkeys section visible: ${hasPasskeys}`);

  await screenshot(page, "settings-authentication");

  // Scroll for more
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "settings-authentication-scrolled");

  // ──────────────────────────────────────────
  // STEP 6: SETTINGS - DATA MANAGEMENT
  // ──────────────────────────────────────────
  console.log("\n[STEP 6] Settings > Data Management...");
  await safeGoto(page, `${BASE}/dashboard/settings/data`, "Settings Data");

  // Check export section
  const exportSection = page.locator("text=/Export|Exporter/i").first();
  const hasExport = await exportSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Export section visible: ${hasExport}`);

  // Check import section
  const importSection = page.locator("text=/Import|Importer/i").first();
  const hasImport = await importSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Import section visible: ${hasImport}`);

  // Check data types listing
  const resumeDataType = page.locator("text=/Resumes|CVs/i").first();
  const hasResumeDataType = await resumeDataType.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Resume data type visible: ${hasResumeDataType}`);

  // Check for checkboxes (selectable data types)
  const checkboxes = page.locator('[role="checkbox"], input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();
  console.log(`  Checkboxes (selectable items) count: ${checkboxCount}`);

  // Check for duplicate handling section
  const duplicateSection = page.locator("text=/Duplicate|Doublon|Conflit|duplicate/i").first();
  const hasDuplicate = await duplicateSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Duplicate handling section visible: ${hasDuplicate}`);

  await screenshot(page, "settings-data");

  // Scroll down
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "settings-data-scrolled");

  // ──────────────────────────────────────────
  // STEP 7: SETTINGS - DANGER ZONE
  // ──────────────────────────────────────────
  console.log("\n[STEP 7] Settings > Danger Zone...");
  await safeGoto(page, `${BASE}/dashboard/settings/danger-zone`, "Settings Danger Zone");

  // Check for delete account section
  const deleteSection = page.locator("text=/Delete|Supprimer/i").first();
  const hasDelete = await deleteSection.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Delete account section visible: ${hasDelete}`);

  // Check for confirmation input (type "delete" to confirm)
  const confirmInput = page.locator('input').first();
  const hasConfirmInput = await confirmInput.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Confirmation input visible: ${hasConfirmInput}`);

  // Check for disabled delete button
  const deleteBtn = page.locator("button:has-text('Delete'), button:has-text('Supprimer')").first();
  const isDeleteDisabled = await deleteBtn.isDisabled({ timeout: 3000 }).catch(() => null);
  console.log(`  Delete button disabled (safety): ${isDeleteDisabled}`);

  await screenshot(page, "settings-danger-zone");

  // ──────────────────────────────────────────
  // STEP 8: SETTINGS - API KEYS
  // ──────────────────────────────────────────
  console.log("\n[STEP 8] Settings > API Keys...");
  await safeGoto(page, `${BASE}/dashboard/settings/api-keys`, "Settings API Keys");

  // Check for create key button
  const createKeyBtn = page.locator("button:has-text('Create'), button:has-text('Créer'), button:has-text('Generate'), button:has-text('Générer')").first();
  const hasCreateKey = await createKeyBtn.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Create API key button visible: ${hasCreateKey}`);

  // Check for existing keys list
  const keysList = page.locator("text=/No.*key|Aucune.*clé|API.*Key|Clé API/i").first();
  const hasKeysList = await keysList.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  API keys section visible: ${hasKeysList}`);

  await screenshot(page, "settings-api-keys");

  // ──────────────────────────────────────────
  // STEP 9: PROFILE PAGE
  // ──────────────────────────────────────────
  console.log("\n[STEP 9] Profile page...");
  await safeGoto(page, `${BASE}/dashboard/profile`, "Profile");

  // Check for profile header
  const profileName = page.locator("text=/admin/i").first();
  const hasProfileName = await profileName.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Profile name/user visible: ${hasProfileName}`);

  // Check for tabs
  const tabButtons = page.locator('[role="tablist"] button, [role="tab"]');
  const tabCount = await tabButtons.count();
  console.log(`  Tab buttons found: ${tabCount}`);

  // List all tab names
  for (let i = 0; i < tabCount; i++) {
    try {
      const tabText = await tabButtons.nth(i).textContent();
      console.log(`    Tab ${i + 1}: "${tabText?.trim()}"`);
    } catch {}
  }

  // Check for stats/cards
  const cards = page.locator('[class*="CardContent"], [class*="card-content"]');
  const cardCount = await cards.count();
  console.log(`  Card elements count: ${cardCount}`);

  await screenshot(page, "profile-overview");

  // Click through each tab and screenshot
  for (let i = 0; i < Math.min(tabCount, 6); i++) {
    try {
      const tab = tabButtons.nth(i);
      const tabText = await tab.textContent();
      const cleanTabName = tabText?.trim()?.replace(/[^a-zA-Z0-9]/g, "-")?.slice(0, 20) || `tab-${i}`;
      console.log(`  Clicking tab: "${tabText?.trim()}"`);
      await tab.click();
      await page.waitForTimeout(1500);
      await screenshot(page, `profile-tab-${cleanTabName}`);
    } catch (err) {
      console.log(`  [WARN] Could not click tab ${i}: ${err.message}`);
    }
  }

  // ──────────────────────────────────────────
  // STEP 10: PROFILE - ACHIEVEMENTS PAGE
  // ──────────────────────────────────────────
  console.log("\n[STEP 10] Profile > Achievements...");
  await safeGoto(page, `${BASE}/dashboard/profile/achievements`, "Profile Achievements");

  // Check for achievements content
  const achievementsTitle = page.locator("text=/Achievement|Réalisation|Badge|Accomplishment|Trophée/i").first();
  const hasAchievements = await achievementsTitle.isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`  Achievements section visible: ${hasAchievements}`);

  // Check for any badge/achievement items
  const achievementItems = page.locator('[class*="achievement"], [class*="badge"], [class*="trophy"]');
  const achievementCount = await achievementItems.count();
  console.log(`  Achievement item elements: ${achievementCount}`);

  await screenshot(page, "profile-achievements");

  // Scroll for more
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot(page, "profile-achievements-scrolled");

  // ──────────────────────────────────────────
  // STEP 11: SETTINGS SIDEBAR NAVIGATION
  // ──────────────────────────────────────────
  console.log("\n[STEP 11] Checking settings sidebar navigation...");
  await safeGoto(page, `${BASE}/dashboard/settings/profile`, "Settings Profile");

  // Look for settings sub-navigation links
  const settingsLinks = page.locator('a[href*="/settings/"]');
  const settingsLinkCount = await settingsLinks.count();
  console.log(`  Settings sub-navigation links found: ${settingsLinkCount}`);

  for (let i = 0; i < Math.min(settingsLinkCount, 10); i++) {
    try {
      const link = settingsLinks.nth(i);
      const href = await link.getAttribute("href");
      const text = await link.textContent();
      const isVisible = await link.isVisible().catch(() => false);
      console.log(`    Link ${i + 1}: "${text?.trim()}" -> ${href} (visible: ${isVisible})`);
    } catch {}
  }

  await screenshot(page, "settings-navigation-sidebar");

  // ──────────────────────────────────────────
  // STEP 12: FINAL ERROR CHECK
  // ──────────────────────────────────────────
  console.log("\n[STEP 12] Final checks...");

  // Look for error boundaries or error components
  const errorComponents = page.locator("text=/Something went wrong|Error|Erreur|Une erreur/i");
  const errorCount = await errorComponents.count();
  console.log(`  Error components visible: ${errorCount}`);

  // Check body for empty content
  const bodyText = await page.locator("body").textContent();
  console.log(`  Page body length: ${bodyText?.length || 0} chars`);

  // ──────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────
  console.log("\n\n=== CONSOLE ERRORS COLLECTED ===");
  if (consoleErrors.length === 0) {
    console.log("  No console errors detected.");
  } else {
    // Deduplicate and show
    const uniqueErrors = [...new Set(consoleErrors)];
    console.log(`  ${uniqueErrors.length} unique console errors (${consoleErrors.length} total):`);
    for (const err of uniqueErrors.slice(0, 30)) {
      console.log(`  [ERROR] ${err.slice(0, 200)}`);
    }
  }

  console.log("\n=== TEST COMPLETE ===");
  console.log(`Total screenshots: ${screenshotIndex - 1}`);

  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
