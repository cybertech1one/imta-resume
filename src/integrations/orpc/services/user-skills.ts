import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { SkillProgressEntry, UserSkillCategory } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateUserSkillInput = {
	userId: string;
	name: string;
	nameFr: string;
	category: UserSkillCategory;
	rating?: number;
	targetRating?: number;
};

export type UpdateUserSkillInput = {
	id: string;
	userId: string;
	name?: string;
	nameFr?: string;
	category?: UserSkillCategory;
	rating?: number;
	targetRating?: number;
};

export type UpdateRatingInput = {
	id: string;
	userId: string;
	rating: number;
};

export type UpdateTargetInput = {
	id: string;
	userId: string;
	targetRating: number;
};

export const userSkillsService = {
	// Create a new skill
	create: async (input: CreateUserSkillInput): Promise<string> => {
		const id = generateId();
		const now = new Date().toISOString();
		const initialProgress: SkillProgressEntry[] = [{ date: now, rating: input.rating ?? 1 }];

		await db.insert(schema.userSkill).values({
			id,
			userId: input.userId,
			name: input.name,
			nameFr: input.nameFr,
			category: input.category,
			rating: input.rating ?? 1,
			targetRating: input.targetRating ?? 5,
			progress: initialProgress,
		});

		return id;
	},

	// Get skill by ID
	getById: async (input: { id: string; userId: string }) => {
		const [skill] = await db
			.select()
			.from(schema.userSkill)
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));

		if (!skill) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		return skill;
	},

	// List all skills for a user
	list: async (input: { userId: string; category?: UserSkillCategory }) => {
		const conditions = [eq(schema.userSkill.userId, input.userId)];

		if (input.category) {
			conditions.push(eq(schema.userSkill.category, input.category));
		}

		const skills = await db
			.select()
			.from(schema.userSkill)
			.where(and(...conditions))
			.orderBy(desc(schema.userSkill.updatedAt));

		return skills;
	},

	// Update skill
	update: async (input: UpdateUserSkillInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.userSkill.id })
			.from(schema.userSkill)
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		await db
			.update(schema.userSkill)
			.set({
				name: input.name,
				nameFr: input.nameFr,
				category: input.category,
				rating: input.rating,
				targetRating: input.targetRating,
			})
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));
	},

	// Update rating and add progress entry
	updateRating: async (input: UpdateRatingInput): Promise<void> => {
		const [existing] = await db
			.select()
			.from(schema.userSkill)
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		const now = new Date().toISOString();
		const newProgress: SkillProgressEntry[] = [...(existing.progress || []), { date: now, rating: input.rating }];

		await db
			.update(schema.userSkill)
			.set({
				rating: input.rating,
				progress: newProgress,
			})
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));
	},

	// Update target rating
	updateTarget: async (input: UpdateTargetInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.userSkill.id })
			.from(schema.userSkill)
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
		}

		await db
			.update(schema.userSkill)
			.set({ targetRating: input.targetRating })
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));
	},

	// Delete skill
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.userSkill)
			.where(and(eq(schema.userSkill.id, input.id), eq(schema.userSkill.userId, input.userId)));
	},

	// Get or create user skills data (for career path)
	getSkillsData: async (input: { userId: string }) => {
		let [data] = await db.select().from(schema.userSkillsData).where(eq(schema.userSkillsData.userId, input.userId));

		if (!data) {
			const id = generateId();
			await db.insert(schema.userSkillsData).values({
				id,
				userId: input.userId,
				selectedCareerPath: null,
			});
			[data] = await db.select().from(schema.userSkillsData).where(eq(schema.userSkillsData.userId, input.userId));
		}

		return data;
	},

	// Update selected career path
	updateCareerPath: async (input: { userId: string; careerPathId: string | null }): Promise<void> => {
		await db.transaction(async (tx) => {
			const [existing] = await tx
				.select({ id: schema.userSkillsData.id })
				.from(schema.userSkillsData)
				.where(eq(schema.userSkillsData.userId, input.userId));

			if (existing) {
				await tx
					.update(schema.userSkillsData)
					.set({ selectedCareerPath: input.careerPathId })
					.where(eq(schema.userSkillsData.userId, input.userId));
			} else {
				await tx.insert(schema.userSkillsData).values({
					id: generateId(),
					userId: input.userId,
					selectedCareerPath: input.careerPathId,
				});
			}
		});
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const skills = await db.select().from(schema.userSkill).where(eq(schema.userSkill.userId, input.userId));

		const total = skills.length;
		const byCategory: Record<string, number> = {};
		let goalsReached = 0;
		let totalRating = 0;
		let totalTargetRating = 0;

		for (const skill of skills) {
			byCategory[skill.category] = (byCategory[skill.category] ?? 0) + 1;
			totalRating += skill.rating;
			totalTargetRating += skill.targetRating;
			if (skill.rating >= skill.targetRating) {
				goalsReached++;
			}
		}

		const overallProgress = total > 0 ? Math.round((totalRating / totalTargetRating) * 100) : 0;

		const categoryProgress: Record<string, number> = {};
		for (const category of Object.keys(byCategory)) {
			const categorySkills = skills.filter((s) => s.category === category);
			const categoryTotal = categorySkills.reduce((sum, s) => sum + s.rating, 0);
			categoryProgress[category] = Math.round((categoryTotal / (categorySkills.length * 5)) * 100);
		}

		return {
			total,
			byCategory,
			goalsReached,
			inProgress: total - goalsReached,
			overallProgress,
			categoryProgress,
		};
	},
};
