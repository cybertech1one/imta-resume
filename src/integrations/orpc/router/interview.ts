import { ORPCError } from "@orpc/server";
import { generateText, Output, streamText } from "ai";
import { and, eq, sql } from "drizzle-orm";
import z, { ZodError } from "zod";
import evaluateInterviewResponsePrompt from "@/integrations/ai/prompts/evaluate-interview-response-system.md?raw";
import generateInterviewQuestionsPrompt from "@/integrations/ai/prompts/generate-interview-questions-system.md?raw";
import interviewChatbotPrompt from "@/integrations/ai/prompts/interview-chatbot-system.md?raw";
import interviewSessionAnalysisPrompt from "@/integrations/ai/prompts/interview-session-analysis-system.md?raw";
import { sanitizeAiInput, validateAiOutput } from "@/integrations/ai/sanitize";
import { db } from "@/integrations/drizzle/client";
import {
	type InterviewQuestion,
	type InterviewResponse,
	interviewAnalysis,
	interviewSession,
	type ResponseEvaluation,
} from "@/integrations/drizzle/schema";
import {
	evaluateResponseInputSchema,
	generateInterviewInputSchema,
	interviewQuestionSchema,
	responseEvaluationSchema,
	sessionAnalysisSchema,
} from "@/schema/interview";
import { aiRateLimitedProcedure, protectedProcedure } from "../context";
import { aiHistoryService } from "../services/ai-history";
import { aiQuotaService } from "../services/ai-quota";
import { getServerModel } from "./ai-provider-utils";
import { interviewFavoriteEndpoints } from "./interview-favorites";
import { getCommonQuestions, getInterviewTips } from "./interview-helpers";
import { interviewSessionEndpoints } from "./interview-sessions";

/**
 * Safely extracts a loggable error message without leaking sensitive details.
 * Strips API keys, model config, and provider internals from error messages
 * before they are written to server logs or the database.
 */
function safeErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		// Strip potential API key fragments or auth headers from the message
		return error.message
			.replace(/sk-[a-zA-Z0-9_-]+/g, "[REDACTED_KEY]")
			.replace(/Bearer\s+[^\s]+/g, "Bearer [REDACTED]")
			.replace(/api[_-]?key[=:]\s*["']?[^\s"']+/gi, "api_key=[REDACTED]")
			.substring(0, 500);
	}
	return "Unknown error";
}

/**
 * Maps an IMTA program identifier to domain-specific interview context.
 * This ensures AI-generated questions are relevant to the student's actual field
 * of study rather than generic behavioral questions.
 *
 * @param program - The IMTA program ID (e.g., "infirmier_polyvalent", "soudure")
 * @returns Rich domain context string to inject into AI prompts
 */
