import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	AiContentFeature,
	AiFeedbackRating,
	ModelComparisonStatus,
	QualityDimension,
	TrainingSampleTier,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================================================
// INPUT TYPES
// ============================================================================

export type CollectFeedbackInput = {
	userId: string;
	feature: AiContentFeature;
	rating: AiFeedbackRating;
	originalInput?: string;
	originalOutput: string;
	editedOutput?: string;
	comment?: string;
	context?: {
		resumeId?: string;
		sectionType?: string;
		language?: string;
		model?: string;
		provider?: string;
	};
	responseTimeMs?: number;
	tokenCount?: number;
	wasAccepted?: boolean;
};

export type CurateTrainingSampleInput = {
	feedbackId?: string;
	feature: AiContentFeature;
	input: string;
	output: string;
	tier?: TrainingSampleTier;
	qualityScore?: number;
	curatedBy: string;
	context?: {
		language?: string;
		industry?: string;
		sectionType?: string;
		difficulty?: string;
	};
	tags?: string[];
};

export type ExportTrainingDataInput = {
	format: "jsonl" | "csv" | "json";
	feature?: AiContentFeature;
	tier?: TrainingSampleTier;
	minQualityScore?: number;
	limit?: number;
};

export type RunABTestInput = {
	name: string;
	description?: string;
	feature: AiContentFeature;
	modelA: string;
	modelAProvider: string;
	modelB: string;
	modelBProvider: string;
	testInputs: string[];
	createdBy: string;
};

export type RecordComparisonResultInput = {
	comparisonId: string;
	input: string;
	modelAOutput: string;
	modelALatencyMs?: number;
	modelATokens?: number;
	modelAScore?: number;
	modelBOutput: string;
	modelBLatencyMs?: number;
	modelBTokens?: number;
	modelBScore?: number;
	winner?: "model_a" | "model_b" | "tie";
	evaluatorNotes?: string;
	evaluatedBy?: string;
};

export type RateContentQualityInput = {
	feedbackId: string;
	dimension: QualityDimension;
	score: number;
	weight?: number;
	notes?: string;
	reviewedBy?: string;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
	const m = str1.length;
	const n = str2.length;

	// Create a matrix to store distances
	const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

	// Initialize base cases
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;

	// Fill the matrix
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (str1[i - 1] === str2[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1];
			} else {
				dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
			}
		}
	}

	return dp[m][n];
}

// ============================================================================
// SERVICE
// ============================================================================

