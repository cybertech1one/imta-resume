/**
 * Shared labels, badge variants and helpers for the support / helpdesk UI.
 * French-first labels. Used by both the user and admin support pages.
 */

export type TicketCategory = "account" | "technical" | "billing" | "ai" | "resume" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
	account: "Compte",
	technical: "Technique",
	billing: "Facturation",
	ai: "Intelligence artificielle",
	resume: "CV / Résumé",
	other: "Autre",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
	open: "Ouvert",
	in_progress: "En cours",
	resolved: "Résolu",
	closed: "Fermé",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
	low: "Basse",
	normal: "Normale",
	high: "Haute",
};

export const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = (
	Object.keys(CATEGORY_LABELS) as TicketCategory[]
).map((value) => ({ value, label: CATEGORY_LABELS[value] }));

export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = (
	Object.keys(STATUS_LABELS) as TicketStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = (
	Object.keys(PRIORITY_LABELS) as TicketPriority[]
).map((value) => ({ value, label: PRIORITY_LABELS[value] }));

/** Tailwind classes for status badges (used with Badge variant="outline"). */
export function statusBadgeClass(status: string): string {
	switch (status) {
		case "open":
			return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
		case "in_progress":
			return "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400";
		case "resolved":
			return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
		case "closed":
			return "border-muted-foreground/30 bg-muted text-muted-foreground";
		default:
			return "border-border bg-muted text-muted-foreground";
	}
}

export function priorityBadgeClass(priority: string): string {
	switch (priority) {
		case "high":
			return "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400";
		case "normal":
			return "border-border bg-muted text-muted-foreground";
		case "low":
			return "border-muted-foreground/20 bg-muted/50 text-muted-foreground";
		default:
			return "border-border bg-muted text-muted-foreground";
	}
}

export function statusLabel(status: string): string {
	return STATUS_LABELS[status as TicketStatus] ?? status;
}

export function categoryLabel(category: string): string {
	return CATEGORY_LABELS[category as TicketCategory] ?? category;
}

export function priorityLabel(priority: string): string {
	return PRIORITY_LABELS[priority as TicketPriority] ?? priority;
}

/** Formats a timestamp for the French UI. */
export function formatDateTime(value: Date | string): string {
	const date = typeof value === "string" ? new Date(value) : value;
	return new Intl.DateTimeFormat("fr-FR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}
