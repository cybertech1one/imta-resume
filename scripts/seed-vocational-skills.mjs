/**
 * Seed REAL IMTA-vocational skills + field-relevant skills-quiz questions (French).
 *
 * Problem: skill_library (438 rows) had NONE tagged for the three IMTA fields
 * (healthcare / industrial / hse). Students saw generic engineering/IT skills
 * (Python, Java, génie-électrique...) instead of nursing/welding/HSE skills.
 *
 * What this script does (idempotent, insert/update only):
 *   1. Seeds >=15 FRENCH, profession-appropriate skills per IMTA field
 *      (healthcare, industrial, hse) into skill_library, using deterministic
 *      IDs + ON CONFLICT(id) DO UPDATE. category in: technical|soft|certification|tool|language.
 *   2. quiz_question HAS a `field` column -> adds field-tagged FRENCH skills-quiz
 *      questions for each IMTA field (the existing 30 generic questions stay).
 *   3. career_quiz_question has NO `field` column -> NOT touched (field-generic by design).
 *
 * DB: LOCAL PostgreSQL on 5432.
 * Usage: node scripts/seed-vocational-skills.mjs
 */

import pg from "pg";

const { Client } = pg;
const CONNECTION_STRING =
	process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// ----------------------------------------------------------------------------
// Deterministic UUID helper (UUIDv5-style, stable across runs for idempotency)
// ----------------------------------------------------------------------------
import { createHash } from "node:crypto";

function deterministicUuid(seed) {
	const h = createHash("sha1").update(`imta-vocational:${seed}`).digest("hex");
	// Format as a UUID (set version 5 + RFC variant bits)
	const b = h.slice(0, 32).split("");
	b[12] = "5";
	b[16] = ((Number.parseInt(b[16], 16) & 0x3) | 0x8).toString(16);
	const s = b.join("");
	return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
}

