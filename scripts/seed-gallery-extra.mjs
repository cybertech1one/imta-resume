/**
 * Seed Gallery Extra — Adds 120 NEW resume gallery entries
 * Bilingual (EN + FR), realistic Moroccan names, all 12 fields covered
 * Each entry includes full resume_data JSON blob
 *
 * Usage: node scripts/seed-gallery-extra.mjs
 */

import pg from "pg";
import crypto from "node:crypto";

const DATABASE_URL =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

const client = new pg.Client({ connectionString: DATABASE_URL });

// ---------------------------------------------------------------------------
// Data pools
// ---------------------------------------------------------------------------

const FIELDS = [
	"genie-informatique",
	"genie-industriel",
	"genie-civil",
	"genie-electrique",
	"genie-mecanique",
	"management",
	"commerce-international",
	"logistique",
	"finance",
	"marketing",
	"ressources-humaines",
	"general",
];

const TEMPLATES = [
	"azurill", "bronzor", "chikorita", "ditto", "gengar", "glalie",
	"kakuna", "leafish", "nosepass", "onyx", "pikachu", "rhyhorn",
	"casablanca", "marrakech", "fes", "tangier", "rabat", "agadir",
	"essaouira", "chefchaouen", "meknes", "oujda", "tetouan", "ifrane",
	"ouarzazate", "kenitra", "safi", "eljadida", "beni-mellal", "nador", "taza",
];

const LANGUAGES = ["fr", "en", "bilingual-fr-en", "bilingual-fr-ar", "fr", "fr", "en", "bilingual-fr-en"];

const EXPERIENCE_RANGES = [0, 0, 1, 2, 3, 4, 5, 7, 8, 10, 12, 15];

const MOROCCAN_CITIES = [
	"Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir",
	"Meknes", "Oujda", "Kenitra", "Tetouan", "Safi", "El Jadida",
	"Beni Mellal", "Nador", "Taza", "Settat", "Mohammedia", "Khouribga",
];

const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.fr", "live.fr", "hotmail.com", "email.com"];

// Moroccan first names (male)
const MALE_FIRST = [
	"Ahmed", "Youssef", "Omar", "Karim", "Mehdi", "Amine", "Hamza",
	"Rachid", "Khalid", "Samir", "Nabil", "Adil", "Tarik", "Hicham",
	"Mourad", "Bilal", "Soufiane", "Zakaria", "Driss", "Badr",
	"Ismail", "Othmane", "Reda", "Hassan", "Abdelkader", "Yassine",
	"Jawad", "Simo", "Anass", "Imad",
];

// Moroccan first names (female)
const FEMALE_FIRST = [
	"Fatima Zahra", "Amina", "Salma", "Khadija", "Meriem", "Hanane",
	"Soukaina", "Imane", "Loubna", "Nawal", "Houda", "Sara", "Zineb",
	"Latifa", "Sanaa", "Ghita", "Hajar", "Rim", "Asmae", "Nadia",
	"Wiam", "Ikram", "Lamia", "Rajae", "Boutaina", "Meryem", "Oumaima",
	"Chaimae", "Dounia", "Ilham",
];

// Moroccan family names
const FAMILY = [
	"Bennani", "El Idrissi", "Tazi", "Boukhris", "Cherkaoui", "Alami",
	"El Amrani", "Benkirane", "Fassi Fihri", "El Ouardi", "Ziani",
	"Lahlou", "Berrada", "Guedira", "Benjelloun", "Sefrioui", "Regragui",
	"El Mansouri", "Tahiri", "Bouzid", "Kadiri", "Chraibi", "Kettani",
	"El Khamlichi", "Bensouda", "Mouline", "Hajji", "Sqalli", "Filali",
	"Benhima",
];

// ---------------------------------------------------------------------------
// Field-specific data for resume generation
// ---------------------------------------------------------------------------

