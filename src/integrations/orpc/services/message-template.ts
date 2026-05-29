import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type CreateMessageTemplateInput = {
	userId: string;
	name: string;
	category: string;
	subject?: string;
	body: string;
	tags?: string[];
	isFavorite?: boolean;
	isCustom?: boolean;
	personalizationFields?: { key: string; label: string; placeholder: string; example: string }[];
};

export type UpdateMessageTemplateInput = {
	id: string;
	userId: string;
	name?: string;
	category?: string;
	subject?: string | null;
	body?: string;
	tags?: string[];
	isFavorite?: boolean;
	isCustom?: boolean;
	personalizationFields?: { key: string; label: string; placeholder: string; example: string }[];
};

export const messageTemplateService = {
	list: async (userId: string) => {
		return await db
			.select()
			.from(schema.messageTemplate)
			.where(eq(schema.messageTemplate.userId, userId))
			.orderBy(desc(schema.messageTemplate.createdAt));
	},

	create: async (input: CreateMessageTemplateInput) => {
		const id = generateId();

		await db.insert(schema.messageTemplate).values({
			id,
			userId: input.userId,
			name: input.name,
			category: input.category,
			subject: input.subject,
			body: input.body,
			tags: input.tags ?? [],
			isFavorite: input.isFavorite ?? false,
			isCustom: input.isCustom ?? true,
			personalizationFields: input.personalizationFields ?? [],
		});

		const [created] = await db.select().from(schema.messageTemplate).where(eq(schema.messageTemplate.id, id));

		return created;
	},

	update: async (input: UpdateMessageTemplateInput) => {
		const [existing] = await db
			.select({ id: schema.messageTemplate.id })
			.from(schema.messageTemplate)
			.where(and(eq(schema.messageTemplate.id, input.id), eq(schema.messageTemplate.userId, input.userId)));

		if (!existing) {
			return null;
		}

		const updateData: Record<string, unknown> = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.category !== undefined) updateData.category = input.category;
		if (input.subject !== undefined) updateData.subject = input.subject;
		if (input.body !== undefined) updateData.body = input.body;
		if (input.tags !== undefined) updateData.tags = input.tags;
		if (input.isFavorite !== undefined) updateData.isFavorite = input.isFavorite;
		if (input.isCustom !== undefined) updateData.isCustom = input.isCustom;
		if (input.personalizationFields !== undefined) updateData.personalizationFields = input.personalizationFields;

		await db
			.update(schema.messageTemplate)
			.set(updateData)
			.where(and(eq(schema.messageTemplate.id, input.id), eq(schema.messageTemplate.userId, input.userId)));

		const [updated] = await db.select().from(schema.messageTemplate).where(eq(schema.messageTemplate.id, input.id));

		return updated;
	},

	delete: async (id: string, userId: string) => {
		await db
			.delete(schema.messageTemplate)
			.where(and(eq(schema.messageTemplate.id, id), eq(schema.messageTemplate.userId, userId)));
	},

	toggleFavorite: async (id: string, userId: string) => {
		const [existing] = await db
			.select()
			.from(schema.messageTemplate)
			.where(and(eq(schema.messageTemplate.id, id), eq(schema.messageTemplate.userId, userId)));

		if (!existing) {
			return null;
		}

		await db
			.update(schema.messageTemplate)
			.set({ isFavorite: !existing.isFavorite })
			.where(and(eq(schema.messageTemplate.id, id), eq(schema.messageTemplate.userId, userId)));

		const [updated] = await db.select().from(schema.messageTemplate).where(eq(schema.messageTemplate.id, id));

		return updated;
	},
};
