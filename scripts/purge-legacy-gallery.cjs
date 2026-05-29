/**
 * Purge the legacy non-IMTA resume_gallery rows, keeping ONLY the vocational set
 * (sub_field in the 11 IMTA program ids). Backs up the full table to JSON first.
 *
 * Run:  PG=... node scripts/purge-legacy-gallery.cjs [--commit]
 */
const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

const COMMIT = process.argv.includes("--commit");
const PROGRAM_IDS = [
	"infirmier_polyvalent", "sage_femme", "aide_soignant", "infirmier_auxiliaire",
	"soudure", "cariste", "conducteur_engins", "mecanique_engins", "tourneur_industriel", "electromecanique",
	"hse_specialist",
];

(async () => {
	const c = new Client({ connectionString: process.env.PG });
	await c.connect();
	await c.query("BEGIN");
	try {
		const before = await c.query(`SELECT count(*)::int AS n FROM resume_gallery`);
		const keep = await c.query(`SELECT count(*)::int AS n FROM resume_gallery WHERE sub_field = ANY($1)`, [PROGRAM_IDS]);
		console.log(`gallery rows: ${before.rows[0].n} total, ${keep.rows[0].n} vocational (keep), ${before.rows[0].n - keep.rows[0].n} legacy (purge)`);

		// Backup the FULL table to JSON before deleting.
		const all = await c.query(`SELECT * FROM resume_gallery`);
		const backupDir = path.resolve("resume-maker-sdlc/backups");
		fs.mkdirSync(backupDir, { recursive: true });
		const backupPath = path.join(backupDir, `gallery-full-backup-${all.rowCount}rows.json`);
		fs.writeFileSync(backupPath, JSON.stringify(all.rows, null, 2));
		console.log(`backed up ${all.rowCount} rows -> ${backupPath}`);

		const del = await c.query(`DELETE FROM resume_gallery WHERE sub_field IS NULL OR NOT (sub_field = ANY($1))`, [PROGRAM_IDS]);
		console.log(`deleted ${del.rowCount} legacy rows`);

		const after = await c.query(`SELECT sub_field, count(*)::int AS n FROM resume_gallery GROUP BY sub_field ORDER BY n DESC`);
		console.log("remaining by sub_field:");
		after.rows.forEach((r) => console.log("  ", String(r.n).padStart(3), r.sub_field));
		const total = after.rows.reduce((a, r) => a + r.n, 0);
		console.log(`remaining total: ${total}`);

		if (COMMIT) { await c.query("COMMIT"); console.log("\n✅ COMMITTED."); }
		else { await c.query("ROLLBACK"); console.log("\n🟡 DRY-RUN (rolled back). Add --commit to persist. (backup file was still written)"); }
	} catch (e) {
		await c.query("ROLLBACK");
		console.error("\n❌ ROLLED BACK:", e.message);
		process.exitCode = 1;
	} finally {
		await c.end();
	}
})();
