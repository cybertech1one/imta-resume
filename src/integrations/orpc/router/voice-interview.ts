import { ORPCError } from "@orpc/server";
import z from "zod";
import { logger } from "@/utils/logger";
import { adminProcedure, protectedProcedure, publicProcedure } from "../context";
import { aiConfigService } from "../services/ai-config";
import { voiceInterviewService } from "../services/voice-interview";

// ============================================
// SHARED SCHEMAS
// ============================================

/**
 * OpenAI Realtime API Voice IDs (extended for panel)
 */
const voiceIdSchema = z.enum([
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
	"coral",
	"sage",
	"ash",
	"ballad",
	"verse",
]);

const voiceInterviewTypeSchema = z.enum(["single", "panel"]);
const voiceInterviewStatusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
const voiceInterviewDifficultySchema = z.enum(["easy", "medium", "hard"]);
const voiceInterviewLanguageSchema = z.enum(["fr", "en", "ar", "darija"]);
const interviewerPersonalitySchema = z.enum(["friendly", "serious", "challenging", "supportive", "analytical"]);
const speakingStyleSchema = z.enum(["formal", "casual", "technical", "conversational"]);

const transcriptMessageSchema = z.object({
	id: z.string(),
	role: z.enum(["user", "interviewer"]),
	personaId: z.string().optional(),
	personaName: z.string().optional(),
	content: z.string(),
	timestamp: z.string(),
	duration: z.number().optional(),
	audioUrl: z.string().optional(),
});

const feedbackCategorySchema = z.object({
	category: z.string(),
	categoryFr: z.string().optional(),
	score: z.number(),
	strengths: z.array(z.string()),
	areasForImprovement: z.array(z.string()),
	suggestions: z.array(z.string()),
});

const panelistFeedbackSchema = z.object({
	personaId: z.string(),
	personaName: z.string(),
	score: z.number(),
	feedback: z.string(),
	feedbackFr: z.string().optional(),
});

const feedbackSchema = z.object({
	overallImpression: z.string(),
	overallImpressionFr: z.string().optional(),
	categories: z.array(feedbackCategorySchema),
	keyTakeaways: z.array(z.string()),
	keyTakeawaysFr: z.array(z.string()).optional(),
	recommendedActions: z.array(z.string()),
	recommendedActionsFr: z.array(z.string()).optional(),
	panelistFeedback: z.array(panelistFeedbackSchema).optional(),
});