function getProgramInterviewContext(program: string | null | undefined): string {
	if (!program || program === "other") return "";

	const programContextMap: Record<string, string> = {
		// Healthcare Programs
		sage_femme: `Programme IMTA: Sage-Femme (3 ans)
Domaine: Sante maternelle et neonatale
Competences cles: suivi de grossesse, accouchement, soins postnataux, planification familiale, education a la sante maternelle
Contexte professionnel: maternites, centres de sante, cliniques privees au Maroc
Sujets d'entretien pertinents:
- Gestion des urgences obstetricales (hemorragie post-partum, eclampsie, souffrance foetale)
- Suivi prenatal et detection des grossesses a risque
- Techniques d'accouchement et gestion de la douleur
- Allaitement maternel et soins du nouveau-ne
- Ethique medicale et consentement eclaire
- Communication avec les patientes et leurs familles
- Protocoles d'hygiene en salle d'accouchement
- Travail en equipe pluridisciplinaire (obstetricien, pediatre, anesthesiste)`,

		infirmier_polyvalent: `Programme IMTA: Infirmier Polyvalent (3 ans)
Domaine: Soins infirmiers generaux
Competences cles: soins de base, administration de medicaments, surveillance des constantes vitales, education therapeutique, soins d'urgence
Contexte professionnel: hopitaux publics, cliniques privees, centres de sante au Maroc
Sujets d'entretien pertinents:
- Prise en charge globale du patient (accueil, evaluation, plan de soins)
- Administration des medicaments et calculs de doses
- Gestion des urgences vitales (arret cardiaque, choc anaphylactique, detresse respiratoire)
- Surveillance post-operatoire et detection des complications
- Soins des plaies et prevention des infections nosocomiales
- Communication avec le patient et sa famille
- Respect du secret medical et ethique infirmiere
- Gestion du stress et des situations emotionnellement difficiles
- Travail en equipe soignante (medecins, aides-soignants, kinesitherapeutes)`,

		aide_soignant: `Programme IMTA: Aide-Soignant (1 an)
Domaine: Soins de base et accompagnement des patients
Competences cles: hygiene corporelle, aide a la mobilisation, distribution des repas, confort du patient, observation clinique
Contexte professionnel: services hospitaliers, EHPAD, soins a domicile au Maroc
Sujets d'entretien pertinents:
- Toilette et soins d'hygiene du patient (au lit, au fauteuil)
- Prevention des escarres et changement de position
- Aide a l'alimentation et surveillance de l'hydratation
- Mesure des constantes vitales (tension, temperature, pouls)
- Accompagnement des patients en fin de vie
- Communication avec les patients ages ou desorientes
- Respect de la dignite et de l'intimite du patient
- Collaboration avec l'equipe infirmiere
- Gestion des situations d'agitation ou d'agressivite`,

		infirmier_auxiliaire: `Programme IMTA: Infirmier Auxiliaire (2 ans)
Domaine: Soins infirmiers de base sous supervision
Competences cles: soins de nursing, pansements simples, injections, surveillance des patients, aide aux actes medicaux
Contexte professionnel: hopitaux, centres de sante, dispensaires au Maroc
Sujets d'entretien pertinents:
- Realisation de soins de nursing sous prescription medicale
- Technique des injections (intramusculaire, sous-cutanee, intradermique)
- Pose et surveillance de perfusions
- Pansements simples et complexes
- Preparation du patient pour examens ou interventions
- Observation et transmission des informations cliniques
- Respect des protocoles d'hygiene et de securite
- Prise en charge de la douleur
- Gestion du materiel de soins et approvisionnement`,

		// Industrial Programs
		conducteur_engins: `Programme IMTA: Conducteur d'Engins (Formation certifiante)
Domaine: Conduite d'engins de chantier et de travaux publics
Competences cles: conduite de pelles, chargeuses, bulldozers, compacteurs, inspection pre-demarrage, signalisation de chantier
Contexte professionnel: chantiers BTP, mines, carrieres au Maroc
Sujets d'entretien pertinents:
- Procedures de securite avant demarrage d'un engin (check-list, inspection visuelle)
- Conduite en conditions difficiles (terrain instable, pente, proximite de tranchees)
- Signalisation et communication sur chantier (signaux manuels, radio)
- Gestion des risques de renversement et d'ecrasement
- Entretien courant de l'engin (niveaux, graissage, pneumatiques)
- Reaction en cas de panne sur chantier
- Respect des distances de securite et des zones d'evolution
- Lecture des plans de terrassement
- Port des EPI (casque, gilet, chaussures de securite)`,

		mecanique_engins: `Programme IMTA: Mecanique d'Engins (2 ans)
Domaine: Maintenance et reparation d'engins lourds
Competences cles: diagnostic hydraulique, reparation moteur diesel, systemes de transmission, electronique embarquee, soudure sur chassis
Contexte professionnel: ateliers de maintenance miniere, entreprises BTP, concessionnaires au Maroc
Sujets d'entretien pertinents:
- Diagnostic systematique d'une panne (symptome, hypothese, verification, reparation)
- Maintenance des systemes hydrauliques (verins, pompes, distributeurs, flexibles)
- Reparation des moteurs diesel (injection, turbo, refroidissement)
- Entretien des systemes de transmission (boite de vitesses, convertisseur, pont)
- Lecture de schemas hydrauliques et electriques
- Utilisation des outils de diagnostic electronique
- Planification de la maintenance preventive
- Gestion des pieces de rechange et documentation technique
- Respect des consignes de securite en atelier`,

		tourneur_industriel: `Programme IMTA: Tourneur Industriel (1 an)
Domaine: Usinage et mecanique de precision
Competences cles: tournage conventionnel, programmation CNC, lecture de plans, metrologie, choix des outils de coupe
Contexte professionnel: ateliers d'usinage, industrie automobile, aeronautique au Maroc
Sujets d'entretien pertinents:
- Lecture et interpretation de dessins techniques (tolerances, etats de surface)
- Choix des parametres de coupe (vitesse, avance, profondeur de passe)
- Programmation de tours CNC (codes G et M, cycles d'usinage)
- Utilisation des instruments de mesure (pied a coulisse, micrometre, comparateur)
- Montage et reglage des pieces sur le tour
- Choix et affutage des outils de coupe
- Controle qualite des pieces usinees
- Maintenance de premier niveau du tour
- Respect des regles de securite en atelier (lunettes, gants, cheveux attaches)`,

		cariste: `Programme IMTA: Cariste Professionnel (Formation certifiante)
Domaine: Conduite de chariots elevateurs et logistique
Competences cles: conduite de chariots (frontal, lateral, retractable), gerbage, depalettisation, gestion de stock
Contexte professionnel: entrepots, plateformes logistiques, zones industrielles au Maroc
Sujets d'entretien pertinents:
- Verification quotidienne du chariot avant utilisation (frein, direction, fourches, klaxon)
- Techniques de gerbage et depalettisation en toute securite
- Circulation en entrepot (vitesse, croisements, zones pietonniers)
- Chargement et dechargement de camions
- Utilisation du systeme WMS (gestion d'entrepot informatisee)
- Gestion des marchandises fragiles ou dangereuses
- Reaction en cas de renversement de charge
- Respect des regles FIFO/LIFO pour la rotation des stocks
- Port des EPI et respect des limitations de charge`,

		electromecanique: `Programme IMTA: Electromecanique (2 ans)
Domaine: Maintenance electromecanique industrielle
Competences cles: electricite industrielle, automatismes, pneumatique, hydraulique, mecanique, variateurs de vitesse
Contexte professionnel: usines, stations de traitement, industries agroalimentaires au Maroc
Sujets d'entretien pertinents:
- Diagnostic de pannes sur installations electriques industrielles
- Lecture de schemas electriques (puissance et commande)
- Cablage d'armoires electriques et de moteurs
- Programmation d'automates (Siemens, Schneider, Allen-Bradley)
- Maintenance des systemes pneumatiques et hydrauliques
- Reglage et parametrage de variateurs de vitesse
- Maintenance preventive et plan de maintenance
- Consignation et deconsignation des equipements (LOTO)
- Respect des normes electriques (NFC 15-100) et habilitations`,

		soudure: `Programme IMTA: Soudure (1 an)
Domaine: Soudage et assemblage metallique
Competences cles: soudure a l'arc (SMAW), MIG/MAG, TIG, lecture de plans, controle de soudures, metallurgie de base
Contexte professionnel: chaudronnerie, construction metallique, industrie navale, pipeline au Maroc
Sujets d'entretien pertinents:
- Choix du procede de soudage adapte (electrode enrobee, MIG, TIG, SAW)
- Preparation des pieces avant soudage (chanfreinage, degraissage, pointage)
- Reglage des parametres de soudage (intensite, tension, vitesse)
- Lecture des symboles de soudure sur les plans
- Defauts de soudure et methodes de controle (visuel, ressuage, radiographie)
- Positions de soudage (a plat, en angle, au plafond, verticale)
- Prevention des deformations et contraintes thermiques
- Soudage de differents materiaux (acier, inox, aluminium)
- Respect des regles de securite (masque, gants, ventilation, risque d'incendie)`,

		// HSE Program
		hse_specialist: `Programme IMTA: Specialiste HSE (2 ans)
Domaine: Hygiene, Securite et Environnement
Competences cles: evaluation des risques, systemes de management (ISO 14001, ISO 45001), enquetes d'accidents, audits, gestion des dechets, formation securite
Contexte professionnel: industries, BTP, mines, collectivites au Maroc
Sujets d'entretien pertinents:
- Elaboration du document unique d'evaluation des risques professionnels
- Mise en place d'un systeme de management HSE (ISO 45001, ISO 14001)
- Enquete et analyse d'accident de travail (arbre des causes, methode 5 pourquoi)
- Animation de formations securite pour les operateurs
- Realisation d'audits internes HSE
- Gestion des plans d'urgence et exercices d'evacuation
- Suivi des indicateurs HSE (taux de frequence, taux de gravite)
- Gestion des produits chimiques et fiches de donnees de securite
- Veille reglementaire (code du travail marocain, normes internationales)
- Communication avec les autorites (inspection du travail, protection civile)`,
	};

	return programContextMap[program] ?? "";
}

