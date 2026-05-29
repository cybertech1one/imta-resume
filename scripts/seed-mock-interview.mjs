/**
 * Seed the Mock Interview ("mock-ai" = MOCK INTERVIEW) question bank and config.
 *
 * Tables seeded (all previously empty):
 *   - mock_ai_field_config       (3 fields: healthcare, industrial, hse)
 *   - mock_ai_difficulty_config  (3 levels: debutant, intermediaire, avance)
 *   - mock_ai_feedback_template  (4 score categories)
 *   - mock_ai_interview_tip      (12 general interview tips)
 *   - mock_ai_program            (program list per field, aligned to imta_program)
 *   - mock_ai_question           (questions per field/program/difficulty)
 *
 * Content is French-first and aligned to IMTA vocational programs:
 *   healthcare (infirmier/nurse, sage-femme, aide-soignant),
 *   industrial (soudeur/welder, cariste/forklift, maintenance, electromecanique),
 *   hse (securite/HSE).
 *
 * Enum constraints (verified against the live LOCAL DB):
 *   mock_ai_field        = healthcare | industrial | hse
 *   mock_ai_difficulty   = debutant | intermediaire | avance
 *   feedback_score_category = excellent | good | average | poor
 *
 * Idempotent: each table uses a natural-key existence check before INSERT so
 * the script is safe to re-run without creating duplicates.
 *
 * Usage: node scripts/seed-mock-interview.mjs
 *
 * NOTE: Connects directly to the LOCAL PostgreSQL (localhost:5432), NOT Docker.
 */

import { randomUUID } from "node:crypto";
import pg from "pg";
const { Client } = pg;

const DB_CONFIG = {
	host: "localhost",
	port: 5432,
	database: "postgres",
	user: "postgres",
	password: "postgres",
};

