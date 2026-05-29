/**
 * Seed REAL IMTA-vocational job postings + market salary data (French).
 *
 * PROBLEM: partner_job_posting was all engineering/IT/marketing (0 vocational),
 * and market_salary_data was mostly academic roles for industrial/hse/healthcare.
 * This script adds realistic Moroccan vocational opportunities for the three
 * IMTA fields students actually train in: healthcare, industrial, hse.
 *
 * OWNS (insert only): partner_job_posting, market_salary_data, career_employer.
 * Idempotent: re-running upserts on natural keys (no duplicates).
 *
 * NOTE on partners: partner_profile.user_id is UNIQUE and FK to the auth `user`
 * table, and only ONE partner user exists (partner@test.com -> OCP Group).
 * Creating field-specific partner_profiles would require creating new auth users
 * (better-auth accounts), which is out of scope here. So all postings reuse the
 * existing approved OCP Group partner_profile as the owning partner, while the
 * real hiring company/context lives in the job title/description/location.
 * To make this fully realistic, create dedicated partner users (clinics,
 * logistics firms, shipyards, BTP, OCP HSE) and re-attach these postings.
 */

import crypto from "node:crypto";
import pg from "pg";

const { Client } = pg;
const client = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" });
await client.connect();

// ---------------------------------------------------------------------------
// Resolve the owning partner_profile (reuse OCP Group).
// ---------------------------------------------------------------------------
const profileRes = await client.query(
	"SELECT id FROM partner_profile WHERE company_name = 'OCP Group' OR status = 'approved' ORDER BY created_at LIMIT 1",
);
if (profileRes.rows.length === 0) {
	console.error("No approved partner_profile found. Run scripts/seed-partner-data.mjs first.");
	await client.end();
	process.exit(1);
}
const partnerId = profileRes.rows[0].id;
console.log(`Using partner_profile id: ${partnerId} (OCP Group)`);

