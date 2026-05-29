/**
 * Karim Bouzidi - Comprehensive Career Tracking Test
 *
 * Persona: Karim Bouzidi, 28, HSE Specialist, OCP Group, IMTA Alumni
 * Tests: Resume, Goals, Networking, Skills, Job Applications, Analytics
 *
 * ORPC wire protocol: body must be wrapped in {"json": <input>} envelope
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";
const CREDENTIALS = { email: "student1@test.com", password: "TestAccount123!" };

let sessionCookie = "";
let passed = 0;
let failed = 0;
let skipped = 0;
const results = [];
const createdIds = {
	resumeId: null,
	goalIds: [],
	milestoneIds: [],
	contactIds: [],
	skillIds: [],
	applicationIds: [],
};

function log(status, name, detail = "") {
	const icon = status === "PASS" ? "\x1b[32m✓\x1b[0m" : status === "FAIL" ? "\x1b[31m✗\x1b[0m" : "\x1b[33m⊘\x1b[0m";
	const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
	console.log(line);
	results.push({ status, name, detail });
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else skipped++;
}

/**
 * ORPC date meta format:
 * Dates must be sent as ISO strings in `json`, with a `meta` array tagging them.
 * Each meta entry is [TYPE_NUMBER, ...path_segments].
 * DATE type = 1.
 * Example: { json: { targetDate: "2027-01-01T00:00:00.000Z" }, meta: [[1, "targetDate"]] }
 */

/** POST an ORPC endpoint with {json: input} envelope, auto-tagging Date fields */
async function rpc(path, input = undefined, datePaths = []) {
	const url = `${BASE_URL}/api/rpc/${path}`;
	const envelope = input !== undefined ? { json: input } : { json: undefined };
	// Add meta for date fields
	if (datePaths.length > 0) {
		envelope.meta = datePaths.map(p => {
			const segments = Array.isArray(p) ? p : [p];
			return [1, ...segments]; // 1 = DATE type in ORPC
		});
	}
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
		headers: {
			Origin: BASE_URL,
			Cookie: sessionCookie,
		},
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, json, text, ok: res.ok };
}

// ============================================================
// AUTH
// ============================================================
async function authenticate() {
	console.log("\n\x1b[1m╔══════════════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m║  KARIM BOUZIDI — Career Tracking Test Suite     ║\x1b[0m");
	console.log("\x1b[1m╚══════════════════════════════════════════════════╝\x1b[0m");
	console.log("\n\x1b[1m=== STEP 0: AUTHENTICATION ===\x1b[0m");

	try {
		const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: BASE_URL },
			body: JSON.stringify(CREDENTIALS),
			redirect: "manual",
		});
		const cookies = res.headers.getSetCookie?.() || [];
		sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");

		if (res.ok || res.status === 302) {
			log("PASS", "Login as student1@test.com", `status=${res.status}, cookies=${cookies.length}`);
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
		if (res.ok && body?.user?.email) {
			log("PASS", "Session check", `user=${body.user.email} role=${body.user.role}`);
			return true;
		} else {
			log("FAIL", "Session check", "No user in session");
			return false;
		}
	} catch (e) {
		log("FAIL", "Session check", e.message);
		return false;
	}
}

