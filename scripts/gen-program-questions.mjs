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

	// ── Healthcare (uncovered) ──────────────────────────────────────────────
	auxiliaire_puericulture: {
		field: "healthcare",
		label: "Auxiliaire de Puericulture (soins aux nouveau-nes et jeunes enfants)",
		context:
			"Auxiliaire de puericulture: soins d'hygiene et de confort du nourrisson et du jeune enfant, biberon et aide a l'alimentation, surveillance du poids et de la temperature, change et bain, eveil et activites adaptees, prevention des infections en neonatologie et pediatrie, accompagnement et conseil aux parents, transmission a la sage-femme et au pediatre, en maternite, service de pediatrie, creche et PMI au Maroc.",
	},
	genie_biomedical: {
		field: "healthcare",
		label: "Technicien en Genie Biomedical (maintenance des equipements medicaux)",
		context:
			"Genie biomedical: installation, maintenance preventive et corrective des dispositifs medicaux (respirateurs, moniteurs, pousse-seringues, defibrillateurs, echographes, autoclaves), controle qualite et calibration, securite electrique des appareils (normes CEI 60601), tracabilite et GMAO, gestion du parc d'equipements, relation avec les fournisseurs et le service biomedical, respect des normes d'hygiene en bloc et en reanimation, en hopitaux et cliniques.",
	},
	sciences_infirmieres_sante: {
		field: "healthcare",
		label: "Sciences Infirmieres et Techniques de Sante (soins infirmiers polyvalents)",
		context:
			"Sciences infirmieres et techniques de sante: demarche de soins infirmiers, administration des traitements, surveillance clinique et constantes vitales, education therapeutique du patient, prevention et hygiene hospitaliere, gestion du dossier de soins, coordination avec l'equipe medicale, prise en charge des urgences, ethique et secret professionnel, en hopitaux, cliniques et centres de sante au Maroc.",
	},
	technicien_anesthesie: {
		field: "healthcare",
		label: "Technicien d'Anesthesie et de Reanimation",
		context:
			"Technicien d'anesthesie-reanimation: preparation du materiel d'anesthesie et de la salle d'operation, verification du respirateur et du chariot d'urgence, surveillance peri-operatoire (scope, saturation, capnographie), aide a l'induction et au reveil, gestion des voies aeriennes, asepsie au bloc operatoire, surveillance en salle de reveil (SSPI), gestion des drogues anesthesiques et des stupefiants, reaction aux situations d'urgence vitale, en blocs operatoires et reanimation.",
	},

	// ── Industrial (uncovered) ──────────────────────────────────────────────
	automatique_informatique_industrielle: {
		field: "industrial",
		label: "Technicien en Automatique et Informatique Industrielle",
		context:
			"Automatique et informatique industrielle: programmation d'automates programmables (Siemens TIA Portal, Schneider), supervision SCADA/HMI, reseaux industriels (Profibus, Profinet, Modbus), capteurs et actionneurs, regulation PID, variateurs de vitesse, depannage des chaines automatisees, lecture de grafcet et de schemas, securite machine, en industries de production et agroalimentaires.",
	},
	energies_renouvelables_dd: {
		field: "industrial",
		label: "Technicien en Energies Renouvelables et Developpement Durable",
		context:
			"Energies renouvelables: installation et maintenance de panneaux photovoltaiques et de systemes solaires thermiques, dimensionnement d'installations, onduleurs et regulateurs de charge, raccordement au reseau, eolien de petite puissance, mesures de production et rendement, securite electrique en courant continu, efficacite energetique et developpement durable, sur des projets solaires et chantiers au Maroc (plan solaire Noor).",
	},
	genie_electrique_energies: {
		field: "industrial",
		label: "Technicien en Genie Electrique et Energies Renouvelables",
		context:
			"Genie electrique: installation electrique basse et moyenne tension, armoires et tableaux electriques, moteurs et demarrages, distribution et protection (disjoncteurs, differentiels), lecture de schemas unifilaires, habilitation electrique, mise a la terre, integration de sources renouvelables, maintenance des installations, normes NF C 15-100, en industries, batiment et installations solaires.",
	},
	genie_procedes_environnement: {
		field: "industrial",
		label: "Technicien en Genie des Procedes et Environnement",
		context:
			"Genie des procedes et environnement: conduite de procedes chimiques et de traitement, traitement des eaux et des effluents (station d'epuration), pompes, echangeurs et reacteurs, controle des parametres (pH, debit, temperature), analyses physico-chimiques, gestion des dechets et rejets, respect des normes environnementales, securite des procedes, en industries chimiques, agroalimentaires et stations de traitement.",
	},
	maintenance_industrielle_avancee: {
		field: "industrial",
		label: "Technicien en Maintenance Industrielle Avancee",
		context:
			"Maintenance industrielle avancee: maintenance preventive, corrective et predictive, analyse vibratoire et thermographie, diagnostic de pannes complexes, fiabilisation des equipements (AMDEC, MTBF), GMAO, automatismes et variateurs, alignement laser, gestion des pieces de rechange, methodes TPM et amelioration continue, sur lignes de production automatisees.",
	},
	qualite_amelioration_continue: {
		field: "industrial",
		label: "Technicien en Qualite et Amelioration Continue",
		context:
			"Qualite et amelioration continue: controle qualite en production, plans de controle et auto-controle, metrologie et instruments de mesure, systeme de management ISO 9001, traitement des non-conformites et actions correctives (8D, 5 pourquoi), audits qualite, outils Lean (5S, Kaizen, SMED, VSM), indicateurs (taux de rebut, FTQ), en usines automobiles, agroalimentaires et industrielles.",
	},

	// ── Management (uncovered) ──────────────────────────────────────────────
	commerce_marketing_digital: {
		field: "management",
		label: "Technicien Commercial et Marketing Digital",
		context:
			"Commerce et marketing digital: prospection et relation client, techniques de vente et negociation, gestion d'un portefeuille clients, animation des reseaux sociaux et community management, campagnes publicitaires (Meta Ads, Google Ads), referencement SEO/SEA, emailing, analyse des performances (KPIs, taux de conversion), CRM, e-commerce, dans les entreprises, agences et commerces au Maroc.",
	},
	finance_comptabilite: {
		field: "management",
		label: "Technicien en Finance et Comptabilite",
		context:
			"Finance et comptabilite: saisie et tenue des ecritures comptables, rapprochements bancaires, journal, grand livre et balance, declarations fiscales (TVA, IS, IR), gestion de la paie et CNSS, etablissement des etats de synthese (bilan, CPC), logiciels comptables (Sage), suivi de la tresorerie, controle de gestion, respect du plan comptable marocain (CGNC), en cabinets comptables et services financiers d'entreprises.",
	},
	management_projets_industriels: {
		field: "management",
		label: "Technicien en Management de Projets Industriels",
		context:
			"Management de projets industriels: planification et ordonnancement (Gantt, jalons), suivi des couts et des delais, coordination des equipes et sous-traitants, gestion des risques projet, suivi qualite et reporting, methodes de gestion de projet (PMI, agile), pilotage des indicateurs (avancement, budget), gestion documentaire, dans les entreprises industrielles, BTP et bureaux d'etudes au Maroc.",
	},
	ressources_humaines_droit: {
		field: "management",
		label: "Technicien en Ressources Humaines et Droit Social",
		context:
			"Ressources humaines et droit social: recrutement et integration, gestion administrative du personnel (contrats, conges, absences), paie et declarations CNSS/AMO, application du code du travail marocain, gestion des conflits et discipline, formation et evaluation, suivi des dossiers du personnel, dialogue social, SIRH, dans les services RH des entreprises et cabinets de conseil.",
	},
	supply_chain_logistique: {
		field: "management",
		label: "Technicien en Supply Chain et Logistique",
		context:
			"Supply chain et logistique: gestion des approvisionnements et des stocks, planification des flux, gestion d'entrepot et preparation de commandes, transport et expedition, optimisation des couts logistiques, ERP/WMS, indicateurs de performance (taux de service, rotation des stocks), import-export et dedouanement, coordination fournisseurs, sur les plateformes logistiques et ports (Tanger Med) au Maroc.",
	},

	// ── Technology (uncovered) ──────────────────────────────────────────────
	cybersecurite_confiance: {
		field: "technology",
		label: "Technicien en Cybersecurite et Confiance Numerique",
		context:
			"Cybersecurite: securisation des systemes et reseaux, configuration de pare-feu et VPN, gestion des acces et des identites, surveillance des incidents (SOC, SIEM), analyse des vulnerabilites et tests d'intrusion de base, durcissement des serveurs, sauvegarde et plan de continuite, sensibilisation des utilisateurs au phishing, conformite ISO 27001 et RGPD, dans les entreprises, banques et administrations.",
	},
	data_science_ia: {
		field: "technology",
		label: "Technicien en Data Science et Intelligence Artificielle",
		context:
			"Data science et IA: collecte, nettoyage et preparation des donnees, programmation Python (pandas, numpy), bases SQL, statistiques descriptives, visualisation (Power BI, matplotlib), modeles de machine learning (regression, classification), evaluation des modeles, automatisation des traitements, restitution des resultats, dans les entreprises, banques, telecom et e-commerce au Maroc.",
	},
	genie_informatique_reseaux: {
		field: "technology",
		label: "Technicien en Genie Informatique et Reseaux",
		context:
			"Genie informatique et reseaux: installation et configuration de postes et serveurs, administration reseau (TCP/IP, VLAN, routage, commutation Cisco), cablage et baies de brassage, services (DHCP, DNS, Active Directory), virtualisation, support et depannage informatique, securite reseau de base, supervision, sauvegardes, dans les entreprises, SSII et administrations.",
	},
	telecommunications_reseaux: {
		field: "technology",
		label: "Technicien en Telecommunications et Reseaux",
		context:
			"Telecommunications et reseaux: deploiement et maintenance des reseaux telecoms (fibre optique FTTH, cuivre), installation d'antennes et de sites radio (2G/3G/4G/5G), soudure de fibre optique et mesures (reflectometre OTDR), reseaux de transmission, configuration des equipements, depannage des liaisons, respect des normes de securite en hauteur, chez les operateurs et installateurs telecoms au Maroc.",
	},
};

