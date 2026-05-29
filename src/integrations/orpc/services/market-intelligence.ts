import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	employerDatabase,
	type jobListing,
	marketSalaryData,
	regionalJobStats,
	skillDemand,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================================================
// TYPES
// ============================================================================

export type MarketSalaryData = typeof marketSalaryData.$inferSelect;
export type SkillDemand = typeof skillDemand.$inferSelect;
export type RegionalJobStats = typeof regionalJobStats.$inferSelect;
export type EmployerProfile = typeof employerDatabase.$inferSelect;
export type JobListing = typeof jobListing.$inferSelect;

// ============================================================================
// SALARY DATA SERVICE
// ============================================================================

export const salaryDataService = {
	async list(filters?: { field?: string; region?: string; experienceLevel?: string }) {
		const conditions = [];
		if (filters?.field) conditions.push(eq(marketSalaryData.field, filters.field));
		if (filters?.region) conditions.push(eq(marketSalaryData.region, filters.region));
		if (filters?.experienceLevel) conditions.push(eq(marketSalaryData.experienceLevel, filters.experienceLevel));

		return db
			.select()
			.from(marketSalaryData)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(marketSalaryData.field, marketSalaryData.role);
	},

	async getByRole(role: string, region?: string) {
		const conditions = [eq(marketSalaryData.role, role)];
		if (region) conditions.push(eq(marketSalaryData.region, region));

		return db
			.select()
			.from(marketSalaryData)
			.where(and(...conditions));
	},

	async predictSalary(input: {
		field: string;
		role: string;
		experienceLevel: string;
		region?: string;
		skills?: string[];
	}): Promise<{ min: number; median: number; max: number; factors: string[] }> {
		// Get base salary data
		const conditions = [
			eq(marketSalaryData.field, input.field),
			eq(marketSalaryData.experienceLevel, input.experienceLevel),
		];
		if (input.region) conditions.push(eq(marketSalaryData.region, input.region));

		const [baseSalary] = await db
			.select()
			.from(marketSalaryData)
			.where(and(...conditions))
			.limit(1);

		// Default salaries if no data
		const defaults = {
			entry: { salaryMin: 36000, salaryMedian: 48000, salaryMax: 72000 },
			mid: { salaryMin: 72000, salaryMedian: 96000, salaryMax: 144000 },
			senior: { salaryMin: 120000, salaryMedian: 180000, salaryMax: 300000 },
		};

		const base = baseSalary || defaults[input.experienceLevel as keyof typeof defaults] || defaults.mid;
		const factors: string[] = [];

		let multiplier = 1;

		// Regional adjustments
		const regionMultipliers: Record<string, number> = {
			casablanca: 1.15,
			rabat: 1.1,
			tanger: 1.05,
			marrakech: 0.95,
			fes: 0.9,
			agadir: 0.9,
		};

		if (input.region && regionMultipliers[input.region.toLowerCase()]) {
			multiplier *= regionMultipliers[input.region.toLowerCase()];
			factors.push(`Region adjustment: ${input.region}`);
		}

		// Skill premium calculation
		if (input.skills && input.skills.length > 0) {
			const highDemandSkills = await db
				.select()
				.from(skillDemand)
				.where(and(sql`${skillDemand.skill} = ANY(${input.skills})`, gte(skillDemand.demandScore, 70)));

			if (highDemandSkills.length > 0) {
				const avgBoost =
					highDemandSkills.reduce((sum, s) => sum + (s.averageSalaryBoost || 0), 0) / highDemandSkills.length;
				if (avgBoost > 0) {
					multiplier *= 1 + avgBoost / 100000; // Convert boost to multiplier
					factors.push(`High-demand skills premium: ${highDemandSkills.map((s) => s.skill).join(", ")}`);
				}
			}
		}

		return {
			min: Math.round((baseSalary?.salaryMin || base.salaryMin) * multiplier),
			median: Math.round((baseSalary?.salaryMedian || base.salaryMedian) * multiplier),
			max: Math.round((baseSalary?.salaryMax || base.salaryMax) * multiplier),
			factors,
		};
	},

	async seed() {
		const salaryData = [
			// Healthcare
			{
				role: "Infirmier Polyvalent",
				roleFr: "Infirmier Polyvalent",
				field: "healthcare",
				experienceLevel: "entry",
				salaryMin: 42000,
				salaryMedian: 54000,
				salaryMax: 72000,
				demandScore: 95,
			},
			{
				role: "Infirmier Polyvalent",
				roleFr: "Infirmier Polyvalent",
				field: "healthcare",
				experienceLevel: "mid",
				salaryMin: 60000,
				salaryMedian: 84000,
				salaryMax: 120000,
				demandScore: 95,
			},
			{
				role: "Infirmier Polyvalent",
				roleFr: "Infirmier Polyvalent",
				field: "healthcare",
				experienceLevel: "senior",
				salaryMin: 96000,
				salaryMedian: 144000,
				salaryMax: 216000,
				demandScore: 90,
			},
			{
				role: "Sage-Femme",
				roleFr: "Sage-Femme",
				field: "healthcare",
				experienceLevel: "entry",
				salaryMin: 48000,
				salaryMedian: 60000,
				salaryMax: 84000,
				demandScore: 98,
			},
			{
				role: "Sage-Femme",
				roleFr: "Sage-Femme",
				field: "healthcare",
				experienceLevel: "mid",
				salaryMin: 72000,
				salaryMedian: 96000,
				salaryMax: 144000,
				demandScore: 98,
			},
			{
				role: "Aide Soignant",
				roleFr: "Aide Soignant",
				field: "healthcare",
				experienceLevel: "entry",
				salaryMin: 30000,
				salaryMedian: 42000,
				salaryMax: 54000,
				demandScore: 90,
			},
			// HSE
			{
				role: "Technicien HSE",
				roleFr: "Technicien HSE",
				field: "hse",
				experienceLevel: "entry",
				salaryMin: 48000,
				salaryMedian: 72000,
				salaryMax: 96000,
				demandScore: 85,
			},
			{
				role: "Technicien HSE",
				roleFr: "Technicien HSE",
				field: "hse",
				experienceLevel: "mid",
				salaryMin: 84000,
				salaryMedian: 120000,
				salaryMax: 180000,
				demandScore: 88,
			},
			{
				role: "Responsable HSE",
				roleFr: "Responsable HSE",
				field: "hse",
				experienceLevel: "senior",
				salaryMin: 180000,
				salaryMedian: 264000,
				salaryMax: 400000,
				demandScore: 92,
			},
			{
				role: "Ingenieur HSE",
				roleFr: "Ingénieur HSE",
				field: "hse",
				experienceLevel: "mid",
				salaryMin: 144000,
				salaryMedian: 220000,
				salaryMax: 336000,
				demandScore: 90,
			},
			// Industrial
			{
				role: "Soudeur",
				roleFr: "Soudeur",
				field: "industrial",
				experienceLevel: "entry",
				salaryMin: 36000,
				salaryMedian: 48000,
				salaryMax: 66000,
				demandScore: 80,
			},
			{
				role: "Soudeur",
				roleFr: "Soudeur",
				field: "industrial",
				experienceLevel: "mid",
				salaryMin: 54000,
				salaryMedian: 72000,
				salaryMax: 108000,
				demandScore: 82,
			},
			{
				role: "Conducteur Engins",
				roleFr: "Conducteur d'Engins",
				field: "industrial",
				experienceLevel: "entry",
				salaryMin: 48000,
				salaryMedian: 72000,
				salaryMax: 96000,
				demandScore: 88,
			},
			{
				role: "Conducteur Engins",
				roleFr: "Conducteur d'Engins",
				field: "industrial",
				experienceLevel: "mid",
				salaryMin: 72000,
				salaryMedian: 96000,
				salaryMax: 144000,
				demandScore: 90,
			},
			{
				role: "Mecanicien Industriel",
				roleFr: "Mécanicien Industriel",
				field: "industrial",
				experienceLevel: "entry",
				salaryMin: 42000,
				salaryMedian: 60000,
				salaryMax: 84000,
				demandScore: 85,
			},
			{
				role: "Mecanicien Industriel",
				roleFr: "Mécanicien Industriel",
				field: "industrial",
				experienceLevel: "mid",
				salaryMin: 72000,
				salaryMedian: 108000,
				salaryMax: 156000,
				demandScore: 87,
			},
			{
				role: "Technicien Electromecanique",
				roleFr: "Technicien Électromécanique",
				field: "industrial",
				experienceLevel: "entry",
				salaryMin: 48000,
				salaryMedian: 66000,
				salaryMax: 90000,
				demandScore: 88,
			},
			{
				role: "Technicien Electromecanique",
				roleFr: "Technicien Électromécanique",
				field: "industrial",
				experienceLevel: "mid",
				salaryMin: 78000,
				salaryMedian: 108000,
				salaryMax: 156000,
				demandScore: 90,
			},
		];

		for (const data of salaryData) {
			const existing = await db
				.select()
				.from(marketSalaryData)
				.where(and(eq(marketSalaryData.role, data.role), eq(marketSalaryData.experienceLevel, data.experienceLevel)));

			if (existing.length === 0) {
				await db.insert(marketSalaryData).values({
					id: generateId(),
					...data,
					lastUpdated: new Date(),
				});
			}
		}

		return this.list();
	},
};

