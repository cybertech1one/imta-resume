/**
 * seed-questions-400.mjs
 *
 * Seeds 400+ NEW interview questions into interview_common_question table.
 * All questions are bilingual (EN+FR), Morocco-focused, field-specific.
 *
 * Usage: node scripts/seed-questions-400.mjs
 */

import pg from "pg";
import crypto from "crypto";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

let sortOrder = 500;
function nextSort() { return sortOrder++; }
function uid(prefix) { return `${prefix}-${crypto.randomUUID().slice(0, 8)}`; }

// Helper to build a question object
function Q(prefix, question, questionFr, type, field, difficulty, sampleAnswer, sampleAnswerFr, tips, tipsFr) {
  return {
    id: uid(prefix),
    question,
    question_fr: questionFr,
    type,
    field,
    difficulty,
    sample_answer: sampleAnswer,
    sample_answer_fr: sampleAnswerFr,
    tips: JSON.stringify(tips),
    tips_fr: JSON.stringify(tipsFr),
    is_active: true,
    sort_order: nextSort(),
  };
}

// ============================================================================
// QUESTIONS DATA — 400+ bilingual questions for Moroccan job market
// ============================================================================

const QUESTIONS = [

// ---------------------------------------------------------------------------
// GENERAL / BEHAVIORAL (25 questions)
// ---------------------------------------------------------------------------
Q("g4", "How do you handle working in a multilingual environment (Arabic, French, English)?",
  "Comment gérez-vous le travail dans un environnement multilingue (arabe, français, anglais) ?",
  "behavioral", "général", "easy",
  "Growing up in Morocco, I naturally developed fluency in Arabic and French. I strengthened my English through IMTA coursework and online certifications. In my internship at a multinational in Casablanca, I drafted reports in French, communicated with headquarters in English, and coordinated with local suppliers in Darija. I see multilingualism as a strategic asset that enables me to bridge cultural gaps and serve diverse clients.",
  "Ayant grandi au Maroc, j'ai naturellement développé une maîtrise de l'arabe et du français. J'ai renforcé mon anglais grâce aux cours à l'IMTA et des certifications en ligne. Lors de mon stage dans une multinationale à Casablanca, je rédigeais des rapports en français, communiquais avec le siège en anglais et coordonnais avec les fournisseurs locaux en darija. Je considère le multilinguisme comme un atout stratégique.",
  ["Give concrete examples of using each language professionally", "Show how multilingualism helped you solve a real problem", "Mention any certifications (TOEFL, DELF, etc.)"],
  ["Donnez des exemples concrets d'utilisation de chaque langue professionnellement", "Montrez comment le multilinguisme vous a aidé à résoudre un problème réel", "Mentionnez vos certifications (TOEFL, DELF, etc.)"]
),

Q("g4", "What do you know about Morocco's Nouveau Modèle de Développement (NMD)?",
  "Que savez-vous du Nouveau Modèle de Développement du Maroc (NMD) ?",
  "competency", "général", "medium",
  "The NMD, launched in 2021, aims to transform Morocco by 2035 through four axes: productive economy, human capital, inclusion, and sustainable territories. It targets doubling GDP per capita, raising employment rates to 60%, and positioning Morocco as a regional hub. For my field, this means increased investment in digital infrastructure and industrial zones, creating opportunities for engineers in emerging sectors like renewable energy and smart cities.",
  "Le NMD, lancé en 2021, vise à transformer le Maroc d'ici 2035 à travers quatre axes : économie productive, capital humain, inclusion et territoires durables. Il cible le doublement du PIB par habitant, l'augmentation du taux d'emploi à 60% et le positionnement du Maroc comme hub régional. Pour mon domaine, cela signifie plus d'investissements dans l'infrastructure numérique et les zones industrielles.",
  ["Connect NMD goals to your specific field", "Show awareness of timeline and measurable targets", "Mention how your skills align with NMD priorities"],
  ["Reliez les objectifs du NMD à votre domaine spécifique", "Montrez votre connaissance du calendrier et des objectifs mesurables", "Mentionnez comment vos compétences s'alignent avec les priorités du NMD"]
),

Q("g4", "Describe a situation where you had to adapt to a sudden change in project requirements.",
  "Décrivez une situation où vous avez dû vous adapter à un changement soudain des exigences d'un projet.",
  "situational", "général", "medium",
  "During my PFE at a company in Tanger Med zone, the client changed the data format specification two weeks before delivery. I organized an emergency meeting, redistributed tasks based on team strengths, and created a migration script to convert existing work. We delivered on time by working extended hours and daily stand-ups. The experience taught me that flexibility and clear communication are essential in fast-paced Moroccan industrial environments.",
  "Lors de mon PFE dans une entreprise de la zone Tanger Med, le client a changé les spécifications de format de données deux semaines avant la livraison. J'ai organisé une réunion d'urgence, redistribué les tâches selon les forces de l'équipe et créé un script de migration. Nous avons livré à temps grâce à des heures supplémentaires et des réunions quotidiennes. Cette expérience m'a appris que la flexibilité et la communication claire sont essentielles.",
  ["Use the STAR method (Situation, Task, Action, Result)", "Emphasize the positive outcome despite challenges", "Show leadership qualities even in junior roles"],
  ["Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)", "Soulignez le résultat positif malgré les défis", "Montrez des qualités de leadership même dans des rôles juniors"]
),

Q("g4", "Why should we hire you over other candidates from top Moroccan engineering schools?",
  "Pourquoi devrions-nous vous embaucher plutôt que d'autres candidats des grandes écoles d'ingénieurs marocaines ?",
  "motivation", "général", "hard",
  "While graduates from EHTP, EMI, or ENSIAS share strong technical foundations, I bring a unique combination of practical industry experience through my internships in Moroccan companies, a deep understanding of local market challenges, and proven ability to deliver results under pressure. My PFE project at [company] directly reduced processing time by 30%, demonstrating that I don't just learn theory — I create measurable impact. I also bring genuine passion for your company's mission in [sector].",
  "Alors que les diplômés de l'EHTP, l'EMI ou l'ENSIAS partagent de solides bases techniques, j'apporte une combinaison unique d'expérience industrielle pratique via mes stages dans des entreprises marocaines, une compréhension approfondie des défis du marché local et une capacité prouvée à obtenir des résultats sous pression. Mon PFE a directement réduit le temps de traitement de 30%, démontrant que je ne me contente pas d'apprendre la théorie — je crée un impact mesurable.",
  ["Focus on what makes you unique, not on criticizing others", "Quantify your achievements whenever possible", "Show genuine knowledge of the company"],
  ["Concentrez-vous sur ce qui vous rend unique, sans critiquer les autres", "Quantifiez vos réalisations autant que possible", "Montrez une connaissance authentique de l'entreprise"]
),

Q("g4", "How do you stay updated with industry trends in Morocco and globally?",
  "Comment restez-vous informé des tendances de votre industrie au Maroc et dans le monde ?",
  "behavioral", "général", "easy",
  "I follow Moroccan industry publications like L'Economiste and La Vie éco for local market trends. Internationally, I read IEEE journals and follow key thought leaders on LinkedIn. I attend local meetups in Casablanca and webinars organized by CGEM. I also participate in hackathons like those organized by UM6P and 1337 coding school, which help me stay current with emerging technologies and network with professionals.",
  "Je suis les publications marocaines comme L'Economiste et La Vie éco pour les tendances locales. À l'international, je lis les journaux IEEE et suis des leaders d'opinion sur LinkedIn. J'assiste aux meetups locaux à Casablanca et aux webinaires organisés par la CGEM. Je participe aussi aux hackathons organisés par l'UM6P et l'école 1337, ce qui m'aide à rester à jour et à réseauter.",
  ["Name specific Moroccan and international sources", "Mention active participation, not just passive reading", "Show continuous learning mindset"],
  ["Nommez des sources marocaines et internationales spécifiques", "Mentionnez une participation active, pas seulement de la lecture passive", "Montrez un état d'esprit d'apprentissage continu"]
),

Q("g4", "Tell me about a time you failed and what you learned from it.",
  "Parlez-moi d'un moment où vous avez échoué et ce que vous en avez appris.",
  "behavioral", "général", "medium",
  "During a group project at IMTA, I underestimated the complexity of integrating a machine learning module. I tried to handle it alone instead of asking for help, and we missed the first milestone. I learned to communicate early when facing difficulties. After that, I adopted agile practices — breaking work into sprints and doing daily check-ins. The project ultimately succeeded and was selected for presentation at the school's innovation day.",
  "Lors d'un projet de groupe à l'IMTA, j'ai sous-estimé la complexité de l'intégration d'un module de machine learning. J'ai essayé de le gérer seul au lieu de demander de l'aide, et nous avons raté le premier jalon. J'ai appris à communiquer tôt en cas de difficulté. Après cela, j'ai adopté des pratiques agiles — découpage en sprints et points quotidiens. Le projet a finalement réussi et a été sélectionné pour la journée d'innovation de l'école.",
  ["Be honest about the failure — authenticity matters", "Focus more on the lesson than the failure itself", "Show how you applied the lesson in subsequent situations"],
  ["Soyez honnête sur l'échec — l'authenticité compte", "Concentrez-vous davantage sur la leçon que sur l'échec lui-même", "Montrez comment vous avez appliqué la leçon dans des situations ultérieures"]
),

Q("g4", "What salary expectations do you have for this role in the Moroccan market?",
  "Quelles sont vos prétentions salariales pour ce poste sur le marché marocain ?",
  "behavioral", "général", "hard",
  "Based on my research of the Moroccan market through Rekrute.com and Emploi.ma salary surveys, entry-level engineers in this sector typically earn between 8,000 and 12,000 MAD net per month. Given my qualifications, internship experience, and the responsibilities of this role, I believe a salary in the range of 10,000 to 12,000 MAD would be fair. However, I am also interested in the overall package including training opportunities, career progression, and work-life balance.",
  "D'après mes recherches sur le marché marocain via les enquêtes salariales de Rekrute.com et Emploi.ma, les ingénieurs débutants dans ce secteur gagnent typiquement entre 8 000 et 12 000 MAD net par mois. Compte tenu de mes qualifications, de mon expérience de stage et des responsabilités du poste, je pense qu'un salaire dans la fourchette de 10 000 à 12 000 MAD serait juste. Je m'intéresse aussi au package global incluant formation, évolution de carrière et équilibre vie professionnelle-personnelle.",
  ["Research salary ranges on Rekrute, Emploi.ma, and ReKrute salary guide", "Give a range rather than a fixed number", "Mention total compensation, not just base salary"],
  ["Recherchez les fourchettes salariales sur Rekrute, Emploi.ma et le guide salarial ReKrute", "Donnez une fourchette plutôt qu'un chiffre fixe", "Mentionnez la rémunération globale, pas seulement le salaire de base"]
),

Q("g4", "How would you contribute to corporate social responsibility initiatives in Morocco?",
  "Comment contribueriez-vous aux initiatives de responsabilité sociale des entreprises au Maroc ?",
  "motivation", "général", "medium",
  "I believe CSR is particularly important in Morocco given the social challenges we face. I would actively participate in education-focused initiatives like tutoring programs for underprivileged students, similar to what organizations like INJAZ Al-Maghrib do. I would also advocate for environmental sustainability aligned with Morocco's COP22 commitments and the national strategy for sustainable development. At a company level, I would propose partnerships with local associations and support skill-sharing programs with rural communities.",
  "Je crois que la RSE est particulièrement importante au Maroc vu les défis sociaux auxquels nous faisons face. Je participerais activement à des initiatives éducatives comme le tutorat pour les étudiants défavorisés, similaire à ce que fait INJAZ Al-Maghrib. Je plaiderais aussi pour la durabilité environnementale en ligne avec les engagements COP22 du Maroc et la stratégie nationale de développement durable. Au niveau de l'entreprise, je proposerais des partenariats avec des associations locales.",
  ["Reference specific Moroccan CSR programs and organizations", "Connect CSR to business value, not just charity", "Show personal commitment through past volunteer work"],
  ["Référencez des programmes RSE marocains spécifiques", "Connectez la RSE à la valeur commerciale, pas seulement à la charité", "Montrez votre engagement personnel par du bénévolat passé"]
),

Q("g4", "Where do you see yourself in five years within the Moroccan job market?",
  "Où vous voyez-vous dans cinq ans sur le marché du travail marocain ?",
  "motivation", "général", "easy",
  "In five years, I see myself as a senior engineer leading a team on innovative projects. Morocco's growing tech ecosystem, especially in Casablanca Finance City and the Technopolis zones, offers tremendous growth potential. I plan to earn relevant certifications, mentor junior colleagues, and potentially contribute to Morocco's digital transformation initiatives. I want to grow with a company that invests in its people, which is why your organization's development program appeals to me.",
  "Dans cinq ans, je me vois comme ingénieur senior dirigeant une équipe sur des projets innovants. L'écosystème tech croissant du Maroc, notamment Casablanca Finance City et les zones Technopolis, offre un potentiel de croissance formidable. Je prévois d'obtenir des certifications pertinentes, d'encadrer des collègues juniors et de contribuer aux initiatives de transformation digitale du Maroc. Je veux grandir avec une entreprise qui investit dans ses collaborateurs.",
  ["Be ambitious but realistic for the Moroccan market", "Show loyalty — companies want long-term investment", "Connect personal growth to company growth"],
  ["Soyez ambitieux mais réaliste pour le marché marocain", "Montrez de la loyauté — les entreprises veulent un investissement à long terme", "Connectez votre croissance personnelle à celle de l'entreprise"]
),

Q("g4", "How do you handle pressure and tight deadlines?",
  "Comment gérez-vous la pression et les délais serrés ?",
  "behavioral", "général", "easy",
  "I thrive under pressure when I have a clear plan. During exam periods at IMTA, I developed a system of prioritizing tasks using the Eisenhower matrix and time-blocking. In my internship, when we had a critical client delivery in 48 hours, I broke the remaining work into manageable chunks, delegated effectively, and we delivered on time. I also practice stress management through regular exercise and maintaining a healthy work-life balance, which keeps me performing at my best even during intense periods.",
  "Je m'épanouis sous pression quand j'ai un plan clair. Pendant les périodes d'examens à l'IMTA, j'ai développé un système de priorisation des tâches avec la matrice d'Eisenhower et le time-blocking. Lors de mon stage, face à une livraison client critique en 48 heures, j'ai découpé le travail restant en tâches gérables et délégué efficacement. Je pratique aussi la gestion du stress par l'exercice régulier et l'équilibre vie professionnelle-personnelle.",
  ["Give a specific example with measurable outcome", "Show both prevention and coping strategies", "Mention tools or methods you actually use"],
  ["Donnez un exemple spécifique avec un résultat mesurable", "Montrez des stratégies de prévention et d'adaptation", "Mentionnez les outils ou méthodes que vous utilisez réellement"]
),

Q("g4", "What motivates you to work in Morocco rather than seeking opportunities abroad?",
  "Qu'est-ce qui vous motive à travailler au Maroc plutôt qu'à chercher des opportunités à l'étranger ?",
  "motivation", "général", "medium",
  "Morocco is experiencing an exciting economic transformation with projects like Tanger Med, the Noor solar complex, and Maroc Digital 2030. I see enormous potential to make a meaningful impact here. The country needs skilled engineers who understand local challenges — from the AMDIE investment zones to the emerging startup ecosystem in Casablanca and Rabat. I want to be part of building Morocco's future rather than contributing to another country's growth. The professional opportunities here are increasingly competitive with international markets.",
  "Le Maroc connaît une transformation économique passionnante avec des projets comme Tanger Med, le complexe solaire Noor et Maroc Digital 2030. Je vois un potentiel énorme pour avoir un impact significatif ici. Le pays a besoin d'ingénieurs qualifiés qui comprennent les défis locaux. Je veux participer à la construction de l'avenir du Maroc plutôt que de contribuer à la croissance d'un autre pays. Les opportunités professionnelles ici sont de plus en plus compétitives avec les marchés internationaux.",
  ["Show genuine patriotic motivation without being naive", "Reference specific Moroccan development projects", "Acknowledge global awareness while choosing local impact"],
  ["Montrez une motivation patriotique authentique sans être naïf", "Référencez des projets de développement marocains spécifiques", "Reconnaissez votre vision globale tout en choisissant l'impact local"]
),

Q("g4", "Describe your experience with teamwork in a culturally diverse setting.",
  "Décrivez votre expérience du travail d'équipe dans un contexte culturellement diversifié.",
  "behavioral", "général", "medium",
  "At IMTA, I worked with students from different regions of Morocco and international exchange students from Senegal and France. During a joint project, I noticed that communication styles varied significantly. I proposed structured weekly meetings with clear agendas and shared documentation in both French and English. I also organized informal team lunches to build rapport. This approach reduced misunderstandings by creating a shared communication framework while respecting individual cultural backgrounds.",
  "À l'IMTA, j'ai travaillé avec des étudiants de différentes régions du Maroc et des étudiants internationaux du Sénégal et de France. Lors d'un projet commun, j'ai remarqué que les styles de communication variaient. J'ai proposé des réunions hebdomadaires structurées avec des ordres du jour clairs et une documentation partagée en français et anglais. J'ai aussi organisé des déjeuners d'équipe informels. Cette approche a réduit les malentendus en créant un cadre de communication partagé.",
  ["Highlight specific cultural differences you navigated", "Show active steps you took to bridge gaps", "Emphasize positive outcomes from diversity"],
  ["Soulignez les différences culturelles spécifiques que vous avez gérées", "Montrez les étapes actives que vous avez prises pour combler les écarts", "Mettez en avant les résultats positifs de la diversité"]
),

Q("g4", "How do you approach ethical dilemmas in the workplace?",
  "Comment abordez-vous les dilemmes éthiques en milieu professionnel ?",
  "situational", "général", "hard",
  "I believe in transparency and following established codes of conduct. In Morocco, where personal relationships often intersect with professional life, it is essential to set clear boundaries. If faced with an ethical dilemma, I would first consult the company's code of ethics, then seek guidance from my supervisor or compliance department. I once declined a supplier's gift during my internship because it exceeded the company's acceptable threshold. I believe maintaining integrity builds long-term trust and reputation.",
  "Je crois en la transparence et le respect des codes de conduite établis. Au Maroc, où les relations personnelles croisent souvent la vie professionnelle, il est essentiel de fixer des limites claires. Face à un dilemme éthique, je consulterais d'abord le code d'éthique de l'entreprise, puis demanderais conseil à mon superviseur ou au service conformité. J'ai une fois refusé un cadeau d'un fournisseur pendant mon stage car il dépassait le seuil acceptable. L'intégrité construit la confiance à long terme.",
  ["Reference specific ethical frameworks or company policies", "Give a real example if possible", "Show awareness of Moroccan business culture nuances"],
  ["Référencez des cadres éthiques spécifiques ou des politiques d'entreprise", "Donnez un exemple réel si possible", "Montrez votre conscience des nuances de la culture d'affaires marocaine"]
),

Q("g4", "What role does innovation play in your career aspirations?",
  "Quel rôle joue l'innovation dans vos aspirations professionnelles ?",
  "motivation", "général", "medium",
  "Innovation is central to my career vision. Morocco's startup ecosystem is growing rapidly — with incubators like Technopark, R&D centers like UM6P's 1337, and the government's Maroc Digital 2030 strategy. I want to contribute to this ecosystem by bringing fresh solutions to local challenges, whether it is optimizing supply chains for Moroccan SMEs or developing digital tools for agricultural modernization under Plan Maroc Vert. I believe the best innovations solve real problems that people face daily.",
  "L'innovation est au cœur de ma vision de carrière. L'écosystème startup marocain croît rapidement — avec des incubateurs comme Technopark, des centres R&D comme 1337 de l'UM6P et la stratégie Maroc Digital 2030. Je veux contribuer en apportant des solutions innovantes aux défis locaux, que ce soit l'optimisation des chaînes d'approvisionnement pour les PME marocaines ou le développement d'outils numériques pour la modernisation agricole sous le Plan Maroc Vert.",
  ["Connect innovation to solving real Moroccan problems", "Reference specific innovation ecosystems in Morocco", "Show how you have been innovative in past projects"],
  ["Connectez l'innovation à la résolution de problèmes marocains réels", "Référencez des écosystèmes d'innovation spécifiques au Maroc", "Montrez comment vous avez été innovant dans des projets passés"]
),

Q("g4", "How do you handle conflicts with colleagues or supervisors?",
  "Comment gérez-vous les conflits avec des collègues ou des supérieurs ?",
  "behavioral", "général", "medium",
  "I approach conflicts as opportunities for growth. During a team project at IMTA, two members disagreed on the technical approach. Instead of taking sides, I facilitated a structured discussion where each person presented their solution with pros and cons. We ended up combining elements from both approaches, which led to a stronger final product. I believe in addressing issues early, listening actively, and finding solutions that respect everyone's perspectives while prioritizing project goals.",
  "J'aborde les conflits comme des opportunités de croissance. Lors d'un projet d'équipe à l'IMTA, deux membres étaient en désaccord sur l'approche technique. Au lieu de prendre parti, j'ai facilité une discussion structurée où chacun a présenté sa solution avec avantages et inconvénients. Nous avons finalement combiné des éléments des deux approches, ce qui a mené à un produit final plus solide. Je crois en la résolution précoce des problèmes et l'écoute active.",
  ["Show maturity and emotional intelligence", "Describe a specific resolution process", "Emphasize positive outcomes from conflict resolution"],
  ["Montrez de la maturité et de l'intelligence émotionnelle", "Décrivez un processus de résolution spécifique", "Mettez en avant les résultats positifs de la résolution de conflits"]
),

Q("g4", "What questions do you have for us about this position?",
  "Quelles questions avez-vous pour nous concernant ce poste ?",
  "behavioral", "général", "easy",
  "I would like to ask: What does a typical day look like for someone in this role? What are the biggest challenges your team is currently facing? What professional development opportunities does the company offer? How does this role contribute to the company's strategic objectives in the Moroccan market? What is the team structure and who would I be working with directly?",
  "J'aimerais demander : À quoi ressemble une journée type pour quelqu'un dans ce rôle ? Quels sont les plus grands défis auxquels votre équipe fait face actuellement ? Quelles opportunités de développement professionnel l'entreprise offre-t-elle ? Comment ce rôle contribue-t-il aux objectifs stratégiques de l'entreprise sur le marché marocain ? Quelle est la structure de l'équipe ?",
  ["Always prepare at least 3-5 questions", "Ask about growth opportunities and team dynamics", "Never ask about salary or vacation first — save those for later rounds"],
  ["Préparez toujours au moins 3 à 5 questions", "Posez des questions sur les opportunités de croissance et la dynamique d'équipe", "Ne demandez jamais le salaire ou les vacances en premier — gardez-les pour les tours suivants"]
),

Q("g4", "How would you explain a complex technical concept to a non-technical stakeholder?",
  "Comment expliqueriez-vous un concept technique complexe à un interlocuteur non technique ?",
  "competency", "général", "medium",
  "I use analogies rooted in everyday Moroccan life. For example, when explaining cloud computing to a client, I compared it to how Moroccan medinas work — shared infrastructure (water, electricity) that each shop uses without owning the system. I also use visual aids, keep jargon to a minimum, and check for understanding regularly. In my internship, I presented technical reports to the management committee using simple dashboards instead of raw data, which they appreciated greatly.",
  "J'utilise des analogies ancrées dans la vie quotidienne marocaine. Par exemple, pour expliquer le cloud computing à un client, je l'ai comparé au fonctionnement des médinas marocaines — une infrastructure partagée que chaque boutique utilise sans posséder le système. J'utilise aussi des supports visuels, minimise le jargon et vérifie régulièrement la compréhension. Lors de mon stage, j'ai présenté des rapports techniques avec des tableaux de bord simples au lieu de données brutes.",
  ["Use analogies that resonate with your audience's context", "Avoid condescending simplifications", "Prepare visual aids and summary documents"],
  ["Utilisez des analogies qui résonnent avec le contexte de votre audience", "Évitez les simplifications condescendantes", "Préparez des supports visuels et des documents de synthèse"]
),

Q("g4", "What do you consider the biggest challenge facing young Moroccan professionals today?",
  "Quel est selon vous le plus grand défi des jeunes professionnels marocains aujourd'hui ?",
  "competency", "général", "medium",
  "The biggest challenge is the gap between academic training and market needs. While Moroccan engineering schools provide excellent theoretical foundations, the rapidly evolving tech landscape requires continuous upskilling. Additionally, youth unemployment at around 30% means fierce competition. I address this by combining formal education with practical projects, certifications, and networking through platforms like Moroccan Startups and CGEM events. I believe our generation has the tools to bridge this gap through entrepreneurship and innovation.",
  "Le plus grand défi est l'écart entre la formation académique et les besoins du marché. Bien que les écoles d'ingénieurs marocaines fournissent d'excellentes bases théoriques, le paysage technologique en évolution rapide nécessite une mise à niveau continue. De plus, le chômage des jeunes d'environ 30% implique une concurrence féroce. Je m'y attaque en combinant formation formelle, projets pratiques, certifications et réseautage via des plateformes comme Moroccan Startups et la CGEM.",
  ["Show awareness of systemic challenges without being negative", "Propose solutions, not just problems", "Connect your personal approach to broader solutions"],
  ["Montrez votre conscience des défis systémiques sans être négatif", "Proposez des solutions, pas seulement des problèmes", "Connectez votre approche personnelle à des solutions plus larges"]
),

Q("g4", "How do you prioritize tasks when everything seems urgent?",
  "Comment priorisez-vous les tâches quand tout semble urgent ?",
  "behavioral", "général", "easy",
  "I use a combination of the Eisenhower matrix and the MoSCoW method. I categorize tasks as Must-have, Should-have, Could-have, and Won't-have for this sprint. During my internship at a company in the Casablanca free zone, I managed multiple concurrent requests by meeting with my supervisor each morning to align on priorities. I also use digital tools like Trello and Notion to track progress. The key is communicating proactively when priorities conflict.",
  "J'utilise une combinaison de la matrice d'Eisenhower et de la méthode MoSCoW. Je catégorise les tâches en Must-have, Should-have, Could-have et Won't-have pour ce sprint. Lors de mon stage dans une entreprise de la zone franche de Casablanca, je gérais plusieurs demandes simultanées en faisant un point avec mon superviseur chaque matin. J'utilise aussi des outils comme Trello et Notion. L'essentiel est de communiquer proactivement quand les priorités entrent en conflit.",
  ["Name specific prioritization frameworks you actually use", "Give a real example from work or school", "Show communication skills in managing expectations"],
  ["Nommez des cadres de priorisation que vous utilisez réellement", "Donnez un exemple réel du travail ou des études", "Montrez vos compétences en communication pour gérer les attentes"]
),

Q("g4", "Describe a project you are most proud of and why.",
  "Décrivez un projet dont vous êtes le plus fier et pourquoi.",
  "behavioral", "général", "easy",
  "I am most proud of my PFE project where I developed a predictive maintenance system for a manufacturing plant in Kenitra's automotive zone. Using IoT sensors and machine learning, I built a dashboard that predicted equipment failures 48 hours in advance. This reduced unplanned downtime by 25% and saved the company an estimated 200,000 MAD in the first quarter. I am proud because it combined my technical skills with real industrial impact in Morocco.",
  "Je suis le plus fier de mon projet PFE où j'ai développé un système de maintenance prédictive pour une usine dans la zone automobile de Kénitra. En utilisant des capteurs IoT et du machine learning, j'ai construit un tableau de bord qui prédisait les pannes 48 heures à l'avance. Cela a réduit les temps d'arrêt imprévus de 25% et économisé environ 200 000 MAD au premier trimestre. J'en suis fier car il combinait compétences techniques et impact industriel réel au Maroc.",
  ["Choose a project with measurable impact", "Explain both the technical challenge and the business value", "Show personal ownership and initiative"],
  ["Choisissez un projet avec un impact mesurable", "Expliquez à la fois le défi technique et la valeur commerciale", "Montrez votre responsabilité personnelle et votre initiative"]
),

// ---------------------------------------------------------------------------
// GENIE INFORMATIQUE (30 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you design a scalable e-government platform for Morocco's digital administration?",
  "Comment concevriez-vous une plateforme e-gouvernement évolutive pour l'administration digitale du Maroc ?",
  "technical", "génie-informatique", "hard",
  "I would design a microservices architecture using containerization (Docker/Kubernetes) deployed on a hybrid cloud — combining local data centers for sovereignty compliance with cloud providers for scalability. The platform would support Arabic, French, and Amazigh interfaces. I would implement OAuth 2.0 with national ID integration, use event-driven architecture for inter-ministry communication, and ensure CNDP (Commission Nationale de Contrôle de la Protection des Données) compliance. The tech stack would include a React frontend, Node.js or Spring Boot backend, and PostgreSQL with read replicas for high availability.",
  "Je concevrais une architecture microservices en utilisant la conteneurisation (Docker/Kubernetes) déployée sur un cloud hybride — combinant des data centers locaux pour la souveraineté des données avec des fournisseurs cloud pour la scalabilité. La plateforme supporterait les interfaces arabe, française et amazighe. J'implémenterais OAuth 2.0 avec intégration de la carte d'identité nationale et une architecture événementielle pour la communication interministérielle, en respectant la conformité CNDP.",
  ["Show knowledge of Morocco's data sovereignty requirements (CNDP)", "Address multilingual and RTL support", "Consider connectivity challenges in rural Morocco"],
  ["Montrez votre connaissance des exigences de souveraineté des données (CNDP)", "Adressez le support multilingue et RTL", "Considérez les défis de connectivité dans le Maroc rural"]
),

