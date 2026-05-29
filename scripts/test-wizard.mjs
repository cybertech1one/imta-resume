import { chromium } from "playwright";

const BASE = "http://localhost:3040";
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
	const browser = await chromium.launch({ headless: false, slowMo: 200 });
	const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
	const page = await context.newPage();

	async function dismissOverlay() {
		try {
			await page.evaluate(() => {
				const el = document.querySelector("vite-error-overlay");
				if (el) el.remove();
			});
		} catch {}
	}

	console.log("=== STEP 1: Login ===");
	await page.goto(`${BASE}/auth/login`);
	await page.waitForLoadState("networkidle");
	await sleep(3000);
	await dismissOverlay();
	await page.screenshot({ path: "C:/tmp/wizard-01-login.png" });

	// Fill email - use the actual placeholder text to find the right input
	const emailField = page.getByPlaceholder("john.doe@example.com");
	if (await emailField.count() > 0) {
		await emailField.click();
		await emailField.fill("admin@test.com");
		console.log("Filled email via placeholder");
	} else {
		// Fallback: click first input and type
		const firstInput = page.locator("input").first();
		await firstInput.click();
		await firstInput.fill("admin@test.com");
		console.log("Filled email via first input");
	}

	// Fill password
	const passField = page.locator('input[type="password"]');
	await passField.click();
	await passField.fill("TestAccount123!");
	console.log("Filled password");

	await sleep(500);
	await page.screenshot({ path: "C:/tmp/wizard-02-filled.png" });
	await dismissOverlay();

	// Submit login
	await page.locator('button[type="submit"]').click({ force: true });
	console.log("Clicked login");

	// Wait for redirect
	try {
		await page.waitForURL("**/dashboard**", { timeout: 10000 });
	} catch {
		await sleep(3000);
		console.log("Login redirect timeout, checking URL...");
	}
	await sleep(2000);
	await dismissOverlay();
	await page.screenshot({ path: "C:/tmp/wizard-03-after-login.png" });
	console.log("URL after login:", page.url());

	if (page.url().includes("/auth")) {
		console.log("LOGIN FAILED - still on auth page. Checking for errors...");
		const errors = await page.locator("[role='alert'], .text-destructive").allTextContents();
		console.log("Visible errors:", errors);
		await browser.close();
		return;
	}

	console.log("\n=== STEP 2: Navigate to AI Wizard ===");
	await page.goto(`${BASE}/dashboard/resumes/ai-wizard`);
	await page.waitForLoadState("networkidle");
	await sleep(3000);
	await dismissOverlay();
	await page.screenshot({ path: "C:/tmp/wizard-04-wizard.png" });
	console.log("URL:", page.url());

	const bodyText = await page.textContent("body");
	console.log("Has wizard content:", bodyText.includes("Resume") || bodyText.includes("CV"));

	console.log("\n=== STEP 3: Select Resume ===");
	const cards = page.locator("[class*='cursor-pointer']");
	const count = await cards.count();
	console.log("Cards:", count);

	if (count === 0) {
		console.log("No resumes. Checking page state...");
		await page.screenshot({ path: "C:/tmp/wizard-FAIL.png" });
		await browser.close();
		return;
	}

	await cards.first().click();
	await sleep(500);
	await page.screenshot({ path: "C:/tmp/wizard-05-selected.png" });

	const continueBtn = page.locator("button").filter({ hasText: /Continue|Continuer/ });
	if (await continueBtn.count() > 0) {
		await continueBtn.first().click();
		console.log("Continue clicked");
	}
	await sleep(1500);
	await page.screenshot({ path: "C:/tmp/wizard-06-modes.png" });

	console.log("\n=== STEP 4: Gap Analysis ===");
	let mCards = page.locator("[class*='cursor-pointer']");
	if (await mCards.count() >= 3) {
		await mCards.first().click();
		await sleep(300);
		const startBtn = page.locator("button").filter({ hasText: /Start|Commencer/ });
		if (await startBtn.count() > 0) await startBtn.first().click();
		await sleep(1500);

		const targetInput = page.locator("input#target-role");
		if (await targetInput.count() > 0) await targetInput.fill("Data Scientist");

		const analyzeBtn = page.locator("button").filter({ hasText: /Analyze|Analyser/ });
		if (await analyzeBtn.count() > 0) {
			await analyzeBtn.first().click();
			console.log("Analyzing...");
			await sleep(15000);
			await page.screenshot({ path: "C:/tmp/wizard-07-gap-results.png" });
			const toasts = await page.locator("[data-sonner-toast]").allTextContents();
			if (toasts.length) console.log("TOASTS:", toasts);
		}
	}

	console.log("\n=== STEP 5: Adapt to Job ===");
	const back1 = page.locator("button").filter({ hasText: /Back|Retour/ });
	if (await back1.count() > 0) {
		await back1.first().click();
		await sleep(1000);
		mCards = page.locator("[class*='cursor-pointer']");
		if (await mCards.count() >= 2) {
			await mCards.nth(1).click();
			await sleep(300);
			const s2 = page.locator("button").filter({ hasText: /Start|Commencer/ });
			if (await s2.count() > 0) await s2.first().click();
			await sleep(1500);

			const ta = page.locator("textarea");
			if (await ta.count() > 0) {
				await ta.fill("Ingenieur logiciel senior, React/Node.js/TypeScript, 5 ans exp, agile, Casablanca");
				const adaptBtn = page.locator("button").filter({ hasText: /Adapt|Adapter/ });
				if (await adaptBtn.count() > 0) {
					await adaptBtn.first().click();
					console.log("Adapting...");
					await sleep(15000);
					await page.screenshot({ path: "C:/tmp/wizard-08-adapt-results.png" });
					const t2 = await page.locator("[data-sonner-toast]").allTextContents();
					if (t2.length) console.log("TOASTS:", t2);
				}
			}
		}
	}

	console.log("\n=== STEP 6: AI Chat ===");
	const back2 = page.locator("button").filter({ hasText: /Back|Retour/ });
	if (await back2.count() > 0) {
		await back2.first().click();
		await sleep(1000);
		mCards = page.locator("[class*='cursor-pointer']");
		if (await mCards.count() >= 3) {
			await mCards.nth(2).click();
			await sleep(300);
			const s3 = page.locator("button").filter({ hasText: /Start|Commencer/ });
			if (await s3.count() > 0) await s3.first().click();
			await sleep(1500);
			await page.screenshot({ path: "C:/tmp/wizard-09-chat.png" });

			const chatTa = page.locator("textarea");
			if (await chatTa.count() > 0) {
				await chatTa.fill("Quels sont les points faibles de mon CV?");
				const allBtns = await page.locator("button").all();
				await allBtns[allBtns.length - 1].click();
				console.log("Chat message sent...");
				await sleep(15000);
				await page.screenshot({ path: "C:/tmp/wizard-10-chat-reply.png" });
				const t3 = await page.locator("[data-sonner-toast]").allTextContents();
				if (t3.length) console.log("TOASTS:", t3);
			}
		}
	}

	console.log("\n=== STEP 7: Sidebar check ===");
	await page.goto(`${BASE}/dashboard/resumes`);
	await sleep(2000);
	await dismissOverlay();
	const link = page.locator("a[href*='ai-wizard']");
	console.log("Sidebar link:", await link.count() > 0 ? "FOUND" : "MISSING");
	await page.screenshot({ path: "C:/tmp/wizard-11-sidebar.png" });

	console.log("\n=== DONE ===");
	await sleep(2000);
	await browser.close();
})().catch(e => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
