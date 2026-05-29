/**
 * Seed Reference Data Tables via ORPC API
 * Seeds: imta_program, interview_tip, interview_common_question,
 *        career_market_insight, career_employer, skill_library
 *
 * Usage: node scripts/seed-reference-data.mjs
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";

// ============================================================================
// Seed Data
// ============================================================================

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
		description: "Support women through the most precious moments of their lives. A noble vocation with exceptional employment rates.",
		descriptionFr: "Accompagnez les femmes dans les moments les plus precieux de leur vie. Une vocation noble avec un taux d'emploi exceptionnel.",
		successRate: 98,
		avgSalary: 6000,
		employmentRate: 100,
		skills: ["Obstetrics", "Prenatal care", "Postnatal care", "Emergency childbirth", "Patient communication", "Medical monitoring"],
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
		description: "The pillar of hospital care. Excellent versatile training that opens doors to all healthcare facilities.",
		descriptionFr: "Le pilier des soins hospitaliers. Formation polyvalente d'excellence qui ouvre les portes de tous les etablissements de sante.",
		successRate: 97,
		avgSalary: 5500,
		employmentRate: 100,
		skills: ["Patient care", "Medication administration", "Vital signs monitoring", "Wound care", "IV therapy", "Emergency response"],
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
		description: "Accelerated training for rapid entry into the medical sector. Ideal for starting a career in healthcare.",
		descriptionFr: "Formation acceleree pour une insertion rapide dans le secteur medical. Ideal pour commencer une carriere dans la sante.",
		successRate: 95,
		avgSalary: 3500,
		employmentRate: 98,
		skills: ["Basic patient care", "Hygiene assistance", "Mobility support", "Vital signs", "Patient comfort", "Team collaboration"],
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
		description: "Become the safety guardian in strategic industries. An essential profession with attractive salaries.",
		descriptionFr: "Devenez le garant de la securite dans les industries strategiques. Un metier indispensable avec des salaires attractifs.",
		successRate: 96,
		avgSalary: 7000,
		employmentRate: 95,
		skills: ["Risk assessment", "Safety audits", "Emergency planning", "Regulatory compliance", "Training delivery", "Incident investigation"],
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
		description: "Master the power of heavy machinery on construction sites. Intensive practical training on real equipment.",
		descriptionFr: "Dominez la puissance des machines lourdes sur les chantiers. Formation pratique intensive sur engins reels.",
		successRate: 100,
		avgSalary: 8000,
		employmentRate: 92,
		skills: ["Excavator operation", "Loader operation", "Bulldozer operation", "Safety protocols", "Site navigation", "Equipment inspection"],
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
		descriptionFr: "Maitrisez les systemes electriques et mecaniques. Essentiel pour les industries automatisees modernes.",
		successRate: 93,
		avgSalary: 6000,
		employmentRate: 94,
		skills: ["Electrical systems", "Mechanical systems", "PLC programming", "Automation", "Troubleshooting", "Preventive maintenance"],
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
		descriptionFr: "Maitrisez les techniques de soudure pour le BTP et l'industrie. Competence tres demandee dans plusieurs secteurs.",
		successRate: 91,
		avgSalary: 5500,
		employmentRate: 92,
		skills: ["MIG welding", "TIG welding", "Arc welding", "Blueprint reading", "Metal preparation", "Quality inspection"],
		certifications: ["Welder Certificate", "AWS Certification"],
	},
	{
		id: "auxiliaire_puericulture",
		name: "Childcare Auxiliary",
		nameFr: "Auxiliaire de Puericulture",
		field: "healthcare",
		duration: "1 Year",
		durationFr: "1 An",
		requirements: "9th Grade (3eme AS)",
		requirementsFr: "3eme AS",
		description: "Specialize in pediatric care. Essential role in hospitals, clinics, and daycare centers.",
		descriptionFr: "Specialisez-vous dans les soins pediatriques. Role essentiel dans les hopitaux, cliniques et creches.",
		successRate: 94,
		avgSalary: 3500,
		employmentRate: 96,
		skills: ["Infant care", "Child development", "Nutrition", "Hygiene", "First aid", "Parent communication"],
		certifications: ["Childcare Auxiliary Certificate"],
	},
	{
		id: "technicien_anesthesie",
		name: "Anesthesia Technician",
		nameFr: "Technicien d'Anesthesie",
		field: "healthcare",
		duration: "3 Years",
		durationFr: "3 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Assist anesthesiologists in operating rooms. A critical, high-responsibility role in surgical care.",
		descriptionFr: "Assistez les anesthesistes en salle d'operation. Un role critique et a haute responsabilite dans les soins chirurgicaux.",
		successRate: 96,
		avgSalary: 7000,
		employmentRate: 99,
		skills: ["Anesthesia equipment", "Patient monitoring", "Drug preparation", "Sterile technique", "Emergency protocols", "Documentation"],
		certifications: ["Anesthesia Technician Diploma"],
	},
	{
		id: "technicien_laboratoire",
		name: "Laboratory Technician",
		nameFr: "Technicien de Laboratoire",
		field: "healthcare",
		duration: "3 Years",
		durationFr: "3 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Analyze biological samples to help diagnose diseases. A key role in modern medicine.",
		descriptionFr: "Analysez les echantillons biologiques pour aider au diagnostic. Un role cle dans la medecine moderne.",
		successRate: 95,
		avgSalary: 6000,
		employmentRate: 97,
		skills: ["Hematology", "Biochemistry", "Microbiology", "Sample handling", "Lab equipment", "Quality control"],
		certifications: ["Medical Laboratory Technician Diploma"],
	},
	{
		id: "maintenance_industrielle",
		name: "Industrial Maintenance Technician",
		nameFr: "Technicien de Maintenance Industrielle",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Keep industrial machines running. Preventive and corrective maintenance for all sectors.",
		descriptionFr: "Assurez le fonctionnement des machines industrielles. Maintenance preventive et corrective pour tous les secteurs.",
		successRate: 92,
		avgSalary: 6500,
		employmentRate: 93,
		skills: ["Mechanical repair", "Electrical diagnosis", "Hydraulics", "Pneumatics", "CMMS systems", "Spare parts management"],
		certifications: ["Industrial Maintenance Diploma"],
	},
	{
		id: "technicien_froid",
		name: "Refrigeration Technician",
		nameFr: "Technicien en Froid et Climatisation",
		field: "industrial",
		duration: "2 Years",
		durationFr: "2 Ans",
		requirements: "Baccalaureate Required",
		requirementsFr: "Bac Requis",
		description: "Install and maintain HVAC and refrigeration systems. Growing demand with climate change.",
		descriptionFr: "Installez et entretenez les systemes de froid et climatisation. Demande croissante avec le changement climatique.",
		successRate: 90,
		avgSalary: 5500,
		employmentRate: 91,
		skills: ["HVAC systems", "Refrigerant handling", "Electrical wiring", "Thermodynamics", "Brazing", "System diagnostics"],
		certifications: ["HVAC Technician Diploma", "Refrigerant Handling Certificate"],
	},
];

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
		id: "prep-3",
		title: "Practice Common Questions",
		titleFr: "Pratiquez les questions courantes",
		content: "Rehearse answers to common interview questions like 'Tell me about yourself' and 'Why this company?'",
		contentFr: "Repetez les reponses aux questions courantes comme 'Parlez-moi de vous' et 'Pourquoi cette entreprise?'",
		category: "preparation",
		tags: ["practice", "questions", "preparation"],
	},
	{
		id: "prep-4",
		title: "Plan Your Route",
		titleFr: "Planifiez votre trajet",
		content: "Know the interview location and plan to arrive 15 minutes early. Account for traffic and parking.",
		contentFr: "Connaissez le lieu de l'entretien et prevoyez d'arriver 15 minutes en avance. Tenez compte du trafic.",
		category: "preparation",
		tags: ["logistics", "punctuality", "preparation"],
	},
	{
		id: "prep-5",
		title: "Dress Professionally",
		titleFr: "Habillez-vous professionnellement",
		content: "Choose professional attire appropriate for the industry. When in doubt, dress more formally.",
		contentFr: "Choisissez une tenue professionnelle appropriee au secteur. En cas de doute, habillez-vous plus formellement.",
		category: "preparation",
		tags: ["appearance", "dress-code", "preparation"],
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
		content: "Support your answers with specific examples from your internships or studies at IMTA.",
		contentFr: "Appuyez vos reponses avec des exemples precis de vos stages ou etudes a l'IMTA.",
		category: "during",
		tags: ["examples", "STAR", "during"],
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
	{
		id: "during-4",
		title: "Ask Smart Questions",
		titleFr: "Posez des questions pertinentes",
		content: "Prepare 2-3 thoughtful questions about the role, team, or company culture.",
		contentFr: "Preparez 2-3 questions reflechies sur le poste, l'equipe ou la culture d'entreprise.",
		category: "during",
		tags: ["questions", "curiosity", "engagement"],
	},
	{
		id: "during-5",
		title: "Show Enthusiasm",
		titleFr: "Montrez votre enthousiasme",
		content: "Express genuine interest in the role and company. Enthusiasm is contagious and memorable.",
		contentFr: "Exprimez un interet sincere pour le poste et l'entreprise. L'enthousiasme est contagieux et memorable.",
		category: "during",
		tags: ["enthusiasm", "motivation", "engagement"],
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
		id: "after-2",
		title: "Reflect on the Interview",
		titleFr: "Analysez l'entretien",
		content: "Write down what went well and what could be improved for next time.",
		contentFr: "Notez ce qui s'est bien passe et ce qui pourrait etre ameliore la prochaine fois.",
		category: "after",
		tags: ["reflection", "improvement", "learning"],
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
		id: "body-3",
		title: "Firm Handshake",
		titleFr: "Poignee de main ferme",
		content: "Start and end with a confident handshake. Not too firm, not too weak.",
		contentFr: "Commencez et terminez avec une poignee de main confiante. Ni trop ferme, ni trop faible.",
		category: "body_language",
		tags: ["body-language", "greeting", "confidence"],
	},
	{
		id: "body-4",
		title: "Smile Naturally",
		titleFr: "Souriez naturellement",
		content: "A genuine smile makes you appear approachable and positive.",
		contentFr: "Un sourire sincere vous rend abordable et positif.",
		category: "body_language",
		tags: ["body-language", "smile", "approachability"],
	},
];

const SEED_INTERVIEW_QUESTIONS = [
	{
		id: "q-general-1",
		question: "Tell me about yourself.",
		questionFr: "Parlez-moi de vous.",
		type: "general",
		field: "general",
		sampleAnswer: "Start with your education, then mention relevant experience, and end with why you're interested in this role.",
		sampleAnswerFr: "Commencez par votre formation, puis mentionnez votre experience pertinente, et terminez par pourquoi ce poste vous interesse.",
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
		sampleAnswer: "For strengths, give specific examples. For weaknesses, mention one and explain how you're working to improve it.",
		sampleAnswerFr: "Pour les forces, donnez des exemples precis. Pour les faiblesses, mentionnez-en une et expliquez comment vous travaillez a l'ameliorer.",
		tips: ["Be honest but strategic", "Turn weakness into a growth story", "Provide examples"],
		tipsFr: ["Soyez honnete mais strategique", "Transformez la faiblesse en histoire de progres", "Donnez des exemples"],
		difficulty: "intermediate",
	},
	{
		id: "q-general-3",
		question: "Why do you want to work here?",
		questionFr: "Pourquoi voulez-vous travailler ici?",
		type: "general",
		field: "general",
		sampleAnswer: "Connect your skills and goals with the company's mission. Show you've done research.",
		sampleAnswerFr: "Reliez vos competences et objectifs a la mission de l'entreprise. Montrez que vous avez fait des recherches.",
		tips: ["Research the company", "Be specific", "Show alignment with values"],
		tipsFr: ["Renseignez-vous sur l'entreprise", "Soyez specifique", "Montrez l'alignement avec les valeurs"],
		difficulty: "beginner",
	},
	{
		id: "q-general-4",
		question: "Where do you see yourself in 5 years?",
		questionFr: "Ou vous voyez-vous dans 5 ans?",
		type: "general",
		field: "general",
		sampleAnswer: "Show ambition while being realistic. Mention growth within the company or field.",
		sampleAnswerFr: "Montrez de l'ambition tout en etant realiste. Mentionnez l'evolution au sein de l'entreprise ou du secteur.",
		tips: ["Be realistic", "Show commitment", "Align with company growth"],
		tipsFr: ["Soyez realiste", "Montrez votre engagement", "Alignez-vous sur la croissance de l'entreprise"],
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
		id: "q-behavioral-2",
		question: "Describe a challenge you overcame during your studies.",
		questionFr: "Decrivez un defi que vous avez surmonte pendant vos etudes.",
		type: "behavioral",
		field: "general",
		sampleAnswer: "Choose a genuine challenge, explain what you did, and emphasize what you learned.",
		sampleAnswerFr: "Choisissez un veritable defi, expliquez ce que vous avez fait et soulignez ce que vous avez appris.",
		tips: ["Be specific", "Show problem-solving", "Emphasize learning"],
		tipsFr: ["Soyez specifique", "Montrez la resolution de problemes", "Soulignez l'apprentissage"],
		difficulty: "intermediate",
	},
	{
		id: "q-behavioral-3",
		question: "How do you handle conflict with a colleague?",
		questionFr: "Comment gerez-vous un conflit avec un collegue?",
		type: "behavioral",
		field: "general",
		sampleAnswer: "Focus on communication, understanding the other perspective, and finding a solution together.",
		sampleAnswerFr: "Concentrez-vous sur la communication, la comprehension de l'autre perspective et la recherche d'une solution ensemble.",
		tips: ["Stay professional", "Show empathy", "Focus on resolution"],
		tipsFr: ["Restez professionnel", "Montrez de l'empathie", "Concentrez-vous sur la resolution"],
		difficulty: "advanced",
	},
	{
		id: "q-healthcare-1",
		question: "How would you handle a difficult patient?",
		questionFr: "Comment gerer un patient difficile?",
		type: "situational",
		field: "healthcare",
		sampleAnswer: "Show empathy, remain calm, listen to their concerns, and involve supervisors if needed.",
		sampleAnswerFr: "Montrez de l'empathie, restez calme, ecoutez leurs preoccupations et impliquez les superviseurs si necessaire.",
		tips: ["Emphasize empathy", "Show patience", "Know when to escalate"],
		tipsFr: ["Insistez sur l'empathie", "Montrez de la patience", "Sachez quand escalader"],
		difficulty: "intermediate",
	},
	{
		id: "q-healthcare-2",
		question: "What would you do if you made a medication error?",
		questionFr: "Que feriez-vous en cas d'erreur de medicament?",
		type: "situational",
		field: "healthcare",
		sampleAnswer: "Report immediately, assess patient impact, follow protocols, and document everything.",
		sampleAnswerFr: "Signalez immediatement, evaluez l'impact patient, suivez les protocoles et documentez tout.",
		tips: ["Honesty is critical", "Patient safety first", "Show accountability"],
		tipsFr: ["L'honnetete est cruciale", "Securite du patient d'abord", "Montrez la responsabilite"],
		difficulty: "advanced",
	},
	{
		id: "q-healthcare-3",
		question: "How do you prioritize when you have multiple patients needing attention?",
		questionFr: "Comment priorisez-vous quand plusieurs patients ont besoin d'attention?",
		type: "situational",
		field: "healthcare",
		sampleAnswer: "Triage based on severity, communicate with team, delegate when possible, document decisions.",
		sampleAnswerFr: "Triez par gravite, communiquez avec l'equipe, deleguez si possible, documentez les decisions.",
		tips: ["Know triage principles", "Show systematic thinking", "Emphasize teamwork"],
		tipsFr: ["Connaissez les principes de triage", "Montrez la pensee systematique", "Soulignez le travail d'equipe"],
		difficulty: "advanced",
	},
	{
		id: "q-industrial-1",
		question: "How do you ensure safety on a worksite?",
		questionFr: "Comment assurez-vous la securite sur un chantier?",
		type: "technical",
		field: "industrial",
		sampleAnswer: "Follow safety protocols, wear PPE, report hazards immediately, and maintain awareness.",
		sampleAnswerFr: "Suivez les protocoles de securite, portez les EPI, signalez les dangers immediatement et restez vigilant.",
		tips: ["Know safety regulations", "Give specific examples", "Emphasize prevention"],
		tipsFr: ["Connaissez les reglementations", "Donnez des exemples precis", "Insistez sur la prevention"],
		difficulty: "intermediate",
	},
	{
		id: "q-industrial-2",
		question: "What steps do you take before operating heavy equipment?",
		questionFr: "Quelles etapes suivez-vous avant d'utiliser un engin lourd?",
		type: "technical",
		field: "industrial",
		sampleAnswer: "Pre-operation inspection, check fluid levels, test controls, verify area is clear, confirm signals.",
		sampleAnswerFr: "Inspection pre-operation, verifier les niveaux, tester les commandes, verifier la zone, confirmer les signaux.",
		tips: ["Be thorough", "Show safety awareness", "Mention documentation"],
		tipsFr: ["Soyez minutieux", "Montrez la conscience securitaire", "Mentionnez la documentation"],
		difficulty: "intermediate",
	},
	{
		id: "q-hse-1",
		question: "What would you do if you discovered a safety violation?",
		questionFr: "Que feriez-vous si vous decouvriez une violation de securite?",
		type: "situational",
		field: "hse",
		sampleAnswer: "Document it, report to supervisor, ensure immediate danger is addressed, and follow up on corrective actions.",
		sampleAnswerFr: "Documentez, signalez au superviseur, assurez-vous que le danger immediat est traite et suivez les actions correctives.",
		tips: ["Show procedural knowledge", "Emphasize documentation", "Balance urgency with protocol"],
		tipsFr: ["Montrez la connaissance des procedures", "Insistez sur la documentation", "Equilibrez urgence et protocole"],
		difficulty: "advanced",
	},
	{
		id: "q-hse-2",
		question: "How would you conduct a risk assessment for a new process?",
		questionFr: "Comment realiseriez-vous une evaluation des risques pour un nouveau processus?",
		type: "technical",
		field: "hse",
		sampleAnswer: "Identify hazards, assess probability and severity, implement controls, document findings, review regularly.",
		sampleAnswerFr: "Identifiez les dangers, evaluez probabilite et gravite, mettez en place des controles, documentez, revisez regulierement.",
		tips: ["Know risk matrices", "Mention ISO standards", "Show systematic approach"],
		tipsFr: ["Connaissez les matrices de risque", "Mentionnez les normes ISO", "Montrez l'approche systematique"],
		difficulty: "advanced",
	},
];

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
	{
		title: "Employment Rate",
		titleFr: "Taux d'Emploi",
		value: "94%",
		description: "IMTA graduate employment rate within 6 months",
		descriptionFr: "Taux d'emploi des diplomes IMTA dans les 6 mois",
		icon: "CheckCircleIcon",
		color: "text-emerald-500",
	},
	{
		title: "Internship Conversion",
		titleFr: "Conversion de Stage",
		value: "67%",
		description: "Internships converted to full-time positions",
		descriptionFr: "Stages convertis en postes a temps plein",
		icon: "ArrowUpIcon",
		color: "text-amber-500",
	},
];

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
	{
		name: "ONEE",
		sector: "Energy & Water",
		sectorFr: "Energie & Eau",
		location: "Rabat, Multiple Cities",
		locationFr: "Rabat, Plusieurs Villes",
		openPositions: 150,
		website: "https://www.one.org.ma",
		description: "National office for electricity and drinking water",
		descriptionFr: "Office national de l'electricite et de l'eau potable",
		fields: ["industrial", "hse"],
	},
	{
		name: "CHU Mohammed VI",
		sector: "Healthcare",
		sectorFr: "Sante",
		location: "Marrakech",
		locationFr: "Marrakech",
		openPositions: 250,
		website: "https://www.chu-marrakech.ma",
		description: "Regional university hospital center",
		descriptionFr: "Centre hospitalier universitaire regional",
		fields: ["healthcare"],
	},
	{
		name: "Managem Group",
		sector: "Mining",
		sectorFr: "Mines",
		location: "Casablanca, Guelmim",
		locationFr: "Casablanca, Guelmim",
		openPositions: 100,
		website: "https://www.managemgroup.com",
		description: "Major mining group in precious metals and cobalt",
		descriptionFr: "Groupe minier majeur dans les metaux precieux et le cobalt",
		fields: ["industrial", "hse"],
	},
	{
		name: "SOTHEMA",
		sector: "Pharmaceutical",
		sectorFr: "Pharmaceutique",
		location: "Casablanca",
		locationFr: "Casablanca",
		openPositions: 80,
		website: "https://www.sothema.com",
		description: "Leading Moroccan pharmaceutical laboratory",
		descriptionFr: "Leader marocain de l'industrie pharmaceutique",
		fields: ["healthcare", "industrial"],
	},
	{
		name: "Lydec",
		sector: "Utilities",
		sectorFr: "Services Publics",
		location: "Casablanca",
		locationFr: "Casablanca",
		openPositions: 60,
		website: "https://www.lydec.ma",
		description: "Water, electricity, and sanitation services",
		descriptionFr: "Services d'eau, d'electricite et d'assainissement",
		fields: ["industrial", "hse"],
	},
];

const SEED_SKILLS = [
	{ name: "Patient Care", nameFr: "Soins aux Patients", field: "healthcare", category: "technical" },
	{ name: "Vital Signs Monitoring", nameFr: "Surveillance des Constantes", field: "healthcare", category: "technical" },
	{ name: "Medication Administration", nameFr: "Administration des Medicaments", field: "healthcare", category: "technical" },
	{ name: "First Aid", nameFr: "Premiers Secours", field: "healthcare", category: "technical" },
	{ name: "Wound Care", nameFr: "Soins des Plaies", field: "healthcare", category: "technical" },
	{ name: "IV Therapy", nameFr: "Therapie IV", field: "healthcare", category: "technical" },
	{ name: "Medical Documentation", nameFr: "Documentation Medicale", field: "healthcare", category: "technical" },
	{ name: "Infection Control", nameFr: "Controle des Infections", field: "healthcare", category: "technical" },
	{ name: "Empathy", nameFr: "Empathie", field: "healthcare", category: "soft" },
	{ name: "Communication", nameFr: "Communication", field: "healthcare", category: "soft" },
	{ name: "Stress Management", nameFr: "Gestion du Stress", field: "healthcare", category: "soft" },
	{ name: "Teamwork", nameFr: "Travail d'Equipe", field: "healthcare", category: "soft" },
	{ name: "French (B2+)", nameFr: "Francais (B2+)", field: "healthcare", category: "languages" },
	{ name: "Arabic", nameFr: "Arabe", field: "healthcare", category: "languages" },
	{ name: "Welding (MIG/TIG)", nameFr: "Soudure (MIG/TIG)", field: "industrial", category: "technical" },
	{ name: "Equipment Operation", nameFr: "Conduite d'Engins", field: "industrial", category: "technical" },
	{ name: "PLC Programming", nameFr: "Programmation Automates", field: "industrial", category: "technical" },
	{ name: "Blueprint Reading", nameFr: "Lecture de Plans", field: "industrial", category: "technical" },
	{ name: "Hydraulic Systems", nameFr: "Systemes Hydrauliques", field: "industrial", category: "technical" },
	{ name: "Electrical Diagnosis", nameFr: "Diagnostic Electrique", field: "industrial", category: "technical" },
	{ name: "CNC Operation", nameFr: "Usinage CNC", field: "industrial", category: "technical" },
	{ name: "Preventive Maintenance", nameFr: "Maintenance Preventive", field: "industrial", category: "technical" },
	{ name: "Teamwork", nameFr: "Travail d'Equipe", field: "industrial", category: "soft" },
	{ name: "Problem Solving", nameFr: "Resolution de Problemes", field: "industrial", category: "soft" },
	{ name: "Attention to Detail", nameFr: "Attention aux Details", field: "industrial", category: "soft" },
	{ name: "Risk Assessment", nameFr: "Evaluation des Risques", field: "hse", category: "technical" },
	{ name: "Safety Audits", nameFr: "Audits de Securite", field: "hse", category: "technical" },
	{ name: "Emergency Response", nameFr: "Reponse d'Urgence", field: "hse", category: "technical" },
	{ name: "Environmental Monitoring", nameFr: "Surveillance Environnementale", field: "hse", category: "technical" },
	{ name: "Regulatory Compliance", nameFr: "Conformite Reglementaire", field: "hse", category: "technical" },
	{ name: "Incident Investigation", nameFr: "Enquete d'Incidents", field: "hse", category: "technical" },
	{ name: "Training Delivery", nameFr: "Formation", field: "hse", category: "technical" },
	{ name: "ISO Standards", nameFr: "Normes ISO", field: "hse", category: "certifications" },
	{ name: "OHSAS 18001", nameFr: "OHSAS 18001", field: "hse", category: "certifications" },
	{ name: "ISO 14001", nameFr: "ISO 14001", field: "hse", category: "certifications" },
	{ name: "Leadership", nameFr: "Leadership", field: "hse", category: "soft" },
	{ name: "Communication", nameFr: "Communication", field: "hse", category: "soft" },
	{ name: "Critical Thinking", nameFr: "Pensee Critique", field: "hse", category: "soft" },
];

// ============================================================================
// ORPC API Helper
// ============================================================================

let sessionCookie = "";

async function login(email, password) {
	const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Origin: BASE_URL },
		body: JSON.stringify({ email, password }),
	});
	const cookies = res.headers.getSetCookie?.() || [];
	sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");
	return res.ok;
}

async function rpc(path, input) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify(envelope),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

// ============================================================================
// Main
// ============================================================================

async function main() {
	console.log("=== Reference Data Seeder ===\n");

	// Step 1: Login as admin
	console.log("1. Logging in as admin...");
	const ok = await login("admin@test.com", "TestAccount123!");
	if (!ok) {
		console.error("   FAILED to login as admin!");
		process.exit(1);
	}
	console.log("   OK - Logged in as admin\n");

	// Step 2: Seed each table
	const seeds = [
		{ name: "IMTA Programs", path: "seed/imtaPrograms", data: SEED_IMTA_PROGRAMS },
		{ name: "Interview Tips", path: "seed/interviewTips", data: SEED_INTERVIEW_TIPS },
		{ name: "Interview Questions", path: "seed/interviewQuestions", data: SEED_INTERVIEW_QUESTIONS },
		{ name: "Market Insights", path: "seed/marketInsights", data: SEED_MARKET_INSIGHTS },
		{ name: "Employers", path: "seed/employers", data: SEED_EMPLOYERS },
		{ name: "Skills Library", path: "seed/skills", data: SEED_SKILLS },
	];

	let passed = 0;
	let failed = 0;

	for (const { name, path, data } of seeds) {
		process.stdout.write(`2. Seeding ${name} (${data.length} rows)... `);
		try {
			const res = await rpc(path, data);
			if (res.ok) {
				console.log(`OK (${res.status})`);
				passed++;
			} else {
				console.log(`FAILED (${res.status})`);
				console.log(`   Response: ${res.text.substring(0, 300)}`);
				failed++;
			}
		} catch (err) {
			console.log(`ERROR: ${err.message}`);
			failed++;
		}
	}

	// Step 3: Verify data
	console.log("\n3. Verifying seeded data...");
	const verifications = [
		{ name: "Programs", path: "imtaPrograms/list" },
		{ name: "Tips", path: "interviewTips/list" },
		{ name: "Questions", path: "interviewQuestions/list" },
		{ name: "Insights", path: "marketInsights/list" },
		{ name: "Employers", path: "employers/list" },
		{ name: "Skills", path: "skillLibrary/list" },
	];

	for (const { name, path } of verifications) {
		const res = await rpc(path, {});
		const count = Array.isArray(res.json) ? res.json.length : "?";
		console.log(`   ${name}: ${count} rows`);
	}

	console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
}

main().catch(console.error);
