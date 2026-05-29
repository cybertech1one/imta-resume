import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	type JobRecommendation,
	type JobRecommendationReasons,
	type JobRecommendationStatus,
	jobRecommendation,
	type NewJobRecommendation,
	type NewUserJobPreference,
	partnerJobPosting,
	partnerProfile,
	resume,
	type UserJobPreference,
	userJobPreference,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================================================
// TYPES
// ============================================================================

export type UserProfile = {
	skills: string[];
	experienceLevel: string;
	preferredLocations: string[];
	preferredRegions?: string[];
	salaryExpectation?: { min: number; max: number };
	field?: string;
	keywords?: string[];
	jobTypes?: string[];
	remotePreference?: string;
};

export type JobData = {
	id: string;
	title: string;
	company: string;
	location: string;
	region?: string;
	skills: string[];
	experienceLevel: string;
	salaryMin?: number;
	salaryMax?: number;
	field?: string;
	jobType?: string;
	remoteOption?: string;
	description?: string;
};

export type MatchScoreResult = {
	score: number;
	skillMatchScore: number;
	experienceMatchScore: number;
	locationMatchScore: number;
	salaryMatchScore: number;
	reasons: JobRecommendationReasons;
};

// ============================================================================
// MATCH SCORE CALCULATION
// ============================================================================

/**
 * Calculate match score between user profile and job listing
 * Weights: Skills (40%) + Experience (25%) + Location (20%) + Salary (15%)
 */
