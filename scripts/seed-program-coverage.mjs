/**
 * Seed Program Coverage — closes IMTA program coverage gaps so EVERY enrolled
 * program works end-to-end.
 *
 * Background (confirmed via inspection on LOCAL PostgreSQL 5432):
 *  - `user.imta_program` is plain TEXT (NOT a pgEnum). The `imta_program`
 *    pgEnum does not exist / has 0 members, so NO `ALTER TYPE` is required.
 *  - The `imta_program` reference TABLE had 32 rows but was MISSING `cariste`
 *    even though real users are enrolled as `cariste`.
 *  - mock-ai interview questions are matched EXACTLY on (field, program,
 *    difficulty) with NO `general` fallback in `getQuestions`. The program
 *    dropdown is populated from `mock_ai_program`, defaulting to the first
 *    program. So any active mock_ai_program × difficulty combination that has
 *    0 questions yields a broken (0-question) mock interview.
 *
 * What this script does (all idempotent):
 *  1. Inserts missing `imta_program` reference rows (esp. `cariste`).
 *  2. Inserts missing `mock_ai_program` rows (esp. `cariste`) so every enrolled
 *     program is selectable in the mock-interview UI.
 *  3. Inserts mock_ai_question rows so that EVERY active mock_ai_program has at
 *     least one question at EACH active difficulty (debutant/intermediaire/avance).
 *
 * Usage: node scripts/seed-program-coverage.mjs
 */

import { readFileSync } from "node:fs";
import pg from "pg";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

const client = new pg.Client({ connectionString: dbUrl });

const DIFFICULTIES = ["debutant", "intermediaire", "avance"];

// ---------------------------------------------------------------------------
// 1. Missing imta_program reference TABLE rows
//    (programs students can enroll in / select but that were absent)
// ---------------------------------------------------------------------------
const REFERENCE_PROGRAMS = [
	{
		id: "cariste",
		name: "Forklift / Machinery Operator",
		nameFr: "Cariste / Conducteur d'Engins",
		field: "industrial",
		duration: "1 Year",
		durationFr: "1 An",
		requirements: "Lower Secondary Level",
		requirementsFr: "Niveau Collège",
		description:
			"Operate forklifts and material-handling equipment safely in warehouses and industrial sites. High demand in logistics and ports.",
		descriptionFr:
			"Conduisez des chariots élévateurs et engins de manutention en toute sécurité dans les entrepôts et sites industriels. Forte demande en logistique et dans les ports.",
		successRate: 95,
		avgSalary: 4500,
		employmentRate: 92,
		skills: [
			"Conduite d'engins (CACES)",
			"Manutention sécurisée",
			"Vérifications avant démarrage",
			"Gestion de stock",
			"Respect des consignes de sécurité",
			"Lecture de bons de commande",
		],
		certifications: ["CACES (Certificat d'Aptitude à la Conduite En Sécurité)"],
		sortOrder: 40,
	},
];

// ---------------------------------------------------------------------------
// 2. Missing mock_ai_program rows (must be selectable in mock-interview UI)
//    field must be one of the mock_ai_field enum: healthcare / industrial / hse
// ---------------------------------------------------------------------------
const MOCK_PROGRAMS = [
	{ field: "industrial", programId: "cariste", programName: "Cariste / Conducteur d'Engins", order: 60 },
];

