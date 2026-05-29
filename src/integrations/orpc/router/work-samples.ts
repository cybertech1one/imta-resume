import z from "zod";
import { protectedProcedure } from "../context";
import { workSamplesService } from "../services/work-samples";

// Enums as zod schemas
const projectTypeSchema = z.enum(["web", "mobile", "design", "backend", "fullstack", "data", "devops"]);
const projectStatusSchema = z.enum(["completed", "in-progress", "archived"]);
const techCategorySchema = z.enum(["frontend", "backend", "database", "cloud", "design", "other"]);
const linkTypeSchema = z.enum(["live", "github", "demo", "documentation", "figma", "video"]);

// Complex types as zod schemas
const technologySchema = z.object({
	name: z.string(),
	category: techCategorySchema,
});

const linkSchema = z.object({
	type: linkTypeSchema,
	url: z.string(),
	label: z.string(),
});

const metricSchema = z.object({
	label: z.string(),
	value: z.string(),
	change: z.string().optional(),
});

const beforeAfterSchema = z.object({
	before: z.string(),
	after: z.string(),
	label: z.string(),
});

const timelinePhaseSchema = z.object({
	phase: z.string(),
	duration: z.string(),
	description: z.string(),
});

// Output schemas
const projectSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	longDescription: z.string(),
	role: z.string(),
	type: projectTypeSchema,
	status: projectStatusSchema,
	technologies: z.array(technologySchema),
	skills: z.array(z.string()),
	images: z.array(z.string()),
	thumbnail: z.string().nullable(),
	links: z.array(linkSchema),
	featured: z.boolean(),
	startDate: z.string().nullable(),
	endDate: z.string().nullable(),
	teamSize: z.number().nullable(),
	client: z.string().nullable(),
	industry: z.string().nullable(),
	metrics: z.array(metricSchema).nullable(),
	beforeAfter: z.array(beforeAfterSchema).nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const caseStudySchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	projectId: z.string(),
	title: z.string(),
	overview: z.string(),
	challenge: z.string(),
	approach: z.string(),
	solution: z.string(),
	results: z.string(),
	learnings: z.string(),
	timeline: z.array(timelinePhaseSchema),
	keyFeatures: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const workSamplesRouter = {
	// ============================================
	// PROJECT ENDPOINTS
	// ============================================

	// Create a new project
	createProject: protectedProcedure
		.route({
			method: "POST",
			path: "/work-samples/projects",
			tags: ["Work Samples"],
			summary: "Create a new portfolio project",
		})
		.input(
			z.object({
				title: z.string().min(1).max(255),
				description: z.string().optional(),
				longDescription: z.string().optional(),
				role: z.string().optional(),
				type: projectTypeSchema.optional(),
				status: projectStatusSchema.optional(),
				technologies: z.array(technologySchema).optional(),
				skills: z.array(z.string()).optional(),
				images: z.array(z.string()).optional(),
				thumbnail: z.string().optional(),
				links: z.array(linkSchema).optional(),
				featured: z.boolean().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				teamSize: z.number().min(1).optional(),
				client: z.string().optional(),
				industry: z.string().optional(),
				metrics: z.array(metricSchema).optional(),
				beforeAfter: z.array(beforeAfterSchema).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await workSamplesService.createProject({
				...input,
				userId: context.user.id,
			});
		}),

	// Get project by ID
	getProjectById: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/projects/{id}",
			tags: ["Work Samples"],
			summary: "Get project by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(projectSchema)
		.handler(async ({ context, input }) => {
			return await workSamplesService.getProjectById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// List projects
	listProjects: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/projects",
			tags: ["Work Samples"],
			summary: "List all portfolio projects",
		})
		.input(
			z
				.object({
					type: projectTypeSchema.optional(),
					status: projectStatusSchema.optional(),
					featured: z.boolean().optional(),
				})
				.optional()
				.default({}),
		)
		.output(z.array(projectSchema))
		.handler(async ({ context, input }) => {
			return await workSamplesService.listProjects({
				userId: context.user.id,
				...input,
			});
		}),

	// Update project
	updateProject: protectedProcedure
		.route({
			method: "PUT",
			path: "/work-samples/projects/{id}",
			tags: ["Work Samples"],
			summary: "Update a project",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				description: z.string().optional(),
				longDescription: z.string().optional(),
				role: z.string().optional(),
				type: projectTypeSchema.optional(),
				status: projectStatusSchema.optional(),
				technologies: z.array(technologySchema).optional(),
				skills: z.array(z.string()).optional(),
				images: z.array(z.string()).optional(),
				thumbnail: z.string().optional(),
				links: z.array(linkSchema).optional(),
				featured: z.boolean().optional(),
				startDate: z.string().optional(),
				endDate: z.string().optional(),
				teamSize: z.number().min(1).optional(),
				client: z.string().optional(),
				industry: z.string().optional(),
				metrics: z.array(metricSchema).optional(),
				beforeAfter: z.array(beforeAfterSchema).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await workSamplesService.updateProject({
				...input,
				userId: context.user.id,
			});
		}),

	// Delete project
	deleteProject: protectedProcedure
		.route({
			method: "DELETE",
			path: "/work-samples/projects/{id}",
			tags: ["Work Samples"],
			summary: "Delete a project",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await workSamplesService.deleteProject({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Toggle featured status
	toggleFeatured: protectedProcedure
		.route({
			method: "POST",
			path: "/work-samples/projects/{id}/featured",
			tags: ["Work Samples"],
			summary: "Toggle project featured status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				featured: z.boolean(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await workSamplesService.toggleFeatured({
				id: input.id,
				userId: context.user.id,
				featured: input.featured,
			});
		}),

	// Get statistics
	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/statistics",
			tags: ["Work Samples"],
			summary: "Get portfolio statistics",
		})
		.output(
			z.object({
				total: z.number(),
				byType: z.record(z.string(), z.number()),
				byStatus: z.record(z.string(), z.number()),
				featured: z.number(),
				skillsCount: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await workSamplesService.getStatistics({ userId: context.user.id });
		}),

	// ============================================
	// CASE STUDY ENDPOINTS
	// ============================================

	// Create case study
	createCaseStudy: protectedProcedure
		.route({
			method: "POST",
			path: "/work-samples/case-studies",
			tags: ["Work Samples"],
			summary: "Create a new case study",
		})
		.input(
			z.object({
				projectId: z.string(),
				title: z.string().min(1).max(255),
				overview: z.string().optional(),
				challenge: z.string().optional(),
				approach: z.string().optional(),
				solution: z.string().optional(),
				results: z.string().optional(),
				learnings: z.string().optional(),
				timeline: z.array(timelinePhaseSchema).optional(),
				keyFeatures: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await workSamplesService.createCaseStudy({
				...input,
				userId: context.user.id,
			});
		}),

	// Get case study by ID
	getCaseStudyById: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/case-studies/{id}",
			tags: ["Work Samples"],
			summary: "Get case study by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(caseStudySchema)
		.handler(async ({ context, input }) => {
			return await workSamplesService.getCaseStudyById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	// Get case study by project ID
	getCaseStudyByProjectId: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/projects/{projectId}/case-study",
			tags: ["Work Samples"],
			summary: "Get case study for a project",
		})
		.input(z.object({ projectId: z.string() }))
		.output(caseStudySchema.nullable())
		.handler(async ({ context, input }) => {
			return await workSamplesService.getCaseStudyByProjectId({
				projectId: input.projectId,
				userId: context.user.id,
			});
		}),

	// List case studies
	listCaseStudies: protectedProcedure
		.route({
			method: "GET",
			path: "/work-samples/case-studies",
			tags: ["Work Samples"],
			summary: "List all case studies",
		})
		.output(z.array(caseStudySchema))
		.handler(async ({ context }) => {
			return await workSamplesService.listCaseStudies({ userId: context.user.id });
		}),

	// Update case study
	updateCaseStudy: protectedProcedure
		.route({
			method: "PUT",
			path: "/work-samples/case-studies/{id}",
			tags: ["Work Samples"],
			summary: "Update a case study",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(255).optional(),
				overview: z.string().optional(),
				challenge: z.string().optional(),
				approach: z.string().optional(),
				solution: z.string().optional(),
				results: z.string().optional(),
				learnings: z.string().optional(),
				timeline: z.array(timelinePhaseSchema).optional(),
				keyFeatures: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await workSamplesService.updateCaseStudy({
				...input,
				userId: context.user.id,
			});
		}),

	// Delete case study
	deleteCaseStudy: protectedProcedure
		.route({
			method: "DELETE",
			path: "/work-samples/case-studies/{id}",
			tags: ["Work Samples"],
			summary: "Delete a case study",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await workSamplesService.deleteCaseStudy({
				id: input.id,
				userId: context.user.id,
			});
		}),
};
