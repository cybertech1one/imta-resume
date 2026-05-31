import z from "zod";

// Interview difficulty levels
export const interviewDifficultySchema = z.enum(["beginner", "intermediate", "advanced"]);
export type InterviewDifficulty = z.infer<typeof interviewDifficultySchema>;

// Interview types
export const interviewTypeSchema = z.enum([
	"behavioral", // Questions about past experiences
	"technical", // Field-specific technical questions
	"situational", // Hypothetical scenario questions
	"motivational", // Questions about goals and motivation
	"general", // General interview questions
]);
export type InterviewType = z.infer<typeof interviewTypeSchema>;

// Field specializations for IMTA students.
// NOTE: This enum is the canonical taxonomy and is kept in sync with the
// production `imta_program.field` column. The production DB exposes 5 active
// fields (healthcare, hse, industrial, management, technology) plus the
// "general" multi-field bucket used by fallbacks and the AI interview path.
export const interviewFieldSchema = z.enum([
	"healthcare", // Soins Infirmiers, Sage-Femme, Aide-Soignant, Labo, Anesthesie...
	"industrial", // Maintenance, Electromecanique, Soudure, Genie Civil, Energies...
	"hse", // Hygiene, Securite et Environnement
	"management", // Finance, RH, Commerce, Supply Chain, Management de Projets
	"technology", // Informatique, Reseaux, Data/IA, Cybersecurite, Telecoms
	"general", // General/Multi-field (fallback bucket, "other" programs)
]);
export type InterviewField = z.infer<typeof interviewFieldSchema>;

// Specific IMTA Programs.
// Aligned with the production `imta_program` table (33 active programs across 5
// fields). Legacy ids that predate the prod taxonomy are intentionally retained
// (not deleted) because existing users may have selected them — alignment, not
// removal. Each id below carries its canonical field in a trailing comment.
export const imtaProgramSchema = z.enum([
	// ---- Healthcare ----
	"sage_femme", // Sage-Femme (healthcare)
	"infirmier_polyvalent", // Infirmier Polyvalent (healthcare)
	"aide_soignant", // Aide Soignant (healthcare)
	"infirmier_auxiliaire", // Infirmier Auxiliaire (healthcare) — legacy, retained
	"auxiliaire_puericulture", // Auxiliaire de Puericulture (healthcare)
	"genie_biomedical", // Genie Biomedical (healthcare)
	"sciences_infirmieres_sante", // Sciences Infirmieres et Techniques de Sante (healthcare)
	"technicien_anesthesie", // Technicien d'Anesthesie (healthcare)
	"technicien_laboratoire", // Technicien de Laboratoire (healthcare)
	// ---- HSE ----
	"hse_specialist", // Specialiste HSE (hse)
	"hse_advanced", // Hygiene, Securite et Environnement avance (hse)
	// ---- Industrial ----
	"conducteur_engins", // Conducteur d'Engins (industrial)
	"mecanique_engins", // Mecanique d'Engins (industrial) — legacy, retained
	"tourneur_industriel", // Tourneur Industriel (industrial) — legacy, retained
	"cariste", // Cariste / Conducteur d'Engins (industrial)
	"electromecanique", // Technicien Electromecanique (industrial)
	"soudure", // Soudeur (industrial)
	"maintenance_industrielle", // Technicien de Maintenance Industrielle (industrial)
	"maintenance_industrielle_avancee", // Maintenance Industrielle Avancee (industrial)
	"automatique_informatique_industrielle", // Automatique et Informatique Industrielle (industrial)
	"energies_renouvelables_dd", // Energies Renouvelables et Developpement Durable (industrial)
	"genie_civil_btp", // Genie Civil et BTP (industrial)
	"genie_electrique_energies", // Genie Electrique et Energies Renouvelables (industrial)
	"genie_industriel_logistique", // Genie Industriel et Logistique (industrial)
	"genie_procedes_environnement", // Genie des Procedes et Environnement (industrial)
	"qualite_amelioration_continue", // Qualite et Amelioration Continue (industrial)
	"technicien_froid", // Technicien en Froid et Climatisation (industrial)
	// ---- Management ----
	"commerce_marketing_digital", // Commerce et Marketing Digital (management)
	"finance_comptabilite", // Finance et Comptabilite (management)
	"management_projets_industriels", // Management de Projets Industriels (management)
	"ressources_humaines_droit", // Ressources Humaines et Droit Social (management)
	"supply_chain_logistique", // Supply Chain et Logistique (management)
	// ---- Technology ----
	"cybersecurite_confiance", // Cybersecurite et Confiance Numerique (technology)
	"data_science_ia", // Data Science et Intelligence Artificielle (technology)
	"genie_informatique_reseaux", // Genie Informatique et Reseaux (technology)
	"telecommunications_reseaux", // Telecommunications et Reseaux (technology)
	// ---- Other/Custom ----
	"other", // Programme personnalise/externe (general)
]);
export type ImtaProgram = z.infer<typeof imtaProgramSchema>;

