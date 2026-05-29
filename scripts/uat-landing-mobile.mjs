/**
 * UAT Test: Landing Page, Auth Flows & Mobile Responsiveness
 * Tests the application as a first-time visitor would experience it.
 *
 * Covers:
 *  - Desktop landing page sections (hero, features, templates, FAQ, footer)
 *  - Auth register/login flows
 *  - Mobile (iPhone 375x812) layout
 *  - Tablet (iPad 768x1024) layout
 *
 * Screenshots saved to C:/tmp/uat-landing-01.png through uat-landing-25.png
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
const CREDS = { email: "admin@test.com", password: "TestAccount123!" };

let shotNum = 0;
function nextShot(label) {
  shotNum++;
  const num = String(shotNum).padStart(2, "0");
  const path = `${SCREENSHOT_DIR}/uat-landing-${num}.png`;
  console.log(`  [Screenshot ${num}] ${label} -> ${path}`);
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

async function safeClick(page, selector, opts = {}) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector, opts);
    return true;
  } catch {
    return false;
  }
}

async function waitForLoad(page) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    await page.waitForLoadState("domcontentloaded", { timeout: 10000 });
  }
  await dismissOverlay(page);
}

/**
 * Login helper - uses the actual form field names from the codebase.
 * The login form uses name="identifier" for email and name="password" for password.
 */
async function doLogin(page) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForLoad(page);

  // The form uses name="identifier" for the email/username field
  const emailInput = await page.$('input[name="identifier"]');
  const pwInput = await page.$('input[name="password"]');

  if (!emailInput || !pwInput) {
    // Fallback: try by placeholder
    const fallbackEmail = await page.$('input[placeholder*="john.doe"]');
    const fallbackPw = await page.$('input[autocomplete="current-password"]');
    if (fallbackEmail && fallbackPw) {
      await fallbackEmail.fill(CREDS.email);
      await fallbackPw.fill(CREDS.password);
    } else {
      // Last resort: get all inputs
      const inputs = await page.$$("input");
      console.log(`   Found ${inputs.length} input elements`);
      for (const inp of inputs) {
        const attrs = await inp.evaluate((el) => ({
          name: el.name,
          type: el.type,
          placeholder: el.placeholder,
          autocomplete: el.autocomplete,
        }));
        console.log(`   Input: name=${attrs.name}, type=${attrs.type}, placeholder=${attrs.placeholder}, autocomplete=${attrs.autocomplete}`);
      }
      console.log("   WARNING: Could not find login form fields");
      return false;
    }
  } else {
    await emailInput.fill(CREDS.email);
    await pwInput.fill(CREDS.password);
  }

  // Click submit
  const submitted = await safeClick(page, 'button[type="submit"]');
  if (!submitted) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /se connecter|connexion|sign in|login/i.test(b.textContent)
      );
      if (btn) btn.click();
    });
  }

  // Wait for navigation to dashboard
  try {
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
  } catch {
    await page.waitForTimeout(3000);
  }
  await waitForLoad(page);
  return true;
}

