/**
 * Generate program-specific French interview questions for IMTA vocational
 * programs using DeepSeek (key read from ai_provider_config in prod), then
 * seed them idempotently into interview_common_question with a `program` scope.
 *
 * Idempotent: deterministic ids (prog-<programId>-q01..) + ON CONFLICT DO NOTHING.
 * Run: source resume-maker-sdlc/.deploy-vars && node scripts/gen-program-questions.mjs
 * Optional: PROGRAMS=soudure,cariste node scripts/gen-program-questions.mjs
 */
import { writeFileSync } from "node:fs";
import pg from "pg";

const { Client } = pg;

// IMTA program id -> { fr profession label, field, rich vocational context }
const PROGRAMS = {
	infirmier_polyvalent: {
		field: "healthcare",
		label: "Infirmier Polyvalent (soins infirmiers en milieu hospitalier)",
		context:
			"Soins infirmiers polyvalents: administration de medicaments, pose de perfusions, pansements, surveillance des constantes vitales, prise en charge des urgences, dossier de soins, communication avec patients et familles, travail d'equipe et garde de nuit dans les hopitaux et cliniques au Maroc.",
	},
	aide_soignant: {
		field: "healthcare",
		label: "Aide-Soignant (soins de nursing et accompagnement du patient)",
		context:
			"Aide-soignant: aide a la toilette et a l'hygiene, aide a la mobilite et aux repas, mesure des constantes vitales simples, accompagnement des patients ages ou en fin de vie, respect de la dignite, transmission a l'infirmier, prevention des escarres, en hopital, EHPAD et dispensaire.",
	},
	sage_femme: {
		field: "healthcare",
		label: "Sage-Femme (suivi de grossesse et accouchement)",
		context:
			"Sage-femme: consultations prenatales, suivi de grossesse, preparation a l'accouchement, accouchement eutocique, soins post-partum a la mere et au nouveau-ne, depistage des grossesses a risque, education a la sante, situations d'urgence obstetricale, en maternite et centre de sante au Maroc.",
	},
	technicien_laboratoire: {
		field: "healthcare",
		label: "Technicien de Laboratoire (analyses biomedicales)",
		context:
			"Technicien de laboratoire: prelevements sanguins, preparation des echantillons, analyses biochimiques et hematologiques, utilisation des automates d'analyse, controle qualite, respect des normes d'hygiene et de biosecurite, gestion des reactifs, en laboratoire d'analyses medicales et hopital.",
	},
	soudure: {
		field: "industrial",
		label: "Soudeur (soudage et assemblage metallique)",
		context:
			"Soudeur: procedes de soudage SMAW (electrode enrobee), MIG/MAG et TIG, preparation des pieces (chanfreinage, pointage), reglage des parametres (intensite, tension), lecture des symboles de soudure, controle des defauts (visuel, ressuage), positions de soudage, securite (masque, ventilation, risque incendie), en chaudronnerie et construction metallique.",
	},
	cariste: {
		field: "industrial",
		label: "Cariste (conduite de chariots elevateurs et logistique)",
		context:
			"Cariste: conduite de chariots elevateurs (frontal, retractable), verification quotidienne (freins, fourches, klaxon), gerbage et depalettisation, circulation en entrepot et zones pietonnes, chargement de camions, gestion de stock FIFO/LIFO, CACES R489, securite des charges, en entrepots et plateformes logistiques.",
	},
	conducteur_engins: {
		field: "industrial",
		label: "Conducteur d'Engins (engins de chantier et BTP)",
		context:
			"Conducteur d'engins: conduite de pelles, chargeuses, bulldozers et compacteurs, inspection pre-demarrage (check-list), conduite en terrain difficile, signalisation de chantier, prevention du renversement, entretien courant (niveaux, graissage), EPI, lecture de plans de terrassement, sur chantiers BTP, mines et carrieres.",
	},
	electromecanique: {
		field: "industrial",
		label: "Technicien Electromecanique (maintenance industrielle)",
		context:
			"Electromecanique: diagnostic de pannes electriques et mecaniques, lecture de schemas (puissance et commande), cablage d'armoires et de moteurs, automatismes (automates Siemens/Schneider), variateurs de vitesse, pneumatique et hydraulique, maintenance preventive, consignation LOTO, habilitations electriques, en usines et industries agroalimentaires.",
	},
	maintenance_industrielle: {
		field: "industrial",
		label: "Technicien de Maintenance Industrielle",
		context:
			"Maintenance industrielle: maintenance preventive et corrective, diagnostic de pannes sur lignes de production, lecture de plans mecaniques, alignement et reglage de machines, gestion de la GMAO, remplacement de roulements et courroies, lubrification, securite machine et consignation, en usines de production.",
	},
	technicien_froid: {
		field: "industrial",
		label: "Technicien en Froid et Climatisation",
		context:
			"Froid et climatisation: installation et maintenance de systemes frigorifiques et de climatisation, charge et recuperation de fluides frigorigenes, diagnostic de pannes (compresseur, detendeur, fuite), lecture de schemas frigorifiques, regulation, respect de la reglementation sur les fluides, securite electrique, chez les installateurs et l'industrie agroalimentaire.",
	},
	genie_civil_btp: {
		field: "industrial",
		label: "Technicien Genie Civil et BTP",
		context:
			"Genie civil et BTP: lecture de plans de construction, implantation et tracage, suivi de chantier, controle de la qualite du beton et des materiaux, metres et quantitatifs, coordination des equipes, respect des delais et de la securite chantier, sur chantiers de batiment et travaux publics au Maroc.",
	},
	genie_industriel_logistique: {
		field: "industrial",
		label: "Technicien Genie Industriel et Logistique",
		context:
			"Genie industriel et logistique: gestion des flux et des stocks, ordonnancement de production, amelioration continue (Lean, 5S, Kaizen), planification, gestion d'entrepot et expeditions, indicateurs de performance, optimisation des couts, en industrie et plateformes logistiques.",
	},
	hse_specialist: {
		field: "hse",
		label: "Specialiste HSE (Hygiene, Securite, Environnement)",
		context:
			"HSE: evaluation des risques professionnels (document unique), systemes de management ISO 45001 et ISO 14001, enquete d'accident (arbre des causes, 5 pourquoi), audits internes, plans d'urgence et exercices d'evacuation, indicateurs (taux de frequence/gravite), gestion des produits chimiques et FDS, veille reglementaire (code du travail marocain), en industries, BTP et mines.",
	},
	hse_advanced: {
		field: "hse",
		label: "Technicien HSE (Hygiene, Securite, Environnement industriel)",
		context:
			"HSE industriel: prevention des risques sur site, port et controle des EPI, permis de travail (point chaud, espace confine, travail en hauteur), analyse des situations dangereuses, sensibilisation des operateurs, gestion des dechets industriels, premiers secours et lutte incendie, reporting des incidents, en sites industriels et chantiers.",
	},
};

