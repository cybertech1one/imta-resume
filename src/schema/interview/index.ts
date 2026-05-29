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

// Field specializations for IMTA students
export const interviewFieldSchema = z.enum([
	"healthcare", // Soins Infirmiers, Aide-Soignant
	"industrial", // Maintenance Industrielle, Electromecanique
	"hse", // Hygiene, Securite et Environnement
	"general", // General/Multi-field
]);
export type InterviewField = z.infer<typeof interviewFieldSchema>;

// Specific IMTA Programs
export const imtaProgramSchema = z.enum([
	// Healthcare Programs
	"sage_femme", // Midwife - 3 years
	"infirmier_polyvalent", // General Nurse - 3 years
	"aide_soignant", // Nursing Assistant - 1 year
	"infirmier_auxiliaire", // Auxiliary Nurse - 2 years
	// Industrial Programs
	"conducteur_engins", // Heavy Equipment Operator - Certifying
	"mecanique_engins", // Heavy Equipment Mechanic - 2 years
	"tourneur_industriel", // Industrial Turner - 1 year
	"cariste", // Forklift Operator - Certifying
	"electromecanique", // Electromechanical - 2 years
	"soudure", // Welding - 1 year
	// Safety Programs
	"hse_specialist", // HSE Specialist - 2 years
	// Other/Custom
	"other", // Custom program
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
			"Accompagnez les femmes dans les moments les plus precieux de leur vie. Une vocation noble avec un taux d'emploi exceptionnel.",
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
			"Le pilier des soins hospitaliers. Formation polyvalente d'excellence qui ouvre les portes de tous les etablissements de sante.",
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
			"Formation acceleree pour une insertion rapide dans le secteur medical. Ideal pour commencer une carriere dans la sante.",
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
			"Le garant du confort et du bien-etre du patient. Soins d'hygiene, surveillance des constantes et assistance technique medicale.",
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
		nameFr: "Specialiste HSE",
		field: "hse",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"Become the safety guardian in strategic industries. An essential profession with attractive salaries.",
		descriptionFr:
			"Devenez le garant de la securite dans les industries strategiques. Un metier indispensable avec des salaires attractifs.",
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
			"Dominez la puissance des machines lourdes sur les chantiers. Formation pratique intensive sur engins reels.",
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
		nameFr: "Mecanique d'Engins",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description:
			"Maintain the giants of mining and construction industries. Rare and highly sought-after technical expertise.",
		descriptionFr:
			"Maintenez les geants de l'industrie miniere et du BTP. Expertise technique rare et tres recherchee sur le marche.",
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
			"L'elite de la mecanique de precision et de l'usinage. Un savoir-faire technique valorise dans toutes les industries.",
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
			"Maitrisez la conduite de chariots pour la logistique. Formation pratique intensive avec certification professionnelle.",
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
		nameFr: "Technicien Electromecanique",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Master both electrical and mechanical systems. Essential for modern automated industries.",
		descriptionFr:
			"Maitrisez les systemes electriques et mecaniques. Essentiel pour les industries automatisees modernes.",
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
			"Maitrisez les techniques de soudure pour le BTP et l'industrie. Competence tres demandee dans plusieurs secteurs.",
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
		descriptionFr: "Programme de formation personnalise ou externe non liste ci-dessus.",
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