Q("g4", "Explain how you would implement a CI/CD pipeline for a Moroccan fintech startup.",
  "Expliquez comment vous implémenteriez un pipeline CI/CD pour une startup fintech marocaine.",
  "technical", "génie-informatique", "medium",
  "I would set up a GitLab CI/CD pipeline with stages: lint, unit tests, integration tests, security scan (SAST/DAST), build, deploy to staging, and production deployment with blue-green strategy. For a Moroccan fintech, I would add compliance checks for Bank Al-Maghrib regulations and ensure the pipeline runs security scans for OWASP Top 10 vulnerabilities. I would use Docker for containerization, Terraform for infrastructure as code, and implement monitoring with Prometheus and Grafana. Deployment would target a Moroccan cloud provider or a regional data center for data residency compliance.",
  "Je mettrais en place un pipeline GitLab CI/CD avec les étapes : lint, tests unitaires, tests d'intégration, scan de sécurité (SAST/DAST), build, déploiement en staging et production avec stratégie blue-green. Pour une fintech marocaine, j'ajouterais des vérifications de conformité aux réglementations de Bank Al-Maghrib et des scans de sécurité OWASP Top 10. J'utiliserais Docker, Terraform pour l'IaC et le monitoring avec Prometheus et Grafana.",
  ["Emphasize security and regulatory compliance for financial services", "Show knowledge of Bank Al-Maghrib requirements", "Include automated testing at every stage"],
  ["Soulignez la sécurité et la conformité réglementaire pour les services financiers", "Montrez votre connaissance des exigences de Bank Al-Maghrib", "Incluez des tests automatisés à chaque étape"]
),

Q("g4", "What is your experience with cloud platforms, and how would you choose one for a Moroccan enterprise?",
  "Quelle est votre expérience avec les plateformes cloud, et comment en choisiriez-vous une pour une entreprise marocaine ?",
  "technical", "génie-informatique", "medium",
  "I have worked with AWS during my internship and explored Azure through Microsoft's student program. For a Moroccan enterprise, the choice depends on several factors: data sovereignty requirements (CNDP compliance may require local hosting), existing partnerships, cost structure, and technical needs. AWS has no Moroccan region yet, but Azure has partnerships with local providers. I would also consider OVHcloud which has data centers in Morocco. For government projects, a hybrid approach with local data centers for sensitive data and public cloud for scalable workloads is often the best strategy.",
  "J'ai travaillé avec AWS pendant mon stage et exploré Azure via le programme étudiant Microsoft. Pour une entreprise marocaine, le choix dépend de plusieurs facteurs : exigences de souveraineté des données (la conformité CNDP peut nécessiter un hébergement local), partenariats existants, structure de coûts et besoins techniques. AWS n'a pas encore de région marocaine, mais Azure a des partenariats locaux. Je considérerais aussi OVHcloud qui a des data centers au Maroc.",
  ["Show awareness of data sovereignty laws (Loi 09-08)", "Compare specific cloud providers with Moroccan market presence", "Consider cost optimization for Moroccan enterprises"],
  ["Montrez votre connaissance des lois de souveraineté des données (Loi 09-08)", "Comparez les fournisseurs cloud avec une présence au Maroc", "Considérez l'optimisation des coûts pour les entreprises marocaines"]
),

Q("g4", "How would you secure a web application handling Moroccan citizens' personal data?",
  "Comment sécuriseriez-vous une application web traitant les données personnelles des citoyens marocains ?",
  "technical", "génie-informatique", "hard",
  "I would implement a defense-in-depth strategy: HTTPS everywhere with HSTS, input validation against injection attacks, parameterized queries, CSRF tokens, Content Security Policy headers. For authentication, I would use OAuth 2.0 with MFA. Data at rest would be encrypted with AES-256, and I would implement field-level encryption for sensitive data like national ID numbers. I would ensure CNDP compliance under Morocco's Loi 09-08 on personal data protection, including data minimization, purpose limitation, and right to access. Regular penetration testing and security audits would be mandatory.",
  "J'implémenterais une stratégie de défense en profondeur : HTTPS partout avec HSTS, validation des entrées, requêtes paramétrées, tokens CSRF, headers CSP. Pour l'authentification, OAuth 2.0 avec MFA. Chiffrement AES-256 pour les données au repos et chiffrement au niveau des champs pour les données sensibles. J'assurerais la conformité CNDP sous la Loi 09-08 sur la protection des données personnelles, incluant minimisation des données et droit d'accès. Tests de pénétration réguliers obligatoires.",
  ["Reference Morocco's Loi 09-08 specifically", "Show knowledge of CNDP compliance requirements", "Cover both technical and legal aspects of data protection"],
  ["Référencez spécifiquement la Loi 09-08 du Maroc", "Montrez votre connaissance des exigences CNDP", "Couvrez les aspects techniques et juridiques de la protection des données"]
),

Q("g4", "Describe the architecture you would use for a mobile banking app targeting Moroccan users.",
  "Décrivez l'architecture que vous utiliseriez pour une application de banque mobile ciblant les utilisateurs marocains.",
  "technical", "génie-informatique", "hard",
  "I would use React Native or Flutter for cross-platform development to reach both Android (dominant in Morocco at 85%) and iOS users. The backend would be a microservices architecture with Node.js/Spring Boot, using REST APIs with rate limiting. For payments, I would integrate with Morocco's existing systems: CMI for card payments, M-Wallet for mobile payments, and bank APIs. Security would include biometric authentication, SSL pinning, and encryption. Offline support is crucial given connectivity gaps in rural areas. I would implement a caching layer and sync mechanism for areas with poor 4G coverage.",
  "J'utiliserais React Native ou Flutter pour le développement cross-platform afin d'atteindre les utilisateurs Android (dominant au Maroc à 85%) et iOS. Le backend serait en microservices avec Node.js/Spring Boot. Pour les paiements, j'intégrerais les systèmes marocains existants : CMI pour les cartes, M-Wallet pour le mobile et les APIs bancaires. La sécurité inclurait l'authentification biométrique, le SSL pinning et le chiffrement. Le support hors ligne est crucial vu les lacunes de connectivité en zones rurales.",
  ["Show knowledge of Morocco's payment ecosystem (CMI, M-Wallet)", "Address offline-first architecture for rural coverage", "Consider Android dominance in the Moroccan market"],
  ["Montrez votre connaissance de l'écosystème de paiement marocain (CMI, M-Wallet)", "Adressez l'architecture offline-first pour la couverture rurale", "Considérez la dominance Android sur le marché marocain"]
),

Q("g4", "How would you approach building an AI-powered chatbot that understands Darija (Moroccan Arabic)?",
  "Comment aborderiez-vous la construction d'un chatbot IA qui comprend le darija (arabe marocain) ?",
  "technical", "génie-informatique", "hard",
  "Darija NLP is challenging due to limited labeled datasets and code-switching between Arabic, French, and Spanish. I would start with a multilingual LLM like AraBERT or BLOOM, fine-tuned on Darija data. I would collect training data from Moroccan social media, call centers, and user interactions. For code-switching handling, I would implement a language detection layer. I would use transfer learning from Modern Standard Arabic and French models. The chatbot would need to handle Darija written in both Arabic script and Latin transliteration (Arabizi). I would collaborate with Moroccan linguistics researchers at universities like UM6P or UIR.",
  "Le NLP en darija est difficile en raison du manque de jeux de données labellisés et du code-switching entre arabe, français et espagnol. Je commencerais avec un LLM multilingue comme AraBERT ou BLOOM, fine-tuné sur des données darija. Je collecterais des données d'entraînement des réseaux sociaux marocains et centres d'appels. Pour le code-switching, j'implémenterais une couche de détection de langue. Le chatbot devrait gérer le darija en écriture arabe et translittération latine (Arabizi).",
  ["Acknowledge the unique challenges of Darija NLP", "Show awareness of available Moroccan Arabic datasets", "Consider code-switching between Darija, French, and Arabic"],
  ["Reconnaissez les défis uniques du NLP en darija", "Montrez votre connaissance des jeux de données disponibles", "Considérez le code-switching entre darija, français et arabe"]
),

Q("g4", "What is your approach to database design for a large-scale Moroccan e-commerce platform?",
  "Quelle est votre approche de la conception de base de données pour une plateforme e-commerce marocaine à grande échelle ?",
  "technical", "génie-informatique", "medium",
  "I would use a polyglot persistence approach: PostgreSQL for transactional data (orders, payments), MongoDB for product catalogs that vary in structure, Redis for caching and session management, and Elasticsearch for product search with Arabic/French text analysis. I would design for the Moroccan market specifics: multi-currency support (MAD as primary), Arabic/French product descriptions, address formats compatible with Morocco's postal system, and integration with local delivery services like Amana Express. Sharding strategy would consider geographic distribution across Morocco's regions.",
  "J'utiliserais une approche polyglotte : PostgreSQL pour les données transactionnelles, MongoDB pour les catalogues produits variables, Redis pour le cache et les sessions, et Elasticsearch pour la recherche produit avec analyse de texte arabe/français. Je concevrais pour les spécificités marocaines : support multi-devises (MAD comme principale), descriptions en arabe/français, formats d'adresse compatibles avec la poste marocaine et intégration avec les services de livraison locaux comme Amana Express.",
  ["Show knowledge of Morocco-specific e-commerce challenges", "Consider payment integration (CMI, CashPlus, M-Wallet)", "Address performance for peak periods like Ramadan shopping"],
  ["Montrez votre connaissance des défis e-commerce spécifiques au Maroc", "Considérez l'intégration de paiement (CMI, CashPlus, M-Wallet)", "Adressez la performance pour les périodes de pointe comme le shopping du Ramadan"]
),

Q("g4", "How do you ensure code quality in a team environment?",
  "Comment assurez-vous la qualité du code dans un environnement d'équipe ?",
  "competency", "génie-informatique", "easy",
  "I implement multiple quality gates: mandatory code reviews via pull requests, automated linting and formatting (ESLint, Prettier or Biome), comprehensive test suites with minimum 80% coverage, and CI/CD pipelines that block merges on failing checks. I also advocate for pair programming sessions, especially for complex features. At IMTA, I introduced these practices in our project team, which reduced bug reports by 40%. I use tools like SonarQube for static analysis and maintain clear coding standards documented in the project's contributing guide.",
  "J'implémente plusieurs portes de qualité : revues de code obligatoires via pull requests, linting et formatage automatisés (ESLint, Prettier ou Biome), suites de tests avec minimum 80% de couverture et pipelines CI/CD qui bloquent les merges en cas d'échec. Je préconise aussi des sessions de pair programming. À l'IMTA, j'ai introduit ces pratiques dans notre équipe de projet, ce qui a réduit les rapports de bugs de 40%. J'utilise SonarQube pour l'analyse statique.",
  ["Name specific tools and metrics you use", "Give quantifiable improvements from past experience", "Show both automated and human quality processes"],
  ["Nommez des outils et métriques spécifiques que vous utilisez", "Donnez des améliorations quantifiables de votre expérience passée", "Montrez des processus de qualité automatisés et humains"]
),

Q("g4", "Explain the concept of microservices and when you would use them versus a monolith.",
  "Expliquez le concept des microservices et quand les utiliser par rapport à un monolithe.",
  "technical", "génie-informatique", "medium",
  "Microservices decompose an application into small, independently deployable services, each owning its data and communicating via APIs. I would recommend a monolith-first approach for Moroccan startups — it is simpler, faster to develop, and requires less DevOps expertise. Microservices make sense when the team grows beyond 8-10 developers, when different components need to scale independently, or when using different tech stacks for different services. For example, a Moroccan e-commerce platform might start as a monolith and extract payment processing and inventory management into separate services as volume grows.",
  "Les microservices décomposent une application en petits services indépendamment déployables, chacun gérant ses données et communiquant via des APIs. Je recommanderais une approche monolithe-first pour les startups marocaines — c'est plus simple, plus rapide à développer et nécessite moins d'expertise DevOps. Les microservices sont pertinents quand l'équipe dépasse 8-10 développeurs ou quand différents composants doivent scaler indépendamment. Par exemple, une plateforme e-commerce marocaine pourrait commencer en monolithe puis extraire le traitement des paiements.",
  ["Show pragmatism — not every project needs microservices", "Give clear criteria for when to transition", "Consider the team size and DevOps maturity"],
  ["Montrez du pragmatisme — tous les projets ne nécessitent pas des microservices", "Donnez des critères clairs pour la transition", "Considérez la taille de l'équipe et la maturité DevOps"]
),

Q("g4", "How would you optimize the performance of a slow web application?",
  "Comment optimiseriez-vous les performances d'une application web lente ?",
  "technical", "génie-informatique", "medium",
  "I follow a systematic approach: first, measure with tools like Lighthouse, Chrome DevTools, and server-side APM. Common optimizations include: implementing CDN caching (CloudFlare has Moroccan PoPs), optimizing database queries with proper indexing, implementing lazy loading for images and components, using code splitting and tree shaking, adding Redis caching for frequent queries, compressing assets with gzip/brotli, and optimizing critical rendering path. For Moroccan users specifically, I would ensure the app works well on slower 3G connections common in rural areas by implementing progressive enhancement and service workers.",
  "Je suis une approche systématique : d'abord mesurer avec Lighthouse, Chrome DevTools et un APM côté serveur. Les optimisations courantes incluent : CDN caching (CloudFlare a des PoPs marocains), optimisation des requêtes DB avec indexation, lazy loading des images, code splitting, cache Redis, compression gzip/brotli et optimisation du chemin de rendu critique. Pour les utilisateurs marocains, j'assurerais le bon fonctionnement sur les connexions 3G plus lentes des zones rurales via progressive enhancement et service workers.",
  ["Always measure before optimizing — data-driven decisions", "Consider Moroccan internet infrastructure constraints", "Address both frontend and backend optimizations"],
  ["Mesurez toujours avant d'optimiser — décisions basées sur les données", "Considérez les contraintes d'infrastructure internet marocaine", "Adressez les optimisations frontend et backend"]
),

Q("g4", "What experience do you have with DevOps practices and tools?",
  "Quelle expérience avez-vous avec les pratiques et outils DevOps ?",
  "competency", "génie-informatique", "easy",
  "During my studies at IMTA and my internship, I gained hands-on experience with Docker for containerization, GitLab CI/CD for automated pipelines, and basic Kubernetes for orchestration. I have set up monitoring dashboards with Grafana and used Ansible for server configuration. I understand the DevOps culture of breaking silos between development and operations. For my PFE, I implemented a complete CI/CD pipeline that reduced deployment time from 2 hours of manual work to 15 minutes of automated delivery, including automated tests and security scans.",
  "Pendant mes études à l'IMTA et mon stage, j'ai acquis une expérience pratique avec Docker pour la conteneurisation, GitLab CI/CD pour les pipelines automatisés et Kubernetes de base pour l'orchestration. J'ai mis en place des tableaux de bord de monitoring avec Grafana et utilisé Ansible pour la configuration serveur. Pour mon PFE, j'ai implémenté un pipeline CI/CD complet qui a réduit le temps de déploiement de 2 heures de travail manuel à 15 minutes de livraison automatisée.",
  ["Name specific tools with practical experience", "Quantify improvements from DevOps adoption", "Show understanding of DevOps culture, not just tools"],
  ["Nommez des outils spécifiques avec expérience pratique", "Quantifiez les améliorations de l'adoption DevOps", "Montrez votre compréhension de la culture DevOps, pas seulement des outils"]
),

Q("g4", "How would you implement real-time features for a collaborative application?",
  "Comment implémenteriez-vous des fonctionnalités temps réel pour une application collaborative ?",
  "technical", "génie-informatique", "medium",
  "I would use WebSocket connections via Socket.IO or native WebSocket API for real-time bidirectional communication. For a collaborative document editor, I would implement Operational Transform (OT) or CRDT-based conflict resolution. The backend would use Redis Pub/Sub for message distribution across multiple server instances. For presence features (who is online, typing indicators), I would use lightweight heartbeat mechanisms. I would also implement graceful fallback to long-polling for users on unstable Moroccan mobile networks, ensuring the app remains functional even with intermittent connectivity.",
  "J'utiliserais des connexions WebSocket via Socket.IO pour la communication bidirectionnelle en temps réel. Pour un éditeur de documents collaboratif, j'implémenterais la Transformation Opérationnelle (OT) ou la résolution de conflits basée sur les CRDT. Le backend utiliserait Redis Pub/Sub pour la distribution des messages. Pour les fonctionnalités de présence, j'utiliserais des mécanismes de heartbeat légers. J'implémenterais aussi un fallback vers le long-polling pour les utilisateurs sur des réseaux mobiles marocains instables.",
  ["Show knowledge of different real-time protocols", "Address scalability for concurrent users", "Consider network reliability in the Moroccan context"],
  ["Montrez votre connaissance des différents protocoles temps réel", "Adressez la scalabilité pour les utilisateurs simultanés", "Considérez la fiabilité réseau dans le contexte marocain"]
),

Q("g4", "What is your understanding of the Maroc Digital 2030 strategy and its implications for IT professionals?",
  "Quelle est votre compréhension de la stratégie Maroc Digital 2030 et ses implications pour les professionnels IT ?",
  "competency", "génie-informatique", "medium",
  "Maroc Digital 2030 aims to position Morocco as a digital hub in Africa through three pillars: digital government, digital economy, and digital inclusion. For IT professionals, this means growing demand in cloud infrastructure, cybersecurity, data analytics, and AI. The strategy targets creating 240,000 digital jobs and training 100,000 developers by 2030. It also emphasizes Morocco's role as a nearshore destination for European companies. For me, this means opportunities in digital transformation projects, smart city initiatives, and building platforms that serve both Moroccan citizens and pan-African markets.",
  "Maroc Digital 2030 vise à positionner le Maroc comme hub digital en Afrique à travers trois piliers : gouvernement digital, économie digitale et inclusion digitale. Pour les professionnels IT, cela signifie une demande croissante en infrastructure cloud, cybersécurité, analyse de données et IA. La stratégie cible la création de 240 000 emplois digitaux et la formation de 100 000 développeurs d'ici 2030. Pour moi, cela signifie des opportunités dans la transformation digitale, les smart cities et les plateformes pan-africaines.",
  ["Reference specific targets and pillars of the strategy", "Connect the strategy to your personal career trajectory", "Show awareness of Morocco's positioning as Africa's tech gateway"],
  ["Référencez les cibles et piliers spécifiques de la stratégie", "Connectez la stratégie à votre trajectoire de carrière", "Montrez votre conscience du positionnement du Maroc comme passerelle tech africaine"]
),

Q("g4", "How would you handle a production outage affecting thousands of Moroccan users?",
  "Comment géreriez-vous une panne de production affectant des milliers d'utilisateurs marocains ?",
  "situational", "génie-informatique", "hard",
  "I would follow an incident response protocol: 1) Acknowledge and communicate — notify stakeholders and set up a war room. 2) Triage — assess severity and impact on users. 3) Mitigate — implement quick fixes like rolling back to last stable version or switching to backup systems. 4) Root cause analysis — use logs, metrics, and traces to identify the issue. 5) Fix and verify — implement the permanent fix with proper testing. 6) Post-mortem — document lessons learned and preventive measures. Communication is critical — I would post status updates on social media in both French and Arabic, as Moroccan users expect real-time transparency.",
  "Je suivrais un protocole de réponse aux incidents : 1) Reconnaître et communiquer — notifier les parties prenantes. 2) Triage — évaluer la sévérité et l'impact. 3) Atténuer — implémenter des correctifs rapides comme le rollback. 4) Analyse de cause racine — utiliser les logs et métriques. 5) Corriger et vérifier. 6) Post-mortem — documenter les leçons apprises. La communication est critique — je posterais des mises à jour en français et arabe, les utilisateurs marocains s'attendant à la transparence en temps réel.",
  ["Show a structured incident response methodology", "Emphasize communication with users in their language", "Include post-mortem as a learning opportunity"],
  ["Montrez une méthodologie structurée de réponse aux incidents", "Soulignez la communication avec les utilisateurs dans leur langue", "Incluez le post-mortem comme opportunité d'apprentissage"]
),

Q("g4", "Explain the difference between SQL and NoSQL databases with practical examples.",
  "Expliquez la différence entre les bases de données SQL et NoSQL avec des exemples pratiques.",
  "technical", "génie-informatique", "easy",
  "SQL databases (PostgreSQL, MySQL) use structured tables with relationships, ACID transactions, and a fixed schema. They are ideal for transactional systems like banking applications at Attijariwafa Bank or CIH. NoSQL databases come in several types: document stores (MongoDB) for flexible product catalogs, key-value stores (Redis) for caching, column-family (Cassandra) for time-series data, and graph databases (Neo4j) for social networks. In my projects, I used PostgreSQL for user data and MongoDB for storing heterogeneous sensor readings in an IoT project. The choice depends on data structure, consistency needs, and scale requirements.",
  "Les bases SQL (PostgreSQL, MySQL) utilisent des tables structurées avec des relations, des transactions ACID et un schéma fixe. Elles sont idéales pour les systèmes transactionnels comme les applications bancaires d'Attijariwafa Bank ou CIH. Les bases NoSQL se déclinent en plusieurs types : document (MongoDB) pour les catalogues produits flexibles, clé-valeur (Redis) pour le cache, colonnes (Cassandra) pour les séries temporelles et graphe (Neo4j) pour les réseaux sociaux. Le choix dépend de la structure des données et des besoins de cohérence.",
  ["Give concrete examples relevant to Moroccan companies", "Show knowledge of when to use each type", "Mention practical experience with specific databases"],
  ["Donnez des exemples concrets pertinents pour les entreprises marocaines", "Montrez quand utiliser chaque type", "Mentionnez votre expérience pratique avec des bases spécifiques"]
),

