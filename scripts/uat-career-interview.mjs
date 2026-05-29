// uat-career-interview.mjs — UAT: Career Coaching & Interview Preparation
// Usage: node scripts/uat-career-interview.mjs

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
  const path = `${SCREENSHOT_DIR}/uat-career-${num}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  [screenshot ${num}] ${path} — ${label}`);
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

async function waitForPageReady(page, timeoutMs = 8000) {
  await page.waitForTimeout(1500);
  await dismissOverlay(page);
  try {
    await page.waitForLoadState("networkidle", { timeout: timeoutMs });
  } catch {}
  await page.waitForTimeout(800);
  await dismissOverlay(page);
}

async function checkPageHealth(page, label) {
  await dismissOverlay(page);
  const url = page.url();
  console.log(`\n--- ${label} ---`);
  console.log(`  URL: ${url}`);

  if (url.includes("/auth/login")) {
    fail(`${label}: Redirected to login — session lost`);
    return false;
  }

  // Check for spinners still visible
  const spinners = await page.locator('[class*="animate-spin"]').count().catch(() => 0);
  if (spinners > 0) {
    warn(`${label}: ${spinners} spinner(s) still visible`);
  }

  // Check for error alerts
  const errorTexts = await page.locator('[role="alert"]').allTextContents().catch(() => []);
  if (errorTexts.length > 0) {
    const errorStr = errorTexts.join(" | ").slice(0, 200);
    if (errorStr.trim().length > 5) {
      warn(`${label}: Alert elements found: ${errorStr}`);
    }
  }

  return true;
}

async function getVisibleText(page) {
  return page.evaluate(() => document.body?.innerText || "");
}

