/**
 * @fileoverview Authentication Abuse Guard
 *
 * Centralised, keyless-by-default protections for the sign-in / sign-up flows:
 *
 *  1. Brute-force defence (login): a per-EMAIL failed-attempt lockout on top of
 *     Better Auth's IP-based `rateLimit`. After N failures within a window the
 *     email is locked for a cooldown. Reset on a successful sign-in.
 *  2. Anti-bot (signup): a honeypot field, a disposable/temporary-email domain
 *     block list, and an optional minimum form-fill-time check.
 *  3. Registration control: an admin-controllable mode (open | invite_only |
 *     closed) plus a per-day signup cap.
 *  4. Turnstile (optional, keyless): Cloudflare Turnstile is ONLY enforced when
 *     both `TURNSTILE_SECRET` and `VITE_TURNSTILE_SITE_KEY` are configured.
 *     Otherwise signup runs keyless with no captcha dependency.
 *
 * Security notes:
 *  - Errors are intentionally generic where appropriate so we never disclose
 *    whether a given email exists (no user enumeration).
 *  - No secrets are logged.
 *  - The in-memory limiters reuse the project's `createRateLimiter` pattern;
 *    for a single Railway instance this is sufficient. (Multi-instance would
 *    require a shared store such as Redis — noted for future scaling.)
 *
 * @module integrations/auth/abuse-guard
 */

import { and, count, eq, gt, gte } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { env } from "@/utils/env";
import { createRateLimiter } from "@/utils/rate-limit";
import { schema } from "../drizzle";
import { FORM_RENDER_TS_FIELD, HONEYPOT_FIELD, MIN_FILL_TIME_MS } from "./abuse-guard-constants";

// Re-export the client-safe constants so server callers can import everything
// from this module.
export { FORM_RENDER_TS_FIELD, HONEYPOT_FIELD, MIN_FILL_TIME_MS };

// ────────────────────────────────────────────────────────────────────────────
// Disposable / temporary email domain block list
// ────────────────────────────────────────────────────────────────────────────

/**
 * Known disposable / throwaway email domains. Not exhaustive (an exhaustive
 * list is huge and changes constantly) — this blocks the most common services
 * abused for spam signups. Easy to extend.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
	"mailinator.com",
	"yopmail.com",
	"yopmail.fr",
	"yopmail.net",
	"guerrillamail.com",
	"guerrillamail.net",
	"guerrillamail.org",
	"guerrillamail.biz",
	"sharklasers.com",
	"grr.la",
	"10minutemail.com",
	"10minutemail.net",
	"tempmail.com",
	"temp-mail.org",
	"tempmail.net",
	"tmpmail.org",
	"tmpmail.net",
	"throwawaymail.com",
	"getnada.com",
	"nada.email",
	"dispostable.com",
	"mailnesia.com",
	"trashmail.com",
	"trashmail.net",
	"maildrop.cc",
	"mailcatch.com",
	"fakeinbox.com",
	"spambog.com",
	"mohmal.com",
	"emailondeck.com",
	"mintemail.com",
	"discard.email",
	"maileater.com",
	"spam4.me",
	"jetable.org",
	"33mail.com",
	"mailto.plus",
	"fakemail.net",
	"tempr.email",
	"luxusmail.org",
	"einrot.com",
	"yedi.org",
	"moakt.com",
	"inboxkitten.com",
]);

/**
 * Returns true if the email uses a known disposable / temporary domain.
 * Comparison is on the lower-cased domain part after the last `@`.
 */
