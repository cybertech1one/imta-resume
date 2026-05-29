import { t } from "@lingui/core/macro";

export function getDaysUntilDeadline(deadline: string): number {
	const deadlineDate = new Date(deadline);
	const today = new Date();
	const diffTime = deadlineDate.getTime() - today.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDeadlineIndicator(days: number): { text: string; color: string; urgent: boolean } {
	if (days < 0) {
		return { text: t`Date depassee`, color: "text-red-600", urgent: true };
	}
	if (days <= 3) {
		return { text: t`Urgent - ${days} jours`, color: "text-red-600", urgent: true };
	}
	if (days <= 7) {
		return { text: t`${days} jours restants`, color: "text-amber-600", urgent: false };
	}
	if (days <= 14) {
		return { text: t`${days} jours restants`, color: "text-blue-600", urgent: false };
	}
	return { text: t`${days} jours restants`, color: "text-green-600", urgent: false };
}