// Program metadata for display and filtering
export const programMetadataSchema = z.object({
	id: imtaProgramSchema,
	name: z.string(),
	nameFr: z.string(),
	field: interviewFieldSchema,
	duration: z.string(),
	durationFr: z.string(),
	requirements: z.string(),
	requirementsFr: z.string(),
	description: z.string(),
	descriptionFr: z.string(),
	successRate: z.number().optional(),
	avgSalary: z.string().optional(),
	employmentRate: z.number().optional(),
	skills: z.array(z.string()),
	certifications: z.array(z.string()).optional(),
});
export type ProgramMetadata = z.infer<typeof programMetadataSchema>;

// Static program data
export const IMTA_PROGRAMS: ProgramMetadata[] = [
	{
		id: "sage_femme",
		name: "Midwife",
		nameFr: "Sage-Femme",
		field: "healthcare",
		duration: "3 Years",
		durationFr: "3 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"Support women through the most precious moments of their lives. A noble vocation with exceptional employment rates.",
		descriptionFr:
			"Accompagnez les femmes dans les moments les plus précieux de leur vie. Une vocation noble avec un taux d'emploi exceptionnel.",
		successRate: 98,
		avgSalary: "6000+ DH/Mois",
		employmentRate: 100,
		skills: [
			"Obstetrics",
			"Prenatal care",
			"Postnatal care",
			"Emergency childbirth",
			"Patient communication",
			"Medical monitoring",
		],
		certifications: ["State Diploma in Midwifery"],
	},
	{
		id: "infirmier_polyvalent",
		name: "General Nurse",
		nameFr: "Infirmier Polyvalent",
		field: "healthcare",
		duration: "3 Years",
		durationFr: "3 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"The pillar of hospital care. Excellent versatile training that opens doors to all healthcare facilities.",
		descriptionFr:
			"Le pilier des soins hospitaliers. Formation polyvalente d'excellence qui ouvre les portes de tous les établissements de santé.",
		successRate: 97,
		avgSalary: "5500+ DH/Mois",
		employmentRate: 100,
		skills: [
			"Patient care",
			"Medication administration",
			"Vital signs monitoring",
			"Wound care",
			"IV therapy",
			"Emergency response",
		],
		certifications: ["State Nursing Diploma"],
	},
	{
		id: "aide_soignant",
		name: "Nursing Assistant",
		nameFr: "Aide Soignant",
		field: "healthcare",
		duration: "1 Year",
		durationFr: "1 An",
		requirements: "9th Grade (3eme AS)",
		requirementsFr: "3eme AS",
		description:
			"Accelerated training for rapid entry into the medical sector. Ideal for starting a career in healthcare.",
		descriptionFr:
			"Formation accélérée pour une insertion rapide dans le secteur médical. Idéal pour commencer une carrière dans la santé.",
		successRate: 95,
		avgSalary: "3500+ DH/Mois",
		employmentRate: 98,
		skills: [
			"Basic patient care",
			"Hygiene assistance",
			"Mobility support",
			"Vital signs",
			"Patient comfort",
			"Team collaboration",
		],
		certifications: ["Nursing Assistant Certificate"],
	},
	{
		id: "infirmier_auxiliaire",
		name: "Auxiliary Nurse",
		nameFr: "Infirmier Auxiliaire",
		field: "healthcare",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"The guardian of patient comfort and well-being. Hygiene care, vital signs monitoring, and medical technical assistance.",
		descriptionFr:
			"Le garant du confort et du bien-être du patient. Soins d'hygiène, surveillance des constantes et assistance technique médicale.",
		successRate: 70,
		avgSalary: "4500+ DH/Mois",
		employmentRate: 95,
		skills: [
			"Hygiene care",
			"Vital signs monitoring",
			"Medical assistance",
			"Patient comfort",
			"Documentation",
			"Communication",
		],
		certifications: ["Auxiliary Nursing Diploma"],
	},
	{
		id: "hse_specialist",
		name: "HSE Specialist",
		nameFr: "Spécialiste HSE",
		field: "hse",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"Become the safety guardian in strategic industries. An essential profession with attractive salaries.",
		descriptionFr:
			"Devenez le garant de la sécurité dans les industries stratégiques. Un métier indispensable avec des salaires attractifs.",
		successRate: 96,
		avgSalary: "7000+ DH/Mois",
		employmentRate: 95,
		skills: [
			"Risk assessment",
			"Safety audits",
			"Emergency planning",
			"Regulatory compliance",
			"Training delivery",
			"Incident investigation",
		],
		certifications: ["HSE Technician Diploma", "ISO 45001"],
	},
	{
		id: "conducteur_engins",
		name: "Heavy Equipment Operator",
		nameFr: "Conducteur d'Engins",
		field: "industrial",
		duration: "Certifying",
		durationFr: "Certifiant",
		requirements: "Short Program",
		requirementsFr: "Court",
		description:
			"Master the power of heavy machinery on construction sites. Intensive practical training on real equipment.",
		descriptionFr:
			"Dominez la puissance des machines lourdes sur les chantiers. Formation pratique intensive sur engins réels.",
		successRate: 100,
		avgSalary: "8000+ DH/Mois",
		employmentRate: 92,
		skills: [
			"Excavator operation",
			"Loader operation",
			"Bulldozer operation",
			"Safety protocols",
			"Site navigation",
			"Equipment inspection",
		],
		certifications: ["Heavy Equipment Operator License", "CACES"],
	},
	{
		id: "mecanique_engins",
		name: "Heavy Equipment Mechanic",
		nameFr: "Mécanique d'Engins",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"Maintain the giants of mining and construction industries. Rare and highly sought-after technical expertise.",
		descriptionFr:
			"Maintenez les géants de l'industrie minière et du BTP. Expertise technique rare et très recherchée sur le marché.",
		successRate: 94,
		avgSalary: "7500+ DH/Mois",
		employmentRate: 93,
		skills: [
			"Hydraulic systems",
			"Engine diagnostics",
			"Transmission repair",
			"Electrical systems",
			"Preventive maintenance",
			"Welding",
		],
		certifications: ["Heavy Equipment Mechanic Diploma"],
	},
	{
		id: "tourneur_industriel",
		name: "Industrial Turner",
		nameFr: "Tourneur Industriel",
		field: "industrial",
		duration: "1 Year",
		durationFr: "1 An",
		requirements: "9th Grade (9AF)",
		requirementsFr: "9AF",
		description: "The elite of precision mechanics and machining. Technical expertise valued in all industries.",
		descriptionFr:
			"L'élite de la mécanique de précision et de l'usinage. Un savoir-faire technique valorisé dans toutes les industries.",
		successRate: 92,
		avgSalary: "5000+ DH/Mois",
		employmentRate: 90,
		skills: [
			"Lathe operation",
			"CNC programming",
			"Blueprint reading",
			"Precision measuring",
			"Tool selection",
			"Quality control",
		],
		certifications: ["Industrial Turner Certificate"],
	},
	{
		id: "cariste",
		name: "Forklift Operator",
		nameFr: "Cariste Professionnel",
		field: "industrial",
		duration: "Certifying",
		durationFr: "Certifiant",
		requirements: "Short Program",
		requirementsFr: "Court",
		description: "Master forklift driving for logistics. Intensive practical training with professional certification.",
		descriptionFr:
			"Maîtrisez la conduite de chariots pour la logistique. Formation pratique intensive avec certification professionnelle.",
		successRate: 100,
		avgSalary: "4500+ DH/Mois",
		employmentRate: 95,
		skills: [
			"Forklift operation",
			"Load handling",
			"Warehouse navigation",
			"Inventory management",
			"Safety compliance",
			"Equipment maintenance",
		],
		certifications: ["Forklift Operator License", "CACES R489"],
	},
	{
		id: "electromecanique",
		name: "Electromechanical Technician",
		nameFr: "Technicien Électromécanique",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Master both electrical and mechanical systems. Essential for modern automated industries.",
		descriptionFr:
			"Maîtrisez les systèmes électriques et mécaniques. Essentiel pour les industries automatisées modernes.",
		successRate: 93,
		avgSalary: "6000+ DH/Mois",
		employmentRate: 94,
		skills: [
			"Electrical systems",
			"Mechanical systems",
			"PLC programming",
			"Automation",
			"Troubleshooting",
			"Preventive maintenance",
		],
		certifications: ["Electromechanical Technician Diploma"],
	},
	{
		id: "soudure",
		name: "Welder",
		nameFr: "Soudeur",
		field: "industrial",
		duration: "1 Year",
		durationFr: "1 An",
		requirements: "9th Grade",
		requirementsFr: "9AF",
		description: "Master welding techniques for construction and industry. High demand skill across multiple sectors.",
		descriptionFr:
			"Maîtrisez les techniques de soudure pour le BTP et l'industrie. Compétence très demandée dans plusieurs secteurs.",
		successRate: 91,
		avgSalary: "5500+ DH/Mois",
		employmentRate: 92,
		skills: [
			"MIG welding",
			"TIG welding",
			"Arc welding",
			"Blueprint reading",
			"Metal preparation",
			"Quality inspection",
		],
		certifications: ["Welder Certificate", "AWS Certification"],
	},
	{
		id: "other",
		name: "Other Program",
		nameFr: "Autre Programme",
		field: "general",
		duration: "Variable",
		durationFr: "Variable",
		requirements: "Varies",
		requirementsFr: "Variable",
		description: "Custom or external training program not listed above.",
		descriptionFr: "Programme de formation personnalisé ou externe non listé ci-dessus.",
		skills: [],
	},
];

