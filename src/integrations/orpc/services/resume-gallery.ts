import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type ResumeGalleryItem = typeof schema.resumeGallery.$inferSelect;

export interface ResumeGalleryListOptions {
	field?: string;
	subField?: string;
	experienceMin?: number;
	experienceMax?: number;
	language?: string;
	templateName?: string;
	search?: string;
	page?: number;
	pageSize?: number;
}

export const resumeGalleryService = {
	list: async (options?: ResumeGalleryListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions = [eq(schema.resumeGallery.isActive, true)];

		if (options?.field) {
			conditions.push(eq(schema.resumeGallery.field, options.field));
		}
		if (options?.subField) {
			conditions.push(eq(schema.resumeGallery.subField, options.subField));
		}
		if (options?.experienceMin !== undefined) {
			conditions.push(gte(schema.resumeGallery.experienceYears, options.experienceMin));
		}
		if (options?.experienceMax !== undefined) {
			conditions.push(lte(schema.resumeGallery.experienceYears, options.experienceMax));
		}
		if (options?.language) {
			conditions.push(eq(schema.resumeGallery.language, options.language));
		}
		if (options?.templateName) {
			conditions.push(eq(schema.resumeGallery.templateName, options.templateName));
		}
		if (options?.search) {
			const term = `%${options.search}%`;
			const searchCondition = or(
				ilike(schema.resumeGallery.name, term),
				ilike(schema.resumeGallery.nameFr, term),
				ilike(schema.resumeGallery.description, term),
				ilike(schema.resumeGallery.descriptionFr, term),
				ilike(schema.resumeGallery.field, term),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const whereClause = and(...conditions);

		const [items, totalResult] = await Promise.all([
			db
				.select({
					id: schema.resumeGallery.id,
					name: schema.resumeGallery.name,
					nameFr: schema.resumeGallery.nameFr,
					field: schema.resumeGallery.field,
					subField: schema.resumeGallery.subField,
					experienceYears: schema.resumeGallery.experienceYears,
					templateName: schema.resumeGallery.templateName,
					language: schema.resumeGallery.language,
					description: schema.resumeGallery.description,
					descriptionFr: schema.resumeGallery.descriptionFr,
					tags: schema.resumeGallery.tags,
					atsScore: schema.resumeGallery.atsScore,
					isFeatured: schema.resumeGallery.isFeatured,
					viewCount: schema.resumeGallery.viewCount,
					useCount: schema.resumeGallery.useCount,
				})
				.from(schema.resumeGallery)
				.where(whereClause)
				.orderBy(desc(schema.resumeGallery.isFeatured), desc(schema.resumeGallery.viewCount))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.resumeGallery).where(whereClause),
		]);

		const total = Number(totalResult[0]?.total ?? 0);

		return {
			items,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		};
	},

	getById: async (id: string) => {
		const [item] = await db
			.select()
			.from(schema.resumeGallery)
			.where(and(eq(schema.resumeGallery.id, id), eq(schema.resumeGallery.isActive, true)));
		return item ?? null;
	},

	incrementViewCount: async (id: string) => {
		await db
			.update(schema.resumeGallery)
			.set({
				viewCount: sql`${schema.resumeGallery.viewCount} + 1`,
			})
			.where(eq(schema.resumeGallery.id, id));
		return { success: true };
	},

	incrementUseCount: async (id: string) => {
		await db
			.update(schema.resumeGallery)
			.set({
				useCount: sql`${schema.resumeGallery.useCount} + 1`,
			})
			.where(eq(schema.resumeGallery.id, id));
		return { success: true };
	},

	getFeatured: async () => {
		return db
			.select({
				id: schema.resumeGallery.id,
				name: schema.resumeGallery.name,
				nameFr: schema.resumeGallery.nameFr,
				field: schema.resumeGallery.field,
				subField: schema.resumeGallery.subField,
				experienceYears: schema.resumeGallery.experienceYears,
				templateName: schema.resumeGallery.templateName,
				language: schema.resumeGallery.language,
				description: schema.resumeGallery.description,
				descriptionFr: schema.resumeGallery.descriptionFr,
				tags: schema.resumeGallery.tags,
				atsScore: schema.resumeGallery.atsScore,
				isFeatured: schema.resumeGallery.isFeatured,
				viewCount: schema.resumeGallery.viewCount,
				useCount: schema.resumeGallery.useCount,
			})
			.from(schema.resumeGallery)
			.where(and(eq(schema.resumeGallery.isActive, true), eq(schema.resumeGallery.isFeatured, true)))
			.orderBy(desc(schema.resumeGallery.viewCount))
			.limit(12);
	},

	getFields: async () => {
		const result = await db
			.selectDistinct({ field: schema.resumeGallery.field })
			.from(schema.resumeGallery)
			.where(eq(schema.resumeGallery.isActive, true))
			.orderBy(asc(schema.resumeGallery.field));
		return result.map((r) => r.field);
	},

	// Distinct programs (subField), optionally scoped to a field. Powers the
	// program-level filter so e.g. a welding student sees only welding examples.
	getSubFields: async (field?: string) => {
		const conditions = [eq(schema.resumeGallery.isActive, true)];
		if (field) conditions.push(eq(schema.resumeGallery.field, field));
		const result = await db
			.selectDistinct({ subField: schema.resumeGallery.subField })
			.from(schema.resumeGallery)
			.where(and(...conditions))
			.orderBy(asc(schema.resumeGallery.subField));
		return result.map((r) => r.subField).filter((s): s is string => Boolean(s));
	},

	getTemplates: async () => {
		const result = await db
			.selectDistinct({ templateName: schema.resumeGallery.templateName })
			.from(schema.resumeGallery)
			.where(eq(schema.resumeGallery.isActive, true))
			.orderBy(asc(schema.resumeGallery.templateName));
		return result.map((r) => r.templateName);
	},

	getLanguages: async () => {
		const result = await db
			.selectDistinct({ language: schema.resumeGallery.language })
			.from(schema.resumeGallery)
			.where(eq(schema.resumeGallery.isActive, true))
			.orderBy(asc(schema.resumeGallery.language));
		return result.map((r) => r.language);
	},
};