const sampleQuestionSchema = z.object({
	question: z.string(),
	questionFr: z.string().optional(),
	type: z.enum(["behavioral", "technical", "situational", "cultural", "follow_up"]),
	difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const sessionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	type: voiceInterviewTypeSchema,
	targetRole: z.string().nullable(),
	targetCompany: z.string().nullable(),
	difficulty: voiceInterviewDifficultySchema.nullable(),
	language: voiceInterviewLanguageSchema.nullable(),
	panelSize: z.number().nullable(),
	status: voiceInterviewStatusSchema.nullable(),
	duration: z.number().nullable(),
	overallScore: z.number().nullable(),
	transcript: z.array(transcriptMessageSchema).nullable(),
	feedback: feedbackSchema.nullable(),
	recordingUrl: z.string().nullable(),
	startedAt: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const personaSchema = z.object({
	id: z.string(),
	name: z.string(),
	nameFr: z.string().nullable(),
	role: z.string(),
	roleFr: z.string().nullable(),
	personality: interviewerPersonalitySchema,
	voiceId: z.string(),
	avatar: z.string().nullable(),
	speakingStyle: speakingStyleSchema.nullable(),
	focusAreas: z.array(z.string()).nullable(),
	sampleQuestions: z.array(sampleQuestionSchema).nullable(),
	systemPrompt: z.string().nullable(),
	bio: z.string().nullable(),
	bioFr: z.string().nullable(),
	yearsExperience: z.number().nullable(),
	industry: z.string().nullable(),
	isActive: z.boolean(),
	sortOrder: z.number().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const panelistSchema = z.object({
	id: z.string(),
	sessionId: z.string(),
	personaId: z.string(),
	isLead: z.boolean(),
	questionsAsked: z.number(),
	speakingTime: z.number(),
	score: z.number().nullable(),
	notes: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const panelistWithPersonaSchema = panelistSchema.extend({
	persona: personaSchema,
});

/**
 * Request schema for getting an ephemeral token
 */
const getTokenInputSchema = z.object({
	sessionId: z.string().min(1, "Session ID is required"),
	voiceId: voiceIdSchema.default("alloy"),
	language: z.enum(["en", "fr", "ar", "darija"]).default("en"),
	personaId: z.string().optional(), // Optional: specific persona for panel interviews
});

/**
 * Response schema for ephemeral token
 */
const tokenResponseSchema = z.object({
	token: z.string(),
	expiresAt: z.string(),
});

// ============================================
// REALTIME API ROUTER (Token/Availability)
// ============================================

const realtimeRouter = {
	/**
	 * Get an ephemeral token for WebRTC connection to OpenAI Realtime API
	 */
	getToken: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/token",
			tags: ["Voice Interview"],
			summary: "Get ephemeral token for WebRTC connection",
			description:
				"Creates an ephemeral token for establishing a WebRTC connection with OpenAI Realtime API for voice interviews.",
		})
		.input(getTokenInputSchema)
		.output(tokenResponseSchema)
		.handler(async ({ context, input }) => {
			// Get OpenAI API key from server-side configuration
			const openaiProviders = await aiConfigService.getByProvider("openai");
			const openaiProvider = openaiProviders.find((p) => p.isEnabled);

			if (!openaiProvider) {
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "OpenAI provider is not configured. Please contact an administrator.",
				});
			}

			// Build instructions based on persona if provided
			let instructions = buildBaseInstructions(input.language);
			if (input.personaId) {
				try {
					const persona = await voiceInterviewService.personas.getById(input.personaId);
					if (persona.systemPrompt) {
						instructions = persona.systemPrompt;
					}
				} catch {
					// Use default instructions if persona not found
				}
			}

			// Request ephemeral token from OpenAI
			const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${openaiProvider.apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "gpt-4o-realtime-preview-2024-12-17",
					voice: input.voiceId,
					modalities: ["text", "audio"],
					instructions,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("[VoiceInterview] Failed to get ephemeral token:", {
					status: response.status,
					errorType: errorData?.error?.type ?? "unknown",
				});

				if (response.status === 401) {
					throw new ORPCError("PRECONDITION_FAILED", {
						message: "OpenAI API key is invalid. Please contact an administrator.",
					});
				}

				if (response.status === 429) {
					throw new ORPCError("TOO_MANY_REQUESTS", {
						message: "Rate limit exceeded. Please try again later.",
					});
				}

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Failed to initialize voice interview session. Please try again.",
				});
			}

			const data = await response.json();

			logger.info("[VoiceInterview] Created session for user:", {
				userId: context.user.id,
				sessionId: input.sessionId,
				voiceId: input.voiceId,
				language: input.language,
				personaId: input.personaId,
				realtimeSessionId: data.id,
			});

			return {
				token: data.client_secret.value,
				expiresAt: new Date(data.client_secret.expires_at * 1000).toISOString(),
			};
		}),

	/**
	 * Get available voices for voice interviews
	 */
	getVoices: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/voices",
			tags: ["Voice Interview"],
			summary: "Get available voice options",
		})
		.output(
			z.array(
				z.object({
					id: z.string(),
					name: z.string(),
					description: z.string(),
				}),
			),
		)
		.handler(async () => {
			return [
				{ id: "alloy", name: "Alloy", description: "Neutral and balanced" },
				{ id: "echo", name: "Echo", description: "Warm and conversational" },
				{ id: "fable", name: "Fable", description: "Expressive and dynamic" },
				{ id: "onyx", name: "Onyx", description: "Deep and authoritative" },
				{ id: "nova", name: "Nova", description: "Friendly and upbeat" },
				{ id: "shimmer", name: "Shimmer", description: "Clear and professional" },
				{ id: "coral", name: "Coral", description: "Warm and reassuring" },
				{ id: "sage", name: "Sage", description: "Calm and measured" },
				{ id: "ash", name: "Ash", description: "Direct and confident" },
				{ id: "ballad", name: "Ballad", description: "Soft and melodic" },
				{ id: "verse", name: "Verse", description: "Versatile and engaging" },
			];
		}),

	/**
	 * Check if voice interview is available (OpenAI Realtime API is configured)
	 */
	checkAvailability: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/availability",
			tags: ["Voice Interview"],
			summary: "Check if voice interview is available",
		})
		.output(
			z.object({
				available: z.boolean(),
				reason: z.string().optional(),
			}),
		)
		.handler(async () => {
			try {
				const openaiProviders = await aiConfigService.getByProvider("openai");
				const openaiProvider = openaiProviders.find((p) => p.isEnabled);

				if (!openaiProvider) {
					return {
						available: false,
						reason: "OpenAI provider is not configured",
					};
				}

				return {
					available: true,
				};
			} catch (error) {
				console.error("[VoiceInterview] Error checking availability:", error);
				return {
					available: false,
					reason: "Unable to verify configuration",
				};
			}
		}),
};