// ============================================================================
// FIELD CONFIGS
// ============================================================================
const FIELD_CONFIGS = [
	{
		field: "healthcare",
		label: "Santé",
		icon: "HeartIcon",
		color: "text-red-600 dark:text-red-400",
		bgColor: "bg-red-100 dark:bg-red-900/30",
	},
	{
		field: "industrial",
		label: "Industrie",
		icon: "WrenchIcon",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	{
		field: "hse",
		label: "Hygiène, Sécurité & Environnement",
		icon: "ShieldCheckIcon",
		color: "text-green-600 dark:text-green-400",
		bgColor: "bg-green-100 dark:bg-green-900/30",
	},
];

// ============================================================================
// DIFFICULTY CONFIGS
// ============================================================================
const DIFFICULTY_CONFIGS = [
	{ difficulty: "debutant", label: "Débutant", color: "text-green-600 dark:text-green-400", questionsCount: 5 },
	{ difficulty: "intermediaire", label: "Intermédiaire", color: "text-amber-600 dark:text-amber-400", questionsCount: 7 },
	{ difficulty: "avance", label: "Avancé", color: "text-red-600 dark:text-red-400", questionsCount: 10 },
];

// ============================================================================
// FEEDBACK TEMPLATES (by score category)
// ============================================================================
const FEEDBACK_TEMPLATES = [
	{
		category: "excellent",
		minScore: 85,
		maxScore: 100,
		strengths: [
			"Réponses structurées et complètes",
			"Excellente utilisation d'exemples concrets",
			"Communication claire et professionnelle",
			"Bonne maîtrise du vocabulaire technique",
		],
		improvements: [
			"Continuez à pratiquer pour maintenir ce niveau",
			"Préparez des exemples supplémentaires pour varier vos réponses",
		],
	},
	{
		category: "good",
		minScore: 70,
		maxScore: 84,
		strengths: [
			"Bonne compréhension des questions",
			"Réponses pertinentes et cohérentes",
			"Attitude professionnelle",
		],
		improvements: [
			"Ajoutez plus d'exemples concrets tirés de vos stages",
			"Structurez davantage vos réponses (méthode STAR)",
			"Développez vos réponses pour montrer votre expertise",
		],
	},
	{
		category: "average",
		minScore: 50,
		maxScore: 69,
		strengths: [
			"Réponses correctes sur les bases",
			"Volonté de bien faire perceptible",
		],
		improvements: [
			"Approfondissez vos connaissances techniques",
			"Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)",
			"Donnez des exemples précis plutôt que des généralités",
			"Travaillez la confiance et la clarté de l'expression",
		],
	},
	{
		category: "poor",
		minScore: 0,
		maxScore: 49,
		strengths: ["Participation à l'exercice", "Première étape vers la progression"],
		improvements: [
			"Révisez les fondamentaux de votre métier",
			"Préparez des réponses aux questions courantes avant l'entretien",
			"Entraînez-vous à parler à voix haute pour gagner en aisance",
			"Préparez 2-3 exemples concrets de vos expériences",
			"Renseignez-vous sur l'entreprise et le poste visé",
		],
	},
];

// ============================================================================
// GENERAL INTERVIEW TIPS
// ============================================================================
const INTERVIEW_TIPS = [
	{ title: "Préparez votre présentation", content: "Préparez une présentation de 2 minutes : formation, expériences clés et motivation pour le poste." },
	{ title: "Renseignez-vous sur l'entreprise", content: "Étudiez la mission, les valeurs et les activités de l'entreprise avant l'entretien." },
	{ title: "Utilisez la méthode STAR", content: "Structurez vos réponses : Situation, Tâche, Action, Résultat pour des exemples clairs et convaincants." },
	{ title: "Donnez des exemples concrets", content: "Appuyez chaque réponse sur des exemples précis tirés de vos stages ou formations." },
	{ title: "Soignez votre langage corporel", content: "Maintenez le contact visuel, tenez-vous droit et offrez une poignée de main ferme." },
	{ title: "Restez calme sous pression", content: "Respirez avant de répondre aux questions difficiles. Prendre quelques secondes pour réfléchir est normal." },
	{ title: "Préparez vos documents", content: "Apportez plusieurs copies de votre CV, vos diplômes et vos attestations de stage." },
	{ title: "Posez des questions pertinentes", content: "Préparez 2-3 questions sur le poste, l'équipe ou les perspectives d'évolution." },
	{ title: "Mettez en avant la sécurité", content: "Dans les métiers techniques, montrez toujours que la sécurité est votre priorité." },
	{ title: "Soyez ponctuel", content: "Arrivez 10 à 15 minutes en avance. Anticipez le trajet et les imprévus." },
	{ title: "Adaptez votre tenue", content: "Choisissez une tenue propre et professionnelle adaptée au secteur." },
	{ title: "Terminez par un remerciement", content: "Remerciez le recruteur et réaffirmez votre motivation à la fin de l'entretien." },
];

// ============================================================================
// PROGRAMS PER FIELD (program_id aligns to imta_program ids where applicable)
// The mock_ai_field enum only supports healthcare/industrial/hse, so management
// and technology programs are not represented here (out of scope for this enum).
// ============================================================================
const PROGRAMS = [
	// healthcare
	{ field: "healthcare", programId: "infirmier_polyvalent", programName: "Infirmier Polyvalent" },
	{ field: "healthcare", programId: "sage_femme", programName: "Sage-Femme" },
	{ field: "healthcare", programId: "aide_soignant", programName: "Aide Soignant" },
	{ field: "healthcare", programId: "auxiliaire_puericulture", programName: "Auxiliaire de Puériculture" },
	{ field: "healthcare", programId: "technicien_laboratoire", programName: "Technicien de Laboratoire" },
	{ field: "healthcare", programId: "technicien_anesthesie", programName: "Technicien d'Anesthésie" },
	// industrial
	{ field: "industrial", programId: "soudure", programName: "Soudeur" },
	{ field: "industrial", programId: "conducteur_engins", programName: "Conducteur d'Engins / Cariste" },
	{ field: "industrial", programId: "maintenance_industrielle", programName: "Technicien de Maintenance Industrielle" },
	{ field: "industrial", programId: "electromecanique", programName: "Technicien Électromécanique" },
	{ field: "industrial", programId: "technicien_froid", programName: "Technicien en Froid et Climatisation" },
	// hse
	{ field: "hse", programId: "hse_specialist", programName: "Spécialiste HSE" },
	{ field: "hse", programId: "hse_advanced", programName: "Hygiène, Sécurité et Environnement (HSE)" },
];

// ============================================================================
// QUESTION BANK PER FIELD
// Each question: { program, difficulty, questionText }
// `program` is "general" for cross-program questions within a field, otherwise
// a specific imta_program id. Difficulty: debutant | intermediaire | avance.
// ============================================================================

const QUESTIONS = [];
let order = 0;
function addQ(field, program, difficulty, questionText) {
	order++;
	QUESTIONS.push({ field, program, difficulty, questionText, order });
}

// ---- HEALTHCARE (15) ----
addQ("healthcare", "general", "debutant", "Présentez-vous et expliquez pourquoi vous avez choisi une carrière dans la santé.");
addQ("healthcare", "general", "debutant", "Quelles qualités humaines sont essentielles pour travailler dans le domaine médical?");
addQ("healthcare", "general", "debutant", "Comment expliquez-vous l'importance de l'hygiène des mains en milieu hospitalier?");
addQ("healthcare", "infirmier_polyvalent", "intermediaire", "Comment prendriez-vous en charge un patient anxieux avant un soin?");
addQ("healthcare", "infirmier_polyvalent", "intermediaire", "Décrivez les étapes que vous suivez avant d'administrer un médicament à un patient.");
addQ("healthcare", "infirmier_polyvalent", "avance", "Que feriez-vous si vous constatiez une erreur de médication après l'avoir administrée?");
addQ("healthcare", "infirmier_polyvalent", "avance", "Comment priorisez-vous vos soins lorsque plusieurs patients nécessitent votre attention en même temps?");
addQ("healthcare", "sage_femme", "intermediaire", "Comment accompagnez-vous une future maman lors de sa première consultation prénatale?");
addQ("healthcare", "sage_femme", "avance", "Comment réagiriez-vous face à une complication soudaine pendant un accouchement?");
addQ("healthcare", "aide_soignant", "debutant", "Quelles sont les tâches principales d'un aide-soignant au quotidien?");
addQ("healthcare", "aide_soignant", "intermediaire", "Comment aidez-vous un patient à mobilité réduite à se déplacer en toute sécurité?");
addQ("healthcare", "technicien_laboratoire", "intermediaire", "Comment garantissez-vous la fiabilité des résultats d'analyse d'un échantillon biologique?");
addQ("healthcare", "technicien_anesthesie", "avance", "Quelles vérifications effectuez-vous sur le matériel d'anesthésie avant une intervention?");
addQ("healthcare", "general", "intermediaire", "Comment géreriez-vous un patient difficile ou agressif tout en restant professionnel?");
addQ("healthcare", "general", "avance", "Comment maintenez-vous la confidentialité des informations médicales des patients?");

// ---- INDUSTRIAL (15) ----
addQ("industrial", "general", "debutant", "Présentez-vous et expliquez votre intérêt pour le secteur industriel.");
addQ("industrial", "general", "debutant", "Pourquoi le respect des consignes de sécurité est-il important sur un site industriel?");
addQ("industrial", "general", "debutant", "Comment réagissez-vous lorsque vous ne comprenez pas une instruction technique?");
addQ("industrial", "soudure", "intermediaire", "Quelle est la différence entre le soudage MIG, TIG et à l'arc, et quand les utiliser?");
addQ("industrial", "soudure", "intermediaire", "Comment préparez-vous une pièce métallique avant de réaliser une soudure de qualité?");
addQ("industrial", "soudure", "avance", "Comment identifiez-vous et corrigez-vous un défaut de soudure (porosité, fissure)?");
addQ("industrial", "conducteur_engins", "debutant", "Quelles vérifications faites-vous avant de démarrer un chariot élévateur?");
addQ("industrial", "conducteur_engins", "intermediaire", "Comment assurez-vous la sécurité des piétons lorsque vous manœuvrez un engin?");
addQ("industrial", "conducteur_engins", "avance", "Que faites-vous si vous remarquez une anomalie sur votre engin en pleine opération?");
addQ("industrial", "maintenance_industrielle", "intermediaire", "Quelle est la différence entre maintenance préventive et corrective?");
addQ("industrial", "maintenance_industrielle", "avance", "Décrivez votre démarche pour diagnostiquer une panne sur une machine de production.");
addQ("industrial", "electromecanique", "intermediaire", "Comment intervenez-vous en sécurité sur une installation électrique sous tension?");
addQ("industrial", "electromecanique", "avance", "Comment dépannez-vous un automate programmable (PLC) qui a cessé de fonctionner?");
addQ("industrial", "technicien_froid", "intermediaire", "Quelles précautions prenez-vous lors de la manipulation de fluides frigorigènes?");
addQ("industrial", "general", "avance", "Comment contribuez-vous à l'amélioration continue (Lean, 5S) sur votre poste de travail?");

// ---- HSE (12) ----
addQ("hse", "general", "debutant", "Présentez-vous et expliquez ce que signifie HSE pour vous.");
addQ("hse", "general", "debutant", "Quels sont les principaux équipements de protection individuelle (EPI) et leur utilité?");
addQ("hse", "general", "debutant", "Que feriez-vous si vous étiez témoin d'un comportement dangereux sur le lieu de travail?");
addQ("hse", "hse_specialist", "intermediaire", "Comment réaliseriez-vous une évaluation des risques pour un nouveau poste de travail?");
addQ("hse", "hse_specialist", "intermediaire", "Comment sensibilisez-vous les employés à la culture de la sécurité?");
addQ("hse", "hse_specialist", "avance", "Décrivez votre démarche d'enquête après un accident du travail.");
addQ("hse", "hse_specialist", "avance", "Comment mettez-vous en conformité un site avec la norme ISO 45001?");
addQ("hse", "hse_advanced", "intermediaire", "Comment élaborez-vous un plan d'évacuation et d'intervention d'urgence?");
addQ("hse", "hse_advanced", "avance", "Comment gérez-vous le suivi des indicateurs de sécurité (taux de fréquence, gravité)?");
addQ("hse", "general", "intermediaire", "Comment réagiriez-vous en cas de déversement accidentel de produit chimique?");
addQ("hse", "general", "avance", "Comment concilieriez-vous les exigences de production avec les contraintes de sécurité?");
addQ("hse", "general", "avance", "Comment intégrez-vous les enjeux environnementaux dans une démarche HSE?");

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================
async function main() {
	console.log("=== Mock Interview Seed (mock_ai_*) ===\n");

	const client = new Client(DB_CONFIG);
	await client.connect();
	console.log("Connected to LOCAL PostgreSQL (localhost:5432)\n");

	try {
		// --- Field configs (unique on field) ---
		let n = 0;
		for (const f of FIELD_CONFIGS) {
			const r = await client.query(
				`INSERT INTO mock_ai_field_config (id, field, label, icon, color, bg_color, is_active)
				 VALUES ($1, $2, $3, $4, $5, $6, true)
				 ON CONFLICT (field) DO NOTHING`,
				[randomUUID(), f.field, f.label, f.icon, f.color, f.bgColor],
			);
			n += r.rowCount;
		}
		console.log(`mock_ai_field_config: +${n} inserted`);

		// --- Difficulty configs (unique on difficulty) ---
		n = 0;
		for (const d of DIFFICULTY_CONFIGS) {
			const r = await client.query(
				`INSERT INTO mock_ai_difficulty_config (id, difficulty, label, color, questions_count, is_active)
				 VALUES ($1, $2, $3, $4, $5, true)
				 ON CONFLICT (difficulty) DO NOTHING`,
				[randomUUID(), d.difficulty, d.label, d.color, d.questionsCount],
			);
			n += r.rowCount;
		}
		console.log(`mock_ai_difficulty_config: +${n} inserted`);

		// --- Feedback templates (no unique constraint -> check by category) ---
		n = 0;
		for (const t of FEEDBACK_TEMPLATES) {
			const exists = await client.query("SELECT 1 FROM mock_ai_feedback_template WHERE category=$1", [t.category]);
			if (exists.rows.length === 0) {
				await client.query(
					`INSERT INTO mock_ai_feedback_template (id, category, min_score, max_score, strengths, improvements, is_active)
					 VALUES ($1, $2, $3, $4, $5, $6, true)`,
					[randomUUID(), t.category, t.minScore, t.maxScore, t.strengths, t.improvements],
				);
				n++;
			}
		}
		console.log(`mock_ai_feedback_template: +${n} inserted`);

		// --- Interview tips (check by title) ---
		n = 0;
		let tipOrder = 0;
		for (const tip of INTERVIEW_TIPS) {
			tipOrder++;
			const exists = await client.query("SELECT 1 FROM mock_ai_interview_tip WHERE title=$1", [tip.title]);
			if (exists.rows.length === 0) {
				await client.query(
					`INSERT INTO mock_ai_interview_tip (id, title, content, "order", is_active)
					 VALUES ($1, $2, $3, $4, true)`,
					[randomUUID(), tip.title, tip.content, tipOrder],
				);
				n++;
			}
		}
		console.log(`mock_ai_interview_tip: +${n} inserted`);

		// --- Programs (unique on field+program_id) ---
		n = 0;
		let progOrder = 0;
		for (const p of PROGRAMS) {
			progOrder++;
			const r = await client.query(
				`INSERT INTO mock_ai_program (id, field, program_id, program_name, "order", is_active)
				 VALUES ($1, $2, $3, $4, $5, true)
				 ON CONFLICT (field, program_id) DO NOTHING`,
				[randomUUID(), p.field, p.programId, p.programName, progOrder],
			);
			n += r.rowCount;
		}
		console.log(`mock_ai_program: +${n} inserted`);

		// --- Questions (check by field+program+difficulty+question_text) ---
		n = 0;
		for (const q of QUESTIONS) {
			const exists = await client.query(
				"SELECT 1 FROM mock_ai_question WHERE field=$1 AND program=$2 AND difficulty=$3 AND question_text=$4",
				[q.field, q.program, q.difficulty, q.questionText],
			);
			if (exists.rows.length === 0) {
				await client.query(
					`INSERT INTO mock_ai_question (id, field, program, difficulty, question_text, "order", is_active)
					 VALUES ($1, $2, $3, $4, $5, $6, true)`,
					[randomUUID(), q.field, q.program, q.difficulty, q.questionText, q.order],
				);
				n++;
			}
		}
		console.log(`mock_ai_question: +${n} inserted`);

		// ====================================================================
		// FINAL COUNTS
		// ====================================================================
		console.log(`\n${"=".repeat(60)}`);
		console.log("FINAL ROW COUNTS (LOCAL DB):");
		console.log("=".repeat(60));
		for (const tbl of [
			"mock_ai_field_config",
			"mock_ai_difficulty_config",
			"mock_ai_feedback_template",
			"mock_ai_interview_tip",
			"mock_ai_program",
			"mock_ai_question",
		]) {
			const c = await client.query(`SELECT COUNT(*) AS cnt FROM ${tbl}`);
			console.log(`  ${tbl.padEnd(28)} ${c.rows[0].cnt} rows`);
		}

		console.log("\nmock_ai_question by field:");
		const byField = await client.query(
			"SELECT field, COUNT(*) AS cnt FROM mock_ai_question GROUP BY field ORDER BY field",
		);
		for (const r of byField.rows) console.log(`  ${r.field}: ${r.cnt}`);

		console.log("\nmock_ai_question by difficulty:");
		const byDiff = await client.query(
			"SELECT difficulty, COUNT(*) AS cnt FROM mock_ai_question GROUP BY difficulty ORDER BY difficulty",
		);
		for (const r of byDiff.rows) console.log(`  ${r.difficulty}: ${r.cnt}`);

		console.log("\n=== SEED COMPLETE ===");
	} catch (err) {
		console.error("\nFATAL ERROR:", err.message);
		console.error(err.stack);
		process.exit(1);
	} finally {
		await client.end();
	}
}

main().catch(console.error);
