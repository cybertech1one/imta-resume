import type { ReadinessLevel, SkillCategory } from "./remote-readiness-types";

export function calculateLevel(percentage: number): ReadinessLevel {
	if (percentage >= 90) return "expert";
	if (percentage >= 75) return "proficient";
	if (percentage >= 60) return "competent";
	if (percentage >= 40) return "developing";
	return "beginner";
}

export function getImprovementDescription(category: SkillCategory, percentage: number): string {
	const descriptions: Record<SkillCategory, Record<string, string>> = {
		communication: {
			low: "Practice clear written communication and participate in more virtual meetings.",
			medium: "Improve your confidence in video presentations and asynchronous communication.",
		},
		time_management: {
			low: "Establish a structured daily routine and use planning tools.",
			medium: "Refine your prioritization techniques and distraction management.",
		},
		tech_proficiency: {
			low: "Get trained on essential collaboration and video conferencing tools.",
			medium: "Deepen your skills in security and technical troubleshooting.",
		},
		self_discipline: {
			low: "Start with simple techniques like Pomodoro and set daily goals.",
			medium: "Develop advanced strategies for motivation management and project tracking.",
		},
		home_office: {
			low: "Invest in essential equipment and set up a dedicated workspace.",
			medium: "Optimize the ergonomics and environment of your home office.",
		},
	};

	return percentage < 50 ? descriptions[category].low : descriptions[category].medium;
}
