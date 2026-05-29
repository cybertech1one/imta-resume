import z from "zod";
import { protectedProcedure } from "../context";
import { freelanceService } from "../services/freelance";

// Enums
const platformEnum = z.enum(["upwork", "fiverr", "linkedin"]);
const packageTierEnum = z.enum(["basic", "standard", "premium"]);
const skillProficiencyEnum = z.enum(["beginner", "intermediate", "advanced", "expert"]);
const dayOfWeekEnum = z.enum(["lun", "mar", "mer", "jeu", "ven", "sam", "dim"]);

// Availability schema
const availabilitySchema = z.record(dayOfWeekEnum, z.boolean());

// Profile schemas
const profileSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	headline: z.string(),
	bio: z.string(),
	hourlyRate: z.number(),
	projectMinRate: z.number(),
	availability: availabilitySchema,
	availableHoursPerWeek: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Skill schemas
const skillSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	proficiency: skillProficiencyEnum,
	yearsExperience: z.number(),
	endorsements: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Package schemas
const packageSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	tier: packageTierEnum,
	name: z.string(),
	description: z.string(),
	price: z.number(),
	deliveryDays: z.number(),
	revisions: z.number(),
	features: z.array(z.string()),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Portfolio schemas
const portfolioItemSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	title: z.string(),
	description: z.string(),
	imageUrl: z.string().nullable(),
	category: z.string(),
	tags: z.array(z.string()),
	link: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Testimonial schemas
const testimonialSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	clientName: z.string(),
	clientRole: z.string(),
	clientCompany: z.string(),
	clientAvatar: z.string().nullable(),
	content: z.string(),
	rating: z.number(),
	platform: platformEnum,
	date: z.string(),
	projectType: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Proposal template schemas
