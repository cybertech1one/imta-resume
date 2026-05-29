import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import { createTogetherAI } from "@ai-sdk/togetherai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ORPCError } from "@orpc/client";
import { createGateway, generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";
import { and, desc, eq, sql } from "drizzle-orm";
import { match } from "ts-pattern";
import { db } from "@/integrations/drizzle/client";
import {
	type AdaptiveLearningModule,
	adaptiveLearningMilestone,
	adaptiveLearningPath,
	adaptiveLearningRecommendation,
	adaptiveSkillAssessment,
	type LearningMilestoneStatus,
	type LearningRecommendationPriority,
	type LearningRecommendationType,
	type SkillAssessmentLevel,
	type SkillStrengthWeakness,
	studentLearningProfile,
} from "@/integrations/drizzle/schema";
import { generateId } from "@/utils/string";
import { aiConfigService } from "./ai-config";
import { aiHistoryService } from "./ai-history";

// ============================================================================
// AI MODEL SETUP
// ============================================================================

type AIProvider =
	| "ollama"
	| "openai"
	| "gemini"
	| "anthropic"
	| "vercel-ai-gateway"
	| "deepseek"
	| "groq"
	| "mistral"
	| "togetherai"
	| "openrouter";

type GetModelInput = {
	provider: AIProvider;
	model: string;
	apiKey: string;
	baseURL: string;
};

function getModel(input: GetModelInput) {
	const { provider, model, apiKey } = input;
	const baseURL = input.baseURL || undefined;

	return match(provider)
		.with("openai", () => createOpenAI({ apiKey, baseURL }).languageModel(model))
		.with("ollama", () => createOllama({ apiKey, baseURL }).languageModel(model))
		.with("anthropic", () => createAnthropic({ apiKey, baseURL }).languageModel(model))
		.with("vercel-ai-gateway", () => createGateway({ apiKey, baseURL }).languageModel(model))
		.with("gemini", () => createGoogleGenerativeAI({ apiKey, baseURL }).languageModel(model))
		.with("deepseek", () => createDeepSeek({ apiKey, baseURL }).languageModel(model))
		.with("groq", () => createGroq({ apiKey, baseURL }).languageModel(model))
		.with("mistral", () => createMistral({ apiKey, baseURL }).languageModel(model))
		.with("togetherai", () => createTogetherAI({ apiKey, baseURL }).languageModel(model))
		.with("openrouter", () => createOpenRouter({ apiKey, baseURL }).languageModel(model))
		.exhaustive();
}

async function getServerModel() {
	let config: Awaited<ReturnType<typeof aiConfigService.getActiveProvider>>;
	try {
		config = await aiConfigService.getActiveProvider();
	} catch {
		throw new ORPCError("PRECONDITION_FAILED", {
			message: "No AI provider configured. Please ask an administrator to set up AI.",
		});
	}
	return {
		model: getModel({
			provider: config.provider as AIProvider,
			model: config.model,
			apiKey: config.apiKey,
			baseURL: config.baseUrl || "",
		}),
		config,
	};
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CreateProfileInput = {
	userId: string;
	learningStyle?: "visual" | "auditory" | "reading_writing" | "kinesthetic" | "mixed";
	preferredPace?: "slow" | "moderate" | "fast" | "self_paced";
	dailyTimeCommitment?: number;
	weeklyGoalHours?: number;
	preferredSessionLength?: number;
	currentField?: string;
	currentLevel?: SkillAssessmentLevel;
	targetLevel?: SkillAssessmentLevel;
	contentPreferences?: {
		preferredFormats: string[];
		preferredLanguages: string[];
		excludedTopics: string[];
	};
};

export type UpdateProfileInput = Partial<Omit<CreateProfileInput, "userId">>;

export type CreatePathInput = {
	userId: string;
	profileId?: string;
	title: string;
	titleFr?: string;
	description?: string;
	descriptionFr?: string;
	field: string;
	targetRole?: string;
	targetRoleFr?: string;
	targetSkills?: string[];
	targetLevel?: SkillAssessmentLevel;
	estimatedDuration?: string;
	estimatedHours?: number;
	modules?: AdaptiveLearningModule[];
	targetCompletionDate?: Date;
	isPrimary?: boolean;
};

export type CreateMilestoneInput = {
	pathId: string;
	userId: string;
	title: string;
	titleFr?: string;
	description?: string;
	descriptionFr?: string;
	order: number;
	requiredSkills?: string[];
	requiredAssessmentScore?: number;
	xpReward?: number;
	badgeReward?: string;
	certificateReward?: boolean;
	targetDate?: Date;
};

export type CreateAssessmentInput = {
	userId: string;
	profileId?: string;
	pathId?: string;
	milestoneId?: string;
	skillId: string;
	skillName: string;
	skillNameFr?: string;
	category: string;
	field?: string;
	assessmentType?: string;
	currentLevel: SkillAssessmentLevel;
	score: number;
	confidenceScore?: number;
	questionsTotal?: number;
	questionsCorrect?: number;
	timeSpent?: number;
	detailedResults?: {
		strengths: string[];
		weaknesses: string[];
		recommendations: string[];
		topicScores: Record<string, number>;
	};
	aiEvaluation?: string;
	aiSuggestions?: string[];
};

export type CreateRecommendationInput = {
	userId: string;
	profileId?: string;
	pathId?: string;
	type: LearningRecommendationType;
	priority?: LearningRecommendationPriority;
	title: string;
	titleFr?: string;
	description: string;
	descriptionFr?: string;
	targetSkillId?: string;
	targetSkillName?: string;
	targetTopicId?: string;
	reason: string;
	reasonFr?: string;
	basedOnAssessment?: string;
	actionType?: string;
	actionUrl?: string;
	estimatedTime?: number;
	difficulty?: string;
	aiConfidence?: number;
	aiModel?: string;
	expiresAt?: Date;
};

// ============================================================================
// STUDENT LEARNING PROFILE SERVICE
// ============================================================================

export const learningProfileService = {
	// Get or create profile for user
	async getOrCreate(userId: string) {
		let [profile] = await db.select().from(studentLearningProfile).where(eq(studentLearningProfile.userId, userId));

		if (!profile) {
			const id = generateId();
			await db.insert(studentLearningProfile).values({ id, userId });
			[profile] = await db.select().from(studentLearningProfile).where(eq(studentLearningProfile.id, id));
		}

		return profile;
	},

	// Get profile by user ID
	async getByUserId(userId: string) {
		const [profile] = await db.select().from(studentLearningProfile).where(eq(studentLearningProfile.userId, userId));
		return profile;
	},

	// Create a new profile
	async create(input: CreateProfileInput) {
		const id = generateId();
		await db.insert(studentLearningProfile).values({ id, ...input });
		const [profile] = await db.select().from(studentLearningProfile).where(eq(studentLearningProfile.id, id));
		return profile;
	},

	// Update profile
	async update(userId: string, input: UpdateProfileInput) {
		await db.update(studentLearningProfile).set(input).where(eq(studentLearningProfile.userId, userId));
		return this.getByUserId(userId);
	},

	// Update strengths and weaknesses
	async updateStrengthsWeaknesses(
		userId: string,
		strengths: SkillStrengthWeakness[],
		weaknesses: SkillStrengthWeakness[],
	) {
		await db
			.update(studentLearningProfile)
			.set({ strengths, weaknesses })
			.where(eq(studentLearningProfile.userId, userId));
		return this.getByUserId(userId);
	},

	// Update performance metrics
	async updatePerformanceMetrics(
		userId: string,
		metrics: {
			totalLearningHours?: number;
			totalAssessments?: number;
			averageAssessmentScore?: number;
			currentStreak?: number;
			longestStreak?: number;
			lastActivityDate?: string;
		},
	) {
		await db.update(studentLearningProfile).set(metrics).where(eq(studentLearningProfile.userId, userId));
		return this.getByUserId(userId);
	},

	// Complete onboarding
	async completeOnboarding(userId: string) {
		await db
			.update(studentLearningProfile)
			.set({
				onboardingCompleted: true,
				onboardingCompletedAt: new Date(),
			})
			.where(eq(studentLearningProfile.userId, userId));
		return this.getByUserId(userId);
	},

	// Adjust difficulty multiplier based on performance
	async adjustDifficulty(userId: string, performanceScore: number) {
		const profile = await this.getByUserId(userId);
		if (!profile) return null;

		let newMultiplier = profile.difficultyMultiplier || 1.0;

		// If performance is consistently high (>85%), increase difficulty
		if (performanceScore > 85) {
			newMultiplier = Math.min(newMultiplier + 0.1, 2.0);
		}
		// If performance is low (<50%), decrease difficulty
		else if (performanceScore < 50) {
			newMultiplier = Math.max(newMultiplier - 0.1, 0.5);
		}

		await db
			.update(studentLearningProfile)
			.set({ difficultyMultiplier: newMultiplier })
			.where(eq(studentLearningProfile.userId, userId));

		return this.getByUserId(userId);
	},
};

// ============================================================================
// ADAPTIVE LEARNING PATH SERVICE
// ============================================================================

export const learningPathService = {
	// List paths for user
	async list(userId: string, options?: { status?: string; field?: string; activeOnly?: boolean }) {
		const conditions = [eq(adaptiveLearningPath.userId, userId)];

		if (options?.status) {
			conditions.push(eq(adaptiveLearningPath.status, options.status as never));
		}
		if (options?.field) {
			conditions.push(eq(adaptiveLearningPath.field, options.field));
		}
		if (options?.activeOnly !== false) {
			conditions.push(eq(adaptiveLearningPath.isActive, true));
		}

		return db
			.select()
			.from(adaptiveLearningPath)
			.where(and(...conditions))
			.orderBy(desc(adaptiveLearningPath.isPrimary), desc(adaptiveLearningPath.createdAt));
	},

	// Get path by ID
	async getById(id: string) {
		const [path] = await db.select().from(adaptiveLearningPath).where(eq(adaptiveLearningPath.id, id));
		return path;
	},

	// Get primary path for user
	async getPrimary(userId: string) {
		const [path] = await db
			.select()
			.from(adaptiveLearningPath)
			.where(and(eq(adaptiveLearningPath.userId, userId), eq(adaptiveLearningPath.isPrimary, true)));
		return path;
	},

	// Create a new path
	async create(input: CreatePathInput) {
		const id = generateId();
		const totalModules = input.modules?.length || 0;

		await db.insert(adaptiveLearningPath).values({
			id,
			...input,
			totalModules,
			modules: input.modules || [],
		});

		// If this is primary, unset other primary paths
		if (input.isPrimary) {
			await db
				.update(adaptiveLearningPath)
				.set({ isPrimary: false })
				.where(and(eq(adaptiveLearningPath.userId, input.userId), sql`${adaptiveLearningPath.id} != ${id}`));
		}

		return this.getById(id);
	},

	// Update path
	async update(id: string, userId: string, input: Partial<CreatePathInput>) {
		const [existing] = await db
			.select()
			.from(adaptiveLearningPath)
			.where(and(eq(adaptiveLearningPath.id, id), eq(adaptiveLearningPath.userId, userId)));

		if (!existing) {
			throw new ORPCError("NOT_FOUND", { message: "Learning path not found" });
		}

		const updateData: Record<string, unknown> = { ...input };
		if (input.modules) {
			updateData.totalModules = input.modules.length;
		}

		await db.update(adaptiveLearningPath).set(updateData).where(eq(adaptiveLearningPath.id, id));

		// If setting as primary, unset others
		if (input.isPrimary) {
			await db
				.update(adaptiveLearningPath)
				.set({ isPrimary: false })
				.where(and(eq(adaptiveLearningPath.userId, userId), sql`${adaptiveLearningPath.id} != ${id}`));
		}

		return this.getById(id);
	},

	// Start a path
	async start(id: string, userId: string) {
		const [path] = await db
			.select()
			.from(adaptiveLearningPath)
			.where(and(eq(adaptiveLearningPath.id, id), eq(adaptiveLearningPath.userId, userId)));

		if (!path) {
			throw new ORPCError("NOT_FOUND", { message: "Learning path not found" });
		}

		await db
			.update(adaptiveLearningPath)
			.set({
				status: "in_progress",
				startedAt: new Date(),
				lastAccessedAt: new Date(),
			})
			.where(eq(adaptiveLearningPath.id, id));

		// Unlock first milestone
		const [firstMilestone] = await db
			.select()
			.from(adaptiveLearningMilestone)
			.where(eq(adaptiveLearningMilestone.pathId, id))
			.orderBy(adaptiveLearningMilestone.order)
			.limit(1);

		if (firstMilestone) {
			await db
				.update(adaptiveLearningMilestone)
				.set({ status: "unlocked", unlockedAt: new Date() })
				.where(eq(adaptiveLearningMilestone.id, firstMilestone.id));
		}

		return this.getById(id);
	},

	// Update progress
	async updateProgress(id: string, userId: string, progress: number, completedModules?: number) {
		const updateData: Record<string, unknown> = {
			progress: Math.min(100, Math.max(0, progress)),
			lastAccessedAt: new Date(),
		};

		if (completedModules !== undefined) {
			updateData.completedModules = completedModules;
		}

		if (progress >= 100) {
			updateData.status = "completed";
			updateData.completedAt = new Date();
		}

		await db
			.update(adaptiveLearningPath)
			.set(updateData)
			.where(and(eq(adaptiveLearningPath.id, id), eq(adaptiveLearningPath.userId, userId)));

		return this.getById(id);
	},

	// Delete path
	async delete(id: string, userId: string) {
		await db
			.delete(adaptiveLearningPath)
			.where(and(eq(adaptiveLearningPath.id, id), eq(adaptiveLearningPath.userId, userId)));
	},

	// Generate AI-powered learning path
	async generatePath(userId: string, input: { field: string; targetRole: string; targetLevel: SkillAssessmentLevel }) {
		const profile = await learningProfileService.getOrCreate(userId);
		const { model } = await getServerModel();

		const prompt = `Réponds entièrement en français. Tous les titres, descriptions et contenus doivent être en français.
Génère un parcours d'apprentissage personnalisé pour un(e) étudiant(e) au Maroc.

Profil étudiant :
- Domaine actuel : ${profile.currentField || input.field}
- Niveau actuel : ${profile.currentLevel || "débutant"}
- Niveau cible : ${input.targetLevel}
- Rôle cible : ${input.targetRole}
- Style d'apprentissage : ${profile.learningStyle || "mixte"}
- Rythme préféré : ${profile.preferredPace || "modéré"}
- Heures disponibles par semaine : ${profile.weeklyGoalHours || 5}

Crée un parcours d'apprentissage structuré avec :
1. Un titre accrocheur et une description motivante (en français)
2. 4 à 6 modules d'apprentissage, chacun contenant :
   - Titre en français (champ title ET titleFr doivent être en français)
   - Compétences à acquérir
   - Heures estimées
   - 3 à 5 ressources pédagogiques (mix vidéos, articles, quiz, exercices)
3. Durée totale estimée
4. Jalons clés

IMPORTANT : Les champs "title" et "titleFr" doivent TOUS LES DEUX être en français. Ne mets PAS d'anglais dans "title".

Réponds au format JSON :
{
  "title": "string (en français)",
  "titleFr": "string (en français)",
  "description": "string",
  "descriptionFr": "string",
  "estimatedDuration": "string",
  "estimatedHours": number,
  "targetSkills": ["string"],
  "modules": [
    {
      "id": "string (uuid)",
      "title": "string (en français)",
      "titleFr": "string (en français)",
      "description": "string",
      "order": number,
      "estimatedHours": number,
      "skillsToLearn": ["string"],
      "resources": [
        {
          "id": "string (uuid)",
          "type": "video|article|quiz|exercise|project",
          "title": "string",
          "duration": number (minutes),
          "completed": false
        }
      ],
      "isCompleted": false,
      "progress": 0
    }
  ],
  "milestones": [
    {
      "title": "string",
      "titleFr": "string",
      "description": "string",
      "order": number,
      "requiredSkills": ["string"],
      "xpReward": number
    }
  ]
}`;

		try {
			const result = await generateText({
				model,
				prompt,
				temperature: 0.7,
			});

			// Parse the JSON response
			const jsonMatch = result.text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error("Failed to parse AI response");
			}

			const pathData = JSON.parse(jsonMatch[0]);

			// Create the path
			const pathId = generateId();
			await db.insert(adaptiveLearningPath).values({
				id: pathId,
				userId,
				profileId: profile.id,
				title: pathData.title,
				titleFr: pathData.titleFr,
				description: pathData.description,
				descriptionFr: pathData.descriptionFr,
				field: input.field,
				targetRole: input.targetRole,
				targetLevel: input.targetLevel,
				targetSkills: pathData.targetSkills,
				estimatedDuration: pathData.estimatedDuration,
				estimatedHours: pathData.estimatedHours,
				modules: pathData.modules,
				totalModules: pathData.modules.length,
				aiGenerated: true,
				aiAnalysis: result.text,
				isPrimary: true,
			});

			// Create milestones
			for (const milestone of pathData.milestones || []) {
				await db.insert(adaptiveLearningMilestone).values({
					id: generateId(),
					pathId,
					userId,
					title: milestone.title,
					titleFr: milestone.titleFr,
					description: milestone.description,
					order: milestone.order,
					requiredSkills: milestone.requiredSkills,
					xpReward: milestone.xpReward || 100,
					status: milestone.order === 0 ? "unlocked" : "locked",
				});
			}

			// Unset other primary paths
			await db
				.update(adaptiveLearningPath)
				.set({ isPrimary: false })
				.where(and(eq(adaptiveLearningPath.userId, userId), sql`${adaptiveLearningPath.id} != ${pathId}`));

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId,
					source: "learning_path_generate",
					generatedContent: `Parcours d'apprentissage: ${pathData.title}`,
					outputData: { pathId, title: pathData.title, modulesCount: pathData.modules.length },
					inputData: { field: input.field, targetRole: input.targetRole, targetLevel: input.targetLevel },
					metadata: {},
				})
				.catch((err) => console.error("[AI History] Failed to save adaptive learning path:", err));

			return this.getById(pathId);
		} catch (error) {
			console.error("Failed to generate learning path:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to generate learning path with AI",
			});
		}
	},
};

