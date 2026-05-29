import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export const chatbotSessionService = {
	async list(userId: string) {
		return db
			.select()
			.from(schema.chatbotSession)
			.where(eq(schema.chatbotSession.userId, userId))
			.orderBy(desc(schema.chatbotSession.createdAt))
			.limit(50);
	},

	async create(input: {
		userId: string;
		mode: string;
		field: string;
		language: string;
		topic?: string;
		messages: { role: string; content: string; timestamp?: string }[];
		questionCount: number;
		overallScore?: number;
		summary?: unknown;
	}) {
		const [session] = await db
			.insert(schema.chatbotSession)
			.values({
				id: generateId(),
				...input,
				endedAt: new Date(),
			})
			.returning();
		return session;
	},

	async delete(id: string, userId: string) {
		await db
			.delete(schema.chatbotSession)
			.where(and(eq(schema.chatbotSession.id, id), eq(schema.chatbotSession.userId, userId)));
	},
};
