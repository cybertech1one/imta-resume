/**
 * seed-massive-data.mjs
 * Seeds hundreds of rows of realistic, French/Moroccan-focused data
 * into 6 tables for the Reactive Resume platform.
 *
 * Run: node scripts/seed-massive-data.mjs
 */

import pg from "pg";
import crypto from "crypto";
const { Client } = pg;

const client = new Client({
  host: "localhost",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "postgres",
});

// ─────────────────────────────────────────────────────────────────
// 1. INTERVIEW TIPS (50+)
// ─────────────────────────────────────────────────────────────────
const interviewTips = [
  // PREPARATION (10)
  {
    id: "tip-prep-01",
    category: "preparation",
    field: "general",
    title: "Master the STAR Method",
    title_fr: "Maîtrisez la méthode STAR",
    content:
      "Structure your answers using Situation, Task, Action, Result. This framework helps you give concise, impactful responses to behavioral questions.",
    content_fr:
      "Structurez vos réponses avec Situation, Tâche, Action, Résultat. Ce cadre vous aide à donner des réponses concises et percutantes aux questions comportementales.",
    extended_content:
      "Practice with at least 5 stories from your experience at IMTA or internships. Each story should demonstrate a different competency.",
    extended_content_fr:
      "Entraînez-vous avec au moins 5 histoires tirées de votre expérience à l'IMTA ou de vos stages. Chaque histoire doit démontrer une compétence différente.",
    tags: ["star", "méthode", "structure", "réponse"],
  },
  {
    id: "tip-prep-02",
    category: "preparation",
    field: "general",
    title: "Research Moroccan Company Culture",
    title_fr: "Analysez la culture des entreprises marocaines",
    content:
      "Moroccan companies like OCP, ONCF, and Marsa Maroc value respect for hierarchy, team spirit, and bilingual (French/Arabic) communication. Adapt your tone accordingly.",
    content_fr:
      "Les entreprises marocaines comme l'OCP, l'ONCF et Marsa Maroc valorisent le respect de la hiérarchie, l'esprit d'équipe et la communication bilingue (français/arabe). Adaptez votre ton en conséquence.",
    tags: ["culture", "maroc", "entreprise", "hiérarchie"],
  },
  {
    id: "tip-prep-03",
    category: "preparation",
    field: "engineering",
    title: "Prepare Your Technical Portfolio",
    title_fr: "Préparez votre portfolio technique",
    content:
      "Bring printed copies of your best technical projects, CAD drawings, or lab reports. Moroccan engineering firms appreciate tangible proof of competence.",
    content_fr:
      "Apportez des copies imprimées de vos meilleurs projets techniques, dessins CAO ou rapports de laboratoire. Les entreprises d'ingénierie marocaines apprécient les preuves tangibles de compétence.",
    tags: ["portfolio", "technique", "ingénierie", "projets"],
  },
  {
    id: "tip-prep-04",
    category: "preparation",
    field: "it",
    title: "Set Up Your Coding Environment",
    title_fr: "Préparez votre environnement de développement",
    content:
      "For IT interviews at Capgemini, CGI, or Atos Morocco, expect live coding challenges. Have your IDE ready with common algorithms and data structures reviewed.",
    content_fr:
      "Pour les entretiens IT chez Capgemini, CGI ou Atos Maroc, attendez-vous à des défis de codage en direct. Ayez votre IDE prêt avec les algorithmes courants et structures de données révisés.",
    tags: ["codage", "it", "algorithmes", "préparation technique"],
  },
  {
    id: "tip-prep-05",
    category: "preparation",
    field: "healthcare",
    title: "Review Clinical Protocols",
    title_fr: "Révisez les protocoles cliniques",
    content:
      "Healthcare interviews at CHU Ibn Sina or Cheikh Zaïd often include case-based questions on patient management protocols and clinical decision-making.",
    content_fr:
      "Les entretiens dans le secteur de la santé au CHU Ibn Sina ou à la clinique Cheikh Zaïd incluent souvent des questions basées sur des cas de protocoles de prise en charge des patients.",
    tags: ["santé", "clinique", "protocoles", "cas pratique"],
  },
  {
    id: "tip-prep-06",
    category: "preparation",
    field: "general",
    title: "Know Your Salary Range",
    title_fr: "Connaissez votre fourchette salariale",
    content:
      "Research salary ranges on Rekrute.com and Emploi.ma. Entry-level engineers in Morocco typically earn 8,000-12,000 MAD/month; IT professionals 10,000-18,000 MAD.",
    content_fr:
      "Renseignez-vous sur les fourchettes salariales sur Rekrute.com et Emploi.ma. Les ingénieurs débutants au Maroc gagnent généralement 8 000-12 000 MAD/mois ; les professionnels IT 10 000-18 000 MAD.",
    tags: ["salaire", "rémunération", "maroc", "fourchette"],
  },
  {
    id: "tip-prep-07",
    category: "preparation",
    field: "hse",
    title: "Study Moroccan HSE Regulations",
    title_fr: "Étudiez la réglementation HSE marocaine",
    content:
      "Familiarize yourself with the Code du Travail marocain (especially articles on workplace safety), ISO 14001, and OHSAS 18001 standards commonly referenced in Moroccan industry.",
    content_fr:
      "Familiarisez-vous avec le Code du Travail marocain (notamment les articles sur la sécurité au travail), les normes ISO 14001 et OHSAS 18001 couramment référencées dans l'industrie marocaine.",
    tags: ["hse", "réglementation", "sécurité", "normes"],
  },
  {
    id: "tip-prep-08",
    category: "preparation",
    field: "general",
    title: "Dress Code for Moroccan Interviews",
    title_fr: "Le code vestimentaire pour un entretien au Maroc",
    content:
      "Conservative professional attire is expected. For men: suit and tie. For women: professional suit or modest business attire. Avoid flashy accessories.",
    content_fr:
      "Une tenue professionnelle classique est attendue. Pour les hommes : costume-cravate. Pour les femmes : tailleur professionnel ou tenue business sobre. Évitez les accessoires voyants.",
    tags: ["tenue", "vestimentaire", "apparence", "professionnel"],
  },
  {
    id: "tip-prep-09",
    category: "preparation",
    field: "finance",
    title: "Review Financial Regulations",
    title_fr: "Révisez la réglementation financière",
    content:
      "For banking interviews at Attijariwafa, BMCE, or Bank of Africa, understand Bank Al-Maghrib regulations, Basel III requirements, and current Moroccan monetary policy.",
    content_fr:
      "Pour les entretiens bancaires chez Attijariwafa, BMCE ou Bank of Africa, comprenez les réglementations de Bank Al-Maghrib, les exigences Bâle III et la politique monétaire marocaine actuelle.",
    tags: ["finance", "banque", "réglementation", "bâle"],
  },
  {
    id: "tip-prep-10",
    category: "preparation",
    field: "industrial",
    title: "Visit the Factory Virtually",
    title_fr: "Visitez l'usine virtuellement",
    content:
      "Before interviewing at Renault Tanger or PSA Kenitra, watch YouTube videos of their production lines. Understanding their manufacturing processes shows genuine interest.",
    content_fr:
      "Avant un entretien chez Renault Tanger ou PSA Kenitra, regardez des vidéos YouTube de leurs lignes de production. Comprendre leurs processus de fabrication montre un intérêt sincère.",
    tags: ["usine", "production", "automobile", "industrie"],
  },

  // BEHAVIORAL (8)
  {
    id: "tip-behav-01",
    category: "behavioral",
    field: "general",
    title: "Answering 'Tell Me About Yourself'",
    title_fr: "Répondre à 'Parlez-moi de vous'",
    content:
      "Structure: Present (current role/studies at IMTA), Past (relevant experience), Future (why this company). Keep it under 2 minutes.",
    content_fr:
      "Structure : Présent (votre rôle actuel/études à l'IMTA), Passé (expérience pertinente), Futur (pourquoi cette entreprise). Restez sous 2 minutes.",
    tags: ["présentation", "parcours", "introduction"],
  },
  {
    id: "tip-behav-02",
    category: "behavioral",
    field: "general",
    title: "Handle Weakness Questions Honestly",
    title_fr: "Gérez les questions sur vos faiblesses avec honnêteté",
    content:
      "Choose a real weakness and show what you're doing to improve. Example: 'I used to struggle with public speaking, so I joined the IMTA debate club.'",
    content_fr:
      "Choisissez une vraie faiblesse et montrez ce que vous faites pour vous améliorer. Exemple : 'J'avais du mal avec la prise de parole en public, alors j'ai rejoint le club de débat de l'IMTA.'",
    tags: ["faiblesses", "amélioration", "honnêteté"],
  },
  {
    id: "tip-behav-03",
    category: "behavioral",
    field: "general",
    title: "Demonstrate Teamwork with Concrete Examples",
    title_fr: "Illustrez le travail d'équipe avec des exemples concrets",
    content:
      "Moroccan employers highly value 'esprit d'équipe'. Prepare 2-3 stories about successful team projects, ideally from internships or group projects at IMTA.",
    content_fr:
      "Les employeurs marocains valorisent fortement l'esprit d'équipe. Préparez 2-3 histoires de projets d'équipe réussis, idéalement tirés de stages ou projets de groupe à l'IMTA.",
    tags: ["équipe", "collaboration", "projets", "stage"],
  },
  {
    id: "tip-behav-04",
    category: "behavioral",
    field: "general",
    title: "Show Adaptability to Change",
    title_fr: "Montrez votre adaptabilité au changement",
    content:
      "In rapidly modernizing Morocco, companies seek adaptable employees. Share examples of when you adapted to new technologies, processes, or environments.",
    content_fr:
      "Dans un Maroc en pleine modernisation, les entreprises cherchent des employés adaptables. Partagez des exemples où vous vous êtes adapté à de nouvelles technologies, processus ou environnements.",
    tags: ["adaptabilité", "changement", "flexibilité"],
  },
  {
    id: "tip-behav-05",
    category: "behavioral",
    field: "general",
    title: "Discuss Failure Constructively",
    title_fr: "Parlez de vos échecs de manière constructive",
    content:
      "Recruiters want to see resilience. Describe a project that didn't go as planned, what you learned, and how you applied those lessons. Focus on growth.",
    content_fr:
      "Les recruteurs veulent voir de la résilience. Décrivez un projet qui ne s'est pas déroulé comme prévu, ce que vous avez appris et comment vous avez appliqué ces leçons. Concentrez-vous sur la croissance.",
    tags: ["échec", "résilience", "apprentissage", "croissance"],
  },
  {
    id: "tip-behav-06",
    category: "behavioral",
    field: "general",
    title: "Express Motivation Authentically",
    title_fr: "Exprimez votre motivation de manière authentique",
    content:
      "Avoid generic answers. Connect your personal story to the company's mission. Example: 'Growing up near the OCP mines in Khouribga inspired my passion for industrial safety.'",
    content_fr:
      "Évitez les réponses génériques. Connectez votre histoire personnelle à la mission de l'entreprise. Exemple : 'Ayant grandi près des mines de l'OCP à Khouribga, j'ai développé une passion pour la sécurité industrielle.'",
    tags: ["motivation", "authenticité", "passion", "parcours"],
  },
  {
    id: "tip-behav-07",
    category: "behavioral",
    field: "engineering",
    title: "Explain Complex Technical Concepts Simply",
    title_fr: "Expliquez les concepts techniques complexes simplement",
    content:
      "Practice explaining your thesis project or engineering work to a non-technical person. Interviewers test your communication skills alongside technical knowledge.",
    content_fr:
      "Entraînez-vous à expliquer votre projet de fin d'études ou vos travaux d'ingénierie à une personne non technique. Les recruteurs testent vos compétences de communication en plus des connaissances techniques.",
    tags: ["vulgarisation", "communication", "technique", "pédagogie"],
  },
  {
    id: "tip-behav-08",
    category: "behavioral",
    field: "general",
    title: "Handle Stress Questions Gracefully",
    title_fr: "Gérez les questions sur le stress avec aisance",
    content:
      "When asked about stress management, reference specific techniques: time blocking, priority matrices, or mindfulness. Back it up with a real example from exams or deadlines.",
    content_fr:
      "Quand on vous interroge sur la gestion du stress, référencez des techniques spécifiques : time blocking, matrices de priorité, ou pleine conscience. Illustrez avec un exemple réel d'examens ou de deadlines.",
    tags: ["stress", "gestion", "techniques", "résilience"],
  },

  // TECHNICAL (10)
  {
    id: "tip-tech-01",
    category: "technical",
    field: "it",
    title: "Explain Your Architecture Decisions",
    title_fr: "Expliquez vos choix d'architecture",
    content:
      "IT companies in Morocco test system design skills. Be ready to whiteboard a microservices architecture, explain REST vs GraphQL tradeoffs, or design a database schema.",
    content_fr:
      "Les entreprises IT au Maroc testent les compétences en conception système. Soyez prêt à dessiner une architecture microservices, expliquer les compromis REST vs GraphQL, ou concevoir un schéma de base de données.",
    tags: ["architecture", "système", "conception", "microservices"],
  },
  {
    id: "tip-tech-02",
    category: "technical",
    field: "it",
    title: "Review Data Structures and Algorithms",
    title_fr: "Révisez les structures de données et algorithmes",
    content:
      "Capgemini and CGI Morocco frequently test sorting algorithms, tree traversals, and dynamic programming. Practice on LeetCode or HackerRank 2 weeks before your interview.",
    content_fr:
      "Capgemini et CGI Maroc testent fréquemment les algorithmes de tri, parcours d'arbres et programmation dynamique. Entraînez-vous sur LeetCode ou HackerRank 2 semaines avant votre entretien.",
    tags: ["algorithmes", "structures", "codage", "leetcode"],
  },
  {
    id: "tip-tech-03",
    category: "technical",
    field: "engineering",
    title: "Master Process Engineering Fundamentals",
    title_fr: "Maîtrisez les fondamentaux du génie des procédés",
    content:
      "For interviews at OCP or chemical industry roles, review mass and energy balances, PFDs/P&IDs, and process optimization techniques. These are frequently tested.",
    content_fr:
      "Pour les entretiens à l'OCP ou dans l'industrie chimique, révisez les bilans de matière et d'énergie, les PFD/P&ID et les techniques d'optimisation des procédés. Ces sujets sont fréquemment testés.",
    tags: ["procédés", "bilan", "optimisation", "chimie"],
  },
  {
    id: "tip-tech-04",
    category: "technical",
    field: "hse",
    title: "Know Your Risk Assessment Methods",
    title_fr: "Connaissez vos méthodes d'évaluation des risques",
    content:
      "HSE interviews always cover risk assessment. Master HAZOP, FMEA, bow-tie analysis, and job safety analysis. Be ready to walk through a real case study.",
    content_fr:
      "Les entretiens HSE couvrent toujours l'évaluation des risques. Maîtrisez HAZOP, AMDEC, l'analyse nœud papillon et l'analyse de sécurité au travail. Soyez prêt à détailler une étude de cas réelle.",
    tags: ["risques", "hazop", "amdec", "évaluation"],
  },
  {
    id: "tip-tech-05",
    category: "technical",
    field: "industrial",
    title: "Demonstrate Lean Manufacturing Knowledge",
    title_fr: "Démontrez vos connaissances en Lean Manufacturing",
    content:
      "Automotive companies like Renault and PSA Kenitra use Lean extensively. Know the 5S, Kaizen, Kanban, and value stream mapping. Share examples from your internship if possible.",
    content_fr:
      "Les constructeurs automobiles comme Renault et PSA Kenitra utilisent le Lean massivement. Connaissez les 5S, Kaizen, Kanban et la cartographie de la chaîne de valeur. Partagez des exemples de vos stages si possible.",
    tags: ["lean", "5s", "kaizen", "automobile", "production"],
  },
  {
    id: "tip-tech-06",
    category: "technical",
    field: "it",
    title: "Prepare for SQL and Database Questions",
    title_fr: "Préparez-vous aux questions SQL et bases de données",
    content:
      "Most IT companies in Morocco test SQL. Review JOINs, subqueries, window functions, indexing strategies, and normalization. Practice writing queries without an IDE.",
    content_fr:
      "La plupart des entreprises IT au Maroc testent le SQL. Révisez les JOINs, sous-requêtes, fonctions fenêtre, stratégies d'indexation et normalisation. Entraînez-vous à écrire des requêtes sans IDE.",
    tags: ["sql", "base de données", "requêtes", "indexation"],
  },
  {
    id: "tip-tech-07",
    category: "technical",
    field: "engineering",
    title: "Know AutoCAD and SolidWorks Shortcuts",
    title_fr: "Connaissez les raccourcis AutoCAD et SolidWorks",
    content:
      "Engineering interviews often include a practical CAD exercise. Review common shortcuts, dimensioning standards (ISO), and GD&T symbols before the interview.",
    content_fr:
      "Les entretiens en ingénierie incluent souvent un exercice pratique de CAO. Révisez les raccourcis courants, les standards de cotation (ISO) et les symboles GD&T avant l'entretien.",
    tags: ["cao", "autocad", "solidworks", "dessin technique"],
  },
  {
    id: "tip-tech-08",
    category: "technical",
    field: "it",
    title: "Cloud and DevOps Are Hot Topics",
    title_fr: "Cloud et DevOps sont des sujets tendance",
    content:
      "Moroccan IT firms are rapidly adopting cloud. Review AWS/Azure basics, Docker, CI/CD pipelines, and Infrastructure as Code. Even basic knowledge sets you apart.",
    content_fr:
      "Les entreprises IT marocaines adoptent rapidement le cloud. Révisez les bases AWS/Azure, Docker, les pipelines CI/CD et l'Infrastructure as Code. Même des connaissances de base vous démarquent.",
    tags: ["cloud", "devops", "aws", "docker", "ci/cd"],
  },
  {
    id: "tip-tech-09",
    category: "technical",
    field: "healthcare",
    title: "Understand Morocco's Healthcare System",
    title_fr: "Comprenez le système de santé marocain",
    content:
      "Know the structure: CHUs, CHRs, and CSBs. Understand RAMED, AMO, and the current healthcare reform (Généralisation de la Protection Sociale). This context is crucial for health sector interviews.",
    content_fr:
      "Connaissez la structure : CHU, CHR et CSB. Comprenez le RAMED, l'AMO et la réforme actuelle (Généralisation de la Protection Sociale). Ce contexte est crucial pour les entretiens dans le secteur de la santé.",
    tags: ["santé", "ramed", "amo", "réforme", "protection sociale"],
  },
  {
    id: "tip-tech-10",
    category: "technical",
    field: "finance",
    title: "Master Financial Analysis Tools",
    title_fr: "Maîtrisez les outils d'analyse financière",
    content:
      "Banking interviews test Excel modeling, financial statement analysis, and DCF valuation. Practice building a 3-statement model before interviewing at Attijariwafa or BMCE.",
    content_fr:
      "Les entretiens bancaires testent la modélisation Excel, l'analyse des états financiers et la valorisation DCF. Entraînez-vous à construire un modèle 3 états avant un entretien chez Attijariwafa ou BMCE.",
    tags: ["finance", "excel", "modélisation", "dcf", "analyse"],
  },

  // FOLLOW-UP (6)
  {
    id: "tip-follow-01",
    category: "follow-up",
    field: "general",
    title: "Send a Thank-You Email Within 24 Hours",
    title_fr: "Envoyez un email de remerciement sous 24 heures",
    content:
      "Always send a personalized thank-you email to each interviewer. Reference something specific from your conversation. This is less common in Morocco and will make you stand out.",
    content_fr:
      "Envoyez toujours un email de remerciement personnalisé à chaque intervieweur. Faites référence à un point spécifique de votre conversation. Cette pratique est moins courante au Maroc et vous démarquera.",
    tags: ["remerciement", "email", "suivi", "démarquer"],
  },
  {
    id: "tip-follow-02",
    category: "follow-up",
    field: "general",
    title: "Follow Up Professionally After One Week",
    title_fr: "Relancez professionnellement après une semaine",
    content:
      "If you haven't heard back after one week, send a polite follow-up. Keep it brief: reaffirm your interest and ask about the timeline. Don't be pushy.",
    content_fr:
      "Si vous n'avez pas de nouvelles après une semaine, envoyez une relance polie. Restez bref : réaffirmez votre intérêt et renseignez-vous sur le calendrier. Ne soyez pas insistant.",
    tags: ["relance", "suivi", "calendrier", "patience"],
  },
  {
    id: "tip-follow-03",
    category: "follow-up",
    field: "general",
    title: "Connect on LinkedIn After the Interview",
    title_fr: "Connectez-vous sur LinkedIn après l'entretien",
    content:
      "Send a LinkedIn connection request to your interviewer with a personalized note. This builds your professional network regardless of the outcome.",
    content_fr:
      "Envoyez une demande de connexion LinkedIn à votre intervieweur avec une note personnalisée. Cela construit votre réseau professionnel quel que soit le résultat.",
    tags: ["linkedin", "réseau", "connexion", "professionnel"],
  },
  {
    id: "tip-follow-04",
    category: "follow-up",
    field: "general",
    title: "Document Your Interview Experience",
    title_fr: "Documentez votre expérience d'entretien",
    content:
      "Write down the questions asked, your answers, and what went well or poorly within an hour of the interview. This reflection helps you improve for future interviews.",
    content_fr:
      "Notez les questions posées, vos réponses et ce qui s'est bien ou mal passé dans l'heure suivant l'entretien. Cette réflexion vous aide à vous améliorer pour les futurs entretiens.",
    tags: ["documentation", "réflexion", "amélioration", "notes"],
  },
  {
    id: "tip-follow-05",
    category: "follow-up",
    field: "general",
    title: "Ask for Feedback If Rejected",
    title_fr: "Demandez un retour en cas de refus",
    content:
      "If you're not selected, politely ask for feedback. Many Moroccan recruiters appreciate this initiative and will share valuable insights for your next interviews.",
    content_fr:
      "Si vous n'êtes pas retenu, demandez poliment un retour. Beaucoup de recruteurs marocains apprécient cette initiative et partageront des conseils précieux pour vos prochains entretiens.",
    tags: ["feedback", "refus", "amélioration", "initiative"],
  },
  {
    id: "tip-follow-06",
    category: "follow-up",
    field: "general",
    title: "Keep the Relationship Alive",
    title_fr: "Entretenez la relation",
    content:
      "Even if you didn't get the job, engage with the company on LinkedIn, attend their events, and reapply when new positions open. Persistence is valued in Morocco.",
    content_fr:
      "Même si vous n'avez pas obtenu le poste, interagissez avec l'entreprise sur LinkedIn, assistez à leurs événements et postulez à nouveau quand de nouvelles positions s'ouvrent. La persévérance est valorisée au Maroc.",
    tags: ["relation", "persévérance", "réseau", "opportunités"],
  },

  // NEGOTIATION (6)
  {
    id: "tip-nego-01",
    category: "negotiation",
    field: "general",
    title: "Research Salary Benchmarks by Sector",
    title_fr: "Recherchez les grilles salariales par secteur",
    content:
      "Use Rekrute.com, Emploi.ma, and Glassdoor Morocco data. Engineering: 8K-15K MAD entry; IT: 10K-20K MAD; Banking: 9K-14K MAD; Healthcare: 7K-12K MAD. These are 2025-2026 ranges.",
    content_fr:
      "Utilisez les données de Rekrute.com, Emploi.ma et Glassdoor Maroc. Ingénierie : 8K-15K MAD débutant ; IT : 10K-20K MAD ; Banque : 9K-14K MAD ; Santé : 7K-12K MAD. Ce sont les fourchettes 2025-2026.",
    tags: ["salaire", "grille", "secteur", "benchmark"],
  },
  {
    id: "tip-nego-02",
    category: "negotiation",
    field: "general",
    title: "Negotiate the Full Package, Not Just Salary",
    title_fr: "Négociez le package global, pas seulement le salaire",
    content:
      "Moroccan companies often offer benefits beyond salary: transport allowance, meal vouchers, health insurance (mutuelle), training budget, and 13th month. Factor these in.",
    content_fr:
      "Les entreprises marocaines offrent souvent des avantages au-delà du salaire : indemnité de transport, tickets restaurant, mutuelle, budget formation et 13ème mois. Prenez-les en compte.",
    tags: ["package", "avantages", "mutuelle", "transport"],
  },
  {
    id: "tip-nego-03",
    category: "negotiation",
    field: "general",
    title: "Time Your Salary Discussion Right",
    title_fr: "Choisissez le bon moment pour parler salaire",
    content:
      "Never bring up salary in the first interview. Wait until the employer shows strong interest. When asked about expectations, give a range based on research, not a single number.",
    content_fr:
      "N'abordez jamais le salaire lors du premier entretien. Attendez que l'employeur montre un fort intérêt. Quand on vous demande vos prétentions, donnez une fourchette basée sur vos recherches, pas un chiffre unique.",
    tags: ["timing", "salaire", "stratégie", "fourchette"],
  },
  {
    id: "tip-nego-04",
    category: "negotiation",
    field: "it",
    title: "Leverage Your Technical Certifications",
    title_fr: "Mettez en valeur vos certifications techniques",
    content:
      "AWS, Azure, Scrum Master, or PMP certifications significantly increase your bargaining power in Morocco's IT sector. A certified cloud engineer can negotiate 20-30% more.",
    content_fr:
      "Les certifications AWS, Azure, Scrum Master ou PMP augmentent significativement votre pouvoir de négociation dans le secteur IT au Maroc. Un ingénieur cloud certifié peut négocier 20-30% de plus.",
    tags: ["certifications", "cloud", "négociation", "it"],
  },
  {
    id: "tip-nego-05",
    category: "negotiation",
    field: "general",
    title: "Understand CNSS and Tax Implications",
    title_fr: "Comprenez les implications CNSS et fiscales",
    content:
      "In Morocco, CNSS deductions are ~4.48% employee share. IR (income tax) is progressive from 0% to 38%. When negotiating, think in net terms and ask about 'salaire net' to avoid surprises.",
    content_fr:
      "Au Maroc, les cotisations CNSS sont d'environ 4,48% part salariale. L'IR est progressif de 0% à 38%. Lors de la négociation, pensez en net et demandez le 'salaire net' pour éviter les surprises.",
    tags: ["cnss", "impôt", "net", "brut", "fiscal"],
  },
  {
    id: "tip-nego-06",
    category: "negotiation",
    field: "general",
    title: "Ask About Career Growth Path",
    title_fr: "Renseignez-vous sur le plan de carrière",
    content:
      "Beyond salary, ask about promotion timelines, performance review cycles, and career development opportunities. Moroccan companies increasingly offer structured career paths.",
    content_fr:
      "Au-delà du salaire, renseignez-vous sur les délais de promotion, les cycles d'évaluation de performance et les opportunités de développement. Les entreprises marocaines offrent de plus en plus des parcours de carrière structurés.",
    tags: ["carrière", "promotion", "évolution", "développement"],
  },

  // REMOTE (5)
  {
    id: "tip-remote-01",
    category: "remote",
    field: "it",
    title: "Master Video Interview Etiquette",
    title_fr: "Maîtrisez l'étiquette des entretiens vidéo",
    content:
      "Test your camera, microphone, and internet connection beforehand. Choose a clean, well-lit background. Dress professionally from head to toe — you might need to stand up.",
    content_fr:
      "Testez votre caméra, microphone et connexion internet au préalable. Choisissez un fond propre et bien éclairé. Habillez-vous professionnellement de la tête aux pieds — vous pourriez devoir vous lever.",
    tags: ["vidéo", "caméra", "connexion", "apparence"],
  },
  {
    id: "tip-remote-02",
    category: "remote",
    field: "it",
    title: "Showcase Remote Work Skills",
    title_fr: "Mettez en avant vos compétences de travail à distance",
    content:
      "Demonstrate proficiency with collaboration tools (Slack, Teams, Jira, Notion). Explain how you stay productive and maintain communication in distributed teams.",
    content_fr:
      "Démontrez votre maîtrise des outils de collaboration (Slack, Teams, Jira, Notion). Expliquez comment vous restez productif et maintenez la communication dans les équipes distribuées.",
    tags: ["remote", "outils", "collaboration", "productivité"],
  },
  {
    id: "tip-remote-03",
    category: "remote",
    field: "general",
    title: "Handle Technical Issues Gracefully",
    title_fr: "Gérez les problèmes techniques avec grâce",
    content:
      "If your connection drops during a video interview, don't panic. Have a backup plan: mobile hotspot, phone number to call back. Apologize briefly and move on professionally.",
    content_fr:
      "Si votre connexion coupe pendant un entretien vidéo, ne paniquez pas. Ayez un plan B : hotspot mobile, numéro de téléphone pour rappeler. Excusez-vous brièvement et continuez professionnellement.",
    tags: ["technique", "connexion", "plan B", "problèmes"],
  },
  {
    id: "tip-remote-04",
    category: "remote",
    field: "it",
    title: "Prepare for Online Coding Tests",
    title_fr: "Préparez-vous aux tests de codage en ligne",
    content:
      "Many Moroccan IT companies use HackerRank, Codility, or custom platforms for remote coding tests. Practice coding under time pressure and explain your thought process aloud.",
    content_fr:
      "Beaucoup d'entreprises IT marocaines utilisent HackerRank, Codility ou des plateformes internes pour les tests de codage à distance. Entraînez-vous à coder sous pression et expliquez votre raisonnement à voix haute.",
    tags: ["codage", "test en ligne", "hackerrank", "temps"],
  },
  {
    id: "tip-remote-05",
    category: "remote",
    field: "general",
    title: "Maintain Eye Contact with the Camera",
    title_fr: "Maintenez le contact visuel avec la caméra",
    content:
      "Look at your webcam, not the screen, when speaking. This simulates eye contact. Position the interview window near your camera to make it more natural.",
    content_fr:
      "Regardez votre webcam, pas l'écran, quand vous parlez. Cela simule le contact visuel. Positionnez la fenêtre de l'entretien près de votre caméra pour rendre cela plus naturel.",
    tags: ["regard", "caméra", "contact visuel", "naturel"],
  },

  // CULTURAL (5)
  {
    id: "tip-cult-01",
    category: "cultural",
    field: "general",
    title: "Navigate Bilingual Interviews",
    title_fr: "Naviguez les entretiens bilingues",
    content:
      "Many Moroccan interviews switch between French and Arabic (or Darija). Be ready to answer in both. If unsure of a technical term in French, it's OK to explain in Arabic and vice versa.",
    content_fr:
      "Beaucoup d'entretiens marocains alternent entre français et arabe (ou darija). Soyez prêt à répondre dans les deux langues. Si vous hésitez sur un terme technique en français, expliquez en arabe et vice versa.",
    tags: ["bilingue", "français", "arabe", "darija", "langues"],
  },
  {
    id: "tip-cult-02",
    category: "cultural",
    field: "general",
    title: "Understand Moroccan Professional Hierarchy",
    title_fr: "Comprenez la hiérarchie professionnelle marocaine",
    content:
      "Address interviewers formally ('Monsieur le Directeur', 'Madame'). Use 'vous' not 'tu'. Show respect for seniority — this is deeply valued in Moroccan business culture.",
    content_fr:
      "Adressez-vous aux intervieweurs formellement ('Monsieur le Directeur', 'Madame'). Utilisez 'vous' et non 'tu'. Montrez du respect pour la hiérarchie — c'est profondément valorisé dans la culture professionnelle marocaine.",
    tags: ["hiérarchie", "respect", "vouvoiement", "formalité"],
  },
  {
    id: "tip-cult-03",
    category: "cultural",
    field: "general",
    title: "Be Punctual but Flexible",
    title_fr: "Soyez ponctuel mais flexible",
    content:
      "Arrive 10-15 minutes early. However, don't be surprised if the interviewer is late or the schedule shifts. Show patience — it's considered a sign of professionalism in Morocco.",
    content_fr:
      "Arrivez 10-15 minutes en avance. Cependant, ne soyez pas surpris si l'intervieweur est en retard ou si le planning change. Montrez de la patience — c'est considéré comme un signe de professionnalisme au Maroc.",
    tags: ["ponctualité", "patience", "flexibilité", "temps"],
  },
  {
    id: "tip-cult-04",
    category: "cultural",
    field: "general",
    title: "Small Talk Is Important in Morocco",
    title_fr: "Le small talk est important au Maroc",
    content:
      "Expect 5-10 minutes of casual conversation before the formal interview. Topics may include family, studies, or current events. This builds rapport and is part of the evaluation.",
    content_fr:
      "Attendez-vous à 5-10 minutes de conversation informelle avant l'entretien formel. Les sujets peuvent inclure la famille, les études ou l'actualité. Cela crée un lien et fait partie de l'évaluation.",
    tags: ["conversation", "informel", "rapport", "social"],
  },
  {
    id: "tip-cult-05",
    category: "cultural",
    field: "general",
    title: "Show Loyalty and Long-Term Commitment",
    title_fr: "Montrez votre loyauté et engagement à long terme",
    content:
      "Moroccan employers prefer candidates who plan to stay. Express genuine interest in growing with the company. Avoid mentioning this job as a 'stepping stone' to something else.",
    content_fr:
      "Les employeurs marocains préfèrent les candidats qui prévoient de rester. Exprimez un intérêt sincère pour évoluer au sein de l'entreprise. Évitez de mentionner ce poste comme un 'tremplin' vers autre chose.",
    tags: ["loyauté", "engagement", "stabilité", "long terme"],
  },
];

