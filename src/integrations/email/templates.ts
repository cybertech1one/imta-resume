// French-first, IMTA-branded transactional email templates.
// Each builder returns { subject, html, text } ready for sendEmail().
//
// Design notes (email HTML is not web HTML):
//  - Table-based layout, inline styles only (clients strip <style> and external CSS).
//  - Bulletproof CTA: VML <v:roundrect> for Outlook/Windows + <a> for everyone else.
//  - Hidden preheader controls the inbox preview line.
//  - Plain-text alternative is always provided (deliverability + accessibility).
//  - Palette = IMTA emerald → teal.
import { env } from "@/utils/env";

const C = {
	name: "IMTA Resume",
	tagline: "Votre CV professionnel, simplement",
	emerald: "#059669",
	emeraldDark: "#047857",
	teal: "#0d9488",
	ink: "#0f172a",
	body: "#334155",
	muted: "#64748b",
	faint: "#94a3b8",
	border: "#e6eaef",
	hair: "#eef2f6",
	page: "#f1f5f9",
	card: "#ffffff",
	calloutBg: "#ecfdf5",
	calloutBorder: "#6ee7b7",
	supportEmail: "support@imta.ma",
};

/** Absolute app URL with no trailing slash. */
function appUrl(): string {
	return env.APP_URL.replace(/\/$/, "");
}

/** Bulletproof CTA button: VML for Outlook, anchor for everyone else. */
function button(label: string, url: string): string {
	return `
	<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:4px auto 8px;">
		<tr><td align="center">
			<!--[if mso]>
			<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:50px;v-text-anchor:middle;width:320px;" arcsize="22%" stroke="f" fillcolor="${C.emerald}">
			<w:anchorlock/>
			<center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">${label}</center>
			</v:roundrect>
			<![endif]-->
			<!--[if !mso]><!-->
			<a href="${url}" target="_blank" rel="noopener"
				style="display:inline-block;min-width:240px;padding:15px 32px;background:linear-gradient(135deg,${C.emerald},${C.teal});color:#ffffff;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:20px;text-align:center;text-decoration:none;border-radius:12px;box-shadow:0 4px 14px rgba(5,150,105,0.35);">
				${label}
			</a>
			<!--<![endif]-->
		</td></tr>
	</table>`;
}

type LayoutOptions = {
	preheader: string;
	/** Emoji shown in the circular icon badge above the heading. */
	badge: string;
	heading: string;
	paragraphs: string[];
	cta: { label: string; url: string };
	/** Styled callout box under the CTA (e.g. expiry / security note). May contain HTML. */
	callout?: string;
	/** Muted link-fallback / closing note under the callout. May contain HTML. */
	footnote?: string;
};