Q("g4", "What testing strategies do you use in software development?",
  "Quelles stratégies de test utilisez-vous en développement logiciel ?",
  "competency", "génie-informatique", "easy",
  "I follow the testing pyramid: many unit tests at the base (using Jest or Vitest), fewer integration tests in the middle (testing API endpoints with Supertest), and selective end-to-end tests at the top (using Playwright or Cypress). I also practice TDD for critical business logic. In my internship, I set up a testing suite that achieved 85% code coverage and caught 3 critical bugs before they reached production. I believe in testing realistic scenarios — using real databases in test environments rather than mocks when possible, which is especially important for Moroccan banking and e-gov applications where reliability is paramount.",
  "Je suis la pyramide de tests : beaucoup de tests unitaires à la base (Jest ou Vitest), moins de tests d'intégration au milieu (endpoints API avec Supertest) et des tests end-to-end sélectifs au sommet (Playwright ou Cypress). Je pratique aussi le TDD pour la logique métier critique. Lors de mon stage, j'ai mis en place une suite de tests avec 85% de couverture qui a détecté 3 bugs critiques avant la production. Je crois aux scénarios réalistes — bases de données réelles plutôt que des mocks.",
  ["Show knowledge of the testing pyramid", "Mention specific tools and frameworks", "Quantify the impact of testing on code quality"],
  ["Montrez votre connaissance de la pyramide de tests", "Mentionnez des outils et frameworks spécifiques", "Quantifiez l'impact des tests sur la qualité du code"]
),

// ---------------------------------------------------------------------------
// GENIE CIVIL (25 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you approach structural analysis for a building in a seismic zone like Al Hoceima?",
  "Comment aborderiez-vous l'analyse structurale d'un bâtiment dans une zone sismique comme Al Hoceima ?",
  "technical", "génie-civil", "hard",
  "Morocco's seismic code RPS 2011 classifies Al Hoceima as Zone 3 (high risk). I would design following RPS 2011 provisions with dynamic spectral analysis using ETABS or Robot Structural Analysis. Key considerations: ductile moment-resisting frames, shear wall placement, soft story prevention, and foundation design accounting for soil liquefaction risk. I would also reference the 2004 Al Hoceima earthquake (magnitude 6.4) lessons. Material selection would favor high-strength concrete with enhanced reinforcement detailing. Regular quality control during construction would be essential given the high-stakes nature of seismic-resistant construction.",
  "Le code sismique marocain RPS 2011 classe Al Hoceima en Zone 3 (risque élevé). Je concevrais selon les dispositions RPS 2011 avec une analyse spectrale dynamique via ETABS ou Robot. Considérations clés : portiques ductiles, voiles de contreventement, prévention de l'étage souple et conception des fondations tenant compte du risque de liquéfaction. Je référencerais aussi les leçons du séisme de 2004 (magnitude 6,4). La sélection des matériaux favoriserait le béton haute résistance avec détails d'armature renforcés.",
  ["Reference Morocco's RPS 2011 seismic code specifically", "Show knowledge of Al Hoceima's seismic history", "Mention specific software tools used for analysis"],
  ["Référencez spécifiquement le code sismique RPS 2011 du Maroc", "Montrez votre connaissance de l'histoire sismique d'Al Hoceima", "Mentionnez les logiciels spécifiques utilisés pour l'analyse"]
),

Q("g4", "Describe the challenges and solutions for building infrastructure in Morocco's Atlas Mountains region.",
  "Décrivez les défis et solutions pour construire des infrastructures dans la région de l'Atlas marocain.",
  "technical", "génie-civil", "hard",
  "Atlas Mountain construction faces challenges: extreme terrain gradients, harsh winter conditions, seismic activity, difficult access for heavy machinery, and sensitive ecosystems. Solutions include: using precast concrete elements transported by smaller vehicles, designing retaining walls with soil nailing for slope stability, implementing drainage systems for snowmelt management, and using local stone for facing to blend with the environment. Post-earthquake Al Haouz (2023) reconstruction taught us the importance of reinforced masonry and seismic base isolation for critical buildings. Community engagement is also essential for culturally sensitive construction in Amazigh villages.",
  "La construction dans l'Atlas fait face à des défis : pentes extrêmes, conditions hivernales rudes, activité sismique, accès difficile pour les engins et écosystèmes sensibles. Solutions : éléments préfabriqués transportables par petits véhicules, murs de soutènement avec clouage du sol, systèmes de drainage pour la fonte des neiges et pierre locale pour l'intégration paysagère. La reconstruction post-séisme d'Al Haouz (2023) a enseigné l'importance de la maçonnerie renforcée et de l'isolation sismique pour les bâtiments critiques.",
  ["Reference the 2023 Al Haouz earthquake and its lessons", "Show environmental sensitivity in mountain construction", "Consider accessibility and logistics challenges"],
  ["Référencez le séisme d'Al Haouz 2023 et ses leçons", "Montrez une sensibilité environnementale dans la construction en montagne", "Considérez les défis d'accessibilité et de logistique"]
),

Q("g4", "What do you know about the TGV Al Boraq project and its engineering challenges?",
  "Que savez-vous du projet TGV Al Boraq et de ses défis d'ingénierie ?",
  "competency", "génie-civil", "medium",
  "Al Boraq is Africa's first high-speed rail, connecting Tanger to Casablanca at 320 km/h over 186 km. Engineering challenges included: constructing 12 viaducts and bridges across the Gharb plain (soft alluvial soil requiring deep foundations), building a 5 km tunnel near Tanger, managing the transition from high-speed to conventional tracks, and adapting French LGV standards to Moroccan climate conditions. The project required innovative ground stabilization techniques for the marshy terrain near Kenitra. The extension to Marrakech will face different challenges including the Haouz plain's arid conditions and crossing the Oum Er-Rbia river.",
  "Al Boraq est le premier TGV d'Afrique, reliant Tanger à Casablanca à 320 km/h sur 186 km. Les défis d'ingénierie incluaient : construction de 12 viaducs à travers la plaine du Gharb (sol alluvial mou nécessitant des fondations profondes), tunnel de 5 km près de Tanger, transition du réseau grande vitesse au conventionnel et adaptation des standards LGV français au climat marocain. L'extension vers Marrakech posera des défis différents avec les conditions arides de la plaine du Haouz.",
  ["Show specific technical knowledge about the project", "Mention the extension plans and future challenges", "Reference the collaboration with French expertise (SNCF/ONCF)"],
  ["Montrez des connaissances techniques spécifiques sur le projet", "Mentionnez les plans d'extension et défis futurs", "Référencez la collaboration avec l'expertise française (SNCF/ONCF)"]
),

Q("g4", "How would you manage quality control on a large construction site in Morocco?",
  "Comment géreriez-vous le contrôle qualité sur un grand chantier de construction au Maroc ?",
  "competency", "génie-civil", "medium",
  "I would implement a comprehensive QA/QC plan following Moroccan standards (NM ISO 9001) and project specifications. This includes: concrete testing (slump test, compression test at 7 and 28 days per NM 10.1.008), steel reinforcement inspection (bar placement, cover depth, lap lengths), soil compaction tests (Proctor test), and structural integrity checks at key milestones. I would use a digital documentation system for test reports and non-conformance tracking. Regular coordination with the Bureau de Contrôle (LPEE, Bureau Veritas Maroc) is essential. I would also conduct daily site inspections and hold weekly quality review meetings with the construction team.",
  "J'implémenterais un plan QA/QC complet suivant les normes marocaines (NM ISO 9001). Cela inclut : essais béton (affaissement, compression à 7 et 28 jours selon NM 10.1.008), inspection des armatures, essais de compactage (Proctor) et vérifications d'intégrité structurelle. J'utiliserais un système numérique pour les rapports d'essais et le suivi des non-conformités. La coordination régulière avec le Bureau de Contrôle (LPEE, Bureau Veritas Maroc) est essentielle. Inspections quotidiennes et réunions qualité hebdomadaires.",
  ["Reference specific Moroccan norms (NM) and testing standards", "Mention coordination with LPEE and control bureaus", "Show knowledge of both French and Moroccan construction standards"],
  ["Référencez les normes marocaines (NM) et standards d'essai spécifiques", "Mentionnez la coordination avec le LPEE", "Montrez votre connaissance des normes françaises et marocaines"]
),

Q("g4", "Explain how you would design a water management system for a new housing development in a water-scarce region of Morocco.",
  "Expliquez comment vous concevriez un système de gestion de l'eau pour un nouveau lotissement dans une région aride du Maroc.",
  "technical", "génie-civil", "hard",
  "Given Morocco's water stress, I would design an integrated water management system: rainwater harvesting with underground cisterns (inspired by traditional khettaras), greywater recycling for garden irrigation, water-efficient fixtures (dual flush, low-flow), and smart metering for consumption monitoring. I would comply with ONEE standards and the national water plan (Plan National de l'Eau 2020-2050). The wastewater treatment would use membrane bioreactors for compact, high-quality treatment. I would also design drought-resistant landscaping using native Moroccan plants and implement a stormwater management system with permeable pavements and bioswales.",
  "Vu le stress hydrique du Maroc, je concevrais un système intégré : récupération des eaux pluviales avec citernes souterraines (inspirées des khettaras traditionnelles), recyclage des eaux grises pour l'irrigation, équipements hydro-économes et comptage intelligent. Je me conformerais aux normes ONEE et au Plan National de l'Eau 2020-2050. Le traitement des eaux usées utiliserait des bioréacteurs à membrane. J'utiliserais aussi un aménagement paysager résistant à la sécheresse avec des plantes natives marocaines.",
  ["Reference Morocco's water crisis and national water plan", "Show knowledge of traditional Moroccan water systems (khettaras)", "Include both modern technology and traditional wisdom"],
  ["Référencez la crise de l'eau du Maroc et le plan national", "Montrez votre connaissance des systèmes d'eau traditionnels (khettaras)", "Incluez technologie moderne et sagesse traditionnelle"]
),

Q("g4", "What role does BIM play in modern construction projects in Morocco?",
  "Quel rôle joue le BIM dans les projets de construction modernes au Maroc ?",
  "competency", "génie-civil", "medium",
  "BIM (Building Information Modeling) is gaining traction in Morocco, particularly in large-scale projects. I have experience with Revit and AutoCAD. BIM enables clash detection between structural, MEP, and architectural elements before construction, reducing costly rework. In Morocco, BIM adoption is being driven by major developers like ADDOHA and CGI for their housing projects, and by international projects requiring BIM deliverables. Challenges include the need for trained professionals and the transition cost for smaller firms. I see BIM as essential for Morocco's construction industry modernization, especially for projects like the new Mohammed VI Tower in Rabat.",
  "Le BIM prend de l'ampleur au Maroc, particulièrement dans les grands projets. J'ai de l'expérience avec Revit et AutoCAD. Le BIM permet la détection des conflits entre éléments structurels, MEP et architecturaux avant la construction, réduisant les reprises coûteuses. Au Maroc, l'adoption est portée par des promoteurs comme ADDOHA et CGI. Les défis incluent le besoin de professionnels formés et le coût de transition pour les petites entreprises. Le BIM est essentiel pour la modernisation de la construction au Maroc.",
  ["Show hands-on experience with BIM software", "Reference specific Moroccan construction companies adopting BIM", "Discuss both benefits and challenges of BIM adoption in Morocco"],
  ["Montrez votre expérience pratique avec les logiciels BIM", "Référencez des entreprises marocaines adoptant le BIM", "Discutez les avantages et défis de l'adoption du BIM au Maroc"]
),

Q("g4", "How do you ensure environmental compliance in construction projects in Morocco?",
  "Comment assurez-vous la conformité environnementale dans les projets de construction au Maroc ?",
  "competency", "génie-civil", "medium",
  "I ensure compliance with Morocco's Loi 12-03 on Environmental Impact Assessment (EIA) and Loi 11-03 on environmental protection. For any project requiring an EIA, I coordinate the study with accredited environmental consultants and submit to the regional environmental committee. Key aspects include: air quality monitoring during construction, proper waste management (especially hazardous materials), noise control in residential areas, protection of water resources and wetlands, and archaeological surveys when building near historical sites. I also integrate sustainability measures like LEED or HQE certification standards, increasingly demanded by Moroccan clients.",
  "J'assure la conformité avec la Loi 12-03 sur les Études d'Impact Environnemental et la Loi 11-03 sur la protection de l'environnement. Pour les projets nécessitant une EIE, je coordonne l'étude avec des consultants accrédités. Les aspects clés incluent : surveillance de la qualité de l'air, gestion des déchets, contrôle du bruit, protection des ressources en eau et des zones humides, et prospections archéologiques près des sites historiques. J'intègre aussi les certifications LEED ou HQE, de plus en plus demandées.",
  ["Reference specific Moroccan environmental laws", "Show knowledge of the EIA process", "Mention sustainability certifications relevant in Morocco"],
  ["Référencez des lois environnementales marocaines spécifiques", "Montrez votre connaissance du processus EIE", "Mentionnez les certifications de durabilité pertinentes au Maroc"]
),

Q("g4", "Describe the Tanger Med port expansion and its engineering significance.",
  "Décrivez l'expansion du port Tanger Med et sa signification en ingénierie.",
  "competency", "génie-civil", "medium",
  "Tanger Med is one of the largest ports in Africa and the Mediterranean, handling over 7 million TEU containers annually. The Tanger Med 2 expansion added 2 new container terminals with a capacity of 6 million TEU. Engineering achievements include: massive breakwaters built in deep water conditions, automated container handling systems, integrated logistics platforms, and LNG terminal construction. The port's strategic location at the Strait of Gibraltar intersection required complex hydrodynamic studies. The project also includes a 1,000-hectare industrial free zone that has attracted major manufacturers like Renault and Boeing, creating an integrated port-industry ecosystem.",
  "Tanger Med est l'un des plus grands ports d'Afrique et de Méditerranée, traitant plus de 7 millions d'EVP par an. L'expansion Tanger Med 2 a ajouté 2 terminaux à conteneurs d'une capacité de 6 millions d'EVP. Les réalisations d'ingénierie incluent : brise-lames massifs en eaux profondes, manutention automatisée des conteneurs, plateformes logistiques intégrées et terminal GNL. La localisation stratégique au détroit de Gibraltar a nécessité des études hydrodynamiques complexes.",
  ["Show knowledge of specific engineering achievements", "Reference the economic impact on northern Morocco", "Mention the industrial free zone integration"],
  ["Montrez des connaissances sur les réalisations d'ingénierie spécifiques", "Référencez l'impact économique sur le nord du Maroc", "Mentionnez l'intégration de la zone franche industrielle"]
),

// ---------------------------------------------------------------------------
// GENIE ELECTRIQUE (25 questions)
// ---------------------------------------------------------------------------
Q("g4", "Explain the Noor Ouarzazate solar complex and its technical innovations.",
  "Expliquez le complexe solaire Noor Ouarzazate et ses innovations techniques.",
  "technical", "génie-électrique", "hard",
  "Noor Ouarzazate is one of the world's largest concentrated solar power (CSP) complexes with a combined capacity of 580 MW. Noor I uses parabolic trough technology with 3 hours of thermal storage using molten salt. Noor II also uses parabolic troughs but with 7 hours of storage. Noor III introduced the first central tower CSP in Africa at 150 MW with 7.5 hours of storage, achieving temperatures above 560°C. Noor IV added 72 MW of photovoltaic capacity. The molten salt storage system is the key innovation, enabling electricity generation after sunset. The project is managed by MASEN and positions Morocco as a leader in renewable energy with the target of 52% renewable capacity by 2030.",
  "Noor Ouarzazate est l'un des plus grands complexes solaires à concentration (CSP) au monde avec une capacité combinée de 580 MW. Noor I utilise la technologie de capteurs cylindro-paraboliques avec 3 heures de stockage thermique au sel fondu. Noor III a introduit la première tour CSP d'Afrique à 150 MW avec 7,5 heures de stockage, atteignant des températures supérieures à 560°C. Le stockage au sel fondu est l'innovation clé. Le projet positionne le Maroc en leader des énergies renouvelables avec l'objectif de 52% de capacité renouvelable d'ici 2030.",
  ["Detail the different Noor phases and their technologies", "Explain the thermal storage innovation with molten salt", "Reference MASEN and Morocco's 52% renewable energy target"],
  ["Détaillez les différentes phases de Noor et leurs technologies", "Expliquez l'innovation du stockage thermique au sel fondu", "Référencez MASEN et l'objectif de 52% d'énergie renouvelable"]
),

Q("g4", "How would you design an electrical distribution network for a new industrial zone in Morocco?",
  "Comment concevriez-vous un réseau de distribution électrique pour une nouvelle zone industrielle au Maroc ?",
  "technical", "génie-électrique", "hard",
  "I would follow ONEE standards and IEC norms for the design. Starting with load estimation for each industrial unit, I would design a 22 kV or 60 kV medium-voltage ring network for reliability. Key components: a main HV/MV substation, sectionalizing switches for fault isolation, power factor correction capacitor banks (Moroccan industrial tariffs penalize low power factor), and surge protection for equipment. I would implement SCADA-based monitoring for real-time network management. The design would include provisions for renewable energy integration (rooftop solar per Morocco's Law 13-09 on renewable energy) and EV charging infrastructure for the future. Power quality analysis would account for harmonic distortion from industrial drives.",
  "Je suivrais les normes ONEE et CEI pour la conception. En commençant par l'estimation de charge de chaque unité industrielle, je concevrais un réseau moyenne tension 22 kV ou 60 kV en boucle pour la fiabilité. Composants clés : poste HT/MT principal, sectionneurs pour l'isolation des défauts, batteries de condensateurs de compensation (les tarifs industriels marocains pénalisent le facteur de puissance faible) et protection contre les surtensions. J'implémenterais un monitoring SCADA et des provisions pour l'intégration solaire selon la Loi 13-09.",
  ["Reference ONEE standards and tariff structure", "Address power factor correction (important for Moroccan industrial tariffs)", "Include future-proofing for renewable energy integration"],
  ["Référencez les normes ONEE et la structure tarifaire", "Adressez la compensation du facteur de puissance", "Incluez la préparation pour l'intégration des énergies renouvelables"]
),

Q("g4", "What experience do you have with PLCs and industrial automation systems?",
  "Quelle expérience avez-vous avec les automates programmables et les systèmes d'automatisation industrielle ?",
  "competency", "génie-électrique", "medium",
  "During my studies at IMTA, I programmed Siemens S7-1200 PLCs using TIA Portal and Schneider M340 PLCs with Unity Pro. My internship at an automotive supplier in the Tanger free zone involved commissioning a conveyor system with PLC-controlled pneumatic actuators. I developed ladder logic and structured text programs, configured HMI interfaces, and troubleshot communication issues between PLCs and SCADA systems via Modbus TCP/IP. I also have basic experience with industrial robots (ABB) and vision systems. The Moroccan automotive industry (Renault Tanger, PSA Kenitra) offers excellent opportunities for automation engineers.",
  "Pendant mes études à l'IMTA, j'ai programmé des automates Siemens S7-1200 avec TIA Portal et Schneider M340 avec Unity Pro. Mon stage chez un équipementier automobile dans la zone franche de Tanger impliquait la mise en service d'un convoyeur avec actionneurs pneumatiques commandés par automate. J'ai développé des programmes en Ladder et ST, configuré des IHM et résolu des problèmes de communication Modbus TCP/IP. L'industrie automobile marocaine (Renault Tanger, PSA Kénitra) offre d'excellentes opportunités.",
  ["Name specific PLC brands and programming environments", "Reference Moroccan industrial zones and manufacturers", "Show practical commissioning experience"],
  ["Nommez des marques d'automates et environnements de programmation spécifiques", "Référencez les zones industrielles et fabricants marocains", "Montrez votre expérience pratique de mise en service"]
),

Q("g4", "How would you approach energy efficiency optimization for a Moroccan factory?",
  "Comment aborderiez-vous l'optimisation de l'efficacité énergétique d'une usine marocaine ?",
  "technical", "génie-électrique", "medium",
  "I would start with a comprehensive energy audit following ISO 50001 methodology. Key steps: install energy monitoring at each production line, analyze consumption patterns, and identify the top energy consumers. Common improvements in Moroccan factories include: replacing old motors with IE3/IE4 efficiency class motors, installing variable frequency drives on pumps and fans, improving power factor to avoid ONEE penalties, optimizing compressed air systems (typically 30% waste), and implementing LED lighting. I would also evaluate rooftop solar potential — Morocco's Law 13-09 allows self-production up to 300 kW. ROI calculations must account for ONEE's tariff structure with peak/off-peak pricing.",
  "Je commencerais par un audit énergétique complet selon ISO 50001. Étapes clés : installer un monitoring énergétique par ligne de production, analyser les profils de consommation et identifier les plus gros consommateurs. Améliorations courantes dans les usines marocaines : remplacement des moteurs anciens par des IE3/IE4, variateurs de fréquence sur pompes et ventilateurs, amélioration du facteur de puissance, optimisation des systèmes d'air comprimé et éclairage LED. J'évaluerais aussi le potentiel solaire sur toiture selon la Loi 13-09.",
  ["Reference ISO 50001 and Moroccan energy regulations", "Show knowledge of ONEE tariff structure", "Quantify typical savings percentages"],
  ["Référencez ISO 50001 et les réglementations énergétiques marocaines", "Montrez votre connaissance de la structure tarifaire ONEE", "Quantifiez les pourcentages d'économies typiques"]
),

Q("g4", "What are the challenges of integrating wind energy into Morocco's power grid?",
  "Quels sont les défis de l'intégration de l'énergie éolienne dans le réseau électrique marocain ?",
  "technical", "génie-électrique", "hard",
  "Morocco's wind potential is excellent (Tarfaya, Essaouira, Tanger regions with 3,000+ GWh/year potential). Challenges include: grid stability with variable wind output, transmission infrastructure from remote wind sites to demand centers, power quality issues (voltage fluctuations, harmonics), and curtailment during low demand periods. Solutions I would implement: advanced forecasting using weather models, battery energy storage systems (BESS), STATCOM for reactive power compensation, and smart grid technologies for demand response. Morocco's interconnections with Spain (1,400 MW capacity) provide a buffer. The ONEE grid code for renewable integration specifies fault ride-through requirements and power ramp rate limits.",
  "Le potentiel éolien du Maroc est excellent (Tarfaya, Essaouira, Tanger avec plus de 3 000 GWh/an). Les défis incluent : stabilité du réseau avec une production éolienne variable, infrastructure de transmission, qualité de l'énergie et effacement pendant les périodes de faible demande. Solutions : prévisions avancées, stockage par batteries, STATCOM pour la compensation réactive et technologies de réseau intelligent. Les interconnexions avec l'Espagne (1 400 MW) offrent un tampon. Le code réseau ONEE spécifie les exigences de fonctionnement en cas de défaut.",
  ["Reference specific Moroccan wind sites and their potential", "Show knowledge of grid integration challenges", "Mention Morocco-Spain interconnection as a stabilizing factor"],
  ["Référencez les sites éoliens marocains spécifiques et leur potentiel", "Montrez votre connaissance des défis d'intégration réseau", "Mentionnez l'interconnexion Maroc-Espagne comme facteur stabilisant"]
),

Q("g4", "How would you design a smart home automation system for Moroccan residences?",
  "Comment concevriez-vous un système domotique intelligent pour les résidences marocaines ?",
  "technical", "génie-électrique", "medium",
  "I would design a system considering Moroccan lifestyle: climate control optimized for hot summers (smart AC scheduling), smart lighting with prayer time automation, water monitoring given Morocco's water scarcity, and security systems with remote monitoring via smartphone. I would use a central hub running on Zigbee/Z-Wave protocols for low power consumption. Energy management would integrate with rooftop solar and ONEE smart meters. The system would support Arabic and French voice commands. Cost is important for the Moroccan market, so I would use affordable IoT modules (ESP32-based) and open-source platforms like Home Assistant rather than expensive proprietary systems.",
  "Je concevrais un système adapté au mode de vie marocain : climatisation optimisée pour les étés chauds, éclairage intelligent avec automatisation des horaires de prière, surveillance de l'eau vu la rareté au Maroc et sécurité avec surveillance à distance. J'utiliserais un hub central sur protocoles Zigbee/Z-Wave. La gestion énergétique s'intégrerait avec le solaire et les compteurs intelligents ONEE. Le système supporterait les commandes vocales en arabe et français. J'utiliserais des modules IoT abordables (ESP32) et des plateformes open-source comme Home Assistant.",
  ["Adapt the design to Moroccan lifestyle and climate", "Consider affordability for the Moroccan market", "Include water management as a key feature"],
  ["Adaptez la conception au mode de vie et climat marocain", "Considérez l'accessibilité financière du marché marocain", "Incluez la gestion de l'eau comme fonctionnalité clé"]
),

Q("g4", "What safety standards must electrical installations follow in Morocco?",
  "Quelles normes de sécurité les installations électriques doivent-elles suivre au Maroc ?",
  "competency", "génie-électrique", "easy",
  "Moroccan electrical installations must comply with NM C 15-100 (based on French NF C 15-100) for low-voltage installations, and NM C 13-100 for high-voltage installations. Key requirements include: proper grounding systems (TT scheme is standard in Morocco), residual current devices (30 mA for personal protection), circuit breaker sizing per cable capacity, proper cable routing and fire-rated compartmentalization, and lightning protection per NM C 17-100. ONEE connection standards must be followed for grid-connected installations. Periodic inspection by approved bodies (APAVE Maroc, Bureau Veritas) is mandatory. I ensure compliance by maintaining updated knowledge of Moroccan norms and coordinating with the relevant inspection bodies.",
  "Les installations électriques marocaines doivent respecter la NM C 15-100 (basée sur la NF C 15-100) pour la basse tension et la NM C 13-100 pour la haute tension. Exigences clés : mise à la terre (schéma TT standard au Maroc), dispositifs différentiels (30 mA pour la protection des personnes), dimensionnement des disjoncteurs, cheminement des câbles et protection foudre NM C 17-100. Les inspections périodiques par des organismes agréés (APAVE Maroc, Bureau Veritas) sont obligatoires.",
  ["Reference specific Moroccan norms (NM C 15-100, etc.)", "Show knowledge of TT grounding scheme used in Morocco", "Mention approved inspection bodies"],
  ["Référencez les normes marocaines spécifiques (NM C 15-100, etc.)", "Montrez votre connaissance du schéma TT utilisé au Maroc", "Mentionnez les organismes d'inspection agréés"]
),