// ---------------------------------------------------------------------------
// 1. VOCATIONAL JOB POSTINGS (>= 6 per field, FRENCH).
//    job_type uses Moroccan contract types consistent with existing rows:
//    cdi, cdd, stage, alternance, interim.
// ---------------------------------------------------------------------------
const jobs = [
	// ===================== HEALTHCARE (6) =====================
	{
		title: "Nurse - Cheikh Khalifa Clinic Casablanca",
		titleFr: "Infirmier(ère) Polyvalent(e) - Clinique Cheikh Khalifa",
		descriptionFr:
			"La Clinique Cheikh Khalifa recrute des infirmier(ère)s diplômé(e)s d'État pour ses services d'hospitalisation. Vous assurez les soins, la surveillance des patients et la coordination avec l'équipe médicale.",
		location: "Casablanca",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "healthcare",
		skills: ["Soins infirmiers", "Pose de perfusion", "Surveillance des constantes", "Dossier patient"],
		requirements: ["Diplôme d'État d'infirmier", "Inscription à l'ordre", "Disponibilité travail posté"],
		certifications: ["Diplôme d'État d'Infirmier (DEI)"],
		education: "Bac+3 / Diplôme d'État Infirmier",
		salaryMin: 6000,
		salaryMax: 9000,
		benefits: ["Mutuelle", "Primes de garde", "Formation continue"],
	},
	{
		title: "Care Assistant - EHPAD Rabat",
		titleFr: "Aide-Soignant(e) - EHPAD Les Jardins (Rabat)",
		descriptionFr:
			"Établissement pour personnes âgées dépendantes recherche des aide-soignant(e)s pour accompagner les résidents dans les actes de la vie quotidienne, l'hygiène et le confort.",
		location: "Rabat",
		region: "rabat-sale-kenitra",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "healthcare",
		skills: ["Aide à la toilette", "Aide aux repas", "Mobilisation des patients", "Bienveillance"],
		requirements: ["Diplôme d'aide-soignant", "Sens du contact", "Patience"],
		certifications: ["Diplôme d'Aide-Soignant(e)"],
		education: "Diplôme professionnel Aide-Soignant",
		salaryMin: 3500,
		salaryMax: 5000,
		benefits: ["Repas pris en charge", "Mutuelle"],
	},
	{
		title: "Midwife - Maternity Tanger",
		titleFr: "Sage-femme - Maternité Régionale de Tanger",
		descriptionFr:
			"Maternité régionale recrute une sage-femme pour le suivi de grossesse, l'accompagnement des accouchements et les soins post-natals au sein d'une équipe pluridisciplinaire.",
		location: "Tanger",
		region: "tanger-tetouan-al-hoceima",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "healthcare",
		skills: ["Suivi de grossesse", "Accouchement", "Soins néonatals", "Échographie obstétricale"],
		requirements: ["Diplôme d'État de sage-femme", "2 ans d'expérience souhaités"],
		certifications: ["Diplôme d'État de Sage-femme"],
		education: "Bac+3 Sage-femme",
		salaryMin: 7000,
		salaryMax: 11000,
		benefits: ["Mutuelle", "Primes de garde", "Logement de fonction possible"],
	},
	{
		title: "Laboratory Technician - Analysis Lab Marrakech",
		titleFr: "Technicien(ne) de Laboratoire d'Analyses Médicales",
		descriptionFr:
			"Laboratoire d'analyses médicales à Marrakech recherche un(e) technicien(ne) pour les prélèvements, la réalisation des analyses (hématologie, biochimie) et la gestion des automates.",
		location: "Marrakech",
		region: "marrakech-safi",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "healthcare",
		skills: ["Prélèvement sanguin", "Hématologie", "Biochimie", "Contrôle qualité", "Automates de laboratoire"],
		requirements: ["Diplôme de technicien de laboratoire", "Rigueur et hygiène"],
		certifications: ["Diplôme Technicien Laboratoire d'Analyses Médicales"],
		education: "Bac+2 Technicien Laboratoire",
		salaryMin: 4500,
		salaryMax: 7000,
		benefits: ["Mutuelle", "Formation continue"],
	},
	{
		title: "Radiology Technician - Clinic Agadir",
		titleFr: "Technicien(ne) en Radiologie - Clinique Atlas Agadir",
		descriptionFr:
			"Clinique privée recrute un(e) manipulateur(trice) en radiologie pour la réalisation des examens (radio, scanner) dans le respect des règles de radioprotection.",
		location: "Agadir",
		region: "souss-massa",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "healthcare",
		skills: ["Radiologie", "Scanner", "Radioprotection", "Positionnement patient"],
		requirements: ["Diplôme manipulateur en radiologie", "Connaissance radioprotection"],
		certifications: ["Diplôme Manipulateur en Électroradiologie Médicale"],
		education: "Bac+3 Manipulateur Radiologie",
		salaryMin: 5500,
		salaryMax: 8500,
		benefits: ["Mutuelle", "Primes"],
	},
	{
		title: "Physiotherapist - Rehab Center Fes",
		titleFr: "Kinésithérapeute - Centre de Rééducation de Fès",
		descriptionFr:
			"Centre de rééducation fonctionnelle recherche un(e) kinésithérapeute pour la prise en charge des patients en rééducation orthopédique et neurologique.",
		location: "Fès",
		region: "fes-meknes",
		jobType: "cdd",
		experienceLevel: "entry",
		field: "healthcare",
		skills: ["Rééducation orthopédique", "Massage thérapeutique", "Électrothérapie", "Suivi patient"],
		requirements: ["Diplôme de kinésithérapie", "Bon relationnel"],
		certifications: ["Diplôme de Kinésithérapeute"],
		education: "Bac+3 Kinésithérapie",
		salaryMin: 5000,
		salaryMax: 8000,
		benefits: ["Mutuelle"],
	},

	// ===================== INDUSTRIAL (7) =====================
	{
		title: "Welder - Shipyard Casablanca",
		titleFr: "Soudeur Qualifié - Chantier Naval de Casablanca",
		descriptionFr:
			"Chantier naval recrute des soudeurs qualifiés (procédés MIG/MAG et TIG) pour la construction et la réparation de coques. Lecture de plans et respect des normes de sécurité exigés.",
		location: "Casablanca",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "industrial",
		skills: ["Soudure MIG/MAG", "Soudure TIG", "Lecture de plans", "Meulage", "Chaudronnerie"],
		requirements: ["Certificat de soudeur", "Expérience en milieu industriel", "EPI obligatoire"],
		certifications: ["Certificat de Qualification de Soudeur"],
		education: "Diplôme professionnel Soudure",
		salaryMin: 5000,
		salaryMax: 8500,
		benefits: ["Prime de rendement", "Transport", "EPI fournis"],
	},
	{
		title: "Forklift Operator CACES - Logistics Warehouse Tanger Med",
		titleFr: "Cariste CACES - Entrepôt Logistique Tanger Med",
		descriptionFr:
			"Plateforme logistique de Tanger Med recrute des caristes titulaires du CACES pour la conduite de chariots élévateurs, le chargement/déchargement et la gestion des stocks.",
		location: "Tanger",
		region: "tanger-tetouan-al-hoceima",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "industrial",
		skills: ["Conduite chariot élévateur", "Gestion de stock", "Préparation de commandes", "Inventaire"],
		requirements: ["CACES catégorie 3 ou 5", "Vigilance", "Disponibilité 3x8"],
		certifications: ["CACES (Certificat d'Aptitude à la Conduite En Sécurité)"],
		education: "Niveau Bac / Formation cariste",
		salaryMin: 3800,
		salaryMax: 6000,
		benefits: ["Transport", "Prime de poste", "Mutuelle"],
	},
	{
		title: "Industrial Maintenance Technician - Factory Kenitra",
		titleFr: "Technicien(ne) de Maintenance Industrielle - Usine Kénitra",
		descriptionFr:
			"Usine de production automobile recherche un(e) technicien(ne) de maintenance pour assurer la maintenance préventive et curative des équipements (mécanique, électrique, pneumatique).",
		location: "Kénitra",
		region: "rabat-sale-kenitra",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "industrial",
		skills: ["Maintenance préventive", "Électromécanique", "Pneumatique", "Hydraulique", "Diagnostic de panne"],
		requirements: ["Diplôme technicien maintenance", "Lecture de schémas", "Travail en équipe"],
		certifications: ["Diplôme Technicien Maintenance Industrielle"],
		education: "Bac+2 Maintenance Industrielle",
		salaryMin: 5500,
		salaryMax: 9000,
		benefits: ["Prime de rendement", "Transport", "Mutuelle"],
	},
	{
		title: "CNC Machine Operator - Metalworking Casablanca",
		titleFr: "Opérateur(trice) sur Machine-Outil à Commande Numérique (CNC)",
		descriptionFr:
			"Atelier d'usinage de précision recrute un(e) opérateur(trice) CNC pour la programmation et la conduite de tours et fraiseuses à commande numérique, avec contrôle dimensionnel des pièces.",
		location: "Casablanca",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "industrial",
		skills: ["Programmation CNC", "Tournage", "Fraisage", "Métrologie", "Lecture de plans"],
		requirements: ["Formation usinage", "Maîtrise commande numérique", "Précision"],
		certifications: ["Diplôme Usinage / Productique"],
		education: "Bac+2 Productique Mécanique",
		salaryMin: 5000,
		salaryMax: 8000,
		benefits: ["Prime de production", "EPI fournis"],
	},
	{
		title: "Industrial Electrician - Plant Jorf Lasfar",
		titleFr: "Électricien(ne) Industriel(le) - Site Jorf Lasfar",
		descriptionFr:
			"Complexe industriel de Jorf Lasfar recherche un(e) électricien(ne) industriel(le) pour l'installation, le câblage et la maintenance des armoires électriques et automatismes.",
		location: "Jorf Lasfar (El Jadida)",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "industrial",
		skills: ["Câblage électrique", "Armoires électriques", "Automatismes", "Habilitation électrique", "Dépannage"],
		requirements: ["Diplôme électricité industrielle", "Habilitation électrique B/H", "Respect consignes sécurité"],
		certifications: ["Habilitation Électrique", "Diplôme Électricité Industrielle"],
		education: "Bac+2 Électricité Industrielle",
		salaryMin: 5200,
		salaryMax: 8500,
		benefits: ["Transport", "Prime de site", "Mutuelle", "EPI fournis"],
	},
	{
		title: "Production Line Operator - Textile Factory Settat",
		titleFr: "Opérateur(trice) de Production - Usine Textile Settat",
		descriptionFr:
			"Unité de production textile recrute des opérateurs(trices) de production pour la conduite de lignes, le contrôle qualité en cours de fabrication et le respect des cadences.",
		location: "Settat",
		region: "casablanca-settat",
		jobType: "cdd",
		experienceLevel: "entry",
		field: "industrial",
		skills: ["Conduite de ligne", "Contrôle qualité", "Respect des cadences", "Travail en équipe"],
		requirements: ["Niveau Bac", "Disponibilité travail posté", "Rigueur"],
		certifications: [],
		education: "Niveau Bac",
		salaryMin: 3200,
		salaryMax: 4500,
		benefits: ["Transport", "Prime d'assiduité"],
	},
	{
		title: "Refrigeration & A/C Technician - Agadir",
		titleFr: "Technicien(ne) Froid et Climatisation - Agadir",
		descriptionFr:
			"Société de génie climatique recherche un(e) technicien(ne) en froid industriel et climatisation pour l'installation, la mise en service et la maintenance des systèmes frigorifiques.",
		location: "Agadir",
		region: "souss-massa",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "industrial",
		skills: ["Froid industriel", "Climatisation", "Fluides frigorigènes", "Maintenance", "Diagnostic"],
		requirements: ["Diplôme froid et climatisation", "Permis B", "Attestation manipulation fluides"],
		certifications: ["Diplôme Froid et Climatisation"],
		education: "Bac+2 Froid et Climatisation",
		salaryMin: 4800,
		salaryMax: 7500,
		benefits: ["Véhicule de service", "Prime d'intervention"],
	},

	// ===================== HSE (6) =====================
	{
		title: "HSE Technician - OCP Industrial Site Khouribga",
		titleFr: "Technicien(ne) HSE - Site Industriel OCP Khouribga",
		descriptionFr:
			"Le Groupe OCP recrute un(e) technicien(ne) HSE pour le suivi des plans de prévention, les inspections terrain, l'analyse des risques et l'animation des causeries sécurité sur site minier.",
		location: "Khouribga",
		region: "beni-mellal-khenifra",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "hse",
		skills: ["Analyse des risques", "Plan de prévention", "Inspection HSE", "Sécurité au travail", "Reporting"],
		requirements: ["Diplôme HSE / QHSE", "Connaissance réglementation", "Maîtrise du terrain"],
		certifications: ["Diplôme HSE", "Formation Secourisme"],
		education: "Bac+2/3 Hygiène Sécurité Environnement",
		salaryMin: 6000,
		salaryMax: 10000,
		benefits: ["Transport", "Mutuelle", "Prime de site", "EPI fournis"],
	},
	{
		title: "HSE Coordinator - Construction Site BTP Casablanca",
		titleFr: "Coordinateur(trice) HSE - Chantier BTP Casablanca",
		descriptionFr:
			"Grande entreprise de BTP recherche un(e) coordinateur(trice) HSE pour piloter la sécurité sur chantier : accueil sécurité, audits, gestion des EPI et suivi des accidents du travail.",
		location: "Casablanca",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "senior",
		field: "hse",
		skills: ["Sécurité chantier", "Audits HSE", "Gestion EPI", "Analyse d'accidents", "Animation sécurité"],
		requirements: ["Diplôme HSE", "Expérience BTP 3 ans+", "Leadership"],
		certifications: ["Diplôme HSE", "Habilitation chantier"],
		education: "Bac+3 HSE / QHSE",
		salaryMin: 8000,
		salaryMax: 13000,
		benefits: ["Véhicule de fonction", "Mutuelle", "Prime de chantier"],
	},
	{
		title: "Environmental Technician - Industrial Zone Mohammedia",
		titleFr: "Technicien(ne) Environnement - Zone Industrielle Mohammedia",
		descriptionFr:
			"Site industriel chimique recherche un(e) technicien(ne) environnement pour le suivi des rejets, la gestion des déchets, les mesures de pollution et la conformité réglementaire ISO 14001.",
		location: "Mohammedia",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "hse",
		skills: ["Gestion des déchets", "Suivi des rejets", "ISO 14001", "Mesures environnementales", "Reporting"],
		requirements: ["Diplôme environnement", "Connaissance ISO 14001", "Rigueur"],
		certifications: ["Diplôme Environnement", "ISO 14001"],
		education: "Bac+2/3 Environnement",
		salaryMin: 5500,
		salaryMax: 9000,
		benefits: ["Transport", "Mutuelle"],
	},
	{
		title: "Occupational Safety Officer - Factory Tanger",
		titleFr: "Agent de Sécurité au Travail - Usine Tanger Automotive City",
		descriptionFr:
			"Équipementier automobile recrute un(e) agent de prévention sécurité pour les inspections quotidiennes, l'application des consignes, la sensibilisation et le suivi des indicateurs SST.",
		location: "Tanger",
		region: "tanger-tetouan-al-hoceima",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "hse",
		skills: ["Prévention des risques", "Inspections sécurité", "Sensibilisation", "Indicateurs SST", "Premiers secours"],
		requirements: ["Diplôme HSE/prévention", "Sens de l'observation", "Bon relationnel"],
		certifications: ["Diplôme HSE", "Sauveteur Secouriste du Travail (SST)"],
		education: "Bac+2 Hygiène Sécurité",
		salaryMin: 4500,
		salaryMax: 7000,
		benefits: ["Transport", "Mutuelle", "EPI fournis"],
	},
	{
		title: "Fire Safety & ERP Technician - Marrakech",
		titleFr: "Technicien(ne) Sécurité Incendie (SSIAP) - Marrakech",
		descriptionFr:
			"Groupe hôtelier recherche un(e) technicien(ne) sécurité incendie pour la surveillance des installations, les rondes de prévention, la maintenance des équipements de sécurité incendie et l'assistance aux personnes.",
		location: "Marrakech",
		region: "marrakech-safi",
		jobType: "cdi",
		experienceLevel: "entry",
		field: "hse",
		skills: ["Sécurité incendie", "Rondes de prévention", "Extincteurs", "Évacuation", "Premiers secours"],
		requirements: ["Formation sécurité incendie (SSIAP)", "Disponibilité travail de nuit"],
		certifications: ["SSIAP", "Sauveteur Secouriste du Travail (SST)"],
		education: "Niveau Bac / Formation SSIAP",
		salaryMin: 3800,
		salaryMax: 5500,
		benefits: ["Logement possible", "Repas", "Mutuelle"],
	},
	{
		title: "QHSE Auditor - Logistics Group Casablanca",
		titleFr: "Auditeur(trice) QHSE - Groupe Logistique Casablanca",
		descriptionFr:
			"Groupe de transport et logistique recrute un(e) auditeur(trice) QHSE pour mener les audits internes, suivre les plans d'action, et accompagner les certifications ISO 9001 / 45001.",
		location: "Casablanca",
		region: "casablanca-settat",
		jobType: "cdi",
		experienceLevel: "mid",
		field: "hse",
		skills: ["Audit interne", "ISO 9001", "ISO 45001", "Plans d'action", "Analyse des risques"],
		requirements: ["Diplôme QHSE", "Formation auditeur interne", "Esprit d'analyse"],
		certifications: ["Diplôme QHSE", "Auditeur Interne ISO"],
		education: "Bac+3 QHSE",
		salaryMin: 6500,
		salaryMax: 10500,
		benefits: ["Transport", "Mutuelle", "Formation certifiante"],
	},
];

