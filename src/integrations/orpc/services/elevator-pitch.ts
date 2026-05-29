import { and, desc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export const elevatorPitchService = {
	async list(userId: string) {
		return db
			.select()
			.from(schema.elevatorPitch)
			.where(eq(schema.elevatorPitch.userId, userId))
			.orderBy(desc(schema.elevatorPitch.createdAt));
	},

	async create(input: {
		userId: string;
		name: string;
		content: string;
		length: string;
		context: string;
		industry: string;
		wordCount?: number;
		estimatedTime?: number;
	}) {
		const [pitch] = await db
			.insert(schema.elevatorPitch)
			.values({
				id: generateId(),
				...input,
			})
			.returning();
		return pitch;
	},

	async update(input: {
		id: string;
		userId: string;
		name?: string;
		content?: string;
		length?: string;
		context?: string;
		industry?: string;
		wordCount?: number;
		estimatedTime?: number;
	}) {
		const { id, userId, ...data } = input;
		const [pitch] = await db
			.update(schema.elevatorPitch)
			.set(data)
			.where(and(eq(schema.elevatorPitch.id, id), eq(schema.elevatorPitch.userId, userId)))
			.returning();
		return pitch;
	},

	async delete(id: string, userId: string) {
		await db
			.delete(schema.elevatorPitch)
			.where(and(eq(schema.elevatorPitch.id, id), eq(schema.elevatorPitch.userId, userId)));
	},
};
