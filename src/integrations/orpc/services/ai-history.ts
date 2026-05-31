import { and, desc, eq, gte, ilike, inArray, isNull, lte, or } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type { AiContentSource } from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Input types
export type SaveAiHistoryInput = {
	userId: string;
	source: AiContentSource;
	name?: string;
	inputData?: Record<string, unknown>;
	generatedContent?: string;
	outputData?: Record<string, unknown>;
	resumeId?: string;
	metadata?: {
		tokens?: { input: number; output: number; total: number };
		model?: string;
		provider?: string;
		language?: string;
	};
};

export type ListAiHistoryInput = {
	userId: string;
	source?: AiContentSource | AiContentSource[];
	resumeId?: string | null;
	search?: string;
	isFavorite?: boolean;
	includeExpired?: boolean;
	limit?: number;
	offset?: number;
};

// Source labels for display
const SOURCE_LABELS: Record<AiContentSource, string> = {
	ai_writer_bullet_point: "Bullet Points",
	ai_writer_summary: "Resume Pro",
	ai_writer_achievement: "Achievement",
	ai_writer_cover_letter: "Cover Letter",
	ai_writer_linkedin_summary: "LinkedIn",
	ai_writer_skill_extraction: "Extraction",
	improve_content: "Improvement",
	generate_summary: "Summary",
	fix_grammar: "Grammar Fix",
	suggest_skills: "Skills",
	generate_headline: "Headline",
	analyze_resume: "Analysis",
	parse_pdf: "PDF Import",
	parse_docx: "DOCX Import",
	interview_questions: "Questions",
	interview_evaluation: "Evaluation",
	interview_chat: "AI Chat",
	interview_analysis: "Session Analysis",
	career_prediction: "Career Prediction",
	job_match: "Job Match",
	career_trajectory: "Career Trajectory",
	transferable_skills: "Transferable Skills",
	success_factors: "Success Factors",
	ai_mentor_chat: "Mentor Chat",
	learning_path_generate: "Learning Path",
	learning_path_recommend: "Path Recommendation",
	voice_interview: "Voice Interview",
	adaptive_quiz: "Adaptive Quiz",
	interview_coach: "Interview Coach",
	interview_improve: "Answer Improvement",
	resume_gap_analysis: "Resume Gap Analysis",
	resume_adapt_job: "Resume Job Adapt",
	resume_wizard_chat: "Resume Wizard",
	generate_resume: "Resume Generation",
	apply_gap_fixes: "Gap Fix Application",
};

function generateDefaultName(source: AiContentSource): string {
	const date = new Date().toLocaleDateString("fr-FR");
	return `${SOURCE_LABELS[source] || source} - ${date}`;
}