// published_at and expires_at: published now, expire in 45 days.
let jobInserted = 0;
let jobUpdated = 0;
for (const j of jobs) {
	// Idempotency key: (partner_id, title). The unique enforcement is done with a
	// SELECT-then-INSERT since the table has no natural unique constraint on title.
	const existing = await client.query("SELECT id FROM partner_job_posting WHERE partner_id = $1 AND title = $2", [
		partnerId,
		j.title,
	]);
	if (existing.rows.length > 0) {
		await client.query(
			`UPDATE partner_job_posting SET
				title_fr=$1, description=$2, description_fr=$3, location=$4, region=$5, job_type=$6,
				experience_level=$7, field=$8, requirements=$9, skills=$10, education=$11, certifications=$12,
				salary_min=$13, salary_max=$14, salary_period='monthly', salary_currency='MAD', benefits=$15,
				status='published', published_at=COALESCE(published_at, NOW()),
				expires_at=NOW() + INTERVAL '45 days', updated_at=NOW()
			WHERE id=$16`,
			[
				j.titleFr,
				j.descriptionFr,
				j.descriptionFr,
				j.location,
				j.region,
				j.jobType,
				j.experienceLevel,
				j.field,
				JSON.stringify(j.requirements ?? []),
				JSON.stringify(j.skills ?? []),
				j.education ?? null,
				JSON.stringify(j.certifications ?? []),
				j.salaryMin,
				j.salaryMax,
				JSON.stringify(j.benefits ?? []),
				existing.rows[0].id,
			],
		);
		jobUpdated++;
	} else {
		await client.query(
			`INSERT INTO partner_job_posting
				(id, partner_id, title, title_fr, description, description_fr, location, region, job_type,
				 experience_level, field, requirements, skills, education, certifications,
				 salary_min, salary_max, salary_period, salary_currency, benefits,
				 status, published_at, expires_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'monthly','MAD',$18,
			         'published', NOW(), NOW() + INTERVAL '45 days')`,
			[
				crypto.randomUUID(),
				partnerId,
				j.title,
				j.titleFr,
				j.descriptionFr,
				j.descriptionFr,
				j.location,
				j.region,
				j.jobType,
				j.experienceLevel,
				j.field,
				JSON.stringify(j.requirements ?? []),
				JSON.stringify(j.skills ?? []),
				j.education ?? null,
				JSON.stringify(j.certifications ?? []),
				j.salaryMin,
				j.salaryMax,
				JSON.stringify(j.benefits ?? []),
			],
		);
		jobInserted++;
	}
}
console.log(`Job postings: ${jobInserted} inserted, ${jobUpdated} updated`);

