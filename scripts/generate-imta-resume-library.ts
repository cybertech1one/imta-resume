/**
 * Generate a vocational resume example library for IMTA students.
 *
 * For each IMTA program, asks the configured AI (DeepSeek, from ai_provider_config)
 * to write realistic French CV *content*, merges it into a structurally-complete
 * `defaultResumeData` clone, validates against the real `resumeDataSchema`, and
 * writes the validated records to a JSON artifact for a separate insert step.
 *
 * Run:  PG=... tsx scripts/generate-imta-resume-library.ts --per 27
 *       PG=... tsx scripts/generate-imta-resume-library.ts --per 5 --programs infirmier_polyvalent,soudure   (sample)
 *
 * Env:  PG (Postgres URL, used only to read ai_provider_config), OUT (artifact path)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { defaultResumeData, resumeDataSchema } from "../src/schema/resume/data";

// ── args ──────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const getArg = (name: string, def?: string) => {
	const i = argv.indexOf(`--${name}`);
	return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const PER = Number(getArg("per", "27"));
const ONLY = getArg("programs", "")
	?.split(",")
	.map((s) => s.trim())
	.filter(Boolean);
const CONCURRENCY = Number(getArg("concurrency", "4"));
const OUT = process.env.OUT || `resume-maker-sdlc/generated/library-${Date.now()}.json`;

// ── programs ────────────────────────────────────────────────────────────────
type Prog = {
	id: string;
	field: "healthcare" | "industrial" | "hse";
	nameFr: string;
	school: string;
	employers: string[];
	certs: string[];
	skills: string[];
};
const CITIES = [
	"Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Kénitra", "Meknès",
	"Oujda", "Mohammedia", "El Jadida", "Safi", "Tétouan", "Nador", "Beni Mellal", "Settat",
];
const PROGRAMS: Prog[] = [
	{ id: "infirmier_polyvalent", field: "healthcare", nameFr: "Infirmier Polyvalent", school: "Institut IMTA — Filière Infirmier Polyvalent",
		employers: ["CHU Ibn Rochd", "Clinique Cheikh Khalifa", "Hôpital Provincial", "Clinique Atlas", "Centre de Santé Urbain"],
		certs: ["BLS - Réanimation Cardio-Pulmonaire", "AFGSU Niveau 2", "Hygiène Hospitalière"],
		skills: ["Soins infirmiers", "Pose de perfusion", "Surveillance des constantes", "Gestion du dossier patient", "Communication thérapeutique"] },
	{ id: "sage_femme", field: "healthcare", nameFr: "Sage-Femme", school: "Institut IMTA — Filière Sage-Femme",
		employers: ["Maternité Régionale", "CHU", "Clinique privée", "Maison d'accouchement", "Centre de Santé Maternelle"],
		certs: ["Réanimation néonatale", "Échographie obstétricale de base", "AFGSU Niveau 2"],
		skills: ["Suivi de grossesse", "Accouchement eutocique", "Soins du nouveau-né", "Consultation prénatale", "Allaitement"] },
	{ id: "aide_soignant", field: "healthcare", nameFr: "Aide-Soignant", school: "Institut IMTA — Filière Aide-Soignant",
		employers: ["EHPAD", "Hôpital", "Clinique", "Maison de retraite", "Centre de soins"],
		certs: ["Hygiène et asepsie", "Manutention des personnes", "Premiers secours PSC1"],
		skills: ["Toilette et confort", "Aide à la mobilité", "Prise des constantes", "Accompagnement des patients", "Entretien de l'environnement"] },
	{ id: "infirmier_auxiliaire", field: "healthcare", nameFr: "Infirmier Auxiliaire", school: "Institut IMTA — Filière Infirmier Auxiliaire",
		employers: ["Clinique", "Centre de santé", "Hôpital", "Cabinet médical", "Dispensaire"],
		certs: ["Soins de base", "AFGSU Niveau 1", "Vaccination"],
		skills: ["Soins de base", "Pansements", "Aide aux soins", "Prélèvements", "Suivi des patients"] },
	{ id: "soudure", field: "industrial", nameFr: "Soudeur", school: "Institut IMTA — Filière Soudure",
		employers: ["OCP Group", "Chantier Naval", "Managem", "Entreprise BTP", "Atelier de chaudronnerie"],
		certs: ["Soudage SMAW (111)", "Soudage GMAW/MIG-MAG (135)", "Soudage TIG (141)", "Lecture de plans"],
		skills: ["Soudage à l'arc", "Soudage MIG/MAG", "Soudage TIG", "Lecture de plans isométriques", "Contrôle visuel des soudures"] },
	{ id: "cariste", field: "industrial", nameFr: "Cariste / Conducteur de Chariot Élévateur", school: "Institut IMTA — Filière Cariste",
		employers: ["Tanger Med", "Entrepôt logistique", "OCP Group", "Marjane Logistique", "Plateforme de distribution"],
		certs: ["CACES R489 Catégorie 3", "CACES R489 Catégorie 5", "Sécurité en entrepôt"],
		skills: ["Conduite de chariot élévateur", "Gestion de stock", "Chargement/déchargement", "Inventaire", "Respect des consignes de sécurité"] },
	{ id: "conducteur_engins", field: "industrial", nameFr: "Conducteur d'Engins de Chantier", school: "Institut IMTA — Filière Conduite d'Engins",
		employers: ["Entreprise BTP", "OCP Group", "Carrière", "Chantier autoroutier", "Société de travaux publics"],
		certs: ["CACES R482 Catégorie B1 (pelle)", "CACES R482 Catégorie C1 (chargeuse)", "Sécurité chantier"],
		skills: ["Conduite de pelle hydraulique", "Conduite de chargeuse", "Terrassement", "Entretien de premier niveau", "Lecture de plans de terrassement"] },
	{ id: "mecanique_engins", field: "industrial", nameFr: "Mécanicien d'Engins", school: "Institut IMTA — Filière Mécanique d'Engins",
		employers: ["OCP Group", "Concessionnaire d'engins", "Atelier de maintenance", "Carrière", "Société BTP"],
		certs: ["Hydraulique industrielle", "Diagnostic moteur diesel", "Maintenance préventive"],
		skills: ["Diagnostic mécanique", "Maintenance hydraulique", "Réparation moteur diesel", "Maintenance préventive", "Lecture de schémas"] },
	{ id: "tourneur_industriel", field: "industrial", nameFr: "Tourneur Industriel", school: "Institut IMTA — Filière Tournage Industriel",
		employers: ["Atelier d'usinage", "OCP Group", "Industrie automobile", "Sous-traitance mécanique", "Aéronautique"],
		certs: ["Tournage conventionnel", "Tournage CNC", "Métrologie dimensionnelle"],
		skills: ["Tournage conventionnel", "Programmation CNC", "Lecture de plans", "Métrologie", "Contrôle qualité"] },
	{ id: "electromecanique", field: "industrial", nameFr: "Technicien Électromécanique", school: "Institut IMTA — Filière Électromécanique",
		employers: ["OCP Group", "Industrie agroalimentaire", "Cimenterie", "Station de traitement", "Usine de production"],
		certs: ["Habilitation électrique B1V/B2V", "Automatisme industriel", "Variation de vitesse"],
		skills: ["Maintenance électrique", "Maintenance mécanique", "Automatisme", "Dépannage", "Lecture de schémas électriques"] },
	{ id: "hse_specialist", field: "hse", nameFr: "Technicien HSE (Hygiène Sécurité Environnement)", school: "Institut IMTA — Filière HSE",
		employers: ["OCP Group", "Chantier BTP", "Industrie chimique", "Cimenterie", "Société minière"],
		certs: ["ISO 45001", "ISO 14001", "Sauveteur Secouriste du Travail (SST)", "Risques chimiques N2"],
		skills: ["Analyse des risques", "Audit sécurité", "Plan de prévention", "Gestion des EPI", "Sensibilisation HSE"] },
];

const EXP_TIERS = [
	{ years: 0, label: "Jeune diplômé(e) IMTA, sans expérience (met l'accent sur la formation et les stages)" },
	{ years: 2, label: "1 à 3 ans d'expérience" },
	{ years: 6, label: "5 ans et plus d'expérience, profil confirmé" },
];
const TEMPLATES = ["casablanca", "rabat", "marrakech", "tangier", "fes", "agadir", "azurill", "onyx", "bronzor", "pikachu", "chikorita", "kakuna"];

// ── AI client (OpenAI-compatible, DeepSeek) ─────────────────────────────────
type AiCfg = { apiKey: string; model: string; baseUrl: string };
async function loadAiConfig(): Promise<AiCfg> {
	const c = new Client({ connectionString: process.env.PG });
	await c.connect();
	const r = await c.query(
		`SELECT api_key, model, base_url FROM ai_provider_config WHERE is_enabled=true ORDER BY is_default DESC, priority ASC LIMIT 1`,
	);
	await c.end();
	if (!r.rows[0]) throw new Error("no enabled ai_provider_config row");
	const row = r.rows[0];
	return { apiKey: row.api_key, model: row.model || "deepseek-chat", baseUrl: (row.base_url || "https://api.deepseek.com").replace(/\/$/, "") };
}

async function aiJson(cfg: AiCfg, system: string, user: string): Promise<any> {
	const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` },
		body: JSON.stringify({
			model: cfg.model,
			messages: [{ role: "system", content: system }, { role: "user", content: user }],
			response_format: { type: "json_object" },
			temperature: 0.9,
			max_tokens: 3000,
		}),
	});
	if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
	const j = await res.json();
	let content = j.choices?.[0]?.message?.content ?? "";
	content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
	return JSON.parse(content);
}

// ── helpers ─────────────────────────────────────────────────────────────────
const uid = () => crypto.randomUUID();
const url = () => ({ url: "", label: "" });
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const pick = <T>(arr: T[], i: number): T => arr[i % arr.length];
const arr = (x: any): any[] => (Array.isArray(x) ? x : []);
const str = (x: any): string => (typeof x === "string" ? x : "");

const FIRST_NAMES = [
	"Youssef", "Mohammed", "Amine", "Hamza", "Khalid", "Reda", "Bilal", "Othmane", "Mehdi", "Ayoub", "Anas", "Soufiane", "Yassine", "Zakaria", "Ismail",
	"Fatima Zahra", "Salma", "Imane", "Hajar", "Khadija", "Meryem", "Sara", "Nisrine", "Hanae", "Loubna", "Ikram", "Asmae", "Chaimae", "Oumaima", "Ghita",
];
const LAST_NAMES = [
	"Benali", "El Amrani", "Bennani", "Alaoui", "El Fassi", "Tazi", "Berrada", "Chraibi", "El Idrissi", "Lahlou", "Sebti", "Bouazza", "Ouazzani", "Naciri",
	"El Ghazali", "Bennis", "Kabbaj", "Sqalli", "Belkadi", "Hassani", "El Moutawakil", "Zouhri", "Sabri", "Mansouri", "Cherkaoui", "Lamrini", "Daoudi",
];
function buildPrompt(p: Prog, tier: (typeof EXP_TIERS)[number], city: string, idx: number) {
	const seed = `${idx}-${Math.floor(Math.random() * 1e6)}`;
	const suggestedName = `${pick(FIRST_NAMES, idx * 7 + p.id.length)} ${pick(LAST_NAMES, idx * 13 + city.length)}`;
	const system =
		"Tu es un expert en rédaction de CV pour le marché de l'emploi marocain (formation professionnelle / vocational). " +
		"Tu écris UNIQUEMENT en français, avec des contenus réalistes et crédibles. Réponds STRICTEMENT en JSON valide, sans texte autour.";
	const user = `Génère le contenu d'un CV réaliste pour un(e) ${p.nameFr} diplômé(e) de l'IMTA (institut de formation professionnelle au Maroc).
Profil: ${tier.label}. Ville: ${city}. Domaine: ${p.field}. (Variante #${seed} — rends ce CV unique et différent des autres.)
Utilise un nom marocain crédible et varié, par exemple "${suggestedName}" (ou un autre nom marocain réaliste, homme ou femme).
Employeurs typiques du secteur: ${p.employers.join(", ")}.
Certifications pertinentes: ${p.certs.join(", ")}.
Compétences métier: ${p.skills.join(", ")}.

Réponds en JSON avec EXACTEMENT cette structure (remplis des valeurs réalistes; les descriptions en HTML simple avec <ul><li>):
{
  "fullName": "Prénom Nom marocain",
  "headline": "${p.nameFr} | ...",
  "email": "prenom.nom@gmail.com",
  "phone": "+212 6XX XXXXXX",
  "dateOfBirth": "JJ/MM/AAAA",
  "nationality": "Marocaine",
  "maritalStatus": "Célibataire ou Marié(e)",
  "cin": "Format CIN marocain ex: AB123456",
  "militaryServiceStatus": "not-applicable",
  "summary": "<p>Résumé professionnel de 2-3 phrases.</p>",
  "experience": [ ${tier.years === 0 ? "(VIDE: [] car jeune diplômé)" : '{ "company":"", "position":"", "location":"' + city + '", "period":"ex: 2021 - 2024", "description":"<ul><li>tâche</li></ul>" }'} ],
  "education": [ { "school":"${p.school}", "degree":"Diplôme de ${p.nameFr}", "area":"", "grade":"ex: Mention Bien", "location":"${city}", "period":"ex: 2019 - 2022", "description":"<p>...</p>" } ],
  "internships": [ { "company":"", "position":"Stagiaire ${p.nameFr}", "supervisor":"", "location":"${city}", "period":"ex: 2 mois", "type":"end-of-studies", "tasksPerformed":"<ul><li>...</li></ul>", "skillsAcquired":["",""], "evaluation":"<p>Très bonne appréciation</p>" } ],
  "certifications": [ { "title":"", "issuer":"", "date":"AAAA", "description":"" } ],
  "skills": [ { "name":"", "keywords":["",""], "level": 4 } ],
  "languages": [ { "language":"Arabe", "fluency":"Langue maternelle", "level":5 }, { "language":"Français", "fluency":"Courant", "level":4 } ],
  "interests": [ { "name":"", "keywords":[] } ]
}
Donne 2-4 expériences (sauf jeune diplômé: 0), 1-2 formations, 1-2 stages, 2-3 certifications parmi celles listées, 6-9 compétences, 2-3 langues, 2-3 centres d'intérêt.`;
	return { system, user };
}

// Realistic-looking Moroccan CIN: 1-2 region letters + 5-6 digits (varies per CV).
function randomCin(): string {
	const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
	const nLetters = 1 + Math.floor(Math.random() * 2);
	let s = "";
	for (let i = 0; i < nLetters; i++) s += letters[Math.floor(Math.random() * letters.length)];
	const nDigits = 5 + Math.floor(Math.random() * 2);
	for (let i = 0; i < nDigits; i++) s += Math.floor(Math.random() * 10);
	return s;
}

function toResumeData(p: Prog, content: any, templateName: string, city: string) {
	const d: any = clone(defaultResumeData);
	// basics
	d.basics.name = str(content.fullName) || `${p.nameFr} IMTA`;
	d.basics.headline = str(content.headline) || p.nameFr;
	d.basics.email = str(content.email);
	d.basics.phone = str(content.phone);
	d.basics.location = str(content.location) || `${city}, Maroc`;
	d.basics.dateOfBirth = str(content.dateOfBirth);
	d.basics.nationality = str(content.nationality) || "Marocaine";
	d.basics.maritalStatus = str(content.maritalStatus);
	// Always generate a unique-looking CIN (the AI tends to echo the placeholder format).
	d.basics.cin = randomCin();
	d.basics.militaryServiceStatus = ["not-applicable", "completed", "exempted", "pending", "in-service"].includes(content.militaryServiceStatus)
		? content.militaryServiceStatus : "not-applicable";
	// summary
	d.summary.content = str(content.summary);
	d.summary.title = "Profil";
	// sections
	const S = d.sections;
	S.experience.title = "Expérience Professionnelle";
	S.experience.items = arr(content.experience).map((e: any) => ({
		id: uid(), hidden: false, company: str(e.company) || "Entreprise", position: str(e.position),
		location: str(e.location), period: str(e.period), website: url(), description: str(e.description),
	}));
	S.education.title = "Formation";
	S.education.items = arr(content.education).map((e: any) => ({
		id: uid(), hidden: false, school: str(e.school) || p.school, degree: str(e.degree), area: str(e.area),
		grade: str(e.grade), location: str(e.location), period: str(e.period), website: url(), description: str(e.description),
	}));
	S.internships.title = "Stages";
	S.internships.items = arr(content.internships).map((e: any) => ({
		id: uid(), hidden: false, company: str(e.company) || "Entreprise", position: str(e.position), supervisor: str(e.supervisor),
		location: str(e.location), period: str(e.period),
		type: ["observation", "application", "end-of-studies", "professional", "other"].includes(e.type) ? e.type : "end-of-studies",
		website: url(), tasksPerformed: str(e.tasksPerformed), skillsAcquired: arr(e.skillsAcquired).map(str).filter(Boolean), evaluation: str(e.evaluation),
	}));
	S.certifications.title = "Certifications";
	S.certifications.items = arr(content.certifications).map((e: any) => ({
		id: uid(), hidden: false, title: str(e.title) || "Certification", issuer: str(e.issuer), date: str(e.date), website: url(), description: str(e.description),
	}));
	S.skills.title = "Compétences";
	S.skills.items = arr(content.skills).map((e: any) => ({
		id: uid(), hidden: false, icon: "", name: str(e.name) || "Compétence", proficiency: "",
		level: Math.max(0, Math.min(5, Number(e.level) || 4)), keywords: arr(e.keywords).map(str).filter(Boolean),
	}));
	S.languages.title = "Langues";
	S.languages.items = arr(content.languages).map((e: any) => ({
		id: uid(), hidden: false, language: str(e.language) || "Arabe", fluency: str(e.fluency), level: Math.max(0, Math.min(5, Number(e.level) || 4)),
	}));
	S.interests.title = "Centres d'intérêt";
	S.interests.items = arr(content.interests).map((e: any) => ({
		id: uid(), hidden: false, icon: "", name: str(e.name) || "Intérêt", keywords: arr(e.keywords).map(str).filter(Boolean),
	}));
	// template
	d.metadata.template = templateName;
	d.metadata.page.locale = "fr-FR";
	return d;
}

function atsScore(d: any): number {
	let s = 60;
	if (str(d.summary.content).length > 60) s += 6;
	s += Math.min(12, d.sections.skills.items.length * 2);
	s += Math.min(8, d.sections.experience.items.length * 3);
	s += Math.min(6, d.sections.certifications.items.length * 3);
	s += Math.min(4, d.sections.internships.items.length * 2);
	if (d.sections.languages.items.length >= 2) s += 4;
	return Math.max(78, Math.min(96, s));
}

// ── run ─────────────────────────────────────────────────────────────────────
async function generateOne(cfg: AiCfg, p: Prog, idx: number) {
	const tier = pick(EXP_TIERS, idx);
	const city = pick(CITIES, idx + p.id.length);
	const template = pick(TEMPLATES, idx);
	const { system, user } = buildPrompt(p, tier, city, idx);
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const content = await aiJson(cfg, system, attempt === 0 ? user : `${user}\n\nIMPORTANT: réponds avec un JSON STRICTEMENT valide.`);
			const data = toResumeData(p, content, template, city);
			const parsed = resumeDataSchema.safeParse(data);
			if (!parsed.success) {
				if (attempt === 1) { console.error(`  ✗ ${p.id}#${idx} invalid: ${parsed.error.issues.slice(0, 2).map((i) => i.path.join(".") + ":" + i.message).join("; ")}`); return null; }
				continue;
			}
			const valid = parsed.data;
			return {
				programId: p.id, field: p.field, name: valid.basics.name, nameFr: valid.basics.name,
				descriptionFr: str((content as any).headline) || p.nameFr, experienceYears: tier.years, language: "fr",
				templateName: template, tags: [p.nameFr, p.field, valid.basics.location].filter(Boolean),
				atsScore: atsScore(valid), isFeatured: idx < 3, resumeData: valid,
			};
		} catch (e: any) {
			if (attempt === 1) { console.error(`  ✗ ${p.id}#${idx} error: ${e.message}`); return null; }
		}
	}
	return null;
}

async function main() {
	if (!process.env.PG) throw new Error("PG env required (Postgres URL for ai_provider_config)");
	const cfg = await loadAiConfig();
	console.log(`AI: model=${cfg.model} base=${cfg.baseUrl}`);
	const progs = PROGRAMS.filter((p) => !ONLY?.length || ONLY.includes(p.id));
	console.log(`Generating ${PER} each for ${progs.length} programs (concurrency ${CONCURRENCY})...`);

	const jobs: { p: Prog; idx: number }[] = [];
	for (const p of progs) for (let i = 0; i < PER; i++) jobs.push({ p, idx: i });

	const results: any[] = [];
	let done = 0;
	async function worker() {
		while (jobs.length) {
			const job = jobs.shift();
			if (!job) break;
			const r = await generateOne(cfg, job.p, job.idx);
			done++;
			if (r) { results.push(r); if (done % 10 === 0 || results.length % 10 === 0) console.log(`  ${results.length} ok / ${done} done`); }
		}
	}
	await Promise.all(Array.from({ length: CONCURRENCY }, worker));

	const outPath = path.resolve(OUT);
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
	const byProg: Record<string, number> = {};
	for (const r of results) byProg[r.programId] = (byProg[r.programId] || 0) + 1;
	console.log(`\n✅ ${results.length}/${jobs.length + done - jobs.length} valid resumes -> ${OUT}`);
	console.log("by program:", JSON.stringify(byProg));
}
main().catch((e) => { console.error(e); process.exit(1); });