const TARGET = process.env.PROGRAMS
	? process.env.PROGRAMS.split(",").map((s) => s.trim()).filter(Boolean)
	: Object.keys(PROGRAMS);

// Desired distribution per program (20 total)
const DISTRIBUTION = [
	{ type: "behavioral", n: 4, fr: "comportementales (experiences passees, travail d'equipe, gestion du stress)" },
	{ type: "technical", n: 7, fr: "techniques (savoir-faire metier, procedures, securite specifiques au metier)" },
	{ type: "situational", n: 5, fr: "situationnelles (scenarios concrets sur le terrain)" },
	{ type: "motivation", n: 4, fr: "de motivation (pourquoi ce metier, projet professionnel)" },
];

const DIFFICULTIES = ["easy", "medium", "hard"]; // matches existing DB convention

function buildPrompt(prog) {
	const lines = DISTRIBUTION.map((d) => `- ${d.n} questions ${d.fr} (type="${d.type}")`).join("\n");
	return `Tu es un recruteur marocain experimente qui prepare des entretiens d'embauche pour des laureats de formation professionnelle (IMTA).

Metier cible: ${prog.label}
Contexte du metier: ${prog.context}

Genere EXACTEMENT 20 questions d'entretien REELLES et SPECIFIQUES a ce metier, en francais, telles qu'un employeur marocain les poserait reellement. Repartition obligatoire:
${lines}

Pour chaque question, fournis:
- "question": la question en francais (claire, concrete, adaptee au terrain)
- "type": un de "behavioral" | "technical" | "situational" | "motivation"
- "difficulty": un de "easy" | "medium" | "hard"
- "sampleAnswer": un exemple de bonne reponse en francais (3 a 5 phrases, concret, qui montre le savoir-faire)
- "tips": un tableau de 2 a 3 conseils courts en francais pour bien repondre

Regles:
- Questions techniques = vraies questions metier (procedures, securite, normes, outils reels), PAS des questions generiques.
- Pas de jargon informatique/genie logiciel. Reste dans le metier manuel/technique/medical decrit.
- Reponds UNIQUEMENT avec un tableau JSON valide (commence par [ et finit par ]). Aucun texte autour, pas de balises markdown.`;
}

