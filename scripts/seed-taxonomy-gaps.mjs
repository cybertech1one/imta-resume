// Idempotent seed for reference-data gaps discovered in the taxonomy audit.
// Fills FRENCH, vocational reference rows for fields that had ZERO coverage:
//   - technology: skill_library, career_market_insight, interview_tip  (all 0)
//   - management: career_market_insight  (was 0; skills/tips already exist)
// Does NOT touch: interview_common_question (owned by interview agent),
//   resume_gallery (curated), or any other table.
// Deterministic ids -> safe to re-run (ON CONFLICT (id) DO NOTHING).
//
// Usage: PG_PUBLIC_URL=... node scripts/seed-taxonomy-gaps.mjs
import crypto from "node:crypto";
import pg from "pg";

const { Client } = pg;
const url = process.env.PG_PUBLIC_URL;
if (!url) {
	console.error("PG_PUBLIC_URL not set");
	process.exit(1);
}
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

// Deterministic UUID (v5-style) from a stable seed string -> idempotent uuid PKs.
function detUuid(seed) {
	const h = crypto.createHash("sha1").update(`imta-taxonomy:${seed}`).digest("hex");
	// shape into a valid UUID (version 5, variant 8)
	return (
		`${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`
	);
}

// ---------------------------------------------------------------------------
// TECHNOLOGY skills (uuid pk, field NOT NULL, name/name_fr NOT NULL)
// ---------------------------------------------------------------------------
const techSkills = [
	["Administration des reseaux", "Administration des reseaux", "technical", "Configurer et maintenir des reseaux LAN/WAN, switches et routeurs."],
	["Securite informatique (cybersecurite)", "Securite informatique (cybersecurite)", "technical", "Proteger les systemes contre les menaces : pare-feu, antivirus, durcissement."],
	["Programmation Python", "Programmation Python", "technical", "Developper des scripts et applications en Python pour l'automatisation et la data."],
	["Bases de donnees SQL", "Bases de donnees SQL", "technical", "Concevoir, interroger et optimiser des bases de donnees relationnelles."],
	["Developpement web (HTML/CSS/JS)", "Developpement web (HTML/CSS/JS)", "technical", "Creer des interfaces web modernes et responsives."],
	["Administration systemes Linux", "Administration systemes Linux", "technical", "Installer, configurer et superviser des serveurs Linux."],
	["Cloud computing (AWS/Azure)", "Cloud computing (AWS/Azure)", "technical", "Deployer et gerer des ressources sur le cloud public."],
	["Analyse de donnees (Data Science)", "Analyse de donnees (Data Science)", "technical", "Collecter, nettoyer et analyser des donnees pour aider a la decision."],
	["Telecommunications et fibre optique", "Telecommunications et fibre optique", "technical", "Installer et maintenir des infrastructures telecom et fibre."],
	["Virtualisation et conteneurs (Docker)", "Virtualisation et conteneurs (Docker)", "technical", "Conteneuriser et orchestrer des applications."],
	["Resolution de problemes", "Resolution de problemes", "soft", "Diagnostiquer et resoudre methodiquement les incidents techniques."],
	["Travail en equipe", "Travail en equipe", "soft", "Collaborer efficacement au sein d'une equipe projet IT."],
	["Apprentissage continu", "Apprentissage continu", "soft", "Se former en continu face a l'evolution rapide des technologies."],
	["Cisco CCNA", "Cisco CCNA", "certification", "Certification reseau Cisco (CCNA)."],
	["CompTIA Security+", "CompTIA Security+", "certification", "Certification fondamentale en cybersecurite."],
];

