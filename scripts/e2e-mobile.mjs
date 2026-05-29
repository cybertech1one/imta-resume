// E2E Mobile/Tablet/Desktop Responsiveness Test
// Tests 3 viewports: iPhone 14 (390x844), iPad (768x1024), Desktop (1920x1080)

import { chromium } from "playwright";
import { existsSync, mkdirSync } from "fs";

const BASE = "http://localhost:3040";
const STUDENT_EMAIL = "student1@test.com";
const STUDENT_PASS = "TestAccount123!";
const ADMIN_EMAIL = "admin@test.com";
const ADMIN_PASS = "TestAccount123!";

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`); }

const results = [];
function record(id, viewport, page, status, details) {
  results.push({ id, viewport, page, status, details });
  const icon = status === "PASS" ? "PASS" : status === "FAIL" ? "FAIL" : "WARN";
  log(`[${icon}] #${id} [${viewport}] ${page}: ${details}`);
}

if (!existsSync("C:/tmp")) mkdirSync("C:/tmp", { recursive: true });

async function dismissOverlay(p) {
  try {
    await p.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function screenshot(p, num, label) {
  const filename = `e2e-mobile-${String(num).padStart(2, "0")}.png`;
  const filepath = `C:/tmp/${filename}`;
  await dismissOverlay(p);
  await p.screenshot({ path: filepath, fullPage: false });
  log(`Screenshot #${num}: ${filepath} (${label})`);
  return filepath;
}

async function checkHorizontalOverflow(p) {
  return await p.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

async function checkSmallButtons(p) {
  return await p.evaluate(() => {
    const buttons = document.querySelectorAll("button, a[role='button'], [role='button']");
    const small = [];
    for (const btn of buttons) {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const text = btn.textContent?.trim().slice(0, 30) || btn.getAttribute("aria-label") || "unnamed";
        small.push(`${text} (${Math.round(rect.width)}x${Math.round(rect.height)})`);
      }
    }
    return small.slice(0, 5); // top 5
  });
}

async function loginViaAPI(context, email, password) {
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "domcontentloaded" });

  // Use API-based login via page context to get cookies set properly
  const loginResult = await page.evaluate(async ({ email, password }) => {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    return { status: res.status, ok: res.ok };
  }, { email, password });

  log(`Login ${email}: ${loginResult.ok ? "OK" : "Failed"} (${loginResult.status})`);
  await page.close();
  return loginResult.ok;
}

async function loginViaUI(page, email, password) {
  // Navigate to login page and fill form
  try {
    await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch {
    log(`Login page slow, trying load state...`);
    try { await page.waitForLoadState("load", { timeout: 15000 }); } catch {}
  }
  await sleep(3000);
  await dismissOverlay(page);

  // Try API login within this page context
  const loginResult = await page.evaluate(async ({ email, password }) => {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    return { status: res.status, ok: res.ok };
  }, { email, password });

  log(`Login (via page context) ${email}: ${loginResult.ok ? "OK" : "Failed"} (${loginResult.status})`);
  return loginResult.ok;
}

async function navigateAndWait(page, path, timeout = 30000) {
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout });
  } catch (e) {
    log(`Navigation to ${path} slow, waiting for load...`);
    try {
      await page.waitForLoadState("load", { timeout: 15000 });
    } catch {
      log(`Page ${path} loaded partially, continuing...`);
    }
  }
  await sleep(3000);
  await dismissOverlay(page);
}

