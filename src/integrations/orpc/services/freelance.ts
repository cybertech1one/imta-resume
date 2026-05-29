import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	FreelanceAvailability,
	FreelancePackageTier,
	FreelancePlatform,
	FreelanceSkillProficiency,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Profile types
export type CreateProfileInput = {
	userId: string;
	headline?: string;
	bio?: string;
	hourlyRate?: number;
	projectMinRate?: number;
	availability?: FreelanceAvailability;
	availableHoursPerWeek?: number;
};

export type UpdateProfileInput = {
	userId: string;
	headline?: string;
	bio?: string;
	hourlyRate?: number;
	projectMinRate?: number;
	availability?: FreelanceAvailability;
	availableHoursPerWeek?: number;
};

// Skill types
export type CreateSkillInput = {
	userId: string;
	name: string;
	proficiency?: FreelanceSkillProficiency;
	yearsExperience?: number;
	endorsements?: number;
};

export type UpdateSkillInput = {
	id: string;
	userId: string;
	name?: string;
	proficiency?: FreelanceSkillProficiency;
	yearsExperience?: number;
	endorsements?: number;
};

// Package types
export type CreatePackageInput = {
	userId: string;
	tier: FreelancePackageTier;
	name: string;
	description?: string;
	price?: number;
	deliveryDays?: number;
	revisions?: number;
	features?: string[];
};

export type UpdatePackageInput = {
	id: string;
	userId: string;
	tier?: FreelancePackageTier;
	name?: string;
	description?: string;
	price?: number;
	deliveryDays?: number;
	revisions?: number;
	features?: string[];
};

// Portfolio types
export type CreatePortfolioItemInput = {
	userId: string;
	title: string;
	description?: string;
	imageUrl?: string;
	category?: string;
	tags?: string[];
	link?: string;
};

export type UpdatePortfolioItemInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	imageUrl?: string;
	category?: string;
	tags?: string[];
	link?: string;
};

// Testimonial types
export type CreateTestimonialInput = {
	userId: string;
	clientName: string;
	clientRole?: string;
	clientCompany?: string;
	clientAvatar?: string;
	content: string;
	rating?: number;
	platform?: FreelancePlatform;
	date: string;
	projectType?: string;
};

export type UpdateTestimonialInput = {
	id: string;
	userId: string;
	clientName?: string;
	clientRole?: string;
	clientCompany?: string;
	clientAvatar?: string;
	content?: string;
	rating?: number;
	platform?: FreelancePlatform;
	date?: string;
	projectType?: string;
};

// Proposal template types
export type CreateProposalTemplateInput = {
	userId: string;
	name: string;
	category?: string;
	content: string;
	variables?: string[];
};

export type UpdateProposalTemplateInput = {
	id: string;
	userId: string;
	name?: string;
	category?: string;
	content?: string;
	variables?: string[];
};