// ============================================================================
// LEARNING MILESTONE SERVICE
// ============================================================================

export const milestoneService = {
	// List milestones for a path
	async listByPath(pathId: string) {
		return db
			.select()
			.from(adaptiveLearningMilestone)
			.where(eq(adaptiveLearningMilestone.pathId, pathId))
			.orderBy(adaptiveLearningMilestone.order);
	},

	// Get milestone by ID
	async getById(id: string) {
		const [milestone] = await db.select().from(adaptiveLearningMilestone).where(eq(adaptiveLearningMilestone.id, id));
		return milestone;
	},

	// Create milestone
	async create(input: CreateMilestoneInput) {
		const id = generateId();
		await db.insert(adaptiveLearningMilestone).values({ id, ...input });
		return this.getById(id);
	},

	// Update milestone
	async update(id: string, input: Partial<CreateMilestoneInput>) {
		await db.update(adaptiveLearningMilestone).set(input).where(eq(adaptiveLearningMilestone.id, id));
		return this.getById(id);
	},

	// Update milestone status
	async updateStatus(id: string, status: LearningMilestoneStatus, assessmentScore?: number) {
		const updateData: Record<string, unknown> = { status };

		if (status === "unlocked" && !assessmentScore) {
			updateData.unlockedAt = new Date();
		} else if (status === "in_progress") {
			updateData.startedAt = new Date();
		} else if (status === "completed") {
			updateData.completedAt = new Date();
			updateData.progress = 100;
			if (assessmentScore !== undefined) {
				updateData.assessmentScore = assessmentScore;
			}
		}

		await db.update(adaptiveLearningMilestone).set(updateData).where(eq(adaptiveLearningMilestone.id, id));

		// If completed, unlock next milestone
		if (status === "completed") {
			const milestone = await this.getById(id);
			if (milestone) {
				const [nextMilestone] = await db
					.select()
					.from(adaptiveLearningMilestone)
					.where(
						and(
							eq(adaptiveLearningMilestone.pathId, milestone.pathId),
							sql`${adaptiveLearningMilestone.order} > ${milestone.order}`,
						),
					)
					.orderBy(adaptiveLearningMilestone.order)
					.limit(1);

				if (nextMilestone) {
					await db
						.update(adaptiveLearningMilestone)
						.set({ status: "unlocked", unlockedAt: new Date() })
						.where(eq(adaptiveLearningMilestone.id, nextMilestone.id));
				}
			}
		}

		return this.getById(id);
	},

	// Update milestone progress
	async updateProgress(id: string, progress: number) {
		const updateData: Record<string, unknown> = {
			progress: Math.min(100, Math.max(0, progress)),
		};

		if (progress >= 100) {
			updateData.status = "completed";
			updateData.completedAt = new Date();
		} else if (progress > 0) {
			updateData.status = "in_progress";
		}

		await db.update(adaptiveLearningMilestone).set(updateData).where(eq(adaptiveLearningMilestone.id, id));
		return this.getById(id);
	},

	// Delete milestone
	async delete(id: string) {
		await db.delete(adaptiveLearningMilestone).where(eq(adaptiveLearningMilestone.id, id));
	},
};

