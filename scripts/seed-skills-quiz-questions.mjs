/**
 * Seed the `quiz_question` table (skills quiz) directly into PostgreSQL.
 *
 * The skills-quiz frontend (career/skills-quiz.tsx) currently uses hardcoded
 * questions from career/-components/skills-quiz-config.ts. This script mirrors
 * that exact content into the DB so the feature can become DB-driven.
 *
 * Tables seeded:
 *   - quiz_question (30 rows: 10 technical, 10 soft_skills, 10 leadership)
 *
 * quiz_type = "skills_quiz" for all rows.
 * Idempotent: rows are keyed by id (deterministic). Re-running uses
 * ON CONFLICT (id) DO NOTHING so no duplicates are created.
 *
 * Usage: node scripts/seed-skills-quiz-questions.mjs
 *
 * NOTE: Connects directly to the LOCAL PostgreSQL (localhost:5432), NOT Docker.
 */

import { createHash } from "node:crypto";
import pg from "pg";
const { Client } = pg;

// The quiz_question.id column is a UUID. The config uses stable string keys
// (e.g. "tech-1"). Derive a deterministic UUID from each key so the seed is
// idempotent (same key -> same UUID -> ON CONFLICT (id) DO NOTHING works).
function stableUuid(key) {
	const h = createHash("sha1").update(`quiz_question:${key}`).digest("hex");
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h.slice(16, 17), 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const DB_CONFIG = {
	host: "localhost",
	port: 5432,
	database: "postgres",
	user: "postgres",
	password: "postgres",
};

// quiz_category enum allowed values:
//   personality, interests, skills, work_preferences, values,
//   moroccan_market, environment, stress, work_style, goals
// The config has categories: technical, soft_skills, leadership.
// We map all skills-quiz questions to the "skills" category (the closest
// valid enum value) and keep the original config category in the `trait` field
// so the frontend can still group by technical / soft_skills / leadership.

let sortOrder = 0;
function q(id, configCategory, question, questionFr, explanationFr, options) {
	sortOrder++;
	// options: [{ id, text, isCorrect }] from config — text is French in config.
	const mappedOptions = options.map((o, i) => ({
		id: o.id,
		text: o.text,
		textFr: o.text,
		// store correctness so the DB-driven quiz can score answers
		scores: { correct: o.isCorrect ? 1 : 0 },
		sortOrder: i + 1,
	}));
	return {
		id: stableUuid(id),
		quizType: "skills_quiz",
		// `question` (English-intent) and `questionFr` (display) — config is FR-only,
		// so we use the same French text for both to satisfy NOT NULL constraints.
		question,
		questionFr,
		descriptionFr: explanationFr,
		category: "skills",
		trait: configCategory, // technical | soft_skills | leadership
		options: mappedOptions,
		sortOrder,
	};
}

// ---------------------------------------------------------------------------
// TECHNICAL (10) — mirrors TECHNICAL_QUESTIONS in skills-quiz-config.ts
// ---------------------------------------------------------------------------
const TECHNICAL = [
	q("tech-1", "technical",
		"Quelle est la meilleure pratique pour la gestion des erreurs dans un code professionnel?",
		"Quelle est la meilleure pratique pour la gestion des erreurs dans un code professionnel?",
		"La gestion des exceptions avec des messages clairs permet de deboguer plus facilement et d'ameliorer la maintenance du code.",
		[
			{ id: "tech-1-a", text: "Ignorer les erreurs pour eviter les crashes", isCorrect: false },
			{ id: "tech-1-b", text: "Utiliser des blocs try-catch avec des messages d'erreur descriptifs", isCorrect: true },
			{ id: "tech-1-c", text: "Afficher toutes les erreurs a l'utilisateur final", isCorrect: false },
			{ id: "tech-1-d", text: "Utiliser des codes d'erreur numeriques sans description", isCorrect: false },
		]),
	q("tech-2", "technical",
		"Quel principe de conception logicielle recommande qu'une classe ne devrait avoir qu'une seule raison de changer?",
		"Quel principe de conception logicielle recommande qu'une classe ne devrait avoir qu'une seule raison de changer?",
		"Le principe de responsabilite unique (SRP) est le 'S' de SOLID et favorise la maintenabilite du code.",
		[
			{ id: "tech-2-a", text: "Principe d'ouverture/fermeture", isCorrect: false },
			{ id: "tech-2-b", text: "Principe de substitution de Liskov", isCorrect: false },
			{ id: "tech-2-c", text: "Principe de responsabilite unique", isCorrect: true },
			{ id: "tech-2-d", text: "Principe d'inversion de dependance", isCorrect: false },
		]),
	q("tech-3", "technical",
		"Quelle commande Git permet de fusionner les modifications d'une branche dans une autre?",
		"Quelle commande Git permet de fusionner les modifications d'une branche dans une autre?",
		"git merge integre les changements d'une branche source dans la branche courante.",
		[
			{ id: "tech-3-a", text: "git push", isCorrect: false },
			{ id: "tech-3-b", text: "git merge", isCorrect: true },
			{ id: "tech-3-c", text: "git pull", isCorrect: false },
			{ id: "tech-3-d", text: "git fetch", isCorrect: false },
		]),
	q("tech-4", "technical",
		"Quelle est la complexite temporelle d'une recherche binaire dans un tableau trie?",
		"Quelle est la complexite temporelle d'une recherche binaire dans un tableau trie?",
		"La recherche binaire divise l'espace de recherche par deux a chaque iteration, d'ou O(log n).",
		[
			{ id: "tech-4-a", text: "O(n)", isCorrect: false },
			{ id: "tech-4-b", text: "O(n^2)", isCorrect: false },
			{ id: "tech-4-c", text: "O(log n)", isCorrect: true },
			{ id: "tech-4-d", text: "O(1)", isCorrect: false },
		]),
	q("tech-5", "technical",
		"Quel protocole est utilise pour securiser les communications sur le web?",
		"Quel protocole est utilise pour securiser les communications sur le web?",
		"HTTPS utilise TLS/SSL pour chiffrer les communications entre le client et le serveur.",
		[
			{ id: "tech-5-a", text: "HTTP", isCorrect: false },
			{ id: "tech-5-b", text: "FTP", isCorrect: false },
			{ id: "tech-5-c", text: "HTTPS", isCorrect: true },
			{ id: "tech-5-d", text: "SMTP", isCorrect: false },
		]),
	q("tech-6", "technical",
		"Quelle est la difference principale entre SQL et NoSQL?",
		"Quelle est la difference principale entre SQL et NoSQL?",
		"SQL utilise des schemas fixes et des relations, tandis que NoSQL offre plus de flexibilite dans la structure des donnees.",
		[
			{ id: "tech-6-a", text: "SQL est plus rapide que NoSQL", isCorrect: false },
			{ id: "tech-6-b", text: "NoSQL ne peut pas stocker de donnees", isCorrect: false },
			{ id: "tech-6-c", text: "SQL utilise des schemas structures, NoSQL est plus flexible", isCorrect: true },
			{ id: "tech-6-d", text: "Il n'y a pas de difference", isCorrect: false },
		]),
	q("tech-7", "technical",
		"Qu'est-ce qu'une API RESTful?",
		"Qu'est-ce qu'une API RESTful?",
		"REST (Representational State Transfer) definit des conventions pour les APIs web utilisant HTTP.",
		[
			{ id: "tech-7-a", text: "Une base de donnees relationnelle", isCorrect: false },
			{ id: "tech-7-b", text: "Une interface de programmation suivant les principes REST", isCorrect: true },
			{ id: "tech-7-c", text: "Un langage de programmation", isCorrect: false },
			{ id: "tech-7-d", text: "Un systeme d'exploitation", isCorrect: false },
		]),
	q("tech-8", "technical",
		"Quel pattern de conception est utilise pour creer une seule instance d'une classe?",
		"Quel pattern de conception est utilise pour creer une seule instance d'une classe?",
		"Le pattern Singleton garantit qu'une classe n'a qu'une seule instance accessible globalement.",
		[
			{ id: "tech-8-a", text: "Factory", isCorrect: false },
			{ id: "tech-8-b", text: "Observer", isCorrect: false },
			{ id: "tech-8-c", text: "Singleton", isCorrect: true },
			{ id: "tech-8-d", text: "Strategy", isCorrect: false },
		]),
	q("tech-9", "technical",
		"Quelle est la fonction principale d'un load balancer?",
		"Quelle est la fonction principale d'un load balancer?",
		"Un load balancer distribue le trafic entre plusieurs serveurs pour optimiser les performances et la disponibilite.",
		[
			{ id: "tech-9-a", text: "Stocker des donnees", isCorrect: false },
			{ id: "tech-9-b", text: "Distribuer le trafic entre plusieurs serveurs", isCorrect: true },
			{ id: "tech-9-c", text: "Compiler du code", isCorrect: false },
			{ id: "tech-9-d", text: "Gerer les utilisateurs", isCorrect: false },
		]),
	q("tech-10", "technical",
		"Qu'est-ce que le principe DRY en programmation?",
		"Qu'est-ce que le principe DRY en programmation?",
		"DRY (Don't Repeat Yourself) encourage a eviter la duplication de code pour ameliorer la maintenabilite.",
		[
			{ id: "tech-10-a", text: "Documenter tout le code", isCorrect: false },
			{ id: "tech-10-b", text: "Ne pas repeter le code", isCorrect: true },
			{ id: "tech-10-c", text: "Toujours utiliser des variables globales", isCorrect: false },
			{ id: "tech-10-d", text: "Ecrire des tests unitaires", isCorrect: false },
		]),
];

// ---------------------------------------------------------------------------
// SOFT SKILLS (10) — mirrors SOFT_SKILLS_QUESTIONS
// ---------------------------------------------------------------------------
const SOFT = [
	q("soft-1", "soft_skills",
		"Lors d'un conflit avec un collegue, quelle est la meilleure approche initiale?",
		"Lors d'un conflit avec un collegue, quelle est la meilleure approche initiale?",
		"L'ecoute active permet de comprendre le point de vue de l'autre et de desamorcer les tensions.",
		[
			{ id: "soft-1-a", text: "Eviter la personne jusqu'a ce que le conflit se resolve seul", isCorrect: false },
			{ id: "soft-1-b", text: "Impliquer immediatement la direction", isCorrect: false },
			{ id: "soft-1-c", text: "Ecouter activement et chercher a comprendre son point de vue", isCorrect: true },
			{ id: "soft-1-d", text: "Defendre fermement votre position des le depart", isCorrect: false },
		]),
	q("soft-2", "soft_skills",
		"Qu'est-ce que l'intelligence emotionnelle implique principalement?",
		"Qu'est-ce que l'intelligence emotionnelle implique principalement?",
		"L'intelligence emotionnelle combine la conscience de soi, la gestion des emotions, l'empathie et les competences sociales.",
		[
			{ id: "soft-2-a", text: "Avoir un QI eleve", isCorrect: false },
			{ id: "soft-2-b", text: "Reconnaitre et gerer ses emotions et celles des autres", isCorrect: true },
			{ id: "soft-2-c", text: "Eviter les situations emotionnelles", isCorrect: false },
			{ id: "soft-2-d", text: "Toujours rester neutre", isCorrect: false },
		]),
	q("soft-3", "soft_skills",
		"Comment donner un feedback constructif a un collegue?",
		"Comment donner un feedback constructif a un collegue?",
		"Un feedback constructif est specifique, base sur des faits, et propose des pistes d'amelioration.",
		[
			{ id: "soft-3-a", text: "Critiquer devant toute l'equipe pour montrer l'exemple", isCorrect: false },
			{ id: "soft-3-b", text: "Etre specifique, factuel et proposer des solutions", isCorrect: true },
			{ id: "soft-3-c", text: "Attendre l'evaluation annuelle", isCorrect: false },
			{ id: "soft-3-d", text: "Envoyer un email anonyme", isCorrect: false },
		]),
	q("soft-4", "soft_skills",
		"Quelle technique aide a mieux gerer son temps au travail?",
		"Quelle technique aide a mieux gerer son temps au travail?",
		"La matrice d'Eisenhower aide a prioriser les taches selon leur urgence et importance.",
		[
			{ id: "soft-4-a", text: "Faire toutes les taches en meme temps", isCorrect: false },
			{ id: "soft-4-b", text: "Prioriser avec la matrice urgence/importance", isCorrect: true },
			{ id: "soft-4-c", text: "Toujours dire oui a toutes les demandes", isCorrect: false },
			{ id: "soft-4-d", text: "Travailler sans pause pour finir plus vite", isCorrect: false },
		]),
	q("soft-5", "soft_skills",
		"Qu'est-ce qui caracterise une equipe performante?",
		"Qu'est-ce qui caracterise une equipe performante?",
		"Les equipes performantes ont des objectifs clairs, une communication ouverte et une confiance mutuelle.",
		[
			{ id: "soft-5-a", text: "Une hierarchie stricte sans remise en question", isCorrect: false },
			{ id: "soft-5-b", text: "Des objectifs clairs, communication ouverte et confiance", isCorrect: true },
			{ id: "soft-5-c", text: "Une competition interne forte", isCorrect: false },
			{ id: "soft-5-d", text: "Des reunions quotidiennes de 2 heures", isCorrect: false },
		]),
	q("soft-6", "soft_skills",
		"Comment gerer efficacement le stress au travail?",
		"Comment gerer efficacement le stress au travail?",
		"Une approche proactive incluant organisation, pauses et limites claires aide a gerer le stress.",
		[
			{ id: "soft-6-a", text: "Ignorer le stress et continuer a travailler", isCorrect: false },
			{ id: "soft-6-b", text: "Se plaindre regulierement a ses collegues", isCorrect: false },
			{ id: "soft-6-c", text: "Identifier les sources, prendre des pauses et fixer des limites", isCorrect: true },
			{ id: "soft-6-d", text: "Eviter toutes les situations stressantes", isCorrect: false },
		]),
	q("soft-7", "soft_skills",
		"Quelle est la meilleure facon de s'adapter au changement?",
		"Quelle est la meilleure facon de s'adapter au changement?",
		"L'adaptabilite requiert ouverture d'esprit, apprentissage continu et flexibilite mentale.",
		[
			{ id: "soft-7-a", text: "Resister jusqu'a ce que le changement soit annule", isCorrect: false },
			{ id: "soft-7-b", text: "Accepter passivement sans comprendre", isCorrect: false },
			{ id: "soft-7-c", text: "Etre ouvert, chercher a comprendre et s'ajuster proactivement", isCorrect: true },
			{ id: "soft-7-d", text: "Attendre que les autres s'adaptent d'abord", isCorrect: false },
		]),
	q("soft-8", "soft_skills",
		"Qu'est-ce que l'ecoute active implique?",
		"Qu'est-ce que l'ecoute active implique?",
		"L'ecoute active demande une attention complete, de la reformulation et des questions de clarification.",
		[
			{ id: "soft-8-a", text: "Preparer sa reponse pendant que l'autre parle", isCorrect: false },
			{ id: "soft-8-b", text: "Etre attentif, reformuler et poser des questions", isCorrect: true },
			{ id: "soft-8-c", text: "Interrompre pour montrer son interet", isCorrect: false },
			{ id: "soft-8-d", text: "Hocher la tete sans vraiment ecouter", isCorrect: false },
		]),
	q("soft-9", "soft_skills",
		"Comment developper sa creativite au travail?",
		"Comment developper sa creativite au travail?",
		"La creativite se developpe par la curiosite, l'exposition a diverses idees et la pratique du brainstorming.",
		[
			{ id: "soft-9-a", text: "Suivre toujours les memes methodes eprouvees", isCorrect: false },
			{ id: "soft-9-b", text: "Etre curieux, explorer et pratiquer le brainstorming", isCorrect: true },
			{ id: "soft-9-c", text: "Attendre l'inspiration", isCorrect: false },
			{ id: "soft-9-d", text: "Copier ce que font les autres", isCorrect: false },
		]),
	q("soft-10", "soft_skills",
		"Quelle attitude favorise l'apprentissage continu?",
		"Quelle attitude favorise l'apprentissage continu?",
		"Une mentalite de croissance voit les defis comme des opportunites d'apprentissage.",
		[
			{ id: "soft-10-a", text: "Penser que les competences sont fixes", isCorrect: false },
			{ id: "soft-10-b", text: "Eviter les situations ou on pourrait echouer", isCorrect: false },
			{ id: "soft-10-c", text: "Adopter une mentalite de croissance et voir les erreurs comme des opportunites", isCorrect: true },
			{ id: "soft-10-d", text: "Se concentrer uniquement sur ses forces existantes", isCorrect: false },
		]),
];

// ---------------------------------------------------------------------------
// LEADERSHIP (10) — mirrors LEADERSHIP_QUESTIONS
// ---------------------------------------------------------------------------
const LEADERSHIP = [
	q("lead-1", "leadership",
		"Quel style de leadership est le plus adapte pour une equipe experimente et autonome?",
		"Quel style de leadership est le plus adapte pour une equipe experimente et autonome?",
		"Le leadership delegatif fonctionne bien avec des equipes competentes qui n'ont pas besoin de supervision constante.",
		[
			{ id: "lead-1-a", text: "Autoritaire avec controle strict", isCorrect: false },
			{ id: "lead-1-b", text: "Delegatif avec grande autonomie", isCorrect: true },
			{ id: "lead-1-c", text: "Micromanagement detaille", isCorrect: false },
			{ id: "lead-1-d", text: "Laisser-faire total sans objectifs", isCorrect: false },
		]),
	q("lead-2", "leadership",
		"Comment un leader devrait-il communiquer une vision?",
		"Comment un leader devrait-il communiquer une vision?",
		"Une vision efficace est claire, inspirante et montre le chemin vers l'objectif commun.",
		[
			{ id: "lead-2-a", text: "Par email technique detaille", isCorrect: false },
			{ id: "lead-2-b", text: "De maniere claire, inspirante et en montrant le chemin", isCorrect: true },
			{ id: "lead-2-c", text: "Uniquement aux managers", isCorrect: false },
			{ id: "lead-2-d", text: "Une seule fois en debut d'annee", isCorrect: false },
		]),
	q("lead-3", "leadership",
		"Qu'est-ce qui differencie un leader d'un manager?",
		"Qu'est-ce qui differencie un leader d'un manager?",
		"Les leaders inspirent et transforment, les managers organisent et controlent.",
		[
			{ id: "lead-3-a", text: "Un leader a plus de pouvoir hierarchique", isCorrect: false },
			{ id: "lead-3-b", text: "Un leader inspire et transforme, un manager organise et controle", isCorrect: true },
			{ id: "lead-3-c", text: "Il n'y a pas de difference", isCorrect: false },
			{ id: "lead-3-d", text: "Un manager gagne plus d'argent", isCorrect: false },
		]),
	q("lead-4", "leadership",
		"Comment developper les talents dans son equipe?",
		"Comment developper les talents dans son equipe?",
		"Le coaching, les feedbacks reguliers et les opportunites de croissance developpent les talents.",
		[
			{ id: "lead-4-a", text: "Assigner uniquement des taches dans leur zone de confort", isCorrect: false },
			{ id: "lead-4-b", text: "Coacher, donner des feedbacks et offrir des opportunites de croissance", isCorrect: true },
			{ id: "lead-4-c", text: "Les laisser se debrouiller seuls", isCorrect: false },
			{ id: "lead-4-d", text: "Les former uniquement via des cours en ligne", isCorrect: false },
		]),
	q("lead-5", "leadership",
		"Quelle est la meilleure approche pour prendre des decisions difficiles?",
		"Quelle est la meilleure approche pour prendre des decisions difficiles?",
		"Les bonnes decisions combinent analyse des donnees, consultation et alignement avec les valeurs.",
		[
			{ id: "lead-5-a", text: "Decider seul et rapidement", isCorrect: false },
			{ id: "lead-5-b", text: "Reporter indefiniment pour eviter les erreurs", isCorrect: false },
			{ id: "lead-5-c", text: "Analyser les donnees, consulter et aligner avec les valeurs", isCorrect: true },
			{ id: "lead-5-d", text: "Suivre toujours ce que fait la concurrence", isCorrect: false },
		]),
	q("lead-6", "leadership",
		"Comment maintenir la motivation de son equipe sur le long terme?",
		"Comment maintenir la motivation de son equipe sur le long terme?",
		"La reconnaissance, le sens du travail et les opportunites de developpement maintiennent la motivation.",
		[
			{ id: "lead-6-a", text: "Augmenter les salaires regulierement", isCorrect: false },
			{ id: "lead-6-b", text: "Reconnaitre, donner du sens et offrir des opportunites", isCorrect: true },
			{ id: "lead-6-c", text: "Mettre la pression constamment", isCorrect: false },
			{ id: "lead-6-d", text: "Organiser des fetes frequentes", isCorrect: false },
		]),
	q("lead-7", "leadership",
		"Qu'est-ce que le leadership serviteur?",
		"Qu'est-ce que le leadership serviteur?",
		"Le leadership serviteur met l'accent sur le service aux autres et le developpement de l'equipe.",
		[
			{ id: "lead-7-a", text: "Un leader qui fait tout le travail lui-meme", isCorrect: false },
			{ id: "lead-7-b", text: "Un style ou le leader sert et developpe son equipe", isCorrect: true },
			{ id: "lead-7-c", text: "Un leader qui obeit a toutes les demandes", isCorrect: false },
			{ id: "lead-7-d", text: "Un style de leadership faible", isCorrect: false },
		]),
	q("lead-8", "leadership",
		"Comment gerer une crise en tant que leader?",
		"Comment gerer une crise en tant que leader?",
		"En crise, il faut rester calme, communiquer clairement et prendre des decisions rapides mais reflechies.",
		[
			{ id: "lead-8-a", text: "Paniquer pour montrer l'urgence", isCorrect: false },
			{ id: "lead-8-b", text: "Deleguer entierement et s'effacer", isCorrect: false },
			{ id: "lead-8-c", text: "Rester calme, communiquer et decider rapidement", isCorrect: true },
			{ id: "lead-8-d", text: "Attendre que la crise passe", isCorrect: false },
		]),
	q("lead-9", "leadership",
		"Qu'est-ce qui caracterise un leader ethique?",
		"Qu'est-ce qui caracterise un leader ethique?",
		"Un leader ethique est integre, transparent et prend des decisions justes.",
		[
			{ id: "lead-9-a", text: "Maximiser les profits a tout prix", isCorrect: false },
			{ id: "lead-9-b", text: "Etre integre, transparent et juste", isCorrect: true },
			{ id: "lead-9-c", text: "Suivre les regles sans reflexion", isCorrect: false },
			{ id: "lead-9-d", text: "Satisfaire uniquement les actionnaires", isCorrect: false },
		]),
	q("lead-10", "leadership",
		"Comment construire une culture d'innovation?",
		"Comment construire une culture d'innovation?",
		"L'innovation prospere avec la securite psychologique, la tolerance a l'echec et la diversite des idees.",
		[
			{ id: "lead-10-a", text: "Punir les erreurs pour encourager la prudence", isCorrect: false },
			{ id: "lead-10-b", text: "Creer la securite psychologique et tolerer les echecs", isCorrect: true },
			{ id: "lead-10-c", text: "Copier les innovations des concurrents", isCorrect: false },
			{ id: "lead-10-d", text: "Avoir un departement R&D isole", isCorrect: false },
		]),
];

const ALL_QUESTIONS = [...TECHNICAL, ...SOFT, ...LEADERSHIP];

async function main() {
	console.log("=== Skills Quiz Questions Seed (quiz_question) ===\n");
	console.log(`Questions to upsert: ${ALL_QUESTIONS.length}`);

	const client = new Client(DB_CONFIG);
	await client.connect();
	console.log("Connected to LOCAL PostgreSQL (localhost:5432)\n");

	try {
		let inserted = 0;
		let skipped = 0;
		for (const q of ALL_QUESTIONS) {
			const res = await client.query(
				`INSERT INTO quiz_question
					(id, quiz_type, question, question_fr, description, description_fr, category, question_type, options, trait, field, weight, is_active, sort_order, created_at, updated_at)
				 VALUES ($1, $2, $3, $4, NULL, $5, $6, 'multiple_choice', $7, $8, NULL, 1, true, $9, NOW(), NOW())
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
					q.sortOrder,
				],
			);
			if (res.rowCount > 0) inserted++;
			else skipped++;
		}
		console.log(`Inserted: ${inserted}, Skipped (already present): ${skipped}\n`);

		const total = await client.query("SELECT COUNT(*) AS cnt FROM quiz_question");
		const byTrait = await client.query(
			"SELECT trait, COUNT(*) AS cnt FROM quiz_question WHERE quiz_type='skills_quiz' GROUP BY trait ORDER BY trait",
		);
		console.log(`quiz_question total rows: ${total.rows[0].cnt}`);
		console.log("skills_quiz by trait:");
		for (const r of byTrait.rows) console.log(`  ${r.trait}: ${r.cnt}`);

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
