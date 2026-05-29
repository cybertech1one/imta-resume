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
  await page.screenshot({ path, fullPage: false });
  console.log(`[SCREENSHOT] ${label} -> ${path}`);
}

async function navigateAndCapture(url, screenshotPath, label) {
  console.log(`\n--- ${label} ---`);
  console.log(`Navigating to ${url}`);
  try {
    await page.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await sleep(3000);
    await dismissOverlay();

    // Check for error pages or redirects
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Check page content
    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || "");
    const hasError = bodyText.includes("404") || bodyText.includes("Not Found") || bodyText.includes("Error");
    const isEmpty = bodyText.trim().length < 50;

    if (hasError) {
      console.log(`[WARN] Page may have error content`);
    }
    if (isEmpty) {
      console.log(`[WARN] Page appears mostly empty`);
    }

    // Log first 300 chars of visible text
    console.log(`Page text preview: ${bodyText.substring(0, 300).replace(/\n/g, " | ")}`);

    await safeScreenshot(screenshotPath, label);
    return { success: true, url: currentUrl, hasError, isEmpty, bodyText };
  } catch (err) {
    console.log(`[ERROR] ${err.message}`);
    try {
      await safeScreenshot(screenshotPath, `${label} (error state)`);
    } catch {}
    return { success: false, error: err.message };
  }
}

// ==================== LOGIN ====================
console.log("=== LOGGING IN AS STUDENT ===");
await page.goto(`${BASE}/auth/login`);
await sleep(2000);
await dismissOverlay();

await page.evaluate(async () => {
  await fetch("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "student1@test.com", password: "TestAccount123!" }),
  });
});

await page.goto(`${BASE}/dashboard`);
await sleep(3000);
await dismissOverlay();
console.log("Login complete. Current URL:", page.url());

// ==================== NETWORKING SECTION ====================
console.log("\n\n========== NETWORKING SECTION ==========\n");

// 1. Networking hub
const net01 = await navigateAndCapture("/dashboard/networking", "C:/tmp/e2e-net-01.png", "1. Networking Hub");

// 2. Contacts
const net02 = await navigateAndCapture("/dashboard/networking/contacts", "C:/tmp/e2e-net-02.png", "2. Networking Contacts");

// Try adding a contact if there's a button
if (net02.success) {
  try {
    const addBtn = await page.$('button:has-text("Add"), button:has-text("Ajouter"), button:has-text("New"), button:has-text("Nouveau"), [aria-label*="add"], [aria-label*="Add"]');
    if (addBtn) {
      console.log("[ACTION] Found add contact button, clicking...");
      await addBtn.click();
      await sleep(2000);
      await dismissOverlay();
      await safeScreenshot("C:/tmp/e2e-net-02b.png", "2b. Add Contact Dialog");

      // Try filling form if dialog appeared
      const nameInput = await page.$('input[name="name"], input[placeholder*="name"], input[placeholder*="nom"]');
      if (nameInput) {
        await nameInput.fill("Test Contact");
        console.log("[ACTION] Filled contact name");
      }

      // Close dialog if open
      const closeBtn = await page.$('button:has-text("Cancel"), button:has-text("Annuler"), button:has-text("Close"), [aria-label="Close"]');
      if (closeBtn) await closeBtn.click();
      await sleep(500);
    } else {
      console.log("[INFO] No add contact button found");
    }
  } catch (e) {
    console.log(`[WARN] Add contact interaction: ${e.message}`);
  }
}

// 3. Mentors
const net03 = await navigateAndCapture("/dashboard/networking/mentors", "C:/tmp/e2e-net-03.png", "3. Mentorship");

// 4. Events
const net04 = await navigateAndCapture("/dashboard/networking/events", "C:/tmp/e2e-net-04.png", "4. Networking Events");

// ==================== LINKEDIN SECTION ====================
console.log("\n\n========== LINKEDIN SECTION ==========\n");

// 5. LinkedIn hub
const net05 = await navigateAndCapture("/dashboard/linkedin", "C:/tmp/e2e-net-05.png", "5. LinkedIn Hub");

// 6. LinkedIn content creator
const net06 = await navigateAndCapture("/dashboard/linkedin/content", "C:/tmp/e2e-net-06.png", "6. LinkedIn Content Creator");

