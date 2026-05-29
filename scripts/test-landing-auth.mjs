/**
 * Landing Pages & Auth Flow - Visual QA Test
 * Tests public-facing pages and authentication flows as a real first-time user.
 * Screenshots saved to C:/tmp/test-landing-XX.png
 */

import { chromium } from "playwright";

const BASE_URL = "http://localhost:3040";
const SCREENSHOT_DIR = "C:/tmp";
let screenshotIndex = 1;
const consoleErrors = [];
const observations = { pass: [], fail: [], warn: [] };

function pad(n) {
  return String(n).padStart(2, "0");
}

function ssPath() {
  return `${SCREENSHOT_DIR}/test-landing-${pad(screenshotIndex++)}.png`;
}

function pass(msg) {
  observations.pass.push(msg);
  console.log(`  PASS: ${msg}`);
}
function fail(msg) {
  observations.fail.push(msg);
  console.log(`  FAIL: ${msg}`);
}
function warn(msg) {
  observations.warn.push(msg);
  console.log(`  WARN: ${msg}`);
}

async function dismissOverlay(page) {
  try {
    await page.evaluate(() => {
      const el = document.querySelector("vite-error-overlay");
      if (el) el.remove();
    });
  } catch {}
}

async function screenshot(page, label) {
  const path = ssPath();
  await dismissOverlay(page);
  await page.screenshot({ path, fullPage: false });
  console.log(`  [Screenshot ${screenshotIndex - 1}] ${label} -> ${path}`);
  return path;
}

async function screenshotFull(page, label) {
  const path = ssPath();
  await dismissOverlay(page);
  await page.screenshot({ path, fullPage: true });
  console.log(`  [Screenshot ${screenshotIndex - 1}] ${label} (full page) -> ${path}`);
  return path;
}

async function waitAndDismiss(page, url, opts = {}) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000, ...opts });
  await page.waitForTimeout(1500);
  await dismissOverlay(page);
}