// ===== MAIN TEST =====
async function run() {
  log("Launching browser...");
  const browser = await chromium.launch({ headless: false, slowMo: 80 });

  // ==========================================
  // MOBILE TESTS - iPhone 14 (390 x 844)
  // ==========================================
  log("\n===== MOBILE VIEWPORT (390x844 - iPhone 14) =====\n");

  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    locale: "fr-FR",
  });
  const mobile = await mobileCtx.newPage();

  // Test 1: Landing page
  log("Test 1: Landing page (mobile)");
  await navigateAndWait(mobile, "/");
  const heroVisible = await mobile.evaluate(() => {
    const h1 = document.querySelector("h1");
    if (!h1) return { found: false };
    const rect = h1.getBoundingClientRect();
    const style = window.getComputedStyle(h1);
    return {
      found: true,
      text: h1.textContent?.trim().slice(0, 60),
      fontSize: style.fontSize,
      visible: rect.height > 0 && rect.top < window.innerHeight,
      overflow: rect.width > window.innerWidth,
    };
  });
  await screenshot(mobile, 1, "Landing page mobile");
  const landingOverflow = await checkHorizontalOverflow(mobile);
  if (heroVisible.found && heroVisible.visible && !heroVisible.overflow && !landingOverflow) {
    record(1, "mobile", "Landing", "PASS", `Hero visible: "${heroVisible.text}" (${heroVisible.fontSize}), no overflow`);
  } else if (!heroVisible.found) {
    record(1, "mobile", "Landing", "WARN", "No h1 found on landing page");
  } else {
    record(1, "mobile", "Landing", landingOverflow ? "FAIL" : "WARN",
      `Hero: visible=${heroVisible.visible}, overflow=${heroVisible.overflow || landingOverflow}, fontSize=${heroVisible.fontSize}`);
  }

  // Test 2: Login page
  log("Test 2: Login page (mobile)");
  await navigateAndWait(mobile, "/auth/login");
  await screenshot(mobile, 2, "Login page mobile");
  const loginFormCheck = await mobile.evaluate(() => {
    const form = document.querySelector("form");
    const inputs = document.querySelectorAll("input[type='email'], input[type='password'], input[type='text']");
    const buttons = document.querySelectorAll("button[type='submit'], button");
    let buttonFits = true;
    let inputsFit = true;
    for (const inp of inputs) {
      const r = inp.getBoundingClientRect();
      if (r.width > window.innerWidth) inputsFit = false;
    }
    for (const btn of buttons) {
      const r = btn.getBoundingClientRect();
      if (r.width > 0 && r.right > window.innerWidth) buttonFits = false;
    }
    return {
      hasForm: !!form,
      inputCount: inputs.length,
      buttonCount: buttons.length,
      inputsFit,
      buttonFits,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  if (loginFormCheck.hasForm && loginFormCheck.inputsFit && loginFormCheck.buttonFits && !loginFormCheck.overflow) {
    record(2, "mobile", "Login", "PASS", `Form fits: ${loginFormCheck.inputCount} inputs, ${loginFormCheck.buttonCount} buttons`);
  } else {
    record(2, "mobile", "Login", loginFormCheck.overflow ? "FAIL" : "WARN",
      `Form: hasForm=${loginFormCheck.hasForm}, inputsFit=${loginFormCheck.inputsFit}, buttonFits=${loginFormCheck.buttonFits}, overflow=${loginFormCheck.overflow}`);
  }

  // Login as student for protected pages
  log("Logging in as student...");
  await loginViaUI(mobile, STUDENT_EMAIL, STUDENT_PASS);

  // Test 3: Dashboard
  log("Test 3: Dashboard (mobile)");
  await navigateAndWait(mobile, "/dashboard");
  await screenshot(mobile, 3, "Dashboard mobile");
  const dashboardMobile = await mobile.evaluate(() => {
    // Check for hamburger/menu button
    const hamburger = document.querySelector("[data-sidebar='trigger']") ||
      document.querySelector("button[aria-label*='menu']") ||
      document.querySelector("button[aria-label*='Menu']") ||
      document.querySelector("button svg");
    // Check sidebar visibility
    const sidebar = document.querySelector("[data-sidebar='sidebar']") ||
      document.querySelector("aside") ||
      document.querySelector("nav[role='navigation']");
    const sidebarVisible = sidebar ? window.getComputedStyle(sidebar).display !== "none" : false;
    const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
    const sidebarOnScreen = sidebarRect ? (sidebarRect.left >= 0 && sidebarRect.right <= window.innerWidth + 5) : false;

    return {
      hasHamburger: !!hamburger,
      sidebarVisible,
      sidebarOnScreen,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  if (dashboardMobile.hasHamburger || !dashboardMobile.sidebarOnScreen) {
    record(3, "mobile", "Dashboard", "PASS",
      `Hamburger: ${dashboardMobile.hasHamburger}, sidebar on screen: ${dashboardMobile.sidebarOnScreen}, overflow: ${dashboardMobile.overflow}`);
  } else {
    record(3, "mobile", "Dashboard", "WARN",
      `Sidebar may be visible on mobile. hamburger=${dashboardMobile.hasHamburger}, sidebarOnScreen=${dashboardMobile.sidebarOnScreen}`);
  }

  // Test 4: Resumes list
  log("Test 4: Resumes list (mobile)");
  await navigateAndWait(mobile, "/dashboard/resumes");
  await screenshot(mobile, 4, "Resumes list mobile");
  const resumesMobile = await mobile.evaluate(() => {
    const cards = document.querySelectorAll("[class*='card'], [class*='Card'], article");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    // Check if cards are stacking (all have similar left positions)
    const lefts = new Set();
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (r.width > 0) lefts.add(Math.round(r.left / 10) * 10);
    }
    return { cardCount: cards.length, overflow, columnsApprox: lefts.size };
  });
  if (!resumesMobile.overflow) {
    record(4, "mobile", "Resumes", "PASS",
      `${resumesMobile.cardCount} cards, ~${resumesMobile.columnsApprox} column(s), no overflow`);
  } else {
    record(4, "mobile", "Resumes", "FAIL", `Horizontal overflow detected, ${resumesMobile.cardCount} cards`);
  }

  // Test 5: Career page
  log("Test 5: Career page (mobile)");
  await navigateAndWait(mobile, "/dashboard/career");
  await screenshot(mobile, 5, "Career page mobile");
  const careerOverflow = await checkHorizontalOverflow(mobile);
  const careerSmallBtns = await checkSmallButtons(mobile);
  if (!careerOverflow) {
    record(5, "mobile", "Career", "PASS", `No overflow.${careerSmallBtns.length > 0 ? ` Small buttons: ${careerSmallBtns.join(", ")}` : ""}`);
  } else {
    record(5, "mobile", "Career", "FAIL", `Horizontal overflow. Small buttons: ${careerSmallBtns.join(", ")}`);
  }

  // Test 6: Interview page
  log("Test 6: Interview page (mobile)");
  await navigateAndWait(mobile, "/dashboard/interview");
  await screenshot(mobile, 6, "Interview page mobile");
  const interviewMobile = await mobile.evaluate(() => {
    const cards = document.querySelectorAll("[class*='card'], [class*='Card']");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    // Check text readability - look for truncated text
    const truncated = [];
    for (const c of cards) {
      const style = window.getComputedStyle(c);
      if (style.overflow === "hidden" || style.textOverflow === "ellipsis") {
        truncated.push(c.textContent?.trim().slice(0, 20));
      }
    }
    return { cardCount: cards.length, overflow, truncatedCount: truncated.length };
  });
  if (!interviewMobile.overflow) {
    record(6, "mobile", "Interview", "PASS", `${interviewMobile.cardCount} cards readable, no overflow`);
  } else {
    record(6, "mobile", "Interview", "FAIL", `Overflow detected, ${interviewMobile.cardCount} cards`);
  }

  // Test 7: Settings page
  log("Test 7: Settings page (mobile)");
  await navigateAndWait(mobile, "/dashboard/settings");
  await screenshot(mobile, 7, "Settings page mobile");
  const settingsMobile = await mobile.evaluate(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    let allFit = true;
    for (const inp of inputs) {
      const r = inp.getBoundingClientRect();
      if (r.width > 0 && r.right > window.innerWidth + 2) {
        allFit = false;
      }
    }
    return { inputCount: inputs.length, overflow, allFit };
  });
  if (!settingsMobile.overflow && settingsMobile.allFit) {
    record(7, "mobile", "Settings", "PASS", `${settingsMobile.inputCount} form inputs fit, no overflow`);
  } else {
    record(7, "mobile", "Settings", settingsMobile.overflow ? "FAIL" : "WARN",
      `overflow=${settingsMobile.overflow}, allFit=${settingsMobile.allFit}, inputs=${settingsMobile.inputCount}`);
  }

  await mobile.close();
  await mobileCtx.close();

  // ==========================================
  // TABLET TESTS - iPad (768 x 1024)
  // ==========================================
  log("\n===== TABLET VIEWPORT (768x1024 - iPad) =====\n");

  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    locale: "fr-FR",
  });
  const tablet = await tabletCtx.newPage();

  // Login as student
  await loginViaUI(tablet, STUDENT_EMAIL, STUDENT_PASS);

  // Test 8: Dashboard (tablet)
  log("Test 8: Dashboard (tablet)");
  await navigateAndWait(tablet, "/dashboard");
  await screenshot(tablet, 8, "Dashboard tablet");
  const dashTablet = await tablet.evaluate(() => {
    const sidebar = document.querySelector("[data-sidebar='sidebar']") ||
      document.querySelector("aside") ||
      document.querySelector("nav[role='navigation']");
    const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
    const sidebarVisible = sidebarRect ? (sidebarRect.width > 50 && sidebarRect.left >= -5) : false;
    return {
      sidebarVisible,
      sidebarWidth: sidebarRect ? Math.round(sidebarRect.width) : 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  record(8, "tablet", "Dashboard", !dashTablet.overflow ? "PASS" : "WARN",
    `Sidebar visible=${dashTablet.sidebarVisible} (${dashTablet.sidebarWidth}px), overflow=${dashTablet.overflow}`);

  // Test 9: Resume builder (tablet) — need a resume ID
  log("Test 9: Resume builder (tablet)");
  // First get a resume ID
  const resumeId = await tablet.evaluate(async () => {
    try {
      const res = await fetch("/api/rpc/resume/findAll", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        // ORPC wraps in {json: [...]}
        const resumes = data?.json || data;
        if (Array.isArray(resumes) && resumes.length > 0) {
          return resumes[0].id;
        }
      }
    } catch {}
    return null;
  });

  if (resumeId) {
    await navigateAndWait(tablet, `/builder/${resumeId}`);
    await sleep(2000);
    await screenshot(tablet, 9, "Resume builder tablet");
    const builderTablet = await tablet.evaluate(() => {
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      // Check for split layout (sidebar + preview)
      const panels = document.querySelectorAll("[class*='panel'], [class*='Panel'], [class*='sidebar'], [class*='preview']");
      return {
        overflow,
        panelCount: panels.length,
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });
    record(9, "tablet", "Builder", !builderTablet.overflow ? "PASS" : "WARN",
      `Split layout panels: ${builderTablet.panelCount}, overflow: ${builderTablet.overflow}, body=${builderTablet.bodyWidth}px vs vp=${builderTablet.viewportWidth}px`);
  } else {
    await screenshot(tablet, 9, "Resume builder tablet - no resume found");
    record(9, "tablet", "Builder", "WARN", "No resume found to test builder layout");
  }

  // Test 10: Career page (tablet)
  log("Test 10: Career page (tablet)");
  await navigateAndWait(tablet, "/dashboard/career");
  await screenshot(tablet, 10, "Career page tablet");
  const careerTablet = await checkHorizontalOverflow(tablet);
  record(10, "tablet", "Career", !careerTablet ? "PASS" : "FAIL",
    `Overflow: ${careerTablet}`);

  // Test 11: Admin page (login as admin)
  log("Test 11: Admin page (tablet)");
  await tablet.close();
  await tabletCtx.close();

  const adminTabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    locale: "fr-FR",
  });
  const adminTablet = await adminTabletCtx.newPage();
  await loginViaUI(adminTablet, ADMIN_EMAIL, ADMIN_PASS);
  await navigateAndWait(adminTablet, "/dashboard/admin");
  await screenshot(adminTablet, 11, "Admin page tablet");
  const adminCheck = await adminTablet.evaluate(() => {
    const tables = document.querySelectorAll("table");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    let tableFits = true;
    for (const t of tables) {
      const r = t.getBoundingClientRect();
      if (r.width > window.innerWidth + 5) tableFits = false;
    }
    return { tableCount: tables.length, overflow, tableFits };
  });
  record(11, "tablet", "Admin", !adminCheck.overflow ? "PASS" : "WARN",
    `Tables: ${adminCheck.tableCount}, tableFits: ${adminCheck.tableFits}, overflow: ${adminCheck.overflow}`);

  await adminTablet.close();
  await adminTabletCtx.close();

  // ==========================================
  // DESKTOP WIDE - (1920 x 1080)
  // ==========================================
  log("\n===== DESKTOP VIEWPORT (1920x1080) =====\n");

  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: "fr-FR",
  });
  const desktop = await desktopCtx.newPage();

  // Login as student
  await loginViaUI(desktop, STUDENT_EMAIL, STUDENT_PASS);

  // Test 12: Dashboard (desktop wide)
  log("Test 12: Dashboard (desktop wide)");
  await navigateAndWait(desktop, "/dashboard");
  await screenshot(desktop, 12, "Dashboard desktop wide");
  const dashDesktop = await desktop.evaluate(() => {
    const sidebar = document.querySelector("[data-sidebar='sidebar']") ||
      document.querySelector("aside") ||
      document.querySelector("nav[role='navigation']");
    const mainContent = document.querySelector("main") || document.querySelector("[class*='content']");
    const sidebarWidth = sidebar ? sidebar.getBoundingClientRect().width : 0;
    const contentWidth = mainContent ? mainContent.getBoundingClientRect().width : 0;
    const totalUsed = sidebarWidth + contentWidth;
    return {
      sidebarWidth: Math.round(sidebarWidth),
      contentWidth: Math.round(contentWidth),
      viewportWidth: window.innerWidth,
      usesWidth: totalUsed > window.innerWidth * 0.7,
    };
  });
  record(12, "desktop", "Dashboard", dashDesktop.usesWidth ? "PASS" : "WARN",
    `Sidebar: ${dashDesktop.sidebarWidth}px, content: ${dashDesktop.contentWidth}px, uses ${Math.round((dashDesktop.sidebarWidth + dashDesktop.contentWidth) / dashDesktop.viewportWidth * 100)}% of ${dashDesktop.viewportWidth}px`);

  // Test 13: Resume builder (desktop wide)
  log("Test 13: Resume builder (desktop wide)");
  if (resumeId) {
    await navigateAndWait(desktop, `/builder/${resumeId}`);
    await sleep(2000);
    await screenshot(desktop, 13, "Resume builder desktop wide");
    const builderDesktop = await desktop.evaluate(() => {
      // Look for artboard/preview area
      const artboard = document.querySelector("[class*='artboard']") ||
        document.querySelector("[id*='artboard']") ||
        document.querySelector("[class*='preview']") ||
        document.querySelector("[class*='Preview']");
      const artboardRect = artboard ? artboard.getBoundingClientRect() : null;
      return {
        artboardWidth: artboardRect ? Math.round(artboardRect.width) : 0,
        viewportWidth: window.innerWidth,
        hasPreview: !!artboard,
      };
    });
    record(13, "desktop", "Builder", builderDesktop.hasPreview ? "PASS" : "WARN",
      `Preview pane: ${builderDesktop.artboardWidth}px wide on ${builderDesktop.viewportWidth}px viewport`);
  } else {
    await screenshot(desktop, 13, "Resume builder desktop - no resume");
    record(13, "desktop", "Builder", "WARN", "No resume found to test builder layout");
  }

  // Test 14: Landing page (desktop wide)
  log("Test 14: Landing page (desktop wide)");
  await navigateAndWait(desktop, "/");
  await screenshot(desktop, 14, "Landing page desktop wide");
  const landingDesktop = await desktop.evaluate(() => {
    const h1 = document.querySelector("h1");
    const heroSection = h1 ? h1.closest("section") || h1.parentElement : null;
    const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
    const centered = heroRect ? Math.abs((heroRect.left + heroRect.right) / 2 - window.innerWidth / 2) < 50 : false;
    const stretched = heroRect ? heroRect.width > window.innerWidth * 0.95 : false;
    return {
      centered,
      stretched,
      heroWidth: heroRect ? Math.round(heroRect.width) : 0,
      viewportWidth: window.innerWidth,
    };
  });
  if (landingDesktop.centered && !landingDesktop.stretched) {
    record(14, "desktop", "Landing", "PASS",
      `Hero centered, ${landingDesktop.heroWidth}px wide (not stretched) on ${landingDesktop.viewportWidth}px`);
  } else if (landingDesktop.stretched) {
    record(14, "desktop", "Landing", "WARN",
      `Hero may be stretched: ${landingDesktop.heroWidth}px on ${landingDesktop.viewportWidth}px viewport`);
  } else {
    record(14, "desktop", "Landing", "WARN",
      `Hero centered=${landingDesktop.centered}, width=${landingDesktop.heroWidth}px`);
  }

  // ==========================================
  // BONUS: Extra mobile checks
  // ==========================================
  log("\n===== BONUS MOBILE CHECKS =====\n");

  const bonusCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
    locale: "fr-FR",
  });
  const bonus = await bonusCtx.newPage();
  await loginViaUI(bonus, STUDENT_EMAIL, STUDENT_PASS);

  // Test 15: Dashboard - try hamburger menu
  log("Test 15: Mobile hamburger menu test");
  await navigateAndWait(bonus, "/dashboard");
  const hamburgerTest = await bonus.evaluate(() => {
    const trigger = document.querySelector("[data-sidebar='trigger']") ||
      document.querySelector("button[aria-label*='menu']") ||
      document.querySelector("button[aria-label*='Menu']");
    if (trigger) {
      trigger.click();
      return { found: true, clicked: true };
    }
    // Try finding any button with a menu icon (3 lines)
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const svg = btn.querySelector("svg");
      if (svg && btn.getBoundingClientRect().width < 60) {
        btn.click();
        return { found: true, clicked: true, fallback: true };
      }
    }
    return { found: false, clicked: false };
  });
  await sleep(1000);
  await screenshot(bonus, 15, "Mobile hamburger menu opened");
  const menuOpenCheck = await bonus.evaluate(() => {
    const sidebar = document.querySelector("[data-sidebar='sidebar']") ||
      document.querySelector("aside") ||
      document.querySelector("[role='dialog']") ||
      document.querySelector("[class*='sheet']") ||
      document.querySelector("[class*='Sheet']");
    return {
      sidebarVisible: sidebar ? window.getComputedStyle(sidebar).display !== "none" : false,
      dialogOpen: !!document.querySelector("[role='dialog']"),
    };
  });
  record(15, "mobile", "Hamburger", hamburgerTest.found ? "PASS" : "WARN",
    `Trigger found: ${hamburgerTest.found}, sidebar/dialog: ${menuOpenCheck.sidebarVisible || menuOpenCheck.dialogOpen}`);

  // Test 16: Scroll through career page on mobile
  log("Test 16: Career page full scroll (mobile)");
  await navigateAndWait(bonus, "/dashboard/career");
  await bonus.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(500);
  await screenshot(bonus, 16, "Career page bottom mobile");
  const careerBottom = await checkHorizontalOverflow(bonus);
  record(16, "mobile", "Career (bottom)", !careerBottom ? "PASS" : "FAIL",
    `Bottom of career page, overflow: ${careerBottom}`);

  // Test 17: Profile/Settings - form inputs
  log("Test 17: Settings profile (mobile)");
  await navigateAndWait(bonus, "/dashboard/settings/profile");
  await screenshot(bonus, 17, "Settings profile mobile");
  const profileMobile = await bonus.evaluate(() => {
    const inputs = document.querySelectorAll("input, textarea, select");
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    let narrowInputs = 0;
    for (const inp of inputs) {
      const r = inp.getBoundingClientRect();
      if (r.width > 0 && r.width < 200) narrowInputs++;
    }
    return { inputCount: inputs.length, overflow, narrowInputs };
  });
  record(17, "mobile", "Profile", !profileMobile.overflow ? "PASS" : "WARN",
    `${profileMobile.inputCount} inputs, ${profileMobile.narrowInputs} narrow (<200px), overflow: ${profileMobile.overflow}`);

  // Test 18: Check touch target sizes across dashboard
  log("Test 18: Touch target sizes (mobile)");
  await navigateAndWait(bonus, "/dashboard");
  const touchTargets = await bonus.evaluate(() => {
    const interactive = document.querySelectorAll("button, a, input, select, textarea, [role='button'], [tabindex]");
    let tooSmall = 0;
    let total = 0;
    const examples = [];
    for (const el of interactive) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      total++;
      if (r.width < 32 || r.height < 32) {
        tooSmall++;
        if (examples.length < 3) {
          const text = el.textContent?.trim().slice(0, 20) || el.getAttribute("aria-label") || el.tagName;
          examples.push(`${text}(${Math.round(r.width)}x${Math.round(r.height)})`);
        }
      }
    }
    return { total, tooSmall, examples };
  });
  await screenshot(bonus, 18, "Touch targets dashboard mobile");
  const touchRatio = touchTargets.total > 0 ? (touchTargets.tooSmall / touchTargets.total * 100).toFixed(1) : 0;
  record(18, "mobile", "Touch Targets", touchTargets.tooSmall < touchTargets.total * 0.3 ? "PASS" : "WARN",
    `${touchTargets.tooSmall}/${touchTargets.total} elements < 32px (${touchRatio}%). Examples: ${touchTargets.examples.join(", ")}`);

  // Test 19: Interview page scrolled (mobile)
  log("Test 19: Interview page scrolled (mobile)");
  await navigateAndWait(bonus, "/dashboard/interview");
  await bonus.evaluate(() => window.scrollTo(0, 500));
  await sleep(500);
  await screenshot(bonus, 19, "Interview page scrolled mobile");
  const interviewScroll = await checkHorizontalOverflow(bonus);
  record(19, "mobile", "Interview (scrolled)", !interviewScroll ? "PASS" : "FAIL",
    `Mid-page overflow: ${interviewScroll}`);

  // Test 20: Resumes page scrolled (mobile)
  log("Test 20: Resumes scrolled (mobile)");
  await navigateAndWait(bonus, "/dashboard/resumes");
  await bonus.evaluate(() => window.scrollTo(0, 300));
  await sleep(500);
  await screenshot(bonus, 20, "Resumes scrolled mobile");
  const resumesScroll = await checkHorizontalOverflow(bonus);
  record(20, "mobile", "Resumes (scrolled)", !resumesScroll ? "PASS" : "FAIL",
    `Resumes mid-page overflow: ${resumesScroll}`);

  await bonus.close();
  await bonusCtx.close();
  await desktop.close();
  await desktopCtx.close();

  // ==========================================
  // SUMMARY
  // ==========================================
  log("\n\n========================================");
  log("       RESPONSIVENESS TEST SUMMARY      ");
  log("========================================\n");

  const passes = results.filter(r => r.status === "PASS").length;
  const warns = results.filter(r => r.status === "WARN").length;
  const fails = results.filter(r => r.status === "FAIL").length;

  for (const r of results) {
    const icon = r.status === "PASS" ? "[PASS]" : r.status === "FAIL" ? "[FAIL]" : "[WARN]";
    console.log(`  ${icon} #${String(r.id).padStart(2)} [${r.viewport.padEnd(7)}] ${r.page.padEnd(20)} ${r.details}`);
  }

  console.log(`\n  TOTAL: ${passes} PASS, ${warns} WARN, ${fails} FAIL (${results.length} tests)\n`);

  await browser.close();
  log("Done. All screenshots saved to C:/tmp/e2e-mobile-*.png");
}

run().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
