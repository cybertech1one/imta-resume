import { and, asc, eq } from "drizzle-orm";
import { db } from "@/integrations/drizzle/client";
import { type InterviewChecklistCategory, interviewChecklistReference } from "@/integrations/drizzle/schema";

// Type exports for use in routers
export type InterviewChecklistItem = typeof interviewChecklistReference.$inferSelect;
export type InterviewChecklistInsert = typeof interviewChecklistReference.$inferInsert;

// Seed data for pre-interview checklist
const preInterviewSeedData = [
	{
		id: "pre-1",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Research the company",
		titleFr: "Rechercher l'entreprise",
		description: "Learn about the company mission, values, news and culture",
		descriptionFr: "Renseignez-vous sur la mission, les valeurs, l'actualite et la culture de l'entreprise.",
		tip: "Visit the company website, check their social media (LinkedIn, Facebook), look for recent press articles, note 2-3 specific questions to ask about the company",
		tipFr:
			"Visitez le site officiel de l'entreprise, consultez leurs reseaux sociaux (LinkedIn, Facebook), recherchez des articles de presse recents, notez 2-3 questions specifiques a poser sur l'entreprise",
		icon: "BookOpenIcon",
		sortOrder: 1,
		isActive: true,
	},
	{
		id: "pre-2",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Review the job posting",
		titleFr: "Relire l'offre d'emploi",
		description: "Carefully analyze the required skills and qualifications",
		descriptionFr: "Analysez attentivement les competences et qualifications demandees.",
		tip: "Highlight important keywords, prepare examples for each required skill, identify how your experience matches the position",
		tipFr:
			"Soulignez les mots-cles importants, preparez des exemples pour chaque competence requise, identifiez comment votre experience correspond au poste",
		icon: "NotePencilIcon",
		sortOrder: 2,
		isActive: true,
	},
	{
		id: "pre-3",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Prepare your CV",
		titleFr: "Preparer votre CV",
		description: "Make sure your CV is up to date and tailored for the position",
		descriptionFr: "Assurez-vous que votre CV est a jour et adapte au poste.",
		tip: "Print multiple copies of your CV, check for spelling errors, adapt it if necessary for the targeted position",
		tipFr:
			"Imprimez plusieurs copies de votre CV, verifiez qu'il n'y a pas de fautes d'orthographe, adaptez-le si necessaire au poste vise",
		link: "/dashboard/resumes",
		linkLabel: "Create a CV",
		icon: "ListChecksIcon",
		sortOrder: 3,
		isActive: true,
	},
	{
		id: "pre-4",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Prepare questions to ask",
		titleFr: "Preparer des questions a poser",
		description: "Have a list of intelligent questions to ask the recruiter",
		descriptionFr: "Ayez une liste de questions intelligentes a poser au recruteur.",
		tip: "'How does a typical day look like?', 'What are the current team challenges?', 'What qualities are you looking for?', 'What are the growth opportunities?'",
		tipFr:
			"'Comment se deroule une journee typique?', 'Quels sont les defis actuels de l'equipe?', 'Quelles qualites recherchez-vous?', 'Quelles sont les opportunites d'evolution?'",
		link: "/dashboard/interview/questions",
		linkLabel: "See common questions",
		icon: "QuestionIcon",
		sortOrder: 4,
		isActive: true,
	},
	{
		id: "pre-5",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Choose your outfit",
		titleFr: "Choisir votre tenue",
		description: "Select a professional and appropriate outfit",
		descriptionFr: "Selectionnez une tenue professionnelle et appropriee.",
		tip: "Choose clean and pressed clothes, adapt your outfit to the sector (healthcare, industry, etc.), avoid strong perfumes and excessive jewelry, prepare your outfit the day before",
		tipFr:
			"Choisissez des vetements propres et repasses, adaptez votre tenue au secteur (sante, industrie, etc.), evitez les parfums forts et les bijoux excessifs, preparez votre tenue la veille",
		icon: "TShirtIcon",
		sortOrder: 5,
		isActive: true,
	},
	{
		id: "pre-6",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Verify route and time",
		titleFr: "Verifier le trajet et l'heure",
		description: "Plan your itinerary to arrive on time",
		descriptionFr: "Planifiez votre itineraire pour arriver a temps.",
		tip: "Verify the exact address of the interview location, test the route in advance if possible, plan extra time for unexpected events, note your contact's name",
		tipFr:
			"Verifiez l'adresse exacte du lieu d'entretien, testez le trajet a l'avance si possible, prevoyez un temps supplementaire pour les imprevus, notez le nom de votre contact",
		icon: "ClockIcon",
		sortOrder: 6,
		isActive: true,
	},
	{
		id: "pre-7",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Prepare your documents",
		titleFr: "Preparer vos documents",
		description: "Gather all necessary documents in a folder",
		descriptionFr: "Rassemblez tous les documents necessaires dans une pochette.",
		tip: "CV (multiple copies), cover letter, diplomas and certificates, ID, internship certificates",
		tipFr:
			"CV (plusieurs copies), lettre de motivation, diplomes et attestations, piece d'identite, certificats de stage",
		icon: "NotePencilIcon",
		sortOrder: 7,
		isActive: true,
	},
	{
		id: "pre-8",
		category: "pre_interview" as InterviewChecklistCategory,
		title: "Practice common questions",
		titleFr: "S'entrainer aux questions courantes",
		description: "Practice your answers to common interview questions",
		descriptionFr: "Pratiquez vos reponses aux questions frequentes d'entretien.",
		tip: "Use the STAR method (Situation, Task, Action, Result), prepare your personal presentation (2-3 minutes), practice out loud",
		tipFr:
			"Utilisez la methode STAR (Situation, Tache, Action, Resultat), preparez votre presentation personnelle (2-3 minutes), entrainez-vous a voix haute",
		link: "/dashboard/interview/chatbot",
		linkLabel: "Practice with AI",
		icon: "UserIcon",
		sortOrder: 8,
		isActive: true,
	},
];

