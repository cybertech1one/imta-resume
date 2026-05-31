import {
	BENEFITS_PERCENTAGE,
	BONUS_PERCENTAGE,
	experienceMultipliers,
	jobTitles,
	regions,
} from "./salary-calculator-config";
import type {
	CareerProjection,
	ExperienceLevel,
	Field,
	RegionalComparison,
	SalaryBreakdown,
} from "./salary-calculator-types";

export function calculateSalary(
	field: Field,
	jobTitleId: string,
	experience: ExperienceLevel,
	regionId: string,
	includeBenefits: boolean,
): SalaryBreakdown {
	const job = jobTitles[field].find((j) => j.id === jobTitleId);
	const region = regions.find((r) => r.id === regionId);

	if (!job || !region) {
		return {
			baseSalary: { min: 0, max: 0, median: 0 },
			bonuses: { min: 0, max: 0, median: 0 },
			benefitsValue: { min: 0, max: 0, median: 0 },
			total: { min: 0, max: 0, median: 0 },
		};
	}

	const baseMultiplier = experienceMultipliers[experience] * region.multiplier;
	const baseSalaryMedian = Math.round(job.baseSalary * baseMultiplier);
	const baseSalaryMin = Math.round(baseSalaryMedian * 0.85);
	const baseSalaryMax = Math.round(baseSalaryMedian * 1.2);

	const bonusMedian = Math.round(baseSalaryMedian * BONUS_PERCENTAGE);
	const bonusMin = Math.round(bonusMedian * 0.5);
	const bonusMax = Math.round(bonusMedian * 2);

	const benefitsMedian = includeBenefits ? Math.round(baseSalaryMedian * BENEFITS_PERCENTAGE) : 0;
	const benefitsMin = includeBenefits ? Math.round(benefitsMedian * 0.8) : 0;
	const benefitsMax = includeBenefits ? Math.round(benefitsMedian * 1.3) : 0;

	return {
		baseSalary: { min: baseSalaryMin, max: baseSalaryMax, median: baseSalaryMedian },
		bonuses: { min: bonusMin, max: bonusMax, median: bonusMedian },
		benefitsValue: { min: benefitsMin, max: benefitsMax, median: benefitsMedian },
		total: {
			min: baseSalaryMin + bonusMin + benefitsMin,
			max: baseSalaryMax + bonusMax + benefitsMax,
			median: baseSalaryMedian + bonusMedian + benefitsMedian,
		},
	};
}

export function getNationalAverage(field: Field, jobTitleId: string): number {
	const job = jobTitles[field].find((j) => j.id === jobTitleId);
	return job ? job.baseSalary : 5000;
}

export function calculateCareerProjection(
	field: Field,
	jobTitleId: string,
	currentExperience: ExperienceLevel,
): CareerProjection[] {
	const job = jobTitles[field].find((j) => j.id === jobTitleId);
	const jobs = jobTitles[field];
	const currentIndex = jobs.findIndex((j) => j.id === jobTitleId);

	if (!job) return [];

	const baseYear = new Date().getFullYear();
	const projections: CareerProjection[] = [];

	const experienceYears: Record<ExperienceLevel, number> = {
		"0-1": 0,
		"1-3": 2,
		"3-5": 4,
		"5-10": 7,
		"10+": 12,
	};

	const currentYears = experienceYears[currentExperience];
	const currentPosition = job.label;

	for (let year = 0; year <= 5; year++) {
		const futureYears = currentYears + year;
		let experienceLevel: ExperienceLevel = "0-1";
		if (futureYears >= 10) experienceLevel = "10+";
		else if (futureYears >= 5) experienceLevel = "5-10";
		else if (futureYears >= 3) experienceLevel = "3-5";
		else if (futureYears >= 1) experienceLevel = "1-3";

		let position = currentPosition;
		let positionIndex = currentIndex;
		if (year >= 3 && currentIndex < jobs.length - 1) {
			positionIndex = Math.min(currentIndex + 1, jobs.length - 1);
			position = jobs[positionIndex].label;
		}

		const salary = Math.round(jobs[positionIndex].baseSalary * experienceMultipliers[experienceLevel]);
		const growthRate = year > 0 ? ((salary - projections[year - 1].salary) / projections[year - 1].salary) * 100 : 0;

		projections.push({
			year: baseYear + year,
			salary,
			position,
			growthRate: Math.round(growthRate * 10) / 10,
		});
	}

	return projections;
}

export function getRegionalComparison(
	field: Field,
	jobTitleId: string,
	experience: ExperienceLevel,
): RegionalComparison[] {
	const job = jobTitles[field].find((j) => j.id === jobTitleId);
	if (!job) return [];

	return regions.map((region) => ({
		region: region.label,
		salary: Math.round(job.baseSalary * experienceMultipliers[experience] * region.multiplier),
		costOfLiving: region.costOfLiving,
		jobAvailability: region.jobs,
	}));
}

export const formatCurrency = (amount: number) => `${amount.toLocaleString("fr-FR")} DH`;
