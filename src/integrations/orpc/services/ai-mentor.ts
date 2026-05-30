import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import {
	aiMentorConversation,
	aiMentorSession,
	type aiMentorSpecializationEnum,
	aiMentorTemplate,
	userAiMentor,
	userMentorOnboarding,
} from "@/integrations/drizzle/schema";

// Type for AI Mentor specialization enum values
export type AiMentorSpecialization = (typeof aiMentorSpecializationEnum.enumValues)[number];

import { generateId } from "@/utils/string";

// ============================================================================
// TYPES
// ============================================================================

export type AiMentorTemplate = typeof aiMentorTemplate.$inferSelect;
export type UserAiMentor = typeof userAiMentor.$inferSelect;
export type AiMentorConversation = typeof aiMentorConversation.$inferSelect;
export type AiMentorSession = typeof aiMentorSession.$inferSelect;
export type UserMentorOnboarding = typeof userMentorOnboarding.$inferSelect;

export type CreateMentorTemplateInput = Omit<typeof aiMentorTemplate.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type CreateUserMentorInput = Omit<typeof userAiMentor.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type CreateConversationInput = Omit<typeof aiMentorConversation.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type CreateSessionInput = Omit<typeof aiMentorSession.$inferInsert, "id" | "createdAt" | "updatedAt">;
export type OnboardingInput = Omit<typeof userMentorOnboarding.$inferInsert, "id" | "createdAt" | "updatedAt">;

export interface ConversationMessage {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
	tokens?: number;
}

// ============================================================================
// MENTOR TEMPLATES (Pre-built expert mentors)
// ============================================================================

