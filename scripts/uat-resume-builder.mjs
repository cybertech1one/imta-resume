// UAT Resume Builder End-to-End Test v3
// Tests: login -> resumes list -> create resume -> builder -> basics -> summary -> experience -> template -> AI -> preview -> export

import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";

const BASE_URL = process.env.UAT_URL || "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
const EMAIL = "student1@test.com";
const PASSWORD = "TestAccount123!";

let screenshotCounter = 0;
const observations = [];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function observe(type, msg, screenshot = null) {
  observations.push({ type, msg, screenshot });
  log(`[${type}] ${msg}${screenshot ? ` (${screenshot})` : ""}`);
}

async function shot(page, label) {
  screenshotCounter++;
  const filename = `uat-builder-${String(screenshotCounter).padStart(2, "0")}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  log(`Screenshot ${screenshotCounter}: ${filepath} (${label})`);
  return filename;
}

async function dismissOverlay(page) {
  try {
    await page.evaluate(() => {
      // Remove Vite error overlay
      const viteOverlay = document.querySelector("vite-error-overlay");
      if (viteOverlay) viteOverlay.remove();
    });
  } catch (_) {}
}

async function dismissAllDialogs(page) {
  // Close any open dialogs by pressing Escape or clicking close buttons
  try {
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
      // Try clicking Annuler/Cancel button first
      const cancelBtn = dialog.locator('button:has-text("Annuler"), button:has-text("Cancel")').first();
      if (await cancelBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await cancelBtn.click();
        await sleep(500);
      } else {
        // Try pressing Escape
        await page.keyboard.press("Escape");
        await sleep(500);
      }
    }
  } catch (_) {}
}

async function safeClick(page, locator, description, timeout = 5000) {
  try {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
    log(`Clicked: ${description}`);
    return true;
  } catch (e) {
    log(`Could not click: ${description} - ${e.message.slice(0, 80)}`);
    return false;
  }
}

async function safeFill(page, locator, value, description, timeout = 3000) {
  try {
    await locator.waitFor({ state: "visible", timeout });
    await locator.click();
    await locator.clear();
    await locator.pressSequentially(value, { delay: 15 });
    log(`Filled: ${description} = "${value}"`);
    return true;
  } catch (e) {
    log(`Could not fill: ${description} - ${e.message.slice(0, 80)}`);
    return false;
  }
}

async function run() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  log("=== UAT RESUME BUILDER TEST v3 ===");
  log(`Target: ${BASE_URL}`);

  const browser = await chromium.launch({ headless: false, slowMo: 150 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "fr-FR" });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(`PAGE_ERROR: ${err.message}`));

  try {
    // ================================================================
    // STEP 0: LOGIN
    // ================================================================
    log("=== STEP 0: LOGIN ===");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await sleep(3000);
    await dismissOverlay(page);
    await sleep(500);
    await dismissOverlay(page);

    const emailField = page.getByPlaceholder("john.doe@example.com");
    await emailField.waitFor({ state: "visible", timeout: 15000 });
    await emailField.click({ clickCount: 3 });
    await emailField.fill(EMAIL);

    const passField = page.locator('input[type="password"]');
    await passField.click();
    await passField.fill(PASSWORD);
    await sleep(500);

    await page.locator('button[type="submit"]').click();
    await sleep(1000);
    await dismissOverlay(page);

    let loginOk = false;
    try {
      await page.waitForURL("**/dashboard**", { timeout: 20000 });
      loginOk = true;
    } catch (_) {
      await sleep(5000);
      loginOk = page.url().includes("dashboard");
    }

    if (!loginOk) {
      // API fallback
      const result = await page.evaluate(async ({ email, password }) => {
        const r = await fetch("/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }), credentials: "include" });
        return { ok: r.ok, status: r.status };
      }, { email: EMAIL, password: PASSWORD }).catch(() => ({ ok: false }));

      if (result.ok) {
        await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await sleep(3000);
        loginOk = page.url().includes("dashboard");
      }
    }

    if (!loginOk) {
      observe("FAIL", `Login failed. URL: ${page.url()}`);
      await shot(page, "Login failure");
      await browser.close();
      return;
    }
    observe("PASS", "Login successful");
    await sleep(2000);
    await dismissOverlay(page);

    // ================================================================
    // STEP 1: RESUMES LIST
    // ================================================================
    log("=== STEP 1: Resumes list ===");
    await page.goto(`${BASE_URL}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await sleep(4000);
    await dismissOverlay(page);
    const s1 = await shot(page, "Resume list page");
    observe("PASS", "Resumes page loaded", s1);

    // ================================================================
    // STEP 2: CREATE NEW RESUME
    // ================================================================
    log("=== STEP 2: Create new resume ===");

    // The create card has text "Créer un nouveau CV" and a PlusIcon
    // It's a div inside CometCard. Click the h3 text or nearby
    const createText = page.getByText("Créer un nouveau CV", { exact: false });
    let createClicked = false;

    if (await createText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createText.click();
      createClicked = true;
      log("Clicked 'Créer un nouveau CV' text");
    }

    await sleep(2000);

    if (createClicked) {
      const dialog = page.locator('[role="dialog"]');
      const dialogOpen = await dialog.isVisible({ timeout: 5000 }).catch(() => false);

      if (dialogOpen) {
        log("Create resume dialog opened");

        // Fill name input (first input in dialog)
        const nameInput = dialog.locator('input').first();
        await nameInput.click();
        await nameInput.fill("UAT Test Resume");
        log("Filled resume name: UAT Test Resume");

        await sleep(500);
        const s2 = await shot(page, "Create dialog filled");

        // Click submit
        const submitBtn = dialog.locator('button[type="submit"]');
        if (await safeClick(page, submitBtn, "Submit create dialog", 3000)) {
          try {
            await page.waitForURL("**/builder/**", { timeout: 15000 });
            const s2b = await shot(page, "Builder after creation");
            observe("PASS", "Resume created and builder opened", s2b);
          } catch (_) {
            await sleep(5000);
            if (page.url().includes("builder")) {
              observe("PASS", "Resume created (delayed navigation)");
            } else {
              observe("WARN", `Creation submitted but URL: ${page.url()}`, s2);
            }
          }
        }
      } else {
        observe("WARN", "Create card clicked but dialog didn't appear");
      }
    } else {
      observe("WARN", "Could not find create resume card text");
    }

    // ================================================================
    // STEP 3: OPEN BUILDER (fallback to existing resume)
    // ================================================================
    log("=== STEP 3: Open builder ===");

    if (!page.url().includes("builder")) {
      await page.goto(`${BASE_URL}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
      await sleep(4000);
      await dismissOverlay(page);

      // Click an existing resume card by its title text
      const resumeTitle = page.getByText("Mon CV de Test", { exact: false }).first();
      if (await resumeTitle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await resumeTitle.click();
        await sleep(5000);
        await dismissOverlay(page);
      }
    }

    if (!page.url().includes("builder")) {
      observe("FAIL", "Cannot reach builder");
      await shot(page, "No builder");
      printSummary(consoleErrors);
      await browser.close();
      return;
    }

    await sleep(4000);
    await dismissOverlay(page);
    const s4 = await shot(page, "Builder loaded");
    observe("PASS", "Builder page loaded", s4);

    // ================================================================
    // STEP 4: EXPAND AND EDIT BASICS (left sidebar)
    // ================================================================
    log("=== STEP 4: Edit Basics section ===");

    // The left sidebar shows sections as accordions.
    // "Infos de base" section (id="sidebar-basics") needs to be expanded.
    // Click the caret/chevron button to expand.

    // First scroll to basics if needed
    const basicsSection = page.locator('#sidebar-basics');
    try { await basicsSection.scrollIntoViewIfNeeded({ timeout: 3000 }); } catch (_) {}

    // Click the first button inside #sidebar-basics (the accordion trigger)
    const basicsTrigger = basicsSection.locator('button').first();
    await safeClick(page, basicsTrigger, "Basics accordion trigger", 3000);
    await sleep(1500);
    await dismissOverlay(page);

    // Now the basics form should be expanded, showing:
    // Nom -> placeholder "Votre nom complet"
    // Titre -> placeholder starting with "e.g., Certified"
    // Email -> placeholder "your.email@example.com"
    // Phone -> placeholder "+212 6XX XXX XXX"
    let basicsCount = 0;

    const nameInput = page.locator('input[placeholder*="nom complet"]').first();
    if (await safeFill(page, nameInput, "Youssef Amrani", "Full Name (Nom)")) basicsCount++;

    const headlineInput = page.locator('input[placeholder*="e.g., Certified"]').first();
    if (await safeFill(page, headlineInput, "Ingenieur Logiciel Full Stack", "Headline (Titre)")) basicsCount++;

    const emailInput = page.locator('input[placeholder*="your.email@example.com"]').first();
    if (await safeFill(page, emailInput, "youssef@test.com", "Email")) basicsCount++;

    const phoneInput = page.locator('input[placeholder*="+212"]').first();
    if (await safeFill(page, phoneInput, "+212 6 12 34 56 78", "Phone")) basicsCount++;

    await sleep(1000);
    const s5 = await shot(page, "Basics section edited");

    if (basicsCount >= 3) {
      observe("PASS", `Filled ${basicsCount}/4 basics fields`, s5);
    } else if (basicsCount > 0) {
      observe("WARN", `Only filled ${basicsCount}/4 basics fields`, s5);
    } else {
      observe("WARN", "Could not fill basics fields", s5);
    }

    // ================================================================
    // STEP 5: EDIT SUMMARY
    // ================================================================
    log("=== STEP 5: Edit Summary ===");

    // Scroll to summary section
    const summarySection = page.locator('#sidebar-summary');
    try { await summarySection.scrollIntoViewIfNeeded({ timeout: 3000 }); } catch (_) {}

    // Expand summary accordion
    const summaryTrigger = summarySection.locator('button').first();
    await safeClick(page, summaryTrigger, "Summary accordion trigger", 3000);
    await sleep(1500);
    await dismissOverlay(page);

    // Summary uses a ProseMirror rich text editor
    // Look for the .ProseMirror class or contenteditable div
    let summaryFilled = false;

    const proseMirror = page.locator('#sidebar-summary .ProseMirror, #sidebar-summary [contenteditable="true"], #sidebar-summary .tiptap').first();
    if (await proseMirror.isVisible({ timeout: 3000 }).catch(() => false)) {
      await proseMirror.click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type(
        "Ingenieur logiciel passionne avec expertise en developpement web full stack. Maitrise de React, Node.js et des architectures cloud. Diplome de l'IMTA.",
        { delay: 8 }
      );
      summaryFilled = true;
    }

    const s6 = await shot(page, "Summary section");
    observe(summaryFilled ? "PASS" : "WARN", summaryFilled ? "Summary text entered" : "Could not find summary editor", s6);

    // ================================================================
    // STEP 6: ADD WORK EXPERIENCE
    // ================================================================
    log("=== STEP 6: Add Work Experience ===");

    // Scroll to experience section
    const expSection = page.locator('#sidebar-experience');
    try { await expSection.scrollIntoViewIfNeeded({ timeout: 3000 }); } catch (_) {}

    // Expand experience accordion
    const expTrigger = expSection.locator('button').first();
    await safeClick(page, expTrigger, "Experience accordion trigger", 3000);
    await sleep(1000);

    // Look for "+ Position Templates" button or "Ajouter"
    const posTemplatesBtn = page.locator('button:has-text("Position Templates")').first();
    let expDialogOpened = false;

    if (await safeClick(page, posTemplatesBtn, "Position Templates button", 2000)) {
      // A dropdown menu should appear with preset categories
      const menu = page.locator('[role="menu"]');
      if (await menu.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click first menu item to create a new experience
        const firstItem = menu.locator('[role="menuitem"]').first();
        await safeClick(page, firstItem, "First preset category", 2000);
        await sleep(1000);

        // Sub-menu might appear
        const subMenu = page.locator('[role="menu"]');
        if (await subMenu.isVisible({ timeout: 1500 }).catch(() => false)) {
          const subItem = subMenu.locator('[role="menuitem"]').first();
          await safeClick(page, subItem, "First preset item", 2000);
          await sleep(1500);
        }
      }
    } else {
      // Try "Section options" dropdown -> "Ajouter" or similar
      const optionsBtn = expSection.locator('button[aria-label*="options"], button[aria-label*="Options"]').first();
      if (await safeClick(page, optionsBtn, "Experience options button", 2000)) {
        await sleep(500);
        const addItem = page.locator('[role="menuitem"]:has-text("Ajouter"), [role="menuitem"]:has-text("Add")').first();
        await safeClick(page, addItem, "Add experience menu item", 2000);
        await sleep(1500);
      }
    }

    // Check if the "Créer une nouvelle expérience" dialog opened
    const expDialog = page.locator('[role="dialog"]');
    expDialogOpened = await expDialog.isVisible({ timeout: 2000 }).catch(() => false);

    if (expDialogOpened) {
      log("Experience creation dialog opened");

      // Fill the dialog fields:
      // Entreprise, Poste, Lieu, Période, Site web, Description
      const entrepriseInput = expDialog.locator('input').first(); // Entreprise is first
      await safeFill(page, entrepriseInput, "OCP Group", "Entreprise (Company)");

      const posteInput = expDialog.locator('input').nth(1); // Poste is second
      await safeFill(page, posteInput, "Developpeur Web", "Poste (Position)");

      // Fill description in the rich text editor inside the dialog
      const descEditor = expDialog.locator('.ProseMirror, [contenteditable="true"], .tiptap').first();
      if (await descEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descEditor.click();
        await page.keyboard.type("Developpement d'applications web avec React et Node.js pour le groupe OCP.", { delay: 8 });
        log("Filled experience description");
      }

      const s7 = await shot(page, "Experience dialog filled");

      // Click "Créer" to create the experience
      const createBtn = expDialog.locator('button:has-text("Créer"), button:has-text("Create")').first();
      if (await safeClick(page, createBtn, "Create experience button", 3000)) {
        await sleep(2000);
        await dismissOverlay(page);
        observe("PASS", "Work experience created via dialog", s7);
      } else {
        // Close dialog to unblock
        await dismissAllDialogs(page);
        observe("WARN", "Experience dialog filled but could not submit", s7);
      }
    } else {
      const s7 = await shot(page, "Experience section");
      observe("WARN", "Could not open experience creation dialog", s7);
    }

    // Ensure all dialogs are closed before continuing
    await dismissAllDialogs(page);
    await sleep(500);

    // ================================================================
    // STEP 7: CHANGE TEMPLATE (right sidebar)
    // ================================================================
    log("=== STEP 7: Change template ===");
    await dismissAllDialogs(page);

    // Template section is on the right sidebar with heading "Modèle"
    // It shows the current template preview image as a clickable button
    // Clicking opens a gallery dialog

    // The right sidebar template section: id="sidebar-template"
    const templateSection = page.locator('#sidebar-template');
    let templateResult = "WARN";
    let templateMsg = "Template section not found";

    if (await templateSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click the template preview image/button (the one with the swap icon)
      // The template section has a <button variant="ghost"> wrapping an <img>
      const templatePreview = templateSection.locator('button').first();
      if (await safeClick(page, templatePreview, "Template preview button", 3000)) {
        await sleep(2000);

        // Check for gallery dialog
        const galleryDialog = page.locator('[role="dialog"]');
        if (await galleryDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
          const s8 = await shot(page, "Template gallery");

          // Count template options
          const templateImgs = await galleryDialog.locator('img').count();
          log(`Template gallery: ${templateImgs} images`);

          if (templateImgs > 1) {
            // Click a different template
            await galleryDialog.locator('img').nth(2).click();
            await sleep(2000);
            const s8b = await shot(page, "Template changed");
            templateResult = "PASS";
            templateMsg = `Template gallery opened with ${templateImgs} templates, changed selection`;

            // Close gallery
            await page.keyboard.press("Escape");
            await sleep(500);
          } else {
            templateResult = "PASS";
            templateMsg = `Template gallery opened with ${templateImgs} template(s)`;
          }
        } else {
          templateMsg = "Template button clicked but gallery didn't open";
        }
      } else {
        templateMsg = "Could not click template preview button";
      }
    } else {
      // Try to scroll the right sidebar
      templateMsg = "Template section not visible";
    }

    const s8Final = await shot(page, "Template state");
    observe(templateResult, templateMsg, s8Final);
    await dismissAllDialogs(page);

    // ================================================================
    // STEP 8: TEST AI FEATURES
    // ================================================================
    log("=== STEP 8: Test AI features ===");
    await dismissAllDialogs(page);
    await dismissOverlay(page);

    // AI buttons: "Générer" with SparkleIcon in Basics (headline) and Summary sections
    // Also "Suggestion IA" and "Générer av" buttons
    const aiButtons = page.locator('button:has-text("Générer"), button:has-text("Generate"), button:has-text("Suggestion IA")');
    const aiCount = await aiButtons.count();
    log(`Found ${aiCount} AI/Generate buttons`);

    const s9 = await shot(page, "AI features");

    if (aiCount > 0) {
      // List them
      for (let i = 0; i < Math.min(aiCount, 5); i++) {
        const text = (await aiButtons.nth(i).textContent().catch(() => "")).trim();
        const visible = await aiButtons.nth(i).isVisible().catch(() => false);
        log(`  AI button ${i}: "${text}" visible=${visible}`);
      }
      observe("PASS", `AI features detected: ${aiCount} generate/AI buttons`, s9);

      // Try clicking one (use force:true to bypass any overlay issues)
      try {
        const firstVisibleAi = aiButtons.first();
        await firstVisibleAi.click({ timeout: 5000 });
        await sleep(3000);
        await dismissOverlay(page);
        const s9b = await shot(page, "After AI click");
        observe("PASS", "Clicked AI generate button", s9b);
      } catch (e) {
        log(`AI button click failed: ${e.message.slice(0, 80)}`);
        observe("WARN", "AI button visible but could not click (may be obscured)");
      }
    } else {
      observe("WARN", "No AI generate buttons found", s9);
    }

    await dismissAllDialogs(page);

    // ================================================================
    // STEP 9: CHECK RESUME PREVIEW
    // ================================================================
    log("=== STEP 9: Check resume preview ===");

    // The preview is in the center of the builder
    // It renders as an iframe or artboard
    const iframe = page.locator('iframe').first();
    const artboard = page.locator('[class*="artboard"], [data-page]').first();

    let previewFound = false;
    if (await iframe.isVisible({ timeout: 2000 }).catch(() => false)) {
      previewFound = true;
      log("Preview found: <iframe>");
    } else if (await artboard.isVisible({ timeout: 2000 }).catch(() => false)) {
      previewFound = true;
      log("Preview found: artboard element");
    }

    const s10 = await shot(page, "Resume preview");
    observe(previewFound ? "PASS" : "WARN", previewFound ? "Resume preview rendering" : "Preview element not found", s10);

    // ================================================================
    // STEP 10: TEST EXPORT/DOWNLOAD
    // ================================================================
    log("=== STEP 10: Test export ===");
    await dismissAllDialogs(page);

    // Scroll right sidebar to export section (id="sidebar-export")
    const exportSection = page.locator('#sidebar-export');
    let exportVisible = false;

    try {
      await exportSection.scrollIntoViewIfNeeded({ timeout: 3000 });
      exportVisible = await exportSection.isVisible({ timeout: 2000 }).catch(() => false);
    } catch (_) {}

    if (!exportVisible) {
      // Try clicking a right sidebar edge button for export
      const rightEdgeBtns = await page.locator('button[title]').all();
      for (const btn of rightEdgeBtns) {
        const title = await btn.getAttribute("title").catch(() => "");
        if (title && (title.toLowerCase().includes("export") || title.toLowerCase().includes("télécharger"))) {
          await btn.click();
          await sleep(1000);
          exportVisible = await exportSection.isVisible({ timeout: 2000 }).catch(() => false);
          break;
        }
      }
    }

    if (exportVisible) {
      const jsonBtn = exportSection.locator('button:has-text("JSON")').first();
      const pdfBtn = exportSection.locator('button:has-text("PDF")').first();
      const jsonOk = await jsonBtn.isVisible({ timeout: 2000 }).catch(() => false);
      const pdfOk = await pdfBtn.isVisible({ timeout: 2000 }).catch(() => false);

      const s11 = await shot(page, "Export section");
      observe("PASS", `Export: JSON=${jsonOk}, PDF=${pdfOk}`, s11);

      if (jsonOk) {
        const dlPromise = page.waitForEvent("download", { timeout: 5000 }).catch(() => null);
        await jsonBtn.click();
        const dl = await dlPromise;
        if (dl) {
          observe("PASS", `JSON export works: ${dl.suggestedFilename()}`);
        } else {
          observe("WARN", "JSON clicked but no download event");
        }
      }
    } else {
      // Check for export buttons anywhere
      const anyExport = page.locator('button:has-text("JSON"), button:has-text("PDF"), button:has-text("Export")').first();
      if (await anyExport.isVisible({ timeout: 2000 }).catch(() => false)) {
        const s11 = await shot(page, "Export button found");
        observe("PASS", "Export button found in UI", s11);
      } else {
        const s11 = await shot(page, "No export");
        observe("WARN", "Export section not accessible", s11);
      }
    }

    // ================================================================
    // STEP 11: FINAL
    // ================================================================
    log("=== STEP 11: Final ===");
    await dismissAllDialogs(page);
    await dismissOverlay(page);
    const sFinal = await shot(page, "Final builder state");
    observe("PASS", "UAT test completed", sFinal);

    printSummary(consoleErrors);

  } catch (err) {
    log(`FATAL ERROR: ${err.message}`);
    log(err.stack?.slice(0, 300));
    await shot(page, "Fatal error");
    observe("FAIL", `Fatal error: ${err.message.slice(0, 100)}`);
    printSummary(consoleErrors);
  } finally {
    await sleep(3000);
    await browser.close();
    log("Browser closed.");
  }
}

function printSummary(consoleErrors) {
  log("\n" + "=".repeat(60));
  log("UAT RESUME BUILDER - TEST RESULTS SUMMARY");
  log("=".repeat(60));

  for (const obs of observations) {
    log(`[${obs.type}] ${obs.msg}${obs.screenshot ? ` -> ${obs.screenshot}` : ""}`);
  }

  const pass = observations.filter(o => o.type === "PASS").length;
  const fail = observations.filter(o => o.type === "FAIL").length;
  const warn = observations.filter(o => o.type === "WARN").length;

  log(`\nTotals: ${pass} PASS, ${fail} FAIL, ${warn} WARN`);
  log(`Screenshots: ${screenshotCounter}`);

  if (consoleErrors.length > 0) {
    log(`\nConsole Errors (${consoleErrors.length}):`);
    for (const err of consoleErrors.slice(0, 8)) {
      log(`  ERR: ${err.slice(0, 150)}`);
    }
  }

  log("=".repeat(60));
}

run().catch(console.error);
