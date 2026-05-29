/**
 * Seed Reference Data Script
 *
 * Seeds the database with IMTA reference data for:
 * - IMTA Programs
 * - Interview Tips
 * - Interview Questions
 * - Market Insights
 * - Employers
 * - Skill Library
 *
 * Usage: npx tsx scripts/seed-reference-data.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../src/integrations/drizzle/schema";

// Direct connection - uses default Docker postgres
const connectionString = "postgresql://postgres:postgres@localhost:5432/postgres";
const pool = new pg.Pool({ connectionString });
const db = drizzle({ client: pool, schema });

console.log("Using database: localhost:5432/postgres");

// Seed data - IMTA Programs
const SEED_IMTA_PROGRAMS = [
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
		avgSalary: 6000,
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
		avgSalary: 5500,
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
		avgSalary: 3500,
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
		avgSalary: 7000,
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
		avgSalary: 8000,
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
		avgSalary: 6000,
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
		avgSalary: 5500,
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
];

// Seed data - Interview Tips
const SEED_INTERVIEW_TIPS = [
	{
		id: "prep-1",
		title: "Research the Company",
		titleFr: "Recherchez l'entreprise",
		content: "Learn about the company's mission, values, and recent news before the interview.",
		contentFr: "Renseignez-vous sur la mission, les valeurs et l'actualite de l'entreprise avant l'entretien.",
		category: "preparation",
		tags: ["research", "company", "preparation"],
	},
	{
		id: "prep-2",
		title: "Prepare Your Documents",
		titleFr: "Preparez vos documents",
		content: "Bring multiple copies of your resume, diplomas, internship certificates, and other relevant documents.",
		contentFr: "Apportez plusieurs copies de votre CV, diplomes, attestations de stage et certificats.",
		category: "preparation",
		tags: ["documents", "resume", "preparation"],
	},
	{
		id: "during-1",
		title: "Listen Carefully",
		titleFr: "Ecoutez attentivement",
		content: "Listen to the entire question before answering. Ask for clarification if needed.",
		contentFr: "Ecoutez la question en entier avant de repondre. Demandez des precisions si necessaire.",
		category: "during",
		tags: ["listening", "communication", "during"],
	},
	{
		id: "during-2",
		title: "Use Concrete Examples",
		titleFr: "Utilisez des exemples concrets",
		content: "Support your answers with specific examples from your internships or studies.",
		contentFr: "Appuyez vos reponses avec des exemples precis de vos stages ou etudes a l'IMTA.",
		category: "during",
		tags: ["examples", "STAR", "during"],
	},
	{
		id: "after-1",
		title: "Send a Thank You",
		titleFr: "Envoyez un remerciement",
		content: "Send a brief thank-you email within 24 hours of the interview.",
		contentFr: "Envoyez un bref email de remerciement dans les 24 heures suivant l'entretien.",
		category: "after",
		tags: ["follow-up", "thank-you", "after"],
	},
	{
		id: "body-1",
		title: "Maintain Eye Contact",
		titleFr: "Maintenez le contact visuel",
		content: "Look at the interviewer when speaking to show confidence and engagement.",
		contentFr: "Regardez le recruteur quand vous parlez pour montrer confiance et engagement.",
		category: "body_language",
		tags: ["body-language", "confidence", "eye-contact"],
	},
	{
		id: "body-2",
		title: "Sit Up Straight",
		titleFr: "Tenez-vous droit",
		content: "Good posture shows professionalism and attentiveness.",
		contentFr: "Une bonne posture montre le professionnalisme et l'attention.",
		category: "body_language",
		tags: ["body-language", "posture", "professionalism"],
	},
	{
		id: "during-3",
		title: "Stay Calm Under Pressure",
		titleFr: "Restez calme sous pression",
		content: "Breathe before answering difficult questions. It's normal to take time to think.",
		contentFr: "Respirez avant de repondre aux questions difficiles. Il est normal de prendre le temps de reflechir.",
		category: "during",
		tags: ["calm", "pressure", "breathing"],
	},
];

// Seed data - Interview Common Questions
const SEED_INTERVIEW_QUESTIONS = [
	{
		id: "q-general-1",
		question: "Tell me about yourself.",
		questionFr: "Parlez-moi de vous.",
		type: "general",
		field: "general",
		sampleAnswer:
			"Start with your education, then mention relevant experience, and end with why you're interested in this role.",
		sampleAnswerFr:
			"Commencez par votre formation, puis mentionnez votre experience pertinente, et terminez par pourquoi ce poste vous interesse.",
		tips: ["Keep it professional", "Focus on relevant experience", "Be concise (2-3 minutes)"],
		tipsFr: ["Restez professionnel", "Concentrez-vous sur l'experience pertinente", "Soyez concis (2-3 minutes)"],
		difficulty: "beginner",
	},
	{
		id: "q-general-2",
		question: "What are your strengths and weaknesses?",
		questionFr: "Quelles sont vos forces et faiblesses?",
		type: "general",
		field: "general",
		sampleAnswer:
			"For strengths, give specific examples. For weaknesses, mention one and explain how you're working to improve it.",
		sampleAnswerFr:
			"Pour les forces, donnez des exemples precis. Pour les faiblesses, mentionnez-en une et expliquez comment vous travaillez a l'ameliorer.",
		tips: ["Be honest but strategic", "Turn weakness into a growth story", "Provide examples"],
		tipsFr: [
			"Soyez honnete mais strategique",
			"Transformez la faiblesse en histoire de progres",
			"Donnez des exemples",
		],
		difficulty: "intermediate",
	},
	{
		id: "q-behavioral-1",
		question: "Tell me about a time you worked in a team.",
		questionFr: "Parlez-moi d'une experience de travail en equipe.",
		type: "behavioral",
		field: "general",
		sampleAnswer: "Use the STAR method: Situation, Task, Action, Result.",
		sampleAnswerFr: "Utilisez la methode STAR: Situation, Tache, Action, Resultat.",
		tips: ["Use STAR method", "Focus on your contribution", "Highlight collaboration skills"],
		tipsFr: ["Utilisez la methode STAR", "Concentrez-vous sur votre contribution", "Mettez en avant la collaboration"],
		difficulty: "intermediate",
	},
	{
		id: "q-healthcare-1",
		question: "How would you handle a difficult patient?",
		questionFr: "Comment gerer un patient difficile?",
		type: "situational",
		field: "healthcare",
		sampleAnswer: "Show empathy, remain calm, listen to their concerns, and involve supervisors if needed.",
		sampleAnswerFr:
			"Montrez de l'empathie, restez calme, ecoutez leurs preoccupations et impliquez les superviseurs si necessaire.",
		tips: ["Emphasize empathy", "Show patience", "Know when to escalate"],
		tipsFr: ["Insistez sur l'empathie", "Montrez de la patience", "Sachez quand escalader"],
		difficulty: "intermediate",
	},
	{
		id: "q-industrial-1",
		question: "How do you ensure safety on a worksite?",
		questionFr: "Comment assurez-vous la securite sur un chantier?",
		type: "technical",
		field: "industrial",
		sampleAnswer: "Follow safety protocols, wear PPE, report hazards immediately, and maintain awareness.",
		sampleAnswerFr:
			"Suivez les protocoles de securite, portez les EPI, signalez les dangers immediatement et restez vigilant.",
		tips: ["Know safety regulations", "Give specific examples", "Emphasize prevention"],
		tipsFr: ["Connaissez les reglementations", "Donnez des exemples precis", "Insistez sur la prevention"],
		difficulty: "intermediate",
	},
	{
		id: "q-hse-1",
		question: "What would you do if you discovered a safety violation?",
		questionFr: "Que feriez-vous si vous decouvriez une violation de securite?",
		type: "situational",
		field: "hse",
		sampleAnswer:
			"Document it, report to supervisor, ensure immediate danger is addressed, and follow up on corrective actions.",
		sampleAnswerFr:
			"Documentez, signalez au superviseur, assurez-vous que le danger immediat est traite et suivez les actions correctives.",
		tips: ["Show procedural knowledge", "Emphasize documentation", "Balance urgency with protocol"],
		tipsFr: [
			"Montrez la connaissance des procedures",
			"Insistez sur la documentation",
			"Equilibrez urgence et protocole",
		],
		difficulty: "advanced",
	},
];

// Seed data - Market Insights
const SEED_MARKET_INSIGHTS = [
	{
		title: "Healthcare Demand",
		titleFr: "Demande en Sante",
		value: "15,000+",
		description: "Open healthcare positions in Morocco",
		descriptionFr: "Postes ouverts dans la sante au Maroc",
		icon: "HeartIcon",
		color: "text-red-500",
		field: "healthcare",
	},
	{
		title: "Industrial Growth",
		titleFr: "Croissance Industrielle",
		value: "+12%",
		description: "Year-over-year growth in industrial jobs",
		descriptionFr: "Croissance annuelle des emplois industriels",
		icon: "WrenchIcon",
		color: "text-blue-500",
		field: "industrial",
	},
	{
		title: "HSE Priority",
		titleFr: "Priorite HSE",
		value: "Top 5",
		description: "HSE among most in-demand roles",
		descriptionFr: "HSE parmi les roles les plus demandes",
		icon: "ShieldCheckIcon",
		color: "text-green-500",
		field: "hse",
	},
	{
		title: "Average Starting Salary",
		titleFr: "Salaire de Depart Moyen",
		value: "5,500 DH",
		description: "Average starting salary for IMTA graduates",
		descriptionFr: "Salaire de depart moyen des diplomes IMTA",
		icon: "TrendUpIcon",
		color: "text-purple-500",
	},
];

// Seed data - Employers
const SEED_EMPLOYERS = [
	{
		name: "OCP Group",
		sector: "Mining & Phosphates",
		sectorFr: "Mines & Phosphates",
		location: "Casablanca, Khouribga, Safi",
		locationFr: "Casablanca, Khouribga, Safi",
		openPositions: 500,
		website: "https://www.ocpgroup.ma",
		description: "World leader in phosphate production",
		descriptionFr: "Leader mondial de la production de phosphates",
		fields: ["industrial", "hse"],
	},
	{
		name: "CHU Ibn Sina",
		sector: "Healthcare",
		sectorFr: "Sante",
		location: "Rabat",
		locationFr: "Rabat",
		openPositions: 200,
		website: "https://www.chuibnrochd.ma",
		description: "Major university hospital in Morocco",
		descriptionFr: "Hopital universitaire majeur au Maroc",
		fields: ["healthcare"],
	},
	{
		name: "Renault Morocco",
		sector: "Automotive",
		sectorFr: "Automobile",
		location: "Tangier",
		locationFr: "Tanger",
		openPositions: 300,
		website: "https://www.renault.ma",
		description: "Major automotive manufacturing plant",
		descriptionFr: "Usine automobile majeure",
		fields: ["industrial", "hse"],
	},
];

// Seed data - Skills
const SEED_SKILLS = [
	{ name: "Patient Care", nameFr: "Soins aux Patients", field: "healthcare", category: "technical" },
	{ name: "Vital Signs Monitoring", nameFr: "Surveillance des Constantes", field: "healthcare", category: "technical" },
	{
		name: "Medication Administration",
		nameFr: "Administration des Medicaments",
		field: "healthcare",
		category: "technical",
	},
	{ name: "First Aid", nameFr: "Premiers Secours", field: "healthcare", category: "technical" },
	{ name: "Empathy", nameFr: "Empathie", field: "healthcare", category: "soft" },
	{ name: "Welding (MIG/TIG)", nameFr: "Soudure (MIG/TIG)", field: "industrial", category: "technical" },
	{ name: "Equipment Operation", nameFr: "Conduite d'Engins", field: "industrial", category: "technical" },
	{ name: "PLC Programming", nameFr: "Programmation Automates", field: "industrial", category: "technical" },
	{ name: "Blueprint Reading", nameFr: "Lecture de Plans", field: "industrial", category: "technical" },
	{ name: "Risk Assessment", nameFr: "Evaluation des Risques", field: "hse", category: "technical" },
	{ name: "Safety Audits", nameFr: "Audits de Securite", field: "hse", category: "technical" },
	{ name: "Emergency Response", nameFr: "Reponse d'Urgence", field: "hse", category: "technical" },
	{ name: "ISO Standards", nameFr: "Normes ISO", field: "hse", category: "certifications" },
	{ name: "French (B2+)", nameFr: "Francais (B2+)", field: "healthcare", category: "languages" },
	{ name: "Communication", nameFr: "Communication", field: "healthcare", category: "soft" },
	{ name: "Teamwork", nameFr: "Travail d'Equipe", field: "industrial", category: "soft" },
];

async function seedReferenceData() {
	console.log("🌱 Starting reference data seeding...\n");

	try {
		// Seed IMTA Programs
		console.log("📚 Seeding IMTA Programs...");
		const programs = await db.insert(schema.imtaProgram).values(SEED_IMTA_PROGRAMS).onConflictDoNothing().returning();
		console.log(`   ✅ Seeded ${programs.length} programs\n`);

		// Seed Interview Tips
		console.log("💡 Seeding Interview Tips...");
		const tips = await db.insert(schema.interviewTip).values(SEED_INTERVIEW_TIPS).onConflictDoNothing().returning();
		console.log(`   ✅ Seeded ${tips.length} tips\n`);

		// Seed Interview Questions
		console.log("❓ Seeding Interview Questions...");
		const questions = await db
			.insert(schema.interviewCommonQuestion)
			.values(SEED_INTERVIEW_QUESTIONS)
			.onConflictDoNothing()
			.returning();
		console.log(`   ✅ Seeded ${questions.length} questions\n`);

		// Seed Market Insights
		console.log("📊 Seeding Market Insights...");
		const insights = await db
			.insert(schema.careerMarketInsight)
			.values(SEED_MARKET_INSIGHTS)
			.onConflictDoNothing()
			.returning();
		console.log(`   ✅ Seeded ${insights.length} insights\n`);

		// Seed Employers
		console.log("🏢 Seeding Employers...");
		const employers = await db.insert(schema.careerEmployer).values(SEED_EMPLOYERS).onConflictDoNothing().returning();
		console.log(`   ✅ Seeded ${employers.length} employers\n`);

		// Seed Skills
		console.log("🎯 Seeding Skills Library...");
		const skills = await db.insert(schema.skillLibrary).values(SEED_SKILLS).onConflictDoNothing().returning();
		console.log(`   ✅ Seeded ${skills.length} skills\n`);

		console.log("✨ Reference data seeding complete!");
		console.log(`
Summary:
--------
Programs:  ${programs.length}
Tips:      ${tips.length}
Questions: ${questions.length}
Insights:  ${insights.length}
Employers: ${employers.length}
Skills:    ${skills.length}
`);
	} catch (error) {
		console.error("❌ Error seeding reference data:", error);
		process.exit(1);
	}

	process.exit(0);
}

seedReferenceData();