// ============================================================================
// SKILL DEMAND SERVICE
// ============================================================================

export const skillDemandService = {
	async list(filters?: { field?: string; category?: string }) {
		const conditions = [];
		if (filters?.field) conditions.push(eq(skillDemand.field, filters.field));
		if (filters?.category) conditions.push(eq(skillDemand.category, filters.category));

		return db
			.select()
			.from(skillDemand)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(skillDemand.demandScore));
	},

	async getTopSkills(field?: string, limit: number = 10) {
		const conditions = [];
		if (field) conditions.push(eq(skillDemand.field, field));

		return db
			.select()
			.from(skillDemand)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(skillDemand.demandScore))
			.limit(limit);
	},

	async getRisingSkills(limit: number = 10) {
		return db
			.select()
			.from(skillDemand)
			.where(eq(skillDemand.growthTrend, "rising"))
			.orderBy(desc(skillDemand.growthPercent))
			.limit(limit);
	},

	async seed() {
		const skills = [
			// Healthcare skills
			{
				skill: "Patient Care",
				skillFr: "Soins aux Patients",
				field: "healthcare",
				category: "technical",
				demandScore: 95,
				growthTrend: "rising",
				growthPercent: 8,
				averageSalaryBoost: 5000,
			},
			{
				skill: "Emergency Care",
				skillFr: "Soins d'Urgence",
				field: "healthcare",
				category: "technical",
				demandScore: 92,
				growthTrend: "rising",
				growthPercent: 12,
				averageSalaryBoost: 8000,
			},
			{
				skill: "Medical Equipment",
				skillFr: "Équipement Médical",
				field: "healthcare",
				category: "technical",
				demandScore: 85,
				growthTrend: "stable",
				growthPercent: 3,
				averageSalaryBoost: 4000,
			},
			{
				skill: "Obstetrics",
				skillFr: "Obstétrique",
				field: "healthcare",
				category: "technical",
				demandScore: 90,
				growthTrend: "rising",
				growthPercent: 6,
				averageSalaryBoost: 10000,
			},
			// HSE skills
			{
				skill: "Risk Assessment",
				skillFr: "Évaluation des Risques",
				field: "hse",
				category: "technical",
				demandScore: 95,
				growthTrend: "rising",
				growthPercent: 15,
				averageSalaryBoost: 12000,
			},
			{
				skill: "ISO 45001",
				skillFr: "ISO 45001",
				field: "hse",
				category: "certification",
				demandScore: 92,
				growthTrend: "rising",
				growthPercent: 20,
				averageSalaryBoost: 15000,
			},
			{
				skill: "NEBOSH",
				skillFr: "NEBOSH",
				field: "hse",
				category: "certification",
				demandScore: 88,
				growthTrend: "rising",
				growthPercent: 18,
				averageSalaryBoost: 18000,
			},
			{
				skill: "Safety Audits",
				skillFr: "Audits Sécurité",
				field: "hse",
				category: "technical",
				demandScore: 90,
				growthTrend: "stable",
				growthPercent: 5,
				averageSalaryBoost: 10000,
			},
			{
				skill: "Environmental Compliance",
				skillFr: "Conformité Environnementale",
				field: "hse",
				category: "technical",
				demandScore: 85,
				growthTrend: "rising",
				growthPercent: 22,
				averageSalaryBoost: 8000,
			},
			// Industrial skills
			{
				skill: "Welding",
				skillFr: "Soudure",
				field: "industrial",
				category: "technical",
				demandScore: 88,
				growthTrend: "stable",
				growthPercent: 4,
				averageSalaryBoost: 6000,
			},
			{
				skill: "CNC Operation",
				skillFr: "Opération CNC",
				field: "industrial",
				category: "technical",
				demandScore: 85,
				growthTrend: "rising",
				growthPercent: 10,
				averageSalaryBoost: 8000,
			},
			{
				skill: "Hydraulic Systems",
				skillFr: "Systèmes Hydrauliques",
				field: "industrial",
				category: "technical",
				demandScore: 82,
				growthTrend: "stable",
				growthPercent: 3,
				averageSalaryBoost: 5000,
			},
			{
				skill: "PLC Programming",
				skillFr: "Programmation PLC",
				field: "industrial",
				category: "technical",
				demandScore: 90,
				growthTrend: "rising",
				growthPercent: 15,
				averageSalaryBoost: 12000,
			},
			{
				skill: "Preventive Maintenance",
				skillFr: "Maintenance Préventive",
				field: "industrial",
				category: "technical",
				demandScore: 92,
				growthTrend: "rising",
				growthPercent: 8,
				averageSalaryBoost: 7000,
			},
			{
				skill: "CACES Certification",
				skillFr: "Certification CACES",
				field: "industrial",
				category: "certification",
				demandScore: 95,
				growthTrend: "stable",
				growthPercent: 5,
				averageSalaryBoost: 10000,
			},
			// Soft skills
			{
				skill: "Communication",
				skillFr: "Communication",
				field: null,
				category: "soft",
				demandScore: 90,
				growthTrend: "stable",
				growthPercent: 2,
				averageSalaryBoost: 3000,
			},
			{
				skill: "Teamwork",
				skillFr: "Travail d'Équipe",
				field: null,
				category: "soft",
				demandScore: 88,
				growthTrend: "stable",
				growthPercent: 1,
				averageSalaryBoost: 2000,
			},
			{
				skill: "French",
				skillFr: "Français",
				field: null,
				category: "language",
				demandScore: 98,
				growthTrend: "stable",
				growthPercent: 0,
				averageSalaryBoost: 5000,
			},
			{
				skill: "English",
				skillFr: "Anglais",
				field: null,
				category: "language",
				demandScore: 85,
				growthTrend: "rising",
				growthPercent: 10,
				averageSalaryBoost: 8000,
			},
		];

		for (const data of skills) {
			const existing = await db.select().from(skillDemand).where(eq(skillDemand.skill, data.skill));

			if (existing.length === 0) {
				await db.insert(skillDemand).values({
					id: generateId(),
					...data,
					lastUpdated: new Date(),
				});
			}
		}

		return this.list();
	},
};

