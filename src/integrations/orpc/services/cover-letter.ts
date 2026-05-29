import { ORPCError } from "@orpc/client";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type TemplateType = "formal" | "creative" | "tech-focused" | "executive";
export type ToneType = "professional" | "friendly" | "confident" | "enthusiastic";

export type CreateCoverLetterInput = {
	userId: string;
	name: string;
	companyName?: string;
	position?: string;
	template?: TemplateType;
	tone?: ToneType;
	content: string;
	tags?: string[];
	applicationId?: string;
	resumeId?: string;
};

export type UpdateCoverLetterInput = {
	id: string;
	userId: string;
	name?: string;
	companyName?: string;
	position?: string;
	template?: TemplateType;
	tone?: ToneType;
	content?: string;
	tags?: string[];
	applicationId?: string | null;
	resumeId?: string | null;
};

export const coverLetterService = {
	// Create a new cover letter
	create: async (input: CreateCoverLetterInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.coverLetter).values({
			id,
			userId: input.userId,
			name: input.name,
			companyName: input.companyName,
			position: input.position,
			template: input.template ?? "formal",
			tone: input.tone ?? "professional",
			content: input.content,
			tags: input.tags ?? [],
			applicationId: input.applicationId,
			resumeId: input.resumeId,
		});

		return id;
	},

	// Get cover letter by ID
	getById: async (input: { id: string; userId: string }) => {
		const [coverLetter] = await db
			.select()
			.from(schema.coverLetter)
			.where(and(eq(schema.coverLetter.id, input.id), eq(schema.coverLetter.userId, input.userId)));

		if (!coverLetter) {
			throw new ORPCError("NOT_FOUND", { message: "Cover letter not found" });
		}

		return coverLetter;
	},

	// List cover letters
	list: async (input: {
		userId: string;
		template?: TemplateType;
		tone?: ToneType;
		search?: string;
		limit?: number;
		offset?: number;
	}) => {
		const conditions = [eq(schema.coverLetter.userId, input.userId)];

		if (input.template) {
			conditions.push(eq(schema.coverLetter.template, input.template));
		}

		if (input.tone) {
			conditions.push(eq(schema.coverLetter.tone, input.tone));
		}

		if (input.search) {
			const searchCondition = or(
				ilike(schema.coverLetter.name, `%${input.search}%`),
				ilike(schema.coverLetter.companyName, `%${input.search}%`),
				ilike(schema.coverLetter.position, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const coverLetters = await db
			.select()
			.from(schema.coverLetter)
			.where(and(...conditions))
			.orderBy(desc(schema.coverLetter.updatedAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return coverLetters;
	},

	// Update cover letter
	update: async (input: UpdateCoverLetterInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.coverLetter.id })
			.from(schema.coverLetter)
			.where(and(eq(schema.coverLetter.id, input.id), eq(schema.coverLetter.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Cover letter not found" });
		}

		await db
			.update(schema.coverLetter)
			.set({
				name: input.name,
				companyName: input.companyName,
				position: input.position,
				template: input.template,
				tone: input.tone,
				content: input.content,
				tags: input.tags,
				applicationId: input.applicationId,
				resumeId: input.resumeId,
			})
			.where(and(eq(schema.coverLetter.id, input.id), eq(schema.coverLetter.userId, input.userId)));
	},

	// Delete cover letter
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.coverLetter)
			.where(and(eq(schema.coverLetter.id, input.id), eq(schema.coverLetter.userId, input.userId)));
	},

	// Duplicate a cover letter
	duplicate: async (input: { id: string; userId: string; name?: string }): Promise<string> => {
		const [original] = await db
			.select()
			.from(schema.coverLetter)
			.where(and(eq(schema.coverLetter.id, input.id), eq(schema.coverLetter.userId, input.userId)));

		if (!original) {
			throw new ORPCError("NOT_FOUND", { message: "Cover letter not found" });
		}

		const newId = generateId();
		await db.insert(schema.coverLetter).values({
			id: newId,
			userId: input.userId,
			name: input.name ?? `${original.name} (Copy)`,
			companyName: original.companyName,
			position: original.position,
			template: original.template,
			tone: original.tone,
			content: original.content,
			tags: original.tags,
		});

		return newId;
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const coverLetters = await db.select().from(schema.coverLetter).where(eq(schema.coverLetter.userId, input.userId));

		const total = coverLetters.length;
		const byTemplate: Record<string, number> = {};
		const byTone: Record<string, number> = {};
		const recentCompanies: string[] = [];

		for (const letter of coverLetters) {
			if (letter.template) {
				byTemplate[letter.template] = (byTemplate[letter.template] ?? 0) + 1;
			}
			if (letter.tone) {
				byTone[letter.tone] = (byTone[letter.tone] ?? 0) + 1;
			}
			if (letter.companyName && !recentCompanies.includes(letter.companyName)) {
				recentCompanies.push(letter.companyName);
			}
		}

		return {
			total,
			byTemplate,
			byTone,
			recentCompanies: recentCompanies.slice(0, 10),
		};
	},
};
