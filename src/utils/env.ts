import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	runtimeEnv: typeof process !== "undefined" ? process.env : {},
	emptyStringAsUndefined: true,

	server: {
		// Server
		TZ: z.string().default("Etc/UTC"),
		APP_URL: z.url({ protocol: /https?/ }),
		PRINTER_APP_URL: z.url({ protocol: /https?/ }).optional(),

		// Printer
		PRINTER_ENDPOINT: z.url({ protocol: /^(wss?|https?)$/ }),

		// Database
		DATABASE_URL: z.url({ protocol: /postgres(ql)?/ }),

		// Authentication
		AUTH_SECRET: z.string().min(1),

		// Social Auth (Google)
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

		// Social Auth (GitHub)
		GITHUB_CLIENT_ID: z.string().min(1).optional(),
		GITHUB_CLIENT_SECRET: z.string().min(1).optional(),

		// Custom OAuth Provider
		OAUTH_PROVIDER_NAME: z.string().min(1).optional(),
		OAUTH_CLIENT_ID: z.string().min(1).optional(),
		OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
		OAUTH_DISCOVERY_URL: z.url({ protocol: /https?/ }).optional(),
		OAUTH_AUTHORIZATION_URL: z.url({ protocol: /https?/ }).optional(),
		OAUTH_TOKEN_URL: z.url({ protocol: /https?/ }).optional(),
		OAUTH_USER_INFO_URL: z.url({ protocol: /https?/ }).optional(),
		OAUTH_SCOPES: z
			.string()
			.min(1)
			.transform((value) => value.split(" "))
			.default(["openid", "profile", "email"]),

		// Email (SMTP)
		SMTP_HOST: z.string().min(1).optional(),
		SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
		SMTP_USER: z.string().min(1).optional(),
		SMTP_PASS: z.string().min(1).optional(),
		SMTP_FROM: z.string().min(1).optional(),
		SMTP_SECURE: z
			.string()
			.default("false")
			.transform((val) => val === "true"),
		// Set to "true" to allow sign-up without email verification (e.g. initial deploy before SMTP is wired).
		// Leave false/unset in normal production once email works.
		DISABLE_EMAIL_VERIFICATION: z
			.string()
			.default("false")
			.transform((val) => val === "true"),

		// Storage (Optional)
		S3_ACCESS_KEY_ID: z.string().min(1).optional(),
		S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
		S3_REGION: z.string().default("us-east-1"),
		S3_ENDPOINT: z.url({ protocol: /https?/ }).optional(),
		S3_BUCKET: z.string().min(1).optional(),
		// Set to "true" for path-style URLs (endpoint/bucket), common with MinIO, SeaweedFS, etc.
		// Set to "false" for virtual-hosted-style URLs (bucket.endpoint), common with AWS S3, Cloudflare R2, etc.
		S3_FORCE_PATH_STYLE: z
			.string()
			.default("false")
			.transform((val) => val === "true"),

		// Feature Flags
		FLAG_DEBUG_PRINTER: z
			.string()
			.default("false")
			.transform((val) => val === "true"),
		FLAG_DISABLE_SIGNUPS: z
			.string()
			.default("false")
			.transform((val) => val === "true"),
		FLAG_DISABLE_EMAIL_AUTH: z
			.string()
			.default("false")
			.transform((val) => val === "true"),

		// ──────────────────────────────────────────────────────────────────────
		// Auth Abuse Protection (anti-spam / anti-bot / brute-force)
		// All optional with safe defaults — the app is fully protected (honeypot,
		// disposable-email block, throttling, per-email lockout) WITHOUT any of
		// these being set. They only tune behaviour or enable Turnstile.
		// ──────────────────────────────────────────────────────────────────────

		// Registration mode env fallback. The admin DB-backed setting (app_setting
		// key "registration_mode") takes precedence when present; this env value is
		// the default used when no DB row exists yet.
		//   open        → anyone may register (default for the controlled launch)
		//   invite_only → only emails with a valid pending partner invite (or admins)
		//   closed      → no new signups at all
		REGISTRATION_MODE: z.enum(["open", "invite_only", "closed"]).default("open"),

		// Maximum number of NEW signups allowed per calendar day (UTC). Once
		// exceeded, further signups are rejected with a clear French message until
		// the next day. Default tuned for a ~200-student controlled launch.
		DAILY_SIGNUP_CAP: z.coerce.number().int().min(1).default(200),

		// Cloudflare Turnstile (KEYLESS by default). Captcha is ONLY enforced when
		// BOTH the site key and secret are set. If either is missing, signup runs
		// in keyless mode (honeypot + disposable-email block only). No code change
		// is needed to enable Turnstile later — just set both vars.
		// The site key is also exposed to the client via VITE_TURNSTILE_SITE_KEY.
		TURNSTILE_SECRET: z.string().min(1).optional(),
	},

	client: {
		// Public Turnstile site key — safe to expose to the browser. When set
		// (together with the server-side TURNSTILE_SECRET), the register form
		// renders the Turnstile widget. Leave unset for keyless mode.
		VITE_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
	},
});
