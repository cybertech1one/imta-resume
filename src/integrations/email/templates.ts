// French-first, IMTA-branded transactional email templates.
// Each builder returns { subject, html, text } ready for sendEmail().
// HTML uses inline styles only (email clients strip <style> blocks) and the
// IMTA palette (emerald → teal). Plain-text is always provided as a fallback.
import { env } from "@/utils/env";

const BRAND = {
	name: "IMTA Resume",
	emerald: "#059669",
	teal: "#0d9488",
	ink: "#0f172a",
	muted: "#64748b",
	border: "#e2e8f0",
	bg: "#f1f5f9",
	card: "#ffffff",
};

/** Absolute app URL with no trailing slash (used for footer links). */
function appUrl(): string {
	return env.APP_URL.replace(/\/$/, "");
}

type LayoutOptions = {
	preheader: string;
	heading: string;
	/** One or more paragraphs of body copy (plain strings, HTML-escaped by caller if needed). */
	paragraphs: string[];
	cta?: { label: string; url: string };
	/** Small muted note shown under the CTA (e.g. link fallback, expiry, ignore notice). */
	note?: string;
};

/** Shared responsive email shell. Bulletproof button, mobile-friendly widths. */
function layout({ preheader, heading, paragraphs, cta, note }: LayoutOptions): string {
	const body = paragraphs
		.map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.ink};">${p}</p>`)
		.join("");

	const button = cta
		? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
				<tr><td align="center" style="border-radius:10px;background:linear-gradient(135deg,${BRAND.emerald},${BRAND.teal});">
					<a href="${cta.url}" target="_blank" rel="noopener"
						style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
						${cta.label}
					</a>
				</td></tr>
			</table>`
		: "";

	const noteHtml = note
		? `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${BRAND.muted};">${note}</p>`
		: "";

	return `<!doctype html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="color-scheme" content="light">
	<title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
	<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
		<tr><td align="center">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
				<tr><td style="background:linear-gradient(135deg,${BRAND.emerald},${BRAND.teal});padding:24px 32px;">
					<span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">IMTA&nbsp;Resume</span>
				</td></tr>
				<tr><td style="padding:32px;">
					<h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:${BRAND.ink};font-weight:700;">${heading}</h1>
					${body}
					${button}
					${noteHtml}
				</td></tr>
				<tr><td style="padding:20px 32px;border-top:1px solid ${BRAND.border};">
					<p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">
						${BRAND.name} — Plateforme de CV de l'Institut des Métiers et Techniques Appliquées.<br>
						<a href="${appUrl()}" style="color:${BRAND.teal};text-decoration:none;">${appUrl().replace(/^https?:\/\//, "")}</a>
					</p>
				</td></tr>
			</table>
			<p style="max-width:560px;margin:16px auto 0;font-size:11px;line-height:1.5;color:${BRAND.muted};text-align:center;">
				Vous recevez cet e-mail car une action a été demandée sur votre compte IMTA Resume.
			</p>
		</td></tr>
	</table>
</body>
</html>`;
}

export type EmailContent = { subject: string; html: string; text: string };

/** Password reset email (forgot-password flow). */
export function passwordResetEmail(url: string): EmailContent {
	return {
		subject: "Réinitialisez votre mot de passe IMTA Resume",
		html: layout({
			preheader: "Lien de réinitialisation de votre mot de passe (valable 1 heure).",
			heading: "Réinitialisation de votre mot de passe",
			paragraphs: [
				"Vous avez demandé à réinitialiser le mot de passe de votre compte IMTA Resume.",
				"Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable pendant une heure.",
			],
			cta: { label: "Réinitialiser mon mot de passe", url },
			note: `Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${url}" style="color:${BRAND.teal};word-break:break-all;">${url}</a><br><br>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre mot de passe restera inchangé.`,
		}),
		text:
			`Réinitialisation de votre mot de passe IMTA Resume\n\n` +
			`Vous avez demandé à réinitialiser le mot de passe de votre compte.\n` +
			`Ouvrez ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n${url}\n\n` +
			`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
	};
}

/** Email-verification email (sent on sign-up). */
export function verificationEmail(url: string): EmailContent {
	return {
		subject: "Confirmez votre adresse e-mail — IMTA Resume",
		html: layout({
			preheader: "Confirmez votre adresse pour activer votre compte IMTA Resume.",
			heading: "Bienvenue ! Confirmez votre e-mail",
			paragraphs: [
				"Merci d'avoir créé un compte sur IMTA Resume.",
				"Pour activer votre compte et commencer à créer votre CV, confirmez votre adresse e-mail en cliquant ci-dessous.",
			],
			cta: { label: "Confirmer mon e-mail", url },
			note: `Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${url}" style="color:${BRAND.teal};word-break:break-all;">${url}</a>`,
		}),
		text:
			`Bienvenue sur IMTA Resume !\n\n` +
			`Pour activer votre compte, confirmez votre adresse e-mail en ouvrant ce lien :\n${url}\n\n` +
			`Si vous n'avez pas créé de compte, ignorez cet e-mail.`,
	};
}

/** Change-email confirmation (sent to the NEW address). */
export function changeEmailConfirmationEmail(params: {
	oldEmail: string;
	newEmail: string;
	url: string;
}): EmailContent {
	const { oldEmail, newEmail, url } = params;
	return {
		subject: "Confirmez votre nouvelle adresse e-mail — IMTA Resume",
		html: layout({
			preheader: "Confirmez le changement d'adresse e-mail de votre compte.",
			heading: "Confirmez votre nouvelle adresse e-mail",
			paragraphs: [
				`Vous avez demandé à remplacer l'adresse e-mail de votre compte (${oldEmail}) par <strong>${newEmail}</strong>.`,
				"Confirmez ce changement en cliquant sur le bouton ci-dessous.",
			],
			cta: { label: "Confirmer le changement", url },
			note: `Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail — votre adresse actuelle restera inchangée.`,
		}),
		text:
			`Confirmez votre nouvelle adresse e-mail\n\n` +
			`Vous avez demandé à remplacer ${oldEmail} par ${newEmail}.\n` +
			`Confirmez ce changement en ouvrant ce lien :\n${url}\n\n` +
			`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`,
	};
}
