/**
 * Normalize the `field` values in reference tables to the 5 canonical IMTA fields
 * (healthcare, industrial, hse, management, technology) + 'general', so content that
 * was filed under legacy/duplicate labels (genie-civil, génie-civil, finance, medecine…)
 * becomes reachable when the app filters by a student's program field.
 *
 * Backs up affected (id, table, old_field) to JSON first. Dry-run unless --commit.
 * Run: PG=... node scripts/normalize-reference-fields.cjs [--commit]
 */
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");
const COMMIT = process.argv.includes("--commit");

// legacy label (lowercased) -> canonical field
const MAP = {
	// healthcare
	medecine: "healthcare", "médecine": "healthcare", pharmacie: "healthcare", soins: "healthcare", sante: "healthcare", "santé": "healthcare",
	// technology
	"genie-informatique": "technology", "génie-informatique": "technology", it: "technology", informatique: "technology", tech: "technology",
	// industrial (engineering trades + construction)
	"genie-civil": "industrial", "génie-civil": "industrial", "genie-electrique": "industrial", "génie-électrique": "industrial",
	"genie-industriel": "industrial", "génie-industriel": "industrial", "genie-mecanique": "industrial", "génie-mécanique": "industrial",
	engineering: "industrial", architecture: "industrial", "génie": "industrial", genie: "industrial", btp: "industrial",
	// management (business / commerce / logistics / HR / law)
	finance: "management", marketing: "management", commerce: "management", "commerce-international": "management",
	"ressources-humaines": "management", logistique: "management", droit: "management", communication: "management",
	journalisme: "management", tourisme: "management", design: "management", management: "management",
	// keep canonical + general
	healthcare: "healthcare", industrial: "industrial", hse: "hse", technology: "technology",
	general: "general", "général": "general",
};

const TABLES = ["skill_library", "interview_tip", "interview_common_question"];

(async () => {
	const c = new Client({ connectionString: process.env.PG });
	await c.connect();
	await c.query("BEGIN");
	try {
		const backup = {};
		const summary = {};
		for (const t of TABLES) {
			const rows = (await c.query(`SELECT id, field FROM ${t} WHERE field IS NOT NULL`)).rows;
			backup[t] = [];
			summary[t] = { updated: 0, unmapped: new Set() };
			for (const r of rows) {
				const key = String(r.field).trim().toLowerCase();
				const canonical = MAP[key];
				if (!canonical) { summary[t].unmapped.add(r.field); continue; }
				if (canonical === r.field) continue; // already canonical
				backup[t].push({ id: r.id, old: r.field, new: canonical });
				await c.query(`UPDATE ${t} SET field = $1 WHERE id = $2`, [canonical, r.id]);
				summary[t].updated++;
			}
		}
		// write backup
		const dir = path.resolve("resume-maker-sdlc/backups");
		fs.mkdirSync(dir, { recursive: true });
		fs.writeFileSync(path.join(dir, "reference-fields-pre-normalize.json"), JSON.stringify(backup, null, 2));

		for (const t of TABLES) {
			const after = (await c.query(`SELECT field, count(*)::int n FROM ${t} GROUP BY field ORDER BY field`)).rows;
			console.log(`\n${t}: updated ${summary[t].updated} rows`);
			console.log("  after:", after.map((r) => `${r.field}:${r.n}`).join("  "));
			if (summary[t].unmapped.size) console.log("  UNMAPPED (left as-is):", [...summary[t].unmapped].join(", "));
		}

		if (COMMIT) { await c.query("COMMIT"); console.log("\n✅ COMMITTED."); }
		else { await c.query("ROLLBACK"); console.log("\n🟡 DRY-RUN (rolled back). Add --commit. (backup written)"); }
	} catch (e) {
		await c.query("ROLLBACK");
		console.error("❌ ROLLED BACK:", e.message);
		process.exitCode = 1;
	} finally {
		await c.end();
	}
})();
