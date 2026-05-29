// Seed vocational sample CVs (FR) into resume_gallery for IMTA students.
// Fields: healthcare, industrial, hse. >=8 each. Idempotent (keyed on name).
// DB: LOCAL PostgreSQL 5432 via DATABASE_URL in .env (pg client).
//
// Each row's resume_data is a FULL valid ResumeData object (matches
// src/schema/resume/data.ts -> resumeDataSchema), a superset of the
// partial shape older gallery rows use, so it validates and renders.

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const DATABASE_URL = readFileSync(join(root, ".env"), "utf8").match(
	/DATABASE_URL=["']?([^"'\n\r]+)["']?/,
)?.[1];
if (!DATABASE_URL) throw new Error("DATABASE_URL not found in .env");

const { Client } = pg;

// ---------- ResumeData builders (valid per resumeDataSchema) ----------

const uid = () => randomUUID();

function urlObj(url = "", label = "") {
	return { url, label };
}

function profileItem(network, username, icon = "") {
	return { id: uid(), hidden: false, icon, network, username, website: urlObj() };
}

function experienceItem({ company, position, location, period, description }) {
	return { id: uid(), hidden: false, company, position, location, period, website: urlObj(), description };
}

function educationItem({ school, degree, area, grade = "", location, period, description = "" }) {
	return { id: uid(), hidden: false, school, degree, area, grade, location, period, website: urlObj(), description };
}

function skillItem(name, level, keywords = [], proficiency = "") {
	return { id: uid(), hidden: false, icon: "", name, proficiency, level, keywords };
}

function languageItem(language, fluency, level) {
	return { id: uid(), hidden: false, language, fluency, level };
}

function certItem({ title, issuer, date, description = "" }) {
	return { id: uid(), hidden: false, title, issuer, date, website: urlObj(), description };
}

function internshipItem({ company, position, supervisor = "", location, period, type, tasksPerformed, skillsAcquired = [], evaluation = "" }) {
	return {
		id: uid(),
		hidden: false,
		company,
		position,
		supervisor,
		location,
		period,
		type,
		website: urlObj(),
		tasksPerformed,
		skillsAcquired,
		evaluation,
	};
}

function emptySection() {
	return { title: "", columns: 1, hidden: false, items: [] };
}

function buildResumeData({
	name,
	headline,
	email,
	phone,
	location,
	summary,
	program,
	experience = [],
	education = [],
	skills = [],
	languages = [],
	certifications = [],
	internships = [],
	primaryColor = "rgba(13, 148, 136, 1)", // teal/cyan IMTA theme
	template = "casablanca",
}) {
	const sections = {
		profiles: emptySection(),
		experience: { ...emptySection(), items: experience },
		education: { ...emptySection(), items: education },
		projects: emptySection(),
		skills: { ...emptySection(), items: skills },
		languages: { ...emptySection(), items: languages },
		interests: emptySection(),
		awards: emptySection(),
		certifications: { ...emptySection(), items: certifications },
		publications: emptySection(),
		volunteer: emptySection(),
		references: {
			...emptySection(),
			items: [
				{
					id: uid(),
					hidden: false,
					name: "Disponibles sur demande",
					position: "",
					website: urlObj(),
					phone: "",
					description: "",
				},
			],
		},
		internships: { ...emptySection(), title: "", items: internships, hidden: internships.length === 0 },
	};

	return {
		picture: {
			hidden: false,
			url: "",
			size: 90,
			rotation: 0,
			aspectRatio: 1,
			borderRadius: 0,
			borderColor: "rgba(0, 0, 0, 0.5)",
			borderWidth: 0,
			shadowColor: "rgba(0, 0, 0, 0.5)",
			shadowWidth: 0,
		},
		basics: {
			name,
			headline,
			email,
			phone,
			location,
			website: urlObj(),
			customFields: [],
			cin: "",
			militaryServiceStatus: "not-applicable",
			dateOfBirth: "",
			nationality: "Marocaine",
			maritalStatus: "",
		},
		summary: { title: "", columns: 1, hidden: false, content: `<p>${summary}</p>` },
		sections,
		customSections: [],
		metadata: {
			template,
			layout: {
				sidebarWidth: 35,
				pages: [
					{
						fullWidth: false,
						main: ["summary", "experience", "education", "internships", "references"],
						sidebar: ["skills", "certifications", "languages"],
					},
				],
			},
			css: { enabled: false, value: "" },
			page: { gapX: 4, gapY: 6, marginX: 14, marginY: 12, format: "a4", locale: "fr-FR", hideIcons: false },
			design: {
				colors: { primary: primaryColor, text: "rgba(0, 0, 0, 1)", background: "rgba(255, 255, 255, 1)" },
				level: { icon: "star", type: "circle" },
			},
			typography: {
				body: { fontFamily: "IBM Plex Serif", fontWeights: ["400", "500"], fontSize: 10, lineHeight: 1.5 },
				heading: { fontFamily: "IBM Plex Serif", fontWeights: ["600"], fontSize: 14, lineHeight: 1.5 },
			},
			notes: "",
			imtaBranding: { enabled: true, showLogo: false, program, promotionYear: "" },
		},
	};
}

// ---------- Vocational CV definitions ----------

const li = (l) => languageItem(...l);
const ARABIC = ["Arabe", "Langue maternelle", 5];
const FRENCH = ["Français", "Courant (C1)", 4];
const ENGLISH = ["Anglais", "Intermédiaire (B1)", 3];

