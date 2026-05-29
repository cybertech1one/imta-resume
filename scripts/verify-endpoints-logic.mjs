/**
 * Verifies the DB logic behind the new endpoints against PROD:
 *  - getQuestionsByProgram: program-scoped fetch + field fallback
 *  - getPreparationPlan: program question counts per type
 * Run: source resume-maker-sdlc/.deploy-vars && node scripts/verify-endpoints-logic.mjs
 */
import pg from "pg";
const { Client } = pg;
const c = new Client({ connectionString: process.env.PG_PUBLIC_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

function normType(t) {
	if (t === "competency") return "behavioral";
	if (t === "motivation") return "motivational";
	if (["behavioral", "technical", "situational", "motivational"].includes(t)) return t;
	return "general";
}

async function getByProgram(program, field) {
	// 1. program scope
	if (program) {
		const r = await c.query(
			"SELECT id, type, difficulty FROM interview_common_question WHERE program=$1 AND is_active=true ORDER BY sort_order",
			[program],
		);
		if (r.rows.length > 0) return { scope: "program", n: r.rows.length, types: tally(r.rows) };
	}
	// 2. field fallback
	if (field) {
		const r = await c.query(
			"SELECT id, type, difficulty FROM interview_common_question WHERE field=$1 AND is_active=true ORDER BY sort_order",
			[field],
		);
		if (r.rows.length > 0) return { scope: "field", n: r.rows.length, types: tally(r.rows) };
	}
	return { scope: "none", n: 0, types: {} };
}
function tally(rows) {
	const t = {};
	for (const row of rows) {
		const k = normType(row.type);
		t[k] = (t[k] || 0) + 1;
	}
	return t;
}

console.log("--- getQuestionsByProgram(soudure, industrial) ---");
console.log(await getByProgram("soudure", "industrial"));

console.log("--- getQuestionsByProgram(infirmier_polyvalent, healthcare) [student1 program] ---");
console.log(await getByProgram("infirmier_polyvalent", "healthcare"));

console.log("--- getQuestionsByProgram(unseeded_program, hse) -> should fall back to field ---");
console.log(await getByProgram("data_science_ia", "hse"));

console.log("--- getQuestionsByProgram(null, healthcare) -> field only ---");
console.log(await getByProgram(null, "healthcare"));

// student1 account: check imtaProgram on the user row
const u = await c.query("SELECT email, imta_program FROM \"user\" WHERE email='student1@test.com'");
console.log("--- student1 user row ---");
console.log(u.rows[0]);

await c.end();
