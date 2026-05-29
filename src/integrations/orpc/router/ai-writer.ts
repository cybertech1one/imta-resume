import z from "zod";
import type { AiWriterContentType, AiWriterIndustry, AiWriterTone } from "@/integrations/drizzle/schema";
import { protectedProcedure } from "../context";
import { aiWriterService } from "../services/ai-writer";

const contentTypeSchema = z.enum([
	"bullet_point",
	"summary",
	"achievement",
	"cover_letter",
	"linkedin_summary",
	"skill_extraction",
]);

const toneSchema = z.enum(["professional", "confident", "friendly", "executive", "creative"]);

const industrySchema = z.enum([
	"technology",
	"healthcare",
	"finance",
	"marketing",
	"engineering",
	"education",
	"general",
]);

const bulletPointSchema = z.object({
	id: z.string().uuid(),
	original: z.string(),
	enhanced: z.string(),
	metrics: z.string().optional(),
});

const skillExtractionSchema = z.object({
	hardSkills: z.array(z.string()),
	softSkills: z.array(z.string()),
	certifications: z.array(z.string()),
	tools: z.array(z.string()),
});

const grammarIssueSchema = z.object({
	text: z.string(),
	suggestion: z.string(),
	type: z.enum(["grammar", "clarity", "style", "spelling"]),
	position: z.number(),
});

const aiWriterContentSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	type: contentTypeSchema.nullable(),
	name: z.string(),
	originalInput: z.string().nullable(),
	generatedContent: z.string().nullable(),
	tone: toneSchema.nullable(),
	industry: industrySchema.nullable(),
	experienceYears: z.number().nullable(),
	bulletPoints: z.array(bulletPointSchema).nullable(),
	skillExtraction: skillExtractionSchema.nullable(),
	grammarIssues: z.array(grammarIssueSchema).nullable(),
	jobTitle: z.string().nullable(),
	companyName: z.string().nullable(),
	linkedinKeywords: z.array(z.string()).nullable(),
	isFavorite: z.boolean(),
	tags: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	// AI History extension columns
	resumeId: z.string().nullable(),
	contentSource: z.string().nullable(),
	inputData: z.record(z.string(), z.unknown()).nullable(),
	outputData: z.record(z.string(), z.unknown()).nullable(),
	appliedAt: z.coerce.date().nullable(),
	expiresAt: z.coerce.date().nullable(),
});