const FONT = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Premium shared email shell. */
function layout(o: LayoutOptions): string {
	const url = appUrl();
	const host = url.replace(/^https?:\/\//, "");

	const body = o.paragraphs
		.map(
			(p) => `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${C.body};">${p}</p>`,
		)
		.join("");

	const callout = o.callout
		? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
				<tr><td style="background:${C.calloutBg};border:1px solid ${C.calloutBorder};border-radius:12px;padding:14px 18px;">
					<p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.emeraldDark};">${o.callout}</p>
				</td></tr>
			</table>`
		: "";

	const footnote = o.footnote
		? `<p style="margin:20px 0 0;font-family:${FONT};font-size:13px;line-height:1.65;color:${C.muted};">${o.footnote}</p>`
		: "";

	return `<!doctype html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="color-scheme" content="light only">
	<meta name="supported-color-schemes" content="light only">
	<title>${C.name}</title>
	<!--[if mso]><style>* { font-family: Arial, sans-serif !important; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;width:100%;background:${C.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
	<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${o.preheader}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};">
		<tr><td align="center" style="padding:32px 12px;">
			<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

				<!-- Brand bar -->
				<tr><td style="padding:0 4px 18px;">
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
						<td align="left" style="font-family:${FONT};font-size:18px;font-weight:800;letter-spacing:-0.02em;color:${C.ink};">
							<span style="color:${C.emerald};">IMTA</span>&nbsp;<span style="color:${C.ink};">Resume</span>
						</td>
						<td align="right" style="font-family:${FONT};font-size:12px;color:${C.faint};">${C.tagline}</td>
					</tr></table>
				</td></tr>

				<!-- Card -->
				<tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:20px;overflow:hidden;">

					<!-- Gradient header -->
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
						<tr><td style="background:linear-gradient(135deg,${C.emerald} 0%,${C.teal} 100%);padding:8px 0 0;">
							<div style="height:6px;line-height:6px;font-size:6px;">&nbsp;</div>
						</td></tr>
					</table>

					<!-- Icon badge -->
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
						<tr><td align="center" style="padding:32px 40px 0;">
							<table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center"
								style="width:72px;height:72px;background:linear-gradient(135deg,${C.calloutBg},#ffffff);border:1px solid ${C.calloutBorder};border-radius:50%;font-size:34px;line-height:72px;text-align:center;">
								${o.badge}
							</td></tr></table>
						</td></tr>
					</table>

					<!-- Content -->
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
						<tr><td style="padding:22px 40px 8px;" align="center">
							<h1 style="margin:0 0 18px;font-family:${FONT};font-size:23px;line-height:1.3;font-weight:800;letter-spacing:-0.02em;color:${C.ink};">${o.heading}</h1>
						</td></tr>
						<tr><td style="padding:0 40px;">
							${body}
							${button(o.cta.label, o.cta.url)}
							${callout}
							${footnote}
						</td></tr>
					</table>

					<!-- Card footer -->
					<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
						<tr><td style="padding:28px 40px 32px;">
							<div style="height:1px;background:${C.hair};line-height:1px;font-size:1px;margin-bottom:20px;">&nbsp;</div>
							<p style="margin:0 0 6px;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">
								Besoin d'aide&nbsp;? Écrivez-nous à
								<a href="mailto:${C.supportEmail}" style="color:${C.teal};text-decoration:none;font-weight:600;">${C.supportEmail}</a>.
							</p>
							<p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.muted};">
								Accédez à votre espace&nbsp;:
								<a href="${url}" style="color:${C.teal};text-decoration:none;font-weight:600;">${host}</a>
							</p>
						</td></tr>
					</table>

				</td></tr>

				<!-- Outer footer -->
				<tr><td style="padding:22px 24px 8px;" align="center">
					<p style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.faint};">
						<strong style="color:${C.muted};">${C.name}</strong> — Institut des Métiers et Techniques Appliquées
					</p>
					<p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.6;color:${C.faint};">
						Vous recevez cet e-mail suite à une action sur votre compte. Si ce n'était pas vous, ignorez-le en toute sécurité.
					</p>
				</td></tr>

			</table>
		</td></tr>
	</table>
</body>
</html>`;
}

export type EmailContent = { subject: string; html: string; text: string };

/** Password reset email (forgot-password flow). */
export function passwordResetEmail(url: string): EmailContent {
	return {
		subject: "🔑 Réinitialisez votre mot de passe — IMTA Resume",
		html: layout({
			preheader: "Voici votre lien sécurisé pour choisir un nouveau mot de passe (valable 1 heure).",
			badge: "🔑",
			heading: "Réinitialisation de votre mot de passe",
			paragraphs: [
				"Bonjour,",
				"Vous avez demandé à réinitialiser le mot de passe de votre compte <strong>IMTA Resume</strong>. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.",
			],
			cta: { label: "Réinitialiser mon mot de passe", url },
			callout:
				"🔒 <strong>Lien sécurisé&nbsp;:</strong> il expire dans <strong>1&nbsp;heure</strong> et ne peut être utilisé qu'une seule fois.",
			footnote:
				`Le bouton ne fonctionne pas&nbsp;? Copiez ce lien dans votre navigateur&nbsp;:<br>` +
				`<a href="${url}" style="color:${C.teal};word-break:break-all;">${url}</a><br><br>` +
				`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail&nbsp;: votre mot de passe restera inchangé.`,
		}),
		text:
			`IMTA Resume — Réinitialisation de votre mot de passe\n\n` +
			`Bonjour,\n\n` +
			`Vous avez demandé à réinitialiser le mot de passe de votre compte IMTA Resume.\n` +
			`Ouvrez ce lien sécurisé pour en choisir un nouveau (valable 1 heure, usage unique) :\n\n${url}\n\n` +
			`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe restera inchangé.\n\n` +
			`Besoin d'aide ? ${C.supportEmail}`,
	};
}

