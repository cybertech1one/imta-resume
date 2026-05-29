import { ORPCError } from "@orpc/client";
import { and, desc, eq, getTableColumns, gte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

export type ChecklistStatus = "preparing" | "ready" | "completed";
export type InterviewType = "phone" | "video" | "in-person" | "technical" | "behavioral" | "panel";
export type ChecklistCategory = "research" | "preparation" | "logistics" | "questions" | "follow-up";

export type CreateChecklistInput = {
	userId: string;
	applicationId?: string;
	companyName: string;
	position: string;
	interviewDate?: Date;
	interviewType?: InterviewType;
	interviewerName?: string;
	interviewerRole?: string;
	notes?: string;
};

export type UpdateChecklistInput = {
	id: string;
	userId: string;
	companyName?: string;
	position?: string;
	interviewDate?: Date;
	interviewType?: InterviewType;
	interviewerName?: string;
	interviewerRole?: string;
	notes?: string;
	status?: ChecklistStatus;
};

export type CreateChecklistItemInput = {
	checklistId: string;
	category: ChecklistCategory;
	title: string;
	description?: string;
	order?: number;
};

// Default checklist items by category
const defaultChecklistItems: Record<string, { title: string; description: string }[]> = {
	research: [
		{
			title: "Research the company",
			description: "Learn about the company's history, mission, values, and recent news",
		},
		{ title: "Understand the role", description: "Review the job description and requirements in detail" },
		{ title: "Research the interviewer", description: "Look up the interviewer on LinkedIn if known" },
		{ title: "Study industry trends", description: "Understand current trends and challenges in the industry" },
		{ title: "Review company products/services", description: "Familiarize yourself with what the company offers" },
	],
	preparation: [
		{
			title: "Prepare your STAR stories",
			description: "Have 5-7 stories ready using the Situation-Task-Action-Result format",
		},
		{ title: "Practice common questions", description: "Rehearse answers to common interview questions" },
		{ title: "Prepare questions to ask", description: "Have 3-5 thoughtful questions ready for the interviewer" },
		{ title: "Review your resume", description: "Be ready to discuss every item on your resume" },
		{ title: "Prepare your pitch", description: "Have a concise 2-minute introduction ready" },
		{ title: "Know your salary expectations", description: "Research market rates and know your range" },
	],
	logistics: [
		{ title: "Confirm interview details", description: "Verify date, time, location/link, and interviewer name" },
		{ title: "Plan your route/setup", description: "For in-person: plan travel. For virtual: test your setup" },
		{ title: "Prepare your outfit", description: "Choose appropriate professional attire" },
		{ title: "Gather documents", description: "Print copies of resume, portfolio, and references" },
		{ title: "Charge devices", description: "Ensure phone/laptop is charged" },
		{ title: "Test technology", description: "For virtual: test camera, microphone, and internet connection" },
	],
	questions: [
		{
			title: "Behavioral questions",
			description: "Prepare answers for Tell me about yourself, Why this company?, etc.",
		},
		{ title: "Situational questions", description: "Be ready for hypothetical scenarios" },
		{ title: "Technical questions", description: "Review technical concepts relevant to the role" },
		{ title: "Culture fit questions", description: "Think about how you align with company values" },
		{ title: "Career questions", description: "Be ready to discuss your goals and career path" },
	],
	"follow-up": [
		{ title: "Get contact information", description: "Note down interviewer's email for thank you note" },
		{ title: "Send thank you email", description: "Send within 24 hours of the interview" },
		{ title: "Reflect on the interview", description: "Note what went well and what to improve" },
		{ title: "Follow up if needed", description: "Follow up if you haven't heard back within the stated timeframe" },
	],
};

export const interviewPrepService = {
	// Create a new checklist with default items
	create: async (input: CreateChecklistInput): Promise<string> => {
		const id = generateId();

		return await db.transaction(async (tx) => {
			await tx.insert(schema.interviewChecklist).values({
				id,
				userId: input.userId,
				applicationId: input.applicationId,
				companyName: input.companyName,
				position: input.position,
				interviewDate: input.interviewDate,
				interviewType: input.interviewType,
				interviewerName: input.interviewerName,
				interviewerRole: input.interviewerRole,
				notes: input.notes,
				status: "preparing",
			});

			// Create default checklist items in a batch
			const categories = Object.keys(defaultChecklistItems) as ChecklistCategory[];
			let order = 0;
			const allItems: {
				id: string;
				checklistId: string;
				category: string;
				title: string;
				description: string;
				order: number;
			}[] = [];

			for (const category of categories) {
				const items = defaultChecklistItems[category];
				for (const item of items) {
					allItems.push({
						id: generateId(),
						checklistId: id,
						category,
						title: item.title,
						description: item.description,
						order: order++,
					});
				}
			}

			await tx.insert(schema.checklistItem).values(allItems);

			return id;
		});
	},

	// Get checklist by ID
	getById: async (input: { id: string; userId: string }) => {
		const [checklist] = await db
			.select()
			.from(schema.interviewChecklist)
			.where(and(eq(schema.interviewChecklist.id, input.id), eq(schema.interviewChecklist.userId, input.userId)));

		if (!checklist) {
			throw new ORPCError("NOT_FOUND", { message: "Checklist not found" });
		}

		// Get items
		const items = await db
			.select()
			.from(schema.checklistItem)
			.where(eq(schema.checklistItem.checklistId, checklist.id))
			.orderBy(schema.checklistItem.order);

		// Group items by category
		const itemsByCategory: Record<string, typeof items> = {};
		for (const item of items) {
			if (!itemsByCategory[item.category]) {
				itemsByCategory[item.category] = [];
			}
			itemsByCategory[item.category].push(item);
		}

		// Calculate completion
		const totalItems = items.length;
		const completedItems = items.filter((i) => i.isCompleted).length;
		const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

		return {
			...checklist,
			items,
			itemsByCategory,
			totalItems,
			completedItems,
			completionPercentage,
		};
	},

	// List checklists
	list: async (input: { userId: string; status?: ChecklistStatus; upcoming?: boolean; limit?: number }) => {
		const conditions = [eq(schema.interviewChecklist.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.interviewChecklist.status, input.status));
		}

		if (input.upcoming) {
			conditions.push(gte(schema.interviewChecklist.interviewDate, new Date()));
		}

		// Use a single query with LEFT JOIN and GROUP BY to avoid N+1 queries
		const checklistsWithStats = await db
			.select({
				...getTableColumns(schema.interviewChecklist),
				totalItems: sql<number>`count(${schema.checklistItem.id})::int`,
				completedItems: sql<number>`count(*) FILTER (WHERE ${schema.checklistItem.isCompleted} = true)::int`,
			})
			.from(schema.interviewChecklist)
			.leftJoin(schema.checklistItem, eq(schema.checklistItem.checklistId, schema.interviewChecklist.id))
			.where(and(...conditions))
			.groupBy(schema.interviewChecklist.id)
			.orderBy(schema.interviewChecklist.interviewDate, desc(schema.interviewChecklist.createdAt))
			.limit(input.limit ?? 50);

		return checklistsWithStats.map((checklist) => ({
			...checklist,
			completionPercentage:
				checklist.totalItems > 0 ? Math.round((checklist.completedItems / checklist.totalItems) * 100) : 0,
		}));
	},

	// Update checklist
	update: async (input: UpdateChecklistInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.interviewChecklist.id })
			.from(schema.interviewChecklist)
			.where(and(eq(schema.interviewChecklist.id, input.id), eq(schema.interviewChecklist.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Checklist not found" });
		}

		await db
			.update(schema.interviewChecklist)
			.set({
				companyName: input.companyName,
				position: input.position,
				interviewDate: input.interviewDate,
				interviewType: input.interviewType,
				interviewerName: input.interviewerName,
				interviewerRole: input.interviewerRole,
				notes: input.notes,
				status: input.status,
			})
			.where(and(eq(schema.interviewChecklist.id, input.id), eq(schema.interviewChecklist.userId, input.userId)));
	},

	// Delete checklist
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.interviewChecklist)
			.where(and(eq(schema.interviewChecklist.id, input.id), eq(schema.interviewChecklist.userId, input.userId)));
	},

	// Checklist items methods
	items: {
		// Add item
		add: async (input: CreateChecklistItemInput): Promise<string> => {
			const id = generateId();

			// Get max order for the checklist/category
			const [maxOrder] = await db
				.select({ max: sql<number>`COALESCE(MAX(${schema.checklistItem.order}), -1)` })
				.from(schema.checklistItem)
				.where(eq(schema.checklistItem.checklistId, input.checklistId));

			await db.insert(schema.checklistItem).values({
				id,
				checklistId: input.checklistId,
				category: input.category,
				title: input.title,
				description: input.description,
				order: input.order ?? (maxOrder?.max ?? -1) + 1,
			});

			return id;
		},

		// Toggle item completion
		toggle: async (input: { id: string; checklistId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ isCompleted: schema.checklistItem.isCompleted })
				.from(schema.checklistItem)
				.where(and(eq(schema.checklistItem.id, input.id), eq(schema.checklistItem.checklistId, input.checklistId)));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Item not found" });
			}

			const newCompleted = !existing.isCompleted;

			await db
				.update(schema.checklistItem)
				.set({
					isCompleted: newCompleted,
					completedAt: newCompleted ? new Date() : null,
				})
				.where(and(eq(schema.checklistItem.id, input.id), eq(schema.checklistItem.checklistId, input.checklistId)));

			// Check if checklist should be marked as ready/completed
			await interviewPrepService.items.updateChecklistStatus(input.checklistId);

			return newCompleted;
		},

		// Update item
		update: async (input: {
			id: string;
			checklistId: string;
			title?: string;
			description?: string;
			order?: number;
		}): Promise<void> => {
			await db
				.update(schema.checklistItem)
				.set({
					title: input.title,
					description: input.description,
					order: input.order,
				})
				.where(and(eq(schema.checklistItem.id, input.id), eq(schema.checklistItem.checklistId, input.checklistId)));
		},

		// Delete item
		delete: async (input: { id: string; checklistId: string }): Promise<void> => {
			await db
				.delete(schema.checklistItem)
				.where(and(eq(schema.checklistItem.id, input.id), eq(schema.checklistItem.checklistId, input.checklistId)));
		},

		// Update checklist status based on completion
		updateChecklistStatus: async (checklistId: string): Promise<void> => {
			const items = await db
				.select({
					total: sql<number>`count(*)::int`,
					completed: sql<number>`count(*) FILTER (WHERE ${schema.checklistItem.isCompleted} = true)::int`,
				})
				.from(schema.checklistItem)
				.where(eq(schema.checklistItem.checklistId, checklistId));

			const { total, completed } = items[0] ?? { total: 0, completed: 0 };
			const percentage = total > 0 ? (completed / total) * 100 : 0;

			let status: ChecklistStatus = "preparing";
			if (percentage >= 100) {
				status = "completed";
			} else if (percentage >= 80) {
				status = "ready";
			}

			await db.update(schema.interviewChecklist).set({ status }).where(eq(schema.interviewChecklist.id, checklistId));
		},
	},

	// Get upcoming interviews
	getUpcoming: async (input: { userId: string; days?: number }) => {
		const futureDate = new Date();
		futureDate.setDate(futureDate.getDate() + (input.days ?? 7));

		return await db
			.select()
			.from(schema.interviewChecklist)
			.where(
				and(
					eq(schema.interviewChecklist.userId, input.userId),
					gte(schema.interviewChecklist.interviewDate, new Date()),
				),
			)
			.orderBy(schema.interviewChecklist.interviewDate);
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const checklists = await db
			.select()
			.from(schema.interviewChecklist)
			.where(eq(schema.interviewChecklist.userId, input.userId));

		const total = checklists.length;
		const byStatus: Record<string, number> = {};
		const byType: Record<string, number> = {};

		for (const checklist of checklists) {
			byStatus[checklist.status] = (byStatus[checklist.status] ?? 0) + 1;
			if (checklist.interviewType) {
				byType[checklist.interviewType] = (byType[checklist.interviewType] ?? 0) + 1;
			}
		}

		// Upcoming in next 7 days
		const weekFromNow = new Date();
		weekFromNow.setDate(weekFromNow.getDate() + 7);

		const upcoming = checklists.filter((c) => {
			if (!c.interviewDate) return false;
			const date = new Date(c.interviewDate);
			return date >= new Date() && date <= weekFromNow;
		}).length;

		return {
			total,
			byStatus,
			byType,
			upcoming,
			preparing: byStatus.preparing ?? 0,
			ready: byStatus.ready ?? 0,
			completed: byStatus.completed ?? 0,
		};
	},
};
