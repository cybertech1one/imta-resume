import DOMPurify, { type Config } from "dompurify";

/**
 * DOMPurify configuration for sanitizing rich text content.
 * This configuration allows safe HTML tags used in the rich text editor
 * while stripping all potentially dangerous content like scripts and event handlers.
 *
 * Security notes:
 * - `style` attribute is NOT allowed to prevent CSS-based attacks (overlay, UI redressing)
 * - All links get `rel="noopener noreferrer"` to prevent window.opener attacks
 * - Only http/https protocols allowed in href
 */
const RICH_TEXT_CONFIG: Config = {
	// Allow safe HTML tags used by the TipTap editor
	ALLOWED_TAGS: [
		// Text formatting
		"p",
		"br",
		"hr",
		"span",
		"div",
		// Headings
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		// Text styling
		"strong",
		"b",
		"em",
		"i",
		"u",
		"s",
		"strike",
		"mark",
		"code",
		"pre",
		// Lists
		"ul",
		"ol",
		"li",
		// Tables
		"table",
		"thead",
		"tbody",
		"tfoot",
		"tr",
		"th",
		"td",
		"colgroup",
		"col",
		// Links
		"a",
		// Quotes
		"blockquote",
	],
	// Allow safe attributes - NOTE: 'style' is intentionally NOT included to prevent CSS attacks
	ALLOWED_ATTR: ["class", "href", "target", "rel", "colspan", "rowspan", "data-type", "data-label"],
	// Only allow http, https, and mailto protocols (explicitly list safe protocols)
	ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
	// Don't allow data: URIs which can be used for XSS
	ALLOW_DATA_ATTR: false,
};

// Configure DOMPurify hooks for additional security
if (typeof window !== "undefined") {
	// Ensure all links have safe rel attribute to prevent window.opener attacks
	DOMPurify.addHook("afterSanitizeAttributes", (node) => {
		if (node.tagName === "A") {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses DOMPurify with a strict configuration that only allows
 * safe HTML tags and attributes used by the rich text editor.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
	if (!html) return "";
	return DOMPurify.sanitize(html, { ...RICH_TEXT_CONFIG, RETURN_TRUSTED_TYPE: false }) as string;
}

/**
 * Sanitizes a URL to prevent javascript: and other dangerous protocol injections.
 * Only allows http, https, mailto, and tel protocols.
 *
 * @param url - The URL string to sanitize
 * @returns The URL if safe, or "#" if potentially dangerous
 */
export function sanitizeUrl(url: string): string {
	if (!url) return "#";
	const trimmed = url.trim();
	// Allow http, https, mailto, and tel protocols explicitly
	if (/^(?:https?|mailto|tel):/i.test(trimmed)) return trimmed;
	// Allow protocol-relative URLs
	if (trimmed.startsWith("//")) return trimmed;
	// Allow relative URLs (no protocol)
	if (!trimmed.includes(":")) return trimmed;
	// Block everything else (javascript:, data:, vbscript:, etc.)
	return "#";
}

/**
 * Sanitizes CSS content to prevent CSS injection attacks.
 * Removes JavaScript expressions, dangerous properties, and potentially harmful patterns.
 *
 * Security measures:
 * - Removes ALL url() calls (prevents data exfiltration via external URLs)
 * - Removes javascript: and data: URLs
 * - Removes expression(), behavior, -moz-binding (script execution)
 * - Removes @import (prevents loading external resources)
 * - Removes @font-face (prevents loading tracking fonts)
 * - Removes @charset (prevents encoding-based attacks)
 * - Strips HTML tags that might be embedded
 */
export function sanitizeCss(css: string): string {
	if (!css) return "";

	let sanitized = css
		// Remove javascript: URLs (with possible whitespace/encoding tricks)
		.replace(/j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/gi, "")
		// Remove expression() which can execute JS in older IE
		.replace(/expression\s*\(/gi, "invalid(")
		// Remove ALL url() calls - prevents data exfiltration via external HTTP URLs,
		// javascript:/data:/vbscript: protocol attacks, and tracking pixel loading
		.replace(/url\s*\([^)]*\)/gi, "none")
		// Remove behavior: property (IE-specific, can run scripts)
		.replace(/behavior\s*:/gi, "invalid:")
		// Remove -moz-binding (Firefox-specific, can run scripts)
		.replace(/-moz-binding\s*:/gi, "invalid:")
		// Remove @import entirely (prevents loading external resources)
		.replace(/@import\s+[^;]+;?/gi, "/* @import removed */")
		// Remove @font-face entirely (prevents loading tracking fonts)
		.replace(/@font-face\s*\{[^}]*\}/gi, "/* @font-face removed */")
		// Remove @charset (prevents encoding-based attacks)
		.replace(/@charset\s+[^;]+;?/gi, "/* @charset removed */")
		// Remove position:fixed to prevent invisible overlay / clickjacking attacks
		.replace(/position\s*:\s*fixed/gi, "position: relative");

	// Use DOMPurify to clean any HTML that might be in the CSS
	sanitized = DOMPurify.sanitize(sanitized, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true,
		RETURN_TRUSTED_TYPE: false,
	}) as string;

	return sanitized;
}