const FIELD_DATA = {
	"genie-informatique": {
		headlines: [
			"Developpeur Full-Stack", "Ingenieur DevOps", "Data Scientist", "Architecte Cloud",
			"Developpeur Mobile", "Ingenieur Backend", "Analyste Cybersecurite", "Ingenieur ML/IA",
			"Developpeur Frontend Senior", "Ingenieur Systemes Embarques",
		],
		summaries: [
			"Developpeur full-stack specialise dans les applications cloud-native et l'architecture microservices. Experience significative en React, Node.js et AWS.",
			"Ingenieur logiciel expert en pipelines IA/ML et ingenierie des donnees. Maitrise de Python, TensorFlow et les architectures big data.",
			"Specialiste DevOps axe sur l'automatisation CI/CD et l'infrastructure as code. Certifie AWS et expert Docker/Kubernetes.",
			"Analyste en cybersecurite avec experience en tests d'intrusion et systemes SIEM. Certifie CEH et CompTIA Security+.",
			"Developpeur mobile creant des applications cross-platform performantes avec React Native et Flutter.",
			"Ingenieur backend competent en systemes distribues et architectures haute disponibilite. Expert PostgreSQL et Redis.",
			"Data scientist combinant modelisation statistique et deploiement ML en production. Publication sur le NLP pour le Darija.",
			"Architecte frontend specialise en optimisation des performances et design systems. Expert React et TypeScript.",
			"Architecte solutions cloud avec expertise multi-cloud AWS, Azure et GCP. Migration de systemes legacy.",
			"Programmeur systemes embarques avec experience IoT et calcul temps reel. Expert C/C++ et RTOS.",
		],
		descEn: [
			"Full-stack developer specializing in cloud-native applications and microservices architecture",
			"Software engineer with expertise in AI/ML pipelines and data engineering",
			"DevOps specialist focusing on CI/CD automation and infrastructure as code",
			"Cybersecurity analyst with experience in penetration testing and SIEM systems",
			"Mobile developer building cross-platform applications with React Native and Flutter",
			"Backend engineer skilled in distributed systems and high-availability architectures",
			"Data scientist combining statistical modeling with production ML deployment",
			"Frontend architect specializing in performance optimization and design systems",
			"Cloud solutions architect with multi-cloud expertise across AWS, Azure, and GCP",
			"Embedded systems programmer with IoT and real-time computing experience",
		],
		descFr: [
			"Developpeur full-stack specialise dans les applications cloud-native et l'architecture microservices",
			"Ingenieur logiciel expert en pipelines IA/ML et ingenierie des donnees",
			"Specialiste DevOps axe sur l'automatisation CI/CD et l'infrastructure as code",
			"Analyste en cybersecurite avec experience en tests d'intrusion et systemes SIEM",
			"Developpeur mobile creant des applications cross-platform avec React Native et Flutter",
			"Ingenieur backend competent en systemes distribues et architectures haute disponibilite",
			"Data scientist combinant modelisation statistique et deploiement ML en production",
			"Architecte frontend specialise en optimisation des performances et design systems",
			"Architecte solutions cloud avec expertise multi-cloud AWS, Azure et GCP",
			"Programmeur systemes embarques avec experience IoT et calcul temps reel",
		],
		skills: [
			["JavaScript", "Advanced"], ["TypeScript", "Advanced"], ["React", "Expert"], ["Node.js", "Advanced"],
			["Python", "Advanced"], ["Docker", "Intermediate"], ["AWS", "Advanced"], ["PostgreSQL", "Advanced"],
			["MongoDB", "Intermediate"], ["Kubernetes", "Intermediate"], ["Git", "Expert"], ["CI/CD", "Advanced"],
			["GraphQL", "Intermediate"], ["Redis", "Intermediate"], ["Linux", "Advanced"],
		],
		schools: ["ENSIAS", "ENSA Marrakech", "EMI Rabat", "INPT", "EHTP", "UM6P", "EMSI", "AIAC", "FST Fes", "ENSA Tanger"],
		degrees: ["Diplome d'Ingenieur", "Master en Informatique", "Licence en Genie Informatique"],
		companies: ["OCP Group IT", "CGI Maroc", "Capgemini Morocco", "Atos Morocco", "Umanis Maroc", "S2M", "HPS", "Involys", "SQLI Maroc", "Sopra HR Software"],
		positions: ["Developpeur Full-Stack", "Ingenieur DevOps", "Data Engineer", "Developpeur Backend", "Ingenieur Cloud", "Analyste Securite"],
		tags: ["JavaScript", "Python", "React", "Node.js", "Docker", "AWS", "TypeScript", "PostgreSQL", "MongoDB", "Kubernetes", "CI/CD", "Machine Learning", "REST API", "GraphQL", "Git"],
	},
	"genie-industriel": {
		headlines: [
			"Ingenieur Procedes Industriels", "Ingenieur Qualite", "Ingenieur Supply Chain",
			"Ingenieur Production", "Ingenieur Automatisation", "Responsable Amelioration Continue",
			"Ingenieur Maintenance", "Ingenieur Methodes", "Ingenieur HSE", "Ingenieur Industrie 4.0",
		],
		summaries: [
			"Ingenieur de procedes industriels optimisant les lignes de production avec Lean Six Sigma. Reduction des couts de 15% chez Yazaki.",
			"Ingenieur assurance qualite expert en ISO 9001 et norme automobile IATF 16949. Auditeur interne certifie.",
			"Specialiste optimisation supply chain avec experience chez Renault Tanger MED. Maitrise de SAP et planification de la demande.",
			"Ingenieur planification de production competent en systemes ERP et prevision de demande. Expert SAP PP/MM.",
			"Ingenieur automatisation concevant des systemes de controle PLC pour la fabrication. Programmation Siemens et Allen-Bradley.",
			"Responsable amelioration continue implementant Kaizen et 5S en usine. Green Belt Lean Six Sigma.",
			"Ingenieur maintenance industrielle expert en maintenance predictive et fiabilite. Reduction des pannes de 30%.",
			"Ingenieur methodes optimisant les temps de cycle et les postes de travail. Expert SMED et chronometrage.",
			"Ingenieur HSE assurant la conformite securite en environnement industriel. Formation de 200+ operateurs.",
			"Ingenieur systemes de fabrication integrant Industrie 4.0 et usine intelligente. Expert IoT industriel.",
		],
		descEn: [
			"Industrial process engineer optimizing production lines using Lean Six Sigma methodologies",
			"Quality assurance engineer with expertise in ISO 9001 and automotive IATF 16949 standards",
			"Supply chain optimization specialist with experience at Renault Tanger MED",
			"Production planning engineer skilled in ERP systems and demand forecasting",
			"Automation engineer designing PLC-based control systems for manufacturing",
			"Continuous improvement manager implementing Kaizen and 5S across factory floors",
			"Industrial maintenance engineer with predictive maintenance and reliability expertise",
			"Operations research analyst using simulation and optimization for capacity planning",
			"HSE engineer ensuring workplace safety compliance in heavy industry environments",
			"Manufacturing systems engineer integrating Industry 4.0 and smart factory solutions",
		],
		descFr: [
			"Ingenieur de procedes industriels optimisant les lignes de production avec Lean Six Sigma",
			"Ingenieur assurance qualite expert en ISO 9001 et norme automobile IATF 16949",
			"Specialiste optimisation supply chain avec experience chez Renault Tanger MED",
			"Ingenieur planification de production competent en systemes ERP et prevision de demande",
			"Ingenieur automatisation concevant des systemes de controle PLC pour la fabrication",
			"Responsable amelioration continue implementant Kaizen et 5S en usine",
			"Ingenieur maintenance industrielle expert en maintenance predictive et fiabilite",
			"Analyste recherche operationnelle utilisant simulation et optimisation pour la planification",
			"Ingenieur HSE assurant la conformite securite en environnement industriel lourd",
			"Ingenieur systemes de fabrication integrant Industrie 4.0 et usine intelligente",
		],
		skills: [
			["Lean Six Sigma", "Advanced"], ["ISO 9001", "Expert"], ["SAP", "Advanced"], ["AutoCAD", "Intermediate"],
			["Kaizen", "Advanced"], ["5S", "Expert"], ["PLC/SCADA", "Intermediate"], ["AMDEC/FMEA", "Advanced"],
			["SolidWorks", "Intermediate"], ["Excel Avance", "Expert"], ["Gestion de production", "Expert"],
			["SMED", "Advanced"], ["TPM", "Intermediate"], ["PDCA", "Advanced"], ["CATIA", "Intermediate"],
		],
		schools: ["EMSI", "AIAC", "ENSEM", "ENSA Fes", "FST Settat", "EHTP", "ENSA Agadir", "EMI Rabat", "ENSA Kenitra", "EST Sale"],
		degrees: ["Diplome d'Ingenieur", "Master en Genie Industriel", "Licence Professionnelle"],
		companies: ["Renault Tanger MED", "Yazaki Maroc", "Safran Nacelles", "Aptiv Tanger", "TESCO Maroc", "Delphi Maroc", "Fujikura Morocco", "Sumitomo Kenitra", "Lear Corporation", "TE Connectivity"],
		positions: ["Ingenieur Qualite", "Ingenieur Production", "Ingenieur Methodes", "Ingenieur Supply Chain", "Ingenieur Maintenance", "Responsable Amelioration Continue"],
		tags: ["Lean Six Sigma", "ISO 9001", "ERP", "SAP", "Kaizen", "5S", "PLC", "SCADA", "AutoCAD", "SolidWorks", "Supply Chain", "Quality Control", "Production Planning", "PDCA", "FMEA"],
	},
	"genie-civil": {
		headlines: [
			"Ingenieur Structure", "Chef de Projet BTP", "Ingenieur Geotechnique",
			"Coordinateur BIM", "Ingenieur Transport", "Ingenieur Hydraulique",
			"Conducteur de Travaux", "Ingenieur Environnement", "Ingenieur Ponts et Chaussees",
			"Ingenieur Urbanisme",
		],
		summaries: [
			"Ingenieur structure specialise en conception parasismique et structures en beton arme. Expert RPS 2000 et Eurocodes.",
			"Chef de projet supervisant des projets d'infrastructure a grande echelle au Maroc. Gestion de budgets de 50M+ MAD.",
			"Ingenieur geotechnique expert en conception de fondations et mecanique des sols. Campagnes de reconnaissance geotechnique.",
			"Coordinateur BIM implementant des workflows de construction numerique sur les grands projets nationaux.",
			"Ingenieur transport concevant des reseaux d'infrastructure autoroutiere et urbaine. Expert PISTE et Civil 3D.",
			"Ingenieur ressources en eau axe sur la conception de barrages et systemes hydrauliques. Modelisation HEC-RAS.",
			"Conducteur de travaux gerant des developpements residentiels multi-etages. Coordination de 50+ ouvriers.",
			"Ingenieur environnement specialise en construction durable et batiments verts. Certification LEED AP.",
			"Ingenieur conception de ponts avec experience sur les projets autoroutiers au Maroc.",
			"Ingenieur urbanisme contribuant aux initiatives de ville intelligente au Maroc.",
		],
		descEn: [
			"Structural engineer specializing in seismic design and reinforced concrete structures",
			"Project manager overseeing large-scale infrastructure projects across Morocco",
			"Geotechnical engineer with expertise in foundation design and soil mechanics",
			"BIM coordinator implementing digital construction workflows on major projects",
			"Transportation engineer designing highway and urban infrastructure networks",
			"Water resources engineer focused on dam design and hydraulic systems",
			"Construction site supervisor managing multi-story residential developments",
			"Environmental engineer specializing in sustainable construction and green buildings",
			"Bridge design engineer with experience on Tanger-Tetouan autoroute projects",
			"Urban planning engineer contributing to smart city initiatives in Morocco",
		],
		descFr: [
			"Ingenieur structure specialise en conception parasismique et structures en beton arme",
			"Chef de projet supervisant des projets d'infrastructure a grande echelle au Maroc",
			"Ingenieur geotechnique expert en conception de fondations et mecanique des sols",
			"Coordinateur BIM implementant des workflows de construction numerique",
			"Ingenieur transport concevant des reseaux d'infrastructure autoroutiere et urbaine",
			"Ingenieur ressources en eau axe sur la conception de barrages et systemes hydrauliques",
			"Conducteur de travaux gerant des developpements residentiels multi-etages",
			"Ingenieur environnement specialise en construction durable et batiments verts",
			"Ingenieur conception de ponts avec experience sur l'autoroute Tanger-Tetouan",
			"Ingenieur urbanisme contribuant aux initiatives de ville intelligente au Maroc",
		],
		skills: [
			["AutoCAD", "Expert"], ["Revit", "Advanced"], ["Robot Structural", "Advanced"], ["SAP2000", "Intermediate"],
			["ETABS", "Advanced"], ["Beton arme", "Expert"], ["RPS 2000", "Advanced"], ["Eurocode", "Advanced"],
			["BAEL", "Expert"], ["Primavera P6", "Intermediate"], ["MS Project", "Advanced"], ["BIM", "Intermediate"],
			["Civil 3D", "Intermediate"], ["PISTE", "Advanced"], ["Topographie", "Intermediate"],
		],
		schools: ["EHTP", "EMI Rabat", "ENSA Fes", "ENSIAS", "ENSA Marrakech", "FST Mohammedia", "ENSA Oujda", "ENSA Tanger", "AIAC", "ENSET Mohammedia"],
		degrees: ["Diplome d'Ingenieur", "Master en Genie Civil", "Licence en Genie Civil"],
		companies: ["Bouygues Construction Maroc", "SGTM", "SOMAGEC", "ADM", "ONCF", "Nador West Med", "Tanger Med", "SOGEA Maroc", "Jet Contractors", "SNCE"],
		positions: ["Ingenieur Structure", "Conducteur de Travaux", "Chef de Projet", "Ingenieur Etudes", "Ingenieur Geotechnique", "Coordinateur BIM"],
		tags: ["AutoCAD", "Revit", "BIM", "SAP2000", "ETABS", "Robot Structural", "SolidWorks", "Concrete Design", "Geotechnics", "Project Management", "BAEL", "Eurocode", "RPS 2000", "LEED", "Primavera"],
	},
	"genie-electrique": {
		headlines: [
			"Ingenieur Electrique", "Ingenieur Energies Renouvelables", "Ingenieur Electronique",
			"Ingenieur Installations Electriques", "Ingenieur Automatisme", "Ingenieur Telecom",
			"Consultant Efficacite Energetique", "Ingenieur Electronique de Puissance",
			"Ingenieur Instrumentation", "Ingenieur Smart Grid",
		],
		summaries: [
			"Ingenieur systemes electriques concevant des reseaux haute tension pour l'ONEE. Expert en protection et appareillage HT/MT.",
			"Ingenieur energies renouvelables specialise en solaire PV et conception de parcs eoliens. Projet Noor Ouarzazate.",
			"Ingenieur conception electronique creant des systemes embarques pour l'automobile. Expert STM32 et ARM.",
			"Ingenieur installations electriques gerant des projets industriels et commerciaux. CFO/CFA et eclairage.",
			"Ingenieur systemes de controle implementant des solutions SCADA et DCS. Programmation Siemens S7.",
			"Ingenieur telecommunications concevant l'infrastructure reseau 5G. Expert fibre optique et RF.",
			"Consultant efficacite energetique optimisant la consommation energetique des batiments. Audit energetique certifie.",
			"Ingenieur electronique de puissance developpant des systemes onduleurs et convertisseurs. Expert MATLAB/Simulink.",
			"Ingenieur instrumentation calibrant et maintenant les equipements de controle de processus.",
			"Ingenieur reseau intelligent implementant le comptage avance et l'automatisation de distribution.",
		],
		descEn: [
			"Power systems engineer designing high-voltage transmission networks for ONEE",
			"Renewable energy engineer specializing in solar PV and wind farm design",
			"Electronics design engineer creating embedded systems for automotive applications",
			"Electrical installation engineer managing industrial and commercial projects",
			"Control systems engineer implementing SCADA and DCS solutions",
			"Telecommunications engineer designing 5G network infrastructure",
			"Energy efficiency consultant optimizing building energy consumption",
			"Power electronics engineer developing inverter and converter systems",
			"Instrumentation engineer calibrating and maintaining process control equipment",
			"Smart grid engineer implementing advanced metering and distribution automation",
		],
		descFr: [
			"Ingenieur systemes electriques concevant des reseaux haute tension pour l'ONEE",
			"Ingenieur energies renouvelables specialise en solaire PV et conception de parcs eoliens",
			"Ingenieur conception electronique creant des systemes embarques pour l'automobile",
			"Ingenieur installations electriques gerant des projets industriels et commerciaux",
			"Ingenieur systemes de controle implementant des solutions SCADA et DCS",
			"Ingenieur telecommunications concevant l'infrastructure reseau 5G",
			"Consultant efficacite energetique optimisant la consommation des batiments",
			"Ingenieur electronique de puissance developpant des systemes onduleurs et convertisseurs",
			"Ingenieur instrumentation calibrant et maintenant les equipements de controle",
			"Ingenieur reseau intelligent implementant le comptage avance et l'automatisation",
		],
		skills: [
			["MATLAB", "Expert"], ["Simulink", "Advanced"], ["AutoCAD Electrical", "Advanced"], ["PLC Siemens", "Advanced"],
			["SCADA", "Intermediate"], ["ETAP", "Advanced"], ["Eplan", "Intermediate"], ["Power Systems", "Expert"],
			["Energies Renouvelables", "Advanced"], ["Electronique de Puissance", "Advanced"], ["PCB Design", "Intermediate"],
			["Proteus", "Intermediate"], ["LabVIEW", "Intermediate"], ["HT/MT/BT", "Advanced"], ["Smart Grid", "Intermediate"],
		],
		schools: ["ENSA Marrakech", "ENSEM", "EHTP", "ENSA Fes", "EMI Rabat", "INPT", "FST Fes", "ENSA Kenitra", "ENSA Oujda", "EST Casablanca"],
		degrees: ["Diplome d'Ingenieur", "Master en Genie Electrique", "Licence en Electronique"],
		companies: ["ONEE", "Schneider Electric Maroc", "Siemens Morocco", "Nexans Maroc", "Masen", "IRESEN", "NAREVA", "ABB Maroc", "Legrand Maroc", "Engie Maroc"],
		positions: ["Ingenieur Electrique", "Ingenieur Automatisme", "Ingenieur Energies Renouvelables", "Ingenieur Telecom", "Ingenieur Maintenance", "Chef de Projet Electrique"],
		tags: ["MATLAB", "Simulink", "PLC", "SCADA", "AutoCAD Electrical", "ETAP", "Power Systems", "Renewable Energy", "Solar PV", "Wind Energy", "Embedded Systems", "PCB Design", "HV/LV", "Smart Grid", "IoT"],
	},
	"genie-mecanique": {
		headlines: [
			"Ingenieur Conception Mecanique", "Ingenieur CVC", "Ingenieur Automobile",
			"Specialiste CAO/FAO", "Ingenieur Fluides", "Ingenieur Maintenance",
			"Ingenieur Robotique", "Ingenieur Materiaux", "Ingenieur Thermique", "Ingenieur Mecatronique",
		],
		summaries: [
			"Ingenieur conception mecanique utilisant CATIA V5 pour composants aeronautiques. Expert en cotation fonctionnelle et GD&T.",
			"Ingenieur systemes CVC concevant la climatisation pour batiments commerciaux. Calculs thermiques et dimensionnement.",
			"Ingenieur automobile travaillant sur le developpement moteur. Experience chez Renault sur les groupes motopropulseurs.",
			"Specialiste CAO/FAO programmant des machines CNC pour fabrication de precision. Expert G-code et Mastercam.",
			"Ingenieur dynamique des fluides realisant des analyses CFD industrielles. Expert ANSYS Fluent et OpenFOAM.",
			"Ingenieur planification maintenance implementant la TPM en usine. Reduction des arrets non planifies de 40%.",
			"Ingenieur robotique concevant des systemes d'assemblage automatises. Programmation KUKA et FANUC.",
			"Ingenieur materiaux specialise en composites pour l'aeronautique. Essais mecaniques et caracterisation.",
			"Ingenieur systemes thermiques optimisant echangeurs de chaleur et systemes de refroidissement.",
			"Ingenieur mecatronique integrant systemes mecaniques, electroniques et logiciels. Arduino et Raspberry Pi.",
		],
		descEn: [
			"Mechanical design engineer using CATIA V5 for aerospace component design",
			"HVAC systems engineer designing climate control for commercial buildings",
			"Automotive engineer working on powertrain development at Renault",
			"CAD/CAM specialist programming CNC machines for precision manufacturing",
			"Fluid dynamics engineer performing CFD analysis for industrial applications",
			"Maintenance planning engineer implementing TPM in manufacturing plants",
			"Robotics engineer designing automated assembly line systems",
			"Materials science engineer specializing in composite materials for aerospace",
			"Thermal systems engineer optimizing heat exchangers and cooling systems",
			"Mechatronics engineer integrating mechanical, electronic, and software systems",
		],
		descFr: [
			"Ingenieur conception mecanique utilisant CATIA V5 pour composants aeronautiques",
			"Ingenieur systemes CVC concevant la climatisation pour batiments commerciaux",
			"Ingenieur automobile travaillant sur le developpement moteur chez Renault",
			"Specialiste CAO/FAO programmant des machines CNC pour fabrication de precision",
			"Ingenieur dynamique des fluides realisant des analyses CFD industrielles",
			"Ingenieur planification maintenance implementant la TPM en usine",
			"Ingenieur robotique concevant des systemes d'assemblage automatises",
			"Ingenieur materiaux specialise en composites pour l'aeronautique",
			"Ingenieur systemes thermiques optimisant echangeurs et systemes de refroidissement",
			"Ingenieur mecatronique integrant systemes mecaniques, electroniques et logiciels",
		],
		skills: [
			["CATIA V5", "Expert"], ["SolidWorks", "Advanced"], ["ANSYS", "Advanced"], ["MATLAB", "Intermediate"],
			["AutoCAD", "Advanced"], ["CNC/FAO", "Advanced"], ["GD&T", "Expert"], ["RDM", "Advanced"],
			["Impression 3D", "Intermediate"], ["Thermodynamique", "Advanced"], ["Mecanique des Fluides", "Advanced"],
			["HVAC", "Intermediate"], ["Robotique", "Intermediate"], ["Lean Manufacturing", "Advanced"], ["TPM", "Intermediate"],
		],
		schools: ["ENSEM", "EMI Rabat", "ENSA Marrakech", "AIAC", "EHTP", "ENSA Fes", "FST Mohammedia", "ENSA Agadir", "ENSET Mohammedia", "FST Settat"],
		degrees: ["Diplome d'Ingenieur", "Master en Genie Mecanique", "Licence en Mecanique"],
		companies: ["Safran Aircraft Engines", "Bombardier Casablanca", "Daher Aerospace", "Renault Tanger", "Aptiv Tanger", "Delphi Maroc", "STELIA Aerospace", "Matis Aerospace", "Alcoa Fastening Systems", "Zodiac Aerospace"],
		positions: ["Ingenieur Conception", "Ingenieur Methodes", "Ingenieur Maintenance", "Ingenieur CVC", "Ingenieur CAO", "Ingenieur R&D"],
		tags: ["CATIA V5", "SolidWorks", "ANSYS", "MATLAB", "AutoCAD", "CNC Programming", "CFD", "FEA", "GD&T", "3D Printing", "Lean Manufacturing", "TPM", "HVAC", "Thermodynamics", "Robotics"],
	},
	"management": {
		headlines: [
			"Consultant en Management", "Directeur des Operations", "Responsable Developpement Commercial",
			"Chef de Projet PMP", "Specialiste Conduite du Changement", "Directeur General",
			"Responsable Innovation", "Analyste Gestion des Risques", "Directeur Qualite", "Entrepreneur",
		],
		summaries: [
			"Consultant en management strategique conseillant les PME en transformation digitale. Expert en strategie et organisation.",
			"Directeur des operations coordonnant des equipes pluridisciplinaires en environnement dynamique. MBA et PMP certifie.",
			"Responsable developpement commercial etendant les partenariats en Afrique du Nord. Portefeuille de 50+ clients.",
			"Chef de projet certifie PMP avec expertise agile et Scrum. Gestion de projets de 10M+ MAD.",
			"Specialiste conduite du changement dirigeant des programmes de transformation organisationnelle.",
			"Directeur general supervisant des operations multi-sites au Maroc. P&L de 100M+ MAD.",
			"Responsable innovation construisant des programmes intrapreneuriat pour grands groupes marocains.",
			"Analyste gestion des risques implementant des cadres de risque d'entreprise. Expert ISO 31000.",
			"Directeur qualite pilotant la certification ISO dans les unites commerciales. Auditeur lead certifie.",
			"Entrepreneur diplome lancant des ventures tech a Casablanca. Incube a Technopark.",
		],
		descEn: [
			"Strategic management consultant advising SMEs on digital transformation",
			"Operations manager coordinating cross-functional teams in fast-paced environments",
			"Business development manager expanding partnerships in North Africa",
			"Project management professional with PMP certification and agile expertise",
			"Change management specialist leading organizational transformation programs",
			"General manager overseeing multi-site retail operations in Morocco",
			"Innovation manager building internal startup programs for corporate clients",
			"Risk management analyst implementing enterprise risk frameworks",
			"Quality management director driving ISO certification across business units",
			"Entrepreneurship program graduate launching tech ventures in Casablanca",
		],
		descFr: [
			"Consultant en management strategique conseillant les PME en transformation digitale",
			"Directeur des operations coordonnant des equipes pluridisciplinaires",
			"Responsable developpement commercial etendant les partenariats en Afrique du Nord",
			"Professionnel gestion de projet certifie PMP avec expertise agile",
			"Specialiste conduite du changement dirigeant des programmes de transformation",
			"Directeur general supervisant des operations multi-sites au Maroc",
			"Responsable innovation construisant des programmes intrapreneuriat",
			"Analyste gestion des risques implementant des cadres de risque d'entreprise",
			"Directeur qualite pilotant la certification ISO dans les unites commerciales",
			"Diplome programme entrepreneuriat lancant des ventures tech a Casablanca",
		],
		skills: [
			["Gestion de Projet", "Expert"], ["PMP", "Advanced"], ["Agile/Scrum", "Advanced"], ["Leadership", "Expert"],
			["Strategie", "Advanced"], ["Business Development", "Advanced"], ["Excel Avance", "Expert"], ["Power BI", "Intermediate"],
			["ISO 9001", "Advanced"], ["Lean Management", "Intermediate"], ["Conduite du Changement", "Advanced"],
			["Negociation", "Expert"], ["ERP/SAP", "Intermediate"], ["Finance d'Entreprise", "Intermediate"], ["Six Sigma", "Intermediate"],
		],
		schools: ["ISCAE", "ENCG Casablanca", "ENCG Settat", "HEM", "ESCA", "UIR", "Al Akhawayn", "ENCG Tanger", "FSJES Rabat", "ENCG Marrakech"],
		degrees: ["MBA", "Master en Management", "Diplome Grande Ecole de Commerce"],
		companies: ["McKinsey Casablanca", "CDG Capital", "Marjane Group", "OCP Group", "BMCE Bank", "Wafa Assurance", "Attijariwafa Bank", "Accenture Maroc", "Deloitte Casablanca", "Technopark"],
		positions: ["Consultant Senior", "Chef de Projet", "Directeur des Operations", "Responsable Commercial", "Manager Qualite", "Business Analyst"],
		tags: ["Project Management", "PMP", "Agile", "Scrum", "Lean", "Strategy", "Business Development", "Leadership", "Change Management", "ISO 9001", "KPI", "ERP", "Excel Advanced", "Power BI", "Six Sigma"],
	},
	"commerce-international": {
		headlines: [
			"Specialiste Commerce International", "Responsable Export", "Agent de Conformite Douaniere",
			"Cadre Developpement International", "Specialiste Trade Finance", "Responsable Achats Internationaux",
			"Coordinateur Zone Franche", "Commercial International", "Analyste Supply Chain Global",
			"Attache Commercial",
		],
		summaries: [
			"Specialiste commerce international gerant les operations import/export en region MENA. Expert Incoterms et procedures douanieres.",
			"Responsable export developpant les marches en Afrique subsaharienne pour les produits marocains. +30% de croissance.",
			"Responsable conformite douaniere assurant le respect reglementaire pour le commerce transfrontalier.",
			"Cadre developpement commercial international expansion en marches europeens. Trilingue FR/EN/ES.",
			"Specialiste financement du commerce gerant les credits documentaires et lettres de credit. Expert Credoc.",
			"Specialiste approvisionnement international sourcing aupres de fournisseurs en Chine et Europe.",
			"Coordinateur zone franche gerant les operations au hub logistique Tanger Med. Expert douane et transit.",
			"Commercial international couvrant les marches africains francophones. Carnet d'adresses de 200+ contacts.",
			"Analyste supply chain optimisant la logistique mondiale et le transport maritime/aerien.",
			"Attache commercial accompagnant les exportateurs marocains dans les foires et salons internationaux.",
		],
		descEn: [
			"International trade specialist managing import/export operations across MENA region",
			"Export manager developing markets in Sub-Saharan Africa for Moroccan products",
			"Customs compliance officer ensuring regulatory adherence for cross-border trade",
			"International business development executive expanding in European markets",
			"Trade finance specialist managing letters of credit and documentary collections",
			"Procurement specialist sourcing materials from international suppliers",
			"Free trade zone coordinator managing operations at Tanger Med logistics hub",
			"International sales representative covering francophone African markets",
			"Supply chain analyst optimizing global logistics and freight forwarding",
			"Commercial attache supporting Moroccan exporters in international fairs",
		],
		descFr: [
			"Specialiste commerce international gerant les operations import/export en region MENA",
			"Responsable export developpant les marches en Afrique subsaharienne",
			"Responsable conformite douaniere assurant le respect reglementaire transfrontalier",
			"Cadre developpement commercial international expansion en marches europeens",
			"Specialiste financement du commerce gerant les credits documentaires",
			"Specialiste approvisionnement sourcing aupres de fournisseurs internationaux",
			"Coordinateur zone franche gerant les operations au hub logistique Tanger Med",
			"Commercial international couvrant les marches africains francophones",
			"Analyste supply chain optimisant la logistique mondiale et le transport",
			"Attache commercial accompagnant les exportateurs marocains dans les foires internationales",
		],
		skills: [
			["Import/Export", "Expert"], ["Incoterms 2020", "Expert"], ["Procedures Douanieres", "Advanced"], ["Trade Finance", "Advanced"],
			["SAP", "Intermediate"], ["Logistique Internationale", "Advanced"], ["Negociation", "Expert"], ["CRM", "Intermediate"],
			["Anglais", "Advanced"], ["Espagnol", "Intermediate"], ["Sourcing", "Advanced"], ["Credoc", "Advanced"],
			["Reglementation Douaniere", "Expert"], ["Transport Maritime", "Intermediate"], ["Prospection Commerciale", "Advanced"],
		],
		schools: ["ENCG Tanger", "ENCG Casablanca", "ISCAE", "HEM", "ESCA", "FSJES Rabat", "Al Akhawayn", "ENCG Settat", "UIR", "ENCG Agadir"],
		degrees: ["Master en Commerce International", "Diplome ENCG", "Licence en Commerce et Gestion"],
		companies: ["Tanger Med", "Maroc Telecom International", "BMCE Bank Trade Finance", "CCI Maroc", "OCP Group Export", "Cosumar Export", "Centrale Danone", "Delassus Group", "Les Domaines Agricoles", "ASMEX"],
		positions: ["Responsable Export", "Charge d'Affaires Internationales", "Agent de Transit", "Analyste Trade Finance", "Acheteur International", "Coordinateur Logistique"],
		tags: ["Import/Export", "Incoterms", "Customs", "Trade Finance", "SAP", "ERP", "Logistics", "Freight", "Sourcing", "Negotiation", "LC/Documentary", "CRM", "French", "English", "Spanish"],
	},
	"logistique": {
		headlines: [
			"Responsable Logistique", "Planificateur Supply Chain", "Gestionnaire de Flotte",
			"Ingenieur Automatisation Entrepot", "Specialiste Dernier Kilometre", "Coordinateur Chaine du Froid",
			"Analyste Stocks", "Coordinateur 3PL", "Specialiste Logistique Portuaire", "Responsable Logistique Inverse",
		],
		summaries: [
			"Responsable logistique optimisant les operations d'entrepot et reseaux de distribution. Reduction des couts de 20%.",
			"Planificateur supply chain coordonnant les approvisionnements et la gestion des stocks. Expert prevision de demande.",
			"Gestionnaire de flotte transport reduisant les couts par optimisation des itineraires. Flotte de 50+ vehicules.",
			"Ingenieur automatisation entrepot implementant WMS et systemes de preparation de commandes.",
			"Specialiste optimisation livraison dernier kilometre pour le e-commerce. Partenariat avec Jumia et Glovo.",
			"Coordinateur logistique chaine du froid gerant les envois thermosensibles. Norme HACCP.",
			"Analyste controle des stocks implementant la classification ABC et optimisation du stock de securite.",
			"Coordinateur logistique tiers gerant les relations avec les prestataires 3PL. Cahier des charges et SLA.",
			"Specialiste logistique portuaire gerant les operations conteneurs a Tanger Med. Expert douane et transit.",
			"Responsable logistique inverse developpant des programmes de retour et recyclage pour l'economie circulaire.",
		],
		descEn: [
			"Logistics manager optimizing warehouse operations and distribution networks",
			"Supply chain planner coordinating procurement and inventory management",
			"Transport fleet manager reducing costs through route optimization",
			"Warehouse automation engineer implementing WMS and pick-to-light systems",
			"Last-mile delivery optimization specialist for e-commerce operations",
			"Cold chain logistics coordinator managing temperature-sensitive shipments",
			"Inventory control analyst implementing ABC classification and safety stock",
			"Third-party logistics coordinator managing 3PL relationships",
			"Port logistics specialist handling container operations at Tanger Med",
			"Reverse logistics manager developing return and recycling programs",
		],
		descFr: [
			"Responsable logistique optimisant les operations d'entrepot et reseaux de distribution",
			"Planificateur supply chain coordonnant les approvisionnements et la gestion des stocks",
			"Gestionnaire de flotte transport reduisant les couts par optimisation des itineraires",
			"Ingenieur automatisation entrepot implementant WMS et systemes pick-to-light",
			"Specialiste optimisation livraison dernier kilometre pour le e-commerce",
			"Coordinateur logistique chaine du froid gerant les envois thermosensibles",
			"Analyste controle des stocks implementant la classification ABC et le stock de securite",
			"Coordinateur logistique tiers gerant les relations 3PL",
			"Specialiste logistique portuaire gerant les operations conteneurs a Tanger Med",
			"Responsable logistique inverse developpant des programmes de retour et recyclage",
		],
		skills: [
			["SAP WM/MM", "Advanced"], ["WMS", "Expert"], ["TMS", "Advanced"], ["Supply Chain", "Expert"],
			["Gestion des Stocks", "Expert"], ["Approvisionnement", "Advanced"], ["Lean Logistics", "Advanced"],
			["Excel Avance", "Expert"], ["Power BI", "Intermediate"], ["Prevision de Demande", "Advanced"],
			["3PL", "Intermediate"], ["Transport", "Advanced"], ["Optimisation", "Advanced"], ["HACCP", "Intermediate"],
			["Douane", "Intermediate"],
		],
		schools: ["ISTL Casablanca", "ENCG Tanger", "ISCAE", "FST Settat", "ENCG Casablanca", "EST Sale", "OFPPT ISTA", "HEM", "UIR", "ENCG Agadir"],
		degrees: ["Master en Logistique", "Diplome ISTL", "Licence en Supply Chain Management"],
		companies: ["ONCF", "DHL Supply Chain Maroc", "SDTM", "Tanger Med", "Amazon Morocco", "Marjane Group", "Jumia Maroc", "SNTL", "CTM", "Geodis Maroc"],
		positions: ["Responsable Logistique", "Coordinateur Supply Chain", "Gestionnaire de Stock", "Chef de Quai", "Planificateur Transport", "Analyste Logistique"],
		tags: ["SAP WM", "WMS", "TMS", "Supply Chain", "Inventory", "Procurement", "Lean", "Six Sigma", "Excel", "Power BI", "Forecasting", "3PL", "Freight", "Route Optimization", "Warehousing"],
	},
	"finance": {
		headlines: [
			"Analyste Financier", "Directeur Finance", "Analyste Risques",
			"Auditeur", "Gestionnaire de Portefeuille", "Analyste Credit",
			"Specialiste Finance Islamique", "Tresorier", "Chef de Produit Fintech", "Consultant Fiscal",
		],
		summaries: [
			"Analyste financier realisant des etudes actions et valorisation a Casablanca. Expert DCF et modelisation financiere.",
			"Directeur finance d'entreprise gerant les operations M&A et modelisation financiere. Transactions de 500M+ MAD.",
			"Analyste risques implementant les cadres Bale III dans une banque marocaine. Expert VaR et stress testing.",
			"Collaborateur audit realisant des audits d'etats financiers en Big 4. Normes IFRS et audit interne.",
			"Gestionnaire de portefeuille supervisant des fonds OPCVM et investissements obligataires. AUM de 200M+ MAD.",
			"Analyste credit evaluant les opportunites de financement pour les PME. Scoring et analyse bilancielle.",
			"Specialiste finance islamique structurant des produits Sukuk et Murabaha. Expert charia-compliance.",
			"Tresorier optimisant la tresorerie et l'exposition au risque de change. Gestion de tresorerie centralisee.",
			"Chef de produit fintech developpant des solutions de paiement mobile au Maroc. Lancement de wallet digital.",
			"Consultant fiscal conseillant sur la conformite fiscale marocaine (IS, TVA, IR). Expert conventions fiscales.",
		],
		descEn: [
			"Financial analyst performing equity research and valuation at a Casablanca brokerage",
			"Corporate finance manager handling M&A transactions and financial modeling",
			"Risk analyst implementing Basel III frameworks at a Moroccan bank",
			"Audit associate conducting financial statement audits at Big 4 firm",
			"Portfolio manager overseeing OPCVM funds and fixed income investments",
			"Credit analyst evaluating commercial lending opportunities for SMEs",
			"Islamic finance specialist structuring Sukuk and Murabaha products",
			"Treasury manager optimizing cash flow and foreign exchange exposure",
			"Fintech product manager developing mobile payment solutions for Morocco",
			"Tax consultant advising on Moroccan and international tax compliance",
		],
		descFr: [
			"Analyste financier realisant des etudes actions et valorisation a Casablanca",
			"Directeur finance d'entreprise gerant les operations M&A et modelisation financiere",
			"Analyste risques implementant les cadres Bale III dans une banque marocaine",
			"Collaborateur audit realisant des audits d'etats financiers en Big 4",
			"Gestionnaire de portefeuille supervisant des fonds OPCVM et investissements obligataires",
			"Analyste credit evaluant les opportunites de financement pour les PME",
			"Specialiste finance islamique structurant des produits Sukuk et Murabaha",
			"Tresorier optimisant la tresorerie et l'exposition au risque de change",
			"Chef de produit fintech developpant des solutions de paiement mobile au Maroc",
			"Consultant fiscal conseillant sur la conformite fiscale marocaine et internationale",
		],
		skills: [
			["Modelisation Financiere", "Expert"], ["Excel Avance", "Expert"], ["Bloomberg", "Advanced"], ["VBA", "Intermediate"],
			["Python", "Intermediate"], ["SQL", "Intermediate"], ["Power BI", "Advanced"], ["SAP FICO", "Intermediate"],
			["Gestion des Risques", "Advanced"], ["IFRS", "Advanced"], ["Analyse Credit", "Expert"], ["M&A", "Intermediate"],
			["Valorisation", "Expert"], ["Bale III", "Advanced"], ["Audit Financier", "Advanced"],
		],
		schools: ["ISCAE", "ENCG Casablanca", "HEM", "ESCA", "FSJES Agdal", "Al Akhawayn", "ENCG Settat", "UIR", "EGE Rabat", "ENCG Tanger"],
		degrees: ["Master en Finance", "Diplome ISCAE", "Licence en Finance et Comptabilite"],
		companies: ["Attijariwafa Bank", "BMCE Bank", "CDG Invest", "EY Maroc", "Deloitte Casablanca", "KPMG Maroc", "PwC Maroc", "AMMC", "Bourse de Casablanca", "Wafa Gestion"],
		positions: ["Analyste Financier", "Auditeur Junior", "Analyste Credit", "Gestionnaire de Portefeuille", "Tresorier", "Consultant Fiscaliste"],
		tags: ["Financial Modeling", "Excel Advanced", "Bloomberg", "VBA", "Python", "SQL", "Power BI", "SAP FICO", "Risk Management", "M&A", "Valuation", "IFRS", "Basel III", "Credit Analysis", "CFA"],
	},
	"marketing": {
		headlines: [
			"Responsable Marketing Digital", "Strategiste Marque", "Specialiste Content Marketing",
			"Analyste Etudes de Marche", "Specialiste Performance Marketing", "Community Manager",
			"Chef de Produit Marketing", "Specialiste CRM", "Coordinateur Marketing d'Influence",
			"Specialiste Marketing Automation",
		],
		summaries: [
			"Responsable marketing digital pilotant la croissance via SEO, SEM et reseaux sociaux. ROI de 300% sur les campagnes.",
			"Strategiste marque developpant le positionnement de marques FMCG sur le marche marocain. Expert brand identity.",
			"Specialiste content marketing creant des campagnes bilingues FR/AR pour audiences diversifiees. +50K followers.",
			"Analyste etudes de marche menant des etudes consommateurs quantitatives et qualitatives au Maroc.",
			"Specialiste performance marketing optimisant le ROAS pour le e-commerce. Expert Google Ads et Meta Ads.",
			"Community manager construisant des communautes engagees sur Instagram et TikTok. Taux d'engagement 8%+.",
			"Chef de produit marketing lancant des produits SaaS sur le marche MENA. Go-to-market et product-led growth.",
			"Specialiste CRM implementant des programmes de fidelisation et retention. Reduction du churn de 25%.",
			"Coordinateur marketing d'influence gerant des partenariats avec 50+ createurs marocains. Budget 500K+ MAD.",
			"Specialiste marketing automation configurant HubSpot et parcours email. Lead nurturing et scoring.",
		],
		descEn: [
			"Digital marketing manager driving growth through SEO, SEM, and social media campaigns",
			"Brand strategist developing positioning for FMCG brands in Moroccan market",
			"Content marketing specialist creating bilingual campaigns for diverse audiences",
			"Market research analyst conducting consumer insights studies across Morocco",
			"Performance marketing specialist optimizing ROAS for e-commerce businesses",
			"Social media manager building brand communities on Instagram and TikTok",
			"Product marketing manager launching SaaS products in MENA markets",
			"CRM specialist implementing customer retention and loyalty programs",
			"Influencer marketing coordinator managing partnerships with Moroccan creators",
			"Marketing automation specialist configuring HubSpot and email nurture flows",
		],
		descFr: [
			"Responsable marketing digital pilotant la croissance via SEO, SEM et reseaux sociaux",
			"Strategiste marque developpant le positionnement FMCG sur le marche marocain",
			"Specialiste content marketing creant des campagnes bilingues pour audiences diversifiees",
			"Analyste etudes de marche menant des etudes consommateurs au Maroc",
			"Specialiste performance marketing optimisant le ROAS pour le e-commerce",
			"Community manager construisant des communautes sur Instagram et TikTok",
			"Chef de produit marketing lancant des produits SaaS sur le marche MENA",
			"Specialiste CRM implementant des programmes de fidelisation et retention",
			"Coordinateur marketing d'influence gerant des partenariats avec des createurs marocains",
			"Specialiste marketing automation configurant HubSpot et parcours email",
		],
		skills: [
			["SEO", "Expert"], ["Google Ads", "Advanced"], ["Meta Ads", "Advanced"], ["HubSpot", "Advanced"],
			["Google Analytics", "Expert"], ["Canva", "Expert"], ["Adobe Creative Suite", "Intermediate"],
			["Content Marketing", "Expert"], ["Social Media", "Expert"], ["CRM", "Advanced"], ["Email Marketing", "Advanced"],
			["TikTok Marketing", "Intermediate"], ["Copywriting", "Expert"], ["A/B Testing", "Advanced"], ["Power BI", "Intermediate"],
		],
		schools: ["ENCG Casablanca", "ISCAE", "HEM", "ESCA", "UIR", "ENCG Settat", "Al Akhawayn", "ENCG Tanger", "ENCG Marrakech", "SUP DE CO Marrakech"],
		degrees: ["Master en Marketing Digital", "Diplome ENCG", "Licence en Marketing et Communication"],
		companies: ["Unilever Maroc", "P&G Maroc", "Jumia Maroc", "Meditel/Orange Maroc", "Inwi", "Marjane Group", "Centrale Danone", "Wana Corporate", "Avito", "Hmizate"],
		positions: ["Responsable Marketing Digital", "Community Manager", "Chef de Produit", "Charge de Communication", "Growth Marketer", "Brand Manager"],
		tags: ["SEO", "SEM", "Google Ads", "Meta Ads", "HubSpot", "Google Analytics", "Canva", "Adobe Creative Suite", "Content Marketing", "Social Media", "CRM", "Email Marketing", "TikTok", "Copywriting", "A/B Testing"],
	},
	"ressources-humaines": {
		headlines: [
			"HR Business Partner", "Specialiste Recrutement", "Analyste Remuneration",
			"Responsable Formation", "Specialiste Analytics RH", "Specialiste Relations Sociales",
			"Responsable Talent Acquisition", "Consultant Developpement Organisationnel",
			"Specialiste SIRH", "Responsable Paie et Conformite",
		],
		summaries: [
			"HR business partner accompagnant la gestion des talents en multinationale. Support de 500+ collaborateurs.",
			"Specialiste recrutement implementant des processus de selection structures pour la tech. 200+ recrutements/an.",
			"Analyste remuneration et avantages concevant des grilles salariales competitives. Benchmark et equite interne.",
			"Responsable formation et developpement creant des programmes de montee en competences. Budget 2M+ MAD.",
			"Specialiste analytics RH construisant des dashboards et modeles de planification des effectifs. Expert Power BI.",
			"Specialiste relations sociales gerant les relations avec les syndicats et assurant la conformite au Code du Travail.",
			"Responsable talent acquisition gerant la marque employeur et l'experience candidat. LinkedIn Recruiter expert.",
			"Consultant developpement organisationnel concevant des systemes de gestion de performance et d'evaluation.",
			"Specialiste SIRH implementant Workday et SAP SuccessFactors. Migration et parametrage.",
			"Responsable paie et conformite sociale assurant le respect du droit du travail marocain et la CNSS.",
		],
		descEn: [
			"HR business partner supporting talent management in multinational organizations",
			"Recruitment specialist implementing structured hiring processes for tech companies",
			"Compensation and benefits analyst designing competitive salary structures",
			"Training and development manager creating upskilling programs for employees",
			"HR analytics specialist building dashboards and workforce planning models",
			"Employee relations specialist mediating workplace conflicts and ensuring compliance",
			"Talent acquisition lead managing employer branding and candidate experience",
			"Organizational development consultant designing performance management systems",
			"HRIS specialist implementing Workday and SAP SuccessFactors",
			"Payroll and social compliance manager ensuring Moroccan labor law adherence",
		],
		descFr: [
			"HR business partner accompagnant la gestion des talents en multinationale",
			"Specialiste recrutement implementant des processus de selection structures pour la tech",
			"Analyste remuneration et avantages concevant des structures salariales competitives",
			"Responsable formation et developpement creant des programmes de montee en competences",
			"Specialiste analytics RH construisant des dashboards et modeles de planification",
			"Specialiste relations sociales gerant les conflits et assurant la conformite",
			"Responsable acquisition de talents gerant la marque employeur et l'experience candidat",
			"Consultant developpement organisationnel concevant des systemes de gestion de performance",
			"Specialiste SIRH implementant Workday et SAP SuccessFactors",
			"Responsable paie et conformite sociale assurant le respect du droit du travail marocain",
		],
		skills: [
			["Recrutement", "Expert"], ["SIRH", "Advanced"], ["SAP SuccessFactors", "Intermediate"], ["Workday", "Intermediate"],
			["Paie", "Advanced"], ["CNSS", "Expert"], ["Droit du Travail", "Expert"], ["Formation", "Advanced"],
			["Gestion des Talents", "Expert"], ["Remuneration", "Advanced"], ["Relations Sociales", "Advanced"],
			["KPI RH", "Advanced"], ["Power BI", "Intermediate"], ["Excel Avance", "Expert"], ["Entretiens", "Expert"],
		],
		schools: ["ISCAE", "ENCG Casablanca", "HEM", "ESCA", "FSJES Agdal", "ENCG Settat", "UIR", "Al Akhawayn", "ENCG Tanger", "SUP DE CO"],
		degrees: ["Master en Gestion des Ressources Humaines", "Diplome ISCAE", "Licence en GRH"],
		companies: ["Manpower Maroc", "Randstad Maroc", "Lydec", "OCP Group", "Maroc Telecom", "Attijariwafa Bank", "BMCE Bank", "Capgemini Maroc", "Accenture Maroc", "Adecco Maroc"],
		positions: ["Charge de Recrutement", "Responsable Formation", "HR Business Partner", "Gestionnaire Paie", "Responsable RH", "Consultant RH"],
		tags: ["Recruitment", "HRIS", "SAP SuccessFactors", "Workday", "Payroll", "CNSS", "Labor Law", "Training", "Talent Management", "Compensation", "Employee Relations", "KPI", "Power BI", "Excel", "Interviewing"],
	},
	"general": {
		headlines: [
			"Professionnel Polyvalent", "Jeune Diplome", "Coordinateur de Projets",
			"Assistant Administratif", "Consultant Freelance", "Charge de Mission",
			"Coordinateur Associatif", "Analyste Junior", "Professionnel Bilingue", "Entrepreneur",
		],
		summaries: [
			"Professionnel polyvalent avec experience transversale en coordination de projets et gestion administrative.",
			"Jeune diplome avec solides competences analytiques et communication multilingue. Stage en entreprise et associatif.",
			"Jeune professionnel combinant formation technique et sens des affaires. Adaptable et oriente resultats.",
			"Professionnel en reconversion apportant une experience diversifiee de plusieurs secteurs d'activite.",
			"Consultant freelance offrant gestion de projet et conseil strategique. Portfolio de 20+ missions.",
			"Diplome pluridisciplinaire cherchant des roles alliant creativite et analyse. Curieux et autodidacte.",
			"Coordinateur administratif avec experience ONG et secteur public. Gestion de programmes sociaux.",
			"Analyste junior avec stages dans plusieurs secteurs d'activite. Fort esprit d'equipe et rigueur.",
			"Professionnel bilingue avec experience d'etudes a l'etranger et adaptabilite culturelle. DELF B2.",
			"Diplome entrepreneurial avec experience de lancement de petites entreprises. Incube a Technopark.",
		],
		descEn: [
			"Versatile professional with cross-functional experience in project coordination",
			"Recent graduate with strong analytical skills and multilingual communication abilities",
			"Young professional combining technical background with business acumen",
			"Career changer bringing diverse industry experience to new opportunities",
			"Freelance consultant offering project management and strategic advisory services",
			"Multidisciplinary graduate seeking roles that combine creativity and analysis",
			"Administrative coordinator with experience in NGO and public sector organizations",
			"Junior analyst with internship experience across multiple industries",
			"Bilingual professional with study abroad experience and cultural adaptability",
			"Entrepreneurial graduate with experience launching small business ventures",
		],
		descFr: [
			"Professionnel polyvalent avec experience transversale en coordination de projets",
			"Jeune diplome avec solides competences analytiques et communication multilingue",
			"Jeune professionnel combinant formation technique et sens des affaires",
			"Reconversion professionnelle apportant une experience diversifiee",
			"Consultant freelance offrant gestion de projet et conseil strategique",
			"Diplome pluridisciplinaire cherchant des roles alliant creativite et analyse",
			"Coordinateur administratif avec experience ONG et secteur public",
			"Analyste junior avec stages dans plusieurs secteurs d'activite",
			"Professionnel bilingue avec experience d'etudes a l'etranger et adaptabilite culturelle",
			"Diplome entrepreneurial avec experience de lancement de petites entreprises",
		],
		skills: [
			["Microsoft Office", "Expert"], ["Communication", "Expert"], ["Gestion de Projet", "Intermediate"],
			["Francais", "Native"], ["Anglais", "Advanced"], ["Arabe", "Native"], ["Travail d'Equipe", "Expert"],
			["Resolution de Problemes", "Advanced"], ["Adaptabilite", "Expert"], ["Leadership", "Intermediate"],
			["Organisation", "Advanced"], ["Gestion du Temps", "Advanced"], ["Recherche", "Intermediate"],
			["Presentation", "Advanced"], ["Esprit Critique", "Intermediate"],
		],
		schools: ["Universite Cadi Ayyad", "Universite Mohammed V", "Universite Hassan II", "FSJES Rabat", "FLSH Fes", "Universite Ibn Tofail", "Universite Abdelmalek Essaadi", "Universite Sidi Mohamed Ben Abdellah", "Al Akhawayn", "UIR"],
		degrees: ["Licence Fondamentale", "Master", "Diplome Universitaire"],
		companies: ["Administration Regionale", "ONG Maroc", "Startup Casablanca", "Cabinet de Conseil", "Association Locale", "Cooperative Agricole", "Agence Evenementielle", "Bureau d'Etudes", "Fondation Mohammed V", "Technopark"],
		positions: ["Coordinateur de Projet", "Assistant Administratif", "Charge de Mission", "Stagiaire", "Benevole", "Consultant Junior"],
		tags: ["Microsoft Office", "Communication", "Project Management", "French", "English", "Arabic", "Teamwork", "Problem Solving", "Adaptability", "Leadership", "Organization", "Time Management", "Research", "Presentation", "Critical Thinking"],
	},
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, Math.min(n, shuffled.length));
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
	const prefix = pick(["0661", "0662", "0670", "0671", "0660", "0668", "0669", "0655", "0656", "0657"]);
	const suffix = String(randomInt(100000, 999999));
	return `${prefix}-${suffix}`;
}

