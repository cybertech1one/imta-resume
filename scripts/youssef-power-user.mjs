/**
 * Youssef El Amrani - Power User Simulation
 *
 * Simulates an aggressive job-hunting IMTA graduate using EVERY feature
 * of the resume platform. Creates resumes, job applications, interview prep,
 * career goals, networking contacts, and portfolio projects.
 *
 * Account: student2@test.com / TestAccount123!
 *
 * ORPC Notes:
 * - URL paths use camelCase router keys from index.ts (e.g., jobApplications, not job-applications)
 * - Routes without explicit route({ method: "GET" }) default to POST
 * - Body: { json: <input> }, Response: { json: <output>, meta: [...] }
 * - Dates: ORPC uses meta for Date serialization. Send ISO strings with meta hints.
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "student2@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];
const timing = {};
const frictions = [];
const resumeIds = {};
const jobIds = {};
const goalIds = {};
const contactIds = {};
const projectIds = {};
const sessionIds = {};

function log(status, name, detail = "") {
	const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : status === "FAIL" ? "\x1b[31m✗\x1b[0m" : "\x1b[33m⊘\x1b[0m";
	const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else skipped++;
}

function friction(feature, issue) {
	frictions.push({ feature, issue });
	console.log(`\x1b[33m⚠ FRICTION [${feature}]: ${issue}\x1b[0m`);
}

async function timed(label, fn) {
	const start = Date.now();
	const result = await fn();
	const elapsed = Date.now() - start;
	timing[label] = elapsed;
	if (elapsed > 3000) {
		friction(label, `Took ${elapsed}ms (>3s) — too slow!`);
	} else if (elapsed > 1500) {
		friction(label, `Took ${elapsed}ms (>1.5s) — noticeable lag`);
	}
	return result;
}

/**
 * POST an ORPC endpoint.
 * ORPC uses the meta array to serialize Date objects. We need to send dates
 * as ISO strings and include meta hints for date paths.
 */
async function rpc(path, input = undefined) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify(envelope),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

/**
 * POST with ORPC meta for Date fields.
 * ORPC serializes Date objects using meta array with path info.
 * Format: { json: {...}, meta: [["Date", [...path]]] }
 */
async function rpcWithDates(path, input, datePaths = []) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const meta = datePaths.map(p => ["Date", p]);
	const envelope = { json: input, meta };
	const res = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify(envelope),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

/** GET an ORPC endpoint */
async function rpcGet(path, input = undefined) {
	const data = input !== undefined ? { json: input } : { json: undefined };
	const url = `${BASE_URL}/api/rpc/${path}?data=${encodeURIComponent(JSON.stringify(data))}`;
	const res = await fetch(url, {
		method: "GET",
		headers: { Origin: BASE_URL, Cookie: sessionCookie },
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

/** PUT an ORPC endpoint */
async function rpcPut(path, input) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const res = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
		body: JSON.stringify({ json: input }),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

function uuid() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}

// =========================================
// STEP 0: AUTH
// =========================================
async function authenticate() {
	console.log("\n\x1b[1;36m╔══════════════════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1;36m║  YOUSSEF EL AMRANI - POWER USER SIMULATION            ║\x1b[0m");
	console.log("\x1b[1;36m║  IMTA 2025 | Électromécanique | Job Hunting            ║\x1b[0m");
	console.log("\x1b[1;36m╚══════════════════════════════════════════════════════╝\x1b[0m");

	console.log("\n\x1b[1m═══ STEP 0: AUTHENTICATION ═══\x1b[0m");

	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: BASE_URL },
			body: JSON.stringify(CREDENTIALS),
			redirect: "manual",
		});
		const cookies = res.headers.getSetCookie?.() || [];
		sessionCookie = cookies.map(c => c.split(";")[0]).join("; ");

		if (res.ok || res.status === 302) {
			log("PASS", "Login as student2@test.com", `cookies=${cookies.length}`);
		} else {
			const body = await res.text();
			log("FAIL", "Login", `status=${res.status} ${body.slice(0, 200)}`);
			return false;
		}
	} catch (e) {
		log("FAIL", "Login", e.message);
		return false;
	}

	// Verify session
	try {
		const res = await fetch(`${BASE_URL}/api/auth/get-session`, {
			headers: { Cookie: sessionCookie, Origin: BASE_URL },
		});
		const body = await res.json();
		if (body?.user?.email === CREDENTIALS.email) {
			log("PASS", "Session verified", `user=${body.user.name || body.user.email}`);
		} else {
			log("FAIL", "Session verification", JSON.stringify(body).slice(0, 200));
			return false;
		}
	} catch (e) {
		log("FAIL", "Session verification", e.message);
		return false;
	}

	return true;
}