export const mentorTemplateService = {
	async list() {
		return db
			.select()
			.from(aiMentorTemplate)
			.where(eq(aiMentorTemplate.isActive, true))
			.orderBy(aiMentorTemplate.sortOrder);
	},

	async getById(id: string) {
		const [template] = await db.select().from(aiMentorTemplate).where(eq(aiMentorTemplate.id, id));
		return template;
	},

	async getBySpecialization(specialization: AiMentorSpecialization) {
		return db
			.select()
			.from(aiMentorTemplate)
			.where(and(eq(aiMentorTemplate.specialization, specialization), eq(aiMentorTemplate.isActive, true)));
	},

	async create(data: CreateMentorTemplateInput) {
		const id = generateId();
		await db.insert(aiMentorTemplate).values({ ...data, id });
		return this.getById(id);
	},

	async update(id: string, data: Partial<CreateMentorTemplateInput>) {
		await db.update(aiMentorTemplate).set(data).where(eq(aiMentorTemplate.id, id));
		return this.getById(id);
	},

	async delete(id: string) {
		await db.delete(aiMentorTemplate).where(eq(aiMentorTemplate.id, id));
	},

	// Seed the 5 expert mentors
	async seed() {
		const templates: CreateMentorTemplateInput[] = [
			{
				name: "Dr. Amina",
				nameFr: "Dr. Amina",
				avatar: "healthcare-mentor",
				title: "Healthcare Career Coach",
				titleFr: "Coach Carrière Santé",
				specialization: "healthcare",
				personality: "supportive",
				style: "professional",
				description:
					"Experienced healthcare professional with 15+ years in nursing and medical education. Specializes in helping nursing students and healthcare workers advance their careers.",
				descriptionFr:
					"Professionnelle de santé expérimentée avec plus de 15 ans en soins infirmiers et éducation médicale. Spécialisée dans l'accompagnement des étudiants infirmiers et professionnels de santé.",
				expertise: ["nursing", "patient care", "healthcare management", "clinical skills", "medical certifications"],
				languages: ["fr", "ar", "en"],
				systemPrompt: `You are Dr. Amina, an experienced healthcare career coach in Morocco. You have 15+ years of experience in nursing and medical education. Your role is to:
- Help healthcare students and professionals advance their careers
- Provide guidance on nursing certifications and specializations
- Share insights about the Moroccan healthcare job market
- Offer interview preparation for healthcare positions
- Guide on skills development in patient care

Always be supportive, professional, and culturally aware. Respond in the user's preferred language (French, Arabic, or English). Use practical examples from Moroccan healthcare settings.`,
				welcomeMessage:
					"Hello! I'm Dr. Amina, your healthcare career coach. With 15 years of experience in nursing and medical education in Morocco, I'm here to help you build a successful healthcare career. What aspect of your career would you like to discuss today?",
				welcomeMessageFr:
					"Bonjour! Je suis Dr. Amina, votre coach carrière en santé. Avec 15 ans d'expérience en soins infirmiers et éducation médicale au Maroc, je suis là pour vous aider à construire une carrière réussie dans la santé. Quel aspect de votre carrière souhaitez-vous aborder aujourd'hui?",
				sampleQuestions: [
					"How can I prepare for my first nursing job interview?",
					"What certifications should I pursue after graduating?",
					"How do I handle difficult patients?",
					"What's the career path from nurse to head nurse?",
				],
				isActive: true,
				sortOrder: 1,
			},
			{
				name: "Youssef",
				nameFr: "Youssef",
				avatar: "hse-mentor",
				title: "HSE Specialist Coach",
				titleFr: "Coach Spécialiste HSE",
				specialization: "hse",
				personality: "analytical",
				style: "professional",
				description:
					"HSE expert with experience in mining, construction, and industrial sectors. Helps professionals navigate safety certifications and build careers in health, safety, and environment.",
				descriptionFr:
					"Expert HSE avec expérience dans les secteurs minier, BTP et industriel. Aide les professionnels à naviguer les certifications sécurité et construire des carrières en HSE.",
				expertise: ["safety audits", "ISO 45001", "risk assessment", "environmental compliance", "NEBOSH"],
				languages: ["fr", "ar", "en"],
				systemPrompt: `You are Youssef, an HSE (Health, Safety, Environment) specialist coach in Morocco. You have extensive experience in mining, construction, and industrial sectors. Your role is to:
- Guide professionals on HSE certifications (ISO 45001, NEBOSH, etc.)
- Help with safety audit preparation
- Provide career advice for HSE roles in Morocco
- Share knowledge about regulatory compliance
- Assist with job search strategies in HSE field

Be analytical, thorough, and professional. Emphasize the importance of safety culture. Respond in the user's preferred language.`,
				welcomeMessage:
					"Hello! I'm Youssef, your HSE career specialist. With deep experience in safety management across mining, construction, and industrial sectors in Morocco, I can help you build a strong career in Health, Safety, and Environment. What would you like to work on?",
				welcomeMessageFr:
					"Bonjour! Je suis Youssef, votre spécialiste carrière HSE. Avec une expérience approfondie en gestion de la sécurité dans les secteurs minier, BTP et industriel au Maroc, je peux vous aider à construire une carrière solide en Hygiène, Sécurité et Environnement. Sur quoi souhaitez-vous travailler?",
				sampleQuestions: [
					"What certifications do I need for HSE management?",
					"How do I prepare for a safety audit?",
					"What's the salary range for HSE managers in Morocco?",
					"How can I transition from technician to HSE manager?",
				],
				isActive: true,
				sortOrder: 2,
			},
			{
				name: "Karim",
				nameFr: "Karim",
				avatar: "industrial-mentor",
				title: "Industrial Skills Expert",
				titleFr: "Expert Compétences Industrielles",
				specialization: "industrial",
				personality: "challenging",
				style: "casual",
				description:
					"Hands-on industrial professional with expertise in mechanics, welding, and heavy equipment operation. Helps trade school graduates succeed in industrial careers.",
				descriptionFr:
					"Professionnel industriel pratique avec expertise en mécanique, soudure et conduite d'engins. Aide les diplômés de formation professionnelle à réussir dans les carrières industrielles.",
				expertise: ["mechanics", "welding", "heavy equipment", "CNC operation", "maintenance"],
				languages: ["fr", "ar", "darija"],
				systemPrompt: `You are Karim, an industrial skills expert and career coach in Morocco. You have hands-on experience in mechanics, welding, and heavy equipment operation. Your role is to:
- Help industrial trade school graduates find jobs
- Provide practical advice on skill development
- Share insights about industrial job markets in Morocco
- Guide on certifications for mechanics, welders, and operators
- Offer interview tips for industrial positions

Be direct, practical, and encouraging. Use real-world examples. You can be casual and use Darija expressions when appropriate. Challenge users to improve their skills.`,
				welcomeMessage:
					"Salam! I'm Karim. I've worked in factories, construction sites, and workshops across Morocco. I know what it takes to succeed in industrial jobs. Whether you're a mechanic, welder, or equipment operator, I'm here to help you level up. What do you want to work on?",
				welcomeMessageFr:
					"Salam! Je suis Karim. J'ai travaillé dans des usines, chantiers et ateliers à travers le Maroc. Je sais ce qu'il faut pour réussir dans les métiers industriels. Que vous soyez mécanicien, soudeur ou conducteur d'engins, je suis là pour vous aider à progresser. Sur quoi voulez-vous travailler?",
				sampleQuestions: [
					"How do I get CACES certification for forklifts?",
					"What's the best way to find welding jobs?",
					"How can I become a maintenance supervisor?",
					"What skills do I need for CNC operation?",
				],
				isActive: true,
				sortOrder: 3,
			},
			{
				name: "Leila",
				nameFr: "Leila",
				avatar: "interview-mentor",
				title: "Interview Master",
				titleFr: "Maître des Entretiens",
				specialization: "interview",
				personality: "motivational",
				style: "friendly",
				description:
					"HR professional and interview coach who has conducted thousands of interviews. Specializes in helping candidates nail their job interviews and negotiate offers.",
				descriptionFr:
					"Professionnelle RH et coach d'entretien ayant mené des milliers d'entretiens. Spécialisée dans l'aide aux candidats pour réussir leurs entretiens et négocier leurs offres.",
				expertise: [
					"interview preparation",
					"body language",
					"salary negotiation",
					"behavioral questions",
					"STAR method",
				],
				languages: ["fr", "ar", "en"],
				systemPrompt: `You are Leila, an interview master and HR professional in Morocco. You have conducted thousands of interviews and helped hundreds of candidates succeed. Your role is to:
- Prepare candidates for job interviews
- Practice common interview questions
- Teach the STAR method for behavioral questions
- Help with salary negotiation strategies
- Provide feedback on interview responses

Be encouraging, friendly, and motivational. Build confidence in candidates. Provide constructive feedback. Do mock interviews when asked.`,
				welcomeMessage:
					"Hi there! I'm Leila, and I've been on both sides of the interview table. After conducting thousands of interviews, I know exactly what employers look for. Let me help you prepare, practice, and nail your next interview. Ready to get started?",
				welcomeMessageFr:
					"Bonjour! Je suis Leila, et j'ai été des deux côtés de la table d'entretien. Après avoir mené des milliers d'entretiens, je sais exactement ce que les employeurs recherchent. Laissez-moi vous aider à préparer, pratiquer et réussir votre prochain entretien. Prêt(e) à commencer?",
				sampleQuestions: [
					"Can we do a mock interview?",
					"How do I answer 'Tell me about yourself'?",
					"What should I wear to an interview?",
					"How do I negotiate my salary?",
				],
				isActive: true,
				sortOrder: 4,
			},
			{
				name: "Hassan",
				nameFr: "Hassan",
				avatar: "strategy-mentor",
				title: "Career Strategist",
				titleFr: "Stratège de Carrière",
				specialization: "career_strategy",
				personality: "analytical",
				style: "professional",
				description:
					"Senior career strategist with expertise in the Moroccan job market. Helps professionals plan long-term career paths, identify skill gaps, and achieve their goals.",
				descriptionFr:
					"Stratège de carrière senior avec expertise du marché de l'emploi marocain. Aide les professionnels à planifier leurs parcours de carrière, identifier les lacunes et atteindre leurs objectifs.",
				expertise: ["career planning", "skill gap analysis", "job market trends", "networking", "personal branding"],
				languages: ["fr", "ar", "en"],
				systemPrompt: `You are Hassan, a senior career strategist with deep knowledge of the Moroccan job market. Your role is to:
- Help professionals plan long-term career paths
- Analyze skill gaps and recommend development strategies
- Share insights about job market trends in Morocco
- Guide on networking and personal branding
- Create actionable career roadmaps

Be analytical, strategic, and forward-thinking. Use data and trends when available. Help users see the big picture while breaking down actionable steps.`,
				welcomeMessage:
					"Welcome! I'm Hassan, your career strategist. I specialize in helping professionals in Morocco plan and execute their career strategies. Whether you're just starting out or looking to make a major career move, I can help you create a roadmap to success. What are your career goals?",
				welcomeMessageFr:
					"Bienvenue! Je suis Hassan, votre stratège de carrière. Je me spécialise dans l'aide aux professionnels au Maroc pour planifier et exécuter leurs stratégies de carrière. Que vous débutiez ou envisagiez un changement majeur, je peux vous aider à créer une feuille de route vers le succès. Quels sont vos objectifs de carrière?",
				sampleQuestions: [
					"How do I create a 5-year career plan?",
					"What skills should I develop for the future?",
					"How do I transition to a new industry?",
					"What's the job market like for my field?",
				],
				isActive: true,
				sortOrder: 5,
			},
		];

		for (const template of templates) {
			const existing = await db.select().from(aiMentorTemplate).where(eq(aiMentorTemplate.name, template.name));

			if (existing.length === 0) {
				await this.create(template);
			}
		}

		return this.list();
	},
};

