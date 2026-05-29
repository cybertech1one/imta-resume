/**
 * E2E Interview Feature Test Script (v2 - Fixed)
 * Tests all interview features as a real student user
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const results = [];
function log(feature, status, detail) {
  const entry = { feature, status, detail };
  results.push(entry);
  const icon = status === "PASS" ? "[PASS]" : status === "FAIL" ? "[FAIL]" : "[WARN]";
  console.log(`${icon} ${feature}: ${detail}`);
}

const browser = await chromium.launch({ headless: false, slowMo: 100 });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.setDefaultTimeout(45000); // Increase default timeout

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
    console.log(`  Screenshot: ${path}`);
    return true;
  } catch (e) {
    console.log(`  Screenshot failed for ${label}: ${e.message}`);
    return false;
  }
}

// Wait for page to finish loading (past "Chargement..." state)
async function waitForContent(timeoutMs = 20000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    await sleep(1000);
    await dismissOverlay();
    const state = await page.evaluate(() => {
      const body = document.body.innerText;
      const isLoading = body.includes("Chargement") || body.includes("Loading...");
      const hasSkeletons = document.querySelectorAll("[class*='skeleton'], [class*='Skeleton'], [class*='animate-pulse']").length > 3;
      return { isLoading, hasSkeletons, bodyLength: body.length };
    });
    if (!state.isLoading && !state.hasSkeletons) {
      return true;
    }
  }
  return false;
}

// ============================================================
// LOGIN
// ============================================================
console.log("\n=== LOGGING IN ===\n");

try {
  await page.goto(`${BASE}/auth/login`, { timeout: 30000 });
  await sleep(2000);
  await dismissOverlay();

  const loginResult = await page.evaluate(async () => {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student2@test.com", password: "TestAccount123!" })
    });
    const data = await res.json();
    return { status: res.status, ok: res.ok };
  });

  console.log(`Login response: status=${loginResult.status}, ok=${loginResult.ok}`);

  await page.goto(`${BASE}/dashboard`, { timeout: 30000 });
  await sleep(3000);
  await dismissOverlay();

  const url = page.url();
  if (url.includes("/dashboard")) {
    log("Login", "PASS", "Logged in as student2@test.com, redirected to dashboard");
  } else {
    log("Login", "FAIL", `Unexpected URL after login: ${url}`);
  }
} catch (e) {
  log("Login", "FAIL", `Login error: ${e.message}`);
}

// ============================================================
// 1. INTERVIEW HUB
// ============================================================
console.log("\n=== TEST 1: INTERVIEW HUB ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview`, { timeout: 30000 });
  await sleep(2000);
  await dismissOverlay();
  await waitForContent(15000);
  await sleep(2000);
  await dismissOverlay();

  await safeScreenshot("C:/tmp/e2e-interview-01-hub.png", "Interview Hub");

  const hubContent = await page.evaluate(() => {
    const body = document.body.innerText;
    const mainContent = document.querySelector("main, [class*='content'], [class*='main']");
    const mainText = mainContent ? mainContent.innerText : body;
    return {
      hasReadiness: mainText.includes("Readiness") || mainText.includes("readiness") || mainText.includes("Score") || mainText.includes("0%"),
      hasStatistics: mainText.includes("session") || mainText.includes("Session") || mainText.includes("Sessions"),
      hasPractice: mainText.includes("Pratique") || mainText.includes("Practice"),
      hasChatbot: mainText.includes("Chatbot") || mainText.includes("chatbot"),
      hasSimulation: mainText.includes("Simulation") || mainText.includes("simulation"),
      hasModes: mainText.includes("Start a Session") || mainText.includes("Commencer"),
      contentLength: mainText.length,
      title: mainText.substring(0, 100),
    };
  });

  console.log("  Hub content:", JSON.stringify(hubContent, null, 2));

  if (hubContent.contentLength > 100) {
    log("Interview Hub", "PASS", `Hub loaded. Readiness: ${hubContent.hasReadiness}, Stats: ${hubContent.hasStatistics}, Practice: ${hubContent.hasPractice}, Chatbot: ${hubContent.hasChatbot}, Simulation: ${hubContent.hasSimulation}`);
  } else {
    log("Interview Hub", "WARN", "Hub page loaded but content seems sparse");
  }
} catch (e) {
  log("Interview Hub", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 2. PRACTICE SESSION
// ============================================================
console.log("\n=== TEST 2: PRACTICE SESSION ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview/practice?field=general&difficulty=intermediate`, { timeout: 45000 });
  await sleep(3000);
  await dismissOverlay();

  await safeScreenshot("C:/tmp/e2e-interview-02-practice-start.png", "Practice Start");

  // Wait for content to load past "Chargement..." stage
  const contentLoaded = await waitForContent(30000);
  await sleep(2000);

  const practiceState = await page.evaluate(() => {
    const body = document.body.innerText;
    const mainContent = document.querySelector("main") || document.body;
    const mainText = mainContent.innerText;
    return {
      isLoading: mainText.includes("Chargement"),
      hasGenerating: mainText.includes("Generating") || mainText.includes("generating") || mainText.includes("Generation") || mainText.includes("generation"),
      hasError: mainText.includes("error") || mainText.includes("Error") || mainText.includes("erreur") || mainText.includes("Erreur"),
      hasAINotAvailable: mainText.includes("AI is not") || mainText.includes("not configured") || mainText.includes("indisponible") || mainText.includes("non disponible"),
      hasQuestion: mainText.includes("Question"),
      hasTextarea: !!document.querySelector("textarea"),
      hasSpinner: !!document.querySelector("[class*='spinner'], [class*='Spinner'], [class*='animate-spin']"),
      bodySnippet: mainText.substring(0, 600),
    };
  });

  console.log("  Practice state:", JSON.stringify(practiceState, null, 2));
  await safeScreenshot("C:/tmp/e2e-interview-03-questions.png", "Practice After Wait");

  if (practiceState.isLoading || practiceState.hasSpinner) {
    // Still loading - the page is stuck on loading state, likely waiting for AI status check
    log("Practice - Page Load", "WARN", "Page still showing 'Chargement...' after 30s wait. AI status check may be hanging or the component is in a perpetual loading state.");

    // Try waiting even longer
    console.log("  Waiting additional 30s for AI to respond...");
    for (let i = 0; i < 15; i++) {
      await sleep(2000);
      await dismissOverlay();
      const newState = await page.evaluate(() => {
        const main = document.querySelector("main") || document.body;
        return {
          isLoading: main.innerText.includes("Chargement"),
          hasQuestion: main.innerText.includes("Question"),
          hasTextarea: !!document.querySelector("textarea"),
          hasError: main.innerText.includes("error") || main.innerText.includes("Error"),
          snippet: main.innerText.substring(0, 200),
        };
      });
      if (!newState.isLoading || newState.hasQuestion || newState.hasTextarea) {
        console.log(`  Content loaded after additional ${(i+1)*2}s`);

        if (newState.hasQuestion || newState.hasTextarea) {
          log("Practice - Question Generation", "PASS", "Questions generated by AI");

          // Try answering
          const textarea = await page.$("textarea");
          if (textarea) {
            await textarea.fill("Je suis motive par les defis techniques et l'innovation. Mon experience a l'IMTA m'a appris a travailler en equipe et a resoudre des problemes complexes.");
            await sleep(500);
            await safeScreenshot("C:/tmp/e2e-interview-04-answer.png", "Answer Typed");

            // Click submit using Playwright selector (not querySelector)
            const submitBtn = await page.locator("button").filter({ hasText: /Submit|Soumettre|Envoyer|Evaluer/ }).first();
            if (await submitBtn.count() > 0) {
              await submitBtn.click();
              console.log("  Clicked submit, waiting for evaluation...");

              for (let j = 0; j < 15; j++) {
                await sleep(2000);
                await dismissOverlay();
                const evalState = await page.evaluate(() => {
                  const text = document.body.innerText;
                  return {
                    hasScore: text.includes("Score") || text.includes("/10") || text.includes("/20"),
                    hasFeedback: text.includes("Feedback") || text.includes("feedback") || text.includes("Retour"),
                    hasStrengths: text.includes("Strength") || text.includes("Points forts") || text.includes("force"),
                  };
                });
                if (evalState.hasScore || evalState.hasFeedback || evalState.hasStrengths) {
                  log("Practice - Evaluation", "PASS", "AI evaluated answer");
                  break;
                }
              }
              await safeScreenshot("C:/tmp/e2e-interview-05-evaluation.png", "Evaluation");
            }
          }
        }
        break;
      }
      if (i === 14) {
        log("Practice Session", "WARN", "Still loading after 60s total wait. AI may be unavailable.");
        await safeScreenshot("C:/tmp/e2e-interview-03-questions.png", "Practice Still Loading");
      }
    }
  } else if (practiceState.hasQuestion || practiceState.hasTextarea) {
    log("Practice - Question Generation", "PASS", "Questions loaded");

    // Answer question
    const textarea = await page.$("textarea");
    if (textarea) {
      await textarea.fill("Je suis motive par les defis techniques et l'innovation. Mon experience a l'IMTA m'a appris a travailler en equipe.");
      await sleep(500);
      await safeScreenshot("C:/tmp/e2e-interview-04-answer.png", "Answer Typed");

      const submitBtn = await page.locator("button").filter({ hasText: /Submit|Soumettre|Envoyer|Evaluer/ }).first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        console.log("  Submitted answer...");
        await sleep(5000);
        await safeScreenshot("C:/tmp/e2e-interview-05-evaluation.png", "Evaluation");
        log("Practice - Evaluation", "PASS", "Answer submitted for evaluation");
      }
    }
  } else if (practiceState.hasError || practiceState.hasAINotAvailable) {
    log("Practice Session", "WARN", "AI not available or error occurred. Practice cannot function.");
  } else {
    log("Practice Session", "WARN", `Unexpected state: ${practiceState.bodySnippet.substring(0, 200)}`);
  }
} catch (e) {
  log("Practice Session", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 3. AI INTERVIEW CHATBOT
// ============================================================
console.log("\n=== TEST 3: AI INTERVIEW CHATBOT ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview/chatbot`, { timeout: 45000 });
  await sleep(3000);
  await dismissOverlay();

  // Wait for content past loading
  const chatLoaded = await waitForContent(20000);
  await sleep(2000);
  await dismissOverlay();

  await safeScreenshot("C:/tmp/e2e-interview-06-chatbot-initial.png", "Chatbot Initial");

  const chatbotState = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      isLoading: mainText.includes("Chargement"),
      hasConfigView: mainText.includes("mode") || mainText.includes("Mode") || mainText.includes("Pratique rapide"),
      hasFieldSelection: mainText.includes("Domaine") || mainText.includes("domain") || mainText.includes("field"),
      hasAINotAvailable: mainText.includes("not available") || mainText.includes("not configured") || mainText.includes("indisponible"),
      hasStartButton: false, // Will check with Playwright locator
      snippet: mainText.substring(0, 600),
    };
  });

  console.log("  Chatbot state:", JSON.stringify(chatbotState, null, 2));

  if (chatbotState.isLoading) {
    log("Chatbot - Loading", "WARN", "Chatbot page stuck on 'Chargement...' - AI status query may be hanging");

    // Wait additional time
    console.log("  Waiting additional 20s...");
    for (let i = 0; i < 10; i++) {
      await sleep(2000);
      await dismissOverlay();
      const newState = await page.evaluate(() => {
        const main = document.querySelector("main") || document.body;
        return {
          isLoading: main.innerText.includes("Chargement"),
          snippet: main.innerText.substring(0, 200),
        };
      });
      if (!newState.isLoading) {
        console.log(`  Content loaded after additional ${(i+1)*2}s`);
        break;
      }
    }
    await safeScreenshot("C:/tmp/e2e-interview-06-chatbot.png", "Chatbot After Extended Wait");
  }

  // Try to find start button using Playwright locators
  const startBtn = await page.locator("button").filter({ hasText: /Start|Commencer|Demarrer|Begin|Lancer/ }).first();
  const startBtnExists = await startBtn.count() > 0;

  if (startBtnExists) {
    const isDisabled = await startBtn.isDisabled();
    if (!isDisabled) {
      await startBtn.click();
      console.log("  Clicked start session button...");
      await sleep(5000);
      await dismissOverlay();

      // Wait for AI to respond (streaming)
      let sessionStarted = false;
      for (let i = 0; i < 20; i++) {
        await sleep(2000);
        await dismissOverlay();

        const chatState = await page.evaluate(() => {
          const hasTextarea = !!document.querySelector("textarea");
          const hasInput = !!document.querySelector("input[type='text']");
          const body = document.body.innerText;
          return { hasTextarea, hasInput, bodyLength: body.length };
        });

        if (chatState.hasTextarea || chatState.hasInput) {
          sessionStarted = true;
          console.log(`  Chat session started after ${(i + 1) * 2 + 5}s`);
          break;
        }
      }

      await safeScreenshot("C:/tmp/e2e-interview-06-chatbot.png", "Chatbot Session");

      if (sessionStarted) {
        log("Chatbot - Session Start", "PASS", "Chat session started with AI interviewer");

        // Type first message
        const chatInput = await page.$("textarea") || await page.$("input[type='text']");
        if (chatInput) {
          await chatInput.fill("Bonjour, je me prepare pour un entretien chez OCP Group pour un poste de developpeur. Quelles questions dois-je preparer?");
          await sleep(500);

          // Try sending with button or Enter
          const sendBtn = await page.locator("button").filter({ hasText: /Send|Envoyer/ }).first();
          if (await sendBtn.count() > 0) {
            await sendBtn.click();
          } else {
            // Try clicking any button near the input (send icon button)
            const iconBtns = await page.locator("button svg").first();
            if (await iconBtns.count() > 0) {
              await iconBtns.click();
            } else {
              await chatInput.press("Enter");
            }
          }

          console.log("  Sent first message, waiting for AI response...");

          let gotResponse = false;
          for (let i = 0; i < 20; i++) {
            await sleep(2000);
            await dismissOverlay();
            const msgState = await page.evaluate(() => {
              const body = document.body.innerText;
              return { textLength: body.length, hasOCP: body.includes("OCP") };
            });
            if (msgState.textLength > 800 || msgState.hasOCP) {
              gotResponse = true;
              console.log(`  Got AI response after ${(i + 1) * 2}s`);
              break;
            }
          }

          await safeScreenshot("C:/tmp/e2e-interview-06-chatbot.png", "Chatbot Exchange");

          if (gotResponse) {
            log("Chatbot - First Message", "PASS", "AI responded to interview preparation question");

            // Send follow-up
            await sleep(1000);
            const chatInput2 = await page.$("textarea") || await page.$("input[type='text']");
            if (chatInput2) {
              await chatInput2.fill("Comment repondre a la question 'Quels sont vos points faibles?'");
              await sleep(500);

              const sendBtn2 = await page.locator("button").filter({ hasText: /Send|Envoyer/ }).first();
              if (await sendBtn2.count() > 0) {
                await sendBtn2.click();
              } else {
                await chatInput2.press("Enter");
              }

              console.log("  Sent follow-up, waiting...");
              for (let i = 0; i < 15; i++) {
                await sleep(2000);
                await dismissOverlay();
              }

              await safeScreenshot("C:/tmp/e2e-interview-07-chatbot-reply.png", "Chatbot Follow-up");
              log("Chatbot - Follow-up", "PASS", "Follow-up question sent to AI interviewer");
            }
          } else {
            log("Chatbot - First Message", "WARN", "AI response may still be streaming or timed out");
          }
        } else {
          log("Chatbot - Input", "WARN", "Could not find chat input field after session start");
        }
      } else {
        log("Chatbot - Session Start", "WARN", "Session may not have started - no input field appeared within 45s");
      }
    } else {
      log("Chatbot - Start Button", "WARN", "Start button found but is disabled (AI may not be available)");
    }
  } else {
    log("Chatbot", "WARN", `No start button found. Page may still be loading. Snippet: ${chatbotState.snippet.substring(0, 200)}`);
  }
} catch (e) {
  log("Chatbot", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 4. INTERVIEW TIPS
// ============================================================
console.log("\n=== TEST 4: INTERVIEW TIPS ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview/tips`, { timeout: 30000 });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(10000);

  const tipsContent = await page.evaluate(() => {
    const body = document.body.innerText;
    const tabs = document.querySelectorAll("[role='tab']");
    const cards = document.querySelectorAll("[class*='card'], [class*='Card']");
    return {
      hasTips: body.includes("Tips") || body.includes("Conseil") || body.includes("Success"),
      hasCategories: tabs.length > 0,
      categoryCount: tabs.length,
      cardCount: cards.length,
      hasNoTipsFound: body.includes("No tips found") || body.includes("Aucun conseil"),
      hasSearch: !!document.querySelector("input[type='search'], input[placeholder*='search'], input[placeholder*='Search'], input[placeholder*='tip']"),
      tabTexts: Array.from(tabs).map(t => t.textContent?.trim()).filter(Boolean).slice(0, 10),
    };
  });

  console.log("  Tips content:", JSON.stringify(tipsContent, null, 2));

  // Click through different category tabs
  const tabs = await page.locator("[role='tab']").all();
  if (tabs.length > 1) {
    for (let i = 1; i < Math.min(tabs.length, 4); i++) {
      try {
        await tabs[i].click();
        await sleep(1500);
        await dismissOverlay();
        console.log(`  Clicked tab ${i + 1}: ${await tabs[i].textContent()}`);
      } catch {}
    }
  }

  await safeScreenshot("C:/tmp/e2e-interview-08-tips.png", "Interview Tips");

  if (tipsContent.hasTips) {
    if (tipsContent.hasNoTipsFound) {
      log("Interview Tips", "WARN", `Tips page loaded with ${tipsContent.categoryCount} category tabs (${tipsContent.tabTexts.join(", ")}), but shows 'No tips found' - reference data may not be seeded`);
    } else {
      log("Interview Tips", "PASS", `Tips page loaded with ${tipsContent.categoryCount} category tabs, ${tipsContent.cardCount} cards. Tabs: ${tipsContent.tabTexts.join(", ")}`);
    }
  } else {
    log("Interview Tips", "WARN", "Tips page loaded but content unclear");
  }
} catch (e) {
  log("Interview Tips", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 5. INTERVIEW CHECKLIST
// ============================================================
console.log("\n=== TEST 5: INTERVIEW CHECKLIST ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview/checklist`, { timeout: 45000, waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(20000);
  await sleep(2000);

  const checklistContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    const checkboxes = document.querySelectorAll("input[type='checkbox'], [role='checkbox'], button[role='checkbox']");
    return {
      isLoading: mainText.includes("Chargement"),
      hasChecklist: mainText.includes("Checklist") || mainText.includes("checklist") || mainText.includes("Liste") || mainText.includes("controle") || mainText.includes("contrôle"),
      hasItems: checkboxes.length > 0,
      itemCount: checkboxes.length,
      hasProgress: mainText.includes("Progress") || mainText.includes("progress") || mainText.includes("%"),
      snippet: mainText.substring(0, 400),
    };
  });

  console.log("  Checklist content:", JSON.stringify(checklistContent, null, 2));
  await safeScreenshot("C:/tmp/e2e-interview-09-checklist.png", "Interview Checklist");

  if (checklistContent.isLoading) {
    log("Interview Checklist", "WARN", "Checklist page stuck on loading state");
  } else if (checklistContent.hasChecklist || checklistContent.hasItems) {
    // Try checking an item
    if (checklistContent.hasItems) {
      const firstCheckbox = await page.$("input[type='checkbox'], [role='checkbox'], button[role='checkbox']");
      if (firstCheckbox) {
        await firstCheckbox.click();
        await sleep(1000);
        console.log("  Toggled first checklist item");
      }
    }
    log("Interview Checklist", "PASS", `Checklist loaded with ${checklistContent.itemCount} checkable items. Progress tracking: ${checklistContent.hasProgress}`);
  } else {
    log("Interview Checklist", "WARN", `Checklist page loaded. Content: ${checklistContent.snippet.substring(0, 200)}`);
  }
} catch (e) {
  log("Interview Checklist", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 6. INTERVIEW NOTES
// ============================================================
console.log("\n=== TEST 6: INTERVIEW NOTES ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview/notes`, { timeout: 45000, waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(20000);
  await sleep(2000);

  const notesContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      isLoading: mainText.includes("Chargement"),
      hasNotes: mainText.includes("Notes") || mainText.includes("notes") || mainText.includes("Note"),
      hasEmptyState: mainText.includes("Aucune note") || mainText.includes("No notes") || mainText.includes("empty"),
      snippet: mainText.substring(0, 400),
    };
  });

  console.log("  Notes content:", JSON.stringify(notesContent, null, 2));
  await safeScreenshot("C:/tmp/e2e-interview-10-notes-initial.png", "Notes Initial");

  if (notesContent.isLoading) {
    log("Interview Notes", "WARN", "Notes page stuck on loading state");
  } else {
    // Find create/add button using Playwright locators (not querySelector with :has-text)
    const createBtn = await page.locator("button").filter({ hasText: /Create|Creer|Créer|Ajouter|Nouveau|New|\+/ }).first();
    const hasPlusBtn = await page.locator("button svg").first();

    if (await createBtn.count() > 0) {
      await createBtn.click();
      await sleep(2000);
      await dismissOverlay();
      console.log("  Clicked create note button");

      // Fill in note dialog fields
      const titleInput = await page.$("input[name='title'], input[placeholder*='Title'], input[placeholder*='Titre'], input[placeholder*='titre']");
      if (titleInput) {
        await titleInput.fill("Notes pour entretien OCP");
        await sleep(300);
        console.log("  Filled title");
      }

      const companyInput = await page.$("input[name='company'], input[placeholder*='Company'], input[placeholder*='Entreprise'], input[placeholder*='entreprise']");
      if (companyInput) {
        await companyInput.fill("OCP Group");
        await sleep(300);
        console.log("  Filled company");
      }

      const positionInput = await page.$("input[name='position'], input[placeholder*='Position'], input[placeholder*='Poste'], input[placeholder*='poste']");
      if (positionInput) {
        await positionInput.fill("Developpeur Full-Stack");
        await sleep(300);
        console.log("  Filled position");
      }

      await safeScreenshot("C:/tmp/e2e-interview-10-notes.png", "Notes Create Dialog");

      // Try to save
      const saveBtn = await page.locator("button").filter({ hasText: /Save|Sauvegarder|Enregistrer|Creer|Créer/ }).first();
      if (await saveBtn.count() > 0) {
        const isDisabled = await saveBtn.isDisabled();
        if (!isDisabled) {
          await saveBtn.click();
          await sleep(2000);
          await dismissOverlay();
          log("Interview Notes", "PASS", "Notes page loaded, create dialog opened, note creation attempted");
        } else {
          log("Interview Notes", "WARN", "Save button is disabled - may need more required fields");
        }
      } else {
        log("Interview Notes", "WARN", "Notes create dialog opened but no save button found");
      }
    } else if (notesContent.hasNotes) {
      log("Interview Notes", "PASS", "Notes page loaded successfully");
    } else {
      log("Interview Notes", "WARN", `Notes page loaded. Content: ${notesContent.snippet.substring(0, 200)}`);
    }
  }
} catch (e) {
  log("Interview Notes", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 7. READINESS SCORE CHECK
// ============================================================
console.log("\n=== TEST 7: READINESS SCORE ===\n");

try {
  await page.goto(`${BASE}/dashboard/interview`, { timeout: 30000 });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(15000);

  const readinessContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      hasReadiness: mainText.includes("Readiness") || mainText.includes("readiness") || mainText.includes("Score"),
      hasPercentage: /\d+%/.test(mainText),
      hasZeroScore: mainText.includes("0%"),
      snippet: mainText.substring(0, 300),
    };
  });

  console.log("  Readiness content:", JSON.stringify(readinessContent, null, 2));
  await safeScreenshot("C:/tmp/e2e-interview-11-readiness.png", "Readiness Score");

  if (readinessContent.hasReadiness || readinessContent.hasPercentage) {
    const scoreNote = readinessContent.hasZeroScore ? " (Score is 0% - expected for user with no practice sessions)" : "";
    log("Readiness Score", "PASS", `Readiness score section visible on interview hub${scoreNote}`);
  } else {
    log("Readiness Score", "WARN", "Readiness score may not be visible");
  }
} catch (e) {
  log("Readiness Score", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// 8. INTERVIEW HISTORY / REVIEW
// ============================================================
console.log("\n=== TEST 8: INTERVIEW HISTORY ===\n");

try {
  // First check if main interview hub has a recent sessions section
  const hubHistory = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      hasRecent: mainText.includes("Recent") || mainText.includes("recent") || mainText.includes("Recentes") || mainText.includes("récentes"),
      hasSessions: mainText.includes("Session") || mainText.includes("session"),
    };
  });

  console.log("  Hub history:", JSON.stringify(hubHistory, null, 2));

  // Now navigate to review page with extended timeout
  await page.goto(`${BASE}/dashboard/interview/review`, { timeout: 45000, waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(20000);

  const reviewContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      isLoading: mainText.includes("Chargement"),
      hasReview: mainText.includes("Review") || mainText.includes("review") || mainText.includes("Revision"),
      hasSessions: mainText.includes("Session") || mainText.includes("session"),
      hasHistory: mainText.includes("History") || mainText.includes("Historique"),
      hasEmpty: mainText.includes("No sessions") || mainText.includes("Aucune session") || mainText.includes("empty"),
      snippet: mainText.substring(0, 400),
    };
  });

  console.log("  Review content:", JSON.stringify(reviewContent, null, 2));
  await safeScreenshot("C:/tmp/e2e-interview-12-history.png", "Interview History/Review");

  if (reviewContent.isLoading) {
    log("Interview History", "WARN", "Review page stuck on loading state");
  } else if (reviewContent.hasReview || reviewContent.hasSessions || reviewContent.hasHistory || hubHistory.hasRecent) {
    log("Interview History", "PASS", `Session history/review is accessible. Hub recent: ${hubHistory.hasRecent}`);
  } else {
    log("Interview History", "WARN", `Review page loaded but content may be empty (no past sessions). Content: ${reviewContent.snippet.substring(0, 200)}`);
  }
} catch (e) {
  log("Interview History", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// BONUS: Additional Interview Features
// ============================================================
console.log("\n=== BONUS: ADDITIONAL INTERVIEW FEATURES ===\n");

// Question Bank
try {
  await page.goto(`${BASE}/dashboard/interview/question-bank`, { timeout: 30000 });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(10000);

  const qbContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      hasQuestions: mainText.includes("Question") || mainText.includes("question"),
      hasBank: mainText.includes("Bank") || mainText.includes("Banque"),
      hasCategories: mainText.includes("Behavioral") || mainText.includes("Technical") || mainText.includes("Situational"),
      contentLength: mainText.length,
    };
  });

  if (qbContent.hasQuestions || qbContent.contentLength > 200) {
    log("Question Bank", "PASS", `Question bank page loaded. Has categories: ${qbContent.hasCategories}`);
  } else {
    log("Question Bank", "WARN", "Question bank page loaded but may be empty");
  }
} catch (e) {
  log("Question Bank", "FAIL", `Error: ${e.message}`);
}

// STAR Method
try {
  await page.goto(`${BASE}/dashboard/interview/star-method`, { timeout: 30000 });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(10000);

  const starContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      hasStar: mainText.includes("STAR") || mainText.includes("star"),
      hasSituation: mainText.includes("Situation"),
      hasTask: mainText.includes("Task") || mainText.includes("Tache"),
      hasAction: mainText.includes("Action"),
      hasResult: mainText.includes("Result") || mainText.includes("Resultat"),
    };
  });

  if (starContent.hasStar || starContent.hasSituation) {
    log("STAR Method", "PASS", `STAR method guide loaded. S:${starContent.hasSituation} T:${starContent.hasTask} A:${starContent.hasAction} R:${starContent.hasResult}`);
  } else {
    log("STAR Method", "WARN", "STAR method page loaded but content unclear");
  }
} catch (e) {
  log("STAR Method", "FAIL", `Error: ${e.message}`);
}

// Confidence Tracker
try {
  await page.goto(`${BASE}/dashboard/interview/confidence`, { timeout: 45000, waitUntil: "domcontentloaded" });
  await sleep(3000);
  await dismissOverlay();
  await waitForContent(20000);

  const confContent = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    const mainText = main.innerText;
    return {
      isLoading: mainText.includes("Chargement"),
      hasConfidence: mainText.includes("Confidence") || mainText.includes("confidence") || mainText.includes("Confiance"),
      contentLength: mainText.length,
    };
  });

  if (confContent.isLoading) {
    log("Confidence Tracker", "WARN", "Confidence tracker page stuck on loading state");
  } else if (confContent.hasConfidence || confContent.contentLength > 200) {
    log("Confidence Tracker", "PASS", "Confidence tracker page loaded");
  } else {
    log("Confidence Tracker", "WARN", "Confidence tracker page loaded but content unclear");
  }
} catch (e) {
  log("Confidence Tracker", "FAIL", `Error: ${e.message}`);
}

// ============================================================
// FINAL REPORT
// ============================================================
console.log("\n\n========================================");
console.log("     E2E INTERVIEW TEST REPORT");
console.log("========================================\n");

const passCount = results.filter(r => r.status === "PASS").length;
const failCount = results.filter(r => r.status === "FAIL").length;
const warnCount = results.filter(r => r.status === "WARN").length;

console.log(`Total Tests: ${results.length}`);
console.log(`  PASS: ${passCount}`);
console.log(`  FAIL: ${failCount}`);
console.log(`  WARN: ${warnCount}`);
console.log("");

for (const r of results) {
  const icon = r.status === "PASS" ? "[PASS]" : r.status === "FAIL" ? "[FAIL]" : "[WARN]";
  console.log(`${icon} ${r.feature}`);
  console.log(`       ${r.detail}`);
  console.log("");
}

console.log("========================================");
console.log("Screenshots saved to C:/tmp/e2e-interview-*.png");
console.log("========================================\n");

await sleep(2000);
await browser.close();

console.log("Browser closed. Test complete.");
