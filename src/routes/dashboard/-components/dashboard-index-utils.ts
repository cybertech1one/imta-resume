import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { MOTIVATIONAL_MESSAGES } from "./dashboard-index-config";

export function getDailyMotivation(): string {
	const now = new Date();
	const start = new Date(now.getFullYear(), 0, 0);
	const diff = now.getTime() - start.getTime();
	const oneDay = 1000 * 60 * 60 * 24;
	const dayOfYear = Math.floor(diff / oneDay);
	return i18n.t(MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length]);
}

export function formatLocalizedDate(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	};
	return date.toLocaleDateString("fr-FR", options);
}

export function getTimeOfDayGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return t`Good morning`;
	if (hour < 18) return t`Good afternoon`;
	return t`Good evening`;
}

export function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 1) {
		return t`Just now`;
	}
	if (diffMins < 60) {
		return t`${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
	}
	if (diffHours < 24) {
		return t`${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
	}
	if (diffDays === 1) {
		return t`Yesterday`;
	}
	if (diffDays < 7) {
		return t`${diffDays} days ago`;
	}
	return date.toLocaleDateString("fr-FR");
}

export function formatFutureDate(date: Date): string {
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return t`Today`;
	}
	if (diffDays === 1) {
		return t`Tomorrow`;
	}
	if (diffDays < 7) {
		return t`In ${diffDays} days`;
	}
	return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