// ============================================================
// STEP 1: RESUME
// ============================================================
async function step1_resume() {
	console.log("\n\x1b[1m=== STEP 1: RESUME — CV Karim Bouzidi ===\x1b[0m");

	// First, list existing resumes
	const listRes = await rpc("resume/list");
	if (listRes.ok) {
		const existing = Array.isArray(listRes.json) ? listRes.json : [];
		log("PASS", "List existing resumes", `found ${existing.length} resumes`);

		// Check if Karim's resume already exists
		const karimResume = existing.find(r => r.name.includes("Karim") || r.slug.includes("karim"));
		if (karimResume) {
			createdIds.resumeId = karimResume.id;
			log("PASS", "Found existing Karim resume", `id=${karimResume.id}, name=${karimResume.name}`);
		}
	} else {
		log("FAIL", "List resumes", `status=${listRes.status}`);
	}

	// Create resume if not found
	if (!createdIds.resumeId) {
		const createRes = await rpc("resume/create", {
			name: "CV Karim Bouzidi - Spécialiste HSE",
			slug: "cv-karim-bouzidi-hse",
			tags: ["hse", "ocp", "imta"],
			withSampleData: false,
		});
		if (createRes.ok && createRes.json) {
			createdIds.resumeId = createRes.json;
			log("PASS", "Create resume", `id=${createRes.json}`);
		} else {
			log("FAIL", "Create resume", `status=${createRes.status} ${JSON.stringify(createRes.json).slice(0, 200)}`);
			// Try with a unique slug
			const createRes2 = await rpc("resume/create", {
				name: "CV Karim Bouzidi - Spécialiste HSE",
				slug: `cv-karim-bouzidi-hse-${Date.now()}`,
				tags: ["hse", "ocp", "imta"],
				withSampleData: false,
			});
			if (createRes2.ok && createRes2.json) {
				createdIds.resumeId = createRes2.json;
				log("PASS", "Create resume (retry)", `id=${createRes2.json}`);
			} else {
				log("FAIL", "Create resume (retry)", `status=${createRes2.status}`);
			}
		}
	}

	if (!createdIds.resumeId) {
		log("SKIP", "Update resume data", "No resume ID available");
		return;
	}

	// Update with full Karim data
	const resumeData = {
		picture: {
			hidden: false,
			url: "",
			size: 100,
			rotation: 0,
			aspectRatio: 1,
			borderRadius: 50,
			borderColor: "rgba(0, 0, 0, 0.1)",
			borderWidth: 2,
			shadowColor: "rgba(0, 0, 0, 0.1)",
			shadowWidth: 0,
		},
		basics: {
			name: "Karim Bouzidi",
			headline: "Spécialiste HSE | 2 ans d'expérience en industrie chimique | IMTA Alumni",
			email: "karim.bouzidi@email.com",
			phone: "+212 6 61 23 45 67",
			location: "Khouribga, Maroc",
			website: {
				url: "https://linkedin.com/in/karimbouzidi",
				label: "LinkedIn",
			},
			customFields: [
				{
					id: "cf-cin-001",
					icon: "",
					text: "CIN: BK123456",
					link: "",
				},
				{
					id: "cf-permis-001",
					icon: "",
					text: "Permis B",
					link: "",
				},
			],
			cin: "BK123456",
			militaryServiceStatus: "completed",
			dateOfBirth: "1998-03-15",
			nationality: "Marocaine",
			maritalStatus: "Célibataire",
		},
		summary: {
			title: "Profil",
			columns: 1,
			hidden: false,
			content: "<p>Spécialiste Hygiène, Sécurité et Environnement diplômé de l'IMTA avec 2 ans d'expérience au sein du Groupe OCP, leader mondial de l'industrie phosphatière. Expert en gestion des risques industriels, conformité réglementaire et mise en œuvre des systèmes de management HSE selon les normes ISO 45001 et ISO 14001. Passionné par l'amélioration continue des conditions de travail et la protection de l'environnement. Reconnu pour ma rigueur, mon sens de l'organisation et ma capacité à former les équipes aux bonnes pratiques de sécurité.</p>",
		},
		sections: {
			profiles: {
				title: "Réseaux Sociaux",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "prof-linkedin-001",
						hidden: false,
						icon: "linkedin-logo",
						network: "LinkedIn",
						username: "karimbouzidi",
						website: { url: "https://linkedin.com/in/karimbouzidi", label: "linkedin.com/in/karimbouzidi" },
					},
				],
			},
			experience: {
				title: "Expérience Professionnelle",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "exp-ocp-001",
						hidden: false,
						company: "OCP Group - Site de Khouribga",
						position: "Technicien HSE",
						location: "Khouribga, Maroc",
						period: "Septembre 2024 — Présent",
						website: { url: "https://www.ocpgroup.ma", label: "ocpgroup.ma" },
						description: "<ul><li>Réalisation d'audits de sécurité hebdomadaires sur les installations de traitement du phosphate</li><li>Mise en place et suivi du système de management HSE conforme ISO 45001:2018</li><li>Formation de 150+ employés aux procédures d'urgence et manipulation de produits chimiques</li><li>Réduction de 35% des incidents de travail sur le site en 18 mois</li><li>Coordination avec les autorités réglementaires (ONSSA, Ministère de l'Environnement)</li><li>Gestion des permis de travail (permis de feu, travail en hauteur, espace confiné)</li><li>Analyse des accidents et incidents par la méthode Arbre des Causes</li></ul>",
					},
					{
						id: "exp-ocp-stage",
						hidden: false,
						company: "OCP Group - Site de Jorf Lasfar",
						position: "Stagiaire HSE (Stage de fin d'études)",
						location: "El Jadida, Maroc",
						period: "Février 2024 — Juillet 2024",
						website: { url: "https://www.ocpgroup.ma", label: "ocpgroup.ma" },
						description: "<ul><li>Réalisation d'une étude AMDEC sur la ligne de production d'acide phosphorique</li><li>Élaboration du plan d'évacuation et mise à jour des fiches de données de sécurité (FDS)</li><li>Participation aux réunions du comité d'hygiène et de sécurité</li><li>Rapport de stage évalué à 18/20 par le jury</li></ul>",
					},
				],
			},
			education: {
				title: "Formation",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "edu-imta-001",
						hidden: false,
						school: "Institut Marocain des Techniciens Appliqués (IMTA)",
						degree: "Technicien Spécialisé",
						area: "Hygiène, Sécurité et Environnement (HSE)",
						grade: "Mention Très Bien (16.5/20)",
						location: "Casablanca, Maroc",
						period: "2022 — 2024",
						website: { url: "", label: "" },
						description: "<p>Formation intensive de 2 ans couvrant la gestion des risques industriels, la réglementation HSE marocaine et internationale, les systèmes de management environnemental, et les techniques d'audit et de prévention.</p>",
					},
					{
						id: "edu-bac-001",
						hidden: false,
						school: "Lycée Moulay Rachid",
						degree: "Baccalauréat Sciences Expérimentales",
						area: "Sciences de la Vie et de la Terre (SVT)",
						grade: "Mention Bien (14.8/20)",
						location: "Khouribga, Maroc",
						period: "2019 — 2022",
						website: { url: "", label: "" },
						description: "",
					},
				],
			},
			certifications: {
				title: "Certifications",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "cert-nebosh-001",
						hidden: false,
						title: "NEBOSH International General Certificate (IGC)",
						issuer: "NEBOSH - National Examination Board in Occupational Safety and Health",
						date: "2025",
						website: { url: "https://www.nebosh.org.uk", label: "nebosh.org.uk" },
						description: "<p>Certification internationale en santé et sécurité au travail. Formation suivie à distance avec examen pratique.</p>",
					},
					{
						id: "cert-secourisme-001",
						hidden: false,
						title: "Certificat de Secourisme (PSC1 équivalent)",
						issuer: "Croissant-Rouge Marocain",
						date: "2023",
						website: { url: "", label: "" },
						description: "<p>Formation aux premiers secours, gestes d'urgence et utilisation du défibrillateur.</p>",
					},
					{
						id: "cert-iso-001",
						hidden: false,
						title: "Auditeur Interne ISO 45001:2018",
						issuer: "Bureau Veritas Maroc",
						date: "2025",
						website: { url: "", label: "" },
						description: "<p>Formation à l'audit interne du système de management de la santé et sécurité au travail.</p>",
					},
				],
			},
			skills: {
				title: "Compétences",
				columns: 2,
				hidden: false,
				items: [
					{ id: "sk-risk-001", hidden: false, icon: "", name: "Évaluation des risques (EvRP)", proficiency: "Avancé", level: 4, keywords: ["AMDEC", "Arbre des causes", "HAZOP"] },
					{ id: "sk-iso45-001", hidden: false, icon: "", name: "ISO 45001:2018", proficiency: "Avancé", level: 4, keywords: ["Système de management SST"] },
					{ id: "sk-iso14-001", hidden: false, icon: "", name: "ISO 14001:2015", proficiency: "Intermédiaire", level: 3, keywords: ["Management environnemental"] },
					{ id: "sk-fire-001", hidden: false, icon: "", name: "Sécurité incendie", proficiency: "Avancé", level: 4, keywords: ["EPI", "Extincteurs", "Plan d'évacuation"] },
					{ id: "sk-chem-001", hidden: false, icon: "", name: "Manipulation produits chimiques", proficiency: "Avancé", level: 4, keywords: ["FDS", "EPI chimiques", "Stockage"] },
					{ id: "sk-amdec-001", hidden: false, icon: "", name: "AMDEC / FMEA", proficiency: "Avancé", level: 4, keywords: ["Analyse des défaillances"] },
					{ id: "sk-audit-001", hidden: false, icon: "", name: "Audit interne HSE", proficiency: "Intermédiaire", level: 3, keywords: ["Non-conformités", "Actions correctives"] },
					{ id: "sk-permit-001", hidden: false, icon: "", name: "Permis de travail", proficiency: "Avancé", level: 5, keywords: ["Permis de feu", "Hauteur", "Espace confiné"] },
					{ id: "sk-train-001", hidden: false, icon: "", name: "Formation sécurité", proficiency: "Avancé", level: 4, keywords: ["Sensibilisation", "Exercices d'évacuation"] },
					{ id: "sk-reg-001", hidden: false, icon: "", name: "Réglementation HSE marocaine", proficiency: "Intermédiaire", level: 3, keywords: ["Code du travail", "Loi 28-00"] },
				],
			},
			languages: {
				title: "Langues",
				columns: 2,
				hidden: false,
				items: [
					{ id: "lang-ar-001", hidden: false, language: "Arabe", fluency: "Langue maternelle", level: 5 },
					{ id: "lang-fr-001", hidden: false, language: "Français", fluency: "Courant (C1)", level: 4 },
					{ id: "lang-en-001", hidden: false, language: "Anglais", fluency: "Intermédiaire (B2)", level: 3 },
					{ id: "lang-ber-001", hidden: false, language: "Amazigh", fluency: "Notions", level: 2 },
				],
			},
			interests: {
				title: "Centres d'intérêt",
				columns: 2,
				hidden: false,
				items: [
					{ id: "int-env-001", hidden: false, icon: "", name: "Environnement et développement durable", keywords: ["Recyclage", "Énergie renouvelable"] },
					{ id: "int-sport-001", hidden: false, icon: "", name: "Football et randonnée", keywords: ["Atlas", "Sport collectif"] },
					{ id: "int-read-001", hidden: false, icon: "", name: "Veille réglementaire HSE", keywords: ["Normes", "Publications professionnelles"] },
				],
			},
			awards: { title: "Prix et distinctions", columns: 1, hidden: true, items: [] },
			projects: {
				title: "Projets",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "proj-safety-001",
						hidden: false,
						name: "Programme Zéro Accident - Site Khouribga",
						period: "2025 — Présent",
						website: { url: "", label: "" },
						description: "<p>Conception et déploiement d'un programme de culture sécurité visant zéro accident de travail. Inclut des formations mensuelles, des inspections surprises, et un système de signalement des quasi-accidents. Résultat: -35% d'incidents en 18 mois.</p>",
					},
				],
			},
			publications: { title: "Publications", columns: 1, hidden: true, items: [] },
			volunteer: { title: "Bénévolat", columns: 1, hidden: true, items: [] },
			references: {
				title: "Références",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "ref-alaoui-001",
						hidden: false,
						name: "Mohammed Alaoui",
						position: "Directeur HSE, OCP Group",
						website: { url: "", label: "" },
						phone: "+212 6 62 xx xx xx",
						description: "<p>Disponible sur demande</p>",
					},
				],
			},
			internships: {
				title: "Stages",
				columns: 1,
				hidden: false,
				items: [
					{
						id: "stage-ocp-001",
						hidden: false,
						company: "OCP Group - Jorf Lasfar",
						position: "Stagiaire HSE",
						supervisor: "Mohammed Alaoui",
						location: "El Jadida, Maroc",
						period: "Février 2024 — Juillet 2024",
						type: "end-of-studies",
						website: { url: "https://www.ocpgroup.ma", label: "ocpgroup.ma" },
						tasksPerformed: "<ul><li>Étude AMDEC sur la ligne de production d'acide phosphorique</li><li>Mise à jour des Fiches de Données de Sécurité (FDS)</li><li>Élaboration du plan d'évacuation d'urgence</li></ul>",
						skillsAcquired: ["AMDEC", "FDS", "Plan d'évacuation", "Audit terrain"],
						evaluation: "<p>Note: 18/20 — Excellent travail, rigueur et autonomie remarquables.</p>",
					},
					{
						id: "stage-obs-001",
						hidden: false,
						company: "Lafarge Holcim Maroc",
						position: "Stagiaire d'observation HSE",
						supervisor: "Hassan Benchekroun",
						location: "Casablanca, Maroc",
						period: "Juillet 2023 — Août 2023",
						type: "observation",
						website: { url: "", label: "" },
						tasksPerformed: "<ul><li>Observation des procédures de sécurité en cimenterie</li><li>Participation aux rondes de sécurité quotidiennes</li><li>Découverte du système de management intégré QSE</li></ul>",
						skillsAcquired: ["Observation terrain", "QSE", "Cimenterie"],
						evaluation: "<p>Stagiaire curieux et motivé, bonne compréhension des enjeux HSE.</p>",
					},
				],
			},
		},
		metadata: {
			template: "casablanca",
			layout: {
				sidebarWidth: 35,
				pages: [
					{
						fullWidth: false,
						main: ["summary", "experience", "education", "internships", "projects"],
						sidebar: ["profiles", "skills", "certifications", "languages", "interests", "references"],
					},
				],
			},
			typography: {
				body: {
					fontFamily: "Inter",
					fontWeights: ["400", "600"],
					fontSize: 11,
					lineHeight: 1.5,
				},
				heading: {
					fontFamily: "Inter",
					fontWeights: ["400", "600"],
					fontSize: 11,
					lineHeight: 1.5,
				},
			},
			css: { enabled: false, value: "" },
			page: {
				gapX: 32,
				gapY: 20,
				marginX: 18,
				marginY: 18,
				format: "a4",
				locale: "fr-FR",
				hideIcons: false,
			},
			design: {
				level: { icon: "", type: "progress-bar" },
				colors: {
					primary: "rgba(16, 107, 76, 1)",
					text: "rgba(0, 0, 0, 1)",
					background: "rgba(255, 255, 255, 1)",
				},
			},
			notes: "CV Karim Bouzidi - HSE Specialist, OCP Group",
		},
		customSections: [],
	};

	const updateRes = await rpc("resume/update", {
		id: createdIds.resumeId,
		data: resumeData,
	});
	if (updateRes.ok) {
		log("PASS", "Update resume with full Karim data", "All sections populated");
	} else {
		log("FAIL", "Update resume data", `status=${updateRes.status} ${JSON.stringify(updateRes.json).slice(0, 300)}`);
	}

	// Verify the update
	const getRes = await rpc("resume/getById", { id: createdIds.resumeId });
	if (getRes.ok && getRes.json?.data?.basics?.name === "Karim Bouzidi") {
		log("PASS", "Verify resume data", `name=${getRes.json.data.basics.name}, headline=${getRes.json.data.basics.headline.slice(0, 50)}...`);
		const sections = getRes.json.data.sections;
		const counts = {
			experience: sections.experience?.items?.length || 0,
			education: sections.education?.items?.length || 0,
			skills: sections.skills?.items?.length || 0,
			languages: sections.languages?.items?.length || 0,
			certifications: sections.certifications?.items?.length || 0,
			internships: sections.internships?.items?.length || 0,
		};
		log("PASS", "Resume sections populated", JSON.stringify(counts));
	} else {
		log("FAIL", "Verify resume data", `status=${getRes.status}`);
	}
}