// Session status
export const interviewSessionStatusSchema = z.enum(["pending", "in_progress", "completed", "abandoned"]);
export type InterviewSessionStatus = z.infer<typeof interviewSessionStatusSchema>;

// Single interview question
export const interviewQuestionSchema = z.object({
	id: z.string(),
	question: z.string(),
	questionFr: z.string().optional(), // French version
	type: interviewTypeSchema,
	field: interviewFieldSchema,
	program: imtaProgramSchema.optional(), // Specific program if applicable
	difficulty: interviewDifficultySchema,
	expectedPoints: z.array(z.string()).optional(), // Key points to cover in answer
	followUpQuestions: z.array(z.string()).optional(),
	tips: z.string().optional(), // Hints for answering
	order: z.number(),
});
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

// User's response to a question
export const interviewResponseSchema = z.object({
	questionId: z.string(),
	response: z.string(),
	responseTime: z.number().optional(), // Time taken in seconds
	audioUrl: z.string().optional(), // If recorded verbally
	timestamp: z.string(),
});
export type InterviewResponse = z.infer<typeof interviewResponseSchema>;

// AI evaluation of a response
export const responseEvaluationSchema = z.object({
	questionId: z.string(),
	score: z.number().min(0).max(100),
	strengths: z.array(z.string()),
	areasForImprovement: z.array(z.string()),
	suggestions: z.array(z.string()),
	sampleAnswer: z.string().optional(),
	keyPointsCovered: z.array(z.string()),
	keyPointsMissed: z.array(z.string()),
	overallFeedback: z.string(),
});
export type ResponseEvaluation = z.infer<typeof responseEvaluationSchema>;

