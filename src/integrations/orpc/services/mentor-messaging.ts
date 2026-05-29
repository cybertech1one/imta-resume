import { ORPCError } from "@orpc/client";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import { generateId } from "@/utils/string";

// Types
export type SendMessageInput = {
	senderId: string;
	receiverId: string;
	subject?: string;
	content: string;
	mentorConnectionId?: string;
};

export type Message = {
	id: string;
	senderId: string;
	receiverId: string;
	mentorConnectionId: string | null;
	subject: string | null;
	content: string;
	isRead: boolean;
	readAt: Date | null;
	createdAt: Date;
	senderName?: string;
	senderAvatar?: string | null;
	receiverName?: string;
	receiverAvatar?: string | null;
};

export type ConversationSummary = {
	otherUserId: string;
	otherUserName: string;
	otherUserAvatar: string | null;
	lastMessage: string;
	lastMessageAt: Date;
	unreadCount: number;
	isLastMessageFromMe: boolean;
};

export const mentorMessagingService = {
	// Send a new message
	sendMessage: async (input: SendMessageInput): Promise<string> => {
		// Validate receiver exists
		const [receiver] = await db
			.select({ id: schema.user.id })
			.from(schema.user)
			.where(eq(schema.user.id, input.receiverId));

		if (!receiver) {
			throw new ORPCError("NOT_FOUND", { message: "Receiver not found" });
		}

		const id = generateId();

		await db.insert(schema.mentorMessage).values({
			id,
			senderId: input.senderId,
			receiverId: input.receiverId,
			subject: input.subject,
			content: input.content,
			mentorConnectionId: input.mentorConnectionId,
			isRead: false,
		});

		return id;
	},

	// Get conversation between two users
	getConversation: async (userId: string, otherUserId: string): Promise<Message[]> => {
		const messages = await db
			.select({
				id: schema.mentorMessage.id,
				senderId: schema.mentorMessage.senderId,
				receiverId: schema.mentorMessage.receiverId,
				mentorConnectionId: schema.mentorMessage.mentorConnectionId,
				subject: schema.mentorMessage.subject,
				content: schema.mentorMessage.content,
				isRead: schema.mentorMessage.isRead,
				readAt: schema.mentorMessage.readAt,
				createdAt: schema.mentorMessage.createdAt,
			})
			.from(schema.mentorMessage)
			.where(
				or(
					and(eq(schema.mentorMessage.senderId, userId), eq(schema.mentorMessage.receiverId, otherUserId)),
					and(eq(schema.mentorMessage.senderId, otherUserId), eq(schema.mentorMessage.receiverId, userId)),
				),
			)
			.orderBy(schema.mentorMessage.createdAt);

		// Fetch user details for sender and receiver
		const userIds = Array.from(new Set([...messages.map((m) => m.senderId), ...messages.map((m) => m.receiverId)]));

		if (userIds.length === 0) return [];

		const users = await db
			.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
			.from(schema.user)
			.where(inArray(schema.user.id, userIds));

		const userMap = new Map(users.map((u) => [u.id, u]));

		return messages.map((m) => ({
			...m,
			senderName: userMap.get(m.senderId)?.name,
			senderAvatar: userMap.get(m.senderId)?.image ?? null,
			receiverName: userMap.get(m.receiverId)?.name,
			receiverAvatar: userMap.get(m.receiverId)?.image ?? null,
		}));
	},

	// Get all received messages (inbox)
	getInbox: async (userId: string): Promise<Message[]> => {
		const messages = await db
			.select({
				id: schema.mentorMessage.id,
				senderId: schema.mentorMessage.senderId,
				receiverId: schema.mentorMessage.receiverId,
				mentorConnectionId: schema.mentorMessage.mentorConnectionId,
				subject: schema.mentorMessage.subject,
				content: schema.mentorMessage.content,
				isRead: schema.mentorMessage.isRead,
				readAt: schema.mentorMessage.readAt,
				createdAt: schema.mentorMessage.createdAt,
			})
			.from(schema.mentorMessage)
			.where(eq(schema.mentorMessage.receiverId, userId))
			.orderBy(desc(schema.mentorMessage.createdAt));

		// Fetch sender details
		const senderIds = Array.from(new Set(messages.map((m) => m.senderId)));
		if (senderIds.length === 0) return messages as Message[];

		const senders = await db
			.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
			.from(schema.user)
			.where(inArray(schema.user.id, senderIds));

		const senderMap = new Map(senders.map((u) => [u.id, u]));

		return messages.map((m) => ({
			...m,
			senderName: senderMap.get(m.senderId)?.name,
			senderAvatar: senderMap.get(m.senderId)?.image ?? null,
		}));
	},

	// Get all sent messages
	getSent: async (userId: string): Promise<Message[]> => {
		const messages = await db
			.select({
				id: schema.mentorMessage.id,
				senderId: schema.mentorMessage.senderId,
				receiverId: schema.mentorMessage.receiverId,
				mentorConnectionId: schema.mentorMessage.mentorConnectionId,
				subject: schema.mentorMessage.subject,
				content: schema.mentorMessage.content,
				isRead: schema.mentorMessage.isRead,
				readAt: schema.mentorMessage.readAt,
				createdAt: schema.mentorMessage.createdAt,
			})
			.from(schema.mentorMessage)
			.where(eq(schema.mentorMessage.senderId, userId))
			.orderBy(desc(schema.mentorMessage.createdAt));

		// Fetch receiver details
		const receiverIds = Array.from(new Set(messages.map((m) => m.receiverId)));
		if (receiverIds.length === 0) return messages as Message[];

		const receivers = await db
			.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
			.from(schema.user)
			.where(inArray(schema.user.id, receiverIds));

		const receiverMap = new Map(receivers.map((u) => [u.id, u]));

		return messages.map((m) => ({
			...m,
			receiverName: receiverMap.get(m.receiverId)?.name,
			receiverAvatar: receiverMap.get(m.receiverId)?.image ?? null,
		}));
	},

	// Mark a message as read
	markAsRead: async (messageId: string, userId: string): Promise<void> => {
		const [message] = await db
			.select({ id: schema.mentorMessage.id, receiverId: schema.mentorMessage.receiverId })
			.from(schema.mentorMessage)
			.where(eq(schema.mentorMessage.id, messageId));

		if (!message) {
			throw new ORPCError("NOT_FOUND", { message: "Message not found" });
		}

		// Only allow the receiver to mark as read
		if (message.receiverId !== userId) {
			throw new ORPCError("FORBIDDEN", { message: "Not authorized to mark this message as read" });
		}

		await db
			.update(schema.mentorMessage)
			.set({
				isRead: true,
				readAt: new Date(),
			})
			.where(eq(schema.mentorMessage.id, messageId));
	},

	// Mark all messages in a conversation as read
	markConversationAsRead: async (userId: string, otherUserId: string): Promise<void> => {
		await db
			.update(schema.mentorMessage)
			.set({
				isRead: true,
				readAt: new Date(),
			})
			.where(
				and(
					eq(schema.mentorMessage.senderId, otherUserId),
					eq(schema.mentorMessage.receiverId, userId),
					eq(schema.mentorMessage.isRead, false),
				),
			);
	},

	// Get unread message count
	getUnreadCount: async (userId: string): Promise<number> => {
		const unreadMessages = await db
			.select({ id: schema.mentorMessage.id })
			.from(schema.mentorMessage)
			.where(and(eq(schema.mentorMessage.receiverId, userId), eq(schema.mentorMessage.isRead, false)));

		return unreadMessages.length;
	},

	// Get conversation summaries (for inbox view)
	getConversations: async (userId: string): Promise<ConversationSummary[]> => {
		// Get all messages involving this user
		const messages = await db
			.select({
				id: schema.mentorMessage.id,
				senderId: schema.mentorMessage.senderId,
				receiverId: schema.mentorMessage.receiverId,
				content: schema.mentorMessage.content,
				isRead: schema.mentorMessage.isRead,
				createdAt: schema.mentorMessage.createdAt,
			})
			.from(schema.mentorMessage)
			.where(or(eq(schema.mentorMessage.senderId, userId), eq(schema.mentorMessage.receiverId, userId)))
			.orderBy(desc(schema.mentorMessage.createdAt));

		// Group by conversation partner
		const conversationMap = new Map<
			string,
			{
				lastMessage: string;
				lastMessageAt: Date;
				unreadCount: number;
				isLastMessageFromMe: boolean;
			}
		>();

		for (const msg of messages) {
			const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;

			if (!conversationMap.has(otherUserId)) {
				conversationMap.set(otherUserId, {
					lastMessage: msg.content,
					lastMessageAt: msg.createdAt,
					unreadCount: 0,
					isLastMessageFromMe: msg.senderId === userId,
				});
			}

			const conv = conversationMap.get(otherUserId);
			// Count unread messages from other user
			if (conv && msg.senderId !== userId && !msg.isRead) {
				conv.unreadCount++;
			}
		}

		// Fetch user details for all conversation partners
		const otherUserIds = Array.from(conversationMap.keys());
		if (otherUserIds.length === 0) return [];

		const users = await db
			.select({ id: schema.user.id, name: schema.user.name, image: schema.user.image })
			.from(schema.user)
			.where(inArray(schema.user.id, otherUserIds));

		const userMap = new Map(users.map((u) => [u.id, u]));

		// Build final conversation summaries
		const conversations: ConversationSummary[] = [];
		for (const [otherUserId, data] of conversationMap.entries()) {
			const user = userMap.get(otherUserId);
			if (user) {
				conversations.push({
					otherUserId,
					otherUserName: user.name,
					otherUserAvatar: user.image,
					...data,
				});
			}
		}

		// Sort by last message date
		conversations.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

		return conversations;
	},

	// Delete a message
	deleteMessage: async (messageId: string, userId: string): Promise<void> => {
		const [message] = await db
			.select({ id: schema.mentorMessage.id, senderId: schema.mentorMessage.senderId })
			.from(schema.mentorMessage)
			.where(eq(schema.mentorMessage.id, messageId));

		if (!message) {
			throw new ORPCError("NOT_FOUND", { message: "Message not found" });
		}

		// Only allow sender to delete
		if (message.senderId !== userId) {
			throw new ORPCError("FORBIDDEN", { message: "Not authorized to delete this message" });
		}

		await db.delete(schema.mentorMessage).where(eq(schema.mentorMessage.id, messageId));
	},
};