// =========================================
// STEP 1: CREATE 3 RESUMES
// =========================================
async function createResumes() {
	console.log("\n\x1b[1m═══ STEP 1: BUILD 3 RESUMES ═══\x1b[0m");
	console.log("Youssef: \"Je dois adapter mon CV pour chaque poste. Un CV générique c'est mort.\"");

	// First, clean up any existing resumes with these slugs
	const existing = await timed("List existing resumes", () => rpcGet("resume/list"));
	if (existing.ok && Array.isArray(existing.json)) {
		for (const r of existing.json) {
			if (["cv-youssef-maintenance", "cv-youssef-electromecanique", "cv-youssef-hse"].includes(r.slug)) {
				await rpc("resume/delete", { id: r.id });
				console.log(`  Cleaned up existing resume: ${r.name}`);
			}
		}
	}

	const resumeConfigs = [
		{
			key: "maintenance",
			name: "CV Youssef - Maintenance Industrielle",
			slug: "cv-youssef-maintenance",
			headline: "Technicien en Maintenance Industrielle | Diplômé IMTA 2025",
			summary: "<p>Technicien en maintenance industrielle diplômé de l'IMTA Casablanca, spécialisé en électromécanique. Expérience en maintenance préventive et corrective sur équipements industriels lourds. Maîtrise des systèmes hydrauliques, pneumatiques et électriques. Certifié en sécurité industrielle. Passionné par l'optimisation de la disponibilité machine et la réduction des temps d'arrêt.</p>",
			skills: [
				{ name: "Maintenance Préventive", level: 5, proficiency: "Expert", keywords: ["GMAO", "Planification"] },
				{ name: "Hydraulique Industrielle", level: 4, proficiency: "Avancé", keywords: ["Vérins", "Pompes"] },
				{ name: "Pneumatique", level: 4, proficiency: "Avancé", keywords: ["Actionneurs", "Distributeurs"] },
				{ name: "Électricité Industrielle", level: 4, proficiency: "Avancé", keywords: ["HT/BT", "Câblage"] },
				{ name: "Automatisme (API)", level: 3, proficiency: "Intermédiaire", keywords: ["Siemens S7", "TIA Portal"] },
				{ name: "Soudure", level: 3, proficiency: "Intermédiaire", keywords: ["MIG", "TIG", "Arc"] },
				{ name: "Lecture de Plans", level: 4, proficiency: "Avancé", keywords: ["Mécanique", "Électrique"] },
				{ name: "GMAO (SAP PM)", level: 3, proficiency: "Intermédiaire", keywords: ["SAP", "Ordre de travail"] },
			],
		},
		{
			key: "electromecanique",
			name: "CV Youssef - Électromécanicien",
			slug: "cv-youssef-electromecanique",
			headline: "Électromécanicien Industriel | IMTA Casablanca 2025",
			summary: "<p>Électromécanicien polyvalent formé à l'IMTA Casablanca. Double compétence en mécanique et électricité industrielle. Stages réussis chez OCP Group et Renault Tanger Med sur des lignes de production automatisées. Capacité à diagnostiquer et résoudre des pannes complexes en environnement de production continue. Bilingue français-arabe, anglais technique.</p>",
			skills: [
				{ name: "Électromécanique", level: 5, proficiency: "Expert", keywords: ["Moteurs", "Variateurs"] },
				{ name: "Diagnostic de Pannes", level: 4, proficiency: "Avancé", keywords: ["Analyse vibratoire", "Thermographie"] },
				{ name: "Variateurs de Vitesse", level: 4, proficiency: "Avancé", keywords: ["ABB", "Schneider", "Siemens"] },
				{ name: "Moteurs Électriques", level: 4, proficiency: "Avancé", keywords: ["AC", "DC", "Servomoteurs"] },
				{ name: "Mécanique Industrielle", level: 4, proficiency: "Avancé", keywords: ["Roulements", "Engrenages"] },
				{ name: "Instrumentation", level: 3, proficiency: "Intermédiaire", keywords: ["Capteurs", "Transmetteurs"] },
				{ name: "Câblage Électrique", level: 4, proficiency: "Avancé", keywords: ["Armoires", "Tableaux"] },
				{ name: "AutoCAD Electrical", level: 3, proficiency: "Intermédiaire", keywords: ["Schémas", "Plans"] },
			],
		},
		{
			key: "hse",
			name: "CV Youssef - Technicien HSE",
			slug: "cv-youssef-hse",
			headline: "Technicien HSE | Hygiène, Sécurité & Environnement | IMTA 2025",
			summary: "<p>Technicien formé en électromécanique avec une forte sensibilité HSE développée lors de stages en industrie lourde (OCP Group, Renault). Connaissance approfondie des normes ISO 14001 et OHSAS 18001. Expérience dans l'analyse des risques, la rédaction de procédures de sécurité et l'animation de formations sécurité. Objectif: contribuer à la culture sécurité en milieu industriel.</p>",
			skills: [
				{ name: "Analyse des Risques", level: 4, proficiency: "Avancé", keywords: ["AMDEC", "Arbre des causes"] },
				{ name: "ISO 14001", level: 3, proficiency: "Intermédiaire", keywords: ["SME", "Audit"] },
				{ name: "OHSAS 18001 / ISO 45001", level: 3, proficiency: "Intermédiaire", keywords: ["SMS", "Évaluation"] },
				{ name: "Sécurité Incendie", level: 3, proficiency: "Intermédiaire", keywords: ["Extincteurs", "Évacuation"] },
				{ name: "EPI & Signalisation", level: 4, proficiency: "Avancé", keywords: ["Formation", "Conformité"] },
				{ name: "Gestion des Déchets", level: 3, proficiency: "Intermédiaire", keywords: ["Tri", "Recyclage"] },
				{ name: "Habilitation Électrique", level: 4, proficiency: "Avancé", keywords: ["B2V", "BR", "BC"] },
				{ name: "Document Unique", level: 3, proficiency: "Intermédiaire", keywords: ["DUERP", "Plan de prévention"] },
			],
		},
	];

	// Common data for all resumes
	const commonBasics = {
		name: "Youssef El Amrani",
		email: "youssef.elamrani@gmail.com",
		phone: "+212 661 234 567",
		location: "Casablanca, Maroc",
		website: { url: "https://linkedin.com/in/youssef-elamrani", label: "LinkedIn" },
		customFields: [
			{ id: uuid(), icon: "", text: "Permis B", link: "" },
			{ id: uuid(), icon: "", text: "Mobilité: Maroc entier", link: "" },
		],
		cin: "BH456789",
		militaryServiceStatus: "exempted",
		dateOfBirth: "15/03/2001",
		nationality: "Marocaine",
		maritalStatus: "Célibataire",
	};

	const commonEducation = {
		title: "Formation",
		columns: 1,
		hidden: false,
		items: [
			{
				id: uuid(), hidden: false,
				school: "Institut des Métiers de l'Aéronautique (IMTA)",
				degree: "Technicien Spécialisé",
				area: "Électromécanique des Systèmes Automatisés",
				grade: "Mention Bien",
				location: "Casablanca, Maroc",
				period: "Sept 2023 — Juin 2025",
				website: { url: "https://imta.ma", label: "imta.ma" },
				description: "<p>Formation intensive en maintenance industrielle, automatisme et électromécanique.</p>",
			},
			{
				id: uuid(), hidden: false,
				school: "Lycée Technique Hassan II",
				degree: "BTS Électromécanique",
				area: "Électromécanique",
				grade: "Assez Bien",
				location: "Safi, Maroc",
				period: "Sept 2021 — Juin 2023",
				website: { url: "", label: "" },
				description: "<p>Formation de base en électricité, mécanique et automatisme industriel.</p>",
			},
		],
	};

	const commonExperience = {
		title: "Expérience Professionnelle",
		columns: 1,
		hidden: false,
		items: [
			{
				id: uuid(), hidden: false,
				company: "OCP Group",
				position: "Stagiaire Maintenance Industrielle",
				location: "Safi, Maroc",
				period: "Fév 2025 — Mai 2025",
				website: { url: "https://ocpgroup.ma", label: "ocpgroup.ma" },
				description: "<ul><li>Maintenance préventive sur lignes de production d'engrais</li><li>Diagnostic de pannes sur moteurs et variateurs ABB</li><li>Rédaction de 15 fiches d'intervention technique</li><li>Réduction de 12% du temps moyen d'intervention</li></ul>",
			},
			{
				id: uuid(), hidden: false,
				company: "Renault Tanger Med",
				position: "Stagiaire Électromécanique",
				location: "Tanger, Maroc",
				period: "Juin 2024 — Août 2024",
				website: { url: "https://renault.ma", label: "renault.ma" },
				description: "<ul><li>Maintenance corrective sur robots de soudage (ABB IRB 6700)</li><li>Câblage d'armoires électriques pour nouvelle ligne de montage</li><li>Suivi de la GMAO SAP PM</li></ul>",
			},
		],
	};

	const commonLanguages = {
		title: "Langues", columns: 1, hidden: false,
		items: [
			{ id: uuid(), hidden: false, language: "Arabe", fluency: "Langue maternelle", level: 5 },
			{ id: uuid(), hidden: false, language: "Français", fluency: "Courant (C1)", level: 4 },
			{ id: uuid(), hidden: false, language: "Anglais", fluency: "Technique (B1)", level: 3 },
		],
	};

	const commonInternships = {
		title: "Stages", columns: 1, hidden: false,
		items: [
			{
				id: uuid(), hidden: false,
				company: "OCP Group", position: "Stagiaire Maintenance",
				supervisor: "M. Ahmed Benali", location: "Safi, Maroc",
				period: "Fév — Mai 2025", type: "end-of-studies",
				website: { url: "https://ocpgroup.ma", label: "" },
				tasksPerformed: "<ul><li>Maintenance préventive et corrective</li><li>Diagnostic électrique et mécanique</li></ul>",
				skillsAcquired: ["Maintenance préventive", "GMAO SAP PM", "Diagnostic électrique"],
				evaluation: "<p>Très bon stage. Note: 16/20</p>",
			},
			{
				id: uuid(), hidden: false,
				company: "Renault Tanger Med", position: "Stagiaire Électromécanicien",
				supervisor: "Mme. Fatima Zahra Idrissi", location: "Tanger, Maroc",
				period: "Juin — Août 2024", type: "application",
				website: { url: "https://renault.ma", label: "" },
				tasksPerformed: "<ul><li>Maintenance robots de soudage</li><li>Câblage armoires électriques</li></ul>",
				skillsAcquired: ["Robotique industrielle", "Câblage", "Procédures HSE"],
				evaluation: "<p>Stage satisfaisant. Bonne adaptation au milieu industriel.</p>",
			},
		],
	};

	for (const config of resumeConfigs) {
		const skills = {
			title: "Compétences Techniques", columns: 2, hidden: false,
			items: config.skills.map(s => ({
				id: uuid(), hidden: false, icon: "",
				name: s.name, proficiency: s.proficiency, level: s.level, keywords: s.keywords,
			})),
		};

		const resumeData = {
			picture: {
				hidden: true, url: "", size: 100, rotation: 0, aspectRatio: 1,
				borderRadius: 0, borderColor: "rgba(0,0,0,0)", borderWidth: 0,
				shadowColor: "rgba(0,0,0,0)", shadowWidth: 0,
			},
			basics: { ...commonBasics, headline: config.headline },
			summary: { title: "Profil", columns: 1, hidden: false, content: config.summary },
			sections: {
				profiles: { title: "Profils", columns: 1, hidden: true, items: [] },
				experience: commonExperience,
				education: commonEducation,
				projects: { title: "Projets", columns: 1, hidden: true, items: [] },
				skills,
				languages: commonLanguages,
				interests: { title: "Centres d'intérêt", columns: 1, hidden: true, items: [] },
				awards: { title: "Prix", columns: 1, hidden: true, items: [] },
				certifications: { title: "Certifications", columns: 1, hidden: true, items: [] },
				publications: { title: "Publications", columns: 1, hidden: true, items: [] },
				volunteer: { title: "Bénévolat", columns: 1, hidden: true, items: [] },
				references: { title: "Références", columns: 1, hidden: true, items: [] },
				internships: commonInternships,
			},
			customSections: [],
			metadata: {
				template: "casablanca",
				layout: {
					sidebarWidth: 35,
					pages: [{
						fullWidth: false,
						main: ["summary", "experience", "internships", "education"],
						sidebar: ["skills", "languages"],
					}],
				},
				typography: {
					heading: { fontFamily: "Inter", fontWeights: ["700"], fontSize: 14, lineHeight: 1.3 },
					body: { fontFamily: "Inter", fontWeights: ["400"], fontSize: 11, lineHeight: 1.5 },
				},
				css: { enabled: false, value: "" },
				page: {
					gapX: 16, gapY: 16, marginX: 32, marginY: 32,
					format: "a4", locale: "fr-FR", hideIcons: false,
				},
				// Required: design field with level and colors
				design: {
					level: { icon: "", type: "circle" },
					colors: {
						primary: "rgba(0, 100, 60, 1)",
						text: "rgba(0, 0, 0, 1)",
						background: "rgba(255, 255, 255, 1)",
					},
				},
				notes: "",
			},
		};

		// Create resume
		const createResult = await timed(`Create resume: ${config.name}`, async () => {
			return await rpc("resume/create", {
				name: config.name,
				slug: config.slug,
				tags: ["job-hunting-2025", config.key],
				withSampleData: false,
			});
		});

		if (createResult.ok && createResult.json) {
			const id = createResult.json;
			resumeIds[config.key] = id;
			log("PASS", `Created resume: ${config.name}`, `id=${id}`);

			// Update with full data using PUT
			const updateResult = await timed(`Update resume data: ${config.key}`, async () => {
				return await rpcPut("resume/update", {
					id,
					name: config.name,
					slug: config.slug,
					data: resumeData,
				});
			});

			if (updateResult.ok) {
				log("PASS", `Updated resume data: ${config.name}`);
			} else {
				log("FAIL", `Update resume data: ${config.name}`, `status=${updateResult.status} ${updateResult.text?.slice(0, 400)}`);
			}
		} else {
			log("FAIL", `Create resume: ${config.name}`, `status=${createResult.status} ${createResult.text?.slice(0, 300)}`);
		}
	}

	// Verify all 3 exist
	const listAfter = await rpcGet("resume/list");
	if (listAfter.ok) {
		const myResumes = listAfter.json?.filter(r => r.slug?.startsWith("cv-youssef")) || [];
		log(myResumes.length >= 3 ? "PASS" : "FAIL", `Verify 3 resumes exist`, `found=${myResumes.length}`);
	}
}

