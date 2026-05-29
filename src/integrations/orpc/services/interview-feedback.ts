import { ORPCError } from "@orpc/client";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { schema } from "@/integrations/drizzle";
import { db } from "@/integrations/drizzle/client";
import type {
	FeedbackCategory,
	FeedbackPriority,
	FeedbackType,
	InterviewFeedbackGoalMilestone,
	InterviewGoalStatus,
	PatternType,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// ============================================
// TYPES
// ============================================

export type FeedbackItem = {
	id: string;
	userId: string;
	sessionId: string | null;
	sessionTitle: string | null;
	date: string;
	category: FeedbackCategory;
	type: FeedbackType;
	content: string;
	source: string;
	actionItems: string[];
	isResolved: boolean;
	priority: FeedbackPriority;
	tags: string[];
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
};

export type FeedbackGoal = {
	id: string;
	userId: string;
	title: string;
	description: string;
	category: FeedbackCategory;
	targetDate: string;
	progress: number;
	status: InterviewGoalStatus;
	relatedFeedbackIds: string[];
	milestones: InterviewFeedbackGoalMilestone[];
	createdAt: Date;
	updatedAt: Date;
};

export type TrendData = {
	id: string;
	userId: string;
	date: string;
	technical: number;
	behavioral: number;
	communication: number;
	problemSolving: number;
	leadership: number;
	culturalFit: number;
	overall: number;
	createdAt: Date;
};

export type FeedbackPattern = {
	id: string;
	userId: string;
	type: PatternType;
	category: FeedbackCategory;
	description: string;
	frequency: number;
	confidence: number;
	recommendations: string[];
	relatedFeedbackIds: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type CreateFeedbackInput = {
	userId: string;
	sessionId?: string;
	sessionTitle?: string;
	date: string;
	category: FeedbackCategory;
	type: FeedbackType;
	content: string;
	source: string;
	actionItems?: string[];
	priority?: FeedbackPriority;
	tags?: string[];
	notes?: string;
};

export type UpdateFeedbackInput = {
	id: string;
	userId: string;
	sessionId?: string;
	sessionTitle?: string;
	date?: string;
	category?: FeedbackCategory;
	type?: FeedbackType;
	content?: string;
	source?: string;
	actionItems?: string[];
	isResolved?: boolean;
	priority?: FeedbackPriority;
	tags?: string[];
	notes?: string;
};

export type CreateGoalInput = {
	userId: string;
	title: string;
	description: string;
	category: FeedbackCategory;
	targetDate: string;
	relatedFeedbackIds?: string[];
	milestones?: InterviewFeedbackGoalMilestone[];
};

export type UpdateGoalInput = {
	id: string;
	userId: string;
	title?: string;
	description?: string;
	category?: FeedbackCategory;
	targetDate?: string;
	progress?: number;
	status?: InterviewGoalStatus;
	relatedFeedbackIds?: string[];
	milestones?: InterviewFeedbackGoalMilestone[];
};

export type CreateTrendInput = {
	userId: string;
	date: string;
	technical: number;
	behavioral: number;
	communication: number;
	problemSolving: number;
	leadership: number;
	culturalFit: number;
	overall: number;
};

export type CreatePatternInput = {
	userId: string;
	type: PatternType;
	category: FeedbackCategory;
	description: string;
	frequency?: number;
	confidence?: number;
	recommendations?: string[];
	relatedFeedbackIds?: string[];
};

// ============================================
// SERVICE
// ============================================

export const interviewFeedbackService = {
	// ============================================
	// FEEDBACK ITEMS
	// ============================================

	feedback: {
		// Create new feedback
		create: async (input: CreateFeedbackInput): Promise<FeedbackItem> => {
			const id = generateId();

			await db.insert(schema.interviewFeedbackItem).values({
				id,
				userId: input.userId,
				sessionId: input.sessionId ?? null,
				sessionTitle: input.sessionTitle ?? null,
				date: input.date,
				category: input.category,
				type: input.type,
				content: input.content,
				source: input.source,
				actionItems: input.actionItems ?? [],
				priority: input.priority ?? "medium",
				tags: input.tags ?? [],
				notes: input.notes ?? null,
			});

			const [feedback] = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(eq(schema.interviewFeedbackItem.id, id));

			return feedback as FeedbackItem;
		},

		// Get feedback by ID
		getById: async (input: { id: string; userId: string }): Promise<FeedbackItem> => {
			const [feedback] = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);

			if (!feedback) {
				throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
			}

			return feedback as FeedbackItem;
		},

		// List feedback with filters
		list: async (input: {
			userId: string;
			category?: FeedbackCategory;
			type?: FeedbackType;
			isResolved?: boolean;
			search?: string;
			limit?: number;
			offset?: number;
		}): Promise<{ items: FeedbackItem[]; total: number }> => {
			const conditions = [eq(schema.interviewFeedbackItem.userId, input.userId)];

			if (input.category) {
				conditions.push(eq(schema.interviewFeedbackItem.category, input.category));
			}

			if (input.type) {
				conditions.push(eq(schema.interviewFeedbackItem.type, input.type));
			}

			if (input.isResolved !== undefined) {
				conditions.push(eq(schema.interviewFeedbackItem.isResolved, input.isResolved));
			}

			// Count total
			const [countResult] = await db
				.select({ count: sql<number>`count(*)::int` })
				.from(schema.interviewFeedbackItem)
				.where(and(...conditions));

			// Get items
			const items = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(and(...conditions))
				.orderBy(desc(schema.interviewFeedbackItem.date), desc(schema.interviewFeedbackItem.createdAt))
				.limit(input.limit ?? 50)
				.offset(input.offset ?? 0);

			return {
				items: items as FeedbackItem[],
				total: countResult?.count ?? 0,
			};
		},

		// Update feedback
		update: async (input: UpdateFeedbackInput): Promise<FeedbackItem> => {
			const [existing] = await db
				.select({ id: schema.interviewFeedbackItem.id })
				.from(schema.interviewFeedbackItem)
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
			}

			await db
				.update(schema.interviewFeedbackItem)
				.set({
					sessionId: input.sessionId,
					sessionTitle: input.sessionTitle,
					date: input.date,
					category: input.category,
					type: input.type,
					content: input.content,
					source: input.source,
					actionItems: input.actionItems,
					isResolved: input.isResolved,
					priority: input.priority,
					tags: input.tags,
					notes: input.notes,
				})
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);

			return await interviewFeedbackService.feedback.getById({ id: input.id, userId: input.userId });
		},

		// Toggle resolved status
		toggleResolved: async (input: { id: string; userId: string }): Promise<boolean> => {
			const [existing] = await db
				.select({ isResolved: schema.interviewFeedbackItem.isResolved })
				.from(schema.interviewFeedbackItem)
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Feedback not found" });
			}

			const newResolved = !existing.isResolved;

			await db
				.update(schema.interviewFeedbackItem)
				.set({ isResolved: newResolved })
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);

			return newResolved;
		},

		// Delete feedback
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.interviewFeedbackItem)
				.where(
					and(eq(schema.interviewFeedbackItem.id, input.id), eq(schema.interviewFeedbackItem.userId, input.userId)),
				);
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const feedbacks = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(eq(schema.interviewFeedbackItem.userId, input.userId));

			const strengths = feedbacks.filter((f) => f.type === "strength").length;
			const improvements = feedbacks.filter((f) => f.type === "improvement").length;
			const unresolvedCount = feedbacks.filter((f) => !f.isResolved && f.type === "improvement").length;
			const highPriority = feedbacks.filter((f) => f.priority === "high" && !f.isResolved).length;

			const categoryBreakdown: Record<FeedbackCategory, number> = {
				technical: 0,
				behavioral: 0,
				communication: 0,
				problem_solving: 0,
				leadership: 0,
				cultural_fit: 0,
			};

			for (const feedback of feedbacks) {
				categoryBreakdown[feedback.category]++;
			}

			return {
				total: feedbacks.length,
				strengths,
				improvements,
				unresolvedCount,
				highPriority,
				categoryBreakdown,
			};
		},
	},

	// ============================================
	// GOALS
	// ============================================

	goals: {
		// Create goal
		create: async (input: CreateGoalInput): Promise<FeedbackGoal> => {
			const id = generateId();

			await db.insert(schema.interviewFeedbackGoal).values({
				id,
				userId: input.userId,
				title: input.title,
				description: input.description,
				category: input.category,
				targetDate: input.targetDate,
				relatedFeedbackIds: input.relatedFeedbackIds ?? [],
				milestones: input.milestones ?? [],
			});

			const [goal] = await db
				.select()
				.from(schema.interviewFeedbackGoal)
				.where(eq(schema.interviewFeedbackGoal.id, id));

			return goal as FeedbackGoal;
		},

		// Get goal by ID
		getById: async (input: { id: string; userId: string }): Promise<FeedbackGoal> => {
			const [goal] = await db
				.select()
				.from(schema.interviewFeedbackGoal)
				.where(
					and(eq(schema.interviewFeedbackGoal.id, input.id), eq(schema.interviewFeedbackGoal.userId, input.userId)),
				);

			if (!goal) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			return goal as FeedbackGoal;
		},

		// List goals
		list: async (input: {
			userId: string;
			status?: InterviewGoalStatus;
			category?: FeedbackCategory;
			limit?: number;
		}): Promise<FeedbackGoal[]> => {
			const conditions = [eq(schema.interviewFeedbackGoal.userId, input.userId)];

			if (input.status) {
				conditions.push(eq(schema.interviewFeedbackGoal.status, input.status));
			}

			if (input.category) {
				conditions.push(eq(schema.interviewFeedbackGoal.category, input.category));
			}

			const goals = await db
				.select()
				.from(schema.interviewFeedbackGoal)
				.where(and(...conditions))
				.orderBy(schema.interviewFeedbackGoal.targetDate, desc(schema.interviewFeedbackGoal.createdAt))
				.limit(input.limit ?? 50);

			return goals as FeedbackGoal[];
		},

		// Update goal
		update: async (input: UpdateGoalInput): Promise<FeedbackGoal> => {
			const [existing] = await db
				.select({ id: schema.interviewFeedbackGoal.id })
				.from(schema.interviewFeedbackGoal)
				.where(
					and(eq(schema.interviewFeedbackGoal.id, input.id), eq(schema.interviewFeedbackGoal.userId, input.userId)),
				);

			if (!existing) {
				throw new ORPCError("NOT_FOUND", { message: "Goal not found" });
			}

			await db
				.update(schema.interviewFeedbackGoal)
				.set({
					title: input.title,
					description: input.description,
					category: input.category,
					targetDate: input.targetDate,
					progress: input.progress,
					status: input.status,
					relatedFeedbackIds: input.relatedFeedbackIds,
					milestones: input.milestones,
				})
				.where(
					and(eq(schema.interviewFeedbackGoal.id, input.id), eq(schema.interviewFeedbackGoal.userId, input.userId)),
				);

			return await interviewFeedbackService.goals.getById({ id: input.id, userId: input.userId });
		},

		// Update milestone completion
		toggleMilestone: async (input: {
			goalId: string;
			userId: string;
			milestoneIndex: number;
		}): Promise<FeedbackGoal> => {
			const goal = await interviewFeedbackService.goals.getById({ id: input.goalId, userId: input.userId });

			if (input.milestoneIndex < 0 || input.milestoneIndex >= goal.milestones.length) {
				throw new ORPCError("BAD_REQUEST", { message: "Invalid milestone index" });
			}

			const updatedMilestones = [...goal.milestones];
			updatedMilestones[input.milestoneIndex] = {
				...updatedMilestones[input.milestoneIndex],
				completed: !updatedMilestones[input.milestoneIndex].completed,
			};

			// Calculate new progress
			const completedCount = updatedMilestones.filter((m) => m.completed).length;
			const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
			const newStatus: InterviewGoalStatus =
				newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "not_started";

			return await interviewFeedbackService.goals.update({
				id: input.goalId,
				userId: input.userId,
				milestones: updatedMilestones,
				progress: newProgress,
				status: newStatus,
			});
		},

		// Delete goal
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.interviewFeedbackGoal)
				.where(
					and(eq(schema.interviewFeedbackGoal.id, input.id), eq(schema.interviewFeedbackGoal.userId, input.userId)),
				);
		},

		// Get statistics
		getStatistics: async (input: { userId: string }) => {
			const goals = await db
				.select()
				.from(schema.interviewFeedbackGoal)
				.where(eq(schema.interviewFeedbackGoal.userId, input.userId));

			const now = new Date();
			const inProgress = goals.filter((g) => g.status === "in_progress").length;
			const completed = goals.filter((g) => g.status === "completed").length;
			const overdue = goals.filter((g) => new Date(g.targetDate) < now && g.status !== "completed").length;

			return {
				total: goals.length,
				inProgress,
				completed,
				notStarted: goals.filter((g) => g.status === "not_started").length,
				overdue,
			};
		},
	},

	// ============================================
	// TRENDS
	// ============================================

	trends: {
		// Create or update trend data for a specific date
		upsert: async (input: CreateTrendInput): Promise<TrendData> => {
			const id = generateId();

			await db
				.insert(schema.interviewFeedbackTrend)
				.values({
					id,
					userId: input.userId,
					date: input.date,
					technical: input.technical,
					behavioral: input.behavioral,
					communication: input.communication,
					problemSolving: input.problemSolving,
					leadership: input.leadership,
					culturalFit: input.culturalFit,
					overall: input.overall,
				})
				.onConflictDoUpdate({
					target: [schema.interviewFeedbackTrend.userId, schema.interviewFeedbackTrend.date],
					set: {
						technical: input.technical,
						behavioral: input.behavioral,
						communication: input.communication,
						problemSolving: input.problemSolving,
						leadership: input.leadership,
						culturalFit: input.culturalFit,
						overall: input.overall,
					},
				});

			const [trend] = await db
				.select()
				.from(schema.interviewFeedbackTrend)
				.where(
					and(
						eq(schema.interviewFeedbackTrend.userId, input.userId),
						eq(schema.interviewFeedbackTrend.date, input.date),
					),
				);

			return trend as TrendData;
		},

		// Get trend data for date range
		list: async (input: {
			userId: string;
			startDate?: string;
			endDate?: string;
			limit?: number;
		}): Promise<TrendData[]> => {
			const conditions = [eq(schema.interviewFeedbackTrend.userId, input.userId)];

			if (input.startDate) {
				conditions.push(gte(schema.interviewFeedbackTrend.date, input.startDate));
			}

			if (input.endDate) {
				conditions.push(lte(schema.interviewFeedbackTrend.date, input.endDate));
			}

			const trends = await db
				.select()
				.from(schema.interviewFeedbackTrend)
				.where(and(...conditions))
				.orderBy(schema.interviewFeedbackTrend.date)
				.limit(input.limit ?? 52); // Default to ~1 year of weekly data

			return trends as TrendData[];
		},

		// Get latest trend
		getLatest: async (input: { userId: string }): Promise<TrendData | null> => {
			const [trend] = await db
				.select()
				.from(schema.interviewFeedbackTrend)
				.where(eq(schema.interviewFeedbackTrend.userId, input.userId))
				.orderBy(desc(schema.interviewFeedbackTrend.date))
				.limit(1);

			return (trend as TrendData) ?? null;
		},

		// Calculate and store current trend based on feedback
		calculateAndStore: async (input: { userId: string }): Promise<TrendData> => {
			// Get all feedback items
			const feedbacks = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(eq(schema.interviewFeedbackItem.userId, input.userId));

			// Calculate scores by category
			const categoryScores: Record<FeedbackCategory, { strengths: number; improvements: number; total: number }> = {
				technical: { strengths: 0, improvements: 0, total: 0 },
				behavioral: { strengths: 0, improvements: 0, total: 0 },
				communication: { strengths: 0, improvements: 0, total: 0 },
				problem_solving: { strengths: 0, improvements: 0, total: 0 },
				leadership: { strengths: 0, improvements: 0, total: 0 },
				cultural_fit: { strengths: 0, improvements: 0, total: 0 },
			};

			for (const feedback of feedbacks) {
				categoryScores[feedback.category].total++;
				if (feedback.type === "strength") {
					categoryScores[feedback.category].strengths++;
				} else {
					categoryScores[feedback.category].improvements++;
				}
			}

			// Calculate score as percentage (strengths / total * 100)
			const calculateScore = (cat: FeedbackCategory): number => {
				const { strengths, total } = categoryScores[cat];
				if (total === 0) return 50; // Default score
				return Math.round((strengths / total) * 100);
			};

			const technical = calculateScore("technical");
			const behavioral = calculateScore("behavioral");
			const communication = calculateScore("communication");
			const problemSolving = calculateScore("problem_solving");
			const leadership = calculateScore("leadership");
			const culturalFit = calculateScore("cultural_fit");

			// Calculate overall as average
			const overall = Math.round(
				(technical + behavioral + communication + problemSolving + leadership + culturalFit) / 6,
			);

			const today = new Date().toISOString().split("T")[0];

			return await interviewFeedbackService.trends.upsert({
				userId: input.userId,
				date: today,
				technical,
				behavioral,
				communication,
				problemSolving,
				leadership,
				culturalFit,
				overall,
			});
		},
	},

	// ============================================
	// PATTERNS
	// ============================================

	patterns: {
		// Create pattern
		create: async (input: CreatePatternInput): Promise<FeedbackPattern> => {
			const id = generateId();

			await db.insert(schema.interviewFeedbackPattern).values({
				id,
				userId: input.userId,
				type: input.type,
				category: input.category,
				description: input.description,
				frequency: input.frequency ?? 1,
				confidence: input.confidence ?? 50,
				recommendations: input.recommendations ?? [],
				relatedFeedbackIds: input.relatedFeedbackIds ?? [],
			});

			const [pattern] = await db
				.select()
				.from(schema.interviewFeedbackPattern)
				.where(eq(schema.interviewFeedbackPattern.id, id));

			return pattern as FeedbackPattern;
		},

		// List patterns
		list: async (input: {
			userId: string;
			type?: PatternType;
			category?: FeedbackCategory;
		}): Promise<FeedbackPattern[]> => {
			const conditions = [eq(schema.interviewFeedbackPattern.userId, input.userId)];

			if (input.type) {
				conditions.push(eq(schema.interviewFeedbackPattern.type, input.type));
			}

			if (input.category) {
				conditions.push(eq(schema.interviewFeedbackPattern.category, input.category));
			}

			const patterns = await db
				.select()
				.from(schema.interviewFeedbackPattern)
				.where(and(...conditions))
				.orderBy(desc(schema.interviewFeedbackPattern.confidence), desc(schema.interviewFeedbackPattern.frequency));

			return patterns as FeedbackPattern[];
		},

		// Update pattern
		update: async (input: {
			id: string;
			userId: string;
			description?: string;
			frequency?: number;
			confidence?: number;
			recommendations?: string[];
			relatedFeedbackIds?: string[];
		}): Promise<FeedbackPattern> => {
			await db
				.update(schema.interviewFeedbackPattern)
				.set({
					description: input.description,
					frequency: input.frequency,
					confidence: input.confidence,
					recommendations: input.recommendations,
					relatedFeedbackIds: input.relatedFeedbackIds,
				})
				.where(
					and(
						eq(schema.interviewFeedbackPattern.id, input.id),
						eq(schema.interviewFeedbackPattern.userId, input.userId),
					),
				);

			const [pattern] = await db
				.select()
				.from(schema.interviewFeedbackPattern)
				.where(eq(schema.interviewFeedbackPattern.id, input.id));

			return pattern as FeedbackPattern;
		},

		// Delete pattern
		delete: async (input: { id: string; userId: string }): Promise<void> => {
			await db
				.delete(schema.interviewFeedbackPattern)
				.where(
					and(
						eq(schema.interviewFeedbackPattern.id, input.id),
						eq(schema.interviewFeedbackPattern.userId, input.userId),
					),
				);
		},

		// Analyze and detect patterns from feedback
		analyze: async (input: { userId: string }): Promise<FeedbackPattern[]> => {
			// Get all feedback
			const feedbacks = await db
				.select()
				.from(schema.interviewFeedbackItem)
				.where(eq(schema.interviewFeedbackItem.userId, input.userId));

			if (feedbacks.length < 3) {
				return []; // Need at least 3 items to detect patterns
			}

			// Clear existing patterns
			await db.delete(schema.interviewFeedbackPattern).where(eq(schema.interviewFeedbackPattern.userId, input.userId));

			const detectedPatterns: FeedbackPattern[] = [];

			// Analyze by category
			const categories: FeedbackCategory[] = [
				"technical",
				"behavioral",
				"communication",
				"problem_solving",
				"leadership",
				"cultural_fit",
			];

			for (const category of categories) {
				const categoryFeedbacks = feedbacks.filter((f) => f.category === category);
				if (categoryFeedbacks.length < 2) continue;

				const strengths = categoryFeedbacks.filter((f) => f.type === "strength");
				const improvements = categoryFeedbacks.filter((f) => f.type === "improvement");

				// Detect recurring strength
				if (strengths.length >= 2) {
					const pattern = await interviewFeedbackService.patterns.create({
						userId: input.userId,
						type: "recurring_strength",
						category,
						description: `Excellente performance recurrente en ${category.replace("_", " ")}`,
						frequency: strengths.length,
						confidence: Math.min(90, 50 + strengths.length * 10),
						recommendations: [
							"Continuez a mettre en avant cette competence",
							"Utilisez des exemples concrets de cette force",
						],
						relatedFeedbackIds: strengths.map((s) => s.id),
					});
					detectedPatterns.push(pattern);
				}

				// Detect recurring weakness
				if (improvements.length >= 2) {
					const unresolvedImprovements = improvements.filter((i) => !i.isResolved);
					if (unresolvedImprovements.length >= 2) {
						const pattern = await interviewFeedbackService.patterns.create({
							userId: input.userId,
							type: "recurring_weakness",
							category,
							description: `Recurring area for improvement in ${category.replace("_", " ")}`,
							frequency: unresolvedImprovements.length,
							confidence: Math.min(85, 50 + unresolvedImprovements.length * 10),
							recommendations: [
								"Practice this skill regularly",
								"Prepare structured answers",
								"Ask for feedback after each interview",
							],
							relatedFeedbackIds: unresolvedImprovements.map((i) => i.id),
						});
						detectedPatterns.push(pattern);
					}
				}

				// Detect improvement trend (more recent strengths than improvements)
				if (categoryFeedbacks.length >= 4) {
					const sorted = [...categoryFeedbacks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
					const recentHalf = sorted.slice(0, Math.floor(sorted.length / 2));
					const olderHalf = sorted.slice(Math.floor(sorted.length / 2));

					const recentStrengthRatio = recentHalf.filter((f) => f.type === "strength").length / recentHalf.length;
					const olderStrengthRatio = olderHalf.filter((f) => f.type === "strength").length / olderHalf.length;

					if (recentStrengthRatio > olderStrengthRatio + 0.2) {
						const pattern = await interviewFeedbackService.patterns.create({
							userId: input.userId,
							type: "improvement_trend",
							category,
							description: `Amelioration constante en ${category.replace("_", " ")}`,
							frequency: categoryFeedbacks.length,
							confidence: Math.round(70 + (recentStrengthRatio - olderStrengthRatio) * 50),
							recommendations: ["Continuez vos efforts actuels", "Documentez vos methodes de progression"],
							relatedFeedbackIds: categoryFeedbacks.map((f) => f.id),
						});
						detectedPatterns.push(pattern);
					} else if (olderStrengthRatio > recentStrengthRatio + 0.2) {
						const pattern = await interviewFeedbackService.patterns.create({
							userId: input.userId,
							type: "decline_trend",
							category,
							description: `Tendance a surveiller en ${category.replace("_", " ")}`,
							frequency: categoryFeedbacks.length,
							confidence: Math.round(60 + (olderStrengthRatio - recentStrengthRatio) * 50),
							recommendations: [
								"Identifier les causes de cette baisse",
								"Revoir les bases de cette competence",
								"Pratiquer plus regulierement",
							],
							relatedFeedbackIds: categoryFeedbacks.map((f) => f.id),
						});
						detectedPatterns.push(pattern);
					}
				}
			}

			return detectedPatterns;
		},
	},

	// ============================================
	// EXPORT
	// ============================================

	export: async (input: { userId: string }) => {
		const feedbacks = await db
			.select()
			.from(schema.interviewFeedbackItem)
			.where(eq(schema.interviewFeedbackItem.userId, input.userId))
			.orderBy(desc(schema.interviewFeedbackItem.date));

		const goals = await db
			.select()
			.from(schema.interviewFeedbackGoal)
			.where(eq(schema.interviewFeedbackGoal.userId, input.userId));

		const trends = await db
			.select()
			.from(schema.interviewFeedbackTrend)
			.where(eq(schema.interviewFeedbackTrend.userId, input.userId))
			.orderBy(schema.interviewFeedbackTrend.date);

		const patterns = await db
			.select()
			.from(schema.interviewFeedbackPattern)
			.where(eq(schema.interviewFeedbackPattern.userId, input.userId));

		const stats = await interviewFeedbackService.feedback.getStatistics({ userId: input.userId });
		const goalStats = await interviewFeedbackService.goals.getStatistics({ userId: input.userId });

		return {
			exportDate: new Date().toISOString(),
			feedback: feedbacks,
			goals,
			patterns,
			trends,
			summary: {
				totalFeedback: stats.total,
				strengths: stats.strengths,
				improvements: stats.improvements,
				activeGoals: goalStats.inProgress,
				overallProgress: trends.length > 0 ? trends[trends.length - 1].overall : 0,
			},
		};
	},
};
