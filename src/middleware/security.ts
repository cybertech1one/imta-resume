/**
 * Security Middleware for IMTA Resume
 *
 * Provides comprehensive security headers and protections including:
 * - Content Security Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * - Strict-Transport-Security (HSTS)
 *
 * Security Audit Date: 2026-02-10
 * OWASP Compliance: Top 10 2021
 */

import { env } from "@/utils/env";

/**
 * Environment detection
 */
const isProduction = process.env.NODE_ENV === "production";
const appUrl = env.APP_URL || "https://imta.ma";

/**
 * Content Security Policy directives
 *
 * Security rationale for each directive:
 * - default-src 'self': Only allow resources from same origin by default
 * - script-src: Allow inline scripts (required for React hydration), eval for Monaco editor
 * - style-src: Allow inline styles (required for Tailwind and component libraries)
 * - img-src: Allow images from self, data URIs, and trusted CDNs
 * - font-src: Allow fonts from self and Google Fonts
 * - connect-src: Allow API connections to self and external services
 * - frame-ancestors: Prevent clickjacking by restricting framing
 * - base-uri: Restrict base element to prevent base tag hijacking
 * - form-action: Restrict form submissions to same origin
 * - upgrade-insecure-requests: Force HTTPS in production
 */
function generateCSP(options: { nonce?: string } = {}): string {
	const { nonce } = options;
	const nonceAttr = nonce ? `'nonce-${nonce}'` : "";

	const directives: Record<string, string[]> = {
		"default-src": ["'self'"],

		// Scripts: self, inline (for React), and eval (for Monaco editor in dev)
		// Note: 'unsafe-inline' is required for React hydration scripts
		// In production, consider implementing nonce-based CSP for better security
		"script-src": [
			"'self'",
			"'unsafe-inline'", // Required for React inline event handlers
			...(isProduction ? [] : ["'unsafe-eval'"]), // Only allow eval in development for HMR
			...(nonce ? [nonceAttr] : []),
			"https://www.googletagmanager.com",
			"https://www.google-analytics.com",
			"https://cdn.crowdin.com", // Crowdin for translations
		],

		// Styles: self and inline (required for Tailwind CSS and component libraries)
		"style-src": [
			"'self'",
			"'unsafe-inline'", // Required for Tailwind, Radix UI, and styled components
			"https://fonts.googleapis.com",
		],

		// Images: self, data URIs (for base64 images), and blob URIs (for PDF preview)
		"img-src": [
			"'self'",
			"data:",
			"blob:",
			"https:",
			"https://avatars.githubusercontent.com",
			"https://lh3.googleusercontent.com", // Google profile pictures
			"https://www.gravatar.com",
		],

		// Fonts: self and Google Fonts
		"font-src": ["'self'", "https://fonts.gstatic.com", "data:"],

		// Connections: self and required external APIs
		"connect-src": [
			"'self'",
			appUrl,
			"https://api.openai.com",
			"https://api.anthropic.com",
			"https://generativelanguage.googleapis.com",
			"https://api.groq.com",
			"https://api.mistral.ai",
			"https://api.deepseek.com",
			"https://api.together.xyz",
			"https://openrouter.ai",
			"https://fonts.googleapis.com",
			"https://fonts.gstatic.com",
			"wss:", // WebSocket for real-time features
			...(isProduction ? [] : ["ws://localhost:*", "http://localhost:*"]),
		],

		// Media: self only
		"media-src": ["'self'", "blob:"],

		// Objects: none (prevent Flash/Silverlight/etc)
		"object-src": ["'none'"],

		// Child frames: self only for PDF preview
		"child-src": ["'self'", "blob:"],

		// Workers: self and blob (for PDF generation)
		"worker-src": ["'self'", "blob:"],

		// Frames: self only
		"frame-src": ["'self'", "https://accounts.google.com"], // For OAuth

		// Frame ancestors: prevent clickjacking
		"frame-ancestors": ["'self'"],

		// Base URI: prevent base tag hijacking
		"base-uri": ["'self'"],

		// Form action: restrict form submissions
		"form-action": ["'self'", "https://accounts.google.com", "https://github.com/login/oauth"],

		// Manifest: self only
		"manifest-src": ["'self'"],
	};

	// Add upgrade-insecure-requests in production
	if (isProduction) {
		directives["upgrade-insecure-requests"] = [];
	}

	return Object.entries(directives)
		.map(([key, values]) => `${key} ${values.join(" ")}`.trim())
		.join("; ");
}

/**
 * Permissions Policy (formerly Feature-Policy)
 *
 * Restricts browser features to protect user privacy and prevent abuse
 */