// ----------------------------------------------------------------------------
// 1. SKILL LIBRARY — >=15 per IMTA field, FRENCH, profession-appropriate
//    category: technical | soft | certification | tool | language
// ----------------------------------------------------------------------------
const SKILLS = [
	// ===================== HEALTHCARE / SANTÉ =====================
	{ field: "healthcare", category: "technical", nameFr: "Soins infirmiers généraux", name: "General nursing care", descriptionFr: "Dispenser des soins infirmiers de base et techniques aux patients hospitalisés." },
	{ field: "healthcare", category: "technical", nameFr: "Prise de constantes vitales", name: "Vital signs monitoring", descriptionFr: "Mesurer et interpréter tension, pouls, température, saturation et fréquence respiratoire." },
	{ field: "healthcare", category: "technical", nameFr: "Hygiène hospitalière et asepsie", name: "Hospital hygiene & asepsis", descriptionFr: "Appliquer les protocoles d'hygiène, de désinfection et de prévention des infections nosocomiales." },
	{ field: "healthcare", category: "technical", nameFr: "Gestes et soins d'urgence", name: "Emergency care procedures", descriptionFr: "Réaliser les premiers secours, la RCP et la prise en charge des urgences vitales." },
	{ field: "healthcare", category: "technical", nameFr: "Administration des médicaments", name: "Medication administration", descriptionFr: "Préparer et administrer les traitements (voie orale, injectable, perfusion) en respectant les règles de sécurité." },
	{ field: "healthcare", category: "technical", nameFr: "Pose et surveillance de perfusion", name: "IV therapy", descriptionFr: "Mettre en place et surveiller une voie veineuse périphérique et les perfusions." },
	{ field: "healthcare", category: "technical", nameFr: "Soins de plaies et pansements", name: "Wound care & dressings", descriptionFr: "Évaluer, nettoyer et panser les plaies et escarres selon les protocoles." },
	{ field: "healthcare", category: "technical", nameFr: "Tenue du dossier de soins", name: "Patient care records", descriptionFr: "Renseigner et assurer la traçabilité des transmissions dans le dossier de soins du patient." },
	{ field: "healthcare", category: "technical", nameFr: "Aide à la toilette et au confort", name: "Patient hygiene & comfort", descriptionFr: "Accompagner les patients dépendants dans les soins d'hygiène et de confort quotidiens." },
	{ field: "healthcare", category: "technical", nameFr: "Prélèvements biologiques", name: "Biological sampling", descriptionFr: "Effectuer les prélèvements sanguins et autres prélèvements pour analyses." },
	{ field: "healthcare", category: "soft", nameFr: "Relation et communication patient", name: "Patient communication", descriptionFr: "Établir une relation de confiance et communiquer avec empathie auprès des patients et familles." },
	{ field: "healthcare", category: "soft", nameFr: "Écoute active et empathie", name: "Active listening & empathy", descriptionFr: "Écouter, rassurer et soutenir les patients dans des situations sensibles." },
	{ field: "healthcare", category: "soft", nameFr: "Travail en équipe pluridisciplinaire", name: "Multidisciplinary teamwork", descriptionFr: "Collaborer avec médecins, aides-soignants et autres professionnels de santé." },
	{ field: "healthcare", category: "soft", nameFr: "Gestion du stress et des situations critiques", name: "Stress management", descriptionFr: "Garder son sang-froid et prioriser face à l'urgence et à la charge émotionnelle." },
	{ field: "healthcare", category: "certification", nameFr: "Secourisme (PSC1 / BLS)", name: "First aid certification (BLS)", descriptionFr: "Certification aux gestes de premiers secours et au support de base de la vie." },
	{ field: "healthcare", category: "certification", nameFr: "Diplôme d'État d'infirmier", name: "State Nursing Diploma", descriptionFr: "Diplôme reconnu attestant la qualification d'infirmier(ère) polyvalent(e)." },
	{ field: "healthcare", category: "tool", nameFr: "Utilisation du matériel médical", name: "Medical equipment operation", descriptionFr: "Manipuler en sécurité tensiomètre, glucomètre, pousse-seringue et oxygénothérapie." },

	// ===================== INDUSTRIAL / INDUSTRIE =====================
	{ field: "industrial", category: "technical", nameFr: "Soudure MIG/MAG", name: "MIG/MAG welding", descriptionFr: "Réaliser des assemblages soudés au procédé semi-automatique sous gaz (MIG/MAG)." },
	{ field: "industrial", category: "technical", nameFr: "Soudure TIG", name: "TIG welding", descriptionFr: "Effectuer des soudures de précision au procédé TIG sur aciers et alliages." },
	{ field: "industrial", category: "technical", nameFr: "Lecture de plans techniques", name: "Technical blueprint reading", descriptionFr: "Interpréter plans, schémas et dessins industriels pour la fabrication et le montage." },
	{ field: "industrial", category: "technical", nameFr: "Conduite de chariot élévateur", name: "Forklift operation", descriptionFr: "Manœuvrer en sécurité un chariot élévateur pour la manutention de charges." },
	{ field: "industrial", category: "technical", nameFr: "Maintenance préventive", name: "Preventive maintenance", descriptionFr: "Planifier et réaliser les opérations d'entretien préventif des équipements." },
	{ field: "industrial", category: "technical", nameFr: "Maintenance corrective et dépannage", name: "Corrective maintenance", descriptionFr: "Diagnostiquer les pannes et remettre en service les machines de production." },
	{ field: "industrial", category: "technical", nameFr: "Électromécanique", name: "Electromechanics", descriptionFr: "Intervenir sur les systèmes combinant mécanique et électricité des équipements industriels." },
	{ field: "industrial", category: "technical", nameFr: "Câblage et armoires électriques", name: "Electrical wiring & panels", descriptionFr: "Réaliser le câblage et le raccordement d'armoires et de coffrets électriques." },
	{ field: "industrial", category: "technical", nameFr: "Usinage et tournage-fraisage", name: "Machining (turning/milling)", descriptionFr: "Fabriquer des pièces mécaniques par tournage et fraisage conventionnels ou CNC." },
	{ field: "industrial", category: "technical", nameFr: "Pneumatique et hydraulique", name: "Pneumatics & hydraulics", descriptionFr: "Monter et régler les circuits pneumatiques et hydrauliques des installations." },
	{ field: "industrial", category: "technical", nameFr: "Métrologie et contrôle dimensionnel", name: "Metrology & dimensional control", descriptionFr: "Contrôler la conformité des pièces à l'aide d'instruments de mesure (pied à coulisse, micromètre)." },
	{ field: "industrial", category: "soft", nameFr: "Respect des consignes de sécurité machine", name: "Machine safety compliance", descriptionFr: "Appliquer les procédures de sécurité et de consignation lors des interventions sur machine." },
	{ field: "industrial", category: "soft", nameFr: "Rigueur et minutie", name: "Precision & rigor", descriptionFr: "Travailler avec précision et respecter les tolérances et les modes opératoires." },
	{ field: "industrial", category: "soft", nameFr: "Travail en équipe en atelier", name: "Workshop teamwork", descriptionFr: "Coordonner ses tâches avec les autres opérateurs sur la chaîne de production." },
	{ field: "industrial", category: "certification", nameFr: "CACES (conduite d'engins)", name: "CACES certification", descriptionFr: "Certificat d'aptitude à la conduite en sécurité des engins de manutention." },
	{ field: "industrial", category: "certification", nameFr: "Habilitation électrique", name: "Electrical authorization", descriptionFr: "Habilitation requise pour intervenir en sécurité sur les installations électriques." },
	{ field: "industrial", category: "tool", nameFr: "Lecture de schémas électriques", name: "Electrical schematics reading", descriptionFr: "Comprendre et exploiter les schémas électriques pour le dépannage et le montage." },

	// ===================== HSE / SÉCURITÉ-SANTÉ-ENVIRONNEMENT =====================
	{ field: "hse", category: "technical", nameFr: "Évaluation des risques professionnels", name: "Occupational risk assessment", descriptionFr: "Identifier, analyser et hiérarchiser les risques pour élaborer le document unique." },
	{ field: "hse", category: "technical", nameFr: "Analyse d'accident (arbre des causes)", name: "Accident investigation", descriptionFr: "Mener l'enquête après accident et identifier les causes racines via l'arbre des causes." },
	{ field: "hse", category: "technical", nameFr: "Prévention et lutte contre l'incendie", name: "Fire prevention", descriptionFr: "Mettre en place les mesures de prévention incendie et l'organisation des secours." },
	{ field: "hse", category: "technical", nameFr: "Gestion des équipements de protection (EPI)", name: "PPE management", descriptionFr: "Choisir, distribuer et contrôler le port des équipements de protection individuelle." },
	{ field: "hse", category: "technical", nameFr: "Élaboration du plan HSE", name: "HSE plan development", descriptionFr: "Concevoir et déployer le plan Hygiène, Sécurité et Environnement d'un site." },
	{ field: "hse", category: "technical", nameFr: "Audit et inspection sécurité", name: "Safety audit & inspection", descriptionFr: "Réaliser les inspections terrain et audits de conformité sécurité." },
	{ field: "hse", category: "technical", nameFr: "Gestion des déchets industriels", name: "Industrial waste management", descriptionFr: "Organiser le tri, le stockage et l'élimination réglementaire des déchets." },
	{ field: "hse", category: "technical", nameFr: "Sécurité chimique et fiches FDS", name: "Chemical safety (SDS)", descriptionFr: "Gérer les produits dangereux à partir des fiches de données de sécurité (FDS)." },
	{ field: "hse", category: "technical", nameFr: "Plan de prévention et permis de travail", name: "Work permits & prevention plans", descriptionFr: "Rédiger les plans de prévention et délivrer les permis de travail (feu, espaces confinés)." },
	{ field: "hse", category: "technical", nameFr: "Surveillance environnementale", name: "Environmental monitoring", descriptionFr: "Suivre les rejets, mesures de bruit, poussières et indicateurs environnementaux." },
	{ field: "hse", category: "certification", nameFr: "Norme ISO 45001 (santé-sécurité)", name: "ISO 45001 standard", descriptionFr: "Maîtriser le système de management de la santé et sécurité au travail ISO 45001." },
	{ field: "hse", category: "certification", nameFr: "Norme ISO 14001 (environnement)", name: "ISO 14001 standard", descriptionFr: "Connaître le système de management environnemental selon la norme ISO 14001." },
	{ field: "hse", category: "soft", nameFr: "Animation de formations sécurité", name: "Safety training delivery", descriptionFr: "Sensibiliser et former le personnel aux bonnes pratiques de sécurité (causeries, accueil sécurité)." },
	{ field: "hse", category: "soft", nameFr: "Sens de l'observation et vigilance", name: "Observation & vigilance", descriptionFr: "Détecter les situations dangereuses et les comportements à risque sur le terrain." },
	{ field: "hse", category: "soft", nameFr: "Communication et reporting HSE", name: "HSE communication & reporting", descriptionFr: "Rédiger les rapports d'incident et communiquer les indicateurs de sécurité à la direction." },
	{ field: "hse", category: "tool", nameFr: "Indicateurs HSE (taux de fréquence/gravité)", name: "HSE KPIs", descriptionFr: "Calculer et suivre les indicateurs de performance sécurité (TF, TG, accidentologie)." },
];

