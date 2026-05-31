import type { AvailabilitySlot, MentorStatus, Skill, UserGoals } from "./mentors-types";

export function calculateMatchScore(
	mentor: {
		skills?: Skill[] | null;
		industries?: string[] | null;
		careerPath?: string[] | null;
		status: MentorStatus;
		availability?: AvailabilitySlot[] | null;
	},
	userGoals: UserGoals,
): number {
	let score = 0;
	const maxScore = 100;

	// Skills match (40 points)
	const mentorSkills = mentor.skills ?? [];
	const skillMatches = mentorSkills.filter((skill) =>
		userGoals.skills.some(
			(userSkill) =>
				skill.name.toLowerCase().includes(userSkill.toLowerCase()) ||
				userSkill.toLowerCase().includes(skill.name.toLowerCase()),
		),
	);
	score += Math.min(40, (skillMatches.length / Math.max(userGoals.skills.length, 1)) * 40);

	// Industry match (30 points)
	const mentorIndustries = mentor.industries ?? [];
	const industryMatches = mentorIndustries.filter((industry) =>
		userGoals.industries.some(
			(userIndustry) =>
				industry.toLowerCase().includes(userIndustry.toLowerCase()) ||
				userIndustry.toLowerCase().includes(industry.toLowerCase()),
		),
	);
	score += Math.min(30, (industryMatches.length / Math.max(userGoals.industries.length, 1)) * 30);

	// Career path relevance (20 points)
	const mentorCareerPath = mentor.careerPath ?? [];
	if (mentorCareerPath.some((path) => path.toLowerCase().includes(userGoals.targetRole.toLowerCase()))) {
		score += 20;
	}

	// Availability bonus (10 points)
	const mentorAvailability = mentor.availability ?? [];
	if (mentor.status === "available" && mentorAvailability.length > 2) {
		score += 10;
	} else if (mentor.status === "available") {
		score += 5;
	}

	return Math.round(Math.min(maxScore, score));
}

export { formatDate } from "@/utils/format-date";

export function formatDateTime(dateString: string | Date): string {
	const date = typeof dateString === "string" ? new Date(dateString) : dateString;
	return date.toLocaleString("fr-FR", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getInitials(firstName: string, lastName: string): string {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