// ─────────────────────────────────────────────────────────────────
// 2. INTERVIEW COMMON QUESTIONS (80+)
// ─────────────────────────────────────────────────────────────────
const interviewQuestions = [
  // BEHAVIORAL (20)
  {
    id: "icq-behav-01",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "Tell me about yourself.",
    question_fr: "Parlez-moi de vous.",
    sample_answer:
      "I'm a final-year engineering student at IMTA, specializing in industrial safety. During my internship at OCP, I developed a risk assessment tool that reduced workplace incidents by 15%.",
    sample_answer_fr:
      "Je suis étudiant en dernière année d'ingénierie à l'IMTA, spécialisé en sécurité industrielle. Lors de mon stage à l'OCP, j'ai développé un outil d'évaluation des risques qui a réduit les incidents de 15%.",
    tips: ["Keep it under 2 minutes", "Follow Present-Past-Future structure", "End with why you want this role"],
    tips_fr: ["Restez sous 2 minutes", "Suivez la structure Présent-Passé-Futur", "Terminez par pourquoi ce poste vous intéresse"],
  },
  {
    id: "icq-behav-02",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "What are your greatest strengths?",
    question_fr: "Quelles sont vos plus grandes forces ?",
    sample_answer:
      "My analytical thinking and ability to work under pressure. At IMTA, I consistently achieved top marks in complex problem-solving modules while managing multiple projects.",
    sample_answer_fr:
      "Mon esprit analytique et ma capacité à travailler sous pression. À l'IMTA, j'ai régulièrement obtenu d'excellentes notes dans les modules de résolution de problèmes complexes tout en gérant plusieurs projets.",
    tips: ["Choose strengths relevant to the job", "Back up with concrete examples", "Be genuine"],
    tips_fr: ["Choisissez des forces pertinentes pour le poste", "Appuyez avec des exemples concrets", "Soyez authentique"],
  },
  {
    id: "icq-behav-03",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "What is your biggest weakness?",
    question_fr: "Quelle est votre plus grande faiblesse ?",
    sample_answer:
      "I tend to be overly detail-oriented, which sometimes slows me down. I've been working on this by setting time limits for each task and using the Pareto principle to focus on high-impact items.",
    sample_answer_fr:
      "J'ai tendance à être trop perfectionniste sur les détails, ce qui me ralentit parfois. Je travaille dessus en fixant des limites de temps pour chaque tâche et en utilisant le principe de Pareto pour me concentrer sur les éléments à fort impact.",
    tips: ["Choose a real weakness", "Show self-awareness", "Explain how you're improving"],
    tips_fr: ["Choisissez une vraie faiblesse", "Montrez votre conscience de soi", "Expliquez comment vous vous améliorez"],
  },
  {
    id: "icq-behav-04",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Tell me about a time you failed.",
    question_fr: "Parlez-moi d'un moment où vous avez échoué.",
    sample_answer:
      "During a group project at IMTA, I tried to do everything myself and missed the deadline. I learned that delegation isn't weakness — it's leadership. Now I always start projects by defining clear roles.",
    sample_answer_fr:
      "Lors d'un projet de groupe à l'IMTA, j'ai essayé de tout faire seul et j'ai raté la deadline. J'ai appris que déléguer n'est pas une faiblesse — c'est du leadership. Maintenant, je commence toujours les projets en définissant des rôles clairs.",
    tips: ["Be honest about the failure", "Focus on what you learned", "Show how you changed"],
    tips_fr: ["Soyez honnête sur l'échec", "Concentrez-vous sur ce que vous avez appris", "Montrez comment vous avez changé"],
  },
  {
    id: "icq-behav-05",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Describe a conflict you had with a colleague.",
    question_fr: "Décrivez un conflit que vous avez eu avec un collègue.",
    sample_answer:
      "During an internship, a colleague and I disagreed on a project approach. I suggested we each present our case to the team and let data decide. We ended up combining the best of both ideas.",
    sample_answer_fr:
      "Pendant un stage, un collègue et moi étions en désaccord sur l'approche d'un projet. J'ai proposé que chacun présente son cas à l'équipe et laisse les données trancher. Nous avons fini par combiner le meilleur des deux idées.",
    tips: ["Stay professional", "Show conflict resolution skills", "Focus on the positive outcome"],
    tips_fr: ["Restez professionnel", "Montrez vos compétences de résolution de conflits", "Concentrez-vous sur le résultat positif"],
  },
  {
    id: "icq-behav-06",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "Why should we hire you?",
    question_fr: "Pourquoi devrions-nous vous embaucher ?",
    sample_answer:
      "I bring a unique combination of IMTA's rigorous technical training and hands-on internship experience. My bilingual abilities in French and Arabic allow me to work effectively across Morocco's diverse professional landscape.",
    sample_answer_fr:
      "J'apporte une combinaison unique de la formation technique rigoureuse de l'IMTA et d'une expérience pratique en stage. Mes compétences bilingues en français et en arabe me permettent de travailler efficacement dans le paysage professionnel diversifié du Maroc.",
    tips: ["Link your skills to the job requirements", "Be specific about your value", "Show enthusiasm"],
    tips_fr: ["Reliez vos compétences aux exigences du poste", "Soyez précis sur votre valeur ajoutée", "Montrez de l'enthousiasme"],
  },
  {
    id: "icq-behav-07",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "Where do you see yourself in 5 years?",
    question_fr: "Où vous voyez-vous dans 5 ans ?",
    sample_answer:
      "I see myself growing into a senior engineering role within your organization, leading a team and contributing to strategic projects. I'm committed to continuous learning and obtaining relevant certifications.",
    sample_answer_fr:
      "Je me vois évoluer vers un poste d'ingénieur senior au sein de votre organisation, dirigeant une équipe et contribuant à des projets stratégiques. Je m'engage dans l'apprentissage continu et l'obtention de certifications pertinentes.",
    tips: ["Show ambition aligned with the company", "Be realistic", "Mention professional development"],
    tips_fr: ["Montrez une ambition alignée avec l'entreprise", "Soyez réaliste", "Mentionnez le développement professionnel"],
  },
  {
    id: "icq-behav-08",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "How do you handle pressure and tight deadlines?",
    question_fr: "Comment gérez-vous la pression et les délais serrés ?",
    sample_answer:
      "I prioritize tasks using the Eisenhower matrix and break large projects into smaller milestones. During my final-year project at IMTA, I managed to deliver ahead of schedule by using this method.",
    sample_answer_fr:
      "Je priorise les tâches avec la matrice d'Eisenhower et décompose les grands projets en jalons plus petits. Pendant mon projet de fin d'études à l'IMTA, j'ai réussi à livrer en avance en utilisant cette méthode.",
    tips: ["Give a specific method", "Back it up with an example", "Show you thrive under pressure"],
    tips_fr: ["Donnez une méthode spécifique", "Illustrez avec un exemple", "Montrez que vous performez sous pression"],
  },
  {
    id: "icq-behav-09",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "Why did you choose IMTA?",
    question_fr: "Pourquoi avez-vous choisi l'IMTA ?",
    sample_answer:
      "IMTA's multidisciplinary approach combining industrial engineering, management, and hands-on training perfectly aligned with my career goals. The strong industry partnerships and internship program were decisive factors.",
    sample_answer_fr:
      "L'approche pluridisciplinaire de l'IMTA, combinant ingénierie industrielle, management et formation pratique, correspondait parfaitement à mes objectifs de carrière. Les partenariats industriels solides et le programme de stages ont été des facteurs décisifs.",
    tips: ["Be specific about IMTA's strengths", "Connect to your career goals", "Show genuine appreciation"],
    tips_fr: ["Soyez précis sur les atouts de l'IMTA", "Reliez à vos objectifs de carrière", "Montrez une appréciation sincère"],
  },
  {
    id: "icq-behav-10",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Give an example of when you showed leadership.",
    question_fr: "Donnez un exemple où vous avez fait preuve de leadership.",
    sample_answer:
      "As project lead for our industrial process optimization assignment at IMTA, I coordinated a team of 6 students, set up weekly check-ins, and used Trello for task management. We received the highest grade in our cohort.",
    sample_answer_fr:
      "En tant que chef de projet pour notre devoir d'optimisation des procédés industriels à l'IMTA, j'ai coordonné une équipe de 6 étudiants, mis en place des réunions hebdomadaires et utilisé Trello pour la gestion des tâches. Nous avons obtenu la meilleure note de notre promotion.",
    tips: ["Describe your specific role", "Mention tools/methods used", "Quantify the result"],
    tips_fr: ["Décrivez votre rôle spécifique", "Mentionnez les outils/méthodes utilisés", "Quantifiez le résultat"],
  },
  {
    id: "icq-behav-11",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "How do you prioritize multiple tasks?",
    question_fr: "Comment priorisez-vous plusieurs tâches simultanées ?",
    sample_answer:
      "I use the MoSCoW method — categorizing tasks as Must, Should, Could, Won't. During exam season at IMTA while doing my internship report, this helped me focus on what truly mattered.",
    sample_answer_fr:
      "J'utilise la méthode MoSCoW — en catégorisant les tâches en Must, Should, Could, Won't. Pendant la période d'examens à l'IMTA tout en rédigeant mon rapport de stage, cela m'a aidé à me concentrer sur l'essentiel.",
    tips: ["Name a specific framework", "Show real application", "Demonstrate organizational skills"],
    tips_fr: ["Nommez un cadre spécifique", "Montrez une application réelle", "Démontrez vos capacités d'organisation"],
  },
  {
    id: "icq-behav-12",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "What motivates you at work?",
    question_fr: "Qu'est-ce qui vous motive au travail ?",
    sample_answer:
      "I'm motivated by solving complex problems that have real-world impact. Seeing a process improvement I designed actually being implemented on the factory floor gives me immense satisfaction.",
    sample_answer_fr:
      "Je suis motivé par la résolution de problèmes complexes ayant un impact réel. Voir une amélioration de processus que j'ai conçue être effectivement mise en œuvre sur le terrain me procure une immense satisfaction.",
    tips: ["Be authentic", "Connect to the role", "Avoid purely financial motivations"],
    tips_fr: ["Soyez authentique", "Connectez à ce poste", "Évitez les motivations purement financières"],
  },
  {
    id: "icq-behav-13",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Describe a situation where you went above and beyond.",
    question_fr: "Décrivez une situation où vous avez dépassé les attentes.",
    sample_answer:
      "During my internship, I was asked to audit a single production line. I noticed similar issues on adjacent lines and proactively created a comprehensive report covering all three, saving the company weeks of additional auditing.",
    sample_answer_fr:
      "Pendant mon stage, on m'a demandé d'auditer une seule ligne de production. J'ai remarqué des problèmes similaires sur les lignes adjacentes et j'ai proactivement créé un rapport complet couvrant les trois, économisant des semaines d'audit supplémentaire à l'entreprise.",
    tips: ["Show initiative", "Quantify the impact", "Be specific"],
    tips_fr: ["Montrez votre initiative", "Quantifiez l'impact", "Soyez précis"],
  },
  {
    id: "icq-behav-14",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "How do you handle criticism?",
    question_fr: "Comment gérez-vous la critique ?",
    sample_answer:
      "I view criticism as a growth opportunity. When my IMTA professor criticized my presentation style, I enrolled in a public speaking workshop. My next presentation received excellent feedback.",
    sample_answer_fr:
      "Je considère la critique comme une opportunité de croissance. Quand mon professeur de l'IMTA a critiqué mon style de présentation, je me suis inscrit à un atelier de prise de parole. Ma présentation suivante a reçu d'excellents retours.",
    tips: ["Show emotional maturity", "Give a specific example", "Focus on growth"],
    tips_fr: ["Montrez votre maturité émotionnelle", "Donnez un exemple spécifique", "Concentrez-vous sur la croissance"],
  },
  {
    id: "icq-behav-15",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Tell me about a time you had to learn something quickly.",
    question_fr: "Parlez-moi d'un moment où vous avez dû apprendre quelque chose rapidement.",
    sample_answer:
      "During my internship, I needed to learn SAP in two weeks to complete an inventory management project. I used online courses, asked colleagues for tips, and created cheat sheets. I completed the project on time.",
    sample_answer_fr:
      "Pendant mon stage, je devais apprendre SAP en deux semaines pour un projet de gestion des stocks. J'ai utilisé des cours en ligne, demandé des conseils aux collègues et créé des aide-mémoire. J'ai terminé le projet dans les délais.",
    tips: ["Show learning agility", "Describe your learning method", "Highlight the successful outcome"],
    tips_fr: ["Montrez votre agilité d'apprentissage", "Décrivez votre méthode", "Soulignez le résultat réussi"],
  },
  {
    id: "icq-behav-16",
    type: "behavioral",
    field: "general",
    difficulty: "advanced",
    question: "What would your previous manager say about you?",
    question_fr: "Que dirait votre ancien responsable de vous ?",
    sample_answer:
      "My internship supervisor at Renault Tanger described me as 'rigorous, curious, and a team player.' She appreciated my initiative in proposing improvements and my reliability in meeting deadlines.",
    sample_answer_fr:
      "Mon encadrant de stage chez Renault Tanger m'a décrit comme 'rigoureux, curieux et bon joueur d'équipe.' Elle a apprécié mon initiative dans la proposition d'améliorations et ma fiabilité dans le respect des délais.",
    tips: ["Be honest", "Use specific quotes if possible", "Choose traits relevant to the job"],
    tips_fr: ["Soyez honnête", "Utilisez des citations spécifiques si possible", "Choisissez des traits pertinents pour le poste"],
  },
  {
    id: "icq-behav-17",
    type: "behavioral",
    field: "general",
    difficulty: "beginner",
    question: "What are your salary expectations?",
    question_fr: "Quelles sont vos prétentions salariales ?",
    sample_answer:
      "Based on my research of the Moroccan market for this role and my qualifications, I'm looking for a range between 10,000 and 13,000 MAD net per month. I'm open to discussing the overall compensation package.",
    sample_answer_fr:
      "Selon mes recherches sur le marché marocain pour ce poste et mes qualifications, je vise une fourchette entre 10 000 et 13 000 MAD net par mois. Je suis ouvert à discuter du package de rémunération global.",
    tips: ["Research the market first", "Give a range, not a single number", "Mention total package"],
    tips_fr: ["Faites vos recherches d'abord", "Donnez une fourchette, pas un chiffre unique", "Mentionnez le package global"],
  },
  {
    id: "icq-behav-18",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "Why are you leaving your current position?",
    question_fr: "Pourquoi quittez-vous votre poste actuel ?",
    sample_answer:
      "I'm looking for new challenges and opportunities to grow my skills in a more dynamic environment. Your company's innovative projects in the Moroccan market particularly excite me.",
    sample_answer_fr:
      "Je cherche de nouveaux défis et des opportunités de développer mes compétences dans un environnement plus dynamique. Les projets innovants de votre entreprise sur le marché marocain m'enthousiasment particulièrement.",
    tips: ["Never badmouth previous employer", "Focus on what you seek", "Be positive"],
    tips_fr: ["Ne dénigrez jamais l'ancien employeur", "Concentrez-vous sur ce que vous recherchez", "Restez positif"],
  },
  {
    id: "icq-behav-19",
    type: "behavioral",
    field: "general",
    difficulty: "intermediate",
    question: "How do you work in a multicultural team?",
    question_fr: "Comment travaillez-vous dans une équipe multiculturelle ?",
    sample_answer:
      "At IMTA, I worked with classmates from across Morocco and international exchange students. I learned to adapt my communication style, respect different perspectives, and find common ground through shared goals.",
    sample_answer_fr:
      "À l'IMTA, j'ai travaillé avec des camarades de tout le Maroc et des étudiants internationaux en échange. J'ai appris à adapter mon style de communication, respecter les différentes perspectives et trouver un terrain d'entente à travers des objectifs communs.",
    tips: ["Show cultural sensitivity", "Give specific examples", "Highlight communication skills"],
    tips_fr: ["Montrez votre sensibilité culturelle", "Donnez des exemples précis", "Soulignez vos compétences en communication"],
  },
  {
    id: "icq-behav-20",
    type: "behavioral",
    field: "general",
    difficulty: "advanced",
    question: "What is the most difficult decision you've had to make?",
    question_fr: "Quelle est la décision la plus difficile que vous ayez dû prendre ?",
    sample_answer:
      "Choosing between two internship offers: a prestigious multinational vs. a Moroccan startup where I'd have more responsibility. I chose the startup and it taught me more about entrepreneurship and ownership than I could have imagined.",
    sample_answer_fr:
      "Choisir entre deux offres de stage : une multinationale prestigieuse vs. une startup marocaine où j'aurais plus de responsabilités. J'ai choisi la startup et cela m'a appris plus sur l'entrepreneuriat et la prise de responsabilité que je n'aurais pu imaginer.",
    tips: ["Show your decision-making process", "Explain the tradeoffs", "Reflect on what you learned"],
    tips_fr: ["Montrez votre processus de décision", "Expliquez les compromis", "Réfléchissez à ce que vous avez appris"],
  },

  // TECHNICAL (20)
  {
    id: "icq-tech-01",
    type: "technical",
    field: "it",
    difficulty: "intermediate",
    question: "Explain the difference between REST and GraphQL.",
    question_fr: "Expliquez la différence entre REST et GraphQL.",
    sample_answer:
      "REST uses multiple endpoints with fixed data structures, while GraphQL uses a single endpoint where the client specifies exactly what data it needs. GraphQL reduces over-fetching but adds complexity.",
    sample_answer_fr:
      "REST utilise plusieurs endpoints avec des structures de données fixes, tandis que GraphQL utilise un seul endpoint où le client spécifie exactement les données dont il a besoin. GraphQL réduit le sur-chargement mais ajoute de la complexité.",
    tips: ["Compare pros and cons", "Give use cases for each", "Mention real-world examples"],
    tips_fr: ["Comparez avantages et inconvénients", "Donnez des cas d'utilisation pour chacun", "Mentionnez des exemples concrets"],
  },
  {
    id: "icq-tech-02",
    type: "technical",
    field: "it",
    difficulty: "intermediate",
    question: "What is the difference between SQL and NoSQL databases?",
    question_fr: "Quelle est la différence entre les bases de données SQL et NoSQL ?",
    sample_answer:
      "SQL databases (PostgreSQL, MySQL) use structured tables and enforce ACID properties. NoSQL databases (MongoDB, Redis) offer flexible schemas and horizontal scaling. Choose based on your data model and consistency requirements.",
    sample_answer_fr:
      "Les bases SQL (PostgreSQL, MySQL) utilisent des tables structurées et garantissent les propriétés ACID. Les bases NoSQL (MongoDB, Redis) offrent des schémas flexibles et une mise à l'échelle horizontale. Choisissez selon votre modèle de données et vos exigences de cohérence.",
    tips: ["Know when to use each", "Mention specific products", "Discuss scalability tradeoffs"],
    tips_fr: ["Sachez quand utiliser chacun", "Mentionnez des produits spécifiques", "Discutez des compromis de scalabilité"],
  },
  {
    id: "icq-tech-03",
    type: "technical",
    field: "it",
    difficulty: "advanced",
    question: "Explain microservices architecture and when to use it.",
    question_fr: "Expliquez l'architecture microservices et quand l'utiliser.",
    sample_answer:
      "Microservices decompose an application into independent services that communicate via APIs. Use them when you need independent scaling, deployment, and team autonomy. Start with a monolith and extract services as needed.",
    sample_answer_fr:
      "Les microservices décomposent une application en services indépendants communicant via des API. Utilisez-les quand vous avez besoin de mise à l'échelle indépendante, de déploiement autonome et d'autonomie des équipes. Commencez par un monolithe et extrayez les services au besoin.",
    tips: ["Discuss tradeoffs honestly", "Mention patterns: API Gateway, Service Discovery", "Don't oversell microservices"],
    tips_fr: ["Discutez honnêtement des compromis", "Mentionnez les patterns : API Gateway, Service Discovery", "Ne survendez pas les microservices"],
  },
  {
    id: "icq-tech-04",
    type: "technical",
    field: "it",
    difficulty: "beginner",
    question: "What is version control and why is it important?",
    question_fr: "Qu'est-ce que le contrôle de version et pourquoi est-ce important ?",
    sample_answer:
      "Version control (like Git) tracks changes to code over time, enables collaboration, and allows rollback to previous states. It's essential for any professional development workflow.",
    sample_answer_fr:
      "Le contrôle de version (comme Git) suit les modifications du code au fil du temps, permet la collaboration et autorise le retour à des états précédents. C'est essentiel pour tout workflow de développement professionnel.",
    tips: ["Mention Git specifically", "Discuss branching strategies", "Talk about collaboration benefits"],
    tips_fr: ["Mentionnez Git spécifiquement", "Discutez des stratégies de branching", "Parlez des bénéfices de collaboration"],
  },
  {
    id: "icq-tech-05",
    type: "technical",
    field: "engineering",
    difficulty: "intermediate",
    question: "Explain the Lean Manufacturing principles.",
    question_fr: "Expliquez les principes du Lean Manufacturing.",
    sample_answer:
      "Lean focuses on eliminating waste (muda) through 5 principles: Value, Value Stream, Flow, Pull, and Perfection. Tools include 5S, Kanban, Kaizen, and Value Stream Mapping.",
    sample_answer_fr:
      "Le Lean se concentre sur l'élimination des gaspillages (muda) à travers 5 principes : Valeur, Chaîne de Valeur, Flux, Tirer, Perfection. Les outils incluent 5S, Kanban, Kaizen et la Cartographie de la Chaîne de Valeur.",
    tips: ["Name all 5 principles", "Know the 8 types of waste", "Give factory examples"],
    tips_fr: ["Nommez les 5 principes", "Connaissez les 8 types de gaspillage", "Donnez des exemples d'usine"],
  },
  {
    id: "icq-tech-06",
    type: "technical",
    field: "engineering",
    difficulty: "intermediate",
    question: "What is Six Sigma and how does it differ from Lean?",
    question_fr: "Qu'est-ce que Six Sigma et en quoi diffère-t-il du Lean ?",
    sample_answer:
      "Six Sigma uses statistical methods (DMAIC) to reduce defects to 3.4 per million. Lean focuses on eliminating waste and improving flow. Many companies use Lean Six Sigma which combines both.",
    sample_answer_fr:
      "Six Sigma utilise des méthodes statistiques (DMAIC) pour réduire les défauts à 3,4 par million. Le Lean se concentre sur l'élimination des gaspillages et l'amélioration du flux. Beaucoup d'entreprises utilisent Lean Six Sigma qui combine les deux.",
    tips: ["Know DMAIC phases", "Explain sigma levels", "Mention Belt certifications"],
    tips_fr: ["Connaissez les phases DMAIC", "Expliquez les niveaux sigma", "Mentionnez les certifications Belt"],
  },
  {
    id: "icq-tech-07",
    type: "technical",
    field: "hse",
    difficulty: "intermediate",
    question: "Describe the HAZOP methodology.",
    question_fr: "Décrivez la méthodologie HAZOP.",
    sample_answer:
      "HAZOP (Hazard and Operability study) systematically identifies process hazards using guide words (No, More, Less, Reverse, Part Of) applied to process parameters. It's conducted by a multidisciplinary team reviewing P&IDs.",
    sample_answer_fr:
      "HAZOP (Hazard and Operability study) identifie systématiquement les dangers des procédés en utilisant des mots-guides (Non, Plus, Moins, Inverse, Partie de) appliqués aux paramètres du procédé. Elle est menée par une équipe pluridisciplinaire examinant les P&ID.",
    tips: ["Know the guide words", "Explain team composition", "Give an example deviation"],
    tips_fr: ["Connaissez les mots-guides", "Expliquez la composition de l'équipe", "Donnez un exemple de déviation"],
  },
  {
    id: "icq-tech-08",
    type: "technical",
    field: "hse",
    difficulty: "intermediate",
    question: "What is ISO 14001 and how is it implemented?",
    question_fr: "Qu'est-ce que l'ISO 14001 et comment est-elle mise en œuvre ?",
    sample_answer:
      "ISO 14001 is the environmental management system standard using Plan-Do-Check-Act. Implementation involves: environmental policy, aspects identification, legal compliance, objectives, operational controls, and management review.",
    sample_answer_fr:
      "L'ISO 14001 est la norme du système de management environnemental utilisant Plan-Do-Check-Act. La mise en œuvre comprend : politique environnementale, identification des aspects, conformité légale, objectifs, contrôles opérationnels et revue de direction.",
    tips: ["Know the PDCA cycle", "Mention environmental aspects vs impacts", "Discuss certification process"],
    tips_fr: ["Connaissez le cycle PDCA", "Mentionnez aspects vs impacts environnementaux", "Discutez du processus de certification"],
  },
  {
    id: "icq-tech-09",
    type: "technical",
    field: "healthcare",
    difficulty: "intermediate",
    question: "Explain infection control protocols in a hospital setting.",
    question_fr: "Expliquez les protocoles de contrôle des infections en milieu hospitalier.",
    sample_answer:
      "Infection control includes hand hygiene (WHO 5 moments), PPE usage, isolation precautions (standard, contact, droplet, airborne), environmental cleaning, and antimicrobial stewardship programs.",
    sample_answer_fr:
      "Le contrôle des infections comprend l'hygiène des mains (5 moments OMS), l'utilisation des EPI, les précautions d'isolement (standard, contact, gouttelettes, aérienne), le nettoyage environnemental et les programmes de bon usage des antimicrobiens.",
    tips: ["Know the WHO 5 moments", "Discuss PPE properly", "Mention Moroccan context"],
    tips_fr: ["Connaissez les 5 moments OMS", "Discutez correctement des EPI", "Mentionnez le contexte marocain"],
  },
  {
    id: "icq-tech-10",
    type: "technical",
    field: "finance",
    difficulty: "intermediate",
    question: "Explain the Basel III requirements.",
    question_fr: "Expliquez les exigences de Bâle III.",
    sample_answer:
      "Basel III strengthens bank regulation through: higher capital requirements (CET1 at 4.5%), leverage ratio, liquidity ratios (LCR, NSFR), and countercyclical buffers. Morocco's Bank Al-Maghrib has progressively adopted these standards.",
    sample_answer_fr:
      "Bâle III renforce la réglementation bancaire par : des exigences de fonds propres plus élevées (CET1 à 4,5%), ratio de levier, ratios de liquidité (LCR, NSFR) et coussins contracycliques. Bank Al-Maghrib au Maroc a progressivement adopté ces normes.",
    tips: ["Know the three pillars", "Mention specific ratios", "Reference Moroccan implementation"],
    tips_fr: ["Connaissez les trois piliers", "Mentionnez les ratios spécifiques", "Référencez l'implémentation marocaine"],
  },
  {
    id: "icq-tech-11",
    type: "technical",
    field: "it",
    difficulty: "advanced",
    question: "How would you design a scalable API?",
    question_fr: "Comment concevriez-vous une API scalable ?",
    sample_answer:
      "Start with clear resource modeling, use pagination, implement caching (Redis), rate limiting, versioning, and async processing for heavy tasks. Use load balancers and horizontal scaling with stateless services.",
    sample_answer_fr:
      "Commencez par une modélisation claire des ressources, utilisez la pagination, implémentez le caching (Redis), le rate limiting, le versioning et le traitement asynchrone pour les tâches lourdes. Utilisez des load balancers et le scaling horizontal avec des services stateless.",
    tips: ["Mention specific patterns", "Discuss caching strategies", "Address monitoring"],
    tips_fr: ["Mentionnez des patterns spécifiques", "Discutez des stratégies de cache", "Abordez le monitoring"],
  },
  {
    id: "icq-tech-12",
    type: "technical",
    field: "it",
    difficulty: "beginner",
    question: "What is CI/CD and why is it important?",
    question_fr: "Qu'est-ce que le CI/CD et pourquoi est-ce important ?",
    sample_answer:
      "CI (Continuous Integration) automatically builds and tests code on each commit. CD (Continuous Delivery/Deployment) automates release to production. Together, they reduce bugs, speed up delivery, and increase team confidence.",
    sample_answer_fr:
      "Le CI (Intégration Continue) compile et teste automatiquement le code à chaque commit. Le CD (Livraison/Déploiement Continu) automatise la mise en production. Ensemble, ils réduisent les bugs, accélèrent les livraisons et augmentent la confiance de l'équipe.",
    tips: ["Name specific tools (Jenkins, GitLab CI, GitHub Actions)", "Explain the pipeline stages", "Discuss automated testing"],
    tips_fr: ["Nommez des outils (Jenkins, GitLab CI, GitHub Actions)", "Expliquez les étapes du pipeline", "Discutez des tests automatisés"],
  },
  {
    id: "icq-tech-13",
    type: "technical",
    field: "engineering",
    difficulty: "intermediate",
    question: "Explain the concept of SCADA systems.",
    question_fr: "Expliquez le concept des systèmes SCADA.",
    sample_answer:
      "SCADA (Supervisory Control and Data Acquisition) monitors and controls industrial processes in real-time. It consists of RTUs/PLCs, communication networks, and HMI software. Used extensively in OCP, ONEE, and Moroccan water treatment.",
    sample_answer_fr:
      "SCADA (Supervisory Control and Data Acquisition) surveille et contrôle les processus industriels en temps réel. Il se compose de RTU/PLC, réseaux de communication et logiciels IHM. Très utilisé à l'OCP, l'ONEE et dans le traitement des eaux au Maroc.",
    tips: ["Know the components", "Mention cybersecurity aspects", "Reference Moroccan industry"],
    tips_fr: ["Connaissez les composants", "Mentionnez les aspects cybersécurité", "Référencez l'industrie marocaine"],
  },
  {
    id: "icq-tech-14",
    type: "technical",
    field: "engineering",
    difficulty: "advanced",
    question: "Describe a process optimization project you worked on.",
    question_fr: "Décrivez un projet d'optimisation de processus sur lequel vous avez travaillé.",
    sample_answer:
      "During my internship, I optimized a packaging line by applying OEE analysis. I identified setup time as the main bottleneck, implemented SMED techniques, and reduced changeover time from 45 to 12 minutes, increasing throughput by 22%.",
    sample_answer_fr:
      "Pendant mon stage, j'ai optimisé une ligne d'emballage en appliquant l'analyse OEE. J'ai identifié le temps de réglage comme principal goulot d'étranglement, mis en œuvre les techniques SMED et réduit le temps de changement de 45 à 12 minutes, augmentant le rendement de 22%.",
    tips: ["Use specific numbers", "Name the methodology", "Show before/after comparison"],
    tips_fr: ["Utilisez des chiffres précis", "Nommez la méthodologie", "Montrez la comparaison avant/après"],
  },
  {
    id: "icq-tech-15",
    type: "technical",
    field: "it",
    difficulty: "intermediate",
    question: "What are Docker containers and why use them?",
    question_fr: "Que sont les conteneurs Docker et pourquoi les utiliser ?",
    sample_answer:
      "Docker containers package applications with their dependencies in isolated environments. They ensure consistency across development, testing, and production. They're lighter than VMs and enable microservices deployment.",
    sample_answer_fr:
      "Les conteneurs Docker empaquètent les applications avec leurs dépendances dans des environnements isolés. Ils garantissent la cohérence entre développement, test et production. Plus légers que les VM, ils permettent le déploiement de microservices.",
    tips: ["Compare with VMs", "Mention Docker Compose", "Discuss Kubernetes for orchestration"],
    tips_fr: ["Comparez avec les VM", "Mentionnez Docker Compose", "Discutez de Kubernetes pour l'orchestration"],
  },
  {
    id: "icq-tech-16",
    type: "technical",
    field: "hse",
    difficulty: "beginner",
    question: "What are the 5S principles?",
    question_fr: "Quels sont les principes des 5S ?",
    sample_answer:
      "5S is a workplace organization method: Sort (Seiri), Set in Order (Seiton), Shine (Seiso), Standardize (Seiketsu), and Sustain (Shitsuke). It improves safety, efficiency, and morale on the factory floor.",
    sample_answer_fr:
      "5S est une méthode d'organisation du lieu de travail : Trier (Seiri), Ranger (Seiton), Nettoyer (Seiso), Standardiser (Seiketsu) et Maintenir (Shitsuke). Elle améliore la sécurité, l'efficacité et le moral sur le lieu de travail.",
    tips: ["Name all 5S in Japanese and translation", "Give a concrete example", "Mention visual management"],
    tips_fr: ["Nommez les 5S en japonais et leur traduction", "Donnez un exemple concret", "Mentionnez le management visuel"],
  },
  {
    id: "icq-tech-17",
    type: "technical",
    field: "it",
    difficulty: "advanced",
    question: "Explain the concepts of OAuth 2.0 and JWT.",
    question_fr: "Expliquez les concepts d'OAuth 2.0 et JWT.",
    sample_answer:
      "OAuth 2.0 is an authorization framework that lets applications access user resources without sharing passwords. JWT (JSON Web Token) is a compact, self-contained token format often used with OAuth for stateless authentication.",
    sample_answer_fr:
      "OAuth 2.0 est un framework d'autorisation qui permet aux applications d'accéder aux ressources utilisateur sans partager les mots de passe. JWT (JSON Web Token) est un format de jeton compact et autonome souvent utilisé avec OAuth pour l'authentification stateless.",
    tips: ["Differentiate authentication vs authorization", "Know the OAuth flows", "Discuss security considerations"],
    tips_fr: ["Différenciez authentification vs autorisation", "Connaissez les flux OAuth", "Discutez des considérations de sécurité"],
  },
  {
    id: "icq-tech-18",
    type: "technical",
    field: "healthcare",
    difficulty: "advanced",
    question: "How do you ensure patient data privacy?",
    question_fr: "Comment assurez-vous la confidentialité des données patients ?",
    sample_answer:
      "Through access controls, encryption, audit trails, and staff training. In Morocco, follow Law 09-08 on personal data protection and medical ethics codes. Implement role-based access and regular security audits.",
    sample_answer_fr:
      "Par des contrôles d'accès, le chiffrement, les pistes d'audit et la formation du personnel. Au Maroc, suivez la loi 09-08 sur la protection des données personnelles et les codes de déontologie médicale. Implémentez un accès basé sur les rôles et des audits de sécurité réguliers.",
    tips: ["Reference Moroccan law 09-08", "Mention CNDP", "Discuss technical and organizational measures"],
    tips_fr: ["Référencez la loi marocaine 09-08", "Mentionnez la CNDP", "Discutez des mesures techniques et organisationnelles"],
  },
  {
    id: "icq-tech-19",
    type: "technical",
    field: "finance",
    difficulty: "intermediate",
    question: "Explain the difference between IFRS and Moroccan GAAP.",
    question_fr: "Expliquez la différence entre les IFRS et le PCG marocain.",
    sample_answer:
      "Moroccan GAAP (Plan Comptable Général) is rule-based and specific to Morocco. IFRS is principle-based and internationally recognized. Listed Moroccan companies must use IFRS for consolidated financial statements since 2008.",
    sample_answer_fr:
      "Le PCG marocain est basé sur des règles et spécifique au Maroc. Les IFRS sont basées sur des principes et reconnues internationalement. Les sociétés marocaines cotées doivent utiliser les IFRS pour les états financiers consolidés depuis 2008.",
    tips: ["Know key differences", "Mention Moroccan requirements", "Discuss convergence trends"],
    tips_fr: ["Connaissez les différences clés", "Mentionnez les exigences marocaines", "Discutez des tendances de convergence"],
  },
  {
    id: "icq-tech-20",
    type: "technical",
    field: "engineering",
    difficulty: "intermediate",
    question: "What is a PLC and how is it programmed?",
    question_fr: "Qu'est-ce qu'un automate programmable (PLC) et comment est-il programmé ?",
    sample_answer:
      "A PLC (Programmable Logic Controller) is an industrial computer for automating manufacturing processes. Programmed using IEC 61131-3 languages: Ladder Logic, Structured Text, Function Block Diagram, Sequential Function Chart, and Instruction List.",
    sample_answer_fr:
      "Un PLC (automate programmable industriel) est un ordinateur industriel pour automatiser les processus de fabrication. Programmé selon les langages IEC 61131-3 : Ladder, texte structuré, bloc fonctionnel, GRAFCET et liste d'instructions.",
    tips: ["Know IEC 61131-3 languages", "Mention Siemens, Allen-Bradley brands", "Discuss scan cycle"],
    tips_fr: ["Connaissez les langages IEC 61131-3", "Mentionnez Siemens, Allen-Bradley", "Discutez du cycle de scrutation"],
  },

  // SITUATIONAL (15)
  {
    id: "icq-sit-01",
    type: "situational",
    field: "general",
    difficulty: "intermediate",
    question: "Your team disagrees on a project direction. What do you do?",
    question_fr: "Votre équipe est en désaccord sur la direction d'un projet. Que faites-vous ?",
    sample_answer:
      "I would organize a structured discussion where each person presents their viewpoint with supporting data. Then facilitate a decision-making process — perhaps voting or SWOT analysis — to reach consensus.",
    sample_answer_fr:
      "J'organiserais une discussion structurée où chacun présente son point de vue avec des données à l'appui. Puis je faciliterais un processus de décision — peut-être un vote ou une analyse SWOT — pour atteindre un consensus.",
    tips: ["Show diplomacy", "Use a structured approach", "Focus on team alignment"],
    tips_fr: ["Montrez de la diplomatie", "Utilisez une approche structurée", "Concentrez-vous sur l'alignement de l'équipe"],
  },
  {
    id: "icq-sit-02",
    type: "situational",
    field: "hse",
    difficulty: "advanced",
    question: "You discover a safety violation. The manager tells you to ignore it. What do you do?",
    question_fr: "Vous découvrez une violation de sécurité. Le manager vous dit de l'ignorer. Que faites-vous ?",
    sample_answer:
      "Safety is non-negotiable. I would document the violation, explain the risks to the manager, and if they insist, escalate to the HSE department or use the company's reporting channel. Protecting lives takes priority over hierarchy.",
    sample_answer_fr:
      "La sécurité n'est pas négociable. Je documenterais la violation, expliquerais les risques au manager, et s'il insiste, j'escaladerais au département HSE ou utiliserais le canal de signalement de l'entreprise. Protéger des vies prime sur la hiérarchie.",
    tips: ["Show ethical backbone", "Know escalation procedures", "Reference legal obligations"],
    tips_fr: ["Montrez votre intégrité éthique", "Connaissez les procédures d'escalade", "Référencez les obligations légales"],
  },
  {
    id: "icq-sit-03",
    type: "situational",
    field: "general",
    difficulty: "intermediate",
    question: "A client is unhappy with the deliverable. How do you handle it?",
    question_fr: "Un client est mécontent du livrable. Comment gérez-vous la situation ?",
    sample_answer:
      "First, listen actively to understand their concerns without being defensive. Then acknowledge the gap between expectations and delivery, propose a corrective action plan with timeline, and get their agreement before proceeding.",
    sample_answer_fr:
      "D'abord, écouter activement pour comprendre leurs préoccupations sans être sur la défensive. Puis reconnaître l'écart entre les attentes et le livrable, proposer un plan d'action correctif avec un calendrier, et obtenir leur accord avant de procéder.",
    tips: ["Show empathy first", "Propose concrete solutions", "Set clear expectations going forward"],
    tips_fr: ["Montrez de l'empathie d'abord", "Proposez des solutions concrètes", "Définissez des attentes claires pour la suite"],
  },
  {
    id: "icq-sit-04",
    type: "situational",
    field: "it",
    difficulty: "advanced",
    question: "The production server crashes at 2 AM. Walk me through your response.",
    question_fr: "Le serveur de production tombe en panne à 2h du matin. Décrivez votre réponse.",
    sample_answer:
      "1) Acknowledge the alert and assess severity. 2) Check monitoring dashboards and recent deployments. 3) If recent deploy, rollback. 4) Communicate to stakeholders. 5) Fix root cause. 6) Write post-mortem and update runbooks.",
    sample_answer_fr:
      "1) Accuser réception de l'alerte et évaluer la gravité. 2) Vérifier les tableaux de bord de monitoring et les déploiements récents. 3) Si déploiement récent, rollback. 4) Communiquer aux parties prenantes. 5) Corriger la cause racine. 6) Rédiger un post-mortem et mettre à jour les runbooks.",
    tips: ["Show systematic incident response", "Mention communication", "Include post-mortem"],
    tips_fr: ["Montrez une réponse systématique aux incidents", "Mentionnez la communication", "Incluez le post-mortem"],
  },
  {
    id: "icq-sit-05",
    type: "situational",
    field: "healthcare",
    difficulty: "advanced",
    question: "A patient's family is aggressive and demanding. How do you respond?",
    question_fr: "La famille d'un patient est agressive et exigeante. Comment répondez-vous ?",
    sample_answer:
      "Remain calm and empathetic — they're likely stressed and scared. Listen to their concerns, provide clear information about the patient's care, and set boundaries respectfully. Involve a supervisor if the situation escalates.",
    sample_answer_fr:
      "Restez calme et empathique — ils sont probablement stressés et effrayés. Écoutez leurs préoccupations, fournissez des informations claires sur les soins du patient, et posez des limites respectueusement. Impliquez un superviseur si la situation s'aggrave.",
    tips: ["Show empathy under pressure", "Set professional boundaries", "Know escalation protocols"],
    tips_fr: ["Montrez de l'empathie sous pression", "Posez des limites professionnelles", "Connaissez les protocoles d'escalade"],
  },
  {
    id: "icq-sit-06",
    type: "situational",
    field: "general",
    difficulty: "intermediate",
    question: "You realize your project will miss its deadline. What do you do?",
    question_fr: "Vous réalisez que votre projet va dépasser la deadline. Que faites-vous ?",
    sample_answer:
      "Communicate immediately — don't wait until the deadline. Present the status honestly, explain the causes, propose a revised timeline, and suggest what can be delivered by the original date (MVP approach).",
    sample_answer_fr:
      "Communiquez immédiatement — n'attendez pas la deadline. Présentez l'état d'avancement honnêtement, expliquez les causes, proposez un calendrier révisé et suggérez ce qui peut être livré à la date initiale (approche MVP).",
    tips: ["Communicate early", "Be transparent about causes", "Offer solutions not just problems"],
    tips_fr: ["Communiquez tôt", "Soyez transparent sur les causes", "Offrez des solutions, pas juste des problèmes"],
  },
  {
    id: "icq-sit-07",
    type: "situational",
    field: "industrial",
    difficulty: "intermediate",
    question: "A machine on the production line keeps breaking down. How do you approach this?",
    question_fr: "Une machine sur la ligne de production tombe en panne régulièrement. Quelle est votre approche ?",
    sample_answer:
      "Apply root cause analysis using the 5 Whys or Ishikawa diagram. Check maintenance records, analyze failure patterns, and implement preventive/predictive maintenance. Consider TPM (Total Productive Maintenance) methodology.",
    sample_answer_fr:
      "Appliquez une analyse des causes racines avec les 5 Pourquoi ou le diagramme d'Ishikawa. Vérifiez les registres de maintenance, analysez les schémas de défaillance et mettez en place une maintenance préventive/prédictive. Considérez la méthodologie TPM.",
    tips: ["Use structured analysis tools", "Mention maintenance strategies", "Consider total cost of ownership"],
    tips_fr: ["Utilisez des outils d'analyse structurés", "Mentionnez les stratégies de maintenance", "Considérez le coût total de possession"],
  },
  {
    id: "icq-sit-08",
    type: "situational",
    field: "general",
    difficulty: "intermediate",
    question: "A colleague takes credit for your work. How do you handle it?",
    question_fr: "Un collègue s'attribue le mérite de votre travail. Comment gérez-vous la situation ?",
    sample_answer:
      "Address it directly but professionally with the colleague first. Document your contributions going forward. If it continues, speak to your manager with evidence. Don't let resentment build up.",
    sample_answer_fr:
      "Abordez la situation directement mais professionnellement avec le collègue d'abord. Documentez vos contributions à l'avenir. Si cela continue, parlez à votre manager avec des preuves. Ne laissez pas le ressentiment s'accumuler.",
    tips: ["Be direct but diplomatic", "Keep documentation", "Focus on the behavior not the person"],
    tips_fr: ["Soyez direct mais diplomatique", "Gardez une documentation", "Concentrez-vous sur le comportement, pas la personne"],
  },
  {
    id: "icq-sit-09",
    type: "situational",
    field: "finance",
    difficulty: "advanced",
    question: "You discover a discrepancy in the financial statements. What steps do you take?",
    question_fr: "Vous découvrez une anomalie dans les états financiers. Quelles étapes suivez-vous ?",
    sample_answer:
      "Verify the discrepancy independently, document findings, report to my direct supervisor and the compliance officer. Follow the company's internal audit procedures. Do not attempt to correct it alone — transparency is critical.",
    sample_answer_fr:
      "Vérifier l'anomalie de manière indépendante, documenter les constatations, signaler à mon supérieur direct et au responsable conformité. Suivre les procédures d'audit interne de l'entreprise. Ne pas tenter de corriger seul — la transparence est cruciale.",
    tips: ["Show integrity", "Know audit procedures", "Emphasize transparency"],
    tips_fr: ["Montrez votre intégrité", "Connaissez les procédures d'audit", "Soulignez la transparence"],
  },
  {
    id: "icq-sit-10",
    type: "situational",
    field: "it",
    difficulty: "intermediate",
    question: "You need to choose between two technologies for a project. How do you decide?",
    question_fr: "Vous devez choisir entre deux technologies pour un projet. Comment décidez-vous ?",
    sample_answer:
      "Create a decision matrix evaluating: community support, performance benchmarks, team expertise, learning curve, cost, scalability, and long-term maintenance. Build a proof-of-concept with each if time allows.",
    sample_answer_fr:
      "Créez une matrice de décision évaluant : support communautaire, benchmarks de performance, expertise de l'équipe, courbe d'apprentissage, coût, scalabilité et maintenance à long terme. Construisez un proof-of-concept avec chacune si le temps le permet.",
    tips: ["Use a structured evaluation", "Consider team capabilities", "Think long-term"],
    tips_fr: ["Utilisez une évaluation structurée", "Considérez les capacités de l'équipe", "Pensez long terme"],
  },
  {
    id: "icq-sit-11",
    type: "situational",
    field: "general",
    difficulty: "advanced",
    question: "Your company is downsizing and you need to manage a team through the uncertainty. How?",
    question_fr: "Votre entreprise réduit ses effectifs et vous devez gérer une équipe dans l'incertitude. Comment ?",
    sample_answer:
      "Be transparent about what you know and don't know. Maintain regular communication, focus on controllable tasks, recognize team contributions, and support affected colleagues with empathy and practical help.",
    sample_answer_fr:
      "Soyez transparent sur ce que vous savez et ne savez pas. Maintenez une communication régulière, concentrez-vous sur les tâches contrôlables, reconnaissez les contributions de l'équipe et soutenez les collègues affectés avec empathie et aide pratique.",
    tips: ["Show emotional intelligence", "Balance honesty with reassurance", "Focus on what you can control"],
    tips_fr: ["Montrez votre intelligence émotionnelle", "Équilibrez honnêteté et rassurance", "Concentrez-vous sur ce que vous pouvez contrôler"],
  },
  {
    id: "icq-sit-12",
    type: "situational",
    field: "engineering",
    difficulty: "intermediate",
    question: "You're given a project with unclear requirements. What do you do?",
    question_fr: "On vous confie un projet avec des exigences floues. Que faites-vous ?",
    sample_answer:
      "Schedule a requirements clarification meeting with stakeholders. Use techniques like user stories, wireframes, or prototypes to align understanding. Deliver in iterations to get early feedback and reduce risk.",
    sample_answer_fr:
      "Planifiez une réunion de clarification des exigences avec les parties prenantes. Utilisez des techniques comme les user stories, wireframes ou prototypes pour aligner la compréhension. Livrez par itérations pour obtenir un feedback précoce et réduire les risques.",
    tips: ["Don't assume requirements", "Use visual tools", "Iterate and validate"],
    tips_fr: ["Ne supposez pas les exigences", "Utilisez des outils visuels", "Itérez et validez"],
  },
  {
    id: "icq-sit-13",
    type: "situational",
    field: "general",
    difficulty: "intermediate",
    question: "How would you onboard a new team member effectively?",
    question_fr: "Comment intégreriez-vous efficacement un nouveau membre de l'équipe ?",
    sample_answer:
      "Create a structured 30-60-90 day plan. Assign a buddy, schedule introductions with key stakeholders, provide documentation, set clear first-week goals, and have regular check-ins to address questions.",
    sample_answer_fr:
      "Créez un plan structuré 30-60-90 jours. Assignez un parrain, planifiez des présentations avec les parties prenantes clés, fournissez la documentation, fixez des objectifs clairs pour la première semaine et ayez des points réguliers pour répondre aux questions.",
    tips: ["Be systematic", "Assign a mentor/buddy", "Set early wins"],
    tips_fr: ["Soyez systématique", "Assignez un mentor/parrain", "Fixez des victoires rapides"],
  },
  {
    id: "icq-sit-14",
    type: "situational",
    field: "hse",
    difficulty: "intermediate",
    question: "How would you implement a safety culture in a company that doesn't prioritize it?",
    question_fr: "Comment instaureriez-vous une culture sécurité dans une entreprise qui ne la priorise pas ?",
    sample_answer:
      "Start with data — show accident costs and productivity impact. Get management buy-in with an ROI case. Launch with visible quick wins (signage, PPE), establish safety champions on each shift, and celebrate safety milestones.",
    sample_answer_fr:
      "Commencez par les données — montrez les coûts des accidents et l'impact sur la productivité. Obtenez l'adhésion de la direction avec un business case. Lancez avec des quick wins visibles (signalisation, EPI), établissez des champions sécurité par équipe et célébrez les jalons sécurité.",
    tips: ["Use data to persuade", "Start small with visible wins", "Engage all levels"],
    tips_fr: ["Utilisez les données pour convaincre", "Commencez petit avec des victoires visibles", "Engagez tous les niveaux"],
  },
  {
    id: "icq-sit-15",
    type: "situational",
    field: "general",
    difficulty: "advanced",
    question: "Your manager asks you to do something unethical. What do you do?",
    question_fr: "Votre manager vous demande de faire quelque chose de non éthique. Que faites-vous ?",
    sample_answer:
      "Politely but firmly refuse. Document the request. If there's an ethics hotline or compliance department, report it. If the company doesn't address it, consider escalating further. Your integrity is not negotiable.",
    sample_answer_fr:
      "Refusez poliment mais fermement. Documentez la demande. S'il existe une ligne éthique ou un département conformité, signalez-le. Si l'entreprise ne réagit pas, envisagez d'escalader davantage. Votre intégrité n'est pas négociable.",
    tips: ["Show strong ethics", "Know the reporting channels", "Be firm but professional"],
    tips_fr: ["Montrez une éthique forte", "Connaissez les canaux de signalement", "Soyez ferme mais professionnel"],
  },

  // COMPETENCY (15)
  {
    id: "icq-comp-01",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "Give an example of when you used data to make a decision.",
    question_fr: "Donnez un exemple où vous avez utilisé des données pour prendre une décision.",
    sample_answer:
      "For my IMTA thesis, I analyzed 6 months of production data to identify bottlenecks. Using statistical process control charts, I pinpointed a shift pattern causing 30% of defects and recommended a schedule change.",
    sample_answer_fr:
      "Pour mon mémoire à l'IMTA, j'ai analysé 6 mois de données de production pour identifier les goulots d'étranglement. En utilisant des cartes de contrôle statistique, j'ai identifié un schéma de relève causant 30% des défauts et recommandé un changement de planning.",
    tips: ["Show analytical skills", "Be specific about the data", "Quantify the impact"],
    tips_fr: ["Montrez vos compétences analytiques", "Soyez précis sur les données", "Quantifiez l'impact"],
  },
  {
    id: "icq-comp-02",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "Describe a time you improved a process.",
    question_fr: "Décrivez un moment où vous avez amélioré un processus.",
    sample_answer:
      "At my internship at a textile factory in Casablanca, I noticed the quality inspection was done at the end of the line. I proposed inline inspections at 3 checkpoints, reducing scrap rate from 8% to 2.5%.",
    sample_answer_fr:
      "Lors de mon stage dans une usine textile à Casablanca, j'ai remarqué que l'inspection qualité se faisait en fin de ligne. J'ai proposé des inspections en ligne à 3 points de contrôle, réduisant le taux de rebut de 8% à 2,5%.",
    tips: ["Describe the before state", "Explain your intervention", "Show measurable improvement"],
    tips_fr: ["Décrivez l'état initial", "Expliquez votre intervention", "Montrez une amélioration mesurable"],
  },
  {
    id: "icq-comp-03",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "How do you stay current with industry trends?",
    question_fr: "Comment restez-vous à jour avec les tendances de votre secteur ?",
    sample_answer:
      "I follow industry publications (L'Usine Nouvelle, TechCrunch), attend local meetups in Casablanca, take online courses on Coursera, and participate in LinkedIn groups focused on Moroccan industry and engineering.",
    sample_answer_fr:
      "Je suis des publications sectorielles (L'Usine Nouvelle, TechCrunch), j'assiste aux meetups locaux à Casablanca, je suis des cours en ligne sur Coursera et je participe à des groupes LinkedIn axés sur l'industrie et l'ingénierie au Maroc.",
    tips: ["Name specific sources", "Show continuous learning", "Mention local and international sources"],
    tips_fr: ["Nommez des sources spécifiques", "Montrez un apprentissage continu", "Mentionnez des sources locales et internationales"],
  },
  {
    id: "icq-comp-04",
    type: "competency",
    field: "general",
    difficulty: "beginner",
    question: "Tell me about a project you're most proud of.",
    question_fr: "Parlez-moi d'un projet dont vous êtes le plus fier.",
    sample_answer:
      "My end-of-studies project at IMTA: designing an energy management system for a food processing plant. Using IoT sensors and Python analytics, we achieved a projected 18% reduction in energy consumption.",
    sample_answer_fr:
      "Mon projet de fin d'études à l'IMTA : concevoir un système de gestion de l'énergie pour une usine agroalimentaire. En utilisant des capteurs IoT et l'analytique Python, nous avons atteint une réduction projetée de 18% de la consommation énergétique.",
    tips: ["Show passion", "Explain your specific role", "Highlight technical and soft skills used"],
    tips_fr: ["Montrez votre passion", "Expliquez votre rôle spécifique", "Soulignez les compétences techniques et humaines utilisées"],
  },
  {
    id: "icq-comp-05",
    type: "competency",
    field: "it",
    difficulty: "intermediate",
    question: "How do you ensure code quality?",
    question_fr: "Comment assurez-vous la qualité du code ?",
    sample_answer:
      "Through code reviews, automated testing (unit, integration, e2e), linting, CI/CD pipelines, and pair programming. I also write documentation and follow SOLID principles for maintainable architecture.",
    sample_answer_fr:
      "Par des revues de code, des tests automatisés (unitaires, intégration, e2e), du linting, des pipelines CI/CD et la programmation en binôme. J'écris aussi de la documentation et suis les principes SOLID pour une architecture maintenable.",
    tips: ["Name specific tools and practices", "Show systematic approach", "Mention testing strategies"],
    tips_fr: ["Nommez des outils et pratiques spécifiques", "Montrez une approche systématique", "Mentionnez les stratégies de test"],
  },
  {
    id: "icq-comp-06",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "How do you communicate complex ideas to non-technical stakeholders?",
    question_fr: "Comment communiquez-vous des idées complexes à des parties prenantes non techniques ?",
    sample_answer:
      "I use analogies, visual aids, and focus on outcomes rather than implementation details. For my IMTA thesis defense, I explained our IoT system to the jury by comparing it to a nervous system monitoring a body.",
    sample_answer_fr:
      "J'utilise des analogies, des supports visuels et me concentre sur les résultats plutôt que les détails techniques. Pour ma soutenance à l'IMTA, j'ai expliqué notre système IoT au jury en le comparant à un système nerveux surveillant un corps.",
    tips: ["Use analogies", "Focus on business value", "Adapt your vocabulary"],
    tips_fr: ["Utilisez des analogies", "Concentrez-vous sur la valeur métier", "Adaptez votre vocabulaire"],
  },
  {
    id: "icq-comp-07",
    type: "competency",
    field: "engineering",
    difficulty: "intermediate",
    question: "How do you approach quality control in manufacturing?",
    question_fr: "Quelle est votre approche du contrôle qualité en fabrication ?",
    sample_answer:
      "I use a combination of statistical process control (SPC), capability indices (Cp, Cpk), control charts, and regular audits. Prevention over detection: implementing poka-yoke and upstream quality checks.",
    sample_answer_fr:
      "J'utilise une combinaison de contrôle statistique des processus (SPC), indices de capabilité (Cp, Cpk), cartes de contrôle et audits réguliers. Prévention plutôt que détection : mise en place de poka-yoke et contrôles qualité en amont.",
    tips: ["Know SPC tools", "Mention Cp/Cpk indices", "Show prevention mindset"],
    tips_fr: ["Connaissez les outils SPC", "Mentionnez les indices Cp/Cpk", "Montrez une mentalité de prévention"],
  },
  {
    id: "icq-comp-08",
    type: "competency",
    field: "general",
    difficulty: "advanced",
    question: "Describe your project management methodology.",
    question_fr: "Décrivez votre méthodologie de gestion de projet.",
    sample_answer:
      "I adapt methodology to project type. For predictable projects: waterfall with Gantt charts. For uncertain projects: Agile Scrum with sprints. Always: stakeholder mapping, risk register, regular status updates, and retrospectives.",
    sample_answer_fr:
      "J'adapte la méthodologie au type de projet. Pour les projets prévisibles : cascade avec diagramme de Gantt. Pour les projets incertains : Agile Scrum avec sprints. Toujours : cartographie des parties prenantes, registre des risques, points d'avancement réguliers et rétrospectives.",
    tips: ["Show flexibility", "Name specific frameworks", "Mention tools you use"],
    tips_fr: ["Montrez votre flexibilité", "Nommez des cadres spécifiques", "Mentionnez les outils que vous utilisez"],
  },
  {
    id: "icq-comp-09",
    type: "competency",
    field: "it",
    difficulty: "advanced",
    question: "How do you handle technical debt?",
    question_fr: "Comment gérez-vous la dette technique ?",
    sample_answer:
      "I track technical debt in the backlog, categorize by impact and effort, and allocate 20% of each sprint to debt reduction. I communicate the business impact to stakeholders — slow features, more bugs, higher costs.",
    sample_answer_fr:
      "Je suis la dette technique dans le backlog, la catégorise par impact et effort, et alloue 20% de chaque sprint à la réduction de la dette. Je communique l'impact métier aux parties prenantes — fonctionnalités ralenties, plus de bugs, coûts plus élevés.",
    tips: ["Show systematic tracking", "Balance debt vs features", "Communicate business impact"],
    tips_fr: ["Montrez un suivi systématique", "Équilibrez dette vs fonctionnalités", "Communiquez l'impact métier"],
  },
  {
    id: "icq-comp-10",
    type: "competency",
    field: "hse",
    difficulty: "intermediate",
    question: "How do you conduct a workplace risk assessment?",
    question_fr: "Comment menez-vous une évaluation des risques sur un lieu de travail ?",
    sample_answer:
      "Follow five steps: 1) Identify hazards through site walks and worker interviews. 2) Determine who might be harmed. 3) Evaluate risks and decide precautions. 4) Record findings and implement. 5) Review and update regularly.",
    sample_answer_fr:
      "Suivez cinq étapes : 1) Identifier les dangers par des visites de site et entretiens avec les travailleurs. 2) Déterminer qui peut être affecté. 3) Évaluer les risques et décider des précautions. 4) Enregistrer les résultats et mettre en œuvre. 5) Réviser et mettre à jour régulièrement.",
    tips: ["Follow the 5-step process", "Involve workers in assessment", "Keep documentation current"],
    tips_fr: ["Suivez le processus en 5 étapes", "Impliquez les travailleurs", "Tenez la documentation à jour"],
  },
  {
    id: "icq-comp-11",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "How do you handle multiple stakeholders with conflicting priorities?",
    question_fr: "Comment gérez-vous plusieurs parties prenantes avec des priorités conflictuelles ?",
    sample_answer:
      "I map stakeholders by influence and interest, facilitate alignment meetings, use a prioritization matrix, and escalate to senior management when consensus isn't possible. Transparency about tradeoffs is key.",
    sample_answer_fr:
      "Je cartographie les parties prenantes par influence et intérêt, facilite des réunions d'alignement, utilise une matrice de priorisation et escalade au management senior quand le consensus n'est pas possible. La transparence sur les compromis est essentielle.",
    tips: ["Show stakeholder management skills", "Use structured prioritization", "Communicate tradeoffs"],
    tips_fr: ["Montrez vos compétences en gestion des parties prenantes", "Utilisez une priorisation structurée", "Communiquez les compromis"],
  },
  {
    id: "icq-comp-12",
    type: "competency",
    field: "healthcare",
    difficulty: "intermediate",
    question: "How do you ensure continuous quality improvement in healthcare?",
    question_fr: "Comment assurez-vous l'amélioration continue de la qualité en santé ?",
    sample_answer:
      "Through PDCA cycles, clinical audits, patient satisfaction surveys, morbidity-mortality conferences, and evidence-based practice implementation. Regular training and benchmarking against national and international standards.",
    sample_answer_fr:
      "Par des cycles PDCA, des audits cliniques, des enquêtes de satisfaction patients, des revues de morbi-mortalité et l'implémentation de pratiques basées sur les preuves. Formation régulière et benchmarking par rapport aux standards nationaux et internationaux.",
    tips: ["Know PDCA cycle", "Mention specific QI tools", "Reference evidence-based practice"],
    tips_fr: ["Connaissez le cycle PDCA", "Mentionnez des outils spécifiques de QI", "Référencez les pratiques basées sur les preuves"],
  },
  {
    id: "icq-comp-13",
    type: "competency",
    field: "finance",
    difficulty: "intermediate",
    question: "How do you manage financial risk?",
    question_fr: "Comment gérez-vous le risque financier ?",
    sample_answer:
      "Through diversification, hedging strategies, stress testing, VaR (Value at Risk) analysis, and maintaining adequate liquidity buffers. Regular monitoring of market conditions and regulatory changes in Morocco is essential.",
    sample_answer_fr:
      "Par la diversification, les stratégies de couverture, les stress tests, l'analyse VaR (Value at Risk) et le maintien de coussins de liquidité adéquats. Un suivi régulier des conditions de marché et des changements réglementaires au Maroc est essentiel.",
    tips: ["Name specific risk management tools", "Mention Moroccan regulations", "Show analytical approach"],
    tips_fr: ["Nommez des outils de gestion des risques", "Mentionnez les réglementations marocaines", "Montrez une approche analytique"],
  },
  {
    id: "icq-comp-14",
    type: "competency",
    field: "general",
    difficulty: "advanced",
    question: "How do you measure the success of a project?",
    question_fr: "Comment mesurez-vous le succès d'un projet ?",
    sample_answer:
      "Using the iron triangle (scope, time, cost) plus stakeholder satisfaction, team morale, and business value delivered. I define KPIs at project start and track them through dashboards and regular reviews.",
    sample_answer_fr:
      "En utilisant le triangle d'or (périmètre, délais, coûts) plus la satisfaction des parties prenantes, le moral de l'équipe et la valeur métier livrée. Je définis les KPI au démarrage du projet et les suis via des tableaux de bord et des revues régulières.",
    tips: ["Define KPIs early", "Balance quantitative and qualitative measures", "Include stakeholder feedback"],
    tips_fr: ["Définissez les KPI tôt", "Équilibrez mesures quantitatives et qualitatives", "Incluez le retour des parties prenantes"],
  },
  {
    id: "icq-comp-15",
    type: "competency",
    field: "general",
    difficulty: "intermediate",
    question: "How do you approach continuous learning?",
    question_fr: "Quelle est votre approche de l'apprentissage continu ?",
    sample_answer:
      "I dedicate 5 hours per week to learning: online courses, reading industry publications, and hands-on practice. I set quarterly learning goals aligned with my career development plan and track progress.",
    sample_answer_fr:
      "Je consacre 5 heures par semaine à l'apprentissage : cours en ligne, lecture de publications sectorielles et pratique. Je fixe des objectifs d'apprentissage trimestriels alignés sur mon plan de développement de carrière et je suis ma progression.",
    tips: ["Show structured learning approach", "Name specific resources", "Align learning with career goals"],
    tips_fr: ["Montrez une approche structurée", "Nommez des ressources spécifiques", "Alignez l'apprentissage sur vos objectifs de carrière"],
  },

  // MOTIVATION (10)
  {
    id: "icq-motiv-01",
    type: "motivation",
    field: "general",
    difficulty: "beginner",
    question: "Why do you want to work for our company?",
    question_fr: "Pourquoi voulez-vous travailler dans notre entreprise ?",
    sample_answer:
      "Your company's commitment to innovation in Morocco's industrial sector aligns with my engineering passion. The opportunity to work on [specific project/product] and contribute to Morocco's economic development excites me.",
    sample_answer_fr:
      "L'engagement de votre entreprise envers l'innovation dans le secteur industriel marocain correspond à ma passion pour l'ingénierie. L'opportunité de travailler sur [projet/produit spécifique] et de contribuer au développement économique du Maroc m'enthousiasme.",
    tips: ["Research the company thoroughly", "Be specific about what attracts you", "Connect to your personal values"],
    tips_fr: ["Faites des recherches approfondies sur l'entreprise", "Soyez précis sur ce qui vous attire", "Connectez à vos valeurs personnelles"],
  },
  {
    id: "icq-motiv-02",
    type: "motivation",
    field: "general",
    difficulty: "beginner",
    question: "Why did you choose this field?",
    question_fr: "Pourquoi avez-vous choisi ce domaine ?",
    sample_answer:
      "I've always been fascinated by how things are made. Visiting factories as a child sparked my curiosity about manufacturing processes. IMTA gave me the tools to turn that curiosity into professional expertise.",
    sample_answer_fr:
      "J'ai toujours été fasciné par la façon dont les choses sont fabriquées. Visiter des usines enfant a éveillé ma curiosité pour les processus de fabrication. L'IMTA m'a donné les outils pour transformer cette curiosité en expertise professionnelle.",
    tips: ["Tell a personal story", "Show genuine passion", "Connect to your education"],
    tips_fr: ["Racontez une histoire personnelle", "Montrez une passion sincère", "Connectez à votre formation"],
  },
  {
    id: "icq-motiv-03",
    type: "motivation",
    field: "general",
    difficulty: "intermediate",
    question: "What would you do if you didn't get this job?",
    question_fr: "Que feriez-vous si vous n'obteniez pas ce poste ?",
    sample_answer:
      "I'd take it as a learning opportunity, ask for feedback, and continue developing my skills. I'd also explore other opportunities in the Moroccan market while keeping your company on my radar for future openings.",
    sample_answer_fr:
      "Je le prendrais comme une opportunité d'apprentissage, demanderais un retour et continuerais à développer mes compétences. J'explorerais aussi d'autres opportunités sur le marché marocain tout en gardant votre entreprise en vue pour de futurs postes.",
    tips: ["Show resilience", "Express continued interest", "Demonstrate growth mindset"],
    tips_fr: ["Montrez votre résilience", "Exprimez un intérêt continu", "Démontrez un état d'esprit de croissance"],
  },
  {
    id: "icq-motiv-04",
    type: "motivation",
    field: "general",
    difficulty: "beginner",
    question: "What do you know about our company?",
    question_fr: "Que savez-vous de notre entreprise ?",
    sample_answer:
      "I've researched your company extensively. Founded in [year], you've grown to become a leader in [sector] in Morocco. Your recent [project/expansion/initiative] particularly impressed me, and your commitment to [value] resonates with my own principles.",
    sample_answer_fr:
      "J'ai fait des recherches approfondies sur votre entreprise. Fondée en [année], vous êtes devenu un leader dans [secteur] au Maroc. Votre récent [projet/expansion/initiative] m'a particulièrement impressionné, et votre engagement envers [valeur] résonne avec mes propres principes.",
    tips: ["Show you did your homework", "Mention recent news/achievements", "Connect to your values"],
    tips_fr: ["Montrez que vous avez fait vos recherches", "Mentionnez des actualités/réalisations récentes", "Connectez à vos valeurs"],
  },
  {
    id: "icq-motiv-05",
    type: "motivation",
    field: "it",
    difficulty: "intermediate",
    question: "What emerging technology excites you most?",
    question_fr: "Quelle technologie émergente vous excite le plus ?",
    sample_answer:
      "Artificial intelligence and its applications in the Moroccan context — from smart agriculture with MASEN's solar data to predictive maintenance in OCP's mines. Morocco has unique opportunities to leapfrog with AI.",
    sample_answer_fr:
      "L'intelligence artificielle et ses applications dans le contexte marocain — de l'agriculture intelligente avec les données solaires de MASEN à la maintenance prédictive dans les mines de l'OCP. Le Maroc a des opportunités uniques pour accélérer avec l'IA.",
    tips: ["Be specific about the technology", "Connect to Morocco's context", "Show practical thinking"],
    tips_fr: ["Soyez précis sur la technologie", "Connectez au contexte marocain", "Montrez une réflexion pratique"],
  },
  {
    id: "icq-motiv-06",
    type: "motivation",
    field: "general",
    difficulty: "intermediate",
    question: "What would your ideal work environment look like?",
    question_fr: "À quoi ressemblerait votre environnement de travail idéal ?",
    sample_answer:
      "A collaborative environment that values innovation, provides continuous learning opportunities, and maintains a healthy work-life balance. I thrive in teams where open communication and mutual respect are the norm.",
    sample_answer_fr:
      "Un environnement collaboratif qui valorise l'innovation, offre des opportunités d'apprentissage continu et maintient un bon équilibre vie professionnelle-vie personnelle. Je m'épanouis dans les équipes où la communication ouverte et le respect mutuel sont la norme.",
    tips: ["Align with company culture", "Be genuine", "Show you're adaptable"],
    tips_fr: ["Alignez-vous avec la culture de l'entreprise", "Soyez authentique", "Montrez votre adaptabilité"],
  },
  {
    id: "icq-motiv-07",
    type: "motivation",
    field: "general",
    difficulty: "beginner",
    question: "What are your long-term career goals?",
    question_fr: "Quels sont vos objectifs de carrière à long terme ?",
    sample_answer:
      "In 5-10 years, I aim to become a technical expert or team leader in my field, contributing to Morocco's industrial development. I also want to mentor junior engineers and eventually pursue an executive MBA.",
    sample_answer_fr:
      "Dans 5 à 10 ans, je vise à devenir expert technique ou chef d'équipe dans mon domaine, contribuant au développement industriel du Maroc. Je veux aussi encadrer de jeunes ingénieurs et éventuellement poursuivre un MBA exécutif.",
    tips: ["Show ambition aligned with the company", "Be realistic", "Include giving back"],
    tips_fr: ["Montrez une ambition alignée avec l'entreprise", "Soyez réaliste", "Incluez le mentorat"],
  },
  {
    id: "icq-motiv-08",
    type: "motivation",
    field: "general",
    difficulty: "intermediate",
    question: "How do you define success?",
    question_fr: "Comment définissez-vous le succès ?",
    sample_answer:
      "Success for me is continuous growth — professionally and personally. It's about making a tangible impact, being respected by peers, and maintaining integrity. Success isn't just a title or salary; it's about meaningful contribution.",
    sample_answer_fr:
      "Le succès pour moi est une croissance continue — professionnellement et personnellement. C'est faire un impact tangible, être respecté par ses pairs et maintenir son intégrité. Le succès n'est pas qu'un titre ou un salaire ; c'est la contribution significative.",
    tips: ["Be authentic", "Balance professional and personal", "Show maturity"],
    tips_fr: ["Soyez authentique", "Équilibrez professionnel et personnel", "Montrez votre maturité"],
  },
  {
    id: "icq-motiv-09",
    type: "motivation",
    field: "general",
    difficulty: "intermediate",
    question: "What would you bring to our team?",
    question_fr: "Qu'apporteriez-vous à notre équipe ?",
    sample_answer:
      "I bring IMTA's rigorous technical training, bilingual communication skills, a data-driven mindset, and the energy of a young professional eager to prove themselves. I also bring fresh perspectives from my diverse project experience.",
    sample_answer_fr:
      "J'apporte la formation technique rigoureuse de l'IMTA, des compétences de communication bilingues, un esprit orienté données et l'énergie d'un jeune professionnel désireux de faire ses preuves. J'apporte aussi des perspectives nouvelles de mes diverses expériences de projets.",
    tips: ["Be specific about your value", "Connect to team needs", "Show enthusiasm"],
    tips_fr: ["Soyez précis sur votre valeur ajoutée", "Connectez aux besoins de l'équipe", "Montrez de l'enthousiasme"],
  },
  {
    id: "icq-motiv-10",
    type: "motivation",
    field: "general",
    difficulty: "advanced",
    question: "Do you have any questions for us?",
    question_fr: "Avez-vous des questions pour nous ?",
    sample_answer:
      "Yes! What does the typical career progression look like for this role? What are the biggest challenges the team is currently facing? How does the company support professional development and certifications?",
    sample_answer_fr:
      "Oui ! À quoi ressemble la progression de carrière typique pour ce poste ? Quels sont les plus grands défis auxquels l'équipe est confrontée actuellement ? Comment l'entreprise soutient-elle le développement professionnel et les certifications ?",
    tips: ["Always have 2-3 questions prepared", "Ask about growth and challenges", "Never say 'no'"],
    tips_fr: ["Ayez toujours 2-3 questions préparées", "Posez des questions sur la croissance et les défis", "Ne dites jamais 'non'"],
  },
];