// ============================================================================
// REGIONAL STATS SERVICE
// ============================================================================

export const regionalStatsService = {
	async list() {
		return db.select().from(regionalJobStats).orderBy(desc(regionalJobStats.totalJobs));
	},

	async getByRegion(region: string) {
		const [stats] = await db.select().from(regionalJobStats).where(eq(regionalJobStats.region, region));
		return stats;
	},

	async seed() {
		const regions = [
			{
				region: "casablanca-settat",
				regionFr: "Casablanca-Settat",
				totalJobs: 45000,
				jobGrowth: 8.5,
				averageSalary: 96000,
				unemploymentRate: 12.5,
				costOfLiving: "high",
				qualityOfLife: 72,
				topIndustries: [
					{ industry: "Services", jobCount: 18000 },
					{ industry: "Industrial", jobCount: 12000 },
					{ industry: "Healthcare", jobCount: 8000 },
				],
				skillsInDemand: ["French", "Sales", "Customer Service", "Accounting", "IT"],
			},
			{
				region: "rabat-sale-kenitra",
				regionFr: "Rabat-Salé-Kénitra",
				totalJobs: 28000,
				jobGrowth: 6.2,
				averageSalary: 84000,
				unemploymentRate: 11.8,
				costOfLiving: "medium",
				qualityOfLife: 78,
				topIndustries: [
					{ industry: "Government", jobCount: 12000 },
					{ industry: "Services", jobCount: 8000 },
					{ industry: "Education", jobCount: 5000 },
				],
				skillsInDemand: ["Administration", "French", "IT", "Legal", "Finance"],
			},
			{
				region: "tanger-tetouan-al-hoceima",
				regionFr: "Tanger-Tétouan-Al Hoceïma",
				totalJobs: 22000,
				jobGrowth: 12.3,
				averageSalary: 78000,
				unemploymentRate: 10.5,
				costOfLiving: "medium",
				qualityOfLife: 70,
				topIndustries: [
					{ industry: "Automotive", jobCount: 8000 },
					{ industry: "Logistics", jobCount: 6000 },
					{ industry: "Manufacturing", jobCount: 5000 },
				],
				skillsInDemand: ["Welding", "Assembly", "Quality Control", "Logistics", "Spanish"],
			},
			{
				region: "marrakech-safi",
				regionFr: "Marrakech-Safi",
				totalJobs: 18000,
				jobGrowth: 5.8,
				averageSalary: 66000,
				unemploymentRate: 14.2,
				costOfLiving: "medium",
				qualityOfLife: 68,
				topIndustries: [
					{ industry: "Tourism", jobCount: 8000 },
					{ industry: "Services", jobCount: 5000 },
					{ industry: "Agriculture", jobCount: 3000 },
				],
				skillsInDemand: ["Hospitality", "Languages", "Customer Service", "Culinary", "Crafts"],
			},
			{
				region: "fes-meknes",
				regionFr: "Fès-Meknès",
				totalJobs: 15000,
				jobGrowth: 4.2,
				averageSalary: 60000,
				unemploymentRate: 15.5,
				costOfLiving: "low",
				qualityOfLife: 65,
				topIndustries: [
					{ industry: "Manufacturing", jobCount: 5000 },
					{ industry: "Services", jobCount: 4500 },
					{ industry: "Agriculture", jobCount: 3000 },
				],
				skillsInDemand: ["Textile", "Leather Working", "Crafts", "Sales", "French"],
			},
		];

		for (const data of regions) {
			const existing = await db.select().from(regionalJobStats).where(eq(regionalJobStats.region, data.region));

			if (existing.length === 0) {
				await db.insert(regionalJobStats).values({
					id: generateId(),
					...data,
					lastUpdated: new Date(),
				});
			}
		}

		return this.list();
	},
};

