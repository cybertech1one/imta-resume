import { BetterAuthError } from "@better-auth/core/error";
import { passkey } from "@better-auth/passkey";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { apiKey, type GenericOAuthConfig, genericOAuth, twoFactor } from "better-auth/plugins";
import { username } from "better-auth/plugins/username";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq, gt, or } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { env } from "@/utils/env";
import { hashPassword, verifyPassword } from "@/utils/password";
import { generateId, toUsername } from "@/utils/string";
import { schema } from "../drizzle";
import { sendEmail } from "../email/service";
import { changeEmailConfirmationEmail, passwordResetEmail, verificationEmail } from "../email/templates";
import {
	clearFailedLogins,
	evaluateSignup,
	FORM_RENDER_TS_FIELD,
	HONEYPOT_FIELD,
	isLoginLocked,
	recordFailedLogin,
} from "./abuse-guard";

/** Sign-in endpoint paths guarded by the per-email failed-attempt lockout. */
const SIGN_IN_PATHS = new Set(["/sign-in/email", "/sign-in/username"]);

/** Extracts the client IP from forwarding headers for Turnstile remoteip. */
function clientIpFromHeaders(headers: Headers | undefined): string | null {
	if (!headers) return null;
	const fwd = headers.get("x-forwarded-for");
	if (fwd) return fwd.split(",")[0]?.trim() ?? null;
	return headers.get("x-real-ip");
}

/** Reads the login identifier (email or username) from a sign-in request body. */
function loginIdentifier(body: Record<string, unknown> | undefined): string | null {
	if (!body) return null;
	const email = typeof body.email === "string" ? body.email : null;
	const uname = typeof body.username === "string" ? body.username : null;
	return email ?? uname;
}

function isCustomOAuthProviderEnabled() {
	const hasDiscovery = Boolean(env.OAUTH_DISCOVERY_URL);
	const hasManual =
		Boolean(env.OAUTH_AUTHORIZATION_URL) && Boolean(env.OAUTH_TOKEN_URL) && Boolean(env.OAUTH_USER_INFO_URL);

	return Boolean(env.OAUTH_CLIENT_ID) && Boolean(env.OAUTH_CLIENT_SECRET) && (hasDiscovery || hasManual);
}