// ---------------------------------------------------------------------------
// TECHNOLOGY market insights (uuid pk, title/title_fr/value NOT NULL)
// ---------------------------------------------------------------------------
const techInsights = [
	{
		title: "Demande en competences numeriques",
		title_fr: "Demande en competences numeriques",
		value: "+30%",
		description: "Le Maroc vise a former des dizaines de milliers de profils numeriques d'ici 2030 (strategie Digital Morocco).",
		icon: "trending-up",
		color: "#22c55e",
	},
	{
		title: "Emplois dans l'offshoring IT",
		title_fr: "Emplois dans l'offshoring IT",
		value: "120 000+",
		description: "Le secteur de l'offshoring et des services IT emploie plus de 120 000 personnes au Maroc.",
		icon: "briefcase",
		color: "#3b82f6",
	},
	{
		title: "Penurie de talents en cybersecurite",
		title_fr: "Penurie de talents en cybersecurite",
		value: "Forte",
		description: "Les profils en cybersecurite sont parmi les plus recherches et les mieux remuneres du marche.",
		icon: "shield-check",
		color: "#a855f7",
	},
	{
		title: "Salaire moyen developpeur junior",
		title_fr: "Salaire moyen developpeur junior",
		value: "6000-9000 DH/mois",
		description: "Fourchette indicative de remuneration pour un developpeur debutant au Maroc.",
		icon: "currency-dollar",
		color: "#22c55e",
	},
	{
		title: "Croissance Data & IA",
		title_fr: "Croissance Data & IA",
		value: "Tres forte",
		description: "Les metiers de la data et de l'intelligence artificielle connaissent une croissance soutenue.",
		icon: "cpu",
		color: "#06b6d4",
	},
];

// ---------------------------------------------------------------------------
// TECHNOLOGY interview tips (TEXT pk, content/content_fr/tags NOT NULL)
// ---------------------------------------------------------------------------
const techTips = [
	{
		title: "Preparez vos projets techniques",
		content: "Be ready to discuss your projects in detail: technologies used, your role, challenges and results.",
		title_fr: "Preparez vos projets techniques",
		content_fr: "Soyez pret a parler de vos projets en detail : technologies utilisees, votre role, les difficultes rencontrees et les resultats obtenus.",
		category: "preparation",
		tags: ["projets", "portfolio", "technique"],
	},
	{
		title: "Revisez les fondamentaux",
		content: "Review fundamentals: networks, OS, databases and a programming language. Recruiters test basics.",
		title_fr: "Revisez les fondamentaux",
		content_fr: "Revisez les fondamentaux : reseaux, systemes d'exploitation, bases de donnees et un langage de programmation. Les recruteurs testent les bases.",
		category: "preparation",
		tags: ["fondamentaux", "reseaux", "programmation"],
	},
	{
		title: "Expliquez votre raisonnement",
		content: "During technical tests, think aloud. Explaining your reasoning matters as much as the final answer.",
		title_fr: "Expliquez votre raisonnement",
		content_fr: "Lors des tests techniques, pensez a voix haute. Expliquer votre raisonnement compte autant que la reponse finale.",
		category: "during",
		tags: ["test-technique", "communication"],
	},
	{
		title: "Montrez votre veille technologique",
		content: "Show that you keep learning: certifications, online courses, personal projects, tech you follow.",
		title_fr: "Montrez votre veille technologique",
		content_fr: "Montrez que vous continuez d'apprendre : certifications, cours en ligne, projets personnels, technologies que vous suivez.",
		category: "field_specific",
		field: "technology",
		tags: ["veille", "formation", "certification"],
	},
	{
		title: "Preparez des questions sur la stack",
		content: "Ask about their tech stack, methodologies (Agile/Scrum) and tools. It shows genuine interest.",
		title_fr: "Preparez des questions sur la stack",
		content_fr: "Posez des questions sur leur stack technique, leurs methodologies (Agile/Scrum) et leurs outils. Cela montre un interet sincere.",
		category: "after",
		tags: ["questions", "stack", "agile"],
	},
];

// ---------------------------------------------------------------------------
// MANAGEMENT market insights (was 0)
// ---------------------------------------------------------------------------
const mgmtInsights = [
	{
		title: "Croissance du secteur des services",
		title_fr: "Croissance du secteur des services",
		value: "~50% du PIB",
		description: "Le secteur tertiaire (services) represente environ la moitie du PIB marocain et reste un gros employeur.",
		icon: "trending-up",
		color: "#3b82f6",
	},
	{
		title: "Demande en gestion de projet",
		title_fr: "Demande en gestion de projet",
		value: "En hausse",
		description: "Les profils en management de projets industriels sont recherches par les grands groupes et l'industrie.",
		icon: "briefcase",
		color: "#22c55e",
	},
	{
		title: "Supply chain et logistique",
		title_fr: "Supply chain et logistique",
		value: "Strategique",
		description: "Avec Tanger Med, la logistique est un pilier de l'economie : forte demande de profils supply chain.",
		icon: "truck",
		color: "#06b6d4",
	},
	{
		title: "Finance et comptabilite",
		title_fr: "Finance et comptabilite",
		value: "Stable",
		description: "Les fonctions finance/comptabilite restent un besoin structurel de toutes les entreprises.",
		icon: "currency-dollar",
		color: "#a855f7",
	},
	{
		title: "Commerce et marketing digital",
		title_fr: "Commerce et marketing digital",
		value: "Forte croissance",
		description: "La digitalisation booste la demande en profils commerce et marketing digital.",
		icon: "megaphone",
		color: "#f59e0b",
	},
];