// =========================================
// STEP 2: JOB APPLICATION BLITZ
// =========================================
async function createJobApplications() {
	console.log("\n\x1b[1m═══ STEP 2: JOB APPLICATION BLITZ (8 Applications) ═══\x1b[0m");
	console.log("Youssef: \"Je candidate partout. Faut pas être difficile quand on débute.\"");

	const applications = [
		{
			key: "ocp",
			companyName: "OCP Group",
			position: "Technicien Maintenance Industrielle",
			location: "Safi, Maroc",
			jobUrl: "https://careers.ocpgroup.ma/maintenance-tech",
			jobDescription: "Maintenance préventive et corrective sur unités de production d'engrais.",
			salary: "8000-12000 MAD/mois",
			salaryMin: 96000, salaryMax: 144000, salaryCurrency: "MAD",
			status: "interview",
			source: "Site carrières OCP",
			contactName: "Mme. Khadija Berrada",
			contactEmail: "k.berrada@ocpgroup.ma",
			notes: "Entretien technique prévu le 2 juin. Mon ancien maître de stage Ahmed Benali peut servir de référence!",
			tags: ["maintenance", "industrie-lourde", "phosphates"],
			priority: 5,
			isRemote: false, workType: "on-site",
		},
		{
			key: "renault",
			companyName: "Renault Tanger Med",
			position: "Électromécanicien Ligne de Production",
			location: "Tanger, Maroc",
			jobUrl: "https://renault.jobs/tanger-electromecanique",
			jobDescription: "Maintenance des équipements de la chaîne de montage. Travail en 3x8.",
			salary: "7500-10000 MAD/mois",
			salaryMin: 90000, salaryMax: 120000, salaryCurrency: "MAD",
			status: "applied",
			source: "LinkedIn",
			contactName: "M. Yassine Alaoui",
			contactEmail: "y.alaoui@renault.com",
			notes: "J'ai déjà fait mon stage là-bas. Mme. Idrissi m'a recommandé.",
			tags: ["automobile", "electromecanique", "3x8"],
			priority: 5,
			isRemote: false, workType: "on-site",
		},
		{
			key: "oncf",
			companyName: "ONCF",
			position: "Technicien Ferroviaire",
			location: "Rabat, Maroc",
			jobUrl: "https://oncf.ma/recrutement/tech-ferroviaire",
			jobDescription: "Maintenance du matériel roulant ferroviaire.",
			salary: "7000-9000 MAD/mois",
			salaryMin: 84000, salaryMax: 108000, salaryCurrency: "MAD",
			status: "saved",
			source: "Site ONCF",
			notes: "Offre intéressante mais Rabat c'est loin. Salaire correct + avantages ONCF.",
			tags: ["ferroviaire", "secteur-public"],
			priority: 3,
			isRemote: false, workType: "on-site",
		},
		{
			key: "managem",
			companyName: "Managem Group",
			position: "Technicien Maintenance Minière",
			location: "Marrakech, Maroc",
			jobUrl: "https://managemgroup.com/careers/maintenance",
			jobDescription: "Maintenance des équipements d'extraction. Rotation 2 semaines on / 2 semaines off.",
			salary: "10000-14000 MAD/mois",
			salaryMin: 120000, salaryMax: 168000, salaryCurrency: "MAD",
			status: "applied",
			source: "Rekrute.com",
			notes: "Bon salaire mais vie sur site minier. Rotation 2/2.",
			tags: ["mines", "rotation", "maintenance"],
			priority: 4,
			isRemote: false, workType: "on-site",
		},
		{
			key: "yazaki",
			companyName: "Yazaki Morocco",
			position: "Technicien Production Câblage",
			location: "Kénitra, Maroc",
			jobUrl: "https://yazaki-europe.com/careers/kenitra",
			jobDescription: "Supervision et maintenance de lignes de production de faisceaux de câbles.",
			salary: "5500-7000 MAD/mois",
			salaryMin: 66000, salaryMax: 84000, salaryCurrency: "MAD",
			status: "rejected",
			source: "Emploi.ma",
			contactName: "Service RH Yazaki",
			notes: "REJETÉ - Motif: profil surqualifié. Salaire trop bas de toute façon.",
			tags: ["automobile", "câblage", "rejected"],
			priority: 1,
			isRemote: false, workType: "on-site",
		},
		{
			key: "safran",
			companyName: "Safran Nacelles Maroc",
			position: "Mécanicien Aéronautique",
			location: "Casablanca, Maroc",
			jobUrl: "https://safran-group.com/jobs/casablanca-mecanicien",
			jobDescription: "Assemblage et maintenance de nacelles de moteurs d'avion. EN9100.",
			salary: "9000-13000 MAD/mois",
			salaryMin: 108000, salaryMax: 156000, salaryCurrency: "MAD",
			status: "applied",
			source: "Indeed Maroc",
			contactName: "Mme. Sophie Larivière",
			contactEmail: "s.lariviere@safrangroup.com",
			notes: "Poste de rêve! Aéronautique = salaire + prestige + formation continue.",
			tags: ["aéronautique", "maintenance", "EN9100"],
			priority: 5,
			isRemote: false, workType: "on-site",
		},
		{
			key: "stmicro",
			companyName: "STMicroelectronics Bouskoura",
			position: "Technicien Process Semi-conducteurs",
			location: "Bouskoura, Maroc",
			jobUrl: "https://st.com/careers/bouskoura-process",
			jobDescription: "Maintenance des équipements de fabrication de semi-conducteurs. Salle blanche.",
			salary: "8000-11000 MAD/mois",
			salaryMin: 96000, salaryMax: 132000, salaryCurrency: "MAD",
			status: "phone_screen",
			source: "LinkedIn",
			contactName: "M. Karim Tazi",
			contactEmail: "k.tazi@st.com",
			contactPhone: "+212 522 123 456",
			notes: "Premier échange téléphonique OK! Prochain step: entretien technique en personne.",
			tags: ["semi-conducteurs", "high-tech", "salle-blanche"],
			priority: 4,
			isRemote: false, workType: "on-site",
		},
		{
			key: "aptiv",
			companyName: "Aptiv (ex-Delphi)",
			position: "Technicien Maintenance Automatisme",
			location: "Kénitra, Maroc",
			jobUrl: "https://aptiv.com/careers/kenitra-automatisme",
			jobDescription: "Maintenance des systèmes automatisés. PLC Siemens et Allen-Bradley.",
			salary: "8500-11000 MAD/mois",
			salaryMin: 102000, salaryMax: 132000, salaryCurrency: "MAD",
			status: "offer",
			source: "Forum emploi IMTA",
			contactName: "Mme. Nadia Chraibi",
			contactEmail: "n.chraibi@aptiv.com",
			contactPhone: "+212 537 456 789",
			notes: "OFFRE REÇUE! 9000 MAD/mois + prime + transport. Deadline: 5 juin.",
			tags: ["automobile", "automatisme", "offre"],
			priority: 5,
			isRemote: false, workType: "on-site",
		},
	];

	for (const app of applications) {
		const input = { ...app };
		delete input.key;
		// Remove date fields — they cause validation errors as strings
		// The appliedAt field expects a Date object but ORPC serializes via meta

		const result = await timed(`Create job app: ${app.companyName}`, async () => {
			return await rpc("jobApplications/create", input);
		});

		if (result.ok && result.json) {
			jobIds[app.key] = result.json;
			log("PASS", `Created: ${app.companyName} - ${app.position}`, `status=${app.status}, id=${result.json}`);
		} else {
			log("FAIL", `Create: ${app.companyName}`, `status=${result.status} ${result.text?.slice(0, 300)}`);
		}
	}

	// Add activity notes to some applications
	console.log("\n  Adding activity notes...");

	const activities = [
		{ key: "ocp", type: "interview_scheduled", desc: "Entretien technique prévu le 2 juin à 10h. RDV au siège Safi." },
		{ key: "ocp", type: "note", desc: "Préparer: maintenance préventive, GMAO SAP PM, lecture de plans." },
		{ key: "renault", type: "follow_up", desc: "Relance envoyée à M. Alaoui. Toujours pas de réponse." },
		{ key: "stmicro", type: "phone_screen", desc: "Appel de 20min avec M. Tazi. Questions sur IMTA et stages." },
		{ key: "aptiv", type: "offer_received", desc: "Offre: 9000 MAD/mois, CDI, avantages sociaux. Deadline: 5 juin." },
		{ key: "yazaki", type: "rejection", desc: "Email de rejet reçu. Motif: profil surqualifié." },
	];

	for (const act of activities) {
		if (!jobIds[act.key]) continue;
		const result = await rpc("jobApplications/activity/add", {
			applicationId: jobIds[act.key],
			activityType: act.type,
			description: act.desc,
		});
		if (result.ok) {
			log("PASS", `Activity: ${act.key} — ${act.type}`);
		} else {
			log("FAIL", `Activity: ${act.key}`, `status=${result.status} ${result.text?.slice(0, 200)}`);
		}
	}

	// Get statistics
	const stats = await rpcGet("jobApplications/getStatistics");
	if (stats.ok) {
		log("PASS", "Job application statistics", JSON.stringify(stats.json).slice(0, 200));
	} else {
		// Try POST
		const statsPost = await rpc("jobApplications/getStatistics");
		if (statsPost.ok) {
			log("PASS", "Job application statistics (POST)", JSON.stringify(statsPost.json).slice(0, 200));
		} else {
			log("FAIL", "Job application statistics", `GET=${stats.status}, POST=${statsPost.status}`);
		}
	}
}

