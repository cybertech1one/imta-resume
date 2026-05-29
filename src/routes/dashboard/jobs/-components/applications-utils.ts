export const getDaysAgo = (dateValue: Date | string | null | undefined): string => {
	if (!dateValue) return "";
	const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
	const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
	if (days === 0) return "Aujourd'hui";
	if (days === 1) return "Hier";
	return `Il y a ${days} jours`;
};
