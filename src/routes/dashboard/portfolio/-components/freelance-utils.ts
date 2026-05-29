import type { SkillProficiency } from "./freelance-types";

export function calculateProfileStrength(
	profile: { headline: string; bio: string; hourlyRate: number; availableHoursPerWeek: number } | null,
	skills: { proficiency: SkillProficiency }[],
	packages: unknown[],
	portfolio: unknown[],
	testimonials: unknown[],
): {
	score: number;
	sections: { name: string; score: number; maxScore: number; suggestions: string[] }[];
} {
	const sections = [
		{
			name: "Basic Profile",
			score: 0,
			maxScore: 25,
			suggestions: [] as string[],
		},
		{
			name: "Skills",
			score: 0,
			maxScore: 20,
			suggestions: [] as string[],
		},
		{
			name: "Services",
			score: 0,
			maxScore: 20,
			suggestions: [] as string[],
		},
		{
			name: "Portfolio",
			score: 0,
			maxScore: 20,
			suggestions: [] as string[],
		},
		{
			name: "Testimonials",
			score: 0,
			maxScore: 15,
			suggestions: [] as string[],
		},
	];

	// Profile section
	if (profile?.headline && profile.headline.length > 20) sections[0].score += 8;
	else sections[0].suggestions.push("Add a catchy title (min 20 characters)");

	if (profile?.bio && profile.bio.length > 100) sections[0].score += 8;
	else sections[0].suggestions.push("Write a detailed bio (min 100 characters)");

	if (profile?.hourlyRate && profile.hourlyRate > 0) sections[0].score += 5;
	else sections[0].suggestions.push("Set your hourly rate");

	if (profile?.availableHoursPerWeek && profile.availableHoursPerWeek > 0) sections[0].score += 4;
	else sections[0].suggestions.push("Indicate your availability");

	// Skills section
	const expertSkills = skills.filter((s) => s.proficiency === "expert").length;
	sections[1].score += Math.min(10, skills.length * 1.5);
	sections[1].score += Math.min(10, expertSkills * 3);
	if (skills.length < 5) sections[1].suggestions.push("Add more skills (min 5)");
	if (expertSkills < 2) sections[1].suggestions.push("Develop skills to expert level");

	// Services section
	sections[2].score += Math.min(20, packages.length * 7);
	if (packages.length < 3) sections[2].suggestions.push("Offer 3 packages (basic, standard, premium)");

	// Portfolio section
	sections[3].score += Math.min(20, portfolio.length * 4);
	if (portfolio.length < 4) sections[3].suggestions.push("Add more projects to your portfolio (min 4)");

	// Testimonials section
	sections[4].score += Math.min(15, testimonials.length * 4);
	if (testimonials.length < 3) sections[4].suggestions.push("Get more client testimonials (min 3)");

	const totalScore = sections.reduce((sum, s) => sum + s.score, 0);

	return { score: totalScore, sections };
}