function generateEmail(firstName, familyName) {
	const first = firstName.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[̀-ͯ]/g, "");
	const last = familyName.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "");
	return `${first}.${last}@${pick(EMAIL_DOMAINS)}`;
}

function generatePeriod(expYears) {
	const currentYear = 2026;
	if (expYears === 0) {
		return `${currentYear - 1} - ${currentYear}`;
	}
	const startYear = currentYear - expYears;
	return `${startYear} - Present`;
}

function generateEdPeriod(expYears) {
	const currentYear = 2026;
	const gradYear = currentYear - expYears;
	const startYear = gradYear - randomInt(2, 5);
	return `${startYear} - ${gradYear}`;
}

function generateLanguages(lang) {
	const languages = [{ name: "Arabe", proficiency: "Native" }];

	if (lang === "fr" || lang === "bilingual-fr-en" || lang === "bilingual-fr-ar") {
		languages.push({ name: "Francais", proficiency: "Fluent" });
	}
	if (lang === "en" || lang === "bilingual-fr-en") {
		languages.push({ name: "Anglais", proficiency: pick(["Fluent", "Advanced"]) });
	}
	if (lang === "fr") {
		languages.push({ name: "Anglais", proficiency: pick(["Intermediate", "Advanced"]) });
	}
	if (lang === "en") {
		languages.push({ name: "Francais", proficiency: pick(["Intermediate", "Fluent"]) });
	}

	return languages;
}