// ---------------------------------------------------------------------------
// GENIE MECANIQUE (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you optimize a production line in Morocco's automotive industry?",
  "Comment optimiseriez-vous une ligne de production dans l'industrie automobile marocaine ?",
  "technical", "génie-mécanique", "hard",
  "Morocco's automotive sector (Renault Tanger, Stellantis Kenitra) requires lean manufacturing excellence. I would apply: Value Stream Mapping to identify waste, SMED for quick changeover reduction, TPM (Total Productive Maintenance) for equipment reliability, and Kaizen events for continuous improvement. Specific optimizations include: optimizing robot cycle times, reducing material handling distances through cell layout redesign, implementing Poka-Yoke error proofing, and using statistical process control for quality monitoring. I would target OEE (Overall Equipment Effectiveness) above 85%. Moroccan plants must also consider local supply chain optimization to reduce import dependency on components.",
  "Le secteur automobile marocain (Renault Tanger, Stellantis Kénitra) exige l'excellence en lean manufacturing. J'appliquerais : Value Stream Mapping, SMED pour la réduction des changements de série, TPM pour la fiabilité des équipements et Kaizen pour l'amélioration continue. Optimisations spécifiques : optimisation des temps de cycle robots, réduction des distances de manutention, Poka-Yoke et contrôle statistique des processus. Je ciblerais un TRS supérieur à 85%. Les usines marocaines doivent aussi optimiser la chaîne d'approvisionnement locale.",
  ["Show knowledge of lean manufacturing tools", "Reference specific Moroccan automotive plants", "Target specific OEE/TRS metrics"],
  ["Montrez votre connaissance des outils lean", "Référencez des usines automobiles marocaines spécifiques", "Ciblez des métriques TRS spécifiques"]
),

Q("g4", "Describe your experience with CAD/CAM tools and how they apply to Moroccan manufacturing.",
  "Décrivez votre expérience avec les outils CAO/FAO et leur application dans l'industrie marocaine.",
  "competency", "génie-mécanique", "easy",
  "I have extensive experience with SolidWorks for 3D design and CATIA V5 for complex surface modeling, which is the standard at Moroccan aerospace companies like Safran, Bombardier, and Boeing's Moroccan operations. I also use AutoCAD for 2D drawings and Mastercam for CNC programming. During my internship, I designed tooling fixtures using SolidWorks with FEA simulation (ANSYS) to validate stress distribution before manufacturing. Morocco's growing aerospace and automotive sectors require proficiency in these tools. I am also learning Siemens NX, which is used by some Moroccan defense and heavy industry companies.",
  "J'ai une expérience approfondie avec SolidWorks pour la conception 3D et CATIA V5 pour la modélisation de surfaces complexes, standard dans les entreprises aérospatiales marocaines comme Safran, Bombardier et Boeing. J'utilise aussi AutoCAD et Mastercam pour la programmation CNC. Pendant mon stage, j'ai conçu des montages d'usinage avec simulation FEA (ANSYS). Les secteurs aérospatial et automobile croissants du Maroc exigent la maîtrise de ces outils. J'apprends aussi Siemens NX.",
  ["Name specific CAD/CAM software relevant to Moroccan industry", "Reference Moroccan aerospace companies using these tools", "Show practical application beyond just modeling"],
  ["Nommez des logiciels CAO/FAO pertinents pour l'industrie marocaine", "Référencez les entreprises aérospatiales marocaines utilisant ces outils", "Montrez une application pratique au-delà de la simple modélisation"]
),

Q("g4", "How would you implement predictive maintenance in a Moroccan industrial facility?",
  "Comment implémenteriez-vous la maintenance prédictive dans une installation industrielle marocaine ?",
  "technical", "génie-mécanique", "hard",
  "I would implement a phased approach: Phase 1 — Install vibration sensors, temperature probes, and oil quality sensors on critical equipment. Phase 2 — Build a data collection infrastructure using IoT gateways connected to a cloud or on-premises analytics platform. Phase 3 — Develop machine learning models trained on historical failure data to predict remaining useful life. I would use tools like Python (scikit-learn, TensorFlow) for modeling and Grafana for dashboards. For Moroccan SMEs with limited budgets, I would start with low-cost vibration analyzers and establish baseline measurements before investing in full IoT infrastructure. Typical ROI in Moroccan factories is 15-25% reduction in maintenance costs and 35% reduction in unplanned downtime.",
  "J'implémenterais une approche par phases : Phase 1 — Installer des capteurs de vibration, sondes de température et capteurs de qualité d'huile sur les équipements critiques. Phase 2 — Infrastructure de collecte de données IoT connectée à une plateforme analytics. Phase 3 — Développer des modèles de machine learning pour prédire la durée de vie résiduelle. Pour les PME marocaines à budget limité, je commencerais par des analyseurs de vibration low-cost et des mesures de référence. Le ROI typique est de 15-25% de réduction des coûts de maintenance et 35% de réduction des arrêts imprévus.",
  ["Show a phased implementation approach", "Consider budget constraints of Moroccan SMEs", "Quantify expected ROI"],
  ["Montrez une approche d'implémentation par phases", "Considérez les contraintes budgétaires des PME marocaines", "Quantifiez le ROI attendu"]
),

Q("g4", "What do you know about Morocco's aerospace industry and its growth trajectory?",
  "Que savez-vous de l'industrie aérospatiale marocaine et de sa trajectoire de croissance ?",
  "competency", "génie-mécanique", "medium",
  "Morocco's aerospace industry has grown from nearly zero to over 140 companies employing 20,000 people, generating 2 billion USD in exports. Key players include Safran (nacelles, wiring), Boeing (assembly), Bombardier (structures), Spirit AeroSystems, and Hexcel. The industry is concentrated in Casablanca's Midparc free zone and Nouaceur aerospace hub. Morocco's competitive advantages are: geographic proximity to Europe, competitive labor costs, free trade agreements with the EU and US, and government incentives through the Plan d'Accélération Industrielle. The sector targets 8.5 billion USD in exports and 90,000 jobs by 2025. Growth areas include composite manufacturing, MRO (Maintenance, Repair, Overhaul), and electronics integration.",
  "L'industrie aérospatiale marocaine est passée de presque zéro à plus de 140 entreprises employant 20 000 personnes, avec 2 milliards USD d'exportations. Acteurs clés : Safran, Boeing, Bombardier, Spirit AeroSystems et Hexcel. L'industrie est concentrée dans la zone franche Midparc de Casablanca. Les avantages compétitifs du Maroc : proximité géographique avec l'Europe, coûts compétitifs, accords de libre-échange et incitations du Plan d'Accélération Industrielle. Le secteur cible 8,5 milliards USD d'exportations.",
  ["Reference specific aerospace companies in Morocco", "Show knowledge of the Plan d'Accélération Industrielle", "Mention growth areas and career opportunities"],
  ["Référencez des entreprises aérospatiales spécifiques au Maroc", "Montrez votre connaissance du Plan d'Accélération Industrielle", "Mentionnez les domaines de croissance et opportunités"]
),

Q("g4", "How would you approach material selection for a component exposed to Morocco's coastal climate?",
  "Comment aborderiez-vous la sélection des matériaux pour un composant exposé au climat côtier marocain ?",
  "technical", "génie-mécanique", "medium",
  "Morocco's Atlantic and Mediterranean coasts present a highly corrosive environment with salt spray, UV radiation, and humidity. I would use the Ashby material selection methodology, considering: corrosion resistance (stainless steel 316L or duplex, aluminum 6061-T6 with anodizing, or fiber-reinforced polymers), UV resistance for exposed surfaces, thermal cycling tolerance, and cost-effectiveness for the Moroccan market. For structural applications near ports like Tanger Med or Jorf Lasfar, I would specify cathodic protection systems and marine-grade coatings. Testing would follow salt spray standards (ISO 9227) and I would reference material performance data from existing Moroccan coastal installations.",
  "Les côtes atlantique et méditerranéenne du Maroc présentent un environnement très corrosif avec brouillard salin, UV et humidité. J'utiliserais la méthodologie de sélection d'Ashby, considérant : résistance à la corrosion (inox 316L ou duplex, aluminium 6061-T6 anodisé ou polymères renforcés), résistance UV, tolérance aux cycles thermiques et rapport coût-efficacité pour le marché marocain. Pour les applications structurelles près des ports, je spécifierais une protection cathodique et des revêtements marins. Tests selon ISO 9227.",
  ["Show knowledge of corrosion mechanisms in coastal environments", "Reference specific Moroccan coastal industrial sites", "Balance performance with cost for the local market"],
  ["Montrez votre connaissance des mécanismes de corrosion en milieu côtier", "Référencez des sites industriels côtiers marocains spécifiques", "Équilibrez performance et coût pour le marché local"]
),

// ---------------------------------------------------------------------------
// GENIE INDUSTRIEL (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you apply lean manufacturing principles to a Moroccan textile factory?",
  "Comment appliqueriez-vous les principes lean manufacturing dans une usine textile marocaine ?",
  "technical", "génie-industriel", "medium",
  "Morocco's textile industry (concentrated in Casablanca, Fes, and Tanger) faces intense competition from Asia. I would apply: 5S workplace organization (adapting to Moroccan work culture), Value Stream Mapping to identify lead time waste, kanban pull systems for material flow, cellular manufacturing for small-batch flexibility, and standardized work instructions in Arabic and French. Quick wins typically include reducing WIP inventory (often 40% excess in Moroccan plants), improving changeover times between styles using SMED, and implementing visual management. I would also integrate ergonomic improvements to reduce worker fatigue and turnover, which are significant challenges in Moroccan textile factories.",
  "L'industrie textile marocaine (concentrée à Casablanca, Fès et Tanger) fait face à une concurrence intense de l'Asie. J'appliquerais : 5S (adapté à la culture marocaine), Value Stream Mapping, systèmes kanban, fabrication cellulaire et instructions de travail standardisées en arabe et français. Les gains rapides incluent la réduction des en-cours (souvent 40% d'excès), l'amélioration des temps de changement par SMED et le management visuel. J'intégrerais aussi des améliorations ergonomiques pour réduire la fatigue et le turnover.",
  ["Adapt lean tools to Moroccan work culture", "Reference specific textile regions in Morocco", "Address the competitive pressure from Asian manufacturers"],
  ["Adaptez les outils lean à la culture de travail marocaine", "Référencez les régions textiles spécifiques du Maroc", "Adressez la pression concurrentielle des fabricants asiatiques"]
),

Q("g4", "Explain how you would design a supply chain for a Moroccan agri-food company exporting to Europe.",
  "Expliquez comment vous concevriez une chaîne d'approvisionnement pour une entreprise agroalimentaire marocaine exportant vers l'Europe.",
  "technical", "génie-industriel", "hard",
  "I would design an integrated cold chain from farm to European destination. Key elements: source traceability from Moroccan farms (Souss-Massa for citrus, Gharb for vegetables), HACCP-compliant processing facilities, cold storage with temperature monitoring IoT, and multimodal transport via Tanger Med port or Agadir port. I would leverage Morocco-EU Association Agreement for preferential tariffs and comply with EU phytosanitary regulations. Technology: blockchain for traceability, ERP system (SAP or Odoo) for inventory and order management, and GPS tracking for fleet management. Key challenges include maintaining the cold chain during summer transport and meeting EU residue limits. I would also implement Plan Maroc Vert quality standards throughout.",
  "Je concevrais une chaîne du froid intégrée de la ferme à la destination européenne. Éléments clés : traçabilité depuis les fermes marocaines (Souss-Massa pour les agrumes, Gharb pour les légumes), installations conformes HACCP, stockage froid avec IoT et transport multimodal via Tanger Med ou Agadir. J'exploiterais l'Accord d'Association Maroc-UE pour les tarifs préférentiels et me conformerais aux réglementations phytosanitaires européennes. Technologie : blockchain pour la traçabilité, ERP et suivi GPS de flotte. Je respecterais les normes du Plan Maroc Vert.",
  ["Show knowledge of Morocco-EU trade agreements", "Reference specific agricultural regions and ports", "Address cold chain challenges in hot climate"],
  ["Montrez votre connaissance des accords commerciaux Maroc-UE", "Référencez les régions agricoles et ports spécifiques", "Adressez les défis de la chaîne du froid en climat chaud"]
),

Q("g4", "How would you use Six Sigma to improve quality in a Moroccan pharmaceutical plant?",
  "Comment utiliseriez-vous Six Sigma pour améliorer la qualité dans une usine pharmaceutique marocaine ?",
  "technical", "génie-industriel", "hard",
  "I would apply the DMAIC methodology: Define — identify critical-to-quality (CTQ) parameters per Moroccan Pharmacopoeia and WHO-GMP standards. Measure — establish baseline capability indices (Cpk) for critical processes. Analyze — use Pareto analysis, fishbone diagrams, and statistical tools to identify root causes of defects. Improve — implement solutions through DOE (Design of Experiments) to optimize process parameters. Control — establish SPC charts and control plans to sustain improvements. Morocco's pharmaceutical industry (Pharma 5, SOTHEMA, Cooper Pharma) must comply with the Direction du Médicament et de la Pharmacie standards. Target: achieve Six Sigma level (3.4 DPMO) for critical quality attributes like active ingredient content and dissolution rates.",
  "J'appliquerais la méthodologie DMAIC : Définir — identifier les paramètres critiques selon la Pharmacopée marocaine et les normes OMS-BPF. Mesurer — établir les indices de capabilité (Cpk) de référence. Analyser — utiliser Pareto, diagrammes d'Ishikawa et outils statistiques. Améliorer — optimiser via les Plans d'Expériences (DOE). Contrôler — établir des cartes SPC. L'industrie pharmaceutique marocaine (Pharma 5, SOTHEMA, Cooper Pharma) doit respecter les normes de la Direction du Médicament. Objectif : atteindre le niveau Six Sigma (3,4 DPMO).",
  ["Reference Moroccan pharmaceutical companies and regulators", "Show DMAIC methodology knowledge", "Mention specific quality metrics (Cpk, DPMO)"],
  ["Référencez les entreprises pharmaceutiques et régulateurs marocains", "Montrez votre connaissance de la méthodologie DMAIC", "Mentionnez des métriques qualité spécifiques (Cpk, DPMO)"]
),

Q("g4", "What ERP systems are commonly used in Moroccan industry and how would you choose one?",
  "Quels systèmes ERP sont couramment utilisés dans l'industrie marocaine et comment en choisiriez-vous un ?",
  "competency", "génie-industriel", "medium",
  "In Morocco, SAP dominates large enterprises (OCP, ONEE, large banks), while Oracle is used by some multinationals. For SMEs, which represent 95% of Moroccan businesses, Sage and Odoo are popular — Odoo particularly because it is open-source, has a strong Moroccan integrator network, and supports Arabic/French. Selection criteria: company size and complexity, budget (SAP implementations cost 500K-5M MAD vs. Odoo at 100K-500K MAD), industry-specific modules needed, localization (Moroccan tax rules, CNSS declarations, e-invoicing), and scalability. I would recommend a phased implementation starting with finance and inventory modules, then expanding to production and HR. Change management is critical — Moroccan companies often underestimate user training needs.",
  "Au Maroc, SAP domine les grandes entreprises (OCP, ONEE, grandes banques), Oracle est utilisé par des multinationales. Pour les PME (95% des entreprises marocaines), Sage et Odoo sont populaires — Odoo car il est open-source et supporte arabe/français. Critères de sélection : taille, budget (SAP 500K-5M MAD vs Odoo 100K-500K MAD), modules spécifiques, localisation (fiscalité marocaine, CNSS, facturation électronique) et scalabilité. Je recommanderais une implémentation par phases. La gestion du changement est critique — les entreprises marocaines sous-estiment souvent les besoins de formation.",
  ["Compare ERP options with Moroccan-specific pricing", "Mention localization requirements (CNSS, tax)", "Address change management challenges"],
  ["Comparez les options ERP avec des tarifs spécifiques au Maroc", "Mentionnez les exigences de localisation (CNSS, fiscalité)", "Adressez les défis de gestion du changement"]
),

Q("g4", "How would you improve operational efficiency at OCP Group's phosphate mining operations?",
  "Comment amélioreriez-vous l'efficacité opérationnelle des opérations minières de phosphate du Groupe OCP ?",
  "situational", "génie-industriel", "hard",
  "OCP is the world's largest phosphate exporter, and I would focus on: implementing Industry 4.0 technologies — IoT sensors for real-time monitoring of extraction equipment, AI-driven predictive maintenance to reduce the 15-20% downtime typical in mining, and autonomous haul trucks for the Khouribga-Jorf Lasfar pipeline optimization. I would also apply lean mining principles to reduce waste in the beneficiation process and optimize water usage (critical in Morocco's water-stressed environment). OCP's Slurry Pipeline from Khouribga to Jorf Lasfar already saves 3 million cubic meters of water annually — I would look for similar innovative solutions. Energy optimization through solar-powered operations aligned with OCP's sustainability goals would be another priority.",
  "OCP est le plus grand exportateur de phosphate au monde. Je me concentrerais sur : technologies Industrie 4.0 — capteurs IoT pour le monitoring en temps réel, maintenance prédictive par IA et camions autonomes. J'appliquerais aussi le lean mining pour réduire les déchets dans le processus d'enrichissement et optimiser l'utilisation de l'eau. Le pipeline de boue OCP Khouribga-Jorf Lasfar économise déjà 3 millions de m³ d'eau par an — je chercherais des solutions innovantes similaires. L'optimisation énergétique solaire alignée sur les objectifs de durabilité d'OCP serait une autre priorité.",
  ["Show deep knowledge of OCP's operations and innovations", "Reference the Slurry Pipeline and other signature projects", "Address water and energy sustainability"],
  ["Montrez une connaissance approfondie des opérations et innovations d'OCP", "Référencez le Pipeline de boue et d'autres projets emblématiques", "Adressez la durabilité de l'eau et de l'énergie"]
),

// ---------------------------------------------------------------------------
// LOGISTIQUE (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you optimize the logistics network for a Moroccan e-commerce company?",
  "Comment optimiseriez-vous le réseau logistique d'une entreprise e-commerce marocaine ?",
  "technical", "logistique", "hard",
  "Morocco's e-commerce is growing rapidly (30%+ annual growth). I would design a hub-and-spoke network with a central warehouse in Casablanca (70% of online shoppers), regional hubs in Tanger, Marrakech, and Fes, and last-mile partnerships with local delivery services. Key optimizations: warehouse automation with pick-to-light systems, route optimization algorithms for delivery fleets, real-time tracking via GPS, and integration with Barid Al-Maghrib for rural deliveries. Cash-on-delivery (COD) remains dominant (80% of transactions), so I would implement efficient cash collection processes. Returns management is also critical — establishing convenient return points in cities. I would use a WMS (Warehouse Management System) integrated with the e-commerce platform.",
  "L'e-commerce marocain croît rapidement (+30% par an). Je concevrais un réseau hub-and-spoke avec un entrepôt central à Casablanca (70% des acheteurs en ligne), des hubs régionaux à Tanger, Marrakech et Fès, et des partenariats de dernière mile. Optimisations clés : automatisation d'entrepôt, algorithmes d'optimisation de tournées, suivi GPS temps réel et intégration avec Barid Al-Maghrib pour les livraisons rurales. Le paiement à la livraison reste dominant (80%), nécessitant des processus efficaces de collecte de cash. J'utiliserais un WMS intégré.",
  ["Address the COD dominance in Moroccan e-commerce", "Consider urban vs. rural delivery challenges", "Reference specific Moroccan logistics providers"],
  ["Adressez la dominance du paiement à la livraison", "Considérez les défis de livraison urbain vs. rural", "Référencez des prestataires logistiques marocains spécifiques"]
),

Q("g4", "Explain the strategic importance of Tanger Med port for Morocco's logistics ecosystem.",
  "Expliquez l'importance stratégique du port Tanger Med pour l'écosystème logistique marocain.",
  "competency", "logistique", "medium",
  "Tanger Med is Africa's largest container port and a top-3 Mediterranean port. Its strategic importance lies in: its location at the crossroads of East-West and North-South shipping lanes, the integrated free zone attracting 1,100+ companies, multimodal connectivity (highway, rail, airport), and its role as a transshipment hub connecting Africa to Europe and beyond. For Morocco's logistics ecosystem, Tanger Med has reduced shipping costs by 20-30% compared to routing through European ports, created over 80,000 direct and indirect jobs, and positioned Morocco as a logistics gateway to Africa. The port handles 40% of Morocco's foreign trade and is a cornerstone of the country's ambition to become a regional logistics hub.",
  "Tanger Med est le plus grand port à conteneurs d'Afrique et un top-3 méditerranéen. Son importance stratégique réside dans : sa localisation au carrefour des routes Est-Ouest et Nord-Sud, la zone franche intégrée attirant plus de 1 100 entreprises, la connectivité multimodale et son rôle de hub de transbordement. Pour l'écosystème logistique marocain, Tanger Med a réduit les coûts d'expédition de 20-30%, créé plus de 80 000 emplois et positionné le Maroc comme passerelle logistique vers l'Afrique.",
  ["Provide specific statistics about port capacity and trade volumes", "Explain the transshipment hub concept", "Connect to Morocco's broader economic strategy"],
  ["Fournissez des statistiques spécifiques sur la capacité et les volumes", "Expliquez le concept de hub de transbordement", "Connectez à la stratégie économique plus large du Maroc"]
),

Q("g4", "How would you manage inventory for a company with seasonal demand fluctuations in Morocco?",
  "Comment géreriez-vous les stocks d'une entreprise avec des fluctuations saisonnières au Maroc ?",
  "situational", "logistique", "medium",
  "Morocco has unique seasonal patterns: Ramadan shifts consumer behavior significantly, summer tourism spikes demand in hospitality supply chains, and agricultural seasons affect agri-food logistics. I would implement: demand forecasting using historical data and machine learning models that account for Ramadan's shifting dates, safety stock calculations with seasonal adjustment factors, vendor-managed inventory (VMI) agreements with key suppliers, and dynamic reorder points. For Ramadan specifically, I would build inventory 6-8 weeks ahead for FMCG products and coordinate with suppliers early. I would use ABC-XYZ analysis to categorize items by value and demand predictability, focusing tight control on high-value volatile items.",
  "Le Maroc a des schémas saisonniers uniques : le Ramadan modifie significativement la consommation, l'été augmente la demande touristique et les saisons agricoles affectent la logistique agroalimentaire. J'implémenterais : prévision de la demande avec ML tenant compte des dates variables du Ramadan, stocks de sécurité ajustés, VMI avec les fournisseurs clés et points de réapprovisionnement dynamiques. Pour le Ramadan, je constituerais les stocks 6-8 semaines à l'avance pour les produits FMCG. J'utiliserais l'analyse ABC-XYZ pour catégoriser les articles.",
  ["Address Ramadan's unique impact on Moroccan supply chains", "Show knowledge of forecasting methodologies", "Consider tourism seasonality specific to Morocco"],
  ["Adressez l'impact unique du Ramadan sur les chaînes d'approvisionnement", "Montrez votre connaissance des méthodologies de prévision", "Considérez la saisonnalité touristique spécifique au Maroc"]
),

Q("g4", "What customs procedures should a logistics professional know for import/export through Morocco?",
  "Quelles procédures douanières un professionnel de la logistique doit-il connaître pour l'import/export via le Maroc ?",
  "competency", "logistique", "medium",
  "Key customs procedures include: the Déclaration Unique de Marchandises (DUM) filed through BADR system (Base Automatisée des Douanes en Réseau), classification of goods using the Harmonized System adapted to Morocco's tariff schedule, valuation methods per WTO rules, and origin determination for preferential treatment under FTAs (EU, US, Turkey, African countries). Specific regimes include: Admission Temporaire for processing trade, Entrepôt de Stockage for warehousing, Transit for goods passing through Morocco, and Exportation Temporaire. I would also be familiar with the CRI (Centre Régional d'Investissement) procedures for industrial free zone operations and AMDIE incentives for exporters. Digital customs clearance through PortNet platform has significantly reduced processing times.",
  "Les procédures douanières clés incluent : la DUM via le système BADR, classification selon le Système Harmonisé adapté au tarif marocain, méthodes d'évaluation OMC et détermination d'origine pour les ALE (UE, USA, Turquie, pays africains). Régimes spécifiques : Admission Temporaire, Entrepôt de Stockage, Transit et Exportation Temporaire. Je connais aussi les procédures CRI pour les zones franches et les incitations AMDIE pour les exportateurs. Le dédouanement digital via PortNet a réduit les délais.",
  ["Reference the BADR and PortNet systems specifically", "Show knowledge of preferential trade agreements", "Mention specific customs regimes relevant to logistics"],
  ["Référencez les systèmes BADR et PortNet spécifiquement", "Montrez votre connaissance des accords commerciaux préférentiels", "Mentionnez les régimes douaniers spécifiques pertinents"]
),

