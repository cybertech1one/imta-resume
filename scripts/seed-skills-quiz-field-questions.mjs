/**
 * Seed field-specific skills quiz questions into quiz_question on PROD.
 *
 * Adds 10 questions per field (healthcare, hse, industrial) — traits:
 *   healthcare  → patient_care (7) + safety_focus (3)
 *   hse         → safety_focus (10)
 *   industrial  → technical_aptitude (7) + safety_focus (3)
 *
 * category = "skills" (closest valid quiz_category enum value)
 * quiz_type = "skills_quiz"
 * field = healthcare | hse | industrial
 *
 * Idempotent: ON CONFLICT (id) DO NOTHING (UUIDs derived from stable keys).
 *
 * Usage:
 *   PG_PUBLIC_URL="postgresql://..." node scripts/seed-skills-quiz-field-questions.mjs
 *   or just:
 *   node scripts/seed-skills-quiz-field-questions.mjs   (uses hard-coded prod URL if env absent)
 */

import { createHash } from "node:crypto";
import pg from "pg";
const { Client } = pg;

const DB_URL =
	process.env.PG_PUBLIC_URL ||
	"postgresql://postgres:a2fc9bfda46b42bfa4be02408e8c659b8e9efec99277d94c@switchyard.proxy.rlwy.net:13827/railway";