// ============================================
// SESSIONS ROUTER
// ============================================

const sessionsRouter = {
	create: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/sessions",
			tags: ["Voice Interview"],
			summary: "Create a new voice interview session",
		})
		.input(
			z.object({
				type: voiceInterviewTypeSchema.optional().default("single"),
				targetRole: z.string().optional(),
				targetCompany: z.string().optional(),
				difficulty: voiceInterviewDifficultySchema.optional().default("medium"),
				language: voiceInterviewLanguageSchema.optional().default("fr"),
				panelSize: z.number().min(1).max(5).optional().default(1),
				personaIds: z.array(z.string()).optional(),
			}),
		)
		.output(sessionSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.create({
				userId: context.user.id,
				...input,
			});
		}),

	getById: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/sessions/{id}",
			tags: ["Voice Interview"],
			summary: "Get a voice interview session by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(sessionSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.getById({
				id: input.id,
				userId: context.user.id,
			});
		}),

	list: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/sessions",
			tags: ["Voice Interview"],
			summary: "List voice interview sessions",
		})
		.input(
			z
				.object({
					status: voiceInterviewStatusSchema.optional(),
					type: voiceInterviewTypeSchema.optional(),
					limit: z.number().optional(),
					offset: z.number().optional(),
				})
				.optional()
				.default({}),
		)
		.output(
			z.object({
				items: z.array(sessionSchema),
				total: z.number(),
			}),
		)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.list({
				userId: context.user.id,
				...input,
			});
		}),

	updateStatus: protectedProcedure
		.route({
			method: "PUT",
			path: "/voice-interview/sessions/{id}/status",
			tags: ["Voice Interview"],
			summary: "Update session status",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				status: voiceInterviewStatusSchema,
				duration: z.number().optional(),
				overallScore: z.number().optional(),
				recordingUrl: z.string().optional(),
			}),
		)
		.output(sessionSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.updateStatus({
				...input,
				userId: context.user.id,
			});
		}),

	saveTranscript: protectedProcedure
		.route({
			method: "PUT",
			path: "/voice-interview/sessions/{id}/transcript",
			tags: ["Voice Interview"],
			summary: "Save session transcript",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				transcript: z.array(transcriptMessageSchema),
			}),
		)
		.output(sessionSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.saveTranscript({
				id: input.id,
				userId: context.user.id,
				transcript: input.transcript,
			});
		}),

	delete: protectedProcedure
		.route({
			method: "DELETE",
			path: "/voice-interview/sessions/{id}",
			tags: ["Voice Interview"],
			summary: "Delete a session",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.delete({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getStatistics: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/statistics",
			tags: ["Voice Interview"],
			summary: "Get voice interview statistics",
		})
		.output(
			z.object({
				total: z.number(),
				completed: z.number(),
				inProgress: z.number(),
				avgScore: z.number(),
				totalDuration: z.number(),
				panelSessions: z.number(),
				singleSessions: z.number(),
			}),
		)
		.handler(async ({ context }) => {
			return await voiceInterviewService.sessions.getStatistics({
				userId: context.user.id,
			});
		}),

	// ============================================
	// PAUSE/RESUME (Cost Optimization)
	// ============================================

	pause: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/sessions/{id}/pause",
			tags: ["Voice Interview"],
			summary: "Pause an in-progress session",
			description: "Save session state for later resume, reducing costs by avoiding repeated startup.",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				currentQuestionIndex: z.number().optional(),
				sessionState: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.output(sessionSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.pause({
				id: input.id,
				userId: context.user.id,
				currentQuestionIndex: input.currentQuestionIndex,
				sessionState: input.sessionState,
			});
		}),

	resume: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/sessions/{id}/resume",
			tags: ["Voice Interview"],
			summary: "Resume a paused session",
			description: "Continue a previously paused session, reusing cached tokens when possible.",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(
			z.object({
				session: sessionSchema,
				canReuse: z.boolean(), // Whether cached token can be reused
			}),
		)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.sessions.resume({
				id: input.id,
				userId: context.user.id,
			});
		}),

	getResumable: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/sessions/resumable",
			tags: ["Voice Interview"],
			summary: "Get resumable sessions",
			description: "List sessions that were paused and can be resumed.",
		})
		.output(z.array(sessionSchema))
		.handler(async ({ context }) => {
			return await voiceInterviewService.sessions.getResumable({
				userId: context.user.id,
			});
		}),
};