// ---------------------------------------------------------------------------
// MANAGEMENT (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you manage a multigenerational team in a Moroccan corporate environment?",
  "Comment géreriez-vous une équipe multigénérationnelle dans un environnement corporate marocain ?",
  "situational", "management", "medium",
  "In Moroccan workplaces, respect for seniority (احترام الكبير) is deeply cultural. I would leverage this by creating mentorship pairings between experienced staff and younger digital-native employees. I would adapt communication styles — formal meetings for senior colleagues, collaborative digital tools (Slack, Teams) for younger ones. I would establish clear performance metrics that value both experience-based wisdom and innovative thinking. Team-building activities should respect cultural norms while breaking down generational barriers. I would also address the technology gap by organizing reverse mentoring sessions where junior staff teach digital skills to senior colleagues in a respectful, non-condescending manner.",
  "Dans les milieux professionnels marocains, le respect de l'ancienneté (احترام الكبير) est profondément culturel. Je créerais des binômes de mentorat entre collaborateurs expérimentés et jeunes digital-natives. J'adapterais les styles de communication — réunions formelles pour les seniors, outils collaboratifs pour les juniors. J'établirais des métriques de performance valorisant l'expérience et l'innovation. Le team-building devrait respecter les normes culturelles. J'organiserais des sessions de mentorat inversé où les juniors enseignent les compétences digitales de manière respectueuse.",
  ["Show cultural sensitivity specific to Morocco", "Balance tradition with innovation", "Propose concrete bridging strategies"],
  ["Montrez une sensibilité culturelle spécifique au Maroc", "Équilibrez tradition et innovation", "Proposez des stratégies concrètes de rapprochement"]
),

Q("g4", "How would you lead a digital transformation initiative in a traditional Moroccan company?",
  "Comment mèneriez-vous une initiative de transformation digitale dans une entreprise marocaine traditionnelle ?",
  "situational", "management", "hard",
  "I would follow a structured approach: 1) Assessment — evaluate current digital maturity using a framework adapted to Moroccan SMEs. 2) Vision — align digital strategy with business objectives, referencing Maroc Digital 2030 incentives. 3) Quick wins — implement immediately visible improvements (CRM, e-invoicing, social media presence). 4) Core transformation — migrate to cloud-based ERP, digitize workflows, implement data analytics. 5) Culture change — the hardest part in traditional Moroccan companies where paper-based processes and personal relationships drive business. I would invest heavily in training (bilingual Arabic/French materials), identify digital champions within each department, and celebrate early adopters. External support from CGEM's digital transformation programs and ANPME subsidies can help finance the initiative.",
  "Je suivrais une approche structurée : 1) Évaluation de la maturité digitale. 2) Vision alignée avec les objectifs business et les incitations Maroc Digital 2030. 3) Gains rapides — CRM, facturation électronique, réseaux sociaux. 4) Transformation core — migration cloud, numérisation des flux, analytics. 5) Changement culturel — le plus difficile dans les entreprises marocaines traditionnelles. J'investirais dans la formation (matériaux bilingues), identifierais des champions digitaux et célébrerais les adopteurs précoces. Le support de la CGEM et les subventions ANPME peuvent aider à financer l'initiative.",
  ["Address resistance to change in traditional Moroccan businesses", "Reference government incentives for digital transformation", "Show a phased, low-risk approach"],
  ["Adressez la résistance au changement dans les entreprises traditionnelles", "Référencez les incitations gouvernementales pour la transformation digitale", "Montrez une approche par phases à faible risque"]
),

Q("g4", "How do you approach performance management in a Moroccan context where direct negative feedback can be culturally sensitive?",
  "Comment abordez-vous la gestion de la performance dans un contexte marocain où le feedback négatif direct peut être culturellement sensible ?",
  "situational", "management", "hard",
  "In Morocco, face-saving (حشمة) is important. I would use the SBI model (Situation-Behavior-Impact) delivered privately, never in front of others. I would start with genuine positive observations, then discuss areas for improvement as 'development opportunities.' Regular one-on-ones create a safe space for feedback rather than relying solely on annual reviews. I would document discussions and agree on actionable improvement plans with clear timelines. For persistent issues, I would involve HR following Moroccan labor code (Code du Travail) provisions for progressive discipline. I also believe in leading by example — openly accepting feedback myself to normalize the culture of constructive criticism within the team.",
  "Au Maroc, sauver la face (حشمة) est important. J'utiliserais le modèle SBI (Situation-Comportement-Impact) en privé, jamais devant les autres. Je commencerais par des observations positives sincères, puis discuterais des améliorations comme 'opportunités de développement.' Des entretiens individuels réguliers créent un espace sûr pour le feedback. Je documenterais les discussions et conviendrais de plans d'amélioration. Pour les problèmes persistants, j'impliquerais les RH selon le Code du Travail. Je montrerais l'exemple en acceptant le feedback pour normaliser la critique constructive.",
  ["Show understanding of Moroccan face-saving culture (حشمة)", "Reference the Moroccan Labor Code for formal processes", "Propose alternatives to direct confrontation"],
  ["Montrez votre compréhension de la culture de la حشمة marocaine", "Référencez le Code du Travail marocain pour les processus formels", "Proposez des alternatives à la confrontation directe"]
),

Q("g4", "What leadership style do you think is most effective in Moroccan organizations?",
  "Quel style de leadership pensez-vous être le plus efficace dans les organisations marocaines ?",
  "competency", "management", "medium",
  "I believe a blend of transformational and servant leadership works best in Morocco. Moroccan employees respond well to leaders who show genuine care (like a family atmosphere), set a clear vision, and empower their teams while maintaining the respect structure. I would avoid purely autocratic styles (common in older Moroccan companies) and purely laissez-faire approaches. Key elements: accessible leadership (open door policy), recognizing achievements publicly, investing in team development, and making decisions transparently. The most successful Moroccan leaders I have observed — like those at OCP, Attijariwafa Bank, or Royal Air Maroc — combine strategic vision with personal warmth and accessibility.",
  "Je crois qu'un mélange de leadership transformationnel et serviteur fonctionne le mieux au Maroc. Les employés marocains répondent bien aux leaders qui montrent une attention sincère (atmosphère familiale), une vision claire et l'empowerment tout en maintenant la structure de respect. J'éviterais les styles purement autocratiques (courants dans les anciennes entreprises marocaines) et le laissez-faire. Les leaders marocains les plus réussis — chez OCP, Attijariwafa Bank ou Royal Air Maroc — combinent vision stratégique et chaleur personnelle.",
  ["Show awareness of both traditional and modern Moroccan management", "Reference successful Moroccan business leaders or companies", "Adapt general leadership theory to Moroccan culture"],
  ["Montrez votre conscience du management marocain traditionnel et moderne", "Référencez des leaders ou entreprises marocains réussis", "Adaptez la théorie du leadership à la culture marocaine"]
),

// ---------------------------------------------------------------------------
// COMMERCE (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you develop a market entry strategy for a new product in Morocco?",
  "Comment développeriez-vous une stratégie d'entrée sur le marché pour un nouveau produit au Maroc ?",
  "technical", "commerce-international", "hard",
  "I would follow a structured approach: 1) Market research — analyze Morocco's consumer segments (urban vs. rural, income levels, cultural preferences), competition landscape, and regulatory requirements through HCP data and field surveys. 2) Pricing — consider purchasing power (average salary ~5,000 MAD/month), VAT implications (20% standard rate), and competitive positioning. 3) Distribution — partner with established distributors who know the traditional commerce (épiceries, souks) and modern retail (Marjane, Carrefour, BIM). 4) Marketing — bilingual Arabic/French campaigns, leverage social media (Morocco has 25M+ Facebook users), and use influencer marketing which is very effective in Morocco. 5) Legal — register with the Office Marocain de la Propriété Industrielle, comply with Moroccan labeling requirements (Arabic mandatory), and obtain necessary certifications.",
  "Je suivrais une approche structurée : 1) Étude de marché — segments consommateurs (urbain vs rural, revenus, préférences culturelles), paysage concurrentiel et réglementation via les données HCP. 2) Pricing — pouvoir d'achat (salaire moyen ~5 000 MAD), implications TVA (20%) et positionnement concurrentiel. 3) Distribution — partenariat avec des distributeurs connaissant le commerce traditionnel (épiceries, souks) et moderne (Marjane, Carrefour, BIM). 4) Marketing — campagnes bilingues arabe/français et réseaux sociaux (25M+ utilisateurs Facebook). 5) Juridique — enregistrement OMPIC et étiquetage en arabe.",
  ["Show knowledge of Morocco's dual retail system (traditional/modern)", "Reference specific Moroccan consumer data", "Address regulatory requirements for the Moroccan market"],
  ["Montrez votre connaissance du système de distribution dual marocain", "Référencez des données consommateurs marocaines spécifiques", "Adressez les exigences réglementaires du marché marocain"]
),

Q("g4", "What opportunities does the African Continental Free Trade Area (AfCFTA) create for Moroccan businesses?",
  "Quelles opportunités la Zone de Libre-Échange Continentale Africaine (ZLECAf) crée-t-elle pour les entreprises marocaines ?",
  "competency", "commerce-international", "medium",
  "AfCFTA, creating a 1.3 billion-person market, offers Morocco significant opportunities. Morocco's strategic advantages include: established trade relationships with West Africa (banking, telecom, construction), geographic proximity to sub-Saharan markets, existing logistics infrastructure (Tanger Med, Casablanca Finance City), and diversified industrial base. Key sectors for expansion: banking (Attijariwafa, BMCE already present in 25+ African countries), phosphate fertilizers (OCP Africa), construction materials, telecommunications, and automotive parts. Challenges include: logistics costs to reach landlocked countries, currency volatility, and competition with established players. I would develop a phased approach starting with Morocco's strongest African markets (Senegal, Côte d'Ivoire, Nigeria) before expanding to East Africa.",
  "La ZLECAf, créant un marché de 1,3 milliard de personnes, offre au Maroc des opportunités significatives. Avantages stratégiques : relations commerciales établies avec l'Afrique de l'Ouest, proximité géographique, infrastructure logistique et base industrielle diversifiée. Secteurs clés : banque (Attijariwafa, BMCE dans 25+ pays), fertilisants phosphatés (OCP Africa), matériaux de construction, télécoms et automobile. Défis : coûts logistiques, volatilité des devises et concurrence. J'adopterais une approche par phases en commençant par les marchés africains les plus forts du Maroc.",
  ["Reference specific Moroccan companies already operating in Africa", "Show knowledge of Morocco's African trade strategy", "Address both opportunities and challenges realistically"],
  ["Référencez des entreprises marocaines déjà opérant en Afrique", "Montrez votre connaissance de la stratégie africaine du Maroc", "Adressez opportunités et défis de manière réaliste"]
),

Q("g4", "How would you negotiate with a European supplier as a Moroccan purchasing manager?",
  "Comment négocieriez-vous avec un fournisseur européen en tant que responsable achats marocain ?",
  "situational", "commerce-international", "medium",
  "I would prepare by researching the supplier's market position, alternative sources, and the current EUR/MAD exchange rate. In negotiation, I would leverage: Morocco's growing market attractiveness (gateway to Africa), potential for long-term partnership, volume commitments, and Morocco-EU preferential trade agreements reducing tariffs. I would negotiate not just price but total cost: Incoterms (preferring CIF Casablanca for risk management), payment terms (letter of credit through Moroccan banks), quality guarantees with penalties, and after-sales support. Cultural awareness is important — European negotiators tend to be more direct and time-structured than Moroccan norms, so I would adapt my style accordingly while maintaining firm positions on key terms.",
  "Je me préparerais en recherchant la position du fournisseur, les sources alternatives et le taux de change EUR/MAD. En négociation, j'exploiterais : l'attractivité croissante du Maroc (passerelle vers l'Afrique), le potentiel de partenariat long terme, les engagements de volume et les accords préférentiels Maroc-UE. Je négocierais le coût total : Incoterms (CIF Casablanca préféré), conditions de paiement (crédit documentaire via les banques marocaines), garanties qualité et support après-vente. Les Européens sont plus directs et structurés que les normes marocaines — j'adapterais mon style.",
  ["Show knowledge of international trade terms (Incoterms)", "Reference Morocco-EU trade agreements", "Address cultural differences in negotiation styles"],
  ["Montrez votre connaissance des termes du commerce international", "Référencez les accords commerciaux Maroc-UE", "Adressez les différences culturelles dans les styles de négociation"]
),

// ---------------------------------------------------------------------------
// FINANCE (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How does Morocco's banking sector compare to other North African markets?",
  "Comment le secteur bancaire marocain se compare-t-il aux autres marchés nord-africains ?",
  "competency", "finance", "medium",
  "Morocco's banking sector is the most developed in North Africa with 19 banks, 6,600+ branches, and a banking penetration rate of 78% (vs 45% in Algeria, 35% in Tunisia). Key strengths: strong regulatory framework under Bank Al-Maghrib, advanced digital banking adoption, and significant pan-African expansion. Morocco's three largest banks (Attijariwafa, BMCE/BOA, BCP) are among Africa's top 20 by assets. The sector is well-capitalized (Tier 1 ratio above 12%) and manages significant NPL ratios through provisioning. Challenges include: financial inclusion in rural areas (only 30% have bank accounts), SME financing gaps, and competition from mobile money services. The Stratégie Nationale d'Inclusion Financière aims to reach 50% financial inclusion by 2030.",
  "Le secteur bancaire marocain est le plus développé d'Afrique du Nord avec 19 banques, 6 600+ agences et un taux de bancarisation de 78% (vs 45% en Algérie, 35% en Tunisie). Points forts : cadre réglementaire solide sous Bank Al-Maghrib, adoption du digital banking et expansion panafricaine significative. Les trois plus grandes banques (Attijariwafa, BMCE/BOA, BCP) sont parmi les top 20 d'Afrique. Défis : inclusion financière rurale (30% seulement), financement des PME et concurrence du mobile money. La Stratégie Nationale d'Inclusion Financière vise 50% d'ici 2030.",
  ["Provide specific statistics for comparison", "Reference Bank Al-Maghrib regulatory framework", "Discuss both strengths and challenges"],
  ["Fournissez des statistiques spécifiques de comparaison", "Référencez le cadre réglementaire de Bank Al-Maghrib", "Discutez forces et défis"]
),

Q("g4", "Explain the role of Casablanca Finance City (CFC) in Morocco's financial ecosystem.",
  "Expliquez le rôle de Casablanca Finance City (CFC) dans l'écosystème financier marocain.",
  "competency", "finance", "medium",
  "CFC is Morocco's international financial hub, created in 2010 to position Casablanca as Africa's leading financial center. CFC offers: preferential tax regime (0% corporate tax for 5 years, then 8.75%), streamlined regulatory framework, and a business-friendly environment for international financial services companies. Over 200 companies have CFC status, including global firms like Deloitte, PwC, and AIG. CFC's role in Morocco's strategy is threefold: attract foreign direct investment, develop the financial services industry (wealth management, insurance, capital markets), and serve as a gateway for international investors accessing African markets. CFC is ranked among the top 5 financial centers in Africa by the Global Financial Centres Index.",
  "CFC est le hub financier international du Maroc, créé en 2010 pour positionner Casablanca comme centre financier leader en Afrique. CFC offre : régime fiscal préférentiel (0% IS pendant 5 ans, puis 8,75%), cadre réglementaire simplifié et environnement favorable aux services financiers internationaux. Plus de 200 entreprises ont le statut CFC. Le rôle de CFC est triple : attirer les IDE, développer l'industrie des services financiers et servir de passerelle pour les investisseurs accédant aux marchés africains. CFC est classé parmi les 5 premiers centres financiers d'Afrique.",
  ["Reference the specific tax advantages of CFC status", "Show knowledge of major companies with CFC status", "Connect CFC to Morocco's Africa strategy"],
  ["Référencez les avantages fiscaux spécifiques du statut CFC", "Montrez votre connaissance des entreprises avec statut CFC", "Connectez CFC à la stratégie africaine du Maroc"]
),

Q("g4", "How would you perform a financial analysis of a Moroccan SME seeking bank financing?",
  "Comment effectueriez-vous une analyse financière d'une PME marocaine cherchant un financement bancaire ?",
  "technical", "finance", "hard",
  "I would conduct a comprehensive analysis: 1) Financial statements — analyze 3 years of bilan (balance sheet) and CPC (compte de produits et charges) following the Moroccan accounting plan (PCGE). 2) Ratios — liquidity (current ratio >1.5), solvency (debt-to-equity <3), profitability (ROE, ROA), and activity ratios. 3) Cash flow analysis — focus on operating cash flow and DSO/DPO cycles typical of Moroccan SMEs where late payments are endemic. 4) Collateral assessment — real estate valuation (major collateral in Morocco), business assets, and personal guarantees. 5) Sector analysis — compare with industry benchmarks from Bank Al-Maghrib's annual report. 6) Risk assessment — check with the Service de Centralisation des Risques at Bank Al-Maghrib. The analysis must comply with IFRS as adopted by Morocco (effective since 2008 for listed companies).",
  "Je conduirais une analyse complète : 1) États financiers — 3 ans de bilan et CPC selon le PCGE. 2) Ratios — liquidité, solvabilité, rentabilité et activité. 3) Analyse des flux de trésorerie — focus sur les cycles DSO/DPO, les retards de paiement étant endémiques chez les PME marocaines. 4) Évaluation des garanties — immobilier (principale garantie au Maroc), actifs et cautions personnelles. 5) Analyse sectorielle — benchmarks de Bank Al-Maghrib. 6) Évaluation des risques — vérification au Service de Centralisation des Risques. L'analyse doit respecter les IFRS adoptées par le Maroc.",
  ["Reference the Moroccan accounting plan (PCGE)", "Show knowledge of Bank Al-Maghrib requirements", "Address the late payment culture in Moroccan B2B"],
  ["Référencez le Plan Comptable marocain (PCGE)", "Montrez votre connaissance des exigences de Bank Al-Maghrib", "Adressez la culture des retards de paiement en B2B marocain"]
),

Q("g4", "What is the impact of Morocco's Stratégie Nationale d'Inclusion Financière?",
  "Quel est l'impact de la Stratégie Nationale d'Inclusion Financière du Maroc ?",
  "competency", "finance", "medium",
  "Morocco's SNIF aims to increase financial inclusion from 30% to 50% by 2030. Key pillars: mobile banking expansion (wafacash, cash plus), simplified account opening for low-income populations, financial literacy programs in schools and rural areas, and microfinance development. The strategy has already achieved: 15 million mobile wallet accounts, expansion of microfinance to serve 1 million clients, and insurance penetration growth. The Central Bank introduced specific regulations for payment institutions and e-money to facilitate fintech innovation. For finance professionals, this creates opportunities in mobile financial services, agent banking, and micro-insurance products tailored to Morocco's informal economy, which represents 30% of GDP.",
  "La SNIF du Maroc vise à augmenter l'inclusion financière de 30% à 50% d'ici 2030. Piliers clés : expansion de la banque mobile, simplification de l'ouverture de comptes, programmes d'éducation financière et développement de la microfinance. La stratégie a déjà atteint : 15 millions de comptes mobile money, expansion de la microfinance à 1 million de clients et croissance de l'assurance. Bank Al-Maghrib a introduit des réglementations pour les établissements de paiement et la monnaie électronique. Cela crée des opportunités dans les services financiers mobiles et la micro-assurance adaptée à l'économie informelle (30% du PIB).",
  ["Reference specific SNIF targets and achievements", "Show understanding of Morocco's informal economy", "Connect financial inclusion to broader economic development"],
  ["Référencez les cibles et réalisations spécifiques de la SNIF", "Montrez votre compréhension de l'économie informelle marocaine", "Connectez l'inclusion financière au développement économique"]
),

// ---------------------------------------------------------------------------
// MARKETING (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you develop a digital marketing strategy for a Moroccan brand targeting young consumers?",
  "Comment développeriez-vous une stratégie de marketing digital pour une marque marocaine ciblant les jeunes consommateurs ?",
  "technical", "marketing", "medium",
  "Morocco's youth (15-34 age group) represents 40% of the population and is highly connected: 28M internet users, 25M Facebook users, 15M Instagram users, and rapidly growing TikTok adoption. I would develop: 1) Social media strategy — content mix of entertaining, educational, and promotional posts in Darija (not formal Arabic) on Instagram, TikTok, and YouTube. 2) Influencer partnerships — collaborate with Moroccan micro-influencers (10K-100K followers) who have higher engagement than celebrities. 3) Content marketing — create relatable content addressing young Moroccans' aspirations. 4) Performance marketing — Facebook/Instagram ads with precise targeting by city, interests, and behavior. 5) Community building — engage through contests, user-generated content, and local events. Budget allocation: 50% social media ads, 20% influencer, 15% content creation, 15% community management.",
  "La jeunesse marocaine (15-34 ans) représente 40% de la population et est très connectée : 28M internautes, 25M sur Facebook, 15M sur Instagram et TikTok en croissance. Je développerais : 1) Stratégie réseaux sociaux — contenu en darija sur Instagram, TikTok et YouTube. 2) Partenariats influenceurs — micro-influenceurs marocains (10K-100K abonnés) avec meilleur engagement. 3) Content marketing — contenu adressant les aspirations des jeunes Marocains. 4) Performance marketing — publicités ciblées par ville et intérêts. 5) Community building — concours, UGC et événements locaux. Budget : 50% social ads, 20% influenceurs, 15% création de contenu, 15% community management.",
  ["Use specific Moroccan social media statistics", "Recommend Darija over formal Arabic for youth targeting", "Show knowledge of Moroccan influencer ecosystem"],
  ["Utilisez des statistiques réseaux sociaux marocaines spécifiques", "Recommandez le darija plutôt que l'arabe formel pour cibler les jeunes", "Montrez votre connaissance de l'écosystème influenceurs marocain"]
),

Q("g4", "How would you conduct market research for a new service in Morocco?",
  "Comment mèneriez-vous une étude de marché pour un nouveau service au Maroc ?",
  "technical", "marketing", "easy",
  "I would use a mixed-methods approach: 1) Secondary research — analyze HCP (Haut-Commissariat au Plan) census data, DEPF economic reports, sector-specific studies from CGEM, and available consumer research. 2) Quantitative — online surveys via social media (high reach in Morocco), with attention to urban/rural split and income segmentation. Face-to-face surveys in traditional markets (souks) for older demographics. 3) Qualitative — focus groups in major cities (Casablanca, Rabat, Marrakech, Tanger) conducted in Darija, with separate groups for different socioeconomic levels. 4) Competitive analysis — mystery shopping, digital presence audit, and pricing comparison. The research must account for Morocco's significant urban-rural divide and the impact of the informal economy on market sizing.",
  "J'utiliserais une approche mixte : 1) Recherche secondaire — données HCP, rapports DEPF, études CGEM et recherches consommateurs. 2) Quantitative — enquêtes en ligne via réseaux sociaux, avec attention à la répartition urbain/rural. Enquêtes en face-à-face dans les souks pour les démographies plus âgées. 3) Qualitative — groupes de discussion dans les grandes villes en darija, avec des groupes séparés par niveau socio-économique. 4) Analyse concurrentielle — visite mystère, audit digital et comparaison de prix. La recherche doit tenir compte de la fracture urbain-rural et de l'économie informelle.",
  ["Reference specific Moroccan data sources (HCP, DEPF)", "Address the urban-rural divide in research methodology", "Consider the informal economy in market sizing"],
  ["Référencez des sources de données marocaines spécifiques (HCP, DEPF)", "Adressez la fracture urbain-rural dans la méthodologie", "Considérez l'économie informelle dans le dimensionnement du marché"]
),

// ---------------------------------------------------------------------------
// RESSOURCES HUMAINES (20 questions)
// ---------------------------------------------------------------------------
Q("g4", "What are the key provisions of Morocco's Labour Code (Code du Travail) that every HR professional should know?",
  "Quelles sont les dispositions clés du Code du Travail marocain que tout professionnel RH doit connaître ?",
  "competency", "ressources-humaines", "medium",
  "Key provisions include: maximum 44 hours/week (8 hours/day for industry, 10 for agriculture), minimum wage of 3,111 MAD/month (SMIG) for industry and 2,048 MAD (SMAG) for agriculture, annual leave of 1.5 days per month of service, maternity leave of 14 weeks at full pay, notice periods ranging from 8 days (< 1 year) to 2 months (> 5 years), mandatory CNSS registration for all employees, severance pay (indemnité de licenciement) calculated at progressive rates, and mandatory employee representatives for companies with 10+ employees. Also important: fixed-term contracts are limited to 1 year (renewable once), probation periods vary by category (15 days for workers, 3 months for cadres), and wrongful termination entitles employees to damages.",
  "Les dispositions clés incluent : maximum 44h/semaine, SMIG de 3 111 MAD/mois pour l'industrie et SMAG de 2 048 MAD pour l'agriculture, congés annuels de 1,5 jours par mois de service, congé maternité de 14 semaines à plein salaire, préavis de 8 jours à 2 mois selon l'ancienneté, inscription CNSS obligatoire, indemnité de licenciement à taux progressifs et délégués du personnel obligatoires à partir de 10 employés. Les CDD sont limités à 1 an (renouvelable une fois), les périodes d'essai varient selon la catégorie.",
  ["Provide specific numbers for wages, leave, and notice periods", "Mention CNSS obligations", "Show knowledge of both employee and employer rights"],
  ["Fournissez des chiffres spécifiques pour salaires, congés et préavis", "Mentionnez les obligations CNSS", "Montrez votre connaissance des droits employés et employeurs"]
),