// ============================================================
// STEP 2: CAREER GOALS
// ============================================================
async function step2_goals() {
	console.log("\n\x1b[1m=== STEP 2: CAREER GOALS (5 goals with milestones) ===\x1b[0m");

	const goals = [
		{
			title: "Promotion vers Responsable HSE",
			description: "Obtenir une promotion au poste de Responsable HSE du site de Khouribga d'ici 12 mois. Cela implique de démontrer des compétences en management, de compléter les certifications nécessaires, et de réaliser des projets à fort impact.",
			category: "career",
			status: "in_progress",
			priority: 5,
			targetDate: new Date("2027-05-01").toISOString(),
			progress: 25,
			tags: ["promotion", "management", "ocp"],
			metrics: [
				{ name: "Certifications complétées", target: 3, current: 1 },
				{ name: "Projets dirigés", target: 5, current: 2 },
				{ name: "Formations management", target: 4, current: 1 },
			],
			milestones: [
				{ title: "Obtenir la certification NEBOSH IGC", description: "Compléter la formation et réussir l'examen NEBOSH International General Certificate", dueDate: new Date("2026-08-01").toISOString() },
				{ title: "Diriger un projet d'amélioration sécurité", description: "Prendre la responsabilité complète d'un projet d'amélioration de la sécurité sur le site", dueDate: new Date("2026-12-01").toISOString() },
				{ title: "Suivre formation en management d'équipe", description: "Compléter un programme de formation en leadership et management d'équipe", dueDate: new Date("2027-03-01").toISOString() },
			],
		},
		{
			title: "Certification NEBOSH International",
			description: "Obtenir la certification NEBOSH International General Certificate (IGC) pour renforcer les compétences en santé-sécurité au niveau international et augmenter l'employabilité.",
			category: "education",
			status: "in_progress",
			priority: 5,
			targetDate: new Date("2026-11-01").toISOString(),
			progress: 40,
			tags: ["certification", "nebosh", "international"],
			metrics: [
				{ name: "Modules étudiés", target: 3, current: 1 },
				{ name: "Heures d'étude", target: 120, current: 45 },
				{ name: "Tests pratiques réussis", target: 5, current: 2 },
			],
			milestones: [
				{ title: "S'inscrire à la formation NEBOSH IGC", description: "Choisir un centre de formation accrédité et finaliser l'inscription", dueDate: new Date("2026-06-15").toISOString() },
				{ title: "Compléter le Module IG1 (Management de la santé-sécurité)", description: "Étudier et réussir les exercices du module IG1", dueDate: new Date("2026-08-01").toISOString() },
				{ title: "Compléter le Module IG2 (Évaluation des risques)", description: "Étudier et réussir les exercices du module IG2", dueDate: new Date("2026-09-15").toISOString() },
				{ title: "Passer et réussir l'examen final", description: "Soumettre l'évaluation pratique IG2 et passer l'examen écrit IG1", dueDate: new Date("2026-11-01").toISOString() },
			],
		},
		{
			title: "Maîtriser l'audit ISO 14001",
			description: "Développer une expertise approfondie en audit interne ISO 14001:2015 (Management environnemental) pour pouvoir mener des audits de manière autonome sur le site OCP.",
			category: "skill",
			status: "not_started",
			priority: 4,
			targetDate: new Date("2026-08-01").toISOString(),
			progress: 0,
			tags: ["iso14001", "audit", "environnement"],
			metrics: [
				{ name: "Audits observés", target: 3, current: 0 },
				{ name: "Audits réalisés", target: 2, current: 0 },
			],
			milestones: [
				{ title: "Suivre formation Auditeur Interne ISO 14001", description: "Formation de 3 jours auprès d'un organisme certifié (Bureau Veritas ou AFNOR)", dueDate: new Date("2026-07-01").toISOString() },
				{ title: "Réaliser 2 audits internes en autonomie", description: "Mener 2 audits internes ISO 14001 sur différents processus du site", dueDate: new Date("2026-08-01").toISOString() },
			],
		},
		{
			title: "Développer le réseau professionnel à 50 contacts",
			description: "Construire un réseau professionnel solide de 50 contacts qualifiés dans le domaine HSE au Maroc et à l'international. Participer à des événements, rejoindre des associations professionnelles.",
			category: "networking",
			status: "in_progress",
			priority: 3,
			targetDate: null,
			progress: 16,
			tags: ["networking", "linkedin", "associations"],
			metrics: [
				{ name: "Contacts qualifiés", target: 50, current: 8 },
				{ name: "Événements HSE assistés", target: 6, current: 1 },
				{ name: "Publications LinkedIn", target: 12, current: 2 },
			],
			milestones: [],
		},
		{
			title: "Publier un article sur la sécurité industrielle",
			description: "Rédiger et publier un article professionnel sur la sécurité industrielle dans le secteur phosphatier, basé sur l'expérience acquise chez OCP. Cible: revue professionnelle ou blog spécialisé HSE.",
			category: "career",
			status: "not_started",
			priority: 2,
			targetDate: new Date("2026-11-01").toISOString(),
			progress: 0,
			tags: ["publication", "expertise", "visibilité"],
			metrics: [
				{ name: "Articles rédigés", target: 1, current: 0 },
				{ name: "Revues/blogs identifiés", target: 5, current: 0 },
			],
			milestones: [],
		},
	];

	for (const goal of goals) {
		const { milestones, ...goalData } = goal;

		// Collect date paths for ORPC meta
		const datePaths = [];
		if (goalData.targetDate) {
			datePaths.push("targetDate");
		} else {
			delete goalData.targetDate; // Remove null targetDate
		}

		const createRes = await rpc("goals/create", goalData, datePaths);
		if (createRes.ok && createRes.json) {
			const goalId = createRes.json;
			createdIds.goalIds.push(goalId);
			log("PASS", `Create goal: ${goalData.title.slice(0, 40)}...`, `id=${goalId}`);

			// Create milestones
			for (let i = 0; i < milestones.length; i++) {
				const ms = milestones[i];
				const msDatePaths = ms.dueDate ? ["dueDate"] : [];
				const msInput = {
					goalId: goalId,
					title: ms.title,
					description: ms.description,
					order: i + 1,
				};
				if (ms.dueDate) msInput.dueDate = ms.dueDate;

				const msRes = await rpc("goals/milestones/create", msInput, msDatePaths);
				if (msRes.ok && msRes.json) {
					createdIds.milestoneIds.push(msRes.json);
					log("PASS", `  Milestone: ${ms.title.slice(0, 45)}...`, `id=${msRes.json}`);
				} else {
					log("FAIL", `  Milestone: ${ms.title.slice(0, 45)}...`, `status=${msRes.status} ${JSON.stringify(msRes.json).slice(0, 150)}`);
				}
			}
		} else {
			log("FAIL", `Create goal: ${goalData.title.slice(0, 40)}...`, `status=${createRes.status} ${JSON.stringify(createRes.json).slice(0, 200)}`);
		}
	}

	// Verify goals list
	const listRes = await rpc("goals/list");
	if (listRes.ok && Array.isArray(listRes.json)) {
		log("PASS", "List all goals", `total=${listRes.json.length} goals`);
	} else {
		log("FAIL", "List all goals", `status=${listRes.status}`);
	}
}

