// seed-stories-learning.mjs
// Seeds 120 success stories and 110 learning resources into PostgreSQL
// Usage: node scripts/seed-stories-learning.mjs

import { createRequire } from "module";
import crypto from "crypto";
const require = createRequire(import.meta.url);
const { Client } = require("pg");

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";

// ============================================================================
// DATA POOLS
// ============================================================================

const FIRST_NAMES_MALE = [
  "Mohamed", "Youssef", "Amine", "Rachid", "Omar", "Karim", "Hassan",
  "Mehdi", "Hamza", "Ayoub", "Zakaria", "Ilyas", "Bilal", "Othmane",
  "Soufiane", "Adil", "Khalid", "Nabil", "Samir", "Mouad", "Badr",
  "Taha", "Anass", "Reda", "Ismail", "Driss", "Mounir", "Jawad",
  "Abdellatif", "Hicham"
];

const FIRST_NAMES_FEMALE = [
  "Fatima", "Khadija", "Salma", "Nora", "Amina", "Zineb", "Hajar",
  "Meryem", "Sanaa", "Imane", "Laila", "Houda", "Sara", "Ghita",
  "Asmaa", "Basma", "Rim", "Dounia", "Wiam", "Chaima", "Ikram",
  "Siham", "Nawal", "Hanane", "Soukaina", "Loubna", "Rajaa", "Amal",
  "Lamia", "Nisrine"
];

const LAST_NAMES = [
  "El Amrani", "Benali", "El Idrissi", "Bouziane", "Tazi", "Alaoui",
  "Fassi Fihri", "Berrada", "Chraibi", "El Mansouri", "Bennani",
  "Ouazzani", "Lahlou", "El Moutawakil", "Squalli", "Kettani",
  "Benkirane", "El Fassi", "Tahiri", "Jabri", "Belhaj", "Zouiten",
  "El Harti", "Regragui", "Cherkaoui", "Moussaoui", "El Kabbaj",
  "Bouazza", "Naciri", "Filali", "Sefrioui", "Rhazi", "El Ouafi",
  "Benjelloun", "Kadiri", "Bekkali", "Amrani", "El Khattabi", "Skalli",
  "Lamrani"
];

const UNIVERSITIES = [
  { name: "IMTA", full: "Institut Marocain des Techniques Avancées" },
  { name: "UM5", full: "Université Mohammed V de Rabat" },
  { name: "UM6P", full: "Université Mohammed VI Polytechnique" },
  { name: "ENSA Marrakech", full: "École Nationale des Sciences Appliquées de Marrakech" },
  { name: "ENCG Casablanca", full: "École Nationale de Commerce et de Gestion de Casablanca" },
  { name: "EMI Rabat", full: "École Mohammadia d'Ingénieurs" },
  { name: "EHTP", full: "École Hassania des Travaux Publics" },
  { name: "ENSIAS", full: "École Nationale Supérieure d'Informatique et d'Analyse des Systèmes" },
  { name: "INPT", full: "Institut National des Postes et Télécommunications" },
  { name: "UIR", full: "Université Internationale de Rabat" },
  { name: "EMSI", full: "École Marocaine des Sciences de l'Ingénieur" },
  { name: "ENSA Fès", full: "École Nationale des Sciences Appliquées de Fès" },
  { name: "ENSA Tanger", full: "École Nationale des Sciences Appliquées de Tanger" },
  { name: "FST Mohammedia", full: "Faculté des Sciences et Techniques de Mohammedia" },
  { name: "AIAC", full: "Académie Internationale Mohammed VI de l'Aviation Civile" },
  { name: "ISCAE", full: "Institut Supérieur de Commerce et d'Administration des Entreprises" },
  { name: "ESITH", full: "École Supérieure des Industries du Textile et de l'Habillement" },
  { name: "ENSEM", full: "École Nationale Supérieure d'Électricité et de Mécanique" },
];

const COMPANIES = [
  { name: "OCP Group", location: "Casablanca" },
  { name: "Maroc Telecom", location: "Rabat" },
  { name: "BMCE Bank (Bank of Africa)", location: "Casablanca" },
  { name: "Renault Tanger Méditerranée", location: "Tanger" },
  { name: "Capgemini Morocco", location: "Casablanca" },
  { name: "Atos Morocco", location: "Casablanca" },
  { name: "CGI Morocco", location: "Rabat" },
  { name: "Deloitte Morocco", location: "Casablanca" },
  { name: "PwC Morocco", location: "Casablanca" },
  { name: "KPMG Morocco", location: "Casablanca" },
  { name: "Société Générale Maroc", location: "Casablanca" },
  { name: "Attijariwafa Bank", location: "Casablanca" },
  { name: "Banque Populaire", location: "Casablanca" },
  { name: "Royal Air Maroc", location: "Casablanca" },
  { name: "ONCF", location: "Rabat" },
  { name: "ONE (ONEE)", location: "Casablanca" },
  { name: "Managem Group", location: "Casablanca" },
  { name: "LafargeHolcim Maroc", location: "Casablanca" },
  { name: "Inwi", location: "Casablanca" },
  { name: "Orange Maroc", location: "Casablanca" },
  { name: "Lydec", location: "Casablanca" },
  { name: "Saham Assurance", location: "Casablanca" },
  { name: "Wafa Assurance", location: "Casablanca" },
  { name: "HPS (Hightech Payment Systems)", location: "Casablanca" },
  { name: "S2M (Solutions Monétiques et Microprocesseurs)", location: "Casablanca" },
  { name: "Sopra Banking Morocco", location: "Casablanca" },
  { name: "NTT Data Morocco", location: "Casablanca" },
  { name: "IBM Morocco", location: "Casablanca" },
  { name: "Microsoft Morocco", location: "Casablanca" },
  { name: "Huawei Morocco", location: "Rabat" },
  { name: "Altran Morocco", location: "Casablanca" },
  { name: "Accenture Morocco", location: "Casablanca" },
  { name: "Tata Consultancy Morocco", location: "Casablanca" },
  { name: "Alten Morocco", location: "Rabat" },
  { name: "Thales Morocco", location: "Casablanca" },
  { name: "STMicroelectronics Morocco", location: "Bouskoura" },
  { name: "Bombardier Morocco", location: "Casablanca" },
  { name: "Safran Morocco", location: "Casablanca" },
  { name: "PSA Peugeot Citroën Kénitra", location: "Kénitra" },
  { name: "Yazaki Morocco", location: "Tanger" },
  { name: "Sumitomo Morocco", location: "Tanger" },
  { name: "Delphi Morocco", location: "Tanger" },
  { name: "Leoni Morocco", location: "Berrechid" },
  { name: "Total Energies Morocco", location: "Casablanca" },
  { name: "Vivo Energy Morocco", location: "Casablanca" },
  { name: "TMSA (Tanger Med)", location: "Tanger" },
  { name: "Ciment du Maroc", location: "Casablanca" },
  { name: "Cosumar", location: "Casablanca" },
  { name: "Lesieur Cristal", location: "Casablanca" },
  { name: "Centrale Danone", location: "Casablanca" },
];

const LOCATIONS = [
  "Casablanca", "Rabat", "Tanger", "Marrakech", "Fès", "Agadir",
  "Kénitra", "Meknès", "Oujda", "Tétouan", "Mohammedia", "El Jadida",
  "Beni Mellal", "Settat", "Khouribga", "Laayoune"
];

const FIELDS = [
  "technology", "healthcare", "finance", "engineering", "industrial",
  "automotive", "energy", "telecommunications", "consulting", "education"
];

const ROLES = [
  // Tech
  { fr: "Ingénieur Logiciel", en: "Software Engineer", field: "technology" },
  { fr: "Développeur Full Stack", en: "Full Stack Developer", field: "technology" },
  { fr: "Data Scientist", en: "Data Scientist", field: "technology" },
  { fr: "Ingénieur DevOps", en: "DevOps Engineer", field: "technology" },
  { fr: "Architecte Cloud", en: "Cloud Architect", field: "technology" },
  { fr: "Chef de Projet IT", en: "IT Project Manager", field: "technology" },
  { fr: "Ingénieur IA", en: "AI Engineer", field: "technology" },
  { fr: "Analyste Cybersécurité", en: "Cybersecurity Analyst", field: "technology" },
  { fr: "Ingénieur QA", en: "QA Engineer", field: "technology" },
  { fr: "Développeur Mobile", en: "Mobile Developer", field: "technology" },
  { fr: "Administrateur Systèmes", en: "Systems Administrator", field: "technology" },
  { fr: "Lead Technique", en: "Technical Lead", field: "technology" },
  { fr: "Architecte Solutions", en: "Solutions Architect", field: "technology" },
  { fr: "Product Owner", en: "Product Owner", field: "technology" },
  // Finance
  { fr: "Analyste Financier", en: "Financial Analyst", field: "finance" },
  { fr: "Contrôleur de Gestion", en: "Management Controller", field: "finance" },
  { fr: "Auditeur Senior", en: "Senior Auditor", field: "finance" },
  { fr: "Risk Manager", en: "Risk Manager", field: "finance" },
  { fr: "Chargé de Clientèle Entreprise", en: "Corporate Account Manager", field: "finance" },
  { fr: "Directeur Financier Adjoint", en: "Deputy CFO", field: "finance" },
  // Healthcare
  { fr: "Ingénieur Biomédical", en: "Biomedical Engineer", field: "healthcare" },
  { fr: "Responsable Qualité Santé", en: "Healthcare Quality Manager", field: "healthcare" },
  { fr: "Chef de Projet E-Santé", en: "E-Health Project Manager", field: "healthcare" },
  { fr: "Pharmacien Industriel", en: "Industrial Pharmacist", field: "healthcare" },
  // Engineering
  { fr: "Ingénieur Procédés", en: "Process Engineer", field: "engineering" },
  { fr: "Ingénieur Génie Civil", en: "Civil Engineer", field: "engineering" },
  { fr: "Ingénieur Mécanique", en: "Mechanical Engineer", field: "engineering" },
  { fr: "Ingénieur Électrique", en: "Electrical Engineer", field: "engineering" },
  { fr: "Ingénieur HSE", en: "HSE Engineer", field: "industrial" },
  // Industrial
  { fr: "Responsable Production", en: "Production Manager", field: "industrial" },
  { fr: "Ingénieur Maintenance", en: "Maintenance Engineer", field: "industrial" },
  { fr: "Directeur Usine Adjoint", en: "Deputy Plant Director", field: "industrial" },
  { fr: "Ingénieur Qualité", en: "Quality Engineer", field: "industrial" },
  // Automotive
  { fr: "Ingénieur Automobile", en: "Automotive Engineer", field: "automotive" },
  { fr: "Chef de Ligne Production", en: "Production Line Manager", field: "automotive" },
  // Consulting
  { fr: "Consultant Senior", en: "Senior Consultant", field: "consulting" },
  { fr: "Manager Conseil", en: "Consulting Manager", field: "consulting" },
  { fr: "Consultant ERP SAP", en: "SAP ERP Consultant", field: "consulting" },
  // Telecom
  { fr: "Ingénieur Réseaux", en: "Network Engineer", field: "telecommunications" },
  { fr: "Ingénieur Télécom", en: "Telecom Engineer", field: "telecommunications" },
  // Energy
  { fr: "Ingénieur Énergie Renouvelable", en: "Renewable Energy Engineer", field: "energy" },
  { fr: "Chef de Projet Énergie", en: "Energy Project Manager", field: "energy" },
];

const SALARY_RANGES = [
  "8 000 - 12 000 MAD", "10 000 - 15 000 MAD", "12 000 - 18 000 MAD",
  "15 000 - 22 000 MAD", "18 000 - 25 000 MAD", "20 000 - 30 000 MAD",
  "25 000 - 35 000 MAD", "30 000 - 45 000 MAD", "35 000 - 50 000 MAD",
  "40 000 - 60 000 MAD", "50 000 - 70 000 MAD", "60 000+ MAD"
];

// ============================================================================
// STORY TEMPLATES
// ============================================================================

