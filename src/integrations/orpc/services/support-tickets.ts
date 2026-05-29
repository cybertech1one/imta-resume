/**
 * @fileoverview Support / Helpdesk Ticket Service
 *
 * Database-backed support ticket system. Provides user-scoped operations
 * (a user may only access their own tickets) and admin operations (full access).
 *
 * Security: every user-facing method requires the caller's userId and verifies
 * ownership of the ticket. A FORBIDDEN error is thrown if a user attempts to
 * access a ticket that does not belong to them. Bodies are stored as plain text
 * and rendered as text in the UI (no HTML), preventing stored XSS.
 *
 * @module integrations/orpc/services/support-tickets
 */

import { ORPCError } from "@orpc/server";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";

export type TicketCategory = "account" | "technical" | "billing" | "ai" | "resume" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high";

export type TicketRow = {
	id: string;
	userId: string;
	subject: string;
	category: string;
	status: string;
	priority: string;
	createdAt: Date;
	updatedAt: Date;
	lastMessageAt: Date;
};

export type TicketMessageRow = {
	id: string;
	ticketId: string;
	senderUserId: string;
	isAdmin: boolean;
	body: string;
	createdAt: Date;
};

export type TicketWithUser = TicketRow & {
	userName: string;
	userEmail: string;
};

export type StatusCounts = {
	open: number;
	in_progress: number;
	resolved: number;
	closed: number;
	total: number;
};

const PAGE_SIZE = 20;

/**
 * Fetches a ticket by id or throws NOT_FOUND.
 * @internal
 */
async function getTicketRowOrThrow(ticketId: string): Promise<TicketRow> {
	const [ticket] = await db.select().from(schema.supportTicket).where(eq(schema.supportTicket.id, ticketId)).limit(1);
	if (!ticket) {
		throw new ORPCError("NOT_FOUND", { message: "Support ticket not found" });
	}
	return ticket;
}

/**
 * Fetches a ticket and asserts the given user owns it.
 * Throws FORBIDDEN when the ticket belongs to another user.
 * @internal
 */
async function getOwnedTicketOrThrow(ticketId: string, userId: string): Promise<TicketRow> {
	const ticket = await getTicketRowOrThrow(ticketId);
	if (ticket.userId !== userId) {
		throw new ORPCError("FORBIDDEN", { message: "You do not have access to this support ticket" });
	}
	return ticket;
}

async function listMessages(ticketId: string): Promise<TicketMessageRow[]> {
	return db
		.select()
		.from(schema.supportMessage)
		.where(eq(schema.supportMessage.ticketId, ticketId))
		.orderBy(asc(schema.supportMessage.createdAt));
}