// ─────────────────────────────────────────────────────────────────
// 3. CAREER MARKET INSIGHTS (30+)
// ─────────────────────────────────────────────────────────────────
const marketInsights = [
  // Salary insights by sector
  { title: "IT Average Salary 2026", title_fr: "Salaire moyen IT 2026", value: "14 500 MAD/mois", icon: "MonitorIcon", color: "text-blue-500", field: "it", description: "Average monthly salary for IT professionals in Morocco", description_fr: "Salaire mensuel moyen des professionnels IT au Maroc" },
  { title: "Engineering Salary Range", title_fr: "Fourchette salariale Ingénierie", value: "9 000 - 18 000 MAD", icon: "WrenchIcon", color: "text-orange-500", field: "engineering", description: "Monthly salary range for engineers in Morocco", description_fr: "Fourchette salariale mensuelle des ingénieurs au Maroc" },
  { title: "Healthcare Entry Salary", title_fr: "Salaire d'entrée Santé", value: "7 500 MAD/mois", icon: "HeartPulseIcon", color: "text-red-500", field: "healthcare", description: "Entry-level healthcare professional salary", description_fr: "Salaire d'entrée des professionnels de santé" },
  { title: "Finance Sector Salary", title_fr: "Salaire secteur Finance", value: "11 000 - 16 000 MAD", icon: "BanknoteIcon", color: "text-green-500", field: "finance", description: "Monthly salary range in Moroccan banking and finance", description_fr: "Fourchette salariale mensuelle dans la banque et la finance au Maroc" },
  { title: "HSE Specialist Salary", title_fr: "Salaire spécialiste HSE", value: "10 000 - 15 000 MAD", icon: "ShieldCheckIcon", color: "text-yellow-500", field: "hse", description: "Monthly salary for HSE specialists in Morocco", description_fr: "Salaire mensuel des spécialistes HSE au Maroc" },

  // Employment rates
  { title: "IT Employment Rate", title_fr: "Taux d'emploi IT", value: "92%", icon: "TrendingUpIcon", color: "text-blue-600", field: "it", description: "Percentage of IT graduates employed within 6 months", description_fr: "Pourcentage de diplômés IT employés dans les 6 mois" },
  { title: "Engineering Placement", title_fr: "Insertion Ingénierie", value: "87%", icon: "FactoryIcon", color: "text-orange-600", field: "engineering", description: "Engineering graduate employment rate within 1 year", description_fr: "Taux d'emploi des diplômés ingénieurs dans l'année" },
  { title: "IMTA Graduate Rate", title_fr: "Taux d'insertion IMTA", value: "89%", icon: "GraduationCapIcon", color: "text-emerald-500", field: "general", description: "IMTA graduates employed within 6 months of graduation", description_fr: "Diplômés IMTA employés dans les 6 mois après l'obtention du diplôme" },
  { title: "Youth Unemployment", title_fr: "Chômage des jeunes", value: "32.7%", icon: "AlertTriangleIcon", color: "text-red-600", field: "general", description: "Morocco youth unemployment rate (15-24 years) in 2025", description_fr: "Taux de chômage des jeunes au Maroc (15-24 ans) en 2025" },
  { title: "National Unemployment", title_fr: "Chômage national", value: "13.1%", icon: "UsersIcon", color: "text-gray-500", field: "general", description: "Morocco overall unemployment rate in 2025", description_fr: "Taux de chômage global au Maroc en 2025" },

  // Growing industries
  { title: "Automotive Industry Growth", title_fr: "Croissance automobile", value: "+12% /an", icon: "CarIcon", color: "text-blue-400", field: "industrial", description: "Annual growth of Morocco's automotive sector", description_fr: "Croissance annuelle du secteur automobile au Maroc" },
  { title: "Renewable Energy Jobs", title_fr: "Emplois énergies renouvelables", value: "25 000+", icon: "SunIcon", color: "text-yellow-400", field: "engineering", description: "Green energy positions available by 2026 (MASEN projection)", description_fr: "Postes en énergie verte disponibles d'ici 2026 (projection MASEN)" },
  { title: "IT Sector Growth", title_fr: "Croissance secteur IT", value: "+18% /an", icon: "CodeIcon", color: "text-purple-500", field: "it", description: "Annual growth of Morocco's IT and offshoring sector", description_fr: "Croissance annuelle du secteur IT et offshoring au Maroc" },
  { title: "Aerospace Expansion", title_fr: "Expansion aérospatiale", value: "140+ entreprises", icon: "PlaneIcon", color: "text-sky-500", field: "engineering", description: "Aerospace companies operating in Morocco (GIMAS)", description_fr: "Entreprises aérospatiales opérant au Maroc (GIMAS)" },
  { title: "Digital Morocco 2030", title_fr: "Maroc Digital 2030", value: "100 000 emplois", icon: "GlobeIcon", color: "text-indigo-500", field: "it", description: "Target IT jobs creation under Morocco's digital strategy", description_fr: "Objectif de création d'emplois IT dans le cadre de la stratégie digitale du Maroc" },

  // Remote work
  { title: "Remote Work Adoption", title_fr: "Adoption du télétravail", value: "34%", icon: "HomeIcon", color: "text-teal-500", field: "it", description: "IT companies offering remote/hybrid work in Morocco", description_fr: "Entreprises IT offrant le télétravail/hybride au Maroc" },
  { title: "Freelance Tech Growth", title_fr: "Croissance freelance tech", value: "+45%", icon: "LaptopIcon", color: "text-violet-500", field: "it", description: "Year-over-year growth in Moroccan tech freelancing", description_fr: "Croissance annuelle du freelance tech au Maroc" },

  // Specific sectors
  { title: "Phosphates Revenue", title_fr: "Revenus phosphates", value: "115 Mds MAD", icon: "MountainIcon", color: "text-amber-600", field: "industrial", description: "OCP Group annual revenue (2025)", description_fr: "Chiffre d'affaires annuel du groupe OCP (2025)" },
  { title: "Banking Sector Jobs", title_fr: "Emplois secteur bancaire", value: "48 000+", icon: "BuildingIcon", color: "text-green-600", field: "finance", description: "Total banking sector employees in Morocco", description_fr: "Total des employés du secteur bancaire au Maroc" },
  { title: "Healthcare Workers", title_fr: "Professionnels de santé", value: "67 000", icon: "StethoscopeIcon", color: "text-red-400", field: "healthcare", description: "Total healthcare professionals in Morocco (doctors + nurses)", description_fr: "Total des professionnels de santé au Maroc (médecins + infirmiers)" },
  { title: "Construction Boom", title_fr: "Boom construction", value: "+8% /an", icon: "HardHatIcon", color: "text-orange-400", field: "engineering", description: "Construction sector growth driven by World Cup 2030 preparation", description_fr: "Croissance du secteur de la construction portée par la préparation de la Coupe du Monde 2030" },

  // Regional data
  { title: "Casablanca Tech Hub", title_fr: "Pôle tech Casablanca", value: "60%", icon: "BuildingIcon", color: "text-blue-700", field: "it", description: "Share of Morocco's IT jobs concentrated in Casablanca", description_fr: "Part des emplois IT du Maroc concentrés à Casablanca" },
  { title: "Tangier Industrial Zone", title_fr: "Zone industrielle Tanger", value: "800+ entreprises", icon: "FactoryIcon", color: "text-orange-700", field: "industrial", description: "Companies in Tanger Free Zone and Tanger Med", description_fr: "Entreprises dans la Zone Franche de Tanger et Tanger Med" },
  { title: "Kenitra Auto City", title_fr: "Kenitra Auto City", value: "50 000 emplois", icon: "CarIcon", color: "text-blue-300", field: "industrial", description: "Jobs in Kenitra's Atlantic Free Zone automotive cluster", description_fr: "Emplois dans le pôle automobile de la Zone Franche Atlantique de Kenitra" },
  { title: "Rabat Admin Hub", title_fr: "Pôle administratif Rabat", value: "35%", icon: "LandmarkIcon", color: "text-emerald-600", field: "general", description: "Share of public sector jobs in Rabat-Salé region", description_fr: "Part des emplois du secteur public dans la région Rabat-Salé" },

  // Skills demand
  { title: "Cloud Skills Premium", title_fr: "Prime compétences Cloud", value: "+25% salaire", icon: "CloudIcon", color: "text-cyan-500", field: "it", description: "Salary premium for cloud-certified professionals in Morocco", description_fr: "Prime salariale pour les professionnels certifiés cloud au Maroc" },
  { title: "AI/ML Demand Surge", title_fr: "Forte demande IA/ML", value: "+65% offres", icon: "BrainIcon", color: "text-pink-500", field: "it", description: "Year-over-year increase in AI/ML job postings in Morocco", description_fr: "Augmentation annuelle des offres d'emploi IA/ML au Maroc" },
  { title: "French Fluency Premium", title_fr: "Prime maîtrise français", value: "+15% salaire", icon: "LanguagesIcon", color: "text-indigo-400", field: "general", description: "Salary premium for excellent French communication skills", description_fr: "Prime salariale pour une excellente maîtrise de la communication en français" },
  { title: "English Demand Growth", title_fr: "Croissance demande anglais", value: "+40%", icon: "BookOpenIcon", color: "text-rose-500", field: "general", description: "Increase in job postings requiring English in Morocco", description_fr: "Augmentation des offres d'emploi exigeant l'anglais au Maroc" },
  { title: "Data Science Roles", title_fr: "Postes Data Science", value: "3 500+", icon: "DatabaseIcon", color: "text-purple-600", field: "it", description: "Open data science positions across Morocco", description_fr: "Postes ouverts en data science au Maroc" },
  { title: "World Cup 2030 Impact", title_fr: "Impact Coupe du Monde 2030", value: "150 000 emplois", icon: "TrophyIcon", color: "text-amber-500", field: "general", description: "Estimated jobs created for FIFA World Cup 2030 preparation", description_fr: "Emplois estimés créés pour la préparation de la Coupe du Monde FIFA 2030" },
];