// Seed data for day-of checklist
const dayOfSeedData = [
	{
		id: "day-1",
		category: "day_of" as InterviewChecklistCategory,
		title: "Wake up early and prepare",
		titleFr: "Se reveiller tot et se preparer",
		description: "Give yourself enough time to prepare calmly",
		descriptionFr: "Donnez-vous suffisamment de temps pour vous preparer calmement.",
		tip: "Set your alarm with a safety margin, take a shower and take care of your appearance, dress with the prepared outfit",
		tipFr:
			"Reglez votre reveil avec une marge de securite, prenez une douche et soignez votre apparence, habillez-vous avec la tenue preparee",
		icon: "SunIcon",
		sortOrder: 1,
		isActive: true,
	},
	{
		id: "day-2",
		category: "day_of" as InterviewChecklistCategory,
		title: "Have a balanced breakfast",
		titleFr: "Prendre un petit-dejeuner equilibre",
		description: "Eat well to have the necessary energy",
		descriptionFr: "Mangez bien pour avoir l'energie necessaire.",
		tip: "Avoid heavy foods, hydrate well, avoid excess caffeine",
		tipFr: "Evitez les aliments trop lourds, hydratez-vous bien, evitez l'exces de cafeine",
		icon: "SparkleIcon",
		sortOrder: 2,
		isActive: true,
	},
	{
		id: "day-3",
		category: "day_of" as InterviewChecklistCategory,
		title: "Check all documents",
		titleFr: "Verifier tous les documents",
		description: "Make sure you have all your documents ready",
		descriptionFr: "Assurez-vous d'avoir tous vos documents prets.",
		tip: "Check that you have everything in your folder, don't forget your phone (for emergencies), have something to write with",
		tipFr:
			"Verifiez que vous avez tout dans votre pochette, n'oubliez pas votre telephone (pour les urgences), ayez de quoi ecrire",
		icon: "ListChecksIcon",
		sortOrder: 3,
		isActive: true,
	},
	{
		id: "day-4",
		category: "day_of" as InterviewChecklistCategory,
		title: "Arrive 15 minutes early",
		titleFr: "Arriver 15 minutes en avance",
		description: "Arrive early to settle in and calm down",
		descriptionFr: "Arrivez tot pour vous installer et vous calmer.",
		tip: "Use this time to relax, review your notes one last time, observe the company environment",
		tipFr:
			"Utilisez ce temps pour vous detendre, relisez vos notes une derniere fois, observez l'environnement de l'entreprise",
		icon: "ClockIcon",
		sortOrder: 4,
		isActive: true,
	},
	{
		id: "day-5",
		category: "day_of" as InterviewChecklistCategory,
		title: "Turn off your phone",
		titleFr: "Eteindre le telephone",
		description: "Put your phone on silent mode or turn it off",
		descriptionFr: "Mettez votre telephone en mode silencieux ou eteignez-le.",
		tip: "Avoid any distraction during the interview, show respect to the recruiter",
		tipFr: "Evitez toute distraction pendant l'entretien, montrez du respect envers le recruteur",
		icon: "MoonIcon",
		sortOrder: 5,
		isActive: true,
	},
	{
		id: "day-6",
		category: "day_of" as InterviewChecklistCategory,
		title: "Breathe and relax",
		titleFr: "Respirer et se detendre",
		description: "Take a few moments to calm down before the interview",
		descriptionFr: "Prenez quelques instants pour vous calmer avant l'entretien.",
		tip: "Take some deep breaths, think positively, smile - it helps to feel confident, remember: you are prepared!",
		tipFr:
			"Faites quelques respirations profondes, pensez positivement, souriez - ca aide a se sentir confiant, rappelez-vous: vous etes prepare!",
		icon: "LightbulbIcon",
		sortOrder: 6,
		isActive: true,
	},
];

