/**
 * E2E Test: AI Resume Wizard — All 4 Modes
 * Tests: Generate, Gap Analysis, Adapt to Job, AI Chat
 * Run: node scripts/e2e-ai-wizard.mjs
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(emoji, msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${emoji} ${msg}`);
}

const results = [];
function record(mode, status, details) {
  results.push({ mode, status, details });
  const icon = status === "PASS" ? "PASS" : status === "FAIL" ? "FAIL" : "WARN";
  log(icon, `[${mode}] ${status}: ${details}`);
}

let browser, page;

async function goto(url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
}

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
    await page.screenshot({ path, fullPage: true });
    log("SCREENSHOT", `Saved: ${path} (${label})`);
  } catch (err) {
    log("WARN", `Screenshot failed: ${path} -- ${err.message}`);
  }
}

async function getPageText() {
  return page.evaluate(() => document.body.innerText);
}

/**
 * Navigate to wizard page freshly (hard reload to clear React state)
 */
async function goToWizardFresh() {
  await goto(`${BASE}/dashboard/resumes/ai-wizard`);
  await sleep(4000);
  await dismissOverlay();
  // Wait for mode cards to appear
  try {
    await page.waitForSelector("text=Generer un CV", { timeout: 10000 });
  } catch {
    // Retry with page reload
    await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);
    await dismissOverlay();
  }
}

/**
 * Select a wizard mode by clicking the correct card
 * Modes: 0=Generate, 1=GapAnalysis, 2=Adapt, 3=Chat
 */
async function selectMode(modeIndex, modeName) {
  // The mode cards are in a 4-column grid. Each Card has CardContent with icon, label, description
  // We locate by the mode labels
  const modeLabels = ["Generer un CV", "Analyse des lacunes", "Adapter a une offre", "Chat IA"];
  const label = modeLabels[modeIndex];

  // Click the card containing this text
  const card = page.locator(`text=${label}`).first();
  await card.click();
  log("CLICK", `Selected mode: ${label}`);
  await sleep(1000);

  // Verify selection by checking for "Selectionne" badge
  const selected = await page.locator("text=Selectionne").isVisible({ timeout: 3000 }).catch(() => false);
  if (selected) {
    log("OK", `Mode "${label}" is selected (badge visible)`);
  }

  // Now click "Commencer" button
  const startBtn = page.locator("button").filter({ hasText: "Commencer" });
  await startBtn.waitFor({ state: "visible", timeout: 5000 });

  // Check if enabled
  const isDisabled = await startBtn.isDisabled();
  if (isDisabled) {
    log("WARN", "Commencer button is disabled, trying to re-click mode card");
    await card.click();
    await sleep(1000);
  }

  await startBtn.click();
  log("CLICK", "Clicked 'Commencer'");
  await sleep(2000);
  await dismissOverlay();
}

/**
 * Select a resume in the resume selector step.
 * Returns true if a resume was selected and Continuer was clicked.
 */
async function selectResume() {
  // Wait for resume list to appear
  await sleep(2000);

  const bodyText = await getPageText();

  // Check if we're on the resume selector step
  if (bodyText.includes("Aucun CV trouve")) {
    log("WARN", "No resumes found -- cannot proceed");
    return false;
  }

  // Resume cards have a clipboard icon and title text
  // They are Card elements with cursor-pointer class
  // Try to find cards that look like resume items (have clipboard-like icon divs)
  try {
    // Look for any card-like clickable element on the page
    // The resume selector shows cards with resume names
    const cards = page.locator("div").filter({ has: page.locator("p.truncate") });
    const count = await cards.count();
    log("INFO", `Found ${count} resume cards in list`);

    if (count > 0) {
      await cards.first().click();
      log("CLICK", "Selected first resume");
      await sleep(1000);
    } else {
      // Fallback: click any text that looks like a resume name
      // Resume names appear as p.truncate elements
      const names = page.locator("p.truncate");
      const nameCount = await names.count();
      log("INFO", `Found ${nameCount} truncated names`);
      if (nameCount > 0) {
        await names.first().click();
        log("CLICK", "Clicked first resume name");
        await sleep(1000);
      }
    }
  } catch (err) {
    log("WARN", `Error selecting resume: ${err.message}`);
  }

  // Click "Continuer"
  try {
    const continueBtn = page.locator("button").filter({ hasText: "Continuer" });
    const isVisible = await continueBtn.isVisible({ timeout: 3000 });
    if (isVisible) {
      const isDisabled = await continueBtn.isDisabled();
      if (isDisabled) {
        log("WARN", "Continuer button is disabled -- resume may not be selected");
        // Try clicking a broader set of elements
        const clickableCards = page.locator('[class*="cursor-pointer"]').filter({ has: page.locator("p") });
        const cc = await clickableCards.count();
        if (cc > 0) {
          await clickableCards.first().click();
          await sleep(500);
        }
      }
      await continueBtn.click();
      log("CLICK", "Clicked 'Continuer'");
      await sleep(2000);
      await dismissOverlay();
      return true;
    }
  } catch (err) {
    log("WARN", `Continuer button error: ${err.message}`);
  }

  return false;
}