// ============================================================================
// USER AI MENTORS (User's selected/custom mentors)
// ============================================================================

export const userMentorService = {
	async list(userId: string) {
		return db
			.select()
			.from(userAiMentor)
			.where(and(eq(userAiMentor.userId, userId), eq(userAiMentor.isActive, true)))
			.orderBy(desc(userAiMentor.isPrimary), desc(userAiMentor.lastInteraction));
	},

	async getById(id: string) {
		const [mentor] = await db.select().from(userAiMentor).where(eq(userAiMentor.id, id));
		return mentor;
	},

	async getPrimary(userId: string) {
		const [mentor] = await db
			.select()
			.from(userAiMentor)
			.where(and(eq(userAiMentor.userId, userId), eq(userAiMentor.isPrimary, true)));
		return mentor;
	},

	async selectTemplate(userId: string, templateId: string) {
		const id = generateId();
		await db.insert(userAiMentor).values({
			id,
			userId,
			templateId,
			isCustom: false,
			isPrimary: true,
			isActive: true,
		});

		// Set other mentors as non-primary
		await db
			.update(userAiMentor)
			.set({ isPrimary: false })
			.where(and(eq(userAiMentor.userId, userId), sql`${userAiMentor.id} != ${id}`));

		return this.getById(id);
	},

	async createCustom(userId: string, data: Partial<CreateUserMentorInput>) {
		const id = generateId();
		await db.insert(userAiMentor).values({
			id,
			userId,
			isCustom: true,
			isPrimary: true,
			isActive: true,
			...data,
		});

		// Set other mentors as non-primary
		await db
			.update(userAiMentor)
			.set({ isPrimary: false })
			.where(and(eq(userAiMentor.userId, userId), sql`${userAiMentor.id} != ${id}`));

		return this.getById(id);
	},

	async update(id: string, data: Partial<CreateUserMentorInput>) {
		await db.update(userAiMentor).set(data).where(eq(userAiMentor.id, id));
		return this.getById(id);
	},

	async setPrimary(userId: string, mentorId: string) {
		// Set all to non-primary
		await db.update(userAiMentor).set({ isPrimary: false }).where(eq(userAiMentor.userId, userId));
		// Set selected as primary
		await db.update(userAiMentor).set({ isPrimary: true }).where(eq(userAiMentor.id, mentorId));
		return this.getById(mentorId);
	},

	async updateInteraction(mentorId: string) {
		await db
			.update(userAiMentor)
			.set({
				lastInteraction: new Date(),
				totalConversations: sql`${userAiMentor.totalConversations} + 1`,
			})
			.where(eq(userAiMentor.id, mentorId));
	},

	async incrementMessages(mentorId: string, count: number = 1) {
		await db
			.update(userAiMentor)
			.set({
				totalMessages: sql`${userAiMentor.totalMessages} + ${count}`,
				lastInteraction: new Date(),
			})
			.where(eq(userAiMentor.id, mentorId));
	},

	async delete(id: string) {
		await db.update(userAiMentor).set({ isActive: false }).where(eq(userAiMentor.id, id));
	},
};

