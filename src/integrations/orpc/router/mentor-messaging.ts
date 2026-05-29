import z from "zod";
import { protectedProcedure } from "../context";
import { mentorMessagingService } from "../services/mentor-messaging";

// Schemas
const messageSchema = z.object({
	id: z.string(),
	senderId: z.string(),
	receiverId: z.string(),
	mentorConnectionId: z.string().nullable(),
	subject: z.string().nullable(),
	content: z.string(),
	isRead: z.boolean(),
	readAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	senderName: z.string().optional(),
	senderAvatar: z.string().nullable().optional(),
	receiverName: z.string().optional(),
	receiverAvatar: z.string().nullable().optional(),
});

const conversationSummarySchema = z.object({
	otherUserId: z.string(),
	otherUserName: z.string(),
	otherUserAvatar: z.string().nullable(),
	lastMessage: z.string(),
	lastMessageAt: z.coerce.date(),
	unreadCount: z.number(),
	isLastMessageFromMe: z.boolean(),
});

export const mentorMessagingRouter = {
	// Send a message
	sendMessage: protectedProcedure
		.route({
			method: "POST",
			path: "/mentor-messaging/messages",
			tags: ["Mentor Messaging"],
			summary: "Send a message to a user or mentor",
		})
		.input(
			z.object({
				receiverId: z.string().uuid(),
				subject: z.string().optional(),
				content: z.string().min(1, "Message content is required"),
				mentorConnectionId: z.string().optional(),
			}),
		)
		.output(z.string())
		.handler(async ({ context, input }) => {
			return await mentorMessagingService.sendMessage({
				senderId: context.user.id,
				receiverId: input.receiverId,
				subject: input.subject,
				content: input.content,
				mentorConnectionId: input.mentorConnectionId,
			});
		}),

	// Get conversation with another user
	getConversation: protectedProcedure
		.route({
			method: "GET",
			path: "/mentor-messaging/conversations/{otherUserId}",
			tags: ["Mentor Messaging"],
			summary: "Get message thread with another user",
		})
		.input(z.object({ otherUserId: z.string().uuid() }))
		.output(z.array(messageSchema))
		.handler(async ({ context, input }) => {
			return await mentorMessagingService.getConversation(context.user.id, input.otherUserId);
		}),

	// Get all conversations (inbox view)
	getConversations: protectedProcedure
		.route({
			method: "GET",
			path: "/mentor-messaging/conversations",
			tags: ["Mentor Messaging"],
			summary: "Get all conversation summaries",
		})
		.output(z.array(conversationSummarySchema))
		.handler(async ({ context }) => {
			return await mentorMessagingService.getConversations(context.user.id);
		}),

	// Get inbox (received messages)
	getInbox: protectedProcedure
		.route({
			method: "GET",
			path: "/mentor-messaging/inbox",
			tags: ["Mentor Messaging"],
			summary: "Get all received messages",
		})
		.output(z.array(messageSchema))
		.handler(async ({ context }) => {
			return await mentorMessagingService.getInbox(context.user.id);
		}),

	// Get sent messages
	getSent: protectedProcedure
		.route({
			method: "GET",
			path: "/mentor-messaging/sent",
			tags: ["Mentor Messaging"],
			summary: "Get all sent messages",
		})
		.output(z.array(messageSchema))
		.handler(async ({ context }) => {
			return await mentorMessagingService.getSent(context.user.id);
		}),

	// Mark message as read
	markAsRead: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentor-messaging/messages/{messageId}/read",
			tags: ["Mentor Messaging"],
			summary: "Mark a message as read",
		})
		.input(z.object({ messageId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorMessagingService.markAsRead(input.messageId, context.user.id);
		}),

	// Mark all messages in a conversation as read
	markConversationAsRead: protectedProcedure
		.route({
			method: "PUT",
			path: "/mentor-messaging/conversations/{otherUserId}/read",
			tags: ["Mentor Messaging"],
			summary: "Mark all messages in a conversation as read",
		})
		.input(z.object({ otherUserId: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorMessagingService.markConversationAsRead(context.user.id, input.otherUserId);
		}),

	// Get unread count
	getUnreadCount: protectedProcedure
		.route({
			method: "GET",
			path: "/mentor-messaging/unread-count",
			tags: ["Mentor Messaging"],
			summary: "Get count of unread messages",
		})
		.output(z.number())
		.handler(async ({ context }) => {
			return await mentorMessagingService.getUnreadCount(context.user.id);
		}),

	// Delete a message
	deleteMessage: protectedProcedure
		.route({
			method: "DELETE",
			path: "/mentor-messaging/messages/{messageId}",
			tags: ["Mentor Messaging"],
			summary: "Delete a message",
		})
		.input(z.object({ messageId: z.string() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			await mentorMessagingService.deleteMessage(input.messageId, context.user.id);
		}),
};