// ============================================================================
// LOGIN
// ============================================================================
async function loginAsAdmin() {
  log("AUTH", "Logging in as admin@test.com...");
  await goto(`${BASE}/auth/login`);
  await sleep(3000);
  await dismissOverlay();

  // Use the actual form on the page
  // The form uses react-hook-form with fields named "identifier" and "password"
  try {
    // Fill email field - use clear + type to trigger React change events properly
    const emailInput = page.locator('input[placeholder*="john.doe"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.click();
    await emailInput.fill(""); // clear first
    await emailInput.type("admin@test.com", { delay: 30 });
    log("OK", "Typed email");

    // Fill password field
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: "visible", timeout: 5000 });
    await passwordInput.click();
    await passwordInput.fill(""); // clear first
    await passwordInput.type("TestAccount123!", { delay: 30 });
    log("OK", "Typed password");

    // Small wait for form validation
    await sleep(500);

    // Click login button ("Se connecter")
    const loginBtn = page.locator('button[type="submit"], button').filter({ hasText: /Se connecter|Sign in/ }).first();
    await loginBtn.click();
    log("CLICK", "Clicked submit button");

    // Wait for redirect — the login component uses window.location.href = "/dashboard"
    // so we need to wait for a full page navigation
    try {
      await page.waitForURL("**/dashboard**", { timeout: 15000 });
      log("OK", "Redirected to dashboard");
    } catch {
      log("WARN", "No redirect detected, checking page state...");
      await sleep(3000);
    }

    await dismissOverlay();

    // Check if we landed on dashboard or still on login
    const currentUrl = page.url();
    log("INFO", `After login URL: ${currentUrl}`);

    if (currentUrl.includes("/auth/login")) {
      // Still on login page - check for error messages
      const pageText = await getPageText();
      log("WARN", `Still on login page. Text: ${pageText.slice(0, 300)}`);

      // Try alternative: use fetch API from the login page context
      log("AUTH", "Trying API fetch login...");
      const apiResult = await page.evaluate(async () => {
        try {
          const res = await fetch("/api/auth/sign-in/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "admin@test.com",
              password: "TestAccount123!",
            }),
          });
          return { ok: res.ok, status: res.status, text: await res.text() };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      });
      log("INFO", `API login result: ok=${apiResult.ok} status=${apiResult.status}`);

      if (apiResult.ok) {
        // Navigate to dashboard with the new session
        await sleep(1000);
        page.evaluate(() => { window.location.href = "/dashboard"; });
        await sleep(5000);
        await dismissOverlay();
      }
    }
  } catch (err) {
    log("ERROR", `Login failed: ${err.message}`);
  }

  const dashText = await getPageText();
  const isLoggedIn = dashText.includes("Admin User") || dashText.includes("Mon profil") || dashText.includes("CVs");
  if (isLoggedIn) {
    log("OK", "Successfully logged in and reached dashboard");
    return true;
  }
  log("WARN", `Login status unclear. URL: ${page.url()}. Page text: ${dashText.slice(0, 200)}`);
  return false;
}

