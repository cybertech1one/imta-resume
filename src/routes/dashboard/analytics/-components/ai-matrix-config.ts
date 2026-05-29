export const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

const FEATURE_LABELS: Record<string, string> = {
	test_connection: "Test Connection",
	parse_pdf: "PDF Parsing",
	parse_docx: "DOCX Parsing",
	improve_content: "Content Improvement",
	generate_summary: "Summary Generation",
	suggest_skills: "Skill Suggestions",
	generate_headline: "Headline Generation",
	fix_grammar: "Grammar Fix",
	analyze_resume: "Resume Analysis",
	interview_generate_questions: "Interview Questions",
	interview_evaluate_response: "Response Evaluation",
	interview_analyze_session: "Session Analysis",
	interview_chat: "Interview Chat",
	interview_chatbot_summary: "Chatbot Summary",
};

export function formatNumber(num: number): string {
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
	if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
	return num.toLocaleString();
}

export function formatDuration(ms: number): string {
	if (ms >= 60_000) return `${(ms / 60_000).toFixed(1)}m`;
	if (ms >= 1_000) return `${(ms / 1_000).toFixed(1)}s`;
	return `${ms}ms`;
}

export function formatCurrency(amount: number): string {
	return `$${amount.toFixed(2)}`;
}

export function featureLabel(feature: string): string {
	return FEATURE_LABELS[feature] ?? feature.replaceAll("_", " ");
}

export function getDateRange(period: string): { startDate: string; endDate: string } {
	const end = new Date();
	const start = new Date();

	switch (period) {
		case "7d":
			start.setDate(start.getDate() - 7);
			break;
		case "30d":
			start.setDate(start.getDate() - 30);
			break;
		case "90d":
			start.setDate(start.getDate() - 90);
			break;
		case "1y":
			start.setFullYear(start.getFullYear() - 1);
			break;
		default:
			start.setDate(start.getDate() - 30);
	}

	return {
		startDate: start.toISOString(),
		endDate: end.toISOString(),
	};
}

export const containerVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};