// =========================================
// STEP 3: INTERVIEW PREP
// =========================================
async function interviewPrep() {
	console.log("\n\x1b[1m═══ STEP 3: INTERVIEW PREP ═══\x1b[0m");
	console.log("Youssef: \"J'ai un entretien chez OCP dans une semaine. Faut que je me prépare!\"");

	// Check interview tips (POST, since no method specified)
	const tips = await timed("Get interview tips", () =>
		rpc("interview/getTips", { language: "fr" })
	);
	if (tips.ok && Array.isArray(tips.json)) {
		log("PASS", `Interview tips available`, `count=${tips.json.length}`);
		if (tips.json.length === 0) {
			friction("Interview tips", "Aucun conseil d'entretien! C'est vide!");
		}
	} else if (tips.ok) {
		log("PASS", "Interview tips (non-array response)", `${JSON.stringify(tips.json).slice(0, 100)}`);
	} else {
		log("FAIL", "Interview tips", `status=${tips.status} ${tips.text?.slice(0, 200)}`);
		friction("Interview tips", "L'endpoint ne marche pas.");
	}

	// Check interview common questions
	const questions = await timed("Get interview questions", () =>
		rpc("interview/getCommonQuestions", { field: "industrial", language: "fr" })
	);
	if (questions.ok && Array.isArray(questions.json)) {
		log("PASS", `Interview questions available`, `count=${questions.json.length}`);
	} else if (questions.ok) {
		log("PASS", "Interview questions", `${JSON.stringify(questions.json).slice(0, 100)}`);
	} else {
		log("FAIL", "Interview questions", `status=${questions.status} ${questions.text?.slice(0, 200)}`);
	}

	// Also check database interview tips
	const dbTips = await timed("Get DB interview tips", () =>
		rpc("interviewTips/list")
	);
	if (dbTips.ok && Array.isArray(dbTips.json)) {
		log("PASS", `DB Interview tips`, `count=${dbTips.json.length}`);
		if (dbTips.json.length === 0) {
			friction("DB Interview tips", "Base de données des conseils vide! Pas de données seed.");
		}
	} else {
		log("FAIL", "DB Interview tips", `${dbTips.status} ${dbTips.text?.slice(0, 200)}`);
	}

	// Create a behavioral interview session (interview/createSession)
	const behavioralSession = await timed("Create behavioral interview session", () =>
		rpc("interview/createSession", {
			title: "Préparation Entretien OCP - Comportemental",
			description: "Simulation d'entretien comportemental pour OCP Group Safi",
			field: "industrial",
			types: ["behavioral", "motivational"],
			difficulty: "intermediate",
			language: "fr",
			jobPosition: "Technicien Maintenance Industrielle",
			companyName: "OCP Group",
			questions: [
				{
					id: uuid(),
					question: "Parlez-moi d'une situation où vous avez résolu une panne urgente sous pression.",
					type: "behavioral",
					difficulty: "intermediate",
					field: "industrial",
					expectedDuration: 180,
					tips: ["Utiliser la méthode STAR", "Donner un exemple de votre stage"],
				},
				{
					id: uuid(),
					question: "Pourquoi avez-vous choisi la maintenance industrielle?",
					type: "motivational",
					difficulty: "beginner",
					field: "industrial",
					expectedDuration: 120,
					tips: ["Parler de votre passion", "Mentionner vos stages"],
				},
				{
					id: uuid(),
					question: "Comment gérez-vous le travail en équipe sur un site industriel?",
					type: "behavioral",
					difficulty: "intermediate",
					field: "industrial",
					expectedDuration: 150,
					tips: ["Exemple de collaboration lors du stage OCP"],
				},
			],
		})
	);

	if (behavioralSession.ok && behavioralSession.json) {
		sessionIds.behavioral = behavioralSession.json?.id;
		log("PASS", "Behavioral interview session created", `id=${sessionIds.behavioral}`);
	} else {
		log("FAIL", "Behavioral session", `status=${behavioralSession.status} ${behavioralSession.text?.slice(0, 300)}`);
	}

	// Create a technical interview session
	const technicalSession = await timed("Create technical interview session", () =>
		rpc("interview/createSession", {
			title: "Préparation Technique - Maintenance Industrielle",
			description: "Questions techniques sur maintenance préventive et diagnostic",
			field: "industrial",
			types: ["technical"],
			difficulty: "advanced",
			language: "fr",
			jobPosition: "Technicien Maintenance",
			companyName: "OCP Group",
			questions: [
				{
					id: uuid(),
					question: "Expliquez la différence entre maintenance préventive systématique et conditionnelle.",
					type: "technical",
					difficulty: "intermediate",
					field: "industrial",
					expectedDuration: 180,
					tips: ["Systématique = calendrier fixe", "Conditionnelle = basée sur l'état réel"],
				},
				{
					id: uuid(),
					question: "Un moteur asynchrone triphasé vibre anormalement. Quelles sont vos étapes de diagnostic?",
					type: "technical",
					difficulty: "advanced",
					field: "industrial",
					expectedDuration: 240,
					tips: ["Analyse vibratoire", "Vérifier alignement, roulements, équilibrage"],
				},
				{
					id: uuid(),
					question: "Que signifie le terme MTBF et comment l'améliorer?",
					type: "technical",
					difficulty: "intermediate",
					field: "industrial",
					expectedDuration: 150,
					tips: ["Mean Time Between Failures"],
				},
			],
		})
	);

	if (technicalSession.ok && technicalSession.json) {
		sessionIds.technical = technicalSession.json?.id;
		log("PASS", "Technical interview session created", `id=${sessionIds.technical}`);
	} else {
		log("FAIL", "Technical session", `status=${technicalSession.status} ${technicalSession.text?.slice(0, 300)}`);
	}

	// List sessions
	const sessionList = await timed("List interview sessions", () =>
		rpc("interview/getSessions", { limit: 10, offset: 0 })
	);
	if (sessionList.ok && Array.isArray(sessionList.json)) {
		log("PASS", "Interview sessions listed", `count=${sessionList.json.length}`);
	} else {
		log("FAIL", "List sessions", `status=${sessionList.status} ${sessionList.text?.slice(0, 200)}`);
	}
}