Q("g4", "How would you design a training program for new graduates entering a Moroccan company?",
  "Comment concevriez-vous un programme de formation pour les nouveaux diplômés intégrant une entreprise marocaine ?",
  "situational", "ressources-humaines", "medium",
  "I would design a comprehensive onboarding program: Week 1-2 — Company orientation (history, values, organizational structure), workplace safety training, and administrative setup (CNSS, mutual insurance). Month 1-3 — Technical training through rotation across departments, paired with a mentor (parrain) from the team, and soft skills workshops (communication, teamwork, professional etiquette in Moroccan business culture). Month 3-6 — Specialized training in the assigned role, first project assignment with close supervision, and mid-probation review. Throughout — language support (French business writing, technical English), professional certifications relevant to the role. I would integrate informal cultural elements: welcome tea ceremony, team lunches, and introduction to company traditions. Evaluation through competency-based assessments at 3 and 6 months.",
  "Je concevrais un programme d'intégration complet : Semaine 1-2 — Orientation (histoire, valeurs, structure), sécurité et administration (CNSS, mutuelle). Mois 1-3 — Formation technique par rotation, mentorat (parrain d'équipe) et ateliers soft skills (communication, travail d'équipe, étiquette professionnelle marocaine). Mois 3-6 — Formation spécialisée, premier projet avec supervision et évaluation mi-période d'essai. Tout au long — support linguistique (rédaction française, anglais technique) et certifications professionnelles. J'intégrerais des éléments culturels : cérémonie de thé d'accueil, déjeuners d'équipe. Évaluation par compétences à 3 et 6 mois.",
  ["Include cultural integration elements specific to Morocco", "Address the theory-practice gap for new graduates", "Show knowledge of CNSS and mutual insurance requirements"],
  ["Incluez des éléments d'intégration culturelle spécifiques au Maroc", "Adressez l'écart théorie-pratique pour les nouveaux diplômés", "Montrez votre connaissance des exigences CNSS et mutuelle"]
),

// ---------------------------------------------------------------------------
// DROIT (15 questions)
// ---------------------------------------------------------------------------
Q("g4", "How does Morocco's business law framework attract foreign investment?",
  "Comment le cadre juridique des affaires du Maroc attire-t-il l'investissement étranger ?",
  "competency", "droit", "medium",
  "Morocco offers a comprehensive legal framework for foreign investors: the Investment Charter (Loi-cadre 03-22) provides incentives including tax exemptions, land subsidies, and simplified procedures through CRI (Centre Régional d'Investissement). Free trade agreements with the EU, US, Turkey, and ECOWAS countries reduce trade barriers. Morocco's commercial law is based on the French model, providing familiarity for European investors. The AMDIE agency provides one-stop-shop services for foreign companies. Special economic zones (Tanger Med, Atlantic Free Zone, Midparc) offer additional advantages: 0% corporate tax for 5 years, customs duty exemptions, and streamlined labor regulations. Morocco also has bilateral investment treaties with 70+ countries and is a signatory to ICSID for dispute resolution.",
  "Le Maroc offre un cadre juridique complet : la Charte de l'Investissement (Loi-cadre 03-22) fournit des incitations incluant exonérations fiscales, subventions foncières et procédures simplifiées via les CRI. Les accords de libre-échange avec l'UE, les USA et la Turquie réduisent les barrières. Le droit commercial marocain basé sur le modèle français offre une familiarité aux investisseurs européens. Les zones économiques spéciales offrent des avantages supplémentaires : 0% IS pendant 5 ans, exonérations douanières. Le Maroc a des traités d'investissement bilatéraux avec 70+ pays.",
  ["Reference specific laws and investment incentives", "Mention free trade agreements and their benefits", "Show knowledge of special economic zone advantages"],
  ["Référencez des lois et incitations d'investissement spécifiques", "Mentionnez les accords de libre-échange et leurs avantages", "Montrez votre connaissance des avantages des zones économiques spéciales"]
),

Q("g4", "What are the key steps to create a company in Morocco?",
  "Quelles sont les étapes clés pour créer une entreprise au Maroc ?",
  "competency", "droit", "easy",
  "Creating a company in Morocco involves: 1) Obtain a negative certificate (certificat négatif) from OMPIC confirming the company name is available. 2) Draft the bylaws (statuts) and sign them before a notary. 3) Deposit the share capital at an authorized bank and obtain a certificate. 4) Register with the tax authorities (DGI) to obtain the IF (Identifiant Fiscal) and TP (Taxe Professionnelle). 5) Register at the Commercial Court (Tribunal de Commerce) to get the RC (Registre du Commerce). 6) Register with CNSS for social security. 7) Publish creation notices in a legal gazette and official bulletin. The process has been simplified through the CRI which now offers digital registration. Common forms: SARL (most popular for SMEs, minimum capital 1 MAD), SA (for larger companies, minimum 300,000 MAD), and SAS (flexible governance).",
  "Créer une entreprise au Maroc implique : 1) Obtenir un certificat négatif de l'OMPIC. 2) Rédiger les statuts et les signer devant notaire. 3) Déposer le capital social en banque. 4) S'inscrire auprès de la DGI pour l'IF et la TP. 5) S'inscrire au Tribunal de Commerce pour le RC. 6) S'inscrire à la CNSS. 7) Publier les annonces de création. Le processus est simplifié via le CRI qui offre l'inscription digitale. Formes courantes : SARL (la plus populaire, capital minimum 1 MAD), SA (minimum 300 000 MAD) et SAS (gouvernance flexible).",
  ["List the steps in order with specific requirements", "Mention the CRI digital simplification", "Compare company forms (SARL, SA, SAS)"],
  ["Listez les étapes dans l'ordre avec les exigences spécifiques", "Mentionnez la simplification digitale du CRI", "Comparez les formes sociales (SARL, SA, SAS)"]
),

// ---------------------------------------------------------------------------
// ARCHITECTURE (15 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you integrate traditional Moroccan architectural elements into a modern building design?",
  "Comment intégreriez-vous des éléments architecturaux traditionnels marocains dans une conception de bâtiment moderne ?",
  "technical", "architecture", "medium",
  "I would blend traditional Moroccan elements with contemporary design: use riad-inspired courtyard layouts for natural ventilation and light, incorporate zellige (geometric tilework) as accent features in lobbies or facades, use mashrabiya-inspired perforated screens for sun shading while maintaining privacy, apply traditional arched doorways (bab) reinterpreted with modern materials, and use tadelakt (traditional lime plaster) in bathrooms and water features. For thermal comfort, I would draw from traditional techniques: thick walls with thermal mass, wind towers (malqaf) adapted as natural ventilation systems, and internal gardens for evaporative cooling. The design should feel rooted in Moroccan identity while meeting modern building codes (RPS 2011, RTCM thermal regulations) and sustainability standards.",
  "Je mélangerais éléments traditionnels et design contemporain : plans de riad avec patio pour ventilation et lumière naturelles, zellige en accents décoratifs dans les halls, moucharabiehs comme brise-soleil tout en maintenant l'intimité, arcs traditionnels (bab) réinterprétés avec des matériaux modernes et tadelakt dans les espaces d'eau. Pour le confort thermique, je m'inspirerais des techniques traditionnelles : murs épais avec masse thermique, tours à vent (malqaf) comme ventilation naturelle et jardins intérieurs pour le refroidissement évaporatif. Le design doit être ancré dans l'identité marocaine tout en respectant les normes modernes.",
  ["Name specific traditional Moroccan architectural elements", "Show how they solve modern design challenges", "Reference Moroccan building regulations (RPS, RTCM)"],
  ["Nommez des éléments architecturaux traditionnels marocains spécifiques", "Montrez comment ils résolvent des défis de design moderne", "Référencez les réglementations marocaines (RPS, RTCM)"]
),

Q("g4", "What sustainability practices should architects adopt for buildings in Morocco's hot climate?",
  "Quelles pratiques durables les architectes devraient-ils adopter pour les bâtiments dans le climat chaud du Maroc ?",
  "technical", "architecture", "medium",
  "For Morocco's hot climate (40°C+ in summer in many regions), I would implement: passive solar design with proper orientation (main facades facing north and south), high-performance thermal insulation per RTCM (Règlement Thermique de Construction au Maroc), solar shading through brise-soleil and vegetation, natural ventilation strategies exploiting Morocco's coastal breezes, and light-colored facades to reduce heat absorption. Active systems: rooftop solar PV (Morocco gets 3,000+ sunshine hours/year), solar water heating (already mandatory for new buildings in some cities), LED lighting, and efficient HVAC with heat recovery. Water conservation: greywater recycling, rainwater harvesting, and drought-resistant landscaping. I would target HQE or EDGE green building certification, increasingly requested by Moroccan developers.",
  "Pour le climat chaud du Maroc (40°C+ en été), j'implémenterais : conception solaire passive avec orientation correcte, isolation thermique haute performance selon le RTCM, protection solaire par brise-soleil et végétation, ventilation naturelle exploitant les brises côtières et façades claires. Systèmes actifs : PV solaire en toiture (3 000+ heures d'ensoleillement/an), chauffe-eau solaire, éclairage LED et CVC efficace. Conservation de l'eau : recyclage des eaux grises, récupération des eaux pluviales. Je ciblerais une certification HQE ou EDGE.",
  ["Reference the RTCM thermal regulation", "Show knowledge of Morocco's climate zones", "Include water conservation as a key sustainability measure"],
  ["Référencez le RTCM", "Montrez votre connaissance des zones climatiques du Maroc", "Incluez la conservation de l'eau comme mesure clé de durabilité"]
),

// ---------------------------------------------------------------------------
// TOURISME (15 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you develop a sustainable tourism strategy for a rural Moroccan destination?",
  "Comment développeriez-vous une stratégie de tourisme durable pour une destination rurale marocaine ?",
  "technical", "tourisme", "medium",
  "I would develop community-based tourism (CBT) following Morocco's Vision 2020 tourism strategy. Key elements: 1) Identify unique local assets — Amazigh culture, agro-tourism (argan oil cooperatives, saffron harvesting in Taliouine), mountain trekking, and traditional architecture. 2) Capacity building — train local guides, develop homestay standards with ONMT support, and create cooperatives for revenue sharing. 3) Infrastructure — eco-lodges using local materials and renewable energy, improve access roads while preserving landscape character. 4) Marketing — partner with responsible tourism operators, list on platforms like Airbnb Experiences and Viator, and create social media content showcasing authentic experiences. 5) Sustainability — limit visitor numbers, waste management programs, and water conservation. I would coordinate with ONMT and regional tourism councils. The Pays d'Accueil Touristique (PAT) framework provides a proven model for this approach.",
  "Je développerais un tourisme communautaire suivant la Vision 2020. Éléments clés : 1) Identifier les atouts locaux — culture amazighe, agro-tourisme (coopératives d'huile d'argan, safran à Taliouine), randonnée et architecture traditionnelle. 2) Renforcement des capacités — formation de guides locaux, standards de maisons d'hôtes avec support ONMT et coopératives pour le partage des revenus. 3) Infrastructure — éco-lodges en matériaux locaux et énergie renouvelable. 4) Marketing — partenariats avec des opérateurs responsables et réseaux sociaux. 5) Durabilité — limiter les visiteurs, gestion des déchets et conservation de l'eau. Le cadre PAT fournit un modèle éprouvé.",
  ["Reference Morocco's tourism strategy and ONMT", "Show knowledge of specific rural tourism opportunities", "Emphasize community benefit sharing"],
  ["Référencez la stratégie touristique et l'ONMT", "Montrez votre connaissance des opportunités de tourisme rural spécifiques", "Soulignez le partage des bénéfices avec la communauté"]
),

Q("g4", "What impact has Morocco's tourism sector had on the national economy?",
  "Quel impact le secteur touristique marocain a-t-il eu sur l'économie nationale ?",
  "competency", "tourisme", "easy",
  "Tourism is Morocco's second-largest foreign exchange earner after phosphates, contributing approximately 7% of GDP and employing 2.5 million people (direct and indirect). Morocco welcomed 14+ million tourists in recent years, generating over 90 billion MAD in revenue. Key markets: France (30% of tourists), Spain, UK, Germany, and growing numbers from the US, China, and Gulf states. The sector has driven infrastructure development (airports, highways, TGV), hotel investment (over 280,000 beds), and regional development of cities like Marrakech, Agadir, and Essaouira. Challenges include: over-concentration on Marrakech and Agadir, seasonality, and the need to develop cultural and adventure tourism beyond beach and desert experiences. The new strategy targets 17.5 million tourists and 200 billion MAD in revenue.",
  "Le tourisme est la deuxième source de devises du Maroc après les phosphates, contribuant environ 7% du PIB et employant 2,5 millions de personnes. Le Maroc accueille 14+ millions de touristes, générant plus de 90 milliards MAD. Marchés clés : France (30%), Espagne, UK, Allemagne et nombres croissants des USA, Chine et pays du Golfe. Le secteur a stimulé les infrastructures, l'investissement hôtelier (280 000+ lits) et le développement régional. Défis : surconcentration sur Marrakech et Agadir, saisonnalité et besoin de diversifier au-delà des plages et du désert.",
  ["Provide specific economic statistics", "Identify key source markets", "Address both successes and challenges"],
  ["Fournissez des statistiques économiques spécifiques", "Identifiez les marchés sources clés", "Adressez réussites et défis"]
),

// ---------------------------------------------------------------------------
// COMMUNICATION (15 questions)
// ---------------------------------------------------------------------------
Q("g4", "How would you develop a crisis communication plan for a Moroccan organization?",
  "Comment développeriez-vous un plan de communication de crise pour une organisation marocaine ?",
  "technical", "communication", "hard",
  "I would develop a comprehensive plan: 1) Risk identification — map potential crises specific to the organization and Moroccan context (political, natural disasters, social media storms in Arabic/French). 2) Crisis team — establish a crisis committee with designated spokesperson, legal counsel, and social media manager. 3) Communication channels — prepare templates in Arabic, French, and English for press releases, social media posts, and internal communications. 4) Media relations — maintain relationships with key Moroccan media (2M, SNRT, Medias24, Le360, Hespress). 5) Social media monitoring — track mentions in Darija and French on Facebook, Twitter, and Moroccan forums. 6) Training — conduct annual simulation exercises. 7) Recovery — plan for reputation repair and stakeholder re-engagement. The plan must account for Morocco's active social media landscape where crises can escalate rapidly on Facebook (most-used platform).",
  "Je développerais un plan complet : 1) Identification des risques spécifiques au contexte marocain. 2) Comité de crise avec porte-parole, conseiller juridique et responsable réseaux sociaux. 3) Canaux de communication — templates en arabe, français et anglais. 4) Relations médias — liens avec les médias marocains clés (2M, SNRT, Medias24, Le360, Hespress). 5) Veille sociale — monitoring en darija et français sur Facebook et forums marocains. 6) Formation — simulations annuelles. 7) Plan de récupération de réputation. Le plan doit tenir compte du paysage social media marocain très actif où les crises s'amplifient rapidement sur Facebook.",
  ["Reference specific Moroccan media outlets", "Address multilingual communication needs", "Consider the speed of social media escalation in Morocco"],
  ["Référencez des médias marocains spécifiques", "Adressez les besoins de communication multilingue", "Considérez la vitesse d'escalade sur les réseaux sociaux au Maroc"]
),

Q("g4", "How would you manage internal communications in a large Moroccan company with operations across multiple cities?",
  "Comment géreriez-vous la communication interne dans une grande entreprise marocaine avec des opérations dans plusieurs villes ?",
  "situational", "communication", "medium",
  "I would implement a multi-channel internal communication strategy: 1) Digital platform — Microsoft Teams or Slack for daily communication, with channels for each city office. 2) Intranet — bilingual Arabic/French portal with company news, HR policies, and knowledge base. 3) Town halls — quarterly all-hands meetings (in-person and virtual) with leadership, conducted in French with Arabic highlights. 4) Newsletter — monthly digital newsletter celebrating achievements across offices. 5) Cascade communication — ensure managers relay strategic messages consistently through structured briefing kits. Key considerations for Morocco: account for the digital divide between head office (Casablanca typically) and regional offices, ensure communication reaches factory floor workers who may not have computer access (WhatsApp groups, notice boards), and respect regional cultural nuances across cities.",
  "J'implémenterais une stratégie multicanale : 1) Plateforme digitale — Teams ou Slack avec des canaux par bureau. 2) Intranet — portail bilingue arabe/français. 3) Town halls — réunions trimestrielles en français avec résumés en arabe. 4) Newsletter — mensuelle célébrant les réalisations. 5) Communication en cascade — kits de briefing structurés pour les managers. Considérations marocaines : fracture digitale entre siège et bureaux régionaux, accès des ouvriers (groupes WhatsApp, tableaux d'affichage) et respect des nuances culturelles régionales.",
  ["Address the digital divide between offices", "Consider factory/field workers without computer access", "Show sensitivity to regional cultural differences in Morocco"],
  ["Adressez la fracture digitale entre les bureaux", "Considérez les travailleurs sans accès ordinateur", "Montrez une sensibilité aux différences culturelles régionales"]
),

// ---------------------------------------------------------------------------
// MEDECINE / PHARMACIE (15 questions)
// ---------------------------------------------------------------------------
Q("g4", "What are the main public health challenges facing Morocco today?",
  "Quels sont les principaux défis de santé publique auxquels le Maroc fait face aujourd'hui ?",
  "competency", "medecine", "medium",
  "Morocco faces a dual burden of communicable and non-communicable diseases. Key challenges: 1) NCDs — cardiovascular diseases (leading cause of death), diabetes (12% prevalence), and cancer (increasing rates, insufficient oncology infrastructure). 2) Healthcare access — significant urban-rural disparities, with some rural provinces having less than 1 doctor per 10,000 inhabitants. 3) Health financing — out-of-pocket spending represents 50% of health expenditure. 4) Human resources — Morocco has 7 doctors per 10,000 people (WHO recommends 23), brain drain to Europe. 5) Mental health — stigma and limited resources (0.7 psychiatrists per 100,000). The government's response includes: AMO (Assurance Maladie Obligatoire) generalization to cover all citizens by 2025, Plan Santé 2025, and new CHU construction in several cities.",
  "Le Maroc fait face à une double charge de maladies transmissibles et non transmissibles. Défis clés : 1) MNT — maladies cardiovasculaires (première cause de décès), diabète (12% de prévalence) et cancer. 2) Accès aux soins — disparités urbain-rural significatives. 3) Financement — les dépenses directes représentent 50% des dépenses de santé. 4) Ressources humaines — 7 médecins pour 10 000 habitants (OMS recommande 23), fuite des cerveaux. 5) Santé mentale — stigmatisation et ressources limitées. La réponse du gouvernement inclut : généralisation de l'AMO, Plan Santé 2025 et construction de nouveaux CHU.",
  ["Reference specific health statistics for Morocco", "Mention the AMO generalization program", "Address both communicable and non-communicable disease challenges"],
  ["Référencez des statistiques de santé spécifiques au Maroc", "Mentionnez la généralisation de l'AMO", "Adressez les maladies transmissibles et non transmissibles"]
),

Q("g4", "How would you improve medication access in rural Morocco?",
  "Comment amélioreriez-vous l'accès aux médicaments dans le Maroc rural ?",
  "situational", "pharmacie", "hard",
  "I would implement a multi-pronged approach: 1) Supply chain — establish regional pharmaceutical distribution hubs (similar to OCP's hub model) to reduce last-mile delivery costs to rural pharmacies. 2) Generic medications — promote and educate about generic alternatives (Morocco already produces 60% of its medications domestically through Pharma 5, SOTHEMA, Cooper Pharma). 3) Technology — deploy telemedicine and e-prescription systems to connect rural health centers with urban pharmacists. 4) Mobile pharmacy units — like the MSMS (Médecine Sans Marge de Sécurité) model for remote areas without permanent pharmacies. 5) Insurance — leverage AMO generalization to reduce out-of-pocket costs. 6) Community health workers — train local agents to educate populations about medication adherence. Coordination with the Direction du Médicament et de la Pharmacie is essential for regulatory compliance.",
  "J'implémenterais une approche multi-facettes : 1) Chaîne d'approvisionnement — hubs régionaux de distribution pharmaceutique. 2) Médicaments génériques — promotion des alternatives génériques (le Maroc produit déjà 60% de ses médicaments via Pharma 5, SOTHEMA, Cooper Pharma). 3) Technologie — télémédecine et e-prescription connectant centres ruraux et pharmaciens urbains. 4) Pharmacies mobiles pour les zones sans pharmacie permanente. 5) Assurance — exploiter la généralisation de l'AMO. 6) Agents de santé communautaires — formation à l'éducation thérapeutique. Coordination avec la Direction du Médicament et de la Pharmacie essentielle.",
  ["Reference Morocco's domestic pharmaceutical industry", "Address both supply-side and demand-side barriers", "Mention AMO as a financial access mechanism"],
  ["Référencez l'industrie pharmaceutique domestique du Maroc", "Adressez les barrières d'offre et de demande", "Mentionnez l'AMO comme mécanisme d'accès financier"]
),

// ---------------------------------------------------------------------------
// MORE GENERAL CROSS-FIELD QUESTIONS (50+ to reach 400+)
// ---------------------------------------------------------------------------
Q("g4", "How would you contribute to Morocco's Plan d'Accélération Industrielle in your field?",
  "Comment contribueriez-vous au Plan d'Accélération Industrielle du Maroc dans votre domaine ?",
  "motivation", "général", "medium",
  "The Plan d'Accélération Industrielle (PAI) targets creating 500,000 industrial jobs and increasing industrial GDP contribution to 23% by 2025. In my field, I would contribute by: developing locally relevant solutions that reduce import dependency, participating in the 'écosystèmes industriels' program that clusters supply chains around anchor companies, driving innovation in my company to move up the value chain from assembly to design and R&D, and supporting skills transfer to local workforce. The PAI focuses on key sectors: automotive, aerospace, textile, agri-food, and offshoring. I see myself playing a role in strengthening Morocco's industrial competitiveness while developing local talent through mentoring and training programs.",
  "Le PAI cible la création de 500 000 emplois industriels et l'augmentation de la contribution industrielle au PIB à 23%. Dans mon domaine, je contribuerais en : développant des solutions locales réduisant la dépendance aux importations, participant au programme 'écosystèmes industriels', stimulant l'innovation pour monter en gamme de l'assemblage vers la conception et la R&D, et soutenant le transfert de compétences. Le PAI se concentre sur : automobile, aérospatial, textile, agroalimentaire et offshoring.",
  ["Reference specific PAI targets and sectors", "Show how your skills align with industrial goals", "Propose concrete contributions beyond just employment"],
  ["Référencez les cibles et secteurs spécifiques du PAI", "Montrez comment vos compétences s'alignent avec les objectifs industriels", "Proposez des contributions concrètes au-delà de l'emploi"]
),

Q("g4", "What do you think about remote work in the Moroccan context?",
  "Que pensez-vous du travail à distance dans le contexte marocain ?",
  "behavioral", "général", "easy",
  "Remote work in Morocco has evolved significantly since 2020. For the Moroccan context, I see both opportunities and challenges. Opportunities: access to international clients and companies, reduced commuting costs (important in Casablanca with 2+ hour commutes), and talent retention in secondary cities. Challenges: internet reliability in some areas (though Morocco Telecom has invested heavily in 4G/5G), lack of dedicated workspaces in Moroccan homes (families tend to be large), cultural expectations of physical presence from traditional managers, and difficulty separating work-life boundaries. I advocate for a hybrid model — 3 days in office, 2 remote — which maintains team cohesion while offering flexibility. Morocco's labor code has been updated to include a legal framework for remote work (télétravail).",
  "Le travail à distance au Maroc a beaucoup évolué depuis 2020. Opportunités : accès aux clients internationaux, réduction des coûts de transport (important à Casablanca avec 2+ heures de trajet) et rétention des talents dans les villes secondaires. Défis : fiabilité internet dans certaines zones, manque d'espaces dédiés dans les foyers marocains (familles nombreuses), attentes culturelles de présence physique et difficulté de séparation travail-vie personnelle. Je préconise un modèle hybride — 3 jours au bureau, 2 en remote. Le Code du Travail marocain inclut désormais un cadre juridique pour le télétravail.",
  ["Address Morocco-specific remote work challenges", "Show awareness of updated labor code provisions", "Propose a practical hybrid approach"],
  ["Adressez les défis du télétravail spécifiques au Maroc", "Montrez votre connaissance des dispositions mises à jour du Code du Travail", "Proposez une approche hybride pratique"]
),

Q("g4", "How would you approach entrepreneurship in Morocco's current economic climate?",
  "Comment aborderiez-vous l'entrepreneuriat dans le climat économique actuel du Maroc ?",
  "motivation", "général", "medium",
  "Morocco's entrepreneurial ecosystem is maturing with incubators (Technopark, R&D Maroc, MasSarah), accelerators (Startup Maroc, Endeavor), and funding sources (Innov Invest, Tamwilcom, business angels networks like MBAV). I would approach entrepreneurship by: identifying a local market gap that I can solve with my technical skills, validating the idea through customer discovery with Moroccan users, starting lean with an MVP, and leveraging government programs like the auto-entrepreneur status (simplified registration, capped revenue) or the Forsa program for young entrepreneurs. Key considerations: Morocco's market is relatively small (37M population), so I would plan for Africa expansion from the start. The biggest challenges are bureaucracy, access to talent, and achieving product-market fit in a price-sensitive market.",
  "L'écosystème entrepreneurial marocain mûrit avec des incubateurs (Technopark, R&D Maroc), des accélérateurs (Startup Maroc, Endeavor) et des financements (Innov Invest, Tamwilcom, business angels MBAV). J'aborderais l'entrepreneuriat en : identifiant un gap de marché local, validant l'idée avec des utilisateurs marocains, commençant lean avec un MVP et exploitant les programmes gouvernementaux comme le statut d'auto-entrepreneur ou le programme Forsa. Le marché marocain est relativement petit (37M), donc je planifierais l'expansion africaine dès le départ.",
  ["Reference specific Moroccan incubators and funding programs", "Show knowledge of the auto-entrepreneur and Forsa programs", "Address the Africa expansion opportunity"],
  ["Référencez des incubateurs et programmes de financement marocains", "Montrez votre connaissance des programmes auto-entrepreneur et Forsa", "Adressez l'opportunité d'expansion africaine"]
),

