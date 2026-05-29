import { t } from "@lingui/core/macro";

import type { CertificationFormData } from "./certifications-types";

export function calculateDaysUntilExpiration(expirationDate: Date | null): number | null {
	if (!expirationDate) return null;
	const now = new Date();
	const expiry = new Date(expirationDate);
	const diffTime = expiry.getTime() - now.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatCurrency(amount: number, currency: string): string {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: currency,
	}).format(amount);
}

export function getExpirationStatus(daysUntil: number | null): { color: string; label: string } {
	if (daysUntil === null) return { color: "text-muted-foreground", label: t`Pas d'expiration` };
	if (daysUntil < 0) return { color: "text-red-500", label: t`Expiree` };
	if (daysUntil <= 30) return { color: "text-red-500", label: t`Expire bientot` };
	if (daysUntil <= 90) return { color: "text-amber-500", label: t`A renouveler` };
	return { color: "text-green-500", label: t`Valide` };
}

export function getDefaultFormData(): CertificationFormData {
	return {
		name: "",
		issuer: "",
		category: "hse",
		status: "planned",
		credentialId: "",
		credentialUrl: "",
		issueDate: "",
		expiryDate: "",
		cost: 0,
		currency: "EUR",
		notes: "",
		reminderDays: 30,
	};
}
