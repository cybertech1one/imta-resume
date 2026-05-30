import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	EffortLevel,
	ImpactLevel,
	ResumeATSCheckItem,
	ResumeBeforeAfterComparison,
	ResumeContentCompleteness,
	ResumeImprovementSuggestion,
	ResumeIndustryBenchmark,
	ResumeRadarDataPoint,
	ResumeReadabilityScore,
	ResumeSectionScore,
	ResumeVisualAppealScore,
	SectionScoreStatus,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Deterministic improvement percentage between a baseline (before) and a latest (after) score.
// Avoids divide-by-zero and the misleading "0%" when the baseline was 0:
//   - baseline 0, latest > 0  -> 100% (full gain from nothing to something)
//   - baseline 0, latest 0    -> 0%
//   - otherwise               -> standard relative change, rounded
function computeImprovement(before: number, after: number): number {
	if (before > 0) {
		return Math.round(((after - before) / before) * 100);
	}
	return after > 0 ? 100 : 0;
}

// Re-export types for router usage
export type {
	EffortLevel,
	ImpactLevel,
	ResumeATSCheckItem,
	ResumeBeforeAfterComparison,
	ResumeContentCompleteness,
	ResumeImprovementSuggestion,
	ResumeIndustryBenchmark,
	ResumeRadarDataPoint,
	ResumeReadabilityScore,
	ResumeSectionScore,
	ResumeVisualAppealScore,
	SectionScoreStatus,
};

export type CreateScoringResultInput = {
	userId: string;
	resumeId?: string | null;
	resumeName: string;
	overallScore: number;
	sectionScores: ResumeSectionScore[];
	atsChecklist: ResumeATSCheckItem[];
	atsScore: number;
	readabilityScore?: ResumeReadabilityScore | null;
	visualAppealScore?: ResumeVisualAppealScore | null;
	contentCompleteness?: ResumeContentCompleteness | null;
	improvementSuggestions: ResumeImprovementSuggestion[];
	industryBenchmarks: ResumeIndustryBenchmark[];
	radarData: ResumeRadarDataPoint[];
	selectedIndustry?: string | null;
};

export type UpdateScoringResultInput = {
	id: string;
	userId: string;
	overallScore?: number;
	sectionScores?: ResumeSectionScore[];
	atsChecklist?: ResumeATSCheckItem[];
	atsScore?: number;
	readabilityScore?: ResumeReadabilityScore | null;
	visualAppealScore?: ResumeVisualAppealScore | null;
	contentCompleteness?: ResumeContentCompleteness | null;
	improvementSuggestions?: ResumeImprovementSuggestion[];
	industryBenchmarks?: ResumeIndustryBenchmark[];
	radarData?: ResumeRadarDataPoint[];
	selectedIndustry?: string | null;
};