const getAuthConfig = () => {
	const authConfigs: GenericOAuthConfig[] = [];

	if (isCustomOAuthProviderEnabled()) {
		authConfigs.push({
			providerId: "custom",
			disableSignUp: env.FLAG_DISABLE_SIGNUPS,
			clientId: env.OAUTH_CLIENT_ID as string,
			clientSecret: env.OAUTH_CLIENT_SECRET as string,
			discoveryUrl: env.OAUTH_DISCOVERY_URL,
			authorizationUrl: env.OAUTH_AUTHORIZATION_URL,
			tokenUrl: env.OAUTH_TOKEN_URL,
			userInfoUrl: env.OAUTH_USER_INFO_URL,
			scopes: env.OAUTH_SCOPES,
			redirectURI: `${env.APP_URL}/api/auth/oauth2/callback/custom`,
			mapProfileToUser: async (profile) => {
				if (!profile.email) {
					throw new BetterAuthError(
						"OAuth Provider did not return an email address. This is required for user creation.",
						{ cause: "EMAIL_REQUIRED" },
					);
				}

				const email = profile.email;
				const name = profile.name ?? profile.preferred_username ?? email.split("@")[0];
				const username = profile.preferred_username ?? email.split("@")[0];
				const image = profile.image ?? profile.picture ?? profile.avatar_url;

				return {
					name,
					email,
					image,
					username,
					displayUsername: username,
					emailVerified: true,
				};
			},
		} satisfies GenericOAuthConfig);
	}

	// Determine if running in production (HTTPS)
	const isProduction = env.APP_URL.startsWith("https://");

	return betterAuth({
		appName: "IMTA Resume",

		baseURL: env.APP_URL,
		secret: env.AUTH_SECRET,

		database: drizzleAdapter(db, { schema, provider: "pg" }),

		telemetry: { enabled: false },
		trustedOrigins: [
			env.APP_URL,
			...(env.APP_URL.includes("localhost") ? [env.APP_URL.replace("localhost", "127.0.0.1")] : []),
		],

		// ──────────────────────────────────────────────────────────────────────
		// Brute-force / abuse throttling (IP-based, Better Auth built-in).
		// A sane global window protects ALL auth endpoints; customRules tighten
		// the credential endpoints. This is layered with the per-EMAIL lockout
		// enforced in the hooks below.
		// ──────────────────────────────────────────────────────────────────────
		rateLimit: {
			enabled: true,
			window: 60, // seconds
			max: 60, // global: 60 auth requests / minute / IP
			customRules: {
				// Login: 5 attempts / 60s / IP.
				"/sign-in/email": { window: 60, max: 5 },
				"/sign-in/username": { window: 60, max: 5 },
				// Signup: 3 attempts / 60s / IP (short window) — the per-day cap and
				// per-email lockout provide the longer-window protection.
				"/sign-up/email": { window: 60, max: 3 },
				// Password reset / email verification: prevent email bombing.
				"/forget-password": { window: 60 * 15, max: 3 },
				"/request-password-reset": { window: 60 * 15, max: 3 },
				"/send-verification-email": { window: 60 * 15, max: 3 },
			},
		},

		// ──────────────────────────────────────────────────────────────────────
		// Abuse-guard hooks:
		//  - before: pre-check per-email login lockout; run keyless signup checks
		//    (honeypot, disposable email, registration mode/cap, Turnstile).
		//  - after: record failed logins / clear on success for the lockout.
		// ──────────────────────────────────────────────────────────────────────
		hooks: {
			before: createAuthMiddleware(async (ctx) => {
				const path = ctx.path;

				// Per-email failed-login lockout pre-check.
				if (SIGN_IN_PATHS.has(path)) {
					const identifier = loginIdentifier(ctx.body as Record<string, unknown> | undefined);
					if (identifier) {
						const { locked, retryAfter } = await isLoginLocked(identifier);
						if (locked) {
							const minutes = Math.max(1, Math.ceil(retryAfter / 60));
							throw new APIError("TOO_MANY_REQUESTS", {
								message: `Trop de tentatives de connexion. Réessayez dans environ ${minutes} minute(s).`,
							});
						}
					}
					return;
				}

				// Keyless signup gate.
				if (path === "/sign-up/email") {
					const body = (ctx.body ?? {}) as Record<string, unknown>;
					const email = typeof body.email === "string" ? body.email : "";
					if (!email) return; // let Better Auth's own validation handle it

					const result = await evaluateSignup({
						email,
						honeypot: body[HONEYPOT_FIELD],
						formRenderTs: body[FORM_RENDER_TS_FIELD],
						turnstileToken: typeof body.turnstileToken === "string" ? body.turnstileToken : undefined,
						remoteIp: clientIpFromHeaders(ctx.headers),
					});

					if (!result.ok) {
						throw new APIError("BAD_REQUEST", {
							message: result.message ?? "Inscription refusée.",
							code: result.code,
						});
					}
				}
			}),
			after: createAuthMiddleware(async (ctx) => {
				if (!SIGN_IN_PATHS.has(ctx.path)) return;

				const identifier = loginIdentifier(ctx.body as Record<string, unknown> | undefined);
				if (!identifier) return;

				// Success: a new session was created → clear the failure counter.
				if (ctx.context.newSession) {
					await clearFailedLogins(identifier);
					return;
				}

				// Failure: the endpoint returned an error (bad credentials, etc.)
				// → record a failed attempt toward the lockout threshold.
				const returned = ctx.context.returned;
				const isError =
					returned instanceof APIError ||
					returned instanceof Error ||
					(typeof returned === "object" && returned !== null && "status" in returned && !("token" in returned));
				if (isError) {
					await recordFailedLogin(identifier);
				}
			}),
		},

		// Session security configuration
		session: {
			// Session expires after 7 days of inactivity
			expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
			// Update session expiry on each request to keep active sessions alive
			updateAge: 60 * 60 * 24, // 24 hours - update session if older than this
		},

		advanced: {
			database: { generateId },
			// Security: Use secure cookies in production (HTTPS only)
			useSecureCookies: isProduction,
			// Security: Set SameSite to strict for CSRF protection
			// 'lax' allows OAuth redirects to work while still providing CSRF protection
			cookieOptions: {
				sameSite: "lax",
				httpOnly: true,
				secure: isProduction,
				path: "/",
			},
		},

		emailAndPassword: {
			enabled: !env.FLAG_DISABLE_EMAIL_AUTH,
			autoSignIn: true,
			// Security Policy: Minimum 12 characters required for password strength
			// NIST SP 800-63B recommends minimum 8 characters, but 12+ provides better security
			// against offline brute-force attacks and dictionary attacks
			minPasswordLength: 12,
			maxPasswordLength: 64,
			// Security: Require email verification in production to prevent account abuse
			// and ensure valid contact information for password recovery.
			// Can be temporarily disabled via DISABLE_EMAIL_VERIFICATION (e.g. initial deploy
			// before SMTP is configured) so users can sign up without a verification email.
			requireEmailVerification: process.env.NODE_ENV === "production" && !env.DISABLE_EMAIL_VERIFICATION,
			disableSignUp: env.FLAG_DISABLE_SIGNUPS || env.FLAG_DISABLE_EMAIL_AUTH,
			sendResetPassword: async ({ user, url }) => {
				const { subject, html, text } = passwordResetEmail(url);
				await sendEmail({ to: user.email, subject, html, text });
			},
			password: {
				hash: (password) => hashPassword(password),
				verify: ({ password, hash }) => verifyPassword(password, hash),
			},
		},

		emailVerification: {
			sendOnSignUp: true,
			autoSignInAfterVerification: true,
			sendVerificationEmail: async ({ user, url }) => {
				const { subject, html, text } = verificationEmail(url);
				await sendEmail({ to: user.email, subject, html, text });
			},
		},

		user: {
			changeEmail: {
				enabled: true,
				sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
					const { subject, html, text } = changeEmailConfirmationEmail({ oldEmail: user.email, newEmail, url });
					await sendEmail({ to: newEmail, subject, html, text });
				},
			},
			additionalFields: {
				username: {
					// Not strictly required as input: when omitted (e.g. a minimal
					// email + password + name signup), the databaseHooks.user.create.before
					// hook below auto-derives a unique username from the email/name.
					type: "string",
					required: false,
				},
				role: {
					type: "string",
					required: false,
					defaultValue: "user",
					input: false,
				},
				imtaProgram: {
					type: "string",
					required: false,
				},
				onboardingCompleted: {
					type: "boolean",
					required: false,
					defaultValue: false,
					input: false,
				},
				preferredAiLanguage: {
					type: "string",
					required: false,
					defaultValue: "fr",
				},
			},
		},

		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ["google", "github"],
			},
		},

		databaseHooks: {
			user: {
				create: {
					// Ensure username/displayUsername are always populated and unique.
					// The `user` table has NOT NULL + UNIQUE constraints on both columns.
					// A minimal signup (email + password + name) does not supply a username,
					// which previously caused the INSERT to fail -> FAILED_TO_CREATE_USER.
					// Here we derive a valid, unique username from the supplied username,
					// the email local-part, or the name as a fallback.
					before: async (userData) => {
						const data = userData as Record<string, unknown> & { email?: string; name?: string };

						const rawCandidate =
							(typeof data.username === "string" && data.username) ||
							(typeof data.email === "string" && data.email.split("@")[0]) ||
							(typeof data.name === "string" && data.name) ||
							"user";

						let base = toUsername(rawCandidate);
						if (base.length < 3) base = toUsername(`${base}user${Math.floor(Math.random() * 1000)}`);

						// Resolve collisions against existing usernames / displayUsernames.
						const candidate = base;
						let attempt = candidate;
						for (let i = 0; i < 50; i++) {
							const [existing] = await db
								.select({ id: schema.user.id })
								.from(schema.user)
								.where(or(eq(schema.user.username, attempt), eq(schema.user.displayUsername, attempt)))
								.limit(1);

							if (!existing) break;

							const suffix = Math.floor(1000 + Math.random() * 9000);
							attempt = toUsername(`${candidate}.${suffix}`);
						}

						// Email-keyed auto-promotion (security gate): if the admin invited
						// this exact email as a partner and the invite is still pending and
						// not expired, the new user is created with role "partner".
						// `role` has input:false so the client cannot set it — only this
						// server-side hook (keyed off a real, admin-created invite) can.
						let role: "user" | "partner" | undefined;
						const emailLower = typeof data.email === "string" ? data.email.trim().toLowerCase() : null;
						if (emailLower) {
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
							if (invite) role = "partner";
						}

						return {
							data: {
								...data,
								...(role ? { role } : {}),
								username: attempt,
								displayUsername:
									typeof data.displayUsername === "string" && data.displayUsername ? data.displayUsername : attempt,
							},
						};
					},
					// After the user row exists, if their email matches a pending partner
					// invite, provision a (pending) partner_profile from the invite data and
					// mark the invite accepted. Guarded against duplicate profiles via the
					// unique userId constraint on partner_profile.
					after: async (createdUser) => {
						const u = createdUser as { id?: string; email?: string };
						const emailLower = typeof u.email === "string" ? u.email.trim().toLowerCase() : null;
						if (!u.id || !emailLower) return;

						try {
							const [invite] = await db
								.select()
								.from(schema.partnerInvite)
								.where(
									and(
										eq(schema.partnerInvite.email, emailLower),
										eq(schema.partnerInvite.status, "pending"),
										gt(schema.partnerInvite.expiresAt, new Date()),
									),
								)
								.limit(1);

							if (!invite) return;

							// Provision the partner profile best-effort. A failure here (transient
							// DB error, race) must NOT leave the invite pending — the before-hook
							// already granted partner role and the email is now taken, so a lingering
							// "pending" invite is just a reuse hazard. We therefore consume the invite
							// regardless; a missing profile is completed via the profile setup UI.
							try {
								// Guard: only create a profile if the user does not already have one.
								const [existingProfile] = await db
									.select({ id: schema.partnerProfile.id })
									.from(schema.partnerProfile)
									.where(eq(schema.partnerProfile.userId, u.id))
									.limit(1);

								if (!existingProfile) {
									const partnerType = (
										["employer", "recruiter", "training_center", "government", "ngo"].includes(invite.partnerType)
											? invite.partnerType
											: "employer"
									) as "employer" | "recruiter" | "training_center" | "government" | "ngo";

									await db.insert(schema.partnerProfile).values({
										userId: u.id,
										companyName: invite.companyName,
										companyNameFr: invite.companyNameFr ?? null,
										partnerType,
										// Required NOT NULL columns get safe placeholders the partner
										// completes via the profile setup UI.
										industry: "À compléter",
										description: "À compléter",
										headquarters: "À compléter",
										contactEmail: emailLower,
										status: "pending",
									});
								}
							} catch (profileError) {
								console.error("[partner-invite] Profile provisioning failed; consuming invite anyway:", profileError);
							}

							// Always consume the invite so it cannot be reused.
							await db
								.update(schema.partnerInvite)
								.set({ status: "accepted", acceptedUserId: u.id, updatedAt: new Date() })
								.where(eq(schema.partnerInvite.id, invite.id));
						} catch (error) {
							// Never block signup on partner provisioning failure.
							console.error("[partner-invite] Failed to provision partner profile on signup:", error);
						}
					},
				},
			},
		},

		socialProviders: {
			google: {
				enabled: !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET,
				disableSignUp: env.FLAG_DISABLE_SIGNUPS,
				// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
				clientId: env.GOOGLE_CLIENT_ID!,
				// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
				clientSecret: env.GOOGLE_CLIENT_SECRET!,
				mapProfileToUser: async (profile) => {
					return {
						name: profile.name,
						email: profile.email,
						image: profile.picture,
						username: profile.email.split("@")[0],
						displayUsername: profile.email.split("@")[0],
						emailVerified: true,
					};
				},
			},

			github: {
				enabled: !!env.GITHUB_CLIENT_ID && !!env.GITHUB_CLIENT_SECRET,
				disableSignUp: env.FLAG_DISABLE_SIGNUPS,
				// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
				clientId: env.GITHUB_CLIENT_ID!,
				// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
				clientSecret: env.GITHUB_CLIENT_SECRET!,
				mapProfileToUser: async (profile) => {
					const login = profile.login ?? String(profile.id);
					const normalizedLogin = toUsername(login);
					const [legacyAccount] = await db
						.select({
							accountId: schema.account.accountId,
							email: schema.user.email,
							emailVerified: schema.user.emailVerified,
							username: schema.user.username,
							displayUsername: schema.user.displayUsername,
						})
						.from(schema.account)
						.innerJoin(schema.user, eq(schema.account.userId, schema.user.id))
						.where(
							and(
								eq(schema.account.providerId, "github"),
								or(eq(schema.user.username, normalizedLogin), eq(schema.user.displayUsername, login)),
							),
						)
						.limit(1);

					if (legacyAccount) {
						return {
							id: legacyAccount.accountId,
							name: profile.name,
							email: legacyAccount.email,
							image: profile.avatar_url,
							username: legacyAccount.username,
							displayUsername: legacyAccount.displayUsername,
							emailVerified: legacyAccount.emailVerified,
						};
					}

					return {
						name: profile.name,
						email: profile.email,
						image: profile.avatar_url,
						username: normalizedLogin,
						displayUsername: login,
						emailVerified: true,
					};
				},
			},
		},

		plugins: [
			apiKey({
				enableSessionForAPIKeys: true,
				rateLimit: {
					enabled: true,
					timeWindow: 1000 * 60 * 60 * 24, // 1 day
					maxRequests: 500, // 500 requests per day
				},
			}),
			username({
				minUsernameLength: 3,
				maxUsernameLength: 64,
				usernameNormalization: (value) => toUsername(value),
				displayUsernameNormalization: (value) => toUsername(value),
				usernameValidator: (username) => /^[a-z0-9._-]+$/.test(username),
				validationOrder: { username: "post-normalization", displayUsername: "post-normalization" },
			}),
			twoFactor({
				issuer: "IMTA Resume",
			}),
			passkey({
				origin: env.APP_URL,
				rpName: "IMTA Resume",
				rpID: new URL(env.APP_URL).hostname,
			}),
			genericOAuth({
				config: authConfigs,
			}),
			tanstackStartCookies(),
		],
	});
};

export const auth = getAuthConfig();