function generatePermissionsPolicy(): string {
	const policies: Record<string, string[]> = {
		// Camera: only self (for video recording features)
		camera: ["self"],
		// Microphone: only self (for voice interview features)
		microphone: ["self"],
		// Geolocation: disabled (not needed)
		geolocation: [],
		// Interest Cohort: disabled (blocks FLoC tracking)
		"interest-cohort": [],
		// Payment: disabled (not needed)
		payment: [],
		// USB: disabled (not needed)
		usb: [],
		// Accelerometer: disabled (not needed)
		accelerometer: [],
		// Gyroscope: disabled (not needed)
		gyroscope: [],
		// Magnetometer: disabled (not needed)
		magnetometer: [],
		// Display capture: self only (for screen recording features)
		"display-capture": ["self"],
		// Fullscreen: self only
		fullscreen: ["self"],
	};

	return Object.entries(policies)
		.map(([key, values]) => {
			if (values.length === 0) return `${key}=()`;
			return `${key}=(${values.join(" ")})`;
		})
		.join(", ");
}

/**
 * Security Headers Configuration
 *
 * Returns all security headers that should be added to responses
 */
export interface SecurityHeaders {
	"Content-Security-Policy": string;
	"X-Frame-Options": string;
	"X-Content-Type-Options": string;
	"X-XSS-Protection": string;
	"Referrer-Policy": string;
	"Permissions-Policy": string;
	"Strict-Transport-Security"?: string;
	"Cross-Origin-Opener-Policy": string;
	"Cross-Origin-Embedder-Policy": string;
	"Cross-Origin-Resource-Policy": string;
}

export function getSecurityHeaders(options: { nonce?: string } = {}): SecurityHeaders {
	const headers: SecurityHeaders = {
		// CSP: Primary defense against XSS
		"Content-Security-Policy": generateCSP(options),

		// X-Frame-Options: Prevent clickjacking (legacy, supplemented by CSP frame-ancestors)
		"X-Frame-Options": "SAMEORIGIN",

		// X-Content-Type-Options: Prevent MIME type sniffing
		"X-Content-Type-Options": "nosniff",

		// X-XSS-Protection: Legacy XSS filter (some browsers)
		// Note: Modern browsers have deprecated this, but it doesn't hurt
		"X-XSS-Protection": "1; mode=block",

		// Referrer-Policy: Control referrer information leakage
		// strict-origin-when-cross-origin: Send origin for cross-origin, full URL for same-origin
		"Referrer-Policy": "strict-origin-when-cross-origin",

		// Permissions-Policy: Restrict browser features
		"Permissions-Policy": generatePermissionsPolicy(),

		// Cross-Origin-Opener-Policy: Protect against Spectre attacks
		"Cross-Origin-Opener-Policy": "same-origin-allow-popups",

		// Cross-Origin-Embedder-Policy: Required for SharedArrayBuffer
		// Using 'unsafe-none' to allow embedding external resources
		"Cross-Origin-Embedder-Policy": "unsafe-none",

		// Cross-Origin-Resource-Policy: Control resource sharing
		"Cross-Origin-Resource-Policy": "cross-origin",
	};

	// HSTS: Force HTTPS in production
	// max-age=31536000 = 1 year
	// includeSubDomains: Apply to all subdomains
	// preload: Allow inclusion in browser preload lists
	if (isProduction) {
		headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
	}

	return headers;
}

/**
 * Apply security headers to a Response object.
 *
 * Attempts to set headers directly on the response to avoid creating a new
 * Response wrapper (which consumes the body ReadableStream and causes
 * "Response body object should not be disturbed or locked" errors in Nitro's
 * dev proxy). Falls back to cloning the response if direct mutation fails
 * (e.g. when headers are immutable).
 */
export function applySecurityHeaders(response: Response, options: { nonce?: string } = {}): Response {
	const headers = getSecurityHeaders(options);

	// Try to set headers directly on the existing response (avoids body disturbance)
	try {
		for (const [key, value] of Object.entries(headers)) {
			if (value !== undefined) {
				response.headers.set(key, value);
			}
		}
		return response;
	} catch {
		// Headers are immutable (e.g. frozen Response) — clone first to get a mutable copy
		// clone() creates a new Response with an independent body stream, so the
		// original is never disturbed.
		const cloned = response.clone();
		for (const [key, value] of Object.entries(headers)) {
			if (value !== undefined) {
				cloned.headers.set(key, value);
			}
		}
		return cloned;
	}
}

/**
 * Security utility: Validate Origin header for CSRF protection
 *
 * Better Auth handles CSRF internally, but this can be used for additional protection
 * on custom endpoints
 */
export function validateOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");

	// For same-origin requests, origin might be null
	if (!origin && !referer) {
		// Allow requests without origin (same-origin GET requests)
		return request.method === "GET";
	}

	const requestOrigin = origin || (referer ? new URL(referer).origin : null);
	if (!requestOrigin) return false;

	// Check if origin matches our app URL
	const appOrigin = new URL(appUrl).origin;
	return requestOrigin === appOrigin;
}