function calculateMatchScore(userProfile: UserProfile, job: JobData): MatchScoreResult {
	const matchedReasons: string[] = [];
	const missingSkills: string[] = [];
	const highlights: string[] = [];

	// ==========================================
	// Skills match (40 points max)
	// ==========================================
	const userSkillsLower = userProfile.skills.map((s) => s.toLowerCase().trim());
	const jobSkillsLower = (job.skills || []).map((s) => s.toLowerCase().trim());

	const matchedSkills = userSkillsLower.filter((s) => jobSkillsLower.some((js) => js.includes(s) || s.includes(js)));

	const unmatchedJobSkills = jobSkillsLower.filter(
		(js) => !userSkillsLower.some((us) => us.includes(js) || js.includes(us)),
	);

	let skillMatchScore = 0;
	if (jobSkillsLower.length > 0) {
		skillMatchScore = Math.round((matchedSkills.length / jobSkillsLower.length) * 40);
	} else {
		skillMatchScore = 30; // Neutral if no skills specified
	}

	if (matchedSkills.length > 0) {
		matchedReasons.push(`Matching skills: ${matchedSkills.slice(0, 5).join(", ")}`);
	}
	if (unmatchedJobSkills.length > 0) {
		missingSkills.push(...unmatchedJobSkills.slice(0, 5));
	}

	// ==========================================
	// Experience level match (25 points max)
	// ==========================================
	const expLevels = ["entry", "junior", "mid", "senior", "executive"];
	const userExpIndex = expLevels.indexOf(userProfile.experienceLevel?.toLowerCase() || "mid");
	const jobExpIndex = expLevels.indexOf(job.experienceLevel?.toLowerCase() || "mid");

	let experienceMatchScore = 25;
	if (userExpIndex >= 0 && jobExpIndex >= 0) {
		const expDiff = Math.abs(userExpIndex - jobExpIndex);
		experienceMatchScore = expDiff === 0 ? 25 : expDiff === 1 ? 18 : expDiff === 2 ? 10 : 5;

		if (expDiff === 0) {
			matchedReasons.push("Niveau d'experience correspondant");
		} else if (userExpIndex > jobExpIndex) {
			highlights.push("Vous depassez le niveau d'experience requis");
		}
	}

	// ==========================================
	// Location match (20 points max)
	// ==========================================
	let locationMatchScore = 10; // Default neutral score
	const jobLocation = job.location?.toLowerCase() || "";
	const jobRegion = job.region?.toLowerCase() || "";

	// Check location match
	const locationMatch = userProfile.preferredLocations?.some((loc) => {
		const locLower = loc.toLowerCase();
		return jobLocation.includes(locLower) || locLower.includes(jobLocation);
	});

	// Check region match
	const regionMatch = userProfile.preferredRegions?.some((region) => {
		const regionLower = region.toLowerCase();
		return (
			jobRegion.includes(regionLower) ||
			regionLower.includes(jobRegion) ||
			jobLocation.includes(regionLower) ||
			regionLower.includes(jobLocation)
		);
	});

	if (locationMatch) {
		locationMatchScore = 20;
		matchedReasons.push(`Localisation preferee: ${job.location}`);
	} else if (regionMatch) {
		locationMatchScore = 15;
		matchedReasons.push(`Region correspondante: ${job.region || job.location}`);
	}

	// Remote preference bonus
	if (userProfile.remotePreference === "remote" && job.remoteOption === "remote") {
		locationMatchScore = Math.min(20, locationMatchScore + 5);
		highlights.push("Travail a distance disponible");
	}

	// ==========================================
	// Salary match (15 points max)
	// ==========================================
	let salaryMatchScore = 10; // Default neutral score

	if (userProfile.salaryExpectation && job.salaryMin && job.salaryMax) {
		// Check if job salary range overlaps with user expectation
		const overlapMin = Math.max(userProfile.salaryExpectation.min, job.salaryMin);
		const overlapMax = Math.min(userProfile.salaryExpectation.max, job.salaryMax);

		if (overlapMax >= overlapMin) {
			// There is overlap
			const overlapRatio =
				(overlapMax - overlapMin) / (userProfile.salaryExpectation.max - userProfile.salaryExpectation.min);
			salaryMatchScore = Math.round(8 + overlapRatio * 7); // 8-15 points

			if (job.salaryMax >= userProfile.salaryExpectation.min) {
				matchedReasons.push(`Salaire: ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} MAD/an`);
			}
		} else if (job.salaryMax < userProfile.salaryExpectation.min) {
			// Job pays less than expected
			const deficit = (userProfile.salaryExpectation.min - job.salaryMax) / userProfile.salaryExpectation.min;
			salaryMatchScore = Math.max(2, 8 - Math.round(deficit * 8));
		} else {
			// Job pays more than expected - bonus!
			salaryMatchScore = 15;
			highlights.push("Salaire au-dessus de vos attentes");
		}
	}

	// ==========================================
	// Calculate total score
	// ==========================================
	const totalScore = Math.min(
		100,
		Math.max(0, skillMatchScore + experienceMatchScore + locationMatchScore + salaryMatchScore),
	);

	// Add keyword match bonus
	if (userProfile.keywords && userProfile.keywords.length > 0 && job.description) {
		const descLower = job.description.toLowerCase();
		const matchedKeywords = userProfile.keywords.filter((kw) => descLower.includes(kw.toLowerCase()));
		if (matchedKeywords.length > 0) {
			highlights.push(`Mots-cles trouves: ${matchedKeywords.join(", ")}`);
		}
	}

	return {
		score: totalScore,
		skillMatchScore: Math.round((skillMatchScore / 40) * 100),
		experienceMatchScore: Math.round((experienceMatchScore / 25) * 100),
		locationMatchScore: Math.round((locationMatchScore / 20) * 100),
		salaryMatchScore: Math.round((salaryMatchScore / 15) * 100),
		reasons: {
			matched: matchedReasons,
			missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
			highlights: highlights.length > 0 ? highlights : undefined,
		},
	};
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const jobRecommendationService = {
	// ==========================================
	// USER PREFERENCES
	// ==========================================

	async getUserPreferences(userId: string): Promise<UserJobPreference | null> {
		const [prefs] = await db.select().from(userJobPreference).where(eq(userJobPreference.userId, userId));
		return prefs || null;
	},

	async updateUserPreferences(
		userId: string,
		prefs: Partial<Omit<NewUserJobPreference, "id" | "userId">>,
	): Promise<UserJobPreference> {
		// Check if preferences exist
		const existing = await this.getUserPreferences(userId);

		if (existing) {
			// Update existing preferences
			const [updated] = await db
				.update(userJobPreference)
				.set({
					...prefs,
					updatedAt: new Date(),
				})
				.where(eq(userJobPreference.userId, userId))
				.returning();
			return updated;
		} else {
			// Create new preferences
			const [created] = await db
				.insert(userJobPreference)
				.values({
					id: generateId(),
					userId,
					...prefs,
				})
				.returning();
			return created;
		}
	},

	// ==========================================
	// RECOMMENDATIONS
	// ==========================================

	async getRecommendations(
		userId: string,
		options?: {
			status?: JobRecommendationStatus;
			minScore?: number;
			limit?: number;
			offset?: number;
		},
	): Promise<{
		recommendations: (JobRecommendation & {
			job?: {
				id: string;
				title: string;
				description: string;
				location: string;
				region: string | null;
				jobType: string;
				experienceLevel: string;
				field: string | null;
				skills: string[] | null;
				salaryMin: number | null;
				salaryMax: number | null;
				applicationUrl: string | null;
				company: string | null;
			};
		})[];
		total: number;
	}> {
		const conditions = [eq(jobRecommendation.userId, userId)];

		if (options?.status) {
			conditions.push(eq(jobRecommendation.status, options.status));
		}
		if (options?.minScore) {
			conditions.push(gte(jobRecommendation.matchScore, options.minScore));
		}

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(jobRecommendation)
			.where(and(...conditions));

		// Get recommendations with job details
		const recommendations = await db
			.select()
			.from(jobRecommendation)
			.where(and(...conditions))
			.orderBy(desc(jobRecommendation.matchScore), desc(jobRecommendation.createdAt))
			.limit(options?.limit ?? 20)
			.offset(options?.offset ?? 0);

		// Fetch job details for each recommendation with company name
		const jobIds = recommendations.map((r) => r.jobId);
		const jobs =
			jobIds.length > 0
				? await db
						.select({
							id: partnerJobPosting.id,
							title: partnerJobPosting.title,
							description: partnerJobPosting.description,
							location: partnerJobPosting.location,
							region: partnerJobPosting.region,
							jobType: partnerJobPosting.jobType,
							experienceLevel: partnerJobPosting.experienceLevel,
							field: partnerJobPosting.field,
							skills: partnerJobPosting.skills,
							salaryMin: partnerJobPosting.salaryMin,
							salaryMax: partnerJobPosting.salaryMax,
							applicationUrl: partnerJobPosting.applicationUrl,
							company: partnerProfile.companyName,
						})
						.from(partnerJobPosting)
						.leftJoin(partnerProfile, eq(partnerJobPosting.partnerId, partnerProfile.id))
						.where(inArray(partnerJobPosting.id, jobIds))
				: [];

		const jobsMap = new Map(jobs.map((j) => [j.id, j]));

		const recommendationsWithJobs = recommendations.map((rec) => ({
			...rec,
			job: jobsMap.get(rec.jobId),
		}));

		return {
			recommendations: recommendationsWithJobs,
			total: count,
		};
	},

	async updateRecommendationStatus(
		id: string,
		userId: string,
		status: JobRecommendationStatus,
	): Promise<JobRecommendation> {
		const updateData: Partial<JobRecommendation> = {
			status,
			updatedAt: new Date(),
		};

		if (status === "viewed" && !updateData.viewedAt) {
			updateData.viewedAt = new Date();
		}
		if (status === "applied") {
			updateData.appliedAt = new Date();
		}

		const [updated] = await db
			.update(jobRecommendation)
			.set(updateData)
			.where(and(eq(jobRecommendation.id, id), eq(jobRecommendation.userId, userId)))
			.returning();

		if (!updated) {
			throw new ORPCError("NOT_FOUND", { message: "Recommendation not found" });
		}

		return updated;
	},

	async dismissRecommendation(id: string, userId: string): Promise<void> {
		await this.updateRecommendationStatus(id, userId, "dismissed");
	},

	async saveRecommendation(id: string, userId: string): Promise<JobRecommendation> {
		return this.updateRecommendationStatus(id, userId, "saved");
	},

	// ==========================================
	// GENERATE RECOMMENDATIONS
	// ==========================================

	async generateRecommendations(
		userId: string,
		options?: { resumeId?: string; forceRefresh?: boolean },
	): Promise<{ generated: number; total: number }> {
		// Get user preferences
		const preferences = await this.getUserPreferences(userId);

		// Get user's resume data for skills extraction
		let userSkills: string[] = [];
		let experienceLevel = preferences?.experienceLevel || "mid";

		if (options?.resumeId) {
			const [resumeData] = await db
				.select()
				.from(resume)
				.where(and(eq(resume.id, options.resumeId), eq(resume.userId, userId)));

			if (resumeData?.data) {
				// Extract skills from resume
				const resumeSkills = resumeData.data.sections?.skills?.items || [];
				userSkills = resumeSkills.map((s) => s.name).filter(Boolean);

				// Try to infer experience level from resume
				const experiences = resumeData.data.sections?.experience?.items || [];
				if (experiences.length >= 5) {
					experienceLevel = "senior";
				} else if (experiences.length >= 2) {
					experienceLevel = "mid";
				}
			}
		}

		// Combine skills from preferences
		if (preferences?.prioritySkills) {
			userSkills = [...new Set([...userSkills, ...preferences.prioritySkills])];
		}

		// Build user profile
		const userProfile: UserProfile = {
			skills: userSkills,
			experienceLevel,
			preferredLocations: preferences?.preferredLocations || [],
			preferredRegions: preferences?.preferredRegions || [],
			salaryExpectation:
				preferences?.minSalary || preferences?.maxSalary
					? {
							min: preferences.minSalary || 0,
							max: preferences.maxSalary || 1000000,
						}
					: undefined,
			field: preferences?.preferredFields?.[0],
			keywords: preferences?.keywords || [],
			jobTypes: preferences?.jobTypes || [],
			remotePreference: preferences?.remotePreference || "hybrid",
		};

		// Get active job postings
		const jobConditions = [eq(partnerJobPosting.status, "published")];

		// Filter by preferred fields if specified
		if (preferences?.preferredFields && preferences.preferredFields.length > 0) {
			// Note: This assumes partnerJobPosting has a field column - adjust if needed
		}

		// Filter by job types if specified
		if (preferences?.jobTypes && preferences.jobTypes.length > 0) {
			jobConditions.push(inArray(partnerJobPosting.jobType, preferences.jobTypes));
		}

		// Exclude already recommended jobs (unless force refresh)
		if (!options?.forceRefresh) {
			const existingRecs = await db
				.select({ jobId: jobRecommendation.jobId })
				.from(jobRecommendation)
				.where(eq(jobRecommendation.userId, userId));

			const existingJobIds = existingRecs.map((r) => r.jobId);
			if (existingJobIds.length > 0) {
				jobConditions.push(
					sql`${partnerJobPosting.id} NOT IN (${sql.join(
						existingJobIds.map((id) => sql`${id}`),
						sql`, `,
					)})`,
				);
			}
		}

		const availableJobs = await db
			.select({
				id: partnerJobPosting.id,
				title: partnerJobPosting.title,
				description: partnerJobPosting.description,
				location: partnerJobPosting.location,
				region: partnerJobPosting.region,
				jobType: partnerJobPosting.jobType,
				experienceLevel: partnerJobPosting.experienceLevel,
				field: partnerJobPosting.field,
				skills: partnerJobPosting.skills,
				salaryMin: partnerJobPosting.salaryMin,
				salaryMax: partnerJobPosting.salaryMax,
				applicationUrl: partnerJobPosting.applicationUrl,
				companyName: partnerProfile.companyName,
			})
			.from(partnerJobPosting)
			.leftJoin(partnerProfile, eq(partnerJobPosting.partnerId, partnerProfile.id))
			.where(and(...jobConditions))
			.limit(100); // Process in batches

		// Calculate match scores and create recommendations
		const newRecommendations: NewJobRecommendation[] = [];

		for (const job of availableJobs) {
			// Skip if company is excluded
			if (preferences?.excludedCompanies?.some((c) => c.toLowerCase() === job.companyName?.toLowerCase())) {
				continue;
			}

			const jobData: JobData = {
				id: job.id,
				title: job.title,
				company: job.companyName || "",
				location: job.location || "",
				region: job.region || undefined,
				skills: (job.skills as string[]) || [],
				experienceLevel: job.experienceLevel || "mid",
				salaryMin: job.salaryMin || undefined,
				salaryMax: job.salaryMax || undefined,
				field: job.field || undefined,
				jobType: job.jobType || undefined,
				description: job.description || undefined,
			};

			const matchResult = calculateMatchScore(userProfile, jobData);

			// Only recommend jobs with score >= 40
			if (matchResult.score >= 40) {
				newRecommendations.push({
					id: generateId(),
					userId,
					jobId: job.id,
					jobSource: "partner",
					matchScore: matchResult.score,
					skillMatchScore: matchResult.skillMatchScore,
					experienceMatchScore: matchResult.experienceMatchScore,
					locationMatchScore: matchResult.locationMatchScore,
					salaryMatchScore: matchResult.salaryMatchScore,
					reasons: matchResult.reasons,
					status: "new",
				});
			}
		}

		// Insert recommendations
		if (newRecommendations.length > 0) {
			if (options?.forceRefresh) {
				// Delete existing recommendations first
				await db.delete(jobRecommendation).where(eq(jobRecommendation.userId, userId));
			}

			await db.insert(jobRecommendation).values(newRecommendations);
		}

		// Get total recommendations count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(jobRecommendation)
			.where(eq(jobRecommendation.userId, userId));

		return {
			generated: newRecommendations.length,
			total: count,
		};
	},

	// ==========================================
	// STATISTICS
	// ==========================================

	async getRecommendationStats(userId: string): Promise<{
		total: number;
		new: number;
		viewed: number;
		saved: number;
		applied: number;
		dismissed: number;
		averageScore: number;
	}> {
		const stats = await db
			.select({
				status: jobRecommendation.status,
				count: sql<number>`count(*)::int`,
				avgScore: sql<number>`avg(${jobRecommendation.matchScore})::int`,
			})
			.from(jobRecommendation)
			.where(eq(jobRecommendation.userId, userId))
			.groupBy(jobRecommendation.status);

		const result = {
			total: 0,
			new: 0,
			viewed: 0,
			saved: 0,
			applied: 0,
			dismissed: 0,
			averageScore: 0,
		};

		let totalScore = 0;
		for (const stat of stats) {
			result.total += stat.count;
			totalScore += (stat.avgScore || 0) * stat.count;

			switch (stat.status) {
				case "new":
					result.new = stat.count;
					break;
				case "viewed":
					result.viewed = stat.count;
					break;
				case "saved":
					result.saved = stat.count;
					break;
				case "applied":
					result.applied = stat.count;
					break;
				case "dismissed":
					result.dismissed = stat.count;
					break;
			}
		}

		result.averageScore = result.total > 0 ? Math.round(totalScore / result.total) : 0;

		return result;
	},
};
