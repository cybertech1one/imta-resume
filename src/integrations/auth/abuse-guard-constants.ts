/**
 * @fileoverview Client-safe constants shared between the register form and the
 * server-side abuse guard. Kept in a separate module with NO server-only
 * imports (no db, no env) so it can be safely bundled into the browser.
 *
 * @module integrations/auth/abuse-guard-constants
 */

/**
 * Name of the hidden honeypot field rendered on the register form. Real users
 * never see or fill it; bots that auto-fill every input will.
 */
export const HONEYPOT_FIELD = "company_website" as const;

/** Name of the hidden field carrying the form-render timestamp (epoch ms). */
export const FORM_RENDER_TS_FIELD = "form_ts" as const;

/**
 * Minimum time (ms) a genuine human takes to fill the register form. Anything
 * faster is almost certainly an automated submission.
 */
export const MIN_FILL_TIME_MS = 1500;
