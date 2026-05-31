/**
 * Shared date/number formatting utility.
 *
 * IMPORTANT: always pass an explicit locale. With `undefined`, the runtime
 * default is used — that is en-US on the Node SSR server (ICU default) but
 * fr-FR in a Moroccan student's browser. The mismatch produced React hydration
 * error #418 AND surfaced US-formatted dates (5/28/2026) on a French-first app.
 * Pinning fr-FR makes the server and client render identical text.
 */

export const APP_LOCALE = "fr-FR";

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "long",
	year: "numeric",
};

export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString(APP_LOCALE, options ?? DEFAULT_OPTIONS);
}

/** Date + time, pinned to the app locale (hydration-safe). */
export function formatDateTime(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleString(
		APP_LOCALE,
		options ?? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
	);
}

/** Number formatting pinned to the app locale (hydration-safe grouping). */
export function formatNumber(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
	if (value == null || Number.isNaN(value)) return "0";
	return value.toLocaleString(APP_LOCALE, options);
}