async function run() {
	await client.connect();
	const summary = {};

	// pre-counts
	const pre = await client.query(`
		SELECT
			(SELECT COUNT(*) FROM skill_library WHERE field='technology')::int AS tech_skills,
			(SELECT COUNT(*) FROM career_market_insight WHERE field='technology')::int AS tech_insights,
			(SELECT COUNT(*) FROM interview_tip WHERE field='technology')::int AS tech_tips,
			(SELECT COUNT(*) FROM career_market_insight WHERE field='management')::int AS mgmt_insights
	`);
	console.log("BEFORE:", pre.rows[0]);

	// --- tech skills ---
	let i = 0;
	for (const [name, name_fr, category, desc] of techSkills) {
		const id = detUuid(`skill:technology:${name}`);
		await client.query(
			`INSERT INTO skill_library (id, name, name_fr, field, category, description, description_fr, is_recommended, is_active, sort_order)
			 VALUES ($1,$2,$3,'technology',$4,$5,$5,true,true,$6)
			 ON CONFLICT (id) DO NOTHING`,
			[id, name, name_fr, category, desc, i],
		);
		i++;
	}

	// --- tech insights ---
	i = 0;
	for (const ins of techInsights) {
		const id = detUuid(`insight:technology:${ins.title}`);
		await client.query(
			`INSERT INTO career_market_insight (id, title, title_fr, value, description, description_fr, icon, color, field, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$5,$6,$7,'technology',true,$8)
			 ON CONFLICT (id) DO NOTHING`,
			[id, ins.title, ins.title_fr, ins.value, ins.description, ins.icon, ins.color, i],
		);
		i++;
	}

	// --- tech tips (text pk; deterministic slug id) ---
	i = 0;
	for (const tip of techTips) {
		const id = `tip-technology-${i}`;
		await client.query(
			`INSERT INTO interview_tip (id, title, title_fr, content, content_fr, category, field, tags, is_active, sort_order, difficulty)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,true,$9,'beginner')
			 ON CONFLICT (id) DO NOTHING`,
			[id, tip.title, tip.title_fr, tip.content, tip.content_fr, tip.category, tip.field ?? "technology", JSON.stringify(tip.tags), i],
		);
		i++;
	}

	// --- management insights ---
	i = 0;
	for (const ins of mgmtInsights) {
		const id = detUuid(`insight:management:${ins.title}`);
		await client.query(
			`INSERT INTO career_market_insight (id, title, title_fr, value, description, description_fr, icon, color, field, is_active, sort_order)
			 VALUES ($1,$2,$3,$4,$5,$5,$6,$7,'management',true,$8)
			 ON CONFLICT (id) DO NOTHING`,
			[id, ins.title, ins.title_fr, ins.value, ins.description, ins.icon, ins.color, i],
		);
		i++;
	}

	const post = await client.query(`
		SELECT
			(SELECT COUNT(*) FROM skill_library WHERE field='technology')::int AS tech_skills,
			(SELECT COUNT(*) FROM career_market_insight WHERE field='technology')::int AS tech_insights,
			(SELECT COUNT(*) FROM interview_tip WHERE field='technology')::int AS tech_tips,
			(SELECT COUNT(*) FROM career_market_insight WHERE field='management')::int AS mgmt_insights
	`);
	console.log("AFTER: ", post.rows[0]);
	summary.before = pre.rows[0];
	summary.after = post.rows[0];

	await client.end();
	console.log("SEED COMPLETE");
}
run().catch((e) => {
	console.error(e);
	process.exit(1);
});
