/**
 * seed-questions-300.mjs
 *
 * Seeds 300+ interview questions into the interview_common_question table.
 * Questions are bilingual (English + French), field-specific with real
 * technologies, and designed for Moroccan/IMTA graduates entering the job market.
 *
 * Table: interview_common_question
 * Columns: id (text PK), question, question_fr, type, field, sample_answer,
 *          sample_answer_fr, tips (jsonb), tips_fr (jsonb), difficulty,
 *          is_active, sort_order, created_at, updated_at
 *
 * Usage:  node scripts/seed-questions-300.mjs
 */

import pg from "pg";

const DATABASE_URL =
	process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;
function qid(prefix) {
	idCounter++;
	return `${prefix}-${String(idCounter).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Questions Data — 300+ bilingual questions for Moroccan job market
// ---------------------------------------------------------------------------

const QUESTIONS = [
	// =========================================================================
	// GENERAL (30+ questions — applicable to all fields)
	// =========================================================================

	// --- behavioral ---
	{
		id: qid("gen"),
		question: "Tell me about yourself.",
		questionFr: "Parlez-moi de vous.",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I am a recent graduate from IMTA with a degree in [field]. During my studies, I completed an internship at [company] where I developed skills in [skill]. I am passionate about [domain] and eager to contribute to a dynamic team. I am particularly drawn to your company because of [specific reason].",
		sampleAnswerFr:
			"Je suis un jeune diplômé de l'IMTA en [filière]. Pendant mes études, j'ai effectué un stage chez [entreprise] où j'ai développé des compétences en [compétence]. Je suis passionné par [domaine] et désireux de contribuer à une équipe dynamique. Votre entreprise m'attire particulièrement parce que [raison spécifique].",
		tips: [
			"Keep it under 2 minutes — focus on education, key experience, and career goal",
			"Tailor your answer to the specific position and company",
			"End with why you are interested in this role",
		],
		tipsFr: [
			"Restez en dessous de 2 minutes — concentrez-vous sur la formation, l'expérience clé et l'objectif de carrière",
			"Adaptez votre réponse au poste et à l'entreprise spécifique",
			"Terminez par la raison de votre intérêt pour ce poste",
		],
	},
	{
		id: qid("gen"),
		question: "What are your greatest strengths?",
		questionFr: "Quels sont vos principaux points forts ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"My greatest strengths are my analytical thinking and my ability to work collaboratively. At IMTA, I led a team project where we had to analyze complex data sets under tight deadlines. I naturally organized the team's workflow, which resulted in us finishing ahead of schedule with the highest grade in our cohort.",
		sampleAnswerFr:
			"Mes principaux points forts sont ma pensée analytique et ma capacité à travailler en équipe. À l'IMTA, j'ai dirigé un projet d'équipe où nous devions analyser des jeux de données complexes dans des délais serrés. J'ai naturellement organisé le flux de travail de l'équipe, ce qui nous a permis de terminer en avance avec la meilleure note de notre promotion.",
		tips: [
			"Choose strengths directly relevant to the job description",
			"Back each strength with a concrete example from your experience",
			"Avoid generic answers like 'I am a hard worker' — be specific",
		],
		tipsFr: [
			"Choisissez des points forts directement pertinents pour la fiche de poste",
			"Appuyez chaque point fort par un exemple concret de votre expérience",
			"Évitez les réponses génériques comme 'je suis travailleur' — soyez précis",
		],
	},
	{
		id: qid("gen"),
		question: "What is your biggest weakness?",
		questionFr: "Quelle est votre plus grande faiblesse ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I tend to be overly detail-oriented, which sometimes means I spend more time than necessary on certain tasks. I have learned to manage this by setting time limits for each task and using project management tools to keep track of priorities. This approach has helped me balance quality with efficiency.",
		sampleAnswerFr:
			"J'ai tendance à être trop attentif aux détails, ce qui signifie parfois que je passe plus de temps que nécessaire sur certaines tâches. J'ai appris à gérer cela en fixant des limites de temps pour chaque tâche et en utilisant des outils de gestion de projet pour suivre les priorités. Cette approche m'a aidé à équilibrer qualité et efficacité.",
		tips: [
			"Choose a real weakness, not a disguised strength",
			"Always explain how you are actively working to improve it",
			"Never say 'I am a perfectionist' — it sounds rehearsed",
		],
		tipsFr: [
			"Choisissez une vraie faiblesse, pas un point fort déguisé",
			"Expliquez toujours comment vous travaillez activement à l'améliorer",
			"Ne dites jamais 'je suis perfectionniste' — cela sonne comme répété",
		],
	},
	{
		id: qid("gen"),
		question: "Why do you want to work for our company?",
		questionFr: "Pourquoi voulez-vous travailler dans notre entreprise ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I have been following your company's growth in the Moroccan market, particularly your recent expansion into renewable energy projects. Your commitment to innovation aligns with my career goals. As an IMTA graduate, I believe my technical training combined with your company's reputation for developing young talent makes this an ideal match.",
		sampleAnswerFr:
			"Je suis l'évolution de votre entreprise sur le marché marocain, notamment votre récente expansion dans les projets d'énergie renouvelable. Votre engagement envers l'innovation s'aligne avec mes objectifs de carrière. En tant que diplômé de l'IMTA, je crois que ma formation technique combinée à la réputation de votre entreprise pour le développement des jeunes talents en fait un match idéal.",
		tips: [
			"Research the company thoroughly — mention specific projects, values, or recent news",
			"Connect the company's mission to your personal career goals",
			"Avoid saying 'because you are a big company' — show genuine interest",
		],
		tipsFr: [
			"Faites des recherches approfondies sur l'entreprise — mentionnez des projets, valeurs ou actualités spécifiques",
			"Reliez la mission de l'entreprise à vos objectifs de carrière personnels",
			"Évitez de dire 'parce que vous êtes une grande entreprise' — montrez un intérêt sincère",
		],
	},
	{
		id: qid("gen"),
		question: "Where do you see yourself in 5 years?",
		questionFr: "Où vous voyez-vous dans 5 ans ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"In five years, I see myself having grown into a senior role within the company, taking on more responsibilities and perhaps leading a small team. I want to develop deep expertise in my field while also building management skills. I am committed to long-term growth and contributing to the company's success in Morocco and beyond.",
		sampleAnswerFr:
			"Dans cinq ans, je me vois avoir évolué vers un poste senior au sein de l'entreprise, assumant plus de responsabilités et peut-être dirigeant une petite équipe. Je veux développer une expertise approfondie dans mon domaine tout en acquérant des compétences en management. Je suis engagé dans une croissance à long terme et à contribuer au succès de l'entreprise au Maroc et au-delà.",
		tips: [
			"Show ambition but remain realistic — align with the company's growth trajectory",
			"Demonstrate loyalty and commitment to the company",
			"Mention specific skills or roles you want to develop",
		],
		tipsFr: [
			"Montrez de l'ambition mais restez réaliste — alignez-vous avec la trajectoire de croissance de l'entreprise",
			"Démontrez votre loyauté et votre engagement envers l'entreprise",
			"Mentionnez des compétences ou des rôles spécifiques que vous souhaitez développer",
		],
	},
	{
		id: qid("gen"),
		question: "What are your salary expectations?",
		questionFr: "Quelles sont vos prétentions salariales ?",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"Based on my research of the Moroccan market for junior positions in this field, and considering my qualifications from IMTA, I would expect a salary in the range of 8,000 to 12,000 MAD per month. However, I am flexible and open to discussion, as I also value the learning opportunities and career development your company offers.",
		sampleAnswerFr:
			"En me basant sur mes recherches du marché marocain pour les postes juniors dans ce domaine, et en considérant mes qualifications de l'IMTA, je m'attendrais à un salaire dans la fourchette de 8 000 à 12 000 MAD par mois. Cependant, je suis flexible et ouvert à la discussion, car je valorise également les opportunités d'apprentissage et de développement de carrière que votre entreprise offre.",
		tips: [
			"Research salary ranges on Rekrute.com, Emploi.ma, or Glassdoor Morocco before the interview",
			"Give a range, not a fixed number — this shows flexibility",
			"Mention that total compensation (training, benefits, growth) matters too",
		],
		tipsFr: [
			"Recherchez les fourchettes salariales sur Rekrute.com, Emploi.ma ou Glassdoor Maroc avant l'entretien",
			"Donnez une fourchette, pas un chiffre fixe — cela montre votre flexibilité",
			"Mentionnez que la rémunération globale (formation, avantages, évolution) compte aussi",
		],
	},
	{
		id: qid("gen"),
		question: "Why should we hire you over other candidates?",
		questionFr: "Pourquoi devrions-nous vous embaucher plutôt qu'un autre candidat ?",
		type: "motivation",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"What sets me apart is the combination of my solid technical training at IMTA and my practical experience from my internship at [company]. I bring not only the technical skills required for this role but also a strong work ethic and the ability to adapt quickly. My bilingual proficiency in French and Arabic, along with functional English, allows me to work effectively in Morocco's diverse business environment.",
		sampleAnswerFr:
			"Ce qui me distingue, c'est la combinaison de ma solide formation technique à l'IMTA et de mon expérience pratique lors de mon stage chez [entreprise]. J'apporte non seulement les compétences techniques requises pour ce poste, mais aussi une forte éthique de travail et la capacité de m'adapter rapidement. Ma maîtrise bilingue du français et de l'arabe, ainsi que mon anglais fonctionnel, me permettent de travailler efficacement dans l'environnement commercial diversifié du Maroc.",
		tips: [
			"Highlight your unique value proposition — what makes YOU different",
			"Reference specific requirements from the job posting and explain how you meet them",
			"Mention your language skills — trilingual candidates are highly valued in Morocco",
		],
		tipsFr: [
			"Mettez en avant votre proposition de valeur unique — ce qui VOUS rend différent",
			"Référencez des exigences spécifiques de l'offre d'emploi et expliquez comment vous les remplissez",
			"Mentionnez vos compétences linguistiques — les candidats trilingues sont très valorisés au Maroc",
		],
	},
	{
		id: qid("gen"),
		question: "Describe a time when you worked effectively in a team.",
		questionFr: "Décrivez une situation où vous avez travaillé efficacement en équipe.",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"During my final year project at IMTA, our team of four had to deliver a complete project within three months. I took the initiative to set up weekly stand-up meetings and used Trello to track our progress. When one team member fell behind due to personal issues, I redistributed tasks and stayed extra hours to help. We delivered on time and received commendation from our professors.",
		sampleAnswerFr:
			"Lors de mon projet de fin d'études à l'IMTA, notre équipe de quatre devait livrer un projet complet en trois mois. J'ai pris l'initiative de mettre en place des réunions hebdomadaires et j'ai utilisé Trello pour suivre notre avancement. Quand un membre de l'équipe a pris du retard pour des raisons personnelles, j'ai redistribué les tâches et suis resté des heures supplémentaires pour aider. Nous avons livré à temps et reçu les félicitations de nos professeurs.",
		tips: [
			"Use the STAR method: Situation, Task, Action, Result",
			"Highlight YOUR specific contribution to the team's success",
			"Show empathy and leadership — how you helped others succeed",
		],
		tipsFr: [
			"Utilisez la méthode STAR : Situation, Tâche, Action, Résultat",
			"Mettez en avant VOTRE contribution spécifique au succès de l'équipe",
			"Montrez de l'empathie et du leadership — comment vous avez aidé les autres à réussir",
		],
	},
	{
		id: qid("gen"),
		question: "How do you handle stress and pressure?",
		questionFr: "Comment gérez-vous le stress et la pression ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I handle stress by breaking down large tasks into smaller, manageable steps and prioritizing them. During my exam periods at IMTA, I created detailed study schedules and took regular breaks to maintain focus. I also find that physical exercise helps me clear my mind. When facing pressure at work, I communicate openly with my team about deadlines and ask for help when needed.",
		sampleAnswerFr:
			"Je gère le stress en décomposant les grandes tâches en étapes plus petites et gérables, puis en les priorisant. Pendant mes périodes d'examens à l'IMTA, je créais des plannings d'études détaillés et prenais des pauses régulières pour maintenir ma concentration. Je trouve aussi que l'exercice physique m'aide à clarifier mes idées. Face à la pression au travail, je communique ouvertement avec mon équipe sur les délais et demande de l'aide quand c'est nécessaire.",
		tips: [
			"Give a concrete example of a high-pressure situation you handled well",
			"Describe specific techniques you use (planning, exercise, communication)",
			"Never say 'I don't get stressed' — it sounds dishonest",
		],
		tipsFr: [
			"Donnez un exemple concret d'une situation de forte pression que vous avez bien gérée",
			"Décrivez des techniques spécifiques que vous utilisez (planification, exercice, communication)",
			"Ne dites jamais 'je ne suis jamais stressé' — cela sonne malhonnête",
		],
	},
	{
		id: qid("gen"),
		question: "Tell me about a time you failed and what you learned from it.",
		questionFr: "Parlez-moi d'une situation où vous avez échoué et ce que vous en avez appris.",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During my second-year internship, I was tasked with preparing a technical presentation for the management team. I underestimated the preparation time and the presentation did not go as well as expected. I learned the importance of thorough preparation and time management. Since then, I always start preparing presentations well in advance and practice multiple times. This experience taught me that failure is a learning opportunity.",
		sampleAnswerFr:
			"Lors de mon stage de deuxième année, j'ai été chargé de préparer une présentation technique pour l'équipe de direction. J'ai sous-estimé le temps de préparation et la présentation ne s'est pas passée aussi bien que prévu. J'ai appris l'importance d'une préparation approfondie et de la gestion du temps. Depuis, je commence toujours à préparer mes présentations bien à l'avance et je m'entraîne plusieurs fois. Cette expérience m'a appris que l'échec est une opportunité d'apprentissage.",
		tips: [
			"Choose a real failure but not a catastrophic one",
			"Focus 70% of your answer on what you LEARNED, not the failure itself",
			"Show that you implemented changes as a result",
		],
		tipsFr: [
			"Choisissez un vrai échec mais pas catastrophique",
			"Concentrez 70% de votre réponse sur ce que vous avez APPRIS, pas l'échec lui-même",
			"Montrez que vous avez mis en place des changements suite à cette expérience",
		],
	},
	{
		id: qid("gen"),
		question: "How do you handle conflicts with colleagues?",
		questionFr: "Comment gérez-vous les conflits avec vos collègues ?",
		type: "situational",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I believe in addressing conflicts directly but respectfully. In a group project at IMTA, two team members disagreed on the technical approach. I facilitated a meeting where each person explained their perspective. We evaluated both approaches against our project requirements and reached a consensus. I learned that most conflicts arise from miscommunication, and listening actively is the best resolution tool.",
		sampleAnswerFr:
			"Je crois qu'il faut aborder les conflits directement mais respectueusement. Dans un projet de groupe à l'IMTA, deux membres de l'équipe n'étaient pas d'accord sur l'approche technique. J'ai facilité une réunion où chaque personne a expliqué son point de vue. Nous avons évalué les deux approches par rapport aux exigences de notre projet et sommes arrivés à un consensus. J'ai appris que la plupart des conflits viennent de malentendus, et l'écoute active est le meilleur outil de résolution.",
		tips: [
			"Never badmouth former colleagues or supervisors",
			"Show that you seek win-win solutions, not dominance",
			"Emphasize active listening and respect in your approach",
		],
		tipsFr: [
			"Ne dénigrez jamais d'anciens collègues ou superviseurs",
			"Montrez que vous cherchez des solutions gagnant-gagnant, pas la domination",
			"Mettez l'accent sur l'écoute active et le respect dans votre approche",
		],
	},
	{
		id: qid("gen"),
		question: "What do you know about our company?",
		questionFr: "Que savez-vous de notre entreprise ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I know that your company was founded in [year] and has grown to become a leader in [sector] in Morocco. You recently won [award/contract] and are expanding your operations in [region/city]. I was particularly impressed by your commitment to [specific value or initiative]. Your presence in Casablanca Finance City shows your ambition for international growth.",
		sampleAnswerFr:
			"Je sais que votre entreprise a été fondée en [année] et est devenue un leader dans [secteur] au Maroc. Vous avez récemment remporté [prix/contrat] et vous étendez vos opérations dans [région/ville]. J'ai été particulièrement impressionné par votre engagement envers [valeur ou initiative spécifique]. Votre présence à Casablanca Finance City montre votre ambition de croissance internationale.",
		tips: [
			"Always research the company before the interview — check their website, LinkedIn, and recent news",
			"Mention specific facts: founding year, products, recent achievements, values",
			"Show you understand their position in the Moroccan market",
		],
		tipsFr: [
			"Faites toujours des recherches sur l'entreprise avant l'entretien — consultez leur site web, LinkedIn et les actualités récentes",
			"Mentionnez des faits spécifiques : année de fondation, produits, réalisations récentes, valeurs",
			"Montrez que vous comprenez leur position sur le marché marocain",
		],
	},
	{
		id: qid("gen"),
		question: "Describe a situation where you showed leadership.",
		questionFr: "Décrivez une situation où vous avez fait preuve de leadership.",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During a community service project organized by IMTA, I volunteered to lead a team of 10 students to renovate a local school. I created a work schedule, delegated tasks based on each person's strengths, and coordinated with the school administration. When we faced a budget shortfall, I organized a fundraiser that exceeded our target by 20%. The project was completed on time and the school principal thanked us publicly.",
		sampleAnswerFr:
			"Lors d'un projet de service communautaire organisé par l'IMTA, je me suis porté volontaire pour diriger une équipe de 10 étudiants pour rénover une école locale. J'ai créé un planning de travail, délégué les tâches en fonction des forces de chacun et coordonné avec l'administration scolaire. Face à un manque de budget, j'ai organisé une collecte de fonds qui a dépassé notre objectif de 20%. Le projet a été terminé à temps et le directeur de l'école nous a remerciés publiquement.",
		tips: [
			"Leadership does not require a formal title — show initiative and influence",
			"Describe how you motivated and organized others",
			"Include measurable results when possible",
		],
		tipsFr: [
			"Le leadership ne nécessite pas un titre formel — montrez l'initiative et l'influence",
			"Décrivez comment vous avez motivé et organisé les autres",
			"Incluez des résultats mesurables quand c'est possible",
		],
	},
	{
		id: qid("gen"),
		question: "How do you prioritize tasks when you have multiple deadlines?",
		questionFr: "Comment priorisez-vous vos tâches quand vous avez plusieurs échéances ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I use the Eisenhower matrix to categorize tasks by urgency and importance. I start with urgent and important tasks, then schedule important but not urgent ones. During my studies at IMTA, I juggled coursework, internship reports, and extracurricular activities by using a digital calendar and to-do lists. I review my priorities every morning and adjust throughout the day as needed.",
		sampleAnswerFr:
			"J'utilise la matrice d'Eisenhower pour catégoriser les tâches par urgence et importance. Je commence par les tâches urgentes et importantes, puis je planifie celles qui sont importantes mais pas urgentes. Pendant mes études à l'IMTA, je gérais simultanément les cours, les rapports de stage et les activités parascolaires en utilisant un calendrier numérique et des listes de tâches. Je revois mes priorités chaque matin et m'ajuste au cours de la journée selon les besoins.",
		tips: [
			"Name a specific method you use (Eisenhower matrix, ABC method, time-blocking)",
			"Give a concrete example from school or internship",
			"Show you can adapt priorities when circumstances change",
		],
		tipsFr: [
			"Nommez une méthode spécifique que vous utilisez (matrice d'Eisenhower, méthode ABC, time-blocking)",
			"Donnez un exemple concret de l'école ou du stage",
			"Montrez que vous pouvez adapter vos priorités quand les circonstances changent",
		],
	},
	{
		id: qid("gen"),
		question: "What motivates you at work?",
		questionFr: "Qu'est-ce qui vous motive au travail ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I am motivated by solving complex problems and seeing the tangible impact of my work. During my internship, the most rewarding moments were when I could see my contributions making a real difference. I am also motivated by continuous learning — I regularly take online courses to stay updated. Working in a collaborative environment where ideas are shared openly energizes me.",
		sampleAnswerFr:
			"Je suis motivé par la résolution de problèmes complexes et par le fait de voir l'impact tangible de mon travail. Pendant mon stage, les moments les plus gratifiants étaient quand je pouvais voir mes contributions faire une vraie différence. Je suis aussi motivé par l'apprentissage continu — je suis régulièrement des cours en ligne pour rester à jour. Travailler dans un environnement collaboratif où les idées sont partagées ouvertement me stimule.",
		tips: [
			"Be authentic — your answer should ring true",
			"Connect your motivations to what the job offers",
			"Avoid saying 'money' as your primary motivation in the first interview",
		],
		tipsFr: [
			"Soyez authentique — votre réponse doit sonner vrai",
			"Reliez vos motivations à ce que le poste offre",
			"Évitez de dire 'l'argent' comme motivation principale lors du premier entretien",
		],
	},
	{
		id: qid("gen"),
		question: "Do you have any questions for us?",
		questionFr: "Avez-vous des questions à nous poser ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"Yes, I have a few questions. First, what does a typical day look like for someone in this role? Second, what are the main challenges the team is currently facing? And third, what opportunities for professional development does the company offer to new graduates? I am also curious about the team structure and who I would be working with directly.",
		sampleAnswerFr:
			"Oui, j'ai quelques questions. Premièrement, à quoi ressemble une journée typique pour quelqu'un dans ce poste ? Deuxièmement, quels sont les principaux défis auxquels l'équipe fait face actuellement ? Et troisièmement, quelles opportunités de développement professionnel l'entreprise offre-t-elle aux jeunes diplômés ? Je suis aussi curieux de connaître la structure de l'équipe et avec qui je travaillerais directement.",
		tips: [
			"ALWAYS have 2-3 questions prepared — saying 'no' shows lack of interest",
			"Ask about the role, the team, and growth opportunities — not about vacation days",
			"Take notes during the interview so you can reference what was discussed",
		],
		tipsFr: [
			"Ayez TOUJOURS 2-3 questions préparées — dire 'non' montre un manque d'intérêt",
			"Posez des questions sur le poste, l'équipe et les opportunités de croissance — pas sur les jours de vacances",
			"Prenez des notes pendant l'entretien pour pouvoir référencer ce qui a été discuté",
		],
	},
	{
		id: qid("gen"),
		question: "Why did you choose your field of study at IMTA?",
		questionFr: "Pourquoi avez-vous choisi votre filière à l'IMTA ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I chose [field] because I have always been passionate about [domain]. During high school, I excelled in [subjects] and participated in [relevant activities]. IMTA's program attracted me because of its strong practical orientation and high employability rates. The hands-on training and industry partnerships confirmed it was the right choice for my career goals in Morocco.",
		sampleAnswerFr:
			"J'ai choisi [filière] parce que j'ai toujours été passionné par [domaine]. Au lycée, j'excellais en [matières] et je participais à [activités pertinentes]. Le programme de l'IMTA m'a attiré grâce à sa forte orientation pratique et ses taux d'employabilité élevés. La formation pratique et les partenariats industriels ont confirmé que c'était le bon choix pour mes objectifs de carrière au Maroc.",
		tips: [
			"Show genuine passion for your field — enthusiasm is contagious",
			"Connect your academic choice to your career aspirations",
			"Mention what you enjoyed most about the IMTA curriculum",
		],
		tipsFr: [
			"Montrez une vraie passion pour votre domaine — l'enthousiasme est contagieux",
			"Reliez votre choix académique à vos aspirations de carrière",
			"Mentionnez ce que vous avez le plus apprécié dans le programme de l'IMTA",
		],
	},
	{
		id: qid("gen"),
		question: "How would your professors or internship supervisor describe you?",
		questionFr: "Comment vos professeurs ou maître de stage vous décriraient-ils ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"My internship supervisor at [company] described me as reliable, eager to learn, and proactive. In my internship report evaluation, they specifically noted my ability to work independently while also being a good team player. My professors at IMTA would add that I am someone who asks thoughtful questions and goes beyond the minimum requirements on assignments.",
		sampleAnswerFr:
			"Mon maître de stage chez [entreprise] m'a décrit comme fiable, désireux d'apprendre et proactif. Dans l'évaluation de mon rapport de stage, il a spécifiquement noté ma capacité à travailler de manière autonome tout en étant un bon coéquipier. Mes professeurs à l'IMTA ajouteraient que je suis quelqu'un qui pose des questions réfléchies et va au-delà du minimum requis dans les devoirs.",
		tips: [
			"Use quotes or specific feedback from evaluations if possible",
			"Be honest — they might actually contact your references",
			"Choose descriptions that align with the job requirements",
		],
		tipsFr: [
			"Utilisez des citations ou des retours spécifiques d'évaluations si possible",
			"Soyez honnête — ils pourraient réellement contacter vos références",
			"Choisissez des descriptions qui s'alignent avec les exigences du poste",
		],
	},
	{
		id: qid("gen"),
		question: "Are you willing to travel or relocate within Morocco?",
		questionFr: "Êtes-vous prêt à voyager ou à vous déplacer au Maroc ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"Yes, I am open to travel and relocation. Morocco has dynamic economic hubs in Casablanca, Tangier, Rabat, and Marrakech, and I see mobility as an opportunity to gain diverse experience. I understand that many projects require site visits or temporary relocations, and I am fully prepared for that. My priority is to grow professionally, and I am flexible about location.",
		sampleAnswerFr:
			"Oui, je suis ouvert aux déplacements et à la mobilité. Le Maroc a des pôles économiques dynamiques à Casablanca, Tanger, Rabat et Marrakech, et je vois la mobilité comme une opportunité d'acquérir une expérience diversifiée. Je comprends que beaucoup de projets nécessitent des visites de site ou des relocalisations temporaires, et j'y suis pleinement préparé. Ma priorité est de grandir professionnellement, et je suis flexible sur la localisation.",
		tips: [
			"Be honest about your constraints but show flexibility",
			"Mention specific Moroccan cities to show you know the business landscape",
			"If the job requires travel, express enthusiasm about it",
		],
		tipsFr: [
			"Soyez honnête sur vos contraintes mais montrez de la flexibilité",
			"Mentionnez des villes marocaines spécifiques pour montrer que vous connaissez le paysage économique",
			"Si le poste nécessite des déplacements, exprimez de l'enthousiasme",
		],
	},
	{
		id: qid("gen"),
		question: "How do you stay updated with developments in your field?",
		questionFr: "Comment restez-vous à jour avec les évolutions de votre domaine ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I follow several industry publications and LinkedIn groups related to my field. I also take online courses on platforms like Coursera and OpenClassrooms to deepen my skills. I attend local meetups and conferences when possible, and I am part of the IMTA alumni network which shares job market insights and industry trends in Morocco.",
		sampleAnswerFr:
			"Je suis plusieurs publications professionnelles et groupes LinkedIn liés à mon domaine. Je suis aussi des cours en ligne sur des plateformes comme Coursera et OpenClassrooms pour approfondir mes compétences. J'assiste à des meetups et conférences locaux quand c'est possible, et je fais partie du réseau des anciens de l'IMTA qui partage des insights sur le marché de l'emploi et les tendances de l'industrie au Maroc.",
		tips: [
			"Name specific resources: websites, publications, courses, communities",
			"Show that continuous learning is a habit, not a one-time effort",
			"Mention certifications or courses you are currently pursuing",
		],
		tipsFr: [
			"Nommez des ressources spécifiques : sites web, publications, cours, communautés",
			"Montrez que l'apprentissage continu est une habitude, pas un effort ponctuel",
			"Mentionnez les certifications ou cours que vous suivez actuellement",
		],
	},
	{
		id: qid("gen"),
		question: "Tell me about your internship experience.",
		questionFr: "Parlez-moi de votre expérience de stage.",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I completed my internship at [company] in [city] where I worked in the [department] for [duration]. My main responsibility was [task]. I learned how to apply my theoretical knowledge in a real work environment. The most valuable lesson was understanding how teams collaborate in a professional setting. I also gained practical skills in [tools/technologies] that I continue to use today.",
		sampleAnswerFr:
			"J'ai effectué mon stage chez [entreprise] à [ville] où j'ai travaillé dans le département [département] pendant [durée]. Ma responsabilité principale était [tâche]. J'ai appris à appliquer mes connaissances théoriques dans un environnement de travail réel. La leçon la plus précieuse a été de comprendre comment les équipes collaborent dans un cadre professionnel. J'ai aussi acquis des compétences pratiques en [outils/technologies] que je continue d'utiliser aujourd'hui.",
		tips: [
			"Focus on what you CONTRIBUTED, not just what you observed",
			"Mention specific projects, tools, and measurable outcomes",
			"Show enthusiasm about what you learned",
		],
		tipsFr: [
			"Concentrez-vous sur ce que vous avez CONTRIBUÉ, pas seulement ce que vous avez observé",
			"Mentionnez des projets, outils et résultats mesurables spécifiques",
			"Montrez de l'enthousiasme pour ce que vous avez appris",
		],
	},
	{
		id: qid("gen"),
		question: "How do you handle constructive criticism?",
		questionFr: "Comment gérez-vous les critiques constructives ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I welcome constructive criticism as it helps me grow. During my internship, my supervisor pointed out that my reports were too technical for non-specialist readers. Instead of taking it personally, I asked for examples of well-written reports and adapted my communication style. The next report I submitted was praised for its clarity. I believe feedback is a gift that accelerates professional development.",
		sampleAnswerFr:
			"J'accueille les critiques constructives car elles m'aident à grandir. Pendant mon stage, mon superviseur a souligné que mes rapports étaient trop techniques pour les lecteurs non spécialistes. Au lieu de le prendre personnellement, j'ai demandé des exemples de rapports bien rédigés et j'ai adapté mon style de communication. Le rapport suivant que j'ai soumis a été salué pour sa clarté. Je crois que le feedback est un cadeau qui accélère le développement professionnel.",
		tips: [
			"Show maturity — prove you do not take criticism personally",
			"Give a specific example of how criticism made you better",
			"Express gratitude for feedback, not defensiveness",
		],
		tipsFr: [
			"Montrez de la maturité — prouvez que vous ne prenez pas les critiques personnellement",
			"Donnez un exemple spécifique de comment une critique vous a rendu meilleur",
			"Exprimez de la gratitude pour le feedback, pas de la défensivité",
		],
	},
	{
		id: qid("gen"),
		question: "What do you do outside of work?",
		questionFr: "Que faites-vous en dehors du travail ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"Outside of work, I enjoy reading about technology trends and playing football with friends. I also volunteer at a local association that helps students prepare for professional life. I believe in maintaining a healthy work-life balance, and my hobbies help me stay energized and bring fresh perspectives to my work.",
		sampleAnswerFr:
			"En dehors du travail, j'aime lire sur les tendances technologiques et jouer au football avec des amis. Je fais aussi du bénévolat dans une association locale qui aide les étudiants à préparer leur vie professionnelle. Je crois en l'importance d'un bon équilibre vie professionnelle-vie personnelle, et mes hobbies m'aident à rester énergique et à apporter des perspectives fraîches à mon travail.",
		tips: [
			"Mention hobbies that show positive traits (teamwork, creativity, discipline)",
			"Avoid controversial activities or saying 'nothing'",
			"Show you have a balanced life — employers value well-rounded people",
		],
		tipsFr: [
			"Mentionnez des hobbies qui montrent des traits positifs (travail d'équipe, créativité, discipline)",
			"Évitez les activités controversées ou de dire 'rien'",
			"Montrez que vous avez une vie équilibrée — les employeurs valorisent les personnes épanouies",
		],
	},
	{
		id: qid("gen"),
		question: "How do you adapt to change?",
		questionFr: "Comment vous adaptez-vous au changement ?",
		type: "situational",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I see change as an opportunity for growth. When IMTA transitioned to online learning during a difficult period, I quickly adapted by creating a dedicated study space, establishing a routine, and actively participating in virtual discussions. I actually found that I became more disciplined with my time management. I approach workplace changes the same way — by staying positive, being flexible, and looking for the opportunity in every change.",
		sampleAnswerFr:
			"Je vois le changement comme une opportunité de croissance. Quand l'IMTA est passé à l'enseignement en ligne pendant une période difficile, je me suis rapidement adapté en créant un espace d'étude dédié, en établissant une routine et en participant activement aux discussions virtuelles. J'ai en fait constaté que je suis devenu plus discipliné dans ma gestion du temps. J'aborde les changements au travail de la même manière — en restant positif, flexible et en cherchant l'opportunité dans chaque changement.",
		tips: [
			"Give a concrete example of a significant change you navigated successfully",
			"Show that you are proactive, not reactive when facing change",
			"Mention what you learned from the experience",
		],
		tipsFr: [
			"Donnez un exemple concret d'un changement significatif que vous avez bien navigué",
			"Montrez que vous êtes proactif, pas réactif face au changement",
			"Mentionnez ce que vous avez appris de l'expérience",
		],
	},
	{
		id: qid("gen"),
		question: "What is the most difficult decision you have ever made?",
		questionFr: "Quelle est la décision la plus difficile que vous ayez jamais prise ?",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"The most difficult decision was choosing to switch my initial field of study to pursue my current specialization at IMTA. It meant starting over in some ways and disappointing some family expectations. However, I followed my passion and aptitude. This decision taught me the importance of self-awareness and having the courage to follow your convictions, even when it is uncomfortable.",
		sampleAnswerFr:
			"La décision la plus difficile a été de changer ma filière d'études initiale pour poursuivre ma spécialisation actuelle à l'IMTA. Cela signifiait recommencer à certains égards et décevoir certaines attentes familiales. Cependant, j'ai suivi ma passion et mes aptitudes. Cette décision m'a appris l'importance de la connaissance de soi et d'avoir le courage de suivre ses convictions, même quand c'est inconfortable.",
		tips: [
			"Choose a decision that shows maturity and thoughtful analysis",
			"Explain the factors you weighed and the process you followed",
			"Share the positive outcome or lesson learned",
		],
		tipsFr: [
			"Choisissez une décision qui montre de la maturité et une analyse réfléchie",
			"Expliquez les facteurs que vous avez pesés et le processus que vous avez suivi",
			"Partagez le résultat positif ou la leçon apprise",
		],
	},
	{
		id: qid("gen"),
		question: "Describe a time you went above and beyond what was expected.",
		questionFr: "Décrivez une situation où vous êtes allé au-delà de ce qui était attendu.",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During my internship, I was asked to organize data in a spreadsheet. I noticed the manual process was time-consuming and error-prone, so I created an automated script that reduced the task from 4 hours to 15 minutes. My supervisor was impressed and asked me to implement similar automations for other departments. This showed me that initiative and problem-solving are always valued in the workplace.",
		sampleAnswerFr:
			"Pendant mon stage, on m'a demandé d'organiser des données dans un tableur. J'ai remarqué que le processus manuel était chronophage et sujet aux erreurs, alors j'ai créé un script automatisé qui a réduit la tâche de 4 heures à 15 minutes. Mon superviseur a été impressionné et m'a demandé d'implémenter des automatisations similaires pour d'autres départements. Cela m'a montré que l'initiative et la résolution de problèmes sont toujours valorisées sur le lieu de travail.",
		tips: [
			"Show initiative — going beyond the minimum without being asked",
			"Quantify the impact when possible (time saved, cost reduced, efficiency gained)",
			"Demonstrate that you think about the bigger picture",
		],
		tipsFr: [
			"Montrez de l'initiative — aller au-delà du minimum sans qu'on vous le demande",
			"Quantifiez l'impact quand c'est possible (temps gagné, coût réduit, efficacité accrue)",
			"Démontrez que vous pensez à la vue d'ensemble",
		],
	},
	{
		id: qid("gen"),
		question: "What is your preferred working style: autonomous or guided?",
		questionFr: "Quel est votre style de travail préféré : autonome ou encadré ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I work well in both modes. As a new graduate, I appreciate guidance and clear expectations when starting a new task or role. Once I understand the objectives and processes, I am comfortable working autonomously and taking initiative. At IMTA, I had projects that required both approaches, and I learned to adapt to what the situation required.",
		sampleAnswerFr:
			"Je travaille bien dans les deux modes. En tant que jeune diplômé, j'apprécie l'encadrement et des attentes claires quand je commence une nouvelle tâche ou un nouveau rôle. Une fois que je comprends les objectifs et les processus, je suis à l'aise pour travailler de manière autonome et prendre des initiatives. À l'IMTA, j'avais des projets qui nécessitaient les deux approches, et j'ai appris à m'adapter à ce que la situation exigeait.",
		tips: [
			"Show flexibility — the best answer is 'both, depending on context'",
			"Acknowledge that as a new hire, you welcome guidance initially",
			"Demonstrate that you can work independently once onboarded",
		],
		tipsFr: [
			"Montrez de la flexibilité — la meilleure réponse est 'les deux, selon le contexte'",
			"Reconnaissez qu'en tant que nouvel employé, vous accueillez l'encadrement initialement",
			"Démontrez que vous pouvez travailler de manière autonome une fois intégré",
		],
	},
	{
		id: qid("gen"),
		question: "How do you feel about working overtime when needed?",
		questionFr: "Que pensez-vous du travail en heures supplémentaires quand c'est nécessaire ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I understand that certain periods require extra effort, such as project deadlines or urgent client needs. I am willing to work overtime when the situation demands it. At the same time, I believe in working smart — good planning and efficient processes can minimize the need for overtime. I focus on delivering quality work within regular hours while being flexible when exceptional circumstances arise.",
		sampleAnswerFr:
			"Je comprends que certaines périodes nécessitent un effort supplémentaire, comme les échéances de projet ou les besoins urgents des clients. Je suis prêt à faire des heures supplémentaires quand la situation l'exige. En même temps, je crois au travail intelligent — une bonne planification et des processus efficaces peuvent minimiser le besoin d'heures supplémentaires. Je me concentre sur la livraison d'un travail de qualité dans les heures normales tout en étant flexible quand des circonstances exceptionnelles surviennent.",
		tips: [
			"Show willingness but also that you value efficiency",
			"Do not say you love working overtime — it suggests poor time management",
			"Mention that you aim to minimize overtime through good planning",
		],
		tipsFr: [
			"Montrez votre volonté mais aussi que vous valorisez l'efficacité",
			"Ne dites pas que vous adorez les heures supplémentaires — cela suggère une mauvaise gestion du temps",
			"Mentionnez que vous visez à minimiser les heures supplémentaires grâce à une bonne planification",
		],
	},
	{
		id: qid("gen"),
		question: "Do you speak any foreign languages?",
		questionFr: "Parlez-vous des langues étrangères ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"Yes, I am fluent in Arabic and French, which are my working languages. I also have an intermediate level in English, and I am actively improving it through online courses and language exchange sessions. I understand the importance of English in the international business environment, particularly for companies operating in Tanger Med or Casablanca Finance City.",
		sampleAnswerFr:
			"Oui, je parle couramment l'arabe et le français, qui sont mes langues de travail. J'ai aussi un niveau intermédiaire en anglais, et je l'améliore activement à travers des cours en ligne et des sessions d'échange linguistique. Je comprends l'importance de l'anglais dans l'environnement commercial international, particulièrement pour les entreprises opérant à Tanger Med ou Casablanca Finance City.",
		tips: [
			"Be honest about your proficiency level — they may test you on the spot",
			"If your English is basic, show you are working to improve it",
			"Mention Darija/Arabic as an asset for local market engagement",
		],
		tipsFr: [
			"Soyez honnête sur votre niveau — ils pourraient vous tester sur place",
			"Si votre anglais est basique, montrez que vous travaillez à l'améliorer",
			"Mentionnez la Darija/l'arabe comme un atout pour l'engagement sur le marché local",
		],
	},
	{
		id: qid("gen"),
		question: "What is your experience with project management tools?",
		questionFr: "Quelle est votre expérience avec les outils de gestion de projet ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"During my studies and internship, I used several project management tools. I am proficient with Microsoft Project for Gantt charts and scheduling, Trello for agile task management, and Microsoft Teams for collaboration. I also have experience with Google Workspace for document collaboration. I am a fast learner and can quickly adapt to any new tool the company uses.",
		sampleAnswerFr:
			"Pendant mes études et mon stage, j'ai utilisé plusieurs outils de gestion de projet. Je maîtrise Microsoft Project pour les diagrammes de Gantt et la planification, Trello pour la gestion agile des tâches, et Microsoft Teams pour la collaboration. J'ai aussi de l'expérience avec Google Workspace pour la collaboration documentaire. J'apprends vite et peux m'adapter rapidement à tout nouvel outil utilisé par l'entreprise.",
		tips: [
			"Name specific tools you have actually used — do not lie",
			"Show willingness to learn new tools the company uses",
			"Mention both planning tools and collaboration tools",
		],
		tipsFr: [
			"Nommez des outils spécifiques que vous avez réellement utilisés — ne mentez pas",
			"Montrez votre volonté d'apprendre les nouveaux outils de l'entreprise",
			"Mentionnez à la fois les outils de planification et de collaboration",
		],
	},
	{
		id: qid("gen"),
		question: "How would you handle a disagreement with your manager?",
		questionFr: "Comment géreriez-vous un désaccord avec votre supérieur ?",
		type: "situational",
		field: "général",
		difficulty: "hard",
		sampleAnswer:
			"I would first make sure I fully understand my manager's perspective by asking clarifying questions. If I still disagreed, I would request a private meeting to present my viewpoint with data and examples, while remaining respectful. I believe it is important to voice concerns professionally. Ultimately, if my manager makes a final decision, I would support it fully while executing the plan to the best of my ability.",
		sampleAnswerFr:
			"Je m'assurerais d'abord de bien comprendre la perspective de mon supérieur en posant des questions de clarification. Si je n'étais toujours pas d'accord, je demanderais une réunion privée pour présenter mon point de vue avec des données et des exemples, tout en restant respectueux. Je crois qu'il est important d'exprimer ses préoccupations de manière professionnelle. En fin de compte, si mon supérieur prend une décision finale, je la soutiendrais pleinement tout en exécutant le plan au mieux de mes capacités.",
		tips: [
			"Show respect for hierarchy while demonstrating critical thinking",
			"Emphasize private, constructive communication over public confrontation",
			"Make clear that you ultimately support the team's direction",
		],
		tipsFr: [
			"Montrez du respect pour la hiérarchie tout en démontrant votre esprit critique",
			"Mettez l'accent sur la communication privée et constructive plutôt que la confrontation publique",
			"Indiquez clairement que vous soutenez finalement la direction de l'équipe",
		],
	},
	{
		id: qid("gen"),
		question: "What would you do in your first 90 days in this role?",
		questionFr: "Que feriez-vous pendant vos 90 premiers jours dans ce poste ?",
		type: "situational",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"In the first 30 days, I would focus on understanding the company culture, learning internal processes, and building relationships with my team. From days 30 to 60, I would start contributing to ongoing projects while identifying areas where I can add the most value. In the final month, I would take on more responsibility, propose improvements based on my observations, and set clear goals with my manager for the next quarter.",
		sampleAnswerFr:
			"Pendant les 30 premiers jours, je me concentrerais sur la compréhension de la culture d'entreprise, l'apprentissage des processus internes et la construction de relations avec mon équipe. Du jour 30 au jour 60, je commencerais à contribuer aux projets en cours tout en identifiant les domaines où je peux apporter le plus de valeur. Le dernier mois, je prendrais plus de responsabilités, proposerais des améliorations basées sur mes observations et fixerais des objectifs clairs avec mon manager pour le prochain trimestre.",
		tips: [
			"Show a structured approach: listen first, learn, then contribute",
			"Demonstrate that you value understanding the company before proposing changes",
			"Mention building relationships — cultural fit matters in Morocco",
		],
		tipsFr: [
			"Montrez une approche structurée : écouter d'abord, apprendre, puis contribuer",
			"Démontrez que vous valorisez la compréhension de l'entreprise avant de proposer des changements",
			"Mentionnez la construction de relations — l'adéquation culturelle compte au Maroc",
		],
	},
	{
		id: qid("gen"),
		question: "Have you ever had to meet a very tight deadline? How did you manage?",
		questionFr: "Avez-vous déjà dû respecter un délai très serré ? Comment avez-vous géré ?",
		type: "situational",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"Yes, during my final year at IMTA, I had to submit three major deliverables within the same week. I prioritized by urgency and complexity, created a detailed hour-by-hour schedule, and eliminated all distractions. I also communicated with my teammates to coordinate efforts and avoid duplicating work. We met all deadlines, and I learned that clear planning and communication are the keys to handling pressure.",
		sampleAnswerFr:
			"Oui, pendant ma dernière année à l'IMTA, j'ai dû remettre trois livrables majeurs dans la même semaine. J'ai priorisé par urgence et complexité, créé un planning détaillé heure par heure, et éliminé toutes les distractions. J'ai aussi communiqué avec mes coéquipiers pour coordonner les efforts et éviter le travail en double. Nous avons respecté toutes les échéances, et j'ai appris que la planification claire et la communication sont les clés pour gérer la pression.",
		tips: [
			"Describe the specific constraints and your action plan",
			"Show time management and prioritization skills",
			"Include the successful outcome and what you learned",
		],
		tipsFr: [
			"Décrivez les contraintes spécifiques et votre plan d'action",
			"Montrez vos compétences en gestion du temps et priorisation",
			"Incluez le résultat réussi et ce que vous avez appris",
		],
	},

	// =========================================================================
	// GENIE INFORMATIQUE (35+ questions)
	// =========================================================================
	{
		id: qid("info"),
		question: "Explain the difference between SQL JOIN types (INNER, LEFT, RIGHT, FULL).",
		questionFr: "Expliquez la différence entre les types de JOIN SQL (INNER, LEFT, RIGHT, FULL).",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table plus matching rows from the right. RIGHT JOIN does the opposite. FULL JOIN returns all rows from both tables, with NULLs where there is no match. In practice, LEFT JOIN is the most commonly used in applications because you typically want all records from a primary table with optional related data.",
		sampleAnswerFr:
			"INNER JOIN retourne uniquement les lignes correspondantes des deux tables. LEFT JOIN retourne toutes les lignes de la table gauche plus les lignes correspondantes de la droite. RIGHT JOIN fait l'inverse. FULL JOIN retourne toutes les lignes des deux tables, avec des NULL là où il n'y a pas de correspondance. En pratique, LEFT JOIN est le plus couramment utilisé car on veut généralement tous les enregistrements d'une table principale avec les données associées optionnelles.",
		tips: [
			"Draw a Venn diagram if whiteboard is available",
			"Give a real-world example using tables relevant to the company's domain",
			"Mention performance implications of different join types",
		],
		tipsFr: [
			"Dessinez un diagramme de Venn si un tableau blanc est disponible",
			"Donnez un exemple concret utilisant des tables pertinentes au domaine de l'entreprise",
			"Mentionnez les implications de performance des différents types de join",
		],
	},
	{
		id: qid("info"),
		question: "What is the difference between Git merge and Git rebase?",
		questionFr: "Quelle est la différence entre Git merge et Git rebase ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"Git merge creates a new merge commit that combines two branches, preserving the full history. Git rebase replays commits from one branch on top of another, creating a linear history. Merge is safer for shared branches because it does not rewrite history. Rebase is useful for cleaning up feature branches before merging to main. I typically use rebase on local branches and merge for integrating into the main branch.",
		sampleAnswerFr:
			"Git merge crée un nouveau commit de fusion qui combine deux branches, préservant l'historique complet. Git rebase rejoue les commits d'une branche par-dessus une autre, créant un historique linéaire. Merge est plus sûr pour les branches partagées car il ne réécrit pas l'historique. Rebase est utile pour nettoyer les branches de fonctionnalité avant de fusionner vers main. J'utilise généralement rebase sur les branches locales et merge pour l'intégration dans la branche principale.",
		tips: [
			"Show you understand when to use each approach",
			"Mention the golden rule: never rebase a public/shared branch",
			"Discuss your team's Git workflow if applicable",
		],
		tipsFr: [
			"Montrez que vous comprenez quand utiliser chaque approche",
			"Mentionnez la règle d'or : ne jamais rebaser une branche publique/partagée",
			"Discutez du workflow Git de votre équipe si applicable",
		],
	},
	{
		id: qid("info"),
		question: "Explain the MVC architecture pattern.",
		questionFr: "Expliquez le patron d'architecture MVC.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"MVC stands for Model-View-Controller. The Model handles data logic and database interactions. The View renders the user interface. The Controller receives user input, processes it through the Model, and returns the appropriate View. In Laravel for example, Models are Eloquent classes, Views are Blade templates, and Controllers handle HTTP request logic. This separation of concerns makes code maintainable and testable.",
		sampleAnswerFr:
			"MVC signifie Modèle-Vue-Contrôleur. Le Modèle gère la logique des données et les interactions avec la base de données. La Vue rend l'interface utilisateur. Le Contrôleur reçoit les entrées utilisateur, les traite via le Modèle et retourne la Vue appropriée. En Laravel par exemple, les Modèles sont des classes Eloquent, les Vues sont des templates Blade, et les Contrôleurs gèrent la logique des requêtes HTTP. Cette séparation des responsabilités rend le code maintenable et testable.",
		tips: [
			"Use a concrete framework example (Laravel, Spring, Django) to illustrate",
			"Explain WHY separation of concerns matters, not just WHAT it is",
			"Mention alternatives like MVVM or Clean Architecture if relevant",
		],
		tipsFr: [
			"Utilisez un exemple de framework concret (Laravel, Spring, Django) pour illustrer",
			"Expliquez POURQUOI la séparation des responsabilités compte, pas seulement CE QUE c'est",
			"Mentionnez des alternatives comme MVVM ou Clean Architecture si pertinent",
		],
	},
	{
		id: qid("info"),
		question: "What is Docker and why is it used in modern development?",
		questionFr: "Qu'est-ce que Docker et pourquoi est-il utilisé dans le développement moderne ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"Docker is a containerization platform that packages applications with their dependencies into lightweight, portable containers. Unlike virtual machines, containers share the host OS kernel, making them faster and more resource-efficient. Docker solves the 'it works on my machine' problem by ensuring consistent environments across development, testing, and production. I use Docker Compose to orchestrate multi-container applications, like running a web app with its database and cache.",
		sampleAnswerFr:
			"Docker est une plateforme de conteneurisation qui empaquette les applications avec leurs dépendances dans des conteneurs légers et portables. Contrairement aux machines virtuelles, les conteneurs partagent le noyau de l'OS hôte, les rendant plus rapides et plus efficaces en ressources. Docker résout le problème 'ça marche sur ma machine' en assurant des environnements cohérents entre le développement, les tests et la production. J'utilise Docker Compose pour orchestrer des applications multi-conteneurs, comme faire tourner une application web avec sa base de données et son cache.",
		tips: [
			"Explain the difference between containers and virtual machines",
			"Mention Docker Compose and its use in development environments",
			"Discuss how containers relate to CI/CD pipelines",
		],
		tipsFr: [
			"Expliquez la différence entre les conteneurs et les machines virtuelles",
			"Mentionnez Docker Compose et son utilisation dans les environnements de développement",
			"Discutez de la relation entre les conteneurs et les pipelines CI/CD",
		],
	},
	{
		id: qid("info"),
		question: "Explain the difference between REST and GraphQL APIs.",
		questionFr: "Expliquez la différence entre les API REST et GraphQL.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"REST uses fixed endpoints with predefined response structures — each endpoint returns a specific set of data. GraphQL provides a single endpoint where clients specify exactly what data they need using a query language. REST can suffer from over-fetching or under-fetching data, while GraphQL gives clients precise control. REST is simpler to cache and implement, while GraphQL excels for complex, nested data requirements like mobile apps.",
		sampleAnswerFr:
			"REST utilise des endpoints fixes avec des structures de réponse prédéfinies — chaque endpoint retourne un ensemble spécifique de données. GraphQL fournit un seul endpoint où les clients spécifient exactement les données dont ils ont besoin via un langage de requête. REST peut souffrir de sur-récupération ou sous-récupération de données, tandis que GraphQL donne aux clients un contrôle précis. REST est plus simple à mettre en cache et à implémenter, tandis que GraphQL excelle pour les besoins de données complexes et imbriquées comme les apps mobiles.",
		tips: [
			"Discuss trade-offs, not just definitions — show engineering judgment",
			"Mention when you would choose one over the other",
			"Reference real-world use cases you have encountered",
		],
		tipsFr: [
			"Discutez des compromis, pas juste des définitions — montrez votre jugement d'ingénieur",
			"Mentionnez quand vous choisiriez l'un plutôt que l'autre",
			"Référencez des cas d'utilisation réels que vous avez rencontrés",
		],
	},
	{
		id: qid("info"),
		question: "What is Agile/Scrum methodology and how have you used it?",
		questionFr: "Qu'est-ce que la méthodologie Agile/Scrum et comment l'avez-vous utilisée ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"Agile is an iterative approach to project management that delivers work in small increments called sprints, typically 2 weeks. Scrum is a specific Agile framework with defined roles (Product Owner, Scrum Master, Development Team) and ceremonies (sprint planning, daily standup, sprint review, retrospective). During my final year project at IMTA, we used Scrum with 2-week sprints, daily standups, and a Kanban board on Jira. This helped us deliver features incrementally and adapt to changing requirements.",
		sampleAnswerFr:
			"Agile est une approche itérative de la gestion de projet qui livre le travail en petits incréments appelés sprints, typiquement de 2 semaines. Scrum est un cadre Agile spécifique avec des rôles définis (Product Owner, Scrum Master, Équipe de développement) et des cérémonies (planification de sprint, standup quotidien, revue de sprint, rétrospective). Pendant mon projet de fin d'études à l'IMTA, nous avons utilisé Scrum avec des sprints de 2 semaines, des standups quotidiens et un tableau Kanban sur Jira. Cela nous a aidés à livrer des fonctionnalités de manière incrémentale et à s'adapter aux exigences changeantes.",
		tips: [
			"Explain the Scrum ceremonies and your role in them",
			"Give a concrete example from a project where you used Agile",
			"Show understanding of the WHY behind Agile, not just the process",
		],
		tipsFr: [
			"Expliquez les cérémonies Scrum et votre rôle dans celles-ci",
			"Donnez un exemple concret d'un projet où vous avez utilisé Agile",
			"Montrez la compréhension du POURQUOI derrière Agile, pas juste le processus",
		],
	},
	{
		id: qid("info"),
		question: "How would you optimize a slow SQL query?",
		questionFr: "Comment optimiseriez-vous une requête SQL lente ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"First, I would use EXPLAIN ANALYZE to understand the query execution plan and identify bottlenecks. Common optimizations include: adding appropriate indexes on frequently queried columns, avoiding SELECT * in favor of specific columns, optimizing JOINs by ensuring join columns are indexed, using LIMIT for pagination, and rewriting correlated subqueries as JOINs. I would also check for N+1 query problems in the application layer and consider query caching for frequently accessed data.",
		sampleAnswerFr:
			"D'abord, j'utiliserais EXPLAIN ANALYZE pour comprendre le plan d'exécution de la requête et identifier les goulots d'étranglement. Les optimisations courantes incluent : ajouter des index appropriés sur les colonnes fréquemment interrogées, éviter SELECT * en faveur de colonnes spécifiques, optimiser les JOINs en s'assurant que les colonnes de jointure sont indexées, utiliser LIMIT pour la pagination, et réécrire les sous-requêtes corrélées en JOINs. Je vérifierais aussi les problèmes de requêtes N+1 dans la couche applicative et considérerais le cache de requêtes pour les données fréquemment accédées.",
		tips: [
			"Always start with EXPLAIN ANALYZE — show a methodical approach",
			"Cover indexes, query structure, and application-level optimizations",
			"Mention tools you use for database profiling",
		],
		tipsFr: [
			"Commencez toujours par EXPLAIN ANALYZE — montrez une approche méthodique",
			"Couvrez les index, la structure des requêtes et les optimisations au niveau applicatif",
			"Mentionnez les outils que vous utilisez pour le profilage de base de données",
		],
	},
	{
		id: qid("info"),
		question: "What are the SOLID principles in object-oriented programming?",
		questionFr: "Quels sont les principes SOLID en programmation orientée objet ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"SOLID stands for: Single Responsibility (each class has one job), Open-Closed (open for extension, closed for modification), Liskov Substitution (subtypes must be substitutable for their base types), Interface Segregation (many specific interfaces are better than one general interface), and Dependency Inversion (depend on abstractions, not concretions). These principles help create code that is maintainable, flexible, and testable. In Java, these are fundamental to enterprise application design.",
		sampleAnswerFr:
			"SOLID signifie : Responsabilité Unique (chaque classe a un seul rôle), Ouvert-Fermé (ouvert à l'extension, fermé à la modification), Substitution de Liskov (les sous-types doivent être substituables à leurs types de base), Ségrégation d'Interface (plusieurs interfaces spécifiques valent mieux qu'une interface générale), et Inversion de Dépendance (dépendre d'abstractions, pas de concrets). Ces principes aident à créer du code maintenable, flexible et testable. En Java, ils sont fondamentaux pour la conception d'applications d'entreprise.",
		tips: [
			"Give a brief example for each principle — code examples if possible",
			"Show you understand the practical benefits, not just the theory",
			"Mention how SOLID relates to design patterns like Strategy or Factory",
		],
		tipsFr: [
			"Donnez un bref exemple pour chaque principe — des exemples de code si possible",
			"Montrez que vous comprenez les avantages pratiques, pas juste la théorie",
			"Mentionnez comment SOLID se rapporte aux design patterns comme Strategy ou Factory",
		],
	},
	{
		id: qid("info"),
		question: "Explain the concept of a React component lifecycle.",
		questionFr: "Expliquez le concept du cycle de vie d'un composant React.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"In modern React with hooks, the lifecycle is managed through useEffect. The component mounts (renders for the first time), updates (when state or props change), and unmounts (is removed from the DOM). useEffect with an empty dependency array runs on mount. useEffect with dependencies runs when those values change. The cleanup function in useEffect runs on unmount or before re-running the effect. In class components, this maps to componentDidMount, componentDidUpdate, and componentWillUnmount.",
		sampleAnswerFr:
			"En React moderne avec les hooks, le cycle de vie est géré via useEffect. Le composant se monte (premier rendu), se met à jour (quand le state ou les props changent), et se démonte (est retiré du DOM). useEffect avec un tableau de dépendances vide s'exécute au montage. useEffect avec des dépendances s'exécute quand ces valeurs changent. La fonction de nettoyage dans useEffect s'exécute au démontage ou avant de ré-exécuter l'effet. En composants de classe, cela correspond à componentDidMount, componentDidUpdate et componentWillUnmount.",
		tips: [
			"Focus on hooks (useEffect, useState) — class components are legacy",
			"Draw the lifecycle flow if a whiteboard is available",
			"Mention common pitfalls like infinite re-renders with missing dependencies",
		],
		tipsFr: [
			"Concentrez-vous sur les hooks (useEffect, useState) — les composants de classe sont legacy",
			"Dessinez le flux du cycle de vie si un tableau blanc est disponible",
			"Mentionnez les pièges courants comme les re-rendus infinis avec des dépendances manquantes",
		],
	},
	{
		id: qid("info"),
		question: "What is a RESTful API and what are its key principles?",
		questionFr: "Qu'est-ce qu'une API RESTful et quels sont ses principes clés ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"REST (Representational State Transfer) is an architectural style for web APIs. Key principles include: statelessness (each request contains all needed information), uniform interface (using HTTP methods: GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing), resource-based URLs (/api/users/123), and proper use of HTTP status codes (200, 201, 404, 500). REST APIs should also be cacheable and support a layered system architecture.",
		sampleAnswerFr:
			"REST (Representational State Transfer) est un style architectural pour les API web. Les principes clés incluent : l'absence d'état (chaque requête contient toutes les informations nécessaires), l'interface uniforme (utilisant les méthodes HTTP : GET pour lire, POST pour créer, PUT/PATCH pour mettre à jour, DELETE pour supprimer), les URLs basées sur les ressources (/api/users/123), et l'utilisation correcte des codes de statut HTTP (200, 201, 404, 500). Les API REST doivent aussi être cacheables et supporter une architecture en couches.",
		tips: [
			"List the HTTP methods and their corresponding CRUD operations",
			"Give examples of well-designed vs poorly-designed endpoints",
			"Mention authentication methods (JWT, OAuth2) used with REST APIs",
		],
		tipsFr: [
			"Listez les méthodes HTTP et leurs opérations CRUD correspondantes",
			"Donnez des exemples d'endpoints bien conçus vs mal conçus",
			"Mentionnez les méthodes d'authentification (JWT, OAuth2) utilisées avec les API REST",
		],
	},
	{
		id: qid("info"),
		question: "Explain the difference between Java and Python. When would you use each?",
		questionFr: "Expliquez la différence entre Java et Python. Quand utiliseriez-vous chacun ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"Java is statically typed, compiled to bytecode, and runs on the JVM. It excels in enterprise applications, Android development, and systems requiring high performance. Python is dynamically typed, interpreted, and known for its simplicity. It excels in data science, scripting, automation, and rapid prototyping. In Morocco's job market, Java is widely used by banks (Attijariwafa, BMCE) and telecoms (Maroc Telecom), while Python is growing in data analytics and AI startups.",
		sampleAnswerFr:
			"Java est typé statiquement, compilé en bytecode et tourne sur la JVM. Il excelle dans les applications d'entreprise, le développement Android et les systèmes nécessitant de hautes performances. Python est typé dynamiquement, interprété et connu pour sa simplicité. Il excelle dans la data science, le scripting, l'automatisation et le prototypage rapide. Sur le marché marocain, Java est largement utilisé par les banques (Attijariwafa, BMCE) et les télécoms (Maroc Telecom), tandis que Python se développe dans l'analytique de données et les startups d'IA.",
		tips: [
			"Show you understand the trade-offs, not just the syntax differences",
			"Mention real Moroccan companies that use each language",
			"Explain when you would choose one over the other for a project",
		],
		tipsFr: [
			"Montrez que vous comprenez les compromis, pas juste les différences de syntaxe",
			"Mentionnez des entreprises marocaines réelles qui utilisent chaque langage",
			"Expliquez quand vous choisiriez l'un plutôt que l'autre pour un projet",
		],
	},
	{
		id: qid("info"),
		question: "What is CI/CD and how does it work?",
		questionFr: "Qu'est-ce que le CI/CD et comment ça fonctionne ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"CI (Continuous Integration) is the practice of automatically building and testing code every time a developer pushes changes. CD (Continuous Delivery/Deployment) extends this by automatically deploying tested code to staging or production. A typical pipeline: developer pushes code to Git, CI server (Jenkins, GitHub Actions, GitLab CI) runs unit tests, linting, and builds. If all pass, the artifact is deployed. This catches bugs early and enables rapid, reliable releases.",
		sampleAnswerFr:
			"CI (Intégration Continue) est la pratique de construire et tester automatiquement le code à chaque push d'un développeur. CD (Livraison/Déploiement Continu) étend cela en déployant automatiquement le code testé en staging ou production. Un pipeline typique : le développeur push le code sur Git, le serveur CI (Jenkins, GitHub Actions, GitLab CI) exécute les tests unitaires, le linting et le build. Si tout passe, l'artifact est déployé. Cela détecte les bugs tôt et permet des releases rapides et fiables.",
		tips: [
			"Name specific CI/CD tools you have used (Jenkins, GitHub Actions, GitLab CI)",
			"Explain the stages of a typical pipeline",
			"Mention how CI/CD relates to Agile and DevOps practices",
		],
		tipsFr: [
			"Nommez des outils CI/CD spécifiques que vous avez utilisés (Jenkins, GitHub Actions, GitLab CI)",
			"Expliquez les étapes d'un pipeline typique",
			"Mentionnez comment le CI/CD se rapporte aux pratiques Agile et DevOps",
		],
	},
	{
		id: qid("info"),
		question: "How would you secure a web application against common vulnerabilities?",
		questionFr: "Comment sécuriseriez-vous une application web contre les vulnérabilités courantes ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"I would address the OWASP Top 10 vulnerabilities systematically: use parameterized queries to prevent SQL injection, sanitize and escape user input to prevent XSS, implement CSRF tokens for form submissions, use HTTPS everywhere with proper TLS configuration, implement proper authentication with hashed passwords (bcrypt) and session management, apply the principle of least privilege for access control, validate all inputs server-side, and keep all dependencies updated to patch known vulnerabilities.",
		sampleAnswerFr:
			"J'aborderais systématiquement les vulnérabilités du Top 10 OWASP : utiliser des requêtes paramétrées pour prévenir l'injection SQL, assainir et échapper les entrées utilisateur pour prévenir le XSS, implémenter des tokens CSRF pour les soumissions de formulaire, utiliser HTTPS partout avec une configuration TLS correcte, implémenter une authentification correcte avec des mots de passe hashés (bcrypt) et une gestion de session, appliquer le principe du moindre privilège pour le contrôle d'accès, valider toutes les entrées côté serveur, et garder toutes les dépendances à jour.",
		tips: [
			"Reference OWASP Top 10 — it shows you know the standard",
			"Give specific examples for each vulnerability type",
			"Mention security tools you use (SAST, DAST, dependency scanning)",
		],
		tipsFr: [
			"Référencez le Top 10 OWASP — cela montre que vous connaissez le standard",
			"Donnez des exemples spécifiques pour chaque type de vulnérabilité",
			"Mentionnez les outils de sécurité que vous utilisez (SAST, DAST, scan de dépendances)",
		],
	},
	{
		id: qid("info"),
		question: "What is the difference between Angular and React?",
		questionFr: "Quelle est la différence entre Angular et React ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"Angular is a full framework by Google that includes routing, forms, HTTP client, and dependency injection out of the box. It uses TypeScript and follows an opinionated structure. React is a library by Meta focused only on the view layer — you choose your own routing, state management, and other tools. Angular has a steeper learning curve but provides more structure for large teams. React is more flexible and has a larger ecosystem. Many Moroccan companies use Angular for enterprise apps and React for startups.",
		sampleAnswerFr:
			"Angular est un framework complet de Google qui inclut le routage, les formulaires, le client HTTP et l'injection de dépendances. Il utilise TypeScript et suit une structure opinionée. React est une bibliothèque de Meta focalisée uniquement sur la couche vue — vous choisissez votre propre routage, gestion d'état et autres outils. Angular a une courbe d'apprentissage plus raide mais offre plus de structure pour les grandes équipes. React est plus flexible et a un écosystème plus large. Beaucoup d'entreprises marocaines utilisent Angular pour les apps entreprise et React pour les startups.",
		tips: [
			"Avoid saying one is 'better' — discuss trade-offs and use cases",
			"Mention which one you are more experienced with and why",
			"Show awareness of the Moroccan market preferences",
		],
		tipsFr: [
			"Évitez de dire que l'un est 'meilleur' — discutez des compromis et cas d'utilisation",
			"Mentionnez celui avec lequel vous avez le plus d'expérience et pourquoi",
			"Montrez votre connaissance des préférences du marché marocain",
		],
	},
	{
		id: qid("info"),
		question: "Describe how you would design a database schema for an e-commerce platform.",
		questionFr: "Décrivez comment vous concevriez un schéma de base de données pour une plateforme e-commerce.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"I would start with core entities: Users (id, name, email, password_hash, role), Products (id, name, description, price, stock, category_id), Categories (id, name, parent_id for hierarchy), Orders (id, user_id, status, total, created_at), OrderItems (order_id, product_id, quantity, unit_price), Addresses (id, user_id, street, city). I would use proper normalization, add indexes on frequently queried columns (email, category_id, status), and use foreign keys for referential integrity. For the Moroccan market, I would add fields for MAD pricing and Arabic/French product descriptions.",
		sampleAnswerFr:
			"Je commencerais par les entités principales : Utilisateurs (id, nom, email, hash_mot_de_passe, rôle), Produits (id, nom, description, prix, stock, categorie_id), Catégories (id, nom, parent_id pour la hiérarchie), Commandes (id, user_id, statut, total, created_at), LignesCommande (commande_id, produit_id, quantité, prix_unitaire), Adresses (id, user_id, rue, ville). J'utiliserais une normalisation correcte, ajouterais des index sur les colonnes fréquemment interrogées (email, categorie_id, statut), et utiliserais des clés étrangères pour l'intégrité référentielle. Pour le marché marocain, j'ajouterais des champs pour les prix en MAD et les descriptions de produits en arabe/français.",
		tips: [
			"Start with the core entities and their relationships",
			"Mention normalization, indexes, and constraints",
			"Consider the business context — Moroccan market specifics",
		],
		tipsFr: [
			"Commencez par les entités principales et leurs relations",
			"Mentionnez la normalisation, les index et les contraintes",
			"Considérez le contexte business — spécificités du marché marocain",
		],
	},
	{
		id: qid("info"),
		question: "What is the difference between HTTP and HTTPS?",
		questionFr: "Quelle est la différence entre HTTP et HTTPS ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"HTTP transfers data in plain text, making it vulnerable to interception. HTTPS adds TLS/SSL encryption, ensuring data confidentiality, integrity, and authentication. HTTPS uses port 443 by default instead of port 80. With HTTPS, data is encrypted in transit, the server's identity is verified via certificates, and data integrity is guaranteed through message authentication codes. Today, HTTPS is mandatory for any website handling user data, and browsers warn users about non-HTTPS sites.",
		sampleAnswerFr:
			"HTTP transfère les données en texte clair, les rendant vulnérables à l'interception. HTTPS ajoute le chiffrement TLS/SSL, assurant la confidentialité, l'intégrité et l'authentification des données. HTTPS utilise le port 443 par défaut au lieu du port 80. Avec HTTPS, les données sont chiffrées en transit, l'identité du serveur est vérifiée via des certificats, et l'intégrité des données est garantie par des codes d'authentification de message. Aujourd'hui, HTTPS est obligatoire pour tout site web manipulant des données utilisateur.",
		tips: [
			"Explain the three security properties: confidentiality, integrity, authentication",
			"Mention TLS certificates and how they work (CA-signed vs self-signed)",
			"Note that HTTPS is now an SEO ranking factor",
		],
		tipsFr: [
			"Expliquez les trois propriétés de sécurité : confidentialité, intégrité, authentification",
			"Mentionnez les certificats TLS et comment ils fonctionnent (signés par CA vs auto-signés)",
			"Notez que HTTPS est maintenant un facteur de classement SEO",
		],
	},
	{
		id: qid("info"),
		question: "Explain what microservices architecture is and its advantages.",
		questionFr: "Expliquez ce qu'est l'architecture microservices et ses avantages.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"Microservices architecture decomposes an application into small, independent services that communicate via APIs. Each service handles a specific business capability, has its own database, and can be deployed independently. Advantages include independent scaling, technology diversity (each service can use the best language/framework), fault isolation, and easier team organization. However, it adds complexity in service discovery, distributed transactions, and monitoring. Monoliths are better for smaller teams and simpler applications.",
		sampleAnswerFr:
			"L'architecture microservices décompose une application en petits services indépendants qui communiquent via des API. Chaque service gère une capacité métier spécifique, a sa propre base de données et peut être déployé indépendamment. Les avantages incluent la mise à l'échelle indépendante, la diversité technologique (chaque service peut utiliser le meilleur langage/framework), l'isolation des pannes et une organisation d'équipe plus facile. Cependant, cela ajoute de la complexité dans la découverte de services, les transactions distribuées et le monitoring. Les monolithes sont meilleurs pour les petites équipes et les applications plus simples.",
		tips: [
			"Discuss both advantages AND disadvantages — show balanced judgment",
			"Mention when a monolith might be the better choice",
			"Reference tools like Kubernetes, API gateways, and service meshes",
		],
		tipsFr: [
			"Discutez des avantages ET des inconvénients — montrez un jugement équilibré",
			"Mentionnez quand un monolithe pourrait être le meilleur choix",
			"Référencez des outils comme Kubernetes, les API gateways et les service meshes",
		],
	},
	{
		id: qid("info"),
		question: "What is AWS and which services have you used?",
		questionFr: "Qu'est-ce qu'AWS et quels services avez-vous utilisés ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"AWS (Amazon Web Services) is the largest cloud computing platform. I have used EC2 for virtual servers, S3 for object storage, RDS for managed PostgreSQL databases, and Lambda for serverless functions. I also have experience with CloudFront for CDN, IAM for access management, and CloudWatch for monitoring. Many Moroccan companies like Jumia and Inwi are migrating to AWS for its scalability, and the planned Africa region will reduce latency for local applications.",
		sampleAnswerFr:
			"AWS (Amazon Web Services) est la plus grande plateforme de cloud computing. J'ai utilisé EC2 pour les serveurs virtuels, S3 pour le stockage d'objets, RDS pour les bases de données PostgreSQL managées, et Lambda pour les fonctions serverless. J'ai aussi de l'expérience avec CloudFront pour le CDN, IAM pour la gestion des accès, et CloudWatch pour le monitoring. Beaucoup d'entreprises marocaines comme Jumia et Inwi migrent vers AWS pour sa scalabilité, et la région Afrique prévue réduira la latence pour les applications locales.",
		tips: [
			"Only mention services you have actually used — they may ask follow-up questions",
			"Explain how different services work together in a typical architecture",
			"Mention the business benefits of cloud (cost optimization, scalability, reliability)",
		],
		tipsFr: [
			"Ne mentionnez que les services que vous avez réellement utilisés — ils peuvent poser des questions de suivi",
			"Expliquez comment les différents services fonctionnent ensemble dans une architecture typique",
			"Mentionnez les avantages business du cloud (optimisation des coûts, scalabilité, fiabilité)",
		],
	},
	{
		id: qid("info"),
		question: "Write a function to check if a string is a palindrome.",
		questionFr: "Écrivez une fonction pour vérifier si une chaîne est un palindrome.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"In Python: def is_palindrome(s): clean = s.lower().replace(' ', ''); return clean == clean[::-1]. In Java: public boolean isPalindrome(String s) { String clean = s.toLowerCase().replaceAll('[^a-z0-9]', ''); return clean.equals(new StringBuilder(clean).reverse().toString()); }. Both approaches normalize the string first (lowercase, remove spaces/special chars) then compare with its reverse. Time complexity is O(n), space complexity is O(n).",
		sampleAnswerFr:
			"En Python : def is_palindrome(s): clean = s.lower().replace(' ', ''); return clean == clean[::-1]. En Java : public boolean isPalindrome(String s) { String clean = s.toLowerCase().replaceAll('[^a-z0-9]', ''); return clean.equals(new StringBuilder(clean).reverse().toString()); }. Les deux approches normalisent d'abord la chaîne (minuscules, supprimer espaces/caractères spéciaux) puis comparent avec son inverse. Complexité temporelle O(n), spatiale O(n).",
		tips: [
			"Think about edge cases: empty strings, single characters, mixed case, spaces",
			"Discuss time and space complexity",
			"Offer to write the solution in the language the company uses",
		],
		tipsFr: [
			"Pensez aux cas limites : chaînes vides, caractères uniques, casse mixte, espaces",
			"Discutez de la complexité temporelle et spatiale",
			"Proposez d'écrire la solution dans le langage utilisé par l'entreprise",
		],
	},
	{
		id: qid("info"),
		question: "What is the difference between authentication and authorization?",
		questionFr: "Quelle est la différence entre l'authentification et l'autorisation ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"Authentication verifies WHO you are (identity) — typically through credentials like username/password, biometrics, or tokens. Authorization determines WHAT you can do (permissions) — checking if the authenticated user has access to a specific resource or action. For example, logging into a banking app is authentication; being allowed to transfer funds but not modify account settings is authorization. In implementation, JWT tokens often carry both identity and role/permission claims.",
		sampleAnswerFr:
			"L'authentification vérifie QUI vous êtes (identité) — typiquement via des identifiants comme nom d'utilisateur/mot de passe, biométrie ou tokens. L'autorisation détermine CE QUE vous pouvez faire (permissions) — vérifier si l'utilisateur authentifié a accès à une ressource ou action spécifique. Par exemple, se connecter à une app bancaire est de l'authentification ; être autorisé à faire des virements mais pas à modifier les paramètres du compte est de l'autorisation. En implémentation, les tokens JWT contiennent souvent l'identité et les claims de rôle/permission.",
		tips: [
			"Use a real-world analogy — airport: passport (authentication) vs boarding pass (authorization)",
			"Mention implementation technologies: OAuth2, JWT, RBAC, ABAC",
			"Show you understand how they work together in a system",
		],
		tipsFr: [
			"Utilisez une analogie du monde réel — aéroport : passeport (authentification) vs carte d'embarquement (autorisation)",
			"Mentionnez les technologies d'implémentation : OAuth2, JWT, RBAC, ABAC",
			"Montrez que vous comprenez comment ils fonctionnent ensemble dans un système",
		],
	},
	{
		id: qid("info"),
		question: "How would you deploy a Laravel application to production?",
		questionFr: "Comment déploieriez-vous une application Laravel en production ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"I would set up a server with Nginx as the web server and PHP-FPM for processing. Steps include: configuring the .env file with production database credentials, running 'composer install --no-dev' for production dependencies, running 'php artisan migrate' for database setup, setting proper file permissions, configuring Nginx virtual host to point to the public directory, enabling HTTPS with Let's Encrypt, setting up a queue worker with Supervisor, and configuring OPcache for PHP performance. I would also set up automated deployments using Laravel Forge or GitHub Actions.",
		sampleAnswerFr:
			"Je configurerais un serveur avec Nginx comme serveur web et PHP-FPM pour le traitement. Les étapes incluent : configurer le fichier .env avec les identifiants de base de données de production, exécuter 'composer install --no-dev' pour les dépendances de production, exécuter 'php artisan migrate' pour la configuration de la base de données, définir les permissions de fichiers correctes, configurer le virtual host Nginx pour pointer vers le répertoire public, activer HTTPS avec Let's Encrypt, mettre en place un worker de queue avec Supervisor, et configurer OPcache pour la performance PHP. Je mettrais aussi en place des déploiements automatisés avec Laravel Forge ou GitHub Actions.",
		tips: [
			"Cover the full deployment pipeline, not just 'upload files'",
			"Mention security considerations: .env, permissions, HTTPS",
			"Reference deployment tools: Laravel Forge, Envoyer, Docker, GitHub Actions",
		],
		tipsFr: [
			"Couvrez le pipeline complet de déploiement, pas juste 'uploader les fichiers'",
			"Mentionnez les considérations de sécurité : .env, permissions, HTTPS",
			"Référencez les outils de déploiement : Laravel Forge, Envoyer, Docker, GitHub Actions",
		],
	},
	{
		id: qid("info"),
		question: "What design patterns have you used in your projects?",
		questionFr: "Quels design patterns avez-vous utilisés dans vos projets ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"I have used several design patterns: Singleton for database connection management, Observer for event-driven communication between components, Factory for creating objects without specifying exact classes, Strategy for swapping algorithms at runtime (like different sorting or payment methods), and Repository for abstracting data access logic. In my Laravel project, I used the Repository pattern to separate business logic from Eloquent queries, making the code more testable.",
		sampleAnswerFr:
			"J'ai utilisé plusieurs design patterns : Singleton pour la gestion de connexion à la base de données, Observer pour la communication événementielle entre composants, Factory pour créer des objets sans spécifier les classes exactes, Strategy pour changer d'algorithmes à l'exécution (comme différentes méthodes de tri ou de paiement), et Repository pour abstraire la logique d'accès aux données. Dans mon projet Laravel, j'ai utilisé le pattern Repository pour séparer la logique métier des requêtes Eloquent, rendant le code plus testable.",
		tips: [
			"Only mention patterns you can explain in depth — they will ask follow-up questions",
			"For each pattern, explain WHEN and WHY you used it, not just what it is",
			"Show you understand that patterns are tools, not goals — avoid over-engineering",
		],
		tipsFr: [
			"Ne mentionnez que les patterns que vous pouvez expliquer en profondeur — ils poseront des questions de suivi",
			"Pour chaque pattern, expliquez QUAND et POURQUOI vous l'avez utilisé, pas juste ce que c'est",
			"Montrez que vous comprenez que les patterns sont des outils, pas des objectifs — évitez le sur-engineering",
		],
	},

	// =========================================================================
	// GENIE INDUSTRIEL (25+ questions)
	// =========================================================================
	{
		id: qid("indus"),
		question: "What is Lean Manufacturing and what are its core principles?",
		questionFr: "Qu'est-ce que le Lean Manufacturing et quels sont ses principes fondamentaux ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"Lean Manufacturing is a production methodology focused on eliminating waste (muda) while delivering maximum value to the customer. The five core principles are: define value from the customer's perspective, map the value stream to identify waste, create flow by eliminating bottlenecks, establish pull systems (produce only what is needed), and pursue perfection through continuous improvement (kaizen). In Moroccan automotive plants like Renault Tangier, Lean has reduced production waste by over 30%.",
		sampleAnswerFr:
			"Le Lean Manufacturing est une méthodologie de production axée sur l'élimination du gaspillage (muda) tout en offrant une valeur maximale au client. Les cinq principes fondamentaux sont : définir la valeur du point de vue du client, cartographier le flux de valeur pour identifier le gaspillage, créer le flux en éliminant les goulots d'étranglement, établir des systèmes en flux tiré (produire uniquement ce qui est nécessaire), et poursuivre la perfection par l'amélioration continue (kaizen). Dans les usines automobiles marocaines comme Renault Tanger, le Lean a réduit le gaspillage de production de plus de 30%.",
		tips: [
			"Name the 7+1 types of waste (TIMWOODS) to show depth",
			"Reference Moroccan industrial examples (Renault, PSA, Boeing)",
			"Show you understand Lean as a philosophy, not just a set of tools",
		],
		tipsFr: [
			"Nommez les 7+1 types de gaspillage (TIMWOODS) pour montrer votre profondeur",
			"Référencez des exemples industriels marocains (Renault, PSA, Boeing)",
			"Montrez que vous comprenez le Lean comme une philosophie, pas juste un ensemble d'outils",
		],
	},
	{
		id: qid("indus"),
		question: "Explain the DMAIC methodology in Six Sigma.",
		questionFr: "Expliquez la méthodologie DMAIC en Six Sigma.",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"DMAIC stands for Define, Measure, Analyze, Improve, Control. Define: identify the problem, project scope, and customer requirements using a project charter. Measure: collect baseline data on current process performance using statistical tools. Analyze: use root cause analysis (Ishikawa, 5 Whys, Pareto) to identify defect causes. Improve: design and implement solutions, run pilot tests. Control: establish monitoring systems to sustain improvements using control charts and SOPs. DMAIC is used for improving existing processes, while DMADV is for designing new ones.",
		sampleAnswerFr:
			"DMAIC signifie Définir, Mesurer, Analyser, Améliorer, Contrôler. Définir : identifier le problème, le périmètre du projet et les exigences client à l'aide d'une charte de projet. Mesurer : collecter des données de référence sur la performance actuelle du processus avec des outils statistiques. Analyser : utiliser l'analyse des causes racines (Ishikawa, 5 Pourquoi, Pareto) pour identifier les causes de défauts. Améliorer : concevoir et implémenter des solutions, faire des tests pilotes. Contrôler : établir des systèmes de surveillance pour maintenir les améliorations avec des cartes de contrôle et des SOP. DMAIC est utilisé pour améliorer des processus existants, tandis que DMADV est pour en concevoir de nouveaux.",
		tips: [
			"Give a concrete example of DMAIC applied to a manufacturing problem",
			"Mention statistical tools used in each phase",
			"Show you know the difference between DMAIC and DMADV",
		],
		tipsFr: [
			"Donnez un exemple concret du DMAIC appliqué à un problème de fabrication",
			"Mentionnez les outils statistiques utilisés à chaque phase",
			"Montrez que vous connaissez la différence entre DMAIC et DMADV",
		],
	},
	{
		id: qid("indus"),
		question: "What is SAP and how is it used in industrial settings?",
		questionFr: "Qu'est-ce que SAP et comment est-il utilisé dans les environnements industriels ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"SAP is an enterprise resource planning (ERP) system that integrates all business processes into one platform. In industrial settings, key modules include: MM (Materials Management) for procurement and inventory, PP (Production Planning) for manufacturing scheduling, QM (Quality Management) for quality control, PM (Plant Maintenance) for equipment maintenance, and SD (Sales and Distribution). Many Moroccan manufacturers like OCP, Lafarge, and ONCF use SAP to streamline operations and ensure traceability across the supply chain.",
		sampleAnswerFr:
			"SAP est un système de planification des ressources d'entreprise (ERP) qui intègre tous les processus métier dans une seule plateforme. Dans les environnements industriels, les modules clés incluent : MM (Gestion des Matériaux) pour les approvisionnements et les stocks, PP (Planification de Production) pour la planification de fabrication, QM (Gestion de la Qualité) pour le contrôle qualité, PM (Maintenance des Usines) pour la maintenance des équipements, et SD (Ventes et Distribution). De nombreux fabricants marocains comme OCP, Lafarge et ONCF utilisent SAP pour rationaliser les opérations et assurer la traçabilité dans la chaîne d'approvisionnement.",
		tips: [
			"Mention specific SAP modules relevant to the company's industry",
			"Reference Moroccan companies that use SAP",
			"If you have SAP certification or training, mention it prominently",
		],
		tipsFr: [
			"Mentionnez les modules SAP spécifiques pertinents pour l'industrie de l'entreprise",
			"Référencez des entreprises marocaines qui utilisent SAP",
			"Si vous avez une certification ou formation SAP, mentionnez-la en évidence",
		],
	},
	{
		id: qid("indus"),
		question: "Explain the Kaizen approach to continuous improvement.",
		questionFr: "Expliquez l'approche Kaizen de l'amélioration continue.",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"Kaizen means 'change for better' in Japanese. It is a philosophy of continuous, incremental improvement involving everyone from top management to floor workers. Key elements include: Kaizen events (focused improvement workshops of 3-5 days), Gemba walks (going to the actual workplace to observe), 5S methodology (Sort, Set in order, Shine, Standardize, Sustain), and visual management boards. Unlike large restructuring projects, Kaizen focuses on small daily improvements that compound over time.",
		sampleAnswerFr:
			"Kaizen signifie 'changement pour le mieux' en japonais. C'est une philosophie d'amélioration continue et incrémentale impliquant tout le monde, de la direction aux opérateurs. Les éléments clés incluent : les événements Kaizen (ateliers d'amélioration ciblés de 3-5 jours), les marches Gemba (aller sur le lieu de travail réel pour observer), la méthodologie 5S (Trier, Ranger, Nettoyer, Standardiser, Maintenir), et les tableaux de management visuel. Contrairement aux grands projets de restructuration, le Kaizen se concentre sur de petites améliorations quotidiennes qui se cumulent avec le temps.",
		tips: [
			"Explain the 5S methodology as it is often asked as a follow-up",
			"Give an example of a Kaizen improvement you have participated in or studied",
			"Emphasize that Kaizen involves EVERYONE, not just management",
		],
		tipsFr: [
			"Expliquez la méthodologie 5S car elle est souvent demandée en suivi",
			"Donnez un exemple d'une amélioration Kaizen à laquelle vous avez participé ou que vous avez étudiée",
			"Soulignez que le Kaizen implique TOUT LE MONDE, pas seulement la direction",
		],
	},
	{
		id: qid("indus"),
		question: "What is ISO 9001 and why is it important for manufacturing?",
		questionFr: "Qu'est-ce que l'ISO 9001 et pourquoi est-elle importante pour la fabrication ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"ISO 9001 is the international standard for quality management systems (QMS). It requires organizations to: establish a quality policy, define processes, monitor and measure performance, address risks and opportunities, and pursue continuous improvement. For manufacturing, ISO 9001 certification is often a prerequisite for doing business with international clients. In Morocco, certification by bodies like Bureau Veritas or SGS is common. The 2015 version introduced risk-based thinking and the process approach.",
		sampleAnswerFr:
			"L'ISO 9001 est la norme internationale pour les systèmes de management de la qualité (SMQ). Elle exige des organisations de : établir une politique qualité, définir les processus, surveiller et mesurer la performance, traiter les risques et opportunités, et poursuivre l'amélioration continue. Pour la fabrication, la certification ISO 9001 est souvent un prérequis pour travailler avec des clients internationaux. Au Maroc, la certification par des organismes comme Bureau Veritas ou SGS est courante. La version 2015 a introduit la pensée basée sur les risques et l'approche processus.",
		tips: [
			"Know the key clauses: context, leadership, planning, support, operation, evaluation, improvement",
			"Mention the difference between ISO 9001 (quality), 14001 (environment), and 45001 (safety)",
			"If the company is ISO certified, mention you are eager to contribute to maintaining compliance",
		],
		tipsFr: [
			"Connaissez les clauses clés : contexte, leadership, planification, support, opération, évaluation, amélioration",
			"Mentionnez la différence entre ISO 9001 (qualité), 14001 (environnement) et 45001 (sécurité)",
			"Si l'entreprise est certifiée ISO, mentionnez que vous êtes désireux de contribuer au maintien de la conformité",
		],
	},
	{
		id: qid("indus"),
		question: "How would you use SolidWorks to design a mechanical part?",
		questionFr: "Comment utiliseriez-vous SolidWorks pour concevoir une pièce mécanique ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"I would start by analyzing the functional requirements and constraints. In SolidWorks, I would create a new part, sketch the base profile on an appropriate plane, then use features like Extrude, Revolve, or Sweep to create the 3D geometry. I would add fillets, chamfers, and holes as needed. I would apply material properties, run stress analysis using SolidWorks Simulation, and create technical drawings with dimensions and tolerances per ISO standards. Finally, I would save the part in formats compatible with CNC machines (STEP, IGES).",
		sampleAnswerFr:
			"Je commencerais par analyser les exigences fonctionnelles et les contraintes. Dans SolidWorks, je créerais une nouvelle pièce, dessinerais le profil de base sur un plan approprié, puis utiliserais des fonctions comme Extrusion, Révolution ou Balayage pour créer la géométrie 3D. J'ajouterais des congés, chanfreins et perçages selon les besoins. J'appliquerais les propriétés matériaux, ferais une analyse de contraintes avec SolidWorks Simulation, et créerais des dessins techniques avec dimensions et tolérances selon les normes ISO. Enfin, je sauvegarderais la pièce dans des formats compatibles avec les machines CNC (STEP, IGES).",
		tips: [
			"Describe a structured design process, not just random features",
			"Mention simulation and analysis capabilities",
			"Reference file formats and manufacturing considerations",
		],
		tipsFr: [
			"Décrivez un processus de conception structuré, pas juste des fonctions au hasard",
			"Mentionnez les capacités de simulation et d'analyse",
			"Référencez les formats de fichiers et les considérations de fabrication",
		],
	},
	{
		id: qid("indus"),
		question: "What are the seven types of waste in Lean (muda)?",
		questionFr: "Quels sont les sept types de gaspillage en Lean (muda) ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"The seven wastes are remembered by the acronym TIMWOOD: Transportation (unnecessary movement of materials), Inventory (excess stock), Motion (unnecessary worker movement), Waiting (idle time), Overproduction (making more than needed), Overprocessing (doing more than customer requires), and Defects (rework and scrap). An eighth waste, often added, is unused talent (not leveraging workers' skills and ideas). In a Moroccan factory, I would start by mapping the value stream to identify which wastes are most significant.",
		sampleAnswerFr:
			"Les sept gaspillages sont mémorisés par l'acronyme TIMWOOD : Transport (mouvement inutile de matériaux), Inventaire (stock excessif), Mouvement (mouvement inutile des travailleurs), Attente (temps d'inactivité), Surproduction (produire plus que nécessaire), Surtraitement (faire plus que ce que le client exige), et Défauts (retouches et rebuts). Un huitième gaspillage, souvent ajouté, est le talent inexploité (ne pas tirer parti des compétences et idées des travailleurs). Dans une usine marocaine, je commencerais par cartographier le flux de valeur pour identifier quels gaspillages sont les plus significatifs.",
		tips: [
			"Use TIMWOOD or TIMWOODS (8th waste) as a memory aid",
			"Give a concrete example of each waste type from a manufacturing context",
			"Explain how value stream mapping helps identify these wastes",
		],
		tipsFr: [
			"Utilisez TIMWOOD ou TIMWOODS (8e gaspillage) comme aide-mémoire",
			"Donnez un exemple concret de chaque type de gaspillage dans un contexte de fabrication",
			"Expliquez comment la cartographie des flux de valeur aide à identifier ces gaspillages",
		],
	},
	{
		id: qid("indus"),
		question: "How would you conduct a root cause analysis for a production defect?",
		questionFr: "Comment mèneriez-vous une analyse de cause racine pour un défaut de production ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"I would use a systematic approach: first, contain the defect to prevent further impact. Then, gather data about the defect (when, where, frequency, conditions). I would use the 5 Whys technique to dig deeper, create an Ishikawa (fishbone) diagram to explore causes across 6M categories (Man, Machine, Method, Material, Measurement, Milieu). I would validate root causes with data, implement corrective actions, verify effectiveness, and update the FMEA. Finally, I would document findings and update SOPs to prevent recurrence.",
		sampleAnswerFr:
			"J'utiliserais une approche systématique : d'abord, contenir le défaut pour prévenir tout impact supplémentaire. Puis, collecter des données sur le défaut (quand, où, fréquence, conditions). J'utiliserais la technique des 5 Pourquoi pour creuser plus profond, créerais un diagramme d'Ishikawa (arête de poisson) pour explorer les causes dans les 6 catégories M (Main-d'œuvre, Machine, Méthode, Matériau, Mesure, Milieu). Je validerais les causes racines avec des données, implémenterais des actions correctives, vérifierais l'efficacité, et mettrais à jour l'AMDEC. Enfin, je documenterais les conclusions et mettrais à jour les procédures pour prévenir la récurrence.",
		tips: [
			"Show a structured methodology: contain, analyze, correct, prevent",
			"Name specific tools: 5 Whys, Ishikawa, Pareto, FMEA",
			"Emphasize data-driven decision making, not guesswork",
		],
		tipsFr: [
			"Montrez une méthodologie structurée : contenir, analyser, corriger, prévenir",
			"Nommez des outils spécifiques : 5 Pourquoi, Ishikawa, Pareto, AMDEC",
			"Mettez l'accent sur la prise de décision basée sur les données, pas les suppositions",
		],
	},
	{
		id: qid("indus"),
		question: "What is an FMEA and when would you use it?",
		questionFr: "Qu'est-ce qu'une AMDEC et quand l'utiliseriez-vous ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"FMEA (Failure Mode and Effects Analysis) is a proactive risk assessment tool that identifies potential failure modes, their effects, and causes. For each failure, you assess Severity (S), Occurrence (O), and Detection (D) on a 1-10 scale. The Risk Priority Number (RPN = S x O x D) helps prioritize which failures to address first. I would use FMEA during product design (Design FMEA) or process design (Process FMEA) to prevent problems before they occur, rather than reacting after failures.",
		sampleAnswerFr:
			"L'AMDEC (Analyse des Modes de Défaillance, de leurs Effets et de leur Criticité) est un outil proactif d'évaluation des risques qui identifie les modes de défaillance potentiels, leurs effets et leurs causes. Pour chaque défaillance, on évalue la Sévérité (S), l'Occurrence (O) et la Détection (D) sur une échelle de 1 à 10. L'Indice de Priorité du Risque (IPR = S x O x D) aide à prioriser les défaillances à traiter en premier. J'utiliserais l'AMDEC lors de la conception produit (AMDEC Produit) ou de la conception process (AMDEC Process) pour prévenir les problèmes avant qu'ils ne surviennent.",
		tips: [
			"Know the RPN formula and how to interpret it",
			"Explain the difference between Design FMEA and Process FMEA",
			"Mention that FMEA is required in automotive (IATF 16949) and aerospace (AS9100)",
		],
		tipsFr: [
			"Connaissez la formule IPR et comment l'interpréter",
			"Expliquez la différence entre AMDEC Produit et AMDEC Process",
			"Mentionnez que l'AMDEC est requise dans l'automobile (IATF 16949) et l'aérospatiale (AS9100)",
		],
	},
	{
		id: qid("indus"),
		question: "How do you read and create a technical drawing in AutoCAD?",
		questionFr: "Comment lisez-vous et créez-vous un dessin technique dans AutoCAD ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"Reading a technical drawing involves understanding the title block (material, scale, tolerances), orthographic projections (front, top, side views), section views for internal details, and dimension annotations with GD&T symbols. In AutoCAD, I create drawings by setting up layers for different elements (dimensions, center lines, hidden lines), using drawing tools (Line, Arc, Circle, Polyline), adding dimensions with the DIM command, and creating blocks for repeated elements. I follow ISO 128 standards for line types and ISO 8015 for dimensioning.",
		sampleAnswerFr:
			"Lire un dessin technique implique de comprendre le cartouche (matériau, échelle, tolérances), les projections orthogonales (vues de face, dessus, côté), les coupes pour les détails internes, et les annotations de cotation avec les symboles GD&T. Dans AutoCAD, je crée des dessins en configurant des calques pour différents éléments (cotations, lignes d'axe, lignes cachées), en utilisant les outils de dessin (Ligne, Arc, Cercle, Polyligne), en ajoutant des cotations avec la commande DIM, et en créant des blocs pour les éléments répétés. Je suis les normes ISO 128 pour les types de lignes et ISO 8015 pour la cotation.",
		tips: [
			"Demonstrate familiarity with ISO standards for technical drawings",
			"Mention specific AutoCAD commands and features you use regularly",
			"Show you can both read AND create technical drawings — both skills are needed",
		],
		tipsFr: [
			"Démontrez votre familiarité avec les normes ISO pour les dessins techniques",
			"Mentionnez des commandes et fonctions AutoCAD spécifiques que vous utilisez régulièrement",
			"Montrez que vous savez à la fois LIRE et CRÉER des dessins techniques — les deux compétences sont nécessaires",
		],
	},

	// =========================================================================
	// GENIE CIVIL (25+ questions)
	// =========================================================================
	{
		id: qid("civil"),
		question: "Explain the Moroccan seismic code RPS 2011 and its impact on structural design.",
		questionFr: "Expliquez le code sismique marocain RPS 2011 et son impact sur la conception structurale.",
		type: "technical",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"RPS 2011 (Règlement de Construction Parasismique) classifies Morocco into five seismic zones, with zone 5 (Al Hoceima region) being the most severe. It defines design ground acceleration values, soil categories (S1-S4), building importance classes, and ductility requirements. For structural design, RPS 2011 mandates: lateral force resistance systems, minimum reinforcement ratios, beam-column joint detailing, and drift limits. In ETABS, I apply seismic loads per RPS 2011 using response spectrum analysis and verify that inter-story drift stays within the 1% limit for ductile frames.",
		sampleAnswerFr:
			"Le RPS 2011 (Règlement de Construction Parasismique) classe le Maroc en cinq zones sismiques, la zone 5 (région d'Al Hoceima) étant la plus sévère. Il définit les valeurs d'accélération du sol de calcul, les catégories de sol (S1-S4), les classes d'importance des bâtiments et les exigences de ductilité. Pour la conception structurale, le RPS 2011 impose : des systèmes de résistance aux forces latérales, des ratios minimaux d'armature, des détails de nœuds poteau-poutre, et des limites de déplacement. Dans ETABS, j'applique les charges sismiques selon le RPS 2011 en utilisant l'analyse par spectre de réponse et vérifie que le déplacement inter-étage reste dans la limite de 1% pour les portiques ductiles.",
		tips: [
			"Know the seismic zones of Morocco — especially the cities in each zone",
			"Explain how you apply RPS 2011 in software like ETABS or Robot",
			"Mention specific requirements: drift limits, reinforcement ratios, ductility classes",
		],
		tipsFr: [
			"Connaissez les zones sismiques du Maroc — surtout les villes dans chaque zone",
			"Expliquez comment vous appliquez le RPS 2011 dans des logiciels comme ETABS ou Robot",
			"Mentionnez les exigences spécifiques : limites de déplacement, ratios d'armature, classes de ductilité",
		],
	},
	{
		id: qid("civil"),
		question: "What is the difference between ETABS and Robot Structural Analysis?",
		questionFr: "Quelle est la différence entre ETABS et Robot Structural Analysis ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"ETABS is specialized for building structures — it excels at multi-story buildings with features like automatic floor diaphragms, built-in seismic analysis (response spectrum, time history), and code-based concrete/steel design. Robot Structural Analysis is more general-purpose, handling buildings, bridges, and industrial structures. Robot integrates better with the Autodesk ecosystem (Revit, AutoCAD). In Moroccan practice, ETABS is more common for residential and commercial buildings, while Robot is preferred for complex steel structures and industrial facilities.",
		sampleAnswerFr:
			"ETABS est spécialisé pour les structures de bâtiment — il excelle dans les immeubles à plusieurs étages avec des fonctionnalités comme les diaphragmes automatiques de plancher, l'analyse sismique intégrée (spectre de réponse, historique temporel), et le dimensionnement par code béton/acier. Robot Structural Analysis est plus polyvalent, gérant bâtiments, ponts et structures industrielles. Robot s'intègre mieux avec l'écosystème Autodesk (Revit, AutoCAD). Dans la pratique marocaine, ETABS est plus courant pour les bâtiments résidentiels et commerciaux, tandis que Robot est préféré pour les structures métalliques complexes et les installations industrielles.",
		tips: [
			"Show you have hands-on experience with at least one of these tools",
			"Explain which tool you would choose for different project types",
			"Mention local Moroccan engineering practices and preferences",
		],
		tipsFr: [
			"Montrez que vous avez une expérience pratique avec au moins un de ces outils",
			"Expliquez quel outil vous choisiriez pour différents types de projets",
			"Mentionnez les pratiques et préférences d'ingénierie locales marocaines",
		],
	},
	{
		id: qid("civil"),
		question: "How do you design reinforced concrete beams according to Moroccan standards?",
		questionFr: "Comment dimensionnez-vous des poutres en béton armé selon les normes marocaines ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "hard",
		sampleAnswer:
			"I follow the BAEL 91 rules (widely used in Morocco alongside Eurocode 2). First, I determine the loading (dead load, live load, and combinations per Moroccan NM standards). I calculate the bending moment and shear force diagrams. For flexural design, I calculate the reduced moment mu, determine if the section is singly or doubly reinforced, and compute the required steel area. For shear, I verify the concrete's resistance and design stirrups. I check deflection limits (L/250 for total, L/500 for appearance) and crack width limits. In ETABS, I verify the design and extract reinforcement schedules.",
		sampleAnswerFr:
			"Je suis les règles BAEL 91 (largement utilisées au Maroc avec l'Eurocode 2). D'abord, je détermine les charges (charges permanentes, charges d'exploitation, et combinaisons selon les normes NM marocaines). Je calcule les diagrammes de moment fléchissant et d'effort tranchant. Pour le dimensionnement en flexion, je calcule le moment réduit mu, détermine si la section est simplement ou doublement armée, et calcule la section d'acier requise. Pour le cisaillement, je vérifie la résistance du béton et dimensionne les cadres. Je vérifie les limites de flèche (L/250 pour totale, L/500 pour apparence) et les limites d'ouverture de fissures. Dans ETABS, je vérifie le dimensionnement et extrais les plans de ferraillage.",
		tips: [
			"Know both BAEL 91 and Eurocode 2 — Morocco is transitioning between them",
			"Show you can do manual calculations, not just rely on software",
			"Mention specific Moroccan material standards for concrete and steel (NM standards)",
		],
		tipsFr: [
			"Connaissez à la fois le BAEL 91 et l'Eurocode 2 — le Maroc est en transition entre les deux",
			"Montrez que vous pouvez faire des calculs manuels, pas seulement vous fier aux logiciels",
			"Mentionnez les normes marocaines spécifiques pour le béton et l'acier (normes NM)",
		],
	},
	{
		id: qid("civil"),
		question: "What is BIM and how is Revit used in civil engineering projects?",
		questionFr: "Qu'est-ce que le BIM et comment Revit est-il utilisé dans les projets de génie civil ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"BIM (Building Information Modeling) is a process of creating and managing digital representations of physical and functional characteristics of buildings. Revit is the leading BIM software for design, documentation, and collaboration. In civil engineering, Revit allows 3D structural modeling with parametric elements, automatic generation of plans, sections, and details, clash detection between disciplines (structural vs MEP), quantity takeoff for cost estimation, and 4D scheduling. In Morocco, BIM adoption is growing, especially in large projects like Noor solar complex and Mohammed VI Tower.",
		sampleAnswerFr:
			"Le BIM (Building Information Modeling) est un processus de création et de gestion de représentations numériques des caractéristiques physiques et fonctionnelles des bâtiments. Revit est le logiciel BIM leader pour la conception, la documentation et la collaboration. En génie civil, Revit permet la modélisation structurale 3D avec des éléments paramétriques, la génération automatique de plans, coupes et détails, la détection de conflits entre disciplines (structure vs CVC), le relevé de quantités pour l'estimation des coûts, et la planification 4D. Au Maroc, l'adoption du BIM progresse, surtout dans les grands projets comme le complexe solaire Noor et la Tour Mohammed VI.",
		tips: [
			"Explain BIM dimensions: 3D (model), 4D (time), 5D (cost), 6D (sustainability), 7D (facility management)",
			"Show awareness of BIM standards (ISO 19650) and LOD levels",
			"Mention specific Moroccan projects that use BIM",
		],
		tipsFr: [
			"Expliquez les dimensions du BIM : 3D (modèle), 4D (temps), 5D (coût), 6D (durabilité), 7D (gestion de patrimoine)",
			"Montrez votre connaissance des normes BIM (ISO 19650) et des niveaux LOD",
			"Mentionnez des projets marocains spécifiques qui utilisent le BIM",
		],
	},
	{
		id: qid("civil"),
		question: "Describe the concrete mix design process for a construction project.",
		questionFr: "Décrivez le processus de formulation du béton pour un projet de construction.",
		type: "technical",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"The mix design process starts with defining target properties: compressive strength class (e.g., C25/30), workability (slump class), exposure class (per NM or Eurocode), and maximum aggregate size. Using methods like Dreux-Gorisse (common in Morocco) or ACI 211, I determine the water/cement ratio, cement content (minimum per exposure class), aggregate proportions, and admixture dosages. I then prepare trial mixes, test slump and air content on fresh concrete, and cure specimens for 7-day and 28-day compressive strength testing. The mix is adjusted until it meets all requirements with a suitable margin.",
		sampleAnswerFr:
			"Le processus de formulation commence par la définition des propriétés cibles : classe de résistance à la compression (ex. C25/30), ouvrabilité (classe d'affaissement), classe d'exposition (selon NM ou Eurocode), et taille maximale des granulats. En utilisant des méthodes comme Dreux-Gorisse (courante au Maroc) ou ACI 211, je détermine le rapport eau/ciment, le dosage en ciment (minimum par classe d'exposition), les proportions de granulats, et les dosages d'adjuvants. Je prépare ensuite des mélanges d'essai, teste l'affaissement et la teneur en air sur le béton frais, et conserve des éprouvettes pour des essais de résistance à la compression à 7 et 28 jours. Le mélange est ajusté jusqu'à ce qu'il réponde à toutes les exigences avec une marge suffisante.",
		tips: [
			"Name the specific mix design method you learned (Dreux-Gorisse is most common in Morocco)",
			"Mention the tests performed on fresh and hardened concrete",
			"Show awareness of Moroccan cement types (CPJ 45, CPJ 55) and aggregate sources",
		],
		tipsFr: [
			"Nommez la méthode de formulation spécifique que vous avez apprise (Dreux-Gorisse est la plus courante au Maroc)",
			"Mentionnez les essais effectués sur le béton frais et durci",
			"Montrez votre connaissance des types de ciment marocains (CPJ 45, CPJ 55) et des sources de granulats",
		],
	},
	{
		id: qid("civil"),
		question: "What factors affect foundation design in Morocco?",
		questionFr: "Quels facteurs influencent la conception des fondations au Maroc ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"Key factors include: soil bearing capacity (determined by geotechnical investigation), groundwater level, seismic zone per RPS 2011, building loads and structural system, adjacent structures and excavation depth, expansive soils (common in regions like Fes and Meknes), and local building regulations. In Morocco, shallow foundations (isolated and strip footings) are common for low-rise buildings, while deep foundations (piles) are used in poor soil conditions or for high-rise buildings. The geotechnical report (usually by a lab like LPEE) is essential for foundation design.",
		sampleAnswerFr:
			"Les facteurs clés incluent : la capacité portante du sol (déterminée par l'étude géotechnique), le niveau de la nappe phréatique, la zone sismique selon le RPS 2011, les charges du bâtiment et le système structural, les structures adjacentes et la profondeur de fouille, les sols expansifs (courants dans des régions comme Fès et Meknès), et les réglementations locales de construction. Au Maroc, les fondations superficielles (semelles isolées et filantes) sont courantes pour les bâtiments bas, tandis que les fondations profondes (pieux) sont utilisées dans les sols médiocres ou pour les immeubles de grande hauteur. Le rapport géotechnique (généralement par un laboratoire comme le LPEE) est essentiel pour la conception des fondations.",
		tips: [
			"Mention the LPEE (Laboratoire Public d'Essais et d'Études) — the main Moroccan geotechnical lab",
			"Reference specific Moroccan soil challenges (expansive soils in Fes, sandy soils in coastal cities)",
			"Show understanding of both shallow and deep foundation types",
		],
		tipsFr: [
			"Mentionnez le LPEE (Laboratoire Public d'Essais et d'Études) — le principal laboratoire géotechnique marocain",
			"Référencez des défis spécifiques des sols marocains (sols expansifs à Fès, sols sableux dans les villes côtières)",
			"Montrez votre compréhension des fondations superficielles et profondes",
		],
	},
	{
		id: qid("civil"),
		question: "How do you ensure quality control on a construction site?",
		questionFr: "Comment assurez-vous le contrôle qualité sur un chantier de construction ?",
		type: "situational",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"Quality control on site involves several key practices: verifying materials upon delivery (cement certificates, steel mill certificates, aggregate tests), performing concrete slump tests before each pour and taking cube specimens for strength testing, checking reinforcement placement against shop drawings before concrete pours, verifying formwork alignment and dimensions, conducting compaction tests for earthworks (Proctor test), and maintaining a non-conformance log. I would also coordinate with the control bureau (Bureau de Contrôle) required by Moroccan regulations for all structural works.",
		sampleAnswerFr:
			"Le contrôle qualité sur chantier implique plusieurs pratiques clés : vérifier les matériaux à la livraison (certificats de ciment, certificats d'aciérie, essais de granulats), effectuer des essais d'affaissement du béton avant chaque coulage et prélever des éprouvettes cubiques pour les essais de résistance, vérifier le placement des armatures par rapport aux plans d'exécution avant les coulages, vérifier l'alignement et les dimensions du coffrage, effectuer des essais de compactage pour les terrassements (essai Proctor), et maintenir un registre de non-conformités. Je coordonnerais aussi avec le Bureau de Contrôle requis par la réglementation marocaine pour tous les travaux structuraux.",
		tips: [
			"Show knowledge of Moroccan construction regulations and the role of Bureau de Contrôle",
			"Name specific tests: slump, cube strength, Proctor, rebar cover check",
			"Demonstrate a systematic approach to quality, not ad hoc checking",
		],
		tipsFr: [
			"Montrez votre connaissance des réglementations marocaines de construction et du rôle du Bureau de Contrôle",
			"Nommez des essais spécifiques : affaissement, résistance cubique, Proctor, vérification d'enrobage",
			"Démontrez une approche systématique de la qualité, pas des vérifications ad hoc",
		],
	},

	// =========================================================================
	// GENIE ELECTRIQUE (20+ questions)
	// =========================================================================
	{
		id: qid("elec"),
		question: "What is a PLC and how is it used in industrial automation?",
		questionFr: "Qu'est-ce qu'un automate programmable (PLC) et comment est-il utilisé en automatisation industrielle ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "easy",
		sampleAnswer:
			"A PLC (Programmable Logic Controller) is an industrial computer designed to control manufacturing processes. It reads inputs from sensors (temperature, pressure, proximity), executes a control program, and drives outputs (motors, valves, actuators). PLCs are programmed using IEC 61131-3 languages: Ladder Diagram (LD), Function Block Diagram (FBD), Structured Text (ST), Instruction List (IL), and Sequential Function Chart (SFC). Major brands used in Morocco include Siemens (S7-1200/1500), Schneider (Modicon), and Allen-Bradley. In Moroccan factories, PLCs control everything from bottling lines to cement kilns.",
		sampleAnswerFr:
			"Un automate programmable (PLC) est un ordinateur industriel conçu pour contrôler les processus de fabrication. Il lit les entrées des capteurs (température, pression, proximité), exécute un programme de contrôle, et pilote les sorties (moteurs, vannes, actionneurs). Les PLC sont programmés en utilisant les langages IEC 61131-3 : Ladder Diagram (LD), Function Block Diagram (FBD), Structured Text (ST), Instruction List (IL), et Sequential Function Chart (SFC). Les principales marques utilisées au Maroc incluent Siemens (S7-1200/1500), Schneider (Modicon) et Allen-Bradley. Dans les usines marocaines, les PLC contrôlent tout, des lignes d'embouteillage aux fours à ciment.",
		tips: [
			"Name the IEC 61131-3 programming languages and which ones you know",
			"Mention specific PLC brands and models you have programmed",
			"Give a concrete example of a PLC application in a Moroccan industrial context",
		],
		tipsFr: [
			"Nommez les langages de programmation IEC 61131-3 et lesquels vous connaissez",
			"Mentionnez les marques et modèles de PLC spécifiques que vous avez programmés",
			"Donnez un exemple concret d'application PLC dans un contexte industriel marocain",
		],
	},
	{
		id: qid("elec"),
		question: "Explain how a SCADA system works in an industrial plant.",
		questionFr: "Expliquez comment un système SCADA fonctionne dans une usine industrielle.",
		type: "technical",
		field: "génie-électrique",
		difficulty: "medium",
		sampleAnswer:
			"SCADA (Supervisory Control and Data Acquisition) is a system that monitors and controls industrial processes in real-time. It consists of: field instruments (sensors and actuators), Remote Terminal Units (RTUs) or PLCs that collect data, a communication network (Ethernet, Modbus, Profibus), and a central SCADA server with HMI (Human-Machine Interface) for operators. SCADA provides real-time visualization, alarm management, historical data logging, and remote control capabilities. In Morocco, ONEE uses SCADA for electrical grid management and OCP for phosphate processing plants.",
		sampleAnswerFr:
			"SCADA (Supervisory Control and Data Acquisition) est un système qui surveille et contrôle les processus industriels en temps réel. Il se compose de : instruments de terrain (capteurs et actionneurs), des unités terminales distantes (RTU) ou des PLC qui collectent les données, un réseau de communication (Ethernet, Modbus, Profibus), et un serveur SCADA central avec IHM (Interface Homme-Machine) pour les opérateurs. Le SCADA fournit la visualisation en temps réel, la gestion des alarmes, l'historique des données et les capacités de contrôle à distance. Au Maroc, l'ONEE utilise le SCADA pour la gestion du réseau électrique et l'OCP pour les usines de traitement du phosphate.",
		tips: [
			"Explain the architecture: field level, control level, supervision level",
			"Mention communication protocols: Modbus, Profibus, OPC-UA",
			"Reference Moroccan companies that use SCADA systems",
		],
		tipsFr: [
			"Expliquez l'architecture : niveau terrain, niveau contrôle, niveau supervision",
			"Mentionnez les protocoles de communication : Modbus, Profibus, OPC-UA",
			"Référencez des entreprises marocaines qui utilisent des systèmes SCADA",
		],
	},
	{
		id: qid("elec"),
		question: "What are the main types of renewable energy used in Morocco?",
		questionFr: "Quels sont les principaux types d'énergie renouvelable utilisés au Maroc ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "easy",
		sampleAnswer:
			"Morocco has an ambitious renewable energy strategy targeting 52% of installed capacity by 2030. The main types are: Solar (Noor-Ouarzazate complex is one of the world's largest concentrated solar power plants at 580 MW), Wind (Tarfaya wind farm at 301 MW, Midelt projects), and Hydroelectric (existing dams across the country). Morocco has also started exploring green hydrogen at the port of Jorf Lasfar. The Moroccan Agency for Solar Energy (MASEN) and ONEE manage most large-scale projects. This creates excellent career opportunities for electrical engineers.",
		sampleAnswerFr:
			"Le Maroc a une stratégie ambitieuse d'énergie renouvelable visant 52% de la capacité installée d'ici 2030. Les principaux types sont : Solaire (le complexe Noor-Ouarzazate est l'une des plus grandes centrales solaires à concentration du monde à 580 MW), Éolien (parc éolien de Tarfaya à 301 MW, projets de Midelt), et Hydroélectrique (barrages existants à travers le pays). Le Maroc a aussi commencé à explorer l'hydrogène vert au port de Jorf Lasfar. L'Agence Marocaine pour l'Énergie Solaire (MASEN) et l'ONEE gèrent la plupart des projets à grande échelle. Cela crée d'excellentes opportunités de carrière pour les ingénieurs électriques.",
		tips: [
			"Know the key Moroccan renewable energy projects and their capacities",
			"Mention Morocco's renewable energy targets (52% by 2030)",
			"Show enthusiasm for the sector — it is a key growth area for engineers",
		],
		tipsFr: [
			"Connaissez les projets clés d'énergie renouvelable marocains et leurs capacités",
			"Mentionnez les objectifs du Maroc en énergie renouvelable (52% d'ici 2030)",
			"Montrez de l'enthousiasme pour le secteur — c'est un domaine de croissance clé pour les ingénieurs",
		],
	},
	{
		id: qid("elec"),
		question: "How would you use Matlab/Simulink for an electrical system simulation?",
		questionFr: "Comment utiliseriez-vous Matlab/Simulink pour la simulation d'un système électrique ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "medium",
		sampleAnswer:
			"In Matlab/Simulink, I would model an electrical system using the Simscape Electrical library. For example, to simulate a photovoltaic system, I would create blocks for: the PV panel (using the Solar Cell block with irradiance and temperature parameters), a DC-DC converter (boost converter with PWM control), an MPPT algorithm (implemented in a Matlab Function block using Perturb & Observe), an inverter, and the grid connection. I would run time-domain simulations to analyze system behavior under varying conditions and use Scope blocks to visualize voltages, currents, and power output.",
		sampleAnswerFr:
			"Dans Matlab/Simulink, je modéliserais un système électrique en utilisant la bibliothèque Simscape Electrical. Par exemple, pour simuler un système photovoltaïque, je créerais des blocs pour : le panneau PV (utilisant le bloc Solar Cell avec les paramètres d'irradiance et de température), un convertisseur DC-DC (convertisseur boost avec contrôle PWM), un algorithme MPPT (implémenté dans un bloc Matlab Function utilisant Perturb & Observe), un onduleur, et la connexion au réseau. Je lancerais des simulations temporelles pour analyser le comportement du système dans différentes conditions et utiliserais des blocs Scope pour visualiser tensions, courants et puissance de sortie.",
		tips: [
			"Use a specific example relevant to the job (PV system, motor drive, power grid)",
			"Name the specific Simulink libraries and blocks you use",
			"Mention validation: comparing simulation results with theoretical calculations",
		],
		tipsFr: [
			"Utilisez un exemple spécifique pertinent pour le poste (système PV, variateur de moteur, réseau électrique)",
			"Nommez les bibliothèques et blocs Simulink spécifiques que vous utilisez",
			"Mentionnez la validation : comparaison des résultats de simulation avec les calculs théoriques",
		],
	},
	{
		id: qid("elec"),
		question: "What is a smart grid and how does it differ from the traditional electrical grid?",
		questionFr: "Qu'est-ce qu'un smart grid et en quoi diffère-t-il du réseau électrique traditionnel ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "medium",
		sampleAnswer:
			"A smart grid integrates digital communication technology into the electrical grid for two-way communication between utilities and consumers. Unlike the traditional grid (centralized, one-way power flow, limited monitoring), a smart grid features: advanced metering infrastructure (smart meters), distributed generation integration (solar, wind), real-time monitoring and self-healing capabilities, demand response programs, and energy storage integration. Morocco's ONEE is implementing smart grid technologies in several cities to reduce technical losses, currently at about 6%, and integrate the growing share of renewable energy.",
		sampleAnswerFr:
			"Un smart grid intègre la technologie de communication numérique dans le réseau électrique pour une communication bidirectionnelle entre les fournisseurs et les consommateurs. Contrairement au réseau traditionnel (centralisé, flux d'énergie unidirectionnel, monitoring limité), un smart grid offre : une infrastructure de comptage avancée (compteurs intelligents), l'intégration de la production décentralisée (solaire, éolien), la surveillance en temps réel et les capacités d'auto-guérison, les programmes de réponse à la demande, et l'intégration du stockage d'énergie. L'ONEE au Maroc implémente des technologies smart grid dans plusieurs villes pour réduire les pertes techniques, actuellement à environ 6%, et intégrer la part croissante d'énergie renouvelable.",
		tips: [
			"Compare traditional vs smart grid features point by point",
			"Mention Morocco's specific smart grid initiatives and ONEE's role",
			"Discuss how renewable energy integration drives the need for smart grids",
		],
		tipsFr: [
			"Comparez les caractéristiques du réseau traditionnel vs smart grid point par point",
			"Mentionnez les initiatives spécifiques de smart grid au Maroc et le rôle de l'ONEE",
			"Discutez de comment l'intégration des énergies renouvelables nécessite les smart grids",
		],
	},
	{
		id: qid("elec"),
		question: "How do you size an electrical installation for a commercial building?",
		questionFr: "Comment dimensionnez-vous une installation électrique pour un bâtiment commercial ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "hard",
		sampleAnswer:
			"I follow the NF C 15-100 standard (used in Morocco). Steps include: calculate the total power demand by inventorying all loads (lighting, HVAC, equipment) with diversity factors, determine the required transformer capacity (kVA), design the main distribution board with proper circuit breakers, size cables based on current capacity (ampacity tables), voltage drop limits (3% for lighting, 5% for motors), and short-circuit protection. I use Ecodial or Caneco software for calculations and verification. I also ensure compliance with Moroccan fire safety regulations and ONEE connection requirements.",
		sampleAnswerFr:
			"Je suis la norme NF C 15-100 (utilisée au Maroc). Les étapes incluent : calculer la demande de puissance totale en inventoriant toutes les charges (éclairage, CVC, équipements) avec les coefficients de simultanéité, déterminer la capacité requise du transformateur (kVA), concevoir le tableau de distribution principal avec des disjoncteurs appropriés, dimensionner les câbles en fonction de la capacité de courant (tables d'ampacité), les limites de chute de tension (3% pour l'éclairage, 5% pour les moteurs), et la protection contre les courts-circuits. J'utilise le logiciel Ecodial ou Caneco pour les calculs et la vérification. J'assure aussi la conformité avec les réglementations marocaines de sécurité incendie et les exigences de raccordement de l'ONEE.",
		tips: [
			"Reference the NF C 15-100 standard — it is the basis for electrical design in Morocco",
			"Mention software tools you use for electrical calculations",
			"Show knowledge of Moroccan-specific requirements (ONEE connection, fire regulations)",
		],
		tipsFr: [
			"Référencez la norme NF C 15-100 — c'est la base de la conception électrique au Maroc",
			"Mentionnez les outils logiciels que vous utilisez pour les calculs électriques",
			"Montrez votre connaissance des exigences spécifiques au Maroc (raccordement ONEE, réglementations incendie)",
		],
	},

	// =========================================================================
	// GENIE MECANIQUE (15+ questions)
	// =========================================================================
	{
		id: qid("meca"),
		question: "What is the difference between stress and strain in materials?",
		questionFr: "Quelle est la différence entre contrainte et déformation dans les matériaux ?",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "easy",
		sampleAnswer:
			"Stress (sigma) is the internal force per unit area within a material, measured in Pascals (Pa) or MPa. Strain (epsilon) is the deformation per unit length, a dimensionless ratio. In the elastic region, they are related by Hooke's law: sigma = E * epsilon, where E is Young's modulus. For steel commonly used in Moroccan construction (S235, S355), E is approximately 210 GPa. Beyond the yield point, the material enters plastic deformation and Hooke's law no longer applies. Understanding this relationship is critical for structural design and failure analysis.",
		sampleAnswerFr:
			"La contrainte (sigma) est la force interne par unité de surface dans un matériau, mesurée en Pascals (Pa) ou MPa. La déformation (epsilon) est la déformation par unité de longueur, un rapport sans dimension. Dans le domaine élastique, elles sont liées par la loi de Hooke : sigma = E * epsilon, où E est le module de Young. Pour l'acier couramment utilisé dans la construction marocaine (S235, S355), E est approximativement 210 GPa. Au-delà de la limite d'élasticité, le matériau entre en déformation plastique et la loi de Hooke ne s'applique plus. Comprendre cette relation est critique pour la conception structurale et l'analyse de défaillance.",
		tips: [
			"Draw the stress-strain curve if possible — it shows deep understanding",
			"Mention specific material properties relevant to the industry",
			"Show you understand the practical implications for design and safety",
		],
		tipsFr: [
			"Dessinez la courbe contrainte-déformation si possible — cela montre une compréhension approfondie",
			"Mentionnez les propriétés matériaux spécifiques pertinentes pour l'industrie",
			"Montrez que vous comprenez les implications pratiques pour la conception et la sécurité",
		],
	},
	{
		id: qid("meca"),
		question: "How would you select the appropriate material for a mechanical component?",
		questionFr: "Comment sélectionneriez-vous le matériau approprié pour une pièce mécanique ?",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "medium",
		sampleAnswer:
			"Material selection follows a systematic approach considering: functional requirements (strength, stiffness, wear resistance, corrosion resistance), operating conditions (temperature, humidity, chemical exposure), manufacturing constraints (machinability, weldability, availability in Morocco), cost (material cost, processing cost, lifecycle cost), and weight requirements. I would use Ashby charts to narrow down material families, then consult supplier catalogs for specific grades available locally. For example, for a component in a phosphate processing plant (OCP), I would prioritize corrosion resistance and choose stainless steel or specialized coatings.",
		sampleAnswerFr:
			"La sélection des matériaux suit une approche systématique considérant : les exigences fonctionnelles (résistance, rigidité, résistance à l'usure, résistance à la corrosion), les conditions de fonctionnement (température, humidité, exposition chimique), les contraintes de fabrication (usinabilité, soudabilité, disponibilité au Maroc), le coût (coût matériau, coût de transformation, coût du cycle de vie), et les exigences de poids. J'utiliserais les diagrammes d'Ashby pour réduire les familles de matériaux, puis consulterais les catalogues des fournisseurs pour les grades spécifiques disponibles localement. Par exemple, pour une pièce dans une usine de traitement de phosphate (OCP), je prioriserais la résistance à la corrosion et choisirais l'acier inoxydable ou des revêtements spécialisés.",
		tips: [
			"Show a structured selection methodology, not random choice",
			"Consider local availability and cost in Morocco",
			"Reference Ashby charts and material databases",
		],
		tipsFr: [
			"Montrez une méthodologie de sélection structurée, pas un choix aléatoire",
			"Considérez la disponibilité locale et le coût au Maroc",
			"Référencez les diagrammes d'Ashby et les bases de données matériaux",
		],
	},
	{
		id: qid("meca"),
		question: "Explain the principle of finite element analysis (FEA).",
		questionFr: "Expliquez le principe de l'analyse par éléments finis (FEA).",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "hard",
		sampleAnswer:
			"FEA divides a complex structure into many small elements (mesh) connected at nodes. For each element, the behavior is described by simple equations (shape functions). The assembly of all element equations forms a global system of equations [K]{u} = {F}, where K is the stiffness matrix, u is the displacement vector, and F is the force vector. Solving this system gives displacements, from which stresses and strains are derived. I use SolidWorks Simulation or ANSYS for FEA, starting with mesh convergence studies to ensure result accuracy. FEA is essential for validating designs before prototyping.",
		sampleAnswerFr:
			"L'analyse par éléments finis divise une structure complexe en de nombreux petits éléments (maillage) connectés aux nœuds. Pour chaque élément, le comportement est décrit par des équations simples (fonctions de forme). L'assemblage de toutes les équations élémentaires forme un système global d'équations [K]{u} = {F}, où K est la matrice de rigidité, u le vecteur de déplacements, et F le vecteur de forces. La résolution de ce système donne les déplacements, à partir desquels les contraintes et déformations sont dérivées. J'utilise SolidWorks Simulation ou ANSYS pour la FEA, en commençant par des études de convergence de maillage pour assurer la précision des résultats. La FEA est essentielle pour valider les conceptions avant le prototypage.",
		tips: [
			"Explain the concept simply first, then add technical depth",
			"Mention mesh quality and convergence — it shows practical experience",
			"Name the FEA software you have used and what types of analyses",
		],
		tipsFr: [
			"Expliquez le concept simplement d'abord, puis ajoutez de la profondeur technique",
			"Mentionnez la qualité du maillage et la convergence — cela montre l'expérience pratique",
			"Nommez les logiciels FEA que vous avez utilisés et les types d'analyses",
		],
	},

	// =========================================================================
	// MANAGEMENT (20+ questions)
	// =========================================================================
	{
		id: qid("mgmt"),
		question: "How would you handle a project that is falling behind schedule?",
		questionFr: "Comment géreriez-vous un projet qui prend du retard ?",
		type: "situational",
		field: "management",
		difficulty: "medium",
		sampleAnswer:
			"First, I would identify the root causes of the delay through analysis of the critical path and team meetings. Then I would assess options: fast-tracking (parallel activities), crashing (adding resources to critical tasks), scope reduction (with stakeholder approval), or schedule compression. I would communicate transparently with stakeholders about the situation and proposed recovery plan. I would implement the chosen approach, increase monitoring frequency, and conduct daily stand-ups to track progress. Prevention is key — early warning indicators and buffer management help avoid delays in the first place.",
		sampleAnswerFr:
			"D'abord, j'identifierais les causes profondes du retard par l'analyse du chemin critique et des réunions d'équipe. Puis j'évaluerais les options : fast-tracking (activités en parallèle), crashing (ajout de ressources aux tâches critiques), réduction du périmètre (avec approbation des parties prenantes), ou compression du calendrier. Je communiquerais de manière transparente avec les parties prenantes sur la situation et le plan de récupération proposé. J'implémenterais l'approche choisie, augmenterais la fréquence de monitoring, et organiserais des stand-ups quotidiens pour suivre l'avancement. La prévention est clé — les indicateurs d'alerte précoce et la gestion des marges aident à éviter les retards.",
		tips: [
			"Show a structured approach: diagnose, analyze options, communicate, act",
			"Mention specific project management techniques (fast-tracking, crashing)",
			"Emphasize transparent communication with stakeholders",
		],
		tipsFr: [
			"Montrez une approche structurée : diagnostiquer, analyser les options, communiquer, agir",
			"Mentionnez des techniques de gestion de projet spécifiques (fast-tracking, crashing)",
			"Mettez l'accent sur la communication transparente avec les parties prenantes",
		],
	},
	{
		id: qid("mgmt"),
		question: "What is the triple constraint in project management?",
		questionFr: "Quelle est la triple contrainte en gestion de projet ?",
		type: "technical",
		field: "management",
		difficulty: "easy",
		sampleAnswer:
			"The triple constraint (also called the iron triangle) consists of Scope, Time, and Cost. These three constraints are interdependent — changing one affects the others. Quality is at the center, affected by all three. For example, if a client requests additional features (scope increase), either the deadline must extend (time increase) or more resources are needed (cost increase), otherwise quality suffers. A project manager's core skill is balancing these constraints while meeting stakeholder expectations. The PMP certification emphasizes managing these trade-offs effectively.",
		sampleAnswerFr:
			"La triple contrainte (aussi appelée triangle d'acier) comprend le Périmètre, le Temps et le Coût. Ces trois contraintes sont interdépendantes — changer l'une affecte les autres. La Qualité est au centre, affectée par les trois. Par exemple, si un client demande des fonctionnalités supplémentaires (augmentation du périmètre), soit le délai doit s'allonger (augmentation du temps), soit plus de ressources sont nécessaires (augmentation du coût), sinon la qualité en souffre. La compétence clé d'un chef de projet est d'équilibrer ces contraintes tout en répondant aux attentes des parties prenantes. La certification PMP met l'accent sur la gestion efficace de ces compromis.",
		tips: [
			"Draw the triangle diagram if possible — it is a classic interview visual",
			"Give a real-world example of how changing one constraint affects others",
			"Mention how you prioritize constraints based on project context",
		],
		tipsFr: [
			"Dessinez le diagramme du triangle si possible — c'est un visuel classique d'entretien",
			"Donnez un exemple concret de comment changer une contrainte affecte les autres",
			"Mentionnez comment vous priorisez les contraintes selon le contexte du projet",
		],
	},
	{
		id: qid("mgmt"),
		question: "Describe the Agile methodology and its benefits over Waterfall.",
		questionFr: "Décrivez la méthodologie Agile et ses avantages par rapport au Waterfall.",
		type: "technical",
		field: "management",
		difficulty: "medium",
		sampleAnswer:
			"Agile is an iterative approach that delivers work in short cycles (sprints of 1-4 weeks). Unlike Waterfall, which follows sequential phases (requirements, design, development, testing, deployment), Agile allows continuous feedback and adaptation. Benefits include: faster time-to-market, better alignment with changing customer needs, reduced risk through early and frequent delivery, improved team collaboration, and higher customer satisfaction. However, Waterfall is still appropriate for projects with fixed requirements, like construction or regulatory compliance. Many Moroccan IT companies are transitioning from Waterfall to Agile.",
		sampleAnswerFr:
			"Agile est une approche itérative qui livre le travail en cycles courts (sprints de 1-4 semaines). Contrairement au Waterfall, qui suit des phases séquentielles (exigences, conception, développement, test, déploiement), Agile permet un feedback continu et une adaptation. Les avantages incluent : un délai de mise sur le marché plus rapide, un meilleur alignement avec les besoins changeants des clients, un risque réduit par une livraison précoce et fréquente, une meilleure collaboration d'équipe, et une satisfaction client plus élevée. Cependant, le Waterfall est toujours approprié pour les projets à exigences fixes, comme la construction ou la conformité réglementaire. Beaucoup d'entreprises IT marocaines font la transition du Waterfall vers Agile.",
		tips: [
			"Avoid being dogmatic — acknowledge that both approaches have their place",
			"Explain the Agile manifesto's four values",
			"Give an example of when you would choose Waterfall over Agile",
		],
		tipsFr: [
			"Évitez d'être dogmatique — reconnaissez que les deux approches ont leur place",
			"Expliquez les quatre valeurs du manifeste Agile",
			"Donnez un exemple de quand vous choisiriez le Waterfall plutôt que l'Agile",
		],
	},
	{
		id: qid("mgmt"),
		question: "How do you perform a SWOT analysis?",
		questionFr: "Comment réalisez-vous une analyse SWOT ?",
		type: "technical",
		field: "management",
		difficulty: "easy",
		sampleAnswer:
			"SWOT analysis evaluates four dimensions: Strengths (internal advantages), Weaknesses (internal limitations), Opportunities (external favorable factors), and Threats (external risks). I start by gathering input from key stakeholders through interviews and workshops. Internal factors are assessed through performance data, resource audit, and capability review. External factors come from market research, competitor analysis, and PESTEL analysis. The output is a 2x2 matrix that informs strategic decisions: leverage strengths to capture opportunities, address weaknesses that expose the organization to threats.",
		sampleAnswerFr:
			"L'analyse SWOT évalue quatre dimensions : Forces (avantages internes), Faiblesses (limitations internes), Opportunités (facteurs externes favorables), et Menaces (risques externes). Je commence par recueillir les contributions des parties prenantes clés via des entretiens et des ateliers. Les facteurs internes sont évalués par les données de performance, l'audit des ressources et la revue des capacités. Les facteurs externes viennent de l'étude de marché, l'analyse concurrentielle et l'analyse PESTEL. Le résultat est une matrice 2x2 qui éclaire les décisions stratégiques : exploiter les forces pour saisir les opportunités, adresser les faiblesses qui exposent l'organisation aux menaces.",
		tips: [
			"Show that SWOT is not just a list — it informs strategic action",
			"Mention how you gather input (data-driven, not just brainstorming)",
			"Connect SWOT to other frameworks like PESTEL for external analysis",
		],
		tipsFr: [
			"Montrez que le SWOT n'est pas juste une liste — il éclaire l'action stratégique",
			"Mentionnez comment vous recueillez les contributions (basé sur les données, pas juste du brainstorming)",
			"Connectez le SWOT à d'autres frameworks comme PESTEL pour l'analyse externe",
		],
	},
	{
		id: qid("mgmt"),
		question: "What are the key financial statements and what do they tell you?",
		questionFr: "Quels sont les principaux états financiers et que vous apprennent-ils ?",
		type: "technical",
		field: "management",
		difficulty: "medium",
		sampleAnswer:
			"The three key financial statements are: the Income Statement (or P&L) which shows revenue, expenses, and profit over a period — telling you if the company is profitable. The Balance Sheet shows assets, liabilities, and equity at a point in time — revealing the company's financial position and solvency. The Cash Flow Statement tracks cash inflows and outflows from operations, investing, and financing — showing if the company generates enough cash. Together, they provide a complete picture. In Morocco, these are prepared according to the Code Général de la Normalisation Comptable (CGNC).",
		sampleAnswerFr:
			"Les trois principaux états financiers sont : le Compte de Résultat (ou CPC) qui montre les revenus, les charges et le bénéfice sur une période — vous indiquant si l'entreprise est rentable. Le Bilan montre les actifs, passifs et capitaux propres à un instant donné — révélant la position financière et la solvabilité de l'entreprise. Le Tableau des Flux de Trésorerie suit les entrées et sorties de trésorerie des opérations, investissements et financement — montrant si l'entreprise génère assez de cash. Ensemble, ils fournissent un tableau complet. Au Maroc, ils sont préparés selon le Code Général de la Normalisation Comptable (CGNC).",
		tips: [
			"Know the Moroccan accounting framework (CGNC) — not just IFRS",
			"Explain what each statement reveals about the business",
			"Show you can interpret the statements, not just define them",
		],
		tipsFr: [
			"Connaissez le cadre comptable marocain (CGNC) — pas seulement les IFRS",
			"Expliquez ce que chaque état révèle sur l'entreprise",
			"Montrez que vous pouvez interpréter les états, pas juste les définir",
		],
	},

	// =========================================================================
	// COMMERCE INTERNATIONAL (20+ questions)
	// =========================================================================
	{
		id: qid("comm"),
		question: "Explain Incoterms 2020 and name the most commonly used ones.",
		questionFr: "Expliquez les Incoterms 2020 et nommez les plus couramment utilisés.",
		type: "technical",
		field: "commerce-international",
		difficulty: "medium",
		sampleAnswer:
			"Incoterms (International Commercial Terms) are standardized trade terms published by the ICC that define buyer and seller responsibilities for delivery, risk transfer, and cost allocation. The most used in Moroccan trade are: FOB (Free On Board) — seller delivers goods on the vessel, risk transfers at that point; CIF (Cost, Insurance, Freight) — seller covers cost, insurance, and freight to destination port; EXW (Ex Works) — buyer assumes all responsibility from seller's premises; and DDP (Delivered Duty Paid) — seller bears all costs including customs clearance. For Morocco-EU trade, CIF and FOB are most common for imports through ports like Tanger Med and Casablanca.",
		sampleAnswerFr:
			"Les Incoterms (International Commercial Terms) sont des termes commerciaux standardisés publiés par la CCI qui définissent les responsabilités de l'acheteur et du vendeur pour la livraison, le transfert de risque et l'allocation des coûts. Les plus utilisés dans le commerce marocain sont : FOB (Free On Board) — le vendeur livre les marchandises à bord du navire, le risque transfère à ce point ; CIF (Cost, Insurance, Freight) — le vendeur couvre le coût, l'assurance et le fret jusqu'au port de destination ; EXW (Ex Works) — l'acheteur assume toute la responsabilité depuis les locaux du vendeur ; et DDP (Delivered Duty Paid) — le vendeur supporte tous les coûts y compris le dédouanement. Pour le commerce Maroc-UE, CIF et FOB sont les plus courants pour les importations via les ports comme Tanger Med et Casablanca.",
		tips: [
			"Know the 11 Incoterms 2020 and when to use each",
			"Explain risk transfer point for the most common terms",
			"Reference Morocco's main trading ports and their role in international commerce",
		],
		tipsFr: [
			"Connaissez les 11 Incoterms 2020 et quand utiliser chacun",
			"Expliquez le point de transfert de risque pour les termes les plus courants",
			"Référencez les principaux ports commerciaux du Maroc et leur rôle dans le commerce international",
		],
	},
	{
		id: qid("comm"),
		question: "What are the key elements of a letter of credit?",
		questionFr: "Quels sont les éléments clés d'une lettre de crédit ?",
		type: "technical",
		field: "commerce-international",
		difficulty: "medium",
		sampleAnswer:
			"A letter of credit (L/C or credoc) is a bank guarantee ensuring the seller gets paid when documentary conditions are met. Key elements include: the applicant (buyer), beneficiary (seller), issuing bank, advising/confirming bank, amount and currency (often USD or EUR for Moroccan trade), description of goods, required documents (bill of lading, commercial invoice, packing list, certificate of origin, insurance certificate), expiry date, and the UCP 600 rules governing it. In Morocco, banks like Attijariwafa, BMCE, and Banque Populaire are major issuers of L/Cs for import/export operations.",
		sampleAnswerFr:
			"Une lettre de crédit (L/C ou credoc) est une garantie bancaire assurant que le vendeur est payé quand les conditions documentaires sont remplies. Les éléments clés incluent : le donneur d'ordre (acheteur), le bénéficiaire (vendeur), la banque émettrice, la banque notificatrice/confirmatrice, le montant et la devise (souvent USD ou EUR pour le commerce marocain), la description des marchandises, les documents requis (connaissement, facture commerciale, liste de colisage, certificat d'origine, certificat d'assurance), la date d'expiration, et les règles UCP 600 qui la régissent. Au Maroc, des banques comme Attijariwafa, BMCE et la Banque Populaire sont les principaux émetteurs de L/C pour les opérations d'import/export.",
		tips: [
			"Know the UCP 600 rules — the international standard for L/Cs",
			"Name the specific documents required and their purpose",
			"Mention Moroccan banks active in trade finance",
		],
		tipsFr: [
			"Connaissez les règles UCP 600 — le standard international pour les L/C",
			"Nommez les documents spécifiques requis et leur objectif",
			"Mentionnez les banques marocaines actives dans le financement du commerce",
		],
	},
	{
		id: qid("comm"),
		question: "What is the Morocco-EU Free Trade Agreement and how does it affect trade?",
		questionFr: "Qu'est-ce que l'Accord de Libre-Échange Maroc-UE et comment affecte-t-il le commerce ?",
		type: "technical",
		field: "commerce-international",
		difficulty: "medium",
		sampleAnswer:
			"The Morocco-EU Association Agreement (in force since 2000) progressively liberalized trade between Morocco and the EU. It eliminated customs duties on most industrial products and reduced tariffs on agricultural products according to schedules. Key provisions include: rules of origin requirements (to qualify for preferential tariffs), cumulation of origin with other Euro-Mediterranean partners, TBT and SPS standards compliance, and intellectual property protection. The EU is Morocco's largest trading partner (about 60% of trade). The agreement also covers services through the DCFTA negotiations. This creates opportunities for Moroccan exporters but also competition from EU imports.",
		sampleAnswerFr:
			"L'Accord d'Association Maroc-UE (en vigueur depuis 2000) a progressivement libéralisé le commerce entre le Maroc et l'UE. Il a éliminé les droits de douane sur la plupart des produits industriels et réduit les tarifs sur les produits agricoles selon des calendriers. Les dispositions clés incluent : les exigences de règles d'origine (pour bénéficier des tarifs préférentiels), le cumul d'origine avec d'autres partenaires euro-méditerranéens, la conformité aux normes OTC et SPS, et la protection de la propriété intellectuelle. L'UE est le plus grand partenaire commercial du Maroc (environ 60% du commerce). L'accord couvre aussi les services à travers les négociations ALECA. Cela crée des opportunités pour les exportateurs marocains mais aussi de la concurrence des importations de l'UE.",
		tips: [
			"Know the key facts: year signed, main provisions, trade volumes",
			"Understand rules of origin — they determine if goods qualify for preferential tariffs",
			"Show awareness of both opportunities and challenges for Moroccan businesses",
		],
		tipsFr: [
			"Connaissez les faits clés : année de signature, principales dispositions, volumes commerciaux",
			"Comprenez les règles d'origine — elles déterminent si les marchandises bénéficient des tarifs préférentiels",
			"Montrez votre conscience des opportunités et des défis pour les entreprises marocaines",
		],
	},
	{
		id: qid("comm"),
		question: "Describe the customs clearance process for imports in Morocco.",
		questionFr: "Décrivez le processus de dédouanement pour les importations au Maroc.",
		type: "technical",
		field: "commerce-international",
		difficulty: "medium",
		sampleAnswer:
			"The Moroccan customs clearance process involves: 1) Pre-arrival: file the déclaration unique de marchandises (DUM) electronically via BADR system, with commercial invoice, bill of lading, packing list, and certificate of origin. 2) Assessment: customs assigns a circuit (green for immediate release, orange for document check, red for physical inspection). 3) Duty calculation based on tariff classification (HS code), customs value (usually CIF), and applicable rates. 4) Payment of duties, taxes (TVA import at 20%), and parafiscal charges. 5) Release of goods. Transit through Tanger Med benefits from the Single Window system (PortNet), which digitizes the process and reduces clearance time to under 24 hours.",
		sampleAnswerFr:
			"Le processus de dédouanement marocain comprend : 1) Pré-arrivée : déposer la Déclaration Unique de Marchandises (DUM) électroniquement via le système BADR, avec la facture commerciale, le connaissement, la liste de colisage et le certificat d'origine. 2) Évaluation : la douane assigne un circuit (vert pour libération immédiate, orange pour vérification documentaire, rouge pour inspection physique). 3) Calcul des droits basé sur la classification tarifaire (code SH), la valeur en douane (généralement CIF), et les taux applicables. 4) Paiement des droits, taxes (TVA à l'importation à 20%), et charges parafiscales. 5) Mainlevée des marchandises. Le transit par Tanger Med bénéficie du système de Guichet Unique (PortNet), qui dématérialise le processus et réduit le temps de dédouanement à moins de 24 heures.",
		tips: [
			"Know the BADR system and PortNet — they are Morocco's digital customs platforms",
			"Explain the different inspection circuits (green, orange, red)",
			"Show awareness of Moroccan customs tariff rates and taxes",
		],
		tipsFr: [
			"Connaissez le système BADR et PortNet — ce sont les plateformes douanières numériques du Maroc",
			"Expliquez les différents circuits d'inspection (vert, orange, rouge)",
			"Montrez votre connaissance des taux tarifaires et taxes douanières marocains",
		],
	},

	// =========================================================================
	// LOGISTIQUE (15+ questions)
	// =========================================================================
	{
		id: qid("log"),
		question: "What is the role of Tanger Med port in Morocco's supply chain?",
		questionFr: "Quel est le rôle du port Tanger Med dans la chaîne d'approvisionnement du Maroc ?",
		type: "technical",
		field: "logistique",
		difficulty: "easy",
		sampleAnswer:
			"Tanger Med is Africa's largest container port and a key hub in the global supply chain, handling over 7 million TEU annually. Its strategic location at the Strait of Gibraltar connects Africa, Europe, and the Americas. Key advantages include: free trade zone status, direct connections to over 180 ports worldwide, integrated logistics platform (warehousing, distribution, assembly), automotive hub (Renault factory exports vehicles globally), and the new Tanger Med 2 expansion. For Morocco's logistics sector, Tanger Med significantly reduces transit times and costs for both imports and exports, and has attracted major global logistics operators like Maersk, CMA CGM, and Decathlon.",
		sampleAnswerFr:
			"Tanger Med est le plus grand port à conteneurs d'Afrique et un hub clé dans la chaîne d'approvisionnement mondiale, manipulant plus de 7 millions d'EVP annuellement. Sa position stratégique au détroit de Gibraltar connecte l'Afrique, l'Europe et les Amériques. Les avantages clés incluent : le statut de zone franche, des connexions directes vers plus de 180 ports dans le monde, une plateforme logistique intégrée (entreposage, distribution, assemblage), un hub automobile (l'usine Renault exporte des véhicules mondialement), et la nouvelle extension Tanger Med 2. Pour le secteur logistique du Maroc, Tanger Med réduit significativement les temps de transit et les coûts pour les importations et exportations, et a attiré de grands opérateurs logistiques mondiaux comme Maersk, CMA CGM et Decathlon.",
		tips: [
			"Know specific statistics: TEU capacity, ranking, number of connected ports",
			"Mention the free trade zone and its benefits for logistics companies",
			"Show enthusiasm — logistics around Tanger Med is a high-growth career area",
		],
		tipsFr: [
			"Connaissez les statistiques spécifiques : capacité en EVP, classement, nombre de ports connectés",
			"Mentionnez la zone franche et ses avantages pour les entreprises logistiques",
			"Montrez de l'enthousiasme — la logistique autour de Tanger Med est un secteur en forte croissance",
		],
	},
	{
		id: qid("log"),
		question: "What is a WMS and how does it improve warehouse operations?",
		questionFr: "Qu'est-ce qu'un WMS et comment améliore-t-il les opérations d'entrepôt ?",
		type: "technical",
		field: "logistique",
		difficulty: "medium",
		sampleAnswer:
			"A WMS (Warehouse Management System) is software that manages and optimizes warehouse operations. Key functions include: inventory tracking (real-time stock levels, lot/serial tracking), receiving (barcode scanning, quality check), storage (zone/bin assignment, optimized putaway), picking (wave picking, zone picking, pick-to-light), packing (weight verification, label printing), and shipping (carrier integration, dock scheduling). A good WMS reduces picking errors by 95%, improves inventory accuracy to 99.9%, and increases throughput by 30%. Popular WMS solutions used in Morocco include SAP EWM, Manhattan Associates, and Oracle WMS Cloud.",
		sampleAnswerFr:
			"Un WMS (Warehouse Management System) est un logiciel qui gère et optimise les opérations d'entrepôt. Les fonctions clés incluent : le suivi d'inventaire (niveaux de stock en temps réel, suivi par lot/numéro de série), la réception (scan de code-barres, contrôle qualité), le stockage (affectation zone/emplacement, rangement optimisé), la préparation (wave picking, zone picking, pick-to-light), l'emballage (vérification de poids, impression d'étiquettes), et l'expédition (intégration transporteur, planification des quais). Un bon WMS réduit les erreurs de préparation de 95%, améliore la précision de l'inventaire à 99,9% et augmente le débit de 30%. Les solutions WMS populaires utilisées au Maroc incluent SAP EWM, Manhattan Associates et Oracle WMS Cloud.",
		tips: [
			"Explain the main WMS functions with concrete operational benefits",
			"Mention specific metrics (accuracy, throughput, error rate improvements)",
			"Name WMS solutions and whether you have experience with any",
		],
		tipsFr: [
			"Expliquez les principales fonctions WMS avec des bénéfices opérationnels concrets",
			"Mentionnez des métriques spécifiques (précision, débit, amélioration du taux d'erreur)",
			"Nommez des solutions WMS et si vous avez de l'expérience avec certaines",
		],
	},
	{
		id: qid("log"),
		question: "How would you optimize last-mile delivery in Moroccan cities?",
		questionFr: "Comment optimiseriez-vous la livraison du dernier kilomètre dans les villes marocaines ?",
		type: "situational",
		field: "logistique",
		difficulty: "hard",
		sampleAnswer:
			"Last-mile delivery in Morocco faces unique challenges: dense medinas with narrow streets, inconsistent addressing, cash-on-delivery preference, and traffic congestion. My optimization strategy would include: establishing micro-fulfillment centers in city neighborhoods, using small electric vehicles or cargo bikes for medina areas, implementing route optimization software considering Moroccan road conditions, offering multiple delivery options (home, collection points like Amana/Barid Al-Maghrib, smart lockers), training delivery drivers on customer interaction, and integrating real-time tracking. Companies like Glovo Morocco and Jumia have shown that collection point networks significantly reduce failed delivery rates.",
		sampleAnswerFr:
			"La livraison du dernier kilomètre au Maroc fait face à des défis uniques : médinas denses avec des rues étroites, adressage inconsistant, préférence pour le paiement à la livraison, et congestion du trafic. Ma stratégie d'optimisation inclurait : établir des micro-centres de fulfillment dans les quartiers, utiliser des petits véhicules électriques ou des vélos cargo pour les zones de médina, implémenter un logiciel d'optimisation d'itinéraires tenant compte des conditions routières marocaines, offrir plusieurs options de livraison (domicile, points de collecte comme Amana/Barid Al-Maghrib, casiers intelligents), former les livreurs à l'interaction client, et intégrer le suivi en temps réel. Des entreprises comme Glovo Maroc et Jumia ont montré que les réseaux de points de collecte réduisent significativement les taux de livraison échouée.",
		tips: [
			"Show knowledge of Morocco-specific challenges (medinas, addressing, COD)",
			"Reference local companies and their solutions (Jumia, Glovo, Chari)",
			"Propose practical solutions adapted to the Moroccan context",
		],
		tipsFr: [
			"Montrez votre connaissance des défis spécifiques au Maroc (médinas, adressage, paiement à la livraison)",
			"Référencez des entreprises locales et leurs solutions (Jumia, Glovo, Chari)",
			"Proposez des solutions pratiques adaptées au contexte marocain",
		],
	},
	{
		id: qid("log"),
		question: "What is supply chain management and what are its key components?",
		questionFr: "Qu'est-ce que la gestion de la chaîne d'approvisionnement et quels sont ses composants clés ?",
		type: "technical",
		field: "logistique",
		difficulty: "easy",
		sampleAnswer:
			"Supply chain management (SCM) is the coordination of all activities involved in sourcing, procurement, production, and delivery of products from raw material to end customer. Key components include: demand planning and forecasting, procurement and supplier management, production planning and scheduling, inventory management, warehousing and distribution, transportation management, and returns management. Effective SCM reduces costs, improves service levels, and creates competitive advantage. In Morocco, companies like OCP (phosphates) and Marjane (retail) have invested heavily in SCM systems to optimize their operations across the country.",
		sampleAnswerFr:
			"La gestion de la chaîne d'approvisionnement (SCM) est la coordination de toutes les activités impliquées dans l'approvisionnement, les achats, la production et la livraison de produits depuis la matière première jusqu'au client final. Les composants clés incluent : la planification et la prévision de la demande, les achats et la gestion des fournisseurs, la planification et l'ordonnancement de production, la gestion des stocks, l'entreposage et la distribution, la gestion du transport, et la gestion des retours. Un SCM efficace réduit les coûts, améliore les niveaux de service et crée un avantage concurrentiel. Au Maroc, des entreprises comme OCP (phosphates) et Marjane (distribution) ont investi massivement dans les systèmes SCM pour optimiser leurs opérations à travers le pays.",
		tips: [
			"Cover all components of the supply chain, not just logistics",
			"Mention how technology (ERP, TMS, WMS) supports SCM",
			"Reference Moroccan companies and their supply chain practices",
		],
		tipsFr: [
			"Couvrez tous les composants de la chaîne d'approvisionnement, pas seulement la logistique",
			"Mentionnez comment la technologie (ERP, TMS, WMS) supporte le SCM",
			"Référencez des entreprises marocaines et leurs pratiques de supply chain",
		],
	},

	// =========================================================================
	// FINANCE (15+ questions)
	// =========================================================================
	{
		id: qid("fin"),
		question: "Explain the difference between IFRS and the Moroccan accounting standards (CGNC).",
		questionFr: "Expliquez la différence entre les IFRS et les normes comptables marocaines (CGNC).",
		type: "technical",
		field: "finance",
		difficulty: "medium",
		sampleAnswer:
			"The CGNC (Code Général de la Normalisation Comptable) is Morocco's national accounting framework, based on the French Plan Comptable Général. Key differences from IFRS include: CGNC uses historical cost primarily while IFRS allows fair value; CGNC has a specific chart of accounts (plan comptable) while IFRS is principles-based; CGNC requires a specific format for financial statements (CPC, Bilan, ESG, TF, ETIC) while IFRS is more flexible; and CGNC does not require consolidation for most companies. Listed companies on the Bourse de Casablanca must use IFRS for consolidated statements, while individual company accounts follow CGNC.",
		sampleAnswerFr:
			"Le CGNC (Code Général de la Normalisation Comptable) est le cadre comptable national du Maroc, basé sur le Plan Comptable Général français. Les différences clés avec les IFRS incluent : le CGNC utilise principalement le coût historique tandis que les IFRS permettent la juste valeur ; le CGNC a un plan comptable spécifique tandis que les IFRS sont basés sur des principes ; le CGNC exige un format spécifique pour les états financiers (CPC, Bilan, ESG, TF, ETIC) tandis que les IFRS sont plus flexibles ; et le CGNC n'exige pas la consolidation pour la plupart des entreprises. Les sociétés cotées à la Bourse de Casablanca doivent utiliser les IFRS pour les comptes consolidés, tandis que les comptes individuels suivent le CGNC.",
		tips: [
			"Know both frameworks — you need CGNC for daily accounting and IFRS for listed companies",
			"Explain the practical implications of the differences",
			"Mention that Bank Al-Maghrib requires IFRS for banks",
		],
		tipsFr: [
			"Connaissez les deux cadres — vous avez besoin du CGNC pour la comptabilité quotidienne et des IFRS pour les sociétés cotées",
			"Expliquez les implications pratiques des différences",
			"Mentionnez que Bank Al-Maghrib exige les IFRS pour les banques",
		],
	},
	{
		id: qid("fin"),
		question: "How does the Moroccan tax system work for businesses?",
		questionFr: "Comment fonctionne le système fiscal marocain pour les entreprises ?",
		type: "technical",
		field: "finance",
		difficulty: "medium",
		sampleAnswer:
			"The Moroccan business tax system includes several key taxes: Impôt sur les Sociétés (IS) with progressive rates (10% for profits up to 300K MAD, 20% for 300K-1M, 31% for above 1M, with special rates for exporters and industrial zones). TVA (Value Added Tax) at standard rate of 20% with reduced rates of 7%, 10%, and 14% for specific categories. Taxe Professionnelle based on rental value of business premises. Cotisation Minimale (minimum tax) of 0.5% to 0.75% of turnover. The CGI (Code Général des Impôts) governs all taxes, and the DGI (Direction Générale des Impôts) administers them. Tax declarations are filed through the SIMPL platform.",
		sampleAnswerFr:
			"Le système fiscal marocain pour les entreprises comprend plusieurs impôts clés : l'Impôt sur les Sociétés (IS) avec des taux progressifs (10% pour les bénéfices jusqu'à 300K MAD, 20% pour 300K-1M, 31% au-dessus de 1M, avec des taux spéciaux pour les exportateurs et les zones industrielles). La TVA au taux normal de 20% avec des taux réduits de 7%, 10% et 14% pour des catégories spécifiques. La Taxe Professionnelle basée sur la valeur locative des locaux commerciaux. La Cotisation Minimale de 0,5% à 0,75% du chiffre d'affaires. Le CGI (Code Général des Impôts) régit tous les impôts, et la DGI (Direction Générale des Impôts) les administre. Les déclarations fiscales sont déposées via la plateforme SIMPL.",
		tips: [
			"Know the current IS rates and TVA rates — they are frequently asked",
			"Mention the SIMPL electronic filing platform",
			"Show awareness of tax incentives for specific sectors (exports, CFC zone, industrial zones)",
		],
		tipsFr: [
			"Connaissez les taux actuels de l'IS et de la TVA — ils sont fréquemment demandés",
			"Mentionnez la plateforme de télédéclaration SIMPL",
			"Montrez votre connaissance des incitations fiscales pour des secteurs spécifiques (exports, zone CFC, zones industrielles)",
		],
	},
	{
		id: qid("fin"),
		question: "How do you build a financial model for a business?",
		questionFr: "Comment construisez-vous un modèle financier pour une entreprise ?",
		type: "technical",
		field: "finance",
		difficulty: "hard",
		sampleAnswer:
			"I build financial models in Excel following best practices: separate sheets for assumptions, income statement, balance sheet, cash flow, and scenarios. I start with revenue projections based on market size, pricing, and growth assumptions. Then I model costs (COGS, OpEx, CapEx) and working capital requirements. The three statements are linked: net income flows to the balance sheet and cash flow statement. I include sensitivity analysis (what-if scenarios) and DCF valuation. Key best practices include: color coding (blue for inputs, black for formulas), clear documentation, error checks, and circular reference avoidance. I validate the model by checking that the balance sheet balances and cash flow reconciles.",
		sampleAnswerFr:
			"Je construis des modèles financiers dans Excel en suivant les meilleures pratiques : des feuilles séparées pour les hypothèses, le compte de résultat, le bilan, le flux de trésorerie, et les scénarios. Je commence par les projections de revenus basées sur la taille du marché, la tarification et les hypothèses de croissance. Puis je modélise les coûts (COGS, OpEx, CapEx) et les besoins en fonds de roulement. Les trois états sont liés : le résultat net alimente le bilan et le tableau des flux de trésorerie. J'inclus une analyse de sensibilité (scénarios what-if) et une valorisation DCF. Les bonnes pratiques clés incluent : le code couleur (bleu pour les inputs, noir pour les formules), une documentation claire, des vérifications d'erreurs, et l'évitement des références circulaires. Je valide le modèle en vérifiant que le bilan est équilibré et que les flux de trésorerie se réconcilient.",
		tips: [
			"Show a structured approach to model building",
			"Mention Excel best practices — they show professionalism",
			"Emphasize linking the three financial statements",
		],
		tipsFr: [
			"Montrez une approche structurée de la construction du modèle",
			"Mentionnez les bonnes pratiques Excel — elles montrent le professionnalisme",
			"Mettez l'accent sur la liaison des trois états financiers",
		],
	},
	{
		id: qid("fin"),
		question: "What are the main banking regulations in Morocco?",
		questionFr: "Quelles sont les principales réglementations bancaires au Maroc ?",
		type: "technical",
		field: "finance",
		difficulty: "hard",
		sampleAnswer:
			"Moroccan banking is regulated by Bank Al-Maghrib (BAM), the central bank. Key regulations include: the Banking Law (Loi 103-12) which defines banking activities, licensing, and supervision. Prudential ratios following Basel III: minimum capital adequacy ratio of 12%, liquidity coverage ratio (LCR), and net stable funding ratio (NSFR). Anti-money laundering law (Loi 43-05) with KYC requirements. Consumer protection regulations for banking products. Banks must report to BAM and submit to regular inspections. Morocco's banking sector includes 19 banks, with Attijariwafa Bank, BMCE Bank of Africa, and Banque Populaire being the largest. The sector is expanding into Sub-Saharan Africa.",
		sampleAnswerFr:
			"Le secteur bancaire marocain est réglementé par Bank Al-Maghrib (BAM), la banque centrale. Les réglementations clés incluent : la Loi Bancaire (Loi 103-12) qui définit les activités bancaires, l'agrément et la supervision. Les ratios prudentiels suivant Bâle III : ratio minimal de solvabilité de 12%, ratio de couverture de liquidité (LCR), et ratio de financement stable net (NSFR). La loi anti-blanchiment (Loi 43-05) avec les exigences KYC. Les réglementations de protection du consommateur pour les produits bancaires. Les banques doivent rendre compte à BAM et se soumettre à des inspections régulières. Le secteur bancaire marocain comprend 19 banques, Attijariwafa Bank, BMCE Bank of Africa et la Banque Populaire étant les plus grandes. Le secteur s'étend en Afrique subsaharienne.",
		tips: [
			"Know Bank Al-Maghrib's role and the key banking laws",
			"Mention Basel III ratios and their Moroccan implementation",
			"Show awareness of Morocco's major banks and their African expansion",
		],
		tipsFr: [
			"Connaissez le rôle de Bank Al-Maghrib et les principales lois bancaires",
			"Mentionnez les ratios Bâle III et leur implémentation marocaine",
			"Montrez votre connaissance des principales banques marocaines et leur expansion africaine",
		],
	},

	// =========================================================================
	// MARKETING (10+ questions)
	// =========================================================================
	{
		id: qid("mkt"),
		question: "How would you develop a digital marketing strategy for a Moroccan startup?",
		questionFr: "Comment développeriez-vous une stratégie de marketing digital pour une startup marocaine ?",
		type: "situational",
		field: "marketing",
		difficulty: "medium",
		sampleAnswer:
			"I would start with market research: analyze the target audience (demographics, online behavior, language preferences — French vs Darija), competitive landscape, and digital channels usage in Morocco. The strategy would include: social media marketing (Facebook and Instagram dominate in Morocco with 22M+ users), content marketing in both French and Darija, Google Ads targeting Moroccan keywords, influencer partnerships with local creators, email marketing for retention, and SEO targeting Morocco-specific search terms. Key metrics: CAC, LTV, conversion rate, and ROAS. Budget allocation would prioritize Meta ads (60%) given Morocco's social media usage patterns.",
		sampleAnswerFr:
			"Je commencerais par une étude de marché : analyser le public cible (démographie, comportement en ligne, préférences linguistiques — français vs darija), le paysage concurrentiel, et l'utilisation des canaux digitaux au Maroc. La stratégie inclurait : le marketing sur les réseaux sociaux (Facebook et Instagram dominent au Maroc avec 22M+ utilisateurs), le content marketing en français et darija, Google Ads ciblant des mots-clés marocains, des partenariats avec des influenceurs locaux, l'email marketing pour la rétention, et le SEO ciblant des termes de recherche spécifiques au Maroc. Métriques clés : CAC, LTV, taux de conversion et ROAS. L'allocation budgétaire prioriserait les publicités Meta (60%) étant donné les habitudes d'utilisation des réseaux sociaux au Maroc.",
		tips: [
			"Show knowledge of Morocco's digital landscape (social media usage, language preferences)",
			"Mention specific platforms popular in Morocco (Facebook, Instagram, TikTok)",
			"Include bilingual content strategy (French + Darija/Arabic)",
		],
		tipsFr: [
			"Montrez votre connaissance du paysage digital marocain (usage des réseaux sociaux, préférences linguistiques)",
			"Mentionnez les plateformes spécifiques populaires au Maroc (Facebook, Instagram, TikTok)",
			"Incluez une stratégie de contenu bilingue (français + darija/arabe)",
		],
	},
	{
		id: qid("mkt"),
		question: "What is the marketing mix (4Ps) and how would you apply it?",
		questionFr: "Qu'est-ce que le mix marketing (4P) et comment l'appliqueriez-vous ?",
		type: "technical",
		field: "marketing",
		difficulty: "easy",
		sampleAnswer:
			"The 4Ps are Product (what you sell — features, quality, branding), Price (pricing strategy — penetration, skimming, competitive), Place (distribution channels — online, retail, wholesale), and Promotion (communication — advertising, PR, social media, sales promotion). For the Moroccan market, I would add cultural considerations: product localization (Arabic/French packaging), competitive pricing for price-sensitive consumers, distribution through both traditional souks and modern retail (Marjane, Carrefour), and promotional campaigns during key periods like Ramadan, Eid, and back-to-school season. The extended 7Ps add People, Process, and Physical Evidence.",
		sampleAnswerFr:
			"Les 4P sont le Produit (ce que vous vendez — caractéristiques, qualité, marque), le Prix (stratégie tarifaire — pénétration, écrémage, concurrentiel), la Place (canaux de distribution — en ligne, détail, gros), et la Promotion (communication — publicité, RP, réseaux sociaux, promotion des ventes). Pour le marché marocain, j'ajouterais des considérations culturelles : localisation du produit (emballage arabe/français), tarification compétitive pour des consommateurs sensibles au prix, distribution à travers les souks traditionnels et le commerce moderne (Marjane, Carrefour), et des campagnes promotionnelles pendant les périodes clés comme le Ramadan, l'Aïd et la rentrée scolaire. Les 7P étendus ajoutent les Personnes, les Processus et les Preuves Physiques.",
		tips: [
			"Apply each P to the Moroccan context — show cultural awareness",
			"Mention seasonal marketing opportunities specific to Morocco",
			"Show you know the extended 7Ps for services marketing",
		],
		tipsFr: [
			"Appliquez chaque P au contexte marocain — montrez votre sensibilité culturelle",
			"Mentionnez les opportunités de marketing saisonnier spécifiques au Maroc",
			"Montrez que vous connaissez les 7P étendus pour le marketing des services",
		],
	},

	// =========================================================================
	// RESSOURCES HUMAINES (10+ questions)
	// =========================================================================
	{
		id: qid("rh"),
		question: "What are the key provisions of the Moroccan Labour Code?",
		questionFr: "Quelles sont les principales dispositions du Code du Travail marocain ?",
		type: "technical",
		field: "ressources-humaines",
		difficulty: "medium",
		sampleAnswer:
			"The Moroccan Labour Code (Code du Travail, Loi 65-99) covers: employment contracts (CDD limited to one year renewable once, CDI for permanent employment), working hours (44 hours/week, overtime regulated), SMIG minimum wage (currently around 3,111 MAD/month for 191 hours), annual leave (1.5 days per month of service), social security (CNSS contributions by employer and employee), termination procedures (notice periods, severance pay based on seniority), workplace safety obligations, and union representation rights. The Code also prohibits discrimination and child labor. Moroccan HR professionals must ensure compliance while managing the relationship between employers, employees, and the Inspection du Travail.",
		sampleAnswerFr:
			"Le Code du Travail marocain (Loi 65-99) couvre : les contrats de travail (CDD limité à un an renouvelable une fois, CDI pour l'emploi permanent), les heures de travail (44 heures/semaine, heures supplémentaires réglementées), le SMIG (actuellement environ 3 111 MAD/mois pour 191 heures), les congés annuels (1,5 jour par mois de service), la sécurité sociale (cotisations CNSS par l'employeur et l'employé), les procédures de licenciement (préavis, indemnités de licenciement basées sur l'ancienneté), les obligations de sécurité au travail, et les droits de représentation syndicale. Le Code interdit aussi la discrimination et le travail des enfants. Les professionnels RH marocains doivent assurer la conformité tout en gérant la relation entre employeurs, employés et l'Inspection du Travail.",
		tips: [
			"Know the current SMIG and SMAG rates",
			"Understand CDD vs CDI rules — they are fundamental in Moroccan HR",
			"Mention CNSS and AMO (health insurance) contributions",
		],
		tipsFr: [
			"Connaissez les taux actuels du SMIG et du SMAG",
			"Comprenez les règles CDD vs CDI — elles sont fondamentales en RH marocain",
			"Mentionnez les cotisations CNSS et AMO (assurance maladie)",
		],
	},
	{
		id: qid("rh"),
		question: "How would you conduct an effective recruitment process?",
		questionFr: "Comment mèneriez-vous un processus de recrutement efficace ?",
		type: "situational",
		field: "ressources-humaines",
		difficulty: "medium",
		sampleAnswer:
			"An effective recruitment process includes: job analysis and creating a clear job description, defining selection criteria and competency framework, sourcing candidates through multiple channels (Rekrute.com, LinkedIn, ANAPEC, university partnerships like IMTA, employee referrals), screening CVs against defined criteria, conducting structured interviews (behavioral and competency-based), administering relevant tests (technical, psychometric, language), checking references, making an offer with competitive compensation, and onboarding. I would also track KPIs: time-to-fill, cost-per-hire, quality of hire, and diversity metrics. In Morocco, leveraging the ANAPEC partnerships and university career fairs is particularly effective for junior roles.",
		sampleAnswerFr:
			"Un processus de recrutement efficace comprend : l'analyse du poste et la création d'une fiche de poste claire, la définition des critères de sélection et du référentiel de compétences, le sourcing de candidats via plusieurs canaux (Rekrute.com, LinkedIn, ANAPEC, partenariats universitaires comme l'IMTA, cooptation), le tri des CV selon les critères définis, la conduite d'entretiens structurés (comportementaux et basés sur les compétences), l'administration de tests pertinents (techniques, psychométriques, linguistiques), la vérification des références, la formulation d'une offre avec une rémunération compétitive, et l'intégration. Je suivrais aussi des KPIs : délai de recrutement, coût par recrutement, qualité du recrutement, et indicateurs de diversité. Au Maroc, exploiter les partenariats ANAPEC et les forums carrières universitaires est particulièrement efficace pour les postes juniors.",
		tips: [
			"Show a structured, end-to-end recruitment process",
			"Mention Morocco-specific recruitment channels (Rekrute, ANAPEC, Emploi.ma)",
			"Emphasize structured interviews over unstructured — they predict performance better",
		],
		tipsFr: [
			"Montrez un processus de recrutement structuré de bout en bout",
			"Mentionnez les canaux de recrutement spécifiques au Maroc (Rekrute, ANAPEC, Emploi.ma)",
			"Mettez l'accent sur les entretiens structurés plutôt que non structurés — ils prédisent mieux la performance",
		],
	},

	// =========================================================================
	// ADDITIONAL CROSS-FIELD QUESTIONS (behavioral, situational, competency)
	// =========================================================================
	{
		id: qid("cross"),
		question: "Tell me about a project where you had to learn a new technology quickly.",
		questionFr: "Parlez-moi d'un projet où vous avez dû apprendre une nouvelle technologie rapidement.",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During my internship, I was assigned to a project that used a technology I had never worked with before. Instead of panicking, I spent the first weekend completing an online tutorial, then followed the project documentation closely. Within two weeks, I was contributing code to the project. I asked senior colleagues for code reviews and used that feedback to improve rapidly. By the end of the internship, I had become proficient enough to write documentation for the next intern. This experience taught me that learning agility is more important than existing knowledge.",
		sampleAnswerFr:
			"Pendant mon stage, j'ai été affecté à un projet qui utilisait une technologie avec laquelle je n'avais jamais travaillé. Au lieu de paniquer, j'ai passé le premier week-end à compléter un tutoriel en ligne, puis j'ai suivi de près la documentation du projet. En deux semaines, je contribuais du code au projet. J'ai demandé à des collègues seniors de revoir mon code et j'ai utilisé leurs retours pour m'améliorer rapidement. À la fin du stage, j'étais devenu assez compétent pour écrire de la documentation pour le prochain stagiaire. Cette expérience m'a appris que l'agilité d'apprentissage est plus importante que les connaissances existantes.",
		tips: [
			"Show a structured learning approach: tutorial, documentation, practice, feedback",
			"Emphasize speed of learning and proactive attitude",
			"Mention the outcome — what you achieved with the new technology",
		],
		tipsFr: [
			"Montrez une approche d'apprentissage structurée : tutoriel, documentation, pratique, feedback",
			"Mettez l'accent sur la vitesse d'apprentissage et l'attitude proactive",
			"Mentionnez le résultat — ce que vous avez accompli avec la nouvelle technologie",
		],
	},
	{
		id: qid("cross"),
		question: "How do you ensure clear communication with non-technical stakeholders?",
		questionFr: "Comment assurez-vous une communication claire avec des parties prenantes non techniques ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I adapt my communication to the audience. With non-technical stakeholders, I use analogies and visual aids instead of jargon. During my internship, I presented a technical solution to the management team using a simple diagram showing the business impact rather than the technical architecture. I focused on what the solution DOES (reduces processing time by 50%) rather than HOW it works. I also ask questions to confirm understanding and encourage stakeholders to rephrase what they understood. Written communication follows the same principle: executive summary first, details below.",
		sampleAnswerFr:
			"J'adapte ma communication à l'audience. Avec les parties prenantes non techniques, j'utilise des analogies et des aides visuelles au lieu du jargon. Pendant mon stage, j'ai présenté une solution technique à l'équipe de direction en utilisant un simple diagramme montrant l'impact business plutôt que l'architecture technique. Je me suis concentré sur ce que la solution FAIT (réduit le temps de traitement de 50%) plutôt que COMMENT elle fonctionne. Je pose aussi des questions pour confirmer la compréhension et j'encourage les parties prenantes à reformuler ce qu'elles ont compris. La communication écrite suit le même principe : résumé exécutif en premier, détails ensuite.",
		tips: [
			"Give a concrete example of successful cross-functional communication",
			"Show you can translate technical concepts into business value",
			"Mention visual aids: diagrams, charts, demos — they transcend language barriers",
		],
		tipsFr: [
			"Donnez un exemple concret de communication transversale réussie",
			"Montrez que vous pouvez traduire des concepts techniques en valeur business",
			"Mentionnez les aides visuelles : diagrammes, graphiques, démos — ils transcendent les barrières linguistiques",
		],
	},
	{
		id: qid("cross"),
		question: "If you were assigned to work in a city far from your family, how would you handle it?",
		questionFr: "Si vous étiez affecté à travailler dans une ville loin de votre famille, comment géreriez-vous ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I would approach it as a growth opportunity. Practically, I would research the city's cost of living, find suitable housing, and establish a routine quickly. I would stay connected with family through regular video calls and plan visits during holidays and weekends. Professionally, I would use the fresh start to build a strong local network. Many successful professionals in Morocco have relocated between Casablanca, Tangier, Rabat, and Marrakech for career growth. I believe the experience of living in a new city would broaden my perspective and make me more adaptable.",
		sampleAnswerFr:
			"J'aborderais cela comme une opportunité de croissance. Pratiquement, je ferais des recherches sur le coût de la vie dans la ville, trouverais un logement adapté et établirais une routine rapidement. Je resterais connecté avec ma famille par des appels vidéo réguliers et planifierais des visites pendant les vacances et les week-ends. Professionnellement, j'utiliserais ce nouveau départ pour construire un solide réseau local. Beaucoup de professionnels réussis au Maroc se sont déplacés entre Casablanca, Tanger, Rabat et Marrakech pour leur évolution de carrière. Je crois que l'expérience de vivre dans une nouvelle ville élargirait ma perspective et me rendrait plus adaptable.",
		tips: [
			"Show willingness and a positive attitude toward mobility",
			"Be practical about how you would manage the transition",
			"Mention that mobility is common and valued in the Moroccan job market",
		],
		tipsFr: [
			"Montrez votre volonté et une attitude positive envers la mobilité",
			"Soyez pratique sur la façon dont vous géreriez la transition",
			"Mentionnez que la mobilité est courante et valorisée sur le marché de l'emploi marocain",
		],
	},
	{
		id: qid("cross"),
		question: "What would you do if you discovered a colleague was making errors that could affect the company?",
		questionFr: "Que feriez-vous si vous découvriez qu'un collègue faisait des erreurs pouvant affecter l'entreprise ?",
		type: "situational",
		field: "général",
		difficulty: "hard",
		sampleAnswer:
			"First, I would verify that the errors are real and not a misunderstanding on my part. Then, I would approach my colleague privately and respectfully to discuss what I observed. If the errors are due to lack of knowledge, I would offer to help or suggest training. If the colleague does not acknowledge or correct the issue, and the errors pose a significant risk, I would escalate to my direct supervisor while maintaining professionalism and confidentiality. I believe in protecting the company's interests while treating colleagues with respect and giving them a chance to improve.",
		sampleAnswerFr:
			"D'abord, je vérifierais que les erreurs sont réelles et pas un malentendu de ma part. Ensuite, j'approcherais mon collègue en privé et respectueusement pour discuter de ce que j'ai observé. Si les erreurs sont dues à un manque de connaissances, je proposerais de l'aider ou suggérerais une formation. Si le collègue ne reconnaît pas ou ne corrige pas le problème, et que les erreurs posent un risque significatif, j'escaladerais à mon supérieur direct tout en maintenant le professionnalisme et la confidentialité. Je crois en la protection des intérêts de l'entreprise tout en traitant les collègues avec respect et en leur donnant une chance de s'améliorer.",
		tips: [
			"Show a balanced approach: address the issue but respect the colleague",
			"Describe a clear escalation path: verify, discuss privately, escalate if needed",
			"Emphasize that your goal is to solve the problem, not to blame",
		],
		tipsFr: [
			"Montrez une approche équilibrée : abordez le problème mais respectez le collègue",
			"Décrivez un chemin d'escalade clair : vérifier, discuter en privé, escalader si nécessaire",
			"Soulignez que votre objectif est de résoudre le problème, pas de blâmer",
		],
	},
	{
		id: qid("cross"),
		question: "How do you handle working with people from different cultural backgrounds?",
		questionFr: "Comment gérez-vous le travail avec des personnes de différentes cultures ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"Morocco itself is a multicultural country with Arab, Amazigh, and European influences, so I grew up appreciating diversity. I approach cross-cultural work with curiosity and respect. I listen actively to understand different perspectives, avoid making assumptions based on stereotypes, and adapt my communication style as needed. During a group project with international exchange students at IMTA, I learned that direct communication styles vary widely. I focus on building trust through reliability and genuine interest in others' viewpoints. I believe diversity strengthens teams by bringing different problem-solving approaches.",
		sampleAnswerFr:
			"Le Maroc lui-même est un pays multiculturel avec des influences arabes, amazighes et européennes, j'ai donc grandi en appréciant la diversité. J'aborde le travail interculturel avec curiosité et respect. J'écoute activement pour comprendre les différentes perspectives, j'évite de faire des suppositions basées sur des stéréotypes, et j'adapte mon style de communication selon les besoins. Pendant un projet de groupe avec des étudiants internationaux en échange à l'IMTA, j'ai appris que les styles de communication directe varient largement. Je me concentre sur la construction de la confiance par la fiabilité et un intérêt sincère pour les points de vue des autres. Je crois que la diversité renforce les équipes en apportant différentes approches de résolution de problèmes.",
		tips: [
			"Reference Morocco's own multicultural heritage as an advantage",
			"Give a specific example of successful cross-cultural collaboration",
			"Show you value diversity as a strength, not just tolerate it",
		],
		tipsFr: [
			"Référencez le patrimoine multiculturel du Maroc comme un avantage",
			"Donnez un exemple spécifique de collaboration interculturelle réussie",
			"Montrez que vous valorisez la diversité comme une force, pas juste la tolérez",
		],
	},
	{
		id: qid("cross"),
		question: "What is your experience with Microsoft Excel for data analysis?",
		questionFr: "Quelle est votre expérience avec Microsoft Excel pour l'analyse de données ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I am proficient in Excel beyond basic formulas. I regularly use VLOOKUP/XLOOKUP for data matching, pivot tables for summarizing large datasets, conditional formatting for visual analysis, and INDEX/MATCH for flexible lookups. I have experience with data validation, named ranges for readable formulas, and creating dashboards with charts. During my studies at IMTA, I used Excel for statistical analysis (descriptive statistics, regression analysis) and project planning (Gantt charts). I am also familiar with Power Query for data transformation and basic VBA macros for automation.",
		sampleAnswerFr:
			"Je maîtrise Excel au-delà des formules de base. J'utilise régulièrement RECHERCHEV/RECHERCHEX pour la correspondance de données, les tableaux croisés dynamiques pour résumer de grands jeux de données, la mise en forme conditionnelle pour l'analyse visuelle, et INDEX/EQUIV pour des recherches flexibles. J'ai de l'expérience avec la validation de données, les plages nommées pour des formules lisibles, et la création de tableaux de bord avec des graphiques. Pendant mes études à l'IMTA, j'ai utilisé Excel pour l'analyse statistique (statistiques descriptives, analyse de régression) et la planification de projet (diagrammes de Gantt). Je suis aussi familier avec Power Query pour la transformation de données et les macros VBA basiques pour l'automatisation.",
		tips: [
			"Name advanced features: pivot tables, VLOOKUP, Power Query, VBA",
			"Give examples of how you used Excel in academic or professional projects",
			"Excel proficiency is highly valued across ALL fields in Morocco",
		],
		tipsFr: [
			"Nommez des fonctionnalités avancées : tableaux croisés dynamiques, RECHERCHEV, Power Query, VBA",
			"Donnez des exemples de comment vous avez utilisé Excel dans des projets académiques ou professionnels",
			"La maîtrise d'Excel est très valorisée dans TOUS les domaines au Maroc",
		],
	},
	{
		id: qid("cross"),
		question: "What role does ethics play in your professional life?",
		questionFr: "Quel rôle l'éthique joue-t-elle dans votre vie professionnelle ?",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"Ethics is the foundation of professional trust. I believe in honesty, even when it is uncomfortable — like admitting a mistake or telling a client that a deadline is unrealistic. I maintain confidentiality with sensitive information, treat all colleagues with respect regardless of their position, and refuse to cut corners on quality or safety. During my studies, I was part of a group where some members suggested copying work. I convinced them that learning through honest effort would benefit us more in the long run. In the workplace, I would adhere to the company's code of ethics and raise concerns through proper channels.",
		sampleAnswerFr:
			"L'éthique est le fondement de la confiance professionnelle. Je crois en l'honnêteté, même quand c'est inconfortable — comme admettre une erreur ou dire à un client qu'un délai est irréaliste. Je maintiens la confidentialité des informations sensibles, traite tous les collègues avec respect quelle que soit leur position, et refuse de rogner sur la qualité ou la sécurité. Pendant mes études, j'ai fait partie d'un groupe où certains membres suggéraient de copier du travail. Je les ai convaincus que l'apprentissage par un effort honnête nous bénéficierait plus à long terme. Sur le lieu de travail, j'adhérerais au code d'éthique de l'entreprise et soulèverais mes préoccupations par les voies appropriées.",
		tips: [
			"Give a concrete example of an ethical dilemma you faced",
			"Show that your ethics are actionable, not just theoretical",
			"Mention company codes of ethics and proper reporting channels",
		],
		tipsFr: [
			"Donnez un exemple concret d'un dilemme éthique auquel vous avez fait face",
			"Montrez que votre éthique est actionnable, pas juste théorique",
			"Mentionnez les codes d'éthique d'entreprise et les voies de signalement appropriées",
		],
	},
	{
		id: qid("cross"),
		question: "How do you approach a problem you have never encountered before?",
		questionFr: "Comment abordez-vous un problème que vous n'avez jamais rencontré ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I follow a systematic approach: first, I clearly define the problem and what success looks like. Then I research — consulting documentation, online resources, and asking colleagues who might have relevant experience. I break the problem into smaller, manageable parts and tackle them one at a time. I look for similar problems that have been solved before and adapt those solutions. I test my approach incrementally and adjust based on results. If I get stuck, I am not afraid to ask for help. The key is maintaining a growth mindset — every new problem is a learning opportunity.",
		sampleAnswerFr:
			"Je suis une approche systématique : d'abord, je définis clairement le problème et à quoi ressemble le succès. Puis je recherche — consultant la documentation, les ressources en ligne, et demandant à des collègues qui pourraient avoir une expérience pertinente. Je décompose le problème en parties plus petites et gérables et je les aborde une par une. Je cherche des problèmes similaires qui ont été résolus avant et j'adapte ces solutions. Je teste mon approche de manière incrémentale et j'ajuste en fonction des résultats. Si je suis bloqué, je n'ai pas peur de demander de l'aide. La clé est de maintenir un état d'esprit de croissance — chaque nouveau problème est une opportunité d'apprentissage.",
		tips: [
			"Show a structured problem-solving methodology",
			"Emphasize that asking for help is a strength, not a weakness",
			"Mention that you test and iterate rather than trying to find the perfect solution immediately",
		],
		tipsFr: [
			"Montrez une méthodologie structurée de résolution de problèmes",
			"Soulignez que demander de l'aide est une force, pas une faiblesse",
			"Mentionnez que vous testez et itérez plutôt que d'essayer de trouver la solution parfaite immédiatement",
		],
	},
	{
		id: qid("cross"),
		question: "What is your greatest professional achievement so far?",
		questionFr: "Quelle est votre plus grande réussite professionnelle jusqu'à présent ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"My greatest achievement was my final year project at IMTA where I developed [project description]. What made it special was not just the technical complexity, but that it solved a real problem for [stakeholder]. I presented it at the school's annual showcase and received positive feedback from industry professionals. The project required coordinating a team of four, managing a tight timeline, and learning new technologies under pressure. It gave me confidence that I can deliver real results, and it solidified my passion for [field].",
		sampleAnswerFr:
			"Ma plus grande réussite a été mon projet de fin d'études à l'IMTA où j'ai développé [description du projet]. Ce qui l'a rendu spécial n'était pas juste la complexité technique, mais qu'il résolvait un vrai problème pour [partie prenante]. Je l'ai présenté lors de la vitrine annuelle de l'école et j'ai reçu des retours positifs de professionnels de l'industrie. Le projet a nécessité la coordination d'une équipe de quatre, la gestion d'un calendrier serré, et l'apprentissage de nouvelles technologies sous pression. Cela m'a donné confiance dans ma capacité à livrer de vrais résultats, et a solidifié ma passion pour [domaine].",
		tips: [
			"Choose an achievement relevant to the job you are applying for",
			"Quantify the impact when possible (percentage improvement, number of users, etc.)",
			"Show both technical and soft skills (teamwork, leadership, communication)",
		],
		tipsFr: [
			"Choisissez une réussite pertinente pour le poste auquel vous postulez",
			"Quantifiez l'impact quand c'est possible (pourcentage d'amélioration, nombre d'utilisateurs, etc.)",
			"Montrez à la fois des compétences techniques et humaines (travail d'équipe, leadership, communication)",
		],
	},
	{
		id: qid("cross"),
		question: "How would you explain a complex technical concept to a non-expert?",
		questionFr: "Comment expliqueriez-vous un concept technique complexe à un non-expert ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I would use a three-step approach: First, I find an everyday analogy that maps to the technical concept. For example, I explain a database as a very organized filing cabinet, where each drawer is a table and each file is a record. Second, I start with the 'why' — explaining why this matters to them before diving into how it works. Third, I use visual aids — a simple diagram or sketch can communicate what words cannot. I avoid jargon entirely and check for understanding by asking the person to explain it back. During my studies, teaching concepts to classmates who struggled actually deepened my own understanding.",
		sampleAnswerFr:
			"J'utiliserais une approche en trois étapes : Premièrement, je trouve une analogie du quotidien qui correspond au concept technique. Par exemple, j'explique une base de données comme un classeur très organisé, où chaque tiroir est une table et chaque dossier est un enregistrement. Deuxièmement, je commence par le 'pourquoi' — expliquant pourquoi cela les concerne avant de plonger dans le comment. Troisièmement, j'utilise des aides visuelles — un simple diagramme ou croquis peut communiquer ce que les mots ne peuvent pas. J'évite complètement le jargon et vérifie la compréhension en demandant à la personne de reformuler. Pendant mes études, enseigner des concepts à des camarades en difficulté a en fait approfondi ma propre compréhension.",
		tips: [
			"Have a go-to analogy ready for your field's core concepts",
			"Always start with WHY it matters, then HOW it works",
			"Demonstrate the skill during the interview itself — communicate clearly!",
		],
		tipsFr: [
			"Ayez une analogie prête pour les concepts fondamentaux de votre domaine",
			"Commencez toujours par POURQUOI c'est important, puis COMMENT ça fonctionne",
			"Démontrez cette compétence pendant l'entretien lui-même — communiquez clairement !",
		],
	},

	// =========================================================================
	// ADDITIONAL INFORMATIQUE (20+ more)
	// =========================================================================
	{
		id: qid("info"),
		question: "What is the difference between a process and a thread?",
		questionFr: "Quelle est la différence entre un processus et un thread ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"A process is an independent execution unit with its own memory space, while a thread is a lightweight execution unit within a process that shares the same memory. Processes are isolated — one crashing does not affect others. Threads share heap memory but have their own stack, making inter-thread communication faster but requiring synchronization (mutexes, semaphores) to prevent race conditions. In Java, threads are managed via the Thread class or ExecutorService. Python has the GIL limitation for CPU-bound threading, making multiprocessing preferred for parallelism.",
		sampleAnswerFr:
			"Un processus est une unité d'exécution indépendante avec son propre espace mémoire, tandis qu'un thread est une unité d'exécution légère au sein d'un processus qui partage la même mémoire. Les processus sont isolés — le crash d'un ne touche pas les autres. Les threads partagent la mémoire heap mais ont leur propre pile, rendant la communication inter-thread plus rapide mais nécessitant une synchronisation (mutex, sémaphores) pour prévenir les conditions de course. En Java, les threads sont gérés via la classe Thread ou ExecutorService. Python a la limitation du GIL pour le threading CPU-bound, rendant le multiprocessing préféré pour le parallélisme.",
		tips: ["Draw a diagram showing processes with threads inside them", "Mention synchronization mechanisms", "Give examples in the language the company uses"],
		tipsFr: ["Dessinez un diagramme montrant les processus avec des threads à l'intérieur", "Mentionnez les mécanismes de synchronisation", "Donnez des exemples dans le langage utilisé par l'entreprise"],
	},
	{
		id: qid("info"),
		question: "What is a NoSQL database and when would you choose it over SQL?",
		questionFr: "Qu'est-ce qu'une base de données NoSQL et quand la choisiriez-vous plutôt que SQL ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"NoSQL databases store data in non-relational formats: document (MongoDB), key-value (Redis), column-family (Cassandra), or graph (Neo4j). I would choose NoSQL over SQL when: the data schema is flexible or evolving rapidly, horizontal scaling is needed, the application requires high throughput with eventual consistency, or the data is naturally non-relational (like social graphs or IoT sensor data). SQL remains better for complex queries, transactions requiring ACID compliance, and structured data with clear relationships. Many modern applications use both (polyglot persistence).",
		sampleAnswerFr:
			"Les bases de données NoSQL stockent les données dans des formats non relationnels : document (MongoDB), clé-valeur (Redis), famille de colonnes (Cassandra), ou graphe (Neo4j). Je choisirais NoSQL plutôt que SQL quand : le schéma de données est flexible ou évolue rapidement, la mise à l'échelle horizontale est nécessaire, l'application nécessite un haut débit avec cohérence éventuelle, ou les données sont naturellement non relationnelles (comme les graphes sociaux ou les données IoT). SQL reste meilleur pour les requêtes complexes, les transactions nécessitant la conformité ACID, et les données structurées avec des relations claires. Beaucoup d'applications modernes utilisent les deux (persistence polyglotte).",
		tips: ["Name specific NoSQL databases and their use cases", "Show you understand the CAP theorem trade-offs", "Mention polyglot persistence as a modern best practice"],
		tipsFr: ["Nommez des bases de données NoSQL spécifiques et leurs cas d'utilisation", "Montrez que vous comprenez les compromis du théorème CAP", "Mentionnez la persistence polyglotte comme bonne pratique moderne"],
	},
	{
		id: qid("info"),
		question: "How do you manage state in a React application?",
		questionFr: "Comment gérez-vous l'état dans une application React ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"State management in React depends on the scope: local component state uses useState hook, shared state between parent-child uses props and lifting state up, global state uses Context API for simple cases or libraries like Redux, Zustand, or Jotai for complex cases. Server state (API data) is best managed with TanStack Query or SWR, which handle caching, refetching, and synchronization. I choose the simplest solution that fits: useState for forms, Context for themes/auth, TanStack Query for API data, and Zustand for complex shared UI state.",
		sampleAnswerFr:
			"La gestion d'état en React dépend de la portée : l'état local du composant utilise le hook useState, l'état partagé entre parent-enfant utilise les props et la remontée d'état, l'état global utilise l'API Context pour les cas simples ou des bibliothèques comme Redux, Zustand ou Jotai pour les cas complexes. L'état serveur (données API) est mieux géré avec TanStack Query ou SWR, qui gèrent le cache, le refetching et la synchronisation. Je choisis la solution la plus simple qui convient : useState pour les formulaires, Context pour les thèmes/auth, TanStack Query pour les données API, et Zustand pour l'état UI partagé complexe.",
		tips: ["Show you know when to use each approach — don't always reach for Redux", "Mention server state management (TanStack Query) separately from client state", "Demonstrate understanding of prop drilling problems and solutions"],
		tipsFr: ["Montrez que vous savez quand utiliser chaque approche — n'atteignez pas toujours Redux", "Mentionnez la gestion de l'état serveur (TanStack Query) séparément de l'état client", "Démontrez la compréhension des problèmes de prop drilling et des solutions"],
	},
	{
		id: qid("info"),
		question: "What is version control and why is it important?",
		questionFr: "Qu'est-ce que le contrôle de version et pourquoi est-il important ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"Version control (Git) tracks every change to code files, who made the change, and when. It is important because it enables team collaboration (multiple developers can work on the same codebase), provides a complete history for debugging and auditing, allows branching for feature development without affecting the main code, supports rollback to previous versions when bugs are introduced, and enables code review through pull requests. Git with platforms like GitHub or GitLab is the industry standard. In a typical workflow, I create feature branches, make commits with descriptive messages, open pull requests for review, and merge after approval.",
		sampleAnswerFr:
			"Le contrôle de version (Git) suit chaque modification des fichiers de code, qui a fait la modification, et quand. C'est important car il permet la collaboration d'équipe (plusieurs développeurs peuvent travailler sur la même base de code), fournit un historique complet pour le débogage et l'audit, permet le branching pour le développement de fonctionnalités sans affecter le code principal, supporte le rollback vers des versions précédentes quand des bugs sont introduits, et permet la revue de code via les pull requests. Git avec des plateformes comme GitHub ou GitLab est le standard de l'industrie. Dans un workflow typique, je crée des branches de fonctionnalité, fais des commits avec des messages descriptifs, ouvre des pull requests pour revue, et fusionne après approbation.",
		tips: ["Describe your Git workflow (feature branches, pull requests, code review)", "Name the platform you prefer and why (GitHub vs GitLab)", "Mention Git best practices: meaningful commit messages, small focused commits"],
		tipsFr: ["Décrivez votre workflow Git (branches de fonctionnalité, pull requests, revue de code)", "Nommez la plateforme que vous préférez et pourquoi (GitHub vs GitLab)", "Mentionnez les bonnes pratiques Git : messages de commit significatifs, petits commits ciblés"],
	},
	{
		id: qid("info"),
		question: "What is an API gateway and when would you use one?",
		questionFr: "Qu'est-ce qu'un API gateway et quand en utiliseriez-vous un ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"An API gateway is a single entry point for all client requests in a microservices architecture. It handles cross-cutting concerns like authentication, rate limiting, request routing, load balancing, SSL termination, logging, and response caching. Popular solutions include Kong, AWS API Gateway, and Nginx. I would use one when managing multiple backend services that clients should not access directly, when I need to aggregate responses from multiple services, or when implementing API versioning. In a monolithic architecture, a reverse proxy like Nginx is usually sufficient.",
		sampleAnswerFr:
			"Un API gateway est un point d'entrée unique pour toutes les requêtes client dans une architecture microservices. Il gère les préoccupations transversales comme l'authentification, la limitation de débit, le routage des requêtes, l'équilibrage de charge, la terminaison SSL, la journalisation et la mise en cache des réponses. Les solutions populaires incluent Kong, AWS API Gateway et Nginx. Je l'utiliserais pour gérer plusieurs services backend auxquels les clients ne devraient pas accéder directement, quand je dois agréger des réponses de plusieurs services, ou pour implémenter le versioning d'API. Dans une architecture monolithique, un reverse proxy comme Nginx est généralement suffisant.",
		tips: ["Explain the problems an API gateway solves", "Name specific products and cloud services", "Show you understand when it adds value vs unnecessary complexity"],
		tipsFr: ["Expliquez les problèmes qu'un API gateway résout", "Nommez des produits et services cloud spécifiques", "Montrez que vous comprenez quand cela ajoute de la valeur vs de la complexité inutile"],
	},
	{
		id: qid("info"),
		question: "Explain the concept of responsive web design.",
		questionFr: "Expliquez le concept du design web responsive.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"Responsive web design ensures websites look and function well on all screen sizes — desktop, tablet, and mobile. Key techniques include: CSS media queries to apply different styles based on viewport width, flexible grid layouts using CSS Grid or Flexbox, fluid images that scale with container width, the viewport meta tag for mobile browsers, and a mobile-first approach where you design for small screens first and add complexity for larger ones. In Morocco, mobile internet usage exceeds 70%, making responsive design essential. I use Chrome DevTools to test across different screen sizes during development.",
		sampleAnswerFr:
			"Le design web responsive assure que les sites web sont beaux et fonctionnels sur toutes les tailles d'écran — bureau, tablette et mobile. Les techniques clés incluent : les media queries CSS pour appliquer différents styles selon la largeur du viewport, les layouts en grille flexible utilisant CSS Grid ou Flexbox, les images fluides qui s'adaptent à la largeur du conteneur, la balise meta viewport pour les navigateurs mobiles, et une approche mobile-first où on conçoit d'abord pour les petits écrans puis on ajoute de la complexité pour les plus grands. Au Maroc, l'utilisation d'internet mobile dépasse 70%, rendant le design responsive essentiel. J'utilise Chrome DevTools pour tester sur différentes tailles d'écran pendant le développement.",
		tips: ["Mention mobile-first approach as a best practice", "Reference Morocco's high mobile usage rate as justification", "Name specific CSS techniques: media queries, Grid, Flexbox"],
		tipsFr: ["Mentionnez l'approche mobile-first comme bonne pratique", "Référencez le taux élevé d'utilisation mobile au Maroc comme justification", "Nommez des techniques CSS spécifiques : media queries, Grid, Flexbox"],
	},
	{
		id: qid("info"),
		question: "What are web sockets and how do they differ from HTTP?",
		questionFr: "Que sont les WebSockets et en quoi diffèrent-ils de HTTP ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"WebSockets provide full-duplex, persistent connections between client and server, unlike HTTP which is request-response and stateless. After an initial HTTP handshake, the connection upgrades to WebSocket, allowing both sides to send data at any time without new requests. Use cases include real-time chat applications, live dashboards, multiplayer games, and financial trading platforms. HTTP is better for standard CRUD operations, static content, and when caching is important. Libraries like Socket.io simplify WebSocket implementation with fallbacks for older browsers.",
		sampleAnswerFr:
			"Les WebSockets fournissent des connexions persistantes en full-duplex entre client et serveur, contrairement à HTTP qui est requête-réponse et sans état. Après un handshake HTTP initial, la connexion s'upgrade en WebSocket, permettant aux deux côtés d'envoyer des données à tout moment sans nouvelles requêtes. Les cas d'utilisation incluent les applications de chat en temps réel, les tableaux de bord en direct, les jeux multijoueurs et les plateformes de trading financier. HTTP est meilleur pour les opérations CRUD standard, le contenu statique et quand le caching est important. Des bibliothèques comme Socket.io simplifient l'implémentation WebSocket avec des fallbacks pour les navigateurs anciens.",
		tips: ["Explain when WebSockets are appropriate vs Server-Sent Events vs polling", "Name real-world applications (chat, live updates, gaming)", "Mention Socket.io as a practical implementation library"],
		tipsFr: ["Expliquez quand les WebSockets sont appropriés vs Server-Sent Events vs polling", "Nommez des applications du monde réel (chat, mises à jour en direct, jeux)", "Mentionnez Socket.io comme bibliothèque d'implémentation pratique"],
	},
	{
		id: qid("info"),
		question: "What is test-driven development (TDD)?",
		questionFr: "Qu'est-ce que le développement piloté par les tests (TDD) ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"TDD is a development methodology where you write tests before writing the actual code. The cycle is Red-Green-Refactor: write a failing test (Red), write minimal code to make it pass (Green), then improve the code while keeping tests green (Refactor). Benefits include: better code design (tests force you to think about interfaces first), higher test coverage, fewer bugs in production, and documentation through tests. I use Jest for JavaScript, JUnit for Java, and pytest for Python. TDD works best for business logic and algorithms; for UI components, I combine it with visual testing.",
		sampleAnswerFr:
			"Le TDD est une méthodologie de développement où on écrit les tests avant d'écrire le code. Le cycle est Rouge-Vert-Refactorer : écrire un test qui échoue (Rouge), écrire le code minimal pour le faire passer (Vert), puis améliorer le code en gardant les tests au vert (Refactorer). Les avantages incluent : une meilleure conception du code (les tests vous forcent à penser aux interfaces en premier), une meilleure couverture de tests, moins de bugs en production, et de la documentation via les tests. J'utilise Jest pour JavaScript, JUnit pour Java, et pytest pour Python. Le TDD fonctionne mieux pour la logique métier et les algorithmes ; pour les composants UI, je le combine avec des tests visuels.",
		tips: ["Explain the Red-Green-Refactor cycle clearly", "Name testing frameworks you have used", "Show you understand when TDD adds value vs overhead"],
		tipsFr: ["Expliquez clairement le cycle Rouge-Vert-Refactorer", "Nommez les frameworks de test que vous avez utilisés", "Montrez que vous comprenez quand le TDD ajoute de la valeur vs du surcoût"],
	},
	{
		id: qid("info"),
		question: "How would you handle a production outage?",
		questionFr: "Comment géreriez-vous une panne en production ?",
		type: "situational",
		field: "génie-informatique",
		difficulty: "hard",
		sampleAnswer:
			"First priority is restoring service: check monitoring dashboards and logs to identify the issue, attempt a quick fix (rollback deployment, restart services, scale up resources). Communicate immediately with stakeholders about the impact and estimated recovery time. Once service is restored, perform a thorough root cause analysis. Document the incident in a post-mortem: what happened, timeline, root cause, impact, and preventive measures. Implement those measures: add monitoring alerts, fix the underlying bug, update runbooks. I believe in blameless post-mortems that focus on improving systems, not blaming people.",
		sampleAnswerFr:
			"La première priorité est de restaurer le service : vérifier les tableaux de bord de monitoring et les logs pour identifier le problème, tenter un correctif rapide (rollback du déploiement, redémarrage des services, montée en charge). Communiquer immédiatement avec les parties prenantes sur l'impact et le temps de récupération estimé. Une fois le service restauré, effectuer une analyse approfondie des causes racines. Documenter l'incident dans un post-mortem : ce qui s'est passé, chronologie, cause racine, impact et mesures préventives. Implémenter ces mesures : ajouter des alertes de monitoring, corriger le bug sous-jacent, mettre à jour les runbooks. Je crois aux post-mortems sans blâme qui se concentrent sur l'amélioration des systèmes, pas la responsabilisation des personnes.",
		tips: ["Show a clear incident response process: detect, mitigate, communicate, analyze, prevent", "Mention blameless post-mortems — it shows maturity", "Reference monitoring tools you would use (Grafana, Datadog, CloudWatch)"],
		tipsFr: ["Montrez un processus clair de réponse aux incidents : détecter, atténuer, communiquer, analyser, prévenir", "Mentionnez les post-mortems sans blâme — cela montre de la maturité", "Référencez les outils de monitoring que vous utiliseriez (Grafana, Datadog, CloudWatch)"],
	},
	{
		id: qid("info"),
		question: "What is object-oriented programming and its four pillars?",
		questionFr: "Qu'est-ce que la programmation orientée objet et ses quatre piliers ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "easy",
		sampleAnswer:
			"OOP organizes code around objects that combine data (attributes) and behavior (methods). The four pillars are: Encapsulation (hiding internal state and requiring interaction through methods — private fields with getters/setters), Inheritance (creating new classes from existing ones — extends in Java, inherits shared behavior), Polymorphism (objects of different classes responding to the same method call differently — method overriding and interfaces), and Abstraction (showing only essential features while hiding complexity — abstract classes and interfaces). OOP promotes code reuse, modularity, and maintainability.",
		sampleAnswerFr:
			"La POO organise le code autour d'objets qui combinent données (attributs) et comportements (méthodes). Les quatre piliers sont : Encapsulation (cacher l'état interne et exiger l'interaction via des méthodes — champs privés avec getters/setters), Héritage (créer de nouvelles classes à partir de classes existantes — extends en Java, hérite le comportement partagé), Polymorphisme (des objets de classes différentes répondant différemment au même appel de méthode — surcharge de méthodes et interfaces), et Abstraction (montrer uniquement les caractéristiques essentielles en cachant la complexité — classes abstraites et interfaces). La POO favorise la réutilisation du code, la modularité et la maintenabilité.",
		tips: ["Give a simple code example for each pillar", "Show how OOP compares to functional programming", "Mention design patterns that leverage OOP principles"],
		tipsFr: ["Donnez un exemple de code simple pour chaque pilier", "Montrez comment la POO se compare à la programmation fonctionnelle", "Mentionnez les design patterns qui exploitent les principes POO"],
	},
	{
		id: qid("info"),
		question: "Explain the concept of database normalization.",
		questionFr: "Expliquez le concept de la normalisation de base de données.",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"Database normalization organizes tables to minimize redundancy and dependency. The main normal forms are: 1NF (atomic values, no repeating groups), 2NF (1NF plus no partial dependencies on composite keys), 3NF (2NF plus no transitive dependencies), and BCNF (every determinant is a candidate key). For example, storing a customer's address in every order row violates 3NF — the address should be in a separate Customers table referenced by foreign key. Normalization reduces data anomalies (insertion, update, deletion) but can impact query performance. Controlled denormalization is sometimes used for read-heavy applications.",
		sampleAnswerFr:
			"La normalisation de base de données organise les tables pour minimiser la redondance et les dépendances. Les principales formes normales sont : 1NF (valeurs atomiques, pas de groupes répétitifs), 2NF (1NF plus pas de dépendances partielles sur les clés composites), 3NF (2NF plus pas de dépendances transitives), et BCNF (chaque déterminant est une clé candidate). Par exemple, stocker l'adresse d'un client dans chaque ligne de commande viole la 3NF — l'adresse devrait être dans une table Clients séparée référencée par clé étrangère. La normalisation réduit les anomalies de données (insertion, mise à jour, suppression) mais peut impacter la performance des requêtes. La dénormalisation contrôlée est parfois utilisée pour les applications à forte lecture.",
		tips: ["Explain with a practical example showing before/after normalization", "Know up to 3NF at minimum — most practical applications stop there", "Mention denormalization as a performance optimization technique"],
		tipsFr: ["Expliquez avec un exemple pratique montrant avant/après normalisation", "Connaissez au minimum jusqu'à 3NF — la plupart des applications pratiques s'arrêtent là", "Mentionnez la dénormalisation comme technique d'optimisation de performance"],
	},
	{
		id: qid("info"),
		question: "What is a Laravel Eloquent relationship and how do you use it?",
		questionFr: "Qu'est-ce qu'une relation Eloquent Laravel et comment l'utilisez-vous ?",
		type: "technical",
		field: "génie-informatique",
		difficulty: "medium",
		sampleAnswer:
			"Eloquent relationships define how models are connected in Laravel. Types include: hasOne (User has one Profile), hasMany (User has many Posts), belongsTo (Post belongs to User), belongsToMany (User belongs to many Roles via pivot table), hasOneThrough, hasManyThrough, and polymorphic relations. To define a relationship, you add a method to the model that returns the relationship type. You can eager load relationships with the with() method to avoid N+1 query problems. For example: User::with('posts')->get() loads all users and their posts in just two queries instead of N+1.",
		sampleAnswerFr:
			"Les relations Eloquent définissent comment les modèles sont connectés dans Laravel. Les types incluent : hasOne (User a un Profile), hasMany (User a plusieurs Posts), belongsTo (Post appartient à User), belongsToMany (User appartient à plusieurs Roles via table pivot), hasOneThrough, hasManyThrough, et les relations polymorphiques. Pour définir une relation, on ajoute une méthode au modèle qui retourne le type de relation. On peut eager load les relations avec la méthode with() pour éviter les problèmes de requêtes N+1. Par exemple : User::with('posts')->get() charge tous les utilisateurs et leurs posts en seulement deux requêtes au lieu de N+1.",
		tips: ["Know all relationship types and when to use each", "Always mention eager loading to avoid N+1 queries", "Show you understand pivot tables for many-to-many relationships"],
		tipsFr: ["Connaissez tous les types de relations et quand utiliser chacun", "Mentionnez toujours l'eager loading pour éviter les requêtes N+1", "Montrez que vous comprenez les tables pivot pour les relations many-to-many"],
	},

	// =========================================================================
	// ADDITIONAL INDUSTRIEL (15+ more)
	// =========================================================================
	{
		id: qid("indus"),
		question: "What is OEE and how do you calculate it?",
		questionFr: "Qu'est-ce que le TRS (OEE) et comment le calculez-vous ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"OEE (Overall Equipment Effectiveness) measures manufacturing productivity. It is calculated as: OEE = Availability x Performance x Quality. Availability = (Planned Production Time - Downtime) / Planned Production Time. Performance = (Ideal Cycle Time x Total Count) / Run Time. Quality = Good Count / Total Count. World-class OEE is 85%. For example, if a machine is available 90% of the time, runs at 95% of ideal speed, and produces 99% good parts: OEE = 0.90 x 0.95 x 0.99 = 84.6%. OEE identifies the Six Big Losses in manufacturing: breakdowns, setup time, small stops, reduced speed, startup rejects, and production rejects.",
		sampleAnswerFr:
			"Le TRS (Taux de Rendement Synthétique) ou OEE mesure la productivité de fabrication. Il se calcule : TRS = Disponibilité x Performance x Qualité. Disponibilité = (Temps de Production Planifié - Temps d'Arrêt) / Temps de Production Planifié. Performance = (Temps de Cycle Idéal x Quantité Totale) / Temps de Fonctionnement. Qualité = Quantité Bonne / Quantité Totale. Un TRS de classe mondiale est de 85%. Par exemple, si une machine est disponible 90% du temps, tourne à 95% de la vitesse idéale, et produit 99% de pièces bonnes : TRS = 0,90 x 0,95 x 0,99 = 84,6%. Le TRS identifie les Six Grandes Pertes en fabrication : pannes, temps de réglage, micro-arrêts, vitesse réduite, rebuts au démarrage, et rebuts de production.",
		tips: ["Know the formula and be able to calculate OEE from given data", "Mention the Six Big Losses and how to address each", "World-class OEE benchmark is 85% — know this reference point"],
		tipsFr: ["Connaissez la formule et soyez capable de calculer le TRS à partir de données", "Mentionnez les Six Grandes Pertes et comment les traiter", "Le benchmark TRS de classe mondiale est 85% — connaissez ce point de référence"],
	},
	{
		id: qid("indus"),
		question: "What is a Value Stream Map and how do you create one?",
		questionFr: "Qu'est-ce qu'une cartographie de flux de valeur et comment la créez-vous ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"A Value Stream Map (VSM) is a visual tool that shows the flow of materials and information from supplier to customer. To create one: 1) Select the product family, 2) Walk the process from customer order to delivery (Gemba walk), 3) Draw the current state map showing each process step, inventory levels, cycle times, lead times, and information flow, 4) Calculate total lead time vs value-added time, 5) Identify waste and improvement opportunities, 6) Design the future state map with improvements, 7) Create an implementation plan. VSM typically reveals that value-added time is less than 5% of total lead time, highlighting enormous improvement potential.",
		sampleAnswerFr:
			"La cartographie de flux de valeur (VSM) est un outil visuel qui montre le flux des matériaux et de l'information du fournisseur au client. Pour en créer une : 1) Sélectionner la famille de produits, 2) Parcourir le processus de la commande client à la livraison (marche Gemba), 3) Dessiner la carte de l'état actuel montrant chaque étape du processus, les niveaux de stock, les temps de cycle, les délais et le flux d'information, 4) Calculer le délai total vs le temps à valeur ajoutée, 5) Identifier les gaspillages et opportunités d'amélioration, 6) Concevoir la carte de l'état futur avec les améliorations, 7) Créer un plan d'implémentation. Le VSM révèle typiquement que le temps à valeur ajoutée est inférieur à 5% du délai total, mettant en évidence un potentiel d'amélioration énorme.",
		tips: ["Show you can create both current and future state maps", "Mention the importance of the Gemba walk in data collection", "Use standard VSM symbols when drawing"],
		tipsFr: ["Montrez que vous pouvez créer les cartes d'état actuel et futur", "Mentionnez l'importance de la marche Gemba dans la collecte de données", "Utilisez les symboles VSM standards lors du dessin"],
	},
	{
		id: qid("indus"),
		question: "Explain the concept of Just-In-Time (JIT) manufacturing.",
		questionFr: "Expliquez le concept de la fabrication Juste-à-Temps (JAT).",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"JIT manufacturing produces only what is needed, when needed, in the quantity needed. The goal is to minimize inventory holding costs and reduce waste. Key elements include: pull system (production triggered by customer demand, not forecasts), kanban cards for production signals, small lot sizes, quick changeovers (SMED), reliable equipment (TPM), and strong supplier relationships for frequent, reliable deliveries. Toyota pioneered JIT as part of the Toyota Production System. In Morocco, Renault's Tangier plant uses JIT extensively, with suppliers located in the adjacent Tanger Automotive City delivering components just before assembly.",
		sampleAnswerFr:
			"La fabrication JAT produit uniquement ce qui est nécessaire, quand c'est nécessaire, dans la quantité nécessaire. L'objectif est de minimiser les coûts de stockage et de réduire le gaspillage. Les éléments clés incluent : le système en flux tiré (production déclenchée par la demande client, pas les prévisions), les cartes kanban pour les signaux de production, les petits lots, les changements rapides (SMED), des équipements fiables (TPM), et des relations fournisseurs solides pour des livraisons fréquentes et fiables. Toyota a lancé le JAT dans le cadre du Système de Production Toyota. Au Maroc, l'usine Renault de Tanger utilise le JAT intensivement, avec des fournisseurs situés dans la Tanger Automotive City adjacente livrant des composants juste avant l'assemblage.",
		tips: ["Link JIT to the broader Toyota Production System / Lean philosophy", "Mention prerequisites: reliable suppliers, quality at source, flexible workforce", "Reference Moroccan JIT implementations (Renault Tangier, PSA Kenitra)"],
		tipsFr: ["Reliez le JAT au Système de Production Toyota / philosophie Lean plus large", "Mentionnez les prérequis : fournisseurs fiables, qualité à la source, main-d'œuvre flexible", "Référencez les implémentations JAT marocaines (Renault Tanger, PSA Kénitra)"],
	},
	{
		id: qid("indus"),
		question: "What is TPM (Total Productive Maintenance)?",
		questionFr: "Qu'est-ce que la TPM (Maintenance Productive Totale) ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"TPM aims to maximize equipment effectiveness through proactive maintenance involving all employees. The eight pillars of TPM are: Autonomous Maintenance (operators perform basic maintenance), Planned Maintenance (scheduled based on data), Quality Maintenance (zero defects focus), Focused Improvement (kaizen for equipment losses), Early Equipment Management (designing for maintainability), Training and Education, Safety/Health/Environment, and TPM in Administration. Key metrics are MTBF (Mean Time Between Failures) and MTTR (Mean Time To Repair). TPM shifts from reactive fix-when-broken to proactive prevent-before-failure maintenance philosophy.",
		sampleAnswerFr:
			"La TPM vise à maximiser l'efficacité des équipements par une maintenance proactive impliquant tous les employés. Les huit piliers de la TPM sont : Maintenance Autonome (les opérateurs effectuent la maintenance de base), Maintenance Planifiée (programmée selon les données), Maintenance Qualité (zéro défaut), Amélioration Ciblée (kaizen pour les pertes d'équipement), Gestion Précoce des Équipements (concevoir pour la maintenabilité), Formation et Éducation, Sécurité/Santé/Environnement, et TPM en Administration. Les métriques clés sont le MTBF (Temps Moyen Entre Pannes) et le MTTR (Temps Moyen De Réparation). La TPM passe d'une approche réactive réparer-quand-cassé à une philosophie proactive prévenir-avant-panne.",
		tips: ["Name all eight pillars of TPM", "Know MTBF and MTTR formulas and what they measure", "Show how TPM connects to OEE improvement"],
		tipsFr: ["Nommez les huit piliers de la TPM", "Connaissez les formules MTBF et MTTR et ce qu'elles mesurent", "Montrez comment la TPM se connecte à l'amélioration du TRS"],
	},
	{
		id: qid("indus"),
		question: "How do you perform a time and motion study?",
		questionFr: "Comment réalisez-vous une étude de temps et mouvements ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"A time and motion study analyzes work processes to improve efficiency. Steps: 1) Select the operation and inform the operator, 2) Break the operation into elements (value-added and non-value-added), 3) Observe and record times using a stopwatch or video, 4) Calculate the average time for each element over multiple observations, 5) Apply rating factors for operator pace (100% = normal pace), 6) Add allowances for fatigue, personal needs, and unavoidable delays (typically 10-15%), 7) Calculate standard time = Normal Time x (1 + Allowances). I use the results to identify bottlenecks, eliminate unnecessary motions, redesign workstations, and balance assembly lines.",
		sampleAnswerFr:
			"Une étude de temps et mouvements analyse les processus de travail pour améliorer l'efficacité. Étapes : 1) Sélectionner l'opération et informer l'opérateur, 2) Décomposer l'opération en éléments (valeur ajoutée et non-valeur ajoutée), 3) Observer et enregistrer les temps avec un chronomètre ou vidéo, 4) Calculer le temps moyen pour chaque élément sur plusieurs observations, 5) Appliquer des facteurs de jugement d'allure pour le rythme de l'opérateur (100% = rythme normal), 6) Ajouter des majorations pour la fatigue, les besoins personnels et les retards inévitables (typiquement 10-15%), 7) Calculer le temps standard = Temps Normal x (1 + Majorations). J'utilise les résultats pour identifier les goulots d'étranglement, éliminer les mouvements inutiles, reconcevoir les postes de travail et équilibrer les lignes d'assemblage.",
		tips: ["Show a structured methodology with clear steps", "Mention both manual (stopwatch) and modern (video analysis) techniques", "Explain how results are used to improve processes"],
		tipsFr: ["Montrez une méthodologie structurée avec des étapes claires", "Mentionnez les techniques manuelles (chronomètre) et modernes (analyse vidéo)", "Expliquez comment les résultats sont utilisés pour améliorer les processus"],
	},
	{
		id: qid("indus"),
		question: "What is SMED and why is it important in manufacturing?",
		questionFr: "Qu'est-ce que le SMED et pourquoi est-il important en fabrication ?",
		type: "technical",
		field: "génie-industriel",
		difficulty: "medium",
		sampleAnswer:
			"SMED (Single-Minute Exchange of Dies) is a method to reduce changeover time to under 10 minutes. Developed by Shigeo Shingo, it involves: separating internal activities (machine must be stopped) from external activities (can be done while running), converting internal to external where possible, streamlining remaining internal activities, and eliminating adjustments. SMED is critical because shorter changeovers enable smaller batch sizes, which reduce inventory, increase flexibility, and improve responsiveness to customer demand. In a typical implementation, changeover times can be reduced by 50-90%.",
		sampleAnswerFr:
			"Le SMED (Single-Minute Exchange of Dies) est une méthode pour réduire le temps de changement de série à moins de 10 minutes. Développé par Shigeo Shingo, il implique : séparer les activités internes (machine doit être arrêtée) des activités externes (peuvent être faites pendant le fonctionnement), convertir les internes en externes quand possible, rationaliser les activités internes restantes, et éliminer les réglages. Le SMED est critique car des changements plus courts permettent des lots plus petits, qui réduisent les stocks, augmentent la flexibilité et améliorent la réactivité à la demande client. Dans une implémentation typique, les temps de changement peuvent être réduits de 50 à 90%.",
		tips: ["Know the four stages of SMED methodology", "Give a concrete example with before/after changeover times", "Explain how SMED enables JIT and small batch production"],
		tipsFr: ["Connaissez les quatre étapes de la méthodologie SMED", "Donnez un exemple concret avec les temps de changement avant/après", "Expliquez comment le SMED permet le JAT et la production en petits lots"],
	},
	{
		id: qid("indus"),
		question: "Describe the 5S methodology and its implementation.",
		questionFr: "Décrivez la méthodologie 5S et sa mise en œuvre.",
		type: "technical",
		field: "génie-industriel",
		difficulty: "easy",
		sampleAnswer:
			"5S is a workplace organization method: Seiri (Sort — remove unnecessary items), Seiton (Set in Order — organize remaining items logically), Seiso (Shine — clean the workspace thoroughly), Seiketsu (Standardize — create procedures to maintain the first 3S), and Shitsuke (Sustain — build discipline to maintain standards). Implementation starts with a 5S audit, involves all team members, uses visual management (labels, floor markings, shadow boards), and includes regular audits with scoring. Benefits include reduced search time, improved safety, higher quality, and a foundation for other Lean tools. In Moroccan factories, 5S is often the first Lean tool implemented.",
		sampleAnswerFr:
			"Le 5S est une méthode d'organisation du lieu de travail : Seiri (Trier — supprimer les éléments inutiles), Seiton (Ranger — organiser les éléments restants logiquement), Seiso (Nettoyer — nettoyer l'espace de travail en profondeur), Seiketsu (Standardiser — créer des procédures pour maintenir les 3 premiers S), et Shitsuke (Maintenir — construire la discipline pour maintenir les standards). L'implémentation commence par un audit 5S, implique tous les membres de l'équipe, utilise le management visuel (étiquettes, marquages au sol, tableaux d'ombre), et inclut des audits réguliers avec scoring. Les avantages incluent la réduction du temps de recherche, l'amélioration de la sécurité, une meilleure qualité, et une base pour les autres outils Lean. Dans les usines marocaines, le 5S est souvent le premier outil Lean implémenté.",
		tips: ["Remember the 5S names in Japanese and their translations", "Explain that 5S is the foundation for all other Lean improvements", "Mention visual management tools used in 5S"],
		tipsFr: ["Retenez les noms des 5S en japonais et leurs traductions", "Expliquez que le 5S est la base de toutes les autres améliorations Lean", "Mentionnez les outils de management visuel utilisés dans le 5S"],
	},

	// =========================================================================
	// ADDITIONAL CIVIL (10+ more)
	// =========================================================================
	{
		id: qid("civil"),
		question: "What is the difference between dead load and live load?",
		questionFr: "Quelle est la différence entre les charges permanentes et les charges d'exploitation ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "easy",
		sampleAnswer:
			"Dead loads (charges permanentes) are constant, permanent forces including the weight of the structure itself, floors, walls, roofing, finishes, and fixed equipment. They are predictable and calculated from material densities. Live loads (charges d'exploitation) are variable forces from occupancy, furniture, people, and movable equipment. They depend on building use: 150 kg/m2 for residential, 250 kg/m2 for offices, 500 kg/m2 for commercial spaces per Moroccan NM standards. Load combinations for design follow: 1.35G + 1.5Q (ultimate limit state) where G is dead load and Q is live load.",
		sampleAnswerFr:
			"Les charges permanentes sont des forces constantes incluant le poids propre de la structure, les planchers, les murs, la toiture, les finitions et les équipements fixes. Elles sont prévisibles et calculées à partir des masses volumiques des matériaux. Les charges d'exploitation sont des forces variables dues à l'occupation, au mobilier, aux personnes et aux équipements mobiles. Elles dépendent de l'usage du bâtiment : 150 kg/m2 pour le résidentiel, 250 kg/m2 pour les bureaux, 500 kg/m2 pour les espaces commerciaux selon les normes NM marocaines. Les combinaisons de charges pour le dimensionnement suivent : 1,35G + 1,5Q (état limite ultime) où G est la charge permanente et Q la charge d'exploitation.",
		tips: ["Know typical live load values for different building types per Moroccan standards", "Mention load combination formulas", "Include other load types: wind, seismic, snow, thermal"],
		tipsFr: ["Connaissez les valeurs typiques de charges d'exploitation pour différents types de bâtiments selon les normes marocaines", "Mentionnez les formules de combinaisons de charges", "Incluez les autres types de charges : vent, sismique, neige, thermique"],
	},
	{
		id: qid("civil"),
		question: "How do you plan and manage a construction project schedule?",
		questionFr: "Comment planifiez-vous et gérez-vous un planning de projet de construction ?",
		type: "competency",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"I create a project schedule using the Critical Path Method (CPM). Steps: define all activities (from Work Breakdown Structure), estimate durations based on historical data and team input, identify dependencies (finish-to-start, start-to-start), calculate the critical path (longest sequence determining minimum project duration), add milestones for key deliverables, and allocate resources. I use Microsoft Project or Primavera P6 for complex projects. I monitor progress with earned value analysis (EV, PV, AC) and track SPI (Schedule Performance Index) weekly. For delays, I apply schedule compression techniques (crashing, fast-tracking).",
		sampleAnswerFr:
			"Je crée un planning de projet en utilisant la Méthode du Chemin Critique (CPM). Étapes : définir toutes les activités (à partir du WBS), estimer les durées selon les données historiques et l'apport de l'équipe, identifier les dépendances (fin-début, début-début), calculer le chemin critique (séquence la plus longue déterminant la durée minimale du projet), ajouter des jalons pour les livrables clés, et allouer les ressources. J'utilise Microsoft Project ou Primavera P6 pour les projets complexes. Je surveille l'avancement avec l'analyse de la valeur acquise (EV, PV, AC) et le suivi hebdomadaire du SPI (Indice de Performance Schedule). Pour les retards, j'applique des techniques de compression du planning (crashing, fast-tracking).",
		tips: ["Name the scheduling software you know (MS Project, Primavera P6)", "Explain the critical path concept clearly", "Mention earned value analysis for progress monitoring"],
		tipsFr: ["Nommez les logiciels de planification que vous connaissez (MS Project, Primavera P6)", "Expliquez clairement le concept du chemin critique", "Mentionnez l'analyse de la valeur acquise pour le suivi de l'avancement"],
	},
	{
		id: qid("civil"),
		question: "What is prestressed concrete and when is it used?",
		questionFr: "Qu'est-ce que le béton précontraint et quand est-il utilisé ?",
		type: "technical",
		field: "génie-civil",
		difficulty: "hard",
		sampleAnswer:
			"Prestressed concrete has internal stresses applied during manufacturing to counteract the tensile stresses from loads. Two methods: pre-tensioning (tendons stressed before concrete casting — used for precast beams and slabs) and post-tensioning (tendons stressed after concrete hardens — used for cast-in-place construction). Prestressed concrete allows longer spans, thinner sections, reduced deflections, and improved crack control compared to reinforced concrete. It is used for bridge beams, long-span floor slabs, parking structures, and tanks. In Morocco, TGCC and SGTM are major contractors using post-tensioned slabs in high-rise buildings.",
		sampleAnswerFr:
			"Le béton précontraint a des contraintes internes appliquées pendant la fabrication pour contrebalancer les contraintes de traction dues aux charges. Deux méthodes : précontrainte par pré-tension (câbles tendus avant le coulage du béton — utilisé pour les poutres et dalles préfabriquées) et précontrainte par post-tension (câbles tendus après le durcissement du béton — utilisé pour la construction coulée en place). Le béton précontraint permet des portées plus longues, des sections plus minces, des flèches réduites et un meilleur contrôle de la fissuration par rapport au béton armé. Il est utilisé pour les poutres de pont, les dalles de grande portée, les parkings et les réservoirs. Au Maroc, TGCC et SGTM sont de grands entrepreneurs utilisant des dalles post-contraintes dans les immeubles de grande hauteur.",
		tips: ["Explain the difference between pre-tensioning and post-tensioning", "Show you understand the structural advantages over reinforced concrete", "Reference Moroccan construction companies that use prestressed concrete"],
		tipsFr: ["Expliquez la différence entre pré-tension et post-tension", "Montrez que vous comprenez les avantages structuraux par rapport au béton armé", "Référencez des entreprises de construction marocaines qui utilisent le béton précontraint"],
	},
	{
		id: qid("civil"),
		question: "What are the environmental considerations in construction projects?",
		questionFr: "Quelles sont les considérations environnementales dans les projets de construction ?",
		type: "situational",
		field: "génie-civil",
		difficulty: "medium",
		sampleAnswer:
			"Environmental considerations include: Environmental Impact Assessment (EIA) required by Moroccan law (Loi 12-03) before major projects, waste management plan (concrete, steel, wood recycling), dust and noise control during construction, stormwater management and erosion control, protection of existing vegetation and water sources, use of sustainable materials and energy-efficient design, and compliance with Morocco's green building standards. The new Moroccan building code encourages thermal insulation (RTCM) to reduce energy consumption. I would also consider green certifications like LEED or HQE, which are gaining traction in Morocco's commercial real estate sector.",
		sampleAnswerFr:
			"Les considérations environnementales incluent : l'Étude d'Impact sur l'Environnement (EIE) requise par la loi marocaine (Loi 12-03) avant les grands projets, le plan de gestion des déchets (recyclage béton, acier, bois), le contrôle de la poussière et du bruit pendant la construction, la gestion des eaux pluviales et le contrôle de l'érosion, la protection de la végétation existante et des sources d'eau, l'utilisation de matériaux durables et la conception éco-énergétique, et la conformité aux normes de construction verte du Maroc. Le nouveau code de construction marocain encourage l'isolation thermique (RTCM) pour réduire la consommation d'énergie. Je considérerais aussi les certifications vertes comme LEED ou HQE, qui gagnent du terrain dans l'immobilier commercial au Maroc.",
		tips: ["Know the Moroccan environmental law (Loi 12-03) and EIA requirements", "Mention the RTCM thermal regulation for buildings", "Show awareness of green certifications gaining popularity in Morocco"],
		tipsFr: ["Connaissez la loi environnementale marocaine (Loi 12-03) et les exigences EIE", "Mentionnez la réglementation thermique RTCM pour les bâtiments", "Montrez votre connaissance des certifications vertes gagnant en popularité au Maroc"],
	},

	// =========================================================================
	// ADDITIONAL ELECTRIQUE (10+ more)
	// =========================================================================
	{
		id: qid("elec"),
		question: "Explain the difference between AC and DC motors.",
		questionFr: "Expliquez la différence entre les moteurs AC et DC.",
		type: "technical",
		field: "génie-électrique",
		difficulty: "easy",
		sampleAnswer:
			"DC motors use direct current and are controlled by varying voltage. They offer excellent speed control and high starting torque, making them ideal for electric vehicles, robotics, and small appliances. AC motors use alternating current and are classified as induction (asynchronous) or synchronous motors. AC induction motors are the workhorse of industry — reliable, low maintenance, and efficient for constant-speed applications like pumps, fans, and conveyors. With variable frequency drives (VFDs), AC motors can achieve speed control comparable to DC motors while being more robust and cheaper to maintain.",
		sampleAnswerFr:
			"Les moteurs DC utilisent le courant continu et sont contrôlés en variant la tension. Ils offrent un excellent contrôle de vitesse et un couple de démarrage élevé, les rendant idéaux pour les véhicules électriques, la robotique et les petits appareils. Les moteurs AC utilisent le courant alternatif et sont classés en moteurs à induction (asynchrones) ou synchrones. Les moteurs asynchrones sont les chevaux de l'industrie — fiables, peu d'entretien, et efficaces pour les applications à vitesse constante comme les pompes, ventilateurs et convoyeurs. Avec les variateurs de fréquence (VFD), les moteurs AC peuvent atteindre un contrôle de vitesse comparable aux moteurs DC tout en étant plus robustes et moins chers à entretenir.",
		tips: ["Know the subtypes of each (DC: brushed/brushless, AC: induction/synchronous)", "Mention variable frequency drives as a game-changer for AC motor control", "Explain which type you would recommend for specific applications"],
		tipsFr: ["Connaissez les sous-types de chaque (DC : à balais/sans balais, AC : induction/synchrone)", "Mentionnez les variateurs de fréquence comme un changement majeur pour le contrôle des moteurs AC", "Expliquez quel type vous recommanderiez pour des applications spécifiques"],
	},
	{
		id: qid("elec"),
		question: "What are the safety standards for electrical installations in Morocco?",
		questionFr: "Quelles sont les normes de sécurité pour les installations électriques au Maroc ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "medium",
		sampleAnswer:
			"Morocco follows the NF C 15-100 standard for low-voltage installations and NF C 13-100 for high-voltage delivery. Key safety requirements include: proper grounding systems (TT system is most common in Morocco), residual current devices (RCDs) of 30mA for personal protection, circuit breakers sized for cable ampacity, equipotential bonding in bathrooms and wet areas, IP ratings appropriate for the environment, and proper cable routing with fire-resistant materials. Installations must be inspected by an approved body (organisme de contrôle agréé) before energization. The ONEE requirements for connection must also be followed, including metering installation specifications.",
		sampleAnswerFr:
			"Le Maroc suit la norme NF C 15-100 pour les installations basse tension et NF C 13-100 pour la livraison haute tension. Les exigences de sécurité clés incluent : des systèmes de mise à la terre appropriés (le régime TT est le plus courant au Maroc), des dispositifs différentiels résiduels (DDR) de 30mA pour la protection des personnes, des disjoncteurs dimensionnés pour l'ampacité des câbles, la liaison équipotentielle dans les salles de bains et zones humides, des indices IP appropriés pour l'environnement, et un cheminement de câbles correct avec des matériaux résistants au feu. Les installations doivent être inspectées par un organisme de contrôle agréé avant la mise sous tension. Les exigences ONEE pour le raccordement doivent aussi être suivies, y compris les spécifications d'installation de comptage.",
		tips: ["Know the NF C 15-100 standard thoroughly — it is the foundation", "Mention specific safety devices and their ratings", "Reference the ONEE connection requirements specific to Morocco"],
		tipsFr: ["Connaissez bien la norme NF C 15-100 — c'est la base", "Mentionnez les dispositifs de sécurité spécifiques et leurs calibres", "Référencez les exigences de raccordement ONEE spécifiques au Maroc"],
	},
	{
		id: qid("elec"),
		question: "How does a variable frequency drive (VFD) work?",
		questionFr: "Comment fonctionne un variateur de fréquence (VFD) ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "medium",
		sampleAnswer:
			"A VFD controls the speed of an AC motor by varying the frequency and voltage of the power supply. It has three main stages: the rectifier converts AC to DC, the DC bus (with capacitors) smooths the voltage, and the inverter uses IGBTs to create a variable-frequency AC output using pulse width modulation (PWM). Since motor speed is proportional to frequency (n = 120f/p), changing frequency changes speed. Benefits include energy savings (up to 50% on pump and fan applications — the affinity laws show power varies with the cube of speed), soft starting, precise speed control, and reduced mechanical stress. Major VFD manufacturers include ABB, Siemens, Schneider, and Danfoss.",
		sampleAnswerFr:
			"Un VFD contrôle la vitesse d'un moteur AC en variant la fréquence et la tension de l'alimentation. Il a trois étapes principales : le redresseur convertit l'AC en DC, le bus DC (avec condensateurs) lisse la tension, et l'onduleur utilise des IGBTs pour créer une sortie AC à fréquence variable par modulation de largeur d'impulsion (PWM). Comme la vitesse du moteur est proportionnelle à la fréquence (n = 120f/p), changer la fréquence change la vitesse. Les avantages incluent les économies d'énergie (jusqu'à 50% sur les applications pompes et ventilateurs — les lois d'affinité montrent que la puissance varie avec le cube de la vitesse), le démarrage progressif, le contrôle de vitesse précis, et la réduction du stress mécanique. Les principaux fabricants de VFD incluent ABB, Siemens, Schneider et Danfoss.",
		tips: ["Explain the three stages: rectifier, DC bus, inverter", "Mention the energy savings potential with the affinity laws", "Name VFD manufacturers and which ones are common in Morocco"],
		tipsFr: ["Expliquez les trois étapes : redresseur, bus DC, onduleur", "Mentionnez le potentiel d'économies d'énergie avec les lois d'affinité", "Nommez les fabricants de VFD et lesquels sont courants au Maroc"],
	},
	{
		id: qid("elec"),
		question: "What is power factor and why does it matter?",
		questionFr: "Qu'est-ce que le facteur de puissance et pourquoi est-il important ?",
		type: "technical",
		field: "génie-électrique",
		difficulty: "easy",
		sampleAnswer:
			"Power factor (PF) is the ratio of real power (kW) to apparent power (kVA), ranging from 0 to 1. It measures how effectively electrical power is converted to useful work. A low PF means more reactive power (kVAR) is drawn, causing higher currents, increased losses, and larger cable and equipment sizes. In Morocco, ONEE penalizes consumers with PF below 0.8 through surcharges on electricity bills. Power factor correction is achieved using capacitor banks, synchronous condensers, or active PF correction circuits. Installing automatic capacitor banks (with controllers like Schneider's VarSet) is the most common solution in Moroccan industrial facilities.",
		sampleAnswerFr:
			"Le facteur de puissance (FP) est le rapport entre la puissance active (kW) et la puissance apparente (kVA), allant de 0 à 1. Il mesure l'efficacité avec laquelle l'énergie électrique est convertie en travail utile. Un FP bas signifie plus de puissance réactive (kVAR) consommée, causant des courants plus élevés, des pertes accrues, et des tailles de câbles et équipements plus grands. Au Maroc, l'ONEE pénalise les consommateurs avec un FP inférieur à 0,8 par des majorations sur les factures d'électricité. La correction du facteur de puissance est réalisée avec des batteries de condensateurs, des compensateurs synchrones, ou des circuits de correction active. L'installation de batteries de condensateurs automatiques (avec des contrôleurs comme VarSet de Schneider) est la solution la plus courante dans les installations industrielles marocaines.",
		tips: ["Know the ONEE penalty threshold (PF < 0.8)", "Explain correction methods: capacitor banks, synchronous condensers", "Calculate power factor from given data (PF = P/S = cos phi)"],
		tipsFr: ["Connaissez le seuil de pénalité ONEE (FP < 0,8)", "Expliquez les méthodes de correction : batteries de condensateurs, compensateurs synchrones", "Calculez le facteur de puissance à partir de données (FP = P/S = cos phi)"],
	},

	// =========================================================================
	// ADDITIONAL MECANIQUE (10+ more)
	// =========================================================================
	{
		id: qid("meca"),
		question: "What are the different types of manufacturing processes?",
		questionFr: "Quels sont les différents types de procédés de fabrication ?",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "easy",
		sampleAnswer:
			"Manufacturing processes are categorized as: Subtractive (removing material — turning, milling, drilling, grinding), Additive (adding material — 3D printing, welding), Forming (shaping without material removal — forging, stamping, rolling, extrusion, injection molding), Joining (connecting parts — welding, brazing, soldering, adhesive bonding, mechanical fastening), and Surface treatment (coating, heat treatment, plating). Selection depends on material type, part geometry, precision requirements, production volume, and cost. For example, CNC machining suits low-volume precision parts, while injection molding suits high-volume plastic parts.",
		sampleAnswerFr:
			"Les procédés de fabrication sont catégorisés en : Soustractifs (enlèvement de matière — tournage, fraisage, perçage, rectification), Additifs (ajout de matière — impression 3D, soudage), Formage (mise en forme sans enlèvement — forgeage, emboutissage, laminage, extrusion, moulage par injection), Assemblage (connexion de pièces — soudage, brasage, collage, fixation mécanique), et Traitement de surface (revêtement, traitement thermique, placage). La sélection dépend du type de matériau, de la géométrie de la pièce, des exigences de précision, du volume de production et du coût. Par exemple, l'usinage CNC convient aux pièces de précision en petit volume, tandis que le moulage par injection convient aux pièces plastiques en grand volume.",
		tips: ["Categorize processes systematically", "Explain selection criteria for choosing between processes", "Mention modern processes like additive manufacturing"],
		tipsFr: ["Catégorisez les procédés systématiquement", "Expliquez les critères de sélection pour choisir entre les procédés", "Mentionnez les procédés modernes comme la fabrication additive"],
	},
	{
		id: qid("meca"),
		question: "What is GD&T (Geometric Dimensioning and Tolerancing)?",
		questionFr: "Qu'est-ce que le GD&T (Tolérancement Géométrique et Dimensionnel) ?",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "medium",
		sampleAnswer:
			"GD&T is a symbolic language for specifying geometric tolerances on engineering drawings beyond basic dimensions. It defines form (flatness, straightness, circularity, cylindricity), orientation (parallelism, perpendicularity, angularity), location (position, concentricity, symmetry), and runout (circular, total). Each tolerance is specified in a feature control frame with the geometric symbol, tolerance value, and datum references. GD&T per ASME Y14.5 or ISO 1101 ensures parts fit and function correctly by controlling the relationship between features. It is essential for interchangeability in mass production.",
		sampleAnswerFr:
			"Le GD&T est un langage symbolique pour spécifier les tolérances géométriques sur les dessins d'ingénierie au-delà des dimensions de base. Il définit la forme (planéité, rectitude, circularité, cylindricité), l'orientation (parallélisme, perpendicularité, inclinaison), la localisation (position, concentricité, symétrie), et le battement (circulaire, total). Chaque tolérance est spécifiée dans un cadre de tolérance géométrique avec le symbole géométrique, la valeur de tolérance, et les références de datum. Le GD&T selon ASME Y14.5 ou ISO 1101 assure que les pièces s'assemblent et fonctionnent correctement en contrôlant la relation entre les caractéristiques. Il est essentiel pour l'interchangeabilité en production de masse.",
		tips: ["Know the major categories of geometric tolerances (form, orientation, location, runout)", "Be able to read and interpret feature control frames", "Reference the standards: ASME Y14.5 (US) and ISO 1101 (international)"],
		tipsFr: ["Connaissez les grandes catégories de tolérances géométriques (forme, orientation, localisation, battement)", "Soyez capable de lire et interpréter les cadres de tolérance", "Référencez les normes : ASME Y14.5 (US) et ISO 1101 (international)"],
	},
	{
		id: qid("meca"),
		question: "How do you interpret a heat treatment specification?",
		questionFr: "Comment interprétez-vous une spécification de traitement thermique ?",
		type: "technical",
		field: "génie-mécanique",
		difficulty: "hard",
		sampleAnswer:
			"A heat treatment specification defines the thermal process to achieve desired mechanical properties. Key parameters include: treatment type (annealing, normalizing, quenching, tempering, case hardening), temperature (austenitizing temperature depends on steel grade — e.g., 850°C for C45), holding time (based on section thickness), cooling method (air, oil, water, furnace), and target hardness (HRC, HB, or HV). For example, 'Q&T to 28-32 HRC' means quench and temper to achieve a Rockwell C hardness of 28-32. I verify results using hardness testing (Rockwell, Brinell), metallographic examination, and mechanical testing (tensile, impact).",
		sampleAnswerFr:
			"Une spécification de traitement thermique définit le processus thermique pour obtenir les propriétés mécaniques souhaitées. Les paramètres clés incluent : le type de traitement (recuit, normalisation, trempe, revenu, cémentation), la température (la température d'austénitisation dépend de la nuance d'acier — ex. 850°C pour C45), le temps de maintien (basé sur l'épaisseur de la section), la méthode de refroidissement (air, huile, eau, four), et la dureté cible (HRC, HB, ou HV). Par exemple, 'T&R à 28-32 HRC' signifie trempe et revenu pour atteindre une dureté Rockwell C de 28-32. Je vérifie les résultats par des essais de dureté (Rockwell, Brinell), un examen métallographique, et des essais mécaniques (traction, résilience).",
		tips: ["Know the main heat treatment types and their effects on steel properties", "Be able to read and interpret hardness values (HRC, HB, HV)", "Explain the relationship between microstructure and mechanical properties"],
		tipsFr: ["Connaissez les principaux types de traitement thermique et leurs effets sur les propriétés de l'acier", "Soyez capable de lire et interpréter les valeurs de dureté (HRC, HB, HV)", "Expliquez la relation entre microstructure et propriétés mécaniques"],
	},

	// =========================================================================
	// ADDITIONAL MANAGEMENT & COMMERCE (15+ more)
	// =========================================================================
	{
		id: qid("mgmt"),
		question: "What is risk management in project management?",
		questionFr: "Qu'est-ce que la gestion des risques en gestion de projet ?",
		type: "technical",
		field: "management",
		difficulty: "medium",
		sampleAnswer:
			"Risk management identifies, assesses, and mitigates potential threats to project success. The process includes: risk identification (brainstorming, checklists, SWOT, expert interviews), qualitative analysis (probability x impact matrix), quantitative analysis (Monte Carlo simulation, decision tree analysis), risk response planning (avoid, mitigate, transfer, accept), and risk monitoring throughout the project. Each risk is documented in a risk register with owner, trigger, and response plan. In construction projects in Morocco, common risks include regulatory delays, supply chain disruptions, currency fluctuations (for imported materials), and weather impacts.",
		sampleAnswerFr:
			"La gestion des risques identifie, évalue et atténue les menaces potentielles au succès du projet. Le processus inclut : l'identification des risques (brainstorming, checklists, SWOT, interviews d'experts), l'analyse qualitative (matrice probabilité x impact), l'analyse quantitative (simulation Monte Carlo, analyse d'arbre de décision), la planification de la réponse aux risques (éviter, atténuer, transférer, accepter), et la surveillance des risques tout au long du projet. Chaque risque est documenté dans un registre des risques avec propriétaire, déclencheur et plan de réponse. Dans les projets de construction au Maroc, les risques courants incluent les retards réglementaires, les perturbations de la chaîne d'approvisionnement, les fluctuations de devises (pour les matériaux importés), et les impacts météorologiques.",
		tips: ["Know the four risk response strategies: avoid, mitigate, transfer, accept", "Mention the risk register as a key document", "Give examples of risks specific to Moroccan projects"],
		tipsFr: ["Connaissez les quatre stratégies de réponse aux risques : éviter, atténuer, transférer, accepter", "Mentionnez le registre des risques comme document clé", "Donnez des exemples de risques spécifiques aux projets marocains"],
	},
	{
		id: qid("mgmt"),
		question: "Explain the concept of stakeholder management.",
		questionFr: "Expliquez le concept de la gestion des parties prenantes.",
		type: "competency",
		field: "management",
		difficulty: "medium",
		sampleAnswer:
			"Stakeholder management involves identifying everyone who can affect or be affected by a project, understanding their expectations and influence, and engaging them appropriately. The process includes: stakeholder identification and mapping (power/interest grid), analyzing each stakeholder's needs, expectations, and potential impact, developing engagement strategies (manage closely, keep satisfied, keep informed, monitor), communicating regularly through appropriate channels, and managing expectations throughout the project lifecycle. Key stakeholders in a Moroccan project might include the client, regulatory authorities, local communities, suppliers, and the project team.",
		sampleAnswerFr:
			"La gestion des parties prenantes implique d'identifier toute personne pouvant affecter ou être affectée par un projet, comprendre leurs attentes et leur influence, et les engager de manière appropriée. Le processus inclut : l'identification et la cartographie des parties prenantes (grille pouvoir/intérêt), l'analyse des besoins, attentes et impact potentiel de chacune, le développement de stratégies d'engagement (gérer de près, maintenir satisfait, maintenir informé, surveiller), la communication régulière par les canaux appropriés, et la gestion des attentes tout au long du cycle de vie du projet. Les parties prenantes clés dans un projet marocain pourraient inclure le client, les autorités réglementaires, les communautés locales, les fournisseurs et l'équipe projet.",
		tips: ["Know the power/interest grid for stakeholder classification", "Show you understand that different stakeholders need different engagement approaches", "Mention cultural aspects of stakeholder management in Morocco"],
		tipsFr: ["Connaissez la grille pouvoir/intérêt pour la classification des parties prenantes", "Montrez que vous comprenez que différentes parties prenantes nécessitent différentes approches d'engagement", "Mentionnez les aspects culturels de la gestion des parties prenantes au Maroc"],
	},
	{
		id: qid("comm"),
		question: "What is the role of Morocco's free trade zones (zones franches)?",
		questionFr: "Quel est le rôle des zones franches du Maroc ?",
		type: "technical",
		field: "commerce-international",
		difficulty: "easy",
		sampleAnswer:
			"Morocco's free trade zones offer significant advantages for international trade: exemption from customs duties on imports and exports, corporate tax exemption for the first 5 years then 8.75% for 20 years, no VAT on goods and services within the zone, free movement of foreign currency, and streamlined administrative procedures. Key zones include: Tanger Free Zone (automotive, textile, electronics), Kenitra Atlantic Free Zone (PSA/Stellantis automotive), Casablanca Finance City (financial services), and the upcoming Dakhla Atlantic zone. These zones have attracted major international companies like Renault, Boeing, Bombardier, and Sumitomo, creating over 100,000 jobs.",
		sampleAnswerFr:
			"Les zones franches du Maroc offrent des avantages significatifs pour le commerce international : exonération des droits de douane sur les importations et exportations, exonération de l'impôt sur les sociétés pendant les 5 premières années puis 8,75% pendant 20 ans, pas de TVA sur les biens et services dans la zone, libre circulation des devises, et procédures administratives simplifiées. Les zones clés incluent : la Zone Franche de Tanger (automobile, textile, électronique), la Zone Franche Atlantique de Kénitra (automobile PSA/Stellantis), Casablanca Finance City (services financiers), et la future zone Atlantique de Dakhla. Ces zones ont attiré de grandes entreprises internationales comme Renault, Boeing, Bombardier et Sumitomo, créant plus de 100 000 emplois.",
		tips: ["Know the tax advantages of each major zone", "Name specific companies operating in each zone", "Show understanding of how zones support Morocco's industrial strategy"],
		tipsFr: ["Connaissez les avantages fiscaux de chaque zone majeure", "Nommez les entreprises spécifiques opérant dans chaque zone", "Montrez votre compréhension de comment les zones soutiennent la stratégie industrielle du Maroc"],
	},
	{
		id: qid("comm"),
		question: "How do you manage foreign exchange risk in international trade?",
		questionFr: "Comment gérez-vous le risque de change dans le commerce international ?",
		type: "technical",
		field: "commerce-international",
		difficulty: "hard",
		sampleAnswer:
			"Foreign exchange risk arises when transaction currencies differ from the company's functional currency (MAD for Moroccan companies). Management strategies include: forward contracts (locking in exchange rates with banks for future transactions), options (buying the right but not obligation to exchange at a set rate), natural hedging (matching revenue and expenses in the same currency), invoicing in MAD when possible, netting (offsetting receivables and payables in the same currency), and leading/lagging (accelerating or delaying payments based on currency expectations). In Morocco, Bank Al-Maghrib has gradually liberalized the dirham since 2018, widening the fluctuation band to +/- 5%, making forex risk management increasingly important for importers and exporters.",
		sampleAnswerFr:
			"Le risque de change survient quand les devises de transaction diffèrent de la monnaie fonctionnelle de l'entreprise (MAD pour les entreprises marocaines). Les stratégies de gestion incluent : les contrats à terme (fixer les taux de change avec les banques pour les transactions futures), les options (acheter le droit mais pas l'obligation de changer à un taux fixé), la couverture naturelle (faire correspondre revenus et dépenses dans la même devise), la facturation en MAD quand possible, le netting (compensation des créances et dettes dans la même devise), et le leading/lagging (accélérer ou retarder les paiements selon les anticipations de change). Au Maroc, Bank Al-Maghrib a progressivement libéralisé le dirham depuis 2018, élargissant la bande de fluctuation à +/- 5%, rendant la gestion du risque de change de plus en plus importante pour les importateurs et exportateurs.",
		tips: ["Know the MAD fluctuation band and its recent evolution", "Explain hedging instruments: forwards, options, swaps", "Mention that Bank Al-Maghrib is gradually liberalizing the dirham"],
		tipsFr: ["Connaissez la bande de fluctuation du MAD et son évolution récente", "Expliquez les instruments de couverture : contrats à terme, options, swaps", "Mentionnez que Bank Al-Maghrib libéralise progressivement le dirham"],
	},
	{
		id: qid("log"),
		question: "What is the difference between 3PL and 4PL logistics?",
		questionFr: "Quelle est la différence entre la logistique 3PL et 4PL ?",
		type: "technical",
		field: "logistique",
		difficulty: "medium",
		sampleAnswer:
			"3PL (Third-Party Logistics) providers handle specific logistics functions: warehousing, transportation, order fulfillment, or customs brokerage. The company retains strategic control. 4PL (Fourth-Party Logistics) is a single integrator that manages the entire supply chain on behalf of the client, coordinating multiple 3PLs, technology platforms, and resources. 4PL acts as a strategic partner, providing supply chain optimization, vendor management, and technology integration. In Morocco, companies like SNTL (now Logistiqa), SDTM, and international players like DHL and DB Schenker offer 3PL services, while 4PL is emerging for larger corporations.",
		sampleAnswerFr:
			"Les fournisseurs 3PL (Logistique Tiers) gèrent des fonctions logistiques spécifiques : entreposage, transport, traitement des commandes, ou courtage en douane. L'entreprise conserve le contrôle stratégique. Le 4PL (Logistique Quatrième Partie) est un intégrateur unique qui gère l'ensemble de la chaîne d'approvisionnement pour le compte du client, coordonnant plusieurs 3PL, plateformes technologiques et ressources. Le 4PL agit comme un partenaire stratégique, fournissant l'optimisation de la chaîne d'approvisionnement, la gestion des fournisseurs et l'intégration technologique. Au Maroc, des entreprises comme SNTL (maintenant Logistiqa), SDTM, et des acteurs internationaux comme DHL et DB Schenker offrent des services 3PL, tandis que le 4PL émerge pour les plus grandes entreprises.",
		tips: ["Clearly distinguish the scope of 3PL vs 4PL", "Name Moroccan logistics companies", "Explain when a company should consider 3PL vs 4PL"],
		tipsFr: ["Distinguez clairement le périmètre du 3PL vs 4PL", "Nommez des entreprises logistiques marocaines", "Expliquez quand une entreprise devrait considérer le 3PL vs 4PL"],
	},
	{
		id: qid("log"),
		question: "How do you calculate inventory turnover and why does it matter?",
		questionFr: "Comment calculez-vous la rotation des stocks et pourquoi est-ce important ?",
		type: "technical",
		field: "logistique",
		difficulty: "easy",
		sampleAnswer:
			"Inventory turnover = Cost of Goods Sold / Average Inventory. It measures how many times inventory is sold and replaced in a period. A higher turnover indicates efficient inventory management — less capital tied up in stock, lower holding costs, and reduced risk of obsolescence. For example, if COGS is 10M MAD and average inventory is 2M MAD, turnover is 5 times per year. Days of inventory = 365 / turnover = 73 days. Industry benchmarks vary: retail aims for 8-12 turns, manufacturing 4-8. Low turnover may indicate overstocking or slow-moving items that need markdown or discontinuation.",
		sampleAnswerFr:
			"La rotation des stocks = Coût des Marchandises Vendues / Stock Moyen. Elle mesure combien de fois le stock est vendu et remplacé dans une période. Une rotation plus élevée indique une gestion efficace des stocks — moins de capital immobilisé, des coûts de détention plus bas, et un risque réduit d'obsolescence. Par exemple, si le CMV est de 10M MAD et le stock moyen est de 2M MAD, la rotation est de 5 fois par an. Jours de stock = 365 / rotation = 73 jours. Les benchmarks industriels varient : le commerce de détail vise 8-12 rotations, la fabrication 4-8. Une faible rotation peut indiquer un surstockage ou des articles à faible rotation nécessitant une démarque ou un arrêt.",
		tips: ["Know the formula and be able to calculate from given data", "Explain what high and low turnover mean for business health", "Mention industry benchmarks relevant to the company"],
		tipsFr: ["Connaissez la formule et soyez capable de calculer à partir de données", "Expliquez ce que signifient une rotation haute et basse pour la santé de l'entreprise", "Mentionnez les benchmarks industriels pertinents pour l'entreprise"],
	},
	{
		id: qid("fin"),
		question: "What is working capital and how do you manage it?",
		questionFr: "Qu'est-ce que le fonds de roulement et comment le gérez-vous ?",
		type: "technical",
		field: "finance",
		difficulty: "medium",
		sampleAnswer:
			"Working capital = Current Assets - Current Liabilities. It measures a company's short-term liquidity and operational efficiency. Key components: accounts receivable (money owed by customers), inventory (raw materials, WIP, finished goods), accounts payable (money owed to suppliers), and cash. Management strategies include: optimizing payment terms (negotiate longer with suppliers, shorter with customers), reducing inventory through JIT, accelerating collections through early payment discounts, using factoring for immediate cash, and monitoring the cash conversion cycle (CCC = DSO + DIO - DPO). In Morocco, managing working capital is critical because many companies operate with tight margins and limited access to credit.",
		sampleAnswerFr:
			"Le fonds de roulement = Actifs Courants - Passifs Courants. Il mesure la liquidité à court terme et l'efficacité opérationnelle d'une entreprise. Composants clés : créances clients (argent dû par les clients), stocks (matières premières, en-cours, produits finis), dettes fournisseurs (argent dû aux fournisseurs), et trésorerie. Les stratégies de gestion incluent : optimiser les conditions de paiement (négocier plus long avec les fournisseurs, plus court avec les clients), réduire les stocks par le JAT, accélérer les recouvrements par des remises pour paiement anticipé, utiliser l'affacturage pour des liquidités immédiates, et surveiller le cycle de conversion de trésorerie (CCC = DSO + DIO - DPO). Au Maroc, la gestion du fonds de roulement est critique car beaucoup d'entreprises opèrent avec des marges serrées et un accès limité au crédit.",
		tips: ["Know the formula and its components", "Explain the cash conversion cycle and how to improve it", "Mention Morocco-specific challenges: late payments are common"],
		tipsFr: ["Connaissez la formule et ses composants", "Expliquez le cycle de conversion de trésorerie et comment l'améliorer", "Mentionnez les défis spécifiques au Maroc : les retards de paiement sont courants"],
	},
	{
		id: qid("fin"),
		question: "Explain the difference between NPV and IRR for investment decisions.",
		questionFr: "Expliquez la différence entre la VAN et le TRI pour les décisions d'investissement.",
		type: "technical",
		field: "finance",
		difficulty: "hard",
		sampleAnswer:
			"NPV (Net Present Value) calculates the present value of all future cash flows minus the initial investment, using a discount rate (usually WACC). A positive NPV means the project creates value. IRR (Internal Rate of Return) is the discount rate that makes NPV equal to zero — it represents the project's expected return. For decision-making: NPV is preferred because it shows absolute value creation in MAD, while IRR shows relative return but can be misleading with non-conventional cash flows or mutually exclusive projects. I use both together: NPV tells me IF the project is worth doing, IRR tells me how attractive the return is compared to alternatives or the company's hurdle rate.",
		sampleAnswerFr:
			"La VAN (Valeur Actuelle Nette) calcule la valeur actuelle de tous les flux de trésorerie futurs moins l'investissement initial, en utilisant un taux d'actualisation (généralement le CMPC). Une VAN positive signifie que le projet crée de la valeur. Le TRI (Taux de Rendement Interne) est le taux d'actualisation qui rend la VAN égale à zéro — il représente le rendement attendu du projet. Pour la prise de décision : la VAN est préférée car elle montre la création de valeur absolue en MAD, tandis que le TRI montre le rendement relatif mais peut être trompeur avec des flux de trésorerie non conventionnels ou des projets mutuellement exclusifs. J'utilise les deux ensemble : la VAN me dit SI le projet en vaut la peine, le TRI me dit à quel point le rendement est attractif par rapport aux alternatives ou au taux de rentabilité minimum de l'entreprise.",
		tips: ["Explain when NPV and IRR can give conflicting signals", "Know how to calculate both using Excel (NPV function, IRR function)", "Mention WACC as the typical discount rate for NPV"],
		tipsFr: ["Expliquez quand la VAN et le TRI peuvent donner des signaux contradictoires", "Sachez calculer les deux avec Excel (fonctions VAN, TRI)", "Mentionnez le CMPC comme taux d'actualisation typique pour la VAN"],
	},
	{
		id: qid("rh"),
		question: "How do you handle employee performance issues?",
		questionFr: "Comment gérez-vous les problèmes de performance d'un employé ?",
		type: "situational",
		field: "ressources-humaines",
		difficulty: "medium",
		sampleAnswer:
			"I follow a progressive approach: first, document specific performance issues with concrete examples and dates. Schedule a private meeting to discuss concerns, listen to the employee's perspective, and understand potential root causes (personal issues, unclear expectations, lack of training). Together, create a Performance Improvement Plan (PIP) with clear objectives, measurable targets, timeline (usually 30-60-90 days), support resources, and consequences. Provide regular check-ins and coaching during the PIP period. If improvement occurs, acknowledge and reinforce. If not, follow the company's disciplinary procedure in compliance with the Moroccan Labour Code (Code du Travail), which requires documented warnings before termination.",
		sampleAnswerFr:
			"Je suis une approche progressive : d'abord, documenter les problèmes de performance spécifiques avec des exemples concrets et des dates. Planifier une réunion privée pour discuter des préoccupations, écouter la perspective de l'employé, et comprendre les causes potentielles (problèmes personnels, attentes floues, manque de formation). Ensemble, créer un Plan d'Amélioration de la Performance (PAP) avec des objectifs clairs, des cibles mesurables, un calendrier (généralement 30-60-90 jours), des ressources de soutien, et des conséquences. Fournir des check-ins réguliers et du coaching pendant la période du PAP. Si l'amélioration se produit, la reconnaître et la renforcer. Sinon, suivre la procédure disciplinaire de l'entreprise en conformité avec le Code du Travail marocain, qui exige des avertissements documentés avant le licenciement.",
		tips: ["Show a structured, documented approach", "Emphasize support and coaching before disciplinary action", "Reference the Moroccan Labour Code requirements for termination procedures"],
		tipsFr: ["Montrez une approche structurée et documentée", "Mettez l'accent sur le soutien et le coaching avant l'action disciplinaire", "Référencez les exigences du Code du Travail marocain pour les procédures de licenciement"],
	},

	// =========================================================================
	// ADDITIONAL CROSS-FIELD BEHAVIORAL/SITUATIONAL (30+ more to reach 300+)
	// =========================================================================
	{
		id: qid("cross"),
		question: "How do you ensure quality in your work?",
		questionFr: "Comment assurez-vous la qualité dans votre travail ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I ensure quality through several habits: I double-check my work before submitting, use checklists for complex tasks, follow established standards and procedures, seek feedback from peers and supervisors, and learn from mistakes. During my studies, I developed the habit of reviewing my calculations independently before comparing with classmates. I also believe in 'right first time' — investing time upfront to understand requirements thoroughly prevents rework later. Quality is not just about the final output — it is about the process that consistently produces good results.",
		sampleAnswerFr:
			"J'assure la qualité par plusieurs habitudes : je vérifie mon travail avant de le soumettre, j'utilise des checklists pour les tâches complexes, je suis les normes et procédures établies, je cherche le feedback de mes pairs et superviseurs, et j'apprends de mes erreurs. Pendant mes études, j'ai développé l'habitude de revoir mes calculs de manière indépendante avant de comparer avec mes camarades. Je crois aussi au 'bien du premier coup' — investir du temps en amont pour comprendre les exigences à fond prévient les reprises plus tard. La qualité n'est pas juste le résultat final — c'est le processus qui produit constamment de bons résultats.",
		tips: ["Describe specific quality practices you follow", "Mention checklists, reviews, and standards", "Show that quality is a habit, not an afterthought"],
		tipsFr: ["Décrivez les pratiques qualité spécifiques que vous suivez", "Mentionnez les checklists, les revues et les normes", "Montrez que la qualité est une habitude, pas une réflexion après coup"],
	},
	{
		id: qid("cross"),
		question: "What makes you different from other graduates?",
		questionFr: "Qu'est-ce qui vous différencie des autres diplômés ?",
		type: "motivation",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"What differentiates me is the combination of my technical skills and my proactive approach to problem-solving. While many graduates have similar academic backgrounds, I have invested extra time in practical projects beyond the curriculum, built a portfolio of work, and actively developed my soft skills through club leadership at IMTA. I am also trilingual (Arabic, French, English) with practical experience in [technology/domain]. Most importantly, I am genuinely curious and constantly looking for ways to improve — I do not wait to be told what to learn.",
		sampleAnswerFr:
			"Ce qui me différencie est la combinaison de mes compétences techniques et de mon approche proactive de la résolution de problèmes. Alors que beaucoup de diplômés ont des parcours académiques similaires, j'ai investi du temps supplémentaire dans des projets pratiques au-delà du programme, construit un portfolio de travaux, et activement développé mes soft skills à travers le leadership associatif à l'IMTA. Je suis aussi trilingue (arabe, français, anglais) avec une expérience pratique en [technologie/domaine]. Plus important encore, je suis sincèrement curieux et constamment à la recherche de moyens de m'améliorer — je n'attends pas qu'on me dise quoi apprendre.",
		tips: ["Be specific about what makes YOU unique — avoid generic statements", "Back up claims with evidence (projects, activities, certifications)", "Show self-awareness about your competitive advantages"],
		tipsFr: ["Soyez spécifique sur ce qui VOUS rend unique — évitez les déclarations génériques", "Appuyez vos affirmations par des preuves (projets, activités, certifications)", "Montrez de la conscience de soi sur vos avantages compétitifs"],
	},
	{
		id: qid("cross"),
		question: "Describe a situation where you had to persuade someone to accept your idea.",
		questionFr: "Décrivez une situation où vous avez dû persuader quelqu'un d'accepter votre idée.",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During a group project at IMTA, I proposed using a different methodology that my team initially resisted because it was unfamiliar. Instead of insisting, I prepared a short demo showing the benefits with concrete data, addressing their specific concerns one by one. I also acknowledged the valid points of the alternative approach and suggested a hybrid solution that incorporated the best of both ideas. The team agreed to try my approach for one sprint, and after seeing the positive results, they adopted it fully. I learned that persuasion is about evidence and empathy, not authority.",
		sampleAnswerFr:
			"Pendant un projet de groupe à l'IMTA, j'ai proposé d'utiliser une méthodologie différente que mon équipe a initialement résistée car elle était inconnue. Au lieu d'insister, j'ai préparé une courte démo montrant les avantages avec des données concrètes, adressant leurs préoccupations spécifiques une par une. J'ai aussi reconnu les points valides de l'approche alternative et suggéré une solution hybride intégrant le meilleur des deux idées. L'équipe a accepté d'essayer mon approche pour un sprint, et après avoir vu les résultats positifs, ils l'ont adoptée entièrement. J'ai appris que la persuasion repose sur les preuves et l'empathie, pas l'autorité.",
		tips: ["Show you persuade with data and empathy, not pressure", "Acknowledge the other person's perspective in your narrative", "Include the positive outcome that validated your approach"],
		tipsFr: ["Montrez que vous persuadez avec des données et de l'empathie, pas la pression", "Reconnaissez la perspective de l'autre dans votre récit", "Incluez le résultat positif qui a validé votre approche"],
	},
	{
		id: qid("cross"),
		question: "How do you set and achieve personal goals?",
		questionFr: "Comment fixez-vous et atteignez-vous vos objectifs personnels ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I use the SMART framework: Specific, Measurable, Achievable, Relevant, and Time-bound. For example, rather than saying 'improve my English,' I set: 'Complete the B2 English certification by December by studying 30 minutes daily on an online platform and practicing conversation weekly.' I break long-term goals into quarterly milestones and weekly tasks. I track progress in a simple spreadsheet and review monthly. I also set both professional goals (certifications, skills) and personal goals (health, reading) to maintain balance. The key is consistency — small daily actions compound into significant achievements.",
		sampleAnswerFr:
			"J'utilise le cadre SMART : Spécifique, Mesurable, Atteignable, Pertinent et Temporellement défini. Par exemple, au lieu de dire 'améliorer mon anglais,' je fixe : 'Obtenir la certification B2 en anglais d'ici décembre en étudiant 30 minutes par jour sur une plateforme en ligne et en pratiquant la conversation chaque semaine.' Je décompose les objectifs à long terme en jalons trimestriels et tâches hebdomadaires. Je suis l'avancement dans un simple tableur et fais une revue mensuelle. Je fixe aussi des objectifs professionnels (certifications, compétences) et personnels (santé, lecture) pour maintenir l'équilibre. La clé est la constance — de petites actions quotidiennes se cumulent en accomplissements significatifs.",
		tips: ["Use the SMART framework — employers love structured goal-setters", "Give a specific example of a goal you achieved using this method", "Show you track and review progress regularly"],
		tipsFr: ["Utilisez le cadre SMART — les employeurs adorent les fixeurs d'objectifs structurés", "Donnez un exemple spécifique d'un objectif atteint avec cette méthode", "Montrez que vous suivez et revoyez l'avancement régulièrement"],
	},
	{
		id: qid("cross"),
		question: "What would you do if you were assigned a task you did not know how to do?",
		questionFr: "Que feriez-vous si on vous assignait une tâche que vous ne savez pas faire ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"First, I would not panic — every professional encounters unfamiliar tasks. I would research the topic using available resources: documentation, online tutorials, and internal knowledge bases. Then I would identify colleagues or mentors who have relevant experience and ask for guidance. I would break the task into smaller pieces and tackle the parts I understand first, building confidence as I go. I would be transparent with my manager about my learning curve while showing initiative to close the gap quickly. The key is honesty about what you do not know, combined with proactive effort to learn.",
		sampleAnswerFr:
			"D'abord, je ne paniquerais pas — chaque professionnel rencontre des tâches inconnues. Je ferais des recherches sur le sujet en utilisant les ressources disponibles : documentation, tutoriels en ligne, et bases de connaissances internes. Puis j'identifierais des collègues ou mentors ayant une expérience pertinente et demanderais conseil. Je décomposerais la tâche en morceaux plus petits et m'attaquerais aux parties que je comprends d'abord, gagnant en confiance au fur et à mesure. Je serais transparent avec mon manager sur ma courbe d'apprentissage tout en montrant de l'initiative pour combler le gap rapidement. La clé est l'honnêteté sur ce qu'on ne sait pas, combinée à un effort proactif pour apprendre.",
		tips: ["Show willingness to learn and resourcefulness", "Mention that asking for help is a strength", "Emphasize transparency with your manager about your learning needs"],
		tipsFr: ["Montrez votre volonté d'apprendre et votre débrouillardise", "Mentionnez que demander de l'aide est une force", "Mettez l'accent sur la transparence avec votre manager sur vos besoins d'apprentissage"],
	},
	{
		id: qid("cross"),
		question: "Tell me about a time you received negative feedback. How did you react?",
		questionFr: "Parlez-moi d'une fois où vous avez reçu un feedback négatif. Comment avez-vous réagi ?",
		type: "behavioral",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"During my internship, my supervisor told me that my written reports lacked structure and were difficult to follow. Initially, I felt disappointed because I had worked hard on them. However, I asked for specific examples of what needed improvement and what a good report looked like. I studied the templates and examples provided, restructured my next report with clear sections, bullet points, and an executive summary. My supervisor praised the improvement significantly. This taught me that negative feedback, while uncomfortable, is the fastest path to improvement. I now actively seek feedback rather than waiting for it.",
		sampleAnswerFr:
			"Pendant mon stage, mon superviseur m'a dit que mes rapports écrits manquaient de structure et étaient difficiles à suivre. Au début, j'étais déçu car j'y avais travaillé dur. Cependant, j'ai demandé des exemples spécifiques de ce qui devait être amélioré et à quoi ressemblait un bon rapport. J'ai étudié les modèles et exemples fournis, restructuré mon prochain rapport avec des sections claires, des points à puces et un résumé exécutif. Mon superviseur a significativement salué l'amélioration. Cela m'a appris que le feedback négatif, bien qu'inconfortable, est le chemin le plus rapide vers l'amélioration. Je cherche maintenant activement le feedback plutôt que de l'attendre.",
		tips: ["Show emotional maturity — acknowledge the initial reaction honestly", "Focus on the actions you took to improve", "End with how you now proactively seek feedback"],
		tipsFr: ["Montrez de la maturité émotionnelle — reconnaissez honnêtement la réaction initiale", "Concentrez-vous sur les actions que vous avez prises pour vous améliorer", "Terminez par comment vous cherchez maintenant proactivement le feedback"],
	},
	{
		id: qid("cross"),
		question: "If you could change one thing about your education, what would it be?",
		questionFr: "Si vous pouviez changer une chose dans votre formation, que changeriez-vous ?",
		type: "behavioral",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I wish I had taken advantage of more internship opportunities and industry exposure earlier in my studies. While IMTA provided excellent theoretical foundations, I realize that earlier practical experience would have helped me connect theory to real-world applications sooner. I have compensated for this by being very engaged during my internship and continuing to learn through online courses and personal projects. This experience has taught me the value of seeking practical exposure, which I now do proactively.",
		sampleAnswerFr:
			"J'aurais aimé profiter de plus d'opportunités de stage et d'exposition à l'industrie plus tôt dans mes études. Bien que l'IMTA ait fourni d'excellentes bases théoriques, je réalise qu'une expérience pratique plus précoce m'aurait aidé à relier la théorie aux applications du monde réel plus tôt. J'ai compensé cela en étant très engagé pendant mon stage et en continuant à apprendre via des cours en ligne et des projets personnels. Cette expérience m'a appris la valeur de chercher l'exposition pratique, ce que je fais maintenant de manière proactive.",
		tips: ["Choose something constructive — do not criticize your school", "Show what you learned from the gap and how you addressed it", "Turn the answer into a positive by showing self-improvement"],
		tipsFr: ["Choisissez quelque chose de constructif — ne critiquez pas votre école", "Montrez ce que vous avez appris du manque et comment vous y avez remédié", "Transformez la réponse en positif en montrant l'amélioration de soi"],
	},
	{
		id: qid("cross"),
		question: "How do you manage your time effectively?",
		questionFr: "Comment gérez-vous votre temps efficacement ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I use a combination of techniques: I plan my day the evening before using a to-do list prioritized by importance and urgency. I use time-blocking — dedicating specific hours to focused work, meetings, and administrative tasks. I batch similar tasks together to minimize context switching. I follow the two-minute rule: if a task takes less than two minutes, I do it immediately. For longer-term planning, I use a weekly review to align daily tasks with monthly goals. Tools I use include a digital calendar for appointments and a simple notebook for daily priorities.",
		sampleAnswerFr:
			"J'utilise une combinaison de techniques : je planifie ma journée la veille en utilisant une liste de tâches priorisée par importance et urgence. J'utilise le time-blocking — dédiant des heures spécifiques au travail concentré, aux réunions et aux tâches administratives. Je regroupe les tâches similaires pour minimiser le changement de contexte. Je suis la règle des deux minutes : si une tâche prend moins de deux minutes, je la fais immédiatement. Pour la planification à plus long terme, j'utilise une revue hebdomadaire pour aligner les tâches quotidiennes avec les objectifs mensuels. Les outils que j'utilise incluent un calendrier numérique pour les rendez-vous et un simple carnet pour les priorités quotidiennes.",
		tips: ["Name specific time management techniques you use", "Show consistency in your planning habits", "Mention that you balance planning with flexibility"],
		tipsFr: ["Nommez des techniques de gestion du temps spécifiques que vous utilisez", "Montrez la constance dans vos habitudes de planification", "Mentionnez que vous équilibrez planification et flexibilité"],
	},
	{
		id: qid("cross"),
		question: "What questions would you ask before starting a new project?",
		questionFr: "Quelles questions poseriez-vous avant de commencer un nouveau projet ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"Before starting any project, I would clarify: 1) What is the objective and expected deliverable? 2) Who is the end user or client? 3) What is the deadline and are there intermediate milestones? 4) What resources (budget, tools, team) are available? 5) Who are the key stakeholders and decision-makers? 6) What are the constraints or risks I should be aware of? 7) How will success be measured? 8) Are there existing documents, templates, or similar past projects I can reference? These questions prevent assumptions and ensure alignment from the start.",
		sampleAnswerFr:
			"Avant de commencer tout projet, je clarifierais : 1) Quel est l'objectif et le livrable attendu ? 2) Qui est l'utilisateur final ou le client ? 3) Quel est le délai et y a-t-il des jalons intermédiaires ? 4) Quelles ressources (budget, outils, équipe) sont disponibles ? 5) Qui sont les parties prenantes clés et les décideurs ? 6) Quelles sont les contraintes ou risques dont je devrais être conscient ? 7) Comment le succès sera-t-il mesuré ? 8) Existe-t-il des documents, modèles ou projets similaires passés auxquels je peux me référer ? Ces questions préviennent les suppositions et assurent l'alignement dès le départ.",
		tips: ["Show structured thinking by organizing questions by category", "Demonstrate that you seek clarity before starting work", "Mention that these questions prevent costly rework later"],
		tipsFr: ["Montrez une pensée structurée en organisant les questions par catégorie", "Démontrez que vous cherchez la clarté avant de commencer le travail", "Mentionnez que ces questions préviennent les reprises coûteuses plus tard"],
	},
	{
		id: qid("cross"),
		question: "How do you stay productive when working from home?",
		questionFr: "Comment restez-vous productif quand vous travaillez de chez vous ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I maintain productivity at home by creating a dedicated workspace separate from living areas, maintaining a consistent schedule (start and end at fixed times), dressing professionally to get into work mode, using the Pomodoro technique (25 minutes focused work, 5 minutes break), and communicating proactively with my team through regular check-ins. I avoid distractions by putting my phone on silent and using website blockers during focus time. I also take a proper lunch break and a short walk to maintain energy throughout the day.",
		sampleAnswerFr:
			"Je maintiens ma productivité à domicile en créant un espace de travail dédié séparé des espaces de vie, en maintenant un horaire cohérent (début et fin à heures fixes), en m'habillant professionnellement pour me mettre en mode travail, en utilisant la technique Pomodoro (25 minutes de travail concentré, 5 minutes de pause), et en communiquant proactivement avec mon équipe par des check-ins réguliers. J'évite les distractions en mettant mon téléphone en silencieux et en utilisant des bloqueurs de sites pendant le temps de concentration. Je prends aussi une vraie pause déjeuner et une courte marche pour maintenir l'énergie tout au long de la journée.",
		tips: ["Show you have a structured approach to remote work", "Mention specific productivity techniques (Pomodoro, time-blocking)", "Emphasize proactive communication with the team"],
		tipsFr: ["Montrez que vous avez une approche structurée du travail à distance", "Mentionnez des techniques de productivité spécifiques (Pomodoro, time-blocking)", "Mettez l'accent sur la communication proactive avec l'équipe"],
	},
	{
		id: qid("cross"),
		question: "What certifications or additional training are you pursuing?",
		questionFr: "Quelles certifications ou formations supplémentaires poursuivez-vous ?",
		type: "motivation",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I am currently pursuing several certifications to enhance my profile. I am working on [relevant certification for the field — e.g., AWS Cloud Practitioner for IT, PMP for management, DELF B2 for French proficiency]. I also regularly complete online courses on Coursera and OpenClassrooms related to my field. I believe continuous learning is essential in today's fast-evolving job market. My next goal is to obtain [specific certification] within the next six months, as it directly aligns with the requirements of this role.",
		sampleAnswerFr:
			"Je poursuis actuellement plusieurs certifications pour améliorer mon profil. Je travaille sur [certification pertinente pour le domaine — ex. AWS Cloud Practitioner pour l'IT, PMP pour le management, DELF B2 pour la maîtrise du français]. Je complète aussi régulièrement des cours en ligne sur Coursera et OpenClassrooms liés à mon domaine. Je crois que l'apprentissage continu est essentiel dans le marché du travail en rapide évolution d'aujourd'hui. Mon prochain objectif est d'obtenir [certification spécifique] dans les six prochains mois, car elle s'aligne directement avec les exigences de ce poste.",
		tips: ["Name specific certifications relevant to the job", "Show a clear learning plan with timelines", "Connect your certifications to the company's needs"],
		tipsFr: ["Nommez des certifications spécifiques pertinentes pour le poste", "Montrez un plan d'apprentissage clair avec des échéances", "Reliez vos certifications aux besoins de l'entreprise"],
	},
	{
		id: qid("cross"),
		question: "How do you build professional relationships in a new workplace?",
		questionFr: "Comment construisez-vous des relations professionnelles dans un nouveau lieu de travail ?",
		type: "competency",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"I build professional relationships through genuine interest and reliability. In the first weeks, I make an effort to learn everyone's name and role, have informal coffee conversations, listen more than I speak, and offer help when I can. I follow through on every commitment — reliability builds trust faster than anything else. I also respect cultural norms — in Morocco, greetings are important, taking time for social conversation before business shows respect. I attend team events and company activities. Over time, I deepen relationships by sharing knowledge, giving credit to others, and maintaining a positive, supportive attitude.",
		sampleAnswerFr:
			"Je construis des relations professionnelles par un intérêt sincère et la fiabilité. Dans les premières semaines, je fais l'effort d'apprendre le nom et le rôle de chacun, d'avoir des conversations informelles autour d'un café, d'écouter plus que je ne parle, et d'offrir mon aide quand je le peux. Je tiens chaque engagement — la fiabilité construit la confiance plus vite que tout. Je respecte aussi les normes culturelles — au Maroc, les salutations sont importantes, prendre le temps de la conversation sociale avant les affaires montre du respect. J'assiste aux événements d'équipe et aux activités de l'entreprise. Avec le temps, j'approfondis les relations en partageant des connaissances, en attribuant le mérite aux autres, et en maintenant une attitude positive et solidaire.",
		tips: ["Show awareness of Moroccan workplace culture (importance of greetings, social bonds)", "Emphasize reliability and follow-through as relationship builders", "Mention both formal and informal relationship-building activities"],
		tipsFr: ["Montrez votre connaissance de la culture de travail marocaine (importance des salutations, liens sociaux)", "Mettez l'accent sur la fiabilité et le suivi comme constructeurs de relations", "Mentionnez les activités formelles et informelles de construction de relations"],
	},
	{
		id: qid("cross"),
		question: "What would you do if you finished your assigned tasks early?",
		questionFr: "Que feriez-vous si vous finissiez vos tâches assignées en avance ?",
		type: "situational",
		field: "général",
		difficulty: "easy",
		sampleAnswer:
			"If I finished early, I would first review my work thoroughly to ensure quality. Then I would check if any team members need help with their tasks. I would also look for improvement opportunities — is there a process that could be optimized or documentation that could be updated? I would inform my manager that I have capacity for additional work. Finally, I would use any remaining time for professional development — reading about industry trends, learning a new tool, or working on a skill that would benefit the team. Proactive employees who seek out work are always valued.",
		sampleAnswerFr:
			"Si je finissais en avance, je reverais d'abord mon travail en profondeur pour assurer la qualité. Puis je vérifierais si des membres de l'équipe ont besoin d'aide avec leurs tâches. Je chercherais aussi des opportunités d'amélioration — y a-t-il un processus qui pourrait être optimisé ou une documentation qui pourrait être mise à jour ? J'informerais mon manager que j'ai de la capacité pour du travail supplémentaire. Enfin, j'utiliserais le temps restant pour le développement professionnel — lire sur les tendances de l'industrie, apprendre un nouvel outil, ou travailler sur une compétence qui bénéficierait à l'équipe. Les employés proactifs qui cherchent du travail sont toujours valorisés.",
		tips: ["Show initiative — never sit idle when there is work to be found", "Mention quality review as the first step", "Demonstrate that you look for ways to add value to the team"],
		tipsFr: ["Montrez de l'initiative — ne restez jamais inactif quand il y a du travail à trouver", "Mentionnez la revue qualité comme première étape", "Démontrez que vous cherchez des moyens d'ajouter de la valeur à l'équipe"],
	},
	{
		id: qid("cross"),
		question: "Describe a time you had to work with someone you did not get along with.",
		questionFr: "Décrivez une situation où vous avez dû travailler avec quelqu'un avec qui vous ne vous entendiez pas.",
		type: "behavioral",
		field: "général",
		difficulty: "hard",
		sampleAnswer:
			"During a group project at IMTA, I was paired with a classmate who had a very different working style — they preferred last-minute work while I liked planning ahead. Instead of letting frustration build, I initiated a conversation about how we could work together effectively. We agreed to set intermediate deadlines that satisfied my need for structure while giving them flexibility on how they completed their parts. I focused on our shared goal rather than our differences. We delivered a strong project and actually developed mutual respect. I learned that professionalism means working effectively with everyone, not just people you click with naturally.",
		sampleAnswerFr:
			"Pendant un projet de groupe à l'IMTA, j'ai été jumelé avec un camarade qui avait un style de travail très différent — il préférait travailler à la dernière minute tandis que j'aimais planifier à l'avance. Au lieu de laisser la frustration s'accumuler, j'ai initié une conversation sur comment nous pouvions travailler ensemble efficacement. Nous avons convenu de fixer des échéances intermédiaires qui satisfaisaient mon besoin de structure tout en lui donnant de la flexibilité sur comment il complétait ses parties. Je me suis concentré sur notre objectif commun plutôt que sur nos différences. Nous avons livré un projet solide et avons en fait développé un respect mutuel. J'ai appris que le professionnalisme signifie travailler efficacement avec tout le monde, pas seulement les personnes avec qui on s'entend naturellement.",
		tips: ["Never badmouth the person — show maturity and professionalism", "Focus on the solution you found, not the problem", "Show you learned something valuable from the experience"],
		tipsFr: ["Ne dénigrez jamais la personne — montrez de la maturité et du professionnalisme", "Concentrez-vous sur la solution trouvée, pas le problème", "Montrez que vous avez appris quelque chose de précieux de l'expérience"],
	},
	{
		id: qid("cross"),
		question: "What is your approach to continuous improvement?",
		questionFr: "Quelle est votre approche de l'amélioration continue ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"I practice continuous improvement by following the PDCA cycle (Plan-Do-Check-Act) in my daily work. I regularly ask myself: what went well, what could be better, and what will I do differently next time? I seek feedback from peers and supervisors after completing major tasks. I invest at least 30 minutes daily in learning — whether reading an article, watching a tutorial, or practicing a new skill. I also share what I learn with colleagues, because teaching others reinforces my own understanding. I believe that small, consistent improvements compound into significant growth over time.",
		sampleAnswerFr:
			"Je pratique l'amélioration continue en suivant le cycle PDCA (Planifier-Faire-Vérifier-Agir) dans mon travail quotidien. Je me demande régulièrement : qu'est-ce qui a bien fonctionné, qu'est-ce qui pourrait être amélioré, et que ferai-je différemment la prochaine fois ? Je cherche le feedback de mes pairs et superviseurs après les tâches majeures. J'investis au moins 30 minutes par jour dans l'apprentissage — que ce soit lire un article, regarder un tutoriel, ou pratiquer une nouvelle compétence. Je partage aussi ce que j'apprends avec mes collègues, car enseigner aux autres renforce ma propre compréhension. Je crois que de petites améliorations constantes se cumulent en une croissance significative avec le temps.",
		tips: ["Reference the PDCA cycle or Kaizen philosophy", "Show specific daily learning habits", "Mention that you share knowledge with others — it shows leadership"],
		tipsFr: ["Référencez le cycle PDCA ou la philosophie Kaizen", "Montrez des habitudes d'apprentissage quotidien spécifiques", "Mentionnez que vous partagez vos connaissances avec les autres — cela montre du leadership"],
	},
	{
		id: qid("cross"),
		question: "What is your understanding of corporate social responsibility (CSR)?",
		questionFr: "Quelle est votre compréhension de la responsabilité sociale des entreprises (RSE) ?",
		type: "competency",
		field: "général",
		difficulty: "medium",
		sampleAnswer:
			"CSR means businesses taking responsibility for their impact on society and the environment beyond just profit. It covers: environmental sustainability (reducing carbon footprint, waste management, renewable energy), social impact (fair labor practices, community engagement, diversity), ethical governance (transparency, anti-corruption, compliance), and economic contribution (local sourcing, job creation, fair taxation). In Morocco, major companies like OCP have robust CSR programs — OCP Foundation invests in education and agriculture across rural Morocco. As a professional, I would actively participate in CSR initiatives and ensure my work contributes to the company's sustainability goals.",
		sampleAnswerFr:
			"La RSE signifie que les entreprises assument la responsabilité de leur impact sur la société et l'environnement au-delà du simple profit. Elle couvre : la durabilité environnementale (réduction de l'empreinte carbone, gestion des déchets, énergie renouvelable), l'impact social (pratiques de travail équitables, engagement communautaire, diversité), la gouvernance éthique (transparence, anti-corruption, conformité), et la contribution économique (approvisionnement local, création d'emplois, fiscalité équitable). Au Maroc, de grandes entreprises comme OCP ont des programmes RSE robustes — la Fondation OCP investit dans l'éducation et l'agriculture à travers le Maroc rural. En tant que professionnel, je participerais activement aux initiatives RSE et m'assurerais que mon travail contribue aux objectifs de durabilité de l'entreprise.",
		tips: ["Show you understand the four pillars of CSR", "Reference Moroccan companies with strong CSR programs", "Express genuine interest in contributing to CSR initiatives"],
		tipsFr: ["Montrez que vous comprenez les quatre piliers de la RSE", "Référencez des entreprises marocaines avec de solides programmes RSE", "Exprimez un intérêt sincère à contribuer aux initiatives RSE"],
	},

	// =========================================================================
	// BATCH 2: ADDITIONAL QUESTIONS TO REACH 300+ (compact format)
	// =========================================================================

	// --- INFORMATIQUE technical ---
	{ id: qid("info"), question: "What is caching and how does it improve performance?", questionFr: "Qu'est-ce que le caching et comment améliore-t-il la performance ?", type: "technical", field: "génie-informatique", difficulty: "medium", sampleAnswer: "Caching stores frequently accessed data in a fast-access layer (memory) to reduce database queries and API calls. Common caching tools include Redis and Memcached for server-side, and browser localStorage/sessionStorage for client-side. Cache strategies include write-through, write-behind, and cache-aside. Key decisions are TTL (time-to-live) and cache invalidation. The saying 'there are only two hard things in CS: cache invalidation and naming things' highlights the complexity of keeping cached data consistent with the source.", sampleAnswerFr: "Le caching stocke les données fréquemment accédées dans une couche à accès rapide (mémoire) pour réduire les requêtes base de données et les appels API. Les outils de cache courants incluent Redis et Memcached côté serveur, et localStorage/sessionStorage du navigateur côté client. Les stratégies de cache incluent write-through, write-behind et cache-aside. Les décisions clés sont le TTL (time-to-live) et l'invalidation du cache. Le dicton 'il n'y a que deux choses difficiles en informatique : l'invalidation du cache et le nommage' souligne la complexité de garder les données en cache cohérentes avec la source.", tips: ["Name specific caching tools: Redis, Memcached, CDN", "Explain cache invalidation strategies", "Discuss trade-offs between freshness and performance"], tipsFr: ["Nommez des outils de cache spécifiques : Redis, Memcached, CDN", "Expliquez les stratégies d'invalidation du cache", "Discutez des compromis entre fraîcheur et performance"] },
	{ id: qid("info"), question: "What is the difference between cookies, localStorage, and sessionStorage?", questionFr: "Quelle est la différence entre les cookies, localStorage et sessionStorage ?", type: "technical", field: "génie-informatique", difficulty: "easy", sampleAnswer: "Cookies are small data stored by the browser, sent with every HTTP request (max 4KB), and can have expiration dates. They are used for authentication and tracking. localStorage persists data permanently (up to 5-10MB) in the browser with no expiration — ideal for user preferences. sessionStorage is similar but data is cleared when the tab closes — used for temporary form data. Cookies can be accessed server-side; localStorage and sessionStorage are client-side only. For security, never store sensitive data in any of these without encryption.", sampleAnswerFr: "Les cookies sont de petites données stockées par le navigateur, envoyées avec chaque requête HTTP (max 4Ko), et peuvent avoir des dates d'expiration. Ils sont utilisés pour l'authentification et le tracking. localStorage persiste les données de façon permanente (jusqu'à 5-10Mo) dans le navigateur sans expiration — idéal pour les préférences utilisateur. sessionStorage est similaire mais les données sont effacées à la fermeture de l'onglet — utilisé pour les données de formulaire temporaires. Les cookies sont accessibles côté serveur ; localStorage et sessionStorage sont côté client uniquement. Pour la sécurité, ne stockez jamais de données sensibles sans chiffrement.", tips: ["Compare storage size, lifetime, and accessibility", "Mention security considerations", "Know when to use each one"], tipsFr: ["Comparez la taille de stockage, la durée de vie et l'accessibilité", "Mentionnez les considérations de sécurité", "Sachez quand utiliser chacun"] },
	{ id: qid("info"), question: "Explain the concept of asynchronous programming.", questionFr: "Expliquez le concept de la programmation asynchrone.", type: "technical", field: "génie-informatique", difficulty: "medium", sampleAnswer: "Asynchronous programming allows code to run non-blocking operations — the program continues executing while waiting for I/O operations (API calls, file reads, database queries) to complete. In JavaScript, this is achieved through callbacks, Promises, and async/await. In Java, CompletableFuture and the reactive programming model (Project Reactor) serve the same purpose. Async programming is essential for responsive UIs and high-throughput servers, as it prevents thread blocking. The event loop in Node.js is a key example of single-threaded async execution handling thousands of concurrent connections.", sampleAnswerFr: "La programmation asynchrone permet au code d'exécuter des opérations non bloquantes — le programme continue son exécution en attendant que les opérations I/O (appels API, lectures de fichiers, requêtes base de données) se terminent. En JavaScript, cela se fait via les callbacks, les Promises et async/await. En Java, CompletableFuture et le modèle de programmation réactive (Project Reactor) servent le même objectif. La programmation asynchrone est essentielle pour les UI réactives et les serveurs à haut débit, car elle empêche le blocage des threads. L'event loop de Node.js est un exemple clé d'exécution asynchrone mono-thread gérant des milliers de connexions concurrentes.", tips: ["Explain callbacks, Promises, and async/await in progression", "Give a practical example of when async is essential", "Mention the event loop concept"], tipsFr: ["Expliquez les callbacks, Promises et async/await en progression", "Donnez un exemple pratique de quand l'asynchrone est essentiel", "Mentionnez le concept d'event loop"] },
	{ id: qid("info"), question: "What are environment variables and why are they important?", questionFr: "Que sont les variables d'environnement et pourquoi sont-elles importantes ?", type: "technical", field: "génie-informatique", difficulty: "easy", sampleAnswer: "Environment variables are key-value pairs stored outside the codebase that configure application behavior. They are important for security (API keys, database passwords never committed to Git), flexibility (different configs for development, staging, production), and portability (same code runs in different environments). In a Node.js app, I use .env files with dotenv locally and configure them directly on the server in production. The .env file must be in .gitignore. Tools like Docker and Kubernetes use environment variables extensively for container configuration.", sampleAnswerFr: "Les variables d'environnement sont des paires clé-valeur stockées en dehors du code qui configurent le comportement de l'application. Elles sont importantes pour la sécurité (clés API, mots de passe de base de données jamais commités sur Git), la flexibilité (configs différentes pour dev, staging, production), et la portabilité (le même code fonctionne dans différents environnements). Dans une app Node.js, j'utilise les fichiers .env avec dotenv en local et les configure directement sur le serveur en production. Le fichier .env doit être dans .gitignore. Des outils comme Docker et Kubernetes utilisent extensivement les variables d'environnement pour la configuration des conteneurs.", tips: ["Never commit .env files to version control", "Mention tools: dotenv, Docker env vars, Kubernetes secrets", "Explain the security benefit of separating config from code"], tipsFr: ["Ne commitez jamais les fichiers .env dans le contrôle de version", "Mentionnez les outils : dotenv, variables Docker, secrets Kubernetes", "Expliquez l'avantage sécurité de séparer la config du code"] },
	{ id: qid("info"), question: "How do you debug a complex application issue?", questionFr: "Comment débuguez-vous un problème complexe dans une application ?", type: "technical", field: "génie-informatique", difficulty: "hard", sampleAnswer: "I follow a systematic approach: 1) Reproduce the issue consistently, 2) Read the error messages and stack traces carefully, 3) Narrow down the scope using binary search — comment out or isolate parts of the code, 4) Use debugging tools: browser DevTools for frontend, breakpoints in VS Code or IntelliJ for backend, console.log/print statements for quick checks, 5) Check the application logs and database state, 6) Search for the error message online (Stack Overflow, GitHub issues), 7) If stuck, take a break or explain the problem to a colleague (rubber duck debugging). I document the root cause and fix in comments or a knowledge base.", sampleAnswerFr: "Je suis une approche systématique : 1) Reproduire le problème de manière consistante, 2) Lire les messages d'erreur et les stack traces attentivement, 3) Réduire le périmètre par recherche binaire — commenter ou isoler des parties du code, 4) Utiliser les outils de debug : DevTools du navigateur pour le frontend, breakpoints dans VS Code ou IntelliJ pour le backend, console.log/print pour les vérifications rapides, 5) Vérifier les logs de l'application et l'état de la base de données, 6) Rechercher le message d'erreur en ligne (Stack Overflow, GitHub issues), 7) Si bloqué, faire une pause ou expliquer le problème à un collègue (rubber duck debugging). Je documente la cause racine et le correctif dans les commentaires ou une base de connaissances.", tips: ["Show a structured debugging methodology", "Name specific debugging tools you use", "Mention rubber duck debugging — it shows self-awareness"], tipsFr: ["Montrez une méthodologie de debug structurée", "Nommez des outils de debug spécifiques que vous utilisez", "Mentionnez le rubber duck debugging — cela montre de la conscience de soi"] },
	{ id: qid("info"), question: "What are indexes in a database and when should you use them?", questionFr: "Que sont les index dans une base de données et quand les utiliser ?", type: "technical", field: "génie-informatique", difficulty: "medium", sampleAnswer: "An index is a data structure (usually B-tree) that speeds up data retrieval by creating a sorted reference to rows. Like a book index, it lets the database find rows without scanning the entire table. Use indexes on: columns in WHERE clauses, JOIN columns, ORDER BY columns, and columns with high selectivity. However, indexes slow down INSERT/UPDATE/DELETE operations and consume storage. Over-indexing is as bad as under-indexing. I use EXPLAIN ANALYZE to verify an index is actually being used. Common types: B-tree (default), hash, GIN (for arrays/JSON), and GiST (for spatial data).", sampleAnswerFr: "Un index est une structure de données (généralement B-tree) qui accélère la récupération des données en créant une référence triée vers les lignes. Comme l'index d'un livre, il permet à la base de données de trouver des lignes sans scanner toute la table. Utilisez des index sur : les colonnes dans les clauses WHERE, les colonnes de JOIN, les colonnes ORDER BY, et les colonnes avec une haute sélectivité. Cependant, les index ralentissent les opérations INSERT/UPDATE/DELETE et consomment du stockage. Le sur-indexage est aussi mauvais que le sous-indexage. J'utilise EXPLAIN ANALYZE pour vérifier qu'un index est réellement utilisé. Types courants : B-tree (défaut), hash, GIN (pour arrays/JSON), et GiST (pour données spatiales).", tips: ["Explain both benefits and costs of indexes", "Know when NOT to use indexes (small tables, high-write workloads)", "Mention EXPLAIN ANALYZE for validation"], tipsFr: ["Expliquez les avantages et les coûts des index", "Sachez quand NE PAS utiliser d'index (petites tables, forte écriture)", "Mentionnez EXPLAIN ANALYZE pour la validation"] },
	{ id: qid("info"), question: "What is TypeScript and why use it over JavaScript?", questionFr: "Qu'est-ce que TypeScript et pourquoi l'utiliser plutôt que JavaScript ?", type: "technical", field: "génie-informatique", difficulty: "easy", sampleAnswer: "TypeScript is a superset of JavaScript that adds static typing. Benefits include: catching type errors at compile time instead of runtime, better IDE support (autocomplete, refactoring), self-documenting code through type annotations, improved team collaboration on large codebases, and easier refactoring. TypeScript compiles to JavaScript, so it runs anywhere JS runs. Major frameworks like Angular require TypeScript, and React/Vue have excellent TypeScript support. The tradeoff is a slightly longer setup and learning curve, but the benefits far outweigh the costs for any project beyond a simple script.", sampleAnswerFr: "TypeScript est un surensemble de JavaScript qui ajoute le typage statique. Les avantages incluent : la détection des erreurs de type à la compilation plutôt qu'à l'exécution, un meilleur support IDE (autocomplétion, refactoring), du code auto-documenté par les annotations de type, une meilleure collaboration d'équipe sur les grandes bases de code, et un refactoring plus facile. TypeScript se compile en JavaScript, donc il fonctionne partout où JS fonctionne. Les principaux frameworks comme Angular requièrent TypeScript, et React/Vue ont un excellent support TypeScript. Le compromis est un setup et une courbe d'apprentissage légèrement plus longs, mais les avantages surpassent largement les coûts pour tout projet au-delà d'un simple script.", tips: ["Explain the concrete benefits of static typing", "Show you understand the trade-offs", "Mention which Moroccan companies use TypeScript"], tipsFr: ["Expliquez les avantages concrets du typage statique", "Montrez que vous comprenez les compromis", "Mentionnez quelles entreprises marocaines utilisent TypeScript"] },

	// --- INDUSTRIEL additional ---
	{ id: qid("indus"), question: "What is a Kanban system and how does it work?", questionFr: "Qu'est-ce qu'un système Kanban et comment fonctionne-t-il ?", type: "technical", field: "génie-industriel", difficulty: "easy", sampleAnswer: "Kanban is a visual pull-based system that controls the flow of work. Physical kanban cards signal when to produce or move materials — a downstream process sends a card upstream when it needs parts, triggering production only when needed. Key elements include: kanban cards (production and withdrawal), kanban boards (visualizing workflow stages), WIP limits (maximum items in each stage), and continuous flow. Benefits include reduced inventory, improved visibility, and faster response to demand changes. Digital kanban boards (Trello, Jira) apply the same principles to software development and project management.", sampleAnswerFr: "Le Kanban est un système visuel en flux tiré qui contrôle le flux de travail. Les cartes kanban physiques signalent quand produire ou déplacer des matériaux — un processus aval envoie une carte en amont quand il a besoin de pièces, déclenchant la production uniquement quand nécessaire. Les éléments clés incluent : les cartes kanban (production et retrait), les tableaux kanban (visualisation des étapes du flux), les limites de WIP (maximum d'éléments par étape), et le flux continu. Les avantages incluent la réduction des stocks, une meilleure visibilité, et une réponse plus rapide aux changements de demande. Les tableaux kanban numériques (Trello, Jira) appliquent les mêmes principes au développement logiciel et à la gestion de projet.", tips: ["Explain both physical kanban (manufacturing) and digital kanban (software)", "Show how kanban connects to JIT and pull systems", "Mention WIP limits as a key kanban concept"], tipsFr: ["Expliquez le kanban physique (fabrication) et numérique (logiciel)", "Montrez comment le kanban se connecte au JAT et aux systèmes en flux tiré", "Mentionnez les limites de WIP comme concept clé du kanban"] },
	{ id: qid("indus"), question: "How do you perform a Pareto analysis for quality improvement?", questionFr: "Comment réalisez-vous une analyse de Pareto pour l'amélioration qualité ?", type: "technical", field: "génie-industriel", difficulty: "easy", sampleAnswer: "Pareto analysis is based on the 80/20 rule — 80% of problems come from 20% of causes. Steps: 1) Collect defect data by category over a defined period, 2) Sort categories by frequency or cost (highest first), 3) Calculate cumulative percentage, 4) Create a Pareto chart (bar chart with cumulative line), 5) Identify the vital few causes above the 80% threshold, 6) Focus improvement efforts on these top causes. For example, in a manufacturing plant, I might find that 3 out of 12 defect types cause 82% of quality issues. By addressing just these three, I can achieve the greatest improvement with the least effort.", sampleAnswerFr: "L'analyse de Pareto est basée sur la règle 80/20 — 80% des problèmes viennent de 20% des causes. Étapes : 1) Collecter les données de défauts par catégorie sur une période définie, 2) Trier les catégories par fréquence ou coût (plus élevé en premier), 3) Calculer le pourcentage cumulé, 4) Créer un diagramme de Pareto (diagramme à barres avec ligne cumulative), 5) Identifier les causes vitales au-dessus du seuil de 80%, 6) Concentrer les efforts d'amélioration sur ces causes principales. Par exemple, dans une usine, je pourrais trouver que 3 des 12 types de défauts causent 82% des problèmes qualité. En traitant juste ces trois, j'obtiens la plus grande amélioration avec le moins d'effort.", tips: ["Know the 80/20 rule and how to apply it", "Be able to create and interpret a Pareto chart", "Show how Pareto analysis guides resource allocation for improvement"], tipsFr: ["Connaissez la règle 80/20 et comment l'appliquer", "Soyez capable de créer et interpréter un diagramme de Pareto", "Montrez comment l'analyse de Pareto guide l'allocation des ressources pour l'amélioration"] },
	{ id: qid("indus"), question: "Explain the difference between push and pull production systems.", questionFr: "Expliquez la différence entre les systèmes de production en flux poussé et tiré.", type: "technical", field: "génie-industriel", difficulty: "easy", sampleAnswer: "A push system produces based on forecasts — Material Requirements Planning (MRP) schedules production regardless of actual demand, building inventory in anticipation. A pull system produces based on actual customer demand — production is triggered by downstream consumption signals (kanban). Push advantages: economies of scale, better capacity utilization. Push disadvantages: excess inventory, overproduction waste. Pull advantages: lower inventory, better responsiveness, less waste. Pull disadvantages: requires reliable suppliers and flexible equipment. Most modern factories use a hybrid: push for long-lead items and pull for final assembly. Renault Tangier uses pull for vehicle assembly with push for certain long-lead components.", sampleAnswerFr: "Un système poussé produit selon les prévisions — la planification des besoins matières (MRP) programme la production indépendamment de la demande réelle, constituant des stocks par anticipation. Un système tiré produit selon la demande client réelle — la production est déclenchée par les signaux de consommation aval (kanban). Avantages du poussé : économies d'échelle, meilleure utilisation des capacités. Inconvénients : stocks excédentaires, gaspillage de surproduction. Avantages du tiré : stocks plus bas, meilleure réactivité, moins de gaspillage. Inconvénients : nécessite des fournisseurs fiables et des équipements flexibles. La plupart des usines modernes utilisent un hybride : poussé pour les articles à long délai et tiré pour l'assemblage final. Renault Tanger utilise le tiré pour l'assemblage de véhicules avec le poussé pour certains composants à long délai.", tips: ["Compare both systems with clear advantages and disadvantages", "Mention the hybrid approach used in practice", "Reference Moroccan manufacturing examples"], tipsFr: ["Comparez les deux systèmes avec des avantages et inconvénients clairs", "Mentionnez l'approche hybride utilisée en pratique", "Référencez des exemples de fabrication marocains"] },
	{ id: qid("indus"), question: "What is Statistical Process Control (SPC)?", questionFr: "Qu'est-ce que la Maîtrise Statistique des Procédés (MSP/SPC) ?", type: "technical", field: "génie-industriel", difficulty: "medium", sampleAnswer: "SPC uses statistical methods to monitor and control manufacturing processes. The key tool is the control chart, which plots measurements over time against upper and lower control limits (UCL/LCL) set at ±3 sigma from the process mean. Points within limits indicate a stable process (common cause variation). Points outside or patterns (trends, runs, cycles) indicate special cause variation requiring investigation. Key charts include: X-bar and R charts for variable data, p-charts for defect proportions, and c-charts for defect counts. SPC enables proactive quality management — catching process shifts before defects reach the customer.", sampleAnswerFr: "Le SPC utilise des méthodes statistiques pour surveiller et contrôler les processus de fabrication. L'outil clé est la carte de contrôle, qui trace les mesures dans le temps par rapport aux limites de contrôle supérieure et inférieure (LCS/LCI) fixées à ±3 sigma de la moyenne du processus. Les points dans les limites indiquent un processus stable (variation de cause commune). Les points en dehors ou les patterns (tendances, séries, cycles) indiquent une variation de cause spéciale nécessitant investigation. Les cartes clés incluent : cartes X-barre et R pour les données variables, cartes p pour les proportions de défauts, et cartes c pour les comptages de défauts. Le SPC permet un management qualité proactif — détectant les dérives du processus avant que les défauts n'atteignent le client.", tips: ["Know how to create and interpret control charts", "Explain the difference between common cause and special cause variation", "Mention the Western Electric rules for detecting patterns"], tipsFr: ["Sachez créer et interpréter des cartes de contrôle", "Expliquez la différence entre variation de cause commune et cause spéciale", "Mentionnez les règles de Western Electric pour détecter les patterns"] },

	// --- CIVIL additional ---
	{ id: qid("civil"), question: "What is the role of a site engineer during construction?", questionFr: "Quel est le rôle d'un ingénieur de chantier pendant la construction ?", type: "competency", field: "génie-civil", difficulty: "easy", sampleAnswer: "A site engineer is responsible for the day-to-day technical management of construction activities. Key duties include: interpreting drawings and specifications, setting out (surveying reference points), supervising construction works for quality compliance, preparing daily reports and progress records, coordinating with subcontractors and suppliers, ordering materials and verifying deliveries, performing quantity surveys for interim payments, identifying and reporting technical issues to the project manager, and ensuring health and safety compliance. In Morocco, the site engineer also liaises with the Bureau de Contrôle (inspection body) for structural works approval.", sampleAnswerFr: "L'ingénieur de chantier est responsable de la gestion technique quotidienne des activités de construction. Les devoirs clés incluent : interpréter les plans et spécifications, implanter (levés topographiques des points de référence), superviser les travaux pour la conformité qualité, préparer les rapports quotidiens et les relevés d'avancement, coordonner avec les sous-traitants et fournisseurs, commander les matériaux et vérifier les livraisons, effectuer les relevés de quantités pour les paiements intermédiaires, identifier et rapporter les problèmes techniques au chef de projet, et assurer la conformité santé et sécurité. Au Maroc, l'ingénieur de chantier fait aussi la liaison avec le Bureau de Contrôle pour l'approbation des travaux structuraux.", tips: ["Show you understand both technical and management responsibilities", "Mention the importance of documentation and reporting", "Reference Morocco-specific requirements (Bureau de Contrôle)"], tipsFr: ["Montrez que vous comprenez les responsabilités techniques et managériales", "Mentionnez l'importance de la documentation et du reporting", "Référencez les exigences spécifiques au Maroc (Bureau de Contrôle)"] },
	{ id: qid("civil"), question: "Explain the concept of soil bearing capacity.", questionFr: "Expliquez le concept de la capacité portante du sol.", type: "technical", field: "génie-civil", difficulty: "medium", sampleAnswer: "Soil bearing capacity is the maximum pressure a soil can support without failure or excessive settlement. It is determined through geotechnical investigation: field tests (Standard Penetration Test SPT, Cone Penetration Test CPT, plate load test) and laboratory tests (triaxial, direct shear, consolidation). The allowable bearing capacity includes a safety factor (typically 2.5-3.0) applied to the ultimate bearing capacity. Terzaghi's equation is commonly used for calculation. In Morocco, the LPEE (national geotechnical lab) performs these investigations. Typical values range from 0.5 bar for soft clay to 5+ bar for rock. Foundation type and size are directly determined by the soil bearing capacity.", sampleAnswerFr: "La capacité portante du sol est la pression maximale qu'un sol peut supporter sans rupture ni tassement excessif. Elle est déterminée par l'investigation géotechnique : essais sur site (essai de pénétration standard SPT, essai de pénétration au cône CPT, essai de plaque) et essais en laboratoire (triaxial, cisaillement direct, consolidation). La capacité portante admissible inclut un coefficient de sécurité (typiquement 2,5-3,0) appliqué à la capacité portante ultime. L'équation de Terzaghi est couramment utilisée pour le calcul. Au Maroc, le LPEE (laboratoire géotechnique national) réalise ces investigations. Les valeurs typiques vont de 0,5 bar pour l'argile molle à 5+ bar pour la roche. Le type et la taille des fondations sont directement déterminés par la capacité portante du sol.", tips: ["Know the common field and lab tests for determining bearing capacity", "Reference Terzaghi's bearing capacity equation", "Mention the LPEE and its role in Moroccan geotechnical practice"], tipsFr: ["Connaissez les essais courants sur site et en laboratoire pour déterminer la capacité portante", "Référencez l'équation de capacité portante de Terzaghi", "Mentionnez le LPEE et son rôle dans la pratique géotechnique marocaine"] },
	{ id: qid("civil"), question: "What are the main types of cement used in Morocco?", questionFr: "Quels sont les principaux types de ciment utilisés au Maroc ?", type: "technical", field: "génie-civil", difficulty: "easy", sampleAnswer: "Morocco produces several cement types per NM standards: CPJ 35 (Portland composite cement, lower strength, used for non-structural elements), CPJ 45 (most common, general construction, residential buildings), CPJ 55 (higher strength, structural elements requiring early strength), CPA 55 (pure Portland cement, bridges and special structures), and sulfate-resistant cement (for foundations in aggressive soil conditions). Morocco is a major cement producer with companies like LafargeHolcim Maroc, Ciments du Maroc (HeidelbergCement), and CIMAT. Annual production exceeds 15 million tons. The Moroccan cement industry follows NM 10.1.004 standard.", sampleAnswerFr: "Le Maroc produit plusieurs types de ciment selon les normes NM : CPJ 35 (ciment portland composé, résistance plus faible, utilisé pour les éléments non structuraux), CPJ 45 (le plus courant, construction générale, bâtiments résidentiels), CPJ 55 (résistance plus élevée, éléments structuraux nécessitant une résistance précoce), CPA 55 (ciment portland pur, ponts et structures spéciales), et le ciment résistant aux sulfates (pour les fondations en conditions de sol agressives). Le Maroc est un important producteur de ciment avec des entreprises comme LafargeHolcim Maroc, Ciments du Maroc (HeidelbergCement), et CIMAT. La production annuelle dépasse 15 millions de tonnes. L'industrie cimentière marocaine suit la norme NM 10.1.004.", tips: ["Know the CPJ and CPA designations and their applications", "Name the major Moroccan cement companies", "Show awareness of NM standards for cement"], tipsFr: ["Connaissez les désignations CPJ et CPA et leurs applications", "Nommez les principales cimenteries marocaines", "Montrez votre connaissance des normes NM pour le ciment"] },

	// --- ELECTRIQUE additional ---
	{ id: qid("elec"), question: "What is the difference between a transformer and a voltage regulator?", questionFr: "Quelle est la différence entre un transformateur et un régulateur de tension ?", type: "technical", field: "génie-électrique", difficulty: "easy", sampleAnswer: "A transformer changes voltage levels between circuits using electromagnetic induction — it steps up or steps down AC voltage based on the turns ratio (V1/V2 = N1/N2). A voltage regulator maintains a constant output voltage despite variations in input voltage or load. Regulators can be linear (LM7805 for 5V) or switching (buck/boost converters). Transformers handle large power levels for distribution; regulators fine-tune voltage for sensitive electronics. In a typical system, a transformer steps down 20kV to 400V, then voltage regulators provide stable 24V, 12V, or 5V for control electronics.", sampleAnswerFr: "Un transformateur change les niveaux de tension entre circuits par induction électromagnétique — il élève ou abaisse la tension AC selon le rapport de spires (V1/V2 = N1/N2). Un régulateur de tension maintient une tension de sortie constante malgré les variations de tension d'entrée ou de charge. Les régulateurs peuvent être linéaires (LM7805 pour 5V) ou à découpage (convertisseurs buck/boost). Les transformateurs gèrent de grandes puissances pour la distribution ; les régulateurs affinent la tension pour l'électronique sensible. Dans un système typique, un transformateur abaisse de 20kV à 400V, puis les régulateurs fournissent des tensions stables de 24V, 12V ou 5V pour l'électronique de contrôle.", tips: ["Know the transformer turns ratio formula", "Explain linear vs switching regulators", "Show how both work together in a power distribution system"], tipsFr: ["Connaissez la formule du rapport de spires du transformateur", "Expliquez les régulateurs linéaires vs à découpage", "Montrez comment les deux fonctionnent ensemble dans un système de distribution électrique"] },
	{ id: qid("elec"), question: "How do solar photovoltaic systems work?", questionFr: "Comment fonctionnent les systèmes solaires photovoltaïques ?", type: "technical", field: "génie-électrique", difficulty: "medium", sampleAnswer: "PV systems convert sunlight into electricity through the photovoltaic effect. Key components: PV panels (monocrystalline or polycrystalline silicon cells), inverter (converts DC to AC — string inverters or microinverters), mounting structure, wiring and protection (DC/AC breakers, surge protectors), and optionally batteries for storage. On-grid systems feed excess power to the grid; off-grid systems use batteries for 24/7 power. In Morocco, solar irradiance averages 5+ kWh/m2/day — among the highest globally. The Moroccan government offers incentives through Loi 13-09 for self-consumption installations. Noor-Ouarzazate demonstrates Morocco's commitment to solar energy at utility scale.", sampleAnswerFr: "Les systèmes PV convertissent la lumière du soleil en électricité par l'effet photovoltaïque. Composants clés : panneaux PV (cellules en silicium monocristallin ou polycristallin), onduleur (convertit le DC en AC — onduleurs string ou micro-onduleurs), structure de montage, câblage et protection (disjoncteurs DC/AC, parafoudres), et optionnellement des batteries pour le stockage. Les systèmes raccordés au réseau injectent l'excédent de puissance ; les systèmes hors réseau utilisent des batteries pour une alimentation 24/7. Au Maroc, l'irradiance solaire moyenne dépasse 5 kWh/m2/jour — parmi les plus élevées au monde. Le gouvernement marocain offre des incitations via la Loi 13-09 pour les installations en autoconsommation. Noor-Ouarzazate démontre l'engagement du Maroc envers l'énergie solaire à l'échelle utilitaire.", tips: ["Know the components of a PV system and their functions", "Mention Morocco's excellent solar potential (5+ kWh/m2/day)", "Reference Loi 13-09 and Noor-Ouarzazate as concrete Moroccan examples"], tipsFr: ["Connaissez les composants d'un système PV et leurs fonctions", "Mentionnez l'excellent potentiel solaire du Maroc (5+ kWh/m2/jour)", "Référencez la Loi 13-09 et Noor-Ouarzazate comme exemples marocains concrets"] },

	// --- MANAGEMENT additional ---
	{ id: qid("mgmt"), question: "What is the difference between leadership and management?", questionFr: "Quelle est la différence entre le leadership et le management ?", type: "competency", field: "management", difficulty: "easy", sampleAnswer: "Management focuses on planning, organizing, and controlling resources to achieve defined objectives — it is about doing things right. Leadership focuses on inspiring, motivating, and guiding people toward a vision — it is about doing the right things. Managers work within established systems; leaders challenge and transform them. Good managers ensure efficiency and consistency; good leaders drive innovation and change. In practice, the best professionals are both managers AND leaders — they deliver results while inspiring their teams. As a new graduate, I aim to develop both skill sets throughout my career.", sampleAnswerFr: "Le management se concentre sur la planification, l'organisation et le contrôle des ressources pour atteindre des objectifs définis — il s'agit de bien faire les choses. Le leadership se concentre sur l'inspiration, la motivation et le guidage des personnes vers une vision — il s'agit de faire les bonnes choses. Les managers travaillent dans les systèmes établis ; les leaders les remettent en question et les transforment. Les bons managers assurent l'efficacité et la cohérence ; les bons leaders poussent l'innovation et le changement. En pratique, les meilleurs professionnels sont à la fois managers ET leaders — ils délivrent des résultats tout en inspirant leurs équipes. En tant que jeune diplômé, je vise à développer les deux compétences tout au long de ma carrière.", tips: ["Show you understand both concepts and their complementarity", "Avoid saying one is 'better' than the other", "Give an example of when you demonstrated each"], tipsFr: ["Montrez que vous comprenez les deux concepts et leur complémentarité", "Évitez de dire que l'un est 'meilleur' que l'autre", "Donnez un exemple de quand vous avez démontré chacun"] },
	{ id: qid("mgmt"), question: "How do you make decisions under uncertainty?", questionFr: "Comment prenez-vous des décisions dans l'incertitude ?", type: "competency", field: "management", difficulty: "hard", sampleAnswer: "Under uncertainty, I follow a structured approach: gather all available data (even incomplete), identify the key assumptions and risks, evaluate options using decision matrices or weighted scoring, consult with knowledgeable colleagues or mentors, consider worst-case scenarios and their mitigation plans, and make a timely decision — analysis paralysis is worse than an imperfect decision. I use the 70% rule: if I have 70% of the information and a strong conviction, I decide and course-correct as new data emerges. I document my reasoning so the decision can be reviewed and learned from later.", sampleAnswerFr: "Dans l'incertitude, je suis une approche structurée : rassembler toutes les données disponibles (même incomplètes), identifier les hypothèses clés et les risques, évaluer les options avec des matrices de décision ou un scoring pondéré, consulter des collègues ou mentors compétents, considérer les scénarios worst-case et leurs plans d'atténuation, et prendre une décision en temps opportun — la paralysie d'analyse est pire qu'une décision imparfaite. J'utilise la règle des 70% : si j'ai 70% de l'information et une forte conviction, je décide et corrige le cap à mesure que de nouvelles données émergent. Je documente mon raisonnement pour que la décision puisse être revue et apprise plus tard.", tips: ["Show a structured decision-making framework", "Mention the 70% rule to show you balance analysis with action", "Emphasize that documenting reasoning enables learning from decisions"], tipsFr: ["Montrez un cadre de prise de décision structuré", "Mentionnez la règle des 70% pour montrer que vous équilibrez analyse et action", "Soulignez que documenter le raisonnement permet d'apprendre des décisions"] },
	{ id: qid("mgmt"), question: "What is emotional intelligence and why is it important at work?", questionFr: "Qu'est-ce que l'intelligence émotionnelle et pourquoi est-elle importante au travail ?", type: "competency", field: "management", difficulty: "medium", sampleAnswer: "Emotional intelligence (EI) is the ability to recognize, understand, and manage your own emotions and those of others. It has five components: self-awareness (knowing your emotions), self-regulation (controlling impulsive reactions), motivation (inner drive), empathy (understanding others' feelings), and social skills (managing relationships). Studies show EI is a stronger predictor of leadership effectiveness than IQ. In the Moroccan workplace, where relationships and respect are highly valued, EI is particularly important for building trust, resolving conflicts, and leading teams effectively.", sampleAnswerFr: "L'intelligence émotionnelle (IE) est la capacité à reconnaître, comprendre et gérer ses propres émotions et celles des autres. Elle a cinq composantes : la conscience de soi (connaître ses émotions), l'autorégulation (contrôler les réactions impulsives), la motivation (drive intérieur), l'empathie (comprendre les sentiments des autres), et les compétences sociales (gérer les relations). Des études montrent que l'IE est un meilleur prédicteur de l'efficacité du leadership que le QI. Dans le lieu de travail marocain, où les relations et le respect sont très valorisés, l'IE est particulièrement importante pour construire la confiance, résoudre les conflits et diriger les équipes efficacement.", tips: ["Name the five components of emotional intelligence", "Give an example of how you used EI in a real situation", "Mention that EI is especially important in relationship-oriented cultures like Morocco"], tipsFr: ["Nommez les cinq composantes de l'intelligence émotionnelle", "Donnez un exemple de comment vous avez utilisé l'IE dans une situation réelle", "Mentionnez que l'IE est particulièrement importante dans les cultures orientées relations comme le Maroc"] },

	// --- COMMERCE additional ---
	{ id: qid("comm"), question: "How do you evaluate a new international market for expansion?", questionFr: "Comment évaluez-vous un nouveau marché international pour l'expansion ?", type: "situational", field: "commerce-international", difficulty: "hard", sampleAnswer: "I use a systematic market assessment framework: PESTEL analysis (Political stability, Economic indicators, Social/cultural factors, Technology infrastructure, Environmental regulations, Legal framework), market size and growth rate, competitive landscape (Porter's Five Forces), trade barriers (tariffs, non-tariff barriers, regulations), logistics infrastructure, cultural compatibility, and risk assessment. For Morocco targeting Africa, I would evaluate: GDP growth, population demographics, existing trade agreements (Morocco-Africa FTAs), language compatibility (French-speaking Africa), banking infrastructure (Moroccan banks already present in 25+ African countries), and political stability. I would quantify the opportunity with market sizing and financial projections.", sampleAnswerFr: "J'utilise un cadre systématique d'évaluation de marché : analyse PESTEL (stabilité Politique, indicateurs Économiques, facteurs Sociaux/culturels, infrastructure Technologique, réglementations Environnementales, cadre Légal), taille et taux de croissance du marché, paysage concurrentiel (Cinq Forces de Porter), barrières commerciales (tarifs, barrières non tarifaires, réglementations), infrastructure logistique, compatibilité culturelle, et évaluation des risques. Pour le Maroc ciblant l'Afrique, j'évaluerais : croissance du PIB, démographie de la population, accords commerciaux existants (ALE Maroc-Afrique), compatibilité linguistique (Afrique francophone), infrastructure bancaire (banques marocaines déjà présentes dans 25+ pays africains), et stabilité politique. Je quantifierais l'opportunité avec un dimensionnement de marché et des projections financières.", tips: ["Show a structured analytical framework (PESTEL, Porter)", "Reference Morocco's strategic position for African expansion", "Mention existing trade agreements and institutional presence"], tipsFr: ["Montrez un cadre analytique structuré (PESTEL, Porter)", "Référencez la position stratégique du Maroc pour l'expansion africaine", "Mentionnez les accords commerciaux existants et la présence institutionnelle"] },
	{ id: qid("comm"), question: "What documents are required for international trade?", questionFr: "Quels documents sont nécessaires pour le commerce international ?", type: "technical", field: "commerce-international", difficulty: "easy", sampleAnswer: "Key trade documents include: Commercial Invoice (description, quantity, price, terms), Packing List (detailed contents of each package), Bill of Lading (ocean) or Air Waybill (air transport receipt and title document), Certificate of Origin (proves where goods were manufactured — needed for preferential tariffs under FTAs), Insurance Certificate (covers goods during transit), Customs Declaration (DUM in Morocco), Inspection Certificate (quality verification if required), and Phytosanitary/Health Certificate (for food and agricultural products). For Morocco-EU trade, EUR.1 movement certificate or origin declaration on the invoice is needed for preferential tariff rates.", sampleAnswerFr: "Les documents commerciaux clés incluent : la Facture Commerciale (description, quantité, prix, conditions), la Liste de Colisage (contenu détaillé de chaque colis), le Connaissement (maritime) ou la Lettre de Transport Aérien (reçu de transport et titre de propriété), le Certificat d'Origine (prouve où les marchandises ont été fabriquées — nécessaire pour les tarifs préférentiels sous les ALE), le Certificat d'Assurance (couvre les marchandises pendant le transit), la Déclaration en Douane (DUM au Maroc), le Certificat d'Inspection (vérification qualité si requis), et le Certificat Phytosanitaire/Sanitaire (pour les produits alimentaires et agricoles). Pour le commerce Maroc-UE, le certificat de circulation EUR.1 ou la déclaration d'origine sur la facture est nécessaire pour les tarifs préférentiels.", tips: ["Know each document's purpose and who issues it", "Mention EUR.1 for Morocco-EU preferential trade", "Show awareness of document requirements for different product types"], tipsFr: ["Connaissez l'objectif de chaque document et qui l'émet", "Mentionnez l'EUR.1 pour le commerce préférentiel Maroc-UE", "Montrez votre connaissance des exigences documentaires pour différents types de produits"] },

	// --- LOGISTIQUE additional ---
	{ id: qid("log"), question: "What is a TMS (Transportation Management System)?", questionFr: "Qu'est-ce qu'un TMS (Transportation Management System) ?", type: "technical", field: "logistique", difficulty: "medium", sampleAnswer: "A TMS is software that optimizes the planning, execution, and tracking of freight movements. Key functions include: route optimization (finding the most cost-effective routes considering distance, time, fuel, and tolls), carrier selection and rate management, load consolidation (combining shipments for efficiency), real-time shipment tracking via GPS and EDI, freight auditing and payment, and performance analytics. A TMS typically reduces transportation costs by 5-15% through better routing, carrier negotiation, and load optimization. Leading TMS solutions include Oracle Transportation Management, SAP TM, and MercuryGate. In Morocco, CTM and SDTM are implementing TMS to optimize their national distribution networks.", sampleAnswerFr: "Un TMS est un logiciel qui optimise la planification, l'exécution et le suivi des mouvements de fret. Les fonctions clés incluent : l'optimisation des itinéraires (trouver les routes les plus rentables en considérant distance, temps, carburant et péages), la sélection et la gestion des tarifs transporteurs, la consolidation des charges (combiner les expéditions pour l'efficacité), le suivi en temps réel des expéditions via GPS et EDI, l'audit et le paiement du fret, et l'analytique de performance. Un TMS réduit typiquement les coûts de transport de 5 à 15% grâce à un meilleur routage, la négociation avec les transporteurs et l'optimisation des charges. Les solutions TMS leaders incluent Oracle Transportation Management, SAP TM et MercuryGate. Au Maroc, CTM et SDTM implémentent des TMS pour optimiser leurs réseaux de distribution nationaux.", tips: ["Explain the main functions and their business benefits", "Mention specific TMS products and their capabilities", "Reference Moroccan logistics companies adopting TMS"], tipsFr: ["Expliquez les principales fonctions et leurs avantages business", "Mentionnez des produits TMS spécifiques et leurs capacités", "Référencez des entreprises logistiques marocaines adoptant le TMS"] },
	{ id: qid("log"), question: "What is the bullwhip effect in supply chain management?", questionFr: "Qu'est-ce que l'effet coup de fouet (bullwhip effect) dans la gestion de la chaîne d'approvisionnement ?", type: "technical", field: "logistique", difficulty: "hard", sampleAnswer: "The bullwhip effect is the amplification of demand variability as you move upstream in the supply chain. A small change in consumer demand causes increasingly larger fluctuations in orders at the retailer, distributor, manufacturer, and supplier levels. Causes include: demand forecast updating (each level adds safety stock), order batching (ordering in large lots for discounts), price fluctuations (forward buying during promotions), and rationing/shortage gaming (over-ordering during shortages). Mitigation strategies include: sharing real-time point-of-sale data across the chain (ECR, CPFR), reducing lead times, implementing JIT, using everyday low pricing, and vendor-managed inventory (VMI).", sampleAnswerFr: "L'effet coup de fouet est l'amplification de la variabilité de la demande en remontant la chaîne d'approvisionnement. Un petit changement dans la demande des consommateurs cause des fluctuations de plus en plus grandes dans les commandes au niveau du détaillant, du distributeur, du fabricant et du fournisseur. Les causes incluent : la mise à jour des prévisions de demande (chaque niveau ajoute un stock de sécurité), le groupement de commandes (commander en gros lots pour des remises), les fluctuations de prix (achat anticipé pendant les promotions), et le rationnement (sur-commander pendant les pénuries). Les stratégies d'atténuation incluent : le partage de données de point de vente en temps réel dans la chaîne (ECR, CPFR), la réduction des délais, l'implémentation du JAT, les prix bas quotidiens, et le stock géré par le fournisseur (VMI).", tips: ["Explain the causes of amplification at each level", "Name specific mitigation strategies: VMI, CPFR, ECR", "Give a real-world example of the bullwhip effect"], tipsFr: ["Expliquez les causes d'amplification à chaque niveau", "Nommez des stratégies d'atténuation spécifiques : VMI, CPFR, ECR", "Donnez un exemple réel de l'effet coup de fouet"] },

	// --- FINANCE additional ---
	{ id: qid("fin"), question: "What is the time value of money?", questionFr: "Qu'est-ce que la valeur temps de l'argent ?", type: "technical", field: "finance", difficulty: "easy", sampleAnswer: "The time value of money (TVM) states that a dirham today is worth more than a dirham tomorrow, because today's dirham can be invested to earn interest. Key formulas: Future Value FV = PV x (1+r)^n, Present Value PV = FV / (1+r)^n, where r is the interest rate and n is the number of periods. Applications include: evaluating investment opportunities (NPV, IRR), loan amortization calculations, retirement planning, and comparing cash flows at different points in time. In Morocco, with Bank Al-Maghrib's key rate around 2.75%, TVM calculations are essential for any financial decision.", sampleAnswerFr: "La valeur temps de l'argent (VTA) stipule qu'un dirham aujourd'hui vaut plus qu'un dirham demain, car le dirham d'aujourd'hui peut être investi pour gagner des intérêts. Formules clés : Valeur Future VF = VA x (1+r)^n, Valeur Actuelle VA = VF / (1+r)^n, où r est le taux d'intérêt et n le nombre de périodes. Les applications incluent : l'évaluation des opportunités d'investissement (VAN, TRI), les calculs d'amortissement de prêt, la planification de la retraite, et la comparaison de flux de trésorerie à différents moments. Au Maroc, avec le taux directeur de Bank Al-Maghrib autour de 2,75%, les calculs de VTA sont essentiels pour toute décision financière.", tips: ["Know the FV and PV formulas by heart", "Be able to calculate on paper or in Excel", "Reference Morocco's current interest rates"], tipsFr: ["Connaissez les formules VF et VA par cœur", "Soyez capable de calculer sur papier ou dans Excel", "Référencez les taux d'intérêt actuels du Maroc"] },
	{ id: qid("fin"), question: "What is a balance sheet and how do you read one?", questionFr: "Qu'est-ce qu'un bilan et comment le lisez-vous ?", type: "technical", field: "finance", difficulty: "easy", sampleAnswer: "A balance sheet (Bilan) shows a company's financial position at a specific date. It follows the equation: Assets = Liabilities + Equity. Assets (Actif) include: fixed assets (immobilisations — buildings, equipment) and current assets (actifs circulants — inventory, receivables, cash). Liabilities (Passif) include: long-term debt (financement permanent) and current liabilities (passif circulant — payables, short-term debt). Equity (capitaux propres) is the owners' residual interest. Key ratios from the balance sheet: current ratio (liquidity), debt-to-equity (leverage), and return on equity (profitability). In Morocco, the Bilan follows CGNC format with specific line items.", sampleAnswerFr: "Un bilan montre la position financière d'une entreprise à une date précise. Il suit l'équation : Actif = Passif + Capitaux Propres. L'Actif inclut : les immobilisations (bâtiments, équipements) et les actifs circulants (stocks, créances, trésorerie). Le Passif inclut : les dettes à long terme (financement permanent) et les dettes à court terme (passif circulant — fournisseurs, dettes court terme). Les Capitaux Propres sont l'intérêt résiduel des propriétaires. Ratios clés du bilan : ratio de liquidité (liquidité courante), dette sur fonds propres (levier), et rendement des fonds propres (rentabilité). Au Maroc, le Bilan suit le format CGNC avec des postes spécifiques.", tips: ["Know the fundamental accounting equation", "Be able to calculate key ratios from the balance sheet", "Reference the CGNC format used in Morocco"], tipsFr: ["Connaissez l'équation comptable fondamentale", "Soyez capable de calculer les ratios clés à partir du bilan", "Référencez le format CGNC utilisé au Maroc"] },

	// --- MARKETING additional ---
	{ id: qid("mkt"), question: "What is SEO and how would you improve a website's ranking?", questionFr: "Qu'est-ce que le SEO et comment amélioreriez-vous le classement d'un site web ?", type: "technical", field: "marketing", difficulty: "medium", sampleAnswer: "SEO (Search Engine Optimization) improves a website's visibility in search engine results. Key strategies: On-page SEO (keyword-optimized title tags, meta descriptions, headers, URL structure, content quality, image alt text), Technical SEO (site speed, mobile responsiveness, SSL, XML sitemap, structured data), Off-page SEO (backlinks from quality sites, social signals, local listings), and Content SEO (creating valuable, original content targeting specific keywords). For a Moroccan website, I would also focus on: French and Arabic keyword research, Google My Business optimization, local citations on Moroccan directories, and content addressing Moroccan market needs. Tools: Google Analytics, Google Search Console, Ahrefs or SEMrush.", sampleAnswerFr: "Le SEO (Search Engine Optimization) améliore la visibilité d'un site web dans les résultats des moteurs de recherche. Stratégies clés : SEO on-page (balises titre optimisées, méta-descriptions, en-têtes, structure URL, qualité du contenu, texte alt des images), SEO technique (vitesse du site, responsive mobile, SSL, sitemap XML, données structurées), SEO off-page (backlinks de sites de qualité, signaux sociaux, inscriptions locales), et SEO de contenu (créer du contenu de valeur ciblant des mots-clés spécifiques). Pour un site marocain, je me concentrerais aussi sur : la recherche de mots-clés en français et arabe, l'optimisation Google My Business, les citations locales sur les annuaires marocains, et du contenu adressant les besoins du marché marocain. Outils : Google Analytics, Google Search Console, Ahrefs ou SEMrush.", tips: ["Cover all four types of SEO: on-page, technical, off-page, content", "Mention bilingual keyword research for Morocco", "Name specific SEO tools you use"], tipsFr: ["Couvrez les quatre types de SEO : on-page, technique, off-page, contenu", "Mentionnez la recherche de mots-clés bilingue pour le Maroc", "Nommez des outils SEO spécifiques que vous utilisez"] },
	{ id: qid("mkt"), question: "How do you measure the ROI of a marketing campaign?", questionFr: "Comment mesurez-vous le ROI d'une campagne marketing ?", type: "technical", field: "marketing", difficulty: "medium", sampleAnswer: "ROI = (Revenue Generated - Campaign Cost) / Campaign Cost x 100. To measure it accurately, I track: conversion tracking (Google Analytics goals, pixel tracking), attribution models (first-touch, last-touch, multi-touch), key metrics per channel (CPA, ROAS, CLV), A/B testing results, and brand awareness surveys for upper-funnel campaigns. For digital campaigns, I use UTM parameters to track which channels and campaigns drive conversions. For offline campaigns, I use unique promo codes or dedicated landing pages. The challenge is attribution — a customer may interact with multiple touchpoints before converting. I recommend a multi-touch attribution model for accurate measurement.", sampleAnswerFr: "ROI = (Revenu Généré - Coût de la Campagne) / Coût de la Campagne x 100. Pour le mesurer précisément, je suis : le suivi de conversion (objectifs Google Analytics, pixel tracking), les modèles d'attribution (premier contact, dernier contact, multi-touch), les métriques clés par canal (CPA, ROAS, CLV), les résultats de tests A/B, et les enquêtes de notoriété pour les campagnes haut de funnel. Pour les campagnes digitales, j'utilise les paramètres UTM pour suivre quels canaux et campagnes génèrent des conversions. Pour les campagnes offline, j'utilise des codes promo uniques ou des landing pages dédiées. Le défi est l'attribution — un client peut interagir avec plusieurs points de contact avant de convertir. Je recommande un modèle d'attribution multi-touch pour une mesure précise.", tips: ["Know the ROI formula and how to apply it", "Explain attribution models and their trade-offs", "Mention specific tracking tools and methods"], tipsFr: ["Connaissez la formule du ROI et comment l'appliquer", "Expliquez les modèles d'attribution et leurs compromis", "Mentionnez des outils et méthodes de tracking spécifiques"] },

	// --- RH additional ---
	{ id: qid("rh"), question: "What is employee engagement and how do you improve it?", questionFr: "Qu'est-ce que l'engagement des employés et comment l'améliorez-vous ?", type: "competency", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "Employee engagement is the emotional commitment an employee has to the organization and its goals. Engaged employees are more productive, stay longer, and deliver better customer service. To improve engagement: provide clear career development paths and training opportunities, recognize and reward good performance (both monetary and non-monetary), create open communication channels (regular one-on-ones, surveys, town halls), foster a positive work culture with work-life balance, involve employees in decision-making, and ensure fair compensation. In Morocco, where family and personal relationships are valued, work-life balance and respectful management are especially important engagement drivers.", sampleAnswerFr: "L'engagement des employés est l'engagement émotionnel qu'un employé a envers l'organisation et ses objectifs. Les employés engagés sont plus productifs, restent plus longtemps, et offrent un meilleur service client. Pour améliorer l'engagement : fournir des parcours de développement de carrière clairs et des opportunités de formation, reconnaître et récompenser la bonne performance (monétaire et non-monétaire), créer des canaux de communication ouverts (entretiens individuels réguliers, sondages, réunions plénières), favoriser une culture de travail positive avec un équilibre vie pro-perso, impliquer les employés dans la prise de décision, et assurer une rémunération équitable. Au Maroc, où la famille et les relations personnelles sont valorisées, l'équilibre vie pro-perso et un management respectueux sont des leviers d'engagement particulièrement importants.", tips: ["Show you understand engagement is different from satisfaction", "Name specific engagement strategies with evidence of effectiveness", "Reference cultural factors specific to Moroccan employees"], tipsFr: ["Montrez que vous comprenez que l'engagement est différent de la satisfaction", "Nommez des stratégies d'engagement spécifiques avec des preuves d'efficacité", "Référencez les facteurs culturels spécifiques aux employés marocains"] },
	{ id: qid("rh"), question: "What is the CNSS and what are its obligations for employers?", questionFr: "Qu'est-ce que la CNSS et quelles sont ses obligations pour les employeurs ?", type: "technical", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "The CNSS (Caisse Nationale de Sécurité Sociale) is Morocco's national social security system. Employer obligations include: registering the company and all employees, paying monthly contributions (employer rate: approximately 21.09% of gross salary, covering family allowances, social insurance, and AMO health insurance; employee rate: approximately 6.74%), filing monthly and annual declarations, and respecting the SMIG minimum wage. CNSS provides employees with: family allowances, pension (after 3,240 days of contributions), maternity benefits, sickness benefits, and health coverage through AMO. Non-compliance results in penalties and potential prosecution. Recent reforms include the AMO extension to self-employed and informal workers.", sampleAnswerFr: "La CNSS (Caisse Nationale de Sécurité Sociale) est le système de sécurité sociale national du Maroc. Les obligations de l'employeur incluent : l'enregistrement de l'entreprise et de tous les employés, le paiement des cotisations mensuelles (taux employeur : environ 21,09% du salaire brut, couvrant les allocations familiales, l'assurance sociale et l'AMO assurance maladie ; taux salarié : environ 6,74%), le dépôt des déclarations mensuelles et annuelles, et le respect du SMIG salaire minimum. La CNSS fournit aux employés : les allocations familiales, la pension (après 3 240 jours de cotisations), les prestations de maternité, les indemnités de maladie, et la couverture santé via l'AMO. Le non-respect entraîne des pénalités et des poursuites potentielles. Les réformes récentes incluent l'extension de l'AMO aux travailleurs indépendants et informels.", tips: ["Know the current employer and employee contribution rates", "Mention AMO health insurance coverage", "Reference recent CNSS reforms and extensions"], tipsFr: ["Connaissez les taux de cotisation actuels employeur et salarié", "Mentionnez la couverture d'assurance maladie AMO", "Référencez les réformes et extensions récentes de la CNSS"] },

	// --- More cross-field general ---
	{ id: qid("cross"), question: "What do you think makes a great team?", questionFr: "Qu'est-ce qui fait une grande équipe selon vous ?", type: "behavioral", field: "général", difficulty: "easy", sampleAnswer: "A great team has: clear shared goals that everyone understands and commits to, diverse skills and perspectives that complement each other, open and honest communication where people feel safe to speak up, mutual trust and respect among members, effective leadership that empowers rather than micromanages, and a culture of continuous improvement where the team learns from both successes and failures. During my group projects at IMTA, the best teams were those where members held each other accountable while supporting each other through challenges.", sampleAnswerFr: "Une grande équipe a : des objectifs partagés clairs que tout le monde comprend et auxquels tous s'engagent, des compétences et perspectives diverses qui se complètent, une communication ouverte et honnête où les gens se sentent en sécurité pour s'exprimer, une confiance et un respect mutuels entre les membres, un leadership efficace qui responsabilise plutôt que de micro-gérer, et une culture d'amélioration continue où l'équipe apprend des succès et des échecs. Pendant mes projets de groupe à l'IMTA, les meilleures équipes étaient celles où les membres se tenaient mutuellement responsables tout en se soutenant face aux défis.", tips: ["Reference specific team experiences from school or internship", "Show you value both performance and relationships", "Mention psychological safety as a key team ingredient"], tipsFr: ["Référencez des expériences d'équipe spécifiques de l'école ou du stage", "Montrez que vous valorisez à la fois la performance et les relations", "Mentionnez la sécurité psychologique comme ingrédient clé d'une équipe"] },
	{ id: qid("cross"), question: "If you had to choose between quality and speed, what would you prioritize?", questionFr: "Si vous deviez choisir entre la qualité et la rapidité, que prioriseriez-vous ?", type: "situational", field: "général", difficulty: "medium", sampleAnswer: "The answer depends on the context. For safety-critical work (medical devices, structural engineering, financial systems), quality must always come first — the cost of failure is too high. For iterative work (software MVP, marketing campaigns, prototypes), speed can take priority to get feedback quickly and iterate. My default is to aim for 'good enough' quality delivered on time, then improve in subsequent iterations. I would discuss the trade-off with my manager and stakeholders to understand their priorities. The worst outcome is late AND poor quality — which usually results from poor planning, not lack of effort.", sampleAnswerFr: "La réponse dépend du contexte. Pour le travail critique en sécurité (dispositifs médicaux, ingénierie structurale, systèmes financiers), la qualité doit toujours primer — le coût de l'échec est trop élevé. Pour le travail itératif (MVP logiciel, campagnes marketing, prototypes), la rapidité peut être prioritaire pour obtenir du feedback rapidement et itérer. Mon défaut est de viser une qualité 'suffisante' livrée à temps, puis d'améliorer dans les itérations suivantes. Je discuterais du compromis avec mon manager et les parties prenantes pour comprendre leurs priorités. Le pire résultat est en retard ET de mauvaise qualité — ce qui résulte généralement d'une mauvaise planification, pas d'un manque d'effort.", tips: ["Show nuanced thinking — the answer is 'it depends on context'", "Give specific examples of when you would prioritize each", "Mention that discussing with stakeholders is key"], tipsFr: ["Montrez une réflexion nuancée — la réponse est 'ça dépend du contexte'", "Donnez des exemples spécifiques de quand vous prioriseriez chacun", "Mentionnez que discuter avec les parties prenantes est clé"] },
	{ id: qid("cross"), question: "How would you onboard a new team member?", questionFr: "Comment intégreriez-vous un nouveau membre d'équipe ?", type: "situational", field: "général", difficulty: "medium", sampleAnswer: "A structured onboarding process includes: before Day 1 (prepare workspace, accounts, welcome email with practical info), Day 1 (warm welcome, team introductions, office tour, company overview), Week 1 (explain team structure, ongoing projects, tools, processes, assign a buddy for questions), Month 1 (gradually increasing responsibilities, regular check-ins, first small project assignment), and 90 days (full integration, feedback session, goal-setting for the next quarter). I would create a written onboarding checklist to ensure nothing is missed. The goal is to help the new hire become productive quickly while feeling welcomed and supported.", sampleAnswerFr: "Un processus d'intégration structuré inclut : avant le Jour 1 (préparer l'espace de travail, les comptes, un email de bienvenue avec les infos pratiques), Jour 1 (accueil chaleureux, présentations d'équipe, visite des bureaux, présentation de l'entreprise), Semaine 1 (expliquer la structure d'équipe, les projets en cours, les outils, les processus, assigner un parrain pour les questions), Mois 1 (responsabilités progressivement croissantes, check-ins réguliers, premier petit projet assigné), et 90 jours (intégration complète, session de feedback, fixation d'objectifs pour le prochain trimestre). Je créerais une checklist d'intégration écrite pour m'assurer que rien n'est oublié. L'objectif est d'aider le nouvel embauché à devenir productif rapidement tout en se sentant accueilli et soutenu.", tips: ["Show a timeline-based approach (Day 1, Week 1, Month 1, 90 days)", "Mention the buddy/mentor system", "Emphasize both practical setup and emotional welcome"], tipsFr: ["Montrez une approche basée sur un calendrier (Jour 1, Semaine 1, Mois 1, 90 jours)", "Mentionnez le système de parrainage/mentorat", "Mettez l'accent sur la préparation pratique et l'accueil émotionnel"] },
	{ id: qid("cross"), question: "Describe your ideal work environment.", questionFr: "Décrivez votre environnement de travail idéal.", type: "motivation", field: "général", difficulty: "easy", sampleAnswer: "My ideal work environment combines structure with flexibility — clear objectives and processes, but freedom in how I achieve them. I thrive in teams where collaboration is valued but individual focus time is protected. I appreciate a culture of continuous learning where asking questions is encouraged and mistakes are seen as learning opportunities. Good communication, regular feedback, and recognition of effort motivate me. I also value a workspace that is clean, well-equipped, and conducive to both focused work and team discussions.", sampleAnswerFr: "Mon environnement de travail idéal combine structure et flexibilité — des objectifs et processus clairs, mais la liberté dans la façon de les atteindre. J'évolue dans des équipes où la collaboration est valorisée mais le temps de concentration individuel est protégé. J'apprécie une culture d'apprentissage continu où poser des questions est encouragé et les erreurs sont vues comme des opportunités d'apprentissage. Une bonne communication, un feedback régulier et la reconnaissance de l'effort me motivent. Je valorise aussi un espace de travail propre, bien équipé et propice au travail concentré comme aux discussions d'équipe.", tips: ["Align your answer with what you know about the company culture", "Be honest but positive — avoid listing complaints about past experiences", "Show you value both independence and collaboration"], tipsFr: ["Alignez votre réponse avec ce que vous savez de la culture de l'entreprise", "Soyez honnête mais positif — évitez de lister des plaintes sur des expériences passées", "Montrez que vous valorisez à la fois l'indépendance et la collaboration"] },
	{ id: qid("cross"), question: "What would you do if you strongly disagreed with a company policy?", questionFr: "Que feriez-vous si vous étiez en fort désaccord avec une politique de l'entreprise ?", type: "situational", field: "général", difficulty: "hard", sampleAnswer: "I would first make sure I fully understand the policy and the reasoning behind it. Often, policies exist for good reasons that are not immediately obvious. If I still disagreed, I would research alternatives and prepare a constructive proposal with data supporting the change. I would present it through proper channels — to my manager or the relevant department — in a professional, respectful manner. If the policy remained unchanged, I would comply with it while continuing to advocate for improvement through appropriate means. I would never unilaterally ignore a company policy, but I believe respectful dissent drives positive change.", sampleAnswerFr: "Je m'assurerais d'abord de bien comprendre la politique et le raisonnement derrière. Souvent, les politiques existent pour de bonnes raisons qui ne sont pas immédiatement évidentes. Si j'étais toujours en désaccord, je rechercherais des alternatives et préparerais une proposition constructive avec des données soutenant le changement. Je la présenterais par les voies appropriées — à mon manager ou au département concerné — de manière professionnelle et respectueuse. Si la politique restait inchangée, je m'y conformerais tout en continuant à plaider pour l'amélioration par les moyens appropriés. Je n'ignorerais jamais unilatéralement une politique d'entreprise, mais je crois que la dissidence respectueuse pousse au changement positif.", tips: ["Show respect for established processes while demonstrating critical thinking", "Emphasize using proper channels for feedback", "Make clear that you comply even when you disagree"], tipsFr: ["Montrez du respect pour les processus établis tout en démontrant votre esprit critique", "Mettez l'accent sur l'utilisation des voies appropriées pour le feedback", "Indiquez clairement que vous vous conformez même en cas de désaccord"] },
	{ id: qid("cross"), question: "What legacy do you want to leave at your first company?", questionFr: "Quel héritage voulez-vous laisser dans votre première entreprise ?", type: "motivation", field: "général", difficulty: "medium", sampleAnswer: "I want to be remembered as someone who made a tangible positive impact — whether through a process I improved, a project I delivered excellently, or colleagues I helped grow. I aim to leave behind clear documentation and knowledge transfer so that my contributions continue to add value after I move on. Most importantly, I want to earn a reputation as a reliable, hard-working professional who always gave their best. I hope that when someone mentions my name years later, colleagues will say: 'They were someone you could always count on, and they made the team better.'", sampleAnswerFr: "Je veux qu'on se souvienne de moi comme quelqu'un qui a eu un impact positif tangible — que ce soit à travers un processus que j'ai amélioré, un projet que j'ai excellemment livré, ou des collègues que j'ai aidés à grandir. Je vise à laisser derrière moi une documentation claire et un transfert de connaissances pour que mes contributions continuent d'ajouter de la valeur après mon départ. Plus important encore, je veux gagner une réputation de professionnel fiable et travailleur qui a toujours donné le meilleur. J'espère que quand quelqu'un mentionnera mon nom des années plus tard, les collègues diront : 'C'était quelqu'un sur qui on pouvait toujours compter, et ils ont rendu l'équipe meilleure.'", tips: ["Show you think long-term about your professional impact", "Mention specific things: documentation, mentoring, process improvement", "Express genuine care about making a positive difference"], tipsFr: ["Montrez que vous pensez à long terme sur votre impact professionnel", "Mentionnez des choses spécifiques : documentation, mentorat, amélioration des processus", "Exprimez un souci sincère de faire une différence positive"] },

	// =========================================================================
	// EXPANSION BATCH 3 — 105+ additional questions for underrepresented areas
	// =========================================================================

	// --- MARKETING (additional 8 questions) ---
	{ id: qid("mkt"), question: "How would you launch a new product in the Moroccan market?", questionFr: "Comment lanceriez-vous un nouveau produit sur le marché marocain ?", type: "situational", field: "marketing", difficulty: "hard", sampleAnswer: "Launching in Morocco requires a tailored approach. Phase 1 — Market research: analyze competition, consumer behavior, purchasing power by region (Casablanca vs rural differs drastically), regulatory requirements, and distribution channels. Phase 2 — Positioning: define value proposition adapted to Moroccan consumers, price point aligned with purchasing power (consider different tiers), and bilingual branding (French/Arabic, possibly Darija for mass market). Phase 3 — Go-to-market: leverage social media heavily (Morocco has 22M+ Facebook users), partner with local influencers, use traditional media (radio for rural reach), organize launch events in key cities (Casablanca, Rabat, Marrakech), and set up distribution through existing retail networks or e-commerce (Jumia, Avito). Phase 4 — Measure and iterate: track KPIs weekly, gather customer feedback, adjust pricing and messaging.", sampleAnswerFr: "Le lancement au Maroc nécessite une approche adaptée. Phase 1 — Étude de marché : analyser la concurrence, le comportement des consommateurs, le pouvoir d'achat par région (Casablanca vs rural diffère drastiquement), les exigences réglementaires et les canaux de distribution. Phase 2 — Positionnement : définir la proposition de valeur adaptée aux consommateurs marocains, le prix aligné sur le pouvoir d'achat (considérer différents niveaux), et le branding bilingue (français/arabe, possiblement Darija pour le marché de masse). Phase 3 — Mise sur le marché : exploiter les réseaux sociaux fortement (le Maroc a 22M+ d'utilisateurs Facebook), s'associer avec des influenceurs locaux, utiliser les médias traditionnels (radio pour la portée rurale), organiser des événements de lancement dans les villes clés (Casablanca, Rabat, Marrakech), et mettre en place la distribution via les réseaux de détail existants ou l'e-commerce (Jumia, Avito). Phase 4 — Mesurer et itérer : suivre les KPIs hebdomadairement, recueillir les retours clients, ajuster les prix et le messaging.", tips: ["Show knowledge of Morocco's digital landscape and media consumption", "Mention regional differences in purchasing power", "Include both traditional and digital channels"], tipsFr: ["Montrez votre connaissance du paysage digital et de la consommation média au Maroc", "Mentionnez les différences régionales de pouvoir d'achat", "Incluez les canaux traditionnels et digitaux"] },
	{ id: qid("mkt"), question: "What is the difference between inbound and outbound marketing?", questionFr: "Quelle est la différence entre le marketing inbound et outbound ?", type: "technical", field: "marketing", difficulty: "easy", sampleAnswer: "Outbound marketing pushes messages to consumers (TV ads, cold calls, billboards, email blasts) — it interrupts the audience. Inbound marketing attracts customers by creating valuable content they seek out (blog posts, SEO, social media, webinars, ebooks). Outbound is broader reach but lower conversion; inbound is targeted and builds trust but takes longer. Modern marketing combines both: inbound for lead generation and nurturing (content marketing, SEO), outbound for brand awareness and immediate reach (paid ads, events). In Morocco, outbound remains strong (radio, billboards on autoroute) while inbound is growing rapidly with social media adoption.", sampleAnswerFr: "Le marketing outbound pousse des messages vers les consommateurs (pubs TV, appels à froid, panneaux d'affichage, emails en masse) — il interrompt l'audience. Le marketing inbound attire les clients en créant du contenu de valeur qu'ils recherchent (articles de blog, SEO, réseaux sociaux, webinaires, ebooks). L'outbound a une portée plus large mais une conversion plus faible ; l'inbound est ciblé et construit la confiance mais prend plus de temps. Le marketing moderne combine les deux : inbound pour la génération et le nurturing de leads (content marketing, SEO), outbound pour la notoriété de marque et la portée immédiate (pubs payantes, événements). Au Maroc, l'outbound reste fort (radio, panneaux sur l'autoroute) tandis que l'inbound croît rapidement avec l'adoption des réseaux sociaux.", tips: ["Explain both approaches clearly with examples", "Show understanding of when to use each", "Reference the Moroccan market context"], tipsFr: ["Expliquez les deux approches clairement avec des exemples", "Montrez votre compréhension de quand utiliser chacune", "Référencez le contexte du marché marocain"] },
	{ id: qid("mkt"), question: "How do you create a buyer persona?", questionFr: "Comment créez-vous un buyer persona ?", type: "competency", field: "marketing", difficulty: "medium", sampleAnswer: "A buyer persona is a semi-fictional representation of your ideal customer based on real data. Steps: 1) Gather data — interview existing customers, analyze CRM data, survey prospects, review social media analytics and website behavior. 2) Identify patterns — demographics (age, location, income, education), psychographics (values, goals, challenges, pain points), behavior (buying habits, preferred channels, decision-making process). 3) Create the persona document — give them a name and photo, write their story including job title, daily challenges, goals, objections to your product, and preferred information sources. 4) Validate — share with sales team, test against real customer data, refine over time. For the Moroccan market, consider: language preference (French vs Arabic vs Darija), urban vs rural lifestyle, family influence on purchasing decisions, and price sensitivity.", sampleAnswerFr: "Un buyer persona est une représentation semi-fictive de votre client idéal basée sur des données réelles. Étapes : 1) Collecter les données — interviewer les clients existants, analyser les données CRM, sonder les prospects, examiner les analytics des réseaux sociaux et le comportement sur le site web. 2) Identifier les patterns — démographiques (âge, localisation, revenu, éducation), psychographiques (valeurs, objectifs, défis, points de douleur), comportement (habitudes d'achat, canaux préférés, processus de décision). 3) Créer le document persona — lui donner un nom et une photo, écrire son histoire incluant le titre du poste, les défis quotidiens, les objectifs, les objections au produit, et les sources d'information préférées. 4) Valider — partager avec l'équipe commerciale, tester contre les données clients réelles, affiner au fil du temps. Pour le marché marocain, considérer : la préférence linguistique (français vs arabe vs Darija), le mode de vie urbain vs rural, l'influence de la famille sur les décisions d'achat, et la sensibilité au prix.", tips: ["Show a structured, data-driven approach", "Mention both quantitative and qualitative research methods", "Include Moroccan-specific cultural factors"], tipsFr: ["Montrez une approche structurée et basée sur les données", "Mentionnez les méthodes de recherche quantitatives et qualitatives", "Incluez les facteurs culturels spécifiques au Maroc"] },
	{ id: qid("mkt"), question: "What is content marketing and why is it important?", questionFr: "Qu'est-ce que le content marketing et pourquoi est-il important ?", type: "technical", field: "marketing", difficulty: "easy", sampleAnswer: "Content marketing is a strategic approach focused on creating and distributing valuable, relevant, consistent content to attract and retain a target audience — and ultimately drive profitable customer action. Unlike direct advertising, it provides value first. Types include: blog articles, videos, infographics, podcasts, case studies, whitepapers, social media posts, and email newsletters. It's important because: it builds trust and credibility, improves SEO and organic visibility, generates qualified leads at lower cost than paid advertising, educates potential customers, and establishes thought leadership. Content marketing costs 62% less than outbound marketing while generating 3x more leads. In Morocco, video content and social media are particularly effective channels.", sampleAnswerFr: "Le content marketing est une approche stratégique axée sur la création et la distribution de contenu de valeur, pertinent et cohérent pour attirer et retenir une audience cible — et ultimement générer des actions client profitables. Contrairement à la publicité directe, il apporte de la valeur en premier. Les types incluent : articles de blog, vidéos, infographies, podcasts, études de cas, livres blancs, posts sur réseaux sociaux, et newsletters email. Il est important car : il construit la confiance et la crédibilité, améliore le SEO et la visibilité organique, génère des leads qualifiés à moindre coût que la publicité payante, éduque les clients potentiels, et établit le leadership de pensée. Le content marketing coûte 62% de moins que le marketing outbound tout en générant 3x plus de leads. Au Maroc, le contenu vidéo et les réseaux sociaux sont des canaux particulièrement efficaces.", tips: ["Explain the difference between content marketing and traditional advertising", "Cite specific benefits with statistics if possible", "Mention which content types work best in Morocco"], tipsFr: ["Expliquez la différence entre le content marketing et la publicité traditionnelle", "Citez des bénéfices spécifiques avec des statistiques si possible", "Mentionnez quels types de contenu fonctionnent le mieux au Maroc"] },
	{ id: qid("mkt"), question: "How would you handle a social media crisis for a brand?", questionFr: "Comment géreriez-vous une crise sur les réseaux sociaux pour une marque ?", type: "situational", field: "marketing", difficulty: "hard", sampleAnswer: "Social media crises require swift, transparent, and empathetic responses. My approach: 1) Detect early — use social listening tools (Mention, Brandwatch), set up alerts for brand mentions and sentiment shifts. 2) Assess — determine severity (is it a single complaint or a viral issue?), identify the root cause, gather facts before responding. 3) Respond quickly — acknowledge the issue within 1-2 hours, show empathy, don't be defensive. 4) Take it offline when appropriate — offer direct contact for resolution. 5) Communicate the fix — explain what went wrong and what you're doing about it. 6) Post-crisis review — analyze what happened, update crisis communication plan, implement preventive measures. Key rules: never delete negative comments (it escalates), never argue publicly, always be transparent and human. In Morocco, crises can spread rapidly on Facebook and WhatsApp — speed of response is critical.", sampleAnswerFr: "Les crises sur les réseaux sociaux nécessitent des réponses rapides, transparentes et empathiques. Mon approche : 1) Détecter tôt — utiliser des outils de veille sociale (Mention, Brandwatch), configurer des alertes pour les mentions de marque et les changements de sentiment. 2) Évaluer — déterminer la gravité (est-ce une plainte unique ou un problème viral ?), identifier la cause racine, rassembler les faits avant de répondre. 3) Répondre rapidement — reconnaître le problème sous 1-2 heures, montrer de l'empathie, ne pas être défensif. 4) Passer en privé quand approprié — offrir un contact direct pour la résolution. 5) Communiquer la solution — expliquer ce qui s'est mal passé et ce que vous faites. 6) Bilan post-crise — analyser ce qui s'est passé, mettre à jour le plan de communication de crise, implémenter des mesures préventives. Règles clés : ne jamais supprimer les commentaires négatifs (ça escalade), ne jamais argumenter publiquement, toujours être transparent et humain. Au Maroc, les crises se propagent rapidement sur Facebook et WhatsApp — la rapidité de réponse est critique.", tips: ["Show a step-by-step crisis management framework", "Emphasize speed, transparency, and empathy", "Mention that deleting comments always makes it worse"], tipsFr: ["Montrez un framework de gestion de crise étape par étape", "Mettez l'accent sur la rapidité, la transparence et l'empathie", "Mentionnez que supprimer les commentaires empire toujours la situation"] },
	{ id: qid("mkt"), question: "What is your experience with email marketing?", questionFr: "Quelle est votre expérience avec l'email marketing ?", type: "competency", field: "marketing", difficulty: "medium", sampleAnswer: "Email marketing remains one of the highest ROI channels (average $42 return per $1 spent). Key components I understand: list building (lead magnets, opt-in forms, segmentation), email types (welcome series, nurture sequences, newsletters, promotional campaigns, transactional emails), design best practices (responsive templates, clear CTAs, concise copy, personalization with merge fields), deliverability (SPF/DKIM/DMARC authentication, list hygiene, avoiding spam triggers), and analytics (open rate, click-through rate, conversion rate, unsubscribe rate). Tools: Mailchimp, Sendinblue (popular in Francophone markets), HubSpot. For Moroccan audiences, I would focus on: French language emails, mobile-optimized design (high mobile usage), optimal send times for the Moroccan timezone, and compliance with Morocco's data protection law (Loi 09-08).", sampleAnswerFr: "L'email marketing reste l'un des canaux au meilleur ROI (en moyenne 42$ de retour par 1$ dépensé). Les composantes clés que je maîtrise : la construction de listes (lead magnets, formulaires opt-in, segmentation), les types d'emails (séries de bienvenue, séquences de nurturing, newsletters, campagnes promotionnelles, emails transactionnels), les bonnes pratiques de design (templates responsives, CTAs clairs, texte concis, personnalisation avec des champs de fusion), la délivrabilité (authentification SPF/DKIM/DMARC, hygiène de liste, éviter les déclencheurs de spam), et les analytics (taux d'ouverture, taux de clic, taux de conversion, taux de désabonnement). Outils : Mailchimp, Sendinblue (populaire dans les marchés francophones), HubSpot. Pour les audiences marocaines, je me concentrerais sur : les emails en français, le design optimisé mobile (forte utilisation mobile), les heures d'envoi optimales pour le fuseau horaire marocain, et la conformité avec la loi marocaine de protection des données (Loi 09-08).", tips: ["Show both strategic understanding and technical knowledge", "Mention email deliverability as a key concern", "Reference Morocco's data protection law (Loi 09-08)"], tipsFr: ["Montrez une compréhension stratégique et des connaissances techniques", "Mentionnez la délivrabilité comme une préoccupation clé", "Référencez la loi marocaine de protection des données (Loi 09-08)"] },
	{ id: qid("mkt"), question: "How do you segment a market?", questionFr: "Comment segmentez-vous un marché ?", type: "technical", field: "marketing", difficulty: "medium", sampleAnswer: "Market segmentation divides a broad market into distinct subgroups. Four main bases: 1) Demographic — age, gender, income, education, family size, occupation. 2) Geographic — country, region, city size, urban/rural, climate. In Morocco: Casablanca-Settat vs Draa-Tafilalet have very different needs. 3) Psychographic — lifestyle, values, personality, social class, interests. 4) Behavioral — purchase frequency, brand loyalty, usage rate, benefits sought, readiness to buy. Steps to segment: collect data (surveys, CRM, census data from HCP in Morocco), analyze clusters using statistical tools, evaluate segment attractiveness (size, growth, accessibility, actionability), select target segments, and develop positioning for each. A good segment must be: measurable, substantial, accessible, differentiable, and actionable.", sampleAnswerFr: "La segmentation de marché divise un marché large en sous-groupes distincts. Quatre bases principales : 1) Démographique — âge, genre, revenu, éducation, taille de la famille, profession. 2) Géographique — pays, région, taille de la ville, urbain/rural, climat. Au Maroc : Casablanca-Settat vs Draa-Tafilalet ont des besoins très différents. 3) Psychographique — style de vie, valeurs, personnalité, classe sociale, intérêts. 4) Comportementale — fréquence d'achat, fidélité à la marque, taux d'utilisation, bénéfices recherchés, disposition à acheter. Étapes pour segmenter : collecter les données (sondages, CRM, données du recensement du HCP au Maroc), analyser les clusters avec des outils statistiques, évaluer l'attractivité du segment (taille, croissance, accessibilité, actionnabilité), sélectionner les segments cibles, et développer le positionnement pour chacun. Un bon segment doit être : mesurable, substantiel, accessible, différenciable, et actionnable.", tips: ["Cover all four segmentation bases with examples", "Mention Morocco-specific segmentation factors", "Explain the criteria for evaluating segment attractiveness"], tipsFr: ["Couvrez les quatre bases de segmentation avec des exemples", "Mentionnez les facteurs de segmentation spécifiques au Maroc", "Expliquez les critères d'évaluation de l'attractivité d'un segment"] },
	{ id: qid("mkt"), question: "Why is this marketing position the right fit for you?", questionFr: "Pourquoi ce poste en marketing est-il fait pour vous ?", type: "motivation", field: "marketing", difficulty: "easy", sampleAnswer: "Marketing is where creativity meets data, and that combination energizes me. I'm passionate about understanding consumer behavior and translating insights into campaigns that drive results. My IMTA training gave me analytical skills — I can interpret data, build dashboards, and measure ROI with precision. But I also have a creative side — I enjoy crafting messages that resonate and designing campaigns that tell stories. This position specifically appeals to me because it combines digital marketing with traditional channels, which reflects the Moroccan market reality where both matter. I'm excited to apply my bilingual skills (French/Arabic) and my understanding of the local market to create campaigns that truly connect with Moroccan consumers.", sampleAnswerFr: "Le marketing est là où la créativité rencontre les données, et cette combinaison m'enthousiasme. Je suis passionné par la compréhension du comportement des consommateurs et la traduction d'insights en campagnes qui génèrent des résultats. Ma formation à l'IMTA m'a donné des compétences analytiques — je peux interpréter des données, construire des tableaux de bord, et mesurer le ROI avec précision. Mais j'ai aussi un côté créatif — j'aime créer des messages qui résonnent et concevoir des campagnes qui racontent des histoires. Ce poste m'attire spécifiquement car il combine le marketing digital avec les canaux traditionnels, ce qui reflète la réalité du marché marocain où les deux comptent. Je suis enthousiaste d'appliquer mes compétences bilingues (français/arabe) et ma compréhension du marché local pour créer des campagnes qui connectent vraiment avec les consommateurs marocains.", tips: ["Connect your skills to the specific role requirements", "Show passion for both creative and analytical aspects", "Demonstrate knowledge of the company and Moroccan market"], tipsFr: ["Connectez vos compétences aux exigences spécifiques du rôle", "Montrez votre passion pour les aspects créatifs et analytiques", "Démontrez votre connaissance de l'entreprise et du marché marocain"] },

	// --- RESSOURCES HUMAINES (additional 8 questions) ---
	{ id: qid("rh"), question: "How do you handle a conflict between two employees?", questionFr: "Comment gérez-vous un conflit entre deux employés ?", type: "situational", field: "ressources-humaines", difficulty: "hard", sampleAnswer: "I follow a structured mediation approach: 1) Listen to both parties separately — let each share their perspective without interruption, taking notes on facts versus feelings. 2) Identify the root cause — is it a personality clash, unclear roles, resource competition, or a miscommunication? 3) Bring them together for mediation — set ground rules (respectful communication, no interruptions), let each summarize the other's position to ensure understanding. 4) Find common ground — focus on shared goals and team objectives. 5) Agree on a resolution — specific actions each party will take, with clear timelines. 6) Follow up — check in after 1 week and 1 month to ensure the resolution holds. Key principles: remain neutral, focus on behavior not personality, document everything, and escalate to management if unresolved. Under Morocco's Code du Travail, repeated conflicts can constitute workplace harassment (harcèlement moral) requiring formal investigation.", sampleAnswerFr: "Je suis une approche de médiation structurée : 1) Écouter les deux parties séparément — laisser chacun partager sa perspective sans interruption, en notant les faits versus les sentiments. 2) Identifier la cause racine — est-ce un clash de personnalité, des rôles flous, une compétition de ressources, ou une mauvaise communication ? 3) Les réunir pour une médiation — établir des règles de base (communication respectueuse, pas d'interruptions), laisser chacun résumer la position de l'autre pour assurer la compréhension. 4) Trouver un terrain commun — se concentrer sur les objectifs partagés et les objectifs de l'équipe. 5) S'accorder sur une résolution — actions spécifiques que chaque partie prendra, avec des délais clairs. 6) Suivre — vérifier après 1 semaine et 1 mois pour s'assurer que la résolution tient. Principes clés : rester neutre, se concentrer sur le comportement et non la personnalité, tout documenter, et escalader au management si non résolu. Selon le Code du Travail marocain, les conflits répétés peuvent constituer du harcèlement moral nécessitant une enquête formelle.", tips: ["Show a clear step-by-step mediation process", "Emphasize neutrality and documentation", "Reference the Code du Travail and harassment provisions"], tipsFr: ["Montrez un processus de médiation clair étape par étape", "Mettez l'accent sur la neutralité et la documentation", "Référencez le Code du Travail et les dispositions sur le harcèlement"] },
	{ id: qid("rh"), question: "What is the recruitment process and how do you ensure fairness?", questionFr: "Quel est le processus de recrutement et comment assurez-vous l'équité ?", type: "competency", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "A fair recruitment process includes: 1) Job analysis — define the role, required competencies, and evaluation criteria BEFORE posting. 2) Sourcing — use multiple channels (job boards like ReKrute.com, LinkedIn, university partnerships, ANAPEC, employee referrals) to reach diverse candidates. 3) Screening — use standardized criteria to evaluate CVs, avoiding bias from names, photos, or personal details. 4) Structured interviews — ask all candidates the same questions, use scoring rubrics, involve multiple interviewers to reduce individual bias. 5) Assessment — use relevant skill tests or work samples rather than relying solely on interviews. 6) Decision — compare candidates against criteria (not against each other), document the rationale. 7) Feedback — provide constructive feedback to unsuccessful candidates. To ensure fairness: train interviewers on unconscious bias, use diverse interview panels, blind resume screening where possible, and ensure compliance with Morocco's anti-discrimination provisions (Article 9 of Code du Travail).", sampleAnswerFr: "Un processus de recrutement équitable inclut : 1) Analyse de poste — définir le rôle, les compétences requises et les critères d'évaluation AVANT la publication. 2) Sourcing — utiliser plusieurs canaux (sites d'emploi comme ReKrute.com, LinkedIn, partenariats universitaires, ANAPEC, recommandations d'employés) pour atteindre des candidats divers. 3) Tri — utiliser des critères standardisés pour évaluer les CV, en évitant les biais liés aux noms, photos ou détails personnels. 4) Entretiens structurés — poser les mêmes questions à tous les candidats, utiliser des grilles de notation, impliquer plusieurs intervieweurs pour réduire les biais individuels. 5) Évaluation — utiliser des tests de compétences pertinents ou des échantillons de travail plutôt que de se fier uniquement aux entretiens. 6) Décision — comparer les candidats aux critères (pas entre eux), documenter la justification. 7) Feedback — fournir un retour constructif aux candidats non retenus. Pour assurer l'équité : former les intervieweurs aux biais inconscients, utiliser des panels d'entretien divers, tri anonyme des CV si possible, et assurer la conformité avec les dispositions anti-discrimination du Maroc (Article 9 du Code du Travail).", tips: ["Show a comprehensive multi-step process", "Emphasize bias reduction at every stage", "Reference Moroccan job platforms and legal requirements"], tipsFr: ["Montrez un processus complet en plusieurs étapes", "Mettez l'accent sur la réduction des biais à chaque étape", "Référencez les plateformes d'emploi et exigences légales marocaines"] },
	{ id: qid("rh"), question: "What is performance management and how do you conduct an appraisal?", questionFr: "Qu'est-ce que la gestion de la performance et comment conduisez-vous une évaluation ?", type: "technical", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "Performance management is a continuous cycle of planning, monitoring, developing, and evaluating employee performance. An effective appraisal includes: 1) Preparation — review job description, previous objectives, self-assessment, and feedback from colleagues. 2) The meeting — create a comfortable environment, start with positives, discuss achievements vs objectives using specific examples, address development areas constructively, listen to the employee's perspective. 3) Rating — use clear criteria (SMART objectives, competency frameworks), avoid recency bias, halo effect, and central tendency. 4) Development plan — agree on training needs, career goals, and support required. 5) Goal setting — set SMART objectives for the next period. 6) Documentation — record the discussion and agreed actions. Modern trends: continuous feedback (not just annual reviews), 360-degree feedback, OKRs (Objectives and Key Results). In Morocco, appraisals are typically annual and linked to the prime de rendement (performance bonus).", sampleAnswerFr: "La gestion de la performance est un cycle continu de planification, suivi, développement et évaluation de la performance des employés. Une évaluation efficace inclut : 1) Préparation — revoir la fiche de poste, les objectifs précédents, l'auto-évaluation, et le feedback des collègues. 2) La réunion — créer un environnement confortable, commencer par les points positifs, discuter des réalisations vs objectifs avec des exemples spécifiques, aborder les axes d'amélioration de manière constructive, écouter la perspective de l'employé. 3) Notation — utiliser des critères clairs (objectifs SMART, référentiels de compétences), éviter le biais de récence, l'effet de halo, et la tendance centrale. 4) Plan de développement — convenir des besoins de formation, des objectifs de carrière, et du soutien requis. 5) Fixation d'objectifs — définir des objectifs SMART pour la prochaine période. 6) Documentation — consigner la discussion et les actions convenues. Tendances modernes : feedback continu (pas seulement des revues annuelles), feedback 360 degrés, OKRs (Objectives and Key Results). Au Maroc, les évaluations sont typiquement annuelles et liées à la prime de rendement.", tips: ["Show the complete appraisal cycle, not just the meeting", "Mention common rating biases and how to avoid them", "Reference the link to compensation in Moroccan practice"], tipsFr: ["Montrez le cycle complet d'évaluation, pas seulement la réunion", "Mentionnez les biais de notation courants et comment les éviter", "Référencez le lien avec la rémunération dans la pratique marocaine"] },
	{ id: qid("rh"), question: "What are the key provisions of Morocco's Code du Travail?", questionFr: "Quelles sont les dispositions clés du Code du Travail marocain ?", type: "technical", field: "ressources-humaines", difficulty: "hard", sampleAnswer: "Morocco's Code du Travail (Law 65-99, effective 2004) covers: Working hours — 44 hours/week (2,288 hours/year), overtime at 125% (day) or 150% (night) of normal rate. Leave — 18 days annual leave (1.5 days/month), plus 13 public holidays, maternity leave of 14 weeks (paid by CNSS). Contracts — CDD (fixed-term, max 1 year renewable once) and CDI (indefinite). Trial periods — 15 days (workers), 1.5 months (employees), 3 months (cadres). Termination — requires valid cause, notice period (8 days to 2 months depending on seniority), severance pay (96 hours/year for first 5 years, increasing to 336 hours/year after 15 years), unfair dismissal compensation of 1.5 months per year of service. Minimum wage — SMIG (industrie/commerce) and SMAG (agriculture). Workers' representatives — mandatory in companies with 10+ employees. Key protections: anti-discrimination (Article 9), prohibition of child labor under 15, workplace safety requirements.", sampleAnswerFr: "Le Code du Travail marocain (Loi 65-99, en vigueur depuis 2004) couvre : Heures de travail — 44 heures/semaine (2 288 heures/an), heures supplémentaires à 125% (jour) ou 150% (nuit) du taux normal. Congés — 18 jours de congé annuel (1,5 jours/mois), plus 13 jours fériés, congé maternité de 14 semaines (payé par la CNSS). Contrats — CDD (durée déterminée, max 1 an renouvelable une fois) et CDI (durée indéterminée). Périodes d'essai — 15 jours (ouvriers), 1,5 mois (employés), 3 mois (cadres). Licenciement — nécessite un motif valable, préavis (8 jours à 2 mois selon l'ancienneté), indemnité de licenciement (96 heures/an pour les 5 premières années, augmentant à 336 heures/an après 15 ans), indemnité de licenciement abusif de 1,5 mois par année de service. Salaire minimum — SMIG (industrie/commerce) et SMAG (agriculture). Représentants du personnel — obligatoires dans les entreprises de 10+ employés. Protections clés : anti-discrimination (Article 9), interdiction du travail des enfants de moins de 15 ans, exigences de sécurité au travail.", tips: ["Know the key numbers: 44h/week, 18 days leave, trial periods by category", "Understand both CDD and CDI contract types", "Reference specific articles for key protections"], tipsFr: ["Connaissez les chiffres clés : 44h/semaine, 18 jours de congé, périodes d'essai par catégorie", "Comprenez les deux types de contrat CDD et CDI", "Référencez les articles spécifiques pour les protections clés"] },
	{ id: qid("rh"), question: "How do you develop a training program for employees?", questionFr: "Comment développez-vous un programme de formation pour les employés ?", type: "competency", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "I follow the ADDIE model: 1) Analysis — identify training needs through performance gaps, skills assessments, business objectives, and employee surveys. Consider mandatory training (safety, compliance) vs development training. 2) Design — define learning objectives (what participants should know/do after training), choose delivery methods (classroom, e-learning, on-the-job, blended), determine duration and schedule, plan assessment methods. 3) Development — create content, materials, exercises, and evaluation tools. Ensure content is relevant and practical with real-world examples. 4) Implementation — deliver the training, manage logistics, ensure participant engagement. In Morocco, consider: French language delivery, OFPPT partnerships for technical training, contrats spéciaux de formation (CSF) for government co-funding. 5) Evaluation — use Kirkpatrick's model: Reaction (did they like it?), Learning (did they learn?), Behavior (did they apply it?), Results (did it impact business metrics?). Track ROI of training investment.", sampleAnswerFr: "Je suis le modèle ADDIE : 1) Analyse — identifier les besoins de formation par les écarts de performance, les évaluations de compétences, les objectifs business, et les sondages employés. Considérer la formation obligatoire (sécurité, conformité) vs la formation de développement. 2) Conception — définir les objectifs d'apprentissage (ce que les participants doivent savoir/faire après la formation), choisir les méthodes de livraison (présentiel, e-learning, sur le poste, mixte), déterminer la durée et le planning, planifier les méthodes d'évaluation. 3) Développement — créer le contenu, les supports, les exercices, et les outils d'évaluation. Assurer que le contenu est pertinent et pratique avec des exemples du monde réel. 4) Mise en oeuvre — livrer la formation, gérer la logistique, assurer l'engagement des participants. Au Maroc, considérer : la livraison en français, les partenariats OFPPT pour la formation technique, les contrats spéciaux de formation (CSF) pour le co-financement gouvernemental. 5) Évaluation — utiliser le modèle de Kirkpatrick : Réaction (ont-ils aimé ?), Apprentissage (ont-ils appris ?), Comportement (l'ont-ils appliqué ?), Résultats (impact sur les métriques business ?). Suivre le ROI de l'investissement en formation.", tips: ["Use the ADDIE model as your framework", "Mention Kirkpatrick's evaluation model", "Reference Moroccan training incentives (CSF, OFPPT)"], tipsFr: ["Utilisez le modèle ADDIE comme cadre", "Mentionnez le modèle d'évaluation de Kirkpatrick", "Référencez les incitations à la formation marocaines (CSF, OFPPT)"] },
	{ id: qid("rh"), question: "What is employer branding and why does it matter?", questionFr: "Qu'est-ce que la marque employeur et pourquoi est-elle importante ?", type: "technical", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "Employer branding is the reputation and image of a company as a place to work. It matters because: companies with strong employer brands receive 50% more qualified applicants, reduce cost-per-hire by 43%, and improve employee retention by 28%. Building a strong employer brand involves: defining and communicating your Employee Value Proposition (EVP — what makes your company unique as an employer), sharing authentic employee stories on social media and career pages, maintaining positive reviews on platforms like Glassdoor, offering competitive benefits and career development, creating a positive candidate experience (even for rejected applicants), and ensuring internal culture matches external messaging. In Morocco, employer branding is increasingly important as young graduates research companies on LinkedIn, ReKrute, and social media before applying. Companies like OCP and Renault Maroc have invested heavily in employer branding.", sampleAnswerFr: "La marque employeur est la réputation et l'image d'une entreprise en tant que lieu de travail. Elle compte car : les entreprises avec une marque employeur forte reçoivent 50% de candidats qualifiés en plus, réduisent le coût par embauche de 43%, et améliorent la rétention des employés de 28%. Construire une marque employeur forte implique : définir et communiquer votre Proposition de Valeur Employeur (EVP — ce qui rend votre entreprise unique en tant qu'employeur), partager des histoires authentiques d'employés sur les réseaux sociaux et les pages carrière, maintenir des avis positifs sur des plateformes comme Glassdoor, offrir des avantages compétitifs et du développement de carrière, créer une expérience candidat positive (même pour les candidats rejetés), et s'assurer que la culture interne correspond au messaging externe. Au Maroc, la marque employeur est de plus en plus importante car les jeunes diplômés recherchent les entreprises sur LinkedIn, ReKrute, et les réseaux sociaux avant de postuler. Des entreprises comme OCP et Renault Maroc ont investi massivement dans la marque employeur.", tips: ["Cite statistics on the impact of employer branding", "Explain the Employee Value Proposition concept", "Reference Moroccan platforms where candidates research employers"], tipsFr: ["Citez des statistiques sur l'impact de la marque employeur", "Expliquez le concept de Proposition de Valeur Employeur", "Référencez les plateformes marocaines où les candidats recherchent les employeurs"] },
	{ id: qid("rh"), question: "Why did you choose a career in Human Resources?", questionFr: "Pourquoi avez-vous choisi une carrière en Ressources Humaines ?", type: "motivation", field: "ressources-humaines", difficulty: "easy", sampleAnswer: "I chose HR because I believe that people are the most valuable asset of any organization, and I want to help create workplaces where people can thrive. What excites me about HR is the blend of strategic business thinking and human connection. On one day, I might be designing a compensation strategy that aligns with business goals; on another, I might be helping an employee navigate a career transition. I'm particularly interested in talent development — helping people discover and grow their potential. At IMTA, I saw firsthand how the right mentorship and support can transform a student's trajectory, and I want to do that at scale in organizations. Morocco's workforce is young (average age 29), and there's a tremendous opportunity to shape HR practices that unlock this demographic dividend.", sampleAnswerFr: "J'ai choisi les RH parce que je crois que les personnes sont l'actif le plus précieux de toute organisation, et je veux aider à créer des lieux de travail où les gens peuvent s'épanouir. Ce qui m'enthousiasme dans les RH est le mélange de réflexion stratégique business et de connexion humaine. Un jour, je pourrais concevoir une stratégie de rémunération alignée sur les objectifs business ; un autre jour, je pourrais aider un employé à naviguer une transition de carrière. Je suis particulièrement intéressé par le développement des talents — aider les gens à découvrir et développer leur potentiel. À l'IMTA, j'ai vu de mes propres yeux comment le bon mentorat et le bon soutien peuvent transformer la trajectoire d'un étudiant, et je veux faire cela à grande échelle dans les organisations. La main-d'oeuvre du Maroc est jeune (âge moyen 29 ans), et il y a une opportunité formidable de façonner des pratiques RH qui exploitent ce dividende démographique.", tips: ["Show genuine passion for people development", "Connect your IMTA experience to your HR motivation", "Mention Morocco's young workforce as an opportunity"], tipsFr: ["Montrez une passion sincère pour le développement des personnes", "Connectez votre expérience IMTA à votre motivation RH", "Mentionnez la jeunesse de la main-d'oeuvre marocaine comme une opportunité"] },
	{ id: qid("rh"), question: "How would you handle an employee's request for a salary increase?", questionFr: "Comment géreriez-vous la demande d'augmentation de salaire d'un employé ?", type: "situational", field: "ressources-humaines", difficulty: "medium", sampleAnswer: "I would handle it professionally and fairly: 1) Listen actively — understand the employee's rationale (market rate, performance, increased responsibilities, cost of living). 2) Research — compare their current salary against market data (salary surveys, ReKrute benchmarks), internal equity (what similar roles pay in the company), and the approved salary grid. 3) Evaluate performance — review recent performance reviews, contributions, and achievements. Has the role evolved beyond the original job description? 4) Consult with management — discuss the request with the employee's manager and budget constraints. 5) Respond transparently — if approved, communicate the amount and effective date. If denied, explain the reasons honestly and suggest a timeline for review or alternative recognition (training, title upgrade, bonus, additional responsibilities). 6) Document — record the request, decision, and rationale. Key: never promise what you can't deliver, and ensure consistency across the organization.", sampleAnswerFr: "Je le gérerais de manière professionnelle et équitable : 1) Écouter activement — comprendre la justification de l'employé (taux du marché, performance, responsabilités accrues, coût de la vie). 2) Rechercher — comparer son salaire actuel aux données du marché (enquêtes salariales, benchmarks ReKrute), l'équité interne (ce que paient les rôles similaires dans l'entreprise), et la grille salariale approuvée. 3) Évaluer la performance — revoir les évaluations récentes, les contributions et les réalisations. Le rôle a-t-il évolué au-delà de la fiche de poste originale ? 4) Consulter le management — discuter de la demande avec le manager de l'employé et les contraintes budgétaires. 5) Répondre de manière transparente — si approuvé, communiquer le montant et la date d'effet. Si refusé, expliquer les raisons honnêtement et suggérer un calendrier de révision ou une reconnaissance alternative (formation, évolution de titre, bonus, responsabilités supplémentaires). 6) Documenter — enregistrer la demande, la décision et la justification. Clé : ne jamais promettre ce qu'on ne peut pas livrer, et assurer la cohérence dans toute l'organisation.", tips: ["Show a structured, fair process", "Emphasize data-driven decision making with market benchmarks", "Mention alternatives if a raise isn't possible"], tipsFr: ["Montrez un processus structuré et équitable", "Mettez l'accent sur la prise de décision basée sur les données avec des benchmarks marché", "Mentionnez les alternatives si une augmentation n'est pas possible"] },

	// --- GENIE MECANIQUE (additional 8 questions) ---
	{ id: qid("mec"), question: "What is the difference between stress and strain?", questionFr: "Quelle est la différence entre contrainte et déformation ?", type: "technical", field: "génie-mécanique", difficulty: "easy", sampleAnswer: "Stress (contrainte) is the internal force per unit area within a material, measured in Pascals (Pa) or MPa. Formula: sigma = F/A. Types: tensile (traction), compressive (compression), shear (cisaillement). Strain (déformation) is the measure of deformation, dimensionless ratio: epsilon = delta_L / L (change in length / original length). The relationship between them is defined by the constitutive law — for linear elastic materials, Hooke's Law: sigma = E * epsilon, where E is Young's modulus. Important: stress is what the material 'feels' (internal resistance), strain is what we 'measure' (observable deformation). Beyond the elastic limit, the material enters plastic deformation and eventually fractures at ultimate tensile strength.", sampleAnswerFr: "La contrainte (stress) est la force interne par unité de surface dans un matériau, mesurée en Pascals (Pa) ou MPa. Formule : sigma = F/A. Types : traction, compression, cisaillement. La déformation (strain) est la mesure de la déformation, rapport sans dimension : epsilon = delta_L / L (changement de longueur / longueur initiale). La relation entre les deux est définie par la loi de comportement — pour les matériaux élastiques linéaires, la Loi de Hooke : sigma = E * epsilon, où E est le module de Young. Important : la contrainte est ce que le matériau 'ressent' (résistance interne), la déformation est ce qu'on 'mesure' (déformation observable). Au-delà de la limite élastique, le matériau entre en déformation plastique et finalement se fracture à la résistance ultime à la traction.", tips: ["Define both clearly with formulas", "Explain the relationship via Hooke's Law", "Mention elastic vs plastic behavior"], tipsFr: ["Définissez les deux clairement avec les formules", "Expliquez la relation via la Loi de Hooke", "Mentionnez le comportement élastique vs plastique"] },
	{ id: qid("mec"), question: "Explain the working principle of a heat exchanger.", questionFr: "Expliquez le principe de fonctionnement d'un échangeur de chaleur.", type: "technical", field: "génie-mécanique", difficulty: "medium", sampleAnswer: "A heat exchanger transfers thermal energy between two or more fluids at different temperatures without mixing them. Working principle: hot fluid flows on one side, cold fluid on the other, separated by a conductive wall. Heat transfers from hot to cold by conduction through the wall and convection on both sides. Types: shell-and-tube (most common in industry — OCP uses them extensively in phosphate processing), plate heat exchangers (compact, high efficiency), double-pipe (simple, small applications), and finned-tube (air coolers). Key design parameters: LMTD (Log Mean Temperature Difference), overall heat transfer coefficient (U), heat transfer area (A), and the fundamental equation Q = U * A * LMTD. Flow arrangements: counter-flow (most efficient), parallel-flow, and cross-flow. In Morocco's phosphate and chemical industries, heat exchangers are critical for process cooling and heat recovery.", sampleAnswerFr: "Un échangeur de chaleur transfère l'énergie thermique entre deux fluides ou plus à des températures différentes sans les mélanger. Principe de fonctionnement : le fluide chaud circule d'un côté, le fluide froid de l'autre, séparés par une paroi conductrice. La chaleur se transfère du chaud vers le froid par conduction à travers la paroi et convection des deux côtés. Types : tubes et calandre (le plus courant dans l'industrie — OCP les utilise intensivement dans le traitement des phosphates), échangeurs à plaques (compacts, haute efficacité), double-tube (simple, petites applications), et tubes à ailettes (refroidisseurs d'air). Paramètres de conception clés : DTLM (Différence de Température Logarithmique Moyenne), coefficient de transfert thermique global (U), surface d'échange (A), et l'équation fondamentale Q = U * A * DTLM. Arrangements de flux : contre-courant (le plus efficace), co-courant, et courant croisé.", tips: ["Explain the fundamental equation Q = U * A * LMTD", "Compare counter-flow vs parallel-flow efficiency", "Reference industrial applications in Morocco"], tipsFr: ["Expliquez l'équation fondamentale Q = U * A * DTLM", "Comparez l'efficacité contre-courant vs co-courant", "Référencez les applications industrielles au Maroc"] },
	{ id: qid("mec"), question: "What is fatigue failure and how do you prevent it?", questionFr: "Qu'est-ce que la rupture par fatigue et comment la prévenir ?", type: "technical", field: "génie-mécanique", difficulty: "hard", sampleAnswer: "Fatigue failure occurs when a material fails under repeated cyclic loading at stress levels below its static ultimate strength. It accounts for about 90% of mechanical failures in service. Three stages: 1) Crack initiation — micro-cracks form at stress concentrations (notches, holes, surface defects, material inclusions). 2) Crack propagation — cracks grow incrementally with each load cycle (visible as beach marks/striations on fracture surface). 3) Final fracture — when the remaining cross-section can no longer carry the load, sudden catastrophic failure occurs. Prevention methods: reduce stress concentrations (smooth transitions, fillets, avoid sharp corners), improve surface finish (polishing, shot peening introduces compressive residual stresses), select fatigue-resistant materials, design for infinite life (keep stress below the endurance limit for steel) or safe-life (replace before calculated fatigue life expires), and implement regular inspection (NDT: ultrasonic testing, magnetic particle inspection, dye penetrant). The S-N curve (Wöhler curve) characterizes material fatigue behavior.", sampleAnswerFr: "La rupture par fatigue se produit quand un matériau cède sous un chargement cyclique répété à des niveaux de contrainte inférieurs à sa résistance ultime statique. Elle représente environ 90% des défaillances mécaniques en service. Trois stades : 1) Amorçage de fissure — des micro-fissures se forment aux concentrations de contraintes (entailles, trous, défauts de surface, inclusions). 2) Propagation de fissure — les fissures croissent progressivement à chaque cycle de charge (visibles comme des lignes de plage/stries sur la surface de fracture). 3) Rupture finale — quand la section restante ne peut plus supporter la charge, une rupture soudaine catastrophique se produit. Méthodes de prévention : réduire les concentrations de contraintes (transitions douces, congés, éviter les angles vifs), améliorer l'état de surface (polissage, grenaillage introduisant des contraintes résiduelles de compression), sélectionner des matériaux résistants à la fatigue, concevoir pour une vie infinie (garder la contrainte sous la limite d'endurance pour l'acier) ou une vie sûre (remplacer avant l'expiration de la durée de vie calculée), et implémenter une inspection régulière (CND : ultrasons, magnétoscopie, ressuage). La courbe S-N (courbe de Wöhler) caractérise le comportement en fatigue du matériau.", tips: ["Describe all three stages of fatigue failure", "Mention the S-N curve and endurance limit concept", "List specific prevention and inspection methods"], tipsFr: ["Décrivez les trois stades de la rupture par fatigue", "Mentionnez la courbe S-N et le concept de limite d'endurance", "Listez des méthodes de prévention et d'inspection spécifiques"] },
	{ id: qid("mec"), question: "What CAD/CAM software do you use and for what applications?", questionFr: "Quels logiciels CAO/FAO utilisez-vous et pour quelles applications ?", type: "competency", field: "génie-mécanique", difficulty: "easy", sampleAnswer: "I have experience with several CAD/CAM tools: SolidWorks — 3D parametric modeling for mechanical design, assemblies, FEA (Simulation), and technical drawings. Most widely used in Moroccan industry (OCP, Renault, automotive suppliers). AutoCAD — 2D drafting and basic 3D modeling for layouts and general-purpose drawings. CATIA — advanced surface modeling and complex assemblies, used extensively in aerospace and automotive (Bombardier Morocco, Renault). For CAM: SolidCAM or Mastercam for CNC programming (generating G-code for milling, turning, drilling operations). For simulation: ANSYS for advanced FEA and CFD analysis, SolidWorks Simulation for basic stress analysis. I choose the tool based on the project: SolidWorks for most mechanical design, CATIA for complex surfaces or automotive projects, and ANSYS when detailed simulation is critical.", sampleAnswerFr: "J'ai de l'expérience avec plusieurs outils CAO/FAO : SolidWorks — modélisation paramétrique 3D pour la conception mécanique, les assemblages, la FEA (Simulation), et les dessins techniques. Le plus utilisé dans l'industrie marocaine (OCP, Renault, équipementiers automobiles). AutoCAD — dessin 2D et modélisation 3D basique pour les plans et dessins d'usage général. CATIA — modélisation avancée de surfaces et assemblages complexes, utilisé extensivement dans l'aéronautique et l'automobile (Bombardier Maroc, Renault). Pour la FAO : SolidCAM ou Mastercam pour la programmation CNC (génération de code G pour le fraisage, le tournage, le perçage). Pour la simulation : ANSYS pour la FEA avancée et l'analyse CFD, SolidWorks Simulation pour l'analyse de contraintes basique. Je choisis l'outil selon le projet : SolidWorks pour la plupart de la conception mécanique, CATIA pour les surfaces complexes ou les projets automobiles, et ANSYS quand une simulation détaillée est critique.", tips: ["Name specific software you've actually used", "Explain which tool is best for which application", "Reference Moroccan companies that use each tool"], tipsFr: ["Nommez les logiciels spécifiques que vous avez réellement utilisés", "Expliquez quel outil est le meilleur pour quelle application", "Référencez les entreprises marocaines qui utilisent chaque outil"] },
	{ id: qid("mec"), question: "Explain the difference between casting, forging, and machining.", questionFr: "Expliquez la différence entre le moulage, le forgeage et l'usinage.", type: "technical", field: "génie-mécanique", difficulty: "medium", sampleAnswer: "Three fundamental manufacturing processes: Casting (moulage) — molten metal is poured into a mold and solidified. Best for complex shapes, large parts, and high-volume production. Types: sand casting (economical, rough finish), die casting (precision, smooth finish), investment casting (complex shapes, excellent finish). Limitation: potential for porosity and internal defects. Forging (forgeage) — metal is shaped by compressive forces (hammer, press, die). Produces the strongest parts due to grain flow alignment. Types: open-die (large parts), closed-die (precision), roll forging. Best for high-strength components (crankshafts, connecting rods, gears). Machining (usinage) — material is removed from a workpiece using cutting tools. Types: turning (lathe), milling (CNC), drilling, grinding. Best for precision dimensions and surface finish. Higher cost for high volumes. Selection depends on: part geometry, required strength, production volume, tolerance requirements, and cost. In Morocco, Renault's Tanger Med plant uses all three processes in automotive part production.", sampleAnswerFr: "Trois procédés de fabrication fondamentaux : Le moulage (casting) — le métal fondu est versé dans un moule et solidifié. Idéal pour les formes complexes, les grandes pièces, et la production en grande série. Types : moulage en sable (économique, finition rugueuse), moulage sous pression (précision, finition lisse), moulage à cire perdue (formes complexes, excellente finition). Limitation : risque de porosité et défauts internes. Le forgeage (forging) — le métal est façonné par des forces de compression (marteau, presse, matrice). Produit les pièces les plus résistantes grâce à l'alignement du flux de grain. Types : matrice ouverte (grandes pièces), matrice fermée (précision), forgeage par laminage. Idéal pour les composants haute résistance (vilebrequins, bielles, engrenages). L'usinage (machining) — le matériau est enlevé d'une pièce brute par des outils de coupe. Types : tournage, fraisage (CNC), perçage, rectification. Idéal pour les dimensions de précision et la finition de surface. Coût plus élevé pour les grands volumes. La sélection dépend de : la géométrie de la pièce, la résistance requise, le volume de production, les exigences de tolérance, et le coût. Au Maroc, l'usine Renault de Tanger Med utilise les trois procédés dans la production de pièces automobiles.", tips: ["Compare all three processes clearly", "Explain when to choose each one", "Mention specific applications and Moroccan industry examples"], tipsFr: ["Comparez les trois procédés clairement", "Expliquez quand choisir chacun", "Mentionnez des applications spécifiques et des exemples de l'industrie marocaine"] },
	{ id: qid("mec"), question: "What is GD&T and why is it important?", questionFr: "Qu'est-ce que le GD&T et pourquoi est-il important ?", type: "technical", field: "génie-mécanique", difficulty: "medium", sampleAnswer: "GD&T (Geometric Dimensioning and Tolerancing) is a standardized system for defining and communicating engineering tolerances on technical drawings. It uses symbols to specify: form (flatness, cylindricity, straightness, circularity), orientation (perpendicularity, angularity, parallelism), location (position, concentricity, symmetry), and runout (circular and total). Why it's important: 1) Communicates design intent clearly — traditional plus/minus tolerancing doesn't capture geometric relationships. 2) Allows larger tolerance zones — position tolerance with MMC (Maximum Material Condition) gives bonus tolerance, reducing manufacturing cost. 3) Ensures interchangeability — parts from different suppliers fit together. 4) Reduces inspection ambiguity — everyone measures the same way using datum reference frames. Standards: ISO 1101 (international, used in Morocco) and ASME Y14.5 (American). GD&T is essential for automotive and aerospace parts — Renault and Bombardier Morocco require GD&T on all component drawings.", sampleAnswerFr: "Le GD&T (Geometric Dimensioning and Tolerancing — Cotation et Tolérancement Géométriques) est un système standardisé pour définir et communiquer les tolérances d'ingénierie sur les dessins techniques. Il utilise des symboles pour spécifier : la forme (planéité, cylindricité, rectitude, circularité), l'orientation (perpendicularité, angularité, parallélisme), la localisation (position, concentricité, symétrie), et le battement (circulaire et total). Son importance : 1) Communique l'intention de conception clairement — le tolérancement traditionnel plus/minus ne capture pas les relations géométriques. 2) Permet des zones de tolérance plus grandes — la tolérance de position avec MMC (Maximum Material Condition) donne une tolérance bonus, réduisant le coût de fabrication. 3) Assure l'interchangeabilité — les pièces de différents fournisseurs s'assemblent. 4) Réduit l'ambiguïté d'inspection — tout le monde mesure de la même façon en utilisant des références de datum. Normes : ISO 1101 (internationale, utilisée au Maroc) et ASME Y14.5 (américaine). Le GD&T est essentiel pour les pièces automobiles et aéronautiques — Renault et Bombardier Maroc exigent le GD&T sur tous les dessins de composants.", tips: ["Explain the four categories: form, orientation, location, runout", "Mention the MMC bonus tolerance concept", "Reference ISO 1101 as the standard used in Morocco"], tipsFr: ["Expliquez les quatre catégories : forme, orientation, localisation, battement", "Mentionnez le concept de tolérance bonus MMC", "Référencez ISO 1101 comme la norme utilisée au Maroc"] },
	{ id: qid("mec"), question: "How do you select the right material for a mechanical component?", questionFr: "Comment sélectionnez-vous le bon matériau pour un composant mécanique ?", type: "competency", field: "génie-mécanique", difficulty: "hard", sampleAnswer: "Material selection follows a systematic process: 1) Define requirements — mechanical properties (tensile strength, hardness, fatigue life, impact resistance), physical properties (density, thermal conductivity, electrical conductivity), environmental factors (corrosion resistance, temperature range, UV exposure), and manufacturing considerations (machinability, weldability, formability). 2) Identify candidates — use Ashby charts (material property maps) to narrow options by plotting requirements. 3) Compare — weighted decision matrix scoring candidates against all criteria. 4) Consider cost and availability — material cost, availability in Moroccan market (local suppliers vs import), and total lifecycle cost. 5) Validate — prototype testing, FEA simulation, accelerated life testing. Common selections: structural steel S235/S355 for general structures, stainless steel 304/316 for corrosion resistance, aluminum 6061 for lightweight applications, HDPE/PVC for chemical resistance. In Morocco, consider: SONASID for steel supply, import logistics for specialty alloys, and climate factors (high UV, coastal corrosion near Atlantic/Mediterranean).", sampleAnswerFr: "La sélection des matériaux suit un processus systématique : 1) Définir les exigences — propriétés mécaniques (résistance à la traction, dureté, durée de vie en fatigue, résistance à l'impact), propriétés physiques (densité, conductivité thermique, conductivité électrique), facteurs environnementaux (résistance à la corrosion, plage de température, exposition UV), et considérations de fabrication (usinabilité, soudabilité, formabilité). 2) Identifier les candidats — utiliser les diagrammes d'Ashby (cartes de propriétés des matériaux) pour réduire les options en traçant les exigences. 3) Comparer — matrice de décision pondérée notant les candidats sur tous les critères. 4) Considérer le coût et la disponibilité — coût du matériau, disponibilité sur le marché marocain (fournisseurs locaux vs import), et coût du cycle de vie total. 5) Valider — tests de prototypage, simulation FEA, tests de vie accélérés. Sélections courantes : acier de construction S235/S355 pour les structures générales, acier inoxydable 304/316 pour la résistance à la corrosion, aluminium 6061 pour les applications légères, HDPE/PVC pour la résistance chimique. Au Maroc, considérer : SONASID pour l'approvisionnement en acier, la logistique d'import pour les alliages spéciaux, et les facteurs climatiques (fort UV, corrosion côtière près de l'Atlantique/Méditerranée).", tips: ["Show a systematic multi-criteria approach", "Mention Ashby charts as a selection tool", "Reference Moroccan suppliers and climate factors"], tipsFr: ["Montrez une approche systématique multi-critères", "Mentionnez les diagrammes d'Ashby comme outil de sélection", "Référencez les fournisseurs marocains et les facteurs climatiques"] },
	{ id: qid("mec"), question: "Why are you passionate about mechanical engineering?", questionFr: "Pourquoi êtes-vous passionné par le génie mécanique ?", type: "motivation", field: "génie-mécanique", difficulty: "easy", sampleAnswer: "Mechanical engineering is the most tangible engineering discipline — you can see, touch, and feel what you create. I love the process of turning an idea into a physical product: from conceptual sketches, through CAD modeling and simulation, to holding the finished part in my hands. What drives me is solving real-world problems: designing a machine that makes a factory more efficient, creating a product that improves people's daily lives, or optimizing a system to reduce energy waste. Morocco's industrial development — from Renault's manufacturing plants to OCP's world-leading phosphate operations — shows that mechanical engineers are at the heart of national economic growth. I want to contribute to this momentum and help Morocco become a regional manufacturing leader.", sampleAnswerFr: "Le génie mécanique est la discipline d'ingénierie la plus tangible — on peut voir, toucher et ressentir ce qu'on crée. J'aime le processus de transformation d'une idée en un produit physique : des esquisses conceptuelles, en passant par la modélisation CAO et la simulation, jusqu'à tenir la pièce finie dans mes mains. Ce qui me motive est de résoudre des problèmes du monde réel : concevoir une machine qui rend une usine plus efficace, créer un produit qui améliore la vie quotidienne des gens, ou optimiser un système pour réduire le gaspillage d'énergie. Le développement industriel du Maroc — des usines de fabrication de Renault aux opérations phosphatières de classe mondiale d'OCP — montre que les ingénieurs mécaniciens sont au coeur de la croissance économique nationale. Je veux contribuer à cet élan et aider le Maroc à devenir un leader manufacturier régional.", tips: ["Show genuine enthusiasm with specific examples", "Connect mechanical engineering to tangible impact", "Reference Morocco's industrial development"], tipsFr: ["Montrez un enthousiasme sincère avec des exemples spécifiques", "Connectez le génie mécanique à un impact tangible", "Référencez le développement industriel du Maroc"] },

	// --- COMMERCE INTERNATIONAL (additional 7 questions) ---
	{ id: qid("com"), question: "What are Incoterms and why are they important in international trade?", questionFr: "Que sont les Incoterms et pourquoi sont-ils importants dans le commerce international ?", type: "technical", field: "commerce-international", difficulty: "medium", sampleAnswer: "Incoterms (International Commercial Terms) are standardized trade terms published by the ICC that define responsibilities between buyers and sellers in international transactions. They specify: who pays for transport, insurance, and customs; where risk transfers from seller to buyer; and who handles documentation. The 2020 Incoterms include 11 terms in two groups: any mode of transport (EXW, FCA, CPT, CIP, DAP, DPU, DDP) and maritime only (FAS, FOB, CFR, CIF). Most commonly used in Morocco: FOB (seller delivers to ship, buyer bears sea freight risk), CIF (seller pays freight and insurance to destination port), and EXW (buyer assumes all costs from seller's premises). For Moroccan exporters (e.g., phosphates to India), FOB Casablanca or CIF destination is typical. For importers, CIF Casablanca or DDP is common. Understanding Incoterms prevents costly disputes about responsibility and risk.", sampleAnswerFr: "Les Incoterms (International Commercial Terms) sont des termes commerciaux standardisés publiés par la CCI qui définissent les responsabilités entre acheteurs et vendeurs dans les transactions internationales. Ils spécifient : qui paie le transport, l'assurance et la douane ; où le risque se transfère du vendeur à l'acheteur ; et qui gère la documentation. Les Incoterms 2020 incluent 11 termes en deux groupes : tout mode de transport (EXW, FCA, CPT, CIP, DAP, DPU, DDP) et maritime uniquement (FAS, FOB, CFR, CIF). Les plus utilisés au Maroc : FOB (le vendeur livre au navire, l'acheteur supporte le risque du fret maritime), CIF (le vendeur paie le fret et l'assurance jusqu'au port de destination), et EXW (l'acheteur assume tous les coûts depuis les locaux du vendeur). Pour les exportateurs marocains (ex : phosphates vers l'Inde), FOB Casablanca ou CIF destination est typique. Pour les importateurs, CIF Casablanca ou DDP est courant. Comprendre les Incoterms évite des litiges coûteux sur la responsabilité et le risque.", tips: ["Know the 2020 Incoterms categories and key terms", "Explain FOB, CIF, and EXW as the most commonly used", "Give Morocco-specific trade examples"], tipsFr: ["Connaissez les catégories et termes clés des Incoterms 2020", "Expliquez FOB, CIF et EXW comme les plus couramment utilisés", "Donnez des exemples de commerce spécifiques au Maroc"] },
	{ id: qid("com"), question: "What is a letter of credit and how does it work?", questionFr: "Qu'est-ce qu'une lettre de crédit et comment fonctionne-t-elle ?", type: "technical", field: "commerce-international", difficulty: "medium", sampleAnswer: "A letter of credit (LC / credoc) is a bank guarantee of payment in international trade. How it works: 1) Buyer and seller agree on LC terms in the purchase contract. 2) Buyer's bank (issuing bank) issues the LC based on buyer's creditworthiness. 3) The LC is sent to seller's bank (advising/confirming bank). 4) Seller ships the goods and presents compliant documents (bill of lading, commercial invoice, packing list, certificate of origin, insurance certificate). 5) Banks verify document compliance with LC terms. 6) If documents comply, issuing bank pays the seller (or seller's bank). Types: irrevocable (cannot be changed without all parties' consent — most common), confirmed (seller's bank also guarantees payment — reduces risk), at sight (immediate payment on document presentation) vs usance (deferred payment, e.g., 60 or 90 days). In Morocco, LCs are governed by UCP 600 (ICC rules) and are commonly used for trade with African and Asian partners. Bank Al-Maghrib supervises LC operations through Moroccan commercial banks.", sampleAnswerFr: "Une lettre de crédit (LC / crédoc) est une garantie bancaire de paiement dans le commerce international. Fonctionnement : 1) Acheteur et vendeur s'accordent sur les termes de la LC dans le contrat d'achat. 2) La banque de l'acheteur (banque émettrice) émet la LC sur la base de la solvabilité de l'acheteur. 3) La LC est envoyée à la banque du vendeur (banque notificatrice/confirmatrice). 4) Le vendeur expédie les marchandises et présente les documents conformes (connaissement, facture commerciale, liste de colisage, certificat d'origine, certificat d'assurance). 5) Les banques vérifient la conformité des documents avec les termes de la LC. 6) Si les documents sont conformes, la banque émettrice paie le vendeur (ou la banque du vendeur). Types : irrévocable (ne peut être modifiée sans le consentement de toutes les parties — la plus courante), confirmée (la banque du vendeur garantit aussi le paiement — réduit le risque), à vue (paiement immédiat à présentation des documents) vs à usance (paiement différé, ex : 60 ou 90 jours). Au Maroc, les LCs sont régies par les UCP 600 (règles de la CCI) et sont couramment utilisées pour le commerce avec les partenaires africains et asiatiques. Bank Al-Maghrib supervise les opérations de LC à travers les banques commerciales marocaines.", tips: ["Explain the step-by-step flow clearly", "Mention key document types required", "Reference UCP 600 and Moroccan banking context"], tipsFr: ["Expliquez le flux étape par étape clairement", "Mentionnez les types de documents clés requis", "Référencez les UCP 600 et le contexte bancaire marocain"] },
	{ id: qid("com"), question: "What are Morocco's main free trade agreements?", questionFr: "Quels sont les principaux accords de libre-échange du Maroc ?", type: "technical", field: "commerce-international", difficulty: "medium", sampleAnswer: "Morocco has an extensive network of free trade agreements: 1) EU-Morocco Association Agreement (2000) — free trade in industrial goods, progressive liberalization of agricultural products, Morocco's largest trading partner. 2) US-Morocco FTA (2006) — comprehensive agreement covering goods, services, IP, investment. Only African country with a US FTA. 3) Agadir Agreement (2007) — with Egypt, Tunisia, Jordan for Arab Mediterranean trade. 4) Turkey-Morocco FTA (2006) — bilateral trade in industrial goods. 5) Arab countries — Greater Arab Free Trade Area (GAFTA), bilateral agreements with UAE, Saudi Arabia. 6) African Continental Free Trade Area (AfCFTA) — Morocco signed in 2018, aims to create a single African market. 7) EFTA (Switzerland, Norway, Iceland, Liechtenstein). These agreements give Morocco preferential access to markets representing over 1 billion consumers and make it an attractive manufacturing hub (e.g., Renault and PSA chose Morocco partly due to EU/US FTA access).", sampleAnswerFr: "Le Maroc dispose d'un réseau étendu d'accords de libre-échange : 1) Accord d'Association UE-Maroc (2000) — libre-échange en biens industriels, libéralisation progressive des produits agricoles, premier partenaire commercial du Maroc. 2) ALE USA-Maroc (2006) — accord complet couvrant biens, services, PI, investissement. Seul pays africain avec un ALE américain. 3) Accord d'Agadir (2007) — avec l'Égypte, la Tunisie, la Jordanie pour le commerce arabe méditerranéen. 4) ALE Turquie-Maroc (2006) — commerce bilatéral en biens industriels. 5) Pays arabes — Grande Zone Arabe de Libre-Échange (GZALE), accords bilatéraux avec les ÉAU, l'Arabie Saoudite. 6) Zone de Libre-Échange Continentale Africaine (ZLECAf) — le Maroc a signé en 2018, vise à créer un marché africain unique. 7) AELE (Suisse, Norvège, Islande, Liechtenstein). Ces accords donnent au Maroc un accès préférentiel à des marchés représentant plus d'un milliard de consommateurs et en font un hub manufacturier attractif (ex : Renault et PSA ont choisi le Maroc en partie grâce à l'accès ALE UE/USA).", tips: ["Know the major agreements by name and date", "Explain how FTAs make Morocco attractive for foreign investment", "Mention AfCFTA as the latest and most ambitious"], tipsFr: ["Connaissez les accords majeurs par nom et date", "Expliquez comment les ALE rendent le Maroc attractif pour l'investissement étranger", "Mentionnez la ZLECAf comme le plus récent et ambitieux"] },
	{ id: qid("com"), question: "How do you manage currency risk in international trade?", questionFr: "Comment gérez-vous le risque de change dans le commerce international ?", type: "competency", field: "commerce-international", difficulty: "hard", sampleAnswer: "Currency risk (exchange rate risk) arises when the value of a transaction changes due to currency fluctuations between contract signing and payment. Management strategies: 1) Natural hedging — match revenues and costs in the same currency, source inputs from the same currency zone as your customers. 2) Forward contracts — lock in an exchange rate with your bank for a future date. Most common tool in Morocco, available from all commercial banks. 3) Currency options — right (not obligation) to exchange at a predetermined rate. More flexible but more expensive than forwards. 4) Invoice in strong currency — negotiate to invoice in EUR or USD to reduce exposure. 5) Leading and lagging — accelerate payments when expecting depreciation, delay when expecting appreciation. 6) Netting — offset receivables and payables in the same currency. In Morocco, the dirham is partially pegged to a basket (60% EUR, 40% USD), which provides some stability. Bank Al-Maghrib is gradually widening the fluctuation band (currently ±5%), so currency risk management is becoming increasingly important for Moroccan businesses.", sampleAnswerFr: "Le risque de change survient quand la valeur d'une transaction change en raison des fluctuations des devises entre la signature du contrat et le paiement. Stratégies de gestion : 1) Couverture naturelle — faire correspondre les revenus et les coûts dans la même devise, s'approvisionner dans la même zone monétaire que vos clients. 2) Contrats à terme — verrouiller un taux de change avec votre banque pour une date future. Outil le plus courant au Maroc, disponible dans toutes les banques commerciales. 3) Options de change — droit (pas obligation) d'échanger à un taux prédéterminé. Plus flexible mais plus cher que les contrats à terme. 4) Facturer en devise forte — négocier pour facturer en EUR ou USD pour réduire l'exposition. 5) Leading et lagging — accélérer les paiements quand on s'attend à une dépréciation, retarder quand on s'attend à une appréciation. 6) Netting — compenser les créances et les dettes dans la même devise. Au Maroc, le dirham est partiellement indexé sur un panier (60% EUR, 40% USD), ce qui apporte une certaine stabilité. Bank Al-Maghrib élargit progressivement la bande de fluctuation (actuellement ±5%), donc la gestion du risque de change devient de plus en plus importante pour les entreprises marocaines.", tips: ["List multiple hedging strategies with explanations", "Explain Morocco's dirham peg system and its evolution", "Show practical knowledge of forward contracts with banks"], tipsFr: ["Listez plusieurs stratégies de couverture avec des explications", "Expliquez le système d'ancrage du dirham marocain et son évolution", "Montrez une connaissance pratique des contrats à terme avec les banques"] },
	{ id: qid("com"), question: "What customs procedures does an importer follow in Morocco?", questionFr: "Quelles procédures douanières un importateur suit-il au Maroc ?", type: "technical", field: "commerce-international", difficulty: "hard", sampleAnswer: "Morocco's customs procedures are managed by ADII (Administration des Douanes et Impôts Indirects). Steps: 1) Pre-arrival — submit the Déclaration Unique de Marchandises (DUM) electronically via BADR system (Base Automatisée des Douanes en Réseau). Include: commercial invoice, packing list, bill of lading/airway bill, certificate of origin, and any required permits. 2) Arrival — goods arrive at port (Tanger Med, Casablanca, Jorf Lasfar) or airport (Mohammed V). 3) Customs clearance — ADII verifies the DUM, selects inspection channel (green = automatic release, orange = document check, red = physical inspection). 4) Pay duties — customs duties (0-40% depending on product and FTA preference), TVA (import VAT at 20%), and para-fiscal taxes where applicable. 5) Release — goods are released for local delivery. Timeline: 24-72 hours for green channel, longer for inspections. Key tools: BADR system for e-filing, PortNet for port community system. Companies can obtain Operateur Économique Agréé (OEA) status for expedited clearance.", sampleAnswerFr: "Les procédures douanières du Maroc sont gérées par l'ADII (Administration des Douanes et Impôts Indirects). Étapes : 1) Pré-arrivée — soumettre la Déclaration Unique de Marchandises (DUM) électroniquement via le système BADR (Base Automatisée des Douanes en Réseau). Inclure : facture commerciale, liste de colisage, connaissement/lettre de transport aérien, certificat d'origine, et tout permis requis. 2) Arrivée — les marchandises arrivent au port (Tanger Med, Casablanca, Jorf Lasfar) ou à l'aéroport (Mohammed V). 3) Dédouanement — l'ADII vérifie la DUM, sélectionne le circuit d'inspection (vert = libération automatique, orange = vérification documentaire, rouge = inspection physique). 4) Payer les droits — droits de douane (0-40% selon le produit et la préférence ALE), TVA (TVA à l'import à 20%), et taxes parafiscales le cas échéant. 5) Mainlevée — les marchandises sont libérées pour la livraison locale. Délai : 24-72 heures pour le circuit vert, plus long pour les inspections. Outils clés : système BADR pour le dépôt électronique, PortNet pour le système communautaire portuaire. Les entreprises peuvent obtenir le statut d'Opérateur Économique Agréé (OEA) pour un dédouanement accéléré.", tips: ["Know the DUM and BADR system", "Explain the inspection channel system (green/orange/red)", "Mention OEA status for expedited clearance"], tipsFr: ["Connaissez la DUM et le système BADR", "Expliquez le système de circuits d'inspection (vert/orange/rouge)", "Mentionnez le statut OEA pour le dédouanement accéléré"] },
	{ id: qid("com"), question: "Why do you want to work in international trade?", questionFr: "Pourquoi voulez-vous travailler dans le commerce international ?", type: "motivation", field: "commerce-international", difficulty: "easy", sampleAnswer: "International trade fascinates me because it sits at the intersection of business, culture, and geopolitics. Every transaction involves navigating different legal systems, cultural norms, and business practices — that complexity is what makes it intellectually stimulating. Morocco is uniquely positioned for international trade: gateway between Europe and Africa, 56 free trade agreements giving preferential access to 2.5 billion consumers, world-class port infrastructure (Tanger Med is Africa's largest container port), and a strategic location on major shipping routes. I want to leverage my multilingual skills (French, Arabic, English) and my understanding of Moroccan business culture to facilitate trade that creates value for all parties. The African Continental Free Trade Area represents an enormous opportunity, and I want to be part of Morocco's role as a trade bridge to the continent.", sampleAnswerFr: "Le commerce international me fascine car il se situe à l'intersection du business, de la culture et de la géopolitique. Chaque transaction implique de naviguer différents systèmes juridiques, normes culturelles et pratiques commerciales — cette complexité est ce qui le rend intellectuellement stimulant. Le Maroc est uniquement positionné pour le commerce international : passerelle entre l'Europe et l'Afrique, 56 accords de libre-échange donnant un accès préférentiel à 2,5 milliards de consommateurs, infrastructure portuaire de classe mondiale (Tanger Med est le plus grand port à conteneurs d'Afrique), et une localisation stratégique sur les routes maritimes majeures. Je veux exploiter mes compétences multilingues (français, arabe, anglais) et ma compréhension de la culture d'affaires marocaine pour faciliter un commerce qui crée de la valeur pour toutes les parties. La Zone de Libre-Échange Continentale Africaine représente une opportunité énorme, et je veux faire partie du rôle du Maroc comme pont commercial vers le continent.", tips: ["Show genuine enthusiasm for the complexity of international trade", "Reference Morocco's strategic position and infrastructure", "Mention the AfCFTA opportunity"], tipsFr: ["Montrez un enthousiasme sincère pour la complexité du commerce international", "Référencez la position stratégique et l'infrastructure du Maroc", "Mentionnez l'opportunité de la ZLECAf"] },
	{ id: qid("com"), question: "How would you handle a shipment delayed at customs?", questionFr: "Comment géreriez-vous une expédition retardée à la douane ?", type: "situational", field: "commerce-international", difficulty: "medium", sampleAnswer: "I would follow a systematic approach: 1) Diagnose — contact the customs broker (transitaire) to identify the reason for the delay: missing documents, incorrect tariff classification, physical inspection, unpaid duties, or regulatory compliance issue. 2) Resolve the immediate issue — if documents are missing, prepare and submit them urgently via BADR system. If classification is disputed, prepare supporting evidence (product specifications, precedent rulings). If it's a random physical inspection, coordinate timing with ADII. 3) Communicate — immediately inform the client/internal stakeholders about the delay, provide a realistic revised timeline, and explain what's being done. 4) Mitigate impact — if the delay is significant, explore options: air freight a partial shipment if critical, source alternatives locally, adjust production schedules. 5) Prevent recurrence — analyze root cause, update documentation checklist, improve pre-clearance procedures, consider obtaining OEA status for priority treatment. 6) Document — record the incident for lessons learned and process improvement.", sampleAnswerFr: "Je suivrais une approche systématique : 1) Diagnostiquer — contacter le transitaire pour identifier la raison du retard : documents manquants, classification tarifaire incorrecte, inspection physique, droits impayés, ou problème de conformité réglementaire. 2) Résoudre le problème immédiat — si des documents manquent, les préparer et les soumettre urgemment via le système BADR. Si la classification est contestée, préparer des preuves (spécifications produit, décisions de précédent). Si c'est une inspection physique aléatoire, coordonner le timing avec l'ADII. 3) Communiquer — informer immédiatement le client/les parties prenantes internes du retard, fournir un calendrier révisé réaliste, et expliquer ce qui est fait. 4) Atténuer l'impact — si le retard est significatif, explorer les options : expédier une partie par avion si critique, s'approvisionner localement en alternatives, ajuster les plannings de production. 5) Prévenir la récurrence — analyser la cause racine, mettre à jour la checklist de documentation, améliorer les procédures de pré-dédouanement, considérer l'obtention du statut OEA pour un traitement prioritaire. 6) Documenter — enregistrer l'incident pour les leçons apprises et l'amélioration des processus.", tips: ["Show a calm, systematic approach to the crisis", "Demonstrate knowledge of customs procedures and BADR system", "Emphasize proactive communication and prevention"], tipsFr: ["Montrez une approche calme et systématique face à la crise", "Démontrez votre connaissance des procédures douanières et du système BADR", "Mettez l'accent sur la communication proactive et la prévention"] },

	// --- LOGISTIQUE (additional 7 questions) ---
	{ id: qid("log"), question: "What is supply chain management and why is it critical?", questionFr: "Qu'est-ce que la gestion de la chaîne logistique et pourquoi est-elle critique ?", type: "technical", field: "logistique", difficulty: "easy", sampleAnswer: "Supply chain management (SCM) is the coordination and optimization of all activities involved in sourcing, procurement, production, and delivery of products — from raw materials to the end customer. It includes: planning (demand forecasting, inventory planning), sourcing (supplier selection, procurement), manufacturing (production scheduling, quality control), logistics (warehousing, transportation, distribution), and returns (reverse logistics). SCM is critical because: it directly impacts cost (logistics can be 8-15% of revenue), customer satisfaction (on-time delivery), competitive advantage (Amazon's supply chain is its core differentiator), and resilience (COVID-19 exposed supply chain vulnerabilities globally). In Morocco, SCM is strategically important due to: Tanger Med port as Africa's logistics hub, Morocco's role as a manufacturing nearshoring destination for Europe, the PMIL (Plan National de Développement de la Logistique) government strategy, and the growing automotive and aerospace export sectors.", sampleAnswerFr: "La gestion de la chaîne logistique (SCM) est la coordination et l'optimisation de toutes les activités impliquées dans l'approvisionnement, les achats, la production et la livraison de produits — des matières premières au client final. Elle inclut : la planification (prévision de la demande, planification des stocks), l'approvisionnement (sélection des fournisseurs, achats), la fabrication (programmation de la production, contrôle qualité), la logistique (entreposage, transport, distribution), et les retours (logistique inverse). La SCM est critique car : elle impacte directement les coûts (la logistique peut représenter 8-15% du CA), la satisfaction client (livraison à temps), l'avantage compétitif (la chaîne logistique d'Amazon est son différenciateur principal), et la résilience (le COVID-19 a exposé les vulnérabilités des chaînes logistiques mondialement). Au Maroc, la SCM est stratégiquement importante en raison de : Tanger Med comme hub logistique d'Afrique, le rôle du Maroc comme destination de nearshoring manufacturier pour l'Europe, le PMIL (Plan National de Développement de la Logistique), et les secteurs exportateurs automobiles et aéronautiques en croissance.", tips: ["Cover the five key SCM functions", "Explain why SCM matters with cost and business impact", "Reference Morocco's logistics strategy and infrastructure"], tipsFr: ["Couvrez les cinq fonctions clés de la SCM", "Expliquez pourquoi la SCM compte avec l'impact coût et business", "Référencez la stratégie logistique et l'infrastructure du Maroc"] },
	{ id: qid("log"), question: "What is the difference between 3PL and 4PL logistics?", questionFr: "Quelle est la différence entre la logistique 3PL et 4PL ?", type: "technical", field: "logistique", difficulty: "medium", sampleAnswer: "3PL (Third-Party Logistics) outsources specific logistics functions to a provider: warehousing, transportation, order fulfillment, or freight forwarding. The 3PL executes operations but the client retains strategic control. Examples in Morocco: SNTL (Société Nationale de Transports et de Logistique), Dachser, DHL Supply Chain. 4PL (Fourth-Party Logistics) goes further — a 4PL manages the entire supply chain on behalf of the client, including coordinating multiple 3PLs, technology platforms, and strategic planning. The 4PL acts as a single point of contact (lead logistics provider). Key differences: scope (3PL = operational, 4PL = strategic), relationship (3PL = transactional, 4PL = partnership), technology (4PL typically provides the IT platform that integrates all providers), and flexibility (4PL can switch between 3PLs for optimization). When to choose: 3PL for specific functions you want to outsource, 4PL when you want to focus entirely on your core business and let a partner manage all logistics.", sampleAnswerFr: "Le 3PL (Third-Party Logistics) externalise des fonctions logistiques spécifiques à un prestataire : entreposage, transport, préparation de commandes, ou transit. Le 3PL exécute les opérations mais le client conserve le contrôle stratégique. Exemples au Maroc : SNTL (Société Nationale de Transports et de Logistique), Dachser, DHL Supply Chain. Le 4PL (Fourth-Party Logistics) va plus loin — un 4PL gère l'ensemble de la chaîne logistique pour le compte du client, incluant la coordination de plusieurs 3PLs, les plateformes technologiques, et la planification stratégique. Le 4PL agit comme un point de contact unique (lead logistics provider). Différences clés : périmètre (3PL = opérationnel, 4PL = stratégique), relation (3PL = transactionnelle, 4PL = partenariat), technologie (le 4PL fournit typiquement la plateforme IT qui intègre tous les prestataires), et flexibilité (le 4PL peut basculer entre les 3PLs pour l'optimisation). Quand choisir : 3PL pour des fonctions spécifiques à externaliser, 4PL quand vous voulez vous concentrer entièrement sur votre coeur de métier et laisser un partenaire gérer toute la logistique.", tips: ["Clearly differentiate operational (3PL) vs strategic (4PL) scope", "Name specific 3PL providers operating in Morocco", "Explain when each model is appropriate"], tipsFr: ["Différenciez clairement le périmètre opérationnel (3PL) vs stratégique (4PL)", "Nommez des prestataires 3PL spécifiques opérant au Maroc", "Expliquez quand chaque modèle est approprié"] },
	{ id: qid("log"), question: "How do you optimize warehouse layout and operations?", questionFr: "Comment optimisez-vous l'aménagement et les opérations d'un entrepôt ?", type: "competency", field: "logistique", difficulty: "hard", sampleAnswer: "Warehouse optimization follows several principles: Layout design — ABC analysis to position high-velocity items (A) nearest to shipping docks, medium movers (B) in the middle, and slow movers (C) at the back. Use a U-shaped flow (receiving and shipping on the same side) for maximum efficiency, or I-shaped flow for high-throughput operations. Storage systems — selective racking for fast movers (easy access), drive-in racking for bulk storage, mezzanines for vertical space utilization. Operations optimization: pick path optimization (wave picking, zone picking, batch picking based on order profiles), slotting optimization (regularly reassign locations based on demand changes), cross-docking for fast-moving items (bypass storage), implement WMS (Warehouse Management System) for real-time inventory tracking and task management. KPIs to track: picks per hour, order accuracy rate, dock-to-stock time, space utilization percentage, inventory turns. In Morocco, logistics zones like Zenata and MITA offer modern warehousing infrastructure meeting international standards.", sampleAnswerFr: "L'optimisation d'entrepôt suit plusieurs principes : Conception du layout — analyse ABC pour positionner les articles à forte rotation (A) les plus proches des quais d'expédition, les mouvements moyens (B) au milieu, et les faibles rotations (C) au fond. Utiliser un flux en U (réception et expédition du même côté) pour une efficacité maximale, ou un flux en I pour les opérations à haut débit. Systèmes de stockage — rayonnage sélectif pour les articles à forte rotation (accès facile), rayonnage par accumulation pour le stockage en vrac, mezzanines pour l'utilisation de l'espace vertical. Optimisation des opérations : optimisation du parcours de picking (wave picking, zone picking, batch picking selon les profils de commandes), optimisation du slotting (réassigner régulièrement les emplacements selon les changements de demande), cross-docking pour les articles à forte rotation (contourner le stockage), implémenter un WMS (Warehouse Management System) pour le suivi des stocks en temps réel et la gestion des tâches. KPIs à suivre : picks par heure, taux de précision des commandes, temps de quai à stock, pourcentage d'utilisation de l'espace, rotation des stocks. Au Maroc, les zones logistiques comme Zenata et MITA offrent une infrastructure d'entreposage moderne répondant aux standards internationaux.", tips: ["Explain ABC analysis and its application to layout", "Mention specific picking strategies", "Reference Moroccan logistics zones"], tipsFr: ["Expliquez l'analyse ABC et son application au layout", "Mentionnez des stratégies de picking spécifiques", "Référencez les zones logistiques marocaines"] },
	{ id: qid("log"), question: "What is demand forecasting and which methods do you use?", questionFr: "Qu'est-ce que la prévision de la demande et quelles méthodes utilisez-vous ?", type: "technical", field: "logistique", difficulty: "medium", sampleAnswer: "Demand forecasting predicts future product demand to optimize inventory, production, and resource planning. Methods fall into two categories: Quantitative — time series analysis (moving averages, exponential smoothing, ARIMA models for seasonal patterns), causal models (regression analysis linking demand to economic indicators, population growth, weather), and machine learning (neural networks for complex patterns). Qualitative — expert judgment (Delphi method), sales force composite (bottom-up estimates from sales teams), market research (surveys, focus groups), and analogy (using similar product launch data). Best practice: combine multiple methods and compare accuracy using MAD (Mean Absolute Deviation) or MAPE (Mean Absolute Percentage Error). In Morocco, consider: Ramadan and Eid seasonality effects on consumer goods, agricultural season impacts on food logistics, summer tourism peaks for hospitality supply chains, and back-to-school demand spikes. Tools: SAP APO, Oracle Demantra, or simpler Excel-based models for SMEs.", sampleAnswerFr: "La prévision de la demande prédit la demande future de produits pour optimiser les stocks, la production et la planification des ressources. Les méthodes se divisent en deux catégories : Quantitatives — analyse de séries temporelles (moyennes mobiles, lissage exponentiel, modèles ARIMA pour les patterns saisonniers), modèles causaux (analyse de régression liant la demande aux indicateurs économiques, croissance démographique, météo), et machine learning (réseaux de neurones pour les patterns complexes). Qualitatives — jugement d'expert (méthode Delphi), composite de la force de vente (estimations bottom-up des équipes commerciales), recherche de marché (sondages, focus groups), et analogie (utiliser les données de lancement de produits similaires). Bonne pratique : combiner plusieurs méthodes et comparer la précision avec le MAD (Mean Absolute Deviation) ou MAPE (Mean Absolute Percentage Error). Au Maroc, considérer : les effets de saisonnalité du Ramadan et de l'Aïd sur les biens de consommation, l'impact des saisons agricoles sur la logistique alimentaire, les pics de tourisme estival pour les chaînes d'approvisionnement hôtelières, et les pics de demande de la rentrée scolaire. Outils : SAP APO, Oracle Demantra, ou des modèles Excel plus simples pour les PME.", tips: ["Distinguish quantitative and qualitative methods", "Mention accuracy metrics (MAD, MAPE)", "Include Morocco-specific seasonal factors"], tipsFr: ["Distinguez les méthodes quantitatives et qualitatives", "Mentionnez les métriques de précision (MAD, MAPE)", "Incluez les facteurs saisonniers spécifiques au Maroc"] },
	{ id: qid("log"), question: "What is reverse logistics and how do you manage it?", questionFr: "Qu'est-ce que la logistique inverse et comment la gérez-vous ?", type: "technical", field: "logistique", difficulty: "medium", sampleAnswer: "Reverse logistics manages the flow of products FROM the end user BACK to the manufacturer or distributor for returns, repairs, recycling, or disposal. It includes: product returns (defective, unwanted, or end-of-life), remanufacturing (rebuilding products to original specs), recycling (recovering materials), and waste management. Managing reverse logistics effectively: 1) Clear returns policy — define conditions, timelines, and process. 2) Efficient collection — designated drop-off points, pickup services, or return shipping labels. 3) Inspection and sorting — assess returned items for resale, refurbishment, parts recovery, or recycling. 4) Data tracking — use RMA (Return Merchandise Authorization) systems to track returns and identify patterns (high return rates signal quality issues). 5) Cost optimization — reverse logistics can cost 2-3x forward logistics; optimize by batching returns and using backhaul capacity. In Morocco, reverse logistics is growing with e-commerce expansion. The 2025 National Recycling Strategy also drives reverse logistics for packaging and industrial waste recovery.", sampleAnswerFr: "La logistique inverse gère le flux de produits DE l'utilisateur final VERS le fabricant ou le distributeur pour les retours, réparations, recyclage ou élimination. Elle inclut : les retours de produits (défectueux, non désirés ou en fin de vie), le remanufacturing (reconstruction de produits aux spécifications d'origine), le recyclage (récupération de matériaux), et la gestion des déchets. Gérer la logistique inverse efficacement : 1) Politique de retours claire — définir les conditions, délais et processus. 2) Collecte efficace — points de dépôt désignés, services de ramassage ou étiquettes de retour. 3) Inspection et tri — évaluer les articles retournés pour la revente, la remise en état, la récupération de pièces ou le recyclage. 4) Suivi des données — utiliser des systèmes RMA (Return Merchandise Authorization) pour suivre les retours et identifier les patterns (taux de retour élevés signalent des problèmes de qualité). 5) Optimisation des coûts — la logistique inverse peut coûter 2-3x la logistique directe ; optimiser en regroupant les retours et en utilisant la capacité de backhaul. Au Maroc, la logistique inverse croît avec l'expansion de l'e-commerce. La Stratégie Nationale de Recyclage 2025 pousse aussi la logistique inverse pour la récupération des emballages et des déchets industriels.", tips: ["Explain the different types of reverse logistics", "Mention cost implications compared to forward logistics", "Reference Morocco's e-commerce growth and recycling strategy"], tipsFr: ["Expliquez les différents types de logistique inverse", "Mentionnez les implications de coûts par rapport à la logistique directe", "Référencez la croissance de l'e-commerce et la stratégie de recyclage du Maroc"] },
	{ id: qid("log"), question: "How would you reduce transportation costs without compromising service?", questionFr: "Comment réduiriez-vous les coûts de transport sans compromettre le service ?", type: "situational", field: "logistique", difficulty: "hard", sampleAnswer: "Multiple strategies to reduce transport costs while maintaining service levels: 1) Route optimization — use TMS (Transportation Management System) or Google Maps API to find optimal routes, reduce empty miles, and consolidate shipments. 2) Mode optimization — shift from road to rail for long-distance bulk (ONCF offers competitive rates for Casablanca-Tanger), use intermodal solutions. 3) Carrier negotiation — consolidate volume with fewer carriers for better rates, use competitive bidding, build long-term partnerships. 4) Load optimization — maximize truck utilization (target >85% fill rate), use proper packaging to reduce dimensional weight. 5) Network design — strategically locate warehouses to minimize average delivery distance. Morocco has two main axes: Casablanca-Tanger (autoroute, rail) and Casablanca-Marrakech-Agadir. 6) Backhaul utilization — find loads for return trips instead of running empty. 7) Milk run routing — combine multiple pickups/deliveries in one trip. 8) Shift timing — schedule non-urgent deliveries during off-peak hours to avoid traffic and detention charges.", sampleAnswerFr: "Plusieurs stratégies pour réduire les coûts de transport tout en maintenant les niveaux de service : 1) Optimisation des routes — utiliser un TMS (Transportation Management System) ou l'API Google Maps pour trouver les routes optimales, réduire les kilomètres à vide, et consolider les expéditions. 2) Optimisation modale — passer de la route au rail pour le vrac longue distance (l'ONCF offre des tarifs compétitifs pour Casablanca-Tanger), utiliser des solutions intermodales. 3) Négociation transporteur — consolider le volume avec moins de transporteurs pour de meilleurs tarifs, utiliser des appels d'offres compétitifs, construire des partenariats long terme. 4) Optimisation du chargement — maximiser l'utilisation des camions (cible >85% de taux de remplissage), utiliser un emballage approprié pour réduire le poids dimensionnel. 5) Conception du réseau — localiser stratégiquement les entrepôts pour minimiser la distance moyenne de livraison. Le Maroc a deux axes principaux : Casablanca-Tanger (autoroute, rail) et Casablanca-Marrakech-Agadir. 6) Utilisation du backhaul — trouver des charges pour les trajets retour au lieu de rouler à vide. 7) Tournées de lait (milk run) — combiner plusieurs collectes/livraisons en un voyage. 8) Planification horaire — programmer les livraisons non urgentes en heures creuses pour éviter le trafic et les frais d'immobilisation.", tips: ["Provide multiple concrete strategies, not just one", "Mention Morocco's main transport corridors", "Show how to measure improvement (fill rate, cost per unit)"], tipsFr: ["Fournissez plusieurs stratégies concrètes, pas une seule", "Mentionnez les principaux corridors de transport du Maroc", "Montrez comment mesurer l'amélioration (taux de remplissage, coût par unité)"] },
	{ id: qid("log"), question: "Why are you interested in a logistics career?", questionFr: "Pourquoi êtes-vous intéressé par une carrière en logistique ?", type: "motivation", field: "logistique", difficulty: "easy", sampleAnswer: "Logistics is the backbone of global commerce — without it, nothing moves, nothing arrives, nothing happens. I'm drawn to logistics because it combines analytical problem-solving (optimization, data analysis, cost modeling) with real-world operational impact (you can see trucks move, warehouses operate, products reach customers). Every day presents new puzzles: how to deliver faster, cheaper, and more sustainably. Morocco is an incredibly exciting place for logistics professionals right now: Tanger Med is the largest port in Africa and the Mediterranean, the government's logistics strategy aims to reduce logistics costs from 20% to 15% of GDP, and e-commerce is driving demand for last-mile delivery innovation. I want to be part of this transformation and contribute to making Morocco a world-class logistics hub connecting Europe, Africa, and beyond.", sampleAnswerFr: "La logistique est l'épine dorsale du commerce mondial — sans elle, rien ne bouge, rien n'arrive, rien ne se passe. Je suis attiré par la logistique car elle combine la résolution de problèmes analytiques (optimisation, analyse de données, modélisation des coûts) avec un impact opérationnel concret (on peut voir les camions bouger, les entrepôts fonctionner, les produits atteindre les clients). Chaque jour présente de nouvelles énigmes : comment livrer plus vite, moins cher, et plus durablement. Le Maroc est un endroit incroyablement excitant pour les professionnels de la logistique en ce moment : Tanger Med est le plus grand port d'Afrique et de la Méditerranée, la stratégie logistique du gouvernement vise à réduire les coûts logistiques de 20% à 15% du PIB, et l'e-commerce pousse l'innovation de livraison du dernier kilomètre. Je veux faire partie de cette transformation et contribuer à faire du Maroc un hub logistique de classe mondiale connectant l'Europe, l'Afrique, et au-delà.", tips: ["Show passion for the operational and analytical sides", "Reference Morocco's logistics transformation and Tanger Med", "Connect your skills to the industry's needs"], tipsFr: ["Montrez votre passion pour les côtés opérationnel et analytique", "Référencez la transformation logistique du Maroc et Tanger Med", "Connectez vos compétences aux besoins de l'industrie"] },

	// --- FINANCE (additional 7 questions) ---
	{ id: qid("fin"), question: "What is working capital management and why is it important?", questionFr: "Qu'est-ce que la gestion du fonds de roulement et pourquoi est-elle importante ?", type: "technical", field: "finance", difficulty: "medium", sampleAnswer: "Working capital = Current Assets - Current Liabilities. It measures a company's short-term liquidity and operational efficiency. The three main components: 1) Accounts receivable — money customers owe you. Measured by DSO (Days Sales Outstanding). Reduce by: tighter credit policies, faster invoicing, offering early payment discounts. 2) Inventory — goods held for sale or production. Measured by DIO (Days Inventory Outstanding). Reduce by: JIT inventory, demand forecasting, ABC analysis. 3) Accounts payable — money you owe suppliers. Measured by DPO (Days Payable Outstanding). Extend by: negotiating longer payment terms, but without damaging supplier relationships. The Cash Conversion Cycle (CCC) = DSO + DIO - DPO measures how quickly cash flows through the business. A shorter CCC means better working capital management. In Morocco, SMEs often struggle with long payment cycles (public sector can take 90-180 days), making working capital management critical. Affacturage (factoring) through banks like Attijariwafa Bank or BMCE is a common solution.", sampleAnswerFr: "Le fonds de roulement = Actifs courants - Passifs courants. Il mesure la liquidité à court terme et l'efficacité opérationnelle d'une entreprise. Les trois composantes principales : 1) Créances clients — l'argent que les clients vous doivent. Mesuré par le DSO (Days Sales Outstanding). Réduire par : des politiques de crédit plus strictes, une facturation plus rapide, des escomptes pour paiement anticipé. 2) Stocks — les biens détenus pour la vente ou la production. Mesuré par le DIO (Days Inventory Outstanding). Réduire par : le stock JIT, la prévision de demande, l'analyse ABC. 3) Dettes fournisseurs — l'argent que vous devez aux fournisseurs. Mesuré par le DPO (Days Payable Outstanding). Étendre par : la négociation de délais de paiement plus longs, mais sans nuire aux relations fournisseurs. Le Cycle de Conversion de Trésorerie (CCC) = DSO + DIO - DPO mesure la rapidité avec laquelle la trésorerie circule dans l'entreprise. Un CCC plus court signifie une meilleure gestion du fonds de roulement. Au Maroc, les PME souffrent souvent de cycles de paiement longs (le secteur public peut prendre 90-180 jours), rendant la gestion du fonds de roulement critique. L'affacturage via des banques comme Attijariwafa Bank ou BMCE est une solution courante.", tips: ["Explain the three components with their metrics", "Define and explain the Cash Conversion Cycle", "Reference the Moroccan SME payment cycle challenge"], tipsFr: ["Expliquez les trois composantes avec leurs métriques", "Définissez et expliquez le Cycle de Conversion de Trésorerie", "Référencez le défi du cycle de paiement des PME marocaines"] },
	{ id: qid("fin"), question: "What are the main financial statements and what does each tell you?", questionFr: "Quels sont les principaux états financiers et que vous indique chacun ?", type: "technical", field: "finance", difficulty: "easy", sampleAnswer: "Three main financial statements: 1) Income Statement (Compte de Produits et Charges / CPC) — shows revenues, expenses, and profit over a period. Key items: chiffre d'affaires, charges d'exploitation, résultat d'exploitation, résultat financier, résultat net. Tells you: is the company profitable and how efficiently it operates. 2) Balance Sheet (Bilan) — shows assets, liabilities, and equity at a point in time. Key items: immobilisations, actif circulant, capitaux propres, dettes. Tells you: what the company owns, owes, and its net worth. 3) Cash Flow Statement (Tableau de Financement / Tableau des Flux de Trésorerie) — shows cash movements from operations, investments, and financing. Tells you: can the company generate cash, how does it invest, and how does it finance itself. In Morocco, financial statements follow the Plan Comptable Général Marocain (PCGM / CGNC), which differs slightly from IFRS in presentation and terminology. Listed companies on the Bourse de Casablanca also publish consolidated IFRS statements.", sampleAnswerFr: "Trois principaux états financiers : 1) Compte de Résultat (Compte de Produits et Charges / CPC) — montre les revenus, les charges, et le bénéfice sur une période. Postes clés : chiffre d'affaires, charges d'exploitation, résultat d'exploitation, résultat financier, résultat net. Vous dit : l'entreprise est-elle rentable et avec quelle efficacité elle opère. 2) Bilan — montre les actifs, les passifs et les capitaux propres à un instant donné. Postes clés : immobilisations, actif circulant, capitaux propres, dettes. Vous dit : ce que l'entreprise possède, doit, et sa valeur nette. 3) Tableau de Financement / Tableau des Flux de Trésorerie — montre les mouvements de trésorerie des opérations, investissements et financement. Vous dit : l'entreprise peut-elle générer de la trésorerie, comment investit-elle, et comment se finance-t-elle. Au Maroc, les états financiers suivent le Plan Comptable Général Marocain (PCGM / CGNC), qui diffère légèrement des IFRS dans la présentation et la terminologie. Les sociétés cotées à la Bourse de Casablanca publient aussi des états consolidés IFRS.", tips: ["Name all three statements with their Moroccan equivalents", "Explain what each tells you in simple terms", "Reference the CGNC/PCGM vs IFRS distinction"], tipsFr: ["Nommez les trois états avec leurs équivalents marocains", "Expliquez ce que chacun vous dit en termes simples", "Référencez la distinction CGNC/PCGM vs IFRS"] },
	{ id: qid("fin"), question: "How do you perform a financial ratio analysis?", questionFr: "Comment effectuez-vous une analyse par ratios financiers ?", type: "competency", field: "finance", difficulty: "medium", sampleAnswer: "Financial ratio analysis evaluates a company's performance across four categories: 1) Liquidity ratios — Current ratio (actif circulant / passif circulant, healthy >1.5), Quick ratio (excluding inventory, healthy >1.0), measuring short-term ability to pay debts. 2) Profitability ratios — Gross margin, Operating margin (résultat d'exploitation / CA), Net margin (résultat net / CA), ROE (résultat net / capitaux propres), ROA (résultat net / total actif). 3) Leverage ratios — Debt-to-equity (dettes / capitaux propres), Interest coverage (résultat d'exploitation / charges financières), measuring financial risk. 4) Efficiency ratios — Asset turnover (CA / total actif), Inventory turnover, Receivables turnover, measuring how well assets are utilized. Analysis approach: calculate ratios, compare against industry benchmarks, track trends over 3-5 years, and identify red flags (declining margins, rising leverage, deteriorating liquidity). In Morocco, the CGNC format makes certain ratios easier to calculate due to standardized line items.", sampleAnswerFr: "L'analyse par ratios financiers évalue la performance d'une entreprise à travers quatre catégories : 1) Ratios de liquidité — Ratio courant (actif circulant / passif circulant, sain >1,5), Ratio rapide (excluant les stocks, sain >1,0), mesurant la capacité à court terme de payer les dettes. 2) Ratios de rentabilité — Marge brute, Marge opérationnelle (résultat d'exploitation / CA), Marge nette (résultat net / CA), ROE (résultat net / capitaux propres), ROA (résultat net / total actif). 3) Ratios de levier — Dettes sur capitaux propres, Couverture des intérêts (résultat d'exploitation / charges financières), mesurant le risque financier. 4) Ratios d'efficacité — Rotation des actifs (CA / total actif), Rotation des stocks, Rotation des créances, mesurant l'utilisation des actifs. Approche d'analyse : calculer les ratios, comparer aux benchmarks de l'industrie, suivre les tendances sur 3-5 ans, et identifier les signaux d'alerte (marges en baisse, levier en hausse, liquidité qui se détériore). Au Maroc, le format CGNC facilite le calcul de certains ratios grâce aux postes standardisés.", tips: ["Cover all four ratio categories with specific examples", "Mention healthy benchmark ranges", "Explain the importance of trend analysis and comparison"], tipsFr: ["Couvrez les quatre catégories de ratios avec des exemples spécifiques", "Mentionnez les plages de référence saines", "Expliquez l'importance de l'analyse de tendance et de la comparaison"] },
	{ id: qid("fin"), question: "What is the Moroccan tax system for businesses?", questionFr: "Quel est le système fiscal marocain pour les entreprises ?", type: "technical", field: "finance", difficulty: "hard", sampleAnswer: "Morocco's corporate tax system includes: 1) IS (Impôt sur les Sociétés) — corporate tax with progressive rates: 10% for net income 0-300K MAD, 20% for 300K-1M MAD, 31% for >1M MAD (35% for banks and insurance). Minimum contribution (cotisation minimale): 0.75% of turnover. 2) TVA (Taxe sur la Valeur Ajoutée) — standard rate 20%, reduced rates of 14% (transport, butter), 10% (hotels, restaurants, banking), and 7% (water, electricity, basic food). Exempt: basic necessities. 3) IR (Impôt sur le Revenu) — progressive rates from 0% to 38% for personal income. 4) Taxe Professionnelle — local tax on rental value of business premises. 5) Retenue à la source — withholding tax on dividends (15%), interest, and certain payments to non-residents. Key incentives: CFC (Casablanca Finance City) status offers 0% IS for first 5 years then 15%; Free Zone status (Tanger, Kénitra) offers export exemptions; startup incentives for innovative companies. The fiscal year follows the calendar year unless otherwise elected.", sampleAnswerFr: "Le système fiscal des entreprises au Maroc inclut : 1) IS (Impôt sur les Sociétés) — impôt sur les sociétés avec des taux progressifs : 10% pour un résultat net de 0-300K MAD, 20% pour 300K-1M MAD, 31% pour >1M MAD (35% pour les banques et assurances). Cotisation minimale : 0,75% du chiffre d'affaires. 2) TVA (Taxe sur la Valeur Ajoutée) — taux standard 20%, taux réduits de 14% (transport, beurre), 10% (hôtels, restaurants, bancaire), et 7% (eau, électricité, alimentation de base). Exonéré : produits de première nécessité. 3) IR (Impôt sur le Revenu) — taux progressifs de 0% à 38% pour le revenu personnel. 4) Taxe Professionnelle — taxe locale sur la valeur locative des locaux professionnels. 5) Retenue à la source — retenue sur les dividendes (15%), intérêts, et certains paiements aux non-résidents. Incitations clés : le statut CFC (Casablanca Finance City) offre 0% d'IS les 5 premières années puis 15% ; le statut Zone Franche (Tanger, Kénitra) offre des exonérations à l'export ; des incitations pour les startups innovantes. L'exercice fiscal suit l'année civile sauf choix contraire.", tips: ["Know the IS progressive rates and minimum contribution", "Explain TVA rates with specific product categories", "Mention key tax incentives (CFC, Free Zones)"], tipsFr: ["Connaissez les taux progressifs de l'IS et la cotisation minimale", "Expliquez les taux de TVA avec des catégories de produits spécifiques", "Mentionnez les incitations fiscales clés (CFC, Zones Franches)"] },
	{ id: qid("fin"), question: "What is the difference between equity financing and debt financing?", questionFr: "Quelle est la différence entre le financement par fonds propres et le financement par dette ?", type: "technical", field: "finance", difficulty: "easy", sampleAnswer: "Equity financing raises capital by selling ownership shares. Advantages: no repayment obligation, no interest payments, investors share the risk. Disadvantages: dilutes existing ownership and control, dividends are not tax-deductible, higher cost of capital. Sources in Morocco: IPO on Bourse de Casablanca, private equity (e.g., CDG Capital, Amethis), venture capital, or personal investment. Debt financing borrows money that must be repaid with interest. Advantages: retain full ownership, interest is tax-deductible (reduces IS), predictable repayment schedule. Disadvantages: must be repaid regardless of business performance, increases financial risk (leverage), requires collateral. Sources in Morocco: bank loans (Attijariwafa, BMCE, Banque Populaire), corporate bonds (obligations), leasing, and government programs (Intelaka for startups, Damane Express for SMEs). The optimal capital structure balances both to minimize WACC (Weighted Average Cost of Capital) while maintaining financial flexibility.", sampleAnswerFr: "Le financement par fonds propres lève du capital en vendant des parts de propriété. Avantages : pas d'obligation de remboursement, pas de paiement d'intérêts, les investisseurs partagent le risque. Inconvénients : dilue la propriété et le contrôle existants, les dividendes ne sont pas déductibles fiscalement, coût du capital plus élevé. Sources au Maroc : IPO à la Bourse de Casablanca, private equity (ex : CDG Capital, Amethis), capital-risque, ou investissement personnel. Le financement par dette emprunte de l'argent qui doit être remboursé avec des intérêts. Avantages : conserver la pleine propriété, les intérêts sont déductibles fiscalement (réduit l'IS), calendrier de remboursement prévisible. Inconvénients : doit être remboursé quelle que soit la performance de l'entreprise, augmente le risque financier (levier), nécessite des garanties. Sources au Maroc : prêts bancaires (Attijariwafa, BMCE, Banque Populaire), obligations, leasing, et programmes gouvernementaux (Intelaka pour les startups, Damane Express pour les PME). La structure de capital optimale équilibre les deux pour minimiser le WACC (Weighted Average Cost of Capital) tout en maintenant la flexibilité financière.", tips: ["Compare advantages and disadvantages of each clearly", "Name specific financing sources available in Morocco", "Mention WACC as the optimization criterion"], tipsFr: ["Comparez les avantages et inconvénients de chacun clairement", "Nommez des sources de financement spécifiques disponibles au Maroc", "Mentionnez le WACC comme critère d'optimisation"] },
	{ id: qid("fin"), question: "How do you create a budget and manage variances?", questionFr: "Comment créez-vous un budget et gérez-vous les écarts ?", type: "competency", field: "finance", difficulty: "medium", sampleAnswer: "Budget creation follows a structured process: 1) Set objectives — align with company strategy and financial targets. 2) Gather data — historical financials, market trends, sales forecasts, cost estimates. 3) Build bottom-up — each department submits its budget (revenue projections, operating expenses, capital expenditures). 4) Consolidate — finance aggregates departmental budgets into a master budget including the operating budget, cash budget, and capital budget. 5) Review and approve — management reviews, challenges assumptions, negotiates targets, and approves the final budget. 6) Monitor monthly — compare actual results against budget using variance analysis. Variance analysis: favorable variance means actual was better than budget (higher revenue or lower cost), unfavorable means worse. For each significant variance, determine: is it a volume variance, price variance, or efficiency variance? Is it controllable or uncontrollable? What corrective action is needed? Reporting: monthly variance reports with explanations, quarterly budget reviews with reforecasting if needed. Tools: Excel for SMEs, SAP BPC or Oracle Planning for larger organizations.", sampleAnswerFr: "La création de budget suit un processus structuré : 1) Fixer les objectifs — aligner avec la stratégie de l'entreprise et les objectifs financiers. 2) Collecter les données — historiques financiers, tendances du marché, prévisions de ventes, estimations de coûts. 3) Construire bottom-up — chaque département soumet son budget (projections de revenus, charges d'exploitation, dépenses d'investissement). 4) Consolider — la finance agrège les budgets départementaux en un budget maître incluant le budget opérationnel, le budget de trésorerie, et le budget d'investissement. 5) Revoir et approuver — la direction revoit, challenge les hypothèses, négocie les objectifs, et approuve le budget final. 6) Suivre mensuellement — comparer les résultats réels au budget par l'analyse des écarts. Analyse des écarts : un écart favorable signifie que le réel était meilleur que le budget (revenu plus élevé ou coût plus bas), défavorable signifie pire. Pour chaque écart significatif, déterminer : est-ce un écart de volume, de prix, ou d'efficacité ? Est-il contrôlable ou incontrôlable ? Quelle action corrective est nécessaire ? Reporting : rapports mensuels des écarts avec explications, revues budgétaires trimestrielles avec reprévision si nécessaire. Outils : Excel pour les PME, SAP BPC ou Oracle Planning pour les organisations plus grandes.", tips: ["Show the complete budget cycle from creation to monitoring", "Explain the three types of variance (volume, price, efficiency)", "Mention the importance of monthly review and reforecasting"], tipsFr: ["Montrez le cycle budgétaire complet de la création au suivi", "Expliquez les trois types d'écart (volume, prix, efficacité)", "Mentionnez l'importance de la revue mensuelle et de la reprévision"] },
	{ id: qid("fin"), question: "Why are you passionate about finance?", questionFr: "Pourquoi êtes-vous passionné par la finance ?", type: "motivation", field: "finance", difficulty: "easy", sampleAnswer: "Finance is the language of business — every strategic decision ultimately comes down to financial viability. I'm passionate about finance because it combines rigorous analytical thinking with real business impact. I love translating complex data into actionable insights that drive decision-making. Whether it's evaluating whether a company should expand to a new market, optimize its capital structure, or invest in new equipment, finance provides the framework. Morocco's financial sector is dynamic: the Bourse de Casablanca is one of Africa's leading exchanges, CFC Casablanca is positioning Morocco as Africa's financial hub, and Islamic finance is growing rapidly. I want to contribute to this ecosystem and help Moroccan companies make better financial decisions that drive sustainable growth.", sampleAnswerFr: "La finance est le langage du business — chaque décision stratégique se résume ultimement à la viabilité financière. Je suis passionné par la finance car elle combine une réflexion analytique rigoureuse avec un impact business réel. J'aime traduire des données complexes en insights actionnables qui guident la prise de décision. Qu'il s'agisse d'évaluer si une entreprise devrait s'étendre à un nouveau marché, optimiser sa structure de capital, ou investir dans de nouveaux équipements, la finance fournit le cadre. Le secteur financier du Maroc est dynamique : la Bourse de Casablanca est l'une des principales bourses d'Afrique, CFC Casablanca positionne le Maroc comme hub financier africain, et la finance islamique croît rapidement. Je veux contribuer à cet écosystème et aider les entreprises marocaines à prendre de meilleures décisions financières qui favorisent une croissance durable.", tips: ["Show passion for both analysis and business impact", "Reference Morocco's growing financial sector", "Connect your analytical skills to practical applications"], tipsFr: ["Montrez votre passion pour l'analyse et l'impact business", "Référencez le secteur financier croissant du Maroc", "Connectez vos compétences analytiques à des applications pratiques"] },

	// --- MANAGEMENT (additional 7 questions) ---
	{ id: qid("mgt"), question: "What is your management style?", questionFr: "Quel est votre style de management ?", type: "behavioral", field: "management", difficulty: "medium", sampleAnswer: "I believe in situational leadership — adapting my style to the person and situation. For new team members or those learning a task, I'm more directive: providing clear instructions, close supervision, and frequent feedback. For experienced, autonomous team members, I'm more delegative: setting goals, providing resources, and trusting them to deliver. My default style is participative — I involve the team in decision-making because diverse perspectives lead to better outcomes. I believe in setting clear expectations, providing the resources and support to succeed, giving regular constructive feedback (not waiting for annual reviews), and recognizing good work publicly. The key behaviors I model: integrity (do what I say), transparency (share information openly), accountability (own my mistakes), and development (invest in my team's growth). In Moroccan workplace culture, I also value relationship-building and showing respect for hierarchy while encouraging open communication.", sampleAnswerFr: "Je crois au leadership situationnel — adapter mon style à la personne et à la situation. Pour les nouveaux membres d'équipe ou ceux qui apprennent une tâche, je suis plus directif : fournir des instructions claires, une supervision rapprochée, et un feedback fréquent. Pour les membres d'équipe expérimentés et autonomes, je suis plus délégatif : fixer des objectifs, fournir des ressources, et leur faire confiance pour livrer. Mon style par défaut est participatif — j'implique l'équipe dans la prise de décision car les perspectives diverses mènent à de meilleurs résultats. Je crois en la fixation d'attentes claires, la fourniture des ressources et du soutien pour réussir, le feedback constructif régulier (sans attendre les revues annuelles), et la reconnaissance publique du bon travail. Les comportements clés que je modélise : intégrité (faire ce que je dis), transparence (partager l'information ouvertement), responsabilité (assumer mes erreurs), et développement (investir dans la croissance de mon équipe). Dans la culture du lieu de travail marocain, je valorise aussi la construction de relations et le respect de la hiérarchie tout en encourageant la communication ouverte.", tips: ["Reference situational leadership theory", "Give concrete examples of when you would use different styles", "Acknowledge cultural factors in Moroccan workplaces"], tipsFr: ["Référencez la théorie du leadership situationnel", "Donnez des exemples concrets de quand vous utiliseriez différents styles", "Reconnaissez les facteurs culturels dans les lieux de travail marocains"] },
	{ id: qid("mgt"), question: "How do you delegate effectively?", questionFr: "Comment déléguez-vous efficacement ?", type: "competency", field: "management", difficulty: "medium", sampleAnswer: "Effective delegation follows the SMART delegation framework: 1) Select the right person — match the task to the person's skills, development needs, and workload. Don't always delegate to the most capable person; use delegation as a development tool. 2) Define clearly — explain the expected outcome (not the process), deadline, quality standards, and available resources. Use the what/why/when/how framework. 3) Grant authority — give decision-making power proportional to responsibility. Don't delegate the task without the authority to execute it. 4) Monitor without micromanaging — set check-in points based on the person's experience level (more frequent for new tasks, less for experienced performers). Ask 'how can I help?' not 'where are you?' 5) Provide feedback — acknowledge good work, coach through challenges, and debrief after completion. Common mistakes: delegating only routine tasks (should also delegate challenging ones for development), taking it back when it gets difficult (kills trust), and not providing enough context about why the task matters.", sampleAnswerFr: "La délégation efficace suit le framework de délégation SMART : 1) Sélectionner la bonne personne — faire correspondre la tâche aux compétences, besoins de développement et charge de travail de la personne. Ne déléguez pas toujours à la personne la plus capable ; utilisez la délégation comme outil de développement. 2) Définir clairement — expliquer le résultat attendu (pas le processus), le délai, les standards de qualité, et les ressources disponibles. Utilisez le framework quoi/pourquoi/quand/comment. 3) Accorder l'autorité — donner un pouvoir de décision proportionnel à la responsabilité. Ne déléguez pas la tâche sans l'autorité pour l'exécuter. 4) Suivre sans micro-gérer — fixer des points de contrôle selon le niveau d'expérience (plus fréquents pour les nouvelles tâches, moins pour les performeurs expérimentés). Demandez 'comment puis-je vous aider ?' pas 'où en êtes-vous ?' 5) Fournir du feedback — reconnaître le bon travail, coacher à travers les défis, et débriefer après l'achèvement. Erreurs courantes : ne déléguer que des tâches routinières (devrait aussi déléguer des tâches challengeantes pour le développement), reprendre la tâche quand ça devient difficile (tue la confiance), et ne pas fournir assez de contexte sur pourquoi la tâche compte.", tips: ["Show a structured delegation framework", "Mention delegation as a development tool, not just workload distribution", "Warn about common delegation mistakes"], tipsFr: ["Montrez un framework de délégation structuré", "Mentionnez la délégation comme outil de développement, pas seulement de répartition de charge", "Mettez en garde contre les erreurs de délégation courantes"] },
	{ id: qid("mgt"), question: "How do you motivate a team with limited budget?", questionFr: "Comment motivez-vous une équipe avec un budget limité ?", type: "situational", field: "management", difficulty: "hard", sampleAnswer: "Motivation isn't just about money — research shows non-monetary recognition can be equally or more effective. Strategies with limited budget: 1) Recognition — public acknowledgment in team meetings, personalized thank-you notes, employee of the month (costs nothing). 2) Autonomy — give team members ownership of projects, freedom to choose how they work, and input into decisions. 3) Growth — provide learning opportunities (free online courses, mentorship, stretch assignments, cross-training, conference attendance). 4) Purpose — connect daily work to the bigger picture, share customer impact stories, explain how their contribution matters. 5) Flexibility — where possible, offer flexible hours, remote work options, or compressed workweeks. 6) Team building — organize low-cost team activities (team lunches, walking meetings, brainstorming sessions). 7) Small perks — bring pastries to meetings, celebrate birthdays, allow casual dress days. The key insight: people leave managers, not companies. The quality of the relationship between a team member and their manager is the strongest predictor of engagement — and that costs nothing.", sampleAnswerFr: "La motivation n'est pas qu'une question d'argent — la recherche montre que la reconnaissance non-monétaire peut être tout aussi ou plus efficace. Stratégies avec un budget limité : 1) Reconnaissance — reconnaissance publique en réunion d'équipe, notes de remerciement personnalisées, employé du mois (ne coûte rien). 2) Autonomie — donner aux membres de l'équipe la propriété de projets, la liberté de choisir comment ils travaillent, et la participation aux décisions. 3) Croissance — fournir des opportunités d'apprentissage (cours en ligne gratuits, mentorat, missions d'élargissement, formation croisée, participation à des conférences). 4) Sens — connecter le travail quotidien à la vision d'ensemble, partager des histoires d'impact client, expliquer comment leur contribution compte. 5) Flexibilité — quand possible, offrir des horaires flexibles, des options de télétravail, ou des semaines compressées. 6) Team building — organiser des activités d'équipe à faible coût (déjeuners d'équipe, réunions en marchant, sessions de brainstorming). 7) Petits avantages — apporter des pâtisseries en réunion, célébrer les anniversaires, autoriser des journées en tenue décontractée. L'insight clé : les gens quittent les managers, pas les entreprises. La qualité de la relation entre un membre de l'équipe et son manager est le plus fort prédicteur d'engagement — et cela ne coûte rien.", tips: ["Show creativity in non-monetary motivation", "Reference research on intrinsic vs extrinsic motivation", "Emphasize the manager-employee relationship as key"], tipsFr: ["Montrez de la créativité dans la motivation non-monétaire", "Référencez la recherche sur la motivation intrinsèque vs extrinsèque", "Mettez l'accent sur la relation manager-employé comme clé"] },
	{ id: qid("mgt"), question: "How do you manage a project from start to finish?", questionFr: "Comment gérez-vous un projet du début à la fin ?", type: "competency", field: "management", difficulty: "medium", sampleAnswer: "I follow the five project management phases: 1) Initiation — define the project charter (objectives, scope, stakeholders, high-level timeline, budget), get sponsor approval. 2) Planning — create the Work Breakdown Structure (WBS), develop the schedule (Gantt chart), estimate resources and costs, identify risks (risk matrix with probability x impact), plan communications, and define quality criteria. 3) Execution — assign tasks, coordinate resources, manage stakeholders, hold kickoff meeting, implement quality assurance processes. 4) Monitoring & Control — track progress against baselines (scope, schedule, cost), use earned value management (EVM) indicators (CPI, SPI), manage changes through formal change control, resolve issues, and provide status reports. 5) Closure — deliver final outputs, get formal acceptance, conduct lessons learned session, release resources, and archive documentation. Tools: MS Project or Jira for scheduling, Trello for kanban boards, Excel for budget tracking. Methodology choice: predictive (waterfall) for well-defined scope, agile (Scrum) for evolving requirements, or hybrid for most projects.", sampleAnswerFr: "Je suis les cinq phases de gestion de projet : 1) Initiation — définir la charte du projet (objectifs, périmètre, parties prenantes, planning de haut niveau, budget), obtenir l'approbation du sponsor. 2) Planification — créer le Work Breakdown Structure (WBS), développer le planning (diagramme de Gantt), estimer les ressources et les coûts, identifier les risques (matrice de risques avec probabilité x impact), planifier les communications, et définir les critères de qualité. 3) Exécution — assigner les tâches, coordonner les ressources, gérer les parties prenantes, tenir la réunion de lancement, implémenter les processus d'assurance qualité. 4) Suivi & Contrôle — suivre l'avancement par rapport aux référentiels (périmètre, planning, coût), utiliser les indicateurs de valeur acquise (EVM : CPI, SPI), gérer les changements par un contrôle formel des changements, résoudre les problèmes, et fournir des rapports d'avancement. 5) Clôture — livrer les livrables finaux, obtenir l'acceptation formelle, conduire une session de retour d'expérience, libérer les ressources, et archiver la documentation. Outils : MS Project ou Jira pour le planning, Trello pour les tableaux kanban, Excel pour le suivi budgétaire. Choix de méthodologie : prédictive (cascade) pour un périmètre bien défini, agile (Scrum) pour des exigences évolutives, ou hybride pour la plupart des projets.", tips: ["Cover all five phases of project management", "Mention specific tools and methodologies", "Show understanding of both predictive and agile approaches"], tipsFr: ["Couvrez les cinq phases de gestion de projet", "Mentionnez des outils et méthodologies spécifiques", "Montrez votre compréhension des approches prédictive et agile"] },
	{ id: qid("mgt"), question: "How do you handle underperforming team members?", questionFr: "Comment gérez-vous les membres d'équipe en sous-performance ?", type: "situational", field: "management", difficulty: "hard", sampleAnswer: "Addressing underperformance requires both empathy and accountability: 1) Diagnose — is it a skill issue (they can't), a will issue (they won't), or a situational issue (personal problems, unclear expectations, inadequate tools)? Don't assume — ask. Have a private, empathetic conversation. 2) Set clear expectations — document specific performance standards, provide concrete examples of the gap between current and expected performance. 3) Create a Performance Improvement Plan (PIP) — specific, measurable goals with a realistic timeline (30-60-90 days), support resources (training, coaching, tools), regular check-in meetings (weekly), and clear consequences if improvement isn't achieved. 4) Support actively — provide the training, mentoring, and resources promised. Remove obstacles. Celebrate progress. 5) Follow through — if improvement happens, acknowledge and sustain it. If not, escalate according to company policy and labor law (in Morocco: written warnings per Code du Travail Articles 37-39 before any disciplinary action). Key principle: assume good intentions first. Most people want to do well — something is blocking them.", sampleAnswerFr: "Traiter la sous-performance nécessite à la fois empathie et responsabilisation : 1) Diagnostiquer — est-ce un problème de compétence (ils ne peuvent pas), de volonté (ils ne veulent pas), ou de situation (problèmes personnels, attentes floues, outils inadéquats) ? Ne supposez pas — demandez. Ayez une conversation privée et empathique. 2) Fixer des attentes claires — documenter des standards de performance spécifiques, fournir des exemples concrets de l'écart entre la performance actuelle et attendue. 3) Créer un Plan d'Amélioration de la Performance (PIP) — objectifs spécifiques et mesurables avec un calendrier réaliste (30-60-90 jours), ressources de soutien (formation, coaching, outils), réunions de suivi régulières (hebdomadaires), et conséquences claires si l'amélioration n'est pas atteinte. 4) Soutenir activement — fournir la formation, le mentorat et les ressources promis. Supprimer les obstacles. Célébrer les progrès. 5) Suivre jusqu'au bout — si l'amélioration se produit, la reconnaître et la maintenir. Sinon, escalader selon la politique de l'entreprise et le droit du travail (au Maroc : avertissements écrits selon les Articles 37-39 du Code du Travail avant toute action disciplinaire). Principe clé : supposer les bonnes intentions d'abord. La plupart des gens veulent bien faire — quelque chose les bloque.", tips: ["Distinguish between skill, will, and situational issues", "Explain the PIP process with specific timelines", "Reference Moroccan labor law for disciplinary procedures"], tipsFr: ["Distinguez entre les problèmes de compétence, de volonté et de situation", "Expliquez le processus PIP avec des calendriers spécifiques", "Référencez le droit du travail marocain pour les procédures disciplinaires"] },
	{ id: qid("mgt"), question: "What is change management and how do you lead organizational change?", questionFr: "Qu'est-ce que la gestion du changement et comment conduisez-vous le changement organisationnel ?", type: "competency", field: "management", difficulty: "hard", sampleAnswer: "Change management is the structured approach to transitioning people, teams, and organizations from a current state to a desired future state. I use Kotter's 8-Step Model: 1) Create urgency — show why change is necessary (data, market threats, opportunities). 2) Build a guiding coalition — assemble influential stakeholders who champion the change. 3) Develop a vision — clear, compelling picture of the future state. 4) Communicate the vision — consistently, through multiple channels, in language people understand. 5) Empower action — remove obstacles (outdated processes, resistant managers, missing skills). 6) Generate short-term wins — visible improvements within 30-90 days to build momentum. 7) Build on gains — use early wins to drive deeper change. 8) Anchor in culture — embed changes in processes, metrics, and daily routines. Key success factors: executive sponsorship, clear communication (explain what's changing, why, and how it affects each person), training and support, feedback mechanisms, and patience — significant organizational change typically takes 18-36 months. In Morocco, change management must account for hierarchical culture and the importance of personal relationships in building trust for change.", sampleAnswerFr: "La gestion du changement est l'approche structurée pour faire passer les personnes, les équipes et les organisations d'un état actuel à un état futur souhaité. J'utilise le Modèle en 8 Étapes de Kotter : 1) Créer l'urgence — montrer pourquoi le changement est nécessaire (données, menaces du marché, opportunités). 2) Construire une coalition directrice — assembler des parties prenantes influentes qui défendent le changement. 3) Développer une vision — image claire et convaincante de l'état futur. 4) Communiquer la vision — de manière cohérente, via de multiples canaux, dans un langage que les gens comprennent. 5) Habiliter à l'action — supprimer les obstacles (processus obsolètes, managers résistants, compétences manquantes). 6) Générer des victoires à court terme — améliorations visibles sous 30-90 jours pour construire l'élan. 7) Capitaliser sur les gains — utiliser les premières victoires pour conduire un changement plus profond. 8) Ancrer dans la culture — intégrer les changements dans les processus, les métriques et les routines quotidiennes. Facteurs clés de succès : parrainage de la direction, communication claire (expliquer ce qui change, pourquoi, et comment cela affecte chaque personne), formation et soutien, mécanismes de feedback, et patience — un changement organisationnel significatif prend typiquement 18-36 mois. Au Maroc, la gestion du changement doit tenir compte de la culture hiérarchique et de l'importance des relations personnelles dans la construction de la confiance pour le changement.", tips: ["Use Kotter's 8-Step Model as your framework", "Emphasize the importance of quick wins for momentum", "Acknowledge cultural factors in Moroccan organizations"], tipsFr: ["Utilisez le Modèle en 8 Étapes de Kotter comme cadre", "Mettez l'accent sur l'importance des victoires rapides pour l'élan", "Reconnaissez les facteurs culturels dans les organisations marocaines"] },
	{ id: qid("mgt"), question: "What motivates you as a future manager?", questionFr: "Qu'est-ce qui vous motive en tant que futur manager ?", type: "motivation", field: "management", difficulty: "easy", sampleAnswer: "What motivates me most about management is the multiplier effect — as an individual contributor, I can produce X. As a manager, I can help a team of 10 each produce 2X. The impact is exponential. I'm passionate about developing people — watching someone I've mentored or coached grow from uncertainty to confidence, from junior to competent, gives me more satisfaction than any personal achievement. I also love the strategic challenge of aligning diverse talents toward common goals. The management challenges in Morocco excite me: bridging traditional and modern management approaches, leading multigenerational teams (from experienced veterans to Gen-Z digital natives), and building organizational cultures that retain top talent in a competitive market. I want to be the kind of manager I wish I had: someone who sets high standards but provides the support to reach them, who challenges you to grow while having your back.", sampleAnswerFr: "Ce qui me motive le plus dans le management est l'effet multiplicateur — en tant que contributeur individuel, je peux produire X. En tant que manager, je peux aider une équipe de 10 à produire chacun 2X. L'impact est exponentiel. Je suis passionné par le développement des personnes — voir quelqu'un que j'ai mentoré ou coaché passer de l'incertitude à la confiance, de junior à compétent, me donne plus de satisfaction que toute réussite personnelle. J'aime aussi le défi stratégique d'aligner des talents divers vers des objectifs communs. Les défis managériaux au Maroc m'enthousiasment : faire le pont entre les approches de management traditionnelles et modernes, diriger des équipes multigénérationnelles (des vétérans expérimentés aux digital natives Gen-Z), et construire des cultures organisationnelles qui retiennent les meilleurs talents dans un marché compétitif. Je veux être le type de manager que j'aurais aimé avoir : quelqu'un qui fixe des standards élevés mais fournit le soutien pour les atteindre, qui vous challenge de grandir tout en vous soutenant.", tips: ["Show passion for developing others, not just personal advancement", "Reference the multiplier effect of good management", "Acknowledge Morocco's specific management challenges"], tipsFr: ["Montrez votre passion pour le développement des autres, pas seulement l'avancement personnel", "Référencez l'effet multiplicateur du bon management", "Reconnaissez les défis managériaux spécifiques du Maroc"] },

	// --- GENIE CIVIL (additional 6 questions) ---
	{ id: qid("civ"), question: "What is the difference between Portland cement types?", questionFr: "Quelle est la différence entre les types de ciment Portland ?", type: "technical", field: "génie-civil", difficulty: "medium", sampleAnswer: "Portland cement types (per NM 10.1.004 Moroccan standard, aligned with EN 197-1): CEM I — Ordinary Portland cement (OPC), 95-100% clinker, highest strength, high heat of hydration, used for general structural concrete. CEM II — Portland composite cement, 65-94% clinker + additions (limestone, pozzolana, fly ash, slag), lower heat, better workability, most commonly used in Morocco (LafargeHolcim Maroc and Ciments du Maroc produce variants). CEM III — Blast furnace slag cement, 5-64% clinker + 36-95% slag, low heat, good sulfate resistance, used for mass concrete (dams, foundations in aggressive soils). CEM IV — Pozzolanic cement, suitable for marine environments. CEM V — Composite cement with slag and pozzolana. Key properties that differ: setting time, heat of hydration, sulfate resistance, early vs ultimate strength. In Morocco, CEM II/A-L 42.5 and CEM II/B-L 32.5 are the most commonly specified for residential and commercial construction. For major infrastructure projects (Mohammed VI Bridge, autoroute tunnels), CEM I or specialized formulations are used.", sampleAnswerFr: "Les types de ciment Portland (selon NM 10.1.004 norme marocaine, alignée sur EN 197-1) : CEM I — Ciment Portland ordinaire (CPO), 95-100% clinker, résistance la plus élevée, chaleur d'hydratation élevée, utilisé pour le béton structural général. CEM II — Ciment Portland composé, 65-94% clinker + additions (calcaire, pouzzolane, cendres volantes, laitier), chaleur plus basse, meilleure ouvrabilité, le plus utilisé au Maroc (LafargeHolcim Maroc et Ciments du Maroc produisent des variantes). CEM III — Ciment de haut fourneau, 5-64% clinker + 36-95% laitier, faible chaleur, bonne résistance aux sulfates, utilisé pour le béton de masse (barrages, fondations en sols agressifs). CEM IV — Ciment pouzzolanique, adapté aux environnements marins. CEM V — Ciment composé avec laitier et pouzzolane. Propriétés clés qui diffèrent : temps de prise, chaleur d'hydratation, résistance aux sulfates, résistance initiale vs ultime. Au Maroc, CEM II/A-L 42.5 et CEM II/B-L 32.5 sont les plus couramment spécifiés pour la construction résidentielle et commerciale. Pour les grands projets d'infrastructure (Pont Mohammed VI, tunnels d'autoroute), le CEM I ou des formulations spécialisées sont utilisés.", tips: ["Know the five CEM types and their key properties", "Mention specific Moroccan cement manufacturers", "Reference the NM standard aligned with EN 197-1"], tipsFr: ["Connaissez les cinq types CEM et leurs propriétés clés", "Mentionnez les fabricants de ciment marocains spécifiques", "Référencez la norme NM alignée sur EN 197-1"] },
	{ id: qid("civ"), question: "How do you ensure quality control on a construction site?", questionFr: "Comment assurez-vous le contrôle qualité sur un chantier de construction ?", type: "competency", field: "génie-civil", difficulty: "medium", sampleAnswer: "Quality control on site follows three levels: 1) Material testing — concrete cube tests (28-day compressive strength per NM 10.1.008), steel rebar tensile tests (yield strength verification), aggregate grading analysis, cement consistency tests. All testing through accredited labs (LPEE in Morocco). 2) Process control — inspect rebar placement before concrete pour (cover, spacing, lap lengths per BAEL 91), verify formwork alignment and dimensions, check concrete slump before placement, monitor curing conditions (temperature, moisture, duration). 3) Documentation — maintain a site quality register, daily inspection reports, non-conformance reports (NCRs) with corrective actions, test certificates, and as-built drawings. Key tools: level/theodolite for alignment checks, concrete test cubes (15x15x15cm per Moroccan standard), rebar scanner for cover depth verification. I also implement quality checklists for each activity (excavation, rebar, concrete, waterproofing) and hold pre-pour meetings with the crew to review quality requirements.", sampleAnswerFr: "Le contrôle qualité sur chantier suit trois niveaux : 1) Essais de matériaux — essais d'éprouvettes de béton (résistance à la compression à 28 jours selon NM 10.1.008), essais de traction des armatures (vérification de la limite d'élasticité), analyse granulométrique des agrégats, essais de consistance du ciment. Tous les essais via des labos accrédités (LPEE au Maroc). 2) Contrôle des processus — inspecter le ferraillage avant le coulage (enrobage, espacement, longueurs de recouvrement selon le BAEL 91), vérifier l'alignement et les dimensions du coffrage, contrôler l'affaissement du béton avant placement, surveiller les conditions de cure (température, humidité, durée). 3) Documentation — maintenir un registre qualité de chantier, rapports d'inspection quotidiens, rapports de non-conformité (NCR) avec actions correctives, certificats d'essais, et plans d'exécution. Outils clés : niveau/théodolite pour les contrôles d'alignement, éprouvettes de béton (15x15x15cm selon la norme marocaine), scanner d'armatures pour la vérification de l'enrobage. J'implémente aussi des checklists qualité pour chaque activité (terrassement, ferraillage, béton, étanchéité) et tiens des réunions pré-coulage avec l'équipe pour revoir les exigences qualité.", tips: ["Cover the three levels: material, process, and documentation", "Reference Moroccan testing standards and LPEE", "Mention specific quality tools and checklists"], tipsFr: ["Couvrez les trois niveaux : matériau, processus et documentation", "Référencez les normes d'essai marocaines et le LPEE", "Mentionnez des outils qualité et des checklists spécifiques"] },
	{ id: qid("civ"), question: "What seismic design considerations apply in Morocco?", questionFr: "Quelles considérations de conception parasismique s'appliquent au Maroc ?", type: "technical", field: "génie-civil", difficulty: "hard", sampleAnswer: "Morocco is seismically active, especially the Rif region and Al Hoceima area (6.3 magnitude earthquake in 2004). Seismic design is governed by RPS 2011 (Règlement de Construction Parasismique). Key provisions: seismic zoning — Morocco is divided into 5 zones (Zone 0 = low risk to Zone 4 = high risk, with Al Hoceima in Zone 4), each with a specific acceleration coefficient. Design principles: ductile detailing (closely spaced stirrups in columns and beams, confinement reinforcement in plastic hinge zones), regular geometry (avoid soft stories, re-entrant corners, torsional irregularities), adequate foundations (tied footings to prevent differential movement), and proper reinforcement detailing (135-degree hooks on stirrups, adequate development lengths). Structural systems: moment-resisting frames, braced frames, or shear walls — the choice affects the behavior factor (q) used to reduce seismic forces. Construction practices: avoid heavy cladding not tied to the structure, ensure quality concrete (minimum C25/30 for seismic elements), and provide expansion joints between different building sections. Post-2004, RPS compliance is strictly enforced in the Rif region.", sampleAnswerFr: "Le Maroc est sismiquement actif, particulièrement la région du Rif et Al Hoceima (séisme de magnitude 6.3 en 2004). La conception parasismique est régie par le RPS 2011 (Règlement de Construction Parasismique). Dispositions clés : zonage sismique — le Maroc est divisé en 5 zones (Zone 0 = risque faible à Zone 4 = risque élevé, avec Al Hoceima en Zone 4), chacune avec un coefficient d'accélération spécifique. Principes de conception : détails ductiles (cadres rapprochés dans les poteaux et poutres, armatures de confinement dans les zones de rotules plastiques), géométrie régulière (éviter les étages souples, les angles rentrants, les irrégularités en torsion), fondations adéquates (semelles liaisonnées pour empêcher les mouvements différentiels), et détails d'armature appropriés (crochets à 135° sur les cadres, longueurs de scellement adéquates). Systèmes structuraux : portiques auto-stables, contreventements, ou voiles en béton armé — le choix affecte le coefficient de comportement (q) utilisé pour réduire les forces sismiques. Pratiques de construction : éviter les habillages lourds non liés à la structure, assurer un béton de qualité (minimum C25/30 pour les éléments sismiques), et prévoir des joints de dilatation entre les différentes sections du bâtiment. Après 2004, la conformité au RPS est strictement appliquée dans la région du Rif.", tips: ["Know the RPS 2011 seismic zoning system", "Explain ductile detailing principles", "Reference the 2004 Al Hoceima earthquake as context"], tipsFr: ["Connaissez le système de zonage sismique du RPS 2011", "Expliquez les principes de détails ductiles", "Référencez le séisme d'Al Hoceima de 2004 comme contexte"] },
	{ id: qid("civ"), question: "What software do you use for structural analysis and design?", questionFr: "Quels logiciels utilisez-vous pour l'analyse et la conception structurales ?", type: "competency", field: "génie-civil", difficulty: "easy", sampleAnswer: "I use several structural analysis and design tools: Robot Structural Analysis (Autodesk) — 3D frame analysis, seismic analysis per RPS 2011, steel and concrete design per Eurocodes, widely used in Moroccan engineering offices. ETABS — building-specific structural analysis, especially for multi-story buildings (lateral analysis, seismic response spectrum analysis, dynamic analysis). SAP2000 — general-purpose finite element analysis for complex structures (bridges, dams, industrial structures). AutoCAD — 2D drafting for structural plans, sections, and details. Revit Structure — BIM modeling for structural design and coordination with architectural and MEP models. For concrete design: ARCHE (Graitec) for automated concrete element design, very popular in Francophone engineering. For geotechnical analysis: PLAXIS for soil-structure interaction. I choose based on project type: ETABS for buildings, SAP2000 for special structures, Robot for general analysis, and Revit when BIM coordination is required.", sampleAnswerFr: "J'utilise plusieurs outils d'analyse et de conception structurale : Robot Structural Analysis (Autodesk) — analyse de portiques 3D, analyse sismique selon le RPS 2011, conception acier et béton selon les Eurocodes, très utilisé dans les bureaux d'études marocains. ETABS — analyse structurale spécifique aux bâtiments, surtout pour les bâtiments multi-étages (analyse latérale, analyse spectrale sismique, analyse dynamique). SAP2000 — analyse par éléments finis polyvalente pour les structures complexes (ponts, barrages, structures industrielles). AutoCAD — dessin 2D pour les plans, coupes et détails de structure. Revit Structure — modélisation BIM pour la conception structurale et la coordination avec les modèles architecturaux et MEP. Pour la conception béton : ARCHE (Graitec) pour la conception automatisée d'éléments béton, très populaire dans l'ingénierie francophone. Pour l'analyse géotechnique : PLAXIS pour l'interaction sol-structure. Je choisis selon le type de projet : ETABS pour les bâtiments, SAP2000 pour les structures spéciales, Robot pour l'analyse générale, et Revit quand la coordination BIM est requise.", tips: ["Name specific software for each application area", "Mention RPS 2011 compliance capability", "Reference tools popular in Moroccan engineering practice"], tipsFr: ["Nommez des logiciels spécifiques pour chaque domaine d'application", "Mentionnez la capacité de conformité au RPS 2011", "Référencez les outils populaires dans la pratique d'ingénierie marocaine"] },
	{ id: qid("civ"), question: "How do you read and interpret structural drawings?", questionFr: "Comment lisez-vous et interprétez-vous les plans de structure ?", type: "competency", field: "génie-civil", difficulty: "easy", sampleAnswer: "Reading structural drawings requires understanding several plan types: 1) Foundation plan (plan de fondation) — shows footing locations, sizes, depths, and types (isolated, strip, raft). Key info: bearing capacity assumption, concrete class, rebar details. 2) Floor framing plan (plan de coffrage) — shows beam grid, slab thickness, column locations, openings. Read beam dimensions (width x height), slab span direction, and level references. 3) Reinforcement details (plans de ferraillage) — show rebar size (HA6 to HA25), spacing, lap lengths, cover, and hook details. Read section cuts for beam and column reinforcement (longitudinal bars, stirrup spacing). 4) General notes — specify concrete class (C25/30), steel grade (FeE500), cover requirements, and applicable codes (BAEL 91, RPS 2011). Key symbols: diameter symbol for rebar, level arrows, section cut indicators, and scale notations. I always cross-reference between plans and verify dimensions before construction. Any discrepancy is flagged as an RFI (Request for Information) to the design engineer.", sampleAnswerFr: "La lecture des plans de structure nécessite la compréhension de plusieurs types de plans : 1) Plan de fondation — montre les emplacements, dimensions, profondeurs et types de semelles (isolées, filantes, radier). Info clé : hypothèse de portance du sol, classe de béton, détails du ferraillage. 2) Plan de coffrage — montre la grille de poutres, l'épaisseur de dalle, les emplacements de poteaux, les ouvertures. Lire les dimensions des poutres (largeur x hauteur), la direction de portée des dalles, et les références de niveau. 3) Plans de ferraillage — montrent le diamètre des armatures (HA6 à HA25), l'espacement, les longueurs de recouvrement, l'enrobage, et les détails de crochets. Lire les coupes de section pour le ferraillage des poutres et poteaux (barres longitudinales, espacement des cadres). 4) Notes générales — spécifient la classe de béton (C25/30), la nuance d'acier (FeE500), les exigences d'enrobage, et les codes applicables (BAEL 91, RPS 2011). Symboles clés : symbole de diamètre pour les armatures, flèches de niveau, indicateurs de coupe, et notations d'échelle. Je vérifie toujours les dimensions entre les plans avant la construction. Toute incohérence est signalée comme un RFI (Request for Information) à l'ingénieur de conception.", tips: ["Demonstrate knowledge of all structural plan types", "Mention specific Moroccan rebar designations and concrete classes", "Emphasize cross-referencing between plans"], tipsFr: ["Démontrez la connaissance de tous les types de plans structuraux", "Mentionnez les désignations d'armatures marocaines spécifiques et les classes de béton", "Mettez l'accent sur le recoupement entre les plans"] },
	{ id: qid("civ"), question: "Why did you choose civil engineering?", questionFr: "Pourquoi avez-vous choisi le génie civil ?", type: "motivation", field: "génie-civil", difficulty: "easy", sampleAnswer: "I chose civil engineering because it shapes the physical world we live in. Every road, bridge, building, and dam was designed by a civil engineer. The permanence of our work inspires me — structures we build today will serve communities for 50-100 years. Morocco offers incredible opportunities: the country is investing heavily in infrastructure (TGV Al Boraq high-speed rail, Tanger Med port expansion, new cities like Mohammed VI Green City, the 2030 World Cup stadium projects, autoroute expansion). These aren't just construction projects — they're transforming how Moroccans live, work, and connect. I want to be part of this transformation. What specifically drew me was the combination of science (structural mechanics, geotechnics, hydraulics) with practical problem-solving on site. I love both the analytical design work in the office and the hands-on coordination on the construction site.", sampleAnswerFr: "J'ai choisi le génie civil car il façonne le monde physique dans lequel nous vivons. Chaque route, pont, bâtiment et barrage a été conçu par un ingénieur civil. La permanence de notre travail m'inspire — les structures que nous construisons aujourd'hui serviront les communautés pendant 50-100 ans. Le Maroc offre des opportunités incroyables : le pays investit massivement dans les infrastructures (TGV Al Boraq train à grande vitesse, expansion du port Tanger Med, nouvelles villes comme Mohammed VI Green City, les projets de stades pour la Coupe du Monde 2030, expansion de l'autoroute). Ce ne sont pas que des projets de construction — ils transforment la façon dont les Marocains vivent, travaillent et se connectent. Je veux faire partie de cette transformation. Ce qui m'a spécifiquement attiré est la combinaison de la science (mécanique des structures, géotechnique, hydraulique) avec la résolution de problèmes pratiques sur le terrain. J'aime à la fois le travail de conception analytique au bureau et la coordination pratique sur le chantier.", tips: ["Show genuine passion for building infrastructure", "Reference specific major Moroccan projects", "Connect the analytical and practical aspects of civil engineering"], tipsFr: ["Montrez une passion sincère pour la construction d'infrastructure", "Référencez des projets marocains majeurs spécifiques", "Connectez les aspects analytiques et pratiques du génie civil"] },

	// --- GENIE ELECTRIQUE (additional 5 questions) ---
	{ id: qid("elec"), question: "What are the main protection devices in an electrical installation?", questionFr: "Quels sont les principaux dispositifs de protection dans une installation électrique ?", type: "technical", field: "génie-électrique", difficulty: "medium", sampleAnswer: "Electrical protection devices ensure safety and equipment protection: 1) Circuit breakers (disjoncteurs) — automatic overcurrent protection. Types: MCB (miniature circuit breaker) for branch circuits (B, C, D curves), MCCB (molded case circuit breaker) for main panels, ACB (air circuit breaker) for high-current applications. 2) Differential protection (disjoncteur différentiel) — detects earth leakage current. 30mA for personal protection (mandatory per NF C 15-100), 300mA for fire protection. Types: AC (sinusoidal), A (sinusoidal + pulsating DC), B (all types including pure DC). 3) Fuses (fusibles) — sacrificial overcurrent protection. Types: gG/gL (general purpose), aM (motor protection). 4) Surge protection devices (parafoudres) — Type 1 (lightning), Type 2 (overvoltage), Type 3 (sensitive equipment). 5) Motor protection — thermal overload relay (relais thermique), motor circuit breaker (GV2 Schneider). Coordination: selectivity between upstream and downstream protection devices ensures only the nearest device trips. In Morocco, installations must comply with NF C 15-100 and are inspected by approved control bureaus (bureaux de contrôle agréés like APAVE, Bureau Veritas).", sampleAnswerFr: "Les dispositifs de protection électrique assurent la sécurité et la protection des équipements : 1) Disjoncteurs — protection automatique contre les surintensités. Types : disjoncteur magnétothermique modulaire pour les circuits dérivés (courbes B, C, D), disjoncteur en boîtier moulé pour les tableaux principaux, disjoncteur à air pour les applications haute intensité. 2) Protection différentielle (disjoncteur différentiel) — détecte les courants de fuite à la terre. 30mA pour la protection des personnes (obligatoire selon NF C 15-100), 300mA pour la protection incendie. Types : AC (sinusoïdal), A (sinusoïdal + DC pulsé), B (tous types incluant DC pur). 3) Fusibles — protection sacrificielle contre les surintensités. Types : gG/gL (usage général), aM (protection moteur). 4) Parafoudres — Type 1 (foudre), Type 2 (surtension), Type 3 (équipements sensibles). 5) Protection moteur — relais thermique de surcharge, disjoncteur-moteur (GV2 Schneider). Coordination : la sélectivité entre les protections amont et aval assure que seul le dispositif le plus proche déclenche. Au Maroc, les installations doivent être conformes à NF C 15-100 et sont inspectées par des bureaux de contrôle agréés comme APAVE, Bureau Veritas.", tips: ["Cover all five types of protection devices", "Explain the 30mA vs 300mA differential protection requirement", "Mention NF C 15-100 and Moroccan inspection requirements"], tipsFr: ["Couvrez les cinq types de dispositifs de protection", "Expliquez l'exigence de protection différentielle 30mA vs 300mA", "Mentionnez NF C 15-100 et les exigences d'inspection marocaines"] },
	{ id: qid("elec"), question: "Explain the principle of a three-phase electrical system.", questionFr: "Expliquez le principe d'un système électrique triphasé.", type: "technical", field: "génie-électrique", difficulty: "easy", sampleAnswer: "A three-phase system uses three conductors carrying alternating currents at 120 degrees phase shift. Morocco uses the European standard: 400V between phases (tension composée) and 230V between phase and neutral (tension simple), at 50Hz frequency. Advantages over single-phase: delivers more power with less conductor material (saves 25% copper), produces a rotating magnetic field (essential for three-phase motors — no starting capacitor needed), provides constant instantaneous power (smoother for motors), and allows two voltage levels from one supply. Connection types: Star (étoile/Y) — provides both 400V and 230V, neutral available, used for distribution. Delta (triangle/D) — provides 400V only, no neutral, used for motor connections and transformers. Power formula: P = sqrt(3) x V x I x cos(phi) for balanced loads. In Morocco, ONEE (Office National de l'Électricité et de l'Eau Potable) delivers three-phase supply to industrial and large commercial consumers. Residential supply is single-phase 230V.", sampleAnswerFr: "Un système triphasé utilise trois conducteurs transportant des courants alternatifs avec un déphasage de 120 degrés. Le Maroc utilise le standard européen : 400V entre phases (tension composée) et 230V entre phase et neutre (tension simple), à 50Hz de fréquence. Avantages par rapport au monophasé : délivre plus de puissance avec moins de conducteur (économise 25% de cuivre), produit un champ magnétique tournant (essentiel pour les moteurs triphasés — pas de condensateur de démarrage nécessaire), fournit une puissance instantanée constante (plus lisse pour les moteurs), et permet deux niveaux de tension à partir d'une seule alimentation. Types de connexion : Étoile (Y) — fournit 400V et 230V, neutre disponible, utilisé pour la distribution. Triangle (D) — fournit 400V uniquement, pas de neutre, utilisé pour les connexions moteur et les transformateurs. Formule de puissance : P = sqrt(3) x V x I x cos(phi) pour les charges équilibrées. Au Maroc, l'ONEE (Office National de l'Électricité et de l'Eau Potable) fournit l'alimentation triphasée aux consommateurs industriels et grands commerces. L'alimentation résidentielle est monophasée 230V.", tips: ["Explain the 120-degree phase shift concept", "Know Morocco's voltage standards (230V/400V at 50Hz)", "Compare Star and Delta connections with their applications"], tipsFr: ["Expliquez le concept de déphasage de 120 degrés", "Connaissez les standards de tension du Maroc (230V/400V à 50Hz)", "Comparez les connexions Étoile et Triangle avec leurs applications"] },
	{ id: qid("elec"), question: "How do you size an electrical cable for a given load?", questionFr: "Comment dimensionnez-vous un câble électrique pour une charge donnée ?", type: "competency", field: "génie-électrique", difficulty: "hard", sampleAnswer: "Cable sizing follows a multi-criteria approach per NF C 15-100: 1) Calculate load current — I = P / (V x cos_phi) for single-phase, I = P / (sqrt(3) x V x cos_phi) for three-phase. 2) Apply correction factors — ambient temperature (Kt), grouping of cables (Kg), installation method (underground, tray, conduit), and soil thermal resistivity for buried cables. Adjusted current: Ib = I / (Kt x Kg). 3) Select cable size — from NF C 15-100 current carrying capacity tables, choose the cross-section where Iz >= Ib. Common sizes: 1.5mm² (16A), 2.5mm² (20A), 4mm² (27A), 6mm² (34A), 10mm² (46A). 4) Verify voltage drop — max 3% for lighting, 5% for other circuits (NF C 15-100). Formula: delta_V = (rho x L x I x 2) / S for single-phase. If exceeded, increase cable size. 5) Verify short-circuit withstand — cable must handle thermal stress during fault clearing time. Adiabatic equation: I²t <= K²S² where K = 115 for copper PVC. 6) Select cable type — U1000R2V (general purpose), H07RN-F (flexible, industrial), or FR cables for fire-rated applications. Tools: Caneco BT software (widely used in Morocco) automates all calculations per NF C 15-100.", sampleAnswerFr: "Le dimensionnement de câble suit une approche multi-critères selon NF C 15-100 : 1) Calculer le courant de charge — I = P / (V x cos_phi) en monophasé, I = P / (sqrt(3) x V x cos_phi) en triphasé. 2) Appliquer les facteurs de correction — température ambiante (Kt), groupement de câbles (Kg), mode d'installation (enterré, chemin de câble, conduit), et résistivité thermique du sol pour les câbles enterrés. Courant ajusté : Ib = I / (Kt x Kg). 3) Sélectionner la section du câble — dans les tableaux de capacité de courant NF C 15-100, choisir la section où Iz >= Ib. Sections courantes : 1,5mm² (16A), 2,5mm² (20A), 4mm² (27A), 6mm² (34A), 10mm² (46A). 4) Vérifier la chute de tension — max 3% pour l'éclairage, 5% pour les autres circuits (NF C 15-100). Formule : delta_V = (rho x L x I x 2) / S en monophasé. Si dépassé, augmenter la section. 5) Vérifier la tenue au court-circuit — le câble doit supporter la contrainte thermique pendant le temps d'élimination du défaut. Équation adiabatique : I²t <= K²S² où K = 115 pour le cuivre PVC. 6) Sélectionner le type de câble — U1000R2V (usage général), H07RN-F (flexible, industriel), ou câbles FR pour les applications résistantes au feu. Outils : le logiciel Caneco BT (très utilisé au Maroc) automatise tous les calculs selon NF C 15-100.", tips: ["Show the complete multi-step sizing process", "Know the key NF C 15-100 voltage drop limits", "Mention Caneco BT as the standard tool in Morocco"], tipsFr: ["Montrez le processus complet de dimensionnement en plusieurs étapes", "Connaissez les limites de chute de tension clés de NF C 15-100", "Mentionnez Caneco BT comme l'outil standard au Maroc"] },
	{ id: qid("elec"), question: "What is power factor and why does it need correction?", questionFr: "Qu'est-ce que le facteur de puissance et pourquoi faut-il le corriger ?", type: "technical", field: "génie-électrique", difficulty: "medium", sampleAnswer: "Power factor (cos phi) is the ratio of real power (kW) to apparent power (kVA). It measures how efficiently electrical power is being used. cos_phi = P / S = P / sqrt(P² + Q²). A power factor of 1 means all power is used productively; below 1 means reactive power (kVAR) is present, which doesn't do useful work but still loads the electrical system. Common causes of low power factor: induction motors (especially lightly loaded), transformers, fluorescent lighting ballasts, and power electronics. Why correct it: 1) ONEE penalizes power factor below 0.8 on industrial tariffs (surtaxe pour énergie réactive). 2) Low power factor increases current in cables (needs larger cables), increases losses (I²R), reduces transformer and generator capacity, and causes voltage drops. Correction methods: 1) Capacitor banks — most common, installed at main panel (global correction) or individual motors (local correction). Size: Qc = P x (tan_phi1 - tan_phi2). 2) Synchronous motors — act as capacitors when over-excited. 3) Active power factor correction (PFC) in electronic power supplies. Target: cos_phi >= 0.93 to avoid ONEE penalties.", sampleAnswerFr: "Le facteur de puissance (cos phi) est le rapport de la puissance active (kW) à la puissance apparente (kVA). Il mesure l'efficacité de l'utilisation de l'énergie électrique. cos_phi = P / S = P / sqrt(P² + Q²). Un facteur de puissance de 1 signifie que toute la puissance est utilisée productivement ; en dessous de 1, il y a de la puissance réactive (kVAR) qui ne fait pas de travail utile mais charge quand même le système électrique. Causes courantes d'un faible facteur de puissance : moteurs à induction (surtout faiblement chargés), transformateurs, ballasts de tubes fluorescents, et électronique de puissance. Pourquoi le corriger : 1) L'ONEE pénalise un facteur de puissance inférieur à 0,8 sur les tarifs industriels (surtaxe pour énergie réactive). 2) Un faible facteur de puissance augmente le courant dans les câbles (nécessite des câbles plus gros), augmente les pertes (I²R), réduit la capacité des transformateurs et générateurs, et cause des chutes de tension. Méthodes de correction : 1) Batteries de condensateurs — la plus courante, installée au tableau principal (correction globale) ou sur les moteurs individuels (correction locale). Dimensionnement : Qc = P x (tan_phi1 - tan_phi2). 2) Moteurs synchrones — agissent comme des condensateurs quand surexcités. 3) Correction active du facteur de puissance (PFC) dans les alimentations électroniques. Objectif : cos_phi >= 0,93 pour éviter les pénalités de l'ONEE.", tips: ["Define power factor with the formula and physical meaning", "Explain ONEE's penalty threshold for low power factor", "Describe capacitor bank sizing formula"], tipsFr: ["Définissez le facteur de puissance avec la formule et la signification physique", "Expliquez le seuil de pénalité de l'ONEE pour un faible facteur de puissance", "Décrivez la formule de dimensionnement des batteries de condensateurs"] },
	{ id: qid("elec"), question: "What career path excites you in electrical engineering?", questionFr: "Quel parcours de carrière vous enthousiasme en génie électrique ?", type: "motivation", field: "génie-électrique", difficulty: "easy", sampleAnswer: "I'm most excited about the energy transition and renewable energy integration. Morocco is a global leader in solar energy with the Noor Ouarzazate complex (580 MW, one of the world's largest concentrated solar plants) and expanding wind farms (Tarfaya 301 MW, Midelt 180 MW). The electrical engineering challenges are fascinating: integrating intermittent renewable sources into the grid, designing smart grid systems, developing energy storage solutions, and optimizing power distribution. Morocco's target of 52% renewable electricity by 2030 means enormous demand for electrical engineers who understand both traditional power systems and renewable technologies. I want to specialize in power electronics and grid integration — the technologies that make renewable energy reliable. I also see opportunity in industrial energy efficiency: helping Moroccan factories reduce electricity costs through power factor correction, variable speed drives, and energy management systems (ISO 50001).", sampleAnswerFr: "Je suis le plus enthousiaste par la transition énergétique et l'intégration des énergies renouvelables. Le Maroc est un leader mondial dans l'énergie solaire avec le complexe Noor Ouarzazate (580 MW, l'une des plus grandes centrales solaires à concentration au monde) et des parcs éoliens en expansion (Tarfaya 301 MW, Midelt 180 MW). Les défis en génie électrique sont fascinants : intégrer les sources renouvelables intermittentes au réseau, concevoir des systèmes de réseau intelligent (smart grid), développer des solutions de stockage d'énergie, et optimiser la distribution d'énergie. L'objectif du Maroc de 52% d'électricité renouvelable d'ici 2030 signifie une demande énorme pour les ingénieurs électriciens qui comprennent à la fois les systèmes de puissance traditionnels et les technologies renouvelables. Je veux me spécialiser en électronique de puissance et intégration au réseau — les technologies qui rendent l'énergie renouvelable fiable. Je vois aussi une opportunité dans l'efficacité énergétique industrielle : aider les usines marocaines à réduire les coûts d'électricité par la correction du facteur de puissance, les variateurs de vitesse, et les systèmes de management de l'énergie (ISO 50001).", tips: ["Show passion for Morocco's renewable energy goals", "Reference specific projects (Noor, Tarfaya, Midelt)", "Connect your specialization interest to market demand"], tipsFr: ["Montrez votre passion pour les objectifs d'énergie renouvelable du Maroc", "Référencez des projets spécifiques (Noor, Tarfaya, Midelt)", "Connectez votre intérêt de spécialisation à la demande du marché"] },

	// --- GENERAL additional behavioral/situational/motivation ---
	{ id: qid("gen"), question: "Tell me about a time you received negative feedback.", questionFr: "Parlez-moi d'un moment où vous avez reçu un feedback négatif.", type: "behavioral", field: "général", difficulty: "medium", sampleAnswer: "During my internship, my supervisor told me that while my technical work was good, my reports were too long and poorly structured — key findings were buried in unnecessary detail. My initial reaction was defensiveness, but I took a step back and realized she was right. I asked for examples of well-written reports in the department and studied their structure: executive summary first, key findings highlighted, detailed analysis in appendixes. I applied this to my next report, cutting its length by 40% while making it more impactful. My supervisor noticed the improvement immediately and said it was now 'easy to act on.' I learned that the ability to communicate findings concisely is as important as the analysis itself. Since then, I actively seek feedback because I've seen how it accelerates my growth.", sampleAnswerFr: "Pendant mon stage, ma superviseure m'a dit que bien que mon travail technique soit bon, mes rapports étaient trop longs et mal structurés — les résultats clés étaient noyés dans des détails inutiles. Ma réaction initiale était défensive, mais j'ai pris du recul et réalisé qu'elle avait raison. J'ai demandé des exemples de rapports bien écrits dans le département et étudié leur structure : résumé exécutif d'abord, résultats clés mis en évidence, analyse détaillée en annexes. J'ai appliqué cela à mon rapport suivant, réduisant sa longueur de 40% tout en le rendant plus impactant. Ma superviseure a remarqué l'amélioration immédiatement et a dit qu'il était maintenant 'facile à exploiter.' J'ai appris que la capacité à communiquer les résultats de manière concise est aussi importante que l'analyse elle-même. Depuis, je recherche activement le feedback car j'ai vu comment il accélère ma croissance.", tips: ["Show emotional maturity in how you received the feedback", "Describe the specific actions you took to improve", "Demonstrate ongoing openness to feedback"], tipsFr: ["Montrez de la maturité émotionnelle dans comment vous avez reçu le feedback", "Décrivez les actions spécifiques que vous avez prises pour vous améliorer", "Démontrez une ouverture continue au feedback"] },
	{ id: qid("gen"), question: "Where do you see yourself in five years?", questionFr: "Où vous voyez-vous dans cinq ans ?", type: "motivation", field: "général", difficulty: "easy", sampleAnswer: "In five years, I want to be a recognized expert in my field with a track record of delivering impactful projects. Specifically: Years 1-2 — master the fundamentals of my role, earn the trust of my team through consistent, quality work, and obtain relevant professional certifications. Years 3-4 — take on increasing responsibility, lead projects or small teams, develop mentoring skills by guiding interns and junior colleagues. Year 5 — be in a position of technical leadership where I influence strategic decisions and contribute to the company's growth. I'm also committed to continuous learning — whether through professional development programs, industry conferences, or advanced certifications. I see myself growing with this company rather than job-hopping, because I believe deep expertise in one organization creates more value than superficial experience across many.", sampleAnswerFr: "Dans cinq ans, je veux être un expert reconnu dans mon domaine avec un bilan de projets à fort impact. Spécifiquement : Années 1-2 — maîtriser les fondamentaux de mon rôle, gagner la confiance de mon équipe par un travail constant et de qualité, et obtenir des certifications professionnelles pertinentes. Années 3-4 — prendre des responsabilités croissantes, diriger des projets ou de petites équipes, développer des compétences de mentorat en guidant les stagiaires et collègues juniors. Année 5 — être dans une position de leadership technique où j'influence les décisions stratégiques et contribue à la croissance de l'entreprise. Je suis aussi engagé dans l'apprentissage continu — que ce soit par des programmes de développement professionnel, des conférences de l'industrie, ou des certifications avancées. Je me vois évoluer avec cette entreprise plutôt que de changer fréquemment, car je crois qu'une expertise approfondie dans une organisation crée plus de valeur qu'une expérience superficielle dans plusieurs.", tips: ["Show a realistic, phased growth plan", "Align your goals with the company's trajectory", "Express commitment to staying and growing with the organization"], tipsFr: ["Montrez un plan de croissance réaliste et phasé", "Alignez vos objectifs avec la trajectoire de l'entreprise", "Exprimez votre engagement à rester et évoluer avec l'organisation"] },
	{ id: qid("gen"), question: "How do you stay current with developments in your field?", questionFr: "Comment restez-vous à jour avec les développements dans votre domaine ?", type: "behavioral", field: "général", difficulty: "easy", sampleAnswer: "I use a structured approach to continuous learning: 1) Daily — follow industry news through LinkedIn feeds, specialized newsletters, and professional social media accounts. 2) Weekly — read technical articles, blog posts, and case studies from industry leaders. I allocate 2-3 hours per week specifically for learning. 3) Monthly — participate in webinars, online courses (Coursera, LinkedIn Learning), or local professional meetups. 4) Quarterly — attend industry events, conferences, or workshops when possible (SITeau for water/environment in Morocco, Elec Expo for electrical, SIAM for agriculture). 5) Ongoing — maintain professional certifications through continuing education requirements, participate in professional associations (Ordre des Ingénieurs), and network with peers for knowledge exchange. I also believe in learning by doing — taking on challenging projects that stretch my skills and force me to learn new technologies or methods. The key is making learning a habit, not an occasional event.", sampleAnswerFr: "J'utilise une approche structurée pour l'apprentissage continu : 1) Quotidien — suivre les actualités de l'industrie via les fils LinkedIn, les newsletters spécialisées, et les comptes professionnels sur les réseaux sociaux. 2) Hebdomadaire — lire des articles techniques, des posts de blog, et des études de cas de leaders de l'industrie. J'alloue 2-3 heures par semaine spécifiquement à l'apprentissage. 3) Mensuel — participer à des webinaires, cours en ligne (Coursera, LinkedIn Learning), ou meetups professionnels locaux. 4) Trimestriel — assister aux événements de l'industrie, conférences, ou workshops quand possible (SITeau pour l'eau/environnement au Maroc, Elec Expo pour l'électrique, SIAM pour l'agriculture). 5) Continu — maintenir les certifications professionnelles par les exigences de formation continue, participer aux associations professionnelles (Ordre des Ingénieurs), et réseauter avec les pairs pour l'échange de connaissances. Je crois aussi en l'apprentissage par la pratique — prendre des projets challengeants qui élargissent mes compétences et me forcent à apprendre de nouvelles technologies ou méthodes. La clé est de faire de l'apprentissage une habitude, pas un événement occasionnel.", tips: ["Show a structured, multi-frequency learning plan", "Name specific resources and events relevant to your field", "Mention Moroccan professional events and associations"], tipsFr: ["Montrez un plan d'apprentissage structuré et multi-fréquence", "Nommez des ressources et événements spécifiques pertinents pour votre domaine", "Mentionnez les événements et associations professionnels marocains"] },
	{ id: qid("gen"), question: "What salary expectations do you have?", questionFr: "Quelles sont vos prétentions salariales ?", type: "behavioral", field: "général", difficulty: "hard", sampleAnswer: "I've researched market salaries for this role and level in Morocco. Based on my research (ReKrute salary guide, discussions with professionals in the field, and industry benchmarks), the typical range for a fresh graduate in this field is [X,000 - Y,000 MAD monthly]. I'm looking for fair compensation that reflects both the market rate and the value I bring. However, I'm also focused on the total package: career development opportunities, training budget, work environment, and growth potential are equally important to me at this stage of my career. I'm flexible and open to discussion. I'd prefer to understand the full scope of the role and the compensation structure before settling on a specific number. What is the salary range you've budgeted for this position?", sampleAnswerFr: "J'ai recherché les salaires du marché pour ce rôle et ce niveau au Maroc. Selon mes recherches (guide salarial ReKrute, discussions avec des professionnels du domaine, et benchmarks de l'industrie), la fourchette typique pour un jeune diplômé dans ce domaine est de [X 000 - Y 000 MAD mensuel]. Je recherche une rémunération équitable qui reflète à la fois le taux du marché et la valeur que j'apporte. Cependant, je me concentre aussi sur le package total : les opportunités de développement de carrière, le budget de formation, l'environnement de travail, et le potentiel de croissance sont également importants pour moi à ce stade de ma carrière. Je suis flexible et ouvert à la discussion. Je préférerais comprendre le périmètre complet du rôle et la structure de rémunération avant de me fixer sur un chiffre spécifique. Quelle est la fourchette salariale que vous avez budgétée pour ce poste ?", tips: ["Show you've done salary research for the Moroccan market", "Give a range, not a single number", "Redirect the question to also ask about the employer's budget"], tipsFr: ["Montrez que vous avez fait des recherches salariales pour le marché marocain", "Donnez une fourchette, pas un chiffre unique", "Redirigez la question pour aussi demander le budget de l'employeur"] },
	{ id: qid("gen"), question: "Do you have any questions for us?", questionFr: "Avez-vous des questions à nous poser ?", type: "behavioral", field: "général", difficulty: "easy", sampleAnswer: "Absolutely — I have several. 1) About the role: What does a typical day look like for someone in this position? What are the most important projects I would work on in the first six months? 2) About the team: How is the team structured, and who would I be working with most closely? What is the team's working culture like? 3) About growth: What career development opportunities does the company offer? Is there a structured path for advancement? What training or certification support is available? 4) About the company: What are the company's biggest priorities or challenges for the next year? How has the company evolved in recent years? 5) About the process: What are the next steps in the hiring process, and when can I expect to hear back? These questions help me understand if this is the right mutual fit, and they show that I'm serious about making an informed decision.", sampleAnswerFr: "Absolument — j'en ai plusieurs. 1) Sur le poste : À quoi ressemble une journée typique pour quelqu'un à ce poste ? Quels sont les projets les plus importants sur lesquels je travaillerais dans les six premiers mois ? 2) Sur l'équipe : Comment l'équipe est-elle structurée, et avec qui travaillerais-je le plus étroitement ? Comment est la culture de travail de l'équipe ? 3) Sur la croissance : Quelles opportunités de développement de carrière l'entreprise offre-t-elle ? Y a-t-il un parcours structuré d'avancement ? Quel soutien en formation ou certification est disponible ? 4) Sur l'entreprise : Quelles sont les plus grandes priorités ou défis de l'entreprise pour l'année prochaine ? Comment l'entreprise a-t-elle évolué ces dernières années ? 5) Sur le processus : Quelles sont les prochaines étapes du processus de recrutement, et quand puis-je m'attendre à un retour ? Ces questions m'aident à comprendre si c'est le bon fit mutuel, et elles montrent que je suis sérieux dans ma prise de décision éclairée.", tips: ["Always have 3-5 thoughtful questions prepared", "Ask about the role, team, growth, and company", "Asking about next steps shows confidence and organization"], tipsFr: ["Ayez toujours 3-5 questions réfléchies préparées", "Posez des questions sur le rôle, l'équipe, la croissance et l'entreprise", "Demander les prochaines étapes montre de la confiance et de l'organisation"] },
	{ id: qid("gen"), question: "How do you handle stress and pressure at work?", questionFr: "Comment gérez-vous le stress et la pression au travail ?", type: "behavioral", field: "général", difficulty: "medium", sampleAnswer: "I manage stress through a combination of prevention and response strategies. Prevention: I prioritize and plan my work using time blocking and to-do lists (I use the Eisenhower matrix: urgent/important), which prevents last-minute rushes. I set realistic expectations with stakeholders about timelines. I break large tasks into smaller, manageable pieces. Response: When stress hits, I take a step back and assess what's truly urgent versus what feels urgent. I focus on one task at a time rather than multitasking (which increases stress without increasing productivity). I communicate openly with my team when workload is excessive — asking for help is a sign of maturity, not weakness. For physical stress management, I exercise regularly, maintain healthy sleep habits, and take short breaks during intense work periods. During my exams at IMTA, I learned that consistent daily preparation prevents the panic of last-minute cramming. That lesson applies directly to professional work.", sampleAnswerFr: "Je gère le stress par une combinaison de stratégies de prévention et de réponse. Prévention : je priorise et planifie mon travail en utilisant le time blocking et des listes de tâches (j'utilise la matrice d'Eisenhower : urgent/important), ce qui évite les ruées de dernière minute. Je fixe des attentes réalistes avec les parties prenantes sur les délais. Je découpe les grandes tâches en morceaux plus petits et gérables. Réponse : quand le stress arrive, je prends du recul et évalue ce qui est vraiment urgent versus ce qui semble urgent. Je me concentre sur une tâche à la fois plutôt que de multi-tasker (ce qui augmente le stress sans augmenter la productivité). Je communique ouvertement avec mon équipe quand la charge de travail est excessive — demander de l'aide est un signe de maturité, pas de faiblesse. Pour la gestion physique du stress, je fais de l'exercice régulièrement, maintiens de bonnes habitudes de sommeil, et prends de courtes pauses pendant les périodes de travail intense. Pendant mes examens à l'IMTA, j'ai appris que la préparation quotidienne constante évite la panique du bachotage de dernière minute. Cette leçon s'applique directement au travail professionnel.", tips: ["Show both prevention and response strategies", "Mention specific tools like the Eisenhower matrix", "Acknowledge that asking for help is a strength"], tipsFr: ["Montrez des stratégies de prévention et de réponse", "Mentionnez des outils spécifiques comme la matrice d'Eisenhower", "Reconnaissez que demander de l'aide est une force"] },
	{ id: qid("gen"), question: "What ethical dilemma have you faced and how did you resolve it?", questionFr: "Quel dilemme éthique avez-vous affronté et comment l'avez-vous résolu ?", type: "situational", field: "général", difficulty: "hard", sampleAnswer: "During a group project at IMTA, I discovered that a teammate had copied a significant portion of our report from an online source without attribution. This created a dilemma: reporting it could harm the teammate's academic standing and damage our team dynamic; ignoring it meant submitting plagiarized work with my name on it. I chose to address it directly with the teammate first. I explained that plagiarism could result in failure for the entire team and damage our professional integrity. I offered to help them rewrite the sections in their own words, giving proper credit to sources. The teammate was initially defensive but eventually understood the seriousness. We rewrote the sections together and submitted an original report. I learned that addressing ethical issues early, directly, and with empathy is almost always better than ignoring them or escalating immediately. The teammate later thanked me for handling it privately.", sampleAnswerFr: "Pendant un projet de groupe à l'IMTA, j'ai découvert qu'un coéquipier avait copié une partie significative de notre rapport d'une source en ligne sans attribution. Cela a créé un dilemme : le signaler pourrait nuire au parcours académique du coéquipier et endommager notre dynamique d'équipe ; l'ignorer signifiait soumettre un travail plagié avec mon nom dessus. J'ai choisi de l'aborder directement avec le coéquipier d'abord. J'ai expliqué que le plagiat pourrait entraîner un échec pour toute l'équipe et nuire à notre intégrité professionnelle. J'ai proposé de l'aider à réécrire les sections avec ses propres mots, en citant correctement les sources. Le coéquipier était initialement défensif mais a fini par comprendre la gravité. Nous avons réécrit les sections ensemble et soumis un rapport original. J'ai appris qu'aborder les problèmes éthiques tôt, directement, et avec empathie est presque toujours mieux que les ignorer ou les escalader immédiatement. Le coéquipier m'a ensuite remercié d'avoir géré cela en privé.", tips: ["Choose a real and relatable ethical dilemma", "Show the thought process behind your decision", "Demonstrate that you acted with integrity and empathy"], tipsFr: ["Choisissez un dilemme éthique réel et relatable", "Montrez le processus de réflexion derrière votre décision", "Démontrez que vous avez agi avec intégrité et empathie"] },
	{ id: qid("gen"), question: "What makes you unique as a candidate?", questionFr: "Qu'est-ce qui fait de vous un candidat unique ?", type: "motivation", field: "général", difficulty: "medium", sampleAnswer: "Three things differentiate me: 1) Technical depth with communication skills — many engineers are technically strong but struggle to explain their work to non-technical stakeholders. I invest heavily in presentation and writing skills because I believe the best solution is worthless if you can't communicate it effectively. 2) Multicultural adaptability — growing up in Morocco and being educated at IMTA has given me fluency in French, Arabic, and English, plus the ability to navigate diverse cultural contexts. In today's globalized job market, this is a significant advantage. 3) Entrepreneurial mindset within a corporate context — I don't just complete assigned tasks; I look for opportunities to improve processes, solve adjacent problems, and create value beyond my job description. During my internship, I identified and proposed a solution to a workflow inefficiency that saved 3 hours per week — without being asked. That proactive approach is what I bring to every role.", sampleAnswerFr: "Trois choses me différencient : 1) Profondeur technique avec des compétences en communication — beaucoup d'ingénieurs sont techniquement forts mais peinent à expliquer leur travail aux parties prenantes non-techniques. J'investis beaucoup dans les compétences de présentation et de rédaction car je crois que la meilleure solution est sans valeur si vous ne pouvez pas la communiquer efficacement. 2) Adaptabilité multiculturelle — grandir au Maroc et être formé à l'IMTA m'a donné la maîtrise du français, de l'arabe et de l'anglais, plus la capacité de naviguer dans des contextes culturels divers. Dans le marché de l'emploi mondialisé d'aujourd'hui, c'est un avantage significatif. 3) Mentalité entrepreneuriale dans un contexte corporate — je ne me contente pas de compléter les tâches assignées ; je cherche des opportunités pour améliorer les processus, résoudre des problèmes adjacents, et créer de la valeur au-delà de ma fiche de poste. Pendant mon stage, j'ai identifié et proposé une solution à une inefficacité de workflow qui économisait 3 heures par semaine — sans qu'on me le demande. C'est cette approche proactive que j'apporte à chaque rôle.", tips: ["Pick 2-3 specific differentiators, not generic traits", "Support each with a concrete example or evidence", "Tie your uniqueness to value for the employer"], tipsFr: ["Choisissez 2-3 différenciateurs spécifiques, pas des traits génériques", "Soutenez chacun avec un exemple ou une preuve concrète", "Reliez votre unicité à la valeur pour l'employeur"] },

	// =========================================================================
	// EXPANSION BATCH 4 — Final 30+ questions to reach 300+
	// =========================================================================

	// --- GENIE INDUSTRIEL (additional 6) ---
	{ id: qid("ind"), question: "What is Overall Equipment Effectiveness (OEE)?", questionFr: "Qu'est-ce que le Taux de Rendement Global (TRG/OEE) ?", type: "technical", field: "génie-industriel", difficulty: "medium", sampleAnswer: "OEE (Overall Equipment Effectiveness) measures manufacturing productivity by combining three factors: Availability = (Run Time / Planned Production Time) x 100 — accounts for downtime (breakdowns, changeovers, material shortages). Performance = (Ideal Cycle Time x Total Count / Run Time) x 100 — accounts for speed losses (slow cycles, minor stops). Quality = (Good Count / Total Count) x 100 — accounts for defects and rework. OEE = Availability x Performance x Quality. A world-class OEE is 85% (90% availability x 95% performance x 99.9% quality). Most manufacturing plants achieve 60-65%. To improve OEE: implement TPM (Total Productive Maintenance) to reduce breakdowns, use SMED to reduce changeover times, implement SPC to reduce quality losses, and train operators on autonomous maintenance. In Morocco, Renault Tanger Med achieved OEE above 80% through rigorous TPM and lean manufacturing implementation.", sampleAnswerFr: "Le TRG/OEE (Taux de Rendement Global) mesure la productivité manufacturière en combinant trois facteurs : Disponibilité = (Temps de marche / Temps de production planifié) x 100 — prend en compte les arrêts (pannes, changements de série, manques matière). Performance = (Temps de cycle idéal x Nombre total / Temps de marche) x 100 — prend en compte les pertes de vitesse (cycles lents, micro-arrêts). Qualité = (Nombre de pièces bonnes / Nombre total) x 100 — prend en compte les défauts et retouches. OEE = Disponibilité x Performance x Qualité. Un OEE de classe mondiale est 85% (90% disponibilité x 95% performance x 99,9% qualité). La plupart des usines atteignent 60-65%. Pour améliorer le OEE : implémenter la TPM (Total Productive Maintenance) pour réduire les pannes, utiliser le SMED pour réduire les temps de changement, implémenter le SPC pour réduire les pertes qualité, et former les opérateurs à la maintenance autonome. Au Maroc, Renault Tanger Med a atteint un OEE supérieur à 80% grâce à une implémentation rigoureuse de la TPM et du lean manufacturing.", tips: ["Know the OEE formula with all three components", "Cite the 85% world-class benchmark", "Mention specific improvement levers for each component"], tipsFr: ["Connaissez la formule OEE avec les trois composantes", "Citez le benchmark de 85% de classe mondiale", "Mentionnez des leviers d'amélioration spécifiques pour chaque composante"] },
	{ id: qid("ind"), question: "What is SMED and how do you apply it?", questionFr: "Qu'est-ce que le SMED et comment l'appliquer ?", type: "technical", field: "génie-industriel", difficulty: "hard", sampleAnswer: "SMED (Single Minute Exchange of Die) is a lean methodology to reduce changeover time — the time between the last good part of one product and the first good part of the next. Developed by Shigeo Shingo at Toyota. Steps: 1) Observe and document the current changeover process (video recording recommended). 2) Separate internal operations (must be done while machine is stopped) from external operations (can be done while machine is running). 3) Convert internal to external — pre-heat molds, pre-stage tools, prepare materials during the previous run. 4) Streamline internal operations — use quick-release clamps instead of bolts, standardize tool heights to eliminate adjustments, use locator pins for precise positioning. 5) Streamline external operations — organize tools in kits, use shadow boards, standardize procedures. 6) Practice and document — create standard work instructions, train all operators. Typical results: 40-90% reduction in changeover time. In Morocco's automotive industry (Renault, PSA), SMED is essential for producing multiple car models on the same line without excessive downtime.", sampleAnswerFr: "Le SMED (Single Minute Exchange of Die) est une méthodologie lean pour réduire le temps de changement de série — le temps entre la dernière bonne pièce d'un produit et la première bonne pièce du suivant. Développé par Shigeo Shingo chez Toyota. Étapes : 1) Observer et documenter le processus de changement actuel (enregistrement vidéo recommandé). 2) Séparer les opérations internes (doivent être faites machine arrêtée) des opérations externes (peuvent être faites machine en marche). 3) Convertir l'interne en externe — préchauffer les moules, pré-positionner les outils, préparer les matériaux pendant la production précédente. 4) Rationaliser les opérations internes — utiliser des fixations rapides au lieu de boulons, standardiser les hauteurs d'outils pour éliminer les réglages, utiliser des pions de centrage pour un positionnement précis. 5) Rationaliser les opérations externes — organiser les outils en kits, utiliser des tableaux d'ombres, standardiser les procédures. 6) Pratiquer et documenter — créer des instructions de travail standard, former tous les opérateurs. Résultats typiques : réduction de 40-90% du temps de changement. Dans l'industrie automobile marocaine (Renault, PSA), le SMED est essentiel pour produire plusieurs modèles de voitures sur la même ligne sans temps d'arrêt excessif.", tips: ["Explain the internal vs external operation distinction", "Describe conversion techniques with practical examples", "Cite typical improvement results (40-90% reduction)"], tipsFr: ["Expliquez la distinction entre opérations internes et externes", "Décrivez les techniques de conversion avec des exemples pratiques", "Citez les résultats d'amélioration typiques (réduction de 40-90%)"] },
	{ id: qid("ind"), question: "How would you implement a Kaizen event?", questionFr: "Comment mettriez-vous en oeuvre un événement Kaizen ?", type: "competency", field: "génie-industriel", difficulty: "medium", sampleAnswer: "A Kaizen event (or Kaizen blitz) is a focused, short-term improvement activity lasting 3-5 days. Implementation: Before the event (1-2 weeks): define the problem/scope clearly, collect baseline data (cycle times, defect rates, OEE), select a cross-functional team (5-8 people including operators), and ensure management commitment for resource allocation. Day 1: training on lean tools (5S, value stream mapping, waste identification), observe the current process (go to gemba), and map the current state. Day 2: identify root causes (5 Why, fishbone diagram), brainstorm solutions, and prioritize using effort/impact matrix. Day 3-4: implement solutions immediately (don't wait for approval committees — that's the power of Kaizen), create standard work, and test the changes. Day 5: present results to management, document before/after metrics, and create a 30-day follow-up plan for sustaining improvements. Key success factors: management support, operator involvement (they know the process best), focus on quick wins, and disciplined follow-up.", sampleAnswerFr: "Un événement Kaizen (ou Kaizen blitz) est une activité d'amélioration focalisée de courte durée, durant 3-5 jours. Mise en oeuvre : Avant l'événement (1-2 semaines) : définir le problème/périmètre clairement, collecter les données de base (temps de cycle, taux de défauts, OEE), sélectionner une équipe pluridisciplinaire (5-8 personnes incluant des opérateurs), et assurer l'engagement du management pour l'allocation de ressources. Jour 1 : formation aux outils lean (5S, cartographie de la chaîne de valeur, identification des gaspillages), observer le processus actuel (aller au gemba), et cartographier l'état actuel. Jour 2 : identifier les causes racines (5 Pourquoi, diagramme d'Ishikawa), brainstormer les solutions, et prioriser avec la matrice effort/impact. Jours 3-4 : implémenter les solutions immédiatement (ne pas attendre les comités d'approbation — c'est la puissance du Kaizen), créer le travail standardisé, et tester les changements. Jour 5 : présenter les résultats au management, documenter les métriques avant/après, et créer un plan de suivi à 30 jours pour pérenniser les améliorations. Facteurs clés de succès : soutien du management, implication des opérateurs (ils connaissent le mieux le processus), focus sur les gains rapides, et suivi discipliné.", tips: ["Show the complete 5-day structure with preparation", "Emphasize operator involvement and gemba observation", "Mention the 30-day follow-up for sustainability"], tipsFr: ["Montrez la structure complète sur 5 jours avec la préparation", "Mettez l'accent sur l'implication des opérateurs et l'observation gemba", "Mentionnez le suivi à 30 jours pour la pérennité"] },
	{ id: qid("ind"), question: "What is the Theory of Constraints (TOC)?", questionFr: "Qu'est-ce que la Théorie des Contraintes (TOC) ?", type: "technical", field: "génie-industriel", difficulty: "hard", sampleAnswer: "The Theory of Constraints (Théorie des Contraintes), developed by Eliyahu Goldratt in 'The Goal', states that every system has at least one constraint (bottleneck) that limits its overall throughput. The five focusing steps: 1) Identify the constraint — find the process step with the lowest capacity or highest utilization. Use process mapping and capacity analysis. 2) Exploit the constraint — maximize its output without investment. Ensure it never stops (stagger breaks, buffer before it, prioritize maintenance). 3) Subordinate everything else — all other processes should serve the constraint's pace. Don't produce faster upstream (creates WIP inventory). 4) Elevate the constraint — invest to increase its capacity (add shifts, buy equipment, cross-train operators). 5) Repeat — once the constraint is broken, a new one emerges. Go back to step 1. Key metrics: Throughput (rate of revenue generation), Inventory (money invested in things to sell), Operating Expense (money spent converting inventory to throughput). TOC complements Lean and Six Sigma — Lean eliminates waste, Six Sigma reduces variation, TOC focuses the improvement effort on the constraint.", sampleAnswerFr: "La Théorie des Contraintes (TOC), développée par Eliyahu Goldratt dans 'Le But', affirme que tout système a au moins une contrainte (goulot d'étranglement) qui limite son débit global. Les cinq étapes de focalisation : 1) Identifier la contrainte — trouver l'étape du processus avec la plus faible capacité ou la plus haute utilisation. Utiliser la cartographie des processus et l'analyse de capacité. 2) Exploiter la contrainte — maximiser sa production sans investissement. S'assurer qu'elle ne s'arrête jamais (décaler les pauses, tampon devant, prioriser la maintenance). 3) Subordonner tout le reste — tous les autres processus doivent suivre le rythme de la contrainte. Ne pas produire plus vite en amont (crée du stock d'en-cours). 4) Élever la contrainte — investir pour augmenter sa capacité (ajouter des équipes, acheter des équipements, former des opérateurs polyvalents). 5) Répéter — une fois la contrainte levée, une nouvelle émerge. Retour à l'étape 1. Métriques clés : Throughput (taux de génération de revenu), Inventory (argent investi dans les choses à vendre), Operating Expense (argent dépensé pour convertir l'inventaire en throughput). La TOC complète le Lean et le Six Sigma — le Lean élimine les gaspillages, le Six Sigma réduit la variation, la TOC concentre l'effort d'amélioration sur la contrainte.", tips: ["Explain all five focusing steps with practical examples", "Reference 'The Goal' by Goldratt", "Show how TOC complements Lean and Six Sigma"], tipsFr: ["Expliquez les cinq étapes de focalisation avec des exemples pratiques", "Référencez 'Le But' de Goldratt", "Montrez comment la TOC complète le Lean et le Six Sigma"] },
	{ id: qid("ind"), question: "How do you conduct a root cause analysis?", questionFr: "Comment conduisez-vous une analyse des causes racines ?", type: "competency", field: "génie-industriel", difficulty: "medium", sampleAnswer: "Root cause analysis (RCA) identifies the fundamental cause of a problem rather than just treating symptoms. I use multiple tools depending on complexity: 1) 5 Whys — simple, fast method for straightforward problems. Ask 'why?' iteratively until you reach the root cause (usually 3-5 iterations). Example: Machine stopped -> Why? Overheated -> Why? Coolant pump failed -> Why? Bearing seized -> Why? No preventive maintenance schedule. Root cause: missing PM program. 2) Fishbone diagram (Ishikawa) — for multi-factor problems. Organize potential causes into categories: Man (operator skills, training), Machine (equipment condition, calibration), Method (process parameters, procedures), Material (raw material quality, specifications), Measurement (inspection accuracy, instruments), and Milieu/Environment (temperature, humidity, cleanliness). 3) Fault Tree Analysis (FTA) — for safety-critical or complex failures. Uses Boolean logic (AND/OR gates) to model failure pathways. 4) 8D Report — structured problem-solving methodology used in automotive (required by Renault Morocco for supplier quality issues). Steps: D1-Team, D2-Problem Description, D3-Containment, D4-Root Cause, D5-Corrective Action, D6-Implementation, D7-Prevention, D8-Congratulate Team.", sampleAnswerFr: "L'analyse des causes racines (RCA) identifie la cause fondamentale d'un problème plutôt que de traiter les symptômes. J'utilise plusieurs outils selon la complexité : 1) Les 5 Pourquoi — méthode simple et rapide pour les problèmes directs. Demander 'pourquoi ?' de manière itérative jusqu'à atteindre la cause racine (généralement 3-5 itérations). Exemple : Machine arrêtée -> Pourquoi ? Surchauffe -> Pourquoi ? Pompe de refroidissement en panne -> Pourquoi ? Roulement grippé -> Pourquoi ? Pas de programme de maintenance préventive. Cause racine : programme de MP manquant. 2) Diagramme en arêtes de poisson (Ishikawa) — pour les problèmes multi-facteurs. Organiser les causes potentielles en catégories : Main-d'oeuvre (compétences, formation), Machine (état de l'équipement, calibrage), Méthode (paramètres de processus, procédures), Matière (qualité des matières premières, spécifications), Mesure (précision d'inspection, instruments), et Milieu (température, humidité, propreté). 3) Arbre des défaillances (FTA) — pour les défaillances critiques en sécurité ou complexes. Utilise la logique booléenne (portes ET/OU) pour modéliser les chemins de défaillance. 4) Rapport 8D — méthodologie structurée de résolution de problèmes utilisée dans l'automobile (exigée par Renault Maroc pour les problèmes qualité fournisseur).", tips: ["Show you know multiple RCA tools and when to use each", "Walk through a 5 Why example to demonstrate the technique", "Mention the 8D report for automotive context"], tipsFr: ["Montrez que vous connaissez plusieurs outils RCA et quand utiliser chacun", "Déroulez un exemple de 5 Pourquoi pour démontrer la technique", "Mentionnez le rapport 8D pour le contexte automobile"] },
	{ id: qid("ind"), question: "Why are you drawn to industrial engineering?", questionFr: "Pourquoi êtes-vous attiré par le génie industriel ?", type: "motivation", field: "génie-industriel", difficulty: "easy", sampleAnswer: "Industrial engineering is about making systems work better — producing more with less waste, delivering faster with fewer defects, and creating workplaces that are both efficient and humane. I love that it sits at the intersection of engineering, management, and data science. What attracts me specifically: the tangible impact — walking into a factory and seeing a process you optimized running smoothly, knowing that your improvement saves time, money, and reduces worker fatigue. Morocco's industrialization is creating enormous demand for industrial engineers: Renault's two plants, the growing aerospace sector (Bombardier, Safran), OCP's phosphate modernization, and the emerging automotive supplier ecosystem. I want to bring world-class manufacturing practices to Moroccan industry and help the country compete globally. The lean philosophy resonates with me personally — continuous improvement, respect for people, and eliminating waste are principles that apply to everything in life.", sampleAnswerFr: "Le génie industriel consiste à faire fonctionner les systèmes mieux — produire plus avec moins de gaspillage, livrer plus vite avec moins de défauts, et créer des lieux de travail à la fois efficaces et humains. J'aime qu'il se situe à l'intersection de l'ingénierie, du management et de la science des données. Ce qui m'attire spécifiquement : l'impact tangible — entrer dans une usine et voir un processus que vous avez optimisé fonctionner en douceur, savoir que votre amélioration économise du temps, de l'argent, et réduit la fatigue des travailleurs. L'industrialisation du Maroc crée une demande énorme pour les ingénieurs industriels : les deux usines de Renault, le secteur aéronautique en croissance (Bombardier, Safran), la modernisation des phosphates d'OCP, et l'écosystème émergent d'équipementiers automobiles. Je veux apporter des pratiques de fabrication de classe mondiale à l'industrie marocaine et aider le pays à être compétitif mondialement. La philosophie lean résonne avec moi personnellement — l'amélioration continue, le respect des personnes, et l'élimination du gaspillage sont des principes qui s'appliquent à tout dans la vie.", tips: ["Show passion for optimization and tangible impact", "Reference Morocco's growing industrial sectors", "Connect lean philosophy to personal values"], tipsFr: ["Montrez votre passion pour l'optimisation et l'impact tangible", "Référencez les secteurs industriels en croissance du Maroc", "Connectez la philosophie lean à vos valeurs personnelles"] },

	// --- INFORMATIQUE (additional 6) ---
	{ id: qid("info"), question: "What is the SOLID principle in software engineering?", questionFr: "Qu'est-ce que le principe SOLID en génie logiciel ?", type: "technical", field: "génie-informatique", difficulty: "medium", sampleAnswer: "SOLID is an acronym for five object-oriented design principles that make software more maintainable, flexible, and scalable: S — Single Responsibility Principle: a class should have only one reason to change. Each class handles one concern. O — Open/Closed Principle: software entities should be open for extension but closed for modification. Use interfaces and inheritance to add behavior without changing existing code. L — Liskov Substitution Principle: objects of a superclass should be replaceable with objects of its subclasses without breaking the application. If it looks like a duck but needs batteries, you probably have the wrong abstraction. I — Interface Segregation Principle: clients should not be forced to depend on interfaces they don't use. Many specific interfaces are better than one general-purpose interface. D — Dependency Inversion Principle: high-level modules should not depend on low-level modules; both should depend on abstractions. Inject dependencies rather than creating them internally. Applying SOLID: smaller, focused classes with clear responsibilities, code that's easy to test (each class testable in isolation), and systems that can evolve without cascading changes.", sampleAnswerFr: "SOLID est un acronyme pour cinq principes de conception orientée objet qui rendent le logiciel plus maintenable, flexible et évolutif : S — Principe de Responsabilité Unique : une classe ne devrait avoir qu'une seule raison de changer. Chaque classe gère une seule préoccupation. O — Principe Ouvert/Fermé : les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification. Utiliser les interfaces et l'héritage pour ajouter du comportement sans changer le code existant. L — Principe de Substitution de Liskov : les objets d'une superclasse doivent être remplaçables par des objets de ses sous-classes sans casser l'application. I — Principe de Ségrégation des Interfaces : les clients ne devraient pas être forcés de dépendre d'interfaces qu'ils n'utilisent pas. Plusieurs interfaces spécifiques sont meilleures qu'une interface généraliste. D — Principe d'Inversion des Dépendances : les modules de haut niveau ne doivent pas dépendre des modules de bas niveau ; les deux doivent dépendre d'abstractions. Injecter les dépendances plutôt que de les créer en interne. Appliquer SOLID : des classes plus petites et focalisées avec des responsabilités claires, du code facile à tester (chaque classe testable en isolation), et des systèmes qui évoluent sans changements en cascade.", tips: ["Explain each letter with a clear, practical example", "Show how SOLID leads to testable and maintainable code", "Mention that SOLID applies to TypeScript/JavaScript too, not just Java"], tipsFr: ["Expliquez chaque lettre avec un exemple clair et pratique", "Montrez comment SOLID mène à du code testable et maintenable", "Mentionnez que SOLID s'applique aussi à TypeScript/JavaScript, pas qu'à Java"] },
	{ id: qid("info"), question: "What is the difference between SQL and NoSQL databases?", questionFr: "Quelle est la différence entre les bases de données SQL et NoSQL ?", type: "technical", field: "génie-informatique", difficulty: "easy", sampleAnswer: "SQL (relational) databases store data in structured tables with predefined schemas, use SQL for querying, and enforce ACID properties (Atomicity, Consistency, Isolation, Durability). Examples: PostgreSQL, MySQL, Oracle. Best for: structured data with complex relationships, transactions requiring strong consistency (banking, ERP), and data integrity enforcement. NoSQL databases use flexible schemas and are designed for specific data models. Four types: Document stores (MongoDB — JSON-like documents, great for content management), Key-value stores (Redis — in-memory, fastest for caching and sessions), Column-family (Cassandra — distributed, massive write throughput), and Graph databases (Neo4j — relationship-heavy data like social networks). NoSQL offers: horizontal scalability, flexible schemas, high performance for specific patterns. Trade-offs: eventual consistency (CAP theorem), less mature tooling, no standard query language. Choice depends on: data structure, consistency requirements, scale needs, and query patterns. Many modern applications use both (polyglot persistence) — PostgreSQL for transactional data and Redis for caching.", sampleAnswerFr: "Les bases de données SQL (relationnelles) stockent les données dans des tables structurées avec des schémas prédéfinis, utilisent SQL pour les requêtes, et appliquent les propriétés ACID (Atomicité, Cohérence, Isolation, Durabilité). Exemples : PostgreSQL, MySQL, Oracle. Idéales pour : les données structurées avec des relations complexes, les transactions nécessitant une forte cohérence (banque, ERP), et l'application de l'intégrité des données. Les bases NoSQL utilisent des schémas flexibles et sont conçues pour des modèles de données spécifiques. Quatre types : Bases documentaires (MongoDB — documents JSON, idéales pour la gestion de contenu), Clé-valeur (Redis — en mémoire, les plus rapides pour le cache et les sessions), Colonnes (Cassandra — distribuées, débit d'écriture massif), et Graphes (Neo4j — données riches en relations comme les réseaux sociaux). Le NoSQL offre : scalabilité horizontale, schémas flexibles, haute performance pour des patterns spécifiques. Compromis : cohérence éventuelle (théorème CAP), outillage moins mature, pas de langage de requête standard. Le choix dépend de : la structure des données, les exigences de cohérence, les besoins d'échelle, et les patterns de requêtes. Beaucoup d'applications modernes utilisent les deux (persistance polyglotte) — PostgreSQL pour les données transactionnelles et Redis pour le cache.", tips: ["Compare along key dimensions: schema, consistency, scalability", "Name the four types of NoSQL with specific examples", "Mention polyglot persistence as a modern best practice"], tipsFr: ["Comparez selon les dimensions clés : schéma, cohérence, scalabilité", "Nommez les quatre types de NoSQL avec des exemples spécifiques", "Mentionnez la persistance polyglotte comme bonne pratique moderne"] },
	{ id: qid("info"), question: "How do you ensure application security?", questionFr: "Comment assurez-vous la sécurité d'une application ?", type: "competency", field: "génie-informatique", difficulty: "hard", sampleAnswer: "Application security requires defense in depth — multiple layers of protection: 1) Input validation — sanitize all user inputs to prevent injection attacks (SQL injection, XSS, command injection). Use parameterized queries, never string concatenation for SQL. 2) Authentication and authorization — implement strong password policies, multi-factor authentication (MFA), JWT with short expiration and refresh tokens, role-based access control (RBAC). 3) Data protection — encrypt sensitive data at rest (AES-256) and in transit (TLS 1.3), hash passwords with bcrypt/Argon2 (never MD5/SHA1), and implement proper key management. 4) Session management — secure cookies (HttpOnly, Secure, SameSite flags), session timeout, and CSRF protection. 5) API security — rate limiting, request size limits, API key management, and CORS configuration. 6) Dependency management — regularly scan for vulnerabilities (npm audit, Snyk), keep dependencies updated. 7) Security testing — SAST (static analysis), DAST (dynamic testing), and penetration testing. 8) Logging and monitoring — log security events, implement intrusion detection, and create incident response procedures. Follow OWASP Top 10 as a checklist. In Morocco, comply with Loi 09-08 on personal data protection.", sampleAnswerFr: "La sécurité applicative nécessite une défense en profondeur — plusieurs couches de protection : 1) Validation des entrées — assainir toutes les entrées utilisateur pour prévenir les attaques par injection (injection SQL, XSS, injection de commandes). Utiliser des requêtes paramétrées, jamais la concaténation de chaînes pour le SQL. 2) Authentification et autorisation — implémenter des politiques de mots de passe forts, l'authentification multi-facteur (MFA), JWT avec expiration courte et tokens de rafraîchissement, contrôle d'accès basé sur les rôles (RBAC). 3) Protection des données — chiffrer les données sensibles au repos (AES-256) et en transit (TLS 1.3), hasher les mots de passe avec bcrypt/Argon2 (jamais MD5/SHA1), et implémenter une gestion des clés appropriée. 4) Gestion de session — cookies sécurisés (flags HttpOnly, Secure, SameSite), timeout de session, et protection CSRF. 5) Sécurité API — limitation de taux, limites de taille des requêtes, gestion des clés API, et configuration CORS. 6) Gestion des dépendances — scanner régulièrement les vulnérabilités (npm audit, Snyk), maintenir les dépendances à jour. 7) Tests de sécurité — SAST (analyse statique), DAST (tests dynamiques), et tests de pénétration. 8) Journalisation et surveillance — journaliser les événements de sécurité, implémenter la détection d'intrusion, et créer des procédures de réponse aux incidents. Suivre l'OWASP Top 10 comme checklist. Au Maroc, se conformer à la Loi 09-08 sur la protection des données personnelles.", tips: ["Cover multiple security layers, not just one area", "Reference OWASP Top 10 as the industry standard checklist", "Mention Morocco's Loi 09-08 data protection law"], tipsFr: ["Couvrez plusieurs couches de sécurité, pas un seul domaine", "Référencez l'OWASP Top 10 comme checklist standard de l'industrie", "Mentionnez la Loi 09-08 marocaine sur la protection des données"] },
	{ id: qid("info"), question: "What is CI/CD and how do you implement it?", questionFr: "Qu'est-ce que le CI/CD et comment l'implémenter ?", type: "technical", field: "génie-informatique", difficulty: "medium", sampleAnswer: "CI/CD (Continuous Integration / Continuous Deployment) automates the software delivery pipeline. CI (Continuous Integration): developers frequently merge code changes into a shared repository (multiple times per day). Each merge triggers an automated build and test suite. Benefits: catch bugs early, reduce integration conflicts, maintain code quality. Implementation: use Git with branch protection rules, configure automated builds (GitHub Actions, GitLab CI, Jenkins), run unit tests, linting (ESLint/Biome), and type checking (TypeScript) on every push. CD (Continuous Deployment/Delivery): automatically deploy code that passes all tests to staging or production. Implementation: automated staging deployment on merge to main, automated production deployment (or manual approval gate for Continuous Delivery), environment-specific configuration management, database migration automation, rollback procedures for failed deployments. Key practices: keep builds fast (<10 minutes), maintain comprehensive test coverage (>80%), use feature flags for gradual rollouts, and monitor production deployments. Tools: GitHub Actions (most popular), Docker for containerization, and Vercel/Railway for deployment.", sampleAnswerFr: "Le CI/CD (Intégration Continue / Déploiement Continu) automatise le pipeline de livraison logicielle. CI (Intégration Continue) : les développeurs fusionnent fréquemment les changements de code dans un dépôt partagé (plusieurs fois par jour). Chaque fusion déclenche un build automatisé et une suite de tests. Avantages : détecter les bugs tôt, réduire les conflits d'intégration, maintenir la qualité du code. Implémentation : utiliser Git avec des règles de protection de branches, configurer des builds automatisés (GitHub Actions, GitLab CI, Jenkins), exécuter les tests unitaires, le linting (ESLint/Biome), et la vérification de types (TypeScript) à chaque push. CD (Déploiement/Livraison Continue) : déployer automatiquement le code qui passe tous les tests vers le staging ou la production. Implémentation : déploiement staging automatique à la fusion vers main, déploiement production automatique (ou porte d'approbation manuelle pour la Livraison Continue), gestion de configuration spécifique à l'environnement, automatisation des migrations de base de données, procédures de rollback pour les déploiements échoués. Pratiques clés : garder les builds rapides (<10 minutes), maintenir une couverture de tests complète (>80%), utiliser des feature flags pour les rollouts graduels, et surveiller les déploiements en production. Outils : GitHub Actions (le plus populaire), Docker pour la conteneurisation, et Vercel/Railway pour le déploiement.", tips: ["Distinguish clearly between CI and CD", "Mention specific tools for each pipeline stage", "Emphasize build speed and test coverage as key metrics"], tipsFr: ["Distinguez clairement entre CI et CD", "Mentionnez des outils spécifiques pour chaque étape du pipeline", "Mettez l'accent sur la vitesse de build et la couverture de tests comme métriques clés"] },
	{ id: qid("info"), question: "Explain the concept of microservices architecture.", questionFr: "Expliquez le concept de l'architecture microservices.", type: "technical", field: "génie-informatique", difficulty: "hard", sampleAnswer: "Microservices architecture decomposes an application into small, independent services that each handle a specific business capability. Each service: runs in its own process, communicates via APIs (REST, gRPC, or message queues), has its own database (database per service), can be developed, deployed, and scaled independently, and is owned by a small team. Comparison with monolith: monolith is simpler to develop and deploy initially but becomes hard to scale and maintain as it grows. Microservices add operational complexity but enable team autonomy, independent scaling, and technology diversity. Key components: API Gateway (routes requests, handles auth), Service Discovery (Consul, Kubernetes DNS), Message Broker (RabbitMQ, Kafka for async communication), and Container Orchestration (Kubernetes, Docker Swarm). Challenges: distributed tracing (Jaeger, Zipkin), data consistency across services (Saga pattern), service-to-service authentication, and increased operational complexity. Best practice: start with a monolith and extract microservices as the application grows and team scales. Don't start with microservices for a small team.", sampleAnswerFr: "L'architecture microservices décompose une application en petits services indépendants qui gèrent chacun une capacité métier spécifique. Chaque service : s'exécute dans son propre processus, communique via des APIs (REST, gRPC, ou files de messages), a sa propre base de données (base de données par service), peut être développé, déployé et mis à l'échelle indépendamment, et est possédé par une petite équipe. Comparaison avec le monolithe : le monolithe est plus simple à développer et déployer initialement mais devient difficile à mettre à l'échelle et maintenir en grandissant. Les microservices ajoutent de la complexité opérationnelle mais permettent l'autonomie des équipes, la mise à l'échelle indépendante, et la diversité technologique. Composants clés : API Gateway (route les requêtes, gère l'auth), Découverte de Services (Consul, Kubernetes DNS), Message Broker (RabbitMQ, Kafka pour la communication asynchrone), et Orchestration de Conteneurs (Kubernetes, Docker Swarm). Défis : traçage distribué (Jaeger, Zipkin), cohérence des données entre services (pattern Saga), authentification service-à-service, et complexité opérationnelle accrue. Bonne pratique : commencer avec un monolithe et extraire des microservices au fur et à mesure que l'application grandit et l'équipe s'agrandit. Ne pas commencer avec des microservices pour une petite équipe.", tips: ["Explain when microservices are appropriate vs overkill", "Mention key infrastructure components (API Gateway, message broker)", "Advise starting with a monolith and extracting over time"], tipsFr: ["Expliquez quand les microservices sont appropriés vs excessifs", "Mentionnez les composants d'infrastructure clés (API Gateway, message broker)", "Conseillez de commencer avec un monolithe et d'extraire au fil du temps"] },
	{ id: qid("info"), question: "What excites you about software engineering?", questionFr: "Qu'est-ce qui vous enthousiasme dans l'ingénierie logicielle ?", type: "motivation", field: "génie-informatique", difficulty: "easy", sampleAnswer: "Software engineering excites me because it's the most leveraged form of creation. With a laptop and an internet connection, I can build products that reach millions of users. No factory, no raw materials, no physical supply chain — just ideas turned into reality through code. What specifically drives me: 1) The creative problem-solving — every feature is a puzzle combining user needs, technical constraints, and business goals. 2) The rapid feedback loop — write code, see results in seconds. In few other engineering disciplines can you iterate so quickly. 3) The constant evolution — the field changes so fast that there's always something new to learn. TypeScript, React, cloud computing, AI/ML — the tools keep getting better. 4) The global impact — software I write in Morocco can be used by people around the world instantly. Morocco's tech scene is growing rapidly: Casablanca is becoming a tech hub, remote work enables Moroccan developers to work with global companies, and the startup ecosystem is thriving (UM6P, Startup Morocco). I want to be part of this growth.", sampleAnswerFr: "L'ingénierie logicielle m'enthousiasme car c'est la forme de création la plus levier. Avec un ordinateur portable et une connexion internet, je peux construire des produits qui atteignent des millions d'utilisateurs. Pas d'usine, pas de matières premières, pas de chaîne d'approvisionnement physique — juste des idées transformées en réalité par le code. Ce qui me motive spécifiquement : 1) La résolution créative de problèmes — chaque fonctionnalité est un puzzle combinant besoins utilisateurs, contraintes techniques et objectifs business. 2) La boucle de feedback rapide — écrire du code, voir les résultats en secondes. Dans peu d'autres disciplines d'ingénierie on peut itérer aussi rapidement. 3) L'évolution constante — le domaine change si vite qu'il y a toujours quelque chose de nouveau à apprendre. TypeScript, React, cloud computing, IA/ML — les outils ne cessent de s'améliorer. 4) L'impact global — le logiciel que j'écris au Maroc peut être utilisé par des gens dans le monde entier instantanément. La scène tech du Maroc croît rapidement : Casablanca devient un hub tech, le travail à distance permet aux développeurs marocains de travailler avec des entreprises mondiales, et l'écosystème startup prospère (UM6P, Startup Morocco). Je veux faire partie de cette croissance.", tips: ["Show genuine passion beyond just technical skills", "Mention the leverage and global reach of software", "Reference Morocco's growing tech ecosystem"], tipsFr: ["Montrez une passion sincère au-delà des compétences techniques", "Mentionnez le levier et la portée mondiale du logiciel", "Référencez l'écosystème tech croissant du Maroc"] },

	// --- Additional cross-field general to boost general count and balance types ---
	{ id: qid("gen"), question: "How do you prioritize when everything seems urgent?", questionFr: "Comment priorisez-vous quand tout semble urgent ?", type: "situational", field: "général", difficulty: "hard", sampleAnswer: "When everything feels urgent, the key is to step back and assess objectively rather than reacting to the loudest voice. My framework: 1) List all tasks and deadlines. 2) Apply the Eisenhower matrix: Urgent + Important = do now; Important + Not Urgent = schedule; Urgent + Not Important = delegate; Neither = eliminate. 3) Assess true impact — which task, if not done, causes the most damage? That's your real priority. 4) Communicate — talk to stakeholders about their actual deadlines vs desired timelines. Often, 'urgent' means 'I'd like it soon' not 'the building is on fire.' 5) Time-box — allocate specific time blocks to top priorities, protecting them from interruptions. 6) Accept trade-offs — you cannot do everything perfectly. Some things will be good enough, and that's acceptable. 7) Ask for help — escalate to your manager if the workload is genuinely unsustainable. The worst approach is to multitask everything — you'll deliver nothing well. Focus on one thing at a time.", sampleAnswerFr: "Quand tout semble urgent, la clé est de prendre du recul et d'évaluer objectivement plutôt que de réagir à la voix la plus forte. Mon cadre : 1) Lister toutes les tâches et les délais. 2) Appliquer la matrice d'Eisenhower : Urgent + Important = faire maintenant ; Important + Non Urgent = planifier ; Urgent + Non Important = déléguer ; Ni l'un ni l'autre = éliminer. 3) Évaluer l'impact réel — quelle tâche, si non faite, cause le plus de dommages ? C'est votre vraie priorité. 4) Communiquer — parler aux parties prenantes de leurs vrais délais vs les délais souhaités. Souvent, 'urgent' signifie 'je l'aimerais bientôt' pas 'le bâtiment est en feu.' 5) Time-boxer — allouer des blocs de temps spécifiques aux priorités principales, les protégeant des interruptions. 6) Accepter les compromis — vous ne pouvez pas tout faire parfaitement. Certaines choses seront assez bonnes, et c'est acceptable. 7) Demander de l'aide — escalader à votre manager si la charge de travail est véritablement insoutenable. La pire approche est de tout multi-tasker — vous ne livrerez rien de bien. Se concentrer sur une chose à la fois.", tips: ["Use the Eisenhower matrix as your primary framework", "Emphasize communication with stakeholders about real vs perceived urgency", "Show that asking for help is a mature strategy"], tipsFr: ["Utilisez la matrice d'Eisenhower comme cadre principal", "Mettez l'accent sur la communication avec les parties prenantes sur l'urgence réelle vs perçue", "Montrez que demander de l'aide est une stratégie mature"] },
	{ id: qid("gen"), question: "Tell me about a project you are proud of.", questionFr: "Parlez-moi d'un projet dont vous êtes fier.", type: "behavioral", field: "général", difficulty: "medium", sampleAnswer: "During my final year at IMTA, I led a team of four on a capstone project to design and prototype a solution for [specific industry problem relevant to your field]. What made me proud: 1) The process — I organized the team using agile sprints, held weekly reviews, and ensured everyone contributed equally. When one team member fell behind due to personal issues, I redistributed tasks and provided extra support rather than complaining. 2) The technical achievement — we went beyond the minimum requirements and implemented features that the professors said added real practical value. 3) The presentation — we prepared a professional-quality presentation and demo that earned the highest grade in our cohort. What I learned: leadership is not about being the smartest person — it's about creating conditions for others to do their best work. The project also taught me that planning upfront saves time overall, even when it feels like it slows you down initially.", sampleAnswerFr: "Pendant ma dernière année à l'IMTA, j'ai dirigé une équipe de quatre sur un projet de fin d'études pour concevoir et prototyper une solution pour [un problème industriel spécifique pertinent pour votre domaine]. Ce qui m'a rendu fier : 1) Le processus — j'ai organisé l'équipe en sprints agiles, tenu des revues hebdomadaires, et assuré que chacun contribue également. Quand un membre de l'équipe a pris du retard à cause de problèmes personnels, j'ai redistribué les tâches et fourni un soutien supplémentaire plutôt que de me plaindre. 2) La réalisation technique — nous sommes allés au-delà des exigences minimales et implémenté des fonctionnalités que les professeurs ont dit ajouter une vraie valeur pratique. 3) La présentation — nous avons préparé une présentation et une démo de qualité professionnelle qui ont obtenu la meilleure note de notre promotion. Ce que j'ai appris : le leadership n'est pas être la personne la plus intelligente — c'est créer les conditions pour que les autres fassent leur meilleur travail. Le projet m'a aussi appris que planifier en amont économise du temps au total, même quand on a l'impression que ça nous ralentit au départ.", tips: ["Choose a project with both technical and leadership dimensions", "Use the STAR format: Situation, Task, Action, Result", "End with what you learned, not just what you achieved"], tipsFr: ["Choisissez un projet avec des dimensions techniques et de leadership", "Utilisez le format STAR : Situation, Tâche, Action, Résultat", "Terminez par ce que vous avez appris, pas seulement ce que vous avez accompli"] },
	{ id: qid("gen"), question: "How do you approach learning a completely new skill?", questionFr: "Comment abordez-vous l'apprentissage d'une compétence complètement nouvelle ?", type: "behavioral", field: "général", difficulty: "easy", sampleAnswer: "I follow a structured learning approach: 1) Understand the big picture first — before diving into details, I research what the skill involves, why it matters, and how it connects to what I already know. This creates a mental framework for organizing new information. 2) Find quality resources — I prefer a combination of structured courses (Coursera, YouTube tutorials) for foundational knowledge and documentation/books for depth. I also identify practitioners I can learn from (colleagues, online communities). 3) Learn by doing — I apply new knowledge immediately through small projects or exercises. Theory without practice doesn't stick. 4) Teach others — explaining a concept to someone else reveals gaps in my understanding. I write notes or short summaries to solidify learning. 5) Set milestones — break the learning into stages with measurable checkpoints (e.g., 'Week 1: build a basic app, Week 2: add authentication'). 6) Accept the discomfort — being a beginner feels uncomfortable. I remind myself that every expert was once a beginner and that the learning curve always flattens with consistent effort.", sampleAnswerFr: "Je suis une approche d'apprentissage structurée : 1) Comprendre la vue d'ensemble d'abord — avant de plonger dans les détails, je recherche ce que la compétence implique, pourquoi elle compte, et comment elle se connecte à ce que je connais déjà. Cela crée un cadre mental pour organiser les nouvelles informations. 2) Trouver des ressources de qualité — je préfère une combinaison de cours structurés (Coursera, tutoriels YouTube) pour les connaissances fondamentales et la documentation/livres pour la profondeur. J'identifie aussi des praticiens dont je peux apprendre (collègues, communautés en ligne). 3) Apprendre en faisant — j'applique les nouvelles connaissances immédiatement à travers de petits projets ou exercices. La théorie sans pratique ne reste pas. 4) Enseigner aux autres — expliquer un concept à quelqu'un d'autre révèle les lacunes dans ma compréhension. J'écris des notes ou de courts résumés pour solidifier l'apprentissage. 5) Fixer des jalons — découper l'apprentissage en étapes avec des checkpoints mesurables (ex : 'Semaine 1 : construire une app basique, Semaine 2 : ajouter l'authentification'). 6) Accepter l'inconfort — être débutant est inconfortable. Je me rappelle que chaque expert a été un jour débutant et que la courbe d'apprentissage s'aplatit toujours avec un effort constant.", tips: ["Show a structured, multi-step learning methodology", "Emphasize hands-on practice as essential", "Mention teaching others as a learning technique"], tipsFr: ["Montrez une méthodologie d'apprentissage structurée en plusieurs étapes", "Mettez l'accent sur la pratique concrète comme essentielle", "Mentionnez l'enseignement aux autres comme technique d'apprentissage"] },
	{ id: qid("gen"), question: "What is your biggest professional weakness and how are you addressing it?", questionFr: "Quelle est votre plus grande faiblesse professionnelle et comment y remédiez-vous ?", type: "behavioral", field: "général", difficulty: "hard", sampleAnswer: "My biggest weakness is that I sometimes spend too much time perfecting details when 'good enough' would suffice. This perfectionism comes from genuinely caring about quality, but I've learned it can delay delivery and frustrate teammates who are ready to move on. How I'm addressing it: 1) I now ask myself 'What is the minimum quality needed for this deliverable?' before starting. A quick internal email doesn't need the same polish as a client presentation. 2) I set time limits for tasks — if I've spent 80% of the allocated time achieving 90% of the quality, I stop and move on. The last 10% of perfection often takes 50% of the effort. 3) I actively practice the 'MVP mindset' — deliver a working version first, then iterate based on feedback rather than trying to deliver perfection on the first attempt. 4) I ask teammates for feedback on when my attention to detail adds value vs when it causes unnecessary delay. This is a genuine weakness I'm aware of and actively working on.", sampleAnswerFr: "Ma plus grande faiblesse est que je passe parfois trop de temps à perfectionner les détails quand 'assez bien' suffirait. Ce perfectionnisme vient d'un souci sincère de la qualité, mais j'ai appris qu'il peut retarder la livraison et frustrer les coéquipiers prêts à avancer. Comment j'y remédie : 1) Je me demande maintenant 'Quel est le niveau de qualité minimum nécessaire pour ce livrable ?' avant de commencer. Un email interne rapide n'a pas besoin du même peaufinage qu'une présentation client. 2) Je fixe des limites de temps pour les tâches — si j'ai passé 80% du temps alloué pour atteindre 90% de la qualité, je m'arrête et avance. Les derniers 10% de perfection prennent souvent 50% de l'effort. 3) Je pratique activement le 'mindset MVP' — livrer une version fonctionnelle d'abord, puis itérer sur la base du feedback plutôt que d'essayer de livrer la perfection au premier essai. 4) Je demande du feedback aux coéquipiers sur quand mon attention au détail ajoute de la valeur vs quand elle cause un retard inutile. C'est une vraie faiblesse dont je suis conscient et sur laquelle je travaille activement.", tips: ["Choose a real weakness, not a disguised strength", "Show specific actions you're taking to improve", "Demonstrate self-awareness and growth mindset"], tipsFr: ["Choisissez une vraie faiblesse, pas une force déguisée", "Montrez les actions spécifiques que vous prenez pour vous améliorer", "Démontrez de la conscience de soi et un état d'esprit de croissance"] },
	{ id: qid("gen"), question: "Why should we hire you over other candidates?", questionFr: "Pourquoi devrions-nous vous embaucher plutôt que d'autres candidats ?", type: "motivation", field: "général", difficulty: "hard", sampleAnswer: "I can't speak about other candidates since I don't know them, but I can speak about what I bring: 1) The right technical foundation — my IMTA education has given me strong engineering fundamentals combined with practical project experience. I don't just know theory; I've applied it. 2) The right attitude — I'm genuinely eager to learn, willing to start at the bottom and work my way up, and I take ownership of my work. When something goes wrong, I look for solutions, not someone to blame. 3) Cultural fit — I've researched your company and I believe my values align with your culture. I want to contribute to a team, not just collect a salary. 4) Long-term commitment — I'm looking for a company where I can grow over years, not just a stepping stone. Hiring and training is expensive; I want to make your investment worthwhile by becoming a valuable, long-term team member. Most importantly, I bring enthusiasm, humility, and a willingness to work hard. Those qualities, combined with solid technical skills, create the foundation for a productive career.", sampleAnswerFr: "Je ne peux pas parler des autres candidats car je ne les connais pas, mais je peux parler de ce que j'apporte : 1) La bonne base technique — ma formation IMTA m'a donné des fondamentaux d'ingénierie solides combinés à une expérience pratique de projets. Je ne connais pas que la théorie ; je l'ai appliquée. 2) La bonne attitude — je suis sincèrement désireux d'apprendre, prêt à commencer en bas et à progresser, et je prends la responsabilité de mon travail. Quand quelque chose va mal, je cherche des solutions, pas quelqu'un à blâmer. 3) Le fit culturel — j'ai recherché votre entreprise et je crois que mes valeurs s'alignent avec votre culture. Je veux contribuer à une équipe, pas juste toucher un salaire. 4) L'engagement long terme — je cherche une entreprise où je peux évoluer sur des années, pas juste un tremplin. Le recrutement et la formation coûtent cher ; je veux rentabiliser votre investissement en devenant un membre d'équipe précieux et durable. Plus important encore, j'apporte de l'enthousiasme, de l'humilité, et une volonté de travailler dur. Ces qualités, combinées à des compétences techniques solides, créent la base d'une carrière productive.", tips: ["Never disparage other candidates", "Focus on what you uniquely bring, with evidence", "Express long-term commitment and genuine enthusiasm"], tipsFr: ["Ne dénigrez jamais les autres candidats", "Concentrez-vous sur ce que vous apportez de unique, avec des preuves", "Exprimez un engagement long terme et un enthousiasme sincère"] },
	{ id: qid("gen"), question: "What is your approach to continuous improvement?", questionFr: "Quelle est votre approche de l'amélioration continue ?", type: "competency", field: "général", difficulty: "medium", sampleAnswer: "I apply the PDCA (Plan-Do-Check-Act) cycle to everything: Plan — identify what needs improvement, set a measurable goal, research best practices, and design a solution. Do — implement the change on a small scale first (pilot). Check — measure results against the goal, collect feedback, and analyze what worked and what didn't. Act — if successful, standardize the improvement and apply it broadly; if not, learn from the failure and try a different approach. Specific practices: 1) After-action reviews — after every project or significant task, I spend 15 minutes reflecting: what went well, what didn't, what will I do differently? 2) Feedback seeking — I regularly ask colleagues and managers for constructive feedback on my work. 3) Benchmarking — I compare my methods against industry best practices and adopt what works. 4) Learning investment — I dedicate time weekly to learning new tools, techniques, or concepts. 5) Documentation — I maintain personal playbooks of lessons learned so I don't repeat mistakes. The Japanese concept of Kaizen — small, daily improvements — resonates deeply with me. Excellence isn't an act; it's a habit.", sampleAnswerFr: "J'applique le cycle PDCA (Plan-Do-Check-Act) à tout : Planifier — identifier ce qui doit être amélioré, fixer un objectif mesurable, rechercher les bonnes pratiques, et concevoir une solution. Faire — implémenter le changement à petite échelle d'abord (pilote). Vérifier — mesurer les résultats par rapport à l'objectif, collecter le feedback, et analyser ce qui a fonctionné et ce qui n'a pas fonctionné. Agir — si réussi, standardiser l'amélioration et l'appliquer largement ; sinon, apprendre de l'échec et essayer une approche différente. Pratiques spécifiques : 1) Revues post-action — après chaque projet ou tâche significative, je passe 15 minutes à réfléchir : qu'est-ce qui s'est bien passé, qu'est-ce qui ne s'est pas bien passé, que ferai-je différemment ? 2) Recherche de feedback — je demande régulièrement aux collègues et managers un feedback constructif sur mon travail. 3) Benchmarking — je compare mes méthodes aux bonnes pratiques de l'industrie et adopte ce qui fonctionne. 4) Investissement dans l'apprentissage — je consacre du temps chaque semaine à apprendre de nouveaux outils, techniques ou concepts. 5) Documentation — je maintiens des playbooks personnels de leçons apprises pour ne pas répéter les erreurs. Le concept japonais de Kaizen — petites améliorations quotidiennes — résonne profondément en moi. L'excellence n'est pas un acte ; c'est une habitude.", tips: ["Reference the PDCA cycle as your framework", "Give concrete examples of how you practice continuous improvement", "Connect to the Kaizen philosophy"], tipsFr: ["Référencez le cycle PDCA comme cadre", "Donnez des exemples concrets de comment vous pratiquez l'amélioration continue", "Connectez à la philosophie Kaizen"] },
	{ id: qid("gen"), question: "Describe a situation where you had to adapt to a major change.", questionFr: "Décrivez une situation où vous avez dû vous adapter à un changement majeur.", type: "behavioral", field: "général", difficulty: "medium", sampleAnswer: "When COVID-19 hit during my studies at IMTA, everything changed overnight. Classes moved online, group projects had to be coordinated remotely, and the uncertainty was overwhelming. How I adapted: 1) Embraced the new tools — quickly learned Zoom, Microsoft Teams, Google Docs for collaboration, and established clear communication protocols with my project teams (daily standups, shared task boards). 2) Created structure — with no physical separation between study and personal life, I created a strict daily schedule with defined work hours, breaks, and boundaries. 3) Helped others adapt — I organized study groups via video call and shared tips with classmates who were struggling with the transition. 4) Found opportunity in adversity — I used the extra time (no commuting) to learn new technical skills through online courses. What I learned: adaptability isn't about liking change — it's about responding effectively despite discomfort. The pandemic taught me that I can be productive in any environment if I'm disciplined and proactive about creating the right conditions.", sampleAnswerFr: "Quand le COVID-19 a frappé pendant mes études à l'IMTA, tout a changé du jour au lendemain. Les cours sont passés en ligne, les projets de groupe devaient être coordonnés à distance, et l'incertitude était accablante. Comment je me suis adapté : 1) J'ai adopté les nouveaux outils — appris rapidement Zoom, Microsoft Teams, Google Docs pour la collaboration, et établi des protocoles de communication clairs avec mes équipes de projet (standups quotidiens, tableaux de tâches partagés). 2) J'ai créé de la structure — sans séparation physique entre études et vie personnelle, j'ai créé un emploi du temps quotidien strict avec des heures de travail définies, des pauses, et des limites. 3) J'ai aidé les autres à s'adapter — j'ai organisé des groupes d'étude par visioconférence et partagé des conseils avec les camarades qui avaient du mal avec la transition. 4) J'ai trouvé une opportunité dans l'adversité — j'ai utilisé le temps supplémentaire (pas de trajet) pour apprendre de nouvelles compétences techniques via des cours en ligne. Ce que j'ai appris : l'adaptabilité n'est pas aimer le changement — c'est répondre efficacement malgré l'inconfort. La pandémie m'a appris que je peux être productif dans tout environnement si je suis discipliné et proactif dans la création des bonnes conditions.", tips: ["Choose a relatable major change (COVID is universally understood)", "Show specific actions you took, not just feelings", "Highlight how you helped others and found opportunity"], tipsFr: ["Choisissez un changement majeur relatable (le COVID est universellement compris)", "Montrez les actions spécifiques que vous avez prises, pas seulement les sentiments", "Mettez en avant comment vous avez aidé les autres et trouvé une opportunité"] },

	// --- Final 10 questions to reach 302 ---
	{ id: qid("gen"), question: "How do you build trust with a new team?", questionFr: "Comment construisez-vous la confiance avec une nouvelle equipe ?", type: "behavioral", field: "général", difficulty: "medium", sampleAnswer: "Building trust with a new team requires consistent actions over time. My approach: 1) Listen first — spend the first weeks understanding the team's dynamics, challenges, and culture before suggesting changes. 2) Deliver on promises — if I say I'll do something, I do it by the deadline. Reliability builds trust faster than brilliance. 3) Be transparent — share my thought process, admit when I don't know something, and ask for help when needed. Vulnerability builds connection. 4) Support others — offer help proactively, share knowledge generously, and celebrate teammates' successes. 5) Respect existing work — even if I see things I'd do differently, I acknowledge the value of what's already been built before proposing improvements. 6) Be consistent — show up with the same attitude every day. People trust predictability. In Moroccan workplace culture, relationship-building often happens over shared meals and informal conversations — I participate in these social moments because they're integral to team cohesion.", sampleAnswerFr: "Construire la confiance avec une nouvelle equipe necessite des actions coherentes dans le temps. Mon approche : 1) Ecouter d'abord — passer les premieres semaines a comprendre la dynamique, les defis et la culture de l'equipe avant de suggerer des changements. 2) Tenir ses promesses — si je dis que je ferai quelque chose, je le fais dans les delais. La fiabilite construit la confiance plus vite que la brillance. 3) Etre transparent — partager mon processus de reflexion, admettre quand je ne sais pas quelque chose, et demander de l'aide quand necessaire. 4) Soutenir les autres — offrir de l'aide de maniere proactive, partager les connaissances genereusement, et celebrer les succes des coequipiers. 5) Respecter le travail existant — meme si je vois des choses que je ferais differemment, je reconnais la valeur de ce qui a ete construit avant de proposer des ameliorations. 6) Etre coherent — se presenter avec la meme attitude chaque jour. Les gens font confiance a la previsibilite. Dans la culture marocaine du lieu de travail, la construction de relations se fait souvent lors de repas partages et de conversations informelles — je participe a ces moments sociaux car ils sont essentiels a la cohesion d'equipe.", tips: ["Emphasize listening and reliability as foundations", "Mention cultural awareness for Moroccan workplaces", "Show that trust is built through actions, not words"], tipsFr: ["Mettez l'accent sur l'ecoute et la fiabilite comme fondements", "Mentionnez la sensibilite culturelle pour les lieux de travail marocains", "Montrez que la confiance se construit par les actions, pas les mots"] },
	{ id: qid("gen"), question: "What role do you typically play in a team?", questionFr: "Quel role jouez-vous typiquement dans une equipe ?", type: "behavioral", field: "général", difficulty: "easy", sampleAnswer: "I naturally gravitate toward the organizer/facilitator role — I'm the person who creates structure, tracks progress, and makes sure everyone stays aligned. In group projects at IMTA, I often took the initiative to create shared documents, set meeting agendas, and summarize action items. However, I'm flexible and can adapt to what the team needs. If we need someone to do deep technical work, I can focus and deliver independently. If someone else is a stronger leader, I'm happy to support and contribute as a team player. The key insight I've had about teamwork: the best teams don't need a hero — they need everyone doing their part consistently and communicating openly. I contribute most by making collaboration easier and keeping the team focused on outcomes.", sampleAnswerFr: "Je gravite naturellement vers le role d'organisateur/facilitateur — je suis la personne qui cree de la structure, suit l'avancement, et s'assure que tout le monde reste aligne. Dans les projets de groupe a l'IMTA, j'ai souvent pris l'initiative de creer des documents partages, fixer des ordres du jour, et resumer les actions. Cependant, je suis flexible et peux m'adapter a ce dont l'equipe a besoin. Si nous avons besoin de quelqu'un pour un travail technique approfondi, je peux me concentrer et livrer de maniere independante. Si quelqu'un d'autre est un leader plus fort, je suis content de soutenir et contribuer comme coequipier. L'insight cle que j'ai eu sur le travail d'equipe : les meilleures equipes n'ont pas besoin d'un heros — elles ont besoin que chacun fasse sa part de maniere coherente et communique ouvertement. Je contribue le plus en rendant la collaboration plus facile et en gardant l'equipe focalisee sur les resultats.", tips: ["Be honest about your natural role", "Show flexibility to adapt to team needs", "Give specific examples from school or work projects"], tipsFr: ["Soyez honnete sur votre role naturel", "Montrez votre flexibilite pour vous adapter aux besoins de l'equipe", "Donnez des exemples specifiques de projets scolaires ou professionnels"] },
	{ id: qid("ind"), question: "What is the difference between quality control and quality assurance?", questionFr: "Quelle est la difference entre le controle qualite et l'assurance qualite ?", type: "technical", field: "génie-industriel", difficulty: "easy", sampleAnswer: "Quality Control (QC) is reactive — it focuses on identifying defects in finished products through inspection and testing. It answers: 'Does this product meet specifications?' Activities: visual inspection, dimensional measurement, destructive/non-destructive testing, statistical sampling. Quality Assurance (QA) is proactive — it focuses on preventing defects by improving processes. It answers: 'Is our process capable of consistently producing good products?' Activities: process audits, training programs, standard operating procedures, statistical process control (SPC), and continuous improvement. Analogy: QC is the goalkeeper (catches defects); QA is the defense (prevents shots from being taken). Both are essential: QA reduces the number of defects that reach QC, and QC catches what QA misses. In practice: ISO 9001 certification (common in Moroccan industry — OCP, Renault suppliers) covers both. The quality management system encompasses QA processes, and QC inspection plans verify outputs.", sampleAnswerFr: "Le Controle Qualite (CQ) est reactif — il se concentre sur l'identification des defauts dans les produits finis par l'inspection et les tests. Il repond a : 'Ce produit respecte-t-il les specifications ?' Activites : inspection visuelle, mesure dimensionnelle, tests destructifs/non-destructifs, echantillonnage statistique. L'Assurance Qualite (AQ) est proactive — elle se concentre sur la prevention des defauts en ameliorant les processus. Elle repond a : 'Notre processus est-il capable de produire des bons produits de maniere coherente ?' Activites : audits de processus, programmes de formation, procedures operationnelles standard, maitrise statistique des processus (SPC), et amelioration continue. Analogie : le CQ est le gardien de but (attrape les defauts) ; l'AQ est la defense (empeche les tirs). Les deux sont essentiels : l'AQ reduit le nombre de defauts qui atteignent le CQ, et le CQ attrape ce que l'AQ manque. En pratique : la certification ISO 9001 (courante dans l'industrie marocaine — OCP, fournisseurs Renault) couvre les deux. Le systeme de management de la qualite englobe les processus AQ, et les plans d'inspection CQ verifient les sorties.", tips: ["Clearly distinguish reactive (QC) vs proactive (QA)", "Use the goalkeeper vs defense analogy", "Reference ISO 9001 as the framework that covers both"], tipsFr: ["Distinguez clairement reactif (CQ) vs proactif (AQ)", "Utilisez l'analogie gardien de but vs defense", "Referencez ISO 9001 comme le cadre qui couvre les deux"] },
	{ id: qid("ind"), question: "What is ergonomics and why does it matter in industry?", questionFr: "Qu'est-ce que l'ergonomie et pourquoi est-elle importante dans l'industrie ?", type: "technical", field: "génie-industriel", difficulty: "easy", sampleAnswer: "Ergonomics is the science of designing workplaces, products, and systems to fit the people who use them. It matters because: 1) Health — poor ergonomics causes musculoskeletal disorders (MSDs), the leading cause of workplace injury (back pain, carpal tunnel, tendinitis). 2) Productivity — well-designed workstations reduce fatigue and errors, increasing output by 15-25%. 3) Quality — comfortable workers make fewer mistakes. 4) Legal compliance — Moroccan labor law requires employers to ensure workplace safety (Code du Travail Articles 281-303). Key areas: physical ergonomics (workstation height, lifting limits per NIOSH — max 23kg recommended, tool design), cognitive ergonomics (information displays, alarm design, decision support systems), and organizational ergonomics (shift scheduling, work-rest cycles, job rotation). Implementation: conduct ergonomic assessments using RULA/REBA methods, involve workers in design decisions, implement adjustable workstations, and train workers on safe postures and lifting techniques.", sampleAnswerFr: "L'ergonomie est la science de la conception des lieux de travail, produits et systemes pour s'adapter aux personnes qui les utilisent. Elle est importante car : 1) Sante — une mauvaise ergonomie cause des troubles musculosquelettiques (TMS), premiere cause d'accident du travail (mal de dos, syndrome du canal carpien, tendinite). 2) Productivite — des postes de travail bien concus reduisent la fatigue et les erreurs, augmentant la production de 15-25%. 3) Qualite — des travailleurs confortables font moins d'erreurs. 4) Conformite legale — le droit du travail marocain exige que les employeurs assurent la securite au travail (Code du Travail Articles 281-303). Domaines cles : ergonomie physique (hauteur de poste, limites de levage selon NIOSH — max 23kg recommande, conception d'outils), ergonomie cognitive (affichages d'information, conception d'alarmes, systemes d'aide a la decision), et ergonomie organisationnelle (planification des equipes, cycles travail-repos, rotation de postes). Mise en oeuvre : conduire des evaluations ergonomiques avec les methodes RULA/REBA, impliquer les travailleurs dans les decisions de conception, implementer des postes ajustables, et former les travailleurs aux postures sures et techniques de levage.", tips: ["Cover all three types: physical, cognitive, organizational", "Mention the productivity and quality benefits, not just safety", "Reference RULA/REBA assessment methods"], tipsFr: ["Couvrez les trois types : physique, cognitive, organisationnelle", "Mentionnez les benefices de productivite et qualite, pas seulement la securite", "Referencez les methodes d'evaluation RULA/REBA"] },
	{ id: qid("civ"), question: "What is the difference between dead load and live load?", questionFr: "Quelle est la difference entre charge permanente et charge d'exploitation ?", type: "technical", field: "génie-civil", difficulty: "easy", sampleAnswer: "Dead load (charge permanente / G) is the weight of the structure itself and all permanently attached elements: concrete slabs, beams, columns, walls, flooring, ceiling finishes, fixed equipment, and permanent partitions. It is constant throughout the life of the structure. Example: a 20cm reinforced concrete slab weighs approximately 5 kN/m2 (25 kN/m3 x 0.20m). Live load (charge d'exploitation / Q) is the weight of occupants, furniture, movable equipment, and anything that can change over time. It varies by use: residential = 1.5 kN/m2, offices = 2.5 kN/m2, classrooms = 2.5 kN/m2, commercial = 5.0 kN/m2, parking = 2.5 kN/m2 (per NF P 06-001 used in Morocco). Other load types: wind load (W), seismic load (E per RPS 2011), snow load (S), and temperature effects (T). Load combinations per BAEL 91: Ultimate Limit State (ELU) = 1.35G + 1.5Q; Serviceability Limit State (ELS) = G + Q. These factors provide safety margins against structural failure.", sampleAnswerFr: "La charge permanente (dead load / G) est le poids de la structure elle-meme et tous les elements attaches de maniere permanente : dalles en beton, poutres, poteaux, murs, revetements de sol, faux plafonds, equipements fixes, et cloisons permanentes. Elle est constante pendant la vie de la structure. Exemple : une dalle en beton arme de 20cm pese environ 5 kN/m2 (25 kN/m3 x 0,20m). La charge d'exploitation (live load / Q) est le poids des occupants, du mobilier, des equipements mobiles, et de tout ce qui peut changer dans le temps. Elle varie selon l'usage : residentiel = 1,5 kN/m2, bureaux = 2,5 kN/m2, salles de classe = 2,5 kN/m2, commercial = 5,0 kN/m2, parking = 2,5 kN/m2 (selon NF P 06-001 utilisee au Maroc). Autres types de charges : charge de vent (W), charge sismique (E selon RPS 2011), charge de neige (S), et effets de temperature (T). Combinaisons de charges selon BAEL 91 : Etat Limite Ultime (ELU) = 1,35G + 1,5Q ; Etat Limite de Service (ELS) = G + Q. Ces facteurs fournissent des marges de securite contre la rupture structurale.", tips: ["Define both clearly with specific values", "Know the standard live loads by building type", "Reference the BAEL 91 load combination factors"], tipsFr: ["Definissez les deux clairement avec des valeurs specifiques", "Connaissez les charges d'exploitation standard par type de batiment", "Referencez les facteurs de combinaison de charges du BAEL 91"] },
	{ id: qid("elec"), question: "What is a PLC and how is it used in industrial automation?", questionFr: "Qu'est-ce qu'un API et comment est-il utilise en automatisation industrielle ?", type: "technical", field: "génie-électrique", difficulty: "medium", sampleAnswer: "A PLC (Programmable Logic Controller / Automate Programmable Industriel - API) is a ruggedized computer used to automate industrial processes. Components: CPU (processes the program), input modules (receive signals from sensors — temperature, pressure, proximity, level), output modules (control actuators — motors, valves, relays, contactors), power supply, and communication modules (Ethernet/IP, Modbus, Profinet). Programming languages (IEC 61131-3): Ladder Diagram (LD — most common, resembles relay logic), Structured Text (ST — like Pascal), Function Block Diagram (FBD), Sequential Function Chart (SFC), and Instruction List (IL). Major brands: Siemens (S7-1200/1500 — dominant in Morocco), Schneider Electric (M340, M580), Allen-Bradley (CompactLogix), and Mitsubishi. Applications: assembly line control, packaging machines, water treatment plants (ONEE), conveyor systems, and building management systems. PLCs are preferred over relay logic because they are: reprogrammable (easy to modify), reliable (MTBF >50,000 hours), compact, and capable of complex logic with timing, counting, and PID control.", sampleAnswerFr: "Un API (Automate Programmable Industriel / PLC) est un ordinateur durci utilise pour automatiser les processus industriels. Composants : CPU (traite le programme), modules d'entrees (recoivent les signaux des capteurs — temperature, pression, proximite, niveau), modules de sorties (commandent les actionneurs — moteurs, vannes, relais, contacteurs), alimentation, et modules de communication (Ethernet/IP, Modbus, Profinet). Langages de programmation (IEC 61131-3) : Langage a Contacts (LD — le plus courant, ressemble a la logique de relais), Texte Structure (ST — comme Pascal), Diagramme de Blocs Fonctionnels (FBD), Grafcet (SFC), et Liste d'Instructions (IL). Marques principales : Siemens (S7-1200/1500 — dominant au Maroc), Schneider Electric (M340, M580), Allen-Bradley (CompactLogix), et Mitsubishi. Applications : controle de lignes d'assemblage, machines d'emballage, stations de traitement d'eau (ONEE), systemes de convoyage, et gestion technique du batiment. Les API sont preferes a la logique de relais car ils sont : reprogrammables (faciles a modifier), fiables (MTBF >50 000 heures), compacts, et capables de logique complexe avec temporisation, comptage, et regulation PID.", tips: ["Name specific PLC brands and models used in Morocco", "List the five IEC 61131-3 programming languages", "Give real industrial applications"], tipsFr: ["Nommez des marques et modeles d'API specifiques utilises au Maroc", "Listez les cinq langages de programmation IEC 61131-3", "Donnez des applications industrielles reelles"] },
	{ id: qid("mec"), question: "What is the difference between hardness, toughness, and strength?", questionFr: "Quelle est la difference entre la durete, la tenacite et la resistance ?", type: "technical", field: "génie-mécanique", difficulty: "easy", sampleAnswer: "Three distinct but related material properties: Hardness is resistance to surface deformation (indentation, scratching). Measured by: Brinell (HB — steel ball indenter), Rockwell (HRC — diamond cone for hardened steel), and Vickers (HV — diamond pyramid, most versatile). Applications: wear-resistant surfaces, cutting tools. Toughness is the ability to absorb energy before fracturing — combining strength and ductility. Measured by: Charpy or Izod impact tests (energy absorbed by a notched specimen). A material can be hard but brittle (glass) — low toughness. Critical for components subject to shock or impact loading. Strength is resistance to applied forces. Types: tensile strength (resistance to pulling apart), compressive strength (resistance to crushing), yield strength (stress at which permanent deformation begins), and ultimate strength (maximum stress before failure). Measured by tensile testing machine. Key relationship: heat treatment changes the balance. Quenching increases hardness but may reduce toughness. Tempering after quenching restores some toughness while maintaining hardness. The engineer must balance these properties based on the application.", sampleAnswerFr: "Trois proprietes materielles distinctes mais liees : La durete est la resistance a la deformation de surface (indentation, rayure). Mesuree par : Brinell (HB — bille en acier), Rockwell (HRC — cone en diamant pour acier trempe), et Vickers (HV — pyramide en diamant, la plus polyvalente). Applications : surfaces resistantes a l'usure, outils de coupe. La tenacite est la capacite a absorber de l'energie avant la fracture — combinant resistance et ductilite. Mesuree par : tests d'impact Charpy ou Izod (energie absorbee par une eprouvette entaillee). Un materiau peut etre dur mais fragile (verre) — faible tenacite. Critique pour les composants soumis a des chocs. La resistance est la resistance aux forces appliquees. Types : resistance a la traction (resistance a l'arrachement), resistance a la compression (resistance a l'ecrasement), limite d'elasticite (contrainte a laquelle la deformation permanente commence), et resistance ultime (contrainte maximale avant rupture). Mesuree par machine d'essai de traction. Relation cle : le traitement thermique change l'equilibre. La trempe augmente la durete mais peut reduire la tenacite. Le revenu apres trempe restaure une certaine tenacite tout en maintenant la durete. L'ingenieur doit equilibrer ces proprietes selon l'application.", tips: ["Define each property with specific test methods", "Explain how heat treatment affects the balance", "Use the glass example for hard but brittle"], tipsFr: ["Definissez chaque propriete avec des methodes de test specifiques", "Expliquez comment le traitement thermique affecte l'equilibre", "Utilisez l'exemple du verre pour dur mais fragile"] },
	{ id: qid("com"), question: "What is the role of a freight forwarder?", questionFr: "Quel est le role d'un transitaire ?", type: "technical", field: "commerce-international", difficulty: "easy", sampleAnswer: "A freight forwarder (transitaire) is an intermediary who arranges the transportation of goods on behalf of shippers. They don't own ships or planes but coordinate the entire logistics chain. Services: 1) Transport booking — negotiate rates with carriers (shipping lines, airlines, trucking companies) and book space. 2) Documentation — prepare and verify all shipping documents (bill of lading, commercial invoice, packing list, certificate of origin, insurance). 3) Customs clearance — handle import/export customs formalities (DUM filing via BADR system in Morocco). 4) Cargo consolidation — combine multiple small shipments into one container (LCL — Less than Container Load) for cost efficiency. 5) Insurance — arrange cargo insurance for goods in transit. 6) Tracking — provide shipment visibility from origin to destination. 7) Advisory — advise on Incoterms, packaging, labeling requirements, and regulations. Major freight forwarders in Morocco: SDV (Bollore Logistics), Kuehne + Nagel, DHL Global Forwarding, and local companies like TIMAR and SDTM. The choice depends on: trade lane expertise, service quality, rates, and network coverage.", sampleAnswerFr: "Un transitaire (freight forwarder) est un intermediaire qui organise le transport de marchandises pour le compte des expediteurs. Il ne possede pas de navires ou d'avions mais coordonne toute la chaine logistique. Services : 1) Reservation de transport — negocier les tarifs avec les transporteurs (compagnies maritimes, aeriennes, routieres) et reserver de l'espace. 2) Documentation — preparer et verifier tous les documents d'expedition (connaissement, facture commerciale, liste de colisage, certificat d'origine, assurance). 3) Dedouanement — gerer les formalites douanieres import/export (depot de DUM via le systeme BADR au Maroc). 4) Groupage — combiner plusieurs petites expeditions dans un conteneur (LCL — Less than Container Load) pour l'efficacite des couts. 5) Assurance — organiser l'assurance marchandises pour les biens en transit. 6) Suivi — fournir la visibilite de l'expedition de l'origine a la destination. 7) Conseil — conseiller sur les Incoterms, l'emballage, les exigences d'etiquetage, et la reglementation. Principaux transitaires au Maroc : SDV (Bollore Logistics), Kuehne + Nagel, DHL Global Forwarding, et des entreprises locales comme TIMAR et SDTM. Le choix depend de : l'expertise sur la ligne commerciale, la qualite de service, les tarifs, et la couverture du reseau.", tips: ["Cover the seven main services of a freight forwarder", "Name specific freight forwarders operating in Morocco", "Mention the BADR system for customs clearance"], tipsFr: ["Couvrez les sept services principaux d'un transitaire", "Nommez des transitaires specifiques operant au Maroc", "Mentionnez le systeme BADR pour le dedouanement"] },
	{ id: qid("fin"), question: "What is the difference between IFRS and the Moroccan CGNC?", questionFr: "Quelle est la difference entre les IFRS et le CGNC marocain ?", type: "technical", field: "finance", difficulty: "hard", sampleAnswer: "The CGNC (Code General de la Normalisation Comptable) is Morocco's national accounting framework, mandatory for all companies. IFRS (International Financial Reporting Standards) is required additionally for companies listed on the Bourse de Casablanca for consolidated statements. Key differences: 1) Conceptual approach — CGNC follows a patrimonial (balance sheet) approach; IFRS follows a decision-usefulness (investor information) approach. 2) Financial statements — CGNC requires: Bilan, CPC, ESG (Etat des Soldes de Gestion), TF (Tableau de Financement), ETIC (Etat des Informations Complementaires). IFRS requires: Statement of Financial Position, Income Statement, Statement of Changes in Equity, Cash Flow Statement, Notes. 3) Asset valuation — CGNC uses historical cost primarily; IFRS allows fair value for many assets (investment property, financial instruments). 4) Revenue recognition — CGNC follows realization principle; IFRS 15 uses the five-step model. 5) Leases — CGNC treats operating leases as expenses; IFRS 16 capitalizes virtually all leases on the balance sheet. Many Moroccan companies must prepare dual reporting, which creates additional complexity and need for professionals who understand both frameworks.", sampleAnswerFr: "Le CGNC (Code General de la Normalisation Comptable) est le referentiel comptable national du Maroc, obligatoire pour toutes les entreprises. Les IFRS (International Financial Reporting Standards) sont requises en plus pour les societes cotees a la Bourse de Casablanca pour les etats consolides. Differences cles : 1) Approche conceptuelle — le CGNC suit une approche patrimoniale (bilan) ; les IFRS suivent une approche d'utilite decisionnelle (information des investisseurs). 2) Etats financiers — le CGNC exige : Bilan, CPC, ESG (Etat des Soldes de Gestion), TF (Tableau de Financement), ETIC (Etat des Informations Complementaires). Les IFRS exigent : Etat de la Situation Financiere, Compte de Resultat, Etat des Variations des Capitaux Propres, Tableau des Flux de Tresorerie, Notes. 3) Evaluation des actifs — le CGNC utilise principalement le cout historique ; les IFRS permettent la juste valeur pour de nombreux actifs (immeubles de placement, instruments financiers). 4) Reconnaissance du revenu — le CGNC suit le principe de realisation ; IFRS 15 utilise le modele en cinq etapes. 5) Contrats de location — le CGNC traite les locations operationnelles comme des charges ; IFRS 16 capitalise pratiquement toutes les locations au bilan. De nombreuses entreprises marocaines doivent preparer un double reporting, ce qui cree une complexite supplementaire et un besoin de professionnels qui comprennent les deux referentiels.", tips: ["Know the five key CGNC financial statements", "Explain fair value vs historical cost difference", "Reference the dual reporting requirement for listed companies"], tipsFr: ["Connaissez les cinq etats financiers cles du CGNC", "Expliquez la difference juste valeur vs cout historique", "Referencez l'exigence de double reporting pour les societes cotees"] },
	{ id: qid("log"), question: "What is the ABC analysis in inventory management?", questionFr: "Qu'est-ce que l'analyse ABC en gestion des stocks ?", type: "technical", field: "logistique", difficulty: "easy", sampleAnswer: "ABC analysis categorizes inventory items by their value and importance, based on the Pareto principle (80/20 rule). Categories: A items — high value, low quantity. Typically 10-20% of items but 70-80% of total inventory value. Management: tight control, frequent reviews, accurate demand forecasting, just-in-time delivery, safety stock calculated precisely. B items — moderate value and quantity. Typically 20-30% of items and 15-25% of value. Management: regular reviews, moderate safety stock, periodic order quantity reviews. C items — low value, high quantity. Typically 50-70% of items but only 5-10% of value. Management: simplified controls, larger order quantities to reduce ordering costs, higher safety stock (cost of stockout vs holding cost). How to perform: list all items, calculate annual consumption value (unit cost x annual usage), rank by value, cumulate percentage, and assign categories. ABC analysis guides where to focus management attention and resources. It can be combined with XYZ analysis (demand variability) for more nuanced inventory strategies.", sampleAnswerFr: "L'analyse ABC categorise les articles de stock par leur valeur et leur importance, basee sur le principe de Pareto (regle 80/20). Categories : Articles A — haute valeur, faible quantite. Typiquement 10-20% des articles mais 70-80% de la valeur totale du stock. Gestion : controle serre, revues frequentes, prevision de demande precise, livraison juste-a-temps, stock de securite calcule precisement. Articles B — valeur et quantite moderees. Typiquement 20-30% des articles et 15-25% de la valeur. Gestion : revues regulieres, stock de securite modere, revues periodiques des quantites de commande. Articles C — faible valeur, haute quantite. Typiquement 50-70% des articles mais seulement 5-10% de la valeur. Gestion : controles simplifies, quantites de commande plus grandes pour reduire les couts de commande, stock de securite plus eleve (cout de rupture vs cout de detention). Comment realiser : lister tous les articles, calculer la valeur de consommation annuelle (cout unitaire x utilisation annuelle), classer par valeur, cumuler le pourcentage, et assigner les categories. L'analyse ABC guide ou concentrer l'attention et les ressources du management. Elle peut etre combinee avec l'analyse XYZ (variabilite de la demande) pour des strategies de stock plus nuancees.", tips: ["Know the typical percentages for each category", "Explain different management strategies per category", "Mention the XYZ analysis as a complementary tool"], tipsFr: ["Connaissez les pourcentages typiques pour chaque categorie", "Expliquez les strategies de gestion differentes par categorie", "Mentionnez l'analyse XYZ comme outil complementaire"] },
];

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

async function main() {
	await client.connect();
	console.log("Connected to PostgreSQL");
	console.log(`Prepared ${QUESTIONS.length} questions for seeding.`);

	// 1. Clear existing data
	const deleteResult = await client.query("DELETE FROM interview_common_question");
	console.log(`Cleared ${deleteResult.rowCount} existing questions.`);

	// 2. Insert in batches of 50
	const BATCH_SIZE = 50;
	let totalInserted = 0;

	for (let i = 0; i < QUESTIONS.length; i += BATCH_SIZE) {
		const batch = QUESTIONS.slice(i, i + BATCH_SIZE);
		const batchNum = Math.floor(i / BATCH_SIZE) + 1;

		for (const q of batch) {
			await client.query(
				`INSERT INTO interview_common_question
				 (id, question, question_fr, type, field, sample_answer, sample_answer_fr,
				  tips, tips_fr, difficulty, is_active, sort_order)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
				 ON CONFLICT (id) DO NOTHING`,
				[
					q.id,
					q.question,
					q.questionFr,
					q.type,
					q.field,
					q.sampleAnswer,
					q.sampleAnswerFr,
					JSON.stringify(q.tips),
					JSON.stringify(q.tipsFr),
					q.difficulty || "intermediate",
					true,
					totalInserted + 1,
				],
			);
			totalInserted++;
		}

		console.log(`  Batch ${batchNum}: inserted ${batch.length} questions (total: ${totalInserted})`);
	}

	// 3. Verify and report
	const countResult = await client.query("SELECT COUNT(*) as cnt FROM interview_common_question");
	const typeResult = await client.query(
		"SELECT type, COUNT(*) as cnt FROM interview_common_question GROUP BY type ORDER BY cnt DESC",
	);
	const fieldResult = await client.query(
		"SELECT field, COUNT(*) as cnt FROM interview_common_question GROUP BY field ORDER BY cnt DESC",
	);
	const diffResult = await client.query(
		"SELECT difficulty, COUNT(*) as cnt FROM interview_common_question GROUP BY difficulty ORDER BY cnt DESC",
	);

	console.log("\n===== SEED COMPLETE =====");
	console.log(`Total questions in database: ${countResult.rows[0].cnt}`);
	console.log("\nBy type (category):");
	for (const row of typeResult.rows) {
		console.log(`  ${row.type}: ${row.cnt}`);
	}
	console.log("\nBy field:");
	for (const row of fieldResult.rows) {
		console.log(`  ${row.field}: ${row.cnt}`);
	}
	console.log("\nBy difficulty:");
	for (const row of diffResult.rows) {
		console.log(`  ${row.difficulty}: ${row.cnt}`);
	}

	await client.end();
	console.log("\nDone! Database connection closed.");
}

main().catch((err) => {
	console.error("Seed failed:", err);
	client.end();
	process.exit(1);
});