const TARGET = process.env.PROGRAMS
	? process.env.PROGRAMS.split(",")
			.map((s) => s.trim())
			.filter(Boolean)
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
	// Field-aware domain rule: IT/business programs SHOULD use their real jargon;
	// manual/medical trades must stay out of software/IT jargon.
	let domainRule;
	if (prog.field === "technology") {
		domainRule =
			"- Reste STRICTEMENT dans le metier informatique/reseaux/numerique decrit (outils, protocoles, normes reels). Utilise le vocabulaire technique reel du metier.";
	} else if (prog.field === "management") {
		domainRule =
			"- Reste dans le metier de gestion/commerce/administration decrit (procedures, outils de gestion, reglementation marocaine reels). Pas de jargon de genie logiciel.";
	} else {
		domainRule = "- Pas de jargon informatique/genie logiciel. Reste dans le metier manuel/technique/medical decrit.";
	}
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
${domainRule}
- Reponds UNIQUEMENT avec un tableau JSON valide (commence par [ et finit par ]). Aucun texte autour, pas de balises markdown.`;
}

function stripFences(s) {
	return s
		.trim()
		.replace(/^```[\w]*\s*/i, "")
		.replace(/\s*```\s*$/i, "")
		.trim();
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
				{
					role: "system",
					content: "Tu generes des questions d'entretien professionnelles en francais. Reponds uniquement en JSON.",
				},
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
				r.id,
				r.question,
				r.question_fr,
				r.type,
				r.field,
				r.program,
				r.sample_answer,
				r.sample_answer_fr,
				r.tips,
				r.tips_fr,
				r.difficulty,
				r.sort_order,
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
