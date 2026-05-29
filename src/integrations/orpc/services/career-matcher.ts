import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	CareerPredictionRow,
	CareerTrajectoryPoint,
	CareerTrajectoryRow,
	JobMatchScoreRow,
	NewCareerPrediction,
	NewCareerTrajectoryRow,
	NewJobMatchScoreRow,
	PredictedCareerPath,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Types for service inputs
export type PredictCareerPathsInput = {
	userId: string;
	resumeId?: string;
	currentRole?: string;
	currentField?: string;
	yearsExperience?: number;
	currentSkills?: string[];
	educationLevel?: string;
};

export type MatchToJobsInput = {
	userId: string;
	predictionId?: string;
	jobTitle: string;
	company?: string;
	industry?: string;
	location?: string;
	salaryMin?: number;
	salaryMax?: number;
	jobDescription?: string;
	requiredSkills?: string[];
};

export type SimulateCareerPathInput = {
	userId: string;
	predictionId?: string;
	pathName: string;
	targetRole: string;
	targetField?: string;
	currentSkills?: string[];
	yearsExperience?: number;
};

export type IdentifyTransferableSkillsInput = {
	userId: string;
	currentSkills: string[];
	targetRole: string;
	targetField?: string;
};

export type GetSuccessFactorsInput = {
	userId: string;
	targetRole: string;
	currentRole?: string;
	currentSkills?: string[];
	yearsExperience?: number;
};

export type ComparePathOptionsInput = {
	userId: string;
	trajectoryIds: string[];
};

// AI prompt templates
const CAREER_PREDICTION_PROMPT = `You are an expert career advisor specializing in the Moroccan job market with deep knowledge of healthcare, industrial, HSE (Health, Safety & Environment), and technology sectors.

Analyze the candidate's profile (provided in the user message) and suggest 3-5 optimal career paths. Consider:
- Current skills and experience level
- Moroccan market demand and salary ranges
- Required skill gaps and time to achieve
- Growth potential and job stability

For each career path, provide:
1. Title and field
2. Match percentage (0-100)
3. Estimated time to achieve (months)
4. Salary projections (current, year 1, 3, 5 in MAD)
5. Required skills with current vs required levels
6. Key milestones to reach this career
7. Success factors and potential challenges
8. Growth potential (high/medium/low)

Respond in JSON format following this structure:
{
  "paths": [
    {
      "id": "unique-id",
      "title": "Career Title",
      "titleFr": "Titre en francais",
      "description": "Brief description",
      "descriptionFr": "Description en francais",
      "field": "healthcare|industrial|hse|technology",
      "matchPercentage": 85,
      "confidence": "high|medium|low",
      "estimatedTimeToAchieve": 18,
      "salaryProjection": {
        "current": 5000,
        "year1": 7000,
        "year3": 12000,
        "year5": 18000,
        "currency": "MAD"
      },
      "requiredSkills": [...],
      "milestones": [...],
      "successFactors": [...],
      "challenges": [...],
      "growthPotential": "high|medium|low"
    }
  ],
  "topRecommendation": "path-id",
  "analysis": "Overall analysis of candidate's career potential"
}`;

const JOB_MATCH_PROMPT = `You are an expert job matcher analyzing candidate fit for a specific position.

The user message contains the candidate's skills, experience, and job details to evaluate.

Analyze the compatibility between the candidate and the job, providing:
1. Overall match score (0-100)
2. Skill match score and details
3. Experience match score
4. Culture fit assessment
5. Matched, missing, and transferable skills
6. Specific recommendations for improvement

Respond ONLY with valid JSON. All JSON object keys MUST use camelCase (e.g. "overallScore", "skillMatchScore", "experienceMatchScore", "educationMatchScore", "cultureFitScore", "salaryFitScore", "locationFitScore", "matchedSkills", "missingSkills", "transferableSkills", "recommendations", "confidenceLevel", "explanation", "improvementSuggestions"). Do NOT use snake_case keys.`;