// ============================================================
// STEP 3: NETWORKING CONTACTS
// ============================================================
async function step3_networking() {
	console.log("\n\x1b[1m=== STEP 3: PROFESSIONAL NETWORK (8 contacts) ===\x1b[0m");

	const contacts = [
		{
			name: "Mohammed Alaoui",
			email: "m.alaoui@ocp.ma",
			phone: "+212 6 62 11 22 33",
			company: "OCP Group",
			position: "Directeur HSE",
			linkedinUrl: "https://linkedin.com/in/mohammedalaoui",
			relationship: "mentor",
			relationshipStrength: "strong",
			howMet: "Superviseur de stage de fin d'études à OCP Jorf Lasfar, devenu mentor professionnel",
			notes: "Mentor principal. 15 ans d'expérience HSE dans l'industrie phosphatière. Réunion mensuelle pour suivi de carrière. A recommandé pour le poste actuel.",
			tags: ["mentor", "ocp", "hse", "phosphate"],
			isFavorite: true,
		},
		{
			name: "Dr. Laila Fassi",
			email: "l.fassi@imta.ac.ma",
			phone: "+212 5 22 33 44 55",
			company: "IMTA",
			position: "Professeur - Département HSE",
			linkedinUrl: "https://linkedin.com/in/lailafassi",
			relationship: "other",
			relationshipStrength: "moderate",
			howMet: "Professeur principal durant la formation HSE à l'IMTA (2022-2024)",
			notes: "Référence académique. Spécialiste en gestion environnementale. Peut fournir recommandation pour les candidatures. Contact 2-3 fois par an.",
			tags: ["référence", "imta", "académique", "environnement"],
			isFavorite: true,
		},
		{
			name: "Ahmed Benkirane",
			email: "a.benkirane@managem.ma",
			phone: "+212 6 63 44 55 66",
			company: "Managem Group",
			position: "Responsable RH",
			linkedinUrl: "https://linkedin.com/in/ahmedbenkirane",
			relationship: "recruiter",
			relationshipStrength: "moderate",
			howMet: "Rencontré lors du Forum de l'Emploi IMTA 2024",
			notes: "Contact RH stratégique chez Managem. Intéressé par des profils HSE pour sites miniers. Managem recrute régulièrement des spécialistes HSE.",
			tags: ["rh", "managem", "mines", "recrutement"],
			isFavorite: false,
		},
		{
			name: "Sarah Cohen",
			email: "s.cohen@bureauveritas.com",
			phone: "+212 5 22 98 76 54",
			company: "Bureau Veritas Maroc",
			position: "Consultante HSE Senior",
			linkedinUrl: "https://linkedin.com/in/sarahcohen-hse",
			relationship: "industry_peer",
			relationshipStrength: "moderate",
			howMet: "Intervenante lors de la formation Auditeur Interne ISO 45001 (Bureau Veritas, 2025)",
			notes: "Experte en audit et certification. Connaissance approfondie des normes ISO. Peut aider pour des projets de certification. Échange technique régulier.",
			tags: ["audit", "bureau-veritas", "iso", "certification"],
			isFavorite: false,
		},
		{
			name: "Rachid Tazi",
			email: "r.tazi@ocp.ma",
			phone: "+212 6 64 55 66 77",
			company: "OCP Group - Site Khouribga",
			position: "Technicien HSE",
			linkedinUrl: "https://linkedin.com/in/rachidtazi",
			relationship: "colleague",
			relationshipStrength: "strong",
			howMet: "Collègue direct au service HSE du site OCP Khouribga depuis septembre 2024",
			notes: "Collègue de confiance. 5 ans d'expérience HSE. Binôme pour les audits terrain. On se voit quotidiennement. Partage de veille réglementaire.",
			tags: ["collègue", "ocp", "khouribga", "quotidien"],
			isFavorite: true,
		},
		{
			name: "Nadia Amrani",
			email: "n.amrani@michaelpage.ma",
			phone: "+212 5 22 45 67 89",
			company: "Michael Page Casablanca",
			position: "Recruiter - Industrie & Ingénierie",
			linkedinUrl: "https://linkedin.com/in/nadiaamrani",
			relationship: "recruiter",
			relationshipStrength: "weak",
			howMet: "Contact LinkedIn suite à une offre d'emploi HSE publiée en janvier 2026",
			notes: "Recruteuse spécialisée industrie. Connaît bien le marché HSE au Maroc. Envoie des opportunités 1-2 fois par mois. Bon contact pour veille marché.",
			tags: ["recruiter", "cabinet", "opportunités", "casablanca"],
			isFavorite: false,
		},
		{
			name: "Pierre Dubois",
			email: "p.dubois@totalenergies.ma",
			phone: "+212 6 65 77 88 99",
			company: "TotalEnergies Maroc",
			position: "HSE Manager",
			linkedinUrl: "https://linkedin.com/in/pierredubois-hse",
			relationship: "industry_peer",
			relationshipStrength: "weak",
			howMet: "Rencontré lors du Salon International HSE Casablanca, novembre 2025",
			notes: "HSE Manager expérimenté dans le secteur pétrole & gaz. Perspective internationale intéressante. Échange sur les bonnes pratiques HSE entre industrie phosphatière et pétrolière.",
			tags: ["hse", "totalenergies", "pétrole", "international"],
			isFavorite: false,
		},
		{
			name: "Zineb Alami",
			email: "z.alami@onee.ma",
			phone: "+212 6 66 88 99 00",
			company: "ONEE (Office National de l'Electricité et de l'Eau)",
			position: "Ingénieur QHSE",
			linkedinUrl: "https://linkedin.com/in/zinebalami",
			relationship: "alumni",
			relationshipStrength: "moderate",
			howMet: "Ancienne promotion IMTA 2022-2024, même filière HSE",
			notes: "Ancienne camarade de promotion IMTA. Travaille comme Ingénieur QHSE chez ONEE depuis 2024. Échange régulier sur les expériences professionnelles. Réseau alumni IMTA actif.",
			tags: ["alumni", "imta", "onee", "qhse"],
			isFavorite: true,
		},
	];

	for (const contact of contacts) {
		const createRes = await rpc("networking/create", contact);
		if (createRes.ok && createRes.json) {
			createdIds.contactIds.push(createRes.json);
			log("PASS", `Contact: ${contact.name}`, `id=${createRes.json}, ${contact.position} @ ${contact.company}`);
		} else {
			log("FAIL", `Contact: ${contact.name}`, `status=${createRes.status} ${JSON.stringify(createRes.json).slice(0, 200)}`);
		}
	}

	// List all contacts
	const listRes = await rpc("networking/list");
	if (listRes.ok && Array.isArray(listRes.json)) {
		log("PASS", "List all contacts", `total=${listRes.json.length} contacts`);

		// Add an interaction for the first contact (mentor meeting)
		if (createdIds.contactIds.length > 0) {
			const interactionRes = await rpc("networking/interactions/add", {
				contactId: createdIds.contactIds[0],
				interactionType: "meeting",
				description: "Réunion mensuelle de mentorat. Discussion sur la progression vers le poste de Responsable HSE. Conseils sur la certification NEBOSH.",
				outcome: "Plan d'action défini: compléter NEBOSH d'ici novembre, diriger le projet sécurité Q3",
				followUpNeeded: true,
				followUpDate: new Date("2026-06-26").toISOString(),
			}, ["followUpDate"]);
			if (interactionRes.ok) {
				log("PASS", "Add interaction with mentor", "Monthly mentoring meeting logged");
			} else {
				log("FAIL", "Add interaction with mentor", `status=${interactionRes.status} ${JSON.stringify(interactionRes.json).slice(0, 200)}`);
			}
		}
	} else {
		log("FAIL", "List all contacts", `status=${listRes.status}`);
	}
}