export const aiHistoryService = {
	/**
	 * Save AI-generated content to history
	 * Auto-sets expiresAt to 90 days from creation
	 */
	save: async (input: SaveAiHistoryInput): Promise<string> => {
		const id = generateId();
		const name = input.name || generateDefaultName(input.source);
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 90);

		await db.insert(schema.aiWriterContent).values({
			id,
			userId: input.userId,
			contentSource: input.source,
			name,
			originalInput: input.inputData ? JSON.stringify(input.inputData) : undefined,
			generatedContent: input.generatedContent,
			inputData: input.inputData,
			outputData: input.outputData,
			resumeId: input.resumeId,
			tags: [],
			expiresAt,
		});

		return id;
	},

	/**
	 * List AI history with filters
	 */
	list: async (input: ListAiHistoryInput) => {
		const conditions = [eq(schema.aiWriterContent.userId, input.userId)];

		// Filter by source
		if (input.source) {
			if (Array.isArray(input.source)) {
				conditions.push(inArray(schema.aiWriterContent.contentSource, input.source));
			} else {
				conditions.push(eq(schema.aiWriterContent.contentSource, input.source));
			}
		}

		// Filter by resume
		if (input.resumeId !== undefined) {
			if (input.resumeId === null) {
				conditions.push(isNull(schema.aiWriterContent.resumeId));
			} else {
				conditions.push(eq(schema.aiWriterContent.resumeId, input.resumeId));
			}
		}

		// Filter favorites
		if (input.isFavorite !== undefined) {
			conditions.push(eq(schema.aiWriterContent.isFavorite, input.isFavorite));
		}

		// Filter expired (default: exclude expired)
		if (!input.includeExpired) {
			const expirationCondition = or(
				isNull(schema.aiWriterContent.expiresAt),
				gte(schema.aiWriterContent.expiresAt, new Date()),
			);
			if (expirationCondition) conditions.push(expirationCondition);
		}

		// Search by name or content
		if (input.search) {
			const searchCondition = or(
				ilike(schema.aiWriterContent.name, `%${input.search}%`),
				ilike(schema.aiWriterContent.generatedContent, `%${input.search}%`),
			);
			if (searchCondition) conditions.push(searchCondition);
		}

		return await db
			.select()
			.from(schema.aiWriterContent)
			.where(and(...conditions))
			.orderBy(desc(schema.aiWriterContent.createdAt))
			.limit(input.limit ?? 50)
			.offset(input.offset ?? 0);
	},

	/**
	 * Get a single history item by ID
	 */
	getById: async (input: { id: string; userId: string }) => {
		const [content] = await db
			.select()
			.from(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		return content || null;
	},

	/**
	 * Toggle favorite status
	 */
	toggleFavorite: async (input: { id: string; userId: string }): Promise<boolean> => {
		const content = await aiHistoryService.getById(input);
		if (!content) return false;

		const newStatus = !content.isFavorite;
		await db
			.update(schema.aiWriterContent)
			.set({ isFavorite: newStatus })
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));

		return newStatus;
	},

	/**
	 * Mark content as applied to resume
	 */
	markApplied: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.update(schema.aiWriterContent)
			.set({ appliedAt: new Date() })
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));
	},

	/**
	 * Delete a history item
	 */
	delete: async (input: { id: string; userId: string }): Promise<void> => {
		await db
			.delete(schema.aiWriterContent)
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));
	},

	/**
	 * Get statistics by source
	 */
	getStats: async (input: { userId: string; resumeId?: string }) => {
		const conditions = [eq(schema.aiWriterContent.userId, input.userId)];

		if (input.resumeId) {
			conditions.push(eq(schema.aiWriterContent.resumeId, input.resumeId));
		}

		// Exclude expired
		const expirationCondition = or(
			isNull(schema.aiWriterContent.expiresAt),
			gte(schema.aiWriterContent.expiresAt, new Date()),
		);
		if (expirationCondition) conditions.push(expirationCondition);

		const contents = await db
			.select()
			.from(schema.aiWriterContent)
			.where(and(...conditions));

		const stats = {
			total: contents.length,
			bySource: {} as Record<string, number>,
			favorites: 0,
			applied: 0,
			lastWeek: 0,
		};

		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);

		for (const content of contents) {
			if (content.contentSource) {
				stats.bySource[content.contentSource] = (stats.bySource[content.contentSource] ?? 0) + 1;
			}
			if (content.isFavorite) stats.favorites++;
			if (content.appliedAt) stats.applied++;
			if (content.createdAt > weekAgo) stats.lastWeek++;
		}

		return stats;
	},

	/**
	 * Cleanup expired content (called by background job)
	 * Does NOT delete favorites even if expired
	 */
	cleanupExpired: async (): Promise<number> => {
		const now = new Date();

		const result = await db.delete(schema.aiWriterContent).where(
			and(
				lte(schema.aiWriterContent.expiresAt, now),
				eq(schema.aiWriterContent.isFavorite, false), // Keep favorites
			),
		);

		return result.rowCount ?? 0;
	},

	/**
	 * Extend expiration for a content item (e.g., when favorited)
	 */
	extendExpiration: async (input: { id: string; userId: string; days: number }): Promise<void> => {
		const content = await aiHistoryService.getById(input);
		if (!content) return;

		const newExpiration = new Date(content.expiresAt ?? new Date());
		newExpiration.setDate(newExpiration.getDate() + input.days);

		await db
			.update(schema.aiWriterContent)
			.set({ expiresAt: newExpiration })
			.where(and(eq(schema.aiWriterContent.id, input.id), eq(schema.aiWriterContent.userId, input.userId)));
	},
};