const CAREER_TRAJECTORY_PROMPT = `You are a career trajectory expert. Project the career progression for a candidate pursuing a specific path.

The user message contains the candidate's current profile and target path details.

Create a detailed 5-year projection including:
1. Year-by-year role progression
2. Salary growth trajectory
3. Skills to acquire each year
4. Key milestones and achievements
5. Success probability and factors
6. Potential challenges and mitigation strategies

Respond in JSON format with trajectory points for years 1-5.`;

const TRANSFERABLE_SKILLS_PROMPT = `You are a skills analysis expert. Analyze which of the candidate's current skills transfer to their target role.

The user message contains the candidate's current skills, target role, and target field.

For each skill, indicate:
1. Transferability level (high/medium/low/none)
2. How it applies to the new role
3. Any modifications or extensions needed

Also identify:
1. Skills that need to be acquired
2. Skills that are not transferable
3. Hidden or adjacent skills that could be valuable

Respond ONLY with valid JSON. All JSON object keys MUST use camelCase. The top-level keys must be: "transferableSkills" (array of objects with keys "skill", "transferability", "application", "modifications"), "skillsToAcquire" (array of strings), "nonTransferableSkills" (array of strings), "hiddenSkills" (array of strings). Do NOT use snake_case keys such as "transferable_skills", "skills_to_acquire", "non_transferable_skills", or "hidden_skills".`;

const SUCCESS_FACTORS_PROMPT = `You are a career transition expert. Identify the key success factors for transitioning to the target role.

The user message contains the candidate's current role, target role, current skills, and years of experience.

Provide:
1. Critical success factors (must-haves)
2. Important differentiators
3. Nice-to-have qualifications
4. Timeline recommendations
5. Potential obstacles and solutions
6. Networking and certification recommendations

Respond ONLY with valid JSON. All JSON object keys MUST use camelCase. The top-level keys must be: "criticalFactors" (array of objects with "factor" and "description"), "importantDifferentiators" (array of objects with "factor" and "description"), "niceToHave" (array of objects with "factor" and "description"), "timelineRecommendations" (array of strings), "potentialObstacles" (array of objects with "obstacle" and "solution"), "networkingRecommendations" (array of strings), "certificationRecommendations" (array of strings). Do NOT use snake_case keys such as "critical_success_factors", "important_differentiators", or "nice_to_have".`;

