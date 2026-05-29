export function getScoreColor(score: number): string {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}

export function getScoreBgColor(score: number): string {
	if (score >= 80) return "bg-green-500";
	if (score >= 60) return "bg-amber-500";
	return "bg-red-500";
}

export function getScoreLabel(score: number): string {
	if (score >= 80) return "Excellent";
	if (score >= 60) return "Bon";
	if (score >= 40) return "Moyen";
	return "Faible";
}