// ============================================================================
// TEST 1: NAVIGATE TO WIZARD
// ============================================================================
async function testWizardLanding() {
  log("TEST", "=== TEST 1: Navigate to AI Wizard ===");
  await goToWizardFresh();

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-01-landing.png`, "Wizard landing");

  const bodyText = await getPageText();
  const hasGenerate = bodyText.includes("Generer un CV");
  const hasGap = bodyText.includes("Analyse des lacunes");
  const hasAdapt = bodyText.includes("Adapter a une offre");
  const hasChat = bodyText.includes("Chat IA");

  log("INFO", `Mode cards: Generate=${hasGenerate}, GapAnalysis=${hasGap}, Adapt=${hasAdapt}, Chat=${hasChat}`);

  if (hasGenerate && hasGap && hasAdapt && hasChat) {
    record("Landing", "PASS", "All 4 mode selection cards visible: Generate, Gap Analysis, Adapt, Chat IA");
  } else if (hasGenerate || hasGap || hasAdapt || hasChat) {
    record("Landing", "WARN", `Some mode cards visible: Gen=${hasGenerate} Gap=${hasGap} Adapt=${hasAdapt} Chat=${hasChat}`);
  } else {
    record("Landing", "FAIL", `No mode cards found. Page text: ${bodyText.slice(0, 400)}`);
  }

  // Check for AI warning
  if (bodyText.includes("IA ne sont pas configurees") || bodyText.includes("not configured")) {
    record("Landing-AIConfig", "WARN", "AI features not configured warning is shown -- AI calls may fail");
  }
}

// ============================================================================
// TEST 2: MODE 1 -- GENERATE RESUME
// ============================================================================
async function testGenerateResume() {
  log("TEST", "=== TEST 2: Generate Resume ===");
  await goToWizardFresh();

  // Select Generate mode (index 0)
  try {
    await selectMode(0, "Generate");
  } catch (err) {
    log("ERROR", `Failed to select Generate mode: ${err.message}`);
    record("Generate", "FAIL", `Cannot select mode: ${err.message}`);
    return;
  }

  // Check if we landed on the generate form (step indicator should show "Generer")
  const stepText = await getPageText();
  const hasForm = stepText.includes("Nom complet") || stepText.includes("Poste cible") || stepText.includes("Generer un nouveau CV");

  if (!hasForm) {
    log("WARN", `Generate form not visible. Page: ${stepText.slice(0, 300)}`);
    record("Generate", "FAIL", `Form not displayed after selecting Generate mode. Page: ${stepText.slice(0, 200)}`);
    await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-02-generate-form.png`, "Generate form (missing)");
    return;
  }

  log("OK", "Generate form is visible");

  // Fill the form
  try {
    await page.locator("#gen-name").fill("Amina Chakir");
    await page.locator("#gen-job").fill("Ingenieur Data Science");
    await page.locator("#gen-email").fill("amina.chakir@test.com");
    await page.locator("#gen-phone").fill("+212 655443322");
    await page.locator("#gen-years").fill("2");
    await page.locator("#gen-skills").fill("Python, TensorFlow, SQL, Machine Learning, Deep Learning");
    await page.locator("#gen-education").fill("IMTA Casablanca, Genie Informatique, 2022-2025");
    await page.locator("#gen-experience").fill(
      "Stage Data Analyst chez Inwi, 6 mois. Analyse de donnees clients, creation de dashboards PowerBI."
    );
    log("OK", "All form fields filled");
  } catch (err) {
    log("ERROR", `Error filling form: ${err.message}`);
    record("Generate", "FAIL", `Could not fill form: ${err.message}`);
    return;
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-02-generate-form.png`, "Generate form filled");

  // Click "Generer mon CV" button
  try {
    const genBtn = page.locator("button").filter({ hasText: "Generer mon CV" });
    await genBtn.waitFor({ state: "visible", timeout: 5000 });
    await genBtn.click();
    log("CLICK", "Clicked 'Generer mon CV'");
  } catch (err) {
    log("ERROR", `Error clicking generate: ${err.message}`);
    record("Generate", "FAIL", `Could not click generate button: ${err.message}`);
    return;
  }

  // Wait for AI generation (up to 90s)
  log("WAIT", "Waiting for AI generation (up to 90s)...");
  let generated = false;
  let errorMsg = "";

  for (let i = 0; i < 18; i++) {
    await sleep(5000);
    await dismissOverlay();
    const currentUrl = page.url();
    const bodyText = await getPageText();

    // Check if navigated to builder (success)
    if (currentUrl.includes("/builder/")) {
      log("OK", `Navigated to builder: ${currentUrl}`);
      generated = true;
      break;
    }

    // Check for error toast or message
    if (bodyText.includes("Erreur lors de la generation") || bodyText.includes("configuration IA")) {
      errorMsg = "AI generation error -- likely AI provider issue";
      log("ERROR", errorMsg);
      break;
    }

    // Check for spinning state
    if (bodyText.includes("Generation en cours")) {
      log("WAIT", `Still generating... (${(i + 1) * 5}s)`);
    }

    // Check for success toast
    if (bodyText.includes("genere avec succes")) {
      log("OK", "Success toast detected!");
      generated = true;
      await sleep(3000); // Wait for navigation
      break;
    }
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-03-generate-result.png`, "Generate result");

  const finalUrl = page.url();
  const finalText = await getPageText();

  if (generated || finalUrl.includes("/builder/")) {
    record("Generate", "PASS", `Resume generated and navigated to builder. URL: ${finalUrl}`);
  } else if (errorMsg) {
    record("Generate", "FAIL", errorMsg);
  } else {
    // Check page state
    record("Generate", "WARN", `Unclear result after 90s. URL: ${finalUrl}. Page contains: ${finalText.slice(0, 200)}`);
  }
}