export const aiTrainingService = {
	/**
	 * Collect user feedback on AI-generated content
	 * Captures thumbs up/down, edits made, and optional comments
	 */
	collectFeedback: async (input: CollectFeedbackInput): Promise<string> => {
		const id = generateId();
		const hasEdits = !!input.editedOutput && input.editedOutput !== input.originalOutput;

		let editDistance: number | undefined;
		if (hasEdits && input.editedOutput) {
			editDistance = levenshteinDistance(input.originalOutput, input.editedOutput);
		}

		await db.insert(schema.aiFeedback).values({
			id,
			userId: input.userId,
			feature: input.feature,
			rating: input.rating,
			originalInput: input.originalInput,
			originalOutput: input.originalOutput,
			editedOutput: input.editedOutput,
			hasEdits,
			editDistance,
			comment: input.comment,
			context: input.context,
			responseTimeMs: input.responseTimeMs,
			tokenCount: input.tokenCount,
			wasAccepted: input.wasAccepted ?? false,
		});

		return id;
	},

	/**
	 * Get feedback by ID
	 */
	getFeedback: async (id: string) => {
		const [feedback] = await db.select().from(schema.aiFeedback).where(eq(schema.aiFeedback.id, id));
		return feedback ?? null;
	},

	/**
	 * List feedback with filters
	 */
	listFeedback: async (input: {
		userId?: string;
		feature?: AiContentFeature;
		rating?: AiFeedbackRating;
		hasEdits?: boolean;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [];

		if (input.userId) {
			conditions.push(eq(schema.aiFeedback.userId, input.userId));
		}
		if (input.feature) {
			conditions.push(eq(schema.aiFeedback.feature, input.feature));
		}
		if (input.rating) {
			conditions.push(eq(schema.aiFeedback.rating, input.rating));
		}
		if (input.hasEdits !== undefined) {
			conditions.push(eq(schema.aiFeedback.hasEdits, input.hasEdits));
		}

		return await db
			.select()
			.from(schema.aiFeedback)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(schema.aiFeedback.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);
	},

	/**
	 * Curate a high-quality training sample from feedback or create a new one
	 */
	curateTrainingSample: async (input: CurateTrainingSampleInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.aiTrainingSample).values({
			id,
			feedbackId: input.feedbackId,
			feature: input.feature,
			input: input.input,
			output: input.output,
			tier: input.tier ?? "bronze",
			qualityScore: input.qualityScore,
			curatedBy: input.curatedBy,
			curatedAt: new Date(),
			context: input.context,
			tags: input.tags ?? [],
		});

		return id;
	},

	/**
	 * Get training sample by ID
	 */
	getTrainingSample: async (id: string) => {
		const [sample] = await db.select().from(schema.aiTrainingSample).where(eq(schema.aiTrainingSample.id, id));
		return sample ?? null;
	},

	/**
	 * Update training sample tier and quality score
	 */
	updateTrainingSample: async (input: {
		id: string;
		tier?: TrainingSampleTier;
		qualityScore?: number;
		tags?: string[];
		output?: string;
	}) => {
		await db
			.update(schema.aiTrainingSample)
			.set({
				tier: input.tier,
				qualityScore: input.qualityScore,
				tags: input.tags,
				output: input.output,
			})
			.where(eq(schema.aiTrainingSample.id, input.id));
	},

	/**
	 * List training samples with filters
	 */
	listTrainingSamples: async (input: {
		feature?: AiContentFeature;
		tier?: TrainingSampleTier;
		minQualityScore?: number;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [];

		if (input.feature) {
			conditions.push(eq(schema.aiTrainingSample.feature, input.feature));
		}
		if (input.tier) {
			conditions.push(eq(schema.aiTrainingSample.tier, input.tier));
		}
		if (input.minQualityScore !== undefined) {
			conditions.push(gte(schema.aiTrainingSample.qualityScore, input.minQualityScore));
		}

		return await db
			.select()
			.from(schema.aiTrainingSample)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(schema.aiTrainingSample.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);
	},

	/**
	 * Export training data in specified format for fine-tuning
	 */
	exportTrainingData: async (input: ExportTrainingDataInput): Promise<string> => {
		const conditions = [];

		if (input.feature) {
			conditions.push(eq(schema.aiTrainingSample.feature, input.feature));
		}
		if (input.tier) {
			conditions.push(eq(schema.aiTrainingSample.tier, input.tier));
		}
		if (input.minQualityScore !== undefined) {
			conditions.push(gte(schema.aiTrainingSample.qualityScore, input.minQualityScore));
		}

		// Exclude rejected samples
		conditions.push(sql`${schema.aiTrainingSample.tier} != 'rejected'`);

		const samples = await db
			.select()
			.from(schema.aiTrainingSample)
			.where(and(...conditions))
			.orderBy(desc(schema.aiTrainingSample.qualityScore))
			.limit(input.limit ?? 10000);

		// Mark samples as exported
		const sampleIds = samples.map((s) => s.id);
		if (sampleIds.length > 0) {
			await db
				.update(schema.aiTrainingSample)
				.set({
					exportedAt: new Date(),
					exportFormat: input.format,
				})
				.where(sql`${schema.aiTrainingSample.id} = ANY(${sampleIds})`);
		}

		// Format based on requested format
		switch (input.format) {
			case "jsonl": {
				// OpenAI fine-tuning format
				return samples
					.map((s) =>
						JSON.stringify({
							messages: [
								{ role: "system", content: "You are a professional resume and career assistant." },
								{ role: "user", content: s.input },
								{ role: "assistant", content: s.output },
							],
						}),
					)
					.join("\n");
			}
			case "csv": {
				const header = "input,output,feature,tier,quality_score";
				const rows = samples.map(
					(s) =>
						`"${s.input.replace(/"/g, '""')}","${s.output.replace(/"/g, '""')}","${s.feature}","${s.tier}","${s.qualityScore ?? ""}"`,
				);
				return [header, ...rows].join("\n");
			}
			default: {
				return JSON.stringify(
					samples.map((s) => ({
						input: s.input,
						output: s.output,
						feature: s.feature,
						tier: s.tier,
						qualityScore: s.qualityScore,
						context: s.context,
						tags: s.tags,
					})),
					null,
					2,
				);
			}
		}
	},

	/**
	 * Analyze what users commonly fix in AI outputs
	 * Returns patterns and common corrections
	 */
	analyzeImprovements: async (input?: {
		feature?: AiContentFeature;
		startDate?: Date;
		endDate?: Date;
	}): Promise<{
		totalFeedback: number;
		totalWithEdits: number;
		editRate: number;
		avgEditDistance: number;
		byFeature: Record<
			string,
			{
				total: number;
				edited: number;
				editRate: number;
				avgDistance: number;
			}
		>;
		byRating: Record<string, number>;
		commonPatterns: {
			type: string;
			count: number;
			percentage: number;
		}[];
	}> => {
		const conditions = [];

		if (input?.feature) {
			conditions.push(eq(schema.aiFeedback.feature, input.feature));
		}
		if (input?.startDate) {
			conditions.push(gte(schema.aiFeedback.createdAt, input.startDate));
		}
		if (input?.endDate) {
			conditions.push(lte(schema.aiFeedback.createdAt, input.endDate));
		}

		const feedback = await db
			.select()
			.from(schema.aiFeedback)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		const totalFeedback = feedback.length;
		const withEdits = feedback.filter((f) => f.hasEdits);
		const totalWithEdits = withEdits.length;
		const editRate = totalFeedback > 0 ? (totalWithEdits / totalFeedback) * 100 : 0;

		// Calculate average edit distance
		const distances = withEdits.map((f) => f.editDistance ?? 0).filter((d) => d > 0);
		const avgEditDistance = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;

		// Group by feature
		const byFeature: Record<string, { total: number; edited: number; editRate: number; avgDistance: number }> = {};
		for (const f of feedback) {
			if (!byFeature[f.feature]) {
				byFeature[f.feature] = { total: 0, edited: 0, editRate: 0, avgDistance: 0 };
			}
			byFeature[f.feature].total++;
			if (f.hasEdits) {
				byFeature[f.feature].edited++;
				if (f.editDistance) {
					byFeature[f.feature].avgDistance += f.editDistance;
				}
			}
		}

		// Calculate rates and averages
		for (const key of Object.keys(byFeature)) {
			const data = byFeature[key];
			data.editRate = data.total > 0 ? (data.edited / data.total) * 100 : 0;
			data.avgDistance = data.edited > 0 ? data.avgDistance / data.edited : 0;
		}

		// Group by rating
		const byRating: Record<string, number> = {};
		for (const f of feedback) {
			byRating[f.rating] = (byRating[f.rating] ?? 0) + 1;
		}

		// Analyze common patterns in edits
		// This is a simplified analysis - a more sophisticated version would use NLP
		const commonPatterns: { type: string; count: number; percentage: number }[] = [];

		// Count feedback with short edits (likely typo fixes)
		const shortEdits = withEdits.filter((f) => (f.editDistance ?? 0) < 20);
		if (shortEdits.length > 0) {
			commonPatterns.push({
				type: "Minor corrections (typos, formatting)",
				count: shortEdits.length,
				percentage: (shortEdits.length / totalWithEdits) * 100,
			});
		}

		// Count feedback with medium edits (phrasing changes)
		const mediumEdits = withEdits.filter((f) => (f.editDistance ?? 0) >= 20 && (f.editDistance ?? 0) < 100);
		if (mediumEdits.length > 0) {
			commonPatterns.push({
				type: "Phrasing adjustments",
				count: mediumEdits.length,
				percentage: (mediumEdits.length / totalWithEdits) * 100,
			});
		}

		// Count feedback with major edits (substantial rewrites)
		const majorEdits = withEdits.filter((f) => (f.editDistance ?? 0) >= 100);
		if (majorEdits.length > 0) {
			commonPatterns.push({
				type: "Substantial rewrites",
				count: majorEdits.length,
				percentage: (majorEdits.length / totalWithEdits) * 100,
			});
		}

		return {
			totalFeedback,
			totalWithEdits,
			editRate,
			avgEditDistance,
			byFeature,
			byRating,
			commonPatterns,
		};
	},

	/**
	 * Get model acceptance rate and accuracy metrics
	 */
	getModelAccuracy: async (input?: {
		feature?: AiContentFeature;
		model?: string;
		provider?: string;
		startDate?: Date;
		endDate?: Date;
	}): Promise<{
		totalGenerations: number;
		accepted: number;
		acceptanceRate: number;
		positiveRating: number;
		negativeRating: number;
		neutralRating: number;
		avgResponseTime: number;
		avgTokenCount: number;
		byModel: Record<
			string,
			{
				total: number;
				accepted: number;
				acceptanceRate: number;
				positive: number;
				negative: number;
			}
		>;
	}> => {
		const conditions = [];

		if (input?.feature) {
			conditions.push(eq(schema.aiFeedback.feature, input.feature));
		}
		if (input?.startDate) {
			conditions.push(gte(schema.aiFeedback.createdAt, input.startDate));
		}
		if (input?.endDate) {
			conditions.push(lte(schema.aiFeedback.createdAt, input.endDate));
		}

		const feedback = await db
			.select()
			.from(schema.aiFeedback)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		// Filter by model/provider if specified
		let filteredFeedback = feedback;
		if (input?.model || input?.provider) {
			filteredFeedback = feedback.filter((f) => {
				const ctx = f.context as { model?: string; provider?: string } | null;
				if (input?.model && ctx?.model !== input.model) return false;
				if (input?.provider && ctx?.provider !== input.provider) return false;
				return true;
			});
		}

		const totalGenerations = filteredFeedback.length;
		const accepted = filteredFeedback.filter((f) => f.wasAccepted).length;
		const acceptanceRate = totalGenerations > 0 ? (accepted / totalGenerations) * 100 : 0;

		const positiveRating = filteredFeedback.filter((f) => f.rating === "positive").length;
		const negativeRating = filteredFeedback.filter((f) => f.rating === "negative").length;
		const neutralRating = filteredFeedback.filter((f) => f.rating === "neutral").length;

		// Calculate averages
		const responseTimes = filteredFeedback.map((f) => f.responseTimeMs).filter((t): t is number => t !== null);
		const avgResponseTime =
			responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

		const tokenCounts = filteredFeedback.map((f) => f.tokenCount).filter((t): t is number => t !== null);
		const avgTokenCount = tokenCounts.length > 0 ? tokenCounts.reduce((a, b) => a + b, 0) / tokenCounts.length : 0;

		// Group by model
		const byModel: Record<
			string,
			{ total: number; accepted: number; acceptanceRate: number; positive: number; negative: number }
		> = {};

		for (const f of filteredFeedback) {
			const ctx = f.context as { model?: string } | null;
			const model = ctx?.model ?? "unknown";

			if (!byModel[model]) {
				byModel[model] = { total: 0, accepted: 0, acceptanceRate: 0, positive: 0, negative: 0 };
			}

			byModel[model].total++;
			if (f.wasAccepted) byModel[model].accepted++;
			if (f.rating === "positive") byModel[model].positive++;
			if (f.rating === "negative") byModel[model].negative++;
		}

		// Calculate acceptance rates
		for (const key of Object.keys(byModel)) {
			const data = byModel[key];
			data.acceptanceRate = data.total > 0 ? (data.accepted / data.total) * 100 : 0;
		}

		return {
			totalGenerations,
			accepted,
			acceptanceRate,
			positiveRating,
			negativeRating,
			neutralRating,
			avgResponseTime,
			avgTokenCount,
			byModel,
		};
	},

	/**
	 * Create a new A/B test between two models
	 */
	runABTest: async (input: RunABTestInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.modelComparison).values({
			id,
			name: input.name,
			description: input.description,
			feature: input.feature,
			modelA: input.modelA,
			modelAProvider: input.modelAProvider,
			modelB: input.modelB,
			modelBProvider: input.modelBProvider,
			testInputs: input.testInputs,
			status: "pending",
			createdBy: input.createdBy,
		});

		return id;
	},

	/**
	 * Get A/B test by ID
	 */
	getABTest: async (id: string) => {
		const [comparison] = await db.select().from(schema.modelComparison).where(eq(schema.modelComparison.id, id));
		return comparison ?? null;
	},

	/**
	 * Update A/B test status
	 */
	updateABTestStatus: async (input: { id: string; status: ModelComparisonStatus }) => {
		const updates: Record<string, unknown> = { status: input.status };

		if (input.status === "in_progress") {
			updates.startedAt = new Date();
		} else if (input.status === "completed" || input.status === "failed") {
			updates.completedAt = new Date();
		}

		await db.update(schema.modelComparison).set(updates).where(eq(schema.modelComparison.id, input.id));
	},

	/**
	 * Record a comparison result for an A/B test
	 */
	recordComparisonResult: async (input: RecordComparisonResultInput): Promise<string> => {
		const id = generateId();

		const scoreDifference =
			input.modelAScore !== undefined && input.modelBScore !== undefined
				? input.modelAScore - input.modelBScore
				: undefined;

		await db.insert(schema.modelComparisonResult).values({
			id,
			comparisonId: input.comparisonId,
			input: input.input,
			modelAOutput: input.modelAOutput,
			modelALatencyMs: input.modelALatencyMs,
			modelATokens: input.modelATokens,
			modelAScore: input.modelAScore,
			modelBOutput: input.modelBOutput,
			modelBLatencyMs: input.modelBLatencyMs,
			modelBTokens: input.modelBTokens,
			modelBScore: input.modelBScore,
			winner: input.winner,
			scoreDifference,
			evaluatorNotes: input.evaluatorNotes,
			evaluatedBy: input.evaluatedBy,
		});

		return id;
	},

	/**
	 * Get all results for an A/B test
	 */
	getComparisonResults: async (comparisonId: string) => {
		return await db
			.select()
			.from(schema.modelComparisonResult)
			.where(eq(schema.modelComparisonResult.comparisonId, comparisonId))
			.orderBy(schema.modelComparisonResult.createdAt);
	},

	/**
	 * Calculate and update final A/B test results
	 */
	finalizeABTest: async (comparisonId: string): Promise<void> => {
		const results = await aiTrainingService.getComparisonResults(comparisonId);

		if (results.length === 0) {
			await db
				.update(schema.modelComparison)
				.set({
					status: "failed",
					completedAt: new Date(),
				})
				.where(eq(schema.modelComparison.id, comparisonId));
			return;
		}

		// Calculate aggregated results
		let modelAWins = 0;
		let modelBWins = 0;
		let ties = 0;
		let modelATotalScore = 0;
		let modelBTotalScore = 0;
		let modelATotalLatency = 0;
		let modelBTotalLatency = 0;
		let modelATotalTokens = 0;
		let modelBTotalTokens = 0;
		let scoredCount = 0;
		let latencyCount = 0;
		let tokenCount = 0;

		for (const r of results) {
			if (r.winner === "model_a") modelAWins++;
			else if (r.winner === "model_b") modelBWins++;
			else ties++;

			if (r.modelAScore !== null && r.modelBScore !== null) {
				modelATotalScore += r.modelAScore;
				modelBTotalScore += r.modelBScore;
				scoredCount++;
			}
			if (r.modelALatencyMs !== null && r.modelBLatencyMs !== null) {
				modelATotalLatency += r.modelALatencyMs;
				modelBTotalLatency += r.modelBLatencyMs;
				latencyCount++;
			}
			if (r.modelATokens !== null && r.modelBTokens !== null) {
				modelATotalTokens += r.modelATokens;
				modelBTotalTokens += r.modelBTokens;
				tokenCount++;
			}
		}

		const totalComparisons = results.length;
		const modelAAvgScore = scoredCount > 0 ? modelATotalScore / scoredCount : 0;
		const modelBAvgScore = scoredCount > 0 ? modelBTotalScore / scoredCount : 0;
		const modelAAvgLatency = latencyCount > 0 ? modelATotalLatency / latencyCount : 0;
		const modelBAvgLatency = latencyCount > 0 ? modelBTotalLatency / latencyCount : 0;
		const modelAAvgTokens = tokenCount > 0 ? modelATotalTokens / tokenCount : 0;
		const modelBAvgTokens = tokenCount > 0 ? modelBTotalTokens / tokenCount : 0;

		// Determine winner
		let winner: string | null = null;
		let winMargin = 0;

		if (modelAWins > modelBWins) {
			winner = "model_a";
			winMargin = ((modelAWins - modelBWins) / totalComparisons) * 100;
		} else if (modelBWins > modelAWins) {
			winner = "model_b";
			winMargin = ((modelBWins - modelAWins) / totalComparisons) * 100;
		} else {
			winner = "tie";
		}

		// Simple confidence calculation based on sample size and margin
		const confidence = Math.min(100, (totalComparisons / 10) * winMargin);

		await db
			.update(schema.modelComparison)
			.set({
				status: "completed",
				completedAt: new Date(),
				winner,
				winMargin,
				confidence,
				results: {
					totalComparisons,
					modelAWins,
					modelBWins,
					ties,
					modelAAvgScore,
					modelBAvgScore,
					modelAAvgLatency,
					modelBAvgLatency,
					modelAAvgTokens,
					modelBAvgTokens,
					byDimension: {},
				},
			})
			.where(eq(schema.modelComparison.id, comparisonId));
	},

	/**
	 * List A/B tests with filters
	 */
	listABTests: async (input?: {
		feature?: AiContentFeature;
		status?: ModelComparisonStatus;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [];

		if (input?.feature) {
			conditions.push(eq(schema.modelComparison.feature, input.feature));
		}
		if (input?.status) {
			conditions.push(eq(schema.modelComparison.status, input.status));
		}

		return await db
			.select()
			.from(schema.modelComparison)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(schema.modelComparison.createdAt))
			.limit(input?.limit ?? 50)
			.offset(input?.offset ?? 0);
	},

	/**
	 * Rate content quality on specific dimensions
	 */
	rateContentQuality: async (input: RateContentQualityInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.contentQualityRating).values({
			id,
			feedbackId: input.feedbackId,
			dimension: input.dimension,
			score: input.score,
			weight: input.weight ?? 1.0,
			notes: input.notes,
			reviewedBy: input.reviewedBy,
		});

		return id;
	},

	/**
	 * Get quality ratings for a feedback item
	 */
	getQualityRatings: async (feedbackId: string) => {
		return await db
			.select()
			.from(schema.contentQualityRating)
			.where(eq(schema.contentQualityRating.feedbackId, feedbackId));
	},

	/**
	 * Get aggregate quality statistics
	 */
	getQualityStats: async (input?: {
		feature?: AiContentFeature;
		startDate?: Date;
		endDate?: Date;
	}): Promise<{
		totalRatings: number;
		avgByDimension: Record<string, number>;
		overallAverage: number;
	}> => {
		// First get all feedback IDs matching criteria
		const feedbackConditions = [];
		if (input?.feature) {
			feedbackConditions.push(eq(schema.aiFeedback.feature, input.feature));
		}
		if (input?.startDate) {
			feedbackConditions.push(gte(schema.aiFeedback.createdAt, input.startDate));
		}
		if (input?.endDate) {
			feedbackConditions.push(lte(schema.aiFeedback.createdAt, input.endDate));
		}

		const feedbackIds = await db
			.select({ id: schema.aiFeedback.id })
			.from(schema.aiFeedback)
			.where(feedbackConditions.length > 0 ? and(...feedbackConditions) : undefined);

		if (feedbackIds.length === 0) {
			return {
				totalRatings: 0,
				avgByDimension: {},
				overallAverage: 0,
			};
		}

		const ids = feedbackIds.map((f) => f.id);

		const ratings = await db
			.select()
			.from(schema.contentQualityRating)
			.where(sql`${schema.contentQualityRating.feedbackId} = ANY(${ids})`);

		const totalRatings = ratings.length;

		// Calculate average by dimension
		const dimensionSums: Record<string, { sum: number; count: number }> = {};
		for (const r of ratings) {
			if (!dimensionSums[r.dimension]) {
				dimensionSums[r.dimension] = { sum: 0, count: 0 };
			}
			dimensionSums[r.dimension].sum += r.score;
			dimensionSums[r.dimension].count++;
		}

		const avgByDimension: Record<string, number> = {};
		for (const [dim, data] of Object.entries(dimensionSums)) {
			avgByDimension[dim] = data.count > 0 ? data.sum / data.count : 0;
		}

		// Calculate overall average
		const overallSum = ratings.reduce((acc, r) => acc + r.score, 0);
		const overallAverage = totalRatings > 0 ? overallSum / totalRatings : 0;

		return {
			totalRatings,
			avgByDimension,
			overallAverage,
		};
	},

	/**
	 * Get training data collection summary statistics
	 */
	getCollectionStats: async (): Promise<{
		totalFeedback: number;
		totalTrainingSamples: number;
		samplesByTier: Record<string, number>;
		totalComparisons: number;
		recentFeedback: number;
	}> => {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [feedbackCount] = await db.select({ count: count() }).from(schema.aiFeedback);
		const [sampleCount] = await db.select({ count: count() }).from(schema.aiTrainingSample);
		const [comparisonCount] = await db.select({ count: count() }).from(schema.modelComparison);
		const [recentCount] = await db
			.select({ count: count() })
			.from(schema.aiFeedback)
			.where(gte(schema.aiFeedback.createdAt, thirtyDaysAgo));

		// Count by tier
		const samples = await db.select().from(schema.aiTrainingSample);
		const samplesByTier: Record<string, number> = {
			gold: 0,
			silver: 0,
			bronze: 0,
			rejected: 0,
		};
		for (const s of samples) {
			samplesByTier[s.tier] = (samplesByTier[s.tier] ?? 0) + 1;
		}

		return {
			totalFeedback: Number(feedbackCount?.count ?? 0),
			totalTrainingSamples: Number(sampleCount?.count ?? 0),
			samplesByTier,
			totalComparisons: Number(comparisonCount?.count ?? 0),
			recentFeedback: Number(recentCount?.count ?? 0),
		};
	},
};
