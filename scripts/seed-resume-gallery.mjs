/**
 * seed-resume-gallery.mjs
 *
 * Populates the resume_gallery table with 200+ realistic Moroccan resume examples.
 * Creates the table if it doesn't exist.
 * Idempotent: uses ON CONFLICT DO NOTHING on the name column.
 *
 * Usage: node scripts/seed-resume-gallery.mjs
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

// ============================================================================
// DATA POOLS
// ============================================================================

const MALE_FIRST = [
	"Ahmed", "Mohammed", "Youssef", "Karim", "Omar", "Hassan", "Said", "Hamza",
	"Amine", "Rachid", "Mehdi", "Khalid", "Nabil", "Samir", "Driss", "Mustapha",
	"Adil", "Zakaria", "Othmane", "Jamal", "Reda", "Badr", "Ismail", "Tarik",
	"Anass", "Soufiane", "Hicham", "Abdelilah", "Fouad", "Mounir",
];

const FEMALE_FIRST = [
	"Fatima", "Khadija", "Aisha", "Meryem", "Salma", "Nadia", "Houda", "Sara",
	"Imane", "Leila", "Sanaa", "Nawal", "Hajar", "Zineb", "Ghita", "Soukaina",
	"Rim", "Lamia", "Wafae", "Latifa", "Yasmine", "Amina", "Hind", "Dounia",
	"Ikram", "Chaima", "Rajae", "Karima", "Bouchra", "Hanane",
];

const LAST_NAMES = [
	"El Fassi", "Benali", "Bouzidi", "Alaoui", "El Amrani", "Tahiri", "Chraibi",
	"Berrada", "Bennani", "El Idrissi", "Mernissi", "Sefrioui", "Tazi", "Kettani",
	"Lahlou", "Filali", "Benhima", "Squalli", "El Ouafi", "Cherkaoui", "Benjelloun",
	"El Khatib", "Mansouri", "Bouazza", "Ziani", "Hariri", "El Moussaoui", "Kadiri",
	"El Alami", "Naciri",
];

const CITIES = [
	"Casablanca", "Rabat", "Tangier", "Marrakech", "Fez", "Agadir", "Kenitra",
	"Meknes", "Oujda", "Tetouan", "Mohammedia", "El Jadida", "Beni Mellal", "Nador",
];

const TEMPLATES = [
	"azurill", "bronzor", "chikorita", "ditto", "glalie",
	"leafish", "nosepass", "onyx", "pikachu", "rhyhorn",
];

const SCHOOLS = [
	"IMTA", "ENSIAS", "EMI", "EHTP", "ENSA Marrakech", "ENSA Fez",
	"ENCG Casablanca", "ENCG Settat", "HEM", "ISCAE", "Faculte des Sciences Rabat",
	"Al Akhawayn University", "Universite Mohammed V", "Universite Hassan II",
	"INPT", "AIAC", "Ecole Centrale Casablanca",
];

// ============================================================================
// FIELD CONFIGURATIONS
// ============================================================================

const FIELDS = {
	"genie-informatique": {
		labelFr: "Genie Informatique",
		labelEn: "Computer Engineering",
		positions: {
			junior: [
				"Developpeur Full Stack", "Developpeur Frontend", "Developpeur Backend",
				"Ingenieur QA", "Developpeur Mobile", "Administrateur Systeme",
			],
			mid: [
				"Lead Developer", "Architecte Logiciel", "Ingenieur DevOps",
				"Data Engineer", "Ingenieur Cloud", "Scrum Master Technique",
			],
			senior: [
				"Directeur Technique", "VP Engineering", "Architecte Solutions",
				"Chief Technology Officer", "Engineering Manager",
			],
		},
		skills: [
			{ name: "Java", p: "Expert" }, { name: "Python", p: "Expert" },
			{ name: "JavaScript/TypeScript", p: "Expert" }, { name: "React", p: "Advanced" },
			{ name: "Spring Boot", p: "Advanced" }, { name: "Docker", p: "Advanced" },
			{ name: "PostgreSQL", p: "Expert" }, { name: "AWS", p: "Intermediate" },
			{ name: "Git", p: "Expert" }, { name: "Kubernetes", p: "Intermediate" },
			{ name: "CI/CD", p: "Advanced" }, { name: "Agile/Scrum", p: "Advanced" },
			{ name: "Node.js", p: "Advanced" }, { name: "MongoDB", p: "Intermediate" },
			{ name: "Linux", p: "Advanced" }, { name: "REST APIs", p: "Expert" },
		],
		companies: [
			"Capgemini Maroc", "CGI Maroc", "Atos Morocco", "HPS", "S2M", "Sopra Banking Software",
			"Sofrecom Maroc", "Sqli Group", "Devoteam Maroc", "Inwi", "Maroc Telecom",
			"NOVEC", "Majorel", "Umanis Maroc", "Obya",
		],
		subFields: ["web", "mobile", "cloud", "data", "securite", "IA"],
		tags: ["informatique", "developpement", "logiciel", "tech", "digital"],
		summaryFr: [
			"Ingenieur informatique diplome de {school}, passionne par le developpement logiciel et les architectures cloud. {years} ans d'experience dans la conception et la mise en oeuvre de solutions innovantes au Maroc.",
			"Professionnel IT avec {years} ans d'experience en developpement full stack. Expert en Java et frameworks modernes, avec une forte capacite a livrer des projets complexes dans les delais.",
			"Ingenieur en genie informatique specialise dans les systemes distribues et le cloud computing. Experience significative chez {company} dans la transformation digitale.",
		],
		summaryEn: [
			"Computer engineer graduated from {school}, passionate about software development and cloud architectures. {years} years of experience designing and implementing innovative solutions in Morocco.",
			"IT professional with {years} years of full-stack development experience. Expert in Java and modern frameworks, with strong ability to deliver complex projects on time.",
			"Computer engineering specialist focused on distributed systems and cloud computing. Significant experience at {company} in digital transformation.",
		],
		experienceDescFr: [
			"- Conception et developpement d'applications web avec React et Spring Boot\n- Mise en place de pipelines CI/CD avec Jenkins et Docker\n- Optimisation des performances applicatives (reduction du temps de reponse de 40%)",
			"- Developpement de microservices avec Node.js et PostgreSQL\n- Implementation de tests automatises (couverture de 85%)\n- Collaboration avec les equipes produit pour definir les specifications techniques",
			"- Migration de l'infrastructure vers le cloud AWS (EC2, S3, RDS)\n- Automatisation des deploiements avec Terraform et Ansible\n- Supervision et monitoring avec Prometheus et Grafana",
			"- Conception d'APIs RESTful pour des systemes a haute disponibilite\n- Integration de solutions de cache (Redis) pour ameliorer les performances\n- Mentorat de 3 developpeurs juniors dans l'equipe",
		],
		experienceDescEn: [
			"- Designed and developed web applications with React and Spring Boot\n- Set up CI/CD pipelines with Jenkins and Docker\n- Optimized application performance (40% response time reduction)",
			"- Developed microservices with Node.js and PostgreSQL\n- Implemented automated testing (85% code coverage)\n- Collaborated with product teams to define technical specifications",
			"- Migrated infrastructure to AWS cloud (EC2, S3, RDS)\n- Automated deployments with Terraform and Ansible\n- Supervised monitoring with Prometheus and Grafana",
			"- Designed RESTful APIs for high-availability systems\n- Integrated caching solutions (Redis) to improve performance\n- Mentored 3 junior developers on the team",
		],
	},
	"genie-industriel": {
		labelFr: "Genie Industriel",
		labelEn: "Industrial Engineering",
		positions: {
			junior: [
				"Ingenieur Methodes", "Ingenieur Production", "Ingenieur Qualite",
				"Ingenieur Amelioration Continue", "Technicien Industrialisation",
			],
			mid: [
				"Responsable Production", "Responsable Qualite", "Chef de Projet Industriel",
				"Ingenieur Supply Chain", "Lean Manager",
			],
			senior: [
				"Directeur Industriel", "Directeur des Operations", "VP Manufacturing",
				"Directeur Qualite et Amelioration Continue",
			],
		},
		skills: [
			{ name: "Lean Manufacturing", p: "Expert" }, { name: "Six Sigma", p: "Advanced" },
			{ name: "SAP", p: "Advanced" }, { name: "AutoCAD", p: "Intermediate" },
			{ name: "CATIA", p: "Advanced" }, { name: "Gestion de production", p: "Expert" },
			{ name: "AMDEC/FMEA", p: "Advanced" }, { name: "ISO 9001", p: "Expert" },
			{ name: "Kaizen", p: "Advanced" }, { name: "5S", p: "Expert" },
			{ name: "Kanban", p: "Advanced" }, { name: "SMED", p: "Intermediate" },
			{ name: "Excel avance", p: "Expert" }, { name: "MS Project", p: "Advanced" },
		],
		companies: [
			"Renault Maroc", "PSA Peugeot Maroc", "Safran Maroc", "Bombardier Maroc",
			"Lear Corporation", "Yazaki Maroc", "Sumitomo", "Delphi Maroc",
			"Valeo Maroc", "OCP Group", "LafargeHolcim Maroc", "Aluminium du Maroc",
		],
		subFields: ["production", "qualite", "lean", "supply-chain", "maintenance"],
		tags: ["industriel", "production", "qualite", "lean", "manufacturing"],
		summaryFr: [
			"Ingenieur industriel diplome de {school} avec {years} ans d'experience dans l'optimisation des processus de production. Certifie Lean Six Sigma, engage dans l'amelioration continue.",
			"Professionnel en genie industriel specialise dans la gestion de la qualite et la production. Experience chez {company} dans l'industrie automobile marocaine.",
			"Ingenieur methodes avec une expertise en optimisation des flux de production et en reduction des couts. Maitrise des outils Lean et des normes ISO.",
		],
		summaryEn: [
			"Industrial engineer graduated from {school} with {years} years of experience in production process optimization. Lean Six Sigma certified, committed to continuous improvement.",
			"Industrial engineering professional specialized in quality management and production. Experience at {company} in Moroccan automotive industry.",
			"Methods engineer with expertise in production flow optimization and cost reduction. Mastery of Lean tools and ISO standards.",
		],
		experienceDescFr: [
			"- Mise en place du systeme Lean Manufacturing sur 3 lignes de production\n- Reduction des temps de cycle de 25% grace a l'analyse SMED\n- Formation de 40 operateurs aux principes 5S et Kaizen",
			"- Pilotage de projets d'amelioration continue (gains de 2M MAD/an)\n- Implementation du systeme qualite ISO 9001:2015\n- Analyse des defauts par AMDEC et mise en place d'actions correctives",
			"- Gestion de la production quotidienne (500+ unites/jour)\n- Optimisation du planning de production avec SAP PP\n- Suivi des indicateurs KPI (TRS, taux de rebut, productivite)",
		],
		experienceDescEn: [
			"- Implemented Lean Manufacturing system on 3 production lines\n- Reduced cycle times by 25% through SMED analysis\n- Trained 40 operators on 5S and Kaizen principles",
			"- Led continuous improvement projects (2M MAD/year savings)\n- Implemented ISO 9001:2015 quality system\n- FMEA defect analysis and corrective action implementation",
			"- Managed daily production (500+ units/day)\n- Optimized production planning with SAP PP\n- Monitored KPIs (OEE, scrap rate, productivity)",
		],
	},
	"genie-civil": {
		labelFr: "Genie Civil",
		labelEn: "Civil Engineering",
		positions: {
			junior: [
				"Ingenieur BTP", "Ingenieur Structure", "Conducteur de Travaux",
				"Ingenieur Etudes", "Charge d'Affaires BTP",
			],
			mid: [
				"Chef de Projet BTP", "Responsable Bureau d'Etudes", "Directeur de Chantier",
				"Ingenieur VRD Senior", "BIM Manager",
			],
			senior: [
				"Directeur Technique BTP", "Directeur des Travaux", "VP Construction",
				"Directeur General BTP",
			],
		},
		skills: [
			{ name: "AutoCAD", p: "Expert" }, { name: "Revit/BIM", p: "Advanced" },
			{ name: "Robot Structural Analysis", p: "Advanced" }, { name: "ETABS", p: "Expert" },
			{ name: "Beton arme", p: "Expert" }, { name: "Charpente metallique", p: "Advanced" },
			{ name: "Geotechnique", p: "Intermediate" }, { name: "RPS 2011", p: "Expert" },
			{ name: "BAEL", p: "Expert" }, { name: "Eurocode", p: "Advanced" },
			{ name: "MS Project", p: "Advanced" }, { name: "Primavera P6", p: "Intermediate" },
		],
		companies: [
			"TGCC", "Addoha", "Alliances", "SGTM", "Jet Contractors", "Somagec",
			"NOVEC", "CID", "Chaabi Lil Iskane", "Palmeraie Developpement",
			"Youssef Laaroussi", "LafargeHolcim Maroc",
		],
		subFields: ["structure", "VRD", "batiment", "geotechnique", "BIM"],
		tags: ["BTP", "construction", "structure", "beton", "chantier"],
		summaryFr: [
			"Ingenieur en genie civil diplome de {school}, specialise dans le calcul de structures et la conduite de travaux. {years} ans d'experience sur des projets de grande envergure au Maroc.",
			"Professionnel BTP avec {years} ans d'experience dans la conception et la supervision de projets de construction. Maitrise des normes RPS 2011 et BAEL.",
			"Ingenieur structure passionne par la conception parasismique et les ouvrages d'art. Experience significative chez {company} sur des projets d'infrastructure.",
		],
		summaryEn: [
			"Civil engineer graduated from {school}, specialized in structural analysis and construction management. {years} years of experience on large-scale projects in Morocco.",
			"Construction professional with {years} years of experience in design and supervision of building projects. Mastery of RPS 2011 and BAEL standards.",
			"Structural engineer passionate about seismic design and civil works. Significant experience at {company} on infrastructure projects.",
		],
		experienceDescFr: [
			"- Calcul et dimensionnement de structures en beton arme (R+12)\n- Suivi de chantier et coordination des sous-traitants\n- Elaboration des plans d'execution avec AutoCAD et Revit",
			"- Direction d'un chantier de construction de 200 logements\n- Gestion d'un budget de 50M MAD et d'une equipe de 80 personnes\n- Respect des delais et des normes de qualite (zero accident)",
			"- Etude geotechnique et dimensionnement des fondations\n- Modelisation BIM des ouvrages avec Revit\n- Verification de la conformite aux normes parasismiques RPS 2011",
		],
		experienceDescEn: [
			"- Calculation and design of reinforced concrete structures (G+12)\n- Construction site supervision and subcontractor coordination\n- Execution plans with AutoCAD and Revit",
			"- Managed a 200-unit housing construction site\n- Managed a 50M MAD budget and 80-person team\n- Met deadlines and quality standards (zero accidents)",
			"- Geotechnical study and foundation design\n- BIM modeling with Revit\n- Compliance verification with RPS 2011 seismic standards",
		],
	},
	"genie-electrique": {
		labelFr: "Genie Electrique",
		labelEn: "Electrical Engineering",
		positions: {
			junior: [
				"Ingenieur Electrique", "Ingenieur Automatisme", "Technicien Electrique",
				"Ingenieur Energies Renouvelables", "Ingenieur Instrumentation",
			],
			mid: [
				"Chef de Projet Electrique", "Responsable Maintenance Electrique",
				"Ingenieur R&D Electronique", "Responsable Automatisme",
			],
			senior: [
				"Directeur Technique Electricite", "Directeur Maintenance",
				"VP Operations Energie", "Directeur Projets Energetiques",
			],
		},
		skills: [
			{ name: "EPLAN", p: "Expert" }, { name: "AutoCAD Electrical", p: "Advanced" },
			{ name: "MATLAB/Simulink", p: "Advanced" }, { name: "PLC Siemens", p: "Expert" },
			{ name: "Schneider Electric", p: "Advanced" }, { name: "SCADA", p: "Advanced" },
			{ name: "Haute tension", p: "Intermediate" }, { name: "Basse tension", p: "Expert" },
			{ name: "Energies renouvelables", p: "Advanced" }, { name: "NF C 15-100", p: "Expert" },
			{ name: "Variateurs de vitesse", p: "Advanced" }, { name: "Electronique de puissance", p: "Intermediate" },
		],
		companies: [
			"ONEE", "MASEN", "Lydec", "Schneider Electric Maroc", "ABB Maroc",
			"Siemens Maroc", "Nexans Maroc", "Vivo Energy", "Nareva",
			"Acwa Power Maroc", "TAQA Morocco", "Engie Maroc",
		],
		subFields: ["automatisme", "energie", "renouvelable", "electronique", "instrumentation"],
		tags: ["electrique", "automatisme", "energie", "PLC", "electricite"],
		summaryFr: [
			"Ingenieur en genie electrique diplome de {school}, specialise dans l'automatisme industriel et les systemes SCADA. {years} ans d'experience dans le secteur energetique marocain.",
			"Professionnel en electrotechnique avec {years} ans d'experience dans les energies renouvelables. Expert en conception de centrales solaires et eoliennes au Maroc.",
			"Ingenieur automaticien passionne par l'industrie 4.0 et la transformation digitale des processus industriels. Experience chez {company}.",
		],
		summaryEn: [
			"Electrical engineer graduated from {school}, specialized in industrial automation and SCADA systems. {years} years of experience in the Moroccan energy sector.",
			"Electrotechnical professional with {years} years of experience in renewable energy. Expert in solar and wind power plant design in Morocco.",
			"Automation engineer passionate about Industry 4.0 and digital transformation of industrial processes. Experience at {company}.",
		],
		experienceDescFr: [
			"- Programmation d'automates Siemens S7-1500 et Schneider M340\n- Conception de systemes SCADA pour la supervision de processus\n- Mise en service d'installations electriques industrielles",
			"- Etude et dimensionnement d'installations photovoltaiques (50 MW)\n- Supervision de la maintenance preventive des equipements HT/BT\n- Gestion de projet de raccordement au reseau ONEE",
			"- Conception de schemas electriques avec EPLAN\n- Automatisation de lignes de production (reduction des arrets de 30%)\n- Formation du personnel de maintenance aux nouveaux equipements",
		],
		experienceDescEn: [
			"- Programmed Siemens S7-1500 and Schneider M340 PLCs\n- Designed SCADA systems for process supervision\n- Commissioned industrial electrical installations",
			"- Designed and sized photovoltaic installations (50 MW)\n- Supervised preventive maintenance of HV/LV equipment\n- Managed ONEE grid connection project",
			"- Designed electrical schematics with EPLAN\n- Automated production lines (30% downtime reduction)\n- Trained maintenance staff on new equipment",
		],
	},
	"management": {
		labelFr: "Management",
		labelEn: "Management",
		positions: {
			junior: [
				"Assistant Manager", "Charge de Projet", "Analyste Business",
				"Consultant Junior", "Coordinateur de Projet",
			],
			mid: [
				"Chef de Projet", "Manager Operations", "Business Analyst Senior",
				"Consultant Senior", "Responsable PMO",
			],
			senior: [
				"Directeur General", "Directeur des Operations", "Partner",
				"VP Strategy", "Managing Director",
			],
		},
		skills: [
			{ name: "Gestion de projet", p: "Expert" }, { name: "Leadership", p: "Advanced" },
			{ name: "MS Project", p: "Advanced" }, { name: "PMP", p: "Advanced" },
			{ name: "Analyse financiere", p: "Intermediate" }, { name: "PowerPoint", p: "Expert" },
			{ name: "Excel avance", p: "Expert" }, { name: "SAP", p: "Intermediate" },
			{ name: "Strategie d'entreprise", p: "Advanced" }, { name: "Change Management", p: "Advanced" },
			{ name: "Business Intelligence", p: "Intermediate" }, { name: "Agile/Scrum", p: "Advanced" },
		],
		companies: [
			"McKinsey Maroc", "Deloitte Maroc", "PwC Maroc", "EY Maroc", "KPMG Maroc",
			"Accenture Maroc", "BCG Maroc", "Attijariwafa Bank", "BMCE Bank of Africa",
			"Royal Air Maroc", "OCP Group", "Marjane Group",
		],
		subFields: ["strategie", "conseil", "operations", "PMO", "transformation"],
		tags: ["management", "gestion", "leadership", "strategie", "conseil"],
		summaryFr: [
			"Manager experimente avec {years} ans d'experience dans le conseil en management et la gestion de projets strategiques. Diplome de {school}.",
			"Professionnel en management avec {years} ans d'experience dans la transformation organisationnelle. Expert en methodologies Agile et gestion du changement.",
			"Consultant en management specialise dans la strategie d'entreprise et l'optimisation operationnelle. Experience significative dans le conseil au Maroc.",
		],
		summaryEn: [
			"Experienced manager with {years} years in management consulting and strategic project management. Graduated from {school}.",
			"Management professional with {years} years of experience in organizational transformation. Expert in Agile methodologies and change management.",
			"Management consultant specialized in corporate strategy and operational optimization. Significant consulting experience in Morocco.",
		],
		experienceDescFr: [
			"- Pilotage de projets de transformation digitale (budget 10M MAD)\n- Coordination d'equipes pluridisciplinaires de 15+ personnes\n- Elaboration de tableaux de bord strategiques pour la direction",
			"- Accompagnement de 5 entreprises dans leur transformation Agile\n- Realisation d'audits organisationnels et plans d'amelioration\n- Animation de workshops strategiques avec les comites de direction",
			"- Gestion de portefeuille de projets (20+ projets simultanes)\n- Mise en place du PMO et des processus de gouvernance\n- Reporting mensuel aux parties prenantes et au conseil d'administration",
		],
		experienceDescEn: [
			"- Led digital transformation projects (10M MAD budget)\n- Coordinated cross-functional teams of 15+ people\n- Created strategic dashboards for executive management",
			"- Supported 5 companies in their Agile transformation\n- Conducted organizational audits and improvement plans\n- Facilitated strategic workshops with executive committees",
			"- Managed project portfolio (20+ simultaneous projects)\n- Established PMO and governance processes\n- Monthly reporting to stakeholders and board of directors",
		],
	},
	"commerce-international": {
		labelFr: "Commerce International",
		labelEn: "International Trade",
		positions: {
			junior: [
				"Charge d'Import-Export", "Assistant Commercial Export",
				"Analyste Commerce International", "Coordinateur Logistique Internationale",
			],
			mid: [
				"Responsable Export", "Trade Manager", "Chef de Zone Export",
				"Responsable Achats Internationaux", "Business Developer International",
			],
			senior: [
				"Directeur Commercial Export", "Directeur International",
				"VP International Business", "Directeur du Developpement International",
			],
		},
		skills: [
			{ name: "Incoterms 2020", p: "Expert" }, { name: "Credit documentaire", p: "Advanced" },
			{ name: "Douane et reglementation", p: "Expert" }, { name: "Negociation internationale", p: "Advanced" },
			{ name: "SAP SD", p: "Intermediate" }, { name: "Anglais commercial", p: "Expert" },
			{ name: "Espagnol", p: "Intermediate" }, { name: "Supply Chain internationale", p: "Advanced" },
			{ name: "Marketing international", p: "Advanced" }, { name: "Analyse de marche", p: "Advanced" },
		],
		companies: [
			"OCP Group", "Maroc Telecom", "COSUMAR", "Groupe Ynna", "Delassus",
			"Les Eaux Minerales d'Oulmes", "Diana Holding", "Afriquia Gaz",
			"MANAGEM", "Maghreb Steel", "Lesieur Cristal", "Tanger Med",
		],
		subFields: ["import-export", "achats", "developpement", "douane", "negoce"],
		tags: ["commerce", "international", "export", "import", "trade"],
		summaryFr: [
			"Specialiste en commerce international avec {years} ans d'experience dans le developpement des marches export africains et europeens. Diplome de {school}.",
			"Professionnel du commerce international avec une expertise en procedures douanieres et Incoterms. {years} ans d'experience dans l'industrie marocaine d'export.",
			"Charge d'affaires internationales specialise dans les relations commerciales Maroc-Europe et Maroc-Afrique. Maitrise trilingue francais-anglais-arabe.",
		],
		summaryEn: [
			"International trade specialist with {years} years of experience developing African and European export markets. Graduated from {school}.",
			"International trade professional with expertise in customs procedures and Incoterms. {years} years of experience in Moroccan export industry.",
			"International business manager specialized in Morocco-Europe and Morocco-Africa trade relations. Trilingual French-English-Arabic.",
		],
		experienceDescFr: [
			"- Developpement du portefeuille clients export (croissance de 35% du CA)\n- Gestion des operations d'import-export (Incoterms CIF, FOB, DDP)\n- Negociation de contrats internationaux avec des partenaires en Afrique et en Europe",
			"- Supervision des procedures douanieres et conformite reglementaire\n- Ouverture de 3 nouveaux marches en Afrique de l'Ouest\n- Coordination avec les transitaires et les compagnies maritimes",
			"- Prospection commerciale dans 8 pays africains\n- Participation aux salons internationaux (SIAM, Pollutec Maroc)\n- Mise en place d'un systeme de suivi des commandes export",
		],
		experienceDescEn: [
			"- Developed export client portfolio (35% revenue growth)\n- Managed import-export operations (Incoterms CIF, FOB, DDP)\n- Negotiated international contracts with African and European partners",
			"- Supervised customs procedures and regulatory compliance\n- Opened 3 new markets in West Africa\n- Coordinated with freight forwarders and shipping companies",
			"- Commercial prospecting in 8 African countries\n- Participated in international trade fairs (SIAM, Pollutec Morocco)\n- Implemented export order tracking system",
		],
	},
	"logistique": {
		labelFr: "Logistique",
		labelEn: "Logistics & Supply Chain",
		positions: {
			junior: [
				"Charge de Logistique", "Coordinateur Supply Chain",
				"Gestionnaire de Stock", "Assistant Achats", "Planificateur de Production",
			],
			mid: [
				"Responsable Logistique", "Supply Chain Manager", "Responsable Entrepot",
				"Responsable Achats", "Chef de Projet Logistique",
			],
			senior: [
				"Directeur Supply Chain", "Directeur Logistique",
				"VP Operations & Logistique", "Directeur des Achats",
			],
		},
		skills: [
			{ name: "SAP MM/WM", p: "Expert" }, { name: "WMS", p: "Advanced" },
			{ name: "Gestion des stocks", p: "Expert" }, { name: "Planification", p: "Advanced" },
			{ name: "Transport et distribution", p: "Advanced" }, { name: "Lean Logistics", p: "Intermediate" },
			{ name: "Excel/VBA", p: "Expert" }, { name: "Power BI", p: "Advanced" },
			{ name: "GPAO", p: "Advanced" }, { name: "Incoterms", p: "Advanced" },
		],
		companies: [
			"ONCF", "Tanger Med", "SDTM", "Maersk Maroc", "DHL Maroc",
			"SNTL", "Logismar", "M&M Militzer & Munch Maroc", "CTM",
			"Marjane Group", "Aswak Assalam", "BIM Stores",
		],
		subFields: ["entreposage", "transport", "achats", "supply-chain", "planification"],
		tags: ["logistique", "supply-chain", "stock", "transport", "achats"],
		summaryFr: [
			"Logisticien diplome de {school} avec {years} ans d'experience en gestion de la chaine logistique. Expert en optimisation des flux et reduction des couts de transport.",
			"Professionnel de la supply chain avec {years} ans d'experience dans la grande distribution et l'industrie. Maitrise de SAP et des outils WMS.",
			"Responsable logistique specialise dans la gestion d'entrepots et la distribution Last Mile. Experience chez {company}.",
		],
		summaryEn: [
			"Logistics professional graduated from {school} with {years} years of supply chain management experience. Expert in flow optimization and transport cost reduction.",
			"Supply chain professional with {years} years of experience in retail and industry. SAP and WMS tools mastery.",
			"Logistics manager specialized in warehouse management and Last Mile distribution. Experience at {company}.",
		],
		experienceDescFr: [
			"- Gestion d'un entrepot de 15 000 m2 (500+ references)\n- Optimisation des tournees de livraison (economie de 20% sur les couts de transport)\n- Implementation du systeme WMS et formation des equipes",
			"- Pilotage de la chaine logistique end-to-end\n- Negociation de contrats avec les transporteurs (reduction de 15%)\n- Mise en place d'indicateurs de performance logistique (taux de service 98%)",
			"- Planification de la production et gestion des approvisionnements\n- Optimisation des niveaux de stock (reduction de 25% du BFR)\n- Coordination avec les fournisseurs nationaux et internationaux",
		],
		experienceDescEn: [
			"- Managed a 15,000 sqm warehouse (500+ SKUs)\n- Optimized delivery routes (20% transport cost savings)\n- Implemented WMS system and trained teams",
			"- End-to-end supply chain management\n- Negotiated carrier contracts (15% reduction)\n- Established logistics KPIs (98% service rate)",
			"- Production planning and procurement management\n- Optimized stock levels (25% working capital reduction)\n- Coordinated with national and international suppliers",
		],
	},
	"finance": {
		labelFr: "Finance",
		labelEn: "Finance",
		positions: {
			junior: [
				"Analyste Financier", "Charge de Clientele Bancaire",
				"Auditeur Junior", "Controleur de Gestion Junior", "Charge de Recouvrement",
			],
			mid: [
				"Responsable Financier", "Controller Financier", "Risk Manager",
				"Responsable Tresorerie", "Chef de Mission Audit",
			],
			senior: [
				"Directeur Financier", "CFO", "Directeur Audit",
				"VP Finance", "Directeur des Risques",
			],
		},
		skills: [
			{ name: "Analyse financiere", p: "Expert" }, { name: "Modelisation financiere", p: "Advanced" },
			{ name: "SAP FI/CO", p: "Advanced" }, { name: "IFRS", p: "Expert" },
			{ name: "Controle de gestion", p: "Expert" }, { name: "Audit", p: "Advanced" },
			{ name: "Excel avance/VBA", p: "Expert" }, { name: "Bloomberg Terminal", p: "Intermediate" },
			{ name: "Power BI", p: "Advanced" }, { name: "Risk Management", p: "Advanced" },
			{ name: "Tresorerie", p: "Advanced" }, { name: "Fiscalite marocaine", p: "Expert" },
		],
		companies: [
			"Attijariwafa Bank", "BMCE Bank of Africa", "Banque Populaire", "CIH Bank",
			"CDG Capital", "Societe Generale Maroc", "Credit du Maroc", "BMCI",
			"Deloitte Maroc", "PwC Maroc", "EY Maroc", "KPMG Maroc",
			"OCP Group", "Saham Assurance", "Wafa Assurance",
		],
		subFields: ["banque", "audit", "controle-gestion", "tresorerie", "risques"],
		tags: ["finance", "banque", "audit", "comptabilite", "investissement"],
		summaryFr: [
			"Professionnel de la finance avec {years} ans d'experience dans le secteur bancaire marocain. Diplome de {school}, expert en analyse financiere et gestion des risques.",
			"Controleur de gestion avec {years} ans d'experience dans l'industrie et les services. Maitrise des normes IFRS et du referentiel comptable marocain.",
			"Auditeur financier avec une experience significative dans les Big Four au Maroc. Specialise dans l'audit des institutions financieres et des assurances.",
		],
		summaryEn: [
			"Finance professional with {years} years of experience in Moroccan banking. Graduated from {school}, expert in financial analysis and risk management.",
			"Management controller with {years} years of experience in industry and services. IFRS and Moroccan accounting standards mastery.",
			"Financial auditor with significant Big Four experience in Morocco. Specialized in auditing financial institutions and insurance companies.",
		],
		experienceDescFr: [
			"- Elaboration des budgets previsionnels et suivi des ecarts\n- Analyse financiere des projets d'investissement (ROI, VAN, TRI)\n- Preparation des reportings mensuels pour le comite de direction",
			"- Audit des comptes annuels (CA consolide de 2Mds MAD)\n- Evaluation des risques operationnels et financiers\n- Mise en conformite avec les normes IFRS 9 et 16",
			"- Gestion de la tresorerie (50M MAD de flux quotidiens)\n- Negociation des conditions bancaires et des lignes de credit\n- Mise en place d'un outil de cash pooling pour le groupe",
		],
		experienceDescEn: [
			"- Prepared forecast budgets and variance analysis\n- Financial analysis of investment projects (ROI, NPV, IRR)\n- Monthly reporting for executive committee",
			"- Audited annual accounts (2B MAD consolidated revenue)\n- Operational and financial risk assessment\n- IFRS 9 and 16 compliance implementation",
			"- Treasury management (50M MAD daily flows)\n- Negotiated banking conditions and credit lines\n- Implemented cash pooling tool for the group",
		],
	},
	"marketing": {
		labelFr: "Marketing",
		labelEn: "Marketing",
		positions: {
			junior: [
				"Charge de Marketing", "Community Manager", "Chef de Produit Junior",
				"Charge de Communication", "Assistant Marketing Digital",
			],
			mid: [
				"Responsable Marketing Digital", "Brand Manager", "Chef de Produit Senior",
				"Responsable Communication", "Growth Manager",
			],
			senior: [
				"Directeur Marketing", "CMO", "Directeur Communication",
				"VP Marketing & Digital", "Directeur de Marque",
			],
		},
		skills: [
			{ name: "Marketing digital", p: "Expert" }, { name: "Google Analytics", p: "Advanced" },
			{ name: "SEO/SEA", p: "Advanced" }, { name: "Reseaux sociaux", p: "Expert" },
			{ name: "Content Marketing", p: "Advanced" }, { name: "CRM (Salesforce/HubSpot)", p: "Intermediate" },
			{ name: "Email Marketing", p: "Advanced" }, { name: "Photoshop/Canva", p: "Advanced" },
			{ name: "Google Ads", p: "Advanced" }, { name: "Facebook Ads", p: "Expert" },
			{ name: "Branding", p: "Advanced" }, { name: "Etude de marche", p: "Advanced" },
		],
		companies: [
			"Marjane Group", "Centrale Danone", "Coca-Cola Maroc", "Procter & Gamble Maroc",
			"Unilever Maroc", "Meditel/Orange Maroc", "Inwi", "Jumia Maroc",
			"Avito", "Hmizate", "WB (Wana Corporate)", "L'Oreal Maroc",
		],
		subFields: ["digital", "branding", "communication", "produit", "CRM"],
		tags: ["marketing", "digital", "communication", "branding", "social-media"],
		summaryFr: [
			"Professionnel du marketing digital avec {years} ans d'experience dans la strategie de marque et le growth marketing. Diplome de {school}.",
			"Specialiste en marketing avec {years} ans d'experience dans la grande consommation au Maroc. Expert en lancement de produits et campagnes publicitaires.",
			"Community Manager et content creator avec une expertise en strategie de contenu et gestion des reseaux sociaux. Experience chez {company}.",
		],
		summaryEn: [
			"Digital marketing professional with {years} years of experience in brand strategy and growth marketing. Graduated from {school}.",
			"Marketing specialist with {years} years of experience in FMCG in Morocco. Expert in product launches and advertising campaigns.",
			"Community Manager and content creator with expertise in content strategy and social media management. Experience at {company}.",
		],
		experienceDescFr: [
			"- Elaboration et execution de strategies marketing digital (ROI de 300%)\n- Gestion de campagnes Google Ads et Facebook Ads (budget 500K MAD/an)\n- Augmentation de la communaute social media de 0 a 50K abonnes",
			"- Lancement de 3 nouveaux produits sur le marche marocain\n- Realisation d'etudes de marche et analyse concurrentielle\n- Coordination avec les agences de publicite et de creation",
			"- Strategie de content marketing (blog, newsletter, video)\n- Optimisation SEO du site web (trafic organique +60%)\n- Mise en place d'un programme de fidelisation client (CRM HubSpot)",
		],
		experienceDescEn: [
			"- Developed and executed digital marketing strategies (300% ROI)\n- Managed Google Ads and Facebook Ads campaigns (500K MAD/year budget)\n- Grew social media community from 0 to 50K followers",
			"- Launched 3 new products in the Moroccan market\n- Conducted market research and competitive analysis\n- Coordinated with advertising and creative agencies",
			"- Content marketing strategy (blog, newsletter, video)\n- Website SEO optimization (organic traffic +60%)\n- Implemented customer loyalty program (HubSpot CRM)",
		],
	},
	"ressources-humaines": {
		labelFr: "Ressources Humaines",
		labelEn: "Human Resources",
		positions: {
			junior: [
				"Charge de Recrutement", "Assistant RH", "Charge de Formation",
				"Gestionnaire de Paie", "Charge de Relations Sociales",
			],
			mid: [
				"Responsable RH", "Responsable Recrutement", "HR Business Partner",
				"Responsable Formation", "Responsable Paie et Administration",
			],
			senior: [
				"Directeur des Ressources Humaines", "DRH", "VP People & Culture",
				"Chief Human Resources Officer",
			],
		},
		skills: [
			{ name: "Recrutement", p: "Expert" }, { name: "Droit du travail marocain", p: "Expert" },
			{ name: "GPEC", p: "Advanced" }, { name: "Formation professionnelle", p: "Advanced" },
			{ name: "Gestion de paie", p: "Expert" }, { name: "SIRH (SAP HR/Sage)", p: "Advanced" },
			{ name: "Entretiens annuels", p: "Advanced" }, { name: "Relations sociales", p: "Advanced" },
			{ name: "LinkedIn Recruiter", p: "Expert" }, { name: "Assessment Center", p: "Intermediate" },
			{ name: "Marque employeur", p: "Advanced" }, { name: "CNSS/AMO", p: "Expert" },
		],
		companies: [
			"Manpower Maroc", "Adecco Maroc", "Michael Page Maroc", "Rekrute.com",
			"OCP Group", "Royal Air Maroc", "Maroc Telecom", "Attijariwafa Bank",
			"Renault Maroc", "LafargeHolcim Maroc", "Lydec", "Majorel",
		],
		subFields: ["recrutement", "formation", "paie", "relations-sociales", "GPEC"],
		tags: ["RH", "recrutement", "formation", "paie", "droit-travail"],
		summaryFr: [
			"Professionnel RH avec {years} ans d'experience dans la gestion des ressources humaines au Maroc. Expert en recrutement, formation et droit du travail marocain.",
			"Responsable RH diplome de {school} avec {years} ans d'experience. Specialise dans la GPEC, la gestion des talents et la transformation culturelle.",
			"Generaliste RH avec une expertise en relations sociales et administration du personnel. Experience significative dans le secteur industriel marocain.",
		],
		summaryEn: [
			"HR professional with {years} years of experience in human resources management in Morocco. Expert in recruitment, training, and Moroccan labor law.",
			"HR manager graduated from {school} with {years} years of experience. Specialized in workforce planning, talent management, and cultural transformation.",
			"HR generalist with expertise in social relations and personnel administration. Significant experience in Moroccan industrial sector.",
		],
		experienceDescFr: [
			"- Gestion du processus de recrutement end-to-end (150+ recrutements/an)\n- Mise en place d'un programme d'onboarding structure\n- Developpement de la marque employeur sur LinkedIn et Rekrute.com",
			"- Administration du personnel et gestion de la paie (500+ salaries)\n- Suivi des declarations CNSS et AMO\n- Gestion des relations avec les delegues du personnel et les syndicats",
			"- Elaboration du plan de formation annuel (budget 2M MAD)\n- Conduite d'entretiens annuels d'evaluation\n- Mise en place d'un SIRH (SAP HCM) et digitalisation des processus RH",
		],
		experienceDescEn: [
			"- End-to-end recruitment process management (150+ hires/year)\n- Structured onboarding program implementation\n- Employer branding on LinkedIn and Rekrute.com",
			"- Personnel administration and payroll management (500+ employees)\n- CNSS and AMO declarations management\n- Union and employee representative relations",
			"- Annual training plan development (2M MAD budget)\n- Annual performance review process management\n- HRIS implementation (SAP HCM) and HR process digitalization",
		],
	},
};

// ============================================================================
// SEEDED PRNG (deterministic across runs)
// ============================================================================

let _seed = 42;
function seededRandom() {
	_seed = (_seed * 16807 + 0) % 2147483647;
	return (_seed - 1) / 2147483646;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function pick(arr) {
	return arr[Math.floor(seededRandom() * arr.length)];
}

function pickN(arr, n) {
	const shuffled = [...arr].sort(() => seededRandom() - 0.5);
	return shuffled.slice(0, Math.min(n, arr.length));
}

function randomInt(min, max) {
	return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function generatePhone() {
	const prefixes = ["0661", "0662", "0670", "0671", "0660", "0668", "0522", "0537"];
	return `${pick(prefixes)}-${randomInt(100000, 999999)}`;
}

function generateEmail(first, last) {
	const cleaned = `${first.toLowerCase()}.${last.toLowerCase().replace(/ /g, "").replace(/'/g, "")}`;
	const domains = ["gmail.com", "outlook.com", "yahoo.fr", "hotmail.com", "live.fr"];
	return `${cleaned}@${pick(domains)}`;
}

function getExperienceYears(bracket) {
	switch (bracket) {
		case "fresh": return randomInt(0, 1);
		case "junior": return randomInt(2, 5);
		case "mid": return randomInt(5, 10);
		case "senior": return randomInt(10, 20);
		default: return 0;
	}
}

function getPositionLevel(bracket) {
	switch (bracket) {
		case "fresh": return "junior";
		case "junior": return "junior";
		case "mid": return "mid";
		case "senior": return "senior";
		default: return "junior";
	}
}

function getAtsScore(bracket) {
	switch (bracket) {
		case "fresh": return randomInt(70, 82);
		case "junior": return randomInt(78, 88);
		case "mid": return randomInt(82, 93);
		case "senior": return randomInt(88, 98);
		default: return 80;
	}
}

function generateGradYear(expYears) {
	return 2026 - expYears - randomInt(0, 2);
}

function generateExperienceItems(fieldConfig, expYears, language, bracket) {
	const items = [];
	const posLevel = getPositionLevel(bracket);
	const positions = fieldConfig.positions[posLevel] || fieldConfig.positions.junior;
	const descs = language === "en" ? fieldConfig.experienceDescEn : fieldConfig.experienceDescFr;

	const numJobs = bracket === "fresh" ? 1 : bracket === "junior" ? randomInt(1, 3) : bracket === "mid" ? randomInt(2, 4) : randomInt(3, 5);
	let currentYear = 2026;

	for (let i = 0; i < numJobs; i++) {
		const duration = i === 0 ? randomInt(1, 3) : randomInt(1, 4);
		const startYear = currentYear - duration;
		const company = pick(fieldConfig.companies);
		const position = pick(positions);

		items.push({
			company,
			position,
			period: `${startYear} - ${i === 0 ? "Present" : currentYear}`,
			description: pick(descs),
		});

		currentYear = startYear;
		if (currentYear < 2026 - expYears) break;
	}

	return items;
}

function generateEducationItems(fieldConfig, expYears, language) {
	const gradYear = generateGradYear(expYears);
	const school = pick(SCHOOLS);
	const items = [
		{
			school,
			degree: language === "en" ? "Engineering Diploma" : "Diplome d'Ingenieur",
			field: fieldConfig.labelFr,
			period: `${gradYear - 3} - ${gradYear}`,
			grade: "",
		},
	];

	// Some add a masters or prep class
	if (seededRandom() > 0.5) {
		items.push({
			school: pick(["Classes Preparatoires CPGE", "Faculte des Sciences", "Lycee d'Excellence"]),
			degree: language === "en" ? "Preparatory Classes" : "Classes Preparatoires aux Grandes Ecoles",
			field: language === "en" ? "Mathematics & Physics" : "Mathematiques et Physique",
			period: `${gradYear - 5} - ${gradYear - 3}`,
			grade: "",
		});
	}

	return { items, school };
}

function generateSkills(fieldConfig, bracket) {
	const numSkills = bracket === "fresh" ? randomInt(5, 8) : bracket === "junior" ? randomInt(6, 10) : randomInt(8, 14);
	return pickN(fieldConfig.skills, numSkills).map(s => ({ name: s.name, proficiency: s.p }));
}

function generateLanguages(language) {
	const items = [
		{ name: "Arabe", proficiency: "Native" },
		{ name: "Francais", proficiency: "Fluent" },
	];
	if (language === "en" || language === "bilingual") {
		items.push({ name: "Anglais", proficiency: language === "en" ? "Fluent" : "Advanced" });
	} else {
		if (seededRandom() > 0.4) {
			items.push({ name: "Anglais", proficiency: pick(["Intermediate", "Advanced"]) });
		}
	}
	if (seededRandom() > 0.8) {
		items.push({ name: "Espagnol", proficiency: "Intermediate" });
	}
	return items;
}

function buildResumeData(firstName, lastName, fieldConfig, expYears, language, bracket) {
	const city = pick(CITIES);
	const { items: educationItems, school } = generateEducationItems(fieldConfig, expYears, language);
	const company = pick(fieldConfig.companies);

	const summaries = language === "en" ? fieldConfig.summaryEn : fieldConfig.summaryFr;
	const summary = pick(summaries)
		.replace("{school}", school)
		.replace("{years}", String(expYears))
		.replace("{company}", company);

	const posLevel = getPositionLevel(bracket);
	const positions = fieldConfig.positions[posLevel] || fieldConfig.positions.junior;
	const headline = pick(positions);

	return {
		basics: {
			name: `${firstName} ${lastName}`,
			headline,
			email: generateEmail(firstName, lastName),
			phone: generatePhone(),
			location: city,
			cin: "",
		},
		summary: { content: summary },
		sections: {
			experience: {
				items: generateExperienceItems(fieldConfig, expYears, language, bracket),
			},
			education: {
				items: educationItems,
			},
			skills: {
				items: generateSkills(fieldConfig, bracket),
			},
			languages: {
				items: generateLanguages(language),
			},
		},
	};
}

// ============================================================================
// RESUME GENERATION PLAN
// ============================================================================

function generateAllResumes() {
	_seed = 42; // Reset seed for deterministic output
	const resumes = [];
	const fieldKeys = Object.keys(FIELDS);
	let counter = 0;

	// Distribution plan per field:
	// fresh: 6, junior: 8, mid: 4, senior: 2 = 20 per field minimum
	// 10 fields x 20 = 200
	// We add extras to meet the language distribution targets
	const distributionPerField = [
		// bracket, language, count
		{ bracket: "fresh", count: 4, lang: "fr" },
		{ bracket: "fresh", count: 1, lang: "en" },
		{ bracket: "fresh", count: 1, lang: "bilingual" },
		{ bracket: "junior", count: 5, lang: "fr" },
		{ bracket: "junior", count: 2, lang: "en" },
		{ bracket: "junior", count: 1, lang: "bilingual" },
		{ bracket: "mid", count: 3, lang: "fr" },
		{ bracket: "mid", count: 1, lang: "en" },
		{ bracket: "senior", count: 2, lang: "fr" },
		// = 20 per field = 200 total across 10 fields
	];

	// Additional resumes to push past 200 and meet specific targets
	const extras = [
		// More fresh grads to reach 60+
		{ field: "genie-informatique", bracket: "fresh", lang: "fr" },
		{ field: "genie-informatique", bracket: "fresh", lang: "en" },
		{ field: "genie-industriel", bracket: "fresh", lang: "fr" },
		{ field: "genie-civil", bracket: "fresh", lang: "fr" },
		{ field: "management", bracket: "fresh", lang: "fr" },
		{ field: "finance", bracket: "fresh", lang: "fr" },
		{ field: "marketing", bracket: "fresh", lang: "en" },
		{ field: "logistique", bracket: "fresh", lang: "fr" },
		{ field: "ressources-humaines", bracket: "fresh", lang: "fr" },
		{ field: "commerce-international", bracket: "fresh", lang: "bilingual" },
		// More juniors
		{ field: "genie-informatique", bracket: "junior", lang: "en" },
		{ field: "genie-informatique", bracket: "junior", lang: "fr" },
		{ field: "genie-electrique", bracket: "junior", lang: "fr" },
		{ field: "marketing", bracket: "junior", lang: "fr" },
		{ field: "finance", bracket: "junior", lang: "en" },
		// More mids
		{ field: "genie-informatique", bracket: "mid", lang: "fr" },
		{ field: "management", bracket: "mid", lang: "en" },
		{ field: "finance", bracket: "mid", lang: "bilingual" },
		// More seniors
		{ field: "genie-informatique", bracket: "senior", lang: "fr" },
		{ field: "management", bracket: "senior", lang: "en" },
	];

	// Generate the main distribution
	for (const fieldKey of fieldKeys) {
		const fieldConfig = FIELDS[fieldKey];

		for (const dist of distributionPerField) {
			for (let i = 0; i < dist.count; i++) {
				counter++;
				const isFemale = seededRandom() > 0.5;
				const firstName = isFemale ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
				const lastName = pick(LAST_NAMES);
				const expYears = getExperienceYears(dist.bracket);
				const template = TEMPLATES[counter % TEMPLATES.length];
				const language = dist.lang === "bilingual" ? "fr" : dist.lang;
				const subField = pick(fieldConfig.subFields);

				const resumeData = buildResumeData(firstName, lastName, fieldConfig, expYears, language, dist.bracket);
				const atsScore = getAtsScore(dist.bracket);
				const isFeatured = atsScore >= 90 && seededRandom() > 0.6;

				const nameSuffix = `${firstName} ${lastName} - ${fieldConfig.labelFr} ${counter}`;

				resumes.push({
					name: nameSuffix,
					name_fr: nameSuffix,
					field: fieldKey,
					sub_field: subField,
					experience_years: expYears,
					template_name: template,
					language: dist.lang === "bilingual" ? "fr" : dist.lang,
					description: `${resumeData.basics.headline} with ${expYears} year(s) of experience in ${fieldConfig.labelEn}. Based in ${resumeData.basics.location}.`,
					description_fr: `${resumeData.basics.headline} avec ${expYears} an(s) d'experience en ${fieldConfig.labelFr}. Base(e) a ${resumeData.basics.location}.`,
					resume_data: resumeData,
					tags: [...fieldConfig.tags, dist.bracket, dist.lang === "bilingual" ? "bilingue" : dist.lang],
					ats_score: atsScore,
					is_featured: isFeatured,
				});
			}
		}
	}

	// Generate extras
	for (const extra of extras) {
		counter++;
		const fieldConfig = FIELDS[extra.field];
		const isFemale = seededRandom() > 0.5;
		const firstName = isFemale ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
		const lastName = pick(LAST_NAMES);
		const expYears = getExperienceYears(extra.bracket);
		const template = TEMPLATES[counter % TEMPLATES.length];
		const language = extra.lang === "bilingual" ? "fr" : extra.lang;
		const subField = pick(fieldConfig.subFields);

		const resumeData = buildResumeData(firstName, lastName, fieldConfig, expYears, language, extra.bracket);
		const atsScore = getAtsScore(extra.bracket);
		const isFeatured = atsScore >= 90 && seededRandom() > 0.6;

		const nameSuffix = `${firstName} ${lastName} - ${fieldConfig.labelFr} ${counter}`;

		resumes.push({
			name: nameSuffix,
			name_fr: nameSuffix,
			field: extra.field,
			sub_field: subField,
			experience_years: expYears,
			template_name: template,
			language: extra.lang === "bilingual" ? "fr" : extra.lang,
			description: `${resumeData.basics.headline} with ${expYears} year(s) of experience in ${fieldConfig.labelEn}. Based in ${resumeData.basics.location}.`,
			description_fr: `${resumeData.basics.headline} avec ${expYears} an(s) d'experience en ${fieldConfig.labelFr}. Base(e) a ${resumeData.basics.location}.`,
			resume_data: resumeData,
			tags: [...fieldConfig.tags, extra.bracket, extra.lang === "bilingual" ? "bilingue" : extra.lang],
			ats_score: atsScore,
			is_featured: isFeatured,
		});
	}

	return resumes;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
	await client.connect();
	console.log("Connected to PostgreSQL (localhost:5432)");

	// ── Step 1: Check if table exists ──
	const tableCheck = await client.query(`
		SELECT table_name FROM information_schema.tables
		WHERE table_schema = 'public'
		AND (table_name LIKE '%gallery%' OR table_name LIKE '%example%' OR table_name LIKE '%template_example%');
	`);

	if (tableCheck.rows.length > 0) {
		console.log("Found existing tables:", tableCheck.rows.map(r => r.table_name).join(", "));
	} else {
		console.log("No gallery table found. Creating resume_gallery...");
	}

	// ── Step 2: Create table (idempotent) ──
	await client.query(`
		CREATE TABLE IF NOT EXISTS resume_gallery (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name TEXT NOT NULL,
			name_fr TEXT NOT NULL,
			field TEXT NOT NULL,
			sub_field TEXT,
			experience_years INTEGER DEFAULT 0,
			template_name TEXT DEFAULT 'azurill',
			language TEXT DEFAULT 'fr',
			description TEXT,
			description_fr TEXT,
			resume_data JSONB NOT NULL,
			tags TEXT[] DEFAULT '{}',
			ats_score INTEGER DEFAULT 85,
			is_featured BOOLEAN DEFAULT false,
			view_count INTEGER DEFAULT 0,
			use_count INTEGER DEFAULT 0,
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		);
	`);

	// Add unique constraint on name for idempotency (if not exists)
	try {
		await client.query(`ALTER TABLE resume_gallery ADD CONSTRAINT resume_gallery_name_unique UNIQUE (name);`);
		console.log("Added unique constraint on name column");
	} catch {
		// constraint already exists
	}

	await client.query(`CREATE INDEX IF NOT EXISTS idx_resume_gallery_field ON resume_gallery(field);`);
	await client.query(`CREATE INDEX IF NOT EXISTS idx_resume_gallery_experience ON resume_gallery(experience_years);`);
	await client.query(`CREATE INDEX IF NOT EXISTS idx_resume_gallery_language ON resume_gallery(language);`);
	await client.query(`CREATE INDEX IF NOT EXISTS idx_resume_gallery_featured ON resume_gallery(is_featured);`);
	await client.query(`CREATE INDEX IF NOT EXISTS idx_resume_gallery_ats_score ON resume_gallery(ats_score);`);
	console.log("Table and indexes ready.");

	// ── Step 3: Generate resumes ──
	const resumes = generateAllResumes();
	console.log(`\nGenerated ${resumes.length} resume examples. Inserting...`);

	// ── Step 4: Insert in batches ──
	let inserted = 0;
	let skipped = 0;
	const BATCH_SIZE = 25;

	for (let i = 0; i < resumes.length; i += BATCH_SIZE) {
		const batch = resumes.slice(i, i + BATCH_SIZE);
		const values = [];
		const params = [];
		let paramIdx = 1;

		for (const r of batch) {
			values.push(
				`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
			);
			params.push(
				r.name,
				r.name_fr,
				r.field,
				r.sub_field,
				r.experience_years,
				r.template_name,
				r.language,
				r.description,
				r.description_fr,
				JSON.stringify(r.resume_data),
				r.tags,
				r.ats_score,
				r.is_featured,
			);
		}

		const sql = `
			INSERT INTO resume_gallery (name, name_fr, field, sub_field, experience_years, template_name, language, description, description_fr, resume_data, tags, ats_score, is_featured)
			VALUES ${values.join(", ")}
			ON CONFLICT (name) DO NOTHING
		`;

		const result = await client.query(sql, params);
		const batchInserted = result.rowCount || 0;
		inserted += batchInserted;
		skipped += batch.length - batchInserted;

		if ((i / BATCH_SIZE) % 4 === 0) {
			process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(resumes.length / BATCH_SIZE)}...\r`);
		}
	}

	console.log("\n");

	// ── Step 5: Report stats ──
	const totalCount = await client.query(`SELECT COUNT(*) as total FROM resume_gallery`);
	const fieldCounts = await client.query(`SELECT field, COUNT(*) as count FROM resume_gallery GROUP BY field ORDER BY count DESC`);
	const expCounts = await client.query(`
		SELECT
			CASE
				WHEN experience_years <= 1 THEN '0-1 years (fresh)'
				WHEN experience_years <= 5 THEN '2-5 years (junior)'
				WHEN experience_years <= 10 THEN '5-10 years (mid)'
				ELSE '10+ years (senior)'
			END as bracket,
			COUNT(*) as count
		FROM resume_gallery
		GROUP BY bracket
		ORDER BY bracket
	`);
	const langCounts = await client.query(`SELECT language, COUNT(*) as count FROM resume_gallery GROUP BY language ORDER BY count DESC`);
	const templateCounts = await client.query(`SELECT template_name, COUNT(*) as count FROM resume_gallery GROUP BY template_name ORDER BY count DESC`);
	const featuredCount = await client.query(`SELECT COUNT(*) as count FROM resume_gallery WHERE is_featured = true`);

	console.log("============================================");
	console.log("   RESUME GALLERY SEED RESULTS");
	console.log("============================================");
	console.log(`Total generated:  ${resumes.length}`);
	console.log(`Inserted:         ${inserted}`);
	console.log(`Skipped (dupes):  ${skipped}`);
	console.log(`Total in DB:      ${totalCount.rows[0].total}`);
	console.log(`Featured:         ${featuredCount.rows[0].count}`);
	console.log("");

	console.log("--- By Field ---");
	for (const row of fieldCounts.rows) {
		console.log(`  ${row.field.padEnd(28)} ${row.count}`);
	}
	console.log("");

	console.log("--- By Experience ---");
	for (const row of expCounts.rows) {
		console.log(`  ${row.bracket.padEnd(28)} ${row.count}`);
	}
	console.log("");

	console.log("--- By Language ---");
	for (const row of langCounts.rows) {
		console.log(`  ${row.language.padEnd(28)} ${row.count}`);
	}
	console.log("");

	console.log("--- By Template ---");
	for (const row of templateCounts.rows) {
		console.log(`  ${row.template_name.padEnd(28)} ${row.count}`);
	}
	console.log("");
	console.log("============================================");
	console.log("Done! Resume gallery seeded successfully.");

	await client.end();
}

main().catch((err) => {
	console.error("FATAL:", err);
	process.exit(1);
});