// ---------------------------------------------------------------------------
// 3. Mock questions per program/difficulty.
//    Used both to seed NEW programs (cariste) and to backfill any active
//    mock_ai_program that is missing questions at a given difficulty.
//    Keyed by `${field}::${program}`; each has the 3 difficulty buckets.
// ---------------------------------------------------------------------------
const QUESTIONS = {
	// --- Industrial: cariste (brand new program) ---
	"industrial::cariste": {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous souhaitez devenir cariste / conducteur d'engins.",
			"Quelles vérifications faites-vous avant de démarrer un chariot élévateur?",
			"Quels équipements de protection individuelle (EPI) portez-vous en tant que cariste?",
		],
		intermediaire: [
			"Comment assurez-vous la sécurité des piétons lorsque vous manœuvrez un engin dans un entrepôt?",
			"Comment chargez-vous et déchargez-vous une palette en respectant les règles de stabilité?",
			"Que signifie le CACES et pourquoi est-il obligatoire pour conduire certains engins?",
		],
		avance: [
			"Que faites-vous si vous remarquez une anomalie mécanique sur votre engin en pleine opération?",
			"Comment gérez-vous le gerbage en hauteur de charges lourdes en toute sécurité?",
			"Décrivez une situation où vous avez dû refuser une tâche pour des raisons de sécurité.",
		],
	},
	// --- Healthcare backfill (programs missing some difficulties) ---
	"healthcare::aide_soignant": {
		avance: [
			"Comment accompagnez-vous un patient en fin de vie tout en soutenant sa famille?",
			"Comment gérez-vous une situation d'urgence (chute, malaise) en l'absence immédiate de l'infirmier?",
		],
	},
	"healthcare::auxiliaire_puericulture": {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous avez choisi de travailler auprès des jeunes enfants.",
			"Quelles règles d'hygiène appliquez-vous lors du change d'un nourrisson?",
		],
		intermediaire: [
			"Comment réagissez-vous face à un enfant qui pleure de manière inconsolable?",
			"Comment assurez-vous la sécurité d'un groupe d'enfants pendant une activité?",
		],
		avance: [
			"Comment communiquez-vous avec des parents inquiets concernant le développement de leur enfant?",
			"Comment repérez-vous des signes de mal-être ou de retard de développement chez un enfant?",
		],
	},
	"healthcare::infirmier_polyvalent": {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous avez choisi le métier d'infirmier.",
			"Quelles sont les étapes de l'hygiène des mains avant un soin?",
		],
	},
	"healthcare::sage_femme": {
		debutant: [
			"Présentez-vous et expliquez votre vocation pour le métier de sage-femme.",
			"Comment rassurez-vous une future maman lors de sa première consultation?",
		],
	},
	"healthcare::technicien_anesthesie": {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour la spécialité d'anesthésie.",
			"Quel est le rôle du technicien d'anesthésie au sein du bloc opératoire?",
		],
		intermediaire: [
			"Comment vérifiez-vous le bon fonctionnement du matériel d'anesthésie avant une intervention?",
			"Comment réagissez-vous face à une variation soudaine des constantes vitales d'un patient?",
		],
	},
	"healthcare::technicien_laboratoire": {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous souhaitez travailler en laboratoire d'analyses.",
			"Quelles précautions prenez-vous lors de la manipulation d'échantillons biologiques?",
		],
		avance: [
			"Comment garantissez-vous la traçabilité et la fiabilité d'un résultat d'analyse?",
			"Comment réagissez-vous face à un résultat anormal nécessitant une vérification urgente?",
		],
	},
	// --- Industrial backfill ---
	"industrial::electromecanique": {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour l'électromécanique.",
			"Quelles précautions de sécurité électrique appliquez-vous avant une intervention?",
		],
	},
	"industrial::maintenance_industrielle": {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous avez choisi la maintenance industrielle.",
			"Quelle est la différence entre maintenance préventive et maintenance corrective?",
		],
	},
	"industrial::soudure": {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour le métier de soudeur.",
			"Quels équipements de protection portez-vous lors d'une opération de soudage?",
		],
	},
	"industrial::technicien_froid": {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour le froid et la climatisation.",
			"Quelles précautions prenez-vous lors de la manipulation de fluides frigorigènes?",
		],
		avance: [
			"Comment diagnostiquez-vous une panne sur un circuit frigorifique?",
			"Comment optimisez-vous le rendement énergétique d'une installation de climatisation?",
		],
	},
	// --- HSE backfill ---
	"hse::hse_advanced": {
		debutant: [
			"Présentez-vous et expliquez ce que représente le métier HSE pour vous.",
			"Quels sont les principaux équipements de protection individuelle et leur utilité?",
		],
	},
	"hse::hse_specialist": {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour la spécialisation HSE.",
			"Comment sensibilisez-vous les équipes au respect des consignes de sécurité?",
		],
	},
};