// ----------------------------------------------------------------------------
// 2. QUIZ_QUESTION — field-tagged FRENCH skills-quiz questions per IMTA field
//    (quiz_question HAS a `field` column; quiz_type=skills_quiz, category=skills)
//    options JSONB: { id, text, textFr, scores:{correct:0|1}, sortOrder }
// ----------------------------------------------------------------------------
function mcOption(id, textFr, correct, sortOrder) {
	return { id, text: textFr, textFr, scores: { correct: correct ? 1 : 0 }, sortOrder };
}

const QUIZ = [
	// ---------- HEALTHCARE ----------
	{
		field: "healthcare",
		trait: "patient_care",
		questionFr: "Quelle est la valeur normale de la fréquence cardiaque au repos chez l'adulte ?",
		options: [
			mcOption("hc-q1-a", "30 à 50 battements par minute", false, 1),
			mcOption("hc-q1-b", "60 à 100 battements par minute", true, 2),
			mcOption("hc-q1-c", "110 à 140 battements par minute", false, 3),
			mcOption("hc-q1-d", "150 à 180 battements par minute", false, 4),
		],
	},
	{
		field: "healthcare",
		trait: "patient_care",
		questionFr: "Avant tout soin direct au patient, quel geste d'hygiène est prioritaire ?",
		options: [
			mcOption("hc-q2-a", "Mettre une blouse stérile", false, 1),
			mcOption("hc-q2-b", "Réaliser une friction hydro-alcoolique des mains", true, 2),
			mcOption("hc-q2-c", "Désinfecter le sol de la chambre", false, 3),
			mcOption("hc-q2-d", "Aérer la pièce", false, 4),
		],
	},
	{
		field: "healthcare",
		trait: "safety_focus",
		questionFr: "Lors de l'administration d'un médicament, la règle des « 5 B » impose de vérifier :",
		options: [
			mcOption("hc-q3-a", "Le bon patient, bon médicament, bonne dose, bonne voie, bon moment", true, 1),
			mcOption("hc-q3-b", "Le budget, la blouse, le badge, le bracelet, le bilan", false, 2),
			mcOption("hc-q3-c", "Uniquement la dose et l'heure", false, 3),
			mcOption("hc-q3-d", "Le nom du médecin uniquement", false, 4),
		],
	},
	{
		field: "healthcare",
		trait: "patient_care",
		questionFr: "Face à un patient inconscient qui ne respire pas, quelle est la première action ?",
		options: [
			mcOption("hc-q4-a", "Lui donner à boire", false, 1),
			mcOption("hc-q4-b", "Alerter et débuter la réanimation cardio-pulmonaire (RCP)", true, 2),
			mcOption("hc-q4-c", "Attendre l'arrivée du médecin sans agir", false, 3),
			mcOption("hc-q4-d", "Le déplacer immédiatement dans un autre service", false, 4),
		],
	},

	// ---------- INDUSTRIAL ----------
	{
		field: "industrial",
		trait: "technical_aptitude",
		questionFr: "Le procédé de soudure TIG est principalement utilisé pour :",
		options: [
			mcOption("in-q1-a", "Les soudures de précision et de haute qualité", true, 1),
			mcOption("in-q1-b", "Couper rapidement de grandes tôles", false, 2),
			mcOption("in-q1-c", "Visser des assemblages mécaniques", false, 3),
			mcOption("in-q1-d", "Peindre les structures métalliques", false, 4),
		],
	},
	{
		field: "industrial",
		trait: "safety_focus",
		questionFr: "Avant d'intervenir sur une machine en panne, l'opérateur doit d'abord :",
		options: [
			mcOption("in-q2-a", "Lancer la production pour observer le défaut", false, 1),
			mcOption("in-q2-b", "Consigner la machine (coupure et verrouillage des énergies)", true, 2),
			mcOption("in-q2-c", "Démonter les capots de protection sans procédure", false, 3),
			mcOption("in-q2-d", "Augmenter la vitesse de la machine", false, 4),
		],
	},
	{
		field: "industrial",
		trait: "technical_aptitude",
		questionFr: "Sur un plan technique, une cote indique :",
		options: [
			mcOption("in-q3-a", "La couleur de la pièce", false, 1),
			mcOption("in-q3-b", "Une dimension à respecter lors de la fabrication", true, 2),
			mcOption("in-q3-c", "Le poids du matériau uniquement", false, 3),
			mcOption("in-q3-d", "Le nom du fabricant", false, 4),
		],
	},
	{
		field: "industrial",
		trait: "technical_aptitude",
		questionFr: "La maintenance préventive a pour objectif principal de :",
		options: [
			mcOption("in-q4-a", "Réparer la machine seulement après une panne", false, 1),
			mcOption("in-q4-b", "Éviter les pannes en entretenant régulièrement les équipements", true, 2),
			mcOption("in-q4-c", "Augmenter la consommation de pièces de rechange", false, 3),
			mcOption("in-q4-d", "Remplacer entièrement la machine chaque année", false, 4),
		],
	},

	// ---------- HSE ----------
	{
		field: "hse",
		trait: "safety_focus",
		questionFr: "Que signifie l'acronyme EPI en sécurité au travail ?",
		options: [
			mcOption("hse-q1-a", "Équipement de Protection Individuelle", true, 1),
			mcOption("hse-q1-b", "Évaluation des Procédures Internes", false, 2),
			mcOption("hse-q1-c", "Équipe de Prévention Incendie", false, 3),
			mcOption("hse-q1-d", "Examen Périodique des Installations", false, 4),
		],
	},
	{
		field: "hse",
		trait: "safety_focus",
		questionFr: "Le document unique d'évaluation des risques (DUER) sert à :",
		options: [
			mcOption("hse-q2-a", "Lister les salaires du personnel", false, 1),
			mcOption("hse-q2-b", "Recenser et hiérarchiser les risques professionnels de l'entreprise", true, 2),
			mcOption("hse-q2-c", "Planifier les congés payés", false, 3),
			mcOption("hse-q2-d", "Gérer les commandes fournisseurs", false, 4),
		],
	},
	{
		field: "hse",
		trait: "safety_focus",
		questionFr: "La norme internationale dédiée au management de la santé et de la sécurité au travail est :",
		options: [
			mcOption("hse-q3-a", "ISO 9001", false, 1),
			mcOption("hse-q3-b", "ISO 45001", true, 2),
			mcOption("hse-q3-c", "ISO 27001", false, 3),
			mcOption("hse-q3-d", "ISO 22000", false, 4),
		],
	},
	{
		field: "hse",
		trait: "safety_focus",
		questionFr: "Face à un début d'incendie maîtrisable, le réflexe correct est de :",
		options: [
			mcOption("hse-q4-a", "Ouvrir toutes les fenêtres pour ventiler le feu", false, 1),
			mcOption("hse-q4-b", "Donner l'alerte puis utiliser l'extincteur adapté si possible", true, 2),
			mcOption("hse-q4-c", "Continuer à travailler normalement", false, 3),
			mcOption("hse-q4-d", "Jeter de l'eau sur un feu d'origine électrique", false, 4),
		],
	},
];

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------
async function main() {
	const client = new Client({ connectionString: CONNECTION_STRING });
	await client.connect();
	console.log("Connected to local PostgreSQL.\n");

	// ---- 1. skill_library ----
	let skillInserted = 0;
	let skillUpdated = 0;
	for (let i = 0; i < SKILLS.length; i++) {
		const s = SKILLS[i];
		const id = deterministicUuid(`skill:${s.field}:${s.nameFr}`);
		const res = await client.query(
			`INSERT INTO skill_library (id, name, name_fr, field, category, description, description_fr, is_recommended, is_active, sort_order)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, true, true, $8)
			 ON CONFLICT (id) DO UPDATE SET
			   name = EXCLUDED.name,
			   name_fr = EXCLUDED.name_fr,
			   field = EXCLUDED.field,
			   category = EXCLUDED.category,
			   description = EXCLUDED.description,
			   description_fr = EXCLUDED.description_fr,
			   is_recommended = true,
			   is_active = true,
			   sort_order = EXCLUDED.sort_order,
			   updated_at = now()
			 RETURNING (xmax = 0) AS inserted`,
			[id, s.name, s.nameFr, s.field, s.category, s.descriptionFr, s.descriptionFr, i],
		);
		if (res.rows[0]?.inserted) skillInserted++;
		else skillUpdated++;
	}
	console.log(`skill_library: ${skillInserted} inserted, ${skillUpdated} updated (${SKILLS.length} total seeded).`);

	// ---- 2. quiz_question (field-tagged skills-quiz) ----
	let quizInserted = 0;
	let quizUpdated = 0;
	for (let i = 0; i < QUIZ.length; i++) {
		const qz = QUIZ[i];
		const id = deterministicUuid(`quiz:${qz.field}:${qz.questionFr}`);
		const res = await client.query(
			`INSERT INTO quiz_question (id, quiz_type, question, question_fr, category, question_type, options, trait, field, weight, is_active, sort_order)
			 VALUES ($1, 'skills_quiz', $2, $3, 'skills', 'multiple_choice', $4::jsonb, $5, $6, 1, true, $7)
			 ON CONFLICT (id) DO UPDATE SET
			   question = EXCLUDED.question,
			   question_fr = EXCLUDED.question_fr,
			   options = EXCLUDED.options,
			   trait = EXCLUDED.trait,
			   field = EXCLUDED.field,
			   is_active = true,
			   sort_order = EXCLUDED.sort_order,
			   updated_at = now()
			 RETURNING (xmax = 0) AS inserted`,
			[id, qz.questionFr, qz.questionFr, JSON.stringify(qz.options), qz.trait, qz.field, 100 + i],
		);
		if (res.rows[0]?.inserted) quizInserted++;
		else quizUpdated++;
	}
	console.log(`quiz_question: ${quizInserted} inserted, ${quizUpdated} updated (${QUIZ.length} field-tagged total seeded).\n`);

	// ---- 3. Verification ----
	const skillCounts = (
		await client.query(
			`SELECT field, count(*)::int AS count FROM skill_library
			 WHERE field IN ('healthcare','industrial','hse') GROUP BY field ORDER BY field`,
		)
	).rows;
	const skillByCat = (
		await client.query(
			`SELECT field, category, count(*)::int AS count FROM skill_library
			 WHERE field IN ('healthcare','industrial','hse') GROUP BY field, category ORDER BY field, category`,
		)
	).rows;
	const quizCounts = (
		await client.query(
			`SELECT field, count(*)::int AS count FROM quiz_question
			 WHERE field IS NOT NULL GROUP BY field ORDER BY field`,
		)
	).rows;

	console.log("=== VERIFICATION ===");
	console.log("skill_library IMTA-field counts:", JSON.stringify(skillCounts));
	console.log("skill_library IMTA-field by category:", JSON.stringify(skillByCat));
	console.log("quiz_question field-tagged counts:", JSON.stringify(quizCounts));

	await client.end();
	console.log("\nDone.");
}

main().catch((e) => {
	console.error("FATAL:", e);
	process.exit(1);
});
