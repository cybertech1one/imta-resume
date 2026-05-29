import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { ORPCError } from "@orpc/client";
import { generateText, Output } from "ai";
import { and, desc, eq, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { z } from "zod";
import voiceInterviewFeedbackSystemPrompt from "@/integrations/ai/prompts/voice-interview-feedback-system.md?raw";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	InterviewerPersona,
	VoiceInterviewFeedback,
	VoiceInterviewPanelist,
	VoiceInterviewSession,
	VoiceInterviewTranscriptMessage,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";
import { aiConfigService } from "./ai-config";
import { aiHistoryService } from "./ai-history";
import { aiQuotaService } from "./ai-quota";

// Schema for AI feedback output
const voiceInterviewFeedbackSchema = z.object({
	overallImpression: z.string(),
	overallImpressionFr: z.string(),
	categories: z.array(
		z.object({
			category: z.string(),
			categoryFr: z.string(),
			score: z.number().min(0).max(100),
			strengths: z.array(z.string()),
			areasForImprovement: z.array(z.string()),
			suggestions: z.array(z.string()),
		}),
	),
	keyTakeaways: z.array(z.string()),
	keyTakeawaysFr: z.array(z.string()),
	recommendedActions: z.array(z.string()),
	recommendedActionsFr: z.array(z.string()),
	panelistFeedback: z
		.array(
			z.object({
				personaId: z.string(),
				personaName: z.string(),
				score: z.number().min(0).max(100),
				feedback: z.string(),
				feedbackFr: z.string(),
			}),
		)
		.optional(),
});

// Helper to get AI model from config
function getModel(config: { provider: string; model: string; apiKey: string; baseURL?: string }) {
	return (
		match(config.provider)
			.with("openai", () => createOpenAI({ apiKey: config.apiKey, baseURL: config.baseURL || undefined })(config.model))
			.with("anthropic", () =>
				createAnthropic({ apiKey: config.apiKey, baseURL: config.baseURL || undefined })(config.model),
			)
			.with("google", () =>
				createGoogleGenerativeAI({ apiKey: config.apiKey, baseURL: config.baseURL || undefined })(config.model),
			)
			// Ollama uses OpenAI-compatible API
			.with("ollama", () =>
				createOpenAI({ apiKey: "ollama", baseURL: config.baseURL || "http://localhost:11434/v1" })(config.model),
			)
			.otherwise(() => createOpenAI({ apiKey: config.apiKey, baseURL: config.baseURL || undefined })(config.model))
	);
}

// ============================================
// TYPES
// ============================================

export type CreateSessionInput = {
	userId: string;
	type?: "single" | "panel";
	targetRole?: string;
	targetCompany?: string;
	difficulty?: "easy" | "medium" | "hard";
	language?: "fr" | "en" | "ar" | "darija";
	panelSize?: number;
	personaIds?: string[]; // Optional: specific personas to use
};

export type UpdateSessionStatusInput = {
	id: string;
	userId: string;
	status: "pending" | "in_progress" | "completed" | "cancelled";
	duration?: number;
	overallScore?: number;
	recordingUrl?: string;
};

export type SaveTranscriptInput = {
	id: string;
	userId: string;
	transcript: VoiceInterviewTranscriptMessage[];
};

export type AddPanelistInput = {
	sessionId: string;
	personaId: string;
	isLead?: boolean;
};

export type UpdatePanelistInput = {
	id: string;
	questionsAsked?: number;
	speakingTime?: number;
	score?: number;
	notes?: string;
};

// ============================================
// SERVICE
// ============================================

export const voiceInterviewService = {
	// ============================================
	// SESSIONS
	// ============================================

	sessions: {
		// Create a new voice interview session
		create: async (input: CreateSessionInput): Promise<VoiceInterviewSession> => {
			const id = generateId();
			const panelSize = input.type === "panel" ? (input.panelSize ?? 3) : 1;

			await db.insert(schema.voiceInterviewSession).values({
				id,
				userId: input.userId,
				type: input.type ?? "single",
				targetRole: input.targetRole,
				targetCompany: input.targetCompany,
				difficulty: input.difficulty ?? "medium",
				language: input.language ?? "fr",
				panelSize,
				status: "pending",
				transcript: [],
				feedback: null,
			});

			// If specific personas requested, add them as panelists
			if (input.personaIds && input.personaIds.length > 0) {
				const panelistValues = input.personaIds.slice(0, panelSize).map((personaId, index) => ({
					id: generateId(),
					sessionId: id,
					personaId,
					isLead: index === 0,
					questionsAsked: 0,
					speakingTime: 0,
				}));

				await db.insert(schema.voiceInterviewPanelist).values(panelistValues);
			} else {
				// Auto-select personas based on panel size
				const activePersonas = await db
					.select()
					.from(schema.interviewerPersona)
					.where(eq(schema.interviewerPersona.isActive, true))
					.orderBy(schema.interviewerPersona.sortOrder)
					.limit(panelSize);

				if (activePersonas.length > 0) {
					const panelistValues = activePersonas.map((persona, index) => ({
						id: generateId(),
						sessionId: id,
						personaId: persona.id,
						isLead: index === 0,
						questionsAsked: 0,
						speakingTime: 0,
					}));

					await db.insert(schema.voiceInterviewPanelist).values(panelistValues);
				}
			}

			const [session] = await db
				.select()
				.from(schema.voiceInterviewSession)
				.where(eq(schema.voiceInterviewSession.id, id));

			return session;
		},

		// Get session by ID
		getById: async (input: { id: string; userId: string }): Promise<VoiceInterviewSession> => {
			const [session] = await db
				.select()
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!session) {
				throw new ORPCError("NOT_FOUND", { message: "Voice interview session not found" });
			}

			return session;
		},

		// List sessions for user
		list: async (input: {
			userId: string;
			status?: "pending" | "in_progress" | "completed" | "cancelled";
			type?: "single" | "panel";
			limit?: number;
			offset?: number;
		}): Promise<{ items: VoiceInterviewSession[]; total: number }> => {
			const conditions = [eq(schema.voiceInterviewSession.userId, input.userId)];

			if (input.status) {
				conditions.push(eq(schema.voiceInterviewSession.status, input.status));
			}
			if (input.type) {
				conditions.push(eq(schema.voiceInterviewSession.type, input.type));
			}

			const [countResult] = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.voiceInterviewSession)
				.where(and(...conditions));

			const items = await db
				.select()
				.from(schema.voiceInterviewSession)
				.where(and(...conditions))
				.orderBy(desc(schema.voiceInterviewSession.createdAt))
				.limit(input.limit ?? 50)
				.offset(input.offset ?? 0);

			return {
				items,
				total: countResult?.count ?? 0,
			};
		},

		// Update session status
		updateStatus: async (input: UpdateSessionStatusInput): Promise<VoiceInterviewSession> => {
			const [existing] = await db
				.select({ id: schema.voiceInterviewSession.id })
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Voice interview session not found" });
			}

			const updateData: Partial<VoiceInterviewSession> = {
				status: input.status,
			};

			if (input.status === "in_progress") {
				updateData.startedAt = new Date();
			} else if (input.status === "completed" || input.status === "cancelled") {
				updateData.completedAt = new Date();
			}

			if (input.duration !== undefined) {
				updateData.duration = input.duration;
			}
			if (input.overallScore !== undefined) {
				updateData.overallScore = input.overallScore;
			}
			if (input.recordingUrl !== undefined) {
				updateData.recordingUrl = input.recordingUrl;
			}

			await db
				.update(schema.voiceInterviewSession)
				.set(updateData)
				.where(eq(schema.voiceInterviewSession.id, input.id));

			return await voiceInterviewService.sessions.getById({ id: input.id, userId: input.userId });
		},

		// Save transcript
		saveTranscript: async (input: SaveTranscriptInput): Promise<VoiceInterviewSession> => {
			const [existing] = await db
				.select({ id: schema.voiceInterviewSession.id })
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Voice interview session not found" });
			}

			await db
				.update(schema.voiceInterviewSession)
				.set({ transcript: input.transcript })
				.where(eq(schema.voiceInterviewSession.id, input.id));

			return await voiceInterviewService.sessions.getById({ id: input.id, userId: input.userId });
		},

		// Save feedback
		saveFeedback: async (input: {
			id: string;
			userId: string;
			feedback: VoiceInterviewFeedback;
			overallScore?: number;
		}): Promise<VoiceInterviewSession> => {
			const [existing] = await db
				.select({ id: schema.voiceInterviewSession.id })
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Voice interview session not found" });
			}

			await db
				.update(schema.voiceInterviewSession)
				.set({
					feedback: input.feedback,
					overallScore: input.overallScore,
				})
				.where(eq(schema.voiceInterviewSession.id, input.id));

			return await voiceInterviewService.sessions.getById({ id: input.id, userId: input.userId });
		},

		// Delete session
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const sessions = await db
				.select()
				.from(schema.voiceInterviewSession)
				.where(eq(schema.voiceInterviewSession.userId, input.userId));

			const completed = sessions.filter((s) => s.status === "completed");
			const avgScore =
				completed.length > 0
					? Math.round(completed.reduce((acc, s) => acc + (s.overallScore ?? 0), 0) / completed.length)
					: 0;
			const totalDuration = completed.reduce((acc, s) => acc + (s.duration ?? 0), 0);

			const panelSessions = sessions.filter((s) => s.type === "panel").length;
			const singleSessions = sessions.filter((s) => s.type === "single").length;

			return {
				total: sessions.length,
				completed: completed.length,
				inProgress: sessions.filter((s) => s.status === "in_progress").length,
				avgScore,
				totalDuration,
				panelSessions,
				singleSessions,
			};
		},

		// ============================================
		// SESSION CACHING (Cost Optimization)
		// ============================================

		// Cache realtime token for a session
		cacheToken: async (input: { id: string; userId: string; token: string; expiresAt: Date }): Promise<void> => {
			await db
				.update(schema.voiceInterviewSession)
				.set({
					realtimeToken: input.token,
					realtimeTokenExpiresAt: input.expiresAt,
				})
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);
		},

		// Get cached token if still valid
		getCachedToken: async (input: {
			id: string;
			userId: string;
		}): Promise<{ token: string; expiresAt: Date } | null> => {
			const [session] = await db
				.select({
					token: schema.voiceInterviewSession.realtimeToken,
					expiresAt: schema.voiceInterviewSession.realtimeTokenExpiresAt,
				})
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!session?.token || !session?.expiresAt) return null;

			// Check if token is still valid (with 5 minute buffer)
			const bufferMs = 5 * 60 * 1000; // 5 minutes
			if (new Date(session.expiresAt).getTime() - bufferMs < Date.now()) {
				return null; // Token expired or about to expire
			}

			return {
				token: session.token,
				expiresAt: session.expiresAt,
			};
		},

		// ============================================
		// PAUSE/RESUME (Resumable Sessions)
		// ============================================

		// Pause a session (save state for later resume)
		pause: async (input: {
			id: string;
			userId: string;
			currentQuestionIndex?: number;
			sessionState?: Record<string, unknown>;
		}): Promise<VoiceInterviewSession> => {
			const [existing] = await db
				.select({ id: schema.voiceInterviewSession.id, status: schema.voiceInterviewSession.status })
				.from(schema.voiceInterviewSession)
				.where(
					and(eq(schema.voiceInterviewSession.id, input.id), eq(schema.voiceInterviewSession.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Voice interview session not found" });
			}

			if (existing.status !== "in_progress") {
				throw new ORPCError("BAD_REQUEST", { message: "Can only pause an in-progress session" });
			}

			await db
				.update(schema.voiceInterviewSession)
				.set({
					status: "pending", // Mark as paused (pending with pausedAt)
					pausedAt: new Date(),
					currentQuestionIndex: input.currentQuestionIndex ?? 0,
					sessionState: input.sessionState,
				})
				.where(eq(schema.voiceInterviewSession.id, input.id));

			return await voiceInterviewService.sessions.getById({ id: input.id, userId: input.userId });
		},

		// Resume a paused session
		resume: async (input: {
			id: string;
			userId: string;
		}): Promise<{ session: VoiceInterviewSession; canReuse: boolean }> => {
			const session = await voiceInterviewService.sessions.getById(input);

			if (!session.pausedAt) {
				throw new ORPCError("BAD_REQUEST", { message: "Session was not paused" });
			}

			// Check if we can reuse the cached token
			const cachedToken = await voiceInterviewService.sessions.getCachedToken(input);
			const canReuse = cachedToken !== null;

			// Update session status back to in_progress
			await db
				.update(schema.voiceInterviewSession)
				.set({
					status: "in_progress",
					pausedAt: null, // Clear paused state
				})
				.where(eq(schema.voiceInterviewSession.id, input.id));

			const updatedSession = await voiceInterviewService.sessions.getById(input);

			return {
				session: updatedSession,
				canReuse,
			};
		},

		// Get resumable sessions (paused sessions that can be continued)
		getResumable: async (input: { userId: string }): Promise<VoiceInterviewSession[]> => {
			return await db
				.select()
				.from(schema.voiceInterviewSession)
				.where(
					and(
						eq(schema.voiceInterviewSession.userId, input.userId),
						eq(schema.voiceInterviewSession.status, "pending"),
						sql`${schema.voiceInterviewSession.pausedAt} IS NOT NULL`,
					),
				)
				.orderBy(desc(schema.voiceInterviewSession.pausedAt));
		},
	},

	// ============================================
	// PERSONAS
	// ============================================

	personas: {
		// Get all personas
		list: async (input?: { activeOnly?: boolean }): Promise<InterviewerPersona[]> => {
			const conditions = [];
			if (input?.activeOnly !== false) {
				conditions.push(eq(schema.interviewerPersona.isActive, true));
			}

			const personas = await db
				.select()
				.from(schema.interviewerPersona)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(schema.interviewerPersona.sortOrder);

			return personas;
		},

		// Get persona by ID
		getById: async (id: string): Promise<InterviewerPersona> => {
			const [persona] = await db.select().from(schema.interviewerPersona).where(eq(schema.interviewerPersona.id, id));

			if (!persona) {
				throw new ORPCError("NOT_FOUND", { message: "Interviewer persona not found" });
			}

			return persona;
		},

		// Create persona (admin)
		create: async (input: Omit<InterviewerPersona, "createdAt" | "updatedAt">): Promise<InterviewerPersona> => {
			await db.insert(schema.interviewerPersona).values(input);

			return await voiceInterviewService.personas.getById(input.id);
		},

		// Update persona (admin)
		update: async (input: Partial<InterviewerPersona> & { id: string }): Promise<InterviewerPersona> => {
			const [existing] = await db
				.select({ id: schema.interviewerPersona.id })
				.from(schema.interviewerPersona)
				.where(eq(schema.interviewerPersona.id, input.id));

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Interviewer persona not found" });
			}

			const { id, ...updateData } = input;
			await db.update(schema.interviewerPersona).set(updateData).where(eq(schema.interviewerPersona.id, id));

			return await voiceInterviewService.personas.getById(id);
		},

		// Delete persona (admin)
		delete: async (id: string): Promise<void> => {
			await db.delete(schema.interviewerPersona).where(eq(schema.interviewerPersona.id, id));
		},
	},

	// ============================================
	// PANELISTS
	// ============================================

	panelists: {
		// Get panelists for a session
		getForSession: async (sessionId: string): Promise<(VoiceInterviewPanelist & { persona: InterviewerPersona })[]> => {
			const results = await db
				.select()
				.from(schema.voiceInterviewPanelist)
				.innerJoin(schema.interviewerPersona, eq(schema.voiceInterviewPanelist.personaId, schema.interviewerPersona.id))
				.where(eq(schema.voiceInterviewPanelist.sessionId, sessionId))
				.orderBy(desc(schema.voiceInterviewPanelist.isLead), schema.interviewerPersona.sortOrder);

			return results.map((r) => ({
				...r.voice_interview_panelist,
				persona: r.interviewer_persona,
			}));
		},

		// Add panelist to session
		add: async (input: AddPanelistInput): Promise<VoiceInterviewPanelist> => {
			const id = generateId();

			await db.insert(schema.voiceInterviewPanelist).values({
				id,
				sessionId: input.sessionId,
				personaId: input.personaId,
				isLead: input.isLead ?? false,
				questionsAsked: 0,
				speakingTime: 0,
			});

			const [panelist] = await db
				.select()
				.from(schema.voiceInterviewPanelist)
				.where(eq(schema.voiceInterviewPanelist.id, id));

			return panelist;
		},

		// Update panelist stats
		update: async (input: UpdatePanelistInput): Promise<VoiceInterviewPanelist> => {
			const { id, ...updateData } = input;

			await db.update(schema.voiceInterviewPanelist).set(updateData).where(eq(schema.voiceInterviewPanelist.id, id));

			const [panelist] = await db
				.select()
				.from(schema.voiceInterviewPanelist)
				.where(eq(schema.voiceInterviewPanelist.id, id));

			if (!panelist) {
				throw new ORPCError("NOT_FOUND", { message: "Panelist not found" });
			}

			return panelist;
		},

		// Remove panelist from session
		remove: async (id: string): Promise<void> => {
			await db.delete(schema.voiceInterviewPanelist).where(eq(schema.voiceInterviewPanelist.id, id));
		},

		// SECURITY: Verify that a panelist belongs to a session owned by the given user
		verifyOwnership: async (panelistId: string, userId: string): Promise<void> => {
			const [result] = await db
				.select({ sessionId: schema.voiceInterviewPanelist.sessionId })
				.from(schema.voiceInterviewPanelist)
				.where(eq(schema.voiceInterviewPanelist.id, panelistId))
				.limit(1);

			if (!result) {
				throw new ORPCError("NOT_FOUND", { message: "Panelist not found" });
			}

			// Verify the session belongs to the user (will throw NOT_FOUND if not)
			await voiceInterviewService.sessions.getById({
				id: result.sessionId,
				userId,
			});
		},
	},

	// ============================================
	// AI FEEDBACK GENERATION
	// ============================================

	feedback: {
		// Generate AI feedback for a session using the configured AI provider
		generate: async (input: { sessionId: string; userId: string }): Promise<VoiceInterviewFeedback> => {
			const session = await voiceInterviewService.sessions.getById({
				id: input.sessionId,
				userId: input.userId,
			});

			if (!session.transcript || session.transcript.length === 0) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "Cannot generate feedback without a transcript",
				});
			}

			// Check AI quota
			const quotaCheck = await aiQuotaService.checkQuota(input.userId, "voice_interview_feedback");
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}

			// Get AI provider config
			let config: Awaited<ReturnType<typeof aiConfigService.getActiveProvider>>;
			try {
				config = await aiConfigService.getActiveProvider();
			} catch {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "No AI provider configured. Please ask an administrator to set up AI.",
				});
			}

			const model = getModel({
				provider: config.provider,
				model: config.model,
				apiKey: config.apiKey,
				baseURL: config.baseUrl || "",
			});

			// Get panelists for panel-specific feedback
			const panelists = await voiceInterviewService.panelists.getForSession(input.sessionId);

			// Format transcript for AI
			const transcriptText = session.transcript
				.map(
					(msg: VoiceInterviewTranscriptMessage) =>
						`[${msg.role.toUpperCase()}${msg.personaName ? ` - ${msg.personaName}` : ""}]: ${msg.content}`,
				)
				.join("\n");

			// Build panelist info for AI context
			const panelistInfo =
				panelists.length > 0
					? `\nInterviewers:\n${panelists.map((p) => `- ${p.persona.name} (${p.persona.role}): ${p.persona.bio || "No bio"}`).join("\n")}`
					: "";

			const startTime = Date.now();

			try {
				const result = await generateText({
					model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 2000,
					output: Output.object({ schema: voiceInterviewFeedbackSchema }),
					messages: [
						{
							role: "system",
							content: voiceInterviewFeedbackSystemPrompt,
						},
						{
							role: "user",
							content: `Analyze this voice interview session and provide comprehensive feedback:

Session Details:
- Type: ${session.type === "panel" ? "Panel Interview" : "Single Interviewer"}
- Target Role: ${session.targetRole || "Not specified"}
- Target Company: ${session.targetCompany || "Not specified"}
- Difficulty: ${session.difficulty}
- Language: ${session.language}
- Duration: ${session.duration ? `${Math.round(session.duration / 60)} minutes` : "Not recorded"}
${panelistInfo}

Interview Transcript:
${transcriptText}

Provide detailed feedback in both English and French. For panel interviews, include individual feedback for each interviewer.`,
						},
					],
				});

				// Parse the AI response
				const aiFeedback = voiceInterviewFeedbackSchema.parse(result.output);

				// Build the final feedback object
				const feedback: VoiceInterviewFeedback = {
					overallImpression: aiFeedback.overallImpression,
					overallImpressionFr: aiFeedback.overallImpressionFr,
					categories: aiFeedback.categories.map((cat) => ({
						category: cat.category,
						categoryFr: cat.categoryFr,
						score: cat.score,
						strengths: cat.strengths,
						areasForImprovement: cat.areasForImprovement,
						suggestions: cat.suggestions,
					})),
					keyTakeaways: aiFeedback.keyTakeaways,
					keyTakeawaysFr: aiFeedback.keyTakeawaysFr,
					recommendedActions: aiFeedback.recommendedActions,
					recommendedActionsFr: aiFeedback.recommendedActionsFr,
				};

				// Add panelist-specific feedback if available
				if (aiFeedback.panelistFeedback && aiFeedback.panelistFeedback.length > 0) {
					feedback.panelistFeedback = aiFeedback.panelistFeedback;
				} else if (panelists.length > 0) {
					// Generate panelist feedback based on categories if AI didn't provide specific ones
					feedback.panelistFeedback = panelists.map((p) => {
						const avgScore = Math.round(
							feedback.categories.reduce((acc, c) => acc + c.score, 0) / feedback.categories.length,
						);
						return {
							personaId: p.personaId,
							personaName: p.persona.name,
							score: avgScore + Math.floor(Math.random() * 10) - 5, // Slight variation
							feedback: `${p.persona.name} evaluated your performance based on their expertise in ${p.persona.focusAreas?.join(", ") || "general interview skills"}.`,
							feedbackFr: `${p.persona.nameFr || p.persona.name} a evalue votre performance en fonction de son expertise en ${p.persona.focusAreas?.join(", ") || "competences generales d'entretien"}.`,
						};
					});
				}

				// Calculate overall score
				const overallScore = Math.round(
					feedback.categories.reduce((acc, c) => acc + c.score, 0) / feedback.categories.length,
				);

				// Log usage
				const duration = Date.now() - startTime;
				await aiQuotaService.logUsage({
					userId: input.userId,
					feature: "voice_interview_feedback",
					provider: config.provider,
					model: config.model,
					inputTokens: result.usage?.inputTokens || 0,
					outputTokens: result.usage?.outputTokens || 0,
					totalTokens: result.usage?.totalTokens || 0,
					durationMs: duration,
					status: "success",
				});

				// Save feedback to session
				await voiceInterviewService.sessions.saveFeedback({
					id: input.sessionId,
					userId: input.userId,
					feedback,
					overallScore,
				});

				aiHistoryService
					.save({
						userId: input.userId,
						source: "voice_interview",
						generatedContent: JSON.stringify(feedback),
						inputData: {
							sessionId: input.sessionId,
							type: session.type,
							targetRole: session.targetRole,
							difficulty: session.difficulty,
						},
						metadata: {
							model: config.model,
							provider: config.provider,
							tokens: result.usage
								? {
										input: result.usage.inputTokens ?? 0,
										output: result.usage.outputTokens ?? 0,
										total: result.usage.totalTokens ?? 0,
									}
								: undefined,
						},
					})
					.catch((err) => console.error("[AI History] Failed to save voice_interview:", err));

				return feedback;
			} catch (error) {
				// Log error usage
				const duration = Date.now() - startTime;
				await aiQuotaService.logUsage({
					userId: input.userId,
					feature: "voice_interview_feedback",
					provider: config.provider,
					model: config.model,
					durationMs: duration,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
				});

				// Re-throw with appropriate error
				if (error instanceof ORPCError) throw error;
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to generate feedback. Please try again.",
				});
			}
		},
	},

	// ============================================
	// SEEDING
	// ============================================

	seed: {
		// Seed default interviewer personas with diverse voices and personalities
		seedPersonas: async (): Promise<InterviewerPersona[]> => {
			const defaultPersonas: Omit<InterviewerPersona, "createdAt" | "updatedAt">[] = [
				// HR Manager - Friendly and supportive
				{
					id: "persona_hr_sarah",
					name: "Sarah Mitchell",
					nameFr: "Sarah Mitchell",
					role: "HR Manager",
					roleFr: "Responsable RH",
					personality: "friendly",
					voiceId: "nova",
					avatar: null,
					speakingStyle: "conversational",
					focusAreas: ["behavioral", "cultural", "communication"],
					sampleQuestions: [
						{
							question: "Tell me about yourself and what brought you to apply for this position.",
							questionFr: "Parlez-moi de vous et de ce qui vous a pousse a postuler pour ce poste.",
							type: "behavioral",
							difficulty: "easy",
						},
						{
							question: "Describe a situation where you had to work with a difficult colleague. How did you handle it?",
							questionFr:
								"Decrivez une situation ou vous avez du travailler avec un collegue difficile. Comment l'avez-vous geree?",
							type: "behavioral",
							difficulty: "medium",
						},
						{
							question: "What are your salary expectations for this role?",
							questionFr: "Quelles sont vos attentes salariales pour ce poste?",
							type: "behavioral",
							difficulty: "medium",
						},
					],
					systemPrompt: `You are Sarah Mitchell, a friendly and experienced HR Manager with 12 years of experience. You conduct interviews with warmth while still being professional. You focus on understanding candidates' motivations, cultural fit, and soft skills. You ask behavioral questions and listen carefully to how candidates describe their experiences. You are supportive but also thorough in your assessment.`,
					bio: "Sarah has been in HR for over 12 years, specializing in talent acquisition for growing companies. She believes in finding the right cultural fit and helping candidates feel comfortable during interviews.",
					bioFr:
						"Sarah est dans les RH depuis plus de 12 ans, specialisee dans l'acquisition de talents pour des entreprises en croissance. Elle croit en la recherche du bon fit culturel et aide les candidats a se sentir a l'aise pendant les entretiens.",
					yearsExperience: 12,
					industry: "General",
					isActive: true,
					sortOrder: 1,
				},
				// Technical Lead - Analytical and thorough
				{
					id: "persona_tech_marcus",
					name: "Dr. Marcus Chen",
					nameFr: "Dr. Marcus Chen",
					role: "Technical Lead",
					roleFr: "Responsable Technique",
					personality: "analytical",
					voiceId: "onyx",
					avatar: null,
					speakingStyle: "technical",
					focusAreas: ["technical", "problem_solving", "leadership"],
					sampleQuestions: [
						{
							question: "Can you walk me through a complex technical problem you solved recently?",
							questionFr: "Pouvez-vous me decrire un probleme technique complexe que vous avez resolu recemment?",
							type: "technical",
							difficulty: "hard",
						},
						{
							question: "How do you approach debugging when you encounter an issue you've never seen before?",
							questionFr:
								"Comment abordez-vous le debogage lorsque vous rencontrez un probleme que vous n'avez jamais vu?",
							type: "technical",
							difficulty: "medium",
						},
						{
							question: "Tell me about a time you had to make a critical technical decision under pressure.",
							questionFr:
								"Parlez-moi d'une fois ou vous avez du prendre une decision technique critique sous pression.",
							type: "situational",
							difficulty: "hard",
						},
					],
					systemPrompt: `You are Dr. Marcus Chen, a highly experienced Technical Lead with a PhD in Computer Science and 15 years of industry experience. You ask probing technical questions to understand the depth of a candidate's knowledge. You appreciate clear thinking and problem-solving approaches. You may ask follow-up questions to dig deeper into technical concepts.`,
					bio: "Marcus holds a PhD in Computer Science and has led technical teams at several Fortune 500 companies. He values deep technical understanding and clear problem-solving methodologies.",
					bioFr:
						"Marcus est titulaire d'un doctorat en informatique et a dirige des equipes techniques dans plusieurs entreprises du Fortune 500. Il valorise la comprehension technique approfondie et les methodologies claires de resolution de problemes.",
					yearsExperience: 15,
					industry: "Technology",
					isActive: true,
					sortOrder: 2,
				},
				// CEO - Challenging and strategic
				{
					id: "persona_ceo_amelia",
					name: "Amelia Rodriguez",
					nameFr: "Amelia Rodriguez",
					role: "CEO",
					roleFr: "PDG",
					personality: "challenging",
					voiceId: "shimmer",
					avatar: null,
					speakingStyle: "formal",
					focusAreas: ["leadership", "cultural", "problem_solving"],
					sampleQuestions: [
						{
							question: "Where do you see yourself in 5 years, and how does this role fit into that vision?",
							questionFr: "Ou vous voyez-vous dans 5 ans, et comment ce poste s'inscrit-il dans cette vision?",
							type: "behavioral",
							difficulty: "medium",
						},
						{
							question: "Tell me about a time you fundamentally disagreed with a company decision. What did you do?",
							questionFr:
								"Parlez-moi d'une fois ou vous etiez fondamentalement en desaccord avec une decision d'entreprise. Qu'avez-vous fait?",
							type: "situational",
							difficulty: "hard",
						},
						{
							question: "What would you do in your first 90 days if you were hired for this position?",
							questionFr: "Que feriez-vous pendant vos 90 premiers jours si vous etiez embauche pour ce poste?",
							type: "situational",
							difficulty: "medium",
						},
					],
					systemPrompt: `You are Amelia Rodriguez, a successful CEO who has built and scaled multiple companies. You ask challenging questions to test how candidates think strategically and handle pressure. You look for vision, leadership potential, and alignment with company values. You are direct but fair in your questioning.`,
					bio: "Amelia has founded and scaled three successful startups. She looks for candidates who think strategically and can articulate their vision clearly.",
					bioFr:
						"Amelia a fonde et developpe trois startups a succes. Elle recherche des candidats qui pensent strategiquement et peuvent articuler clairement leur vision.",
					yearsExperience: 20,
					industry: "General",
					isActive: true,
					sortOrder: 3,
				},
				// Team Member - Supportive and practical
				{
					id: "persona_team_james",
					name: "James O'Brien",
					nameFr: "James O'Brien",
					role: "Team Member",
					roleFr: "Membre de l'Equipe",
					personality: "supportive",
					voiceId: "fable",
					avatar: null,
					speakingStyle: "casual",
					focusAreas: ["cultural", "communication", "behavioral"],
					sampleQuestions: [
						{
							question: "What's your preferred way of working with a team?",
							questionFr: "Quelle est votre facon preferee de travailler en equipe?",
							type: "behavioral",
							difficulty: "easy",
						},
						{
							question: "How do you handle it when you disagree with a teammate's approach?",
							questionFr:
								"Comment gerez-vous les situations ou vous etes en desaccord avec l'approche d'un coequipier?",
							type: "situational",
							difficulty: "medium",
						},
						{
							question: "What kind of team environment helps you do your best work?",
							questionFr: "Quel type d'environnement d'equipe vous aide a donner le meilleur de vous-meme?",
							type: "cultural",
							difficulty: "easy",
						},
					],
					systemPrompt: `You are James O'Brien, a senior team member who has been with the company for 5 years. You want to understand how well the candidate would fit into the team and collaborate with others. You ask practical questions about day-to-day work and team dynamics. You are friendly and make candidates feel at ease.`,
					bio: "James is a senior team member known for his collaborative approach. He helps ensure new hires will work well with the existing team.",
					bioFr:
						"James est un membre senior de l'equipe connu pour son approche collaborative. Il aide a s'assurer que les nouvelles recrues s'integreront bien a l'equipe existante.",
					yearsExperience: 5,
					industry: "General",
					isActive: true,
					sortOrder: 4,
				},
				// Department Head - Serious and results-focused
				{
					id: "persona_dept_fatima",
					name: "Dr. Fatima Al-Hassan",
					nameFr: "Dr. Fatima Al-Hassan",
					role: "Department Head",
					roleFr: "Chef de Departement",
					personality: "serious",
					voiceId: "sage",
					avatar: null,
					speakingStyle: "formal",
					focusAreas: ["technical", "leadership", "problem_solving"],
					sampleQuestions: [
						{
							question: "What metrics do you use to measure your own success?",
							questionFr: "Quels indicateurs utilisez-vous pour mesurer votre propre succes?",
							type: "behavioral",
							difficulty: "medium",
						},
						{
							question: "Describe a project where you had to manage competing priorities with limited resources.",
							questionFr:
								"Decrivez un projet ou vous avez du gerer des priorites concurrentes avec des ressources limitees.",
							type: "situational",
							difficulty: "hard",
						},
						{
							question: "How do you stay current with developments in your field?",
							questionFr: "Comment restez-vous a jour avec les developpements dans votre domaine?",
							type: "technical",
							difficulty: "easy",
						},
					],
					systemPrompt: `You are Dr. Fatima Al-Hassan, a Department Head with a strong track record of building high-performing teams. You are serious and focused on results. You ask questions that reveal a candidate's ability to deliver outcomes and manage complexity. You value precision in answers.`,
					bio: "Dr. Fatima leads a department of 50+ professionals. She is known for her results-oriented approach and has received multiple awards for team excellence.",
					bioFr:
						"Dr. Fatima dirige un departement de plus de 50 professionnels. Elle est connue pour son approche axee sur les resultats et a recu plusieurs prix pour l'excellence de son equipe.",
					yearsExperience: 18,
					industry: "Healthcare",
					isActive: true,
					sortOrder: 5,
				},
				// Recruiter - Friendly and efficient
				{
					id: "persona_recruiter_omar",
					name: "Omar Benali",
					nameFr: "Omar Benali",
					role: "Recruiter",
					roleFr: "Recruteur",
					personality: "friendly",
					voiceId: "echo",
					avatar: null,
					speakingStyle: "conversational",
					focusAreas: ["behavioral", "cultural", "communication"],
					sampleQuestions: [
						{
							question: "What motivated you to apply for this specific position?",
							questionFr: "Qu'est-ce qui vous a motive a postuler pour ce poste specifique?",
							type: "behavioral",
							difficulty: "easy",
						},
						{
							question: "Can you tell me about your availability and notice period?",
							questionFr: "Pouvez-vous me parler de votre disponibilite et de votre preavis?",
							type: "behavioral",
							difficulty: "easy",
						},
						{
							question: "What questions do you have for us about the role or company?",
							questionFr: "Quelles questions avez-vous pour nous concernant le poste ou l'entreprise?",
							type: "cultural",
							difficulty: "easy",
						},
					],
					systemPrompt: `You are Omar Benali, an experienced recruiter who specializes in finding the best talent. You are friendly and efficient, making sure to cover all the essential screening questions while keeping candidates comfortable. You explain the process clearly and set expectations.`,
					bio: "Omar has recruited for companies across Morocco and Europe. He prides himself on matching the right candidates with the right opportunities.",
					bioFr:
						"Omar a recrute pour des entreprises au Maroc et en Europe. Il est fier de faire correspondre les bons candidats avec les bonnes opportunites.",
					yearsExperience: 8,
					industry: "General",
					isActive: true,
					sortOrder: 6,
				},
			];

			// Insert personas (ignore conflicts for idempotency)
			for (const persona of defaultPersonas) {
				try {
					await db.insert(schema.interviewerPersona).values(persona).onConflictDoNothing();
				} catch {
					// Ignore duplicate key errors
				}
			}

			return await voiceInterviewService.personas.list({ activeOnly: false });
		},
	},
};