// ============================================================================
// JOB MATCH ALGORITHM
// ============================================================================

export const jobMatchService = {
	/**
	 * Calculate match score between user profile and job listing
	 * Weights: Skills (40%) + Experience (25%) + Location (20%) + Salary (15%)
	 */
	calculateMatchScore(
		userProfile: {
			skills: string[];
			experienceLevel: string;
			preferredLocations: string[];
			salaryExpectation?: { min: number; max: number };
			field?: string;
		},
		job: {
			skills: string[];
			experienceLevel: string;
			location: string;
			salaryMin?: number;
			salaryMax?: number;
			field?: string;
		},
	): { score: number; breakdown: Record<string, number>; matchDetails: string[] } {
		const breakdown: Record<string, number> = {};
		const matchDetails: string[] = [];

		// Skills match (40%)
		const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
		const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
		const matchedSkills = userSkillsLower.filter((s) => jobSkillsLower.includes(s));
		const skillScore = jobSkillsLower.length > 0 ? (matchedSkills.length / jobSkillsLower.length) * 40 : 40;
		breakdown.skills = skillScore;
		if (matchedSkills.length > 0) {
			matchDetails.push(`Skills match: ${matchedSkills.join(", ")}`);
		}

		// Experience match (25%)
		const expLevels = ["entry", "mid", "senior"];
		const userExpIndex = expLevels.indexOf(userProfile.experienceLevel);
		const jobExpIndex = expLevels.indexOf(job.experienceLevel);
		const expDiff = Math.abs(userExpIndex - jobExpIndex);
		const expScore = expDiff === 0 ? 25 : expDiff === 1 ? 15 : 5;
		breakdown.experience = expScore;
		if (expDiff === 0) {
			matchDetails.push("Experience level matches perfectly");
		} else if (expDiff === 1) {
			matchDetails.push("Experience level is close");
		}

		// Location match (20%)
		const locationMatch = userProfile.preferredLocations.some(
			(loc) => loc.toLowerCase() === job.location.toLowerCase(),
		);
		const locationScore = locationMatch ? 20 : 10;
		breakdown.location = locationScore;
		if (locationMatch) {
			matchDetails.push(`Preferred location: ${job.location}`);
		}

		// Salary match (15%)
		let salaryScore = 15;
		if (userProfile.salaryExpectation && job.salaryMin && job.salaryMax) {
			const userMid = (userProfile.salaryExpectation.min + userProfile.salaryExpectation.max) / 2;
			const jobMid = (job.salaryMin + job.salaryMax) / 2;
			const salaryDiff = Math.abs(userMid - jobMid) / jobMid;
			salaryScore = salaryDiff < 0.1 ? 15 : salaryDiff < 0.25 ? 10 : 5;
			if (salaryScore >= 10) {
				matchDetails.push(`Salary range: ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} MAD`);
			}
		}
		breakdown.salary = salaryScore;

		// Field bonus
		if (userProfile.field && job.field && userProfile.field === job.field) {
			matchDetails.push(`Field match: ${job.field}`);
		}

		const totalScore = Math.round(breakdown.skills + breakdown.experience + breakdown.location + breakdown.salary);

		return { score: totalScore, breakdown, matchDetails };
	},
};