// ============================================
// PERSONAS ROUTER
// ============================================

const personasRouter = {
	list: publicProcedure
		.route({
			method: "GET",
			path: "/voice-interview/personas",
			tags: ["Voice Interview"],
			summary: "List interviewer personas",
		})
		.input(
			z
				.object({
					activeOnly: z.boolean().optional().default(true),
				})
				.optional()
				.default({ activeOnly: true }),
		)
		.output(z.array(personaSchema))
		.handler(async ({ input }) => {
			return await voiceInterviewService.personas.list(input);
		}),

	getById: publicProcedure
		.route({
			method: "GET",
			path: "/voice-interview/personas/{id}",
			tags: ["Voice Interview"],
			summary: "Get a persona by ID",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(personaSchema)
		.handler(async ({ input }) => {
			return await voiceInterviewService.personas.getById(input.id);
		}),

	create: adminProcedure
		.route({
			method: "POST",
			path: "/voice-interview/personas",
			tags: ["Voice Interview", "Admin"],
			summary: "Create a new interviewer persona (admin only)",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string(),
				nameFr: z.string().optional(),
				role: z.string(),
				roleFr: z.string().optional(),
				personality: interviewerPersonalitySchema,
				voiceId: z.string(),
				avatar: z.string().optional(),
				speakingStyle: speakingStyleSchema.optional(),
				focusAreas: z.array(z.string()).optional(),
				sampleQuestions: z.array(sampleQuestionSchema).optional(),
				systemPrompt: z.string().optional(),
				bio: z.string().optional(),
				bioFr: z.string().optional(),
				yearsExperience: z.number().optional(),
				industry: z.string().optional(),
				isActive: z.boolean().optional().default(true),
				sortOrder: z.number().optional(),
			}),
		)
		.output(personaSchema)
		.handler(async ({ input }) => {
			return await voiceInterviewService.personas.create({
				id: input.id,
				name: input.name,
				nameFr: input.nameFr ?? null,
				role: input.role,
				roleFr: input.roleFr ?? null,
				personality: input.personality,
				voiceId: input.voiceId,
				avatar: input.avatar ?? null,
				speakingStyle: input.speakingStyle ?? null,
				focusAreas: input.focusAreas ?? [],
				sampleQuestions: input.sampleQuestions ?? [],
				systemPrompt: input.systemPrompt ?? null,
				bio: input.bio ?? null,
				bioFr: input.bioFr ?? null,
				yearsExperience: input.yearsExperience ?? null,
				industry: input.industry ?? null,
				isActive: input.isActive,
				sortOrder: input.sortOrder ?? 0,
			});
		}),

	update: adminProcedure
		.route({
			method: "PUT",
			path: "/voice-interview/personas/{id}",
			tags: ["Voice Interview", "Admin"],
			summary: "Update an interviewer persona (admin only)",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				name: z.string().optional(),
				nameFr: z.string().optional(),
				role: z.string().optional(),
				roleFr: z.string().optional(),
				personality: interviewerPersonalitySchema.optional(),
				voiceId: z.string().optional(),
				avatar: z.string().optional(),
				speakingStyle: speakingStyleSchema.optional(),
				focusAreas: z.array(z.string()).optional(),
				sampleQuestions: z.array(sampleQuestionSchema).optional(),
				systemPrompt: z.string().optional(),
				bio: z.string().optional(),
				bioFr: z.string().optional(),
				yearsExperience: z.number().optional(),
				industry: z.string().optional(),
				isActive: z.boolean().optional(),
				sortOrder: z.number().optional(),
			}),
		)
		.output(personaSchema)
		.handler(async ({ input }) => {
			return await voiceInterviewService.personas.update(input);
		}),

	delete: adminProcedure
		.route({
			method: "DELETE",
			path: "/voice-interview/personas/{id}",
			tags: ["Voice Interview", "Admin"],
			summary: "Delete an interviewer persona (admin only)",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ input }) => {
			return await voiceInterviewService.personas.delete(input.id);
		}),
};

