import { and, asc, desc, eq, gte, isNotNull, isNull, lte } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	type FeedbackScoreCategory,
	type MockAiDifficulty,
	type MockAiField,
	type MockAiMessage,
	mockAiDifficultyConfig,
	mockAiFeedbackTemplate,
	mockAiFieldConfig,
	mockAiInterviewTip,
	mockAiProgram,
	mockAiQuestion,
	mockAiSession,
} from "@/integrations/drizzle/schema";

export type CreateSessionInput = {
	userId: string;
	field: MockAiField;
	program: string;
	difficulty: MockAiDifficulty;
	totalQuestions: number;
	initialMessage: MockAiMessage;
};

export type UpdateSessionInput = {
	sessionId: string;
	userId: string;
	messages?: MockAiMessage[];
	currentQuestionIndex?: number;
	scores?: number[];
	overallScore?: number;
	completedAt?: Date;
};

export type SessionHistoryItem = {
	id: string;
	field: MockAiField;
	program: string;
	difficulty: MockAiDifficulty;
	overallScore: number;
	totalQuestions: number;
	completedAt: Date;
};

export type FieldConfigItem = {
	field: MockAiField;
	label: string;
	icon: string;
	color: string;
	bgColor: string;
};

export type ProgramItem = {
	id: string;
	name: string;
};

export type DifficultyConfigItem = {
	difficulty: MockAiDifficulty;
	label: string;
	color: string;
	questionsCount: number;
};

export type FeedbackTemplateItem = {
	category: FeedbackScoreCategory;
	minScore: number;
	maxScore: number;
	strengths: string[];
	improvements: string[];
};

export type InterviewTipItem = {
	id: string;
	title: string;
	content: string;
};