// Generic per-field fallback questions, used to fill ANY active program that
// still lacks a difficulty bucket and is not explicitly covered above.
const GENERIC_BY_FIELD = {
	healthcare: {
		debutant: [
			"Présentez-vous et expliquez pourquoi vous avez choisi une carrière dans la santé.",
			"Quelles qualités humaines sont essentielles pour travailler dans le domaine médical?",
		],
		intermediaire: [
			"Comment géreriez-vous un patient difficile ou agressif tout en restant professionnel?",
			"Comment travaillez-vous en équipe pluridisciplinaire dans un service de soins?",
		],
		avance: [
			"Comment maintenez-vous la confidentialité des informations médicales des patients?",
			"Comment gérez-vous le stress et la charge émotionnelle de votre métier?",
		],
	},
	industrial: {
		debutant: [
			"Présentez-vous et expliquez votre intérêt pour le secteur industriel.",
			"Pourquoi le respect des consignes de sécurité est-il important sur un site industriel?",
		],
		intermediaire: [
			"Comment réagissez-vous lorsque vous ne comprenez pas une instruction technique?",
			"Comment organisez-vous votre poste de travail pour être efficace et sûr?",
		],
		avance: [
			"Comment contribuez-vous à l'amélioration continue (Lean, 5S) sur votre poste de travail?",
			"Décrivez une panne ou un incident que vous avez résolu et la démarche suivie.",
		],
	},
	hse: {
		debutant: [
			"Présentez-vous et expliquez ce que signifie HSE pour vous.",
			"Quels sont les principaux équipements de protection individuelle (EPI) et leur utilité?",
		],
		intermediaire: [
			"Comment réagiriez-vous en cas de déversement accidentel de produit chimique?",
			"Comment menez-vous une analyse des risques sur un poste de travail?",
		],
		avance: [
			"Comment concilieriez-vous les exigences de production avec les contraintes de sécurité?",
			"Comment animez-vous une enquête après un accident du travail?",
		],
	},
};