function stripFences(s) {
	return s.trim().replace(/^```[\w]*\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

async function callDeepSeek(apiKey, baseUrl, model, prompt) {
	const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
		body: JSON.stringify({
			model,
			temperature: 0.6,
			max_tokens: 4000,
			messages: [
				{ role: "system", content: "Tu generes des questions d'entretien professionnelles en francais. Reponds uniquement en JSON." },
				{ role: "user", content: prompt },
			],
		}),
	});
	if (!res.ok) throw new Error(`DeepSeek HTTP ${res.status}: ${await res.text()}`);
	const data = await res.json();
	return data.choices?.[0]?.message?.content ?? "";
}

function normalizeType(t) {
	const v = String(t || "").toLowerCase();
	if (["behavioral", "technical", "situational", "motivation"].includes(v)) return v;
	if (v === "motivational") return "motivation";
	if (v === "competency") return "behavioral";
	return "technical";
}
function normalizeDifficulty(d) {
	const v = String(d || "").toLowerCase();
	return DIFFICULTIES.includes(v) ? v : "medium";
}

async function main() {
	const c = new Client({ connectionString: process.env.PG_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
	await c.connect();

	const provRes = await c.query(
		"SELECT provider, model, api_key, base_url FROM ai_provider_config WHERE provider='deepseek' AND is_enabled=true ORDER BY is_default DESC LIMIT 1",
	);
	if (provRes.rows.length === 0) throw new Error("No enabled deepseek provider in ai_provider_config");
	const prov = provRes.rows[0];
	const baseUrl = prov.base_url || "https://api.deepseek.com/v1";
	console.log(`Using provider deepseek model=${prov.model} base=${baseUrl}`);

	const allRows = [];
	for (const progId of TARGET) {
		const prog = PROGRAMS[progId];
		if (!prog) {
			console.warn(`Skipping unknown program: ${progId}`);
			continue;
		}
		process.stdout.write(`Generating for ${progId}... `);
		let parsed;
		try {
			const raw = await callDeepSeek(prov.api_key, baseUrl, prov.model, buildPrompt(prog));
			parsed = JSON.parse(stripFences(raw));
		} catch (e) {
			console.log(`FAILED: ${e.message}`);
			continue;
		}
		if (!Array.isArray(parsed)) {
			console.log("FAILED: not an array");
			continue;
		}
		let idx = 0;
		for (const q of parsed) {
			if (!q || typeof q.question !== "string" || !q.question.trim()) continue;
			idx += 1;
			const id = `prog-${progId}-q${String(idx).padStart(2, "0")}`;
			const tipsFr = Array.isArray(q.tips) ? q.tips.filter((t) => typeof t === "string").slice(0, 4) : [];
			allRows.push({
				id,
				question: q.question.trim(), // store FR text in both columns (platform is FR-first)
				question_fr: q.question.trim(),
				type: normalizeType(q.type),
				field: prog.field,
				program: progId,
				sample_answer: typeof q.sampleAnswer === "string" ? q.sampleAnswer.trim() : null,
				sample_answer_fr: typeof q.sampleAnswer === "string" ? q.sampleAnswer.trim() : null,
				tips: JSON.stringify(tipsFr),
				tips_fr: JSON.stringify(tipsFr),
				difficulty: normalizeDifficulty(q.difficulty),
				sort_order: idx,
			});
		}
		console.log(`${idx} questions`);
	}

	// Backup the generated payload to a file for auditing / re-seeding
	writeFileSync("scripts/generated-program-questions.json", JSON.stringify(allRows, null, 2));
	console.log(`\nGenerated ${allRows.length} rows total. Seeding (idempotent)...`);

	let inserted = 0;
	for (const r of allRows) {
		const res = await c.query(
			`INSERT INTO interview_common_question
			 (id, question, question_fr, type, field, program, sample_answer, sample_answer_fr, tips, tips_fr, difficulty, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,true,$12)
			 ON CONFLICT (id) DO NOTHING`,
			[
				r.id, r.question, r.question_fr, r.type, r.field, r.program,
				r.sample_answer, r.sample_answer_fr, r.tips, r.tips_fr, r.difficulty, r.sort_order,
			],
		);
		inserted += res.rowCount;
	}
	console.log(`Inserted ${inserted} new rows (existing left untouched).`);

	const counts = await c.query(
		"SELECT program, count(*)::int AS n FROM interview_common_question WHERE program IS NOT NULL GROUP BY program ORDER BY program",
	);
	console.table(counts.rows);
	await c.end();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