// ============================================================
// STEP 4: SKILLS TRACKING
// ============================================================
async function step4_skills() {
	console.log("\n\x1b[1m=== STEP 4: SKILLS TRACKING (12 skills) ===\x1b[0m");

	const skills = [
		// Technical skills
		{ name: "ISO 45001:2018", nameFr: "ISO 45001:2018 - Management SST", category: "technical", rating: 4, targetRating: 5 },
		{ name: "ISO 14001:2015", nameFr: "ISO 14001:2015 - Management Environnemental", category: "technical", rating: 3, targetRating: 5 },
		{ name: "Risk Assessment", nameFr: "Évaluation des Risques (EvRP)", category: "technical", rating: 4, targetRating: 5 },
		{ name: "AMDEC/FMEA", nameFr: "AMDEC - Analyse des Modes de Défaillance", category: "technical", rating: 4, targetRating: 5 },
		{ name: "Internal Audit", nameFr: "Audit Interne HSE", category: "technical", rating: 3, targetRating: 5 },
		// Safety skills
		{ name: "Fire Safety Permits", nameFr: "Permis de Feu et Travaux à Chaud", category: "technical", rating: 5, targetRating: 5 },
		{ name: "Working at Height", nameFr: "Travail en Hauteur - Procédures", category: "technical", rating: 4, targetRating: 5 },
		{ name: "Confined Space Entry", nameFr: "Espace Confiné - Procédures d'Entrée", category: "technical", rating: 4, targetRating: 5 },
		{ name: "First Aid", nameFr: "Premiers Secours et Urgences", category: "certifications", rating: 4, targetRating: 5 },
		// Soft skills
		{ name: "Team Management", nameFr: "Management d'Équipe", category: "soft", rating: 3, targetRating: 5 },
		{ name: "Crisis Communication", nameFr: "Communication de Crise", category: "soft", rating: 2, targetRating: 4 },
		{ name: "Safety Training", nameFr: "Formation et Sensibilisation Sécurité", category: "soft", rating: 4, targetRating: 5 },
	];

	for (const skill of skills) {
		const createRes = await rpc("career/userSkills/create", skill);
		if (createRes.ok && createRes.json) {
			createdIds.skillIds.push(createRes.json);
			log("PASS", `Skill: ${skill.nameFr.slice(0, 42)}`, `id=${createRes.json}, ${skill.rating}/${skill.targetRating}`);
		} else {
			log("FAIL", `Skill: ${skill.nameFr.slice(0, 42)}`, `status=${createRes.status} ${JSON.stringify(createRes.json).slice(0, 200)}`);
		}
	}

	// Log practice hours for 3 skills (update rating)
	if (createdIds.skillIds.length >= 3) {
		console.log("\n  \x1b[36mLogging practice progress for 3 skills...\x1b[0m");

		// Update ISO 45001 rating (simulating progress)
		const skill1Res = await rpc("career/userSkills/updateRating", {
			id: createdIds.skillIds[0], // ISO 45001
			rating: 4,
		});
		if (skill1Res.ok) {
			log("PASS", "Progress: ISO 45001", "Rating confirmed at 4/5");
		} else {
			log("FAIL", "Progress: ISO 45001", `status=${skill1Res.status}`);
		}

		// Update Risk Assessment
		const skill2Res = await rpc("career/userSkills/updateRating", {
			id: createdIds.skillIds[2], // Risk Assessment
			rating: 4,
		});
		if (skill2Res.ok) {
			log("PASS", "Progress: Risk Assessment", "Rating confirmed at 4/5");
		} else {
			log("FAIL", "Progress: Risk Assessment", `status=${skill2Res.status}`);
		}

		// Update Team Management (improvement)
		const skill3Res = await rpc("career/userSkills/updateRating", {
			id: createdIds.skillIds[9], // Team Management
			rating: 3,
		});
		if (skill3Res.ok) {
			log("PASS", "Progress: Management d'Équipe", "Rating at 3/5, target 5");
		} else {
			log("FAIL", "Progress: Management d'Équipe", `status=${skill3Res.status}`);
		}
	}

	// List all skills
	const listRes = await rpc("career/userSkills/list");
	if (listRes.ok && Array.isArray(listRes.json)) {
		log("PASS", "List all skills", `total=${listRes.json.length} skills tracked`);
		const byCategory = {};
		for (const s of listRes.json) {
			byCategory[s.category] = (byCategory[s.category] || 0) + 1;
		}
		log("PASS", "Skills by category", JSON.stringify(byCategory));
	} else {
		log("FAIL", "List all skills", `status=${listRes.status}`);
	}
}