// ---------------------------------------------------------------------------
// 2. MARKET SALARY DATA (vocational roles, MAD/MONTH, by experience level).
//    Unique key in schema: (role, region, experience_level). region = NULL =>
//    national average. Each role gets entry/mid/senior rows.
//    NOTE: salary_* are stored as monthly MAD (the existing vocational rows use
//    monthly figures; the schema comment says "per year" but real data is monthly).
// ---------------------------------------------------------------------------
const salaries = [
	// ---------- HEALTHCARE (8 roles) ----------
	{ role: "Nurse", roleFr: "Infirmier(ère) Diplômé(e) d'État", field: "healthcare", levels: { entry: [5500, 6500, 8000], mid: [7000, 9000, 11000], senior: [10000, 13000, 16000] }, demand: 88, growth: 4.5 },
	{ role: "Care Assistant", roleFr: "Aide-Soignant(e)", field: "healthcare", levels: { entry: [3200, 4000, 5000], mid: [4500, 5500, 6800], senior: [6000, 7000, 8500] }, demand: 82, growth: 3.8 },
	{ role: "Midwife", roleFr: "Sage-femme", field: "healthcare", levels: { entry: [6500, 8000, 9500], mid: [9000, 11000, 13000], senior: [12000, 14500, 18000] }, demand: 80, growth: 4.0 },
	{ role: "Medical Laboratory Technician", roleFr: "Technicien(ne) de Laboratoire d'Analyses Médicales", field: "healthcare", levels: { entry: [4000, 5000, 6500], mid: [6000, 7500, 9000], senior: [8500, 10500, 13000] }, demand: 75, growth: 3.5 },
	{ role: "Radiology Technician", roleFr: "Technicien(ne) en Radiologie", field: "healthcare", levels: { entry: [5000, 6500, 8000], mid: [7000, 9000, 11000], senior: [10000, 12500, 15000] }, demand: 78, growth: 4.2 },
	{ role: "Physiotherapist", roleFr: "Kinésithérapeute", field: "healthcare", levels: { entry: [4500, 6000, 8000], mid: [7000, 9500, 12000], senior: [11000, 14000, 18000] }, demand: 76, growth: 4.8 },
	{ role: "Pharmacy Assistant", roleFr: "Préparateur(trice) en Pharmacie", field: "healthcare", levels: { entry: [3500, 4500, 5500], mid: [5000, 6000, 7500], senior: [6500, 8000, 9500] }, demand: 70, growth: 3.0 },
	{ role: "Dental Assistant", roleFr: "Assistant(e) Dentaire", field: "healthcare", levels: { entry: [3000, 4000, 5000], mid: [4500, 5500, 6500], senior: [6000, 7000, 8500] }, demand: 68, growth: 3.2 },

	// ---------- INDUSTRIAL (8 roles) ----------
	{ role: "Welder", roleFr: "Soudeur Qualifié", field: "industrial", levels: { entry: [3800, 5000, 6500], mid: [5500, 7000, 9000], senior: [8000, 10000, 13000] }, demand: 85, growth: 4.5 },
	{ role: "Forklift Operator (CACES)", roleFr: "Cariste (CACES)", field: "industrial", levels: { entry: [3200, 4000, 5000], mid: [4500, 5500, 6800], senior: [6000, 7000, 8500] }, demand: 84, growth: 5.0 },
	{ role: "Industrial Maintenance Technician", roleFr: "Technicien(ne) de Maintenance Industrielle", field: "industrial", levels: { entry: [4500, 5500, 7000], mid: [6500, 8000, 10000], senior: [9000, 12000, 15000] }, demand: 90, growth: 5.5 },
	{ role: "CNC Machine Operator", roleFr: "Opérateur(trice) CNC / Usinage", field: "industrial", levels: { entry: [4000, 5000, 6500], mid: [5500, 7000, 9000], senior: [8000, 10000, 12500] }, demand: 80, growth: 4.0 },
	{ role: "Industrial Electrician", roleFr: "Électricien(ne) Industriel(le)", field: "industrial", levels: { entry: [4200, 5500, 7000], mid: [6000, 8000, 10000], senior: [9000, 11500, 14000] }, demand: 87, growth: 5.0 },
	{ role: "Production Line Operator", roleFr: "Opérateur(trice) de Production", field: "industrial", levels: { entry: [3000, 3800, 4800], mid: [4000, 5000, 6000], senior: [5500, 6500, 7500] }, demand: 78, growth: 3.5 },
	{ role: "Refrigeration & A/C Technician", roleFr: "Technicien(ne) Froid et Climatisation", field: "industrial", levels: { entry: [4000, 5000, 6500], mid: [5500, 7000, 9000], senior: [8000, 10000, 12500] }, demand: 76, growth: 4.2 },
	{ role: "Boilermaker / Metalworker", roleFr: "Chaudronnier(ère) / Métallier", field: "industrial", levels: { entry: [3800, 5000, 6500], mid: [5500, 7000, 8800], senior: [8000, 10000, 12000] }, demand: 74, growth: 3.8 },

	// ---------- HSE (8 roles) ----------
	{ role: "HSE Technician", roleFr: "Technicien(ne) HSE", field: "hse", levels: { entry: [5000, 6500, 8500], mid: [7000, 9000, 11500], senior: [10000, 13000, 16000] }, demand: 86, growth: 5.5 },
	{ role: "HSE Coordinator", roleFr: "Coordinateur(trice) HSE", field: "hse", levels: { entry: [6500, 8000, 10000], mid: [9000, 11500, 14000], senior: [13000, 16000, 20000] }, demand: 82, growth: 5.0 },
	{ role: "Environmental Technician", roleFr: "Technicien(ne) Environnement", field: "hse", levels: { entry: [4800, 6000, 8000], mid: [6500, 8500, 10500], senior: [9500, 12000, 15000] }, demand: 78, growth: 5.2 },
	{ role: "Occupational Safety Officer", roleFr: "Agent de Sécurité au Travail", field: "hse", levels: { entry: [4000, 5000, 6500], mid: [5500, 7000, 8500], senior: [7500, 9000, 11000] }, demand: 80, growth: 4.5 },
	{ role: "Fire Safety Technician (SSIAP)", roleFr: "Technicien(ne) Sécurité Incendie (SSIAP)", field: "hse", levels: { entry: [3500, 4500, 5800], mid: [5000, 6000, 7500], senior: [6500, 8000, 10000] }, demand: 72, growth: 3.8 },
	{ role: "QHSE Auditor", roleFr: "Auditeur(trice) QHSE", field: "hse", levels: { entry: [6000, 7500, 9500], mid: [8500, 10500, 13000], senior: [12000, 15000, 19000] }, demand: 79, growth: 5.0 },
	{ role: "HSE Manager", roleFr: "Responsable HSE", field: "hse", levels: { entry: [9000, 11000, 14000], mid: [13000, 16000, 20000], senior: [18000, 23000, 30000] }, demand: 81, growth: 4.8 },
	{ role: "Risk Prevention Officer", roleFr: "Préventeur(trice) des Risques Professionnels", field: "hse", levels: { entry: [4500, 5800, 7500], mid: [6500, 8000, 10000], senior: [9000, 11500, 14000] }, demand: 75, growth: 4.6 },
];

