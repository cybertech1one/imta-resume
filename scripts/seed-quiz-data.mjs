/**
 * Seed Career Quiz Data via ORPC API
 * Seeds: career_quiz_question, career_quiz_option
 *
 * Usage: node scripts/seed-quiz-data.mjs
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3040";

const QUESTIONS = [
	{ id: "ca-q1", quizType: "career_assessment", question: "How do you react in an emergency situation?", questionFr: "Comment reagissez-vous face a une situation d'urgence?", description: "Imagine a stressful work situation requiring immediate action.", descriptionFr: "Imaginez une situation stressante au travail necessitant une action immediate.", category: "personality", type: "multiple_choice", trait: "stress_tolerance", sortOrder: 1 },
	{ id: "ca-q2", quizType: "career_assessment", question: "Which trait describes you best?", questionFr: "Quel trait vous decrit le mieux?", category: "personality", type: "multiple_choice", trait: "communication", sortOrder: 2 },
	{ id: "ca-q3", quizType: "career_assessment", question: "How comfortable are you with physical work?", questionFr: "A quel point etes-vous a l'aise avec le travail physique?", category: "personality", type: "scale", trait: "physical_endurance", scaleMin: "I prefer desk work", scaleMax: "I love physical activities", scaleMinFr: "Je prefere le travail de bureau", scaleMaxFr: "J'adore les activites physiques", sortOrder: 3 },
	{ id: "ca-q4", quizType: "career_assessment", question: "Which field are you most passionate about?", questionFr: "Quel domaine vous passionne le plus?", category: "interests", type: "multiple_choice", trait: "patient_care", sortOrder: 4 },
	{ id: "ca-q5", quizType: "career_assessment", question: "What type of professional activity attracts you?", questionFr: "Quel type d'activite professionnelle vous attire?", category: "interests", type: "multiple_choice", trait: "technical_aptitude", sortOrder: 5 },
	{ id: "ca-q6", quizType: "career_assessment", question: "How important is job stability to you?", questionFr: "Quelle importance accordez-vous a la stabilite de l'emploi?", category: "values", type: "scale", trait: "safety_focus", scaleMin: "I prefer adventure and change", scaleMax: "Stability is essential", scaleMinFr: "Je prefere l'aventure et le changement", scaleMaxFr: "La stabilite est essentielle", sortOrder: 6 },
	{ id: "ca-q7", quizType: "career_assessment", question: "How do you feel about working night shifts?", questionFr: "Que pensez-vous du travail de nuit?", category: "work_preferences", type: "multiple_choice", trait: "patient_care", sortOrder: 7 },
	{ id: "cq-q1", quizType: "career_quiz", question: "What work environment do you prefer?", questionFr: "Quel environnement de travail preferez-vous?", category: "environment", type: "multiple_choice", trait: "technical_aptitude", sortOrder: 1 },
	{ id: "cq-q2", quizType: "career_quiz", question: "Do you prefer working alone or in a team?", questionFr: "Preferez-vous travailler seul ou en equipe?", category: "work_style", type: "multiple_choice", trait: "teamwork", sortOrder: 2 },
	{ id: "cq-q3", quizType: "career_quiz", question: "What motivates you most at work?", questionFr: "Qu'est-ce qui vous motive le plus au travail?", category: "values", type: "multiple_choice", trait: "leadership", sortOrder: 3 },
	{ id: "rr-q1", quizType: "remote_readiness", question: "How do you usually communicate with remote colleagues?", questionFr: "Comment communiquez-vous habituellement avec vos collegues a distance?", category: "communication", type: "multiple_choice", trait: "communication", sortOrder: 1 },
	{ id: "rr-q2", quizType: "remote_readiness", question: "How often do you participate in virtual meetings?", questionFr: "A quelle frequence participez-vous a des reunions virtuelles?", category: "communication", type: "multiple_choice", trait: "communication", sortOrder: 2 },
	{ id: "rr-q3", quizType: "remote_readiness", question: "How do you organize your work day at home?", questionFr: "Comment organisez-vous votre journee de travail a domicile?", category: "time_management", type: "multiple_choice", trait: "self_discipline", sortOrder: 3 },
];

const OPTIONS = [
	// ca-q1: emergency reaction
	{ id: "ca-q1-a", questionId: "ca-q1", text: "I stay calm and act methodically", textFr: "Je reste calme et j'agis methodiquement", icon: "SparkleIcon", scores: { stress_tolerance: 3, patient_care: 2, leadership: 2, safety_focus: 2 }, sortOrder: 1 },
	{ id: "ca-q1-b", questionId: "ca-q1", text: "I immediately take control of the situation", textFr: "Je prends immediatement le controle de la situation", icon: "RocketLaunchIcon", scores: { leadership: 3, stress_tolerance: 2, safety_focus: 1, technical_aptitude: 1 }, sortOrder: 2 },
	{ id: "ca-q1-c", questionId: "ca-q1", text: "I first seek help from colleagues", textFr: "Je cherche d'abord de l'aide aupres de mes collegues", icon: "UsersIcon", scores: { teamwork: 3, communication: 2, stress_tolerance: 1, patient_care: 1 }, sortOrder: 3 },
	{ id: "ca-q1-d", questionId: "ca-q1", text: "I quickly analyze the situation before acting", textFr: "J'analyse rapidement la situation avant d'agir", icon: "LightbulbIcon", scores: { analytical: 3, safety_focus: 2, technical_aptitude: 2, attention_to_detail: 1 }, sortOrder: 4 },
	// ca-q2: personality trait
	{ id: "ca-q2-a", questionId: "ca-q2", text: "Empathetic and a good listener", textFr: "Empathique et a l'ecoute des autres", icon: "HeartIcon", scores: { patient_care: 3, communication: 3, teamwork: 2 }, sortOrder: 1 },
	{ id: "ca-q2-b", questionId: "ca-q2", text: "Rigorous and detail-oriented", textFr: "Rigoureux et attentif aux details", icon: "TargetIcon", scores: { attention_to_detail: 3, safety_focus: 2, technical_aptitude: 2, analytical: 1 }, sortOrder: 2 },
	{ id: "ca-q2-c", questionId: "ca-q2", text: "Practical and action-oriented", textFr: "Pratique et oriente vers l'action", icon: "WrenchIcon", scores: { technical_aptitude: 3, physical_endurance: 2, stress_tolerance: 1, leadership: 1 }, sortOrder: 3 },
	{ id: "ca-q2-d", questionId: "ca-q2", text: "Natural leader and organizer", textFr: "Leader naturel et organisateur", icon: "MedalIcon", scores: { leadership: 3, communication: 2, teamwork: 2, stress_tolerance: 1 }, sortOrder: 4 },
	// ca-q4: passion field
	{ id: "ca-q4-a", questionId: "ca-q4", text: "Health and well-being of people", textFr: "La sante et le bien-etre des personnes", icon: "FirstAidKitIcon", scores: { patient_care: 3, communication: 2, teamwork: 2, stress_tolerance: 1 }, sortOrder: 1 },
	{ id: "ca-q4-b", questionId: "ca-q4", text: "Mechanics and industrial technologies", textFr: "La mecanique et les technologies industrielles", icon: "GearIcon", scores: { technical_aptitude: 3, analytical: 2, physical_endurance: 1, attention_to_detail: 1 }, sortOrder: 2 },
	{ id: "ca-q4-c", questionId: "ca-q4", text: "Safety and risk prevention", textFr: "La securite et la prevention des risques", icon: "ShieldCheckIcon", scores: { safety_focus: 3, leadership: 2, attention_to_detail: 2, communication: 1 }, sortOrder: 3 },
	{ id: "ca-q4-d", questionId: "ca-q4", text: "Construction and civil works", textFr: "La construction et le BTP", icon: "BuildingsIcon", scores: { physical_endurance: 3, technical_aptitude: 2, safety_focus: 2, teamwork: 1 }, sortOrder: 4 },
	// ca-q5: professional activity
	{ id: "ca-q5-a", questionId: "ca-q5", text: "Caring for people and providing medical support", textFr: "Prendre soin des personnes et fournir un support medical", icon: "HeartIcon", scores: { patient_care: 3, communication: 2, stress_tolerance: 1 }, sortOrder: 1 },
	{ id: "ca-q5-b", questionId: "ca-q5", text: "Operating and maintaining machines", textFr: "Utiliser et maintenir des machines", icon: "GearIcon", scores: { technical_aptitude: 3, physical_endurance: 2, attention_to_detail: 1 }, sortOrder: 2 },
	{ id: "ca-q5-c", questionId: "ca-q5", text: "Ensuring compliance and safety rules", textFr: "Assurer le respect des regles de securite", icon: "ShieldCheckIcon", scores: { safety_focus: 3, leadership: 2, analytical: 1 }, sortOrder: 3 },
	{ id: "ca-q5-d", questionId: "ca-q5", text: "Leading teams and managing projects", textFr: "Diriger des equipes et gerer des projets", icon: "UsersIcon", scores: { leadership: 3, communication: 2, teamwork: 2 }, sortOrder: 4 },
	// ca-q7: night shifts
	{ id: "ca-q7-a", questionId: "ca-q7", text: "I am very comfortable with night shifts", textFr: "Je suis tres a l'aise avec le travail de nuit", icon: "MoonIcon", scores: { patient_care: 3, stress_tolerance: 2 }, sortOrder: 1 },
	{ id: "ca-q7-b", questionId: "ca-q7", text: "I can adapt if needed", textFr: "Je peux m'adapter si necessaire", icon: "ArrowsClockwiseIcon", scores: { patient_care: 1, stress_tolerance: 1, technical_aptitude: 1 }, sortOrder: 2 },
	{ id: "ca-q7-c", questionId: "ca-q7", text: "I prefer regular daytime hours", textFr: "Je prefere des horaires reguliers de jour", icon: "SunIcon", scores: { safety_focus: 1, technical_aptitude: 2 }, sortOrder: 3 },
	// cq-q1: work environment
	{ id: "cq-q1-a", questionId: "cq-q1", text: "Indoor, in a hospital or clinic", textFr: "En interieur, dans un hopital ou clinique", icon: "BuildingsIcon", scores: { patient_care: 3, teamwork: 2, safety_focus: 1 }, sortOrder: 1 },
	{ id: "cq-q1-b", questionId: "cq-q1", text: "On site, construction or industrial sites", textFr: "Sur le terrain, chantiers ou sites industriels", icon: "HardHatIcon", scores: { technical_aptitude: 3, safety_focus: 2, leadership: 1 }, sortOrder: 2 },
	{ id: "cq-q1-c", questionId: "cq-q1", text: "Office environment", textFr: "Environnement de bureau", icon: "DesktopIcon", scores: { analytical: 2, communication: 2, leadership: 1 }, sortOrder: 3 },
	// cq-q2: team work preference
	{ id: "cq-q2-a", questionId: "cq-q2", text: "I prefer working in a team", textFr: "Je prefere travailler en equipe", icon: "UsersIcon", scores: { teamwork: 3, communication: 2, patient_care: 1 }, sortOrder: 1 },
	{ id: "cq-q2-b", questionId: "cq-q2", text: "I prefer working alone", textFr: "Je prefere travailler seul", icon: "UserIcon", scores: { analytical: 2, attention_to_detail: 2, technical_aptitude: 1 }, sortOrder: 2 },
	{ id: "cq-q2-c", questionId: "cq-q2", text: "It depends on the task", textFr: "Cela depend de la tache", icon: "ArrowsClockwiseIcon", scores: { teamwork: 1, analytical: 1, leadership: 1, communication: 1 }, sortOrder: 3 },
	// cq-q3: motivation
	{ id: "cq-q3-a", questionId: "cq-q3", text: "Helping others and making a difference", textFr: "Aider les autres et faire une difference", icon: "HeartIcon", scores: { patient_care: 3, communication: 2 }, sortOrder: 1 },
	{ id: "cq-q3-b", questionId: "cq-q3", text: "Solving technical challenges", textFr: "Resoudre des defis techniques", icon: "GearIcon", scores: { technical_aptitude: 3, analytical: 2 }, sortOrder: 2 },
	{ id: "cq-q3-c", questionId: "cq-q3", text: "Protecting people and the environment", textFr: "Proteger les personnes et l'environnement", icon: "ShieldCheckIcon", scores: { safety_focus: 3, leadership: 2 }, sortOrder: 3 },
	// rr-q1: remote communication
	{ id: "rr-q1-a", questionId: "rr-q1", text: "I prefer phone calls only", textFr: "Je prefere les appels telephoniques uniquement", icon: "PhoneIcon", scores: { communication: 1 }, sortOrder: 1 },
	{ id: "rr-q1-b", questionId: "rr-q1", text: "I mainly use emails", textFr: "J'utilise principalement les emails", icon: "EnvelopeIcon", scores: { communication: 2 }, sortOrder: 2 },
	{ id: "rr-q1-c", questionId: "rr-q1", text: "I use a combination of tools (email, chat, video)", textFr: "J'utilise une combinaison d'outils (email, chat, video)", icon: "ChatCircleIcon", scores: { communication: 3 }, sortOrder: 3 },
	{ id: "rr-q1-d", questionId: "rr-q1", text: "I adapt my communication based on context and urgency", textFr: "J'adapte mon mode de communication selon le contexte et l'urgence", icon: "LightningIcon", scores: { communication: 4 }, sortOrder: 4 },
	// rr-q2: virtual meetings
	{ id: "rr-q2-a", questionId: "rr-q2", text: "Never or rarely", textFr: "Jamais ou rarement", icon: "XCircleIcon", scores: { communication: 1 }, sortOrder: 1 },
	{ id: "rr-q2-b", questionId: "rr-q2", text: "A few times a month", textFr: "Quelques fois par mois", icon: "CalendarIcon", scores: { communication: 2 }, sortOrder: 2 },
	{ id: "rr-q2-c", questionId: "rr-q2", text: "Several times a week", textFr: "Plusieurs fois par semaine", icon: "VideoCameraIcon", scores: { communication: 3 }, sortOrder: 3 },
	{ id: "rr-q2-d", questionId: "rr-q2", text: "Daily", textFr: "Quotidiennement", icon: "CheckCircleIcon", scores: { communication: 4 }, sortOrder: 4 },
	// rr-q3: organizing remote work
	{ id: "rr-q3-a", questionId: "rr-q3", text: "I have difficulty organizing myself", textFr: "J'ai des difficultes a m'organiser", icon: "WarningIcon", scores: { self_discipline: 1 }, sortOrder: 1 },
	{ id: "rr-q3-b", questionId: "rr-q3", text: "I follow a basic routine", textFr: "Je suis une routine basique", icon: "ClockIcon", scores: { self_discipline: 2 }, sortOrder: 2 },
	{ id: "rr-q3-c", questionId: "rr-q3", text: "I use productivity tools and time blocks", textFr: "J'utilise des outils de productivite et des blocs de temps", icon: "ListChecksIcon", scores: { self_discipline: 3 }, sortOrder: 3 },
	{ id: "rr-q3-d", questionId: "rr-q3", text: "I have an optimized system with clear boundaries", textFr: "J'ai un systeme optimise avec des limites claires", icon: "RocketLaunchIcon", scores: { self_discipline: 4 }, sortOrder: 4 },
];

let sessionCookie = "";

async function login() {
	const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Origin: BASE_URL },
		body: JSON.stringify({ email: "admin@test.com", password: "TestAccount123!" }),
	});
	const cookies = res.headers.getSetCookie?.() || [];
	sessionCookie = cookies.map((c) => c.split(";")[0]).join("; ");
	return res.ok;
}

async function rpc(path, input) {
	const res = await fetch(`${BASE_URL}/api/rpc/${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json", Origin: BASE_URL, Cookie: sessionCookie },
		body: JSON.stringify({ json: input }),
	});
	const text = await res.text();
	let json = null;
	try {
		const parsed = JSON.parse(text);
		json = parsed?.json !== undefined ? parsed.json : parsed;
	} catch {}
	return { status: res.status, ok: res.ok, json, text: text.slice(0, 200) };
}

async function main() {
	console.log("=== Career Quiz Data Seeder ===\n");

	console.log("1. Logging in as admin...");
	if (!(await login())) {
		console.error("   FAILED to login!");
		process.exit(1);
	}
	console.log("   OK\n");

	console.log(`2. Seeding ${QUESTIONS.length} questions...`);
	const qRes = await rpc("careerQuizSeed/questions", QUESTIONS);
	console.log(`   ${qRes.ok ? "OK" : "FAILED"} (${qRes.status})`);
	if (!qRes.ok) console.log(`   ${qRes.text}`);

	console.log(`\n3. Seeding ${OPTIONS.length} options...`);
	const oRes = await rpc("careerQuizSeed/options", OPTIONS);
	console.log(`   ${oRes.ok ? "OK" : "FAILED"} (${oRes.status})`);
	if (!oRes.ok) console.log(`   ${oRes.text}`);

	console.log("\n4. Verifying seeded data...");
	for (const quizType of ["career_assessment", "career_quiz", "remote_readiness"]) {
		const res = await rpc("careerQuizQuestions/listWithOptions", { quizType });
		const count = Array.isArray(res.json) ? res.json.length : "?";
		console.log(`   ${quizType}: ${count} questions`);
	}

	console.log("\n=== DONE ===");
}

main().catch(console.error);