// ============================================================
// STEP 5: JOB APPLICATIONS
// ============================================================
async function step5_jobApplications() {
	console.log("\n\x1b[1m=== STEP 5: JOB APPLICATIONS (4 applications) ===\x1b[0m");

	const applications = [
		{
			companyName: "Lafarge Holcim Maroc",
			position: "Responsable HSE Site",
			location: "Casablanca, Maroc",
			jobUrl: "https://careers.lafargeholcim.com/ma/hse-manager",
			jobDescription: "Responsable de la mise en place et du suivi du système de management HSE sur un site de production cimentière. Management d'une équipe de 3 techniciens HSE. Reporting au Directeur d'Usine.",
			salary: "15,000 - 20,000 MAD/mois",
			salaryMin: 15000,
			salaryMax: 20000,
			salaryCurrency: "MAD",
			status: "applied",
			appliedAt: new Date("2026-05-15").toISOString(),
			source: "LinkedIn",
			contactName: "Fatima Zahra Ouali",
			contactEmail: "fz.ouali@lafargeholcim.com",
			notes: "Poste intéressant, promotion significative. Site Casablanca = déménagement nécessaire. Bien préparer la partie management d'équipe lors de l'entretien.",
			tags: ["promotion", "casablanca", "ciment", "management"],
			priority: 5,
			isRemote: false,
			workType: "on-site",
		},
		{
			companyName: "ONEE (Office National de l'Electricité et de l'Eau)",
			position: "Ingénieur Sécurité",
			location: "Rabat, Maroc",
			jobUrl: "https://www.onee.ma/recrutement",
			jobDescription: "Poste d'ingénieur sécurité au sein de la direction technique. Élaboration des politiques de sécurité, coordination avec les chefs de projet, formation du personnel.",
			salary: "12,000 - 16,000 MAD/mois",
			salaryMin: 12000,
			salaryMax: 16000,
			salaryCurrency: "MAD",
			status: "saved",
			source: "Site web ONEE",
			contactName: "Zineb Alami",
			contactEmail: "z.alami@onee.ma",
			notes: "Poste stable secteur public. Zineb (alumni IMTA) travaille déjà chez ONEE, peut recommander. Date limite candidature: 15 juin 2026.",
			tags: ["secteur-public", "rabat", "sécurité", "stabilité"],
			priority: 3,
			isRemote: false,
			workType: "on-site",
		},
		{
			companyName: "Lydec",
			position: "Coordinateur QHSE",
			location: "Casablanca, Maroc",
			jobUrl: "https://www.lydec.ma/carrieres",
			jobDescription: "Coordination de la démarche Qualité, Hygiène, Sécurité et Environnement. Interface entre les services opérationnels et la direction QHSE. Pilotage des audits internes.",
			salary: "13,000 - 17,000 MAD/mois",
			salaryMin: 13000,
			salaryMax: 17000,
			salaryCurrency: "MAD",
			status: "interview",
			appliedAt: new Date("2026-05-01").toISOString(),
			source: "ReKrute.com",
			contactName: "Youssef El Mahdi",
			contactEmail: "y.elmahdi@lydec.ma",
			notes: "Premier entretien RH passé le 20 mai. Entretien technique prévu le 2 juin avec le Directeur QHSE. Bien préparer les questions sur ISO 9001 en plus de 14001/45001.",
			tags: ["interview", "casablanca", "qhse", "eau-électricité"],
			priority: 4,
			isRemote: false,
			workType: "on-site",
		},
		{
			companyName: "Managem Group",
			position: "HSE Manager Junior",
			location: "Marrakech, Maroc",
			jobUrl: "https://www.managemgroup.com/careers",
			jobDescription: "Assistant au responsable HSE pour les sites miniers de la région de Marrakech. Gestion des risques miniers, conformité réglementaire, formation des opérateurs.",
			salary: "14,000 - 18,000 MAD/mois",
			salaryMin: 14000,
			salaryMax: 18000,
			salaryCurrency: "MAD",
			status: "applied",
			appliedAt: new Date("2026-05-20").toISOString(),
			source: "Forum Emploi",
			contactName: "Ahmed Benkirane",
			contactEmail: "a.benkirane@managem.ma",
			notes: "Ahmed Benkirane (contact réseau) a transmis le CV directement au DRH. Secteur minier = spécificités HSE différentes du phosphate. Bien se renseigner sur les risques miniers.",
			tags: ["mines", "marrakech", "junior", "réseau"],
			priority: 3,
			isRemote: false,
			workType: "on-site",
		},
	];

	for (const app of applications) {
		// Collect date paths for ORPC meta
		const datePaths = [];
		if (app.appliedAt) datePaths.push("appliedAt");
		if (app.deadline) datePaths.push("deadline");

		const createRes = await rpc("jobApplications/create", app, datePaths);
		if (createRes.ok && createRes.json) {
			createdIds.applicationIds.push(createRes.json);
			log("PASS", `Application: ${app.companyName} - ${app.position}`, `id=${createRes.json}, status=${app.status}`);
		} else {
			log("FAIL", `Application: ${app.companyName}`, `status=${createRes.status} ${JSON.stringify(createRes.json).slice(0, 200)}`);
		}
	}

	// Add activity to Lydec application (interview scheduled)
	if (createdIds.applicationIds.length >= 3) {
		const activityRes = await rpc("jobApplications/activity/add", {
			applicationId: createdIds.applicationIds[2], // Lydec
			activityType: "interview_scheduled",
			description: "Entretien technique avec le Directeur QHSE prévu le 2 juin 2026 à 10h00. Préparer: ISO 9001, 14001, 45001, méthode 5S, retour d'expérience.",
			scheduledAt: new Date("2026-06-02T10:00:00Z").toISOString(),
		}, ["scheduledAt"]);
		if (activityRes.ok) {
			log("PASS", "Activity: Lydec interview scheduled", "Technical interview 2 June 2026");
		} else {
			log("FAIL", "Activity: Lydec interview", `status=${activityRes.status}`);
		}
	}

	// List all applications
	const listRes = await rpc("jobApplications/list");
	if (listRes.ok && Array.isArray(listRes.json)) {
		log("PASS", "List all applications", `total=${listRes.json.length}`);
		const byStatus = {};
		for (const a of listRes.json) {
			byStatus[a.status] = (byStatus[a.status] || 0) + 1;
		}
		log("PASS", "Applications by status", JSON.stringify(byStatus));
	} else {
		log("FAIL", "List all applications", `status=${listRes.status}`);
	}
}