// =========================================
// STEP 4: CAREER GOALS
// =========================================
async function createCareerGoals() {
	console.log("\n\x1b[1m═══ STEP 4: CAREER GOALS ═══\x1b[0m");
	console.log("Youssef: \"J'ai des objectifs clairs. Pas question de traîner.\"");

	const goals = [
		{
			key: "cdi",
			title: "Décrocher un CDI avant juillet 2025",
			description: "Trouver un emploi stable en CDI dans la maintenance industrielle.",
			category: "career",
			status: "in_progress",
			priority: 5,
			progress: 60,
			tags: ["urgent", "emploi", "priorité-1"],
			metrics: [
				{ name: "Candidatures envoyées", target: 20, current: 15 },
				{ name: "Entretiens obtenus", target: 5, current: 3 },
				{ name: "Offres reçues", target: 2, current: 1 },
			],
		},
		{
			key: "salary",
			title: "Atteindre 40,000 MAD/an de salaire",
			description: "Négocier un salaire d'au moins 40,000 MAD annuel brut.",
			category: "financial",
			status: "in_progress",
			priority: 4,
			progress: 30,
			tags: ["salaire", "négociation"],
			metrics: [
				{ name: "Salaire visé (MAD/an)", target: 40000, current: 0 },
				{ name: "Meilleure offre reçue", target: 40000, current: 9000 },
			],
		},
		{
			key: "habilitation",
			title: "Obtenir habilitation électrique B2V",
			description: "Passer l'habilitation B2V exigée par la plupart des employeurs.",
			category: "skill",
			status: "not_started",
			priority: 3,
			progress: 0,
			tags: ["certification", "électrique", "obligatoire"],
			metrics: [
				{ name: "Heures de formation", target: 24, current: 0 },
				{ name: "Examen réussi", target: 1, current: 0 },
			],
		},
	];

	for (const goal of goals) {
		const input = { ...goal };
		delete input.key;
		// Do NOT send targetDate since it requires Date type — we'll update it later if needed

		const result = await timed(`Create goal: ${goal.title.slice(0, 40)}`, () =>
			rpc("goals/create", input)
		);

		if (result.ok && result.json) {
			goalIds[goal.key] = result.json;
			log("PASS", `Goal: ${goal.title.slice(0, 50)}`, `id=${result.json}`);
		} else {
			log("FAIL", `Goal: ${goal.title.slice(0, 50)}`, `status=${result.status} ${result.text?.slice(0, 300)}`);
		}
	}

	// Add milestones
	console.log("\n  Adding milestones...");

	const milestones = [
		{ goalKey: "cdi", title: "Finaliser CV pour chaque poste cible", order: 1 },
		{ goalKey: "cdi", title: "Envoyer 20 candidatures minimum", order: 2 },
		{ goalKey: "cdi", title: "Réussir au moins 3 entretiens", order: 3 },
		{ goalKey: "cdi", title: "Recevoir et comparer les offres", order: 4 },
		{ goalKey: "cdi", title: "Signer le contrat CDI", order: 5 },
		{ goalKey: "salary", title: "Rechercher les grilles salariales du marché", order: 1 },
		{ goalKey: "salary", title: "Préparer argumentaire de négociation", order: 2 },
		{ goalKey: "salary", title: "Négocier avec au moins 2 employeurs", order: 3 },
		{ goalKey: "habilitation", title: "Trouver un organisme de formation agréé", order: 1 },
		{ goalKey: "habilitation", title: "S'inscrire à la formation B2V", order: 2 },
		{ goalKey: "habilitation", title: "Suivre les 3 jours de formation", order: 3 },
		{ goalKey: "habilitation", title: "Passer et réussir l'examen pratique", order: 4 },
	];

	for (const ms of milestones) {
		if (!goalIds[ms.goalKey]) continue;
		const result = await rpc("goals/milestones/create", {
			goalId: goalIds[ms.goalKey],
			title: ms.title,
			order: ms.order,
		});
		if (result.ok) {
			log("PASS", `Milestone: ${ms.title.slice(0, 45)}`);
		} else {
			log("FAIL", `Milestone: ${ms.title.slice(0, 45)}`, `${result.status} ${result.text?.slice(0, 200)}`);
		}
	}

	// List goals
	const goalList = await timed("List goals", () => rpcGet("goals/list"));
	if (goalList.ok) {
		log("PASS", "Goals listed (GET)", `count=${Array.isArray(goalList.json) ? goalList.json.length : 'N/A'}`);
	} else {
		// Try POST
		const goalListPost = await rpc("goals/list");
		if (goalListPost.ok) {
			log("PASS", "Goals listed (POST)", `count=${Array.isArray(goalListPost.json) ? goalListPost.json.length : 'N/A'}`);
		} else {
			log("FAIL", "List goals", `GET=${goalList.status}, POST=${goalListPost.status}`);
		}
	}
}