export function isDisposableEmail(email: string): boolean {
	const at = email.lastIndexOf("@");
	if (at === -1) return false;
	const domain = email
		.slice(at + 1)
		.trim()
		.toLowerCase();
	if (!domain) return false;
	return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

// ────────────────────────────────────────────────────────────────────────────
// Per-email failed-login lockout (brute-force defence)
// ────────────────────────────────────────────────────────────────────────────

/** Max failed login attempts per email before the account is temporarily locked. */
export const MAX_FAILED_LOGINS = 5;
/** Window / cooldown for the failed-login lockout (15 minutes). */
export const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;

/**
 * In-memory limiter keyed by email that tracks failed login attempts. After
 * MAX_FAILED_LOGINS failures within the window, `recordFailedLogin` reports the
 * email as locked until the window resets. Reset on successful sign-in.
 */
const failedLoginLimiter = createRateLimiter({
	maxRequests: MAX_FAILED_LOGINS,
	windowMs: FAILED_LOGIN_WINDOW_MS,
	keyPrefix: "login-fail",
});

/** Normalises an identifier (email/username) into a stable lockout key. */
function lockoutKey(identifier: string): string {
	return identifier.trim().toLowerCase();
}

/**
 * Returns lock status for an identifier WITHOUT consuming an attempt. Used as a
 * pre-check before Better Auth verifies the password, so a locked account is
 * rejected even with the correct password during cooldown.
 */
export async function isLoginLocked(identifier: string): Promise<{ locked: boolean; retryAfter: number }> {
	const status = await failedLoginLimiter.status(lockoutKey(identifier));
	return { locked: !status.allowed, retryAfter: status.retryAfter ?? 0 };
}

/**
 * Records a failed login attempt for an identifier and returns whether the
 * identifier is now locked. Call this AFTER Better Auth reports invalid creds.
 */
export async function recordFailedLogin(identifier: string): Promise<{ locked: boolean; retryAfter: number }> {
	const result = await failedLoginLimiter.check(lockoutKey(identifier));
	return { locked: !result.allowed, retryAfter: result.retryAfter ?? 0 };
}

/** Clears the failed-login counter for an identifier (call on success). */
export async function clearFailedLogins(identifier: string): Promise<void> {
	await failedLoginLimiter.reset(lockoutKey(identifier));
}

// ────────────────────────────────────────────────────────────────────────────
// Registration mode (admin DB-backed setting with env fallback)
// ────────────────────────────────────────────────────────────────────────────

export type RegistrationMode = "open" | "invite_only" | "closed";

/** Stable app_setting key under which the registration mode is stored. */
export const REGISTRATION_MODE_KEY = "registration_mode" as const;

const VALID_MODES: readonly RegistrationMode[] = ["open", "invite_only", "closed"];

function isRegistrationMode(value: unknown): value is RegistrationMode {
	return typeof value === "string" && (VALID_MODES as readonly string[]).includes(value);
}

/**
 * Resolves the effective registration mode. The DB-backed admin setting takes
 * precedence; the `REGISTRATION_MODE` env var is the fallback default when no
 * row exists. Any DB error falls back to the env default (fail-open to env,
 * never crash signup resolution).
 */
export async function getRegistrationMode(): Promise<RegistrationMode> {
	try {
		const [row] = await db
			.select({ value: schema.appSetting.value })
			.from(schema.appSetting)
			.where(eq(schema.appSetting.key, REGISTRATION_MODE_KEY))
			.limit(1);
		if (row && isRegistrationMode(row.value)) return row.value;
	} catch {
		// fall through to env default
	}
	return env.REGISTRATION_MODE;
}

/** Persists the registration mode (admin action). */
export async function setRegistrationMode(mode: RegistrationMode, updatedBy?: string): Promise<void> {
	await db
		.insert(schema.appSetting)
		.values({ key: REGISTRATION_MODE_KEY, value: mode, updatedBy: updatedBy ?? null })
		.onConflictDoUpdate({
			target: schema.appSetting.key,
			set: { value: mode, updatedAt: new Date(), updatedBy: updatedBy ?? null },
		});
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers used by the signup gate
// ────────────────────────────────────────────────────────────────────────────

/** True when the email has a still-valid pending partner invite. */
export async function hasPendingPartnerInvite(emailLower: string): Promise<boolean> {
	try {
		const [invite] = await db
			.select({ id: schema.partnerInvite.id })
			.from(schema.partnerInvite)
			.where(
				and(
					eq(schema.partnerInvite.email, emailLower),
					eq(schema.partnerInvite.status, "pending"),
					gt(schema.partnerInvite.expiresAt, new Date()),
				),
			)
			.limit(1);
		return !!invite;
	} catch {
		return false;
	}
}

/** Count of users created since UTC midnight today. */
export async function getTodaySignupCount(): Promise<number> {
	const startOfDayUtc = new Date();
	startOfDayUtc.setUTCHours(0, 0, 0, 0);
	const [row] = await db.select({ c: count() }).from(schema.user).where(gte(schema.user.createdAt, startOfDayUtc));
	return Number(row?.c ?? 0);
}

// ────────────────────────────────────────────────────────────────────────────
// Turnstile (optional, keyless by default)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Turnstile is only active when BOTH the server secret and the client site key
 * are configured. This keeps the system fully keyless until the orchestrator
 * sets the Railway env vars — no code change required to enable it.
 */
export function isTurnstileEnabled(): boolean {
	return !!env.TURNSTILE_SECRET && !!env.VITE_TURNSTILE_SITE_KEY;
}

/**
 * Verifies a Turnstile token server-side via Cloudflare siteverify.
 * Returns true on success. When Turnstile is not enabled, always returns true
 * (the caller should not have collected a token in keyless mode).
 */
export async function verifyTurnstileToken(token: string | undefined, remoteIp?: string | null): Promise<boolean> {
	if (!isTurnstileEnabled()) return true;
	if (!token) return false;

	try {
		const form = new URLSearchParams();
		form.set("secret", env.TURNSTILE_SECRET as string);
		form.set("response", token);
		if (remoteIp) form.set("remoteip", remoteIp);

		const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: form,
		});
		if (!res.ok) return false;
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

// ────────────────────────────────────────────────────────────────────────────
// Signup gate — single entry point applying all keyless checks
// ────────────────────────────────────────────────────────────────────────────

/** Stable error codes; surfaced to the client which maps them to French copy. */
export type SignupRejectionCode =
	| "HONEYPOT"
	| "TOO_FAST"
	| "DISPOSABLE_EMAIL"
	| "REGISTRATION_CLOSED"
	| "INVITE_ONLY"
	| "DAILY_CAP_REACHED"
	| "CAPTCHA_REQUIRED"
	| "CAPTCHA_FAILED";

export interface SignupGateInput {
	email: string;
	/** Honeypot field value — must be empty for a human. */
	honeypot?: unknown;
	/** Epoch-ms timestamp captured when the form was rendered (optional). */
	formRenderTs?: unknown;
	/** Turnstile token (only present/checked when Turnstile is enabled). */
	turnstileToken?: string;
	/** Client IP for Turnstile remoteip (optional). */
	remoteIp?: string | null;
}

export interface SignupGateResult {
	ok: boolean;
	code?: SignupRejectionCode;
	/** French, user-facing message for the rejection. */
	message?: string;
}

/** French messages, keyed by rejection code. */
const FRENCH_MESSAGES: Record<SignupRejectionCode, string> = {
	HONEYPOT: "Inscription refusée. Veuillez réessayer.",
	TOO_FAST: "Formulaire envoyé trop rapidement. Veuillez réessayer.",
	DISPOSABLE_EMAIL: "Les adresses e-mail temporaires ou jetables ne sont pas autorisées.",
	REGISTRATION_CLOSED: "Les inscriptions sont actuellement fermées.",
	INVITE_ONLY: "Les inscriptions sont sur invitation uniquement pour le moment.",
	DAILY_CAP_REACHED: "La limite d'inscriptions pour aujourd'hui est atteinte. Veuillez réessayer demain.",
	CAPTCHA_REQUIRED: "Veuillez compléter la vérification anti-robot.",
	CAPTCHA_FAILED: "Échec de la vérification anti-robot. Veuillez réessayer.",
};

function reject(code: SignupRejectionCode): SignupGateResult {
	return { ok: false, code, message: FRENCH_MESSAGES[code] };
}

/**
 * Runs every keyless anti-abuse + registration-control check for a signup.
 * Returns `{ ok: true }` to allow, or `{ ok: false, code, message }` to reject
 * with a French message. Does NOT perform the partner-promotion logic — that
 * stays in the Better Auth databaseHooks.
 */
export async function evaluateSignup(input: SignupGateInput): Promise<SignupGateResult> {
	const emailLower = input.email.trim().toLowerCase();

	// 1. Honeypot — a filled hidden field means a bot.
	if (typeof input.honeypot === "string" && input.honeypot.trim().length > 0) {
		return reject("HONEYPOT");
	}

	// 2. Min-fill-time — submissions faster than a human are rejected. Only
	//    enforced when a plausible timestamp is supplied (skips silently if not).
	const ts = typeof input.formRenderTs === "number" ? input.formRenderTs : Number(input.formRenderTs);
	if (Number.isFinite(ts) && ts > 0) {
		const elapsed = Date.now() - ts;
		// Guard against clock skew / tampering: only reject implausibly fast fills.
		if (elapsed >= 0 && elapsed < MIN_FILL_TIME_MS) {
			return reject("TOO_FAST");
		}
	}

	// 3. Disposable email block.
	if (isDisposableEmail(emailLower)) {
		return reject("DISPOSABLE_EMAIL");
	}

	// 4. Registration mode.
	const mode = await getRegistrationMode();
	if (mode === "closed") {
		return reject("REGISTRATION_CLOSED");
	}
	if (mode === "invite_only") {
		// Only emails with a valid pending partner invite may register for now.
		// (Admin accounts are provisioned out-of-band, not via public signup.)
		const invited = await hasPendingPartnerInvite(emailLower);
		if (!invited) return reject("INVITE_ONLY");
	}

	// 5. Daily signup cap.
	try {
		const todayCount = await getTodaySignupCount();
		if (todayCount >= env.DAILY_SIGNUP_CAP) {
			return reject("DAILY_CAP_REACHED");
		}
	} catch {
		// If the count query fails, do not block signups on a transient DB error.
	}

	// 6. Turnstile (only when enabled).
	if (isTurnstileEnabled()) {
		if (!input.turnstileToken) return reject("CAPTCHA_REQUIRED");
		const verified = await verifyTurnstileToken(input.turnstileToken, input.remoteIp);
		if (!verified) return reject("CAPTCHA_FAILED");
	}

	return { ok: true };
}
