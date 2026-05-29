import { chromium } from "playwright";

const SCREENSHOT_DIR = "C:/tmp";
let screenshotCount = 0;

async function screenshot(page, label) {
  screenshotCount++;
  const filename = `test-admin-${String(screenshotCount).padStart(2, "0")}.png`;
  const filepath = `${SCREENSHOT_DIR}/${filename}`;
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  [SCREENSHOT] ${filename} - ${label}`);
  return filepath;
}

async function dismissOverlay(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function waitAndCheck(page, url, label, timeout = 15000) {
  console.log(`\n--- Navigating to: ${label} (${url}) ---`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout });
    await dismissOverlay(page);
    await page.waitForTimeout(2000);
    await dismissOverlay(page);

    // Check for error messages on the page
    const errorMessages = await page.evaluate(() => {
      const errors = [];
      // Look for common error indicators
      document.querySelectorAll('[role="alert"], .error, .text-destructive, [data-error]').forEach(el => {
        if (el.textContent.trim()) errors.push(el.textContent.trim().substring(0, 200));
      });
      return errors;
    });

    if (errorMessages.length > 0) {
      console.log(`  [WARN] Error messages found on ${label}:`);
      errorMessages.forEach(msg => console.log(`    - ${msg}`));
    }

    // Check page title / heading
    const headings = await page.evaluate(() => {
      const h = [];
      document.querySelectorAll("h1, h2, h3").forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length < 200) h.push(text);
      });
      return h.slice(0, 5);
    });
    if (headings.length > 0) {
      console.log(`  [INFO] Page headings: ${headings.join(" | ")}`);
    }

    return true;
  } catch (err) {
    console.log(`  [FAIL] Navigation error: ${err.message}`);
    return false;
  }
}

async function checkTableContent(page, tableLabel) {
  const tableInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    if (tables.length === 0) return { found: false, message: "No <table> elements found" };

    const results = [];
    tables.forEach((table, i) => {
      const rows = table.querySelectorAll("tbody tr");
      const headers = Array.from(table.querySelectorAll("thead th, thead td")).map(th => th.textContent.trim());
      const firstRowCells = rows.length > 0
        ? Array.from(rows[0].querySelectorAll("td")).map(td => td.textContent.trim().substring(0, 50))
        : [];
      results.push({
        index: i,
        headerCount: headers.length,
        headers: headers.slice(0, 8),
        rowCount: rows.length,
        firstRow: firstRowCells.slice(0, 6),
      });
    });
    return { found: true, tables: results };
  });

  if (!tableInfo.found) {
    console.log(`  [WARN] ${tableLabel}: ${tableInfo.message}`);
  } else {
    tableInfo.tables.forEach(t => {
      console.log(`  [INFO] ${tableLabel} Table ${t.index}: ${t.rowCount} rows, headers: [${t.headers.join(", ")}]`);
      if (t.firstRow.length > 0) {
        console.log(`         First row: [${t.firstRow.join(", ")}]`);
      }
      if (t.rowCount === 0) {
        console.log(`  [WARN] ${tableLabel} Table ${t.index} is EMPTY`);
      }
    });
  }
  return tableInfo;
}

async function checkCards(page, label) {
  const cardInfo = await page.evaluate(() => {
    // Look for card-like elements
    const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
    const results = [];
    cards.forEach((card, i) => {
      if (i < 10) {
        const title = card.querySelector('h3, h4, [class*="title"], [class*="Title"]');
        const text = card.textContent.trim().substring(0, 100);
        results.push({
          title: title ? title.textContent.trim() : null,
          preview: text,
        });
      }
    });
    return results;
  });

  if (cardInfo.length > 0) {
    console.log(`  [INFO] ${label}: Found ${cardInfo.length} card-like elements`);
    cardInfo.slice(0, 5).forEach((c, i) => {
      if (c.title) console.log(`    Card ${i}: "${c.title}"`);
    });
  }
  return cardInfo;
}

async function checkButtons(page, label) {
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("button, a[role='button'], [role='tab']"))
      .map(b => b.textContent.trim())
      .filter(t => t.length > 0 && t.length < 50)
      .slice(0, 15);
  });
  if (buttons.length > 0) {
    console.log(`  [INFO] ${label} Buttons/Tabs: [${buttons.join(", ")}]`);
  }
  return buttons;
}

(async () => {
  console.log("=== ADMIN PANEL TEST SCRIPT ===\n");
  console.log("Starting Playwright browser...");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Capture console errors
  const consoleErrors = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text().substring(0, 200));
    }
  });

  // =====================================================
  // STEP 1: LOGIN
  // =====================================================
  console.log("\n========== STEP 1: LOGIN ==========");
  await page.goto("http://localhost:3040/auth/login", { waitUntil: "networkidle", timeout: 20000 });
  await dismissOverlay(page);
  await page.waitForTimeout(1500);
  await dismissOverlay(page);

  await screenshot(page, "Login page");

  // Fill login form
  try {
    const emailInput = page.getByPlaceholder("john.doe@example.com");
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill("admin@test.com");
    console.log("  [OK] Email filled");

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill("TestAccount123!");
    console.log("  [OK] Password filled");

    await screenshot(page, "Login form filled");

    // Click submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    console.log("  [OK] Submit clicked");

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard/**", { timeout: 15000 });
    await dismissOverlay(page);
    await page.waitForTimeout(2000);
    await dismissOverlay(page);
    console.log("  [PASS] Login successful, redirected to:", page.url());
    await screenshot(page, "Dashboard after login");
  } catch (err) {
    console.log(`  [FAIL] Login failed: ${err.message}`);
    await screenshot(page, "Login failure");
  }

  // =====================================================
  // STEP 2: ADMIN DASHBOARD
  // =====================================================
  console.log("\n========== STEP 2: ADMIN DASHBOARD ==========");
  const adminLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin", "Admin Dashboard");
  if (adminLoaded) {
    await checkCards(page, "Admin Dashboard");
    await checkButtons(page, "Admin Dashboard");
    await screenshot(page, "Admin Dashboard");
  }

  // =====================================================
  // STEP 3: USER MANAGEMENT
  // =====================================================
  console.log("\n========== STEP 3: USER MANAGEMENT ==========");
  const usersLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin/users", "User Management");
  if (usersLoaded) {
    await page.waitForTimeout(2000); // Wait for data to load
    await dismissOverlay(page);

    const tableInfo = await checkTableContent(page, "Users");
    await checkButtons(page, "Users");

    // Look for test accounts in the page
    const pageText = await page.textContent("body");
    const testAccounts = ["admin@test.com", "student1@test.com", "student2@test.com", "partner@test.com"];
    for (const account of testAccounts) {
      if (pageText.includes(account)) {
        console.log(`  [PASS] Found test account: ${account}`);
      } else {
        console.log(`  [WARN] Test account NOT found: ${account}`);
      }
    }

    await screenshot(page, "User Management page");
  }

  // =====================================================
  // STEP 4: AI PROVIDERS
  // =====================================================
  console.log("\n========== STEP 4: AI PROVIDERS ==========");
  const aiProvidersLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin/ai-providers", "AI Providers");
  if (aiProvidersLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);

    await checkTableContent(page, "AI Providers");
    await checkCards(page, "AI Providers");
    await checkButtons(page, "AI Providers");

    // Check for DeepSeek mention
    const bodyText = await page.textContent("body");
    if (bodyText.toLowerCase().includes("deepseek")) {
      console.log("  [PASS] DeepSeek provider found on page");
    } else {
      console.log("  [WARN] DeepSeek provider NOT found on page");
    }

    await screenshot(page, "AI Providers page");
  }

  // =====================================================
  // STEP 5: AI QUOTAS
  // =====================================================
  console.log("\n========== STEP 5: AI QUOTAS ==========");
  const aiQuotasLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin/ai-quotas", "AI Quotas");
  if (aiQuotasLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);

    await checkTableContent(page, "AI Quotas");
    await checkCards(page, "AI Quotas");
    await checkButtons(page, "AI Quotas");

    await screenshot(page, "AI Quotas page");
  }

  // =====================================================
  // STEP 6: AI SETTINGS
  // =====================================================
  console.log("\n========== STEP 6: AI SETTINGS ==========");
  const aiSettingsLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin/ai-settings", "AI Settings");
  if (aiSettingsLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);

    await checkCards(page, "AI Settings");
    await checkButtons(page, "AI Settings");

    // Check for form elements
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll("input, select, textarea");
      const labels = document.querySelectorAll("label");
      return {
        inputCount: inputs.length,
        labelCount: labels.length,
        labels: Array.from(labels).map(l => l.textContent.trim()).filter(t => t.length > 0 && t.length < 100).slice(0, 10),
      };
    });
    console.log(`  [INFO] AI Settings: ${formElements.inputCount} inputs, ${formElements.labelCount} labels`);
    if (formElements.labels.length > 0) {
      console.log(`  [INFO] Labels: [${formElements.labels.join(", ")}]`);
    }

    await screenshot(page, "AI Settings page");
  }

  // =====================================================
  // STEP 7: REFERENCE DATA
  // =====================================================
  console.log("\n========== STEP 7: REFERENCE DATA ==========");
  const refDataLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/admin/reference-data", "Reference Data");
  if (refDataLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);

    // Check for tabs
    const tabs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="tab"], [data-state], button[class*="tab"]'))
        .map(t => t.textContent.trim())
        .filter(t => t.length > 0 && t.length < 50);
    });
    if (tabs.length > 0) {
      console.log(`  [INFO] Reference Data tabs: [${tabs.join(", ")}]`);
    }

    await checkTableContent(page, "Reference Data");
    await checkCards(page, "Reference Data");
    await checkButtons(page, "Reference Data");

    await screenshot(page, "Reference Data page");

    // Try clicking different tabs if they exist
    const tabElements = await page.locator('[role="tab"]').all();
    for (let i = 0; i < Math.min(tabElements.length, 4); i++) {
      try {
        const tabText = await tabElements[i].textContent();
        await tabElements[i].click();
        await page.waitForTimeout(1500);
        await dismissOverlay(page);
        console.log(`  [INFO] Clicked tab: "${tabText.trim()}"`);
        await checkTableContent(page, `Tab "${tabText.trim()}"`);
        await screenshot(page, `Reference Data - Tab: ${tabText.trim()}`);
      } catch (err) {
        console.log(`  [WARN] Could not click tab ${i}: ${err.message}`);
      }
    }
  }

  // =====================================================
  // STEP 8: ANALYTICS
  // =====================================================
  console.log("\n========== STEP 8: ANALYTICS ==========");
  const analyticsLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/analytics", "Analytics");
  if (analyticsLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);
    await checkCards(page, "Analytics");
    await checkButtons(page, "Analytics");
    await screenshot(page, "Analytics page");
  }

  // =====================================================
  // STEP 9: AI USAGE ANALYTICS
  // =====================================================
  console.log("\n========== STEP 9: AI USAGE ANALYTICS ==========");
  const aiUsageLoaded = await waitAndCheck(page, "http://localhost:3040/dashboard/analytics/ai-usage", "AI Usage Analytics");
  if (aiUsageLoaded) {
    await page.waitForTimeout(2000);
    await dismissOverlay(page);
    await checkCards(page, "AI Usage Analytics");
    await checkButtons(page, "AI Usage Analytics");
    await checkTableContent(page, "AI Usage");
    await screenshot(page, "AI Usage Analytics page");
  }

  // =====================================================
  // FINAL SUMMARY
  // =====================================================
  console.log("\n\n========== FINAL SUMMARY ==========");
  console.log(`Total screenshots taken: ${screenshotCount}`);
  console.log(`Console errors captured: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Console errors:");
    consoleErrors.slice(0, 20).forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }

  console.log("\n=== TEST COMPLETE ===");

  // Keep browser open briefly for visual inspection
  await page.waitForTimeout(3000);
  await browser.close();
})();