Q("g4", "What role should AI play in Morocco's economic development?",
  "Quel rôle devrait jouer l'IA dans le développement économique du Maroc ?",
  "competency", "général", "hard",
  "AI can accelerate Morocco's development in several strategic areas: 1) Agriculture — precision farming for Plan Maroc Vert, optimizing irrigation in water-scarce regions using AI-driven weather prediction. 2) Industry — predictive maintenance for automotive and aerospace plants, quality control using computer vision. 3) Healthcare — AI-assisted diagnostics to address the doctor shortage in rural areas, drug discovery at Moroccan pharmaceutical companies. 4) Financial services — fraud detection, credit scoring for underbanked populations supporting financial inclusion. 5) Public services — chatbots for e-government services in Arabic/French/Darija, traffic optimization in Casablanca. Morocco has the foundations: growing data science talent from UM6P, ENSIAS, and INPT, and government commitment through Maroc Digital 2030. Challenges include data privacy (CNDP compliance), brain drain of AI talent, and limited local AI research funding.",
  "L'IA peut accélérer le développement du Maroc dans plusieurs domaines stratégiques : 1) Agriculture — agriculture de précision pour le Plan Maroc Vert, optimisation de l'irrigation par IA. 2) Industrie — maintenance prédictive, contrôle qualité par vision par ordinateur. 3) Santé — diagnostic assisté par IA pour compenser le manque de médecins ruraux. 4) Services financiers — détection de fraude, scoring de crédit pour l'inclusion financière. 5) Services publics — chatbots e-gouvernement en arabe/français/darija. Le Maroc a les fondations : talents data science (UM6P, ENSIAS, INPT) et engagement Maroc Digital 2030. Défis : protection des données (CNDP), fuite des cerveaux et financement limité de la recherche IA locale.",
  ["Connect AI applications to specific Moroccan development plans", "Address data privacy under CNDP regulations", "Mention Moroccan AI talent pools and institutions"],
  ["Connectez les applications IA aux plans de développement marocains", "Adressez la protection des données sous la CNDP", "Mentionnez les viviers de talents IA marocains"]
),

Q("g4", "Describe a project management methodology you would use for a Moroccan government project.",
  "Décrivez une méthodologie de gestion de projet que vous utiliseriez pour un projet gouvernemental marocain.",
  "competency", "général", "medium",
  "For a Moroccan government project, I would use a hybrid approach combining PRINCE2 (widely recognized in Moroccan public administration) with Agile delivery. Governance: establish a steering committee (comité de pilotage) with ministry representatives, define clear roles (MOA - Maîtrise d'Ouvrage, MOE - Maîtrise d'Oeuvre), and follow the procurement code (Code des Marchés Publics) for vendor selection. Delivery: break the project into phases with gates approved by the steering committee, but use sprints within each phase for actual development. Documentation: follow Moroccan public sector requirements for project documentation, progress reports, and financial tracking. Key risks in Moroccan government projects: scope changes due to political priorities, multi-stakeholder coordination across ministries, and procurement delays. I would mitigate these through strong stakeholder management and early risk identification.",
  "Pour un projet gouvernemental marocain, j'utiliserais une approche hybride combinant PRINCE2 (reconnu dans l'administration publique marocaine) avec la livraison Agile. Gouvernance : comité de pilotage avec représentants ministériels, rôles clairs (MOA, MOE) et respect du Code des Marchés Publics. Livraison : phases avec jalons approuvés, mais sprints au sein de chaque phase. Documentation : respect des exigences du secteur public. Risques clés : changements de périmètre, coordination multi-ministérielle et retards d'approvisionnement. Mitigation par une gestion des parties prenantes solide.",
  ["Reference PRINCE2 and its recognition in Moroccan public sector", "Mention the Code des Marchés Publics", "Address common risks in Moroccan government projects"],
  ["Référencez PRINCE2 et sa reconnaissance dans le secteur public marocain", "Mentionnez le Code des Marchés Publics", "Adressez les risques courants des projets gouvernementaux marocains"]
),

Q("g4", "How do you think Morocco's education system prepares graduates for the job market?",
  "Comment pensez-vous que le système éducatif marocain prépare les diplômés au marché du travail ?",
  "behavioral", "général", "medium",
  "Morocco's education system has strengths and gaps. Strengths: strong theoretical foundations in engineering schools (EMI, EHTP, ENSIAS, IMTA), growing emphasis on practical projects and internships (stages de fin d'études are mandatory), and increasing adoption of international standards. Gaps: insufficient soft skills training (communication, teamwork, entrepreneurship), limited exposure to real-world tools and technologies, language barriers (transition from Arabic/French education to English-dominant tech industry), and disconnect between curricula and rapidly evolving market needs. I compensate for these gaps through: self-directed learning on platforms like Coursera and Udemy, participation in hackathons and coding challenges, professional certifications, and networking through industry events. Morocco's new education reform (Loi-cadre 51-17) aims to address many of these issues.",
  "Le système éducatif marocain a des forces et des lacunes. Forces : bases théoriques solides dans les écoles d'ingénieurs, emphase croissante sur les projets pratiques et stages, et adoption des standards internationaux. Lacunes : formation insuffisante en soft skills, exposition limitée aux outils réels, barrières linguistiques et décalage entre les curricula et les besoins du marché. Je compense par : l'auto-formation sur Coursera et Udemy, la participation aux hackathons, les certifications professionnelles et le réseautage. La réforme éducative (Loi-cadre 51-17) vise à adresser ces problèmes.",
  ["Be balanced — acknowledge both strengths and weaknesses", "Show proactive measures to fill gaps", "Reference specific Moroccan schools and reforms"],
  ["Soyez équilibré — reconnaissez forces et faiblesses", "Montrez des mesures proactives pour combler les lacunes", "Référencez des écoles et réformes marocaines spécifiques"]
),

Q("g4", "What is your understanding of Morocco's renewable energy targets and how do they affect your industry?",
  "Quelle est votre compréhension des objectifs énergétiques renouvelables du Maroc et comment affectent-ils votre industrie ?",
  "competency", "général", "medium",
  "Morocco targets 52% of installed electricity capacity from renewable sources by 2030: 20% solar, 20% wind, and 12% hydro. Major projects: Noor Ouarzazate (580 MW CSP/PV), Tarfaya wind farm (300 MW), Midelt hybrid solar (800 MW), and the planned Dakhla wind farm. MASEN and ONEE manage the development. For my industry, this creates opportunities in: equipment manufacturing and maintenance, grid integration engineering, energy storage systems, green hydrogen (Morocco's emerging focus), and energy management consulting. The clean energy transition also means new regulatory requirements for industrial energy efficiency (RTCM for buildings, ISO 50001 for industry). Morocco's competitive advantage in renewables positions it as a potential green hydrogen exporter to Europe, creating an entirely new industrial value chain.",
  "Le Maroc cible 52% de capacité électrique installée renouvelable d'ici 2030 : 20% solaire, 20% éolien et 12% hydro. Projets majeurs : Noor Ouarzazate (580 MW), parc éolien de Tarfaya (300 MW), solaire hybride de Midelt (800 MW) et parc éolien de Dakhla prévu. MASEN et ONEE gèrent le développement. Pour mon industrie, cela crée des opportunités en : fabrication et maintenance d'équipements, intégration réseau, stockage d'énergie, hydrogène vert (nouveau focus du Maroc) et consulting en gestion énergétique. L'avantage compétitif du Maroc le positionne comme exportateur potentiel d'hydrogène vert vers l'Europe.",
  ["Reference specific renewable energy projects and targets", "Mention MASEN and ONEE roles", "Connect to emerging opportunities like green hydrogen"],
  ["Référencez les projets et objectifs spécifiques d'énergie renouvelable", "Mentionnez les rôles de MASEN et ONEE", "Connectez aux opportunités émergentes comme l'hydrogène vert"]
),

Q("g4", "How would you approach networking and professional development in the Moroccan business community?",
  "Comment aborderiez-vous le réseautage et le développement professionnel dans la communauté d'affaires marocaine ?",
  "behavioral", "général", "easy",
  "In Morocco, professional relationships (الماعارف) are crucial. I would: 1) Join professional associations — CGEM for general business, APEBI for IT, AMITH for textile, or field-specific engineering associations. 2) Attend industry events — Gitex Africa in Marrakech, Salon de l'Agriculture in Meknès, Forum EMI Entreprises. 3) Leverage LinkedIn — Morocco has 4M+ LinkedIn users; I would share content and engage with industry discussions. 4) Alumni networks — IMTA alumni associations are powerful networks. 5) Informal networking — in Moroccan culture, relationships are built over coffee/tea and social interactions, not just formal events. I would also pursue certifications (PMP, AWS, Cisco) and attend training programs offered by OFPPT or ANAPEC. Mentorship from senior professionals provides invaluable career guidance.",
  "Au Maroc, les relations professionnelles (الماعارف) sont cruciales. Je : 1) Rejoindrais des associations professionnelles — CGEM, APEBI pour l'IT. 2) Assisterais aux événements — Gitex Africa à Marrakech, Salon de l'Agriculture à Meknès. 3) Exploiterais LinkedIn — le Maroc a 4M+ utilisateurs. 4) Réseaux d'anciens élèves — les associations alumni sont de puissants réseaux. 5) Réseautage informel — dans la culture marocaine, les relations se construisent autour d'un café/thé. Je poursuivrais aussi des certifications et des programmes de formation OFPPT ou ANAPEC. Le mentorat de professionnels seniors apporte des conseils de carrière inestimables.",
  ["Reference specific Moroccan professional associations and events", "Acknowledge the importance of informal relationships", "Show a multi-channel approach to networking"],
  ["Référencez des associations et événements professionnels marocains", "Reconnaissez l'importance des relations informelles", "Montrez une approche multicanale du réseautage"]
),

Q("g4", "What impact has the COVID-19 pandemic had on Morocco's economy and what lessons were learned?",
  "Quel impact la pandémie de COVID-19 a-t-elle eu sur l'économie marocaine et quelles leçons en ont été tirées ?",
  "competency", "général", "medium",
  "COVID-19 caused Morocco's GDP to contract by 6.3% in 2020 — the worst recession in decades. Key impacts: tourism collapsed (2.5M visitors vs 13M pre-COVID), exports declined, and the informal sector (30% of GDP) was severely affected with no safety nets. Government response: Fonds COVID-19 (34 billion MAD), direct cash transfers to informal workers via mobile money (5M households), interest-free loans for businesses, and an accelerated vaccination campaign (Morocco was among Africa's fastest vaccinators). Lessons learned: need for economic diversification beyond tourism, importance of digital infrastructure (e-commerce grew 30%), strengthening the healthcare system (CHU capacity doubled in some cities), and formalizing the informal economy. The pandemic accelerated Morocco's digital transformation by 3-5 years and highlighted the need for social protection reform.",
  "La COVID-19 a causé une contraction du PIB de 6,3% en 2020. Impacts clés : effondrement du tourisme, baisse des exportations et impact sévère du secteur informel (30% du PIB). Réponse gouvernementale : Fonds COVID-19 (34 milliards MAD), transferts directs aux travailleurs informels via mobile money (5M de ménages), prêts sans intérêt et campagne de vaccination accélérée. Leçons : nécessité de diversification économique, importance de l'infrastructure digitale, renforcement du système de santé et formalisation de l'économie informelle. La pandémie a accéléré la transformation digitale de 3-5 ans.",
  ["Provide specific economic impact figures", "Reference Morocco's vaccination achievement", "Connect lessons to current economic strategy"],
  ["Fournissez des chiffres d'impact économique spécifiques", "Référencez la réalisation vaccinale du Maroc", "Connectez les leçons à la stratégie économique actuelle"]
),

Q("g4", "How do you see the role of women in Morocco's workforce evolving?",
  "Comment voyez-vous l'évolution du rôle des femmes dans la main-d'œuvre marocaine ?",
  "behavioral", "général", "medium",
  "Morocco's female labor force participation is approximately 20% — among the lowest in the MENA region. However, progress is being made: the 2011 Constitution enshrines gender equality, the Moudawana reform (2004) improved women's legal rights, and female enrollment in higher education now exceeds male enrollment. In engineering specifically, women represent 35-40% of graduates from schools like ENSIAS and EHTP. Challenges remain: cultural barriers in rural areas, childcare infrastructure gaps, and workplace discrimination. I support workplace diversity because diverse teams outperform homogeneous ones. As an ally, I would advocate for: fair hiring practices, flexible work arrangements for parents, mentorship programs for women in leadership, and zero tolerance for harassment as per Loi 103-13.",
  "La participation des femmes au marché du travail marocain est d'environ 20% — parmi les plus basses de la région MENA. Mais des progrès existent : la Constitution de 2011 consacre l'égalité, la réforme de la Moudawana (2004) a amélioré les droits des femmes et l'inscription féminine dans l'enseignement supérieur dépasse celle des hommes. En ingénierie, les femmes représentent 35-40% des diplômés. Défis : barrières culturelles rurales, infrastructure de garde d'enfants et discrimination. Je soutiens la diversité et plaiderais pour des pratiques d'embauche équitables, la flexibilité pour les parents et la tolérance zéro pour le harcèlement (Loi 103-13).",
  ["Show awareness of both progress and remaining challenges", "Reference specific Moroccan laws and reforms", "Demonstrate personal commitment to workplace equality"],
  ["Montrez votre conscience des progrès et défis restants", "Référencez des lois et réformes marocaines spécifiques", "Démontrez un engagement personnel pour l'égalité au travail"]
),

Q("g4", "What strategies would you use to improve customer satisfaction in a Moroccan service company?",
  "Quelles stratégies utiliseriez-vous pour améliorer la satisfaction client dans une entreprise de services marocaine ?",
  "situational", "général", "medium",
  "In Morocco's service sector, customer expectations are evolving rapidly. I would implement: 1) Multichannel support — phone (still preferred by many Moroccans), WhatsApp (widely used for business), social media (Facebook page management), and in-person for complex issues. 2) Customer feedback — NPS surveys in Arabic and French, post-interaction SMS surveys, and social media sentiment monitoring. 3) Employee training — customer service excellence programs adapted to Moroccan hospitality culture (which naturally values warmth and personal attention). 4) Service standards — define response time SLAs (24h for email, 4h for social media, immediate for phone). 5) CRM system — implement Salesforce or HubSpot to track customer interactions and preferences. Moroccan consumers appreciate personalized service and relationship building — technology should enhance, not replace, the human touch.",
  "Dans le secteur des services marocain, j'implémenterais : 1) Support multicanal — téléphone, WhatsApp (très utilisé pour le business), réseaux sociaux et en personne. 2) Feedback client — enquêtes NPS en arabe et français, SMS post-interaction et monitoring des réseaux sociaux. 3) Formation — programmes d'excellence service adaptés à la culture d'hospitalité marocaine. 4) Standards de service — SLA de temps de réponse. 5) CRM — Salesforce ou HubSpot pour suivre les interactions. Les consommateurs marocains apprécient le service personnalisé — la technologie doit renforcer, pas remplacer, le contact humain.",
  ["Emphasize WhatsApp as a key Moroccan customer service channel", "Leverage Moroccan hospitality culture as a strength", "Balance technology with personal touch"],
  ["Soulignez WhatsApp comme canal clé de service client marocain", "Exploitez la culture d'hospitalité marocaine comme force", "Équilibrez technologie et contact humain"]
),

Q("g4", "How would you handle a situation where company goals conflict with local community interests in Morocco?",
  "Comment géreriez-vous une situation où les objectifs de l'entreprise entrent en conflit avec les intérêts de la communauté locale au Maroc ?",
  "situational", "général", "hard",
  "In Morocco, where community ties are strong, ignoring local interests can lead to protests and project delays (as seen with some mining and development projects). I would: 1) Stakeholder mapping — identify community leaders, local authorities (caïd, commune president), and civil society organizations. 2) Dialogue — organize town hall meetings (explain the project benefits in accessible terms, in Darija). 3) Shared value — find ways to create mutual benefit (local hiring, infrastructure improvements, community development fund). 4) Environmental impact — ensure transparent EIA process per Loi 12-03. 5) Mediation — involve the wali or CRI if negotiations stall. I would document agreements and follow through on commitments. In my experience, projects that engage communities early and transparently are far more successful than those that try to push through opposition. The social license to operate is as important as the legal permit.",
  "Au Maroc, où les liens communautaires sont forts, ignorer les intérêts locaux peut mener à des protestations. Je : 1) Cartographierais les parties prenantes — leaders communautaires, autorités locales (caïd, président de commune). 2) Organiserais le dialogue — réunions publiques en darija. 3) Créerais de la valeur partagée — embauche locale, amélioration d'infrastructure, fonds de développement communautaire. 4) Impact environnemental — processus EIE transparent selon Loi 12-03. 5) Médiation — impliquer le wali ou CRI si nécessaire. Les projets qui engagent tôt les communautés réussissent bien mieux. La licence sociale d'opérer est aussi importante que le permis légal.",
  ["Show understanding of Moroccan local governance structures", "Reference environmental assessment requirements", "Emphasize early engagement over confrontation"],
  ["Montrez votre compréhension des structures de gouvernance locale", "Référencez les exigences d'évaluation environnementale", "Soulignez l'engagement précoce plutôt que la confrontation"]
),

Q("g4", "What is your opinion on Morocco's position as a nearshoring destination for European companies?",
  "Quelle est votre opinion sur le positionnement du Maroc comme destination de nearshoring pour les entreprises européennes ?",
  "competency", "général", "medium",
  "Morocco is an increasingly attractive nearshoring destination for Europe, offering: geographic proximity (3 hours from Paris), cultural affinity (French-speaking, European business culture), competitive costs (40-60% savings vs. Western Europe), established industrial ecosystems (automotive, aerospace, IT), strong infrastructure (Tanger Med, highways, fiber optic network), and stable political environment. Companies like Capgemini, Atos, CGI, and Accenture have major operations in Morocco. For IT specifically, Casablanca and Rabat's tech hubs employ 70,000+ in outsourcing. Challenges: talent competition among employers, need for specialized skills (AI, cloud), and retention (brain drain). Compared to competitors (Tunisia, Romania, India), Morocco stands out for its combination of cost, proximity, and infrastructure. I believe Morocco should move from cost arbitrage to value-added services to sustain this positioning.",
  "Le Maroc est une destination de nearshoring de plus en plus attractive pour l'Europe : proximité géographique (3h de Paris), affinité culturelle (francophone), coûts compétitifs (40-60% d'économies), écosystèmes industriels établis, infrastructure solide et stabilité politique. Des entreprises comme Capgemini, Atos et Accenture ont des opérations majeures au Maroc. Pour l'IT, Casablanca et Rabat emploient 70 000+ en outsourcing. Défis : concurrence entre employeurs, besoin de compétences spécialisées et rétention. Le Maroc devrait passer de l'arbitrage de coûts aux services à valeur ajoutée.",
  ["Provide specific cost comparisons", "Reference major nearshoring companies in Morocco", "Compare with competing nearshoring destinations"],
  ["Fournissez des comparaisons de coûts spécifiques", "Référencez des entreprises majeures de nearshoring au Maroc", "Comparez avec les destinations concurrentes"]
),

Q("g4", "How would you approach continuous improvement (Kaizen) in your daily work?",
  "Comment aborderiez-vous l'amélioration continue (Kaizen) dans votre travail quotidien ?",
  "behavioral", "général", "easy",
  "I apply Kaizen through small, daily improvements. In practice: 1) Daily reflection — spend 10 minutes each evening reviewing what went well and what could improve. 2) Process documentation — when I find a better way to do something, I document it for the team. 3) Measurement — track key metrics for my work (time to complete tasks, error rates, customer satisfaction). 4) Gemba walks — regularly observe actual work processes, not just review reports. 5) PDCA cycle — Plan-Do-Check-Act for every improvement initiative. At IMTA, I applied this during my internship by creating a suggestions box system for the production team, which generated 12 implemented improvements in 3 months. The key is making improvement a habit, not a special project. In Moroccan companies, I find that involving frontline workers in improvement ideas increases both quality and engagement.",
  "J'applique le Kaizen par de petites améliorations quotidiennes : 1) Réflexion quotidienne — 10 minutes chaque soir. 2) Documentation des processus. 3) Mesure — suivi des métriques clés. 4) Gemba walks — observer les processus réels. 5) Cycle PDCA pour chaque initiative d'amélioration. À l'IMTA, j'ai créé un système de boîte à suggestions pour l'équipe de production, générant 12 améliorations implémentées en 3 mois. L'essentiel est de faire de l'amélioration une habitude. Dans les entreprises marocaines, impliquer les opérateurs dans les idées d'amélioration augmente la qualité et l'engagement.",
  ["Show practical daily application of Kaizen", "Give a concrete example with measurable results", "Emphasize employee involvement in improvement"],
  ["Montrez une application quotidienne pratique du Kaizen", "Donnez un exemple concret avec des résultats mesurables", "Soulignez l'implication des employés dans l'amélioration"]
),

Q("g4", "What cybersecurity measures would you recommend for a Moroccan financial institution?",
  "Quelles mesures de cybersécurité recommanderiez-vous pour une institution financière marocaine ?",
  "technical", "général", "hard",
  "For a Moroccan financial institution, I would implement a defense-in-depth strategy: 1) Regulatory compliance — follow Bank Al-Maghrib's circulaire on IT risk management and DGSSI (Direction Générale de la Sécurité des Systèmes d'Information) guidelines. 2) Network security — next-gen firewalls, IDS/IPS, network segmentation, and encrypted communications. 3) Identity management — multi-factor authentication, privileged access management (PAM), and Zero Trust architecture. 4) Data protection — encryption at rest and in transit, DLP solutions, and compliance with Loi 09-08 (CNDP). 5) Incident response — 24/7 SOC (Security Operations Center), SIEM deployment, and regular penetration testing. 6) Employee training — phishing simulations (Moroccan banking staff are frequently targeted), security awareness in Arabic and French. 7) Business continuity — disaster recovery site, regular backup testing. Morocco's DGSSI provides a national cybersecurity framework that all critical infrastructure must follow.",
  "Pour une institution financière marocaine, j'implémenterais une défense en profondeur : 1) Conformité réglementaire — circulaire Bank Al-Maghrib sur la gestion des risques IT et directives DGSSI. 2) Sécurité réseau — firewalls, IDS/IPS, segmentation et chiffrement. 3) Gestion des identités — MFA, PAM et architecture Zero Trust. 4) Protection des données — chiffrement et conformité Loi 09-08 (CNDP). 5) Réponse aux incidents — SOC 24/7, SIEM et tests de pénétration réguliers. 6) Formation — simulations de phishing, sensibilisation en arabe et français. 7) Continuité d'activité — site de reprise et tests de sauvegarde. La DGSSI fournit un cadre national de cybersécurité.",
  ["Reference Moroccan cybersecurity regulations (DGSSI, Bank Al-Maghrib)", "Address the human element in security", "Show knowledge of compliance requirements (Loi 09-08)"],
  ["Référencez les réglementations cybersécurité marocaines (DGSSI, Bank Al-Maghrib)", "Adressez l'élément humain de la sécurité", "Montrez votre connaissance des exigences de conformité (Loi 09-08)"]
),

Q("g4", "How would you prepare for an assessment center as part of a recruitment process in Morocco?",
  "Comment vous prépareriez-vous pour un assessment center dans le cadre d'un processus de recrutement au Maroc ?",
  "behavioral", "général", "easy",
  "Assessment centers are increasingly used by major Moroccan employers (OCP, Attijariwafa Bank, multinationals). I would prepare for: 1) Group exercises — practice leading and contributing to team discussions, showing both leadership and collaboration. 2) Case studies — prepare by analyzing Moroccan business cases (from HEC Casablanca or EM Lyon Casablanca case competitions). 3) Presentations — practice presenting complex ideas clearly in French and English. 4) Psychometric tests — practice numerical, verbal, and logical reasoning on platforms like SHL or cut-e. 5) Role plays — prepare for customer/stakeholder interaction scenarios. 6) Interview — prepare STAR-method stories from my education and internship experience. General tips: dress professionally (Moroccan business environments tend toward formal dress code), arrive early, be authentic, and show genuine interest in the company. Research the company thoroughly using their annual report, LinkedIn, and recent news.",
  "Les assessment centers sont de plus en plus utilisés par les grands employeurs marocains (OCP, Attijariwafa Bank). Je me préparerais pour : 1) Exercices de groupe — pratiquer la direction et la contribution aux discussions. 2) Études de cas — analyser des cas business marocains. 3) Présentations — pratiquer en français et anglais. 4) Tests psychométriques — s'entraîner au raisonnement numérique et verbal sur SHL. 5) Jeux de rôle — préparer des scénarios d'interaction. 6) Entretien — préparer des histoires STAR. Conseils : tenue professionnelle (les environnements marocains tendent vers le formel), arriver en avance, être authentique et rechercher l'entreprise en profondeur.",
  ["Reference specific Moroccan companies that use assessment centers", "Address all components of a typical assessment center", "Include cultural tips specific to Moroccan business culture"],
  ["Référencez des entreprises marocaines utilisant des assessment centers", "Adressez tous les composants d'un assessment center typique", "Incluez des conseils culturels spécifiques au business marocain"]
),

