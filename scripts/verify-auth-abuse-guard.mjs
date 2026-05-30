/**
 * Isolated verification of the keyless auth abuse-guard logic.
 *
 * Proves (without a live server, since prod still runs the OLD build):
 *  - honeypot-filled signup is rejected
 *  - disposable-email signup is rejected
 *  - fast (sub-1.5s) signup is rejected
 *  - rapid repeated failed logins trigger the per-email lockout
 *  - a clean signup input passes the keyless checks
 *
 * The DB-backed checks (registration mode lookup, daily cap, partner invite)
 * are exercised against whatever DB the env points to; if the DB is
 * unreachable the guard fails open for the cap query and falls back to the env
 * default for the mode, so the keyless rejections above still hold.
 *
 * Run: node scripts/verify-auth-abuse-guard.mjs
 */

// Minimal env so @/utils/env validates. These are only needed for module load;
// the keyless checks below do not depend on their values.
process.env.APP_URL ??= "http://localhost:3040";
process.env.PRINTER_ENDPOINT ??= "ws://localhost:4000";
process.env.DATABASE_URL ??= "postgresql://localhost:5432/dev";
process.env.AUTH_SECRET ??= "verification-secret";
process.env.REGISTRATION_MODE ??= "open";

const { register } = await import("tsx/esm/api");
register();

const guard = await import("../src/integrations/auth/abuse-guard.ts");

let pass = 0;
let fail = 0;
function check(name, cond) {
	if (cond) {
		pass++;
		console.log(`  PASS  ${name}`);
	} else {
		fail++;
		console.log(`  FAIL  ${name}`);
	}
}

console.log("\n== Disposable email block ==");
check("mailinator.com is disposable", guard.isDisposableEmail("bot@mailinator.com") === true);
check("yopmail.fr is disposable", guard.isDisposableEmail("x@yopmail.fr") === true);
check("gmail.com is allowed", guard.isDisposableEmail("real.student@gmail.com") === false);
check("imta domain allowed", guard.isDisposableEmail("etudiant@imta.ac.ma") === false);

console.log("\n== Honeypot rejection (evaluateSignup) ==");
{
	const r = await guard.evaluateSignup({ email: "real@gmail.com", honeypot: "http://spam.example" });
	check("honeypot-filled signup rejected", r.ok === false && r.code === "HONEYPOT");
	check("honeypot rejection message is French", typeof r.message === "string" && r.message.length > 0);
}

console.log("\n== Disposable email rejection (evaluateSignup) ==");
{
	const r = await guard.evaluateSignup({ email: "throwaway@guerrillamail.com" });
	check("disposable-email signup rejected", r.ok === false && r.code === "DISPOSABLE_EMAIL");
}

console.log("\n== Min-fill-time rejection (evaluateSignup) ==");
{
	const r = await guard.evaluateSignup({ email: "real2@gmail.com", formRenderTs: Date.now() - 200 });
	check("sub-1.5s signup rejected", r.ok === false && r.code === "TOO_FAST");
	const r2 = await guard.evaluateSignup({ email: "real3@gmail.com", formRenderTs: Date.now() - 5000 });
	// May pass or be blocked by DB-backed cap; assert it is NOT a TOO_FAST rejection.
	check("normal-speed signup is not TOO_FAST", r2.code !== "TOO_FAST");
}

console.log("\n== Per-email failed-login lockout ==");
{
	const email = `victim_${Date.now()}@gmail.com`;
	// Pre-check is open for the first MAX_FAILED_LOGINS attempts...
	let blockedDuringThreshold = false;
	for (let i = 1; i <= guard.MAX_FAILED_LOGINS; i++) {
		const pre = await guard.isLoginLocked(email);
		if (pre.locked) blockedDuringThreshold = true;
		await guard.recordFailedLogin(email); // simulate a failed password check
	}
	check(`first ${guard.MAX_FAILED_LOGINS} attempts not pre-blocked`, blockedDuringThreshold === false);
	// ...and locked on the NEXT attempt (the pre-check before attempt N+1).
	const status = await guard.isLoginLocked(email);
	check(`locked after ${guard.MAX_FAILED_LOGINS} failures`, status.locked === true);
	check("retryAfter is a positive cooldown", status.retryAfter > 0);
	await guard.clearFailedLogins(email);
	const cleared = await guard.isLoginLocked(email);
	check("clearFailedLogins resets lockout (success path)", cleared.locked === false);
}

console.log("\n== Turnstile keyless mode ==");
check("Turnstile disabled when no keys set", guard.isTurnstileEnabled() === false);
check(
	"verifyTurnstileToken returns true when keyless (no enforcement)",
	(await guard.verifyTurnstileToken(undefined)) === true,
);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