// ======================================================================
// MAIN TEST
// ======================================================================
async function main() {
  console.log("=== UAT: Landing Page, Auth & Mobile Responsiveness ===\n");

  const browser = await chromium.launch({ headless: false, slowMo: 100 });

  // ---- DESKTOP CONTEXT (1400x900) ----
  console.log("--- PHASE 1: Desktop Tests (1400x900) ---");
  const desktopCtx = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    locale: "fr-FR",
  });
  const page = await desktopCtx.newPage();

  // 1. Landing page
  console.log("\n[1] Navigate to landing page");
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForLoad(page);

  // 2. Hero section screenshot
  console.log("[2] Screenshot hero section");
  await page.screenshot({ path: nextShot("desktop-hero-section"), fullPage: false });

  // 3. Scroll to features section
  console.log("[3] Scroll to features section");
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(600);
  await dismissOverlay(page);
  await page.screenshot({ path: nextShot("desktop-features-section"), fullPage: false });

  // 4. Scroll to templates section
  console.log("[4] Scroll to templates section");
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(600);
  await dismissOverlay(page);
  await page.screenshot({ path: nextShot("desktop-templates-section"), fullPage: false });

  // 5. Scroll to FAQ section
  console.log("[5] Scroll to FAQ section");
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(600);
  await dismissOverlay(page);
  await page.screenshot({ path: nextShot("desktop-faq-section"), fullPage: false });

  // 6. Scroll to footer
  console.log("[6] Scroll to footer");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await dismissOverlay(page);
  await page.screenshot({ path: nextShot("desktop-footer"), fullPage: false });

  // 7. Check nav links
  console.log("[7] Check navigation links");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  // Find all nav links in header
  const navLinks = await page.$$eval("header a, nav a", (els) =>
    els.map((e) => ({ href: e.href, text: e.textContent?.trim() })).filter((l) => l.href && l.text)
  );
  console.log(`   Found ${navLinks.length} nav links:`, navLinks.map((l) => l.text).join(", "));

  // Click a couple of key nav links
  for (const link of navLinks.slice(0, 3)) {
    try {
      console.log(`   Clicking: "${link.text}" -> ${link.href}`);
      await page.goto(link.href, { waitUntil: "domcontentloaded", timeout: 15000 });
      await waitForLoad(page);
    } catch (e) {
      console.log(`   Warning: Failed to navigate to ${link.href}: ${e.message}`);
    }
  }
  await page.screenshot({ path: nextShot("desktop-nav-result"), fullPage: false });

  // ---- AUTH FLOW TESTS ----
  console.log("\n--- PHASE 2: Auth Flow Tests ---");

  // 8. Register page
  console.log("[8] Navigate to register page");
  await page.goto(`${BASE}/auth/register`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await waitForLoad(page);

  // 9. Screenshot register - check French labels
  console.log("[9] Screenshot register page");
  const registerLabels = await page.$$eval("label, h1, h2", (els) =>
    els.map((e) => e.textContent?.trim()).filter(Boolean)
  );
  console.log(`   Register page labels: ${registerLabels.join(", ")}`);

  // Check for French content
  const registerInputs = await page.$$eval("input", (els) =>
    els.map((e) => ({ name: e.name, type: e.type, placeholder: e.placeholder }))
  );
  console.log(`   Register inputs:`, JSON.stringify(registerInputs));
  await page.screenshot({ path: nextShot("desktop-register-page"), fullPage: false });

  // 10. Login page
  console.log("[10] Navigate to login page");
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await waitForLoad(page);

  // 11. Screenshot login - check "Se connecter" button
  console.log("[11] Screenshot login page");
  const loginBtnInfo = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const loginBtn = buttons.find((b) =>
      /se connecter|connexion|sign/i.test(b.textContent)
    );
    if (!loginBtn) return { found: false, allButtons: buttons.map((b) => b.textContent?.trim()) };
    const style = getComputedStyle(loginBtn);
    return {
      found: true,
      text: loginBtn.textContent?.trim(),
      color: style.color,
      bg: style.backgroundColor,
      opacity: style.opacity,
      visibility: style.visibility,
      width: loginBtn.offsetWidth,
      height: loginBtn.offsetHeight,
    };
  });
  console.log("   Login button info:", JSON.stringify(loginBtnInfo));
  await page.screenshot({ path: nextShot("desktop-login-page"), fullPage: false });

  // 12. Fill credentials and login
  console.log("[12] Fill credentials and login");

  try {
    // Aggressively dismiss vite-error-overlay before interacting with form
    await dismissOverlay(page);
    await page.waitForTimeout(200);
    await dismissOverlay(page);

    // Use evaluate to set values directly via React's internal mechanisms
    await page.evaluate((creds) => {
      const identifierInput = document.querySelector('input[name="identifier"]');
      const passwordInput = document.querySelector('input[name="password"]');
      if (identifierInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(identifierInput, creds.email);
        identifierInput.dispatchEvent(new Event('input', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('change', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      if (passwordInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeInputValueSetter.call(passwordInput, creds.password);
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    }, CREDS);

    await page.waitForTimeout(500);

    // Verify values were set
    const fieldValues = await page.evaluate(() => {
      const id = document.querySelector('input[name="identifier"]');
      const pw = document.querySelector('input[name="password"]');
      return {
        identifier: id?.value,
        password: pw?.value?.length > 0 ? `[${pw.value.length} chars]` : "[empty]",
      };
    });
    console.log("   Field values after setting:", JSON.stringify(fieldValues));

    await page.screenshot({ path: nextShot("desktop-login-filled"), fullPage: false });

    // Dismiss overlay again before clicking submit
    await dismissOverlay(page);

    // Submit the form via JS to bypass overlay
    await page.evaluate(() => {
      const form = document.querySelector('form[aria-label]');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });
    console.log("   Clicked submit button via JS");

    // Wait for navigation or error
    try {
      await page.waitForURL("**/dashboard**", { timeout: 15000 });
      console.log("   Navigated to dashboard!");
    } catch {
      await dismissOverlay(page);
      // Check for error toasts
      const toasts = await page.$$eval('[data-sonner-toast], [role="status"], .toast, [class*="toast"]', (els) =>
        els.map((e) => e.textContent?.trim()).filter(Boolean)
      );
      if (toasts.length > 0) {
        console.log("   Toast messages:", toasts.join(" | "));
      }
      // Check for form validation errors
      const formErrors = await page.$$eval('[role="alert"], .text-destructive, [class*="error"]', (els) =>
        els.map((e) => e.textContent?.trim()).filter(Boolean)
      );
      if (formErrors.length > 0) {
        console.log("   Form errors:", formErrors.join(" | "));
      }
      console.log(`   Still on: ${page.url()}`);
      await page.screenshot({ path: nextShot("desktop-login-error-state"), fullPage: false });
    }
    await waitForLoad(page);
  } catch (e) {
    console.log(`   Login fill/submit error: ${e.message}`);
  }

  // 13. Verify dashboard loads
  console.log("[13] Verify dashboard loads");
  const afterLoginUrl = page.url();
  const isDashboard = afterLoginUrl.includes("/dashboard");
  console.log(`   Current URL after login: ${afterLoginUrl}`);
  console.log(`   Dashboard loaded: ${isDashboard ? "YES" : "NO - FAILED"}`);
  await page.screenshot({ path: nextShot("desktop-dashboard-after-login"), fullPage: false });

  // 14. Sign out
  console.log("[14] Sign out");
  if (isDashboard) {
    try {
      // First try: look for visible sign-out or deconnexion text
      let signedOut = await page.evaluate(() => {
        const all = [...document.querySelectorAll("button, a, [role='menuitem']")];
        const signOutEl = all.find((el) =>
          /sign.?out|d[eé]connexion|logout|se d[eé]connecter/i.test(el.textContent)
        );
        if (signOutEl) {
          signOutEl.click();
          return { found: true, text: signOutEl.textContent?.trim() };
        }
        return { found: false };
      });

      if (!signedOut.found) {
        // Try: look for user avatar or sidebar footer to open menu
        console.log("   Looking for user menu / sidebar footer...");

        // Try clicking on avatar/user button in sidebar footer
        const footerButtons = await page.$$("footer button, .sidebar-footer button, [data-slot='sidebar-footer'] button");
        for (const btn of footerButtons) {
          try {
            await btn.click();
            await page.waitForTimeout(500);
            // Now check for sign out in dropdown
            signedOut = await page.evaluate(() => {
              const all = [...document.querySelectorAll("[role='menuitem'], [data-slot='menu-item'], button, a")];
              const el = all.find((e) =>
                /sign.?out|d[eé]connexion|logout/i.test(e.textContent)
              );
              if (el) {
                el.click();
                return { found: true, text: el.textContent?.trim() };
              }
              return { found: false };
            });
            if (signedOut.found) break;
          } catch {}
        }
      }

      if (!signedOut.found) {
        // Try: sidebar bottom area or any dropdown trigger
        console.log("   Trying DropdownMenuTrigger or popover...");
        const triggers = await page.$$('[data-slot="dropdown-menu-trigger"], [data-radix-collection-item]');
        for (const trigger of triggers.slice(-3)) {
          try {
            await trigger.click();
            await page.waitForTimeout(500);
            signedOut = await page.evaluate(() => {
              const all = [...document.querySelectorAll("[role='menuitem'], [data-slot='menu-item'], button, a")];
              const el = all.find((e) =>
                /sign.?out|d[eé]connexion|logout/i.test(e.textContent)
              );
              if (el) {
                el.click();
                return { found: true, text: el.textContent?.trim() };
              }
              return { found: false };
            });
            if (signedOut.found) break;
          } catch {}
        }
      }

      if (signedOut.found) {
        console.log(`   Sign out clicked: "${signedOut.text}"`);
      } else {
        console.log("   WARNING: Could not find sign-out button");
        // Navigate away manually to test
        await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 10000 });
      }

      await page.waitForTimeout(3000);
      await waitForLoad(page);
    } catch (e) {
      console.log(`   Sign out error: ${e.message}`);
    }
  } else {
    console.log("   Skipping sign out - not on dashboard");
  }

  // 15. Verify redirect to login
  console.log("[15] Verify redirect after sign out");
  console.log(`   URL after sign out: ${page.url()}`);
  await page.screenshot({ path: nextShot("desktop-after-signout"), fullPage: false });

  await desktopCtx.close();

  // ---- MOBILE TESTS (375x812 - iPhone) ----
  console.log("\n--- PHASE 3: Mobile Tests (375x812 - iPhone) ---");
  const mobileCtx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: "fr-FR",
    isMobile: true,
    hasTouch: true,
  });
  const mPage = await mobileCtx.newPage();

  // 16-17. Mobile landing
  console.log("[16-17] Mobile landing page");
  await mPage.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForLoad(mPage);

  // 18. Screenshot mobile hero
  console.log("[18] Screenshot mobile hero");
  await mPage.screenshot({ path: nextShot("mobile-landing-hero"), fullPage: false });

  // Verify hero text visibility
  const mobileHeroText = await mPage.evaluate(() => {
    const headings = [...document.querySelectorAll("h1, h2, h3")];
    return headings.slice(0, 3).map((h) => {
      const style = getComputedStyle(h);
      return {
        text: h.textContent?.trim()?.substring(0, 50),
        color: style.color,
        opacity: style.opacity,
        visibility: style.visibility,
        fontSize: style.fontSize,
      };
    });
  });
  console.log("   Mobile hero text visibility:", JSON.stringify(mobileHeroText));

  // 19. Check for hamburger menu
  console.log("[19] Look for hamburger menu");
  // On mobile the nav items may collapse to a hamburger
  const hamburgerFound = await page.evaluate(() => {
    // Check for common hamburger patterns
    const buttons = [...document.querySelectorAll("button")];
    const hamburger = buttons.find(
      (b) =>
        b.getAttribute("aria-label")?.toLowerCase().includes("menu") ||
        b.querySelector("svg path[d*='M3']") || // hamburger icon path
        b.classList.contains("hamburger")
    );
    return hamburger ? { found: true, label: hamburger.getAttribute("aria-label") } : { found: false };
  }).catch(() => ({ found: false }));
  console.log(`   Hamburger menu: ${hamburgerFound.found ? "FOUND" : "NOT FOUND"}`);

  // Try clicking the language selector icon (that appeared in earlier screenshot)
  const langSelector = await mPage.$('button[aria-label*="lang"], button:has(svg)');
  if (langSelector) {
    try {
      // Don't click - we saw it opened language dropdown
      console.log("   Language/icon button found (not clicking to avoid dropdown)");
    } catch {}
  }

  // 20. Screenshot mobile menu area
  console.log("[20] Screenshot mobile menu area");
  await mPage.screenshot({ path: nextShot("mobile-menu-area"), fullPage: false });

  // Scroll mobile landing to see more sections
  console.log("   Scrolling mobile landing...");
  await mPage.evaluate(() => window.scrollBy(0, 600));
  await mPage.waitForTimeout(400);
  await mPage.screenshot({ path: nextShot("mobile-landing-scroll1"), fullPage: false });

  await mPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mPage.waitForTimeout(400);
  await mPage.screenshot({ path: nextShot("mobile-landing-footer"), fullPage: false });

  // 21. Mobile login page
  console.log("[21] Mobile login page");
  await mPage.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await waitForLoad(mPage);

  // 22. Screenshot mobile login
  console.log("[22] Screenshot mobile login");
  await mPage.screenshot({ path: nextShot("mobile-login"), fullPage: false });

  // 23. Login on mobile
  console.log("[23] Login on mobile");
  try {
    await dismissOverlay(mPage);
    await mPage.evaluate((creds) => {
      const identifierInput = document.querySelector('input[name="identifier"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      if (identifierInput) {
        setter.call(identifierInput, creds.email);
        identifierInput.dispatchEvent(new Event('input', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('change', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      if (passwordInput) {
        setter.call(passwordInput, creds.password);
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    }, CREDS);
    await mPage.waitForTimeout(500);
    await mPage.screenshot({ path: nextShot("mobile-login-filled"), fullPage: false });

    await dismissOverlay(mPage);
    await mPage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    try {
      await mPage.waitForURL("**/dashboard**", { timeout: 15000 });
      console.log("   Mobile login success!");
    } catch {
      const toasts = await mPage.$$eval('[data-sonner-toast], [role="status"]', (els) =>
        els.map((e) => e.textContent?.trim()).filter(Boolean)
      );
      if (toasts.length > 0) console.log("   Mobile toasts:", toasts.join(" | "));
      console.log(`   Mobile still on: ${mPage.url()}`);
    }
    await waitForLoad(mPage);
  } catch (e) {
    console.log(`   Mobile login error: ${e.message}`);
  }

  // 24. Screenshot mobile dashboard
  console.log("[24] Screenshot mobile dashboard");
  console.log(`   Mobile URL after login: ${mPage.url()}`);
  await mPage.screenshot({ path: nextShot("mobile-dashboard"), fullPage: false });

  // Check if on dashboard
  if (mPage.url().includes("/dashboard")) {
    // Check for mobile sidebar/sheet
    const mobileSidebarInfo = await mPage.evaluate(() => {
      const sidebar = document.querySelector('[data-slot="sidebar"]');
      const sheet = document.querySelector('[role="dialog"]');
      return {
        sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== "none" : false,
        sheetPresent: !!sheet,
      };
    });
    console.log("   Mobile sidebar info:", JSON.stringify(mobileSidebarInfo));

    // Try to open mobile sidebar/sheet
    const menuTrigger = await mPage.$('[data-slot="sidebar-trigger"], button[aria-label*="Sidebar"], button[aria-label*="sidebar"], button[aria-label*="Menu"]');
    if (menuTrigger) {
      await menuTrigger.click();
      await mPage.waitForTimeout(600);
      await mPage.screenshot({ path: nextShot("mobile-sidebar-open"), fullPage: false });
    }
  }

  // 25. Navigate to resumes
  console.log("[25] Navigate to resumes page");
  try {
    await mPage.goto(`${BASE}/dashboard/resumes`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await waitForLoad(mPage);
  } catch {
    console.log("   Fallback: navigating via link");
    await mPage.evaluate(() => {
      const link = [...document.querySelectorAll("a")].find((a) => /resum|cv/i.test(a.textContent));
      if (link) link.click();
    });
    await mPage.waitForTimeout(2000);
  }

  // 26. Screenshot mobile resumes
  console.log("[26] Screenshot mobile resumes");
  await mPage.screenshot({ path: nextShot("mobile-resumes"), fullPage: false });

  await mobileCtx.close();

  // ---- TABLET TESTS (768x1024 - iPad) ----
  console.log("\n--- PHASE 4: Tablet Tests (768x1024 - iPad) ---");
  const tabletCtx = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    locale: "fr-FR",
  });
  const tPage = await tabletCtx.newPage();

  // 27. Login on tablet
  console.log("[27] Tablet: Login");
  await tPage.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await waitForLoad(tPage);

  try {
    await dismissOverlay(tPage);
    await tPage.evaluate((creds) => {
      const identifierInput = document.querySelector('input[name="identifier"]');
      const passwordInput = document.querySelector('input[name="password"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      if (identifierInput) {
        setter.call(identifierInput, creds.email);
        identifierInput.dispatchEvent(new Event('input', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('change', { bubbles: true }));
        identifierInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      if (passwordInput) {
        setter.call(passwordInput, creds.password);
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('blur', { bubbles: true }));
      }
    }, CREDS);
    await tPage.waitForTimeout(500);

    await dismissOverlay(tPage);
    await tPage.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    });
    try {
      await tPage.waitForURL("**/dashboard**", { timeout: 15000 });
      console.log("   Tablet login success!");
    } catch {
      const toasts = await tPage.$$eval('[data-sonner-toast], [role="status"]', (els) =>
        els.map((e) => e.textContent?.trim()).filter(Boolean)
      );
      if (toasts.length > 0) console.log("   Tablet toasts:", toasts.join(" | "));
      console.log(`   Tablet still on: ${tPage.url()}`);
    }
    await waitForLoad(tPage);
  } catch (e) {
    console.log(`   Tablet login error: ${e.message}`);
  }

  // 28-29. Tablet dashboard
  console.log("[28-29] Screenshot tablet dashboard");
  console.log(`   Tablet URL: ${tPage.url()}`);
  await tPage.screenshot({ path: nextShot("tablet-dashboard"), fullPage: false });

  // Check tablet sidebar behavior
  const tabletSidebarInfo = await tPage.evaluate(() => {
    const sidebar = document.querySelector('[data-slot="sidebar"]');
    if (!sidebar) return { found: false };
    const style = getComputedStyle(sidebar);
    return {
      found: true,
      display: style.display,
      width: sidebar.offsetWidth,
      position: style.position,
    };
  });
  console.log("   Tablet sidebar:", JSON.stringify(tabletSidebarInfo));

  // 30. Check sidebar toggle on tablet
  console.log("[30] Check sidebar on tablet");
  const tabletSidebarTrigger = await tPage.$('[data-slot="sidebar-trigger"], button[aria-label*="Sidebar"]');
  if (tabletSidebarTrigger) {
    await tabletSidebarTrigger.click();
    await tPage.waitForTimeout(600);
    await dismissOverlay(tPage);
    await tPage.screenshot({ path: nextShot("tablet-sidebar-toggled"), fullPage: false });
  } else {
    await tPage.screenshot({ path: nextShot("tablet-sidebar-state"), fullPage: false });
  }

  await tabletCtx.close();
  await browser.close();

  console.log(`\n=== UAT COMPLETE: ${shotNum} screenshots taken ===`);
  console.log(`Screenshots saved to ${SCREENSHOT_DIR}/uat-landing-*.png`);
}

main().catch((e) => {
  console.error("UAT FATAL ERROR:", e);
  process.exit(1);
});