Q("g4", "How do you think Morocco should prepare its workforce for Industry 4.0?",
  "Comment pensez-vous que le Maroc devrait préparer sa main-d'œuvre pour l'Industrie 4.0 ?",
  "competency", "général", "hard",
  "Morocco's Industry 4.0 readiness requires action on multiple fronts: 1) Education reform — update engineering curricula to include IoT, AI/ML, robotics, and data analytics (some schools like EMINES and UM6P are leading). 2) Vocational training — OFPPT should create Industry 4.0 certification programs for existing factory workers. 3) Public-private partnerships — companies like Renault and Safran should co-develop training programs with Moroccan schools. 4) Digital infrastructure — expand high-speed internet to industrial zones and invest in 5G. 5) Innovation ecosystem — create Industry 4.0 demonstration centers where SMEs can experience technologies before investing. 6) Policy — incentivize companies that invest in workforce digital upskilling through tax credits. The biggest risk is a two-speed economy where large multinationals adopt Industry 4.0 while Moroccan SMEs fall behind. The PAI should include specific Industry 4.0 support measures for SMEs.",
  "La préparation du Maroc à l'Industrie 4.0 nécessite des actions multiples : 1) Réforme éducative — mettre à jour les curricula d'ingénierie (EMINES et UM6P montrent l'exemple). 2) Formation professionnelle — l'OFPPT devrait créer des certifications Industrie 4.0. 3) Partenariats public-privé — Renault et Safran devraient co-développer des programmes avec les écoles. 4) Infrastructure digitale — internet haut débit dans les zones industrielles et 5G. 5) Centres de démonstration pour les PME. 6) Politique — incitations fiscales pour la montée en compétences digitales. Le plus grand risque est une économie à deux vitesses entre multinationales et PME marocaines.",
  ["Address the SME gap in digital transformation", "Reference specific Moroccan institutions and companies", "Propose actionable solutions at multiple levels"],
  ["Adressez l'écart des PME dans la transformation digitale", "Référencez des institutions et entreprises marocaines", "Proposez des solutions actionnables à plusieurs niveaux"]
),

Q("g4", "What environmental sustainability initiatives do you think are most important for Morocco?",
  "Quelles initiatives de durabilité environnementale pensez-vous être les plus importantes pour le Maroc ?",
  "competency", "général", "medium",
  "Morocco faces critical environmental challenges: water scarcity (500 m3/person/year — below the 1,000 m3 stress threshold), desertification, and pollution from industrial and urban growth. Priority initiatives: 1) Water — implement the PNE (Plan National de l'Eau) with desalination plants (Casablanca mega-project), wastewater reuse, and traditional khettara rehabilitation. 2) Energy — accelerate the 52% renewable target, develop green hydrogen. 3) Waste — enforce Loi 28-00 on waste management, develop recycling infrastructure (currently only 10% recycling rate). 4) Forests — expand the Haut-Commissariat aux Eaux et Forêts reforestation programs to combat desertification. 5) Circular economy — promote industrial symbiosis in free zones. Morocco showed leadership by hosting COP22 and the Marrakech Partnership for Global Climate Action. The challenge is translating international commitments into local action, especially in rapidly growing cities.",
  "Le Maroc fait face à des défis environnementaux critiques : stress hydrique (500 m3/personne/an), désertification et pollution. Initiatives prioritaires : 1) Eau — implémenter le PNE avec stations de dessalement, réutilisation des eaux usées et réhabilitation des khettaras. 2) Énergie — accélérer l'objectif de 52% renouvelable et développer l'hydrogène vert. 3) Déchets — appliquer la Loi 28-00 et développer le recyclage (actuellement 10%). 4) Forêts — étendre les programmes de reboisement. 5) Économie circulaire — promouvoir la symbiose industrielle. Le Maroc a montré son leadership en accueillant la COP22. Le défi est de traduire les engagements internationaux en action locale.",
  ["Reference specific Moroccan environmental laws and statistics", "Address water scarcity as a critical priority", "Mention Morocco's COP22 legacy"],
  ["Référencez des lois et statistiques environnementales marocaines spécifiques", "Adressez le stress hydrique comme priorité critique", "Mentionnez l'héritage COP22 du Maroc"]
),

Q("g4", "How would you implement data-driven decision making in a Moroccan organization that relies on intuition?",
  "Comment implémenteriez-vous la prise de décision basée sur les données dans une organisation marocaine qui s'appuie sur l'intuition ?",
  "situational", "général", "medium",
  "Transitioning from intuition to data-driven culture in Moroccan companies requires a gradual approach. I would: 1) Start small — choose one business area where data can show quick, visible impact (e.g., sales forecasting or inventory optimization). 2) Build trust — present data insights alongside existing expertise, not as a replacement. 3) Visualize — create simple, bilingual dashboards (Power BI or Tableau) that non-technical managers can understand. 4) Train — hands-on workshops for managers on interpreting data, not just technical staff. 5) Celebrate wins — when data-driven decisions lead to better outcomes, publicize them internally. 6) Infrastructure — ensure clean data collection with proper ERP/CRM usage. In Moroccan organizations, where senior leaders' experience is deeply respected, I would frame data as a complement to their expertise: 'Your intuition identified the trend — the data confirms and quantifies it.' This respectful approach builds buy-in without threatening established authority.",
  "La transition de l'intuition aux données dans les entreprises marocaines nécessite une approche graduelle : 1) Commencer petit — choisir un domaine où les données montrent un impact rapide. 2) Construire la confiance — présenter les données comme complément, pas remplacement. 3) Visualiser — tableaux de bord simples bilingues. 4) Former — ateliers pratiques pour les managers. 5) Célébrer les succès — quand les décisions data mènent à de meilleurs résultats. 6) Infrastructure — assurer une collecte de données propre. Dans les organisations marocaines où l'expérience des seniors est respectée, je présenterais les données comme complément : 'Votre intuition a identifié la tendance — les données la confirment et la quantifient.'",
  ["Show respect for existing expertise while advocating for data", "Propose a gradual, non-threatening transition", "Address cultural sensitivity around authority and seniority"],
  ["Montrez du respect pour l'expertise existante en plaidant pour les données", "Proposez une transition graduelle et non menaçante", "Adressez la sensibilité culturelle autour de l'autorité et l'ancienneté"]
),

Q("g4", "What do you know about Morocco's digital identity and e-government initiatives?",
  "Que savez-vous des initiatives d'identité digitale et d'e-gouvernement du Maroc ?",
  "competency", "général", "medium",
  "Morocco has made significant progress in e-government: the idarati portal provides access to 600+ administrative procedures online, the CNSS Damancom platform handles social security declarations digitally, and the DGI Simpl-TVA/IS platforms enable online tax filing. The CNIE (Carte Nationale d'Identité Électronique) with biometric data is the foundation for digital identity. The ADD (Agence du Développement du Digital) coordinates the digital government strategy. Key achievements: online business registration through the CRI, digital court filing system, and e-procurement platform for government contracts. Challenges remain: digital literacy gaps (especially in rural areas), interoperability between ministry systems, and the need for a unified digital identity platform. The new Charte du Numérique sets the framework for comprehensive digital transformation of public services.",
  "Le Maroc a progressé significativement en e-gouvernement : le portail idarati donne accès à 600+ procédures administratives en ligne, la plateforme CNSS Damancom gère les déclarations numériquement et les plateformes DGI Simpl permettent la déclaration fiscale en ligne. La CNIE avec données biométriques est la base de l'identité digitale. L'ADD coordonne la stratégie. Réalisations clés : inscription commerciale en ligne via CRI, système judiciaire digital et e-procurement. Défis : littératie digitale, interopérabilité entre ministères et besoin d'une plateforme d'identité unifiée.",
  ["Reference specific Moroccan e-government platforms", "Show knowledge of the ADD and its role", "Address both achievements and remaining challenges"],
  ["Référencez des plateformes e-gouvernement marocaines spécifiques", "Montrez votre connaissance de l'ADD", "Adressez les réalisations et défis restants"]
),

Q("g4", "How would you manage the transition from a project-based to a product-based organization?",
  "Comment géreriez-vous la transition d'une organisation basée projets vers une organisation basée produits ?",
  "situational", "management", "hard",
  "This transition is common in Moroccan IT services companies moving from custom development to SaaS products. I would: 1) Assess readiness — evaluate the team's product mindset, technical capabilities, and financial runway. 2) Pilot — select one project that has repeat client demand and convert it into a product with a dedicated cross-functional team (developers, designer, product owner). 3) Org structure — gradually shift from project managers to product managers, from time-based billing to subscription/license models. 4) Metrics — move from project delivery metrics (on-time, on-budget) to product metrics (MRR, churn, NPS, feature adoption). 5) Culture — foster experimentation, customer obsession, and iterative development over big-bang releases. 6) Revenue transition — maintain project revenue while growing product revenue. This dual-track approach reduces risk. Many Moroccan IT companies like Involys and HPS have successfully made this transition.",
  "Cette transition est courante dans les ESN marocaines passant du développement sur mesure au SaaS. Je : 1) Évaluerais la maturité — mentalité produit, capacités techniques et trésorerie. 2) Pilote — sélectionner un projet avec demande récurrente et le convertir en produit. 3) Structure — passer des chefs de projet aux product managers, de la facturation au temps au modèle abonnement. 4) Métriques — des métriques projet (délai, budget) aux métriques produit (MRR, churn, NPS). 5) Culture — expérimentation et développement itératif. 6) Transition de revenus — maintenir les revenus projets en développant les revenus produits. Des ESN marocaines comme Involys et HPS ont réussi cette transition.",
  ["Reference Moroccan IT companies that made this transition", "Show understanding of the revenue model change", "Propose a low-risk, phased approach"],
  ["Référencez des ESN marocaines ayant réussi cette transition", "Montrez votre compréhension du changement de modèle de revenus", "Proposez une approche par phases à faible risque"]
),

Q("g4", "What strategies would you use to retain top talent in a competitive Moroccan job market?",
  "Quelles stratégies utiliseriez-vous pour retenir les meilleurs talents dans un marché du travail marocain compétitif ?",
  "situational", "ressources-humaines", "hard",
  "Morocco's talent market is increasingly competitive, especially in IT and engineering where demand exceeds supply. Retention strategies: 1) Compensation — regular market benchmarking using ReKrute salary surveys, competitive salaries plus performance bonuses. 2) Career development — clear career paths with promotion timelines, training budgets (10,000+ MAD/year per employee), and international mobility opportunities. 3) Work-life balance — flexible hours, hybrid work, and generous leave policies. 4) Culture — build an inclusive, meritocratic culture (challenging in traditionally hierarchical Moroccan companies). 5) Manager quality — train managers in coaching and people development (poor managers are the #1 reason for turnover in Morocco). 6) Benefits — health insurance (mutuelle complémentaire), transport allowances, and meal vouchers. 7) Purpose — connect employees to the company's impact on Moroccan society. Regular stay interviews (not just exit interviews) help identify retention risks early.",
  "Le marché du talent marocain est de plus en plus compétitif, surtout en IT et ingénierie. Stratégies de rétention : 1) Rémunération — benchmarking avec les enquêtes ReKrute, salaires compétitifs plus primes. 2) Développement de carrière — parcours clairs, budgets formation (10 000+ MAD/an) et mobilité internationale. 3) Équilibre vie pro/perso — flexibilité, hybride et congés généreux. 4) Culture — inclusive et méritocratique. 5) Qualité managériale — former les managers au coaching (les mauvais managers sont la raison #1 du turnover au Maroc). 6) Avantages — mutuelle complémentaire, transport et tickets restaurant. 7) Sens — connecter les employés à l'impact sociétal. Des entretiens de rétention réguliers aident à identifier les risques tôt.",
  ["Address the specific talent competition in Morocco's IT sector", "Reference local salary benchmarking tools", "Show understanding of both monetary and non-monetary retention"],
  ["Adressez la concurrence talent spécifique dans l'IT marocain", "Référencez les outils de benchmarking salarial locaux", "Montrez votre compréhension de la rétention monétaire et non monétaire"]
),

Q("g4", "How would you approach quality management for a Moroccan company seeking ISO certification?",
  "Comment aborderiez-vous le management de la qualité pour une entreprise marocaine cherchant la certification ISO ?",
  "competency", "génie-industriel", "medium",
  "I would follow a structured approach for ISO 9001 certification: 1) Gap analysis — assess current processes against ISO 9001:2015 requirements. 2) Management commitment — secure top management endorsement and allocate resources. 3) Documentation — develop quality manual, procedures, and work instructions (bilingual Arabic/French). 4) Training — train all employees on quality culture and their specific procedures. 5) Internal audits — conduct a full internal audit cycle before the certification audit. 6) Management review — conduct a formal review per ISO requirements. 7) Certification audit — select an accredited body (Bureau Veritas Maroc, SGS Maroc, TÜV). Key considerations for Moroccan companies: IMANOR (Institut Marocain de Normalisation) is Morocco's standards body and manages the NM (Norme Marocaine) system. Many Moroccan companies view ISO as a market access requirement for European exports, so I would emphasize the business benefit beyond just the certificate.",
  "Je suivrais une approche structurée pour la certification ISO 9001 : 1) Analyse d'écart — évaluer les processus actuels vs ISO 9001:2015. 2) Engagement de la direction. 3) Documentation — manuel qualité, procédures en arabe/français. 4) Formation de tous les employés. 5) Audits internes — cycle complet avant l'audit de certification. 6) Revue de direction. 7) Audit de certification — sélectionner un organisme accrédité (Bureau Veritas Maroc, SGS). IMANOR est l'organisme de normalisation marocain. Beaucoup d'entreprises marocaines voient l'ISO comme une exigence d'accès au marché européen — je soulignerais le bénéfice business au-delà du certificat.",
  ["Reference IMANOR and Moroccan accreditation bodies", "Show the phased ISO implementation approach", "Address the business case beyond the certificate"],
  ["Référencez IMANOR et les organismes d'accréditation marocains", "Montrez l'approche d'implémentation ISO par phases", "Adressez le business case au-delà du certificat"]
),

Q("g4", "How would you build a data analytics capability for a Moroccan retail chain?",
  "Comment développeriez-vous une capacité d'analyse de données pour une chaîne de retail marocaine ?",
  "technical", "génie-informatique", "hard",
  "For a Moroccan retail chain (like Marjane, Carrefour Market, or BIM), I would: 1) Data infrastructure — centralize POS data from all stores, implement a data warehouse (BigQuery or Snowflake), and create ETL pipelines for daily data ingestion. 2) Customer analytics — analyze purchase patterns, basket analysis for cross-selling, and customer segmentation for targeted promotions. 3) Inventory optimization — demand forecasting using ML models that account for Moroccan-specific patterns (Ramadan, Eid, summer, and back-to-school spikes). 4) Pricing analytics — dynamic pricing based on competition, demand elasticity, and margin optimization. 5) Supply chain — optimize distribution from central warehouses to stores, reduce stockouts and overstock. I would start with Power BI dashboards for store managers and gradually introduce more sophisticated ML models. Training local data analysts is critical — I would partner with Moroccan data science bootcamps for talent pipeline.",
  "Pour une chaîne de retail marocaine (Marjane, Carrefour Market, BIM), je : 1) Infrastructure — centraliser les données POS, data warehouse et pipelines ETL quotidiens. 2) Analytics client — analyse des patterns d'achat, analyse de panier et segmentation pour les promotions ciblées. 3) Optimisation des stocks — prévision de la demande avec ML tenant compte des patterns marocains (Ramadan, Aïd, été, rentrée). 4) Pricing analytics — tarification dynamique basée sur la concurrence et l'élasticité. 5) Supply chain — optimiser la distribution et réduire les ruptures. Je commencerais avec des dashboards Power BI et introduirais progressivement des modèles ML plus sophistiqués.",
  ["Reference specific Moroccan retail chains", "Address Moroccan-specific demand patterns", "Show a progressive approach from dashboards to advanced ML"],
  ["Référencez des chaînes de retail marocaines spécifiques", "Adressez les patterns de demande spécifiques au Maroc", "Montrez une approche progressive des dashboards au ML avancé"]
),

Q("g4", "Describe how you would implement a green supply chain for a Moroccan manufacturing company.",
  "Décrivez comment vous implémenteriez une chaîne d'approvisionnement verte pour une entreprise manufacturière marocaine.",
  "technical", "logistique", "hard",
  "I would implement a green supply chain strategy addressing environmental impact at every stage: 1) Sourcing — prioritize local suppliers to reduce transport emissions, evaluate suppliers on environmental criteria. 2) Production — energy efficiency audits (ISO 50001), waste reduction through lean manufacturing, and water recycling (critical in Morocco's water-stressed context). 3) Packaging — eliminate single-use plastics per Morocco's Loi 77-15 banning plastic bags, use recycled/recyclable materials. 4) Distribution — route optimization to minimize fuel consumption, transition fleet to natural gas or electric vehicles, and consolidate shipments. 5) Reverse logistics — implement a take-back program for end-of-life products. 6) Reporting — track carbon footprint using ISO 14064 and publish sustainability reports. I would leverage Morocco's COP22 commitments and national SDG strategy to align the company's green initiatives with national priorities. Certification like ISO 14001 would demonstrate commitment to European clients.",
  "J'implémenterais une stratégie de chaîne d'approvisionnement verte : 1) Sourcing — fournisseurs locaux pour réduire les émissions de transport. 2) Production — audits d'efficacité énergétique (ISO 50001), réduction des déchets par le lean et recyclage de l'eau. 3) Emballage — éliminer les plastiques à usage unique (Loi 77-15), matériaux recyclés. 4) Distribution — optimisation des itinéraires, transition vers véhicules GNL ou électriques. 5) Logistique inverse — programme de reprise des produits en fin de vie. 6) Reporting — empreinte carbone ISO 14064 et rapports de durabilité. La certification ISO 14001 démontrerait l'engagement envers les clients européens.",
  ["Reference Morocco's plastic bag ban (Loi 77-15)", "Address water scarcity in production processes", "Show knowledge of ISO environmental standards"],
  ["Référencez l'interdiction des sacs plastiques (Loi 77-15)", "Adressez la rareté de l'eau dans les processus de production", "Montrez votre connaissance des normes ISO environnementales"]
),

Q("g4", "How would you implement digital payment solutions for Morocco's informal economy?",
  "Comment implémenteriez-vous des solutions de paiement digital pour l'économie informelle marocaine ?",
  "situational", "finance", "hard",
  "Morocco's informal economy represents 30% of GDP and employs millions. Digital payment adoption faces unique challenges. I would: 1) Mobile-first — design solutions for feature phones, not just smartphones (50% of Moroccans still use basic phones). USSD-based payments like M-Pesa model adapted for Morocco. 2) Agent network — establish cash-in/cash-out points through existing networks (telecoms shops, épiceries, tabac-presse) following the agent banking model under Bank Al-Maghrib's payment institution license. 3) Trust building — Moroccans in the informal sector distrust digital payments (tax fear, privacy concerns). Start with peer-to-peer transfers before merchant payments. 4) Pricing — near-zero transaction fees to compete with cash. 5) Incentives — small cashback rewards for digital transactions. 6) Partnership — work with telecoms (Maroc Telecom, Orange, Inwi) who have the distribution reach. The key is making digital payments easier than cash, not just available.",
  "L'économie informelle marocaine représente 30% du PIB. Je : 1) Mobile-first — solutions pour téléphones basiques, pas seulement smartphones. Paiements USSD type M-Pesa adapté au Maroc. 2) Réseau d'agents — points cash-in/cash-out via les boutiques télécoms, épiceries, tabac-presse sous licence d'établissement de paiement de Bank Al-Maghrib. 3) Confiance — les travailleurs informels méfient du digital (peur fiscale, vie privée). Commencer par le P2P avant les paiements marchands. 4) Tarification — frais quasi-nuls pour concurrencer le cash. 5) Incitations — cashback pour les transactions digitales. 6) Partenariat avec les opérateurs télécoms. L'essentiel est de rendre le digital plus facile que le cash.",
  ["Address trust barriers specific to the informal economy", "Show knowledge of Bank Al-Maghrib's payment regulations", "Consider feature phone users, not just smartphone"],
  ["Adressez les barrières de confiance spécifiques à l'économie informelle", "Montrez votre connaissance des réglementations de paiement", "Considérez les utilisateurs de téléphones basiques"]
),

Q("g4", "What project management tools and methodologies are most effective for Moroccan teams?",
  "Quels outils et méthodologies de gestion de projet sont les plus efficaces pour les équipes marocaines ?",
  "competency", "management", "easy",
  "Based on my experience with Moroccan teams, effective tools and methodologies include: 1) Agile/Scrum — increasingly adopted in Moroccan IT companies, with daily stand-ups adapted to local schedule preferences (avoiding prayer times). 2) Tools — Jira (standard in multinationals), Trello (popular in SMEs for its simplicity), and Microsoft Project for traditional waterfall projects. Communication: WhatsApp groups are ubiquitous in Moroccan teams (even in corporate settings), Teams/Slack for formal channels. 3) Documentation — Confluence or Notion for knowledge management, Google Workspace for collaboration. 4) Hybrid methodology — many Moroccan companies successfully combine waterfall governance (comité de pilotage, jalons) with agile execution (sprints, user stories). The key is adapting the methodology to team maturity — not imposing pure Scrum on a team that has never worked with agile concepts. I recommend starting with Kanban for its simplicity.",
  "D'après mon expérience avec les équipes marocaines : 1) Agile/Scrum — de plus en plus adopté, avec des stand-ups adaptés aux horaires locaux. 2) Outils — Jira (standard en multinationale), Trello (populaire en PME), Microsoft Project pour le waterfall. Communication : WhatsApp est omniprésent, Teams/Slack pour les canaux formels. 3) Documentation — Confluence ou Notion. 4) Méthodologie hybride — combiner la gouvernance waterfall (comité de pilotage, jalons) avec l'exécution agile (sprints). L'essentiel est d'adapter la méthodologie à la maturité de l'équipe — commencer par Kanban pour sa simplicité.",
  ["Show practical experience with both agile and traditional methods", "Address cultural adaptations needed for Moroccan teams", "Mention WhatsApp as a practical communication reality"],
  ["Montrez votre expérience pratique avec les méthodes agiles et traditionnelles", "Adressez les adaptations culturelles nécessaires", "Mentionnez WhatsApp comme réalité de communication pratique"]
),

Q("g4", "How would you approach building a professional brand on LinkedIn as a Moroccan graduate?",
  "Comment construiriez-vous une marque professionnelle sur LinkedIn en tant que diplômé marocain ?",
  "behavioral", "général", "easy",
  "LinkedIn is the primary professional networking platform in Morocco with 4M+ users. I would: 1) Profile optimization — professional photo (cultural norm: formal attire), bilingual headline in French and English, detailed summary highlighting my unique value proposition, and keywords matching Moroccan job postings. 2) Content strategy — share insights about my field (2-3 posts/week), comment on industry discussions, and write articles about Moroccan market trends. Post in French primarily (dominant business language on Moroccan LinkedIn). 3) Networking — connect with alumni from my school, Moroccan industry leaders, and HR professionals at target companies. Join groups like 'Ingénieurs du Maroc' and 'Emploi Maroc.' 4) Engagement — congratulate connections on achievements, share relevant job postings, and participate in virtual events. 5) Portfolio — link to project documentation, certifications, and presentations. Consistency is key — posting regularly builds visibility.",
  "LinkedIn est la principale plateforme de réseautage professionnel au Maroc avec 4M+ utilisateurs. Je : 1) Optimiserais mon profil — photo professionnelle, titre bilingue français/anglais, résumé détaillé avec mots-clés des offres marocaines. 2) Stratégie de contenu — partager des insights (2-3 posts/semaine), commenter les discussions et écrire des articles sur les tendances du marché marocain. Poster principalement en français. 3) Réseautage — connecter avec les alumni, leaders d'industrie et RH. 4) Engagement — féliciter, partager des offres et participer aux événements virtuels. 5) Portfolio — lier projets, certifications et présentations. La régularité construit la visibilité.",
  ["Show knowledge of LinkedIn best practices", "Adapt general advice to the Moroccan context", "Emphasize French as the primary business language"],
  ["Montrez votre connaissance des bonnes pratiques LinkedIn", "Adaptez les conseils au contexte marocain", "Soulignez le français comme langue business principale"]
),

];

// ============================================================================
// INSERT LOGIC — batches of 50
// ============================================================================

async function run() {
  await client.connect();
  console.log(`Connected to database. Inserting ${QUESTIONS.length} questions starting at sort_order ${500}...`);

  const BATCH_SIZE = 50;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < QUESTIONS.length; i += BATCH_SIZE) {
    const batch = QUESTIONS.slice(i, i + BATCH_SIZE);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const q of batch) {
      values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5}, $${paramIdx+6}, $${paramIdx+7}, $${paramIdx+8}, $${paramIdx+9}, $${paramIdx+10}, $${paramIdx+11})`);
      params.push(
        q.id, q.question, q.question_fr, q.type, q.field,
        q.sample_answer, q.sample_answer_fr, q.tips, q.tips_fr,
        q.difficulty, q.is_active, q.sort_order
      );
      paramIdx += 12;
    }

    const sql = `
      INSERT INTO interview_common_question (id, question, question_fr, type, field, sample_answer, sample_answer_fr, tips, tips_fr, difficulty, is_active, sort_order)
      VALUES ${values.join(",\n")}
      ON CONFLICT (id) DO NOTHING
    `;

    const result = await client.query(sql, params);
    inserted += result.rowCount;
    skipped += batch.length - result.rowCount;
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: inserted ${result.rowCount}, skipped ${batch.length - result.rowCount}`);
  }

  // Verify total
  const countRes = await client.query("SELECT COUNT(*) as cnt FROM interview_common_question");
  const fieldDist = await client.query("SELECT field, COUNT(*) as cnt FROM interview_common_question GROUP BY field ORDER BY cnt DESC");

  console.log(`\n=== RESULTS ===`);
  console.log(`Questions in this script: ${QUESTIONS.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (duplicates): ${skipped}`);
  console.log(`Total questions in table: ${countRes.rows[0].cnt}`);
  console.log(`\nField distribution:`);
  for (const row of fieldDist.rows) {
    console.log(`  ${row.field}: ${row.cnt}`);
  }

  await client.end();
  console.log("\nDone!");
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