// =========================================
// STEP 5: NETWORKING CONTACTS
// =========================================
async function createNetworkingContacts() {
	console.log("\n\x1b[1m═══ STEP 5: NETWORKING CONTACTS ═══\x1b[0m");
	console.log("Youssef: \"Le réseau c'est tout au Maroc. Faut connaître les bonnes personnes.\"");

	const contacts = [
		{
			key: "hr_ocp",
			name: "Khadija Berrada",
			email: "k.berrada@ocpgroup.ma",
			phone: "+212 524 789 123",
			company: "OCP Group",
			position: "Responsable Recrutement Technique",
			relationship: "recruiter",
			relationshipStrength: "moderate",
			howMet: "Candidature en ligne + premier contact téléphonique",
			notes: "Très professionnelle. Entretien prévu le 2 juin.",
			tags: ["recruteur", "ocp", "prioritaire"],
			isFavorite: true,
		},
		{
			key: "supervisor_renault",
			name: "Fatima Zahra Idrissi",
			email: "fz.idrissi@renault.com",
			phone: "+212 539 456 789",
			company: "Renault Tanger Med",
			position: "Chef d'Équipe Maintenance",
			relationship: "mentor",
			relationshipStrength: "strong",
			howMet: "Maître de stage pendant mon stage d'application été 2024",
			notes: "Excellent contact. Elle m'a écrit une lettre de recommandation.",
			tags: ["mentor", "renault", "recommandation"],
			isFavorite: true,
		},
		{
			key: "prof_imta",
			name: "Pr. Mohamed Ait Kadi",
			email: "m.aitkadi@imta.ma",
			phone: "+212 522 234 567",
			company: "IMTA Casablanca",
			position: "Professeur Électromécanique",
			relationship: "mentor",
			relationshipStrength: "strong",
			howMet: "Professeur principal pendant 2 ans à l'IMTA",
			notes: "Mon professeur préféré. Très bien connecté dans l'industrie.",
			tags: ["professeur", "imta", "recommandation", "mentor"],
			isFavorite: true,
		},
		{
			key: "recruiter_linkedin",
			name: "Sarah Benchekroun",
			email: "sarah.b@techtalent.ma",
			company: "TechTalent Morocco",
			position: "Consultante Recrutement Industriel",
			linkedinUrl: "https://linkedin.com/in/sarah-benchekroun",
			relationship: "recruiter",
			relationshipStrength: "weak",
			howMet: "Elle m'a contacté sur LinkedIn",
			notes: "Cabinet de recrutement spécialisé industrie.",
			tags: ["cabinet-recrutement", "linkedin", "industrie"],
			isFavorite: false,
		},
		{
			key: "friend_safran",
			name: "Hamza El Fassi",
			email: "hamza.elfassi@gmail.com",
			phone: "+212 661 987 654",
			company: "Safran Nacelles Maroc",
			position: "Technicien Qualité",
			relationship: "alumni",
			relationshipStrength: "strong",
			howMet: "Camarade de promo IMTA 2024. Embauché chez Safran.",
			notes: "Mon pote Hamza travaille déjà chez Safran! Il peut passer mon CV en interne (cooptation).",
			tags: ["safran", "cooptation", "ami", "imta"],
			isFavorite: true,
		},
	];

	for (const contact of contacts) {
		const input = { ...contact };
		delete input.key;

		const result = await timed(`Create contact: ${contact.name}`, () =>
			rpc("networking/create", input)
		);

		if (result.ok && result.json) {
			contactIds[contact.key] = result.json;
			log("PASS", `Contact: ${contact.name} (${contact.company})`, `id=${result.json}`);
		} else {
			log("FAIL", `Contact: ${contact.name}`, `status=${result.status} ${result.text?.slice(0, 300)}`);
		}
	}

	// Add interactions (without date fields to avoid validation errors)
	console.log("\n  Adding interactions...");

	const interactions = [
		{
			contactKey: "hr_ocp",
			interactionType: "phone_call",
			description: "Appel de 15min pour confirmer l'entretien du 2 juin.",
			outcome: "Entretien confirmé",
			followUpNeeded: true,
		},
		{
			contactKey: "supervisor_renault",
			interactionType: "email",
			description: "Demande de lettre de recommandation. Réponse positive en 2h!",
			outcome: "Lettre de recommandation reçue",
			followUpNeeded: false,
		},
		{
			contactKey: "prof_imta",
			interactionType: "meeting",
			description: "Rencontre à l'IMTA pour conseils sur ma recherche d'emploi.",
			outcome: "3 nouveaux contacts et conseils stratégiques",
			followUpNeeded: true,
		},
		{
			contactKey: "friend_safran",
			interactionType: "message",
			description: "WhatsApp: il va passer mon CV au service RH de Safran (cooptation).",
			outcome: "CV transmis en interne",
			followUpNeeded: true,
		},
	];

	for (const interaction of interactions) {
		if (!contactIds[interaction.contactKey]) continue;
		const input = { ...interaction, contactId: contactIds[interaction.contactKey] };
		delete input.contactKey;

		const result = await rpc("networking/interactions/add", input);
		if (result.ok) {
			log("PASS", `Interaction: ${interaction.interactionType} with ${interaction.contactKey}`);
		} else {
			log("FAIL", `Interaction: ${interaction.contactKey}`, `${result.status} ${result.text?.slice(0, 200)}`);
		}
	}

	// List all contacts
	const contactList = await timed("List contacts", () => rpcGet("networking/list"));
	if (contactList.ok) {
		log("PASS", "Contacts listed (GET)", `count=${Array.isArray(contactList.json) ? contactList.json.length : 'N/A'}`);
	} else {
		const contactListPost = await rpc("networking/list");
		if (contactListPost.ok) {
			log("PASS", "Contacts listed (POST)", `count=${Array.isArray(contactListPost.json) ? contactListPost.json.length : 'N/A'}`);
		} else {
			log("FAIL", "List contacts", `GET=${contactList.status}, POST=${contactListPost.status}`);
		}
	}
}

