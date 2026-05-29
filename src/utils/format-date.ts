/**
 * Shared date formatting utility.
 * Replaces duplicate formatDate functions across dashboard files.
 */

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
	day: "numeric",
	month: "long",
	year: "numeric",
};

export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
	if (!date) return "";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString(undefined, options ?? DEFAULT_OPTIONS);
}
