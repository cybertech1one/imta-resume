import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	CaseStudyTimelinePhase,
	WorkSampleBeforeAfter,
	WorkSampleLink,
	WorkSampleMetric,
	WorkSampleProjectStatus,
	WorkSampleProjectType,
	WorkSampleTechnology,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Project input types
export type CreateProjectInput = {
	userId: string;
	title: string;
	description?: string;
	longDescription?: string;
	role?: string;
	type?: WorkSampleProjectType;
	status?: WorkSampleProjectStatus;
	technologies?: WorkSampleTechnology[];
	skills?: string[];
	images?: string[];
	thumbnail?: string;
	links?: WorkSampleLink[];
	featured?: boolean;
	startDate?: string;
	endDate?: string;
	teamSize?: number;
	client?: string;
	industry?: string;
	metrics?: WorkSampleMetric[];
	beforeAfter?: WorkSampleBeforeAfter[];
};

export type UpdateProjectInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	longDescription?: string;
	role?: string;
	type?: WorkSampleProjectType;
	status?: WorkSampleProjectStatus;
	technologies?: WorkSampleTechnology[];
	skills?: string[];
	images?: string[];
	thumbnail?: string;
	links?: WorkSampleLink[];
	featured?: boolean;
	startDate?: string;
	endDate?: string;
	teamSize?: number;
	client?: string;
	industry?: string;
	metrics?: WorkSampleMetric[];
	beforeAfter?: WorkSampleBeforeAfter[];
};

// Case study input types
export type CreateCaseStudyInput = {
	userId: string;
	projectId: string;
	title: string;
	overview?: string;
	challenge?: string;
	approach?: string;
	solution?: string;
	results?: string;
	learnings?: string;
	timeline?: CaseStudyTimelinePhase[];
	keyFeatures?: string[];
};

export type UpdateCaseStudyInput = {
	id: string;
	userId: string;
	title?: string;
	overview?: string;
	challenge?: string;
	approach?: string;
	solution?: string;
	results?: string;
	learnings?: string;
	timeline?: CaseStudyTimelinePhase[];
	keyFeatures?: string[];
};

