/**
 * AI Input Sanitization - OWASP AI Security (LLM01: Prompt Injection)
 *
 * Sanitizes user-provided text before sending to AI models to prevent
 * prompt injection attacks. Does NOT sanitize system prompts, static
 * templates, or Zod-validated enum fields.
 */

// Regex to strip zero-width / invisible Unicode chars that can bypass text filters.
// Built with a RegExp string so the TS source stays clean ASCII.
// Ranges covered:
//   U+200B..U+200F  zero-width space, joiner, non-joiner, LTR/RTL marks
//   U+2060..U+206F  word joiner, invisible separators, bidi controls
//   U+FEFF          BOM / zero-width no-break space
//   U+00AD          soft hyphen
//   U+FFF9..U+FFFB  interlinear annotation anchors
const INVISIBLE_CHARS_RE = /[​-‏⁠-⁯﻿­￹-￻]/g;

/**
 * Sanitize user input before sending to AI models.
 * Prevents prompt injection by:
 * 1. Stripping invisible/zero-width Unicode characters
 * 2. Stripping system-level instruction patterns (EN + FR)
 * 3. Enforcing max length limits
 * 4. Removing XML-like control tags
 */
export function sanitizeAiInput(input: string, maxLength = 4000): string {
	const sanitized = input
		// Remove zero-width and invisible Unicode characters (homoglyph bypass defense)
		.replace(INVISIBLE_CHARS_RE, "")
		// Normalize Unicode to NFC to prevent confusable character attacks
		.normalize("NFC")
		// Remove attempts to override system prompt
		.replace(/\b(system|assistant|user)\s*:/gi, "")
		.replace(
			/\b(ignore|disregard|forget|override|overwrite|discard|reset|clear)\s+(all\s+)?(previous|above|prior|your|the|these)\s+(instructions?|prompts?|rules?|role|behavior|constraints?|guidelines?)/gi,
			"[filtered]",
		)
		.replace(
			/\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|new\s+instructions?|your\s+new\s+task|you\s+must\s+now|respond\s+as\s+if|stop\s+following|do\s+not\s+follow)\b/gi,
			"[filtered]",
		)
		// French-language injection patterns (platform is French-first)
		.replace(
			/\b(oublie|ignore[rz]?)\s+(les?\s+)?(instructions?|consignes?|r[eè]gles?)\s*(pr[eé]c[eé]dentes?|ci-dessus)?/gi,
			"[filtered]",
		)
		.replace(/\b(tu\s+es\s+maintenant|nouvelles?\s+instructions?|ne\s+suis\s+plus)\b/gi, "[filtered]")
		// Remove markdown role markers that could confuse models
		.replace(/^#{1,3}\s*(System|Instructions?|Rules?|Prompt)\s*$/gim, "")
		// Remove XML-like tags that might be interpreted as control
		.replace(/<\/?(?:system|instructions?|rules?|prompt|context|override)[^>]*>/gi, "")
		// Trim to max length
		.slice(0, maxLength)
		.trim();

	return sanitized;
}

/**
 * Sanitize resume data fields before AI processing.
 * More permissive than general sanitization since resume content
 * is structured and less likely to be injection vectors.
 */
export function sanitizeResumeInput(data: Record<string, unknown>, maxFieldLength = 2000): Record<string, unknown> {
	const sanitized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data)) {
		if (typeof value === "string") {
			sanitized[key] = sanitizeAiInput(value, maxFieldLength);
		} else if (Array.isArray(value)) {
			sanitized[key] = value.map((item) => (typeof item === "string" ? sanitizeAiInput(item, maxFieldLength) : item));
		} else {
			sanitized[key] = value;
		}
	}
	return sanitized;
}

/**
 * Validate AI output doesn't contain harmful content.
 * Check for potential data exfiltration or instruction leaks.
 */
export function validateAiOutput(output: string): { safe: boolean; cleaned: string } {
	let cleaned = output;
	let safe = true;

	// Check for potential system prompt leakage
	if (/\b(api[_\s]?key|secret|password|token|credential)\s*[:=]\s*\S+/i.test(output)) {
		safe = false;
		cleaned = cleaned.replace(/\b(api[_\s]?key|secret|password|token|credential)\s*[:=]\s*\S+/gi, "[REDACTED]");
	}

	// Check for potential URLs that look like data exfiltration
	if (/https?:\/\/[^\s]+\?.*(?:data|key|token|secret)=/i.test(output)) {
		safe = false;
		cleaned = cleaned.replace(/https?:\/\/[^\s]+\?.*(?:data|key|token|secret)=[^\s]*/gi, "[URL_REDACTED]");
	}

	return { safe, cleaned };
}
