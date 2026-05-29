/**
 * Seed Career Roles and Skills (career_role_requirement + career_role_skill)
 *
 * Seeds IMTA-aligned career roles across healthcare / industrial / hse fields,
 * French-first, with required skills per role.
 *
 * Idempotent: uses ON CONFLICT DO NOTHING on the primary-key id.
 * Existing rows from previous sim-agent runs are preserved and extended.
 *
 * Usage:
 *   node scripts/seed-career-roles.mjs
 *
 * Requires: pg package (already installed as a project dep)
 * DB: reads DATABASE_URL from .env or falls back to the known local dev URL.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("pg");

// ---------------------------------------------------------------------------
// DB connection
// ---------------------------------------------------------------------------

function loadEnv() {
	try {
		const raw = readFileSync(new URL("../.env", import.meta.url), "utf8");
		for (const line of raw.split("\n")) {
			const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
			if (m) {
				const key = m[1].trim();
				const val = m[2].trim().replace(/^["']|["']$/g, "");
				if (!process.env[key]) process.env[key] = val;
			}
		}
	} catch {
		// .env not present — rely on environment
	}
}

loadEnv();

const DB_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// ---------------------------------------------------------------------------
// Seed data — career_role_requirement
// Fields: healthcare | industrial | hse
// Experience: entry | mid | senior
// Demand: low | medium | high
// ---------------------------------------------------------------------------

const ROLES = [
	// ── HEALTHCARE ─────────────────────────────────────────────────────────
	{
		id: "nursing",
		role: "Nurse",
		roleFr: "Infirmier/Infirmière",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Provide patient care in healthcare facilities",
		descriptionFr: "Fournir des soins aux patients dans les établissements de santé",
		salaryMin: 4500,
		salaryMax: 8000,
		demandLevel: "high",
		sortOrder: 1,
	},
	{
		id: "medical_assistant",
		role: "Medical Assistant",
		roleFr: "Aide-Soignant(e)",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Assist nurses and doctors with patient care",
		descriptionFr: "Assister les infirmiers et médecins dans les soins aux patients",
		salaryMin: 3500,
		salaryMax: 5500,
		demandLevel: "high",
		sortOrder: 2,
	},
	{
		id: "midwife",
		role: "Midwife",
		roleFr: "Sage-Femme",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Support women through pregnancy, labour and postnatal care",
		descriptionFr: "Accompagner les femmes pendant la grossesse, l'accouchement et les soins post-natals",
		salaryMin: 5000,
		salaryMax: 9000,
		demandLevel: "high",
		sortOrder: 3,
	},
	{
		id: "childcare_auxiliary",
		role: "Childcare Auxiliary",
		roleFr: "Auxiliaire de Puériculture",
		field: "healthcare",
		experienceLevel: "entry",
		description: "Specialised care for infants and young children in clinical and crèche settings",
		descriptionFr: "Soins spécialisés pour nourrissons et jeunes enfants en milieu hospitalier et en crèche",
		salaryMin: 3500,
		salaryMax: 5500,
		demandLevel: "high",
		sortOrder: 4,
	},
	{
		id: "anesthesia_technician",
		role: "Anesthesia Technician",
		roleFr: "Technicien(ne) d'Anesthésie",
		field: "healthcare",
		experienceLevel: "mid",
		description: "Prepare and assist during anaesthesia administration in operating theatres",
		descriptionFr: "Préparer et assister lors de l'anesthésie au bloc opératoire",
		salaryMin: 6000,
		salaryMax: 10000,
		demandLevel: "high",
		sortOrder: 5,
	},
	{
		id: "lab_technician",
		role: "Laboratory Technician",
		roleFr: "Technicien(ne) de Laboratoire",
		field: "healthcare",
		experienceLevel: "mid",
		description: "Analyse biological samples to support disease diagnosis",
		descriptionFr: "Analyser les échantillons biologiques pour aider au diagnostic des maladies",
		salaryMin: 5000,
		salaryMax: 8500,
		demandLevel: "high",
		sortOrder: 6,
	},
	{
		id: "cadre_sante",
		role: "Healthcare Manager",
		roleFr: "Cadre de Santé",
		field: "healthcare",
		experienceLevel: "senior",
		description: "Lead and coordinate nursing teams and patient care units",
		descriptionFr: "Diriger et coordonner les équipes soignantes et les unités de soins",
		salaryMin: 9000,
		salaryMax: 16000,
		demandLevel: "medium",
		sortOrder: 7,
	},
	// ── INDUSTRIAL ─────────────────────────────────────────────────────────
	{
		id: "maintenance_tech",
		role: "Maintenance Technician",
		roleFr: "Technicien(ne) de Maintenance",
		field: "industrial",
		experienceLevel: "mid",
		description: "Maintain and repair industrial equipment",
		descriptionFr: "Entretenir et réparer les équipements industriels",
		salaryMin: 5000,
		salaryMax: 9000,
		demandLevel: "high",
		sortOrder: 8,
	},
	{
		id: "industrial_operator",
		role: "Industrial Operator",
		roleFr: "Opérateur(trice) Industriel(le)",
		field: "industrial",
		experienceLevel: "entry",
		description: "Operate industrial machinery and production lines",
		descriptionFr: "Opérer les machines industrielles et lignes de production",
		salaryMin: 4000,
		salaryMax: 7000,
		demandLevel: "medium",
		sortOrder: 9,
	},
	{
		id: "welder",
		role: "Welder",
		roleFr: "Soudeur/Soudeuse",
		field: "industrial",
		experienceLevel: "entry",
		description: "Join metals using MIG, TIG and arc welding techniques for construction and industry",
		descriptionFr: "Assembler les métaux par soudure MIG, TIG et à l'arc pour le BTP et l'industrie",
		salaryMin: 4500,
		salaryMax: 7500,
		demandLevel: "high",
		sortOrder: 10,
	},
	{
		id: "forklift_operator",
		role: "Forklift / Warehouse Operator",
		roleFr: "Cariste / Opérateur(trice) Logistique",
		field: "industrial",
		experienceLevel: "entry",
		description: "Operate forklifts and handle goods in warehouses and logistics hubs",
		descriptionFr: "Conduire des chariots élévateurs et manutentionner les marchandises en entrepôt",
		salaryMin: 4000,
		salaryMax: 6500,
		demandLevel: "high",
		sortOrder: 11,
	},
	{
		id: "heavy_equipment_operator",
		role: "Heavy Equipment Operator",
		roleFr: "Conducteur(trice) d'Engins",
		field: "industrial",
		experienceLevel: "entry",
		description: "Operate heavy machinery on construction and civil-engineering sites",
		descriptionFr: "Conduire des engins lourds sur les chantiers BTP et génie civil",
		salaryMin: 6000,
		salaryMax: 10000,
		demandLevel: "high",
		sortOrder: 12,
	},
	{
		id: "electromechanical_tech",
		role: "Electromechanical Technician",
		roleFr: "Technicien(ne) Électromécanique",
		field: "industrial",
		experienceLevel: "mid",
		description: "Maintain and troubleshoot combined electrical and mechanical systems",
		descriptionFr: "Maintenir et dépanner les systèmes électromécaniques combinés",
		salaryMin: 5500,
		salaryMax: 9500,
		demandLevel: "high",
		sortOrder: 13,
	},
	{
		id: "hvac_technician",
		role: "HVAC / Refrigeration Technician",
		roleFr: "Technicien(ne) en Froid et Climatisation",
		field: "industrial",
		experienceLevel: "mid",
		description: "Install and maintain air conditioning, ventilation and refrigeration systems",
		descriptionFr: "Installer et entretenir les systèmes de climatisation, ventilation et réfrigération",
		salaryMin: 5000,
		salaryMax: 8500,
		demandLevel: "medium",
		sortOrder: 14,
	},
	{
		id: "production_supervisor",
		role: "Production Supervisor",
		roleFr: "Chef(fe) d'Équipe Production",
		field: "industrial",
		experienceLevel: "senior",
		description: "Lead production teams to meet quality, safety and output targets",
		descriptionFr: "Encadrer les équipes de production pour atteindre les objectifs qualité, sécurité et rendement",
		salaryMin: 8000,
		salaryMax: 14000,
		demandLevel: "medium",
		sortOrder: 15,
	},
	// ── HSE ────────────────────────────────────────────────────────────────
	{
		id: "hse_coordinator",
		role: "HSE Coordinator",
		roleFr: "Coordinateur/Coordinatrice HSE",
		field: "hse",
		experienceLevel: "mid",
		description: "Coordinate health, safety and environmental programmes",
		descriptionFr: "Coordonner les programmes santé, sécurité et environnement",
		salaryMin: 7000,
		salaryMax: 15000,
		demandLevel: "high",
		sortOrder: 16,
	},
	{
		id: "safety_officer",
		role: "Safety Officer",
		roleFr: "Agent(e) de Sécurité",
		field: "hse",
		experienceLevel: "entry",
		description: "Ensure workplace safety and regulatory compliance",
		descriptionFr: "Assurer la sécurité au travail et la conformité réglementaire",
		salaryMin: 5000,
		salaryMax: 10000,
		demandLevel: "medium",
		sortOrder: 17,
	},
	{
		id: "hse_manager",
		role: "HSE Manager",
		roleFr: "Responsable HSE",
		field: "hse",
		experienceLevel: "senior",
		description: "Lead the HSE strategy for an industrial site or multi-site organisation",
		descriptionFr: "Piloter la stratégie HSE d'un site industriel ou d'une organisation multi-sites",
		salaryMin: 12000,
		salaryMax: 22000,
		demandLevel: "high",
		sortOrder: 18,
	},
	{
		id: "hse_technician",
		role: "HSE Technician",
		roleFr: "Technicien(ne) HSE",
		field: "hse",
		experienceLevel: "entry",
		description: "Support HSE operations through field inspections, reporting and awareness campaigns",
		descriptionFr: "Soutenir les opérations HSE par des inspections terrain, des rapports et des campagnes de sensibilisation",
		salaryMin: 4500,
		salaryMax: 8000,
		demandLevel: "high",
		sortOrder: 19,
	},
	{
		id: "environmental_technician",
		role: "Environmental Technician",
		roleFr: "Technicien(ne) Environnement",
		field: "hse",
		experienceLevel: "mid",
		description: "Monitor environmental indicators and ensure compliance with ISO 14001 requirements",
		descriptionFr: "Surveiller les indicateurs environnementaux et assurer la conformité aux exigences de l'ISO 14001",
		salaryMin: 6000,
		salaryMax: 11000,
		demandLevel: "medium",
		sortOrder: 20,
	},
];

// ---------------------------------------------------------------------------
// Seed data — career_role_skill
// Keyed by role id.
// id format: <role_short>_<skill_short>  (plain text, not UUID)
// ---------------------------------------------------------------------------

const SKILLS = {
	// ── nursing ────────────────────────────────────────────────────────────
	nursing: [
		{ id: "nursing_patient_care",       skillName: "Patient Care",               skillNameFr: "Soins aux Patients",             category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 1 },
		{ id: "nursing_medical_terminology", skillName: "Medical Terminology",         skillNameFr: "Terminologie Médicale",          category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 2 },
		{ id: "nursing_first_aid",           skillName: "First Aid",                   skillNameFr: "Premiers Secours",               category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 3 },
		{ id: "nursing_medication",          skillName: "Medication Administration",   skillNameFr: "Administration Médicaments",     category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 4 },
		{ id: "nursing_wound_care",          skillName: "Wound Care",                  skillNameFr: "Soins des Plaies",               category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 5 },
		{ id: "nursing_iv_therapy",          skillName: "IV Therapy",                  skillNameFr: "Thérapie Intraveineuse",         category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.6, isRequired: false, sortOrder: 6 },
		{ id: "nursing_communication",       skillName: "Communication",               skillNameFr: "Communication",                  category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 7 },
		{ id: "nursing_empathy",             skillName: "Empathy",                     skillNameFr: "Empathie",                       category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 8 },
		{ id: "nursing_teamwork",            skillName: "Teamwork",                    skillNameFr: "Travail d'Équipe",               category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 9 },
		{ id: "nursing_stress",              skillName: "Stress Management",           skillNameFr: "Gestion du Stress",              category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.3, isRequired: false, sortOrder: 10 },
		{ id: "nursing_french",              skillName: "French",                      skillNameFr: "Français",                       category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 11 },
		{ id: "nursing_arabic",              skillName: "Arabic",                      skillNameFr: "Arabe",                          category: "languages",      requiredLevel: 4, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 12 },
		{ id: "nursing_english",             skillName: "English",                     skillNameFr: "Anglais",                        category: "languages",      requiredLevel: 3, importance: "nice-to-have", industryBenchmark: 2.5, isRequired: false, sortOrder: 13 },
		{ id: "nursing_bls",                 skillName: "BLS Certification",           skillNameFr: "Certification BLS",              category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 4.8, isRequired: true,  sortOrder: 14 },
	],

	// ── medical_assistant ─────────────────────────────────────────────────
	medical_assistant: [
		{ id: "ma_patient_care",   skillName: "Patient Care",        skillNameFr: "Soins aux Patients",       category: "technical",  requiredLevel: 4, importance: "critical",  industryBenchmark: 3.8, isRequired: true,  sortOrder: 1 },
		{ id: "ma_first_aid",      skillName: "First Aid",           skillNameFr: "Premiers Secours",         category: "technical",  requiredLevel: 4, importance: "critical",  industryBenchmark: 4.0, isRequired: true,  sortOrder: 2 },
		{ id: "ma_hygiene",        skillName: "Hygiene Protocols",   skillNameFr: "Protocoles Hygiène",       category: "technical",  requiredLevel: 5, importance: "critical",  industryBenchmark: 4.2, isRequired: true,  sortOrder: 3 },
		{ id: "ma_mobility",       skillName: "Mobility Assistance", skillNameFr: "Aide à la Mobilité",       category: "technical",  requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "ma_vital_signs",    skillName: "Vital Signs",         skillNameFr: "Constantes Vitales",       category: "technical",  requiredLevel: 3, importance: "important", industryBenchmark: 3.2, isRequired: false, sortOrder: 5 },
		{ id: "ma_communication",  skillName: "Communication",       skillNameFr: "Communication",            category: "soft",       requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 6 },
		{ id: "ma_teamwork",       skillName: "Teamwork",            skillNameFr: "Travail d'Équipe",         category: "soft",       requiredLevel: 4, importance: "important", industryBenchmark: 3.6, isRequired: false, sortOrder: 7 },
		{ id: "ma_empathy",        skillName: "Empathy",             skillNameFr: "Empathie",                 category: "soft",       requiredLevel: 4, importance: "important", industryBenchmark: 3.8, isRequired: false, sortOrder: 8 },
		{ id: "ma_french",         skillName: "French",              skillNameFr: "Français",                 category: "languages",  requiredLevel: 4, importance: "critical",  industryBenchmark: 4.0, isRequired: true,  sortOrder: 9 },
		{ id: "ma_arabic",         skillName: "Arabic",              skillNameFr: "Arabe",                    category: "languages",  requiredLevel: 3, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 10 },
	],

	// ── midwife ───────────────────────────────────────────────────────────
	midwife: [
		{ id: "mw_obstetrics",       skillName: "Obstetrics",               skillNameFr: "Obstétrique",                    category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "mw_prenatal",         skillName: "Prenatal Care",            skillNameFr: "Soins Prénataux",                category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 2 },
		{ id: "mw_postnatal",        skillName: "Postnatal Care",           skillNameFr: "Soins Post-Nataux",              category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 3 },
		{ id: "mw_emergency_birth",  skillName: "Emergency Childbirth",     skillNameFr: "Accouchement d'Urgence",         category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.7, isRequired: true,  sortOrder: 4 },
		{ id: "mw_monitoring",       skillName: "Foetal Monitoring",        skillNameFr: "Surveillance Fœtale",            category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 5 },
		{ id: "mw_empathy",          skillName: "Empathy",                  skillNameFr: "Empathie",                       category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: false, sortOrder: 6 },
		{ id: "mw_communication",    skillName: "Patient Communication",    skillNameFr: "Communication Patient",          category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 7 },
		{ id: "mw_stress",           skillName: "Stress Management",        skillNameFr: "Gestion du Stress",              category: "soft",           requiredLevel: 5, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 8 },
		{ id: "mw_french",           skillName: "French",                   skillNameFr: "Français",                       category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 9 },
		{ id: "mw_arabic",           skillName: "Arabic",                   skillNameFr: "Arabe",                          category: "languages",      requiredLevel: 4, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 10 },
		{ id: "mw_sage_femme_dip",   skillName: "State Midwifery Diploma",  skillNameFr: "Diplôme d'État Sage-Femme",     category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 5.0, isRequired: true,  sortOrder: 11 },
	],

	// ── childcare_auxiliary ───────────────────────────────────────────────
	childcare_auxiliary: [
		{ id: "ca_infant_care",      skillName: "Infant Care",             skillNameFr: "Soins aux Nourrissons",         category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "ca_child_dev",        skillName: "Child Development",       skillNameFr: "Développement de l'Enfant",     category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 2 },
		{ id: "ca_nutrition",        skillName: "Child Nutrition",         skillNameFr: "Nutrition Infantile",           category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 3 },
		{ id: "ca_hygiene",          skillName: "Hygiene Protocols",       skillNameFr: "Protocoles Hygiène",            category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 4 },
		{ id: "ca_first_aid",        skillName: "Paediatric First Aid",    skillNameFr: "Premiers Secours Pédiatriques", category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 5 },
		{ id: "ca_communication",    skillName: "Parent Communication",    skillNameFr: "Communication Parents",         category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.6, isRequired: false, sortOrder: 6 },
		{ id: "ca_empathy",          skillName: "Empathy",                 skillNameFr: "Empathie",                      category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: false, sortOrder: 7 },
		{ id: "ca_french",           skillName: "French",                  skillNameFr: "Français",                      category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 8 },
		{ id: "ca_cert",             skillName: "Childcare Auxiliary Certificate", skillNameFr: "Certificat Auxiliaire de Puériculture", category: "certifications", requiredLevel: 5, importance: "critical", industryBenchmark: 5.0, isRequired: true, sortOrder: 9 },
	],

	// ── anesthesia_technician ─────────────────────────────────────────────
	anesthesia_technician: [
		{ id: "at_equipment",    skillName: "Anaesthesia Equipment",    skillNameFr: "Matériel d'Anesthésie",       category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "at_monitoring",   skillName: "Patient Monitoring",       skillNameFr: "Surveillance du Patient",     category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 2 },
		{ id: "at_drug_prep",    skillName: "Drug Preparation",         skillNameFr: "Préparation des Drogues",     category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 3 },
		{ id: "at_sterile",      skillName: "Sterile Technique",        skillNameFr: "Technique Stérile",           category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 4 },
		{ id: "at_emergency",    skillName: "Emergency Protocols",      skillNameFr: "Protocoles d'Urgence",        category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.7, isRequired: true,  sortOrder: 5 },
		{ id: "at_documentation",skillName: "Medical Documentation",    skillNameFr: "Documentation Médicale",      category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 6 },
		{ id: "at_teamwork",     skillName: "Surgical Teamwork",        skillNameFr: "Travail en Équipe Chirurgicale", category: "soft",       requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: false, sortOrder: 7 },
		{ id: "at_stress",       skillName: "Stress Management",        skillNameFr: "Gestion du Stress",           category: "soft",           requiredLevel: 5, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 8 },
		{ id: "at_french",       skillName: "French",                   skillNameFr: "Français",                    category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 9 },
		{ id: "at_diploma",      skillName: "Anaesthesia Technician Diploma", skillNameFr: "Diplôme Technicien Anesthésie", category: "certifications", requiredLevel: 5, importance: "critical", industryBenchmark: 5.0, isRequired: true, sortOrder: 10 },
	],

	// ── lab_technician ────────────────────────────────────────────────────
	lab_technician: [
		{ id: "lt_hematology",   skillName: "Haematology",            skillNameFr: "Hématologie",              category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 1 },
		{ id: "lt_biochemistry", skillName: "Biochemistry",           skillNameFr: "Biochimie",                category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.7, isRequired: true,  sortOrder: 2 },
		{ id: "lt_microbiology", skillName: "Microbiology",           skillNameFr: "Microbiologie",            category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.6, isRequired: true,  sortOrder: 3 },
		{ id: "lt_sample",       skillName: "Sample Handling",        skillNameFr: "Manipulation Échantillons",category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 4 },
		{ id: "lt_equipment",    skillName: "Lab Equipment Operation",skillNameFr: "Utilisation Équipements Labo", category: "technical",  requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "lt_qc",           skillName: "Quality Control",        skillNameFr: "Contrôle Qualité",         category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 6 },
		{ id: "lt_attention",    skillName: "Attention to Detail",    skillNameFr: "Attention aux Détails",    category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: false, sortOrder: 7 },
		{ id: "lt_problem",      skillName: "Problem-Solving",        skillNameFr: "Résolution de Problèmes",  category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "lt_french",       skillName: "French",                 skillNameFr: "Français",                 category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 9 },
		{ id: "lt_diploma",      skillName: "Medical Lab Technician Diploma", skillNameFr: "Diplôme Technicien Labo Médical", category: "certifications", requiredLevel: 5, importance: "critical", industryBenchmark: 5.0, isRequired: true, sortOrder: 10 },
	],

	// ── cadre_sante ───────────────────────────────────────────────────────
	cadre_sante: [
		{ id: "cs_team_mgmt",    skillName: "Team Management",        skillNameFr: "Management d'Équipe",      category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "cs_care_coord",   skillName: "Care Coordination",      skillNameFr: "Coordination des Soins",   category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 2 },
		{ id: "cs_budget",       skillName: "Budget Management",      skillNameFr: "Gestion Budgétaire",       category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 3 },
		{ id: "cs_protocols",    skillName: "Protocol Development",   skillNameFr: "Développement de Protocoles", category: "technical",   requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 4 },
		{ id: "cs_leadership",   skillName: "Leadership",             skillNameFr: "Leadership",               category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: false, sortOrder: 5 },
		{ id: "cs_communication",skillName: "Communication",          skillNameFr: "Communication",            category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: false, sortOrder: 6 },
		{ id: "cs_conflict",     skillName: "Conflict Resolution",    skillNameFr: "Résolution de Conflits",   category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 7 },
		{ id: "cs_french",       skillName: "French",                 skillNameFr: "Français",                 category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 8 },
		{ id: "cs_nursing_dip",  skillName: "Nursing Diploma (DE)",   skillNameFr: "Diplôme d'État Infirmier", category: "certifications",  requiredLevel: 5, importance: "critical",    industryBenchmark: 5.0, isRequired: true,  sortOrder: 9 },
	],

	// ── maintenance_tech ──────────────────────────────────────────────────
	maintenance_tech: [
		{ id: "mt_machine",          skillName: "Machine Operation",      skillNameFr: "Utilisation des Machines",  category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "mt_technical_reading",skillName: "Technical Reading",      skillNameFr: "Lecture Technique",         category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 2 },
		{ id: "mt_electrical",       skillName: "Electrical Systems",     skillNameFr: "Systèmes Électriques",      category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 3 },
		{ id: "mt_preventive",       skillName: "Preventive Maintenance", skillNameFr: "Maintenance Préventive",    category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 4 },
		{ id: "mt_hydraulics",       skillName: "Hydraulic Systems",      skillNameFr: "Systèmes Hydrauliques",     category: "technical",      requiredLevel: 3, importance: "important",    industryBenchmark: 3.2, isRequired: false, sortOrder: 5 },
		{ id: "mt_problem_solving",  skillName: "Problem-Solving",        skillNameFr: "Résolution de Problèmes",   category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 6 },
		{ id: "mt_attention",        skillName: "Attention to Detail",    skillNameFr: "Attention aux Détails",     category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 7 },
		{ id: "mt_french",           skillName: "French",                 skillNameFr: "Français",                  category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 8 },
		{ id: "mt_technical_english",skillName: "Technical English",      skillNameFr: "Anglais Technique",         category: "languages",      requiredLevel: 3, importance: "important",    industryBenchmark: 2.8, isRequired: false, sortOrder: 9 },
		{ id: "mt_iso9001",          skillName: "ISO 9001",               skillNameFr: "ISO 9001",                  category: "certifications", requiredLevel: 3, importance: "nice-to-have", industryBenchmark: 2.5, isRequired: false, sortOrder: 10 },
	],

	// ── industrial_operator ───────────────────────────────────────────────
	industrial_operator: [
		{ id: "io_machine",      skillName: "Machine Operation",   skillNameFr: "Utilisation des Machines",  category: "technical", requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "io_safety",       skillName: "Safety Procedures",   skillNameFr: "Procédures de Sécurité",    category: "technical", requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 2 },
		{ id: "io_quality",      skillName: "Quality Control",     skillNameFr: "Contrôle Qualité",          category: "technical", requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 3 },
		{ id: "io_blueprint",    skillName: "Blueprint Reading",   skillNameFr: "Lecture de Plans",          category: "technical", requiredLevel: 3, importance: "important",    industryBenchmark: 3.0, isRequired: false, sortOrder: 4 },
		{ id: "io_attention",    skillName: "Attention to Detail", skillNameFr: "Attention aux Détails",     category: "soft",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 5 },
		{ id: "io_time",         skillName: "Time Management",     skillNameFr: "Gestion du Temps",          category: "soft",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 6 },
		{ id: "io_teamwork",     skillName: "Teamwork",            skillNameFr: "Travail d'Équipe",          category: "soft",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 7 },
		{ id: "io_french",       skillName: "French",              skillNameFr: "Français",                  category: "languages", requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 8 },
	],

	// ── welder ────────────────────────────────────────────────────────────
	welder: [
		{ id: "wl_mig_tig",      skillName: "MIG/TIG Welding",       skillNameFr: "Soudure MIG/TIG",           category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "wl_arc",          skillName: "Arc Welding",            skillNameFr: "Soudure à l'Arc",           category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 2 },
		{ id: "wl_blueprint",    skillName: "Blueprint Reading",      skillNameFr: "Lecture de Plans",          category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 3 },
		{ id: "wl_metal_prep",   skillName: "Metal Preparation",      skillNameFr: "Préparation Métallique",    category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "wl_qc",           skillName: "Quality Inspection",     skillNameFr: "Inspection Qualité",        category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "wl_safety",       skillName: "Welding Safety",         skillNameFr: "Sécurité Soudure",          category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 6 },
		{ id: "wl_attention",    skillName: "Attention to Detail",    skillNameFr: "Attention aux Détails",     category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: false, sortOrder: 7 },
		{ id: "wl_french",       skillName: "French",                 skillNameFr: "Français",                  category: "languages",      requiredLevel: 3, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "wl_aws_cert",     skillName: "Welder Certificate",     skillNameFr: "Certificat de Soudeur",     category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 5.0, isRequired: true,  sortOrder: 9 },
	],

	// ── forklift_operator ─────────────────────────────────────────────────
	forklift_operator: [
		{ id: "fl_forklift",     skillName: "Forklift Operation",     skillNameFr: "Conduite de Chariot Élévateur", category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "fl_inventory",    skillName: "Inventory Management",   skillNameFr: "Gestion des Stocks",            category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 3.7, isRequired: false, sortOrder: 2 },
		{ id: "fl_safety",       skillName: "Warehouse Safety",       skillNameFr: "Sécurité en Entrepôt",          category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.3, isRequired: true,  sortOrder: 3 },
		{ id: "fl_loading",      skillName: "Loading / Unloading",    skillNameFr: "Chargement / Déchargement",     category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "fl_wms",          skillName: "WMS Software",           skillNameFr: "Logiciel WMS",                  category: "tools",          requiredLevel: 3, importance: "nice-to-have", industryBenchmark: 2.8, isRequired: false, sortOrder: 5 },
		{ id: "fl_attention",    skillName: "Attention to Detail",    skillNameFr: "Attention aux Détails",         category: "soft",           requiredLevel: 5, importance: "critical",  industryBenchmark: 4.0, isRequired: false, sortOrder: 6 },
		{ id: "fl_teamwork",     skillName: "Teamwork",               skillNameFr: "Travail d'Équipe",              category: "soft",           requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 7 },
		{ id: "fl_french",       skillName: "French",                 skillNameFr: "Français",                      category: "languages",      requiredLevel: 3, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "fl_caces",        skillName: "CACES Licence",          skillNameFr: "Licence CACES",                 category: "certifications", requiredLevel: 5, importance: "critical",  industryBenchmark: 5.0, isRequired: true,  sortOrder: 9 },
	],

	// ── heavy_equipment_operator ──────────────────────────────────────────
	heavy_equipment_operator: [
		{ id: "he_excavator",    skillName: "Excavator Operation",    skillNameFr: "Conduite de Pelle Mécanique",   category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "he_loader",       skillName: "Loader Operation",       skillNameFr: "Conduite de Chargeuse",         category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 4.0, isRequired: false, sortOrder: 2 },
		{ id: "he_bulldozer",    skillName: "Bulldozer Operation",    skillNameFr: "Conduite de Bulldozer",         category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 3.8, isRequired: false, sortOrder: 3 },
		{ id: "he_inspection",   skillName: "Equipment Pre-Inspection",skillNameFr: "Pré-Inspection Engins",        category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.3, isRequired: true,  sortOrder: 4 },
		{ id: "he_site_safety",  skillName: "Site Safety Protocols",  skillNameFr: "Protocoles Sécurité Chantier",  category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.5, isRequired: true,  sortOrder: 5 },
		{ id: "he_spatial",      skillName: "Spatial Awareness",      skillNameFr: "Conscience Spatiale",           category: "soft",           requiredLevel: 5, importance: "critical",  industryBenchmark: 4.3, isRequired: false, sortOrder: 6 },
		{ id: "he_french",       skillName: "French",                 skillNameFr: "Français",                      category: "languages",      requiredLevel: 3, importance: "important", industryBenchmark: 3.3, isRequired: false, sortOrder: 7 },
		{ id: "he_caces_engins", skillName: "CACES Engins",           skillNameFr: "CACES Engins de Chantier",      category: "certifications", requiredLevel: 5, importance: "critical",  industryBenchmark: 5.0, isRequired: true,  sortOrder: 8 },
	],

	// ── electromechanical_tech ────────────────────────────────────────────
	electromechanical_tech: [
		{ id: "em_electrical",   skillName: "Electrical Systems",     skillNameFr: "Systèmes Électriques",      category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "em_mechanical",   skillName: "Mechanical Systems",     skillNameFr: "Systèmes Mécaniques",       category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 2 },
		{ id: "em_plc",          skillName: "PLC Programming",        skillNameFr: "Programmation Automates",   category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 3 },
		{ id: "em_automation",   skillName: "Industrial Automation",  skillNameFr: "Automatisation Industrielle",category: "technical",     requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "em_troubleshoot", skillName: "Fault Diagnosis",        skillNameFr: "Diagnostic de Pannes",      category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 5 },
		{ id: "em_blueprint",    skillName: "Technical Schematics",   skillNameFr: "Schémas Techniques",        category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 6 },
		{ id: "em_problem",      skillName: "Problem-Solving",        skillNameFr: "Résolution de Problèmes",   category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: false, sortOrder: 7 },
		{ id: "em_french",       skillName: "French",                 skillNameFr: "Français",                  category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 8 },
		{ id: "em_technical_eng",skillName: "Technical English",      skillNameFr: "Anglais Technique",         category: "languages",      requiredLevel: 3, importance: "important",    industryBenchmark: 2.8, isRequired: false, sortOrder: 9 },
		{ id: "em_diploma",      skillName: "Electromechanical Diploma",skillNameFr: "Diplôme Électromécanique",category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 5.0, isRequired: true,  sortOrder: 10 },
	],

	// ── hvac_technician ───────────────────────────────────────────────────
	hvac_technician: [
		{ id: "hv_hvac",         skillName: "HVAC Systems",          skillNameFr: "Systèmes CVC",              category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "hv_refrigerant",  skillName: "Refrigerant Handling",  skillNameFr: "Manipulation Frigorigènes", category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 2 },
		{ id: "hv_wiring",       skillName: "Electrical Wiring",     skillNameFr: "Câblage Électrique",        category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 3 },
		{ id: "hv_thermodynamics",skillName: "Thermodynamics",       skillNameFr: "Thermodynamique",           category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "hv_brazing",      skillName: "Brazing / Soldering",   skillNameFr: "Brasage / Soudure",         category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "hv_diagnostics",  skillName: "System Diagnostics",    skillNameFr: "Diagnostic Systèmes",       category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 6 },
		{ id: "hv_problem",      skillName: "Problem-Solving",       skillNameFr: "Résolution de Problèmes",   category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 7 },
		{ id: "hv_french",       skillName: "French",                skillNameFr: "Français",                  category: "languages",      requiredLevel: 3, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "hv_refrigerant_cert", skillName: "Refrigerant Handling Certificate", skillNameFr: "Certificat Manipulation Frigorigènes", category: "certifications", requiredLevel: 5, importance: "critical", industryBenchmark: 5.0, isRequired: true, sortOrder: 9 },
	],

	// ── production_supervisor ─────────────────────────────────────────────
	production_supervisor: [
		{ id: "ps_team_mgmt",    skillName: "Team Management",        skillNameFr: "Management d'Équipe",       category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "ps_lean",         skillName: "Lean Manufacturing",     skillNameFr: "Lean Manufacturing",        category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 2 },
		{ id: "ps_quality",      skillName: "Quality Management",     skillNameFr: "Gestion de la Qualité",     category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 3 },
		{ id: "ps_planning",     skillName: "Production Planning",    skillNameFr: "Planification de Production",category: "technical",     requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 4 },
		{ id: "ps_kpi",          skillName: "KPI Reporting",          skillNameFr: "Rapportage KPI",            category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "ps_leadership",   skillName: "Leadership",             skillNameFr: "Leadership",                category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: false, sortOrder: 6 },
		{ id: "ps_communication",skillName: "Communication",          skillNameFr: "Communication",             category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: false, sortOrder: 7 },
		{ id: "ps_french",       skillName: "French",                 skillNameFr: "Français",                  category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 8 },
		{ id: "ps_english",      skillName: "English",                skillNameFr: "Anglais",                   category: "languages",      requiredLevel: 3, importance: "nice-to-have", industryBenchmark: 2.8, isRequired: false, sortOrder: 9 },
		{ id: "ps_iso9001",      skillName: "ISO 9001",               skillNameFr: "ISO 9001",                  category: "certifications", requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 10 },
	],

	// ── hse_coordinator ───────────────────────────────────────────────────
	hse_coordinator: [
		{ id: "hse_risk",         skillName: "Risk Assessment",         skillNameFr: "Évaluation des Risques",        category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "hse_compliance",   skillName: "Regulatory Compliance",   skillNameFr: "Conformité Réglementaire",      category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 2 },
		{ id: "hse_investigation",skillName: "Incident Investigation",  skillNameFr: "Investigation d'Incidents",     category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 3 },
		{ id: "hse_auditing",     skillName: "Safety Auditing",         skillNameFr: "Audit Sécurité",                category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "hse_emergency",    skillName: "Emergency Planning",      skillNameFr: "Planification d'Urgence",       category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 5 },
		{ id: "hse_leadership",   skillName: "Leadership",              skillNameFr: "Leadership",                    category: "soft",           requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: false, sortOrder: 6 },
		{ id: "hse_communication",skillName: "Communication",           skillNameFr: "Communication",                 category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: false, sortOrder: 7 },
		{ id: "hse_training",     skillName: "Training Skills",         skillNameFr: "Compétences en Formation",      category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "hse_french",       skillName: "French",                  skillNameFr: "Français",                      category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 9 },
		{ id: "hse_english",      skillName: "English",                 skillNameFr: "Anglais",                       category: "languages",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 10 },
		{ id: "hse_iso45001",     skillName: "ISO 45001",               skillNameFr: "ISO 45001",                     category: "certifications", requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 11 },
		{ id: "hse_nebosh",       skillName: "NEBOSH",                  skillNameFr: "NEBOSH",                        category: "certifications", requiredLevel: 4, importance: "important",    industryBenchmark: 3.2, isRequired: false, sortOrder: 12 },
	],

	// ── safety_officer ────────────────────────────────────────────────────
	safety_officer: [
		{ id: "so_risk",             skillName: "Risk Assessment",      skillNameFr: "Évaluation des Risques",     category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 1 },
		{ id: "so_safety_procedures",skillName: "Safety Procedures",    skillNameFr: "Procédures de Sécurité",     category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.2, isRequired: true,  sortOrder: 2 },
		{ id: "so_emergency",        skillName: "Emergency Response",   skillNameFr: "Réponse d'Urgence",          category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.5, isRequired: true,  sortOrder: 3 },
		{ id: "so_inspection",       skillName: "Site Inspection",      skillNameFr: "Inspection de Chantier",     category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 4 },
		{ id: "so_ppe",              skillName: "PPE Knowledge",        skillNameFr: "Connaissance EPI",           category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "so_training",         skillName: "Training Skills",      skillNameFr: "Compétences en Formation",   category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.3, isRequired: false, sortOrder: 6 },
		{ id: "so_communication",    skillName: "Communication",        skillNameFr: "Communication",              category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 7 },
		{ id: "so_french",           skillName: "French",               skillNameFr: "Français",                   category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 8 },
		{ id: "so_osha30",           skillName: "OSHA 30",              skillNameFr: "OSHA 30",                    category: "certifications", requiredLevel: 4, importance: "important",    industryBenchmark: 3.0, isRequired: false, sortOrder: 9 },
	],

	// ── hse_manager ───────────────────────────────────────────────────────
	hse_manager: [
		{ id: "hm_strategy",      skillName: "HSE Strategy",            skillNameFr: "Stratégie HSE",              category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 1 },
		{ id: "hm_risk_mgmt",     skillName: "Risk Management",         skillNameFr: "Gestion des Risques",        category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 2 },
		{ id: "hm_audit_mgmt",    skillName: "Audit Management",        skillNameFr: "Management d'Audit",         category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.3, isRequired: true,  sortOrder: 3 },
		{ id: "hm_legal",         skillName: "HSE Legislation",         skillNameFr: "Législation HSE",            category: "technical",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 4 },
		{ id: "hm_budget",        skillName: "Budget Management",       skillNameFr: "Gestion Budgétaire",         category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.8, isRequired: false, sortOrder: 5 },
		{ id: "hm_leadership",    skillName: "Leadership",              skillNameFr: "Leadership",                 category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.8, isRequired: false, sortOrder: 6 },
		{ id: "hm_communication", skillName: "Communication",           skillNameFr: "Communication",              category: "soft",           requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: false, sortOrder: 7 },
		{ id: "hm_negotiation",   skillName: "Negotiation",             skillNameFr: "Négociation",                category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 8 },
		{ id: "hm_french",        skillName: "French",                  skillNameFr: "Français",                   category: "languages",      requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 9 },
		{ id: "hm_english",       skillName: "English",                 skillNameFr: "Anglais",                    category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 10 },
		{ id: "hm_iso45001",      skillName: "ISO 45001 Lead Auditor",  skillNameFr: "Auditeur Principal ISO 45001", category: "certifications", requiredLevel: 5, importance: "critical",   industryBenchmark: 4.8, isRequired: true,  sortOrder: 11 },
		{ id: "hm_iso14001",      skillName: "ISO 14001",               skillNameFr: "ISO 14001",                  category: "certifications", requiredLevel: 4, importance: "important",    industryBenchmark: 4.0, isRequired: false, sortOrder: 12 },
		{ id: "hm_nebosh",        skillName: "NEBOSH Diploma",          skillNameFr: "Diplôme NEBOSH",             category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 4.5, isRequired: true,  sortOrder: 13 },
	],

	// ── hse_technician ────────────────────────────────────────────────────
	hse_technician: [
		{ id: "ht_field_insp",    skillName: "Field Inspection",        skillNameFr: "Inspection Terrain",        category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 1 },
		{ id: "ht_risk",          skillName: "Risk Assessment",         skillNameFr: "Évaluation des Risques",    category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 2 },
		{ id: "ht_reporting",     skillName: "HSE Reporting",           skillNameFr: "Rapportage HSE",            category: "technical",      requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 3 },
		{ id: "ht_awareness",     skillName: "Safety Awareness Campaigns",skillNameFr: "Campagnes Sensibilisation Sécurité", category: "technical", requiredLevel: 3, importance: "important", industryBenchmark: 3.3, isRequired: false, sortOrder: 4 },
		{ id: "ht_emergency",     skillName: "Emergency Response",      skillNameFr: "Réponse d'Urgence",         category: "technical",      requiredLevel: 4, importance: "critical",     industryBenchmark: 3.8, isRequired: true,  sortOrder: 5 },
		{ id: "ht_communication", skillName: "Communication",           skillNameFr: "Communication",             category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.5, isRequired: false, sortOrder: 6 },
		{ id: "ht_attention",     skillName: "Attention to Detail",     skillNameFr: "Attention aux Détails",     category: "soft",           requiredLevel: 4, importance: "important",    industryBenchmark: 3.7, isRequired: false, sortOrder: 7 },
		{ id: "ht_french",        skillName: "French",                  skillNameFr: "Français",                  category: "languages",      requiredLevel: 4, importance: "critical",     industryBenchmark: 4.0, isRequired: true,  sortOrder: 8 },
		{ id: "ht_hse_diploma",   skillName: "HSE Technician Diploma",  skillNameFr: "Diplôme Technicien HSE",    category: "certifications", requiredLevel: 5, importance: "critical",     industryBenchmark: 5.0, isRequired: true,  sortOrder: 9 },
	],

	// ── environmental_technician ──────────────────────────────────────────
	environmental_technician: [
		{ id: "et_monitoring",    skillName: "Environmental Monitoring", skillNameFr: "Surveillance Environnementale",  category: "technical",      requiredLevel: 5, importance: "critical",  industryBenchmark: 4.3, isRequired: true,  sortOrder: 1 },
		{ id: "et_sampling",      skillName: "Sample Collection",        skillNameFr: "Collecte d'Échantillons",        category: "technical",      requiredLevel: 4, importance: "critical",  industryBenchmark: 4.0, isRequired: true,  sortOrder: 2 },
		{ id: "et_iso14001",      skillName: "ISO 14001 Compliance",     skillNameFr: "Conformité ISO 14001",           category: "technical",      requiredLevel: 4, importance: "critical",  industryBenchmark: 3.8, isRequired: true,  sortOrder: 3 },
		{ id: "et_reporting",     skillName: "Environmental Reporting",  skillNameFr: "Rapport Environnemental",        category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 4 },
		{ id: "et_waste_mgmt",    skillName: "Waste Management",         skillNameFr: "Gestion des Déchets",            category: "technical",      requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 5 },
		{ id: "et_data_analysis", skillName: "Data Analysis",            skillNameFr: "Analyse de Données",             category: "technical",      requiredLevel: 3, importance: "important", industryBenchmark: 3.2, isRequired: false, sortOrder: 6 },
		{ id: "et_attention",     skillName: "Attention to Detail",      skillNameFr: "Attention aux Détails",          category: "soft",           requiredLevel: 5, importance: "critical",  industryBenchmark: 4.2, isRequired: false, sortOrder: 7 },
		{ id: "et_communication", skillName: "Communication",            skillNameFr: "Communication",                  category: "soft",           requiredLevel: 4, importance: "important", industryBenchmark: 3.5, isRequired: false, sortOrder: 8 },
		{ id: "et_french",        skillName: "French",                   skillNameFr: "Français",                       category: "languages",      requiredLevel: 4, importance: "critical",  industryBenchmark: 4.0, isRequired: true,  sortOrder: 9 },
		{ id: "et_iso14001_cert", skillName: "ISO 14001 Certificate",    skillNameFr: "Certificat ISO 14001",           category: "certifications", requiredLevel: 4, importance: "important", industryBenchmark: 4.0, isRequired: false, sortOrder: 10 },
	],
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log("=== Career Roles & Skills Seeder ===\n");
	console.log(`DB: ${DB_URL.replace(/:([^:@]+)@/, ":***@")}\n`);

	const client = new Client({ connectionString: DB_URL });
	await client.connect();

	// ── Row counts before ─────────────────────────────────────────────────
	const before = await client.query("SELECT COUNT(*) FROM career_role_requirement");
	const beforeSkills = await client.query("SELECT COUNT(*) FROM career_role_skill");
	console.log(`Before: ${before.rows[0].count} roles, ${beforeSkills.rows[0].count} skills\n`);

	let rolesInserted = 0;
	let rolesSkipped = 0;
	let skillsInserted = 0;
	let skillsSkipped = 0;

	for (const role of ROLES) {
		// Upsert role — ON CONFLICT on pk id → skip
		const result = await client.query(
			`INSERT INTO career_role_requirement
			   (id, role, role_fr, field, experience_level, description, description_fr,
			    salary_min, salary_max, demand_level, is_active, sort_order, created_at, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,NOW(),NOW())
			 ON CONFLICT (id) DO NOTHING`,
			[
				role.id,
				role.role,
				role.roleFr,
				role.field,
				role.experienceLevel,
				role.description,
				role.descriptionFr,
				role.salaryMin,
				role.salaryMax,
				role.demandLevel,
				role.sortOrder,
			],
		);

		if (result.rowCount > 0) {
			rolesInserted++;
			process.stdout.write(`  + role ${role.id} (${role.roleFr})\n`);
		} else {
			rolesSkipped++;
			process.stdout.write(`  = role ${role.id} already exists\n`);
		}

		// Seed skills for this role
		const skills = SKILLS[role.id] || [];
		for (const skill of skills) {
			const skillResult = await client.query(
				`INSERT INTO career_role_skill
				   (id, role_id, skill_name, skill_name_fr, category, required_level,
				    importance, industry_benchmark, is_required, sort_order, created_at)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
				 ON CONFLICT (id) DO NOTHING`,
				[
					skill.id,
					role.id,
					skill.skillName,
					skill.skillNameFr,
					skill.category,
					skill.requiredLevel,
					skill.importance,
					skill.industryBenchmark.toString(),
					skill.isRequired ?? false,
					skill.sortOrder,
				],
			);
			if (skillResult.rowCount > 0) {
				skillsInserted++;
			} else {
				skillsSkipped++;
			}
		}
	}

	// ── Row counts after ──────────────────────────────────────────────────
	const afterRoles = await client.query("SELECT COUNT(*) FROM career_role_requirement");
	const afterSkills = await client.query("SELECT COUNT(*) FROM career_role_skill");
	console.log(`\nAfter:  ${afterRoles.rows[0].count} roles, ${afterSkills.rows[0].count} skills`);

	// ── Referential integrity check ───────────────────────────────────────
	const orphans = await client.query(`
		SELECT rs.id, rs.role_id FROM career_role_skill rs
		LEFT JOIN career_role_requirement r ON rs.role_id = r.id
		WHERE r.id IS NULL
	`);
	if (orphans.rows.length > 0) {
		console.warn(`\nWARNING: ${orphans.rows.length} orphan skill row(s) with no parent role:`);
		orphans.rows.forEach((r) => console.warn("  skill id:", r.id, "role_id:", r.role_id));
	} else {
		console.log("\nReferential integrity: OK (0 orphan skills)");
	}

	// ── Summary by field ──────────────────────────────────────────────────
	const byField = await client.query(`
		SELECT r.field,
		       COUNT(DISTINCT r.id)   AS roles,
		       COUNT(rs.id)           AS skills
		FROM career_role_requirement r
		LEFT JOIN career_role_skill rs ON rs.role_id = r.id
		GROUP BY r.field
		ORDER BY r.field
	`);
	console.log("\n=== Summary by field ===");
	byField.rows.forEach((row) =>
		console.log(`  ${row.field.padEnd(12)} ${row.roles} roles  ${row.skills} skills`),
	);

	console.log(`\n=== Done ===`);
	console.log(`  Roles:  ${rolesInserted} inserted, ${rolesSkipped} skipped`);
	console.log(`  Skills: ${skillsInserted} inserted, ${skillsSkipped} skipped`);

	await client.end();
}

main().catch((err) => {
	console.error("FATAL:", err.message);
	process.exit(1);
});