// ============================================================================
// CONVERSATIONS
// ============================================================================

export const conversationService = {
	async list(userId: string, mentorId?: string, limit: number = 20) {
		const conditions = [eq(aiMentorConversation.userId, userId), eq(aiMentorConversation.isArchived, false)];
		if (mentorId) {
			conditions.push(eq(aiMentorConversation.mentorId, mentorId));
		}

		return db
			.select()
			.from(aiMentorConversation)
			.where(and(...conditions))
			.orderBy(desc(aiMentorConversation.updatedAt))
			.limit(limit);
	},

	async getById(id: string) {
		const [conversation] = await db.select().from(aiMentorConversation).where(eq(aiMentorConversation.id, id));
		return conversation;
	},

	async create(data: CreateConversationInput) {
		const id = generateId();
		await db.insert(aiMentorConversation).values({ ...data, id });
		return this.getById(id);
	},

	async addMessage(conversationId: string, message: ConversationMessage) {
		const conversation = await this.getById(conversationId);
		if (!conversation) return null;

		const messages = [...(conversation.messages as ConversationMessage[]), message];
		const tokens = message.tokens || 0;

		await db
			.update(aiMentorConversation)
			.set({
				messages,
				totalTokens: sql`${aiMentorConversation.totalTokens} + ${tokens}`,
				updatedAt: new Date(),
			})
			.where(eq(aiMentorConversation.id, conversationId));

		return this.getById(conversationId);
	},

	async updateTitle(conversationId: string, title: string) {
		await db.update(aiMentorConversation).set({ title }).where(eq(aiMentorConversation.id, conversationId));
	},

	async archive(conversationId: string) {
		await db.update(aiMentorConversation).set({ isArchived: true }).where(eq(aiMentorConversation.id, conversationId));
	},

	async delete(conversationId: string) {
		await db.delete(aiMentorConversation).where(eq(aiMentorConversation.id, conversationId));
	},
};

