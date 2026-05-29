import { ORPCError } from "@orpc/client";
import { and, desc, eq, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	VideoAnalysisCategory,
	VideoAnalysisCategoryScore,
	VideoAnalysisHighlight,
	VideoAnalysisVoiceMetrics,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================
// TYPES
// ============================================

export type VideoAnalysisResultItem = {
	id: string;
	userId: string;
	title: string;
	overallScore: number;
	duration: number;
	categories: VideoAnalysisCategoryScore[];
	voiceMetrics: VideoAnalysisVoiceMetrics;
	highlights: VideoAnalysisHighlight[];
	recommendations: string[];
	videoUrl: string | null;
	thumbnailUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateVideoAnalysisInput = {
	userId: string;
	title: string;
	overallScore: number;
	duration: number;
	categories: VideoAnalysisCategoryScore[];
	voiceMetrics: VideoAnalysisVoiceMetrics;
	highlights: VideoAnalysisHighlight[];
	recommendations: string[];
	videoUrl?: string;
	thumbnailUrl?: string;
};

export type UpdateVideoAnalysisInput = {
	id: string;
	userId: string;
	title?: string;
	overallScore?: number;
	duration?: number;
	categories?: VideoAnalysisCategoryScore[];
	voiceMetrics?: VideoAnalysisVoiceMetrics;
	highlights?: VideoAnalysisHighlight[];
	recommendations?: string[];
	videoUrl?: string;
	thumbnailUrl?: string;
};

export type PostureChecklistState = {
	id: string;
	userId: string;
	checkedItems: string[];
	createdAt: Date;
	updatedAt: Date;
};

// ============================================
// SERVICE
// ============================================

export const videoAnalysisService = {
	// ============================================
	// VIDEO ANALYSIS RESULTS
	// ============================================

	results: {
		// Create new analysis result
		create: async (input: CreateVideoAnalysisInput): Promise<VideoAnalysisResultItem> => {
			const id = generateId();

			await db.insert(schema.videoAnalysisResult).values({
				id,
				userId: input.userId,
				title: input.title,
				overallScore: input.overallScore,
				duration: input.duration,
				categories: input.categories,
				voiceMetrics: input.voiceMetrics,
				highlights: input.highlights,
				recommendations: input.recommendations,
				videoUrl: input.videoUrl ?? null,
				thumbnailUrl: input.thumbnailUrl ?? null,
			});

			const [result] = await db.select().from(schema.videoAnalysisResult).where(eq(schema.videoAnalysisResult.id, id));

			return result as VideoAnalysisResultItem;
		},

		// Get analysis by ID
		getById: async (input: { id: string; userId: string }): Promise<VideoAnalysisResultItem> => {
			const [result] = await db
				.select()
				.from(schema.videoAnalysisResult)
				.where(and(eq(schema.videoAnalysisResult.id, input.id), eq(schema.videoAnalysisResult.userId, input.userId)));

			if (!result) {
				throw new ORPCError("NOT_FOUND", { message: "Video analysis result not found" });
			}

			return result as VideoAnalysisResultItem;
		},

		// List analysis results
		list: async (input: {
			userId: string;
			limit?: number;
			offset?: number;
		}): Promise<{ items: VideoAnalysisResultItem[]; total: number }> => {
			// Count total
			const [countResult] = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.videoAnalysisResult)
				.where(eq(schema.videoAnalysisResult.userId, input.userId));

			// Get items
			const items = await db
				.select()
				.from(schema.videoAnalysisResult)
				.where(eq(schema.videoAnalysisResult.userId, input.userId))
				.orderBy(desc(schema.videoAnalysisResult.createdAt))
				.limit(input.limit ?? 50)
				.offset(input.offset ?? 0);

			return {
				items: items as VideoAnalysisResultItem[],
				total: countResult?.count ?? 0,
			};
		},

		// Update analysis result
		update: async (input: UpdateVideoAnalysisInput): Promise<VideoAnalysisResultItem> => {
			const [existing] = await db
				.select({ id: schema.videoAnalysisResult.id })
				.from(schema.videoAnalysisResult)
				.where(and(eq(schema.videoAnalysisResult.id, input.id), eq(schema.videoAnalysisResult.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Video analysis result not found" });
			}

			await db
				.update(schema.videoAnalysisResult)
				.set({
					title: input.title,
					overallScore: input.overallScore,
					duration: input.duration,
					categories: input.categories,
					voiceMetrics: input.voiceMetrics,
					highlights: input.highlights,
					recommendations: input.recommendations,
					videoUrl: input.videoUrl,
					thumbnailUrl: input.thumbnailUrl,
				})
				.where(and(eq(schema.videoAnalysisResult.id, input.id), eq(schema.videoAnalysisResult.userId, input.userId)));

			return await videoAnalysisService.results.getById({ id: input.id, userId: input.userId });
		},

		// Delete analysis result
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.videoAnalysisResult)
				.where(and(eq(schema.videoAnalysisResult.id, input.id), eq(schema.videoAnalysisResult.userId, input.userId)));
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const results = await db
				.select()
				.from(schema.videoAnalysisResult)
				.where(eq(schema.videoAnalysisResult.userId, input.userId));

			if (results.length === 0) {
				return {
					totalAnalyses: 0,
					averageScore: 0,
					totalDuration: 0,
					bestScore: 0,
					categoryAverages: {
						body_language: 0,
						eye_contact: 0,
						voice: 0,
						confidence: 0,
						posture: 0,
						facial_expression: 0,
					},
					recentImprovement: 0,
				};
			}

			const totalAnalyses = results.length;
			const averageScore = Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / totalAnalyses);
			const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
			const bestScore = Math.max(...results.map((r) => r.overallScore));

			// Calculate category averages
			const categoryTotals: Record<VideoAnalysisCategory, { sum: number; count: number }> = {
				body_language: { sum: 0, count: 0 },
				eye_contact: { sum: 0, count: 0 },
				voice: { sum: 0, count: 0 },
				confidence: { sum: 0, count: 0 },
				posture: { sum: 0, count: 0 },
				facial_expression: { sum: 0, count: 0 },
			};

			for (const result of results) {
				for (const cat of result.categories as VideoAnalysisCategoryScore[]) {
					if (categoryTotals[cat.category]) {
						categoryTotals[cat.category].sum += cat.score;
						categoryTotals[cat.category].count++;
					}
				}
			}

			const categoryAverages: Record<VideoAnalysisCategory, number> = {
				body_language: 0,
				eye_contact: 0,
				voice: 0,
				confidence: 0,
				posture: 0,
				facial_expression: 0,
			};

			for (const cat of Object.keys(categoryTotals) as VideoAnalysisCategory[]) {
				if (categoryTotals[cat].count > 0) {
					categoryAverages[cat] = Math.round(categoryTotals[cat].sum / categoryTotals[cat].count);
				}
			}

			// Calculate recent improvement (compare last 2 analyses)
			let recentImprovement = 0;
			const sortedByDate = [...results].sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
			if (sortedByDate.length >= 2) {
				recentImprovement = sortedByDate[0].overallScore - sortedByDate[1].overallScore;
			}

			return {
				totalAnalyses,
				averageScore,
				totalDuration,
				bestScore,
				categoryAverages,
				recentImprovement,
			};
		},

		// Get latest result
		getLatest: async (input: { userId: string }): Promise<VideoAnalysisResultItem | null> => {
			const [result] = await db
				.select()
				.from(schema.videoAnalysisResult)
				.where(eq(schema.videoAnalysisResult.userId, input.userId))
				.orderBy(desc(schema.videoAnalysisResult.createdAt))
				.limit(1);

			return (result as VideoAnalysisResultItem) ?? null;
		},
	},

	// ============================================
	// POSTURE CHECKLIST
	// ============================================

	postureChecklist: {
		// Get checklist state
		get: async (input: { userId: string }): Promise<PostureChecklistState> => {
			const [existing] = await db
				.select()
				.from(schema.videoAnalysisPostureChecklist)
				.where(eq(schema.videoAnalysisPostureChecklist.userId, input.userId));

			if (existing) {
				return existing as PostureChecklistState;
			}

			// Create default state if not exists
			const id = generateId();
			await db.insert(schema.videoAnalysisPostureChecklist).values({
				id,
				userId: input.userId,
				checkedItems: [],
			});

			const [created] = await db
				.select()
				.from(schema.videoAnalysisPostureChecklist)
				.where(eq(schema.videoAnalysisPostureChecklist.id, id));

			return created as PostureChecklistState;
		},

		// Toggle item
		toggleItem: async (input: { userId: string; itemId: string }): Promise<PostureChecklistState> => {
			const state = await videoAnalysisService.postureChecklist.get({ userId: input.userId });

			const isChecked = state.checkedItems.includes(input.itemId);
			const newCheckedItems = isChecked
				? state.checkedItems.filter((id) => id !== input.itemId)
				: [...state.checkedItems, input.itemId];

			await db
				.update(schema.videoAnalysisPostureChecklist)
				.set({ checkedItems: newCheckedItems })
				.where(eq(schema.videoAnalysisPostureChecklist.userId, input.userId));

			return await videoAnalysisService.postureChecklist.get({ userId: input.userId });
		},

		// Reset checklist
		reset: async (input: { userId: string }): Promise<PostureChecklistState> => {
			await db
				.update(schema.videoAnalysisPostureChecklist)
				.set({ checkedItems: [] })
				.where(eq(schema.videoAnalysisPostureChecklist.userId, input.userId));

			return await videoAnalysisService.postureChecklist.get({ userId: input.userId });
		},
	},
};
