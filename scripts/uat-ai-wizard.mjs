/**
 * UAT: AI Resume Wizard End-to-End Test
 * Tests all 4 modes: Generate Resume, Gap Analysis, Adapt to Job, AI Chat
 * Run: node scripts/uat-ai-wizard.mjs
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
let screenshotNum = 1;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(page, label) {
  const num = String(screenshotNum++).padStart(2, "0");
  const path = `${SCREENSHOT_DIR}/uat-wizard-${num}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  [SCREENSHOT ${num}] ${label} -> ${path}`);
  return path;
}

async function dismissOverlay(page) {
  try {
    // Remove Vite error overlay
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
  try {
    // Also press Escape to close any overlay
    await page.keyboard.press("Escape");
  } catch {}
  try {
    // Remove any overlay from shadow DOM
    await page.evaluate(() => {
      const overlays = document.querySelectorAll("vite-error-overlay");
      overlays.forEach((el) => el.remove());
      // Also try clicking outside
      document.body.click();
    });
  } catch {}
  await sleep(300);
}

async function waitForNetworkIdle(page, timeout = 5000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {}
}

/**
 * Select a wizard mode by clicking the Card that contains the given label text.
 * Waits for the "Selectionne" badge to appear to confirm selection.
 */
async function selectMode(page, modeLabel) {
  // Wait for mode cards to be rendered
  await page.waitForSelector("text=Generer un CV", { timeout: 8000 });
  await sleep(1000); // Let animation finish

  // Find the card element that contains this mode label
  // The Card component has onClick, and text is inside a <p> inside CardContent
  const card = page.locator('[class*="cursor-pointer"]').filter({ hasText: modeLabel });
  const count = await card.count();
  console.log(`  [INFO] Found ${count} cards matching "${modeLabel}"`);

  if (count > 0) {
    await card.first().click();
    await sleep(800);

    // Verify selection by checking for "Selectionne" badge
    const badge = page.locator("text=Selectionne");
    const badgeVisible = await badge.isVisible({ timeout: 2000 }).catch(() => false);
    if (badgeVisible) {
      console.log(`  [PASS] Mode "${modeLabel}" selected (badge visible)`);
    } else {
      console.log(`  [WARN] Mode "${modeLabel}" clicked but badge not visible`);
    }
    return true;
  }
  console.log(`  [WARN] No card found for "${modeLabel}"`);
  return false;
}

/**
 * Click Commencer and wait for step transition
 */
async function clickCommencer(page) {
  const btn = page.locator("button").filter({ hasText: "Commencer" });
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    const disabled = await btn.isDisabled();
    if (disabled) {
      console.log("  [WARN] Commencer is disabled");
      return false;
    }
    await btn.click();
    await sleep(2000);
    await dismissOverlay(page);
    console.log("  [PASS] Clicked Commencer");
    return true;
  }
  console.log("  [WARN] Commencer not visible");
  return false;
}

/**
 * Select a resume from the resume selector step
 */
async function selectResume(page) {
  // Wait for resume list to load
  await sleep(1500);

  // Look for resume cards - they have a clipboard icon and are inside the grid
  // The resume selector renders Card components with onClick
  const cards = page.locator('[class*="cursor-pointer"]');
  const count = await cards.count();
  console.log(`  [INFO] Found ${count} clickable cards in resume selector`);

  // Also try looking for the search input which indicates we're on resume select step
  const searchInput = page.locator('input[placeholder*="Rechercher"]');
  const onResumeStep = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);

  if (onResumeStep) {
    console.log("  [PASS] On resume selection step (search bar visible)");
  } else {
    console.log("  [WARN] Search bar not found - may not be on resume step");
  }

  // Click first card that's NOT a mode card
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();
    if (
      !text.includes("Generer un CV") &&
      !text.includes("Analyse des lacunes") &&
      !text.includes("Adapter a une offre") &&
      !text.includes("Chat IA")
    ) {
      await card.click();
      const trimmed = text.trim().replace(/\s+/g, " ").substring(0, 50);
      console.log(`  [PASS] Selected resume: "${trimmed}"`);
      await sleep(500);
      return true;
    }
  }

  console.log("  [WARN] No resume cards found");
  return false;
}

/**
 * Click Continuer button
 */
async function clickContinuer(page) {
  const btn = page.locator("button").filter({ hasText: "Continuer" });
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    if (await btn.isDisabled()) {
      console.log("  [WARN] Continuer is disabled");
      return false;
    }
    await btn.click();
    await sleep(2000);
    await dismissOverlay(page);
    console.log("  [PASS] Clicked Continuer");
    return true;
  }
  console.log("  [WARN] Continuer not visible");
  return false;
}

