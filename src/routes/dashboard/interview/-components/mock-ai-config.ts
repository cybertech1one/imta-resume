import { FirstAidKitIcon, GearIcon, HardHatIcon, TargetIcon } from "@phosphor-icons/react";

import type { ApiSession, InterviewSession, MessageFeedback } from "./mock-ai-types";

// Icon mapping for dynamic field icons from database config
export const iconMap: Record<string, typeof FirstAidKitIcon> = {
	FirstAidKitIcon: FirstAidKitIcon,
	GearIcon: GearIcon,
	HardHatIcon: HardHatIcon,
	TargetIcon: TargetIcon,
};

// Helper: simple scoring based on response length and content keywords
export function calculateScore(response: string): number {
	const wordCount = response.trim().split(/\s+/).length;
	const hasNumbers = /\d/.test(response);
	const hasExamples = /(example|experience|internship|I have|we have|exemple|stage|j'ai|nous avons)/i.test(response);
	const hasTechnical = /(technical|method|procedure|protocol|process|technique|methode|protocole|processus)/i.test(
		response,
	);

	let score = 50;
	if (wordCount > 30) score += 10;
	if (wordCount > 60) score += 10;
	if (wordCount > 100) score += 5;
	if (hasNumbers) score += 5;
	if (hasExamples) score += 15;
	if (hasTechnical) score += 10;

	return Math.min(100, score);
}

// Helper: Fisher-Yates shuffle and take first N items
function getRandomItems<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled.slice(0, count);
}

// Convert API session shape (string dates) to local session (Date objects)
export function apiSessionToLocal(apiSession: ApiSession): InterviewSession {
	return {
		id: apiSession.id,
		field: apiSession.field,
		program: apiSession.program,
		difficulty: apiSession.difficulty,
		messages: apiSession.messages.map((m) => ({
			...m,
			timestamp: new Date(m.timestamp),
		})),
		currentQuestionIndex: apiSession.currentQuestionIndex,
		totalQuestions: apiSession.totalQuestions,
		scores: apiSession.scores,
		startedAt: new Date(apiSession.startedAt),
		completedAt: apiSession.completedAt ? new Date(apiSession.completedAt) : undefined,
		overallScore: apiSession.overallScore ?? undefined,
	};
}

// Generate feedback from database templates with random selection
export function generateFeedbackFromTemplates(
	score: number,
	feedbackTemplates:
		| Array<{
				minScore: number;
				maxScore: number;
				strengths: string[];
				improvements: string[];
		  }>
		| undefined,
	interviewTips: Array<{ title: string; content: string }> | undefined,
): MessageFeedback {
	const template = feedbackTemplates?.find((t) => score >= t.minScore && score <= t.maxScore);

	const tip =
		interviewTips && interviewTips.length > 0 ? interviewTips[Math.floor(Math.random() * interviewTips.length)] : null;

	if (template) {
		const strengths = getRandomItems(template.strengths, Math.floor(Math.random() * 2) + 1);
		const improvements = getRandomItems(template.improvements, Math.floor(Math.random() * 2) + 1);

		return {
			score,
			strengths,
			improvements,
			tip: tip ? `${tip.title}: ${tip.content}` : undefined,
		};
	}

	// Fallback if no template found (not user-visible labels - fallback feedback strings)
	return {
		score,
		strengths: ["Good effort in your response"],
		improvements: ["Keep practicing"],
		tip: tip ? `${tip.title}: ${tip.content}` : undefined,
	};
}