// ─────────────────────────────────────────────────────────────────
// 4. CAREER EMPLOYERS (40+)
// ─────────────────────────────────────────────────────────────────
const employers = [
  // Mining & Heavy Industry
  { name: "OCP Group", sector: "Mining & Phosphates", sector_fr: "Mines & Phosphates", location: "Casablanca, Khouribga, Safi, Jorf Lasfar", location_fr: "Casablanca, Khouribga, Safi, Jorf Lasfar", open_positions: 450, website: "https://www.ocpgroup.ma", description: "World leader in phosphate and derivatives production and export", description_fr: "Leader mondial de la production et de l'exportation de phosphates et dérivés", fields: ["industrial", "hse", "engineering"] },
  { name: "Managem Group", sector: "Mining", sector_fr: "Mines", location: "Casablanca, Marrakech, Ouarzazate", location_fr: "Casablanca, Marrakech, Ouarzazate", open_positions: 120, website: "https://www.managemgroup.com", description: "Moroccan mining company specializing in cobalt, gold, silver and copper", description_fr: "Société minière marocaine spécialisée dans le cobalt, l'or, l'argent et le cuivre", fields: ["industrial", "hse", "engineering"] },

  // Transport & Logistics
  { name: "ONCF", sector: "Transport & Rail", sector_fr: "Transport & Ferroviaire", location: "Rabat, Casablanca, Tanger", location_fr: "Rabat, Casablanca, Tanger", open_positions: 200, website: "https://www.oncf.ma", description: "National railway operator managing Morocco's rail network including Al Boraq high-speed", description_fr: "Opérateur ferroviaire national gérant le réseau ferré du Maroc, y compris le TGV Al Boraq", fields: ["engineering", "hse", "it"] },
  { name: "Marsa Maroc", sector: "Port Operations", sector_fr: "Exploitation portuaire", location: "Casablanca, Tanger Med, Agadir", location_fr: "Casablanca, Tanger Med, Agadir", open_positions: 80, website: "https://www.marsamaroc.co.ma", description: "Morocco's leading port management and stevedoring company", description_fr: "Premier opérateur portuaire et de manutention au Maroc", fields: ["industrial", "hse", "engineering"] },
  { name: "Royal Air Maroc", sector: "Aviation", sector_fr: "Aviation", location: "Casablanca, Nouaceur", location_fr: "Casablanca, Nouaceur", open_positions: 150, website: "https://www.royalairmaroc.com", description: "Morocco's national airline carrier and member of oneworld alliance", description_fr: "Compagnie aérienne nationale du Maroc et membre de l'alliance oneworld", fields: ["engineering", "it", "hse"] },
  { name: "Tanger Med", sector: "Logistics & Port", sector_fr: "Logistique & Portuaire", location: "Tanger", location_fr: "Tanger", open_positions: 300, website: "https://www.tangermed.ma", description: "Africa's largest port complex and major logistics hub", description_fr: "Plus grand complexe portuaire d'Afrique et hub logistique majeur", fields: ["industrial", "engineering", "hse"] },

  // IT & Offshoring
  { name: "Capgemini Morocco", sector: "IT Consulting", sector_fr: "Conseil IT", location: "Casablanca, Rabat", location_fr: "Casablanca, Rabat", open_positions: 350, website: "https://www.capgemini.com/ma-fr", description: "Global technology and consulting services leader with major Moroccan operations", description_fr: "Leader mondial des services technologiques et de conseil avec des opérations majeures au Maroc", fields: ["it"] },
  { name: "CGI Morocco", sector: "IT Services", sector_fr: "Services IT", location: "Casablanca, Rabat", location_fr: "Casablanca, Rabat", open_positions: 200, website: "https://www.cgi.com/maroc", description: "Canadian IT consulting firm with growing Moroccan delivery center", description_fr: "Société canadienne de conseil IT avec un centre de livraison marocain en croissance", fields: ["it"] },
  { name: "Atos Morocco", sector: "IT Services", sector_fr: "Services IT", location: "Casablanca", location_fr: "Casablanca", open_positions: 120, website: "https://atos.net/fr-ma", description: "European digital transformation leader with Moroccan operations", description_fr: "Leader européen de la transformation digitale avec des opérations au Maroc", fields: ["it"] },
  { name: "Sofrecom Morocco", sector: "Telecom IT", sector_fr: "IT Télécom", location: "Rabat", location_fr: "Rabat", open_positions: 150, website: "https://www.sofrecom.com", description: "Orange Group subsidiary specializing in telecom consulting and IT services", description_fr: "Filiale du groupe Orange spécialisée dans le conseil télécom et les services IT", fields: ["it"] },
  { name: "Intelcia", sector: "BPO & Technology", sector_fr: "BPO & Technologie", location: "Casablanca, Rabat, Fès", location_fr: "Casablanca, Rabat, Fès", open_positions: 500, website: "https://www.intelcia.com", description: "Moroccan-born global BPO and technology company serving 50+ countries", description_fr: "Entreprise marocaine de BPO et technologie présente dans plus de 50 pays", fields: ["it"] },
  { name: "SQLI Morocco", sector: "Digital Agency", sector_fr: "Agence digitale", location: "Casablanca, Rabat, Oujda", location_fr: "Casablanca, Rabat, Oujda", open_positions: 100, website: "https://www.sqli.com", description: "European digital experience agency with nearshore delivery in Morocco", description_fr: "Agence d'expérience digitale européenne avec livraison nearshore au Maroc", fields: ["it"] },
  { name: "Sopra HR Software Morocco", sector: "HR Tech", sector_fr: "HR Tech", location: "Casablanca", location_fr: "Casablanca", open_positions: 80, website: "https://www.soprahr.com", description: "European HR software leader with development center in Morocco", description_fr: "Leader européen du logiciel RH avec un centre de développement au Maroc", fields: ["it"] },
  { name: "S2M (Société Maghrébine de Monétique)", sector: "Fintech", sector_fr: "Fintech", location: "Casablanca", location_fr: "Casablanca", open_positions: 60, website: "https://www.s2m.ma", description: "Leading Moroccan electronic payment solutions provider", description_fr: "Premier fournisseur marocain de solutions de paiement électronique", fields: ["it", "finance"] },

  // Automotive
  { name: "Renault Group Tanger", sector: "Automotive", sector_fr: "Automobile", location: "Tanger", location_fr: "Tanger", open_positions: 250, website: "https://www.renaultgroup.com", description: "Major automotive assembly plant producing Dacia models for export", description_fr: "Usine majeure d'assemblage automobile produisant des modèles Dacia pour l'export", fields: ["industrial", "engineering", "hse"] },
  { name: "Stellantis Kenitra", sector: "Automotive", sector_fr: "Automobile", location: "Kenitra", location_fr: "Kenitra", open_positions: 180, website: "https://www.stellantis.com", description: "Peugeot-Citroën assembly plant in Atlantic Free Zone producing Peugeot 208", description_fr: "Usine d'assemblage Peugeot-Citroën dans la Zone Franche Atlantique produisant la Peugeot 208", fields: ["industrial", "engineering", "hse"] },
  { name: "Safran Morocco", sector: "Aerospace", sector_fr: "Aérospatiale", location: "Casablanca, Nouaceur", location_fr: "Casablanca, Nouaceur", open_positions: 100, website: "https://www.safran-group.com", description: "French aerospace group with wiring and engine component production in Morocco", description_fr: "Groupe aérospatial français avec production de câblage et composants moteurs au Maroc", fields: ["engineering", "industrial"] },
  { name: "Yazaki Morocco", sector: "Auto Parts", sector_fr: "Équipementier auto", location: "Tanger, Kenitra, Meknès", location_fr: "Tanger, Kenitra, Meknès", open_positions: 400, website: "https://www.yazaki.com", description: "World's largest producer of automotive wiring harnesses with multiple Moroccan plants", description_fr: "Plus grand producteur mondial de faisceaux de câblage automobile avec plusieurs usines au Maroc", fields: ["industrial", "engineering"] },
  { name: "LEAR Corporation Morocco", sector: "Auto Parts", sector_fr: "Équipementier auto", location: "Tanger, Kenitra", location_fr: "Tanger, Kenitra", open_positions: 150, website: "https://www.lear.com", description: "American automotive seating and electrical systems manufacturer", description_fr: "Fabricant américain de sièges automobiles et systèmes électriques", fields: ["industrial", "engineering"] },

  // Banking & Finance
  { name: "Attijariwafa Bank", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", open_positions: 200, website: "https://www.attijariwafabank.com", description: "Morocco's largest bank and leading financial institution in Africa", description_fr: "Plus grande banque du Maroc et institution financière leader en Afrique", fields: ["finance", "it"] },
  { name: "BMCE Bank of Africa", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", open_positions: 150, website: "https://www.bankofafrica.ma", description: "Pan-African banking group present in 20+ African countries", description_fr: "Groupe bancaire panafricain présent dans plus de 20 pays africains", fields: ["finance", "it"] },
  { name: "Banque Populaire", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", open_positions: 180, website: "https://www.gbp.ma", description: "Morocco's largest retail banking network with cooperative structure", description_fr: "Plus grand réseau de banque de détail du Maroc avec structure coopérative", fields: ["finance", "it"] },
  { name: "CIH Bank", sector: "Banking", sector_fr: "Banque", location: "Casablanca", location_fr: "Casablanca", open_positions: 90, website: "https://www.cihbank.ma", description: "Innovative Moroccan bank leading in digital banking solutions", description_fr: "Banque marocaine innovante, leader en solutions de banque digitale", fields: ["finance", "it"] },

  // Healthcare
  { name: "CHU Ibn Sina Rabat", sector: "Healthcare", sector_fr: "Santé", location: "Rabat", location_fr: "Rabat", open_positions: 120, website: "https://www.chis.ma", description: "Morocco's largest university hospital complex and medical training center", description_fr: "Plus grand complexe hospitalier universitaire du Maroc et centre de formation médicale", fields: ["healthcare"] },
  { name: "CHU Mohammed VI Marrakech", sector: "Healthcare", sector_fr: "Santé", location: "Marrakech", location_fr: "Marrakech", open_positions: 80, website: "https://www.chumarrakech.ma", description: "Major university hospital serving southern Morocco", description_fr: "Grand hôpital universitaire desservant le sud du Maroc", fields: ["healthcare"] },
  { name: "Clinique Cheikh Zaïd", sector: "Private Healthcare", sector_fr: "Santé privée", location: "Rabat", location_fr: "Rabat", open_positions: 40, website: "https://www.fcsz.ma", description: "Premium private hospital with international standards of care", description_fr: "Hôpital privé premium avec des standards de soins internationaux", fields: ["healthcare"] },
  { name: "Akdital Group", sector: "Private Healthcare", sector_fr: "Santé privée", location: "Casablanca, Agadir, El Jadida", location_fr: "Casablanca, Agadir, El Jadida", open_positions: 200, website: "https://www.akdital.ma", description: "Largest private hospital group in Morocco with rapid expansion", description_fr: "Plus grand groupe hospitalier privé au Maroc en expansion rapide", fields: ["healthcare"] },

  // Energy & Utilities
  { name: "ONEE", sector: "Energy & Water", sector_fr: "Énergie & Eau", location: "Rabat, Multiple cities", location_fr: "Rabat, Plusieurs villes", open_positions: 200, website: "https://www.one.org.ma", description: "National electricity and water utility serving all of Morocco", description_fr: "Service public national d'électricité et d'eau desservant tout le Maroc", fields: ["engineering", "hse"] },
  { name: "MASEN", sector: "Renewable Energy", sector_fr: "Énergies renouvelables", location: "Rabat, Ouarzazate, Midelt", location_fr: "Rabat, Ouarzazate, Midelt", open_positions: 80, website: "https://www.masen.ma", description: "Moroccan Agency for Sustainable Energy managing Noor solar complex", description_fr: "Agence Marocaine pour l'Énergie Durable gérant le complexe solaire Noor", fields: ["engineering", "hse"] },
  { name: "Lydec", sector: "Utilities", sector_fr: "Services publics", location: "Casablanca", location_fr: "Casablanca", open_positions: 60, website: "https://www.lydec.ma", description: "Water, electricity and sanitation services for Greater Casablanca", description_fr: "Services d'eau, d'électricité et d'assainissement pour le Grand Casablanca", fields: ["engineering", "hse"] },
  { name: "Nareva Holding", sector: "Wind Energy", sector_fr: "Énergie éolienne", location: "Casablanca, Essaouira", location_fr: "Casablanca, Essaouira", open_positions: 40, website: "https://www.nareva.ma", description: "Leading Moroccan independent power producer focused on wind energy", description_fr: "Premier producteur indépendant d'énergie marocain axé sur l'énergie éolienne", fields: ["engineering", "hse"] },

  // Telecom
  { name: "Maroc Telecom (IAM)", sector: "Telecommunications", sector_fr: "Télécommunications", location: "Rabat", location_fr: "Rabat", open_positions: 120, website: "https://www.iam.ma", description: "Morocco's largest telecom operator with 70+ million subscribers across Africa", description_fr: "Plus grand opérateur télécom du Maroc avec plus de 70 millions d'abonnés en Afrique", fields: ["it", "engineering"] },
  { name: "Orange Morocco", sector: "Telecommunications", sector_fr: "Télécommunications", location: "Casablanca, Rabat", location_fr: "Casablanca, Rabat", open_positions: 80, website: "https://www.orange.ma", description: "Second-largest telecom operator driving digital innovation in Morocco", description_fr: "Deuxième opérateur télécom moteur de l'innovation digitale au Maroc", fields: ["it", "engineering"] },

  // Industrial & Manufacturing
  { name: "LafargeHolcim Maroc", sector: "Construction Materials", sector_fr: "Matériaux de construction", location: "Casablanca, Meknès, Settat", location_fr: "Casablanca, Meknès, Settat", open_positions: 90, website: "https://www.lafargeholcim.ma", description: "Leading cement and building materials producer in Morocco", description_fr: "Premier producteur de ciment et matériaux de construction au Maroc", fields: ["industrial", "hse", "engineering"] },
  { name: "Groupe Addoha", sector: "Real Estate", sector_fr: "Immobilier", location: "Casablanca", location_fr: "Casablanca", open_positions: 70, website: "https://www.groupeaddoha.com", description: "Morocco's largest real estate developer building social and luxury housing", description_fr: "Plus grand promoteur immobilier du Maroc construisant des logements sociaux et de luxe", fields: ["engineering", "industrial"] },
  { name: "Cosumar", sector: "Agribusiness", sector_fr: "Agroalimentaire", location: "Casablanca, Kenitra, Béni Mellal", location_fr: "Casablanca, Kenitra, Béni Mellal", open_positions: 60, website: "https://www.cosumar.co.ma", description: "Morocco's sole sugar producer and agribusiness leader", description_fr: "Seul producteur de sucre du Maroc et leader agroalimentaire", fields: ["industrial", "engineering", "hse"] },
  { name: "Lesieur Cristal", sector: "Food Industry", sector_fr: "Industrie alimentaire", location: "Casablanca, Meknès", location_fr: "Casablanca, Meknès", open_positions: 45, website: "https://www.lesieucristal.ma", description: "Leading Moroccan edible oils and food products company", description_fr: "Leader marocain des huiles alimentaires et produits alimentaires", fields: ["industrial", "hse"] },

  // Consulting & Services
  { name: "Deloitte Morocco", sector: "Consulting", sector_fr: "Conseil", location: "Casablanca", location_fr: "Casablanca", open_positions: 100, website: "https://www2.deloitte.com/ma", description: "Big Four professional services firm with audit, tax, and consulting", description_fr: "Cabinet Big Four de services professionnels avec audit, fiscalité et conseil", fields: ["finance", "it"] },
  { name: "PwC Morocco", sector: "Consulting", sector_fr: "Conseil", location: "Casablanca", location_fr: "Casablanca", open_positions: 80, website: "https://www.pwc.com/m1/en/countries/morocco.html", description: "Global professional services network with growing Moroccan practice", description_fr: "Réseau mondial de services professionnels avec une pratique marocaine en croissance", fields: ["finance", "it"] },
];

// ─────────────────────────────────────────────────────────────────
// 5. SKILL LIBRARY (100+)
// ─────────────────────────────────────────────────────────────────
const skills = [
  // IT (30)
  { name: "React", name_fr: "React", category: "technical", field: "it", description: "Modern JavaScript library for building user interfaces", description_fr: "Bibliothèque JavaScript moderne pour la construction d'interfaces utilisateur" },
  { name: "Angular", name_fr: "Angular", category: "technical", field: "it", description: "TypeScript-based web application framework by Google", description_fr: "Framework d'applications web basé sur TypeScript par Google" },
  { name: "Node.js", name_fr: "Node.js", category: "technical", field: "it", description: "JavaScript runtime for server-side development", description_fr: "Runtime JavaScript pour le développement côté serveur" },
  { name: "Python", name_fr: "Python", category: "technical", field: "it", description: "Versatile programming language for data science, AI, and automation", description_fr: "Langage de programmation polyvalent pour la data science, l'IA et l'automatisation" },
  { name: "Java", name_fr: "Java", category: "technical", field: "it", description: "Enterprise programming language for robust backend systems", description_fr: "Langage de programmation entreprise pour des systèmes backend robustes" },
  { name: "TypeScript", name_fr: "TypeScript", category: "technical", field: "it", description: "Typed superset of JavaScript for large-scale applications", description_fr: "Sur-ensemble typé de JavaScript pour les applications à grande échelle" },
  { name: "AWS Cloud", name_fr: "AWS Cloud", category: "technical", field: "it", description: "Amazon Web Services cloud computing platform", description_fr: "Plateforme de cloud computing Amazon Web Services" },
  { name: "Microsoft Azure", name_fr: "Microsoft Azure", category: "technical", field: "it", description: "Microsoft's cloud computing platform and services", description_fr: "Plateforme et services de cloud computing Microsoft" },
  { name: "Docker", name_fr: "Docker", category: "technical", field: "it", description: "Container platform for building and deploying applications", description_fr: "Plateforme de conteneurs pour construire et déployer des applications" },
  { name: "Kubernetes", name_fr: "Kubernetes", category: "technical", field: "it", description: "Container orchestration platform for managing microservices", description_fr: "Plateforme d'orchestration de conteneurs pour gérer les microservices" },
  { name: "DevOps", name_fr: "DevOps", category: "technical", field: "it", description: "Practices combining software development and IT operations", description_fr: "Pratiques combinant développement logiciel et opérations IT" },
  { name: "Cybersecurity", name_fr: "Cybersécurité", category: "technical", field: "it", description: "Protection of systems, networks, and programs from digital attacks", description_fr: "Protection des systèmes, réseaux et programmes contre les attaques numériques" },
  { name: "Data Science", name_fr: "Data Science", category: "technical", field: "it", description: "Extracting insights from structured and unstructured data", description_fr: "Extraction d'insights à partir de données structurées et non structurées" },
  { name: "Machine Learning", name_fr: "Machine Learning", category: "technical", field: "it", description: "Building systems that learn from data and improve over time", description_fr: "Construction de systèmes qui apprennent des données et s'améliorent avec le temps" },
  { name: "Deep Learning", name_fr: "Deep Learning", category: "technical", field: "it", description: "Advanced neural network techniques for complex pattern recognition", description_fr: "Techniques avancées de réseaux de neurones pour la reconnaissance de motifs complexes" },
  { name: "SQL & PostgreSQL", name_fr: "SQL & PostgreSQL", category: "technical", field: "it", description: "Relational database management and query language", description_fr: "Gestion de bases de données relationnelles et langage de requête" },
  { name: "MongoDB", name_fr: "MongoDB", category: "technical", field: "it", description: "NoSQL document database for flexible data storage", description_fr: "Base de données NoSQL documentaire pour un stockage de données flexible" },
  { name: "Git & GitHub", name_fr: "Git & GitHub", category: "technical", field: "it", description: "Version control system and collaborative development platform", description_fr: "Système de contrôle de version et plateforme de développement collaboratif" },
  { name: "CI/CD Pipelines", name_fr: "Pipelines CI/CD", category: "technical", field: "it", description: "Automated build, test, and deployment workflows", description_fr: "Flux de travail automatisés de compilation, test et déploiement" },
  { name: "REST API Design", name_fr: "Conception d'API REST", category: "technical", field: "it", description: "Designing scalable and maintainable web APIs", description_fr: "Conception d'API web scalables et maintenables" },
  { name: "Power BI", name_fr: "Power BI", category: "technical", field: "it", description: "Microsoft's business analytics and data visualization tool", description_fr: "Outil d'analytique métier et de visualisation de données de Microsoft" },
  { name: "SAP ERP", name_fr: "SAP ERP", category: "technical", field: "it", description: "Enterprise resource planning software for business management", description_fr: "Logiciel de planification des ressources d'entreprise pour la gestion métier" },
  { name: "Tableau", name_fr: "Tableau", category: "technical", field: "it", description: "Visual analytics platform for data-driven decision making", description_fr: "Plateforme d'analyse visuelle pour la prise de décision basée sur les données" },
  { name: "Terraform", name_fr: "Terraform", category: "technical", field: "it", description: "Infrastructure as Code tool for cloud resource provisioning", description_fr: "Outil d'Infrastructure as Code pour le provisionnement de ressources cloud" },
  { name: "Spring Boot", name_fr: "Spring Boot", category: "technical", field: "it", description: "Java-based framework for production-ready enterprise applications", description_fr: "Framework Java pour des applications entreprise prêtes pour la production" },
  { name: "Flutter", name_fr: "Flutter", category: "technical", field: "it", description: "Google's UI toolkit for cross-platform mobile applications", description_fr: "Kit UI de Google pour les applications mobiles multiplateformes" },
  { name: "Linux System Administration", name_fr: "Administration système Linux", category: "technical", field: "it", description: "Managing and maintaining Linux servers and infrastructure", description_fr: "Gestion et maintenance de serveurs et d'infrastructure Linux" },
  { name: "Network Engineering", name_fr: "Ingénierie réseau", category: "technical", field: "it", description: "Designing and managing computer network infrastructure", description_fr: "Conception et gestion d'infrastructure réseau informatique" },
  { name: "Agile Methodologies", name_fr: "Méthodologies Agile", category: "methodology", field: "it", description: "Scrum, Kanban, and other agile frameworks for software delivery", description_fr: "Scrum, Kanban et autres frameworks agiles pour la livraison logicielle" },
  { name: "ITIL Framework", name_fr: "Référentiel ITIL", category: "methodology", field: "it", description: "IT service management best practices framework", description_fr: "Cadre de bonnes pratiques pour la gestion des services IT" },

  // Engineering (25)
  { name: "AutoCAD", name_fr: "AutoCAD", category: "technical", field: "engineering", description: "Industry-standard CAD software for 2D and 3D design", description_fr: "Logiciel CAO standard pour la conception 2D et 3D" },
  { name: "SolidWorks", name_fr: "SolidWorks", category: "technical", field: "engineering", description: "3D CAD software for mechanical design and simulation", description_fr: "Logiciel CAO 3D pour la conception mécanique et la simulation" },
  { name: "CATIA", name_fr: "CATIA", category: "technical", field: "engineering", description: "Advanced PLM/CAE software used in automotive and aerospace", description_fr: "Logiciel avancé PLM/CAE utilisé dans l'automobile et l'aérospatiale" },
  { name: "Lean Manufacturing", name_fr: "Lean Manufacturing", category: "methodology", field: "engineering", description: "Waste elimination methodology for production optimization", description_fr: "Méthodologie d'élimination des gaspillages pour l'optimisation de la production" },
  { name: "Six Sigma", name_fr: "Six Sigma", category: "methodology", field: "engineering", description: "Statistical methodology for reducing process variation and defects", description_fr: "Méthodologie statistique pour réduire la variation des processus et les défauts" },
  { name: "SCADA Systems", name_fr: "Systèmes SCADA", category: "technical", field: "engineering", description: "Supervisory control systems for industrial process monitoring", description_fr: "Systèmes de contrôle de supervision pour la surveillance des processus industriels" },
  { name: "PLC Programming", name_fr: "Programmation d'automates (PLC)", category: "technical", field: "engineering", description: "Programming industrial automation controllers (Siemens, Allen-Bradley)", description_fr: "Programmation de contrôleurs d'automatisation industrielle (Siemens, Allen-Bradley)" },
  { name: "MATLAB/Simulink", name_fr: "MATLAB/Simulink", category: "technical", field: "engineering", description: "Mathematical computing and simulation environment", description_fr: "Environnement de calcul mathématique et de simulation" },
  { name: "Process Engineering", name_fr: "Génie des procédés", category: "technical", field: "engineering", description: "Design and optimization of chemical and industrial processes", description_fr: "Conception et optimisation des procédés chimiques et industriels" },
  { name: "TPM (Total Productive Maintenance)", name_fr: "TPM (Maintenance Productive Totale)", category: "methodology", field: "engineering", description: "Proactive maintenance approach maximizing equipment effectiveness", description_fr: "Approche de maintenance proactive maximisant l'efficacité des équipements" },
  { name: "OEE Analysis", name_fr: "Analyse TRS", category: "technical", field: "engineering", description: "Overall Equipment Effectiveness measurement and improvement", description_fr: "Mesure et amélioration du Taux de Rendement Synthétique" },
  { name: "GD&T (Geometric Dimensioning)", name_fr: "GD&T (Cotation géométrique)", category: "technical", field: "engineering", description: "Engineering drawing language for manufacturing tolerances", description_fr: "Langage de dessin technique pour les tolérances de fabrication" },
  { name: "Thermodynamics", name_fr: "Thermodynamique", category: "technical", field: "engineering", description: "Study of energy, heat, and work in engineering systems", description_fr: "Étude de l'énergie, de la chaleur et du travail dans les systèmes d'ingénierie" },
  { name: "Materials Science", name_fr: "Science des matériaux", category: "technical", field: "engineering", description: "Properties and applications of engineering materials", description_fr: "Propriétés et applications des matériaux d'ingénierie" },
  { name: "Fluid Mechanics", name_fr: "Mécanique des fluides", category: "technical", field: "engineering", description: "Study of fluids in motion and at rest for engineering applications", description_fr: "Étude des fluides en mouvement et au repos pour les applications d'ingénierie" },
  { name: "Electrical Engineering", name_fr: "Génie électrique", category: "technical", field: "engineering", description: "Design and maintenance of electrical systems and circuits", description_fr: "Conception et maintenance des systèmes et circuits électriques" },
  { name: "Quality Management (ISO 9001)", name_fr: "Management qualité (ISO 9001)", category: "methodology", field: "engineering", description: "International quality management system standard", description_fr: "Norme internationale de système de management de la qualité" },
  { name: "SMED", name_fr: "SMED", category: "methodology", field: "engineering", description: "Single-Minute Exchange of Die for rapid changeover", description_fr: "Changement rapide d'outils en moins de 10 minutes" },
  { name: "Kaizen", name_fr: "Kaizen", category: "methodology", field: "engineering", description: "Continuous improvement philosophy for manufacturing", description_fr: "Philosophie d'amélioration continue pour la fabrication" },
  { name: "Value Stream Mapping", name_fr: "Cartographie de la chaîne de valeur", category: "methodology", field: "engineering", description: "Visualizing material and information flow in production", description_fr: "Visualisation du flux de matériaux et d'informations dans la production" },
  { name: "Finite Element Analysis (FEA)", name_fr: "Analyse par éléments finis (AEF)", category: "technical", field: "engineering", description: "Numerical simulation for structural and thermal analysis", description_fr: "Simulation numérique pour l'analyse structurelle et thermique" },
  { name: "Robotics & Automation", name_fr: "Robotique & Automatisation", category: "technical", field: "engineering", description: "Industrial robot programming and automation systems", description_fr: "Programmation de robots industriels et systèmes d'automatisation" },
  { name: "Hydraulics & Pneumatics", name_fr: "Hydraulique & Pneumatique", category: "technical", field: "engineering", description: "Fluid power systems for industrial machinery", description_fr: "Systèmes de puissance fluidique pour machines industrielles" },
  { name: "Technical Drawing (ISO Standards)", name_fr: "Dessin technique (Normes ISO)", category: "technical", field: "engineering", description: "Engineering drawing according to international standards", description_fr: "Dessin d'ingénierie selon les normes internationales" },
  { name: "Supply Chain Management", name_fr: "Gestion de la chaîne d'approvisionnement", category: "methodology", field: "engineering", description: "End-to-end optimization of supply chain operations", description_fr: "Optimisation de bout en bout des opérations de la chaîne d'approvisionnement" },

  // HSE (15)
  { name: "ISO 14001 (Environmental)", name_fr: "ISO 14001 (Environnement)", category: "certification", field: "hse", description: "Environmental management system standard and audit", description_fr: "Norme de système de management environnemental et audit" },
  { name: "ISO 45001 (OH&S)", name_fr: "ISO 45001 (SST)", category: "certification", field: "hse", description: "Occupational health and safety management system standard", description_fr: "Norme de système de management de la santé et sécurité au travail" },
  { name: "Risk Assessment (HAZOP/FMEA)", name_fr: "Évaluation des risques (HAZOP/AMDEC)", category: "technical", field: "hse", description: "Systematic hazard identification and risk analysis methods", description_fr: "Méthodes systématiques d'identification des dangers et d'analyse des risques" },
  { name: "Fire Safety Engineering", name_fr: "Ingénierie de sécurité incendie", category: "technical", field: "hse", description: "Fire prevention, detection, and protection systems design", description_fr: "Conception de systèmes de prévention, détection et protection incendie" },
  { name: "Ergonomics", name_fr: "Ergonomie", category: "technical", field: "hse", description: "Workplace design for human health and productivity", description_fr: "Conception du lieu de travail pour la santé et la productivité humaine" },
  { name: "Industrial Hygiene", name_fr: "Hygiène industrielle", category: "technical", field: "hse", description: "Identification and control of workplace health hazards", description_fr: "Identification et contrôle des dangers pour la santé au travail" },
  { name: "Emergency Response Planning", name_fr: "Planification d'intervention d'urgence", category: "technical", field: "hse", description: "Developing and managing emergency procedures and drills", description_fr: "Développement et gestion des procédures et exercices d'urgence" },
  { name: "PPE Management", name_fr: "Gestion des EPI", category: "technical", field: "hse", description: "Selection, distribution, and compliance of personal protective equipment", description_fr: "Sélection, distribution et conformité des équipements de protection individuelle" },
  { name: "Environmental Impact Assessment", name_fr: "Étude d'impact environnemental", category: "technical", field: "hse", description: "Evaluating environmental effects of proposed projects", description_fr: "Évaluation des effets environnementaux des projets proposés" },
  { name: "Waste Management", name_fr: "Gestion des déchets", category: "technical", field: "hse", description: "Collection, treatment, and disposal of industrial and hazardous waste", description_fr: "Collecte, traitement et élimination des déchets industriels et dangereux" },
  { name: "Incident Investigation", name_fr: "Investigation d'incidents", category: "technical", field: "hse", description: "Root cause analysis of workplace accidents and near-misses", description_fr: "Analyse des causes racines des accidents du travail et quasi-accidents" },
  { name: "Permit to Work Systems", name_fr: "Systèmes de permis de travail", category: "technical", field: "hse", description: "Managing high-risk work activities through formal authorization", description_fr: "Gestion des activités de travail à haut risque par autorisation formelle" },
  { name: "Behavior-Based Safety (BBS)", name_fr: "Sécurité basée sur les comportements (SBC)", category: "methodology", field: "hse", description: "Observation-based approach to improving safety culture", description_fr: "Approche basée sur l'observation pour améliorer la culture sécurité" },
  { name: "Chemical Safety (SDS/GHS)", name_fr: "Sécurité chimique (FDS/SGH)", category: "technical", field: "hse", description: "Handling and storage of hazardous chemicals per GHS classification", description_fr: "Manipulation et stockage des produits chimiques dangereux selon la classification SGH" },
  { name: "Confined Space Entry", name_fr: "Travail en espace confiné", category: "technical", field: "hse", description: "Safe procedures for working in enclosed or restricted spaces", description_fr: "Procédures sûres pour travailler dans des espaces clos ou restreints" },

  // Healthcare (12)
  { name: "Patient Care Protocols", name_fr: "Protocoles de soins aux patients", category: "technical", field: "healthcare", description: "Evidence-based clinical care procedures and patient management", description_fr: "Procédures de soins cliniques basées sur les preuves et gestion des patients" },
  { name: "Medical Imaging (Radiology)", name_fr: "Imagerie médicale (Radiologie)", category: "technical", field: "healthcare", description: "X-ray, CT, MRI, and ultrasound diagnostic techniques", description_fr: "Techniques de diagnostic par rayons X, scanner, IRM et échographie" },
  { name: "Clinical Research", name_fr: "Recherche clinique", category: "technical", field: "healthcare", description: "Designing and conducting clinical trials and studies", description_fr: "Conception et conduite d'essais et études cliniques" },
  { name: "Pharmacovigilance", name_fr: "Pharmacovigilance", category: "technical", field: "healthcare", description: "Monitoring and reporting adverse drug reactions", description_fr: "Surveillance et signalement des effets indésirables des médicaments" },
  { name: "Hospital Quality Management", name_fr: "Management qualité hospitalière", category: "methodology", field: "healthcare", description: "Quality assurance and improvement in healthcare settings", description_fr: "Assurance et amélioration de la qualité en milieu hospitalier" },
  { name: "Infection Prevention & Control", name_fr: "Prévention et contrôle des infections", category: "technical", field: "healthcare", description: "Strategies to prevent healthcare-associated infections", description_fr: "Stratégies pour prévenir les infections associées aux soins" },
  { name: "Electronic Health Records (EHR)", name_fr: "Dossiers de santé électroniques (DSE)", category: "technical", field: "healthcare", description: "Digital patient record management systems", description_fr: "Systèmes de gestion numérique des dossiers patients" },
  { name: "Medical Equipment Maintenance", name_fr: "Maintenance des équipements médicaux", category: "technical", field: "healthcare", description: "Preventive and corrective maintenance of biomedical devices", description_fr: "Maintenance préventive et corrective des dispositifs biomédicaux" },
  { name: "Health & Safety Regulations", name_fr: "Réglementation santé & sécurité", category: "regulatory", field: "healthcare", description: "Moroccan health sector regulations and compliance", description_fr: "Réglementations et conformité du secteur de la santé au Maroc" },
  { name: "First Aid & Emergency Care", name_fr: "Premiers secours & Soins d'urgence", category: "technical", field: "healthcare", description: "Emergency medical response and first aid techniques", description_fr: "Réponse médicale d'urgence et techniques de premiers secours" },
  { name: "Biostatistics", name_fr: "Biostatistiques", category: "technical", field: "healthcare", description: "Statistical methods applied to biological and health data", description_fr: "Méthodes statistiques appliquées aux données biologiques et de santé" },
  { name: "Public Health", name_fr: "Santé publique", category: "technical", field: "healthcare", description: "Population health management and epidemiological methods", description_fr: "Gestion de la santé des populations et méthodes épidémiologiques" },

  // Soft Skills (15)
  { name: "Communication Skills", name_fr: "Compétences en communication", category: "soft_skill", field: "general", description: "Clear verbal and written communication in professional settings", description_fr: "Communication verbale et écrite claire en contexte professionnel" },
  { name: "Leadership", name_fr: "Leadership", category: "soft_skill", field: "general", description: "Guiding and inspiring teams toward achieving goals", description_fr: "Guider et inspirer les équipes vers l'atteinte des objectifs" },
  { name: "Project Management", name_fr: "Gestion de projet", category: "soft_skill", field: "general", description: "Planning, executing, and closing projects successfully", description_fr: "Planification, exécution et clôture réussie de projets" },
  { name: "Problem Solving", name_fr: "Résolution de problèmes", category: "soft_skill", field: "general", description: "Analytical approach to identifying and resolving complex issues", description_fr: "Approche analytique pour identifier et résoudre des problèmes complexes" },
  { name: "Teamwork", name_fr: "Travail d'équipe", category: "soft_skill", field: "general", description: "Effective collaboration in diverse and multicultural teams", description_fr: "Collaboration efficace dans des équipes diverses et multiculturelles" },
  { name: "Time Management", name_fr: "Gestion du temps", category: "soft_skill", field: "general", description: "Prioritizing tasks and meeting deadlines efficiently", description_fr: "Priorisation des tâches et respect efficace des délais" },
  { name: "Critical Thinking", name_fr: "Pensée critique", category: "soft_skill", field: "general", description: "Objective analysis and evaluation of information for decision-making", description_fr: "Analyse et évaluation objective de l'information pour la prise de décision" },
  { name: "Adaptability", name_fr: "Adaptabilité", category: "soft_skill", field: "general", description: "Flexibility to adjust to changing conditions and requirements", description_fr: "Flexibilité pour s'adapter aux conditions et exigences changeantes" },
  { name: "Negotiation", name_fr: "Négociation", category: "soft_skill", field: "general", description: "Reaching mutually beneficial agreements in professional contexts", description_fr: "Atteindre des accords mutuellement bénéfiques en contexte professionnel" },
  { name: "Presentation Skills", name_fr: "Compétences de présentation", category: "soft_skill", field: "general", description: "Delivering compelling and clear presentations to diverse audiences", description_fr: "Livrer des présentations convaincantes et claires à des publics variés" },
  { name: "Emotional Intelligence", name_fr: "Intelligence émotionnelle", category: "soft_skill", field: "general", description: "Understanding and managing emotions in professional relationships", description_fr: "Compréhension et gestion des émotions dans les relations professionnelles" },
  { name: "Conflict Resolution", name_fr: "Résolution de conflits", category: "soft_skill", field: "general", description: "Managing and resolving workplace disagreements constructively", description_fr: "Gestion et résolution constructive des désaccords au travail" },
  { name: "French Professional Writing", name_fr: "Rédaction professionnelle en français", category: "language", field: "general", description: "Business correspondence, reports, and documentation in French", description_fr: "Correspondance professionnelle, rapports et documentation en français" },
  { name: "English for Business", name_fr: "Anglais des affaires", category: "language", field: "general", description: "Professional English communication for international business", description_fr: "Communication professionnelle en anglais pour les affaires internationales" },
  { name: "Arabic Darija Communication", name_fr: "Communication en darija marocain", category: "language", field: "general", description: "Effective workplace communication in Moroccan Arabic dialect", description_fr: "Communication efficace en darija marocain sur le lieu de travail" },
];

// ─────────────────────────────────────────────────────────────────
// 6. CAREER QUIZ QUESTIONS (30+) with OPTIONS (4 each)
// ─────────────────────────────────────────────────────────────────
const quizQuestions = [
  {
    id: "quiz-env-01",
    quiz_type: "career_assessment",
    question: "What work environment suits you best?",
    question_fr: "Quel environnement de travail vous convient le mieux ?",
    description: "Think about where you feel most productive and happy.",
    description_fr: "Réfléchissez à l'endroit où vous vous sentez le plus productif et épanoui.",
    category: "preferences",
    trait: "work_style",
    options: [
      { text: "A quiet office with structured routines", text_fr: "Un bureau calme avec des routines structurées", icon: "BuildingIcon", scores: { analytical: 3, structured: 3, technical: 2, creative: 0 } },
      { text: "An open space with constant teamwork", text_fr: "Un open space avec du travail d'équipe constant", icon: "UsersIcon", scores: { leadership: 2, social: 3, teamwork: 3, structured: 0 } },
      { text: "On the field or factory floor", text_fr: "Sur le terrain ou dans l'usine", icon: "HardHatIcon", scores: { practical: 3, industrial: 3, safety_focus: 2, analytical: 0 } },
      { text: "Working remotely with flexibility", text_fr: "En télétravail avec de la flexibilité", icon: "LaptopIcon", scores: { autonomy: 3, creative: 2, technical: 2, social: 0 } },
    ],
  },
  {
    id: "quiz-prob-01",
    quiz_type: "career_assessment",
    question: "How do you prefer to solve problems?",
    question_fr: "Comment préférez-vous résoudre un problème ?",
    description: "Consider your natural approach when facing a challenge.",
    description_fr: "Considérez votre approche naturelle face à un défi.",
    category: "personality",
    trait: "problem_solving",
    options: [
      { text: "Analyze data and use logic", text_fr: "Analyser les données et utiliser la logique", icon: "ChartBarIcon", scores: { analytical: 3, technical: 2, structured: 2, creative: 0 } },
      { text: "Brainstorm creative solutions with others", text_fr: "Chercher des solutions créatives avec les autres", icon: "LightbulbIcon", scores: { creative: 3, social: 2, leadership: 1, structured: 0 } },
      { text: "Follow established procedures and standards", text_fr: "Suivre les procédures et normes établies", icon: "ClipboardCheckIcon", scores: { structured: 3, safety_focus: 2, practical: 2, creative: 0 } },
      { text: "Experiment hands-on until it works", text_fr: "Expérimenter en pratique jusqu'à ce que ça marche", icon: "WrenchIcon", scores: { practical: 3, autonomy: 2, industrial: 2, structured: 0 } },
    ],
  },
  {
    id: "quiz-motiv-01",
    quiz_type: "career_assessment",
    question: "What is your primary motivation at work?",
    question_fr: "Quelle est votre motivation principale au travail ?",
    description: "What drives you to do your best every day?",
    description_fr: "Qu'est-ce qui vous pousse à donner le meilleur de vous-même chaque jour ?",
    category: "values",
    trait: "motivation",
    options: [
      { text: "Financial stability and career growth", text_fr: "Stabilité financière et évolution de carrière", icon: "TrendingUpIcon", scores: { structured: 2, leadership: 2, analytical: 1, creative: 0 } },
      { text: "Helping people and making a difference", text_fr: "Aider les gens et faire une différence", icon: "HeartIcon", scores: { social: 3, patient_care: 3, teamwork: 2, technical: 0 } },
      { text: "Solving complex technical challenges", text_fr: "Résoudre des défis techniques complexes", icon: "CpuIcon", scores: { technical: 3, analytical: 3, creative: 1, social: 0 } },
      { text: "Building and creating something new", text_fr: "Construire et créer quelque chose de nouveau", icon: "HammerIcon", scores: { creative: 3, practical: 2, autonomy: 2, structured: 0 } },
    ],
  },
  {
    id: "quiz-team-01",
    quiz_type: "career_assessment",
    question: "What role do you naturally take in a team?",
    question_fr: "Quel rôle prenez-vous naturellement dans une équipe ?",
    description: "Think about group projects at school or work.",
    description_fr: "Pensez aux projets de groupe à l'école ou au travail.",
    category: "personality",
    trait: "team_role",
    options: [
      { text: "The leader who organizes and delegates", text_fr: "Le leader qui organise et délègue", icon: "CrownIcon", scores: { leadership: 3, structured: 2, social: 2, analytical: 0 } },
      { text: "The analyst who researches and plans", text_fr: "L'analyste qui recherche et planifie", icon: "SearchIcon", scores: { analytical: 3, structured: 2, technical: 2, social: 0 } },
      { text: "The executor who gets things done", text_fr: "L'exécutant qui concrétise les choses", icon: "CheckCircleIcon", scores: { practical: 3, industrial: 2, autonomy: 1, creative: 0 } },
      { text: "The mediator who keeps harmony", text_fr: "Le médiateur qui maintient l'harmonie", icon: "ScaleIcon", scores: { social: 3, teamwork: 3, patient_care: 1, technical: 0 } },
    ],
  },
  {
    id: "quiz-risk-01",
    quiz_type: "career_assessment",
    question: "How do you feel about risk?",
    question_fr: "Quel est votre rapport au risque ?",
    description: "Your comfort level with uncertainty and risk-taking.",
    description_fr: "Votre niveau de confort avec l'incertitude et la prise de risque.",
    category: "personality",
    trait: "risk_tolerance",
    options: [
      { text: "I prefer safety and predictability", text_fr: "Je préfère la sécurité et la prévisibilité", icon: "ShieldIcon", scores: { structured: 3, safety_focus: 3, practical: 1, creative: 0 } },
      { text: "Calculated risks based on data", text_fr: "Des risques calculés basés sur les données", icon: "CalculatorIcon", scores: { analytical: 3, technical: 2, structured: 1, social: 0 } },
      { text: "I embrace uncertainty and change", text_fr: "J'embrasse l'incertitude et le changement", icon: "ZapIcon", scores: { creative: 3, autonomy: 2, leadership: 1, structured: 0 } },
      { text: "I manage risks to protect others", text_fr: "Je gère les risques pour protéger les autres", icon: "ShieldCheckIcon", scores: { safety_focus: 3, patient_care: 2, social: 2, creative: 0 } },
    ],
  },
  {
    id: "quiz-learn-01",
    quiz_type: "career_assessment",
    question: "How do you learn best?",
    question_fr: "Comment apprenez-vous le mieux ?",
    description: "Think about how you acquire new skills most effectively.",
    description_fr: "Réfléchissez à la façon dont vous acquérez de nouvelles compétences le plus efficacement.",
    category: "preferences",
    trait: "learning_style",
    options: [
      { text: "Reading manuals and documentation", text_fr: "Lire des manuels et de la documentation", icon: "BookOpenIcon", scores: { analytical: 3, structured: 2, technical: 1, practical: 0 } },
      { text: "Hands-on practice and experimentation", text_fr: "Pratique et expérimentation sur le terrain", icon: "HandIcon", scores: { practical: 3, industrial: 2, creative: 1, analytical: 0 } },
      { text: "Watching and learning from mentors", text_fr: "Observer et apprendre des mentors", icon: "EyeIcon", scores: { social: 2, teamwork: 2, patient_care: 1, autonomy: 0 } },
      { text: "Online courses and video tutorials", text_fr: "Cours en ligne et tutoriels vidéo", icon: "MonitorPlayIcon", scores: { technical: 2, autonomy: 2, analytical: 1, social: 0 } },
    ],
  },
  {
    id: "quiz-stress-01",
    quiz_type: "career_assessment",
    question: "How do you handle stressful situations?",
    question_fr: "Comment gérez-vous les situations stressantes ?",
    description: "Your response to pressure and tight deadlines.",
    description_fr: "Votre réaction face à la pression et aux délais serrés.",
    category: "personality",
    trait: "stress_tolerance",
    options: [
      { text: "I stay calm and prioritize methodically", text_fr: "Je reste calme et priorise méthodiquement", icon: "ListOrderedIcon", scores: { structured: 3, analytical: 2, safety_focus: 1, creative: 0 } },
      { text: "I rally the team and delegate tasks", text_fr: "Je mobilise l'équipe et délègue les tâches", icon: "UsersIcon", scores: { leadership: 3, social: 2, teamwork: 2, autonomy: 0 } },
      { text: "I focus intensely and work through it alone", text_fr: "Je me concentre intensément et travaille seul", icon: "TargetIcon", scores: { autonomy: 3, technical: 2, practical: 1, social: 0 } },
      { text: "I take a step back and seek perspective", text_fr: "Je prends du recul et cherche de la perspective", icon: "CompassIcon", scores: { analytical: 2, creative: 2, patient_care: 1, industrial: 0 } },
    ],
  },
  {
    id: "quiz-tech-01",
    quiz_type: "career_assessment",
    question: "Which type of technology interests you most?",
    question_fr: "Quel type de technologie vous intéresse le plus ?",
    description: "Think about what you enjoy working with.",
    description_fr: "Pensez à ce avec quoi vous aimez travailler.",
    category: "interests",
    trait: "tech_preference",
    options: [
      { text: "Software and programming", text_fr: "Logiciels et programmation", icon: "CodeIcon", scores: { technical: 3, analytical: 2, creative: 1, practical: 0 } },
      { text: "Machines and industrial equipment", text_fr: "Machines et équipements industriels", icon: "CogIcon", scores: { industrial: 3, practical: 3, engineering: 2, technical: 0 } },
      { text: "Medical devices and health tech", text_fr: "Dispositifs médicaux et technologies de santé", icon: "HeartPulseIcon", scores: { patient_care: 3, technical: 2, safety_focus: 1, industrial: 0 } },
      { text: "Renewable energy systems", text_fr: "Systèmes d'énergie renouvelable", icon: "SunIcon", scores: { engineering: 3, safety_focus: 2, practical: 1, analytical: 0 } },
    ],
  },
  {
    id: "quiz-comm-01",
    quiz_type: "career_assessment",
    question: "Which communication style describes you best?",
    question_fr: "Quel style de communication vous décrit le mieux ?",
    description: "How you typically interact with others professionally.",
    description_fr: "Comment vous interagissez habituellement avec les autres professionnellement.",
    category: "personality",
    trait: "communication_style",
    options: [
      { text: "Precise and data-driven", text_fr: "Précis et basé sur les données", icon: "BarChartIcon", scores: { analytical: 3, technical: 2, structured: 2, social: 0 } },
      { text: "Empathetic and supportive", text_fr: "Empathique et bienveillant", icon: "HeartHandshakeIcon", scores: { social: 3, patient_care: 3, teamwork: 2, analytical: 0 } },
      { text: "Direct and action-oriented", text_fr: "Direct et orienté action", icon: "ArrowRightIcon", scores: { leadership: 3, practical: 2, autonomy: 1, creative: 0 } },
      { text: "Creative and persuasive", text_fr: "Créatif et persuasif", icon: "SparklesIcon", scores: { creative: 3, leadership: 2, social: 1, structured: 0 } },
    ],
  },
  {
    id: "quiz-val-01",
    quiz_type: "career_assessment",
    question: "What do you value most in a company?",
    question_fr: "Qu'est-ce que vous valorisez le plus dans une entreprise ?",
    description: "What matters when choosing an employer.",
    description_fr: "Ce qui compte quand vous choisissez un employeur.",
    category: "values",
    trait: "company_values",
    options: [
      { text: "Stability and strong reputation", text_fr: "Stabilité et forte réputation", icon: "BuildingIcon", scores: { structured: 3, safety_focus: 2, analytical: 1, creative: 0 } },
      { text: "Innovation and cutting-edge technology", text_fr: "Innovation et technologie de pointe", icon: "RocketIcon", scores: { technical: 3, creative: 2, autonomy: 1, structured: 0 } },
      { text: "Social impact and purpose", text_fr: "Impact social et sens de la mission", icon: "GlobeIcon", scores: { social: 3, patient_care: 2, teamwork: 1, analytical: 0 } },
      { text: "Growth opportunities and learning", text_fr: "Opportunités de croissance et d'apprentissage", icon: "TrendingUpIcon", scores: { leadership: 2, analytical: 2, technical: 1, industrial: 0 } },
    ],
  },
  {
    id: "quiz-detail-01",
    quiz_type: "career_assessment",
    question: "How detail-oriented are you?",
    question_fr: "À quel point êtes-vous orienté détails ?",
    description: "Your natural attention to precision and accuracy.",
    description_fr: "Votre attention naturelle à la précision et à l'exactitude.",
    category: "personality",
    trait: "attention_detail",
    options: [
      { text: "Extremely — I double-check everything", text_fr: "Extrêmement — je revérifie tout", icon: "SearchCheckIcon", scores: { structured: 3, safety_focus: 3, analytical: 2, creative: 0 } },
      { text: "Moderately — I focus on what matters most", text_fr: "Modérément — je me concentre sur l'essentiel", icon: "FilterIcon", scores: { practical: 2, leadership: 2, analytical: 1, structured: 0 } },
      { text: "I prefer big-picture thinking", text_fr: "Je préfère voir la vision d'ensemble", icon: "MountainIcon", scores: { creative: 2, leadership: 3, autonomy: 1, safety_focus: 0 } },
      { text: "It depends on the stakes involved", text_fr: "Cela dépend des enjeux impliqués", icon: "ScaleIcon", scores: { analytical: 2, practical: 2, social: 1, creative: 0 } },
    ],
  },
  {
    id: "quiz-impact-01",
    quiz_type: "career_assessment",
    question: "What kind of impact do you want to make?",
    question_fr: "Quel type d'impact voulez-vous avoir ?",
    description: "How you want to contribute to society through your career.",
    description_fr: "Comment vous voulez contribuer à la société à travers votre carrière.",
    category: "values",
    trait: "desired_impact",
    options: [
      { text: "Build Morocco's industrial capacity", text_fr: "Développer la capacité industrielle du Maroc", icon: "FactoryIcon", scores: { industrial: 3, practical: 2, engineering: 2, social: 0 } },
      { text: "Improve people's health and wellbeing", text_fr: "Améliorer la santé et le bien-être des gens", icon: "HeartIcon", scores: { patient_care: 3, social: 3, safety_focus: 1, technical: 0 } },
      { text: "Drive digital transformation", text_fr: "Accélérer la transformation digitale", icon: "MonitorIcon", scores: { technical: 3, creative: 2, analytical: 1, practical: 0 } },
      { text: "Protect workers and the environment", text_fr: "Protéger les travailleurs et l'environnement", icon: "LeafIcon", scores: { safety_focus: 3, social: 2, structured: 2, technical: 0 } },
    ],
  },
  {
    id: "quiz-proj-01",
    quiz_type: "career_assessment",
    question: "Which project would excite you most?",
    question_fr: "Quel projet vous enthousiasmerait le plus ?",
    description: "Imagine you can choose any project to work on.",
    description_fr: "Imaginez que vous pouvez choisir n'importe quel projet.",
    category: "interests",
    trait: "project_preference",
    options: [
      { text: "Designing an app used by millions", text_fr: "Concevoir une application utilisée par des millions", icon: "SmartphoneIcon", scores: { technical: 3, creative: 2, analytical: 1, practical: 0 } },
      { text: "Optimizing a factory production line", text_fr: "Optimiser une ligne de production en usine", icon: "SettingsIcon", scores: { industrial: 3, practical: 3, analytical: 2, creative: 0 } },
      { text: "Building a hospital emergency system", text_fr: "Construire un système d'urgence hospitalier", icon: "SirenIcon", scores: { patient_care: 3, safety_focus: 2, social: 2, technical: 0 } },
      { text: "Deploying solar panels across Morocco", text_fr: "Déployer des panneaux solaires à travers le Maroc", icon: "SunIcon", scores: { engineering: 3, safety_focus: 2, practical: 2, industrial: 0 } },
    ],
  },
  {
    id: "quiz-pace-01",
    quiz_type: "career_assessment",
    question: "What work pace do you prefer?",
    question_fr: "Quel rythme de travail préférez-vous ?",
    description: "Your preferred speed and intensity of work.",
    description_fr: "Votre vitesse et intensité de travail préférées.",
    category: "preferences",
    trait: "work_pace",
    options: [
      { text: "Fast-paced with tight deadlines", text_fr: "Rythme rapide avec des délais serrés", icon: "ZapIcon", scores: { leadership: 2, practical: 2, autonomy: 2, structured: 0 } },
      { text: "Steady and methodical", text_fr: "Régulier et méthodique", icon: "ClockIcon", scores: { structured: 3, analytical: 2, safety_focus: 1, creative: 0 } },
      { text: "Varies — sprints then calm periods", text_fr: "Variable — sprints puis périodes calmes", icon: "WavesIcon", scores: { creative: 2, technical: 2, autonomy: 1, structured: 0 } },
      { text: "Patient and long-term focused", text_fr: "Patient et orienté long terme", icon: "TreeIcon", scores: { analytical: 2, patient_care: 2, structured: 1, practical: 0 } },
    ],
  },
  {
    id: "quiz-lead-01",
    quiz_type: "career_assessment",
    question: "How do you view authority and hierarchy?",
    question_fr: "Comment percevez-vous l'autorité et la hiérarchie ?",
    description: "Your relationship with organizational structure.",
    description_fr: "Votre relation avec la structure organisationnelle.",
    category: "values",
    trait: "authority_view",
    options: [
      { text: "I respect the chain of command", text_fr: "Je respecte la chaîne de commandement", icon: "ListTreeIcon", scores: { structured: 3, safety_focus: 2, practical: 1, autonomy: 0 } },
      { text: "I prefer flat, collaborative structures", text_fr: "Je préfère les structures plates et collaboratives", icon: "GitBranchIcon", scores: { teamwork: 3, creative: 2, social: 1, structured: 0 } },
      { text: "I want to lead and make decisions", text_fr: "Je veux diriger et prendre des décisions", icon: "CrownIcon", scores: { leadership: 3, autonomy: 2, practical: 1, social: 0 } },
      { text: "I work best independently", text_fr: "Je travaille mieux de manière indépendante", icon: "UserIcon", scores: { autonomy: 3, technical: 2, analytical: 1, teamwork: 0 } },
    ],
  },
  {
    id: "quiz-ethic-01",
    quiz_type: "career_assessment",
    question: "When facing an ethical dilemma at work, you...",
    question_fr: "Face à un dilemme éthique au travail, vous...",
    description: "How you navigate moral challenges in professional settings.",
    description_fr: "Comment vous naviguez les défis moraux en contexte professionnel.",
    category: "values",
    trait: "ethical_stance",
    options: [
      { text: "Follow company policy strictly", text_fr: "Suivez strictement la politique de l'entreprise", icon: "BookIcon", scores: { structured: 3, safety_focus: 2, practical: 1, creative: 0 } },
      { text: "Consult with colleagues for perspective", text_fr: "Consultez des collègues pour avoir différents avis", icon: "MessageCircleIcon", scores: { social: 3, teamwork: 2, analytical: 1, autonomy: 0 } },
      { text: "Report it through official channels", text_fr: "Signalez par les canaux officiels", icon: "FlagIcon", scores: { safety_focus: 3, structured: 2, leadership: 1, creative: 0 } },
      { text: "Trust your moral compass", text_fr: "Faites confiance à votre conscience", icon: "CompassIcon", scores: { autonomy: 2, leadership: 2, patient_care: 1, structured: 0 } },
    ],
  },
  {
    id: "quiz-tool-01",
    quiz_type: "career_assessment",
    question: "Which tool do you enjoy using most?",
    question_fr: "Quel outil préférez-vous utiliser ?",
    description: "The tools that feel natural in your hands.",
    description_fr: "Les outils qui vous semblent naturels en main.",
    category: "interests",
    trait: "tool_preference",
    options: [
      { text: "A computer and code editor", text_fr: "Un ordinateur et un éditeur de code", icon: "TerminalIcon", scores: { technical: 3, analytical: 2, creative: 1, practical: 0 } },
      { text: "Measuring instruments and lab equipment", text_fr: "Des instruments de mesure et équipements de labo", icon: "RulerIcon", scores: { analytical: 3, engineering: 2, structured: 1, creative: 0 } },
      { text: "Heavy machinery and industrial tools", text_fr: "Des machines lourdes et outils industriels", icon: "WrenchIcon", scores: { industrial: 3, practical: 3, safety_focus: 1, analytical: 0 } },
      { text: "Spreadsheets and dashboards", text_fr: "Des tableurs et tableaux de bord", icon: "TableIcon", scores: { analytical: 3, structured: 2, technical: 1, practical: 0 } },
    ],
  },
  {
    id: "quiz-future-01",
    quiz_type: "career_assessment",
    question: "Where do you see Morocco's biggest opportunity?",
    question_fr: "Où voyez-vous la plus grande opportunité du Maroc ?",
    description: "The sector you think will grow most in the next decade.",
    description_fr: "Le secteur qui, selon vous, croîtra le plus dans les 10 prochaines années.",
    category: "interests",
    trait: "sector_vision",
    options: [
      { text: "Tech and digital services", text_fr: "Technologies et services numériques", icon: "BinaryIcon", scores: { technical: 3, creative: 2, analytical: 1, industrial: 0 } },
      { text: "Green energy and sustainability", text_fr: "Énergie verte et développement durable", icon: "LeafIcon", scores: { engineering: 3, safety_focus: 2, practical: 1, technical: 0 } },
      { text: "Healthcare and biotech", text_fr: "Santé et biotechnologie", icon: "DnaIcon", scores: { patient_care: 3, analytical: 2, social: 1, industrial: 0 } },
      { text: "Industry 4.0 and smart manufacturing", text_fr: "Industrie 4.0 et fabrication intelligente", icon: "CpuIcon", scores: { industrial: 3, technical: 2, engineering: 2, social: 0 } },
    ],
  },
  {
    id: "quiz-mentor-01",
    quiz_type: "career_assessment",
    question: "What kind of mentor do you seek?",
    question_fr: "Quel type de mentor recherchez-vous ?",
    description: "The guidance style that helps you grow most.",
    description_fr: "Le style d'accompagnement qui vous fait le plus progresser.",
    category: "preferences",
    trait: "mentoring_style",
    options: [
      { text: "A technical expert who deepens my skills", text_fr: "Un expert technique qui approfondit mes compétences", icon: "BrainIcon", scores: { technical: 3, analytical: 2, engineering: 1, social: 0 } },
      { text: "A leader who teaches management", text_fr: "Un leader qui enseigne le management", icon: "BriefcaseIcon", scores: { leadership: 3, social: 2, structured: 1, technical: 0 } },
      { text: "A caring guide who develops my soft skills", text_fr: "Un guide bienveillant qui développe mes compétences humaines", icon: "HeartIcon", scores: { social: 3, patient_care: 2, teamwork: 1, analytical: 0 } },
      { text: "An entrepreneur who inspires innovation", text_fr: "Un entrepreneur qui inspire l'innovation", icon: "RocketIcon", scores: { creative: 3, autonomy: 2, leadership: 1, structured: 0 } },
    ],
  },
  {
    id: "quiz-day-01",
    quiz_type: "career_assessment",
    question: "Describe your ideal work day.",
    question_fr: "Décrivez votre journée de travail idéale.",
    description: "What activities would fill your perfect workday?",
    description_fr: "Quelles activités rempliraient votre journée de travail parfaite ?",
    category: "preferences",
    trait: "ideal_day",
    options: [
      { text: "Coding and debugging complex systems", text_fr: "Coder et débugger des systèmes complexes", icon: "CodeIcon", scores: { technical: 3, analytical: 2, autonomy: 2, social: 0 } },
      { text: "Meetings, coaching, and strategic planning", text_fr: "Réunions, coaching et planification stratégique", icon: "CalendarIcon", scores: { leadership: 3, social: 2, structured: 1, practical: 0 } },
      { text: "Site visits and hands-on problem solving", text_fr: "Visites de site et résolution de problèmes sur le terrain", icon: "MapPinIcon", scores: { practical: 3, industrial: 2, safety_focus: 2, analytical: 0 } },
      { text: "Research, analysis, and report writing", text_fr: "Recherche, analyse et rédaction de rapports", icon: "FileTextIcon", scores: { analytical: 3, structured: 2, patient_care: 1, creative: 0 } },
    ],
  },
  {
    id: "quiz-chal-01",
    quiz_type: "career_quiz",
    question: "What type of challenge energizes you?",
    question_fr: "Quel type de défi vous dynamise ?",
    description: "The challenges that make you want to come to work.",
    description_fr: "Les défis qui vous donnent envie de venir travailler.",
    category: "personality",
    trait: "challenge_type",
    options: [
      { text: "Solving a bug that no one else can fix", text_fr: "Résoudre un bug que personne ne peut corriger", icon: "BugIcon", scores: { technical: 3, analytical: 3, autonomy: 1, social: 0 } },
      { text: "Leading a team through a crisis", text_fr: "Diriger une équipe pendant une crise", icon: "FlagIcon", scores: { leadership: 3, social: 2, safety_focus: 1, analytical: 0 } },
      { text: "Improving a process by 50%", text_fr: "Améliorer un processus de 50%", icon: "TrendingUpIcon", scores: { industrial: 3, practical: 2, analytical: 2, creative: 0 } },
      { text: "Saving a life in an emergency", text_fr: "Sauver une vie dans une urgence", icon: "AmbulanceIcon", scores: { patient_care: 3, safety_focus: 3, social: 1, technical: 0 } },
    ],
  },
  {
    id: "quiz-lang-01",
    quiz_type: "career_quiz",
    question: "Which language do you use most at work?",
    question_fr: "Quelle langue utilisez-vous le plus au travail ?",
    description: "Your primary professional communication language.",
    description_fr: "Votre langue principale de communication professionnelle.",
    category: "preferences",
    trait: "language_pref",
    options: [
      { text: "French — formal and technical writing", text_fr: "Français — rédaction formelle et technique", icon: "FileTextIcon", scores: { structured: 2, analytical: 1, social: 1, technical: 0 } },
      { text: "English — international collaboration", text_fr: "Anglais — collaboration internationale", icon: "GlobeIcon", scores: { technical: 2, creative: 1, autonomy: 1, structured: 0 } },
      { text: "Arabic/Darija — local team communication", text_fr: "Arabe/Darija — communication en équipe locale", icon: "MessageSquareIcon", scores: { social: 3, teamwork: 2, practical: 1, technical: 0 } },
      { text: "Programming languages — code speaks for me", text_fr: "Langages de programmation — le code parle pour moi", icon: "TerminalIcon", scores: { technical: 3, analytical: 2, autonomy: 2, social: 0 } },
    ],
  },
  {
    id: "quiz-free-01",
    quiz_type: "career_quiz",
    question: "What do you do in your free time?",
    question_fr: "Que faites-vous pendant votre temps libre ?",
    description: "Your hobbies often reveal career inclinations.",
    description_fr: "Vos hobbies révèlent souvent des inclinations professionnelles.",
    category: "interests",
    trait: "hobby_type",
    options: [
      { text: "Build side projects or tinker with code", text_fr: "Développer des projets perso ou coder", icon: "CodeIcon", scores: { technical: 3, creative: 2, autonomy: 2, social: 0 } },
      { text: "Volunteer or help in the community", text_fr: "Faire du bénévolat ou aider la communauté", icon: "HandHelpingIcon", scores: { social: 3, patient_care: 2, teamwork: 1, technical: 0 } },
      { text: "Fix things around the house or workshop", text_fr: "Réparer des choses à la maison ou à l'atelier", icon: "HammerIcon", scores: { practical: 3, industrial: 2, engineering: 1, analytical: 0 } },
      { text: "Read, research, and analyze trends", text_fr: "Lire, rechercher et analyser les tendances", icon: "BookOpenIcon", scores: { analytical: 3, structured: 2, technical: 1, creative: 0 } },
    ],
  },
  {
    id: "quiz-ach-01",
    quiz_type: "career_quiz",
    question: "What achievement would make you most proud?",
    question_fr: "Quelle réalisation vous rendrait le plus fier ?",
    description: "The accomplishment that would define your career.",
    description_fr: "L'accomplissement qui définirait votre carrière.",
    category: "values",
    trait: "achievement_type",
    options: [
      { text: "Building a product used nationwide", text_fr: "Construire un produit utilisé dans tout le pays", icon: "PackageIcon", scores: { technical: 3, creative: 2, leadership: 1, safety_focus: 0 } },
      { text: "Achieving zero accidents for 5 years", text_fr: "Atteindre zéro accident pendant 5 ans", icon: "ShieldCheckIcon", scores: { safety_focus: 3, structured: 2, practical: 1, creative: 0 } },
      { text: "Mentoring 100 young professionals", text_fr: "Encadrer 100 jeunes professionnels", icon: "UsersIcon", scores: { social: 3, leadership: 2, patient_care: 1, technical: 0 } },
      { text: "Publishing breakthrough research", text_fr: "Publier une recherche révolutionnaire", icon: "FileTextIcon", scores: { analytical: 3, technical: 2, patient_care: 1, social: 0 } },
    ],
  },
  {
    id: "quiz-morocco-01",
    quiz_type: "career_quiz",
    question: "Which Moroccan mega-project interests you most?",
    question_fr: "Quel méga-projet marocain vous intéresse le plus ?",
    description: "Morocco is building the future — which part excites you?",
    description_fr: "Le Maroc construit l'avenir — quelle partie vous passionne ?",
    category: "interests",
    trait: "national_interest",
    options: [
      { text: "Noor Solar Complex (Ouarzazate)", text_fr: "Complexe solaire Noor (Ouarzazate)", icon: "SunIcon", scores: { engineering: 3, safety_focus: 2, practical: 1, technical: 0 } },
      { text: "Tanger Med Port expansion", text_fr: "Extension du port Tanger Med", icon: "ShipIcon", scores: { industrial: 3, practical: 2, engineering: 1, creative: 0 } },
      { text: "Morocco's digital transformation (e-gov)", text_fr: "Transformation digitale du Maroc (e-gov)", icon: "MonitorIcon", scores: { technical: 3, analytical: 2, creative: 1, practical: 0 } },
      { text: "World Cup 2030 stadium construction", text_fr: "Construction des stades de la Coupe du Monde 2030", icon: "StadiumIcon", scores: { engineering: 2, industrial: 2, practical: 2, safety_focus: 1 } },
    ],
  },
  {
    id: "quiz-salary-01",
    quiz_type: "career_quiz",
    question: "What matters more to you?",
    question_fr: "Qu'est-ce qui compte le plus pour vous ?",
    description: "Choose between competing career priorities.",
    description_fr: "Choisissez entre des priorités de carrière concurrentes.",
    category: "values",
    trait: "priority",
    options: [
      { text: "High salary even if stressful", text_fr: "Salaire élevé même si stressant", icon: "BanknoteIcon", scores: { practical: 2, leadership: 2, autonomy: 1, social: 0 } },
      { text: "Work-life balance over everything", text_fr: "L'équilibre vie pro-vie perso avant tout", icon: "BalanceIcon", scores: { structured: 2, patient_care: 1, social: 1, leadership: 0 } },
      { text: "Purpose and meaning in my work", text_fr: "Du sens et de l'utilité dans mon travail", icon: "StarIcon", scores: { social: 3, patient_care: 2, safety_focus: 1, practical: 0 } },
      { text: "Learning and skill development", text_fr: "L'apprentissage et le développement des compétences", icon: "GraduationCapIcon", scores: { technical: 2, analytical: 2, creative: 1, structured: 0 } },
    ],
  },
  {
    id: "quiz-collab-01",
    quiz_type: "career_quiz",
    question: "Who would you prefer to work with daily?",
    question_fr: "Avec qui préféreriez-vous travailler au quotidien ?",
    description: "The colleagues and stakeholders that energize you.",
    description_fr: "Les collègues et interlocuteurs qui vous dynamisent.",
    category: "preferences",
    trait: "collaboration_pref",
    options: [
      { text: "Engineers and technical experts", text_fr: "Ingénieurs et experts techniques", icon: "CogIcon", scores: { technical: 2, engineering: 3, analytical: 1, social: 0 } },
      { text: "Patients and healthcare staff", text_fr: "Patients et personnel soignant", icon: "StethoscopeIcon", scores: { patient_care: 3, social: 3, safety_focus: 1, technical: 0 } },
      { text: "Business leaders and managers", text_fr: "Dirigeants et managers", icon: "BriefcaseIcon", scores: { leadership: 3, structured: 2, social: 1, practical: 0 } },
      { text: "Factory workers and technicians", text_fr: "Ouvriers et techniciens d'usine", icon: "HardHatIcon", scores: { industrial: 3, practical: 3, safety_focus: 1, analytical: 0 } },
    ],
  },
  {
    id: "quiz-change-01",
    quiz_type: "career_quiz",
    question: "How do you react to organizational change?",
    question_fr: "Comment réagissez-vous au changement organisationnel ?",
    description: "Your response when processes or structures change.",
    description_fr: "Votre réaction quand les processus ou structures changent.",
    category: "personality",
    trait: "change_tolerance",
    options: [
      { text: "I embrace it and help lead the transition", text_fr: "Je l'accueille et aide à diriger la transition", icon: "ArrowUpRightIcon", scores: { leadership: 3, creative: 2, autonomy: 1, structured: 0 } },
      { text: "I adapt but need time to process", text_fr: "Je m'adapte mais j'ai besoin de temps", icon: "ClockIcon", scores: { structured: 2, analytical: 2, practical: 1, creative: 0 } },
      { text: "I focus on keeping people comfortable", text_fr: "Je me concentre sur le bien-être des personnes", icon: "HeartHandshakeIcon", scores: { social: 3, patient_care: 2, teamwork: 1, autonomy: 0 } },
      { text: "I evaluate the change with data first", text_fr: "J'évalue le changement avec des données d'abord", icon: "BarChartIcon", scores: { analytical: 3, structured: 2, technical: 1, creative: 0 } },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────
// EXECUTION
// ─────────────────────────────────────────────────────────────────

async function seed() {
  await client.connect();
  console.log("Connected to PostgreSQL.\n");

  const now = new Date().toISOString();
  let totalInserted = 0;

  // 1. Interview Tips
  console.log("--- Seeding interview_tip ---");
  let tipCount = 0;
  for (let i = 0; i < interviewTips.length; i++) {
    const t = interviewTips[i];
    const res = await client.query(
      `INSERT INTO interview_tip (id, title, title_fr, content, content_fr, extended_content, extended_content_fr, category, field, tags, is_active, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [
        t.id, t.title, t.title_fr, t.content, t.content_fr,
        t.extended_content || null, t.extended_content_fr || null,
        t.category, t.field || null,
        JSON.stringify(t.tags),
        true, i + 100, now, now,
      ]
    );
    if (res.rowCount > 0) tipCount++;
  }
  console.log(`  Inserted ${tipCount} / ${interviewTips.length} interview tips`);
  totalInserted += tipCount;

  // 2. Interview Common Questions
  console.log("--- Seeding interview_common_question ---");
  let qCount = 0;
  for (let i = 0; i < interviewQuestions.length; i++) {
    const q = interviewQuestions[i];
    const res = await client.query(
      `INSERT INTO interview_common_question (id, question, question_fr, type, field, sample_answer, sample_answer_fr, tips, tips_fr, difficulty, is_active, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (id) DO NOTHING`,
      [
        q.id, q.question, q.question_fr, q.type, q.field,
        q.sample_answer || null, q.sample_answer_fr || null,
        JSON.stringify(q.tips), JSON.stringify(q.tips_fr),
        q.difficulty || "intermediate",
        true, i + 100, now, now,
      ]
    );
    if (res.rowCount > 0) qCount++;
  }
  console.log(`  Inserted ${qCount} / ${interviewQuestions.length} common questions`);
  totalInserted += qCount;

  // 3. Career Market Insights
  console.log("--- Seeding career_market_insight ---");
  let miCount = 0;
  for (let i = 0; i < marketInsights.length; i++) {
    const m = marketInsights[i];
    const res = await client.query(
      `INSERT INTO career_market_insight (title, title_fr, value, icon, color, field, description, description_fr, is_active, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (title) DO NOTHING`,
      [
        m.title, m.title_fr, m.value, m.icon || null, m.color || null,
        m.field || null, m.description || null, m.description_fr || null,
        true, i + 100, now, now,
      ]
    );
    if (res.rowCount > 0) miCount++;
  }
  console.log(`  Inserted ${miCount} / ${marketInsights.length} market insights`);
  totalInserted += miCount;

  // 4. Career Employers
  console.log("--- Seeding career_employer ---");
  let empCount = 0;
  for (let i = 0; i < employers.length; i++) {
    const e = employers[i];
    const res = await client.query(
      `INSERT INTO career_employer (name, sector, sector_fr, location, location_fr, open_positions, website, description, description_fr, fields, is_active, sort_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       ON CONFLICT (name) DO NOTHING`,
      [
        e.name, e.sector, e.sector_fr, e.location, e.location_fr || null,
        e.open_positions || 0, e.website || null,
        e.description || null, e.description_fr || null,
        JSON.stringify(e.fields),
        true, i + 100, now, now,
      ]
    );
    if (res.rowCount > 0) empCount++;
  }
  console.log(`  Inserted ${empCount} / ${employers.length} employers`);
  totalInserted += empCount;

  // 5. Skill Library
  console.log("--- Seeding skill_library ---");
  let skillCount = 0;
  for (let i = 0; i < skills.length; i++) {
    const s = skills[i];
    // Check for existing skill by name+field
    const existing = await client.query(
      `SELECT id FROM skill_library WHERE name = $1 AND field = $2`,
      [s.name, s.field]
    );
    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO skill_library (name, name_fr, field, category, description, description_fr, is_recommended, is_active, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          s.name, s.name_fr, s.field, s.category,
          s.description || null, s.description_fr || null,
          true, true, i + 100, now, now,
        ]
      );
      skillCount++;
    }
  }
  console.log(`  Inserted ${skillCount} / ${skills.length} skills`);
  totalInserted += skillCount;

  // 6. Career Quiz Questions + Options
  console.log("--- Seeding career_quiz_question + career_quiz_option ---");
  let quizQCount = 0;
  let quizOCount = 0;
  for (let i = 0; i < quizQuestions.length; i++) {
    const q = quizQuestions[i];
    const qRes = await client.query(
      `INSERT INTO career_quiz_question (id, quiz_type, question, question_fr, description, description_fr, category, type, trait, is_active, sort_order, created_at, updated_at)
       VALUES ($1, $2::quiz_type, $3, $4, $5, $6, $7, $8::question_type, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        q.id, q.quiz_type, q.question, q.question_fr,
        q.description || null, q.description_fr || null,
        q.category, "multiple_choice", q.trait || null,
        true, i + 100, now, now,
      ]
    );
    if (qRes.rowCount > 0) {
      quizQCount++;
      // Insert options
      for (let j = 0; j < q.options.length; j++) {
        const o = q.options[j];
        const optId = `${q.id}-opt-${j + 1}`;
        const oRes = await client.query(
          `INSERT INTO career_quiz_option (id, question_id, text, text_fr, icon, scores, sort_order, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [
            optId, q.id, o.text, o.text_fr, o.icon || null,
            JSON.stringify(o.scores), j + 1, now,
          ]
        );
        if (oRes.rowCount > 0) quizOCount++;
      }
    }
  }
  console.log(`  Inserted ${quizQCount} / ${quizQuestions.length} quiz questions`);
  console.log(`  Inserted ${quizOCount} quiz options`);
  totalInserted += quizQCount + quizOCount;

  // Final counts
  console.log("\n=== FINAL TABLE COUNTS ===");
  const tables = [
    "interview_tip",
    "interview_common_question",
    "career_market_insight",
    "career_employer",
    "skill_library",
    "career_quiz_question",
    "career_quiz_option",
  ];
  for (const t of tables) {
    const r = await client.query(`SELECT count(*) as cnt FROM "${t}"`);
    console.log(`  ${t}: ${r.rows[0].cnt} total rows`);
  }

  console.log(`\n=== TOTAL NEW ROWS INSERTED: ${totalInserted} ===`);
  await client.end();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