// Try generating a LinkedIn post
if (net06.success) {
  try {
    // Look for textarea or input to write a post topic
    const topicInput = await page.$('textarea, input[type="text"]:not([type="hidden"])');
    if (topicInput) {
      console.log("[ACTION] Found input field, typing LinkedIn post topic...");
      await topicInput.fill("Excited to share my experience as a software engineering student at IMTA Morocco. Key learnings from my latest internship project.");
      await sleep(1000);

      // Look for generate/submit button
      const generateBtn = await page.$('button:has-text("Generate"), button:has-text("Generer"), button:has-text("Create"), button:has-text("Submit"), button[type="submit"]');
      if (generateBtn) {
        console.log("[ACTION] Clicking generate button...");
        await generateBtn.click();
        await sleep(5000); // Wait for AI generation
        await dismissOverlay();
      }
    } else {
      console.log("[INFO] No input field found for LinkedIn content");
    }
    await safeScreenshot("C:/tmp/e2e-net-06.png", "6. LinkedIn Content (after interaction)");
  } catch (e) {
    console.log(`[WARN] LinkedIn content interaction: ${e.message}`);
  }
}

// 7. LinkedIn profile optimizer
const net07 = await navigateAndCapture("/dashboard/linkedin/profile", "C:/tmp/e2e-net-07.png", "7. LinkedIn Profile Optimizer");

// 8. LinkedIn messages
const net08 = await navigateAndCapture("/dashboard/linkedin/messages", "C:/tmp/e2e-net-08.png", "8. LinkedIn Message Templates");

// ==================== TOOLS SECTION ====================
console.log("\n\n========== TOOLS SECTION ==========\n");

// 9. Tools hub
const net09 = await navigateAndCapture("/dashboard/tools", "C:/tmp/e2e-net-09.png", "9. Tools Hub");

// 10. ATS Checker
const net10 = await navigateAndCapture("/dashboard/tools/ats-checker", "C:/tmp/e2e-net-10.png", "10. ATS Resume Checker");

// Try checking a resume if the feature exists
if (net10.success && !net10.hasError) {
  try {
    // Look for resume selection or file upload
    const selectBtn = await page.$('button:has-text("Select"), button:has-text("Choose"), button:has-text("Check"), select');
    if (selectBtn) {
      console.log("[ACTION] Found ATS checker interaction element");
      await selectBtn.click();
      await sleep(2000);
      await dismissOverlay();
      await safeScreenshot("C:/tmp/e2e-net-10b.png", "10b. ATS Checker Interaction");
    }
  } catch (e) {
    console.log(`[WARN] ATS checker interaction: ${e.message}`);
  }
}

// 11. Cover letter generator
const net11 = await navigateAndCapture("/dashboard/tools/cover-letter", "C:/tmp/e2e-net-11.png", "11. Cover Letter Generator");

// 12. Thank you letter
const net12 = await navigateAndCapture("/dashboard/tools/thank-you", "C:/tmp/e2e-net-12.png", "12. Thank You Letter");

// 13. Salary research
const net13 = await navigateAndCapture("/dashboard/tools/salary", "C:/tmp/e2e-net-13.png", "13. Salary Research");

// 14. Resume gallery
const net14 = await navigateAndCapture("/dashboard/tools/resume-gallery", "C:/tmp/e2e-net-14.png", "14. Resume Gallery");

// ==================== SUMMARY ====================
console.log("\n\n========== TEST SUMMARY ==========\n");

const results = [
  { num: 1, label: "Networking Hub", result: net01 },
  { num: 2, label: "Contacts", result: net02 },
  { num: 3, label: "Mentors", result: net03 },
  { num: 4, label: "Events", result: net04 },
  { num: 5, label: "LinkedIn Hub", result: net05 },
  { num: 6, label: "LinkedIn Content", result: net06 },
  { num: 7, label: "LinkedIn Profile", result: net07 },
  { num: 8, label: "LinkedIn Messages", result: net08 },
  { num: 9, label: "Tools Hub", result: net09 },
  { num: 10, label: "ATS Checker", result: net10 },
  { num: 11, label: "Cover Letter", result: net11 },
  { num: 12, label: "Thank You Letter", result: net12 },
  { num: 13, label: "Salary Research", result: net13 },
  { num: 14, label: "Resume Gallery", result: net14 },
];

for (const r of results) {
  let status = "FAIL";
  if (r.result.success) {
    if (r.result.hasError) status = "WARN";
    else if (r.result.isEmpty) status = "WARN (empty)";
    else status = "PASS";
  }
  console.log(`[${status.padEnd(12)}] ${r.num.toString().padStart(2)}. ${r.label} — ${r.result.url || r.result.error || "unknown"}`);
}

console.log("\n=== DONE ===");
await sleep(2000);
await browser.close();