async function main() {
	await client.connect();
	const summary = { referenceRows: [], mockPrograms: [], questionsInserted: {} };

	// --- Note on enum: confirm imta_program is NOT a used pgEnum -------------
	const enumCheck = await client.query(
		`SELECT count(*)::int AS n FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='imta_program'`,
	);
	console.log(`imta_program pgEnum members: ${enumCheck.rows[0].n} (user.imta_program is TEXT — no ALTER TYPE needed)`);

	// --- 1. imta_program reference table ------------------------------------
	for (const p of REFERENCE_PROGRAMS) {
		const res = await client.query(
			`INSERT INTO imta_program
				(id, name, name_fr, field, duration, duration_fr, requirements, requirements_fr,
				 description, description_fr, success_rate, avg_salary, employment_rate,
				 skills, certifications, is_active, sort_order, created_at, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14::jsonb,$15::jsonb,true,$16,now(),now())
			 ON CONFLICT (id) DO NOTHING
			 RETURNING id`,
			[
				p.id, p.name, p.nameFr, p.field, p.duration, p.durationFr, p.requirements, p.requirementsFr,
				p.description, p.descriptionFr, p.successRate, p.avgSalary, p.employmentRate,
				JSON.stringify(p.skills), JSON.stringify(p.certifications), p.sortOrder,
			],
		);
		if (res.rowCount > 0) summary.referenceRows.push(p.id);
	}

	// --- 2. mock_ai_program -------------------------------------------------
	for (const p of MOCK_PROGRAMS) {
		const res = await client.query(
			`INSERT INTO mock_ai_program (id, field, program_id, program_name, "order", is_active, created_at, updated_at)
			 VALUES (gen_random_uuid(), $1, $2, $3, $4, true, now(), now())
			 ON CONFLICT DO NOTHING
			 RETURNING program_id`,
			[p.field, p.programId, p.programName, p.order],
		);
		// ON CONFLICT DO NOTHING only fires on a real constraint; guard manually too
		if (res.rowCount === 0) {
			const exists = await client.query(
				`SELECT 1 FROM mock_ai_program WHERE field=$1 AND program_id=$2`,
				[p.field, p.programId],
			);
			if (exists.rowCount === 0) {
				await client.query(
					`INSERT INTO mock_ai_program (id, field, program_id, program_name, "order", is_active, created_at, updated_at)
					 VALUES (gen_random_uuid(), $1, $2, $3, $4, true, now(), now())`,
					[p.field, p.programId, p.programName, p.order],
				);
				summary.mockPrograms.push(`${p.field}/${p.programId}`);
			}
		} else {
			summary.mockPrograms.push(`${p.field}/${p.programId}`);
		}
	}

	// --- helper: insert a question if not already present (idempotent) ------
	async function insertQuestion(field, program, difficulty, text, order) {
		const exists = await client.query(
			`SELECT 1 FROM mock_ai_question WHERE field=$1 AND program=$2 AND difficulty=$3 AND question_text=$4`,
			[field, program, difficulty, text],
		);
		if (exists.rowCount > 0) return false;
		await client.query(
			`INSERT INTO mock_ai_question
				(id, field, program, difficulty, question_text, "order", is_active, created_at, updated_at)
			 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, now(), now())`,
			[field, program, difficulty, text, order],
		);
		return true;
	}

	// --- 3. Ensure every ACTIVE mock_ai_program × difficulty has questions ---
	const activePrograms = (
		await client.query(`SELECT field, program_id FROM mock_ai_program WHERE is_active = true`)
	).rows;

	for (const { field, program_id: program } of activePrograms) {
		for (const difficulty of DIFFICULTIES) {
			// current count
			const cnt = await client.query(
				`SELECT count(*)::int AS n FROM mock_ai_question
				 WHERE field=$1 AND program=$2 AND difficulty=$3 AND is_active=true`,
				[field, program, difficulty],
			);
			if (cnt.rows[0].n > 0) continue; // already covered

			// choose source: explicit program questions, else generic-by-field
			const key = `${field}::${program}`;
			const explicit = QUESTIONS[key]?.[difficulty];
			const texts = explicit && explicit.length > 0 ? explicit : GENERIC_BY_FIELD[field]?.[difficulty] || [];

			let order = 0;
			let inserted = 0;
			for (const text of texts) {
				if (await insertQuestion(field, program, difficulty, text, order++)) inserted++;
			}
			if (inserted > 0) {
				summary.questionsInserted[key] = summary.questionsInserted[key] || {};
				summary.questionsInserted[key][difficulty] = inserted;
			}
		}
	}

	// --- Verification -------------------------------------------------------
	console.log("\n========== SUMMARY ==========");
	console.log("imta_program reference rows added:", summary.referenceRows.length ? summary.referenceRows : "(none — already present)");
	console.log("mock_ai_program rows added:", summary.mockPrograms.length ? summary.mockPrograms : "(none — already present)");
	console.log("mock questions inserted (by program/difficulty):", JSON.stringify(summary.questionsInserted, null, 2));

	// Coverage check: any active program × difficulty still at 0?
	const gaps = await client.query(`
		WITH active AS (SELECT field, program_id FROM mock_ai_program WHERE is_active=true),
		     diffs(difficulty) AS (VALUES ('debutant'),('intermediaire'),('avance')),
		     combos AS (SELECT a.field, a.program_id, d.difficulty FROM active a CROSS JOIN diffs d)
		SELECT c.field, c.program_id, c.difficulty
		FROM combos c
		LEFT JOIN mock_ai_question q
		  ON q.field=c.field::mock_ai_field AND q.program=c.program_id
		     AND q.difficulty=c.difficulty::mock_ai_difficulty AND q.is_active=true
		WHERE q.id IS NULL
		ORDER BY c.field, c.program_id, c.difficulty`);

	console.log("\n========== COVERAGE GAPS (active program × difficulty with 0 questions) ==========");
	if (gaps.rowCount === 0) {
		console.log("NONE — every active mock_ai_program has questions at all 3 difficulties.");
	} else {
		console.log(JSON.stringify(gaps.rows, null, 2));
	}

	// Reference-table coverage vs enrolled users
	const enrolledGap = await client.query(`
		SELECT u.imta_program, count(*)::int AS users
		FROM "user" u
		LEFT JOIN imta_program p ON p.id = u.imta_program
		WHERE u.imta_program IS NOT NULL AND p.id IS NULL
		GROUP BY u.imta_program`);
	console.log("\n========== ENROLLED programs MISSING from imta_program reference table ==========");
	console.log(enrolledGap.rowCount === 0 ? "NONE — every enrolled program has a reference row." : JSON.stringify(enrolledGap.rows, null, 2));

	// Per-field totals
	const perField = await client.query(
		`SELECT field, count(*)::int AS questions FROM mock_ai_question WHERE is_active=true GROUP BY field ORDER BY field`,
	);
	console.log("\n========== mock_ai_question totals per field ==========");
	console.log(JSON.stringify(perField.rows, null, 2));

	await client.end();
}

main().catch(async (e) => {
	console.error(e);
	try {
		await client.end();
	} catch {}
	process.exit(1);
});