/**
 * Builds a complete domain context string for AI prompts by combining
 * the user's IMTA program (from their profile or explicit input) with
 * the interview field category.
 *
 * Priority: explicit program input > user's stored imtaProgram > field-only context
 */
function buildDomainContext(
	_field: string,
	programInput: string | undefined,
	userImtaProgram: string | null | undefined,
): string {
	const program = programInput || userImtaProgram;
	const programContext = getProgramInterviewContext(program);

	if (programContext) {
		return `\n\n## IMPORTANT: Domain-Specific Context for This Student\n\n${programContext}\n\nYou MUST generate questions specifically relevant to this program and profession. Do NOT generate generic behavioral questions like "tell me about a time you showed leadership" unless they are framed within the student's professional domain. Every question should relate to real scenarios, technical skills, or situations this student will encounter in their specific career.\n`;
	}

	return "";
}

export const interviewRouter = {
	// Generate interview questions based on field and resume
	generateQuestions: aiRateLimitedProcedure
		.input(
			z.object({
				...generateInterviewInputSchema.shape,
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"interview_generate_questions",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const {
				resumeContext,
				field,
				program,
				types,
				difficulty,
				numberOfQuestions,
				language,
				jobPosition,
				companyName,
			} = input;

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(field, program, context.user.imtaProgram);

			// Build context from resume if provided
			let resumeText = "";
			if (resumeContext) {
				const experienceText =
					resumeContext.experience?.map((e) => `${e.position || ""} at ${e.company || ""}`).join(", ") || "";
				const educationText =
					resumeContext.education?.map((e) => `${e.degree || ""} in ${e.area || ""} at ${e.school || ""}`).join(", ") ||
					"";
				const skillsText = resumeContext.skills?.join(", ") || "";
				const internshipsText =
					resumeContext.internships
						?.map((i) => `${i.position || ""} at ${i.company || ""} (${i.type || ""})`)
						.join(", ") || "";

				resumeText = `
Candidate Information:
- Name: ${resumeContext.name || "Not provided"}
- Current Title: ${resumeContext.headline || "Not provided"}
- Experience: ${experienceText || "None"}
- Education: ${educationText || "None"}
- Skills: ${skillsText || "None"}
- Internships: ${internshipsText || "None"}
`;
			}

			const targetInfo =
				jobPosition || companyName
					? `
Target Position: ${jobPosition || "Not specified"}
Target Company: ${companyName || "Not specified"}
`
					: "";

			const questionsOutputSchema = z.array(interviewQuestionSchema);

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.7,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: questionsOutputSchema }),
					messages: [
						{
							role: "system",
							content: `${generateInterviewQuestionsPrompt}${domainContext}\n\nIMPORTANT: Generate questions in ${language === "fr" ? "French" : language === "ar" ? "Arabic" : "English"} language.`,
						},
						{
							role: "user",
							content: sanitizeAiInput(`Generate ${numberOfQuestions} interview questions with these parameters:

Field: ${field}${program ? `\nSpecific Program: ${program}` : ""}
Question Types: ${types.join(", ")}
Difficulty: ${difficulty}
Language: ${language}
${resumeText}
${targetInfo}

Return a JSON array of questions following the specified format.`),
						},
					],
				});

				const parsed = questionsOutputSchema.parse(result.output);

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_generate_questions",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_questions",
						generatedContent: JSON.stringify(parsed),
						inputData: {
							field: input.field,
							types: input.types,
							difficulty: input.difficulty,
							numberOfQuestions: input.numberOfQuestions,
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
					.catch((err) => console.error("[AI History] Failed to save interview_questions:", safeErrorMessage(err)));

				return parsed;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_generate_questions",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] generateQuestions validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation de la reponse IA a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] generateQuestions error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors de la generation des questions. Veuillez reessayer.",
				});
			}
		}),

	// Evaluate a single response
	evaluateResponse: aiRateLimitedProcedure
		.input(
			z.object({
				...evaluateResponseInputSchema.shape,
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"interview_evaluate_response",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const { question, response, language, field } = input;

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(field, undefined, context.user.imtaProgram);

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 2000,
					output: Output.object({ schema: responseEvaluationSchema }),
					messages: [
						{
							role: "system",
							content: `${evaluateInterviewResponsePrompt}${domainContext}\n\nIMPORTANT: Provide feedback in ${language === "fr" ? "French" : language === "ar" ? "Arabic" : "English"} language. Field context: ${field}`,
						},
						{
							role: "user",
							content: `Evaluate this interview response:

Question: ${question.question}
Question Type: ${question.type}
Field: ${question.field}
Difficulty: ${question.difficulty}
Expected Points: ${question.expectedPoints?.join(", ") || "Not specified"}

Candidate's Response:
${sanitizeAiInput(response)}

Provide detailed evaluation in JSON format.`,
						},
					],
				});

				const parsed = responseEvaluationSchema.parse({
					...result.output,
					questionId: question.id,
				});

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_evaluate_response",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_evaluation",
						generatedContent: JSON.stringify(parsed),
						inputData: { questionType: input.question.type, field: input.field },
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
					.catch((err) => console.error("[AI History] Failed to save interview_evaluation:", safeErrorMessage(err)));

				return parsed;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_evaluate_response",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] evaluateResponse validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation de l'evaluation IA a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] evaluateResponse error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors de l'evaluation. Veuillez reessayer.",
				});
			}
		}),

	// Analyze complete session
	analyzeSession: aiRateLimitedProcedure
		.input(
			z.object({
				sessionId: z.string(),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"interview_analyze_session",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const [session] = await db
				.select()
				.from(interviewSession)
				.where(and(eq(interviewSession.id, input.sessionId), eq(interviewSession.userId, context.user.id)))
				.limit(1);

			if (!session) {
				throw new ORPCError("NOT_FOUND", { message: "Session introuvable" });
			}

			const questions = session.questions as InterviewQuestion[];
			const responses = session.responses as InterviewResponse[];
			const evaluations = session.evaluations as ResponseEvaluation[];

			if (evaluations.length === 0) {
				throw new ORPCError("BAD_REQUEST", {
					message:
						"Impossible d'analyser une session sans reponses evaluees. Veuillez repondre et evaluer au moins une question.",
				});
			}

			// Build session summary for analysis
			const questionsAndResponses = questions
				.map((q: InterviewQuestion, idx: number) => {
					const response = responses.find((r: InterviewResponse) => r.questionId === q.id);
					const evaluation = evaluations.find((e: ResponseEvaluation) => e.questionId === q.id);
					return `
Question ${idx + 1} (${q.type}): ${q.question}
Response: ${response?.response || "No response"}
Score: ${evaluation?.score || "Not evaluated"}/100
`;
				})
				.join("\n---\n");

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(session.field, undefined, context.user.imtaProgram);

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: sessionAnalysisSchema }),
					messages: [
						{
							role: "system",
							content: `${interviewSessionAnalysisPrompt}${domainContext}\n\nIMPORTANT: Provide analysis in ${input.language === "fr" ? "French" : input.language === "ar" ? "Arabic" : "English"} language.`,
						},
						{
							role: "user",
							content: `Analyze this complete interview session:

Session ID: ${session.id}
Field: ${session.field}
Difficulty: ${session.difficulty}
Total Questions: ${session.totalQuestions}
Completed Questions: ${session.completedQuestions}

Questions and Responses:
${questionsAndResponses}

Individual Evaluations Summary:
${evaluations.map((e: ResponseEvaluation) => `- Q${questions.findIndex((q: InterviewQuestion) => q.id === e.questionId) + 1}: ${e.score}/100`).join("\n")}

Provide comprehensive session analysis in JSON format.`,
						},
					],
				});

				const analysis = sessionAnalysisSchema.parse({
					...result.output,
					sessionId: session.id,
				});

				// Save analysis to database
				await db
					.insert(interviewAnalysis)
					.values({
						sessionId: session.id,
						overallScore: analysis.overallScore,
						scoreBreakdown: analysis.scoreBreakdown,
						topStrengths: analysis.topStrengths,
						topWeaknesses: analysis.topWeaknesses,
						recommendations: analysis.recommendations,
						readinessLevel: analysis.readinessLevel,
						summary: analysis.summary,
						nextSteps: analysis.nextSteps,
					})
					.onConflictDoUpdate({
						target: interviewAnalysis.sessionId,
						set: {
							overallScore: analysis.overallScore,
							scoreBreakdown: analysis.scoreBreakdown,
							topStrengths: analysis.topStrengths,
							topWeaknesses: analysis.topWeaknesses,
							recommendations: analysis.recommendations,
							readinessLevel: analysis.readinessLevel,
							summary: analysis.summary,
							nextSteps: analysis.nextSteps,
						},
					});

				// Update session with overall score
				await db
					.update(interviewSession)
					.set({
						overallScore: analysis.overallScore,
						status: "completed",
						completedAt: new Date(),
					})
					.where(eq(interviewSession.id, session.id));

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_analyze_session",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_analysis",
						generatedContent: JSON.stringify(analysis),
						inputData: { sessionId: session.id, field: session.field, difficulty: session.difficulty },
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
					.catch((err) => console.error("[AI History] Failed to save interview_analysis:", safeErrorMessage(err)));

				return analysis;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_analyze_session",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] analyzeSession validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation de l'analyse IA a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] analyzeSession error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors de l'analyse de la session. Veuillez reessayer.",
				});
			}
		}),

	...interviewSessionEndpoints,

	// Get interview tips and resources
	getTips: protectedProcedure
		.input(
			z.object({
				field: z.enum(["healthcare", "industrial", "hse", "general"]).optional(),
				category: z
					.enum(["preparation", "during", "after", "common_questions", "body_language", "field_specific"])
					.optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			// Return static interview tips - these could be moved to database later
			const tips = getInterviewTips(input.field, input.category, input.language);
			return tips;
		}),

	// Get common questions for a field
	getCommonQuestions: protectedProcedure
		.input(
			z.object({
				field: z.enum(["healthcare", "industrial", "hse", "general"]),
				type: z.enum(["behavioral", "technical", "situational", "motivational", "general"]).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const questions = getCommonQuestions(input.field, input.type, input.language);
			return questions;
		}),

	...interviewFavoriteEndpoints,

	// Chat with AI interviewer - streaming conversational interview
	chatWithInterviewer: aiRateLimitedProcedure
		.input(
			z.object({
				messages: z
					.array(
						z.object({
							role: z.enum(["user", "assistant"]),
							content: z.string().max(5000),
						}),
					)
					.max(50),
				mode: z.enum(["quick_practice", "mock_interview", "topic_focus"]).default("quick_practice"),
				field: z.enum(["healthcare", "industrial", "hse", "general"]).default("general"),
				topic: z.string().optional(),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
				isFirstMessage: z.boolean().default(false),
				requestSummary: z.boolean().default(false),
			}),
		)
		.handler(async function* ({ input, context }) {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "interview_chat", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const { messages, mode, field, topic, language, isFirstMessage, requestSummary } = input;

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(field, undefined, context.user.imtaProgram);

			// Build the system prompt with context
			const fieldLabels: Record<string, string> = {
				healthcare: "Healthcare / Nursing",
				industrial: "Industrial Maintenance",
				hse: "HSE / Safety",
				general: "General",
			};

			const modeLabels: Record<string, string> = {
				quick_practice: "Quick Practice (3-5 questions, immediate feedback)",
				mock_interview: "Full Interview (8-10 questions, feedback at the end)",
				topic_focus: "Topic Focus (in-depth questions on a specific skill)",
			};

			const languageInstructions: Record<string, string> = {
				fr: "Respond entirely in French. Use professional but accessible French appropriate for the Moroccan job market.",
				en: "Respond entirely in English. Keep it professional but accessible.",
				ar: "Respond in Arabic (Darija is acceptable for casual parts). Keep it professional.",
			};

			let systemPrompt = `${interviewChatbotPrompt}${domainContext}

## Current Session Context

- **Interview Mode**: ${modeLabels[mode]}
- **Field/Domain**: ${fieldLabels[field]}
${topic ? `- **Specific Topic**: ${topic}` : ""}
- **Language**: ${languageInstructions[language]}

## Special Instructions for This Session

`;

			if (isFirstMessage) {
				systemPrompt += `
This is the START of the interview. Begin with:
1. A warm greeting
2. Brief introduction of yourself (as the interviewer)
3. Explain the interview format based on the mode
4. Ask if the candidate is ready
5. Start with an easy opening question (e.g., "Tell me about yourself")

Make it feel like a real interview is beginning.
`;
			} else if (requestSummary) {
				systemPrompt += `
The candidate has requested to END the interview and receive a summary.
Provide a comprehensive feedback summary including:
1. Overall score (out of 100)
2. Top 3 strengths demonstrated
3. 2-3 areas for improvement
4. Specific recommendations
5. Encouragement for future interviews

Format the summary clearly with headers.
`;
			} else {
				systemPrompt += `
Continue the interview naturally:
- Acknowledge the candidate's response briefly
- Provide feedback based on the mode (immediate for quick_practice, minimal for mock_interview)
- Ask a relevant follow-up question OR move to the next topic
- Keep track of how many questions have been asked
- Maintain a natural conversational flow
`;
			}

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 60_000);

			try {
				({ model, config } = await getServerModel());
				const stream = streamText({
					model,
					temperature: 0.8,
					maxOutputTokens: 1500,
					messages: [
						{
							role: "system",
							content: systemPrompt,
						},
						...messages.map((m) => ({
							role: m.role as "user" | "assistant",
							content: m.role === "user" ? sanitizeAiInput(m.content) : m.content,
						})),
					],
					abortSignal: controller.signal,
				});

				let fullResponse = "";
				for await (const chunk of stream.textStream) {
					fullResponse += chunk;
					yield chunk;
				}

				const usage = await stream.usage;

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_chat",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens,
					totalTokens: usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_chat",
						generatedContent: fullResponse,
						inputData: {
							mode: input.mode,
							field: input.field,
							messageCount: input.messages.length,
							isFirstMessage: input.isFirstMessage,
						},
						metadata: {
							model: config.model,
							provider: config.provider,
							tokens: usage
								? { input: usage.inputTokens ?? 0, output: usage.outputTokens ?? 0, total: usage.totalTokens ?? 0 }
								: undefined,
						},
					})
					.catch((err) => console.error("[AI History] Failed to save interview_chat:", safeErrorMessage(err)));
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_chat",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				console.error("[Interview] chatWithInterviewer error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors du chat. Veuillez reessayer.",
				});
			} finally {
				clearTimeout(timeout);
			}
		}),

	// Generate chatbot session summary
	generateChatbotSummary: aiRateLimitedProcedure
		.input(
			z.object({
				messages: z
					.array(
						z.object({
							role: z.enum(["user", "assistant"]),
							content: z.string().max(5000),
						}),
					)
					.max(50),
				field: z.enum(["healthcare", "industrial", "hse", "general"]),
				mode: z.enum(["quick_practice", "mock_interview", "topic_focus"]),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"interview_chatbot_summary",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const { messages, field, mode, language } = input;

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(field, undefined, context.user.imtaProgram);

			const fieldLabels: Record<string, string> = {
				healthcare: "Healthcare / Nursing",
				industrial: "Industrial Maintenance",
				hse: "HSE / Safety",
				general: "General",
			};

			const summarySchema = z.object({
				overallScore: z.number().min(0).max(100),
				strengths: z.array(z.string()),
				areasForImprovement: z.array(z.string()),
				recommendations: z.array(z.string()),
				questionsSummary: z.array(
					z.object({
						question: z.string(),
						performanceNote: z.string(),
						score: z.number().min(0).max(100),
					}),
				),
				overallFeedback: z.string(),
				readinessLevel: z.enum(["not_ready", "needs_practice", "almost_ready", "interview_ready"]),
			});

			const languageInstructions: Record<string, string> = {
				fr: "Provide all text content in French.",
				en: "Provide all text content in English.",
				ar: "Provide all text content in Arabic.",
			};

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 4000,
					output: Output.object({ schema: summarySchema }),
					messages: [
						{
							role: "system",
							content: `You are analyzing an interview practice session to provide a comprehensive summary.

Field: ${fieldLabels[field]}
Mode: ${mode}
${domainContext}
${languageInstructions[language]}

Analyze the conversation and extract:
1. Overall performance score (0-100)
2. Key strengths demonstrated by the candidate
3. Areas that need improvement
4. Specific recommendations for improvement
5. Summary of each question/answer with individual scores
6. Overall feedback message
7. Readiness level for real interviews

Evaluate the candidate's responses based on their specific professional domain. For technical questions, assess accuracy of domain-specific terminology and procedures. Be constructive and encouraging while being honest about areas to improve.`,
						},
						{
							role: "user",
							content: `Please analyze this interview conversation and provide a structured summary:

${messages.map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.role === "user" ? sanitizeAiInput(m.content) : m.content}`).join("\n\n")}`,
						},
					],
				});

				const parsed = summarySchema.parse(result.output);

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_chatbot_summary",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_analysis",
						generatedContent: JSON.stringify(parsed),
						inputData: { field: input.field, mode: input.mode, messageCount: input.messages.length },
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
					.catch((err) =>
						console.error("[AI History] Failed to save interview_chatbot_summary:", safeErrorMessage(err)),
					);

				return parsed;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_chatbot_summary",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] generateChatbotSummary validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation du resume de chat a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] generateChatbotSummary error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors de la generation du resume. Veuillez reessayer.",
				});
			}
		}),

	// AI Interview Coach - evaluate a specific answer with detailed feedback
	coachAnswer: aiRateLimitedProcedure
		.input(
			z.object({
				question: z.string().min(1).max(2000),
				userAnswer: z.string().min(1).max(5000),
				field: z.enum(["healthcare", "industrial", "hse", "general"]),
				difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(context.user.id, "interview_coach_answer", context.user.role);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const coachOutputSchema = z.object({
				score: z.number().min(1).max(10),
				strengths: z.array(z.string()),
				weaknesses: z.array(z.string()),
				improvedAnswer: z.string(),
				tips: z.array(z.string()),
			});

			const languageLabel = input.language === "fr" ? "French" : input.language === "ar" ? "Arabic" : "English";

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(input.field, undefined, context.user.imtaProgram);

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.5,
					maxRetries: 2,
					maxOutputTokens: 3000,
					output: Output.object({ schema: coachOutputSchema }),
					messages: [
						{
							role: "system",
							content: `You are an expert interview coach for IMTA Morocco engineering graduates. Evaluate the candidate's answer and provide actionable feedback in ${languageLabel}.

You specialize in coaching students from the Institut Marocain des Techniciens en Administration (IMTA) who are preparing for job interviews in ${input.field === "healthcare" ? "healthcare/nursing" : input.field === "industrial" ? "industrial maintenance and mechanics" : input.field === "hse" ? "hygiene, safety and environment (HSE)" : "general professional"} roles.
${domainContext}
Field context: ${input.field}
Difficulty level: ${input.difficulty}

Evaluate the answer on these criteria:
1. Relevance to the question asked
2. Structure and clarity of the response
3. Use of concrete examples (STAR method when applicable)
4. Technical accuracy (for field-specific questions)
5. Communication skills and professionalism

Return a JSON object with:
- score: 1-10 rating
- strengths: array of specific things the candidate did well
- weaknesses: array of specific areas to improve
- improvedAnswer: a model answer the candidate can learn from
- tips: array of actionable coaching tips for future interviews`,
						},
						{
							role: "user",
							content: `Interview Question:
${sanitizeAiInput(input.question)}

Candidate's Answer:
${sanitizeAiInput(input.userAnswer)}

Please evaluate this answer and provide coaching feedback.`,
						},
					],
				});

				const parsed = coachOutputSchema.parse(result.output);
				// Defense-in-depth: redact any credential/exfiltration patterns in the model answer
				parsed.improvedAnswer = validateAiOutput(parsed.improvedAnswer).cleaned;

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_coach_answer",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_coach",
						generatedContent: JSON.stringify(parsed),
						inputData: { field: input.field, difficulty: input.difficulty },
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
					.catch((err) => console.error("[AI History] Failed to save interview_coach:", safeErrorMessage(err)));

				return parsed;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_coach_answer",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] coachAnswer validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation du coaching a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] coachAnswer error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors du coaching. Veuillez reessayer.",
				});
			}
		}),

	// AI Answer Improver - improve a draft answer using STAR method / technical accuracy
	improveAnswer: aiRateLimitedProcedure
		.input(
			z.object({
				question: z.string().min(1).max(2000),
				draftAnswer: z.string().min(1).max(5000),
				targetRole: z.string().max(200).optional(),
				field: z.enum(["healthcare", "industrial", "hse", "general"]),
				language: z.enum(["fr", "en", "ar"]).default("fr"),
			}),
		)
		.handler(async ({ input, context }) => {
			const quotaCheck = await aiQuotaService.checkQuota(
				context.user.id,
				"interview_improve_answer",
				context.user.role,
			);
			if (!quotaCheck.allowed) {
				throw new ORPCError("FORBIDDEN", { message: quotaCheck.reason || "Quota d'utilisation IA depasse" });
			}
			const startTime = Date.now();
			let model!: Awaited<ReturnType<typeof getServerModel>>["model"];
			let config: Awaited<ReturnType<typeof getServerModel>>["config"] | undefined;

			const improveOutputSchema = z.object({
				improvedAnswer: z.string(),
				explanation: z.string(),
				changesSummary: z.array(z.string()),
				methodUsed: z.enum(["star", "technical", "hybrid"]),
				starBreakdown: z
					.object({
						situation: z.string().optional(),
						task: z.string().optional(),
						action: z.string().optional(),
						result: z.string().optional(),
					})
					.optional(),
			});

			const languageLabel = input.language === "fr" ? "French" : input.language === "ar" ? "Arabic" : "English";

			// Build domain-specific context from the student's IMTA program
			const domainContext = buildDomainContext(input.field, undefined, context.user.imtaProgram);

			try {
				({ model, config } = await getServerModel());
				const result = await generateText({
					model,
					temperature: 0.6,
					maxRetries: 2,
					maxOutputTokens: 3000,
					output: Output.object({ schema: improveOutputSchema }),
					messages: [
						{
							role: "system",
							content: `You are an interview answer improvement specialist for IMTA Morocco graduates. Improve the candidate's draft answer while maintaining their authentic voice. Respond in ${languageLabel}.

Your approach:
- For behavioral questions: Structure using the STAR method (Situation, Task, Action, Result)
- For technical questions: Ensure technical accuracy, add relevant terminology, and improve clarity
- For situational questions: Use a hybrid approach combining structured reasoning with technical knowledge
- For motivational questions: Enhance authenticity and connection to the candidate's background
${domainContext}
Field context: ${input.field === "healthcare" ? "Healthcare / Nursing" : input.field === "industrial" ? "Industrial Maintenance" : input.field === "hse" ? "HSE / Safety" : "General"}
${input.targetRole ? `Target role: ${input.targetRole}` : ""}

Return a JSON object with:
- improvedAnswer: the enhanced version of the candidate's answer
- explanation: why these changes were made and how they improve the answer
- changesSummary: array of specific changes made
- methodUsed: "star" for behavioral, "technical" for technical, "hybrid" for mixed
- starBreakdown: if STAR method was used, break down the answer into S/T/A/R components`,
						},
						{
							role: "user",
							content: `Interview Question:
${sanitizeAiInput(input.question)}

Draft Answer to Improve:
${sanitizeAiInput(input.draftAnswer)}

Please improve this answer while keeping it natural and authentic.`,
						},
					],
				});

				const parsed = improveOutputSchema.parse(result.output);
				// Defense-in-depth: redact any credential/exfiltration patterns in user-facing text
				parsed.improvedAnswer = validateAiOutput(parsed.improvedAnswer).cleaned;
				parsed.explanation = validateAiOutput(parsed.explanation).cleaned;

				await aiQuotaService.logUsage({
					userId: context.user.id,
					feature: "interview_improve_answer",
					providerId: config.id,
					provider: config.provider,
					model: config.model,
					status: "success",
					durationMs: Date.now() - startTime,
					inputTokens: result.usage.inputTokens,
					outputTokens: result.usage.outputTokens,
					totalTokens: result.usage.totalTokens,
				});

				aiHistoryService
					.save({
						userId: context.user.id,
						source: "interview_improve",
						generatedContent: JSON.stringify(parsed),
						inputData: { field: input.field, targetRole: input.targetRole },
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
					.catch((err) => console.error("[AI History] Failed to save interview_improve:", safeErrorMessage(err)));

				return parsed;
			} catch (error) {
				if (config) {
					await aiQuotaService.logUsage({
						userId: context.user.id,
						feature: "interview_improve_answer",
						providerId: config.id,
						provider: config.provider,
						model: config.model,
						status: "error",
						errorMessage: safeErrorMessage(error),
						durationMs: Date.now() - startTime,
					});
				}
				if (error instanceof ORPCError) throw error;
				if (error instanceof ZodError) {
					console.error("[Interview] improveAnswer validation error:", safeErrorMessage(error));
					throw new ORPCError("INTERNAL_SERVER_ERROR", {
						message: "La validation de l'amelioration a echoue. Veuillez reessayer.",
					});
				}
				console.error("[Interview] improveAnswer error:", safeErrorMessage(error));
				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Une erreur est survenue lors de l'amelioration de la reponse. Veuillez reessayer.",
				});
			}
		}),

	// Interview Readiness Score - calculated from session history (database query, NOT AI)
	getReadinessScore: protectedProcedure.input(z.object({}).optional()).handler(async ({ context }) => {
		const userId = context.user.id;

		// Fetch all completed sessions with analyses
		const sessions = await db.select().from(interviewSession).where(eq(interviewSession.userId, userId));

		const analyses = await db
			.select()
			.from(interviewAnalysis)
			.where(
				sql`${interviewAnalysis.sessionId} IN (
						SELECT ${interviewSession.id} FROM ${interviewSession}
						WHERE ${interviewSession.userId} = ${userId}
					)`,
			);

		const totalSessions = sessions.length;
		const completedSessions = sessions.filter((s) => s.status === "completed");
		const completedCount = completedSessions.length;

		// Calculate component scores (each weighted to contribute to 0-100 total)
		// 1. Practice frequency score (0-25): based on total sessions
		const practiceScore = Math.min(25, totalSessions * 5);

		// 2. Completion rate score (0-20): percentage of started sessions that were completed
		const startedSessions = sessions.filter((s) => s.status !== "pending");
		const completionRate = startedSessions.length > 0 ? completedCount / startedSessions.length : 0;
		const completionScore = Math.round(completionRate * 20);

		// 3. Average performance score (0-30): based on scores from analyses
		const scoredSessions = completedSessions.filter((s) => s.overallScore !== null);
		const avgScore =
			scoredSessions.length > 0
				? scoredSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / scoredSessions.length
				: 0;
		const performanceScore = Math.round((avgScore / 100) * 30);

		// 4. Topic coverage score (0-15): how many different fields practiced
		const fieldsSet = new Set<string>(sessions.map((s) => s.field));
		const totalFields = 4; // healthcare, industrial, hse, general
		const coverageScore = Math.round((fieldsSet.size / totalFields) * 15);

		// 5. Recent activity score (0-10): sessions in the last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const recentSessions = sessions.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo).length;
		const recencyScore = Math.min(10, recentSessions * 2);

		const totalScore = practiceScore + completionScore + performanceScore + coverageScore + recencyScore;

		// Determine readiness level
		let readinessLevel: "not_ready" | "needs_practice" | "almost_ready" | "interview_ready";
		if (totalScore >= 80) readinessLevel = "interview_ready";
		else if (totalScore >= 55) readinessLevel = "almost_ready";
		else if (totalScore >= 30) readinessLevel = "needs_practice";
		else readinessLevel = "not_ready";

		// Build field-specific breakdown
		const fieldBreakdown: Record<string, { sessions: number; avgScore: number; lastPracticed: string | null }> = {};
		for (const field of ["healthcare", "industrial", "hse", "general"]) {
			const fieldSessions = sessions.filter((s) => s.field === field);
			const fieldCompleted = fieldSessions.filter((s) => s.status === "completed" && s.overallScore !== null);
			const fieldAvg =
				fieldCompleted.length > 0
					? Math.round(fieldCompleted.reduce((acc, s) => acc + (s.overallScore || 0), 0) / fieldCompleted.length)
					: 0;
			const lastSession =
				fieldSessions.length > 0
					? fieldSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
					: null;

			fieldBreakdown[field] = {
				sessions: fieldSessions.length,
				avgScore: fieldAvg,
				lastPracticed: lastSession ? new Date(lastSession.createdAt).toISOString() : null,
			};
		}

		// Generate suggestions
		const suggestions: string[] = [];
		if (totalSessions === 0) {
			suggestions.push("Commencez votre premiere session de pratique pour evaluer votre niveau.");
		}
		if (totalSessions < 5) {
			suggestions.push("Augmentez votre nombre de sessions - visez au moins 5 sessions completes.");
		}
		if (completionRate < 0.7 && startedSessions.length > 0) {
			suggestions.push("Terminez vos sessions commencees pour une meilleure preparation.");
		}
		if (avgScore > 0 && avgScore < 60) {
			suggestions.push("Concentrez-vous sur ameliorer vos reponses - visez un score moyen superieur a 60%.");
		}
		if (fieldsSet.size < 3) {
			const allFields: string[] = ["healthcare", "industrial", "hse", "general"];
			const missingFields = allFields.filter((f) => !fieldsSet.has(f));
			suggestions.push(`Pratiquez dans de nouveaux domaines: ${missingFields.join(", ")}.`);
		}
		if (recentSessions === 0 && totalSessions > 0) {
			suggestions.push("Reprenez la pratique - aucune session dans les 30 derniers jours.");
		}
		if (totalScore >= 80) {
			suggestions.push("Excellent! Maintenez votre rythme et essayez le niveau avance.");
		}

		// Gather top strengths and weaknesses from analyses
		const topStrengths: string[] = [];
		const topWeaknesses: string[] = [];
		for (const analysis of analyses) {
			const strengths = analysis.topStrengths as string[];
			const weaknesses = analysis.topWeaknesses as string[];
			if (strengths) topStrengths.push(...strengths);
			if (weaknesses) topWeaknesses.push(...weaknesses);
		}

		return {
			score: totalScore,
			readinessLevel,
			breakdown: {
				practice: { score: practiceScore, max: 25, label: "Frequence de pratique" },
				completion: { score: completionScore, max: 20, label: "Taux de completion" },
				performance: { score: performanceScore, max: 30, label: "Performance moyenne" },
				coverage: { score: coverageScore, max: 15, label: "Couverture des domaines" },
				recency: { score: recencyScore, max: 10, label: "Activite recente" },
			},
			fieldBreakdown,
			suggestions,
			stats: {
				totalSessions,
				completedSessions: completedCount,
				averageScore: Math.round(avgScore),
				fieldsCovered: fieldsSet.size,
				recentSessions,
			},
			topStrengths: [...new Set(topStrengths)].slice(0, 5),
			topWeaknesses: [...new Set(topWeaknesses)].slice(0, 5),
		};
	}),
};