// =========================================================================
// MAIN
// =========================================================================
(async () => {
  console.log("=== UAT: AI Resume Wizard ===\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: "fr-FR",
  });

  const page = await context.newPage();

  // =========================================================================
  // STEP 0: LOGIN
  // =========================================================================
  console.log("[STEP 0] Login as student1@test.com...");
  try {
    await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);
    await dismissOverlay(page);
    await waitForNetworkIdle(page, 8000);
    await dismissOverlay(page);
    await sleep(500);
    await dismissOverlay(page);

    const emailField = page.locator('input[placeholder="john.doe@example.com"]');
    await emailField.waitFor({ state: "visible", timeout: 10000 });
    await emailField.focus();
    await sleep(200);
    await emailField.fill("student1@test.com");
    await sleep(500);

    const passField = page.locator('input[type="password"]');
    await passField.focus();
    await sleep(200);
    await passField.fill("TestAccount123!");
    await sleep(500);

    await page.locator('button[type="submit"]').click();

    try {
      await page.waitForURL("**/dashboard**", { timeout: 30000 });
      await sleep(3000);
      await dismissOverlay(page);
      console.log("  [PASS] Login successful");
    } catch {
      await sleep(2000);
      if (page.url().includes("dashboard")) {
        console.log("  [PASS] Login successful (slow redirect)");
      } else {
        console.log(`  [FAIL] Login failed. URL: ${page.url()}`);
        await screenshot(page, "Login FAILED");
        await browser.close();
        process.exit(1);
      }
    }
    await screenshot(page, "After login");
  } catch (err) {
    console.log(`  [FAIL] Login error: ${err.message}`);
    await screenshot(page, "Login FAILED");
    await browser.close();
    process.exit(1);
  }

  // =========================================================================
  // STEP 1: Navigate to AI Wizard
  // =========================================================================
  console.log("\n[STEP 1] Navigate to AI Wizard...");
  try {
    await page.goto(`${BASE}/dashboard/resumes/ai-wizard`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await sleep(4000);
    await dismissOverlay(page);
    await waitForNetworkIdle(page);

    const bodyText = await page.textContent("body");
    if (bodyText.includes("Assistant CV IA") || bodyText.includes("Generer un CV")) {
      console.log("  [PASS] AI Wizard page loaded");
    } else {
      console.log("  [WARN] Wizard content not found");
    }
    await screenshot(page, "AI Wizard landing");
  } catch (err) {
    console.log(`  [FAIL] Navigate failed: ${err.message}`);
    await screenshot(page, "Navigation FAILED");
  }

  // =========================================================================
  // STEP 2: TEST GENERATE RESUME MODE
  // =========================================================================
  console.log("\n[STEP 2] Test Generate Resume mode...");
  try {
    await dismissOverlay(page);
    await selectMode(page, "Generer un CV");
    await screenshot(page, "Generate mode selected");
    await clickCommencer(page);
    await screenshot(page, "Generate form");

    const nameInput = page.locator('#gen-name');
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill("Fatima Benali");
      await page.locator('#gen-job').fill("Ingenieur DevOps");
      await page.locator('#gen-email').fill("fatima@test.com");
      await page.locator('#gen-skills').fill("Docker, Kubernetes, CI/CD, Linux, Python");
      console.log("  [PASS] Form filled");

      await screenshot(page, "Generate form filled");

      const genBtn = page.locator("button").filter({ hasText: /Generer mon CV/ });
      if (await genBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await genBtn.click();
        console.log("  [INFO] Generating resume (up to 60s)...");

        const result = await Promise.race([
          page.waitForURL("**/builder/**", { timeout: 60000 }).then(() => "navigated"),
          page.waitForSelector('[data-sonner-toast]', { timeout: 60000 }).then(() => "toast"),
          sleep(60000).then(() => "timeout"),
        ]).catch(() => "error");

        await sleep(2000);
        await dismissOverlay(page);

        if (result === "navigated" || page.url().includes("/builder/")) {
          console.log("  [PASS] Resume generated! Navigated to builder");
        } else if (result === "toast") {
          const toasts = await page.locator('[data-sonner-toast]').allTextContents();
          console.log(`  [WARN] Toast: ${toasts.join(", ")}`);
        } else {
          console.log("  [WARN] Generation timed out");
        }
      }
    } else {
      console.log("  [WARN] Form not visible");
    }
    await screenshot(page, "After generate");
  } catch (err) {
    console.log(`  [FAIL] Generate error: ${err.message}`);
    await screenshot(page, "Generate FAILED");
  }

  // =========================================================================
  // STEP 3: TEST GAP ANALYSIS MODE
  // =========================================================================
  console.log("\n[STEP 3] Test Gap Analysis mode...");
  try {
    await page.goto(`${BASE}/dashboard/resumes/ai-wizard`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await sleep(4000);
    await dismissOverlay(page);
    await waitForNetworkIdle(page);

    const modeSelected = await selectMode(page, "Analyse des lacunes");
    await screenshot(page, "Gap mode selected");

    if (modeSelected) {
      const started = await clickCommencer(page);
      if (started) {
        await screenshot(page, "Gap - resume select");
        const resumeChosen = await selectResume(page);
        if (resumeChosen) {
          const continued = await clickContinuer(page);
          if (continued) {
            await screenshot(page, "Gap - execute step");

            // Fill target role
            const targetInput = page.locator('#target-role');
            if (await targetInput.isVisible({ timeout: 5000 }).catch(() => false)) {
              await targetInput.fill("Data Scientist");
              console.log("  [PASS] Filled target role");

              const analyzeBtn = page.locator("button").filter({ hasText: "Analyser le CV" });
              if (await analyzeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await analyzeBtn.click();
                console.log("  [INFO] Analyzing (up to 30s)...");

                const result = await Promise.race([
                  page.waitForSelector("text=Score global", { timeout: 30000 }).then(() => "score"),
                  page.waitForSelector('[data-sonner-toast]', { timeout: 30000 }).then(() => "toast"),
                  sleep(30000).then(() => "timeout"),
                ]).catch(() => "catch");

                await sleep(2000);
                await dismissOverlay(page);

                if (result === "score") {
                  console.log("  [PASS] Gap analysis completed - score visible");
                  await screenshot(page, "Gap analysis results");

                  // Try Apply Fixes
                  const applyBtn = page.locator("button").filter({ hasText: "Appliquer les corrections" });
                  if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await applyBtn.click();
                    console.log("  [INFO] Applying fixes...");
                    await Promise.race([
                      page.waitForSelector("text=Corrections appliquees", { timeout: 30000 }),
                      sleep(30000),
                    ]).catch(() => {});
                    await sleep(1500);
                    const applied = await page.locator("text=Corrections appliquees").count();
                    console.log(applied > 0 ? "  [PASS] Fixes applied" : "  [WARN] Fix status unclear");
                  }
                } else if (result === "toast") {
                  const toasts = await page.locator('[data-sonner-toast]').allTextContents();
                  console.log(`  [WARN] Toast: ${toasts.join(", ")}`);
                } else {
                  console.log("  [WARN] Analysis timed out");
                }
              }
            } else {
              console.log("  [WARN] Target role input not visible");
            }
          }
        }
      }
    }
    await screenshot(page, "Gap final");
  } catch (err) {
    console.log(`  [FAIL] Gap Analysis error: ${err.message}`);
    await screenshot(page, "Gap FAILED");
  }

  // =========================================================================
  // STEP 4: TEST ADAPT TO JOB MODE
  // =========================================================================
  console.log("\n[STEP 4] Test Adapt to Job mode...");
  try {
    await page.goto(`${BASE}/dashboard/resumes/ai-wizard`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await sleep(4000);
    await dismissOverlay(page);
    await waitForNetworkIdle(page);

    const modeSelected = await selectMode(page, "Adapter a une offre");
    if (modeSelected) {
      const started = await clickCommencer(page);
      if (started) {
        const resumeChosen = await selectResume(page);
        if (resumeChosen) {
          const continued = await clickContinuer(page);
          if (continued) {
            await screenshot(page, "Adapt - execute step");

            const jobDesc = page.locator('#job-desc');
            if (await jobDesc.isVisible({ timeout: 5000 }).catch(() => false)) {
              await jobDesc.fill("Recherche ingenieur logiciel senior, React/Node.js/TypeScript, 5 ans experience, methodes agiles, Casablanca");
              console.log("  [PASS] Filled job description");
              await screenshot(page, "Adapt form filled");

              const adaptBtn = page.locator("button").filter({ hasText: "Adapter le CV" });
              if (await adaptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await adaptBtn.click();
                console.log("  [INFO] Adapting (up to 30s)...");

                const result = await Promise.race([
                  page.waitForSelector("text=Score de correspondance", { timeout: 30000 }).then(() => "score"),
                  page.waitForSelector('[data-sonner-toast]', { timeout: 30000 }).then(() => "toast"),
                  sleep(30000).then(() => "timeout"),
                ]).catch(() => "catch");

                await sleep(2000);
                await dismissOverlay(page);

                if (result === "score") {
                  console.log("  [PASS] Adapt results loaded");
                  await screenshot(page, "Adapt results");

                  const applyBtn = page.locator("button").filter({ hasText: "Appliquer au CV" });
                  if (await applyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await applyBtn.click();
                    await Promise.race([
                      page.waitForSelector("text=Adaptations appliquees", { timeout: 30000 }),
                      sleep(30000),
                    ]).catch(() => {});
                    await sleep(1500);
                    const applied = await page.locator("text=Adaptations appliquees").count();
                    console.log(applied > 0 ? "  [PASS] Adaptations applied" : "  [WARN] Apply status unclear");
                  }
                } else if (result === "toast") {
                  const toasts = await page.locator('[data-sonner-toast]').allTextContents();
                  console.log(`  [WARN] Toast: ${toasts.join(", ")}`);
                } else {
                  console.log("  [WARN] Adapt timed out");
                }
              }
            } else {
              console.log("  [WARN] Job desc textarea not visible");
            }
          }
        }
      }
    }
    await screenshot(page, "Adapt final");
  } catch (err) {
    console.log(`  [FAIL] Adapt error: ${err.message}`);
    await screenshot(page, "Adapt FAILED");
  }

  // =========================================================================
  // STEP 5: TEST AI CHAT MODE
  // =========================================================================
  console.log("\n[STEP 5] Test AI Chat mode...");
  try {
    await page.goto(`${BASE}/dashboard/resumes/ai-wizard`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await sleep(4000);
    await dismissOverlay(page);
    await waitForNetworkIdle(page);

    const modeSelected = await selectMode(page, "Chat IA");
    if (modeSelected) {
      const started = await clickCommencer(page);
      if (started) {
        const resumeChosen = await selectResume(page);
        if (resumeChosen) {
          const continued = await clickContinuer(page);
          if (continued) {
            await screenshot(page, "Chat - initial view");

            const chatArea = page.locator('textarea').first();
            if (await chatArea.isVisible({ timeout: 5000 }).catch(() => false)) {
              await chatArea.fill("Quels sont les points faibles de mon CV pour un poste DevOps?");
              console.log("  [PASS] Typed chat message");
              await screenshot(page, "Chat - message typed");

              // Click send - find the small icon button next to textarea
              // Use the button inside the border-t div that contains the textarea
              const chatContainer = page.locator('.border-t').last();
              const sendBtn = chatContainer.locator('button');
              if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await sendBtn.click();
                console.log("  [PASS] Clicked send");
              } else {
                // Fallback
                await chatArea.press("Enter");
                console.log("  [INFO] Pressed Enter to send");
              }

              console.log("  [INFO] Waiting for response (up to 30s)...");

              const result = await Promise.race([
                page.waitForFunction(() => {
                  const bubbles = document.querySelectorAll('[class*="justify-start"]');
                  for (const b of bubbles) {
                    const text = b.textContent || "";
                    if (text.length > 15 && !text.includes("Demarrer") && !text.includes("Reflexion")) return true;
                  }
                  return false;
                }, { timeout: 30000 }).then(() => "response"),
                page.waitForSelector('[data-sonner-toast][data-type="error"]', { timeout: 30000 }).then(() => "error"),
                sleep(30000).then(() => "timeout"),
              ]).catch(() => "catch");

              await sleep(1500);
              await dismissOverlay(page);

              if (result === "response") {
                const bubbles = await page.locator('[class*="justify-start"] [class*="rounded-2xl"]').allTextContents();
                const aiReply = bubbles.find(t => t.length > 15 && !t.includes("Reflexion") && !t.includes("Demarrer"));
                console.log(`  [PASS] AI responded: "${(aiReply || "").substring(0, 100)}..."`);
              } else {
                console.log(`  [WARN] Chat result: ${result}`);
              }
            } else {
              console.log("  [WARN] Chat textarea not visible");
            }
          }
        }
      }
    }
    await screenshot(page, "Chat final");
  } catch (err) {
    console.log(`  [FAIL] Chat error: ${err.message}`);
    await screenshot(page, "Chat FAILED");
  }

  // =========================================================================
  // FINAL
  // =========================================================================
  console.log("\n=== UAT COMPLETE ===");
  console.log(`Total screenshots: ${screenshotNum - 1}`);
  console.log(`Screenshots at: ${SCREENSHOT_DIR}/uat-wizard-*.png`);

  await sleep(2000);
  await browser.close();
  console.log("Browser closed.");
})();
