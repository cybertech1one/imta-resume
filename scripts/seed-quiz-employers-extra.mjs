/**
 * Seed Script: Additional Career Quiz Questions + Employer Data
 *
 * Adds 55 NEW career quiz questions (with 4 options each = 220 options)
 * Adds 85 NEW Moroccan employers
 *
 * All data is bilingual (EN/FR) and uses ON CONFLICT DO NOTHING to avoid duplicates.
 *
 * Usage: node scripts/seed-quiz-employers-extra.mjs
 */

import pg from "pg";
import crypto from "crypto";

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

// ─── QUIZ QUESTIONS ──────────────────────────────────────────────────────────
// Categories: personality, skills, interests, values, work_style
// New prefixes to avoid collision with existing (co-, ent-, fd-, per-, sa-, sit-, ta-, wv-)
// We'll use: ps- (personality), sk- (skills), int- (interests), val- (values), ws- (work_style)

const QUESTIONS = [
  // ─── PERSONALITY (ps-1 to ps-10) ────────────────────────────────────
  {
    id: "ps-1", category: "personality", trait: "introversion_extraversion",
    question: "How do you recharge after a demanding week?",
    question_fr: "Comment vous ressourcez-vous après une semaine exigeante ?",
    options: [
      { text: "Reading alone or watching documentaries at home", text_fr: "Lire seul ou regarder des documentaires à la maison", icon: "BookIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "finance": 2 } },
      { text: "Going out with friends to cafes or events", text_fr: "Sortir avec des amis dans des cafés ou événements", icon: "UsersIcon",
        scores: { "commerce-international": 3, "marketing": 2, "management": 2 } },
      { text: "Doing sports or physical outdoor activities", text_fr: "Faire du sport ou des activités physiques en plein air", icon: "ActivityIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "logistique": 1 } },
      { text: "Working on personal projects or side hustles", text_fr: "Travailler sur des projets personnels ou des initiatives", icon: "RocketIcon",
        scores: { "genie-industriel": 2, "genie-informatique": 2, "management": 3 } },
    ],
  },
  {
    id: "ps-2", category: "personality", trait: "risk_tolerance",
    question: "You're offered two job opportunities. Which do you choose?",
    question_fr: "On vous propose deux opportunités professionnelles. Laquelle choisissez-vous ?",
    options: [
      { text: "A stable government position with guaranteed benefits", text_fr: "Un poste stable dans la fonction publique avec avantages garantis", icon: "ShieldIcon",
        scores: { "genie-civil": 3, "genie-electrique": 2, "ressources-humaines": 2 } },
      { text: "A startup with equity and rapid growth potential", text_fr: "Une startup avec participation et potentiel de croissance rapide", icon: "TrendingUpIcon",
        scores: { "genie-informatique": 3, "commerce-international": 2, "marketing": 2 } },
      { text: "A multinational with structured career progression", text_fr: "Une multinationale avec une progression de carrière structurée", icon: "BuildingIcon",
        scores: { "management": 3, "genie-industriel": 2, "finance": 2 } },
      { text: "Freelancing with full autonomy over your schedule", text_fr: "Le freelance avec une autonomie totale sur votre emploi du temps", icon: "CompassIcon",
        scores: { "genie-informatique": 2, "marketing": 3, "commerce-international": 1 } },
    ],
  },
  {
    id: "ps-3", category: "personality", trait: "decision_making",
    question: "When making an important decision, you tend to...",
    question_fr: "Quand vous prenez une décision importante, vous avez tendance à...",
    options: [
      { text: "Analyze data and statistics before deciding", text_fr: "Analyser les données et statistiques avant de décider", icon: "BarChartIcon",
        scores: { "finance": 3, "genie-informatique": 2, "genie-industriel": 2 } },
      { text: "Trust your gut feeling and intuition", text_fr: "Faire confiance à votre instinct et intuition", icon: "HeartIcon",
        scores: { "marketing": 3, "commerce-international": 2, "management": 1 } },
      { text: "Consult with others and gather diverse opinions", text_fr: "Consulter les autres et recueillir des avis divers", icon: "MessageCircleIcon",
        scores: { "ressources-humaines": 3, "management": 2, "commerce-international": 1 } },
      { text: "Create a structured pros and cons list", text_fr: "Créer une liste structurée d'avantages et inconvénients", icon: "ListIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "finance": 2 } },
    ],
  },
  {
    id: "ps-4", category: "personality", trait: "stress_response",
    question: "When facing a tight deadline, how do you react?",
    question_fr: "Face à une échéance serrée, comment réagissez-vous ?",
    options: [
      { text: "I break the task into smaller manageable pieces", text_fr: "Je découpe la tâche en petites parties gérables", icon: "GridIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "management": 2 } },
      { text: "I work intensely under pressure — it motivates me", text_fr: "Je travaille intensément sous pression — ça me motive", icon: "ZapIcon",
        scores: { "commerce-international": 3, "marketing": 2, "genie-informatique": 1 } },
      { text: "I delegate and coordinate with the team", text_fr: "Je délègue et coordonne avec l'équipe", icon: "UsersIcon",
        scores: { "management": 3, "ressources-humaines": 2, "genie-civil": 1 } },
      { text: "I focus on the technical solution methodically", text_fr: "Je me concentre méthodiquement sur la solution technique", icon: "CpuIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-mecanique": 2 } },
    ],
  },
  {
    id: "ps-5", category: "personality", trait: "creativity_structure",
    question: "Which best describes your ideal workday?",
    question_fr: "Quelle description correspond le mieux à votre journée de travail idéale ?",
    options: [
      { text: "Creative brainstorming and designing new concepts", text_fr: "Brainstorming créatif et conception de nouveaux concepts", icon: "LightbulbIcon",
        scores: { "marketing": 3, "genie-informatique": 2, "genie-mecanique": 1 } },
      { text: "Following clear processes and optimizing efficiency", text_fr: "Suivre des processus clairs et optimiser l'efficacité", icon: "SettingsIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "finance": 2 } },
      { text: "Meeting clients and negotiating deals", text_fr: "Rencontrer des clients et négocier des accords", icon: "HandshakeIcon",
        scores: { "commerce-international": 3, "management": 2, "marketing": 1 } },
      { text: "Solving complex technical problems", text_fr: "Résoudre des problèmes techniques complexes", icon: "WrenchIcon",
        scores: { "genie-electrique": 3, "genie-informatique": 2, "genie-mecanique": 2 } },
    ],
  },
  {
    id: "ps-6", category: "personality", trait: "leadership_style",
    question: "In a group project, you naturally tend to...",
    question_fr: "Dans un projet de groupe, vous avez naturellement tendance à...",
    options: [
      { text: "Take charge and assign roles to team members", text_fr: "Prendre les commandes et attribuer les rôles aux membres", icon: "CrownIcon",
        scores: { "management": 3, "genie-industriel": 2, "commerce-international": 1 } },
      { text: "Be the technical expert who solves the hardest parts", text_fr: "Être l'expert technique qui résout les parties les plus difficiles", icon: "CodeIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-mecanique": 2 } },
      { text: "Ensure everyone is included and motivated", text_fr: "S'assurer que tout le monde est inclus et motivé", icon: "HeartIcon",
        scores: { "ressources-humaines": 3, "management": 2, "marketing": 1 } },
      { text: "Organize the timeline and track progress", text_fr: "Organiser le calendrier et suivre l'avancement", icon: "CalendarIcon",
        scores: { "logistique": 3, "genie-industriel": 2, "finance": 1 } },
    ],
  },
  {
    id: "ps-7", category: "personality", trait: "attention_focus",
    question: "What type of details do you notice most easily?",
    question_fr: "Quel type de détails remarquez-vous le plus facilement ?",
    options: [
      { text: "Numerical errors in spreadsheets or reports", text_fr: "Les erreurs numériques dans les tableaux ou rapports", icon: "TableIcon",
        scores: { "finance": 3, "genie-industriel": 2, "logistique": 2 } },
      { text: "Design flaws in objects or buildings around you", text_fr: "Les défauts de conception dans les objets ou bâtiments autour de vous", icon: "EyeIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "Social dynamics and how people interact", text_fr: "Les dynamiques sociales et comment les gens interagissent", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "marketing": 2, "management": 2 } },
      { text: "Bugs or logical inconsistencies in systems", text_fr: "Les bugs ou incohérences logiques dans les systèmes", icon: "BugIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
    ],
  },
  {
    id: "ps-8", category: "personality", trait: "adaptability",
    question: "How do you handle unexpected changes to your plans?",
    question_fr: "Comment gérez-vous les changements inattendus dans vos plans ?",
    options: [
      { text: "I adapt quickly and see it as an opportunity", text_fr: "Je m'adapte rapidement et vois cela comme une opportunité", icon: "RefreshIcon",
        scores: { "commerce-international": 3, "marketing": 2, "management": 2 } },
      { text: "I analyze the impact before adjusting my approach", text_fr: "J'analyse l'impact avant d'ajuster mon approche", icon: "SearchIcon",
        scores: { "genie-industriel": 3, "finance": 2, "logistique": 2 } },
      { text: "I prefer to stick to the original plan when possible", text_fr: "Je préfère m'en tenir au plan initial quand c'est possible", icon: "AnchorIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "I consult my team to find the best new direction", text_fr: "Je consulte mon équipe pour trouver la meilleure nouvelle direction", icon: "MessageSquareIcon",
        scores: { "ressources-humaines": 3, "management": 2, "genie-industriel": 1 } },
    ],
  },
  {
    id: "ps-9", category: "personality", trait: "learning_preference",
    question: "How do you prefer to learn something new?",
    question_fr: "Comment préférez-vous apprendre quelque chose de nouveau ?",
    options: [
      { text: "Watching tutorials and visual demonstrations", text_fr: "Regarder des tutoriels et démonstrations visuelles", icon: "PlayIcon",
        scores: { "genie-informatique": 2, "marketing": 3, "genie-electrique": 1 } },
      { text: "Reading documentation and textbooks thoroughly", text_fr: "Lire la documentation et les manuels en profondeur", icon: "BookOpenIcon",
        scores: { "finance": 3, "genie-industriel": 2, "logistique": 1 } },
      { text: "Hands-on experimentation and building prototypes", text_fr: "Expérimentation pratique et construction de prototypes", icon: "HammerIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-informatique": 2 } },
      { text: "Discussing with experts and attending workshops", text_fr: "Discuter avec des experts et assister à des ateliers", icon: "MicIcon",
        scores: { "management": 2, "commerce-international": 2, "ressources-humaines": 3 } },
    ],
  },
  {
    id: "ps-10", category: "personality", trait: "conflict_resolution",
    question: "When two colleagues disagree, you tend to...",
    question_fr: "Quand deux collègues sont en désaccord, vous avez tendance à...",
    options: [
      { text: "Mediate and find a compromise both can accept", text_fr: "Servir de médiateur et trouver un compromis acceptable pour les deux", icon: "ScaleIcon",
        scores: { "ressources-humaines": 3, "management": 2, "commerce-international": 1 } },
      { text: "Present objective data to settle the matter", text_fr: "Présenter des données objectives pour trancher", icon: "BarChart2Icon",
        scores: { "finance": 3, "genie-industriel": 2, "genie-informatique": 1 } },
      { text: "Support the position that is technically correct", text_fr: "Soutenir la position qui est techniquement correcte", icon: "CheckCircleIcon",
        scores: { "genie-electrique": 3, "genie-mecanique": 2, "genie-informatique": 2 } },
      { text: "Redirect focus to the project goals and deadlines", text_fr: "Recentrer le focus sur les objectifs et échéances du projet", icon: "TargetIcon",
        scores: { "logistique": 3, "management": 2, "genie-civil": 1 } },
    ],
  },

  // ─── SKILLS (sk-1 to sk-12) ─────────────────────────────────────────
  {
    id: "sk-1", category: "skills", trait: "technical_problem_solving",
    question: "A production machine suddenly stops working. What do you do first?",
    question_fr: "Une machine de production s'arrête soudainement. Que faites-vous en premier ?",
    options: [
      { text: "Check error codes and run diagnostics", text_fr: "Vérifier les codes d'erreur et lancer un diagnostic", icon: "MonitorIcon",
        scores: { "genie-electrique": 3, "genie-informatique": 2, "genie-industriel": 2 } },
      { text: "Inspect the mechanical components physically", text_fr: "Inspecter physiquement les composants mécaniques", icon: "WrenchIcon",
        scores: { "genie-mecanique": 3, "genie-industriel": 2, "genie-civil": 1 } },
      { text: "Review the production logs and recent changes", text_fr: "Examiner les journaux de production et les changements récents", icon: "FileTextIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "genie-informatique": 1 } },
      { text: "Coordinate with the maintenance team immediately", text_fr: "Coordonner immédiatement avec l'équipe de maintenance", icon: "PhoneIcon",
        scores: { "management": 3, "ressources-humaines": 2, "logistique": 2 } },
    ],
  },
  {
    id: "sk-2", category: "skills", trait: "data_analysis",
    question: "You receive a large dataset. What excites you most?",
    question_fr: "Vous recevez un grand jeu de données. Qu'est-ce qui vous enthousiasme le plus ?",
    options: [
      { text: "Building visualizations and dashboards", text_fr: "Créer des visualisations et tableaux de bord", icon: "PieChartIcon",
        scores: { "genie-informatique": 3, "marketing": 2, "finance": 1 } },
      { text: "Finding hidden patterns and correlations", text_fr: "Trouver des patterns cachés et des corrélations", icon: "SearchIcon",
        scores: { "finance": 3, "genie-industriel": 2, "genie-informatique": 2 } },
      { text: "Making business recommendations from insights", text_fr: "Faire des recommandations business à partir des insights", icon: "TrendingUpIcon",
        scores: { "management": 3, "commerce-international": 2, "marketing": 2 } },
      { text: "Optimizing processes based on the findings", text_fr: "Optimiser les processus en fonction des résultats", icon: "SettingsIcon",
        scores: { "genie-industriel": 3, "logistique": 3, "genie-mecanique": 1 } },
    ],
  },
  {
    id: "sk-3", category: "skills", trait: "communication",
    question: "You need to explain a complex technical concept to non-experts. How?",
    question_fr: "Vous devez expliquer un concept technique complexe à des non-experts. Comment ?",
    options: [
      { text: "Use analogies from everyday life", text_fr: "Utiliser des analogies de la vie quotidienne", icon: "LightbulbIcon",
        scores: { "marketing": 3, "commerce-international": 2, "ressources-humaines": 2 } },
      { text: "Draw diagrams and visual representations", text_fr: "Dessiner des diagrammes et représentations visuelles", icon: "PenToolIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-informatique": 1 } },
      { text: "Show a working demo or prototype", text_fr: "Montrer une démo ou un prototype fonctionnel", icon: "PlayCircleIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-mecanique": 1 } },
      { text: "Write a structured step-by-step document", text_fr: "Rédiger un document structuré étape par étape", icon: "FileTextIcon",
        scores: { "genie-industriel": 2, "logistique": 2, "finance": 3 } },
    ],
  },
  {
    id: "sk-4", category: "skills", trait: "project_management",
    question: "You're managing a project that's behind schedule. What's your priority?",
    question_fr: "Vous gérez un projet en retard. Quelle est votre priorité ?",
    options: [
      { text: "Identify bottlenecks and reallocate resources", text_fr: "Identifier les goulots d'étranglement et réallouer les ressources", icon: "GitBranchIcon",
        scores: { "genie-industriel": 3, "management": 2, "logistique": 2 } },
      { text: "Negotiate scope changes with the client", text_fr: "Négocier des changements de périmètre avec le client", icon: "MessageCircleIcon",
        scores: { "commerce-international": 3, "management": 2, "marketing": 1 } },
      { text: "Implement automation to speed up repetitive tasks", text_fr: "Implémenter l'automatisation pour accélérer les tâches répétitives", icon: "CpuIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 2 } },
      { text: "Review the budget and find cost efficiencies", text_fr: "Réviser le budget et trouver des économies", icon: "DollarSignIcon",
        scores: { "finance": 3, "logistique": 2, "management": 1 } },
    ],
  },
  {
    id: "sk-5", category: "skills", trait: "negotiation",
    question: "A supplier raises their prices by 20%. What's your approach?",
    question_fr: "Un fournisseur augmente ses prix de 20%. Quelle est votre approche ?",
    options: [
      { text: "Research alternative suppliers for leverage", text_fr: "Rechercher des fournisseurs alternatifs pour avoir un levier", icon: "SearchIcon",
        scores: { "logistique": 3, "commerce-international": 2, "genie-industriel": 1 } },
      { text: "Negotiate a long-term contract with volume discounts", text_fr: "Négocier un contrat à long terme avec remises de volume", icon: "FileSignatureIcon",
        scores: { "commerce-international": 3, "finance": 2, "management": 2 } },
      { text: "Analyze if internal production would be more cost-effective", text_fr: "Analyser si la production interne serait plus rentable", icon: "FactoryIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "finance": 2 } },
      { text: "Find a way to reduce material usage through innovation", text_fr: "Trouver un moyen de réduire l'utilisation de matériaux par l'innovation", icon: "LightbulbIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-informatique": 1 } },
    ],
  },
  {
    id: "sk-6", category: "skills", trait: "digital_literacy",
    question: "Which digital tool would you most enjoy mastering?",
    question_fr: "Quel outil numérique aimeriez-vous le plus maîtriser ?",
    options: [
      { text: "CAD/CAM software for 3D design and modeling", text_fr: "Logiciel CAO/FAO pour la conception et modélisation 3D", icon: "BoxIcon",
        scores: { "genie-mecanique": 3, "genie-civil": 3, "genie-industriel": 1 } },
      { text: "Programming languages like Python or JavaScript", text_fr: "Langages de programmation comme Python ou JavaScript", icon: "CodeIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "finance": 1 } },
      { text: "ERP systems like SAP or Oracle", text_fr: "Systèmes ERP comme SAP ou Oracle", icon: "DatabaseIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "management": 2 } },
      { text: "CRM and marketing automation platforms", text_fr: "Plateformes CRM et d'automatisation marketing", icon: "MailIcon",
        scores: { "marketing": 3, "commerce-international": 2, "management": 1 } },
    ],
  },
  {
    id: "sk-7", category: "skills", trait: "spatial_reasoning",
    question: "You're asked to plan the layout of a new factory floor. You...",
    question_fr: "On vous demande de planifier l'aménagement d'un nouveau site industriel. Vous...",
    options: [
      { text: "Model material flow and optimize production lines", text_fr: "Modéliser les flux de matériaux et optimiser les lignes de production", icon: "GitMergeIcon",
        scores: { "genie-industriel": 3, "logistique": 3, "genie-mecanique": 1 } },
      { text: "Design the electrical and HVAC systems first", text_fr: "Concevoir d'abord les systèmes électriques et CVC", icon: "ZapIcon",
        scores: { "genie-electrique": 3, "genie-civil": 2, "genie-mecanique": 1 } },
      { text: "Focus on structural integrity and safety compliance", text_fr: "Se concentrer sur l'intégrité structurelle et la conformité sécurité", icon: "ShieldIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-industriel": 1 } },
      { text: "Calculate the budget and ROI for each option", text_fr: "Calculer le budget et le retour sur investissement pour chaque option", icon: "CalculatorIcon",
        scores: { "finance": 3, "management": 2, "genie-industriel": 1 } },
    ],
  },
  {
    id: "sk-8", category: "skills", trait: "research_methodology",
    question: "How would you approach solving a quality control issue in manufacturing?",
    question_fr: "Comment aborderiez-vous un problème de contrôle qualité en fabrication ?",
    options: [
      { text: "Apply statistical process control (SPC) methods", text_fr: "Appliquer des méthodes de contrôle statistique des processus (SPC)", icon: "BarChartIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "finance": 1 } },
      { text: "Inspect raw materials and component specifications", text_fr: "Inspecter les matières premières et spécifications des composants", icon: "SearchIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-civil": 1 } },
      { text: "Interview operators and review the production process", text_fr: "Interroger les opérateurs et revoir le processus de production", icon: "UsersIcon",
        scores: { "management": 3, "ressources-humaines": 2, "genie-industriel": 1 } },
      { text: "Write automated testing scripts for the defect pattern", text_fr: "Écrire des scripts de tests automatisés pour le pattern de défaut", icon: "TerminalIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "genie-industriel": 2 } },
    ],
  },
  {
    id: "sk-9", category: "skills", trait: "financial_acumen",
    question: "Your department is asked to cut costs by 15%. What do you propose?",
    question_fr: "On demande à votre département de réduire les coûts de 15%. Que proposez-vous ?",
    options: [
      { text: "Automate manual processes to reduce labor costs", text_fr: "Automatiser les processus manuels pour réduire les coûts de main-d'œuvre", icon: "CpuIcon",
        scores: { "genie-informatique": 3, "genie-industriel": 2, "genie-electrique": 1 } },
      { text: "Renegotiate supplier contracts and bulk purchasing", text_fr: "Renégocier les contrats fournisseurs et achats en gros", icon: "HandshakeIcon",
        scores: { "commerce-international": 3, "logistique": 2, "finance": 2 } },
      { text: "Lean management — eliminate waste in every process", text_fr: "Lean management — éliminer le gaspillage dans chaque processus", icon: "MinimizeIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "management": 2 } },
      { text: "Restructure teams and optimize workforce allocation", text_fr: "Restructurer les équipes et optimiser l'allocation de la main-d'œuvre", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "management": 2, "finance": 2 } },
    ],
  },
  {
    id: "sk-10", category: "skills", trait: "innovation",
    question: "Your company wants to launch an innovative new product. Your role?",
    question_fr: "Votre entreprise veut lancer un nouveau produit innovant. Votre rôle ?",
    options: [
      { text: "Design the product using simulation and prototyping", text_fr: "Concevoir le produit en utilisant simulation et prototypage", icon: "BoxIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-informatique": 1 } },
      { text: "Conduct market research and competitive analysis", text_fr: "Réaliser une étude de marché et analyse concurrentielle", icon: "SearchIcon",
        scores: { "marketing": 3, "commerce-international": 2, "finance": 1 } },
      { text: "Plan the production line and supply chain", text_fr: "Planifier la ligne de production et la chaîne d'approvisionnement", icon: "TruckIcon",
        scores: { "genie-industriel": 3, "logistique": 3, "genie-mecanique": 1 } },
      { text: "Develop the software and IoT integration", text_fr: "Développer le logiciel et l'intégration IoT", icon: "WifiIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
    ],
  },
  {
    id: "sk-11", category: "skills", trait: "language_proficiency",
    question: "In a meeting with international partners, you feel most confident...",
    question_fr: "Dans une réunion avec des partenaires internationaux, vous vous sentez le plus à l'aise...",
    options: [
      { text: "Presenting technical specifications and blueprints", text_fr: "Présenter des spécifications techniques et plans", icon: "FileIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 2 } },
      { text: "Negotiating contract terms in multiple languages", text_fr: "Négocier les termes du contrat en plusieurs langues", icon: "GlobeIcon",
        scores: { "commerce-international": 3, "management": 2, "finance": 1 } },
      { text: "Demonstrating the product's digital features", text_fr: "Démontrer les fonctionnalités numériques du produit", icon: "SmartphoneIcon",
        scores: { "genie-informatique": 3, "marketing": 2, "genie-electrique": 1 } },
      { text: "Building relationships and understanding cultural nuances", text_fr: "Construire des relations et comprendre les nuances culturelles", icon: "HeartIcon",
        scores: { "ressources-humaines": 3, "commerce-international": 2, "marketing": 2 } },
    ],
  },
  {
    id: "sk-12", category: "skills", trait: "sustainability",
    question: "How would you make a factory more environmentally sustainable?",
    question_fr: "Comment rendriez-vous une usine plus durable sur le plan environnemental ?",
    options: [
      { text: "Install solar panels and energy recovery systems", text_fr: "Installer des panneaux solaires et systèmes de récupération d'énergie", icon: "SunIcon",
        scores: { "genie-electrique": 3, "genie-civil": 2, "genie-mecanique": 1 } },
      { text: "Implement circular economy and waste reduction programs", text_fr: "Mettre en place l'économie circulaire et des programmes de réduction des déchets", icon: "RecycleIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "management": 1 } },
      { text: "Develop smart monitoring software for resource usage", text_fr: "Développer un logiciel de monitoring intelligent pour l'utilisation des ressources", icon: "MonitorIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
      { text: "Create a sustainability report and carbon offset strategy", text_fr: "Créer un rapport de durabilité et stratégie de compensation carbone", icon: "FileTextIcon",
        scores: { "finance": 3, "management": 2, "commerce-international": 1 } },
    ],
  },

  // ─── INTERESTS (int-1 to int-12) ────────────────────────────────────
  {
    id: "int-1", category: "interests", trait: "technology_affinity",
    question: "Which technology trend excites you the most?",
    question_fr: "Quelle tendance technologique vous enthousiasme le plus ?",
    options: [
      { text: "Artificial Intelligence and Machine Learning", text_fr: "Intelligence Artificielle et Machine Learning", icon: "BrainIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
      { text: "Renewable energy and green hydrogen", text_fr: "Énergie renouvelable et hydrogène vert", icon: "SunIcon",
        scores: { "genie-electrique": 3, "genie-civil": 2, "genie-mecanique": 1 } },
      { text: "Smart cities and urban infrastructure", text_fr: "Villes intelligentes et infrastructures urbaines", icon: "BuildingIcon",
        scores: { "genie-civil": 3, "genie-electrique": 2, "genie-informatique": 1 } },
      { text: "Blockchain and fintech innovations", text_fr: "Blockchain et innovations fintech", icon: "LinkIcon",
        scores: { "finance": 3, "genie-informatique": 2, "commerce-international": 1 } },
    ],
  },
  {
    id: "int-2", category: "interests", trait: "industry_preference",
    question: "If you could visit any workplace for a day, which would it be?",
    question_fr: "Si vous pouviez visiter un lieu de travail pour une journée, lequel serait-ce ?",
    options: [
      { text: "An automotive assembly plant like Renault Tangier", text_fr: "Une usine d'assemblage automobile comme Renault Tanger", icon: "CarIcon",
        scores: { "genie-mecanique": 3, "genie-industriel": 2, "genie-electrique": 1 } },
      { text: "A tech company's innovation lab in Casablanca", text_fr: "Le laboratoire d'innovation d'une entreprise tech à Casablanca", icon: "CpuIcon",
        scores: { "genie-informatique": 3, "marketing": 1, "genie-electrique": 1 } },
      { text: "A major construction site like Nador West Med port", text_fr: "Un grand chantier comme le port Nador West Med", icon: "HardHatIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 1, "logistique": 2 } },
      { text: "A banking trading floor or investment firm", text_fr: "Une salle de marché bancaire ou société d'investissement", icon: "DollarSignIcon",
        scores: { "finance": 3, "commerce-international": 2, "management": 1 } },
    ],
  },
  {
    id: "int-3", category: "interests", trait: "hobby_alignment",
    question: "Which hobby or activity do you enjoy most in your free time?",
    question_fr: "Quel passe-temps ou activité appréciez-vous le plus pendant votre temps libre ?",
    options: [
      { text: "Building electronics, Arduino, or Raspberry Pi projects", text_fr: "Construire des projets électroniques, Arduino ou Raspberry Pi", icon: "CpuIcon",
        scores: { "genie-electrique": 3, "genie-informatique": 2, "genie-mecanique": 1 } },
      { text: "Reading about business, economics, or current affairs", text_fr: "Lire sur le business, l'économie ou l'actualité", icon: "NewspaperIcon",
        scores: { "finance": 3, "commerce-international": 2, "management": 2 } },
      { text: "Volunteering or organizing community events", text_fr: "Faire du bénévolat ou organiser des événements communautaires", icon: "HeartIcon",
        scores: { "ressources-humaines": 3, "marketing": 2, "management": 1 } },
      { text: "Tinkering with cars, bikes, or 3D printing", text_fr: "Bricoler des voitures, motos ou faire de l'impression 3D", icon: "WrenchIcon",
        scores: { "genie-mecanique": 3, "genie-industriel": 2, "genie-civil": 1 } },
    ],
  },
  {
    id: "int-4", category: "interests", trait: "content_consumption",
    question: "What type of YouTube channels or podcasts do you follow?",
    question_fr: "Quel type de chaînes YouTube ou podcasts suivez-vous ?",
    options: [
      { text: "Tech reviews, coding tutorials, AI news", text_fr: "Critiques tech, tutoriels de code, actualités IA", icon: "MonitorIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "marketing": 1 } },
      { text: "Engineering and science explainers (like Practical Engineering)", text_fr: "Explications d'ingénierie et science (comme Practical Engineering)", icon: "BookOpenIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "Business strategy, startups, and finance", text_fr: "Stratégie business, startups et finance", icon: "TrendingUpIcon",
        scores: { "management": 3, "finance": 2, "commerce-international": 2 } },
      { text: "Design, branding, and marketing trends", text_fr: "Design, branding et tendances marketing", icon: "PaletteIcon",
        scores: { "marketing": 3, "commerce-international": 1, "genie-informatique": 1 } },
    ],
  },
  {
    id: "int-5", category: "interests", trait: "morocco_development",
    question: "Which Moroccan national project interests you the most?",
    question_fr: "Quel projet national marocain vous intéresse le plus ?",
    options: [
      { text: "Noor Solar Complex in Ouarzazate", text_fr: "Le complexe solaire Noor à Ouarzazate", icon: "SunIcon",
        scores: { "genie-electrique": 3, "genie-civil": 2, "genie-mecanique": 1 } },
      { text: "Tanger Med port and free zone ecosystem", text_fr: "Le port Tanger Med et son écosystème de zones franches", icon: "AnchorIcon",
        scores: { "logistique": 3, "commerce-international": 2, "genie-civil": 1 } },
      { text: "Digital Morocco 2030 strategy", text_fr: "La stratégie Maroc Digital 2030", icon: "GlobeIcon",
        scores: { "genie-informatique": 3, "management": 2, "marketing": 1 } },
      { text: "OCP's industrial transformation and UM6P", text_fr: "La transformation industrielle d'OCP et l'UM6P", icon: "FactoryIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "finance": 1 } },
    ],
  },
  {
    id: "int-6", category: "interests", trait: "global_engagement",
    question: "If you could work abroad for 2 years, which destination?",
    question_fr: "Si vous pouviez travailler à l'étranger pendant 2 ans, quelle destination ?",
    options: [
      { text: "Silicon Valley, USA — tech innovation hub", text_fr: "Silicon Valley, USA — pôle d'innovation tech", icon: "MapPinIcon",
        scores: { "genie-informatique": 3, "marketing": 2, "management": 1 } },
      { text: "Dubai, UAE — mega-infrastructure projects", text_fr: "Dubaï, ÉAU — méga-projets d'infrastructure", icon: "BuildingIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "finance": 1 } },
      { text: "Frankfurt, Germany — industrial engineering excellence", text_fr: "Francfort, Allemagne — excellence en ingénierie industrielle", icon: "FactoryIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "London, UK — global finance and consulting", text_fr: "Londres, Royaume-Uni — finance et conseil mondial", icon: "GlobeIcon",
        scores: { "finance": 3, "commerce-international": 2, "management": 2 } },
    ],
  },
  {
    id: "int-7", category: "interests", trait: "social_impact",
    question: "Which cause would you most want your career to contribute to?",
    question_fr: "À quelle cause aimeriez-vous que votre carrière contribue le plus ?",
    options: [
      { text: "Clean water and sanitation for rural communities", text_fr: "Eau potable et assainissement pour les communautés rurales", icon: "DropletIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "Digital inclusion and bridging the tech gap", text_fr: "Inclusion numérique et réduction de la fracture technologique", icon: "WifiIcon",
        scores: { "genie-informatique": 3, "marketing": 1, "genie-electrique": 2 } },
      { text: "Youth employment and workforce development", text_fr: "Emploi des jeunes et développement de la main-d'œuvre", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "management": 2, "commerce-international": 1 } },
      { text: "Industrial modernization and economic growth", text_fr: "Modernisation industrielle et croissance économique", icon: "TrendingUpIcon",
        scores: { "genie-industriel": 3, "finance": 2, "logistique": 2 } },
    ],
  },
  {
    id: "int-8", category: "interests", trait: "academic_interest",
    question: "Which university course would you choose as an elective?",
    question_fr: "Quel cours universitaire choisiriez-vous comme option ?",
    options: [
      { text: "Artificial Intelligence and Deep Learning", text_fr: "Intelligence Artificielle et Deep Learning", icon: "BrainIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "genie-industriel": 1 } },
      { text: "Supply Chain Management and Operations Research", text_fr: "Gestion de la chaîne logistique et recherche opérationnelle", icon: "TruckIcon",
        scores: { "logistique": 3, "genie-industriel": 2, "commerce-international": 1 } },
      { text: "International Business Law and Trade Finance", text_fr: "Droit des affaires internationales et financement du commerce", icon: "ScaleIcon",
        scores: { "commerce-international": 3, "finance": 2, "management": 1 } },
      { text: "Materials Science and Nanotechnology", text_fr: "Science des matériaux et nanotechnologie", icon: "AtomIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-civil": 1 } },
    ],
  },
  {
    id: "int-9", category: "interests", trait: "startup_interest",
    question: "If you founded a startup in Morocco, what would it be?",
    question_fr: "Si vous fondiez une startup au Maroc, ce serait dans quel domaine ?",
    options: [
      { text: "A fintech app for mobile payments and microloans", text_fr: "Une appli fintech pour paiements mobiles et microcrédits", icon: "SmartphoneIcon",
        scores: { "genie-informatique": 3, "finance": 2, "marketing": 1 } },
      { text: "An agritech company optimizing Moroccan farming", text_fr: "Une entreprise agritech optimisant l'agriculture marocaine", icon: "LeafIcon",
        scores: { "genie-industriel": 2, "genie-mecanique": 2, "genie-electrique": 2 } },
      { text: "A logistics platform connecting Moroccan exporters", text_fr: "Une plateforme logistique connectant les exportateurs marocains", icon: "TruckIcon",
        scores: { "logistique": 3, "commerce-international": 2, "genie-informatique": 1 } },
      { text: "A consulting firm for African market expansion", text_fr: "Un cabinet de conseil pour l'expansion sur le marché africain", icon: "GlobeIcon",
        scores: { "management": 3, "commerce-international": 2, "finance": 1 } },
    ],
  },
  {
    id: "int-10", category: "interests", trait: "reading_preference",
    question: "Which book would you pick up first?",
    question_fr: "Quel livre choisiriez-vous en premier ?",
    options: [
      { text: "Clean Code by Robert C. Martin", text_fr: "Clean Code de Robert C. Martin", icon: "CodeIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "genie-industriel": 1 } },
      { text: "Thinking, Fast and Slow by Daniel Kahneman", text_fr: "Système 1 / Système 2 de Daniel Kahneman", icon: "BrainIcon",
        scores: { "finance": 3, "management": 2, "marketing": 1 } },
      { text: "The Toyota Way by Jeffrey Liker", text_fr: "Le Modèle Toyota de Jeffrey Liker", icon: "FactoryIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "genie-mecanique": 2 } },
      { text: "Built to Last by Jim Collins", text_fr: "Bâties pour durer de Jim Collins", icon: "BuildingIcon",
        scores: { "management": 3, "commerce-international": 1, "ressources-humaines": 2 } },
    ],
  },
  {
    id: "int-11", category: "interests", trait: "competition_preference",
    question: "Which student competition would you enter?",
    question_fr: "À quelle compétition étudiante participeriez-vous ?",
    options: [
      { text: "Hackathon (coding challenge over a weekend)", text_fr: "Hackathon (défi de programmation sur un week-end)", icon: "TerminalIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "marketing": 1 } },
      { text: "Formula Student (design and race an electric car)", text_fr: "Formula Student (concevoir et piloter une voiture électrique)", icon: "CarIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
      { text: "Business case competition (strategy challenge)", text_fr: "Compétition de cas business (défi stratégique)", icon: "BriefcaseIcon",
        scores: { "management": 3, "finance": 2, "commerce-international": 2 } },
      { text: "Bridge design contest (structural engineering)", text_fr: "Concours de conception de pont (génie des structures)", icon: "GitBranchIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-industriel": 1 } },
    ],
  },
  {
    id: "int-12", category: "interests", trait: "work_environment_preference",
    question: "Where would you ideally spend most of your workday?",
    question_fr: "Où passeriez-vous idéalement la majeure partie de votre journée de travail ?",
    options: [
      { text: "In front of multiple screens writing code or analyzing data", text_fr: "Devant plusieurs écrans à écrire du code ou analyser des données", icon: "MonitorIcon",
        scores: { "genie-informatique": 3, "finance": 2, "genie-electrique": 1 } },
      { text: "On a construction site supervising progress", text_fr: "Sur un chantier supervisant l'avancement", icon: "HardHatIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 1, "logistique": 1 } },
      { text: "In meetings with clients and partners", text_fr: "En réunions avec des clients et partenaires", icon: "UsersIcon",
        scores: { "commerce-international": 3, "management": 2, "marketing": 2 } },
      { text: "In a factory optimizing production processes", text_fr: "Dans une usine optimisant les processus de production", icon: "SettingsIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "logistique": 2 } },
    ],
  },

  // ─── VALUES (val-1 to val-10) ───────────────────────────────────────
  {
    id: "val-1", category: "values", trait: "career_priority",
    question: "What matters most to you in your career?",
    question_fr: "Qu'est-ce qui compte le plus pour vous dans votre carrière ?",
    options: [
      { text: "High salary and financial security", text_fr: "Salaire élevé et sécurité financière", icon: "DollarSignIcon",
        scores: { "finance": 3, "genie-informatique": 2, "commerce-international": 1 } },
      { text: "Making a positive impact on society", text_fr: "Avoir un impact positif sur la société", icon: "HeartIcon",
        scores: { "genie-civil": 2, "ressources-humaines": 3, "genie-electrique": 1 } },
      { text: "Continuous learning and intellectual growth", text_fr: "Apprentissage continu et croissance intellectuelle", icon: "BookIcon",
        scores: { "genie-informatique": 2, "genie-industriel": 2, "genie-electrique": 2 } },
      { text: "Recognition and career advancement", text_fr: "Reconnaissance et avancement de carrière", icon: "AwardIcon",
        scores: { "management": 3, "marketing": 2, "commerce-international": 1 } },
    ],
  },
  {
    id: "val-2", category: "values", trait: "work_life_balance",
    question: "How do you view work-life balance?",
    question_fr: "Comment percevez-vous l'équilibre vie professionnelle - vie personnelle ?",
    options: [
      { text: "I want clear boundaries — work stays at work", text_fr: "Je veux des limites claires — le travail reste au travail", icon: "ClockIcon",
        scores: { "genie-civil": 2, "ressources-humaines": 3, "logistique": 2 } },
      { text: "I'm happy working long hours if the work is passionate", text_fr: "Je suis content de travailler de longues heures si le travail est passionnant", icon: "FlameIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "marketing": 2 } },
      { text: "I prefer flexible hours, even if total hours are the same", text_fr: "Je préfère des horaires flexibles, même si le total d'heures est le même", icon: "RefreshIcon",
        scores: { "genie-informatique": 2, "commerce-international": 2, "marketing": 3 } },
      { text: "Efficiency matters — work smart, not long", text_fr: "L'efficacité compte — travailler intelligemment, pas longtemps", icon: "ZapIcon",
        scores: { "genie-industriel": 3, "management": 2, "finance": 1 } },
    ],
  },
  {
    id: "val-3", category: "values", trait: "ethical_priority",
    question: "Which ethical aspect of a company matters most to you?",
    question_fr: "Quel aspect éthique d'une entreprise vous importe le plus ?",
    options: [
      { text: "Environmental sustainability and carbon neutrality", text_fr: "Durabilité environnementale et neutralité carbone", icon: "LeafIcon",
        scores: { "genie-electrique": 3, "genie-civil": 2, "genie-industriel": 1 } },
      { text: "Fair treatment and inclusion of all employees", text_fr: "Traitement équitable et inclusion de tous les employés", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "management": 2, "marketing": 1 } },
      { text: "Transparent governance and anti-corruption", text_fr: "Gouvernance transparente et lutte contre la corruption", icon: "EyeIcon",
        scores: { "finance": 3, "management": 2, "commerce-international": 1 } },
      { text: "Innovation that genuinely improves people's lives", text_fr: "Innovation qui améliore véritablement la vie des gens", icon: "LightbulbIcon",
        scores: { "genie-informatique": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
    ],
  },
  {
    id: "val-4", category: "values", trait: "teamwork_independence",
    question: "Which work arrangement do you thrive in?",
    question_fr: "Dans quel mode de travail vous épanouissez-vous ?",
    options: [
      { text: "Large teams with clearly defined roles", text_fr: "Grandes équipes avec des rôles clairement définis", icon: "GridIcon",
        scores: { "genie-civil": 3, "genie-industriel": 2, "logistique": 2 } },
      { text: "Small agile teams with shared responsibilities", text_fr: "Petites équipes agiles avec responsabilités partagées", icon: "UsersIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 1, "marketing": 2 } },
      { text: "Mostly independent with occasional collaboration", text_fr: "Principalement indépendant avec collaboration occasionnelle", icon: "UserIcon",
        scores: { "finance": 2, "genie-informatique": 2, "genie-mecanique": 3 } },
      { text: "Cross-functional teams spanning multiple departments", text_fr: "Équipes transversales couvrant plusieurs départements", icon: "GitMergeIcon",
        scores: { "management": 3, "commerce-international": 2, "ressources-humaines": 2 } },
    ],
  },
  {
    id: "val-5", category: "values", trait: "geographic_preference",
    question: "Where in Morocco would you prefer to build your career?",
    question_fr: "Où au Maroc préféreriez-vous construire votre carrière ?",
    options: [
      { text: "Casablanca — economic capital with maximum opportunities", text_fr: "Casablanca — capitale économique avec maximum d'opportunités", icon: "BuildingIcon",
        scores: { "finance": 3, "management": 2, "commerce-international": 2 } },
      { text: "Tangier — growing industrial and logistics hub", text_fr: "Tanger — pôle industriel et logistique en croissance", icon: "AnchorIcon",
        scores: { "logistique": 3, "genie-industriel": 2, "genie-mecanique": 2 } },
      { text: "Rabat — government, R&D, and public institutions", text_fr: "Rabat — gouvernement, R&D et institutions publiques", icon: "LandmarkIcon",
        scores: { "genie-civil": 2, "ressources-humaines": 2, "genie-informatique": 2 } },
      { text: "Marrakech or Agadir — tourism and growing tech scene", text_fr: "Marrakech ou Agadir — tourisme et scène tech en croissance", icon: "SunIcon",
        scores: { "marketing": 3, "commerce-international": 2, "genie-electrique": 1 } },
    ],
  },
  {
    id: "val-6", category: "values", trait: "mentorship",
    question: "What kind of manager do you want to work under?",
    question_fr: "Quel type de manager souhaitez-vous avoir ?",
    options: [
      { text: "A technical expert who teaches by example", text_fr: "Un expert technique qui enseigne par l'exemple", icon: "CodeIcon",
        scores: { "genie-informatique": 2, "genie-electrique": 3, "genie-mecanique": 2 } },
      { text: "A visionary leader who inspires big thinking", text_fr: "Un leader visionnaire qui inspire une réflexion ambitieuse", icon: "CompassIcon",
        scores: { "management": 3, "commerce-international": 2, "marketing": 2 } },
      { text: "A supportive coach who invests in your growth", text_fr: "Un coach bienveillant qui investit dans votre développement", icon: "HeartIcon",
        scores: { "ressources-humaines": 3, "management": 1, "genie-civil": 1 } },
      { text: "A results-driven manager who rewards performance", text_fr: "Un manager orienté résultats qui récompense la performance", icon: "TargetIcon",
        scores: { "finance": 3, "logistique": 2, "genie-industriel": 2 } },
    ],
  },
  {
    id: "val-7", category: "values", trait: "company_size",
    question: "What size company do you want to work for?",
    question_fr: "Dans quelle taille d'entreprise souhaitez-vous travailler ?",
    options: [
      { text: "A large corporation (1000+ employees) for stability", text_fr: "Une grande entreprise (1000+ employés) pour la stabilité", icon: "BuildingIcon",
        scores: { "genie-civil": 2, "genie-industriel": 2, "logistique": 3 } },
      { text: "A medium company (100-1000) for balance", text_fr: "Une entreprise moyenne (100-1000) pour l'équilibre", icon: "LayoutIcon",
        scores: { "genie-mecanique": 2, "genie-electrique": 2, "ressources-humaines": 2 } },
      { text: "A startup (under 50) for rapid growth", text_fr: "Une startup (moins de 50) pour une croissance rapide", icon: "RocketIcon",
        scores: { "genie-informatique": 3, "marketing": 2, "commerce-international": 1 } },
      { text: "My own company — I want to be an entrepreneur", text_fr: "Ma propre entreprise — je veux être entrepreneur", icon: "StarIcon",
        scores: { "management": 3, "commerce-international": 2, "finance": 2 } },
    ],
  },
  {
    id: "val-8", category: "values", trait: "compensation_preference",
    question: "Which compensation package appeals to you most?",
    question_fr: "Quelle formule de rémunération vous attire le plus ?",
    options: [
      { text: "High fixed salary with job security", text_fr: "Salaire fixe élevé avec sécurité de l'emploi", icon: "LockIcon",
        scores: { "genie-civil": 3, "genie-electrique": 2, "genie-mecanique": 2 } },
      { text: "Lower base but performance bonuses and commissions", text_fr: "Base plus basse mais primes de performance et commissions", icon: "TrendingUpIcon",
        scores: { "commerce-international": 3, "marketing": 2, "finance": 1 } },
      { text: "Equity and stock options in a growing company", text_fr: "Actions et options dans une entreprise en croissance", icon: "PieChartIcon",
        scores: { "genie-informatique": 3, "management": 2, "finance": 2 } },
      { text: "Competitive salary plus excellent training budget", text_fr: "Salaire compétitif plus excellent budget formation", icon: "GraduationCapIcon",
        scores: { "genie-industriel": 2, "genie-informatique": 2, "ressources-humaines": 3 } },
    ],
  },
  {
    id: "val-9", category: "values", trait: "cultural_fit",
    question: "Which company culture appeals to you most?",
    question_fr: "Quelle culture d'entreprise vous attire le plus ?",
    options: [
      { text: "Innovation-driven with freedom to experiment", text_fr: "Orientée innovation avec liberté d'expérimentation", icon: "FlaskIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "marketing": 1 } },
      { text: "Process-oriented with quality certifications (ISO, etc.)", text_fr: "Orientée processus avec certifications qualité (ISO, etc.)", icon: "ShieldIcon",
        scores: { "genie-industriel": 3, "genie-mecanique": 2, "logistique": 2 } },
      { text: "Client-centered with a strong service mindset", text_fr: "Centrée client avec un fort esprit de service", icon: "HeartIcon",
        scores: { "commerce-international": 3, "marketing": 2, "management": 1 } },
      { text: "Collaborative with a strong sense of community", text_fr: "Collaborative avec un fort sens de la communauté", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "genie-civil": 2, "management": 1 } },
    ],
  },
  {
    id: "val-10", category: "values", trait: "legacy_aspiration",
    question: "In 20 years, you want to be known as someone who...",
    question_fr: "Dans 20 ans, vous voulez être connu comme quelqu'un qui...",
    options: [
      { text: "Built infrastructure that transformed Morocco", text_fr: "A construit des infrastructures qui ont transformé le Maroc", icon: "BuildingIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 1 } },
      { text: "Created technology used by millions of people", text_fr: "A créé une technologie utilisée par des millions de personnes", icon: "GlobeIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "marketing": 1 } },
      { text: "Built a successful company that employs hundreds", text_fr: "A bâti une entreprise prospère qui emploie des centaines de personnes", icon: "BriefcaseIcon",
        scores: { "management": 3, "commerce-international": 2, "finance": 2 } },
      { text: "Mentored the next generation of leaders", text_fr: "A mentoré la prochaine génération de leaders", icon: "AwardIcon",
        scores: { "ressources-humaines": 3, "management": 2, "genie-industriel": 1 } },
    ],
  },

  // ─── WORK STYLE (ws-1 to ws-11) ─────────────────────────────────────
  {
    id: "ws-1", category: "work-style", trait: "planning_approach",
    question: "How do you plan your weekly tasks?",
    question_fr: "Comment planifiez-vous vos tâches hebdomadaires ?",
    options: [
      { text: "Detailed Gantt chart with milestones and dependencies", text_fr: "Diagramme de Gantt détaillé avec jalons et dépendances", icon: "BarChartIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "genie-civil": 2 } },
      { text: "Kanban board — move cards from To Do to Done", text_fr: "Tableau Kanban — déplacer les cartes de À faire à Terminé", icon: "LayoutIcon",
        scores: { "genie-informatique": 3, "marketing": 2, "management": 1 } },
      { text: "Simple priority list — tackle the most important first", text_fr: "Simple liste de priorités — s'attaquer au plus important d'abord", icon: "ListIcon",
        scores: { "finance": 2, "genie-mecanique": 2, "genie-electrique": 2 } },
      { text: "I prefer to react to what comes — flexibility is key", text_fr: "Je préfère réagir à ce qui vient — la flexibilité est clé", icon: "RefreshIcon",
        scores: { "commerce-international": 3, "marketing": 2, "ressources-humaines": 1 } },
    ],
  },
  {
    id: "ws-2", category: "work-style", trait: "meeting_preference",
    question: "Your ideal meeting is...",
    question_fr: "Votre réunion idéale est...",
    options: [
      { text: "A standup — 15 minutes, status updates, done", text_fr: "Un standup — 15 minutes, mises à jour, terminé", icon: "ClockIcon",
        scores: { "genie-informatique": 3, "genie-industriel": 2, "logistique": 1 } },
      { text: "A whiteboard session brainstorming solutions", text_fr: "Une session tableau blanc pour brainstormer des solutions", icon: "PenToolIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-civil": 1 } },
      { text: "A client presentation with polished slides", text_fr: "Une présentation client avec des slides soignées", icon: "PresentationIcon",
        scores: { "commerce-international": 3, "marketing": 2, "management": 2 } },
      { text: "A one-on-one coaching or mentoring session", text_fr: "Une session individuelle de coaching ou mentorat", icon: "UsersIcon",
        scores: { "ressources-humaines": 3, "management": 2, "finance": 1 } },
    ],
  },
  {
    id: "ws-3", category: "work-style", trait: "documentation",
    question: "How do you approach documentation?",
    question_fr: "Comment abordez-vous la documentation ?",
    options: [
      { text: "I write thorough technical specs before starting work", text_fr: "Je rédige des spécifications techniques approfondies avant de commencer", icon: "FileTextIcon",
        scores: { "genie-civil": 3, "genie-industriel": 2, "genie-mecanique": 2 } },
      { text: "I prefer working code/prototypes over documents", text_fr: "Je préfère le code/prototypes fonctionnels aux documents", icon: "CodeIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-mecanique": 1 } },
      { text: "I create visual presentations and infographics", text_fr: "Je crée des présentations visuelles et infographies", icon: "ImageIcon",
        scores: { "marketing": 3, "commerce-international": 2, "management": 1 } },
      { text: "I document processes and standard operating procedures", text_fr: "Je documente les processus et procédures opérationnelles standard", icon: "ClipboardIcon",
        scores: { "logistique": 3, "genie-industriel": 2, "ressources-humaines": 2 } },
    ],
  },
  {
    id: "ws-4", category: "work-style", trait: "feedback_preference",
    question: "How do you prefer to receive feedback?",
    question_fr: "Comment préférez-vous recevoir du feedback ?",
    options: [
      { text: "Quantitative metrics and KPIs", text_fr: "Métriques quantitatives et KPI", icon: "BarChartIcon",
        scores: { "finance": 3, "genie-industriel": 2, "logistique": 2 } },
      { text: "Direct and honest verbal feedback", text_fr: "Feedback verbal direct et honnête", icon: "MessageCircleIcon",
        scores: { "genie-mecanique": 2, "genie-electrique": 2, "management": 3 } },
      { text: "Code reviews and technical peer evaluation", text_fr: "Revues de code et évaluation technique par les pairs", icon: "GitPullRequestIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
      { text: "360-degree feedback from peers, managers, and reports", text_fr: "Feedback 360 des pairs, managers et subordonnés", icon: "RefreshIcon",
        scores: { "ressources-humaines": 3, "management": 2, "commerce-international": 1 } },
    ],
  },
  {
    id: "ws-5", category: "work-style", trait: "error_handling",
    question: "When you make a mistake at work, you...",
    question_fr: "Quand vous faites une erreur au travail, vous...",
    options: [
      { text: "Analyze root cause and implement a permanent fix", text_fr: "Analyser la cause racine et implémenter une correction permanente", icon: "SearchIcon",
        scores: { "genie-industriel": 3, "genie-informatique": 2, "genie-electrique": 2 } },
      { text: "Own it immediately and communicate transparently", text_fr: "L'assumer immédiatement et communiquer de manière transparente", icon: "AlertCircleIcon",
        scores: { "management": 3, "ressources-humaines": 2, "commerce-international": 1 } },
      { text: "Fix it quickly and document the lesson learned", text_fr: "Corriger rapidement et documenter la leçon apprise", icon: "PenIcon",
        scores: { "genie-mecanique": 2, "logistique": 3, "genie-civil": 2 } },
      { text: "Update the process so no one makes the same mistake", text_fr: "Mettre à jour le processus pour que personne ne refasse la même erreur", icon: "ShieldIcon",
        scores: { "genie-industriel": 2, "logistique": 2, "finance": 3 } },
    ],
  },
  {
    id: "ws-6", category: "work-style", trait: "multitasking",
    question: "How many projects do you prefer to work on simultaneously?",
    question_fr: "Sur combien de projets préférez-vous travailler simultanément ?",
    options: [
      { text: "One at a time — deep focus produces the best results", text_fr: "Un à la fois — la concentration profonde produit les meilleurs résultats", icon: "TargetIcon",
        scores: { "genie-informatique": 3, "genie-mecanique": 2, "genie-electrique": 2 } },
      { text: "Two or three — enough variety without losing quality", text_fr: "Deux ou trois — assez de variété sans perdre en qualité", icon: "LayoutIcon",
        scores: { "genie-industriel": 3, "genie-civil": 2, "finance": 1 } },
      { text: "Many — I thrive juggling multiple priorities", text_fr: "Plusieurs — je m'épanouis en jonglant avec plusieurs priorités", icon: "ZapIcon",
        scores: { "management": 3, "commerce-international": 2, "marketing": 2 } },
      { text: "It depends — I adjust to team and client needs", text_fr: "Ça dépend — je m'adapte aux besoins de l'équipe et du client", icon: "RefreshIcon",
        scores: { "ressources-humaines": 3, "logistique": 2, "commerce-international": 1 } },
    ],
  },
  {
    id: "ws-7", category: "work-style", trait: "tools_preference",
    question: "Which tools do you use most productively?",
    question_fr: "Quels outils utilisez-vous le plus productivement ?",
    options: [
      { text: "Excel/Google Sheets — data, formulas, pivot tables", text_fr: "Excel/Google Sheets — données, formules, tableaux croisés dynamiques", icon: "TableIcon",
        scores: { "finance": 3, "logistique": 2, "genie-industriel": 2 } },
      { text: "IDE and terminal — VS Code, Git, command line", text_fr: "IDE et terminal — VS Code, Git, ligne de commande", icon: "TerminalIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "genie-industriel": 1 } },
      { text: "Design tools — AutoCAD, SolidWorks, CATIA", text_fr: "Outils de conception — AutoCAD, SolidWorks, CATIA", icon: "PenToolIcon",
        scores: { "genie-mecanique": 3, "genie-civil": 3, "genie-electrique": 1 } },
      { text: "Presentation tools — PowerPoint, Canva, Figma", text_fr: "Outils de présentation — PowerPoint, Canva, Figma", icon: "SlidersIcon",
        scores: { "marketing": 3, "commerce-international": 2, "management": 2 } },
    ],
  },
  {
    id: "ws-8", category: "work-style", trait: "deadline_management",
    question: "When given a month-long project, you typically...",
    question_fr: "Quand on vous confie un projet d'un mois, vous...",
    options: [
      { text: "Start immediately and finish early for buffer time", text_fr: "Commencer immédiatement et finir en avance pour garder une marge", icon: "FastForwardIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "finance": 2 } },
      { text: "Plan the first week, then iterate in sprints", text_fr: "Planifier la première semaine, puis itérer en sprints", icon: "RefreshIcon",
        scores: { "genie-informatique": 3, "management": 2, "genie-electrique": 1 } },
      { text: "Research extensively first, then execute quickly", text_fr: "Rechercher en profondeur d'abord, puis exécuter rapidement", icon: "SearchIcon",
        scores: { "genie-mecanique": 2, "genie-civil": 2, "commerce-international": 2 } },
      { text: "Set up checkpoints with stakeholders along the way", text_fr: "Mettre en place des points de contrôle avec les parties prenantes", icon: "CheckSquareIcon",
        scores: { "management": 3, "ressources-humaines": 2, "logistique": 2 } },
    ],
  },
  {
    id: "ws-9", category: "work-style", trait: "problem_complexity",
    question: "Which type of problem do you find most satisfying to solve?",
    question_fr: "Quel type de problème trouvez-vous le plus satisfaisant à résoudre ?",
    options: [
      { text: "A complex algorithm or mathematical optimization", text_fr: "Un algorithme complexe ou une optimisation mathématique", icon: "CalculatorIcon",
        scores: { "genie-informatique": 3, "genie-electrique": 2, "finance": 2 } },
      { text: "A physical engineering challenge — making things work", text_fr: "Un défi d'ingénierie physique — faire fonctionner les choses", icon: "WrenchIcon",
        scores: { "genie-mecanique": 3, "genie-civil": 2, "genie-electrique": 1 } },
      { text: "A people/organizational challenge — aligning teams", text_fr: "Un défi humain/organisationnel — aligner les équipes", icon: "UsersIcon",
        scores: { "management": 3, "ressources-humaines": 2, "commerce-international": 1 } },
      { text: "A strategic business problem — market positioning", text_fr: "Un problème stratégique business — positionnement marché", icon: "ChessKnightIcon",
        scores: { "commerce-international": 3, "marketing": 2, "finance": 2 } },
    ],
  },
  {
    id: "ws-10", category: "work-style", trait: "remote_work",
    question: "What's your ideal remote work arrangement?",
    question_fr: "Quel est votre arrangement de télétravail idéal ?",
    options: [
      { text: "Fully remote — I'm most productive at home", text_fr: "100% télétravail — je suis le plus productif chez moi", icon: "HomeIcon",
        scores: { "genie-informatique": 3, "finance": 2, "marketing": 1 } },
      { text: "Hybrid — 2-3 days in office for collaboration", text_fr: "Hybride — 2-3 jours au bureau pour la collaboration", icon: "SunriseIcon",
        scores: { "management": 2, "genie-industriel": 2, "ressources-humaines": 2 } },
      { text: "Fully on-site — I need physical workspace and equipment", text_fr: "100% sur site — j'ai besoin d'espace physique et d'équipements", icon: "BuildingIcon",
        scores: { "genie-civil": 3, "genie-mecanique": 2, "genie-electrique": 2 } },
      { text: "Travel-based — visiting clients, sites, and partners", text_fr: "Basé sur les déplacements — visiter clients, sites et partenaires", icon: "PlaneIcon",
        scores: { "commerce-international": 3, "logistique": 2, "marketing": 2 } },
    ],
  },
  {
    id: "ws-11", category: "work-style", trait: "continuous_improvement",
    question: "How do you stay current in your field?",
    question_fr: "Comment restez-vous à jour dans votre domaine ?",
    options: [
      { text: "Online courses, certifications, and MOOCs", text_fr: "Cours en ligne, certifications et MOOCs", icon: "GraduationCapIcon",
        scores: { "genie-informatique": 3, "finance": 2, "genie-electrique": 1 } },
      { text: "Industry conferences and professional associations", text_fr: "Conférences sectorielles et associations professionnelles", icon: "MicIcon",
        scores: { "management": 3, "commerce-international": 2, "genie-civil": 1 } },
      { text: "Hands-on experimentation and personal projects", text_fr: "Expérimentation pratique et projets personnels", icon: "HammerIcon",
        scores: { "genie-mecanique": 3, "genie-electrique": 2, "genie-informatique": 2 } },
      { text: "Reading industry reports, white papers, and case studies", text_fr: "Lire des rapports sectoriels, livres blancs et études de cas", icon: "BookOpenIcon",
        scores: { "genie-industriel": 3, "logistique": 2, "finance": 2 } },
    ],
  },
];

// ─── EMPLOYERS ──────────────────────────────────────────────────────────────

// Existing employer names (to avoid duplicates — checked from DB)
const EXISTING_EMPLOYERS = new Set([
  "ABB Maroc","Accenture Maroc","Addoha Group","ADM (Autoroutes du Maroc)","Afriquia SMDC (AKWA Group)",
  "Alliances Développement Immobilier","Altran Maroc (Capgemini Engineering)","Aptiv (ex-Delphi) Maroc",
  "Atos Maroc","Attijariwafa Bank","Banque Populaire","BMCE Bank of Africa","BMCI (BNP Paribas Maroc)",
  "Capgemini Maroc","Centrale Danone","CGI Maroc","Chari","CHU Hassan II","CHU Ibn Rochd","CHU Ibn Sina",
  "CHU Mohammed VI","CIH Bank","Ciments du Maroc","Clinique Cheikh Zayd","Clinique Internationale de Marrakech",
  "Coficab Maroc","Cooper Pharma","Copag","Cosumar","Crédit du Maroc","Croissant-Rouge Marocain","CTM",
  "DabaDoc","Deloitte Maroc","Delphi Technologies Maroc","EY Maroc (Ernst & Young)","Florentaise Maroc",
  "Fruit of the Loom Maroc","Fujikura Automotive Maroc","Groupe Akdital","Groupe Al Omrane","Hmizate (Hmall)",
  "HPS (Hightech Payment Systems)","IB Maroc","Intelcia","Involys","Inwi","IRESEN",
  "ISCAE (Institut Supérieur de Commerce et d'Administration des Entreprises)","KPMG Maroc",
  "LafargeHolcim Maroc","Lana Cash (Chari)","Laprophan","Lear Corporation Maroc",
  "Les Domaines Agricoles (Royal Farms)","Lesieur Cristal","Lydec","Maghreb Steel","Managem Group",
  "Marjane Group","Maroc Telecom (IAM)","Marsa Maroc","MASEN (Moroccan Agency for Sustainable Energy)",
  "Médecins Sans Frontières Maroc","NAREVA Holding","Nestlé Maroc","Obytes","OCP Group",
  "OCP Maintenance Solutions (FOSBOUCRAA)","ONCF (Office National des Chemins de Fer)",
  "ONDA (Office National Des Aéroports)","ONEE (Office National de l'Électricité et de l'Eau Potable)",
  "ONHYM (Office National des Hydrocarbures et des Mines)","Orange Maroc (Méditel)","PayTic","Pharma 5",
  "Procter & Gamble Maroc","PwC Maroc",
  "RADEEMA (Régie Autonome de Distribution d'Eau et d'Électricité de Marrakech)","REDAL","REMINEX",
  "Renault Maroc (SOMACA)","RMA Assurance","Royal Air Maroc (RAM)","S2M (Société Maghrébine de Monétique)",
  "Saham Assurance","Saint-Gobain Maroc","Schneider Electric Maroc","Screendy",
  "SGTM (Société Générale des Travaux du Maroc)","Siemens Maroc","SNOP Maroc",
  "Société Chérifienne des Pétroles (SCP / Samir legacy)","Société Générale Maroc","Sonasid",
  "Sopra HR Software Maroc","SOTHEMA","Stellantis (PSA Peugeot Citroën)","Suez Maroc",
  "Sumitomo Electric Wiring Systems Maroc","Tanger Med Port Authority","TE Connectivity Maroc",
  "Telus International Maroc","Terraa","TGCC (Travaux Généraux de Construction de Casablanca)",
  "TMSA (Tanger Med Special Agency)","TotalEnergies Maroc","Ubisoft Casablanca",
  "UM6P (Université Mohammed VI Polytechnique)","Unilever Maroc","Veolia Maroc",
  "Vivo Energy Maroc (Shell)","Wafa Assurance","WaystoCap","Webhelp Maroc (Concentrix)","Yassir",
  "Yazaki Morocco"
]);

const EMPLOYERS = [
  // ─── Banking & Finance ──────────────────────────────────────────────
  {
    name: "Bank Al-Maghrib",
    sector: "Central Banking & Regulation", sector_fr: "Banque Centrale & Régulation",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 35, website: "https://www.bkam.ma",
    description: "Morocco's central bank responsible for monetary policy, banking supervision, and currency issuance.",
    description_fr: "La banque centrale du Maroc responsable de la politique monétaire, la supervision bancaire et l'émission de la monnaie.",
    fields: ["finance", "genie-informatique", "management"],
  },
  {
    name: "Wafasalaf",
    sector: "Consumer Finance", sector_fr: "Crédit à la Consommation",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 25, website: "https://www.wafasalaf.ma",
    description: "Morocco's leading consumer credit company, subsidiary of Attijariwafa Bank, offering personal and auto loans.",
    description_fr: "Leader marocain du crédit à la consommation, filiale d'Attijariwafa Bank, proposant des prêts personnels et automobiles.",
    fields: ["finance", "genie-informatique", "marketing"],
  },
  {
    name: "CDG Group (Caisse de Dépôt et de Gestion)",
    sector: "Public Investment & Finance", sector_fr: "Investissement Public & Finance",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 60, website: "https://www.cdg.ma",
    description: "Morocco's major public institutional investor managing pension funds, real estate, and infrastructure projects.",
    description_fr: "Principal investisseur institutionnel public du Maroc gérant les fonds de retraite, l'immobilier et les projets d'infrastructure.",
    fields: ["finance", "management", "genie-civil"],
  },
  {
    name: "Bourse de Casablanca",
    sector: "Capital Markets", sector_fr: "Marchés des Capitaux",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.casablanca-bourse.com",
    description: "Morocco's stock exchange, one of Africa's most dynamic, facilitating equity and bond trading.",
    description_fr: "La bourse du Maroc, l'une des plus dynamiques d'Afrique, facilitant le trading d'actions et d'obligations.",
    fields: ["finance", "genie-informatique", "management"],
  },
  {
    name: "Wafa Gestion",
    sector: "Asset Management", sector_fr: "Gestion d'Actifs",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 12, website: "https://www.wafagestion.com",
    description: "Leading Moroccan asset management firm offering investment funds and portfolio management services.",
    description_fr: "Première société de gestion d'actifs marocaine proposant des fonds d'investissement et des services de gestion de portefeuille.",
    fields: ["finance", "genie-informatique"],
  },

  // ─── Telecom & Digital ──────────────────────────────────────────────
  {
    name: "Wana Corporate (Inwi Group)",
    sector: "Telecommunications Infrastructure", sector_fr: "Infrastructure Télécommunications",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 40, website: "https://www.wana.ma",
    description: "Parent company of Inwi, investing in Morocco's digital infrastructure including fiber optic and 5G.",
    description_fr: "Société mère d'Inwi, investissant dans l'infrastructure numérique du Maroc incluant la fibre optique et la 5G.",
    fields: ["genie-electrique", "genie-informatique", "genie-civil"],
  },
  {
    name: "ANRT (Agence Nationale de Réglementation des Télécommunications)",
    sector: "Telecom Regulation", sector_fr: "Régulation des Télécommunications",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 20, website: "https://www.anrt.ma",
    description: "Morocco's telecommunications regulatory authority overseeing spectrum management and digital policy.",
    description_fr: "L'autorité de régulation des télécommunications du Maroc supervisant la gestion du spectre et la politique numérique.",
    fields: ["genie-electrique", "genie-informatique", "management"],
  },
  {
    name: "M2M Group",
    sector: "Digital Security & E-Government", sector_fr: "Sécurité Numérique & E-Gouvernement",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 30, website: "https://www.m2mgroup.com",
    description: "Moroccan multinational specializing in e-government, digital ID, and electronic payment solutions across Africa.",
    description_fr: "Multinationale marocaine spécialisée dans l'e-gouvernement, l'identité numérique et les solutions de paiement électronique en Afrique.",
    fields: ["genie-informatique", "genie-electrique", "management"],
  },
  {
    name: "Disway",
    sector: "IT Distribution", sector_fr: "Distribution IT",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.disway.ma",
    description: "Morocco's leading IT hardware distributor, supplying computing and networking equipment to businesses.",
    description_fr: "Premier distributeur de matériel informatique au Maroc, fournissant des équipements informatiques et réseau aux entreprises.",
    fields: ["genie-informatique", "logistique", "commerce-international"],
  },

  // ─── Automotive & Manufacturing ─────────────────────────────────────
  {
    name: "AMICA (Association Marocaine pour l'Industrie et le Commerce Automobile)",
    sector: "Automotive Industry Association", sector_fr: "Association de l'Industrie Automobile",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 10, website: "https://www.amica.org.ma",
    description: "Professional association representing Morocco's automotive ecosystem, coordinating industry development.",
    description_fr: "Association professionnelle représentant l'écosystème automobile marocain, coordonnant le développement de l'industrie.",
    fields: ["genie-mecanique", "genie-industriel", "management"],
  },
  {
    name: "Hands Corporation Morocco",
    sector: "Automotive Leather & Trim", sector_fr: "Cuir & Garnitures Automobiles",
    location: "Kenitra", location_fr: "Kénitra",
    open_positions: 80, website: "https://www.handscorp.com",
    description: "Korean automotive supplier manufacturing leather seat covers and interior trim for global car manufacturers.",
    description_fr: "Fournisseur automobile coréen fabricant des housses de siège en cuir et garnitures intérieures pour les constructeurs mondiaux.",
    fields: ["genie-industriel", "genie-mecanique", "logistique"],
  },
  {
    name: "Safran Morocco",
    sector: "Aerospace Manufacturing", sector_fr: "Fabrication Aérospatiale",
    location: "Casablanca, Ain Sebaa", location_fr: "Casablanca, Aïn Sebaâ",
    open_positions: 120, website: "https://www.safran-group.com",
    description: "French aerospace group manufacturing aircraft engine components and wiring harnesses in Morocco.",
    description_fr: "Groupe aérospatial français fabriquant des composants de moteurs d'avion et des faisceaux de câblage au Maroc.",
    fields: ["genie-mecanique", "genie-electrique", "genie-industriel"],
  },
  {
    name: "Bombardier Maroc",
    sector: "Aerospace Manufacturing", sector_fr: "Fabrication Aérospatiale",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 80, website: "https://www.bombardier.com",
    description: "Canadian aerospace manufacturer with a Morocco site producing aircraft wiring and structural components.",
    description_fr: "Constructeur aérospatial canadien avec un site au Maroc produisant le câblage et les composants structurels d'avions.",
    fields: ["genie-mecanique", "genie-electrique", "genie-industriel"],
  },
  {
    name: "STELIA Aerospace Maroc (Airbus Atlantic)",
    sector: "Aerospace Structures", sector_fr: "Structures Aérospatiales",
    location: "Nouaceur, Casablanca", location_fr: "Nouaceur, Casablanca",
    open_positions: 60, website: "https://www.airbus.com",
    description: "Airbus subsidiary manufacturing fuselage sections and aerostructures for commercial aircraft.",
    description_fr: "Filiale d'Airbus fabriquant des tronçons de fuselage et des aérostructures pour avions commerciaux.",
    fields: ["genie-mecanique", "genie-industriel", "genie-civil"],
  },
  {
    name: "Daher Aerospace Morocco",
    sector: "Aerospace Supply Chain", sector_fr: "Chaîne d'Approvisionnement Aérospatiale",
    location: "Tangier Free Zone", location_fr: "Zone Franche de Tanger",
    open_positions: 45, website: "https://www.daher.com",
    description: "French industrial group providing aerospace logistics, composite manufacturing, and supply chain services.",
    description_fr: "Groupe industriel français fournissant logistique aérospatiale, fabrication de composites et services supply chain.",
    fields: ["logistique", "genie-mecanique", "genie-industriel"],
  },

  // ─── IT & Digital Services ──────────────────────────────────────────
  {
    name: "Logisticlab (Barid Media)",
    sector: "IT Services & Digital Transformation", sector_fr: "Services IT & Transformation Digitale",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 25, website: "https://www.baridmedia.ma",
    description: "Digital subsidiary of Barid Al-Maghrib (Morocco Post) specializing in e-government and digital platforms.",
    description_fr: "Filiale digitale de Barid Al-Maghrib (Poste Maroc) spécialisée dans l'e-gouvernement et les plateformes numériques.",
    fields: ["genie-informatique", "management", "logistique"],
  },
  {
    name: "Sqli Maroc",
    sector: "Digital Consulting", sector_fr: "Conseil Digital",
    location: "Rabat, Oujda", location_fr: "Rabat, Oujda",
    open_positions: 50, website: "https://www.sqli.com",
    description: "European digital services company with major Moroccan operations in web development and digital consulting.",
    description_fr: "Entreprise européenne de services numériques avec des opérations marocaines majeures en développement web et conseil digital.",
    fields: ["genie-informatique", "marketing", "management"],
  },
  {
    name: "Norsys Afrique",
    sector: "IT Services & Cloud", sector_fr: "Services IT & Cloud",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 30, website: "https://www.norsys.fr",
    description: "French IT services company offering cloud, DevOps, and custom software development from its Casablanca center.",
    description_fr: "Société française de services IT offrant cloud, DevOps et développement logiciel sur mesure depuis son centre de Casablanca.",
    fields: ["genie-informatique", "genie-electrique"],
  },
  {
    name: "Omnidata",
    sector: "Data & AI Solutions", sector_fr: "Solutions Data & IA",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.omnidata.ma",
    description: "Moroccan data engineering company specializing in business intelligence, big data, and AI solutions.",
    description_fr: "Société marocaine d'ingénierie des données spécialisée en business intelligence, big data et solutions IA.",
    fields: ["genie-informatique", "genie-industriel", "finance"],
  },
  {
    name: "Sopra Banking Software Maroc",
    sector: "Banking Software", sector_fr: "Logiciels Bancaires",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 40, website: "https://www.soprabanking.com",
    description: "Global banking software provider with a major development center in Casablanca serving African banks.",
    description_fr: "Fournisseur mondial de logiciels bancaires avec un centre de développement majeur à Casablanca servant les banques africaines.",
    fields: ["genie-informatique", "finance", "management"],
  },

  // ─── Energy & Utilities ─────────────────────────────────────────────
  {
    name: "ACWA Power Maroc",
    sector: "Independent Power Producer", sector_fr: "Producteur Indépendant d'Énergie",
    location: "Ouarzazate, Midelt", location_fr: "Ouarzazate, Midelt",
    open_positions: 40, website: "https://www.acwapower.com",
    description: "Saudi-based IPP operating the Noor-Ouarzazate solar complex and Noor Midelt hybrid solar project in Morocco.",
    description_fr: "Producteur saoudien exploitant le complexe solaire Noor-Ouarzazate et le projet solaire hybride Noor Midelt au Maroc.",
    fields: ["genie-electrique", "genie-civil", "genie-mecanique"],
  },
  {
    name: "Engie Maroc",
    sector: "Energy Services & Renewables", sector_fr: "Services Énergétiques & Renouvelables",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 35, website: "https://www.engie.ma",
    description: "French energy multinational providing renewable energy, energy efficiency, and facility management in Morocco.",
    description_fr: "Multinationale française de l'énergie fournissant énergie renouvelable, efficacité énergétique et facility management au Maroc.",
    fields: ["genie-electrique", "genie-mecanique", "genie-civil"],
  },
  {
    name: "Platinum Power",
    sector: "Renewable Energy Development", sector_fr: "Développement Énergie Renouvelable",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.platinumpower.ma",
    description: "Moroccan independent energy developer focused on wind and hydroelectric power projects across Africa.",
    description_fr: "Développeur indépendant marocain d'énergie concentré sur les projets éoliens et hydroélectriques en Afrique.",
    fields: ["genie-electrique", "genie-civil", "finance"],
  },
  {
    name: "Taqa Morocco (JLEC)",
    sector: "Thermal Power Generation", sector_fr: "Production d'Énergie Thermique",
    location: "Jorf Lasfar, El Jadida", location_fr: "Jorf Lasfar, El Jadida",
    open_positions: 30, website: "https://www.taqamorocco.com",
    description: "Listed energy company operating Morocco's largest coal-fired power plant at Jorf Lasfar.",
    description_fr: "Entreprise cotée exploitant la plus grande centrale thermique au charbon du Maroc à Jorf Lasfar.",
    fields: ["genie-electrique", "genie-mecanique", "genie-industriel"],
  },

  // ─── Pharma & Healthcare ────────────────────────────────────────────
  {
    name: "Galenica (Grupo Galenica)",
    sector: "Pharmaceutical Manufacturing", sector_fr: "Fabrication Pharmaceutique",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 25, website: "https://www.galenica.ma",
    description: "Moroccan pharmaceutical manufacturer producing generic medications and OTC products for the local market.",
    description_fr: "Fabricant pharmaceutique marocain produisant des médicaments génériques et produits OTC pour le marché local.",
    fields: ["genie-industriel", "genie-mecanique", "management"],
  },
  {
    name: "Maphar (Sanofi Maroc)",
    sector: "Pharmaceutical Manufacturing", sector_fr: "Fabrication Pharmaceutique",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 30, website: "https://www.sanofi.ma",
    description: "Sanofi's Moroccan subsidiary and manufacturing site producing pharmaceuticals for North and West Africa.",
    description_fr: "Filiale et site de fabrication de Sanofi au Maroc produisant des produits pharmaceutiques pour l'Afrique du Nord et de l'Ouest.",
    fields: ["genie-industriel", "genie-mecanique", "logistique"],
  },
  {
    name: "Biopharma",
    sector: "Biopharmaceutical", sector_fr: "Biopharmaceutique",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 20, website: "https://www.biopharma.ma",
    description: "State-owned biopharmaceutical company producing vaccines, blood derivatives, and biological products.",
    description_fr: "Entreprise biopharmaceutique publique produisant des vaccins, dérivés sanguins et produits biologiques.",
    fields: ["genie-industriel", "genie-mecanique"],
  },

  // ─── Food & Agri ────────────────────────────────────────────────────
  {
    name: "Dari Couspate",
    sector: "Agri-Food (Pasta & Couscous)", sector_fr: "Agro-alimentaire (Pâtes & Couscous)",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.daricouspate.com",
    description: "Leading Moroccan manufacturer of couscous, pasta, and flour products, exporting to 40+ countries.",
    description_fr: "Premier fabricant marocain de couscous, pâtes et produits à base de farine, exportant vers plus de 40 pays.",
    fields: ["genie-industriel", "logistique", "commerce-international"],
  },
  {
    name: "Groupe Koutoubia",
    sector: "Agri-Food (Meat & Poultry)", sector_fr: "Agro-alimentaire (Viande & Volaille)",
    location: "Marrakech", location_fr: "Marrakech",
    open_positions: 35, website: "https://www.koutoubia.ma",
    description: "Morocco's largest poultry and meat processor, vertically integrated from farming to retail distribution.",
    description_fr: "Plus grand transformateur de volaille et viande du Maroc, intégré verticalement de l'élevage à la distribution.",
    fields: ["genie-industriel", "logistique", "management"],
  },
  {
    name: "Groupe Addouz (Ain Ifrane)",
    sector: "Agri-Food (Mineral Water & Beverages)", sector_fr: "Agro-alimentaire (Eau Minérale & Boissons)",
    location: "Ifrane, Meknes", location_fr: "Ifrane, Meknès",
    open_positions: 20, website: "https://www.ainifrane.ma",
    description: "Major Moroccan mineral water bottler and beverage company with brands like Ain Ifrane and Ain Atlas.",
    description_fr: "Principal embouteilleur marocain d'eau minérale et entreprise de boissons avec des marques comme Ain Ifrane et Ain Atlas.",
    fields: ["genie-industriel", "logistique", "marketing"],
  },
  {
    name: "Groupe Zalar",
    sector: "Agri-Food (Eggs & Poultry)", sector_fr: "Agro-alimentaire (Œufs & Volaille)",
    location: "Souss-Massa, Agadir", location_fr: "Souss-Massa, Agadir",
    open_positions: 25, website: "https://www.zalar.ma",
    description: "Leading Moroccan agri-food group specializing in eggs, poultry, and integrated farming operations.",
    description_fr: "Groupe agro-alimentaire marocain leader spécialisé dans les œufs, la volaille et les opérations agricoles intégrées.",
    fields: ["genie-industriel", "logistique", "management"],
  },

  // ─── Construction & Real Estate ─────────────────────────────────────
  {
    name: "SOGEA Maroc (VINCI Construction)",
    sector: "Construction & Public Works", sector_fr: "Construction & Travaux Publics",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 70, website: "https://www.vinci-construction.com",
    description: "VINCI subsidiary specializing in large-scale infrastructure, dams, bridges, and industrial facilities in Morocco.",
    description_fr: "Filiale de VINCI spécialisée dans les infrastructures de grande envergure, barrages, ponts et installations industrielles au Maroc.",
    fields: ["genie-civil", "genie-mecanique", "genie-industriel"],
  },
  {
    name: "Jet Contractors",
    sector: "Construction & Luxury Real Estate", sector_fr: "Construction & Immobilier de Luxe",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 50, website: "https://www.jetcontractors.com",
    description: "Moroccan construction company known for iconic towers and luxury projects including the TwinCenter.",
    description_fr: "Entreprise marocaine de construction connue pour des tours emblématiques et projets de luxe incluant le TwinCenter.",
    fields: ["genie-civil", "genie-mecanique", "management"],
  },
  {
    name: "Palmeraie Développement",
    sector: "Real Estate Development", sector_fr: "Promotion Immobilière",
    location: "Marrakech, Casablanca", location_fr: "Marrakech, Casablanca",
    open_positions: 30, website: "https://www.palmeraiedeveloppement.com",
    description: "Luxury real estate developer behind major projects including Palmeraie Resort and Bouskoura Golf City.",
    description_fr: "Promoteur immobilier de luxe derrière des projets majeurs incluant Palmeraie Resort et Bouskoura Golf City.",
    fields: ["genie-civil", "management", "marketing"],
  },
  {
    name: "Yamed Capital",
    sector: "Urban Development & Real Estate", sector_fr: "Développement Urbain & Immobilier",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 25, website: "https://www.yamed-capital.com",
    description: "Moroccan urban developer behind mixed-use projects including Zenata Eco-City and Anfa Place.",
    description_fr: "Développeur urbain marocain derrière des projets mixtes incluant Zenata Eco-City et Anfa Place.",
    fields: ["genie-civil", "management", "finance"],
  },

  // ─── Consulting & Audit ─────────────────────────────────────────────
  {
    name: "Mazars Maroc",
    sector: "Audit & Advisory", sector_fr: "Audit & Conseil",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 25, website: "https://www.mazars.ma",
    description: "International audit and advisory firm with a strong Moroccan practice serving mid-market and large companies.",
    description_fr: "Cabinet international d'audit et conseil avec une pratique marocaine solide servant les ETI et grandes entreprises.",
    fields: ["finance", "management", "commerce-international"],
  },
  {
    name: "BDO Maroc",
    sector: "Audit & Tax Advisory", sector_fr: "Audit & Conseil Fiscal",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.bdo.ma",
    description: "Fifth-largest global accounting network with Moroccan offices offering audit, tax, and advisory services.",
    description_fr: "Cinquième réseau comptable mondial avec des bureaux marocains offrant services d'audit, fiscal et conseil.",
    fields: ["finance", "management"],
  },
  {
    name: "Grant Thornton Maroc",
    sector: "Audit & Business Advisory", sector_fr: "Audit & Conseil aux Entreprises",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.grantthornton.ma",
    description: "Global professional services network providing audit, tax, and advisory to dynamic organizations in Morocco.",
    description_fr: "Réseau mondial de services professionnels fournissant audit, fiscal et conseil aux organisations dynamiques au Maroc.",
    fields: ["finance", "management", "commerce-international"],
  },
  {
    name: "McKinsey & Company Maroc",
    sector: "Management Consulting", sector_fr: "Conseil en Management",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.mckinsey.com",
    description: "Premier global management consulting firm with Casablanca office serving public and private sector in Morocco and Africa.",
    description_fr: "Premier cabinet mondial de conseil en management avec un bureau à Casablanca servant secteurs public et privé au Maroc et en Afrique.",
    fields: ["management", "finance", "commerce-international"],
  },

  // ─── Transport & Logistics ──────────────────────────────────────────
  {
    name: "SDTM (Société de Transports de Marchandises)",
    sector: "Freight Transport", sector_fr: "Transport de Marchandises",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.sdtm.ma",
    description: "Major Moroccan freight transport company providing road logistics for industrial and commercial goods.",
    description_fr: "Entreprise marocaine de transport de marchandises fournissant de la logistique routière pour les biens industriels et commerciaux.",
    fields: ["logistique", "management"],
  },
  {
    name: "Maersk Maroc",
    sector: "Shipping & Container Logistics", sector_fr: "Transport Maritime & Logistique Conteneurs",
    location: "Tangier, Casablanca", location_fr: "Tanger, Casablanca",
    open_positions: 25, website: "https://www.maersk.com",
    description: "Danish shipping giant with major Moroccan operations at Tanger Med, handling container logistics and supply chains.",
    description_fr: "Géant danois du transport maritime avec des opérations majeures au Maroc à Tanger Med, gérant logistique conteneurs et supply chains.",
    fields: ["logistique", "commerce-international", "genie-informatique"],
  },
  {
    name: "DHL Supply Chain Morocco",
    sector: "Logistics & Supply Chain", sector_fr: "Logistique & Supply Chain",
    location: "Casablanca, Tangier", location_fr: "Casablanca, Tanger",
    open_positions: 30, website: "https://www.dhl.com/ma",
    description: "Global logistics provider operating warehousing, distribution, and supply chain solutions in Morocco.",
    description_fr: "Prestataire logistique mondial opérant entreposage, distribution et solutions supply chain au Maroc.",
    fields: ["logistique", "genie-industriel", "commerce-international"],
  },
  {
    name: "CMA CGM Maroc",
    sector: "Maritime & Logistics", sector_fr: "Maritime & Logistique",
    location: "Casablanca, Tangier", location_fr: "Casablanca, Tanger",
    open_positions: 20, website: "https://www.cma-cgm.com",
    description: "French shipping and logistics conglomerate with extensive Moroccan port operations and inland logistics.",
    description_fr: "Conglomérat français de transport maritime et logistique avec des opérations portuaires et logistiques étendues au Maroc.",
    fields: ["logistique", "commerce-international", "management"],
  },

  // ─── Mining & Heavy Industry ────────────────────────────────────────
  {
    name: "ONHYM (Office National des Hydrocarbures et des Mines) - Engineering",
    sector: "Mining Exploration & Research", sector_fr: "Exploration Minière & Recherche",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 15, website: "https://www.onhym.com",
    description: "State agency promoting mining and hydrocarbon exploration, managing permits and geological research.",
    description_fr: "Agence d'État promouvant l'exploration minière et des hydrocarbures, gérant les permis et la recherche géologique.",
    fields: ["genie-civil", "genie-mecanique", "genie-industriel"],
  },
  {
    name: "Compagnie Minière de Touissit (CMT)",
    sector: "Lead & Zinc Mining", sector_fr: "Exploitation Minière Plomb & Zinc",
    location: "Oujda, Touissit", location_fr: "Oujda, Touissit",
    open_positions: 20, website: "https://www.cmt.ma",
    description: "Moroccan mining company extracting lead and zinc in the Oriental region, listed on Casablanca Stock Exchange.",
    description_fr: "Société minière marocaine extrayant plomb et zinc dans la région de l'Oriental, cotée à la Bourse de Casablanca.",
    fields: ["genie-civil", "genie-mecanique", "genie-industriel"],
  },

  // ─── Textile & Consumer Goods ───────────────────────────────────────
  {
    name: "SINTEX Maroc",
    sector: "Textile Manufacturing", sector_fr: "Fabrication Textile",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 40, website: "https://www.sintex.ma",
    description: "Major Moroccan textile manufacturer producing fabrics and garments for European fashion brands.",
    description_fr: "Grand fabricant textile marocain produisant tissus et vêtements pour les marques de mode européennes.",
    fields: ["genie-industriel", "commerce-international", "logistique"],
  },
  {
    name: "Marwa (Tazi Group)",
    sector: "Fashion Retail", sector_fr: "Commerce de Mode",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 30, website: "https://www.marwa.ma",
    description: "Morocco's leading fashion retail chain with 100+ stores, offering affordable Moroccan-designed clothing.",
    description_fr: "Première chaîne de prêt-à-porter du Maroc avec 100+ magasins, offrant des vêtements de conception marocaine.",
    fields: ["marketing", "commerce-international", "logistique"],
  },

  // ─── Industrial Equipment & Services ────────────────────────────────
  {
    name: "Atlas Copco Maroc",
    sector: "Industrial Compressors & Equipment", sector_fr: "Compresseurs & Équipements Industriels",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.atlascopco.com/ma",
    description: "Swedish multinational providing air compressors, vacuum solutions, and industrial tools in Morocco.",
    description_fr: "Multinationale suédoise fournissant compresseurs d'air, solutions de vide et outils industriels au Maroc.",
    fields: ["genie-mecanique", "genie-industriel", "commerce-international"],
  },
  {
    name: "Nexans Maroc",
    sector: "Cable Manufacturing", sector_fr: "Fabrication de Câbles",
    location: "Mohammedia", location_fr: "Mohammedia",
    open_positions: 25, website: "https://www.nexans.ma",
    description: "French cable manufacturer producing energy and telecom cables in Morocco for local and export markets.",
    description_fr: "Fabricant français de câbles produisant des câbles énergie et télécom au Maroc pour les marchés local et export.",
    fields: ["genie-electrique", "genie-industriel", "genie-mecanique"],
  },
  {
    name: "Leoni Wiring Systems Morocco",
    sector: "Automotive Wiring Systems", sector_fr: "Systèmes de Câblage Automobile",
    location: "Berrechid, Ain Sebaa", location_fr: "Berrechid, Aïn Sebaâ",
    open_positions: 100, website: "https://www.leoni.com",
    description: "German wiring harness manufacturer with multiple Moroccan plants serving European automotive OEMs.",
    description_fr: "Fabricant allemand de faisceaux de câbles avec plusieurs usines marocaines servant les constructeurs automobiles européens.",
    fields: ["genie-electrique", "genie-industriel", "logistique"],
  },
  {
    name: "Valeo Maroc",
    sector: "Automotive Components", sector_fr: "Composants Automobiles",
    location: "Tangier", location_fr: "Tanger",
    open_positions: 60, website: "https://www.valeo.com",
    description: "French automotive supplier manufacturing lighting, thermal, and visibility systems in Morocco.",
    description_fr: "Équipementier automobile français fabriquant des systèmes d'éclairage, thermiques et de visibilité au Maroc.",
    fields: ["genie-mecanique", "genie-electrique", "genie-industriel"],
  },

  // ─── Water & Environment ────────────────────────────────────────────
  {
    name: "ONEP (Office National de l'Eau Potable) - now part of ONEE",
    sector: "Water Treatment & Distribution", sector_fr: "Traitement & Distribution d'Eau",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 40, website: "https://www.onee.ma",
    description: "Division of ONEE responsible for potable water production, treatment, and distribution across Morocco.",
    description_fr: "Division de l'ONEE responsable de la production, le traitement et la distribution d'eau potable à travers le Maroc.",
    fields: ["genie-civil", "genie-mecanique", "genie-electrique"],
  },
  {
    name: "Amendis (Veolia subsidiary)",
    sector: "Water & Sanitation Services", sector_fr: "Services Eau & Assainissement",
    location: "Tangier, Tetouan", location_fr: "Tanger, Tétouan",
    open_positions: 20, website: "https://www.amendis.ma",
    description: "Veolia subsidiary managing water distribution, wastewater treatment, and electricity in northern Morocco.",
    description_fr: "Filiale de Veolia gérant la distribution d'eau, le traitement des eaux usées et l'électricité dans le nord du Maroc.",
    fields: ["genie-civil", "genie-electrique", "genie-mecanique"],
  },

  // ─── Insurance ──────────────────────────────────────────────────────
  {
    name: "Zurich Assurances Maroc",
    sector: "Insurance", sector_fr: "Assurance",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.zurich.ma",
    description: "Swiss insurance giant's Moroccan subsidiary offering life, non-life, and corporate insurance solutions.",
    description_fr: "Filiale marocaine du géant suisse de l'assurance offrant des solutions d'assurance vie, non-vie et entreprise.",
    fields: ["finance", "genie-informatique", "management"],
  },
  {
    name: "AXA Assurance Maroc",
    sector: "Insurance & Financial Services", sector_fr: "Assurance & Services Financiers",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.axa.ma",
    description: "French insurance leader's Moroccan subsidiary, one of the largest insurers in Morocco by premium volume.",
    description_fr: "Filiale marocaine du leader français de l'assurance, l'un des plus grands assureurs au Maroc en volume de primes.",
    fields: ["finance", "genie-informatique", "marketing"],
  },

  // ─── Retail & Distribution ──────────────────────────────────────────
  {
    name: "BIM Stores Maroc",
    sector: "Discount Retail", sector_fr: "Commerce de Détail Discount",
    location: "Casablanca (HQ), nationwide", location_fr: "Casablanca (siège), tout le Maroc",
    open_positions: 50, website: "https://www.bim.ma",
    description: "Turkish discount supermarket chain rapidly expanding in Morocco with 600+ stores nationwide.",
    description_fr: "Chaîne de supermarchés discount turque en expansion rapide au Maroc avec 600+ magasins à l'échelle nationale.",
    fields: ["logistique", "management", "commerce-international"],
  },
  {
    name: "IKEA Maroc (IKEA Morocco)",
    sector: "Home Furnishing Retail", sector_fr: "Commerce d'Ameublement",
    location: "Casablanca, Rabat", location_fr: "Casablanca, Rabat",
    open_positions: 30, website: "https://www.ikea.com/ma",
    description: "Swedish home furnishing retailer with growing Moroccan operations and integrated supply chain.",
    description_fr: "Détaillant suédois d'ameublement avec des opérations marocaines en croissance et une supply chain intégrée.",
    fields: ["logistique", "marketing", "management"],
  },

  // ─── Education & Research ───────────────────────────────────────────
  {
    name: "EMSI (École Marocaine des Sciences de l'Ingénieur)",
    sector: "Higher Education (Engineering)", sector_fr: "Enseignement Supérieur (Ingénierie)",
    location: "Casablanca, Rabat, Marrakech", location_fr: "Casablanca, Rabat, Marrakech",
    open_positions: 20, website: "https://www.emsi.ma",
    description: "Morocco's largest private engineering school with 10+ campuses training 15,000+ students in tech and engineering.",
    description_fr: "Plus grande école d'ingénieurs privée du Maroc avec 10+ campus formant 15 000+ étudiants en tech et ingénierie.",
    fields: ["genie-informatique", "genie-industriel", "management"],
  },
  {
    name: "CNRST (Centre National pour la Recherche Scientifique et Technique)",
    sector: "Scientific Research", sector_fr: "Recherche Scientifique",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 15, website: "https://www.cnrst.ma",
    description: "Morocco's national center for scientific and technical research, funding projects and managing research infrastructure.",
    description_fr: "Centre national du Maroc pour la recherche scientifique et technique, finançant des projets et gérant l'infrastructure de recherche.",
    fields: ["genie-informatique", "genie-electrique", "genie-mecanique"],
  },

  // ─── Hospitality & Tourism ──────────────────────────────────────────
  {
    name: "ONMT (Office National Marocain du Tourisme)",
    sector: "Tourism Promotion", sector_fr: "Promotion Touristique",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 15, website: "https://www.visitmorocco.com",
    description: "National tourism office responsible for promoting Morocco as a destination and developing tourism strategy.",
    description_fr: "Office national du tourisme responsable de la promotion du Maroc comme destination et du développement de la stratégie touristique.",
    fields: ["marketing", "commerce-international", "management"],
  },
  {
    name: "Accor Hotels Maroc",
    sector: "Hospitality & Hotels", sector_fr: "Hôtellerie",
    location: "Casablanca, Marrakech, Agadir", location_fr: "Casablanca, Marrakech, Agadir",
    open_positions: 40, website: "https://www.accor.com",
    description: "French hospitality group operating 40+ hotels in Morocco under brands like Sofitel, Novotel, and Ibis.",
    description_fr: "Groupe hôtelier français exploitant 40+ hôtels au Maroc sous les marques Sofitel, Novotel et Ibis.",
    fields: ["management", "marketing", "ressources-humaines"],
  },

  // ─── Defense & Security ─────────────────────────────────────────────
  {
    name: "Thales Maroc",
    sector: "Defense & Security Electronics", sector_fr: "Électronique de Défense & Sécurité",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.thalesgroup.com",
    description: "French defense and security electronics company providing radar, cybersecurity, and transport solutions in Morocco.",
    description_fr: "Entreprise française d'électronique de défense et sécurité fournissant radar, cybersécurité et solutions de transport au Maroc.",
    fields: ["genie-electrique", "genie-informatique", "genie-mecanique"],
  },

  // ─── Chemical & Materials ───────────────────────────────────────────
  {
    name: "Maghreb Oxygène",
    sector: "Industrial Gases", sector_fr: "Gaz Industriels",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.maghreboxygene.com",
    description: "Leading Moroccan industrial gas company producing oxygen, nitrogen, and hydrogen for medical and industrial use.",
    description_fr: "Première entreprise marocaine de gaz industriels produisant oxygène, azote et hydrogène pour usage médical et industriel.",
    fields: ["genie-mecanique", "genie-industriel", "genie-electrique"],
  },
  {
    name: "Colorado (Peintures)",
    sector: "Paint & Coatings Manufacturing", sector_fr: "Fabrication Peintures & Revêtements",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.colorado.ma",
    description: "Morocco's leading paint manufacturer producing decorative and industrial coatings for construction.",
    description_fr: "Premier fabricant de peinture du Maroc produisant des revêtements décoratifs et industriels pour la construction.",
    fields: ["genie-industriel", "genie-mecanique", "marketing"],
  },

  // ─── BPO & Offshoring ──────────────────────────────────────────────
  {
    name: "Majorel Maroc (now Teleperformance)",
    sector: "BPO & Customer Experience", sector_fr: "BPO & Expérience Client",
    location: "Casablanca, Fez, Marrakech", location_fr: "Casablanca, Fès, Marrakech",
    open_positions: 200, website: "https://www.teleperformance.com",
    description: "Global BPO leader with 10,000+ employees in Morocco providing customer service for international brands.",
    description_fr: "Leader mondial du BPO avec 10 000+ employés au Maroc fournissant du service client pour des marques internationales.",
    fields: ["genie-informatique", "management", "ressources-humaines"],
  },
  {
    name: "Sitel Maroc (Foundever)",
    sector: "Customer Experience Management", sector_fr: "Gestion de l'Expérience Client",
    location: "Casablanca, Rabat", location_fr: "Casablanca, Rabat",
    open_positions: 150, website: "https://www.foundever.com",
    description: "Global CX company operating contact centers in Morocco for European and American companies.",
    description_fr: "Entreprise mondiale de CX exploitant des centres de contact au Maroc pour des entreprises européennes et américaines.",
    fields: ["genie-informatique", "management", "ressources-humaines"],
  },

  // ─── Real Estate & Urban ────────────────────────────────────────────
  {
    name: "Résidences Dar Saada",
    sector: "Affordable Housing", sector_fr: "Logement Social",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.residencesdarsaada.ma",
    description: "Major Moroccan affordable housing developer listed on CSE, contributing to the national housing program.",
    description_fr: "Grand promoteur marocain de logement social coté en bourse, contribuant au programme national de logement.",
    fields: ["genie-civil", "management", "finance"],
  },

  // ─── Media & Communications ─────────────────────────────────────────
  {
    name: "2M (Société Nationale de Radiodiffusion et de Télévision)",
    sector: "Broadcasting & Media", sector_fr: "Audiovisuel & Médias",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.2m.ma",
    description: "Morocco's second national TV channel, a major media company producing news and entertainment content.",
    description_fr: "Deuxième chaîne de télévision nationale du Maroc, grande entreprise médiatique produisant actualités et divertissement.",
    fields: ["genie-informatique", "marketing", "management"],
  },

  // ─── Fintech & Startups ─────────────────────────────────────────────
  {
    name: "HiPay Maroc",
    sector: "Payment Solutions", sector_fr: "Solutions de Paiement",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 15, website: "https://www.hipay.com",
    description: "European payment solutions provider with Moroccan operations enabling e-commerce and omnichannel payments.",
    description_fr: "Fournisseur européen de solutions de paiement avec des opérations marocaines permettant e-commerce et paiements omnicanal.",
    fields: ["genie-informatique", "finance", "commerce-international"],
  },
  {
    name: "CMI (Centre Monétique Interbancaire)",
    sector: "Payment Infrastructure", sector_fr: "Infrastructure de Paiement",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 20, website: "https://www.cmi.co.ma",
    description: "Morocco's interbank electronic payment center managing card transactions and payment infrastructure.",
    description_fr: "Centre monétique interbancaire du Maroc gérant les transactions par carte et l'infrastructure de paiement.",
    fields: ["genie-informatique", "finance", "genie-electrique"],
  },

  // ─── Public Sector & Agencies ───────────────────────────────────────
  {
    name: "ADD (Agence de Développement du Digital)",
    sector: "Digital Government Agency", sector_fr: "Agence Gouvernementale du Numérique",
    location: "Rabat", location_fr: "Rabat",
    open_positions: 20, website: "https://www.add.gov.ma",
    description: "Government agency driving Morocco's digital transformation, e-government services, and digital skills programs.",
    description_fr: "Agence gouvernementale pilotant la transformation numérique du Maroc, services e-gouvernement et programmes de compétences numériques.",
    fields: ["genie-informatique", "management", "genie-electrique"],
  },
  {
    name: "OMPIC (Office Marocain de la Propriété Industrielle et Commerciale)",
    sector: "Intellectual Property", sector_fr: "Propriété Intellectuelle",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 10, website: "https://www.ompic.ma",
    description: "Morocco's industrial property office managing patents, trademarks, and intellectual property protection.",
    description_fr: "Office marocain de la propriété industrielle gérant les brevets, marques et la protection de la propriété intellectuelle.",
    fields: ["management", "commerce-international", "genie-informatique"],
  },
  {
    name: "ANAPEC (Agence Nationale de Promotion de l'Emploi et des Compétences)",
    sector: "Employment & Skills Agency", sector_fr: "Agence de l'Emploi & Compétences",
    location: "Casablanca (HQ), nationwide", location_fr: "Casablanca (siège), tout le Maroc",
    open_positions: 15, website: "https://www.anapec.org",
    description: "National employment agency connecting job seekers with employers and managing vocational training programs.",
    description_fr: "Agence nationale de l'emploi connectant demandeurs d'emploi et employeurs et gérant des programmes de formation professionnelle.",
    fields: ["ressources-humaines", "management"],
  },

  // ─── More Industrial ───────────────────────────────────────────────
  {
    name: "Delattre Levivier Maroc",
    sector: "Metal Construction & Piping", sector_fr: "Construction Métallique & Tuyauterie",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 25, website: "https://www.dlm.ma",
    description: "Listed Moroccan company specializing in metal construction, industrial piping, and steel structures.",
    description_fr: "Société marocaine cotée spécialisée dans la construction métallique, la tuyauterie industrielle et les structures en acier.",
    fields: ["genie-mecanique", "genie-civil", "genie-industriel"],
  },
  {
    name: "Stroc Industrie",
    sector: "Industrial Engineering & EPC", sector_fr: "Ingénierie Industrielle & EPC",
    location: "Casablanca", location_fr: "Casablanca",
    open_positions: 30, website: "https://www.stroc.ma",
    description: "Moroccan industrial engineering group providing EPC services for energy, mining, and infrastructure projects.",
    description_fr: "Groupe marocain d'ingénierie industrielle fournissant des services EPC pour les projets énergie, mines et infrastructure.",
    fields: ["genie-mecanique", "genie-electrique", "genie-civil"],
  },
  {
    name: "Super Cérame",
    sector: "Ceramics Manufacturing", sector_fr: "Fabrication Céramique",
    location: "Kenitra", location_fr: "Kénitra",
    open_positions: 20, website: "https://www.supercerame.com",
    description: "Morocco's leading ceramics manufacturer producing floor and wall tiles for construction industry.",
    description_fr: "Premier fabricant de céramique du Maroc produisant des carreaux de sol et mur pour l'industrie de la construction.",
    fields: ["genie-industriel", "genie-mecanique", "commerce-international"],
  },
  {
    name: "SNEP (Société Nationale d'Electrolyse et de Pétrochimie)",
    sector: "Petrochemicals & Plastics", sector_fr: "Pétrochimie & Plastiques",
    location: "Mohammedia", location_fr: "Mohammedia",
    open_positions: 15, website: "https://www.snep.ma",
    description: "Moroccan petrochemical company producing PVC, caustic soda, and chlorine for construction and industrial markets.",
    description_fr: "Entreprise pétrochimique marocaine produisant PVC, soude caustique et chlore pour les marchés construction et industriel.",
    fields: ["genie-mecanique", "genie-industriel", "genie-electrique"],
  },
];

// ─── MAIN EXECUTION ──────────────────────────────────────────────────────────

async function main() {
  console.log("=== Seed Script: Quiz Questions + Employers (Extra) ===\n");

  await client.connect();
  console.log("Connected to PostgreSQL.\n");

  let questionsInserted = 0;
  let optionsInserted = 0;
  let employersInserted = 0;
  let questionsSkipped = 0;
  let optionsSkipped = 0;
  let employersSkipped = 0;

  // ─── INSERT QUESTIONS + OPTIONS ────────────────────────────────────
  console.log(`Processing ${QUESTIONS.length} questions with options...\n`);

  const startSort = 121; // Start after existing max sort_order of 120

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const sortOrder = startSort + i;

    // Insert question
    const qResult = await client.query(
      `INSERT INTO career_quiz_question (id, quiz_type, question, question_fr, category, type, trait, is_active, sort_order)
       VALUES ($1, 'career_assessment', $2, $3, $4, 'multiple_choice', $5, true, $6)
       ON CONFLICT (id) DO NOTHING
       RETURNING id`,
      [q.id, q.question, q.question_fr, q.category, q.trait, sortOrder]
    );

    if (qResult.rowCount > 0) {
      questionsInserted++;
    } else {
      questionsSkipped++;
    }

    // Insert options (a, b, c, d)
    const optionLabels = ["a", "b", "c", "d"];
    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      const optId = `${q.id}-${optionLabels[j]}`;

      const oResult = await client.query(
        `INSERT INTO career_quiz_option (id, question_id, text, text_fr, icon, scores, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [optId, q.id, opt.text, opt.text_fr, opt.icon, JSON.stringify(opt.scores), j + 1]
      );

      if (oResult.rowCount > 0) {
        optionsInserted++;
      } else {
        optionsSkipped++;
      }
    }
  }

  console.log(`Questions: ${questionsInserted} inserted, ${questionsSkipped} skipped (already exist)`);
  console.log(`Options:   ${optionsInserted} inserted, ${optionsSkipped} skipped (already exist)\n`);

  // ─── INSERT EMPLOYERS ──────────────────────────────────────────────
  // Filter out any that already exist by name (extra safety)
  const newEmployers = EMPLOYERS.filter(e => !EXISTING_EMPLOYERS.has(e.name));
  console.log(`Processing ${newEmployers.length} new employers (${EMPLOYERS.length - newEmployers.length} filtered as already existing)...\n`);

  const empStartSort = 117; // Start after existing max sort_order of 116
  const batchSize = 10;

  for (let batch = 0; batch < newEmployers.length; batch += batchSize) {
    const chunk = newEmployers.slice(batch, batch + batchSize);

    for (let i = 0; i < chunk.length; i++) {
      const e = chunk[i];
      const globalIdx = batch + i;
      const id = crypto.randomUUID();

      const eResult = await client.query(
        `INSERT INTO career_employer (id, name, sector, sector_fr, location, location_fr, open_positions, website, description, description_fr, fields, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [
          id, e.name, e.sector, e.sector_fr, e.location, e.location_fr,
          e.open_positions, e.website, e.description, e.description_fr,
          JSON.stringify(e.fields), empStartSort + globalIdx,
        ]
      );

      if (eResult.rowCount > 0) {
        employersInserted++;
      } else {
        employersSkipped++;
      }
    }
  }

  console.log(`Employers: ${employersInserted} inserted, ${employersSkipped} skipped\n`);

  // ─── VERIFY COUNTS ────────────────────────────────────────────────
  const finalQ = await client.query("SELECT COUNT(*) as cnt FROM career_quiz_question");
  const finalO = await client.query("SELECT COUNT(*) as cnt FROM career_quiz_option");
  const finalE = await client.query("SELECT COUNT(*) as cnt FROM career_employer");

  console.log("=== FINAL DATABASE COUNTS ===");
  console.log(`career_quiz_question: ${finalQ.rows[0].cnt} (was 120)`);
  console.log(`career_quiz_option:   ${finalO.rows[0].cnt} (was 248)`);
  console.log(`career_employer:      ${finalE.rows[0].cnt} (was 117)`);
  console.log("");

  // Category breakdown
  const cats = await client.query(
    "SELECT category, COUNT(*) as cnt FROM career_quiz_question GROUP BY category ORDER BY category"
  );
  console.log("Question categories:");
  for (const row of cats.rows) {
    console.log(`  ${row.category}: ${row.cnt}`);
  }

  // Employer sector breakdown
  const secs = await client.query(
    "SELECT sector, COUNT(*) as cnt FROM career_employer GROUP BY sector ORDER BY cnt DESC LIMIT 20"
  );
  console.log("\nTop employer sectors:");
  for (const row of secs.rows) {
    console.log(`  ${row.sector}: ${row.cnt}`);
  }

  console.log("\n=== SEED COMPLETE ===");
  await client.end();
}

main().catch((err) => {
  console.error("SEED ERROR:", err);
  process.exit(1);
});