/** Email-verification email (sent on sign-up). */
export function verificationEmail(url: string): EmailContent {
	return {
		subject: "✅ Confirmez votre e-mail pour activer votre compte — IMTA Resume",
		html: layout({
			preheader: "Une dernière étape : confirmez votre adresse e-mail pour activer votre compte.",
			badge: "✉️",
			heading: "Bienvenue ! Confirmez votre e-mail",
			paragraphs: [
				"Bonjour et bienvenue 👋",
				"Merci d'avoir rejoint <strong>IMTA Resume</strong>. Pour activer votre compte et commencer à créer votre CV professionnel, il ne reste qu'à confirmer votre adresse e-mail.",
			],
			cta: { label: "Confirmer mon adresse e-mail", url },
			callout:
				"✨ <strong>Une fois confirmé</strong>, vous aurez accès à tous nos modèles de CV, à l'assistant IA et aux outils de préparation aux entretiens.",
			footnote:
				`Le bouton ne fonctionne pas&nbsp;? Copiez ce lien dans votre navigateur&nbsp;:<br>` +
				`<a href="${url}" style="color:${C.teal};word-break:break-all;">${url}</a><br><br>` +
				`Si vous n'avez pas créé de compte, ignorez simplement cet e-mail.`,
		}),
		text:
			`IMTA Resume — Confirmez votre adresse e-mail\n\n` +
			`Bonjour et bienvenue !\n\n` +
			`Merci d'avoir rejoint IMTA Resume. Pour activer votre compte et commencer à créer votre CV,\n` +
			`confirmez votre adresse e-mail en ouvrant ce lien :\n\n${url}\n\n` +
			`Une fois confirmé, vous aurez accès à tous nos modèles, à l'assistant IA et aux outils d'entretien.\n\n` +
			`Si vous n'avez pas créé de compte, ignorez cet e-mail.\n\n` +
			`Besoin d'aide ? ${C.supportEmail}`,
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
		subject: "🔄 Confirmez votre nouvelle adresse e-mail — IMTA Resume",
		html: layout({
			preheader: "Confirmez le changement d'adresse e-mail de votre compte IMTA Resume.",
			badge: "🔄",
			heading: "Confirmez votre nouvelle adresse",
			paragraphs: [
				"Bonjour,",
				`Vous avez demandé à remplacer l'adresse e-mail de votre compte <strong>IMTA Resume</strong> par&nbsp;:`,
				`<span style="display:inline-block;padding:8px 14px;background:${C.hair};border-radius:8px;font-weight:700;color:${C.ink};">${newEmail}</span>`,
			],
			cta: { label: "Confirmer le changement", url },
			callout: `📮 Cette confirmation remplacera votre adresse actuelle (<strong>${oldEmail}</strong>).`,
			footnote:
				`Le bouton ne fonctionne pas&nbsp;? Copiez ce lien dans votre navigateur&nbsp;:<br>` +
				`<a href="${url}" style="color:${C.teal};word-break:break-all;">${url}</a><br><br>` +
				`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail&nbsp;: votre adresse actuelle restera inchangée.`,
		}),
		text:
			`IMTA Resume — Confirmez votre nouvelle adresse e-mail\n\n` +
			`Bonjour,\n\n` +
			`Vous avez demandé à remplacer ${oldEmail} par ${newEmail}.\n` +
			`Confirmez ce changement en ouvrant ce lien :\n\n${url}\n\n` +
			`Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre adresse actuelle restera inchangée.\n\n` +
			`Besoin d'aide ? ${C.supportEmail}`,
	};
}