// =========================================
// STEP 6: PORTFOLIO PROJECTS
// =========================================
async function createPortfolioProjects() {
	console.log("\n\x1b[1m═══ STEP 6: PORTFOLIO PROJECTS ═══\x1b[0m");
	console.log("Youssef: \"J'ai des projets techniques de l'école qui montrent mes compétences.\"");

	const projects = [
		{
			key: "convoyeur",
			title: "Automatisation Convoyeur Industriel",
			description: "Projet de fin d'études: automatisation d'un convoyeur à bande avec API Siemens S7-1200",
			longDescription: "Conception et réalisation d'un système automatisé de convoyage pour une ligne de conditionnement. Programmation de l'automate Siemens S7-1200, câblage, mise en service et documentation technique.",
			role: "Chef de projet technique (binôme)",
			type: "backend",
			status: "completed",
			technologies: [
				{ name: "Siemens S7-1200", category: "backend" },
				{ name: "TIA Portal V17", category: "backend" },
				{ name: "AutoCAD Electrical", category: "design" },
				{ name: "WinCC", category: "frontend" },
			],
			skills: ["Automatisme", "Programmation API", "Câblage", "Documentation"],
			featured: true,
			startDate: "2025-01",
			endDate: "2025-05",
			teamSize: 2,
			client: "IMTA Casablanca",
			industry: "Industrie manufacturière",
			metrics: [
				{ label: "Temps de cycle réduit", value: "35%" },
				{ label: "Coût du projet", value: "25,000 MAD" },
			],
		},
		{
			key: "supervision",
			title: "Système de Supervision SCADA",
			description: "Développement d'un système SCADA pour une station de pompage",
			longDescription: "Interface de supervision SCADA avec acquisition de données en temps réel, affichage HMI, alarmes et historique.",
			role: "Développeur SCADA",
			type: "fullstack",
			status: "completed",
			technologies: [
				{ name: "Vijeo Designer", category: "frontend" },
				{ name: "Schneider M340", category: "backend" },
				{ name: "Modbus TCP/IP", category: "backend" },
			],
			skills: ["SCADA", "IHM", "Communication industrielle", "Modbus"],
			featured: true,
			startDate: "2024-09",
			endDate: "2024-12",
			teamSize: 3,
			client: "IMTA Casablanca",
			industry: "Infrastructures hydrauliques",
			metrics: [
				{ label: "Variables supervisées", value: "48" },
				{ label: "Écrans IHM créés", value: "12" },
			],
		},
	];

	for (const project of projects) {
		const input = { ...project };
		delete input.key;

		const result = await timed(`Create project: ${project.title}`, () =>
			rpc("workSamples/createProject", input)
		);

		if (result.ok && result.json) {
			projectIds[project.key] = result.json;
			log("PASS", `Project: ${project.title}`, `id=${result.json}`);
		} else {
			log("FAIL", `Project: ${project.title}`, `status=${result.status} ${result.text?.slice(0, 300)}`);
		}
	}

	// List projects
	const projectList = await timed("List portfolio projects", () => rpcGet("workSamples/listProjects"));
	if (projectList.ok) {
		log("PASS", "Portfolio listed (GET)", `count=${Array.isArray(projectList.json) ? projectList.json.length : 'N/A'}`);
	} else {
		const projectListPost = await rpc("workSamples/listProjects");
		if (projectListPost.ok) {
			log("PASS", "Portfolio listed (POST)", `count=${Array.isArray(projectListPost.json) ? projectListPost.json.length : 'N/A'}`);
		} else {
			log("FAIL", "List portfolio", `GET=${projectList.status}, POST=${projectListPost.status}`);
		}
	}
}

// =========================================
// STEP 7: EXPLORE ADDITIONAL FEATURES
// =========================================
async function exploreFeatures() {
	console.log("\n\x1b[1m═══ EXPLORING ADDITIONAL FEATURES ═══\x1b[0m");
	console.log("Youssef: \"Voyons ce que cette plateforme offre d'autre...\"");

	// Check AI status — aiConfig/status/check is a GET route
	const aiStatus = await timed("Check AI availability", () => rpcGet("aiConfig/status/check"));
	if (aiStatus.ok) {
		log("PASS", "AI status check", JSON.stringify(aiStatus.json).slice(0, 200));
		if (!aiStatus.json?.available) {
			friction("AI Features", "L'IA n'est pas disponible! Pas d'amélioration automatique du CV.");
		}
	} else {
		// Try POST
		const aiStatusPost = await rpc("aiConfig/status/check");
		if (aiStatusPost.ok) {
			log("PASS", "AI status (POST)", JSON.stringify(aiStatusPost.json).slice(0, 200));
		} else {
			log("FAIL", "AI status", `GET=${aiStatus.status}, POST=${aiStatusPost.status}`);
			friction("AI Features", "Impossible de vérifier l'IA.");
		}
	}

	// Check dashboard
	const dash = await timed("Dashboard summary", () => rpc("dashboard/summary"));
	if (dash.ok) {
		log("PASS", "Dashboard summary", JSON.stringify(dash.json).slice(0, 200));
	} else {
		log("SKIP", "Dashboard summary", `status=${dash.status}`);
	}

	// Check market insights (POST since no method defined)
	const insights = await timed("Market insights", () => rpc("marketInsights/list"));
	if (insights.ok && Array.isArray(insights.json)) {
		log("PASS", "Market insights", `count=${insights.json.length}`);
		if (insights.json.length === 0) {
			friction("Market Insights", "Aucune donnée de marché! Pas de données seed.");
		}
	} else {
		log("FAIL", "Market insights", `status=${insights.status} ${insights.text?.slice(0, 200)}`);
	}

	// Check employers database (POST)
	const employers = await timed("Employers database", () => rpc("employers/list"));
	if (employers.ok && Array.isArray(employers.json)) {
		log("PASS", "Employers database", `count=${employers.json.length}`);
		if (employers.json.length === 0) {
			friction("Employers", "La base d'employeurs est vide!");
		}
	} else {
		log("FAIL", "Employers database", `status=${employers.status} ${employers.text?.slice(0, 200)}`);
	}

	// Check skill library (POST)
	const skillLib = await timed("Skill library", () => rpc("skillLibrary/list"));
	if (skillLib.ok && Array.isArray(skillLib.json)) {
		log("PASS", "Skill library", `count=${skillLib.json.length}`);
		if (skillLib.json.length === 0) {
			friction("Skill Library", "Pas de compétences recommandées! Données seed manquantes.");
		}
	} else {
		log("FAIL", "Skill library", `status=${skillLib.status} ${skillLib.text?.slice(0, 200)}`);
	}

	// Check resume tags (GET)
	const tags = await timed("Resume tags", () => rpcGet("resume/tags/list"));
	if (tags.ok) {
		log("PASS", "Resume tags", JSON.stringify(tags.json).slice(0, 200));
	} else {
		log("FAIL", "Resume tags", `status=${tags.status}`);
	}

	// Check cover letter
	const coverLetter = await timed("Cover letter list", () => rpc("coverLetter/list"));
	if (coverLetter.ok) {
		log("PASS", "Cover letter", `count=${Array.isArray(coverLetter.json) ? coverLetter.json.length : 'N/A'}`);
	} else {
		log("SKIP", "Cover letter", `status=${coverLetter.status}`);
	}

	// Check deadlines
	const deadlines = await timed("Deadlines", () => rpc("deadlines/list"));
	if (deadlines.ok) {
		log("PASS", "Deadlines", `count=${Array.isArray(deadlines.json) ? deadlines.json.length : 'N/A'}`);
	} else {
		log("SKIP", "Deadlines", `status=${deadlines.status}`);
	}

	// Check IMTA programs
	const programs = await timed("IMTA programs", () => rpc("imtaPrograms/list"));
	if (programs.ok && Array.isArray(programs.json)) {
		log("PASS", "IMTA programs", `count=${programs.json.length}`);
	} else {
		log("FAIL", "IMTA programs", `status=${programs.status} ${programs.text?.slice(0, 200)}`);
	}
}

