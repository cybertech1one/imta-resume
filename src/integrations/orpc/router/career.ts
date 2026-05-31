import { ORPCError } from "@orpc/server";
import { generateText } from "ai";
import z from "zod";
import { sanitizeAiInput, validateAiOutput } from "@/integrations/ai/sanitize";
import { aiRateLimitedProcedure, protectedProcedure, publicProcedure } from "../context";
import { aiHistoryService } from "../services/ai-history";
import { aiQuotaService } from "../services/ai-quota";
import { type getModel, getServerModel } from "./ai-provider-utils";
import { careerAssessmentEndpoints } from "./career-assessment-endpoints";
import { careerCertificationsEndpoints } from "./career-certifications-endpoints";
import {
	assessmentQuestions,
	careerCategorySchema,
	careerDescriptions,
	careerPrograms,
	marketInsightsData,
	salaryStatisticsData,
	topEmployersData,
} from "./career-data";
import { careerGapAnalysisEndpoints } from "./career-gap-analysis-endpoints";
import { careerRoadmapsEndpoints } from "./career-roadmaps-endpoints";
import { careerSkillsQuizEndpoints } from "./career-skills-quiz-endpoints";
import { careerStudyPlanEndpoints } from "./career-study-plan-endpoints";
import { careerTimelineEndpoints } from "./career-timeline-endpoints";
import { careerUserSkillsEndpoints } from "./career-user-skills-endpoints";