// Service implementation
export const careerMatcherService = {
	// Get prediction by ID
	getPrediction: async (input: { id: string; userId: string }): Promise<CareerPredictionRow | null> => {
		const [prediction] = await db
			.select()
			.from(schema.careerPrediction)
			.where(and(eq(schema.careerPrediction.id, input.id), eq(schema.careerPrediction.userId, input.userId)));

		return prediction ?? null;
	},

	// List user's predictions
	listPredictions: async (input: { userId: string; limit?: number }): Promise<CareerPredictionRow[]> => {
		return await db
			.select()
			.from(schema.careerPrediction)
			.where(eq(schema.careerPrediction.userId, input.userId))
			.orderBy(desc(schema.careerPrediction.createdAt))
			.limit(input.limit ?? 10);
	},

	// Get latest prediction for user
	getLatestPrediction: async (input: { userId: string }): Promise<CareerPredictionRow | null> => {
		const [prediction] = await db
			.select()
			.from(schema.careerPrediction)
			.where(and(eq(schema.careerPrediction.userId, input.userId), eq(schema.careerPrediction.status, "completed")))
			.orderBy(desc(schema.careerPrediction.createdAt))
			.limit(1);

		return prediction ?? null;
	},

	// Create a new prediction record (pending status)
	createPrediction: async (input: PredictCareerPathsInput): Promise<CareerPredictionRow> => {
		const id = generateId();

		const values: NewCareerPrediction = {
			id,
			userId: input.userId,
			resumeId: input.resumeId ?? null,
			status: "pending",
			currentRole: input.currentRole ?? null,
			currentField: input.currentField ?? null,
			yearsExperience: input.yearsExperience ?? 0,
			currentSkills: input.currentSkills ?? [],
			educationLevel: input.educationLevel ?? null,
			predictedPaths: [],
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
		};

		await db.insert(schema.careerPrediction).values(values);

		const [prediction] = await db.select().from(schema.careerPrediction).where(eq(schema.careerPrediction.id, id));

		return prediction;
	},

	// Update prediction with AI results
	updatePredictionWithResults: async (input: {
		id: string;
		predictedPaths: PredictedCareerPath[];
		topRecommendation?: string;
		aiAnalysis?: string;
		confidenceScore?: number;
		processingTime?: number;
	}): Promise<CareerPredictionRow> => {
		await db
			.update(schema.careerPrediction)
			.set({
				status: "completed",
				predictedPaths: input.predictedPaths,
				topRecommendation: input.topRecommendation,
				aiAnalysis: input.aiAnalysis,
				confidenceScore: input.confidenceScore,
				processingTime: input.processingTime,
			})
			.where(eq(schema.careerPrediction.id, input.id));

		const [prediction] = await db
			.select()
			.from(schema.careerPrediction)
			.where(eq(schema.careerPrediction.id, input.id));

		return prediction;
	},

	// Mark prediction as failed
	markPredictionFailed: async (input: { id: string; errorMessage: string }): Promise<void> => {
		await db
			.update(schema.careerPrediction)
			.set({
				status: "failed",
				errorMessage: input.errorMessage,
			})
			.where(eq(schema.careerPrediction.id, input.id));
	},

	// Delete prediction
	deletePrediction: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.careerPrediction)
			.where(and(eq(schema.careerPrediction.id, input.id), eq(schema.careerPrediction.userId, input.userId)));
	},

	// Create job match score
	createJobMatchScore: async (
		input: MatchToJobsInput & { result: Partial<JobMatchScoreRow> },
	): Promise<JobMatchScoreRow> => {
		const id = generateId();

		const values: NewJobMatchScoreRow = {
			id,
			userId: input.userId,
			predictionId: input.predictionId ?? null,
			jobTitle: input.jobTitle,
			company: input.company ?? null,
			industry: input.industry ?? null,
			location: input.location ?? null,
			salaryMin: input.salaryMin ?? null,
			salaryMax: input.salaryMax ?? null,
			jobDescription: input.jobDescription ?? null,
			requiredSkills: input.requiredSkills ?? [],
			overallScore: input.result.overallScore ?? 0,
			skillMatchScore: input.result.skillMatchScore ?? null,
			experienceMatchScore: input.result.experienceMatchScore ?? null,
			educationMatchScore: input.result.educationMatchScore ?? null,
			cultureFitScore: input.result.cultureFitScore ?? null,
			salaryFitScore: input.result.salaryFitScore ?? null,
			locationFitScore: input.result.locationFitScore ?? null,
			matchedSkills: input.result.matchedSkills ?? [],
			missingSkills: input.result.missingSkills ?? [],
			transferableSkills: input.result.transferableSkills ?? [],
			recommendations: input.result.recommendations ?? [],
			confidenceLevel: input.result.confidenceLevel ?? "medium",
			aiExplanation: input.result.aiExplanation ?? null,
			improvementSuggestions: input.result.improvementSuggestions ?? [],
		};

		await db.insert(schema.jobMatchScoreTable).values(values);

		const [score] = await db.select().from(schema.jobMatchScoreTable).where(eq(schema.jobMatchScoreTable.id, id));

		return score;
	},

	// List job match scores for user
	listJobMatchScores: async (input: { userId: string; limit?: number }): Promise<JobMatchScoreRow[]> => {
		return await db
			.select()
			.from(schema.jobMatchScoreTable)
			.where(eq(schema.jobMatchScoreTable.userId, input.userId))
			.orderBy(desc(schema.jobMatchScoreTable.createdAt))
			.limit(input.limit ?? 20);
	},

	// Get job match score by ID
	getJobMatchScore: async (input: { id: string; userId: string }): Promise<JobMatchScoreRow | null> => {
		const [score] = await db
			.select()
			.from(schema.jobMatchScoreTable)
			.where(and(eq(schema.jobMatchScoreTable.id, input.id), eq(schema.jobMatchScoreTable.userId, input.userId)));

		return score ?? null;
	},

	// Update job match score status (bookmark, apply, dismiss)
	updateJobMatchStatus: async (input: {
		id: string;
		userId: string;
		isBookmarked?: boolean;
		isApplied?: boolean;
		isDismissed?: boolean;
	}): Promise<JobMatchScoreRow> => {
		const updateData: Partial<JobMatchScoreRow> = {};

		if (input.isBookmarked !== undefined) updateData.isBookmarked = input.isBookmarked;
		if (input.isApplied !== undefined) {
			updateData.isApplied = input.isApplied;
			if (input.isApplied) updateData.appliedAt = new Date();
		}
		if (input.isDismissed !== undefined) updateData.isDismissed = input.isDismissed;

		await db
			.update(schema.jobMatchScoreTable)
			.set(updateData)
			.where(and(eq(schema.jobMatchScoreTable.id, input.id), eq(schema.jobMatchScoreTable.userId, input.userId)));

		const [score] = await db.select().from(schema.jobMatchScoreTable).where(eq(schema.jobMatchScoreTable.id, input.id));

		return score;
	},

	// Delete job match score
	deleteJobMatchScore: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.jobMatchScoreTable)
			.where(and(eq(schema.jobMatchScoreTable.id, input.id), eq(schema.jobMatchScoreTable.userId, input.userId)));
	},

	// Create career trajectory
	createTrajectory: async (
		input: SimulateCareerPathInput & { result: Partial<CareerTrajectoryRow> },
	): Promise<CareerTrajectoryRow> => {
		const id = generateId();

		const values: NewCareerTrajectoryRow = {
			id,
			userId: input.userId,
			predictionId: input.predictionId ?? null,
			pathName: input.pathName,
			targetRole: input.targetRole,
			targetField: input.targetField ?? null,
			estimatedYearsToTarget: input.result.estimatedYearsToTarget ?? null,
			startingSalary: input.result.startingSalary ?? null,
			projectedSalaryYear1: input.result.projectedSalaryYear1 ?? null,
			projectedSalaryYear3: input.result.projectedSalaryYear3 ?? null,
			projectedSalaryYear5: input.result.projectedSalaryYear5 ?? null,
			salaryCurrency: "MAD",
			growthRate: input.result.growthRate ?? null,
			successProbability: input.result.successProbability ?? null,
			marketDemand: input.result.marketDemand ?? "medium",
			competitionLevel: input.result.competitionLevel ?? "medium",
			trajectoryPoints: input.result.trajectoryPoints ?? [],
			requiredSkillUpgrades: input.result.requiredSkillUpgrades ?? [],
			requiredCertifications: input.result.requiredCertifications ?? [],
			requiredExperience: input.result.requiredExperience ?? [],
			successFactors: input.result.successFactors ?? [],
			potentialChallenges: input.result.potentialChallenges ?? [],
			mitigationStrategies: input.result.mitigationStrategies ?? [],
			aiInsights: input.result.aiInsights ?? null,
			alternativePathSuggestions: input.result.alternativePathSuggestions ?? [],
			lastSimulatedAt: new Date(),
		};

		await db.insert(schema.careerTrajectory).values(values);

		const [trajectory] = await db.select().from(schema.careerTrajectory).where(eq(schema.careerTrajectory.id, id));

		return trajectory;
	},

	// List trajectories for user
	listTrajectories: async (input: { userId: string; limit?: number }): Promise<CareerTrajectoryRow[]> => {
		return await db
			.select()
			.from(schema.careerTrajectory)
			.where(eq(schema.careerTrajectory.userId, input.userId))
			.orderBy(desc(schema.careerTrajectory.createdAt))
			.limit(input.limit ?? 10);
	},

	// Get trajectory by ID
	getTrajectory: async (input: { id: string; userId: string }): Promise<CareerTrajectoryRow | null> => {
		const [trajectory] = await db
			.select()
			.from(schema.careerTrajectory)
			.where(and(eq(schema.careerTrajectory.id, input.id), eq(schema.careerTrajectory.userId, input.userId)));

		return trajectory ?? null;
	},

	// Select a trajectory as primary
	selectTrajectory: async (input: { id: string; userId: string }): Promise<CareerTrajectoryRow> => {
		// First, deselect all trajectories for user
		await db
			.update(schema.careerTrajectory)
			.set({ isSelected: false })
			.where(eq(schema.careerTrajectory.userId, input.userId));

		// Then select the specified one
		await db
			.update(schema.careerTrajectory)
			.set({ isSelected: true })
			.where(and(eq(schema.careerTrajectory.id, input.id), eq(schema.careerTrajectory.userId, input.userId)));

		const [trajectory] = await db
			.select()
			.from(schema.careerTrajectory)
			.where(eq(schema.careerTrajectory.id, input.id));

		return trajectory;
	},

	// Delete trajectory
	deleteTrajectory: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.careerTrajectory)
			.where(and(eq(schema.careerTrajectory.id, input.id), eq(schema.careerTrajectory.userId, input.userId)));
	},

	// Get selected trajectory
	getSelectedTrajectory: async (input: { userId: string }): Promise<CareerTrajectoryRow | null> => {
		const [trajectory] = await db
			.select()
			.from(schema.careerTrajectory)
			.where(and(eq(schema.careerTrajectory.userId, input.userId), eq(schema.careerTrajectory.isSelected, true)))
			.limit(1);

		return trajectory ?? null;
	},

	// Get statistics for user
	getStatistics: async (input: { userId: string }) => {
		const predictions = await db
			.select()
			.from(schema.careerPrediction)
			.where(eq(schema.careerPrediction.userId, input.userId));

		const jobMatches = await db
			.select()
			.from(schema.jobMatchScoreTable)
			.where(eq(schema.jobMatchScoreTable.userId, input.userId));

		const trajectories = await db
			.select()
			.from(schema.careerTrajectory)
			.where(eq(schema.careerTrajectory.userId, input.userId));

		const completedPredictions = predictions.filter((p) => p.status === "completed");
		const avgMatchScore =
			jobMatches.length > 0 ? jobMatches.reduce((sum, m) => sum + m.overallScore, 0) / jobMatches.length : 0;
		const bookmarkedJobs = jobMatches.filter((m) => m.isBookmarked).length;
		const appliedJobs = jobMatches.filter((m) => m.isApplied).length;

		return {
			totalPredictions: predictions.length,
			completedPredictions: completedPredictions.length,
			totalJobMatches: jobMatches.length,
			averageMatchScore: Math.round(avgMatchScore),
			bookmarkedJobs,
			appliedJobs,
			totalTrajectories: trajectories.length,
			selectedTrajectory: trajectories.find((t) => t.isSelected) ?? null,
		};
	},

	// Get AI prompts (for use in router)
	getPrompts: () => ({
		careerPrediction: CAREER_PREDICTION_PROMPT,
		jobMatch: JOB_MATCH_PROMPT,
		careerTrajectory: CAREER_TRAJECTORY_PROMPT,
		transferableSkills: TRANSFERABLE_SKILLS_PROMPT,
		successFactors: SUCCESS_FACTORS_PROMPT,
	}),
};

// Re-export types for router
export type { CareerPredictionRow, CareerTrajectoryRow, CareerTrajectoryPoint, JobMatchScoreRow, PredictedCareerPath };