// ============================================================================
// MAIN TEST
// ============================================================================
async function main() {
  console.log("=== Landing & Auth QA Test ===\n");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "fr-FR",
  });

  const page = await context.newPage();

  // Capture console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      consoleErrors.push(text);
      console.log(`  [Console Error] ${text.substring(0, 200)}`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
    console.log(`  [Page Error] ${err.message.substring(0, 200)}`);
  });

  try {
    // ========================================================================
    // 1. HOME PAGE
    // ========================================================================
    console.log("\n--- 1. HOME PAGE ---");
    await waitAndDismiss(page, `${BASE_URL}/`);

    // Screenshot hero
    await screenshot(page, "Home - Hero section (viewport)");

    // Check title / meta
    const title = await page.title();
    console.log(`  Page title: "${title}"`);
    if (title && title.length > 0) pass(`Page has title: "${title}"`);
    else fail("Page has no title");

    const metaDesc = await page.$eval('meta[name="description"]', (el) => el.content).catch(() => null);
    if (metaDesc) pass(`Meta description present: "${metaDesc.substring(0, 80)}..."`);
    else warn("No meta description found");

    // Check French text on page
    const bodyText = await page.textContent("body");
    const frenchWords = ["Bienvenue", "Commencer", "Connexion", "Inscription", "CV", "carrière", "emploi", "professionnel"];
    const foundFrench = frenchWords.filter((w) => bodyText.includes(w));
    if (foundFrench.length >= 2) pass(`French text found: ${foundFrench.join(", ")}`);
    else warn(`Only ${foundFrench.length} French words found: ${foundFrench.join(", ")}`);

    // Scroll to features section
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await screenshot(page, "Home - Features section");

    // Scroll to stats/more content
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
    await screenshot(page, "Home - Stats section");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await screenshot(page, "Home - Footer");

    // Check for broken images
    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({
        src: img.src,
        alt: img.alt,
        naturalWidth: img.naturalWidth,
        complete: img.complete,
      }))
    );
    const brokenImages = images.filter((img) => img.complete && img.naturalWidth === 0);
    if (brokenImages.length > 0) {
      fail(`${brokenImages.length} broken image(s): ${brokenImages.map((i) => i.src).join(", ")}`);
    } else if (images.length > 0) {
      pass(`All ${images.length} images loaded successfully`);
    } else {
      warn("No images found on home page");
    }

    // Check navigation links in header
    const headerLinks = await page.$$eval("header a, nav a", (links) =>
      links.map((a) => ({ href: a.href, text: a.textContent.trim() }))
    );
    console.log(`  Found ${headerLinks.length} navigation links in header/nav`);
    for (const link of headerLinks.slice(0, 10)) {
      console.log(`    - "${link.text}" -> ${link.href}`);
    }

    // Check footer links
    const footerLinks = await page.$$eval("footer a", (links) =>
      links.map((a) => ({ href: a.href, text: a.textContent.trim() }))
    );
    console.log(`  Found ${footerLinks.length} links in footer`);
    for (const link of footerLinks.slice(0, 10)) {
      console.log(`    - "${link.text}" -> ${link.href}`);
    }

    // Click a header nav link if any exist (test navigation)
    if (headerLinks.length > 0) {
      const navLink = headerLinks.find(
        (l) => l.href.startsWith(BASE_URL) && !l.href.includes("auth") && l.href !== `${BASE_URL}/`
      );
      if (navLink) {
        console.log(`  Clicking nav link: "${navLink.text}" -> ${navLink.href}`);
        await page.click(`a[href="${navLink.href.replace(BASE_URL, "")}"]`).catch(() => {});
        await page.waitForTimeout(1000);
        await screenshot(page, `Nav target: ${navLink.text}`);
        // Navigate back
        await waitAndDismiss(page, `${BASE_URL}/`);
      }
    }

    // ========================================================================
    // 2. HELP PAGE
    // ========================================================================
    console.log("\n--- 2. HELP PAGE ---");
    try {
      const helpResponse = await page.goto(`${BASE_URL}/help`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      await page.waitForTimeout(1500);
      await dismissOverlay(page);

      if (helpResponse && helpResponse.status() < 400) {
        await screenshot(page, "Help page");
        pass("Help page loads successfully");

        const helpText = await page.textContent("body");
        if (helpText.length > 100) pass("Help page has content");
        else warn("Help page appears to have minimal content");
      } else {
        warn(`Help page returned status ${helpResponse?.status()}`);
        await screenshot(page, "Help page (error state)");
      }
    } catch (e) {
      warn(`Help page error: ${e.message.substring(0, 100)}`);
    }

    // ========================================================================
    // 3. REGISTRATION PAGE
    // ========================================================================
    console.log("\n--- 3. REGISTRATION PAGE ---");
    await waitAndDismiss(page, `${BASE_URL}/auth/register`);
    await screenshot(page, "Registration page");

    // Check form fields
    const regFields = {
      name: await page.$('input[name="name"], input[type="text"][placeholder*="nom" i], input[type="text"][placeholder*="name" i]'),
      email: await page.$('input[name="email"], input[type="email"]'),
      username: await page.$('input[name="username"], input[placeholder*="username" i], input[placeholder*="utilisateur" i]'),
      password: await page.$('input[name="password"], input[type="password"]'),
    };

    for (const [field, el] of Object.entries(regFields)) {
      if (el) pass(`Registration: ${field} field present`);
      else warn(`Registration: ${field} field NOT found`);
    }

    // Check all input fields more generically
    const allRegInputs = await page.$$eval("input", (inputs) =>
      inputs.map((i) => ({
        name: i.name,
        type: i.type,
        placeholder: i.placeholder,
        id: i.id,
      }))
    );
    console.log(`  Registration form inputs (${allRegInputs.length}):`);
    for (const inp of allRegInputs) {
      console.log(`    - name="${inp.name}" type="${inp.type}" placeholder="${inp.placeholder}" id="${inp.id}"`);
    }

    // Check for French labels
    const regPageText = await page.textContent("body");
    const frenchRegWords = ["Inscription", "S'inscrire", "Créer", "Nom", "Mot de passe", "E-mail", "Adresse"];
    const foundRegFrench = frenchRegWords.filter((w) => regPageText.includes(w));
    if (foundRegFrench.length >= 2) pass(`Registration has French labels: ${foundRegFrench.join(", ")}`);
    else warn(`Registration French labels: only found ${foundRegFrench.join(", ")}`);

    // Check for link to login
    const loginLink = await page.$('a[href*="login"], a[href*="connexion"]');
    if (loginLink) pass("Registration page has link to login");
    else warn("No login link on registration page");

    // ========================================================================
    // 4. LOGIN PAGE
    // ========================================================================
    console.log("\n--- 4. LOGIN PAGE ---");
    await waitAndDismiss(page, `${BASE_URL}/auth/login`);
    await screenshot(page, "Login page");

    // Check login form fields
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    const passwordInput = await page.$('input[name="password"], input[type="password"]');
    if (emailInput) pass("Login: email field present");
    else fail("Login: email field NOT found");
    if (passwordInput) pass("Login: password field present");
    else fail("Login: password field NOT found");

    // Check all login inputs
    const allLoginInputs = await page.$$eval("input", (inputs) =>
      inputs.map((i) => ({
        name: i.name,
        type: i.type,
        placeholder: i.placeholder,
      }))
    );
    console.log(`  Login form inputs (${allLoginInputs.length}):`);
    for (const inp of allLoginInputs) {
      console.log(`    - name="${inp.name}" type="${inp.type}" placeholder="${inp.placeholder}"`);
    }

    // Check button text visibility (known bug: transparent button text)
    const buttons = await page.$$eval("button", (btns) =>
      btns.map((b) => {
        const style = window.getComputedStyle(b);
        return {
          text: b.textContent.trim(),
          color: style.color,
          backgroundColor: style.backgroundColor,
          opacity: style.opacity,
          visibility: style.visibility,
          display: style.display,
        };
      })
    );
    console.log(`  Buttons (${buttons.length}):`);
    for (const btn of buttons) {
      console.log(
        `    - "${btn.text}" color=${btn.color} bg=${btn.backgroundColor} opacity=${btn.opacity}`
      );
      // Check if text is transparent/invisible
      if (btn.text.includes("connecter") || btn.text.includes("Connexion") || btn.text.includes("Se connecter")) {
        if (btn.color === "transparent" || btn.color === "rgba(0, 0, 0, 0)" || btn.opacity === "0") {
          fail(`Login button text "${btn.text}" is INVISIBLE (color=${btn.color}, opacity=${btn.opacity})`);
        } else {
          pass(`Login button text "${btn.text}" is visible (color=${btn.color})`);
        }
      }
    }

    // Check for passkey option
    const passkeyEl = await page.$('button:has-text("Passkey"), button:has-text("passkey"), [data-testid*="passkey"]');
    const passkeyText = await page.textContent("body");
    if (passkeyText.toLowerCase().includes("passkey")) {
      pass("Passkey option is present on login page");
    } else {
      warn("No passkey option found on login page");
    }

    // Check for "Mot de passe oublié" link
    const forgotLink = await page.$('a:has-text("oublié"), a:has-text("Forgot"), a[href*="forgot"]');
    if (forgotLink) pass("Forgot password link present");
    else warn("Forgot password link not found");

    // Fill in credentials and login
    console.log("  Filling in login credentials...");
    if (emailInput) {
      await emailInput.fill("admin@test.com");
    }
    if (passwordInput) {
      await passwordInput.fill("TestAccount123!");
    }
    await page.waitForTimeout(300);
    await screenshot(page, "Login page - filled credentials");

    // Click login button
    const loginButton = await page.$(
      'button[type="submit"], button:has-text("connecter"), button:has-text("Connexion"), button:has-text("Login")'
    );
    if (loginButton) {
      console.log("  Clicking login button...");
      await loginButton.click();
      await page.waitForTimeout(3000);
      await dismissOverlay(page);
      await screenshot(page, "After login - should be dashboard");

      const currentUrl = page.url();
      console.log(`  Current URL after login: ${currentUrl}`);
      if (currentUrl.includes("dashboard") || currentUrl.includes("/dashboard")) {
        pass("Login successful - redirected to dashboard");
      } else if (currentUrl.includes("auth")) {
        fail(`Login failed - still on auth page: ${currentUrl}`);
      } else {
        warn(`Login redirect to unexpected URL: ${currentUrl}`);
      }
    } else {
      fail("Could not find login submit button");
    }

    // ========================================================================
    // 5. FORGOT PASSWORD PAGE
    // ========================================================================
    console.log("\n--- 5. FORGOT PASSWORD PAGE ---");
    // Sign out first if logged in
    try {
      // Try to sign out via navigating
      const signOutBtn = await page.$('button:has-text("Déconnexion"), button:has-text("Sign out"), a:has-text("Déconnexion")');
      if (signOutBtn) {
        await signOutBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch {}

    // Navigate to forgot password directly
    await waitAndDismiss(page, `${BASE_URL}/auth/forgot-password`);
    await screenshot(page, "Forgot password page");

    const forgotPageText = await page.textContent("body");
    if (forgotPageText.includes("oublié") || forgotPageText.includes("Forgot") || forgotPageText.includes("réinitialiser")) {
      pass("Forgot password page has relevant text");
    } else {
      warn("Forgot password page may not have expected text");
    }

    // Check for email input
    const forgotEmailInput = await page.$('input[name="email"], input[type="email"]');
    if (forgotEmailInput) pass("Forgot password: email input present");
    else fail("Forgot password: no email input");

    // ========================================================================
    // 6. MOBILE VIEWPORT TEST
    // ========================================================================
    console.log("\n--- 6. MOBILE VIEWPORT TEST ---");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    // Mobile home
    await waitAndDismiss(page, `${BASE_URL}/`);
    await screenshot(page, "Mobile - Home page");

    // Check for hamburger menu
    const hamburger = await page.$('button[aria-label*="menu" i], button:has(svg), [data-testid="mobile-menu"]');
    if (hamburger) {
      pass("Mobile: hamburger menu present");
      // Try clicking it
      try {
        await hamburger.click();
        await page.waitForTimeout(500);
        await screenshot(page, "Mobile - Menu open");
      } catch {}
    } else {
      warn("Mobile: no clear hamburger menu found");
    }

    // Mobile login
    await waitAndDismiss(page, `${BASE_URL}/auth/login`);
    await screenshot(page, "Mobile - Login page");

    // Check mobile layout
    const loginForm = await page.$("form");
    if (loginForm) {
      const formBox = await loginForm.boundingBox();
      if (formBox) {
        if (formBox.width <= 375) {
          pass(`Mobile: login form fits viewport (width=${Math.round(formBox.width)}px)`);
        } else {
          fail(`Mobile: login form overflows viewport (width=${Math.round(formBox.width)}px > 375px)`);
        }
      }
    }

    // Mobile registration
    await waitAndDismiss(page, `${BASE_URL}/auth/register`);
    await screenshot(page, "Mobile - Registration page");

    // ========================================================================
    // 7. SEO & LINK CHECKS
    // ========================================================================
    console.log("\n--- 7. SEO & LINK CHECKS ---");
    await page.setViewportSize({ width: 1280, height: 800 });
    await waitAndDismiss(page, `${BASE_URL}/`);

    // Check viewport meta
    const viewportMeta = await page.$eval('meta[name="viewport"]', (el) => el.content).catch(() => null);
    if (viewportMeta) pass(`Viewport meta: ${viewportMeta}`);
    else fail("No viewport meta tag");

    // Check charset
    const charset = await page.$('meta[charset]').catch(() => null);
    if (charset) pass("Charset meta tag present");
    else warn("No charset meta tag");

    // Check Open Graph tags
    const ogTitle = await page.$eval('meta[property="og:title"]', (el) => el.content).catch(() => null);
    if (ogTitle) pass(`OG title: ${ogTitle}`);
    else warn("No og:title meta tag");

    // Check for canonical link
    const canonical = await page.$eval('link[rel="canonical"]', (el) => el.href).catch(() => null);
    if (canonical) pass(`Canonical URL: ${canonical}`);
    else warn("No canonical link tag");

    // Check lang attribute
    const htmlLang = await page.$eval("html", (el) => el.lang).catch(() => null);
    if (htmlLang) {
      console.log(`  HTML lang attribute: "${htmlLang}"`);
      if (htmlLang.startsWith("fr")) pass(`HTML lang is French: ${htmlLang}`);
      else warn(`HTML lang is "${htmlLang}" (expected "fr")`);
    } else {
      warn("No lang attribute on <html>");
    }

    // Collect all page links and check for broken ones
    const allLinks = await page.$$eval("a[href]", (links) =>
      links.map((a) => ({
        href: a.href,
        text: a.textContent.trim().substring(0, 50),
      }))
    );
    console.log(`  Total links on home page: ${allLinks.length}`);

    // Check internal links (just status codes via fetch)
    const internalLinks = [...new Set(allLinks.filter((l) => l.href.startsWith(BASE_URL)).map((l) => l.href))];
    console.log(`  Unique internal links to check: ${internalLinks.length}`);
    for (const href of internalLinks.slice(0, 15)) {
      try {
        const resp = await page.request.get(href);
        const status = resp.status();
        if (status >= 400) {
          fail(`Broken link: ${href} (${status})`);
        } else {
          console.log(`    OK (${status}): ${href}`);
        }
      } catch (e) {
        warn(`Link check error for ${href}: ${e.message.substring(0, 60)}`);
      }
    }

    // ========================================================================
    // 8. CONSOLE ERROR SUMMARY
    // ========================================================================
    console.log("\n--- 8. CONSOLE ERROR SUMMARY ---");
    if (consoleErrors.length > 0) {
      warn(`${consoleErrors.length} console error(s) captured during test`);
      for (const err of consoleErrors.slice(0, 10)) {
        console.log(`  [Error] ${err.substring(0, 200)}`);
      }
    } else {
      pass("No console errors captured");
    }

    // ========================================================================
    // FINAL REPORT
    // ========================================================================
    console.log("\n\n========================================");
    console.log("         FINAL REPORT");
    console.log("========================================");
    console.log(`\n  PASS (${observations.pass.length}):`);
    for (const p of observations.pass) console.log(`    + ${p}`);
    console.log(`\n  FAIL (${observations.fail.length}):`);
    for (const f of observations.fail) console.log(`    X ${f}`);
    console.log(`\n  WARN (${observations.warn.length}):`);
    for (const w of observations.warn) console.log(`    ! ${w}`);
    console.log(`\n  Screenshots: ${screenshotIndex - 1} captured`);
    console.log(`  Console errors: ${consoleErrors.length}`);
    console.log("========================================\n");
  } catch (err) {
    console.error("FATAL ERROR:", err);
    await screenshot(page, "FATAL ERROR").catch(() => {});
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