export const mockAiService = {
	// ========================================
	// SESSION MANAGEMENT
	// ========================================

	// Create a new interview session
	async createSession(input: CreateSessionInput) {
		const [session] = await db
			.insert(mockAiSession)
			.values({
				userId: input.userId,
				field: input.field,
				program: input.program,
				difficulty: input.difficulty,
				totalQuestions: input.totalQuestions,
				messages: [input.initialMessage],
				currentQuestionIndex: 0,
				scores: [],
			})
			.returning();

		return session;
	},

	// Get current (incomplete) session for user
	async getCurrentSession(userId: string) {
		const [session] = await db
			.select()
			.from(mockAiSession)
			.where(and(eq(mockAiSession.userId, userId), isNull(mockAiSession.completedAt)))
			.orderBy(desc(mockAiSession.createdAt))
			.limit(1);

		return session || null;
	},

	// Get session by ID
	async getSession(sessionId: string, userId: string) {
		const [session] = await db
			.select()
			.from(mockAiSession)
			.where(and(eq(mockAiSession.id, sessionId), eq(mockAiSession.userId, userId)))
			.limit(1);

		return session || null;
	},

	// Update session
	async updateSession(input: UpdateSessionInput) {
		const updateData: Partial<typeof mockAiSession.$inferInsert> = {};

		if (input.messages !== undefined) {
			updateData.messages = input.messages;
		}
		if (input.currentQuestionIndex !== undefined) {
			updateData.currentQuestionIndex = input.currentQuestionIndex;
		}
		if (input.scores !== undefined) {
			updateData.scores = input.scores;
		}
		if (input.overallScore !== undefined) {
			updateData.overallScore = input.overallScore;
		}
		if (input.completedAt !== undefined) {
			updateData.completedAt = input.completedAt;
		}

		const [session] = await db
			.update(mockAiSession)
			.set(updateData)
			.where(and(eq(mockAiSession.id, input.sessionId), eq(mockAiSession.userId, input.userId)))
			.returning();

		return session;
	},

	// Delete/abandon current session
	async deleteSession(sessionId: string, userId: string) {
		await db.delete(mockAiSession).where(and(eq(mockAiSession.id, sessionId), eq(mockAiSession.userId, userId)));

		return { success: true };
	},

	// Get session history (completed sessions)
	async getHistory(userId: string, limit = 20): Promise<SessionHistoryItem[]> {
		const sessions = await db
			.select({
				id: mockAiSession.id,
				field: mockAiSession.field,
				program: mockAiSession.program,
				difficulty: mockAiSession.difficulty,
				overallScore: mockAiSession.overallScore,
				totalQuestions: mockAiSession.totalQuestions,
				completedAt: mockAiSession.completedAt,
			})
			.from(mockAiSession)
			.where(and(eq(mockAiSession.userId, userId), isNotNull(mockAiSession.completedAt)))
			.orderBy(desc(mockAiSession.completedAt))
			.limit(limit);

		return sessions
			.filter((s) => s.completedAt !== null && s.overallScore !== null)
			.map((s) => ({
				id: s.id,
				field: s.field,
				program: s.program,
				difficulty: s.difficulty,
				overallScore: s.overallScore as number,
				totalQuestions: s.totalQuestions,
				completedAt: s.completedAt as Date,
			}));
	},

	// Get statistics for the user
	async getStatistics(userId: string) {
		const history = await this.getHistory(userId, 100);

		if (history.length === 0) {
			return {
				totalSessions: 0,
				averageScore: 0,
				passedSessions: 0,
				recentHistory: [],
			};
		}

		const totalScore = history.reduce((acc, s) => acc + s.overallScore, 0);
		const averageScore = Math.round(totalScore / history.length);
		const passedSessions = history.filter((s) => s.overallScore >= 70).length;

		return {
			totalSessions: history.length,
			averageScore,
			passedSessions,
			recentHistory: history.slice(0, 5),
		};
	},

	// ========================================
	// CONFIGURATION DATA
	// ========================================

	// Get all field configurations
	async getFieldConfigs(): Promise<FieldConfigItem[]> {
		const configs = await db
			.select({
				field: mockAiFieldConfig.field,
				label: mockAiFieldConfig.label,
				icon: mockAiFieldConfig.icon,
				color: mockAiFieldConfig.color,
				bgColor: mockAiFieldConfig.bgColor,
			})
			.from(mockAiFieldConfig)
			.where(eq(mockAiFieldConfig.isActive, true));

		return configs;
	},

	// Get programs for a specific field
	async getProgramsByField(field: MockAiField): Promise<ProgramItem[]> {
		const programs = await db
			.select({
				id: mockAiProgram.programId,
				name: mockAiProgram.programName,
			})
			.from(mockAiProgram)
			.where(and(eq(mockAiProgram.field, field), eq(mockAiProgram.isActive, true)))
			.orderBy(asc(mockAiProgram.order));

		return programs;
	},

	// Get all programs grouped by field
	async getAllPrograms(): Promise<Record<MockAiField, ProgramItem[]>> {
		const programs = await db
			.select({
				field: mockAiProgram.field,
				id: mockAiProgram.programId,
				name: mockAiProgram.programName,
			})
			.from(mockAiProgram)
			.where(eq(mockAiProgram.isActive, true))
			.orderBy(asc(mockAiProgram.field), asc(mockAiProgram.order));

		const grouped: Record<MockAiField, ProgramItem[]> = {
			healthcare: [],
			industrial: [],
			hse: [],
		};

		for (const program of programs) {
			grouped[program.field].push({
				id: program.id,
				name: program.name,
			});
		}

		return grouped;
	},

	// Get all difficulty configurations
	async getDifficultyConfigs(): Promise<DifficultyConfigItem[]> {
		const configs = await db
			.select({
				difficulty: mockAiDifficultyConfig.difficulty,
				label: mockAiDifficultyConfig.label,
				color: mockAiDifficultyConfig.color,
				questionsCount: mockAiDifficultyConfig.questionsCount,
			})
			.from(mockAiDifficultyConfig)
			.where(eq(mockAiDifficultyConfig.isActive, true));

		return configs;
	},

	// ========================================
	// QUESTIONS
	// ========================================

	// Get questions for a specific field/program/difficulty
	async getQuestions(field: MockAiField, program: string, difficulty: MockAiDifficulty): Promise<string[]> {
		const questions = await db
			.select({
				questionText: mockAiQuestion.questionText,
			})
			.from(mockAiQuestion)
			.where(
				and(
					eq(mockAiQuestion.field, field),
					eq(mockAiQuestion.program, program),
					eq(mockAiQuestion.difficulty, difficulty),
					eq(mockAiQuestion.isActive, true),
				),
			)
			.orderBy(asc(mockAiQuestion.order));

		return questions.map((q) => q.questionText);
	},

	// ========================================
	// FEEDBACK TEMPLATES
	// ========================================

	// Get all feedback templates
	async getFeedbackTemplates(): Promise<FeedbackTemplateItem[]> {
		const templates = await db
			.select({
				category: mockAiFeedbackTemplate.category,
				minScore: mockAiFeedbackTemplate.minScore,
				maxScore: mockAiFeedbackTemplate.maxScore,
				strengths: mockAiFeedbackTemplate.strengths,
				improvements: mockAiFeedbackTemplate.improvements,
			})
			.from(mockAiFeedbackTemplate)
			.where(eq(mockAiFeedbackTemplate.isActive, true))
			.orderBy(desc(mockAiFeedbackTemplate.minScore));

		return templates;
	},

	// Get feedback template for a specific score
	async getFeedbackTemplateForScore(score: number): Promise<FeedbackTemplateItem | null> {
		const [template] = await db
			.select({
				category: mockAiFeedbackTemplate.category,
				minScore: mockAiFeedbackTemplate.minScore,
				maxScore: mockAiFeedbackTemplate.maxScore,
				strengths: mockAiFeedbackTemplate.strengths,
				improvements: mockAiFeedbackTemplate.improvements,
			})
			.from(mockAiFeedbackTemplate)
			.where(
				and(
					eq(mockAiFeedbackTemplate.isActive, true),
					lte(mockAiFeedbackTemplate.minScore, score),
					gte(mockAiFeedbackTemplate.maxScore, score),
				),
			)
			.limit(1);

		return template || null;
	},

	// ========================================
	// INTERVIEW TIPS
	// ========================================

	// Get all interview tips
	async getInterviewTips(): Promise<InterviewTipItem[]> {
		const tips = await db
			.select({
				id: mockAiInterviewTip.id,
				title: mockAiInterviewTip.title,
				content: mockAiInterviewTip.content,
			})
			.from(mockAiInterviewTip)
			.where(eq(mockAiInterviewTip.isActive, true))
			.orderBy(asc(mockAiInterviewTip.order));

		return tips;
	},

	// Get a random interview tip
	async getRandomTip(): Promise<InterviewTipItem | null> {
		const tips = await this.getInterviewTips();
		if (tips.length === 0) return null;
		return tips[Math.floor(Math.random() * tips.length)];
	},
};