// ============================================
// PANELISTS ROUTER
// ============================================

const panelistsRouter = {
	getForSession: protectedProcedure
		.route({
			method: "GET",
			path: "/voice-interview/sessions/{sessionId}/panelists",
			tags: ["Voice Interview"],
			summary: "Get panelists for a session",
		})
		.input(z.object({ sessionId: z.string() }))
		.output(z.array(panelistWithPersonaSchema))
		.handler(async ({ context, input }) => {
			// SECURITY: Verify session ownership before returning panelists
			await voiceInterviewService.sessions.getById({
				id: input.sessionId,
				userId: context.user.id,
			});
			return await voiceInterviewService.panelists.getForSession(input.sessionId);
		}),

	add: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/sessions/{sessionId}/panelists",
			tags: ["Voice Interview"],
			summary: "Add a panelist to a session",
		})
		.input(
			z.object({
				sessionId: z.string(),
				personaId: z.string(),
				isLead: z.boolean().optional(),
			}),
		)
		.output(panelistSchema)
		.handler(async ({ context, input }) => {
			// SECURITY: Verify session ownership before adding panelist
			await voiceInterviewService.sessions.getById({
				id: input.sessionId,
				userId: context.user.id,
			});
			return await voiceInterviewService.panelists.add(input);
		}),

	update: protectedProcedure
		.route({
			method: "PUT",
			path: "/voice-interview/panelists/{id}",
			tags: ["Voice Interview"],
			summary: "Update panelist stats",
		})
		.input(
			z.object({
				id: z.string().uuid(),
				questionsAsked: z.number().optional(),
				speakingTime: z.number().optional(),
				score: z.number().optional(),
				notes: z.string().optional(),
			}),
		)
		.output(panelistSchema)
		.handler(async ({ context, input }) => {
			// SECURITY: Verify panelist belongs to a session owned by current user
			await voiceInterviewService.panelists.verifyOwnership(input.id, context.user.id);
			return await voiceInterviewService.panelists.update(input);
		}),

	remove: protectedProcedure
		.route({
			method: "DELETE",
			path: "/voice-interview/panelists/{id}",
			tags: ["Voice Interview"],
			summary: "Remove a panelist from a session",
		})
		.input(z.object({ id: z.string().uuid() }))
		.output(z.void())
		.handler(async ({ context, input }) => {
			// SECURITY: Verify panelist belongs to a session owned by current user
			await voiceInterviewService.panelists.verifyOwnership(input.id, context.user.id);
			return await voiceInterviewService.panelists.remove(input.id);
		}),
};