// Complete interview session
export const interviewSessionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	resumeId: z.string().optional(), // If linked to a resume
	title: z.string(),
	description: z.string().optional(),
	field: interviewFieldSchema,
	program: imtaProgramSchema.optional(), // Specific IMTA program
	types: z.array(interviewTypeSchema),
	difficulty: interviewDifficultySchema,
	language: z.enum(["fr", "en", "ar"]).default("fr"),
	status: interviewSessionStatusSchema,
	questions: z.array(interviewQuestionSchema),
	responses: z.array(interviewResponseSchema),
	evaluations: z.array(responseEvaluationSchema),
	totalQuestions: z.number(),
	completedQuestions: z.number(),
	overallScore: z.number().optional(),
	startedAt: z.string().optional(),
	completedAt: z.string().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type InterviewSession = z.infer<typeof interviewSessionSchema>;

// Overall session analysis
export const sessionAnalysisSchema = z.object({
	sessionId: z.string(),
	overallScore: z.number().min(0).max(100),
	scoreBreakdown: z.object({
		behavioral: z.number().optional(),
		technical: z.number().optional(),
		situational: z.number().optional(),
		motivational: z.number().optional(),
		general: z.number().optional(),
	}),
	topStrengths: z.array(z.string()),
	topWeaknesses: z.array(z.string()),
	recommendations: z.array(z.string()),
	readinessLevel: z.enum(["not_ready", "needs_practice", "almost_ready", "interview_ready"]),
	summary: z.string(),
	nextSteps: z.array(z.string()),
});
export type SessionAnalysis = z.infer<typeof sessionAnalysisSchema>;

