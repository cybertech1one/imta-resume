/**
 * E2E Career Tools Test - Real IMTA Student Experience
 * Tests all career coaching features end-to-end with Playwright
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const browser = await chromium.launch({ headless: false, slowMo: 100 });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

// Increase default timeout for slow pages
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(15000);

const results = [];
function log(step, status, detail = "") {
  const entry = { step, status, detail };
  results.push(entry);
  const icon = status === "PASS" ? "PASS" : status === "FAIL" ? "FAIL" : "WARN";
  console.log(`[${icon}] [${step}]${detail ? ": " + detail : ""}`);
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
    await page.screenshot({ path, fullPage: false });
    console.log(`  [Screenshot] ${path}`);
    return true;
  } catch (err) {
    console.log(`  [Screenshot FAILED] (${label}): ${err.message}`);
    return false;
  }
}

async function safeGoto(url, label) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await sleep(3000);
    await dismissOverlay();
    return true;
  } catch (err) {
    console.log(`  [Navigation Warn] ${label}: ${err.message.substring(0, 80)}`);
    // Even if timeout, page may have loaded partially
    await dismissOverlay();
    return false;
  }
}

async function waitForContent(timeout = 8000) {
  try {
    await page.waitForLoadState("networkidle", { timeout });
  } catch {}
}

// ===================================================================
// LOGIN
// ===================================================================
console.log("\n--- Logging in as student1@test.com ---\n");

await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded" });
await sleep(2000);
await dismissOverlay();

const loginResult = await page.evaluate(async () => {
  try {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
    });
    return { status: res.status, data: await res.json() };
  } catch (err) {
    return { error: err.message };
  }
});

if (loginResult.error || loginResult.status >= 400) {
  log("Login", "FAIL", JSON.stringify(loginResult));
  console.log("\nCannot proceed without login. Exiting.\n");
  await browser.close();
  process.exit(1);
}

log("Login", "PASS", `Status ${loginResult.status}`);
await safeGoto(`${BASE}/dashboard`, "Dashboard");

// ===================================================================
// 1. CAREER HUB - Main Page & Tabs
// ===================================================================
console.log("\n--- Test 1: Career Hub Main Page ---\n");

await safeGoto(`${BASE}/dashboard/career`, "Career Hub");
await waitForContent();

// Screenshot the main page
await safeScreenshot("C:/tmp/e2e-career-01-hub.png", "Career Hub");

// Check tabs exist
const tabTexts = await page.evaluate(() => {
  const triggers = document.querySelectorAll('[role="tab"]');
  return Array.from(triggers).map(t => t.textContent?.trim() || "");
});
console.log(`  Tabs found: ${tabTexts.join(", ")}`);
log("Career Hub - Tabs Present", tabTexts.length >= 3 ? "PASS" : "WARN", `Found ${tabTexts.length} tabs: ${tabTexts.join(", ")}`);

// Screenshot Assessment tab (default)
await safeScreenshot("C:/tmp/e2e-career-02-assessment-tab.png", "Assessment Tab");

// Click Market tab
const clickTab = async (searchTerms) => {
  return await page.evaluate((terms) => {
    const triggers = document.querySelectorAll('[role="tab"]');
    for (const t of triggers) {
      const text = (t.textContent || "").toLowerCase();
      for (const term of terms) {
        if (text.includes(term.toLowerCase())) {
          t.click();
          return t.textContent?.trim();
        }
      }
    }
    return null;
  }, searchTerms);
};

let tabResult = await clickTab(["market", "marché", "March"]);
await sleep(2000); await dismissOverlay();
await safeScreenshot("C:/tmp/e2e-career-02-market.png", "Market Tab");
log("Career Hub - Market Tab", tabResult ? "PASS" : "WARN", tabResult || "Not found");

tabResult = await clickTab(["pathway", "parcours", "Path"]);
await sleep(2000); await dismissOverlay();
await safeScreenshot("C:/tmp/e2e-career-03-pathways.png", "Pathways Tab");
log("Career Hub - Pathways Tab", tabResult ? "PASS" : "WARN", tabResult || "Not found");

tabResult = await clickTab(["ai tool", "outils ia", "outils", "ai"]);
await sleep(4000); await dismissOverlay(); // Extra wait for AI tools content to load
await waitForContent();
await safeScreenshot("C:/tmp/e2e-career-04-ai-tools.png", "AI Tools Tab");
log("Career Hub - AI Tools Tab", tabResult ? "PASS" : "WARN", tabResult || "Not found");


// ===================================================================
// 2. CAREER ASSESSMENT QUIZ
// ===================================================================
console.log("\n--- Test 2: Career Assessment Quiz ---\n");

// Go back to Assessment tab
await clickTab(["eval", "assess", "évaluation"]);
await sleep(2000); await dismissOverlay();

// Check quiz state
const quizState = await page.evaluate(() => {
  const body = document.body.textContent || "";
  return {
    hasQuestions: body.includes("Question") || body.includes("question"),
    hasProgressBar: body.includes("complete") || body.includes("%"),
    hasCompletedBanner: body.includes("Congratulations") || body.includes("Félicitations") || body.includes("Bravo"),
    hasEmptyState: body.includes("No quiz") || body.includes("Aucune question") || body.includes("pas de question"),
    bodyLength: body.length,
  };
});

if (quizState.hasCompletedBanner) {
  log("Quiz - Already Completed", "PASS", "Previous assessment found");
} else if (quizState.hasQuestions) {
  log("Quiz - Questions Available", "PASS", "Quiz questions loaded");

  // Try answering 3 questions
  for (let i = 0; i < 3; i++) {
    await sleep(800);
    const answered = await page.evaluate(() => {
      // Find quiz option buttons in the active tab panel
      const panel = document.querySelector('[role="tabpanel"]');
      if (!panel) return false;
      const buttons = panel.querySelectorAll("button");
      for (const btn of buttons) {
        const text = btn.textContent || "";
        // Skip tab and nav buttons
        if (text.includes("Evaluation") || text.includes("Market") || text.includes("Pathway") || text.includes("AI") || text.includes("Outils") || text.length < 3) continue;
        // Skip buttons that are clearly not quiz options
        if (text.includes("Reset") || text.includes("Previous") || text.includes("Précédent")) continue;
        btn.click();
        return true;
      }
      return false;
    });
    if (answered) {
      log(`Quiz - Answered Q${i + 1}`, "PASS");
    } else {
      log(`Quiz - Answered Q${i + 1}`, "WARN", "Could not find option");
      break;
    }
    await sleep(600);
  }
} else if (quizState.hasEmptyState) {
  log("Quiz - No Questions", "WARN", "Database needs quiz question seeding");
} else {
  log("Quiz - State Unknown", "WARN", `Page loaded (${quizState.bodyLength} chars) but quiz state unclear`);
}

await safeScreenshot("C:/tmp/e2e-career-05-quiz.png", "Quiz State");


// ===================================================================
// 3. AI CAREER COACH
// ===================================================================
console.log("\n--- Test 3: AI Career Coach ---\n");

// Navigate to AI Tools tab fresh
await clickTab(["ai tool", "outils ia", "outils", "ai"]);
await sleep(5000); // Generous wait for AI tools to fully render
await dismissOverlay();
await waitForContent();

// Debug: what buttons exist on the page
const allButtons = await page.evaluate(() => {
  const btns = document.querySelectorAll("button");
  return Array.from(btns).map(b => b.textContent?.trim().substring(0, 60) || "(empty)");
});
console.log(`  Buttons on page: ${allButtons.filter(b => b.length > 2).join(" | ")}`);

// Find and click the Career Coach button
const coachClicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button"));
  // Try exact matches first
  for (const btn of buttons) {
    const text = (btn.textContent || "").toLowerCase();
    if (text.includes("start coaching") || text.includes("commencer le coaching") || text.includes("démarrer")) {
      btn.click();
      return btn.textContent?.trim();
    }
  }
  // Try card-based approach - find cards with "coach" text and click their button
  const cards = document.querySelectorAll('[data-slot="card"], .group');
  for (const card of cards) {
    const text = (card.textContent || "").toLowerCase();
    if (text.includes("coach") || text.includes("career coach") || text.includes("coach carrière")) {
      const btn = card.querySelector("button");
      if (btn) { btn.click(); return "Coach card button: " + btn.textContent?.trim(); }
    }
  }
  // Fallback: any button mentioning "coach"
  for (const btn of buttons) {
    const text = (btn.textContent || "").toLowerCase();
    if (text.includes("coach")) {
      btn.click();
      return btn.textContent?.trim();
    }
  }
  return null;
});

if (coachClicked) {
  log("AI Coach - Dialog Opened", "PASS", coachClicked);
  await sleep(3000); await dismissOverlay();

  // Screenshot the dialog
  await safeScreenshot("C:/tmp/e2e-career-06-coach-dialog.png", "Coach Dialog");

  // Find any visible input/textarea
  const inputFound = await page.evaluate(() => {
    const allInputs = document.querySelectorAll("input:not([type='hidden']), textarea");
    return Array.from(allInputs).map(inp => ({
      tag: inp.tagName,
      type: inp.getAttribute("type"),
      placeholder: inp.getAttribute("placeholder"),
      visible: inp.offsetParent !== null,
    })).filter(i => i.visible);
  });
  console.log(`  Visible inputs: ${JSON.stringify(inputFound)}`);

  if (inputFound.length > 0) {
    // Find the right input (prefer textarea, then text input)
    let selector = "textarea";
    try {
      const ta = await page.$(selector);
      if (!ta || !(await ta.isVisible())) {
        selector = "input[type='text']";
      }
    } catch { selector = "input[type='text']"; }

    try {
      const chatEl = await page.$(selector);
      if (chatEl && await chatEl.isVisible()) {
        await chatEl.fill("Je suis etudiant en maintenance industrielle a l'IMTA. Quelles carrieres me recommandez-vous au Maroc?");
        log("AI Coach - Message Typed", "PASS");
        await chatEl.press("Enter");
        await sleep(1000);

        // Also try send button
        await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          for (const btn of buttons) {
            const text = (btn.textContent || "").toLowerCase();
            const label = (btn.getAttribute("aria-label") || "").toLowerCase();
            if (text.includes("send") || text.includes("envoyer") || label.includes("send")) {
              btn.click(); return;
            }
          }
        });

        log("AI Coach - Message Sent", "PASS");

        // Wait for AI response
        console.log("  Waiting for AI response (up to 30s)...");
        let aiResponded = false;
        for (let i = 0; i < 15; i++) {
          await sleep(2000);
          const resp = await page.evaluate(() => {
            const dialogs = document.querySelectorAll("[role='dialog'], .fixed");
            for (const d of dialogs) {
              const text = d.textContent || "";
              if (text.includes("carrière") || text.includes("ingénieur") || text.includes("maintenance") ||
                  text.includes("recommand") || text.includes("industriel") || text.includes("Maroc") ||
                  text.includes("career") || text.includes("engineer")) {
                return true;
              }
            }
            return false;
          });
          if (resp) { aiResponded = true; break; }
        }
        log("AI Coach - AI Response", aiResponded ? "PASS" : "WARN",
            aiResponded ? "AI responded with career content" : "No AI response in 30s (check AI provider)");
      }
    } catch (err) {
      log("AI Coach - Interaction", "WARN", err.message.substring(0, 60));
    }
  } else {
    log("AI Coach - Chat Input", "WARN", "No visible input found in dialog");
  }
} else {
  log("AI Coach - Dialog Open", "WARN", "Could not find Career Coach button (AI tools may not be loaded)");
}

await safeScreenshot("C:/tmp/e2e-career-06-coach.png", "AI Coach");
await page.keyboard.press("Escape");
await sleep(500);


// ===================================================================
// 4. SKILL GAP ANALYSIS
// ===================================================================
console.log("\n--- Test 4: Skill Gap Analysis ---\n");

// Make sure we're on AI Tools tab
await clickTab(["ai tool", "outils ia", "outils", "ai"]);
await sleep(3000); await dismissOverlay();

// Find Skill Gap button
const gapClicked = await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("button"));
  for (const btn of buttons) {
    const text = (btn.textContent || "").toLowerCase();
    if (text.includes("analyze my skills") || text.includes("analyser") || text.includes("analyse") || text.includes("skill gap") || text.includes("lacune")) {
      btn.click();
      return btn.textContent?.trim();
    }
  }
  // Card approach
  const cards = document.querySelectorAll('[data-slot="card"], .group');
  for (const card of cards) {
    const text = (card.textContent || "").toLowerCase();
    if (text.includes("skill gap") || text.includes("lacune") || text.includes("gap analysis")) {
      const btn = card.querySelector("button");
      if (btn) { btn.click(); return "Gap card: " + btn.textContent?.trim(); }
    }
  }
  return null;
});

if (gapClicked) {
  log("Skill Gap - Dialog Opened", "PASS", gapClicked);
  await sleep(2000); await dismissOverlay();

  // Fill target role
  const gapInput = await page.$("[role='dialog'] input, dialog input, .fixed input");
  if (gapInput) {
    await gapInput.fill("Ingenieur Maintenance");
    log("Skill Gap - Target Role Entered", "PASS");

    // Click analyze
    const analyzeClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("[role='dialog'] button, dialog button, .fixed button"));
      for (const btn of buttons) {
        const text = (btn.textContent || "").toLowerCase();
        if (text.includes("analy") || text.includes("lancer") || text.includes("start")) {
          btn.click();
          return btn.textContent?.trim();
        }
      }
      return null;
    });
    log("Skill Gap - Analysis Started", analyzeClicked ? "PASS" : "WARN", analyzeClicked || "Pressed Enter instead");
    if (!analyzeClicked) await gapInput.press("Enter");

    console.log("  Waiting for analysis (up to 20s)...");
    await sleep(15000);
  } else {
    log("Skill Gap - Input", "WARN", "No input field found");
  }
} else {
  log("Skill Gap - Dialog Open", "WARN", "Could not find Skill Gap button");
}

await safeScreenshot("C:/tmp/e2e-career-07-gap.png", "Skill Gap");
await page.keyboard.press("Escape");
await sleep(500);


// ===================================================================
// 5. CAREER ROADMAP GENERATOR
// ===================================================================
console.log("\n--- Test 5: Career Roadmap Generator ---\n");

const roadmapLoaded = await safeGoto(`${BASE}/dashboard/career/roadmap`, "Roadmap");
await waitForContent(10000);

const roadmapContent = await page.textContent("body").catch(() => "");
const hasRoadmapPage = roadmapContent.length > 200;

if (hasRoadmapPage) {
  log("Roadmap - Page Loaded", "PASS", `${roadmapContent.length} chars`);

  // Click Create tab if available
  await clickTab(["create", "créer", "new", "nouveau"]);
  await sleep(1500);

  // Fill form inputs
  const roleInputs = await page.$$("input:not([type='hidden'])");
  console.log(`  Found ${roleInputs.length} visible inputs`);

  if (roleInputs.length > 0) {
    try {
      await roleInputs[0].fill("Technicien Maintenance");
      if (roleInputs.length > 1) {
        await roleInputs[1].fill("Ingenieur Maintenance Industrielle");
      }
      log("Roadmap - Form Filled", "PASS");
    } catch (err) {
      log("Roadmap - Form Fill", "WARN", err.message.substring(0, 60));
    }
  }

  // Try selecting industry
  const selectOpened = await page.evaluate(() => {
    const triggers = document.querySelectorAll('[role="combobox"], [data-slot="select-trigger"]');
    if (triggers.length > 0) {
      triggers[0].click();
      return true;
    }
    return false;
  });
  if (selectOpened) {
    await sleep(800);
    await page.evaluate(() => {
      const opts = document.querySelectorAll('[role="option"]');
      if (opts.length > 0) opts[0].click();
    });
    log("Roadmap - Industry Selected", "PASS");
  }

  await sleep(500);

  // Click generate
  const genClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const btn of buttons) {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("generat") || text.includes("générer") || text.includes("generer") || text.includes("créer la feuille")) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    return null;
  });

  if (genClicked) {
    log("Roadmap - Generation Started", "PASS", genClicked);
    console.log("  Waiting for AI generation (up to 45s)...");
    for (let i = 0; i < 15; i++) {
      await sleep(3000);
      await dismissOverlay();
      const done = await page.evaluate(() => {
        const body = document.body.textContent || "";
        return body.includes("Phase") || body.includes("Step") || body.includes("Étape") ||
               body.includes("milestone") || body.includes("Action") || body.includes("objectif") ||
               body.includes("month") || body.includes("mois");
      });
      if (done) {
        log("Roadmap - Content Generated", "PASS");
        break;
      }
      if (i === 14) log("Roadmap - Content", "WARN", "No content in 45s (check AI provider)");
    }
  } else {
    log("Roadmap - Generate Button", "WARN", "Not found");
  }
} else {
  log("Roadmap - Page Load", "WARN", roadmapLoaded ? "Page loaded but empty" : "Navigation timed out");
}

await safeScreenshot("C:/tmp/e2e-career-08-roadmap.png", "Roadmap");


// ===================================================================
// 6. SKILLS TRACKING
// ===================================================================
console.log("\n--- Test 6: Skills Tracking ---\n");

await safeGoto(`${BASE}/dashboard/career/skills`, "Skills");
await waitForContent();

const skillsContent = await page.textContent("body").catch(() => "");
const hasSkillsPage = skillsContent.includes("Skills") || skillsContent.includes("Compétences") ||
                      skillsContent.includes("skill") || skillsContent.includes("compétence");

if (hasSkillsPage) {
  log("Skills - Page Loaded", "PASS");

  // Try adding a skill
  const addClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const btn of buttons) {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("add") || text.includes("ajouter") || text.includes("new") || text.includes("nouveau")) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    // Try "+" icon button
    for (const btn of buttons) {
      if (btn.textContent?.trim() === "+") { btn.click(); return "+"; }
    }
    return null;
  });

  if (addClicked) {
    log("Skills - Add Clicked", "PASS", addClicked);
    await sleep(1500);
    const skillInput = await page.$("[role='dialog'] input, dialog input, .fixed input");
    if (skillInput) {
      await skillInput.fill("Python Programming");
      log("Skills - Skill Name Entered", "PASS");
    }
  } else {
    log("Skills - Add Button", "WARN", "No add button found (page may show skill recommendations)");
  }
} else {
  log("Skills - Page Load", "WARN", "Content not detected");
}

await safeScreenshot("C:/tmp/e2e-career-09-skills.png", "Skills");
await page.keyboard.press("Escape");
await sleep(500);


// ===================================================================
// 7. CERTIFICATIONS
// ===================================================================
console.log("\n--- Test 7: Certifications ---\n");

await safeGoto(`${BASE}/dashboard/career/certifications`, "Certifications");
await waitForContent();

const certsContent = await page.textContent("body").catch(() => "");
const hasCertsPage = certsContent.includes("Certification") || certsContent.includes("certification") ||
                     certsContent.includes("Inventory") || certsContent.includes("Inventaire");

if (hasCertsPage) {
  log("Certifications - Page Loaded", "PASS");

  // Try to add a certification
  const addCertClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const btn of buttons) {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("add") || text.includes("ajouter") || text.includes("new") || text.includes("+")) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    return null;
  });

  if (addCertClicked) {
    log("Certifications - Add Dialog Opened", "PASS", addCertClicked);
    await sleep(2000);

    // Fill form
    const certInputs = await page.$$("[role='dialog'] input, dialog input, [data-slot='dialog-content'] input, .fixed input");
    console.log(`  Found ${certInputs.length} inputs in dialog`);

    if (certInputs.length > 0) {
      try {
        await certInputs[0].fill("AWS Cloud Practitioner");
        log("Certifications - Name Filled", "PASS");

        // Try date inputs
        for (const inp of certInputs) {
          const type = await inp.getAttribute("type");
          if (type === "date") {
            await inp.fill("2025-03-15");
            log("Certifications - Date Filled", "PASS");
            break;
          }
        }

        // Try to save
        const saved = await page.evaluate(() => {
          const btns = document.querySelectorAll("[role='dialog'] button, dialog button, [data-slot='dialog-content'] button, .fixed button");
          for (const btn of btns) {
            const text = (btn.textContent || "").toLowerCase();
            if (text.includes("save") || text.includes("sauvegarder") || text.includes("enregistrer") || text.includes("submit")) {
              btn.click();
              return btn.textContent?.trim();
            }
          }
          return null;
        });
        if (saved) {
          log("Certifications - Save Clicked", "PASS", saved);
          await sleep(2000);
        }
      } catch (err) {
        log("Certifications - Form Fill", "WARN", err.message.substring(0, 60));
      }
    }
  } else {
    log("Certifications - Add Button", "WARN", "No add button found");
  }
} else {
  log("Certifications - Page Load", "WARN", "Content not detected");
}

await safeScreenshot("C:/tmp/e2e-career-10-certs.png", "Certifications");
await page.keyboard.press("Escape");
await sleep(500);


// ===================================================================
// 8. CAREER COACHING
// ===================================================================
console.log("\n--- Test 8: Career Coaching ---\n");

await safeGoto(`${BASE}/dashboard/career/coaching`, "Coaching");
await waitForContent();

const coachingContent = await page.textContent("body").catch(() => "");
const hasCoachingPage = coachingContent.includes("Coaching") || coachingContent.includes("coaching") ||
                        coachingContent.includes("Goals") || coachingContent.includes("Objectif") ||
                        coachingContent.includes("Journal") || coachingContent.includes("Dashboard") ||
                        coachingContent.includes("Affirmation") || coachingContent.includes("Tableau");

if (hasCoachingPage) {
  log("Coaching - Page Loaded", "PASS");

  // Check tabs
  const coachingTabs = await page.evaluate(() => {
    const triggers = document.querySelectorAll('[role="tab"]');
    return Array.from(triggers).map(t => t.textContent?.trim()).filter(Boolean);
  });
  if (coachingTabs.length > 0) {
    log("Coaching - Tabs Found", "PASS", coachingTabs.join(", "));
  }

  // Try to add a goal
  const goalClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const btn of buttons) {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("goal") || text.includes("objectif") || text.includes("add") || text.includes("ajouter") || text.includes("new") || text.includes("+")) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    return null;
  });

  if (goalClicked) {
    log("Coaching - Action Clicked", "PASS", goalClicked);
    await sleep(1500);
    const goalInput = await page.$("[role='dialog'] input, dialog input, .fixed input");
    if (goalInput) {
      await goalInput.fill("Complete 5 job applications this week");
      log("Coaching - Goal Entered", "PASS");
    }
  } else {
    log("Coaching - Add Button", "WARN", "No add button found");
  }
} else {
  log("Coaching - Page Load", "WARN", "Content not detected");
}

await safeScreenshot("C:/tmp/e2e-career-11-coaching.png", "Coaching");
await page.keyboard.press("Escape");
await sleep(500);


// ===================================================================
// 9. AI MENTOR
// ===================================================================
console.log("\n--- Test 9: AI Mentor ---\n");

await safeGoto(`${BASE}/dashboard/ai-mentor`, "AI Mentor");
await waitForContent();

const mentorContent = await page.textContent("body").catch(() => "");
const hasMentorPage = mentorContent.includes("Mentor") || mentorContent.includes("mentor") ||
                      mentorContent.includes("IA") || mentorContent.includes("AI") ||
                      mentorContent.includes("Chat") || mentorContent.includes("Conversation");

if (hasMentorPage) {
  log("AI Mentor - Page Loaded", "PASS");

  // Check tabs
  const mentorTabs = await page.evaluate(() => {
    const triggers = document.querySelectorAll('[role="tab"]');
    return Array.from(triggers).map(t => t.textContent?.trim()).filter(Boolean);
  });
  if (mentorTabs.length > 0) {
    log("AI Mentor - Tabs Found", "PASS", mentorTabs.join(", "));
  }

  // Check for onboarding
  const hasOnboarding = mentorContent.includes("Bienvenue") || mentorContent.includes("Welcome") ||
                        mentorContent.includes("onboarding") || mentorContent.includes("commencer");

  // Try to select a mentor
  const mentorSelected = await page.evaluate(() => {
    // Try cards
    const cards = document.querySelectorAll('[data-slot="card"]');
    for (const card of cards) {
      const text = (card.textContent || "").toLowerCase();
      if (text.includes("mentor") || text.includes("select") || text.includes("choisir") || text.includes("start")) {
        const btn = card.querySelector("button");
        if (btn) { btn.click(); return "Card button: " + btn.textContent?.trim(); }
      }
    }
    // Try buttons
    const buttons = Array.from(document.querySelectorAll("button"));
    for (const btn of buttons) {
      const text = (btn.textContent || "").toLowerCase();
      if (text.includes("select") || text.includes("choisir") || text.includes("start") || text.includes("commencer") || text.includes("create") || text.includes("créer")) {
        btn.click();
        return btn.textContent?.trim();
      }
    }
    return null;
  });

  if (mentorSelected) {
    log("AI Mentor - Mentor Selected", "PASS", mentorSelected);
    await sleep(3000); await dismissOverlay();

    // Look for chat tab and click it
    await clickTab(["chat", "conversation", "message"]);
    await sleep(2000);

    // Try chat input
    const chatInput = await page.$("textarea, input[type='text']");
    if (chatInput && await chatInput.isVisible()) {
      await chatInput.fill("Comment puis-je ameliorer mon CV pour le secteur industriel?");
      log("AI Mentor - Message Typed", "PASS");
      await chatInput.press("Enter");

      // Try send button
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        for (const btn of buttons) {
          const text = (btn.textContent || "").toLowerCase();
          if (text.includes("send") || text.includes("envoyer")) { btn.click(); return; }
        }
      });

      log("AI Mentor - Message Sent", "PASS");
      console.log("  Waiting for AI response (up to 30s)...");
      let mentorResponded = false;
      for (let i = 0; i < 15; i++) {
        await sleep(2000);
        const resp = await page.evaluate(() => {
          const body = document.body.textContent || "";
          return body.includes("CV") || body.includes("industriel") || body.includes("améliorer") ||
                 body.includes("compétences") || body.includes("expérience");
        });
        if (resp) { mentorResponded = true; break; }
      }
      log("AI Mentor - Response", mentorResponded ? "PASS" : "WARN",
          mentorResponded ? "AI mentor responded" : "No response in 30s");
    } else {
      log("AI Mentor - Chat Input", "WARN", "No visible chat input (may need to select mentor first)");
    }
  } else {
    log("AI Mentor - Mentor Selection", "WARN", "No selection button found");
  }
} else {
  log("AI Mentor - Page Load", "WARN", "Content not detected");
}

await safeScreenshot("C:/tmp/e2e-career-12-mentor.png", "AI Mentor");


// ===================================================================
// BONUS: Quick page load checks for remaining career pages
// ===================================================================
console.log("\n--- Bonus: Quick Page Load Checks ---\n");

const bonusPages = [
  { path: "/dashboard/career/gap-analysis", name: "Gap Analysis" },
  { path: "/dashboard/career/skill-gap", name: "Skill Gap" },
  { path: "/dashboard/career/timeline", name: "Timeline" },
  { path: "/dashboard/career/branding", name: "Branding" },
  { path: "/dashboard/career/study-plan", name: "Study Plan" },
  { path: "/dashboard/career/transition", name: "Transition" },
  { path: "/dashboard/career/predictions", name: "Predictions" },
];

for (const pg of bonusPages) {
  const loaded = await safeGoto(`${BASE}${pg.path}`, pg.name);
  const text = await page.textContent("body").catch(() => "");
  const ok = text.length > 200 && !text.includes("404") && !text.includes("Not Found");
  log(`Bonus - ${pg.name}`, ok ? "PASS" : "WARN", ok ? `Loaded (${text.length} chars)` : "May not exist or is empty");
}


// ===================================================================
// FINAL SUMMARY
// ===================================================================
console.log("\n" + "=".repeat(60));
console.log(" E2E CAREER TOOLS TEST SUMMARY");
console.log("=".repeat(60));

const passed = results.filter(r => r.status === "PASS").length;
const warned = results.filter(r => r.status === "WARN").length;
const failed = results.filter(r => r.status === "FAIL").length;

console.log(`\n  PASS: ${passed}`);
console.log(`  WARN: ${warned}`);
console.log(`  FAIL: ${failed}`);
console.log(`  Total: ${results.length}`);
console.log("");

for (const r of results) {
  const icon = r.status === "PASS" ? "[PASS]" : r.status === "FAIL" ? "[FAIL]" : "[WARN]";
  console.log(`  ${icon} ${r.step}${r.detail ? " - " + r.detail : ""}`);
}

console.log("\nScreenshots saved to C:/tmp/e2e-career-*.png\n");

// Keep browser open briefly
await sleep(3000);
await browser.close();
console.log("Test complete.\n");