const proposalTemplateSchema = z.object({
	id: z.string().uuid(),
	userId: z.string(),
	name: z.string(),
	category: z.string(),
	content: z.string(),
	variables: z.array(z.string()),
	usageCount: z.number(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

// Skills router
const skillsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/skills",
			tags: ["Freelance"],
			summary: "List all freelance skills",
		})
		.output(z.array(skillSchema))
		.handler(async ({ context }) => {
			return await freelanceService.skills.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/skills",
			tags: ["Freelance"],
			summary: "Create a freelance skill",
		})
		.input(
			z.object({
				name: z.string().min(1).max(100),
				proficiency: skillProficiencyEnum.optional(),
				yearsExperience: z.number().min(0).max(50).optional(),
				endorsements: z.number().min(0).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.skills.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/skills/{id}",
			tags: ["Freelance"],
			summary: "Update a freelance skill",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(100).optional(),
				proficiency: skillProficiencyEnum.optional(),
				yearsExperience: z.number().min(0).max(50).optional(),
				endorsements: z.number().min(0).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.skills.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/freelance/skills/{id}",
			tags: ["Freelance"],
			summary: "Delete a freelance skill",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.skills.delete({ id: input.id, userId: context.user.id });
		}),
};

// Packages router
const packagesRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/packages",
			tags: ["Freelance"],
			summary: "List all service packages",
		})
		.output(z.array(packageSchema))
		.handler(async ({ context }) => {
			return await freelanceService.packages.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/packages",
			tags: ["Freelance"],
			summary: "Create a service package",
		})
		.input(
			z.object({
				tier: packageTierEnum,
				name: z.string().min(1).max(100),
				description: z.string().max(1000).optional(),
				price: z.number().min(0).optional(),
				deliveryDays: z.number().min(1).max(365).optional(),
				revisions: z.number().min(-1).max(100).optional(),
				features: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.packages.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/packages/{id}",
			tags: ["Freelance"],
			summary: "Update a service package",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				tier: packageTierEnum.optional(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().max(1000).optional(),
				price: z.number().min(0).optional(),
				deliveryDays: z.number().min(1).max(365).optional(),
				revisions: z.number().min(-1).max(100).optional(),
				features: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.packages.update({
				...input,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/freelance/packages/{id}",
			tags: ["Freelance"],
			summary: "Delete a service package",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.packages.delete({ id: input.id, userId: context.user.id });
		}),
};

// Portfolio router
const portfolioRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/portfolio",
			tags: ["Freelance"],
			summary: "List all portfolio items",
		})
		.output(z.array(portfolioItemSchema))
		.handler(async ({ context }) => {
			return await freelanceService.portfolio.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/portfolio",
			tags: ["Freelance"],
			summary: "Create a portfolio item",
		})
		.input(
			z.object({
				title: z.string().min(1).max(200),
				description: z.string().max(2000).optional(),
				imageUrl: z.string().url().optional(),
				category: z.string().max(100).optional(),
				tags: z.array(z.string()).optional(),
				link: z.string().url().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.portfolio.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/portfolio/{id}",
			tags: ["Freelance"],
			summary: "Update a portfolio item",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				title: z.string().min(1).max(200).optional(),
				description: z.string().max(2000).optional(),
				imageUrl: z.string().url().optional().nullable(),
				category: z.string().max(100).optional(),
				tags: z.array(z.string()).optional(),
				link: z.string().url().optional().nullable(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.portfolio.update({
				...input,
				imageUrl: input.imageUrl ?? undefined,
				link: input.link ?? undefined,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/freelance/portfolio/{id}",
			tags: ["Freelance"],
			summary: "Delete a portfolio item",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.portfolio.delete({ id: input.id, userId: context.user.id });
		}),
};

// Testimonials router
const testimonialsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/testimonials",
			tags: ["Freelance"],
			summary: "List all testimonials",
		})
		.output(z.array(testimonialSchema))
		.handler(async ({ context }) => {
			return await freelanceService.testimonials.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/testimonials",
			tags: ["Freelance"],
			summary: "Create a testimonial",
		})
		.input(
			z.object({
				clientName: z.string().min(1).max(100),
				clientRole: z.string().max(100).optional(),
				clientCompany: z.string().max(100).optional(),
				clientAvatar: z.string().url().optional(),
				content: z.string().min(1).max(2000),
				rating: z.number().min(1).max(5).optional(),
				platform: platformEnum.optional(),
				date: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
				projectType: z.string().max(100).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.testimonials.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/testimonials/{id}",
			tags: ["Freelance"],
			summary: "Update a testimonial",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				clientName: z.string().min(1).max(100).optional(),
				clientRole: z.string().max(100).optional(),
				clientCompany: z.string().max(100).optional(),
				clientAvatar: z.string().url().optional().nullable(),
				content: z.string().min(1).max(2000).optional(),
				rating: z.number().min(1).max(5).optional(),
				platform: platformEnum.optional(),
				date: z
					.string()
					.regex(/^\d{4}-\d{2}$/)
					.optional(),
				projectType: z.string().max(100).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.testimonials.update({
				...input,
				clientAvatar: input.clientAvatar ?? undefined,
				userId: context.user.id,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/freelance/testimonials/{id}",
			tags: ["Freelance"],
			summary: "Delete a testimonial",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.testimonials.delete({ id: input.id, userId: context.user.id });
		}),
};

// Proposals router
const proposalsRouter = {
	list: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/proposals",
			tags: ["Freelance"],
			summary: "List all proposal templates",
		})
		.output(z.array(proposalTemplateSchema))
		.handler(async ({ context }) => {
			return await freelanceService.proposals.list(context.user.id);
		}),

	create: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/proposals",
			tags: ["Freelance"],
			summary: "Create a proposal template",
		})
		.input(
			z.object({
				name: z.string().min(1).max(100),
				category: z.string().max(100).optional(),
				content: z.string().min(1).max(10000),
				variables: z.array(z.string()).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.proposals.create({
				...input,
				userId: context.user.id,
			});
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/proposals/{id}",
			tags: ["Freelance"],
			summary: "Update a proposal template",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().min(1).max(100).optional(),
				category: z.string().max(100).optional(),
				content: z.string().min(1).max(10000).optional(),
				variables: z.array(z.string()).optional(),
			}),
		)
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.proposals.update({
				...input,
				userId: context.user.id,
			});
		}),

	incrementUsage: protectedProcedure
		.route({
			method: "POST",
			path: "/freelance/proposals/{id}/usage",
			tags: ["Freelance"],
			summary: "Increment proposal template usage count",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.proposals.incrementUsage({ id: input.id, userId: context.user.id });
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/freelance/proposals/{id}",
			tags: ["Freelance"],
			summary: "Delete a proposal template",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await freelanceService.proposals.delete({ id: input.id, userId: context.user.id });
		}),
};

// Main freelance router
export const freelanceRouter = {
	skills: skillsRouter,
	packages: packagesRouter,
	portfolio: portfolioRouter,
	testimonials: testimonialsRouter,
	proposals: proposalsRouter,

	// Profile endpoints
	getProfile: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/profile",
			tags: ["Freelance"],
			summary: "Get freelance profile",
		})
		.output(profileSchema.nullable())
		.handler(async ({ context }) => {
			return await freelanceService.profile.get(context.user.id);
		}),

	updateProfile: protectedProcedure
		.route({
			method: "PUT",
			path: "/freelance/profile",
			tags: ["Freelance"],
			summary: "Update freelance profile",
		})
		.input(
			z.object({
				headline: z.string().max(220).optional(),
				bio: z.string().max(5000).optional(),
				hourlyRate: z.number().min(0).optional(),
				projectMinRate: z.number().min(0).optional(),
				availability: availabilitySchema.optional(),
				availableHoursPerWeek: z.number().min(0).max(168).optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await freelanceService.profile.upsert({
				...input,
				userId: context.user.id,
			});
		}),

	// Get all data at once
	getAll: protectedProcedure
		.route({
			method: "GET",
			path: "/freelance/all",
			tags: ["Freelance"],
			summary: "Get all freelance data",
		})
		.output(
			z.object({
				profile: profileSchema.nullable(),
				skills: z.array(skillSchema),
				packages: z.array(packageSchema),
				portfolio: z.array(portfolioItemSchema),
				testimonials: z.array(testimonialSchema),
				proposals: z.array(proposalTemplateSchema),
			}),
		)
		.handler(async ({ context }) => {
			return await freelanceService.getAll(context.user.id);
		}),
};