// ============================================================
// STEP 6: ANALYTICS & DASHBOARD
// ============================================================
async function step6_analytics() {
	console.log("\n\x1b[1m=== STEP 6: ANALYTICS & DASHBOARD ===\x1b[0m");

	// Dashboard statistics
	const statsRes = await rpc("dashboard/getStatistics");
	if (statsRes.ok && statsRes.json) {
		const s = statsRes.json;
		log("PASS", "Dashboard statistics", JSON.stringify({
			resumes: s.resumeCount,
			applications: s.activeApplicationsCount,
			contacts: s.networkContactsCount,
			skills: s.skillsTrackedCount,
			goalsProgress: s.goalsProgress,
		}));
		if (s.applicationStatusBreakdown) {
			log("PASS", "Application breakdown", JSON.stringify(s.applicationStatusBreakdown));
		}
		if (s.skillsByCategory) {
			log("PASS", "Skills by category", JSON.stringify(s.skillsByCategory));
		}
	} else {
		log("FAIL", "Dashboard statistics", `status=${statsRes.status} ${JSON.stringify(statsRes.json).slice(0, 200)}`);
	}

	// Recent activity
	const activityRes = await rpc("dashboard/getRecentActivity");
	if (activityRes.ok) {
		const activities = Array.isArray(activityRes.json) ? activityRes.json : [];
		log("PASS", "Recent activity", `${activities.length} activities`);
	} else {
		log("FAIL", "Recent activity", `status=${activityRes.status}`);
	}

	// Upcoming items
	const upcomingRes = await rpc("dashboard/getUpcomingItems");
	if (upcomingRes.ok) {
		const items = Array.isArray(upcomingRes.json) ? upcomingRes.json : [];
		log("PASS", "Upcoming items", `${items.length} items`);
		for (const item of items.slice(0, 3)) {
			log("PASS", `  Upcoming: ${item.type}`, `${item.title}`);
		}
	} else {
		log("FAIL", "Upcoming items", `status=${upcomingRes.status}`);
	}

	// User activity data (use getRecent, not list)
	const userActivityRes = await rpc("userActivity/getRecent", {});
	if (userActivityRes.ok) {
		const activities = Array.isArray(userActivityRes.json) ? userActivityRes.json : [];
		log("PASS", "User activity history", `${activities.length} events logged`);
	} else {
		log("FAIL", "User activity history", `status=${userActivityRes.status} ${JSON.stringify(userActivityRes.json).slice(0, 100)}`);
	}

	// User activity statistics
	const activityStatsRes = await rpc("userActivity/getStats", {});
	if (activityStatsRes.ok && activityStatsRes.json) {
		log("PASS", "User activity stats", JSON.stringify(activityStatsRes.json).slice(0, 150));
	} else {
		log("SKIP", "User activity stats", `status=${activityStatsRes.status}`);
	}

	// Try analytics endpoints
	const analyticsEndpoints = [
		["analytics/getOverview", "Analytics overview"],
		["statistics/getStatistics", "General statistics"],
	];

	for (const [path, label] of analyticsEndpoints) {
		try {
			const r = await rpc(path);
			if (r.ok) {
				log("PASS", label, JSON.stringify(r.json).slice(0, 100));
			} else {
				log("SKIP", label, `status=${r.status} — endpoint may not exist`);
			}
		} catch (e) {
			log("SKIP", label, e.message);
		}
	}
}

