/**
 * ADDITIVE insert of newly-generated IMTA resume library rows into prod, for the
 * UNCOVERED programs only. Reuses the demo-user-ensure + slugify + insert logic
 * from insert-imta-resume-library.cjs, but scopes all cleanup to the program ids
 * present in the artifact so the existing 297 gallery rows + 297 demo resumes
 * (already-covered programs) are NEVER touched.
 *
 * Idempotent: deletes only gallery rows whose sub_field is in this artifact's
 * program set, and only demo `resume` rows whose slug starts with one of those
 * program ids, then re-inserts. Unique gallery names + slugs are guaranteed
 * against BOTH the new batch and all pre-existing rows.
 *
 * Run:  PG=... node scripts/insert-imta-resume-library-additive.cjs <artifact.json> [--commit]
 */
const fs = require("node:fs");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const { v7: uuidv7 } = require("uuid");
const { Client } = require("pg");

const ARTIFACT = process.argv[2];
const COMMIT = process.argv.includes("--commit");
if (!ARTIFACT) {
	console.error("usage: node insert-imta-resume-library-additive.cjs <artifact.json> [--commit]");
	process.exit(1);
}
if (!process.env.PG) {
	console.error("PG env required");
	process.exit(1);
}

const DEMO_EMAIL = "exemples@imta.ma";
const DEMO_USERNAME = "exemples";

const records = JSON.parse(fs.readFileSync(ARTIFACT, "utf8"));
const programIds = [...new Set(records.map((r) => r.programId))];

function slugify(s) {
	return String(s)
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "") // strip combining diacritics
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);
}
function rand(min, max) {
	return min + Math.floor(Math.random() * (max - min + 1));
}

(async () => {
	const c = new Client({ connectionString: process.env.PG });
	await c.connect();
	await c.query("BEGIN");
	try {
		// 1. Ensure demo user
		const { rows: u } = await c.query(`SELECT id FROM "user" WHERE lower(email)=lower($1)`, [DEMO_EMAIL]);
		let demoId;
		if (u[0]) {
			demoId = u[0].id;
			console.log("demo user exists:", demoId);
		} else {
			demoId = uuidv7();
			await c.query(
				`INSERT INTO "user" (id, name, email, email_verified, username, display_username, role, onboarding_completed, preferred_ai_language, created_at, updated_at)
				 VALUES ($1,$2,$3,true,$4,$4,'user',true,'fr',now(),now())`,
				[demoId, "Exemples IMTA", DEMO_EMAIL, DEMO_USERNAME],
			);
			const hash = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);
			await c.query(
				`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
				 VALUES ($1,$2,'credential',$3,$4,now(),now())`,
				[uuidv7(), demoId, demoId, hash],
			);
			console.log("created demo user:", demoId);
		}

		// 2. Scoped idempotent cleanup — ONLY this artifact's programs.
		const delG = await c.query(`DELETE FROM resume_gallery WHERE sub_field = ANY($1)`, [programIds]);
		// demo resume slugs are `${programId}-...`; delete only those for our programs.
		const slugPatterns = programIds.map((p) => `${p}-%`);
		const delR = await c.query(
			`DELETE FROM resume WHERE user_id = $1 AND (${slugPatterns.map((_, i) => `slug LIKE $${i + 2}`).join(" OR ")})`,
			[demoId, ...slugPatterns],
		);
		console.log(
			`cleared prior (scoped to ${programIds.length} programs): ${delG.rowCount} gallery rows, ${delR.rowCount} demo resumes`,
		);

		// 3. Seed uniqueness sets from EXISTING rows (so we never collide with the 297).
		const usedNames = new Set();
		const usedSlugs = new Set();
		const { rows: exN } = await c.query(`SELECT name FROM resume_gallery`);
		for (const r of exN) usedNames.add(r.name);
		const { rows: exS } = await c.query(`SELECT slug FROM resume WHERE user_id=$1`, [demoId]);
		for (const r of exS) usedSlugs.add(r.slug);
		console.log(`pre-existing: ${usedNames.size} gallery names, ${usedSlugs.size} demo slugs (will avoid collisions)`);

		// 4. Insert
		let g = 0;
		let r = 0;
		for (const rec of records) {
			const person = rec.resumeData?.basics?.name || rec.nameFr;
			const city = (rec.resumeData?.basics?.location || "").split(",")[0].trim();
			let galleryName = person;
			if (usedNames.has(galleryName) && city) galleryName = `${person} (${city})`;
			let gn = galleryName;
			let gi = 2;
			while (usedNames.has(gn)) {
				gn = `${galleryName} ${gi++}`;
			}
			usedNames.add(gn);
			await c.query(
				`INSERT INTO resume_gallery
				 (id, name, name_fr, field, sub_field, experience_years, template_name, language, description, description_fr, resume_data, tags, ats_score, is_featured, view_count, use_count, is_active, created_at, updated_at)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true,now(),now())`,
				[
					uuidv7(),
					gn,
					gn,
					rec.field,
					rec.programId,
					rec.experienceYears,
					rec.templateName,
					rec.language || "fr",
					rec.descriptionFr,
					rec.descriptionFr,
					JSON.stringify(rec.resumeData),
					rec.tags || [],
					rec.atsScore || 85,
					!!rec.isFeatured,
					rand(8, 240),
					rand(0, 30),
				],
			);
			g++;
			const slug = slugify(`${rec.programId}-${person}`);
			let s = slug;
			let n = 1;
			while (usedSlugs.has(s)) {
				s = `${slug}-${n++}`;
			}
			usedSlugs.add(s);
			await c.query(
				`INSERT INTO resume (id, name, slug, tags, is_public, is_locked, data, user_id, created_at, updated_at)
				 VALUES ($1,$2,$3,$4,true,false,$5,$6,now(),now())`,
				[
					uuidv7(),
					`${person} — ${rec.descriptionFr}`.slice(0, 120),
					s,
					rec.tags || [],
					JSON.stringify(rec.resumeData),
					demoId,
				],
			);
			r++;
		}

		const byProg = {};
		for (const rec of records) byProg[rec.programId] = (byProg[rec.programId] || 0) + 1;
		console.log(`\ninserted ${g} gallery rows + ${r} public resumes under ${DEMO_USERNAME}`);
		console.log("by program:", JSON.stringify(byProg));
		const totalG = await c.query(`SELECT count(*)::int n FROM resume_gallery`);
		const totalR = await c.query(`SELECT count(*)::int n FROM resume WHERE user_id=$1`, [demoId]);
		console.log(`post-insert totals: resume_gallery=${totalG.rows[0].n}, demo resumes=${totalR.rows[0].n}`);

		if (COMMIT) {
			await c.query("COMMIT");
			console.log("\nCOMMITTED.");
		} else {
			await c.query("ROLLBACK");
			console.log("\nDRY-RUN (rolled back). Add --commit to persist.");
		}
	} catch (e) {
		await c.query("ROLLBACK");
		console.error("\nROLLED BACK:", e.message);
		process.exitCode = 1;
	} finally {
		await c.end();
	}
})();
