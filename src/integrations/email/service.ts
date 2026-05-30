import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/utils/env";

type SendEmailOptions = {
	to: string | string[];
	subject: string;
	text: string;
	/** Optional HTML body. When omitted, `text` is sent as the only content. */
	html?: string;
	/** Full "Name <email>" override. Defaults to the configured sender identity. */
	from?: string;
	/** Reply-To address override. Defaults to EMAIL_REPLY_TO when set. */
	replyTo?: string;
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/** Brevo transactional API is preferred when an API key + verified sender are set. */
export const isBrevoEnabled = () => !!env.BREVO_API_KEY && !!env.EMAIL_FROM;

/** SMTP is the fallback transport when Brevo is not configured. */
export const isSmtpEnabled = () => !!env.SMTP_HOST && !!env.SMTP_USER && !!env.SMTP_PASS && !!env.SMTP_FROM;

/** Whether ANY real transport is configured (otherwise sends are logged in dev). */
export const isEmailEnabled = () => isBrevoEnabled() || isSmtpEnabled();

/** Parse a "Name <email>" string (or bare address) into its parts. */
function parseAddress(value: string): { name?: string; email: string } {
	const match = value.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
	if (match) {
		const name = match[1]?.replace(/^"|"$/g, "").trim();
		return { name: name || undefined, email: match[2].trim() };
	}
	return { email: value.trim() };
}

/** Resolve the sender identity for the current transport. */
function resolveSender(from?: string): { name?: string; email: string; raw: string } {
	if (from) {
		const parsed = parseAddress(from);
		return { ...parsed, raw: from };
	}
	if (env.EMAIL_FROM) {
		const name = env.EMAIL_FROM_NAME;
		return { name, email: env.EMAIL_FROM, raw: name ? `${name} <${env.EMAIL_FROM}>` : env.EMAIL_FROM };
	}
	if (env.SMTP_FROM) {
		return { ...parseAddress(env.SMTP_FROM), raw: env.SMTP_FROM };
	}
	return { name: "IMTA Resume", email: "noreply@localhost", raw: "IMTA Resume <noreply@localhost>" };
}

// ── Brevo transactional API ──────────────────────────────────────────────────
async function sendViaBrevo(options: SendEmailOptions): Promise<boolean> {
	const sender = resolveSender(options.from);
	const recipients = (Array.isArray(options.to) ? options.to : [options.to]).map((email) => ({ email }));
	const replyTo = options.replyTo ?? env.EMAIL_REPLY_TO;

	const payload: Record<string, unknown> = {
		sender: sender.name ? { name: sender.name, email: sender.email } : { email: sender.email },
		to: recipients,
		subject: options.subject,
		textContent: options.text,
		...(options.html ? { htmlContent: options.html } : {}),
		...(replyTo ? { replyTo: { email: replyTo } } : {}),
	};

	const res = await fetch(BREVO_ENDPOINT, {
		method: "POST",
		headers: {
			"api-key": env.BREVO_API_KEY as string,
			"Content-Type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		console.error(`[EMAIL] Brevo API send failed (${res.status}):`, detail.slice(0, 500));
		return false;
	}
	return true;
}

// ── SMTP (nodemailer) ────────────────────────────────────────────────────────
let cachedTransport: Transporter | undefined;

const getTransport = () => {
	if (!isSmtpEnabled()) return;
	if (cachedTransport) return cachedTransport;

	cachedTransport = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		auth: {
			// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
			user: env.SMTP_USER!,
			// biome-ignore lint/style/noNonNullAssertion: enabled check ensures these are not null
			pass: env.SMTP_PASS!,
		},
	});

	return cachedTransport;
};

async function sendViaSmtp(options: SendEmailOptions): Promise<boolean> {
	const transport = getTransport();
	if (!transport) return false;
	const sender = resolveSender(options.from);
	const replyTo = options.replyTo ?? env.EMAIL_REPLY_TO;
	try {
		await transport.sendMail({
			to: options.to,
			from: sender.raw,
			subject: options.subject,
			text: options.text,
			...(options.html ? { html: options.html } : {}),
			...(replyTo ? { replyTo } : {}),
		});
		return true;
	} catch (error) {
		console.error("[EMAIL] SMTP send failed:", error);
		return false;
	}
}

/**
 * Send a transactional email. Routes through Brevo's API when configured,
 * otherwise SMTP, otherwise logs the payload (dev only). Never throws — a
 * delivery failure must not break the auth flow that triggered it.
 */
export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
	if (isBrevoEnabled()) {
		const ok = await sendViaBrevo(options);
		if (ok) return;
		// fall through to SMTP if Brevo failed and SMTP is also configured
	}

	if (isSmtpEnabled()) {
		const ok = await sendViaSmtp(options);
		if (ok) return;
	}

	if (!isEmailEnabled() && process.env.NODE_ENV !== "production") {
		console.debug("[EMAIL] No transport configured; would send:", {
			to: options.to,
			subject: options.subject,
		});
		return;
	}

	if (isEmailEnabled()) {
		console.error("[EMAIL] All configured transports failed to deliver:", {
			to: options.to,
			subject: options.subject,
		});
	}
};
