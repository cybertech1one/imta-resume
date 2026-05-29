import { ORPCError } from "@orpc/client";
import { and, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { notificationService } from "./notification";

/**
 * Direct Messaging Service
 *
 * Implements a normalized, participant-scoped conversation/message model.
 * A 1:1 DM is a `conversation` with exactly two `conversation_participant` rows.
 *
 * SECURITY: Every read/write that targets a specific conversation MUST first
 * verify (via `assertParticipant`) that the caller is a participant of that
 * conversation, throwing ORPCError("FORBIDDEN") otherwise. There is no code
 * path that returns conversation/message data to a non-participant.
 */

export const MESSAGE_MAX_LENGTH = 5000;
const SUBJECT_MAX_LENGTH = 200;
const NOTIFICATION_PREVIEW_LENGTH = 120;

export type ConversationParticipantInfo = {
	userId: string;
	name: string;
	image: string | null;
	lastReadAt: Date | null;
};

export type MessageView = {
	id: string;
	conversationId: string;
	senderUserId: string;
	body: string;
	createdAt: Date;
};

export type ConversationSummaryView = {
	conversationId: string;
	subject: string | null;
	lastMessageAt: Date;
	lastMessagePreview: string | null;
	lastMessageFromMe: boolean;
	unreadCount: number;
	otherParticipant: {
		userId: string;
		name: string;
		image: string | null;
	} | null;
};

export type ConversationDetailView = {
	conversationId: string;
	subject: string | null;
	participants: ConversationParticipantInfo[];
	messages: MessageView[];
};

/**
 * Verifies that `userId` is a participant of `conversationId`.
 * @throws {ORPCError} FORBIDDEN when the user is not a participant (also used
 *   when the conversation does not exist, to avoid leaking existence).
 * @returns the participant row id for the caller.
 */
async function assertParticipant(conversationId: string, userId: string): Promise<string> {
	const [participant] = await db
		.select({ id: schema.conversationParticipant.id })
		.from(schema.conversationParticipant)
		.where(
			and(
				eq(schema.conversationParticipant.conversationId, conversationId),
				eq(schema.conversationParticipant.userId, userId),
			),
		)
		.limit(1);

	if (!participant) {
		throw new ORPCError("FORBIDDEN", {
			message: "You do not have access to this conversation",
		});
	}

	return participant.id;
}

/**
 * Finds an existing 1:1 conversation shared by exactly the two users.
 * @returns the conversation id, or null if none exists.
 */
async function findDirectConversation(userA: string, userB: string): Promise<string | null> {
	// Conversations that BOTH users participate in, restricted to exactly-two-participant
	// conversations (true 1:1 DMs) so we never reuse a group conversation.
	const rows = await db
		.select({
			conversationId: schema.conversationParticipant.conversationId,
			total: sql<number>`count(*)::int`,
			matched: sql<number>`count(*) filter (where ${schema.conversationParticipant.userId} in (${userA}, ${userB}))::int`,
		})
		.from(schema.conversationParticipant)
		.groupBy(schema.conversationParticipant.conversationId)
		.having(
			sql`count(*) = 2 and count(*) filter (where ${schema.conversationParticipant.userId} in (${userA}, ${userB})) = 2`,
		)
		.limit(1);

	return rows[0]?.conversationId ?? null;
}

export const messagingService = {
	/**
	 * Start (or reuse) a 1:1 conversation with `recipientUserId` and post the
	 * first message. Reuses an existing direct conversation when one exists.
	 */
	startConversation: async (input: {
		senderUserId: string;
		recipientUserId: string;
		body: string;
		subject?: string;
	}): Promise<{ conversationId: string; messageId: string }> => {
		const body = input.body.trim();
		if (body.length === 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Message cannot be empty" });
		}
		if (input.senderUserId === input.recipientUserId) {
			throw new ORPCError("BAD_REQUEST", { message: "You cannot message yourself" });
		}

		// Recipient must exist.
		const [recipient] = await db
			.select({ id: schema.user.id })
			.from(schema.user)
			.where(eq(schema.user.id, input.recipientUserId))
			.limit(1);
		if (!recipient) {
			throw new ORPCError("NOT_FOUND", { message: "Recipient not found" });
		}

		const subject = input.subject?.trim().slice(0, SUBJECT_MAX_LENGTH) || null;

		// Reuse an existing 1:1 conversation if present.
		let conversationId = await findDirectConversation(input.senderUserId, input.recipientUserId);

		if (!conversationId) {
			const [created] = await db
				.insert(schema.conversation)
				.values({ subject, lastMessageAt: new Date() })
				.returning({ id: schema.conversation.id });
			conversationId = created.id;

			await db.insert(schema.conversationParticipant).values([
				{ conversationId, userId: input.senderUserId },
				{ conversationId, userId: input.recipientUserId },
			]);
		}

		const messageId = await messagingService.sendMessage({
			conversationId,
			senderUserId: input.senderUserId,
			body,
		});

		return { conversationId, messageId };
	},

	/**
	 * List the caller's conversations with the other participant's identity,
	 * a last-message preview and the unread count (messages newer than the
	 * caller's last_read_at), ordered by recency.
	 */
	listMyConversations: async (userId: string): Promise<ConversationSummaryView[]> => {
		// Conversations the caller participates in, plus their last_read_at.
		const myParticipations = await db
			.select({
				conversationId: schema.conversationParticipant.conversationId,
				lastReadAt: schema.conversationParticipant.lastReadAt,
			})
			.from(schema.conversationParticipant)
			.where(eq(schema.conversationParticipant.userId, userId));

		if (myParticipations.length === 0) return [];

		const conversationIds = myParticipations.map((p) => p.conversationId);
		const lastReadByConversation = new Map(myParticipations.map((p) => [p.conversationId, p.lastReadAt]));

		// Conversation rows (subject, last_message_at).
		const conversations = await db
			.select({
				id: schema.conversation.id,
				subject: schema.conversation.subject,
				lastMessageAt: schema.conversation.lastMessageAt,
			})
			.from(schema.conversation)
			.where(inArray(schema.conversation.id, conversationIds));

		// All participants of those conversations (to resolve the "other" user).
		const participants = await db
			.select({
				conversationId: schema.conversationParticipant.conversationId,
				userId: schema.conversationParticipant.userId,
				name: schema.user.name,
				image: schema.user.image,
			})
			.from(schema.conversationParticipant)
			.innerJoin(schema.user, eq(schema.user.id, schema.conversationParticipant.userId))
			.where(inArray(schema.conversationParticipant.conversationId, conversationIds));

		const otherByConversation = new Map<string, { userId: string; name: string; image: string | null }>();
		for (const p of participants) {
			if (p.userId !== userId && !otherByConversation.has(p.conversationId)) {
				otherByConversation.set(p.conversationId, { userId: p.userId, name: p.name, image: p.image });
			}
		}

		// Last message per conversation (id, body, sender) using DISTINCT ON.
		const lastMessages = await db
			.selectDistinctOn([schema.message.conversationId], {
				conversationId: schema.message.conversationId,
				body: schema.message.body,
				senderUserId: schema.message.senderUserId,
			})
			.from(schema.message)
			.where(inArray(schema.message.conversationId, conversationIds))
			.orderBy(schema.message.conversationId, desc(schema.message.createdAt));
		const lastMessageByConversation = new Map(lastMessages.map((r) => [r.conversationId, r]));

		// Unread counts: messages newer than my last_read_at, not authored by me.
		const summaries: ConversationSummaryView[] = [];
		for (const conv of conversations) {
			const lastReadAt = lastReadByConversation.get(conv.id) ?? null;
			const [unread] = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.message)
				.where(
					and(
						eq(schema.message.conversationId, conv.id),
						ne(schema.message.senderUserId, userId),
						lastReadAt ? gt(schema.message.createdAt, lastReadAt) : sql`true`,
					),
				);

			const last = lastMessageByConversation.get(conv.id);
			summaries.push({
				conversationId: conv.id,
				subject: conv.subject,
				lastMessageAt: conv.lastMessageAt,
				lastMessagePreview: last ? last.body.slice(0, NOTIFICATION_PREVIEW_LENGTH) : null,
				lastMessageFromMe: last ? last.senderUserId === userId : false,
				unreadCount: unread?.count ?? 0,
				otherParticipant: otherByConversation.get(conv.id) ?? null,
			});
		}

		summaries.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
		return summaries;
	},

	/**
	 * Return the messages + participants for a conversation the caller belongs
	 * to, and advance the caller's last_read_at to now.
	 * @throws {ORPCError} FORBIDDEN when the caller is not a participant.
	 */
	getConversation: async (userId: string, conversationId: string): Promise<ConversationDetailView> => {
		await assertParticipant(conversationId, userId);

		const [conv] = await db
			.select({ id: schema.conversation.id, subject: schema.conversation.subject })
			.from(schema.conversation)
			.where(eq(schema.conversation.id, conversationId))
			.limit(1);
		if (!conv) {
			throw new ORPCError("NOT_FOUND", { message: "Conversation not found" });
		}

		const participants = await db
			.select({
				userId: schema.conversationParticipant.userId,
				lastReadAt: schema.conversationParticipant.lastReadAt,
				name: schema.user.name,
				image: schema.user.image,
			})
			.from(schema.conversationParticipant)
			.innerJoin(schema.user, eq(schema.user.id, schema.conversationParticipant.userId))
			.where(eq(schema.conversationParticipant.conversationId, conversationId));

		const messages = await db
			.select({
				id: schema.message.id,
				conversationId: schema.message.conversationId,
				senderUserId: schema.message.senderUserId,
				body: schema.message.body,
				createdAt: schema.message.createdAt,
			})
			.from(schema.message)
			.where(eq(schema.message.conversationId, conversationId))
			.orderBy(schema.message.createdAt);

		// Advance the caller's read cursor.
		await db
			.update(schema.conversationParticipant)
			.set({ lastReadAt: new Date() })
			.where(
				and(
					eq(schema.conversationParticipant.conversationId, conversationId),
					eq(schema.conversationParticipant.userId, userId),
				),
			);

		return {
			conversationId: conv.id,
			subject: conv.subject,
			participants: participants.map((p) => ({
				userId: p.userId,
				name: p.name,
				image: p.image,
				lastReadAt: p.lastReadAt,
			})),
			messages,
		};
	},

	/**
	 * Insert a message into a conversation the caller belongs to, bump the
	 * conversation's last_message_at, and notify the other participant(s).
	 * @throws {ORPCError} FORBIDDEN when the caller is not a participant.
	 */
	sendMessage: async (input: { conversationId: string; senderUserId: string; body: string }): Promise<string> => {
		const body = input.body.trim();
		if (body.length === 0) {
			throw new ORPCError("BAD_REQUEST", { message: "Message cannot be empty" });
		}

		await assertParticipant(input.conversationId, input.senderUserId);

		const now = new Date();
		const [inserted] = await db
			.insert(schema.message)
			.values({
				conversationId: input.conversationId,
				senderUserId: input.senderUserId,
				body: body.slice(0, MESSAGE_MAX_LENGTH),
			})
			.returning({ id: schema.message.id });

		await db
			.update(schema.conversation)
			.set({ lastMessageAt: now })
			.where(eq(schema.conversation.id, input.conversationId));

		// Mark the sender as having read up to their own message.
		await db
			.update(schema.conversationParticipant)
			.set({ lastReadAt: now })
			.where(
				and(
					eq(schema.conversationParticipant.conversationId, input.conversationId),
					eq(schema.conversationParticipant.userId, input.senderUserId),
				),
			);

		// Notify the other participant(s).
		const others = await db
			.select({ userId: schema.conversationParticipant.userId })
			.from(schema.conversationParticipant)
			.where(
				and(
					eq(schema.conversationParticipant.conversationId, input.conversationId),
					ne(schema.conversationParticipant.userId, input.senderUserId),
				),
			);

		const [sender] = await db
			.select({ name: schema.user.name })
			.from(schema.user)
			.where(eq(schema.user.id, input.senderUserId))
			.limit(1);
		const senderName = sender?.name ?? "Quelqu'un";
		const preview = body.slice(0, NOTIFICATION_PREVIEW_LENGTH);

		for (const other of others) {
			try {
				await notificationService.create({
					userId: other.userId,
					type: "announcement",
					title: `Nouveau message de ${senderName}`,
					description: preview,
					link: `/dashboard/messages?conversation=${input.conversationId}`,
					metadata: { kind: "direct-message", conversationId: input.conversationId },
				});
			} catch {
				// Notification failures must not block message delivery.
			}
		}

		return inserted.id;
	},

	/**
	 * Advance the caller's last_read_at for a conversation they belong to.
	 * @throws {ORPCError} FORBIDDEN when the caller is not a participant.
	 */
	markRead: async (userId: string, conversationId: string): Promise<void> => {
		await assertParticipant(conversationId, userId);
		await db
			.update(schema.conversationParticipant)
			.set({ lastReadAt: new Date() })
			.where(
				and(
					eq(schema.conversationParticipant.conversationId, conversationId),
					eq(schema.conversationParticipant.userId, userId),
				),
			);
	},

	/**
	 * Total number of unread messages across all the caller's conversations
	 * (messages newer than each conversation's last_read_at, not authored by
	 * the caller). Used for the nav badge.
	 */
	getUnreadCount: async (userId: string): Promise<number> => {
		try {
			const [row] = await db
				.execute<{ count: number }>(sql`
				select count(*)::int as count
				from ${schema.message} m
				join ${schema.conversationParticipant} cp
					on cp.conversation_id = m.conversation_id and cp.user_id = ${userId}
				where m.sender_user_id <> ${userId}
					and (cp.last_read_at is null or m.created_at > cp.last_read_at)
			`)
				.then((r) => r.rows);
			return row?.count ?? 0;
		} catch {
			// Keep the badge graceful on transient DB errors.
			return 0;
		}
	},
};