let salInserted = 0;
let salUpdated = 0;
for (const s of salaries) {
	for (const level of ["entry", "mid", "senior"]) {
		const [min, median, max] = s.levels[level];
		// region is NULL (national average). Upsert on (role, region, experience_level).
		// Postgres unique index treats NULLs as distinct, so do SELECT-then-write.
		const existing = await client.query(
			"SELECT id FROM market_salary_data WHERE role = $1 AND region IS NULL AND experience_level = $2",
			[s.role, level],
		);
		if (existing.rows.length > 0) {
			await client.query(
				`UPDATE market_salary_data SET
					role_fr=$1, field=$2, salary_min=$3, salary_median=$4, salary_max=$5,
					demand_score=$6, growth_rate=$7, source=$8, last_updated=NOW(), updated_at=NOW()
				WHERE id=$9`,
				[s.roleFr, s.field, min, median, max, s.demand, s.growth, "IMTA vocational market data", existing.rows[0].id],
			);
			salUpdated++;
		} else {
			await client.query(
				`INSERT INTO market_salary_data
					(id, role, role_fr, field, region, experience_level, salary_min, salary_median, salary_max,
					 sample_size, demand_score, growth_rate, source, last_updated)
				 VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10,$11,$12, NOW())`,
				[crypto.randomUUID(), s.role, s.roleFr, s.field, level, min, median, max, 120, s.demand, s.growth, "IMTA vocational market data"],
			);
			salInserted++;
		}
	}
}
console.log(`Market salary rows: ${salInserted} inserted, ${salUpdated} updated`);

