import { generateId } from "@/utils/string";

import type { CareerGoal, LearningResource, Milestone, Skill, StudyPlanData, StudyTask } from "./study-plan-types";

export { generateId };

export function getDefaultStudyPlanData(): StudyPlanData {
	return {
		careerGoal: null,
		skills: [],
		resources: [],
		tasks: [],
		milestones: [],
		flashcards: [],
		streak: {
			currentStreak: 0,
			longestStreak: 0,
			lastStudyDate: "",
			totalStudyDays: 0,
			totalStudyMinutes: 0,
			weeklyGoal: 300, // 5 hours per week
			badges: [],
		},
		lastUpdated: new Date().toISOString(),
	};
}

export { formatDate } from "@/utils/format-date";

export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${minutes}min`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getDaysUntil(date: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const target = new Date(date);
	target.setHours(0, 0, 0, 0);
	return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isToday(date: string): boolean {
	const today = new Date().toISOString().split("T")[0];
	return date.split("T")[0] === today;
}

export function isOverdue(date: string): boolean {
	return getDaysUntil(date) < 0;
}

// AI Generation functions (simulated)
export function generateAIRoadmap(
	goal: CareerGoal,
	currentSkills: Skill[],
): { skills: Skill[]; milestones: Milestone[] } {
	const roleSkillMap: Record<string, { name: string; category: Skill["category"] }[]> = {
		healthcare: [
			{ name: "Patient Care", category: "technical" },
			{ name: "Medical Terminology", category: "technical" },
			{ name: "First Aid & CPR", category: "certification" },
			{ name: "Communication", category: "soft" },
			{ name: "Empathy", category: "soft" },
			{ name: "French Medical Terms", category: "language" },
		],
		industrial: [
			{ name: "Machine Operation", category: "technical" },
			{ name: "Technical Reading", category: "technical" },
			{ name: "Safety Procedures", category: "technical" },
			{ name: "Problem Solving", category: "soft" },
			{ name: "ISO 9001", category: "certification" },
			{ name: "Technical English", category: "language" },
		],
		hse: [
			{ name: "Risk Assessment", category: "technical" },
			{ name: "Safety Management", category: "technical" },
			{ name: "ISO 45001", category: "certification" },
			{ name: "Leadership", category: "soft" },
			{ name: "NEBOSH", category: "certification" },
			{ name: "Regulatory Compliance", category: "technical" },
		],
		technology: [
			{ name: "Programming", category: "technical" },
			{ name: "Data Analysis", category: "technical" },
			{ name: "Cloud Computing", category: "technical" },
			{ name: "Agile Methodology", category: "soft" },
			{ name: "AWS Certification", category: "certification" },
			{ name: "Technical English", category: "language" },
		],
		default: [
			{ name: "Communication", category: "soft" },
			{ name: "Problem Solving", category: "soft" },
			{ name: "Time Management", category: "soft" },
			{ name: "Leadership", category: "soft" },
			{ name: "Industry Knowledge", category: "technical" },
			{ name: "Professional English", category: "language" },
		],
	};

	const industrySkills = roleSkillMap[goal.industry] || roleSkillMap.default;
	const existingSkillNames = currentSkills.map((s) => s.name.toLowerCase());

	const newSkills: Skill[] = industrySkills
		.filter((s) => !existingSkillNames.includes(s.name.toLowerCase()))
		.map((skill, index) => ({
			id: generateId(),
			name: skill.name,
			category: skill.category,
			currentLevel: 1,
			targetLevel: 4 + (index < 2 ? 1 : 0),
			priority: index < 2 ? "high" : index < 4 ? "medium" : "low",
		}));

	const monthsPerMilestone = Math.max(1, Math.floor(goal.timeline / 4));
	const milestones: Milestone[] = [
		{
			id: generateId(),
			title: "Foundation Complete",
			description: "Complete introductory courses and understand basics",
			targetDate: new Date(Date.now() + monthsPerMilestone * 30 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			skillIds: newSkills.slice(0, 2).map((s) => s.id),
		},
		{
			id: generateId(),
			title: "Intermediate Progress",
			description: "Build practical skills through projects and exercises",
			targetDate: new Date(Date.now() + monthsPerMilestone * 2 * 30 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			skillIds: newSkills.slice(0, 4).map((s) => s.id),
		},
		{
			id: generateId(),
			title: "Advanced Skills",
			description: "Master complex concepts and earn certifications",
			targetDate: new Date(Date.now() + monthsPerMilestone * 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			skillIds: newSkills.slice(2, 6).map((s) => s.id),
		},
		{
			id: generateId(),
			title: "Career Ready",
			description: `Ready for ${goal.targetRole} position`,
			targetDate: new Date(Date.now() + goal.timeline * 30 * 24 * 60 * 60 * 1000).toISOString(),
			completed: false,
			skillIds: newSkills.map((s) => s.id),
		},
	];

	return { skills: newSkills, milestones };
}

export function generateAIResources(skill: Skill): LearningResource[] {
	const resourceTemplates: Record<string, Omit<LearningResource, "id" | "skillId" | "completed">[]> = {
		technical: [
			{
				title: `${skill.name} - Complete Course`,
				type: "course",
				platform: "Coursera",
				url: "https://coursera.org",
				duration: "40 hours",
			},
			{
				title: `Practical ${skill.name} Guide`,
				type: "book",
				platform: "O'Reilly",
				url: "https://oreilly.com",
				duration: "15 hours",
			},
			{
				title: `${skill.name} Quick Tutorial`,
				type: "tutorial",
				platform: "YouTube",
				url: "https://youtube.com",
				duration: "2 hours",
			},
		],
		soft: [
			{
				title: `Mastering ${skill.name}`,
				type: "course",
				platform: "LinkedIn Learning",
				url: "https://linkedin.com/learning",
				duration: "8 hours",
			},
			{
				title: `${skill.name} in Practice`,
				type: "video",
				platform: "TED Talks",
				url: "https://ted.com",
				duration: "1 hour",
			},
		],
		certification: [
			{
				title: `${skill.name} Certification Prep`,
				type: "certification",
				platform: "Official Provider",
				url: "#",
				duration: "60 hours",
			},
			{
				title: `${skill.name} Study Guide`,
				type: "book",
				platform: "Amazon",
				url: "https://amazon.com",
				duration: "20 hours",
			},
		],
		language: [
			{
				title: `${skill.name} for Professionals`,
				type: "course",
				platform: "Duolingo",
				url: "https://duolingo.com",
				duration: "30 hours",
			},
			{
				title: `Business ${skill.name}`,
				type: "course",
				platform: "Babbel",
				url: "https://babbel.com",
				duration: "25 hours",
			},
		],
	};

	const templates = resourceTemplates[skill.category] || resourceTemplates.technical;
	return templates.map((template) => ({
		...template,
		id: generateId(),
		skillId: skill.id,
		completed: false,
	}));
}

export function generateWeeklySchedule(
	skills: Skill[],
	resources: LearningResource[],
	weeklyMinutes: number,
): StudyTask[] {
	const tasks: StudyTask[] = [];
	const today = new Date();
	const priorityOrder = { high: 0, medium: 1, low: 2 };
	const sortedSkills = [...skills].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

	const dailyMinutes = Math.floor(weeklyMinutes / 7);
	const taskTypes: StudyTask["type"][] = ["study", "practice", "review"];

	for (let day = 0; day < 7; day++) {
		const date = new Date(today);
		date.setDate(date.getDate() + day);
		const dateStr = date.toISOString().split("T")[0];

		const skillIndex = day % Math.min(sortedSkills.length, 3);
		const skill = sortedSkills[skillIndex];
		if (!skill) continue;

		const skillResources = resources.filter((r) => r.skillId === skill.id && !r.completed);
		const resource = skillResources[0];

		tasks.push({
			id: generateId(),
			title: `Study: ${skill.name}`,
			description: resource ? `Work on: ${resource.title}` : `Practice ${skill.name} fundamentals`,
			skillId: skill.id,
			resourceId: resource?.id,
			scheduledDate: dateStr,
			duration: dailyMinutes,
			completed: false,
			type: taskTypes[day % 3],
		});
	}

	return tasks;
}
