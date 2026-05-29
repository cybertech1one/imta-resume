import z from "zod";
import { publicProcedure } from "../context";

// Schema definitions for resources
const programSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	nameFr: z.string(),
	category: z.enum(["healthcare", "industrial", "hse"]),
	duration: z.string(),
	durationFr: z.string(),
	requirements: z.array(z.string()),
	requirementsFr: z.array(z.string()),
	careerProspects: z.array(z.string()),
	careerProspectsFr: z.array(z.string()),
	salaryRange: z.object({
		min: z.number(),
		max: z.number(),
		currency: z.string(),
	}),
	description: z.string(),
	descriptionFr: z.string(),
	skills: z.array(z.string()),
	skillsFr: z.array(z.string()),
	interviewTips: z.array(z.string()),
	interviewTipsFr: z.array(z.string()),
	careerPathways: z.array(
		z.object({
			title: z.string(),
			titleFr: z.string(),
			description: z.string(),
			descriptionFr: z.string(),
			yearsExperience: z.string(),
		}),
	),
	relatedResources: z.array(z.string()),
	icon: z.string(),
	employmentRate: z.number().optional(),
});

const resourceSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	titleFr: z.string(),
	description: z.string(),
	descriptionFr: z.string(),
	type: z.enum(["guide", "video", "template", "article", "success_story"]),
	category: z.enum(["healthcare", "industrial", "hse", "general", "career"]),
	url: z.string().optional(),
	downloadUrl: z.string().optional(),
	thumbnail: z.string().optional(),
	duration: z.string().optional(),
	author: z.string().optional(),
	publishedAt: z.string().optional(),
	tags: z.array(z.string()),
});

const learningPathSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	titleFr: z.string(),
	description: z.string(),
	descriptionFr: z.string(),
	category: z.enum(["healthcare", "industrial", "hse"]),
	steps: z.array(
		z.object({
			order: z.number(),
			title: z.string(),
			titleFr: z.string(),
			description: z.string(),
			descriptionFr: z.string(),
			resourceIds: z.array(z.string()),
		}),
	),
	estimatedDuration: z.string(),
	estimatedDurationFr: z.string(),
});

