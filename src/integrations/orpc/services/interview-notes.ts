import { ORPCError } from "@orpc/client";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	FollowUpPriority,
	InterviewNoteFollowUpAction,
	InterviewNoteImpression,
	InterviewNoteInterviewerInfo,
	InterviewNoteKeyPoint,
	InterviewNoteQuestionResponse,
	InterviewNoteStatus,
	InterviewNoteType,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

export type CreateInterviewNoteInput = {
	userId: string;
	applicationId?: string;
	title: string;
	company: string;
	position: string;
	date: string;
	startTime: string;
	endTime?: string;
	location?: string;
	type: InterviewNoteType;
	tags?: string[];
};

export type UpdateInterviewNoteInput = {
	id: string;
	userId: string;
	title?: string;
	company?: string;
	position?: string;
	date?: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	type?: InterviewNoteType;
	status?: InterviewNoteStatus;
	interviewers?: InterviewNoteInterviewerInfo[];
	keyPoints?: InterviewNoteKeyPoint[];
	followUpActions?: InterviewNoteFollowUpAction[];
	questionResponses?: InterviewNoteQuestionResponse[];
	generalNotes?: string;
	tags?: string[];
	overallImpression?: InterviewNoteImpression | null;
	nextSteps?: string | null;
};

export type ListInterviewNotesInput = {
	userId: string;
	status?: InterviewNoteStatus;
	type?: InterviewNoteType;
	company?: string;
	search?: string;
	dateFilter?: string;
	limit?: number;
	offset?: number;
};