export const interviewChecklistService = {
	// List checklist items by category
	list: async (options?: { category?: InterviewChecklistCategory; activeOnly?: boolean }) => {
		const conditions = [];
		if (options?.activeOnly !== false) {
			conditions.push(eq(interviewChecklistReference.isActive, true));
		}
		if (options?.category) {
			conditions.push(eq(interviewChecklistReference.category, options.category));
		}

		return db
			.select()
			.from(interviewChecklistReference)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(asc(interviewChecklistReference.category), asc(interviewChecklistReference.sortOrder));
	},

	// Get a single checklist item by ID
	getById: async (id: string) => {
		const [item] = await db.select().from(interviewChecklistReference).where(eq(interviewChecklistReference.id, id));
		return item;
	},

	// Create a new checklist item
	create: async (data: typeof interviewChecklistReference.$inferInsert) => {
		const [item] = await db.insert(interviewChecklistReference).values(data).returning();
		return item;
	},

	// Update a checklist item
	update: async (
		id: string,
		data: Partial<Omit<typeof interviewChecklistReference.$inferInsert, "id" | "createdAt">>,
	) => {
		const [item] = await db
			.update(interviewChecklistReference)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(interviewChecklistReference.id, id))
			.returning();
		return item;
	},

	// Delete a checklist item
	delete: async (id: string) => {
		await db.delete(interviewChecklistReference).where(eq(interviewChecklistReference.id, id));
	},

	// Get distinct categories
	getCategories: async () => {
		const result = await db
			.selectDistinct({ category: interviewChecklistReference.category })
			.from(interviewChecklistReference)
			.where(eq(interviewChecklistReference.isActive, true));
		return result.map((r) => r.category);
	},

	// Seed initial data
	seed: async () => {
		const allSeedData = [...preInterviewSeedData, ...dayOfSeedData];

		// Use upsert to avoid conflicts
		const results = [];
		for (const item of allSeedData) {
			const [result] = await db.insert(interviewChecklistReference).values(item).onConflictDoNothing().returning();
			if (result) {
				results.push(result);
			}
		}

		return results;
	},

	// Bulk seed (for admin)
	bulkSeed: async (items: (typeof interviewChecklistReference.$inferInsert)[]) => {
		if (items.length === 0) return [];
		return db.insert(interviewChecklistReference).values(items).onConflictDoNothing().returning();
	},
};