// ============================================================================
// TEST 3: MODE 2 -- GAP ANALYSIS
// ============================================================================
async function testGapAnalysis() {
  log("TEST", "=== TEST 3: Gap Analysis ===");
  await goToWizardFresh();

  // Select Gap Analysis mode (index 1)
  try {
    await selectMode(1, "Gap Analysis");
  } catch (err) {
    log("ERROR", `Failed to select Gap Analysis mode: ${err.message}`);
    record("GapAnalysis", "FAIL", `Cannot select mode: ${err.message}`);
    return;
  }

  // Should be on resume selection step
  const resumeSelected = await selectResume();
  if (!resumeSelected) {
    log("WARN", "Resume selection may have failed, trying to continue anyway");
  }

  // Should now be on execute step with gap analysis form
  await sleep(2000);
  const pageText = await getPageText();

  // Check if we see target role input
  const hasTargetRole = pageText.includes("Poste cible") || pageText.includes("target-role");
  if (!hasTargetRole) {
    log("WARN", `Gap analysis form not visible. Text: ${pageText.slice(0, 300)}`);
    // Take screenshot for debugging
    await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-04-gap-debug.png`, "Gap analysis debug");
    record("GapAnalysis", "FAIL", `Gap analysis form not displayed. Page: ${pageText.slice(0, 200)}`);
    return;
  }

  // Fill target role
  try {
    const roleInput = page.locator("#target-role");
    await roleInput.fill("Data Scientist Senior");
    log("OK", "Filled target role");
  } catch (err) {
    log("WARN", `Could not fill target role: ${err.message}`);
  }

  // Click "Analyser le CV"
  try {
    const analyzeBtn = page.locator("button").filter({ hasText: "Analyser le CV" });
    await analyzeBtn.waitFor({ state: "visible", timeout: 5000 });
    await analyzeBtn.click();
    log("CLICK", "Clicked 'Analyser le CV'");
  } catch (err) {
    log("ERROR", `Error clicking analyze: ${err.message}`);
    record("GapAnalysis", "FAIL", `Cannot click analyze: ${err.message}`);
    return;
  }

  // Wait for analysis (up to 60s)
  log("WAIT", "Waiting for gap analysis (up to 60s)...");
  let analyzed = false;

  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    await dismissOverlay();
    const bodyText = await getPageText();

    if (bodyText.includes("Score global") || bodyText.includes("Points forts") || bodyText.includes("Recommandations")) {
      log("OK", "Gap analysis results displayed!");
      analyzed = true;
      break;
    }

    if (bodyText.includes("Analyse terminee")) {
      log("OK", "Analysis complete toast detected!");
      analyzed = true;
      break;
    }

    if (bodyText.includes("Erreur") || bodyText.includes("echoue")) {
      log("ERROR", "Error during gap analysis");
      break;
    }

    if (bodyText.includes("Analyse en cours")) {
      log("WAIT", `Still analyzing... (${(i + 1) * 5}s)`);
    }
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-04-gap-results.png`, "Gap analysis results");

  const gapText = await getPageText();

  if (analyzed) {
    const hasScore = gapText.includes("Score global");
    const hasGaps = gapText.includes("lacune") || gapText.includes("Lacunes");
    const hasStrengths = gapText.includes("Points forts");
    const hasRecs = gapText.includes("Recommandations");

    record(
      "GapAnalysis",
      "PASS",
      `Results displayed. Score: ${hasScore}, Gaps: ${hasGaps}, Strengths: ${hasStrengths}, Recommendations: ${hasRecs}. Details: ${gapText.slice(gapText.indexOf("Score"), gapText.indexOf("Score") + 300).replace(/\n/g, " ")}`
    );

    // Try "Appliquer les corrections" button
    try {
      const applyBtn = page.locator("button").filter({ hasText: "Appliquer les corrections" });
      const applyVisible = await applyBtn.isVisible({ timeout: 3000 });
      if (applyVisible) {
        await applyBtn.click();
        log("CLICK", "Clicked 'Appliquer les corrections'");

        for (let i = 0; i < 6; i++) {
          await sleep(5000);
          await dismissOverlay();
          const applyText = await getPageText();
          if (applyText.includes("Corrections appliquees") || applyText.includes("Ouvrir dans l'editeur")) {
            log("OK", "Gap fixes applied successfully!");
            record("GapAnalysis-Apply", "PASS", "Corrections applied and editor link shown");
            break;
          }
          if (applyText.includes("Erreur")) {
            record("GapAnalysis-Apply", "FAIL", "Error applying corrections");
            break;
          }
          if (i === 5) {
            record("GapAnalysis-Apply", "WARN", "Apply corrections timed out");
          }
        }

        await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-05-gap-applied.png`, "Gap fixes applied");
      } else {
        log("INFO", "No 'Appliquer les corrections' button visible (maybe 0 gaps found)");
        record("GapAnalysis-Apply", "WARN", "Apply corrections button not visible (possibly no gaps to fix)");
      }
    } catch (err) {
      record("GapAnalysis-Apply", "WARN", `Apply corrections error: ${err.message}`);
    }
  } else if (gapText.includes("Erreur") || gapText.includes("configuration IA")) {
    record("GapAnalysis", "FAIL", `AI error during analysis`);
  } else {
    record("GapAnalysis", "WARN", `No results after timeout. Page: ${gapText.slice(0, 300)}`);
  }
}

// ============================================================================
// TEST 4: MODE 3 -- ADAPT TO JOB
// ============================================================================
async function testAdaptToJob() {
  log("TEST", "=== TEST 4: Adapt to Job ===");
  await goToWizardFresh();

  // Select Adapt mode (index 2)
  try {
    await selectMode(2, "Adapt to Job");
  } catch (err) {
    log("ERROR", `Failed to select Adapt mode: ${err.message}`);
    record("AdaptToJob", "FAIL", `Cannot select mode: ${err.message}`);
    return;
  }

  // Select resume
  const resumeSelected = await selectResume();
  if (!resumeSelected) {
    log("WARN", "Resume selection may have failed");
  }

  // Should now be on execute step with job description textarea
  await sleep(2000);
  const pageText = await getPageText();

  const hasJobDesc = pageText.includes("Description du poste") || pageText.includes("poste");
  if (!hasJobDesc) {
    log("WARN", `Adapt form not visible. Text: ${pageText.slice(0, 300)}`);
    await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-06-adapt-debug.png`, "Adapt debug");
    record("AdaptToJob", "FAIL", `Adapt form not displayed. Page: ${pageText.slice(0, 200)}`);
    return;
  }

  // Paste job description
  const jobDesc = "Recherche Data Scientist senior avec experience en Machine Learning, Python, TensorFlow. Competences requises: NLP, Computer Vision, MLOps. 5 ans experience minimum. Salaire: 25000-35000 MAD. Casablanca.";
  try {
    const jobTextarea = page.locator("#job-desc");
    await jobTextarea.waitFor({ state: "visible", timeout: 5000 });
    await jobTextarea.fill(jobDesc);
    log("OK", "Filled job description");
  } catch (err) {
    log("WARN", `Error filling job desc: ${err.message}`);
    // Try fallback textarea
    const fallback = page.locator("textarea").first();
    await fallback.fill(jobDesc);
  }

  // Click "Adapter le CV"
  try {
    const adaptBtn = page.locator("button").filter({ hasText: "Adapter le CV" });
    await adaptBtn.waitFor({ state: "visible", timeout: 5000 });
    await adaptBtn.click();
    log("CLICK", "Clicked 'Adapter le CV'");
  } catch (err) {
    log("ERROR", `Error clicking Adapt: ${err.message}`);
    record("AdaptToJob", "FAIL", `Cannot click adapt button: ${err.message}`);
    return;
  }

  // Wait for adaptation (up to 60s)
  log("WAIT", "Waiting for adaptation (up to 60s)...");
  let adapted = false;

  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    await dismissOverlay();
    const bodyText = await getPageText();

    if (
      bodyText.includes("Score de correspondance") ||
      bodyText.includes("Mots-cles trouves") ||
      bodyText.includes("Mots-cles manquants") ||
      bodyText.includes("Sections adaptees")
    ) {
      log("OK", "Adapt results displayed!");
      adapted = true;
      break;
    }

    if (bodyText.includes("CV adapte avec succes")) {
      log("OK", "Adapt success toast detected!");
      adapted = true;
      break;
    }

    if (bodyText.includes("Erreur") || bodyText.includes("echoue")) {
      log("ERROR", "Error during adaptation");
      break;
    }

    if (bodyText.includes("Adaptation en cours")) {
      log("WAIT", `Still adapting... (${(i + 1) * 5}s)`);
    }
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-06-adapt-results.png`, "Adapt results");

  const adaptText = await getPageText();

  if (adapted) {
    const hasMatchScore = adaptText.includes("Score de correspondance");
    const hasKeywordsFound = adaptText.includes("Mots-cles trouves");
    const hasKeywordsMissing = adaptText.includes("Mots-cles manquants");
    const hasSections = adaptText.includes("Sections adaptees");

    // Extract relevant content
    const startIdx = adaptText.indexOf("Score de correspondance");
    const relevantText = startIdx >= 0 ? adaptText.slice(startIdx, startIdx + 500).replace(/\n/g, " | ") : "";

    record(
      "AdaptToJob",
      "PASS",
      `MatchScore: ${hasMatchScore}, KeywordsFound: ${hasKeywordsFound}, KeywordsMissing: ${hasKeywordsMissing}, Sections: ${hasSections}. Content: ${relevantText.slice(0, 200)}`
    );

    // Try "Appliquer au CV" button
    try {
      const applyBtn = page.locator("button").filter({ hasText: "Appliquer au CV" });
      const applyVisible = await applyBtn.isVisible({ timeout: 3000 });
      if (applyVisible) {
        await applyBtn.click();
        log("CLICK", "Clicked 'Appliquer au CV'");

        for (let i = 0; i < 6; i++) {
          await sleep(5000);
          await dismissOverlay();
          const applyText2 = await getPageText();
          if (applyText2.includes("Adaptations appliquees") || applyText2.includes("Ouvrir dans l'editeur")) {
            log("OK", "Adaptations applied successfully!");
            record("AdaptToJob-Apply", "PASS", "Adaptations applied and editor link shown");
            break;
          }
          if (applyText2.includes("Erreur")) {
            record("AdaptToJob-Apply", "FAIL", "Error applying adaptations");
            break;
          }
          if (i === 5) {
            record("AdaptToJob-Apply", "WARN", "Apply adaptations timed out");
          }
        }

        await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-07-adapt-applied.png`, "Adaptations applied");
      } else {
        record("AdaptToJob-Apply", "WARN", "Apply button not visible");
      }
    } catch (err) {
      record("AdaptToJob-Apply", "WARN", `Apply button error: ${err.message}`);
    }
  } else if (adaptText.includes("Erreur") || adaptText.includes("configuration IA")) {
    record("AdaptToJob", "FAIL", `AI error during adaptation`);
  } else {
    record("AdaptToJob", "WARN", `No results after timeout. Page: ${adaptText.slice(0, 300)}`);
  }
}