// ============================================
// FEEDBACK ROUTER
// ============================================

const feedbackRouter = {
	generate: protectedProcedure
		.route({
			method: "POST",
			path: "/voice-interview/sessions/{sessionId}/feedback",
			tags: ["Voice Interview"],
			summary: "Generate AI feedback for a session",
		})
		.input(z.object({ sessionId: z.string() }))
		.output(feedbackSchema)
		.handler(async ({ context, input }) => {
			return await voiceInterviewService.feedback.generate({
				sessionId: input.sessionId,
				userId: context.user.id,
			});
		}),
};

// ============================================
// SEED ROUTER
// ============================================

const seedRouter = {
	seedPersonas: adminProcedure
		.route({
			method: "POST",
			path: "/voice-interview/seed/personas",
			tags: ["Voice Interview", "Admin"],
			summary: "Seed default interviewer personas (admin only)",
		})
		.output(z.array(personaSchema))
		.handler(async () => {
			return await voiceInterviewService.seed.seedPersonas();
		}),
};

// ============================================
// MAIN ROUTER
// ============================================

/**
 * Voice Interview Router
 *
 * Provides endpoints for voice-based interview functionality using OpenAI's Realtime API.
 * Supports both single interviewer and panel interview modes.
 */
export const voiceInterviewRouter = {
	// Realtime API endpoints
	...realtimeRouter,
	// Session management
	sessions: sessionsRouter,
	// Persona management
	personas: personasRouter,
	// Panelist management
	panelists: panelistsRouter,
	// Feedback generation
	feedback: feedbackRouter,
	// Seeding
	seed: seedRouter,
};

/**
 * Build base instructions for the realtime session
 */
function buildBaseInstructions(language: string): string {
	if (language === "fr") {
		return `Vous êtes un intervieweur professionnel conduisant un entretien d'embauche.

Directives:
1. Parlez en français
2. Soyez professionnel mais accueillant
3. Posez des questions pertinentes et écoutez attentivement
4. Fournissez des retours constructifs
5. Gardez vos réponses concises et naturelles
6. Adaptez la difficulté des questions au niveau du candidat

Vous commencerez par vous présenter et accueillir le candidat.`;
	}

	if (language === "ar") {
		return `أنت محاور محترف تجري مقابلة عمل.

الإرشادات:
1. تحدث بالعربية الفصحى
2. كن محترفاً ولكن ودوداً
3. اطرح أسئلة ذات صلة واستمع بعناية
4. قدم ملاحظات بناءة عند الاقتضاء
5. حافظ على إجاباتك موجزة وطبيعية
6. عدّل صعوبة الأسئلة حسب مستوى المرشح

ستبدأ بتقديم نفسك والترحيب بالمرشح.`;
	}

	if (language === "darija") {
		return `نتا موظف محترف كتدير مقابلة ديال خدمة.

التوجيهات:
1. تكلم بالدارجة المغربية
2. كون محترف ولكن ودود
3. سول أسئلة مهمة وسمع مزيان
4. عطي ملاحظات بناءة
5. خلي الأجوبة ديالك قصيرة وطبيعية
6. عدل صعوبة الأسئلة حسب المستوى ديال المرشح

غادي تبدا بتقديم راسك والترحيب بالمرشح.`;
	}

	return `You are a professional interviewer conducting a job interview.

Guidelines:
1. Speak in English
2. Be professional but welcoming
3. Ask relevant questions and listen attentively
4. Provide constructive feedback when appropriate
5. Keep your responses concise and natural
6. Adapt question difficulty to the candidate's level

You will start by introducing yourself and welcoming the candidate.`;
}
