export { formatDate } from "@/utils/format-date";

export function formatDateFull(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

export function getDateDiff(start: string, end: string | null): string {
	const startDate = new Date(start);
	const endDate = end ? new Date(end) : new Date();
	const diffMs = endDate.getTime() - startDate.getTime();
	const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
	const years = Math.floor(diffMonths / 12);
	const months = diffMonths % 12;

	if (years > 0 && months > 0) {
		return `${years} an${years > 1 ? "s" : ""} ${months} mois`;
	} else if (years > 0) {
		return `${years} an${years > 1 ? "s" : ""}`;
	} else {
		return `${months} mois`;
	}
}
