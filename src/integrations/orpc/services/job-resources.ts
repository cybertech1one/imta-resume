import { and, asc, count, eq, ilike, or, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type JobResourceItem = typeof schema.jobResource.$inferSelect;

export interface JobResourceListOptions {
	category?: string;
	location?: string;
	field?: string;
	isFree?: boolean;
	search?: string;
	page?: number;
	pageSize?: number;
}

export const jobResourcesService = {
	list: async (options?: JobResourceListOptions) => {
		const page = options?.page ?? 1;
		const pageSize = options?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		const conditions = [eq(schema.jobResource.isActive, true)];

		if (options?.category) {
			conditions.push(eq(schema.jobResource.category, options.category));
		}
		if (options?.location) {
			conditions.push(eq(schema.jobResource.location, options.location));
		}
		if (options?.field) {
			// Check if the field is in the fields text[] array
			conditions.push(sql`${options.field} = ANY(${schema.jobResource.fields})`);
		}
		if (options?.isFree !== undefined) {
			conditions.push(eq(schema.jobResource.isFree, options.isFree));
		}
		if (options?.search) {
			const term = `%${options.search}%`;
			const searchCondition = or(
				ilike(schema.jobResource.name, term),
				ilike(schema.jobResource.nameFr, term),
				ilike(schema.jobResource.description, term),
				ilike(schema.jobResource.descriptionFr, term),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const whereClause = and(...conditions);

		const [items, totalResult] = await Promise.all([
			db
				.select()
				.from(schema.jobResource)
				.where(whereClause)
				.orderBy(asc(schema.jobResource.sortOrder), asc(schema.jobResource.name))
				.limit(pageSize)
				.offset(offset),
			db.select({ total: count() }).from(schema.jobResource).where(whereClause),
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
			.from(schema.jobResource)
			.where(and(eq(schema.jobResource.id, id), eq(schema.jobResource.isActive, true)));
		return item ?? null;
	},

	getCategories: async () => {
		const result = await db
			.selectDistinct({ category: schema.jobResource.category })
			.from(schema.jobResource)
			.where(eq(schema.jobResource.isActive, true))
			.orderBy(asc(schema.jobResource.category));
		return result.map((r) => r.category);
	},

	getLocations: async () => {
		const result = await db
			.selectDistinct({ location: schema.jobResource.location })
			.from(schema.jobResource)
			.where(and(eq(schema.jobResource.isActive, true), sql`${schema.jobResource.location} IS NOT NULL`))
			.orderBy(asc(schema.jobResource.location));
		return result.map((r) => r.location).filter(Boolean) as string[];
	},

	getFields: async () => {
		// Get distinct fields from the fields array column
		const result = await db.execute(
			sql`SELECT DISTINCT unnest(fields) AS field FROM job_resource WHERE is_active = true ORDER BY field`,
		);
		return (result.rows as { field: string }[]).map((r) => r.field);
	},

	getByCategory: async (category: string) => {
		return db
			.select()
			.from(schema.jobResource)
			.where(and(eq(schema.jobResource.isActive, true), eq(schema.jobResource.category, category)))
			.orderBy(asc(schema.jobResource.sortOrder), asc(schema.jobResource.name));
	},
};