// ---------------------------------------------------------------------------
// Entry generator
// ---------------------------------------------------------------------------

function generateEntries() {
	const entries = [];
	const usedNames = new Set();

	// 10 entries per field = 120 total
	for (const field of FIELDS) {
		const fd = FIELD_DATA[field];
		for (let i = 0; i < 10; i++) {
			const isFemale = i % 2 === 1;
			let firstName, familyName, fullName;

			let attempts = 0;
			do {
				firstName = isFemale ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
				familyName = pick(FAMILY);
				fullName = `${firstName} ${familyName}`;
				attempts++;
			} while (usedNames.has(fullName) && attempts < 100);
			usedNames.add(fullName);

			const expYears = pick(EXPERIENCE_RANGES);
			const lang = pick(LANGUAGES);
			const template = pick(TEMPLATES);
			const atsScore = randomInt(65, 98);
			const isFeatured = Math.random() < 0.1;
			const descIdx = i % fd.descEn.length;

			// Pick skills (5-8)
			const skillCount = randomInt(5, 8);
			const selectedSkills = pickN(fd.skills, skillCount).map(([name, prof]) => ({ name, proficiency: prof }));

			// Build resume_data blob
			const resumeData = {
				basics: {
					cin: "",
					name: fullName,
					email: generateEmail(firstName, familyName),
					phone: generatePhone(),
					headline: fd.headlines[descIdx],
					location: pick(MOROCCAN_CITIES),
				},
				summary: {
					content: fd.summaries[descIdx],
				},
				sections: {
					skills: { items: selectedSkills },
					education: {
						items: [
							{
								field: field.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
								grade: "",
								degree: pick(fd.degrees),
								period: generateEdPeriod(expYears),
								school: pick(fd.schools),
							},
						],
					},
					languages: {
						items: generateLanguages(lang),
					},
					experience: {
						items:
							expYears === 0
								? [
										{
											period: generatePeriod(0),
											company: pick(fd.companies),
											position: `Stagiaire ${pick(fd.positions)}`,
											description: `- Stage de fin d'etudes de 6 mois\n- Contribution aux projets de l'equipe\n- Redaction de rapports techniques`,
										},
									]
								: [
										{
											period: generatePeriod(expYears),
											company: pick(fd.companies),
											position: pick(fd.positions),
											description: `- Gestion de projets et coordination d'equipe\n- Amelioration des processus et indicateurs de performance\n- Collaboration avec les parties prenantes internes et externes`,
										},
										...(expYears >= 3
											? [
													{
														period: `${2026 - expYears} - ${2026 - Math.ceil(expYears / 2)}`,
														company: pick(fd.companies),
														position: pick(fd.positions),
														description: `- Mise en oeuvre de solutions techniques\n- Suivi des KPI et reporting\n- Formation des equipes junior`,
													},
												]
											: []),
									],
					},
				},
			};

			// Build bilingual name
			let nameEn, nameFr;
			if (expYears === 0) {
				nameEn = `${fullName} — Fresh Graduate Resume`;
				nameFr = `${fullName} — CV Jeune Diplome`;
			} else if (expYears <= 3) {
				nameEn = `${fullName} — Junior Professional Resume`;
				nameFr = `${fullName} — CV Professionnel Junior`;
			} else if (expYears <= 5) {
				nameEn = `${fullName} — Mid-Level Resume`;
				nameFr = `${fullName} — CV Niveau Intermediaire`;
			} else if (expYears <= 10) {
				nameEn = `${fullName} — Senior Professional Resume`;
				nameFr = `${fullName} — CV Professionnel Senior`;
			} else {
				nameEn = `${fullName} — Executive Resume`;
				nameFr = `${fullName} — CV Cadre Superieur`;
			}

			// Pick 4-7 tags
			const tags = pickN(fd.tags, randomInt(4, 7));

			entries.push({
				id: crypto.randomUUID(),
				name: nameEn,
				name_fr: nameFr,
				field,
				experience_years: expYears,
				language: lang,
				template_name: template,
				description: fd.descEn[descIdx],
				description_fr: fd.descFr[descIdx],
				resume_data: JSON.stringify(resumeData),
				ats_score: atsScore,
				tags,
				is_featured: isFeatured,
				view_count: randomInt(0, 500),
				use_count: randomInt(0, 80),
			});
		}
	}

	return entries;
}

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