// ============================================================================
// EMPLOYER DATABASE SERVICE
// ============================================================================

// ============================================================================
// MARKET ANALYTICS SERVICE
// ============================================================================

export const marketAnalyticsService = {
	/**
	 * Get comprehensive market overview statistics
	 */
	async getMarketOverview() {
		const [salaryData, skills, regions, employers] = await Promise.all([
			db.select().from(marketSalaryData),
			db.select().from(skillDemand).orderBy(desc(skillDemand.demandScore)).limit(20),
			db.select().from(regionalJobStats),
			db.select().from(employerDatabase).where(eq(employerDatabase.isActive, true)),
		]);

		// Calculate aggregate statistics
		const totalJobs = regions.reduce((sum, r) => sum + (r.totalJobs || 0), 0);
		const avgSalary =
			salaryData.length > 0
				? Math.round(salaryData.reduce((sum, s) => sum + (s.salaryMedian || 0), 0) / salaryData.length)
				: 84000;
		const avgJobGrowth =
			regions.length > 0
				? Number((regions.reduce((sum, r) => sum + (r.jobGrowth || 0), 0) / regions.length).toFixed(1))
				: 7.5;

		// Get field distribution
		const fieldDistribution = salaryData.reduce(
			(acc, s) => {
				const field = s.field || "other";
				acc[field] = (acc[field] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Get rising skills
		const risingSkills = skills.filter((s) => s.growthTrend === "rising").slice(0, 5);

		// Get top hiring employers
		const topEmployers = employers.sort((a, b) => (b.openPositions || 0) - (a.openPositions || 0)).slice(0, 5);

		return {
			summary: {
				totalJobs,
				avgSalary,
				avgJobGrowth,
				totalEmployers: employers.length,
				totalSkillsTracked: skills.length,
				totalRegions: regions.length,
			},
			fieldDistribution,
			risingSkills: risingSkills.map((s) => ({
				skill: s.skill,
				skillFr: s.skillFr,
				demandScore: s.demandScore,
				growthPercent: s.growthPercent,
				salaryBoost: s.averageSalaryBoost,
			})),
			topEmployers: topEmployers.map((e) => ({
				name: e.name,
				industry: e.industry,
				openPositions: e.openPositions,
				headquarters: e.headquarters,
			})),
			regions: regions.map((r) => ({
				region: r.region,
				regionFr: r.regionFr,
				totalJobs: r.totalJobs,
				jobGrowth: r.jobGrowth,
				avgSalary: r.averageSalary,
			})),
		};
	},

	/**
	 * Get salary comparison data for a specific field
	 */
	async getSalaryComparison(field?: string, experienceLevel?: string) {
		const conditions = [];
		if (field) conditions.push(eq(marketSalaryData.field, field));
		if (experienceLevel) conditions.push(eq(marketSalaryData.experienceLevel, experienceLevel));

		const data = await db
			.select()
			.from(marketSalaryData)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(marketSalaryData.salaryMedian));

		// Group by role for comparison
		const roleComparison = data.reduce(
			(acc, item) => {
				if (!acc[item.role]) {
					acc[item.role] = {
						role: item.role,
						roleFr: item.roleFr,
						field: item.field,
						levels: {},
					};
				}
				acc[item.role].levels[item.experienceLevel || "unknown"] = {
					min: item.salaryMin,
					median: item.salaryMedian,
					max: item.salaryMax,
					demandScore: item.demandScore,
				};
				return acc;
			},
			{} as Record<
				string,
				{
					role: string;
					roleFr: string | null;
					field: string | null;
					levels: Record<
						string,
						{ min: number | null; median: number | null; max: number | null; demandScore: number | null }
					>;
				}
			>,
		);

		// Calculate field averages
		const fieldAverages = data.reduce(
			(acc, item) => {
				const f = item.field || "other";
				if (!acc[f]) {
					acc[f] = { sum: 0, count: 0 };
				}
				acc[f].sum += item.salaryMedian || 0;
				acc[f].count += 1;
				return acc;
			},
			{} as Record<string, { sum: number; count: number }>,
		);

		const averageByField = Object.entries(fieldAverages).map(([f, data]) => ({
			field: f,
			averageSalary: Math.round(data.sum / data.count),
		}));

		return {
			roles: Object.values(roleComparison),
			averageByField,
			rawData: data,
		};
	},

	/**
	 * Get personalized career insights based on user profile
	 */
	async getPersonalizedInsights(userProfile: {
		skills: string[];
		field?: string;
		experienceLevel?: string;
		region?: string;
		targetSalary?: number;
	}) {
		const insights: {
			skillGaps: { skill: string; demandScore: number; salaryBoost: number }[];
			salaryPosition: {
				userTarget: number;
				marketMedian: number;
				position: "below" | "at" | "above";
				difference: number;
			};
			recommendedSkills: { skill: string; skillFr: string | null; reason: string; salaryBoost: number }[];
			careerAdvice: string[];
			marketTrends: { trend: string; impact: "positive" | "negative" | "neutral" }[];
		} = {
			skillGaps: [],
			salaryPosition: { userTarget: 0, marketMedian: 0, position: "at", difference: 0 },
			recommendedSkills: [],
			careerAdvice: [],
			marketTrends: [],
		};

		// Get market skills for user's field
		const fieldConditions = userProfile.field ? [eq(skillDemand.field, userProfile.field)] : [];
		const marketSkills = await db
			.select()
			.from(skillDemand)
			.where(fieldConditions.length > 0 ? and(...fieldConditions) : undefined)
			.orderBy(desc(skillDemand.demandScore));

		// Find skill gaps
		const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase());
		const highDemandSkills = marketSkills.filter((s) => (s.demandScore || 0) >= 80);

		insights.skillGaps = highDemandSkills
			.filter((s) => !userSkillsLower.includes(s.skill.toLowerCase()))
			.slice(0, 5)
			.map((s) => ({
				skill: s.skill,
				demandScore: s.demandScore || 0,
				salaryBoost: s.averageSalaryBoost || 0,
			}));

		// Calculate salary position
		if (userProfile.targetSalary && userProfile.field && userProfile.experienceLevel) {
			const salaryConditions = [
				eq(marketSalaryData.field, userProfile.field),
				eq(marketSalaryData.experienceLevel, userProfile.experienceLevel),
			];
			const salaryData = await db
				.select()
				.from(marketSalaryData)
				.where(and(...salaryConditions));

			if (salaryData.length > 0) {
				const marketMedian = Math.round(
					salaryData.reduce((sum, s) => sum + (s.salaryMedian || 0), 0) / salaryData.length,
				);
				const difference = userProfile.targetSalary - marketMedian;
				const percentDiff = Math.abs(difference) / marketMedian;

				insights.salaryPosition = {
					userTarget: userProfile.targetSalary,
					marketMedian,
					position: percentDiff < 0.1 ? "at" : difference > 0 ? "above" : "below",
					difference: Math.round(difference),
				};
			}
		}

		// Recommend skills to learn
		const risingSkills = marketSkills.filter((s) => s.growthTrend === "rising");
		insights.recommendedSkills = risingSkills
			.filter((s) => !userSkillsLower.includes(s.skill.toLowerCase()))
			.slice(0, 5)
			.map((s) => ({
				skill: s.skill,
				skillFr: s.skillFr,
				reason: `Growing demand (+${s.growthPercent}%) in ${s.field || "all fields"}`,
				salaryBoost: s.averageSalaryBoost || 0,
			}));

		// Generate career advice
		if (insights.skillGaps.length > 0) {
			const topGapSkill = insights.skillGaps[0];
			insights.careerAdvice.push(
				`Consider learning ${topGapSkill.skill} - it's in high demand and could boost your salary by ${topGapSkill.salaryBoost.toLocaleString()} MAD`,
			);
		}

		if (insights.salaryPosition.position === "below") {
			insights.careerAdvice.push(
				`Your target salary is ${Math.abs(insights.salaryPosition.difference).toLocaleString()} MAD below market median. Consider negotiating higher or building in-demand skills.`,
			);
		} else if (insights.salaryPosition.position === "above") {
			insights.careerAdvice.push(
				`Your target salary is ${insights.salaryPosition.difference.toLocaleString()} MAD above market median. Ensure your skills and experience justify this premium.`,
			);
		}

		// Add market trends
		const risingCount = marketSkills.filter((s) => s.growthTrend === "rising").length;
		const stableCount = marketSkills.filter((s) => s.growthTrend === "stable").length;

		if (risingCount > stableCount) {
			insights.marketTrends.push({
				trend: "Strong skill demand growth in your field",
				impact: "positive",
			});
		}

		if (userProfile.field === "hse") {
			insights.marketTrends.push({
				trend: "HSE sector seeing 15%+ growth due to new regulations",
				impact: "positive",
			});
		} else if (userProfile.field === "healthcare") {
			insights.marketTrends.push({
				trend: "Healthcare demand increasing with aging population",
				impact: "positive",
			});
		} else if (userProfile.field === "industrial") {
			insights.marketTrends.push({
				trend: "Industrial sector expanding with automotive and aerospace investments",
				impact: "positive",
			});
		}

		return insights;
	},

	/**
	 * Get career progression timeline for a role
	 */
	async getCareerProgression(role: string, field?: string) {
		const conditions = [like(marketSalaryData.role, `%${role}%`)];
		if (field) conditions.push(eq(marketSalaryData.field, field));

		const data = await db
			.select()
			.from(marketSalaryData)
			.where(and(...conditions))
			.orderBy(marketSalaryData.experienceLevel);

		// Define progression stages
		const stages = [
			{ level: "entry", years: "0-2 years", title: "Junior / Debutant" },
			{ level: "mid", years: "3-5 years", title: "Confirmed / Confirme" },
			{ level: "senior", years: "6-10 years", title: "Senior / Expert" },
			{ level: "lead", years: "10+ years", title: "Lead / Manager" },
		];

		const progression = stages.map((stage) => {
			const levelData = data.find((d) => d.experienceLevel === stage.level);
			return {
				...stage,
				salary: levelData
					? {
							min: levelData.salaryMin,
							median: levelData.salaryMedian,
							max: levelData.salaryMax,
						}
					: null,
				demandScore: levelData?.demandScore,
			};
		});

		return {
			role,
			field,
			progression,
		};
	},

	/**
	 * Get industry news/trends (generated from data)
	 */
	async getIndustryTrends() {
		const [skills, regions, employers] = await Promise.all([
			db
				.select()
				.from(skillDemand)
				.where(eq(skillDemand.growthTrend, "rising"))
				.orderBy(desc(skillDemand.growthPercent))
				.limit(10),
			db.select().from(regionalJobStats).orderBy(desc(regionalJobStats.jobGrowth)).limit(5),
			db
				.select()
				.from(employerDatabase)
				.where(eq(employerDatabase.hiringTrend, "growing"))
				.orderBy(desc(employerDatabase.openPositions))
				.limit(5),
		]);

		const trends = [];

		// Top growing skills
		if (skills.length > 0) {
			trends.push({
				category: "skills",
				title: "Hot Skills in Demand",
				titleFr: "Competences les plus demandees",
				items: skills.slice(0, 5).map((s) => ({
					name: s.skill,
					nameFr: s.skillFr,
					growth: `+${s.growthPercent}%`,
					field: s.field,
				})),
			});
		}

		// Growing regions
		if (regions.length > 0) {
			trends.push({
				category: "regions",
				title: "Fastest Growing Job Markets",
				titleFr: "Marches de l'emploi en croissance",
				items: regions.map((r) => ({
					name: r.region,
					nameFr: r.regionFr,
					growth: `+${r.jobGrowth}%`,
					totalJobs: r.totalJobs,
				})),
			});
		}

		// Actively hiring employers
		if (employers.length > 0) {
			trends.push({
				category: "employers",
				title: "Top Employers Hiring Now",
				titleFr: "Employeurs qui recrutent",
				items: employers.map((e) => ({
					name: e.name,
					industry: e.industry,
					openPositions: e.openPositions,
					headquarters: e.headquarters,
				})),
			});
		}

		return trends;
	},
};

export const employerDatabaseService = {
	async list(filters?: { industry?: string; headquarters?: string; isActive?: boolean }) {
		const conditions = [];
		if (filters?.industry) conditions.push(eq(employerDatabase.industry, filters.industry));
		if (filters?.headquarters) conditions.push(eq(employerDatabase.headquarters, filters.headquarters));
		if (filters?.isActive !== undefined) conditions.push(eq(employerDatabase.isActive, filters.isActive));

		return db
			.select()
			.from(employerDatabase)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(employerDatabase.rating), employerDatabase.name);
	},

	async getById(id: string) {
		const [employer] = await db.select().from(employerDatabase).where(eq(employerDatabase.id, id));
		return employer;
	},

	async search(query: string) {
		return db
			.select()
			.from(employerDatabase)
			.where(or(like(employerDatabase.name, `%${query}%`), like(employerDatabase.industry, `%${query}%`)))
			.orderBy(desc(employerDatabase.rating))
			.limit(20);
	},

	async seed() {
		const employers = [
			{
				name: "OCP Group",
				nameFr: "Groupe OCP",
				industry: "Mining & Chemicals",
				industryFr: "Mines et Chimie",
				headquarters: "Casablanca",
				size: "enterprise",
				employeeCount: "20000+",
				openPositions: 150,
				averageSalary: 180000,
				rating: 4.2,
				hiringTrend: "growing",
				isVerified: true,
				fields: ["industrial", "hse"],
				culture: { workStyle: "hybrid", values: ["Innovation", "Sustainability", "Excellence"] },
			},
			{
				name: "Renault Maroc",
				nameFr: "Renault Maroc",
				industry: "Automotive",
				industryFr: "Automobile",
				headquarters: "Tanger",
				size: "large",
				employeeCount: "5000-10000",
				openPositions: 85,
				averageSalary: 120000,
				rating: 4.0,
				hiringTrend: "growing",
				isVerified: true,
				fields: ["industrial"],
				culture: { workStyle: "onsite", values: ["Quality", "Teamwork", "Innovation"] },
			},
			{
				name: "Maroc Telecom",
				nameFr: "Maroc Telecom",
				industry: "Telecommunications",
				industryFr: "Télécommunications",
				headquarters: "Rabat",
				size: "enterprise",
				employeeCount: "10000+",
				openPositions: 60,
				averageSalary: 144000,
				rating: 3.8,
				hiringTrend: "stable",
				isVerified: true,
				fields: ["general"],
				culture: { workStyle: "hybrid", values: ["Customer Focus", "Innovation", "Integrity"] },
			},
			{
				name: "SANOFI Maroc",
				nameFr: "SANOFI Maroc",
				industry: "Pharmaceutical",
				industryFr: "Pharmaceutique",
				headquarters: "Casablanca",
				size: "large",
				employeeCount: "1000-5000",
				openPositions: 40,
				averageSalary: 156000,
				rating: 4.3,
				hiringTrend: "growing",
				isVerified: true,
				fields: ["healthcare"],
				culture: { workStyle: "hybrid", values: ["Health", "Science", "People"] },
			},
			{
				name: "CHU Ibn Sina",
				nameFr: "CHU Ibn Sina",
				industry: "Healthcare",
				industryFr: "Santé",
				headquarters: "Rabat",
				size: "large",
				employeeCount: "5000-10000",
				openPositions: 120,
				averageSalary: 84000,
				rating: 3.5,
				hiringTrend: "growing",
				isVerified: true,
				fields: ["healthcare"],
				culture: { workStyle: "onsite", values: ["Patient Care", "Excellence", "Research"] },
			},
		];

		for (const data of employers) {
			const existing = await db.select().from(employerDatabase).where(eq(employerDatabase.name, data.name));

			if (existing.length === 0) {
				await db.insert(employerDatabase).values({
					id: generateId(),
					...data,
					isActive: true,
				});
			}
		}

		return this.list();
	},
};
