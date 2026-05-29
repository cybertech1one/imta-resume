import { ORPCError } from "@orpc/client";
import { and, desc, eq } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Types
export type TemplateStyle = "formal" | "warm" | "enthusiastic";
export type InterviewType = "phone" | "video" | "inperson" | "panel" | "technical";
export type SendMethod = "email" | "physical" | "linkedin";
export type SuggestionCategory = "opening" | "body" | "closing" | "personalization";

export type CreateThankYouLetterInput = {
	userId: string;
	recipientName: string;
	recipientCompany: string;
	recipientPosition?: string;
	recipientEmail?: string;
	interviewDate: string;
	interviewType: InterviewType;
	discussionPoints: string[];
	jobPosition: string;
	template: TemplateStyle;
	content: string;
};

export type UpdateThankYouLetterInput = {
	id: string;
	userId: string;
	recipientName?: string;
	recipientCompany?: string;
	recipientPosition?: string;
	recipientEmail?: string;
	interviewDate?: string;
	interviewType?: InterviewType;
	discussionPoints?: string[];
	jobPosition?: string;
	template?: TemplateStyle;
	content?: string;
};

export type CreateSendTrackingInput = {
	userId: string;
	letterId: string;
	sentDate: string;
	method: SendMethod;
	notes?: string;
};

export type CreateAISuggestionInput = {
	userId: string;
	letterId: string;
	category: SuggestionCategory;
	text: string;
};

