import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import * as schema from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";

// Default affirmations for seeding
const DEFAULT_AFFIRMATIONS = {
	career: [
		{
			content: "I am capable of achieving my career goals.",
			contentFr: "Je suis capable d'atteindre mes objectifs de carrière.",
			contentAr: "أنا قادر على تحقيق أهدافي المهنية.",
		},
		{
			content: "Every challenge is an opportunity for growth.",
			contentFr: "Chaque défi est une opportunité de croissance.",
			contentAr: "كل تحدٍ هو فرصة للنمو.",
		},
		{
			content: "I bring unique value to my work.",
			contentFr: "J'apporte une valeur unique à mon travail.",
			contentAr: "أجلب قيمة فريدة لعملي.",
		},
		{
			content: "I deserve success and recognition for my efforts.",
			contentFr: "Je mérite le succès et la reconnaissance pour mes efforts.",
			contentAr: "أستحق النجاح والتقدير لجهودي.",
		},
		{
			content: "My skills and experience make me a valuable asset.",
			contentFr: "Mes compétences et mon expérience font de moi un atout précieux.",
			contentAr: "مهاراتي وخبرتي تجعلني أصلاً قيماً.",
		},
	],
	confidence: [
		{
			content: "I am confident in my abilities.",
			contentFr: "J'ai confiance en mes capacités.",
			contentAr: "أنا واثق من قدراتي.",
		},
		{
			content: "I speak with authority and clarity.",
			contentFr: "Je parle avec autorité et clarté.",
			contentAr: "أتحدث بسلطة ووضوح.",
		},
		{
			content: "I trust my decisions and instincts.",
			contentFr: "Je fais confiance à mes décisions et mon instinct.",
			contentAr: "أثق بقراراتي وغرائزي.",
		},
		{
			content: "I am worthy of respect in any room.",
			contentFr: "Je mérite le respect dans n'importe quelle situation.",
			contentAr: "أستحق الاحترام في أي مكان.",
		},
		{
			content: "My voice matters and deserves to be heard.",
			contentFr: "Ma voix compte et mérite d'être entendue.",
			contentAr: "صوتي مهم ويستحق أن يُسمع.",
		},
	],
	motivation: [
		{
			content: "Today is a new opportunity to succeed.",
			contentFr: "Aujourd'hui est une nouvelle opportunité de réussir.",
			contentAr: "اليوم فرصة جديدة للنجاح.",
		},
		{
			content: "I am motivated to do my best work.",
			contentFr: "Je suis motivé(e) pour donner le meilleur de moi-même.",
			contentAr: "أنا متحمس لتقديم أفضل ما لدي.",
		},
		{
			content: "Small steps lead to big achievements.",
			contentFr: "Les petits pas mènent aux grandes réalisations.",
			contentAr: "الخطوات الصغيرة تؤدي إلى إنجازات كبيرة.",
		},
		{
			content: "I embrace challenges as stepping stones.",
			contentFr: "J'accueille les défis comme des tremplins.",
			contentAr: "أتقبل التحديات كخطوات نحو النجاح.",
		},
		{
			content: "My potential is limitless.",
			contentFr: "Mon potentiel est illimité.",
			contentAr: "إمكانياتي لا حدود لها.",
		},
	],
	success: [
		{
			content: "Success is my natural state.",
			contentFr: "Le succès est mon état naturel.",
			contentAr: "النجاح هو حالتي الطبيعية.",
		},
		{
			content: "I attract positive opportunities.",
			contentFr: "J'attire les opportunités positives.",
			contentAr: "أجذب الفرص الإيجابية.",
		},
		{
			content: "I am building the career I dream of.",
			contentFr: "Je construis la carrière dont je rêve.",
			contentAr: "أنا أبني المسيرة المهنية التي أحلم بها.",
		},
		{
			content: "My success inspires others.",
			contentFr: "Mon succès inspire les autres.",
			contentAr: "نجاحي يلهم الآخرين.",
		},
		{
			content: "I celebrate my wins, big and small.",
			contentFr: "Je célèbre mes victoires, grandes et petites.",
			contentAr: "أحتفل بانتصاراتي، كبيرة وصغيرة.",
		},
	],
	resilience: [
		{
			content: "Setbacks are setups for comebacks.",
			contentFr: "Les revers sont des préparations aux retours.",
			contentAr: "النكسات هي إعداد للعودة.",
		},
		{
			content: "I learn and grow from every experience.",
			contentFr: "J'apprends et je grandis de chaque expérience.",
			contentAr: "أتعلم وأنمو من كل تجربة.",
		},
		{
			content: "I am resilient and adaptable.",
			contentFr: "Je suis résilient(e) et adaptable.",
			contentAr: "أنا مرن وقابل للتكيف.",
		},
		{
			content: "Rejection redirects me to better opportunities.",
			contentFr: "Le rejet me redirige vers de meilleures opportunités.",
			contentAr: "الرفض يوجهني نحو فرص أفضل.",
		},
		{
			content: "I bounce back stronger from challenges.",
			contentFr: "Je rebondis plus fort après les défis.",
			contentAr: "أعود أقوى من التحديات.",
		},
	],
};