export const workSamplesService = {
	// ============================================
	// PROJECT METHODS
	// ============================================

	// Create a new project
	createProject: async (input: CreateProjectInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.workSampleProject).values({
			id,
			userId: input.userId,
			title: input.title,
			description: input.description ?? "",
			longDescription: input.longDescription ?? "",
			role: input.role ?? "",
			type: input.type ?? "web",
			status: input.status ?? "completed",
			technologies: input.technologies ?? [],
			skills: input.skills ?? [],
			images: input.images ?? [],
			thumbnail: input.thumbnail,
			links: input.links ?? [],
			featured: input.featured ?? false,
			startDate: input.startDate,
			endDate: input.endDate,
			teamSize: input.teamSize,
			client: input.client,
			industry: input.industry,
			metrics: input.metrics,
			beforeAfter: input.beforeAfter,
		});

		return id;
	},

	// Get project by ID
	getProjectById: async (input: { id: string; userId: string }) => {
		const [project] = await db
			.select()
			.from(schema.workSampleProject)
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));

		if (!project) {
			throw new ORPCError("NOT_FOUND", { message: "Project not found" });
		}

		return project;
	},

	// List all projects for a user
	listProjects: async (input: {
		userId: string;
		type?: WorkSampleProjectType;
		status?: WorkSampleProjectStatus;
		featured?: boolean;
	}) => {
		const conditions = [eq(schema.workSampleProject.userId, input.userId)];

		if (input.type) {
			conditions.push(eq(schema.workSampleProject.type, input.type));
		}

		if (input.status) {
			conditions.push(eq(schema.workSampleProject.status, input.status));
		}

		if (input.featured !== undefined) {
			conditions.push(eq(schema.workSampleProject.featured, input.featured));
		}

		const projects = await db
			.select()
			.from(schema.workSampleProject)
			.where(and(...conditions))
			.orderBy(desc(schema.workSampleProject.updatedAt));

		return projects;
	},

	// Update project
	updateProject: async (input: UpdateProjectInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.workSampleProject.id })
			.from(schema.workSampleProject)
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Project not found" });
		}

		await db
			.update(schema.workSampleProject)
			.set({
				title: input.title,
				description: input.description,
				longDescription: input.longDescription,
				role: input.role,
				type: input.type,
				status: input.status,
				technologies: input.technologies,
				skills: input.skills,
				images: input.images,
				thumbnail: input.thumbnail,
				links: input.links,
				featured: input.featured,
				startDate: input.startDate,
				endDate: input.endDate,
				teamSize: input.teamSize,
				client: input.client,
				industry: input.industry,
				metrics: input.metrics,
				beforeAfter: input.beforeAfter,
			})
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));
	},

	// Delete project
	deleteProject: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.workSampleProject)
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));
	},

	// Toggle featured status
	toggleFeatured: async (input: { id: string; userId: string; featured: boolean }): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.workSampleProject.id })
			.from(schema.workSampleProject)
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Project not found" });
		}

		await db
			.update(schema.workSampleProject)
			.set({ featured: input.featured })
			.where(and(eq(schema.workSampleProject.id, input.id), eq(schema.workSampleProject.userId, input.userId)));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const projects = await db
			.select()
			.from(schema.workSampleProject)
			.where(eq(schema.workSampleProject.userId, input.userId));

		const total = projects.length;
		const byType: Record<string, number> = {};
		const byStatus: Record<string, number> = {};
		let featured = 0;
		const allSkills = new Set<string>();

		for (const project of projects) {
			byType[project.type] = (byType[project.type] ?? 0) + 1;
			byStatus[project.status] = (byStatus[project.status] ?? 0) + 1;
			if (project.featured) featured++;
			for (const skill of project.skills) {
				allSkills.add(skill);
			}
		}

		return {
			total,
			byType,
			byStatus,
			featured,
			skillsCount: allSkills.size,
		};
	},

	// ============================================
	// CASE STUDY METHODS
	// ============================================

	// Create a case study
	createCaseStudy: async (input: CreateCaseStudyInput): Promise<string> => {
		// Verify project exists and belongs to user
		const [project] = await db
			.select({ id: schema.workSampleProject.id })
			.from(schema.workSampleProject)
			.where(and(eq(schema.workSampleProject.id, input.projectId), eq(schema.workSampleProject.userId, input.userId)));

		if (!project) {
			throw new ORPCError("NOT_FOUND", { message: "Project not found" });
		}

		const id = generateId();

		await db.insert(schema.workSampleCaseStudy).values({
			id,
			userId: input.userId,
			projectId: input.projectId,
			title: input.title,
			overview: input.overview ?? "",
			challenge: input.challenge ?? "",
			approach: input.approach ?? "",
			solution: input.solution ?? "",
			results: input.results ?? "",
			learnings: input.learnings ?? "",
			timeline: input.timeline ?? [],
			keyFeatures: input.keyFeatures ?? [],
		});

		return id;
	},

	// Get case study by ID
	getCaseStudyById: async (input: { id: string; userId: string }) => {
		const [caseStudy] = await db
			.select()
			.from(schema.workSampleCaseStudy)
			.where(and(eq(schema.workSampleCaseStudy.id, input.id), eq(schema.workSampleCaseStudy.userId, input.userId)));

		if (!caseStudy) {
			throw new ORPCError("NOT_FOUND", { message: "Case study not found" });
		}

		return caseStudy;
	},

	// Get case study by project ID
	getCaseStudyByProjectId: async (input: { projectId: string; userId: string }) => {
		const [caseStudy] = await db
			.select()
			.from(schema.workSampleCaseStudy)
			.where(
				and(
					eq(schema.workSampleCaseStudy.projectId, input.projectId),
					eq(schema.workSampleCaseStudy.userId, input.userId),
				),
			);

		return caseStudy ?? null;
	},

	// List all case studies for a user
	listCaseStudies: async (input: { userId: string }) => {
		const caseStudies = await db
			.select()
			.from(schema.workSampleCaseStudy)
			.where(eq(schema.workSampleCaseStudy.userId, input.userId))
			.orderBy(desc(schema.workSampleCaseStudy.createdAt));

		return caseStudies;
	},

	// Update case study
	updateCaseStudy: async (input: UpdateCaseStudyInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.workSampleCaseStudy.id })
			.from(schema.workSampleCaseStudy)
			.where(and(eq(schema.workSampleCaseStudy.id, input.id), eq(schema.workSampleCaseStudy.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Case study not found" });
		}

		await db
			.update(schema.workSampleCaseStudy)
			.set({
				title: input.title,
				overview: input.overview,
				challenge: input.challenge,
				approach: input.approach,
				solution: input.solution,
				results: input.results,
				learnings: input.learnings,
				timeline: input.timeline,
				keyFeatures: input.keyFeatures,
			})
			.where(and(eq(schema.workSampleCaseStudy.id, input.id), eq(schema.workSampleCaseStudy.userId, input.userId)));
	},

	// Delete case study
	deleteCaseStudy: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.workSampleCaseStudy)
			.where(and(eq(schema.workSampleCaseStudy.id, input.id), eq(schema.workSampleCaseStudy.userId, input.userId)));
	},
};