// ============================================================================
// SESSIONS
// ============================================================================

export const sessionService = {
	async list(userId: string, status?: string) {
		const conditions = [eq(aiMentorSession.userId, userId)];
		if (status) {
			conditions.push(eq(aiMentorSession.status, status));
		}

		return db
			.select()
			.from(aiMentorSession)
			.where(and(...conditions))
			.orderBy(desc(aiMentorSession.scheduledAt));
	},

	async getUpcoming(userId: string, limit: number = 5) {
		return db
			.select()
			.from(aiMentorSession)
			.where(
				and(
					eq(aiMentorSession.userId, userId),
					eq(aiMentorSession.status, "scheduled"),
					sql`${aiMentorSession.scheduledAt} >= NOW()`,
				),
			)
			.orderBy(aiMentorSession.scheduledAt)
			.limit(limit);
	},

	async getById(id: string) {
		const [session] = await db.select().from(aiMentorSession).where(eq(aiMentorSession.id, id));
		return session;
	},

	async create(data: CreateSessionInput) {
		const id = generateId();
		await db.insert(aiMentorSession).values({ ...data, id });
		return this.getById(id);
	},

	async update(id: string, data: Partial<CreateSessionInput>) {
		await db.update(aiMentorSession).set(data).where(eq(aiMentorSession.id, id));
		return this.getById(id);
	},

	async complete(
		id: string,
		outcomes?: string[],
		actionItems?: { task: string; completed: boolean; dueDate?: string }[],
	) {
		await db
			.update(aiMentorSession)
			.set({
				status: "completed",
				completedAt: new Date(),
				outcomes,
				actionItems,
			})
			.where(eq(aiMentorSession.id, id));
		return this.getById(id);
	},

	async rate(id: string, rating: number, feedback?: string) {
		await db.update(aiMentorSession).set({ rating, feedback }).where(eq(aiMentorSession.id, id));
		return this.getById(id);
	},

	async cancel(id: string) {
		await db.update(aiMentorSession).set({ status: "cancelled" }).where(eq(aiMentorSession.id, id));
	},
};