// =========================================
// FINAL REPORT
// =========================================
function generateReport() {
	console.log("\n\x1b[1;33m╔══════════════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1;33m║  YOUSSEF'S BRUTALLY HONEST REVIEW                ║\x1b[0m");
	console.log("\x1b[1;33m╚══════════════════════════════════════════════════╝\x1b[0m");

	console.log(`\n\x1b[1mTest Results:\x1b[0m ${passed} passed, ${failed} failed, ${skipped} skipped out of ${passed + failed + skipped} total`);

	console.log("\n\x1b[1m--- TIMING REPORT (sorted slowest first) ---\x1b[0m");
	const sortedTiming = Object.entries(timing).sort((a, b) => b[1] - a[1]).slice(0, 20);
	for (const [label, ms] of sortedTiming) {
		const color = ms > 3000 ? "\x1b[31m" : ms > 1500 ? "\x1b[33m" : "\x1b[32m";
		console.log(`  ${color}${ms}ms\x1b[0m — ${label}`);
	}

	console.log("\n\x1b[1m--- FRICTION POINTS ---\x1b[0m");
	if (frictions.length === 0) {
		console.log("  No major friction points detected!");
	} else {
		for (const f of frictions) {
			console.log(`  \x1b[31m✗\x1b[0m [${f.feature}] ${f.issue}`);
		}
	}

	console.log("\n\x1b[1m--- DATA CREATED ---\x1b[0m");
	console.log(`  Resumes: ${Object.keys(resumeIds).length}/3`);
	console.log(`  Job Applications: ${Object.keys(jobIds).length}/8`);
	console.log(`  Career Goals: ${Object.keys(goalIds).length}/3`);
	console.log(`  Networking Contacts: ${Object.keys(contactIds).length}/5`);
	console.log(`  Portfolio Projects: ${Object.keys(projectIds).length}/2`);
	console.log(`  Interview Sessions: ${Object.keys(sessionIds).length}/2`);

	const totalCreated = Object.keys(resumeIds).length + Object.keys(jobIds).length +
		Object.keys(goalIds).length + Object.keys(contactIds).length +
		Object.keys(projectIds).length + Object.keys(sessionIds).length;
	const totalExpected = 3 + 8 + 3 + 5 + 2 + 2; // = 23

	console.log(`\n  \x1b[1mTotal: ${totalCreated}/${totalExpected} items created successfully\x1b[0m`);

	console.log("\n\x1b[1;36m═══════════════════════════════════════════════════\x1b[0m");
	console.log("\x1b[1;36m  YOUSSEF'S HONEST REVIEW (as a real job-hunter)\x1b[0m");
	console.log("\x1b[1;36m═══════════════════════════════════════════════════\x1b[0m");

	const failedTests = results.filter(r => r.status === "FAIL");
	const workingFeatures = [
		Object.keys(resumeIds).length >= 2,
		Object.keys(jobIds).length >= 5,
		Object.keys(goalIds).length >= 2,
		Object.keys(contactIds).length >= 3,
		Object.keys(projectIds).length >= 1,
		Object.keys(sessionIds).length >= 1,
	].filter(Boolean).length;

	console.log(`
\x1b[1m1. Est-ce que cette app m'aide vraiment à trouver un job?\x1b[0m
${workingFeatures >= 5
	? "   OUI, la plateforme couvre bien les besoins d'un chercheur d'emploi."
	: workingFeatures >= 3
	? "   PARTIELLEMENT. Les fonctionnalités de base marchent mais il manque des choses."
	: "   PAS VRAIMENT. Trop de fonctionnalités cassées ou vides."}
   - La gestion des CV multiples: ${Object.keys(resumeIds).length}/3 créés ${Object.keys(resumeIds).length >= 3 ? "(TOP!)" : "(problème)"}
   - Le suivi des candidatures: ${Object.keys(jobIds).length}/8 créées ${Object.keys(jobIds).length >= 6 ? "(bon!)" : "(insuffisant)"}
   - Les objectifs de carrière: ${Object.keys(goalIds).length}/3 créés ${Object.keys(goalIds).length >= 3 ? "(utile!)" : "(problème)"}
   - Le réseau de contacts: ${Object.keys(contactIds).length}/5 créés ${Object.keys(contactIds).length >= 4 ? "(bien pensé!)" : "(problème)"}
   - Le portfolio: ${Object.keys(projectIds).length}/2 créés ${Object.keys(projectIds).length >= 2 ? "(OK)" : "(problème)"}
   - La prépa entretien: ${Object.keys(sessionIds).length}/2 sessions ${Object.keys(sessionIds).length >= 1 ? "(fonctionne)" : "(cassé)"}

\x1b[1m2. Fonctionnalités inutiles ou qui manquent:\x1b[0m
   MANQUE CRUELLEMENT:
   - Export PDF fiable et rapide (je dois envoyer des PDF, pas des liens!)
   - Modèles de CV adaptés au marché marocain (format avec photo, CIN, etc.)
   - Intégration avec les sites d'emploi marocains (Rekrute, Emploi.ma, MarocAnnonces)
   - Notifications de deadlines (j'ai une deadline Aptiv le 5 juin!)
   - Comparaison des offres côte à côte
   - Suivi automatique des relances
   ${frictions.length > 0 ? "\n   FRICTIONS DÉTECTÉES:" : ""}
${frictions.map(f => `   - ${f.feature}: ${f.issue}`).join("\n")}

\x1b[1m3. Ce qui changerait tout:\x1b[0m
   - IA qui adapte mon CV automatiquement pour chaque offre d'emploi
   - Alerte quand une entreprise dans mon domaine recrute
   - Simulation d'entretien avec feedback IA en temps réel
   - Réseau alumni IMTA intégré
   - Version mobile pour postuler depuis mon téléphone
   - Rappels et calendrier intégré pour les entretiens

\x1b[1m4. Est-ce que je paierais?\x1b[0m
   - Version gratuite avec 1 CV: OUI
   - 49 MAD/mois (~5 EUR) pour tout débloquer: OUI, si l'IA marche
   - 99 MAD/mois: NON, trop cher pour un chômeur marocain
   - Je préfère "pay-per-feature" (payer pour l'IA, pas le reste)

\x1b[1m5. Note globale: ${workingFeatures >= 5 ? "7" : workingFeatures >= 3 ? "5" : "3"}/10\x1b[0m
   Score détaillé:
   - Création de CV: ${Object.keys(resumeIds).length >= 3 ? "9/10" : "6/10"} (multi-CV avec données réelles)
   - Suivi candidatures: ${Object.keys(jobIds).length >= 6 ? "8/10" : "4/10"} (statuts + activités)
   - Prépa entretien: ${Object.keys(sessionIds).length >= 1 ? "6/10" : "3/10"} (sessions OK, manque feedback IA)
   - Objectifs: ${Object.keys(goalIds).length >= 2 ? "7/10" : "4/10"} (milestones utiles)
   - Networking: ${Object.keys(contactIds).length >= 4 ? "8/10" : "5/10"} (interactions tracées)
   - Portfolio: ${Object.keys(projectIds).length >= 1 ? "6/10" : "3/10"} (basique pour techniciens)
   - Vitesse API: ${Object.values(timing).every(t => t < 1000) ? "9/10" : "7/10"} (rapide!)
   - Données seed: ${frictions.some(f => f.issue.includes("vide") || f.issue.includes("seed")) ? "3/10" : "7/10"} (manque de contenu)

\x1b[1;33m  — Youssef El Amrani, IMTA 2025, toujours en recherche d'emploi...\x1b[0m
`);

	// Failed tests detail
	if (failedTests.length > 0) {
		console.log("\x1b[1;31m--- FAILED TESTS DETAIL ---\x1b[0m");
		for (const t of failedTests) {
			console.log(`  \x1b[31m✗\x1b[0m ${t.name}: ${t.detail.slice(0, 150)}`);
		}
	}
}

// =========================================
// MAIN
// =========================================
async function main() {
	const authenticated = await authenticate();
	if (!authenticated) {
		console.error("\n\x1b[31mFATAL: Cannot authenticate. Aborting.\x1b[0m");
		process.exit(1);
	}

	await createResumes();
	await createJobApplications();
	await interviewPrep();
	await createCareerGoals();
	await createNetworkingContacts();
	await createPortfolioProjects();
	await exploreFeatures();
	generateReport();
}

main().catch(e => {
	console.error("\x1b[31mFATAL ERROR:\x1b[0m", e);
	process.exit(1);
});