export const careerCoachingService = {
	// ==========================================
	// CAREER PATH MANAGEMENT
	// ==========================================

	createCareerPath: async (input: {
		userId: string;
		currentRole?: string;
		currentRoleFr?: string;
		targetRole: string;
		targetRoleFr?: string;
		targetIndustry?: string;
		targetCompany?: string;
		targetSalary?: number;
		targetDate?: Date;
		milestones?: schema.CareerMilestone[];
	}) => {
		const id = generateId();
		await db.insert(schema.careerPath).values({
			id,
			userId: input.userId,
			currentRole: input.currentRole,
			currentRoleFr: input.currentRoleFr,
			targetRole: input.targetRole,
			targetRoleFr: input.targetRoleFr,
			targetIndustry: input.targetIndustry,
			targetCompany: input.targetCompany,
			targetSalary: input.targetSalary,
			targetDate: input.targetDate,
			milestones: input.milestones || [],
			overallProgress: 0,
			isActive: true,
		});
		return id;
	},

	updateCareerPath: async (
		id: string,
		userId: string,
		input: Partial<{
			currentRole: string;
			targetRole: string;
			targetIndustry: string;
			targetCompany: string;
			targetSalary: number;
			targetDate: Date;
			milestones: schema.CareerMilestone[];
			overallProgress: number;
			isActive: boolean;
			notes: string;
		}>,
	) => {
		await db
			.update(schema.careerPath)
			.set(input)
			.where(and(eq(schema.careerPath.id, id), eq(schema.careerPath.userId, userId)));
	},

	getCareerPath: async (id: string, userId: string) => {
		const [path] = await db
			.select()
			.from(schema.careerPath)
			.where(and(eq(schema.careerPath.id, id), eq(schema.careerPath.userId, userId)));
		return path ?? null;
	},

	getActiveCareerPath: async (userId: string) => {
		const [path] = await db
			.select()
			.from(schema.careerPath)
			.where(and(eq(schema.careerPath.userId, userId), eq(schema.careerPath.isActive, true)))
			.orderBy(desc(schema.careerPath.createdAt))
			.limit(1);
		return path ?? null;
	},

	listCareerPaths: async (userId: string) => {
		return db
			.select()
			.from(schema.careerPath)
			.where(eq(schema.careerPath.userId, userId))
			.orderBy(desc(schema.careerPath.createdAt));
	},

	updateMilestone: async (
		pathId: string,
		userId: string,
		milestoneId: string,
		updates: Partial<schema.CareerMilestone>,
	) => {
		const path = await careerCoachingService.getCareerPath(pathId, userId);
		if (!path) return null;

		const milestones = path.milestones || [];
		const updatedMilestones = milestones.map((m) => (m.id === milestoneId ? { ...m, ...updates } : m));

		// Calculate overall progress
		const completedCount = updatedMilestones.filter((m) => m.status === "completed").length;
		const overallProgress =
			updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

		await db
			.update(schema.careerPath)
			.set({ milestones: updatedMilestones, overallProgress })
			.where(eq(schema.careerPath.id, pathId));

		return { milestones: updatedMilestones, overallProgress };
	},

	// ==========================================
	// SKILL GAP ANALYSIS
	// ==========================================

	createSkillGapAnalysis: async (input: {
		userId: string;
		careerPathId?: string;
		targetRole: string;
		gaps: schema.SkillGapItem[];
		strengths?: string[];
		recommendations?: string[];
		overallReadiness: number;
		aiAnalysis?: string;
	}) => {
		const id = generateId();
		await db.insert(schema.skillGapAnalysis).values({
			id,
			userId: input.userId,
			careerPathId: input.careerPathId,
			targetRole: input.targetRole,
			gaps: input.gaps,
			strengths: input.strengths || [],
			recommendations: input.recommendations || [],
			overallReadiness: input.overallReadiness,
			aiAnalysis: input.aiAnalysis,
		});
		return id;
	},

	getLatestSkillGapAnalysis: async (userId: string) => {
		const [analysis] = await db
			.select()
			.from(schema.skillGapAnalysis)
			.where(eq(schema.skillGapAnalysis.userId, userId))
			.orderBy(desc(schema.skillGapAnalysis.createdAt))
			.limit(1);
		return analysis ?? null;
	},

	listSkillGapAnalyses: async (userId: string, limit = 5) => {
		return db
			.select()
			.from(schema.skillGapAnalysis)
			.where(eq(schema.skillGapAnalysis.userId, userId))
			.orderBy(desc(schema.skillGapAnalysis.createdAt))
			.limit(limit);
	},

	// ==========================================
	// WEEKLY GOALS
	// ==========================================

	createWeeklyGoal: async (input: {
		userId: string;
		weekStartDate: string;
		category: (typeof schema.weeklyGoal.$inferSelect)["category"];
		title: string;
		titleFr?: string;
		description?: string;
		targetValue?: number;
		priority?: string;
	}) => {
		const id = generateId();
		await db.insert(schema.weeklyGoal).values({
			id,
			userId: input.userId,
			weekStartDate: input.weekStartDate,
			category: input.category,
			title: input.title,
			titleFr: input.titleFr,
			description: input.description,
			targetValue: input.targetValue || 1,
			currentValue: 0,
			priority: input.priority || "medium",
			status: "pending",
		});
		return id;
	},

	updateWeeklyGoal: async (
		id: string,
		userId: string,
		input: Partial<{
			title: string;
			description: string;
			targetValue: number;
			currentValue: number;
			status: (typeof schema.weeklyGoal.$inferSelect)["status"];
			priority: string;
			notes: string;
		}>,
	) => {
		const updateData: Record<string, unknown> = { ...input };

		// If marking as completed, set completedAt
		if (input.status === "completed") {
			updateData.completedAt = new Date();
		}

		await db
			.update(schema.weeklyGoal)
			.set(updateData)
			.where(and(eq(schema.weeklyGoal.id, id), eq(schema.weeklyGoal.userId, userId)));
	},

	deleteWeeklyGoal: async (id: string, userId: string) => {
		await db.delete(schema.weeklyGoal).where(and(eq(schema.weeklyGoal.id, id), eq(schema.weeklyGoal.userId, userId)));
	},

	getWeeklyGoals: async (userId: string, weekStartDate: string) => {
		return db
			.select()
			.from(schema.weeklyGoal)
			.where(and(eq(schema.weeklyGoal.userId, userId), eq(schema.weeklyGoal.weekStartDate, weekStartDate)))
			.orderBy(schema.weeklyGoal.priority);
	},

	getCurrentWeekGoals: async (userId: string) => {
		// Get Monday of current week
		const today = new Date();
		const dayOfWeek = today.getDay();
		const monday = new Date(today);
		monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
		const weekStartDate = monday.toISOString().split("T")[0];

		return careerCoachingService.getWeeklyGoals(userId, weekStartDate);
	},

	getWeeklyGoalStats: async (userId: string) => {
		// Get Monday of current week
		const today = new Date();
		const dayOfWeek = today.getDay();
		const monday = new Date(today);
		monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
		const weekStartDate = monday.toISOString().split("T")[0];

		const goals = await careerCoachingService.getWeeklyGoals(userId, weekStartDate);

		const total = goals.length;
		const completed = goals.filter((g) => g.status === "completed").length;
		const inProgress = goals.filter((g) => g.status === "in_progress").length;
		const pending = goals.filter((g) => g.status === "pending").length;

		return {
			total,
			completed,
			inProgress,
			pending,
			completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
			byCategory: {
				applications: goals.filter((g) => g.category === "applications").length,
				networking: goals.filter((g) => g.category === "networking").length,
				skills: goals.filter((g) => g.category === "skills").length,
				interview_prep: goals.filter((g) => g.category === "interview_prep").length,
				personal_branding: goals.filter((g) => g.category === "personal_branding").length,
				research: goals.filter((g) => g.category === "research").length,
				other: goals.filter((g) => g.category === "other").length,
			},
		};
	},

	// ==========================================
	// CONFIDENCE JOURNAL
	// ==========================================

	createJournalEntry: async (input: {
		userId: string;
		entryType: (typeof schema.confidenceJournal.$inferSelect)["entryType"];
		entryDate: string;
		title: string;
		content: string;
		mood?: number;
		tags?: string[];
	}) => {
		const id = generateId();
		await db.insert(schema.confidenceJournal).values({
			id,
			userId: input.userId,
			entryType: input.entryType,
			entryDate: input.entryDate,
			title: input.title,
			content: input.content,
			mood: input.mood,
			tags: input.tags || [],
		});
		return id;
	},

	updateJournalEntry: async (
		id: string,
		userId: string,
		input: Partial<{
			title: string;
			content: string;
			mood: number;
			tags: string[];
		}>,
	) => {
		await db
			.update(schema.confidenceJournal)
			.set(input)
			.where(and(eq(schema.confidenceJournal.id, id), eq(schema.confidenceJournal.userId, userId)));
	},

	deleteJournalEntry: async (id: string, userId: string) => {
		await db
			.delete(schema.confidenceJournal)
			.where(and(eq(schema.confidenceJournal.id, id), eq(schema.confidenceJournal.userId, userId)));
	},

	getJournalEntries: async (
		userId: string,
		filters?: {
			entryType?: (typeof schema.confidenceJournal.$inferSelect)["entryType"];
			startDate?: string;
			endDate?: string;
			limit?: number;
		},
	) => {
		const conditions = [eq(schema.confidenceJournal.userId, userId)];

		if (filters?.entryType) {
			conditions.push(eq(schema.confidenceJournal.entryType, filters.entryType));
		}
		if (filters?.startDate) {
			conditions.push(gte(schema.confidenceJournal.entryDate, filters.startDate));
		}
		if (filters?.endDate) {
			conditions.push(lte(schema.confidenceJournal.entryDate, filters.endDate));
		}

		return db
			.select()
			.from(schema.confidenceJournal)
			.where(and(...conditions))
			.orderBy(desc(schema.confidenceJournal.entryDate))
			.limit(filters?.limit || 30);
	},

	getTodaysWins: async (userId: string) => {
		const today = new Date().toISOString().split("T")[0];
		return db
			.select()
			.from(schema.confidenceJournal)
			.where(
				and(
					eq(schema.confidenceJournal.userId, userId),
					eq(schema.confidenceJournal.entryDate, today),
					eq(schema.confidenceJournal.entryType, "win"),
				),
			);
	},

	getJournalStats: async (userId: string, days = 30) => {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);
		const startDateStr = startDate.toISOString().split("T")[0];

		const entries = await db
			.select()
			.from(schema.confidenceJournal)
			.where(and(eq(schema.confidenceJournal.userId, userId), gte(schema.confidenceJournal.entryDate, startDateStr)));

		const totalEntries = entries.length;
		const winCount = entries.filter((e) => e.entryType === "win").length;
		const challengeCount = entries.filter((e) => e.entryType === "challenge").length;
		const learningCount = entries.filter((e) => e.entryType === "learning").length;

		const moodEntries = entries.filter((e) => e.mood !== null && e.mood !== undefined);
		const averageMood =
			moodEntries.length > 0 ? moodEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / moodEntries.length : 0;

		// Calculate streak using all entries (not limited by the days window)
		let streak = 0;
		const today = new Date();
		const allEntryDates = await db
			.select({ entryDate: schema.confidenceJournal.entryDate })
			.from(schema.confidenceJournal)
			.where(eq(schema.confidenceJournal.userId, userId));
		const allDateSet = new Set(allEntryDates.map((e) => e.entryDate));
		for (let i = 0; i < 365; i++) {
			const checkDate = new Date(today);
			checkDate.setDate(today.getDate() - i);
			const dateStr = checkDate.toISOString().split("T")[0];
			if (allDateSet.has(dateStr)) {
				streak++;
			} else if (i > 0) {
				break;
			}
		}

		return {
			totalEntries,
			winCount,
			challengeCount,
			learningCount,
			averageMood: Math.round(averageMood * 10) / 10,
			streak,
			daysTracked: new Set(entries.map((e) => e.entryDate)).size,
		};
	},

	// ==========================================
	// DAILY AFFIRMATIONS
	// ==========================================

	getTodaysAffirmation: async (userId: string, category?: string) => {
		// Get a random affirmation the user hasn't seen today
		const today = new Date();
		const startOfDay = new Date(today.setHours(0, 0, 0, 0));

		// Get all active affirmations
		let query = db.select().from(schema.dailyAffirmation).where(eq(schema.dailyAffirmation.isActive, true));

		if (category) {
			query = db
				.select()
				.from(schema.dailyAffirmation)
				.where(and(eq(schema.dailyAffirmation.isActive, true), eq(schema.dailyAffirmation.category, category)));
		}

		const affirmations = await query;

		if (affirmations.length === 0) {
			return null;
		}

		// Get affirmations seen today
		const seenToday = await db
			.select({ affirmationId: schema.userAffirmationProgress.affirmationId })
			.from(schema.userAffirmationProgress)
			.where(
				and(eq(schema.userAffirmationProgress.userId, userId), gte(schema.userAffirmationProgress.seenAt, startOfDay)),
			);

		const seenIds = new Set(seenToday.map((s) => s.affirmationId));
		const unseenAffirmations = affirmations.filter((a) => !seenIds.has(a.id));

		// If all seen, pick a random one; otherwise pick from unseen
		const pool = unseenAffirmations.length > 0 ? unseenAffirmations : affirmations;
		const selected = pool[Math.floor(Math.random() * pool.length)];

		// Mark as seen
		if (selected) {
			const progressId = generateId();
			await db
				.insert(schema.userAffirmationProgress)
				.values({
					id: progressId,
					userId,
					affirmationId: selected.id,
					seenAt: new Date(),
				})
				.onConflictDoUpdate({
					target: [schema.userAffirmationProgress.userId, schema.userAffirmationProgress.affirmationId],
					set: { seenAt: new Date() },
				});
		}

		return selected;
	},

	likeAffirmation: async (userId: string, affirmationId: string) => {
		await db
			.update(schema.userAffirmationProgress)
			.set({ isLiked: true })
			.where(
				and(
					eq(schema.userAffirmationProgress.userId, userId),
					eq(schema.userAffirmationProgress.affirmationId, affirmationId),
				),
			);
	},

	saveAffirmation: async (userId: string, affirmationId: string) => {
		await db
			.update(schema.userAffirmationProgress)
			.set({ isSaved: true })
			.where(
				and(
					eq(schema.userAffirmationProgress.userId, userId),
					eq(schema.userAffirmationProgress.affirmationId, affirmationId),
				),
			);
	},

	getSavedAffirmations: async (userId: string) => {
		const saved = await db
			.select({
				affirmation: schema.dailyAffirmation,
			})
			.from(schema.userAffirmationProgress)
			.innerJoin(schema.dailyAffirmation, eq(schema.userAffirmationProgress.affirmationId, schema.dailyAffirmation.id))
			.where(and(eq(schema.userAffirmationProgress.userId, userId), eq(schema.userAffirmationProgress.isSaved, true)));

		return saved.map((s) => s.affirmation);
	},

	// Seed affirmations
	seedAffirmations: async () => {
		for (const [category, affirmations] of Object.entries(DEFAULT_AFFIRMATIONS)) {
			for (let i = 0; i < affirmations.length; i++) {
				const aff = affirmations[i];
				const id = generateId();
				await db.insert(schema.dailyAffirmation).values({
					id,
					category,
					content: aff.content,
					contentFr: aff.contentFr,
					contentAr: aff.contentAr,
					isActive: true,
					sortOrder: i,
				});
			}
		}
		return { seeded: true };
	},

	// ==========================================
	// COACHING SESSIONS
	// ==========================================

	createCoachingSession: async (input: {
		userId: string;
		topic: (typeof schema.coachingSession.$inferSelect)["topic"];
		scheduledAt?: Date;
		notes?: string;
	}) => {
		const id = generateId();
		await db.insert(schema.coachingSession).values({
			id,
			userId: input.userId,
			topic: input.topic,
			scheduledAt: input.scheduledAt,
			notes: input.notes,
			status: "scheduled",
		});
		return id;
	},

	updateCoachingSession: async (
		id: string,
		userId: string,
		input: Partial<{
			status: (typeof schema.coachingSession.$inferSelect)["status"];
			startedAt: Date;
			completedAt: Date;
			duration: number;
			notes: string;
			aiSummary: string;
			actionItems: string[];
			nextSteps: string[];
			confidenceBefore: (typeof schema.coachingSession.$inferSelect)["confidenceBefore"];
			confidenceAfter: (typeof schema.coachingSession.$inferSelect)["confidenceAfter"];
			rating: number;
			feedback: string;
		}>,
	) => {
		await db
			.update(schema.coachingSession)
			.set(input)
			.where(and(eq(schema.coachingSession.id, id), eq(schema.coachingSession.userId, userId)));
	},

	getCoachingSession: async (id: string, userId: string) => {
		const [session] = await db
			.select()
			.from(schema.coachingSession)
			.where(and(eq(schema.coachingSession.id, id), eq(schema.coachingSession.userId, userId)));
		return session ?? null;
	},

	listCoachingSessions: async (userId: string, limit = 20) => {
		return db
			.select()
			.from(schema.coachingSession)
			.where(eq(schema.coachingSession.userId, userId))
			.orderBy(desc(schema.coachingSession.createdAt))
			.limit(limit);
	},

	// ==========================================
	// DASHBOARD STATS
	// ==========================================

	getDashboardStats: async (userId: string) => {
		const [careerPath] = await db
			.select()
			.from(schema.careerPath)
			.where(and(eq(schema.careerPath.userId, userId), eq(schema.careerPath.isActive, true)))
			.limit(1);

		const weeklyStats = await careerCoachingService.getWeeklyGoalStats(userId);
		const journalStats = await careerCoachingService.getJournalStats(userId, 30);
		const latestSkillGap = await careerCoachingService.getLatestSkillGapAnalysis(userId);

		const [sessionsCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(schema.coachingSession)
			.where(eq(schema.coachingSession.userId, userId));

		return {
			careerPath: careerPath
				? {
						targetRole: careerPath.targetRole,
						progress: careerPath.overallProgress ?? 0,
						milestonesTotal: careerPath.milestones?.length || 0,
						milestonesCompleted: careerPath.milestones?.filter((m) => m.status === "completed").length || 0,
					}
				: null,
			weeklyGoals: weeklyStats,
			journal: journalStats,
			skillReadiness: latestSkillGap?.overallReadiness ?? 0,
			coachingSessions: Number(sessionsCount?.count || 0),
		};
	},
};