// ============================================================================
// TEST 5: MODE 4 -- AI CHAT
// ============================================================================
async function testAiChat() {
  log("TEST", "=== TEST 5: AI Chat ===");
  await goToWizardFresh();

  // Select Chat mode (index 3)
  try {
    await selectMode(3, "AI Chat");
  } catch (err) {
    log("ERROR", `Failed to select Chat mode: ${err.message}`);
    record("AIChat", "FAIL", `Cannot select mode: ${err.message}`);
    return;
  }

  // Select resume
  const resumeSelected = await selectResume();
  if (!resumeSelected) {
    log("WARN", "Resume selection may have failed");
  }

  // Should now be on chat view
  await sleep(2000);
  const pageText = await getPageText();

  const hasChatUI =
    pageText.includes("Demarrer une conversation") ||
    pageText.includes("question sur votre CV") ||
    pageText.includes("Posez une question");

  if (!hasChatUI) {
    log("WARN", `Chat UI may not be visible. Text: ${pageText.slice(0, 300)}`);
    await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-08-chat-debug.png`, "Chat debug");
    // Don't fail yet -- try to proceed
  } else {
    log("OK", "Chat UI is visible with empty state");
  }

  // Send first message
  const firstMessage = "Comment puis-je ameliorer mon CV pour decrocher un poste de Data Scientist au Maroc?";
  try {
    const chatTextarea = page.locator("textarea").first();
    await chatTextarea.waitFor({ state: "visible", timeout: 5000 });
    await chatTextarea.fill(firstMessage);
    log("OK", "Typed first chat message");

    // Find and click send button (the small button next to textarea)
    // It's a button with size="sm" and contains PaperPlaneTiltIcon
    const sendBtns = page.locator("button").filter({ has: page.locator("svg") });
    const sendBtnCount = await sendBtns.count();

    // The send button is typically the last small button near the textarea
    // We look for a button in the chat input area (border-t p-3 section)
    const chatInputArea = page.locator("div.border-t");
    const chatSendBtn = chatInputArea.locator("button").first();

    if (await chatSendBtn.isVisible({ timeout: 3000 })) {
      await chatSendBtn.click();
      log("CLICK", "Clicked send button");
    } else {
      // Fallback: press Enter
      await chatTextarea.press("Enter");
      log("CLICK", "Pressed Enter to send");
    }
  } catch (err) {
    log("ERROR", `Error sending chat message: ${err.message}`);
    record("AIChat", "FAIL", `Cannot send message: ${err.message}`);
    return;
  }

  // Wait for response (up to 60s)
  log("WAIT", "Waiting for AI chat response (up to 60s)...");
  let chatResponse = false;
  let responseContent = "";

  for (let i = 0; i < 12; i++) {
    await sleep(5000);
    await dismissOverlay();
    const bodyText = await getPageText();

    // Check if there's a response (look for text blocks that aren't just our message)
    const hasThinking = bodyText.includes("Reflexion");

    // The chat shows messages in bubbles. If we see more substantial text
    // beyond just our message and the empty state text, there's a response
    const messageArea = bodyText.replace("Demarrer une conversation", "")
      .replace("Demandez a l'IA d'ameliorer des sections specifiques de votre CV.", "")
      .replace("Posez une question sur votre CV...", "");

    // Look for our message AND additional content after it
    const ourMsgIndex = messageArea.indexOf(firstMessage.slice(0, 30));
    if (ourMsgIndex >= 0) {
      const afterOurMsg = messageArea.slice(ourMsgIndex + 50);
      // If there's substantial text after our message (not just "Reflexion..."), it's a response
      if (afterOurMsg.length > 100 && !hasThinking) {
        responseContent = afterOurMsg.slice(0, 500);
        log("OK", "Chat response received!");
        chatResponse = true;
        break;
      }
    }

    if (bodyText.includes("Erreur de l'IA")) {
      log("ERROR", "Chat AI error detected");
      break;
    }

    if (hasThinking) {
      log("WAIT", `AI thinking... (${(i + 1) * 5}s)`);
    }
  }

  await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-08-chat.png`, "Chat first response");

  if (chatResponse) {
    record("AIChat", "PASS", `First response received. Preview: ${responseContent.slice(0, 200).replace(/\n/g, " ")}`);

    // Send follow-up
    const followUp = "Quelles certifications me recommandes-tu?";
    try {
      const chatTextarea = page.locator("textarea").first();
      await chatTextarea.fill(followUp);

      const chatInputArea = page.locator("div.border-t");
      const chatSendBtn = chatInputArea.locator("button").first();
      if (await chatSendBtn.isVisible({ timeout: 2000 })) {
        await chatSendBtn.click();
      } else {
        await chatTextarea.press("Enter");
      }
      log("CLICK", "Sent follow-up message");
    } catch (err) {
      log("WARN", `Error sending follow-up: ${err.message}`);
      record("AIChat-FollowUp", "WARN", `Could not send follow-up: ${err.message}`);
      return;
    }

    // Wait for follow-up response
    log("WAIT", "Waiting for follow-up response (up to 60s)...");
    let followUpReceived = false;

    for (let i = 0; i < 12; i++) {
      await sleep(5000);
      await dismissOverlay();
      const followText = await getPageText();
      const hasThinking = followText.includes("Reflexion");

      // Check if follow-up message and response are present
      if (followText.includes(followUp.slice(0, 20)) && !hasThinking) {
        // Count the text after follow-up message
        const followIdx = followText.lastIndexOf(followUp.slice(0, 20));
        const afterFollow = followText.slice(followIdx + followUp.length);
        if (afterFollow.length > 80) {
          log("OK", "Follow-up response received!");
          record("AIChat-FollowUp", "PASS", `Follow-up answered. Preview: ${afterFollow.slice(0, 200).replace(/\n/g, " ")}`);
          followUpReceived = true;
          break;
        }
      }

      if (followText.includes("Erreur")) {
        record("AIChat-FollowUp", "FAIL", "Error on follow-up");
        break;
      }

      if (hasThinking) {
        log("WAIT", `AI thinking on follow-up... (${(i + 1) * 5}s)`);
      }

      if (i === 11) {
        record("AIChat-FollowUp", "WARN", "Follow-up response timed out");
      }
    }

    await safeScreenshot(`${SCREENSHOT_DIR}/e2e-wizard-09-chat-reply.png`, "Chat follow-up response");
  } else {
    const finalText = await getPageText();
    if (finalText.includes("Erreur")) {
      record("AIChat", "FAIL", "Chat error -- AI provider may not be responding");
    } else {
      record("AIChat", "WARN", `No clear response after timeout. Text snippet: ${finalText.slice(-300).replace(/\n/g, " ")}`);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  log("START", "=== E2E AI Resume Wizard Test Suite ===");
  log("INFO", `Target: ${BASE}`);

  try {
    browser = await chromium.launch({ headless: false, slowMo: 100 });
    page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

    await loginAsAdmin();

    await testWizardLanding();
    await testGenerateResume();
    await testGapAnalysis();
    await testAdaptToJob();
    await testAiChat();
  } catch (err) {
    log("FATAL", `Fatal error: ${err.message}\n${err.stack}`);
    record("FATAL", "FAIL", err.message);
  } finally {
    // Print summary
    console.log("\n" + "=".repeat(70));
    console.log("E2E AI WIZARD TEST RESULTS SUMMARY");
    console.log("=".repeat(70));
    for (const r of results) {
      const icon = r.status === "PASS" ? "PASS" : r.status === "FAIL" ? "FAIL" : "WARN";
      console.log(`[${icon}] [${r.mode}] ${r.details}`);
    }
    console.log("=".repeat(70));

    const passed = results.filter((r) => r.status === "PASS").length;
    const failed = results.filter((r) => r.status === "FAIL").length;
    const warned = results.filter((r) => r.status === "WARN").length;
    console.log(`\nTotal: ${results.length} | PASS: ${passed} | FAIL: ${failed} | WARN: ${warned}`);

    if (browser) {
      await sleep(2000);
      await browser.close();
    }
  }
}

main().catch(console.error);
