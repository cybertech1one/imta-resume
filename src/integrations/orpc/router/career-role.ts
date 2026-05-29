import z from "zod";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";
import { careerRoleService } from "../services/career-role";

// Role schema
const roleSchema = z.object({
	id: z.string(),
	role: z.string(),
	roleFr: z.string().nullable(),
	field: z.string(),
	experienceLevel: z.string().nullable(),
	description: z.string().nullable(),
	descriptionFr: z.string().nullable(),
	salaryMin: z.number().nullable(),
	salaryMax: z.number().nullable(),
	demandLevel: z.string().nullable(),
	isActive: z.boolean(),
	sortOrder: z.number().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Skill schema
const skillSchema = z.object({
	id: z.string(),
	roleId: z.string(),
	skillName: z.string(),
	skillNameFr: z.string().nullable(),
	category: z.string().nullable(),
	requiredLevel: z.number().nullable(),
	importance: z.string().nullable(),
	industryBenchmark: z.string().nullable(),
	isRequired: z.boolean().nullable(),
	sortOrder: z.number().nullable(),
	createdAt: z.coerce.date(),
});

// Role with skills schema
const roleWithSkillsSchema = roleSchema.extend({
	skills: z.array(skillSchema),
});

// List all roles
const list = publicProcedure
	.input(
		z.object({
			field: z.string().optional(),
			demandLevel: z.enum(["low", "medium", "high"]).optional(),
			activeOnly: z.boolean().optional().default(true),
			search: z.string().optional(),
		}),
	)
	.output(z.array(roleSchema))
	.handler(async ({ input }) => {
		return careerRoleService.listRoles(input);
	});

// Get role by ID
const getById = publicProcedure
	.input(z.object({ id: z.string().uuid() }))
	.output(roleSchema)
	.handler(async ({ input }) => {
		return careerRoleService.getById(input.id);
	});

// Get role with skills
const getRoleWithSkills = publicProcedure
	.input(z.object({ roleId: z.string() }))
	.output(roleWithSkillsSchema)
	.handler(async ({ input }) => {
		return careerRoleService.getRoleWithSkills(input.roleId);
	});

// Get skills for a role
const getSkillsForRole = publicProcedure
	.input(z.object({ roleId: z.string() }))
	.output(z.array(skillSchema))
	.handler(async ({ input }) => {
		return careerRoleService.getSkillsForRole(input.roleId);
	});

// Calculate skill gap
const calculateGap = protectedProcedure
	.input(
		z.object({
			userSkills: z.array(
				z.object({
					name: z.string(),
					nameFr: z.string(),
					currentLevel: z.number(),
				}),
			),
			roleId: z.string(),
		}),
	)
	.output(
		z.object({
			roleId: z.string(),
			readinessScore: z.number(),
			totalGaps: z.number(),
			criticalGaps: z.number(),
			skillGaps: z.array(
				z.object({
					skillName: z.string(),
					skillNameFr: z.string().nullable(),
					category: z.string().nullable(),
					requiredLevel: z.number().nullable(),
					currentLevel: z.number(),
					gapSize: z.number(),
					importance: z.string().nullable(),
					industryBenchmark: z.string().nullable(),
				}),
			),
		}),
	)
	.handler(async ({ input }) => {
		return careerRoleService.calculateGap(input);
	});

// List roles with skill count
const listWithSkillCount = publicProcedure
	.input(
		z.object({
			field: z.string().optional(),
			activeOnly: z.boolean().optional().default(true),
		}),
	)
	.output(z.array(roleSchema.extend({ skillCount: z.number() })))
	.handler(async ({ input }) => {
		return careerRoleService.listRolesWithSkillCount(input);
	});

// Admin: Create role
const create = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			role: z.string(),
			roleFr: z.string().optional(),
			field: z.string(),
			experienceLevel: z.enum(["entry", "mid", "senior"]).optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			salaryMin: z.number().optional(),
			salaryMax: z.number().optional(),
			demandLevel: z.enum(["low", "medium", "high"]).optional(),
			isActive: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(roleSchema)
	.handler(async ({ input }) => {
		return careerRoleService.create(input);
	});

// Admin: Update role
const update = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			role: z.string().optional(),
			roleFr: z.string().optional(),
			field: z.string().optional(),
			experienceLevel: z.enum(["entry", "mid", "senior"]).optional(),
			description: z.string().optional(),
			descriptionFr: z.string().optional(),
			salaryMin: z.number().optional(),
			salaryMax: z.number().optional(),
			demandLevel: z.enum(["low", "medium", "high"]).optional(),
			isActive: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(roleSchema)
	.handler(async ({ input }) => {
		return careerRoleService.update(input);
	});

// Admin: Delete role
const deleteRole = adminProcedure
	.input(z.object({ id: z.string().uuid() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		await careerRoleService.delete(input.id);
		return { success: true };
	});

// Admin: Create skill
const createSkill = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			roleId: z.string(),
			skillName: z.string(),
			skillNameFr: z.string().optional(),
			category: z.enum(["technical", "soft", "languages", "certifications", "tools"]).optional(),
			requiredLevel: z.number().min(1).max(5).optional(),
			importance: z.enum(["critical", "important", "nice-to-have"]).optional(),
			industryBenchmark: z.number().optional(),
			isRequired: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(skillSchema)
	.handler(async ({ input }) => {
		return careerRoleService.createSkill(input);
	});

// Admin: Update skill
const updateSkill = adminProcedure
	.input(
		z.object({
			id: z.string().uuid(),
			skillName: z.string().optional(),
			skillNameFr: z.string().optional(),
			category: z.enum(["technical", "soft", "languages", "certifications", "tools"]).optional(),
			requiredLevel: z.number().min(1).max(5).optional(),
			importance: z.enum(["critical", "important", "nice-to-have"]).optional(),
			industryBenchmark: z.number().optional(),
			isRequired: z.boolean().optional(),
			sortOrder: z.number().optional(),
		}),
	)
	.output(skillSchema)
	.handler(async ({ input }) => {
		return careerRoleService.updateSkill(input);
	});

// Admin: Delete skill
const deleteSkill = adminProcedure
	.input(z.object({ id: z.string().uuid() }))
	.output(z.object({ success: z.boolean() }))
	.handler(async ({ input }) => {
		await careerRoleService.deleteSkill(input.id);
		return { success: true };
	});

// Admin: Seed roles and skills
const seed = adminProcedure
	.input(z.object({}))
	.output(
		z.object({
			rolesSeeded: z.number(),
			rolesSkipped: z.number(),
			skillsSeeded: z.number(),
		}),
	)
	.handler(async () => {
		return careerRoleService.seed();
	});

export const careerRoleRouter = {
	list,
	getById,
	getRoleWithSkills,
	getSkillsForRole,
	calculateGap,
	listWithSkillCount,
	create,
	update,
	delete: deleteRole,
	createSkill,
	updateSkill,
	deleteSkill,
	seed,
};
