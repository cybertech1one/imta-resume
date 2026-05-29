import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { Client } from "pg";
import { v7 as uuidv7 } from "uuid";

const PG = process.env.PG;
if (!PG) {
	console.error("PG env var required");
	process.exit(1);
}

const SALT_ROUNDS = 10; // matches src/utils/password.ts

function strongPassword(len = 20) {
	// Avoid ambiguous chars; guarantee upper/lower/digit/symbol
	const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
	const lower = "abcdefghijkmnpqrstuvwxyz";
	const digit = "23456789";
	const sym = "!@#$%&*?+-=";
	const all = upper + lower + digit + sym;
	const pick = (set) => set[crypto.randomInt(set.length)];
	let pw = pick(upper) + pick(lower) + pick(digit) + pick(sym);
	while (pw.length < len) pw += pick(all);
	// shuffle
	return pw
		.split("")
		.sort(() => crypto.randomInt(3) - 1)
		.join("");
}

function toUsername(value) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9._-]/g, "")
		.slice(0, 64);
}

const c = new Client({ connectionString: PG, ssl: { rejectUnauthorized: false } });
await c.connect();

const results = [];

// 1. Clean up probe users created during diagnosis
const probeEmails = ["probetest_clean_001@gmail.com", "probe_full_a1@gmail.com", "probe_user_b1@gmail.com"];
const del = await c.query(`DELETE FROM "user" WHERE email = ANY($1::text[])`, [probeEmails]);
console.log(`Cleaned up ${del.rowCount} probe user(s)`);

async function findUser(email) {
	const r = await c.query(`SELECT id, role, username FROM "user" WHERE lower(email)=lower($1) LIMIT 1`, [email]);
	return r.rows[0] || null;
}

async function setPassword(userId, password) {
	const hash = await bcrypt.hash(password, SALT_ROUNDS);
	// Update existing credential account, or insert one.
	const upd = await c.query(
		`UPDATE account SET password=$1, updated_at=now() WHERE user_id=$2 AND provider_id='credential'`,
		[hash, userId],
	);
	if (upd.rowCount === 0) {
		await c.query(
			`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
			 VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
			[uuidv7(), userId, userId, hash],
		);
	}
}

async function ensureUser({ email, name, username, role, imtaProgram, onboardingCompleted, emailVerified }) {
	let u = await findUser(email);
	if (!u) {
		const id = uuidv7();
		let uname = toUsername(username || email.split("@")[0]);
		// ensure unique username
		for (let i = 0; i < 50; i++) {
			const ex = await c.query(`SELECT 1 FROM "user" WHERE username=$1 OR display_username=$1 LIMIT 1`, [uname]);
			if (ex.rowCount === 0) break;
			uname = toUsername(`${toUsername(username || email.split("@")[0])}.${crypto.randomInt(1000, 9999)}`);
		}
		await c.query(
			`INSERT INTO "user" (id, name, email, email_verified, username, display_username, role, imta_program, onboarding_completed, preferred_ai_language, created_at, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$8,'fr',now(),now())`,
			[id, name, email.toLowerCase(), emailVerified, uname, role, imtaProgram, onboardingCompleted],
		);
		u = { id, role, username: uname };
		console.log(`Created user ${email} (${role})`);
	} else {
		// enforce role / program where specified
		await c.query(
			`UPDATE "user" SET role=$1, imta_program=COALESCE($2, imta_program), email_verified=true, updated_at=now() WHERE id=$3`,
			[role, imtaProgram ?? null, u.id],
		);
		console.log(`Updated user ${email} -> role=${role}`);
	}
	return u;
}

const accounts = [
	{
		email: "etudiant@imta.ma",
		name: "Étudiant IMTA",
		username: "etudiant",
		role: "user",
		imtaProgram: "infirmier_polyvalent",
		onboardingCompleted: true,
		emailVerified: true,
	},
	{ email: "seoranker2019@gmail.com", name: "Owner Admin", role: "admin", imtaProgram: null, onboardingCompleted: true, emailVerified: true },
	{ email: "admin@test.com", name: "Admin Test", role: "admin", imtaProgram: null, onboardingCompleted: false, emailVerified: true },
	{ email: "student1@test.com", name: "Student One", role: "user", imtaProgram: "infirmier_polyvalent", onboardingCompleted: true, emailVerified: true },
	{ email: "student2@test.com", name: "Student Two", role: "user", imtaProgram: "cariste", onboardingCompleted: true, emailVerified: true },
	{ email: "partner@test.com", name: "Partner Test", role: "partner", imtaProgram: null, onboardingCompleted: false, emailVerified: true },
];

for (const acc of accounts) {
	const u = await ensureUser(acc);
	const pw = strongPassword(20);
	await setPassword(u.id, pw);
	results.push({ email: acc.email, role: acc.role, password: pw });
}

console.log("\n===== CREDENTIALS (store securely) =====");
for (const r of results) {
	console.log(`${r.email}\t${r.role}\t${r.password}`);
}

await c.end();
