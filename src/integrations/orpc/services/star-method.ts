import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export const starMethodService = {
	async list(userId: string) {
		return db
			.select()
			.from(schema.starMethodHistory)
			.where(eq(schema.starMethodHistory.userId, userId))
			.orderBy(desc(schema.starMethodHistory.completedAt));
	},

	async create(input: {
		userId: string;
		scenarioId: string;
		questionFr: string;
		category: string;
		situation: string;
		task: string;
		action: string;
		result: string;
		overallScore?: number;
		evaluation?: unknown;
	}) {
		const [entry] = await db
			.insert(schema.starMethodHistory)
			.values({
				id: generateId(),
				...input,
			})
			.returning();
		return entry;
	},

	async delete(id: string, userId: string) {
		await db
			.delete(schema.starMethodHistory)
			.where(and(eq(schema.starMethodHistory.id, id), eq(schema.starMethodHistory.userId, userId)));
	},
};