export const careerRouter = {
	// Get all career paths/programs
	getCareerPaths: publicProcedure
		.input(
			z.object({
				category: careerCategorySchema.optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			let programs = careerPrograms;

			if (input.category) {
				programs = programs.filter((p) => p.category === input.category);
			}

			const isFr = input.language === "fr";

			return programs.map((p) => ({
				id: p.id,
				name: isFr ? p.nameFr : p.name,
				category: p.category,
				duration: isFr ? p.durationFr : p.duration,
				durationMonths: p.durationMonths,
				cost: p.cost,
				salaryRange: p.salaryRange,
				employmentRate: p.employmentRate,
				description: isFr ? p.descriptionFr : p.description,
				demandLevel: p.demandLevel,
				growthRate: p.growthRate,
				icon: p.icon,
			}));
		}),

	// Get single program with full details
	getCareerProgram: publicProcedure
		.input(
			z.object({
				programId: z.string(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const program = careerPrograms.find((p) => p.id === input.programId);

			if (!program) {
				throw new Error("Program not found");
			}

			const isFr = input.language === "fr";

			return {
				id: program.id,
				name: isFr ? program.nameFr : program.name,
				category: program.category,
				duration: isFr ? program.durationFr : program.duration,
				durationMonths: program.durationMonths,
				cost: program.cost,
				requirements: isFr ? program.requiredSkillsFr : program.requiredSkills,
				careerProspects: isFr ? program.prospectsFr : program.prospects,
				salaryRange: program.salaryRange,
				employmentRate: program.employmentRate,
				description: isFr ? program.descriptionFr : program.description,
				skills: isFr ? program.requiredSkillsFr : program.requiredSkills,
				certification: isFr ? program.certificationFr : program.certification,
				demandLevel: program.demandLevel,
				growthRate: program.growthRate,
				careerPathways: program.careerPathways.map((cp) => ({
					title: isFr ? cp.titleFr : cp.title,
					description: isFr ? cp.descriptionFr : cp.description,
					yearsExperience: cp.yearsExperience,
				})),
				icon: program.icon,
			};
		}),

	// Compare multiple programs side by side
	comparePrograms: publicProcedure
		.input(
			z.object({
				programIds: z.array(z.string()).min(2).max(4),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const programs = input.programIds
				.map((id) => careerPrograms.find((p) => p.id === id))
				.filter((p): p is (typeof careerPrograms)[0] => p !== undefined);

			if (programs.length < 2) {
				throw new Error("At least 2 valid programs required for comparison");
			}

			const isFr = input.language === "fr";

			return {
				programs: programs.map((p) => ({
					id: p.id,
					name: isFr ? p.nameFr : p.name,
					category: p.category,
					duration: isFr ? p.durationFr : p.duration,
					cost: p.cost,
					salaryRange: p.salaryRange,
					employmentRate: p.employmentRate,
					requirements: isFr ? p.requiredSkillsFr : p.requiredSkills,
					careerProspects: isFr ? p.prospectsFr : p.prospects,
					skills: isFr ? p.requiredSkillsFr : p.requiredSkills,
					demandLevel: p.demandLevel,
					growthRate: p.growthRate,
					icon: p.icon,
				})),
				comparisonCriteria: [
					{
						criterion: isFr ? "Duree de formation" : "Training Duration",
						values: programs.map((p) => (isFr ? p.durationFr : p.duration)),
					},
					{
						criterion: isFr ? "Cout de formation" : "Training Cost",
						values: programs.map((p) => `${p.cost.toLocaleString("fr-FR")} MAD`),
					},
					{
						criterion: isFr ? "Salaire minimum" : "Minimum Salary",
						values: programs.map((p) => `${p.salaryRange.min.toLocaleString("fr-FR")} ${p.salaryRange.currency}`),
					},
					{
						criterion: isFr ? "Salaire maximum" : "Maximum Salary",
						values: programs.map((p) => `${p.salaryRange.max.toLocaleString("fr-FR")} ${p.salaryRange.currency}`),
					},
					{
						criterion: isFr ? "Taux d'emploi" : "Employment Rate",
						values: programs.map((p) => `${p.employmentRate}%`),
					},
					{
						criterion: isFr ? "Croissance prevue" : "Growth Rate",
						values: programs.map((p) => `${p.growthRate}%`),
					},
				],
			};
		}),

	// Get market insights for a field
	getMarketInsights: publicProcedure
		.input(
			z.object({
				field: careerCategorySchema,
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const insights = marketInsightsData[input.field];

			if (!insights) {
				throw new Error("Market insights not found for this field");
			}

			const isFr = input.language === "fr";

			return {
				field: insights.field,
				employmentRate: insights.employmentRate,
				averageSalary: insights.averageSalary,
				salaryRange: insights.salaryRange,
				demandLevel: insights.demandLevel,
				growthProjection: insights.growthProjection,
				topSkills: isFr ? insights.topSkillsFr : insights.topSkills,
				jobOpenings: insights.jobOpenings,
				trends: insights.trends.map((t) => ({
					trend: isFr ? t.trendFr : t.trend,
					impact: t.impact,
				})),
			};
		}),

	// Get top employers in Morocco for a field
	getTopEmployers: publicProcedure
		.input(
			z.object({
				field: careerCategorySchema,
				language: z.enum(["fr", "en"]).default("fr"),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.handler(async ({ input }) => {
			let filtered = topEmployersData.filter((e) => e.hiringFields.includes(input.field));
			filtered = filtered.slice(0, input.limit);

			const isFr = input.language === "fr";

			return filtered.map((e) => ({
				id: e.id,
				name: e.name,
				sector: isFr ? e.sectorFr : e.sector,
				location: isFr ? e.locationFr : e.location,
				employeeCount: e.employeeCount,
				description: isFr ? e.descriptionFr : e.description,
				benefits: isFr ? e.benefitsFr : e.benefits,
				website: e.website,
				averageSalary: e.averageSalary,
			}));
		}),

	// Get career assessment quiz questions
	getAssessmentQuestions: publicProcedure
		.input(
			z.object({
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const isFr = input.language === "fr";

			return assessmentQuestions.map((q) => ({
				id: q.id,
				question: isFr ? q.questionFr : q.question,
				category: q.category,
				options: q.options.map((o) => ({
					id: o.id,
					text: isFr ? o.textFr : o.text,
				})),
			}));
		}),

	// Submit assessment and get recommended careers
	submitAssessment: protectedProcedure
		.input(
			z.object({
				answers: z
					.array(
						z.object({
							questionId: z.string(),
							optionId: z.string(),
						}),
					)
					.min(1),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const isFr = input.language === "fr";

			// Calculate scores for each career category
			const scores: Record<string, number> = {
				healthcare: 0,
				industrial: 0,
				hse: 0,
				technology: 0,
			};

			for (const answer of input.answers) {
				const question = assessmentQuestions.find((q) => q.id === answer.questionId);
				if (!question) continue;

				const option = question.options.find((o) => o.id === answer.optionId);
				if (!option) continue;

				for (const [career, weight] of Object.entries(option.careerWeights)) {
					scores[career] = (scores[career] || 0) + weight;
				}
			}

			// Calculate total possible score
			const maxScorePerCategory = input.answers.length * 3; // Max weight is 3

			// Sort careers by score
			const sortedCareers = Object.entries(scores)
				.sort(([, a], [, b]) => b - a)
				.map(([career, score]) => ({
					career,
					score,
					matchPercentage: Math.round((score / maxScorePerCategory) * 100),
				}));

			const topCareer = sortedCareers[0].career;

			// Generate recommendations
			const recommendations = sortedCareers.map((item) => {
				const careerInfo = careerDescriptions[item.career];
				return {
					career: item.career,
					score: item.score,
					matchPercentage: item.matchPercentage,
					description: isFr ? careerInfo?.descriptionFr : careerInfo?.description,
					suggestedPrograms: careerInfo?.suggestedPrograms || [],
				};
			});

			// Generate strengths based on top career
			const strengthsMap: Record<string, { en: string[]; fr: string[] }> = {
				healthcare: {
					en: ["Empathy and compassion", "Communication skills", "Attention to detail"],
					fr: ["Empathie et compassion", "Competences en communication", "Attention aux details"],
				},
				industrial: {
					en: ["Technical aptitude", "Problem-solving skills", "Physical capability"],
					fr: ["Aptitude technique", "Competences en resolution de problemes", "Capacite physique"],
				},
				hse: {
					en: ["Risk awareness", "Regulatory knowledge", "Training abilities"],
					fr: ["Conscience des risques", "Connaissance reglementaire", "Capacites de formation"],
				},
				technology: {
					en: ["Logical thinking", "Creativity", "Continuous learning mindset"],
					fr: ["Pensee logique", "Creativite", "Esprit d'apprentissage continu"],
				},
			};

			const areasToExploreMap: Record<string, { en: string[]; fr: string[] }> = {
				healthcare: {
					en: ["Advanced clinical certifications", "Specialization options", "Management training"],
					fr: ["Certifications cliniques avancees", "Options de specialisation", "Formation en management"],
				},
				industrial: {
					en: ["PLC programming", "Automation technologies", "Leadership skills"],
					fr: ["Programmation automate", "Technologies d'automatisation", "Competences en leadership"],
				},
				hse: {
					en: ["ISO certifications", "Environmental management", "Audit techniques"],
					fr: ["Certifications ISO", "Gestion environnementale", "Techniques d'audit"],
				},
				technology: {
					en: ["Cloud technologies", "AI/ML basics", "Project management"],
					fr: ["Technologies cloud", "Bases IA/ML", "Gestion de projet"],
				},
			};

			return {
				userId: context.user.id,
				completedAt: new Date().toISOString(),
				topCareer,
				scores,
				recommendations,
				strengths: isFr ? strengthsMap[topCareer]?.fr : strengthsMap[topCareer]?.en,
				areasToExplore: isFr ? areasToExploreMap[topCareer]?.fr : areasToExploreMap[topCareer]?.en,
			};
		}),

	// Get detailed salary statistics for a program
	getSalaryStatistics: publicProcedure
		.input(
			z.object({
				programId: z.string(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const stats = salaryStatisticsData[input.programId];

			if (!stats) {
				// If no specific stats, return generic stats based on program
				const program = careerPrograms.find((p) => p.id === input.programId);
				if (!program) {
					throw new Error("Program not found");
				}

				const isFr = input.language === "fr";
				const avgSalary = Math.round((program.salaryRange.min + program.salaryRange.max) / 2);

				return {
					programId: program.id,
					averageSalary: avgSalary,
					minSalary: program.salaryRange.min,
					maxSalary: program.salaryRange.max,
					currency: program.salaryRange.currency,
					experienceLevels: [
						{
							level: isFr ? "Debutant" : "Entry Level",
							yearsExperience: "0-2",
							averageSalary: program.salaryRange.min,
							range: { min: program.salaryRange.min, max: Math.round(avgSalary * 0.9) },
						},
						{
							level: isFr ? "Intermediaire" : "Mid Level",
							yearsExperience: "3-5",
							averageSalary: avgSalary,
							range: { min: Math.round(avgSalary * 0.9), max: Math.round(avgSalary * 1.1) },
						},
						{
							level: isFr ? "Senior" : "Senior",
							yearsExperience: "5+",
							averageSalary: program.salaryRange.max,
							range: { min: Math.round(avgSalary * 1.1), max: program.salaryRange.max },
						},
					],
					byRegion: [
						{
							region: isFr ? "Casablanca" : "Casablanca",
							averageSalary: Math.round(avgSalary * 1.1),
							costOfLivingIndex: 100,
						},
						{ region: isFr ? "Rabat" : "Rabat", averageSalary: Math.round(avgSalary * 1.05), costOfLivingIndex: 95 },
						{ region: isFr ? "Tanger" : "Tangier", averageSalary: Math.round(avgSalary * 0.95), costOfLivingIndex: 88 },
						{
							region: isFr ? "Marrakech" : "Marrakech",
							averageSalary: Math.round(avgSalary * 0.9),
							costOfLivingIndex: 85,
						},
					],
					trends: {
						yearOverYearGrowth: program.growthRate / 2,
						projectedGrowth2025: program.growthRate,
					},
				};
			}

			const isFr = input.language === "fr";

			return {
				programId: stats.programId,
				averageSalary: stats.averageSalary,
				minSalary: stats.minSalary,
				maxSalary: stats.maxSalary,
				currency: stats.currency,
				experienceLevels: stats.experienceLevels.map((el) => ({
					level: isFr ? el.levelFr : el.level,
					yearsExperience: el.yearsExperience,
					averageSalary: el.averageSalary,
					range: el.range,
				})),
				byRegion: stats.byRegion.map((r) => ({
					region: isFr ? r.regionFr : r.region,
					averageSalary: r.averageSalary,
					costOfLivingIndex: r.costOfLivingIndex,
				})),
				trends: stats.trends,
			};
		}),

	// ==========================================
	// AI-POWERED CAREER TOOLS
	// ==========================================

	// AI Skill Gap Analysis
	analyzeSkillGap: aiRateLimitedProcedure
		.input(
			z.object({
				targetRole: z.string().min(1).max(200),
				currentSkills: z.array(z.string().min(1).max(100)).min(1).max(50),
				field: z.string().min(1).max(100),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "career_skill_gap", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}

			let serverModel: { model: ReturnType<typeof getModel>; config: { id: string; provider: string; model: string } };
			try {
				serverModel = await getServerModel();
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "AI service unavailable. Please contact an administrator.",
				});
			}

			const startTime = Date.now();
			try {
				const result = await generateText({
					model: serverModel.model,
					temperature: 0.4,
					maxRetries: 2,
					maxOutputTokens: 2000,
					messages: [
						{
							role: "system",
							content: `Tu es un conseiller en carriere specialise pour les diplomes de l'IMTA Maroc (Institut Marocain des Techniques Avancees), TOUS domaines : sante/soins infirmiers, industriel/soudage/maintenance, HSE, digital. Analyse l'ecart de competences entre les competences actuelles du candidat et les exigences du role vise. Reponds en francais. Ne restreins PAS ton analyse a l'ingenierie : adapte l'analyse au domaine reel du candidat (soins, industrie, securite, etc.).

Retourne un JSON valide avec cette structure exacte:
{
  "missingSkills": [
    { "skill": "Nom de la competence", "priority": "high" | "medium" | "low", "learningTime": "Duree estimee d'apprentissage" }
  ],
  "matchPercentage": <nombre entre 0 et 100>,
  "recommendations": ["Recommandation 1", "Recommandation 2", ...],
  "strengths": ["Force 1", "Force 2", ...]
}

Prends en compte le marche de l'emploi marocain et international. Sois precis et actionnable dans tes recommandations.`,
						},
						{
							role: "user",
							content: `Role vise: ${sanitizeAiInput(input.targetRole)}
Domaine: ${sanitizeAiInput(input.field)}
Competences actuelles: ${input.currentSkills.map((s) => sanitizeAiInput(s)).join(", ")}

Analyse l'ecart de competences et donne des recommandations specifiques pour un diplome IMTA.`,
						},
					],
				});

				let parsed: {
					missingSkills: Array<{ skill: string; priority: string; learningTime: string }>;
					matchPercentage: number;
					recommendations: string[];
					strengths: string[];
				};

				const safeText = validateAiOutput(result.text).cleaned;

				try {
					const text = safeText.trim();
					const jsonMatch = text.match(/\{[\s\S]*\}/);
					parsed = JSON.parse(jsonMatch ? jsonMatch[0] : safeText);
				} catch {
					parsed = {
						missingSkills: [],
						matchPercentage: 0,
						recommendations: ["L'analyse n'a pas pu etre completee. Veuillez reessayer."],
						strengths: [],
					};
				}

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_skill_gap",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage?.inputTokens,
					outputTokens: result.usage?.outputTokens,
					totalTokens: result.usage?.totalTokens,
				});

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "resume_gap_analysis",
						generatedContent: `Match: ${parsed.matchPercentage}% - ${parsed.missingSkills.length} competences manquantes`,
						outputData: parsed,
						inputData: {
							targetRole: input.targetRole,
							field: input.field,
							skillsCount: input.currentSkills.length,
						},
						metadata: { provider: serverModel.config.provider, model: serverModel.config.model },
					})
					.catch((err) => console.error("[AI History] Failed to save career.analyzeSkillGap:", err));

				return parsed;
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("[Career AI] Skill gap analysis error:", error instanceof Error ? error.message : error);
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_skill_gap",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "L'analyse des competences a echoue. Veuillez reessayer.",
				});
			}
		}),

	// AI Career Path Recommendations
	recommendCareerPaths: aiRateLimitedProcedure
		.input(
			z.object({
				field: z.string().min(1).max(100),
				skills: z.array(z.string().min(1).max(100)).min(1).max(50),
				interests: z.array(z.string().min(1).max(100)).max(20).optional(),
				experienceLevel: z.string().min(1).max(50),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"career_path_recommendation",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}

			let serverModel: { model: ReturnType<typeof getModel>; config: { id: string; provider: string; model: string } };
			try {
				serverModel = await getServerModel();
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "AI service unavailable. Please contact an administrator.",
				});
			}

			const startTime = Date.now();
			try {
				const result = await generateText({
					model: serverModel.model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 3000,
					messages: [
						{
							role: "system",
							content: `Tu es un expert en orientation professionnelle pour les diplomes de l'IMTA Maroc, TOUS domaines : sante/soins infirmiers/sage-femme, industriel/soudage/chaudronnerie/maintenance/logistique, HSE, digital/informatique. Genere 3 a 5 recommandations de parcours de carriere adaptees au domaine reel du candidat. Ne restreins PAS tes recommandations a l'ingenierie. Reponds en francais.

Retourne un JSON valide avec cette structure exacte:
{
  "paths": [
    {
      "title": "Titre du parcours",
      "description": "Description detaillee du parcours et pourquoi il convient au candidat",
      "requiredSkills": ["Competence 1", "Competence 2"],
      "salaryRange": { "min": <nombre en MAD>, "max": <nombre en MAD>, "currency": "MAD" },
      "growthOutlook": "Perspective de croissance du secteur",
      "relevanceScore": <nombre entre 0 et 100>
    }
  ]
}

Concentre-toi sur les opportunites au Maroc (Casablanca, Rabat, Tanger, zones franches) et a l'international (France, Canada, pays du Golfe). Prends en compte les secteurs en croissance: automobile, aeronautique, energies renouvelables, digital, BTP, industrie pharmaceutique.`,
						},
						{
							role: "user",
							content: `Domaine d'etudes: ${sanitizeAiInput(input.field)}
Competences: ${input.skills.map((s) => sanitizeAiInput(s)).join(", ")}
Centres d'interet: ${input.interests?.map((i) => sanitizeAiInput(i)).join(", ") || "Non specifies"}
Niveau d'experience: ${sanitizeAiInput(input.experienceLevel)}

Recommande les meilleurs parcours de carriere pour ce profil de diplome IMTA.`,
						},
					],
				});

				let parsed: {
					paths: Array<{
						title: string;
						description: string;
						requiredSkills: string[];
						salaryRange: { min: number; max: number; currency: string };
						growthOutlook: string;
						relevanceScore: number;
					}>;
				};

				const safeText = validateAiOutput(result.text).cleaned;

				try {
					const text = safeText.trim();
					const jsonMatch = text.match(/\{[\s\S]*\}/);
					parsed = JSON.parse(jsonMatch ? jsonMatch[0] : safeText);
				} catch {
					parsed = { paths: [] };
				}

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_path_recommendation",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage?.inputTokens,
					outputTokens: result.usage?.outputTokens,
					totalTokens: result.usage?.totalTokens,
				});

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "career_trajectory",
						generatedContent: `${parsed.paths.length} parcours de carriere recommandes pour ${input.field}`,
						outputData: parsed,
						inputData: {
							field: input.field,
							experienceLevel: input.experienceLevel,
							skillsCount: input.skills.length,
						},
						metadata: { provider: serverModel.config.provider, model: serverModel.config.model },
					})
					.catch((err) => console.error("[AI History] Failed to save career.recommendCareerPaths:", err));

				return parsed;
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("[Career AI] Path recommendation error:", error instanceof Error ? error.message : error);
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_path_recommendation",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Les recommandations de carriere ont echoue. Veuillez reessayer.",
				});
			}
		}),

	// AI Career Coach Chat
	careerCoach: aiRateLimitedProcedure
		.input(
			z.object({
				message: z.string().min(1).max(2000),
				field: z.string().max(100).optional(),
				context: z.string().max(5000).optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "career_coach_chat", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "AI usage quota exceeded" });
			}

			let serverModel: { model: ReturnType<typeof getModel>; config: { id: string; provider: string; model: string } };
			try {
				serverModel = await getServerModel();
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				throw new ORPCError("PRECONDITION_FAILED", {
					message: "AI service unavailable. Please contact an administrator.",
				});
			}

			const startTime = Date.now();
			try {
				const fieldContext = input.field ? `Le domaine de l'etudiant est: ${sanitizeAiInput(input.field)}.` : "";
				const sanitizedContext = input.context ? sanitizeAiInput(input.context, 5000) : "";
				const sanitizedMessage = sanitizeAiInput(input.message);

				const result = await generateText({
					model: serverModel.model,
					temperature: 0.6,
					maxRetries: 2,
					maxOutputTokens: 1500,
					messages: [
						{
							role: "system",
							content: `Tu es un coach de carriere expert pour les etudiants et diplomes de l'IMTA Maroc (Institut Marocain des Techniques Avancees), TOUS domaines confondus. ${fieldContext}

Tu accompagnes avec la meme expertise :
- Les etudiants en soins de sante / soins infirmiers / sage-femme / kinesitherapie
- Les etudiants en industrie / soudage / chaudronnerie / maintenance / logistique / conduite d'engins
- Les etudiants en HSE (Hygiene, Securite, Environnement)
- Les etudiants en digital / informatique / reseaux

Ton expertise couvre:
- Le marche de l'emploi marocain (Casablanca, Rabat, Tanger, Marrakech, zones franches, hopitaux publics et prives)
- Les opportunites internationales pour les diplomes IMTA (France, Canada, Golfe, Afrique de l'Ouest)
- Les programmes et specialisations de l'IMTA dans tous les domaines
- Les secteurs en forte croissance: sante, automobile, aeronautique, digital, energies renouvelables, BTP, pharma, HSE industriel
- Les strategies de recherche d'emploi, networking, et developpement professionnel adaptes a chaque domaine
- La redaction de CV et lettres de motivation adaptes au marche marocain et francophone
- La preparation aux entretiens d'embauche pour tous metiers (soins, technique, securite, etc.)

IMPORTANT: Ne restreins JAMAIS tes conseils a l'ingenierie ou la technologie uniquement. Une infirmiere, un soudeur, un technicien HSE ou un conducteur d'engins a autant droit a un accompagnement de qualite.

Reponds en francais, de maniere chaleureuse et professionnelle. Sois concis mais actionnable.
A la fin de ta reponse, propose toujours 2-3 questions de suivi pertinentes.

Retourne un JSON valide avec cette structure:
{
  "response": "Ta reponse ici",
  "suggestedFollowUps": ["Question 1?", "Question 2?", "Question 3?"]
}`,
						},
						{
							role: "user",
							content: sanitizedContext
								? `Contexte precedent:\n${sanitizedContext}\n\nMessage: ${sanitizedMessage}`
								: sanitizedMessage,
						},
					],
				});

				let parsed: {
					response: string;
					suggestedFollowUps: string[];
				};

				const safeText = validateAiOutput(result.text).cleaned;

				try {
					const text = safeText.trim();
					const jsonMatch = text.match(/\{[\s\S]*\}/);
					parsed = JSON.parse(jsonMatch ? jsonMatch[0] : safeText);
				} catch {
					// If JSON parsing fails, use the raw text as response
					parsed = {
						response: safeText.trim(),
						suggestedFollowUps: [
							"Quels sont les secteurs les plus porteurs au Maroc?",
							"Comment optimiser mon CV pour le marche marocain?",
							"Quelles certifications me recommandez-vous?",
						],
					};
				}

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_coach_chat",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage?.inputTokens,
					outputTokens: result.usage?.outputTokens,
					totalTokens: result.usage?.totalTokens,
				});

				// Save to AI history (fire-and-forget)
				aiHistoryService
					.save({
						userId: context.user.id,
						source: "ai_mentor_chat",
						generatedContent: parsed.response,
						outputData: { suggestedFollowUps: parsed.suggestedFollowUps },
						inputData: { message: input.message, field: input.field },
						metadata: { provider: serverModel.config.provider, model: serverModel.config.model },
					})
					.catch((err) => console.error("[AI History] Failed to save career.careerCoach:", err));

				return parsed;
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("[Career AI] Coach chat error:", error instanceof Error ? error.message : error);
				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "career_coach_chat",
					providerId: serverModel.config.id,
					provider: serverModel.config.provider,
					model: serverModel.config.model,
					status: "error",
					errorMessage: error instanceof Error ? error.message : "Unknown error",
					durationMs: Date.now() - startTime,
				});
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Le coach IA n'est pas disponible. Veuillez reessayer.",
				});
			}
		}),

	certifications: careerCertificationsEndpoints,
	roadmaps: careerRoadmapsEndpoints,
	assessment: careerAssessmentEndpoints,
	skillsQuiz: careerSkillsQuizEndpoints,
	timeline: careerTimelineEndpoints,
	userSkills: careerUserSkillsEndpoints,
	studyPlan: careerStudyPlanEndpoints,
	gapAnalysis: careerGapAnalysisEndpoints,
};