export const supportTicketService = {
	// ---------------------------------------------------------------------------
	// USER-SCOPED OPERATIONS (caller may only touch their own tickets)
	// ---------------------------------------------------------------------------

	/** Creates a ticket plus its first message, atomically. */
	async createTicket(input: {
		userId: string;
		subject: string;
		category: TicketCategory;
		message: string;
	}): Promise<TicketRow> {
		return db.transaction(async (tx) => {
			const now = new Date();
			const [ticket] = await tx
				.insert(schema.supportTicket)
				.values({
					userId: input.userId,
					subject: input.subject,
					category: input.category,
					status: "open",
					priority: "normal",
					lastMessageAt: now,
				})
				.returning();

			await tx.insert(schema.supportMessage).values({
				ticketId: ticket.id,
				senderUserId: input.userId,
				isAdmin: false,
				body: input.message,
				createdAt: now,
			});

			return ticket;
		});
	},

	/** Lists all tickets owned by the user, newest activity first. */
	async listMyTickets(userId: string): Promise<TicketRow[]> {
		return db
			.select()
			.from(schema.supportTicket)
			.where(eq(schema.supportTicket.userId, userId))
			.orderBy(desc(schema.supportTicket.lastMessageAt));
	},

	/** Returns a ticket (ownership verified) with its full message thread. */
	async getMyTicket(ticketId: string, userId: string): Promise<{ ticket: TicketRow; messages: TicketMessageRow[] }> {
		const ticket = await getOwnedTicketOrThrow(ticketId, userId);
		const messages = await listMessages(ticketId);
		return { ticket, messages };
	},

	/** Adds a user reply (ownership verified). Reopens a resolved ticket. */
	async replyToMyTicket(ticketId: string, userId: string, body: string): Promise<TicketMessageRow> {
		const ticket = await getOwnedTicketOrThrow(ticketId, userId);
		if (ticket.status === "closed") {
			throw new ORPCError("BAD_REQUEST", { message: "This ticket is closed and cannot receive new replies" });
		}

		return db.transaction(async (tx) => {
			const now = new Date();
			const [message] = await tx
				.insert(schema.supportMessage)
				.values({
					ticketId,
					senderUserId: userId,
					isAdmin: false,
					body,
					createdAt: now,
				})
				.returning();

			// Reopen the ticket if a resolved ticket gets a new user reply.
			const nextStatus = ticket.status === "resolved" ? "open" : ticket.status;
			await tx
				.update(schema.supportTicket)
				.set({ lastMessageAt: now, status: nextStatus })
				.where(eq(schema.supportTicket.id, ticketId));

			return message;
		});
	},

	/** User closes their own ticket (ownership verified). */
	async closeMyTicket(ticketId: string, userId: string): Promise<void> {
		await getOwnedTicketOrThrow(ticketId, userId);
		await db.update(schema.supportTicket).set({ status: "closed" }).where(eq(schema.supportTicket.id, ticketId));
	},

	// ---------------------------------------------------------------------------
	// ADMIN OPERATIONS (full access — guarded at the router via adminProcedure)
	// ---------------------------------------------------------------------------

	/** Lists all tickets with user info, filtered by status/search and paginated. */
	async listAllTickets(input: {
		status?: TicketStatus;
		search?: string;
		page?: number;
	}): Promise<{ tickets: TicketWithUser[]; total: number; page: number; pageSize: number; counts: StatusCounts }> {
		const page = Math.max(1, input.page ?? 1);
		const offset = (page - 1) * PAGE_SIZE;

		const filters = [];
		if (input.status) {
			filters.push(eq(schema.supportTicket.status, input.status));
		}
		if (input.search?.trim()) {
			const term = `%${input.search.trim()}%`;
			filters.push(
				or(ilike(schema.supportTicket.subject, term), ilike(schema.user.name, term), ilike(schema.user.email, term)),
			);
		}
		const whereClause = filters.length > 0 ? and(...filters) : undefined;

		const rows = await db
			.select({
				id: schema.supportTicket.id,
				userId: schema.supportTicket.userId,
				subject: schema.supportTicket.subject,
				category: schema.supportTicket.category,
				status: schema.supportTicket.status,
				priority: schema.supportTicket.priority,
				createdAt: schema.supportTicket.createdAt,
				updatedAt: schema.supportTicket.updatedAt,
				lastMessageAt: schema.supportTicket.lastMessageAt,
				userName: schema.user.name,
				userEmail: schema.user.email,
			})
			.from(schema.supportTicket)
			.innerJoin(schema.user, eq(schema.user.id, schema.supportTicket.userId))
			.where(whereClause)
			.orderBy(desc(schema.supportTicket.lastMessageAt))
			.limit(PAGE_SIZE)
			.offset(offset);

		const [{ value: total }] = await db
			.select({ value: count() })
			.from(schema.supportTicket)
			.innerJoin(schema.user, eq(schema.user.id, schema.supportTicket.userId))
			.where(whereClause);

		const counts = await this.getStats();

		return { tickets: rows, total: Number(total), page, pageSize: PAGE_SIZE, counts };
	},

	/** Returns any ticket with user info plus its full message thread (admin). */
	async getTicket(ticketId: string): Promise<{ ticket: TicketWithUser; messages: TicketMessageRow[] }> {
		const [ticket] = await db
			.select({
				id: schema.supportTicket.id,
				userId: schema.supportTicket.userId,
				subject: schema.supportTicket.subject,
				category: schema.supportTicket.category,
				status: schema.supportTicket.status,
				priority: schema.supportTicket.priority,
				createdAt: schema.supportTicket.createdAt,
				updatedAt: schema.supportTicket.updatedAt,
				lastMessageAt: schema.supportTicket.lastMessageAt,
				userName: schema.user.name,
				userEmail: schema.user.email,
			})
			.from(schema.supportTicket)
			.innerJoin(schema.user, eq(schema.user.id, schema.supportTicket.userId))
			.where(eq(schema.supportTicket.id, ticketId))
			.limit(1);

		if (!ticket) {
			throw new ORPCError("NOT_FOUND", { message: "Support ticket not found" });
		}

		const messages = await listMessages(ticketId);
		return { ticket, messages };
	},

	/** Adds an admin reply and sets the ticket to in_progress (if open). */
	async replyToTicket(ticketId: string, adminUserId: string, body: string): Promise<TicketMessageRow> {
		const ticket = await getTicketRowOrThrow(ticketId);

		return db.transaction(async (tx) => {
			const now = new Date();
			const [message] = await tx
				.insert(schema.supportMessage)
				.values({
					ticketId,
					senderUserId: adminUserId,
					isAdmin: true,
					body,
					createdAt: now,
				})
				.returning();

			// An admin replying to an untouched open ticket moves it to in_progress.
			const nextStatus = ticket.status === "open" ? "in_progress" : ticket.status;
			await tx
				.update(schema.supportTicket)
				.set({ lastMessageAt: now, status: nextStatus })
				.where(eq(schema.supportTicket.id, ticketId));

			return message;
		});
	},

	/** Updates a ticket's status and/or priority (admin). */
	async updateTicket(
		ticketId: string,
		input: { status?: TicketStatus; priority?: TicketPriority },
	): Promise<TicketRow> {
		await getTicketRowOrThrow(ticketId);

		const patch: { status?: TicketStatus; priority?: TicketPriority } = {};
		if (input.status) patch.status = input.status;
		if (input.priority) patch.priority = input.priority;

		if (Object.keys(patch).length === 0) {
			return getTicketRowOrThrow(ticketId);
		}

		const [updated] = await db
			.update(schema.supportTicket)
			.set(patch)
			.where(eq(schema.supportTicket.id, ticketId))
			.returning();

		return updated;
	},

	/** Counts tickets grouped by status for the admin dashboard badge. */
	async getStats(): Promise<StatusCounts> {
		const rows = await db
			.select({
				status: schema.supportTicket.status,
				value: count(),
			})
			.from(schema.supportTicket)
			.groupBy(schema.supportTicket.status);

		const counts: StatusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 };
		for (const row of rows) {
			const n = Number(row.value);
			counts.total += n;
			if (row.status === "open") counts.open = n;
			else if (row.status === "in_progress") counts.in_progress = n;
			else if (row.status === "resolved") counts.resolved = n;
			else if (row.status === "closed") counts.closed = n;
		}
		return counts;
	},
};
