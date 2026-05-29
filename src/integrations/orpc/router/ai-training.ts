import z from "zod";
import { adminProcedure, protectedProcedure } from "../context";
import { aiTrainingService } from "../services/ai-training";

// Zod schemas for enums
const aiFeedbackRatingSchema = z.enum(["positive", "negative", "neutral"]);

const aiContentFeatureSchema = z.enum([
	"improve_content",
	"generate_summary",
	"fix_grammar",
	"suggest_skills",
	"generate_headline",
	"analyze_resume",
	"interview_questions",
	"interview_evaluation",
	"interview_chat",
	"cover_letter",
	"linkedin_summary",
	"bullet_point",
	"achievement",
	"skill_extraction",
]);

const trainingSampleTierSchema = z.enum(["gold", "silver", "bronze", "rejected"]);

const qualityDimensionSchema = z.enum([
	"relevance",
	"accuracy",
	"fluency",
	"tone",
	"helpfulness",
	"formatting",
	"completeness",
]);

const modelComparisonStatusSchema = z.enum(["pending", "in_progress", "completed", "failed"]);

// ============================================================================
// FEEDBACK ENDPOINTS
// ============================================================================

export const aiTrainingRouter = {
	// Collect feedback on AI output (user-facing)
	collectFeedback: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-training/feedback",
			tags: ["AI Training"],
			summary: "Submit feedback on AI-generated content",
		})
		.input(
			z.object({
				feature: aiContentFeatureSchema,
				rating: aiFeedbackRatingSchema,
				originalInput: z.string().optional(),
				originalOutput: z.string(),
				editedOutput: z.string().optional(),
				comment: z.string().max(1000).optional(),
				context: z
					.object({
						resumeId: z.string().uuid().optional(),
						sectionType: z.string().optional(),
						language: z.string().optional(),
						model: z.string().optional(),
						provider: z.string().optional(),
					})
					.optional(),
				responseTimeMs: z.number().int().optional(),
				tokenCount: z.number().int().optional(),
				wasAccepted: z.boolean().optional(),
			}),
		)
		.output(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const id = await aiTrainingService.collectFeedback({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	// Get user's own feedback history
	myFeedback: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-training/feedback/mine",
			tags: ["AI Training"],
			summary: "Get my AI feedback history",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					rating: aiFeedbackRatingSchema.optional(),
					limit: z.number().int().min(1).max(100).optional(),
					offset: z.number().int().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(z.any()))
		.handler(async ({ context, input }) => {
			return await aiTrainingService.listFeedback({
				userId: context.user.id,
				...input,
			});
		}),

	// ============================================================================
	// ADMIN ENDPOINTS - FEEDBACK MANAGEMENT
	// ============================================================================

	// List all feedback (admin only)
	listFeedback: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/feedback",
			tags: ["AI Training Admin"],
			summary: "List all AI feedback (admin)",
		})
		.input(
			z
				.object({
					userId: z.string().uuid().optional(),
					feature: aiContentFeatureSchema.optional(),
					rating: aiFeedbackRatingSchema.optional(),
					hasEdits: z.boolean().optional(),
					limit: z.number().int().min(1).max(100).optional(),
					offset: z.number().int().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(z.any()))
		.handler(async ({ input }) => {
			return await aiTrainingService.listFeedback(input);
		}),

	// Get specific feedback (admin only)
	getFeedback: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/feedback/{id}",
			tags: ["AI Training Admin"],
			summary: "Get specific AI feedback (admin)",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.any().nullable())
		.handler(async ({ input }) => {
			return await aiTrainingService.getFeedback(input.id);
		}),

	// ============================================================================
	// ADMIN ENDPOINTS - TRAINING SAMPLES
	// ============================================================================

	// Curate a training sample (admin only)
	curateTrainingSample: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/samples",
			tags: ["AI Training Admin"],
			summary: "Curate a training sample",
		})
		.input(
			z.object({
				feedbackId: z.string().uuid().optional(),
				feature: aiContentFeatureSchema,
				input: z.string(),
				output: z.string(),
				tier: trainingSampleTierSchema.optional(),
				qualityScore: z.number().int().min(0).max(100).optional(),
				context: z
					.object({
						language: z.string().optional(),
						industry: z.string().optional(),
						sectionType: z.string().optional(),
						difficulty: z.string().optional(),
					})
					.optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const id = await aiTrainingService.curateTrainingSample({
				...input,
				curatedBy: context.user.id,
			});
			return { id };
		}),

	// Get a training sample
	getTrainingSample: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/samples/{id}",
			tags: ["AI Training Admin"],
			summary: "Get a training sample",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.any().nullable())
		.handler(async ({ input }) => {
			return await aiTrainingService.getTrainingSample(input.id);
		}),

	// Update a training sample
	updateTrainingSample: adminProcedure
		.route({
			method: "PATCH",
			path: "/ai-training/admin/samples/{id}",
			tags: ["AI Training Admin"],
			summary: "Update a training sample",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				tier: trainingSampleTierSchema.optional(),
				qualityScore: z.number().int().min(0).max(100).optional(),
				tags: z.array(z.string()).optional(),
				output: z.string().optional(),
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input }) => {
			await aiTrainingService.updateTrainingSample(input);
			return { success: true };
		}),

	// List training samples
	listTrainingSamples: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/samples",
			tags: ["AI Training Admin"],
			summary: "List training samples",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					tier: trainingSampleTierSchema.optional(),
					minQualityScore: z.number().int().min(0).max(100).optional(),
					limit: z.number().int().min(1).max(100).optional(),
					offset: z.number().int().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(z.any()))
		.handler(async ({ input }) => {
			return await aiTrainingService.listTrainingSamples(input);
		}),

	// Export training data
	exportTrainingData: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/export",
			tags: ["AI Training Admin"],
			summary: "Export training data for fine-tuning",
		})
		.input(
			z.object({
				format: z.enum(["jsonl", "csv", "json"]),
				feature: aiContentFeatureSchema.optional(),
				tier: trainingSampleTierSchema.optional(),
				minQualityScore: z.number().int().min(0).max(100).optional(),
				limit: z.number().int().min(1).max(10000).optional(),
			}),
		)
		.output(
			z.object({
				data: z.string(),
				format: z.string(),
				count: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			const data = await aiTrainingService.exportTrainingData(input);
			// Count lines for jsonl/csv, parse for json
			let count = 0;
			if (input.format === "jsonl" || input.format === "csv") {
				count = data.split("\n").filter((line) => line.trim()).length;
				if (input.format === "csv") count--; // Subtract header
			} else {
				try {
					count = JSON.parse(data).length;
				} catch {
					count = 0;
				}
			}
			return { data, format: input.format, count };
		}),

	// ============================================================================
	// ADMIN ENDPOINTS - ANALYTICS
	// ============================================================================

	// Analyze improvements
	analyzeImprovements: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/analytics/improvements",
			tags: ["AI Training Admin"],
			summary: "Analyze what users commonly fix",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				totalFeedback: z.number(),
				totalWithEdits: z.number(),
				editRate: z.number(),
				avgEditDistance: z.number(),
				byFeature: z.record(
					z.string(),
					z.object({
						total: z.number(),
						edited: z.number(),
						editRate: z.number(),
						avgDistance: z.number(),
					}),
				),
				byRating: z.record(z.string(), z.number()),
				commonPatterns: z.array(
					z.object({
						type: z.string(),
						count: z.number(),
						percentage: z.number(),
					}),
				),
			}),
		)
		.handler(async ({ input }) => {
			return await aiTrainingService.analyzeImprovements({
				feature: input.feature,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
			});
		}),

	// Get model accuracy
	getModelAccuracy: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/analytics/accuracy",
			tags: ["AI Training Admin"],
			summary: "Get model acceptance rate and accuracy",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					model: z.string().optional(),
					provider: z.string().optional(),
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				totalGenerations: z.number(),
				accepted: z.number(),
				acceptanceRate: z.number(),
				positiveRating: z.number(),
				negativeRating: z.number(),
				neutralRating: z.number(),
				avgResponseTime: z.number(),
				avgTokenCount: z.number(),
				byModel: z.record(
					z.string(),
					z.object({
						total: z.number(),
						accepted: z.number(),
						acceptanceRate: z.number(),
						positive: z.number(),
						negative: z.number(),
					}),
				),
			}),
		)
		.handler(async ({ input }) => {
			return await aiTrainingService.getModelAccuracy({
				...input,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
			});
		}),

	// Get collection stats
	getCollectionStats: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/stats",
			tags: ["AI Training Admin"],
			summary: "Get training data collection statistics",
		})
		.input(z.void())
		.output(
			z.object({
				totalFeedback: z.number(),
				totalTrainingSamples: z.number(),
				samplesByTier: z.record(z.string(), z.number()),
				totalComparisons: z.number(),
				recentFeedback: z.number(),
			}),
		)
		.handler(async () => {
			return await aiTrainingService.getCollectionStats();
		}),

	// ============================================================================
	// ADMIN ENDPOINTS - A/B TESTING
	// ============================================================================

	// Create A/B test
	runABTest: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/ab-tests",
			tags: ["AI Training Admin"],
			summary: "Create a new A/B test between models",
		})
		.input(
			z.object({
				name: z.string().min(1).max(200),
				description: z.string().max(1000).optional(),
				feature: aiContentFeatureSchema,
				modelA: z.string().min(1),
				modelAProvider: z.string().min(1),
				modelB: z.string().min(1),
				modelBProvider: z.string().min(1),
				testInputs: z.array(z.string()).min(1),
			}),
		)
		.output(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const id = await aiTrainingService.runABTest({
				...input,
				createdBy: context.user.id,
			});
			return { id };
		}),

	// Get A/B test
	getABTest: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/ab-tests/{id}",
			tags: ["AI Training Admin"],
			summary: "Get an A/B test",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.any().nullable())
		.handler(async ({ input }) => {
			return await aiTrainingService.getABTest(input.id);
		}),

	// List A/B tests
	listABTests: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/ab-tests",
			tags: ["AI Training Admin"],
			summary: "List A/B tests",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					status: modelComparisonStatusSchema.optional(),
					limit: z.number().int().min(1).max(100).optional(),
					offset: z.number().int().min(0).optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(z.any()))
		.handler(async ({ input }) => {
			return await aiTrainingService.listABTests(input);
		}),

	// Update A/B test status
	updateABTestStatus: adminProcedure
		.route({
			method: "PATCH",
			path: "/ai-training/admin/ab-tests/{id}/status",
			tags: ["AI Training Admin"],
			summary: "Update A/B test status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: modelComparisonStatusSchema,
			}),
		)
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input }) => {
			await aiTrainingService.updateABTestStatus(input);
			return { success: true };
		}),

	// Record comparison result
	recordComparisonResult: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/ab-tests/{comparisonId}/results",
			tags: ["AI Training Admin"],
			summary: "Record a comparison result",
		})
		.input(
			z.object({
				comparisonId: z.string().uuid(),
				input: z.string(),
				modelAOutput: z.string(),
				modelALatencyMs: z.number().int().optional(),
				modelATokens: z.number().int().optional(),
				modelAScore: z.number().int().min(0).max(100).optional(),
				modelBOutput: z.string(),
				modelBLatencyMs: z.number().int().optional(),
				modelBTokens: z.number().int().optional(),
				modelBScore: z.number().int().min(0).max(100).optional(),
				winner: z.enum(["model_a", "model_b", "tie"]).optional(),
				evaluatorNotes: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const id = await aiTrainingService.recordComparisonResult({
				...input,
				evaluatedBy: context.user.id,
			});
			return { id };
		}),

	// Get comparison results
	getComparisonResults: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/ab-tests/{comparisonId}/results",
			tags: ["AI Training Admin"],
			summary: "Get comparison results for an A/B test",
		})
		.input(z.object({ comparisonId: z.string().uuid() }))
		.output(z.array(z.any()))
		.handler(async ({ input }) => {
			return await aiTrainingService.getComparisonResults(input.comparisonId);
		}),

	// Finalize A/B test
	finalizeABTest: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/ab-tests/{id}/finalize",
			tags: ["AI Training Admin"],
			summary: "Calculate final results and determine winner",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.object({ success: z.boolean() }))
		.handler(async ({ input }) => {
			await aiTrainingService.finalizeABTest(input.id);
			return { success: true };
		}),

	// ============================================================================
	// ADMIN ENDPOINTS - QUALITY RATINGS
	// ============================================================================

	// Rate content quality
	rateContentQuality: adminProcedure
		.route({
			method: "POST",
			path: "/ai-training/admin/quality-ratings",
			tags: ["AI Training Admin"],
			summary: "Rate content quality on a dimension",
		})
		.input(
			z.object({
				feedbackId: z.string().uuid(),
				dimension: qualityDimensionSchema,
				score: z.number().int().min(1).max(5),
				weight: z.number().min(0).max(10).optional(),
				notes: z.string().max(500).optional(),
			}),
		)
		.output(z.object({ id: z.string().uuid() }))
		.handler(async ({ context, input }) => {
			const id = await aiTrainingService.rateContentQuality({
				...input,
				reviewedBy: context.user.id,
			});
			return { id };
		}),

	// Get quality ratings for feedback
	getQualityRatings: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/quality-ratings/{feedbackId}",
			tags: ["AI Training Admin"],
			summary: "Get quality ratings for a feedback item",
		})
		.input(z.object({ feedbackId: z.string().uuid() }))
		.output(z.array(z.any()))
		.handler(async ({ input }) => {
			return await aiTrainingService.getQualityRatings(input.feedbackId);
		}),

	// Get quality stats
	getQualityStats: adminProcedure
		.route({
			method: "GET",
			path: "/ai-training/admin/quality-ratings/stats",
			tags: ["AI Training Admin"],
			summary: "Get aggregate quality statistics",
		})
		.input(
			z
				.object({
					feature: aiContentFeatureSchema.optional(),
					startDate: z.string().datetime().optional(),
					endDate: z.string().datetime().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				totalRatings: z.number(),
				avgByDimension: z.record(z.string(), z.number()),
				overallAverage: z.number(),
			}),
		)
		.handler(async ({ input }) => {
			return await aiTrainingService.getQualityStats({
				feature: input.feature,
				startDate: input.startDate ? new Date(input.startDate) : undefined,
				endDate: input.endDate ? new Date(input.endDate) : undefined,
			});
		}),
};