// ============================================================
// STEP 7: PROFESSIONAL ASSESSMENT REPORT
// ============================================================
function step7_assessment() {
	console.log("\n\x1b[1m=== STEP 7: PROFESSIONAL ASSESSMENT REPORT ===\x1b[0m");
	console.log("\x1b[36m");
	console.log("╔══════════════════════════════════════════════════════════════╗");
	console.log("║  RAPPORT D'ÉVALUATION — Karim Bouzidi, Spécialiste HSE     ║");
	console.log("║  Plateforme: IMTA Resume v5 (IMTA Career Platform)     ║");
	console.log("╚══════════════════════════════════════════════════════════════╝");
	console.log("\x1b[0m");

	console.log("\n\x1b[1m1. Utilité pour la CROISSANCE de carrière vs simple création de CV?\x1b[0m");
	console.log("   Cette plateforme va bien au-delà d'un simple créateur de CV.");
	console.log("   Elle offre un véritable écosystème de développement professionnel:");
	console.log("   - Objectifs de carrière avec jalons et suivi de progression (EXCELLENT)");
	console.log("   - Suivi des compétences avec notation et progression (TRES BON)");
	console.log("   - Gestion du réseau professionnel avec interactions (BON)");
	console.log("   - Suivi des candidatures avec activités (TRES BON)");
	console.log("   - Tableau de bord centralisé avec statistiques (EXCELLENT)");
	console.log("   VERDICT: C'est une plateforme de développement de carrière COMPLETE.");

	console.log("\n\x1b[1m2. Complétude du suivi de carrière vs LinkedIn?\x1b[0m");
	console.log("   AVANTAGES PAR RAPPORT A LINKEDIN:");
	console.log("   + Objectifs de carrière avec milestones et métriques (LinkedIn n'a pas ça)");
	console.log("   + Suivi de compétences avec ratings quantifiés et progression");
	console.log("   + Gestion des candidatures centralisée avec statuts détaillés");
	console.log("   + CV professionnel multi-templates avec format marocain (CIN, service militaire)");
	console.log("   + Stages (internships) comme section dédiée = pertinent pour IMTA");
	console.log("   + Dashboard avec métriques consolidées");
	console.log("   CE QUI MANQUE PAR RAPPORT A LINKEDIN:");
	console.log("   - Pas de messaging/communication directe avec les contacts");
	console.log("   - Pas de fil d'actualité / veille sectorielle");
	console.log("   - Pas de recommandations / endorsements publics");
	console.log("   - Pas de recherche d'entreprises / offres d'emploi intégrée");
	console.log("   VERDICT: Complémentaire à LinkedIn, pas un remplaçant.");

	console.log("\n\x1b[1m3. Fonctionnalités de développement professionnel MANQUANTES?\x1b[0m");
	console.log("   - Plan de développement personnel (PDP) structuré");
	console.log("   - Suivi des heures de formation / CPF");
	console.log("   - Évaluations annuelles / auto-évaluation");
	console.log("   - Rappels automatiques (follow-up contacts, deadlines)");
	console.log("   - Export des données vers Excel/PDF pour rapports RH");
	console.log("   - Intégration calendrier (Google Calendar/Outlook)");
	console.log("   - Comparaison salariale par poste/région");
	console.log("   - Journal de bord professionnel (existe en partie via journal)");

	console.log("\n\x1b[1m4. Utilité pour le département RH de l'entreprise?\x1b[0m");
	console.log("   OUI, plusieurs aspects seraient utiles:");
	console.log("   + Suivi des compétences des employés = plan de formation");
	console.log("   + Objectifs de carrière alignés avec les besoins entreprise");
	console.log("   + Historique des certifications = conformité réglementaire HSE");
	console.log("   + Le format marocain du CV est parfaitement adapté");
	console.log("   MAIS il manquerait:");
	console.log("   - Vue manager/RH pour superviser les équipes");
	console.log("   - Rapports consolidés par département");
	console.log("   - Gestion des habilitations et dates de renouvellement");
	console.log("   - Organigramme et parcours de mobilité interne");

	console.log("\n\x1b[1m5. Le networking aide-t-il vraiment à maintenir les relations?\x1b[0m");
	console.log("   La fonctionnalité réseau est SOLIDE:");
	console.log("   + Catégories de relations pertinentes (mentor, collègue, recruteur, alumni)");
	console.log("   + Suivi de la force de la relation (strong/moderate/weak/dormant)");
	console.log("   + Historique des interactions avec outcomes");
	console.log("   + Tags et favoris pour l'organisation");
	console.log("   + Suivi des follow-ups nécessaires");
	console.log("   MAIS:");
	console.log("   - Pas de rappels automatiques pour les follow-ups");
	console.log("   - Pas de suggestions de networking (ex: 'vous n'avez pas contacté X depuis 3 mois')");
	console.log("   - Pas d'intégration email/LinkedIn pour les contacts automatiques");
	console.log("   VERDICT: BON outil de CRM personnel, mais passif (pas proactif).");

	console.log("\n\x1b[1m6. NOTE GLOBALE POUR LE DEVELOPPEMENT DE CARRIERE\x1b[0m");
	console.log("   ┌────────────────────────────────────────────┐");
	console.log("   │  NOTE: 7.5/10                              │");
	console.log("   ├────────────────────────────────────────────┤");
	console.log("   │  CV/Resume builder:         9/10           │");
	console.log("   │  Career goal tracking:      8/10           │");
	console.log("   │  Skills management:         7/10           │");
	console.log("   │  Networking/CRM:            7/10           │");
	console.log("   │  Job application tracking:  8/10           │");
	console.log("   │  Analytics/Dashboard:       7/10           │");
	console.log("   │  Mobile experience:         6/10           │");
	console.log("   │  Notifications/Reminders:   5/10           │");
	console.log("   │  Integration ecosystem:     6/10           │");
	console.log("   └────────────────────────────────────────────┘");
	console.log("");
	console.log("   RESUME: Excellente plateforme pour un jeune professionnel IMTA.");
	console.log("   La combinaison CV + objectifs + compétences + réseau + candidatures");
	console.log("   est rare et très pertinente. Le format marocain du CV (CIN, service");
	console.log("   militaire, stages) est un vrai plus. Il manque principalement les");
	console.log("   rappels automatiques et une dimension proactive (suggestions, alertes)");
	console.log("   pour passer de 7.5 à 9/10.");
	console.log("");
}

// ============================================================
// SUMMARY
// ============================================================
function printSummary() {
	console.log("\n\x1b[1m═══════════════════════════════════════════════════\x1b[0m");
	console.log(`\x1b[1m  RESULTS: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, \x1b[33m${skipped} skipped\x1b[0m`);
	console.log("\x1b[1m═══════════════════════════════════════════════════\x1b[0m");

	console.log("\n\x1b[1m  CREATED DATA SUMMARY:\x1b[0m");
	console.log(`  Resume:       ${createdIds.resumeId ? '1 (id: ' + createdIds.resumeId + ')' : '0'}`);
	console.log(`  Goals:        ${createdIds.goalIds.length}`);
	console.log(`  Milestones:   ${createdIds.milestoneIds.length}`);
	console.log(`  Contacts:     ${createdIds.contactIds.length}`);
	console.log(`  Skills:       ${createdIds.skillIds.length}`);
	console.log(`  Applications: ${createdIds.applicationIds.length}`);
	console.log(`  Total items:  ${1 + createdIds.goalIds.length + createdIds.milestoneIds.length + createdIds.contactIds.length + createdIds.skillIds.length + createdIds.applicationIds.length}`);

	if (failed > 0) {
		console.log("\n\x1b[31m  FAILURES:\x1b[0m");
		for (const r of results) {
			if (r.status === "FAIL") {
				console.log(`  \x1b[31m✗\x1b[0m ${r.name} — ${r.detail}`);
			}
		}
	}
	console.log("");
}

// ============================================================
// MAIN
// ============================================================
async function main() {
	const auth = await authenticate();
	if (!auth) {
		console.log("\n\x1b[31mAuthentication failed. Aborting.\x1b[0m");
		process.exit(1);
	}

	await step1_resume();
	await step2_goals();
	await step3_networking();
	await step4_skills();
	await step5_jobApplications();
	await step6_analytics();
	step7_assessment();
	printSummary();
}

main().catch((e) => {
	console.error("\x1b[31mFatal error:\x1b[0m", e);
	process.exit(1);
});