export const freelanceService = {
	// Profile methods
	profile: {
		get: async (userId: string) => {
			const [profile] = await db
				.select()
				.from(schema.freelanceProfile)
				.where(eq(schema.freelanceProfile.userId, userId));

			return profile ?? null;
		},

		upsert: async (input: CreateProfileInput | UpdateProfileInput) => {
			const existing = await freelanceService.profile.get(input.userId);

			if (existing) {
				await db
					.update(schema.freelanceProfile)
					.set({
						headline: input.headline ?? existing.headline,
						bio: input.bio ?? existing.bio,
						hourlyRate: input.hourlyRate ?? existing.hourlyRate,
						projectMinRate: input.projectMinRate ?? existing.projectMinRate,
						availability: input.availability ?? existing.availability,
						availableHoursPerWeek: input.availableHoursPerWeek ?? existing.availableHoursPerWeek,
					})
					.where(eq(schema.freelanceProfile.userId, input.userId));

				return existing.id;
			}

			const id = generateId();
			await db.insert(schema.freelanceProfile).values({
				id,
				userId: input.userId,
				headline: input.headline ?? "",
				bio: input.bio ?? "",
				hourlyRate: input.hourlyRate ?? 0,
				projectMinRate: input.projectMinRate ?? 0,
				availability: input.availability,
				availableHoursPerWeek: input.availableHoursPerWeek ?? 35,
			});

			return id;
		},
	},

	// Skills methods
	skills: {
		list: async (userId: string) => {
			return await db
				.select()
				.from(schema.freelanceSkill)
				.where(eq(schema.freelanceSkill.userId, userId))
				.orderBy(desc(schema.freelanceSkill.endorsements));
		},

		create: async (input: CreateSkillInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.freelanceSkill).values({
				id,
				userId: input.userId,
				name: input.name,
				proficiency: input.proficiency ?? "intermediate",
				yearsExperience: input.yearsExperience ?? 0,
				endorsements: input.endorsements ?? 0,
			});

			return id;
		},

		update: async (input: UpdateSkillInput): Promise<void> => {
			const [existing] = await db
				.select()
				.from(schema.freelanceSkill)
				.where(and(eq(schema.freelanceSkill.id, input.id), eq(schema.freelanceSkill.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Skill not found" });
			}

			await db
				.update(schema.freelanceSkill)
				.set({
					name: input.name ?? existing.name,
					proficiency: input.proficiency ?? existing.proficiency,
					yearsExperience: input.yearsExperience ?? existing.yearsExperience,
					endorsements: input.endorsements ?? existing.endorsements,
				})
				.where(and(eq(schema.freelanceSkill.id, input.id), eq(schema.freelanceSkill.userId, input.userId)));
		},

		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.freelanceSkill)
				.where(and(eq(schema.freelanceSkill.id, input.id), eq(schema.freelanceSkill.userId, input.userId)));
		},
	},

	// Packages methods
	packages: {
		list: async (userId: string) => {
			return await db
				.select()
				.from(schema.freelanceServicePackage)
				.where(eq(schema.freelanceServicePackage.userId, userId))
				.orderBy(schema.freelanceServicePackage.price);
		},

		create: async (input: CreatePackageInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.freelanceServicePackage).values({
				id,
				userId: input.userId,
				tier: input.tier,
				name: input.name,
				description: input.description ?? "",
				price: input.price ?? 0,
				deliveryDays: input.deliveryDays ?? 7,
				revisions: input.revisions ?? 2,
				features: input.features ?? [],
			});

			return id;
		},

		update: async (input: UpdatePackageInput): Promise<void> => {
			const [existing] = await db
				.select()
				.from(schema.freelanceServicePackage)
				.where(
					and(eq(schema.freelanceServicePackage.id, input.id), eq(schema.freelanceServicePackage.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Package not found" });
			}

			await db
				.update(schema.freelanceServicePackage)
				.set({
					tier: input.tier ?? existing.tier,
					name: input.name ?? existing.name,
					description: input.description ?? existing.description,
					price: input.price ?? existing.price,
					deliveryDays: input.deliveryDays ?? existing.deliveryDays,
					revisions: input.revisions ?? existing.revisions,
					features: input.features ?? existing.features,
				})
				.where(
					and(eq(schema.freelanceServicePackage.id, input.id), eq(schema.freelanceServicePackage.userId, input.userId)),
				);
		},

		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.freelanceServicePackage)
				.where(
					and(eq(schema.freelanceServicePackage.id, input.id), eq(schema.freelanceServicePackage.userId, input.userId)),
				);
		},
	},

	// Portfolio methods
	portfolio: {
		list: async (userId: string) => {
			return await db
				.select()
				.from(schema.freelancePortfolioItem)
				.where(eq(schema.freelancePortfolioItem.userId, userId))
				.orderBy(desc(schema.freelancePortfolioItem.createdAt));
		},

		create: async (input: CreatePortfolioItemInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.freelancePortfolioItem).values({
				id,
				userId: input.userId,
				title: input.title,
				description: input.description ?? "",
				imageUrl: input.imageUrl,
				category: input.category ?? "",
				tags: input.tags ?? [],
				link: input.link,
			});

			return id;
		},

		update: async (input: UpdatePortfolioItemInput): Promise<void> => {
			const [existing] = await db
				.select()
				.from(schema.freelancePortfolioItem)
				.where(
					and(eq(schema.freelancePortfolioItem.id, input.id), eq(schema.freelancePortfolioItem.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Portfolio item not found" });
			}

			await db
				.update(schema.freelancePortfolioItem)
				.set({
					title: input.title ?? existing.title,
					description: input.description ?? existing.description,
					imageUrl: input.imageUrl ?? existing.imageUrl,
					category: input.category ?? existing.category,
					tags: input.tags ?? existing.tags,
					link: input.link ?? existing.link,
				})
				.where(
					and(eq(schema.freelancePortfolioItem.id, input.id), eq(schema.freelancePortfolioItem.userId, input.userId)),
				);
		},

		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.freelancePortfolioItem)
				.where(
					and(eq(schema.freelancePortfolioItem.id, input.id), eq(schema.freelancePortfolioItem.userId, input.userId)),
				);
		},
	},

	// Testimonials methods
	testimonials: {
		list: async (userId: string) => {
			return await db
				.select()
				.from(schema.freelanceTestimonial)
				.where(eq(schema.freelanceTestimonial.userId, userId))
				.orderBy(desc(schema.freelanceTestimonial.rating));
		},

		create: async (input: CreateTestimonialInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.freelanceTestimonial).values({
				id,
				userId: input.userId,
				clientName: input.clientName,
				clientRole: input.clientRole ?? "",
				clientCompany: input.clientCompany ?? "",
				clientAvatar: input.clientAvatar,
				content: input.content,
				rating: input.rating ?? 5,
				platform: input.platform ?? "upwork",
				date: input.date,
				projectType: input.projectType ?? "",
			});

			return id;
		},

		update: async (input: UpdateTestimonialInput): Promise<void> => {
			const [existing] = await db
				.select()
				.from(schema.freelanceTestimonial)
				.where(and(eq(schema.freelanceTestimonial.id, input.id), eq(schema.freelanceTestimonial.userId, input.userId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Testimonial not found" });
			}

			await db
				.update(schema.freelanceTestimonial)
				.set({
					clientName: input.clientName ?? existing.clientName,
					clientRole: input.clientRole ?? existing.clientRole,
					clientCompany: input.clientCompany ?? existing.clientCompany,
					clientAvatar: input.clientAvatar ?? existing.clientAvatar,
					content: input.content ?? existing.content,
					rating: input.rating ?? existing.rating,
					platform: input.platform ?? existing.platform,
					date: input.date ?? existing.date,
					projectType: input.projectType ?? existing.projectType,
				})
				.where(and(eq(schema.freelanceTestimonial.id, input.id), eq(schema.freelanceTestimonial.userId, input.userId)));
		},

		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.freelanceTestimonial)
				.where(and(eq(schema.freelanceTestimonial.id, input.id), eq(schema.freelanceTestimonial.userId, input.userId)));
		},
	},

	// Proposal templates methods
	proposals: {
		list: async (userId: string) => {
			return await db
				.select()
				.from(schema.freelanceProposalTemplate)
				.where(eq(schema.freelanceProposalTemplate.userId, userId))
				.orderBy(desc(schema.freelanceProposalTemplate.usageCount));
		},

		create: async (input: CreateProposalTemplateInput): Promise<string> => {
			const id = generateId();

			await db.insert(schema.freelanceProposalTemplate).values({
				id,
				userId: input.userId,
				name: input.name,
				category: input.category ?? "",
				content: input.content,
				variables: input.variables ?? [],
			});

			return id;
		},

		update: async (input: UpdateProposalTemplateInput): Promise<void> => {
			const [existing] = await db
				.select()
				.from(schema.freelanceProposalTemplate)
				.where(
					and(
						eq(schema.freelanceProposalTemplate.id, input.id),
						eq(schema.freelanceProposalTemplate.userId, input.userId),
					),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Proposal template not found" });
			}

			await db
				.update(schema.freelanceProposalTemplate)
				.set({
					name: input.name ?? existing.name,
					category: input.category ?? existing.category,
					content: input.content ?? existing.content,
					variables: input.variables ?? existing.variables,
				})
				.where(
					and(
						eq(schema.freelanceProposalTemplate.id, input.id),
						eq(schema.freelanceProposalTemplate.userId, input.userId),
					),
				);
		},

		incrementUsage: async (input: { id: string; userId: string }): Promise<void> => {
			const [existing] = await db
				.select({ usageCount: schema.freelanceProposalTemplate.usageCount })
				.from(schema.freelanceProposalTemplate)
				.where(
					and(
						eq(schema.freelanceProposalTemplate.id, input.id),
						eq(schema.freelanceProposalTemplate.userId, input.userId),
					),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Proposal template not found" });
			}

			await db
				.update(schema.freelanceProposalTemplate)
				.set({ usageCount: existing.usageCount + 1 })
				.where(
					and(
						eq(schema.freelanceProposalTemplate.id, input.id),
						eq(schema.freelanceProposalTemplate.userId, input.userId),
					),
				);
		},

		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.freelanceProposalTemplate)
				.where(
					and(
						eq(schema.freelanceProposalTemplate.id, input.id),
						eq(schema.freelanceProposalTemplate.userId, input.userId),
					),
				);
		},
	},

	// Get all freelance data for a user
	getAll: async (userId: string) => {
		const [profile, skills, packages, portfolio, testimonials, proposals] = await Promise.all([
			freelanceService.profile.get(userId),
			freelanceService.skills.list(userId),
			freelanceService.packages.list(userId),
			freelanceService.portfolio.list(userId),
			freelanceService.testimonials.list(userId),
			freelanceService.proposals.list(userId),
		]);

		return {
			profile,
			skills,
			packages,
			portfolio,
			testimonials,
			proposals,
		};
	},
};