export const thankYouLetterService = {
	// Create a new thank you letter
	create: async (input: CreateThankYouLetterInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.thankYouLetter).values({
			id,
			userId: input.userId,
			recipientName: input.recipientName,
			recipientCompany: input.recipientCompany,
			recipientPosition: input.recipientPosition,
			recipientEmail: input.recipientEmail,
			interviewDate: input.interviewDate,
			interviewType: input.interviewType,
			discussionPoints: input.discussionPoints,
			jobPosition: input.jobPosition,
			template: input.template,
			content: input.content,
		});

		return id;
	},

	// Get thank you letter by ID
	getById: async (input: { id: string; userId: string }) => {
		const [letter] = await db
			.select()
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.id), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		return letter;
	},

	// List all thank you letters for a user
	list: async (input: { userId: string; limit?: number; offset?: number }) => {
		return await db
			.select()
			.from(schema.thankYouLetter)
			.where(eq(schema.thankYouLetter.userId, input.userId))
			.orderBy(desc(schema.thankYouLetter.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);
	},

	// Update a thank you letter
	update: async (input: UpdateThankYouLetterInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.id), eq(schema.thankYouLetter.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		await db
			.update(schema.thankYouLetter)
			.set({
				recipientName: input.recipientName,
				recipientCompany: input.recipientCompany,
				recipientPosition: input.recipientPosition,
				recipientEmail: input.recipientEmail,
				interviewDate: input.interviewDate,
				interviewType: input.interviewType,
				discussionPoints: input.discussionPoints,
				jobPosition: input.jobPosition,
				template: input.template,
				content: input.content,
			})
			.where(and(eq(schema.thankYouLetter.id, input.id), eq(schema.thankYouLetter.userId, input.userId)));
	},

	// Delete a thank you letter
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.id), eq(schema.thankYouLetter.userId, input.userId)));
	},

	// Get send tracking history for a letter
	getSendTracking: async (input: { letterId: string; userId: string }) => {
		// First verify the letter belongs to the user
		const [letter] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.letterId), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		return await db
			.select()
			.from(schema.thankYouLetterSendTracking)
			.where(eq(schema.thankYouLetterSendTracking.letterId, input.letterId))
			.orderBy(desc(schema.thankYouLetterSendTracking.sentDate));
	},

	// List all send tracking for a user (across all letters)
	listAllSendTracking: async (input: { userId: string; limit?: number }) => {
		return await db
			.select({
				tracking: schema.thankYouLetterSendTracking,
				letter: {
					id: schema.thankYouLetter.id,
					recipientName: schema.thankYouLetter.recipientName,
					recipientCompany: schema.thankYouLetter.recipientCompany,
					jobPosition: schema.thankYouLetter.jobPosition,
				},
			})
			.from(schema.thankYouLetterSendTracking)
			.innerJoin(schema.thankYouLetter, eq(schema.thankYouLetterSendTracking.letterId, schema.thankYouLetter.id))
			.where(eq(schema.thankYouLetter.userId, input.userId))
			.orderBy(desc(schema.thankYouLetterSendTracking.sentDate))
			.limit(input.limit ?? 50);
	},

	// Create send tracking entry
	createSendTracking: async (input: CreateSendTrackingInput): Promise<string> => {
		// First verify the letter belongs to the user
		const [letter] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.letterId), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		const id = generateId();

		// Calculate follow-up date (7 days after send date)
		const followUpDate = new Date(input.sentDate);
		followUpDate.setDate(followUpDate.getDate() + 7);

		await db.insert(schema.thankYouLetterSendTracking).values({
			id,
			letterId: input.letterId,
			sentDate: input.sentDate,
			method: input.method,
			notes: input.notes,
			followUpDate: followUpDate.toISOString().split("T")[0],
		});

		return id;
	},

	// Delete send tracking entry
	deleteSendTracking: async (input: { id: string; userId: string }): Promise<void> => {
		// Join with letter to verify ownership
		const [tracking] = await db
			.select({ id: schema.thankYouLetterSendTracking.id })
			.from(schema.thankYouLetterSendTracking)
			.innerJoin(schema.thankYouLetter, eq(schema.thankYouLetterSendTracking.letterId, schema.thankYouLetter.id))
			.where(and(eq(schema.thankYouLetterSendTracking.id, input.id), eq(schema.thankYouLetter.userId, input.userId)));

		if (!tracking) {
			throw new ORPCError("NOT_FOUND", { message: "Send tracking entry not found" });
		}

		await db.delete(schema.thankYouLetterSendTracking).where(eq(schema.thankYouLetterSendTracking.id, input.id));
	},

	// Get AI suggestions for a letter
	getAISuggestions: async (input: { letterId: string; userId: string }) => {
		// First verify the letter belongs to the user
		const [letter] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.letterId), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		return await db
			.select()
			.from(schema.thankYouLetterSuggestion)
			.where(eq(schema.thankYouLetterSuggestion.letterId, input.letterId))
			.orderBy(schema.thankYouLetterSuggestion.createdAt);
	},

	// Create AI suggestion
	createAISuggestion: async (input: CreateAISuggestionInput): Promise<string> => {
		// First verify the letter belongs to the user
		const [letter] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.letterId), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		const id = generateId();

		await db.insert(schema.thankYouLetterSuggestion).values({
			id,
			letterId: input.letterId,
			category: input.category,
			text: input.text,
			applied: false,
		});

		return id;
	},

	// Toggle AI suggestion applied status
	toggleSuggestionApplied: async (input: { suggestionId: string; userId: string }): Promise<void> => {
		// Join with letter to verify ownership
		const [suggestion] = await db
			.select({
				id: schema.thankYouLetterSuggestion.id,
				applied: schema.thankYouLetterSuggestion.applied,
			})
			.from(schema.thankYouLetterSuggestion)
			.innerJoin(schema.thankYouLetter, eq(schema.thankYouLetterSuggestion.letterId, schema.thankYouLetter.id))
			.where(
				and(eq(schema.thankYouLetterSuggestion.id, input.suggestionId), eq(schema.thankYouLetter.userId, input.userId)),
			);

		if (!suggestion) {
			throw new ORPCError("NOT_FOUND", { message: "Suggestion not found" });
		}

		await db
			.update(schema.thankYouLetterSuggestion)
			.set({ applied: !suggestion.applied })
			.where(eq(schema.thankYouLetterSuggestion.id, input.suggestionId));
	},

	// Delete all suggestions for a letter (when regenerating)
	deleteSuggestions: async (input: { letterId: string; userId: string }): Promise<void> => {
		// First verify the letter belongs to the user
		const [letter] = await db
			.select({ id: schema.thankYouLetter.id })
			.from(schema.thankYouLetter)
			.where(and(eq(schema.thankYouLetter.id, input.letterId), eq(schema.thankYouLetter.userId, input.userId)));

		if (!letter) {
			throw new ORPCError("NOT_FOUND", { message: "Thank you letter not found" });
		}

		await db
			.delete(schema.thankYouLetterSuggestion)
			.where(eq(schema.thankYouLetterSuggestion.letterId, input.letterId));
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const letters = await db.select().from(schema.thankYouLetter).where(eq(schema.thankYouLetter.userId, input.userId));

		const trackingEntries = await db
			.select()
			.from(schema.thankYouLetterSendTracking)
			.innerJoin(schema.thankYouLetter, eq(schema.thankYouLetterSendTracking.letterId, schema.thankYouLetter.id))
			.where(eq(schema.thankYouLetter.userId, input.userId));

		// Count by template
		const templateCounts: Record<string, number> = {};
		for (const letter of letters) {
			templateCounts[letter.template] = (templateCounts[letter.template] ?? 0) + 1;
		}

		// Count by send method
		const methodCounts: Record<string, number> = {};
		for (const entry of trackingEntries) {
			methodCounts[entry.thank_you_letter_send_tracking.method] =
				(methodCounts[entry.thank_you_letter_send_tracking.method] ?? 0) + 1;
		}

		// Get pending follow-ups (follow-up date has passed and not marked as followed up)
		const today = new Date().toISOString().split("T")[0];
		const pendingFollowUps = trackingEntries.filter(
			(entry) =>
				entry.thank_you_letter_send_tracking.followUpDate && entry.thank_you_letter_send_tracking.followUpDate <= today,
		).length;

		return {
			totalLetters: letters.length,
			totalSent: trackingEntries.length,
			templateDistribution: templateCounts,
			methodDistribution: methodCounts,
			pendingFollowUps,
		};
	},
};
