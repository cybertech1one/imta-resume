// ==================== UTILITY FUNCTIONS ====================

export { formatDate } from "@/utils/format-date";

export function formatTime(timeString: string): string {
	const [hours, minutes] = timeString.split(":");
	return `${hours}:${minutes}`;
}

export function getDaysInMonth(year: number, month: number): Date[] {
	const days: Date[] = [];
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// Add padding days from previous month
	const startPadding = firstDay.getDay();
	for (let i = startPadding - 1; i >= 0; i--) {
		const date = new Date(year, month, -i);
		days.push(date);
	}

	// Add days of current month
	for (let day = 1; day <= lastDay.getDate(); day++) {
		days.push(new Date(year, month, day));
	}

	// Add padding days for next month
	const endPadding = 42 - days.length; // 6 rows * 7 days
	for (let i = 1; i <= endPadding; i++) {
		days.push(new Date(year, month + 1, i));
	}

	return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	);
}

export function isToday(date: Date): boolean {
	return isSameDay(date, new Date());
}

export function isPastDate(date: Date): boolean {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return date < today;
}

export function getTimeUntilInterview(dateString: string, timeString: string): string {
	const interviewDate = new Date(`${dateString}T${timeString}`);
	const now = new Date();
	const diffMs = interviewDate.getTime() - now.getTime();

	if (diffMs < 0) return "Past";

	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
	if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
	if (diffMins > 0) return `In ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
	return "Now";
}