export const interviewNotesService = {
	// Create a new interview note
	create: async (input: CreateInterviewNoteInput): Promise<string> => {
		const id = generateId();

		await db.insert(schema.interviewNote).values({
			id,
			userId: input.userId,
			applicationId: input.applicationId,
			title: input.title || `${input.company} - ${input.position}`,
			company: input.company,
			position: input.position,
			date: input.date,
			startTime: input.startTime,
			endTime: input.endTime,
			location: input.location,
			type: input.type,
			status: "scheduled",
			tags: input.tags ?? [],
			interviewers: [],
			keyPoints: [],
			followUpActions: [],
			questionResponses: [],
			generalNotes: "",
		});

		return id;
	},

	// Get interview note by ID
	getById: async (input: { id: string; userId: string }) => {
		const [note] = await db
			.select()
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.id), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		return note;
	},

	// List interview notes with filters
	list: async (input: ListInterviewNotesInput) => {
		const conditions = [eq(schema.interviewNote.userId, input.userId)];

		if (input.status) {
			conditions.push(eq(schema.interviewNote.status, input.status));
		}

		if (input.type) {
			conditions.push(eq(schema.interviewNote.type, input.type));
		}

		if (input.company && input.company !== "all") {
			conditions.push(eq(schema.interviewNote.company, input.company));
		}

		if (input.dateFilter) {
			conditions.push(eq(schema.interviewNote.date, input.dateFilter));
		}

		if (input.search) {
			const searchPattern = `%${input.search}%`;
			const searchCondition = or(
				ilike(schema.interviewNote.title, searchPattern),
				ilike(schema.interviewNote.company, searchPattern),
				ilike(schema.interviewNote.position, searchPattern),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		const notes = await db
			.select()
			.from(schema.interviewNote)
			.where(and(...conditions))
			.orderBy(desc(schema.interviewNote.date), desc(schema.interviewNote.updatedAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);

		return notes;
	},

	// Update an interview note
	update: async (input: UpdateInterviewNoteInput): Promise<void> => {
		const [existing] = await db
			.select({ id: schema.interviewNote.id })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.id), eq(schema.interviewNote.userId, input.userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		await db
			.update(schema.interviewNote)
			.set({
				title: input.title,
				company: input.company,
				position: input.position,
				date: input.date,
				startTime: input.startTime,
				endTime: input.endTime,
				location: input.location,
				type: input.type,
				status: input.status,
				interviewers: input.interviewers,
				keyPoints: input.keyPoints,
				followUpActions: input.followUpActions,
				questionResponses: input.questionResponses,
				generalNotes: input.generalNotes,
				tags: input.tags,
				overallImpression: input.overallImpression,
				nextSteps: input.nextSteps,
			})
			.where(and(eq(schema.interviewNote.id, input.id), eq(schema.interviewNote.userId, input.userId)));
	},

	// Delete an interview note
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.id), eq(schema.interviewNote.userId, input.userId)));
	},

	// Toggle key point checked status
	toggleKeyPoint: async (input: {
		noteId: string;
		userId: string;
		keyPointId: string;
	}): Promise<InterviewNoteKeyPoint[]> => {
		const [note] = await db
			.select({ keyPoints: schema.interviewNote.keyPoints })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const updatedKeyPoints = note.keyPoints.map((kp) =>
			kp.id === input.keyPointId ? { ...kp, checked: !kp.checked } : kp,
		);

		await db
			.update(schema.interviewNote)
			.set({ keyPoints: updatedKeyPoints })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedKeyPoints;
	},

	// Toggle follow-up action completed status
	toggleFollowUpAction: async (input: {
		noteId: string;
		userId: string;
		actionId: string;
	}): Promise<InterviewNoteFollowUpAction[]> => {
		const [note] = await db
			.select({ followUpActions: schema.interviewNote.followUpActions })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const updatedActions = note.followUpActions.map((a) =>
			a.id === input.actionId ? { ...a, completed: !a.completed } : a,
		);

		await db
			.update(schema.interviewNote)
			.set({ followUpActions: updatedActions })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedActions;
	},

	// Add key point
	addKeyPoint: async (input: { noteId: string; userId: string; text: string }): Promise<InterviewNoteKeyPoint[]> => {
		const [note] = await db
			.select({ keyPoints: schema.interviewNote.keyPoints })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const newKeyPoint: InterviewNoteKeyPoint = {
			id: generateId(),
			text: input.text,
			checked: false,
		};

		const updatedKeyPoints = [...note.keyPoints, newKeyPoint];

		await db
			.update(schema.interviewNote)
			.set({ keyPoints: updatedKeyPoints })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedKeyPoints;
	},

	// Add follow-up action
	addFollowUpAction: async (input: {
		noteId: string;
		userId: string;
		text: string;
		dueDate?: string;
		priority: FollowUpPriority;
	}): Promise<InterviewNoteFollowUpAction[]> => {
		const [note] = await db
			.select({ followUpActions: schema.interviewNote.followUpActions })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const newAction: InterviewNoteFollowUpAction = {
			id: generateId(),
			text: input.text,
			dueDate: input.dueDate,
			completed: false,
			priority: input.priority,
		};

		const updatedActions = [...note.followUpActions, newAction];

		await db
			.update(schema.interviewNote)
			.set({ followUpActions: updatedActions })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedActions;
	},

	// Add interviewer
	addInterviewer: async (input: {
		noteId: string;
		userId: string;
		interviewer: InterviewNoteInterviewerInfo;
	}): Promise<InterviewNoteInterviewerInfo[]> => {
		const [note] = await db
			.select({ interviewers: schema.interviewNote.interviewers })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const updatedInterviewers = [...note.interviewers, input.interviewer];

		await db
			.update(schema.interviewNote)
			.set({ interviewers: updatedInterviewers })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedInterviewers;
	},

	// Add question response
	addQuestionResponse: async (input: {
		noteId: string;
		userId: string;
		question: string;
		response: string;
		timestamp: string;
		rating?: number;
		notes?: string;
	}): Promise<InterviewNoteQuestionResponse[]> => {
		const [note] = await db
			.select({ questionResponses: schema.interviewNote.questionResponses })
			.from(schema.interviewNote)
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		if (!note) {
			throw new ORPCError("NOT_FOUND", { message: "Interview note not found" });
		}

		const newResponse: InterviewNoteQuestionResponse = {
			id: generateId(),
			question: input.question,
			response: input.response,
			timestamp: input.timestamp,
			rating: input.rating,
			notes: input.notes,
		};

		const updatedResponses = [...note.questionResponses, newResponse];

		await db
			.update(schema.interviewNote)
			.set({ questionResponses: updatedResponses })
			.where(and(eq(schema.interviewNote.id, input.noteId), eq(schema.interviewNote.userId, input.userId)));

		return updatedResponses;
	},

	// Get unique companies for filtering
	getCompanies: async (input: { userId: string }): Promise<string[]> => {
		const results = await db
			.selectDistinct({ company: schema.interviewNote.company })
			.from(schema.interviewNote)
			.where(eq(schema.interviewNote.userId, input.userId))
			.orderBy(schema.interviewNote.company);

		return results.map((r) => r.company);
	},

	// Get statistics
	getStatistics: async (input: { userId: string }) => {
		const notes = await db.select().from(schema.interviewNote).where(eq(schema.interviewNote.userId, input.userId));

		const total = notes.length;
		const completed = notes.filter((n) => n.status === "completed").length;
		const scheduled = notes.filter((n) => n.status === "scheduled").length;
		const pendingActions = notes.reduce((acc, n) => acc + n.followUpActions.filter((a) => !a.completed).length, 0);

		return {
			total,
			completed,
			scheduled,
			pendingActions,
		};
	},
};