// ============================================================================
// SKILL ASSESSMENT SERVICE
// ============================================================================

export const assessmentService = {
	// List assessments for user
	async list(userId: string, options?: { skillId?: string; category?: string; field?: string; limit?: number }) {
		const conditions = [eq(adaptiveSkillAssessment.userId, userId)];

		if (options?.skillId) {
			conditions.push(eq(adaptiveSkillAssessment.skillId, options.skillId));
		}
		if (options?.category) {
			conditions.push(eq(adaptiveSkillAssessment.category, options.category));
		}
		if (options?.field) {
			conditions.push(eq(adaptiveSkillAssessment.field, options.field));
		}

		let query = db
			.select()
			.from(adaptiveSkillAssessment)
			.where(and(...conditions))
			.orderBy(desc(adaptiveSkillAssessment.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as typeof query;
		}

		return query;
	},

	// Get assessment by ID
	async getById(id: string) {
		const [assessment] = await db.select().from(adaptiveSkillAssessment).where(eq(adaptiveSkillAssessment.id, id));
		return assessment;
	},

	// Get latest assessment for a skill
	async getLatest(userId: string, skillId: string) {
		const [assessment] = await db
			.select()
			.from(adaptiveSkillAssessment)
			.where(and(eq(adaptiveSkillAssessment.userId, userId), eq(adaptiveSkillAssessment.skillId, skillId)))
			.orderBy(desc(adaptiveSkillAssessment.createdAt))
			.limit(1);
		return assessment;
	},

	// Create assessment
	async create(input: CreateAssessmentInput) {
		const id = generateId();

		// Get previous assessment for trend calculation
		const previousAssessment = await this.getLatest(input.userId, input.skillId);
		let trend = "stable";
		let improvementPercent: number | undefined;

		if (previousAssessment) {
			const scoreDiff = input.score - previousAssessment.score;
			if (scoreDiff > 5) {
				trend = "improving";
				improvementPercent = scoreDiff;
			} else if (scoreDiff < -5) {
				trend = "declining";
				improvementPercent = scoreDiff;
			}
		}

		await db.insert(adaptiveSkillAssessment).values({
			id,
			...input,
			previousLevel: previousAssessment?.currentLevel,
			trend,
			improvementPercent,
			validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Valid for 90 days
		});

		// Update profile with new assessment data
		const profile = await learningProfileService.getByUserId(input.userId);
		if (profile) {
			await learningProfileService.updatePerformanceMetrics(input.userId, {
				totalAssessments: (profile.totalAssessments || 0) + 1,
				averageAssessmentScore: profile.averageAssessmentScore
					? Math.round((profile.averageAssessmentScore + input.score) / 2)
					: input.score,
				lastActivityDate: new Date().toISOString().split("T")[0],
			});
		}

		return this.getById(id);
	},

	// AI-powered skill assessment
	async assessSkillLevel(userId: string, skillId: string, skillName: string, category: string, field?: string) {
		const profile = await learningProfileService.getOrCreate(userId);
		const previousAssessments = await this.list(userId, { skillId, limit: 5 });
		const { model } = await getServerModel();

		const assessmentHistory =
			previousAssessments.length > 0
				? previousAssessments.map((a) => ({
						date: a.createdAt,
						score: a.score,
						level: a.currentLevel,
					}))
				: "No previous assessments";

		const prompt = `Réponds entièrement en français. Toutes les évaluations, forces, faiblesses et recommandations doivent être en français.
Évalue le niveau actuel d'un(e) étudiant(e) en fonction de son profil d'apprentissage et de son historique d'évaluations.

Profil étudiant :
- Domaine actuel : ${profile.currentField || field || "général"}
- Niveau actuel : ${profile.currentLevel || "débutant"}
- Style d'apprentissage : ${profile.learningStyle || "mixte"}
- Points forts : ${JSON.stringify(profile.strengths || [])}
- Points faibles : ${JSON.stringify(profile.weaknesses || [])}

Compétence à évaluer :
- Nom de la compétence : ${skillName}
- Catégorie : ${category}
- Domaine : ${field || "général"}

Historique des évaluations : ${JSON.stringify(assessmentHistory)}

Fournis une évaluation IA du niveau de compétence avec :
1. Niveau actuel (novice, beginner, intermediate, advanced, expert)
2. Score de confiance (0-100)
3. Score estimé (0-100)
4. Points forts dans cette compétence (en français)
5. Axes d'amélioration (en français)
6. Recommandations spécifiques (en français)

Réponds au format JSON :
{
  "currentLevel": "novice|beginner|intermediate|advanced|expert",
  "score": number (0-100),
  "confidenceScore": number (0-100),
  "detailedResults": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "recommendations": ["string"],
    "topicScores": {}
  },
  "aiEvaluation": "string (detailed analysis)",
  "aiSuggestions": ["string"]
}`;

		try {
			const result = await generateText({
				model,
				prompt,
				temperature: 0.5,
			});

			const jsonMatch = result.text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error("Failed to parse AI response");
			}

			const evaluation = JSON.parse(jsonMatch[0]);

			// Create the assessment
			const assessment = await this.create({
				userId,
				profileId: profile.id,
				skillId,
				skillName,
				category,
				field,
				assessmentType: "ai_evaluation",
				currentLevel: evaluation.currentLevel as SkillAssessmentLevel,
				score: evaluation.score,
				confidenceScore: evaluation.confidenceScore,
				detailedResults: evaluation.detailedResults,
				aiEvaluation: evaluation.aiEvaluation,
				aiSuggestions: evaluation.aiSuggestions,
			});

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId,
					source: "adaptive_quiz",
					generatedContent: evaluation.aiEvaluation,
					outputData: evaluation,
					inputData: { skillId, skillName, category, field },
					metadata: {},
				})
				.catch((err) => console.error("[AI History] Failed to save skill assessment:", err));

			return assessment;
		} catch (error) {
			console.error("Failed to assess skill level:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to assess skill level with AI",
			});
		}
	},
};