// Input for generating interview questions
export const generateInterviewInputSchema = z.object({
	field: interviewFieldSchema,
	program: imtaProgramSchema.optional(), // Specific IMTA program for targeted questions
	types: z.array(interviewTypeSchema).default(["behavioral", "technical", "situational"]),
	difficulty: interviewDifficultySchema.default("intermediate"),
	numberOfQuestions: z.number().min(3).max(20).default(10),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
	resumeContext: z
		.object({
			name: z.string().optional(),
			headline: z.string().optional(),
			experience: z
				.array(
					z.object({
						company: z.string().optional(),
						position: z.string().optional(),
						description: z.string().optional(),
					}),
				)
				.optional(),
			education: z
				.array(
					z.object({
						school: z.string().optional(),
						degree: z.string().optional(),
						area: z.string().optional(),
					}),
				)
				.optional(),
			skills: z.array(z.string()).optional(),
			internships: z
				.array(
					z.object({
						company: z.string().optional(),
						position: z.string().optional(),
						type: z.string().optional(),
					}),
				)
				.optional(),
		})
		.optional(),
	jobPosition: z.string().optional(), // Target job they're interviewing for
	companyName: z.string().optional(),
});
export type GenerateInterviewInput = z.infer<typeof generateInterviewInputSchema>;

// Helper function to get program by ID
export function getProgramById(programId: ImtaProgram): ProgramMetadata | undefined {
	return IMTA_PROGRAMS.find((p) => p.id === programId);
}

// Helper function to get programs by field
export function getProgramsByField(field: InterviewField): ProgramMetadata[] {
	if (field === "general") return IMTA_PROGRAMS;
	return IMTA_PROGRAMS.filter((p) => p.field === field);
}

// Helper to get field from program
export function getFieldFromProgram(programId: ImtaProgram): InterviewField {
	const program = getProgramById(programId);
	return program?.field || "general";
}

// Input for evaluating a response
export const evaluateResponseInputSchema = z.object({
	question: interviewQuestionSchema,
	response: z.string().max(5000),
	language: z.enum(["fr", "en", "ar"]).default("fr"),
	field: interviewFieldSchema,
});
export type EvaluateResponseInput = z.infer<typeof evaluateResponseInputSchema>;

// Interview resource/tip
export const interviewTipSchema = z.object({
	id: z.string(),
	title: z.string(),
	titleFr: z.string(),
	content: z.string(),
	contentFr: z.string(),
	category: z.enum(["preparation", "during", "after", "common_questions", "body_language", "field_specific"]),
	field: interviewFieldSchema.optional(), // If field-specific
	tags: z.array(z.string()),
});
export type InterviewTip = z.infer<typeof interviewTipSchema>;

// Common interview question template
export const commonQuestionSchema = z.object({
	id: z.string(),
	question: z.string(),
	questionFr: z.string(),
	type: interviewTypeSchema,
	field: interviewFieldSchema,
	sampleAnswer: z.string().optional(),
	sampleAnswerFr: z.string().optional(),
	tips: z.array(z.string()),
	tipsFr: z.array(z.string()),
});
export type CommonQuestion = z.infer<typeof commonQuestionSchema>;
