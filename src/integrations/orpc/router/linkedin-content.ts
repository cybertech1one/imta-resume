import z from "zod";
import { protectedProcedure } from "../context";
import { linkedinContentService } from "../services/linkedin-content";

// Schemas
const postTypeSchema = z.enum([
	"career_update",
	"thought_leadership",
	"engagement",
	"story",
	"achievement",
	"tip",
	"question",
]);

const postToneSchema = z.enum(["professional", "friendly", "inspirational", "analytical", "conversational"]);

const postStatusSchema = z.enum(["draft", "scheduled", "published", "archived"]);

const messageTypeSchema = z.enum([
	"connection_request",
	"follow_up",
	"informational_interview",
	"thank_you",
	"referral_request",
	"congratulations",
	"introduction",
]);

const messageFormalitySchema = z.enum(["formal", "semi_formal", "casual"]);

const postSchema = z.object({
	id: z.string(),
	userId: z.string(),
	postType: postTypeSchema,
	tone: postToneSchema,
	language: z.string(),
	title: z.string().nullable(),
	content: z.string(),
	hashtags: z.array(z.string()).nullable(),
	aiPrompt: z.string().nullable(),
	status: postStatusSchema,
	scheduledAt: z.coerce.date().nullable(),
	publishedAt: z.coerce.date().nullable(),
	engagementLikes: z.number().nullable(),
	engagementComments: z.number().nullable(),
	engagementShares: z.number().nullable(),
	isFavorite: z.boolean().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const messageSchema = z.object({
	id: z.string(),
	userId: z.string(),
	messageType: messageTypeSchema,
	formality: messageFormalitySchema,
	language: z.string(),
	recipientName: z.string().nullable(),
	recipientRole: z.string().nullable(),
	recipientCompany: z.string().nullable(),
	context: z.string().nullable(),
	subject: z.string().nullable(),
	content: z.string(),
	aiPrompt: z.string().nullable(),
	isSent: z.boolean().nullable(),
	sentAt: z.coerce.date().nullable(),
	responseReceived: z.boolean().nullable(),
	responseReceivedAt: z.coerce.date().nullable(),
	isFavorite: z.boolean().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const profileAnalysisSchema = z.object({
	id: z.string(),
	userId: z.string(),
	headline: z.string().nullable(),
	summary: z.string().nullable(),
	experience: z.string().nullable(),
	overallScore: z.number().nullable(),
	headlineScore: z.number().nullable(),
	summaryScore: z.number().nullable(),
	keywordScore: z.number().nullable(),
	readabilityScore: z.number().nullable(),
	suggestions: z
		.object({
			headline: z.array(z.string()),
			summary: z.array(z.string()),
			keywords: z.array(z.string()),
			general: z.array(z.string()),
		})
		.nullable(),
	missingKeywords: z.array(z.string()).nullable(),
	strongPoints: z.array(z.string()).nullable(),
	createdAt: z.coerce.date(),
});

export const linkedinContentRouter = {
	// ==========================================
	// POST MANAGEMENT
	// ==========================================

	createPost: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/content/posts",
			tags: ["LinkedIn Content"],
			summary: "Create a new LinkedIn post",
		})
		.input(
			z.object({
				postType: postTypeSchema,
				tone: postToneSchema,
				language: z.string().default("fr"),
				title: z.string().optional(),
				content: z.string(),
				hashtags: z.array(z.string()).optional(),
				aiPrompt: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await linkedinContentService.createPost({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updatePost: protectedProcedure
		.route({
			method: "PUT",
			path: "/linkedin/content/posts/{id}",
			tags: ["LinkedIn Content"],
			summary: "Update a LinkedIn post",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().optional(),
				content: z.string().optional(),
				hashtags: z.array(z.string()).optional(),
				status: postStatusSchema.optional(),
				scheduledAt: z.coerce.date().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await linkedinContentService.updatePost(id, context.user.id, updates);
		}),

	deletePost: protectedProcedure
		.route({
			method: "DELETE",
			path: "/linkedin/content/posts/{id}",
			tags: ["LinkedIn Content"],
			summary: "Delete a LinkedIn post",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await linkedinContentService.deletePost(input.id, context.user.id);
		}),

	listPosts: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/posts",
			tags: ["LinkedIn Content"],
			summary: "List user's LinkedIn posts",
		})
		.input(
			z
				.object({
					status: postStatusSchema.optional(),
					postType: postTypeSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional(),
		)
		.output(z.array(postSchema))
		.handler(async ({ context, input }) => {
			return linkedinContentService.listPosts(context.user.id, input);
		}),

	getPost: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/posts/{id}",
			tags: ["LinkedIn Content"],
			summary: "Get a specific LinkedIn post",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(postSchema.nullable())
		.handler(async ({ context, input }) => {
			return linkedinContentService.getPost(input.id, context.user.id);
		}),

	getPostTemplates: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/templates",
			tags: ["LinkedIn Content"],
			summary: "Get post templates for different types",
		})
		.output(z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))))
		.handler(async () => {
			return linkedinContentService.getPostTemplates();
		}),

	getHashtagSuggestions: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/hashtags/{industry}",
			tags: ["LinkedIn Content"],
			summary: "Get hashtag suggestions for an industry",
		})
		.input(z.object({ industry: z.string().optional() }))
		.output(z.array(z.string()))
		.handler(async ({ input }) => {
			return linkedinContentService.getHashtagSuggestions(input.industry);
		}),

	// ==========================================
	// MESSAGE MANAGEMENT
	// ==========================================

	createMessage: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/content/messages",
			tags: ["LinkedIn Content"],
			summary: "Create a new networking message",
		})
		.input(
			z.object({
				messageType: messageTypeSchema,
				formality: messageFormalitySchema.default("semi_formal"),
				language: z.string().default("fr"),
				recipientName: z.string().optional(),
				recipientRole: z.string().optional(),
				recipientCompany: z.string().optional(),
				context: z.string().optional(),
				subject: z.string().optional(),
				content: z.string(),
				aiPrompt: z.string().optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await linkedinContentService.createMessage({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	updateMessage: protectedProcedure
		.route({
			method: "PUT",
			path: "/linkedin/content/messages/{id}",
			tags: ["LinkedIn Content"],
			summary: "Update a networking message",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				content: z.string().optional(),
				isSent: z.boolean().optional(),
				sentAt: z.coerce.date().optional(),
				responseReceived: z.boolean().optional(),
				responseReceivedAt: z.coerce.date().optional(),
				isFavorite: z.boolean().optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			const { id, ...updates } = input;
			await linkedinContentService.updateMessage(id, context.user.id, updates);
		}),

	deleteMessage: protectedProcedure
		.route({
			method: "DELETE",
			path: "/linkedin/content/messages/{id}",
			tags: ["LinkedIn Content"],
			summary: "Delete a networking message",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await linkedinContentService.deleteMessage(input.id, context.user.id);
		}),

	listMessages: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/messages",
			tags: ["LinkedIn Content"],
			summary: "List user's networking messages",
		})
		.input(
			z
				.object({
					messageType: messageTypeSchema.optional(),
					isSent: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional(),
		)
		.output(z.array(messageSchema))
		.handler(async ({ context, input }) => {
			return linkedinContentService.listMessages(context.user.id, input);
		}),

	getMessage: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/messages/{id}",
			tags: ["LinkedIn Content"],
			summary: "Get a specific networking message",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(messageSchema.nullable())
		.handler(async ({ context, input }) => {
			return linkedinContentService.getMessage(input.id, context.user.id);
		}),

	getMessageTemplates: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/message-templates",
			tags: ["LinkedIn Content"],
			summary: "Get message templates for different types",
		})
		.output(z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))))
		.handler(async () => {
			return linkedinContentService.getMessageTemplates();
		}),

	// ==========================================
	// PROFILE ANALYSIS
	// ==========================================

	createProfileAnalysis: protectedProcedure
		.route({
			method: "POST",
			path: "/linkedin/content/analysis",
			tags: ["LinkedIn Content"],
			summary: "Create a profile analysis",
		})
		.input(
			z.object({
				headline: z.string().optional(),
				summary: z.string().optional(),
				experience: z.string().optional(),
				overallScore: z.number(),
				headlineScore: z.number().optional(),
				summaryScore: z.number().optional(),
				keywordScore: z.number().optional(),
				readabilityScore: z.number().optional(),
				suggestions: z.object({
					headline: z.array(z.string()),
					summary: z.array(z.string()),
					keywords: z.array(z.string()),
					general: z.array(z.string()),
				}),
				missingKeywords: z.array(z.string()).optional(),
				strongPoints: z.array(z.string()).optional(),
			}),
		)
		.output(z.object({ id: z.string() }))
		.handler(async ({ context, input }) => {
			const id = await linkedinContentService.createProfileAnalysis({
				userId: context.user.id,
				...input,
			});
			return { id };
		}),

	listProfileAnalyses: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/analyses",
			tags: ["LinkedIn Content"],
			summary: "List user's profile analyses",
		})
		.input(z.object({ limit: z.number().optional() }).optional())
		.output(z.array(profileAnalysisSchema))
		.handler(async ({ context, input }) => {
			return linkedinContentService.listProfileAnalyses(context.user.id, input?.limit);
		}),

	getLatestProfileAnalysis: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/analysis/latest",
			tags: ["LinkedIn Content"],
			summary: "Get the latest profile analysis",
		})
		.output(profileAnalysisSchema.nullable())
		.handler(async ({ context }) => {
			return linkedinContentService.getLatestProfileAnalysis(context.user.id);
		}),

	// ==========================================
	// STATISTICS
	// ==========================================

	getStats: protectedProcedure
		.route({
			method: "GET",
			path: "/linkedin/content/stats",
			tags: ["LinkedIn Content"],
			summary: "Get LinkedIn content statistics",
		})
		.output(
			z.object({
				totalPosts: z.number(),
				totalMessages: z.number(),
				sentMessages: z.number(),
				responseRate: z.number(),
				profileAnalyses: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return linkedinContentService.getStats(context.user.id);
		}),
};