async function insertBatch(entries) {
	const BATCH_SIZE = 50;
	let totalInserted = 0;

	for (let offset = 0; offset < entries.length; offset += BATCH_SIZE) {
		const batch = entries.slice(offset, offset + BATCH_SIZE);
		const values = [];
		const params = [];
		let paramIdx = 1;

		for (const e of batch) {
			values.push(
				`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}::jsonb, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`
			);
			params.push(
				e.id,
				e.name,
				e.name_fr,
				e.field,
				e.experience_years,
				e.language,
				e.template_name,
				e.description,
				e.description_fr,
				e.resume_data,
				e.ats_score,
				e.tags,
				e.is_featured,
				e.view_count,
				e.use_count,
			);
		}

		const sql = `
			INSERT INTO resume_gallery (id, name, name_fr, field, experience_years, language, template_name, description, description_fr, resume_data, ats_score, tags, is_featured, view_count, use_count)
			VALUES ${values.join(",\n")}
			ON CONFLICT (id) DO NOTHING
		`;

		const result = await client.query(sql, params);
		totalInserted += result.rowCount;
		console.log(`  Batch ${Math.floor(offset / BATCH_SIZE) + 1}: inserted ${result.rowCount} rows`);
	}

	return totalInserted;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log("=== Resume Gallery Extra Seed ===\n");

	await client.connect();
	console.log("Connected to PostgreSQL\n");

	// Check current count
	const before = await client.query("SELECT COUNT(*)::int AS cnt FROM resume_gallery");
	console.log(`Existing entries: ${before.rows[0].cnt}\n`);

	// Generate entries
	const entries = generateEntries();
	console.log(`Generated ${entries.length} new entries\n`);

	// Insert in batches
	console.log("Inserting...");
	const totalInserted = await insertBatch(entries);

	// Final count
	const after = await client.query("SELECT COUNT(*)::int AS cnt FROM resume_gallery");

	// Summary by field
	const byField = await client.query(
		"SELECT field, COUNT(*)::int AS cnt FROM resume_gallery GROUP BY field ORDER BY field"
	);

	// Summary by language
	const byLang = await client.query(
		"SELECT language, COUNT(*)::int AS cnt FROM resume_gallery GROUP BY language ORDER BY cnt DESC"
	);

	// Summary by experience
	const byExp = await client.query(`
		SELECT
			CASE
				WHEN experience_years = 0 THEN '0 (Fresh Graduate)'
				WHEN experience_years BETWEEN 1 AND 3 THEN '1-3 years'
				WHEN experience_years BETWEEN 4 AND 5 THEN '4-5 years'
				WHEN experience_years BETWEEN 6 AND 10 THEN '6-10 years'
				ELSE '10+ years'
			END AS range,
			COUNT(*)::int AS cnt
		FROM resume_gallery
		GROUP BY range
		ORDER BY range
	`);

	// Featured count
	const featured = await client.query(
		"SELECT COUNT(*)::int AS cnt FROM resume_gallery WHERE is_featured = true"
	);

	// Template usage (top 10)
	const byTemplate = await client.query(
		"SELECT template_name, COUNT(*)::int AS cnt FROM resume_gallery GROUP BY template_name ORDER BY cnt DESC LIMIT 10"
	);

	// ATS score distribution
	const atsStats = await client.query(`
		SELECT
			MIN(ats_score) AS min_ats,
			MAX(ats_score) AS max_ats,
			ROUND(AVG(ats_score)) AS avg_ats
		FROM resume_gallery
	`);

	console.log("\n========================================");
	console.log("           SEED SUMMARY");
	console.log("========================================\n");
	console.log(`  Before:        ${before.rows[0].cnt} entries`);
	console.log(`  Inserted:      ${totalInserted} new entries`);
	console.log(`  After:         ${after.rows[0].cnt} entries`);
	console.log(`  Featured:      ${featured.rows[0].cnt} entries`);
	console.log(`  ATS Scores:    min=${atsStats.rows[0].min_ats} max=${atsStats.rows[0].max_ats} avg=${atsStats.rows[0].avg_ats}`);
	console.log();

	console.log("  BY FIELD:");
	for (const row of byField.rows) {
		console.log(`    ${row.field.padEnd(28)} ${String(row.cnt).padStart(4)}`);
	}
	console.log();

	console.log("  BY LANGUAGE:");
	for (const row of byLang.rows) {
		console.log(`    ${row.language.padEnd(20)} ${String(row.cnt).padStart(4)}`);
	}
	console.log();

	console.log("  BY EXPERIENCE:");
	for (const row of byExp.rows) {
		console.log(`    ${row.range.padEnd(20)} ${String(row.cnt).padStart(4)}`);
	}
	console.log();

	console.log("  TOP 10 TEMPLATES:");
	for (const row of byTemplate.rows) {
		console.log(`    ${row.template_name.padEnd(20)} ${String(row.cnt).padStart(4)}`);
	}

	console.log("\n========================================\n");
	console.log("Done!");

	await client.end();
}

main().catch((err) => {
	console.error("FATAL:", err.message);
	client.end();
	process.exit(1);
});
