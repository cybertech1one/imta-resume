import z from "zod";
import { protectedProcedure } from "../context";
import { MESSAGE_MAX_LENGTH, messagingService } from "../services/messaging";

// ---- Output schemas ----

const messageSchema = z.object({
	id: z.string(),
	conversationId: z.string(),
	senderUserId: z.string(),
	body: z.string(),
	createdAt: z.coerce.date(),
});

const participantSchema = z.object({
	userId: z.string(),
	name: z.string(),
	image: z.string().nullable(),
	lastReadAt: z.coerce.date().nullable(),
});

const conversationSummarySchema = z.object({
	conversationId: z.string(),
	subject: z.string().nullable(),
	lastMessageAt: z.coerce.date(),
	lastMessagePreview: z.string().nullable(),
	lastMessageFromMe: z.boolean(),
	unreadCount: z.number(),
	otherParticipant: z
		.object({
			userId: z.string(),
			name: z.string(),
			image: z.string().nullable(),
		})
		.nullable(),
});

const conversationDetailSchema = z.object({
	conversationId: z.string(),
	subject: z.string().nullable(),
	participants: z.array(participantSchema),
	messages: z.array(messageSchema),
});

// ---- Input schemas ----

// Plain-text body, trimmed and length-capped. Stored & rendered as text only.
const bodyInput = z.string().trim().min(1, "Le message ne peut pas être vide").max(MESSAGE_MAX_LENGTH);
const subjectInput = z.string().trim().max(200).optional();

export const messagingRouter = {
	// Start (or reuse) a 1:1 conversation and post the first message.
	startConversation: protectedProcedure
		.route({
			method: "POST",
			path: "/messaging/conversations",
			tags: ["Messaging"],
			summary: "Start or reuse a 1:1 conversation and send the first message",
		})
		.input(
			z.object({
				recipientUserId: z.string().uuid(),
				body: bodyInput,
				subject: subjectInput,
			}),
		)
		.output(z.object({ conversationId: z.string(), messageId: z.string() }))
		.handler(async ({ context, input }) => {
			return await messagingService.startConversation({
				senderUserId: context.user.id,
				recipientUserId: input.recipientUserId,
				body: input.body,
				subject: input.subject,
			});
		}),

	// List the caller's conversations (participant-scoped).
	listMyConversations: protectedProcedure
		.route({
			method: "GET",
			path: "/messaging/conversations",
			tags: ["Messaging"],
			summary: "List my conversations",
		})
		.output(z.array(conversationSummarySchema))
		.handler(async ({ context }) => {
			return await messagingService.listMyConversations(context.user.id);
		}),

	// Get a conversation's messages + participants (FORBIDDEN if not a participant).
	getConversation: protectedProcedure
		.route({
			method: "GET",
			path: "/messaging/conversations/{conversationId}",
			tags: ["Messaging"],
			summary: "Get a conversation (participant-scoped)",
		})
		.input(z.object({ conversationId: z.string().uuid() }))
		.output(conversationDetailSchema)
		.handler(async ({ context, input }) => {
			return await messagingService.getConversation(context.user.id, input.conversationId);
		}),

	// Send a message into an existing conversation (FORBIDDEN if not a participant).
	sendMessage: protectedProcedure
		.route({
			method: "POST",
			path: "/messaging/conversations/{conversationId}/messages",
			tags: ["Messaging"],
			summary: "Send a message in a conversation",
		})
		.input(
			z.object({
				conversationId: z.string().uuid(),
				body: bodyInput,
			}),
		)
		.output(z.object({ messageId: z.string() }))
		.handler(async ({ context, input }) => {
			const messageId = await messagingService.sendMessage({
				conversationId: input.conversationId,
				senderUserId: context.user.id,
				body: input.body,
			});
			return { messageId };
		}),

	// Mark a conversation as read (FORBIDDEN if not a participant).
	markRead: protectedProcedure
		.route({
			method: "PUT",
			path: "/messaging/conversations/{conversationId}/read",
			tags: ["Messaging"],
			summary: "Mark a conversation as read",
		})
		.input(z.object({ conversationId: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await messagingService.markRead(context.user.id, input.conversationId);
		}),

	// Total unread messages across all my conversations (for nav badge).
	getUnreadCount: protectedProcedure
		.route({
			method: "GET",
			path: "/messaging/unread-count",
			tags: ["Messaging"],
			summary: "Total unread message count",
		})
		.output(z.number())
		.handler(async ({ context }) => {
			return await messagingService.getUnreadCount(context.user.id);
		}),
};