export const aiWriterRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer",
			tags: ["AI Writer"],
			summary: "Create a new AI writer content",
		})
		.input(
			z.object({
				type: contentTypeSchema,
				name: z.string().min(1).max(255),
				originalInput: z.string().optional(),
				generatedContent: z.string().optional(),
				tone: toneSchema.optional(),
				industry: industrySchema.optional(),
				experienceYears: z.number().optional(),
				bulletPoints: z.array(bulletPointSchema).optional(),
				skillExtraction: skillExtractionSchema.optional(),
				grammarIssues: z.array(grammarIssueSchema).optional(),
				jobTitle: z.string().optional(),
				companyName: z.string().optional(),
				linkedinKeywords: z.array(z.string()).optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await aiWriterService.create({
				...input,
				userId: context.user.id,
				type: input.type as AiWriterContentType,
				tone: input.tone as AiWriterTone | undefined,
				industry: input.industry as AiWriterIndustry | undefined,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-writer/{id}",
			tags: ["AI Writer"],
			summary: "Get AI writer content by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(aiWriterContentSchema)
		.handler(async ({ context, input }) => {
			return await aiWriterService.getById({ id: input.id, userId: context.user.id });
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-writer",
			tags: ["AI Writer"],
			summary: "List AI writer contents",
		})
		.input(
			z
				.object({
					type: contentTypeSchema.optional(),
					search: z.string().optional(),
					isFavorite: z.boolean().optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(aiWriterContentSchema))
		.handler(async ({ context, input }) => {
			return await aiWriterService.list({
				userId: context.user.id,
				...input,
				type: input.type as AiWriterContentType | undefined,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/ai-writer/{id}",
			tags: ["AI Writer"],
			summary: "Update AI writer content",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(255).optional(),
				originalInput: z.string().optional(),
				generatedContent: z.string().optional(),
				tone: toneSchema.optional(),
				industry: industrySchema.optional(),
				experienceYears: z.number().optional(),
				bulletPoints: z.array(bulletPointSchema).optional(),
				skillExtraction: skillExtractionSchema.optional(),
				grammarIssues: z.array(grammarIssueSchema).optional(),
				jobTitle: z.string().optional(),
				companyName: z.string().optional(),
				linkedinKeywords: z.array(z.string()).optional(),
				isFavorite: z.boolean().optional(),
				tags: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await aiWriterService.update({
				...input,
				userId: context.user.id,
				tone: input.tone as AiWriterTone | undefined,
				industry: input.industry as AiWriterIndustry | undefined,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/ai-writer/{id}",
			tags: ["AI Writer"],
			summary: "Delete AI writer content",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await aiWriterService.delete({ id: input.id, userId: context.user.id });
		}),

	toggleFavorite: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/{id}/favorite",
			tags: ["AI Writer"],
			summary: "Toggle favorite status",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.boolean())
		.handler(async ({ context, input }) => {
			return await aiWriterService.toggleFavorite({ id: input.id, userId: context.user.id });
		}),

	generateBulletPoints: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/bullet-points",
			tags: ["AI Writer"],
			summary: "Generate bullet points from description",
		})
		.input(
			z.object({
				description: z.string().min(1),
				tone: toneSchema,
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				bulletPoints: z.array(bulletPointSchema),
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.generateBulletPoints({
				userId: context.user.id,
				role: context.user.role,
				description: input.description,
				tone: input.tone as AiWriterTone,
				save: input.save,
			});
		}),

	generateSummary: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/summary",
			tags: ["AI Writer"],
			summary: "Generate professional summary",
		})
		.input(
			z.object({
				expertise: z.string().min(1),
				tone: toneSchema,
				experienceYears: z.number().min(0).max(50),
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				summary: z.string(),
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.generateSummary({
				userId: context.user.id,
				role: context.user.role,
				expertise: input.expertise,
				tone: input.tone as AiWriterTone,
				experienceYears: input.experienceYears,
				save: input.save,
			});
		}),

	quantifyAchievement: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/achievement",
			tags: ["AI Writer"],
			summary: "Quantify an achievement",
		})
		.input(
			z.object({
				achievement: z.string().min(1),
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				quantified: z.string(),
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.quantifyAchievement({
				userId: context.user.id,
				role: context.user.role,
				achievement: input.achievement,
				save: input.save,
			});
		}),

	extractSkills: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/skills",
			tags: ["AI Writer"],
			summary: "Extract skills from job posting",
		})
		.input(
			z.object({
				jobPosting: z.string().min(1),
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				skills: skillExtractionSchema,
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.extractSkills({
				userId: context.user.id,
				role: context.user.role,
				jobPosting: input.jobPosting,
				save: input.save,
			});
		}),

	generateCoverLetter: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/cover-letter",
			tags: ["AI Writer"],
			summary: "Generate a cover letter",
		})
		.input(
			z.object({
				jobTitle: z.string().min(1),
				companyName: z.string().min(1),
				skills: z.array(z.string()),
				tone: toneSchema,
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				coverLetter: z.string(),
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.generateCoverLetter({
				userId: context.user.id,
				role: context.user.role,
				jobTitle: input.jobTitle,
				companyName: input.companyName,
				skills: input.skills,
				tone: input.tone as AiWriterTone,
				save: input.save,
			});
		}),

	optimizeLinkedIn: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/generate/linkedin",
			tags: ["AI Writer"],
			summary: "Optimize LinkedIn summary",
		})
		.input(
			z.object({
				summary: z.string().min(1),
				save: z.boolean().optional().default(false),
			}),
		)
		.output(
			z.object({
				optimized: z.string(),
				keywords: z.array(z.string()),
				id: z.string().optional(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await aiWriterService.optimizeLinkedIn({
				userId: context.user.id,
				role: context.user.role,
				summary: input.summary,
				save: input.save,
			});
		}),

	checkGrammar: protectedProcedure
		.route({
			method: "POST",
			path: "/ai-writer/check-grammar",
			tags: ["AI Writer"],
			summary: "Check grammar and style",
		})
		.input(
			z.object({
				text: z.string().min(1),
			}),
		)
		.output(z.array(grammarIssueSchema))
		.handler(async ({ context, input }) => {
			return await aiWriterService.checkGrammar({ userId: context.user.id, role: context.user.role, text: input.text });
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/ai-writer/statistics",
			tags: ["AI Writer"],
			summary: "Get AI writer statistics",
		})
		.input(z.object({}).optional().default({}))
		.output(
			z.object({
				total: z.number(),
				byType: z.record(z.string(), z.number()),
				byTone: z.record(z.string(), z.number()),
				favorites: z.number(),
				recentCount: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await aiWriterService.getStatistics({ userId: context.user.id });
		}),
};