function generateStoryFr(name, uni, company, role, year) {
  const templates = [
    `Après ma formation à ${uni}, j'ai rejoint ${company} en tant que ${role}. Ce parcours m'a permis de développer des compétences solides et de contribuer à des projets d'envergure nationale. Chaque défi rencontré a été une opportunité d'apprentissage qui m'a propulsé vers l'excellence.`,
    `Diplômé(e) de ${uni} en ${year}, j'ai rapidement intégré ${company} où j'ai pu mettre en pratique mes connaissances. Mon parcours illustre que la persévérance et le travail acharné ouvrent toutes les portes au Maroc.`,
    `Ma carrière a débuté chez ${company} juste après ${uni}. Aujourd'hui, en tant que ${role}, je suis fier(ère) de participer à la transformation digitale du Maroc. La formation technique combinée à la curiosité intellectuelle fait toute la différence.`,
    `De ${uni} à ${company}, mon parcours a été marqué par une passion constante pour l'innovation. En tant que ${role}, je contribue chaque jour à des solutions qui impactent des millions de Marocains.`,
    `Grâce à l'excellence de la formation reçue à ${uni}, j'ai pu décrocher un poste de ${role} chez ${company} dès la fin de mes études. Le marché marocain regorge d'opportunités pour les jeunes diplômés motivés.`,
    `Mon aventure professionnelle chez ${company} a commencé en ${year}. Formé(e) à ${uni}, j'ai appris que la clé du succès réside dans la combinaison de compétences techniques et de soft skills.`,
    `Issu(e) de ${uni}, j'ai eu la chance de rejoindre ${company} dans un environnement multiculturel stimulant. Mon rôle de ${role} me permet d'allier innovation technologique et impact social positif.`,
    `Le passage de ${uni} au monde professionnel chez ${company} a été une transition naturelle grâce à une formation orientée pratique. Aujourd'hui, je manage une équipe de ${Math.floor(Math.random() * 15) + 3} personnes et je ne cesse d'apprendre.`,
    `Après ${uni}, j'ai choisi de rester au Maroc malgré les opportunités à l'étranger. Chez ${company}, j'ai trouvé un environnement propice à l'épanouissement professionnel et à l'innovation.`,
    `Trois ans après ma sortie de ${uni}, je suis ${role} chez ${company}. Mon parcours prouve que les talents marocains n'ont rien à envier à leurs homologues internationaux.`,
    `Formé(e) à ${uni}, j'ai intégré ${company} lors d'un stage qui s'est transformé en CDI. Aujourd'hui ${role}, je pilote des projets stratégiques qui façonnent l'avenir de notre secteur.`,
    `L'excellence académique de ${uni} m'a ouvert les portes de ${company}. En tant que ${role}, je participe activement à des projets innovants qui positionnent le Maroc comme hub technologique régional.`,
    `Mon parcours de ${uni} à ${company} m'a appris que le networking et les compétences transversales sont aussi importants que l'expertise technique. Le Maroc offre un écosystème professionnel dynamique et en pleine croissance.`,
    `Diplômé(e) de ${uni}, j'ai débuté chez ${company} comme stagiaire. Aujourd'hui ${role}, je dirige des initiatives clés. La persévérance et l'adaptabilité sont les maîtres-mots de ma réussite.`,
    `Chez ${company}, j'ai découvert que ma formation à ${uni} m'avait parfaitement préparé(e) aux exigences du monde professionnel. Mon rôle de ${role} me passionne et me pousse à me dépasser chaque jour.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateStoryEn(name, uni, company, role, year) {
  const templates = [
    `After graduating from ${uni}, I joined ${company} as a ${role}. This journey has allowed me to develop strong skills and contribute to nationally significant projects. Every challenge has been a learning opportunity pushing me toward excellence.`,
    `Graduating from ${uni} in ${year}, I quickly integrated into ${company} where I applied my knowledge in real-world scenarios. My journey shows that perseverance and hard work open all doors in Morocco.`,
    `My career began at ${company} right after ${uni}. Today, as a ${role}, I'm proud to participate in Morocco's digital transformation. Technical training combined with intellectual curiosity makes all the difference.`,
    `From ${uni} to ${company}, my path has been driven by a constant passion for innovation. As a ${role}, I contribute daily to solutions that impact millions of Moroccans.`,
    `Thanks to the excellent education at ${uni}, I secured a ${role} position at ${company} right after graduation. The Moroccan market is full of opportunities for motivated young graduates.`,
    `My professional adventure at ${company} began in ${year}. Trained at ${uni}, I learned that success lies in combining technical skills with soft skills.`,
    `Coming from ${uni}, I had the opportunity to join ${company} in a stimulating multicultural environment. My role as ${role} allows me to combine technological innovation with positive social impact.`,
    `The transition from ${uni} to ${company} was seamless thanks to practice-oriented training. Today, I manage a team of ${Math.floor(Math.random() * 15) + 3} people and continue learning every day.`,
    `After ${uni}, I chose to stay in Morocco despite international opportunities. At ${company}, I found an environment conducive to professional growth and innovation.`,
    `Three years after graduating from ${uni}, I'm a ${role} at ${company}. My journey proves that Moroccan talent is on par with international counterparts.`,
    `Trained at ${uni}, I joined ${company} during an internship that turned into a permanent position. Now a ${role}, I lead strategic projects shaping the future of our industry.`,
    `The academic excellence at ${uni} opened doors at ${company}. As a ${role}, I actively contribute to innovative projects positioning Morocco as a regional tech hub.`,
    `My path from ${uni} to ${company} taught me that networking and cross-functional skills are as important as technical expertise. Morocco offers a dynamic and growing professional ecosystem.`,
    `Graduating from ${uni}, I started at ${company} as an intern. Now a ${role}, I lead key initiatives. Perseverance and adaptability are the keywords of my success.`,
    `At ${company}, I discovered that my training at ${uni} had perfectly prepared me for professional demands. My role as ${role} excites me and pushes me to exceed expectations every day.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

const ACHIEVEMENTS_FR = [
  "Réduction de 40% des coûts opérationnels grâce à l'automatisation",
  "Mise en place d'une architecture microservices servant 2M d'utilisateurs",
  "Développement d'un algorithme d'IA améliorant la détection de 35%",
  "Gestion d'un projet de transformation digitale de 5M MAD",
  "Formation de 50+ collaborateurs sur les nouvelles technologies",
  "Obtention de la certification ISO 27001 pour l'entreprise",
  "Lancement d'un produit générant 10M MAD de revenus la première année",
  "Optimisation des processus réduisant le time-to-market de 60%",
  "Création d'un centre d'excellence data analytics",
  "Migration cloud réussie de 200+ applications legacy",
  "Conception d'un système IoT pour le monitoring industriel en temps réel",
  "Publication de 3 articles dans des revues internationales",
  "Prix de l'innovation décerné par la chambre de commerce",
  "Déploiement d'un ERP intégré pour 500+ utilisateurs",
  "Amélioration du NPS client de 45 à 78 points",
  "Mise en conformité RGPD de l'ensemble du système d'information",
  "Développement d'une plateforme e-commerce traitant 100K transactions/jour",
  "Réduction de l'empreinte carbone de l'usine de 25%",
  "Implémentation d'un pipeline CI/CD réduisant les bugs de 70%",
  "Négociation d'un contrat stratégique de 20M MAD",
];

const ACHIEVEMENTS_EN = [
  "Reduced operational costs by 40% through automation",
  "Built microservices architecture serving 2M users",
  "Developed AI algorithm improving detection by 35%",
  "Managed a 5M MAD digital transformation project",
  "Trained 50+ employees on new technologies",
  "Achieved ISO 27001 certification for the company",
  "Launched a product generating 10M MAD in first-year revenue",
  "Optimized processes reducing time-to-market by 60%",
  "Created a data analytics center of excellence",
  "Successfully migrated 200+ legacy applications to cloud",
  "Designed real-time IoT monitoring system for industry",
  "Published 3 articles in international journals",
  "Received innovation award from the chamber of commerce",
  "Deployed integrated ERP system for 500+ users",
  "Improved customer NPS from 45 to 78 points",
  "Achieved GDPR compliance across all information systems",
  "Developed e-commerce platform processing 100K transactions/day",
  "Reduced factory carbon footprint by 25%",
  "Implemented CI/CD pipeline reducing bugs by 70%",
  "Negotiated a strategic 20M MAD contract",
];

const ADVICE_FR = [
  "Ne sous-estimez jamais le pouvoir du networking. Les relations professionnelles sont aussi importantes que vos compétences techniques.",
  "Investissez dans l'apprentissage continu. Le marché évolue rapidement et ceux qui s'adaptent réussissent.",
  "N'ayez pas peur de commencer petit. Chaque expérience compte et contribue à votre croissance professionnelle.",
  "Maîtrisez au moins deux langues étrangères. Le français et l'anglais sont indispensables au Maroc.",
  "Développez vos soft skills autant que vos compétences techniques. La communication est la clé du leadership.",
  "Restez curieux et n'hésitez pas à sortir de votre zone de confort. C'est là que se produisent les plus grandes avancées.",
  "Construisez votre personal branding dès le début. LinkedIn est votre vitrine professionnelle.",
  "Cherchez un mentor dans votre domaine. Son expérience vous évitera de nombreuses erreurs.",
  "Le marché marocain est plein d'opportunités. Il suffit de les saisir avec détermination et professionnalisme.",
  "Participez à des événements et des communautés professionnelles. Le capital social est un accélérateur de carrière.",
  "Soyez patient mais ambitieux. La réussite au Maroc demande de la persévérance et de la stratégie.",
  "Contribuez à des projets open source ou personnels. Ils démontrent votre passion et vos compétences.",
  "Préparez vos entretiens comme des présentations professionnelles. La première impression est déterminante.",
  "Ne négligez pas la culture d'entreprise dans vos choix. L'environnement de travail impacte votre épanouissement.",
  "Apprenez à gérer votre temps efficacement. La productivité est une compétence qui se cultive.",
];

const ADVICE_EN = [
  "Never underestimate the power of networking. Professional relationships are as important as technical skills.",
  "Invest in continuous learning. The market evolves quickly and those who adapt succeed.",
  "Don't be afraid to start small. Every experience counts and contributes to your professional growth.",
  "Master at least two foreign languages. French and English are essential in Morocco.",
  "Develop your soft skills as much as your technical competencies. Communication is the key to leadership.",
  "Stay curious and don't hesitate to step out of your comfort zone. That's where breakthroughs happen.",
  "Build your personal brand from the start. LinkedIn is your professional showcase.",
  "Find a mentor in your field. Their experience will help you avoid many mistakes.",
  "The Moroccan market is full of opportunities. You just need to seize them with determination and professionalism.",
  "Participate in events and professional communities. Social capital is a career accelerator.",
  "Be patient but ambitious. Success in Morocco requires perseverance and strategy.",
  "Contribute to open source or personal projects. They demonstrate your passion and skills.",
  "Prepare your interviews like professional presentations. First impressions are decisive.",
  "Don't overlook company culture in your choices. Work environment impacts your fulfillment.",
  "Learn to manage your time effectively. Productivity is a skill that can be cultivated.",
];

const TAG_POOLS = {
  technology: ["devops", "cloud", "python", "javascript", "react", "nodejs", "microservices", "docker", "kubernetes", "aws", "azure", "gcp", "machine-learning", "deep-learning", "data-science", "cybersecurity", "agile", "scrum", "mobile", "flutter", "spring", "java", "dotnet", "sql", "nosql"],
  finance: ["audit", "controlling", "risk-management", "compliance", "banking", "fintech", "excel", "sap", "accounting", "financial-analysis"],
  healthcare: ["biomedical", "e-health", "pharma", "quality-assurance", "medical-devices", "clinical-research"],
  engineering: ["civil-engineering", "mechanical", "electrical", "process-engineering", "autocad", "solidworks", "matlab"],
  industrial: ["lean-manufacturing", "six-sigma", "hse", "maintenance", "quality", "production", "supply-chain"],
  automotive: ["automotive", "production-line", "lean", "quality-control", "iatf-16949"],
  energy: ["renewable-energy", "solar", "wind", "energy-efficiency", "environmental"],
  telecommunications: ["telecom", "5g", "networks", "fiber-optics", "iot"],
  consulting: ["strategy", "management-consulting", "erp", "sap", "digital-transformation"],
  education: ["training", "e-learning", "pedagogy", "curriculum-design"],
};

// ============================================================================
// LEARNING RESOURCE DATA
// ============================================================================

const RESOURCE_TYPES = ["course", "tutorial", "book", "article", "video", "podcast", "workshop", "certification", "tool", "community"];
const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];
const COST_TYPES = ["free", "paid", "subscription", "freemium"];

const LEARNING_RESOURCES_DATA = [
  // Coursera
  { title: "Machine Learning Specialization", title_fr: "Spécialisation en Machine Learning", desc: "Comprehensive ML course by Andrew Ng covering supervised and unsupervised learning, neural networks, and best practices.", desc_fr: "Cours complet de ML par Andrew Ng couvrant l'apprentissage supervisé et non supervisé, les réseaux de neurones et les bonnes pratiques.", type: "course", diff: "intermediate", cost: "subscription", price: 49, platform: "Coursera", provider: "Stanford University", url: "https://www.coursera.org/specializations/machine-learning-introduction", dur_min: 0, dur_weeks: 12, skills: ["Machine Learning", "Python", "TensorFlow", "Neural Networks"], fields: ["technology"], langs: ["en"], rating: 4.9 },
  { title: "Google Data Analytics Professional Certificate", title_fr: "Certificat professionnel Google en analyse de données", desc: "Learn data analytics skills including data cleaning, analysis, visualization with R and SQL.", desc_fr: "Apprenez les compétences en analyse de données, y compris le nettoyage, l'analyse et la visualisation avec R et SQL.", type: "certification", diff: "beginner", cost: "subscription", price: 49, platform: "Coursera", provider: "Google", url: "https://www.coursera.org/professional-certificates/google-data-analytics", dur_min: 0, dur_weeks: 24, skills: ["Data Analytics", "SQL", "R", "Data Visualization", "Tableau"], fields: ["technology", "finance"], langs: ["en", "fr"], rating: 4.8 },
  { title: "IBM Cybersecurity Analyst Professional Certificate", title_fr: "Certificat professionnel IBM en analyse de cybersécurité", desc: "Develop skills for an entry-level cybersecurity analyst role with IBM's professional certificate.", desc_fr: "Développez les compétences pour un poste d'analyste en cybersécurité de niveau débutant avec le certificat professionnel d'IBM.", type: "certification", diff: "beginner", cost: "subscription", price: 49, platform: "Coursera", provider: "IBM", url: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst", dur_min: 0, dur_weeks: 16, skills: ["Cybersecurity", "Network Security", "Threat Intelligence", "SIEM"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Deep Learning Specialization", title_fr: "Spécialisation en Deep Learning", desc: "Master deep learning fundamentals and build neural networks with TensorFlow.", desc_fr: "Maîtrisez les fondamentaux du deep learning et construisez des réseaux de neurones avec TensorFlow.", type: "course", diff: "advanced", cost: "subscription", price: 49, platform: "Coursera", provider: "DeepLearning.AI", url: "https://www.coursera.org/specializations/deep-learning", dur_min: 0, dur_weeks: 20, skills: ["Deep Learning", "TensorFlow", "CNN", "RNN", "NLP"], fields: ["technology"], langs: ["en"], rating: 4.9 },
  { title: "Google Project Management Certificate", title_fr: "Certificat Google en gestion de projet", desc: "Learn project management fundamentals, Agile, and Scrum methodologies from Google.", desc_fr: "Apprenez les fondamentaux de la gestion de projet, les méthodologies Agile et Scrum de Google.", type: "certification", diff: "beginner", cost: "subscription", price: 49, platform: "Coursera", provider: "Google", url: "https://www.coursera.org/professional-certificates/google-project-management", dur_min: 0, dur_weeks: 24, skills: ["Project Management", "Agile", "Scrum", "Risk Management"], fields: ["technology", "consulting"], langs: ["en", "fr"], rating: 4.8 },
  { title: "Financial Markets by Yale", title_fr: "Marchés financiers par Yale", desc: "Understanding financial markets, insurance, banking, and monetary policy.", desc_fr: "Compréhension des marchés financiers, des assurances, de la banque et de la politique monétaire.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "Coursera", provider: "Yale University", url: "https://www.coursera.org/learn/financial-markets-global", dur_min: 0, dur_weeks: 7, skills: ["Financial Markets", "Banking", "Insurance", "Monetary Policy"], fields: ["finance"], langs: ["en"], rating: 4.8 },
  { title: "AWS Cloud Practitioner Essentials", title_fr: "Fondamentaux AWS Cloud Practitioner", desc: "Introduction to AWS cloud concepts, services, security, and pricing.", desc_fr: "Introduction aux concepts cloud AWS, services, sécurité et tarification.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "Amazon Web Services", url: "https://www.coursera.org/learn/aws-cloud-practitioner-essentials", dur_min: 0, dur_weeks: 6, skills: ["AWS", "Cloud Computing", "Cloud Security", "Cloud Architecture"], fields: ["technology"], langs: ["en"], rating: 4.7 },

  // Udemy
  { title: "The Complete Web Developer Bootcamp", title_fr: "Bootcamp complet du développeur web", desc: "Full-stack web development from HTML to React, Node.js, MongoDB and deployment.", desc_fr: "Développement web full-stack de HTML à React, Node.js, MongoDB et déploiement.", type: "course", diff: "beginner", cost: "paid", price: 89, platform: "Udemy", provider: "Dr. Angela Yu", url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", dur_min: 3960, dur_weeks: 0, skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Python for Data Science and ML Bootcamp", title_fr: "Bootcamp Python pour Data Science et ML", desc: "Learn to use NumPy, Pandas, Matplotlib, Scikit-Learn for data science projects.", desc_fr: "Apprenez à utiliser NumPy, Pandas, Matplotlib, Scikit-Learn pour des projets de data science.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Jose Portilla", url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/", dur_min: 1500, dur_weeks: 0, skills: ["Python", "NumPy", "Pandas", "Scikit-Learn", "Machine Learning"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Docker and Kubernetes: The Complete Guide", title_fr: "Docker et Kubernetes : Le guide complet", desc: "Master Docker and Kubernetes for containerized application deployment.", desc_fr: "Maîtrisez Docker et Kubernetes pour le déploiement d'applications conteneurisées.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Stephen Grider", url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/", dur_min: 1380, dur_weeks: 0, skills: ["Docker", "Kubernetes", "DevOps", "CI/CD", "Microservices"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "SAP S/4HANA for Beginners", title_fr: "SAP S/4HANA pour débutants", desc: "Introduction to SAP S/4HANA ERP system covering finance, logistics and HR modules.", desc_fr: "Introduction au système ERP SAP S/4HANA couvrant les modules finance, logistique et RH.", type: "course", diff: "beginner", cost: "paid", price: 59, platform: "Udemy", provider: "Peter Moxon", url: "https://www.udemy.com/course/sap-s4hana-for-beginners/", dur_min: 720, dur_weeks: 0, skills: ["SAP", "ERP", "S/4HANA", "Business Processes"], fields: ["consulting", "finance"], langs: ["en"], rating: 4.5 },
  { title: "Lean Six Sigma Green Belt Certification", title_fr: "Certification Lean Six Sigma Green Belt", desc: "Complete Lean Six Sigma Green Belt course with real-world projects and exam prep.", desc_fr: "Cours complet Lean Six Sigma Green Belt avec des projets réels et préparation à l'examen.", type: "certification", diff: "intermediate", cost: "paid", price: 99, platform: "Udemy", provider: "Robert Chapman", url: "https://www.udemy.com/course/lean-six-sigma-green-belt-certification/", dur_min: 960, dur_weeks: 0, skills: ["Lean", "Six Sigma", "DMAIC", "Process Improvement", "Quality Management"], fields: ["industrial", "engineering"], langs: ["en"], rating: 4.5 },
  { title: "Advanced Excel: Power Query and Power Pivot", title_fr: "Excel avancé : Power Query et Power Pivot", desc: "Master advanced Excel features for business intelligence and data modeling.", desc_fr: "Maîtrisez les fonctionnalités avancées d'Excel pour la business intelligence et la modélisation de données.", type: "course", diff: "advanced", cost: "paid", price: 69, platform: "Udemy", provider: "Maven Analytics", url: "https://www.udemy.com/course/microsoft-excel-power-query-power-pivot/", dur_min: 480, dur_weeks: 0, skills: ["Excel", "Power Query", "Power Pivot", "DAX", "Data Modeling"], fields: ["finance", "consulting"], langs: ["en"], rating: 4.7 },
  { title: "React - The Complete Guide 2025", title_fr: "React - Le guide complet 2025", desc: "Build powerful React apps with hooks, Redux, Next.js and TypeScript.", desc_fr: "Construisez des applications React puissantes avec hooks, Redux, Next.js et TypeScript.", type: "course", diff: "intermediate", cost: "paid", price: 89, platform: "Udemy", provider: "Maximilian Schwarzmüller", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", dur_min: 2940, dur_weeks: 0, skills: ["React", "Redux", "Next.js", "TypeScript", "Hooks"], fields: ["technology"], langs: ["en"], rating: 4.7 },

  // edX
  { title: "CS50: Introduction to Computer Science", title_fr: "CS50 : Introduction à l'informatique", desc: "Harvard's legendary intro to CS covering algorithms, data structures, and web development.", desc_fr: "La légendaire introduction à l'informatique de Harvard couvrant les algorithmes, les structures de données et le développement web.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "edX", provider: "Harvard University", url: "https://www.edx.org/course/cs50s-introduction-to-computer-science", dur_min: 0, dur_weeks: 12, skills: ["C", "Python", "SQL", "Algorithms", "Data Structures"], fields: ["technology"], langs: ["en"], rating: 4.9 },
  { title: "Principles of Blockchain", title_fr: "Principes de la Blockchain", desc: "Understand blockchain technology, smart contracts, and decentralized applications.", desc_fr: "Comprenez la technologie blockchain, les smart contracts et les applications décentralisées.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "edX", provider: "UC Berkeley", url: "https://www.edx.org/course/blockchain-fundamentals", dur_min: 0, dur_weeks: 8, skills: ["Blockchain", "Smart Contracts", "Ethereum", "Cryptography"], fields: ["technology", "finance"], langs: ["en"], rating: 4.5 },
  { title: "MicroMasters in Supply Chain Management", title_fr: "MicroMasters en gestion de la chaîne d'approvisionnement", desc: "MIT's comprehensive supply chain management program covering logistics, analytics and strategy.", desc_fr: "Programme complet de gestion de la chaîne d'approvisionnement du MIT couvrant logistique, analytique et stratégie.", type: "course", diff: "advanced", cost: "paid", price: 1500, platform: "edX", provider: "MIT", url: "https://www.edx.org/micromasters/mitx-supply-chain-management", dur_min: 0, dur_weeks: 48, skills: ["Supply Chain", "Logistics", "Operations Management", "Analytics"], fields: ["industrial", "engineering"], langs: ["en"], rating: 4.7 },
  { title: "Introduction to Linux", title_fr: "Introduction à Linux", desc: "Learn Linux fundamentals for system administration and DevOps.", desc_fr: "Apprenez les fondamentaux de Linux pour l'administration système et le DevOps.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "edX", provider: "Linux Foundation", url: "https://www.edx.org/course/introduction-to-linux", dur_min: 0, dur_weeks: 14, skills: ["Linux", "Shell Scripting", "System Administration", "CLI"], fields: ["technology"], langs: ["en"], rating: 4.7 },

  // OpenClassrooms
  { title: "Développeur Web Full-Stack", title_fr: "Développeur Web Full-Stack", desc: "Complete full-stack web developer path with HTML, CSS, JavaScript, Node.js and React.", desc_fr: "Parcours complet de développeur web full-stack avec HTML, CSS, JavaScript, Node.js et React.", type: "course", diff: "intermediate", cost: "subscription", price: 300, platform: "OpenClassrooms", provider: "OpenClassrooms", url: "https://openclassrooms.com/fr/paths/556-developpeur-web", dur_min: 0, dur_weeks: 36, skills: ["HTML", "CSS", "JavaScript", "Node.js", "React", "Express"], fields: ["technology"], langs: ["fr"], rating: 4.4 },
  { title: "Gérez un projet digital avec Agile", title_fr: "Gérez un projet digital avec Agile", desc: "Master Agile project management for digital projects with Scrum and Kanban.", desc_fr: "Maîtrisez la gestion de projet Agile pour les projets digitaux avec Scrum et Kanban.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "OpenClassrooms", provider: "OpenClassrooms", url: "https://openclassrooms.com/fr/courses/4507926-gerez-un-projet-digital-avec-une-methodologie-en-cascade", dur_min: 600, dur_weeks: 0, skills: ["Agile", "Scrum", "Kanban", "Project Management"], fields: ["technology", "consulting"], langs: ["fr"], rating: 4.3 },
  { title: "Apprenez à programmer en Python", title_fr: "Apprenez à programmer en Python", desc: "Learn Python programming from scratch with practical exercises and projects.", desc_fr: "Apprenez la programmation Python depuis zéro avec des exercices pratiques et des projets.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "OpenClassrooms", provider: "OpenClassrooms", url: "https://openclassrooms.com/fr/courses/7168871-apprenez-les-bases-du-langage-python", dur_min: 900, dur_weeks: 0, skills: ["Python", "Programming Basics", "Data Types", "Functions"], fields: ["technology"], langs: ["fr"], rating: 4.5 },
  { title: "Administrateur Infrastructure et Cloud", title_fr: "Administrateur Infrastructure et Cloud", desc: "Learn cloud infrastructure administration with Linux, Docker, and AWS.", desc_fr: "Apprenez l'administration d'infrastructure cloud avec Linux, Docker et AWS.", type: "course", diff: "advanced", cost: "subscription", price: 300, platform: "OpenClassrooms", provider: "OpenClassrooms", url: "https://openclassrooms.com/fr/paths/590-administrateur-infrastructure-et-cloud", dur_min: 0, dur_weeks: 48, skills: ["Linux", "Docker", "AWS", "Networking", "Cloud Security"], fields: ["technology"], langs: ["fr"], rating: 4.3 },
  { title: "Data Analyst", title_fr: "Data Analyst", desc: "Become a data analyst with Python, SQL, and data visualization tools.", desc_fr: "Devenez data analyst avec Python, SQL et les outils de visualisation de données.", type: "course", diff: "intermediate", cost: "subscription", price: 300, platform: "OpenClassrooms", provider: "OpenClassrooms", url: "https://openclassrooms.com/fr/paths/529-data-analyst", dur_min: 0, dur_weeks: 36, skills: ["Python", "SQL", "Data Visualization", "Pandas", "Power BI"], fields: ["technology", "finance"], langs: ["fr"], rating: 4.4 },

  // OFPPT
  { title: "Technicien Spécialisé en Développement Informatique", title_fr: "Technicien Spécialisé en Développement Informatique", desc: "OFPPT's comprehensive IT development program covering web and mobile development.", desc_fr: "Programme complet de développement informatique de l'OFPPT couvrant le développement web et mobile.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "OFPPT", provider: "OFPPT", url: "https://www.ofppt.ma/fr/filiere/technicien-specialise-en-developpement-informatique", dur_min: 0, dur_weeks: 96, skills: ["Java", "PHP", "SQL", "HTML", "CSS", "JavaScript"], fields: ["technology"], langs: ["fr"], rating: 4.0 },
  { title: "Technicien en Maintenance Industrielle", title_fr: "Technicien en Maintenance Industrielle", desc: "OFPPT industrial maintenance program covering mechanical, electrical and hydraulic systems.", desc_fr: "Programme OFPPT de maintenance industrielle couvrant les systèmes mécaniques, électriques et hydrauliques.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "OFPPT", provider: "OFPPT", url: "https://www.ofppt.ma/fr/filiere/technicien-en-maintenance-industrielle", dur_min: 0, dur_weeks: 96, skills: ["Industrial Maintenance", "Mechanical Systems", "Electrical Systems", "Hydraulics"], fields: ["industrial", "engineering"], langs: ["fr"], rating: 3.9 },
  { title: "Technicien Comptable d'Entreprise", title_fr: "Technicien Comptable d'Entreprise", desc: "OFPPT accounting program covering bookkeeping, taxation, and financial statements.", desc_fr: "Programme OFPPT de comptabilité couvrant la tenue des livres, la fiscalité et les états financiers.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "OFPPT", provider: "OFPPT", url: "https://www.ofppt.ma/fr/filiere/technicien-comptable-dentreprises", dur_min: 0, dur_weeks: 96, skills: ["Accounting", "Taxation", "Financial Statements", "Bookkeeping"], fields: ["finance"], langs: ["fr", "ar"], rating: 3.8 },
  { title: "Technicien en Électricité de Maintenance Industrielle", title_fr: "Technicien en Électricité de Maintenance Industrielle", desc: "OFPPT electrical maintenance specialization for industrial environments.", desc_fr: "Spécialisation OFPPT en maintenance électrique pour les environnements industriels.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "OFPPT", provider: "OFPPT", url: "https://www.ofppt.ma/fr/filiere/technicien-en-electricite-de-maintenance-industrielle", dur_min: 0, dur_weeks: 96, skills: ["Electrical Maintenance", "PLC", "Automation", "Industrial Electrical"], fields: ["industrial", "engineering"], langs: ["fr"], rating: 4.0 },

  // YouTube / Free
  { title: "freeCodeCamp Full Stack Development", title_fr: "freeCodeCamp Développement Full Stack", desc: "Free comprehensive web development curriculum with certifications.", desc_fr: "Programme gratuit complet de développement web avec certifications.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "freeCodeCamp", provider: "freeCodeCamp", url: "https://www.freecodecamp.org/", dur_min: 0, dur_weeks: 52, skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "APIs"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "The Odin Project", title_fr: "The Odin Project", desc: "Free open-source full stack curriculum covering Ruby, JavaScript, and React.", desc_fr: "Programme gratuit open-source full stack couvrant Ruby, JavaScript et React.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "The Odin Project", provider: "The Odin Project", url: "https://www.theodinproject.com/", dur_min: 0, dur_weeks: 40, skills: ["JavaScript", "Ruby", "Rails", "React", "Git"], fields: ["technology"], langs: ["en"], rating: 4.8 },
  { title: "Traversy Media - Modern JavaScript", title_fr: "Traversy Media - JavaScript Moderne", desc: "Crash courses on modern JavaScript, frameworks, and web technologies.", desc_fr: "Cours accélérés sur JavaScript moderne, les frameworks et les technologies web.", type: "video", diff: "beginner", cost: "free", price: 0, platform: "YouTube", provider: "Traversy Media", url: "https://www.youtube.com/c/TraversyMedia", dur_min: 120, dur_weeks: 0, skills: ["JavaScript", "HTML", "CSS", "React", "Node.js"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Fireship - 100 Seconds Series", title_fr: "Fireship - Série 100 Secondes", desc: "Quick technology explainers and modern development concepts.", desc_fr: "Explications rapides de technologies et concepts de développement modernes.", type: "video", diff: "beginner", cost: "free", price: 0, platform: "YouTube", provider: "Fireship", url: "https://www.youtube.com/c/Fireship", dur_min: 60, dur_weeks: 0, skills: ["Web Development", "Cloud", "DevOps", "AI"], fields: ["technology"], langs: ["en"], rating: 4.8 },

  // Google / Microsoft Certs
  { title: "Google Cloud Professional Cloud Architect", title_fr: "Google Cloud Professional Cloud Architect", desc: "Prepare for Google Cloud's most prestigious architect certification.", desc_fr: "Préparez-vous à la certification d'architecte cloud la plus prestigieuse de Google Cloud.", type: "certification", diff: "expert", cost: "paid", price: 300, platform: "Google Cloud", provider: "Google", url: "https://cloud.google.com/certification/cloud-architect", dur_min: 0, dur_weeks: 16, skills: ["GCP", "Cloud Architecture", "Kubernetes", "BigQuery", "Cloud Security"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Microsoft Azure Fundamentals AZ-900", title_fr: "Fondamentaux Microsoft Azure AZ-900", desc: "Entry-level Azure cloud certification covering core services and concepts.", desc_fr: "Certification Azure de niveau débutant couvrant les services et concepts fondamentaux.", type: "certification", diff: "beginner", cost: "paid", price: 99, platform: "Microsoft Learn", provider: "Microsoft", url: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/", dur_min: 0, dur_weeks: 4, skills: ["Azure", "Cloud Computing", "IaaS", "PaaS", "SaaS"], fields: ["technology"], langs: ["en", "fr"], rating: 4.6 },
  { title: "AWS Solutions Architect Associate", title_fr: "AWS Solutions Architect Associé", desc: "Design distributed systems on AWS with this associate-level certification.", desc_fr: "Concevez des systèmes distribués sur AWS avec cette certification de niveau associé.", type: "certification", diff: "intermediate", cost: "paid", price: 150, platform: "AWS", provider: "Amazon Web Services", url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", dur_min: 0, dur_weeks: 12, skills: ["AWS", "EC2", "S3", "VPC", "Lambda", "RDS"], fields: ["technology"], langs: ["en"], rating: 4.8 },
  { title: "Cisco CCNA Certification", title_fr: "Certification Cisco CCNA", desc: "Networking fundamentals certification covering routing, switching, and security.", desc_fr: "Certification en fondamentaux réseau couvrant le routage, la commutation et la sécurité.", type: "certification", diff: "intermediate", cost: "paid", price: 330, platform: "Cisco", provider: "Cisco", url: "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html", dur_min: 0, dur_weeks: 16, skills: ["Networking", "TCP/IP", "Routing", "Switching", "Network Security"], fields: ["technology", "telecommunications"], langs: ["en"], rating: 4.6 },

  // Books
  { title: "Clean Code by Robert C. Martin", title_fr: "Clean Code par Robert C. Martin", desc: "The classic guide to writing readable, maintainable, and professional code.", desc_fr: "Le guide classique pour écrire du code lisible, maintenable et professionnel.", type: "book", diff: "intermediate", cost: "paid", price: 35, platform: "Amazon", provider: "Robert C. Martin", url: "https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882", dur_min: 2400, dur_weeks: 0, skills: ["Clean Code", "Software Design", "SOLID Principles", "Refactoring"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "System Design Interview by Alex Xu", title_fr: "Entretien de conception système par Alex Xu", desc: "Prepare for system design interviews with real-world architecture examples.", desc_fr: "Préparez-vous aux entretiens de conception système avec des exemples d'architecture réels.", type: "book", diff: "advanced", cost: "paid", price: 36, platform: "Amazon", provider: "Alex Xu", url: "https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF", dur_min: 1800, dur_weeks: 0, skills: ["System Design", "Distributed Systems", "Scalability", "Architecture"], fields: ["technology"], langs: ["en"], rating: 4.8 },
  { title: "The Lean Startup by Eric Ries", title_fr: "Lean Startup par Eric Ries", desc: "Learn how to build products customers want using validated learning and iterative design.", desc_fr: "Apprenez à construire des produits que les clients veulent en utilisant l'apprentissage validé et le design itératif.", type: "book", diff: "beginner", cost: "paid", price: 22, platform: "Amazon", provider: "Eric Ries", url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898", dur_min: 600, dur_weeks: 0, skills: ["Lean Methodology", "Product Management", "MVP", "Innovation"], fields: ["technology", "consulting"], langs: ["en", "fr"], rating: 4.5 },

  // Podcasts
  { title: "Syntax.fm - Web Development", title_fr: "Syntax.fm - Développement Web", desc: "Tasty web development treats by Wes Bos and Scott Tolinski.", desc_fr: "Discussions savoureuses sur le développement web par Wes Bos et Scott Tolinski.", type: "podcast", diff: "intermediate", cost: "free", price: 0, platform: "Spotify", provider: "Wes Bos & Scott Tolinski", url: "https://syntax.fm/", dur_min: 60, dur_weeks: 0, skills: ["JavaScript", "CSS", "React", "Node.js", "Web Development"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Software Engineering Daily", title_fr: "Software Engineering Daily", desc: "Daily interviews about software engineering topics and trends.", desc_fr: "Interviews quotidiennes sur les sujets et tendances de l'ingénierie logicielle.", type: "podcast", diff: "intermediate", cost: "free", price: 0, platform: "Apple Podcasts", provider: "SE Daily", url: "https://softwareengineeringdaily.com/", dur_min: 60, dur_weeks: 0, skills: ["Software Engineering", "Architecture", "Cloud", "AI"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Génération Do It Yourself", title_fr: "Génération Do It Yourself", desc: "French podcast about entrepreneurship and personal development.", desc_fr: "Podcast français sur l'entrepreneuriat et le développement personnel.", type: "podcast", diff: "beginner", cost: "free", price: 0, platform: "Spotify", provider: "Matthieu Stefani", url: "https://www.gdiy.fr/", dur_min: 90, dur_weeks: 0, skills: ["Entrepreneurship", "Personal Development", "Leadership", "Innovation"], fields: ["consulting", "technology"], langs: ["fr"], rating: 4.6 },

  // Tools
  { title: "GitHub - Version Control Platform", title_fr: "GitHub - Plateforme de contrôle de version", desc: "Essential platform for code collaboration, version control, and open source contribution.", desc_fr: "Plateforme essentielle pour la collaboration de code, le contrôle de version et la contribution open source.", type: "tool", diff: "beginner", cost: "freemium", price: 0, platform: "GitHub", provider: "Microsoft", url: "https://github.com/", dur_min: 0, dur_weeks: 0, skills: ["Git", "Version Control", "CI/CD", "Collaboration"], fields: ["technology"], langs: ["en"], rating: 4.9 },
  { title: "Figma - Design Tool", title_fr: "Figma - Outil de Design", desc: "Collaborative design tool for UI/UX design, prototyping, and design systems.", desc_fr: "Outil de design collaboratif pour le design UI/UX, le prototypage et les systèmes de design.", type: "tool", diff: "beginner", cost: "freemium", price: 0, platform: "Figma", provider: "Figma", url: "https://www.figma.com/", dur_min: 0, dur_weeks: 0, skills: ["UI/UX Design", "Prototyping", "Design Systems", "Wireframing"], fields: ["technology"], langs: ["en", "fr"], rating: 4.8 },
  { title: "Postman - API Testing", title_fr: "Postman - Tests d'API", desc: "API development and testing platform for building and testing APIs.", desc_fr: "Plateforme de développement et de test d'API pour construire et tester des APIs.", type: "tool", diff: "intermediate", cost: "freemium", price: 0, platform: "Postman", provider: "Postman", url: "https://www.postman.com/", dur_min: 0, dur_weeks: 0, skills: ["API Testing", "REST", "GraphQL", "Automation"], fields: ["technology"], langs: ["en"], rating: 4.6 },

  // Community
  { title: "Stack Overflow", title_fr: "Stack Overflow", desc: "The largest developer community for Q&A and knowledge sharing.", desc_fr: "La plus grande communauté de développeurs pour le partage de connaissances et les questions-réponses.", type: "community", diff: "beginner", cost: "free", price: 0, platform: "Stack Overflow", provider: "Stack Exchange", url: "https://stackoverflow.com/", dur_min: 0, dur_weeks: 0, skills: ["Programming", "Debugging", "Problem Solving"], fields: ["technology"], langs: ["en"], rating: 4.9 },
  { title: "Morocco AI Community", title_fr: "Communauté IA Maroc", desc: "Moroccan AI community for networking, events, and knowledge sharing.", desc_fr: "Communauté IA marocaine pour le networking, les événements et le partage de connaissances.", type: "community", diff: "beginner", cost: "free", price: 0, platform: "Meetup", provider: "Morocco AI", url: "https://www.moroccoai.com/", dur_min: 0, dur_weeks: 0, skills: ["AI", "Machine Learning", "Networking", "Research"], fields: ["technology"], langs: ["fr", "en", "ar"], rating: 4.3 },
  { title: "ForDev.ma - Moroccan Developer Community", title_fr: "ForDev.ma - Communauté de Développeurs Marocains", desc: "Active Moroccan developer forum for sharing resources, jobs, and knowledge.", desc_fr: "Forum actif de développeurs marocains pour le partage de ressources, d'emplois et de connaissances.", type: "community", diff: "beginner", cost: "free", price: 0, platform: "Forum", provider: "ForDev.ma", url: "https://fordev.ma/", dur_min: 0, dur_weeks: 0, skills: ["Web Development", "Networking", "Career"], fields: ["technology"], langs: ["fr", "ar"], rating: 4.2 },

  // Workshops
  { title: "1337 Coding School (42 Network)", title_fr: "1337 École de Coding (Réseau 42)", desc: "Free peer-to-peer coding school in Morocco, part of the 42 network.", desc_fr: "École de codage gratuite peer-to-peer au Maroc, faisant partie du réseau 42.", type: "workshop", diff: "intermediate", cost: "free", price: 0, platform: "1337", provider: "1337 / UM6P", url: "https://1337.ma/", dur_min: 0, dur_weeks: 104, skills: ["C", "C++", "Unix", "Algorithms", "System Programming"], fields: ["technology"], langs: ["en", "fr"], rating: 4.8 },
  { title: "Techstars Startup Weekend Morocco", title_fr: "Techstars Startup Weekend Maroc", desc: "54-hour weekend events to launch startups with mentorship and networking.", desc_fr: "Événements de 54 heures le week-end pour lancer des startups avec mentorat et networking.", type: "workshop", diff: "beginner", cost: "paid", price: 30, platform: "Techstars", provider: "Techstars", url: "https://www.techstars.com/communities/startup-weekend", dur_min: 3240, dur_weeks: 0, skills: ["Entrepreneurship", "Pitching", "Team Building", "MVP", "Business Model"], fields: ["technology", "consulting"], langs: ["en", "fr"], rating: 4.4 },

  // More courses - specialized
  { title: "Tableau for Data Visualization", title_fr: "Tableau pour la visualisation de données", desc: "Master Tableau Desktop for creating interactive business intelligence dashboards.", desc_fr: "Maîtrisez Tableau Desktop pour créer des tableaux de bord interactifs de business intelligence.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Kirill Eremenko", url: "https://www.udemy.com/course/tableau10/", dur_min: 960, dur_weeks: 0, skills: ["Tableau", "Data Visualization", "Business Intelligence", "Analytics"], fields: ["technology", "finance"], langs: ["en"], rating: 4.6 },
  { title: "PMP Exam Prep Certification", title_fr: "Préparation à la certification PMP", desc: "Complete PMP certification exam preparation based on PMBOK 7th edition.", desc_fr: "Préparation complète à l'examen de certification PMP basée sur le PMBOK 7ème édition.", type: "certification", diff: "advanced", cost: "paid", price: 199, platform: "Udemy", provider: "Joseph Phillips", url: "https://www.udemy.com/course/pmp-pmbok6-35-702/", dur_min: 2100, dur_weeks: 0, skills: ["Project Management", "PMP", "PMBOK", "Risk Management", "Stakeholder Management"], fields: ["consulting", "engineering"], langs: ["en"], rating: 4.6 },
  { title: "Introduction à la finance d'entreprise", title_fr: "Introduction à la finance d'entreprise", desc: "Learn corporate finance fundamentals including valuation, capital budgeting, and financial analysis.", desc_fr: "Apprenez les fondamentaux de la finance d'entreprise incluant la valorisation, le budget d'investissement et l'analyse financière.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "HEC Paris", url: "https://www.coursera.org/learn/entreprise-finance", dur_min: 0, dur_weeks: 6, skills: ["Corporate Finance", "Valuation", "Capital Budgeting", "Financial Analysis"], fields: ["finance"], langs: ["fr"], rating: 4.5 },
  { title: "AutoCAD - Complete Course for Beginners", title_fr: "AutoCAD - Cours complet pour débutants", desc: "Learn 2D and 3D drafting with AutoCAD for engineering and architecture.", desc_fr: "Apprenez le dessin 2D et 3D avec AutoCAD pour l'ingénierie et l'architecture.", type: "course", diff: "beginner", cost: "paid", price: 59, platform: "Udemy", provider: "Paul Lynn", url: "https://www.udemy.com/course/autocad-2d-and-3d/", dur_min: 780, dur_weeks: 0, skills: ["AutoCAD", "2D Drafting", "3D Modeling", "Technical Drawing"], fields: ["engineering"], langs: ["en"], rating: 4.5 },
  { title: "SolidWorks Essentials", title_fr: "Fondamentaux SolidWorks", desc: "Learn 3D CAD modeling with SolidWorks for mechanical engineering.", desc_fr: "Apprenez la modélisation CAO 3D avec SolidWorks pour l'ingénierie mécanique.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Tayseer Almattar", url: "https://www.udemy.com/course/solidworks-essentials/", dur_min: 1020, dur_weeks: 0, skills: ["SolidWorks", "3D Modeling", "CAD", "Mechanical Design"], fields: ["engineering", "automotive"], langs: ["en"], rating: 4.6 },
  { title: "MATLAB for Engineering Applications", title_fr: "MATLAB pour les applications d'ingénierie", desc: "Master MATLAB programming for engineering simulations and data analysis.", desc_fr: "Maîtrisez la programmation MATLAB pour les simulations d'ingénierie et l'analyse de données.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Tim Buchalka", url: "https://www.udemy.com/course/matlab-master-class/", dur_min: 840, dur_weeks: 0, skills: ["MATLAB", "Simulink", "Data Analysis", "Signal Processing"], fields: ["engineering", "technology"], langs: ["en"], rating: 4.5 },
  { title: "Gestion des Risques Industriels", title_fr: "Gestion des Risques Industriels", desc: "Industrial risk management covering HSE regulations and safety protocols.", desc_fr: "Gestion des risques industriels couvrant les réglementations HSE et les protocoles de sécurité.", type: "course", diff: "advanced", cost: "paid", price: 89, platform: "Udemy", provider: "HSE Academy", url: "https://www.udemy.com/course/industrial-risk-management/", dur_min: 720, dur_weeks: 0, skills: ["HSE", "Risk Assessment", "ISO 45001", "Safety Management"], fields: ["industrial", "engineering"], langs: ["fr", "en"], rating: 4.3 },
  { title: "Power BI Complete Guide", title_fr: "Guide complet Power BI", desc: "Master Microsoft Power BI for data analytics and business intelligence dashboards.", desc_fr: "Maîtrisez Microsoft Power BI pour l'analyse de données et les tableaux de bord de business intelligence.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Maven Analytics", url: "https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/", dur_min: 1140, dur_weeks: 0, skills: ["Power BI", "DAX", "Data Modeling", "Data Visualization"], fields: ["finance", "technology"], langs: ["en"], rating: 4.7 },
  { title: "Terraform Associate Certification", title_fr: "Certification Terraform Associate", desc: "Prepare for HashiCorp Terraform Associate certification for infrastructure as code.", desc_fr: "Préparez-vous à la certification HashiCorp Terraform Associate pour l'infrastructure as code.", type: "certification", diff: "intermediate", cost: "paid", price: 70, platform: "HashiCorp", provider: "HashiCorp", url: "https://www.hashicorp.com/certification/terraform-associate", dur_min: 0, dur_weeks: 8, skills: ["Terraform", "IaC", "Cloud Infrastructure", "DevOps"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Entrepreneuriat au Maroc", title_fr: "Entrepreneuriat au Maroc", desc: "Guide to starting and growing a business in Morocco's regulatory environment.", desc_fr: "Guide pour créer et développer une entreprise dans l'environnement réglementaire marocain.", type: "article", diff: "beginner", cost: "free", price: 0, platform: "Maroc PME", provider: "Maroc PME", url: "https://www.marocpme.gov.ma/", dur_min: 30, dur_weeks: 0, skills: ["Entrepreneurship", "Business Plan", "Moroccan Law", "Registration"], fields: ["consulting", "finance"], langs: ["fr", "ar"], rating: 4.1 },
  { title: "PRINCE2 Foundation Certification", title_fr: "Certification PRINCE2 Foundation", desc: "Project management methodology widely used in government and large enterprises.", desc_fr: "Méthodologie de gestion de projet largement utilisée dans le gouvernement et les grandes entreprises.", type: "certification", diff: "intermediate", cost: "paid", price: 499, platform: "PeopleCert", provider: "Axelos", url: "https://www.peoplecert.org/browse-certifications/project-management/prince2", dur_min: 0, dur_weeks: 4, skills: ["PRINCE2", "Project Management", "Governance", "Risk Management"], fields: ["consulting", "technology"], langs: ["en", "fr"], rating: 4.4 },
  { title: "Comptabilité Générale Marocaine", title_fr: "Comptabilité Générale Marocaine", desc: "Moroccan accounting standards and practices for local businesses.", desc_fr: "Normes et pratiques comptables marocaines pour les entreprises locales.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "OpenClassrooms", provider: "Formation Maroc", url: "https://openclassrooms.com/fr/courses/comptabilite-generale", dur_min: 600, dur_weeks: 0, skills: ["Accounting", "Moroccan Tax Law", "Financial Reporting", "PCGE"], fields: ["finance"], langs: ["fr"], rating: 4.2 },
  { title: "ITIL 4 Foundation", title_fr: "ITIL 4 Foundation", desc: "IT service management framework certification for IT professionals.", desc_fr: "Certification de gestion des services informatiques pour les professionnels IT.", type: "certification", diff: "intermediate", cost: "paid", price: 399, platform: "PeopleCert", provider: "Axelos", url: "https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-702", dur_min: 0, dur_weeks: 4, skills: ["ITIL", "Service Management", "IT Operations", "Incident Management"], fields: ["technology", "consulting"], langs: ["en", "fr"], rating: 4.4 },
  { title: "Normes ISO 9001 Quality Management", title_fr: "Normes ISO 9001 Management de la Qualité", desc: "Understanding and implementing ISO 9001 quality management systems.", desc_fr: "Comprendre et implémenter les systèmes de management de la qualité ISO 9001.", type: "course", diff: "intermediate", cost: "paid", price: 89, platform: "Udemy", provider: "Quality Academy", url: "https://www.udemy.com/course/iso-9001-quality-management/", dur_min: 480, dur_weeks: 0, skills: ["ISO 9001", "Quality Management", "Auditing", "Process Improvement"], fields: ["industrial", "engineering"], langs: ["en", "fr"], rating: 4.3 },
  { title: "Intelligence Artificielle - Fondamentaux", title_fr: "Intelligence Artificielle - Fondamentaux", desc: "Introduction to artificial intelligence concepts, history, and applications.", desc_fr: "Introduction aux concepts, à l'histoire et aux applications de l'intelligence artificielle.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "Université de Montréal", url: "https://www.coursera.org/learn/introduction-intelligence-artificielle", dur_min: 0, dur_weeks: 6, skills: ["AI Fundamentals", "Machine Learning Basics", "Neural Networks", "Ethics"], fields: ["technology"], langs: ["fr"], rating: 4.5 },
  { title: "Renewable Energy - Solar and Wind", title_fr: "Énergie Renouvelable - Solaire et Éolien", desc: "Comprehensive course on solar and wind energy technologies and implementation.", desc_fr: "Cours complet sur les technologies d'énergie solaire et éolienne et leur mise en oeuvre.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "edX", provider: "TU Delft", url: "https://www.edx.org/course/solar-energy", dur_min: 0, dur_weeks: 10, skills: ["Solar Energy", "Wind Energy", "Energy Systems", "Sustainability"], fields: ["energy", "engineering"], langs: ["en"], rating: 4.5 },
  { title: "Formation HSE - Hygiène Sécurité Environnement", title_fr: "Formation HSE - Hygiène Sécurité Environnement", desc: "Complete HSE training for industrial environments in Morocco.", desc_fr: "Formation HSE complète pour les environnements industriels au Maroc.", type: "course", diff: "intermediate", cost: "paid", price: 129, platform: "OFPPT", provider: "OFPPT HSE", url: "https://www.ofppt.ma/fr/filiere/technicien-hse", dur_min: 0, dur_weeks: 24, skills: ["HSE", "Safety Regulations", "Environmental Management", "Risk Assessment"], fields: ["industrial", "engineering"], langs: ["fr"], rating: 4.2 },
  { title: "Data Engineering on Google Cloud", title_fr: "Data Engineering sur Google Cloud", desc: "Build data pipelines, ML models and data warehouses on GCP.", desc_fr: "Construisez des pipelines de données, des modèles ML et des entrepôts de données sur GCP.", type: "course", diff: "advanced", cost: "subscription", price: 49, platform: "Coursera", provider: "Google Cloud", url: "https://www.coursera.org/professional-certificates/gcp-data-engineering", dur_min: 0, dur_weeks: 20, skills: ["BigQuery", "Dataflow", "Pub/Sub", "Data Engineering", "GCP"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Networking and Security - CompTIA Network+", title_fr: "Réseaux et Sécurité - CompTIA Network+", desc: "Prepare for CompTIA Network+ certification covering networking concepts and security.", desc_fr: "Préparez-vous à la certification CompTIA Network+ couvrant les concepts réseau et la sécurité.", type: "certification", diff: "intermediate", cost: "paid", price: 358, platform: "CompTIA", provider: "CompTIA", url: "https://www.comptia.org/certifications/network", dur_min: 0, dur_weeks: 12, skills: ["Networking", "Network Security", "TCP/IP", "Wireless", "Troubleshooting"], fields: ["technology", "telecommunications"], langs: ["en"], rating: 4.5 },
  { title: "Scrum Master Certification (PSM I)", title_fr: "Certification Scrum Master (PSM I)", desc: "Professional Scrum Master level 1 certification by Scrum.org.", desc_fr: "Certification Professional Scrum Master niveau 1 par Scrum.org.", type: "certification", diff: "intermediate", cost: "paid", price: 150, platform: "Scrum.org", provider: "Scrum.org", url: "https://www.scrum.org/assessments/professional-scrum-master-i-certification", dur_min: 0, dur_weeks: 4, skills: ["Scrum", "Agile", "Sprint Planning", "Retrospectives", "Facilitation"], fields: ["technology", "consulting"], langs: ["en"], rating: 4.7 },
  { title: "Angular Complete Guide", title_fr: "Guide Complet Angular", desc: "Master Angular framework for building enterprise web applications.", desc_fr: "Maîtrisez le framework Angular pour construire des applications web d'entreprise.", type: "course", diff: "intermediate", cost: "paid", price: 89, platform: "Udemy", provider: "Maximilian Schwarzmüller", url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/", dur_min: 2160, dur_weeks: 0, skills: ["Angular", "TypeScript", "RxJS", "NgRx", "REST APIs"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Cybersecurity for Business Leaders", title_fr: "Cybersécurité pour les dirigeants d'entreprise", desc: "Strategic cybersecurity for executives and business decision makers.", desc_fr: "Cybersécurité stratégique pour les dirigeants et les décideurs d'entreprise.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "University of Colorado", url: "https://www.coursera.org/learn/cybersecurity-for-business", dur_min: 0, dur_weeks: 5, skills: ["Cybersecurity Strategy", "Risk Management", "Governance", "Compliance"], fields: ["technology", "consulting"], langs: ["en"], rating: 4.3 },

  // Additional resources to reach 110+
  { title: "Spring Boot Microservices", title_fr: "Microservices avec Spring Boot", desc: "Build production-ready microservices with Spring Boot, Docker, and Kubernetes.", desc_fr: "Construisez des microservices prêts pour la production avec Spring Boot, Docker et Kubernetes.", type: "course", diff: "advanced", cost: "paid", price: 89, platform: "Udemy", provider: "Ranga Karanam", url: "https://www.udemy.com/course/microservices-with-spring-boot-and-spring-cloud/", dur_min: 1860, dur_weeks: 0, skills: ["Spring Boot", "Java", "Microservices", "Docker", "Kubernetes"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Vue.js 3 - The Complete Guide", title_fr: "Vue.js 3 - Le guide complet", desc: "Master Vue.js 3 with Composition API, Vuex, and Vue Router.", desc_fr: "Maîtrisez Vue.js 3 avec Composition API, Vuex et Vue Router.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Maximilian Schwarzmüller", url: "https://www.udemy.com/course/vuejs-2-the-complete-guide/", dur_min: 1920, dur_weeks: 0, skills: ["Vue.js", "JavaScript", "Vuex", "Vue Router", "Composition API"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "DevOps with GitLab CI/CD", title_fr: "DevOps avec GitLab CI/CD", desc: "Automate software delivery with GitLab CI/CD pipelines and DevOps practices.", desc_fr: "Automatisez la livraison logicielle avec les pipelines GitLab CI/CD et les pratiques DevOps.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Valentin Despa", url: "https://www.udemy.com/course/gitlab-ci-pipelines-ci-cd-and-devops-for-beginners/", dur_min: 660, dur_weeks: 0, skills: ["GitLab CI/CD", "DevOps", "Automation", "Pipelines", "YAML"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "PostgreSQL Bootcamp", title_fr: "Bootcamp PostgreSQL", desc: "Master PostgreSQL from basics to advanced topics including performance tuning.", desc_fr: "Maîtrisez PostgreSQL des bases aux sujets avancés, y compris l'optimisation des performances.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Adnan Waheed", url: "https://www.udemy.com/course/the-complete-python-postgresql-developer-course/", dur_min: 1080, dur_weeks: 0, skills: ["PostgreSQL", "SQL", "Database Design", "Performance Tuning", "Indexing"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Finance pour non-financiers", title_fr: "Finance pour non-financiers", desc: "Financial literacy course for non-finance professionals in Moroccan business context.", desc_fr: "Cours de culture financière pour les professionnels non-financiers dans le contexte marocain.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "IESE Business School", url: "https://www.coursera.org/learn/finance-for-non-finance", dur_min: 0, dur_weeks: 4, skills: ["Financial Literacy", "Budgeting", "P&L", "Balance Sheet"], fields: ["finance", "consulting"], langs: ["fr", "en"], rating: 4.4 },
  { title: "Ethical Hacking - Penetration Testing", title_fr: "Hacking éthique - Tests de pénétration", desc: "Learn penetration testing and ethical hacking from scratch.", desc_fr: "Apprenez les tests de pénétration et le hacking éthique à partir de zéro.", type: "course", diff: "advanced", cost: "paid", price: 99, platform: "Udemy", provider: "Zaid Sabih", url: "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/", dur_min: 1440, dur_weeks: 0, skills: ["Penetration Testing", "Kali Linux", "Network Hacking", "Web Hacking", "Social Engineering"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Gestion de projet avec Microsoft Project", title_fr: "Gestion de projet avec Microsoft Project", desc: "Master Microsoft Project for planning, scheduling, and tracking projects.", desc_fr: "Maîtrisez Microsoft Project pour la planification, l'ordonnancement et le suivi de projets.", type: "course", diff: "intermediate", cost: "paid", price: 59, platform: "Udemy", provider: "Formation Pro", url: "https://www.udemy.com/course/microsoft-project-course/", dur_min: 600, dur_weeks: 0, skills: ["MS Project", "Project Planning", "Gantt Charts", "Resource Management"], fields: ["engineering", "consulting"], langs: ["fr", "en"], rating: 4.3 },
  { title: "Flutter & Dart - The Complete Guide", title_fr: "Flutter et Dart - Le guide complet", desc: "Build iOS and Android apps with Flutter and Dart from a single codebase.", desc_fr: "Construisez des apps iOS et Android avec Flutter et Dart à partir d'une seule base de code.", type: "course", diff: "intermediate", cost: "paid", price: 89, platform: "Udemy", provider: "Maximilian Schwarzmüller", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/", dur_min: 2520, dur_weeks: 0, skills: ["Flutter", "Dart", "Mobile Development", "iOS", "Android"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Électronique de puissance", title_fr: "Électronique de puissance", desc: "Power electronics fundamentals for electrical engineers.", desc_fr: "Fondamentaux de l'électronique de puissance pour les ingénieurs électriciens.", type: "course", diff: "advanced", cost: "free", price: 0, platform: "edX", provider: "University of Colorado", url: "https://www.edx.org/course/power-electronics", dur_min: 0, dur_weeks: 8, skills: ["Power Electronics", "Circuit Design", "Converters", "Motor Drives"], fields: ["engineering", "energy"], langs: ["en"], rating: 4.4 },
  { title: "Natural Language Processing with Python", title_fr: "Traitement du langage naturel avec Python", desc: "Learn NLP techniques including text classification, sentiment analysis, and chatbots.", desc_fr: "Apprenez les techniques de NLP incluant la classification de texte, l'analyse de sentiment et les chatbots.", type: "course", diff: "advanced", cost: "paid", price: 79, platform: "Udemy", provider: "Jose Portilla", url: "https://www.udemy.com/course/nlp-natural-language-processing-with-python/", dur_min: 720, dur_weeks: 0, skills: ["NLP", "Python", "NLTK", "SpaCy", "Text Classification"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Comptabilité analytique et contrôle de gestion", title_fr: "Comptabilité analytique et contrôle de gestion", desc: "Management accounting and cost control techniques for Moroccan enterprises.", desc_fr: "Techniques de comptabilité analytique et de contrôle de gestion pour les entreprises marocaines.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "OpenClassrooms", provider: "Formation Maroc", url: "https://openclassrooms.com/fr/courses/comptabilite-analytique", dur_min: 480, dur_weeks: 0, skills: ["Cost Accounting", "Budget Control", "Variance Analysis", "KPIs"], fields: ["finance"], langs: ["fr"], rating: 4.2 },
  { title: "Robotics and Automation", title_fr: "Robotique et automatisation", desc: "Introduction to industrial robotics, PLC programming, and automation systems.", desc_fr: "Introduction à la robotique industrielle, la programmation PLC et les systèmes d'automatisation.", type: "course", diff: "advanced", cost: "paid", price: 99, platform: "Udemy", provider: "Industrial Academy", url: "https://www.udemy.com/course/plc-programming-from-scratch/", dur_min: 960, dur_weeks: 0, skills: ["PLC Programming", "Robotics", "SCADA", "Industrial Automation", "Ladder Logic"], fields: ["industrial", "engineering"], langs: ["en"], rating: 4.4 },
  { title: "Droit du travail marocain", title_fr: "Droit du travail marocain", desc: "Moroccan labor law fundamentals for HR professionals and managers.", desc_fr: "Fondamentaux du droit du travail marocain pour les professionnels RH et les managers.", type: "article", diff: "beginner", cost: "free", price: 0, platform: "Maroc Droit", provider: "Maroc Droit", url: "https://www.marocdroit.com/", dur_min: 45, dur_weeks: 0, skills: ["Moroccan Labor Law", "Employee Rights", "HR Compliance", "Work Contracts"], fields: ["consulting", "finance"], langs: ["fr", "ar"], rating: 4.0 },
  { title: "Jenkins for CI/CD", title_fr: "Jenkins pour CI/CD", desc: "Automate builds, tests, and deployments with Jenkins pipelines.", desc_fr: "Automatisez les builds, tests et déploiements avec les pipelines Jenkins.", type: "course", diff: "intermediate", cost: "paid", price: 59, platform: "Udemy", provider: "James Lee", url: "https://www.udemy.com/course/jenkins-from-zero-to-hero/", dur_min: 720, dur_weeks: 0, skills: ["Jenkins", "CI/CD", "Groovy", "Pipeline as Code", "Automation"], fields: ["technology"], langs: ["en"], rating: 4.4 },
  { title: "Sustainable Development Goals", title_fr: "Objectifs de développement durable", desc: "Understanding UN SDGs and their implementation in business context.", desc_fr: "Comprendre les ODD de l'ONU et leur mise en oeuvre dans un contexte business.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "University of Copenhagen", url: "https://www.coursera.org/learn/un-sustainable-development-goals", dur_min: 0, dur_weeks: 6, skills: ["Sustainability", "CSR", "Environmental Policy", "Social Impact"], fields: ["energy", "consulting"], langs: ["en"], rating: 4.5 },
  { title: "Next.js 14 - The Complete Developer Guide", title_fr: "Next.js 14 - Le guide complet du développeur", desc: "Build full-stack web applications with Next.js App Router, Server Actions and RSC.", desc_fr: "Construisez des applications web full-stack avec Next.js App Router, Server Actions et RSC.", type: "course", diff: "intermediate", cost: "paid", price: 89, platform: "Udemy", provider: "Stephen Grider", url: "https://www.udemy.com/course/next-js-the-complete-developers-guide/", dur_min: 1560, dur_weeks: 0, skills: ["Next.js", "React", "Server Components", "Server Actions", "TypeScript"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Gestion des stocks et approvisionnement", title_fr: "Gestion des stocks et approvisionnement", desc: "Inventory management and procurement techniques for supply chain professionals.", desc_fr: "Techniques de gestion des stocks et d'approvisionnement pour les professionnels de la supply chain.", type: "course", diff: "intermediate", cost: "paid", price: 49, platform: "Udemy", provider: "Supply Chain Academy", url: "https://www.udemy.com/course/inventory-management-fundamentals/", dur_min: 480, dur_weeks: 0, skills: ["Inventory Management", "Procurement", "Supply Chain", "ERP", "Forecasting"], fields: ["industrial", "consulting"], langs: ["fr", "en"], rating: 4.3 },
  { title: "GraphQL with Node.js and React", title_fr: "GraphQL avec Node.js et React", desc: "Build modern APIs with GraphQL, Apollo Server, and React Apollo Client.", desc_fr: "Construisez des APIs modernes avec GraphQL, Apollo Server et React Apollo Client.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Andrew Mead", url: "https://www.udemy.com/course/graphql-bootcamp/", dur_min: 1440, dur_weeks: 0, skills: ["GraphQL", "Apollo", "Node.js", "React", "API Design"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Marketing Digital au Maroc", title_fr: "Marketing Digital au Maroc", desc: "Digital marketing strategies adapted to the Moroccan market and consumer behavior.", desc_fr: "Stratégies de marketing digital adaptées au marché marocain et au comportement des consommateurs.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "YouTube", provider: "Digital Morocco Academy", url: "https://www.youtube.com/digital-morocco-academy", dur_min: 300, dur_weeks: 0, skills: ["Digital Marketing", "SEO", "Social Media", "Content Marketing", "Google Ads"], fields: ["consulting", "technology"], langs: ["fr", "ar"], rating: 4.2 },
  { title: "Raspberry Pi for IoT Projects", title_fr: "Raspberry Pi pour projets IoT", desc: "Build Internet of Things projects with Raspberry Pi and sensor integration.", desc_fr: "Construisez des projets Internet des Objets avec Raspberry Pi et l'intégration de capteurs.", type: "course", diff: "intermediate", cost: "paid", price: 59, platform: "Udemy", provider: "Lee Assam", url: "https://www.udemy.com/course/raspberry-pi-iot/", dur_min: 480, dur_weeks: 0, skills: ["Raspberry Pi", "IoT", "Python", "Sensors", "GPIO"], fields: ["technology", "engineering"], langs: ["en"], rating: 4.4 },
  { title: "Communication professionnelle en français", title_fr: "Communication professionnelle en français", desc: "Professional French communication skills for business and academic contexts.", desc_fr: "Compétences en communication professionnelle en français pour les contextes business et académiques.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "Polytechnique Montréal", url: "https://www.coursera.org/learn/communication-professionnelle", dur_min: 0, dur_weeks: 6, skills: ["Business French", "Professional Writing", "Presentations", "Email Communication"], fields: ["consulting", "education"], langs: ["fr"], rating: 4.4 },
  { title: "Elastic Stack (ELK) for Monitoring", title_fr: "Stack Elastic (ELK) pour le monitoring", desc: "Master Elasticsearch, Logstash, and Kibana for log management and monitoring.", desc_fr: "Maîtrisez Elasticsearch, Logstash et Kibana pour la gestion des logs et le monitoring.", type: "course", diff: "advanced", cost: "paid", price: 79, platform: "Udemy", provider: "Bo Andersen", url: "https://www.udemy.com/course/elasticsearch-complete-guide/", dur_min: 960, dur_weeks: 0, skills: ["Elasticsearch", "Logstash", "Kibana", "Log Management", "Monitoring"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Techniques de négociation commerciale", title_fr: "Techniques de négociation commerciale", desc: "Business negotiation techniques for sales and procurement professionals.", desc_fr: "Techniques de négociation commerciale pour les professionnels de la vente et des achats.", type: "course", diff: "intermediate", cost: "paid", price: 49, platform: "Udemy", provider: "Business Academy", url: "https://www.udemy.com/course/business-negotiation-skills/", dur_min: 360, dur_weeks: 0, skills: ["Negotiation", "Sales", "Persuasion", "Conflict Resolution", "Deal Making"], fields: ["consulting", "finance"], langs: ["fr", "en"], rating: 4.3 },
  { title: "Rust Programming Language", title_fr: "Langage de programmation Rust", desc: "Learn systems programming with Rust for safe, concurrent, and high-performance code.", desc_fr: "Apprenez la programmation système avec Rust pour du code sûr, concurrent et performant.", type: "course", diff: "advanced", cost: "free", price: 0, platform: "Rust Book", provider: "Mozilla", url: "https://doc.rust-lang.org/book/", dur_min: 2400, dur_weeks: 0, skills: ["Rust", "Systems Programming", "Memory Safety", "Concurrency", "Performance"], fields: ["technology"], langs: ["en"], rating: 4.8 },
  { title: "Énergie solaire photovoltaïque au Maroc", title_fr: "Énergie solaire photovoltaïque au Maroc", desc: "Solar photovoltaic energy systems design and installation for Moroccan climate.", desc_fr: "Conception et installation de systèmes d'énergie solaire photovoltaïque pour le climat marocain.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "IRESEN Academy", url: "https://www.udemy.com/course/solar-photovoltaic-systems/", dur_min: 600, dur_weeks: 0, skills: ["Solar PV", "System Design", "Installation", "Grid Integration", "Noor Project"], fields: ["energy", "engineering"], langs: ["fr", "en"], rating: 4.4 },
  { title: "MongoDB - The Complete Developer Guide", title_fr: "MongoDB - Le guide complet du développeur", desc: "Master MongoDB database design, queries, aggregation, and deployment.", desc_fr: "Maîtrisez la conception de bases de données MongoDB, les requêtes, l'agrégation et le déploiement.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Maximilian Schwarzmüller", url: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/", dur_min: 1080, dur_weeks: 0, skills: ["MongoDB", "NoSQL", "Aggregation", "Mongoose", "Database Design"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Leadership et management d'équipe", title_fr: "Leadership et management d'équipe", desc: "Leadership fundamentals and team management skills for new managers.", desc_fr: "Fondamentaux du leadership et compétences en management d'équipe pour les nouveaux managers.", type: "course", diff: "beginner", cost: "free", price: 0, platform: "Coursera", provider: "University of Michigan", url: "https://www.coursera.org/learn/leading-teams", dur_min: 0, dur_weeks: 4, skills: ["Leadership", "Team Management", "Motivation", "Delegation", "Conflict Resolution"], fields: ["consulting", "industrial"], langs: ["en", "fr"], rating: 4.6 },
  { title: "Conception mécanique avec CATIA V5", title_fr: "Conception mécanique avec CATIA V5", desc: "3D mechanical design with Dassault Systèmes CATIA V5 for aerospace and automotive.", desc_fr: "Conception mécanique 3D avec CATIA V5 de Dassault Systèmes pour l'aérospatial et l'automobile.", type: "course", diff: "advanced", cost: "paid", price: 99, platform: "Udemy", provider: "CAD Academy", url: "https://www.udemy.com/course/catia-v5-course/", dur_min: 1200, dur_weeks: 0, skills: ["CATIA V5", "3D Design", "CAD", "Surface Modeling", "Assembly Design"], fields: ["automotive", "engineering"], langs: ["en", "fr"], rating: 4.5 },
  { title: "Redis - The Complete Developer Guide", title_fr: "Redis - Le guide complet du développeur", desc: "Master Redis for caching, session management, real-time analytics, and messaging.", desc_fr: "Maîtrisez Redis pour le caching, la gestion de sessions, l'analytique temps réel et la messagerie.", type: "course", diff: "intermediate", cost: "paid", price: 69, platform: "Udemy", provider: "Stephen Grider", url: "https://www.udemy.com/course/redis-the-complete-developers-guide-p/", dur_min: 780, dur_weeks: 0, skills: ["Redis", "Caching", "Data Structures", "Pub/Sub", "Lua Scripting"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Normes électriques NF C 15-100", title_fr: "Normes électriques NF C 15-100", desc: "French electrical standards and installation norms used in Morocco.", desc_fr: "Normes françaises d'installation électrique appliquées au Maroc.", type: "course", diff: "intermediate", cost: "paid", price: 59, platform: "OFPPT", provider: "OFPPT Électrique", url: "https://www.ofppt.ma/fr/filiere/electricite-batiment", dur_min: 480, dur_weeks: 0, skills: ["Electrical Standards", "NF C 15-100", "Installation", "Safety", "Building Electrical"], fields: ["engineering"], langs: ["fr"], rating: 4.1 },
  { title: "Go Programming Language Bootcamp", title_fr: "Bootcamp du langage Go", desc: "Learn Go for building scalable backend services and microservices.", desc_fr: "Apprenez Go pour construire des services backend évolutifs et des microservices.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Todd McLeod", url: "https://www.udemy.com/course/learn-how-to-code/", dur_min: 2640, dur_weeks: 0, skills: ["Go", "Concurrency", "REST APIs", "Microservices", "gRPC"], fields: ["technology"], langs: ["en"], rating: 4.6 },
  { title: "Business English for Professionals", title_fr: "Anglais des affaires pour professionnels", desc: "Professional business English skills for international career advancement.", desc_fr: "Compétences en anglais des affaires pour l'avancement de carrière internationale.", type: "course", diff: "intermediate", cost: "subscription", price: 49, platform: "Coursera", provider: "University of Pennsylvania", url: "https://www.coursera.org/specializations/english-for-business", dur_min: 0, dur_weeks: 16, skills: ["Business English", "Professional Communication", "Presentations", "Cross-cultural"], fields: ["consulting", "finance"], langs: ["en"], rating: 4.6 },
  { title: "Analyse des données avec R", title_fr: "Analyse des données avec R", desc: "Statistical data analysis and visualization with R programming language.", desc_fr: "Analyse statistique de données et visualisation avec le langage de programmation R.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "Coursera", provider: "Johns Hopkins University", url: "https://www.coursera.org/specializations/data-science-foundations-r", dur_min: 0, dur_weeks: 16, skills: ["R Programming", "Statistical Analysis", "ggplot2", "Data Wrangling", "Hypothesis Testing"], fields: ["technology", "healthcare"], langs: ["en"], rating: 4.5 },
  { title: "Traitement des eaux et environnement", title_fr: "Traitement des eaux et environnement", desc: "Water treatment technologies and environmental engineering for Morocco.", desc_fr: "Technologies de traitement des eaux et ingénierie environnementale pour le Maroc.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "edX", provider: "EPFL", url: "https://www.edx.org/course/water-treatment", dur_min: 0, dur_weeks: 8, skills: ["Water Treatment", "Environmental Engineering", "Waste Management", "Sustainability"], fields: ["engineering", "energy"], langs: ["fr", "en"], rating: 4.3 },
  { title: "Kubernetes for Developers", title_fr: "Kubernetes pour développeurs", desc: "Deploy, manage, and scale containerized applications with Kubernetes.", desc_fr: "Déployez, gérez et mettez à l'échelle des applications conteneurisées avec Kubernetes.", type: "certification", diff: "advanced", cost: "paid", price: 395, platform: "CNCF", provider: "Linux Foundation", url: "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/", dur_min: 0, dur_weeks: 8, skills: ["Kubernetes", "Containers", "Helm", "Service Mesh", "Cloud Native"], fields: ["technology"], langs: ["en"], rating: 4.7 },
  { title: "Sécurité alimentaire et HACCP", title_fr: "Sécurité alimentaire et HACCP", desc: "Food safety management and HACCP certification for agro-industrial professionals.", desc_fr: "Management de la sécurité alimentaire et certification HACCP pour les professionnels agro-industriels.", type: "certification", diff: "intermediate", cost: "paid", price: 199, platform: "Bureau Veritas", provider: "Bureau Veritas Morocco", url: "https://www.bureauveritas.ma/", dur_min: 0, dur_weeks: 2, skills: ["HACCP", "Food Safety", "ISO 22000", "Quality Control", "Auditing"], fields: ["industrial"], langs: ["fr"], rating: 4.3 },
  { title: "Photoshop et design graphique", title_fr: "Photoshop et design graphique", desc: "Adobe Photoshop essentials for graphic design and digital art.", desc_fr: "Les essentiels d'Adobe Photoshop pour le design graphique et l'art numérique.", type: "course", diff: "beginner", cost: "paid", price: 59, platform: "Udemy", provider: "Daniel Scott", url: "https://www.udemy.com/course/adobe-photoshop-cc-essentials-training-course/", dur_min: 840, dur_weeks: 0, skills: ["Photoshop", "Graphic Design", "Photo Editing", "Digital Art", "Compositing"], fields: ["technology"], langs: ["en", "fr"], rating: 4.6 },
  { title: "Maintenance préventive et prédictive", title_fr: "Maintenance préventive et prédictive", desc: "Preventive and predictive maintenance strategies for industrial equipment.", desc_fr: "Stratégies de maintenance préventive et prédictive pour les équipements industriels.", type: "course", diff: "advanced", cost: "paid", price: 89, platform: "Udemy", provider: "Industrial Pro", url: "https://www.udemy.com/course/predictive-maintenance/", dur_min: 600, dur_weeks: 0, skills: ["Predictive Maintenance", "Vibration Analysis", "Thermography", "CMMS", "Reliability"], fields: ["industrial", "engineering"], langs: ["en", "fr"], rating: 4.3 },
  { title: "Développement Android avec Kotlin", title_fr: "Développement Android avec Kotlin", desc: "Build Android applications with Kotlin and Jetpack Compose.", desc_fr: "Construisez des applications Android avec Kotlin et Jetpack Compose.", type: "course", diff: "intermediate", cost: "paid", price: 79, platform: "Udemy", provider: "Denis Panjuta", url: "https://www.udemy.com/course/android-kotlin-developer/", dur_min: 1680, dur_weeks: 0, skills: ["Kotlin", "Android", "Jetpack Compose", "Room Database", "MVVM"], fields: ["technology"], langs: ["en"], rating: 4.5 },
  { title: "Arabe professionnel des affaires", title_fr: "Arabe professionnel des affaires", desc: "Professional Arabic for business communications in MENA region.", desc_fr: "Arabe professionnel pour les communications d'affaires dans la région MENA.", type: "course", diff: "intermediate", cost: "free", price: 0, platform: "edX", provider: "Georgetown University", url: "https://www.edx.org/course/arabic-for-business", dur_min: 0, dur_weeks: 8, skills: ["Business Arabic", "Professional Writing", "Negotiations", "Cultural Communication"], fields: ["consulting", "finance"], langs: ["ar", "en"], rating: 4.2 },
  { title: "Prometheus and Grafana Monitoring", title_fr: "Monitoring avec Prometheus et Grafana", desc: "Build observability and monitoring infrastructure with Prometheus and Grafana.", desc_fr: "Construisez l'infrastructure d'observabilité et de monitoring avec Prometheus et Grafana.", type: "course", diff: "advanced", cost: "paid", price: 69, platform: "Udemy", provider: "Edward Viaene", url: "https://www.udemy.com/course/prometheus-monitoring/", dur_min: 480, dur_weeks: 0, skills: ["Prometheus", "Grafana", "Monitoring", "Alerting", "Observability"], fields: ["technology"], langs: ["en"], rating: 4.5 },
];

// ============================================================================
// HELPERS
// ============================================================================

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateSuccessStories(count) {
  const stories = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.45; // slight male bias for engineering schools
    const firstName = isMale ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const uni = pick(UNIVERSITIES);
    const company = pick(COMPANIES);
    const role = pick(ROLES);
    const year = 2018 + Math.floor(Math.random() * 8); // 2018-2025
    const salaryIdx = Math.min(
      SALARY_RANGES.length - 1,
      Math.floor(Math.random() * 4) + Math.max(0, (year - 2018) - 2)
    );
    const achieveIdx = Math.floor(Math.random() * ACHIEVEMENTS_FR.length);
    const adviceIdx = Math.floor(Math.random() * ADVICE_FR.length);
    const fieldTags = TAG_POOLS[role.field] || TAG_POOLS.technology;
    const tags = pickN(fieldTags, 3 + Math.floor(Math.random() * 3));
    // Add company-related tag
    tags.push(company.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, ""));

    stories.push({
      id: crypto.randomUUID(),
      graduate_name: name,
      graduation_year: year,
      program_name: `${uni.name} - ${uni.full}`,
      current_role: role.fr,
      current_role_en: role.en,
      company: company.name,
      location: company.location,
      salary_range: SALARY_RANGES[salaryIdx],
      story_fr: generateStoryFr(name, uni.name, company.name, role.fr, year),
      story_en: generateStoryEn(name, uni.name, company.name, role.en, year),
      key_achievement: ACHIEVEMENTS_EN[achieveIdx],
      key_achievement_fr: ACHIEVEMENTS_FR[achieveIdx],
      advice_fr: ADVICE_FR[adviceIdx],
      advice_en: ADVICE_EN[adviceIdx],
      tags: JSON.stringify(tags),
      field: role.field,
      is_featured: Math.random() > 0.7,
      is_active: true,
      sort_order: i + 200, // offset from existing data
    });
  }
  return stories;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to PostgreSQL");

  // --- Insert Success Stories ---
  const stories = generateSuccessStories(120);
  let storyInserted = 0;
  let storySkipped = 0;
  let storyErrors = 0;

  console.log(`\nInserting ${stories.length} success stories...`);
  for (const s of stories) {
    try {
      const result = await client.query(
        `INSERT INTO success_story (
          id, graduate_name, graduation_year, program_name,
          "current_role", current_role_en, company, location,
          salary_range, story_fr, story_en, key_achievement,
          key_achievement_fr, advice_fr, advice_en, tags,
          field, is_featured, is_active, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) ON CONFLICT (id) DO NOTHING`,
        [
          s.id, s.graduate_name, s.graduation_year, s.program_name,
          s.current_role, s.current_role_en, s.company, s.location,
          s.salary_range, s.story_fr, s.story_en, s.key_achievement,
          s.key_achievement_fr, s.advice_fr, s.advice_en, s.tags,
          s.field, s.is_featured, s.is_active, s.sort_order,
        ]
      );
      if (result.rowCount > 0) {
        storyInserted++;
      } else {
        storySkipped++;
      }
    } catch (err) {
      storyErrors++;
      console.error(`  Error inserting story for ${s.graduate_name}: ${err.message}`);
    }
  }
  console.log(`Success stories: ${storyInserted} inserted, ${storySkipped} skipped (conflict), ${storyErrors} errors`);

  // --- Insert Learning Resources ---
  let lrInserted = 0;
  let lrSkipped = 0;
  let lrErrors = 0;

  console.log(`\nInserting ${LEARNING_RESOURCES_DATA.length} learning resources...`);
  for (const r of LEARNING_RESOURCES_DATA) {
    try {
      const id = crypto.randomUUID();
      const result = await client.query(
        `INSERT INTO learning_resource (
          id, title, title_fr, description, description_fr,
          resource_type, difficulty, cost_type, price, currency,
          platform, provider, url, duration_minutes, duration_weeks,
          skills, target_fields, languages, rating,
          is_recommended, is_featured, is_active, tags
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6::learning_resource_type, $7::learning_difficulty, $8::learning_cost_type, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21, $22, $23
        ) ON CONFLICT (id) DO NOTHING`,
        [
          id, r.title, r.title_fr, r.desc, r.desc_fr,
          r.type, r.diff, r.cost, r.price || null, r.price > 0 ? "MAD" : null,
          r.platform, r.provider, r.url, r.dur_min || null, r.dur_weeks || null,
          r.skills, r.fields, r.langs, r.rating || null,
          r.rating >= 4.5, r.rating >= 4.7, true,
          r.skills.map(s => s.toLowerCase().replace(/\s+/g, "-")),
        ]
      );
      if (result.rowCount > 0) {
        lrInserted++;
      } else {
        lrSkipped++;
      }
    } catch (err) {
      lrErrors++;
      console.error(`  Error inserting resource "${r.title}": ${err.message}`);
    }
  }
  console.log(`Learning resources: ${lrInserted} inserted, ${lrSkipped} skipped (conflict), ${lrErrors} errors`);

  // --- Final counts ---
  const storyCount = await client.query("SELECT count(*) as cnt FROM success_story");
  const lrCount = await client.query("SELECT count(*) as cnt FROM learning_resource");
  console.log(`\n=== FINAL TOTALS ===`);
  console.log(`success_story: ${storyCount.rows[0].cnt} rows`);
  console.log(`learning_resource: ${lrCount.rows[0].cnt} rows`);

  await client.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