// ============================================================================
// LEARNING RECOMMENDATION SERVICE
// ============================================================================

export const recommendationService = {
	// List active recommendations for user
	async list(userId: string, options?: { type?: string; priority?: string; activeOnly?: boolean; limit?: number }) {
		const conditions = [eq(adaptiveLearningRecommendation.userId, userId)];

		if (options?.type) {
			conditions.push(eq(adaptiveLearningRecommendation.type, options.type as never));
		}
		if (options?.priority) {
			conditions.push(eq(adaptiveLearningRecommendation.priority, options.priority as never));
		}
		if (options?.activeOnly !== false) {
			conditions.push(eq(adaptiveLearningRecommendation.isActive, true));
			conditions.push(eq(adaptiveLearningRecommendation.isDismissed, false));
		}

		let query = db
			.select()
			.from(adaptiveLearningRecommendation)
			.where(and(...conditions))
			.orderBy(desc(adaptiveLearningRecommendation.priority), desc(adaptiveLearningRecommendation.createdAt));

		if (options?.limit) {
			query = query.limit(options.limit) as typeof query;
		}

		return query;
	},

	// Get recommendation by ID
	async getById(id: string) {
		const [recommendation] = await db
			.select()
			.from(adaptiveLearningRecommendation)
			.where(eq(adaptiveLearningRecommendation.id, id));
		return recommendation;
	},

	// Create recommendation
	async create(input: CreateRecommendationInput) {
		const id = generateId();
		await db.insert(adaptiveLearningRecommendation).values({ id, ...input });
		return this.getById(id);
	},

	// Mark as viewed
	async markViewed(id: string) {
		await db
			.update(adaptiveLearningRecommendation)
			.set({ isViewed: true, viewedAt: new Date() })
			.where(eq(adaptiveLearningRecommendation.id, id));
		return this.getById(id);
	},

	// Accept recommendation
	async accept(id: string) {
		await db
			.update(adaptiveLearningRecommendation)
			.set({ isAccepted: true, acceptedAt: new Date() })
			.where(eq(adaptiveLearningRecommendation.id, id));
		return this.getById(id);
	},

	// Complete recommendation
	async complete(id: string) {
		await db
			.update(adaptiveLearningRecommendation)
			.set({ isCompleted: true, completedAt: new Date() })
			.where(eq(adaptiveLearningRecommendation.id, id));
		return this.getById(id);
	},

	// Dismiss recommendation
	async dismiss(id: string, reason?: string) {
		await db
			.update(adaptiveLearningRecommendation)
			.set({
				isDismissed: true,
				dismissedAt: new Date(),
				dismissReason: reason,
				isActive: false,
			})
			.where(eq(adaptiveLearningRecommendation.id, id));
		return this.getById(id);
	},

	// Generate AI recommendations for user
	async generateRecommendations(userId: string) {
		const profile = await learningProfileService.getOrCreate(userId);
		const recentAssessments = await assessmentService.list(userId, { limit: 5 });
		const activePath = await learningPathService.getPrimary(userId);
		const { model } = await getServerModel();

		const prompt = `Réponds entièrement en français. Tous les titres, descriptions et raisons doivent être en français.
Génère des recommandations d'apprentissage personnalisées pour un(e) étudiant(e) basées sur son profil et ses performances récentes.

Profil étudiant :
- Domaine actuel : ${profile.currentField || "général"}
- Niveau actuel : ${profile.currentLevel || "débutant"}
- Niveau cible : ${profile.targetLevel || "intermédiaire"}
- Style d'apprentissage : ${profile.learningStyle || "mixte"}
- Rythme préféré : ${profile.preferredPace || "modéré"}
- Points forts : ${JSON.stringify(profile.strengths || [])}
- Points faibles : ${JSON.stringify(profile.weaknesses || [])}
- Score moyen aux évaluations : ${profile.averageAssessmentScore || "N/A"}
- Série actuelle : ${profile.currentStreak || 0} jours

Évaluations récentes : ${JSON.stringify(
			recentAssessments.map((a) => ({
				compétence: a.skillName,
				score: a.score,
				niveau: a.currentLevel,
				tendance: a.trend,
			})),
		)}

Parcours d'apprentissage actif : ${activePath ? `${activePath.titleFr || activePath.title} (${activePath.progress}% complété)` : "Aucun"}

Génère 3 à 5 recommandations concrètes avec différents types :
- next_skill: Learn a new skill
- review_topic: Review struggling areas
- practice_exercise: Hands-on practice
- take_assessment: Evaluate current level
- adjust_pace: Change learning speed
- try_resource: Explore new resource type
- milestone_goal: Work towards a milestone

Respond in JSON format:
{
  "recommendations": [
    {
      "type": "next_skill|review_topic|practice_exercise|take_assessment|adjust_pace|try_resource|milestone_goal",
      "priority": "low|medium|high|critical",
      "title": "string",
      "titleFr": "string",
      "description": "string",
      "descriptionFr": "string",
      "targetSkillName": "string (if applicable)",
      "reason": "string (why this recommendation)",
      "reasonFr": "string",
      "actionType": "watch_video|complete_quiz|practice|read_article|etc",
      "estimatedTime": number (minutes),
      "difficulty": "easy|medium|hard",
      "aiConfidence": number (0-100)
    }
  ]
}`;

		try {
			const result = await generateText({
				model,
				prompt,
				temperature: 0.7,
			});

			const jsonMatch = result.text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error("Failed to parse AI response");
			}

			const data = JSON.parse(jsonMatch[0]);
			const createdRecommendations = [];

			for (const rec of data.recommendations || []) {
				const recommendation = await this.create({
					userId,
					profileId: profile.id,
					pathId: activePath?.id,
					type: rec.type as LearningRecommendationType,
					priority: rec.priority as LearningRecommendationPriority,
					title: rec.title,
					titleFr: rec.titleFr,
					description: rec.description,
					descriptionFr: rec.descriptionFr,
					targetSkillName: rec.targetSkillName,
					reason: rec.reason,
					reasonFr: rec.reasonFr,
					actionType: rec.actionType,
					estimatedTime: rec.estimatedTime,
					difficulty: rec.difficulty,
					aiConfidence: rec.aiConfidence,
					aiModel: "ai-generated",
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
				});
				createdRecommendations.push(recommendation);
			}

			// Save to AI history (fire-and-forget)
			aiHistoryService
				.save({
					userId,
					source: "learning_path_recommend",
					generatedContent: `${createdRecommendations.length} recommandations d'apprentissage generees`,
					outputData: { count: createdRecommendations.length },
					inputData: { activePathId: activePath?.id ?? null },
					metadata: {},
				})
				.catch((err) => console.error("[AI History] Failed to save learning recommendations:", err));

			return createdRecommendations;
		} catch (error) {
			console.error("Failed to generate recommendations:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to generate recommendations with AI",
			});
		}
	},
};