// Static program data
const programs: z.infer<typeof programSchema>[] = [
	{
		id: "sage-femme",
		name: "Midwife",
		nameFr: "Sage-Femme",
		category: "healthcare",
		duration: "3 years",
		durationFr: "3 ans",
		requirements: [
			"Baccalaureate in Sciences",
			"Minimum age 18 years",
			"Medical aptitude certificate",
			"Successful entrance exam",
		],
		requirementsFr: [
			"Baccalaureat scientifique",
			"Age minimum 18 ans",
			"Certificat d'aptitude medicale",
			"Reussite au concours d'entree",
		],
		careerProspects: [
			"Public hospitals",
			"Private clinics",
			"Maternity centers",
			"Community health centers",
			"Independent practice",
		],
		careerProspectsFr: [
			"Hopitaux publics",
			"Cliniques privees",
			"Maternites",
			"Centres de sante communautaires",
			"Exercice liberal",
		],
		salaryRange: { min: 6000, max: 15000, currency: "MAD" },
		description:
			"Comprehensive training in maternal and newborn care, including prenatal monitoring, childbirth assistance, and postnatal care.",
		descriptionFr:
			"Formation complete en soins maternels et neonatals, incluant le suivi prenatal, l'assistance a l'accouchement et les soins postnatals.",
		skills: ["Prenatal care", "Childbirth assistance", "Newborn care", "Patient communication", "Emergency response"],
		skillsFr: [
			"Soins prenatals",
			"Assistance a l'accouchement",
			"Soins au nouveau-ne",
			"Communication patient",
			"Gestion des urgences",
		],
		interviewTips: [
			"Emphasize your passion for maternal health",
			"Share experiences from clinical rotations",
			"Demonstrate knowledge of prenatal protocols",
			"Show empathy and patient-centered care approach",
		],
		interviewTipsFr: [
			"Mettez en avant votre passion pour la sante maternelle",
			"Partagez vos experiences de stages cliniques",
			"Demontrez votre connaissance des protocoles prenatals",
			"Montrez de l'empathie et une approche centree sur le patient",
		],
		careerPathways: [
			{
				title: "Junior Midwife",
				titleFr: "Sage-Femme Debutante",
				description: "Entry-level position in hospital or clinic",
				descriptionFr: "Poste d'entree en hopital ou clinique",
				yearsExperience: "0-2",
			},
			{
				title: "Senior Midwife",
				titleFr: "Sage-Femme Senior",
				description: "Experienced practitioner with specialized skills",
				descriptionFr: "Praticienne experimentee avec competences specialisees",
				yearsExperience: "3-5",
			},
			{
				title: "Head Midwife",
				titleFr: "Sage-Femme Chef",
				description: "Leadership role managing maternity unit",
				descriptionFr: "Role de leadership gerant une unite de maternite",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["healthcare-interview-guide", "cv-template-healthcare"],
		icon: "FirstAidKit",
		employmentRate: 95,
	},
	{
		id: "infirmier-polyvalent",
		name: "General Nurse",
		nameFr: "Infirmier Polyvalent",
		category: "healthcare",
		duration: "3 years",
		durationFr: "3 ans",
		requirements: [
			"Baccalaureate (any field)",
			"Minimum age 18 years",
			"Medical aptitude certificate",
			"Successful entrance exam",
		],
		requirementsFr: [
			"Baccalaureat (toutes series)",
			"Age minimum 18 ans",
			"Certificat d'aptitude medicale",
			"Reussite au concours d'entree",
		],
		careerProspects: [
			"Public hospitals",
			"Private clinics",
			"Emergency services",
			"Home healthcare",
			"School health services",
		],
		careerProspectsFr: [
			"Hopitaux publics",
			"Cliniques privees",
			"Services d'urgences",
			"Soins a domicile",
			"Services de sante scolaire",
		],
		salaryRange: { min: 5500, max: 12000, currency: "MAD" },
		description:
			"Comprehensive nursing training covering all aspects of patient care, from basic nursing skills to specialized procedures.",
		descriptionFr:
			"Formation infirmiere complete couvrant tous les aspects des soins aux patients, des techniques de base aux procedures specialisees.",
		skills: [
			"Patient assessment",
			"Medication administration",
			"Wound care",
			"Vital signs monitoring",
			"Emergency care",
		],
		skillsFr: [
			"Evaluation du patient",
			"Administration des medicaments",
			"Soins des plaies",
			"Surveillance des signes vitaux",
			"Soins d'urgence",
		],
		interviewTips: [
			"Highlight your clinical experience",
			"Discuss patient care scenarios",
			"Show knowledge of medical protocols",
			"Emphasize teamwork and communication skills",
		],
		interviewTipsFr: [
			"Mettez en valeur votre experience clinique",
			"Discutez de scenarios de soins aux patients",
			"Montrez votre connaissance des protocoles medicaux",
			"Soulignez vos competences en travail d'equipe et communication",
		],
		careerPathways: [
			{
				title: "Staff Nurse",
				titleFr: "Infirmier de Service",
				description: "General nursing duties in various departments",
				descriptionFr: "Fonctions infirmieres generales dans differents services",
				yearsExperience: "0-2",
			},
			{
				title: "Specialized Nurse",
				titleFr: "Infirmier Specialise",
				description: "Focused on specific medical specialty",
				descriptionFr: "Specialise dans une branche medicale specifique",
				yearsExperience: "3-5",
			},
			{
				title: "Head Nurse",
				titleFr: "Infirmier Chef",
				description: "Management of nursing team and unit",
				descriptionFr: "Gestion de l'equipe infirmiere et de l'unite",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["healthcare-interview-guide", "cv-template-healthcare"],
		icon: "Heartbeat",
	},
	{
		id: "aide-soignant",
		name: "Nursing Assistant",
		nameFr: "Aide Soignant",
		category: "healthcare",
		duration: "1 year",
		durationFr: "1 an",
		requirements: ["Certificate of primary education", "Minimum age 17 years", "Medical aptitude certificate"],
		requirementsFr: ["Certificat d'etudes primaires", "Age minimum 17 ans", "Certificat d'aptitude medicale"],
		careerProspects: [
			"Hospitals",
			"Nursing homes",
			"Home care services",
			"Rehabilitation centers",
			"Palliative care units",
		],
		careerProspectsFr: [
			"Hopitaux",
			"Maisons de retraite",
			"Services de soins a domicile",
			"Centres de reeducation",
			"Unites de soins palliatifs",
		],
		salaryRange: { min: 3500, max: 6000, currency: "MAD" },
		description: "Training focused on assisting nurses with basic patient care, hygiene, and comfort measures.",
		descriptionFr:
			"Formation axee sur l'assistance aux infirmiers pour les soins de base, l'hygiene et le confort des patients.",
		skills: [
			"Basic patient care",
			"Hygiene assistance",
			"Patient mobility",
			"Observation skills",
			"Compassionate care",
		],
		skillsFr: [
			"Soins de base aux patients",
			"Assistance a l'hygiene",
			"Mobilite des patients",
			"Capacites d'observation",
			"Soins avec compassion",
		],
		interviewTips: [
			"Show your dedication to patient comfort",
			"Discuss handling difficult situations with patients",
			"Emphasize reliability and attention to detail",
			"Highlight physical fitness for patient handling",
		],
		interviewTipsFr: [
			"Montrez votre devouement au confort du patient",
			"Discutez de la gestion des situations difficiles avec les patients",
			"Soulignez votre fiabilite et attention aux details",
			"Mettez en avant votre condition physique pour la manutention des patients",
		],
		careerPathways: [
			{
				title: "Nursing Assistant",
				titleFr: "Aide Soignant",
				description: "Direct patient care under nurse supervision",
				descriptionFr: "Soins directs aux patients sous supervision infirmiere",
				yearsExperience: "0-2",
			},
			{
				title: "Senior Nursing Assistant",
				titleFr: "Aide Soignant Senior",
				description: "Experienced assistant with specialized training",
				descriptionFr: "Assistant experimente avec formation specialisee",
				yearsExperience: "3-5",
			},
			{
				title: "Team Lead",
				titleFr: "Chef d'Equipe",
				description: "Coordinating nursing assistant team",
				descriptionFr: "Coordination de l'equipe d'aides-soignants",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["healthcare-interview-guide", "cv-template-healthcare"],
		icon: "HandHeart",
	},
	{
		id: "infirmier-auxiliaire",
		name: "Auxiliary Nurse",
		nameFr: "Infirmier Auxiliaire",
		category: "healthcare",
		duration: "2 years",
		durationFr: "2 ans",
		requirements: ["Baccalaureate or equivalent", "Minimum age 18 years", "Medical aptitude certificate"],
		requirementsFr: ["Baccalaureat ou equivalent", "Age minimum 18 ans", "Certificat d'aptitude medicale"],
		careerProspects: ["Health centers", "Dispensaries", "Mobile clinics", "Rural health posts", "Private practices"],
		careerProspectsFr: [
			"Centres de sante",
			"Dispensaires",
			"Cliniques mobiles",
			"Postes de sante ruraux",
			"Cabinets prives",
		],
		salaryRange: { min: 4500, max: 8000, currency: "MAD" },
		description: "Intermediate nursing training with focus on community health and basic medical procedures.",
		descriptionFr:
			"Formation infirmiere intermediaire avec accent sur la sante communautaire et les procedures medicales de base.",
		skills: [
			"Basic nursing procedures",
			"Community health education",
			"First aid",
			"Patient documentation",
			"Health screening",
		],
		skillsFr: [
			"Procedures infirmieres de base",
			"Education en sante communautaire",
			"Premiers secours",
			"Documentation patient",
			"Depistage de sante",
		],
		interviewTips: [
			"Demonstrate knowledge of community health",
			"Share examples of health education activities",
			"Show understanding of rural health challenges",
			"Emphasize adaptability and resourcefulness",
		],
		interviewTipsFr: [
			"Demontrez vos connaissances en sante communautaire",
			"Partagez des exemples d'activites d'education sanitaire",
			"Montrez votre comprehension des defis de sante rurale",
			"Soulignez votre adaptabilite et debrouillardise",
		],
		careerPathways: [
			{
				title: "Auxiliary Nurse",
				titleFr: "Infirmier Auxiliaire",
				description: "Basic nursing care in community settings",
				descriptionFr: "Soins infirmiers de base en milieu communautaire",
				yearsExperience: "0-2",
			},
			{
				title: "Community Health Nurse",
				titleFr: "Infirmier de Sante Communautaire",
				description: "Specialized in community outreach programs",
				descriptionFr: "Specialise dans les programmes de sensibilisation communautaire",
				yearsExperience: "3-5",
			},
		],
		relatedResources: ["healthcare-interview-guide", "cv-template-healthcare"],
		icon: "Stethoscope",
	},
	{
		id: "hse-specialist",
		name: "HSE Specialist",
		nameFr: "Specialiste HSE",
		category: "hse",
		duration: "2 years",
		durationFr: "2 ans",
		requirements: [
			"Baccalaureate in Sciences or Technical",
			"Minimum age 18 years",
			"Good physical condition",
			"Interest in safety regulations",
		],
		requirementsFr: [
			"Baccalaureat scientifique ou technique",
			"Age minimum 18 ans",
			"Bonne condition physique",
			"Interet pour la reglementation securite",
		],
		careerProspects: [
			"Industrial companies",
			"Construction sites",
			"Oil and gas sector",
			"Mining companies",
			"Consulting firms",
		],
		careerProspectsFr: [
			"Entreprises industrielles",
			"Chantiers de construction",
			"Secteur petrolier et gazier",
			"Societes minieres",
			"Cabinets de conseil",
		],
		salaryRange: { min: 6000, max: 15000, currency: "MAD" },
		description:
			"Comprehensive training in Health, Safety, and Environment management, including risk assessment and compliance.",
		descriptionFr:
			"Formation complete en gestion Hygiene, Securite et Environnement, incluant l'evaluation des risques et la conformite.",
		skills: ["Risk assessment", "Safety auditing", "Emergency planning", "Regulatory compliance", "Training delivery"],
		skillsFr: [
			"Evaluation des risques",
			"Audit de securite",
			"Planification d'urgence",
			"Conformite reglementaire",
			"Animation de formations",
		],
		interviewTips: [
			"Know current HSE regulations thoroughly",
			"Prepare examples of risk assessments you've conducted",
			"Discuss incident investigation methodology",
			"Show leadership in safety culture promotion",
		],
		interviewTipsFr: [
			"Maitrisez parfaitement la reglementation HSE actuelle",
			"Preparez des exemples d'evaluations de risques que vous avez menees",
			"Discutez de la methodologie d'enquete sur les incidents",
			"Montrez votre leadership dans la promotion de la culture securite",
		],
		careerPathways: [
			{
				title: "HSE Coordinator",
				titleFr: "Coordinateur HSE",
				description: "Entry-level safety coordination role",
				descriptionFr: "Poste de coordination securite d'entree",
				yearsExperience: "0-2",
			},
			{
				title: "HSE Manager",
				titleFr: "Responsable HSE",
				description: "Managing HSE department and policies",
				descriptionFr: "Gestion du departement et des politiques HSE",
				yearsExperience: "3-5",
			},
			{
				title: "HSE Director",
				titleFr: "Directeur HSE",
				description: "Strategic leadership of HSE function",
				descriptionFr: "Leadership strategique de la fonction HSE",
				yearsExperience: "7+",
			},
		],
		relatedResources: ["hse-interview-guide", "cv-template-industrial"],
		icon: "HardHat",
	},
	{
		id: "conducteur-engins",
		name: "Heavy Equipment Operator",
		nameFr: "Conducteur d'Engins",
		category: "industrial",
		duration: "1 year",
		durationFr: "1 an",
		requirements: [
			"Certificate of primary education",
			"Minimum age 18 years",
			"Good physical condition",
			"Valid driving license",
		],
		requirementsFr: [
			"Certificat d'etudes primaires",
			"Age minimum 18 ans",
			"Bonne condition physique",
			"Permis de conduire valide",
		],
		careerProspects: ["Construction companies", "Mining operations", "Quarries", "Public works", "Agriculture"],
		careerProspectsFr: [
			"Entreprises de construction",
			"Exploitations minieres",
			"Carrieres",
			"Travaux publics",
			"Agriculture",
		],
		salaryRange: { min: 5000, max: 10000, currency: "MAD" },
		description: "Training in operation of excavators, loaders, bulldozers, and other heavy construction equipment.",
		descriptionFr:
			"Formation a la conduite de pelleteuses, chargeuses, bulldozers et autres engins de chantier lourds.",
		skills: ["Equipment operation", "Safety procedures", "Basic maintenance", "Site navigation", "Load management"],
		skillsFr: [
			"Conduite d'engins",
			"Procedures de securite",
			"Maintenance de base",
			"Navigation sur site",
			"Gestion des charges",
		],
		interviewTips: [
			"Emphasize safety consciousness",
			"Discuss types of equipment you can operate",
			"Show understanding of maintenance basics",
			"Highlight experience in different terrain conditions",
		],
		interviewTipsFr: [
			"Mettez l'accent sur la conscience de la securite",
			"Discutez des types d'engins que vous pouvez conduire",
			"Montrez votre comprehension de la maintenance de base",
			"Soulignez votre experience sur differents types de terrain",
		],
		careerPathways: [
			{
				title: "Equipment Operator",
				titleFr: "Conducteur d'Engins",
				description: "Operating heavy machinery on sites",
				descriptionFr: "Conduite de machines lourdes sur les chantiers",
				yearsExperience: "0-2",
			},
			{
				title: "Senior Operator",
				titleFr: "Conducteur Senior",
				description: "Specialized in complex equipment",
				descriptionFr: "Specialise dans les equipements complexes",
				yearsExperience: "3-5",
			},
			{
				title: "Site Supervisor",
				titleFr: "Chef de Chantier",
				description: "Managing equipment teams",
				descriptionFr: "Gestion des equipes d'engins",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Truck",
	},
	{
		id: "mecanique-engins",
		name: "Heavy Equipment Mechanic",
		nameFr: "Mecanicien d'Engins",
		category: "industrial",
		duration: "2 years",
		durationFr: "2 ans",
		requirements: [
			"Certificate of primary education",
			"Minimum age 18 years",
			"Technical aptitude",
			"Good physical condition",
		],
		requirementsFr: [
			"Certificat d'etudes primaires",
			"Age minimum 18 ans",
			"Aptitude technique",
			"Bonne condition physique",
		],
		careerProspects: [
			"Equipment dealerships",
			"Mining companies",
			"Construction firms",
			"Equipment rental companies",
			"Municipal services",
		],
		careerProspectsFr: [
			"Concessionnaires d'engins",
			"Societes minieres",
			"Entreprises de construction",
			"Societes de location d'engins",
			"Services municipaux",
		],
		salaryRange: { min: 5500, max: 11000, currency: "MAD" },
		description: "Comprehensive training in maintenance and repair of heavy construction and mining equipment.",
		descriptionFr: "Formation complete en maintenance et reparation d'engins de chantier et d'exploitation miniere.",
		skills: [
			"Hydraulic systems",
			"Engine diagnostics",
			"Electrical systems",
			"Preventive maintenance",
			"Welding basics",
		],
		skillsFr: [
			"Systemes hydrauliques",
			"Diagnostic moteur",
			"Systemes electriques",
			"Maintenance preventive",
			"Bases de soudure",
		],
		interviewTips: [
			"Demonstrate troubleshooting methodology",
			"Discuss specific repair experiences",
			"Show knowledge of hydraulic and electrical systems",
			"Emphasize attention to safety during repairs",
		],
		interviewTipsFr: [
			"Demontrez votre methodologie de diagnostic",
			"Discutez d'experiences de reparation specifiques",
			"Montrez vos connaissances des systemes hydrauliques et electriques",
			"Soulignez votre attention a la securite pendant les reparations",
		],
		careerPathways: [
			{
				title: "Junior Mechanic",
				titleFr: "Mecanicien Junior",
				description: "Basic maintenance and repairs",
				descriptionFr: "Maintenance et reparations de base",
				yearsExperience: "0-2",
			},
			{
				title: "Senior Mechanic",
				titleFr: "Mecanicien Senior",
				description: "Complex diagnostics and repairs",
				descriptionFr: "Diagnostics et reparations complexes",
				yearsExperience: "3-5",
			},
			{
				title: "Workshop Manager",
				titleFr: "Chef d'Atelier",
				description: "Managing maintenance operations",
				descriptionFr: "Gestion des operations de maintenance",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Wrench",
	},
	{
		id: "tourneur-industriel",
		name: "Industrial Turner",
		nameFr: "Tourneur Industriel",
		category: "industrial",
		duration: "2 years",
		durationFr: "2 ans",
		requirements: [
			"Certificate of primary education",
			"Minimum age 17 years",
			"Good manual dexterity",
			"Technical aptitude",
		],
		requirementsFr: [
			"Certificat d'etudes primaires",
			"Age minimum 17 ans",
			"Bonne dexterite manuelle",
			"Aptitude technique",
		],
		careerProspects: [
			"Manufacturing plants",
			"Machine shops",
			"Automotive industry",
			"Aerospace sector",
			"Maintenance workshops",
		],
		careerProspectsFr: [
			"Usines de fabrication",
			"Ateliers d'usinage",
			"Industrie automobile",
			"Secteur aeronautique",
			"Ateliers de maintenance",
		],
		salaryRange: { min: 4500, max: 9000, currency: "MAD" },
		description: "Training in precision machining using lathes to create cylindrical and conical parts.",
		descriptionFr:
			"Formation a l'usinage de precision utilisant des tours pour creer des pieces cylindriques et coniques.",
		skills: ["Lathe operation", "Blueprint reading", "Precision measurement", "Tool selection", "Quality control"],
		skillsFr: ["Conduite de tour", "Lecture de plans", "Mesure de precision", "Selection d'outils", "Controle qualite"],
		interviewTips: [
			"Discuss your experience with different lathe types",
			"Show understanding of tolerances and specifications",
			"Emphasize precision and attention to detail",
			"Demonstrate knowledge of safety procedures",
		],
		interviewTipsFr: [
			"Discutez de votre experience avec differents types de tours",
			"Montrez votre comprehension des tolerances et specifications",
			"Soulignez la precision et l'attention aux details",
			"Demontrez votre connaissance des procedures de securite",
		],
		careerPathways: [
			{
				title: "Turner Operator",
				titleFr: "Operateur Tourneur",
				description: "Operating standard lathes",
				descriptionFr: "Conduite de tours standards",
				yearsExperience: "0-2",
			},
			{
				title: "CNC Turner",
				titleFr: "Tourneur CNC",
				description: "Operating computerized lathes",
				descriptionFr: "Conduite de tours a commande numerique",
				yearsExperience: "3-5",
			},
			{
				title: "Production Supervisor",
				titleFr: "Superviseur de Production",
				description: "Managing machining operations",
				descriptionFr: "Gestion des operations d'usinage",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Gear",
	},
	{
		id: "cariste-professionnel",
		name: "Forklift Operator",
		nameFr: "Cariste Professionnel",
		category: "industrial",
		duration: "6 months",
		durationFr: "6 mois",
		requirements: [
			"Certificate of primary education",
			"Minimum age 18 years",
			"Good physical condition",
			"Good spatial awareness",
		],
		requirementsFr: [
			"Certificat d'etudes primaires",
			"Age minimum 18 ans",
			"Bonne condition physique",
			"Bonne perception spatiale",
		],
		careerProspects: ["Warehouses", "Distribution centers", "Manufacturing plants", "Ports", "Retail logistics"],
		careerProspectsFr: [
			"Entrepots",
			"Centres de distribution",
			"Usines de fabrication",
			"Ports",
			"Logistique de detail",
		],
		salaryRange: { min: 4000, max: 7000, currency: "MAD" },
		description: "Training in safe operation of forklifts and other warehouse handling equipment.",
		descriptionFr:
			"Formation a la conduite securisee de chariots elevateurs et autres equipements de manutention en entrepot.",
		skills: [
			"Forklift operation",
			"Load balancing",
			"Inventory management basics",
			"Warehouse safety",
			"Equipment inspection",
		],
		skillsFr: [
			"Conduite de chariot elevateur",
			"Equilibrage des charges",
			"Bases de gestion des stocks",
			"Securite en entrepot",
			"Inspection des equipements",
		],
		interviewTips: [
			"Emphasize your safety record",
			"Discuss handling different load types",
			"Show awareness of warehouse organization",
			"Highlight ability to work in team environment",
		],
		interviewTipsFr: [
			"Mettez l'accent sur votre bilan securite",
			"Discutez de la manipulation de differents types de charges",
			"Montrez votre connaissance de l'organisation d'entrepot",
			"Soulignez votre capacite a travailler en equipe",
		],
		careerPathways: [
			{
				title: "Forklift Operator",
				titleFr: "Cariste",
				description: "Basic warehouse handling operations",
				descriptionFr: "Operations de manutention de base en entrepot",
				yearsExperience: "0-2",
			},
			{
				title: "Lead Operator",
				titleFr: "Cariste Chef d'Equipe",
				description: "Coordinating handling team",
				descriptionFr: "Coordination de l'equipe de manutention",
				yearsExperience: "3-5",
			},
			{
				title: "Warehouse Supervisor",
				titleFr: "Responsable d'Entrepot",
				description: "Managing warehouse operations",
				descriptionFr: "Gestion des operations d'entrepot",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Package",
	},
	{
		id: "electromecanique",
		name: "Electromechanics",
		nameFr: "Electromecanique",
		category: "industrial",
		duration: "2 years",
		durationFr: "2 ans",
		requirements: [
			"Baccalaureate in Sciences or Technical",
			"Minimum age 18 years",
			"Technical aptitude",
			"Good physical condition",
		],
		requirementsFr: [
			"Baccalaureat scientifique ou technique",
			"Age minimum 18 ans",
			"Aptitude technique",
			"Bonne condition physique",
		],
		careerProspects: [
			"Manufacturing plants",
			"Industrial maintenance",
			"Power plants",
			"Automotive industry",
			"Building automation",
		],
		careerProspectsFr: [
			"Usines de fabrication",
			"Maintenance industrielle",
			"Centrales electriques",
			"Industrie automobile",
			"Automatisation des batiments",
		],
		salaryRange: { min: 5500, max: 12000, currency: "MAD" },
		description:
			"Comprehensive training in electrical and mechanical systems maintenance, covering motors, PLCs, hydraulics, pneumatics, and industrial automation.",
		descriptionFr:
			"Formation complete en maintenance des systemes electriques et mecaniques, couvrant les moteurs, les automates programmables, l'hydraulique, la pneumatique et l'automatisation industrielle.",
		skills: [
			"Electrical troubleshooting",
			"Motor maintenance",
			"PLC programming basics",
			"Hydraulic systems",
			"Pneumatic systems",
		],
		skillsFr: [
			"Depannage electrique",
			"Maintenance des moteurs",
			"Bases de programmation automate",
			"Systemes hydrauliques",
			"Systemes pneumatiques",
		],
		interviewTips: [
			"Demonstrate understanding of both electrical and mechanical systems",
			"Discuss experience with troubleshooting complex equipment",
			"Show knowledge of safety procedures for electrical work",
			"Highlight your ability to read technical schematics",
		],
		interviewTipsFr: [
			"Demontrez votre comprehension des systemes electriques et mecaniques",
			"Discutez de votre experience en depannage d'equipements complexes",
			"Montrez votre connaissance des procedures de securite electrique",
			"Soulignez votre capacite a lire des schemas techniques",
		],
		careerPathways: [
			{
				title: "Electromechanical Technician",
				titleFr: "Technicien Electromecanique",
				description: "Entry-level maintenance and repair",
				descriptionFr: "Maintenance et reparation de niveau debutant",
				yearsExperience: "0-2",
			},
			{
				title: "Senior Technician",
				titleFr: "Technicien Senior",
				description: "Complex diagnostics and system optimization",
				descriptionFr: "Diagnostics complexes et optimisation des systemes",
				yearsExperience: "3-5",
			},
			{
				title: "Maintenance Supervisor",
				titleFr: "Superviseur de Maintenance",
				description: "Managing maintenance teams and planning",
				descriptionFr: "Gestion des equipes de maintenance et planification",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Zap",
	},
	{
		id: "soudure",
		name: "Welding",
		nameFr: "Soudure",
		category: "industrial",
		duration: "1 year",
		durationFr: "1 an",
		requirements: [
			"Certificate of primary education",
			"Minimum age 18 years",
			"Good manual dexterity",
			"Good physical condition",
			"Good vision",
		],
		requirementsFr: [
			"Certificat d'etudes primaires",
			"Age minimum 18 ans",
			"Bonne dexterite manuelle",
			"Bonne condition physique",
			"Bonne acuite visuelle",
		],
		careerProspects: [
			"Construction companies",
			"Shipbuilding",
			"Pipeline industry",
			"Manufacturing plants",
			"Automotive industry",
			"Offshore platforms",
		],
		careerProspectsFr: [
			"Entreprises de construction",
			"Construction navale",
			"Industrie des pipelines",
			"Usines de fabrication",
			"Industrie automobile",
			"Plateformes offshore",
		],
		salaryRange: { min: 5000, max: 11000, currency: "MAD" },
		description:
			"Industrial welding certification training covering MIG, TIG, and arc welding techniques for various metals and industrial applications.",
		descriptionFr:
			"Formation certifiante en soudure industrielle couvrant les techniques MIG, TIG et soudure a l'arc pour divers metaux et applications industrielles.",
		skills: [
			"MIG welding",
			"TIG welding",
			"Arc welding",
			"Blueprint reading",
			"Metal preparation",
			"Quality inspection",
		],
		skillsFr: [
			"Soudure MIG",
			"Soudure TIG",
			"Soudure a l'arc",
			"Lecture de plans",
			"Preparation des metaux",
			"Controle qualite",
		],
		interviewTips: [
			"Discuss your experience with different welding techniques",
			"Show certifications and qualifications you hold",
			"Emphasize safety awareness and proper PPE usage",
			"Demonstrate knowledge of different metals and their properties",
		],
		interviewTipsFr: [
			"Discutez de votre experience avec differentes techniques de soudure",
			"Montrez vos certifications et qualifications",
			"Mettez l'accent sur la sensibilisation a la securite et l'utilisation des EPI",
			"Demontrez votre connaissance des differents metaux et leurs proprietes",
		],
		careerPathways: [
			{
				title: "Junior Welder",
				titleFr: "Soudeur Junior",
				description: "Basic welding tasks under supervision",
				descriptionFr: "Taches de soudure de base sous supervision",
				yearsExperience: "0-2",
			},
			{
				title: "Certified Welder",
				titleFr: "Soudeur Certifie",
				description: "Independent work on complex projects",
				descriptionFr: "Travail independant sur des projets complexes",
				yearsExperience: "2-5",
			},
			{
				title: "Welding Inspector/Supervisor",
				titleFr: "Inspecteur/Superviseur de Soudure",
				description: "Quality control and team management",
				descriptionFr: "Controle qualite et gestion d'equipe",
				yearsExperience: "5+",
			},
		],
		relatedResources: ["industrial-interview-guide", "cv-template-industrial"],
		icon: "Flame",
	},
];

// Static learning resources data
const resources: z.infer<typeof resourceSchema>[] = [
	{
		id: "healthcare-interview-guide",
		title: "Complete Healthcare Interview Guide",
		titleFr: "Guide Complet des Entretiens Sante",
		description:
			"Master healthcare job interviews with this comprehensive guide covering common clinical questions, competency-based scenarios, and professional etiquette. Learn how to present your nursing or medical training effectively and stand out to hospital employers in Morocco.",
		descriptionFr:
			"Maitrisez les entretiens dans le secteur de la sante avec ce guide complet couvrant les questions cliniques courantes, les scenarios bases sur les competences et l'etiquette professionnelle. Apprenez a presenter votre formation infirmiere ou medicale efficacement et a vous demarquer aupres des employeurs hospitaliers au Maroc.",
		type: "guide",
		category: "healthcare",
		url: "/dashboard/wiki/interview-preparation/healthcare-interview-guide",
		tags: ["interview", "healthcare", "nursing", "preparation"],
	},
	{
		id: "industrial-interview-guide",
		title: "Industrial Sector Interview Guide",
		titleFr: "Guide des Entretiens Secteur Industriel",
		description:
			"Prepare for technical and industrial job interviews with targeted strategies for manufacturing, engineering, and production roles. This guide covers industry-specific questions, how to demonstrate hands-on skills, and what Morocco's top industrial employers look for in candidates.",
		descriptionFr:
			"Preparez-vous aux entretiens techniques et industriels avec des strategies ciblees pour les postes de fabrication, d'ingenierie et de production. Ce guide couvre les questions specifiques au secteur, comment demontrer vos competences pratiques et ce que les meilleurs employeurs industriels du Maroc recherchent.",
		type: "guide",
		category: "industrial",
		url: "/dashboard/wiki/interview-preparation/industry-specific-questions",
		tags: ["interview", "industrial", "technical", "preparation"],
	},
	{
		id: "hse-interview-guide",
		title: "HSE Interview Preparation Guide",
		titleFr: "Guide de Preparation Entretiens HSE",
		description:
			"A specialized resource for Health, Safety, and Environment professionals preparing for job interviews. Covers behavioral and situational questions, regulatory knowledge assessments, and how to articulate your HSE expertise to prospective employers.",
		descriptionFr:
			"Une ressource specialisee pour les professionnels Hygiene, Securite et Environnement qui se preparent aux entretiens. Couvre les questions comportementales et situationnelles, les evaluations des connaissances reglementaires et comment exprimer votre expertise HSE aux employeurs potentiels.",
		type: "guide",
		category: "hse",
		url: "/dashboard/wiki/interview-preparation/behavioral-questions",
		tags: ["interview", "hse", "safety", "preparation"],
	},
	{
		id: "cv-template-healthcare",
		title: "Healthcare CV Template",
		titleFr: "Modele de CV Sante",
		description:
			"A professionally designed CV template tailored for healthcare graduates and practitioners in Morocco. Highlights clinical experience, certifications, and competencies in a clean, ATS-friendly format that hospital HR departments recognize.",
		descriptionFr:
			"Un modele de CV concu professionnellement pour les diplomes et praticiens de la sante au Maroc. Il met en valeur l'experience clinique, les certifications et les competences dans un format epure, adapte aux logiciels de tri de candidatures, que les services RH des hopitaux reconnaissent.",
		type: "template",
		category: "healthcare",
		url: "/dashboard/templates/gallery",
		downloadUrl: "/dashboard/templates/gallery",
		tags: ["cv", "template", "healthcare", "nursing"],
	},
	{
		id: "cv-template-industrial",
		title: "Industrial CV Template",
		titleFr: "Modele de CV Industriel",
		description:
			"An optimized CV template for industrial and technical positions that effectively showcases technical skills, safety certifications, and hands-on experience. Formatted to meet the expectations of Morocco's manufacturing and engineering sector employers.",
		descriptionFr:
			"Un modele de CV optimise pour les postes industriels et techniques qui presente efficacement les competences techniques, les certifications de securite et l'experience pratique. Formate pour repondre aux attentes des employeurs du secteur manufacturier et de l'ingenierie au Maroc.",
		type: "template",
		category: "industrial",
		url: "/dashboard/templates/gallery",
		downloadUrl: "/dashboard/templates/gallery",
		tags: ["cv", "template", "industrial", "technical"],
	},
	{
		id: "cover-letter-guide",
		title: "Cover Letter Writing Guide",
		titleFr: "Guide de Redaction de Lettre de Motivation",
		description:
			"Learn how to write compelling cover letters that open doors to interviews in Morocco's competitive job market. This guide walks you through structure, tone, personalization techniques, and common mistakes to avoid when applying to healthcare, industrial, or HSE roles.",
		descriptionFr:
			"Apprenez a rediger des lettres de motivation convaincantes qui ouvrent des portes aux entretiens dans le marche de l'emploi marocain competitif. Ce guide vous guide a travers la structure, le ton, les techniques de personnalisation et les erreurs courantes a eviter lors de candidatures dans les secteurs sante, industriel ou HSE.",
		type: "guide",
		category: "general",
		url: "/dashboard/wiki/cover-letters/cover-letter-basics",
		tags: ["cover-letter", "writing", "job-application"],
	},
	{
		id: "job-market-morocco-2024",
		title: "Job Market Trends in Morocco",
		titleFr: "Tendances du Marche de l'Emploi au Maroc",
		description:
			"An in-depth analysis of Morocco's 2024 job market, highlighting growth sectors, in-demand skills, and regional employment hubs. Understand where the best opportunities are in healthcare, industry, and HSE so you can target your job search strategically.",
		descriptionFr:
			"Une analyse approfondie du marche de l'emploi marocain en 2024, mettant en lumiere les secteurs en croissance, les competences recherchees et les poles d'emploi regionaux. Comprenez ou se trouvent les meilleures opportunites dans la sante, l'industrie et le HSE pour cibler votre recherche d'emploi strategiquement.",
		type: "article",
		category: "career",
		publishedAt: "2024-01-15",
		url: "/dashboard/wiki/job-search-strategies/job-search-strategies-overview",
		tags: ["job-market", "morocco", "trends", "career"],
	},
	{
		id: "salary-guide-healthcare",
		title: "Healthcare Salary Guide",
		titleFr: "Guide des Salaires Sante",
		description:
			"Comprehensive salary benchmarks for healthcare positions across Morocco's public and private sectors. Covers nursing, midwifery, and allied health roles with data on regional variations, benefits packages, and how to negotiate your compensation confidently.",
		descriptionFr:
			"References salariales completes pour les postes de sante dans les secteurs public et prive au Maroc. Couvre les roles infirmiers, de sage-femme et paramedical avec des donnees sur les variations regionales, les packages d'avantages sociaux et comment negocier votre remuneration en toute confiance.",
		type: "article",
		category: "healthcare",
		publishedAt: "2024-02-01",
		url: "/dashboard/wiki/salary-negotiation/salary-negotiation-basics",
		tags: ["salary", "healthcare", "morocco", "compensation"],
	},
	{
		id: "success-story-fatima",
		title: "From IMTA to Hospital Head Nurse",
		titleFr: "De l'IMTA a Infirmiere Chef d'Hopital",
		description:
			"Fatima Benali shares her inspiring journey from IMTA nursing graduate to Head Nurse at a regional hospital in just seven years. Her story covers how she leveraged her IMTA training, secured her first role, and advanced into leadership through continuous learning and mentorship.",
		descriptionFr:
			"Fatima Benali partage son parcours inspirant de diplômee en soins infirmiers de l'IMTA a Infirmiere Chef dans un hopital regional en seulement sept ans. Son histoire couvre comment elle a tire parti de sa formation IMTA, obtenu son premier poste et progressé vers un role de direction grace a l'apprentissage continu et au mentorat.",
		type: "success_story",
		category: "healthcare",
		author: "Fatima Benali",
		url: "/dashboard/resources/success-stories",
		tags: ["success-story", "nursing", "career", "inspiration"],
	},
	{
		id: "success-story-youssef",
		title: "Building a Career in HSE",
		titleFr: "Construire une Carriere en HSE",
		description:
			"Youssef El Amrani recounts how he went from IMTA HSE graduate to Regional HSE Manager at one of Morocco's largest industrial groups within five years. His account covers certifications pursued, key projects managed, and the habits that accelerated his professional growth.",
		descriptionFr:
			"Youssef El Amrani raconte comment il est passe de diplome HSE de l'IMTA a Responsable HSE Regional dans l'un des plus grands groupes industriels du Maroc en cinq ans. Son recit couvre les certifications obtenues, les projets cles geres et les habitudes qui ont accelere sa croissance professionnelle.",
		type: "success_story",
		category: "hse",
		author: "Youssef El Amrani",
		url: "/dashboard/resources/success-stories",
		tags: ["success-story", "hse", "career", "inspiration"],
	},
	{
		id: "video-interview-basics",
		title: "Interview Basics Video Course",
		titleFr: "Cours Video: Les Bases de l'Entretien",
		description:
			"A structured 45-minute video course covering the fundamentals every job seeker needs before walking into an interview. Topics include body language, answering common questions, handling salary discussions, and closing the interview on a strong note.",
		descriptionFr:
			"Un cours video structure de 45 minutes couvrant les fondamentaux dont chaque chercheur d'emploi a besoin avant un entretien. Les sujets incluent le langage corporel, les reponses aux questions courantes, la gestion des discussions salariales et comment conclure l'entretien sur une note forte.",
		type: "video",
		category: "general",
		duration: "45 min",
		url: "/dashboard/interview",
		tags: ["video", "interview", "basics", "training"],
	},
	{
		id: "video-healthcare-scenarios",
		title: "Healthcare Interview Scenarios",
		titleFr: "Scenarios d'Entretien Sante",
		description:
			"A 30-minute video collection of realistic healthcare interview scenarios with expert commentary on ideal responses. Covers situations such as handling difficult patients, teamwork under pressure, and ethical dilemmas common in nursing and allied health roles.",
		descriptionFr:
			"Une collection video de 30 minutes de scenarios d'entretien realistes dans le secteur de la sante avec des commentaires d'experts sur les reponses ideales. Couvre des situations telles que la gestion de patients difficiles, le travail en equipe sous pression et les dilemmes ethiques courants dans les roles infirmiers et paramedical.",
		type: "video",
		category: "healthcare",
		duration: "30 min",
		url: "/dashboard/interview/practice",
		tags: ["video", "interview", "healthcare", "scenarios"],
	},
	{
		id: "resume-writing-fundamentals",
		title: "Resume Writing Fundamentals",
		titleFr: "Fondamentaux de la Redaction de CV",
		description:
			"A foundational guide to building a professional resume from scratch, covering structure, content prioritization, and formatting best practices. Learn how to present your education, work experience, and skills in a way that captures recruiter attention within seconds.",
		descriptionFr:
			"Un guide fondamental pour construire un CV professionnel de zero, couvrant la structure, la priorisation du contenu et les meilleures pratiques de mise en forme. Apprenez a presenter votre formation, votre experience professionnelle et vos competences de maniere a capter l'attention des recruteurs en quelques secondes.",
		type: "guide",
		category: "general",
		url: "/dashboard/wiki/resume-fundamentals/resume-basics",
		tags: ["resume", "cv", "writing", "fundamentals", "career"],
	},
	{
		id: "ats-optimization-guide",
		title: "ATS Optimization Guide",
		titleFr: "Guide d'Optimisation pour les ATS",
		description:
			"Understand how Applicant Tracking Systems filter resumes and learn proven techniques to ensure yours passes automated screening. Covers keyword strategy, formatting rules, and section ordering to maximize your visibility with both ATS software and human recruiters.",
		descriptionFr:
			"Comprenez comment les systemes de suivi des candidats filtrent les CV et apprenez des techniques eprouvees pour s'assurer que le votre passe le filtrage automatique. Couvre la strategie de mots-cles, les regles de mise en forme et l'ordre des sections pour maximiser votre visibilite aupres des logiciels ATS et des recruteurs humains.",
		type: "guide",
		category: "general",
		url: "/dashboard/wiki/ats-optimization/ats-optimization-overview",
		tags: ["ats", "resume", "optimization", "keywords", "screening"],
	},
	{
		id: "networking-strategies",
		title: "Professional Networking Strategies",
		titleFr: "Strategies de Reseautage Professionnel",
		description:
			"Build and leverage a professional network that opens doors to unadvertised opportunities in Morocco's healthcare and industrial sectors. This guide covers attending industry events, reaching out to alumni, building meaningful LinkedIn connections, and maintaining relationships over time.",
		descriptionFr:
			"Construisez et exploitez un reseau professionnel qui ouvre des portes a des opportunites non annoncees dans les secteurs de la sante et de l'industrie au Maroc. Ce guide couvre la participation aux evenements sectoriels, la prise de contact avec les anciens, la creation de connexions LinkedIn significatives et le maintien des relations dans le temps.",
		type: "guide",
		category: "career",
		url: "/dashboard/wiki/networking-linkedin/networking-basics",
		tags: ["networking", "linkedin", "career", "professional", "connections"],
	},
	{
		id: "remote-work-guide",
		title: "Remote Work Success Guide",
		titleFr: "Guide de Reussite du Travail a Distance",
		description:
			"Navigate the growing remote and hybrid work landscape with practical guidance on productivity, communication, and professional presence. Covers tools commonly used by Moroccan employers, how to set up a productive home workspace, and best practices for virtual collaboration.",
		descriptionFr:
			"Naviguez dans le paysage croissant du travail a distance et hybride avec des conseils pratiques sur la productivite, la communication et la presence professionnelle. Couvre les outils couramment utilises par les employeurs marocains, comment configurer un espace de travail a domicile productif et les meilleures pratiques de collaboration virtuelle.",
		type: "guide",
		category: "career",
		url: "/dashboard/wiki/remote-work/remote-work-overview",
		tags: ["remote-work", "hybrid", "productivity", "career", "digital"],
	},
	{
		id: "career-transition-guide",
		title: "Career Transition Guide",
		titleFr: "Guide de Reconversion Professionnelle",
		description:
			"A step-by-step guide for professionals looking to switch fields or move into a new industry while leveraging existing skills. Covers skills gap analysis, retraining options available through IMTA and other institutions, and how to position a career change positively to employers.",
		descriptionFr:
			"Un guide etape par etape pour les professionnels cherchant a changer de domaine ou a evoluer vers un nouveau secteur tout en valorisant leurs competences existantes. Couvre l'analyse des ecarts de competences, les options de reconversion disponibles via l'IMTA et d'autres institutions, et comment presenter positivement un changement de carriere aux employeurs.",
		type: "guide",
		category: "career",
		url: "/dashboard/wiki/career-transitions/career-transitions-overview",
		tags: ["career-change", "transition", "retraining", "skills", "career"],
	},
	{
		id: "linkedin-profile-optimization",
		title: "LinkedIn Profile Optimization",
		titleFr: "Optimisation du Profil LinkedIn",
		description:
			"Transform your LinkedIn profile into a powerful personal branding tool that attracts recruiters and industry connections in Morocco and beyond. Covers headline writing, summary crafting, experience descriptions, skills endorsements, and how to engage with content strategically.",
		descriptionFr:
			"Transformez votre profil LinkedIn en un puissant outil de marque personnelle qui attire les recruteurs et les contacts du secteur au Maroc et au-dela. Couvre la redaction du titre, la creation du resume, les descriptions d'experience, les validations de competences et comment interagir strategiquement avec le contenu.",
		type: "guide",
		category: "career",
		url: "/dashboard/wiki/networking-linkedin/linkedin-optimization",
		tags: ["linkedin", "personal-branding", "profile", "networking", "career"],
	},
	{
		id: "resume-formats-guide",
		title: "Choosing the Right Resume Format",
		titleFr: "Choisir le Bon Format de CV",
		description:
			"Compare chronological, functional, and combination resume formats to determine which best suits your experience level and career goals. Includes guidance for recent graduates, career changers, and experienced professionals in Morocco's key employment sectors.",
		descriptionFr:
			"Comparez les formats de CV chronologique, fonctionnel et combine pour determiner lequel convient le mieux a votre niveau d'experience et a vos objectifs de carriere. Inclut des conseils pour les jeunes diplomes, les personnes en reconversion et les professionnels experimentes dans les principaux secteurs d'emploi au Maroc.",
		type: "guide",
		category: "general",
		url: "/dashboard/wiki/resume-formats/resume-formats-overview",
		tags: ["resume", "cv", "format", "chronological", "functional"],
	},
	{
		id: "salary-negotiation-scripts",
		title: "Salary Negotiation Scripts and Strategies",
		titleFr: "Scripts et Strategies de Negociation Salariale",
		description:
			"Practical scripts and proven negotiation strategies to help you confidently discuss and secure the compensation you deserve. Covers how to research market rates, respond to initial offers, handle counteroffers, and negotiate non-salary benefits in the Moroccan context.",
		descriptionFr:
			"Des scripts pratiques et des strategies de negociation eprouvees pour vous aider a discuter et obtenir en toute confiance la remuneration que vous meritez. Couvre la recherche des taux du marche, la reponse aux offres initiales, la gestion des contre-offres et la negociation des avantages non salariaux dans le contexte marocain.",
		type: "guide",
		category: "career",
		url: "/dashboard/wiki/salary-negotiation/negotiation-strategies",
		tags: ["salary", "negotiation", "compensation", "career", "scripts"],
	},
];

// Static learning paths data
const learningPaths: z.infer<typeof learningPathSchema>[] = [
	{
		id: "healthcare-career-start",
		title: "Healthcare Career Launch",
		titleFr: "Lancement de Carriere en Sante",
		description: "Complete pathway from training to your first healthcare job",
		descriptionFr: "Parcours complet de la formation a votre premier emploi dans la sante",
		category: "healthcare",
		estimatedDuration: "4 weeks",
		estimatedDurationFr: "4 semaines",
		steps: [
			{
				order: 1,
				title: "Perfect Your CV",
				titleFr: "Perfectionnez Votre CV",
				description: "Create a professional healthcare-focused resume",
				descriptionFr: "Creez un CV professionnel oriente sante",
				resourceIds: ["cv-template-healthcare"],
			},
			{
				order: 2,
				title: "Master Interview Basics",
				titleFr: "Maitrisez les Bases de l'Entretien",
				description: "Learn fundamental interview skills",
				descriptionFr: "Apprenez les competences fondamentales en entretien",
				resourceIds: ["video-interview-basics", "healthcare-interview-guide"],
			},
			{
				order: 3,
				title: "Practice Healthcare Scenarios",
				titleFr: "Pratiquez les Scenarios Sante",
				description: "Prepare for specific healthcare interview situations",
				descriptionFr: "Preparez-vous aux situations d'entretien specifiques a la sante",
				resourceIds: ["video-healthcare-scenarios"],
			},
			{
				order: 4,
				title: "Understand the Market",
				titleFr: "Comprenez le Marche",
				description: "Learn about job opportunities and salary expectations",
				descriptionFr: "Decouvrez les opportunites d'emploi et les attentes salariales",
				resourceIds: ["job-market-morocco-2024", "salary-guide-healthcare"],
			},
		],
	},
	{
		id: "industrial-career-start",
		title: "Industrial Career Launch",
		titleFr: "Lancement de Carriere Industrielle",
		description: "Your pathway to success in the industrial sector",
		descriptionFr: "Votre parcours vers le succes dans le secteur industriel",
		category: "industrial",
		estimatedDuration: "3 weeks",
		estimatedDurationFr: "3 semaines",
		steps: [
			{
				order: 1,
				title: "Build Your Industrial CV",
				titleFr: "Construisez Votre CV Industriel",
				description: "Create a CV that highlights technical skills",
				descriptionFr: "Creez un CV qui met en valeur vos competences techniques",
				resourceIds: ["cv-template-industrial"],
			},
			{
				order: 2,
				title: "Interview Preparation",
				titleFr: "Preparation aux Entretiens",
				description: "Master interview techniques for industrial positions",
				descriptionFr: "Maitrisez les techniques d'entretien pour les postes industriels",
				resourceIds: ["video-interview-basics", "industrial-interview-guide"],
			},
			{
				order: 3,
				title: "Market Knowledge",
				titleFr: "Connaissance du Marche",
				description: "Understand the industrial job market",
				descriptionFr: "Comprenez le marche de l'emploi industriel",
				resourceIds: ["job-market-morocco-2024"],
			},
		],
	},
	{
		id: "hse-career-path",
		title: "HSE Professional Path",
		titleFr: "Parcours Professionnel HSE",
		description: "Become a successful HSE professional",
		descriptionFr: "Devenez un professionnel HSE accompli",
		category: "hse",
		estimatedDuration: "4 weeks",
		estimatedDurationFr: "4 semaines",
		steps: [
			{
				order: 1,
				title: "CV and Cover Letter",
				titleFr: "CV et Lettre de Motivation",
				description: "Create compelling application documents",
				descriptionFr: "Creez des documents de candidature convaincants",
				resourceIds: ["cv-template-industrial", "cover-letter-guide"],
			},
			{
				order: 2,
				title: "HSE Interview Mastery",
				titleFr: "Maitrise des Entretiens HSE",
				description: "Prepare for HSE-specific interview questions",
				descriptionFr: "Preparez-vous aux questions d'entretien specifiques HSE",
				resourceIds: ["video-interview-basics", "hse-interview-guide"],
			},
			{
				order: 3,
				title: "Learn from Success",
				titleFr: "Apprenez des Reussites",
				description: "Get inspired by successful HSE professionals",
				descriptionFr: "Inspirez-vous des professionnels HSE qui ont reussi",
				resourceIds: ["success-story-youssef"],
			},
		],
	},
];

export const resourcesRouter = {
	// Get all programs
	getPrograms: publicProcedure
		.input(
			z.object({
				category: z.enum(["healthcare", "industrial", "hse"]).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			let filtered = programs;

			if (input.category) {
				filtered = filtered.filter((p) => p.category === input.category);
			}

			return filtered.map((p) => ({
				id: p.id,
				name: input.language === "fr" ? p.nameFr : p.name,
				category: p.category,
				duration: input.language === "fr" ? p.durationFr : p.duration,
				salaryRange: p.salaryRange,
				description: input.language === "fr" ? p.descriptionFr : p.description,
				icon: p.icon,
			}));
		}),

	// Get single program details
	getProgram: publicProcedure
		.input(
			z.object({
				programId: z.string(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			const program = programs.find((p) => p.id === input.programId);

			if (!program) {
				throw new Error("Program not found");
			}

			const isFr = input.language === "fr";

			return {
				id: program.id,
				name: isFr ? program.nameFr : program.name,
				category: program.category,
				duration: isFr ? program.durationFr : program.duration,
				requirements: isFr ? program.requirementsFr : program.requirements,
				careerProspects: isFr ? program.careerProspectsFr : program.careerProspects,
				salaryRange: program.salaryRange,
				description: isFr ? program.descriptionFr : program.description,
				skills: isFr ? program.skillsFr : program.skills,
				interviewTips: isFr ? program.interviewTipsFr : program.interviewTips,
				careerPathways: program.careerPathways.map((cp) => ({
					title: isFr ? cp.titleFr : cp.title,
					description: isFr ? cp.descriptionFr : cp.description,
					yearsExperience: cp.yearsExperience,
				})),
				relatedResources: program.relatedResources,
				icon: program.icon,
			};
		}),

	// Get learning resources
	getResources: publicProcedure
		.input(
			z.object({
				type: z.enum(["guide", "video", "template", "article", "success_story"]).optional(),
				category: z.enum(["healthcare", "industrial", "hse", "general", "career"]).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
				search: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			let filtered = resources;

			if (input.type) {
				filtered = filtered.filter((r) => r.type === input.type);
			}

			if (input.category) {
				filtered = filtered.filter((r) => r.category === input.category);
			}

			if (input.search) {
				const searchLower = input.search.toLowerCase();
				filtered = filtered.filter(
					(r) =>
						r.title.toLowerCase().includes(searchLower) ||
						r.titleFr.toLowerCase().includes(searchLower) ||
						r.description.toLowerCase().includes(searchLower) ||
						r.descriptionFr.toLowerCase().includes(searchLower) ||
						r.tags.some((t) => t.toLowerCase().includes(searchLower)),
				);
			}

			const isFr = input.language === "fr";

			return filtered.map((r) => ({
				id: r.id,
				title: isFr ? r.titleFr : r.title,
				description: isFr ? r.descriptionFr : r.description,
				type: r.type,
				category: r.category,
				url: r.url,
				downloadUrl: r.downloadUrl,
				thumbnail: r.thumbnail,
				duration: r.duration,
				author: r.author,
				publishedAt: r.publishedAt,
				tags: r.tags,
			}));
		}),

	// Get learning paths
	getLearningPaths: publicProcedure
		.input(
			z.object({
				category: z.enum(["healthcare", "industrial", "hse"]).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
			}),
		)
		.handler(async ({ input }) => {
			let filtered = learningPaths;

			if (input.category) {
				filtered = filtered.filter((lp) => lp.category === input.category);
			}

			const isFr = input.language === "fr";

			return filtered.map((lp) => ({
				id: lp.id,
				title: isFr ? lp.titleFr : lp.title,
				description: isFr ? lp.descriptionFr : lp.description,
				category: lp.category,
				estimatedDuration: isFr ? lp.estimatedDurationFr : lp.estimatedDuration,
				stepsCount: lp.steps.length,
				steps: lp.steps.map((s) => ({
					order: s.order,
					title: isFr ? s.titleFr : s.title,
					description: isFr ? s.descriptionFr : s.description,
					resourceIds: s.resourceIds,
				})),
			}));
		}),

	// Get success stories
	getSuccessStories: publicProcedure
		.input(
			z.object({
				category: z.enum(["healthcare", "industrial", "hse"]).optional(),
				language: z.enum(["fr", "en"]).default("fr"),
				limit: z.number().min(1).max(20).default(10),
			}),
		)
		.handler(async ({ input }) => {
			let filtered = resources.filter((r) => r.type === "success_story");

			if (input.category) {
				filtered = filtered.filter((r) => r.category === input.category);
			}

			filtered = filtered.slice(0, input.limit);

			const isFr = input.language === "fr";

			return filtered.map((r) => ({
				id: r.id,
				title: isFr ? r.titleFr : r.title,
				description: isFr ? r.descriptionFr : r.description,
				author: r.author,
				category: r.category,
				tags: r.tags,
			}));
		}),
};
