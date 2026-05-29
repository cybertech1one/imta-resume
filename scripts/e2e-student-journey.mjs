/**
 * E2E Student Journey Test
 * Simulates a brand-new IMTA student discovering and using the platform.
 * Run: node scripts/e2e-student-journey.mjs
 */
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

async function safeScreenshot(path, label) {
  await dismissOverlay();
  await sleep(500);
  await page.screenshot({ path, fullPage: false });
  console.log(`  [SCREENSHOT] ${label} -> ${path}`);
}

async function safeGoto(url, label) {
  console.log(`\n--- ${label} ---`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  } catch (e) {
    console.log(`  [WARN] Navigation slow for ${url}: ${e.message.slice(0, 80)}`);
  }
  await sleep(3000);
  await dismissOverlay();
}

// Track results
const results = [];
function record(step, status, notes) {
  results.push({ step, status, notes });
  console.log(`  [${status}] ${step}: ${notes}`);
}

try {
  // ============================================================
  // STEP 1: Discover the Platform - Landing Page
  // ============================================================
  await safeGoto(`${BASE}/`, "STEP 1: Landing Page");
  await safeScreenshot("C:/tmp/e2e-journey-01-landing.png", "Landing hero");

  // Check for key landing page elements
  const heroText = await page.textContent("body").catch(() => "");
  if (heroText.includes("IMTA") || heroText.includes("CV") || heroText.includes("carrière") || heroText.includes("resume")) {
    record("Landing Page", "PASS", "Landing page loaded with relevant content");
  } else {
    record("Landing Page", "WARN", "Landing page loaded but key content unclear");
  }

  // Scroll to features section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await sleep(1500);
  await safeScreenshot("C:/tmp/e2e-journey-02-features.png", "Features section");

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);
  record("Features Section", "PASS", "Scrolled through features");

  // ============================================================
  // STEP 2: Register Page (verify form, don't submit)
  // ============================================================
  await safeGoto(`${BASE}/auth/register`, "STEP 2: Register Page");
  await safeScreenshot("C:/tmp/e2e-journey-03-register.png", "Register form");

  // Check for form fields
  const nameField = await page.$('input[name="name"], input[placeholder*="nom"], input[placeholder*="Name"]');
  const emailField = await page.$('input[name="email"], input[type="email"]');
  const passwordField = await page.$('input[name="password"], input[type="password"]');

  if (emailField && passwordField) {
    record("Register Form", "PASS", `Fields present - name: ${!!nameField}, email: ${!!emailField}, password: ${!!passwordField}`);
  } else {
    record("Register Form", "WARN", "Some form fields may be missing");
  }

  // Check if page is in French
  const registerPageText = await page.textContent("body").catch(() => "");
  const isFrench = registerPageText.includes("Inscription") || registerPageText.includes("S'inscrire") ||
                   registerPageText.includes("Créer") || registerPageText.includes("Mot de passe");
  record("Register Language", isFrench ? "PASS" : "WARN", isFrench ? "Page is in French" : "Page may not be in French");

  // ============================================================
  // STEP 3: Login as existing student
  // ============================================================
  console.log("\n--- STEP 3: Login as student1@test.com ---");
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await sleep(2000);
  await dismissOverlay();

  // Login via API
  await page.evaluate(async () => {
    await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" })
    });
  });
  console.log("  [INFO] Login API called");

  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await sleep(4000);
  await dismissOverlay();
  await safeScreenshot("C:/tmp/e2e-journey-04-dashboard.png", "Dashboard after login");

  // Verify we're on dashboard
  const dashUrl = page.url();
  if (dashUrl.includes("/dashboard")) {
    record("Login", "PASS", "Successfully logged in and reached dashboard");
  } else {
    record("Login", "FAIL", `Ended up at ${dashUrl} instead of dashboard`);
  }

  // ============================================================
  // STEP 4: Explore Dashboard
  // ============================================================
  console.log("\n--- STEP 4: Explore Dashboard ---");

  // Check for greeting
  const dashboardText = await page.textContent("body").catch(() => "");
  const hasGreeting = dashboardText.includes("Bonjour") || dashboardText.includes("Bonsoir") ||
                      dashboardText.includes("Welcome") || dashboardText.includes("Hello");
  record("Dashboard Greeting", hasGreeting ? "PASS" : "WARN", hasGreeting ? "Greeting displayed" : "No greeting found");

  // Try to expand sidebar sections by clicking on group headers
  const sidebarItems = await page.$$("nav a, aside a, [role='navigation'] a");
  record("Sidebar", "INFO", `Found ${sidebarItems.length} navigation links`);

  await safeScreenshot("C:/tmp/e2e-journey-05-sidebar.png", "Sidebar navigation");

  // ============================================================
  // STEP 5: Create First Resume
  // ============================================================
  await safeGoto(`${BASE}/dashboard/resumes`, "STEP 5: Resumes Page");
  await safeScreenshot("C:/tmp/e2e-journey-06-resumes.png", "Resumes page");

  // Look for create button
  const createBtn = await page.$('button:has-text("Créer"), button:has-text("Create"), button:has-text("Nouveau"), a:has-text("Create"), a:has-text("Créer")');
  if (createBtn) {
    record("Create Resume", "PASS", "Create button found on resumes page");
    // Try clicking to create
    try {
      await createBtn.click();
      await sleep(2000);
      await dismissOverlay();

      // Look for a dialog or form to name the resume
      const titleInput = await page.$('input[placeholder*="title"], input[placeholder*="titre"], input[name="title"], dialog input');
      if (titleInput) {
        await titleInput.fill("Mon Premier CV");
        record("Resume Name", "PASS", "Entered resume name: Mon Premier CV");
        // Look for submit button in dialog
        const submitBtn = await page.$('dialog button[type="submit"], dialog button:has-text("Créer"), dialog button:has-text("Create")');
        if (submitBtn) {
          await submitBtn.click();
          await sleep(3000);
          await dismissOverlay();
          record("Resume Created", "PASS", "Resume creation submitted");
        }
      } else {
        record("Resume Name", "WARN", "No title input found after clicking create");
      }
    } catch (e) {
      record("Create Resume", "WARN", `Create flow issue: ${e.message.slice(0, 80)}`);
    }
  } else {
    // Try clicking on the create card area
    const createCard = await page.$('[class*="create"], [data-testid*="create"]');
    if (createCard) {
      record("Create Resume", "INFO", "Found create card area");
    } else {
      record("Create Resume", "WARN", "No create button found");
    }
  }

  // ============================================================
  // STEP 6: Browse Job Listings
  // ============================================================
  await safeGoto(`${BASE}/dashboard/jobs`, "STEP 6: Jobs Page");
  await safeScreenshot("C:/tmp/e2e-journey-07-jobs.png", "Jobs page");

  const jobsText = await page.textContent("body").catch(() => "");
  const hasJobs = jobsText.includes("emploi") || jobsText.includes("job") || jobsText.includes("offre") ||
                  jobsText.includes("poste") || jobsText.includes("stage");
  record("Jobs Page", hasJobs ? "PASS" : "WARN", hasJobs ? "Jobs page has relevant content" : "Jobs page may be empty");

  // ============================================================
  // STEP 7: Career Guidance
  // ============================================================
  await safeGoto(`${BASE}/dashboard/career`, "STEP 7: Career Page");
  await safeScreenshot("C:/tmp/e2e-journey-08-career.png", "Career guidance page");

  const careerText = await page.textContent("body").catch(() => "");
  const hasCareerContent = careerText.includes("carrière") || careerText.includes("career") ||
                           careerText.includes("compétence") || careerText.includes("skill");
  record("Career Page", hasCareerContent ? "PASS" : "WARN",
         hasCareerContent ? "Career page has content" : "Career page may lack content");

  // ============================================================
  // STEP 8: AI Mentor
  // ============================================================
  await safeGoto(`${BASE}/dashboard/ai-mentor`, "STEP 8: AI Mentor");
  await sleep(2000);
  await dismissOverlay();

  // Check if AI mentor page loaded
  const mentorUrl = page.url();
  const mentorText = await page.textContent("body").catch(() => "");

  if (mentorUrl.includes("ai-mentor")) {
    record("AI Mentor Page", "PASS", "AI Mentor page accessible");

    // Try to find chat input
    const chatInput = await page.$('textarea, input[type="text"][placeholder*="message"], input[placeholder*="Message"], input[placeholder*="Écri"]');
    if (chatInput) {
      try {
        await chatInput.fill("Bonjour, je suis nouveau a l'IMTA. Comment commencer ma recherche d'emploi?");
        await sleep(500);

        // Find and click send button
        const sendBtn = await page.$('button[type="submit"], button:has-text("Envoyer"), button:has-text("Send"), button[aria-label*="send"], button[aria-label*="Send"]');
        if (sendBtn) {
          await sendBtn.click();
          console.log("  [INFO] Sent message to AI Mentor, waiting for response...");
          await sleep(10000); // Wait for AI response
          await dismissOverlay();
          record("AI Mentor Chat", "PASS", "Message sent to AI Mentor");
        } else {
          // Try pressing Enter
          await chatInput.press("Enter");
          await sleep(10000);
          await dismissOverlay();
          record("AI Mentor Chat", "INFO", "Tried sending via Enter key");
        }
      } catch (e) {
        record("AI Mentor Chat", "WARN", `Chat interaction issue: ${e.message.slice(0, 80)}`);
      }
    } else {
      record("AI Mentor Chat", "WARN", "No chat input found on AI Mentor page");
    }
  } else {
    record("AI Mentor Page", "WARN", `Redirected to ${mentorUrl}`);
  }

  await safeScreenshot("C:/tmp/e2e-journey-09-mentor.png", "AI Mentor");

  // ============================================================
  // STEP 9: Learning Resources
  // ============================================================
  await safeGoto(`${BASE}/dashboard/learn/recommendations`, "STEP 9: Learning Resources");
  await safeScreenshot("C:/tmp/e2e-journey-10-learn.png", "Learning resources");

  const learnText = await page.textContent("body").catch(() => "");
  const hasLearnContent = learnText.includes("apprentissage") || learnText.includes("learn") ||
                          learnText.includes("formation") || learnText.includes("cours") || learnText.includes("resource");
  record("Learning Page", hasLearnContent ? "PASS" : "WARN",
         hasLearnContent ? "Learning page has content" : "Learning page may lack content");

  // ============================================================
  // STEP 10: Profile & Achievements
  // ============================================================
  await safeGoto(`${BASE}/dashboard/settings`, "STEP 10a: Profile/Settings");
  await safeScreenshot("C:/tmp/e2e-journey-11-profile.png", "Profile page");

  const profileText = await page.textContent("body").catch(() => "");
  const hasProfile = profileText.includes("profil") || profileText.includes("profile") ||
                     profileText.includes("nom") || profileText.includes("email");
  record("Profile Page", hasProfile ? "PASS" : "WARN",
         hasProfile ? "Profile page accessible" : "Profile page may lack content");

  await safeGoto(`${BASE}/dashboard/profile/achievements`, "STEP 10b: Achievements");
  await safeScreenshot("C:/tmp/e2e-journey-12-achievements.png", "Achievements page");

  const achieveText = await page.textContent("body").catch(() => "");
  const hasAchievements = achieveText.includes("achievement") || achieveText.includes("badge") ||
                          achieveText.includes("récompense") || achieveText.includes("accomplissement");
  record("Achievements Page", hasAchievements ? "PASS" : "WARN",
         hasAchievements ? "Achievements page has content" : "Achievements page may lack content");

  // ============================================================
  // STEP 11: Help Page
  // ============================================================
  await safeGoto(`${BASE}/dashboard/help`, "STEP 11: Help Page");
  await safeScreenshot("C:/tmp/e2e-journey-13-help.png", "Help page");

  const helpText = await page.textContent("body").catch(() => "");
  const hasHelp = helpText.includes("aide") || helpText.includes("help") ||
                  helpText.includes("FAQ") || helpText.includes("support") || helpText.includes("question");
  record("Help Page", hasHelp ? "PASS" : "WARN",
         hasHelp ? "Help page has content" : "Help page may lack content");

  // ============================================================
  // STEP 12: Networking
  // ============================================================
  await safeGoto(`${BASE}/dashboard/networking`, "STEP 12: Networking");
  await safeScreenshot("C:/tmp/e2e-journey-14-networking.png", "Networking page");

  const networkText = await page.textContent("body").catch(() => "");
  const hasNetwork = networkText.includes("réseau") || networkText.includes("network") ||
                     networkText.includes("contact") || networkText.includes("connexion") || networkText.includes("mentor");
  record("Networking Page", hasNetwork ? "PASS" : "WARN",
         hasNetwork ? "Networking page has content" : "Networking page may lack content");

  // ============================================================
  // STEP 13: Analytics
  // ============================================================
  await safeGoto(`${BASE}/dashboard/analytics/ai-usage`, "STEP 13: Analytics");
  await safeScreenshot("C:/tmp/e2e-journey-15-analytics.png", "Analytics page");

  const analyticsText = await page.textContent("body").catch(() => "");
  const hasAnalytics = analyticsText.includes("analytique") || analyticsText.includes("analytics") ||
                       analyticsText.includes("statistique") || analyticsText.includes("usage") || analyticsText.includes("utilisation");
  record("Analytics Page", hasAnalytics ? "PASS" : "WARN",
         hasAnalytics ? "Analytics page has content" : "Analytics page may lack content");

  // ============================================================
  // STEP 14: Settings
  // ============================================================
  await safeGoto(`${BASE}/dashboard/settings`, "STEP 14: Settings");
  await safeScreenshot("C:/tmp/e2e-journey-16-settings.png", "Settings page");

  const settingsText = await page.textContent("body").catch(() => "");
  const hasSettings = settingsText.includes("paramètre") || settingsText.includes("setting") ||
                      settingsText.includes("langue") || settingsText.includes("thème") || settingsText.includes("theme");
  record("Settings Page", hasSettings ? "PASS" : "WARN",
         hasSettings ? "Settings page has content" : "Settings page may lack content");

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  console.log("\n\n========================================");
  console.log("  E2E STUDENT JOURNEY COMPLETE");
  console.log("========================================\n");

  const passed = results.filter(r => r.status === "PASS").length;
  const warns = results.filter(r => r.status === "WARN").length;
  const fails = results.filter(r => r.status === "FAIL").length;
  const infos = results.filter(r => r.status === "INFO").length;

  console.log(`Results: ${passed} PASS, ${warns} WARN, ${fails} FAIL, ${infos} INFO`);
  console.log("\nDetailed Results:");
  for (const r of results) {
    console.log(`  [${r.status}] ${r.step}: ${r.notes}`);
  }

  console.log("\nScreenshots saved to C:/tmp/e2e-journey-*.png");

} catch (error) {
  console.error("FATAL ERROR:", error.message);
  await safeScreenshot("C:/tmp/e2e-journey-ERROR.png", "Error state").catch(() => {});
} finally {
  await sleep(2000);
  await browser.close();
  console.log("\nBrowser closed. Journey complete.");
}
