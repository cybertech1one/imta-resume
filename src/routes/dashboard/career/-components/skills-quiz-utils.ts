import {
	AVAILABLE_BADGES,
	LEADERSHIP_QUESTIONS,
	SOFT_SKILLS_QUESTIONS,
	TECHNICAL_QUESTIONS,
} from "./skills-quiz-config";
import type { ImprovementPlan, QuizQuestion, QuizResult, SkillCategory, SkillLevel } from "./skills-quiz-types";

export function calculateLevel(score: number): SkillLevel {
	if (score >= 90) return "expert";
	if (score >= 70) return "advanced";
	if (score >= 40) return "intermediate";
	return "beginner";
}

export function getQuestionsForCategory(category: SkillCategory): QuizQuestion[] {
	switch (category) {
		case "technical":
			return TECHNICAL_QUESTIONS;
		case "soft_skills":
			return SOFT_SKILLS_QUESTIONS;
		case "leadership":
			return LEADERSHIP_QUESTIONS;
		default:
			return TECHNICAL_QUESTIONS;
	}
}

export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function getEarnedBadges(result: QuizResult, allResults: QuizResult[]): string[] {
	const earned: string[] = [];

	for (const badge of AVAILABLE_BADGES) {
		if (badge.id === "consistent") {
			if (allResults.length >= 5) earned.push(badge.id);
		} else if (badge.id === "polyvalent") {
			const categories = new Set(allResults.map((r) => r.category));
			if (categories.size >= 3) earned.push(badge.id);
		} else if (badge.id === "legendary-achiever") {
			const expertCategories = new Set(allResults.filter((r) => r.level === "expert").map((r) => r.category));
			if (expertCategories.size >= 3) earned.push(badge.id);
		} else if (badge.condition(result)) {
			earned.push(badge.id);
		}
	}

	return earned;
}

export function generateImprovementPlan(result: QuizResult): ImprovementPlan[] {
	const plans: ImprovementPlan[] = [];

	for (const [skill, data] of Object.entries(result.skillBreakdown)) {
		const percentage = (data.correct / data.total) * 100;
		const currentLevel = calculateLevel(percentage);
		const targetLevel =
			currentLevel === "expert"
				? "expert"
				: currentLevel === "advanced"
					? "expert"
					: currentLevel === "intermediate"
						? "advanced"
						: "intermediate";

		if (currentLevel !== "expert") {
			const recommendations: string[] = [];
			const resources: { title: string; type: string; url?: string }[] = [];

			if (percentage < 40) {
				recommendations.push(`Review the fundamentals of ${skill}`);
				recommendations.push("Take an introductory course");
				recommendations.push("Practice with basic exercises");
				resources.push({ title: `Introduction to ${skill}`, type: "Online Course" });
				resources.push({ title: "Beginner's Guide", type: "Documentation" });
			} else if (percentage < 70) {
				recommendations.push(`Deepen the intermediate concepts of ${skill}`);
				recommendations.push("Complete practical projects");
				recommendations.push("Study real-world cases");
				resources.push({ title: `Advanced ${skill}`, type: "Training" });
				resources.push({ title: "Practical Case Studies", type: "Exercises" });
			} else {
				recommendations.push(`Master the advanced aspects of ${skill}`);
				recommendations.push("Share your knowledge with others");
				recommendations.push("Explore the latest trends");
				resources.push({ title: `${skill} Expert`, type: "Specialization" });
				resources.push({ title: "Conferences and Webinars", type: "Events" });
			}

			plans.push({
				skill,
				currentLevel,
				targetLevel,
				recommendations,
				resources,
			});
		}
	}

	return plans;
}

export function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}