export type ScoringResultOutput = {
	id: string;
	userId: string;
	resumeId: string | null;
	resumeName: string;
	overallScore: number;
	sectionScores: ResumeSectionScore[];
	atsChecklist: ResumeATSCheckItem[];
	atsScore: number;
	readabilityScore: ResumeReadabilityScore | null;
	visualAppealScore: ResumeVisualAppealScore | null;
	contentCompleteness: ResumeContentCompleteness | null;
	improvementSuggestions: ResumeImprovementSuggestion[];
	industryBenchmarks: ResumeIndustryBenchmark[];
	radarData: ResumeRadarDataPoint[];
	selectedIndustry: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type ScoringHistoryOutput = {
	id: string;
	userId: string;
	resumeId: string | null;
	scoringResultId: string;
	overallScore: number;
	atsScore: number;
	readabilityScore: number;
	visualScore: number;
	completenessScore: number;
	createdAt: Date;
};

export const resumeScoringService = {
	// Create a new scoring result
	create: async (input: CreateScoringResultInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.resumeScoringResult).values({
			id,
			userId: input.userId,
			resumeId: input.resumeId,
			resumeName: input.resumeName,
			overallScore: input.overallScore,
			sectionScores: input.sectionScores,
			atsChecklist: input.atsChecklist,
			atsScore: input.atsScore,
			readabilityScore: input.readabilityScore,
			visualAppealScore: input.visualAppealScore,
			contentCompleteness: input.contentCompleteness,
			improvementSuggestions: input.improvementSuggestions,
			industryBenchmarks: input.industryBenchmarks,
			radarData: input.radarData,
			selectedIndustry: input.selectedIndustry,
		});

		// Also create a history entry
		const historyId = generateId();
		await db.insert(schema.resumeScoringHistory).values({
			id: historyId,
			userId: input.userId,
			resumeId: input.resumeId,
			scoringResultId: id,
			overallScore: input.overallScore,
			atsScore: input.atsScore,
			readabilityScore: input.readabilityScore?.score ?? 0,
			visualScore: input.visualAppealScore?.score ?? 0,
			completenessScore: input.contentCompleteness?.score ?? 0,
		});

		return id;
	},

	// Get scoring result by ID
	getById: async (input: { id: string; userId: string }): Promise<ScoringResultOutput> => {
		const [result] = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(and(eq(schema.resumeScoringResult.id, input.id), eq(schema.resumeScoringResult.userId, input.userId)));

		if (!result) {
			throw new ORPCError("NOT_FOUND", { message: "Scoring result not found" });
		}

		return {
			id: result.id,
			userId: result.userId,
			resumeId: result.resumeId,
			resumeName: result.resumeName,
			overallScore: result.overallScore,
			sectionScores: result.sectionScores,
			atsChecklist: result.atsChecklist,
			atsScore: result.atsScore,
			readabilityScore: result.readabilityScore,
			visualAppealScore: result.visualAppealScore,
			contentCompleteness: result.contentCompleteness,
			improvementSuggestions: result.improvementSuggestions,
			industryBenchmarks: result.industryBenchmarks,
			radarData: result.radarData,
			selectedIndustry: result.selectedIndustry,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	},

	// Get the latest scoring result for a user
	getLatest: async (input: { userId: string }): Promise<ScoringResultOutput | null> => {
		const [result] = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(eq(schema.resumeScoringResult.userId, input.userId))
			.orderBy(desc(schema.resumeScoringResult.createdAt))
			.limit(1);

		if (!result) {
			return null;
		}

		return {
			id: result.id,
			userId: result.userId,
			resumeId: result.resumeId,
			resumeName: result.resumeName,
			overallScore: result.overallScore,
			sectionScores: result.sectionScores,
			atsChecklist: result.atsChecklist,
			atsScore: result.atsScore,
			readabilityScore: result.readabilityScore,
			visualAppealScore: result.visualAppealScore,
			contentCompleteness: result.contentCompleteness,
			improvementSuggestions: result.improvementSuggestions,
			industryBenchmarks: result.industryBenchmarks,
			radarData: result.radarData,
			selectedIndustry: result.selectedIndustry,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	},

	// Get the latest scoring result for a specific resume
	getLatestByResumeId: async (input: { resumeId: string; userId: string }): Promise<ScoringResultOutput | null> => {
		const [result] = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(
				and(
					eq(schema.resumeScoringResult.resumeId, input.resumeId),
					eq(schema.resumeScoringResult.userId, input.userId),
				),
			)
			.orderBy(desc(schema.resumeScoringResult.createdAt))
			.limit(1);

		if (!result) {
			return null;
		}

		return {
			id: result.id,
			userId: result.userId,
			resumeId: result.resumeId,
			resumeName: result.resumeName,
			overallScore: result.overallScore,
			sectionScores: result.sectionScores,
			atsChecklist: result.atsChecklist,
			atsScore: result.atsScore,
			readabilityScore: result.readabilityScore,
			visualAppealScore: result.visualAppealScore,
			contentCompleteness: result.contentCompleteness,
			improvementSuggestions: result.improvementSuggestions,
			industryBenchmarks: result.industryBenchmarks,
			radarData: result.radarData,
			selectedIndustry: result.selectedIndustry,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		};
	},

	// List all scoring results for a user
	list: async (input: { userId: string; resumeId?: string }): Promise<ScoringResultOutput[]> => {
		const conditions = [eq(schema.resumeScoringResult.userId, input.userId)];

		if (input.resumeId) {
			conditions.push(eq(schema.resumeScoringResult.resumeId, input.resumeId));
		}

		const results = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(and(...conditions))
			.orderBy(desc(schema.resumeScoringResult.createdAt));

		return results.map((result) => ({
			id: result.id,
			userId: result.userId,
			resumeId: result.resumeId,
			resumeName: result.resumeName,
			overallScore: result.overallScore,
			sectionScores: result.sectionScores,
			atsChecklist: result.atsChecklist,
			atsScore: result.atsScore,
			readabilityScore: result.readabilityScore,
			visualAppealScore: result.visualAppealScore,
			contentCompleteness: result.contentCompleteness,
			improvementSuggestions: result.improvementSuggestions,
			industryBenchmarks: result.industryBenchmarks,
			radarData: result.radarData,
			selectedIndustry: result.selectedIndustry,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
		}));
	},

	// Update a scoring result
	update: async (input: UpdateScoringResultInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(and(eq(schema.resumeScoringResult.id, input.id), eq(schema.resumeScoringResult.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Scoring result not found" });
		}

		const updateData: Record<string, unknown> = {};

		if (input.overallScore !== undefined) updateData.overallScore = input.overallScore;
		if (input.sectionScores !== undefined) updateData.sectionScores = input.sectionScores;
		if (input.atsChecklist !== undefined) updateData.atsChecklist = input.atsChecklist;
		if (input.atsScore !== undefined) updateData.atsScore = input.atsScore;
		if (input.readabilityScore !== undefined) updateData.readabilityScore = input.readabilityScore;
		if (input.visualAppealScore !== undefined) updateData.visualAppealScore = input.visualAppealScore;
		if (input.contentCompleteness !== undefined) updateData.contentCompleteness = input.contentCompleteness;
		if (input.improvementSuggestions !== undefined) updateData.improvementSuggestions = input.improvementSuggestions;
		if (input.industryBenchmarks !== undefined) updateData.industryBenchmarks = input.industryBenchmarks;
		if (input.radarData !== undefined) updateData.radarData = input.radarData;
		if (input.selectedIndustry !== undefined) updateData.selectedIndustry = input.selectedIndustry;

		if (Object.keys(updateData).length > 0) {
			await db
				.update(schema.resumeScoringResult)
				.set(updateData)
				.where(and(eq(schema.resumeScoringResult.id, input.id), eq(schema.resumeScoringResult.userId, input.userId)));
		}

		// Add a new history entry if score changed
		if (input.overallScore !== undefined) {
			const historyId = generateId();
			await db.insert(schema.resumeScoringHistory).values({
				id: historyId,
				userId: input.userId,
				resumeId: existing.resumeId,
				scoringResultId: input.id,
				overallScore: input.overallScore ?? existing.overallScore,
				atsScore: input.atsScore ?? existing.atsScore,
				readabilityScore: input.readabilityScore?.score ?? existing.readabilityScore?.score ?? 0,
				visualScore: input.visualAppealScore?.score ?? existing.visualAppealScore?.score ?? 0,
				completenessScore: input.contentCompleteness?.score ?? existing.contentCompleteness?.score ?? 0,
			});
		}
	},

	// Update selected industry
	updateSelectedIndustry: async (input: { id: string; userId: string; industry: string }): Promise<void> => {
		await db
			.update(schema.resumeScoringResult)
			.set({ selectedIndustry: input.industry })
			.where(and(eq(schema.resumeScoringResult.id, input.id), eq(schema.resumeScoringResult.userId, input.userId)));
	},

	// Delete a scoring result
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.resumeScoringResult)
			.where(and(eq(schema.resumeScoringResult.id, input.id), eq(schema.resumeScoringResult.userId, input.userId)));
	},

	// Get scoring history for a user
	getHistory: async (input: { userId: string; limit?: number }): Promise<ScoringHistoryOutput[]> => {
		const results = await db
			.select()
			.from(schema.resumeScoringHistory)
			.where(eq(schema.resumeScoringHistory.userId, input.userId))
			.orderBy(desc(schema.resumeScoringHistory.createdAt))
			.limit(input.limit ?? 10);

		return results.map((result) => ({
			id: result.id,
			userId: result.userId,
			resumeId: result.resumeId,
			scoringResultId: result.scoringResultId,
			overallScore: result.overallScore,
			atsScore: result.atsScore,
			readabilityScore: result.readabilityScore,
			visualScore: result.visualScore,
			completenessScore: result.completenessScore,
			createdAt: result.createdAt,
		}));
	},

	// Get before/after comparison data
	getBeforeAfterComparison: async (input: { userId: string }): Promise<ResumeBeforeAfterComparison[]> => {
		const history = await db
			.select()
			.from(schema.resumeScoringHistory)
			.where(eq(schema.resumeScoringHistory.userId, input.userId))
			.orderBy(desc(schema.resumeScoringHistory.createdAt))
			.limit(2);

		// If we don't have at least 2 history records, return empty
		if (history.length < 2) {
			return [];
		}

		const [latest, previous] = history;

		// Use computeImprovement so a 0 baseline reports a real gain (100% / absolute) not a misleading 0%.
		return [
			{
				metric: "Score global",
				before: previous.overallScore,
				after: latest.overallScore,
				improvement: computeImprovement(previous.overallScore, latest.overallScore),
			},
			{
				metric: "Score ATS",
				before: previous.atsScore,
				after: latest.atsScore,
				improvement: computeImprovement(previous.atsScore, latest.atsScore),
			},
			{
				// Fixed accent: "Lisibilite" -> "Lisibilité"
				metric: "Lisibilité",
				before: previous.readabilityScore,
				after: latest.readabilityScore,
				improvement: computeImprovement(previous.readabilityScore, latest.readabilityScore),
			},
			{
				// Fixed accent: "Completude" -> "Complétude"
				metric: "Complétude",
				before: previous.completenessScore,
				after: latest.completenessScore,
				improvement: computeImprovement(previous.completenessScore, latest.completenessScore),
			},
			{
				metric: "Score visuel",
				before: previous.visualScore,
				after: latest.visualScore,
				improvement: computeImprovement(previous.visualScore, latest.visualScore),
			},
		];
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const results = await db
			.select()
			.from(schema.resumeScoringResult)
			.where(eq(schema.resumeScoringResult.userId, input.userId))
			.orderBy(desc(schema.resumeScoringResult.createdAt));

		const total = results.length;

		if (total === 0) {
			return {
				total: 0,
				averageOverallScore: 0,
				averageAtsScore: 0,
				highestScore: 0,
				latestScore: 0,
				improvementFromFirst: 0,
			};
		}

		const latestResult = results[0];
		const firstResult = results[results.length - 1];

		let totalOverallScore = 0;
		let totalAtsScore = 0;
		let highestScore = 0;

		for (const result of results) {
			totalOverallScore += result.overallScore;
			totalAtsScore += result.atsScore;
			if (result.overallScore > highestScore) {
				highestScore = result.overallScore;
			}
		}

		const improvementFromFirst =
			firstResult.overallScore > 0
				? Math.round(((latestResult.overallScore - firstResult.overallScore) / firstResult.overallScore) * 100)
				: 0;

		return {
			total,
			averageOverallScore: Math.round(totalOverallScore / total),
			averageAtsScore: Math.round(totalAtsScore / total),
			highestScore,
			latestScore: latestResult.overallScore,
			improvementFromFirst,
		};
	},
};