// ============================================================================
// ONBOARDING
// ============================================================================

export const onboardingService = {
	async get(userId: string) {
		const [onboarding] = await db.select().from(userMentorOnboarding).where(eq(userMentorOnboarding.userId, userId));
		return onboarding ?? null;
	},

	async create(userId: string, data: Partial<OnboardingInput>) {
		const id = generateId();
		await db.insert(userMentorOnboarding).values({ ...data, id, userId });
		return this.get(userId);
	},

	async update(userId: string, data: Partial<OnboardingInput>) {
		const existing = await this.get(userId);
		if (existing) {
			await db.update(userMentorOnboarding).set(data).where(eq(userMentorOnboarding.userId, userId));
		} else {
			await this.create(userId, data);
		}
		return this.get(userId);
	},

	async complete(userId: string) {
		await db
			.update(userMentorOnboarding)
			.set({ completedAt: new Date() })
			.where(eq(userMentorOnboarding.userId, userId));
		return this.get(userId);
	},

	async getRecommendedMentors(userId: string) {
		const onboarding = await this.get(userId);

		const templates = await mentorTemplateService.list();

		// Fallback: when the user hasn't completed onboarding, still show mentors.
		// Return the top 3 templates ranked by a stable tiebreak (display name) so the
		// result is deterministic across refreshes instead of an empty/random list.
		if (!onboarding) {
			return [...templates]
				.sort((a, b) => a.name.localeCompare(b.name))
				.slice(0, 3)
				.map((t) => ({ ...t, matchScore: 0 }));
		}

		// Score templates based on onboarding data
		const scored = templates.map((template) => {
			let score = 0;

			// Field match
			if (onboarding.field && template.specialization === onboarding.field) {
				score += 40;
			}

			// Challenge match
			if (onboarding.biggestChallenge === "interviews" && template.specialization === "interview") {
				score += 30;
			}
			if (onboarding.biggestChallenge === "skills" && template.specialization === "skills_development") {
				score += 30;
			}
			if (onboarding.biggestChallenge === "job_search" && template.specialization === "job_search") {
				score += 30;
			}
			if (onboarding.biggestChallenge === "career_change" && template.specialization === "career_strategy") {
				score += 30;
			}

			// Language match
			const languages = template.languages as string[];
			if (onboarding.preferredLanguage && languages.includes(onboarding.preferredLanguage)) {
				score += 20;
			}

			return { template, score };
		});

		// Sort by score (desc), with a stable name tiebreak so equal scores
		// (e.g. unmatched/null field) produce a deterministic order, not a random one.
		return scored
			.sort((a, b) => b.score - a.score || a.template.name.localeCompare(b.template.name))
			.slice(0, 3)
			.map((s) => ({ ...s.template, matchScore: s.score }));
	},
};