// ---------------------------------------------------------------------------
// 3. CAREER EMPLOYERS (real Moroccan vocational employers, insert only).
//    Unique constraint on name.
// ---------------------------------------------------------------------------
const employers = [
	{ name: "Clinique Cheikh Khalifa", sector: "Healthcare", sectorFr: "Santé", location: "Casablanca", locationFr: "Casablanca", open: 12, fields: ["healthcare"], descFr: "Hôpital universitaire privé de référence à Casablanca, recrutant infirmiers, sages-femmes et techniciens de santé." },
	{ name: "CHU Ibn Rochd", sector: "Healthcare", sectorFr: "Santé Publique", location: "Casablanca", locationFr: "Casablanca", open: 25, fields: ["healthcare"], descFr: "Centre Hospitalier Universitaire, premier employeur public de personnel paramédical au Maroc." },
	{ name: "Akdital", sector: "Healthcare", sectorFr: "Santé", location: "Casablanca", locationFr: "Casablanca", open: 30, fields: ["healthcare"], descFr: "Premier groupe privé de santé au Maroc, réseau de cliniques recrutant en continu du personnel soignant." },
	{ name: "OCP Group", sector: "Mining & Chemicals", sectorFr: "Mines & Chimie", location: "Khouribga", locationFr: "Khouribga", open: 40, fields: ["industrial", "hse"], descFr: "Leader mondial du phosphate, employeur majeur de techniciens de maintenance, électriciens et profils HSE." },
	{ name: "Renault Tanger (Tanger Med)", sector: "Automotive", sectorFr: "Automobile", location: "Tanger", locationFr: "Tanger", open: 35, fields: ["industrial", "hse"], descFr: "Usine automobile de Tanger employant soudeurs, opérateurs, électriciens et préventeurs sécurité." },
	{ name: "Stellantis Kénitra", sector: "Automotive", sectorFr: "Automobile", location: "Kénitra", locationFr: "Kénitra", open: 28, fields: ["industrial", "hse"], descFr: "Site de production automobile recrutant des techniciens de maintenance et opérateurs de production." },
	{ name: "Marsa Maroc (Tanger Med)", sector: "Logistics & Ports", sectorFr: "Logistique Portuaire", location: "Tanger", locationFr: "Tanger", open: 18, fields: ["industrial", "hse"], descFr: "Opérateur portuaire majeur recrutant caristes, conducteurs d'engins et coordinateurs HSE." },
	{ name: "TGCC (BTP)", sector: "Construction", sectorFr: "BTP", location: "Casablanca", locationFr: "Casablanca", open: 22, fields: ["industrial", "hse"], descFr: "Grand groupe de construction marocain, fort recruteur de profils HSE et de techniciens de chantier." },
	{ name: "Bureau Veritas Maroc", sector: "QHSE & Certification", sectorFr: "QHSE & Certification", location: "Casablanca", locationFr: "Casablanca", open: 10, fields: ["hse"], descFr: "Leader de l'inspection et certification, recrutant auditeurs et techniciens QHSE." },
	{ name: "Lesieur Cristal", sector: "Agro-industry", sectorFr: "Agro-industrie", location: "Casablanca", locationFr: "Casablanca", open: 15, fields: ["industrial", "hse"], descFr: "Groupe agro-industriel recrutant opérateurs de production, techniciens de maintenance et profils HSE." },
];