function stableUuid(key) {
	const h = createHash("sha1").update(`quiz_question_field:${key}`).digest("hex");
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

let sortOrder = 200; // start above existing 100–111 range
function q(id, field, trait, questionFr, explanationFr, options) {
	sortOrder++;
	const mappedOptions = options.map((o, i) => ({
		id: o.id,
		text: o.text,
		textFr: o.text,
		scores: { correct: o.isCorrect ? 1 : 0 },
		sortOrder: i + 1,
	}));
	return {
		id: stableUuid(id),
		quizType: "skills_quiz",
		question: questionFr, // same text used for both en+fr columns
		questionFr,
		descriptionFr: explanationFr,
		category: "skills",
		trait,
		field,
		options: mappedOptions,
		sortOrder,
	};
}

// ============================================================================
// HEALTHCARE — patient_care (7) + safety_focus (3)
// ============================================================================
const HEALTHCARE = [
	q("hc-1", "healthcare", "patient_care",
		"Quelle est la position recommandée pour un patient inconscient qui respire normalement ?",
		"La position latérale de sécurité (PLS) maintient les voies aériennes ouvertes et évite l'aspiration.",
		[
			{ id: "hc-1-a", text: "Position dorsale à plat", isCorrect: false },
			{ id: "hc-1-b", text: "Position latérale de sécurité (PLS)", isCorrect: true },
			{ id: "hc-1-c", text: "Position assise", isCorrect: false },
			{ id: "hc-1-d", text: "Position ventrale", isCorrect: false },
		]),
	q("hc-2", "healthcare", "patient_care",
		"Quel signe clinique indique une hypoglycémie sévère ?",
		"La confusion et les tremblements sont des signes d'hypoglycémie sévère qui nécessitent une prise en charge rapide.",
		[
			{ id: "hc-2-a", text: "Tachycardie uniquement", isCorrect: false },
			{ id: "hc-2-b", text: "Confusion, tremblements et sueurs froides", isCorrect: true },
			{ id: "hc-2-c", text: "Hypertension artérielle", isCorrect: false },
			{ id: "hc-2-d", text: "Bradycardie", isCorrect: false },
		]),
	q("hc-3", "healthcare", "patient_care",
		"Quelle est la durée recommandée du lavage des mains chirurgical ?",
		"Le lavage chirurgical dure 3 à 5 minutes pour éliminer la flore transitoire et réduire la flore résidente.",
		[
			{ id: "hc-3-a", text: "30 secondes", isCorrect: false },
			{ id: "hc-3-b", text: "1 minute", isCorrect: false },
			{ id: "hc-3-c", text: "3 à 5 minutes", isCorrect: true },
			{ id: "hc-3-d", text: "10 minutes", isCorrect: false },
		]),
	q("hc-4", "healthcare", "patient_care",
		"Lors d'une transfusion sanguine, quel groupe sanguin est considéré comme donneur universel ?",
		"Le groupe O négatif est donneur universel car ses globules rouges sont compatibles avec tous les groupes.",
		[
			{ id: "hc-4-a", text: "A positif", isCorrect: false },
			{ id: "hc-4-b", text: "AB positif", isCorrect: false },
			{ id: "hc-4-c", text: "O négatif", isCorrect: true },
			{ id: "hc-4-d", text: "B négatif", isCorrect: false },
		]),
	q("hc-5", "healthcare", "patient_care",
		"Quelle est la température corporelle normale chez un adulte ?",
		"La température normale est entre 36,5 °C et 37,5 °C. Au-dessus de 38 °C, on parle de fièvre.",
		[
			{ id: "hc-5-a", text: "35,0 – 36,0 °C", isCorrect: false },
			{ id: "hc-5-b", text: "36,5 – 37,5 °C", isCorrect: true },
			{ id: "hc-5-c", text: "38,0 – 39,0 °C", isCorrect: false },
			{ id: "hc-5-d", text: "37,8 – 38,5 °C", isCorrect: false },
		]),
	q("hc-6", "healthcare", "patient_care",
		"Quel est le premier reflexe face à une plaie hémorragique ?",
		"La compression directe de la plaie avec un tissu propre est le premier geste pour contrôler l'hémorragie.",
		[
			{ id: "hc-6-a", text: "Appliquer de l'eau froide", isCorrect: false },
			{ id: "hc-6-b", text: "Comprimer directement la plaie", isCorrect: true },
			{ id: "hc-6-c", text: "Surélever immédiatement le membre", isCorrect: false },
			{ id: "hc-6-d", text: "Poser un garrot d'emblée", isCorrect: false },
		]),
	q("hc-7", "healthcare", "patient_care",
		"Quelle valeur de tension artérielle définit une hypertension artérielle chez l'adulte ?",
		"Une pression systolique ≥ 140 mmHg et/ou diastolique ≥ 90 mmHg définit une HTA.",
		[
			{ id: "hc-7-a", text: "120 / 70 mmHg", isCorrect: false },
			{ id: "hc-7-b", text: "130 / 85 mmHg", isCorrect: false },
			{ id: "hc-7-c", text: "140 / 90 mmHg ou plus", isCorrect: true },
			{ id: "hc-7-d", text: "110 / 60 mmHg", isCorrect: false },
		]),
	q("hc-8", "healthcare", "safety_focus",
		"Que signifie l'acronyme SBAR en communication clinique ?",
		"SBAR (Situation, Background, Assessment, Recommendation) est un outil de communication structurée pour la sécurité des patients.",
		[
			{ id: "hc-8-a", text: "Soins, Bilan, Actes, Résultats", isCorrect: false },
			{ id: "hc-8-b", text: "Situation, Background, Assessment, Recommendation", isCorrect: true },
			{ id: "hc-8-c", text: "Surveillance, Bilan, Alerte, Réévaluation", isCorrect: false },
			{ id: "hc-8-d", text: "Sécurité, Base, Analyse, Rapport", isCorrect: false },
		]),
	q("hc-9", "healthcare", "safety_focus",
		"Quelle classe de déchets hospitaliers correspond aux aiguilles et bistouris ?",
		"Les DASRI (Déchets d'Activités de Soins à Risques Infectieux) incluent les piquants-coupants à éliminer dans des conteneurs spéciaux.",
		[
			{ id: "hc-9-a", text: "Déchets ménagers assimilables (poubelle verte)", isCorrect: false },
			{ id: "hc-9-b", text: "DASRI (Déchets d'Activités de Soins à Risques Infectieux)", isCorrect: true },
			{ id: "hc-9-c", text: "Déchets radioactifs", isCorrect: false },
			{ id: "hc-9-d", text: "Déchets chimiques", isCorrect: false },
		]),
	q("hc-10", "healthcare", "safety_focus",
		"Après une AES (Accident d'Exposition au Sang), quel est le délai maximal pour consulter un médecin ?",
		"Il faut consulter dans les 4 heures après l'AES pour évaluer la nécessité d'une prophylaxie post-exposition (PPE) contre le VIH.",
		[
			{ id: "hc-10-a", text: "24 heures", isCorrect: false },
			{ id: "hc-10-b", text: "48 heures", isCorrect: false },
			{ id: "hc-10-c", text: "4 heures", isCorrect: true },
			{ id: "hc-10-d", text: "72 heures", isCorrect: false },
		]),
];

// ============================================================================
// HSE — safety_focus (10)
// ============================================================================
const HSE = [
	q("hse-1", "hse", "safety_focus",
		"Quelle est la première étape de la démarche de prévention des risques professionnels ?",
		"L'identification et l'évaluation des risques précèdent toutes les mesures de prévention.",
		[
			{ id: "hse-1-a", text: "Former les employés", isCorrect: false },
			{ id: "hse-1-b", text: "Identifier et évaluer les risques", isCorrect: true },
			{ id: "hse-1-c", text: "Acheter des EPI", isCorrect: false },
			{ id: "hse-1-d", text: "Rédiger le DUER", isCorrect: false },
		]),
	q("hse-2", "hse", "safety_focus",
		"Selon la hiérarchie des mesures de prévention, quelle mesure est prioritaire ?",
		"La suppression ou la substitution du danger à la source est prioritaire avant tout autre mesure de protection.",
		[
			{ id: "hse-2-a", text: "Porter des EPI", isCorrect: false },
			{ id: "hse-2-b", text: "Former les travailleurs", isCorrect: false },
			{ id: "hse-2-c", text: "Éliminer ou substituer le danger à la source", isCorrect: true },
			{ id: "hse-2-d", text: "Mettre en place des signalétiques", isCorrect: false },
		]),
	q("hse-3", "hse", "safety_focus",
		"Qu'est-ce qu'une ATEX (Atmosphère EXplosive) ?",
		"Une ATEX est un mélange d'air et de substances inflammables qui peut exploser en présence d'une source d'inflammation.",
		[
			{ id: "hse-3-a", text: "Un type de masque respiratoire", isCorrect: false },
			{ id: "hse-3-b", text: "Un mélange air/substances inflammables susceptible d'exploser", isCorrect: true },
			{ id: "hse-3-c", text: "Un extincteur automatique", isCorrect: false },
			{ id: "hse-3-d", text: "Un permis de travail spécial", isCorrect: false },
		]),
	q("hse-4", "hse", "safety_focus",
		"À partir de quel niveau sonore continu une protection auditive est-elle obligatoire en France ?",
		"Au-delà de 85 dB(A) d'exposition quotidienne, le port de protections auditives est obligatoire.",
		[
			{ id: "hse-4-a", text: "70 dB(A)", isCorrect: false },
			{ id: "hse-4-b", text: "80 dB(A)", isCorrect: false },
			{ id: "hse-4-c", text: "85 dB(A)", isCorrect: true },
			{ id: "hse-4-d", text: "95 dB(A)", isCorrect: false },
		]),
	q("hse-5", "hse", "safety_focus",
		"Que désigne le sigle TMS dans le contexte de la santé au travail ?",
		"Les Troubles Musculo-Squelettiques (TMS) sont la première cause de maladies professionnelles en France.",
		[
			{ id: "hse-5-a", text: "Travaux Manufacturés Spéciaux", isCorrect: false },
			{ id: "hse-5-b", text: "Troubles Musculo-Squelettiques", isCorrect: true },
			{ id: "hse-5-c", text: "Taux de Maintenance Standard", isCorrect: false },
			{ id: "hse-5-d", text: "Traitement Médical de Sécurité", isCorrect: false },
		]),
	q("hse-6", "hse", "safety_focus",
		"Le plan ORSEC est déclenché par quelle autorité ?",
		"Le plan ORSEC (Organisation de la Réponse de SEcurité Civile) est déclenché par le préfet de département.",
		[
			{ id: "hse-6-a", text: "Le maire de la commune", isCorrect: false },
			{ id: "hse-6-b", text: "Le ministre de l'Intérieur", isCorrect: false },
			{ id: "hse-6-c", text: "Le préfet de département", isCorrect: true },
			{ id: "hse-6-d", text: "Le directeur de l'usine", isCorrect: false },
		]),
	q("hse-7", "hse", "safety_focus",
		"Qu'est-ce qu'un permis de travail en milieu industriel ?",
		"Le permis de travail est un document qui formalise les conditions de sécurité pour une intervention dans une zone à risque.",
		[
			{ id: "hse-7-a", text: "Un contrat de travail spécifique", isCorrect: false },
			{ id: "hse-7-b", text: "Un document autorisant une activité dans des conditions de sécurité définies", isCorrect: true },
			{ id: "hse-7-c", text: "Une autorisation administrative d'ouverture du site", isCorrect: false },
			{ id: "hse-7-d", text: "Un registre de présence des travailleurs", isCorrect: false },
		]),
	q("hse-8", "hse", "safety_focus",
		"Quelle est la différence entre un incident et un accident du travail ?",
		"Un incident est un événement indésirable sans blessure ; un accident du travail entraîne une blessure ou une lésion au salarié.",
		[
			{ id: "hse-8-a", text: "Il n'y a pas de différence", isCorrect: false },
			{ id: "hse-8-b", text: "L'incident cause des dommages matériels, l'accident des blessures", isCorrect: false },
			{ id: "hse-8-c", text: "L'incident est un évènement sans blessure, l'accident entraîne une lésion", isCorrect: true },
			{ id: "hse-8-d", text: "L'accident est toujours mortel", isCorrect: false },
		]),
	q("hse-9", "hse", "safety_focus",
		"Quel indicateur mesure la fréquence des accidents du travail avec arrêt ?",
		"Le Taux de Fréquence (TF) = (nombre d'AT avec arrêt × 1 000 000) / heures travaillées.",
		[
			{ id: "hse-9-a", text: "Le Taux de Gravité (TG)", isCorrect: false },
			{ id: "hse-9-b", text: "Le Taux de Fréquence (TF)", isCorrect: true },
			{ id: "hse-9-c", text: "L'Indice de Sinistralité (IS)", isCorrect: false },
			{ id: "hse-9-d", text: "Le taux d'absentéisme", isCorrect: false },
		]),
	q("hse-10", "hse", "safety_focus",
		"Que signifie le pictogramme GHS01 (bombe qui explose) sur un produit chimique ?",
		"Le pictogramme GHS01 signale que le produit est explosif ou peut réagir de manière explosive.",
		[
			{ id: "hse-10-a", text: "Produit corrosif", isCorrect: false },
			{ id: "hse-10-b", text: "Produit explosif ou réactif explosive", isCorrect: true },
			{ id: "hse-10-c", text: "Produit toxique pour l'environnement", isCorrect: false },
			{ id: "hse-10-d", text: "Produit comburant", isCorrect: false },
		]),
];

// ============================================================================
// INDUSTRIAL — technical_aptitude (7) + safety_focus (3)
// ============================================================================
const INDUSTRIAL = [
	q("ind-1", "industrial", "technical_aptitude",
		"Quelle unité de mesure est utilisée pour la pression dans les systèmes hydrauliques industriels ?",
		"Le bar ou le pascal (Pa) sont utilisés pour mesurer la pression ; 1 bar = 100 000 Pa.",
		[
			{ id: "ind-1-a", text: "Newton (N)", isCorrect: false },
			{ id: "ind-1-b", text: "Bar ou Pascal (Pa)", isCorrect: true },
			{ id: "ind-1-c", text: "Joule (J)", isCorrect: false },
			{ id: "ind-1-d", text: "Ampère (A)", isCorrect: false },
		]),
	q("ind-2", "industrial", "technical_aptitude",
		"Sur un schéma électrique, que symbolise un trait zigzag entre deux bornes ?",
		"Le symbole zigzag représente une résistance dans les schémas électriques.",
		[
			{ id: "ind-2-a", text: "Un condensateur", isCorrect: false },
			{ id: "ind-2-b", text: "Un interrupteur", isCorrect: false },
			{ id: "ind-2-c", text: "Une résistance", isCorrect: true },
			{ id: "ind-2-d", text: "Une bobine d'inductance", isCorrect: false },
		]),
	q("ind-3", "industrial", "technical_aptitude",
		"Qu'est-ce que la dureté Shore A mesure principalement ?",
		"La dureté Shore A mesure la résistance à l'indentation des matériaux élastomères (caoutchouc, silicone).",
		[
			{ id: "ind-3-a", text: "La dureté des métaux", isCorrect: false },
			{ id: "ind-3-b", text: "La résistance à l'indentation des élastomères", isCorrect: true },
			{ id: "ind-3-c", text: "La résistance électrique des matériaux", isCorrect: false },
			{ id: "ind-3-d", text: "La température de fusion des plastiques", isCorrect: false },
		]),
	q("ind-4", "industrial", "technical_aptitude",
		"Dans un procédé de soudure MIG/MAG, quel est le rôle du gaz de protection ?",
		"Le gaz protège le bain de fusion de l'oxydation atmosphérique pendant la soudure.",
		[
			{ id: "ind-4-a", text: "Refroidir la soudure rapidement", isCorrect: false },
			{ id: "ind-4-b", text: "Protéger le bain de fusion de l'oxydation", isCorrect: true },
			{ id: "ind-4-c", text: "Alimenter l'arc électrique", isCorrect: false },
			{ id: "ind-4-d", text: "Nettoyer les pièces avant soudure", isCorrect: false },
		]),
	q("ind-5", "industrial", "technical_aptitude",
		"Qu'est-ce qu'un ISO 9001 certifie dans une entreprise industrielle ?",
		"L'ISO 9001 certifie le système de management de la qualité (SMQ) de l'organisation.",
		[
			{ id: "ind-5-a", text: "La sécurité des travailleurs", isCorrect: false },
			{ id: "ind-5-b", text: "La performance environnementale", isCorrect: false },
			{ id: "ind-5-c", text: "Le système de management de la qualité", isCorrect: true },
			{ id: "ind-5-d", text: "La rentabilité financière", isCorrect: false },
		]),
	q("ind-6", "industrial", "technical_aptitude",
		"Que signifie TPM (Total Productive Maintenance) ?",
		"La TPM vise à maximiser l'efficacité des équipements en impliquant tous les opérateurs dans la maintenance.",
		[
			{ id: "ind-6-a", text: "Test de Performance des Machines", isCorrect: false },
			{ id: "ind-6-b", text: "Total Productive Maintenance (maintenance productive totale)", isCorrect: true },
			{ id: "ind-6-c", text: "Traçabilité des Pièces de Montage", isCorrect: false },
			{ id: "ind-6-d", text: "Tableau de Pilotage de la Maîtrise", isCorrect: false },
		]),
	q("ind-7", "industrial", "technical_aptitude",
		"Quelle méthode Lean permet d'identifier et d'éliminer les gaspillages dans un processus de production ?",
		"La cartographie de la chaîne de valeur (VSM) visualise les flux pour identifier les gaspillages.",
		[
			{ id: "ind-7-a", text: "Six Sigma", isCorrect: false },
			{ id: "ind-7-b", text: "Cartographie de la chaîne de valeur (VSM)", isCorrect: true },
			{ id: "ind-7-c", text: "Kaizen uniquement", isCorrect: false },
			{ id: "ind-7-d", text: "AMDEC", isCorrect: false },
		]),
	q("ind-8", "industrial", "safety_focus",
		"Quelle procédure garantit qu'une machine ne peut pas être remise sous tension pendant une intervention ?",
		"La procédure de consignation (Lockout/Tagout – LOTO) sécurise l'équipement pendant la maintenance.",
		[
			{ id: "ind-8-a", text: "Le permis feu", isCorrect: false },
			{ id: "ind-8-b", text: "La consignation / LOTO (Lockout-Tagout)", isCorrect: true },
			{ id: "ind-8-c", text: "Le port de gants isolants", isCorrect: false },
			{ id: "ind-8-d", text: "La signalisation orange autour de la machine", isCorrect: false },
		]),
	q("ind-9", "industrial", "safety_focus",
		"Quelle est la charge maximale autorisée pour un levage manuel selon les recommandations européennes pour un homme adulte ?",
		"La recommandation européenne fixe à 25 kg la charge maximale pour un levage manuel seul par un homme adulte.",
		[
			{ id: "ind-9-a", text: "15 kg", isCorrect: false },
			{ id: "ind-9-b", text: "25 kg", isCorrect: true },
			{ id: "ind-9-c", text: "40 kg", isCorrect: false },
			{ id: "ind-9-d", text: "50 kg", isCorrect: false },
		]),
	q("ind-10", "industrial", "safety_focus",
		"Que doit vérifier un cariste avant d'utiliser un chariot élévateur ?",
		"L'opérateur doit effectuer un contrôle quotidien (fourches, pneumatiques, niveaux, freins, signaux) avant chaque prise en charge.",
		[
			{ id: "ind-10-a", text: "Seulement le niveau de carburant", isCorrect: false },
			{ id: "ind-10-b", text: "Les fourches, pneumatiques, niveaux, freins et dispositifs de signalisation", isCorrect: true },
			{ id: "ind-10-c", text: "Uniquement les fourches et les freins", isCorrect: false },
			{ id: "ind-10-d", text: "Aucune vérification n'est nécessaire si la machine est récente", isCorrect: false },
		]),
];

const ALL_QUESTIONS = [...HEALTHCARE, ...HSE, ...INDUSTRIAL];

async function main() {
	console.log("=== Field-Specific Skills Quiz Seed (quiz_question) ===\n");
	console.log(`Target DB: ${DB_URL.replace(/:([^:@]+)@/, ":***@")}`);
	console.log(`Questions to upsert: ${ALL_QUESTIONS.length} (10 healthcare + 10 hse + 10 industrial)\n`);

	const client = new Client({ connectionString: DB_URL });
	await client.connect();
	console.log("Connected\n");

	try {
		let inserted = 0;
		let skipped = 0;
		for (const q of ALL_QUESTIONS) {
			const res = await client.query(
				`INSERT INTO quiz_question
					(id, quiz_type, question, question_fr, description, description_fr, category, question_type, options, trait, field, weight, is_active, sort_order, created_at, updated_at)
				 VALUES ($1, $2, $3, $4, NULL, $5, $6, 'multiple_choice', $7, $8, $9, 1, true, $10, NOW(), NOW())
				 ON CONFLICT (id) DO NOTHING`,
				[
					q.id,
					q.quizType,
					q.question,
					q.questionFr,
					q.descriptionFr,
					q.category,
					JSON.stringify(q.options),
					q.trait,
					q.field,
					q.sortOrder,
				],
			);
			if (res.rowCount > 0) inserted++;
			else skipped++;
		}
		console.log(`Inserted: ${inserted}, Skipped (already present): ${skipped}\n`);

		const total = await client.query("SELECT COUNT(*) AS cnt FROM quiz_question");
		const byField = await client.query(
			"SELECT field, COUNT(*) AS cnt FROM quiz_question WHERE quiz_type='skills_quiz' GROUP BY field ORDER BY field NULLS LAST",
		);
		const byTrait = await client.query(
			"SELECT field, trait, COUNT(*) AS cnt FROM quiz_question WHERE quiz_type='skills_quiz' GROUP BY field, trait ORDER BY field NULLS LAST, trait",
		);
		console.log(`quiz_question total rows: ${total.rows[0].cnt}`);
		console.log("\nskills_quiz by field:");
		for (const r of byField.rows) console.log(`  ${r.field ?? "(generic)"}: ${r.cnt}`);
		console.log("\nskills_quiz by field+trait:");
		for (const r of byTrait.rows) console.log(`  ${r.field ?? "(generic)"} / ${r.trait}: ${r.cnt}`);

		console.log("\n=== DONE ===");
	} catch (err) {
		console.error("\nFATAL ERROR:", err.message);
		console.error(err.stack);
		process.exit(1);
	} finally {
		await client.end();
	}
}

main().catch(console.error);