// ============================================================================
// ADAPTIVE DIFFICULTY SERVICE
// ============================================================================

export const difficultyService = {
	// Adapt difficulty based on recent performance
	async adaptDifficulty(userId: string) {
		const profile = await learningProfileService.getByUserId(userId);
		if (!profile) {
			throw new ORPCError("NOT_FOUND", { message: "Learning profile not found" });
		}

		// Get recent assessments to calculate performance
		const recentAssessments = await assessmentService.list(userId, { limit: 10 });

		if (recentAssessments.length === 0) {
			return { adjusted: false, reason: "No assessments found", multiplier: profile.difficultyMultiplier };
		}

		// Calculate average score
		const averageScore = recentAssessments.reduce((sum, a) => sum + a.score, 0) / recentAssessments.length;

		// Calculate trend
		const improvingCount = recentAssessments.filter((a) => a.trend === "improving").length;
		const decliningCount = recentAssessments.filter((a) => a.trend === "declining").length;

		let newMultiplier = profile.difficultyMultiplier || 1.0;
		let adjusted = false;
		let reason = "";

		// Adjust based on performance
		if (averageScore > 85 && improvingCount > decliningCount) {
			newMultiplier = Math.min(newMultiplier + 0.15, 2.0);
			reason = "Excellent performance - increasing difficulty";
			adjusted = true;
		} else if (averageScore > 75) {
			newMultiplier = Math.min(newMultiplier + 0.05, 2.0);
			reason = "Good performance - slightly increasing difficulty";
			adjusted = true;
		} else if (averageScore < 50 && decliningCount > improvingCount) {
			newMultiplier = Math.max(newMultiplier - 0.15, 0.5);
			reason = "Struggling - decreasing difficulty";
			adjusted = true;
		} else if (averageScore < 60) {
			newMultiplier = Math.max(newMultiplier - 0.05, 0.5);
			reason = "Below average - slightly decreasing difficulty";
			adjusted = true;
		}

		if (adjusted) {
			await db
				.update(studentLearningProfile)
				.set({ difficultyMultiplier: newMultiplier })
				.where(eq(studentLearningProfile.userId, userId));
		} else {
			reason = "Performance is stable - maintaining current difficulty";
		}

		return {
			adjusted,
			reason,
			multiplier: newMultiplier,
			previousMultiplier: profile.difficultyMultiplier,
			averageScore,
			assessmentCount: recentAssessments.length,
		};
	},
};