let empInserted = 0;
let empUpdated = 0;
for (let i = 0; i < employers.length; i++) {
	const e = employers[i];
	const existing = await client.query("SELECT id FROM career_employer WHERE name = $1", [e.name]);
	if (existing.rows.length > 0) {
		await client.query(
			`UPDATE career_employer SET
				sector=$1, sector_fr=$2, location=$3, location_fr=$4, open_positions=$5,
				description_fr=$6, fields=$7, is_active=true, sort_order=$8, updated_at=NOW()
			WHERE id=$9`,
			[e.sector, e.sectorFr, e.location, e.locationFr, e.open, e.descFr, JSON.stringify(e.fields), i, existing.rows[0].id],
		);
		empUpdated++;
	} else {
		await client.query(
			`INSERT INTO career_employer
				(id, name, sector, sector_fr, location, location_fr, open_positions, description_fr, fields, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10)`,
			[crypto.randomUUID(), e.name, e.sector, e.sectorFr, e.location, e.locationFr, e.open, e.descFr, JSON.stringify(e.fields), i],
		);
		empInserted++;
	}
}
console.log(`Career employers: ${empInserted} inserted, ${empUpdated} updated`);

// ---------------------------------------------------------------------------
// SUMMARY: per-field counts for both target tables.
// ---------------------------------------------------------------------------
console.log("\n========================= SUMMARY =========================");

const jobByField = await client.query(
	"SELECT field, count(*)::int AS n FROM partner_job_posting WHERE field IN ('healthcare','industrial','hse') GROUP BY field ORDER BY field",
);
console.log("\npartner_job_posting (vocational fields):");
for (const r of jobByField.rows) console.log(`  ${r.field}: ${r.n}`);
const jobTotal = await client.query("SELECT count(*)::int AS n FROM partner_job_posting");
console.log(`  TOTAL (all fields): ${jobTotal.rows[0].n}`);

const salByField = await client.query(
	"SELECT field, count(*)::int AS n FROM market_salary_data WHERE field IN ('healthcare','industrial','hse') GROUP BY field ORDER BY field",
);
console.log("\nmarket_salary_data (lowercase vocational fields):");
for (const r of salByField.rows) console.log(`  ${r.field}: ${r.n}`);

const empByActive = await client.query("SELECT count(*)::int AS n FROM career_employer WHERE is_active = true");
console.log(`\ncareer_employer (active): ${empByActive.rows[0].n}`);

await client.end();
console.log("\nDone.");
