import { chromium } from 'playwright';

const base = 'http://127.0.0.1:3041';
const screenshots = {
  desktop: process.env.PARTNER_DESKTOP_SCREENSHOT,
  mobile: process.env.PARTNER_MOBILE_SCREENSHOT,
};

const checks = [];
const errors = [];
const browser = await chromium.launch({ headless: true });

async function checkRoute(path, expectedText, viewport) {
  const page = await browser.newPage({ viewport });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${path}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`${path}: ${err.message}`));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('body').waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText(expectedText).first().waitFor({ state: 'visible', timeout: 30000 });
  const status = response?.status() ?? 0;
  const text = await page.locator('body').innerText({ timeout: 10000 });
  const title = await page.title();
  const hasExpected = text.includes(expectedText);
  const hasOverlay = /Internal Server Error|Failed to load module|Unhandled Runtime Error/i.test(text);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const heroLoaded = await page.locator('img[src="/home/partner-recruitment-hero.png"]').first().evaluate((img) => img.complete && img.naturalWidth > 0);
  checks.push({ path, status, title, hasExpected, hasOverlay, overflow, heroLoaded });
  return page;
}

const desktopPage = await checkRoute('/partenaires', 'Recrutez des talents formes, prets pour le terrain.', { width: 1440, height: 1200 });
await desktopPage.screenshot({ path: screenshots.desktop, fullPage: false });
await desktopPage.close();

const mobilePage = await checkRoute('/partenaires', 'Recrutez des talents formes, prets pour le terrain.', { width: 390, height: 844 });
await mobilePage.locator('summary[aria-label="Menu"]').click();
const menuVisible = await mobilePage.getByText('Entreprises').last().isVisible();
checks.push({ path: '/partenaires mobile menu', menuVisible });
await mobilePage.screenshot({ path: screenshots.mobile, fullPage: false });
await mobilePage.close();

await checkRoute('/entreprises', 'Trouvez des profils etudiants qui savent deja se presenter.', { width: 1280, height: 900 }).then((p) => p.close());
await checkRoute('/recruteurs', 'Centralisez vos recrutements et vos echanges candidats.', { width: 1280, height: 900 }).then((p) => p.close());
await checkRoute('/publier-offre-stage', 'Publiez une offre de stage et recevez des candidatures mieux preparees.', { width: 1280, height: 900 }).then((p) => p.close());
await checkRoute('/recrutement-sante-maroc', 'Recrutez des profils sante prepares aux exigences du terrain.', { width: 1280, height: 900 }).then((p) => p.close());

await browser.close();
console.log(JSON.stringify({ checks, errors, screenshots }, null, 2));