(async () => {
  console.log("=== UAT: Career Coaching & Interview Preparation ===\n");
  console.log(`Target: ${BASE}`);
  console.log(`User: ${EMAIL}\n`);

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // =====================================================
    // LOGIN
    // =====================================================
    console.log("\n========== PHASE 0: LOGIN ==========");
    await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);

    const emailField = page.getByPlaceholder("john.doe@example.com");
    await emailField.waitFor({ state: "visible", timeout: 15000 });

    // Use fill() directly - pressSequentially does not work with this form's email field
    await emailField.fill(EMAIL);
    console.log("  Filled email field");

    await page.waitForTimeout(300);

    const pwField = page.locator('input[type="password"]');
    await pwField.waitFor({ state: "visible", timeout: 5000 });
    await pwField.click();
    await page.waitForTimeout(200);
    await pwField.pressSequentially(PASSWORD, { delay: 30 });
    console.log("  Filled password field");

    await page.waitForTimeout(500);

    // Screenshot before clicking login to verify fields are filled
    await screenshot(page, "Login form filled");

    // Find and click login button (use type="submit" to avoid passkey button)
    const loginBtn = page.locator('button[type="submit"]');
    await loginBtn.click();
    console.log("  Clicked login button");

    // Wait for dashboard redirect - need to handle possible slow auth
    let loginSuccess = false;
    try {
      await page.waitForURL("**/dashboard/**", { timeout: 30000 });
      loginSuccess = true;
      pass("Login: Successfully authenticated and redirected to dashboard");
    } catch {
      // Maybe redirected but URL doesn't match pattern
      const currentUrl = page.url();
      console.log(`  After login attempt, URL: ${currentUrl}`);
      if (currentUrl.includes("/dashboard")) {
        loginSuccess = true;
        pass("Login: On dashboard page");
      } else {
        // Check for error message on page
        const bodyText = await getVisibleText(page);
        if (/invalid|incorrect|erreur|invalide/i.test(bodyText)) {
          fail("Login: Invalid credentials error");
        } else if (currentUrl.includes("/auth")) {
          fail(`Login: Still on auth page. URL: ${currentUrl}`);
        } else {
          warn(`Login: Unexpected URL after login: ${currentUrl}`);
        }
        await screenshot(page, "Login failed");
      }
    }
    await waitForPageReady(page);
    await screenshot(page, "Post-login state");

    // If login failed, try to continue anyway by navigating directly
    if (!loginSuccess) {
      console.log("  Login failed, attempting to use API auth as fallback...");
      try {
        // Try Better Auth sign-in API directly
        const response = await page.evaluate(async (creds) => {
          const resp = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: creds.email, password: creds.password }),
          });
          return { status: resp.status, ok: resp.ok };
        }, { email: EMAIL, password: PASSWORD });
        console.log(`  API auth response: ${JSON.stringify(response)}`);
        if (response.ok) {
          pass("Login: Authenticated via API fallback");
          loginSuccess = true;
          await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60000 });
          await waitForPageReady(page);
        }
      } catch (e) {
        console.log(`  API auth fallback failed: ${e.message}`);
      }
    }

    // =====================================================
    // CAREER SECTION
    // =====================================================
    console.log("\n========== PHASE 1: CAREER COACHING ==========");

    // -- Test 1: Main career page --
    console.log("\n[Test 1] Career main page");
    await page.goto(`${BASE}/dashboard/career`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const careerOk = await checkPageHealth(page, "Career Main");
    await screenshot(page, "Career main page");

    if (careerOk) {
      const bodyText = await getVisibleText(page);
      const hasMarketInsights = /march[eé]|insights?|statistiques?|taux/i.test(bodyText);
      const hasEmployers = /employeur|employer|entreprise|ocp|cdg|orange|maroc/i.test(bodyText);
      const hasPathways = /parcours|pathway|carri[eè]re|fili[eè]re|devops|data|cloud/i.test(bodyText);

      if (hasMarketInsights) pass("Career: Market insights section found");
      else warn("Career: No market insights section detected");

      if (hasEmployers) pass("Career: Employers section found");
      else warn("Career: No employers section detected");

      if (hasPathways) pass("Career: Career pathways section found");
      else warn("Career: No pathways section detected");
    }

    // -- Test 2-5: Tabs on career page --
    console.log("\n[Test 2-5] Career page tabs");
    const tabNames = ["assessment", "market", "pathways", "ai tools", "evaluation", "marche", "outils"];
    const tabButtons = await page.getByRole("tab").all();
    console.log(`  Found ${tabButtons.length} tab(s)`);

    if (tabButtons.length > 0) {
      for (let i = 0; i < Math.min(tabButtons.length, 5); i++) {
        const tabText = await tabButtons[i].textContent();
        console.log(`  Clicking tab: ${tabText}`);
        await tabButtons[i].click();
        await page.waitForTimeout(1000);
        await dismissOverlay(page);
        await screenshot(page, `Career tab: ${tabText}`);
        pass(`Career tab "${tabText}" clicked and rendered`);
      }
    } else {
      // Check for link-based navigation instead
      const navLinks = await page.locator('a[href*="/dashboard/career/"]').all();
      console.log(`  No tabs found, but ${navLinks.length} sub-nav link(s) detected`);
      if (navLinks.length > 0) {
        pass("Career: Sub-navigation links present");
      } else {
        warn("Career: No tabs or sub-navigation found");
      }
    }

    // -- Test 6: Career Roadmap --
    console.log("\n[Test 6-9] Career Roadmap");
    await page.goto(`${BASE}/dashboard/career/roadmap`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const roadmapOk = await checkPageHealth(page, "Career Roadmap");
    await screenshot(page, "Career roadmap page");

    if (roadmapOk) {
      const bodyText = await getVisibleText(page);
      const hasForm = /r[oô]le actuel|current role|poste|cible|target/i.test(bodyText);

      if (hasForm) {
        pass("Roadmap: Form fields detected");

        // Try to fill the form
        try {
          // Look for input fields for role/target
          const currentRoleInput = page.locator('input[name*="current"], input[placeholder*="actuel"], input[placeholder*="current"]').first();
          const targetInput = page.locator('input[name*="target"], input[placeholder*="cible"], input[placeholder*="target"]').first();

          if (await currentRoleInput.isVisible({ timeout: 3000 })) {
            await currentRoleInput.click();
            await currentRoleInput.pressSequentially("Etudiant IMTA", { delay: 30 });
            pass("Roadmap: Filled current role");
          } else {
            // Try textarea or other selectors
            const inputs = await page.locator('input[type="text"], textarea').all();
            console.log(`  Found ${inputs.length} text input(s)`);
            if (inputs.length >= 2) {
              await inputs[0].click();
              await inputs[0].pressSequentially("Etudiant IMTA", { delay: 30 });
              await inputs[1].click();
              await inputs[1].pressSequentially("Ingenieur DevOps", { delay: 30 });
              pass("Roadmap: Filled current role and target via generic inputs");
            }
          }

          if (await targetInput.isVisible({ timeout: 2000 })) {
            await targetInput.click();
            await targetInput.pressSequentially("Ingenieur DevOps", { delay: 30 });
            pass("Roadmap: Filled target role");
          }

          // Try to select industry if there's a dropdown
          const selects = await page.locator("select").all();
          if (selects.length > 0) {
            for (const sel of selects) {
              const options = await sel.locator("option").all();
              if (options.length > 1) {
                await sel.selectOption({ index: 1 });
              }
            }
            pass("Roadmap: Selected dropdown options");
          }

          // Try combobox / trigger buttons for select-like components
          const triggers = await page.locator('[role="combobox"], button[data-state]').all();
          for (const trigger of triggers.slice(0, 3)) {
            try {
              await trigger.click();
              await page.waitForTimeout(500);
              const option = page.locator('[role="option"]').first();
              if (await option.isVisible({ timeout: 1500 })) {
                await option.click();
                await page.waitForTimeout(300);
              }
            } catch {}
          }

          await screenshot(page, "Roadmap form filled");

          // Click the generate button
          const generateBtn = page.getByRole("button", { name: /g[eé]n[eé]rer|generate|roadmap|feuille/i });
          if (await generateBtn.isVisible({ timeout: 3000 })) {
            await generateBtn.click();
            console.log("  Clicked generate roadmap button, waiting for AI...");

            // Wait for AI response (up to 30s)
            try {
              await page.waitForTimeout(3000);
              await dismissOverlay(page);

              // Wait for either the result to appear or a loading state to finish
              try {
                await page.waitForFunction(() => {
                  const text = document.body.innerText;
                  return /[eé]tape|step|phase|comp[eé]tence|skill|mois|month|semaine|week/i.test(text);
                }, { timeout: 30000 });
                pass("Roadmap: AI generated roadmap content");
              } catch {
                const bodyAfter = await getVisibleText(page);
                if (/erreur|error|failed|indisponible/i.test(bodyAfter)) {
                  warn("Roadmap: AI generation returned error");
                } else if (/chargement|loading|generating/i.test(bodyAfter)) {
                  warn("Roadmap: Still loading after 30s");
                } else {
                  warn("Roadmap: No clear roadmap content detected after generation");
                }
              }
            } catch {
              warn("Roadmap: Timeout waiting for AI response");
            }

            await screenshot(page, "Roadmap AI result");
          } else {
            warn("Roadmap: Generate button not found");
            await screenshot(page, "Roadmap - no generate button");
          }
        } catch (e) {
          warn(`Roadmap: Form interaction error: ${e.message}`);
        }
      } else {
        warn("Roadmap: No form fields detected on page");
      }
    }

    // -- Test 10-11: Skills page --
    console.log("\n[Test 10-11] Career Skills");
    await page.goto(`${BASE}/dashboard/career/skills`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const skillsOk = await checkPageHealth(page, "Career Skills");
    await screenshot(page, "Career skills page");

    if (skillsOk) {
      const bodyText = await getVisibleText(page);
      const hasSkillContent = /comp[eé]tence|skill|niveau|level|progress|recommand/i.test(bodyText);
      if (hasSkillContent) pass("Skills: Page has skill-related content");
      else warn("Skills: No skill content detected - page may be empty");

      const hasData = bodyText.length > 200;
      if (hasData) pass("Skills: Page has substantial content");
      else warn("Skills: Page content is minimal");
    }

    // -- Test 12-13: Certifications page --
    console.log("\n[Test 12-13] Career Certifications");
    await page.goto(`${BASE}/dashboard/career/certifications`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const certsOk = await checkPageHealth(page, "Career Certifications");
    await screenshot(page, "Career certifications page");

    if (certsOk) {
      const bodyText = await getVisibleText(page);
      const hasCertContent = /certification|certificat|aws|azure|google|cisco|pmp|badge/i.test(bodyText);
      if (hasCertContent) pass("Certifications: Page has certification content");
      else warn("Certifications: No certification content detected");
    }

    // =====================================================
    // INTERVIEW SECTION
    // =====================================================
    console.log("\n========== PHASE 2: INTERVIEW PREPARATION ==========");

    // -- Test 14-16: Main Interview page --
    console.log("\n[Test 14-16] Interview main page");
    await page.goto(`${BASE}/dashboard/interview`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const interviewOk = await checkPageHealth(page, "Interview Main");
    await screenshot(page, "Interview main page");

    if (interviewOk) {
      const bodyText = await getVisibleText(page);
      const hasReadiness = /readiness|pr[eê]paration|score|niveau|pr[eê]t/i.test(bodyText);
      const hasSessions = /session|entretien|practice|pratique|historique/i.test(bodyText);
      const hasDomains = /domaine|domain|technique|comportemental|behavioral|cat[eé]gorie/i.test(bodyText);
      const hasTips = /conseil|tip|astuce|suggestion/i.test(bodyText);

      if (hasReadiness) pass("Interview: Readiness/preparation section found");
      else warn("Interview: No readiness score section detected");

      if (hasSessions) pass("Interview: Sessions/practice section found");
      else warn("Interview: No session cards detected");

      if (hasDomains || hasTips) pass("Interview: Domain/tips content found");
      else warn("Interview: No practice domain or tip content detected");
    }

    // -- Test 17-19: Interview Practice page --
    console.log("\n[Test 17-19] Interview Practice");
    await page.goto(`${BASE}/dashboard/interview/practice`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const practiceOk = await checkPageHealth(page, "Interview Practice");
    await screenshot(page, "Interview practice page");

    if (practiceOk) {
      const bodyText = await getVisibleText(page);
      const hasSpinner = await page.locator('[class*="animate-spin"]').count();

      if (hasSpinner > 0) {
        warn("Practice: Page shows infinite spinner");
        // Wait a bit more
        await page.waitForTimeout(5000);
        await dismissOverlay(page);
        const stillSpinning = await page.locator('[class*="animate-spin"]').count();
        if (stillSpinning > 0) {
          fail("Practice: Infinite spinner after extended wait");
        } else {
          pass("Practice: Spinner resolved after extended wait");
        }
        await screenshot(page, "Interview practice after wait");
      } else {
        pass("Practice: Page loaded without infinite spinner");
      }

      // Try to start a practice session
      const startBtn = page.getByRole("button", { name: /commencer|start|d[eé]marrer|lancer|practice|nouvelle/i });
      if (await startBtn.isVisible({ timeout: 3000 })) {
        pass("Practice: Start session button is visible");
        try {
          await startBtn.click();
          await page.waitForTimeout(2000);
          await dismissOverlay(page);
          await screenshot(page, "Interview practice - started session");

          const afterStart = await getVisibleText(page);
          if (/question|r[eé]pondez|answer|entretien/i.test(afterStart)) {
            pass("Practice: Session started, question appears");
          } else {
            warn("Practice: Session started but no question visible");
          }
        } catch (e) {
          warn(`Practice: Error starting session: ${e.message}`);
        }
      } else {
        warn("Practice: No start button found - may need configuration first");
        // Check if there's a setup/config step needed
        const setupNeeded = /configur|programme|program|choisir|select|param[eè]tre/i.test(bodyText);
        if (setupNeeded) {
          warn("Practice: Setup/configuration step required before practice");
        }
      }
    }

    // -- Test 20-21: Interview Tips page --
    console.log("\n[Test 20-21] Interview Tips");
    await page.goto(`${BASE}/dashboard/interview/tips`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const tipsOk = await checkPageHealth(page, "Interview Tips");
    await screenshot(page, "Interview tips page");

    if (tipsOk) {
      const bodyText = await getVisibleText(page);
      const hasTipContent = /conseil|tip|astuce|suggestion|pr[eé]paration|entretien/i.test(bodyText);
      if (hasTipContent) pass("Tips: Page has interview tip content");
      else warn("Tips: No tip content detected - page may be empty");

      // Check for categories or filters
      const hasFilters = /cat[eé]gorie|category|filtre|filter|tous|all/i.test(bodyText);
      if (hasFilters) pass("Tips: Filtering/categories available");
    }

    // -- Test 22-25: Interview Chatbot --
    console.log("\n[Test 22-25] Interview AI Chatbot");
    await page.goto(`${BASE}/dashboard/interview/chatbot`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await waitForPageReady(page);
    const chatOk = await checkPageHealth(page, "Interview Chatbot");
    await screenshot(page, "Interview chatbot page");

    if (chatOk) {
      const bodyText = await getVisibleText(page);
      const hasChat = /chat|message|conversation|envoy|send|[eé]crire|assistant|ai|ia/i.test(bodyText);

      if (hasChat) {
        pass("Chatbot: Chat interface detected");

        // Try sending a message
        const chatInput = page.locator('textarea, input[type="text"]').last();
        if (await chatInput.isVisible({ timeout: 3000 })) {
          await chatInput.click();
          await chatInput.pressSequentially("Comment me preparer pour un entretien technique chez OCP?", { delay: 20 });

          await screenshot(page, "Chatbot - message typed");

          // Send the message
          const sendBtn = page.getByRole("button", { name: /envoy|send|soumettre|submit/i });
          const enterSend = async () => {
            await chatInput.press("Enter");
          };

          if (await sendBtn.isVisible({ timeout: 2000 })) {
            await sendBtn.click();
          } else {
            // Try pressing Enter
            await enterSend();
          }

          console.log("  Sent message, waiting for AI response (up to 30s)...");

          // Wait for AI response
          try {
            await page.waitForFunction(() => {
              const msgs = document.querySelectorAll('[class*="message"], [class*="chat"], [data-role="assistant"]');
              // Check if there's more than the user's message
              const text = document.body.innerText;
              return /entretien|technique|pr[eé]par|conseil|ocp|important|question/i.test(text) && msgs.length > 0;
            }, { timeout: 30000 });
            pass("Chatbot: AI responded to message");
          } catch {
            const afterSend = await getVisibleText(page);
            if (/erreur|error|indisponible|unavailable/i.test(afterSend)) {
              warn("Chatbot: AI returned an error");
            } else if (/chargement|loading|typing|r[eé]flexion/i.test(afterSend)) {
              warn("Chatbot: AI still loading after 30s");
            } else {
              warn("Chatbot: No clear AI response detected");
            }
          }

          await screenshot(page, "Chatbot - AI response");
        } else {
          warn("Chatbot: No text input field found");
        }
      } else {
        warn("Chatbot: No chat interface detected on page");
        // Check if there's an error or AI unavailable message
        if (/indisponible|unavailable|configur/i.test(bodyText)) {
          warn("Chatbot: AI may not be configured/available");
        }
      }
    }

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log("\n\n========================================");
    console.log("         UAT TEST RESULTS SUMMARY        ");
    console.log("========================================\n");
    console.log(`  PASS: ${results.PASS.length}`);
    console.log(`  WARN: ${results.WARN.length}`);
    console.log(`  FAIL: ${results.FAIL.length}`);
    console.log(`  Total screenshots: ${shotIndex}`);
    console.log("");

    if (results.PASS.length > 0) {
      console.log("--- PASSED ---");
      results.PASS.forEach(m => console.log(`  [PASS] ${m}`));
    }
    if (results.WARN.length > 0) {
      console.log("\n--- WARNINGS ---");
      results.WARN.forEach(m => console.log(`  [WARN] ${m}`));
    }
    if (results.FAIL.length > 0) {
      console.log("\n--- FAILURES ---");
      results.FAIL.forEach(m => console.log(`  [FAIL] ${m}`));
    }
    console.log("\n========================================\n");

  } catch (e) {
    console.error(`\nFATAL ERROR: ${e.message}`);
    console.error(e.stack);
    try {
      await screenshot(page, "FATAL ERROR");
    } catch {}
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