// ===== HEALTHCARE (8) =====
const healthcare = [
	{
		name: "Yassine El Amrani — Infirmier Polyvalent",
		field: "healthcare",
		subField: "soins-infirmiers",
		template: "casablanca",
		experienceYears: 4,
		ats: 90,
		descriptionFr:
			"Infirmier polyvalent diplômé d'État, expérience en service de médecine et urgences au CHU.",
		tags: ["Soins infirmiers", "Urgences", "CHU", "Perfusion", "Dossier de soins"],
		data: {
			headline: "Infirmier Polyvalent Diplômé d'État",
			email: "yassine.elamrani@email.ma",
			phone: "+212 6 61 23 45 67",
			location: "Casablanca, Maroc",
			program: "healthcare",
			summary:
				"Infirmier polyvalent diplômé d'État avec 4 ans d'expérience en service de médecine interne et aux urgences. Rigoureux dans l'administration des soins, la surveillance des constantes et la tenue du dossier de soins. Habitué au travail en équipe pluridisciplinaire et à la gestion des situations d'urgence.",
			experience: [
				experienceItem({
					company: "CHU Ibn Rochd",
					position: "Infirmier — Service des Urgences",
					location: "Casablanca",
					period: "Jan. 2022 - Présent",
					description:
						"<ul><li>Prise en charge des patients à l'admission : triage, prise des constantes et orientation.</li><li>Pose de perfusions, administration des traitements et surveillance post-opératoire.</li><li>Tenue rigoureuse du dossier de soins informatisé et transmission aux relèves.</li><li>Assistance aux médecins lors des gestes techniques et des soins d'urgence.</li></ul>",
				}),
				experienceItem({
					company: "Clinique Al Madina",
					position: "Infirmier — Médecine Interne",
					location: "Casablanca",
					period: "Sept. 2020 - Déc. 2021",
					description:
						"<ul><li>Soins quotidiens et suivi des patients hospitalisés en service de médecine.</li><li>Préparation et distribution des médicaments selon les prescriptions.</li><li>Éducation thérapeutique des patients diabétiques et hypertendus.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme d'Infirmier Polyvalent",
					area: "Soins Infirmiers",
					location: "Casablanca",
					period: "2017 - 2020",
					description: "<p>Formation diplômante en soins infirmiers avec stages cliniques en milieu hospitalier.</p>",
				}),
			],
			skills: [
				skillItem("Soins infirmiers", 5, ["Perfusion", "Pansements", "Injections"]),
				skillItem("Surveillance des constantes", 5, ["Tension", "Glycémie", "Saturation"]),
				skillItem("Gestes d'urgence", 4, ["Réanimation de base", "Triage"]),
				skillItem("Dossier de soins informatisé", 4, []),
				skillItem("Hygiène et asepsie", 5, []),
			],
			certifications: [
				certItem({ title: "Gestes et Soins d'Urgence (AFGSU 2)", issuer: "Ministère de la Santé", date: "2021" }),
			],
			internships: [
				internshipItem({
					company: "CHU Ibn Rochd",
					position: "Stagiaire infirmier — Chirurgie",
					supervisor: "Mme. Naima Sahli, Infirmière-chef",
					location: "Casablanca",
					period: "Mars 2020 - Juin 2020",
					type: "end-of-studies",
					tasksPerformed: "<p>Soins pré et post-opératoires, surveillance des drains, préparation du patient au bloc.</p>",
					skillsAcquired: ["Soins post-opératoires", "Asepsie chirurgicale"],
					evaluation: "<p>Très bonne appréciation du maître de stage (note 17/20).</p>",
				}),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Salma Benjelloun — Sage-femme",
		field: "healthcare",
		subField: "maternite",
		template: "rabat",
		experienceYears: 5,
		ats: 91,
		descriptionFr: "Sage-femme diplômée, expérience en salle d'accouchement et suivi de grossesse.",
		tags: ["Sage-femme", "Accouchement", "Suivi de grossesse", "Néonatologie"],
		data: {
			headline: "Sage-femme Diplômée d'État",
			email: "salma.benjelloun@email.ma",
			phone: "+212 6 62 34 56 78",
			location: "Rabat, Maroc",
			program: "healthcare",
			primaryColor: "rgba(8, 145, 178, 1)",
			summary:
				"Sage-femme diplômée d'État avec 5 ans d'expérience en maternité hospitalière. Assure le suivi prénatal, la conduite des accouchements eutociques, les soins au nouveau-né et l'accompagnement des parturientes. Sensible à l'écoute et à la sécurité de la mère et de l'enfant.",
			experience: [
				experienceItem({
					company: "Maternité Les Orangers (CHU Ibn Sina)",
					position: "Sage-femme",
					location: "Rabat",
					period: "Févr. 2021 - Présent",
					description:
						"<ul><li>Conduite des accouchements eutociques et surveillance du travail.</li><li>Consultations prénatales et monitoring fœtal (cardiotocographie).</li><li>Soins immédiats au nouveau-né et accompagnement de l'allaitement.</li><li>Détection des grossesses à risque et orientation vers l'obstétricien.</li></ul>",
				}),
				experienceItem({
					company: "Centre de Santé Yacoub El Mansour",
					position: "Sage-femme — Consultation",
					location: "Rabat",
					period: "Sept. 2019 - Janv. 2021",
					description:
						"<ul><li>Suivi de grossesse et consultations de planification familiale.</li><li>Séances de préparation à la naissance et éducation sanitaire.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Sage-femme",
					area: "Maïeutique",
					location: "Rabat",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Conduite d'accouchement", 5, ["Eutocique", "Surveillance du travail"]),
				skillItem("Monitoring fœtal", 5, ["Cardiotocographie"]),
				skillItem("Soins au nouveau-né", 5, []),
				skillItem("Suivi prénatal", 5, []),
				skillItem("Planification familiale", 4, []),
			],
			certifications: [
				certItem({ title: "Réanimation Néonatale", issuer: "Société Marocaine de Néonatologie", date: "2022" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Hamza Ouazzani — Aide-soignant",
		field: "healthcare",
		subField: "aide-soignant",
		template: "fes",
		experienceYears: 3,
		ats: 86,
		descriptionFr: "Aide-soignant expérimenté en gériatrie et accompagnement des patients dépendants.",
		tags: ["Aide-soignant", "Gériatrie", "Nursing", "Mobilisation"],
		data: {
			headline: "Aide-soignant Qualifié",
			email: "hamza.ouazzani@email.ma",
			phone: "+212 6 63 45 67 89",
			location: "Fès, Maroc",
			program: "healthcare",
			summary:
				"Aide-soignant qualifié avec 3 ans d'expérience auprès de personnes âgées et dépendantes. Assure les soins d'hygiène, le confort, l'aide aux repas et la mobilisation des patients. Patient, bienveillant et attentif au respect de la dignité des personnes.",
			experience: [
				experienceItem({
					company: "EHPAD Dar Al Aman",
					position: "Aide-soignant",
					location: "Fès",
					period: "Mai 2022 - Présent",
					description:
						"<ul><li>Soins d'hygiène et de confort des résidents dépendants.</li><li>Aide à la mobilisation, prévention des escarres et transferts.</li><li>Aide à la prise des repas et surveillance de l'hydratation.</li><li>Observation et transmission des changements d'état aux infirmiers.</li></ul>",
				}),
				experienceItem({
					company: "Clinique Atlas",
					position: "Aide-soignant — Service de Chirurgie",
					location: "Fès",
					period: "Oct. 2021 - Avr. 2022",
					description:
						"<ul><li>Préparation des chambres et installation des patients.</li><li>Aide aux soins de nursing post-opératoires.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme d'Aide-soignant",
					area: "Aide aux soins",
					location: "Fès",
					period: "2019 - 2021",
				}),
			],
			skills: [
				skillItem("Soins d'hygiène et de confort", 5, []),
				skillItem("Mobilisation des patients", 5, ["Transferts", "Prévention escarres"]),
				skillItem("Aide aux repas", 4, []),
				skillItem("Observation clinique", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Imane Tahiri — Technicienne de Laboratoire",
		field: "healthcare",
		subField: "laboratoire",
		template: "marrakech",
		experienceYears: 4,
		ats: 88,
		descriptionFr: "Technicienne de laboratoire d'analyses médicales : prélèvements, hématologie, biochimie.",
		tags: ["Laboratoire", "Analyses médicales", "Hématologie", "Biochimie", "Prélèvements"],
		data: {
			headline: "Technicienne de Laboratoire d'Analyses Médicales",
			email: "imane.tahiri@email.ma",
			phone: "+212 6 64 56 78 90",
			location: "Marrakech, Maroc",
			program: "healthcare",
			primaryColor: "rgba(8, 145, 178, 1)",
			summary:
				"Technicienne de laboratoire d'analyses médicales avec 4 ans d'expérience en hématologie, biochimie et bactériologie. Maîtrise les prélèvements, le contrôle qualité et l'utilisation des automates d'analyse. Rigoureuse dans le respect des procédures et de la traçabilité.",
			experience: [
				experienceItem({
					company: "Laboratoire d'Analyses Médicales Biolab",
					position: "Technicienne de Laboratoire",
					location: "Marrakech",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Réalisation des prélèvements sanguins et préparation des échantillons.</li><li>Analyses d'hématologie, biochimie et sérologie sur automates.</li><li>Contrôle qualité interne et calibration des appareils.</li><li>Saisie et validation technique des résultats dans le SIL.</li></ul>",
				}),
				experienceItem({
					company: "CHU Mohammed VI",
					position: "Technicienne de Laboratoire — Bactériologie",
					location: "Marrakech",
					period: "Janv. 2020 - Févr. 2021",
					description:
						"<ul><li>Cultures bactériennes, antibiogrammes et identification des germes.</li><li>Respect strict des règles de biosécurité (PSM, déchets DASRI).</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien de Laboratoire",
					area: "Biologie médicale",
					location: "Marrakech",
					period: "2017 - 2019",
				}),
			],
			skills: [
				skillItem("Prélèvements sanguins", 5, ["Veineux", "Capillaire"]),
				skillItem("Hématologie", 5, ["NFS", "Coagulation"]),
				skillItem("Biochimie", 4, ["Automates", "Glycémie", "Bilan lipidique"]),
				skillItem("Bactériologie", 4, ["Cultures", "Antibiogramme"]),
				skillItem("Contrôle qualité", 4, []),
			],
			certifications: [
				certItem({ title: "Biosécurité en Laboratoire", issuer: "IMTA", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Othmane Fassi — Technicien en Radiologie",
		field: "healthcare",
		subField: "imagerie-medicale",
		template: "tangier",
		experienceYears: 5,
		ats: 89,
		descriptionFr: "Manipulateur en radiologie : radiographie, scanner, IRM et radioprotection.",
		tags: ["Radiologie", "Scanner", "IRM", "Imagerie médicale", "Radioprotection"],
		data: {
			headline: "Manipulateur en Électroradiologie Médicale",
			email: "othmane.fassi@email.ma",
			phone: "+212 6 65 67 89 01",
			location: "Tanger, Maroc",
			program: "healthcare",
			summary:
				"Manipulateur en électroradiologie médicale avec 5 ans d'expérience en radiographie conventionnelle, scanner et IRM. Maîtrise du positionnement des patients, des protocoles d'acquisition et des règles de radioprotection. Soucieux de la qualité de l'image et de la sécurité du patient.",
			experience: [
				experienceItem({
					company: "Centre d'Imagerie Médicale Al Boughaz",
					position: "Manipulateur en Radiologie",
					location: "Tanger",
					period: "Juin 2020 - Présent",
					description:
						"<ul><li>Réalisation d'examens de radiographie, scanner et IRM.</li><li>Installation et positionnement des patients selon les protocoles.</li><li>Application des règles de radioprotection (patient et personnel).</li><li>Gestion des produits de contraste et surveillance des réactions.</li></ul>",
				}),
				experienceItem({
					company: "Hôpital Mohammed V",
					position: "Manipulateur en Radiologie",
					location: "Tanger",
					period: "Sept. 2018 - Mai 2020",
					description:
						"<ul><li>Radiographie standard aux urgences et au bloc opératoire.</li><li>Contrôle qualité des clichés et archivage PACS.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Manipulateur en Radiologie",
					area: "Imagerie médicale",
					location: "Tanger",
					period: "2015 - 2018",
				}),
			],
			skills: [
				skillItem("Radiographie conventionnelle", 5, []),
				skillItem("Scanner (TDM)", 4, ["Protocoles", "Produits de contraste"]),
				skillItem("IRM", 4, []),
				skillItem("Radioprotection", 5, ["Dosimétrie", "Tablier plombé"]),
				skillItem("PACS / archivage", 4, []),
			],
			certifications: [
				certItem({ title: "Radioprotection des Patients", issuer: "Ministère de la Santé", date: "2019" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Khadija Naciri — Technicienne en Pharmacie",
		field: "healthcare",
		subField: "pharmacie",
		template: "meknes",
		experienceYears: 3,
		ats: 85,
		descriptionFr: "Technicienne en pharmacie : dispensation, gestion des stocks et préparations.",
		tags: ["Pharmacie", "Dispensation", "Gestion des stocks", "Préparations"],
		data: {
			headline: "Technicienne en Pharmacie",
			email: "khadija.naciri@email.ma",
			phone: "+212 6 66 78 90 12",
			location: "Meknès, Maroc",
			program: "healthcare",
			primaryColor: "rgba(8, 145, 178, 1)",
			summary:
				"Technicienne en pharmacie avec 3 ans d'expérience en officine et pharmacie hospitalière. Assure la dispensation des médicaments, la gestion des stocks, les préparations magistrales et le conseil aux patients. Organisée et rigoureuse sur la traçabilité et les dates de péremption.",
			experience: [
				experienceItem({
					company: "Pharmacie Centrale Hamria",
					position: "Technicienne en Pharmacie",
					location: "Meknès",
					period: "Avr. 2022 - Présent",
					description:
						"<ul><li>Dispensation des ordonnances et conseil aux patients.</li><li>Gestion des stocks, commandes et contrôle des péremptions.</li><li>Préparations magistrales sous contrôle du pharmacien.</li></ul>",
				}),
				experienceItem({
					company: "Pharmacie Hospitalière — Hôpital Mohammed V",
					position: "Préparatrice en Pharmacie",
					location: "Meknès",
					period: "Sept. 2021 - Mars 2022",
					description:
						"<ul><li>Préparation et distribution des médicaments aux services.</li><li>Gestion de la pharmacie à usage intérieur (PUI).</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Pharmacie",
					area: "Pharmacie",
					location: "Meknès",
					period: "2019 - 2021",
				}),
			],
			skills: [
				skillItem("Dispensation", 5, ["Ordonnances", "Conseil patient"]),
				skillItem("Gestion des stocks", 5, ["Commandes", "Péremptions"]),
				skillItem("Préparations magistrales", 4, []),
				skillItem("Logiciel d'officine", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Mehdi Berrada — Kinésithérapeute",
		field: "healthcare",
		subField: "reeducation",
		template: "oujda",
		experienceYears: 6,
		ats: 90,
		descriptionFr: "Kinésithérapeute : rééducation fonctionnelle, traumatologie et respiratoire.",
		tags: ["Kinésithérapie", "Rééducation", "Traumatologie", "Massage"],
		data: {
			headline: "Kinésithérapeute Diplômé d'État",
			email: "mehdi.berrada@email.ma",
			phone: "+212 6 67 89 01 23",
			location: "Oujda, Maroc",
			program: "healthcare",
			summary:
				"Kinésithérapeute diplômé d'État avec 6 ans d'expérience en rééducation fonctionnelle, traumatologie et kinésithérapie respiratoire. Élabore des programmes de soins personnalisés et accompagne les patients vers la récupération. À l'écoute et pédagogue.",
			experience: [
				experienceItem({
					company: "Centre de Rééducation Fonctionnelle Al Amal",
					position: "Kinésithérapeute",
					location: "Oujda",
					period: "Janv. 2019 - Présent",
					description:
						"<ul><li>Bilans et rééducation des patients en traumatologie et orthopédie.</li><li>Techniques de massage, mobilisation et renforcement musculaire.</li><li>Kinésithérapie respiratoire et drainage.</li><li>Suivi et adaptation des programmes de rééducation.</li></ul>",
				}),
				experienceItem({
					company: "Cabinet de Kinésithérapie privé",
					position: "Kinésithérapeute",
					location: "Oujda",
					period: "Sept. 2017 - Déc. 2018",
					description: "<ul><li>Prise en charge de patients en rééducation post-opératoire et sportive.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Kinésithérapeute",
					area: "Rééducation et réadaptation",
					location: "Oujda",
					period: "2014 - 2017",
				}),
			],
			skills: [
				skillItem("Rééducation fonctionnelle", 5, ["Traumatologie", "Orthopédie"]),
				skillItem("Massage thérapeutique", 5, []),
				skillItem("Kinésithérapie respiratoire", 4, []),
				skillItem("Électrothérapie", 4, []),
				skillItem("Bilan musculo-articulaire", 5, []),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Nadia El Ghazi — Infirmière en Bloc Opératoire",
		field: "healthcare",
		subField: "bloc-operatoire",
		template: "casablanca",
		experienceYears: 5,
		ats: 91,
		descriptionFr: "Infirmière de bloc opératoire (IBODE) : instrumentation et asepsie chirurgicale.",
		tags: ["Bloc opératoire", "IBODE", "Instrumentation", "Asepsie", "Chirurgie"],
		data: {
			headline: "Infirmière de Bloc Opératoire (IBODE)",
			email: "nadia.elghazi@email.ma",
			phone: "+212 6 68 90 12 34",
			location: "Casablanca, Maroc",
			program: "healthcare",
			summary:
				"Infirmière de bloc opératoire avec 5 ans d'expérience en chirurgie viscérale et orthopédique. Assure l'instrumentation, la circulation au bloc et le respect strict de l'asepsie. Réactive, organisée et rigoureuse face aux exigences du bloc.",
			experience: [
				experienceItem({
					company: "Clinique Chirurgicale Badr",
					position: "Infirmière de Bloc Opératoire",
					location: "Casablanca",
					period: "Févr. 2021 - Présent",
					description:
						"<ul><li>Instrumentation lors d'interventions de chirurgie viscérale et orthopédique.</li><li>Préparation des salles et du matériel chirurgical stérile.</li><li>Comptage des compresses et instruments, gestion de l'asepsie.</li><li>Fonction de circulante et coordination avec l'équipe chirurgicale.</li></ul>",
				}),
				experienceItem({
					company: "CHU Ibn Rochd",
					position: "Infirmière — Bloc Opératoire",
					location: "Casablanca",
					period: "Sept. 2019 - Janv. 2021",
					description: "<ul><li>Aide opératoire et stérilisation du matériel chirurgical.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme d'Infirmier — Spécialité Bloc Opératoire",
					area: "Soins infirmiers de bloc",
					location: "Casablanca",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Instrumentation chirurgicale", 5, []),
				skillItem("Asepsie et stérilisation", 5, []),
				skillItem("Circulation au bloc", 5, []),
				skillItem("Gestion du matériel opératoire", 4, []),
			],
			certifications: [
				certItem({ title: "Hygiène et Asepsie au Bloc Opératoire", issuer: "IMTA", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
];

// ===== INDUSTRIAL (8) =====
const industrial = [
	{
		name: "Anas Bennani — Soudeur MIG/MAG",
		field: "industrial",
		subField: "soudage",
		template: "settat",
		experienceYears: 5,
		ats: 88,
		descriptionFr: "Soudeur qualifié MIG/MAG et TIG, expérience en chantier naval et construction métallique.",
		tags: ["Soudage", "MIG/MAG", "TIG", "Construction métallique", "Lecture de plan"],
		data: {
			headline: "Soudeur Qualifié MIG/MAG - TIG",
			email: "anas.bennani@email.ma",
			phone: "+212 6 70 11 22 33",
			location: "Casablanca, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Soudeur qualifié avec 5 ans d'expérience en soudage MIG/MAG et TIG sur acier et inox. Intervient en chantier naval et construction métallique. Maîtrise la lecture de plans, l'assemblage et le respect des normes de sécurité. Précis, autonome et soucieux de la qualité des cordons.",
			experience: [
				experienceItem({
					company: "Chantier Naval de Casablanca",
					position: "Soudeur",
					location: "Casablanca",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Soudage MIG/MAG et TIG de structures métalliques navales en acier et inox.</li><li>Lecture de plans et préparation des pièces (chanfreinage, pointage).</li><li>Contrôle visuel des cordons et reprise des défauts.</li><li>Respect strict des consignes de sécurité et du port des EPI.</li></ul>",
				}),
				experienceItem({
					company: "Métal Construction SARL",
					position: "Soudeur-Assembleur",
					location: "Mohammedia",
					period: "Sept. 2019 - Févr. 2021",
					description:
						"<ul><li>Assemblage et soudage de charpentes métalliques et garde-corps.</li><li>Découpe au chalumeau et meulage des soudures.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Soudage",
					area: "Soudage et construction métallique",
					location: "Casablanca",
					period: "2017 - 2019",
				}),
			],
			skills: [
				skillItem("Soudage MIG/MAG", 5, ["Acier", "Inox"]),
				skillItem("Soudage TIG", 4, ["Inox", "Aluminium"]),
				skillItem("Lecture de plans", 4, []),
				skillItem("Meulage et finition", 5, []),
				skillItem("Sécurité et EPI", 5, []),
			],
			certifications: [
				certItem({ title: "Qualification Soudeur ISO 9606-1", issuer: "Bureau Veritas", date: "2021" }),
			],
			internships: [
				internshipItem({
					company: "Chantier Naval de Casablanca",
					position: "Stagiaire soudeur",
					supervisor: "M. Driss Alami, Chef d'atelier",
					location: "Casablanca",
					period: "Avr. 2019 - Juin 2019",
					type: "end-of-studies",
					tasksPerformed: "<p>Soudage de pièces de structure, préparation et pointage sous supervision.</p>",
					skillsAcquired: ["Soudage en position", "Lecture de plan"],
					evaluation: "<p>Bonne maîtrise technique, sérieux (note 16/20).</p>",
				}),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Reda Chraibi — Cariste CACES",
		field: "industrial",
		subField: "logistique",
		template: "jadida",
		experienceYears: 4,
		ats: 84,
		descriptionFr: "Cariste titulaire du CACES, expérience en entrepôt logistique et gestion de stock.",
		tags: ["Cariste", "CACES", "Logistique", "Chariot élévateur", "Gestion de stock"],
		data: {
			headline: "Cariste — Conducteur de Chariot Élévateur (CACES)",
			email: "reda.chraibi@email.ma",
			phone: "+212 6 71 22 33 44",
			location: "Casablanca, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Cariste titulaire du CACES catégories 1-3-5 avec 4 ans d'expérience en entrepôt logistique. Assure le chargement, le déchargement, le stockage et la préparation de commandes. Rigoureux sur la sécurité, la manutention et la gestion informatisée des stocks (WMS).",
			experience: [
				experienceItem({
					company: "Marsa Maroc — Plateforme Logistique",
					position: "Cariste",
					location: "Casablanca",
					period: "Janv. 2022 - Présent",
					description:
						"<ul><li>Conduite de chariots élévateurs (frontal et latéral) pour le stockage en hauteur.</li><li>Chargement et déchargement des camions et conteneurs.</li><li>Préparation de commandes et gestion des emplacements via WMS.</li><li>Contrôle de l'état du matériel et respect des règles de sécurité.</li></ul>",
				}),
				experienceItem({
					company: "Label'Vie — Entrepôt Central",
					position: "Cariste-Préparateur",
					location: "Casablanca",
					period: "Sept. 2020 - Déc. 2021",
					description:
						"<ul><li>Réception, contrôle et rangement des marchandises.</li><li>Préparation des commandes pour les points de vente.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme en Logistique et Manutention",
					area: "Logistique",
					location: "Casablanca",
					period: "2018 - 2020",
				}),
			],
			skills: [
				skillItem("Conduite de chariot élévateur", 5, ["CACES 1", "CACES 3", "CACES 5"]),
				skillItem("Préparation de commandes", 5, []),
				skillItem("Gestion de stock (WMS)", 4, []),
				skillItem("Manutention sécurisée", 5, []),
				skillItem("Inventaire", 4, []),
			],
			certifications: [
				certItem({ title: "CACES R489 Catégories 1-3-5", issuer: "Organisme agréé", date: "2021" }),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Youssef Idrissi — Technicien de Maintenance Industrielle",
		field: "industrial",
		subField: "maintenance",
		template: "settat",
		experienceYears: 6,
		ats: 89,
		descriptionFr: "Technicien de maintenance industrielle : mécanique, électrotechnique et préventif.",
		tags: ["Maintenance industrielle", "Mécanique", "Électrotechnique", "GMAO", "Dépannage"],
		data: {
			headline: "Technicien de Maintenance Industrielle",
			email: "youssef.idrissi@email.ma",
			phone: "+212 6 72 33 44 55",
			location: "Jorf Lasfar, El Jadida, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Technicien de maintenance industrielle avec 6 ans d'expérience en milieu industriel lourd. Assure la maintenance préventive et curative des équipements mécaniques, électriques et hydrauliques. Utilise la GMAO et participe à l'amélioration de la fiabilité des lignes de production.",
			experience: [
				experienceItem({
					company: "OCP Group — Site de Jorf Lasfar",
					position: "Technicien de Maintenance",
					location: "El Jadida",
					period: "Mai 2020 - Présent",
					description:
						"<ul><li>Maintenance préventive et curative des équipements de production (pompes, convoyeurs, réducteurs).</li><li>Diagnostic des pannes mécaniques, électriques et hydrauliques.</li><li>Saisie et suivi des interventions dans la GMAO.</li><li>Participation aux arrêts techniques et aux travaux d'amélioration.</li></ul>",
				}),
				experienceItem({
					company: "Cimenterie Lafarge",
					position: "Agent de Maintenance Mécanique",
					location: "Settat",
					period: "Sept. 2018 - Avr. 2020",
					description:
						"<ul><li>Entretien des équipements de broyage et de transport.</li><li>Remplacement des roulements, courroies et organes d'usure.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Maintenance Industrielle",
					area: "Maintenance des systèmes industriels",
					location: "El Jadida",
					period: "2015 - 2018",
				}),
			],
			skills: [
				skillItem("Maintenance mécanique", 5, ["Roulements", "Transmission", "Hydraulique"]),
				skillItem("Électrotechnique", 4, ["Moteurs", "Armoires électriques"]),
				skillItem("Diagnostic de panne", 5, []),
				skillItem("GMAO", 4, []),
				skillItem("Lecture de schémas", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Hicham Saidi — Électricien Industriel",
		field: "industrial",
		subField: "electricite",
		template: "settat",
		experienceYears: 5,
		ats: 87,
		descriptionFr: "Électricien industriel : armoires, automatismes, installation et dépannage BT/HT.",
		tags: ["Électricité industrielle", "Armoires électriques", "Automatisme", "Câblage", "BT/HT"],
		data: {
			headline: "Électricien Industriel",
			email: "hicham.saidi@email.ma",
			phone: "+212 6 73 44 55 66",
			location: "Tanger, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Électricien industriel avec 5 ans d'expérience en installation et maintenance d'équipements électriques basse et haute tension. Réalise le câblage d'armoires, le raccordement de moteurs et le dépannage des automatismes. Habilité électrique et rigoureux sur la consignation.",
			experience: [
				experienceItem({
					company: "Renault Tanger Méditerranée",
					position: "Électricien Industriel",
					location: "Tanger",
					period: "Févr. 2021 - Présent",
					description:
						"<ul><li>Câblage et raccordement d'armoires électriques et de coffrets.</li><li>Installation et dépannage de moteurs et variateurs de vitesse.</li><li>Maintenance des automatismes et capteurs sur lignes d'assemblage.</li><li>Application des procédures de consignation/déconsignation.</li></ul>",
				}),
				experienceItem({
					company: "Entreprise d'Installation Électrique Nour",
					position: "Électricien",
					location: "Tanger",
					period: "Oct. 2019 - Janv. 2021",
					description:
						"<ul><li>Installation électrique de bâtiments industriels et tertiaires.</li><li>Tirage de câbles, pose de chemins de câbles et raccordements.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Électricité Industrielle",
					area: "Électrotechnique",
					location: "Tanger",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Câblage d'armoires", 5, []),
				skillItem("Moteurs et variateurs", 4, []),
				skillItem("Automatismes industriels", 4, ["Capteurs", "Relais"]),
				skillItem("Habilitation électrique", 5, ["BT", "HT", "Consignation"]),
				skillItem("Lecture de schémas électriques", 5, []),
			],
			certifications: [
				certItem({ title: "Habilitation Électrique B2V / BR / H0", issuer: "Organisme agréé", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Karim Lahlou — Technicien en Froid et Climatisation",
		field: "industrial",
		subField: "froid-climatisation",
		template: "jadida",
		experienceYears: 4,
		ats: 85,
		descriptionFr: "Technicien frigoriste : installation et maintenance de systèmes de froid et climatisation.",
		tags: ["Froid", "Climatisation", "Frigoriste", "Maintenance", "Fluides frigorigènes"],
		data: {
			headline: "Technicien en Froid et Climatisation",
			email: "karim.lahlou@email.ma",
			phone: "+212 6 74 55 66 77",
			location: "Agadir, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Technicien frigoriste avec 4 ans d'expérience en installation et maintenance de systèmes de froid commercial, industriel et de climatisation. Maîtrise la manipulation des fluides frigorigènes, le diagnostic de pannes et la mise en service des installations. Mobile et autonome sur chantier.",
			experience: [
				experienceItem({
					company: "ColdChain Maroc",
					position: "Technicien Frigoriste",
					location: "Agadir",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Installation et maintenance de chambres froides et de groupes frigorifiques.</li><li>Diagnostic et dépannage des systèmes de froid commercial.</li><li>Contrôle d'étanchéité et recharge en fluides frigorigènes.</li><li>Mise en service et réglage des installations de climatisation.</li></ul>",
				}),
				experienceItem({
					company: "Société de Climatisation Atlas",
					position: "Technicien Climatisation",
					location: "Agadir",
					period: "Sept. 2020 - Févr. 2021",
					description:
						"<ul><li>Pose et entretien de systèmes de climatisation (split, VRV).</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Froid et Climatisation",
					area: "Froid industriel et climatisation",
					location: "Agadir",
					period: "2018 - 2020",
				}),
			],
			skills: [
				skillItem("Installation de systèmes de froid", 5, ["Chambres froides", "Groupes frigorifiques"]),
				skillItem("Climatisation", 5, ["Split", "VRV"]),
				skillItem("Manipulation des fluides frigorigènes", 4, []),
				skillItem("Diagnostic de panne", 4, []),
				skillItem("Brasage", 4, []),
			],
			certifications: [
				certItem({ title: "Attestation de Capacité Fluides Frigorigènes", issuer: "Organisme agréé", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Tarik Mansouri — Tourneur-Fraiseur",
		field: "industrial",
		subField: "usinage",
		template: "settat",
		experienceYears: 5,
		ats: 86,
		descriptionFr: "Tourneur-fraiseur sur machines conventionnelles et commande numérique (CNC).",
		tags: ["Usinage", "Tournage", "Fraisage", "CNC", "Métrologie"],
		data: {
			headline: "Tourneur-Fraiseur sur Commande Numérique (CNC)",
			email: "tarik.mansouri@email.ma",
			phone: "+212 6 75 66 77 88",
			location: "Casablanca, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Tourneur-fraiseur avec 5 ans d'expérience sur machines conventionnelles et à commande numérique. Réalise des pièces mécaniques de précision à partir de plans, programme les machines CNC et contrôle la qualité par métrologie. Minutieux et soucieux du respect des tolérances.",
			experience: [
				experienceItem({
					company: "Atelier de Mécanique de Précision MecaPro",
					position: "Tourneur-Fraiseur CNC",
					location: "Casablanca",
					period: "Avr. 2021 - Présent",
					description:
						"<ul><li>Usinage de pièces mécaniques sur tours et fraiseuses CNC.</li><li>Programmation et réglage des machines à commande numérique.</li><li>Lecture de plans et contrôle dimensionnel (pied à coulisse, micromètre).</li><li>Affûtage des outils et maintenance de premier niveau.</li></ul>",
				}),
				experienceItem({
					company: "Sous-traitance Industrielle Bouregreg",
					position: "Tourneur",
					location: "Casablanca",
					period: "Sept. 2019 - Mars 2021",
					description:
						"<ul><li>Tournage conventionnel de pièces de série et unitaires.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Usinage",
					area: "Productique mécanique",
					location: "Casablanca",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Tournage CNC", 5, []),
				skillItem("Fraisage CNC", 4, []),
				skillItem("Programmation ISO", 4, []),
				skillItem("Lecture de plans", 5, []),
				skillItem("Métrologie", 5, ["Micromètre", "Pied à coulisse"]),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Soufiane Rami — Plombier-Chauffagiste",
		field: "industrial",
		subField: "plomberie",
		template: "jadida",
		experienceYears: 4,
		ats: 83,
		descriptionFr: "Plombier-chauffagiste : installation sanitaire, chauffage et dépannage.",
		tags: ["Plomberie", "Chauffage", "Sanitaire", "Soudure cuivre", "Dépannage"],
		data: {
			headline: "Plombier-Chauffagiste",
			email: "soufiane.rami@email.ma",
			phone: "+212 6 76 77 88 99",
			location: "Rabat, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Plombier-chauffagiste avec 4 ans d'expérience en installation sanitaire, réseaux de chauffage et dépannage. Réalise la pose de canalisations, le raccordement d'appareils et l'entretien des chaudières. Soigneux, autonome et orienté satisfaction client.",
			experience: [
				experienceItem({
					company: "Entreprise de Plomberie Al Manar",
					position: "Plombier-Chauffagiste",
					location: "Rabat",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Installation de réseaux d'eau, sanitaires et de chauffage.</li><li>Soudure cuivre, raccordement de chaudières et chauffe-eau.</li><li>Dépannage des fuites et entretien des installations.</li><li>Lecture de plans et implantation des réseaux.</li></ul>",
				}),
				experienceItem({
					company: "Société de Bâtiment Chellah",
					position: "Aide-Plombier",
					location: "Rabat",
					period: "Sept. 2020 - Févr. 2021",
					description:
						"<ul><li>Pose de canalisations et préparation des chantiers.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Plomberie-Chauffage",
					area: "Plomberie et génie climatique",
					location: "Rabat",
					period: "2018 - 2020",
				}),
			],
			skills: [
				skillItem("Installation sanitaire", 5, []),
				skillItem("Réseaux de chauffage", 4, []),
				skillItem("Soudure cuivre", 4, []),
				skillItem("Dépannage", 5, []),
				skillItem("Lecture de plans", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Walid Berrada — Mécanicien Automobile",
		field: "industrial",
		subField: "mecanique-auto",
		template: "settat",
		experienceYears: 5,
		ats: 84,
		descriptionFr: "Mécanicien automobile : diagnostic, entretien et réparation toutes marques.",
		tags: ["Mécanique automobile", "Diagnostic", "Réparation", "Entretien", "Électronique embarquée"],
		data: {
			headline: "Mécanicien Automobile",
			email: "walid.berrada@email.ma",
			phone: "+212 6 77 88 99 00",
			location: "Casablanca, Maroc",
			program: "industrial",
			primaryColor: "rgba(217, 119, 6, 1)",
			summary:
				"Mécanicien automobile avec 5 ans d'expérience en entretien et réparation toutes marques. Réalise le diagnostic électronique, les révisions, le remplacement d'organes mécaniques et la recherche de pannes. Méthodique, fiable et soucieux de la satisfaction du client.",
			experience: [
				experienceItem({
					company: "Garage Auto Service Plus",
					position: "Mécanicien Automobile",
					location: "Casablanca",
					period: "Janv. 2021 - Présent",
					description:
						"<ul><li>Diagnostic électronique à l'aide de la valise et recherche de pannes.</li><li>Révisions, vidanges, remplacement de freins, embrayage et distribution.</li><li>Réparation des systèmes mécaniques (moteur, transmission, suspension).</li><li>Conseil client et établissement des devis.</li></ul>",
				}),
				experienceItem({
					company: "Concession Automobile Dacia",
					position: "Mécanicien — Atelier après-vente",
					location: "Casablanca",
					period: "Sept. 2019 - Déc. 2020",
					description:
						"<ul><li>Entretien périodique et interventions sous garantie constructeur.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Mécanique Automobile",
					area: "Maintenance des véhicules",
					location: "Casablanca",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Diagnostic électronique", 4, ["Valise", "OBD"]),
				skillItem("Réparation moteur", 5, []),
				skillItem("Système de freinage", 5, []),
				skillItem("Distribution et embrayage", 4, []),
				skillItem("Entretien périodique", 5, []),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
];

// ===== HSE (8) =====
const hse = [
	{
		name: "Oussama Kabbaj — Technicien HSE",
		field: "hse",
		subField: "hse-industrie",
		template: "taza",
		experienceYears: 5,
		ats: 90,
		descriptionFr: "Technicien Hygiène Sécurité Environnement en milieu industriel (OCP/chimie).",
		tags: ["HSE", "Sécurité", "Prévention des risques", "ISO 45001", "Industrie"],
		data: {
			headline: "Technicien Hygiène Sécurité Environnement (HSE)",
			email: "oussama.kabbaj@email.ma",
			phone: "+212 6 80 11 22 33",
			location: "Safi, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Technicien HSE avec 5 ans d'expérience en milieu industriel chimique. Anime la prévention des risques, réalise les analyses de risques, audite la sécurité des installations et forme le personnel. Familier des référentiels ISO 45001 et ISO 14001. Rigoureux et force de proposition sur l'amélioration continue.",
			experience: [
				experienceItem({
					company: "OCP Group — Pôle Chimie Safi",
					position: "Technicien HSE",
					location: "Safi",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Analyse des risques (EvRP) et mise à jour du document unique.</li><li>Réalisation d'audits sécurité et inspections terrain.</li><li>Animation des causeries sécurité et formations aux EPI.</li><li>Suivi des plans d'action et des indicateurs (taux de fréquence/gravité).</li><li>Gestion des permis de travail et des interventions à risque.</li></ul>",
				}),
				experienceItem({
					company: "Société Industrielle Maghrébine",
					position: "Animateur Sécurité",
					location: "Safi",
					period: "Sept. 2019 - Févr. 2021",
					description:
						"<ul><li>Suivi des accidents du travail et analyse des causes (arbre des causes).</li><li>Sensibilisation du personnel aux consignes de sécurité.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Hygiène, Sécurité et Environnement",
					area: "Hygiène Sécurité Environnement",
					location: "Safi",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Analyse des risques (EvRP)", 5, ["Document unique", "AMDEC"]),
				skillItem("Audit sécurité", 4, ["ISO 45001"]),
				skillItem("Prévention des risques", 5, []),
				skillItem("Gestion des permis de travail", 4, []),
				skillItem("Formation du personnel", 4, []),
			],
			certifications: [
				certItem({ title: "Auditeur Interne ISO 45001", issuer: "Bureau Veritas", date: "2021" }),
			],
			internships: [
				internshipItem({
					company: "OCP Group — Safi",
					position: "Stagiaire HSE",
					supervisor: "M. Said Bennis, Responsable HSE",
					location: "Safi",
					period: "Avr. 2019 - Juin 2019",
					type: "end-of-studies",
					tasksPerformed: "<p>Participation aux audits sécurité, mise à jour des analyses de risques et causeries.</p>",
					skillsAcquired: ["Audit terrain", "Analyse de risques"],
					evaluation: "<p>Excellente implication, autonomie remarquée (note 18/20).</p>",
				}),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Imane Sabri — Animatrice QHSE",
		field: "hse",
		subField: "qhse",
		template: "taza",
		experienceYears: 4,
		ats: 89,
		descriptionFr: "Animatrice QHSE : qualité, sécurité, environnement et systèmes de management intégrés.",
		tags: ["QHSE", "Qualité", "ISO 9001", "ISO 14001", "Système de management"],
		data: {
			headline: "Animatrice QHSE (Qualité - Hygiène - Sécurité - Environnement)",
			email: "imane.sabri@email.ma",
			phone: "+212 6 81 22 33 44",
			location: "Tanger, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Animatrice QHSE avec 4 ans d'expérience dans l'industrie automobile. Déploie et anime les systèmes de management intégrés (ISO 9001, 14001, 45001), réalise les audits internes et pilote les plans d'action. Méthodique, rigoureuse et orientée amélioration continue.",
			experience: [
				experienceItem({
					company: "Équipementier Automobile (Zone Franche Tanger)",
					position: "Animatrice QHSE",
					location: "Tanger",
					period: "Févr. 2021 - Présent",
					description:
						"<ul><li>Animation du système de management intégré QHSE.</li><li>Réalisation d'audits internes et suivi des non-conformités.</li><li>Analyse des risques sécurité et environnementaux.</li><li>Pilotage des indicateurs QHSE et des revues de direction.</li></ul>",
				}),
				experienceItem({
					company: "Industrie Agroalimentaire du Nord",
					position: "Assistante Qualité",
					location: "Tanger",
					period: "Sept. 2019 - Janv. 2021",
					description:
						"<ul><li>Contrôle qualité et suivi des plans HACCP.</li><li>Gestion documentaire du système qualité.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien QHSE",
					area: "Qualité Hygiène Sécurité Environnement",
					location: "Tanger",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Systèmes de management intégrés", 5, ["ISO 9001", "ISO 14001", "ISO 45001"]),
				skillItem("Audit interne", 4, []),
				skillItem("Gestion documentaire", 5, []),
				skillItem("Analyse des risques", 4, []),
				skillItem("Amélioration continue", 4, ["PDCA", "5S"]),
			],
			certifications: [
				certItem({ title: "Auditeur Interne QHSE (ISO 9001/14001/45001)", issuer: "AFNOR", date: "2021" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Mohamed Alaoui — Technicien Environnement",
		field: "hse",
		subField: "environnement",
		template: "taza",
		experienceYears: 4,
		ats: 87,
		descriptionFr: "Technicien environnement : gestion des déchets, traitement des eaux et conformité.",
		tags: ["Environnement", "Gestion des déchets", "Traitement des eaux", "ISO 14001"],
		data: {
			headline: "Technicien Environnement",
			email: "mohamed.alaoui@email.ma",
			phone: "+212 6 82 33 44 55",
			location: "Mohammedia, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Technicien environnement avec 4 ans d'expérience dans l'industrie. Assure la gestion des déchets industriels, le suivi du traitement des eaux et la conformité réglementaire environnementale. Réalise les prélèvements et les analyses, et participe au système de management environnemental ISO 14001.",
			experience: [
				experienceItem({
					company: "Raffinerie / Site Industriel SAMIR",
					position: "Technicien Environnement",
					location: "Mohammedia",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Gestion et traçabilité des déchets industriels (dangereux et banals).</li><li>Suivi des stations de traitement des eaux et des rejets.</li><li>Prélèvements et analyses de conformité (air, eau).</li><li>Veille réglementaire et préparation des audits environnementaux.</li></ul>",
				}),
				experienceItem({
					company: "Bureau d'Études Environnement Vert",
					position: "Technicien — Études d'impact",
					location: "Casablanca",
					period: "Sept. 2019 - Févr. 2021",
					description:
						"<ul><li>Collecte de données pour les études d'impact environnemental.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Environnement",
					area: "Gestion de l'environnement",
					location: "Mohammedia",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Gestion des déchets", 5, ["Tri", "Traçabilité", "DASRI"]),
				skillItem("Traitement des eaux", 4, ["STEP", "Rejets"]),
				skillItem("Veille réglementaire", 4, []),
				skillItem("Prélèvements et analyses", 4, []),
				skillItem("Système ISO 14001", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Fatima Zahra Idrissi — Préventeur Sécurité Chantier",
		field: "hse",
		subField: "securite-chantier",
		template: "taza",
		experienceYears: 5,
		ats: 88,
		descriptionFr: "Préventeur sécurité sur chantiers BTP : coordination, prévention et conformité.",
		tags: ["Sécurité chantier", "BTP", "Prévention", "Coordination SPS", "EPI"],
		data: {
			headline: "Préventeur Sécurité Chantier (BTP)",
			email: "fatimazahra.idrissi@email.ma",
			phone: "+212 6 83 44 55 66",
			location: "Casablanca, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Préventeur sécurité avec 5 ans d'expérience sur chantiers de construction. Veille au respect des règles de sécurité, anime les accueils sécurité, contrôle le port des EPI et coordonne la prévention des risques chantier. Présente sur le terrain, réactive et pédagogue.",
			experience: [
				experienceItem({
					company: "Groupe de BTP TGCC",
					position: "Préventeur Sécurité Chantier",
					location: "Casablanca",
					period: "Janv. 2021 - Présent",
					description:
						"<ul><li>Accueil sécurité des nouveaux arrivants et sous-traitants.</li><li>Inspections quotidiennes du chantier et levée des situations dangereuses.</li><li>Contrôle des EPI, échafaudages, travaux en hauteur et levage.</li><li>Analyse des accidents et rédaction des plans de prévention.</li></ul>",
				}),
				experienceItem({
					company: "Entreprise de Construction Atlas",
					position: "Agent de Prévention",
					location: "Casablanca",
					period: "Sept. 2019 - Déc. 2020",
					description:
						"<ul><li>Surveillance du respect des consignes de sécurité sur chantier.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Sécurité du Travail",
					area: "Prévention des risques professionnels",
					location: "Casablanca",
					period: "2016 - 2019",
				}),
			],
			skills: [
				skillItem("Prévention des risques chantier", 5, ["Travaux en hauteur", "Levage"]),
				skillItem("Plan de prévention", 4, []),
				skillItem("Accueil et formation sécurité", 5, []),
				skillItem("Contrôle des EPI", 5, []),
				skillItem("Analyse d'accident", 4, ["Arbre des causes"]),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Adil Bennis — Technicien Sécurité Incendie",
		field: "hse",
		subField: "securite-incendie",
		template: "taza",
		experienceYears: 4,
		ats: 86,
		descriptionFr: "Technicien sécurité incendie : prévention, moyens de secours et plans d'évacuation.",
		tags: ["Sécurité incendie", "SSIAP", "Prévention", "Évacuation", "Extincteurs"],
		data: {
			headline: "Technicien Sécurité Incendie",
			email: "adil.bennis@email.ma",
			phone: "+212 6 84 55 66 77",
			location: "Rabat, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Technicien sécurité incendie avec 4 ans d'expérience en établissements recevant du public et sites industriels. Assure la maintenance des moyens de secours, la prévention du risque incendie, les exercices d'évacuation et la sensibilisation du personnel. Vigilant et réactif.",
			experience: [
				experienceItem({
					company: "Centre Commercial Mega Mall",
					position: "Technicien Sécurité Incendie",
					location: "Rabat",
					period: "Févr. 2021 - Présent",
					description:
						"<ul><li>Surveillance et maintenance des systèmes de détection incendie (SSI).</li><li>Contrôle des extincteurs, RIA et issues de secours.</li><li>Organisation des exercices d'évacuation et formation du personnel.</li><li>Rédaction des registres de sécurité et levée des observations.</li></ul>",
				}),
				experienceItem({
					company: "Site Industriel Pharmaceutique",
					position: "Agent de Sécurité Incendie",
					location: "Rabat",
					period: "Sept. 2019 - Janv. 2021",
					description:
						"<ul><li>Rondes de sécurité et application des consignes incendie.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Sécurité Incendie",
					area: "Sécurité incendie et secours",
					location: "Rabat",
					period: "2017 - 2019",
				}),
			],
			skills: [
				skillItem("Prévention du risque incendie", 5, []),
				skillItem("Maintenance des moyens de secours", 4, ["Extincteurs", "RIA", "SSI"]),
				skillItem("Exercices d'évacuation", 5, []),
				skillItem("Registre de sécurité", 4, []),
				skillItem("Premiers secours (SST)", 4, []),
			],
			certifications: [
				certItem({ title: "Sauveteur Secouriste du Travail (SST)", issuer: "Organisme agréé", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH)],
		},
	},
	{
		name: "Sara Mouline — Technicienne Hygiène Hospitalière",
		field: "hse",
		subField: "hygiene-hospitaliere",
		template: "taza",
		experienceYears: 4,
		ats: 88,
		descriptionFr: "Technicienne hygiène hospitalière : prévention des infections et bio-nettoyage.",
		tags: ["Hygiène hospitalière", "Prévention des infections", "Bio-nettoyage", "Stérilisation"],
		data: {
			headline: "Technicienne en Hygiène Hospitalière",
			email: "sara.mouline@email.ma",
			phone: "+212 6 85 66 77 88",
			location: "Casablanca, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Technicienne en hygiène hospitalière avec 4 ans d'expérience en établissement de santé. Met en œuvre la prévention des infections associées aux soins, contrôle le bio-nettoyage, gère les déchets DASRI et forme le personnel aux bonnes pratiques d'hygiène. Rigoureuse et soucieuse de la sécurité des patients.",
			experience: [
				experienceItem({
					company: "Clinique Internationale Anfa",
					position: "Technicienne Hygiène Hospitalière",
					location: "Casablanca",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Contrôle des protocoles de bio-nettoyage et d'hygiène des locaux.</li><li>Prévention des infections nosocomiales et surveillance des indicateurs.</li><li>Gestion des déchets d'activités de soins (DASRI).</li><li>Formation du personnel aux précautions standard et à l'hygiène des mains.</li></ul>",
				}),
				experienceItem({
					company: "CHU Ibn Rochd",
					position: "Agent d'Hygiène Hospitalière",
					location: "Casablanca",
					period: "Sept. 2019 - Févr. 2021",
					description:
						"<ul><li>Application des procédures de désinfection et de stérilisation.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien en Hygiène Hospitalière",
					area: "Hygiène et prévention des infections",
					location: "Casablanca",
					period: "2017 - 2019",
				}),
			],
			skills: [
				skillItem("Prévention des infections", 5, ["Précautions standard", "Hygiène des mains"]),
				skillItem("Bio-nettoyage", 5, []),
				skillItem("Gestion des DASRI", 4, []),
				skillItem("Stérilisation", 4, []),
				skillItem("Formation du personnel", 4, []),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Younes Harrak — Coordinateur HSE Logistique",
		field: "hse",
		subField: "hse-logistique",
		template: "taza",
		experienceYears: 6,
		ats: 89,
		descriptionFr: "Coordinateur HSE en logistique et entreposage : sécurité des flux et manutention.",
		tags: ["HSE", "Logistique", "Sécurité", "Manutention", "Prévention des risques"],
		data: {
			headline: "Coordinateur HSE — Logistique et Entreposage",
			email: "younes.harrak@email.ma",
			phone: "+212 6 86 77 88 99",
			location: "Casablanca, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Coordinateur HSE avec 6 ans d'expérience dans le secteur logistique. Pilote la sécurité des entrepôts, la prévention des risques de manutention et la circulation des engins. Anime les formations sécurité et assure la conformité réglementaire. Leader de terrain et moteur de la culture sécurité.",
			experience: [
				experienceItem({
					company: "Plateforme Logistique Mediterranean",
					position: "Coordinateur HSE",
					location: "Casablanca",
					period: "Janv. 2020 - Présent",
					description:
						"<ul><li>Pilotage de la politique HSE sur la plateforme logistique.</li><li>Prévention des risques liés à la manutention et aux engins (cariste, quais).</li><li>Animation des formations sécurité et des audits internes.</li><li>Suivi des indicateurs (TF, TG) et des plans d'action correctifs.</li><li>Gestion des situations d'urgence et des plans d'évacuation.</li></ul>",
				}),
				experienceItem({
					company: "Société de Transport et Distribution",
					position: "Animateur Sécurité",
					location: "Casablanca",
					period: "Sept. 2017 - Déc. 2019",
					description:
						"<ul><li>Sensibilisation des chauffeurs et manutentionnaires à la sécurité.</li><li>Suivi des accidents et analyse des causes.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien HSE",
					area: "Hygiène Sécurité Environnement",
					location: "Casablanca",
					period: "2014 - 2017",
				}),
			],
			skills: [
				skillItem("Sécurité en entrepôt", 5, ["Manutention", "Circulation des engins"]),
				skillItem("Prévention des risques", 5, []),
				skillItem("Formation sécurité", 5, []),
				skillItem("Audit interne", 4, []),
				skillItem("Plans d'urgence", 4, []),
			],
			certifications: [
				certItem({ title: "Formation de Formateur Sécurité", issuer: "Organisme agréé", date: "2019" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
	{
		name: "Ilham Berrada — Technicienne Risques Chimiques",
		field: "hse",
		subField: "risques-chimiques",
		template: "taza",
		experienceYears: 4,
		ats: 87,
		descriptionFr: "Technicienne risques chimiques : prévention, FDS, stockage et exposition.",
		tags: ["Risques chimiques", "FDS", "Prévention", "Stockage produits dangereux", "HSE"],
		data: {
			headline: "Technicienne Prévention des Risques Chimiques",
			email: "ilham.berrada@email.ma",
			phone: "+212 6 87 88 99 00",
			location: "Jorf Lasfar, El Jadida, Maroc",
			program: "hse",
			primaryColor: "rgba(30, 64, 175, 1)",
			summary:
				"Technicienne spécialisée en prévention des risques chimiques avec 4 ans d'expérience en industrie chimique. Gère les fiches de données de sécurité (FDS), évalue l'exposition, contrôle le stockage des produits dangereux et forme le personnel. Méthodique et attentive à la conformité réglementaire (REACH, SGH).",
			experience: [
				experienceItem({
					company: "OCP Group — Pôle Chimie Jorf Lasfar",
					position: "Technicienne Risques Chimiques",
					location: "El Jadida",
					period: "Mars 2021 - Présent",
					description:
						"<ul><li>Gestion et mise à jour des fiches de données de sécurité (FDS).</li><li>Évaluation du risque chimique et de l'exposition des opérateurs.</li><li>Contrôle du stockage et de la compatibilité des produits dangereux.</li><li>Formation du personnel à la manipulation et au port des EPI adaptés.</li></ul>",
				}),
				experienceItem({
					company: "Industrie Chimique du Littoral",
					position: "Assistante HSE",
					location: "El Jadida",
					period: "Sept. 2019 - Févr. 2021",
					description:
						"<ul><li>Suivi des inventaires de produits chimiques et de l'étiquetage SGH.</li></ul>",
				}),
			],
			education: [
				educationItem({
					school: "Institut Médi Technology Avicenne (IMTA)",
					degree: "Diplôme de Technicien HSE — Risques Chimiques",
					area: "Prévention des risques chimiques",
					location: "El Jadida",
					period: "2017 - 2019",
				}),
			],
			skills: [
				skillItem("Gestion des FDS", 5, ["SGH", "Étiquetage"]),
				skillItem("Évaluation du risque chimique", 4, []),
				skillItem("Stockage produits dangereux", 4, ["Compatibilité", "Rétention"]),
				skillItem("Réglementation REACH/SGH", 4, []),
				skillItem("Formation du personnel", 4, []),
			],
			certifications: [
				certItem({ title: "Prévention du Risque Chimique", issuer: "IMTA", date: "2020" }),
			],
			languages: [li(ARABIC), li(FRENCH), li(ENGLISH)],
		},
	},
];

const ALL = [...healthcare, ...industrial, ...hse];

// ---------- Insert (idempotent on name) ----------

async function main() {
	const client = new Client({ connectionString: DATABASE_URL });
	await client.connect();
	console.log("Connected to PostgreSQL.");

	let inserted = 0;
	let skipped = 0;

	for (const cv of ALL) {
		const resumeData = buildResumeData({ name: cv.name, template: cv.template, ...cv.data });
		const nameFr = cv.name; // already French
		const res = await client.query(
			`INSERT INTO resume_gallery
				(name, name_fr, field, sub_field, experience_years, template_name, language, description, description_fr, resume_data, tags, ats_score, is_featured, is_active)
			 SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
			 WHERE NOT EXISTS (SELECT 1 FROM resume_gallery WHERE name = $1)
			 RETURNING id`,
			[
				cv.name,
				nameFr,
				cv.field,
				cv.subField ?? null,
				cv.experienceYears ?? 0,
				cv.template,
				"fr",
				cv.descriptionFr,
				cv.descriptionFr,
				JSON.stringify(resumeData),
				cv.tags ?? [],
				cv.ats ?? 85,
				false,
				true,
			],
		);
		if (res.rowCount > 0) {
			inserted++;
			console.log(`  + ${cv.field.padEnd(11)} ${cv.name}  [${cv.template}]`);
		} else {
			skipped++;
			console.log(`  = exists      ${cv.name}`);
		}
	}

	console.log(`\nInserted: ${inserted}, Skipped (already present): ${skipped}`);

	// Report per-field vocational counts
	const counts = await client.query(
		"SELECT field, count(*)::int AS c FROM resume_gallery WHERE field IN ('healthcare','industrial','hse') GROUP BY field ORDER BY field",
	);
	console.log("\nVocational counts in resume_gallery:");
	console.table(counts.rows);

	const templates = await client.query(
		"SELECT DISTINCT template_name FROM resume_gallery WHERE field IN ('healthcare','industrial','hse') ORDER BY template_name",
	);
	console.log("Templates used:", templates.rows.map((r) => r.template_name).join(", "));

	// Verify one inserted row's JSON structure
	const sample = await client.query(
		"SELECT name, resume_data FROM resume_gallery WHERE field IN ('healthcare','industrial','hse') ORDER BY created_at DESC LIMIT 1",
	);
	if (sample.rows[0]) {
		const d = sample.rows[0].resume_data;
		const topKeys = Object.keys(d).sort();
		const expectedTop = ["basics", "customSections", "metadata", "picture", "sections", "summary"];
		const okTop = expectedTop.every((k) => topKeys.includes(k));
		const sectionKeys = Object.keys(d.sections || {});
		console.log(`\nVerify sample: "${sample.rows[0].name}"`);
		console.log("  top-level keys:", topKeys.join(", "));
		console.log("  has all ResumeData top keys:", okTop);
		console.log("  metadata.template:", d.metadata?.template);
		console.log("  sections present:", sectionKeys.length, "->", sectionKeys.join(", "));
		console.log("  basics.name:", d.basics?.name, "| headline:", d.basics?.headline);
		console.log("  experience items:", d.sections?.experience?.items?.length);
	}

	await client.end();
	console.log("\nDone.");
}

main().catch((e) => {
	console.error("ERROR:", e.message);
	process.exit(1);
});
